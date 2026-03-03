import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from 'sonner';

export const useWallets = (filters: any) => {
    return useQuery({
        queryKey: ['wallets', filters],
        queryFn: async () => {
            const { data } = await api.get('/wallets', { params: filters });
            return data;
        },
    });
};

export const useWallet = (id: string | null) => {
    return useQuery({
        queryKey: ['wallet', id],
        queryFn: async () => {
            if (!id) return null;
            const { data } = await api.get(`/wallets/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useUpdateWallet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const { data } = await api.patch(`/wallets/${id}`, updates);
            return data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', id] });
            toast.success('Entity record updated successfully.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update entity record.');
        }
    });
};
