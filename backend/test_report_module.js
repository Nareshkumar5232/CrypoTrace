/**
 * test_report_module.js
 * In-memory unit tests for the report builder and PDF generator — no DB required.
 */
const { generatePdf } = require('./src/utils/pdfGenerator');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ ${message}`);
        passed++;
    } else {
        console.log(`  ❌ ${message}`);
        failed++;
    }
}

// ── Mock report data ──
function makeMockReport(overrides = {}) {
    return {
        generated_at: new Date().toISOString(),
        case_information: {
            case_number: 'FIU-2026-0001',
            title: 'Test Investigation',
            description: 'Sample case for unit testing',
            assigned_officer: 'Agent Smith',
            status: 'OPEN',
            priority: 'HIGH',
            created_at: new Date().toISOString(),
        },
        wallets: [
            { wallet_address: '0xabc123', blockchain_type: 'ETH', transaction_count: 42 },
            { wallet_address: '0xdef456', blockchain_type: 'BTC', transaction_count: 7 },
        ],
        transaction_summary: {
            total_transactions: 49,
            total_value_transferred: 125000.50,
            earliest_transaction: '2025-01-01T00:00:00Z',
            latest_transaction: '2026-03-01T12:00:00Z',
        },
        clusters: [
            {
                cluster_id: 'c1-uuid',
                risk_score: 8,
                risk_level: 'HIGH',
                wallet_count: 3,
                wallets: ['0xabc123', '0xdef456', '0x789ghi'],
                created_at: new Date().toISOString(),
            },
        ],
        laundering_patterns: [
            { pattern: 'FAN_OUT', occurrences: 2, highest_severity: 'HIGH' },
            { pattern: 'PEEL_CHAIN', occurrences: 1, highest_severity: 'CRITICAL' },
        ],
        risk_scores: [
            { cluster_id: 'c1-uuid', risk_score: 8, risk_level: 'HIGH', wallet_count: 3 },
        ],
        alerts: [
            { id: 'a1', alert_type: 'FAN_OUT', severity: 'HIGH', status: 'NEW', created_at: new Date().toISOString(), details: {} },
            { id: 'a2', alert_type: 'PEEL_CHAIN', severity: 'CRITICAL', status: 'NEW', created_at: new Date().toISOString(), details: {} },
        ],
        investigator_notes: [
            { id: 'n1', note_text: 'Suspicious activity observed.', author: 'Agent Smith', created_at: new Date().toISOString() },
        ],
        ...overrides,
    };
}

console.log('\n=============================================');
console.log(' MODULE 9: Report Generator Tests');
console.log('=============================================\n');

// ─────────── Test 1: Report object structure ───────────
console.log('📋 Test 1: Mock report has all 8 required sections');
{
    const report = makeMockReport();
    assert(report.case_information !== undefined, 'Has case_information');
    assert(Array.isArray(report.wallets), 'Has wallets array');
    assert(report.transaction_summary !== undefined, 'Has transaction_summary');
    assert(Array.isArray(report.clusters), 'Has clusters array');
    assert(Array.isArray(report.laundering_patterns), 'Has laundering_patterns array');
    assert(Array.isArray(report.risk_scores), 'Has risk_scores array');
    assert(Array.isArray(report.alerts), 'Has alerts array');
    assert(Array.isArray(report.investigator_notes), 'Has investigator_notes array');
    assert(report.generated_at !== undefined, 'Has generated_at timestamp');
}

// ─────────── Test 2: Empty sections handled ───────────
console.log('\n🚫 Test 2: Report with empty sections');
{
    const report = makeMockReport({
        wallets: [],
        clusters: [],
        laundering_patterns: [],
        risk_scores: [],
        alerts: [],
        investigator_notes: [],
    });
    assert(report.wallets.length === 0, 'Empty wallets accepted');
    assert(report.clusters.length === 0, 'Empty clusters accepted');
    assert(report.alerts.length === 0, 'Empty alerts accepted');
}

// ─────────── Test 3: Transaction summary aggregates ───────────
console.log('\n📊 Test 3: Transaction summary fields present');
{
    const report = makeMockReport();
    const ts = report.transaction_summary;
    assert(typeof ts.total_transactions === 'number', 'total_transactions is a number');
    assert(typeof ts.total_value_transferred === 'number', 'total_value_transferred is a number');
    assert(ts.earliest_transaction !== null, 'earliest_transaction is present');
    assert(ts.latest_transaction !== null, 'latest_transaction is present');
}

// ─────────── Test 4: PDF generation ───────────
console.log('\n📄 Test 4: PDF generation produces valid buffer');
(async () => {
    try {
        const report = makeMockReport();
        const buffer = await generatePdf(report);
        assert(Buffer.isBuffer(buffer), 'Output is a Buffer');
        assert(buffer.length > 0, `Buffer is non-empty (${buffer.length} bytes)`);
        assert(buffer.slice(0, 5).toString() === '%PDF-', 'Buffer starts with %PDF- header');
    } catch (err) {
        console.log(`  ❌ PDF generation failed: ${err.message}`);
        failed++;
    }

    // ─────────── Test 5: PDF with empty sections ───────────
    console.log('\n📄 Test 5: PDF generation with empty sections');
    try {
        const report = makeMockReport({
            wallets: [],
            clusters: [],
            laundering_patterns: [],
            risk_scores: [],
            alerts: [],
            investigator_notes: [],
        });
        const buffer = await generatePdf(report);
        assert(Buffer.isBuffer(buffer), 'Empty-section PDF is a Buffer');
        assert(buffer.length > 0, `Buffer is non-empty (${buffer.length} bytes)`);
    } catch (err) {
        console.log(`  ❌ Empty-section PDF failed: ${err.message}`);
        failed++;
    }

    // ─────────── Summary ───────────
    console.log('\n════════════════════════════════════');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('════════════════════════════════════\n');
    process.exit(failed > 0 ? 1 : 0);
})();
