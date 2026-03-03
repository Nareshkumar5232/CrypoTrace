import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from 'sonner';

export const useClusters = (filters: any) => {
    return useQuery({
        queryKey: ['clusters', filters],
        queryFn: async () => {
            const { data } = await api.get('/clusters', { params: filters });
            return data;
        },
    });
};

export const useUpdateCluster = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const { data } = await api.patch(`/clusters/${id}`, updates);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clusters'] });
            toast.success('Cluster record updated successfully.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update cluster record.');
        }
    });
};

export const useCluster = (id: string | null) => {
    return useQuery({
        queryKey: ['cluster', id],
        queryFn: async () => {
            if (!id) return null;
            const { data } = await api.get(`/clusters/${id}`);
            return data;
        },
        enabled: !!id,
    });
};
