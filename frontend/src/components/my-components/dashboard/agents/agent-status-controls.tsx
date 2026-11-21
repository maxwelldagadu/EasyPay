"use client";

import { Pause, Play, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

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
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  function requestDelete() {
    setDeleteError(null);
    deleteDialogRef.current?.showModal();
  }

  function deleteAgent() {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteAgentAction(agentId);
      if (!result.ok) {
        setDeleteError(result.message);
        return;
      }
      deleteDialogRef.current?.close();
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
          onClick={requestDelete}
          type="button"
        >
          <Trash2 aria-hidden="true" className="size-4" />
          Delete agent
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-300" role="alert">{error}</p>}
      <dialog
        aria-describedby="delete-agent-description"
        aria-labelledby="delete-agent-title"
        aria-modal="true"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-white/10 bg-[#17121f] p-0 text-[#f3f1e8] shadow-2xl backdrop:bg-black/70"
        onCancel={(event) => {
          if (isPending) {
            event.preventDefault();
          } else {
            setDeleteError(null);
          }
        }}
        ref={deleteDialogRef}
      >
        <div className="p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-400/[0.1] text-red-200">
              <Trash2 aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white" id="delete-agent-title">
                Delete this agent?
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/55" id="delete-agent-description">
                It will be removed from management, but its historical records will be retained.
                This action cannot be undone.
              </p>
            </div>
          </div>
          {deleteError && (
            <p className="mt-4 text-sm text-red-300" role="alert">
              {deleteError}
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
              onClick={() => {
                setDeleteError(null);
                deleteDialogRef.current?.close();
              }}
              type="button"
            >
              Cancel
            </button>
            <button
              aria-busy={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-400/[0.1] px-4 py-2.5 text-sm font-semibold text-red-100 transition-colors hover:bg-red-400/[0.18] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
              onClick={deleteAgent}
              type="button"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              {isPending ? "Deleting..." : "Delete agent"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
