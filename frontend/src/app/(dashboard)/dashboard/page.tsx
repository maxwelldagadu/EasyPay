import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

// The dashboard depends on request-time authentication and must never be statically prerendered.
export const instant = false;

export default async function DashboardPage() {
  // Server-side session checks protect application routes before dashboard content is rendered.
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-blue-600">EasyPay</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Signed in as {session.user.email}. Phase 1 foundation is ready.
        </p>
      </div>
    </main>
  );
}

