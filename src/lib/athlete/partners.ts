import { z } from "zod";
import { syntheticUserId, ensure } from "./contracts.ts";

// Field names mirror PR #2 lib/market.ts at 6db3b3f. No HTTP connection is configured.
export const partnerListingSchema = z
  .object({
    id: z.string().regex(/^demo-[a-z0-9-]+$/),
    tenant: z.string().regex(/^demo-[a-z0-9-]+$/),
    module: z.enum(["COUPONS", "PRODUCTS", "IMPACT"]),
    kind: z.enum([
      "COUPON",
      "SUBSCRIPTION",
      "PRODUCT",
      "NONPROFIT",
      "COMMERCIAL_EVENT",
    ]),
    name: z.string().min(1).max(200),
    priceMinor: z.number().int().min(0).max(1000000),
    stock: z.number().int().min(0),
    capacity: z.number().int().min(0),
    status: z.enum(["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "PAUSED"]),
    submittedBy: z.string(),
    reviewedBy: z.string().optional(),
    version: z.number().int().positive(),
  })
  .strict();
export type PartnerListing = z.infer<typeof partnerListingSchema>;
export function mapPartnerListing(raw: unknown) {
  const p = partnerListingSchema.parse(raw);
  ensure(p.status === "PUBLISHED", "LISTING_NOT_PUBLISHED");
  ensure(
    (p.kind === "PRODUCT" && p.module === "PRODUCTS") ||
      (["COUPON", "SUBSCRIPTION"].includes(p.kind) && p.module === "COUPONS"),
    "MODULE_KIND_MISMATCH",
  );
  ensure(p.reviewedBy && p.reviewedBy !== p.submittedBy, "APPROVAL_REQUIRED");
  return {
    id: p.id,
    partnerId: p.tenant,
    kind: p.kind,
    title: p.name,
    priceMinor: p.priceMinor,
    currency: "SAR" as const,
    version: p.version,
    stockPreview: p.stock,
    provenance: "SYNTHETIC_LOCAL" as const,
    purchasable: false as const,
  };
}
export type ProductPreview = ReturnType<typeof mapPartnerListing>;
export interface CommerceIntent {
  id: string;
  sportixUserId: string;
  listingId: string;
  partnerId: string;
  listingVersion: number;
  quantity: number;
  amountMinorPreview: number;
  requestedPoints: number;
  state: "AWAITING_OPERATIONAL_BACKEND";
  synthetic: true;
  paymentCaptured: false;
  couponIssued: false;
  pointsDebited: 0;
  rewardsGranted: 0;
}
export interface CommercePreviewState {
  sportixUserId: string;
  intents: CommerceIntent[];
  processed: Record<string, string>;
}
export function createCommercePreview(
  userId = "spx_test_athlete_001",
): CommercePreviewState {
  syntheticUserId.parse(userId);
  return { sportixUserId: userId, intents: [], processed: {} };
}
export function previewCommerceIntent(
  state: CommercePreviewState,
  userId: string,
  key: string,
  raw: unknown,
  quantity: number,
  requestedPoints = 0,
): CommercePreviewState {
  syntheticUserId.parse(userId);
  ensure(state.sportixUserId === userId, "OWNER_MISMATCH");
  ensure(/^[A-Za-z0-9_-]{8,100}$/.test(key), "INVALID_IDEMPOTENCY_KEY");
  const listing = mapPartnerListing(raw);
  ensure(
    Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 20,
    "INVALID_QUANTITY",
  );
  ensure(
    Number.isSafeInteger(requestedPoints) && requestedPoints >= 0,
    "INVALID_POINTS",
  );
  ensure(quantity <= listing.stockPreview, "PREVIEW_OUT_OF_STOCK");
  const scopedKey = `${userId}:${key}`;
  const fingerprint = JSON.stringify({ listing, quantity, requestedPoints });
  if (Object.hasOwn(state.processed, scopedKey)) {
    ensure(state.processed[scopedKey] === fingerprint, "IDEMPOTENCY_CONFLICT");
    return state;
  }
  const next = structuredClone(state);
  next.processed[scopedKey] = fingerprint;
  next.intents.push({
    id: `intent-${userId}-${key}`,
    sportixUserId: userId,
    listingId: listing.id,
    partnerId: listing.partnerId,
    listingVersion: listing.version,
    quantity,
    amountMinorPreview: listing.priceMinor * quantity,
    requestedPoints,
    state: "AWAITING_OPERATIONAL_BACKEND",
    synthetic: true,
    paymentCaptured: false,
    couponIssued: false,
    pointsDebited: 0,
    rewardsGranted: 0,
  });
  return next;
}
// A successful partner sandbox command is never a receipt, spendable balance or entitlement.
export function rejectSandboxSettlement(_receipt: unknown): never {
  throw new Error("OPERATIONAL_BACKEND_REQUIRED");
}
