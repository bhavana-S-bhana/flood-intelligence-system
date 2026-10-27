import json
import networkx as nx
from typing import Dict, List, Tuple, Any
from app.config import GRID_DATA_FILE, CRITICAL_FLOOD_DEPTH_ROAD_BLOCK_M

class GeospatialRoutingEngine:
    def __init__(self, config_path=GRID_DATA_FILE):
        with open(config_path, "r") as f:
            self.raw_data = json.load(f)
        
        self.depots = {d["id"]: d for d in self.raw_data["depots"]}
        self.zones = {z["id"]: z for z in self.raw_data["zones"]}
        self.roads = self.raw_data["roads"]
        
        self.graph = nx.Graph()
        self._build_initial_graph()

    def _build_initial_graph(self):
        """Constructs base road graph with distance and free-flow speeds."""
        # Add Depot Nodes
        for d_id, d in self.depots.items():
            self.graph.add_node(d_id, type="depot", lat=d["lat"], lon=d["lon"], name=d["name"])
            
        # Add Zone Nodes
        for z_id, z in self.zones.items():
            self.graph.add_node(z_id, type="zone", lat=z["lat"], lon=z["lon"], name=z["name"])

        # Add Edges
        for r in self.roads:
            u, v = r["from"], r["to"]
            dist_km = r["distance_km"]
            speed_kph = r["speed_kph"]
            base_travel_time_min = (dist_km / speed_kph) * 60.0

            self.graph.add_edge(
                u, v,
                distance_km=dist_km,
                base_speed_kph=speed_kph,
                base_travel_time_min=base_travel_time_min,
                elev_min_m=r.get("elev_min_m", 205.0),
                current_flood_depth_m=0.0,
                travel_time_min=base_travel_time_min,
                is_impassable=False
            )

    def update_road_flooding(self, zone_risks: Dict[str, Any]):
        """
        Dynamically updates edge weights based on zone flood depths.
        """
        # Map flood depth by zone
        zone_depths = {z_id: z_info.get("road_flood_depth_m", 0.0) for z_id, z_info in zone_risks.items()}

        for u, v, data in self.graph.edges(data=True):
            # Take max flood depth between connected endpoints
            u_depth = zone_depths.get(u, 0.0)
            v_depth = zone_depths.get(v, 0.0)
            flood_depth = max(u_depth, v_depth)

            data["current_flood_depth_m"] = flood_depth
            base_time = data["base_travel_time_min"]

            if flood_depth >= CRITICAL_FLOOD_DEPTH_ROAD_BLOCK_M:
                # Road inundated / impassable for standard motor vehicles
                data["is_impassable"] = True
                data["travel_time_min"] = 99999.0  # Infinite cost
            elif flood_depth >= 0.15:
                # Reduced speed due to water depth
                speed_factor = max(0.2, 1.0 - (flood_depth / 0.60))
                data["is_impassable"] = False
                data["travel_time_min"] = base_time / speed_factor
            else:
                # Clear road
                data["is_impassable"] = False
                data["travel_time_min"] = base_time

    def get_shortest_route(self, origin_id: str, target_id: str, resource_type: str = "general") -> Dict[str, Any]:
        """
        Computes Dijkstra shortest path and travel time.
        For rescue_boats, allows navigating flooded roads.
        """
        # Create temporary graph view for boats vs standard vehicles
        if resource_type == "rescue_boats":
            # Boats can travel on flooded roads at amphibious speed (15 kph)
            H = self.graph.copy()
            for u, v, data in H.edges(data=True):
                if data["is_impassable"]:
                    dist_km = data["distance_km"]
                    H[u][v]["travel_time_min"] = (dist_km / 15.0) * 60.0
        else:
            H = self.graph

        try:
            path_nodes = nx.shortest_path(H, source=origin_id, target=target_id, weight="travel_time_min")
            travel_time_min = nx.shortest_path_length(H, source=origin_id, target=target_id, weight="travel_time_min")
            
            if travel_time_min >= 9999.0:
                return {"success": False, "reason": "No passable road route available"}

            # Build polyline lat/lon coordinates
            coords = []
            for n in path_nodes:
                n_data = self.graph.nodes[n]
                coords.append([n_data["lat"], n_data["lon"]])

            return {
                "success": True,
                "origin_id": origin_id,
                "target_id": target_id,
                "path_nodes": path_nodes,
                "travel_time_min": round(travel_time_min, 1),
                "polyline": coords
            }
        except nx.NetworkXNoPath:
            return {"success": False, "reason": "No path exists between nodes"}

    def compute_all_depot_zone_matrix(self, zone_risks: Dict[str, Any]) -> Dict[Tuple[str, str], Dict[str, Any]]:
        """Computes travel time matrix for all (Depot, Zone) pairs."""
        self.update_road_flooding(zone_risks)
        matrix = {}
        
        for d_id in self.depots.keys():
            for z_id in self.zones.keys():
                for r_type in ["rescue_boats", "medical_teams", "relief_kits", "water_pumps"]:
                    route = self.get_shortest_route(d_id, z_id, resource_type=r_type)
                    print(
    "ROUTE CHECK:",
    d_id,
    z_id,
    r_type,
    route.get("success"),
    route.get("reason", "")
)
                    matrix[(d_id, z_id, r_type)] = route
                    
        return matrix
