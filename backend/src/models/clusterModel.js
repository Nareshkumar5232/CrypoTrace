const db = require('../config/db');

const ClusterModel = {
    /**
     * Create a new cluster record.
     */
    async create({ case_id, risk_score, risk_level, heuristics_matched }) {
        const { rows } = await db.query(
            `INSERT INTO clusters (id, case_id, risk_score, risk_level, heuristics_matched, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
       RETURNING *`,
            [case_id, risk_score, risk_level, heuristics_matched || []]
        );
        return rows[0];
    },

    /**
     * Find all clusters, newest first.
     */
    async findAll() {
        const { rows } = await db.query(
            `SELECT c.*,
              (SELECT COUNT(*)::int FROM cluster_wallets cw WHERE cw.cluster_id = c.id) AS wallet_count
       FROM clusters c
       ORDER BY c.created_at DESC`
        );
        return rows;
    },

    /**
     * Find a single cluster by ID.
     */
    async findById(id) {
        const { rows } = await db.query(
            `SELECT c.*,
              (SELECT COUNT(*)::int FROM cluster_wallets cw WHERE cw.cluster_id = c.id) AS wallet_count
       FROM clusters c
       WHERE c.id = $1`,
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Find all clusters for a given case.
     */
    async findByCaseId(case_id) {
        const { rows } = await db.query(
            `SELECT c.*,
              (SELECT COUNT(*)::int FROM cluster_wallets cw WHERE cw.cluster_id = c.id) AS wallet_count
       FROM clusters c
       WHERE c.case_id = $1
       ORDER BY c.risk_score DESC`,
            [case_id]
        );
        return rows;
    },

    /**
     * Delete a cluster and its wallet associations (cascades).
     */
    async deleteById(id) {
        const { rowCount } = await db.query(
            'DELETE FROM clusters WHERE id = $1',
            [id]
        );
        return rowCount > 0;
    },

    /**
     * Delete all clusters for a case (used before re-analysis).
     */
    async deleteByCaseId(case_id) {
        const { rowCount } = await db.query(
            'DELETE FROM clusters WHERE case_id = $1',
            [case_id]
        );
        return rowCount;
    },

    /**
     * Update risk score and level for a cluster (Module 8).
     */
    async updateRiskScore(clusterId, riskScore, riskLevel) {
        const { rows } = await db.query(
            `UPDATE clusters
             SET risk_score = $1, risk_level = $2
             WHERE id = $3
             RETURNING *`,
            [riskScore, riskLevel, clusterId]
        );
        return rows[0] || null;
    },

    /**
     * Find clusters with risk_score >= minScore (Module 8).
     */
    async findHighRisk(minScore = 7) {
        const { rows } = await db.query(
            `SELECT c.*,
              (SELECT COUNT(*)::int FROM cluster_wallets cw WHERE cw.cluster_id = c.id) AS wallet_count
             FROM clusters c
             WHERE c.risk_score >= $1
             ORDER BY c.risk_score DESC, c.created_at DESC`,
            [minScore]
        );
        return rows;
    },
};

module.exports = ClusterModel;
