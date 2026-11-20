import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { DashboardNotifications } from "@/components/my-components/dashboard/navigation/dashboard-notifications";
import { DashboardSignOutButton } from "@/components/my-components/dashboard/navigation/dashboard-sign-out-button";

interface DashboardTopbarProps {
  userName: string;
}

// Keep account controls and platform safety context visible across every dashboard feature.
export function DashboardTopbar({ userName }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#10120f]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1680px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
        <Link aria-label="EasyPay dashboard overview" className="flex items-center gap-3" href="/dashboard">
          <span className="grid size-10 place-items-center rounded-xl bg-[#dfff78] text-lg font-black text-[#161811] shadow-[0_0_26px_rgba(223,255,120,0.12)]">
            E
          </span>
          <span>
            <span className="block font-google-sans text-lg font-semibold tracking-tight">EasyPay</span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.15em] text-white/35 sm:block">
              Agentic payments
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <DashboardNotifications />
          <div className="hidden min-w-0 text-right sm:block">
            <p className="max-w-40 truncate text-sm font-medium text-white/85">
              {userName}
            </p>
          </div>
          <DashboardSignOutButton />
        </div>
      </div>
    </header>
  );
}
