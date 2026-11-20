"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Navbar from "@/components/my-components/Navbar";

// Hero section

export default function Hero(){
  const reduceMotion = useReducedMotion();

  return(
    <section className="relative isolate flex h-180 md:h-full w-full overflow-hidden bg-[#10120f] text-[#f3f1e8]">
      <Navbar />
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

      <div className="relative z-10 mx-auto flex-col md:flex h-full w-full items-center px-2 pb-24 pt-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="w-full h-full">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-10 mt-10 inline-flex md:text-lg items-center gap-2 rounded-full border  border-white/10 bg-neon-purple px-3.5 py-2 text-xs font-medium"
          >
            <span className="size-1.5 rounded-full font-semibold bg-white shadow-[0_0_12px_#dfff78]" />
            AI payment platform
          </motion.div>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="max-w-[740px] text-[clamp(3.2rem,7.3vw,6.6rem)] font-medium leading-[0.96] tracking-[-0.075em] md:text-8xl lg:text-9xl"
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
            className="mt-7 max-w-lg text-sm leading-7 text-white/50 sm:text-lg sm:leading-8 "
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
              className="group text-nowrap inline-flex items-center gap-3 rounded-full bg-neon-purple
                         p-3 md:px-6 md:py-3.5 text-[13px] md:text-lg font-semibold text-white"
              href="/register"
            >
              Create your first agent
            </Link>   
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.32 }}
              className="rounded-xl border border-white/50 bg-black/30 p-1.5 md:p-3.5 text-right shadow-xl 
                        shadow-black/20 backdrop-blur-md md:text-lg text[13px] sm:block lg:bottom-12 lg:right-12 text-nowrap "
            >
              <p className="text-[10px] uppercase tracking-[0.16em]  text-white/50">Approval security</p>
              <p className="mt-1 font-medium">One Agent · one PIN</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}