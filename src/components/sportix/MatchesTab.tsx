import { useSportix } from "@/lib/sportix/store";
import { cn } from "@/lib/utils";
import { MatchCard } from "./MatchCard";

const filters = [
  { id: "upcoming", label: "Upcoming" },
  { id: "live", label: "Live" },
  { id: "completed", label: "Completed" },
] as const;

export function MatchesTab() {
  const matches = useSportix((s) => s.matches);
  const filter = useSportix((s) => s.matchFilter);
  const setFilter = useSportix((s) => s.setMatchFilter);
  const push = useSportix((s) => s.push);
  const list = matches.filter((m) => m.state === filter);

  return (
    <div>
      <div className="grid grid-cols-3 gap-1 px-4 py-3">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "h-9 rounded-md text-xs font-medium",
              filter === f.id ? "bg-lime text-lime-fg" : "bg-elevated text-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="space-y-3 px-4 pb-8">
        {list.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">No {filter} matches.</p>
        ) : (
          list.map((m) => (
            <MatchCard key={m.id} match={m} onOpen={() => push({ type: "match", matchId: m.id })} />
          ))
        )}
      </div>
    </div>
  );
}
