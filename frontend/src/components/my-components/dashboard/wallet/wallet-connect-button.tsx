"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Wallet, Power, LogOut } from "lucide-react";

interface WalletConnectButtonProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

// Multi-wallet connection button supporting MetaMask, WalletConnect, and any
// EVM-compatible wallet provider. Never exposes private keys to the application.
export function WalletConnectButton({
  onConnect,
  onDisconnect,
}: WalletConnectButtonProps) {
  const { address, isConnecting, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const isConnected = status === "connected";
  const metaMask = connectors.find((c) => c.id === "metaMask");
  const walletConnect = connectors.find((c) => c.id === "walletConnect");

  async function handleConnect(providerId: string) {
    await connect({ connector: connectors.find((c) => c.id === providerId)! });
    onConnect?.();
  }

  if (isConnected && address) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          disconnect();
          onDisconnect?.();
        }}
        className="flex items-center gap-2 text-neon-magenta hover:text-white"
      >
        <LogOut className="size-4" /> Disconnect {address.slice(0, 6)}…{address.slice(-4)}
      </Button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {metaMask && (
        <Button
          onClick={() => handleConnect("metaMask")}
          disabled={isConnecting}
          className="flex items-center gap-2 text-sm"
        >
          <Wallet className="size-4" /> {isConnecting ? "Connecting…" : "MetaMask"}
        </Button>
      )}
      {walletConnect && (
        <Button
          variant="outline"
          onClick={() => handleConnect("walletConnect")}
          disabled={isConnecting}
          className="flex items-center gap-2 text-sm"
        >
          <Power className="size-4" />
          {isConnecting ? "Connecting…" : "WalletConnect"}
        </Button>
      )}
    </div>
  );
}