import { useAppStore } from '../store/appStore';

export const useAuditLogs = (_filters?: any) => {
    const auditLogs = useAppStore((s) => s.auditLogs);
    return { data: auditLogs, isLoading: false, isError: false };
};
