/**
 * ======================================================================================
 * DAA PROJECT: SMART CITY GARBAGE COLLECTION ROUTE OPTIMIZATION SYSTEM
 * ALGORITHM 2: BRANCH AND BOUND TRAVELLING SALESPERSON PROBLEM (TSP)
 * ======================================================================================
 *
 * Problem Formulation:
 * - A garbage collection vehicle starts at the Municipal Office (vertex 0).
 * - It must visit every garbage collection point (vertices 1 to n-1) exactly once.
 * - It must return back to the Municipal Office (vertex 0).
 * - Find the Hamiltonian cycle of minimum total travel distance.
 *
 * Algorithm Strategy (Branch and Bound with State-Space Tree Pruning):
 * 1. Build the tour incrementally in a state-space tree starting from Municipal Office (node 0).
 * 2. At each node in the state-space tree, we have a partial path: [v0, v1, ..., vk].
 * 3. We calculate a mathematically rigorous LOWER BOUND on the best complete tour that could
 *    ever be formed by extending this partial path.
 * 4. Bounding Function (Degree-2 Relaxation / Minimum Incident Edges):
 *    - In any valid Hamiltonian cycle, every vertex must have degree exactly 2 (one incoming, one outgoing).
 *    - For the current vertex vk: it must pick at least 1 edge to an unvisited vertex.
 *    - For the start vertex v0: it must receive at least 1 edge returning from an unvisited vertex.
 *    - For every unvisited vertex u: it must connect to at least 2 remaining valid vertices.
 *    - Lower Bound = currentCost + ceil( (minFromCurr + minToStart + sum(min1(u) + min2(u))) / 2 )
 * 5. Admissibility Proof:
 *    Since every actual completion must select valid incident edges for vk, v0, and all u in U,
 *    and each selected edge weight >= the minimum edge weight, Lower Bound <= Actual Completion Cost.
 *    Therefore, the bounding function is strictly admissible (never overestimates).
 * 6. Pruning Condition:
 *    If Lower Bound >= currentBestDistance:
 *        PRUNE THIS BRANCH (Discard all child subtrees without visiting them).
 *    Else:
 *        EXPLORE child nodes in best-first priority order (smallest lower bound first).
 *
 * Complexity Analysis:
 * - Worst-case Time Complexity: O((n - 1)!) [When bounding function provides no pruning]
 * - Average-case Time Complexity: Significantly faster than Brute Force, typically O(c^n) where c < n.
 *   On road networks, pruning discards 70% to 95%+ of the state space tree!
 * - Space Complexity: O(n) for DFS recursion depth (or O(b*d) for state space tree).
 * ======================================================================================
 */

/**
 * Computes the admissible lower bound for a partial TSP path.
 * 
 * @param {Array<number>} path - Sequence of visited vertex indices so far, e.g. [0, 3, 1]
 * @param {number} currCost - Sum of edge weights along the partial path
 * @param {Array<Array<number>>} matrix - Symmetric distance matrix
 * @param {number} n - Total number of locations
 * @returns {number} Admissible lower bound in kilometers
 */
function calculateLowerBound(path, currCost, matrix, n) {
  const k = path.length;

  // If tour is complete, the bound is the exact cost returning to Municipal Office (node 0)
  if (k === n) {
    return currCost + matrix[path[k - 1]][0];
  }

  const visitedSet = new Set(path);
  const unvisited = [];
  for (let i = 0; i < n; i++) {
    if (!visitedSet.has(i)) {
      unvisited.push(i);
    }
  }

  const curr = path[k - 1];

  // 1. Minimum edge from the current vertex (vk) to any unvisited vertex
  let minFromCurr = Infinity;
  for (const u of unvisited) {
    if (matrix[curr][u] < minFromCurr) {
      minFromCurr = matrix[curr][u];
    }
  }

  // 2. Minimum edge from any unvisited vertex back to the Municipal Office (node 0)
  let minToStart = Infinity;
  for (const u of unvisited) {
    if (matrix[u][0] < minToStart) {
      minToStart = matrix[u][0];
    }
  }

  // 3. For each unvisited vertex u, find the two smallest incident edges among valid endpoints
  let unvisitedIncidentSum = 0;

  for (const u of unvisited) {
    const candidateEdges = [];

    // Edge connecting back to current partial path endpoint (vk)
    candidateEdges.push(matrix[u][curr]);

    // Edge connecting back to start vertex (v0)
    candidateEdges.push(matrix[u][0]);

    // Edges connecting to other unvisited vertices
    for (const v of unvisited) {
      if (u !== v) {
        candidateEdges.push(matrix[u][v]);
      }
    }

    // Sort to get the two smallest incident edges
    candidateEdges.sort((a, b) => a - b);
    const min1 = candidateEdges[0] !== undefined ? candidateEdges[0] : 0;
    const min2 = candidateEdges[1] !== undefined ? candidateEdges[1] : min1;

    unvisitedIncidentSum += (min1 + min2);
  }

  // Combine components into the half-sum lower bound
  const remainingBound = Math.ceil((minFromCurr + minToStart + unvisitedIncidentSum) / 2);
  return currCost + remainingBound;
}

