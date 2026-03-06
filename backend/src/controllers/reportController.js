/**
 * reportController.js
 * Request validation and delegation to ReportService.
 */
const ReportService = require('../services/reportService');

const ReportController = {
    /**
     * GET /api/reports/case/:case_id
     * Returns the full investigation report as JSON.
     */
    async getFullReport(req, res, next) {
        try {
            const { case_id } = req.params;
            if (!case_id) {
                return res.status(400).json({ error: 'case_id parameter is required' });
            }

            const report = await ReportService.generateFullReport(case_id);
            return res.status(200).json(report);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/reports/case/:case_id/pdf
     * Generates and streams a downloadable PDF report.
     */
    async downloadPdf(req, res, next) {
        try {
            const { case_id } = req.params;
            if (!case_id) {
                return res.status(400).json({ error: 'case_id parameter is required' });
            }

            const pdfBuffer = await ReportService.generatePdfReport(case_id);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="report_${case_id}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });
            return res.send(pdfBuffer);
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/reports/summary/:case_id
     * Returns a lightweight investigation overview.
     */
    async getSummary(req, res, next) {
        try {
            const { case_id } = req.params;
            if (!case_id) {
                return res.status(400).json({ error: 'case_id parameter is required' });
            }

            const summary = await ReportService.generateSummary(case_id);
            return res.status(200).json(summary);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = ReportController;
