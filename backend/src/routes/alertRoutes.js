const express = require('express');
const router = express.Router();
const LaunderingController = require('../controllers/launderingController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// Base middleware for JWT and Role Authorization
router.use(authMiddleware);
router.use(allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'));

/**
 * @route   GET /api/alerts
 * @desc    Global alerts dashboard endpoint
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get('/', LaunderingController.getAllAlerts);

/**
 * @route   PATCH /api/alerts/:id
 * @desc    Change the status of an alert (e.g. RESOLVED)
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.patch('/:id', LaunderingController.updateAlertStatus);

module.exports = router;
