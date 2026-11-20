import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  CircleDollarSign,
  Clock3,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { AgentCard } from "@/components/my-components/dashboard/agents/agent-card";
import { OverviewMetric } from "@/components/my-components/dashboard/overview/overview-metric";
import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import type { Agent } from "@/features/agents/types";

// Compose the live Phase 2 agent overview while clearly separating future payment metrics.
export function DashboardOverview({ agents }: { agents: Agent[] }) {
  const activeCount = agents.filter((agent) => agent.is_active).length;
  const pausedCount = agents.length - activeCount;

  return (
    <div className="mx-auto max-w-[1320px]">
      <DashboardPageHeading
        action={
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neon-purple px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-neon-purple/15 transition-colors hover:bg-neon-magenta"
            href="/agents/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            Create agent
          </Link>
        }
        description="Review your agents and manage their spending boundaries."
        eyebrow="Overview"
        title="Your workspace"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewMetric
          accent="purple"
          icon={Bot}
          label="Total agents"
          note="Your configured payment assistants"
          value={String(agents.length)}
        />
        <OverviewMetric
          accent="green"
          icon={ShieldCheck}
          label="Active agents"
          note="Ready to prepare payment requests"
          value={String(activeCount)}
        />
        <OverviewMetric
          accent="magenta"
          icon={Clock3}
          label="Paused agents"
          note="Inactive until you reactivate them"
          value={String(pausedCount)}
        />
        <OverviewMetric
          icon={CircleDollarSign}
          label="USDC balance"
          note="Available when wallet integration is implemented"
          value="—"
        />
      </div>

      <div className="mt-9 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-magenta">Agent management</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Your agents</h2>
        </div>
        <Link className="inline-flex items-center gap-1.5 text-sm font-medium text-white/55 transition-colors hover:text-neon-magenta" href="/agents">
          View all
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {agents.length === 0 ? (
        <section className="mt-4 rounded-2xl border border-dashed border-white/10 bg-[#17121f]/70 p-8 text-center">
          <p className="text-sm font-medium text-white/75">No agents yet</p>
          <p className="mt-1 text-sm text-white/40">Create an agent to start configuring independent budgets and permissions.</p>
          <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-neon-magenta hover:text-white" href="/agents/new">
            <Plus aria-hidden="true" className="size-4" />
            Create your first agent
          </Link>
        </section>
      ) : (
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {agents.slice(0, 2).map((agent) => <AgentCard agent={agent} key={agent.id} />)}
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/[0.08] bg-[#17121f] p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-magenta">Financial controls</p>
          <h2 className="mt-2 text-base font-semibold text-white">Every agent has its own boundaries</h2>
          <p className="mt-2 text-sm leading-6 text-white/45">
            Budgets, recipient permissions, status, and approval PINs are managed independently per agent.
            No payment is executed by an agent on its own.
          </p>
        </section>
        <section className="rounded-2xl border border-white/[0.08] bg-[#17121f] p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-magenta">Activity</p>
          <h2 className="mt-2 text-base font-semibold text-white">Transaction activity is not connected yet</h2>
          <p className="mt-2 text-sm leading-6 text-white/45">
            Transaction totals and approval counts will appear here after the payment and approval phases.
            This overview does not fabricate balances or history.
          </p>
        </section>
      </div>
    </div>
  );
}
