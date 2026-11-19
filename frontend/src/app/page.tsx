import Link from "next/link";

// Provide the public entry point and clear navigation to authentication.
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <section className="max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
          Testnet USDC payments
        </p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight">EasyPay</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
          AI-assisted payment agents with deterministic financial controls and human approval.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            className="rounded-lg bg-white px-5 py-3 font-semibold text-slate-950"
            href="/register"
          >
            Get 
          </Link>
          <Link
            className="rounded-lg border border-slate-700 px-5 py-3 font-semibold"
            href="/login"
          >
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
