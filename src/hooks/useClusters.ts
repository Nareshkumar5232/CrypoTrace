import { useAppStore } from '../store/appStore';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export const useClusters = (_filters?: any) => {
    const fallbackClusters = useAppStore((s) => s.clusters);
    const [data, setData] = useState<any[]>(fallbackClusters);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await api.get('/clusters');
                const clusters = response.data?.clusters || [];
                const mapped = clusters.map((item: any) => ({
                    id: item.id,
                    risk_level: item.risk_level || 'Medium',
                    total_volume: item.total_volume || '0.00',
                    wallet_count: item.wallet_count || 0,
                    last_active: item.updated_at || item.created_at || new Date().toISOString(),
                }));

                if (!cancelled) {
                    setData(mapped.length > 0 ? mapped : fallbackClusters);
                    setIsError(false);
                }
            } catch {
                if (!cancelled) {
                    setData(fallbackClusters);
                    setIsError(false);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [fallbackClusters]);

    return { data, isLoading, isError };
};

export const useUpdateCluster = () => {
    const updateCluster = useAppStore((s) => s.updateCluster);
    const [isPending, setIsPending] = useState(false);
    return {
        mutate: ({ id, updates }: { id: string; updates: any }) => {
            setIsPending(true);
            updateCluster(id, updates);
            toast.success('Cluster record updated successfully.');
            setIsPending(false);
        },
        isPending,
    };
};

export const useCluster = (id: string | null) => {
    const clusters = useAppStore((s) => s.clusters);
    const cluster = id ? clusters.find((c) => c.id === id) || null : null;
    return { data: cluster, isLoading: false };
};
