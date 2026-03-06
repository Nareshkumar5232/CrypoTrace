import { useAppStore } from '../store/appStore';

export const useRoles = () => {
    const roles = useAppStore((s) => s.roles);
    return { data: roles, isLoading: false };
};
