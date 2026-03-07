import { useState } from "react";
import { Filter, ChevronRight, Network, Wallet, Loader2 } from "lucide-react";
import { TnLoader } from "../components/TnLoader";
import { useClusters, useCluster, useUpdateCluster } from "../../hooks/useClusters";
import { useWallets } from "../../hooks/useWallets";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

export function WalletClusters() {
    const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { data: clusters, isLoading: isClustersLoading, isError: isClustersError } = useClusters({ search: searchTerm });
    const { data: clusterDetail, isLoading: isDetailLoading } = useCluster(selectedClusterId);
    const { mutate: updateCluster, isPending: isUpdating } = useUpdateCluster();
    const { data: allWallets } = useWallets({});
    const [showRiskModal, setShowRiskModal] = useState(false);
    const [riskChoice, setRiskChoice] = useState('');
    const [showCriticalOnly, setShowCriticalOnly] = useState(false);

    // Wallets belonging to the selected cluster
    const clusterWallets = selectedClusterId
        ? (allWallets || []).filter((w: any) => w.cluster_id === selectedClusterId || w.clusterId === selectedClusterId)
        : [];

    const filteredClusters = (clusters || []).filter((c: any) => {
        if (showCriticalOnly) return (c.risk_level === 'Critical' || c.riskLevel === 'Critical');
        return true;
    });

    const handleUpdateRisk = () => {
        if (!selectedClusterId || !riskChoice) return;
        updateCluster({ id: selectedClusterId, updates: { risk_level: riskChoice } });
        setShowRiskModal(false);
        setRiskChoice('');
    };

    const renderClusterList = () => (
        <div className="dash-card !p-0 overflow-hidden transition-smooth">
            <div className="flex flex-row flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-muted/30 px-6 py-4">
                <h2 className="section-heading">Cluster Registry</h2>
                <div className="flex gap-2">
                    <div className="w-64">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="SEARCH CLUSTER ID..."
                            className="h-7 w-full rounded border border-[#E2E8F0] bg-white px-3 text-[10px] uppercase tracking-wider text-[#0F172A] placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9] transition-smooth input-glow"
                        />
                    </div>
                    <button
                        onClick={() => setShowCriticalOnly(!showCriticalOnly)}
                        className={`inline-flex items-center justify-center rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${showCriticalOnly
                            ? 'bg-[#0F1623] text-white border-[#0F1623]'
                            : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white'
                            }`}>
                        <Filter className="mr-1.5 h-3 w-3" />
                        {showCriticalOnly ? 'Critical Only' : 'Filter'}
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm table-rows-animate data-table">
                    <thead>
                        <tr>
                            <th className="text-left">Cluster ID</th>
                            <th className="text-left">Risk Level</th>
                            <th className="text-right">Total Volume</th>
                            <th className="text-right">Entity Count</th>
                            <th className="text-left">Last Active</th>
                            <th className="text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] relative">
                        {isClustersLoading && (
                            <tr>
                                <td colSpan={6} className="p-0">
                                    <TnLoader text="SCANNING CLUSTERS..." />
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
                        {!isClustersLoading && filteredClusters.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">
                                    NO REGISTRY CLUSTERS FOUND
                                </td>
                            </tr>
                        )}
                        {!isClustersLoading && filteredClusters.map((cluster: any) => (
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
                <div className="p-0">
                    <TnLoader text="LOADING CLUSTER METRICS..." />
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
                                onClick={() => { setRiskChoice(cluster.risk_level || cluster.riskLevel || 'Low'); setShowRiskModal(true); }}
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
                    <div className="section-box p-4 flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                            Total Volume
                        </span>
                        <span className="text-2xl font-bold text-[#0F172A]">
                            {cluster.total_volume || cluster.totalVolume || '0.00'}
                        </span>
                    </div>
                    <div className="section-box p-4 flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                            Entity Count
                        </span>
                        <span className="text-2xl font-bold text-[#0F172A]">
                            {cluster.wallet_count || cluster.walletCount || 0}
                        </span>
                    </div>
                </div>

                <div className="dash-card !p-0 overflow-hidden">
                    <div className="border-b-2 border-border bg-muted/30 px-6 py-4">
                        <h2 className="section-heading">Linked Entities</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm data-table">
                            <thead>
                                <tr>
                                    <th className="text-left">Identifier Address</th>
                                    <th className="text-left">Cluster Role</th>
                                    <th className="text-left">Associated Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0]">
                                {clusterWallets.length === 0 && (
                                    <tr><td colSpan={3} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">No linked entities found</td></tr>
                                )}
                                {clusterWallets.map((w: any, index: number) => (
                                    <tr key={w.id || index}>
                                        <td className="px-3 py-1.5 font-mono text-xs text-[#0F172A]">{w.address || w.id}</td>
                                        <td className="px-3 py-1.5 text-xs text-[#0F172A]">{w.role || w.label || 'Entity'}</td>
                                        <td className="px-3 py-1.5 text-xs text-[#64748B]">{w.first_seen || w.created_at || '-'}</td>
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
            {!selectedClusterId && (
                <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
                    <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-foreground">
                        CLUSTER MANAGEMENT
                    </h1>
                    <p className="text-xs uppercase tracking-wider text-[#64748B]">
                        Analysis of grouped entity behaviors and risk exposure
                    </p>
                </div>
            )}

            {selectedClusterId ? renderClusterDetail() : renderClusterList()}

            {/* Risk Level Update Dialog */}
            <Dialog open={showRiskModal} onOpenChange={setShowRiskModal}>
                <DialogContent className="sm:max-w-[400px] section-box dialog-content-animate">
                    <DialogHeader>
                        <DialogTitle className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Update Cluster Risk Level</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <select
                            value={riskChoice}
                            onChange={(e) => setRiskChoice(e.target.value)}
                            className="w-full rounded border border-[#E2E8F0] px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#0F1623] transition-smooth input-glow"
                            aria-label="Risk level"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
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
