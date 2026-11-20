import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import { FeaturePreview } from "@/components/my-components/dashboard/shared/feature-preview";

// Transaction routes require the authenticated dashboard shell and are allowed to block on that session.
export const instant = false;

// Provide the planned transaction destination while clearly stating that history is not yet connected.
export default function TransactionsPage() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <DashboardPageHeading
        description="Search and filter the full history for your agents."
        eyebrow="Payment activity"
        title="Transactions"
      />
      <FeaturePreview
        description="Transaction history will be populated from verified database records and include agent, recipient, USDC amount, network, approval state, transaction hash, fees, and final status. No sample transactions or invented balances are displayed."
        phase="Phases 5–7"
        title="Your transaction history"
      />
    </div>
  );
}
