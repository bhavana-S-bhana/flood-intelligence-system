import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import StatBanner from './components/StatBanner';
import ZoneSidebar from './components/ZoneSidebar';
import GisMapPanel from './components/GisMapPanel';
import RightDetailPanel from './components/RightDetailPanel';
import BottomDashboard from './components/BottomDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [timeStep, setTimeStep] = useState(0); // T+15 default // T+30 default
  const [scenario, setScenario] = useState('cloudburst');
  const [simData, setSimData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [isSimulationPaused, setIsSimulationPaused] = useState(false);  
  const pauseRef = useRef(false);
  // Fetch live simulation data from FastAPI backend when step changes
  useEffect(() => {
    let isMounted = true;
    const fetchSimulation = async () => {
      setLoading(true);
      try {
       const res = await fetch(
  `/api/simulation?step=${timeStep}&scenario=${scenario}`
);
        if (res.ok) {
  const data = await res.json();

  if (isMounted) {
  console.log("SIM DATA:", data);
  console.log("SIMULATION ZONES:", data?.zones);
  setSimData(data);

    // Select the highest-risk zone automatically
    /*if (data.zones) {
      const highestRiskZone = Object.values(data.zones).reduce(
        (highest, zone) =>
          zone.composite_risk_score > highest.composite_risk_score
            ? zone
            : highest
      );

      setSelectedZoneId(highestRiskZone.zone_id || highestRiskZone.id);
    }*/
  }
}
      } catch (err) {
        console.warn('Backend API connection pending, fallback rendering enabled.', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSimulation();
    return () => { isMounted = false; };
  }, [timeStep, scenario]);
 const runSimulation = async () => {
  // Resume if paused
  if (isSimulationRunning && isSimulationPaused) {
    pauseRef.current = false;
    setIsSimulationPaused(false);
    return;
  }

  // Start simulation
  pauseRef.current = false;
  setIsSimulationPaused(false);
  setIsSimulationRunning(true);

  let step = timeStep;

  while (true) {
    // Stay here while paused
    while (pauseRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setTimeStep(step);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Move to next timestep
    step = step + 1;

    // After T+60, go back to T+0
    if (step > 4) {
      step = 0;
    }
  }
};
  const selectedZone =
  Object.values(simData?.zones || {}).find(
    (z) => (z.zone_id || z.id) === selectedZoneId
  ) || {
    id: selectedZoneId,
    zone_id: selectedZoneId,
    name: selectedZoneId === 'Z3'
      ? 'Wayanad'
      : selectedZoneId === 'Z2'
      ? 'Kannur Region'
      : 'North Kerala',
    severity: 'Unknown',
    composite_risk_score: 0,
    water_level_m: 0,
    population_at_risk: 0,
    affected_villages: 0,
    rainfall_24h_mm: 0,
    status_text: 'No data'
  };
  const toggleSimulationPause = () => {
  if (!isSimulationRunning) return;

  if (isSimulationPaused) {
    pauseRef.current = false;
    setIsSimulationPaused(false);
  } else {
    pauseRef.current = true;
    setIsSimulationPaused(true);
  }
};

    return (
    <div className="flex flex-col h-screen w-screen bg-[#0A0E1A] text-slate-100 overflow-hidden">
      
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <>
          <StatBanner stats={simData?.overall_stats} />

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 gap-3">
            <ZoneSidebar
              zones={simData?.zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
              alerts={simData?.alerts}
            />

            <GisMapPanel
              zones={simData?.zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
              transitRoutes={simData?.transit_routes || []}
            />

            <RightDetailPanel
              zone={selectedZone}
              allocatedResources={simData?.allocated_resources}
              dispatches={simData?.z3_dispatches}
            />
          </div>

          <BottomDashboard
  zones={simData?.zones}
  allocatedResources={simData?.allocated_resources}
  depots={simData?.depots}
  timeStep={timeStep}
  setTimeStep={setTimeStep}
  isSimulationRunning={isSimulationRunning}
  runSimulation={runSimulation}
  isSimulationPaused={isSimulationPaused}
  toggleSimulationPause={toggleSimulationPause}
  scenario={scenario}
  setScenario={setScenario}
/>
        </>
      )}

      {/* Live Data */}
      {activeTab === 'live-data' && (
        <div className="flex-1 overflow-auto p-6">
          <h2 className="text-2xl font-bold mb-2">Live Sensor Data</h2>
          <p className="text-slate-400 mb-6">
            Real-time flood monitoring data for Kerala zones.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {Object.values(simData?.zones || {}).map((zone) => (
              <div
                key={zone.id}
                className="bg-[#111A2E] border border-slate-700 rounded-xl p-4"
              >
                <div className="flex justify-between mb-3">
                  <h3 className="font-bold">{zone.name}</h3>
                  <span className="text-xs font-bold">
                    {zone.severity}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    Water Level:
                    <span className="float-right font-bold">
                      {zone.water_level_m} m
                    </span>
                  </p>

                  <p>
                    Flood Stage:
                    <span className="float-right font-bold">
                      {zone.flood_stage_m} m
                    </span>
                  </p>

                  <p>
                    Risk Score:
                    <span className="float-right font-bold">
                      {zone.composite_risk_score}
                    </span>
                  </p>

                  <p>
                    Rainfall:
                    <span className="float-right font-bold">
                      {zone.rainfall_24h_mm} mm
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zones */}
      {activeTab === 'zones' && (
        <div className="flex-1 overflow-auto p-6">
          <h2 className="text-2xl font-bold mb-2">Flood Risk Zones</h2>
          <p className="text-slate-400 mb-6">
            Current risk condition across the 8 project-defined Kerala zones.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {Object.values(simData?.zones || {}).map((zone) => (
              <button
                key={zone.id}
                onClick={() => {
                  setSelectedZoneId(zone.id);
                  setActiveTab('dashboard');
                }}
                className="text-left bg-[#111A2E] border border-slate-700 hover:border-blue-500 rounded-xl p-5 transition"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-blue-400 font-bold">
                    {zone.id}
                  </span>

                  <span className="text-xs font-bold uppercase">
                    {zone.severity}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-3">
                  {zone.name}
                </h3>

                <p className="text-sm text-slate-400">
                  Risk Score
                </p>

                <p className="text-2xl font-bold">
                  {zone.composite_risk_score}
                </p>

                <p className="text-sm text-slate-400 mt-3">
                  Water Level: {zone.water_level_m} m
                </p>

                <p className="text-sm text-slate-400">
                  Population at Risk: {zone.population_at_risk?.toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resource Allocation */}
      {activeTab === 'allocation' && (
        <div className="flex-1 overflow-auto p-6">
          <h2 className="text-2xl font-bold mb-2">
            Resource Allocation
          </h2>

          <p className="text-slate-400 mb-6">
            MILP-based emergency resource allocation and dispatch.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {Object.entries(simData?.allocated_resources || {}).map(
              ([resource, data]) => (
                <div
                  key={resource}
                  className="bg-[#111A2E] border border-slate-700 rounded-xl p-5"
                >
                  <h3 className="font-bold capitalize mb-4">
                    {resource.replaceAll('_', ' ')}
                  </h3>

                  <p className="text-3xl font-bold">
                    {data.allocated}
                  </p>

                  <p className="text-sm text-slate-400">
                    of {data.total} allocated
                  </p>

                  <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    {data.percentage}% allocated · {data.status}
                  </p>
                </div>
              )
            )}
          </div>

          <div className="mt-6 bg-[#111A2E] border border-slate-700 rounded-xl p-5">
            <h3 className="font-bold mb-4">
              Current Dispatches
            </h3>

            <div className="space-y-3">
              {(simData?.z3_dispatches || []).map((dispatch, index) => (
                <div
                  key={index}
                  className="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-3"
                >
                  <span>{dispatch.resource}</span>
                  <span>Qty: {dispatch.quantity}</span>
                  <span>{dispatch.from_depot}</span>
                  <span className="text-blue-400">
                    {dispatch.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div className="flex-1 overflow-auto p-6">
          <h2 className="text-2xl font-bold mb-2">
            Flood Intelligence Reports
          </h2>

          <p className="text-slate-400 mb-6">
            Current simulation summary and operational status.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111A2E] border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Total Zones
              </p>
              <p className="text-3xl font-bold">
                {simData?.overall_stats?.total_zones ?? 0}
              </p>
            </div>

            <div className="bg-[#111A2E] border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Critical Zones
              </p>
              <p className="text-3xl font-bold text-red-400">
                {simData?.overall_stats?.critical_zones ?? 0}
              </p>
            </div>

            <div className="bg-[#111A2E] border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-sm">
                Active Dispatches
              </p>
              <p className="text-3xl font-bold">
                {simData?.overall_stats?.active_dispatches ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-[#111A2E] border border-slate-700 rounded-xl p-5">
            <h3 className="font-bold mb-4">
              Simulation Information
            </h3>

            <p className="text-slate-400">
              Scenario:
              <span className="text-white ml-2">
                {simData?.scenario || 'Cloudburst'}
              </span>
            </p>

            <p className="text-slate-400 mt-2">
              Current Time Step:
              <span className="text-white ml-2">
                T+{timeStep * 15} minutes
              </span>
            </p>

            <p className="text-slate-400 mt-2">
              State Risk:
              <span className="text-orange-400 ml-2">
                {simData?.overall_stats?.state_risk_level || 'N/A'}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-2">
            System Settings
          </h2>

          <p className="text-slate-400">
            Flood Intelligence System configuration.
          </p>
        </div>
      )}

    </div>
  );
}
