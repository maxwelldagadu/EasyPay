"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  changePinFormSchema,
  type ChangePinFormValues,
} from "@/features/agents/schemas/agent";
import { changeAgentPinAction } from "@/server-actions/agents/actions";

const pinInputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#10120f] px-3.5 py-3 font-mono text-sm tracking-[0.3em] text-white outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/25";

// Change a PIN only after the user re-enters the current agent PIN for step-up verification.
export function AgentPinForm({ agentId }: { agentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ message: string; error: boolean } | null>(null);
  const form = useForm<ChangePinFormValues>({
    resolver: zodResolver(changePinFormSchema),
    defaultValues: { current_pin: "", new_pin: "", confirm_pin: "" },
  });

  function submitPin(values: ChangePinFormValues) {
    // Submit secrets directly to the server action and clear all PIN inputs after completion.
    setFeedback(null);
    startTransition(async () => {
      const result = await changeAgentPinAction(agentId, values);
      setFeedback({ message: result.message, error: !result.ok });
      form.reset();
    });
  }

  return (
    <form
      className="rounded-2xl border border-white/[0.08] bg-[#17121f] p-5 sm:p-7"
      noValidate
      onSubmit={form.handleSubmit(submitPin)}
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-magenta">Step-up verification</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Change approval PIN</h2>
        <p className="mt-1 text-sm leading-6 text-white/45">
          Verify the current PIN before replacing it. The new PIN is never returned by the API.
        </p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {(
          [
            ["current_pin", "Current PIN"],
            ["new_pin", "New PIN"],
            ["confirm_pin", "Confirm new PIN"],
          ] as const
        ).map(([name, label]) => (
          <label className="block text-sm font-medium text-white/70" key={name}>
            {label}
            <input
              autoComplete="new-password"
              className={pinInputClass}
              inputMode="numeric"
              maxLength={4}
              type="password"
              {...form.register(name, {
                onChange: (event) => {
                  // Restrict each secret field to four digits without displaying its value.
                  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 4);
                },
              })}
            />
            {form.formState.errors[name]?.message && (
              <span className="mt-1 block text-xs text-red-300">{form.formState.errors[name]?.message}</span>
            )}
          </label>
        ))}
      </div>
      {feedback && (
        <p
          className={`mt-4 text-sm ${feedback.error ? "text-red-300" : "text-emerald-200"}`}
          role={feedback.error ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      )}
      <button
        aria-busy={isPending}
        className="mt-5 rounded-xl border border-neon-purple/35 px-4 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-neon-purple/15 disabled:opacity-50"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Updating PIN..." : "Update approval PIN"}
      </button>
    </form>
  );
}
