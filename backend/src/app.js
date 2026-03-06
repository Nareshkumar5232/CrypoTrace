const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const caseRoutes = require('./routes/caseRoutes');
const walletRoutes = require('./routes/walletRoutes');
const graphRoutes = require('./routes/graphRoutes');
const clusterRoutes = require('./routes/clusterRoutes');
const launderingRoutes = require('./routes/launderingRoutes');
const alertRoutes = require('./routes/alertRoutes');
const riskRoutes = require('./routes/riskRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --------------- Global Middleware ---------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------- Health Check ---------------
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --------------- API Routes ---------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/clusters', clusterRoutes);
app.use('/api/laundering', launderingRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/reports', reportRoutes);

// --------------- 404 Handler ---------------
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// --------------- Error Handler ---------------
app.use(errorHandler);

module.exports = app;
