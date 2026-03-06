const db = require('../config/db');

const ClusterWalletModel = {
    /**
     * Bulk-insert wallet addresses into a cluster.
     * @param {string}   clusterId - UUID of the cluster
     * @param {string[]} addresses - Array of wallet addresses
     * @returns {number} Number of rows inserted
     */
    async addWallets(clusterId, addresses) {
        if (!addresses || addresses.length === 0) return 0;

        // Build a multi-row VALUES clause
        const values = [];
        const params = [clusterId];
        addresses.forEach((addr, i) => {
            params.push(addr.toLowerCase());
            values.push(`($1, $${i + 2}, NOW())`);
        });

        const { rowCount } = await db.query(
            `INSERT INTO cluster_wallets (cluster_id, wallet_address, created_at)
       VALUES ${values.join(', ')}`,
            params
        );
        return rowCount;
    },

    /**
     * Get all wallet addresses belonging to a cluster.
     */
    async findByClusterId(clusterId) {
        const { rows } = await db.query(
            `SELECT id, cluster_id, wallet_address, created_at
       FROM cluster_wallets
       WHERE cluster_id = $1
       ORDER BY created_at ASC`,
            [clusterId]
        );
        return rows;
    },

    /**
     * Delete all wallet associations for a cluster.
     */
    async deleteByClusterId(clusterId) {
        const { rowCount } = await db.query(
            'DELETE FROM cluster_wallets WHERE cluster_id = $1',
            [clusterId]
        );
        return rowCount;
    },
};

module.exports = ClusterWalletModel;
