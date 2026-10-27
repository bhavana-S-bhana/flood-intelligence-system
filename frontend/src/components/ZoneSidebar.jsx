import React from 'react';
import { MapPin, ChevronRight, AlertTriangle, Clock } from 'lucide-react';

export default function ZoneSidebar({ zones, selectedZoneId, onSelectZone, alerts }) {
  const zoneList = zones ? Object.values(zones) : [
    { id: 'Z1', name: 'North Kerala (Kasaragod)', severity: 'Medium' },
    { id: 'Z2', name: 'Kannur Region', severity: 'High' },
    { id: 'Z3', name: 'Wayanad', severity: 'Critical' },
    { id: 'Z4', name: 'Malappuram', severity: 'Medium' },
    { id: 'Z5', name: 'Kozhikode', severity: 'Medium' },
    { id: 'Z6', name: 'Thrissur', severity: 'Low' },
    { id: 'Z7', name: 'Ernakulam', severity: 'Medium' },
    { id: 'Z8', name: 'South Kerala (Kottayam - TVM)', severity: 'Low' },
  ];

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  const alertList = alerts || [
    { id: 1, time: '16:40', text: 'Heavy rainfall in Wayanad (130 mm/hr)', severity: 'CRITICAL' },
    { id: 2, time: '15:20', text: 'Water level crossed 2.8 m in Chalakudy puzha', severity: 'HIGH' },
    { id: 3, time: '14:05', text: 'Landslide risk in nearby areas', severity: 'HIGH' },
    { id: 4, time: '12:30', text: 'Road closure - NH 766', severity: 'MEDIUM' },
    { id: 5, time: '11:10', text: 'Increase in river discharge (Bharathapuzha)', severity: 'MEDIUM' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0D1527] border-r border-slate-800 w-full lg:w-72 shrink-0 overflow-y-auto">
      {/* Top Section: Zones of Kerala */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2 mb-2.5 px-1">
          <MapPin className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white tracking-wide">Zones of Kerala</h2>
        </div>

        <div className="space-y-1.5">
          {zoneList.map((z) => {
            const isSelected = selectedZoneId === z.id;
            return (
              <button
                key={z.id}
                onClick={() => onSelectZone(z.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all duration-150 border ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-lg shadow-blue-900/30'
                    : 'bg-[#131C2E] border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-400'}`}></span>
                  <span className="truncate">{z.id} - {z.name}</span>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getSeverityBadge(z.severity)}`}>
                    {z.severity}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Live Alerts */}
      <div className="p-3 flex-1">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            <h2 className="text-sm font-bold text-white tracking-wide">Live Alerts</h2>
          </div>
          <button className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            View All
          </button>
        </div>

        <div className="space-y-2">
          {alertList.map((a) => (
            <div
              key={a.id}
              className="bg-[#131C2E] p-2.5 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{a.time}</span>
                </div>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${
                    a.severity === 'CRITICAL'
                      ? 'bg-red-950/80 text-red-400 border-red-800'
                      : a.severity === 'HIGH'
                      ? 'bg-orange-950/80 text-orange-400 border-orange-800'
                      : 'bg-yellow-950/80 text-yellow-400 border-yellow-800'
                  }`}
                >
                  {a.severity}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-snug font-medium">{a.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
