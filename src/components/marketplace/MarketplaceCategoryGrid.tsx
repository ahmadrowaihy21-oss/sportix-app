import { HeartHandshake, Package, RefreshCw, Ticket } from "lucide-react";
import { useMarket } from "@/lib/marketplace/store";
import type { MarketCategory } from "@/lib/marketplace/types";

const cats: { id: MarketCategory; label: string; hint: string; icon: typeof Ticket }[] = [
  { id: "deals", label: "Deals", hint: "Coupons", icon: Ticket },
  { id: "products", label: "Products", hint: "Ship to you", icon: Package },
  { id: "subscriptions", label: "Subscriptions", hint: "Gym · Academy · Coach", icon: RefreshCw },
  { id: "impact", label: "SPORTIX Impact", hint: "Contribute points", icon: HeartHandshake },
];

export function MarketplaceCategoryGrid() {
  const push = useMarket((s) => s.push);
  return (
    <div className="grid grid-cols-2 gap-2">
      {cats.map((c) => {
        const Icon = c.icon;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => push({ type: "category", category: c.id })}
            className="rounded-2xl border border-border bg-surface px-3 py-3 text-left hover:bg-elevated"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-lime/15 text-lime">
              <Icon className="size-4" />
            </span>
            <p className="mt-2 text-sm font-semibold">{c.label}</p>
            <p className="text-2xs text-muted">{c.hint}</p>
          </button>
        );
      })}
    </div>
  );
}
