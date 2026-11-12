import { z } from "zod";

/** Internal, opaque identifier. Never use email, telephone, national ID or QR text. */
export type SportixUserId = `spx_u_${string}` | `spx_test_${string}`;
export const syntheticUserId = z.string().regex(/^spx_test_[a-z0-9_]{1,48}$/);
export const audienceSchema = z.enum(["PRIVATE", "FRIENDS", "PUBLIC"]);
export type ShareAudience = z.infer<typeof audienceSchema>;
export type Provenance = "SYNTHETIC_LOCAL";
export const activityKinds = z.enum([
  "running",
  "walking",
  "hiking",
  "cycling",
]);
const entityId = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
const version = z.number().int().positive();
const amount = z.number().finite().nonnegative();
export const metricsSchema = z
  .object({
    durationSec: amount.max(86400),
    distanceKm: amount.max(1000),
    steps: amount.int().max(200000),
  })
  .strict();
export const commandSchema = z.discriminatedUnion("op", [
  z
    .object({
      op: z.literal("activity.create"),
      id: entityId,
      kind: activityKinds,
    })
    .strict(),
  z
    .object({
      op: z.literal("activity.submit"),
      id: entityId,
      version,
      metrics: metricsSchema,
      evidenceRef: z.string().regex(/^synthetic-evidence-[a-zA-Z0-9_-]+$/),
    })
    .strict(),
  z
    .object({
      op: z.literal("activity.simulate"),
      id: entityId,
      version,
      outcome: z.enum(["pass", "review", "insufficient"]),
    })
    .strict(),
  z
    .object({
      op: z.literal("consent.set"),
      id: entityId,
      version,
      audience: audienceSchema,
      shareMetrics: z.boolean(),
    })
    .strict(),
]);
export type AthleteCommand = z.infer<typeof commandSchema>;
export type ActivityStatus =
  | "CREATED"
  | "SUBMITTED"
  | "SIMULATED_COMPLETED"
  | "REVIEW_REQUIRED"
  | "INSUFFICIENT_EVIDENCE";
export interface Identity {
  schemaVersion: "sportix.identity.v1";
  sportixUserId: SportixUserId;
  publicProfileId: string;
  provenance: Provenance;
  isMinor: boolean;
}
export interface Consent {
  version: number;
  audience: ShareAudience;
  shareMetrics: boolean;
  policyVersion: "athlete-sharing-v1";
  updatedAt: string;
}
export interface Activity {
  id: string;
  sportixUserId: SportixUserId;
  kind: z.infer<typeof activityKinds>;
  version: number;
  status: ActivityStatus;
  metrics?: z.infer<typeof metricsSchema>;
  evidenceRef?: string;
  consent: Consent;
  provenance: Provenance;
}
export interface SportIdEntry {
  id: string;
  activityId: string;
  sportixUserId: SportixUserId;
  kind: Activity["kind"];
  status: ActivityStatus;
  metrics: z.infer<typeof metricsSchema>;
  provenance: Provenance;
  verified: false;
  rewardsGranted: 0;
}
export interface CommunityProjection {
  id: string;
  activityId: string;
  publicProfileId: string;
  kind: Activity["kind"];
  audience: Exclude<ShareAudience, "PRIVATE">;
  consentVersion: number;
  provenance: Provenance;
  verified: false;
  metrics?: z.infer<typeof metricsSchema>;
}
export interface AthleteState {
  identity: Identity;
  activities: Activity[];
  sportId: SportIdEntry[];
  posts: CommunityProjection[];
  revision: number;
  audit: {
    op: AthleteCommand["op"];
    activityId: string;
    at: string;
    revision: number;
  }[];
  processed: Record<string, string>;
}
export class AthleteRuleError extends Error {}
export function ensure(value: unknown, code: string): asserts value {
  if (!value) throw new AthleteRuleError(code);
}

/** Proposed API response shape only. Validation does NOT authenticate an issuer/session. */
export const operationalIdentitySchema = z
  .object({
    schemaVersion: z.literal("sportix.identity.v1"),
    sportixUserId: z
      .string()
      .regex(
        /^spx_u_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      ),
    publicProfileId: z.string().uuid(),
    provenance: z.literal("SERVER_AUTHENTICATED"),
    accountState: z.enum(["ACTIVE", "SUSPENDED", "DELETION_PENDING"]),
  })
  .strict();
