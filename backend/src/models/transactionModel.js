const db = require('../config/db');

const TransactionModel = {
    /**
     * Insert a transaction, ignoring duplicates based on tx_hash.
     * Returns the inserted row or null if duplicate.
     */
    async upsert({ tx_hash, from_address, to_address, amount, timestamp, block_number, wallet_id }) {
        const { rows } = await db.query(
            `INSERT INTO transactions (tx_hash, from_address, to_address, amount, timestamp, block_number, wallet_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (tx_hash) DO NOTHING
       RETURNING *`,
            [tx_hash, from_address, to_address, amount, timestamp, block_number, wallet_id]
        );
        return rows[0] || null;
    },

    /**
     * Bulk insert transactions, skipping duplicates.
     * Returns the number of successfully imported rows.
     */
    async bulkInsert(transactions) {
        if (!transactions || transactions.length === 0) return 0;

        let insertedCount = 0;
        // Sequential insert to handle conflicts cleanly per row
        // (A real production system might use unnest() for high volume bulk inserts)
        for (const tx of transactions) {
            try {
                const result = await this.upsert(tx);
                if (result) insertedCount++;
            } catch (err) {
                console.error(`Error inserting tx ${tx.tx_hash}: ${err.message}`);
                // Continue with the rest even if one fails
            }
        }
        return insertedCount;
    },

    /**
     * Find transactions by wallet ID.
     */
    async findByWalletId(wallet_id) {
        const { rows } = await db.query(
            `SELECT * FROM transactions
       WHERE wallet_id = $1
       ORDER BY timestamp DESC`,
            [wallet_id]
        );
        return rows;
    },

    /**
     * Count transactions for a wallet.
     */
    async countByWalletId(wallet_id) {
        const { rows } = await db.query(
            'SELECT COUNT(*)::int AS count FROM transactions WHERE wallet_id = $1',
            [wallet_id]
        );
        return rows[0].count;
    },
};

module.exports = TransactionModel;
