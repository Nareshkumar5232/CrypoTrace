/**
 * graphService.js
 * Orchestrates graph building and traversal for wallet analysis.
 */
const db = require('../config/db');
const GraphBuilder = require('../utils/graphBuilder');
const GraphTraversal = require('../utils/graphTraversal');

const GraphService = {
    /**
     * 1. Get the full transaction graph for a single wallet address.
     *    Returns { nodes, edges } for front-end visualization.
     */
    async getWalletGraph(address) {
        const transactions = await GraphBuilder.fetchTransactionsForAddress(address);

        if (transactions.length === 0) {
            const error = new Error('No transactions found for this wallet address');
            error.statusCode = 404;
            throw error;
        }

        const { nodes, edges } = GraphBuilder.buildGraph(transactions);
        return { nodes, edges };
    },

    /**
     * 2. Trace fund flow from a wallet address using BFS up to `depth` hops.
     *    Fetches the full transaction set, builds the graph, then traverses.
     */
    async traceFundFlow(address, depth = 5) {
        // Clamp depth to a safe range
        const safeDepth = Math.min(Math.max(parseInt(depth, 10) || 5, 1), 10);

        // Fetch all transactions from DB (could be large in production; 
        // acceptable for demo-scale data)
        const { rows: allTx } = await db.query(
            `SELECT tx_hash, from_address, to_address, amount, timestamp, block_number
       FROM transactions
       ORDER BY timestamp DESC`
        );

        if (allTx.length === 0) {
            const error = new Error('No transactions exist in the database');
            error.statusCode = 404;
            throw error;
        }

        const { adjacencyList, edges: allEdges } = GraphBuilder.buildGraph(allTx);

        const addr = address.toLowerCase();
        if (!adjacencyList[addr] && !allEdges.some(e => e.to.toLowerCase() === addr)) {
            const error = new Error('Wallet address not found in transaction records');
            error.statusCode = 404;
            throw error;
        }

        const { visitedNodes, traversalEdges } = GraphTraversal.bfs(
            adjacencyList, allEdges, addr, safeDepth
        );

        return {
            start_address: addr,
            depth: safeDepth,
            nodes: visitedNodes,
            edges: traversalEdges,
        };
    },

    /**
     * 3. Get the combined transaction graph for all wallets in a case.
     */
    async getCaseGraph(caseId) {
        // Get all wallets linked to this case via case_wallets join table
        const { rows: caseWallets } = await db.query(
            `SELECT w.address
       FROM case_wallets cw
       JOIN wallets w ON w.id = cw.wallet_id
       WHERE cw.case_id = $1`,
            [caseId]
        );

        if (caseWallets.length === 0) {
            const error = new Error('No wallets found for this case');
            error.statusCode = 404;
            throw error;
        }

        const addresses = caseWallets.map(w => w.address);
        const transactions = await GraphBuilder.fetchTransactionsForAddresses(addresses);

        if (transactions.length === 0) {
            const error = new Error('No transactions found for wallets in this case');
            error.statusCode = 404;
            throw error;
        }

        const { nodes, edges } = GraphBuilder.buildGraph(transactions);
        return { case_id: caseId, wallet_count: addresses.length, nodes, edges };
    },
};

module.exports = GraphService;
