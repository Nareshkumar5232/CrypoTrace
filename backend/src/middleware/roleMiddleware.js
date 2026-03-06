/**
 * Factory that returns a middleware allowing only the specified roles.
 * @param  {...string} roles - Allowed role names, e.g. 'ADMIN', 'SUPERVISOR'
 * @returns {Function} Express middleware
 *
 * Usage:
 *   router.post('/', authMiddleware, allowRoles('ADMIN'), controller.create);
 */
const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden. You do not have permission to perform this action.',
            });
        }

        next();
    };
};

module.exports = { allowRoles };
