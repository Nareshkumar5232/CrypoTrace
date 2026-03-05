import { useState } from "react";
import { Filter, Search, Loader2 } from "lucide-react";
import { TnLoader } from "../components/TnLoader";
import { useUsers, useUpdateUser } from "../../hooks/useUsers";
import { useRoles } from "../../hooks/useRoles";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogClose } from "../components/ui/dialog";

export function UserAdmin() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: users, isLoading: usersLoading, isError: usersError } = useUsers({ search: searchTerm });
    const { data: roles, isLoading: rolesLoading } = useRoles();
    const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

    const handleToggleStatus = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const action = newStatus === 'Active' ? 'ACTIVATE' : 'DEACTIVATE';
        if (window.confirm(`Are you sure you want to ${action} this personnel record?`)) {
            updateUser({ id, updates: { status: newStatus } });
        }
    };
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-4">
                <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
                    PERSONNEL & ROLE ADMINISTRATION
                </h1>
                <p className="text-xs uppercase tracking-wider text-[#64748B]">
                    Manage personnel access levels and system roles
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Roles Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-[#E2E8F0] h-full">
                        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                                SYSTEM ROLES
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-[#E2E8F0] relative">
                                    {rolesLoading && (
                                        <tr>
                                            <td colSpan={2} className="p-0">
                                                <TnLoader text="LOADING ROLES..." />
                                            </td>
                                        </tr>
                                    )}
                                    {!rolesLoading && (roles || []).map((role: any) => (
                                        <tr key={role.id}>
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-[#0F172A]">{role.name}</p>
                                                <p className="text-xs text-[#64748B] mt-0.5">{role.description}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#0F1623]">
                                                    {role.userCount || 0} PERSONNEL
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-[#E2E8F0] h-full">
                        <div className="flex flex-row items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                                ACTIVE PERSONNEL
                            </h2>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-[#64748B]" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="SEARCH EMPLOYEE..."
                                        className="h-7 w-48 lg:w-64 rounded border border-[#E2E8F0] bg-white pl-8 pr-3 text-[10px] uppercase tracking-wider text-[#0F172A] placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9]"
                                    />
                                </div>
                                <button className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors">
                                    <Filter className="mr-1.5 h-3 w-3" />
                                    Filter
                                </button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="inline-flex items-center justify-center rounded border border-[#0F1623] bg-[#0F1623] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#1E293B] dark:hover:bg-[#00d2a0] dark:hover:text-[#0F1623] transition-colors">
                                            ADD USER
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Add New Personnel</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]">Name</label>
                                                <input className="flex h-10 w-full rounded border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9]" placeholder="J. Doe" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#0F1623]">Department</label>
                                                <input className="flex h-10 w-full rounded border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:border-[#0F1623] dark:focus:border-[#00F4B9]" placeholder="Intelligence" />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <DialogClose asChild>
                                                <button className="inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] dark:hover:text-white transition-colors">
                                                    CANCEL
                                                </button>
                                            </DialogClose>
                                            <DialogClose asChild>
                                                <button className="inline-flex items-center justify-center rounded border border-[#0F1623] bg-[#0F1623] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#1E293B] dark:hover:bg-[#00d2a0] dark:hover:text-[#0F1623] transition-colors">
                                                    SUBMIT
                                                </button>
                                            </DialogClose>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
                                        <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Employee ID</th>
                                        <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Name</th>
                                        <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Department</th>
                                        <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Assigned Role</th>
                                        <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B]">Status</th>
                                        <th className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[#64748B] text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E2E8F0] relative">
                                    {usersLoading && (
                                        <tr>
                                            <td colSpan={6} className="p-0">
                                                <TnLoader text="LOADING PERSONNEL RECORDS..." />
                                            </td>
                                        </tr>
                                    )}
                                    {usersError && (
                                        <tr>
                                            <td colSpan={6} className="px-3 py-6 text-center text-xs text-[#EF4444] uppercase tracking-wider font-bold bg-[#FEF2F2]">
                                                FAILED TO LOAD PERSONNEL DATA
                                            </td>
                                        </tr>
                                    )}
                                    {!usersLoading && (!users || users.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="px-3 py-6 text-center text-xs text-[#64748B] uppercase tracking-wider font-bold">
                                                NO RECORD FOUND
                                            </td>
                                        </tr>
                                    )}
                                    {!usersLoading && (users || []).map((user: any) => (
                                        <tr key={user.id}>
                                            <td className="px-3 py-1.5 font-mono text-xs text-[#64748B]">{user.id || user.employee_id}</td>
                                            <td className="px-3 py-1.5 font-bold text-xs text-[#0F172A]">{user.name}</td>
                                            <td className="px-3 py-1.5 text-xs text-[#64748B]">{user.department}</td>
                                            <td className="px-3 py-1.5 text-xs text-[#0F172A]">{user.role || user.roles?.name}</td>
                                            <td className="px-3 py-1.5">
                                                <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase ${user.status === 'Active' ? 'text-[#10B981]' : 'text-[#64748B] '
                                                    }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-1.5 text-right">
                                                <button className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] hover:text-[#0F172A] mr-3">EDIT</button>
                                                {user.status === 'Active' ? (
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id, user.status)}
                                                        disabled={isUpdating}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-[#EF4444] hover:text-[#B91C1C] disabled:opacity-50"
                                                    >
                                                        DEACTIVATE
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id, user.status)}
                                                        disabled={isUpdating}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-[#10B981] hover:text-[#047857] disabled:opacity-50"
                                                    >
                                                        ACTIVATE
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
