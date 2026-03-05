import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from 'sonner';

export const useUsers = (filters: any) => {
    return useQuery({
        queryKey: ['users', filters],
        queryFn: async () => {
            const { data } = await api.get('/users', { params: filters });
            return data;
        },
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newUser: any) => {
            const { data } = await api.post('/users', newUser);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Personnel record created successfully.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create personnel record.');
        }
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const { data } = await api.patch(`/users/${id}`, updates);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Personnel record updated successfully.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update personnel record.');
        }
    });
};
