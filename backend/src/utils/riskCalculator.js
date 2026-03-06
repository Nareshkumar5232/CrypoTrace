/**
 * riskCalculator.js
 * Combines pattern detection signals and OSINT results to compute
 * a risk score (0–10) and risk level for a wallet cluster.
 */

// ─────────────── Scoring Indicators ───────────────
const SIGNAL_WEIGHTS = {
    FAN_OUT: 3,
    PEEL_CHAIN: 3,
    RAPID_ROUTING: 2,
    FAN_IN: 1, // lower weight — common in exchanges
    OSINT_MATCH: 2,
};

// ─────────────── Risk Level Mapping ───────────────
/**
 * Map a numeric score to a risk level string.
 * @param {number} score  0–10
 * @returns {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'}
 */
function getRiskLevel(score) {
    if (score <= 3) return 'LOW';
    if (score <= 6) return 'MEDIUM';
    if (score <= 8) return 'HIGH';
    return 'CRITICAL';
}

/**
 * Compute the risk score for a cluster given its alerts and OSINT matches.
 *
 * @param {Array}  alerts       Alert records from the `alerts` table
 * @param {Array}  osintMatches OSINT hit objects [{wallet, source, category}]
 * @returns {{ risk_score: number, risk_level: string, indicators: object[] }}
 */
function calculateRiskScore(alerts, osintMatches = []) {
    let score = 0;
    const indicators = [];

    // ── Pattern-based signals ──
    // We count unique alert types, not duplicates, to avoid double-counting
    const alertTypes = new Set(alerts.map(a => a.alert_type));

    if (alertTypes.has('FAN_OUT') || alertTypes.has('FAN_OUT_DETECTED')) {
        score += SIGNAL_WEIGHTS.FAN_OUT;
        indicators.push({ signal: 'FAN_OUT', points: SIGNAL_WEIGHTS.FAN_OUT, source: 'pattern_detection' });
    }

    if (alertTypes.has('PEEL_CHAIN') || alertTypes.has('PEEL_CHAIN_DETECTED')) {
        score += SIGNAL_WEIGHTS.PEEL_CHAIN;
        indicators.push({ signal: 'PEEL_CHAIN', points: SIGNAL_WEIGHTS.PEEL_CHAIN, source: 'pattern_detection' });
    }

    if (alertTypes.has('RAPID_ROUTING') || alertTypes.has('RAPID_ROUTING_DETECTED')) {
        score += SIGNAL_WEIGHTS.RAPID_ROUTING;
        indicators.push({ signal: 'RAPID_ROUTING', points: SIGNAL_WEIGHTS.RAPID_ROUTING, source: 'pattern_detection' });
    }

    if (alertTypes.has('FAN_IN') || alertTypes.has('FAN_IN_DETECTED')) {
        score += SIGNAL_WEIGHTS.FAN_IN;
        indicators.push({ signal: 'FAN_IN', points: SIGNAL_WEIGHTS.FAN_IN, source: 'pattern_detection' });
    }

    // ── OSINT signals ──
    if (osintMatches.length > 0) {
        score += SIGNAL_WEIGHTS.OSINT_MATCH;
        indicators.push({
            signal: 'OSINT_MATCH',
            points: SIGNAL_WEIGHTS.OSINT_MATCH,
            source: 'osint',
            matches: osintMatches,
        });
    }

    // Cap at 10
    score = Math.min(score, 10);

    return {
        risk_score: score,
        risk_level: getRiskLevel(score),
        indicators,
    };
}

module.exports = {
    SIGNAL_WEIGHTS,
    getRiskLevel,
    calculateRiskScore,
};
