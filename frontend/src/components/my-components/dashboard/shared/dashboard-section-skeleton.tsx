import { Skeleton } from "@/components/ui/skeleton";

// Use a consistent skeleton shell while any dashboard route segment is loading.
export function DashboardSectionSkeleton() {
  return (
    <div aria-label="Loading dashboard section" className="mx-auto max-w-[1100px] space-y-8" role="status">
      <header className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-4 w-[28rem] max-w-full" />
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#17121f] p-5"
            key={item}
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </section>
      <span className="sr-only">Loading dashboard section</span>
    </div>
  );
}
