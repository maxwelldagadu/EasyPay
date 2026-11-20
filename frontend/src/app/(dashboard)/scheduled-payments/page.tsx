import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import { FeaturePreview } from "@/components/my-components/dashboard/shared/feature-preview";

// Schedule routes require the authenticated dashboard shell and are allowed to block on that session.
export const instant = false;

// Expose a dedicated schedule route without offering automatic execution before approvals exist.
export default function ScheduledPaymentsPage() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <DashboardPageHeading
        description="Review future and recurring payment requests before their due dates."
        eyebrow="Planning"
        title="Scheduled payments"
      />
      <FeaturePreview
        description="Schedules will create an approval request when payment is due. Each occurrence will require a fresh agent PIN and backend spending-limit checks; schedules will never authorize themselves."
        phase="Phase 6"
        title="Recurring payments, with approval every time"
      />
    </div>
  );
}
