import { useAppStore } from '../store/appStore';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export const useRoles = () => {
    const fallbackRoles = useAppStore((s) => s.roles);
    const [data, setData] = useState<any[]>(fallbackRoles);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await api.get('/users/roles');
                const mapped = (response.data || []).map((role: any) => ({
                    id: role.id,
                    name: role.name,
                    description: role.description || 'Role access profile',
                    userCount: role.user_count ?? 0,
                }));
                if (!cancelled) {
                    setData(mapped.length > 0 ? mapped : fallbackRoles);
                }
            } catch {
                if (!cancelled) {
                    setData(fallbackRoles);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [fallbackRoles]);

    return { data, isLoading };
};
