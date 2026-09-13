import { listings, VIEWER_CITY, VIEWER_SPORT } from "@/lib/marketplace/mock";
import { useMarket } from "@/lib/marketplace/store";
import { DealCard } from "./DealCard";

export function ForYouSection() {
  const openListing = useMarket((s) => s.openListing);
  const points = useMarket((s) => s.pointsBalance);
  const recommended = listings.filter(
    (l) =>
      l.kind === "deal" &&
      (l.city === VIEWER_CITY || (l.priceSar <= points && l.pointsEligible)),
  ).slice(0, 3);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold">For you</h2>
        <p className="mt-0.5 text-2xs text-muted">
          Recommended for {VIEWER_SPORT} · {VIEWER_CITY} · your points. Partners never receive SPORT ID.
        </p>
      </div>
      {recommended.map((l) => (
        <DealCard key={l.id} listing={l} onOpen={() => openListing(l.id)} />
      ))}
    </section>
  );
}
