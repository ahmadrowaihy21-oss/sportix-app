import { MapPin } from "lucide-react";
import { listings, VIEWER_CITY } from "@/lib/marketplace/mock";
import { formatSar } from "@/lib/marketplace/format";
import { useMarket } from "@/lib/marketplace/store";

export function NearbyDealsSection() {
  const openListing = useMarket((s) => s.openListing);
  const nearby = listings.filter((l) => l.city === VIEWER_CITY && l.kind !== "impact");

  return (
    <section>
      <h2 className="text-sm font-semibold">Near you</h2>
      <p className="mt-0.5 text-2xs text-muted">
        Broad {VIEWER_CITY} zone. Exact location is not shared with partners.
      </p>
      <div className="mt-3 space-y-2">
        {nearby.slice(0, 6).map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => openListing(l.id)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-2.5 text-left"
          >
            <img src={l.image} alt="" className="size-14 rounded-md object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold">{l.title}</span>
              <span className="mt-0.5 flex items-center gap-1 text-2xs text-muted">
                <MapPin className="size-3" />
                {l.city}
              </span>
            </span>
            <span className="text-2xs tabular">{formatSar(l.priceSar)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
