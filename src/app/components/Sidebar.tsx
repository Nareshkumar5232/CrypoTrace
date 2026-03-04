import { Link, useLocation } from "react-router";
import {
    LayoutDashboard,
    Search,
    Network,
    TrendingUp,
    FileText,
    ChevronLeft,
    ChevronRight,
    ShieldAlert,
    Wallet,
    ActivitySquare,
    Users,
    Briefcase
} from "lucide-react";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/cases", label: "Case Management", icon: Briefcase },
    { path: "/wallets", label: "Wallet Intelligence", icon: Wallet },
    { path: "/transactions", label: "Transactions", icon: ActivitySquare },
    { path: "/clusters", label: "Cluster Analysis", icon: Network },
    { path: "/alerts", label: "Alerts", icon: ShieldAlert },
    { path: "/audit-logs", label: "Audit Logs", icon: FileText },
    { path: "/users", label: "User Administration", icon: Users },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const location = useLocation();

    return (
        <aside
            className={`fixed left-0 top-16 bottom-0 border-r border-[#1E293B] bg-[#0F1623] z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
        >
            <div className="flex h-full flex-col">
                {/* Toggle Button */}
                <div className="flex justify-end p-2 px-3 border-b border-[#1E293B]">
                    <button
                        onClick={onToggle}
                        className="text-[#94A3B8] hover:text-white p-1.5 rounded-md hover:bg-[#1E293B] transition-colors flex items-center justify-center w-full"
                        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <div className="flex justify-between w-full items-center"><span className="text-xs font-bold uppercase tracking-wider">Menu</span><ChevronLeft size={18} /></div>}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-3 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const isActive =
                            item.path === "/"
                                ? location.pathname === "/"
                                : location.pathname.startsWith(item.path);
                        const Icon = item.icon;

                        return (
                            <Link key={item.path} to={item.path}>
                                <div
                                    className={`relative flex items-center gap-3 rounded-md px-3 py-2.5 transition-all ${isActive
                                        ? "bg-[#1E293B] text-white"
                                        : "text-[#94A3B8] hover:bg-[#1E293B]/50 hover:text-white"
                                        }`}
                                    title={collapsed ? item.label : undefined}
                                >
                                    {isActive && (
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-[#E2E8F0]"
                                        />
                                    )}
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    {!collapsed && (
                                        <span className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
                                            {item.label}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>


            </div>
        </aside>
    );
}
