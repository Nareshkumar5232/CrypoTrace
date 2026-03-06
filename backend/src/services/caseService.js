const CaseModel = require('../models/caseModel');
const CaseWalletModel = require('../models/caseWalletModel');
const CaseNoteModel = require('../models/caseNoteModel');

const VALID_STATUSES = ['OPEN', 'UNDER_INVESTIGATION', 'CLOSED'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const CaseService = {
    /**
     * Create a new investigation case.
     */
    async createCase({ title, description, priority, assigned_officer, created_by }) {
        if (!title) {
            const error = new Error('Title is required');
            error.statusCode = 400;
            throw error;
        }

        if (priority && !VALID_PRIORITIES.includes(priority)) {
            const error = new Error(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`);
            error.statusCode = 400;
            throw error;
        }

        const case_number = await CaseModel.getNextCaseNumber();

        const newCase = await CaseModel.create({
            case_number,
            title,
            description: description || null,
            status: 'OPEN',
            priority: priority || 'MEDIUM',
            created_by,
            assigned_officer: assigned_officer || null,
        });

        return newCase;
    },

    /**
     * Get all cases with optional filters.
     */
    async getAllCases(filters) {
        return CaseModel.findAll(filters);
    },

    /**
     * Get a single case by id, including wallets and notes.
     */
    async getCaseById(id) {
        const caseData = await CaseModel.findById(id);
        if (!caseData) {
            const error = new Error('Case not found');
            error.statusCode = 404;
            throw error;
        }

        const [wallets, notes] = await Promise.all([
            CaseWalletModel.findByCaseId(id),
            CaseNoteModel.findByCaseId(id),
        ]);

        return { ...caseData, wallets, notes };
    },

    /**
     * Update allowed case fields.
     */
    async updateCase(id, fields) {
        const existing = await CaseModel.findById(id);
        if (!existing) {
            const error = new Error('Case not found');
            error.statusCode = 404;
            throw error;
        }

        const allowed = ['title', 'description', 'status', 'priority', 'assigned_officer'];
        const updateData = {};

        for (const key of allowed) {
            if (fields[key] !== undefined) {
                updateData[key] = fields[key];
            }
        }

        if (Object.keys(updateData).length === 0) {
            const error = new Error('No valid fields provided for update');
            error.statusCode = 400;
            throw error;
        }

        if (updateData.status && !VALID_STATUSES.includes(updateData.status)) {
            const error = new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
            error.statusCode = 400;
            throw error;
        }

        if (updateData.priority && !VALID_PRIORITIES.includes(updateData.priority)) {
            const error = new Error(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`);
            error.statusCode = 400;
            throw error;
        }

        return CaseModel.update(id, updateData);
    },

    /**
     * Delete a case by id.
     */
    async deleteCase(id) {
        const existing = await CaseModel.findById(id);
        if (!existing) {
            const error = new Error('Case not found');
            error.statusCode = 404;
            throw error;
        }

        return CaseModel.deleteById(id);
    },

    /**
     * Add a wallet to a case.
     */
    async addWalletToCase(case_id, wallet_id) {
        const caseData = await CaseModel.findById(case_id);
        if (!caseData) {
            const error = new Error('Case not found');
            error.statusCode = 404;
            throw error;
        }

        if (!wallet_id) {
            const error = new Error('wallet_id is required');
            error.statusCode = 400;
            throw error;
        }

        const alreadyLinked = await CaseWalletModel.exists(case_id, wallet_id);
        if (alreadyLinked) {
            const error = new Error('Wallet is already linked to this case');
            error.statusCode = 409;
            throw error;
        }

        return CaseWalletModel.addWallet(case_id, wallet_id);
    },

    /**
     * Get all wallets for a case.
     */
    async getCaseWallets(case_id) {
        const caseData = await CaseModel.findById(case_id);
        if (!caseData) {
            const error = new Error('Case not found');
            error.statusCode = 404;
            throw error;
        }

        return CaseWalletModel.findByCaseId(case_id);
    },

    /**
     * Add an investigation note to a case.
     */
    async addNote(case_id, note_text, created_by) {
        const caseData = await CaseModel.findById(case_id);
        if (!caseData) {
            const error = new Error('Case not found');
            error.statusCode = 404;
            throw error;
        }

        if (!note_text) {
            const error = new Error('note_text is required');
            error.statusCode = 400;
            throw error;
        }

        return CaseNoteModel.create(case_id, note_text, created_by);
    },

    /**
     * Get all notes for a case.
     */
    async getCaseNotes(case_id) {
        const caseData = await CaseModel.findById(case_id);
        if (!caseData) {
            const error = new Error('Case not found');
            error.statusCode = 404;
            throw error;
        }

        return CaseNoteModel.findByCaseId(case_id);
    },
};

module.exports = CaseService;
