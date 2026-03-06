const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// All report routes require authentication
router.use(authMiddleware);
router.use(allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'));

/**
 * @route   GET /api/reports/case/:case_id
 * @desc    Generate full investigation report (JSON)
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get('/case/:case_id', ReportController.getFullReport);

/**
 * @route   GET /api/reports/case/:case_id/pdf
 * @desc    Download investigation report as PDF
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get('/case/:case_id/pdf', ReportController.downloadPdf);

/**
 * @route   GET /api/reports/summary/:case_id
 * @desc    Get lightweight investigation summary
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get('/summary/:case_id', ReportController.getSummary);

module.exports = router;
