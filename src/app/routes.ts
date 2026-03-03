import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Dashboard } from "./pages/Dashboard";
import { WalletClusters } from "./pages/WalletClusters";
import { Login } from "./pages/Login";
import { CaseManagement } from "./pages/CaseManagement";
import { WalletIntelligence } from "./pages/WalletIntelligence";
import { TransactionView } from "./pages/TransactionView";
import { AlertManagement } from "./pages/AlertManagement";
import { AuditLogs } from "./pages/AuditLogs";
import { UserAdmin } from "./pages/UserAdmin";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  {
    path: "/",
    Component: ProtectedRoute,
    children: [
      {
        path: "/",
        Component: RootLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "cases", Component: CaseManagement },
          { path: "wallets", Component: WalletIntelligence },
          { path: "transactions", Component: TransactionView },
          { path: "clusters", Component: WalletClusters },
          { path: "alerts", Component: AlertManagement },
          { path: "audit-logs", Component: AuditLogs },
          { path: "users", Component: UserAdmin },
        ],
      }
    ],
  },
]);
