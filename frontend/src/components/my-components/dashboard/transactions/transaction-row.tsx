"use client";

import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface TransactionRowProps {
  tx: {
    id: string;
    agent_id: string;
    recipient_address: string;
    amount_usdc: string;
    asset: string;
    network: string;
    status: string;
    tx_hash: string | null;
    created_at: string;
    confirmed_at: string | null;
  };
}

// Renders a single on-chain transaction row with status styling and truncation.
export function TransactionRow({ tx }: TransactionRowProps) {
  const statusColor = {
    pending: "text-neon-purple",
    submitted: "text-neon-purple",
    confirmed: "text-emerald-400",
    failed: "text-red-400",
    rejected: "text-red-400",
  }[tx.status as keyof typeof statusColor] || "text-white/45";

  const statusIcon = {
    confirmed: <CheckCircle2 className="size-4 text-emerald-400" />,
    failed: <AlertCircle className="size-4 text-red-400" />,
    rejected: <AlertCircle className="size-4 text-red-400" />,
  }[tx.status as keyof typeof statusIcon] || (
    <Clock className="size-4 text-white/45" />
  );

  const shortHash = tx.tx_hash
    ? `${tx.tx_hash.slice(0, 6)}…${tx.tx_hash.slice(-4)}`
    : "—";
  const shortAddress = `${tx.recipient_address.slice(0, 6)}…${tx.recipient_address.slice(-4)}`;

  return (
    <tr className="group hover:bg-white/[0.02]">
      <td className="px-6 py-4">
        <span className="text-sm text-white">Agent {tx.agent_id.slice(-6)}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-white">{tx.amount_usdc} USDC</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-white/70 font-mono">{shortAddress}</span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 text-xs ${statusColor}`}>
          {statusIcon}
          {tx.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-white/45">
          {new Date(tx.created_at).toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs text-white/45 font-mono">{shortHash}</span>
      </td>
    </tr>
  );
}