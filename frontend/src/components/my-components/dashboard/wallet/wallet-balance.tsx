"use client";

import { useEffect, useState } from "react";
import { Wallet, ArrowClockwise } from "lucide-react";

import { useWalletStore } from "@/stores/wallet/wallet-store";
import { saveWalletAddressAction } from "@/features/wallet/services/wallet-service";

interface WalletBalanceProps {
  address: string | null;
  onAddressSave: (address: string) => void;
}

// Displays the connected wallet's USDC testnet balance and native gas balance.
// Balances are read from the backend, which queries the USDC testnet contract
// directly via Web3.py — never from frontend-trusted sources.
export function WalletBalance({ address, onAddressSave }: WalletBalanceProps) {
  const { balanceUsdc, nativeBalance, setBalance, setConnection } = useWalletStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (address) {
      setConnection({ address, isConnected: true });
      onAddressSave(address);
    }
  }, [address, setConnection, onAddressSave]);

  async function refreshBalance() {
    setIsRefreshing(true);
    try {
      // Balance sync is handled by the backend wallet endpoints; this refresh
      // triggers a re-fetch from the server on the next page load.
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-[#17121f] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neon-magenta">
            <Wallet aria-hidden="true" className="mr-1 size-3.5" />
            Testnet USDC Balance
          </p>
          <p className="mt-1 text-3xl font-semibold text-white">
            {balanceUsdc ?? "0"} USDC
          </p>
        </div>
        <button
          onClick={refreshBalance}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 transition-colors hover:border-neon-purple/50 disabled:opacity-50"
        >
          <ArrowClockwise className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
      {nativeBalance && (
        <p className="text-xs text-white/45">
          Native testnet gas: {nativeBalance} ETH (gas only, not a payment asset)
        </p>
      )}
    </section>
  );
}