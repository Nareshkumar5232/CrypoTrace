const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { comparePassword } = require('../utils/passwordUtils');

const AuthService = {
    /**
     * Authenticate a user by email and password.
     * Returns a JWT token and sanitised user object on success.
     * Throws on invalid credentials.
     */
    async login(email, password) {
        const user = await UserModel.findByEmail(email);
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        const payload = {
            user_id: user.id,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        });

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    },
};

module.exports = AuthService;
