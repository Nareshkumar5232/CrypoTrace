const express = require('express');
const router = express.Router();
const RiskController = require('../controllers/riskController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// All risk routes require authentication
router.use(authMiddleware);
router.use(allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'));

/**
 * @route   POST /api/risk/analyze
 * @desc    Run risk analysis for a case (scores all clusters)
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.post('/analyze', RiskController.analyzeCase);

/**
 * @route   GET /api/risk/high
 * @desc    Get all clusters with risk_score >= 7
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get('/high', RiskController.getHighRiskClusters);

/**
 * @route   GET /api/risk/cluster/:cluster_id
 * @desc    Get risk score and indicators for a single cluster
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get('/cluster/:cluster_id', RiskController.getClusterRisk);

/**
 * @route   GET /api/risk/case/:case_id
 * @desc    Get case-level risk summary (all clusters + distribution)
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get('/case/:case_id', RiskController.getCaseRiskSummary);

module.exports = router;
