/**
 * reportBuilder.js
 * Fetches investigation data from all relevant tables and assembles
 * a structured report object for a given case.
 */
const db = require('../config/db');
const CaseModel = require('../models/caseModel');
const CaseNoteModel = require('../models/caseNoteModel');
const ClusterModel = require('../models/clusterModel');
const ClusterWalletModel = require('../models/clusterWalletModel');
const AlertModel = require('../models/alertModel');

const ReportBuilder = {
    /**
     * Build a full investigation report for a case.
     * @param {string} caseId  UUID of the case
     * @returns {Object} Structured report object
     */
    async buildReport(caseId) {
        // 1. Case information
        const caseInfo = await this._getCaseInformation(caseId);
        if (!caseInfo) {
            const err = new Error('Case not found');
            err.statusCode = 404;
            throw err;
        }

        // 2–8: Fetch all sections in parallel where possible
        const [
            wallets,
            transactionSummary,
            clusters,
            alerts,
            notes,
        ] = await Promise.all([
            this._getInvestigatedWallets(caseId),
            this._getTransactionFlowSummary(caseId),
            this._getClusters(caseId),
            AlertModel.getAlertsByCase(caseId),
            CaseNoteModel.findByCaseId(caseId),
        ]);

        // Derive laundering patterns & risk scores from fetched data
        const launderingPatterns = this._extractLaunderingPatterns(alerts);
        const riskScores = this._extractRiskScores(clusters);

        return {
            generated_at: new Date().toISOString(),
            case_information: {
                case_number: caseInfo.case_number,
                title: caseInfo.title,
                description: caseInfo.description,
                assigned_officer: caseInfo.officer_name || caseInfo.assigned_officer,
                status: caseInfo.status,
                priority: caseInfo.priority,
                created_at: caseInfo.created_at,
            },
            wallets,
            transaction_summary: transactionSummary,
            clusters,
            laundering_patterns: launderingPatterns,
            risk_scores: riskScores,
            alerts: alerts.map(a => ({
                id: a.id,
                alert_type: a.alert_type,
                severity: a.severity,
                status: a.status,
                created_at: a.created_at,
                details: a.details,
            })),
            investigator_notes: notes.map(n => ({
                id: n.id,
                note_text: n.note_text,
                author: n.author_name || 'Unknown',
                created_at: n.created_at,
            })),
        };
    },

    /**
     * Build a lightweight summary (counts only, no detail arrays).
     * @param {string} caseId
     * @returns {Object}
     */
    async buildSummary(caseId) {
        const caseInfo = await this._getCaseInformation(caseId);
        if (!caseInfo) {
            const err = new Error('Case not found');
            err.statusCode = 404;
            throw err;
        }

        const [wallets, transactionSummary, clusters, alerts, notes] = await Promise.all([
            this._getInvestigatedWallets(caseId),
            this._getTransactionFlowSummary(caseId),
            ClusterModel.findByCaseId(caseId),
            AlertModel.getAlertsByCase(caseId),
            CaseNoteModel.findByCaseId(caseId),
        ]);

        const patternTypes = [...new Set(
            alerts
                .filter(a => ['FAN_OUT', 'FAN_IN', 'PEEL_CHAIN', 'RAPID_ROUTING',
                    'FAN_OUT_DETECTED', 'FAN_IN_DETECTED', 'PEEL_CHAIN_DETECTED', 'RAPID_ROUTING_DETECTED']
                    .includes(a.alert_type))
                .map(a => a.alert_type.replace('_DETECTED', ''))
        )];

        return {
            generated_at: new Date().toISOString(),
            case_number: caseInfo.case_number,
            title: caseInfo.title,
            status: caseInfo.status,
            priority: caseInfo.priority,
            assigned_officer: caseInfo.officer_name || caseInfo.assigned_officer,
            counts: {
                wallets: wallets.length,
                transactions: transactionSummary.total_transactions,
                clusters: clusters.length,
                alerts: alerts.length,
                laundering_patterns: patternTypes.length,
                notes: notes.length,
            },
            transaction_summary: transactionSummary,
            detected_patterns: patternTypes,
        };
    },

    // ─────────────── Internal helpers ───────────────

    async _getCaseInformation(caseId) {
        return CaseModel.findById(caseId);
    },

    /**
     * Get wallets linked to the case with transaction counts.
     */
    async _getInvestigatedWallets(caseId) {
        const { rows } = await db.query(
            `SELECT w.id, w.address AS wallet_address, w.blockchain_type,
                    COALESCE(tc.tx_count, 0)::int AS transaction_count
             FROM case_wallets cw
             JOIN wallets w ON cw.wallet_id = w.id
             LEFT JOIN (
                 SELECT wallet_id, COUNT(*)::int AS tx_count
                 FROM transactions
                 GROUP BY wallet_id
             ) tc ON tc.wallet_id = w.id
             WHERE cw.case_id = $1
             ORDER BY tc.tx_count DESC NULLS LAST`,
            [caseId]
        );
        return rows;
    },

    /**
     * Aggregate transaction statistics across all wallets in the case.
     */
    async _getTransactionFlowSummary(caseId) {
        const { rows } = await db.query(
            `SELECT
                 COUNT(*)::int             AS total_transactions,
                 COALESCE(SUM(t.amount), 0) AS total_value_transferred,
                 MIN(t.timestamp)          AS earliest_transaction,
                 MAX(t.timestamp)          AS latest_transaction
             FROM transactions t
             WHERE t.wallet_id IN (
                 SELECT w.id FROM case_wallets cw
                 JOIN wallets w ON cw.wallet_id = w.id
                 WHERE cw.case_id = $1
             )`,
            [caseId]
        );

        const row = rows[0] || {};
        return {
            total_transactions: row.total_transactions || 0,
            total_value_transferred: parseFloat(row.total_value_transferred) || 0,
            earliest_transaction: row.earliest_transaction || null,
            latest_transaction: row.latest_transaction || null,
        };
    },

    /**
     * Get clusters with their wallet lists.
     */
    async _getClusters(caseId) {
        const clusters = await ClusterModel.findByCaseId(caseId);
        const results = [];

        for (const cluster of clusters) {
            const wallets = await ClusterWalletModel.findByClusterId(cluster.id);
            results.push({
                cluster_id: cluster.id,
                risk_score: cluster.risk_score,
                risk_level: cluster.risk_level,
                wallet_count: wallets.length,
                wallets: wallets.map(w => w.wallet_address),
                created_at: cluster.created_at,
            });
        }

        return results;
    },

    /**
     * Extract unique laundering pattern types from alerts.
     */
    _extractLaunderingPatterns(alerts) {
        const PATTERN_TYPES = ['FAN_OUT', 'FAN_IN', 'PEEL_CHAIN', 'RAPID_ROUTING'];
        const detected = [];

        for (const type of PATTERN_TYPES) {
            const matching = alerts.filter(
                a => a.alert_type === type || a.alert_type === `${type}_DETECTED`
            );
            if (matching.length > 0) {
                detected.push({
                    pattern: type,
                    occurrences: matching.length,
                    highest_severity: matching[0].severity, // alerts are pre-sorted by severity
                });
            }
        }

        return detected;
    },

    /**
     * Extract risk scores from clusters.
     */
    _extractRiskScores(clusters) {
        return clusters.map(c => ({
            cluster_id: c.cluster_id,
            risk_score: c.risk_score,
            risk_level: c.risk_level,
            wallet_count: c.wallet_count,
        }));
    },
};

module.exports = ReportBuilder;
