/**
 * clusterBuilder.js
 * Computes risk scores and persists detected clusters + wallet associations.
 */
const ClusterModel = require('../models/clusterModel');
const ClusterWalletModel = require('../models/clusterWalletModel');

/**
 * Compute a risk score (0–10) based on cluster size and heuristic matches.
 * @param {number} clusterSize   Number of wallets in the cluster
 * @param {number} heuristicCount  Number of heuristics that contributed
 * @returns {number} score 0–10
 */
function computeRiskScore(clusterSize, heuristicCount) {
    // Size component: 0-5 points (capped at size 10+)
    const sizeScore = Math.min(Math.floor(clusterSize / 2), 5);

    // Heuristic component: 0-5 points (1.25 per heuristic, max 4 heuristics)
    const heuristicScore = Math.min(Math.round(heuristicCount * 1.25), 5);

    return Math.min(sizeScore + heuristicScore, 10);
}

/**
 * Map a numeric risk score to a risk level string.
 * @param {number} score 0–10
 * @returns {'LOW'|'MEDIUM'|'HIGH'}
 */
function getRiskLevel(score) {
    if (score <= 3) return 'LOW';
    if (score <= 6) return 'MEDIUM';
    return 'HIGH';
}

/**
 * Persist an array of detected clusters for a case.
 * @param {string}     caseId          UUID of the case
 * @param {string[][]} clusters        Arrays of wallet addresses
 * @param {string[]}   heuristicsUsed  Names of heuristics that matched
 * @returns {Array} created cluster records
 */
async function persistClusters(caseId, clusters, heuristicsUsed) {
    const results = [];

    for (const addresses of clusters) {
        const riskScore = computeRiskScore(addresses.length, heuristicsUsed.length);
        const riskLevel = getRiskLevel(riskScore);

        // Create the cluster record
        const cluster = await ClusterModel.create({
            case_id: caseId,
            risk_score: riskScore,
            risk_level: riskLevel,
            heuristics_matched: heuristicsUsed,
        });

        // Bulk-insert the wallet associations
        await ClusterWalletModel.addWallets(cluster.id, addresses);

        results.push({
            ...cluster,
            wallet_count: addresses.length,
            wallets: addresses,
        });
    }

    return results;
}

module.exports = {
    computeRiskScore,
    getRiskLevel,
    persistClusters,
};
