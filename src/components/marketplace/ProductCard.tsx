import { partners } from "@/lib/marketplace/mock";
import { formatSar } from "@/lib/marketplace/format";
import type { MarketplaceListing } from "@/lib/marketplace/types";
import { VerifiedPartnerBadge } from "./VerifiedPartnerBadge";

export function ProductCard({
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
      className="overflow-hidden rounded-2xl border border-border bg-surface text-left"
    >
      <img src={listing.image} alt="" className="aspect-square w-full object-cover" />
      <div className="space-y-1 p-3">
        <p className="text-sm font-semibold">{listing.title}</p>
        <p className="text-2xs text-muted">{partner?.name}</p>
        {partner ? <VerifiedPartnerBadge trust={partner.trust} compact /> : null}
        <p className="pt-1 font-display text-lg tabular">{formatSar(listing.priceSar)}</p>
      </div>
    </button>
  );
}
