import type { LucideIcon } from "lucide-react";

interface OverviewMetricProps {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  accent?: "purple" | "green" | "magenta";
}

// Display only backed metrics and label planned financial values as unavailable until their phase ships.
export function OverviewMetric({
  label,
  value,
  note,
  icon: Icon,
  accent = "purple",
}: OverviewMetricProps) {
  const accentClasses = {
    purple: "bg-neon-purple/15 text-neon-magenta",
    green: "bg-emerald-400/[0.09] text-emerald-200",
    magenta: "bg-neon-magenta/10 text-neon-magenta",
  };

  return (
    <article className="rounded-2xl border border-white/[0.08] bg-[#17121f] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-white/45">{label}</p>
          <p className="mt-3 font-google-sans text-3xl font-semibold tracking-tight text-white">{value}</p>
        </div>
        <span className={`grid size-10 place-items-center rounded-xl ${accentClasses[accent]}`}>
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
      <p className="mt-3 text-xs text-white/35">{note}</p>
    </article>
  );
}
