"use client";

import { useEffect, useState, useTransition } from "react";
import { LoaderCircle, ShieldCheck, Wallet } from "lucide-react";

import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import type { PaymentApproval } from "@/features/approvals/schemas/approval";
import {
  approvePaymentAction,
  loadApprovalDashboardAction,
  rejectPaymentAction,
  setTestnetBalanceAction,
} from "@/server-actions/approvals/actions";
import { useApprovalStore } from "@/stores/approvals/approval-store";

// Keep Phase 4 approval state in the feature store and perform every mutation through a server action.
export default function ApprovalsPage() {
  const approvals = useApprovalStore((state) => state.approvals);
  const balance = useApprovalStore((state) => state.balance);
  const initialize = useApprovalStore((state) => state.initialize);
  const setBalance = useApprovalStore((state) => state.setBalance);
  const upsertApproval = useApprovalStore((state) => state.upsertApproval);
  const [balanceInput, setBalanceInput] = useState("0");
  const [pins, setPins] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;
    loadApprovalDashboardAction()
      .then((result) => {
        if (!mounted) return;
        if (result.ok) {
          initialize(result.data.approvals, result.data.balance);
          setBalanceInput(result.data.balance.balance_usdc);
        } else {
          setError(result.message);
        }
      })
      .catch((loadError: unknown) => {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load approvals.");
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [initialize]);

  function saveBalance() {
    setError(null);
    startTransition(async () => {
      const result = await setTestnetBalanceAction(balanceInput);
      if (result.ok) setBalance(result.data);
      else setError(result.message);
    });
  }

  function decide(approval: PaymentApproval, action: "approve" | "reject") {
    setError(null);
    startTransition(async () => {
      const result = action === "approve"
        ? await approvePaymentAction(approval.id, pins[approval.id] ?? "")
        : await rejectPaymentAction(approval.id);
      if (result.ok) upsertApproval(result.data);
      else setError(result.message);
    });
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <DashboardPageHeading
        description="Review proposed transactions and authorize each payment explicitly."
        eyebrow="Financial controls"
        title="Payment approvals"
      />

      <section className="mb-6 grid gap-4 rounded-2xl border border-white/[0.08] bg-[#17121f] p-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-neon-magenta">
            <Wallet aria-hidden="true" className="size-4" />
            Testnet USDC balance
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {balance?.balance_usdc ?? "0"} USDC
          </p>
          <p className="mt-1 text-xs text-white/45">
            Balance is validated on the backend. This manual source is temporary until Phase 5 wallet synchronization.
          </p>
        </div>
        <div className="flex gap-2">
          <label className="sr-only" htmlFor="testnet-usdc-balance">Testnet USDC balance</label>
          <input
            className="h-11 w-36 rounded-xl border border-white/10 bg-[#10120f] px-3 text-sm text-white outline-none focus:border-neon-purple"
            id="testnet-usdc-balance"
            inputMode="decimal"
            onChange={(event) => setBalanceInput(event.target.value)}
            value={balanceInput}
          />
          <button
            className="h-11 rounded-xl bg-neon-purple px-4 text-sm font-semibold text-white disabled:opacity-50"
            disabled={isPending}
            onClick={saveBalance}
            type="button"
          >
            Save
          </button>
        </div>
      </section>

      {error && (
        <p className="mb-4 rounded-xl border border-red-300/15 bg-red-500/[0.07] px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-white/45">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          Loading approval requests...
        </p>
      ) : approvals.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
          <ShieldCheck aria-hidden="true" className="mx-auto size-8 text-neon-magenta" />
          <h2 className="mt-3 text-sm font-semibold text-white">No approval requests</h2>
          <p className="mt-2 text-xs text-white/45">Payment proposals can be converted into approval requests from an agent conversation.</p>
        </section>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => {
            const pending = approval.status === "pending";
            return (
              <article className="rounded-2xl border border-white/[0.08] bg-[#17121f] p-5" key={approval.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-neon-magenta">{approval.agent_name}</p>
                    <h2 className="mt-1 text-lg font-semibold text-white">
                      {approval.amount_usdc} {approval.asset}
                    </h2>
                  </div>
                  <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs capitalize text-white/65">
                    {approval.status}
                  </span>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-white/40">Recipient</dt>
                    <dd className="mt-1 break-all font-mono text-xs text-white/75">{approval.recipient_address}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-white/40">Network</dt>
                    <dd className="mt-1 text-white/75">{approval.network} testnet</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-white/40">Available balance</dt>
                    <dd className="mt-1 text-white/75">{approval.available_balance_usdc} USDC</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-white/40">Remaining agent budget</dt>
                    <dd className="mt-1 text-white/75">{approval.remaining_budget_usdc} USDC</dd>
                  </div>
                </dl>

                {pending && (
                  <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.07] pt-4 sm:flex-row sm:items-end">
                    <label className="grow text-xs text-white/45">
                      Agent approval PIN
                      <input
                        aria-label={`Approval PIN for ${approval.agent_name}`}
                        className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#10120f] px-3 text-center text-sm tracking-[0.35em] text-white outline-none focus:border-neon-purple sm:w-44"
                        inputMode="numeric"
                        maxLength={4}
                        onChange={(event) =>
                          setPins((current) => ({
                            ...current,
                            [approval.id]: event.target.value.replace(/\D/g, "").slice(0, 4),
                          }))
                        }
                        type="password"
                        value={pins[approval.id] ?? ""}
                      />
                    </label>
                    <button
                      className="h-11 rounded-xl bg-neon-purple px-4 text-sm font-semibold text-white disabled:opacity-50"
                      disabled={isPending || (pins[approval.id]?.length ?? 0) !== 4}
                      onClick={() => decide(approval, "approve")}
                      type="button"
                    >
                      Approve
                    </button>
                    <button
                      className="h-11 rounded-xl border border-white/10 px-4 text-sm font-semibold text-white/65 disabled:opacity-50"
                      disabled={isPending}
                      onClick={() => decide(approval, "reject")}
                      type="button"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
