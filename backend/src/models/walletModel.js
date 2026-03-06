const db = require('../config/db');

const WalletModel = {
    /**
     * Create a new wallet.
     */
    async create({ address, blockchain_type }) {
        const { rows } = await db.query(
            `INSERT INTO wallets (id, address, blockchain_type, created_at)
       VALUES (gen_random_uuid(), $1, $2, NOW())
       RETURNING *`,
            [address, blockchain_type || 'ETH']
        );
        return rows[0];
    },

    /**
     * Find all wallets.
     */
    async findAll() {
        const { rows } = await db.query(
            'SELECT * FROM wallets ORDER BY created_at DESC'
        );
        return rows;
    },

    /**
     * Find a wallet by id.
     */
    async findById(id) {
        const { rows } = await db.query(
            'SELECT * FROM wallets WHERE id = $1',
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Find a wallet by address.
     */
    async findByAddress(address) {
        const { rows } = await db.query(
            'SELECT * FROM wallets WHERE address = $1',
            [address]
        );
        return rows[0] || null;
    },
};

module.exports = WalletModel;
