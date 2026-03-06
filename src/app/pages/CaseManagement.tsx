import { useState } from "react";
import { Briefcase, Plus, Filter, Wallet, ShieldAlert, FileText, ChevronRight, Loader2, Trash2, X } from "lucide-react";
import { TnLoader } from "../components/TnLoader";
import { useCases, useUpdateCase, useCreateCase, useDeleteCase } from "../../hooks/useCases";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { useAlerts } from "../../hooks/useAlerts";
import { useTransactions } from "../../hooks/useTransactions";
import { useAuditLogs } from "../../hooks/useAuditLogs";
import { useWallets } from "../../hooks/useWallets";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "../components/ui/dialog";
import { toast } from "sonner";

// ─── Timeline Types ────────────────────────────────────────────────────────────
interface TimelineEvent {
    type: string;
    timestamp: string;
    description: string;
}

// ─── buildTimeline ─────────────────────────────────────────────────────────────
function buildTimeline(
    caseData: any,
    linkedWallets: any[],
    alerts: any[],
    transactions: any[],
    notes: any[],
    auditLogs: any[]
): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    // 1. Case Created
    if (caseData?.created_at) {
        events.push({
            type: "Case Created",
            timestamp: caseData.created_at,
            description: `Investigation "${caseData.title || caseData.id}" was opened.`,
        });
    }

    // 2. Wallet Linked
    (linkedWallets || []).forEach((w: any) => {
        const ts = w.added_at || w.created_at;
        if (ts) {
            events.push({
                type: "Wallet Linked",
                timestamp: ts,
                description: `Wallet ${w.address || w.wallet_address || w.id} was linked to the case.`,
            });
        }
    });

    // 3. Suspicious Transaction Detected
    (transactions || [])
        .filter((tx: any) => tx.risk_flag === true || tx.risk_flag === "true" || tx.risk_flag === 1)
        .forEach((tx: any) => {
            const ts = tx.tx_timestamp || tx.timestamp || tx.created_at;
            if (ts) {
                events.push({
                    type: "Suspicious Transaction Detected",
                    timestamp: ts,
                    description: `Flagged transaction ${tx.tx_hash || tx.id} — Amount: ${tx.amount ?? "N/A"}.`,
                });
            }
        });

    // 4. Alert Triggered
    (alerts || []).forEach((a: any) => {
        if (a.created_at) {
            events.push({
                type: "Alert Triggered",
                timestamp: a.created_at,
                description: `Alert "${a.title || a.type || a.id}" was triggered.`,
            });
        }
    });

    // 5. Alert Resolved
    (alerts || []).forEach((a: any) => {
        if (a.resolved_at) {
            events.push({
                type: "Alert Resolved",
                timestamp: a.resolved_at,
                description: `Alert "${a.title || a.type || a.id}" was resolved.`,
            });
        }
    });

    // 6. Risk Level Updated (audit logs containing "risk")
    (auditLogs || [])
        .filter((log: any) =>
            typeof log.action === "string" && log.action.toLowerCase().includes("risk")
        )
        .forEach((log: any) => {
            const ts = log.created_at || log.timestamp;
            if (ts) {
                events.push({
                    type: "Risk Level Updated",
                    timestamp: ts,
                    description: `${log.action}${log.details ? ` — ${log.details}` : ""}.`,
                });
            }
        });

    // 7. Officer Note Added
    (notes || []).forEach((n: any) => {
        if (n.created_at) {
            events.push({
                type: "Officer Note Added",
                timestamp: n.created_at,
                description: n.content || n.note || n.text || "A note was recorded on this case.",
            });
        }
    });

    // Sort ascending by timestamp
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return events;
}

// ─── Small helper: format ISO timestamp ────────────────────────────────────────
function fmtTimestamp(iso: string): string {
    try {
        return new Date(iso).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    } catch {
        return iso;
    }
}

