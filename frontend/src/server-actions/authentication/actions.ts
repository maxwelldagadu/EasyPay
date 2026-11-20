"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export type SignOutActionResult =
  | { ok: true }
  | { ok: false; message: string };

// Revoke the Better Auth session on the server and let its Next.js cookie plugin clear browser cookies.
export async function signOutAction(): Promise<SignOutActionResult> {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) {
    return { ok: false, message: "Your session has already expired. Refresh the page to continue." };
  }

  // Keep the session revocation server-side so logout follows the same mutation boundary as agent changes.
  const result = await auth.api.signOut({ headers: requestHeaders });
  if (!result.success) {
    return { ok: false, message: "Could not end your session. Please try again." };
  }
  revalidatePath("/dashboard");
  return { ok: true };
}
