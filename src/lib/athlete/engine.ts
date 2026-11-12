import { commandSchema, ensure, syntheticUserId } from "./contracts.ts";
import type {
  AthleteState,
  SportixUserId,
  CommunityProjection,
} from "./contracts.ts";

/** An in-memory test harness. This is not an authentication or authorization service. */
export function createSyntheticAthlete(
  id = "spx_test_athlete_001",
  isMinor = false,
): AthleteState {
  syntheticUserId.parse(id);
  return {
    identity: {
      schemaVersion: "sportix.identity.v1",
      sportixUserId: id as SportixUserId,
      publicProfileId: `profile_${id}`,
      provenance: "SYNTHETIC_LOCAL",
      isMinor,
    },
    activities: [],
    sportId: [],
    posts: [],
    revision: 0,
    audit: [],
    processed: {},
  };
}

/** Validates before cloning; all changes/projections/replay receipts commit together locally. */
export function executeAthlete(
  original: AthleteState,
  actor: string,
  key: string,
  raw: unknown,
  now: string,
): AthleteState {
  ensure(original.identity.provenance === "SYNTHETIC_LOCAL", "SYNTHETIC_ONLY");
  syntheticUserId.parse(actor);
  ensure(actor === original.identity.sportixUserId, "OWNER_MISMATCH");
  ensure(/^[A-Za-z0-9_-]{8,100}$/.test(key), "INVALID_IDEMPOTENCY_KEY");
  ensure(Number.isFinite(Date.parse(now)), "INVALID_TIME");
  const cmd = commandSchema.parse(raw);
  const fingerprint = JSON.stringify(cmd);
  const receiptKey = `receipt:${key}`;
  if (Object.hasOwn(original.processed, receiptKey)) {
    ensure(
      original.processed[receiptKey] === fingerprint,
      "IDEMPOTENCY_CONFLICT",
    );
    return original;
  }
  const next = structuredClone(original);
  if (cmd.op === "activity.create") {
    ensure(!next.activities.some((a) => a.id === cmd.id), "DUPLICATE_ACTIVITY");
    next.activities.push({
      id: cmd.id,
      sportixUserId: next.identity.sportixUserId,
      kind: cmd.kind,
      version: 1,
      status: "CREATED",
      provenance: "SYNTHETIC_LOCAL",
      consent: {
        version: 1,
        audience: "PRIVATE",
        shareMetrics: false,
        policyVersion: "athlete-sharing-v1",
        updatedAt: now,
      },
    });
  } else {
    const activity = next.activities.find((a) => a.id === cmd.id);
    ensure(activity, "ACTIVITY_NOT_FOUND");
    ensure(activity.sportixUserId === actor, "OWNER_MISMATCH");
    ensure(activity.version === cmd.version, "VERSION_CONFLICT");
    if (cmd.op === "activity.submit") {
      ensure(
        ["CREATED", "INSUFFICIENT_EVIDENCE"].includes(activity.status),
        "INVALID_TRANSITION",
      );
      ensure(
        cmd.metrics.durationSec > 0 && cmd.metrics.distanceKm > 0,
        "EMPTY_ACTIVITY",
      );
      activity.metrics = cmd.metrics;
      activity.evidenceRef = cmd.evidenceRef;
      activity.status = "SUBMITTED";
    } else if (cmd.op === "activity.simulate") {
      ensure(
        activity.status === "SUBMITTED" && activity.evidenceRef,
        "INVALID_TRANSITION",
      );
      activity.status =
        cmd.outcome === "insufficient"
          ? "INSUFFICIENT_EVIDENCE"
          : cmd.outcome === "review" || activity.kind === "cycling"
            ? "REVIEW_REQUIRED"
            : "SIMULATED_COMPLETED";
    } else {
      ensure(
        !next.identity.isMinor || cmd.audience === "PRIVATE",
        "GUARDIAN_POLICY_REQUIRED",
      );
      activity.consent = {
        audience: cmd.audience,
        shareMetrics: cmd.shareMetrics,
        version: activity.consent.version + 1,
        policyVersion: "athlete-sharing-v1",
        updatedAt: now,
      };
    }
    activity.version++;
    // One private SPORT ID entry per activity; never affects verified totals or points.
    next.sportId = next.sportId.filter((x) => x.activityId !== activity.id);
    if (activity.metrics)
      next.sportId.push({
        id: `sid-${activity.id}`,
        activityId: activity.id,
        sportixUserId: activity.sportixUserId,
        kind: activity.kind,
        status: activity.status,
        metrics: structuredClone(activity.metrics),
        provenance: "SYNTHETIC_LOCAL",
        verified: false,
        rewardsGranted: 0,
      });
    // Rebuild from latest consent; revocation removes rather than leaving a stale public copy.
    next.posts = next.posts.filter((p) => p.activityId !== activity.id);
    if (
      activity.status === "SIMULATED_COMPLETED" &&
      activity.consent.audience !== "PRIVATE"
    ) {
      next.posts.push({
        id: `post-go-${activity.id}`,
        activityId: activity.id,
        publicProfileId: next.identity.publicProfileId,
        kind: activity.kind,
        audience: activity.consent.audience,
        consentVersion: activity.consent.version,
        provenance: "SYNTHETIC_LOCAL",
        verified: false,
        ...(activity.consent.shareMetrics
          ? { metrics: structuredClone(activity.metrics!) }
          : {}),
      });
    }
  }
  next.revision++;
  next.processed[receiptKey] = fingerprint;
  next.audit.push({
    op: cmd.op,
    activityId: cmd.id,
    at: now,
    revision: next.revision,
  });
  return next;
}

/** relationship must be resolved by the server in production, never accepted from a request. */
export function visibleSyntheticPosts(
  state: AthleteState,
  viewer: string | null,
  friends: readonly string[] = [],
): CommunityProjection[] {
  return structuredClone(
    state.posts.filter(
      (p) =>
        p.audience === "PUBLIC" ||
        viewer === state.identity.sportixUserId ||
        (viewer !== null && friends.includes(viewer)),
    ),
  );
}

/** Explicitly no production fallback and no switch that upgrades a simulation to verified. */
export function requireOperationalBackend(): never {
  throw new Error("OPERATIONAL_BACKEND_REQUIRED");
}
