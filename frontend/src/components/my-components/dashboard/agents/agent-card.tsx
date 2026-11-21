import Link from "next/link";
import { ArrowUpRight, Bot, ShieldCheck, WalletCards } from "lucide-react";

import type { Agent } from "@/features/agents/types";

function formatUsdc(amount: string): string {
  // Group the exact decimal string without converting financial values through floating-point math.
  const [wholePart, fractionPart = ""] = amount.split(".");
  const groupedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fraction = fractionPart.replace(/0+$/, "").padEnd(2, "0");
  return `${groupedWhole}.${fraction}`;
}

// Show each agent's actual configuration and status without implying transaction activity exists.
export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <article className="group rounded-2xl border border-white/[0.08] bg-[#17121f] p-5 transition-all hover:-translate-y-0.5 hover:border-neon-purple/30 hover:shadow-xl hover:shadow-black/20 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon-purple/25 to-neon-magenta/10 text-neon-magenta">
            <Bot aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <Link
              className="inline-flex max-w-full items-center gap-1.5 text-base font-semibold text-white transition-colors hover:text-neon-magenta"
              href={`/agents/${agent.id}`}
            >
              <span className="truncate">{agent.name}</span>
              <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <p className="mt-1 truncate text-xs text-white/45">{agent.responsibility}</p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            agent.is_active
              ? "border border-emerald-300/15 bg-emerald-400/[0.08] text-emerald-200"
              : "border border-white/10 bg-white/[0.04] text-white/50"
          }`}
        >
          <span className={`size-1.5 rounded-full ${agent.is_active ? "bg-emerald-300" : "bg-white/35"}`} />
          {agent.is_active ? "Active" : "Paused"}
        </span>
      </div>

      <p className="mt-5 min-h-10 text-sm leading-5 text-white/50">
        {agent.description || "No description added yet."}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-white/40">
            <WalletCards aria-hidden="true" className="size-3.5 text-neon-magenta" />
            Total budget
          </div>
          <p className="mt-2 break-all font-google-sans text-base font-semibold text-white sm:text-lg">
            {formatUsdc(agent.budget_usdc)} <span className="text-xs font-medium text-white/45">USDC</span>
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-white/40">
            <ShieldCheck aria-hidden="true" className="size-3.5 text-neon-magenta" />
            Max transaction
          </div>
          <p className="mt-2 break-all font-google-sans text-base font-semibold text-white sm:text-lg">
            {formatUsdc(agent.max_transaction_usdc)} <span className="text-xs font-medium text-white/45">USDC</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4 text-xs text-white/40">
        <span>{agent.approved_recipients.length} approved recipient{agent.approved_recipients.length === 1 ? "" : "s"}</span>
        <span>Created {new Date(agent.created_at).toLocaleDateString()}</span>
      </div>
    </article>
  );
}
