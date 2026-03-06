const GraphService = require('../services/graphService');

const GraphController = {
    /**
     * GET /api/graph/wallet/:address
     * Returns the transaction graph for a single wallet.
     */
    async getWalletGraph(req, res, next) {
        try {
            const { address } = req.params;
            if (!address) {
                return res.status(400).json({ error: 'Wallet address is required' });
            }
            const graph = await GraphService.getWalletGraph(address);
            return res.status(200).json(graph);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/graph/trace/:address?depth=5
     * Traces fund flow from a wallet using BFS up to given depth.
     */
    async traceFundFlow(req, res, next) {
        try {
            const { address } = req.params;
            const depth = req.query.depth || 5;

            if (!address) {
                return res.status(400).json({ error: 'Wallet address is required' });
            }

            const parsedDepth = parseInt(depth, 10);
            if (isNaN(parsedDepth) || parsedDepth < 1) {
                return res.status(400).json({ error: 'Depth must be a positive integer' });
            }

            const result = await GraphService.traceFundFlow(address, parsedDepth);
            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/graph/case/:case_id
     * Returns the combined transaction graph for all wallets in a case.
     */
    async getCaseGraph(req, res, next) {
        try {
            const { case_id } = req.params;
            if (!case_id) {
                return res.status(400).json({ error: 'Case ID is required' });
            }
            const graph = await GraphService.getCaseGraph(case_id);
            return res.status(200).json(graph);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = GraphController;
