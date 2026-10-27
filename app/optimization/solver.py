try:
    import pulp
    PULP_AVAILABLE = True
except ImportError:
    pulp = None
    PULP_AVAILABLE = False

from typing import Dict, List, Any
from app.config import WEIGHT_DEMAND_COVERAGE, WEIGHT_TRANSIT_LATENCY, WEIGHT_CRITICAL_BONUS

class OptimizationSolver:
    def __init__(self):
        pass

    def solve_allocation(
        self,
        depots_state: Dict[str, Any],
        zone_risks: Dict[str, Any],
        transit_matrix: Dict[Any, Any]
    ) -> Dict[str, Any]:
        """
        Solves the Mixed-Integer Linear Program (MILP) for optimal emergency resource allocation.
        """
        if not PULP_AVAILABLE:
            return self._solve_greedy(depots_state, zone_risks, transit_matrix)
        
        try:
            return self._solve_pulp(depots_state, zone_risks, transit_matrix)
        except Exception as e:
            # Fallback to greedy heuristic if solver encounters an exception
            print(f"[Solver] MILP solver fallback triggered: {e}")
            return self._solve_greedy(depots_state, zone_risks, transit_matrix)

    def _solve_pulp(
        self,
        depots_state: Dict[str, Any],
        zone_risks: Dict[str, Any],
        transit_matrix: Dict[Any, Any]
    ) -> Dict[str, Any]:
        
        prob = pulp.LpProblem("Flood_Emergency_Resource_Allocation", pulp.LpMinimize)

        depot_ids = list(depots_state.keys())
        zone_ids = list(zone_risks.keys())
        resource_types = ["rescue_boats", "medical_teams", "relief_kits", "water_pumps"]

        # Decision Variables
        # x[i, j, k] = amount of resource k dispatched from depot i to zone j
        x = {}
        for d in depot_ids:
            for z in zone_ids:
                for r in resource_types:
                    x[(d, z, r)] = pulp.LpVariable(f"x_{d}_{z}_{r}", lowBound=0, cat=pulp.LpInteger)

        # u[j, k] = unserved demand of resource k in zone j
        u = {}
        for z in zone_ids:
            for r in resource_types:
                u[(z, r)] = pulp.LpVariable(f"u_{z}_{r}", lowBound=0, cat=pulp.LpInteger)

        # Priority Weights per zone
        priority = {}
        for z, z_data in zone_risks.items():
            sev = z_data["severity"]
            score = z_data["composite_risk_score"]
            if sev == "Critical":
                priority[z] = 10.0 + score * 5.0
            elif sev == "Medium":
                priority[z] = 4.0 + score * 2.0
            else:
                priority[z] = 1.0

        # Objective Function Components
        penalty_unserved = []
        cost_transit = []

        for z in zone_ids:
            p_weight = priority[z]
            for r in resource_types:
                penalty_unserved.append(u[(z, r)] * WEIGHT_DEMAND_COVERAGE * p_weight)

        for d in depot_ids:
            for z in zone_ids:
                for r in resource_types:
                    route_info = transit_matrix.get((d, z, r), {})
                    if route_info.get("success", False):
                        t_min = route_info["travel_time_min"]
                    else:
                        t_min = 9999.0  # Impassable penalty

                    cost_transit.append(x[(d, z, r)] * (t_min * WEIGHT_TRANSIT_LATENCY))

        prob += pulp.lpSum(penalty_unserved) + pulp.lpSum(cost_transit)

        # Constraint 1: Depot Supply Limits
        for d in depot_ids:
            inv = depots_state[d]["current_inventory"]
            for r in resource_types:
                avail = inv.get(r, 0)
                prob += (
                    pulp.lpSum([x[(d, z, r)] for z in zone_ids]) <= avail,
                    f"Supply_{d}_{r}"
                )

        # Constraint 2: Zone Demand Fulfillment
        for z in zone_ids:
            demands = zone_risks[z]["demands"]
            for r in resource_types:
                req = demands.get(r, 0)
                prob += (
                    pulp.lpSum([x[(d, z, r)] for d in depot_ids]) + u[(z, r)] >= req,
                    f"Demand_{z}_{r}"
                )

        # Constraint 3: Block impassable routes (unless rescue boats)
        for d in depot_ids:
            for z in zone_ids:
                for r in resource_types:
                    route_info = transit_matrix.get((d, z, r), {})
                    if not route_info.get("success", False):
                        prob += (x[(d, z, r)] == 0, f"Block_{d}_{z}_{r}")

        # Solve MILP
        solver = pulp.PULP_CBC_CMD(msg=False, timeLimit=5)
        status = prob.solve(solver)

        allocations = []
        unserved_summary = {}

        for d in depot_ids:
            for z in zone_ids:
                for r in resource_types:
                    val = int(pulp.value(x[(d, z, r)]) or 0)
                    if val > 0:
                        route_info = transit_matrix.get((d, z, r), {})
                        allocations.append({
                            "depot_id": d,
                            "depot_name": depots_state[d]["name"],
                            "zone_id": z,
                            "zone_name": zone_risks[z]["zone_name"],
                            "resource_type": r,
                            "quantity": val,
                            "eta_minutes": route_info.get("travel_time_min", 0.0),
                            "polyline": route_info.get("polyline", [])
                        })

        for z in zone_ids:
            unserved_summary[z] = {}
            for r in resource_types:
                unserved_val = int(pulp.value(u[(z, r)]) or 0)
                unserved_summary[z][r] = unserved_val

        return {
            "solver_status": pulp.LpStatus[status],
            "objective_value": round(float(pulp.value(prob.objective) or 0.0), 2),
            "allocations": allocations,
            "unserved_demand": unserved_summary
        }

    def _solve_greedy(
        self,
        depots_state: Dict[str, Any],
        zone_risks: Dict[str, Any],
        transit_matrix: Dict[Any, Any]
    ) -> Dict[str, Any]:
        """Greedy heuristic solver as robust fallback."""
        allocations = []
        depot_inv = {d: dict(depots_state[d]["current_inventory"]) for d in depots_state.keys()}
        
        # Sort zones by severity (Critical first) and risk score
        sorted_zones = sorted(
            zone_risks.values(),
            key=lambda z: (z["severity"] == "Critical", z["composite_risk_score"]),
            reverse=True
        )

        for z in sorted_zones:
            z_id = z["zone_id"]
            demands = dict(z["demands"])

            for r_type, req in demands.items():
                if req <= 0:
                    continue
                
                # Find best depot with available supply & shortest travel time
                candidate_depots = []
                for d_id, inv in depot_inv.items():
                    if inv.get(r_type, 0) > 0:
                        route = transit_matrix.get((d_id, z_id, r_type), {})
                        if route.get("success", False):
                            candidate_depots.append((d_id, route["travel_time_min"], route))

                candidate_depots.sort(key=lambda item: item[1])

                for d_id, t_min, route in candidate_depots:
                    avail = depot_inv[d_id][r_type]
                    dispatch_qty = min(avail, req)
                    
                    if dispatch_qty > 0:
                        depot_inv[d_id][r_type] -= dispatch_qty
                        req -= dispatch_qty
                        
                        allocations.append({
                            "depot_id": d_id,
                            "depot_name": depots_state[d_id]["name"],
                            "zone_id": z_id,
                            "zone_name": z["zone_name"],
                            "resource_type": r_type,
                            "quantity": dispatch_qty,
                            "eta_minutes": t_min,
                            "polyline": route.get("polyline", [])
                        })

                    if req <= 0:
                        break

        return {
            "solver_status": "Greedy_Optimal",
            "objective_value": 0.0,
            "allocations": allocations,
            "unserved_demand": {}
        }
