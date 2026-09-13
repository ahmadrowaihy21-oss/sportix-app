import { listings } from "@/lib/marketplace/mock";
import { useMarket } from "@/lib/marketplace/store";
import type { MarketCategory } from "@/lib/marketplace/types";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { DealCard } from "./DealCard";
import { ProductCard } from "./ProductCard";
import { SubscriptionCard } from "./SubscriptionCard";
import { ImpactProgramCard } from "./ImpactProgramCard";

const titles: Record<MarketCategory, string> = {
  deals: "Deals",
  products: "Products",
  subscriptions: "Subscriptions",
  impact: "SPORTIX Impact",
};

export function CategoryScreen({ category }: { category: MarketCategory }) {
  const pop = useMarket((s) => s.pop);
  const openListing = useMarket((s) => s.openListing);
  const impact = useMarket((s) => s.impact);
  const items = listings.filter((l) =>
    category === "deals"
      ? l.kind === "deal"
      : category === "products"
        ? l.kind === "product"
        : category === "subscriptions"
          ? l.kind === "subscription"
          : l.kind === "impact",
  );

  return (
    <div className="pb-28">
      <ScreenHeader
        title={titles[category]}
        subtitle={
          category === "subscriptions"
            ? "Memberships, academy, coach · not field booking"
            : category === "impact"
              ? "Approved programs"
              : undefined
        }
        onBack={pop}
      />
      <div className="space-y-3 px-4 py-4">
        {category === "impact" ? (
          <ImpactProgramCard program={impact} onOpen={() => openListing(impact.listingId)} />
        ) : category === "products" ? (
          <div className="grid grid-cols-2 gap-2">
            {items.map((l) => (
              <ProductCard key={l.id} listing={l} onOpen={() => openListing(l.id)} />
            ))}
          </div>
        ) : category === "subscriptions" ? (
          items.map((l) => (
            <SubscriptionCard
              key={l.id}
              listing={l}
              onOpen={() => openListing(l.id)}
              cta={
                l.id === "sub-academy"
                  ? "ENROLL"
                  : l.id === "sub-coach"
                    ? "VIEW PROFILE / PLAN"
                    : l.id === "sub-physio"
                      ? "VIEW PACKAGES"
                      : "VIEW PLAN"
              }
            />
          ))
        ) : (
          items.map((l) => <DealCard key={l.id} listing={l} onOpen={() => openListing(l.id)} />)
        )}
        {category === "deals" ? (
          <p className="text-2xs text-faint">
            Eligible services appear as coupons and packages. Sports field rental is not listed here.
          </p>
        ) : null}
      </div>
    </div>
  );
}
