import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useAuditLogs = (filters: any) => {
    return useQuery({
        queryKey: ['audit-logs', filters],
        queryFn: async () => {
            const { data } = await api.get('/audit-logs', { params: filters });
            return data;
        },
    });
};
