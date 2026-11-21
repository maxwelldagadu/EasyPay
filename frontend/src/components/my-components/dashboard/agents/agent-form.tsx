"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import type { Agent } from "@/features/agents/types";
import {
  type AgentConfigurationSnapshot,
  useAgentConfigurationStore,
} from "@/stores/agents/agent-configuration-store";
import {
  agentFormSchema,
  createAgentFormSchema,
  type AgentFormValues,
  type CreateAgentFormValues,
} from "@/features/agents/schemas/agent";
import {
  createAgentAction,
  updateAgentAction,
} from "@/server-actions/agents/actions";

interface AgentFormProps {
  agent?: Agent;
}

const fieldClassName =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#10120f] px-3.5 py-3 text-sm text-[#f3f1e8] outline-none transition-colors placeholder:text-white/25 focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/25";

function agentDefaults(agent?: AgentConfigurationSnapshot): AgentFormValues {
  // Keep decimal values as strings so editing does not introduce floating-point rounding.
  return {
    name: agent?.name ?? "",
    description: agent?.description ?? "",
    responsibility: agent?.responsibility ?? "",
    instructions: agent?.instructions ?? "",
    budget_usdc: agent?.budget_usdc ?? "",
    max_transaction_usdc: agent?.max_transaction_usdc ?? "",
    daily_limit_usdc: agent?.daily_limit_usdc ?? "",
    weekly_limit_usdc: agent?.weekly_limit_usdc ?? "",
    monthly_limit_usdc: agent?.monthly_limit_usdc ?? "",
    max_transaction_count: agent?.max_transaction_count?.toString() ?? "",
    approved_recipients: agent?.approved_recipients.join("\n") ?? "",
    restricted_recipients: agent?.restricted_recipients.join("\n") ?? "",
  };
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  // Keep labels and validation messages visually and programmatically associated with each field.
  return (
    <label className="block text-sm font-medium text-white/75">
      {label}
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-300">{error}</span>}
    </label>
  );
}

