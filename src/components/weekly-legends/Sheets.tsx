import { BottomSheet } from "@/components/sportix/BottomSheet";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { useWeekly, useWeeklyBoard } from "@/lib/weekly-legends/store";
import { RULE_VERSION } from "@/lib/weekly-legends/mock";
import { useNavigate } from "@tanstack/react-router";

export function WhyThisRankSheet() {
  const open = useWeekly((s) => s.whyRankOpen);
  const setWhyRank = useWeekly((s) => s.setWhyRank);
  const week = useWeekly((s) => s.week);
  const ssp = useWeekly((s) => s.ssp);
  const activities = useWeekly((s) => s.activities);
  const { meGlobal } = useWeeklyBoard();
  return (
    <BottomSheet open={open} onClose={() => setWhyRank(false)} title="WHY THIS RANK?" height="tall">
      <div className="space-y-3 px-4 pb-8">
        <Row k={`Week ${week}`} v={meGlobal ? `#${meGlobal.rank} global` : "Unranked"} />
        <Row k="Eligible verified activities" v={String(activities)} />
        <Row k="Sessions excluded" v={String(meGlobal?.excludedSessions ?? 1)} />
        <Row k="Current SSP AI" v={ssp.toLocaleString()} />
        <Row k="Ranking context" v="GLOBAL · Jeddah visible in zone tab" />
        <Row k="Rule version" v={RULE_VERSION} />
        <Row k="Verification" v="CURRENT" />
        {meGlobal?.eligibility === "review" ? (
          <p className="rounded-xl border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
            Weekly rank temporarily on hold · activity verification review. This is not an accusation.
          </p>
        ) : null}
        <p className="text-3xs text-faint">
          Protected scoring weights, fraud thresholds and model internals are not shown. Likes,
          SPORTIX SPONSOR and Marketplace spend do not change this rank.
        </p>
      </div>
    </BottomSheet>
  );
}

export function WhySelectedSheet() {
  const open = useWeekly((s) => s.whySelectedOpen);
  const setWhy = useWeekly((s) => s.setWhySelected);
  return (
    <BottomSheet open={open} onClose={() => setWhy(false)} title="WHY SELECTED?" height="tall">
      <div className="space-y-3 px-4 pb-8">
        <Row k="SPORTIX Vision" v="✓" />
        <Row k="Verified matches" v="3" />
        <Row k="Evidence quality" v="HIGH" />
        <Row k="Coverage" v="92%" />
        <Row k="Performance consistency" v="HIGH" />
        <Row k="Human review" v="COMPLETED" />
        <p className="text-3xs text-faint">
          Football Player of the Week is sport-specific. A Football 91 is not a Padel 91. Model
          weights are not published.
        </p>
      </div>
    </BottomSheet>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-3 py-3 text-sm">
      <span className="text-muted">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}

export function AthleteCard() {
  const id = useWeekly((s) => s.selectedAthleteId);
  const goHome = useWeekly((s) => s.goHome);
  const { all } = useWeeklyBoard();
  const navigate = useNavigate();
  const athlete = all.find((e) => e.userId === id) ?? all[0];
  if (!athlete) return null;
  return (
    <div>
      <ScreenHeader title={athlete.name} subtitle="Weekly competitor" onBack={goHome} />
      <div className="space-y-4 px-4 py-4">
        {athlete.avatar ? (
          <img src={athlete.avatar} alt="" className="size-20 rounded-full object-cover" />
        ) : null}
        <p className="font-display text-4xl">#{athlete.rank}</p>
        <p className="text-sm text-muted">
          {athlete.sportLabel} · {athlete.zone} · {athlete.ssp.toLocaleString()} SSP AI
        </p>
        <p className="text-sm">{athlete.activities} eligible verified activities · streak {athlete.streak}d</p>
        {athlete.eligibility === "review" ? (
          <p className="rounded-xl border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
            Weekly rank temporarily on hold · activity verification review
          </p>
        ) : null}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => void navigate({ to: "/sport-id" })}
        >
          VIEW SPORT ID
        </Button>
      </div>
    </div>
  );
}
