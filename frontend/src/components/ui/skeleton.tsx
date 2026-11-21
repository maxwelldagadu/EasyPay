import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

// Provide the shared shadcn-style pulse primitive used by all dashboard loading placeholders.
function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-white/[0.07]", className)}
      data-slot="skeleton"
      {...props}
    />
  );
}

export { Skeleton };
