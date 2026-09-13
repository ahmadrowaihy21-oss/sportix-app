import { useEffect, useState } from "react";
import { useWeekly } from "@/lib/weekly-legends/store";

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

export function WeekCountdown({ endsAt }: { endsAt: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const left = Math.max(0, endsAt - now);
  const d = Math.floor(left / 86_400_000);
  const h = Math.floor((left % 86_400_000) / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  return (
    <p className="font-display text-2xl tabular tracking-tight">
      {d}D {pad(h)}H {pad(m)}M {pad(s)}S
    </p>
  );
}

export function WeeklyHeader() {
  const week = useWeekly((s) => s.week);
  const endsAt = useWeekly((s) => s.endsAt);
  const phase = useWeekly((s) => s.closePhase);
  return (
    <header className="px-4 pt-5">
      <p className="font-display text-sm tracking-[0.22em] text-lime">SPORTIX</p>
      <h1 className="mt-1 font-display text-4xl leading-none">WEEKLY LEGENDS</h1>
      <p className="mt-2 text-sm text-muted">Every week creates new legends.</p>
      <div className="mt-4 flex items-end justify-between rounded-2xl border border-border bg-surface px-4 py-3">
        <div>
          <p className="text-2xs font-semibold tracking-[0.16em] text-muted">WEEK {week}</p>
          <p className="mt-1 text-2xs text-muted">
            {phase === "NEW_WEEK" ? "New week · play to enter" : phase === "ACTIVE" ? "Ends in" : phase.replaceAll("_", " ")}
          </p>
        </div>
        {phase === "ACTIVE" || phase === "NEW_WEEK" ? <WeekCountdown endsAt={endsAt} /> : (
          <p className="text-2xs font-semibold text-lime">{phase === "WINNERS_CONFIRMED" ? "COMPLETE" : "CLOSING"}</p>
        )}
      </div>
    </header>
  );
}
