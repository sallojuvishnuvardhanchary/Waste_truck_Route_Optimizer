import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Zap,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { compareAlgorithms } from '../services/api';

export default function AlgorithmComparison({
  locations,
  distanceMatrix,
  onRunOptimization
}) {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const n = locations.length;

  const runComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await compareAlgorithms(locations, distanceMatrix);
      setComparisonData(data);
    } catch (err) {
      setError(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runComparison();
  }, [locations, distanceMatrix]);

  const bf = comparisonData?.bruteForce;
  const bnb = comparisonData?.branchAndBound;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-xs font-semibold text-cyan-300 mb-2">
            <GitCompare className="w-3.5 h-3.5" />
            DAA Core Benchmarking
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Exhaustive Brute Force vs Branch and Bound Optimization
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Side-by-side empirical performance evaluation for finding the minimum-cost garbage collection Hamiltonian cycle.
          </p>
        </div>

        <button
          onClick={runComparison}
          disabled={loading}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{loading ? 'Running Benchmark...' : 'Rerun Comparison'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-2xl text-xs text-red-300">
          {error}
        </div>
      )}

      {comparisonData?.warning && (
        <div className="p-4 bg-amber-950/60 border border-amber-800 rounded-2xl flex items-center gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{comparisonData.warning}</span>
        </div>
      )}

      {/* Verification Badge */}
      {comparisonData?.distanceMatches && bf && bnb && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-300 shadow-md">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-200 block text-sm">
                Algorithm Correctness Verified: 100% Agreement
              </span>
              <span>
                Both Brute Force and Branch & Bound returned the exact same optimal distance: <strong>{bnb.optimalDistance} km</strong>.
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-emerald-900/60 border border-emerald-700 font-mono text-emerald-300 rounded-lg text-xs font-semibold">
            Distance: {bnb.optimalDistance} km
          </span>
        </div>
      )}

      {/* Main Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Direct Algorithmic Metrics Comparison Table
          </h3>
          <span className="text-xs text-slate-400 font-mono">Graph Size: {n} Locations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="p-3.5 font-semibold">Evaluation Metric</th>
                <th className="p-3.5 font-bold text-cyan-300 bg-cyan-950/20">Brute Force (Exhaustive)</th>
                <th className="p-3.5 font-bold text-emerald-300 bg-emerald-950/20">Branch and Bound (Pruning)</th>
                <th className="p-3.5 font-semibold text-slate-300">Algorithmic Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {/* Row 1: Optimal Distance */}
              <tr className="hover:bg-slate-800/30 transition">
                <td className="p-3.5 font-medium text-slate-300">Optimal Distance</td>
                <td className="p-3.5 font-mono font-bold text-white bg-cyan-950/10">
                  {bf ? `${bf.optimalDistance} km` : 'Skipped (Safety)'}
                </td>
                <td className="p-3.5 font-mono font-bold text-emerald-400 bg-emerald-950/10">
                  {bnb ? `${bnb.optimalDistance} km` : '...'}
                </td>
                <td className="p-3.5 text-emerald-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Exact Same Optimal Route
                </td>
              </tr>

              {/* Row 2: Routes Generated */}
              <tr className="hover:bg-slate-800/30 transition">
                <td className="p-3.5 font-medium text-slate-300">Total Routes Considered</td>
                <td className="p-3.5 font-mono text-cyan-200 bg-cyan-950/10">
                  {bf ? bf.totalRoutesGenerated.toLocaleString() : `(${n}-1)!`}
                </td>
                <td className="p-3.5 font-mono text-emerald-200 bg-emerald-950/10">
                  {bnb ? bnb.totalRoutesGenerated.toLocaleString() : '...'}
                </td>
                <td className="p-3.5 text-slate-400">
                  Branch & Bound considers partial paths rather than full leaves
                </td>
              </tr>

              {/* Row 3: Routes Actually Evaluated */}
              <tr className="hover:bg-slate-800/30 transition">
                <td className="p-3.5 font-medium text-slate-300">Full Leaf Tours Evaluated</td>
                <td className="p-3.5 font-mono text-cyan-200 bg-cyan-950/10">
                  {bf ? bf.routesEvaluated.toLocaleString() : `(${n}-1)!`}
                </td>
                <td className="p-3.5 font-mono font-bold text-emerald-300 bg-emerald-950/10">
                  {bnb ? bnb.routesEvaluated.toLocaleString() : '...'}
                </td>
                <td className="p-3.5 text-emerald-400 font-semibold">
                  {bf && bnb ? `${Math.round(((bf.routesEvaluated - bnb.routesEvaluated) / bf.routesEvaluated) * 100)}% Fewer Complete Tours` : 'Drastic Reduction'}
                </td>
              </tr>

              {/* Row 4: Nodes Explored */}
              <tr className="hover:bg-slate-800/30 transition">
                <td className="p-3.5 font-medium text-slate-300">Search Nodes Explored</td>
                <td className="p-3.5 font-mono text-cyan-200 bg-cyan-950/10">
                  {bf ? bf.nodesExplored.toLocaleString() : 'Factorial'}
                </td>
                <td className="p-3.5 font-mono font-bold text-emerald-300 bg-emerald-950/10">
                  {bnb ? bnb.nodesExplored.toLocaleString() : '...'}
                </td>
                <td className="p-3.5 text-cyan-300 font-semibold">
                  {comparisonData?.efficiencyRatio ? `${comparisonData.efficiencyRatio}x Search Tree Compression` : 'High Savings'}
                </td>
              </tr>

              {/* Row 5: Branches Pruned */}
              <tr className="hover:bg-slate-800/30 transition">
                <td className="p-3.5 font-medium text-slate-300">Subtree Branches Pruned</td>
                <td className="p-3.5 font-mono text-slate-500 bg-cyan-950/10">
                  0 (Exhaustive; No Pruning)
                </td>
                <td className="p-3.5 font-mono font-bold text-rose-400 bg-emerald-950/10">
                  {bnb ? `${bnb.branchesPruned} Subtrees Pruned` : '...'}
                </td>
                <td className="p-3.5 text-rose-300">
                  {bnb?.branchesPruned > 0 ? `Cut off ${bnb.branchesPruned} invalid/inferior subtrees` : 'Pruning active'}
                </td>
              </tr>

              {/* Row 6: Execution Time */}
              <tr className="hover:bg-slate-800/30 transition">
                <td className="p-3.5 font-medium text-slate-300">Execution Time (ms)</td>
                <td className="p-3.5 font-mono text-cyan-200 bg-cyan-950/10">
                  {bf ? `${bf.executionTimeMs} ms` : 'N/A'}
                </td>
                <td className="p-3.5 font-mono font-bold text-emerald-300 bg-emerald-950/10">
                  {bnb ? `${bnb.executionTimeMs} ms` : '...'}
                </td>
                <td className="p-3.5 text-slate-300 font-medium">
                  {bf && bnb && bf.executionTimeMs > bnb.executionTimeMs
                    ? `${(bf.executionTimeMs / Math.max(0.01, bnb.executionTimeMs)).toFixed(1)}x faster`
                    : 'Near instantaneous'}
                </td>
              </tr>

              {/* Row 7: Time Complexity */}
              <tr className="hover:bg-slate-800/30 transition">
                <td className="p-3.5 font-medium text-slate-300">Time Complexity</td>
                <td className="p-3.5 font-mono text-xs text-cyan-300 bg-cyan-950/10">
                  O((n - 1)! * n)
                </td>
                <td className="p-3.5 font-mono text-xs text-emerald-300 bg-emerald-950/10">
                  Worst-case: O((n - 1)!), Average: O(c^n) where c &lt; n
                </td>
                <td className="p-3.5 text-slate-400">
                  Bounding function eliminates unproductive branches early
                </td>
              </tr>

              {/* Row 8: Space Complexity */}
              <tr className="hover:bg-slate-800/30 transition">
                <td className="p-3.5 font-medium text-slate-300">Space Complexity</td>
                <td className="p-3.5 font-mono text-xs text-cyan-300 bg-cyan-950/10">
                  O(n) [Recursion Stack]
                </td>
                <td className="p-3.5 font-mono text-xs text-emerald-300 bg-emerald-950/10">
                  O(n) [DFS Stack] or O(b * d)
                </td>
                <td className="p-3.5 text-slate-400">
                  Both use linear memory proportional to graph vertices
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Bar Comparisons */}
      {bf && bnb && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visual: Nodes / Routes Explored Bar */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Explored Search Space Comparison
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Brute Force (Evaluations):</span>
                  <span className="font-mono text-cyan-400 font-bold">{bf.routesEvaluated.toLocaleString()}</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-cyan-500 rounded-full w-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Branch & Bound (Nodes Explored):</span>
                  <span className="font-mono text-emerald-400 font-bold">{bnb.nodesExplored.toLocaleString()}</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(4, Math.min(100, (bnb.nodesExplored / bf.routesEvaluated) * 100))}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Branch & Bound explored only <strong>{bnb.nodesExplored}</strong> nodes compared to <strong>{bf.routesEvaluated}</strong> routes in Brute Force.
            </p>
          </div>

          {/* Visual: Pruning Efficiency Gauge */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-400" />
              Branch Pruning Activity
            </h4>

            <div className="flex items-center justify-around py-2">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-rose-400 block font-mono">
                  {bnb.branchesPruned}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Subtrees Pruned</span>
              </div>

              <div className="h-10 w-px bg-slate-800"></div>

              <div className="text-center">
                <span className="text-3xl font-extrabold text-emerald-400 block font-mono">
                  {comparisonData?.efficiencyRatio ? `${comparisonData.efficiencyRatio}x` : '—'}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Pruning Multiplier</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-400 leading-relaxed">
              Whenever a partial route's admissible lower bound is greater than or equal to the current best tour distance, the entire child subtree is pruned immediately.
            </div>
          </div>
        </div>
      )}

      {/* DAA Academic Disclaimer & Nuance */}
      <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
        <div className="font-bold text-amber-400 flex items-center gap-2">
          <span>⚠️</span> Important DAA Concept for Viva: Bounding Performance Nuance
        </div>
        <p className="text-slate-300 leading-relaxed">
          Do <strong>not</strong> claim that Branch and Bound always has a fixed polynomial or universally superior worst-case time complexity.
          In the theoretical worst-case (for example, an adversarial matrix where every branch produces identical lower bounds),
          pruning cannot occur and the complexity reverts to <span className="font-mono text-cyan-300">O((n - 1)!)</span>.
        </p>
        <p className="text-slate-400 leading-relaxed">
          However, in municipal road networks with triangle inequality and non-uniform distance distributions,
          an admissible bounding function (such as degree-2 relaxation) prunes between <strong>60% to 90%+</strong> of the search tree,
          yielding massive practical performance gains while strictly preserving mathematical optimality.
        </p>
      </div>
    </div>
  );
}
