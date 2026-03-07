import { Save, Loader2, ShieldCheck, Database, Server, Key } from "lucide-react";
import { useState } from "react";
import { TnLoader } from "../components/TnLoader";
import { toast } from "sonner";

export function SystemSettings() {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Settings securely saved.');
        }, 300);
    };

    return (
        <div className="space-y-6 page-enter-content">
            <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
                            SYSTEM SETTINGS
                        </h1>
                        <p className="text-xs uppercase tracking-wider text-[#64748B]">
                            Configure global parameters and integrations
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center justify-center rounded border border-[#0F1623] bg-[#0F1623] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#1E293B] dark:hover:bg-[#00d2a0] dark:hover:text-[#0F1623] transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        SAVE CONFIGURATION
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Security Settings */}
                <div className="bg-white border border-[#E2E8F0]">
                    <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#0F172A]" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                            Security Policies
                        </h2>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]">Session Timeout (Minutes)</label>
                            <input type="number" defaultValue={15} className="flex h-10 w-full rounded border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]">MFA Requirement</label>
                            <select className="flex h-10 w-full rounded border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9]">
                                <option>All Personnel</option>
                                <option>Administrators Only</option>
                                <option>Disabled (Not Recommended)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* API & Integrations */}
                <div className="bg-white border border-[#E2E8F0]">
                    <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 flex items-center gap-2">
                        <Key className="h-4 w-4 text-[#0F172A]" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                            API & External Services
                        </h2>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]">Blockchain Node Endpoint</label>
                            <input type="text" defaultValue="wss://node.cryptotrace.gov:8546" className="flex h-10 w-full rounded border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9] font-mono" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]">Risk Scoring Engine API Key</label>
                            <input type="password" defaultValue="************************" className="flex h-10 w-full rounded border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9] font-mono" />
                        </div>
                    </div>
                </div>

                {/* Database Settings */}
                <div className="bg-white border border-[#E2E8F0]">
                    <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 flex items-center gap-2">
                        <Database className="h-4 w-4 text-[#0F172A]" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                            Data Retention & Privacy
                        </h2>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]">Audit Log Retention (Days)</label>
                            <input type="number" defaultValue={365} className="flex h-10 w-full rounded border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]">Auto-Archive Closed Cases</label>
                            <select className="flex h-10 w-full rounded border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9]">
                                <option>After 30 Days</option>
                                <option>After 90 Days</option>
                                <option>Never</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* System Diagnostics */}
                <div className="bg-white border border-[#E2E8F0]">
                    <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 flex items-center gap-2">
                        <Server className="h-4 w-4 text-[#0F172A]" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                            System Status & Diagnostics
                        </h2>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                            <span className="text-xs text-[#64748B] font-bold p-0 uppercase">Core Infrastructure</span>
                            <span className="inline-flex items-center px-2 py-1 bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold uppercase tracking-wider rounded">Operational</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                            <span className="text-xs text-[#64748B] font-bold p-0 uppercase">Data Aggregation</span>
                            <span className="inline-flex items-center px-2 py-1 bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold uppercase tracking-wider rounded">Operational</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                            <span className="text-xs text-[#64748B] font-bold p-0 uppercase">Analytic Engine</span>
                            <span className="inline-flex items-center px-2 py-1 bg-[#FFFBEB] text-[#F59E0B] text-[10px] font-bold uppercase tracking-wider rounded">High Load</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
