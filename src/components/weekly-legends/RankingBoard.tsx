import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { Button } from "@/components/ui/button";
import { useWeekly, useWeeklyBoard } from "@/lib/weekly-legends/store";
import type { RankingContext, WeeklySport } from "@/lib/weekly-legends/types";
import { RULE_VERSION } from "@/lib/weekly-legends/mock";
import { cn } from "@/lib/utils";

const contexts: { id: RankingContext; label: string }[] = [
  { id: "global", label: "GLOBAL" },
  { id: "country", label: "COUNTRY" },
  { id: "zone", label: "CITY / ZONE" },
  { id: "sport", label: "SPORT" },
];

const sports: { id: WeeklySport | "all"; label: string }[] = [
  { id: "all", label: "ALL SPORTS" },
  { id: "football", label: "FOOTBALL" },
  { id: "padel", label: "PADEL" },
  { id: "running", label: "RUNNING" },
  { id: "walking", label: "WALKING" },
  { id: "hiking", label: "HIKING" },
  { id: "gym", label: "GYM" },
];

export function RankingBoard() {
  const goHome = useWeekly((s) => s.goHome);
  const context = useWeekly((s) => s.context);
  const setContext = useWeekly((s) => s.setContext);
  const sportFilter = useWeekly((s) => s.sportFilter);
  const setSportFilter = useWeekly((s) => s.setSportFilter);
  const open = useWeekly((s) => s.open);
  const setWhyRank = useWeekly((s) => s.setWhyRank);
  const { filtered, meCtx } = useWeeklyBoard();

  return (
    <div className="pb-16">
      <ScreenHeader title="Full ranking" subtitle="Weekly SSP AI" onBack={goHome} />
      <div className="px-4 pt-3">
        <div className="hide-scrollbar flex gap-1 overflow-x-auto">
          {contexts.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setContext(c.id)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-3xs font-semibold",
                context === c.id ? "bg-lime text-lime-fg" : "bg-elevated text-muted",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="hide-scrollbar mt-2 flex gap-1 overflow-x-auto">
          {sports.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSportFilter(s.id)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-3xs font-semibold",
                sportFilter === s.id ? "border border-lime text-lime" : "border border-border text-muted",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-3xs text-faint">
          Cross-sport comparison uses SSP AI only. Raw football metrics are never compared to raw running metrics.
        </p>
      </div>
      {meCtx ? (
        <div className="sticky top-14 z-10 mx-4 mt-3 rounded-xl border border-lime/40 bg-bg/95 px-3 py-2 backdrop-blur-md">
          <p className="text-3xs tracking-[0.14em] text-lime">YOUR POSITION</p>
          <p className="text-sm font-semibold">
            #{meCtx.rank} · {meCtx.ssp.toLocaleString()} SSP AI
          </p>
        </div>
      ) : (
        <p className="mx-4 mt-3 text-sm text-muted">You are not on this filtered board.</p>
      )}
      <ol className="mt-2">
        {filtered.map((e) => (
          <li key={e.userId}>
            <button
              type="button"
              onClick={() => open("athlete", e.userId)}
              className={cn(
                "flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left",
                e.isViewer && "bg-lime/10",
              )}
            >
              <span className="w-8 font-display text-lg tabular text-muted">#{e.rank}</span>
              {e.avatar ? (
                <img src={e.avatar} alt="" className="size-9 rounded-full object-cover" />
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full bg-elevated text-2xs">{e.name[0]}</span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{e.name}{e.isViewer ? " · you" : ""}</span>
                <span className="block text-2xs text-muted">
                  {e.sportLabel} · {e.zone} · {e.activities} verified
                </span>
              </span>
              <span className="text-right">
                <span className="block font-display text-lg tabular">{e.ssp.toLocaleString()}</span>
                {e.eligibility === "review" ? (
                  <span className="text-3xs text-warn">ON HOLD</span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="px-4 pt-3">
        <Button variant="outline" className="w-full" onClick={() => setWhyRank(true)}>
          WHY THIS RANK?
        </Button>
        <p className="mt-2 text-center text-3xs text-faint">Rule version {RULE_VERSION}</p>
      </div>
    </div>
  );
}
