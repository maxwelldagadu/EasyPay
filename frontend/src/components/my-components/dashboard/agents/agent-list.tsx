import Link from "next/link";
import { Bot, Plus } from "lucide-react";

import { AgentCard } from "@/components/my-components/dashboard/agents/agent-card";
import type { Agent } from "@/features/agents/types";

// Present creation, empty, and populated agent states without inventing spending history.
export function AgentList({ agents }: { agents: Agent[] }) {
  if (agents.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-white/10 bg-[#17121f]/70 px-6 py-16 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-neon-purple/15 text-neon-magenta">
          <Bot aria-hidden="true" className="size-7" />
        </span>
        <h2 className="mt-5 text-lg font-semibold text-white">Create your first payment agent</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
          Give an agent a clear responsibility, set its USDC boundaries, and choose its own approval PIN.
        </p>
        <Link
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neon-purple px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-neon-magenta"
          href="/agents/new"
        >
          <Plus aria-hidden="true" className="size-4" />
          Create an agent
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {agents.map((agent) => <AgentCard agent={agent} key={agent.id} />)}
    </div>
  );
}
