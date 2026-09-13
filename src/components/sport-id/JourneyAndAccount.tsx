import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { JOURNEY_TOTALS, journey } from "@/lib/sport-id/mock";
import { users } from "@/lib/sportix/mock";
import { OWNER_ID } from "@/lib/sport-id/mock";
import { useMarket } from "@/lib/marketplace/store";
import { useSportId } from "@/lib/sport-id/store";
import { VerificationStatus } from "./SportStatusBadge";
import { SportGlyph } from "./SportGlyph";

export function SportJourneySummary() {
  const push = useSportId((s) => s.push);
  const user = users[OWNER_ID]!;
  const points = useMarket((s) => s.pointsBalance);
  const extraActivities = useSportId((s) => s.extraActivities);
  const goRecords = useSportId((s) => s.goRecords);
  const weeklyLegacy = useSportId((s) => s.weeklyLegacy);
  const navigate = useNavigate();
  return (
    <section className="px-4 py-6">
      <h2 className="text-sm font-semibold">My sporting journey</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat l="Sports" v={String(JOURNEY_TOTALS.sports)} />
        <Stat l="Verified activities" v={String(JOURNEY_TOTALS.activities + extraActivities)} />
        <Stat l="Verified matches" v={String(JOURNEY_TOTALS.matches)} />
        <Stat l="Verified achievements" v={String(JOURNEY_TOTALS.achievements)} />
        <Stat l="SP AI" v={user.spAi.toLocaleString()} />
        <Stat l="SSP AI" v={user.sspAi.toLocaleString()} />
        <Stat l="SPORTIX AI Points" v={points.toLocaleString()} />
      </div>
      <button
        type="button"
        onClick={() => push({ type: "journey" })}
        className="mt-4 w-full rounded-xl border border-border bg-surface px-3 py-3 text-left"
      >
        <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">2026</p>
        <div className="mt-2 space-y-2">
          {weeklyLegacy.slice(0, 2).map((e) => (
            <div key={e.id} className="flex items-center gap-2 text-2xs">
              <span className="flex-1 truncate text-lime">{e.title} · Week {e.week}</span>
              <VerificationStatus state="verified" />
            </div>
          ))}
          {goRecords.slice(0, 2).map((e) => (
            <div key={e.id} className="flex items-center gap-2 text-2xs">
              <SportGlyph sport={e.activity === "hiking" ? "walking" : e.activity} className="size-3.5 text-lime" />
              <span className="flex-1 truncate">
                {e.distanceKm.toFixed(2)} KM {e.activity} · GO SPORTIX
              </span>
              <VerificationStatus state="verified" />
            </div>
          ))}
          {journey.slice(0, goRecords.length ? 2 : 4).map((e) => (
            <div key={e.id} className="flex items-center gap-2 text-2xs">
              <SportGlyph sport={e.sport} className="size-3.5 text-lime" />
              <span className="flex-1 truncate">{e.title}</span>
              <VerificationStatus state={e.state === "pending-profile" ? "pending-review" : e.state} />
            </div>
          ))}
        </div>
      </button>
      <button
        type="button"
        onClick={() => void navigate({ to: "/weekly-legends" })}
        className="mt-3 w-full rounded-xl border border-border bg-surface px-3 py-3 text-left"
      >
        <p className="text-2xs font-semibold tracking-[0.16em] text-lime">WEEKLY LEGENDS</p>
        <p className="mt-1 text-sm">Open this week’s verified competition</p>
      </button>
    </section>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="font-display text-xl tabular">{v}</p>
      <p className="text-2xs text-muted">{l}</p>
    </div>
  );
}

