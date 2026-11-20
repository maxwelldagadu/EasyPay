import { DashboardOverview } from "@/components/my-components/dashboard/overview/dashboard-overview";
import { getAgentsForDashboard } from "@/features/agents/services/agent-queries";

// This protected page intentionally waits for the signed-in session and private agent data.
export const instant = false;

// Render the signed-in user's agent data; the parent layout is the single session gate.
export default async function DashboardPage() {
  const result = await getAgentsForDashboard();
  if (result.error || !result.data) {
    return (
      <section className="mx-auto max-w-[1320px] rounded-2xl border border-red-300/15 bg-red-500/[0.06] p-6">
        <h1 className="text-lg font-semibold text-white">Dashboard data is unavailable</h1>
        <p className="mt-2 text-sm text-red-100/75">{result.error ?? "The agent service returned no data."}</p>
        <p className="mt-2 text-xs text-white/40">Check that the you have a good internet connection.</p>
      </section>
    );
  }

  return (
    <DashboardOverview agents={result.data} />
  );
}

