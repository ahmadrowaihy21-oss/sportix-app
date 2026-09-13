import { create } from "zustand";
import { VIEWER_ID } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import type { CommunityPost } from "@/lib/sportix/types";
import { useSportId } from "@/lib/sport-id/store";
import {
  GO_SSP_DELTA,
  rankList,
  RULE_VERSION,
  seedEndsInMs,
  VIEWER_BASE_ACTIVITIES,
  VIEWER_BASE_SSP,
  VIEWER_BASE_STREAK,
  WEEK_NUMBER,
  weeklyAthletes,
} from "./mock";
import type {
  ClosePhase,
  RankMove,
  RankingContext,
  SportIDWeeklyAchievement,
  WeeklyRankingEntry,
  WeeklyRewardEntitlement,
  WeeklyScreen,
  WeeklySport,
} from "./types";

function cloneAthletes(): WeeklyRankingEntry[] {
  return weeklyAthletes.map((e) => ({ ...e }));
}

function withViewer(
  athletes: WeeklyRankingEntry[],
  ssp: number,
  activities: number,
  streak: number,
): WeeklyRankingEntry[] {
  return athletes.map((e) =>
    e.userId === VIEWER_ID || e.isViewer ? { ...e, ssp, activities, streak, isViewer: true } : e,
  );
}

export interface WeeklyStore {
  week: number;
  endsAt: number;
  screen: WeeklyScreen;
  context: RankingContext;
  sportFilter: WeeklySport | "all";
  ssp: number;
  activities: number;
  streak: number;
  athletes: WeeklyRankingEntry[];
  appliedSessions: string[];
  lastMove: RankMove | null;
  closePhase: ClosePhase;
  closeStep: number;
  history: SportIDWeeklyAchievement[];
  reward: WeeklyRewardEntitlement;
  selectedAthleteId: string | null;
  enteredFromWeekly: boolean;
  whyRankOpen: boolean;
  whySelectedOpen: boolean;
  goHome: () => void;
  open: (screen: WeeklyScreen, athleteId?: string) => void;
  setContext: (c: RankingContext) => void;
  setSportFilter: (s: WeeklySport | "all") => void;
  setWhyRank: (open: boolean) => void;
  setWhySelected: (open: boolean) => void;
  markEntered: () => void;
  applyVerifiedActivity: (input: { sessionId: string; activity: string }) => RankMove | null;
  revertGoSessions: () => void;
  startWeekClose: () => void;
  advanceClose: () => void;
  claimReward: () => void;
  startNewWeek: () => void;
  resetDemo: () => void;
}

function ranked(s: Pick<WeeklyStore, "athletes" | "ssp" | "activities" | "streak">) {
  return rankList(withViewer(s.athletes, s.ssp, s.activities, s.streak));
}

function publishLegendPost(week: number, winner: ReturnType<typeof rankList>[number]) {
  const post: CommunityPost = {
    id: `post-wl-${week}-${winner.userId}`,
    authorId: winner.userId === VIEWER_ID ? VIEWER_ID : winner.userId in { faisal: 1, ahmed: 1, sara: 1, abdullah: 1, layla: 1, nora: 1 } ? winner.userId : VIEWER_ID,
    kind: "achievement",
    createdAt: "now",
    context: `WEEKLY LEGEND · WEEK ${week}`,
    media: { src: "/media/achievement-finish.jpg", alt: "Weekly Legend" },
    caption: `WEEKLY LEGEND · #1 ${winner.zone.toUpperCase()} — ${winner.sportLabel.toUpperCase()} · ${winner.ssp.toLocaleString()} SSP AI · Week ${week}`,
    verification: "verified",
    achievement: {
      title: "WEEKLY LEGEND",
      badgeLabel: `#1 ${winner.zone} · Week ${week}`,
      date: `Week ${week}`,
      sspAi: winner.ssp,
    },
    engagement: { likeCount: 0, commentCount: 0, repostCount: 0, likedBy: [] },
    sponsor: { topSponsorId: null, extraCount: 0 },
    liked: false,
    saved: false,
    reposted: false,
  };
  if (useSportix.getState().posts.some((p) => p.id === post.id)) return;
  useSportix.getState().publishGoPost(post);
}

const CLOSE_ORDER: ClosePhase[] = [
  "CLOSING",
  "RANK_FREEZE",
  "ELIGIBILITY_CHECK",
  "ANTI_CHEAT",
  "WINNERS_CONFIRMED",
  "REWARDS",
  "SPORT_ID_RECORD",
];

