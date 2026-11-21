"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";

import type { TestnetBalance } from "@/features/approvals/schemas/approval";

interface TestnetBalancePanelProps {
  balance: TestnetBalance | null;
  isPending: boolean;
  onSave: (value: string) => void;
}

export function TestnetBalancePanel({
  balance,
  isPending,
  onSave,
}: TestnetBalancePanelProps) {
  const [balanceInput, setBalanceInput] = useState(balance?.balance_usdc ?? "0");

  // Keep the editable test balance local while sending the save operation through its server action.
  return (
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
          onClick={() => onSave(balanceInput)}
          type="button"
        >
          Save
        </button>
      </div>
    </section>
  );
}
