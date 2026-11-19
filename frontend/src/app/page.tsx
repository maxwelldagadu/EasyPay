import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/my-components/Navbar";

// Provide the public entry point and clear navigation to authentication.
export default function Home() {
  return (
    <main className="flex-col min-h-screen justify-center font-google-sans text-white">
      <Navbar/>
      <section className="max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
          Testnet USDC payments
        </p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight">EasyPay</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
          AI-assisted payment agents with deterministic financial controls and human approval.
        </p>
        
      </section>
    </main>
  );
}
