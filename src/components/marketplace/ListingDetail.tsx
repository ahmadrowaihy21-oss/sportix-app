import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { partners, listingById } from "@/lib/marketplace/mock";
import { formatSar } from "@/lib/marketplace/format";
import { useMarket } from "@/lib/marketplace/store";
import { VerifiedPartnerBadge } from "./VerifiedPartnerBadge";

export function DealDetail({ id }: { id: string }) {
  return <CommerceDetail id={id} cta="GET COUPON" source="coupon" />;
}

export function ProductDetail({ id }: { id: string }) {
  return <CommerceDetail id={id} cta="BUY NOW" source="buy-now" showCart />;
}

export function SubscriptionDetail({ id }: { id: string }) {
  const listing = listingById[id];
  const label =
    listing?.id === "sub-academy"
      ? "ENROLL"
      : listing?.id === "sub-coach"
        ? "VIEW PROFILE / PLAN"
        : listing?.id === "sub-physio"
          ? "VIEW PACKAGES"
          : "VIEW PLAN";
  return <CommerceDetail id={id} cta={label} source="subscribe" />;
}

function CommerceDetail({
  id,
  cta,
  source,
  showCart,
}: {
  id: string;
  cta: string;
  source: "coupon" | "buy-now" | "subscribe";
  showCart?: boolean;
}) {
  const listing = listingById[id];
  const partner = listing ? partners[listing.partnerId] : undefined;
  const pop = useMarket((s) => s.pop);
  const push = useMarket((s) => s.push);
  const addToCart = useMarket((s) => s.addToCart);
  const [variant, setVariant] = useState(listing?.variants?.[0]);
  const [qty, setQty] = useState(1);
  if (!listing) return null;

  return (
    <div className="pb-28">
      <ScreenHeader title={listing.kind === "deal" ? "Deal" : listing.kind === "product" ? "Product" : "Plan"} onBack={pop} />
      <img src={listing.image} alt="" className="aspect-photo w-full object-cover" />
      <div className="space-y-4 px-4 py-4">
        {listing.discountPct ? (
          <p className="text-2xs font-bold tracking-[0.16em] text-lime">{listing.discountPct}% OFF</p>
        ) : null}
        <div>
          <h2 className="text-xl font-semibold">{listing.title}</h2>
          <p className="mt-1 text-sm text-muted">{listing.subtitle}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">{partner?.name}</p>
          {partner ? <VerifiedPartnerBadge trust={partner.trust} /> : null}
          {typeof listing.rating === "number" ? (
            <p className="mt-1 inline-flex items-center gap-1 text-2xs text-muted">
              <Star className="size-3 fill-lime text-lime" />
              {listing.rating} · {listing.city}
            </p>
          ) : (
            <p className="mt-1 text-2xs text-muted">{listing.city}</p>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          {listing.originalPriceSar && listing.originalPriceSar !== listing.priceSar ? (
            <span className="text-sm text-faint line-through tabular">{formatSar(listing.originalPriceSar)}</span>
          ) : null}
          <span className="font-display text-3xl tabular">{formatSar(listing.priceSar)}</span>
        </div>
        {listing.validity ? <p className="text-2xs text-muted">Valid until {listing.validity}</p> : null}
        {listing.deliveryEstimate ? (
          <p className="text-2xs text-muted">Delivery {listing.deliveryEstimate}</p>
        ) : null}
        <p className="text-2xs text-lime">Eligible for SPORTIX AI Points · up to 100% coverage</p>

        {listing.variants ? (
          <div>
            <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">Options</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {listing.variants.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVariant(v)}
                  className={
                    variant === v
                      ? "h-9 rounded-full bg-lime px-3 text-2xs font-semibold text-lime-fg"
                      : "h-9 rounded-full bg-elevated px-3 text-2xs text-muted"
                  }
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {showCart ? (
          <div className="flex items-center gap-3">
            <p className="text-2xs text-muted">Quantity</p>
            <button type="button" className="size-9 rounded-md bg-elevated" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span className="tabular">{qty}</span>
            <button type="button" className="size-9 rounded-md bg-elevated" onClick={() => setQty((q) => q + 1)}>
              +
            </button>
          </div>
        ) : null}

        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">Included</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-muted">
            {listing.included.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">Not included</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-muted">
            {listing.excluded.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">Terms</p>
          <ul className="mt-1 space-y-1 text-sm text-muted">
            {listing.terms.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <p className="text-3xs text-faint">
          Marketplace listing. No Like, Comment, Repost, or SPORTIX SPONSOR on this screen.
        </p>
        <div className="grid gap-2">
          {showCart ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => addToCart(listing.id, variant)}
            >
              ADD TO CART
            </Button>
          ) : null}
          <Button
            className="w-full"
            onClick={() =>
              push({
                type: "checkout",
                listingId: listing.id,
                source,
              })
            }
          >
            {cta}
          </Button>
        </div>
      </div>
    </div>
  );
}
