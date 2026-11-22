"use client";

import { useEffect, useState } from "react";
import { List, RefreshCw } from "lucide-react";

import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import { PageSkeleton } from "@/components/my-components/dashboard/transactions/page-skeleton";
import { TransactionRow } from "@/components/my-components/dashboard/transactions/transaction-row";
import { requestAgentApi } from "@/features/agents/services/server-api";
import { z } from "zod";

const transactionSchema = z.object({
  id: z.string(),
  agent_id: z.string(),
  recipient_address: z.string(),
  amount_usdc: z.union([z.string(), z.number()]).transform(String),
  asset: z.string(),
  network: z.string(),
  status: z.string(),
  tx_hash: z.string().nullable(),
  created_at: z.string(),
  confirmed_at: z.string().nullable(),
});

const transactionListSchema = z.array(transactionSchema);

type Transaction = z.infer<typeof transactionSchema>;

export const instant = false;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const response = await requestAgentApi("/payments");
        if (!response.ok) {
          setError(`Failed to load transactions (${response.status})`);
          return;
        }
        const payload = await response.json();
        const parsed = transactionListSchema.safeParse(payload.transactions ?? payload);
        if (parsed.success && mounted) {
          setTransactions(parsed.data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Could not load transactions.");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function refresh() {
    setIsLoading(true);
    try {
      const response = await requestAgentApi("/payments");
      if (!response.ok) {
        setError(`Failed to refresh transactions (${response.status})`);
        return;
      }
      const payload = await response.json();
      const parsed = transactionListSchema.safeParse(payload.transactions ?? payload);
      if (parsed.success) {
        setTransactions(parsed.data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh transactions.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1320px]">
      <DashboardPageHeading
        action={
          <button
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-neon-purple/40"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
        description="Search and filter the full history for your agents. Every row is a real blockchain record — no estimates, no invented balances."
        eyebrow="Payment activity"
        title="Transactions"
      />

      {isLoading ? (
        <PageSkeleton />
      ) : error ? (
        <section className="rounded-2xl border border-red-300/15 bg-red-500/[0.06] p-6">
          <h2 className="font-semibold text-white">Could not load transactions</h2>
          <p className="mt-2 text-sm text-red-100/75">{error}</p>
          <button
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-neon-purple px-4 py-2.5 text-sm font-semibold text-white hover:bg-neon-magenta"
            onClick={refresh}
          >
            <RefreshCw className="size-4" /> Try again
          </button>
        </section>
      ) : transactions.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
          <List aria-hidden="true" className="mx-auto size-8 text-white/20" />
          <h2 className="mt-3 text-sm font-semibold text-white">No transactions yet</h2>
          <p className="mt-2 text-xs text-white/45">
            Approved payments from agent conversations will appear here once
            executed on the testnet.
          </p>
        </section>
      ) : (
        <div className="rounded-3xl border border-white/[0.08] bg-[#17121f] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-[#10120f]/50">
                <th className="px-6 py-4 text-xs font-semibold text-white/45">Agent</th>
                <th className="px-6 py-4 text-xs font-semibold text-white/45">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-white/45">Recipient</th>
                <th className="px-6 py-4 text-xs font-semibold text-white/45">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-white/45">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-white/45">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
