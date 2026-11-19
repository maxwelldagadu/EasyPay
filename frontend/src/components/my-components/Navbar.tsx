import Link from "next/link";

// Give visitors clear routes to the product story and account entry points.
export default function Navbar() {
  return (
    <nav className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 text-[#f3f1e8] sm:px-8 lg:px-12">
      <Link aria-label="EasyPay home" className="flex items-center gap-3" href="/">
        <span className="grid size-9 place-items-center rounded-full bg-[#dfff78] text-sm font-black text-[#161811]">
          E
        </span>
        <span className="font-google-sans text-xl font-semibold tracking-tight">EasyPay</span>
      </Link>

      <div className="flex items-center gap-3">
        <Link className="hidden px-3 py-2 text-sm text-white transition-colors hover:text-white sm:inline-flex" href="/login">
          Sign in
        </Link>
        <Link
          className="inline-flex items-center gap-2 rounded-full bg-neon-purple px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] sm:px-5"
          href="/register"
        >
          Get started
        </Link>
      </div>
    </nav>
  );
}