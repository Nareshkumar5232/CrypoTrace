/**
 * test_laundering_module.js
 * In-memory test suite for laundering pattern detection algorithms.
 */
const {
    detectPeelChains,
    detectFanOuts,
    detectFanIns,
    detectRapidRouting
} = require('./src/utils/patternAlgorithms');

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
console.log(' MODULE 7: Laundering Pattern Engine Tests');
console.log('=============================================\n');

// ─────────────────── Test 1: Peel Chain ───────────────────
console.log('⛓️ Test 1: Peel Chain Detection');
{
    const baseTime = new Date('2026-01-01T12:00:00Z').getTime();
    const txs = [
        // Wallet A sends 100
        { tx_hash: 'tx1', from_address: 'A', to_address: 'B', amount: 100, timestamp: new Date(baseTime).toISOString() },
        { tx_hash: 'tx_peel1', from_address: 'A', to_address: 'X1', amount: 30, timestamp: new Date(baseTime).toISOString() }, // unrelated peel

        // Wallet B forwards 80 (peels off 20)
        { tx_hash: 'tx2', from_address: 'B', to_address: 'C', amount: 80, timestamp: new Date(baseTime + 60000).toISOString() },
        // Wallet C forwards 60 (peels off 20)
        { tx_hash: 'tx3', from_address: 'C', to_address: 'D', amount: 60, timestamp: new Date(baseTime + 120000).toISOString() },
        // Wallet D forwards 50
        { tx_hash: 'tx4', from_address: 'D', to_address: 'E', amount: 50, timestamp: new Date(baseTime + 180000).toISOString() }
    ];

    const patterns = detectPeelChains(txs);
    assert(patterns.length === 1, `Should detect 1 pattern, got ${patterns.length}`);
    if (patterns[0]) {
        assert(patterns[0].pattern_type === 'PEEL_CHAIN', 'Pattern type is PEEL_CHAIN');
        assert(patterns[0].wallet === 'a', 'Origin wallet is correct (a)');
        assert(patterns[0].related_wallets.length === 4, `Chain consists of 4 related hops, got ${patterns[0].related_wallets.length}`);
    }
}

// ─────────────────── Test 2: Fan-Out ───────────────────
console.log('\n📤 Test 2: Fan-Out Detection');
{
    const baseTime = new Date('2026-01-01T12:00:00Z').getTime();
    const txs = [
        // Wallet Hub sends to 4 distinct wallets in 5 minutes
        { tx_hash: 'f1', from_address: 'Hub', to_address: 'A1', amount: 10, timestamp: new Date(baseTime).toISOString() },
        { tx_hash: 'f2', from_address: 'Hub', to_address: 'A2', amount: 10, timestamp: new Date(baseTime + 60000).toISOString() },
        { tx_hash: 'f3', from_address: 'Hub', to_address: 'A3', amount: 10, timestamp: new Date(baseTime + 120000).toISOString() },
        { tx_hash: 'f4', from_address: 'Hub', to_address: 'A4', amount: 10, timestamp: new Date(baseTime + 180000).toISOString() },

        // Unrelated
        { tx_hash: 'f5', from_address: 'X', to_address: 'Y', amount: 100, timestamp: new Date(baseTime).toISOString() }
    ];

    const patterns = detectFanOuts(txs);
    assert(patterns.length === 1, `Should detect 1 pattern, got ${patterns.length}`);
    if (patterns[0]) {
        assert(patterns[0].pattern_type === 'FAN_OUT', 'Pattern type is FAN_OUT');
        assert(patterns[0].wallet === 'hub', 'Sender wallet is correct');
        assert(patterns[0].related_wallets.length === 4, `4 distinct receivers detected, got ${patterns[0].related_wallets.length}`);
    }
}

// ─────────────────── Test 3: Fan-In ───────────────────
console.log('\n📥 Test 3: Fan-In Detection');
{
    const baseTime = new Date('2026-01-01T12:00:00Z').getTime();
    const txs = [
        // 3 distinct wallets send to Hub in 5 minutes
        { tx_hash: 'i1', from_address: 'S1', to_address: 'Hub', amount: 50, timestamp: new Date(baseTime).toISOString() },
        { tx_hash: 'i2', from_address: 'S2', to_address: 'Hub', amount: 50, timestamp: new Date(baseTime + 60000).toISOString() },
        { tx_hash: 'i3', from_address: 'S3', to_address: 'Hub', amount: 50, timestamp: new Date(baseTime + 120000).toISOString() },

        // Sender 1 sends again (should not count as a NEW sender)
        { tx_hash: 'i4', from_address: 'S1', to_address: 'Hub', amount: 50, timestamp: new Date(baseTime + 180000).toISOString() }
    ];

    const patterns = detectFanIns(txs);
    assert(patterns.length === 1, `Should detect 1 pattern, got ${patterns.length}`);
    if (patterns[0]) {
        assert(patterns[0].pattern_type === 'FAN_IN', 'Pattern type is FAN_IN');
        assert(patterns[0].wallet === 'hub', 'Receiver wallet is correct');
        assert(patterns[0].related_wallets.length === 3, `3 distinct senders detected, got ${patterns[0].related_wallets.length}`);
    }
}

// ─────────────────── Test 4: Rapid Routing ───────────────────
console.log('\n⚡ Test 4: Rapid Routing Detection');
{
    const baseTime = new Date('2026-01-01T12:00:00Z').getTime();
    const txs = [
        // Fast chain: A -> B -> C -> D -> E in 4 minutes
        { tx_hash: 'r1', from_address: 'A', to_address: 'B', amount: 100, timestamp: new Date(baseTime).toISOString() },
        { tx_hash: 'r2', from_address: 'B', to_address: 'C', amount: 100, timestamp: new Date(baseTime + 60000).toISOString() },
        { tx_hash: 'r3', from_address: 'C', to_address: 'D', amount: 100, timestamp: new Date(baseTime + 120000).toISOString() },
        { tx_hash: 'r4', from_address: 'D', to_address: 'E', amount: 100, timestamp: new Date(baseTime + 180000).toISOString() },

        // Slow chain (should fail rapid routing conditions, >15 min gap context)
        { tx_hash: 's1', from_address: 'X', to_address: 'Y', amount: 100, timestamp: new Date(baseTime + 999999999).toISOString() }
    ];

    const patterns = detectRapidRouting(txs);
    assert(patterns.length === 1, `Should detect 1 rapid routing chain, got ${patterns.length}`);
    if (patterns[0]) {
        assert(patterns[0].pattern_type === 'RAPID_ROUTING', 'Pattern type is RAPID_ROUTING');
        assert(patterns[0].wallet === 'a', 'Origin wallet is correct (a)');
        assert(patterns[0].related_wallets.length === 4, `Chain consists of 4 fast hops, got ${patterns[0].related_wallets.length}`);
    }
}

// ─────────────────── Summary ───────────────────
console.log('\n════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log('════════════════════════════════════\n');
process.exit(failed > 0 ? 1 : 0);
