import { useAppStore } from '../store/appStore';
import { toast } from 'sonner';
import { useState } from 'react';

export const useWallets = (_filters?: any) => {
    const wallets = useAppStore((s) => s.wallets);
    return { data: wallets, isLoading: false, isError: false };
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
