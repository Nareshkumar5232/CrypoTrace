import { Briefcase, Wallet, ShieldAlert, FileText, Loader2, TrendingUp, TrendingDown, Plus, Search as SearchIcon, AlertTriangle, RefreshCw, Clock, User, Activity, PieChart as PieIcon, ChevronDown } from "lucide-react";
import { TnLoader } from "../components/TnLoader";
import { useDashboardMetrics } from "../../hooks/useDashboard";
import { useNavigate } from "react-router";
import { useState, useCallback } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Sector } from "recharts";

/* ─── Realistic chart datasets ─── */
const activityDataSets: Record<string, { label: string; data: { label: string; flagged: number; total: number }[] }> = {
    "24h": {
        label: "Last 24 hours",
        data: [
            { label: "00:00", flagged: 3, total: 41 }, { label: "02:00", flagged: 1, total: 28 },
            { label: "04:00", flagged: 0, total: 14 }, { label: "06:00", flagged: 2, total: 23 },
            { label: "08:00", flagged: 7, total: 67 }, { label: "10:00", flagged: 12, total: 94 },
            { label: "12:00", flagged: 18, total: 112 }, { label: "14:00", flagged: 9, total: 88 },
            { label: "16:00", flagged: 22, total: 131 }, { label: "18:00", flagged: 14, total: 97 },
            { label: "20:00", flagged: 6, total: 54 }, { label: "22:00", flagged: 4, total: 37 },
        ],
    },
    "7d": {
        label: "Last 7 days",
        data: [
            { label: "Mon", flagged: 14, total: 312 }, { label: "Tue", flagged: 23, total: 287 },
            { label: "Wed", flagged: 8, total: 245 }, { label: "Thu", flagged: 31, total: 398 },
            { label: "Fri", flagged: 19, total: 356 }, { label: "Sat", flagged: 42, total: 421 },
            { label: "Sun", flagged: 27, total: 289 },
        ],
    },
    "30d": {
        label: "Last 30 days",
        data: [
            { label: "W1", flagged: 68, total: 1420 }, { label: "W2", flagged: 94, total: 1680 },
            { label: "W3", flagged: 53, total: 1310 }, { label: "W4", flagged: 112, total: 1890 },
        ],
    },
};

const networkOptions = ["All Networks", "Ethereum", "Bitcoin", "Polygon", "Solana"];

const riskDistData = [
    { name: "High Risk", value: 35, color: "#DC2626" },
    { name: "Medium Risk", value: 45, color: "#D97706" },
    { name: "Low Risk", value: 44, color: "#059669" },
];
const riskTotal = riskDistData.reduce((s, d) => s + d.value, 0);

/* ─── Custom Tooltip ─── */
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    const flagged = d?.flagged ?? payload[0]?.value ?? 0;
    const risk = flagged > 20 ? "High" : flagged > 10 ? "Medium" : "Low";
    const riskColor = flagged > 20 ? "#DC2626" : flagged > 10 ? "#D97706" : "#059669";
    return (
        <div className="chart-tooltip">
            <p className="text-[11px] text-white/50 mb-1.5">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">{flagged}</span>
                <span className="text-[11px] text-white/60">flagged</span>
            </div>
            {d?.total && (
                <p className="text-[11px] text-white/50 mt-0.5">{d.total} total transactions</p>
            )}
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/10">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: riskColor }} />
                <span className="text-[11px] font-medium" style={{ color: riskColor }}>{risk} Risk</span>
            </div>
        </div>
    );
}

/* ─── Donut active shape with hover expansion ─── */
function ActiveDonutSlice(props: any) {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <g>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius - 2} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} style={{ filter: `drop-shadow(0 0 8px ${fill}40)`, transition: "all 300ms ease" }} />
            <Sector cx={cx} cy={cy} innerRadius={outerRadius + 8} outerRadius={outerRadius + 10} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.3} />
        </g>
    );
}

