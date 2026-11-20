import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AgentForm } from "@/components/my-components/dashboard/agents/agent-form";
import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";

// This protected page is gated by the request-time Better Auth session in its parent layout.
export const instant = false;

// Give agent creation its own route so policy setup remains focused and easy to revisit.
export default function NewAgentPage() {
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
        description="Every agent has an independent identity, USDC policy, recipient permissions, and four-digit approval PIN."
        eyebrow="New agent"
        title="Create an agent"
      />
      <AgentForm />
    </div>
  );
}
