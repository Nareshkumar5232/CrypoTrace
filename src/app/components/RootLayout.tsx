import { Outlet } from "react-router";
import { Header } from "./Header";
import { useState, useEffect } from "react";
import tnLogo from "../../Tamil_Nadu_State.webp";

export function RootLayout() {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 0);
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
            <main className="pt-16">
                <div className="p-8 max-w-[1920px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}