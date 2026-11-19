"use client";

import { createAuthClient } from "better-auth/react";

// This client is limited to authentication operations and never handles PIN or wallet secrets.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

