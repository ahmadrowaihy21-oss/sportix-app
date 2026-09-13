import type { SponsorTransaction } from "./stars";
import { STAR_TIERS } from "./stars";

function tx(
  id: string,
  sponsor: string,
  recipient: string,
  postId: string | null,
  tier: keyof typeof STAR_TIERS,
  created_at: string,
  scope: "post" | "athlete" = "post",
): SponsorTransaction {
  const t = STAR_TIERS[tier];
  return {
    sponsor_transaction_id: id,
    sponsor_user_id: sponsor,
    recipient_user_id: recipient,
    post_id: postId,
    scope,
    tier_id: t.tier_id,
    gross_amount_sar: t.gross_amount_sar,
    sportix_allocation_sar: t.sportix_allocation_sar,
    creator_allocation_sar: t.creator_allocation_sar,
    payment_state: "completed",
    created_at,
    audit_ref: `aud-${id}`,
  };
}

export const seedTransactions: SponsorTransaction[] = [
  tx("tx-run-green", "abdullah", "sara", "post-run", "green", "2026-09-12T06:40:00Z"),
  tx("tx-achieve-sig", "academy", "sara", "post-achieve", "signature", "2026-09-10T08:00:00Z"),
  tx("tx-achieve-g1", "abdullah", "sara", "post-achieve", "green", "2026-09-10T09:00:00Z"),
  tx("tx-achieve-s1", "ahmed", "sara", "post-achieve", "silver", "2026-09-10T10:00:00Z"),
  tx("tx-match-elite", "academy", "ahmed", "post-match", "elite", "2026-09-07T22:10:00Z"),
  tx("tx-match-g1", "abdullah", "ahmed", "post-match", "green", "2026-09-07T22:30:00Z"),
  tx("tx-match-y1", "faisal", "ahmed", "post-match", "yellow", "2026-09-07T22:40:00Z"),
  tx("tx-gym-silver", "abdullah", "faisal", "post-gym", "silver", "2026-09-12T15:00:00Z"),
  tx("tx-gym-y1", "sara", "faisal", "post-gym", "yellow", "2026-09-12T15:10:00Z"),
  tx("tx-gym-y2", "ahmed", "faisal", "post-gym", "yellow", "2026-09-12T15:20:00Z"),
  tx("tx-gym-y3", "nora", "faisal", "post-gym", "yellow", "2026-09-12T15:30:00Z"),
  tx("tx-gym-y4", "layla", "faisal", "post-gym", "yellow", "2026-09-12T15:40:00Z"),
  tx("tx-am-elite", "academy", "ahmed", "post-achieve-match", "elite", "2026-09-06T22:00:00Z"),
  tx("tx-yousef-y", "abdullah", "yousef", null, "yellow", "2026-09-11T18:00:00Z", "athlete"),
  tx("tx-yousef-s", "faisal", "yousef", null, "silver", "2026-09-12T09:00:00Z", "athlete"),
];
