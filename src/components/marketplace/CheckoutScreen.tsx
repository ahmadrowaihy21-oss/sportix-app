import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { listingById, partners } from "@/lib/marketplace/mock";
import { formatSar } from "@/lib/marketplace/format";
import { useMarket } from "@/lib/marketplace/store";
import type { PayMethod } from "@/lib/marketplace/types";
import { PointsRedemptionControl } from "./PointsRedemptionControl";
import { VerifiedPartnerBadge } from "./VerifiedPartnerBadge";

export function CheckoutScreen({
  listingId,
  source,
}: {
  listingId?: string;
  source: "cart" | "buy-now" | "coupon" | "subscribe" | "impact";
}) {
  const pop = useMarket((s) => s.pop);
  const push = useMarket((s) => s.push);
  const cart = useMarket((s) => s.cart);
  const points = useMarket((s) => s.pointsBalance);
  const checkout = useMarket((s) => s.checkout);

  const items = useMemo(() => {
    if (source === "cart") {
      return cart.map((c) => ({ listing: listingById[c.listingId]!, qty: c.qty, variant: c.variant }));
    }
    if (!listingId || !listingById[listingId]) return [];
    return [{ listing: listingById[listingId]!, qty: 1, variant: listingById[listingId]!.variants?.[0] }];
  }, [source, cart, listingId]);

  const price = items.reduce((n, i) => n + i.listing.priceSar * i.qty, 0);
  const max = Math.min(price, points);
  const [used, setUsed] = useState(max);
  const [method, setMethod] = useState<PayMethod>(max >= price ? "points" : "split");
  const [demoFail, setDemoFail] = useState(false);
  const [step, setStep] = useState<"form" | "processing" | "success" | "failed">("form");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientKey] = useState(() => `ck-${Date.now()}-${Math.random().toString(16).slice(2)}`);

  useEffect(() => {
    setUsed(max);
  }, [max]);

  useEffect(() => {
    if (used >= price && price > 0) setMethod("points");
    else if (used > 0) setMethod("split");
    else setMethod("card");
  }, [used, price]);

  useEffect(() => {
    if (step !== "processing") return;
    const t = window.setTimeout(() => {
      const order = checkout({
        listingId,
        source,
        pointsUsed: used,
        method,
        outcome: demoFail ? "failed" : "success",
        clientKey: `${clientKey}-${demoFail ? "f" : "s"}`,
      });
      if (order && !demoFail) {
        setOrderId(order.id);
        setStep("success");
      } else {
        setStep("failed");
      }
    }, 1100);
    return () => window.clearTimeout(t);
  }, [step]);

  const remaining = Math.max(0, price - used);
  const first = items[0];

  if (!first) {
    return (
      <div>
        <ScreenHeader title="Checkout" onBack={pop} />
        <p className="px-4 py-10 text-sm text-muted">Your cart is empty.</p>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div>
        <ScreenHeader title="Checkout" onBack={pop} />
        <div className="flex flex-col items-center gap-3 py-20">
          <span className="size-8 animate-spin rounded-full border-2 border-border border-t-lime" />
          <p className="text-sm text-muted">Processing Marketplace payment</p>
        </div>
      </div>
    );
  }

  if (step === "failed") {
    return (
      <div>
        <ScreenHeader title="Payment failed" onBack={pop} />
        <div className="space-y-3 px-4 py-8 text-center">
          <p className="text-sm font-semibold">Payment failed</p>
          <p className="text-xs text-muted">No points were deducted. Retry with another method.</p>
          <Button className="w-full" onClick={() => setStep("form")}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    const order = useMarket.getState().orders.find((o) => o.id === orderId);
    return (
      <div>
        <ScreenHeader title="Confirmed" onBack={pop} />
        <div className="space-y-4 px-4 py-6 text-center">
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-lime">
            {order?.kind === "coupon"
              ? "Coupon issued"
              : order?.kind === "subscription"
                ? "Subscription activated"
                : "Order paid"}
          </p>
          <p className="text-lg font-semibold">{first.listing.title}</p>
          <p className="text-sm text-muted">
            {formatSar(order?.pointsUsed ?? used)} in SPORTIX AI Points
            {(order?.cashSar ?? remaining) > 0 ? ` · ${formatSar(order?.cashSar ?? remaining)} cash` : ""}
          </p>
          <p className="text-2xs text-faint">Ref {order?.auditRef}</p>
          <div className="grid gap-2 pt-2">
            {order?.couponId ? (
              <Button
                className="w-full"
                onClick={() => push({ type: "coupon-qr", couponId: order.couponId! })}
              >
                SHOW QR
              </Button>
            ) : null}
            <Button
              variant={order?.couponId ? "outline" : "lime"}
              className="w-full"
              onClick={() => push({ type: "activity" })}
            >
              View Marketplace history
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => useMarket.getState().closeAll()}>
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const partner = partners[first.listing.partnerId];

  return (
    <div className="pb-28">
      <ScreenHeader title="Checkout" subtitle="Marketplace" onBack={pop} />
      <div className="space-y-5 px-4 py-4">
        {items.map((item) => (
          <div key={item.listing.id} className="flex gap-3 rounded-xl border border-border bg-surface p-3">
            <img src={item.listing.image} alt="" className="size-16 rounded-md object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{item.listing.title}</p>
              <p className="text-2xs text-muted">
                {partners[item.listing.partnerId]?.name} · ×{item.qty}
              </p>
              {partner && item === first ? <VerifiedPartnerBadge trust={partner.trust} compact /> : null}
              <p className="mt-1 font-display text-lg tabular">{formatSar(item.listing.priceSar * item.qty)}</p>
            </div>
          </div>
        ))}

        <PointsRedemptionControl
          priceSar={price}
          availablePoints={points}
          used={used}
          onChange={setUsed}
        />

        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">Payment method</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(
              [
                ["card", "Card"],
                ["apple", "Apple Pay"],
                ["google", "Google Pay"],
                ["points", "SPORTIX AI Points"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMethod(id);
                  if (id === "points") setUsed(max);
                }}
                className={
                  method === id || (method === "split" && id === "points" && used > 0)
                    ? "rounded-md border border-lime bg-lime/10 px-3 py-2.5 text-2xs font-medium"
                    : "rounded-md border border-border px-3 py-2.5 text-2xs text-muted"
                }
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-3xs text-faint">
            Prototype only. SPORTIX SPONSOR stars cannot pay Marketplace orders.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDemoFail(false)}
            className={
              !demoFail
                ? "rounded-md border border-lime bg-lime/10 px-3 py-2.5 text-2xs font-medium"
                : "rounded-md border border-border px-3 py-2.5 text-2xs text-muted"
            }
          >
            Mada ··4242
          </button>
          <button
            type="button"
            onClick={() => setDemoFail(true)}
            className={
              demoFail
                ? "rounded-md border border-warn bg-warn/10 px-3 py-2.5 text-2xs font-medium"
                : "rounded-md border border-border px-3 py-2.5 text-2xs text-muted"
            }
          >
            Card ··0002
          </button>
        </div>

        <p className="text-3xs text-muted">
          By confirming you accept partner terms. Partners do not receive SPORT ID or Community graph data.
        </p>

        <Button className="w-full" onClick={() => setStep("processing")}>
          {remaining === 0 ? "CONFIRM WITH POINTS" : `PAY ${formatSar(remaining)}`}
        </Button>
      </div>
    </div>
  );
}
