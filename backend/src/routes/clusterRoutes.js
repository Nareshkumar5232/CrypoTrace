const express = require('express');
const router = express.Router();
const ClusterController = require('../controllers/clusterController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// All cluster routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/clusters/analyze
 * @desc    Run clustering analysis on a case's wallets & transactions
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.post(
    '/analyze',
    allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'),
    ClusterController.analyzeCase
);

/**
 * @route   GET /api/clusters
 * @desc    Get all detected clusters
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get(
    '/',
    allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'),
    ClusterController.getAllClusters
);

/**
 * @route   GET /api/clusters/:id
 * @desc    Get a single cluster by ID
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get(
    '/:id',
    allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'),
    ClusterController.getClusterById
);

/**
 * @route   GET /api/clusters/:id/wallets
 * @desc    Get all wallets belonging to a cluster
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get(
    '/:id/wallets',
    allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'),
    ClusterController.getClusterWallets
);

module.exports = router;
