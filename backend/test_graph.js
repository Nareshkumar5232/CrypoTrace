const BASE = 'http://localhost:5000/api';

async function test() {
    // Login
    const lr = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@fiu.gov', password: 'admin123' }),
    });
    const { token } = await lr.json();
    const auth = { Authorization: `Bearer ${token}` };

    // Get a wallet address from DB
    const wallets = await fetch(`${BASE}/wallets`, { headers: auth }).then(r => r.json());
    const addr = wallets[0]?.address;
    console.log('Testing with wallet:', addr);

    // 1. GET /api/graph/wallet/:address
    console.log('\n=== 1. WALLET GRAPH ===');
    const g1 = await fetch(`${BASE}/graph/wallet/${addr}`, { headers: auth });
    const d1 = await g1.json();
    console.log('Status:', g1.status);
    console.log('Nodes:', d1.nodes?.length, '| Edges:', d1.edges?.length);

    // 2. GET /api/graph/trace/:address?depth=3
    console.log('\n=== 2. TRACE FUND FLOW (depth=3) ===');
    const g2 = await fetch(`${BASE}/graph/trace/${addr}?depth=3`, { headers: auth });
    const d2 = await g2.json();
    console.log('Status:', g2.status);
    console.log('Nodes:', d2.nodes?.length, '| Edges:', d2.edges?.length, '| Depth:', d2.depth);

    // 3. GET /api/graph/case/:case_id (use a non-existent case for now)
    console.log('\n=== 3. CASE GRAPH ===');
    const g3 = await fetch(`${BASE}/graph/case/00000000-0000-0000-0000-000000000000`, { headers: auth });
    const d3 = await g3.json();
    console.log('Status:', g3.status, '| Response:', JSON.stringify(d3).substring(0, 100));

    console.log('\n✅ ALL GRAPH TESTS COMPLETE');
    process.exit(0);
}

test().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
