"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { signOutAction } from "@/server-actions/authentication/actions";

// End the Better Auth session from the shared dashboard header and report failures accessibly.
export function DashboardSignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="relative">
      <button
        aria-busy={isSigningOut}
        aria-label="Sign out"
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] 
                    px-3 text-xs font-semibold text-white/65 transition-colors hover:border-neon-magenta/35
                   hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-3.5 cursor-pointer"           
        disabled={isSigningOut}
        onClick={signOut}
        type="button"
      >
        <LogOut aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">{isSigningOut ? "Signing out" : "Sign out"}</span>
      </button>
      {error && (
        <p
          className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-red-400/20 bg-[#241517]
                       p-3 text-xs text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
