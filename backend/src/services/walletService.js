const WalletModel = require('../models/walletModel');
const TransactionModel = require('../models/transactionModel');
const TransactionImportService = require('./transactionImportService');

const VALID_BLOCKCHAINS = ['ETH', 'BTC'];

const WalletService = {
    /**
     * Create a new wallet.
     */
    async createWallet({ address, blockchain_type }) {
        if (!address) {
            const error = new Error('Wallet address is required');
            error.statusCode = 400;
            throw error;
        }

        const type = (blockchain_type || 'ETH').toUpperCase();
        if (!VALID_BLOCKCHAINS.includes(type)) {
            const error = new Error(`Invalid blockchain_type. Must be one of: ${VALID_BLOCKCHAINS.join(', ')}`);
            error.statusCode = 400;
            throw error;
        }

        // Check for duplicate address
        const existing = await WalletModel.findByAddress(address);
        if (existing) {
            const error = new Error('A wallet with this address already exists');
            error.statusCode = 409;
            throw error;
        }

        return WalletModel.create({ address, blockchain_type: type });
    },

    /**
     * Get all wallets.
     */
    async getAllWallets() {
        return WalletModel.findAll();
    },

    /**
     * Get a wallet by id.
     */
    async getWalletById(id) {
        const wallet = await WalletModel.findById(id);
        if (!wallet) {
            const error = new Error('Wallet not found');
            error.statusCode = 404;
            throw error;
        }
        return wallet;
    },

    /**
     * Get a wallet by address.
     */
    async getWalletByAddress(address) {
        const wallet = await WalletModel.findByAddress(address);
        if (!wallet) {
            const error = new Error('Wallet not found');
            error.statusCode = 404;
            throw error;
        }
        return wallet;
    },

    /**
     * Trigger blockchain analysis for a wallet, utilizing the TransactionImportService pipeline.
     */
    async analyzeWallet(wallet_id) {
        const wallet = await this.getWalletById(wallet_id);

        // Call the dedicated import service
        const importedCount = await TransactionImportService.importWalletTransactions(wallet);

        // Get final count from DB
        const totalCount = await TransactionModel.countByWalletId(wallet_id);

        return {
            wallet_id,
            address: wallet.address,
            blockchain_type: wallet.blockchain_type,
            imported: importedCount,
            total_transactions: totalCount,
        };
    },

    /**
     * Get transactions for a wallet.
     */
    async getWalletTransactions(wallet_id) {
        await this.getWalletById(wallet_id); // ensure wallet exists
        return TransactionModel.findByWalletId(wallet_id);
    },
};

module.exports = WalletService;
