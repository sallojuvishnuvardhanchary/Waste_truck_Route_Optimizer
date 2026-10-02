/**
 * ======================================================================================
 * DAA PROJECT: SMART CITY GARBAGE COLLECTION ROUTE OPTIMIZATION SYSTEM
 * ALGORITHM 1: BRUTE FORCE TRAVELLING SALESPERSON PROBLEM (TSP)
 * ======================================================================================
 *
 * Problem Formulation:
 * - A garbage collection vehicle starts at the Municipal Office (vertex 0).
 * - It must visit every garbage collection point (vertices 1 to n-1) exactly once.
 * - It must return back to the Municipal Office (vertex 0).
 * - Find the Hamiltonian cycle of minimum total travel distance.
 *
 * Algorithm Strategy (Exhaustive Search / Brute Force):
 * 1. Keep vertex 0 (Municipal Office) fixed at the start and end of the cycle.
 * 2. Generate all permutations of the remaining (n - 1) garbage collection points.
 * 3. For each permutation [p1, p2, ..., p_{n-1}], compute the total cycle cost:
 *    Distance = dist(0, p1) + dist(p1, p2) + ... + dist(p_{n-2}, p_{n-1}) + dist(p_{n-1}, 0)
 * 4. Compare with the current best distance found so far.
 * 5. Update bestDistance and bestRoute whenever a strictly shorter tour is discovered.
 *
 * Complexity Analysis:
 * - Time Complexity: O((n - 1)! * n)
 *   There are (n - 1)! possible permutations. For each permutation, calculating the tour
 *   distance requires summing n edge weights, taking O(n) operations.
 * - Space Complexity: O(n)
 *   Recursion depth is at most n (to hold the current permutation stack), plus O(n) to store
 *   the best route found.
 * ======================================================================================
 */

/**
 * Solves TSP using the Brute Force (Exhaustive Search) approach.
 * 
 * @param {Array<string|object>} locations - List of location names or objects
 * @param {Array<Array<number>>} distanceMatrix - n x n symmetric distance matrix
 * @param {number} [maxEvalLimit=500000] - Safety threshold to prevent browser/server lockup
 * @returns {object} Solution object with metrics, optimal route, and inspection samples
 */
function solveTSPBruteForce(locations, distanceMatrix, maxEvalLimit = 1000000) {
  const n = locations.length;

  if (n < 2) {
    throw new Error('At least 2 locations (Municipal Office + 1 collection point) are required.');
  }

  // Handle trivial 2-node graph (Office <-> Point A)
  if (n === 2) {
    const singleDist = distanceMatrix[0][1] + distanceMatrix[1][0];
    return {
      algorithm: 'Brute Force',
      routeIndices: [0, 1, 0],
      routeNames: [getLocationName(locations[0]), getLocationName(locations[1]), getLocationName(locations[0])],
      optimalDistance: singleDist,
      totalRoutesGenerated: 1,
      routesEvaluated: 1,
      nodesExplored: 2,
      branchesPruned: 0,
      executionTimeMs: 0.05,
      timeComplexity: 'O((n-1)! * n) = O(1)',
      spaceComplexity: 'O(n) = O(2)',
      sampleRoutes: [{ route: [0, 1, 0], distance: singleDist }],
      truncated: false
    };
  }

  // Calculate total theoretical permutations: (n - 1)!
  let totalTheoreticalRoutes = 1;
  for (let i = 2; i < n; i++) {
    totalTheoreticalRoutes *= i;
  }

  let bestDistance = Infinity;
  let bestRouteIndices = [];
  let routesEvaluated = 0;
  let truncated = false;
  const sampleRoutes = []; // First few permutations for educational viva display

  // Array of collection point indices: [1, 2, ..., n-1]
  const collectionPoints = [];
  for (let i = 1; i < n; i++) {
    collectionPoints.push(i);
  }

  const startTime = performance.now();

  /**
   * Recursive Heap/Backtracking permutation generator
   * @param {Array<number>} arr - Array being permuted
   * @param {number} start - Current index in the permutation
   */
  function permute(arr, start) {
    // Safety guard against massive factorial explosion
    if (routesEvaluated >= maxEvalLimit) {
      truncated = true;
      return;
    }

    // Base case: All (n - 1) collection points have been ordered
    if (start === arr.length) {
      routesEvaluated++;

      // Compute total tour distance:
      // Municipal Office (0) -> arr[0] -> arr[1] -> ... -> arr[n-2] -> Municipal Office (0)
      let currentDistance = distanceMatrix[0][arr[0]];

      for (let i = 0; i < arr.length - 1; i++) {
        currentDistance += distanceMatrix[arr[i]][arr[i + 1]];
      }

      // Return leg back to Municipal Office
      currentDistance += distanceMatrix[arr[arr.length - 1]][0];

      // Record educational sample routes (first 25 permutations)
      if (sampleRoutes.length < 25) {
        sampleRoutes.push({
          route: [0, ...arr, 0],
          routeNames: [0, ...arr, 0].map(idx => getLocationName(locations[idx])),
          distance: currentDistance,
          isCurrentBest: currentDistance < bestDistance
        });
      }

      // Check if current permutation is better than best known
      if (currentDistance < bestDistance) {
        bestDistance = currentDistance;
        bestRouteIndices = [0, ...arr, 0];
      }

      return;
    }

    // Recursive step: swap current element with each subsequent element
    for (let i = start; i < arr.length; i++) {
      // Swap elements into position
      [arr[start], arr[i]] = [arr[i], arr[start]];

      // Recurse to fill the next position
      permute(arr, start + 1);

      // Backtrack: restore original array order
      [arr[start], arr[i]] = [arr[i], arr[start]];

      if (truncated) break;
    }
  }

  // Execute exhaustive permutation search
  permute(collectionPoints, 0);

  const endTime = performance.now();
  const executionTimeMs = parseFloat((endTime - startTime).toFixed(4));

  const bestRouteNames = bestRouteIndices.map(idx => getLocationName(locations[idx]));

  return {
    algorithm: 'Brute Force',
    routeIndices: bestRouteIndices,
    routeNames: bestRouteNames,
    optimalDistance: bestDistance,
    totalRoutesGenerated: totalTheoreticalRoutes,
    routesEvaluated,
    nodesExplored: routesEvaluated,
    branchesPruned: 0, // Brute force does NO pruning
    executionTimeMs,
    timeComplexity: `O((${n}-1)! * ${n}) = O(${totalTheoreticalRoutes} * ${n})`,
    spaceComplexity: `O(n) = O(${n})`,
    sampleRoutes,
    truncated,
    formulaExplanation: `Evaluated all (${n}-1)! = ${totalTheoreticalRoutes} permutations starting and ending at Municipal Office.`
  };
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
  module.exports = { solveTSPBruteForce };
}
