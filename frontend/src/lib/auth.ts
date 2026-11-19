import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

if (!process.env.BETTER_AUTH_SECRET) {
  // Fail at startup rather than allowing session signing with an absent secret.
  throw new Error("BETTER_AUTH_SECRET is required");
}

if (!process.env.DATABASE_URL) {
  // Authentication cannot persist accounts or sessions without the shared PostgreSQL database.
  throw new Error("DATABASE_URL is required");
}

// Better Auth owns identity and sessions, while PostgreSQL remains the shared Supabase data layer.
export const auth = betterAuth({
  appName: "EasyPay",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    // Require certificate validation in production and allow local development without TLS.
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: true }
        : false,
  }),
  // Require users to verify email addresses before they can use password authentication.
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  // Enable Google sign-in using credentials supplied through server-only environment variables.
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  // Ensure Better Auth session cookies are integrated with Next.js server actions and routes.
  plugins: [nextCookies()],
});

