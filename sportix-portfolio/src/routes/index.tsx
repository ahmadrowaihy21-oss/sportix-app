import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DeckShell } from "@/components/deck/DeckShell";
import { SLIDE_COUNT } from "@/lib/portfolio/meta";

type Search = { s: number };

export const Route = createFileRoute("/")({
  validateSearch: (raw: Record<string, unknown>): Search => {
    const n = Number(raw.s);
    if (!Number.isFinite(n) || n < 1) return { s: 1 };
    return { s: Math.min(Math.floor(n), SLIDE_COUNT) };
  },
  component: Home,
});

function Home() {
  const { s } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  return (
    <DeckShell
      index={s}
      onIndex={(n) => {
        void navigate({ search: { s: n }, replace: true });
      }}
    />
  );
}