// Collect the complete agent policy in one validated form while keeping PIN entry creation-only.
export function AgentForm({ agent }: AgentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ message: string; error: boolean } | null>(null);
  const [approvalPin, setApprovalPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const storedConfiguration = useAgentConfigurationStore((state) =>
    agent ? state.configurationsByAgent[agent.id] : undefined,
  );
  const initializeAgentConfiguration = useAgentConfigurationStore(
    (state) => state.initializeAgentConfiguration,
  );
  const currentConfiguration = storedConfiguration ?? agent;
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: agentDefaults(currentConfiguration),
  });
  const { reset } = form;

  useEffect(() => {
    if (agent) initializeAgentConfiguration(agent);
  }, [agent, initializeAgentConfiguration]);

  useEffect(() => {
    if (currentConfiguration) {
      reset(agentDefaults(currentConfiguration), { keepDirtyValues: true });
    }
  }, [currentConfiguration, reset]);

  // Subscribe to dirty fields because React Hook Form uses that subscription to preserve edits on reset.
  void form.formState.dirtyFields;

  function submitConfiguration(values: AgentFormValues) {
    // Validate creation-only PINs before invoking the server action; the server repeats every check.
    if (!agent) {
      const createValues: CreateAgentFormValues = {
        ...values,
        approval_pin: approvalPin,
        confirm_pin: confirmPin,
      };
      const checked = createAgentFormSchema.safeParse(createValues);
      if (!checked.success) {
        setFeedback({ message: checked.error.issues[0]?.message ?? "Check the PIN entries.", error: true });
        return;
      }

      startTransition(async () => {
        // Send the mutation to a server action; no browser code talks directly to persistence.
        const result = await createAgentAction(checked.data);
        setFeedback({ message: result.message, error: !result.ok });
        if (result.ok && result.agentId) {
          router.push(`/agents/${result.agentId}`);
          router.refresh();
        }
      });
      return;
    }

    startTransition(async () => {
      // Edit only the configuration; PIN changes use the separate step-up form.
      const result = await updateAgentAction(agent.id, values);
      setFeedback({ message: result.message, error: !result.ok });
      if (result.ok) router.refresh();
    });
  }

  const errors = form.formState.errors;

  return (
    <form
      className="space-y-7"
      noValidate
      onSubmit={form.handleSubmit(submitConfiguration)}
    >
      <section className="rounded-2xl border border-white/[0.08] bg-[#17121f] p-5 sm:p-7">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-magenta">Identity</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Agent profile</h2>
          <p className="mt-1 text-sm leading-6 text-white/45">
            Define what this agent is called and the responsibility it is assigned.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField error={errors.name?.message} label="Agent name">
            <input
              autoComplete="off"
              className={fieldClassName}
              maxLength={100}
              placeholder="Shopping Assistant"
              {...form.register("name")}
            />
          </FormField>
          <FormField error={errors.responsibility?.message} label="Assigned responsibility">
            <input
              autoComplete="off"
              className={fieldClassName}
              maxLength={160}
              placeholder="Shopping and subscriptions"
              {...form.register("responsibility")}
            />
          </FormField>
          <div className="md:col-span-2">
            <FormField error={errors.description?.message} label="Description">
              <textarea
                className={`${fieldClassName} min-h-24 resize-y`}
                maxLength={1000}
                placeholder="A short overview of what this agent handles."
                {...form.register("description")}
              />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField error={errors.instructions?.message} label="Agent instructions">
              <textarea
                className={`${fieldClassName} min-h-28 resize-y`}
                maxLength={4000}
                placeholder="Describe the boundaries and context this agent should follow."
                {...form.register("instructions")}
              />
            </FormField>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-[#17121f] p-5 sm:p-7">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-magenta">Financial controls</p>
          <h2 className="mt-2 text-lg font-semibold text-white">USDC spending limits</h2>
          <p className="mt-1 text-sm leading-6 text-white/45">
            These values configure the agent’s policy. Backend enforcement is authoritative.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {(
            [
              ["budget_usdc", "Total agent budget"],
              ["max_transaction_usdc", "Maximum per transaction"],
              ["daily_limit_usdc", "Daily spending limit"],
              ["weekly_limit_usdc", "Weekly spending limit"],
              ["monthly_limit_usdc", "Monthly spending limit"],
            ] as const
          ).map(([name, label]) => (
            <FormField error={errors[name]?.message} key={name} label={`${label} (USDC)`}>
              <input
                className={fieldClassName}
                inputMode="decimal"
                placeholder="0.00"
                type="text"
                {...form.register(name)}
              />
            </FormField>
          ))}
          <FormField error={errors.max_transaction_count?.message} label="Maximum transaction count (optional)">
            <input
              className={fieldClassName}
              inputMode="numeric"
              placeholder="No count limit"
              type="text"
              {...form.register("max_transaction_count")}
            />
          </FormField>
          {errors.budget_usdc?.message && (
            <p className="text-xs text-red-300 sm:col-span-2 xl:col-span-3" role="alert">
              {errors.budget_usdc.message}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-[#17121f] p-5 sm:p-7">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-magenta">Permissions</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Recipient access</h2>
          <p className="mt-1 text-sm leading-6 text-white/45">
            Use one 0x wallet address per line. Restricted recipients cannot be approved.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <FormField error={errors.approved_recipients?.message} label="Approved recipients">
            <textarea
              className={`${fieldClassName} min-h-32 resize-y font-mono text-xs`}
              placeholder={"0x1234...\n0xabcd..."}
              spellCheck={false}
              {...form.register("approved_recipients")}
            />
          </FormField>
          <FormField error={errors.restricted_recipients?.message} label="Restricted recipients">
            <textarea
              className={`${fieldClassName} min-h-32 resize-y font-mono text-xs`}
              placeholder="0x..."
              spellCheck={false}
              {...form.register("restricted_recipients")}
            />
          </FormField>
        </div>
      </section>

      {!agent && (
        <section className="rounded-2xl border border-neon-purple/25 bg-neon-purple/[0.07] p-5 sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-magenta">Human authorization</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Create this agent’s private PIN</h2>
          <p className="mt-1 text-sm leading-6 text-white/50">
            This four-digit PIN is sent only to the backend for secure hashing. It is never shown again.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField error={approvalPin.length > 0 && !/^\d{4}$/.test(approvalPin) ? "Enter exactly 4 digits." : undefined} label="Four-digit PIN">
              <input
                autoComplete="new-password"
                className={fieldClassName}
                inputMode="numeric"
                maxLength={4}
                onChange={(event) => setApprovalPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                pattern="\d{4}"
                type="password"
                value={approvalPin}
              />
            </FormField>
            <FormField error={confirmPin.length > 0 && approvalPin !== confirmPin ? "PIN confirmation does not match." : undefined} label="Confirm PIN">
              <input
                autoComplete="new-password"
                className={fieldClassName}
                inputMode="numeric"
                maxLength={4}
                onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                pattern="\d{4}"
                type="password"
                value={confirmPin}
              />
            </FormField>
          </div>
        </section>
      )}

      {feedback && (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.error
              ? "border-red-300/20 bg-red-500/[0.08] text-red-200"
              : "border-emerald-300/20 bg-emerald-500/[0.07] text-emerald-200"
          }`}
          role={feedback.error ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/65 transition-colors hover:bg-white/[0.05] hover:text-white"
          onClick={() => router.push(agent ? `/agents/${agent.id}` : "/agents")}
          type="button"
        >
          Cancel
        </button>
        <button
          aria-busy={isPending}
          className="rounded-xl bg-neon-purple px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-neon-purple/15 transition-colors hover:bg-neon-magenta disabled:cursor-not-allowed disabled:opacity-55"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Saving..." : agent ? "Save agent settings" : "Create agent"}
        </button>
      </div>
    </form>
  );
}
