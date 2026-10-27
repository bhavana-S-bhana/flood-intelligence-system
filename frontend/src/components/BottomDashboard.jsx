import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Play, Pause, FastForward, Clock } from 'lucide-react';

export default function BottomDashboard({
  zones,
  allocatedResources,
  depots,
  timeStep,
  setTimeStep,
  isSimulationRunning,
  runSimulation,
  isSimulationPaused,
  toggleSimulationPause,
  scenario,
  setScenario
}) {
  console.log("ALLOCATED RESOURCES:", allocatedResources);
  //const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Time step options
  const steps = [
    { id: 0, label: 'T+0', time: '(08:00)' },
    { id: 1, label: 'T+15', time: '(08:15)' },
    { id: 2, label: 'T+30', time: '(08:30)' },
    { id: 3, label: 'T+45', time: '(08:45)' },
    { id: 4, label: 'T+60', time: '(09:00)' },
  ];

  // Auto-play timeline simulation tick
 /** useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeStep((prev) => (prev + 1) % steps.length);
      }, 3000 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, setTimeStep]);**/

  // Bar Chart Data (Z1-Z8)
  const barData = zones ? Object.values(zones).map(z => ({
    name: z.id,
    score: z.composite_risk_score,
    severity: z.severity
  })) : [
    { name: 'Z1', score: 0.48, severity: 'Medium' },
    { name: 'Z2', score: 0.72, severity: 'High' },
    { name: 'Z3', score: 0.87, severity: 'Critical' },
    { name: 'Z4', score: 0.62, severity: 'Medium' },
    { name: 'Z5', score: 0.45, severity: 'Medium' },
    { name: 'Z6', score: 0.28, severity: 'Low' },
    { name: 'Z7', score: 0.55, severity: 'Medium' },
    { name: 'Z8', score: 0.29, severity: 'Low' },
  ];

  const getBarColor = (severity) => {
    switch (severity) {
      case 'Critical': return '#EF4444';
      case 'High': return '#F97316';
      case 'Medium': return '#EAB308';
      default: return '#10B981';
    }
  };

  // Donut Chart Data
const resourceTotals = allocatedResources || {};

const resourceCapacity = {};

Object.values(depots || {}).forEach((depot) => {
  Object.entries(depot.initial_inventory || {}).forEach(([resource, quantity]) => {
    resourceCapacity[resource] =
      (resourceCapacity[resource] || 0) + quantity;
  });
});
const pieData = [
  {
    name: 'Rescue Boats',
    value: resourceTotals['rescue_boats'] || 0,
    total: resourceCapacity['rescue_boats'] || 0,
    color: '#3B82F6'
  },
  {
    name: 'Medical Teams',
    value: resourceTotals['medical_teams'] || 0,
    total: resourceCapacity['medical_teams'] || 0,
    color: '#14B8A6'
  },
  {
    name: 'Relief Kits',
    value: resourceTotals['relief_kits'] || 0,
    total: resourceCapacity['relief_kits'] || 0,
    color: '#EAB308'
  },
  {
    name: 'Water Pumps',
    value: resourceTotals['water_pumps'] || 0,    
    total: resourceCapacity['water_pumps'] || 0,
    color: '#A855F7'
  },
];
const overallProgress =
  pieData.reduce((sum, item) => {
    if (item.total > 0) {
      return sum + (item.value / item.total);
    }
    return sum;
  }, 0) / pieData.length * 100;

  return (
    <div className="bg-[#0D1527] border-t border-slate-800 p-3">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        
        {/* Chart 1: Flood Risk Score by Zone (Bar Chart) */}
        <div className="lg:col-span-4 bg-[#131C2E] p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold text-white tracking-wide">Flood Risk Score by Zone</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Scale 0.0 - 1.0</span>
          </div>

          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 1.0]} stroke="#94A3B8" fontSize={10} tickLine={false} />
               <Tooltip
  contentStyle={{
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#FFFFFF'
  }}
  itemStyle={{ color: '#FFFFFF' }}
  labelStyle={{ color: '#FFFFFF' }}
