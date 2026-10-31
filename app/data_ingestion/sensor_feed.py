import json
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any
from app.config import GRID_DATA_FILE

class SensorDataIngestion:
    def __init__(self, config_path=GRID_DATA_FILE):
        with open(config_path, "r") as f:
            self.raw_data = json.load(f)
        self.sensors = self.raw_data["sensors"]
        self.zones = {z["id"]: z for z in self.raw_data["zones"]}
        self.current_step = 0

    def generate_telemetry(self, step: int = 0, scenario: str = "normal_storm") -> Dict[str, Any]:
        """
        Generates simulated real-time streamflow/water level and weather sensor readings.
        """
        self.current_step = step
        telemetry = {}
        
        # Scenario intensity multipliers
        storm_mult = {
            "mild_rain": 0.5,
            "normal_storm": 1.0,
            "cloudburst": 1.8,
            "dam_breach": 2.5
        }.get(scenario, 1.0)

        # Simulation time curve (hydrograph peak around step 6-8)
        t = step
        base_water_curve = np.sin(np.pi * min(t, 12) / 12.0) ** 1.5 * storm_mult

        timestamp = (datetime.now() + timedelta(minutes=step * 15)).isoformat()

        for s in self.sensors:
            zone = self.zones.get(s["zone_id"], {})
            base_elevation = zone.get("elevation_m", 205.0)
            flood_stage = zone.get("flood_stage_m", 3.0)

            # Local elevation factor (lower elevation = higher flood level)
                       # Local elevation factor (lower elevation = higher flood risk)
            elevation_risk_factor = np.clip(
                1.0 + (100.0 - base_elevation) / 500.0,
                0.8,
                1.2
            )
            
            # Simulated water level above riverbed (meters)
            water_level_m = round(
                base_water_curve
                * flood_stage
                * elevation_risk_factor
                * (0.95 + 0.1 * np.sin(step + len(s["id"]))),
                2
            )

            
            # Rate of water level change dh/dt (m/hour)
            prev_level = max(0.0, base_water_curve * 0.8 * flood_stage)
            dh_dt = round((water_level_m - prev_level) * 4.0, 2)  # 15-min steps to hourly rate

            # Rainfall intensity (mm/hr)
                        # Rainfall intensity (mm/hr)
            rain_intensity_mmh = round(
                base_water_curve * 60.0 * storm_mult
                + 2.5
                + 2.5 * np.sin(step + len(s["id"])),
                1
            )
            # Soil saturation %
            soil_saturation_pct = min(100.0, round(40.0 + base_water_curve * 55.0, 1))

            telemetry[s["id"]] = {
                "sensor_id": s["id"],
                "sensor_name": s["name"],
                "zone_id": s["zone_id"],
                "lat": s["lat"],
                "lon": s["lon"],
                "timestamp": timestamp,
                "water_level_m": water_level_m,
                "flood_stage_m": flood_stage,
                "warning_threshold_m": s["warning_m"],
                "critical_threshold_m": s["critical_m"],
                "rate_of_rise_m_hr": dh_dt,
                "rainfall_mm_hr": rain_intensity_mmh,
                "soil_saturation_pct": soil_saturation_pct,
                "status": "CRITICAL" if water_level_m >= s["critical_m"] else ("WARNING" if water_level_m >= s["warning_m"] else "NORMAL")
            }

        return {
            "timestamp": timestamp,
            "simulation_step": step,
            "scenario": scenario,
            "sensors": telemetry
        }
