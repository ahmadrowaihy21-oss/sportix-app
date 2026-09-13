import { Star } from "lucide-react";
import { partners } from "@/lib/marketplace/mock";
import { formatSar } from "@/lib/marketplace/format";
import type { MarketplaceListing } from "@/lib/marketplace/types";
import { VerifiedPartnerBadge } from "./VerifiedPartnerBadge";

export function SubscriptionCard({
  listing,
  onOpen,
  cta,
}: {
  listing: MarketplaceListing;
  onOpen: () => void;
  cta: string;
}) {
  const partner = partners[listing.partnerId];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full gap-3 overflow-hidden rounded-2xl border border-border bg-surface p-3 text-left"
    >
      <img src={listing.image} alt="" className="size-20 rounded-lg object-cover" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{listing.title}</span>
        <span className="mt-0.5 block text-2xs text-muted">{listing.subtitle}</span>
        <span className="mt-1 flex flex-wrap items-center gap-2 text-2xs text-muted">
          {listing.city}
          {typeof listing.rating === "number" ? (
            <span className="inline-flex items-center gap-0.5">
              <Star className="size-3 fill-lime text-lime" />
              {listing.rating}
            </span>
          ) : null}
        </span>
        {partner ? <VerifiedPartnerBadge trust={partner.trust} compact /> : null}
        <span className="mt-1.5 block font-display text-lg tabular">From {formatSar(listing.priceSar)}</span>
        <span className="mt-1 inline-flex text-2xs font-semibold text-lime">{cta}</span>
      </span>
    </button>
  );
}
