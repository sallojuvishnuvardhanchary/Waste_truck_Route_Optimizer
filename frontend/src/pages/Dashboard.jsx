import React from 'react';
import {
  MapPin,
  Route,
  Zap,
  TrendingDown,
  Sparkles,
  GitCompare,
  PlayCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Truck
} from 'lucide-react';
import QuickStatsCard from '../components/QuickStatsCard';
import GraphCanvas from '../components/GraphCanvas';

export default function Dashboard({
  locations,
  distanceMatrix,
  activeAlgorithm,
  currentResult,
  onAlgorithmChange,
  onOptimize,
  isOptimizing,
  onNavigateTab,
  onResetToSample
}) {
  const n = locations.length;
  const roadCount = Math.floor((n * (n - 1)) / 2);

  // Theoretical permutations
  let permutationsCount = 1;
  for (let i = 2; i < n; i++) permutationsCount *= i;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-900/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-xs font-semibold text-emerald-300 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Design and Analysis of Algorithms (DAA) Project
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            Smart City Garbage Collection Route Optimization
          </h2>

          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Finding the minimum-cost Hamiltonian cycle for a municipal waste collection vehicle.
            Starting from the <strong>Municipal Office (Depot)</strong>, visiting every garbage collection point
            exactly once, and returning to the Municipal Office with minimum travel distance.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOptimize('branch-and-bound')}
              disabled={isOptimizing}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Optimize with Branch & Bound</span>
            </button>

            <button
              onClick={() => onNavigateTab('comparison')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition flex items-center gap-2 border border-slate-700"
            >
              <GitCompare className="w-4 h-4 text-cyan-400" />
              <span>Compare BF vs B&B</span>
            </button>

            <button
              onClick={() => onNavigateTab('simulation')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition flex items-center gap-2 border border-slate-700"
            >
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <span>Live Step-by-Step Simulation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatsCard
          title="Locations in Ward"
          value={n}
          subtitle={`1 Municipal Office + ${n - 1} Collection Points`}
          icon={MapPin}
          color="emerald"
          badge="Complete Graph"
        />

        <QuickStatsCard
          title="Road Segments"
          value={roadCount}
          subtitle="Bidirectional symmetric roads"
          icon={Route}
          color="cyan"
          badge={`${roadCount * 2} directed edges`}
        />

        <QuickStatsCard
          title="Optimal Travel Distance"
          value={currentResult ? `${currentResult.optimalDistance} km` : 'Pending'}
          subtitle={currentResult ? `Found via ${currentResult.algorithm}` : 'Click Calculate to solve'}
          icon={TrendingDown}
          color="amber"
          badge={currentResult ? 'Globally Optimal' : null}
        />

        <QuickStatsCard
          title="Permutation Search Space"
          value={permutationsCount.toLocaleString()}
          subtitle={`(n - 1)! = (${n} - 1)! possible routes`}
          icon={Zap}
          color="purple"
          badge={`O((n-1)!)`}
        />
      </div>

      {/* Main Content Split: Graph Canvas Preview + Route Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Graph Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Live City Ward Visualization
            </h3>
            <span className="text-xs text-slate-400">
              Interactive HTML5 Canvas • High-DPI Enabled
            </span>
          </div>

          <GraphCanvas
            locations={locations}
            distanceMatrix={distanceMatrix}
            optimalRoute={currentResult ? currentResult.routeIndices : null}
            height={460}
          />
        </div>

        {/* Right 1 Col: Current Route Details & Viva Quick Info */}
        <div className="space-y-4">
          {/* Active Optimal Tour Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400" />
                Active Tour Breakdown
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                {currentResult ? currentResult.algorithm : 'Default Sample'}
              </span>
            </div>

            {currentResult ? (
              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-[11px] text-slate-400">Optimal Cycle Sequence:</span>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                    {currentResult.routeNames.map((name, idx) => (
                      <React.Fragment key={idx}>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          idx === 0 || idx === currentResult.routeNames.length - 1
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                            : 'bg-slate-900 text-sky-300 border border-slate-700'
                        }`}>
                          {name}
                        </span>
                        {idx < currentResult.routeNames.length - 1 && (
                          <span className="text-slate-600 text-xs font-bold">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Total Distance</span>
                    <span className="text-emerald-400 font-bold text-base">{currentResult.optimalDistance} km</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Execution Time</span>
                    <span className="text-cyan-400 font-bold text-base">{currentResult.executionTimeMs} ms</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Nodes Explored</span>
                    <span className="text-white font-bold text-base">{currentResult.nodesExplored}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Branches Pruned</span>
                    <span className="text-rose-400 font-bold text-base">{currentResult.branchesPruned || 0}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('results')}
                  className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition text-center"
                >
                  View Full Optimization Report →
                </button>
              </div>
            ) : (
              <div className="mt-6 text-center py-6">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No route optimized yet.</p>
                <button
                  onClick={() => onOptimize('branch-and-bound')}
                  className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
                >
                  Compute Optimal Route
                </button>
              </div>
            )}
          </div>

          {/* DAA College Viva Spotlight */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <span>🎓</span> DAA Viva Quick Pointer
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Why use <strong>Branch and Bound</strong> over <strong>Brute Force</strong>?
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              While Brute Force blindly checks all <span className="font-mono text-emerald-400">(n-1)!</span> routes,
              Branch and Bound computes an admissible lower bound at each state node.
              If <span className="font-mono text-cyan-300">Lower Bound ≥ Current Best</span>, the entire branch is discarded without recursion,
              guaranteeing the same optimal answer in a fraction of steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
