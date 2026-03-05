import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from 'sonner';

export const useCases = (filters: any) => {
    return useQuery({
        queryKey: ['cases', filters],
        queryFn: async () => {
            const { data } = await api.get('/cases', { params: filters });
            return data;
        },
    });
};

export const useUpdateCase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const { data } = await api.patch(`/cases/${id}`, updates);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cases'] });
            toast.success('Investigation record updated successfully.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update investigation record.');
        }
    });
};

export const useCreateCase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newCase: any) => {
            const { data } = await api.post('/cases', newCase);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cases'] });
            toast.success('Investigation record created successfully.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create investigation record.');
        }
    });
};
