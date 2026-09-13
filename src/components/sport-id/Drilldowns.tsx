import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import {
  achievements,
  footballDevelopment,
  footballVision,
  sessions,
  sports,
  trendSeries,
} from "@/lib/sport-id/mock";
import type { SportKey } from "@/lib/sport-id/types";
import { useSportId } from "@/lib/sport-id/store";
import { useSportix } from "@/lib/sportix/store";
import { EvidenceQualityCard, EvidenceSourceList } from "./EvidenceBits";
import { WhyVerifiedSheet } from "./WhyVerifiedSheet";
import { VerificationStatus } from "./SportStatusBadge";

export function MetricDetail({ sport, metricId }: { sport: SportKey; metricId: string }) {
  const pop = useSportId((s) => s.pop);
  const push = useSportId((s) => s.push);
  const rec = sports[sport];
  const skill = rec.skills.find((s) => s.id === metricId);
  const [why, setWhy] = useState(false);
  if (!skill) return null;
  const series = trendSeries(typeof skill.value === "number" ? skill.value : 80, skill.trend90 ?? 6);

  return (
    <div className="pb-24">
      <ScreenHeader title={skill.label} subtitle={rec.label} onBack={pop} />
      <div className="space-y-4 px-4 py-4">
        <p className="font-display text-5xl tabular">{skill.value}</p>
        {skill.unit ? <p className="text-sm text-muted">{skill.unit}</p> : null}
        <VerificationStatus state={skill.evidence.state} />
        {skill.trend90 ? (
          <p className="text-sm text-lime">90 day trend {skill.trend90 > 0 ? "+" : ""}{skill.trend90}%</p>
        ) : null}
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <XAxis dataKey="t" hide />
              <YAxis hide domain={["dataMin - 4", "dataMax + 4"]} />
              <Line type="monotone" dataKey="v" stroke="var(--color-lime)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-3xs text-faint">Trend is prototype illustration, not a live model output.</p>
        <EvidenceQualityCard evidence={skill.evidence} />
        <Button className="w-full" onClick={() => setWhy(true)}>
          Why verified?
        </Button>
        <Button variant="outline" className="w-full" onClick={() => push({ type: "session", id: sport === "running" ? "ses-run-11" : "ses-fb-10" })}>
          View evidence session
        </Button>
        {sport === "football" ? (
          <Button variant="outline" className="w-full" onClick={() => push({ type: "development", sport })}>
            View development
          </Button>
        ) : null}
      </div>
      <WhyVerifiedSheet open={why} onClose={() => setWhy(false)} title={skill.label} evidence={skill.evidence} />
    </div>
  );
}

export function SessionDetail({ id }: { id: string }) {
  const pop = useSportId((s) => s.pop);
  const extras = useSportId((s) => s.extraSessions);
  const session = extras.find((s) => s.id === id) ?? sessions.find((s) => s.id === id);
  const [why, setWhy] = useState(false);
  if (!session) return null;
  return (
    <div className="pb-24">
      <ScreenHeader title={session.title} subtitle={session.date} onBack={pop} />
      <div className="space-y-4 px-4 py-4">
        <VerificationStatus
          state={session.evidence.state === "pending-review" && session.sport === "cycling" ? "pending-review" : session.evidence.state}
        />
        {session.sport === "cycling" ? (
          <p className="rounded-md bg-warn/10 px-3 py-2 text-2xs text-warn">
            Technical verification profile pending.
          </p>
        ) : null}
        <dl className="grid grid-cols-2 gap-3">
          {session.metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-surface p-3">
              <dt className="text-2xs text-muted">{m.label}</dt>
              <dd className="font-display text-xl tabular">{m.value}</dd>
            </div>
          ))}
        </dl>
        {session.routeNote ? <p className="text-sm text-muted">{session.routeNote}</p> : null}
        <EvidenceSourceList sources={session.evidence.sources} />
        <Button className="w-full" onClick={() => setWhy(true)}>
          Why verified?
        </Button>
      </div>
      <WhyVerifiedSheet open={why} onClose={() => setWhy(false)} title={session.title} evidence={session.evidence} />
    </div>
  );
}

