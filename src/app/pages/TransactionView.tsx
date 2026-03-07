import { useState } from "react";
import { Filter, Search, ArrowDownRight, ArrowUpRight, Download, Loader2, ChevronLeft } from "lucide-react";
import { TnLoader } from "../components/TnLoader";
import { useTransactions } from "../../hooks/useTransactions";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function TransactionView() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: transactions, isLoading, isError } = useTransactions({ search: searchTerm });
    const navigate = useNavigate();
    const [riskFilter, setRiskFilter] = useState<string>('All');

    const filteredTx = (transactions || []).filter((tx: any) => {
        if (riskFilter === 'All') return true;
        return (tx.risk || tx.risk_level) === riskFilter;
    });

    const handleExportCSV = () => {
        const rows = filteredTx.map((tx: any) => [
            tx.id, tx.date || tx.timestamp, tx.type || tx.direction,
            tx.source, tx.destination, tx.amount, tx.asset || 'BTC',
            tx.risk || tx.risk_level || 'Unknown', tx.caseId || tx.case_id || '-'
        ]);
        const header = ['TX ID', 'Date', 'Direction', 'Source', 'Destination', 'Amount', 'Asset', 'Risk', 'Linked Case'];
        const csv = [header, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions_export.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${filteredTx.length} transactions to CSV.`);
    };

    return (
        <div className="space-y-6 page-enter-content">
            <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors"
                    >
                        <ChevronLeft className="mr-1 h-3 w-3" />
                        Back
                    </button>
                    <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
                        TRANSACTION LEDGER
                    </h1>
                </div>
                <p className="text-xs uppercase tracking-wider text-[#64748B]">
                    Global view of monitored financial transfers and risk flags
                </p>
            </div>

            <div className="bg-white border border-[#E2E8F0]">
                <div className="flex flex-row items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Transaction History</h2>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-[#64748B]" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="SEARCH TX ID OR ADDRESS..."
                                className="h-7 w-64 rounded border border-[#E2E8F0] bg-white pl-8 pr-3 text-[10px] uppercase tracking-wider text-[#0F172A] placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9]"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={riskFilter}
                                onChange={(e) => setRiskFilter(e.target.value)}
                                className="h-7 rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] focus:outline-none focus:border-[#0F1623]"
                            >
                                <option value="All">All Risks</option>
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <button onClick={handleExportCSV} className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors">
                            <Download className="mr-1.5 h-3 w-3" />
                            Export CSV
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">TX ID</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Date/Time (UTC)</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Direction</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Source</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Destination</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B] text-right">Amount</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Risk Flag</th>
                                <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Linked Case</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0] relative">
                            {isLoading && (
                                <tr>
                                    <td colSpan={8} className="p-0">
                                        <TnLoader text="SCANNING LEDGER..." />
                                    </td>
                                </tr>
                            )}
                            {isError && (
                                <tr>
                                    <td colSpan={8} className="px-3 py-6 text-center text-xs text-[#EF4444] uppercase tracking-wider font-bold bg-[#FEF2F2]">
                                        FAILED TO LOAD TRANSACTIONS
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filteredTx.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">
                                        NO REGISTRY TRANSACTIONS FOUND
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filteredTx.map((tx: any) => (
                                <tr key={tx.id}>
                                    <td className="px-3 py-1.5 font-mono text-xs text-[#64748B]">{tx.id || tx.tx_hash}</td>
                                    <td className="px-3 py-1.5 text-xs text-[#0F172A]">{tx.date || tx.timestamp || tx.created_at}</td>
                                    <td className="px-3 py-1.5">
                                        <div className="flex items-center gap-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${tx.type === "Incoming" || tx.direction === "Incoming" ? "text-[#0F1623]" : "text-[#64748B]"}`}>
                                                {tx.type || tx.direction || "Transfer"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-1.5 text-[#0F172A] font-mono text-xs">{tx.source || tx.source_wallet_id || "Unknown"}</td>
                                    <td className="px-3 py-1.5 text-[#0F172A] font-mono text-xs">{tx.destination || tx.destination_wallet_id || "Unknown"}</td>
                                    <td className="px-3 py-1.5 font-mono text-xs text-[#0F172A] text-right">{tx.amount} {tx.asset || 'BTC'}</td>
                                    <td className="px-3 py-1.5">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase ${tx.risk === 'Critical' || tx.risk_level === 'Critical' ? 'text-[#EF4444]' :
                                            tx.risk === 'High' || tx.risk_level === 'High' ? 'text-[#F59E0B]' :
                                                tx.risk === 'Medium' || tx.risk_level === 'Medium' ? 'text-[#F59E0B]' :
                                                    'text-[#0F1623] '
                                            }`}>
                                            {tx.risk || tx.risk_level || "Unknown"}
                                        </span>
                                    </td>
                                    <td className="px-3 py-1.5 text-xs">
                                        {(tx.caseId || tx.case_id) && (tx.caseId !== "-" && tx.case_id !== "-") ? (
                                            <span className="cursor-pointer text-[#0F1623] font-bold hover:underline">{tx.caseId || tx.case_id}</span>
                                        ) : (
                                            <span className="text-[#64748B]">-</span>
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
