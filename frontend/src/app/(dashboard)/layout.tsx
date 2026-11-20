import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/my-components/dashboard/navigation/dashboard-shell";
import { auth } from "@/lib/auth";

// This protected route group reads a request-time session and must render on demand.
export const instant = false;

// Resolve a Better Auth session before rendering any protected dashboard feature.
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  // Keep the shared shell personalized using only the verified session identity.
  return (
    <DashboardShell
      userName={session.user.name.split(" ")[0] || "Your account"}
    >
      {children}
    </DashboardShell>
  );
}
