import { useEffect, useState } from "react";
import { motion } from "motion/react";
import tamilNaduLogo from "../../assets/Tamil_Nadu_State.webp";
import policeLogo from "../../assets/Tamil_Nadu Police.jpg";
import { Loader2 } from "lucide-react";
import { useLogin } from "../../hooks/useAuth";
import { useNavigate } from "react-router";

export function Login() {
    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const { mutate: login, isPending } = useLogin();
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('authUser')) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, []);

    useEffect(() => {
        if (!isAuthenticating) return;

        const redirectTimer = setTimeout(() => {
            navigate("/dashboard", { replace: true });
        }, 1500);

        return () => clearTimeout(redirectTimer);
    }, [isAuthenticating, navigate]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId || !password) return;

        login(
            { employeeId, password },
            {
                navigateTo: false,
                onSuccess: () => setIsAuthenticating(true),
                onError: () => setIsAuthenticating(false),
            }
        );
    };

    if (isAuthenticating) {
        return (
            <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
                <div className="flex flex-col items-center justify-center gap-5 px-6 text-center animate-in fade-in duration-300">
                    <img
                        src={policeLogo}
                        alt="Tamil Nadu Police"
                        className="h-auto w-full max-w-[250px] object-contain"
                    />

                    <div className="rounded-lg border border-[#E2E8F0] bg-white/75 px-6 py-3 shadow-sm backdrop-blur-sm dark:border-[#1F1F1F] dark:bg-black/50">
                        <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-[#0F172A] dark:text-white">
                            CryptoTrace
                        </h2>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#475569] dark:text-[#94A3B8]">
                            Investigation & Fund Tracing Platform
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden p-4">
            {/* Static background layer */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${tamilNaduLogo})`,
                        backgroundPosition: "center",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        filter: "blur(6px)",
                    }}
                />
                <div className="absolute inset-0 bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(0,0,0,0.5)]" />
            </div>

            {/* Login card */}
            <motion.div
                className="relative z-[2] w-full max-w-md space-y-8"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.12, delayChildren: 0.1 },
                    },
                }}
            >
                <motion.div
                    className="flex flex-col items-center justify-center space-y-2 text-center"
                    variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.div
                        className="mb-4 flex h-24 w-24 items-center justify-center"
                        variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        animate={{ y: [0, -8, 0] }}
                        style={{ animation: "float 3s ease-in-out infinite" } as React.CSSProperties}
                    >
                        <img src={tamilNaduLogo} alt="Tamil Nadu State Emblem" className="h-full w-full object-contain drop-shadow-lg transition-smooth" />
                    </motion.div>
                    <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white uppercase leading-snug">
                        Cryptocurrency Investigation<br/>&amp; Fund Tracing System
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                        Authorized Access for Law Enforcement
                    </p>
                </motion.div>

                <motion.div
                    className="login-glass-card p-8 transition-smooth hover-lift"
                    variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <div className="mb-6 border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
                        <h2 className="text-sm font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">Authorized Access Only</h2>
                        <p className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mt-1">
                            Enter your credentials to access the system.
                        </p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="employeeId"
                                className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623] dark:text-[#E5E7EB]"
                            >
                                Employee ID
                            </label>
                            <input
                                id="employeeId"
                                type="text"
                                required
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                className="flex h-10 w-full rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white/80 dark:bg-slate-800/60 px-3 py-2 text-sm text-[#0F172A] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9] transition-smooth input-glow"
                                placeholder="e.g. admin@fiu.gov"
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623] dark:text-[#E5E7EB]"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex h-10 w-full rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white/80 dark:bg-slate-800/60 px-3 py-2 text-sm text-[#0F172A] dark:text-white focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9] transition-smooth input-glow"
                            />
                        </div>
                        <motion.button
                            type="submit"
                            disabled={isPending || isAuthenticating || !employeeId || !password}
                            className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#0F1623] bg-[#0F1623] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#1E293B] dark:hover:bg-[#00d2a0] dark:hover:text-[#0F1623] transition-smooth mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            AUTHENTICATE
                        </motion.button>
                    </form>
                </motion.div>

                <motion.div
                    className="login-glass-card !bg-red-50/80 dark:!bg-red-950/30 border border-[#EF4444]/30 p-4 text-[#7F1D1D] dark:text-red-300 transition-smooth"
                    variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider">
                        WARNING: RESTRICTED GOVERNMENT SYSTEM
                    </h3>
                    <p className="text-xs leading-relaxed font-medium">
                        This system contains classified intelligence related to ongoing financial investigations.
                        Unauthorized access, use, or modification is strictly prohibited and subject to severe
                        civil and criminal penalties. All activities on this system are logged and continuously monitored.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
