import { useAppStore } from '../store/appStore';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const mapRole = (role?: string) => {
    const normalized = (role || '').toUpperCase();
    if (normalized.includes('ADMIN')) return 'Administrator';
    if (normalized.includes('ANALYST')) return 'Senior Analyst';
    if (normalized.includes('INVESTIGATOR')) return 'Analyst';
    return 'Read-Only';
};

export const useUsers = (_filters?: any) => {
    const fallbackUsers = useAppStore((s) => s.users);
    const [data, setData] = useState<any[]>(fallbackUsers);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await api.get('/users');
                const mapped = (response.data || []).map((item: any, index: number) => ({
                    id: item.id,
                    employee_id: item.email || `EMP-${String(index + 1).padStart(3, '0')}`,
                    name: item.name,
                    department: item.department || 'Investigations',
                    role: mapRole(item.role),
                    status: item.status || 'Active',
                }));

                if (!cancelled) {
                    setData(mapped.length > 0 ? mapped : fallbackUsers);
                    setIsError(false);
                }
            } catch {
                if (!cancelled) {
                    setData(fallbackUsers);
                    setIsError(false);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [fallbackUsers]);

    return { data, isLoading, isError };
};

export const useCreateUser = () => {
    const addUser = useAppStore((s) => s.addUser);
    const [isPending, setIsPending] = useState(false);
    return {
        mutate: (newUser: any) => {
            setIsPending(true);
            const id = addUser(newUser);
            toast.success(`Personnel ${id} created successfully.`);
            setIsPending(false);
            return id;
        },
        isPending,
    };
};

export const useToggleUserStatus = () => {
    const toggleUserStatus = useAppStore((s) => s.toggleUserStatus);
    const [isPending, setIsPending] = useState(false);
    return {
        mutate: (id: string) => {
            setIsPending(true);
            toggleUserStatus(id);
            toast.success('Personnel status updated.');
            setIsPending(false);
        },
        isPending,
    };
};
