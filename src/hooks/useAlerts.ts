import { useAppStore } from '../store/appStore';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export const useAlerts = (_filters?: any) => {
    const fallbackAlerts = useAppStore((s) => s.alerts);
    const [data, setData] = useState<any[]>(fallbackAlerts);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await api.get('/alerts');
                const alerts = response.data?.alerts || [];
                const mapped = alerts.map((item: any) => ({
                    id: item.id,
                    severity: item.severity || 'Medium',
                    description: item.alert_type || item.description || 'Backend alert',
                    wallet_id: item.wallet_id || null,
                    case_id: item.case_id || null,
                    created_at: item.created_at,
                    status: item.status || 'Active',
                }));

                if (!cancelled) {
                    setData(mapped.length > 0 ? mapped : fallbackAlerts);
                    setIsError(false);
                }
            } catch {
                if (!cancelled) {
                    setData(fallbackAlerts);
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
    }, [fallbackAlerts]);

    return { data, isLoading, isError };
};

export const useResolveAlert = () => {
    const resolveAlert = useAppStore((s) => s.resolveAlert);
    const [isPending, setIsPending] = useState(false);
    return {
        mutate: async (id: string) => {
            setIsPending(true);
            try {
                await api.patch(`/alerts/${id}`, { status: 'RESOLVED' });
            } catch {
                resolveAlert(id);
            }
            toast.success(`Alert ${id} resolved.`);
            setIsPending(false);
        },
        isPending,
    };
};

export const useEscalateAlert = () => {
    const escalateAlert = useAppStore((s) => s.escalateAlert);
    const [isPending, setIsPending] = useState(false);
    return {
        mutate: async (id: string) => {
            setIsPending(true);
            try {
                await api.patch(`/alerts/${id}`, { status: 'CRITICAL' });
            } catch {
                escalateAlert(id);
            }
            toast.success(`Alert ${id} escalated to Critical.`);
            setIsPending(false);
        },
        isPending,
    };
};
