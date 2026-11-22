import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the transactions table layout so loading keeps the page stable.
export function PageSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading transactions">
      <section className="rounded-3xl border border-white/[0.08] bg-[#17121f] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </section>
      <div className="space-y-2">
        {[0, 1, 2].map((row) => (
          <div key={row} className="rounded-3xl border border-white/[0.08] bg-[#17121f] p-4">
            <div className="grid grid-cols-6 gap-4 items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}