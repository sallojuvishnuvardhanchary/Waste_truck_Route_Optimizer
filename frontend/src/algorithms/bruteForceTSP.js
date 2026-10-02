/**
 * ======================================================================================
 * DAA PROJECT: SMART CITY GARBAGE COLLECTION ROUTE OPTIMIZATION SYSTEM
 * ALGORITHM 1: BRUTE FORCE TRAVELLING SALESPERSON PROBLEM (TSP) - FRONTEND ES MODULE
 * ======================================================================================
 *
 * Exhaustive permutation search: Evaluates all (n - 1)! possible routes starting
 * and returning to the Municipal Office (node 0).
 */

export function solveTSPBruteForce(locations, distanceMatrix, maxEvalLimit = 500000) {
  const n = locations.length;

  if (n < 2) {
    throw new Error('At least 2 locations (Municipal Office + 1 collection point) are required.');
  }

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
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(n) = O(2)',
      sampleRoutes: [{ route: [0, 1, 0], distance: singleDist }],
      truncated: false
    };
  }

  let totalTheoreticalRoutes = 1;
  for (let i = 2; i < n; i++) {
    totalTheoreticalRoutes *= i;
  }

  let bestDistance = Infinity;
  let bestRouteIndices = [];
  let routesEvaluated = 0;
  let truncated = false;
  const sampleRoutes = [];

  const collectionPoints = [];
  for (let i = 1; i < n; i++) {
    collectionPoints.push(i);
  }

  const startTime = performance.now();

  function permute(arr, start) {
    if (routesEvaluated >= maxEvalLimit) {
      truncated = true;
      return;
    }

    if (start === arr.length) {
      routesEvaluated++;

      let currentDistance = distanceMatrix[0][arr[0]];
      for (let i = 0; i < arr.length - 1; i++) {
        currentDistance += distanceMatrix[arr[i]][arr[i + 1]];
      }
      currentDistance += distanceMatrix[arr[arr.length - 1]][0];

      if (sampleRoutes.length < 25) {
        sampleRoutes.push({
          route: [0, ...arr, 0],
          routeNames: [0, ...arr, 0].map(idx => getLocationName(locations[idx])),
          distance: currentDistance,
          isCurrentBest: currentDistance < bestDistance
        });
      }

      if (currentDistance < bestDistance) {
        bestDistance = currentDistance;
        bestRouteIndices = [0, ...arr, 0];
      }
      return;
    }

    for (let i = start; i < arr.length; i++) {
      [arr[start], arr[i]] = [arr[i], arr[start]];
      permute(arr, start + 1);
      [arr[start], arr[i]] = [arr[i], arr[start]];
      if (truncated) break;
    }
  }

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
    branchesPruned: 0,
    executionTimeMs,
    timeComplexity: `O((${n}-1)! * ${n}) = O(${totalTheoreticalRoutes} * ${n})`,
    spaceComplexity: `O(n) = O(${n})`,
    sampleRoutes,
    truncated,
    formulaExplanation: `Evaluated all (${n}-1)! = ${totalTheoreticalRoutes} permutations starting and ending at Municipal Office.`
  };
}

function getLocationName(loc) {
  if (typeof loc === 'string') return loc;
  if (loc && loc.name) return loc.name;
  return `Point ${loc}`;
}
