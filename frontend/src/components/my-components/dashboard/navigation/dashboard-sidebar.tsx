"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavigation } from "@/components/my-components/dashboard/navigation/dashboard-navigation-items";

// Provide persistent route-level navigation for desktop dashboard screens.
export function DashboardSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    // Treat nested agent pages as part of the agents destination without activating unrelated routes.
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  }

  return (
    <aside className="sticky top-[76px] hidden h-[calc(100vh-76px)] w-64 shrink-0 border-r border-white/[0.07] px-4 py-7 lg:block">
      <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
        Workspace
      </p>
      <nav aria-label="Dashboard" className="mt-4 space-y-1">
        {dashboardNavigation.map(({ href, label, icon: Icon }) => (
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
  );
}
