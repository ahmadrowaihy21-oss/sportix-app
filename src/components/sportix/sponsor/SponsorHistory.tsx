import { users } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { formatSar, STAR_TIERS } from "@/lib/sportix/stars";
import { ScreenHeader } from "../ScreenHeader";
import { UserAvatar } from "../UserAvatar";
import { SponsorStarIcon } from "./SponsorStarIcon";

export function SponsorHistory({ postId, userId }: { postId?: string; userId?: string }) {
  const pop = useSportix((s) => s.pop);
  const txs = useSportix((s) => s.transactions);
  const list = txs.filter((t) => {
    if (postId) return t.post_id === postId;
    if (userId) return t.recipient_user_id === userId;
    return false;
  });

  return (
    <div>
      <ScreenHeader title="Sponsor History" subtitle="Allocation ledger" onBack={pop} />
      <p className="px-4 pt-3 text-2xs text-muted">
        SPORTIX SPONSOR earnings are separate from SP AI and SSP AI.
      </p>
      <ul className="mt-3 divide-y divide-border">
        {list.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-muted">No sponsorships yet.</li>
        ) : (
          list.map((t) => {
            const sponsor = users[t.sponsor_user_id];
            const tier = STAR_TIERS[t.tier_id];
            return (
              <li key={t.sponsor_transaction_id} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <UserAvatar userId={t.sponsor_user_id} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{sponsor?.displayName}</p>
                    <p className="text-2xs text-muted">
                      {t.created_at.replace("T", " ").slice(0, 16)} · {t.audit_ref}
                    </p>
                  </div>
                  <SponsorStarIcon tier={t.tier_id} size="sm" />
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-2xs">
                  <dt className="text-muted">{tier.name}</dt>
                  <dd className="text-right tabular">{formatSar(t.gross_amount_sar)}</dd>
                  <dt className="text-muted">Creator</dt>
                  <dd className="text-right tabular">{formatSar(t.creator_allocation_sar)}</dd>
                  <dt className="text-muted">SPORTIX</dt>
                  <dd className="text-right tabular">{formatSar(t.sportix_allocation_sar)}</dd>
                  <dt className="text-muted">Status</dt>
                  <dd className="text-right capitalize">{t.payment_state}</dd>
                </dl>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
