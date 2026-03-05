import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useDashboardMetrics = () => {
    return useQuery({
        queryKey: ['dashboard', 'metrics'],
        queryFn: async () => {
            const { data } = await api.get('/metrics/dashboard');
            return data;
        },
    });
};
