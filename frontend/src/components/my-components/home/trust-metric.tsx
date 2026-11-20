import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Bot,
  CreditCard,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const cardContent = [
  {
    eyebrow: "Agent spending controls",
    title: "A card-shaped reminder:",
    italic: "every agent has limits.",
    description:
      "Give each named agent its own spending boundaries. The backend checks every payment request against those rules before it can reach your approval.",
  },
  {
    eyebrow: "Two-factor authorization",
    title: "No movement without:",
    italic: "your explicit PIN.",
    description:
      "Every payment waits for the agent's unique four-digit PIN. Verification is backend-only, transaction-bound and never visible to the AI.",
  },
  {
    eyebrow: "USDC testnet wallet",
    title: "Move test tokens:",
    italic: "only on supported networks.",
    description:
      "Connect a MetaMask wallet, verify the testnet and keep USDC balances visible.",
  },
  {
    eyebrow: "Conversational intelligence",
    title: "Ask. Review.",
    italic: "Nothing moves by itself.",
    description:
      "Your agent translates natural language into a structured proposal, while deterministic controls validate balances, budgets, recipients and risk.",
  },
] as const;

const cardStyles = [
  {
    shell: "border-neon-purple/30 bg-[#21182b] bg-gradient-to-br from-neon-purple/25 via-[#291a3b] to-[#17121e]",
    accent: "var(--color-neon-purple)",
  },
  {
    shell: "border-neon-magenta/30 bg-[#251a2b] bg-gradient-to-br from-neon-magenta/25 via-[#351d3d] to-[#1b1320]",
    accent: "var(--color-neon-magenta)",
  },
  {
    shell: "border-neon-purple/35 bg-[#261a36] bg-gradient-to-br from-[#4c2890] via-[#301b53] to-[#1b1426]",
    accent: "var(--color-neon-purple)",
  },
  {
    shell: "border-neon-magenta/35 bg-[#2a192b] bg-gradient-to-br from-[#782a86] via-[#421d4d] to-[#201327]",
    accent: "var(--color-neon-magenta)",
  },
] as const;

