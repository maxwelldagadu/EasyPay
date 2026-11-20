import type { ReactNode } from "react";

interface DashboardPageHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

// Standardize feature headings so the dashboard feels cohesive from overview through agent settings.
export function DashboardPageHeading({
  eyebrow,
  title,
  description,
  action,
}: DashboardPageHeadingProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neon-magenta">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-google-sans text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">{description}</p>
      </div>
      {action}
    </div>
  );
}
