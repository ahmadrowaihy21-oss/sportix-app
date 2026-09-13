import { MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SportMatch } from "@/lib/sportix/types";
import { SportIcon } from "./SportIcon";
import { VerificationBadge } from "./VerificationBadge";

export function MatchCard({
  match,
  onOpen,
}: {
  match: SportMatch;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full overflow-hidden rounded-xl border border-border bg-surface text-left"
    >
      <div className="relative h-28">
        <img src={match.media} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-bg/35" />
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider",
            match.state === "live" && "bg-live text-fg",
            match.state === "upcoming" && "bg-elevated text-fg",
            match.state === "completed" && "bg-bg/80 text-muted",
          )}
        >
          {match.state === "live" ? "Live" : match.state === "upcoming" ? "Upcoming" : "Completed"}
        </span>
        {match.score ? (
          <p className="absolute bottom-2 right-3 font-display text-3xl tabular leading-none">
            {match.score}
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5 p-3">
        <p className="flex items-center gap-1.5 text-2xs text-muted">
          <SportIcon sport={match.sport} />
          {match.sport}
        </p>
        <p className="text-sm font-semibold">{match.title}</p>
        <p className="text-xs text-muted">
          {match.home} vs {match.away}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-muted">
          <span>{match.when}</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" />
            {match.venue}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" />
            {match.acceptedIds.length}/{match.participantIds.length}
          </span>
          {match.verifiedResult ? <VerificationBadge state="verified" compact /> : null}
        </div>
      </div>
    </button>
  );
}
