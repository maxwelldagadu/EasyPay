"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

// End the Better Auth session and return the user to the login page.
export function SignOutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setError(null);
    setIsSigningOut(true);

    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError(
          result.error.message?.trim() ||
            `Sign-out failed (HTTP ${result.error.status}: ${result.error.statusText}).`,
        );
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
      setError(`Could not complete sign out: ${error.message}`);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
      >
        {isSigningOut ? "Signing out..." : "Sign out"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
