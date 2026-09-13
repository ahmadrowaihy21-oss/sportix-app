import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { listingById, partners } from "@/lib/marketplace/mock";
import { useMarket } from "@/lib/marketplace/store";
import type { CouponStatus } from "@/lib/marketplace/types";
import { CouponQR } from "./CouponQR";

const tabs: CouponStatus[] = ["active", "used", "expired"];

export function CouponWallet() {
  const pop = useMarket((s) => s.pop);
  const push = useMarket((s) => s.push);
  const coupons = useMarket((s) => s.coupons);
  const [tab, setTab] = useState<CouponStatus>("active");
  const list = coupons.filter((c) => c.status === tab);

  return (
    <div className="pb-28">
      <ScreenHeader title="My Coupons" subtitle="Coupon wallet" onBack={pop} />
      <div className="flex gap-1 px-4 pt-3">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              tab === t
                ? "h-8 rounded-full bg-lime px-3 text-2xs font-semibold capitalize text-lime-fg"
                : "h-8 rounded-full bg-elevated px-3 text-2xs capitalize text-muted"
            }
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3 px-4">
        {list.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">No {tab} coupons.</p>
        ) : (
          list.map((c) => {
            const listing = listingById[c.listingId];
            const partner = partners[c.partnerId];
            return (
              <article key={c.coupon_id} className="rounded-2xl border border-border bg-surface p-3">
                <p className="text-sm font-semibold">{listing?.title}</p>
                <p className="text-2xs text-muted">
                  {partner?.name} · {listing?.discountPct ? `${listing.discountPct}% OFF` : "Offer"}
                </p>
                <p className="mt-1 text-2xs text-muted">
                  Valid until {c.validity} · {c.coupon_id}
                </p>
                <p className="mt-1 text-3xs tabular text-faint">{c.code}</p>
                {c.status === "active" ? (
                  <Button
                    className="mt-3 w-full"
                    onClick={() => push({ type: "coupon-qr", couponId: c.coupon_id })}
                  >
                    SHOW QR
                  </Button>
                ) : (
                  <p className="mt-2 text-2xs capitalize text-muted">{c.status}</p>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

export function CouponQrScreen({ couponId }: { couponId: string }) {
  const pop = useMarket((s) => s.pop);
  const push = useMarket((s) => s.push);
  const redeemCoupon = useMarket((s) => s.redeemCoupon);
  const coupon = useMarket((s) => s.coupons.find((c) => c.coupon_id === couponId));
  const listing = coupon ? listingById[coupon.listingId] : undefined;
  const order = useMarket((s) => s.orders.find((o) => o.couponId === couponId));

  if (!coupon) return null;

  return (
    <div className="pb-28">
      <ScreenHeader title="Present QR" subtitle={listing?.title} onBack={pop} />
      <div className="space-y-4 px-4 py-6 text-center">
        <p className="text-2xs text-muted">Partner scans this code. Do not screenshot for transfer.</p>
        <CouponQR code={coupon.code} />
        <p className="font-display text-xl tracking-[0.14em]">{coupon.code}</p>
        <p className="text-2xs text-muted">
          {coupon.status === "active" ? `Valid until ${coupon.validity}` : coupon.status}
        </p>
        {coupon.status === "active" ? (
          <Button
            className="w-full"
            onClick={() => {
              const ok = redeemCoupon(coupon.coupon_id);
              if (ok && order) push({ type: "review", orderId: order.id });
            }}
          >
            Partner redeem
          </Button>
        ) : coupon.status === "used" && order && !order.rated ? (
          <Button className="w-full" onClick={() => push({ type: "review", orderId: order.id })}>
            Rate experience
          </Button>
        ) : null}
      </div>
    </div>
  );
}
