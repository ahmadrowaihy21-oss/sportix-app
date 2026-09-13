import { useSportId } from "@/lib/sport-id/store";
import type { ViewMode } from "@/lib/sport-id/types";
import { cn } from "@/lib/utils";

const views: { id: ViewMode; label: string }[] = [
  { id: "owner", label: "My SPORT ID" },
  { id: "public", label: "Public" },
  { id: "professional", label: "Coach / Academy" },
];

export function SportIDHeader() {
  const view = useSportId((s) => s.view);
  const setView = useSportId((s) => s.setView);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/92 px-3 py-2 backdrop-blur-md">
      <div className="flex h-9 items-center justify-between">
        <div>
          <p className="font-display text-sm leading-none tracking-[0.18em]">SPORTIX</p>
          <p className="mt-0.5 text-3xs font-medium tracking-[0.22em] text-muted">SPORT ID</p>
        </div>
      </div>
      <div className="mt-2 flex gap-1">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={cn(
              "h-8 flex-1 rounded-full text-3xs font-semibold",
              view === v.id ? "bg-lime text-lime-fg" : "bg-elevated text-muted",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
    </header>
  );
}
