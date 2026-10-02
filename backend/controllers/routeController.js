const { solveTSPBruteForce } = require('../algorithms/bruteForceTSP');
const { solveTSPBranchAndBound } = require('../algorithms/branchAndBoundTSP');
const {
  SAMPLE_MUNICIPAL_DATASET,
  SAMPLE_4_NODE_DATASET,
  SAMPLE_8_NODE_DATASET,
  generateRandomGraph,
  validateGraph
} = require('../utils/graphGenerator');

/**
 * Controller: Solve TSP using Brute Force
 */
function handleBruteForce(req, res) {
  try {
    const { locations, distanceMatrix, maxEvalLimit } = req.body;

    const validation = validateGraph(locations, distanceMatrix);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    if (locations.length > 11) {
      return res.status(400).json({
        success: false,
        error: `Input size n = ${locations.length} is too large for Brute Force ((${locations.length}-1)! = ${estimateFactorial(locations.length - 1)} permutations). Please use Branch and Bound instead.`
      });
    }

    const result = solveTSPBruteForce(locations, distanceMatrix, maxEvalLimit);
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Brute Force Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Solve TSP using Branch and Bound
 */
function handleBranchAndBound(req, res) {
  try {
    const { locations, distanceMatrix, recordSteps, maxSteps } = req.body;

    const validation = validateGraph(locations, distanceMatrix);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const result = solveTSPBranchAndBound(locations, distanceMatrix, { recordSteps, maxSteps });
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Branch and Bound Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Compare both algorithms side-by-side on the exact same graph
 */
function handleCompare(req, res) {
  try {
    const { locations, distanceMatrix } = req.body;

    const validation = validateGraph(locations, distanceMatrix);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const n = locations.length;
    let bruteForceResult = null;
    let bruteForceSkipped = false;
    let warning = null;

    if (n <= 10) {
      bruteForceResult = solveTSPBruteForce(locations, distanceMatrix);
    } else {
      bruteForceSkipped = true;
      warning = `Brute Force skipped because (${n}-1)! = ${estimateFactorial(n - 1)} routes would cause excessive compute time. Branch and Bound ran successfully.`;
    }

    const branchAndBoundResult = solveTSPBranchAndBound(locations, distanceMatrix, { recordSteps: true, maxSteps: 200 });

    const comparison = {
      graphSize: n,
      warning,
      bruteForceSkipped,
      bruteForce: bruteForceResult,
      branchAndBound: branchAndBoundResult,
      distanceMatches: bruteForceResult ? (bruteForceResult.optimalDistance === branchAndBoundResult.optimalDistance) : true,
      efficiencyRatio: bruteForceResult
        ? parseFloat((bruteForceResult.nodesExplored / Math.max(1, branchAndBoundResult.nodesExplored)).toFixed(2))
        : null
    };

    return res.json({ success: true, data: comparison });
  } catch (error) {
    console.error('Compare Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Generate procedural random test graph
 */
function handleGenerateGraph(req, res) {
  try {
    const nodeCount = parseInt(req.body.nodeCount || req.query.nodeCount || 6, 10);
    const graph = generateRandomGraph(nodeCount);
    return res.json({ success: true, data: graph });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Get predefined sample datasets
 */
function handleGetSample(req, res) {
  return res.json({
    success: true,
    data: {
      default: SAMPLE_MUNICIPAL_DATASET,
      small4Node: SAMPLE_4_NODE_DATASET,
      large8Node: SAMPLE_8_NODE_DATASET
    }
  });
}

function estimateFactorial(n) {
  let val = 1;
  for (let i = 2; i <= n; i++) val *= i;
  return val.toLocaleString();
}

module.exports = {
  handleBruteForce,
  handleBranchAndBound,
  handleCompare,
  handleGenerateGraph,
  handleGetSample
};
