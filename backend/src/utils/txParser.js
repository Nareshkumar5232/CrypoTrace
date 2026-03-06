/**
 * txParser.js
 * Converts blockchain API responses into internal PostgreSQL transaction format.
 */

/**
 * Parses an Etherscan transaction array.
 * @param {Array} apiResults - Array of raw Etherscan txlist objects
 * @param {string} wallet_id - UUID of the wallet
 * @returns {Array} Array of parsed db-ready objects
 */
const parseEtherscanTransactions = (apiResults, wallet_id) => {
    if (!Array.isArray(apiResults)) return [];

    return apiResults.map((tx) => ({
        tx_hash: tx.hash,
        from_address: tx.from ? tx.from.toLowerCase() : '',
        to_address: tx.to ? tx.to.toLowerCase() : '',
        amount: parseFloat(weiToEther(tx.value || '0')), // NUMERIC in DB
        timestamp: tx.timeStamp ? new Date(parseInt(tx.timeStamp, 10) * 1000).toISOString() : null,
        block_number: tx.blockNumber ? parseInt(tx.blockNumber, 10) : null,
        wallet_id,
    }));
};

/**
 * Converts Wei (string) to Ether (string with up to 18 decimals).
 * Uses BigInt to prevent precision loss on large numbers.
 */
const weiToEther = (weiStr) => {
    if (!weiStr) return '0';
    const weiBigInt = BigInt(weiStr);
    const divisor = BigInt('1000000000000000000'); // 10^18
    const whole = weiBigInt / divisor;
    const remainder = weiBigInt % divisor;

    if (remainder === 0n) return whole.toString();

    let decimalStr = remainder.toString().padStart(18, '0');
    // Trim trailing zeros from decimals
    decimalStr = decimalStr.replace(/0+$/, '');
    return `${whole}.${decimalStr}`;
};

module.exports = { parseEtherscanTransactions, weiToEther };
