import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/sportix/UserAvatar";
import { VerifiedMark } from "@/components/sportix/VerificationBadge";
import { TopSponsorIndicator } from "@/components/sportix/sponsor/TopSponsorIndicator";
import { MEMBER_SINCE, OWNER_CITY, OWNER_ID } from "@/lib/sport-id/mock";
import { useSportId } from "@/lib/sport-id/store";
import { users } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { asAthleteIndicator, deriveAthleteSponsor } from "@/lib/sportix/stars";
import { useMarket } from "@/lib/marketplace/store";
import { useShell } from "@/lib/shell/store";
import { JOURNEY_TOTALS } from "@/lib/sport-id/mock";

export function ProfileSection() {
  const name = useSportId((s) => s.displayName);
  const bio = useSportId((s) => s.bio);
  const view = useSportId((s) => s.view);
  const push = useSportId((s) => s.push);
  const user = users[OWNER_ID]!;
  const txs = useSportix((s) => s.transactions);
  const points = useMarket((s) => s.pointsBalance);
  const athlete = asAthleteIndicator(deriveAthleteSponsor(OWNER_ID, txs));

  return (
    <section className="border-t border-border px-4 py-6">
      <h2 className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">Profile</h2>
      <div className="mt-4 flex gap-3">
        <UserAvatar userId={OWNER_ID} size="lg" />
        <div>
          <p className="flex items-center gap-1 text-lg font-semibold">
            {name}
            <VerifiedMark />
          </p>
          <p className="text-sm text-muted">{OWNER_CITY}, Saudi Arabia</p>
          <p className="mt-1 text-2xs text-muted">{bio}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-border">
        <Cell l="Friends" v={String(user.friendCount)} />
        <Cell l="Sports" v={String(JOURNEY_TOTALS.sports)} />
        <Cell l="Achievements" v={String(JOURNEY_TOTALS.achievements)} />
        <Cell l="SP AI" v={user.spAi.toLocaleString()} />
        <Cell l="SSP AI" v={user.sspAi.toLocaleString()} />
        <Cell l="AI Points" v={points.toLocaleString()} />
      </div>
      <p className="mt-2 text-3xs text-faint">Member since {MEMBER_SINCE}</p>
      <div className="mt-3 overflow-hidden rounded-xl border border-border">
        <TopSponsorIndicator sponsor={athlete} scope="athlete" />
      </div>
      {view === "owner" ? (
        <div className="mt-4 grid gap-2">
          <Button variant="outline" onClick={() => push({ type: "edit-profile" })}>
            Edit profile
          </Button>
          <Button variant="outline" onClick={() => push({ type: "privacy" })}>
            Privacy & sharing
          </Button>
          <Button variant="outline" onClick={() => push({ type: "connections" })}>
            Connections
          </Button>
          <Button variant="outline" onClick={() => push({ type: "weekly-legend" })}>
            Weekly Legend history
          </Button>
          <Button variant="outline" onClick={() => push({ type: "devices" })}>
            Linked devices
          </Button>
          <Button variant="muted" onClick={() => push({ type: "settings" })}>
            Play loop
          </Button>
          <Button variant="outline" onClick={() => useShell.getState().setOverlay("settings")}>
            App settings
          </Button>
        </div>
      ) : (
        <p className="mt-3 text-2xs text-muted">
          {view === "public"
            ? "Public SPORT ID shows approved fields only."
            : "Professional view is limited to authorised football evidence."}
        </p>
      )}
    </section>
  );
}

function Cell({ l, v }: { l: string; v: string }) {
  return (
    <div className="bg-surface px-3 py-3">
      <p className="font-display text-lg tabular">{v}</p>
      <p className="text-3xs text-muted">{l}</p>
    </div>
  );
}
