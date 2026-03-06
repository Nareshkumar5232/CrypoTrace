/**
 * graphBuilder.js
 * Builds directed graph representations from transaction records.
 */
const db = require('../config/db');

const GraphBuilder = {
    /**
     * Fetch all transactions involving a given address (as sender OR receiver).
     */
    async fetchTransactionsForAddress(address) {
        const addr = address.toLowerCase();
        const { rows } = await db.query(
            `SELECT tx_hash, from_address, to_address, amount, timestamp, block_number
       FROM transactions
       WHERE LOWER(from_address) = $1 OR LOWER(to_address) = $1
       ORDER BY timestamp DESC`,
            [addr]
        );
        return rows;
    },

    /**
     * Fetch all transactions for multiple addresses (used for case graphs).
     */
    async fetchTransactionsForAddresses(addresses) {
        if (!addresses || addresses.length === 0) return [];
        const lowerAddrs = addresses.map(a => a.toLowerCase());
        const { rows } = await db.query(
            `SELECT tx_hash, from_address, to_address, amount, timestamp, block_number
       FROM transactions
       WHERE LOWER(from_address) = ANY($1) OR LOWER(to_address) = ANY($1)
       ORDER BY timestamp DESC`,
            [lowerAddrs]
        );
        return rows;
    },

    /**
     * Build adjacency list + nodes/edges from an array of transaction rows.
     * Returns { adjacencyList, nodes, edges }
     */
    buildGraph(transactions) {
        const adjacencyList = {};   // { address: Set<address> }
        const nodeSet = new Set();
        const edges = [];

        for (const tx of transactions) {
            const from = (tx.from_address || '').toLowerCase();
            const to = (tx.to_address || '').toLowerCase();

            if (from) nodeSet.add(from);
            if (to) nodeSet.add(to);

            if (from && to) {
                if (!adjacencyList[from]) adjacencyList[from] = new Set();
                adjacencyList[from].add(to);

                edges.push({
                    from,
                    to,
                    amount: parseFloat(tx.amount) || 0,
                    tx_hash: tx.tx_hash,
                    timestamp: tx.timestamp,
                    block_number: tx.block_number,
                });
            }
        }

        const nodes = Array.from(nodeSet).map(id => ({ id }));

        // Convert Sets to arrays for JSON serialization
        const adjList = {};
        for (const [key, val] of Object.entries(adjacencyList)) {
            adjList[key] = Array.from(val);
        }

        return { adjacencyList: adjList, nodes, edges };
    },
};

module.exports = GraphBuilder;
