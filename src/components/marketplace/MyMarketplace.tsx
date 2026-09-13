import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { listingById } from "@/lib/marketplace/mock";
import { formatPoints, formatSar } from "@/lib/marketplace/format";
import { useMarket } from "@/lib/marketplace/store";

export function MyMarketplace() {
  const pop = useMarket((s) => s.pop);
  const push = useMarket((s) => s.push);
  const orders = useMarket((s) => s.orders);
  const coupons = useMarket((s) => s.coupons);
  const impact = useMarket((s) => s.impact);
  const products = orders.filter((o) => o.kind === "product");
  const subs = orders.filter((o) => o.kind === "subscription");
  const impacts = orders.filter((o) => o.kind === "impact");

  return (
    <div className="pb-28">
      <ScreenHeader title="My Marketplace" subtitle="Orders · coupons · plans · impact" onBack={pop} />
      <div className="space-y-6 px-4 py-4">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">Orders</h2>
          </div>
          {products.length === 0 ? (
            <p className="text-sm text-muted">No product orders yet.</p>
          ) : (
            products.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => push({ type: "order", id: o.id })}
                className="mb-2 flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-3 text-left"
              >
                <span>
                  <span className="block text-sm font-semibold">{o.title}</span>
                  <span className="text-2xs capitalize text-muted">{o.status}</span>
                </span>
                <span className="text-2xs tabular">{formatSar(o.grossSar)}</span>
              </button>
            ))
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">Coupons</h2>
            <button type="button" className="text-2xs text-lime" onClick={() => push({ type: "wallet" })}>
              Wallet
            </button>
          </div>
          {coupons.slice(0, 4).map((c) => (
            <button
              key={c.coupon_id}
              type="button"
              onClick={() =>
                c.status === "active"
                  ? push({ type: "coupon-qr", couponId: c.coupon_id })
                  : push({ type: "wallet" })
              }
              className="mb-2 flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-3 text-left"
            >
              <span>
                <span className="block text-sm font-semibold">{listingById[c.listingId]?.title}</span>
                <span className="text-2xs capitalize text-muted">{c.status}</span>
              </span>
            </button>
          ))}
        </section>

        <section>
          <h2 className="mb-2 text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
            Subscriptions
          </h2>
          {subs.length === 0 ? (
            <p className="text-sm text-muted">No active plans.</p>
          ) : (
            subs.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => push({ type: "order", id: o.id })}
                className="mb-2 flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-3 text-left"
              >
                <span>
                  <span className="block text-sm font-semibold">{o.title}</span>
                  <span className="text-2xs capitalize text-muted">{o.status}</span>
                </span>
              </button>
            ))
          )}
        </section>

        <section>
          <h2 className="mb-2 text-2xs font-semibold uppercase tracking-[0.16em] text-muted">Impact</h2>
          <button
            type="button"
            onClick={() => push({ type: "impact", id: impact.listingId })}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-3 text-left"
          >
            <span>
              <span className="block text-sm font-semibold">{impact.title}</span>
              <span className="text-2xs text-muted">
                {formatPoints(impact.user_contribution)} points contributed · not delivered
              </span>
            </span>
          </button>
          {impacts.map((o) => (
            <p key={o.id} className="mt-2 text-2xs text-muted">
              {formatPoints(o.pointsUsed)} · {o.status} · {o.auditRef}
            </p>
          ))}
        </section>
      </div>
    </div>
  );
}

export function OrderDetail({ id }: { id: string }) {
  const pop = useMarket((s) => s.pop);
  const push = useMarket((s) => s.push);
  const order = useMarket((s) => s.orders.find((o) => o.id === id));
  if (!order) return null;
  const canRate =
    !order.rated &&
    ((order.kind === "product" && (order.status === "paid" || order.status === "fulfilled")) ||
      (order.kind === "coupon" && order.status === "redeemed") ||
      (order.kind === "subscription" && order.status === "activated"));

  return (
    <div>
      <ScreenHeader title="Order" subtitle={order.id} onBack={pop} />
      <div className="space-y-3 px-4 py-4">
        <p className="text-lg font-semibold">{order.title}</p>
        <p className="text-sm capitalize text-muted">{order.status.replace("-", " ")}</p>
        <p className="text-sm tabular">Gross {formatSar(order.grossSar)}</p>
        <p className="text-sm tabular text-lime">Points {formatPoints(order.pointsUsed)}</p>
        <p className="text-sm tabular">Cash {formatSar(order.cashSar)}</p>
        <p className="text-2xs text-faint">{order.auditRef}</p>
        {canRate ? (
          <button
            type="button"
            className="text-sm font-semibold text-lime"
            onClick={() => push({ type: "review", orderId: order.id })}
          >
            Rate experience
          </button>
        ) : order.rated ? (
          <p className="text-2xs text-muted">Reviewed</p>
        ) : (
          <p className="text-2xs text-muted">Rating unlocks after completion.</p>
        )}
      </div>
    </div>
  );
}

export function ReviewScreen({ orderId }: { orderId: string }) {
  const pop = useMarket((s) => s.pop);
  const rateOrder = useMarket((s) => s.rateOrder);
  const order = useMarket((s) => s.orders.find((o) => o.id === orderId));
  if (!order) return null;
  return (
    <div>
      <ScreenHeader title="Rate experience" subtitle={order.title} onBack={pop} />
      <div className="space-y-3 px-4 py-6">
        <p className="text-sm text-muted">Available after legitimate completion only.</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                rateOrder(orderId, n);
                pop();
              }}
              className="flex size-11 items-center justify-center rounded-md bg-elevated text-sm"
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
