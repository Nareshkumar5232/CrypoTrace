/**
 * test_risk_module.js
 * In-memory unit tests for the risk calculator logic — no DB required.
 */
const { calculateRiskScore, getRiskLevel, SIGNAL_WEIGHTS } = require('./src/utils/riskCalculator');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ ${message}`);
        passed++;
    } else {
        console.log(`  ❌ ${message}`);
        failed++;
    }
}

console.log('\n=============================================');
console.log(' MODULE 8: Risk Scoring Engine Tests');
console.log('=============================================\n');

// ─────────────────── Test 1: Risk levels ───────────────────
console.log('🏷️ Test 1: Risk level mapping');
{
    assert(getRiskLevel(0) === 'LOW', 'Score 0 → LOW');
    assert(getRiskLevel(3) === 'LOW', 'Score 3 → LOW');
    assert(getRiskLevel(4) === 'MEDIUM', 'Score 4 → MEDIUM');
    assert(getRiskLevel(6) === 'MEDIUM', 'Score 6 → MEDIUM');
    assert(getRiskLevel(7) === 'HIGH', 'Score 7 → HIGH');
    assert(getRiskLevel(8) === 'HIGH', 'Score 8 → HIGH');
    assert(getRiskLevel(9) === 'CRITICAL', 'Score 9 → CRITICAL');
    assert(getRiskLevel(10) === 'CRITICAL', 'Score 10 → CRITICAL');
}

// ─────────────────── Test 2: No signals ───────────────────
console.log('\n🚫 Test 2: No signals → LOW risk');
{
    const result = calculateRiskScore([], []);
    assert(result.risk_score === 0, `Score should be 0, got ${result.risk_score}`);
    assert(result.risk_level === 'LOW', `Level should be LOW, got ${result.risk_level}`);
    assert(result.indicators.length === 0, `No indicators expected, got ${result.indicators.length}`);
}

// ─────────────────── Test 3: Single FAN_OUT ───────────────────
console.log('\n📤 Test 3: FAN_OUT only → score 3 (LOW)');
{
    const alerts = [{ alert_type: 'FAN_OUT', severity: 'HIGH' }];
    const result = calculateRiskScore(alerts, []);
    assert(result.risk_score === 3, `Score should be 3, got ${result.risk_score}`);
    assert(result.risk_level === 'LOW', `Level should be LOW, got ${result.risk_level}`);
    assert(result.indicators.length === 1, `1 indicator, got ${result.indicators.length}`);
}

// ─────────────────── Test 4: PEEL_CHAIN + FAN_OUT ───────────────────
console.log('\n⛓️ Test 4: PEEL_CHAIN + FAN_OUT → score 6 (MEDIUM)');
{
    const alerts = [
        { alert_type: 'PEEL_CHAIN', severity: 'CRITICAL' },
        { alert_type: 'FAN_OUT', severity: 'HIGH' },
    ];
    const result = calculateRiskScore(alerts, []);
    assert(result.risk_score === 6, `Score should be 6, got ${result.risk_score}`);
    assert(result.risk_level === 'MEDIUM', `Level should be MEDIUM, got ${result.risk_level}`);
}

// ─────────────────── Test 5: Multiple patterns + OSINT ───────────────────
console.log('\n🔥 Test 5: FAN_OUT + PEEL_CHAIN + RAPID_ROUTING + OSINT → CRITICAL');
{
    const alerts = [
        { alert_type: 'FAN_OUT', severity: 'HIGH' },
        { alert_type: 'PEEL_CHAIN', severity: 'CRITICAL' },
        { alert_type: 'RAPID_ROUTING', severity: 'CRITICAL' },
    ];
    const osint = [{ wallet: '0xabc', source: 'chainabuse', category: 'scam' }];
    const result = calculateRiskScore(alerts, osint);
    // 3 + 3 + 2 + 2 = 10
    assert(result.risk_score === 10, `Score should be 10, got ${result.risk_score}`);
    assert(result.risk_level === 'CRITICAL', `Level should be CRITICAL, got ${result.risk_level}`);
    assert(result.indicators.length === 4, `4 indicators expected, got ${result.indicators.length}`);
}

// ─────────────────── Test 6: Score cap ───────────────────
console.log('\n🔒 Test 6: Score capped at 10');
{
    const alerts = [
        { alert_type: 'FAN_OUT', severity: 'HIGH' },
        { alert_type: 'PEEL_CHAIN', severity: 'CRITICAL' },
        { alert_type: 'RAPID_ROUTING', severity: 'CRITICAL' },
        { alert_type: 'FAN_IN', severity: 'HIGH' },
    ];
    const osint = [{ wallet: '0xabc', source: 'blocklist', category: 'scam' }];
    const result = calculateRiskScore(alerts, osint);
    // 3 + 3 + 2 + 1 + 2 = 11 → capped at 10
    assert(result.risk_score === 10, `Score should be capped at 10, got ${result.risk_score}`);
}

// ─────────────────── Test 7: Duplicate alert types ───────────────────
console.log('\n🔁 Test 7: Duplicate alert types do not double-count');
{
    const alerts = [
        { alert_type: 'FAN_OUT', severity: 'HIGH' },
        { alert_type: 'FAN_OUT', severity: 'HIGH' }, // duplicate
        { alert_type: 'FAN_OUT', severity: 'HIGH' }, // another duplicate
    ];
    const result = calculateRiskScore(alerts, []);
    assert(result.risk_score === 3, `Score should be 3 (not 9), got ${result.risk_score}`);
}

// ─────────────────── Test 8: OSINT only ───────────────────
console.log('\n🔍 Test 8: OSINT match only → score 2 (LOW)');
{
    const osint = [{ wallet: '0x123', source: 'bitcoinabuse', category: 'ransomware' }];
    const result = calculateRiskScore([], osint);
    assert(result.risk_score === 2, `Score should be 2, got ${result.risk_score}`);
    assert(result.risk_level === 'LOW', `Level should be LOW, got ${result.risk_level}`);
}

// ─────────────────── Test 9: HIGH threshold ───────────────────
console.log('\n📊 Test 9: Scoring at exactly HIGH threshold (7)');
{
    const alerts = [
        { alert_type: 'PEEL_CHAIN', severity: 'CRITICAL' },
        { alert_type: 'RAPID_ROUTING', severity: 'CRITICAL' },
    ];
    const osint = [{ wallet: '0xdef', source: 'chainabuse', category: 'phishing' }];
    const result = calculateRiskScore(alerts, osint);
    // 3 + 2 + 2 = 7
    assert(result.risk_score === 7, `Score should be 7, got ${result.risk_score}`);
    assert(result.risk_level === 'HIGH', `Level should be HIGH, got ${result.risk_level}`);
}

// ─────────────────── Summary ───────────────────
console.log('\n════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log('════════════════════════════════════\n');
process.exit(failed > 0 ? 1 : 0);
