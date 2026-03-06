/**
 * clusterService.js
 * Orchestration layer for wallet clustering analysis.
 */
const db = require('../config/db');
const ClusterModel = require('../models/clusterModel');
const ClusterWalletModel = require('../models/clusterWalletModel');
const { detectClusters } = require('../utils/clusterDetection');
const { persistClusters } = require('../utils/clusterBuilder');

const ClusterService = {
    /**
     * Analyze a case: fetch its wallets + transactions, run clustering,
     * delete any previous clusters, and persist new results.
     * @param {string} caseId  UUID of the case
     * @returns {Object} { case_id, cluster_count, clusters }
     */
    async analyzeCase(caseId) {
        // 1. Validate the case exists
        const { rows: caseRows } = await db.query(
            'SELECT id FROM cases WHERE id = $1',
            [caseId]
        );
        if (caseRows.length === 0) {
            const error = new Error('Case not found');
            error.statusCode = 404;
            throw error;
        }

        // 2. Get all wallet addresses linked to this case
        const { rows: caseWallets } = await db.query(
            `SELECT w.address
             FROM case_wallets cw
             JOIN wallets w ON w.id = cw.wallet_id
             WHERE cw.case_id = $1`,
            [caseId]
        );

        if (caseWallets.length === 0) {
            const error = new Error('No wallets found for this case');
            error.statusCode = 404;
            throw error;
        }

        const addresses = caseWallets.map(w => w.address.toLowerCase());

        // 3. Fetch all transactions involving any of the case wallets
        const placeholders = addresses.map((_, i) => `$${i + 1}`).join(', ');
        const { rows: transactions } = await db.query(
            `SELECT tx_hash, from_address, to_address, amount, timestamp, block_number
             FROM transactions
             WHERE LOWER(from_address) IN (${placeholders})
                OR LOWER(to_address) IN (${placeholders})
             ORDER BY timestamp DESC`,
            [...addresses, ...addresses]
        );

        if (transactions.length === 0) {
            const error = new Error('No transactions found for wallets in this case');
            error.statusCode = 404;
            throw error;
        }

        // 4. Run clustering heuristics
        const { clusters, heuristicsUsed } = detectClusters(transactions);

        if (clusters.length === 0) {
            // Clean up previous results and return empty
            await ClusterModel.deleteByCaseId(caseId);
            return {
                case_id: caseId,
                cluster_count: 0,
                clusters: [],
                heuristics_used: heuristicsUsed,
                message: 'No clusters detected with current heuristics',
            };
        }

        // 5. Delete previous clusters for this case (re-analysis)
        await ClusterModel.deleteByCaseId(caseId);

        // 6. Persist new clusters
        const persisted = await persistClusters(caseId, clusters, heuristicsUsed);

        return {
            case_id: caseId,
            cluster_count: persisted.length,
            clusters: persisted,
            heuristics_used: heuristicsUsed,
        };
    },

    /**
     * Get all clusters (newest first), with wallet counts.
     */
    async getAllClusters() {
        return ClusterModel.findAll();
    },

    /**
     * Get a single cluster by its ID.
     */
    async getClusterById(id) {
        const cluster = await ClusterModel.findById(id);
        if (!cluster) {
            const error = new Error('Cluster not found');
            error.statusCode = 404;
            throw error;
        }
        return cluster;
    },

    /**
     * Get all wallet addresses belonging to a cluster.
     */
    async getClusterWallets(clusterId) {
        // Verify cluster exists
        const cluster = await ClusterModel.findById(clusterId);
        if (!cluster) {
            const error = new Error('Cluster not found');
            error.statusCode = 404;
            throw error;
        }

        const wallets = await ClusterWalletModel.findByClusterId(clusterId);
        return {
            cluster_id: clusterId,
            risk_score: cluster.risk_score,
            risk_level: cluster.risk_level,
            wallet_count: wallets.length,
            wallets,
        };
    },
};

module.exports = ClusterService;
