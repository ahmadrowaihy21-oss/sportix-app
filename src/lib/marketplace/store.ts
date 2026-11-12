import { create } from "zustand";
import { toast } from "sonner";
import { listingById, listings, partners, seedImpact } from "./mock";
import type {
  CartItem,
  Coupon,
  ImpactContribution,
  ImpactProgram,
  MarketScreen,
  Order,
  PayMethod,
} from "./types";

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

export const useMarket = create<MarketStore>((set, get) => ({
  pointsBalance: 0,
  cart: [],
  coupons: [],
  orders: [],
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
      recentlyViewed: [id, ...s.recentlyViewed.filter((x) => x !== id)].slice(
        0,
        8,
      ),
    }));
    if (listing.kind === "deal") get().push({ type: "deal", id });
    else if (listing.kind === "product") get().push({ type: "product", id });
    else if (listing.kind === "subscription")
      get().push({ type: "subscription", id });
    else get().push({ type: "impact", id });
  },

  addToCart: (listingId, variant) => {
    const listing = listingById[listingId];
    if (!listing || listing.kind !== "product") return;
    set((s) => {
      const existing = s.cart.find(
        (c) => c.listingId === listingId && c.variant === variant,
      );
      const cart = existing
        ? s.cart.map((c) =>
            c.listingId === listingId && c.variant === variant
              ? { ...c, qty: c.qty + 1 }
              : c,
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

  checkout: () => {
    notify(
      "Operational backend required. No payment, coupon or points transaction occurred.",
    );
    return null;
  },
  redeemCoupon: () => {
    notify("Coupon redemption requires the partner backend.");
    return false;
  },
  rateOrder: () => {
    notify("A server-confirmed completed order is required.");
  },
}));

export function searchListings(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return listings.filter((l) => l.kind !== "impact");
  return listings.filter((l) => {
    const hay =
      `${l.title} ${l.subtitle} ${l.category} ${l.city} ${l.tags.join(" ")} ${partners[l.partnerId]?.name ?? ""}`.toLowerCase();
    return hay.includes(q);
  });
}

export { listings, listingById };
