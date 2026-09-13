import { useMarket } from "@/lib/marketplace/store";
import { formatPoints } from "@/lib/marketplace/format";

export function PointsBalanceCard() {
  const points = useMarket((s) => s.pointsBalance);
  return (
    <div className="rounded-2xl border border-lime/35 bg-lime/8 px-4 py-3">
      <p className="text-3xs font-semibold uppercase tracking-[0.18em] text-lime">
        SPORTIX AI Points
      </p>
      <p className="mt-1 font-display text-4xl leading-none tabular">{formatPoints(points)}</p>
      <p className="mt-1.5 text-2xs text-muted">
        Redeemable on eligible Marketplace value. Not SP AI, SSP AI, or SPORTIX SPONSOR.
      </p>
    </div>
  );
}
