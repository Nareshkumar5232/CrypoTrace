import { create } from 'zustand';
import {
  demoCases,
  demoWallets,
  demoTransactions,
  demoClusters,
  demoAlerts,
  demoAuditLogs,
  demoUsers,
  demoRoles,
  demoDashboard,
} from '../data/demoData';

interface AppState {
  // ─── Collections ──────────────────────────────────────────────────────────
  cases: typeof demoCases;
  wallets: typeof demoWallets;
  transactions: typeof demoTransactions;
  clusters: typeof demoClusters;
  alerts: typeof demoAlerts;
  auditLogs: typeof demoAuditLogs;
  users: typeof demoUsers;
  roles: typeof demoRoles;
  dashboard: typeof demoDashboard;

  // ─── Case Actions ─────────────────────────────────────────────────────────
  addCase: (c: any) => string;
  updateCase: (id: string, updates: any) => void;
  deleteCase: (id: string) => void;

  // ─── Alert Actions ────────────────────────────────────────────────────────
  resolveAlert: (id: string) => void;
  escalateAlert: (id: string) => void;

  // ─── Wallet Actions ───────────────────────────────────────────────────────
  updateWallet: (id: string, updates: any) => void;

  // ─── Cluster Actions ──────────────────────────────────────────────────────
  updateCluster: (id: string, updates: any) => void;

  // ─── User Actions ─────────────────────────────────────────────────────────
  addUser: (u: any) => string;
  updateUser: (id: string, updates: any) => void;
  toggleUserStatus: (id: string) => void;

  // ─── Audit Log ────────────────────────────────────────────────────────────
  addAuditLog: (action: string, entityType: string, entityId: string) => void;
}

let caseSeq = demoCases.length + 1;
let logSeq = demoAuditLogs.length + 1;
let userSeq = demoUsers.length + 1;

export const useAppStore = create<AppState>((set, get) => ({
  cases: [...demoCases],
  wallets: [...demoWallets],
  transactions: [...demoTransactions],
  clusters: [...demoClusters],
  alerts: [...demoAlerts],
  auditLogs: [...demoAuditLogs],
  users: [...demoUsers],
  roles: [...demoRoles],
  dashboard: { ...demoDashboard },

  // ── Case ──────────────────────────────────────────────────────────────────
  addCase: (c) => {
    const id = `CASE-2026-${String(caseSeq++).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const newCase = {
      id,
      title: c.title,
      status: 'Open',
      riskLevel: c.riskLevel || 'Medium',
      risk_level: c.riskLevel || 'Medium',
      officer: c.officer || 'Unassigned',
      created_at: now,
      updated_at: now,
      wallets: c.wallets ? [c.wallets] : [],
      alerts: [] as string[],
      notes: c.description
        ? [{ content: c.description, created_at: now }]
        : [],
    };
    set((s) => ({
      cases: [newCase, ...s.cases],
      dashboard: { ...s.dashboard, activeCases: s.dashboard.activeCases + 1 },
    }));
    get().addAuditLog(`Created investigation ${id}`, 'Case', id);
    return id;
  },

  updateCase: (id, updates) => {
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id
          ? { ...c, ...updates, updated_at: new Date().toISOString() }
          : c
      ),
    }));
    const desc = updates.status
      ? `Changed status to "${updates.status}"`
      : updates.officer
        ? `Assigned officer "${updates.officer}"`
        : 'Updated case';
    get().addAuditLog(`${desc} for ${id}`, 'Case', id);
  },

  deleteCase: (id) => {
    set((s) => ({
      cases: s.cases.filter((c) => c.id !== id),
      dashboard: {
        ...s.dashboard,
        activeCases: Math.max(0, s.dashboard.activeCases - 1),
      },
    }));
    get().addAuditLog(`Deleted investigation ${id}`, 'Case', id);
  },

  // ── Alerts ────────────────────────────────────────────────────────────────
  resolveAlert: (id) => {
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id
          ? { ...a, status: 'Resolved', resolved_at: new Date().toISOString() }
          : a
      ),
      dashboard: {
        ...s.dashboard,
        openAlerts: Math.max(0, s.dashboard.openAlerts - 1),
      },
    }));
    get().addAuditLog(`Resolved alert ${id}`, 'Alert', id);
  },

  escalateAlert: (id) => {
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id ? { ...a, status: 'Escalated', severity: 'Critical' } : a
      ),
    }));
    get().addAuditLog(`Escalated alert ${id} to Critical`, 'Alert', id);
  },

  // ── Wallet ────────────────────────────────────────────────────────────────
  updateWallet: (id, updates) => {
    set((s) => ({
      wallets: s.wallets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));
    get().addAuditLog(
      `Updated wallet ${id} — ${JSON.stringify(updates)}`,
      'Wallet',
      id
    );
  },

  // ── Cluster ───────────────────────────────────────────────────────────────
  updateCluster: (id, updates) => {
    set((s) => ({
      clusters: s.clusters.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
    get().addAuditLog(
      `Updated cluster ${id} risk level to ${updates.risk_level}`,
      'Cluster',
      id
    );
  },

  // ── User ──────────────────────────────────────────────────────────────────
  addUser: (u) => {
    const id = `EMP-${String(userSeq++).padStart(3, '0')}`;
    const newUser = {
      id,
      employee_id: id,
      name: u.name,
      department: u.department,
      role: u.role || 'Analyst',
      status: 'Active' as const,
    };
    set((s) => ({ users: [...s.users, newUser] }));
    get().addAuditLog(`Created personnel record ${id}`, 'User', id);
    return id;
  },

  updateUser: (id, updates) => {
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    }));
    get().addAuditLog(`Updated personnel record ${id}`, 'User', id);
  },

  toggleUserStatus: (id) => {
    const user = get().users.find((u) => u.id === id);
    if (!user) return;
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    set((s) => ({
      users: s.users.map((u) =>
        u.id === id ? { ...u, status: newStatus } : u
      ),
    }));
    get().addAuditLog(
      `${newStatus === 'Active' ? 'Activated' : 'Deactivated'} personnel ${id}`,
      'User',
      id
    );
  },

  // ── Audit Log ─────────────────────────────────────────────────────────────
  addAuditLog: (action, entityType, entityId) => {
    const id = `LOG-${String(9000 + logSeq++)}`;
    const entry = {
      id,
      timestamp: new Date().toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      user: 'J. Smith',
      action,
      entityType,
      entity_type: entityType,
      entityId,
      entity_id: entityId,
      ipAddress: '10.0.1.42',
      ip_address: '10.0.1.42',
    };
    set((s) => ({ auditLogs: [entry, ...s.auditLogs] }));
  },
}));