export const useWeekly = create<WeeklyStore>((set, get) => ({
  week: WEEK_NUMBER,
  endsAt: Date.now() + seedEndsInMs,
  screen: "home",
  context: "global",
  sportFilter: "all",
  ssp: VIEWER_BASE_SSP,
  activities: VIEWER_BASE_ACTIVITIES,
  streak: VIEWER_BASE_STREAK,
  athletes: cloneAthletes(),
  appliedSessions: [],
  lastMove: null,
  closePhase: "ACTIVE",
  closeStep: 0,
  history: [],
  reward: {
    id: "rw-w37",
    title: "NIKE RUNNING VOUCHER",
    partner: "Verified SPORTIX Partner",
    note: "Partners provide rewards. They do not issue SSP, change rank, or select winners.",
    claimed: false,
  },
  selectedAthleteId: null,
  enteredFromWeekly: false,
  whyRankOpen: false,
  whySelectedOpen: false,

  goHome: () => set({ screen: "home", selectedAthleteId: null }),
  open: (screen, athleteId) => set({ screen, selectedAthleteId: athleteId ?? get().selectedAthleteId }),
  setContext: (context) => set({ context, screen: "ranking" }),
  setSportFilter: (sportFilter) => set({ sportFilter, screen: "ranking" }),
  setWhyRank: (whyRankOpen) => set({ whyRankOpen }),
  setWhySelected: (whySelectedOpen) => set({ whySelectedOpen }),
  markEntered: () => set({ enteredFromWeekly: true }),

  applyVerifiedActivity: ({ sessionId }) => {
    const s = get();
    if (s.closePhase !== "ACTIVE") return null;
    if (s.appliedSessions.includes(sessionId)) return null;
    const before = ranked(s);
    const meBefore = before.find((e) => e.isViewer);
    const ssp = s.ssp + GO_SSP_DELTA;
    const activities = s.activities + 1;
    const streak = s.streak + 1;
    const after = ranked({ athletes: s.athletes, ssp, activities, streak });
    const meAfter = after.find((e) => e.isViewer);
    const move: RankMove = {
      from: meBefore?.rank ?? 18,
      to: meAfter?.rank ?? 16,
      sspFrom: s.ssp,
      sspTo: ssp,
    };
    set({
      ssp,
      activities,
      streak,
      appliedSessions: [...s.appliedSessions, sessionId],
      lastMove: move,
    });
    return move;
  },

  revertGoSessions: () => {
    set({
      ssp: VIEWER_BASE_SSP,
      activities: VIEWER_BASE_ACTIVITIES,
      streak: VIEWER_BASE_STREAK,
      appliedSessions: [],
      lastMove: null,
    });
  },

  startWeekClose: () => set({ screen: "week-close", closePhase: "CLOSING", closeStep: 0 }),

  advanceClose: () => {
    const { closeStep, week, ssp, athletes, activities, streak, history } = get();
    const next = closeStep + 1;
    const phase = CLOSE_ORDER[next] ?? "SPORT_ID_RECORD";
    if (next >= CLOSE_ORDER.length) {
      const board = ranked({ athletes, ssp, activities, streak });
      const winner = board[0];
      const me = board.find((e) => e.isViewer);
      if (winner) publishLegendPost(week, winner);
      const record: SportIDWeeklyAchievement = {
        id: `wl-${week}`,
        week,
        title: `#${me?.rank ?? "—"} Weekly Legends`,
        context: "GLOBAL",
        rank: me?.rank ?? 0,
        ssp,
        sportLabel: "Multi-sport SSP",
        dateLabel: `Week ${week}`,
      };
      if (!history.some((h) => h.id === record.id)) {
        useSportId.getState().recordWeeklyLegacy(record);
      }
      set({
        closePhase: "WINNERS_CONFIRMED",
        closeStep: next,
        screen: "winner",
        history: history.some((h) => h.id === record.id) ? history : [record, ...history],
      });
      return;
    }
    set({ closePhase: phase, closeStep: next });
  },

  claimReward: () => {
    set((s) => ({
      reward: { ...s.reward, claimed: true },
      screen: "reward",
    }));
  },

  startNewWeek: () => {
    const nextWeek = get().week + 1;
    set({
      week: nextWeek,
      endsAt: Date.now() + seedEndsInMs,
      ssp: 0,
      activities: 0,
      appliedSessions: [],
      lastMove: null,
      closePhase: "NEW_WEEK",
      closeStep: 0,
      screen: "home",
      reward: {
        id: `rw-w${nextWeek}`,
        title: "Week prize · pending",
        partner: "Verified SPORTIX Partner",
        note: "New week. Historical Weekly Legend records stay on SPORT ID.",
        claimed: false,
      },
    });
  },

  resetDemo: () => {
    useSportix.getState().removeWeeklyPosts();
    useSportId.getState().resetWeeklyLegacy();
    set({
      week: WEEK_NUMBER,
      endsAt: Date.now() + seedEndsInMs,
      screen: "home",
      context: "global",
      sportFilter: "all",
      ssp: VIEWER_BASE_SSP,
      activities: VIEWER_BASE_ACTIVITIES,
      streak: VIEWER_BASE_STREAK,
      athletes: cloneAthletes(),
      appliedSessions: [],
      lastMove: null,
      closePhase: "ACTIVE",
      closeStep: 0,
      history: [],
      reward: {
        id: "rw-w37",
        title: "NIKE RUNNING VOUCHER",
        partner: "Verified SPORTIX Partner",
        note: "Partners provide rewards. They do not issue SSP, change rank, or select winners.",
        claimed: false,
      },
      selectedAthleteId: null,
      enteredFromWeekly: false,
      whyRankOpen: false,
      whySelectedOpen: false,
    });
  },
}));

export function useWeeklyBoard() {
  const athletes = useWeekly((s) => s.athletes);
  const ssp = useWeekly((s) => s.ssp);
  const activities = useWeekly((s) => s.activities);
  const streak = useWeekly((s) => s.streak);
  const context = useWeekly((s) => s.context);
  const sportFilter = useWeekly((s) => s.sportFilter);
  const all = rankList(withViewer(athletes, ssp, activities, streak));
  const filtered = (() => {
    let list = all;
    if (context === "country") list = list.filter((e) => e.country === "KSA");
    if (context === "zone") list = list.filter((e) => e.zone === "Jeddah");
    if (sportFilter !== "all") list = list.filter((e) => e.sport === sportFilter);
    if (context === "sport" && sportFilter === "all") list = list.filter((e) => e.sport === "football");
    return list.map((e, i) => ({ ...e, rank: i + 1 }));
  })();
  const meGlobal = all.find((e) => e.isViewer);
  const meCtx = filtered.find((e) => e.isViewer);
  const above = filtered.filter((e) => meCtx && e.rank < meCtx.rank);
  const next = above.length ? above[above.length - 1] : null;
  return { all, filtered, meGlobal, meCtx, next };
}
