const db = require('../config/db');

const CaseWalletModel = {
    /**
     * Link a wallet to a case.
     */
    async addWallet(case_id, wallet_id) {
        const { rows } = await db.query(
            `INSERT INTO case_wallets (id, case_id, wallet_id, added_at)
       VALUES (gen_random_uuid(), $1, $2, NOW())
       RETURNING *`,
            [case_id, wallet_id]
        );
        return rows[0];
    },

    /**
     * Get all wallets linked to a case.
     */
    async findByCaseId(case_id) {
        const { rows } = await db.query(
            `SELECT cw.id, cw.case_id, cw.wallet_id, cw.added_at,
              w.address AS wallet_address, w.label AS wallet_label
       FROM case_wallets cw
       LEFT JOIN wallets w ON cw.wallet_id = w.id
       WHERE cw.case_id = $1
       ORDER BY cw.added_at DESC`,
            [case_id]
        );
        return rows;
    },

    /**
     * Check if a wallet is already linked to a case.
     */
    async exists(case_id, wallet_id) {
        const { rows } = await db.query(
            `SELECT id FROM case_wallets WHERE case_id = $1 AND wallet_id = $2`,
            [case_id, wallet_id]
        );
        return rows.length > 0;
    },
};

module.exports = CaseWalletModel;
