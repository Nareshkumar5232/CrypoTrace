import { Briefcase, Wallet, ShieldAlert, FileText, Loader2 } from "lucide-react";
import { TnLoader } from "../components/TnLoader";
import { useDashboardMetrics } from "../../hooks/useDashboard";

export function Dashboard() {
    const { data, isLoading, isError, error } = useDashboardMetrics();

    // Map backend metrics to our KPI grid
    const kpiData = [
        {
            title: "ACTIVE INVESTIGATIONS",
            value: data?.activeCases ?? 0,
        },
        {
            title: "HIGH RISK ENTITIES",
            value: data?.highRiskWallets ?? 0,
        },
        {
            title: "OPEN NOTIFICATIONS",
            value: data?.openAlerts ?? 0,
        },
    ];

    const recentCases = data?.recentCases || [];
    const recentAuditLogs = data?.recentAuditLogs || [];
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
                <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center justify-between">
                    <span>SYSTEM DASHBOARD</span>
                    {isLoading ? null : null}
                </h1>
                <p className="text-xs uppercase tracking-wider text-[#64748B]">
                    Overview of active intelligence metrics
                </p>
            </div>

            {isError && (
                <div className="bg-[#FEF2F2] border border-[#EF4444] p-4 text-[#7F1D1D] text-xs font-bold uppercase tracking-wider">
                    FAILED TO LOAD METRICS: {(error as any)?.response?.data?.message || error?.message || 'Unknown error'}
                </div>
            )}

            {/* Top: Summary Row - Flat Stat Panels */}
            <div className="grid gap-4 md:grid-cols-3">
                {kpiData.map((kpi) => (
                    <div key={kpi.title} className="bg-white border border-[#E2E8F0] p-4 flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                            {kpi.title}
                        </span>
                        <span className="text-2xl font-bold text-[#0F172A]">
                            {kpi.value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Middle: Case Overview Table */}
            <div className="bg-white border border-[#E2E8F0]">
                <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                        Active Investigations Overview
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Case ID</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Title</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Status</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B] text-right">Lead Officer</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0] relative">
                            {isLoading && (
                                <tr>
                                    <td colSpan={4} className="p-0">
                                        <TnLoader text="LOADING INVESTIGATIONS..." />
                                    </td>
                                </tr>
                            )}
                            {!isLoading && recentCases.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">
                                        NO ACTIVE INVESTIGATIONS FOUND
                                    </td>
                                </tr>
                            )}
                            {!isLoading && recentCases.map((caseItem: any) => (
                                <tr key={caseItem.id}>
                                    <td className="px-3 py-1.5 font-mono text-xs text-[#64748B]">{caseItem.id}</td>
                                    <td className="px-3 py-1.5 text-xs font-medium text-[#0F172A]">{caseItem.title}</td>
                                    <td className="px-3 py-1.5">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase ${caseItem.status === 'Open' ? 'text-[#F59E0B]' :
                                            caseItem.status === 'In Progress' ? 'text-[#0F1623] ' :
                                                'text-[#64748B] '
                                            }`}>
                                            {caseItem.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-right text-[#0F172A]">{caseItem.officer || caseItem.assigned_officer}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom: Recent Audit Activity */}
            <div className="bg-white border border-[#E2E8F0]">
                <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                        System Audit Trail
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Log ID</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Officer</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Action</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Target</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B] text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {isLoading && (
                                <tr>
                                    <td colSpan={5} className="p-0">
                                        <TnLoader text="LOADING AUDIT TRAIL..." />
                                    </td>
                                </tr>
                            )}
                            {!isLoading && recentAuditLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">
                                        NO RECENT SYSTEM LOGS FOUND
                                    </td>
                                </tr>
                            )}
                            {!isLoading && recentAuditLogs.map((log: any) => (
                                <tr key={log.id}>
                                    <td className="px-3 py-1.5 font-mono text-xs text-[#64748B]">{log.id}</td>
                                    <td className="px-3 py-1.5 text-xs font-medium text-[#0F172A]">{log.user || log.officer}</td>
                                    <td className="px-3 py-1.5 text-xs text-[#0F172A]">{log.action === "Generated Alert" ? "Generated Intelligence Notification" : log.action === "Flagged Wallet" ? "Flagged Entity" : log.action}</td>
                                    <td className="px-3 py-1.5 font-mono text-xs text-[#0F172A]">{log.target || log.entity_type}</td>
                                    <td className="px-3 py-1.5 text-xs text-right text-[#64748B]">{log.time || log.created_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
