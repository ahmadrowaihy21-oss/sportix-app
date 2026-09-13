export type WeeklySport = "football" | "padel" | "running" | "walking" | "hiking" | "gym";

export type RankingContext = "global" | "country" | "zone" | "sport";

export type ClosePhase =
  | "ACTIVE"
  | "CLOSING"
  | "RANK_FREEZE"
  | "ELIGIBILITY_CHECK"
  | "ANTI_CHEAT"
  | "WINNERS_CONFIRMED"
  | "REWARDS"
  | "SPORT_ID_RECORD"
  | "NEW_WEEK";

export type EligibilityState = "eligible" | "review" | "excluded";

export type WeeklyScreen =
  | "home"
  | "ranking"
  | "most-active"
  | "streak"
  | "featured"
  | "hero"
  | "potw"
  | "improvement"
  | "best-play"
  | "legend-unlock"
  | "week-close"
  | "winner"
  | "reward"
  | "athlete"
  | "story";

export interface WeeklyRankingEntry {
  userId: string;
  name: string;
  sport: WeeklySport;
  sportLabel: string;
  zone: string;
  country: string;
  ssp: number;
  activities: number;
  streak: number;
  avatar: string | null;
  eligibility: EligibilityState;
  excludedSessions: number;
  isViewer?: boolean;
}

export interface SportIDWeeklyAchievement {
  id: string;
  week: number;
  title: string;
  context: string;
  rank: number;
  ssp: number;
  sportLabel: string;
  dateLabel: string;
}

export interface WeeklyRewardEntitlement {
  id: string;
  title: string;
  partner: string;
  note: string;
  claimed: boolean;
}

export interface RankMove {
  from: number;
  to: number;
  sspFrom: number;
  sspTo: number;
}
