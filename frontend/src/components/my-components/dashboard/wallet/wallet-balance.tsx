"use client";

import { useQuery } from "@tanstack/react-query";
import { Wallet, RotateCcw } from "lucide-react";

import { useWalletStore } from "@/stores/wallet/wallet-store";
import { getWalletBalanceAction } from "@/features/wallet/services/wallet-service";
import { cn } from "@/lib/utils";

interface WalletBalanceProps {
  address: string | null | undefined;
  className?: string;
}

// Displays only the USDC testnet balance returned by the authenticated backend.
// Native testnet gas is shown separately and is never treated as payment balance.
export function WalletBalance({ address, className }: WalletBalanceProps) {
  const nativeBalance = useWalletStore((state) => state.nativeBalance);
  const {
    data: balanceUsdc,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["wallet-balance", address],
    enabled: Boolean(address),
    queryFn: async () => {
      const result = await getWalletBalanceAction();
      if (!result.ok) {
        throw new Error(result.message);
      }
      return result.data.balanceUsdc;
    },
  });

  return (
    <section className={cn("rounded-3xl border border-white/[0.08] bg-[#17121f] p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neon-magenta">
            <Wallet aria-hidden="true" className="mr-1 size-3.5" />
            Testnet USDC Balance
          </p>
          <p className="mt-1 text-3xl font-semibold text-white">
            {balanceUsdc ?? "—"} USDC
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching || !address}
          aria-label="Refresh wallet balance"
          className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 transition-colors hover:border-neon-purple/50 disabled:opacity-50"
        >
          <RotateCcw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>
      {error && (
        <p role="alert" className="mb-3 text-xs text-red-300">
          {error instanceof Error ? error.message : "Could not refresh the wallet balance."}
        </p>
      )}
      {nativeBalance && (
        <p className="text-xs text-white/45">
          Native testnet gas: {nativeBalance} ETH (gas only, not a payment asset)
        </p>
      )}
    </section>
  );
}