import React, { useState } from 'react';
import { MapPin, Heart, Video, LifeBuoy, Ambulance, Pill, Droplet, Tent, CheckCircle2, Clock } from 'lucide-react';

export default function RightDetailPanel({ zone, allocatedResources, dispatches }) {
  const [activeTab, setActiveTab] = useState('resources');

  const z = zone || {
    id: 'Z3',
    name: 'Wayanad',
    severity: 'Critical',
    composite_risk_score: 0.87,
    water_level_m: 2.8,
    population_at_risk: 18420,
    affected_villages: 12,
    rainfall_24h_mm: 220,
    status_text: 'Heavy rainfall; possible landslides'
  };

  const defaultAllocations = [
    { id: 'boats', name: 'Rescue Boats', icon: LifeBuoy, iconEmoji: '🚤', count: 6, allocated: 4, total: 6, percentage: 67, status: 'En Route', color: 'text-blue-400' },
    { id: 'medical', name: 'Medical Teams', icon: Ambulance, iconEmoji: '🚑', count: 4, allocated: 4, total: 4, percentage: 100, status: 'En Route', color: 'text-red-400' },
    { id: 'medicines', name: 'Medicines', icon: Pill, iconEmoji: '💊', count: 200, allocated: 120, total: 200, percentage: 60, status: 'Dispatched', color: 'text-indigo-400' },
    { id: 'pumps', name: 'Water Pumps', icon: Droplet, iconEmoji: '💧', count: 2, allocated: 1, total: 2, percentage: 50, status: 'En Route', color: 'text-cyan-400' },
    { id: 'shelters', name: 'Relief Shelters', icon: Tent, iconEmoji: '⛺', count: 1, allocated: 0, total: 1, percentage: 0, status: 'Preparing', color: 'text-amber-400' },
  ];

  const defaultDispatches = dispatches || [
    { time: '16:30', resource: 'Rescue Boats', quantity: 4, from_depot: 'D1 (Kochi)', status: 'En Route' },
    { time: '15:52', resource: 'Medical Teams', quantity: 4, from_depot: 'D1 (Kochi)', status: 'En Route' },
    { time: '15:35', resource: 'Medicines', quantity: 200, from_depot: 'D1 (Kochi)', status: 'Dispatched' },
    { time: '15:27', resource: 'Water Pumps', quantity: 2, from_depot: 'D1 (Kochi)', status: 'En Route' },
    { time: '15:20', resource: 'Relief Shelters', quantity: 1, from_depot: 'D1 (Kochi)', status: 'En Route' }
  ];

  return (
    <div className="w-full lg:w-80 h-full bg-[#0D1527] border-l border-slate-800 shrink-0 overflow-y-auto flex flex-col p-3 space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-red-500" />
          <h2 className="text-base font-extrabold text-white tracking-tight">{z.id} - {z.name}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span
  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
    z.severity === 'Critical'
      ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
      : z.severity === 'High'
      ? 'bg-orange-950 text-orange-400 border-orange-800'
      : z.severity === 'Medium'
      ? 'bg-yellow-950 text-yellow-400 border-yellow-800'
      : 'bg-emerald-950 text-emerald-400 border-emerald-800'
  }`}
>
  {z.severity?.toUpperCase() || 'UNKNOWN'} RISK
</span>
          <button className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 transition-colors">
            <Heart className="w-3.5 h-3.5" />
            <span>Follow</span>
          </button>
        </div>
      </div>

      {/* Live View Thumbnail Card */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-md group">
        <img
          src="https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=600&auto=format&fit=crop"
          alt="Kerala Flood Live View"
          className="w-full h-32 object-cover brightness-75 group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        <div className="absolute bottom-2 left-2 flex items-center space-x-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-white border border-white/10">
          <Video className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span>Live View</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#131C2E] p-2 rounded-lg border border-slate-800">
          <p className="text-[10px] text-slate-400 font-semibold">Current Water Level</p>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <p className="text-base font-black text-white">{z.water_level_m} m</p>
            <span className="text-[10px] text-red-400 font-bold">↑ 0.5 m</span>
          </div>
        </div>

        <div className="bg-[#131C2E] p-2 rounded-lg border border-slate-800">
          <p className="text-[10px] text-slate-400 font-semibold">Risk Score</p>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <p className="text-base font-black text-red-500">{z.composite_risk_score}</p>
            <span className="text-[10px] text-red-400 font-bold">↑ 0.22</span>
          </div>
        </div>

        <div className="bg-[#131C2E] p-2 rounded-lg border border-slate-800">
          <p className="text-[10px] text-slate-400 font-semibold">Population at Risk</p>
          <p className="text-sm font-extrabold text-white mt-0.5">{z.population_at_risk?.toLocaleString() || '18,420'}</p>
        </div>

        <div className="bg-[#131C2E] p-2 rounded-lg border border-slate-800">
          <p className="text-[10px] text-slate-400 font-semibold">Affected Villages</p>
          <p className="text-sm font-extrabold text-white mt-0.5">{z.affected_villages || 12}</p>
        </div>

        <div className="col-span-2 bg-[#131C2E] p-2 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Rainfall (last 24h)</p>
            <p className="text-xs font-extrabold text-blue-400">{z.rainfall_24h_mm || 220} mm</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-semibold">Status</p>
            <p className="text-[10px] text-amber-400 font-bold truncate max-w-[140px]">{z.status_text}</p>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs">
        {['resources', 'dispatches', 'weather', 'images'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 font-bold capitalize transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-blue-500 text-blue-400 bg-blue-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Resources Allocated to Z3 Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white">Resources Allocated to {z.id}</h3>
          <button className="text-[10px] text-blue-400 hover:underline">View Details</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {defaultAllocations.map((res) => (
            <div key={res.id} className="bg-[#131C2E] p-2 rounded-lg border border-slate-800/90 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-base">{res.iconEmoji}</span>
                <span className="text-base font-black text-white">{res.count}</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-300 mt-1">{res.name}</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full my-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${res.percentage}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[9px]">
                <span className="text-slate-400">{res.allocated}/{res.total} <span className="text-blue-400 font-bold">{res.percentage}%</span></span>
                <div className="flex items-center space-x-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${res.status === 'Preparing' ? 'bg-amber-400' : res.status === 'Dispatched' ? 'bg-blue-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                  <span className="text-slate-300 font-medium">{res.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Dispatches Table */}
      <div className="flex-1 space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white">Recent Dispatches ({z.id})</h3>
          <button className="text-[10px] text-blue-400 hover:underline">View All</button>
        </div>

        <div className="bg-[#131C2E] rounded-lg border border-slate-800 overflow-hidden text-[11px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[10px]">
                <th className="py-1.5 px-2">Time</th>
                <th className="py-1.5 px-2">Resource</th>
                <th className="py-1.5 px-2">Qty</th>
                <th className="py-1.5 px-2">From Depot</th>
                <th className="py-1.5 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {defaultDispatches.map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-1.5 px-2 text-slate-400 text-[10px]">{d.time}</td>
                  <td className="py-1.5 px-2 font-semibold text-white truncate max-w-[80px]">{d.resource}</td>
                  <td className="py-1.5 px-2 font-bold text-amber-400">{d.quantity}</td>
                  <td className="py-1.5 px-2 text-slate-300 text-[10px]">{d.from_depot}</td>
                  <td className="py-1.5 px-2">
                    <span className="flex items-center space-x-1 text-[10px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'Dispatched' ? 'bg-blue-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                      <span className="font-medium">{d.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
