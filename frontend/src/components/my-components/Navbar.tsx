import Image from "next/image";
import Link from "next/link";

// Navbar component

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-slate-950 text-white">
      <div className="container mx-auto py-4">
        <Link href="/">
          {/* <Image src="/logo.svg" alt="EasyPay Logo" width={100} height={40} /> */}
          <span className="text-3xl font-bold">EasyPay</span>
        </Link>
      </div>
      {/* Keep navigation actions centered and sized to their content rather than stretching with the navbar. */}
      <div className="flex items-center gap-10">
        <Link
          className="inline-flex items-center whitespace-nowrap rounded-lg bg-white p-3 font-open-sans text-sm font-semibold leading-none text-slate-950"
          href="/register"
        >
          Get Started
        </Link>
        <Link
          className="inline-flex items-center whitespace-nowrap rounded-lg bg-white p-3 font-open-sans text-sm font-semibold leading-none text-slate-950"
          href="/login"
        >
          Sign in
        </Link>
      </div>
    </nav>
  );
}