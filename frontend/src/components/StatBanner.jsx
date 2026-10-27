import React from 'react';
import { Map, Users, AlertTriangle, Truck, Bell, CloudRain, ShieldCheck } from 'lucide-react';

export default function StatBanner({ stats }) {
  const defaultStats = {
    total_zones: 8,
    people_at_risk: 95420,
    people_at_risk_trend: '+12%',
    critical_zones: 3,
    active_dispatches: 18,
    active_alerts: 4,
    weather: 'Weather data unavailable',
    state_risk_level: 'High Risk'
  };

  const s = stats || defaultStats;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 px-4 py-3 bg-[#0B101D] border-b border-slate-800/80">
      {/* 1. Total Zones */}
      <div className="bg-[#131C2E] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-400">Total Zones</p>
          <p className="text-2xl font-extrabold text-white mt-0.5">{s.total_zones}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Map className="w-5 h-5" />
        </div>
      </div>

      {/* 2. People at Risk */}
      <div className="bg-[#131C2E] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-400">People at Risk</p>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <p className="text-xl font-extrabold text-white">
    {s.people_at_risk?.toLocaleString() || '95,420'}
</p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Critical Zones */}
      <div className="bg-[#131C2E] p-2.5 rounded-xl border border-red-900/40 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-400">Critical Zones</p>
          <p className="text-2xl font-extrabold text-red-500 mt-0.5">{s.critical_zones}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 animate-pulse">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Active Dispatches */}
      <div className="bg-[#131C2E] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-400">Active Dispatches</p>
          <p className="text-2xl font-extrabold text-white mt-0.5">{s.active_dispatches}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Truck className="w-5 h-5" />
        </div>
      </div>

      {/* 5. Active Alerts */}
      <div className="bg-[#131C2E] p-2.5 rounded-xl border border-amber-900/40 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-400">Active Alerts</p>
          <p className="text-2xl font-extrabold text-amber-400 mt-0.5">{s.active_alerts}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Bell className="w-5 h-5" />
        </div>
      </div>

      {/* 6. Current Weather */}
      <div className="bg-[#131C2E] p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2.5">
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
          <CloudRain className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <p className="text-[10px] font-semibold text-slate-400">Current Weather</p>
        
<p className="text-xs font-bold text-slate-100 truncate">
  {stats?.weather?.replace(/^\d+\.?\d*\s*mm\/hr\s*/, '') || 'Weather data unavailable'}
</p>
<p className="text-[10px] text-blue-400 font-medium">
  {stats?.weather?.match(/^\d+\.?\d*\s*mm\/hr/)?.[0] || '--'} • Simulated Data
</p>

        </div>
      </div>

      {/* 7. State Overview Risk Gauge */}
      <div className="bg-[#131C2E] p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-400">State Overview</span>
          <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
            
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-1 my-1">
          <div className="h-2 rounded-l bg-emerald-500"></div>
          <div className="h-2 bg-yellow-500"></div>
          <div className="h-2 rounded-r bg-red-500 border-2 border-white/60"></div>
        </div>
        <p className="text-[9px] text-slate-400 text-center italic">"Prepared Today for a Safer Tomorrow"</p>
      </div>
    </div>
  );
}
