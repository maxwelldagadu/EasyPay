"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

// Shared client-side validation keeps malformed credentials out of both authentication requests.
const authSchema = z.object({
  name: z.string().trim().optional(),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AuthValues = z.infer<typeof authSchema>;

interface AuthFormProps {
  // The selected mode controls whether the form creates a new identity or starts a session.
  mode: "login" | "register";
}

// This form centralizes email/password and Google flows so both auth pages stay consistent.
export function AuthForm({ mode }: AuthFormProps) {
  // Registration requires a display name; sign-in intentionally uses only credentials.
  const isRegister = mode === "register";
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  // React Hook Form connects the shared schema to field errors and submission state.
  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
  });

  async function onSubmit(values: AuthValues) {
    // Clear stale feedback before handling the latest user attempt.
    setStatus(null);

    if (isRegister) {
      // The display name is optional in the shared schema but mandatory for account creation.
      if (!values.name || values.name.length < 2) {
        form.setError("name", { message: "Name must be at least 2 characters" });
        return;
      }
      const result = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      // Surface the provider's failure instead of presenting a false successful registration.
      if (result.error) {
        if (result.error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
          setStatus("An account with this email already exists. Please sign in instead.");
          return;
        }
        setStatus(result.error.message ?? "Registration failed");
        return;
      }
      setStatus("Account created. Please sign in to your account.");
      return;
    }

    // Successful email sign-in establishes the Better Auth session before opening the dashboard.
    const result = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: "/dashboard",
    });
    if (result.error) {
      setStatus(result.error.message ?? "Sign-in failed");
      return;
    }
    router.push("/dashboard");
  }

  async function signInWithGoogle() {
    // Delegate OAuth redirects and callback handling to Better Auth.
    setStatus(null);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  }

  // Render the shared credential form, provider action, and accessible feedback for either mode.
  return (
    <div className="space-y-5">
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Ask for a name only during registration and associate feedback with that input. */}
        {isRegister && (
          <label className="block text-sm font-medium text-white/75">
            Name
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#10120f] px-3 py-2.5 text-[#f3f1e8] outline-none
                         placeholder:text-white/35 focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/40"
              autoComplete="name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <span className="mt-1 block text-sm text-red-400">
                {form.formState.errors.name.message}
              </span>
            )}
          </label>
        )}
        <label className="block text-sm font-medium text-white/75">
          Email
          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#10120f] px-3 py-2.5 text-[#f3f1e8]  
                      outline-none placeholder:text-white/35 focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/40"
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <span className="mt-1 block text-sm text-red-400">
              {form.formState.errors.email.message}
            </span>
          )}
        </label>
        <label className="block text-sm font-medium text-white/75">
          Password
          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#10120f] px-3 py-2.5 text-[#f3f1e8] outline-none
                       placeholder:text-white/35 focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/40"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <span className="mt-1 block text-sm text-red-400">
              {form.formState.errors.password.message}
            </span>
          )}
        </label>
        <button
          className="w-full rounded-xl bg-neon-purple px-4 py-3 text-sm font-semibold text-white 
          transition-colors hover:bg-neon-magenta focus-visible:outline-2 focus-visible:outline-offset-4
           focus-visible:outline-neon-magenta disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          type="submit"
          disabled={form.formState.isSubmitting}
          aria-busy={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <span
              aria-hidden="true"
              className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent align-middle"
            />
          )}
          {isRegister ? "Create account" : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-white/40">
        <span className="h-px flex-1 bg-white/10" />
        or
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <button
        className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 
        text-sm font-semibold text-[#f3f1e8] transition-colors hover:border-neon-magenta/40 hover:bg-neon-magenta/[0.06] focus-visible:outline-2 
        focus-visible:outline-offset-4 focus-visible:outline-neon-magenta cursor-pointer"
        type="button"
        onClick={signInWithGoogle}
      >
        <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 48 48">
          <path
            fill="#4285F4"
            d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 5.9 29.3 
            4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.3-.4-3.5z"
          />
          <path
            fill="#34A853"
            d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
          />
          <path
            fill="#FBBC05"
            d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
          />
          <path
            fill="#EA4335"
            d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
          />
        </svg>
        Continue with Google
      </button>

      {/* Keeps authentication feedback visible without exposing provider response internals. */}
      {status && (
        <p className="rounded-xl border border-neon-purple/20 bg-neon-purple/[0.08] px-3 py-2 text-sm text-white/75">
          {status}
        </p>
      )}
    </div>
  );
}

