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
import TrustMetric from "@/components/my-components/home/trust-metric";
import CallToAction from "@/components/my-components/home/call-to-action";
import Footer from "@/components/my-components/home/footer";


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
      <Hero/>
      <TrustMetric/>
      <CallToAction/>
      <Footer/>
    </main>
  );
}
