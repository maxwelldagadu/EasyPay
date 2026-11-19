"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  Check,
  Fingerprint,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const setupItems: { label: string; Icon: LucideIcon }[] = [
  { label: "Name and responsibility", Icon: Bot },
  { label: "Spending limits", Icon: Check },
  { label: "Private approval PIN", Icon: Fingerprint },
];

export default function CallToAction() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Reveal the CTA as one composed scene and gently animate its ambient highlight.
    const context = gsap.context(() => {
      const entrance = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          once: true,
        },
      });

      entrance
        .fromTo(
          "[data-cta-panel]",
          { autoAlpha: 0, y: 64, scale: 0.985 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" },
        )
        .fromTo(
          "[data-cta-copy-column]",
          { autoAlpha: 0, x: -72 },
          { autoAlpha: 1, x: 0, duration: 0.9, ease: "power3.out" },
          "-=0.6",
        )
        .fromTo(
          "[data-cta-preview]",
          { autoAlpha: 0, x: 72, rotate: 2 },
          { autoAlpha: 1, x: 0, rotate: 0, duration: 0.9, ease: "power3.out" },
          "<",
        );

      gsap.to("[data-cta-glow]", {
        x: 26,
        y: 18,
        scale: 1.08,
        duration: 4.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="call-to-action-heading"
      className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32"
      id="get-started"
    >
      <div
        className="relative isolate overflow-hidden rounded-[2rem] border border-neon-purple/25 bg-[#17121f] shadow-[0_35px_110px_rgba(0,0,0,0.42)] sm:rounded-[2.5rem]"
        data-cta-panel
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-56 -z-10 size-[34rem] rounded-full bg-neon-purple/20 blur-[110px]"
          data-cta-glow
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] bg-[radial-gradient(circle_at_78%_48%,var(--color-neon-magenta),transparent_35%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(90deg,transparent,black)]"
        />

        <div className="grid gap-12 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:px-16 lg:py-20">
          <div className="relative z-10 max-w-2xl" data-cta-copy-column>
            <p
              className="inline-flex items-center gap-2 rounded-full border border-neon-magenta/25 bg-neon-magenta/[0.08] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-magenta sm:text-xs"
            >
              <Sparkles className="size-3.5" />
              A smarter way to pay
            </p>
            <h2
              className="mt-7 text-4xl font-medium leading-[1.02] tracking-[-0.065em] sm:text-6xl lg:text-7xl"
              id="call-to-action-heading"
            >
              Put your agents
              <br />
              <span className="font-serif font-normal italic text-neon-magenta">
                to work. Safely.
              </span>
            </h2>
            <p
              className="mt-6 max-w-xl text-sm leading-7 text-white/55 sm:text-base sm:leading-8"
            >
              Create an agent around the way you pay. Set its limits, review every
              proposal, and keep the final say with you.
            </p>

            <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
              <Link
                className="group inline-flex items-center gap-3 rounded-full bg-neon-purple px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_30px_rgba(115,19,255,0.2)] transition-all duration-300 hover:gap-4 hover:bg-neon-magenta hover:shadow-[0_10px_38px_rgba(212,77,255,0.28)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neon-magenta"
                href="/register"
              >
                Create your first agent
              </Link>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-white/40">
                <ShieldCheck className="size-4 text-neon-magenta/80" />
                Your approval required.
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[440px] lg:ml-auto" data-cta-preview>
            <div
              aria-hidden="true"
              className="absolute -inset-5 rotate-[-6deg] rounded-[2rem] border border-white/10 bg-white/[0.025]"
            />
            <div
              aria-hidden="true"
              className="absolute -inset-2 rotate-[3deg] rounded-[2rem] border border-neon-magenta/20 bg-neon-magenta/[0.025]"
            />
            <div className="relative overflow-hidden rounded-[1.65rem] border border-white/10 bg-[#10120f]/90 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.48)] backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-neon-purple/15 text-neon-magenta">
                    <Bot className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Your first agent</p>
                    <p className="mt-0.5 text-xs text-white/40">Ready when you are</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-neon-magenta/20 bg-neon-magenta/[0.08] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-neon-magenta">
                  <span className="size-1.5 rounded-full bg-neon-magenta shadow-[0_0_10px_#D44DFF]" />
                  You are in control
                </span>
              </div>

              <div className="py-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  Set it up your way
                </p>
                <p className="mt-2 text-2xl font-medium tracking-[-0.04em] text-white sm:text-3xl">
                  Your rules.
                  <span className="font-serif italic text-neon-magenta"> Your call.</span>
                </p>
              </div>

              <div className="space-y-3">
                {setupItems.map(({ label, Icon }) => {
                  return (
                    <div
                      className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3"
                      key={label}
                    >
                      <span className="grid size-8 place-items-center rounded-lg bg-white/[0.05] text-neon-purple">
                        <Icon className="size-4" />
                      </span>
                      <span className="text-xs font-medium text-white/65">{label}</span>
                      <Check className="ml-auto size-4 text-neon-magenta/80" />
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-4 text-[10px] text-white/35">
                <span>Payments wait for your approval</span>
                <ShieldCheck className="size-4 text-neon-purple/80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
