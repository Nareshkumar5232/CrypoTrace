/**
 * pdfGenerator.js
 * Converts a structured investigation report object into a formatted PDF.
 * Returns a Promise that resolves to a Buffer.
 */
const PDFDocument = require('pdfkit');

// ─────────────── Colour palette ───────────────
const COLORS = {
    primary: '#1a237e',
    secondary: '#283593',
    accent: '#ff6f00',
    text: '#212121',
    muted: '#757575',
    border: '#bdbdbd',
    bg: '#f5f5f5',
    white: '#ffffff',
    risk: { LOW: '#4caf50', MEDIUM: '#ff9800', HIGH: '#f44336', CRITICAL: '#b71c1c' },
    severity: { LOW: '#4caf50', MEDIUM: '#ff9800', HIGH: '#f44336', CRITICAL: '#b71c1c' },
};

/**
 * Generate a PDF buffer from a report object.
 * @param {Object} report - Output of ReportBuilder.buildReport()
 * @returns {Promise<Buffer>}
 */
function generatePdf(report) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
            const chunks = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // ── Title page ──
            _renderTitlePage(doc, report);

            // ── 1. Case Information ──
            doc.addPage();
            _renderSectionHeader(doc, '1. Case Information');
            _renderCaseInfo(doc, report.case_information);

            // ── 2. Investigated Wallets ──
            _renderSectionHeader(doc, '2. Investigated Wallets');
            _renderWallets(doc, report.wallets);

            // ── 3. Transaction Flow Summary ──
            _renderSectionHeader(doc, '3. Transaction Flow Summary');
            _renderTransactionSummary(doc, report.transaction_summary);

            // ── 4. Wallet Clusters ──
            _renderSectionHeader(doc, '4. Wallet Clusters');
            _renderClusters(doc, report.clusters);

            // ── 5. Detected Laundering Patterns ──
            _renderSectionHeader(doc, '5. Detected Laundering Patterns');
            _renderPatterns(doc, report.laundering_patterns);

            // ── 6. Risk Analysis ──
            _renderSectionHeader(doc, '6. Risk Analysis');
            _renderRiskScores(doc, report.risk_scores);

            // ── 7. Alerts Generated ──
            doc.addPage();
            _renderSectionHeader(doc, '7. Alerts Generated');
            _renderAlerts(doc, report.alerts);

            // ── 8. Investigator Notes ──
            _renderSectionHeader(doc, '8. Investigator Notes');
            _renderNotes(doc, report.investigator_notes);

            // ── Footer on every page ──
            const pageCount = doc.bufferedPageRange().count;
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor(COLORS.muted)
                    .text(
                        `CryptoTrace Intelligence Report — Page ${i + 1} of ${pageCount}`,
                        50, doc.page.height - 40,
                        { align: 'center', width: doc.page.width - 100 }
                    );
            }

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

// ═══════════════════════════════════════════════════
//  Internal rendering helpers
// ═══════════════════════════════════════════════════

