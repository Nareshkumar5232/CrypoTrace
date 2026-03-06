/**
 * clusterController.js
 * Request validation and delegation to ClusterService.
 */
const ClusterService = require('../services/clusterService');

const ClusterController = {
    /**
     * POST /api/clusters/analyze
     * Body: { case_id }
     * Runs clustering analysis on a case's wallets and transactions.
     */
    async analyzeCase(req, res, next) {
        try {
            const { case_id } = req.body;
            if (!case_id) {
                return res.status(400).json({ error: 'case_id is required in the request body' });
            }

            const result = await ClusterService.analyzeCase(case_id);
            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/clusters
     * Returns all clusters with wallet counts.
     */
    async getAllClusters(req, res, next) {
        try {
            const clusters = await ClusterService.getAllClusters();
            return res.status(200).json({ count: clusters.length, clusters });
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/clusters/:id
     * Returns a single cluster by ID.
     */
    async getClusterById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'Cluster ID is required' });
            }

            const cluster = await ClusterService.getClusterById(id);
            return res.status(200).json(cluster);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/clusters/:id/wallets
     * Returns all wallet addresses belonging to a cluster.
     */
    async getClusterWallets(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'Cluster ID is required' });
            }

            const result = await ClusterService.getClusterWallets(id);
            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = ClusterController;
