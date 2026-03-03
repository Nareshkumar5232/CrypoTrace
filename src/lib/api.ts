import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Assuming vite provides the env variable, or default to standard /api/v1
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor: Attach JWT token if available
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: Global error handling (401, 403)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized access detected. Logging out.');
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);
