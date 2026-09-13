import { users } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { asAthleteIndicator, deriveAthleteSponsor } from "@/lib/sportix/stars";
import { ScreenHeader } from "./ScreenHeader";
import { SportIcon } from "./SportIcon";
import { TopSponsorIndicator } from "./sponsor/TopSponsorIndicator";
import { UserAvatar } from "./UserAvatar";
import { VerifiedMark } from "./VerificationBadge";

export function SportIdPreview({ userId }: { userId: string }) {
  const user = users[userId];
  const pop = useSportix((s) => s.pop);
  const push = useSportix((s) => s.push);
  const openSheet = useSportix((s) => s.openSheet);
  const txs = useSportix((s) => s.transactions);
  if (!user) return null;
  const athleteSponsor = asAthleteIndicator(deriveAthleteSponsor(userId, txs));

  return (
    <div>
      <ScreenHeader title="SPORT ID" subtitle="Verified sporting identity" onBack={pop} />
      <div className="p-4">
        <div className="overflow-hidden rounded-2xl border border-lime/40 bg-surface-2">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-display text-sm tracking-[0.22em] text-lime">SPORTIX</p>
            <p className="text-3xs uppercase tracking-[0.18em] text-muted">Sport ID</p>
          </div>
          <div className="flex gap-4 p-4">
            <UserAvatar userId={userId} size="xl" />
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-lg font-semibold">
                {user.displayName}
                {user.verified ? <VerifiedMark /> : null}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <SportIcon sport={user.sport} />
                {user.sport} · {user.zone}
              </p>
              <p className="mt-3 font-display text-3xl leading-none tabular">{user.spAi}</p>
              <p className="mt-1 text-2xs text-muted">SP AI</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-px bg-border">
            <div className="bg-surface-2 p-3">
              <p className="font-display text-lg tabular">{user.sspAi}</p>
              <p className="text-2xs text-muted">SSP AI</p>
            </div>
            <div className="bg-surface-2 p-3">
              <p className="font-display text-lg tabular">
                {user.weeklyRank ? `#${user.weeklyRank}` : "—"}
              </p>
              <p className="text-2xs text-muted">Weekly</p>
            </div>
            <div className="bg-surface-2 p-3">
              <p className="font-display text-lg tabular">{user.achievementCount}</p>
              <p className="text-2xs text-muted">Achievements</p>
            </div>
          </div>
          <p className="px-4 py-3 text-2xs leading-relaxed text-muted">
            SPORT ID is the verified sporting identity layer. It is not a popularity score and is
            separate from post-level SPORTIX SPONSOR.
          </p>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <TopSponsorIndicator
            sponsor={athleteSponsor}
            scope="athlete"
            onClick={() => openSheet({ type: "athlete-sponsor", userId })}
            onHistory={() => push({ type: "sponsor-history", userId })}
          />
        </div>
        <p className="mt-2 px-1 text-2xs text-faint">
          Top Sponsor — Athlete is not a sporting-performance rank and does not change SP AI.
        </p>
      </div>
    </div>
  );
}
