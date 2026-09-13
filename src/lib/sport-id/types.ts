export type SportKey = "football" | "padel" | "running" | "walking" | "cycling";

export type SportRecordState =
  | "verified"
  | "building"
  | "pilot"
  | "interest"
  | "pending-profile";

export type VerificationState =
  | "verified"
  | "pending-review"
  | "insufficient"
  | "re-test"
  | "abstained"
  | "pilot";

export type EvidenceQuality = "high" | "medium" | "limited";

export type ViewMode = "owner" | "public" | "professional";

export interface EvidenceSource {
  id: string;
  label: string;
  quality: EvidenceQuality;
  className: "vision" | "foot-sensor" | "body-sensor" | "gnss" | "watch" | "gps" | "uwb";
}

export interface EvidenceEnvelope {
  quality: EvidenceQuality;
  coveragePct: number;
  confidencePct: number;
  humanReview: "completed" | "pending" | "not-required";
  lastUpdated: string;
  modelVersion: string;
  sessionsUsed: number;
  latestSession: string;
  sources: EvidenceSource[];
  limitations: string[];
  state: VerificationState;
}

export interface SkillMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend90?: number;
  evidence: EvidenceEnvelope;
  public: boolean;
  professional: boolean;
}

export interface DimensionScore {
  id: string;
  label: string;
  value: number;
}

export interface SportRecord {
  key: SportKey;
  label: string;
  state: SportRecordState;
  hero: string;
  summary: string;
  sessionsLabel: string;
  sessionsValue: string;
  lastVerified?: string;
  dimensions: DimensionScore[];
  skills: SkillMetric[];
  extra: Record<string, string>;
}

export interface VisionReport {
  sport: SportKey;
  happened: { label: string; value: string }[];
  why: string;
  next: string;
}

export interface DevelopmentPoint {
  label: string;
  from: number;
  to: number;
}

export interface AchievementRecord {
  id: string;
  title: string;
  sport: SportKey;
  date: string;
  event: string;
  state: VerificationState;
  evidenceRef: string;
  relatedSession?: string;
  relatedPostId?: string;
}

export interface JourneyEvent {
  id: string;
  date: string;
  title: string;
  sport: SportKey;
  state: VerificationState | "pending-profile";
}

export interface SessionRecord {
  id: string;
  sport: SportKey;
  title: string;
  date: string;
  metrics: { label: string; value: string }[];
  evidence: EvidenceEnvelope;
  routeNote?: string;
}

export type SportIdScreen =
  | { type: "metric"; sport: SportKey; metricId: string }
  | { type: "vision"; sport: SportKey }
  | { type: "development"; sport: SportKey }
  | { type: "achievement"; id: string }
  | { type: "history" }
  | { type: "session"; id: string }
  | { type: "sensors" }
  | { type: "add-sport" }
  | { type: "privacy" }
  | { type: "devices" }
  | { type: "connections" }
  | { type: "edit-profile" }
  | { type: "settings" }
  | { type: "journey" }
  | { type: "weekly-legend" };
