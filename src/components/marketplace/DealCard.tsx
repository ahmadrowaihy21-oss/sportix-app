import { partners } from "@/lib/marketplace/mock";
import { formatSar } from "@/lib/marketplace/format";
import type { MarketplaceListing } from "@/lib/marketplace/types";
import { VerifiedPartnerBadge } from "./VerifiedPartnerBadge";

export function DealCard({
  listing,
  onOpen,
}: {
  listing: MarketplaceListing;
  onOpen: () => void;
}) {
  const partner = partners[listing.partnerId];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full overflow-hidden rounded-2xl border border-border bg-surface text-left"
    >
      <div className="relative">
        <img src={listing.image} alt="" className="aspect-photo w-full object-cover" />
        {listing.discountPct ? (
          <span className="absolute left-3 top-3 rounded-md bg-lime px-2 py-1 text-2xs font-bold text-lime-fg">
            {listing.discountPct}% OFF
          </span>
        ) : listing.pointsOnly ? (
          <span className="absolute left-3 top-3 rounded-md bg-lime px-2 py-1 text-2xs font-bold text-lime-fg">
            POINTS
          </span>
        ) : null}
      </div>
      <div className="space-y-1.5 p-3">
        <p className="text-sm font-semibold">{listing.title}</p>
        <p className="text-2xs text-muted">{listing.subtitle}</p>
        {partner ? <VerifiedPartnerBadge trust={partner.trust} compact /> : null}
        <div className="flex items-baseline gap-2 pt-1">
          {listing.originalPriceSar && listing.originalPriceSar !== listing.priceSar ? (
            <span className="text-2xs text-faint line-through tabular">
              {formatSar(listing.originalPriceSar)}
            </span>
          ) : null}
          <span className="font-display text-xl leading-none tabular">{formatSar(listing.priceSar)}</span>
        </div>
        <p className="text-3xs text-lime">Use SPORTIX AI Points</p>
      </div>
    </button>
  );
}
