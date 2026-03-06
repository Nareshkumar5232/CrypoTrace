require('dotenv').config();
const { pool } = require('./src/config/db');

async function testInsert() {
    try {
        const { rows: wallets } = await pool.query('SELECT id FROM wallets LIMIT 1');
        if (wallets.length === 0) {
            console.log('No wallets exist.');
            process.exit(0);
        }
        const wallet_id = wallets[0].id;

        // Attempt standard insert according to schema
        const q = `INSERT INTO transactions 
      (tx_hash, from_address, to_address, amount, timestamp, block_number, wallet_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`;

        const p = ['test_hash_123', '0xaaa', '0xbbb', 1.0, new Date().toISOString(), 1, wallet_id];

        console.log('Executing query...');
        const result = await pool.query(q, p);
        console.log('Inserted:', result.rows[0]);
    } catch (err) {
        console.error('Insert error:', err);
    } finally {
        process.exit(0);
    }
}

testInsert();
