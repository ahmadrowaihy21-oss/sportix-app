export type PartnerTrust =
  | "verified-partner"
  | "verified-academy"
  | "verified-coach"
  | "verified-facility"
  | "verified-provider";

export type ListingKind = "deal" | "product" | "subscription" | "impact";

export type MarketCategory = "deals" | "products" | "subscriptions" | "impact";

export type CouponStatus = "active" | "used" | "expired";

export type OrderKind = "product" | "coupon" | "subscription" | "impact";

export type OrderStatus =
  | "created"
  | "awaiting-payment"
  | "paid"
  | "redeemed"
  | "activated"
  | "fulfilled"
  | "cancelled"
  | "refunded"
  | "failed"
  | "recorded"
  | "tracking";

export type PayMethod = "card" | "apple" | "google" | "points" | "split";

export type ImpactDelivery = "not-delivered" | "in-delivery" | "delivered-verified";

export interface Partner {
  id: string;
  name: string;
  city: string;
  trust: PartnerTrust;
  rating?: number;
  category: string;
}

export interface MarketplaceListing {
  id: string;
  kind: ListingKind;
  title: string;
  subtitle: string;
  partnerId: string;
  city: string;
  sport: "Football" | "Running" | "Gym" | "Swimming" | "Tennis" | "Padel" | null;
  image: string;
  priceSar: number;
  originalPriceSar?: number;
  discountPct?: number;
  pointsEligible: boolean;
  category: string;
  rating?: number;
  validity?: string;
  terms: string[];
  included: string[];
  excluded: string[];
  deliveryEstimate?: string;
  variants?: string[];
  tags: string[];
  pointsOnly?: boolean;
  pointsPrice?: number;
}

export interface CartItem {
  listingId: string;
  qty: number;
  variant?: string;
}

export interface Coupon {
  coupon_id: string;
  listingId: string;
  partnerId: string;
  status: CouponStatus;
  validity: string;
  code: string;
  redemptionMethod: "qr";
  issuedAt: string;
}

export interface Order {
  id: string;
  kind: OrderKind;
  listingId: string;
  title: string;
  status: OrderStatus;
  grossSar: number;
  pointsUsed: number;
  cashSar: number;
  qty: number;
  createdAt: string;
  auditRef: string;
  couponId?: string;
  clientKey: string;
  rated?: boolean;
}

export interface ImpactProgram {
  id: string;
  listingId: string;
  title: string;
  approved_partner: string;
  verified_program: true;
  impact_goal: string;
  points_goal: number;
  points_collected: number;
  user_contribution: number;
  status: "collecting" | "in-progress" | "delivered" | "reported";
  delivery_status: ImpactDelivery;
  evidence_state: "none" | "pending" | "published";
}

export interface ImpactContribution {
  id: string;
  programId: string;
  points: number;
  createdAt: string;
  auditRef: string;
}

export type MarketScreen =
  | { type: "category"; category: MarketCategory }
  | { type: "deal"; id: string }
  | { type: "product"; id: string }
  | { type: "subscription"; id: string }
  | { type: "impact"; id: string }
  | { type: "cart" }
  | { type: "checkout"; listingId?: string; source: "cart" | "buy-now" | "coupon" | "subscribe" | "impact" }
  | { type: "wallet" }
  | { type: "coupon-qr"; couponId: string }
  | { type: "activity" }
  | { type: "order"; id: string }
  | { type: "review"; orderId: string }
  | { type: "search" };
