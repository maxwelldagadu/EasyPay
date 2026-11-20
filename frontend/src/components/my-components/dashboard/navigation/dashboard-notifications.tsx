"use client";

import { ArrowUpRight, Bell } from "lucide-react";
import Link from "next/link";

// Reserve a truthful transaction-notification surface until transaction events are implemented.
export function DashboardNotifications() {
  return (
    <details className="group relative">
      <summary
        aria-label="Open transaction notifications"
        className="relative grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/65 transition-colors hover:border-neon-purple/35 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-magenta [&::-webkit-details-marker]:hidden"
      >
        <Bell aria-hidden="true" className="size-[18px]" />
      </summary>
      <section
        aria-label="Transaction notifications"
        className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#17121f] p-4 shadow-2xl shadow-black/50"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Notifications</h2>
            <p className="mt-1 text-xs text-white/45">Payment and account activity</p>
          </div>
          <Bell aria-hidden="true" className="size-4 text-neon-magenta" />
        </div>
        <div className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-5 text-center">
          <p className="text-sm font-medium text-white/70">You’re all caught up</p>
          <p className="mt-1 text-xs leading-5 text-white/40">
            Transaction notifications will appear here when payment activity is enabled.
          </p>
        </div>
        <Link
          className="mt-3 flex items-center justify-between rounded-lg px-2 py-2 text-xs font-medium text-neon-magenta transition-colors hover:bg-white/[0.04]"
          href="/transactions"
        >
          View transactions
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      </section>
    </details>
  );
}
