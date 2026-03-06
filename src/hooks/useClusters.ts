import { useAppStore } from '../store/appStore';
import { toast } from 'sonner';
import { useState } from 'react';

export const useClusters = (_filters?: any) => {
    const clusters = useAppStore((s) => s.clusters);
    return { data: clusters, isLoading: false, isError: false };
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
