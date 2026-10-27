import React from 'react';
import { Waves, LayoutDashboard, Activity, Map, Truck, FileText, Settings, Bell, Shield } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-data', label: 'Live Data', icon: Activity },
    { id: 'zones', label: 'Zones', icon: Map },
    { id: 'allocation', label: 'Resource Allocation', icon: Truck },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <header className="bg-[#0D1527] border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between shadow-lg sticky top-0 z-50">
      {/* Brand Title & Motto */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
          <Waves className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-wide">Kerala Flood Intelligence System</h1>
          </div>
          <p className="text-xs text-blue-400 font-medium tracking-wider uppercase">
            Predict • Plan • Allocate • Save Lives
          </p>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <nav className="flex items-center space-x-1 bg-[#111A2E] p-1 rounded-lg border border-slate-800 my-1 md:my-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setActiveTab('settings')}
          className={`p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 ${
            activeTab === 'settings' ? 'bg-blue-600 text-white' : ''
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </nav>

      {/* Right End Status & System Info */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              4
            </span>
          </button>
        </div>

        {/* System Active Status Pill */}
        <div className="flex items-center space-x-2 text-xs bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block"></span>
          <span className="font-semibold text-emerald-400">System Active</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">08 Sep 2026, 17:25</span>
        </div>

        {/* Motto Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-blue-950/40 text-blue-300 text-xs px-3 py-1.5 rounded-lg border border-blue-900/50 italic">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>"Prepared Today for a Safer Tomorrow"</span>
        </div>
      </div>
    </header>
  );
}
