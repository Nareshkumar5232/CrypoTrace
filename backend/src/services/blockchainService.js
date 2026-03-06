/**
 * blockchainService.js
 * External integration service for fetching blockchain data.
 */
const apiClient = require('../utils/apiClient');

const ETHERSCAN_BASE = 'https://api.etherscan.io/v2/api';

const BlockchainService = {
    /**
     * Fetches the transaction list for an Ethereum address via Etherscan API.
     * @param {string} address - The wallet address to fetch
     * @returns {Promise<Array>} Array of raw transaction objects
     */
    async fetchEthTransactions(address) {
        const apiKey = process.env.ETHERSCAN_API_KEY;
        if (!apiKey) {
            throw new Error('ETHERSCAN_API_KEY environment variable is missing');
        }

        const url = `${ETHERSCAN_BASE}?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;

        const response = await apiClient.get(url);
        const data = response.data;

        if (data.status !== '1' && data.message !== 'No transactions found') {
            if (data.message === 'No transactions found' || data.result?.length === 0) {
                return [];
            }
            const error = new Error(`Etherscan API error: ${data.message || 'Unknown error'}`);
            error.statusCode = 502;
            throw error;
        }

        return data.result || [];
    },

    /**
     * Universal fetch facade for future blockchain support (BTC, etc.)
     * @param {string} address - Wallet address
     * @param {string} blockchainType - 'ETH', 'BTC', etc.
     */
    async fetchTransactions(address, blockchainType) {
        switch ((blockchainType || 'ETH').toUpperCase()) {
            case 'ETH':
                return this.fetchEthTransactions(address);
            default: {
                const error = new Error(`Blockchain type '${blockchainType}' is not supported yet`);
                error.statusCode = 400;
                throw error;
            }
        }
    },
};

module.exports = BlockchainService;
