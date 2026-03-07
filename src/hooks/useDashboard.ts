import { useAppStore } from '../store/appStore';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export const useDashboardMetrics = () => {
    const fallbackDashboard = useAppStore((s) => s.dashboard);
    const [data, setData] = useState(fallbackDashboard);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [casesRes, walletsRes, alertsRes] = await Promise.all([
                    api.get('/cases'),
                    api.get('/wallets'),
                    api.get('/alerts'),
                ]);

                const cases = casesRes.data || [];
                const wallets = walletsRes.data || [];
                const alerts = alertsRes.data?.alerts || [];

                const highRiskWallets = wallets.filter((w: any) => {
                    const score = Number(w.risk_score || 0);
                    const level = String(w.risk_level || '').toUpperCase();
                    return score >= 70 || level === 'HIGH' || level === 'CRITICAL';
                }).length;

                const openAlerts = alerts.filter((a: any) => String(a.status || '').toUpperCase() !== 'RESOLVED').length;

                if (!cancelled) {
                    setData({
                        ...fallbackDashboard,
                        activeCases: cases.length || fallbackDashboard.activeCases,
                        highRiskWallets: highRiskWallets || fallbackDashboard.highRiskWallets,
                        openAlerts: openAlerts || fallbackDashboard.openAlerts,
                    });
                    setIsError(false);
                }
            } catch {
                if (!cancelled) {
                    setData(fallbackDashboard);
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
    }, [fallbackDashboard]);

    return { data, isLoading, isError, error: null, refetch: () => {} };
};
