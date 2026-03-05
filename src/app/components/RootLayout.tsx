import { Outlet } from "react-router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useState, useEffect } from "react";
import tnLogo from "../../Tamil_Nadu_State.webp";

export function RootLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // Show splash for a brief moment to transition from login to main dashboard
        const timer = setTimeout(() => setShowSplash(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (showSplash) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0B1120] z-[100] animate-in fade-in duration-500">
                <img src={tnLogo} alt="Tamil Nadu State Logo" className="w-32 animate-pulse mb-8" />
                <h1 className="text-white tracking-widest text-2xl font-bold uppercase mb-2">Crypto Intelligence System</h1>
                <p className="text-[#06B6D4] text-xs font-bold uppercase tracking-widest animate-pulse">Initializing Secure Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="flex pt-16">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
                <main
                    className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-[270px]'
                        }`}
                >
                    <div className="p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}