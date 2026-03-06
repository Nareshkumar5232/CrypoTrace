import { useAppStore } from '../store/appStore';
import { toast } from 'sonner';
import { useState } from 'react';

export const useUsers = (_filters?: any) => {
    const users = useAppStore((s) => s.users);
    return { data: users, isLoading: false, isError: false };
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
