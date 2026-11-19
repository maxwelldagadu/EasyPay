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
      "Every payment waits for the agent's unique four-digit PIN. Verification is backend-only, transaction-bound, and never visible to the AI.",
  },
  {
    eyebrow: "USDC testnet wallet",
    title: "Move test tokens:",
    italic: "only on supported networks.",
    description:
      "Connect a MetaMask wallet, verify the testnet, and keep USDC balances visible. ETH is reserved for gas and can never be used as a payment asset.",
  },
  {
    eyebrow: "Conversational intelligence",
    title: "Ask. Review.",
    italic: "Nothing moves by itself.",
    description:
      "Your agent translates natural language into a structured proposal, while deterministic controls validate balances, budgets, recipients, and risk.",
  },
] as const;

const cardStyles = [
  {
    shell: "border-white/50 bg-gradient-to-br from-[#303927] via-[#20271d] to-[#141811]",
    accent: "#dfff78",
    icon: "bg-[#dfff78] text-[#171910]",
  },
  {
    shell: "border-[#c7d8ff]/30 bg-gradient-to-br from-[#243657] via-[#1c2a43] to-[#111827]",
    accent: "#a9c7ff",
    icon: "bg-[#a9c7ff] text-[#17233a]",
  },
  {
    shell: "border-[#ffe4a3]/30 bg-gradient-to-br from-[#66502d] via-[#473921] to-[#241f17]",
    accent: "#ffd984",
    icon: "bg-[#ffd984] text-[#33291a]",
  },
  {
    shell: "border-[#ffc7ba]/30 bg-gradient-to-br from-[#68423a] via-[#4b302b] to-[#251918]",
    accent: "#ffb6a3",
    icon: "bg-[#ffb6a3] text-[#3a211d]",
  },
] as const;

