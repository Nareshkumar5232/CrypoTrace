import { Moon, Sun, Home, Briefcase, Wallet, ActivitySquare, Network, ShieldAlert, FileText, Users, Settings, LogOut, Crosshair } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { Link, useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../../store/authStore";
import tnLogo from "../../Tamil_Nadu_State.webp";

const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/investigation", label: "Investigate", icon: Crosshair },
    { path: "/cases", label: "Cases", icon: Briefcase },
    { path: "/wallets", label: "Wallets", icon: Wallet },
    { path: "/transactions", label: "Transactions", icon: ActivitySquare },
    { path: "/clusters", label: "Analytics", icon: Network },
    { path: "/alerts", label: "Alerts", icon: ShieldAlert },
    { path: "/audit-logs", label: "Audit Logs", icon: FileText },
    { path: "/users", label: "Users", icon: Users },
    { path: "/settings", label: "Settings", icon: Settings },
];

export function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const mobileRef = useRef<HTMLDivElement>(null);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }
    };

    // Close mobile menu on route change
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    // Close mobile menu on outside click
    useEffect(() => {
        if (!mobileOpen) return;
        const handler = (e: MouseEvent) => {
            if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setMobileOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [mobileOpen]);

    const isActive = (path: string) =>
        path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

    return (
        <>
            <header className="glass-navbar fixed top-0 left-0 w-full z-[1000] h-16">
                <div className="flex h-full items-center justify-between px-8 max-w-[1920px] mx-auto">
                    {/* Left: Logo */}
                    <Link to="/" className="flex items-center gap-3 shrink-0">
                        <img src={tnLogo} alt="Logo" className="h-8 w-8 object-contain" />
                        <span className="text-[15px] font-bold tracking-tight text-foreground hidden sm:block">
                            Crypto<span className="text-navbar-accent">Trace</span>
                        </span>
                    </Link>

                    {/* Center: Navigation links (desktop) */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`glass-nav-link group relative px-3.5 py-2 text-[14px] font-medium tracking-wide transition-colors duration-200 ${active
                                        ? "text-navbar-accent"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {item.label}
                                    {/* Animated underline */}
                                    <span
                                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-200 ease-out ${active ? "w-full bg-navbar-accent shadow-[0_0_6px_var(--navbar-accent-glow)]" : "w-0 bg-navbar-accent group-hover:w-full"
                                            }`}
                                    />
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        {/* Theme toggle */}
                        <button onClick={toggleTheme} className="glass-icon-btn" title="Toggle Theme">
                            {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                        </button>

                        {/* Profile dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="glass-icon-btn flex items-center gap-2 !px-2">
                                    <div className="h-7 w-7 rounded-full bg-navbar-accent/20 flex items-center justify-center text-xs font-semibold text-navbar-accent">
                                        {(user?.name || "JS").slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-foreground hidden md:block">
                                        {user?.name || "J. Smith"}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 glass-dropdown mt-2">
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    {user?.role || "Authorized Personnel"}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/settings")}>
                                    <Settings className="mr-2 h-4 w-4" /> Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/settings")}>
                                    <Settings className="mr-2 h-4 w-4" /> Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-500 focus:text-red-500"
                                    onClick={() => {
                                        useAuthStore.getState().logout();
                                        navigate("/login", { replace: true });
                                    }}
                                >
                                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Mobile dropdown panel */}
            {mobileOpen && (
                <div ref={mobileRef} className="glass-mobile-menu fixed top-16 left-0 right-0 z-40 lg:hidden">
                    <nav className="flex flex-col p-4 gap-1">
                        {navItems.map((item) => {
                            const active = isActive(item.path);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${active
                                        ? "text-navbar-accent bg-navbar-accent/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                        <div className="border-t border-border mt-2 pt-2">
                            <button
                                onClick={() => {
                                    useAuthStore.getState().logout();
                                    navigate("/login", { replace: true });
                                }}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 w-full transition-colors duration-200"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </>
    );
}