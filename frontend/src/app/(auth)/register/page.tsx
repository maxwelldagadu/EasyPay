import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AuthForm } from "@/features/authentication/components/auth-form";

// Present account creation with the same authentication options used on the login screen.
export default function RegisterPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center bg-[#10120f] px-4 py-20 font-google-sans text-[#f3f1e8]">
      <Link
        className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm
        font-medium text-white/70 transition-colors hover:border-neon-magenta/40 hover:text-neon-magenta focus-visible:outline-2
        focus-visible:outline-offset-4 focus-visible:outline-neon-magenta sm:left-8 sm:top-8"
        href="/"
      >
        <ArrowLeft aria-hidden="true" className="size-4 capitalize" />
        Back Home
      </Link>
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#17121f]
               p-6 shadow-[0_35px_110px_rgba(0,0,0,0.42)] sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-neon-magenta">EasyPay</p>
          <h1 className="mt-2 text-2xl font-bold text-[#f3f1e8]">Create your account</h1>
        </div>
        <AuthForm mode="register" />
        <p className="mt-6 text-center text-sm text-white/55">
          Already have an account?{" "}
          <Link className="font-semibold cursor-pointer text-neon-magenta transition-colors hover:text-neon-purple" href="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

