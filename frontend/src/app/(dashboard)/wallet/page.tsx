"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";

import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import { WalletConnectButton } from "@/components/my-components/dashboard/wallet/wallet-connect-button";
import { WalletBalance } from "@/components/my-components/dashboard/wallet/wallet-balance";
import { WalletCard } from "@/components/my-components/dashboard/wallet/wallet-card";
import { WagmiProviderWrapper } from "@/components/wagmi-provider";
import { useWalletStore } from "@/stores/wallet/wallet-store";
import { saveWalletAddressAction } from "@/features/wallet/services/wallet-service";

export default function WalletPage() {
  return (
    <WagmiProviderWrapper>
      <WalletPageContent />
    </WagmiProviderWrapper>
  );
}

function WalletPageContent() {
  const { address, isConnecting, status } = useAccount();
  const chainId = useChainId();
  const setConnection = useWalletStore((state) => state.setConnection);
  const [copied, setCopied] = useState(false);
  const [walletSaveError, setWalletSaveError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!address) return;
    let active = true;
    saveWalletAddressAction(address)
      .then((result) => {
        if (!active) return;
        setWalletSaveError(result.ok ? null : result.message);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setWalletSaveError(
          error instanceof Error ? error.message : "Could not save the wallet address.",
        );
      });
    return () => {
      active = false;
    };
  }, [address]);

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
          onCopy={() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="lg:col-span-2 lg:row-span-1"
        />
        <WalletBalance
          address={address}
          className="lg:col-span-1 lg:row-span-1"
        />
      </div>

      {walletSaveError && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          Could not save wallet address: {walletSaveError}
        </p>
      )}

      <div className="mt-8 flex items-center gap-4">
        <WalletConnectButton
          onDisconnect={() => {
            setWalletSaveError(null);
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
