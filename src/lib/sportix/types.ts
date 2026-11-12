import type { EligibilityState, StarTierId } from "./stars";

export type TabId = "feed" | "achievements" | "matches" | "discover" | "people";

export type FriendshipState = "none" | "requested" | "incoming" | "friends";

export type VerificationState =
  "verified" | "pending" | "insufficient" | "unverified";

export type PostKind = "activity" | "social" | "match" | "achievement";

export type Sport = "Football" | "Running" | "Gym" | "Swimming" | "Tennis";

export type MessageEligibility = "enabled" | "friends_only" | "restricted";

export type GroupType = "normal" | "match" | "team" | "training" | "challenge";

export type MatchState = "upcoming" | "live" | "completed";

export interface Metric {
  label: string;
  value: string;
}

export interface PerformanceCardData {
  sportLabel: string;
  headline: string;
  metrics: Metric[];
  spAi?: number;
  weeklyRank?: number;
  zone?: string;
  deepMetrics?: Metric[];
  splits?: { label: string; value: string }[];
}

export interface AchievementAttachment {
  title: string;
  badgeLabel: string;
  date: string;
  spAi?: number;
  sspAi?: number;
  weeklyRank?: number;
}

export interface MatchAttachment {
  matchId: string;
  title: string;
  home: string;
  away: string;
  score?: string;
  venue: string;
  when: string;
  state: MatchState;
  highlights?: string[];
}

export interface SponsorState {
  topSponsorId: string | null;
  extraCount: number;
  topSponsorTier?: StarTierId | null;
  sponsorMomentum?: number;
  visibilityEligibility?: EligibilityState;
  sponsorCount?: number;
}

export interface EngagementSummary {
  likeCount: number;
  commentCount: number;
  repostCount: number;
  likedBy: string[];
}

export interface CommunityPost {
  athleteProjection?: {
    activityId: string;
    consentVersion: number;
    audience: "FRIENDS" | "PUBLIC";
  };
  id: string;
  authorId: string;
  kind: PostKind;
  createdAt: string;
  context: string;
  media: { src: string; alt: string };
  caption: string;
  verification: VerificationState;
  performance?: PerformanceCardData;
  achievement?: AchievementAttachment;
  match?: MatchAttachment;
  engagement: EngagementSummary;
  sponsor: SponsorState;
  liked: boolean;
  saved: boolean;
  reposted: boolean;
  goEvidence?: {
    sessionId: string;
    subjectType: "SELF" | "PLACE";
    quality: "HIGH" | "LIMITED";
    sportIdUpdated: boolean;
    gps: boolean;
    route: boolean;
    time: boolean;
    health: boolean;
    media: boolean;
  };
}

export interface SportixUser {
  id: string;
  displayName: string;
  sport: Sport;
  city: string;
  zone: string;
  avatar: string | null;
  verified: boolean;
  isOrg?: boolean;
  ageRestricted?: boolean;
  bio: string;
  spAi: number;
  sspAi: number;
  achievementCount: number;
  weeklyRank: number | null;
  zoneRank: number | null;
  friendCount: number;
  mutualCount: number;
  athleteSponsorId: string | null;
  athleteSponsorExtra: number;
  messagePolicy: MessageEligibility;
}

export interface CommentItem {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: string;
  likes: number;
  liked: boolean;
}

export interface SportMatch {
  id: string;
  sport: Sport;
  title: string;
  when: string;
  venue: string;
  state: MatchState;
  home: string;
  away: string;
  score?: string;
  participantIds: string[];
  acceptedIds: string[];
  verifiedResult: boolean;
  highlights: string[];
  relatedPostIds: string[];
  media: string;
  details: string;
  matchGroupId: string | null;
}

export interface Thread {
  id: string;
  kind: "dm" | "group";
  groupType?: GroupType;
  title: string;
  memberIds: string[];
  lastMessage: string;
  lastAt: string;
  unread: number;
  matchId?: string;
  avatar?: string | null;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  authorId: string;
  text: string;
  at: string;
}

export type Screen =
  | { type: "profile"; userId: string }
  | { type: "sport-id"; userId: string }
  | { type: "messages" }
  | { type: "chat"; threadId: string }
  | { type: "match"; matchId: string }
  | { type: "performance"; postId: string }
  | { type: "group-create"; matchId?: string }
  | { type: "sponsor-history"; postId?: string; userId?: string }
  | { type: "creator-earnings"; userId: string }
  | { type: "post"; postId: string };

export type Sheet =
  | { type: "comments"; postId: string }
  | { type: "sponsor"; postId: string }
  | { type: "athlete-sponsor"; userId: string }
  | { type: "repost"; postId: string }
  | { type: "repost-comment"; postId: string }
  | { type: "overflow"; postId?: string; userId: string }
  | { type: "report-comment"; commentId: string };
