"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type Config } from "wagmi";
import { walletConfig } from "@/lib/wallet";

const subscribeToHydration = () => () => {};

// Keep wallet connector initialization browser-only because WalletConnect uses IndexedDB.
export function WagmiProviderWrapper({ children }: { children: React.ReactNode }) {
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const config = useMemo<Config | null>(
    () => (isHydrated ? walletConfig() : null),
    [isHydrated],
  );
  const [queryClient] = useState(() => new QueryClient());

  if (!config) {
    return (
      <div className="mx-auto mt-8 h-40 w-full max-w-[1100px] animate-pulse rounded-3xl bg-white/5" />
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}