export const STAR_TIER_IDS = [
  "yellow",
  "silver",
  "green",
  "elite",
  "signature",
] as const;

export type StarTierId = (typeof STAR_TIER_IDS)[number];

export interface SponsorStarTier {
  tier_id: StarTierId;
  name: string;
  shortName: string;
  visual_asset: string;
  gross_amount_sar: number;
  sportix_allocation_sar: number;
  creator_allocation_sar: number;
  prestige_level: 1 | 2 | 3 | 4 | 5;
  active: true;
}

export const STAR_TIERS: Record<StarTierId, SponsorStarTier> = {
  yellow: {
    tier_id: "yellow",
    name: "Yellow Star",
    shortName: "Yellow",
    visual_asset: "svg:yellow",
    gross_amount_sar: 22,
    sportix_allocation_sar: 7,
    creator_allocation_sar: 15,
    prestige_level: 1,
    active: true,
  },
  silver: {
    tier_id: "silver",
    name: "White / Silver Star",
    shortName: "Silver",
    visual_asset: "svg:silver",
    gross_amount_sar: 55,
    sportix_allocation_sar: 19,
    creator_allocation_sar: 36,
    prestige_level: 2,
    active: true,
  },
  green: {
    tier_id: "green",
    name: "Green Star",
    shortName: "Green",
    visual_asset: "svg:green",
    gross_amount_sar: 500,
    sportix_allocation_sar: 170,
    creator_allocation_sar: 330,
    prestige_level: 3,
    active: true,
  },
  elite: {
    tier_id: "elite",
    name: "Black & Yellow Elite Star",
    shortName: "Elite",
    visual_asset: "svg:elite",
    gross_amount_sar: 10_000,
    sportix_allocation_sar: 3_000,
    creator_allocation_sar: 7_000,
    prestige_level: 4,
    active: true,
  },
  signature: {
    tier_id: "signature",
    name: "SPORTIX Signature Star",
    shortName: "Signature",
    visual_asset: "/media/sportix-signature-star.jpg",
    gross_amount_sar: 50_000,
    sportix_allocation_sar: 18_000,
    creator_allocation_sar: 32_000,
    prestige_level: 5,
    active: true,
  },
};

export const STAR_TIER_LIST: SponsorStarTier[] = STAR_TIER_IDS.map((id) => STAR_TIERS[id]);

export function assertStarEconomics() {
  for (const tier of STAR_TIER_LIST) {
    const sum = tier.sportix_allocation_sar + tier.creator_allocation_sar;
    if (sum !== tier.gross_amount_sar) {
      throw new Error(
        `Star ${tier.tier_id} does not reconcile: ${tier.sportix_allocation_sar}+${tier.creator_allocation_sar}=${sum} vs ${tier.gross_amount_sar}`,
      );
    }
  }
}

assertStarEconomics();

export function formatSar(amount: number) {
  return `${amount.toLocaleString("en-US")} SAR`;
}

export function starById(id: StarTierId | null | undefined) {
  if (!id) return null;
  return STAR_TIERS[id];
}

export type PaymentState = "completed" | "processing" | "failed" | "cancelled";

export interface SponsorTransaction {
  sponsor_transaction_id: string;
  sponsor_user_id: string;
  recipient_user_id: string;
  post_id: string | null;
  scope: "post" | "athlete";
  tier_id: StarTierId;
  gross_amount_sar: number;
  sportix_allocation_sar: number;
  creator_allocation_sar: number;
  payment_state: PaymentState;
  created_at: string;
  audit_ref: string;
}

export type EligibilityState = "eligible" | "limited" | "restricted";

export interface PostSponsorState {
  post_id: string;
  sponsor_count: number;
  top_sponsor_user_id: string | null;
  top_sponsor_tier: StarTierId | null;
  sponsor_momentum: number;
  visibility_eligibility: EligibilityState;
  updated_at: string;
}

export interface AthleteSponsorState {
  athlete_user_id: string;
  top_sponsor_user_id: string | null;
  highest_star_received: StarTierId | null;
  total_sponsor_count: number;
  aggregate_sponsored_value: number;
  period: "week";
  updated_at: string;
}

function prestige(id: StarTierId) {
  return STAR_TIERS[id].prestige_level;
}

function completed(txs: SponsorTransaction[]) {
  return txs.filter((t) => t.payment_state === "completed");
}

/** Strongest star wins; same star → newest; still tied → higher cumulative value. */
export function pickTopSponsor(txs: SponsorTransaction[]): {
  userId: string;
  tier: StarTierId;
} | null {
  const done = completed(txs);
  if (done.length === 0) return null;
  const valueByUser: Record<string, number> = {};
  for (const t of done) {
    valueByUser[t.sponsor_user_id] = (valueByUser[t.sponsor_user_id] ?? 0) + t.gross_amount_sar;
  }
  const ranked = [...done].sort((a, b) => {
    const p = prestige(b.tier_id) - prestige(a.tier_id);
    if (p !== 0) return p;
    const newest = b.created_at.localeCompare(a.created_at);
    if (newest !== 0) return newest;
    return (valueByUser[b.sponsor_user_id] ?? 0) - (valueByUser[a.sponsor_user_id] ?? 0);
  });
  const top = ranked[0];
  if (!top) return null;
  return { userId: top.sponsor_user_id, tier: top.tier_id };
}

export function momentumFrom(txs: SponsorTransaction[]) {
  return completed(txs).reduce((n, t) => n + prestige(t.tier_id) * 10, 0);
}

export function derivePostSponsor(
  postId: string,
  txs: SponsorTransaction[],
  eligibility: EligibilityState,
  updatedAt = "now",
): PostSponsorState {
  const mine = txs.filter((t) => t.post_id === postId);
  const top = pickTopSponsor(mine);
  const uniqueSponsors = new Set(completed(mine).map((t) => t.sponsor_user_id));
  return {
    post_id: postId,
    sponsor_count: uniqueSponsors.size,
    top_sponsor_user_id: top?.userId ?? null,
    top_sponsor_tier: top?.tier ?? null,
    sponsor_momentum: eligibility === "eligible" ? momentumFrom(mine) : 0,
    visibility_eligibility: eligibility,
    updated_at: updatedAt,
  };
}

export function deriveAthleteSponsor(
  athleteId: string,
  txs: SponsorTransaction[],
  updatedAt = "now",
): AthleteSponsorState {
  const mine = txs.filter((t) => t.recipient_user_id === athleteId);
  const top = pickTopSponsor(mine);
  const unique = new Set(completed(mine).map((t) => t.sponsor_user_id));
  const aggregate = completed(mine).reduce((n, t) => n + t.gross_amount_sar, 0);
  return {
    athlete_user_id: athleteId,
    top_sponsor_user_id: top?.userId ?? null,
    highest_star_received: top?.tier ?? null,
    total_sponsor_count: unique.size,
    aggregate_sponsored_value: aggregate,
    period: "week",
    updated_at: updatedAt,
  };
}

export function extraSponsorCount(state: PostSponsorState | AthleteSponsorState) {
  const n =
    "sponsor_count" in state ? state.sponsor_count : state.total_sponsor_count;
  return Math.max(0, n - (state.top_sponsor_user_id ? 1 : 0));
}

export function asAthleteIndicator(st: AthleteSponsorState) {
  return {
    topSponsorId: st.top_sponsor_user_id,
    extraCount: extraSponsorCount(st),
    topSponsorTier: st.highest_star_received,
    sponsorCount: st.total_sponsor_count,
    sponsorMomentum: 0,
    visibilityEligibility: "eligible" as const,
  };
}
