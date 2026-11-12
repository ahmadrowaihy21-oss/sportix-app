import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/marketplace-integration")({
  component: () => <Navigate to="/services" replace />,
});
