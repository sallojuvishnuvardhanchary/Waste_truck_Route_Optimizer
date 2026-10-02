const express = require('express');
const router = express.Router();
const {
  handleBruteForce,
  handleBranchAndBound,
  handleCompare,
  handleGenerateGraph,
  handleGetSample
} = require('../controllers/routeController');

// Route optimization endpoints
router.post('/route/bruteforce', handleBruteForce);
router.post('/route/branch-bound', handleBranchAndBound);
router.post('/route/compare', handleCompare);

// Graph management endpoints
router.post('/graph/generate', handleGenerateGraph);
router.get('/graph/sample', handleGetSample);

module.exports = router;