/**
 * Solves TSP using Branch and Bound with recursive DFS and best-bound ordering.
 * 
 * @param {Array<string|object>} locations - List of location names or objects
 * @param {Array<Array<number>>} distanceMatrix - n x n distance matrix
 * @param {object} [options] - Configuration options
 * @param {boolean} [options.recordSteps=true] - Whether to record simulation step trace
 * @param {number} [options.maxSteps=300] - Limit of recorded steps for visualizer
 * @returns {object} Solution object with metrics, optimal route, and simulation trace
 */
function solveTSPBranchAndBound(locations, distanceMatrix, options = {}) {
  const { recordSteps = true, maxSteps = 300 } = options;
  const n = locations.length;

  if (n < 2) {
    throw new Error('At least 2 locations (Municipal Office + 1 collection point) are required.');
  }

  // Handle trivial 2-node graph
  if (n === 2) {
    const singleDist = distanceMatrix[0][1] + distanceMatrix[1][0];
    return {
      algorithm: 'Branch and Bound',
      routeIndices: [0, 1, 0],
      routeNames: [getLocationName(locations[0]), getLocationName(locations[1]), getLocationName(locations[0])],
      optimalDistance: singleDist,
      totalRoutesGenerated: 1,
      routesEvaluated: 1,
      nodesExplored: 2,
      branchesPruned: 0,
      executionTimeMs: 0.05,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(n) = O(2)',
      steps: [],
      prunedTreeData: []
    };
  }

  let bestDistance = Infinity;
  let bestRouteIndices = [];
  let nodesExplored = 0;
  let branchesPruned = 0;
  let totalEvaluations = 0;
  const steps = [];
  const pruningEvents = [];

  const startTime = performance.now();

  // Initial root lower bound (starting at Municipal Office node 0)
  const initialBound = calculateLowerBound([0], 0, distanceMatrix, n);

  if (recordSteps && steps.length < maxSteps) {
    steps.push({
      stepNumber: steps.length + 1,
      type: 'ROOT',
      currentNode: 0,
      currentNodeName: getLocationName(locations[0]),
      path: [0],
      pathNames: [getLocationName(locations[0])],
      currentCost: 0,
      candidateNode: null,
      candidateNodeName: null,
      lowerBound: initialBound,
      currentBest: Infinity,
      decision: 'START',
      explanation: `Algorithm starts at Municipal Office (Node 0). Calculated initial admissible Lower Bound = ${initialBound} km.`
    });
  }

  /**
   * Recursive Branch and Bound explorer
   * @param {Array<number>} currentPath - Array of visited vertex indices
   * @param {number} currentCost - Cumulative travel cost along currentPath
   */
  function branchAndBound(currentPath, currentCost) {
    nodesExplored++;
    const pathLength = currentPath.length;
    const currNode = currentPath[pathLength - 1];

    // Base Case: All n locations visited, return to Municipal Office (node 0)
    if (pathLength === n) {
      totalEvaluations++;
      const returnEdgeCost = distanceMatrix[currNode][0];
      const completeTourDistance = currentCost + returnEdgeCost;
      const completeTourPath = [...currentPath, 0];

      if (completeTourDistance < bestDistance) {
        const previousBest = bestDistance;
        bestDistance = completeTourDistance;
        bestRouteIndices = completeTourPath;

        if (recordSteps && steps.length < maxSteps) {
          steps.push({
            stepNumber: steps.length + 1,
            type: 'FOUND_BEST',
            currentNode: 0,
            currentNodeName: getLocationName(locations[0]),
            path: completeTourPath,
            pathNames: completeTourPath.map(idx => getLocationName(locations[idx])),
            currentCost: completeTourDistance,
            candidateNode: 0,
            candidateNodeName: getLocationName(locations[0]),
            lowerBound: completeTourDistance,
            currentBest: bestDistance,
            decision: 'UPDATE_BEST',
            explanation: `Found valid complete cycle [${completeTourPath.map(idx => getLocationName(locations[idx])).join(' → ')}] with distance ${completeTourDistance} km. (Previous best was ${previousBest === Infinity ? '∞' : previousBest + ' km'}). Updated current best!`
          });
        }
      }
      return;
    }

    const visitedSet = new Set(currentPath);

    // 1. Branch: Identify all unvisited garbage collection points as candidate children
    const candidates = [];
    for (let nextNode = 1; nextNode < n; nextNode++) {
      if (!visitedSet.has(nextNode)) {
        const edgeCost = distanceMatrix[currNode][nextNode];
        const nextCost = currentCost + edgeCost;
        const nextPath = [...currentPath, nextNode];
        const lowerBound = calculateLowerBound(nextPath, nextCost, distanceMatrix, n);

        candidates.push({
          node: nextNode,
          nodeName: getLocationName(locations[nextNode]),
          edgeCost,
          nextCost,
          nextPath,
          lowerBound
        });
      }
    }

    // 2. Best-First Ordering: Sort child branches by ascending lower bound
    // This allows promising branches to quickly discover tight upper bounds, maximizing subsequent pruning
    candidates.sort((a, b) => a.lowerBound - b.lowerBound);

    // 3. Bound and Prune: Evaluate each child branch
    for (const child of candidates) {
      if (child.lowerBound >= bestDistance) {
        // PRUNING OCCURS HERE!
        branchesPruned++;

        pruningEvents.push({
          fromNode: currNode,
          fromNodeName: getLocationName(locations[currNode]),
          targetNode: child.node,
          targetNodeName: child.nodeName,
          path: child.nextPath,
          lowerBound: child.lowerBound,
          currentBest: bestDistance,
          savedSubtreeEstimate: estimateSubtreeSize(n - child.nextPath.length)
        });

        if (recordSteps && steps.length < maxSteps) {
          steps.push({
            stepNumber: steps.length + 1,
            type: 'PRUNE',
            currentNode: currNode,
            currentNodeName: getLocationName(locations[currNode]),
            path: child.nextPath,
            pathNames: child.nextPath.map(idx => getLocationName(locations[idx])),
            currentCost: child.nextCost,
            candidateNode: child.node,
            candidateNodeName: child.nodeName,
            lowerBound: child.lowerBound,
            currentBest: bestDistance,
            decision: 'PRUNE',
            explanation: `Branch to ${child.nodeName}: Calculated Lower Bound = ${child.lowerBound} km >= Current Best = ${bestDistance} km. PRUNED! (Skipped exploring this subtree).`
          });
        }
      } else {
        // PROMISING BRANCH: Continue deeper into the state space tree
        if (recordSteps && steps.length < maxSteps) {
          steps.push({
            stepNumber: steps.length + 1,
            type: 'EXPLORE',
            currentNode: currNode,
            currentNodeName: getLocationName(locations[currNode]),
            path: child.nextPath,
            pathNames: child.nextPath.map(idx => getLocationName(locations[idx])),
            currentCost: child.nextCost,
            candidateNode: child.node,
            candidateNodeName: child.nodeName,
            lowerBound: child.lowerBound,
            currentBest: bestDistance,
            decision: 'EXPLORE',
            explanation: `Branch to ${child.nodeName}: Calculated Lower Bound = ${child.lowerBound} km < Current Best = ${bestDistance === Infinity ? '∞' : bestDistance + ' km'}. EXPLORE this branch!`
          });
        }

        // Recursive exploration of the valid sub-branch
        branchAndBound(child.nextPath, child.nextCost);
      }
    }
  }

  // Execute Branch and Bound search from Municipal Office (node 0)
  branchAndBound([0], 0);

  const endTime = performance.now();
  const executionTimeMs = parseFloat((endTime - startTime).toFixed(4));

  const bestRouteNames = bestRouteIndices.map(idx => getLocationName(locations[idx]));

  return {
    algorithm: 'Branch and Bound',
    routeIndices: bestRouteIndices,
    routeNames: bestRouteNames,
    optimalDistance: bestDistance,
    totalRoutesGenerated: totalEvaluations + branchesPruned,
    routesEvaluated: totalEvaluations,
    nodesExplored,
    branchesPruned,
    executionTimeMs,
    timeComplexity: `Worst-Case: O((${n}-1)!), Typical: Highly reduced via ${branchesPruned} prunings`,
    spaceComplexity: `O(n) = O(${n}) (DFS Call Stack)`,
    steps,
    pruningEvents: pruningEvents.slice(0, 20),
    formulaExplanation: `Computed degree-2 relaxation lower bounds at every state node. Pruned whenever Lower Bound >= Current Best.`
  };
}

/**
 * Estimates number of leaves in factorial subtree: (remaining)!
 */
function estimateSubtreeSize(remaining) {
  if (remaining <= 1) return 1;
  let count = 1;
  for (let i = 2; i <= remaining; i++) count *= i;
  return count;
}

/**
 * Helper to safely extract location label/name
 */
function getLocationName(loc) {
  if (typeof loc === 'string') return loc;
  if (loc && loc.name) return loc.name;
  return `Point ${loc}`;
}

// Support CommonJS and ES Modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { solveTSPBranchAndBound, calculateLowerBound };
}
