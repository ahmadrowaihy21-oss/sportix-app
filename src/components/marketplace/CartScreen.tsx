import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { listingById } from "@/lib/marketplace/mock";
import { formatSar } from "@/lib/marketplace/format";
import { useMarket } from "@/lib/marketplace/store";

export function CartScreen() {
  const pop = useMarket((s) => s.pop);
  const push = useMarket((s) => s.push);
  const cart = useMarket((s) => s.cart);
  const setQty = useMarket((s) => s.setQty);
  const removeFromCart = useMarket((s) => s.removeFromCart);
  const total = cart.reduce((n, c) => n + (listingById[c.listingId]?.priceSar ?? 0) * c.qty, 0);

  return (
    <div className="pb-28">
      <ScreenHeader title="Cart" subtitle="Products" onBack={pop} />
      {cart.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-muted">Your cart is empty.</p>
      ) : (
        <div className="space-y-3 px-4 py-4">
          {cart.map((item) => {
            const listing = listingById[item.listingId];
            if (!listing) return null;
            return (
              <div key={item.listingId} className="flex gap-3 rounded-xl border border-border bg-surface p-3">
                <img src={listing.image} alt="" className="size-16 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{listing.title}</p>
                  {item.variant ? <p className="text-2xs text-muted">{item.variant}</p> : null}
                  <p className="mt-1 font-display tabular">{formatSar(listing.priceSar)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" className="size-8 rounded-md bg-elevated" onClick={() => setQty(item.listingId, item.qty - 1)}>
                      −
                    </button>
                    <span className="tabular text-sm">{item.qty}</span>
                    <button type="button" className="size-8 rounded-md bg-elevated" onClick={() => setQty(item.listingId, item.qty + 1)}>
                      +
                    </button>
                    <button type="button" className="ml-auto text-2xs text-danger" onClick={() => removeFromCart(item.listingId)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <p className="font-display text-2xl tabular">{formatSar(total)}</p>
          <Button className="w-full" onClick={() => push({ type: "checkout", source: "cart" })}>
            Checkout
          </Button>
        </div>
      )}
    </div>
  );
}
