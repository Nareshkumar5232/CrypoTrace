import { Outlet } from "react-router";
import { Header } from "./Header";
import { useEffect, useState } from "react";
import tnLogo from "../../Tamil_Nadu_State.webp";

export function RootLayout() {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 0);
        return () => clearTimeout(timer);
    }, []);

    if (showSplash) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B1120]">
                <img src={tnLogo} alt="Tamil Nadu State Logo" className="mb-8 w-32" />
                <h1 className="mb-2 text-2xl font-bold uppercase tracking-widest text-white">Crypto Intelligence System</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-[#06B6D4]">Initializing Secure Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background overflow-hidden">
            <Header />
            <main className="mt-16 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden">
                <div className="mx-auto w-full max-w-[1200px] p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}