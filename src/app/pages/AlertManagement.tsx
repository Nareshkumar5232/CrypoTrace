import { useState } from "react";
import { motion } from "motion/react";
import { Filter, Search, Loader2 } from "lucide-react";
import { TnLoader } from "../components/TnLoader";
import { useAlerts, useResolveAlert, useEscalateAlert } from "../../hooks/useAlerts";
import { Switch } from "../components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const pageVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

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
        <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
            }}
        >
            <motion.div
                className="flex flex-col gap-1 border-b border-border pb-5"
                variants={pageVariants}
            >
                <h1 className="page-title text-xl">
                    Intelligence Notifications
                </h1>
                <p className="page-subtitle">
                    Automated risk triggers and investigative workflows
                </p>
            </motion.div>

            <motion.div className="dash-card !p-0 overflow-hidden" variants={pageVariants}>
                <div className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-6 py-4">
                    <h2 className="section-heading flex items-center gap-2">
                        Active Notifications
                    </h2>
                    <div className="flex gap-2">
                        <div className="relative h-9">
                            <span className="absolute left-3 top-0 bottom-0 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
                            </span>
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search notification or entity..."
                                aria-label="Search notifications"
                                className="h-9 w-56 rounded-xl border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-navbar-accent/30 focus:border-navbar-accent transition-smooth input-glow"
                            />
                        </div>
                        <div className="flex items-center gap-2 border border-border bg-background px-3 py-1.5 rounded-xl">
                            <span className="text-xs font-medium text-foreground">Auto-Refresh</span>
                            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                        </div>
                        <button
                            className="chart-filter-btn inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                        >
                            <Filter className="h-3.5 w-3.5" />
                            {severityFilter === 'All' ? 'Filter' : severityFilter}
                        </button>
                        {showFilterMenu && (
                            <div className="absolute right-0 top-full mt-1.5 z-20 w-40 bg-card dark:bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                                {['All', 'Critical', 'High', 'Medium', 'Low'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => { setSeverityFilter(s); setShowFilterMenu(false); }}
                                        className={`block w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-muted ${severityFilter === s ? 'text-foreground bg-muted' : 'text-muted-foreground'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm table-rows-animate data-table">
                        <thead>
                            <tr>
                                <th className="text-left">Notification ID</th>
                                <th className="text-left">Severity</th>
                                <th className="text-left">Description</th>
                                <th className="text-left">Entity Link</th>
                                <th className="text-left">Case Link</th>
                                <th className="text-left">Timestamp</th>
                                <th className="text-left">Status</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border relative">
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
            </motion.div>

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
        </motion.div>
    );
}
