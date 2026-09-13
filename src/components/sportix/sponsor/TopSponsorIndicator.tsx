import { users } from "@/lib/sportix/mock";
import { starById, type StarTierId } from "@/lib/sportix/stars";
import type { SponsorState } from "@/lib/sportix/types";
import { VerifiedMark } from "../VerificationBadge";
import { SponsorMomentumBadge } from "./SponsorMomentumBadge";
import { SponsorStarIcon } from "./SponsorStarIcon";

export function TopSponsorIndicator({
  sponsor,
  scope,
  onClick,
  onHistory,
}: {
  sponsor: SponsorState;
  scope: "post" | "athlete";
  onClick?: () => void;
  onHistory?: () => void;
}) {
  const top = sponsor.topSponsorId ? users[sponsor.topSponsorId] : undefined;
  const tier = starById((sponsor.topSponsorTier as StarTierId | null) ?? null);
  const extra = sponsor.extraCount;
  const scopeLabel = scope === "post" ? "Top Sponsor — This Post" : "Top Sponsor — Athlete";
  let detail = "Be the first Sponsor";
  if (top) {
    detail =
      extra > 0
        ? `Top Sponsor: ${top.displayName} +${extra} sponsors`
        : `Top Sponsor: ${top.displayName}`;
  }

  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-elevated/50"
        aria-label={`SPORTIX SPONSOR, ${scopeLabel}. ${detail}${tier ? `, ${tier.name}` : ""}`}
      >
        <span className="flex size-8 items-center justify-center">
          {tier ? (
            <SponsorStarIcon tier={tier.tier_id} size="sm" prestige={tier.tier_id === "signature"} />
          ) : (
            <SponsorStarIcon tier="green" size="sm" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-2xs font-semibold tracking-wide text-fg">
            SPORTIX SPONSOR
            <span className="ml-1.5 font-medium text-muted">· {scopeLabel}</span>
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-2xs text-muted">
            <span className="truncate">{detail}</span>
            {top?.verified ? <VerifiedMark className="size-3" /> : null}
            {tier ? <span className="text-fg">{tier.shortName} Star</span> : null}
          </span>
        </span>
        {scope === "post" && (sponsor.sponsorMomentum ?? 0) > 0 ? (
          <SponsorMomentumBadge value={sponsor.sponsorMomentum ?? 0} />
        ) : null}
      </button>
      {onHistory ? (
        <button
          type="button"
          onClick={onHistory}
          className="w-full px-4 pb-2 text-left text-2xs text-muted hover:text-fg"
        >
          Sponsor History
        </button>
      ) : null}
    </div>
  );
}