export default function TrustMetric() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);
  const [pinEnabled, setPinEnabled] = useState(false);

  useEffect(() => {
    const viewportQuery = window.matchMedia("(min-width: 1200px) and (min-height: 760px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateLayout = () => setPinEnabled(viewportQuery.matches && !motionQuery.matches);
    updateLayout();
    viewportQuery.addEventListener("change", updateLayout);
    motionQuery.addEventListener("change", updateLayout);
    return () => {
      viewportQuery.removeEventListener("change", updateLayout);
      motionQuery.removeEventListener("change", updateLayout);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const pinned = pinnedRef.current;
    if (!section) return;

    if (!pinEnabled || !pinned) {
      setActiveCard(0);
      return;
    }

    // Pin only large, motion-enabled viewports; smaller screens show every card in normal flow.
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-story-card]");
      const heading = pinned.querySelector("[data-trust-heading]");

      gsap.set(cards[0], { y: 0, scale: 1, rotate: 0, zIndex: 4, autoAlpha: 1 });
      gsap.set(cards[1], { y: 20, scale: 0.965, rotate: 3, zIndex: 3, autoAlpha: 1 });
      gsap.set(cards[2], { y: 40, scale: 0.93, rotate: -3, zIndex: 2, autoAlpha: 1 });
      gsap.set(cards[3], { y: 60, scale: 0.895, rotate: 2, zIndex: 1, autoAlpha: 1 });

      gsap.fromTo(
        heading,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        },
      );

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: pinned,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          anticipatePin: 1,
          snap: {
            snapTo: [0, 1 / 3, 2 / 3, 1],
            delay: 0.08,
            duration: { min: 0.25, max: 0.5 },
            ease: "power2.inOut",
          },
          onUpdate: (trigger) => {
            const nextCard =
              trigger.progress < 1 / 3
                ? 0
                : trigger.progress < 2 / 3
                  ? 1
                  : trigger.progress < 5 / 6
                    ? 2
                    : 3;
            setActiveCard((current) => (current === nextCard ? current : nextCard));
          },
        },
      });

      timeline
        .to(cards[1], {
          y: 0,
          rotate: 0,
          scale: 1,
          zIndex: 4,
          duration: 0.65,
          ease: "power2.inOut",
        })
        .to(cards[0], { y: 20, rotate: -3, scale: 0.965, zIndex: 3, duration: 0.65, ease: "power2.inOut" }, "<")
        .to(cards[2], {
          y: 0,
          rotate: 0,
          scale: 1,
          zIndex: 4,
          duration: 0.65,
          ease: "power2.inOut",
        })
        .to(cards[1], { y: 20, rotate: 3, scale: 0.965, zIndex: 3, duration: 0.65, ease: "power2.inOut" }, "<")
        .to(cards[0], { y: 40, rotate: -3, scale: 0.93, zIndex: 2, duration: 0.65, ease: "power2.inOut" }, "<")
        .to(cards[3], {
          y: 0,
          rotate: 0,
          scale: 1,
          zIndex: 4,
          duration: 0.65,
          ease: "power2.inOut",
        })
        .to(cards[2], { y: 20, rotate: -3, scale: 0.965, zIndex: 3, duration: 0.65, ease: "power2.inOut" }, "<")
        .to(cards[1], { y: 40, rotate: -3, scale: 0.93, zIndex: 2, duration: 0.65, ease: "power2.inOut" }, "<")
        .to(cards[0], { y: 60, rotate: 2, scale: 0.895, zIndex: 1, duration: 0.65, ease: "power2.inOut" }, "<");

    }, pinned);

    return () => context.revert();
  }, [pinEnabled]);

  const current = cardContent[activeCard];
  const activeStyle = cardStyles[activeCard];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="trust-metric-heading"
      className={`relative bg-[#10120f] text-[#f3f1e8] ${
        pinEnabled ? "h-[400svh]" : "h-auto"
      }`}
      id="trust-metric"
    >
      <div
        ref={pinnedRef}
        className={`relative isolate ${
          pinEnabled ? "h-svh overflow-hidden" : "min-h-svh overflow-visible"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-36 -top-40 -z-10 size-[34rem] rounded-full border border-neon-purple/[0.09]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 -z-10 size-[24rem] rounded-full border border-neon-magenta/[0.12]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 -top-44 -z-10 size-[30rem] rounded-full bg-neon-purple/12 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -left-40 -z-10 size-[32rem] rounded-full bg-neon-magenta/15 blur-[100px]"
        />

        <div
          className={`mx-auto flex w-full max-w-7xl flex-col justify-center gap-7 px-5 py-12 sm:px-8 sm:py-16 lg:mx-0 lg:max-w-none lg:px-12 ${
            pinEnabled ? "h-full" : "min-h-svh"
          }`}
        >
          <div
            className={`grid items-center gap-8 ${
              pinEnabled ? "lg:grid-cols-[0.88fr_1.12fr] lg:gap-16" : ""
            }`}
          >
            <div
              className="relative z-20 lg:block"
              data-trust-heading
            >
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-neon-purple">
                <ShieldCheck className="size-4" />
                {current.eyebrow}
              </p>
              <h2
                className="mt-6 max-w-xl text-5xl font-medium leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:max-w-2xl lg:text-[5rem]"
                id="trust-metric-heading"
              >
                {current.title}
                <br />
                <span className="font-serif font-normal italic" style={{ color: activeStyle.accent }}>
                  {current.italic}
                </span>
              </h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/65 sm:text-lg sm:leading-8 lg:text-xl">
                {current.description}
              </p>

              {pinEnabled && (
                <div className="mt-9 flex gap-2" aria-label={`Card ${activeCard + 1} of 4`}>
                  {[0, 1, 2, 3].map((index) => (
                    <span
                      className="relative h-1 w-12 overflow-hidden rounded-full bg-white/15"
                      key={index}
                    >
                      <span
                        className="absolute inset-0 origin-left rounded-full transition-transform duration-500"
                        data-card-progress
                        style={{
                          backgroundColor: activeStyle.accent,
                          transform: `scaleX(${index === activeCard ? 1 : 0})`,
                        }}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`relative w-full ${
                pinEnabled
                  ? "h-[min(560px,60svh)] min-h-[380px] max-w-[680px]"
                  : "grid grid-cols-1 gap-5 sm:grid-cols-2"
              }`}
              data-story-stage
            >
              {pinEnabled && (
                <>
                  <div
                    aria-hidden="true"
                    className="absolute -inset-4 rotate-[-5deg] rounded-[2rem] border border-neon-magenta/25 bg-[#21182b]/80 shadow-xl shadow-black/25 sm:-inset-5"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -inset-2 rotate-[3deg] rounded-[2rem] border border-white/10 bg-[#191520]/90 shadow-xl shadow-black/25"
                  />
                </>
              )}
              {[0, 1, 2, 3].map((index) => (
                <article
                  aria-hidden={pinEnabled && index !== activeCard}
                  className={`${
                    pinEnabled ? "absolute inset-0 origin-center" : "relative min-h-[320px]"
                  }`}
                  data-story-card
                  key={index}
                >
                  <div
                    className={`relative ${
                      pinEnabled ? "h-full overflow-hidden" : "min-h-[320px]"
                    } rounded-[1.75rem] border p-5 text-white sm:rounded-[2rem] sm:p-8 ${cardStyles[index].shell}`}
                  >
                    {index === 0 && <SpendingCard />}
                    {index === 1 && <ApprovalCard />}
                    {index === 2 && <WalletCard />}
                    {index === 3 && <IntelligenceCard />}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/10 pt-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/45 sm:grid-cols-3">
            {[
              "Independent budgets",
              "Deterministic backend checks",
              "Pause any agent instantly",
            ].map((item, index) => (
              <span className="flex items-center gap-2" key={item}>
                <span
                  className={`size-1 shrink-0 rounded-full ${
                    index === 1 ? "bg-neon-magenta/70" : "bg-neon-purple/70"
                  }`}
                />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SpendingCard() {
  return (
    <CardFrame
      accent="var(--color-neon-purple)"
      icon={<CreditCard className="size-5" />}
      title="Shopping Assistant"
      subtitle="Agent spending card · Example"
      badge="Rules active"
    >
      <MetricSection label="Monthly agent budget" value="$500" unit="USDC / month" />
      <TwoMetrics
        firstLabel="Per-payment maximum"
        firstValue="$100"
        firstUnit="USDC"
        secondLabel="Recipient controls"
        secondValue="Customized per agent"
      />
    </CardFrame>
  );
}

function ApprovalCard() {
  return (
    <CardFrame
      accent="var(--color-neon-magenta)"
      icon={<Fingerprint className="size-5" />}
      title="Business Payments"
      subtitle="Transaction authorization · Secure"
      badge="PIN required"
    >
      <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:mt-9 sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Authorize transfer</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-3xl font-semibold tracking-tight sm:text-4xl">$250.00</p>
            <p className="mt-1 text-xs text-white/45">USDC · Base Sepolia</p>
          </div>
          <div className="grid size-14 grid-cols-2 gap-1 rounded-2xl border border-white/10 p-2">
            {[0, 1, 2, 3].map((dot) => (
              <span className="m-auto size-2 rounded-full bg-neon-purple" key={dot} />
            ))}
          </div>
        </div>
      </div>
      <TwoMetrics
        firstLabel="Approval status"
        firstValue="Waiting"
        firstUnit=""
        secondLabel="Transaction"
        secondValue="One-time binding"
      />
    </CardFrame>
  );
}

function WalletCard() {
  return (
    <CardFrame
      accent="var(--color-neon-purple)"
      icon={<WalletCards className="size-5" />}
      title="My Testnet Wallet"
      subtitle="Connected · 0x71F2...8D1A"
      badge="USDC only"
    >
      <div className="mt-7 border-y border-white/10 py-7 sm:mt-9 sm:py-9">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Available balance</p>
        <p className="mt-2 text-5xl font-medium tracking-[-0.06em] sm:text-6xl">$1,240</p>
        <p className="mt-3 text-sm text-white/45">USDC · Base Sepolia testnet</p>
      </div>
      <TwoMetrics
        firstLabel="Gas asset"
        firstValue="ETH"
        firstUnit="Gas only"
        secondLabel="Network"
        secondValue="Base Sepolia"
      />
    </CardFrame>
  );
}

function IntelligenceCard() {
  return (
    <CardFrame
      accent="var(--color-neon-magenta)"
      icon={<Bot className="size-5" />}
      title="EasyPay Agent"
      subtitle="Natural-language payment assistant"
      badge="Review first"
    >
      <div className="mt-7 space-y-3 sm:mt-9">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-neon-magenta px-4 py-3 text-sm font-medium text-[#24112c]">
          Send 45 USDC to my supplier.
        </div>
        <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.055] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neon-magenta">Structured proposal</p>
          <p className="mt-2 text-sm text-white/80">45 USDC · Supplier wallet · Within daily limit</p>
        </div>
      </div>
      <TwoMetrics
        firstLabel="AI execution"
        firstValue="Blocked"
        firstUnit=""
        secondLabel="User action"
        secondValue="Required"
      />
    </CardFrame>
  );
}

function CardFrame({
  accent,
  icon,
  title,
  subtitle,
  badge,
  children,
}: {
  accent: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <div className="relative h-full">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-36 size-[26rem] rounded-full border border-white/[0.08]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-5 -top-20 size-[19rem] rounded-full border border-white/[0.08]"
      />
      <div className="relative flex h-full flex-col">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid size-11 shrink-0 place-items-center rounded-2xl shadow-lg shadow-black/15 sm:size-12"
              style={{ backgroundColor: accent, color: "#171910" }}
            >
              {icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-[10px] text-white/50 sm:text-xs">{subtitle}</p>
            </div>
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] lg:self-auto sm:px-3 sm:text-[10px]"
            style={{
              borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`,
              color: accent,
            }}
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }} />
            {badge}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function MetricSection({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="mt-7 border-y border-white/10 py-6 sm:mt-10 sm:py-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{label}</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
        <p className="text-5xl font-medium tracking-[-0.06em] sm:text-6xl">{value}</p>
        <span className="text-sm font-medium text-white/45">{unit}</span>
      </div>
      <p className="mt-5 text-[10px] text-white/40">Example settings · every agent has its own budget</p>
    </div>
  );
}

function TwoMetrics({
  firstLabel,
  firstValue,
  firstUnit,
  secondLabel,
  secondValue,
}: {
  firstLabel: string;
  firstValue: string;
  firstUnit: string;
  secondLabel: string;
  secondValue: string;
}) {
  return (
    <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3.5 sm:p-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45 sm:text-[10px]">{firstLabel}</p>
        <p className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          {firstValue} {firstUnit && <span className="text-xs font-medium text-white/45">{firstUnit}</span>}
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3.5 sm:p-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45 sm:text-[10px]">{secondLabel}</p>
        <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
          <LockKeyhole className="size-4 shrink-0" />
          {secondValue}
        </p>
      </div>
    </div>
  );
}
