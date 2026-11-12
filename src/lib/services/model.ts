import { z } from "zod";

export const kinds = [
  "CLUB",
  "ACADEMY",
  "COACH",
  "VENUE",
  "PRODUCT",
  "COUPON",
  "SUBSCRIPTION",
  "IMPACT",
] as const;
export type Kind = (typeof kinds)[number];
export type Actor = {
  id: string;
  role: "athlete" | "partner" | "reviewer";
  tenant: string | null;
  adult: boolean;
};
export type OfferStatus =
  "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "PAUSED";
export type RequestStatus =
  "REQUESTED" | "ACCEPTED" | "COMPLETED" | "CANCELLED" | "REJECTED" | "EXPIRED";
export interface Offer {
  id: string;
  tenant: string;
  kind: Kind;
  title: string;
  description: string;
  city: string;
  priceMinor: number;
  capacity: number;
  remaining: number;
  startsAt: string | null;
  durationDays: number;
  status: OfferStatus;
  version: number;
  submittedBy: string;
  reviewedBy: string | null;
}
export interface ServiceRequest {
  id: string;
  tenant: string;
  athleteId: string;
  offerId: string;
  title: string;
  kind: Kind;
  priceMinor: number;
  quantity: number;
  offerVersion: number;
  status: RequestStatus;
  version: number;
  createdAt: string;
  expiresAt: string;
  consentVersion: "request-v1";
  entitlement: null | {
    status: "SIMULATED_ACTIVE" | "SIMULATED_USED";
    expiresAt: string;
  };
  rating: number | null;
  paymentCaptured: false;
  pointsDebited: 0;
}
export interface ServiceState {
  schema: 1;
  mode: "sandbox" | "operational";
  revision: number;
  offers: Offer[];
  requests: ServiceRequest[];
  receipts: Record<string, string>;
  audit: {
    actorId: string;
    op: string;
    entityId: string;
    at: string;
    revision: number;
  }[];
}
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
const version = z.number().int().positive();
export const offerInput = z
  .object({
    id,
    kind: z.enum(kinds),
    title: z.string().trim().min(3).max(100),
    description: z.string().trim().min(5).max(500),
    city: z.string().trim().min(2).max(80),
    priceMinor: z.number().int().min(0).max(1000000),
    capacity: z.number().int().min(1).max(10000),
    startsAt: z.string().datetime().nullable(),
    durationDays: z.number().int().min(1).max(366),
  })
  .strict();
export const serviceCommand = z.discriminatedUnion("op", [
  z.object({ op: z.literal("offer.create"), offer: offerInput }).strict(),
  z
    .object({
      op: z.enum([
        "offer.submit",
        "offer.approve",
        "offer.publish",
        "offer.pause",
      ]),
      id,
      version,
    })
    .strict(),
  z
    .object({
      op: z.literal("request.create"),
      id,
      offerId: id,
      offerVersion: version,
      quantity: z.number().int().min(1).max(10),
      consent: z.literal(true),
    })
    .strict(),
  z
    .object({
      op: z.enum([
        "request.accept",
        "request.reject",
        "request.cancel",
        "request.complete",
        "request.redeem",
      ]),
      id,
      version,
    })
    .strict(),
  z
    .object({
      op: z.literal("request.rate"),
      id,
      version,
      rating: z.number().int().min(1).max(5),
    })
    .strict(),
]);
export type ServiceCommand = z.infer<typeof serviceCommand>;
export function emptyServices(
  mode: ServiceState["mode"] = "operational",
): ServiceState {
  return {
    schema: 1,
    mode,
    revision: 0,
    offers: [],
    requests: [],
    receipts: {},
    audit: [],
  };
}
export class ServiceError extends Error {}
export function assertRule(value: unknown, code: string): asserts value {
  if (!value) throw new ServiceError(code);
}
const active = (r: ServiceRequest) =>
  r.status === "REQUESTED" || r.status === "ACCEPTED";
export function available(
  offer: Offer,
  requests: ServiceRequest[],
  now: string,
) {
  return (
    offer.remaining +
    requests
      .filter(
        (r) =>
          r.offerId === offer.id &&
          r.status === "REQUESTED" &&
          r.expiresAt <= now,
      )
      .reduce((sum, r) => sum + r.quantity, 0)
  );
}
function expire(state: ServiceState, now: string) {
  for (const r of state.requests) {
    if (r.status === "REQUESTED" && r.expiresAt <= now) {
      r.status = "EXPIRED";
      r.version++;
      state.offers.find((o) => o.id === r.offerId)!.remaining += r.quantity;
      state.audit.push({
        actorId: "system",
        op: "request.expire",
        entityId: r.id,
        at: now,
        revision: state.revision + 1,
      });
    }
  }
}
/** Pure rules shared by the browser sandbox and authenticated server repository.
 * A sandbox result can never be a payment, verified activity or real entitlement. */
