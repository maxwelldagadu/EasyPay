import { DashboardSectionSkeleton } from "@/components/my-components/dashboard/shared/dashboard-section-skeleton";

// Show the shared shadcn-based section skeleton during dashboard route transitions.
export default function Loading() {
  return <DashboardSectionSkeleton />;
}
