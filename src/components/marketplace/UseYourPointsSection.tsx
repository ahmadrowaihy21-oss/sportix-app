import { listings, USE_YOUR_POINTS_IDS } from "@/lib/marketplace/mock";
import { formatPoints } from "@/lib/marketplace/format";
import { useMarket } from "@/lib/marketplace/store";

export function UseYourPointsSection() {
  const openListing = useMarket((s) => s.openListing);
  const points = useMarket((s) => s.pointsBalance);
  const items = USE_YOUR_POINTS_IDS.map((id) => listings.find((l) => l.id === id)).filter(
    (l): l is NonNullable<typeof l> => Boolean(l),
  );

  return (
    <section>
      <h2 className="text-sm font-semibold">Use your points</h2>
      <p className="mt-0.5 text-2xs text-muted">
        Things you can get now with your SPORTIX AI Points
      </p>
      <div className="hide-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
        {items.map((l) => {
          const cost = l.pointsPrice ?? l.priceSar;
          const affordable = points >= cost || l.kind === "impact";
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => openListing(l.id)}
              className="w-40 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface text-left"
            >
              <img src={l.image} alt="" className="h-24 w-full object-cover" />
              <span className="block p-2.5">
                <span className="block truncate text-xs font-semibold">{l.title}</span>
                <span className="mt-1 block text-2xs tabular text-lime">
                  {l.kind === "impact" ? "Custom points" : `${formatPoints(cost)} Points`}
                </span>
                <span className="mt-1.5 inline-flex text-2xs font-semibold text-fg">
                  {affordable ? "GET NOW" : "Need more points"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
