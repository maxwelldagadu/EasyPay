"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  agentFormSchema,
  changePinFormSchema,
  createAgentFormSchema,
} from "@/features/agents/schemas/agent";
import {
  AgentApiError,
  getAgentApiError,
  requestAgentApi,
} from "@/features/agents/services/server-api";

export type AgentActionResult =
  | { ok: true; message: string; agentId?: string }
  | { ok: false; message: string };

function recipientList(value: string): string[] {
  // Convert the user-friendly newline list into the API's normalized-array input shape.
  return value
    .split(/\r?\n/)
    .map((address) => address.trim())
    .filter(Boolean);
}

function configurationPayload(
  values: z.infer<typeof agentFormSchema>,
): Record<string, unknown> {
  // Keep the API payload explicit so browser-only form fields never reach persistence.
  return {
    name: values.name,
    description: values.description,
    responsibility: values.responsibility,
    instructions: values.instructions,
    budget_usdc: values.budget_usdc,
    max_transaction_usdc: values.max_transaction_usdc,
    daily_limit_usdc: values.daily_limit_usdc,
    weekly_limit_usdc: values.weekly_limit_usdc,
    monthly_limit_usdc: values.monthly_limit_usdc,
    max_transaction_count:
      values.max_transaction_count === "" ? null : Number(values.max_transaction_count),
    approved_recipients: recipientList(values.approved_recipients),
    restricted_recipients: recipientList(values.restricted_recipients),
  };
}

async function failedActionResult(error: unknown): Promise<AgentActionResult> {
  // Return an actionable message for expected API failures and preserve unexpected exceptions.
  if (error instanceof AgentApiError) {
    return { ok: false, message: error.message };
  }
  throw error;
}

async function responseError(response: Response): Promise<AgentActionResult> {
  // Reuse backend validation messages so users can correct rejected settings accurately.
  return { ok: false, message: await getAgentApiError(response) };
}

async function revalidateAgentViews(agentId?: string): Promise<void> {
  // Refresh list and overview totals immediately after any successful management mutation.
  revalidatePath("/agents");
  revalidatePath("/dashboard");
  if (agentId) revalidatePath(`/agents/${agentId}`);
}

// Create an agent only after server-side schema validation and backend session ownership checks.
export async function createAgentAction(input: unknown): Promise<AgentActionResult> {
  const parsed = createAgentFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the agent settings." };
  }

  try {
    const response = await requestAgentApi("", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...configurationPayload(parsed.data),
        approval_pin: parsed.data.approval_pin,
      }),
    });
    if (!response.ok) return responseError(response);

    // Validate the minimal result needed for navigation instead of trusting arbitrary response data.
    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      // Avoid claiming success when an upstream response cannot identify the new agent.
      if (error instanceof SyntaxError) {
        return { ok: false, message: "The agent service returned an invalid response." };
      }
      throw error;
    }
    const created = z.object({ id: z.string() }).safeParse(payload);
    if (!created.success) {
      return { ok: false, message: "The agent was saved, but its response was invalid. Refresh the list." };
    }
    await revalidateAgentViews(created.data.id);
    return { ok: true, message: "Agent created successfully.", agentId: created.data.id };
  } catch (error) {
    return failedActionResult(error);
  }
}

// Update editable settings without allowing ownership, status, or PIN fields into a general PATCH.
export async function updateAgentAction(
  agentId: string,
  input: unknown,
): Promise<AgentActionResult> {
  if (!/^[\w-]{1,100}$/.test(agentId)) {
    return { ok: false, message: "Invalid agent identifier." };
  }
  const parsed = agentFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the agent settings." };
  }

  try {
    const response = await requestAgentApi(`/${encodeURIComponent(agentId)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(configurationPayload(parsed.data)),
    });
    if (!response.ok) return responseError(response);
    await revalidateAgentViews(agentId);
    return { ok: true, message: "Agent settings saved." };
  } catch (error) {
    return failedActionResult(error);
  }
}

// Change agent status through a server action; the backend still verifies ownership and state.
export async function setAgentStatusAction(
  agentId: string,
  isActive: boolean,
): Promise<AgentActionResult> {
  if (!/^[\w-]{1,100}$/.test(agentId)) {
    return { ok: false, message: "Invalid agent identifier." };
  }

  try {
    const response = await requestAgentApi(`/${encodeURIComponent(agentId)}/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ is_active: isActive }),
    });
    if (!response.ok) return responseError(response);
    await revalidateAgentViews(agentId);
    return {
      ok: true,
      message: isActive ? "Agent reactivated." : "Agent paused.",
    };
  } catch (error) {
    return failedActionResult(error);
  }
}

// Rotate a PIN only after validating the submitted secrets and letting the backend verify the current PIN.
export async function changeAgentPinAction(
  agentId: string,
  input: unknown,
): Promise<AgentActionResult> {
  if (!/^[\w-]{1,100}$/.test(agentId)) {
    return { ok: false, message: "Invalid agent identifier." };
  }
  const parsed = changePinFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the PIN entries." };
  }

  try {
    const response = await requestAgentApi(`/${encodeURIComponent(agentId)}/pin`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        current_pin: parsed.data.current_pin,
        new_pin: parsed.data.new_pin,
        confirm_pin: parsed.data.confirm_pin,
      }),
    });
    if (!response.ok) return responseError(response);
    await revalidateAgentViews(agentId);
    return { ok: true, message: "Agent approval PIN changed." };
  } catch (error) {
    return failedActionResult(error);
  }
}

// Remove an agent from active management while the backend retains its historical record.
export async function deleteAgentAction(agentId: string): Promise<AgentActionResult> {
  if (!/^[\w-]{1,100}$/.test(agentId)) {
    return { ok: false, message: "Invalid agent identifier." };
  }

  try {
    const response = await requestAgentApi(`/${encodeURIComponent(agentId)}`, {
      method: "DELETE",
    });
    if (!response.ok) return responseError(response);
    await revalidateAgentViews(agentId);
    return { ok: true, message: "Agent deleted. Its historical records are retained." };
  } catch (error) {
    return failedActionResult(error);
  }
}
