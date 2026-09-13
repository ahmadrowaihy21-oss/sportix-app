import { create } from "zustand";
import { toast } from "sonner";
import {
  listingById,
  listings,
  partners,
  seedCoupons,
  seedImpact,
  seedOrders,
  VIEWER_POINTS,
} from "./mock";
import { maxCoverable } from "./format";
import type {
  CartItem,
  Coupon,
  ImpactContribution,
  ImpactProgram,
  MarketScreen,
  Order,
  PayMethod,
} from "./types";

let seq = 200;
function nid(prefix: string) {
  seq += 1;
  return `${prefix}-${seq}`;
}

function notify(message: string) {
  toast(message, { duration: 2200 });
}

export interface MarketStore {
  pointsBalance: number;
  cart: CartItem[];
  coupons: Coupon[];
  orders: Order[];
  impact: ImpactProgram;
  contributions: ImpactContribution[];
  stack: MarketScreen[];
  query: string;
  recentlyViewed: string[];
  processedKeys: string[];
  sheet: { type: "pay-fail"; retry: () => void } | null;
  setQuery: (q: string) => void;
  push: (screen: MarketScreen) => void;
  pop: () => void;
  closeAll: () => void;
  openListing: (id: string) => void;
  addToCart: (listingId: string, variant?: string) => void;
  setQty: (listingId: string, qty: number) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
  checkout: (input: {
    listingId?: string;
    source: "cart" | "buy-now" | "coupon" | "subscribe" | "impact";
    pointsUsed: number;
    method: PayMethod;
    outcome: "success" | "failed";
    variant?: string;
    qty?: number;
    impactPoints?: number;
    clientKey: string;
  }) => Order | null;
  redeemCoupon: (couponId: string) => boolean;
  rateOrder: (orderId: string, stars: number) => void;
}

