const db = require('../config/db');

const AlertModel = {
    /**
     * Create multiple alert records in bulk.
     * @param {Array} alerts - Array of alert objects
     * @returns {Array} Created alert records
     */
    async createAlerts(alerts) {
        if (!alerts || alerts.length === 0) return [];

        // Build a multi-row VALUES clause
        const values = [];
        const params = [];
        let paramIndex = 1;

        alerts.forEach((alert) => {
            const { case_id, cluster_id, alert_type, severity, details } = alert;
            params.push(case_id, cluster_id || null, alert_type, severity, details || {});

            values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, 'NEW', $${paramIndex + 4}, NOW())`);
            paramIndex += 5;
        });

        const query = `
            INSERT INTO alerts (case_id, cluster_id, alert_type, severity, status, details, created_at)
            VALUES ${values.join(', ')}
            RETURNING *`;

        const { rows } = await db.query(query, params);
        return rows;
    },

    /**
     * Get all alerts for a specific case.
     */
    async getAlertsByCase(caseId) {
        const { rows } = await db.query(
            `SELECT * FROM alerts 
             WHERE case_id = $1 
             ORDER BY 
                CASE severity 
                    WHEN 'CRITICAL' THEN 1 
                    WHEN 'HIGH' THEN 2 
                    WHEN 'MEDIUM' THEN 3 
                    WHEN 'LOW' THEN 4 
                END ASC,
                created_at DESC`,
            [caseId]
        );
        return rows;
    },

    /**
     * Get all alerts globally, sorted by severity and recency.
     */
    async getAllAlerts() {
        const { rows } = await db.query(
            `SELECT * FROM alerts 
             ORDER BY 
                CASE severity 
                    WHEN 'CRITICAL' THEN 1 
                    WHEN 'HIGH' THEN 2 
                    WHEN 'MEDIUM' THEN 3 
                    WHEN 'LOW' THEN 4 
                END ASC,
                created_at DESC`
        );
        return rows;
    },

    /**
     * Find a single alert by ID.
     */
    async findById(alertId) {
        const { rows } = await db.query(
            'SELECT * FROM alerts WHERE id = $1',
            [alertId]
        );
        return rows[0] || null;
    },

    /**
     * Update the status of an alert.
     */
    async updateStatus(alertId, status) {
        const { rows } = await db.query(
            `UPDATE alerts 
             SET status = $1 
             WHERE id = $2 
             RETURNING *`,
            [status, alertId]
        );
        return rows[0] || null;
    },

    /**
     * Delete prior auto-generated alerts for a case before re-analysis.
     * This ensures we don't duplicate patterns on repeated analysis.
     * Note: We might want to keep manually edited ones in a real system,
     * but for now we'll reset them.
     */
    async clearPriorAlertsForCase(caseId) {
        const { rowCount } = await db.query(
            'DELETE FROM alerts WHERE case_id = $1',
            [caseId]
        );
        return rowCount;
    }
};

module.exports = AlertModel;
