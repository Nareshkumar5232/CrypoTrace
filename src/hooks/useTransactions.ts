import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useTransactions = (filters: any) => {
    return useQuery({
        queryKey: ['transactions', filters],
        queryFn: async () => {
            const { data } = await api.get('/transactions', { params: filters });
            return data;
        },
    });
};
