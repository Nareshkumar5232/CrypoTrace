import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { useInvestigationStore } from "../../store/investigationStore";
import { useAppStore } from "../../store/appStore";
import { TnLoader } from "../components/TnLoader";
import { BlockchainNetworkGraph } from "../components/BlockchainNetworkGraph";
import {
  AlertTriangle, ChevronLeft, ChevronDown, ChevronRight, Network, Clock,
  Shield, Layers, Eye, Flag, ArrowRight, ArrowLeft, Search,
  Activity, Wallet, Users, ZoomIn, ZoomOut, Maximize2, RefreshCw
} from "lucide-react";
import type {
  TracedTransaction, GraphNode, WalletInteraction, WalletCluster,
  SuspiciousPattern, InvestigationWorkflowStep
} from "../../lib/mockInvestigationData";

/* ═══════════════════════════════════════════
   Risk Badge Component
   ═══════════════════════════════════════════ */
function RiskBadge({ level, score }: { level: string; score?: number }) {
  const cfg =
    level === "High"
      ? { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600 dark:text-red-400", dot: "bg-red-500" }
      : level === "Medium"
        ? { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" }
        : { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {level} Risk{score != null ? ` – ${score}%` : ""}
    </span>
  );
}

/* ═══════════════════════════════════════════
   Severity Badge Component
   ═══════════════════════════════════════════ */
function SeverityBadge({ severity }: { severity: string }) {
  const cfg =
    severity === "High"
      ? "text-[#EF4444]"
      : severity === "Medium"
        ? "text-[#F59E0B]"
        : "text-[#64748B]";
  return <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg}`}>{severity}</span>;
}

/* ═══════════════════════════════════════════
   Wallet Interaction Panel
   ═══════════════════════════════════════════ */
function InteractionsPanel({ interactions }: { interactions: WalletInteraction[] }) {
  return (
    <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border">
      <div className="border-b border-[#E2E8F0] dark:border-border bg-[#F8FAFC] dark:bg-muted/30 px-4 py-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-[#64748B]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-foreground">Most Interacting Wallets</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] dark:border-border bg-[#F1F5F9] dark:bg-muted/20 text-left">
              <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Wallet Address</th>
              <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B] text-center">Tx Count</th>
              <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Type</th>
              <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Risk</th>
              <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B] text-right">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-border">
            {interactions.map((w) => (
              <tr key={w.address} className="hover:bg-[#F8FAFC] dark:hover:bg-muted/10 transition-colors">
                <td className="px-3 py-2 font-mono text-xs text-[#0F172A] dark:text-foreground truncate max-w-[180px]">{w.address}</td>
                <td className="px-3 py-2 text-xs text-center font-bold text-[#0F172A] dark:text-foreground">{w.transactionCount}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] dark:text-foreground">
                    {w.interactionType === "Sender" && <ArrowRight className="h-3 w-3 text-red-500" />}
                    {w.interactionType === "Receiver" && <ArrowLeft className="h-3 w-3 text-green-500" />}
                    {w.interactionType === "Both" && <Activity className="h-3 w-3 text-blue-500" />}
                    {w.interactionType}
                  </span>
                </td>
                <td className="px-3 py-2"><RiskBadge level={w.riskLevel} /></td>
                <td className="px-3 py-2 font-mono text-xs text-right text-[#0F172A] dark:text-foreground">{w.totalVolume} ETH</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Wallet Clusters Panel
   ═══════════════════════════════════════════ */
function ClustersPanel({ clusters }: { clusters: WalletCluster[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border">
      <div className="border-b border-[#E2E8F0] dark:border-border bg-[#F8FAFC] dark:bg-muted/30 px-4 py-3 flex items-center gap-2">
        <Layers className="h-4 w-4 text-[#64748B]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-foreground">Wallet Clusters</h3>
      </div>
      <div className="divide-y divide-[#E2E8F0] dark:divide-border">
        {clusters.map((c) => (
          <div key={c.clusterId}>
            <button
              onClick={() => setExpanded(expanded === c.clusterId ? null : c.clusterId)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F8FAFC] dark:hover:bg-muted/10 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs font-bold text-[#0F172A] dark:text-foreground">{c.clusterId}</span>
                <RiskBadge level={c.riskLevel} />
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Wallets</p>
                  <p className="text-sm font-bold text-[#0F172A] dark:text-foreground">{c.walletCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Transactions</p>
                  <p className="text-sm font-bold text-[#0F172A] dark:text-foreground">{c.totalTransactions}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Volume</p>
                  <p className="text-sm font-bold text-[#0F172A] dark:text-foreground">{c.totalVolume} ETH</p>
                </div>
                {expanded === c.clusterId ? <ChevronDown className="h-4 w-4 text-[#64748B]" /> : <ChevronRight className="h-4 w-4 text-[#64748B]" />}
              </div>
            </button>
            {expanded === c.clusterId && (
              <div className="bg-[#F8FAFC] dark:bg-muted/10 px-4 pb-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Address</th>
                      <th className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Role</th>
                      <th className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] dark:divide-border">
                    {c.memberWallets.map((mw) => (
                      <tr key={mw.address}>
                        <td className="px-2 py-1.5 font-mono text-xs text-[#0F172A] dark:text-foreground truncate max-w-[200px]">{mw.address}</td>
                        <td className="px-2 py-1.5 text-xs text-[#0F172A] dark:text-foreground">{mw.role}</td>
                        <td className="px-2 py-1.5">
                          <RiskBadge level={mw.riskScore >= 70 ? "High" : mw.riskScore >= 40 ? "Medium" : "Low"} score={mw.riskScore} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Suspicious Patterns Panel
   ═══════════════════════════════════════════ */
function PatternsPanel({ patterns }: { patterns: SuspiciousPattern[] }) {
  return (
    <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border">
      <div className="border-b border-[#E2E8F0] dark:border-border bg-[#F8FAFC] dark:bg-muted/30 px-4 py-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-foreground">Detected Suspicious Patterns</h3>
      </div>
      <div className="divide-y divide-[#E2E8F0] dark:divide-border">
        {patterns.map((p) => (
          <div key={p.id} className="px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-[#64748B]">{p.id}</span>
                <span className="text-xs font-bold text-[#0F172A] dark:text-foreground">{p.patternType} Pattern</span>
              </div>
              <SeverityBadge severity={p.severity} />
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed mb-2">{p.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {p.affectedWallets.map((addr) => (
                <span key={addr} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#F1F5F9] dark:bg-muted text-[#64748B] truncate max-w-[140px]">
                  {addr.slice(0, 8)}...{addr.slice(-4)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Transaction Timeline
   ═══════════════════════════════════════════ */
function TransactionTimeline({ transactions }: { transactions: TracedTransaction[] }) {
  const sorted = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const hopColors: Record<number, string> = { 1: "bg-blue-500", 2: "bg-amber-500", 3: "bg-red-500" };

  return (
    <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border">
      <div className="border-b border-[#E2E8F0] dark:border-border bg-[#F8FAFC] dark:bg-muted/30 px-4 py-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-[#64748B]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-foreground">Transaction Timeline</h3>
      </div>
      <div className="max-h-[400px] overflow-y-auto px-4 py-4">
        <ol className="relative border-l-2 border-[#E2E8F0] dark:border-border ml-3 space-y-0">
          {sorted.map((tx) => (
            <li key={tx.id} className="mb-4 ml-5">
              <span className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white dark:ring-card ${hopColors[tx.hop] || "bg-gray-400"}`} />
              <div className="flex items-center gap-2 mb-0.5">
                <time className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  {new Date(tx.timestamp).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </time>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${tx.hop === 1 ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : tx.hop === 2 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"}`}>
                  Hop {tx.hop}
                </span>
                <RiskBadge level={tx.riskLevel} />
              </div>
              <p className="text-xs text-[#0F172A] dark:text-foreground">
                <span className="font-mono text-[10px] text-[#64748B]">{tx.sender.slice(0, 10)}...</span>
                <ArrowRight className="inline h-3 w-3 mx-1 text-[#94A3B8]" />
                <span className="font-mono text-[10px] text-[#64748B]">{tx.receiver.slice(0, 10)}...</span>
              </p>
              <p className="text-xs font-bold text-[#0F172A] dark:text-foreground mt-0.5">{tx.amount} {tx.asset}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Investigation Workflow
   ═══════════════════════════════════════════ */
function WorkflowPanel({ steps }: { steps: InvestigationWorkflowStep[] }) {
  const statusCfg: Record<string, { icon: string; color: string; bg: string }> = {
    Completed: { icon: "✓", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/30" },
    "In Progress": { icon: "●", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/30 animate-pulse" },
    Pending: { icon: "○", color: "text-[#64748B]", bg: "bg-[#F1F5F9] dark:bg-muted border-[#E2E8F0] dark:border-border" },
  };

  return (
    <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border">
      <div className="border-b border-[#E2E8F0] dark:border-border bg-[#F8FAFC] dark:bg-muted/30 px-4 py-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-[#64748B]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-foreground">Investigation Workflow</h3>
      </div>
      <div className="px-4 py-4 space-y-2">
        {steps.map((s) => {
          const cfg = statusCfg[s.status];
          return (
            <div key={s.step} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${cfg.bg}`}>
              <span className={`text-sm font-bold ${cfg.color}`}>{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0F172A] dark:text-foreground">{s.step}. {s.label}</p>
                {s.timestamp && (
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    {new Date(s.timestamp).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{s.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Multi-Hop Transactions Table
   ═══════════════════════════════════════════ */
function MultiHopTable({ transactions }: { transactions: TracedTransaction[] }) {
  const [hopFilter, setHopFilter] = useState<number | null>(null);
  const [dirFilter, setDirFilter] = useState<string | null>(null);

  const filtered = transactions.filter((tx) => {
    if (hopFilter && tx.hop !== hopFilter) return false;
    if (dirFilter && tx.direction !== dirFilter) return false;
    return true;
  });

  return (
    <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-border bg-[#F8FAFC] dark:bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-[#64748B]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-foreground">Multi-Hop Traced Transactions</h3>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded border border-[#E2E8F0] dark:border-border overflow-hidden">
            {[null, 1, 2, 3].map((h) => (
              <button
                key={h ?? "all"}
                onClick={() => setHopFilter(h)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${hopFilter === h ? "bg-[#0F1623] dark:bg-navbar-accent text-white dark:text-[#0F1623]" : "text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-muted"}`}
              >
                {h ? `Hop ${h}` : "All"}
              </button>
            ))}
          </div>
          <div className="flex rounded border border-[#E2E8F0] dark:border-border overflow-hidden">
            {[null, "incoming", "outgoing"].map((d) => (
              <button
                key={d ?? "all"}
                onClick={() => setDirFilter(d)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${dirFilter === d ? "bg-[#0F1623] dark:bg-navbar-accent text-white dark:text-[#0F1623]" : "text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-muted"}`}
              >
                {d ? d.charAt(0).toUpperCase() + d.slice(1) : "All"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0">
            <tr className="border-b border-[#E2E8F0] dark:border-border bg-[#F1F5F9] dark:bg-muted/20 text-left">
              <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">TX ID</th>
              <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Hop</th>
              <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Direction</th>
              <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Sender</th>
              <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Receiver</th>
              <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B] text-right">Amount</th>
              <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Risk</th>
              <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-border">
            {filtered.map((tx) => (
              <tr key={tx.id} className="hover:bg-[#F8FAFC] dark:hover:bg-muted/10 transition-colors">
                <td className="px-3 py-1.5 font-mono text-xs text-[#64748B]">{tx.id}</td>
                <td className="px-3 py-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${tx.hop === 1 ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : tx.hop === 2 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"}`}>
                    Hop {tx.hop}
                  </span>
                </td>
                <td className="px-3 py-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${tx.direction === "incoming" ? "text-emerald-600" : "text-red-500"}`}>
                    {tx.direction}
                  </span>
                </td>
                <td className="px-3 py-1.5 font-mono text-xs text-[#0F172A] dark:text-foreground truncate max-w-[120px]">{tx.sender.slice(0, 10)}...</td>
                <td className="px-3 py-1.5 font-mono text-xs text-[#0F172A] dark:text-foreground truncate max-w-[120px]">{tx.receiver.slice(0, 10)}...</td>
                <td className="px-3 py-1.5 font-mono text-xs text-right text-[#0F172A] dark:text-foreground">{tx.amount} {tx.asset}</td>
                <td className="px-3 py-1.5"><RiskBadge level={tx.riskLevel} /></td>
                <td className="px-3 py-1.5 text-xs text-[#64748B]">{new Date(tx.timestamp).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">No transactions match filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE: Investigation Analysis
   ═══════════════════════════════════════════════════════════════ */
export function InvestigationAnalysis() {
  const navigate = useNavigate();
  const { id, caseId } = useParams();
  const cases = useAppStore((s) => s.cases);
  const { result, isTracing, error, startInvestigation, flagWallet, flaggedWallets, walletAddress, reset } = useInvestigationStore();

  const graphRef = useRef<HTMLDivElement>(null);
  const clusterRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const getRouteTarget = useCallback(() => {
    const routeToken = decodeURIComponent((id ?? caseId ?? "").trim());
    if (!routeToken) return walletAddress.trim();

    const caseMatch = cases.find((c: any) => c.id === routeToken);
    if (caseMatch) {
      const firstWallet = Array.isArray(caseMatch.wallets) ? caseMatch.wallets[0] : caseMatch.wallets;
      if (typeof firstWallet === "string" && firstWallet.trim().length > 0) {
        return firstWallet.trim();
      }
    }

    return routeToken;
  }, [id, caseId, cases, walletAddress]);

  // Auto-start tracing when route contains a wallet/case target.
  useEffect(() => {
    const target = getRouteTarget();
    if (!target) return;
    if (isTracing) return;
    if (result?.walletAddress === target) return;

    startInvestigation(target);
  }, [getRouteTarget, isTracing, result?.walletAddress, startInvestigation]);

  if (isTracing) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1 border-b border-[#E2E8F0] dark:border-border pb-4">
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-foreground">INVESTIGATION IN PROGRESS</h1>
          <p className="text-xs uppercase tracking-wider text-[#64748B]">Tracing transactions for {walletAddress}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <TnLoader text="TRACING MULTI-HOP TRANSACTIONS..." />
          <div className="space-y-2 max-w-md mx-auto">
            {["Scanning blockchain network...", "Mapping wallet interactions...", "Detecting suspicious patterns...", "Generating risk indicators..."].map((msg, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 flex-1 bg-muted dark:bg-muted/30 animate-pulse rounded" style={{ animationDelay: `${i * 300}ms` }} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] w-48">{msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1 border-b border-[#E2E8F0] dark:border-border pb-4">
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-foreground">INVESTIGATION ERROR</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-sm font-bold text-red-600">{error}</p>
          <div className="flex gap-3">
            <button onClick={() => startInvestigation(walletAddress)} className="inline-flex items-center gap-2 rounded bg-[#0F1623] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#1E293B] transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Retry Investigation
            </button>
            <button onClick={() => { reset(); navigate("/"); }} className="inline-flex items-center gap-2 rounded border border-[#E2E8F0] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1 border-b border-[#E2E8F0] dark:border-border pb-4">
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-foreground">INVESTIGATION ANALYSIS</h1>
          <p className="text-xs uppercase tracking-wider text-[#64748B]">No investigation selected. Choose a case or provide a wallet target.</p>
        </div>
        <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border p-6">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 rounded border border-[#E2E8F0] dark:border-border bg-white dark:bg-card px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] dark:text-foreground hover:bg-[#F1F5F9] dark:hover:bg-muted transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1 border-b border-[#E2E8F0] dark:border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { reset(); navigate("/"); }} className="inline-flex items-center justify-center rounded border border-[#E2E8F0] dark:border-border bg-white dark:bg-card px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] dark:text-foreground hover:bg-[#F1F5F9] dark:hover:bg-muted transition-colors">
              <ChevronLeft className="mr-1 h-3 w-3" /> Dashboard
            </button>
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-foreground">INVESTIGATION ANALYSIS</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scrollTo(graphRef)} className="inline-flex items-center gap-1.5 rounded border border-[#E2E8F0] dark:border-border bg-white dark:bg-card px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] dark:text-foreground hover:bg-[#F1F5F9] dark:hover:bg-muted transition-colors">
              <Eye className="h-3 w-3" /> View Graph
            </button>
            <button onClick={() => scrollTo(clusterRef)} className="inline-flex items-center gap-1.5 rounded border border-[#E2E8F0] dark:border-border bg-white dark:bg-card px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] dark:text-foreground hover:bg-[#F1F5F9] dark:hover:bg-muted transition-colors">
              <Layers className="h-3 w-3" /> View Clusters
            </button>
            <button onClick={() => scrollTo(timelineRef)} className="inline-flex items-center gap-1.5 rounded border border-[#E2E8F0] dark:border-border bg-white dark:bg-card px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] dark:text-foreground hover:bg-[#F1F5F9] dark:hover:bg-muted transition-colors">
              <Clock className="h-3 w-3" /> View Timeline
            </button>
          </div>
        </div>
        <p className="text-xs uppercase tracking-wider text-[#64748B]">
          Target: <span className="font-mono">{result.walletAddress}</span>
        </p>
      </div>

      {/* ── Investigation Summary ── */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total Transactions", value: result.summary.totalTransactions },
          { label: "Total Volume", value: `${result.summary.totalVolume} ETH` },
          { label: "Unique Wallets", value: result.summary.uniqueWallets },
          { label: "Max Hop Depth", value: result.summary.maxHopDepth },
          { label: "High Risk Connections", value: result.summary.highRiskConnections },
          { label: "Flagged Patterns", value: result.summary.flaggedPatterns },
        ].map((m) => (
          <div key={m.label} className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border p-4 flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">{m.label}</span>
            <span className="text-2xl font-bold text-[#0F172A] dark:text-foreground">{m.value}</span>
          </div>
        ))}
      </div>

      {/* ── Risk Indicator for target wallet ── */}
      <div className="bg-white dark:bg-card border border-[#E2E8F0] dark:border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Shield className="h-6 w-6 text-red-500" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-foreground">Target Wallet Risk Assessment</p>
            <p className="font-mono text-[10px] text-[#64748B] mt-0.5">{result.walletAddress}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{result.riskScore}%</p>
            <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Risk Score</p>
          </div>
          <RiskBadge level={result.riskLevel} score={result.riskScore} />
          <button
            onClick={() => flagWallet(result.walletAddress)}
            className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              flaggedWallets.has(result.walletAddress)
                ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30"
                : "bg-[#0F1623] text-white hover:bg-[#1E293B] dark:hover:bg-[#00d2a0] dark:hover:text-[#0F1623]"
            }`}
          >
            <Flag className="h-3 w-3" />
            {flaggedWallets.has(result.walletAddress) ? "Flagged" : "Flag Wallet"}
          </button>
        </div>
      </div>

      {/* ── Investigation Workflow ── */}
      <WorkflowPanel steps={result.workflow} />

      {/* ── Multi-Hop Transaction Table ── */}
      <MultiHopTable transactions={result.transactions} />

      {/* ── Transaction Graph ── */}
      <div ref={graphRef}>
        <div className="bg-[#111111] dark:bg-[#111111] border border-[#1F1F1F] dark:border-[#1F1F1F] rounded-lg overflow-hidden">
          <div className="border-b border-[#1F1F1F] dark:border-[#1F1F1F] bg-[#0A0A0A] dark:bg-[#0A0A0A] px-4 py-3 flex items-center gap-2">
            <Network className="h-4 w-4 text-[#B3B3B3]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Blockchain Transaction Network</h3>
          </div>
          <BlockchainNetworkGraph 
            nodes={result.graphNodes} 
            edges={result.graphEdges} 
            flaggedWallets={flaggedWallets} 
            onFlagWallet={flagWallet}
            suspectWallet={walletAddress}
          />
        </div>
      </div>

      {/* ── Wallet Interactions ── */}
      <InteractionsPanel interactions={result.interactions} />

      {/* ── Wallet Clusters ── */}
      <div ref={clusterRef}>
        <ClustersPanel clusters={result.clusters} />
      </div>

      {/* ── Suspicious Patterns ── */}
      <PatternsPanel patterns={result.patterns} />

      {/* ── Transaction Timeline ── */}
      <div ref={timelineRef}>
        <TransactionTimeline transactions={result.transactions} />
      </div>
    </div>
  );
}