/>
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.severity)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Resource Dispatch Progress (Donut Chart) */}
        <div className="lg:col-span-4 bg-[#131C2E] p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold text-white tracking-wide">Resource Dispatch Progress</h3>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded">{Math.round(overallProgress)}% Allocated</span>
          </div>

          <div className="flex items-center justify-between h-36">
            {/* Donut Chart with Center Percentage */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
  <span className="text-sm font-black text-white">
  {Math.round(overallProgress)}%
</span>
  <span className="text-[8px] text-slate-400 leading-tight">
  Allocated
</span>
</div>
            </div>

       {/* Donut Legend */}
<div className="space-y-1 text-[10px] flex-1 pl-2">
  {pieData.map((p, idx) => {
    const resourceIcons = {
      'Rescue Boats': '🚤',
      'Medical Teams': '🚑',
      'Relief Kits': '📦',
      'Water Pumps': '💧',
    };

    return (
      <div key={idx} className="flex items-center justify-between">
     <div className="flex items-center space-x-1.5">
  <span
    className="w-2.5 h-2.5 rounded-full shrink-0"
    style={{ backgroundColor: p.color }}
  ></span>

  <span className="text-sm">
    {resourceIcons[p.name] || '📦'}
  </span>

  <span className="text-slate-300 font-medium">
    {p.name}
  </span>
</div>
        <span className="font-bold text-white">
          {p.value} / {p.total}
        </span>
      </div>
    );
  })}
</div>
          </div>
        </div>

        {/* Timeline Controller */}
        <div className="lg:col-span-4 bg-[#131C2E] p-3 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white tracking-wide">Simulation Timeline</h3>
            </div>
            <span className="text-[10px] font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
              {steps[timeStep].label} mins
            </span>
          </div>

          {/* Timeline Step Nodes */}
          <div className="flex items-center justify-between relative px-2 my-1">
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
            {steps.map((s) => {
              const isActive = timeStep === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setTimeStep(s.id)}
                  className={`relative z-10 flex flex-col items-center transition-all ${
                    isActive ? 'scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                    isActive
                      ? 'bg-blue-600 border-white text-white shadow-lg shadow-blue-900'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}>
                    {s.id + 1}
                  </div>
                  <span className={`text-[10px] font-bold mt-1 ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                  <span className="text-[8px] text-slate-500">{s.time}</span>
                </button>
              );
            })}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between pt-1">
           <div className="flex items-center gap-2">
  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
    Scenario
  </span>

  <div className="relative">
    <select
      value={scenario}
      onChange={(e) => setScenario(e.target.value)}
     className="
  appearance-none
  w-[150px]
  h-9
  pl-3
  pr-7
  bg-slate-900
  border border-slate-700
  hover:border-slate-500
  focus:border-blue-500
  focus:ring-2
  focus:ring-blue-500/20
  text-slate-100
  rounded-lg
  text-xs
  font-medium
  shadow-sm
  outline-none
  cursor-pointer
  transition-all
"
    >
      <option value="mild_rain">🌤️ Mild Rain</option>
      <option value="normal_storm">🌧️ Normal Storm</option>
      <option value="cloudburst">⚡ Cloudburst</option>
      <option value="dam_breach">🚨 Dam Breach</option>
    </select>

    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
      ▾
    </span>
  </div>
</div>
            <button
             onClick={
  isSimulationRunning
    ? toggleSimulationPause
    : runSimulation
}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-md transition-all"
            >
              {isSimulationRunning && !isSimulationPaused ? (
  <Pause size={16} />
) : (
  <Play size={16} />
)}
        <span>
  {!isSimulationRunning
    ? 'Run Simulation'
    : isSimulationPaused
    ? 'Resume Simulation'
    : 'Pause Simulation'}
</span>
            </button>

            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-slate-400 font-semibold">Speed:</span>
              <button
                onClick={() => setSpeed(speed === 1 ? 2 : speed === 2 ? 5 : 1)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[10px] font-bold"
              >
                {speed}x v
              </button>
            </div>
          </div>

          <p className="text-[9px] text-slate-400 italic text-center">
            Simulation updates risk levels, water levels, resource allocations and alerts in real-time.
          </p>
        </div>

      </div>

      {/* Footer copyright */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2.5 mt-2 border-t border-slate-800/80">
        <span>Kerala Flood Intelligence System | Final Year Project</span>
        <span>Data for research and academic purposes only | Non-official government data</span>
      </div>
    </div>
  );
}
