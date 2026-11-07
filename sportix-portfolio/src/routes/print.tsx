import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/print")({
  beforeLoad: () => {
    throw redirect({ to: "/", search: { s: 1 } });
  },
  component: () => null,
});
