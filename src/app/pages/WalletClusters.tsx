import { useState } from"react";
import { Filter, Search, ChevronRight, Network, Wallet, Loader2 } from"lucide-react";
import { useClusters, useCluster, useUpdateCluster } from"../../hooks/useClusters";

// Mock data fallback for cluster wallets relationship that is usually complex to join
const mockClusterWallets = [
 { address:"bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", associatedDate:"2026-01-15", role:"Primary Hub" },
 { address:"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", associatedDate:"2026-02-01", role:"Receiver" },
 { address:"bc1q9v...", associatedDate:"2026-02-28", role:"Intermediary" },
];

export function WalletClusters() {
 const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
 const [searchTerm, setSearchTerm] = useState("");
 const { data: clusters, isLoading: isClustersLoading, isError: isClustersError } = useClusters({ search: searchTerm });
 const { data: clusterDetail, isLoading: isDetailLoading } = useCluster(selectedClusterId);
 const { mutate: updateCluster, isPending: isUpdating } = useUpdateCluster();

 const handleUpdateRisk = () => {
 if (!selectedClusterId) return;
 const newLevel = window.prompt("Enter new risk level (Low, Medium, High, Critical):");
 if (newLevel && ['Low', 'Medium', 'High', 'Critical'].includes(newLevel)) {
 updateCluster({ id: selectedClusterId, updates: { risk_level: newLevel } });
 }
 };

 const renderClusterList = () => (
 <div className="bg-white border border-[#E2E8F0]">
 <div className="flex flex-row items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
 <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Cluster Registry</h2>
 <div className="flex gap-2">
 <div className="relative">
 <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-[#64748B]" />
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="SEARCH CLUSTER ID..."
 className="h-7 w-64 rounded border border-[#E2E8F0] bg-white pl-8 pr-3 text-[10px] uppercase tracking-wider text-[#0F172A] placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9]"
 />
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
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Cluster ID</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Risk Level</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B] text-right">Total Volume</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B] text-right">Entity Count</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Last Active</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#E2E8F0] relative">
 {isClustersLoading && (
 <tr>
 <td colSpan={6} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">
 <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> SCANNING CLUSTERS...
 </td>
 </tr>
 )}
 {isClustersError && (
 <tr>
 <td colSpan={6} className="px-3 py-6 text-center text-xs text-[#EF4444] uppercase tracking-wider font-bold bg-[#FEF2F2]">
 FAILED TO LOAD CLUSTERS
 </td>
 </tr>
 )}
 {!isClustersLoading && (!clusters || clusters.length === 0) && (
 <tr>
 <td colSpan={6} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">
 NO REGISTRY CLUSTERS FOUND
 </td>
 </tr>
 )}
 {!isClustersLoading && (clusters || []).map((cluster: any) => (
 <tr key={cluster.id}>
 <td className="px-3 py-1.5 font-mono text-xs text-[#64748B]">{cluster.id || cluster.cluster_id}</td>
 <td className="px-3 py-1.5">
 <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase ${cluster.risk_level === 'Critical' || cluster.riskLevel === 'Critical' ? 'text-[#EF4444]' :
 cluster.risk_level === 'High' || cluster.riskLevel === 'High' ? 'text-[#F59E0B]' :
 cluster.risk_level === 'Medium' || cluster.riskLevel === 'Medium' ? 'text-[#F59E0B]' :
 'text-[#0F1623] '
 }`}>
 {cluster.risk_level || cluster.riskLevel}
 </span>
 </td>
 <td className="px-3 py-1.5 text-right font-mono text-xs text-[#0F172A]">{cluster.total_volume || cluster.totalVolume || '0.00'}</td>
 <td className="px-3 py-1.5 text-right font-mono text-xs text-[#0F172A]">{cluster.wallet_count || cluster.walletCount || 0}</td>
 <td className="px-3 py-1.5 text-xs text-[#0F172A]">{cluster.last_active || cluster.lastActive || cluster.updated_at}</td>
 <td className="px-3 py-1.5 text-right">
 <button
 onClick={() => setSelectedClusterId(cluster.id)}
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
 </div>
 );

 const renderClusterDetail = () => {
 if (isDetailLoading) {
 return (
 <div className="p-12 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold flex flex-col items-center gap-4">
 <Loader2 className="h-4 w-4 animate-spin text-[#0F1623]" /> LOADING CLUSTER METRICS...
 </div>
 );
 }

 const cluster = clusterDetail;
 if (!cluster) return null;

 return (
 <div className="space-y-6">
 <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <button
 onClick={() => setSelectedClusterId(null)}
 className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors"
 >
 Back to Registry
 </button>
 <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
 {cluster.id || cluster.cluster_id}
 </h2>
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

 <div className="grid gap-4 md:grid-cols-2">
 <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
 Total Volume
 </span>
 <span className="text-2xl font-bold text-[#0F172A]">
 {cluster.total_volume || cluster.totalVolume || '0.00'}
 </span>
 </div>
 <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
 Entity Count
 </span>
 <span className="text-2xl font-bold text-[#0F172A]">
 {cluster.wallet_count || cluster.walletCount || 0}
 </span>
 </div>
 </div>

 <div className="bg-white border border-[#E2E8F0]">
 <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
 <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
 Linked Entities
 </h2>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Identifier Address</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Cluster Role</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Associated Date</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#E2E8F0]">
 {mockClusterWallets.map((w, index) => (
 <tr key={index}>
 <td className="px-3 py-1.5 font-mono text-xs text-[#0F172A]">{w.address}</td>
 <td className="px-3 py-1.5 text-xs text-[#0F172A]">{w.role}</td>
 <td className="px-3 py-1.5 text-xs text-[#64748B]">{w.associatedDate}</td>
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
 {!selectedClusterId && (
 <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
 <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
 CLUSTER MANAGEMENT
 </h1>
 <p className="text-xs uppercase tracking-wider text-[#64748B]">
 Analysis of grouped entity behaviors and risk exposure
 </p>
 </div>
 )}

 {selectedClusterId ? renderClusterDetail() : renderClusterList()}
 </div>
 );
}
