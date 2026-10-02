import React from 'react';
import {
  Award,
  Truck,
  TrendingDown,
  Clock,
  Zap,
  CheckCircle2,
  FileDown,
  Printer,
  RotateCcw,
  Sparkles,
  MapPin,
  Leaf
} from 'lucide-react';

export default function ResultsPage({
  locations,
  distanceMatrix,
  currentResult,
  onOptimize,
  isOptimizing,
  onNavigateTab
}) {
  if (!currentResult) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-2xl space-y-4">
        <Award className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-white">No Route Calculated Yet</h3>
        <p className="text-xs text-slate-400">
          Run the Branch & Bound or Brute Force optimization to generate the full municipal route audit report.
        </p>
        <button
          onClick={() => onOptimize('branch-and-bound')}
          disabled={isOptimizing}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
        >
          {isOptimizing ? 'Optimizing...' : 'Calculate Optimal Route'}
        </button>
      </div>
    );
  }

  // Calculate leg-by-leg breakdown
  const legs = [];
  let cumulativeDist = 0;
  let totalWasteCollected = 0;

  for (let i = 0; i < currentResult.routeIndices.length - 1; i++) {
    const fromIdx = currentResult.routeIndices[i];
    const toIdx = currentResult.routeIndices[i + 1];
    const fromLoc = locations[fromIdx];
    const toLoc = locations[toIdx];
    const dist = distanceMatrix[fromIdx] ? distanceMatrix[fromIdx][toIdx] : 0;
    cumulativeDist += dist;
    totalWasteCollected += (toLoc.wasteCapacityKg || 0);

    legs.push({
      legNumber: i + 1,
      fromName: fromLoc.name,
      toName: toLoc.name,
      distanceKm: dist,
      cumulativeKm: cumulativeDist,
      toLocType: toLoc.binType || 'General',
      toLocWaste: toLoc.wasteCapacityKg || 0
    });
  }

  // Fuel & CO2 savings estimation vs worst/naive tour
  const estimatedFuelLiters = (currentResult.optimalDistance * 0.35).toFixed(1);
  const estimatedCO2Kg = (currentResult.optimalDistance * 0.92).toFixed(1);

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `garbage_route_optimization_${currentResult.algorithm.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-xs font-semibold text-emerald-300 mb-2">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            Optimization Manifest & Audit
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Municipal Garbage Collection Route Manifest
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global minimum TSP Hamiltonian Cycle validated by {currentResult.algorithm}.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Manifest</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            Total Route Travel
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {currentResult.optimalDistance} km
          </div>
          <span className="text-[11px] text-slate-500">Minimum possible cycle</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Computational Run Time
          </span>
          <div className="text-2xl font-black text-cyan-400 font-mono">
            {currentResult.executionTimeMs} ms
          </div>
          <span className="text-[11px] text-slate-500">Algorithm execution time</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            Branches Pruned
          </span>
          <div className="text-2xl font-black text-rose-400 font-mono">
            {currentResult.branchesPruned || 0}
          </div>
          <span className="text-[11px] text-slate-500">{currentResult.nodesExplored} nodes visited</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            Est. Fuel & Emissions
          </span>
          <div className="text-2xl font-black text-white font-mono">
            {estimatedFuelLiters} L
          </div>
          <span className="text-[11px] text-slate-500">~{estimatedCO2Kg} kg CO₂ footprint</span>
        </div>
      </div>

      {/* Route Cycle Visual Ribbon */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Full Dispatch Sequence (Office ➔ Points ➔ Office)
        </span>

        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
          {currentResult.routeNames.map((name, idx) => (
            <React.Fragment key={idx}>
              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                idx === 0 || idx === currentResult.routeNames.length - 1
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800 shadow-sm'
                  : 'bg-slate-900 text-sky-300 border border-slate-700'
              }`}>
                {idx === 0 ? '🏢 ' : (idx === currentResult.routeNames.length - 1 ? '🏁 ' : '🗑️ ')}
                <span>{name}</span>
              </div>
              {idx < currentResult.routeNames.length - 1 && (
                <span className="text-slate-600 font-bold text-sm">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Leg-by-Leg Turn-by-Turn Manifest Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            Turn-by-Turn Collection Legs
          </h3>
          <span className="text-xs text-slate-400">Total Legs: {legs.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="p-3.5 font-semibold">Leg #</th>
                <th className="p-3.5 font-semibold">Origin</th>
                <th className="p-3.5 font-semibold">Destination</th>
                <th className="p-3.5 font-semibold">Bin Category</th>
                <th className="p-3.5 font-semibold">Leg Distance</th>
                <th className="p-3.5 font-semibold">Cumulative Distance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {legs.map((leg) => (
                <tr key={leg.legNumber} className="hover:bg-slate-800/30 transition">
                  <td className="p-3.5 font-mono font-bold text-slate-500">#{leg.legNumber}</td>
                  <td className="p-3.5 font-semibold text-slate-200">{leg.fromName}</td>
                  <td className="p-3.5 font-semibold text-emerald-400">{leg.toName}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {leg.toLocType}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-slate-200">{leg.distanceKm} km</td>
                  <td className="p-3.5 font-mono font-bold text-cyan-300">{leg.cumulativeKm} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
