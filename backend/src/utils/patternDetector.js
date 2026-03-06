/**
 * patternDetector.js
 * Analyzes transaction graphs, runs detection algorithms, and returns patterns.
 */
const {
    detectPeelChains,
    detectFanOuts,
    detectFanIns,
    detectRapidRouting
} = require('./patternAlgorithms');

const PatternDetector = {
    /**
     * Run all laundering detection algorithms on the given dataset of transactions.
     * 
     * @param {Array} transactions  List of raw PostgreSQL transaction objects
     * @returns {Array} List of standardized pattern alert objects
     */
    detectAllPatterns(transactions) {
        if (!transactions || transactions.length === 0) {
            return [];
        }

        const allDetected = [];

        // Run 1: Peel Chain
        const peelChains = detectPeelChains(transactions);
        allDetected.push(...peelChains);

        // Run 2: Fan-Out Pattern
        const fanOuts = detectFanOuts(transactions);
        allDetected.push(...fanOuts);

        // Run 3: Fan-In Pattern
        const fanIns = detectFanIns(transactions);
        allDetected.push(...fanIns);

        // Run 4: Rapid Routing
        const rapidRoutings = detectRapidRouting(transactions);
        allDetected.push(...rapidRoutings);

        // Deduplication (Optional depending on business rules, but good practice if multiple 
        // heuristics catch the exact same chain of tx hashes. In our case, the heuristics 
        // are discrete enough to be distinct alerts).

        return allDetected;
    }
};

module.exports = PatternDetector;
