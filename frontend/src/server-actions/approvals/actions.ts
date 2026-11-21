"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  paymentApprovalSchema,
  paymentApprovalsSchema,
  testnetBalanceSchema,
  type PaymentApproval,
  type TestnetBalance,
} from "@/features/approvals/schemas/approval";
import {
  AgentApiError,
  getAgentApiError,
  requestAgentApi,
} from "@/features/agents/services/server-api";

export type ApprovalActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

const idSchema = z.string().regex(/^[\w-]{1,100}$/);
const pinSchema = z.string().regex(/^\d{4}$/);

async function parseResult<T>(
  response: Response,
  schema: z.ZodType<T>,
): Promise<ApprovalActionResult<T>> {
  // Validate every Phase 4 response before it reaches client state or approval controls.
  if (!response.ok) return { ok: false, message: await getAgentApiError(response) };
  const payload: unknown = await response.json();
  const parsed = schema.safeParse(payload);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, message: "The financial service returned an unexpected response." };
}

async function apiFailure<T>(error: unknown): Promise<ApprovalActionResult<T>> {
  if (error instanceof AgentApiError) return { ok: false, message: error.message };
  throw error;
}

export async function loadApprovalDashboardAction(): Promise<
  ApprovalActionResult<{ approvals: PaymentApproval[]; balance: TestnetBalance }>
> {
  try {
    const balanceResponseData = await requestAgentApi("/financial/balance");
    const balance = await parseResult(balanceResponseData, testnetBalanceSchema);
    if (!balance.ok) return balance;

    const approvalsResponseData = await requestAgentApi("/financial/approvals");
    const approvals = await parseResult(approvalsResponseData, paymentApprovalsSchema);
    if (!approvals.ok) return approvals;
    return { ok: true, data: { approvals: approvals.data, balance: balance.data } };
  } catch (error) {
    return apiFailure(error);
  }
}

export async function setTestnetBalanceAction(
  balanceUsdc: unknown,
): Promise<ApprovalActionResult<TestnetBalance>> {
  const balance = z.coerce.number().finite().nonnegative().max(1_000_000_000).safeParse(balanceUsdc);
  if (!balance.success) return { ok: false, message: "Enter a valid non-negative USDC test balance." };
  try {
    const response = await requestAgentApi("/financial/balance", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ balance_usdc: balance.data.toFixed(6) }),
    });
    const result = await parseResult(response, testnetBalanceSchema);
    if (result.ok) revalidatePath("/approvals");
    return result;
  } catch (error) {
    return apiFailure(error);
  }
}

export async function createPaymentApprovalAction(input: {
  agentId: string;
  amountUsdc: string;
  recipientAddress: string;
  originalInstruction?: string;
}): Promise<ApprovalActionResult<PaymentApproval>> {
  const parsed = z.object({
    agentId: idSchema,
    amountUsdc: z.string().regex(/^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/, "Enter a valid USDC amount."),
    recipientAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    originalInstruction: z.string().max(2000).optional(),
  }).safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid approval request." };
  try {
    const response = await requestAgentApi("/financial/approvals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        agent_id: parsed.data.agentId,
        amount_usdc: parsed.data.amountUsdc,
        recipient_address: parsed.data.recipientAddress,
        original_instruction: parsed.data.originalInstruction ?? "",
      }),
    });
    const result = await parseResult(response, paymentApprovalSchema);
    if (result.ok) revalidatePath("/approvals");
    return result;
  } catch (error) {
    return apiFailure(error);
  }
}

export async function approvePaymentAction(
  approvalId: string,
  approvalPin: string,
): Promise<ApprovalActionResult<PaymentApproval>> {
  const id = idSchema.safeParse(approvalId);
  const pin = pinSchema.safeParse(approvalPin);
  if (!id.success || !pin.success) return { ok: false, message: "Enter the agent's exact four-digit PIN." };
  try {
    const response = await requestAgentApi(`/financial/approvals/${encodeURIComponent(id.data)}/approve`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ approval_pin: pin.data }),
    });
    const result = await parseResult(response, paymentApprovalSchema);
    if (result.ok) revalidatePath("/approvals");
    return result;
  } catch (error) {
    return apiFailure(error);
  }
}

export async function rejectPaymentAction(
  approvalId: string,
): Promise<ApprovalActionResult<PaymentApproval>> {
  const id = idSchema.safeParse(approvalId);
  if (!id.success) return { ok: false, message: "Invalid approval request." };
  try {
    const response = await requestAgentApi(`/financial/approvals/${encodeURIComponent(id.data)}/reject`, {
      method: "POST",
    });
    const result = await parseResult(response, paymentApprovalSchema);
    if (result.ok) revalidatePath("/approvals");
    return result;
  } catch (error) {
    return apiFailure(error);
  }
}