// ─── Dot colour per event type ─────────────────────────────────────────────────
const EVENT_DOT: Record<string, string> = {
    "Case Created": "bg-[#0F1623]",
    "Wallet Linked": "bg-[#3B82F6]",
    "Suspicious Transaction Detected": "bg-[#EF4444]",
    "Alert Triggered": "bg-[#F59E0B]",
    "Alert Resolved": "bg-[#22C55E]",
    "Risk Level Updated": "bg-[#8B5CF6]",
    "Officer Note Added": "bg-[#64748B]",
};

export function CaseManagement() {
    const [selectedCase, setSelectedCase] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const { data: cases, isLoading, isError } = useCases({ search: searchTerm });
    const { mutate: updateCase, isPending: isUpdating } = useUpdateCase();
    const { mutate: createCase, isPending: isCreating } = useCreateCase();
    const { mutate: deleteCaseFn } = useDeleteCase();

    // ── Modal states ────────────────────────────────────────────────────────
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [createForm, setCreateForm] = useState({ title: '', wallet: '', description: '', riskLevel: 'Medium', officer: '' });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // ── Case-scoped data for Investigation Timeline ──
    const { data: caseAlerts } = useAlerts({ case_id: selectedCase, limit: 200 });
    const { data: caseTransactions } = useTransactions({ case_id: selectedCase, limit: 200 });
    const { data: caseAuditLogs } = useAuditLogs({ case_id: selectedCase, limit: 200 });
    const { data: caseWallets } = useWallets({ case_id: selectedCase, limit: 200 });

    const selectedCaseItem = (cases || []).find((c: any) => c.id === selectedCase);
    const caseNotes = (caseAuditLogs || []).filter(
        (log: any) => typeof log.action === "string" && log.action.toLowerCase().includes("note")
    );
    const timelineEvents = selectedCaseItem
        ? buildTimeline(selectedCaseItem, caseWallets || [], caseAlerts || [], caseTransactions || [], caseNotes, caseAuditLogs || [])
        : [];

    // ── Filtered cases ──────────────────────────────────────────────────────
    const filteredCases = (cases || []).filter((c: any) => {
        if (statusFilter !== 'All' && c.status !== statusFilter) return false;
        if (searchTerm && !c.title?.toLowerCase().includes(searchTerm.toLowerCase()) && !c.id?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const handleCreateCase = () => {
        const errors: Record<string, string> = {};
        if (!createForm.title.trim()) errors.title = 'Case title is required';
        if (!createForm.wallet.trim()) errors.wallet = 'Wallet address is required';
        if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
        setFormErrors({});
        createCase({ title: createForm.title.trim(), wallets: createForm.wallet.trim(), description: createForm.description.trim(), riskLevel: createForm.riskLevel, officer: createForm.officer.trim() || 'Unassigned' });
        setCreateForm({ title: '', wallet: '', description: '', riskLevel: 'Medium', officer: '' });
        setShowCreateModal(false);
    };

    const handleDeleteCase = () => {
        if (showDeleteModal) {
            deleteCaseFn(showDeleteModal);
            setShowDeleteModal(null);
            if (selectedCase === showDeleteModal) setSelectedCase(null);
        }
    };

    const handleChangeStatus = (id: string, newStatus: string) => {
        updateCase({ id, updates: { status: newStatus } });
    };

    const handleAssignOfficer = (id: string) => {
        const officers = ['J. Smith', 'R. Kumar', 'A. Patel', 'S. Iyer', 'M. Devi'];
        const current = (cases || []).find((c: any) => c.id === id)?.officer;
        const next = officers[(officers.indexOf(current || '') + 1) % officers.length];
        updateCase({ id, updates: { officer: next } });
    };

    const renderCaseList = () => (
        <div className="bg-white border border-[#E2E8F0]">
            <div className="flex flex-row items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Active Investigations</h2>
                <div className="flex gap-2">
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`inline-flex items-center justify-center rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${statusFilter !== 'All' ? 'bg-[#0F1623] text-white border-[#0F1623]' : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F1F5F9]'}`}
                        >
                            <Filter className="mr-1.5 h-3 w-3" />
                            {statusFilter === 'All' ? 'Filter' : statusFilter}
                        </button>
                        {showFilterMenu && (
                            <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#1F1F1F] rounded">
                                {['All', 'Open', 'In Progress', 'Under Review', 'Escalated', 'Closed'].map((s) => (
                                    <button key={s} onClick={() => { setStatusFilter(s); setShowFilterMenu(false); }}
                                        className={`block w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-[#F1F5F9] ${statusFilter === s ? 'text-[#0F1623] bg-[#F1F5F9]' : 'text-[#64748B]'}`}
                                    >{s}</button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        disabled={isCreating}
                        className="inline-flex items-center justify-center rounded bg-[#0F1623] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#1E293B] dark:hover:bg-[#00d2a0] dark:hover:text-[#0F1623] transition-colors disabled:opacity-50"
                    >
                        {isCreating ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Plus className="mr-1.5 h-3 w-3" />}
                        New Case
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
                            <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Case ID</th>
                            <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Title</th>
                            <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Status</th>
                            <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Risk Level</th>
                            <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Officer</th>
                            <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Created</th>
                            <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] relative">
                        {isLoading && (
                            <tr>
                                <td colSpan={7} className="p-0">
                                    <TnLoader text="LOADING INVESTIGATIONS..." />
                                </td>
                            </tr>
                        )}
                        {isError && (
                            <tr>
                                <td colSpan={7} className="px-3 py-6 text-center text-xs text-[#EF4444] uppercase tracking-wider font-bold bg-[#FEF2F2]">
                                    FAILED TO LOAD INVESTIGATIONS
                                </td>
                            </tr>
                        )}
                        {!isLoading && (!cases || cases.length === 0) && (
                            <tr>
                                <td colSpan={7} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">
                                    NO RECORDS FOUND
                                </td>
                            </tr>
                        )}
                        {!isLoading && (filteredCases || []).map((c: any) => (
                            <tr key={c.id}>
                                <td className="px-3 py-1.5 font-mono text-xs text-[#64748B]">{c.case_number || c.id}</td>
                                <td className="px-3 py-1.5 text-xs font-medium text-[#0F172A]">{c.title}</td>
                                <td className="px-3 py-1.5">
                                    <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase ${c.status === 'Open' ? 'text-[#F59E0B]' :
                                        c.status === 'In Progress' ? 'text-[#0F1623] ' :
                                            'text-[#64748B] '
                                        }`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="px-3 py-1.5">
                                    <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase ${c.riskLevel === 'Critical' || c.risk_level === 'Critical' ? 'text-[#EF4444]' :
                                        c.riskLevel === 'High' || c.risk_level === 'High' ? 'text-[#F59E0B]' :
                                            'text-[#64748B] '
                                        }`}>
                                        {c.riskLevel || c.risk_level}
                                    </span>
                                </td>
                                <td className="px-3 py-1.5 text-xs text-[#0F172A]">{c.officer || c.assigned_officer}</td>
                                <td className="px-3 py-1.5 text-xs text-[#64748B]">{c.created || c.created_at}</td>
                                <td className="px-3 py-1.5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setShowDeleteModal(c.id)}
                                            className="text-[10px] font-bold uppercase text-[#EF4444] hover:text-[#B91C1C]"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedCase(c.id)}
                                            className="inline-flex items-center text-[10px] font-bold uppercase text-[#0F1623] hover:underline"
                                        >
                                            View <ChevronRight className="ml-1 h-3 w-3" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderCaseDetail = () => {
        const caseItem = selectedCaseItem;
        if (!caseItem) return null;

        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedCase(null)}
                                className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors"
                            >
                                Back to List
                            </button>
                            <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
                                {caseItem.id}: {caseItem.title}
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative group">
                                <button
                                    disabled={isUpdating}
                                    className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors disabled:opacity-50"
                                >
                                    {isUpdating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                                    Status: {caseItem.status}
                                </button>
                                <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#1F1F1F] rounded hidden group-hover:block">
                                    {['Open', 'In Progress', 'Under Review', 'Escalated', 'Closed'].map((s) => (
                                        <button key={s} onClick={() => handleChangeStatus(caseItem.id, s)}
                                            className={`block w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-[#F1F5F9] ${caseItem.status === s ? 'text-[#0F1623] bg-[#F1F5F9]' : 'text-[#64748B]'}`}
                                        >{s}</button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => handleAssignOfficer(caseItem.id)}
                                className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors"
                            >
                                Assign Officer
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(caseItem.id)}
                                className="inline-flex items-center justify-center rounded border border-[#EF4444] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                            >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                            Linked Entities
                        </span>
                        <span className="text-2xl font-bold text-[#0F172A]">
                            {Array.isArray(caseItem.wallets) ? caseItem.wallets.length : caseItem.wallets || 0}
                        </span>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                            Intelligence Notifications
                        </span>
                        <span className="text-2xl font-bold text-[#0F172A]">
                            {Array.isArray(caseItem.alerts) ? caseItem.alerts.length : caseItem.alerts || 0}
                        </span>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                            Case Notes
                        </span>
                        <span className="text-2xl font-bold text-[#0F172A]">
                            {Array.isArray(caseItem.notes) ? caseItem.notes.length : caseItem.notes || 0}
                        </span>
                    </div>
                </div>
                <Tabs defaultValue="wallets" className="mt-6">
                    <TabsList className="mb-4">
                        <TabsTrigger value="wallets">Entity-level Linked Wallets Table</TabsTrigger>
                        <TabsTrigger value="history">Audit & Note History Timeline</TabsTrigger>
                    </TabsList>
                    <TabsContent value="wallets" className="mt-0 space-y-4">
                        <div className="bg-white border border-[#E2E8F0] flex flex-col">
                            <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                                    Entity-level Linked Wallets Table
                                </h2>
                            </div>
                            {Array.isArray(caseItem.wallets) && caseItem.wallets.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
                                        <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Wallet ID</th>
                                        <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Address</th>
                                        <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Risk Level</th>
                                    </tr></thead>
                                    <tbody className="divide-y divide-[#E2E8F0]">
                                        {caseItem.wallets.map((wId: string) => {
                                            const w = (caseWallets || []).find((ww: any) => ww.id === wId);
                                            return (
                                                <tr key={wId}>
                                                    <td className="px-3 py-1.5 font-mono text-xs text-[#64748B]">{wId}</td>
                                                    <td className="px-3 py-1.5 font-mono text-xs text-[#0F172A]">{w?.address || 'N/A'}</td>
                                                    <td className="px-3 py-1.5 text-[10px] font-bold uppercase">{w?.risk_level || 'Unknown'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-xs text-[#64748B] py-8">
                                    No wallets linked to this case
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="history" className="mt-0 space-y-4">
                        <div className="bg-white border border-[#E2E8F0] flex flex-col">
                            <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                                    Audit & Note History Timeline
                                </h2>
                            </div>
                            {Array.isArray(caseItem.notes) && caseItem.notes.length > 0 ? (
                                <div className="p-4 space-y-3">
                                    {caseItem.notes.map((n: any, idx: number) => (
                                        <div key={idx} className="flex gap-3 items-start border-b border-[#E2E8F0] pb-3 last:border-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] min-w-[120px]">{fmtTimestamp(n.created_at)}</span>
                                            <p className="text-xs text-[#0F172A]">{n.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-xs text-[#64748B] py-8">
                                    No notes recorded for this case
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* ── Investigation Timeline ─────────────────────────────── */}
                <div className="bg-white border border-[#E2E8F0]">
                    <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                            Investigation Timeline
                        </h2>
                    </div>
                    <div className="px-4 py-4">
                        {timelineEvents.length === 0 ? (
                            <p className="text-xs text-[#64748B] uppercase tracking-wider text-center py-6">
                                No timeline events available for this case.
                            </p>
                        ) : (
                            <ol className="relative border-l border-[#E2E8F0] ml-2 space-y-0">
                                {timelineEvents.map((event, idx) => (
                                    <li key={idx} className="mb-4 ml-5">
                                        {/* Connector dot */}
                                        <span
                                            className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white ${EVENT_DOT[event.type] ?? "bg-[#64748B]"
                                                }`}
                                        />
                                        {/* Timestamp */}
                                        <time className="block mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                                            {fmtTimestamp(event.timestamp)}
                                        </time>
                                        {/* Event type badge */}
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F172A]">
                                            {event.type}
                                        </span>
                                        {/* Description */}
                                        <p className="mt-0.5 text-xs text-[#475569] leading-relaxed">
                                            {event.description}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {!selectedCase && (
                <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
                    <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
                        CASE MANAGEMENT
                    </h1>
                    <p className="text-xs uppercase tracking-wider text-[#64748B]">
                        Authoritative record of intelligence operations
                    </p>
                </div>
            )}

            {selectedCase ? renderCaseDetail() : renderCaseList()}

            {/* ── Create Case Modal ──────────────────────────────────── */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Investigation</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]">Case Title *</label>
                            <input value={createForm.title} onChange={(e) => setCreateForm(f => ({ ...f, title: e.target.value }))}
                                className={`flex h-10 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:border-[#0F1623] ${formErrors.title ? 'border-[#EF4444]' : 'border-[#E2E8F0]'}`}
                                placeholder="e.g. Darknet Market Investigation" />
                            {formErrors.title && <p className="text-[10px] text-[#EF4444] font-bold">{formErrors.title}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]">Suspicious Wallet Address *</label>
                            <input value={createForm.wallet} onChange={(e) => setCreateForm(f => ({ ...f, wallet: e.target.value }))}
                                className={`flex h-10 w-full rounded border px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#0F1623] ${formErrors.wallet ? 'border-[#EF4444]' : 'border-[#E2E8F0]'}`}
                                placeholder="0x742d35Cc6634C0532925a3b844Bc9e..." />
                            {formErrors.wallet && <p className="text-[10px] text-[#EF4444] font-bold">{formErrors.wallet}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]">Description</label>
                            <textarea value={createForm.description} onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))}
                                className="flex w-full rounded border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:border-[#0F1623] min-h-[60px]"
                                placeholder="Brief description of suspicious activity..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]">Priority</label>
                                <select value={createForm.riskLevel} onChange={(e) => setCreateForm(f => ({ ...f, riskLevel: e.target.value }))}
                                    className="flex h-10 w-full rounded border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:border-[#0F1623]">
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]">Lead Officer</label>
                                <select value={createForm.officer} onChange={(e) => setCreateForm(f => ({ ...f, officer: e.target.value }))}
                                    className="flex h-10 w-full rounded border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:border-[#0F1623]">
                                    <option value="">Unassigned</option>
                                    <option value="J. Smith">J. Smith</option>
                                    <option value="R. Kumar">R. Kumar</option>
                                    <option value="A. Patel">A. Patel</option>
                                    <option value="S. Iyer">S. Iyer</option>
                                    <option value="M. Devi">M. Devi</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => { setShowCreateModal(false); setFormErrors({}); }}
                            className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleCreateCase}
                            className="inline-flex items-center justify-center rounded bg-[#0F1623] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#1E293B] transition-colors">
                            Create Case
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation Modal ──────────────────────────── */}
            <Dialog open={!!showDeleteModal} onOpenChange={() => setShowDeleteModal(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-[#64748B] py-4">
                        Are you sure you want to delete investigation <span className="font-mono font-bold text-[#0F172A]">{showDeleteModal}</span>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowDeleteModal(null)}
                            className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleDeleteCase}
                            className="inline-flex items-center justify-center rounded bg-[#EF4444] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#B91C1C] transition-colors">
                            Delete
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
