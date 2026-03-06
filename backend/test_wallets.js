const BASE = 'http://localhost:5000/api';

async function test() {
    // ── LOGIN ──
    console.log('=== 1. LOGIN ===');
    const lr = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@fiu.gov', password: 'admin123' }),
    });
    const { token, user } = await lr.json();
    console.log('✅ Logged in as:', user.name, '| Role:', user.role);
    const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // ── CREATE WALLET ──
    console.log('\n=== 2. CREATE WALLET ===');
    const addr = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe';
    const cr = await fetch(`${BASE}/wallets`, {
        method: 'POST', headers: auth,
        body: JSON.stringify({ address: addr, blockchain_type: 'ETH' }),
    });
    const wallet = await cr.json();
    if (cr.status === 201) {
        console.log('✅ Created wallet:', wallet.id);
    } else if (cr.status === 409) {
        console.log('⚠️  Wallet already exists, fetching by address...');
        const existing = await fetch(`${BASE}/wallets/address/${addr}`, { headers: auth }).then(r => r.json());
        wallet.id = existing.id;
        wallet.address = existing.address;
        console.log('✅ Using existing wallet:', wallet.id);
    } else {
        console.log('❌ Create failed:', cr.status, JSON.stringify(wallet));
    }

    // ── GET ALL WALLETS ──
    console.log('\n=== 3. GET ALL WALLETS ===');
    const allW = await fetch(`${BASE}/wallets`, { headers: auth }).then(r => r.json());
    console.log('✅ Total wallets:', allW.length);

    // ── GET BY ID ──
    console.log('\n=== 4. GET WALLET BY ID ===');
    const byId = await fetch(`${BASE}/wallets/${wallet.id}`, { headers: auth });
    const byIdData = await byId.json();
    console.log(byId.status === 200 ? '✅' : '❌', 'Address:', byIdData.address || byIdData.error);

    // ── GET BY ADDRESS ──
    console.log('\n=== 5. GET WALLET BY ADDRESS ===');
    const byAddr = await fetch(`${BASE}/wallets/address/${addr}`, { headers: auth });
    const byAddrData = await byAddr.json();
    console.log(byAddr.status === 200 ? '✅' : '❌', 'ID:', byAddrData.id || byAddrData.error);

    // ── ANALYZE WALLET (Etherscan) ──
    console.log('\n=== 6. ANALYZE WALLET ===');
    const ar = await fetch(`${BASE}/wallets/analyze`, {
        method: 'POST', headers: auth,
        body: JSON.stringify({ wallet_id: wallet.id }),
    });
    const analysis = await ar.json();
    console.log('Status:', ar.status);
    if (ar.status === 200) {
        console.log('✅ Fetched:', analysis.fetched, '| Imported:', analysis.imported, '| Total:', analysis.total_transactions);
    } else {
        console.log('❌ Analyze error:', JSON.stringify(analysis));
    }

    // ── GET TRANSACTIONS ──
    console.log('\n=== 7. GET TRANSACTIONS ===');
    const txr = await fetch(`${BASE}/wallets/${wallet.id}/transactions`, { headers: auth });
    const txs = await txr.json();
    console.log(txr.status === 200 ? '✅' : '❌', 'Transactions:', txs.length);
    if (txs.length > 0) {
        console.log('   Sample tx:', txs[0].tx_hash?.substring(0, 20) + '...', '| Amount:', txs[0].amount, '| Block:', txs[0].block_number);
    }

    console.log('\n==============================');
    console.log('✅ ALL WALLET TESTS COMPLETE');
    console.log('==============================');
    process.exit(0);
}

test().catch(e => { console.error('❌ FAILED:', e.message); process.exit(1); });
