"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WalletConnectionState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  chainName: string | null;
  balanceUsdc: string | null;
  nativeBalance: string | null;
  setConnection: (connection: Partial<WalletConnectionState>) => void;
  setBalance: (balanceUsdc: string, nativeBalance?: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletConnectionState>()(
  persist(
    (set) => ({
      address: null,
      isConnected: false,
      isConnecting: false,
      chainId: null,
      chainName: null,
      balanceUsdc: null,
      nativeBalance: null,
      setConnection: (connection) =>
        set((state) => ({ ...state, ...connection })),
      setBalance: (balanceUsdc, nativeBalance) =>
        set((state) => ({
          balanceUsdc,
          nativeBalance: nativeBalance ?? state.nativeBalance,
        })),
      disconnect: () =>
        set({
          address: null,
          isConnected: false,
          isConnecting: false,
          chainId: null,
          chainName: null,
          balanceUsdc: null,
          nativeBalance: null,
        }),
    }),
    {
      name: "easypay-wallet-storage",
      // Never persist private keys or sensitive wallet material — only public connection state.
      partialize: (state) => ({
        address: state.address,
        isConnected: state.isConnected,
        chainId: state.chainId,
        chainName: state.chainName,
      }),
    }
  )
);