import { VIEWER_ID, users } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { deriveAthleteSponsor, formatSar, STAR_TIERS } from "@/lib/sportix/stars";
import { ScreenHeader } from "../ScreenHeader";
import { SponsorStarIcon } from "./SponsorStarIcon";

export function CreatorSponsorSummary({ userId }: { userId: string }) {
  const pop = useSportix((s) => s.pop);
  const txs = useSportix((s) => s.transactions);
  const user = users[userId];
  const mine = txs.filter((t) => t.recipient_user_id === userId);
  const completed = mine.filter((t) => t.payment_state === "completed");
  const pending = mine.filter((t) => t.payment_state === "processing");
  const st = deriveAthleteSponsor(userId, txs);
  const starCounts = completed.reduce(
    (acc, t) => {
      acc[t.tier_id] = (acc[t.tier_id] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const creatorTotal = completed.reduce((n, t) => n + t.creator_allocation_sar, 0);
  const isSelf = userId === VIEWER_ID;

  return (
    <div>
      <ScreenHeader
        title="SPORTIX SPONSOR"
        subtitle={isSelf ? "Creator allocation" : user?.displayName}
        onBack={pop}
      />
      <div className="space-y-4 px-4 py-4">
        <p className="text-2xs text-muted">
          This is creator allocation from SPORTIX SPONSOR. It is not SP AI and it is not SSP AI.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="font-display text-2xl tabular">{st.total_sponsor_count}</p>
            <p className="text-2xs text-muted">Total SPORTIX Sponsors</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="font-display text-2xl tabular">{completed.length}</p>
            <p className="text-2xs text-muted">Stars received</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="font-display text-xl tabular">{formatSar(st.aggregate_sponsored_value)}</p>
            <p className="text-2xs text-muted">Gross sponsored value</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="font-display text-xl tabular text-lime">{formatSar(creatorTotal)}</p>
            <p className="text-2xs text-muted">Creator allocation</p>
          </div>
        </div>
        <div>
          <h3 className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
            Stars received
          </h3>
          <ul className="mt-2 space-y-1">
            {Object.entries(starCounts).map(([id, n]) => {
              const tier = STAR_TIERS[id as keyof typeof STAR_TIERS];
              if (!tier) return null;
              return (
                <li key={id} className="flex items-center gap-2 rounded-md bg-surface px-2 py-2">
                  <SponsorStarIcon tier={tier.tier_id} size="sm" />
                  <span className="flex-1 text-sm">{tier.name}</span>
                  <span className="text-2xs tabular text-muted">×{n}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-2xs text-muted">
          Completed {completed.length} · Pending {pending.length}
        </p>
      </div>
    </div>
  );
}
