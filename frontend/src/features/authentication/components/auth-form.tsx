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
        setStatus(result.error.message ?? "Registration failed");
        return;
      }
      setStatus("Account created. Check your email to verify your address.");
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
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none ring-blue-600 focus:ring-2"
              autoComplete="name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <span className="mt-1 block text-sm text-red-600">
                {form.formState.errors.name.message}
              </span>
            )}
          </label>
        )}
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none ring-blue-600 focus:ring-2"
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <span className="mt-1 block text-sm text-red-600">
              {form.formState.errors.email.message}
            </span>
          )}
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none ring-blue-600 focus:ring-2"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <span className="mt-1 block text-sm text-red-600">
              {form.formState.errors.password.message}
            </span>
          )}
        </label>
        <button
          className="w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {isRegister ? "Create account" : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800"
        type="button"
        onClick={signInWithGoogle}
      >
        Continue with Google
      </button>

      {/* Keep authentication feedback visible without exposing provider response internals. */}
      {status && (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {status}
        </p>
      )}
    </div>
  );
}

