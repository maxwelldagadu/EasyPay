"use client";

import { http, createConfig, type Config } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

// EasyPay supports any EVM-compatible wallet: MetaMask, Rainbow, Trust Wallet,
// Coinbase Wallet, Phantom (EVM mode), and more via WalletConnect.
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export function walletConfig(): Config {
  return createConfig({
    chains: [sepolia],
    connectors: [
      injected({ target: "metaMask" }),
      walletConnect({
        projectId,
        metadata: {
          name: "EasyPay",
          description: "AI-powered testnet USDC payment platform",
          url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          icons: [],
        },
      }),
    ],
    transports: {
      [sepolia.id]: http(
        process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL ??
          "https://sepolia.infura.io/v3/"
      ),
    },
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof walletConfig>;
  }
}