export function WeeklyLegendScreen() {
  const pop = useSportId((s) => s.pop);
  const items = useSportId((s) => s.weeklyLegacy);
  return (
    <div className="pb-24">
      <ScreenHeader title="Weekly Legend history" subtitle="Kept after weekly reset" onBack={pop} />
      {items.length === 0 ? (
        <p className="px-4 py-8 text-sm text-muted">No Weekly Legend records yet this prototype session.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((e) => (
            <li key={e.id} className="px-4 py-4">
              <p className="text-2xs tracking-[0.16em] text-lime">WEEK {e.week}</p>
              <p className="text-sm font-semibold">{e.title}</p>
              <p className="text-2xs text-muted">
                {e.context} · {e.ssp.toLocaleString()} SSP AI · {e.sportLabel} · SPORTIX VERIFIED ✓
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function JourneyScreen() {
  const pop = useSportId((s) => s.pop);
  const weeklyLegacy = useSportId((s) => s.weeklyLegacy);
  return (
    <div className="pb-24">
      <ScreenHeader title="Sporting journey" subtitle="2026" onBack={pop} />
      <ul className="divide-y divide-border">
        {weeklyLegacy.map((e) => (
          <li key={e.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-lime">{e.title}</p>
              <p className="text-2xs text-muted">Week {e.week} · {e.ssp.toLocaleString()} SSP AI · kept after reset</p>
            </div>
            <VerificationStatus state="verified" />
          </li>
        ))}
        {journey.map((e) => (
          <li key={e.id} className="flex items-center gap-3 px-4 py-3">
            <SportGlyph sport={e.sport} className="size-5 text-lime" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{e.title}</p>
              <p className="text-2xs text-muted">{e.date}</p>
            </div>
            <VerificationStatus state={e.state === "pending-profile" ? "pending-review" : e.state} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EditProfileScreen() {
  const pop = useSportId((s) => s.pop);
  const saveProfile = useSportId((s) => s.saveProfile);
  const name = useSportId((s) => s.displayName);
  const bio = useSportId((s) => s.bio);
  const [n, setN] = useState(name);
  const [b, setB] = useState(bio);
  return (
    <div className="pb-24">
      <ScreenHeader title="Edit profile" onBack={pop} />
      <div className="space-y-3 px-4 py-4">
        <label className="block text-2xs text-muted">
          Display name
          <input value={n} onChange={(e) => setN(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg" />
        </label>
        <label className="block text-2xs text-muted">
          Bio
          <textarea value={b} onChange={(e) => setB(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-border bg-surface p-3 text-sm text-fg" />
        </label>
        <Button className="w-full" onClick={() => saveProfile(n, b)}>
          Save
        </Button>
      </div>
    </div>
  );
}

export function PrivacyScreen() {
  const pop = useSportId((s) => s.pop);
  const cityPublic = useSportId((s) => s.cityPublic);
  const metricsPublic = useSportId((s) => s.metricsPublic);
  const healthPublic = useSportId((s) => s.healthPublic);
  const setPrivacy = useSportId((s) => s.setPrivacy);
  return (
    <div className="pb-24">
      <ScreenHeader title="Privacy & sharing" onBack={pop} />
      <div className="space-y-2 px-4 py-4">
        <Toggle label="Show city on public SPORT ID" on={cityPublic} onChange={(v) => setPrivacy({ cityPublic: v })} />
        <Toggle label="Show selected verified metrics publicly" on={metricsPublic} onChange={(v) => setPrivacy({ metricsPublic: v })} />
        <Toggle label="Share walking / health-adjacent stats" on={healthPublic} onChange={(v) => setPrivacy({ healthPublic: v })} />
        <p className="pt-2 text-2xs text-muted">
          Partners never receive raw SPORT ID, sensors, talent scores or health data.
        </p>
      </div>
    </div>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="flex min-h-12 w-full items-center justify-between rounded-xl border border-border bg-surface px-3 text-left text-sm"
    >
      {label}
      <span className={on ? "text-lime" : "text-muted"}>{on ? "On" : "Off"}</span>
    </button>
  );
}

export function DevicesScreen() {
  const pop = useSportId((s) => s.pop);
  return (
    <div className="pb-24">
      <ScreenHeader title="Linked devices" onBack={pop} />
      <ul className="divide-y divide-border text-sm">
        <li className="px-4 py-3">Watch · GPS + duration</li>
        <li className="px-4 py-3">Dual foot sensors · academy kit</li>
        <li className="px-4 py-3">SPORTIX Vision · pitch camera (facility)</li>
      </ul>
    </div>
  );
}

export function ConnectionsScreen() {
  const pop = useSportId((s) => s.pop);
  return (
    <div className="pb-24">
      <ScreenHeader title="Connections" subtitle="Authorised professionals" onBack={pop} />
      <div className="space-y-2 px-4 py-4 text-sm">
        <p className="rounded-xl border border-border bg-surface px-3 py-3">Coach Nasser · Football only</p>
        <p className="rounded-xl border border-border bg-surface px-3 py-3">Elite Football Academy · authorised</p>
        <p className="text-2xs text-muted">They do not receive DMs, unrelated sports, or raw sensor streams.</p>
      </div>
    </div>
  );
}
