import { useState } from "react";
import tamilNaduLogo from "../../Tamil_Nadu_State.webp";
import { Loader2 } from "lucide-react";
import { useLogin } from "../../hooks/useAuth";

export function Login() {
    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const { mutate: login, isPending } = useLogin();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId || !password) return;
        login({ employeeId, password });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="mb-4 flex h-24 w-24 items-center justify-center">
                        <img src={tamilNaduLogo} alt="Tamil Nadu State Emblem" className="h-full w-full object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] uppercase">
                        CRYPTO INTELLIGENCE SYSTEM
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Department of Digital Asset Security
                    </p>
                </div>

                <div className="bg-white border border-[#E2E8F0] p-6 shadow-sm">
                    <div className="mb-6 border-b border-[#E2E8F0] pb-4">
                        <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Authorized Access Only</h2>
                        <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mt-1">
                            Enter your credentials to access the system.
                        </p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="employeeId"
                                className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]"
                            >
                                Employee ID
                            </label>
                            <input
                                id="employeeId"
                                type="text"
                                required
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                className="flex h-10 w-full rounded border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9]"
                                placeholder="e.g. ID-0001"
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex h-10 w-full rounded border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isPending || !employeeId || !password}
                            className="inline-flex h-10 w-full items-center justify-center rounded border border-[#0F1623] bg-[#0F1623] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#1E293B] dark:hover:bg-[#00d2a0] dark:hover:text-[#0F1623] transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            AUTHENTICATE
                        </button>
                    </form>
                </div>

                <div className="border border-[#EF4444] bg-[#FEF2F2] p-4 text-[#7F1D1D]">
                    <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider">
                        WARNING: RESTRICTED GOVERNMENT SYSTEM
                    </h3>
                    <p className="text-xs leading-relaxed font-medium">
                        This system contains classified intelligence related to ongoing financial investigations.
                        Unauthorized access, use, or modification is strictly prohibited and subject to severe
                        civil and criminal penalties. All activities on this system are logged and continuously monitored.
                    </p>
                </div>
            </div>
        </div>
    );
}
