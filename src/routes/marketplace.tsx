import { createFileRoute } from "@tanstack/react-router";
import { EcosystemFrame } from "@/components/ecosystem/EcosystemFrame";
import { MarketplaceShell } from "@/components/marketplace/MarketplaceShell";

export const Route = createFileRoute("/marketplace")({ component: MarketplacePage });

function MarketplacePage() {
  return (
    <EcosystemFrame>
      <MarketplaceShell />
    </EcosystemFrame>
  );
}
