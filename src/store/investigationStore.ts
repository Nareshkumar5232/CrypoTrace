import { create } from 'zustand';
import { runInvestigation, type InvestigationResult } from '../lib/mockInvestigationData';

interface InvestigationState {
  walletAddress: string;
  isTracing: boolean;
  error: string | null;
  result: InvestigationResult | null;
  flaggedWallets: Set<string>;
  setWalletAddress: (addr: string) => void;
  startInvestigation: (addr: string) => Promise<void>;
  flagWallet: (addr: string) => void;
  unflagWallet: (addr: string) => void;
  updateWorkflowStep: (step: number, status: "Completed" | "In Progress" | "Pending") => void;
  reset: () => void;
}

export const useInvestigationStore = create<InvestigationState>((set, get) => ({
  walletAddress: '',
  isTracing: false,
  error: null,
  result: null,
  flaggedWallets: new Set<string>(),

  setWalletAddress: (addr) => set({ walletAddress: addr }),

  startInvestigation: async (addr) => {
    set({ isTracing: true, error: null, result: null, walletAddress: addr });
    try {
      const result = await runInvestigation(addr);
      set({ result, isTracing: false });
    } catch {
      set({ error: 'Unable to retrieve transaction data. Please retry investigation.', isTracing: false });
    }
  },

  flagWallet: (addr) => {
    const flagged = new Set(get().flaggedWallets);
    flagged.add(addr);
    set({ flaggedWallets: flagged });
  },

  unflagWallet: (addr) => {
    const flagged = new Set(get().flaggedWallets);
    flagged.delete(addr);
    set({ flaggedWallets: flagged });
  },

  updateWorkflowStep: (stepNum, status) => {
    const result = get().result;
    if (!result) return;
    const workflow = result.workflow.map((s) =>
      s.step === stepNum ? { ...s, status, timestamp: status !== 'Pending' ? new Date().toISOString() : undefined } : s
    );
    set({ result: { ...result, workflow } });
  },

  reset: () => set({ walletAddress: '', isTracing: false, error: null, result: null }),
}));