function issueCoupon(listingId: string): Coupon {
  const listing = listingById[listingId]!;
  return {
    coupon_id: nid("c"),
    listingId,
    partnerId: listing.partnerId,
    status: "active",
    validity: listing.validity ?? "30 Nov 2026",
    code: `SPX-${listingId.slice(-3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    redemptionMethod: "qr",
    issuedAt: new Date().toISOString(),
  };
}

export const useMarket = create<MarketStore>((set, get) => ({
  pointsBalance: VIEWER_POINTS,
  cart: [],
  coupons: seedCoupons.map((c) => ({ ...c })),
  orders: seedOrders.map((o) => ({ ...o })),
  impact: { ...seedImpact },
  contributions: [],
  stack: [],
  query: "",
  recentlyViewed: [],
  processedKeys: [],
  sheet: null,

  setQuery: (query) => set({ query }),
  push: (screen) => set((s) => ({ stack: [...s.stack, screen] })),
  pop: () => set((s) => ({ stack: s.stack.slice(0, -1) })),
  closeAll: () => set({ stack: [] }),

  openListing: (id) => {
    const listing = listingById[id];
    if (!listing) return;
    set((s) => ({
      recentlyViewed: [id, ...s.recentlyViewed.filter((x) => x !== id)].slice(0, 8),
    }));
    if (listing.kind === "deal") get().push({ type: "deal", id });
    else if (listing.kind === "product") get().push({ type: "product", id });
    else if (listing.kind === "subscription") get().push({ type: "subscription", id });
    else get().push({ type: "impact", id });
  },

  addToCart: (listingId, variant) => {
    const listing = listingById[listingId];
    if (!listing || listing.kind !== "product") return;
    set((s) => {
      const existing = s.cart.find((c) => c.listingId === listingId && c.variant === variant);
      const cart = existing
        ? s.cart.map((c) =>
            c.listingId === listingId && c.variant === variant ? { ...c, qty: c.qty + 1 } : c,
          )
        : [...s.cart, { listingId, qty: 1, variant }];
      return { cart };
    });
    notify("Added to cart");
  },

  setQty: (listingId, qty) =>
    set((s) => ({
      cart: s.cart
        .map((c) => (c.listingId === listingId ? { ...c, qty } : c))
        .filter((c) => c.qty > 0),
    })),

  removeFromCart: (listingId) =>
    set((s) => ({ cart: s.cart.filter((c) => c.listingId !== listingId) })),

  clearCart: () => set({ cart: [] }),

  checkout: ({
    listingId,
    source,
    pointsUsed,
    method,
    outcome,
    variant,
    qty = 1,
    impactPoints,
    clientKey,
  }) => {
    const state = get();
    if (state.processedKeys.includes(clientKey)) {
      return state.orders.find((o) => o.clientKey === clientKey) ?? null;
    }
    if (outcome === "failed") {
      const failed: Order = {
        id: nid("ord"),
        kind: source === "impact" ? "impact" : source === "subscribe" ? "subscription" : source === "coupon" ? "coupon" : "product",
        listingId: listingId ?? "cart",
        title: listingId ? listingById[listingId]?.title ?? "Order" : "Cart",
        status: "failed",
        grossSar: 0,
        pointsUsed: 0,
        cashSar: 0,
        qty,
        createdAt: new Date().toISOString(),
        auditRef: nid("aud"),
        clientKey,
      };
      set((s) => ({ orders: [failed, ...s.orders], processedKeys: [...s.processedKeys, clientKey] }));
      return failed;
    }

    if (source === "impact") {
      const pts = impactPoints ?? 0;
      if (pts <= 0 || pts > state.pointsBalance) {
        notify("Not enough SPORTIX AI Points");
        return null;
      }
      const order: Order = {
        id: nid("ord"),
        kind: "impact",
        listingId: state.impact.listingId,
        title: state.impact.title,
        status: "recorded",
        grossSar: 0,
        pointsUsed: pts,
        cashSar: 0,
        qty: 1,
        createdAt: new Date().toISOString(),
        auditRef: nid("aud"),
        clientKey,
      };
      const contribution: ImpactContribution = {
        id: nid("imp"),
        programId: state.impact.id,
        points: pts,
        createdAt: order.createdAt,
        auditRef: order.auditRef,
      };
      set((s) => ({
        pointsBalance: s.pointsBalance - pts,
        orders: [order, ...s.orders],
        contributions: [contribution, ...s.contributions],
        impact: {
          ...s.impact,
          points_collected: s.impact.points_collected + pts,
          user_contribution: s.impact.user_contribution + pts,
          status: "in-progress",
          delivery_status: "not-delivered",
          evidence_state: "none",
        },
        processedKeys: [...s.processedKeys, clientKey],
      }));
      notify("Contribution recorded");
      return order;
    }

    const items: { listingId: string; qty: number; variant?: string }[] =
      source === "cart"
        ? state.cart
        : listingId
          ? [{ listingId, qty, variant }]
          : [];
    if (items.length === 0) return null;

    let gross = 0;
    for (const item of items) {
      const listing = listingById[item.listingId];
      if (!listing || !listing.pointsEligible && pointsUsed > 0) continue;
      gross += listing.priceSar * item.qty;
    }
    const cover = maxCoverable(gross, state.pointsBalance);
    const used = Math.min(Math.max(0, pointsUsed), cover);
    if (used > state.pointsBalance) {
      notify("Not enough SPORTIX AI Points");
      return null;
    }
    const cash = Math.max(0, gross - used);
    if (cash > 0 && method === "points") {
      notify("Points do not fully cover this order");
      return null;
    }

    const first = items[0]!;
    const firstListing = listingById[first.listingId]!;
    const kind =
      source === "coupon" || firstListing.kind === "deal"
        ? "coupon"
        : source === "subscribe" || firstListing.kind === "subscription"
          ? "subscription"
          : "product";

    let coupon: Coupon | undefined;
    if (kind === "coupon") coupon = issueCoupon(first.listingId);

    const status: Order["status"] =
      kind === "coupon" ? "paid" : kind === "subscription" ? "activated" : "paid";

    const order: Order = {
      id: nid("ord"),
      kind,
      listingId: first.listingId,
      title:
        items.length > 1
          ? `${items.length} items`
          : firstListing.title,
      status,
      grossSar: gross,
      pointsUsed: used,
      cashSar: cash,
      qty: first.qty,
      createdAt: new Date().toISOString(),
      auditRef: nid("aud"),
      couponId: coupon?.coupon_id,
      clientKey,
    };

    set((s) => ({
      pointsBalance: s.pointsBalance - used,
      orders: [order, ...s.orders],
      coupons: coupon ? [coupon, ...s.coupons] : s.coupons,
      cart: source === "cart" ? [] : s.cart,
      processedKeys: [...s.processedKeys, clientKey],
    }));

    if (kind === "coupon") notify("Coupon issued");
    else if (kind === "subscription") notify("Subscription activated");
    else notify("Order paid");
    return order;
  },

  redeemCoupon: (couponId) => {
    const coupon = get().coupons.find((c) => c.coupon_id === couponId);
    if (!coupon) return false;
    if (coupon.status !== "active") {
      notify(coupon.status === "used" ? "Already redeemed" : "Coupon expired");
      return false;
    }
    set((s) => ({
      coupons: s.coupons.map((c) =>
        c.coupon_id === couponId ? { ...c, status: "used" } : c,
      ),
      orders: s.orders.map((o) =>
        o.couponId === couponId ? { ...o, status: "redeemed" } : o,
      ),
    }));
    notify("Coupon redeemed");
    return true;
  },

  rateOrder: (orderId) => {
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return;
    const allowed =
      (order.kind === "product" && (order.status === "fulfilled" || order.status === "paid")) ||
      (order.kind === "coupon" && order.status === "redeemed") ||
      (order.kind === "subscription" && order.status === "activated");
    if (!allowed) {
      notify("Rate after the order is completed");
      return;
    }
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, rated: true, status: o.kind === "product" ? "fulfilled" : o.status } : o)),
    }));
    notify("Thanks for the review");
  },
}));

export function searchListings(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return listings.filter((l) => l.kind !== "impact");
  return listings.filter((l) => {
    const hay = `${l.title} ${l.subtitle} ${l.category} ${l.city} ${l.tags.join(" ")} ${partners[l.partnerId]?.name ?? ""}`.toLowerCase();
    return hay.includes(q);
  });
}

export { listings, listingById };
