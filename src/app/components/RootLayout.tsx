import { Outlet } from "react-router";
import { Header } from "./Header";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import tnLogo from "../../Tamil_Nadu_State.webp";

export function RootLayout() {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2200);
        return () => clearTimeout(timer);
    }, []);

    if (showSplash) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-background">
                <img src={tnLogo} alt="Tamil Nadu State Logo" className="mb-8 w-32 animate-fade-in-up animate-stagger-2" />
                <h1 className="mb-2 text-2xl font-bold uppercase tracking-widest text-foreground animate-fade-in-up animate-stagger-3">Crypto Intelligence System</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-navbar-accent animate-fade-in animate-stagger-5">Initializing Secure Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background overflow-hidden">
            <Header />
            <main className="mt-16 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden bg-white dark:bg-background">
                <motion.div
                    className="mx-auto w-full max-w-[1200px] p-8"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
}