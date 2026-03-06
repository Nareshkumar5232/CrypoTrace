import { useAppStore } from '../store/appStore';
import { toast } from 'sonner';
import { useState } from 'react';

export const useAlerts = (_filters?: any) => {
    const alerts = useAppStore((s) => s.alerts);
    return { data: alerts, isLoading: false, isError: false };
};

export const useResolveAlert = () => {
    const resolveAlert = useAppStore((s) => s.resolveAlert);
    const [isPending, setIsPending] = useState(false);
    return {
        mutate: (id: string) => {
            setIsPending(true);
            resolveAlert(id);
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
        mutate: (id: string) => {
            setIsPending(true);
            escalateAlert(id);
            toast.success(`Alert ${id} escalated to Critical.`);
            setIsPending(false);
        },
        isPending,
    };
};
