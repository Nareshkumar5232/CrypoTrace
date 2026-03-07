import { useState } from "react";
import { Filter, ArrowDownRight, ArrowUpRight, ShieldAlert, Briefcase, ActivitySquare, Network, Loader2 } from "lucide-react";
import { TnLoader } from "../components/TnLoader";
import { useWallets, useWallet, useUpdateWallet } from "../../hooks/useWallets";
import { useTransactions } from "../../hooks/useTransactions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

export function WalletIntelligence() {
    const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { data: wallets, isLoading: listsLoading, isError: listsError } = useWallets({ search: searchTerm });
    const { data: selectedWallet, isLoading: detailLoading } = useWallet(selectedWalletId);
    const { mutate: updateWallet, isPending: isUpdating } = useUpdateWallet();
    const { data: allTransactions } = useTransactions({});

    // Pagination and Filter state
    const [page, setPage] = useState(1);
    const [showCriticalOnly, setShowCriticalOnly] = useState(false);
    const [showRiskModal, setShowRiskModal] = useState(false);
    const [riskInput, setRiskInput] = useState('');

    const itemsPerPage = 10;
    const filteredWallets = (wallets || []).filter((w: any) => {
        if (showCriticalOnly) {
            return w.risk_level === 'Critical' || w.riskLevel === 'Critical';
        }
        return true;
    });
    const totalPages = Math.max(1, Math.ceil(filteredWallets.length / itemsPerPage));
    const paginatedWallets = filteredWallets.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // Get transactions linked to selected wallet
    const walletTransactions = selectedWalletId
        ? (allTransactions || []).filter((tx: any) => tx.source === selectedWalletId || tx.destination === selectedWalletId)
        : [];

    const handleUpdateRisk = () => {
        if (!selectedWalletId || !riskInput) return;
        const numScore = Number(riskInput);
        if (isNaN(numScore) || numScore < 0 || numScore > 100) return;
        let riskLevel = "Low";
        if (numScore >= 75) riskLevel = "Critical";
        else if (numScore >= 50) riskLevel = "High";
        else if (numScore >= 25) riskLevel = "Medium";
        updateWallet({ id: selectedWalletId, updates: { risk_score: numScore, risk_level: riskLevel } });
        setShowRiskModal(false);
        setRiskInput('');
    };

    const renderWalletList = () => (
        <div className="dash-card !p-0 overflow-hidden transition-smooth">
            <div className="flex flex-row flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-muted/30 px-6 py-4">
                <h2 className="section-heading">Entity Intelligence Database</h2>
                <div className="flex gap-2">
                    <div className="w-64">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="SEARCH IDENTIFIER..."
                            className="h-7 w-full rounded border border-[#E2E8F0] bg-white px-3 text-[10px] uppercase tracking-wider text-[#0F172A] placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9] transition-smooth input-glow"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setShowCriticalOnly(!showCriticalOnly);
                            setPage(1); // reset pagination on filter change
                        }}
                        className={`inline-flex items-center justify-center rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-smooth-fast ${showCriticalOnly
                            ? 'bg-[#0F1623] text-white hover:bg-[#1E293B] dark:hover:bg-[#00d2a0] dark:hover:text-[#0F1623] border-[#0F1623] '
                            : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white'
                            }`}>
                        <Filter className="mr-1.5 h-3 w-3" />
                        {showCriticalOnly ? 'Show All' : 'Critical Only'}
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm table-rows-animate data-table">
                    <thead>
                        <tr>
                            <th className="text-left">Entity ID</th>
                            <th className="text-left">Address</th>
                            <th className="text-left">Entity Type</th>
                            <th className="text-left">Risk Score</th>
                            <th className="text-left">Risk Level</th>
                            <th className="text-right">Balance</th>
                            <th className="text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] relative">
                        {listsLoading && (
                            <tr>
                                <td colSpan={7} className="p-0">
                                    <TnLoader text="SCANNING ENTITY DATABASE..." />
                                </td>
                            </tr>
                        )}
                        {listsError && (
                            <tr>
                                <td colSpan={7} className="px-3 py-6 text-center text-xs text-[#EF4444] uppercase tracking-wider font-bold bg-[#FEF2F2]">
                                    FAILED TO LOAD ENTITIES
                                </td>
                            </tr>
                        )}
                        {!listsLoading && (!wallets || wallets.length === 0) && (
                            <tr>
                                <td colSpan={7} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">
                                    NO RECORD FOUND
                                </td>
                            </tr>
                        )}
                        {!listsLoading && (paginatedWallets || []).map((w: any) => (
                            <tr key={w.id} className="table-row-hover">
                                <td className="px-3 py-1.5 font-mono text-xs text-[#64748B]">{w.id}</td>
                                <td className="px-3 py-1.5 text-xs text-[#0F172A] font-mono">{w.address}</td>
                                <td className="px-3 py-1.5 text-xs font-medium text-[#0F172A]">{w.entity_type || w.type || 'Unknown'}</td>
                                <td className="px-3 py-1.5 text-xs font-mono text-[#0F172A]">{w.risk_score || w.riskScore}/100</td>
                                <td className="px-3 py-1.5">
                                    <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase ${w.risk_level === 'Critical' || w.riskLevel === 'Critical' ? 'text-[#EF4444]' :
                                        w.risk_level === 'High' || w.riskLevel === 'High' ? 'text-[#F59E0B]' :
                                            'text-[#0F1623] '
                                        }`}>
                                        {w.risk_level || w.riskLevel}
                                    </span>
                                </td>
                                <td className="px-3 py-1.5 text-right font-mono text-xs text-[#0F172A]">{w.balance_usd ? `$${w.balance_usd}` : w.balance}</td>
                                <td className="px-3 py-1.5 text-right">
                                    <button
                                        onClick={() => setSelectedWalletId(w.id)}
                                        className="inline-flex items-center text-[10px] font-bold uppercase text-[#0F1623] hover:underline"
                                    >
                                        Inspect
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Showing page {page} of {totalPages}</div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );

    const renderWalletDetail = () => {
        if (detailLoading) {
            return <div className="p-0">
                <TnLoader text="LOADING ENTITY PROFILE..." />
            </div>;
        }

        const wallet = selectedWallet;
        if (!wallet) return null;

        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedWalletId(null)}
                                className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors"
                            >
                                Back to Registry
                            </button>
                            <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
                                {wallet.id}
                            </h2>
                            <span className="font-mono text-xs text-[#64748B] px-2 py-1 bg-[#F1F5F9] rounded border border-[#E2E8F0]">
                                {wallet.address}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setRiskInput(String(wallet.risk_score || '')); setShowRiskModal(true); }}
                                disabled={isUpdating}
                                className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors disabled:opacity-50"
                            >
                                {isUpdating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                                Update Risk Level
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="section-box p-4 flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                            Risk Score
                        </span>
                        <div className="text-2xl font-bold text-[#0F172A] flex items-baseline gap-1">
                            {wallet.risk_score || wallet.riskScore || 0} <span className="text-[10px] font-mono font-normal text-[#64748B]">/ 100</span>
                        </div>
                    </div>
                    <div className="section-box p-4 flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                            Current Balance
                        </span>
                        <span className="text-2xl font-bold text-[#0F172A]">
                            {wallet.balance_usd ? `$${wallet.balance_usd}` : wallet.balance || '0.00'}
                        </span>
                    </div>
                    <div className="section-box p-4 flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                            Linked Cases
                        </span>
                        <span className="text-2xl font-bold text-[#0F172A]">
                            {wallet.cases || 0}
                        </span>
                    </div>
                    <div className="section-box p-4 flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                            Related Clusters
                        </span>
                        <span className="text-2xl font-bold text-[#0F172A]">
                            {wallet.clusters || 0}
                        </span>
                    </div>
                </div>

                <div className="section-box">
                    <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                            Recent Transactions
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
                                    <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">TX ID</th>
                                    <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Date/Time</th>
                                    <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Direction</th>
                                    <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Counterparty</th>
                                    <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Amount</th>
                                    <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Risk Flag</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0]">
                                {walletTransactions.length === 0 && (
                                    <tr><td colSpan={6} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">No transactions found</td></tr>
                                )}
                                {walletTransactions.map((tx: any) => (
                                    <tr key={tx.id}>
                                        <td className="px-3 py-1.5 font-mono text-xs text-[#64748B]">{tx.id}</td>
                                        <td className="px-3 py-1.5 text-xs text-[#0F172A]">{tx.date || tx.timestamp}</td>
                                        <td className="px-3 py-1.5">
                                            <div className="flex items-center gap-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${tx.type === "Incoming" || tx.direction === "Incoming" ? "text-[#0F1623]" : "text-[#64748B]"}`}>
                                                    {tx.type || tx.direction}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-1.5 text-[#0F172A] font-mono text-xs">
                                            {(tx.type === "Incoming" || tx.direction === "Incoming") ? tx.source : tx.destination}
                                        </td>
                                        <td className="px-3 py-1.5 font-mono text-xs text-[#0F172A]">{tx.amount} {tx.asset || 'BTC'}</td>
                                        <td className="px-3 py-1.5">
                                            <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase ${tx.risk === 'Critical' || tx.risk_level === 'Critical' ? 'text-[#EF4444]' :
                                                tx.risk === 'High' || tx.risk_level === 'High' ? 'text-[#F59E0B]' :
                                                tx.risk === 'Medium' || tx.risk_level === 'Medium' ? 'text-[#F59E0B]' :
                                                    'text-[#64748B] '
                                                }`}>
                                                {tx.risk || tx.risk_level || "Low"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 page-enter-content">
            {!selectedWalletId && (
                <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
                    <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
                        ENTITY INTELLIGENCE
                    </h1>
                    <p className="text-xs uppercase tracking-wider text-[#64748B]">
                        Cryptocurrency entity tracking and risk identification
                    </p>
                </div>
            )}

            {selectedWalletId ? renderWalletDetail() : renderWalletList()}

            {/* Risk Update Dialog */}
            <Dialog open={showRiskModal} onOpenChange={setShowRiskModal}>
                <DialogContent className="sm:max-w-[400px] section-box">
                    <DialogHeader>
                        <DialogTitle className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Update Risk Score</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Risk Score (0-100)</label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={riskInput}
                            onChange={(e) => setRiskInput(e.target.value)}
                            className="w-full rounded border border-[#E2E8F0] px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#0F1623]"
                            placeholder="Enter score 0-100"
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setShowRiskModal(false)} className="rounded border border-[#E2E8F0] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B] hover:bg-[#F1F5F9]">Cancel</button>
                            <button onClick={handleUpdateRisk} className="rounded bg-[#0F1623] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#1E293B]">Update</button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
