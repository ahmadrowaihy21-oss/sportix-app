import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { achievements, sports } from "@/lib/sport-id/mock";
import type { SportKey } from "@/lib/sport-id/types";
import { useSportId } from "@/lib/sport-id/store";
import { useGo } from "@/lib/go-sportix/store";
import { AchievementCard } from "./AchievementCard";
import { PerformanceDimensionCard, SkillMetricCard } from "./SkillMetricCard";
import { SportStatusBadge, VerificationStatus } from "./SportStatusBadge";
import { visibleSkills } from "./visibility";

export function PadelID() {
  const rec = sports.padel;
  const push = useSportId((s) => s.push);
  const view = useSportId((s) => s.view);
  const metricsPublic = useSportId((s) => s.metricsPublic);
  const navigate = useNavigate();
  const skills = visibleSkills(rec.skills, view, metricsPublic, "padel");
  const technical = skills.filter((s) =>
    ["fh", "bh", "volley", "smash", "lob", "serve", "return", "variety", "winner", "ufe"].includes(s.id),
  );
  const tactical = skills.filter((s) =>
    ["select", "decide", "pos", "aware", "read", "trans", "def", "off"].includes(s.id),
  );

  return (
    <SportFrame sport="padel">
      <p className="text-sm text-muted">
        {rec.extra.visionSessions} SPORTIX Vision sessions · {rec.sessionsValue} matches
      </p>
      <div className="grid grid-cols-2 gap-2">
        {rec.dimensions.map((d) => (
          <PerformanceDimensionCard key={d.id} label={d.label} value={d.value} />
        ))}
      </div>
      <Group title="Technical">
        {technical.map((sk) => (
          <SkillMetricCard key={sk.id} skill={sk} onOpen={() => push({ type: "metric", sport: "padel", metricId: sk.id })} />
        ))}
      </Group>
      <Group title="Tactical intelligence">
        {tactical.map((sk) => (
          <SkillMetricCard key={sk.id} skill={sk} onOpen={() => push({ type: "metric", sport: "padel", metricId: sk.id })} />
        ))}
      </Group>
      <Group title="Achievements">
        {achievements.filter((a) => a.sport === "padel").map((a) => (
          <AchievementCard key={a.id} item={a} />
        ))}
      </Group>
      <Button
        variant="outline"
        onClick={() => {
          useGo.getState().openFind();
          void navigate({ to: "/go-sportix" });
        }}
      >
        Find match · GO SPORTIX
      </Button>
    </SportFrame>
  );
}

