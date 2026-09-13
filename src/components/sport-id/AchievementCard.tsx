import { Trophy } from "lucide-react";
import type { AchievementRecord } from "@/lib/sport-id/types";
import { useSportId } from "@/lib/sport-id/store";
import { VerificationStatus } from "./SportStatusBadge";
import { SportGlyph } from "./SportGlyph";

export function AchievementCard({ item }: { item: AchievementRecord }) {
  const push = useSportId((s) => s.push);
  return (
    <button
      type="button"
      onClick={() => push({ type: "achievement", id: item.id })}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 text-left"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-lime/15 text-lime">
        <Trophy className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{item.title}</span>
        <span className="mt-0.5 flex items-center gap-1 text-2xs text-muted">
          <SportGlyph sport={item.sport} className="size-3.5" />
          {item.date} · {item.event}
        </span>
      </span>
      <VerificationStatus state={item.state} />
    </button>
  );
}
