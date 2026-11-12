import { createFileRoute } from "@tanstack/react-router";
import { EcosystemFrame } from "@/components/ecosystem/EcosystemFrame";
import { ServiceWorkspace } from "@/components/services/ServiceWorkspace";
export const Route = createFileRoute("/partners")({
  component: () => (
    <EcosystemFrame>
      <ServiceWorkspace partner />
    </EcosystemFrame>
  ),
});
