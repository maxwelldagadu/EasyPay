import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import { FeaturePreview } from "@/components/my-components/dashboard/shared/feature-preview";

// Experimental request routes require the authenticated dashboard session.
export const instant = false;

// Mark agent-to-agent requests as experimental and defer their authorization workflow to a later phase.
export default function AgentRequestsPage() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <DashboardPageHeading
        description="Review experimental requests between independently configured agents."
        eyebrow="Experimental"
        title="Agent requests"
      />
      <FeaturePreview
        description="A receiving agent will evaluate requests against its own permissions and spending rules. The owners of both agents must authorize transfers wherever required; no agent-to-agent payment will be automatic."
        phase="Phase 6"
        title="Agent-to-agent requests"
      />
    </div>
  );
}
