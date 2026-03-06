const CaseService = require('../services/caseService');

const CaseController = {
    /**
     * POST /api/cases
     */
    async createCase(req, res, next) {
        try {
            const { title, description, priority, assigned_officer } = req.body;
            const created_by = req.user.id;

            const newCase = await CaseService.createCase({
                title,
                description,
                priority,
                assigned_officer,
                created_by,
            });

            return res.status(201).json(newCase);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/cases
     */
    async getCases(req, res, next) {
        try {
            const filters = {};
            if (req.query.status) filters.status = req.query.status;
            if (req.query.assigned_officer) filters.assigned_officer = req.query.assigned_officer;

            const cases = await CaseService.getAllCases(filters);
            return res.status(200).json(cases);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/cases/:id
     */
    async getCaseById(req, res, next) {
        try {
            const caseData = await CaseService.getCaseById(req.params.id);
            return res.status(200).json(caseData);
        } catch (err) {
            next(err);
        }
    },

    /**
     * PATCH /api/cases/:id
     */
    async updateCase(req, res, next) {
        try {
            const updated = await CaseService.updateCase(req.params.id, req.body);
            return res.status(200).json(updated);
        } catch (err) {
            next(err);
        }
    },

    /**
     * DELETE /api/cases/:id
     */
    async deleteCase(req, res, next) {
        try {
            await CaseService.deleteCase(req.params.id);
            return res.status(200).json({ message: 'Case deleted successfully' });
        } catch (err) {
            next(err);
        }
    },

    /**
     * POST /api/cases/:id/add-wallet
     */
    async addWallet(req, res, next) {
        try {
            const result = await CaseService.addWalletToCase(req.params.id, req.body.wallet_id);
            return res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/cases/:id/wallets
     */
    async getWallets(req, res, next) {
        try {
            const wallets = await CaseService.getCaseWallets(req.params.id);
            return res.status(200).json(wallets);
        } catch (err) {
            next(err);
        }
    },

    /**
     * POST /api/cases/:id/notes
     */
    async addNote(req, res, next) {
        try {
            const note = await CaseService.addNote(req.params.id, req.body.note_text, req.user.id);
            return res.status(201).json(note);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/cases/:id/notes
     */
    async getNotes(req, res, next) {
        try {
            const notes = await CaseService.getCaseNotes(req.params.id);
            return res.status(200).json(notes);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = CaseController;
