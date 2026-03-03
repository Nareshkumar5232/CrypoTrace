import { Outlet } from"react-router";
import { Header } from"./Header";
import { Sidebar } from"./Sidebar";
import { useState, useEffect } from"react";

export function RootLayout() {
 const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

 return (
 <div className="min-h-screen bg-background">
 <Header />
 <div className="flex pt-16">
 <Sidebar
 collapsed={sidebarCollapsed}
 onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
 />
 <main
 className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'
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