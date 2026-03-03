import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from 'sonner';

export const useAlerts = (filters: any) => {
    return useQuery({
        queryKey: ['alerts', filters],
        queryFn: async () => {
            const { data } = await api.get('/alerts', { params: filters });
            return data;
        },
    });
};

export const useUpdateAlert = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const { data } = await api.patch(`/alerts/${id}`, updates);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
            toast.success('Intelligence Notification status updated successfully.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update intelligence notification.');
        }
    });
};
