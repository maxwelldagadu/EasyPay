import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface FeaturePreviewProps {
  title: string;
  description: string;
  phase: string;
  relatedHref?: string;
  relatedLabel?: string;
}

// Mark later-phase dashboard destinations transparently so planned features are never mistaken for live controls.
export function FeaturePreview({
  title,
  description,
  phase,
  relatedHref,
  relatedLabel,
}: FeaturePreviewProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#17121f] p-7 sm:p-10">
      <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-neon-purple/[0.12] blur-3xl" />
      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-neon-magenta/20 bg-neon-magenta/[0.07] px-3 py-1.5 text-xs font-medium text-neon-magenta">
          <Sparkles aria-hidden="true" className="size-3.5" />
          Planned for {phase}
        </span>
        <h2 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-white/50">{description}</p>
        {relatedHref && relatedLabel && (
          <Link
            className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/75 transition-colors hover:border-neon-purple/40 hover:text-white"
            href={relatedHref}
          >
            {relatedLabel}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        )}
      </div>
    </section>
  );
}
