import { useState } from"react";
import { Briefcase, Plus, Filter, Wallet, ShieldAlert, FileText, ChevronRight, Loader2 } from"lucide-react";
import { useCases, useUpdateCase, useCreateCase } from"../../hooks/useCases";
import { Tabs, TabsList, TabsTrigger, TabsContent } from"../components/ui/tabs";

export function CaseManagement() {
 const [selectedCase, setSelectedCase] = useState<string | null>(null);
 const [searchTerm, setSearchTerm] = useState("");
 const { data: cases, isLoading, isError } = useCases({ search: searchTerm });
 const { mutate: updateCase, isPending: isUpdating } = useUpdateCase();
 const { mutate: createCase, isPending: isCreating } = useCreateCase();

 const handleCreateCase = () => {
 const title = window.prompt("Enter new case title:");
 if (title) {
 createCase({ title, status:"Open", riskLevel:"Medium" });
 }
 };

 const handleChangeStatus = (id: string, currentStatus: string) => {
 const newStatus = window.prompt("Enter new status (Open, In Progress, Closed):", currentStatus);
 if (newStatus && ['Open', 'In Progress', 'Closed'].includes(newStatus)) {
 updateCase({ id, updates: { status: newStatus } });
 }
 };

 const renderCaseList = () => (
 <div className="bg-white border border-[#E2E8F0]">
 <div className="flex flex-row items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
 <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Active Investigations</h2>
 <div className="flex gap-2">
 <button className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors">
 <Filter className="mr-1.5 h-3 w-3" />
 Filter
 </button>
 <button
 onClick={handleCreateCase}
 disabled={isCreating}
 className="inline-flex items-center justify-center rounded bg-[#0F1623] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#1E293B] dark:hover:bg-[#00d2a0] dark:hover:text-[#0F1623] transition-colors disabled:opacity-50"
 >
 {isCreating ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Plus className="mr-1.5 h-3 w-3" />}
 New Case
 </button>
 </div>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Case ID</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Title</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Status</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Risk Level</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Officer</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Created</th>
 <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#E2E8F0] relative">
 {isLoading && (
 <tr>
 <td colSpan={7} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">
 <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> LOADING INVESTIGATIONS...
 </td>
 </tr>
 )}
 {isError && (
 <tr>
 <td colSpan={7} className="px-3 py-6 text-center text-xs text-[#EF4444] uppercase tracking-wider font-bold bg-[#FEF2F2]">
 FAILED TO LOAD INVESTIGATIONS
 </td>
 </tr>
 )}
 {!isLoading && (!cases || cases.length === 0) && (
 <tr>
 <td colSpan={7} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">
 NO RECORDS FOUND
 </td>
 </tr>
 )}
 {!isLoading && (cases || []).map((c: any) => (
 <tr key={c.id}>
 <td className="px-3 py-1.5 font-mono text-xs text-[#64748B]">{c.case_number || c.id}</td>
 <td className="px-3 py-1.5 text-xs font-medium text-[#0F172A]">{c.title}</td>
 <td className="px-3 py-1.5">
 <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase ${c.status === 'Open' ? 'text-[#F59E0B]' :
 c.status === 'In Progress' ? 'text-[#0F1623] ' :
 'text-[#64748B] '
 }`}>
 {c.status}
 </span>
 </td>
 <td className="px-3 py-1.5">
 <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase ${c.riskLevel === 'Critical' || c.risk_level === 'Critical' ? 'text-[#EF4444]' :
 c.riskLevel === 'High' || c.risk_level === 'High' ? 'text-[#F59E0B]' :
 'text-[#64748B] '
 }`}>
 {c.riskLevel || c.risk_level}
 </span>
 </td>
 <td className="px-3 py-1.5 text-xs text-[#0F172A]">{c.officer || c.assigned_officer}</td>
 <td className="px-3 py-1.5 text-xs text-[#64748B]">{c.created || c.created_at}</td>
 <td className="px-3 py-1.5 text-right">
 <button
 onClick={() => setSelectedCase(c.id)}
 className="inline-flex items-center text-[10px] font-bold uppercase text-[#0F1623] hover:underline"
 >
 View <ChevronRight className="ml-1 h-3 w-3" />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );

 const renderCaseDetail = () => {
 const caseItem = (cases || []).find((c: any) => c.id === selectedCase);
 if (!caseItem) return null;

 return (
 <div className="space-y-6">
 <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <button
 onClick={() => setSelectedCase(null)}
 className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors"
 >
 Back to List
 </button>
 <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">
 {caseItem.id}: {caseItem.title}
 </h2>
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => handleChangeStatus(caseItem.id, caseItem.status)}
 disabled={isUpdating}
 className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors disabled:opacity-50"
 >
 {isUpdating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
 Change Status
 </button>
 <button className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors">
 Assign Officer
 </button>
 </div>
 </div>
 </div>

 <div className="grid gap-4 md:grid-cols-3">
 <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
 Linked Entities
 </span>
 <span className="text-2xl font-bold text-[#0F172A]">
 {caseItem.wallets || 0}
 </span>
 </div>

 <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
 Intelligence Notifications
 </span>
 <span className="text-2xl font-bold text-[#0F172A]">
 {caseItem.alerts || 0}
 </span>
 </div>

 <div className="bg-white border border-[#E2E8F0] p-4 flex flex-col">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
 Case Notes
 </span>
 <span className="text-2xl font-bold text-[#0F172A]">
 {caseItem.notes || 0}
 </span>
 </div>
 </div>
 <Tabs defaultValue="wallets" className="mt-6">
 <TabsList className="mb-4">
 <TabsTrigger value="wallets">Entity-level Linked Wallets Table</TabsTrigger>
 <TabsTrigger value="history">Audit & Note History Timeline</TabsTrigger>
 </TabsList>
 <TabsContent value="wallets" className="mt-0 space-y-4">
 <div className="bg-white border border-[#E2E8F0] h-64 flex flex-col">
 <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
 <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
 Entity-level Linked Wallets Table
 </h2>
 </div>
 <div className="flex-1 flex items-center justify-center text-xs text-[#64748B]">
 Data populated from case_wallets
 </div>
 </div>
 </TabsContent>
 <TabsContent value="history" className="mt-0 space-y-4">
 <div className="bg-white border border-[#E2E8F0] h-64 flex flex-col">
 <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
 <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
 Audit & Note History Timeline
 </h2>
 </div>
 <div className="flex-1 flex items-center justify-center text-xs text-[#64748B]">
 Data populated from case_notes and audit_logs
 </div>
 </div>
 </TabsContent>
 </Tabs>
 </div>
 );
 };

 return (
 <div className="space-y-6">
 {!selectedCase && (
 <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
 <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
 CASE MANAGEMENT
 </h1>
 <p className="text-xs uppercase tracking-wider text-[#64748B]">
 Authoritative record of intelligence operations
 </p>
 </div>
 )}

 {selectedCase ? renderCaseDetail() : renderCaseList()}
 </div>
 );
}
