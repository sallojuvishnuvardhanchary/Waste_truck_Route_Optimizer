import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  GitCompare,
  Share2,
  PlayCircle,
  BookOpen,
  Award,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, nodeCount, hasResult }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'planner', label: 'Route Planner', icon: MapPin, badge: `${nodeCount} Locs` },
    { id: 'comparison', label: 'Algorithm Comparison', icon: GitCompare, badge: 'BF vs B&B' },
    { id: 'graph', label: 'Graph Visualization', icon: Share2, badge: null },
    { id: 'simulation', label: 'Step-by-Step Sim', icon: PlayCircle, badge: 'Live Tree' },
    { id: 'education', label: 'DAA Concepts & Viva', icon: BookOpen, badge: 'Theory' },
    { id: 'results', label: 'Route Results', icon: Award, badge: hasResult ? 'Ready' : null }
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-950/60 border-r border-slate-800/80 p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0">
      <div className="hidden md:block px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        Navigation
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition whitespace-nowrap md:whitespace-normal group ${
              isActive
                ? 'bg-gradient-to-r from-emerald-600/90 to-teal-600/80 text-white shadow-lg shadow-emerald-950/50'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
              }`} />
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                isActive
                  ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      <div className="hidden md:block mt-auto p-3 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          DAA Lab Focus
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Demonstrates Travelling Salesperson Problem (TSP) through Exhaustive Search and Branch & Bound State Space Pruning.
        </p>
      </div>
    </aside>
  );
}
