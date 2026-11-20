import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import { FeaturePreview } from "@/components/my-components/dashboard/shared/feature-preview";

// Marketplace routes require the authenticated dashboard shell and are allowed to block on that session.
export const instant = false;

// Keep future agent discovery isolated from the user's privately configured agents.
export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <DashboardPageHeading
        description="Discover specialized agent templates without surrendering control of permissions."
        eyebrow="Explore"
        title="Agent marketplace"
      />
      <FeaturePreview
        description="Marketplace templates may eventually cover shopping, subscriptions, business expenses, and travel. Installed agents will remain user-owned and require the same independent budget and PIN configuration."
        phase="Phase 6"
        title="A marketplace built around user control"
      />
    </div>
  );
}
