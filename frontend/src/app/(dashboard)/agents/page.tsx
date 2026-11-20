import Link from "next/link";
import { Plus } from "lucide-react";

import { AgentList } from "@/components/my-components/dashboard/agents/agent-list";
import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import { getAgentsForDashboard } from "@/features/agents/services/agent-queries";

// This protected page waits for owner-scoped agent data before rendering.
export const instant = false;

// Present all of the current user's agents with their independently configured controls.
export default async function AgentsPage() {
  const result = await getAgentsForDashboard();

  return (
    <div className="mx-auto max-w-[1320px]">
      <DashboardPageHeading
        action={
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neon-purple px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-neon-magenta"
            href="/agents/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            New agent
          </Link>
        }
        description="Create independent assistants with their own budgets, recipient permissions, and approval PINs."
        eyebrow="Agent management"
        title="Your agents"
      />

      {result.error || !result.data ? (
        <section className="rounded-2xl border border-red-300/15 bg-red-500/[0.06] p-6">
          <h2 className="font-semibold text-white">Could not load agents</h2>
          <p className="mt-2 text-sm text-red-100/75">{result.error ?? "The agent service returned no data."}</p>
          <p className="mt-2 text-xs text-white/40">Your agent settings were not changed. Try again after checking the backend.</p>
        </section>
      ) : (
        <AgentList agents={result.data} />
      )}
    </div>
  );
}
