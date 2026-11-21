import Link from "next/link";
import { ArrowLeft, Bot, CalendarDays, ListOrdered, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { AgentForm } from "@/components/my-components/dashboard/agents/agent-form";
import { AgentPinForm } from "@/components/my-components/dashboard/agents/agent-pin-form";
import { AgentStatusControls } from "@/components/my-components/dashboard/agents/agent-status-controls";
import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import { getAgentForDashboard } from "@/features/agents/services/agent-queries";

// This protected page waits for request-time auth and owner-scoped agent configuration.
export const instant = false;

// Display a single owner-scoped agent and its edit, status, PIN, and retirement controls.
export default async function AgentDetailPage({
  params,
}: PageProps<"/agents/[agentId]">) {
  const { agentId } = await params;
  const result = await getAgentForDashboard(agentId);

  if (result.status === 404) {
    notFound();
  }
  if (result.error || !result.data) {
    return (
      <section className="mx-auto max-w-[1000px] rounded-2xl border border-red-300/15 bg-red-500/[0.06] p-6">
        <h1 className="text-lg font-semibold text-white">Agent details are unavailable</h1>
        <p className="mt-2 text-sm text-red-100/75">{result.error ?? "The agent service returned no data."}</p>
      </section>
    );
  }

  const agent = result.data;
  const createdAt = new Date(agent.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-[1000px]">
      <Link
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/45 transition-colors hover:text-neon-magenta"
        href="/agents"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to agents
      </Link>
      <DashboardPageHeading
        description={agent.description || "Manage this agent's identity, financial boundaries, and recipient permissions."}
        eyebrow="Agent settings"
        title={agent.name}
      />

      <section className="mb-7 flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-[#17121f] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-neon-purple/15 text-neon-magenta">
            <Bot aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{agent.responsibility}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-white/40">
              <CalendarDays aria-hidden="true" className="size-3.5" />
              Created {createdAt}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
              <ShieldCheck aria-hidden="true" className="size-3.5 text-neon-magenta" />
              Approval PIN finalizes transactions.
            </p>
          </div>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
            agent.is_active
              ? "border border-emerald-300/15 bg-emerald-400/[0.08] text-emerald-200"
              : "border border-white/10 bg-white/[0.04] text-white/50"
          }`}
        >
          {agent.is_active ? "Active" : "Paused"}
        </span>
      </section>

      <div className="space-y-7">
        <AgentForm agent={agent} />
        <AgentPinForm agentId={agent.id} />
        <section className="rounded-2xl border border-white/[0.08] bg-[#17121f] p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/[0.05] text-neon-magenta">
              <ListOrdered aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-magenta">History</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Agent transactions</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/45">
            No transactions are recorded yet. When payment execution is available, this agent’s history will appear here and remain preserved if the agent is deleted.
          </p>
        </section>
        <section className="rounded-2xl border border-red-300/10 bg-[#17121f] p-5 sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-200/75">Agent controls</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Status and deletion</h2>
          <p className="mb-5 mt-1 text-sm leading-6 text-white/45">
            Deleting removes this agent from active management but preserves its record for future transaction history.
          </p>
          <AgentStatusControls agentId={agent.id} isActive={agent.is_active} />
        </section>
      </div>
    </div>
  );
}
