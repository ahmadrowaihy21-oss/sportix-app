export type ActivityKey = "running" | "walking" | "hiking" | "cycling";

export type GoScreen =
  | "home"
  | "select"
  | "preflight"
  | "live"
  | "media"
  | "verify"
  | "success"
  | "post"
  | "gym"
  | "find-game"
  | "create-game"
  | "settings";

export type SessionState =
  | "CREATED"
  | "ACTIVE"
  | "PAUSED"
  | "MEDIA_REQUIRED"
  | "MEDIA_ATTACHED"
  | "VERIFYING"
  | "VERIFIED_COMPLETED"
  | "REVIEW_REQUIRED"
  | "INSUFFICIENT_EVIDENCE"
  | "REJECTED"
  | "INCOMPLETE";

export type MediaSubject = "SELF" | "PLACE";

export type Audience = "PUBLIC" | "FRIENDS" | "ONLY ME";

export type DemoOutcome = "verified" | "insufficient" | "review";

export interface MediaEvidence {
  media_evidence_id: string;
  session_id: string;
  user_id: string;
  media_type: "photo" | "video";
  subject_type: MediaSubject;
  capture_or_attach_time: string;
  session_binding: true;
  device_ref: "prototype-device";
  privacy_state: "session-bound";
  verification_state: "attached" | "accepted" | "rejected";
  evidence_ref: string;
  url: string;
  fileName: string;
}

export interface ActivitySession {
  id: string;
  activity: ActivityKey;
  state: SessionState;
  startedAt: number;
  elapsedSec: number;
  distanceKm: number;
  steps: number;
  elevationM: number;
  speedKmh: number;
  gpsQuality: "HIGH" | "MEDIUM" | "LOW";
  media: MediaEvidence | null;
  postId: string | null;
  sportIdRecordId: string | null;
  outcome: DemoOutcome | null;
}

export interface ActivityConfig {
  key: ActivityKey;
  label: string;
  liveLabel: string;
  startCta: string;
  sportLabel: string;
  mediaRequired: true;
  verificationReady: boolean;
  paceSecPerKm: number;
  stepsPerKm: number;
  elevationPerKm: number;
  speedKmh: number;
}

export interface VerifyCheck {
  id: string;
  label: string;
  done: boolean;
  ok: boolean;
}

export interface VerifiedActivityRecord {
  id: string;
  sessionId: string;
  postId: string;
  activity: ActivityKey;
  distanceKm: number;
  durationSec: number;
  paceLabel: string;
  steps: number;
  mediaUrl: string;
  subjectType: MediaSubject;
  dateLabel: string;
  quality: "HIGH";
}
