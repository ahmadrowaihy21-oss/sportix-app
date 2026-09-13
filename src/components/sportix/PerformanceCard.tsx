import { ChevronRight, MapPin, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PerformanceCardData, VerificationState } from "@/lib/sportix/types";
import { VerificationBadge } from "./VerificationBadge";

export function PerformanceCard({
  data,
  verification,
  onView,
  layout = "stack",
}: {
  data: PerformanceCardData;
  verification: VerificationState;
  onView?: () => void;
  layout?: "stack" | "side";
}) {
  const verified = verification === "verified";
  return (
    <section
      className={cn(
        "border border-border bg-surface-2",
        layout === "side" ? "h-full rounded-none border-x-0 md:border-t-0 md:border-l" : "rounded-none border-x-0",
        verified ? "border-l-2 border-l-lime" : "",
        verification === "pending" ? "border-dashed border-warn/50" : "",
      )}
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-3">
        <p className="font-display text-xs tracking-[0.18em] text-muted">{data.sportLabel}</p>
        <VerificationBadge state={verification} />
      </div>
      <p className="px-4 pt-1 font-display text-4xl leading-none tracking-tight text-fg tabular">
        {data.headline}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 px-4">
        {data.metrics.slice(0, 3).map((m) => (
          <div key={m.label}>
            <p className="font-display text-lg leading-none tracking-tight tabular text-fg">
              {m.value}
            </p>
            <p className="mt-1 text-2xs text-muted">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-3 text-2xs text-muted">
        {typeof data.spAi === "number" && verified ? (
          <span className="font-medium text-lime">+{data.spAi} SP AI</span>
        ) : null}
        {typeof data.weeklyRank === "number" && verified ? (
          <span className="inline-flex items-center gap-1">
            <Trophy className="size-3" aria-hidden="true" />
            #{data.weeklyRank} Weekly
          </span>
        ) : null}
        {data.zone ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" aria-hidden="true" />
            {data.zone}
          </span>
        ) : null}
        {onView ? (
          <button
            type="button"
            onClick={onView}
            className="ml-auto inline-flex items-center gap-0.5 font-medium text-fg hover:text-lime"
          >
            View Performance
            <ChevronRight className="size-3.5" />
          </button>
        ) : null}
      </div>
    </section>
  );
}
