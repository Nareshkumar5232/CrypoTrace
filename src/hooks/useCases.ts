import { useAppStore } from '../store/appStore';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const mapPriorityToRisk = (priority?: string) => {
    const p = (priority || '').toUpperCase();
    if (p === 'HIGH') return 'High';
    if (p === 'LOW') return 'Low';
    return 'Medium';
};

const mapStatus = (status?: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'OPEN') return 'Open';
    if (s === 'UNDER_INVESTIGATION') return 'In Progress';
    if (s === 'CLOSED') return 'Closed';
    return status || 'Open';
};

export const useCases = (_filters?: any) => {
    const fallbackCases = useAppStore((s) => s.cases);
    const [data, setData] = useState<any[]>(fallbackCases);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await api.get('/cases');
                const mapped = (response.data || []).map((item: any) => ({
                    id: item.case_number || item.id,
                    title: item.title,
                    status: mapStatus(item.status),
                    riskLevel: mapPriorityToRisk(item.priority),
                    risk_level: mapPriorityToRisk(item.priority),
                    officer: item.officer_name || item.assigned_officer || 'Unassigned',
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                    wallets: [],
                    alerts: [],
                    notes: [],
                }));

                if (!cancelled) {
                    setData(mapped.length > 0 ? mapped : fallbackCases);
                    setIsError(false);
                }
            } catch {
                if (!cancelled) {
                    setData(fallbackCases);
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
    }, [fallbackCases]);

    return { data, isLoading, isError };
};

export const useUpdateCase = () => {
    const updateCase = useAppStore((s) => s.updateCase);
    const [isPending, setIsPending] = useState(false);
    return {
        mutate: ({ id, updates }: { id: string; updates: any }) => {
            setIsPending(true);
            updateCase(id, updates);
            toast.success('Investigation record updated successfully.');
            setIsPending(false);
        },
        isPending,
    };
};

export const useCreateCase = () => {
    const addCase = useAppStore((s) => s.addCase);
    const [isPending, setIsPending] = useState(false);
    return {
        mutate: (newCase: any) => {
            setIsPending(true);
            const id = addCase(newCase);
            toast.success(`Investigation ${id} created successfully.`);
            setIsPending(false);
            return id;
        },
        isPending,
    };
};

export const useDeleteCase = () => {
    const deleteCase = useAppStore((s) => s.deleteCase);
    const [isPending, setIsPending] = useState(false);
    return {
        mutate: (id: string) => {
            setIsPending(true);
            deleteCase(id);
            toast.success(`Investigation ${id} deleted.`);
            setIsPending(false);
        },
        isPending,
    };
};
