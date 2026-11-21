"use client";

import { useEffect, useState, useTransition } from "react";

import { ApprovalError } from "@/components/my-components/dashboard/approvals/approval-error";
import { ApprovalList } from "@/components/my-components/dashboard/approvals/approval-list";
import { ApprovalPageSkeleton } from "@/components/my-components/dashboard/approvals/approval-page-skeleton";
import { TestnetBalancePanel } from "@/components/my-components/dashboard/approvals/testnet-balance-panel";
import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import {
  approvePaymentAction,
  loadApprovalDashboardAction,
  rejectPaymentAction,
  setTestnetBalanceAction,
} from "@/server-actions/approvals/actions";
import { useApprovalStore } from "@/stores/approvals/approval-store";

// Keep route-level orchestration concise; UI sections live in dedicated approval components.
export default function ApprovalsPage() {
  const approvals = useApprovalStore((state) => state.approvals);
  const balance = useApprovalStore((state) => state.balance);
  const initialize = useApprovalStore((state) => state.initialize);
  const setBalance = useApprovalStore((state) => state.setBalance);
  const upsertApproval = useApprovalStore((state) => state.upsertApproval);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;
    loadApprovalDashboardAction()
      .then((result) => {
        if (!mounted) return;
        if (result.ok) initialize(result.data.approvals, result.data.balance);
        else setError(result.message);
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

  function saveBalance(value: string) {
    setError(null);
    startTransition(async () => {
      const result = await setTestnetBalanceAction(value);
      if (result.ok) setBalance(result.data);
      else setError(result.message);
    });
  }

  function approve(approvalId: string, pin: string) {
    setError(null);
    startTransition(async () => {
      const result = await approvePaymentAction(approvalId, pin);
      if (result.ok) upsertApproval(result.data);
      else setError(result.message);
    });
  }

  function reject(approvalId: string) {
    setError(null);
    startTransition(async () => {
      const result = await rejectPaymentAction(approvalId);
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
      {isLoading ? (
        <ApprovalPageSkeleton />
      ) : (
        <>
          <TestnetBalancePanel
            balance={balance}
            isPending={isPending}
            key={balance?.updated_at ?? "loaded"}
            onSave={saveBalance}
          />
          <ApprovalError message={error} />
          <ApprovalList
            approvals={approvals}
            isPending={isPending}
            onApprove={approve}
            onReject={reject}
          />
        </>
      )}
    </div>
  );
}
