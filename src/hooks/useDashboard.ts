import { useAppStore } from '../store/appStore';

export const useDashboardMetrics = () => {
    const dashboard = useAppStore((s) => s.dashboard);
    return { data: dashboard, isLoading: false, isError: false, error: null, refetch: () => {} };
};
