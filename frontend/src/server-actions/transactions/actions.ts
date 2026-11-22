"use server";

import { z } from "zod";

import {
  transactionListSchema,
  transactionSchema,
  type Transaction,
} from "@/features/transactions/schemas/transaction";
import {
  AgentApiError,
  getAgentApiError,
  requestAgentApi,
} from "@/features/agents/services/server-api";

export type TransactionActionResult =
  | { ok: true; data: Transaction[] }
  | { ok: false; message: string };

export async function getTransactionsAction(): Promise<TransactionActionResult> {
  try {
    const response = await requestAgentApi("/payments");
    if (!response.ok) {
      return { ok: false, message: await getAgentApiError(response) };
    }

    const payload: unknown = await response.json();
    const transactions =
      typeof payload === "object" && payload !== null && "transactions" in payload
        ? payload.transactions
        : payload;
    const parsed = transactionListSchema.safeParse(transactions);
    if (!parsed.success) {
      return {
        ok: false,
        message: "The transaction service returned an unexpected response.",
      };
    }
    return { ok: true, data: parsed.data };
  } catch (error) {
    if (error instanceof AgentApiError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }
}

export async function executePaymentAction(input: {
  approvalId: string;
  walletAddress: string;
}): Promise<
  | { ok: true; data: Transaction }
  | { ok: false; message: string }
> {
  const parsed = z
    .object({
      approvalId: z.string().min(1).max(100),
      walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid payment execution details." };
  }
  try {
    const response = await requestAgentApi("/payments/execute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        approval_id: parsed.data.approvalId,
        idempotency_key: crypto.randomUUID(),
        wallet_address: parsed.data.walletAddress,
      }),
    });
    if (!response.ok) {
      return { ok: false, message: await getAgentApiError(response) };
    }
    const payload: unknown = await response.json();
    const transaction = transactionSchema.safeParse(payload);
    return transaction.success
      ? { ok: true, data: transaction.data }
      : { ok: false, message: "The payment service returned an invalid transaction." };
  } catch (error) {
    if (error instanceof AgentApiError) return { ok: false, message: error.message };
    throw error;
  }
}

export async function confirmPaymentAction(input: {
  transactionId: string;
  txHash: string;
}): Promise<
  | { ok: true; data: Transaction }
  | { ok: false; message: string }
> {
  const parsed = z
    .object({
      transactionId: z.string().min(1).max(100),
      txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid transaction confirmation details." };
  }
  try {
    const response = await requestAgentApi(
      `/payments/${encodeURIComponent(parsed.data.transactionId)}/confirm?tx_hash=${encodeURIComponent(parsed.data.txHash)}`,
      { method: "POST" },
    );
    if (!response.ok) {
      return { ok: false, message: await getAgentApiError(response) };
    }
    const payload: unknown = await response.json();
    const transaction = transactionSchema.safeParse(payload);
    return transaction.success
      ? { ok: true, data: transaction.data }
      : { ok: false, message: "The payment service returned an invalid transaction." };
  } catch (error) {
    if (error instanceof AgentApiError) return { ok: false, message: error.message };
    throw error;
  }
}
