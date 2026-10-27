#!/usr/bin/env python3
"""
Flood Intelligence System - Automated End-to-End Simulation Script
"""

import sys
import os
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import time
import json
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

from app.data_ingestion.sensor_feed import SensorDataIngestion
from app.data_ingestion.risk_scorer import RiskScoringEngine
from app.inventory.resource_manager import ResourceManager
from app.optimization.routing import GeospatialRoutingEngine
from app.optimization.solver import OptimizationSolver

# Ensure UTF-8 encoding on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

console = Console(force_terminal=True)

def run_simulation(scenario: str = "cloudburst", steps: int = 6):
    console.print(Panel.fit(
        f"[bold blue]🌊 FLOOD INTELLIGENCE & DYNAMIC RESOURCE ALLOCATION SYSTEM[/bold blue]\n"
        f"[bold white]Scenario: {scenario.upper()} | Simulation Steps: {steps}[/bold white]",
        border_style="blue"
    ))

    # Initialize Core Engines
    sensor_feed = SensorDataIngestion()
    risk_scorer = RiskScoringEngine()
    resource_mgr = ResourceManager()
    routing_engine = GeospatialRoutingEngine()
    solver = OptimizationSolver()

    for step in range(steps):
        t_minutes = step * 15
        console.print(f"\n[bold yellow]───────── SIMULATION TIME STEP: T+{t_minutes:03d} mins (Step {step+1}/{steps}) ─────────[/bold yellow]")

        # 1. Telemetry Ingestion
        telemetry = sensor_feed.generate_telemetry(step=step, scenario=scenario)
        
        # 2. Risk Severity Scoring & Demand Estimation
        zone_risks = risk_scorer.calculate_zone_risks(telemetry)
        
        # Display Zone Risk Table
        table_risk = Table(title=f"Zone Risk Scores & Demand (T+{t_minutes}m)", header_style="bold magenta")
        table_risk.add_column("Zone ID", style="cyan")
        table_risk.add_column("Zone Name", style="white")
        table_risk.add_column("Severity", style="bold")
        table_risk.add_column("Risk Score", justify="right")
        table_risk.add_column("Water Level", justify="right")
        table_risk.add_column("Demand (Boats/EMT/Relief)", justify="center")

        critical_zones = 0
        for z_id, z in zone_risks.items():
            sev = z["severity"]
            if sev == "Critical":
                critical_zones += 1
                sev_str = f"[bold red]{sev}[/bold red]"
            elif sev == "Medium":
                sev_str = f"[yellow]{sev}[/yellow]"
            else:
                sev_str = f"[green]{sev}[/green]"

            b = z["demands"].get("rescue_boats", 0)
            m = z["demands"].get("medical_teams", 0)
            r = z["demands"].get("relief_kits", 0)
            dem_str = f"{b} B | {m} EMT | {r} Kits"

            table_risk.add_row(
                z_id, z["zone_name"], sev_str, f"{z['composite_risk_score']:.3f}",
                f"{z['water_level_m']} m", dem_str
            )

        console.print(table_risk)

        # 3. Network Routing & Shortest Paths over Flooded Roads
        transit_matrix = routing_engine.compute_all_depot_zone_matrix(zone_risks)

        # 4. Mixed-Integer Linear Programming Optimization Solver
        depots = resource_mgr.get_all_depots()
        opt_result = solver.solve_allocation(depots, zone_risks, transit_matrix)

        # 5. Dispatch Resources
        executed = resource_mgr.dispatch_resources(opt_result["allocations"])

        # Display Dispatch Plan
        table_disp = Table(title=f"MILP Solver Dispatch Recommendations (Status: {opt_result['solver_status']})", header_style="bold green")
        table_disp.add_column("From Depot", style="blue")
        table_disp.add_column("Target Zone", style="cyan")
        table_disp.add_column("Resource Dispatched", style="white")
        table_disp.add_column("Qty", justify="right", style="bold yellow")
        table_disp.add_column("ETA (mins)", justify="right", style="bold green")

        for d in executed:
            table_disp.add_row(
                d["depot_id"], d["zone_id"], d["resource_type"].replace("_", " ").title(),
                str(d["quantity"]), f"{d['eta_minutes']:.1f} min"
            )

        if executed:
            console.print(table_disp)
        else:
            console.print("[dim]No resource dispatches required for this time step.[/dim]")

        time.sleep(0.8)

    console.print(Panel.fit(
        "[bold green]✔ SIMULATION COMPLETED SUCCESSFULLY[/bold green]\n"
        "[white]All risk scores evaluated, flooded routes updated, and resources dynamically allocated.[/white]",
        border_style="green"
    ))

if __name__ == "__main__":
    run_simulation(scenario="cloudburst", steps=5)
