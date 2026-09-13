import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useGo } from "@/lib/go-sportix/store";
import { useWeekly, useWeeklyBoard } from "@/lib/weekly-legends/store";
import { cn } from "@/lib/utils";

export function YourWeekCard() {
  const { meGlobal, next } = useWeeklyBoard();
  const lastMove = useWeekly((s) => s.lastMove);
  const phase = useWeekly((s) => s.closePhase);
  const setWhyRank = useWeekly((s) => s.setWhyRank);
  const markEntered = useWeekly((s) => s.markEntered);
  const ssp = useWeekly((s) => s.ssp);
  const activities = useWeekly((s) => s.activities);
  const streak = useWeekly((s) => s.streak);
  const navigate = useNavigate();
  const [shown, setShown] = useState(meGlobal?.rank ?? 18);

  useEffect(() => {
    if (!lastMove || lastMove.from === lastMove.to) {
      setShown(meGlobal?.rank ?? 18);
      return;
    }
    setShown(lastMove.from);
    const dir = lastMove.to < lastMove.from ? -1 : 1;
    let cur = lastMove.from;
    const t = window.setInterval(() => {
      cur += dir;
      setShown(cur);
      if (cur === lastMove.to) window.clearInterval(t);
    }, 280);
    return () => window.clearInterval(t);
  }, [lastMove, meGlobal?.rank]);

  if (phase === "NEW_WEEK" || ssp === 0) {
    return (
      <section className="mx-4 rounded-2xl border border-lime/35 bg-lime/10 p-4">
        <p className="text-2xs font-semibold tracking-[0.16em] text-lime">YOUR WEEK</p>
        <p className="mt-2 font-display text-3xl">Unranked</p>
        <p className="mt-1 text-sm text-muted">Weekly SSP reset. History stays on SPORT ID.</p>
        <Button className="mt-4 w-full" onClick={() => { markEntered(); useGo.getState().chooseActivity("running"); void navigate({ to: "/go-sportix" }); }}>
          GO SPORTIX
        </Button>
      </section>
    );
  }

  const need = next ? Math.max(0, next.ssp - ssp) : 0;
  const jeddahRank = useWeeklyBoard().all.filter((e) => e.zone === "Jeddah").sort((a, b) => b.ssp - a.ssp).findIndex((e) => e.isViewer) + 1;

  return (
    <section className="mx-4 overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="px-4 pt-4">
        <p className="text-2xs font-semibold tracking-[0.16em] text-lime">YOUR WEEK</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{meGlobal?.name}</h2>
            <p className="text-2xs text-muted">Jeddah · Football</p>
          </div>
          <div className="text-right">
            <p className={cn("font-display text-5xl leading-none tabular", lastMove && lastMove.to !== lastMove.from && "text-lime")}>
              #{shown}
            </p>
            <p className="text-3xs text-muted">GLOBAL</p>
          </div>
        </div>
        {lastMove && lastMove.to < lastMove.from ? (
          <p className="mt-2 text-sm font-semibold text-lime">↑ {lastMove.from - lastMove.to} POSITIONS</p>
        ) : (
          <p className="mt-2 text-sm text-lime">↑ 7 this week</p>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-px bg-border">
        <Cell k="SSP AI" v={ssp.toLocaleString()} />
        <Cell k="# Jeddah" v={`#${jeddahRank || "—"}`} />
        <Cell k="Verified activities" v={String(activities)} />
        <Cell k="Current streak" v={`${streak} DAYS`} />
      </div>
      <div className="space-y-2 p-4">
        <NextTargetCard need={need} nextRank={next?.rank} nextSsp={next?.ssp} />
        <Button
          className="h-12 w-full"
          onClick={() => {
            markEntered();
            useGo.getState().chooseActivity("running");
            void navigate({ to: "/go-sportix" });
          }}
        >
          GO SPORTIX
        </Button>
        <Button variant="outline" className="w-full" onClick={() => setWhyRank(true)}>
          WHY THIS RANK?
        </Button>
      </div>
    </section>
  );
}

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-surface-2 px-4 py-3">
      <p className="font-display text-xl tabular">{v}</p>
      <p className="mt-1 text-3xs text-muted">{k}</p>
    </div>
  );
}

export function NextTargetCard({
  need,
  nextRank,
  nextSsp,
}: {
  need: number;
  nextRank?: number;
  nextSsp?: number;
}) {
  if (!nextRank) {
    return (
      <div className="rounded-xl border border-lime/40 bg-lime/10 px-3 py-3">
        <p className="text-2xs tracking-[0.14em] text-lime">NEXT TARGET</p>
        <p className="mt-1 text-sm">You are leading this board.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-bg px-3 py-3">
      <p className="text-2xs tracking-[0.14em] text-muted">NEXT TARGET · #{nextRank}</p>
      <p className="mt-1 font-display text-3xl tabular text-lime">{need} SSP</p>
      <p className="text-2xs text-muted">
        {need} SSP to #{nextRank}
        {nextSsp ? ` · they have ${nextSsp.toLocaleString()}` : ""}
      </p>
      <p className="mt-2 text-3xs text-faint">Eligible verified activity. Formula is not published.</p>
    </div>
  );
}
