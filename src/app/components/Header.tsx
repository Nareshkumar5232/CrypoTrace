import { Shield, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

import { useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../../store/authStore";
import tnLogo from "../../Tamil_Nadu_State.webp";

export function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const pathnames = location.pathname.split('/').filter(x => x);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Theme state
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#1E293B] bg-[#0F1623]">
            <div className="flex h-full items-center justify-between px-6">
                {/* Left Section: Breadcrumbs & App Name */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 border-r border-[#1E293B] pr-6">
                        <img src={tnLogo} alt="Tamil Nadu State Logo" className="h-8 object-contain" />
                        <h1 className="text-sm font-extrabold tracking-tight text-[#00F4B9] drop-shadow-[0_0_8px_rgba(0,244,185,0.6)]">
                            CryptoTrace <span className="text-white">Intelligence</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                        <span className="font-medium text-white">Dashboard</span>
                        {pathnames.length > 0 && (
                            <>
                                <span className="mx-1">/</span>
                                <span className="font-medium text-white capitalize">
                                    {pathnames[0].replace("-", "")}
                                </span>
                            </>
                        )}
                        {pathnames.includes("cases") && (
                            <>
                                <span className="mx-2 text-[#1E293B]">|</span>
                                <span className="font-mono text-xs text-white bg-[#1E293B] px-2 py-0.5 rounded">CASE-2026-001</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-6">
                    <div className="text-xs font-mono text-[#00F4B9] tracking-widest drop-shadow-[0_0_2px_rgba(0,244,185,0.8)] flex flex-col items-end">
                        <span>{currentTime.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                        <span>{currentTime.toLocaleTimeString(undefined, { hour12: false })} LOCAL</span>
                    </div>

                    <div className="flex items-center gap-4 border-l border-[#1E293B] pl-6">
                        <button
                            onClick={toggleTheme}
                            className="relative text-[#94A3B8] hover:text-white transition-colors"
                            title="Toggle Theme"
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 hover:bg-[#1E293B] py-1 px-2 rounded transition-colors">
                                    <div className="text-right">
                                        <p className="text-xs font-medium text-white uppercase">{user?.name || "J. Smith"}</p>
                                        <p className="text-[10px] text-[#94A3B8] uppercase">{user?.role || "Authorized Personnel"}</p>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-[#0F1623] border border-[#1E293B]">
                                <DropdownMenuLabel className="text-xs uppercase text-[#94A3B8]">Agent ID: {user?.employeeId || "ID-4021"}</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-[#1E293B]" />
                                <DropdownMenuItem className="text-sm text-white focus:bg-[#1E293B] focus:text-white" onClick={() => navigate("/settings")}>System Settings</DropdownMenuItem>
                                <DropdownMenuItem className="text-sm text-white focus:bg-[#1E293B] focus:text-white" onClick={() => navigate("/audit-logs")}>Audit Log</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[#1E293B]" />
                                <DropdownMenuItem
                                    className="text-sm text-[#EF4444] focus:bg-[#1E293B] focus:text-[#EF4444]"
                                    onClick={() => {
                                        useAuthStore.getState().logout();
                                        navigate("/login", { replace: true });
                                    }}
                                >
                                    Sign Out (Secure)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}