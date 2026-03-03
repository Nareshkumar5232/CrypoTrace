import { useState } from"react";
import { Filter, Search, ArrowDownRight, ArrowUpRight, ShieldAlert, Briefcase, ActivitySquare, Network, Loader2 } from"lucide-react";
import { useWallets, useWallet, useUpdateWallet } from"../../hooks/useWallets";

// We keep a mock structure fallback if the backend transaction format doesn't match yet
const mockTransactions = [
 { id:"TX-9921", date:"2026-03-02 14:22:01", type:"Incoming", amount:"5.0 BTC", source:"W-7C44D...", destination:"W-9A21E...", risk:"High" },
 { id:"TX-9920", date:"2026-03-02 12:15:44", type:"Outgoing", amount:"1.2 BTC", source:"W-9A21E...", destination:"W-8B39F...", risk:"Low" },
 { id:"TX-9919", date:"2026-03-01 09:10:12", type:"Incoming", amount:"10.0 BTC", source:"Unknown", destination:"W-9A21E...", risk:"Medium" },
];

export function WalletIntelligence() {
 const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
 const [searchTerm, setSearchTerm] = useState("");
 const { data: wallets, isLoading: listsLoading, isError: listsError } = useWallets({ search: searchTerm });
 const { data: selectedWallet, isLoading: detailLoading } = useWallet(selectedWalletId);
 const { mutate: updateWallet, isPending: isUpdating } = useUpdateWallet();

 // Pagination and Filter state
 const [page, setPage] = useState(1);
 const [showCriticalOnly, setShowCriticalOnly] = useState(false);

 const itemsPerPage = 10;
 const filteredWallets = (wallets || []).filter((w: any) => {
 if (showCriticalOnly) {
 return w.risk_level === 'Critical' || w.riskLevel === 'Critical';
 }
 return true;
 });
 const totalPages = Math.max(1, Math.ceil(filteredWallets.length / itemsPerPage));
 const paginatedWallets = filteredWallets.slice((page - 1) * itemsPerPage, page * itemsPerPage);

 const handleUpdateRisk = () => {
 if (!selectedWalletId) return;
 const newScore = window.prompt("Enter new risk score (0-100):");
 if (newScore && !isNaN(Number(newScore))) {
 const numScore = Number(newScore);
 let riskLevel ="Low";
 if (numScore >= 75) riskLevel ="Critical";
 else if (numScore >= 50) riskLevel ="High";
 else if (numScore >= 25) riskLevel ="Medium";
 updateWallet({ id: selectedWalletId, updates: { risk_score: numScore, risk_level: riskLevel } });
 }
 };

 const renderWalletList = () => (
 <div className="bg-white border border-[#E2E8F0]">
 <div className="flex flex-row items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
 <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Entity Intelligence Database</h2>
 <div className="flex gap-2">
 <div className="relative">
 <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-[#64748B]" />
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="SEARCH IDENTIFIER..."
 className="h-7 w-64 rounded border border-[#E2E8F0] bg-white pl-8 pr-3 text-[10px] uppercase tracking-wider text-[#0F172A] placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9]"
 />
 </div>
 <button
 onClick={() => {
 setShowCriticalOnly(!showCriticalOnly);
 setPage(1); // reset pagination on filter change
 }}
 className={`inline-flex items-center justify-center rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${showCriticalOnly
 ? 'bg-[#0F1623] text-white hover:bg-[#1E293B] dark:hover:bg-[#00d2a0] dark:hover:text-[#0F1623] border-[#0F1623] '
 : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white'
 }`}>
 <Filter className="mr-1.5 h-3 w-3" />
 {showCriticalOnly ? 'Show All' : 'Critical Only'}
 </button>
 </div>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Entity ID</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Address</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Entity Type</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Risk Score</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Risk Level</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B] text-right">Balance</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#E2E8F0] relative">
 {listsLoading && (
 <tr>
 <td colSpan={7} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">
 <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> SCANNING ENTITY DATABASE...
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
 <tr key={w.id}>
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
 return <div className="p-12 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold flex flex-col items-center gap-4">
 <Loader2 className="h-4 w-4 animate-spin text-[#0F1623]" /> LOADING ENTITY PROFILE...
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
 onClick={handleUpdateRisk}
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
 <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
 Risk Score
 </span>
 <div className="text-2xl font-bold text-[#0F172A] flex items-baseline gap-1">
 {wallet.risk_score || wallet.riskScore || 0} <span className="text-[10px] font-mono font-normal text-[#64748B]">/ 100</span>
 </div>
 </div>
 <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
 Current Balance
 </span>
 <span className="text-2xl font-bold text-[#0F172A]">
 {wallet.balance_usd ? `$${wallet.balance_usd}` : wallet.balance || '0.00'}
 </span>
 </div>
 <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
 Linked Cases
 </span>
 <span className="text-2xl font-bold text-[#0F172A]">
 {wallet.cases || 0}
 </span>
 </div>
 <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
 Related Clusters
 </span>
 <span className="text-2xl font-bold text-[#0F172A]">
 {wallet.clusters || 0}
 </span>
 </div>
 </div>

 <div className="bg-white border border-[#E2E8F0]">
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
 {mockTransactions.map((tx) => (
 <tr key={tx.id}>
 <td className="px-3 py-1.5 font-mono text-xs text-[#64748B]">{tx.id}</td>
 <td className="px-3 py-1.5 text-xs text-[#0F172A]">{tx.date}</td>
 <td className="px-3 py-1.5">
 <div className="flex items-center gap-1">
 <span className={`text-[10px] font-bold uppercase tracking-wider ${tx.type ==="Incoming" ?"text-[#0F1623]" :"text-[#64748B]"}`}>
 {tx.type}
 </span>
 </div>
 </td>
 <td className="px-3 py-1.5 text-[#0F172A] font-mono text-xs">
 {tx.type ==="Incoming" ? tx.source : tx.destination}
 </td>
 <td className="px-3 py-1.5 font-mono text-xs text-[#0F172A]">{tx.amount}</td>
 <td className="px-3 py-1.5">
 <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase ${tx.risk === 'High' ? 'text-[#EF4444]' :
 tx.risk === 'Medium' ? 'text-[#F59E0B]' :
 'text-[#64748B] '
 }`}>
 {tx.risk}
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
 <div className="space-y-6">
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
 </div>
 );
}
