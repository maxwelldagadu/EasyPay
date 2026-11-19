import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// Better Auth owns registration, login, OAuth callbacks, sessions, and logout at this route.
export const { GET, POST } = toNextJsHandler(auth);

