import Link from "next/link";

import { AuthForm } from "@/components/my-components/features/authentication/components/auth-form";

// Present the sign-in flow and a direct route to account registration.
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">EasyPay</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Welcome back</h1>
        </div>
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-slate-600">
          New to EasyPay?{" "}
          <Link className="font-semibold text-blue-700" href="/register">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}

