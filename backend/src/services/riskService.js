/**
 * riskService.js
 * Orchestrates the risk scoring pipeline:
 *   clusters → alerts → OSINT → riskCalculator → persist
 */
const db = require('../config/db');
const ClusterModel = require('../models/clusterModel');
const ClusterWalletModel = require('../models/clusterWalletModel');
const AlertModel = require('../models/alertModel');
const OsintService = require('./osintService');
const { calculateRiskScore } = require('../utils/riskCalculator');

const RiskService = {
    /**
     * Run full risk analysis for all clusters in a case.
     * @param {string} caseId  UUID
     */
    async analyzeCase(caseId) {
        // 1. Validate case
        const { rows: caseRows } = await db.query(
            'SELECT id FROM cases WHERE id = $1',
            [caseId]
        );
        if (caseRows.length === 0) {
            const err = new Error('Case not found');
            err.statusCode = 404;
            throw err;
        }

        // 2. Fetch clusters for this case
        const clusters = await ClusterModel.findByCaseId(caseId);
        if (clusters.length === 0) {
            const err = new Error('No clusters found for this case. Run clustering analysis first.');
            err.statusCode = 404;
            throw err;
        }

        // 3. Get all alerts for the case (pattern detection results)
        const alerts = await AlertModel.getAlertsByCase(caseId);

        // 4. Score each cluster
        const results = [];
        for (const cluster of clusters) {
            // 4a. Get wallets in this cluster
            const wallets = await ClusterWalletModel.findByClusterId(cluster.id);
            const addresses = wallets.map(w => w.wallet_address);

            // 4b. Filter alerts relevant to this cluster's wallets
            const clusterAlerts = alerts.filter(a => {
                // An alert is relevant if its details mention any of the cluster's wallets
                if (a.cluster_id === cluster.id) return true;
                if (a.details && a.details.primary_wallet) {
                    return addresses.includes(a.details.primary_wallet.toLowerCase());
                }
                // Also check related_wallets
                if (a.details && Array.isArray(a.details.related_wallets)) {
                    return a.details.related_wallets.some(rw => addresses.includes(rw.toLowerCase()));
                }
                return false;
            });

            // 4c. Run OSINT check on all wallets in the cluster
            const osintMatches = await OsintService.checkAddresses(addresses);

            // 4d. Calculate score
            const { risk_score, risk_level, indicators } = calculateRiskScore(clusterAlerts, osintMatches);

            // 4e. Persist updated score to DB
            await ClusterModel.updateRiskScore(cluster.id, risk_score, risk_level);

            results.push({
                cluster_id: cluster.id,
                wallet_count: addresses.length,
                risk_score,
                risk_level,
                indicators,
                alert_count: clusterAlerts.length,
                osint_hits: osintMatches.length,
            });
        }

        return {
            case_id: caseId,
            clusters_analyzed: results.length,
            results,
        };
    },

    /**
     * Get risk details for a single cluster.
     */
    async getClusterRisk(clusterId) {
        const cluster = await ClusterModel.findById(clusterId);
        if (!cluster) {
            const err = new Error('Cluster not found');
            err.statusCode = 404;
            throw err;
        }

        // Get wallet addresses
        const wallets = await ClusterWalletModel.findByClusterId(clusterId);
        const addresses = wallets.map(w => w.wallet_address);

        // Get OSINT data
        const osintMatches = await OsintService.checkAddresses(addresses);

        // Get alerts linked to the cluster
        const { rows: clusterAlerts } = await db.query(
            `SELECT * FROM alerts 
             WHERE cluster_id = $1 
             ORDER BY severity DESC`,
            [clusterId]
        );

        // Recalculate (or just return stored score — we return both)
        const { risk_score, risk_level, indicators } = calculateRiskScore(clusterAlerts, osintMatches);

        return {
            cluster_id: clusterId,
            stored_risk_score: cluster.risk_score,
            stored_risk_level: cluster.risk_level,
            computed_risk_score: risk_score,
            computed_risk_level: risk_level,
            wallet_count: addresses.length,
            wallets: addresses,
            indicators,
            alerts: clusterAlerts,
            osint_matches: osintMatches,
        };
    },

    /**
     * Get all clusters with risk_score >= 7 (HIGH or CRITICAL).
     */
    async getHighRiskClusters() {
        return ClusterModel.findHighRisk(7);
    },

    /**
     * Get risk summary for all clusters in a case.
     */
    async getCaseRiskSummary(caseId) {
        // Validate case
        const { rows: caseRows } = await db.query(
            'SELECT id FROM cases WHERE id = $1',
            [caseId]
        );
        if (caseRows.length === 0) {
            const err = new Error('Case not found');
            err.statusCode = 404;
            throw err;
        }

        const clusters = await ClusterModel.findByCaseId(caseId);

        // Compute summary stats
        const summary = {
            case_id: caseId,
            total_clusters: clusters.length,
            risk_distribution: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
            highest_risk_score: 0,
            clusters: clusters.map(c => ({
                cluster_id: c.id,
                risk_score: c.risk_score,
                risk_level: c.risk_level,
                wallet_count: c.wallet_count,
            })),
        };

        for (const c of clusters) {
            summary.risk_distribution[c.risk_level] = (summary.risk_distribution[c.risk_level] || 0) + 1;
            if (c.risk_score > summary.highest_risk_score) {
                summary.highest_risk_score = c.risk_score;
            }
        }

        return summary;
    },
};

module.exports = RiskService;
