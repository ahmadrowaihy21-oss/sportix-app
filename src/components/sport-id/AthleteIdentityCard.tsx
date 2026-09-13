import { UserAvatar } from "@/components/sportix/UserAvatar";
import { VerifiedMark } from "@/components/sportix/VerificationBadge";
import { MOCK_BANNER, OWNER_CITY, OWNER_ID } from "@/lib/sport-id/mock";
import { useSportId } from "@/lib/sport-id/store";
import { users } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { asAthleteIndicator, deriveAthleteSponsor } from "@/lib/sportix/stars";
import { useMarket } from "@/lib/marketplace/store";
import { useWeekly, useWeeklyBoard } from "@/lib/weekly-legends/store";
import { useNavigate } from "@tanstack/react-router";
import { SportStatusBadge } from "./SportStatusBadge";

export function AthleteIdentityCard() {
  const name = useSportId((s) => s.displayName);
  const view = useSportId((s) => s.view);
  const cityPublic = useSportId((s) => s.cityPublic);
  const user = users[OWNER_ID]!;
  const txs = useSportix((s) => s.transactions);
  const points = useMarket((s) => s.pointsBalance);
  const athlete = asAthleteIndicator(deriveAthleteSponsor(OWNER_ID, txs));
  const showCity = view === "owner" || cityPublic;
  const sspWeek = useWeekly((s) => s.ssp);
  const { meGlobal } = useWeeklyBoard();
  const navigate = useNavigate();
  const bonus = useSportId((s) => s.sspBonus);

  return (
    <section className="px-4 pt-4">
      <p className="text-3xs font-semibold uppercase tracking-[0.18em] text-lime">SPORT ID</p>
      <p className="mt-0.5 text-2xs text-muted">Verified digital sports identity</p>
      <div className="mt-4 flex gap-4">
        <UserAvatar userId={OWNER_ID} size="xl" />
        <div className="min-w-0">
          <h1 className="flex items-center gap-1.5 text-xl font-semibold">
            {name}
            <VerifiedMark />
          </h1>
          <p className="mt-1 text-sm text-muted">{showCity ? OWNER_CITY : "City hidden"}</p>
          <p className="mt-1 text-2xs text-muted">5 sports · identity verified</p>
          <div className="mt-2">
            <SportStatusBadge state="verified" />
          </div>
        </div>
      </div>
      <p className="mt-3 rounded-md bg-elevated px-3 py-2 text-3xs text-muted">{MOCK_BANNER}</p>
      <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-border">
        <Stat label="SP AI" value={user.spAi.toLocaleString()} />
        <Stat label="SSP AI" value={(user.sspAi + bonus).toLocaleString()} />
        <Stat label="AI Points" value={points.toLocaleString()} />
      </div>
      <button
        type="button"
        onClick={() => void navigate({ to: "/weekly-legends" })}
        className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 text-left"
      >
        <p className="text-2xs font-semibold tracking-[0.16em] text-lime">WEEKLY LEGENDS</p>
        <p className="mt-1 text-sm">
          #{meGlobal?.rank ?? "—"} global · {sspWeek.toLocaleString()} weekly SSP AI
        </p>
        <p className="text-3xs text-faint">Weekly SSP is not SP AI, not sponsor visibility, not likes.</p>
      </button>
      {view !== "public" ? (
        <p className="mt-2 text-3xs text-faint">
          SP AI and SSP AI are sporting scores. SPORTIX AI Points are Marketplace value. Top Sponsor
          extra {athlete.extraCount} does not change them.
        </p>
      ) : null}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-3 py-3">
      <p className="font-display text-xl tabular">{value}</p>
      <p className="mt-1 text-3xs text-muted">{label}</p>
    </div>
  );
}