export default function TrustMetric() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const pinned = pinnedRef.current;
    if (!section) return;

    if (reduceMotion) {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (instance) => {
          setActiveCard(Math.min(3, Math.round(instance.progress * 3)));
        },
      });
      return () => trigger.kill();
    }

    if (!pinned) return;

    // Pin the feature once and use one scrubbed timeline for the four-card sequence.
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
          scrub: 0.425,
          anticipatePin: 1,
          snap: [0, 1 / 3, 2 / 3, 1],
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
          duration: 0.5,
          ease: "power3.out",
        })
        .to(cards[0], { y: 20, rotate: -3, scale: 0.965, zIndex: 3, duration: 0.5, ease: "power3.inOut" }, "<")
        .to(cards[2], {
          y: 0,
          rotate: 0,
          scale: 1,
          zIndex: 4,
          duration: 0.5,
          ease: "power3.out",
        })
        .to(cards[1], { y: 20, rotate: 3, scale: 0.965, zIndex: 3, duration: 0.5, ease: "power3.inOut" }, "<")
        .to(cards[0], { y: 40, rotate: -3, scale: 0.93, zIndex: 2, duration: 0.5, ease: "power3.inOut" }, "<")
        .to(cards[3], {
          y: 0,
          rotate: 0,
          scale: 1,
          zIndex: 4,
          duration: 0.5,
          ease: "power3.out",
        })
        .to(cards[2], { y: 20, rotate: -3, scale: 0.965, zIndex: 3, duration: 0.5, ease: "power3.inOut" }, "<")
        .to(cards[1], { y: 40, rotate: -3, scale: 0.93, zIndex: 2, duration: 0.5, ease: "power3.inOut" }, "<")
        .to(cards[0], { y: 60, rotate: 2, scale: 0.895, zIndex: 1, duration: 0.5, ease: "power3.inOut" }, "<");

    }, pinned);

    return () => context.revert();
  }, [reduceMotion]);

  const current = cardContent[activeCard];
  const activeStyle = cardStyles[activeCard];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="trust-metric-heading"
      className="relative h-[400svh] bg-[#e8e9df] text-[#171910]"
      id="trust-metric"
    >
      <div ref={pinnedRef} className="relative isolate h-svh overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-36 -top-40 -z-10 size-[34rem] rounded-full border border-[#66734d]/[0.09]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 -z-10 size-[24rem] rounded-full border border-[#66734d]/[0.09]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -left-40 -z-10 size-[32rem] rounded-full bg-[#dfff78]/25 blur-[100px]"
        />

        <div className="mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="grid items-center gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
            <div
              className="relative z-20 hidden lg:block"
              data-trust-heading
              style={{ color: activeStyle.accent === "#dfff78" ? "#171910" : "#171910" }}
            >
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#566d32]">
                <ShieldCheck className="size-4" />
                {current.eyebrow}
              </p>
              <h2
                className="mt-6 max-w-xl text-5xl font-medium leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl"
                id="trust-metric-heading"
              >
                {current.title}
                <br />
                <span className="font-serif font-normal italic text-[#66734d]">
                  {current.italic}
                </span>
              </h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-black/60 sm:text-lg sm:leading-8">
                {current.description}
              </p>

              <div className="mt-9 flex gap-2" aria-label={`Card ${activeCard + 1} of 4`}>
                {[0, 1, 2, 3].map((index) => (
                  <span
                    className="relative h-1 w-12 overflow-hidden rounded-full bg-black/10"
                    key={index}
                  >
                    <span
                      className="absolute inset-0 origin-left rounded-full bg-[#566d32] transition-transform duration-500"
                      data-card-progress
                      style={{ transform: `scaleX(${index === activeCard ? 1 : 0})` }}
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto h-[410px] w-full max-w-[620px] sm:h-[520px]" data-story-stage>
              <div
                aria-hidden="true"
                className="absolute -inset-4 rotate-[-5deg] rounded-[2rem] border border-white/80 bg-white/35 shadow-xl shadow-black/[0.04] sm:-inset-5"
              />
              <div
                aria-hidden="true"
                className="absolute -inset-2 rotate-[3deg] rounded-[2rem] border border-black/[0.06] bg-white/35 shadow-xl shadow-black/[0.04]"
              />
              {[0, 1, 2, 3].map((index) => (
                <article
                  aria-hidden={index !== activeCard && !reduceMotion}
                  className={`absolute inset-0 origin-center ${
                    reduceMotion
                      ? index === activeCard
                        ? "opacity-100"
                        : "opacity-0"
                      : ""
                  }`}
                  data-story-card
                  key={index}
                >
                  <div
                    className={`relative h-full overflow-hidden rounded-[1.75rem] border p-5 text-white sm:rounded-[2rem] sm:p-8 ${cardStyles[index].shell}`}
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

          <div className="mt-7 hidden flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-black/40 lg:flex">
            <span>Independent budgets</span>
            <span className="size-1 rounded-full bg-[#899273]" />
            <span>Deterministic backend checks</span>
            <span className="size-1 rounded-full bg-[#899273]" />
            <span>Pause any agent instantly</span>
          </div>
        </div>
      </div>

      {reduceMotion && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#171910] px-4 py-2 text-xs text-white">
          Card {activeCard + 1} of 4
        </div>
      )}
    </section>
  );
}

function SpendingCard() {
  return (
    <CardFrame
      accent="#dfff78"
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
      accent="#a9c7ff"
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
              <span className="m-auto size-2 rounded-full bg-[#a9c7ff]" key={dot} />
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
      accent="#ffd984"
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
      accent="#ffb6a3"
      icon={<Bot className="size-5" />}
      title="EasyPay Agent"
      subtitle="Natural-language payment assistant"
      badge="Review first"
    >
      <div className="mt-7 space-y-3 sm:mt-9">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#ffb6a3] px-4 py-3 text-sm font-medium text-[#3a211d]">
          Send 45 USDC to my supplier.
        </div>
        <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.055] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ffb6a3]">Structured proposal</p>
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
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid size-11 shrink-0 place-items-center rounded-2xl shadow-lg shadow-black/15 sm:size-12"
              style={{ backgroundColor: accent, color: "#171910" }}
            >
              {icon}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title}</p>
              <p className="mt-1 truncate text-[10px] text-white/50 sm:text-xs">{subtitle}</p>
            </div>
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] sm:px-3 sm:text-[10px]"
            style={{ borderColor: `${accent}33`, backgroundColor: `${accent}18`, color: accent }}
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
