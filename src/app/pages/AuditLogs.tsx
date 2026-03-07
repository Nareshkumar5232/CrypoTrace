import { useState } from "react";
import { Filter, Search, Download, ShieldCheck, Loader2 } from "lucide-react";
import { TnLoader } from "../components/TnLoader";
import { useAuditLogs } from "../../hooks/useAuditLogs";
import { toast } from "sonner";

export function AuditLogs() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: auditLogs, isLoading, isError } = useAuditLogs({ search: searchTerm });
    const [entityFilter, setEntityFilter] = useState<string>('All');

    const filteredLogs = (auditLogs || []).filter((log: any) => {
        if (entityFilter === 'All') return true;
        return (log.entityType || log.entity_type) === entityFilter;
    });

    const handleExportLog = () => {
        const rows = filteredLogs.map((log: any) => [
            log.id, log.timestamp || log.created_at, log.user || log.officer || 'SYSTEM',
            log.action, log.entityType || log.entity_type || 'Unknown',
            log.entityId || log.entity_id || '-', log.ipAddress || log.ip_address || '-'
        ]);
        const header = ['Log ID', 'Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
        const csv = [header, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit_logs_export.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${filteredLogs.length} log entries.`);
    };
    return (
        <div className="space-y-6 page-enter-content">
            <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
                <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
                    SYSTEM AUDIT LOGS
                </h1>
                <p className="text-xs uppercase tracking-wider text-[#64748B]">
                    Immutable record of system access and entity modifications
                </p>
            </div>

            <div className="bg-white border border-[#E2E8F0] transition-smooth dark:bg-card dark:border-border">
                <div className="flex flex-row items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 dark:border-border dark:bg-muted/30">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
                        AUDIT TRAIL
                    </h2>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-[#64748B]" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="SEARCH LOGS BY USER OR ENTITY..."
                                className="h-7 w-64 rounded border border-[#E2E8F0] bg-white pl-8 pr-3 text-[10px] uppercase tracking-wider text-[#0F172A] placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9] transition-smooth input-glow"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={entityFilter}
                                onChange={(e) => setEntityFilter(e.target.value)}
                                className="h-7 rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] focus:outline-none focus:border-[#0F1623]"
                            >
                                <option value="All">All Types</option>
                                <option value="Case">Case</option>
                                <option value="Wallet">Wallet</option>
                                <option value="Alert">Alert</option>
                                <option value="User">User</option>
                                <option value="System">System</option>
                            </select>
                        </div>
                        <button onClick={handleExportLog} className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-smooth-fast">
                            <Download className="mr-1.5 h-3 w-3" />
                            Export Log
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm table-rows-animate">
                        <thead>
                            <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left dark:bg-muted/20 dark:border-border">
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Log ID</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Timestamp (UTC)</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">User / System</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Action Performed</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Entity Type</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Entity ID</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B] text-right">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0] relative">
                            {isLoading && (
                                <tr>
                                    <td colSpan={7} className="p-0">
                                        <TnLoader text="SCANNING LOGS..." />
                                    </td>
                                </tr>
                            )}
                            {isError && (
                                <tr>
                                    <td colSpan={7} className="px-3 py-6 text-center text-xs text-[#EF4444] uppercase tracking-wider font-bold bg-[#FEF2F2]">
                                        FAILED TO LOAD AUDIT LOGS
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">
                                        NO AUDIT LOGS FOUND
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filteredLogs.map((log: any) => (
                                <tr key={log.id}>
                                    <td className="px-3 py-1.5 font-mono text-xs text-[#64748B]">{log.id}</td>
                                    <td className="px-3 py-1.5 text-xs text-[#0F172A]">{log.timestamp || log.created_at}</td>
                                    <td className="px-3 py-1.5 font-bold text-xs text-[#0F1623] cursor-pointer hover:underline">{log.user || log.officer || log.users?.name || 'SYSTEM'}</td>
                                    <td className="px-3 py-1.5 text-xs text-[#0F172A]">{log.action}</td>
                                    <td className="px-3 py-1.5 text-xs text-[#64748B]">{log.entityType || log.entity_type || 'Unknown'}</td>
                                    <td className="px-3 py-1.5 font-mono text-xs text-[#0F1623] cursor-pointer hover:underline font-bold">{log.entityId || log.entity_id || '-'}</td>
                                    <td className="px-3 py-1.5 text-right font-mono text-xs text-[#64748B]">{log.ipAddress || log.ip_address || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
