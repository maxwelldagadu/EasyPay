import Link from "next/link";

import { AuthForm } from "@/components/my-components/features/authentication/components/auth-form";

// Present account creation with the same authentication options used on the login screen.
export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">EasyPay</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Create your account</h1>
        </div>
        <AuthForm mode="register" />
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-blue-700" href="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

