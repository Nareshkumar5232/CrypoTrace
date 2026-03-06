/**
 * transactionImportService.js
 * Coordinates fetching, parsing, and storing blockhain transactions.
 */
const BlockchainService = require('./blockchainService');
const TransactionModel = require('../models/transactionModel');
const { parseEtherscanTransactions } = require('../utils/txParser');

const TransactionImportService = {
    /**
     * Imports transactions for a specific wallet:
     * 1. Fetches from external API via BlockchainService
     * 2. Parses raw API responses into DB format via txParser
     * 3. Inserts into database ignoring duplicates via TransactionModel
     * 
     * @param {Object} wallet - The wallet object with id, address, and blockchain_type
     * @returns {Promise<number>} Number of newly imported transactions
     */
    async importWalletTransactions(wallet) {
        if (!wallet || !wallet.id || !wallet.address) {
            throw new Error('Invalid wallet object provided for import');
        }

        // 1. Fetch raw data
        const rawTxList = await BlockchainService.fetchTransactions(
            wallet.address,
            wallet.blockchain_type
        );

        if (!rawTxList || rawTxList.length === 0) {
            return 0; // Nothing to import
        }

        // 2. Parse data
        let parsedTransactions = [];
        if (wallet.blockchain_type === 'ETH' || !wallet.blockchain_type) {
            parsedTransactions = parseEtherscanTransactions(rawTxList, wallet.id);
        } else {
            throw new Error(`Parser not implemented for blockchain: ${wallet.blockchain_type}`);
        }

        // 3. Store data (duplicates are ignored internally by model)
        const importedCount = await TransactionModel.bulkInsert(parsedTransactions);

        return importedCount;
    },
};

module.exports = TransactionImportService;
