require('dotenv').config();
const db = require('./src/config/db');
const bcrypt = require('bcrypt');

async function fixPassword() {
    try {
        const hash = await bcrypt.hash('admin123', 10);
        await db.query(`
            UPDATE users 
            SET password_hash = $1 
            WHERE email = 'admin@fiu.gov'
            OR name = 'System Admin'
        `, [hash]);
        console.log('Admin password updated successfully.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}
fixPassword();
