const UserModel = require('../models/userModel');
const RoleModel = require('../models/roleModel');
const { hashPassword } = require('../utils/passwordUtils');

const UserService = {
    /**
     * Create a new user.
     * Validates that the email is not already taken and the role exists.
     */
    async createUser({ name, email, password, role_id }) {
        // Check for duplicate email
        const existing = await UserModel.findByEmail(email);
        if (existing) {
            const error = new Error('A user with this email already exists');
            error.statusCode = 409;
            throw error;
        }

        // Validate role
        const role = await RoleModel.findById(role_id);
        if (!role) {
            const error = new Error('Invalid role_id');
            error.statusCode = 400;
            throw error;
        }

        const password_hash = await hashPassword(password);
        const user = await UserModel.create({ name, email, password_hash, role_id });

        // Attach role name for the response
        user.role = role.name;
        return user;
    },

    /**
     * Return all users.
     */
    async getAllUsers() {
        return UserModel.findAll();
    },

    /**
     * Return a single user by id.
     */
    async getUserById(id) {
        const user = await UserModel.findById(id);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        return user;
    },

    /**
     * Update allowed user fields (name, email, role_id).
     */
    async updateUser(id, fields) {
        // Ensure user exists
        await this.getUserById(id);

        const allowedFields = ['name', 'email', 'role_id'];
        const updateData = {};

        for (const key of allowedFields) {
            if (fields[key] !== undefined) {
                updateData[key] = fields[key];
            }
        }

        if (Object.keys(updateData).length === 0) {
            const error = new Error('No valid fields provided for update');
            error.statusCode = 400;
            throw error;
        }

        // If email is being changed, check for duplicates
        if (updateData.email) {
            const existing = await UserModel.findByEmail(updateData.email);
            if (existing && existing.id !== id) {
                const error = new Error('A user with this email already exists');
                error.statusCode = 409;
                throw error;
            }
        }

        // If role_id is being changed, validate it
        if (updateData.role_id) {
            const role = await RoleModel.findById(updateData.role_id);
            if (!role) {
                const error = new Error('Invalid role_id');
                error.statusCode = 400;
                throw error;
            }
        }

        const updated = await UserModel.update(id, updateData);
        // Re-fetch to get the joined role name
        return this.getUserById(updated.id);
    },
};

module.exports = UserService;
