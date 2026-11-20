import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import { FeaturePreview } from "@/components/my-components/dashboard/shared/feature-preview";

// Settings routes require the authenticated dashboard shell and are allowed to block on that session.
export const instant = false;

// Reserve application settings as a separate feature route without duplicating Better Auth settings.
export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <DashboardPageHeading
        description="Manage account and platform preferences."
        eyebrow="Preferences"
        title="Settings"
      />
      <FeaturePreview
        description="Account and application preferences will be added in the refinement phase. Authentication and session management continue to be handled by Better Auth."
        phase="Phase 7"
        title="Workspace settings"
      />
    </div>
  );
}