export function RunningID() {
  const rec = sports.running;
  const push = useSportId((s) => s.push);
  const view = useSportId((s) => s.view);
  const metricsPublic = useSportId((s) => s.metricsPublic);
  const records = useSportId((s) => s.goRecords);
  const navigate = useNavigate();
  const skills = visibleSkills(rec.skills, view, metricsPublic, "running");
  const runRecords = records.filter((r) => r.activity === "running");
  const extraKm = runRecords.reduce((n, r) => n + r.distanceKm, 0);
  const runs = 73 + runRecords.length;
  const distance = 476.58 + extraKm;
  const latest = runRecords[0];
  return (
    <SportFrame
      sport="running"
      banner={
        latest ? (
          <div className="mx-4 mt-4 rounded-xl border border-lime/40 bg-lime/10 p-3">
            <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-lime">Latest activity</p>
            <p className="mt-1 font-display text-3xl tabular">{latest.distanceKm.toFixed(2)} KM</p>
            <p className="mt-1 text-2xs text-muted">
              SPORTIX VERIFIED ✓ · {runs} verified runs · {distance.toFixed(2)} KM total
            </p>
          </div>
        ) : null
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <HeroStat l="Verified distance" v={`${distance.toFixed(2)} KM`} />
        <HeroStat l="Verified runs" v={String(runs)} />
        <HeroStat l="Best verified 5K" v={rec.extra.best5k!} />
        <HeroStat l="Best verified 10K" v={rec.extra.best10k!} />
        <HeroStat l="Average pace" v={rec.extra.avgPace!} />
        <HeroStat l="Last 30 days" v={rec.extra.last30!} />
      </div>
      <div className="rounded-xl border border-border bg-surface p-3 text-sm">
        <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">Progress</p>
        <p className="mt-2">Pace ↑ {rec.extra.paceTrend}</p>
        <p>Distance ↑ {rec.extra.distTrend}</p>
        <p>Consistency ↑ {rec.extra.consistency}</p>
      </div>
      {skills.map((sk) => (
        <SkillMetricCard key={sk.id} skill={sk} onOpen={() => push({ type: "metric", sport: "running", metricId: sk.id })} />
      ))}
      <Button variant="outline" onClick={() => push({ type: "session", id: latest?.sessionId ?? "ses-run-11" })}>
        Open verified {latest ? "GO SPORTIX" : "5K"} session
      </Button>
      <Button
        onClick={() => {
          useGo.getState().chooseActivity("running");
          void navigate({ to: "/go-sportix" });
        }}
      >
        Start new run · GO SPORTIX
      </Button>
    </SportFrame>
  );
}

export function WalkingID() {
  const rec = sports.walking;
  const push = useSportId((s) => s.push);
  const view = useSportId((s) => s.view);
  const healthPublic = useSportId((s) => s.healthPublic);
  const metricsPublic = useSportId((s) => s.metricsPublic);
  const records = useSportId((s) => s.goRecords);
  if (view === "professional") {
    return (
      <SportFrame sport="walking">
        <p className="text-sm text-muted">
          Walking and step data are not in this professional authorisation.
        </p>
      </SportFrame>
    );
  }
  const skills = visibleSkills(rec.skills, view, metricsPublic && (view === "owner" || healthPublic), "walking");
  const walkRecords = records.filter((r) => r.activity === "walking" || r.activity === "hiking");
  const extraKm = walkRecords.reduce((n, r) => n + r.distanceKm, 0);
  const latest = walkRecords[0];
  return (
    <SportFrame
      sport="walking"
      banner={
        latest ? (
          <div className="mx-4 mt-4 rounded-xl border border-lime/40 bg-lime/10 p-3">
            <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-lime">Latest activity</p>
            <p className="mt-1 font-display text-3xl tabular">{latest.distanceKm.toFixed(2)} KM</p>
            <p className="text-2xs text-muted">SPORTIX VERIFIED ✓</p>
          </div>
        ) : null
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <HeroStat l="Verified distance" v={`${(326 + extraKm).toFixed(2)} KM`} />
        <HeroStat l="Verified walks" v={String(94 + walkRecords.length)} />
        {view === "owner" || healthPublic ? <HeroStat l="Verified steps" v={rec.extra.steps!} /> : null}
        <HeroStat l="This month" v={rec.extra.month!} />
        <HeroStat l="Longest walk" v={rec.extra.longest!} />
        <HeroStat l="Consistency" v={rec.extra.consistency!} />
      </div>
      {skills.map((sk) => (
        <SkillMetricCard key={sk.id} skill={sk} onOpen={() => push({ type: "metric", sport: "walking", metricId: sk.id })} />
      ))}
      <Button variant="outline" onClick={() => push({ type: "session", id: "ses-walk-12" })}>
        Open walking history
      </Button>
    </SportFrame>
  );
}

export function CyclingID() {
  const rec = sports.cycling;
  const push = useSportId((s) => s.push);
  const view = useSportId((s) => s.view);
  const metricsPublic = useSportId((s) => s.metricsPublic);
  const skills = visibleSkills(rec.skills, view, metricsPublic, "cycling");
  return (
    <SportFrame sport="cycling">
      <div className="rounded-xl border border-warn/40 bg-warn/10 px-3 py-3 text-sm text-warn">
        Technical verification profile pending. This is a target experience, not SPORTIX VERIFIED production cycling.
      </div>
      <div className="grid grid-cols-2 gap-2">
        <HeroStat l="Distance" v={rec.extra.distance!} />
        <HeroStat l="Rides" v={rec.sessionsValue} />
        <HeroStat l="Longest ride" v={rec.extra.longest!} />
        <HeroStat l="Average speed" v={rec.extra.speed!} />
        <HeroStat l="Elevation" v={rec.extra.elevation!} />
        <HeroStat l="Endurance trend" v={rec.extra.endurance!} />
      </div>
      {skills.map((sk) => (
        <SkillMetricCard key={sk.id} skill={sk} onOpen={() => push({ type: "metric", sport: "cycling", metricId: sk.id })} />
      ))}
      <Button variant="outline" onClick={() => push({ type: "session", id: "ses-cy-09" })}>
        Open ride
      </Button>
    </SportFrame>
  );
}

function SportFrame({
  sport,
  children,
  banner,
}: {
  sport: SportKey;
  children: React.ReactNode;
  banner?: React.ReactNode;
}) {
  const rec = sports[sport];
  return (
    <div className="space-y-4">
      {banner}
      <img
        src={rec.hero}
        alt={rec.label}
        className={sport === "padel" ? "w-full bg-ink object-contain" : "aspect-photo w-full object-cover"}
      />
      <div className="space-y-4 px-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{rec.summary}</h2>
          <SportStatusBadge state={rec.state} />
        </div>
        {sport === "padel" ? <VerificationStatus state="pilot" /> : null}
        {children}
      </div>
    </div>
  );
}

function HeroStat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="font-display text-xl leading-none tabular">{v}</p>
      <p className="mt-1 text-2xs text-muted">{l}</p>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}
