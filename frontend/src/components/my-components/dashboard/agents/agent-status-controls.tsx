"use client";

import { Pause, Play, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteAgentAction,
  setAgentStatusAction,
} from "@/server-actions/agents/actions";

// Keep pause, resume, and delete as explicit user actions that are revalidated on the server.
export function AgentStatusControls({
  agentId,
  isActive,
}: {
  agentId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function updateStatus(nextStatus: boolean) {
    // Ask the server action to persist status; client state never becomes the source of truth.
    setError(null);
    startTransition(async () => {
      const result = await setAgentStatusAction(agentId, nextStatus);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  function deleteAgent() {
    // Require a deliberate confirmation before the backend retires the agent record.
    if (!window.confirm("Delete this agent? It will disappear from management, but its historical records will be retained.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteAgentAction(agentId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.replace("/agents");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          aria-busy={isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
          disabled={isPending}
          onClick={() => updateStatus(!isActive)}
          type="button"
        >
          {isActive ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
          {isActive ? "Pause agent" : "Reactivate"}
        </button>
        <button
          aria-busy={isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-red-300/15 px-4 py-2.5 text-sm font-semibold text-red-200/80 transition-colors hover:border-red-300/35 hover:bg-red-400/[0.07] hover:text-red-100 disabled:opacity-50"
          disabled={isPending}
          onClick={deleteAgent}
          type="button"
        >
          <Trash2 aria-hidden="true" className="size-4" />
          Delete agent
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-300" role="alert">{error}</p>}
    </div>
  );
}