/* ─── Skeleton loader for charts ─── */
function ChartSkeleton() {
    return (
        <div className="h-64 flex items-end gap-2 px-4 pb-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-1 bg-muted animate-pulse rounded-t-md" style={{ height: `${25 + Math.random() * 60}%`, animationDelay: `${i * 80}ms` }} />
            ))}
        </div>
    );
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    "Open": { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
    "In Progress": { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
    "Under Review": { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
    "Escalated": { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
    "Closed": { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] || statusConfig["Open"];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {status}
        </span>
    );
}

function formatTimeAgo(time: string) {
    if (!time) return "";
    try {
        const d = new Date(time);
        const now = new Date();
        const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
        if (diff < 1) return "just now";
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    } catch {
        return time;
    }
}

export function Dashboard() {
    const { data, isLoading, isError, error, refetch } = useDashboardMetrics();
    const navigate = useNavigate();

    const kpiData = [
        {
            title: "Active Investigations",
            value: data?.activeCases ?? 0,
            icon: Briefcase,
            trend: "+12%",
            trendUp: true,
            color: "from-blue-500 to-blue-600",
            iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        },
        {
            title: "High Risk Entities",
            value: data?.highRiskWallets ?? 0,
            icon: ShieldAlert,
            trend: "+8%",
            trendUp: true,
            color: "from-red-500 to-red-600",
            iconBg: "bg-red-500/10 text-red-600 dark:text-red-400",
        },
        {
            title: "Open Notifications",
            value: data?.openAlerts ?? 0,
            icon: AlertTriangle,
            trend: "-3%",
            trendUp: false,
            color: "from-amber-500 to-amber-600",
            iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        },
    ];

    const recentCases = data?.recentCases || [];
    const recentAuditLogs = data?.recentAuditLogs || [];

    const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");
    const [network, setNetwork] = useState("All Networks");
    const [activeDonutIdx, setActiveDonutIdx] = useState<number>(0);
    const onDonutEnter = useCallback((_: any, index: number) => setActiveDonutIdx(index), []);

    const chartData = activityDataSets[timeRange].data;

    return (
        <div className="space-y-8">
            {/* ── Dashboard Header ── */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Investigation Intelligence Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Real-time monitoring of blockchain risk activity
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/cases")} className="dash-btn-primary">
                        <Plus className="h-4 w-4" /> New Case
                    </button>
                    <button onClick={() => navigate("/wallets")} className="dash-btn-secondary">
                        <Wallet className="h-4 w-4" /> Track Wallet
                    </button>
                    <button onClick={() => navigate("/audit-logs")} className="dash-btn-secondary">
                        <FileText className="h-4 w-4" /> Reports
                    </button>
                </div>
            </div>

            {/* ── Error Alert ── */}
            {isError && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300">Failed to load metrics</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                            {(error as any)?.response?.data?.message || error?.message || "Network error"}
                        </p>
                    </div>
                    <button onClick={() => refetch()} className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors">
                        <RefreshCw className="h-3.5 w-3.5" /> Retry
                    </button>
                </div>
            )}

            {/* ── Metrics Cards ── */}
            <div className="grid gap-6 md:grid-cols-3">
                {kpiData.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.title} className="dash-card group">
                            <div className="flex items-start justify-between">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${kpi.iconBg}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-semibold ${kpi.trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                                    {kpi.trendUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                                    {kpi.trend}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-bold text-foreground tracking-tight">
                                    {isLoading ? <span className="inline-block h-8 w-16 rounded-lg bg-muted animate-pulse" /> : kpi.value}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">{kpi.title}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Context Controls ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="chart-filter-group">
                    {(["24h", "7d", "30d"] as const).map((r) => (
                        <button key={r} onClick={() => setTimeRange(r)} className={`chart-filter-btn ${timeRange === r ? "active" : ""}`}>
                            {r}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <select value={network} onChange={(e) => setNetwork(e.target.value)} className="chart-select">
                        {networkOptions.map((n) => <option key={n}>{n}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            {/* ── Analytics Charts ── */}
            <div className="grid gap-6 lg:grid-cols-5">
                {/* Area Chart: Transaction Risk Activity — 3 cols */}
                <div className="dash-card lg:col-span-3 !p-0 overflow-hidden">
                    <div className="flex items-start justify-between px-6 pt-6 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Activity className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Transaction Risk Activity</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Flagged blockchain transactions — {activityDataSets[timeRange].label}</p>
                            </div>
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">{network}</span>
                    </div>
                    {isLoading ? <ChartSkeleton /> : (
                        <div className="h-64 px-2 pb-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 12, right: 16, left: -8, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--navbar-accent)" stopOpacity={0.20} />
                                            <stop offset="95%" stopColor="var(--navbar-accent)" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} dx={-4} />
                                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--navbar-accent)", strokeWidth: 1, strokeDasharray: "4 4", strokeOpacity: 0.4 }} />
                                    <Area type="monotone" dataKey="flagged" stroke="var(--navbar-accent)" strokeWidth={2} fill="url(#areaGrad)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)", fill: "var(--navbar-accent)" }} animationDuration={800} animationEasing="ease-out" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Donut Chart: Risk Distribution — 2 cols */}
                <div className="dash-card lg:col-span-2 !p-0 overflow-hidden">
                    <div className="flex items-start gap-3 px-6 pt-6 pb-2">
                        <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <PieIcon className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Risk Distribution</h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Monitored wallet risk classification</p>
                        </div>
                    </div>
                    {isLoading ? <ChartSkeleton /> : (
                        <div className="flex items-center px-6 pb-6">
                            <div className="relative w-1/2 h-52">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={riskDistData}
                                            cx="50%" cy="50%"
                                            innerRadius={52} outerRadius={76}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="none"
                                            activeIndex={activeDonutIdx}
                                            activeShape={ActiveDonutSlice}
                                            onMouseEnter={onDonutEnter}
                                            animationDuration={600}
                                            animationEasing="ease-out"
                                        >
                                            {riskDistData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center label */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-foreground leading-none">{riskTotal}</span>
                                    <span className="text-[10px] text-muted-foreground mt-1">Wallets</span>
                                </div>
                            </div>
                            <div className="w-1/2 flex flex-col gap-3.5 pl-4">
                                {riskDistData.map((d, i) => (
                                    <button key={d.name} onMouseEnter={() => setActiveDonutIdx(i)} className="flex items-center gap-2.5 text-left group">
                                        <span className="h-2.5 w-2.5 rounded-[3px] transition-transform duration-200 group-hover:scale-125" style={{ background: d.color }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] text-muted-foreground leading-tight">{d.name}</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-sm font-semibold text-foreground">{d.value}</span>
                                                <span className="text-[10px] text-muted-foreground">{Math.round((d.value / riskTotal) * 100)}%</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Investigations Table ── */}
            <div className="dash-card !p-0 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">Active Investigations</h3>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input type="text" placeholder="Search cases..." className="h-8 w-48 rounded-lg border border-border bg-background pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-navbar-accent" />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wider">Case ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground tracking-wider">Lead Officer</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading && (
                                <tr><td colSpan={4} className="p-0"><TnLoader text="Loading investigations..." /></td></tr>
                            )}
                            {!isLoading && recentCases.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                                        No active investigations found
                                    </td>
                                </tr>
                            )}
                            {!isLoading && recentCases.map((c: any) => (
                                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">{c.id}</td>
                                    <td className="px-6 py-3.5 text-sm font-medium text-foreground">{c.title}</td>
                                    <td className="px-6 py-3.5"><StatusBadge status={c.status} /></td>
                                    <td className="px-6 py-3.5 text-sm text-right text-foreground">{c.officer || c.assigned_officer}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Audit Activity Feed ── */}
            <div className="dash-card">
                <h3 className="text-sm font-semibold text-foreground mb-5">System Audit Trail</h3>
                <div className="space-y-4">
                    {isLoading && <TnLoader text="Loading audit trail..." />}
                    {!isLoading && recentAuditLogs.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                    )}
                    {!isLoading && recentAuditLogs.map((log: any, i: number) => (
                        <div key={log.id} className="flex items-start gap-4 group">
                            {/* Avatar */}
                            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                                <User className="h-4 w-4" />
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-sm text-foreground">
                                    <span className="font-semibold">{log.user || log.officer}</span>{" "}
                                    <span className="text-muted-foreground">
                                        {log.action === "Generated Alert" ? "generated an intelligence notification" :
                                         log.action === "Flagged Wallet" ? "flagged an entity" :
                                         log.action?.toLowerCase()}
                                    </span>{" "}
                                    <span className="font-mono text-xs text-navbar-accent">{log.target || log.entity_type}</span>
                                </p>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatTimeAgo(log.time || log.created_at)}
                                </div>
                            </div>
                            {/* Divider dot */}
                            {i < recentAuditLogs.length - 1 && (
                                <div className="absolute left-[18px] top-[44px] w-px h-[calc(100%-36px)] bg-border" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
