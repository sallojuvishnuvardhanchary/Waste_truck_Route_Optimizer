/**
 * ======================================================================================
 * DAA PROJECT: SMART CITY GARBAGE COLLECTION ROUTE OPTIMIZATION SYSTEM
 * ALGORITHM 2: BRANCH AND BOUND TRAVELLING SALESPERSON PROBLEM (TSP) - FRONTEND ES MODULE
 * ======================================================================================
 *
 * State space tree exploration with lower bound calculation and pruning.
 */

export function calculateLowerBound(path, currCost, matrix, n) {
  const k = path.length;

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

  let minFromCurr = Infinity;
  for (const u of unvisited) {
    if (matrix[curr][u] < minFromCurr) {
      minFromCurr = matrix[curr][u];
    }
  }

  let minToStart = Infinity;
  for (const u of unvisited) {
    if (matrix[u][0] < minToStart) {
      minToStart = matrix[u][0];
    }
  }

  let unvisitedIncidentSum = 0;
  for (const u of unvisited) {
    const candidateEdges = [];
    candidateEdges.push(matrix[u][curr]);
    candidateEdges.push(matrix[u][0]);
    for (const v of unvisited) {
      if (u !== v) {
        candidateEdges.push(matrix[u][v]);
      }
    }
    candidateEdges.sort((a, b) => a - b);
    const min1 = candidateEdges[0] !== undefined ? candidateEdges[0] : 0;
    const min2 = candidateEdges[1] !== undefined ? candidateEdges[1] : min1;
    unvisitedIncidentSum += (min1 + min2);
  }

  const remainingBound = Math.ceil((minFromCurr + minToStart + unvisitedIncidentSum) / 2);
  return currCost + remainingBound;
}

export function solveTSPBranchAndBound(locations, distanceMatrix, options = {}) {
  const { recordSteps = true, maxSteps = 300 } = options;
  const n = locations.length;

  if (n < 2) {
    throw new Error('At least 2 locations (Municipal Office + 1 collection point) are required.');
  }

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
      pruningEvents: []
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

  function branchAndBound(currentPath, currentCost) {
    nodesExplored++;
    const pathLength = currentPath.length;
    const currNode = currentPath[pathLength - 1];

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
            explanation: `Found valid complete tour [${completeTourPath.map(idx => getLocationName(locations[idx])).join(' → ')}] with distance ${completeTourDistance} km. (Previous best: ${previousBest === Infinity ? '∞' : previousBest + ' km'}). New optimal candidate!`
          });
        }
      }
      return;
    }

    const visitedSet = new Set(currentPath);
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

    // Best-first ordering: Smallest lower bound first
    candidates.sort((a, b) => a.lowerBound - b.lowerBound);

    for (const child of candidates) {
      if (child.lowerBound >= bestDistance) {
        branchesPruned++;

        pruningEvents.push({
          fromNode: currNode,
          fromNodeName: getLocationName(locations[currNode]),
          targetNode: child.node,
          targetNodeName: child.nodeName,
          path: child.nextPath,
          lowerBound: child.lowerBound,
          currentBest: bestDistance
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
            explanation: `Branch to ${child.nodeName}: Lower Bound (${child.lowerBound} km) >= Current Best (${bestDistance} km). PRUNED! (Subtree discarded).`
          });
        }
      } else {
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
            explanation: `Branch to ${child.nodeName}: Lower Bound (${child.lowerBound} km) < Current Best (${bestDistance === Infinity ? '∞' : bestDistance + ' km'}). EXPLORE this branch!`
          });
        }

        branchAndBound(child.nextPath, child.nextCost);
      }
    }
  }

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

function getLocationName(loc) {
  if (typeof loc === 'string') return loc;
  if (loc && loc.name) return loc.name;
  return `Point ${loc}`;
}
