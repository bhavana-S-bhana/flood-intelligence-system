# 🌊 Flood Intelligence System (FIS)

A comprehensive prototype for **Flood Prediction, Risk Severity Scoring, Emergency Resource Demand Calculation, MILP Optimization, and Flooded Road Network Routing** with a live interactive GIS Operations Dashboard.

---

## 🏛️ System Architecture

```
[Simulated Water Gauges & Rain Sensors]
                 │
                 ▼
     [Risk Severity Engine]
  (Calculates Composite Risk Score R_i & Demand)
                 │
                 ▼
    [Operations Research MILP Solver]
  (Optimizes Depot Inventory -> Zone Allocation)
                 │
                 ▼
   [Geospatial Road Network Graph]
 (NetworkX Dijkstra with Flooded Road Penalties)
                 │
                 ▼
  [Interactive Streamlit / Folium GIS UI]
```

---

## ⚡ Core Features

1. **Data Ingestion & Risk Scoring**:
   - Computes composite risk severity scores $R_i \in [0, 1]$ based on water level relative to flood stage, rate of rise $dh/dt$, rainfall intensity, elevation, and population density.
   - Categorizes zones into `Low`, `Medium`, and `Critical` risk levels.
   - Computes exact demand units for Rescue Boats, Medical/EMT Teams, Relief Supplies, and Water Pumps.

2. **Resource Inventory & Tracking**:
   - Manages multi-depot emergency stocks with active status tracking (`Available`, `Dispatched`, `In-Transit`, `Deployed`).

3. **MILP Optimization & Dynamic Allocation Engine**:
   - Formulated using Mixed-Integer Linear Programming (`PuLP` CBC Solver / `SciPy` Heuristic fallback).
   - Maximizes demand satisfaction for high-priority critical zones while minimizing transit times.

4. **Geospatial Road Graph & Dynamic Routing**:
   - Built on `NetworkX`.
   - Modifies road travel speeds based on flood depths and severs flooded highways ($\ge 0.5\text{m}$ depth), calculating optimal polyline paths for standard vehicles vs amphibious rescue craft.

5. **Interactive Operations Dashboard**:
   - Built with Streamlit & Folium (`CartoDB dark_matter` theme).
   - Shows risk polygon choropleths, sensor telemetry popups, resource depots, and animated dispatch polylines.

---

## 🚀 How to Run Locally

### 1. Run Automated Terminal Simulation
To run a step-by-step 5-stage flood simulation in your terminal:
```bash
python run_simulation.py
```

### 2. Launch the Interactive GIS Dashboard
To open the live operations command dashboard:
```bash
streamlit run app/dashboard/app.py
```
Open your browser at `http://localhost:8501`.

### 3. Launch FastAPI REST Backend
To run the REST API server:
```bash
uvicorn app.api.routes:app --reload --port 8000
```
View interactive OpenAPI documentation at `http://localhost:8000/docs`.

---

## 📂 File Directory

```
flood-intelligence-system/
├── app/
│   ├── config.py                 # System constants & optimization weights
│   ├── data_ingestion/
│   │   ├── sensor_feed.py        # Simulated streamflow & rain sensors
│   │   └── risk_scorer.py        # Composite risk scoring engine
│   ├── inventory/
│   │   └── resource_manager.py   # Multi-depot inventory tracking
│   ├── optimization/
│   │   ├── routing.py            # NetworkX flooded road routing
│   │   └── solver.py             # Operations Research MILP solver
│   ├── api/
│   │   └── routes.py             # FastAPI REST endpoints
│   └── dashboard/
│       └── app.py                # Streamlit + Folium GIS Dashboard
├── data/
│   └── sample_grid.json          # Metro River Basin GIS spatial topology
├── run_simulation.py             # Standalone CLI simulation script
├── run_server.py                 # Server runner script
├── requirements.txt
└── README.md
```
