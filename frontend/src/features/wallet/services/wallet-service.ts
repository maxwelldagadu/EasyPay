"use server";

import { z } from "zod";

import { walletAddressSchema, usdcAmountSchema } from "@/features/wallet/schemas/wallet";
import { AgentApiError, requestAgentApi } from "@/features/agents/services/server-api";

export type WalletActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

const walletAddressInputSchema = z.object({
  address: walletAddressSchema,
});

export async function saveWalletAddressAction(
  address: unknown
): Promise<WalletActionResult<{ address: string }>> {
  // Persist the connected wallet address for the authenticated user so balance
  // and transaction history remain owner-scoped across sessions.
  const parsed = walletAddressInputSchema.safeParse({ address });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid wallet address." };
  }
  try {
    const response = await requestAgentApi("/wallet/address", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ wallet_address: parsed.data.address }),
    });
    if (!response.ok) {
      return { ok: false, message: await getWalletApiError(response) };
    }
    const payload = await response.json();
    return { ok: true, data: { address: payload.address } };
  } catch (error) {
    if (error instanceof AgentApiError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }
}

export async function getWalletAddressAction(): Promise<
  WalletActionResult<{ address: string | null }>
> {
  try {
    const response = await requestAgentApi("/wallet/address");
    if (!response.ok) {
      return { ok: false, message: await getWalletApiError(response) };
    }
    const payload = await response.json();
    return { ok: true, data: { address: payload.address ?? null } };
  } catch (error) {
    if (error instanceof AgentApiError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }
}

async function getWalletApiError(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json();
    if (
      typeof payload === "object" &&
      payload !== null &&
      "detail" in payload &&
      typeof payload.detail === "string"
    ) {
      return payload.detail;
    }
  } catch {
    // Non-JSON responses surface their HTTP status.
  }
  return `Wallet request failed (${response.status}).`;
}