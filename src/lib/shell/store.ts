import { create } from "zustand";
import type { Audience } from "@/lib/go-sportix/types";
import type { Lang } from "./i18n";

export type Perm = "prompt" | "granted" | "denied" | "connected";
export type ShellOverlay = "none" | "notifications" | "settings" | "onboarding";

export type NotifCategory =
  | "friends"
  | "chat"
  | "room"
  | "verification"
  | "sport-id"
  | "weekly"
  | "sponsor"
  | "marketplace"
  | "prayer";

export interface AppNotification {
  id: string;
  category: NotifCategory;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href: string;
  payload?: Record<string, string>;
}

export interface ShellStore {
  onboarded: boolean;
  onboardingStep: number;
  overlay: ShellOverlay;
  lang: Lang;
  audience: Audience;
  sports: string[];
  goals: string[];
  ageBand: "13-15" | "16-17" | "18+";
  guardian: boolean;
  prayer: boolean;
  location: Perm;
  camera: Perm;
  health: Perm;
  notifPerm: Perm;
  muted: NotifCategory[];
  digest: boolean;
  notifications: AppNotification[];
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  setStep: (n: number) => void;
  setOverlay: (o: ShellOverlay) => void;
  setLang: (l: Lang) => void;
  setAudience: (a: Audience) => void;
  setSports: (s: string[]) => void;
  setGoals: (g: string[]) => void;
  setAge: (a: ShellStore["ageBand"], guardian: boolean) => void;
  setPrayer: (v: boolean) => void;
  setPerm: (k: "location" | "camera" | "health" | "notifPerm", v: Perm) => void;
  toggleMute: (c: NotifCategory) => void;
  setDigest: (v: boolean) => void;
  notify: (n: Omit<AppNotification, "id" | "at" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

function persistOnboarded(v: boolean) {
  try {
    sessionStorage.setItem("sportix-onboarded", v ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function wasOnboarded() {
  try {
    return sessionStorage.getItem("sportix-onboarded") === "1";
  } catch {
    return false;
  }
}

let nseq = 1;
function nid() {
  nseq += 1;
  return `ntf-${nseq}`;
}

const seed: AppNotification[] = [
  {
    id: "ntf-seed-1",
    category: "weekly",
    title: "Week 37 ending soon",
    body: "2 days left. You are #18 global.",
    at: "2h",
    read: false,
    href: "/weekly-legends",
  },
  {
    id: "ntf-seed-2",
    category: "friends",
    title: "Friend request",
    body: "Sara M. sent a friend request.",
    at: "4h",
    read: false,
    href: "/communities",
    payload: { tab: "people" },
  },
  {
    id: "ntf-seed-3",
    category: "room",
    title: "Corniche 5-a-side is filling",
    body: "1 seat left · confirm if you are in.",
    at: "6h",
    read: false,
    href: "/go-sportix",
    payload: { room: "room-corniche" },
  },
];

export const useShell = create<ShellStore>((set, get) => ({
  onboarded: wasOnboarded(),
  onboardingStep: 1,
  overlay: wasOnboarded() ? "none" : "onboarding",
  lang: "en",
  audience: "FRIENDS",
  sports: ["Football", "Running"],
  goals: ["Build my SPORT ID"],
  ageBand: "18+",
  guardian: false,
  prayer: false,
  location: "prompt",
  camera: "prompt",
  health: "prompt",
  notifPerm: "prompt",
  muted: [],
  digest: false,
  notifications: seed,

  completeOnboarding: () => {
    persistOnboarded(true);
    set({ onboarded: true, overlay: "none", onboardingStep: 1 });
  },
  skipOnboarding: () => {
    persistOnboarded(true);
    set({
      onboarded: true,
      overlay: "none",
      location: "prompt",
      camera: "prompt",
      health: "prompt",
      notifPerm: "prompt",
    });
  },
  resetOnboarding: () => {
    persistOnboarded(false);
    set({ onboarded: false, overlay: "onboarding", onboardingStep: 1 });
  },
  setStep: (onboardingStep) => set({ onboardingStep }),
  setOverlay: (overlay) => set({ overlay }),
  setLang: (lang) => {
    set({ lang });
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang === "ar" ? "ar" : "en";
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  },
  setAudience: (audience) => set({ audience }),
  setSports: (sports) => set({ sports }),
  setGoals: (goals) => set({ goals }),
  setAge: (ageBand, guardian) => set({ ageBand, guardian }),
  setPrayer: (prayer) => set({ prayer }),
  setPerm: (k, v) => set({ [k]: v } as Partial<ShellStore>),
  toggleMute: (c) =>
    set((s) => ({
      muted: s.muted.includes(c)
        ? s.muted.filter((x) => x !== c)
        : [...s.muted, c],
    })),
  setDigest: (digest) => set({ digest }),
  notify: (n) => {
    if (get().muted.includes(n.category)) return;
    set((s) => ({
      notifications: [
        { ...n, id: nid(), at: "now", read: false },
        ...s.notifications,
      ],
    }));
  },
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
}));
