const WalletService = require('../services/walletService');

const WalletController = {
    /**
     * POST /api/wallets
     */
    async createWallet(req, res, next) {
        try {
            const { address, blockchain_type } = req.body;
            const wallet = await WalletService.createWallet({ address, blockchain_type });
            return res.status(201).json(wallet);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/wallets
     */
    async getWallets(req, res, next) {
        try {
            const wallets = await WalletService.getAllWallets();
            return res.status(200).json(wallets);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/wallets/:id
     */
    async getWalletById(req, res, next) {
        try {
            const wallet = await WalletService.getWalletById(req.params.id);
            return res.status(200).json(wallet);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/wallets/address/:address
     */
    async getWalletByAddress(req, res, next) {
        try {
            const wallet = await WalletService.getWalletByAddress(req.params.address);
            return res.status(200).json(wallet);
        } catch (err) {
            next(err);
        }
    },

    /**
     * POST /api/wallets/analyze
     */
    async analyzeWallet(req, res, next) {
        try {
            const { wallet_id } = req.body;
            if (!wallet_id) {
                return res.status(400).json({ error: 'wallet_id is required' });
            }
            const result = await WalletService.analyzeWallet(wallet_id);
            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/wallets/:id/transactions
     */
    async getWalletTransactions(req, res, next) {
        try {
            const transactions = await WalletService.getWalletTransactions(req.params.id);
            return res.status(200).json(transactions);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = WalletController;
