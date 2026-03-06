/**
 * riskController.js
 * Request validation and delegation to RiskService.
 */
const RiskService = require('../services/riskService');

const RiskController = {
    /**
     * POST /api/risk/analyze
     * Body: { case_id }
     */
    async analyzeCase(req, res, next) {
        try {
            const { case_id } = req.body;
            if (!case_id) {
                return res.status(400).json({ error: 'case_id is required' });
            }
            const result = await RiskService.analyzeCase(case_id);
            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/risk/cluster/:cluster_id
     */
    async getClusterRisk(req, res, next) {
        try {
            const { cluster_id } = req.params;
            if (!cluster_id) {
                return res.status(400).json({ error: 'cluster_id parameter is required' });
            }
            const result = await RiskService.getClusterRisk(cluster_id);
            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/risk/high
     */
    async getHighRiskClusters(req, res, next) {
        try {
            const clusters = await RiskService.getHighRiskClusters();
            return res.status(200).json({ count: clusters.length, clusters });
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/risk/case/:case_id
     */
    async getCaseRiskSummary(req, res, next) {
        try {
            const { case_id } = req.params;
            if (!case_id) {
                return res.status(400).json({ error: 'case_id parameter is required' });
            }
            const summary = await RiskService.getCaseRiskSummary(case_id);
            return res.status(200).json(summary);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = RiskController;
