"use client";

import { Heart, Mail } from "lucide-react";
import { useEffect, useState } from "react";



export default function Footer() {

  const [date, setDate] = useState<number | null>(null);
  
  // Sets date of year
  useEffect(() => {
    setDate(new Date().getFullYear());
  }, []);

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-[#10120f] px-5 pb-8 pt-12 text-white sm:px-8 sm:pt-16 lg:px-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 size-72 -translate-x-1/2 rounded-full bg-neon-purple/[0.12] blur-[100px]"
      />
      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-10">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-neon-purple text-sm font-black text-white shadow-[0_0_26px_rgba(115,19,255,0.24)]">
              e
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight text-white">EasyPay</p>
              <p className="mt-1 text-xs text-white/40">
                AI payments, with you in control.
              </p>
            </div>
          </div>

          <a
            className="group inline-flex w-fit items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-white/70 transition-colors hover:border-neon-magenta/40 hover:text-neon-magenta"
            href="https://mail.google.com/mail/?view=cm&fs=1&to=maxwelldagadu02%40gmail.com"
            rel="noreferrer"
            target="_blank"
          >
            <Mail className="size-4 text-neon-purple" />
            maxwelldagadu02@gmail.com
            
          </a>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Made with 
            <Heart aria-label="love" className="mx-1 inline size-3.5 fill-neon-magenta text-neon-magenta" /> 
            for a more thoughtful way to pay.
          </p>
          <p>
            © <span suppressHydrationWarning>{date}</span> EasyPay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