export function AchievementDetail({ id }: { id: string }) {
  const pop = useSportId((s) => s.pop);
  const navigate = useNavigate();
  const item = achievements.find((a) => a.id === id);
  if (!item) return null;
  return (
    <div className="pb-24">
      <ScreenHeader title={item.title} subtitle="Verified achievement" onBack={pop} />
      <div className="space-y-3 px-4 py-4">
        <VerificationStatus state={item.state} />
        <p className="text-sm">{item.event}</p>
        <p className="text-2xs text-muted">{item.date} · {item.sport}</p>
        <p className="text-2xs text-muted">Evidence {item.evidenceRef}</p>
        <p className="text-2xs text-faint">Verified evidence cannot be edited by the athlete.</p>
        {item.relatedSession ? (
          <Button variant="outline" className="w-full" onClick={() => useSportId.getState().push({ type: "session", id: item.relatedSession! })}>
            Related session
          </Button>
        ) : null}
        {item.relatedPostId ? (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              const post = item.relatedPostId!;
              if (post === "post-match") useSportix.getState().push({ type: "match", matchId: "match-corniche" });
              else useSportix.getState().push({ type: "performance", postId: post });
              navigate({ to: "/communities" });
            }}
          >
            View Community post
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function VisionReportScreen() {
  const pop = useSportId((s) => s.pop);
  const v = footballVision;
  return (
    <div className="pb-24">
      <ScreenHeader title="SPORTIX Vision" subtitle="Football · evidence intelligence" onBack={pop} />
      <div className="space-y-4 px-4 py-4">
        <p className="text-2xs text-muted">Built on the last verified academy session. Not a chat.</p>
        <section>
          <h3 className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">What happened</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {v.happened.map((h) => (
              <li key={h.label} className="flex justify-between">
                <span>{h.label}</span>
                <span className="tabular">{h.value}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">Why</h3>
          <p className="mt-2 text-sm leading-relaxed">{v.why}</p>
        </section>
        <section>
          <h3 className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">What next</h3>
          <p className="mt-2 text-sm leading-relaxed">{v.next}</p>
        </section>
        <Button className="w-full" onClick={() => useSportId.getState().push({ type: "session", id: "ses-fb-10" })}>
          Open source session
        </Button>
      </div>
    </div>
  );
}

export function DevelopmentScreen() {
  const pop = useSportId((s) => s.pop);
  return (
    <div className="pb-24">
      <ScreenHeader title="Development journey" subtitle="Football · 6 months" onBack={pop} />
      <div className="space-y-3 px-4 py-4">
        {footballDevelopment.map((d) => (
          <div key={d.label} className="rounded-xl border border-border bg-surface p-3">
            <div className="flex justify-between text-sm">
              <span>{d.label}</span>
              <span className="tabular">{d.from} → {d.to}</span>
            </div>
            <div className="mt-2 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendSeries(d.to, d.to - d.from)}>
                  <XAxis dataKey="t" hide />
                  <YAxis hide domain={["dataMin - 3", "dataMax + 3"]} />
                  <Line type="monotone" dataKey="v" stroke="var(--color-lime)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistoryScreen() {
  const pop = useSportId((s) => s.pop);
  const push = useSportId((s) => s.push);
  return (
    <div className="pb-24">
      <ScreenHeader title="History" subtitle="Verified activity" onBack={pop} />
      <ul className="divide-y divide-border">
        {sessions.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => push({ type: "session", id: s.id })}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span>
                <span className="block text-sm font-semibold">{s.title}</span>
                <span className="text-2xs text-muted">{s.date} · {s.sport}</span>
              </span>
              <VerificationStatus state={s.evidence.state} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}


