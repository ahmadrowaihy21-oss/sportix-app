import { createFileRoute } from "@tanstack/react-router";
import { EcosystemFrame } from "@/components/ecosystem/EcosystemFrame";
import { WeeklyLegendsShell } from "@/components/weekly-legends/WeeklyLegendsShell";

export const Route = createFileRoute("/weekly-legends")({ component: WeeklyPage });

function WeeklyPage() {
  return (
    <EcosystemFrame>
      <WeeklyLegendsShell />
    </EcosystemFrame>
  );
}
