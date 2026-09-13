import { Search } from "lucide-react";
import { listings, partners } from "@/lib/marketplace/mock";
import { useMarket } from "@/lib/marketplace/store";
import { DealCard } from "./DealCard";
import { ForYouSection } from "./ForYouSection";
import { ForYourSportSection } from "./ForYourSportSection";
import { ImpactProgramCard } from "./ImpactProgramCard";
import { MarketplaceCategoryGrid } from "./MarketplaceCategoryGrid";
import { NearbyDealsSection } from "./NearbyDealsSection";
import { PointsBalanceCard } from "./PointsBalanceCard";
import { UseYourPointsSection } from "./UseYourPointsSection";
import { VerifiedPartnerBadge } from "./VerifiedPartnerBadge";

export function MarketplaceHome() {
  const push = useMarket((s) => s.push);
  const openListing = useMarket((s) => s.openListing);
  const impact = useMarket((s) => s.impact);
  const viewed = useMarket((s) => s.recentlyViewed);
  const topDeals = listings.filter((l) => l.kind === "deal" && l.discountPct);
  const verified = Object.values(partners).filter((p) => p.id !== "waqf").slice(0, 6);

  return (
    <div className="space-y-8 px-4 py-4 pb-28">
      <PointsBalanceCard />

      <button
        type="button"
        onClick={() => push({ type: "search" })}
        className="flex h-11 w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-faint"
      >
        <Search className="size-4" />
        Search products, deals, services...
      </button>

      <MarketplaceCategoryGrid />
      <ForYouSection />
      <UseYourPointsSection />
      <NearbyDealsSection />
      <ForYourSportSection />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Top deals</h2>
        {topDeals.map((l) => (
          <DealCard key={l.id} listing={l} onOpen={() => openListing(l.id)} />
        ))}
      </section>

      <section>
        <h2 className="text-sm font-semibold">Verified partners</h2>
        <div className="mt-3 space-y-2">
          {verified.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-3"
            >
              <div>
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-2xs text-muted">
                  {p.city} · {p.category}
                </p>
              </div>
              <VerifiedPartnerBadge trust={p.trust} compact />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">SPORTIX Impact</h2>
          <p className="mt-0.5 text-2xs text-muted">
            Contribute SPORTIX AI Points to approved programs. Collection is not delivery.
          </p>
        </div>
        <ImpactProgramCard program={impact} onOpen={() => openListing(impact.listingId)} />
      </section>

      {viewed.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold">Recently viewed</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {viewed.map((id) => {
              const l = listings.find((x) => x.id === id);
              if (!l) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => openListing(id)}
                  className="w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-surface text-left"
                >
                  <img src={l.image} alt="" className="h-16 w-full object-cover" />
                  <span className="block truncate px-2 py-1.5 text-3xs">{l.title}</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
