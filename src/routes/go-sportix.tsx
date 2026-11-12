import { IntegrationNotice } from "@/components/athlete/IntegrationNotice";
import { createFileRoute } from "@tanstack/react-router";
import { EcosystemFrame } from "@/components/ecosystem/EcosystemFrame";
import { GoSportixShell } from "@/components/go-sportix/GoSportixShell";

export const Route = createFileRoute("/go-sportix")({ component: GoPage });

function GoPage() {
  return (
    <EcosystemFrame>
      <IntegrationNotice section="go" />
      <GoSportixShell />
    </EcosystemFrame>
  );
}
