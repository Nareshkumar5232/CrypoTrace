import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useState } from 'react';

export const useLogin = () => {
    const loginAction = useAuthStore((state) => state.login);
    const navigate = useNavigate();
    const [isPending, setIsPending] = useState(false);

    const mutate = async (credentials: { employeeId: string; password: string }) => {
        setIsPending(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (credentials.employeeId !== 'ID-0001' || credentials.password !== '1234') {
            toast.error('Authentication failed. Invalid credentials.');
            setIsPending(false);
            return;
        }

        const mockUser = {
            id: '1',
            employeeId: credentials.employeeId,
            name: 'J. Smith',
            role: 'Administrator' as const
        };

        loginAction('mock-jwt-token', mockUser);
        toast.success('Authentication successful.');
        navigate('/');
        setIsPending(false);
    };

    return { mutate, isPending };
};
