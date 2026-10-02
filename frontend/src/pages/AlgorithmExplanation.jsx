import React, { useState } from 'react';
import {
  BookOpen,
  Cpu,
  Layers,
  Zap,
  TrendingDown,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileCode2,
  GitBranch
} from 'lucide-react';

export default function AlgorithmExplanation() {
  const [openVivaId, setOpenVivaId] = useState(null);

  const toggleViva = (id) => {
    setOpenVivaId(openVivaId === id ? null : id);
  };

  const vivaQuestions = [
    {
      id: 1,
      q: "What is the Travelling Salesperson Problem (TSP), and how is it mapped to this Garbage Collection System?",
      a: "TSP asks for the shortest possible route that visits every city in a given set exactly once and returns to the origin city. In our Smart City project: the Municipal Office is the starting/ending depot (vertex 0), every waste collection point is an intermediate vertex that must be visited exactly once, and roads are weighted edges representing travel distance in kilometers. The goal is to minimize total fuel/distance."
    },
    {
      id: 2,
      q: "Why is TSP classified as NP-hard?",
      a: "TSP is NP-hard because there is no known polynomial-time algorithm (such as O(n^k)) that can find the exact optimal tour for all general instances. An exhaustive verification takes polynomial time, but finding the minimum Hamiltonian cycle requires searching among (n - 1)! possible permutations in the worst case."
    },
    {
      id: 3,
      q: "How does the Brute Force algorithm work for TSP, and what is its time and space complexity?",
      a: "Brute Force keeps the Municipal Office fixed at index 0, recursively generates all permutations of the remaining (n - 1) collection points using backtracking, sums the edge weights along each permutation plus the return leg to node 0, and retains the minimum. Time Complexity is O((n - 1)! * n) because there are (n - 1)! permutations and summing n road distances takes O(n) per permutation. Space Complexity is O(n) for the recursive call stack depth."
    },
    {
      id: 4,
      q: "What is Branch and Bound, and how does it optimize the search?",
      a: "Branch and Bound is a state-space search paradigm. 'Branching' divides a problem into smaller subproblems (choosing the next city to visit). 'Bounding' computes a mathematically guaranteed lower bound on the completion cost of any tour starting with that partial path. If the lower bound is greater than or equal to the current best complete tour found so far, the entire branch is PRUNED, avoiding exponential redundant work."
    },
    {
      id: 5,
      q: "What bounding function is used in this implementation, and why is it admissible?",
      a: "We use the Degree-2 Relaxation / Minimum Incident Edges Bounding Function. In any valid Hamiltonian cycle, every vertex must have degree exactly 2 (one incoming edge and one outgoing edge). For unvisited vertices, the bounding function sums the two smallest valid incident edges; for the path endpoints (current node and start node), it considers the smallest remaining connecting edge. Dividing the total by 2 yields an admissible lower bound because the actual optimal completion can never use edges cheaper than the absolute minimum valid edges available. Hence: Lower Bound <= True Tour Cost (admissibility)."
    },
    {
      id: 6,
      q: "What is the exact condition for pruning a branch?",
      a: "Prune Condition: If LowerBound(partial_path) >= currentBestDistance, the branch is pruned. This is because any valid completion of this partial path will cost AT LEAST LowerBound, which is already worse than or equal to an already discovered complete route. Exploring it further cannot yield a better minimum."
    },
    {
      id: 7,
      q: "Does Branch and Bound guarantee the optimal solution, or is it an approximation/heuristic?",
      a: "Branch and Bound GUARANTEES the exact global optimal solution, just like Brute Force! Unlike greedy heuristics (like Nearest Neighbor) or genetic algorithms that may get stuck in local minima, Branch and Bound only prunes branches that are mathematically proven to be unable to beat the current best solution."
    },
    {
      id: 8,
      q: "Why can't we say Branch and Bound is always O(n^2) or O(n^3)?",
      a: "Because in the theoretical worst-case (such as an adversarial graph where lower bounds are uninformative and pruning never triggers), Branch and Bound must visit all (n - 1)! leaf nodes, giving worst-case time complexity O((n - 1)!). However, on typical metric road graphs with non-uniform edge weights, it prunes 70% to 90%+ of the nodes, running orders of magnitude faster in practice."
    },
    {
      id: 9,
      q: "What search strategy is used in exploring the State Space Tree?",
      a: "We employ Depth-First Branch and Bound (DFBnB) combined with Best-Bound (Smallest Lower Bound) child ordering. Sorting child branches by ascending lower bound ensures that the most promising branches are explored first, rapidly establishing a tight upper bound (currentBest), which in turn accelerates pruning of subsequent branches."
    },
    {
      id: 10,
      q: "What happens if the input graph size n becomes larger than 10 or 12?",
      a: "For n = 10, (10 - 1)! = 362,880 routes. For n = 12, 11! = 39,916,800 routes. For n = 15, 14! = 87 billion routes! Brute Force becomes completely infeasible. Branch and Bound can handle moderate sizes (up to ~15-20 nodes depending on bounding function tightness). For hundreds of cities, metaheuristics or Christofides 1.5-approximation algorithms are utilized."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Educational Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-xs font-semibold text-emerald-300 mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          DAA Theoretical Foundations
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Design & Analysis of Algorithms: Core Concepts Explained
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Comprehensive study reference covering the Travelling Salesperson Problem, Permutations,
          State-Space Trees, Admissible Bounding Functions, and B.Tech Viva Voce Preparation.
        </p>
      </div>

      {/* Grid of Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Graph Representation */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
            <span className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <Layers className="w-4 h-4 text-emerald-400" />
            </span>
            <span>1. Graph Representation G = (V, E)</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The municipal territory is modeled as a weighted, undirected complete graph <span className="font-mono text-cyan-300">G = (V, E)</span>:
          </p>

          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li><strong>Vertices V:</strong> Locations. Vertex 0 is the Municipal Office (Depot); vertices 1 to n-1 are garbage collection points.</li>
            <li><strong>Edges E:</strong> Bidirectional roads connecting pairs of locations with positive distance weights <span className="font-mono text-emerald-400">d(u, v) &gt; 0</span> for u ≠ v.</li>
            <li><strong>Adjacency / Distance Matrix:</strong> Symmetric n × n 2D array where <span className="font-mono text-cyan-300">M[i][j] = M[j][i]</span> and <span className="font-mono text-cyan-300">M[i][i] = 0</span>.</li>
          </ul>
        </div>

        {/* Card 2: Travelling Salesperson Problem */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm">
            <span className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <GitBranch className="w-4 h-4 text-cyan-400" />
            </span>
            <span>2. The Travelling Salesperson Problem</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The garbage collection vehicle must execute a <strong>Hamiltonian Cycle</strong> of minimum total weight:
          </p>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300">
            Minimize: d(0, p1) + ∑ d(pi, pi+1) + d(p_{'{n-1}'}, 0)
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Every collection point must be visited <em>exactly once</em>, and the cycle must close back at the Municipal Office.
          </p>
        </div>

        {/* Card 3: Brute Force Approach */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
            <span className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <Cpu className="w-4 h-4 text-amber-400" />
            </span>
            <span>3. Brute Force (Exhaustive Permutations)</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Fixes depot at position 0, then generates all <span className="font-mono text-amber-300">(n - 1)!</span> permutations of remaining collection points using recursive backtracking.
          </p>

          <div className="space-y-1 text-xs text-slate-400">
            <div>• <strong>Time Complexity:</strong> <span className="font-mono text-cyan-300">O((n - 1)! * n)</span></div>
            <div>• <strong>Space Complexity:</strong> <span className="font-mono text-cyan-300">O(n)</span> call stack recursion</div>
            <div>• <strong>Limitation:</strong> Combinatorial explosion makes it unusable for n &gt; 11 (e.g. 10! = 3.6 million routes).</div>
          </div>
        </div>

        {/* Card 4: Branch and Bound & Pruning */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
          <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
            <span className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </span>
            <span>4. Branch & Bound with Lower Bounding</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Constructs the tour incrementally in a <strong>State-Space Tree</strong>. At each partial path node, an admissible lower bound is calculated:
          </p>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-rose-300">
            If LowerBound(child) ≥ CurrentBest: PRUNE!
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Guarantees finding the identical optimal solution as Brute Force while skipping massive unviable subtrees.
          </p>
        </div>
      </div>

      {/* College Viva Voce Interactive Q&A */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              Top 10 College Viva Voce Questions & Answers
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any question below to expand the exact answers expected by external DAA examiners.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-950/70 border border-amber-800 text-amber-300 font-semibold">
            Viva Prep
          </span>
        </div>

        <div className="space-y-3">
          {vivaQuestions.map((item) => {
            const isOpen = openVivaId === item.id;
            return (
              <div
                key={item.id}
                className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 transition"
              >
                <button
                  onClick={() => toggleViva(item.id)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-xs text-emerald-400 shrink-0">
                      Q{item.id}
                    </span>
                    <span>{item.q}</span>
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="p-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 bg-slate-900/40 animate-fadeIn">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-emerald-400 shrink-0">Answer:</span>
                      <div>{item.a}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
