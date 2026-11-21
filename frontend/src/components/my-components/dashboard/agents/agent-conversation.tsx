"use client";

import { Bot, Check, LoaderCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import type {
  ConfigurationProposal,
  ConversationMessage,
  PaymentProposal,
} from "@/features/agents/schemas/conversation";
import type { Agent } from "@/features/agents/types";
import {
  type AgentConfigurationSnapshot,
  useAgentConfigurationStore,
} from "@/stores/agents/agent-configuration-store";
import {
  applyAgentConfigurationProposalAction,
  dismissAgentConfigurationProposalAction,
  loadAgentConversationAction,
  sendAgentConversationMessageAction,
} from "@/server-actions/agents/conversation-actions";

const fieldLabels: Record<keyof AgentConfigurationSnapshot, string> = {
  name: "Agent name",
  description: "Description",
  responsibility: "Responsibility",
  instructions: "Instructions",
  budget_usdc: "Total budget",
  max_transaction_usdc: "Maximum transaction",
  daily_limit_usdc: "Daily limit",
  weekly_limit_usdc: "Weekly limit",
  monthly_limit_usdc: "Monthly limit",
  max_transaction_count: "Maximum transaction count",
  approved_recipients: "Approved recipients",
  restricted_recipients: "Restricted recipients",
};

function isConfigurationField(field: string): field is keyof AgentConfigurationSnapshot {
  return Object.hasOwn(fieldLabels, field);
}

function displayConfigurationValue(value: unknown): string {
  // Render structured proposed values clearly without assuming values are simple strings.
  if (value === null) return "No limit";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "None";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function PaymentProposalCard({ proposal }: { proposal: PaymentProposal }) {
  // Present server-checked fields separately from warnings and never imply payment authorization.
  const isBlocked = proposal.status === "blocked";
  return (
    <section className="mt-4 rounded-xl border border-white/[0.08] bg-[#10120f]/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">Payment proposal</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            isBlocked
              ? "bg-red-400/[0.1] text-red-200"
              : proposal.status === "incomplete"
                ? "bg-amber-400/[0.1] text-amber-200"
                : "bg-neon-purple/15 text-neon-magenta"
          }`}
        >
          {isBlocked
            ? "Blocked by policy"
            : proposal.status === "incomplete"
              ? "Needs details"
              : "Proposal only"}
        </span>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-xs text-white/40">Amount</dt>
          <dd className="mt-1 break-all font-semibold text-white">
            {proposal.amount_usdc ?? "Not provided"} {proposal.asset}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-white/40">Network</dt>
          <dd className="mt-1 text-white">{proposal.network} testnet</dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-xs text-white/40">Recipient</dt>
          <dd className="mt-1 break-all font-mono text-xs text-white/80">
            {proposal.recipient_address ?? "Not provided"}
          </dd>
        </div>
      </dl>
      {proposal.checks.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-emerald-200">Policy checks</p>
          <ul className="mt-1 space-y-1 text-xs leading-5 text-white/55">
            {proposal.checks.map((check) => <li key={check}>{check}</li>)}
          </ul>
        </div>
      )}
      {proposal.issues.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs leading-5 text-red-200/85">
          {proposal.issues.map((issue) => <li key={issue}>{issue}</li>)}
        </ul>
      )}
      {proposal.warnings.map((warning) => (
        <p className="mt-3 text-xs leading-5 text-amber-100/70" key={warning}>
          {warning}
        </p>
      ))}
    </section>
  );
}

function ConfigurationProposalCard({
  message,
  proposal,
  currentConfiguration,
  isPending,
  onApply,
  onDismiss,
}: {
  message: ConversationMessage;
  proposal: ConfigurationProposal;
  currentConfiguration: AgentConfigurationSnapshot;
  isPending: boolean;
  onApply: (message: ConversationMessage) => void;
  onDismiss: (message: ConversationMessage) => void;
}) {
  // Keep configuration changes pending until the owner explicitly applies or dismisses them.
  const isAwaitingReview = message.proposal_status === "pending";
  return (
    <section className="mt-4 rounded-xl border border-neon-purple/25 bg-[#10120f]/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">Configuration proposal</h3>
        {!isAwaitingReview && (
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-white/55">
            {message.proposal_status === "applied" ? "Applied" : "Dismissed"}
          </span>
        )}
      </div>
      <dl className="mt-3 space-y-3">
        {Object.keys(proposal.changes).filter(isConfigurationField).map((field) => {
          const value = proposal.changes[field];
          const currentValue = message.proposal_status === "applied"
            ? currentConfiguration[field]
            : proposal.current_values[field];
          return (
            <div className="grid gap-1 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0" key={field}>
              <dt className="text-xs font-medium text-white/45">{fieldLabels[field]}</dt>
              <dd className="grid gap-2 text-sm sm:grid-cols-2">
                <span className="min-w-0 break-words text-white/50">
                  <span className="mb-1 block text-[10px] uppercase tracking-wide text-white/30">Current</span>
                  {displayConfigurationValue(currentValue)}
                  {field.endsWith("_usdc") ? " USDC" : ""}
                </span>
                <span className="min-w-0 break-words font-medium text-white/90">
                  <span className="mb-1 block text-[10px] uppercase tracking-wide text-neon-magenta">Proposed</span>
                  {displayConfigurationValue(value)}
                  {field.endsWith("_usdc") ? " USDC" : ""}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
      {isAwaitingReview && (
        <>
          <p className="mt-4 text-xs leading-5 text-amber-100/70">
            These values are not applied until you confirm. The backend revalidates the full agent policy.
          </p>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 transition-colors hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
              onClick={() => onDismiss(message)}
              type="button"
            >
              <X aria-hidden="true" className="size-3.5" />
              Dismiss
            </button>
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-neon-purple px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-neon-magenta disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
              onClick={() => onApply(message)}
              type="button"
            >
              {isPending ? <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" /> : <Check aria-hidden="true" className="size-3.5" />}
              Apply these changes
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export function AgentConversation({
  agent,
}: {
  agent: Agent;
}) {
  const agentId = agent.id;
  const storedConfiguration = useAgentConfigurationStore(
    (state) => state.configurationsByAgent[agentId],
  );
  const currentConfiguration = storedConfiguration ?? agent;
  const initializeAgentConfiguration = useAgentConfigurationStore(
    (state) => state.initializeAgentConfiguration,
  );
  const applyAgentConfiguration = useAgentConfigurationStore(
    (state) => state.applyAgentConfiguration,
  );
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeAgentConfiguration(agent);
  }, [agent, initializeAgentConfiguration]);

  useEffect(() => {
    let isMounted = true;
    loadAgentConversationAction(agentId)
      .then((result) => {
        if (!isMounted) return;
        if (result.ok) {
          setMessages(result.data);
        } else {
          setError(result.message);
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load agent conversation.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [agentId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isPending]);

  function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = messageText.trim();
    if (!message || isPending) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await sendAgentConversationMessageAction(agentId, message);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setMessages((current) => [
          ...current,
          result.data.user_message,
          result.data.assistant_message,
        ]);
        setMessageText("");
      } catch (sendError) {
        setError(sendError instanceof Error ? sendError.message : "Could not send this message.");
      }
    });
  }

  function updateProposal(
    message: ConversationMessage,
    action: "apply" | "dismiss",
  ) {
    const messageId = message.id;
    setError(null);
    startTransition(async () => {
      try {
        const result = action === "apply"
          ? await applyAgentConfigurationProposalAction(agentId, messageId)
          : await dismissAgentConfigurationProposalAction(agentId, messageId);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        if (action === "apply") {
          const appliedProposal = result.data.proposal;
          if (appliedProposal?.type !== "configuration") {
            setError("The applied configuration response was invalid.");
            return;
          }
          applyAgentConfiguration(agent, appliedProposal.changes);
        }
        setMessages((current) =>
          current.map((message) => message.id === result.data.id ? result.data : message),
        );
      } catch (proposalError) {
        setError(proposalError instanceof Error ? proposalError.message : "Could not update this proposal.");
      }
    });
  }

  const summaryItems = [
    { label: "Total budget", value: currentConfiguration.budget_usdc, unit: "USDC" },
    { label: "Per transaction", value: currentConfiguration.max_transaction_usdc, unit: "USDC" },
    { label: "Daily limit", value: currentConfiguration.daily_limit_usdc, unit: "USDC" },
    { label: "Weekly limit", value: currentConfiguration.weekly_limit_usdc, unit: "USDC" },
    { label: "Monthly limit", value: currentConfiguration.monthly_limit_usdc, unit: "USDC" },
    {
      label: "Transaction count",
      value: currentConfiguration.max_transaction_count === null
        ? "No limit"
        : String(currentConfiguration.max_transaction_count),
      unit: "",
    },
  ];

  return (
    <section className="mb-7 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#17121f]">
      <header className="flex items-start gap-3 border-b border-white/[0.07] p-5 sm:p-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-neon-purple/15 text-neon-magenta">
          <Bot aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-magenta">
            Agent conversation
          </p>
          <h2 className="mt-1 break-words text-lg font-semibold text-white">{currentConfiguration.name}</h2>
          <p className="mt-1 text-xs leading-5 text-white/45">
            Proposals are checked against this agent&apos;s policy. Chat cannot approve or execute payments.
          </p>
          <p className="mt-1 text-xs leading-5 text-white/35">
            Your messages and non-secret agent are interpreted by AI.
          </p>
        </div>
      </header>

      <section
        aria-label="Current agent policy summary"
        className="grid grid-cols-2 gap-3 border-b border-white/[0.07] bg-[#10120f]/60 p-4 sm:grid-cols-3 sm:p-5 lg:grid-cols-6"
      >
        {summaryItems.map(({ label, value, unit }) => (
          <div className="min-w-0 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2" key={label}>
            <p className="truncate text-[10px] uppercase tracking-wide text-white/35">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold text-white/85">
              {value}{unit ? ` ${unit}` : ""}
            </p>
          </div>
        ))}
      </section>

      <div
        aria-live="polite"
        aria-relevant="additions text"
        className="agent-conversation-scroll max-h-[34rem] min-h-52 space-y-4 overflow-y-auto p-4 sm:p-6"
        role="log"
      >
        {isLoading ? (
          <p className="flex items-center gap-2 py-4 text-sm text-white/45">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Loading conversation...
          </p>
        ) : messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center">
            <p className="text-sm font-medium text-white/75">Start with a request for {currentConfiguration.name}</p>
            <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-white/45">
              Ask for a USDC payment proposal or describe a budget change. Never include a PIN,
              private key, or recovery phrase.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                "Prepare a proposal to send 25 USDC",
                "Increase my monthly budget to 800 USDC",
              ].map((example) => (
                <button
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
                  key={example}
                  onClick={() => setMessageText(example)}
                  type="button"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <article
              aria-label={message.role === "user" ? "Your message" : `${currentConfiguration.name} response`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              key={message.id}
            >
              <div className="min-w-0 max-w-[95%] sm:max-w-[88%]">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "rounded-br-md bg-neon-purple/20 text-white"
                      : "rounded-bl-md border border-white/[0.06] bg-[#10120f] text-white/80"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                {message.proposal?.type === "payment" && (
                  <PaymentProposalCard proposal={message.proposal} />
                )}
                {message.proposal?.type === "configuration" && (
                  <ConfigurationProposalCard
                    currentConfiguration={currentConfiguration}
                    isPending={isPending}
                    message={message}
                    onApply={(proposalMessage) => updateProposal(proposalMessage, "apply")}
                    onDismiss={(proposalMessage) => updateProposal(proposalMessage, "dismiss")}
                    proposal={message.proposal}
                  />
                )}
              </div>
            </article>
          ))
        )}
        {isPending && (
          <p className="flex items-center gap-2 text-xs text-white/40">
            <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
            Preparing a policy-checked response...
          </p>
        )}
        <div ref={messageEndRef} />
      </div>

      {error && (
        <p className="mx-4 rounded-xl border border-red-300/15 bg-red-500/[0.07] px-4 py-3 text-sm text-red-200 sm:mx-6" role="alert">
          {error}
        </p>
      )}

      <form className="border-t border-white/[0.07] p-4 sm:p-6" onSubmit={submitMessage}>
        <label className="sr-only" htmlFor={`agent-message-${agentId}`}>
          Message {currentConfiguration.name}
        </label>
        <textarea
          className="min-h-24 w-full resize-y rounded-xl border border-white/10 bg-[#10120f] px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/25 focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/25"
          disabled={isPending}
          id={`agent-message-${agentId}`}
          maxLength={2000}
          onChange={(event) => setMessageText(event.target.value)}
          placeholder={`Ask ${currentConfiguration.name} about a USDC proposal or budget change...`}
          value={messageText}
        />
        <div className="mt-3 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs leading-5 text-white/35">
            USDC testnet proposals only. Never enter PINs or wallet secrets.
          </p>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-neon-purple px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neon-magenta disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending || !messageText.trim()}
            type="submit"
          >
            {isPending ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Send aria-hidden="true" className="size-4" />
            )}
            {isPending ? "Working..." : "Send message"}
          </button>
        </div>
      </form>
    </section>
  );
}
