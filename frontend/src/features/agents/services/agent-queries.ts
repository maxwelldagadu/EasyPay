import "server-only";

import { z } from "zod";

import type { Agent, AgentQueryResult } from "@/features/agents/types";
import { AgentApiError, getAgentApiError, requestAgentApi } from "@/features/agents/services/server-api";

const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  responsibility: z.string(),
  instructions: z.string(),
  budget_usdc: z.union([z.string(), z.number()]).transform(String),
  max_transaction_usdc: z.union([z.string(), z.number()]).transform(String),
  daily_limit_usdc: z.union([z.string(), z.number()]).transform(String),
  weekly_limit_usdc: z.union([z.string(), z.number()]).transform(String),
  monthly_limit_usdc: z.union([z.string(), z.number()]).transform(String),
  max_transaction_count: z.number().int().positive().nullable(),
  approved_recipients: z.array(z.string()),
  restricted_recipients: z.array(z.string()),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
}) satisfies z.ZodType<Agent>;

const agentListSchema = z.array(agentSchema);

async function parseAgentResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
): Promise<AgentQueryResult<T>> {
  if (!response.ok) {
    return {
      data: null,
      error: await getAgentApiError(response),
      status: response.status,
    };
  }

  try {
    // Validate the API response shape before it becomes server-rendered UI data.
    const payload: unknown = await response.json();
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return {
        data: null,
        error: "The agent service returned data in an unexpected format.",
        status: 502,
      };
    }
    return { data: parsed.data, error: null, status: response.status };
  } catch (error) {
    // A broken JSON body is a gateway error, not an empty success state.
    if (error instanceof SyntaxError) {
      return { data: null, error: "The agent service returned an invalid response.", status: 502 };
    }
    throw error;
  }
}

// Load the signed-in user's live agent collection without exposing session credentials to the browser.
export async function getAgentsForDashboard(): Promise<AgentQueryResult<Agent[]>> {
  try {
    const response = await requestAgentApi("");
    return parseAgentResponse(response, agentListSchema);
  } catch (error) {
    if (error instanceof AgentApiError) {
      return { data: null, error: error.message, status: error.status };
    }
    throw error;
  }
}

// Load one agent through the same authenticated API path used by every management mutation.
export async function getAgentForDashboard(
  agentId: string,
): Promise<AgentQueryResult<Agent>> {
  try {
    const response = await requestAgentApi(`/${encodeURIComponent(agentId)}`);
    return parseAgentResponse(response, agentSchema);
  } catch (error) {
    if (error instanceof AgentApiError) {
      return { data: null, error: error.message, status: error.status };
    }
    throw error;
  }
}
