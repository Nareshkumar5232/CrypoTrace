import { useState } from "react";
import { Filter, Search, Loader2 } from "lucide-react";
import { TnLoader } from "../components/TnLoader";
import { useAlerts, useResolveAlert, useEscalateAlert } from "../../hooks/useAlerts";
import { Switch } from "../components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

export function AlertManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [severityFilter, setSeverityFilter] = useState<string>("All");
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [confirmResolve, setConfirmResolve] = useState<string | null>(null);
    const { data: alerts, isLoading, isError } = useAlerts({ search: searchTerm });
    const { mutate: resolveAlert, isPending: isResolving } = useResolveAlert();
    const { mutate: escalateAlert, isPending: isEscalating } = useEscalateAlert();

    const filteredAlerts = (alerts || []).filter((a: any) => {
        if (severityFilter !== 'All' && a.severity !== severityFilter) return false;
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            if (!a.id?.toLowerCase().includes(q) && !a.description?.toLowerCase().includes(q) && !(a.walletId || a.wallet_id || '').toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const handleResolve = (id: string) => {
        resolveAlert(id);
        setConfirmResolve(null);
    };

    return (
        <div className="space-y-6 page-enter-content">
            <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
                <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
                    INTELLIGENCE NOTIFICATIONS
                </h1>
                <p className="text-xs uppercase tracking-wider text-[#64748B]">
                    Automated risk triggers and investigative workflows
                </p>
            </div>

            <div className="bg-white border border-[#E2E8F0]">
                <div className="flex flex-row items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
                        ACTIVE NOTIFICATIONS
                    </h2>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-[#64748B]" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="SEARCH NOTIFICATION ID OR ENTITY..."
                                className="h-7 w-64 rounded border border-[#E2E8F0] bg-white pl-8 pr-3 text-[10px] uppercase tracking-wider text-[#0F172A] placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9]"
                            />
                        </div>
                        <div className="flex items-center gap-2 border border-[#E2E8F0] bg-white px-2 py-1 rounded">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F172A]">Auto-Refresh</span>
                            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                        </div>
                        <button className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-smooth-fast"
                            onClick={() => setShowFilterMenu(!showFilterMenu)}>
                            <Filter className="mr-1.5 h-3 w-3" />
                            {severityFilter === 'All' ? 'Filter' : severityFilter}
                        </button>
                        {showFilterMenu && (
                            <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#1F1F1F] rounded">
                                {['All', 'Critical', 'High', 'Medium', 'Low'].map((s) => (
                                    <button key={s} onClick={() => { setSeverityFilter(s); setShowFilterMenu(false); }}
                                        className={`block w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-[#F1F5F9] ${severityFilter === s ? 'text-[#0F1623] bg-[#F1F5F9]' : 'text-[#64748B]'}`}
                                    >{s}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Notification ID</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Severity</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Description</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Entity Link</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Case Link</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Timestamp</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Status</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0] relative">
                            {isLoading && (
                                <tr>
                                    <td colSpan={8} className="p-0">
                                        <TnLoader text="LOADING NOTIFICATIONS..." />
                                    </td>
                                </tr>
                            )}
                            {isError && (
                                <tr>
                                    <td colSpan={8} className="px-3 py-6 text-center text-xs text-[#EF4444] uppercase tracking-wider font-bold bg-[#FEF2F2]">
                                        FAILED TO LOAD DATA
                                    </td>
                                </tr>
                            )}
                            {!isLoading && (!alerts || alerts.length === 0) && (
                                <tr>
                                    <td colSpan={8} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">
                                        NO RECORDS FOUND
                                    </td>
                                </tr>
                            )}
                            {!isLoading && (filteredAlerts || []).map((alert: any) => (
                                <tr key={alert.id} className="table-row-hover">
                                    <td className="px-3 py-1.5 font-mono text-xs text-[#64748B]">{alert.id}</td>
                                    <td className="px-3 py-1.5">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase ${alert.severity === 'Critical' ? 'text-[#EF4444]' :
                                            alert.severity === 'High' ? 'text-[#F59E0B]' :
                                                alert.severity === 'Medium' ? 'text-[#F59E0B]' :
                                                    'text-[#0F1623] '
                                            }`}>
                                            {alert.severity}
                                        </span>
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-[#0F172A]">{alert.description}</td>
                                    <td className="px-3 py-1.5 font-mono text-xs cursor-pointer text-[#0F1623] hover:underline font-bold">{alert.walletId || alert.wallet_id}</td>
                                    <td className="px-3 py-1.5 text-xs">
                                        {(alert.caseId || alert.case_id) ? (
                                            <span className="cursor-pointer text-[#0F1623] font-bold hover:underline">{alert.caseId || alert.case_id}</span>
                                        ) : (
                                            <span className="text-[#64748B] hover:text-[#0F172A] cursor-pointer font-semibold uppercase tracking-wider text-[10px]">ASSIGN TO CASE</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-[#0F172A]">{alert.timestamp || alert.created_at}</td>
                                    <td className="px-3 py-1.5">
                                        <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider ${(alert.status || '').toUpperCase() === 'RESOLVED' ? 'text-[#10B981]' :
                                            (alert.status || '').toUpperCase() === 'ESCALATED' ? 'text-[#EF4444]' :
                                            (alert.status || '').toUpperCase() === 'IN REVIEW' ? 'text-[#F59E0B]' :
                                                'text-[#0F1623] '
                                            }`}>
                                            {alert.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-1.5 text-right">
                                        {(alert.status || '').toUpperCase() !== 'RESOLVED' && (
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => escalateAlert(alert.id)}
                                                    disabled={isEscalating || alert.status === 'Escalated'}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] hover:text-[#0F172A] disabled:opacity-50"
                                                >ESCALATE</button>
                                                <button
                                                    onClick={() => setConfirmResolve(alert.id)}
                                                    disabled={isResolving}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-[#10B981] hover:text-[#047857] disabled:opacity-50"
                                                >
                                                    RESOLVE
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Resolve Confirmation Modal ─────────────────────── */}
            <Dialog open={!!confirmResolve} onOpenChange={() => setConfirmResolve(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Resolution</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-[#64748B] py-4">
                        Are you sure you want to mark <span className="font-mono font-bold text-[#0F172A]">{confirmResolve}</span> as RESOLVED?
                    </p>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setConfirmResolve(null)}
                            className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] transition-colors">
                            Cancel
                        </button>
                        <button onClick={() => confirmResolve && handleResolve(confirmResolve)}
                            className="inline-flex items-center justify-center rounded bg-[#10B981] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#047857] transition-colors">
                            Resolve
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
