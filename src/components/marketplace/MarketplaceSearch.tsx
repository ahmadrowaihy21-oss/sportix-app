import { Search } from "lucide-react";
import { partners } from "@/lib/marketplace/mock";
import { searchListings, useMarket } from "@/lib/marketplace/store";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { DealCard } from "./DealCard";
import { ProductCard } from "./ProductCard";
import { SubscriptionCard } from "./SubscriptionCard";

export function MarketplaceSearch() {
  const query = useMarket((s) => s.query);
  const setQuery = useMarket((s) => s.setQuery);
  const pop = useMarket((s) => s.pop);
  const openListing = useMarket((s) => s.openListing);
  const results = searchListings(query).filter((l) => {
    if (!query.trim()) return true;
    const p = partners[l.partnerId];
    const hay = `${l.title} ${l.subtitle} ${l.category} ${l.city} ${p?.name ?? ""} ${l.tags.join(" ")}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });

  return (
    <div>
      <ScreenHeader title="Search" subtitle="Marketplace only" onBack={pop} />
      <div className="px-4 py-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, deals, services..."
            aria-label="Search products, deals, services"
            autoFocus
            className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-sm outline-none placeholder:text-faint"
          />
        </label>
        <p className="mt-2 text-3xs text-faint">Does not search Community posts.</p>
      </div>
      <div className="space-y-3 px-4 pb-24">
        {results.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">No Marketplace matches.</p>
        ) : (
          results.map((l) => {
            if (l.kind === "product") {
              return <ProductCard key={l.id} listing={l} onOpen={() => openListing(l.id)} />;
            }
            if (l.kind === "subscription") {
              return (
                <SubscriptionCard
                  key={l.id}
                  listing={l}
                  onOpen={() => openListing(l.id)}
                  cta="VIEW PLAN"
                />
              );
            }
            if (l.kind === "impact") {
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => openListing(l.id)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-left text-sm font-semibold"
                >
                  SPORTIX IMPACT · {l.title}
                </button>
              );
            }
            return <DealCard key={l.id} listing={l} onOpen={() => openListing(l.id)} />;
          })
        )}
      </div>
    </div>
  );
}
