const UserService = require('../services/userService');
const RoleModel = require('../models/roleModel');

const UserController = {
    /**
     * POST /api/users
     */
    async createUser(req, res, next) {
        try {
            const { name, email, password, role_id } = req.body;

            if (!name || !email || !password || !role_id) {
                return res.status(400).json({
                    error: 'name, email, password, and role_id are required',
                });
            }

            const user = await UserService.createUser({ name, email, password, role_id });
            return res.status(201).json(user);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/users
     */
    async getUsers(req, res, next) {
        try {
            const users = await UserService.getAllUsers();
            return res.status(200).json(users);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/users/:id
     */
    async getUserById(req, res, next) {
        try {
            const user = await UserService.getUserById(req.params.id);
            return res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    },

    /**
     * PATCH /api/users/:id
     */
    async updateUser(req, res, next) {
        try {
            const user = await UserService.updateUser(req.params.id, req.body);
            return res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/roles
     */
    async getRoles(req, res, next) {
        try {
            const roles = await RoleModel.findAll();
            return res.status(200).json(roles);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = UserController;
