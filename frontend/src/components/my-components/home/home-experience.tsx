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
import TrustMetric from "@/components/my-components/home/trust-metric";



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

// Tells product story through an interactive-feeling payment preview and practical safeguards.
export function HomeExperience() {

  return (
    <main className="overflow-hidden bg-[#10120f] font-google-sans text-[#f3f1e8]">
      <Navbar />
      <Hero/>
      <TrustMetric/>

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
