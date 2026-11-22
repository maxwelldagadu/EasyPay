"use client";

import { Copy, CheckCircle2 } from "lucide-react";

interface WalletCardProps {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  chainName: string | null;
  onCopy: (address: string) => void;
}

// Shows the active wallet address, network, and connection status.
// Address is public on-chain data; no private keys are ever displayed or stored.
export function WalletCard({
  address,
  isConnected,
  chainId,
  chainName,
  onCopy,
}: WalletCardProps) {
  if (!isConnected || !address) {
    return (
      <section className="rounded-3xl border border-dashed border-white/10 bg-[#17121f]/70 p-6 text-center">
        <p className="text-sm text-white/45">No wallet connected</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-[#17121f] p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-neon-purple/20 flex items-center justify-center">
            <CheckCircle2 className="size-5 text-neon-magenta" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Connected wallet</p>
            <p className="text-xs text-neon-magenta">
              {chainName ?? "Testnet"} • Chain {chainId ?? "—"}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(address);
            onCopy(address);
          }}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 transition-colors hover:border-neon-purple/50"
        >
          <Copy className="size-4" /> Copy
        </button>
      </div>
      <div className="font-mono text-xs text-white/60 break-all">
        {address}
      </div>
    </section>
  );
}