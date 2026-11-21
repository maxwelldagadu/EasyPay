import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export class AgentApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AgentApiError";
  }
}

// Forward only the authenticated browser credentials from the server to the owner-scoped FastAPI API.
export async function requestAgentApi(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const incomingHeaders = await headers();
  const session = await auth.api.getSession({ headers: incomingHeaders });
  if (!session) {
    throw new AgentApiError("Your session has expired. Sign in again.", 401);
  }

  const forwardedHeaders = new Headers(init.headers);
  const cookie = incomingHeaders.get("cookie");
  const authorization = incomingHeaders.get("authorization");
  if (cookie) forwardedHeaders.set("cookie", cookie);
  if (authorization) forwardedHeaders.set("authorization", authorization);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8000";
  try {
    // Disable caching because agent configuration is private and mutations must be immediately visible.
    const featurePrefix = path.startsWith("/financial")
      ? "/api/v1"
      : "/api/v1/agents";
    return await fetch(`${apiUrl.replace(/\/$/, "")}${featurePrefix}${path}`, {
      ...init,
      headers: forwardedHeaders,
      cache: "no-store",
    });
  } catch (error) {
    // Convert network failures into an explicit service error instead of returning empty agent data.
    if (error instanceof TypeError) {
      throw new AgentApiError("The agent service is unavailable. Try again shortly.", 503);
    }
    throw error;
  }
}

// Extract backend validation details while handling malformed response bodies explicitly.
export async function getAgentApiError(response: Response): Promise<string> {
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
    if (
      typeof payload === "object" &&
      payload !== null &&
      "detail" in payload &&
      Array.isArray(payload.detail)
    ) {
      const firstIssue = payload.detail.find(
        (issue: unknown): issue is { msg: string } =>
          typeof issue === "object" &&
          issue !== null &&
          "msg" in issue &&
          typeof issue.msg === "string",
      );
      if (firstIssue) return firstIssue.msg;
    }
  } catch (error) {
    // Non-JSON gateway responses still surface their HTTP status instead of masking the failure.
    if (!(error instanceof SyntaxError)) throw error;
  }
  return `Agent request failed (${response.status}).`;
}
