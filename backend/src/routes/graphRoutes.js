const express = require('express');
const router = express.Router();
const GraphController = require('../controllers/graphController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// All graph routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/graph/wallet/:address
 * @desc    Get transaction graph for a single wallet
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get(
    '/wallet/:address',
    allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'),
    GraphController.getWalletGraph
);

/**
 * @route   GET /api/graph/trace/:address?depth=5
 * @desc    Trace fund flow from a wallet (BFS, configurable depth)
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get(
    '/trace/:address',
    allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'),
    GraphController.traceFundFlow
);

/**
 * @route   GET /api/graph/case/:case_id
 * @desc    Get combined graph for all wallets in a case
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get(
    '/case/:case_id',
    allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'),
    GraphController.getCaseGraph
);

module.exports = router;
