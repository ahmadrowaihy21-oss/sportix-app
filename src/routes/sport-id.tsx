import { createFileRoute } from "@tanstack/react-router";
import { EcosystemFrame } from "@/components/ecosystem/EcosystemFrame";
import { SportIDShell } from "@/components/sport-id/SportIDShell";

export const Route = createFileRoute("/sport-id")({ component: SportIdPage });

function SportIdPage() {
  return (
    <EcosystemFrame>
      <SportIDShell />
    </EcosystemFrame>
  );
}
