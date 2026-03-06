/**
 * test_cluster_module.js
 * In-memory unit tests for the clustering detection logic — no DB required.
 */
const {
    UnionFind,
    repeatedInteraction,
    fanIn,
    fanOut,
    rapidRouting,
    detectClusters,
} = require('./src/utils/clusterDetection');

const {
    computeRiskScore,
    getRiskLevel,
} = require('./src/utils/clusterBuilder');

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

// ─────────────────── Test 1: Union-Find ───────────────────
console.log('\n🔗 Test 1: Union-Find merge correctness');
{
    const uf = new UnionFind();
    uf.union('a', 'b');
    uf.union('b', 'c');
    uf.union('d', 'e');

    assert(uf.find('a') === uf.find('c'), 'a and c should be in the same component');
    assert(uf.find('a') !== uf.find('d'), 'a and d should be in different components');

    const components = uf.getComponents();
    assert(components.length === 2, `Should have 2 components, got ${components.length}`);

    const sizes = components.map(c => c.length).sort();
    assert(sizes[0] === 2 && sizes[1] === 3, `Component sizes should be [2,3], got [${sizes}]`);
}

// ─────────────────── Test 2: Repeated Interaction ───────────────────
console.log('\n🔁 Test 2: Repeated Interaction heuristic');
{
    const txs = [
        { from_address: 'WalletA', to_address: 'WalletB' },
        { from_address: 'WalletB', to_address: 'WalletA' },
        { from_address: 'WalletA', to_address: 'WalletB' },
        { from_address: 'WalletC', to_address: 'WalletD' }, // only 1 tx, should not cluster
    ];

    const groups = repeatedInteraction(txs);
    assert(groups.length === 1, `Should detect 1 group, got ${groups.length}`);
    assert(
        groups[0].includes('walleta') && groups[0].includes('walletb'),
        'Group should contain WalletA and WalletB'
    );
}

// ─────────────────── Test 3: Fan-In ───────────────────
console.log('\n📥 Test 3: Fan-In heuristic');
{
    const txs = [
        { from_address: 'Sender1', to_address: 'Hub' },
        { from_address: 'Sender2', to_address: 'Hub' },
        { from_address: 'Sender3', to_address: 'Hub' },
    ];

    const groups = fanIn(txs);
    assert(groups.length === 1, `Should detect 1 group, got ${groups.length}`);
    assert(groups[0].length === 4, `Group should have 4 addresses (hub+3 senders), got ${groups[0].length}`);
    assert(groups[0].includes('hub'), 'Group should include the hub wallet');
}

// ─────────────────── Test 4: Fan-Out ───────────────────
console.log('\n📤 Test 4: Fan-Out heuristic');
{
    const txs = [
        { from_address: 'Source', to_address: 'Dest1' },
        { from_address: 'Source', to_address: 'Dest2' },
        { from_address: 'Source', to_address: 'Dest3' },
    ];

    const groups = fanOut(txs);
    assert(groups.length === 1, `Should detect 1 group, got ${groups.length}`);
    assert(groups[0].length === 4, `Group should have 4 addresses (source+3 destinations), got ${groups[0].length}`);
    assert(groups[0].includes('source'), 'Group should include the source wallet');
}

// ─────────────────── Test 5: Rapid Routing ───────────────────
console.log('\n⚡ Test 5: Rapid Routing heuristic');
{
    const baseTime = new Date('2025-01-01T12:00:00Z').getTime();
    const txs = [
        { from_address: 'A', to_address: 'B', timestamp: new Date(baseTime).toISOString() },
        { from_address: 'B', to_address: 'C', timestamp: new Date(baseTime + 2 * 60000).toISOString() },   // +2 min
        { from_address: 'C', to_address: 'D', timestamp: new Date(baseTime + 5 * 60000).toISOString() },   // +5 min
    ];

    const groups = rapidRouting(txs);
    assert(groups.length >= 1, `Should detect at least 1 chain, got ${groups.length}`);

    const longestChain = groups.reduce((a, b) => a.length >= b.length ? a : b, []);
    assert(longestChain.length >= 3, `Longest chain should be ≥3 hops, got ${longestChain.length}`);
}

// ─────────────────── Test 6: Full pipeline ───────────────────
console.log('\n📊 Test 6: Full pipeline — all heuristics → merged clusters');
{
    const baseTime = new Date('2025-06-01T10:00:00Z').getTime();
    const txs = [
        // Repeated interaction: A ↔ B (3 txs)
        { from_address: 'Alpha', to_address: 'Bravo', timestamp: new Date(baseTime).toISOString() },
        { from_address: 'Bravo', to_address: 'Alpha', timestamp: new Date(baseTime + 60000).toISOString() },
        { from_address: 'Alpha', to_address: 'Bravo', timestamp: new Date(baseTime + 120000).toISOString() },

        // Fan-in: Charlie receives from Delta, Echo, Foxtrot
        { from_address: 'Delta', to_address: 'Charlie', timestamp: new Date(baseTime + 200000).toISOString() },
        { from_address: 'Echo', to_address: 'Charlie', timestamp: new Date(baseTime + 210000).toISOString() },
        { from_address: 'Foxtrot', to_address: 'Charlie', timestamp: new Date(baseTime + 220000).toISOString() },

        // Isolated pair (should NOT form a cluster)
        { from_address: 'X', to_address: 'Y', timestamp: new Date(baseTime + 300000).toISOString() },
    ];

    const { clusters, heuristicsUsed } = detectClusters(txs);
    assert(clusters.length >= 2, `Should produce ≥2 clusters, got ${clusters.length}`);
    assert(heuristicsUsed.length >= 2, `Should use ≥2 heuristics, got ${heuristicsUsed.length}`);
}

// ─────────────────── Test 7: Risk score boundaries ───────────────────
console.log('\n🎯 Test 7: Risk score calculation boundaries');
{
    // Tiny cluster (2 wallets) + 1 heuristic → low risk
    const score1 = computeRiskScore(2, 1);
    assert(score1 >= 0 && score1 <= 10, `Score should be 0-10, got ${score1}`);
    assert(getRiskLevel(score1) === 'LOW', `2 wallets, 1 heuristic → LOW, got ${getRiskLevel(score1)}`);

    // Medium cluster (6 wallets) + 2 heuristics → medium risk
    const score2 = computeRiskScore(6, 2);
    assert(getRiskLevel(score2) === 'MEDIUM', `6 wallets, 2 heuristics → MEDIUM, got ${getRiskLevel(score2)}`);

    // Large cluster (12 wallets) + 4 heuristics → high risk
    const score3 = computeRiskScore(12, 4);
    assert(getRiskLevel(score3) === 'HIGH', `12 wallets, 4 heuristics → HIGH, got ${getRiskLevel(score3)}`);

    // Edge: score capped at 10
    const score4 = computeRiskScore(100, 4);
    assert(score4 === 10, `Max score should be 10, got ${score4}`);
}

// ─────────────────── Test 8: Empty input ───────────────────
console.log('\n🚫 Test 8: Empty input handling');
{
    const result = detectClusters([]);
    assert(result.clusters.length === 0, 'Empty transactions should yield 0 clusters');
    assert(result.heuristicsUsed.length === 0, 'No heuristics should be reported');

    const result2 = detectClusters(null);
    assert(result2.clusters.length === 0, 'Null transactions should yield 0 clusters');
}

// ─────────────────── Summary ───────────────────
console.log('\n════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log('════════════════════════════════════\n');
process.exit(failed > 0 ? 1 : 0);
