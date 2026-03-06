/**
 * launderingController.js
 * Request validation and delegation to LaunderingService.
 */
const LaunderingService = require('../services/launderingService');

const LaunderingController = {
    /**
     * POST /api/laundering/analyze
     * Request body needs { case_id: 'UUID' }
     */
    async analyzeCase(req, res, next) {
        try {
            const { case_id } = req.body;
            if (!case_id) {
                return res.status(400).json({ error: 'case_id is required for analysis' });
            }

            const result = await LaunderingService.analyzeCase(case_id);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/laundering/patterns/:case_id
     */
    async getPatternsByCase(req, res, next) {
        try {
            const { case_id } = req.params;
            if (!case_id) {
                return res.status(400).json({ error: 'case_id parameter is required' });
            }

            const patterns = await LaunderingService.getPatternsByCase(case_id);
            return res.status(200).json({ count: patterns.length, patterns });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/alerts
     */
    async getAllAlerts(req, res, next) {
        try {
            const alerts = await LaunderingService.getAllAlerts();
            return res.status(200).json({ count: alerts.length, alerts });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PATCH /api/alerts/:id
     * Request body needs { status: 'RESOLVED' }
     */
    async updateAlertStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!id || !status) {
                return res.status(400).json({ error: 'Alert ID param and status body are required' });
            }

            const updatedAlert = await LaunderingService.updateAlertStatus(id, status);
            return res.status(200).json(updatedAlert);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = LaunderingController;
