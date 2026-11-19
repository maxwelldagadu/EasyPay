"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight,Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";


// Hero section

export default function Hero(){
  const reduceMotion = useReducedMotion();

  return(
    <section className="relative isolate mx-auto grid min-h-[690px] w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 lg:min-h-[740px] lg:grid-cols-[0.92fr_1.08fr] lg:px-12 lg:pb-28 lg:pt-8">
      <div className="pointer-events-none absolute -left-44 top-20 -z-10 size-[34rem] rounded-full bg-[#dfff78]/[0.07] blur-[120px]" />
      <div className="relative z-10 max-w-2xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/75"
        >
          <span className="size-1.5 rounded-full bg-[#dfff78] shadow-[0_0_12px_#dfff78]" />
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
          <span className="font-serif italic font-normal tracking-[-0.07em] text-[#dfff78]">
            Keep the keys.
          </span>
        </motion.h1>
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.18 }}
          className="mt-7 max-w-lg text-base leading-7 text-white/60 sm:text-lg sm:leading-8"
        >
          Create named AI agents that understand payment instructions, follow the limits you set,
          and wait for your approval before any testnet USDC moves.
        </motion.p>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.27 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <Link
            className="group inline-flex items-center gap-3 rounded-full bg-[#dfff78] px-6 py-3.5 text-sm font-semibold text-[#161811] transition-all hover:gap-4 hover:bg-[#e9ffad]"
            href="/register"
          >
            Create your first agent
            <ArrowRight className="size-4" />
          </Link>   
        </motion.div>
        <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/40">
          <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-[#dfff78]" /> Testnets only</span>
          <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-[#dfff78]" /> USDC only</span>
          <span className="inline-flex items-center gap-2"><Check className="size-3.5 text-[#dfff78]" /> Human approval required</span>
        </div>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 18 }}
        animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto w-full max-w-[640px] lg:ml-auto"
      >
        <div className="absolute -inset-8 rounded-[3rem] bg-[#dfff78]/[0.07] blur-3xl" />
        <div className="relative min-w-full min-h-[390px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#181a16] shadow-[0_30px_120px_rgba(0,0,0,0.5)] sm:min-h-[500px]">
          {/* Loop the locally stored humanoid footage behind the payment proposal and approval preview. */}
          <video
            aria-hidden="true"
            autoPlay={!reduceMotion}
            className="absolute inset-0 size-full object-cover opacity-55"
            loop
            muted
            playsInline
            poster="/images/humanoid-payment-poster.jpg"
            preload="metadata"
          >
            <source src="/videos/humanoid-payment-loop.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-[#10120f]/45 via-[#10120f]/25 to-[#10120f]/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(223,255,120,0.20),transparent_35%)]" />
          <div className="relative min-w-full flex min-h-[390px] p-5 sm:min-h-[500px] sm:p-8">
            <div className="absolute bottom-10 flex min-w-full justify-left">
              <div className="hidden rounded-xl border border-white/15 bg-black/25 p-3 text-right backdrop-blur-md sm:block">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">Approval security</p>
                <p className="mt-1 text-sm font-medium">One Agent · one PIN</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}