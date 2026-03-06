import { useAppStore } from '../store/appStore';
import { toast } from 'sonner';
import { useState } from 'react';

export const useCases = (_filters?: any) => {
    const cases = useAppStore((s) => s.cases);
    return { data: cases, isLoading: false, isError: false };
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
