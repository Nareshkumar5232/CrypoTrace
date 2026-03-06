/**
 * launderingService.js
 * Service orchestrating case transactions, detection of laundering patterns, and alert persistence.
 */
const db = require('../config/db');
const AlertModel = require('../models/alertModel');
const PatternDetector = require('../utils/patternDetector');

const LaunderingService = {
    /**
     * Analyze a case's transactions and generate laundering alerts.
     */
    async analyzeCase(caseId) {
        // 1. Verify case exists
        const { rows: caseRows } = await db.query(
            'SELECT id FROM cases WHERE id = $1',
            [caseId]
        );
        if (caseRows.length === 0) {
            const err = new Error('Case not found');
            err.statusCode = 404;
            throw err;
        }

        // 2. Fetch all wallets linked to this case
        const { rows: caseWallets } = await db.query(
            `SELECT w.address 
             FROM case_wallets cw 
             JOIN wallets w ON w.id = cw.wallet_id 
             WHERE cw.case_id = $1`,
            [caseId]
        );

        if (caseWallets.length === 0) {
            const err = new Error('No wallets linked to this case for analysis');
            err.statusCode = 404;
            throw err;
        }

        const addresses = caseWallets.map(w => w.address.toLowerCase());

        // 3. Fetch all transactions involving any of these wallets
        // Performance note: In a massive DB we would need depth limits. Since we only want a 
        // 1-hop buffer for fan-in/fan-out context, this handles our immediate graph neighbor requirements.
        const placeholders = addresses.map((_, i) => `$${i + 1}`).join(', ');
        const { rows: transactions } = await db.query(
            `SELECT tx_hash, from_address, to_address, amount, timestamp, block_number
             FROM transactions 
             WHERE LOWER(from_address) IN (${placeholders}) 
                OR LOWER(to_address) IN (${placeholders})
             ORDER BY timestamp ASC`,
            [...addresses, ...addresses]
        );

        if (transactions.length === 0) {
            const err = new Error('No transactions found for the wallets in this case');
            err.statusCode = 404;
            throw err;
        }

        // 4. Run detection engine
        const detectedPatterns = PatternDetector.detectAllPatterns(transactions);

        // 5. Clean up old auto-generated alerts for this case (if re-analyzing)
        await AlertModel.clearPriorAlertsForCase(caseId);

        if (detectedPatterns.length === 0) {
            return {
                case_id: caseId,
                message: 'Analysis complete. No suspicious laundering patterns detected.',
                alerts_generated: 0,
                patterns: []
            };
        }

        // 6. Map to alert format for the database
        const alertsToCreate = detectedPatterns.map(pattern => ({
            case_id: caseId,
            cluster_id: null, // If clustering integration is active, map wallet to its cluster ID here.
            alert_type: pattern.pattern_type,
            severity: pattern.severity,
            details: {
                primary_wallet: pattern.wallet,
                related_wallets: pattern.related_wallets,
                tx_hashes: pattern.tx_hashes,
                metrics: pattern.details
            }
        }));

        // 7. Persist to alerts table
        const generatedAlerts = await AlertModel.createAlerts(alertsToCreate);

        return {
            case_id: caseId,
            message: `Analysis complete. ${generatedAlerts.length} suspicious patterns detected.`,
            alerts_generated: generatedAlerts.length,
            patterns: generatedAlerts
        };
    },

    /**
     * Get all detected laundering patterns (alerts) for a specific case.
     */
    async getPatternsByCase(caseId) {
        return AlertModel.getAlertsByCase(caseId);
    },

    /**
     * Get all cross-case alerts.
     */
    async getAllAlerts() {
        return AlertModel.getAllAlerts();
    },

    /**
     * Update an alert's status.
     */
    async updateAlertStatus(alertId, status) {
        const validStatuses = ['NEW', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'];
        if (!validStatuses.includes(status)) {
            const err = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
            err.statusCode = 400;
            throw err;
        }

        const alert = await AlertModel.updateStatus(alertId, status);
        if (!alert) {
            const err = new Error('Alert not found');
            err.statusCode = 404;
            throw err;
        }
        return alert;
    }
};

module.exports = LaunderingService;
