import React from 'react';
import { Truck, Activity, Sparkles, Server, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export default function Navbar({
  backendOnline,
  activeAlgorithm,
  onAlgorithmChange,
  onQuickOptimize,
  isOptimizing,
  nodeCount
}) {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Project Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950">
            <Truck className="w-5 h-5 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Smart City Garbage Route Optimizer
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                DAA Project
              </span>
            </div>
            <p className="text-xs text-slate-400">
              TSP Optimization • Brute Force vs Branch & Bound
            </p>
          </div>
        </div>

        {/* Right side status badges & actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Backend Status indicator */}
          <div
            title={backendOnline ? "Express API backend connected on port 5000" : "Using local in-browser calculation engine"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
              backendOnline
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-amber-950/60 text-amber-300 border-amber-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="font-medium text-[11px] hidden md:inline">
              {backendOnline ? 'Express API (5000)' : 'Client Engine'}
            </span>
          </div>

          {/* Algorithm selector pill */}
          <div className="flex bg-slate-900 border border-slate-700/80 p-0.5 rounded-xl text-xs">
            <button
              onClick={() => onAlgorithmChange('branch-and-bound')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                activeAlgorithm === 'branch-and-bound'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Branch & Bound
            </button>
            <button
              onClick={() => onAlgorithmChange('bruteforce')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                activeAlgorithm === 'bruteforce'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Brute Force
            </button>
          </div>

          {/* Quick optimize CTA */}
          <button
            onClick={onQuickOptimize}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isOptimizing ? 'Optimizing...' : 'Calculate Route'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
