const AuthService = require('../services/authService');

const AuthController = {
    /**
     * POST /api/auth/login
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const result = await AuthService.login(email, password);
            return res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = AuthController;
