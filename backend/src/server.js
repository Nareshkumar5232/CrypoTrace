require('dotenv').config();

const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 5000;

const requiredDbEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];

const getMissingEnvVars = () =>
    requiredDbEnvVars.filter((key) => !process.env[key] || String(process.env[key]).trim() === '');

const startServer = async () => {
    try {
        const missingEnv = getMissingEnvVars();

        if (missingEnv.length > 0) {
            console.warn(`⚠️ Missing backend environment variables: ${missingEnv.join(', ')}`);
            console.warn('⚠️ API server is starting, but database-backed routes will fail until env vars are configured.');
        } else {
            // Verify database connectivity before starting
            const client = await pool.connect();
            console.log('✅ Connected to PostgreSQL database');
            client.release();
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message || err);
        process.exit(1);
    }
};

startServer();
