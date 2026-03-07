import { useAppStore } from '../store/appStore';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export const useWallets = (_filters?: any) => {
    const fallbackWallets = useAppStore((s) => s.wallets);
    const [data, setData] = useState<any[]>(fallbackWallets);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await api.get('/wallets');
                const mapped = (response.data || []).map((item: any) => ({
                    id: item.id,
                    address: item.address,
                    entity_type: item.blockchain_type || 'Wallet',
                    risk_score: item.risk_score ?? 0,
                    risk_level: item.risk_level || 'Medium',
                    balance_usd: item.balance_usd || '0.00',
                    created_at: item.created_at,
                }));

                if (!cancelled) {
                    setData(mapped.length > 0 ? mapped : fallbackWallets);
                    setIsError(false);
                }
            } catch {
                if (!cancelled) {
                    setData(fallbackWallets);
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
    }, [fallbackWallets]);

    return { data, isLoading, isError };
};

export const useWallet = (id: string | null) => {
    const wallets = useAppStore((s) => s.wallets);
    const wallet = id ? wallets.find((w) => w.id === id) || null : null;
    return { data: wallet, isLoading: false };
};

export const useUpdateWallet = () => {
    const updateWallet = useAppStore((s) => s.updateWallet);
    const [isPending, setIsPending] = useState(false);
    return {
        mutate: ({ id, updates }: { id: string; updates: any }) => {
            setIsPending(true);
            updateWallet(id, updates);
            toast.success('Entity record updated successfully.');
            setIsPending(false);
        },
        isPending,
    };
};
