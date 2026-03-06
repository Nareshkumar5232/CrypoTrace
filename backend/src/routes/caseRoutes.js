const express = require('express');
const router = express.Router();
const CaseController = require('../controllers/caseController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// All case routes require authentication
router.use(authMiddleware);

// ─── Case CRUD ───────────────────────────────────────────────

/**
 * @route   POST /api/cases
 * @desc    Create a new investigation case
 * @access  ADMIN, ANALYST
 */
router.post('/', allowRoles('ADMIN', 'ANALYST'), CaseController.createCase);

/**
 * @route   GET /api/cases
 * @desc    Get all cases (supports ?status= and ?assigned_officer= filters)
 * @access  Authenticated
 */
router.get('/', CaseController.getCases);

/**
 * @route   GET /api/cases/:id
 * @desc    Get case by ID (includes wallets and notes)
 * @access  Authenticated
 */
router.get('/:id', CaseController.getCaseById);

/**
 * @route   PATCH /api/cases/:id
 * @desc    Update case fields
 * @access  ADMIN, ANALYST
 */
router.patch('/:id', allowRoles('ADMIN', 'ANALYST'), CaseController.updateCase);

/**
 * @route   DELETE /api/cases/:id
 * @desc    Delete a case
 * @access  ADMIN only
 */
router.delete('/:id', allowRoles('ADMIN'), CaseController.deleteCase);

// ─── Wallets ─────────────────────────────────────────────────

/**
 * @route   POST /api/cases/:id/add-wallet
 * @desc    Link a wallet to a case
 * @access  ADMIN, ANALYST
 */
router.post('/:id/add-wallet', allowRoles('ADMIN', 'ANALYST'), CaseController.addWallet);

/**
 * @route   GET /api/cases/:id/wallets
 * @desc    Get all wallets linked to a case
 * @access  Authenticated
 */
router.get('/:id/wallets', CaseController.getWallets);

// ─── Notes ───────────────────────────────────────────────────

/**
 * @route   POST /api/cases/:id/notes
 * @desc    Add an investigation note to a case
 * @access  ADMIN, ANALYST, INVESTIGATOR
 */
router.post('/:id/notes', allowRoles('ADMIN', 'ANALYST', 'INVESTIGATOR'), CaseController.addNote);

/**
 * @route   GET /api/cases/:id/notes
 * @desc    Get all notes for a case
 * @access  Authenticated
 */
router.get('/:id/notes', CaseController.getNotes);

module.exports = router;
