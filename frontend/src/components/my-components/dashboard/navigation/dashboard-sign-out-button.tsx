"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { signOutAction } from "@/server-actions/authentication/actions";
import { useApprovalStore } from "@/stores/approvals/approval-store";

// End the Better Auth session from the shared dashboard header and report failures accessibly.
export function DashboardSignOutButton({ mobileMenu = false }: { mobileMenu?: boolean }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearApprovals = useApprovalStore((state) => state.clear);

  async function signOut() {
    // Prevent duplicate logout requests while Better Auth clears the current session.
    setError(null);
    setIsSigningOut(true);
    try {
      const result = await signOutAction();
      if (!result.ok) {
        setError(result.message);
        return;
      }
      clearApprovals();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      // Surface an unexpected provider failure without leaking session material.
      if (error instanceof Error) {
        setError(`Could not sign out: ${error.message}`);
      } else {
        throw error;
      }
    } finally {
      // Restore the control if the provider reports an error or the request fails.
      setIsSigningOut(false);
    }
  }

  return (
    <div className={mobileMenu ? "w-full" : "relative"}>
      <button
        aria-busy={isSigningOut}
        aria-label="Sign out"
        className={
          mobileMenu
            ? "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            : "inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] px-3 text-xs font-semibold text-white/65 transition-colors hover:border-neon-magenta/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-3.5"
        }
        disabled={isSigningOut}
        onClick={signOut}
        type="button"
      >
        <LogOut aria-hidden="true" className="size-4" />
        <span>{isSigningOut ? "Signing out" : "Sign out"}</span>
      </button>
      {error && (
        <p
          className={
            mobileMenu
              ? "mt-2 rounded-lg border border-red-400/20 bg-[#241517] p-3 text-xs text-red-200"
              : "absolute right-0 top-12 z-50 w-56 rounded-lg border border-red-400/20 bg-[#241517] p-3 text-xs text-red-200"
          }
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
