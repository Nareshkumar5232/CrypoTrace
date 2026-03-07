import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { api } from '../lib/api';

const mapRole = (role?: string): 'Administrator' | 'Lead Analyst' | 'Investigator' | 'Read-Only' => {
    const normalized = (role || '').toUpperCase();
    if (normalized.includes('ADMIN')) return 'Administrator';
    if (normalized.includes('ANALYST')) return 'Lead Analyst';
    if (normalized.includes('INVESTIGATOR')) return 'Investigator';
    return 'Read-Only';
};

export const useLogin = () => {
    const loginAction = useAuthStore((state) => state.login);
    const navigate = useNavigate();
    const [isPending, setIsPending] = useState(false);

    type LoginOptions = {
        onSuccess?: () => void;
        onError?: () => void;
        navigateTo?: string | false;
    };

    const mutate = async (
        credentials: { employeeId: string; password: string },
        options?: LoginOptions
    ) => {
        setIsPending(true);

        // Prefer backend authentication; fallback to local mock credentials.
        try {
            const response = await api.post('/auth/login', {
                email: credentials.employeeId,
                password: credentials.password,
            });

            const backendUser = response.data?.user || {};
            const token = response.data?.token;

            if (token) {
                loginAction(token, {
                    id: String(backendUser.id || credentials.employeeId),
                    employeeId: backendUser.email || credentials.employeeId,
                    name: backendUser.name || credentials.employeeId,
                    role: mapRole(backendUser.role),
                });

                toast.success('Authentication successful.');
                options?.onSuccess?.();

                if (options?.navigateTo !== false) {
                    navigate(options?.navigateTo ?? '/');
                }

                setIsPending(false);
                return;
            }
        } catch {
            // Ignore backend auth errors here and allow the local fallback path.
        }

        if (credentials.employeeId !== 'ID-0001' || credentials.password !== '1234') {
            toast.error('Authentication failed. Invalid credentials.');
            options?.onError?.();
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

        options?.onSuccess?.();

        if (options?.navigateTo !== false) {
            navigate(options?.navigateTo ?? '/');
        }

        setIsPending(false);
    };

    return { mutate, isPending };
};
