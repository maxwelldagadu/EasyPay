"use server";

import {
  transactionListSchema,
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
