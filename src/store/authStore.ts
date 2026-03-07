import { create } from 'zustand';

interface User {
    id: string;
    employeeId: string;
    name: string;
    role: 'Administrator' | 'Lead Analyst' | 'Investigator' | 'Read-Only';
}

interface AuthState {
    token: string | null;
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    token: localStorage.getItem('jwt_token'),
    user: JSON.parse(localStorage.getItem('user_data') || 'null'),

    login: (token, user) => {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        localStorage.setItem('authUser', 'true');
        set({ token, user });
    },

    logout: () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('authUser');
        set({ token: null, user: null });
    },

    isAuthenticated: () => !!get().token
}));
