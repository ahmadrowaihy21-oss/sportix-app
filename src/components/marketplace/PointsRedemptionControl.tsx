import { formatSar } from "@/lib/marketplace/format";
import { cn } from "@/lib/utils";

const CHIPS = [
  { id: "0", label: "0%", frac: 0 },
  { id: "25", label: "25%", frac: 0.25 },
  { id: "50", label: "50%", frac: 0.5 },
  { id: "75", label: "75%", frac: 0.75 },
  { id: "max", label: "MAX", frac: 1 },
] as const;

export function PointsRedemptionControl({
  priceSar,
  availablePoints,
  used,
  onChange,
}: {
  priceSar: number;
  availablePoints: number;
  used: number;
  onChange: (n: number) => void;
}) {
  const max = Math.min(priceSar, availablePoints);
  const remaining = Math.max(0, priceSar - used);
  const full = used >= priceSar && priceSar > 0;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
          SPORTIX AI Points
        </p>
        <p className="mt-1 text-sm">
          Available: <span className="tabular">{formatSar(availablePoints)}</span>
        </p>
        <p className="mt-0.5 text-2xs text-muted">
          You can use up to {formatSar(max)} from your SPORTIX AI Points
          {max === priceSar ? " · 100% coverage eligible" : ""}.
        </p>
      </div>
      <label className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm">
        <input
          type="checkbox"
          checked={used === max && max > 0}
          onChange={(e) => onChange(e.target.checked ? max : 0)}
          className="size-4 accent-lime"
        />
        Use maximum SPORTIX AI Points
      </label>
      <div className="flex gap-1.5">
        {CHIPS.map((c) => {
          const value = Math.round(max * c.frac);
          const active = used === value;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(value)}
              className={cn(
                "h-9 flex-1 rounded-full text-2xs font-semibold",
                active ? "bg-lime text-lime-fg" : "bg-elevated text-muted",
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      <dl className="divide-y divide-border rounded-xl border border-border text-sm">
        <div className="flex justify-between px-3 py-2.5">
          <dt className="text-muted">Order</dt>
          <dd className="tabular">{formatSar(priceSar)}</dd>
        </div>
        <div className="flex justify-between px-3 py-2.5">
          <dt className="text-muted">SPORTIX AI Points</dt>
          <dd className="tabular text-lime">-{formatSar(used)}</dd>
        </div>
        <div className="flex justify-between px-3 py-2.5">
          <dt className="text-muted">Remaining</dt>
          <dd className="font-display text-lg tabular">{formatSar(remaining)}</dd>
        </div>
      </dl>
      <p className="text-3xs text-faint">
        {full
          ? "This purchase can be covered 100% with SPORTIX AI Points."
          : "Pay remaining by card or wallet. SPORTIX SPONSOR stars are not a Marketplace payment method."}
      </p>
    </div>
  );
}
