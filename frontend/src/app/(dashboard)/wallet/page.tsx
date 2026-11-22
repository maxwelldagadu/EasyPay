"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { sepolia } from "wagmi/chains";

import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import { WalletConnectButton } from "@/components/my-components/dashboard/wallet/wallet-connect-button";
import { WalletBalance } from "@/components/my-components/dashboard/wallet/wallet-balance";
import { WalletCard } from "@/components/my-components/dashboard/wallet/wallet-card";
import { useWalletStore } from "@/stores/wallet/wallet-store";
import { saveWalletAddressAction } from "@/features/wallet/services/wallet-service";

export const instant = false;

export default function WalletPage() {
  const { address, isConnecting, status } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { isConnected, setConnection, setBalance } = useWalletStore();
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const isWalletConnected = status === "connected";
  const chainName = chainId === sepolia.id ? "Sepolia Testnet" : `Chain ${chainId}`;

  useEffect(() => {
    setConnection({
      address: address ?? null,
      isConnected: isWalletConnected,
      isConnecting,
      chainId,
      chainName,
    });
  }, [address, isConnecting, isWalletConnected, chainId, chainName, setConnection]);

  async function handleAddressSave(addr: string) {
    setIsSaving(true);
    try {
      const result = await saveWalletAddressAction(addr);
      if (result.ok) {
        // Balance is read live from the backend on subsequent requests.
      }
    } catch {
      // Error is surfaced by the action's return value; no silent failures.
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <DashboardPageHeading
        description="Connect any EVM-compatible wallet to view your USDC testnet balance and transaction history."
        eyebrow="Testnet wallet"
        title="Wallet"
      />

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 lg:gap-4">
        <WalletCard
          address={address}
          isConnected={isWalletConnected}
          chainId={chainId}
          chainName={chainName}
          onCopy={(addr) => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="lg:col-span-2 lg:row-span-1"
        />
        <WalletBalance
          address={address}
          onAddressSave={handleAddressSave}
          className="lg:col-span-1 lg:row-span-1"
        />
      </div>

      <div className="mt-8 flex items-center gap-4">
        <WalletConnectButton
          onConnect={() => {}}
          onDisconnect={() => {
            setConnection({
              address: null,
              isConnected: false,
              isConnecting: false,
              chainId: null,
              chainName: null,
              balanceUsdc: null,
              nativeBalance: null,
            });
          }}
        />
        {copied && (
          <p className="text-xs text-neon-magenta">Address copied to clipboard</p>
        )}
      </div>

      {!isWalletConnected && (
        <section className="mt-8 rounded-3xl border border-dashed border-white/10 bg-[#17121f]/70 p-8 text-center">
          <p className="text-sm text-white/45">
            Connect MetaMask, WalletConnect, or any EVM-compatible wallet to
            view your USDC testnet balance. Only USDC is accepted as a payment
            asset; native testnet tokens are reserved for gas fees.
          </p>
        </section>
      )}
    </div>
  );
}