function _renderTitlePage(doc, report) {
    doc.moveDown(6);
    doc.fontSize(28).fillColor(COLORS.primary)
        .text('INVESTIGATION INTELLIGENCE REPORT', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(16).fillColor(COLORS.secondary)
        .text(`Case: ${report.case_information.case_number}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor(COLORS.text)
        .text(report.case_information.title, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(10).fillColor(COLORS.muted)
        .text(`Generated: ${new Date(report.generated_at).toLocaleString()}`, { align: 'center' });
    doc.moveDown(0.3);
    doc.text(`Assigned Officer: ${report.case_information.assigned_officer || 'N/A'}`, { align: 'center' });
    doc.moveDown(0.3);
    doc.text('CONFIDENTIAL — For authorized personnel only', { align: 'center' });
}

function _renderSectionHeader(doc, title) {
    _checkPageSpace(doc, 60);
    doc.moveDown(1.5);
    doc.fontSize(14).fillColor(COLORS.primary).text(title);
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y)
        .strokeColor(COLORS.border).stroke();
    doc.moveDown(0.5);
    doc.fillColor(COLORS.text).fontSize(10);
}

function _renderCaseInfo(doc, info) {
    const fields = [
        ['Case Number', info.case_number],
        ['Title', info.title],
        ['Description', info.description || 'N/A'],
        ['Assigned Officer', info.assigned_officer || 'N/A'],
        ['Status', info.status],
        ['Priority', info.priority],
        ['Created', info.created_at ? new Date(info.created_at).toLocaleString() : 'N/A'],
    ];
    for (const [label, value] of fields) {
        _checkPageSpace(doc, 15);
        doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
        doc.font('Helvetica').text(String(value));
    }
}

function _renderWallets(doc, wallets) {
    if (!wallets || wallets.length === 0) {
        doc.fillColor(COLORS.muted).text('No wallets associated with this case.');
        return;
    }
    for (const w of wallets) {
        _checkPageSpace(doc, 30);
        doc.font('Helvetica-Bold').text(`• ${w.wallet_address}`, { continued: false });
        doc.font('Helvetica').fillColor(COLORS.muted)
            .text(`  Blockchain: ${w.blockchain_type || 'N/A'} | Transactions: ${w.transaction_count}`);
        doc.fillColor(COLORS.text);
    }
}

function _renderTransactionSummary(doc, summary) {
    const fields = [
        ['Total Transactions', summary.total_transactions],
        ['Total Value Transferred', summary.total_value_transferred],
        ['Earliest Transaction', summary.earliest_transaction ? new Date(summary.earliest_transaction).toLocaleString() : 'N/A'],
        ['Latest Transaction', summary.latest_transaction ? new Date(summary.latest_transaction).toLocaleString() : 'N/A'],
    ];
    for (const [label, value] of fields) {
        doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
        doc.font('Helvetica').text(String(value));
    }
}

function _renderClusters(doc, clusters) {
    if (!clusters || clusters.length === 0) {
        doc.fillColor(COLORS.muted).text('No clusters detected.');
        return;
    }
    for (const c of clusters) {
        _checkPageSpace(doc, 40);
        doc.font('Helvetica-Bold').text(`Cluster: ${c.cluster_id}`);
        doc.font('Helvetica')
            .text(`  Wallets: ${c.wallet_count} | Risk: ${c.risk_level} (${c.risk_score}/10)`);
        if (c.wallets && c.wallets.length > 0) {
            const addrList = c.wallets.slice(0, 10).join(', ');
            const suffix = c.wallets.length > 10 ? ` ... +${c.wallets.length - 10} more` : '';
            doc.fillColor(COLORS.muted).fontSize(8)
                .text(`  ${addrList}${suffix}`);
            doc.fillColor(COLORS.text).fontSize(10);
        }
        doc.moveDown(0.3);
    }
}

function _renderPatterns(doc, patterns) {
    if (!patterns || patterns.length === 0) {
        doc.fillColor(COLORS.muted).text('No laundering patterns detected.');
        return;
    }
    for (const p of patterns) {
        _checkPageSpace(doc, 15);
        doc.font('Helvetica-Bold').text(`• ${p.pattern}`, { continued: true });
        doc.font('Helvetica')
            .text(`  — ${p.occurrences} occurrence(s), severity: ${p.highest_severity}`);
    }
}

function _renderRiskScores(doc, scores) {
    if (!scores || scores.length === 0) {
        doc.fillColor(COLORS.muted).text('No risk scores available.');
        return;
    }
    for (const r of scores) {
        _checkPageSpace(doc, 15);
        const color = COLORS.risk[r.risk_level] || COLORS.text;
        doc.font('Helvetica-Bold').text(`Cluster ${r.cluster_id}: `, { continued: true });
        doc.fillColor(color).text(`${r.risk_score}/10 (${r.risk_level})`, { continued: false });
        doc.fillColor(COLORS.text);
    }
}

function _renderAlerts(doc, alerts) {
    if (!alerts || alerts.length === 0) {
        doc.fillColor(COLORS.muted).text('No alerts generated.');
        return;
    }
    for (const a of alerts) {
        _checkPageSpace(doc, 25);
        const sevColor = COLORS.severity[a.severity] || COLORS.text;
        doc.font('Helvetica-Bold').fillColor(sevColor)
            .text(`[${a.severity}] ${a.alert_type}`, { continued: false });
        doc.font('Helvetica').fillColor(COLORS.text)
            .text(`  Status: ${a.status} | ${a.created_at ? new Date(a.created_at).toLocaleString() : ''}`);
        doc.moveDown(0.2);
    }
}

function _renderNotes(doc, notes) {
    if (!notes || notes.length === 0) {
        doc.fillColor(COLORS.muted).text('No investigator notes recorded.');
        return;
    }
    for (const n of notes) {
        _checkPageSpace(doc, 30);
        doc.font('Helvetica-Bold').text(`${n.author} — ${n.created_at ? new Date(n.created_at).toLocaleString() : ''}`);
        doc.font('Helvetica').text(n.note_text);
        doc.moveDown(0.5);
    }
}

/**
 * Add a new page if remaining space is less than `needed` points.
 */
function _checkPageSpace(doc, needed) {
    if (doc.y + needed > doc.page.height - 60) {
        doc.addPage();
    }
}

module.exports = { generatePdf };
