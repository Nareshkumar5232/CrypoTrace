import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useRoles = () => {
    return useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const { data } = await api.get('/roles');
            return data;
        },
    });
};
