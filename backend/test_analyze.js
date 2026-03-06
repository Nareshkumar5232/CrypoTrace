const BASE = 'http://localhost:5000/api';

async function test() {
    const lr = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@fiu.gov', password: 'admin123' }),
    });
    const { token, user } = await lr.json();
    const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const allW = await fetch(`${BASE}/wallets`, { headers: auth }).then(r => r.json());
    const wallet = allW[0];

    console.log('Analyzing:', wallet.address);
    const ar = await fetch(`${BASE}/wallets/analyze`, {
        method: 'POST', headers: auth,
        body: JSON.stringify({ wallet_id: wallet.id }),
    });
    const analysis = await ar.json();
    console.log('Analyze Response:', ar.status, analysis);
}

test().catch(e => console.error(e));
