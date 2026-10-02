import { solveTSPBruteForce } from '../algorithms/bruteForceTSP';
import { solveTSPBranchAndBound } from '../algorithms/branchAndBoundTSP';
import { generateRandomGraph } from '../data/defaultGraph';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Checks if Express backend is running
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ONLINE';
  } catch (e) {
    return false;
  }
}

/**
 * Solves TSP using Brute Force via backend or local fallback
 */
export async function optimizeWithBruteForce(locations, distanceMatrix) {
  try {
    const res = await fetch(`${API_BASE_URL}/route/bruteforce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations, distanceMatrix })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return { ...json.data, source: 'backend' };
    }
  } catch (err) {
    console.warn('Backend unavailable, falling back to client-side Brute Force algorithm.', err);
  }
  // Client-side fallback
  const localResult = solveTSPBruteForce(locations, distanceMatrix);
  return { ...localResult, source: 'client' };
}

/**
 * Solves TSP using Branch and Bound via backend or local fallback
 */
export async function optimizeWithBranchAndBound(locations, distanceMatrix, recordSteps = true) {
  try {
    const res = await fetch(`${API_BASE_URL}/route/branch-bound`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations, distanceMatrix, recordSteps, maxSteps: 300 })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return { ...json.data, source: 'backend' };
    }
  } catch (err) {
    console.warn('Backend unavailable, falling back to client-side Branch and Bound algorithm.', err);
  }
  // Client-side fallback
  const localResult = solveTSPBranchAndBound(locations, distanceMatrix, { recordSteps, maxSteps: 300 });
  return { ...localResult, source: 'client' };
}

/**
 * Runs comparative benchmark of Brute Force vs Branch and Bound
 */
export async function compareAlgorithms(locations, distanceMatrix) {
  try {
    const res = await fetch(`${API_BASE_URL}/route/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations, distanceMatrix })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return { ...json.data, source: 'backend' };
    }
  } catch (err) {
    console.warn('Backend unavailable, comparing on client-side engine.', err);
  }

  // Client-side comparison calculation
  const n = locations.length;
  let bruteForceResult = null;
  let bruteForceSkipped = false;
  let warning = null;

  if (n <= 10) {
    bruteForceResult = solveTSPBruteForce(locations, distanceMatrix);
  } else {
    bruteForceSkipped = true;
    warning = `Brute Force skipped because (${n}-1)! routes would cause browser tab freezing. Branch and Bound executed smoothly.`;
  }

  const branchAndBoundResult = solveTSPBranchAndBound(locations, distanceMatrix, { recordSteps: true });

  return {
    graphSize: n,
    warning,
    bruteForceSkipped,
    bruteForce: bruteForceResult,
    branchAndBound: branchAndBoundResult,
    distanceMatches: bruteForceResult ? (bruteForceResult.optimalDistance === branchAndBoundResult.optimalDistance) : true,
    efficiencyRatio: bruteForceResult
      ? parseFloat((bruteForceResult.nodesExplored / Math.max(1, branchAndBoundResult.nodesExplored)).toFixed(2))
      : null,
    source: 'client'
  };
}

/**
 * Generates a random graph
 */
export async function fetchRandomGraph(nodeCount = 6) {
  try {
    const res = await fetch(`${API_BASE_URL}/graph/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeCount })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return json.data;
    }
  } catch (err) {
    // fallback
  }
  return generateRandomGraph(nodeCount);
}
