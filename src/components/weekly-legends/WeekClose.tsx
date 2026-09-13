import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { useWeekly, useWeeklyBoard } from "@/lib/weekly-legends/store";
import type { ClosePhase } from "@/lib/weekly-legends/types";

const steps: { id: ClosePhase; label: string }[] = [
  { id: "CLOSING", label: "Finalizing verified activity..." },
  { id: "ELIGIBILITY_CHECK", label: "Checking eligibility..." },
  { id: "ANTI_CHEAT", label: "Reviewing suspicious activity..." },
  { id: "RANK_FREEZE", label: "Freezing ranking..." },
  { id: "WINNERS_CONFIRMED", label: "Confirming winners..." },
  { id: "REWARDS", label: "Issuing reward entitlements..." },
  { id: "SPORT_ID_RECORD", label: "Writing SPORT ID record..." },
];

export function WeekCloseFlow() {
  const phase = useWeekly((s) => s.closePhase);
  const screen = useWeekly((s) => s.screen);
  const advanceClose = useWeekly((s) => s.advanceClose);
  const goHome = useWeekly((s) => s.goHome);

  useEffect(() => {
    if (screen !== "week-close") return;
    const t = window.setTimeout(() => advanceClose(), 720);
    return () => window.clearTimeout(t);
  }, [phase, screen, advanceClose]);

  const idx = Math.max(0, steps.findIndex((s) => s.id === phase));

  return (
    <div className="px-5 py-8">
      <p className="text-2xs font-semibold tracking-[0.18em] text-lime">WEEK CLOSE</p>
      <h1 className="mt-2 font-display text-4xl leading-none">WEEK 37 IS CLOSING</h1>
      <ol className="mt-8 space-y-3">
        {steps.map((s, i) => (
          <li key={s.id} className="flex items-center justify-between text-sm">
            <span className={i <= idx ? "text-fg" : "text-faint"}>{s.label.replace("...", "")}</span>
            <span className={i < idx ? "text-lime" : i === idx ? "text-muted" : "text-faint"}>
              {i < idx ? "✓" : i === idx ? "…" : ""}
            </span>
          </li>
        ))}
      </ol>
      <Button variant="faint" className="mt-8 w-full" onClick={goHome}>
        Cancel demo
      </Button>
    </div>
  );
}

export function WinnerReveal() {
  const { all, meGlobal } = useWeeklyBoard();
  const winner = all[0];
  const claimReward = useWeekly((s) => s.claimReward);
  const open = useWeekly((s) => s.open);
  const navigate = useNavigate();
  const goHome = useWeekly((s) => s.goHome);

  return (
    <div>
      <ScreenHeader title="Week 37 complete" subtitle="Winners confirmed" onBack={goHome} />
      <div className="space-y-5 px-4 py-6 text-center">
        <p className="text-2xs font-semibold tracking-[0.2em] text-lime">WEEKLY LEGEND</p>
        <p className="font-display text-6xl leading-none">GOLD</p>
        <p className="font-display text-5xl leading-none">{winner?.name}</p>
        <p className="text-sm text-muted">
          1ST PLACE · {winner?.zone.toUpperCase()} · {winner?.sportLabel.toUpperCase()} · WEEK 37
        </p>
        <p className="text-sm text-lime">SPORTIX VERIFIED</p>
        <p className="text-2xs text-faint">
          Your result: #{meGlobal?.rank ?? "—"} global · {meGlobal?.ssp.toLocaleString()} SSP AI. Likes and
          SPORTIX SPONSOR do not change this.
        </p>
        <Button className="w-full" onClick={claimReward}>
          CLAIM REWARD
        </Button>
        <Button variant="outline" className="w-full" onClick={() => void navigate({ to: "/sport-id" })}>
          VIEW ACHIEVEMENT
        </Button>
        <Button variant="muted" className="w-full" onClick={() => open("home")}>
          Back to Weekly Legends
        </Button>
      </div>
    </div>
  );
}

export function WeeklyRewardCard() {
  const reward = useWeekly((s) => s.reward);
  const claimReward = useWeekly((s) => s.claimReward);
  const startNewWeek = useWeekly((s) => s.startNewWeek);
  const navigate = useNavigate();

  return (
    <div>
      <ScreenHeader title="Your reward" subtitle="Partner prize" onBack={() => useWeekly.getState().open("winner")} />
      <div className="space-y-4 px-4 py-6">
        <p className="text-2xs tracking-[0.16em] text-lime">YOUR REWARD</p>
        <h1 className="font-display text-4xl leading-none">{reward.title}</h1>
        <p className="text-sm">Provided by {reward.partner}</p>
        <p className="text-2xs text-faint">{reward.note}</p>
        {!reward.claimed ? (
          <Button className="w-full" onClick={claimReward}>
            CLAIM REWARD
          </Button>
        ) : (
          <>
            <p className="text-sm text-lime">Claimed · Marketplace benefit unlocked</p>
            <Button className="w-full" onClick={() => void navigate({ to: "/marketplace" })}>
              Open Marketplace
            </Button>
          </>
        )}
        <Button variant="outline" className="w-full" onClick={startNewWeek}>
          START NEW WEEK
        </Button>
      </div>
    </div>
  );
}