export function executeService(
  original: ServiceState,
  actor: Actor,
  key: string,
  raw: unknown,
  now: string,
): ServiceState {
  assertRule(
    actor.id && ["athlete", "partner", "reviewer"].includes(actor.role),
    "UNAUTHORIZED",
  );
  assertRule(/^[a-zA-Z0-9_-]{8,100}$/.test(key), "INVALID_KEY");
  assertRule(Number.isFinite(Date.parse(now)), "INVALID_TIME");
  const command = serviceCommand.parse(raw);
  const receipt = `receipt:${actor.id}:${actor.role}:${actor.tenant ?? ""}:${key}`;
  const fingerprint = JSON.stringify(command);
  if (Object.hasOwn(original.receipts, receipt)) {
    assertRule(
      original.receipts[receipt] === fingerprint,
      "IDEMPOTENCY_CONFLICT",
    );
    return original;
  }
  assertRule(Object.keys(original.receipts).length < 10000, "ARCHIVE_REQUIRED");
  const next = structuredClone(original);
  expire(next, now);
  const partner = (tenant: string) =>
    assertRule(
      actor.role === "partner" && actor.tenant === tenant,
      "FORBIDDEN",
    );
  let entityId: string;
  if (command.op === "offer.create") {
    assertRule(actor.role === "partner" && actor.tenant, "FORBIDDEN");
    const o = command.offer;
    assertRule(!next.offers.some((x) => x.id === o.id), "DUPLICATE_OFFER");
    assertRule(o.startsAt === null || o.startsAt > now, "PAST_SLOT");
    assertRule(
      !["COACH", "VENUE"].includes(o.kind) || o.startsAt,
      "SLOT_REQUIRED",
    );
    next.offers.push({
      ...o,
      tenant: actor.tenant,
      status: "DRAFT",
      remaining: o.capacity,
      version: 1,
      submittedBy: actor.id,
      reviewedBy: null,
    });
    entityId = o.id;
  } else if (command.op.startsWith("offer.")) {
    const c = command as Extract<
      ServiceCommand,
      { op: "offer.submit" | "offer.approve" | "offer.publish" | "offer.pause" }
    >;
    const o = next.offers.find((x) => x.id === c.id);
    assertRule(o, "OFFER_NOT_FOUND");
    assertRule(o.version === c.version, "VERSION_CONFLICT");
    if (c.op === "offer.approve") {
      assertRule(
        actor.role === "reviewer" &&
          actor.tenant === o.tenant &&
          actor.id !== o.submittedBy,
        "INDEPENDENT_REVIEW_REQUIRED",
      );
      assertRule(o.status === "IN_REVIEW", "INVALID_TRANSITION");
      o.status = "APPROVED";
      o.reviewedBy = actor.id;
    } else {
      partner(o.tenant);
      if (c.op === "offer.submit") {
        assertRule(o.status === "DRAFT", "INVALID_TRANSITION");
        o.status = "IN_REVIEW";
      }
      if (c.op === "offer.publish") {
        assertRule(
          ["APPROVED", "PAUSED"].includes(o.status) && o.reviewedBy,
          "APPROVAL_REQUIRED",
        );
        o.status = "PUBLISHED";
      }
      if (c.op === "offer.pause") {
        assertRule(o.status === "PUBLISHED", "INVALID_TRANSITION");
        o.status = "PAUSED";
      }
    }
    o.version++;
    entityId = o.id;
  } else if (command.op === "request.create") {
    assertRule(actor.role === "athlete", "FORBIDDEN");
    assertRule(actor.adult, "GUARDIAN_POLICY_REQUIRED");
    assertRule(
      !next.requests.some((r) => r.id === command.id),
      "DUPLICATE_REQUEST",
    );
    const o = next.offers.find((x) => x.id === command.offerId);
    assertRule(
      o && o.status === "PUBLISHED" && o.reviewedBy,
      "OFFER_UNAVAILABLE",
    );
    assertRule(o.version === command.offerVersion, "VERSION_CONFLICT");
    assertRule(!o.startsAt || o.startsAt > now, "PAST_SLOT");
    assertRule(o.remaining >= command.quantity, "CAPACITY_EXCEEDED");
    assertRule(
      o.kind === "PRODUCT" || command.quantity === 1,
      "SINGLE_PARTICIPANT_ONLY",
    );
    assertRule(
      !next.requests.some(
        (r) => r.athleteId === actor.id && r.offerId === o.id && active(r),
      ),
      "DUPLICATE_ACTIVE_REQUEST",
    );
    o.remaining -= command.quantity;
    const deadline = new Date(Date.parse(now) + 15 * 60000).toISOString();
    next.requests.push({
      id: command.id,
      tenant: o.tenant,
      athleteId: actor.id,
      offerId: o.id,
      title: o.title,
      kind: o.kind,
      priceMinor: o.priceMinor * command.quantity,
      quantity: command.quantity,
      offerVersion: o.version,
      status: "REQUESTED",
      version: 1,
      createdAt: now,
      expiresAt: o.startsAt && o.startsAt < deadline ? o.startsAt : deadline,
      consentVersion: "request-v1",
      entitlement: null,
      rating: null,
      paymentCaptured: false,
      pointsDebited: 0,
    });
    entityId = command.id;
  } else {
    const c = command as Extract<
      ServiceCommand,
      { id: string; version: number }
    >;
    const r = next.requests.find((x) => x.id === c.id);
    assertRule(r, "REQUEST_NOT_FOUND");
    const owner = actor.role === "athlete" && actor.id === r.athleteId;
    if (c.op === "request.cancel" || c.op === "request.rate")
      assertRule(owner, "FORBIDDEN");
    else partner(r.tenant);
    assertRule(
      r.version === c.version,
      r.status === "EXPIRED" ? "REQUEST_EXPIRED" : "VERSION_CONFLICT",
    );
    const o = next.offers.find((x) => x.id === r.offerId)!;
    if (c.op === "request.cancel" || c.op === "request.reject") {
      assertRule(active(r), "INVALID_TRANSITION");
      // Accepted timed bookings cannot be self-cancelled once the slot begins.
      assertRule(
        c.op !== "request.cancel" ||
          r.status !== "ACCEPTED" ||
          !o.startsAt ||
          o.startsAt > now,
        "CANCELLATION_CLOSED",
      );
      r.status = c.op === "request.cancel" ? "CANCELLED" : "REJECTED";
      o.remaining += r.quantity;
    } else if (c.op === "request.accept") {
      assertRule(r.status === "REQUESTED", "INVALID_TRANSITION");
      assertRule(!o.startsAt || o.startsAt > now, "PAST_SLOT");
      r.status = "ACCEPTED";
    } else if (c.op === "request.complete") {
      assertRule(r.status === "ACCEPTED", "INVALID_TRANSITION");
      // Provider settlement and issuance are intentionally not implemented here.
      assertRule(
        next.mode === "sandbox" ||
          (r.priceMinor === 0 &&
            !["PRODUCT", "COUPON", "SUBSCRIPTION"].includes(r.kind)),
        "PROVIDER_REQUIRED",
      );
      assertRule(
        !o.startsAt || o.startsAt <= now || next.mode === "sandbox",
        "SERVICE_NOT_STARTED",
      );
      r.status = "COMPLETED";
      if (["COUPON", "SUBSCRIPTION"].includes(r.kind))
        r.entitlement = {
          status: "SIMULATED_ACTIVE",
          expiresAt: new Date(
            Date.parse(now) + o.durationDays * 86400000,
          ).toISOString(),
        };
    } else if (c.op === "request.redeem") {
      assertRule(next.mode === "sandbox", "PROVIDER_REQUIRED");
      assertRule(
        r.kind === "COUPON" &&
          r.status === "COMPLETED" &&
          r.entitlement?.status === "SIMULATED_ACTIVE",
        "NOT_REDEEMABLE",
      );
      assertRule(r.entitlement.expiresAt > now, "ENTITLEMENT_EXPIRED");
      r.entitlement.status = "SIMULATED_USED";
    } else if (c.op === "request.rate") {
      assertRule(
        r.status === "COMPLETED" && r.rating === null,
        "RATING_NOT_ALLOWED",
      );
      r.rating = c.rating;
    }
    r.version++;
    entityId = r.id;
  }
  next.revision++;
  next.receipts[receipt] = fingerprint;
  next.audit.push({
    actorId: actor.id,
    op: command.op,
    entityId,
    at: now,
    revision: next.revision,
  });
  return next;
}
/** Return only fields needed by this actor; never expose receipts or private staff audit. */
export function serviceView(state: ServiceState, actor: Actor, now: string) {
  const copy = structuredClone(state);
  expire(copy, now);
  const staff = actor.role !== "athlete";
  return {
    mode: copy.mode,
    revision: copy.revision,
    offers: copy.offers
      .filter((o) =>
        staff ? o.tenant === actor.tenant : o.status === "PUBLISHED",
      )
      .map(({ submittedBy: _s, reviewedBy: _r, ...o }) => o),
    requests: copy.requests.filter((r) =>
      staff ? r.tenant === actor.tenant : r.athleteId === actor.id,
    ),
    audit: copy.audit
      .filter((a) =>
        staff
          ? copy.offers.some(
              (o) => o.tenant === actor.tenant && o.id === a.entityId,
            ) ||
            copy.requests.some(
              (r) => r.tenant === actor.tenant && r.id === a.entityId,
            )
          : copy.requests.some(
              (r) => r.athleteId === actor.id && r.id === a.entityId,
            ),
      )
      .map(({ actorId: _a, ...event }) => event),
  };
}
export type ServiceView = ReturnType<typeof serviceView>;
