const express = require('express');
const router = express.Router();
const LaunderingController = require('../controllers/launderingController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// Base middleware for JWT and Role Authorization
router.use(authMiddleware);
router.use(allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'));

/**
 * @route   POST /api/laundering/analyze
 * @desc    Analyze a case's graph for laundering patterns
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.post('/analyze', LaunderingController.analyzeCase);

/**
 * @route   GET /api/laundering/patterns/:case_id
 * @desc    Get detected laundering patterns for a specific case
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get('/patterns/:case_id', LaunderingController.getPatternsByCase);

module.exports = router;
