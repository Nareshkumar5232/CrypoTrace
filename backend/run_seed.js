const fs = require('fs');
const { pool } = require('./src/config/db');

async function seed() {
    try {
        const sql = fs.readFileSync('./src/db/seed.sql', 'utf-8');
        await pool.query(sql);
        console.log('Seed executed successfully');
    } catch (err) {
        console.error('Seed failed:', err);
    } finally {
        await pool.end();
    }
}
seed();
