"use client";

import { ShieldCheck } from "lucide-react";

import type { PaymentApproval } from "@/features/approvals/schemas/approval";
import { ApprovalCard } from "@/components/my-components/dashboard/approvals/approval-card";

interface ApprovalListProps {
  approvals: PaymentApproval[];
  isPending: boolean;
  onApprove: (approvalId: string, pin: string) => void;
  onReject: (approvalId: string) => void;
}

export function ApprovalList({
  approvals,
  isPending,
  onApprove,
  onReject,
}: ApprovalListProps) {
  if (approvals.length === 0) {
    // Explain the empty queue and where users can create approval requests.
    return (
      <section className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
        <ShieldCheck aria-hidden="true" className="mx-auto size-8 text-neon-magenta" />
        <h2 className="mt-3 text-sm font-semibold text-white">No approval requests</h2>
        <p className="mt-2 text-xs text-white/45">
          Payment proposals can be converted into approval requests from an agent conversation.
        </p>
      </section>
    );
  }

  // Keep queue layout separate from route state while rendering each payment as an isolated review card.
  return (
    <div className="space-y-4">
      {approvals.map((approval) => (
        <ApprovalCard
          approval={approval}
          isPending={isPending}
          key={approval.id}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
}
