import { Skeleton } from "@/components/ui/skeleton";

// Mirror the balance and approval-card layout so loading keeps the page's visual structure stable.
export function ApprovalPageSkeleton() {
  return (
    <div aria-label="Loading payment approvals" className="space-y-6" role="status">
      <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-[#17121f] p-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-3">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-72 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-11 w-20 rounded-xl" />
        </div>
      </section>
      {[0, 1].map((item) => (
        <section
          className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#17121f] p-5"
          key={item}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((field) => (
              <div className="space-y-2" key={field}>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-48 max-w-full" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 border-t border-white/[0.07] pt-4">
            <Skeleton className="h-11 w-44 rounded-xl" />
            <Skeleton className="h-11 w-24 rounded-xl" />
            <Skeleton className="h-11 w-24 rounded-xl" />
          </div>
        </section>
      ))}
      <span className="sr-only">Loading payment approvals</span>
    </div>
  );
}
