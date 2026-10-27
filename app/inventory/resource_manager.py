import json
from typing import Dict, List, Any
from app.config import GRID_DATA_FILE

class ResourceManager:
    def __init__(self, config_path=GRID_DATA_FILE):
        with open(config_path, "r") as f:
            self.raw_data = json.load(f)
        
        self.depots = {}
        for d in self.raw_data["depots"]:
            self.depots[d["id"]] = {
                "id": d["id"],
                "name": d["name"],
                "lat": d["lat"],
                "lon": d["lon"],
                "initial_inventory": dict(d["inventory"]),
                "current_inventory": dict(d["inventory"]),
                "dispatched": {k: 0 for k in d["inventory"].keys()}
            }
            
        self.active_dispatches = []

    def get_all_depots(self) -> Dict[str, Any]:
        """Returns current state of all depots and inventory."""
        return self.depots

    def reset_inventory(self):
        """Resets all depot inventories back to initial baseline."""
        for d_id, d_data in self.depots.items():
            d_data["current_inventory"] = dict(d_data["initial_inventory"])
            d_data["dispatched"] = {k: 0 for k in d_data["initial_inventory"].keys()}
        self.active_dispatches = []

    def dispatch_resources(self, allocation_plan: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Executes and records resource dispatches from specified depots to target demand zones.
        """
        executed = []
        for alloc in allocation_plan:
            depot_id = alloc["depot_id"]
            zone_id = alloc["zone_id"]
            r_type = alloc["resource_type"]
            amount = alloc["quantity"]

            if depot_id in self.depots:
                available = self.depots[depot_id]["current_inventory"].get(r_type, 0)
                actual_dispatch = min(available, amount)
                
                if actual_dispatch > 0:
                    self.depots[depot_id]["current_inventory"][r_type] -= actual_dispatch
                    self.depots[depot_id]["dispatched"][r_type] += actual_dispatch
                    
                    record = {
                        "depot_id": depot_id,
                        "zone_id": zone_id,
                        "resource_type": r_type,
                        "quantity": actual_dispatch,
                        "eta_minutes": alloc.get("eta_minutes", 0.0),
                        "status": "In-Transit"
                    }
                    self.active_dispatches.append(record)
                    executed.append(record)
                    
        return executed
