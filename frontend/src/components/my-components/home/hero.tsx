"use client";

import Link from "next/link";
import { ArrowRight,Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

// Hero section

export default function Hero(){
  const reduceMotion = useReducedMotion();

  return(
    <section className="relative isolate flex min-h-[100svh] w-full overflow-hidden bg-[#10120f] text-[#f3f1e8]">
      <video
        aria-hidden="true"
        autoPlay={!reduceMotion}
        className="absolute inset-0 size-full object-cover"
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src="/videos/homepage.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl items-center px-5 pb-24 pt-20 sm:px-8 lg:px-12 lg:pb-28">
      <div className="max-w-2xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border  border-white/10 bg-neon-purple px-3.5 py-2 text-xs font-medium"
        >
          <span className="size-1.5 rounded-full bg-white shadow-[0_0_12px_#dfff78]" />
          AI payment platform
        </motion.div>
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="max-w-[740px] text-[clamp(3.2rem,7.3vw,6.6rem)] font-medium leading-[0.96] tracking-[-0.075em]"
        >
          Give your AI
          <br />
          the wheel.
          <br />
          <span className="font-serif italic font-normal tracking-[-0.07em] text-neon-purple">
            Keep the keys.
          </span>
        </motion.h1>
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.18 }}
          className="mt-7 max-w-lg text-base leading-7 text-white/60 sm:text-lg sm:leading-8"
        >
          Create named AI agents that understand payment instructions, follows the limits you set,
          and wait for your approval before any USDC moves.
        </motion.p>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.27 }}
          className="mt-9 flex justify-between items-center gap-4"
        >
          <Link
            className="group inline-flex items-center gap-3 rounded-full bg-neon-purple px-6 py-3.5 text-sm font-semibold text-white"
            href="/register"
          >
            Create your first agent
          </Link>   
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.32 }}
            className="rounded-xl border-1 border-white/50 bg-black/30 p-3.5 text-right shadow-xl shadow-black/20 backdrop-blur-md sm:block lg:bottom-12 lg:right-12"
          >
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">Approval security</p>
            <p className="mt-1 text-sm font-medium">One Agent · one PIN</p>
          </motion.div>
        </motion.div>
      </div>
      </div>
    </section>
  )
}