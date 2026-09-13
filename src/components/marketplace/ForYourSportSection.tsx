import { listings, VIEWER_SPORT } from "@/lib/marketplace/mock";
import { useMarket } from "@/lib/marketplace/store";
import { ProductCard } from "./ProductCard";
import { SubscriptionCard } from "./SubscriptionCard";

export function ForYourSportSection() {
  const openListing = useMarket((s) => s.openListing);
  const sportItems = listings.filter((l) => l.sport === VIEWER_SPORT);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold">For your sport</h2>
        <p className="mt-0.5 text-2xs text-muted">
          {VIEWER_SPORT} gear, academy and coach packages. Not a venue booking surface.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {sportItems
          .filter((l) => l.kind === "product")
          .map((l) => (
            <ProductCard key={l.id} listing={l} onOpen={() => openListing(l.id)} />
          ))}
      </div>
      {sportItems
        .filter((l) => l.kind === "subscription")
        .map((l) => (
          <SubscriptionCard
            key={l.id}
            listing={l}
            onOpen={() => openListing(l.id)}
            cta={l.id === "sub-academy" ? "ENROLL" : l.id === "sub-coach" ? "VIEW PROFILE / PLAN" : "VIEW PLAN"}
          />
        ))}
    </section>
  );
}
