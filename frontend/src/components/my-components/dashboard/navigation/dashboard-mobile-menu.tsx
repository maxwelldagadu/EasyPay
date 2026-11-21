"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { dashboardNavigation } from "@/components/my-components/dashboard/navigation/dashboard-navigation-items";
import { DashboardSignOutButton } from "@/components/my-components/dashboard/navigation/dashboard-sign-out-button";

export function DashboardMobileMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  }

  return (
    <div className="lg:hidden">
      <button
        aria-controls="dashboard-mobile-navigation"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close dashboard menu" : "Open dashboard menu"}
        className="grid size-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025]
                   text-white/70 transition-colors hover:border-neon-purple/35 hover:text-white 
                   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-magenta"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {isOpen ? (
          <X aria-hidden="true" className="size-[18px] cursor-pointer" />
        ) : (
          <Menu aria-hidden="true" className="size-[18px] cursor-pointer" />
        )}
      </button>

      <nav
        aria-label="Dashboard"
        className={`fixed inset-x-3 top-[84px] z-50 max-h-[calc(100dvh-6rem)] 
                  overflow-y-auto rounded-2xl border border-white/10 
                  bg-[#17121f] p-3 shadow-2xl shadow-black/50 sm:inset-x-7 ${
          isOpen ? "" : "hidden"
        }`}
        id="dashboard-mobile-navigation"
      >
        <p className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
          Workspace
        </p>
        <div className="grid gap-1 sm:grid-cols-2">
          {dashboardNavigation.map(({ href, label, icon: Icon }) => (
            <Link
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                isActive(href)
                  ? "bg-neon-purple/15 font-semibold text-white ring-1 ring-neon-purple/25"
                  : "text-white/60 hover:bg-white/[0.05] hover:text-white"
              }`}
              href={href}
              key={href}
              onClick={() => setIsOpen(false)}
            >
              <Icon
                aria-hidden="true"
                className={`size-[18px] shrink-0 ${
                  isActive(href) ? "text-neon-magenta" : "text-white/45"
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
        </div>
        <div className="mt-3 border-t border-white/[0.08] pt-3">
          <DashboardSignOutButton mobileMenu />
        </div>
      </nav>
    </div>
  );
}
