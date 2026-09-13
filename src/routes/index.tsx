import { createFileRoute } from "@tanstack/react-router";
import { EcosystemFrame } from "@/components/ecosystem/EcosystemFrame";
import { HomeShell } from "@/components/home/HomeShell";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <EcosystemFrame>
      <HomeShell />
    </EcosystemFrame>
  );
}
