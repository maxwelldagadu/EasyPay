import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/my-components/dashboard/navigation/dashboard-sidebar";
import { DashboardTopbar } from "@/components/my-components/dashboard/navigation/dashboard-topbar";

interface DashboardShellProps {
  children: ReactNode;
  userName: string;
}

// Keep every authenticated feature inside one consistent navigation and brand frame.
export function DashboardShell({ children, userName}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#10120f] font-open-sans text-[#f3f1e8] [&_h1]:font-google-sans [&_h2]:font-google-sans [&_h3]:font-google-sans">
      <DashboardTopbar userName={userName}/>
      <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-[1680px] flex-col lg:flex-row">
        <DashboardSidebar />
        <main className="w-full min-w-0 flex-1 px-3 pb-10 pt-6 sm:px-7 lg:px-10 lg:pt-9">
          {children}
        </main>
      </div>
    </div>
  );
}
