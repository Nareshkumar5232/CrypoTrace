import { useState } from "react";
import { Filter, Search, Loader2 } from "lucide-react";
import { TnLoader } from "../components/TnLoader";
import { useAlerts, useUpdateAlert } from "../../hooks/useAlerts";
import { Switch } from "../components/ui/switch";

export function AlertManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [autoRefresh, setAutoRefresh] = useState(false);
    const { data: alerts, isLoading, isError } = useAlerts({ search: searchTerm });
    const { mutate: updateAlert, isPending: isUpdating } = useUpdateAlert();

    const handleResolve = (id: string) => {
        if (window.confirm("Are you sure you want to flag this intelligence notification as RESOLVED?")) {
            updateAlert({ id, updates: { status: 'Resolved', resolved_at: new Date().toISOString() } });
        }
    };

    return (
        <div className="space-y-6">
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
                        <button className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors">
                            <Filter className="mr-1.5 h-3 w-3" />
                            Filter
                        </button>
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
                            {!isLoading && (alerts || []).map((alert: any) => (
                                <tr key={alert.id}>
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
                                            (alert.status || '').toUpperCase() === 'IN REVIEW' ? 'text-[#F59E0B]' :
                                                'text-[#0F1623] '
                                            }`}>
                                            {alert.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-1.5 text-right">
                                        {(alert.status || '').toUpperCase() !== 'RESOLVED' && (
                                            <div className="flex justify-end gap-3">
                                                <button className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] hover:text-[#0F172A]">ESCALATE</button>
                                                <button
                                                    onClick={() => handleResolve(alert.id)}
                                                    disabled={isUpdating}
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
        </div>
    );
}
