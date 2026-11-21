"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  conversationMessagesSchema,
  conversationMessageSchema,
  conversationTurnSchema,
  type ConversationMessage,
} from "@/features/agents/schemas/conversation";
import {
  AgentApiError,
  getAgentApiError,
  requestAgentApi,
} from "@/features/agents/services/server-api";

export type ConversationActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

const agentIdSchema = z.string().regex(/^[\w-]{1,100}$/);
const messageIdSchema = z.string().regex(/^[\w-]{1,100}$/);
const messageInputSchema = z.string().trim().min(1).max(2000);

async function parsedResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
): Promise<ConversationActionResult<T>> {
  // Validate backend response data before returning it across the server-action boundary.
  if (!response.ok) return { ok: false, message: await getAgentApiError(response) };

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, message: "The conversation service returned an invalid response." };
    }
    throw error;
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: "The conversation service returned an unexpected response." };
  }
  return { ok: true, data: parsed.data };
}

async function apiFailure<T>(error: unknown): Promise<ConversationActionResult<T>> {
  // Surface expected API/session failures while allowing unexpected server errors to reach monitoring.
  if (error instanceof AgentApiError) return { ok: false, message: error.message };
  throw error;
}

export async function loadAgentConversationAction(
  agentId: string,
): Promise<ConversationActionResult<ConversationMessage[]>> {
  const validAgentId = agentIdSchema.safeParse(agentId);
  if (!validAgentId.success) return { ok: false, message: "Invalid agent identifier." };

  try {
    const response = await requestAgentApi(
      `/${encodeURIComponent(validAgentId.data)}/conversation`,
    );
    return parsedResponse(response, conversationMessagesSchema);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function sendAgentConversationMessageAction(
  agentId: string,
  input: unknown,
): Promise<ConversationActionResult<z.infer<typeof conversationTurnSchema>>> {
  const validAgentId = agentIdSchema.safeParse(agentId);
  const message = messageInputSchema.safeParse(input);
  if (!validAgentId.success) return { ok: false, message: "Invalid agent identifier." };
  if (!message.success) return { ok: false, message: "Enter a message of up to 2,000 characters." };

  try {
    const response = await requestAgentApi(
      `/${encodeURIComponent(validAgentId.data)}/conversation`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: message.data }),
      },
    );
    return parsedResponse(response, conversationTurnSchema);
  } catch (error) {
    return apiFailure(error);
  }
}

async function updateConfigurationProposal(
  agentId: string,
  messageId: string,
  action: "apply" | "dismiss",
): Promise<ConversationActionResult<ConversationMessage>> {
  const validAgentId = agentIdSchema.safeParse(agentId);
  const validMessageId = messageIdSchema.safeParse(messageId);
  if (!validAgentId.success || !validMessageId.success) {
    return { ok: false, message: "Invalid conversation proposal." };
  }

  try {
    const response = await requestAgentApi(
      `/${encodeURIComponent(validAgentId.data)}/conversation/${encodeURIComponent(validMessageId.data)}/${action}`,
      { method: "POST" },
    );
    const result = await parsedResponse(response, conversationMessageSchema);
    if (result.ok && action === "apply") {
      // Refresh agent configuration views after an explicitly confirmed server-side update.
      revalidatePath(`/agents/${validAgentId.data}`);
      revalidatePath("/agents");
      revalidatePath("/dashboard");
    }
    return result;
  } catch (error) {
    return apiFailure(error);
  }
}

export async function applyAgentConfigurationProposalAction(
  agentId: string,
  messageId: string,
): Promise<ConversationActionResult<ConversationMessage>> {
  return updateConfigurationProposal(agentId, messageId, "apply");
}

export async function dismissAgentConfigurationProposalAction(
  agentId: string,
  messageId: string,
): Promise<ConversationActionResult<ConversationMessage>> {
  return updateConfigurationProposal(agentId, messageId, "dismiss");
}
