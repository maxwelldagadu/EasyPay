import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import { FeaturePreview } from "@/components/my-components/dashboard/shared/feature-preview";

// Approval routes require the authenticated dashboard shell and are allowed to block on that session.
export const instant = false;

// Keep approval navigation available while making its execution controls clearly future-phase work.
export default function ApprovalsPage() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <DashboardPageHeading
        description="Review proposed transactions and authorize each payment explicitly."
        eyebrow="Financial controls"
        title="Payment approvals"
      />
      <FeaturePreview
        description="The approval queue will show agent, recipient, USDC amount, network, available balance, remaining budget, estimated gas, and request expiry. Every payment will require its own agent PIN and backend revalidation."
        phase="Phase 4"
        relatedHref="/agents"
        relatedLabel="Configure an agent"
        title="You stay in control of every payment"
      />
    </div>
  );
}
