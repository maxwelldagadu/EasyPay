"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";

import type { PaymentApproval } from "@/features/approvals/schemas/approval";

interface ApprovalCardProps {
  approval: PaymentApproval;
  isPending: boolean;
  isApproving: boolean;
  onApprove: (approvalId: string, pin: string) => void;
  onReject: (approvalId: string) => void;
}

export function ApprovalCard({
  approval,
  isPending,
  isApproving,
  onApprove,
  onReject,
}: ApprovalCardProps) {
  const [pin, setPin] = useState("");
  const isAwaitingApproval = approval.status === "pending";

  // Keep PIN entry local to its transaction and never place it in shared approval state.
  return (
    <article className="rounded-2xl border border-white/[0.08] bg-[#17121f] p-5">
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

      {isAwaitingApproval && (
        <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.07] pt-4 sm:flex-row sm:items-end">
          <label className="grow text-xs text-white/45">
            Agent approval PIN
            <input
              aria-label={`Approval PIN for ${approval.agent_name}`}
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#10120f] px-3 text-center text-sm tracking-[0.35em] text-white outline-none focus:border-neon-purple sm:w-44"
              inputMode="numeric"
              maxLength={4}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
              type="password"
              value={pin}
            />
          </label>
          <button
            aria-busy={isApproving}
            className="h-11 rounded-xl bg-neon-purple px-4 text-sm font-semibold text-white disabled:opacity-50"
            disabled={isPending || pin.length !== 4}
            onClick={() => onApprove(approval.id, pin)}
            type="button"
          >
            {isApproving ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                Approving...
              </span>
            ) : "Approve"}
          </button>
          <button
            className="h-11 rounded-xl border border-white/10 px-4 text-sm font-semibold text-white/65 disabled:opacity-50"
            disabled={isPending}
            onClick={() => onReject(approval.id)}
            type="button"
          >
            Reject
          </button>
        </div>
      )}
    </article>
  );
}
