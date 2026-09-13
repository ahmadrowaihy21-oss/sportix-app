import { Search, ShoppingBag, Ticket, Wallet } from "lucide-react";
import { useMarket } from "@/lib/marketplace/store";

export function MarketplaceHeader() {
  const push = useMarket((s) => s.push);
  const cartCount = useMarket((s) => s.cart.reduce((n, c) => n + c.qty, 0));

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/92 px-3 pb-3 pt-2 backdrop-blur-md">
      <div className="flex h-11 items-center justify-between">
        <div>
          <p className="font-display text-sm leading-none tracking-[0.18em]">SPORTIX</p>
          <p className="mt-0.5 text-3xs font-medium tracking-[0.22em] text-muted">MARKETPLACE</p>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => push({ type: "search" })}
            className="flex size-11 items-center justify-center rounded-md hover:bg-elevated"
            aria-label="Search Marketplace"
          >
            <Search className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => push({ type: "wallet" })}
            className="flex size-11 items-center justify-center rounded-md hover:bg-elevated"
            aria-label="My Coupons"
          >
            <Ticket className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => push({ type: "activity" })}
            className="flex size-11 items-center justify-center rounded-md hover:bg-elevated"
            aria-label="Orders and wallet"
          >
            <Wallet className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => push({ type: "cart" })}
            className="relative flex size-11 items-center justify-center rounded-md hover:bg-elevated"
            aria-label={cartCount ? `Cart, ${cartCount} items` : "Cart"}
          >
            <ShoppingBag className="size-5" />
            {cartCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-lime px-1 text-[10px] font-bold text-lime-fg">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
