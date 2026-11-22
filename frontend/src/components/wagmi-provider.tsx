"use client";

import { WagmiProvider } from "wagmi";
import { walletConfig } from "@/lib/wallet";

// Provides wagmi wallet context so any EVM-compatible wallet (MetaMask,
// WalletConnect, Rainbow, Trust Wallet, etc.) can connect across the app.
// Private keys never leave the user's wallet provider.
export function WagmiProviderWrapper({ children }: { children: React.ReactNode }) {
  return <WagmiProvider config={walletConfig()}>{children}</WagmiProvider>;
}