import React, { useState } from 'react';
import {
  Share2,
  Eye,
  EyeOff,
  Truck,
  RotateCcw,
  Sparkles,
  MapPin,
  TrendingDown,
  Info,
  CheckCircle2
} from 'lucide-react';
import GraphCanvas from '../components/GraphCanvas';

export default function GraphVisualizationPage({
  locations,
  distanceMatrix,
  currentResult,
  onOptimize,
  isOptimizing,
  onResetToSample
}) {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(0);

  const n = locations.length;
  const totalRoads = Math.floor((n * (n - 1)) / 2);

  // Calculate total road network length in km
  let totalNetworkKm = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      totalNetworkKm += (distanceMatrix[i] && distanceMatrix[i][j]) || 0;
    }
  }

  const selectedLoc = locations[selectedNodeIndex] || locations[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-xs font-semibold text-emerald-300 mb-2">
            <Share2 className="w-3.5 h-3.5" />
            Graph Topology & Road Network
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Interactive City Ward Route Canvas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Symmetric complete graph representation of the municipal waste collection territory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOptimize('branch-and-bound')}
            disabled={isOptimizing}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>{isOptimizing ? 'Calculating...' : 'Recalculate Tour'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-3">
          <GraphCanvas
            locations={locations}
            distanceMatrix={distanceMatrix}
            optimalRoute={currentResult ? currentResult.routeIndices : null}
            height={560}
          />
        </div>

        {/* Right Info Panel */}
        <div className="space-y-4">
          {/* Network Topology Stats */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 text-xs shadow-xl">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <Info className="w-4 h-4 text-cyan-400" />
              Network Metrics
            </h3>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Total Locations (Vertices):</span>
                <span className="font-mono font-bold text-white">{n}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Total Roads (Edges):</span>
                <span className="font-mono font-bold text-cyan-400">{totalRoads}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Total Road Network:</span>
                <span className="font-mono font-bold text-slate-300">{totalNetworkKm} km</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Optimal TSP Cycle:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {currentResult ? `${currentResult.optimalDistance} km` : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Graph Completeness:</span>
                <span className="font-mono font-bold text-amber-300">Complete K_{n}</span>
              </div>
            </div>
          </div>

          {/* Node Inspector */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 text-xs shadow-xl">
            <h3 className="font-bold text-white text-sm flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Location Inspector
              </span>
              <select
                value={selectedNodeIndex}
                onChange={(e) => setSelectedNodeIndex(parseInt(e.target.value, 10))}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
              >
                {locations.map((loc, idx) => (
                  <option key={idx} value={idx}>
                    {idx === 0 ? 'HQ: ' : ''}{loc.name}
                  </option>
                ))}
              </select>
            </h3>

            {selectedLoc && (
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="font-bold text-slate-100 text-sm">{selectedLoc.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {selectedLoc.isOffice || selectedNodeIndex === 0
                      ? 'Central Municipal Depot & Vehicle Dispatch Center'
                      : `Bin Type: ${selectedLoc.binType || 'General Waste'} • Capacity: ${selectedLoc.wasteCapacityKg || 400} kg`}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Direct Road Distances from {selectedLoc.name}:
                  </span>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {locations.map((otherLoc, otherIdx) => {
                      if (otherIdx === selectedNodeIndex) return null;
                      const dist = distanceMatrix[selectedNodeIndex] ? distanceMatrix[selectedNodeIndex][otherIdx] : 0;
                      return (
                        <div
                          key={otherIdx}
                          className="flex items-center justify-between p-1.5 bg-slate-950/50 rounded-lg text-[11px] border border-slate-800/60"
                        >
                          <span className="text-slate-300 truncate max-w-[130px]">{otherLoc.name}</span>
                          <span className="font-mono text-emerald-400 font-semibold">{dist} km</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
