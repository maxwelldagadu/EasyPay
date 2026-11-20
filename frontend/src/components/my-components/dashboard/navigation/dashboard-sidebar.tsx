"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  CalendarClock,
  CircleDollarSign,
  ClipboardCheck,
  Compass,
  LayoutDashboard,
  ListOrdered,
  Settings2,
  UsersRound,
} from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/agents", label: "AI agents", icon: Bot },
  { href: "/approvals", label: "Approvals", icon: ClipboardCheck },
  { href: "/wallet", label: "Wallet", icon: CircleDollarSign },
  { href: "/transactions", label: "Transactions", icon: ListOrdered },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/scheduled-payments", label: "Schedules", icon: CalendarClock },
  { href: "/agent-requests", label: "Agent requests", icon: UsersRound },
  { href: "/marketplace", label: "Marketplace", icon: Compass },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

// Provide clear route-level navigation and a compact horizontal variant for mobile screens.
export function DashboardSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    // Treat nested agent pages as part of the agents destination without activating unrelated routes.
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  }

  return (
    <>
      <aside className="sticky top-[76px] hidden h-[calc(100vh-76px)] w-64 shrink-0 border-r border-white/[0.07] px-4 py-7 lg:block">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
          Workspace
        </p>
        <nav aria-label="Dashboard" className="mt-4 space-y-1">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              aria-current={isActive(href) ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                isActive(href)
                  ? "bg-neon-purple/15 font-semibold text-white ring-1 ring-neon-purple/25"
                  : "text-white/55 hover:bg-white/[0.045] hover:text-white/90"
              }`}
              href={href}
              key={href}
            >
              <Icon
                aria-hidden="true"
                className={`size-[18px] ${
                  isActive(href) ? "text-neon-magenta" : "text-white/40 group-hover:text-white/75"
                }`}
              />
              {label}
              {label === "AI agents" && (
                <span className="ml-auto rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] text-white/45">
                  Manage
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-4 bottom-6 rounded-2xl border border-neon-purple/20 bg-gradient-to-br from-neon-purple/[0.12] to-neon-magenta/[0.04] p-4">
          <p className="text-xs font-semibold text-white/85">Human-approved payments</p>
          <p className="mt-1.5 text-xs leading-5 text-white/45">
            Agents prepare requests. You remain in control of every payment.
          </p>
        </div>
      </aside>

      <nav
        aria-label="Dashboard"
        className="sticky top-[76px] z-20 flex gap-1 overflow-x-auto border-b border-white/[0.07] bg-[#10120f]/95 px-3 py-2 backdrop-blur lg:hidden"
      >
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link
            aria-current={isActive(href) ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs ${
              isActive(href) ? "bg-neon-purple/15 text-white" : "text-white/55 hover:bg-white/[0.06]"
            }`}
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
