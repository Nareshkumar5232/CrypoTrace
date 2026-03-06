const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

/**
 * All user routes require authentication.
 */
router.use(authMiddleware);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  ADMIN only
 */
router.post('/', allowRoles('ADMIN'), UserController.createUser);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Authenticated
 */
router.get('/', UserController.getUsers);

/**
 * @route   GET /api/roles
 * @desc    Get all roles
 * @access  Authenticated
 */
router.get('/roles', UserController.getRoles);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Authenticated
 */
router.get('/:id', UserController.getUserById);

/**
 * @route   PATCH /api/users/:id
 * @desc    Update user fields (name, email, role_id)
 * @access  Authenticated
 */
router.patch('/:id', UserController.updateUser);

module.exports = router;
