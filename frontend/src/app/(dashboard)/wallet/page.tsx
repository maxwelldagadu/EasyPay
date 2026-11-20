import { DashboardPageHeading } from "@/components/my-components/dashboard/shared/dashboard-page-heading";
import { FeaturePreview } from "@/components/my-components/dashboard/shared/feature-preview";

// Wallet routes require the authenticated dashboard shell and are allowed to block on that session.
export const instant = false;

// Reserve the wallet destination without implying balances or deposits are already integrated.
export default function WalletPage() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <DashboardPageHeading
        description="Connect a wallet and manage testnet USDC only."
        eyebrow="Testnet wallet"
        title="Wallet"
      />
      <FeaturePreview
        description="Wallet connectivity, supported testnet detection, verified USDC deposits, token-contract checks, and deposit history are scheduled for the blockchain phase. Native testnet tokens will be reserved for gas and never counted as payment funds."
        phase="Phase 5"
        title="Testnet USDC wallet"
      />
    </div>
  );
}
