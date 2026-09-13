import { create } from "zustand";
import { toast } from "sonner";
import type { VerifiedActivityRecord } from "@/lib/go-sportix/types";
import type { SportIDWeeklyAchievement } from "@/lib/weekly-legends/types";
import type { SessionRecord, SportIdScreen, SportKey, ViewMode } from "./types";

export interface AddedSport {
  id: string;
  label: string;
  intent: string;
  state: "interest";
}

export interface SportIdStore {
  selected: SportKey;
  view: ViewMode;
  stack: SportIdScreen[];
  added: AddedSport[];
  displayName: string;
  bio: string;
  cityPublic: boolean;
  metricsPublic: boolean;
  healthPublic: boolean;
  goRecords: VerifiedActivityRecord[];
  extraSessions: SessionRecord[];
  extraActivities: number;
  sspBonus: number;
  weeklyLegacy: SportIDWeeklyAchievement[];
  setSelected: (s: SportKey) => void;
  setView: (v: ViewMode) => void;
  push: (s: SportIdScreen) => void;
  pop: () => void;
  closeAll: () => void;
  addSport: (id: string, label: string, intent: string) => void;
  saveProfile: (name: string, bio: string) => void;
  setPrivacy: (p: Partial<Pick<SportIdStore, "cityPublic" | "metricsPublic" | "healthPublic">>) => void;
  recordVerifiedActivity: (record: VerifiedActivityRecord) => void;
  resetGoRecords: () => void;
  recordWeeklyLegacy: (record: SportIDWeeklyAchievement) => void;
  resetWeeklyLegacy: () => void;
}

function notify(message: string) {
  toast(message, { duration: 2200 });
}

function sportKeyOf(activity: VerifiedActivityRecord["activity"]): SportKey {
  if (activity === "hiking") return "walking";
  return activity;
}

export const useSportId = create<SportIdStore>((set) => ({
  selected: "football",
  view: "owner",
  stack: [],
  added: [],
  displayName: "Yousef N.",
  bio: "Developing footballer. Corniche mornings, 5-a-side nights.",
  cityPublic: true,
  metricsPublic: true,
  healthPublic: false,
  goRecords: [],
  extraSessions: [],
  extraActivities: 0,
  sspBonus: 0,
  weeklyLegacy: [],
  setSelected: (selected) => set({ selected }),
  setView: (view) => set({ view }),
  push: (screen) => set((s) => ({ stack: [...s.stack, screen] })),
  pop: () => set((s) => ({ stack: s.stack.slice(0, -1) })),
  closeAll: () => set({ stack: [] }),
  addSport: (id, label, intent) => {
    set((s) => {
      if (s.added.some((a) => a.id === id)) return s;
      return { added: [...s.added, { id, label, intent, state: "interest" }], stack: [] };
    });
    notify("Sport added as Interest only — not verified");
  },
  saveProfile: (displayName, bio) => {
    set({ displayName, bio, stack: [] });
    notify("Profile updated");
  },
  setPrivacy: (p) => set(p),
  recordVerifiedActivity: (record) => {
    const sport = sportKeyOf(record.activity);
    const session: SessionRecord = {
      id: record.sessionId,
      sport,
      title: `${record.distanceKm.toFixed(2)} KM ${record.activity}`,
      date: record.dateLabel,
      metrics: [
        { label: "Distance", value: `${record.distanceKm.toFixed(2)} KM` },
        { label: "Duration", value: record.paceLabel.includes("/") ? String(Math.floor(record.durationSec / 60)) + " min" : `${record.durationSec.toFixed(0)} s` },
        { label: "Pace", value: record.paceLabel },
        { label: "Media", value: record.subjectType },
      ],
      evidence: {
        quality: "high",
        coveragePct: 96,
        confidencePct: 94,
        humanReview: "not-required",
        lastUpdated: record.dateLabel,
        modelVersion: "go-sportix-2026.09",
        sessionsUsed: 1,
        latestSession: record.dateLabel,
        sources: [
          { id: "gps", label: "GPS", quality: "high", className: "gps" },
          { id: "watch", label: "Watch / Health", quality: "high", className: "watch" },
          { id: "media", label: "Media evidence", quality: "high", className: "gnss" },
        ],
        limitations: ["Prototype demonstration session. Media supports verification; it does not replace activity data."],
        state: "verified",
      },
      routeNote: "GO SPORTIX verified activity. Place or Self media accepted. Session bound.",
    };
    set((s) => ({
      goRecords: [record, ...s.goRecords.filter((r) => r.sessionId !== record.sessionId)],
      extraSessions: [session, ...s.extraSessions.filter((x) => x.id !== session.id)],
      extraActivities: s.extraActivities + 1,
      sspBonus: s.sspBonus + 8,
    }));
  },
  resetGoRecords: () => set({ goRecords: [], extraSessions: [], extraActivities: 0, sspBonus: 0 }),
  recordWeeklyLegacy: (record) =>
    set((s) => ({
      weeklyLegacy: s.weeklyLegacy.some((h) => h.id === record.id)
        ? s.weeklyLegacy
        : [record, ...s.weeklyLegacy],
    })),
  resetWeeklyLegacy: () => set({ weeklyLegacy: [] }),
}));
