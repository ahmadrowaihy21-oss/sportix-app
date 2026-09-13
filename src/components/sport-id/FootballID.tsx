import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { achievements, sports } from "@/lib/sport-id/mock";
import { useSportId } from "@/lib/sport-id/store";
import { useGo } from "@/lib/go-sportix/store";
import { AchievementCard } from "./AchievementCard";
import { DevelopmentCard } from "./DevelopmentCard";
import { PerformanceDimensionCard, SkillMetricCard } from "./SkillMetricCard";
import { SportStatusBadge } from "./SportStatusBadge";
import { VisionInsightCard } from "./VisionInsightCard";
import { visibleSkills } from "./visibility";

export function FootballID() {
  const rec = sports.football;
  const push = useSportId((s) => s.push);
  const view = useSportId((s) => s.view);
  const metricsPublic = useSportId((s) => s.metricsPublic);
  const navigate = useNavigate();
  const skills = visibleSkills(rec.skills, view, metricsPublic, rec.key);

  return (
    <div className="space-y-6">
      <img src={rec.hero} alt="SPORTIX Football Development & Analysis" className="w-full bg-ink object-contain" />
      <div className="px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Football ID</h2>
          <SportStatusBadge state={rec.state} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Item k="Primary position" v={rec.extra.position!} />
          <Item k="Preferred foot" v={rec.extra.foot!} />
          <Item k="Verified sessions" v={rec.sessionsValue} />
          <Item k="Evidence level" v={rec.extra.evidenceLevel!} />
          <Item k="Last verified" v={rec.lastVerified!} />
        </dl>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4">
        {rec.dimensions.map((d) => (
          <PerformanceDimensionCard key={d.id} label={d.label} value={d.value} />
        ))}
      </div>
      <p className="px-4 text-3xs text-faint">
        Mock prototype dimensions. Mental is omitted — no authorised evidence.
      </p>

      <div className="space-y-2 px-4">
        <h3 className="text-sm font-semibold">Technical skills</h3>
        {skills.map((sk) => (
          <SkillMetricCard
            key={sk.id}
            skill={sk}
            onOpen={() => push({ type: "metric", sport: "football", metricId: sk.id })}
          />
        ))}
      </div>

      <div className="px-4">
        <VisionInsightCard />
      </div>
      <div className="px-4">
        <DevelopmentCard />
      </div>
      <div className="space-y-2 px-4">
        <h3 className="text-sm font-semibold">Verified achievements</h3>
        {achievements
          .filter((a) => a.sport === "football")
          .map((a) => (
            <AchievementCard key={a.id} item={a} />
          ))}
      </div>
      <div className="grid gap-2 px-4 pb-2">
        <Button variant="outline" onClick={() => push({ type: "sensors" })}>
          Verification sources
        </Button>
        <Button variant="outline" onClick={() => push({ type: "history" })}>
          History
        </Button>
        <Button
          onClick={() => {
            useGo.getState().openFind();
            void navigate({ to: "/go-sportix" });
          }}
        >
          Find match · GO SPORTIX
        </Button>
      </div>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-2xs text-muted">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
