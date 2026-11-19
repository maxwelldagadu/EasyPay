"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  CircleDollarSign,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import Hero from "@/components/my-components/home/hero";
import Navbar from "@/components/my-components/Navbar";

const principles = [
  {
    number: "01",
    icon: Bot,
    title: "AI understands",
    body: "Tell your agent what you need in plain English. It turns your words into a clear payment proposal.",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Rules take over",
    body: "The backend checks your balance, agent budget, transaction caps, and recipient permissions.",
  },
  {
    number: "03",
    icon: Fingerprint,
    title: "You say yes",
    body: "Review the exact details, then authorize that request with its agent's own four-digit PIN.",
  },
];

const controls = [
  "Maximum per payment",
  "Daily, weekly & monthly caps",
  "Approved recipient addresses",
  "Pause an agent instantly",
];

const highlights = [
  { value: "USDC", label: "One payment currency", icon: CircleDollarSign },
  { value: "Testnet", label: "No mainnet transactions", icon: Activity },
  { value: "You", label: "Always in control", icon: Fingerprint },
];

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Reveal content on scroll while respecting visitors who prefer reduced motion.
function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Tell the product story through an interactive-feeling payment preview and practical safeguards.
export function HomeExperience() {
  

  return (
    <main className="overflow-hidden bg-[#10120f] font-google-sans text-[#f3f1e8]">
      <Navbar />
      <Hero/>


      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32 lg:px-12" id="how-it-works">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#dfff78]">A simple rule, every time</p>
          <h2 className="mt-5 text-4xl font-medium leading-tight tracking-[-0.055em] sm:text-6xl">
            AI interprets.
            <br />
            <span className="font-serif italic font-normal text-white/45">You authorize.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/55">
            An agent can prepare a payment, never send one on its own. Each request passes through
            clear, separate steps built to keep you in charge.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-3 md:grid-cols-3">
          {principles.map(({ number, icon: Icon, title, body }, index) => (
            <Reveal className="h-full" delay={index * 0.09} key={number}>
              <article className="group relative flex h-full min-h-[255px] flex-col rounded-2xl border border-white/[0.09] bg-white/[0.035] p-6 transition-colors hover:border-[#dfff78]/35 hover:bg-white/[0.055] sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-[#dfff78]/10 text-[#dfff78] transition-transform group-hover:scale-105">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-white/30">{number}</span>
                </div>
                <h3 className="mt-10 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/50">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-24 sm:px-8 md:grid-cols-2 md:items-center md:gap-16 lg:px-12 lg:pb-32" id="agent-controls">
        <Reveal className="relative min-h-[360px] overflow-hidden rounded-[1.75rem] border border-white/10 sm:min-h-[470px]">
          <Image
            alt="Abstract flowing blue light representing the flow of a payment through agent controls"
            className="object-cover opacity-75"
            fill
            priority={false}
            sizes="(max-width: 768px) 100vw, 50vw"
            src="/images/agentic-flow.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10120f] via-[#10120f]/35 to-[#10120f]/10" />
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-[#141611]/80 p-5 backdrop-blur-xl sm:inset-x-7 sm:bottom-7 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#dfff78] text-[#171910]"><Bot className="size-5" /></span>
                <div>
                  <p className="text-sm font-semibold">Business Payments</p>
                  <p className="mt-1 text-xs text-white/45">Active · Your rules apply</p>
                </div>
              </div>
              <span className="size-2 rounded-full bg-[#dfff78] shadow-[0_0_12px_#dfff78]" />
            </div>
            <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
              <div>
                <p className="text-xs text-white/45">Monthly budget remaining</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">$840 <span className="text-sm font-normal text-white/40">USDC</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/45">Per-payment max</p>
                <p className="mt-1 text-sm font-medium">$250</p>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#dfff78]">Your agent. Your boundaries.</p>
          <h2 className="mt-5 text-4xl font-medium leading-tight tracking-[-0.055em] sm:text-5xl">
            Helpful by design.
            <br />
            <span className="font-serif italic font-normal text-white/45">Limited by you.</span>
          </h2>
          <p className="mt-5 text-base leading-7 text-white/55">
            Give every agent a name, a role, and its own independent approval PIN. Set the guardrails
            first; the AI can only suggest actions inside them.
          </p>
          <ul className="mt-8 space-y-4">
            {controls.map((control) => (
              <li className="flex items-center gap-3 text-sm text-white/75" key={control}>
                <span className="grid size-5 place-items-center rounded-full bg-[#dfff78]/10 text-[#dfff78]">
                  <Check className="size-3" />
                </span>
                {control}
              </li>
            ))}
          </ul>
          <Link className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#dfff78] transition-all hover:gap-3" href="/register">
            Set up an agent <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </section>

      <section className="relative border-y border-white/[0.08] bg-[#dfff78] text-[#171910]" id="testnet">
        <div className="pointer-events-none absolute -right-32 top-0 size-96 rounded-full bg-white/40 blur-[100px]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-[1fr_auto] md:items-end lg:px-12 lg:py-24">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">Built for learning safely</p>
            <h2 className="mt-5 max-w-3xl text-4xl font-medium leading-tight tracking-[-0.06em] sm:text-6xl">
              Real controls.
              <br />
              <span className="font-serif italic font-normal">Testnet tokens.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-black/65">
              EasyPay is a personal development platform for testnet USDC. No mainnet payments,
              no real-money deposits, and no other payment currencies. A network token may only be
              used for testnet gas.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <Link
              className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#171910] px-6 py-4 text-sm font-semibold text-[#f3f1e8] transition-transform hover:scale-[1.03]"
              href="/register"
            >
              Explore EasyPay <ArrowUpRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <Reveal className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#191b16] px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute left-1/2 top-0 size-80 -translate-x-1/2 rounded-full bg-[#dfff78]/10 blur-[90px]" />
          <div className="relative mx-auto max-w-2xl">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#dfff78]/10 text-[#dfff78]">
              <Sparkles className="size-5" />
            </span>
            <h2 className="mt-6 text-4xl font-medium tracking-[-0.055em] sm:text-5xl">
              Make your first agent <span className="font-serif italic font-normal text-[#dfff78]">yours.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/55 sm:text-base">
              Give it a name, define its responsibility, and set spending rules you can trust.
              Nothing moves until you approve it.
            </p>
            <Link
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#dfff78] px-6 py-3.5 text-sm font-semibold text-[#171910] transition-all hover:gap-4 hover:bg-[#e9ffad]"
              href="/register"
            >
              Get started <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 text-white/75">
            <span className="grid size-6 place-items-center rounded-full bg-[#dfff78] text-[10px] font-black text-[#161811]">e</span>
            <span className="font-semibold">easypay</span>
          </div>
          <p>AI interprets. Backend validates. You authorize. Blockchain executes.</p>
          <span className="inline-flex items-center gap-2"><WalletCards className="size-3.5" /> Testnet USDC only</span>
        </div>
      </footer>
    </main>
  );
}
