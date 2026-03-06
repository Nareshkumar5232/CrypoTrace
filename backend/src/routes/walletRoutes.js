const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// All wallet routes require authentication
router.use(authMiddleware);

// ─── Wallet CRUD ─────────────────────────────────────────────

/**
 * @route   POST /api/wallets
 * @desc    Create a new wallet
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.post('/', allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'), WalletController.createWallet);

/**
 * @route   GET /api/wallets
 * @desc    Get all wallets
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get('/', allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'), WalletController.getWallets);

/**
 * @route   POST /api/wallets/analyze
 * @desc    Trigger blockchain analysis for a wallet
 * @access  ADMIN, ANALYST, INVESTIGATOR
 *
 * NOTE: This route MUST be placed before /:id to avoid matching "analyze" as a UUID.
 */
router.post('/analyze', allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'), WalletController.analyzeWallet);

/**
 * @route   GET /api/wallets/address/:address
 * @desc    Get wallet by blockchain address
 * @access  ADMIN, ANALYST, INVESTIGATOR
 *
 * NOTE: This route MUST be placed before /:id to avoid matching "address" as a UUID.
 */
router.get('/address/:address', allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'), WalletController.getWalletByAddress);

/**
 * @route   GET /api/wallets/:id
 * @desc    Get wallet by ID
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get('/:id', allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'), WalletController.getWalletById);

/**
 * @route   GET /api/wallets/:id/transactions
 * @desc    Get all transactions for a wallet
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.get('/:id/transactions', allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'), WalletController.getWalletTransactions);

module.exports = router;
