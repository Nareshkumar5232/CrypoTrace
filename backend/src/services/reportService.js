/**
 * reportService.js
 * Orchestration layer for report generation.
 */
const ReportBuilder = require('../utils/reportBuilder');
const { generatePdf } = require('../utils/pdfGenerator');

const ReportService = {
    /**
     * Generate a full investigation report (JSON).
     * @param {string} caseId  UUID
     * @returns {Object} Structured report object
     */
    async generateFullReport(caseId) {
        return ReportBuilder.buildReport(caseId);
    },

    /**
     * Generate a PDF report.
     * @param {string} caseId  UUID
     * @returns {Buffer} PDF file buffer
     */
    async generatePdfReport(caseId) {
        const report = await ReportBuilder.buildReport(caseId);
        return generatePdf(report);
    },

    /**
     * Generate a lightweight case summary (counts + overview).
     * @param {string} caseId  UUID
     * @returns {Object}
     */
    async generateSummary(caseId) {
        return ReportBuilder.buildSummary(caseId);
    },
};

module.exports = ReportService;
