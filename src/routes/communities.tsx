import { IntegrationNotice } from "@/components/athlete/IntegrationNotice";
import { createFileRoute } from "@tanstack/react-router";
import { EcosystemFrame } from "@/components/ecosystem/EcosystemFrame";
import { CommunitiesShell } from "@/components/sportix/CommunitiesShell";

export const Route = createFileRoute("/communities")({
  component: CommunitiesPage,
});

function CommunitiesPage() {
  return (
    <EcosystemFrame>
      <IntegrationNotice section="community" />
      <CommunitiesShell />
    </EcosystemFrame>
  );
}
