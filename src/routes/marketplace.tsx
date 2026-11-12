import { createFileRoute } from "@tanstack/react-router";
import { EcosystemFrame } from "@/components/ecosystem/EcosystemFrame";
import { ServiceWorkspace } from "@/components/services/ServiceWorkspace";
export const Route = createFileRoute("/marketplace")({
  component: () => (
    <EcosystemFrame>
      <ServiceWorkspace />
    </EcosystemFrame>
  ),
});
