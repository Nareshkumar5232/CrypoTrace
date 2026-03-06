import { useAppStore } from '../store/appStore';

export const useTransactions = (_filters?: any) => {
    const transactions = useAppStore((s) => s.transactions);
    return { data: transactions, isLoading: false, isError: false };
};
