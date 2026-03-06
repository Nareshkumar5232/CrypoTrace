/**
 * Centralized error handling middleware.
 * Catches errors thrown/forwarded via next(err) and returns a consistent JSON response.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`, err.stack);

    const statusCode = err.statusCode || 500;
    const message =
        statusCode === 500 && process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message;

    return res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
