import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
GRID_DATA_FILE = DATA_DIR / "sample_grid.json"

# Risk Threshold Constants
RISK_THRESHOLD_LOW = 0.35
RISK_THRESHOLD_CRITICAL = 0.70

# Demand Estimation Coefficients per 1,000 population at risk
# Demand = Base_Demand + Population_Factor * Severity_Score
RESOURCE_DEMAND_RATES = {
    "rescue_boats": {"base": 2, "pop_factor": 0.5, "min_critical": 3},
    "medical_teams": {"base": 1, "pop_factor": 0.4, "min_critical": 2},
    "relief_kits": {"base": 50, "pop_factor": 15.0, "min_critical": 100},
    "water_pumps": {"base": 1, "pop_factor": 0.2, "min_critical": 2}
}

# Optimization Solver Weights
WEIGHT_DEMAND_COVERAGE = 100.0  # Priority penalty weight for unserved demand
WEIGHT_TRANSIT_LATENCY = 0.5   # Penalty per minute of response travel time
WEIGHT_CRITICAL_BONUS = 500.0  # Extra multiplier for Critical severity zones

# Dynamic Road Impassability Depth (meters)
CRITICAL_FLOOD_DEPTH_ROAD_BLOCK_M = 0.5  # Roads impassable for normal vehicles above 0.5m
