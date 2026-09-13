import type { WeeklyRankingEntry, WeeklySport } from "./types";

export const WEEK_NUMBER = 37;
export const VIEWER_BASE_SSP = 1840;
export const VIEWER_BASE_ACTIVITIES = 6;
export const VIEWER_BASE_STREAK = 4;
export const GO_SSP_DELTA = 240;
export const RULE_VERSION = "W37-V1";
export const VIEWER_ID = "yousef";

export const seedEndsInMs = (2 * 24 + 14) * 3600_000 + 32 * 60_000;

export const weeklyAthletes: WeeklyRankingEntry[] = [
  { userId: "faisal", name: "Faisal A.", sport: "football", sportLabel: "Football", zone: "Jeddah", country: "KSA", ssp: 2940, activities: 7, streak: 6, avatar: "/media/faisal.jpg", eligibility: "eligible", excludedSessions: 0 },
  { userId: "omar", name: "Omar M.", sport: "football", sportLabel: "Football", zone: "Riyadh", country: "KSA", ssp: 2810, activities: 8, streak: 12, avatar: null, eligibility: "eligible", excludedSessions: 0 },
  { userId: "saud", name: "Saud K.", sport: "running", sportLabel: "Running", zone: "Jeddah", country: "KSA", ssp: 2660, activities: 6, streak: 5, avatar: null, eligibility: "eligible", excludedSessions: 0 },
  { userId: "ahmed", name: "Ahmed R.", sport: "football", sportLabel: "Football", zone: "Jeddah", country: "KSA", ssp: 2540, activities: 5, streak: 4, avatar: "/media/ahmed.jpg", eligibility: "eligible", excludedSessions: 0 },
  { userId: "sara", name: "Sara M.", sport: "running", sportLabel: "Running", zone: "Jeddah", country: "KSA", ssp: 2480, activities: 7, streak: 9, avatar: "/media/sara.jpg", eligibility: "eligible", excludedSessions: 0 },
  { userId: "layla", name: "Layla K.", sport: "gym", sportLabel: "Gym", zone: "Jeddah", country: "KSA", ssp: 2390, activities: 6, streak: 3, avatar: "/media/layla.jpg", eligibility: "eligible", excludedSessions: 0 },
  { userId: "nora", name: "Nora S.", sport: "padel", sportLabel: "Padel", zone: "Jeddah", country: "KSA", ssp: 2310, activities: 5, streak: 2, avatar: "/media/nora.jpg", eligibility: "eligible", excludedSessions: 0 },
  { userId: "abdullah", name: "Abdullah H.", sport: "football", sportLabel: "Football", zone: "Jeddah", country: "KSA", ssp: 2240, activities: 4, streak: 3, avatar: "/media/abdullah.jpg", eligibility: "eligible", excludedSessions: 0 },
  { userId: "lina", name: "Lina A.", sport: "running", sportLabel: "Running", zone: "Jeddah", country: "KSA", ssp: 2180, activities: 9, streak: 7, avatar: null, eligibility: "eligible", excludedSessions: 0 },
  { userId: "khalid", name: "Khalid B.", sport: "gym", sportLabel: "Gym", zone: "Riyadh", country: "KSA", ssp: 2176, activities: 5, streak: 2, avatar: null, eligibility: "eligible", excludedSessions: 1 },
  { userId: "dana", name: "Dana F.", sport: "padel", sportLabel: "Padel", zone: "Riyadh", country: "KSA", ssp: 2172, activities: 5, streak: 4, avatar: null, eligibility: "eligible", excludedSessions: 0 },
  { userId: "tariq", name: "Tariq N.", sport: "football", sportLabel: "Football", zone: "Dammam", country: "KSA", ssp: 2168, activities: 4, streak: 1, avatar: null, eligibility: "review", excludedSessions: 1 },
  { userId: "hassan", name: "Hassan J.", sport: "hiking", sportLabel: "Hiking", zone: "Jeddah", country: "KSA", ssp: 2164, activities: 3, streak: 2, avatar: null, eligibility: "eligible", excludedSessions: 0 },
  { userId: "waleed", name: "Waleed Q.", sport: "gym", sportLabel: "Gym", zone: "Jeddah", country: "KSA", ssp: 2162, activities: 3, streak: 1, avatar: null, eligibility: "eligible", excludedSessions: 0 },
  { userId: "reem", name: "Reem T.", sport: "walking", sportLabel: "Walking", zone: "Jeddah", country: "KSA", ssp: 2160, activities: 8, streak: 8, avatar: null, eligibility: "eligible", excludedSessions: 0 },
  { userId: "majid", name: "Majid S.", sport: "running", sportLabel: "Running", zone: "Jeddah", country: "KSA", ssp: 2020, activities: 4, streak: 3, avatar: null, eligibility: "eligible", excludedSessions: 0 },
  { userId: "nabil", name: "Nabil K.", sport: "football", sportLabel: "Football", zone: "Jeddah", country: "KSA", ssp: 1960, activities: 3, streak: 2, avatar: null, eligibility: "eligible", excludedSessions: 0 },
  { userId: "yousef", name: "Yousef N.", sport: "football", sportLabel: "Football", zone: "Jeddah", country: "KSA", ssp: VIEWER_BASE_SSP, activities: VIEWER_BASE_ACTIVITIES, streak: VIEWER_BASE_STREAK, avatar: "/media/yousef.jpg", eligibility: "eligible", excludedSessions: 1, isViewer: true },
  { userId: "hind", name: "Hind A.", sport: "walking", sportLabel: "Walking", zone: "Jeddah", country: "KSA", ssp: 1744, activities: 6, streak: 5, avatar: null, eligibility: "eligible", excludedSessions: 0 },
  { userId: "maya", name: "Maya H.", sport: "running", sportLabel: "Running", zone: "Jeddah", country: "KSA", ssp: 1610, activities: 3, streak: 2, avatar: "/media/sara.jpg", eligibility: "eligible", excludedSessions: 0 },
];

export function rankList(entries: WeeklyRankingEntry[]) {
  return [...entries]
    .filter((e) => e.eligibility !== "excluded")
    .sort((a, b) => b.ssp - a.ssp || b.activities - a.activities)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

export function filterEntries(
  ranked: ReturnType<typeof rankList>,
  ctx: "global" | "country" | "zone" | "sport",
  sport: WeeklySport | "all",
) {
  let list = ranked;
  if (ctx === "country") list = list.filter((e) => e.country === "KSA");
  if (ctx === "zone") list = list.filter((e) => e.zone === "Jeddah");
  if (sport !== "all") list = list.filter((e) => e.sport === sport);
  if (ctx === "sport" && sport === "all") list = list.filter((e) => e.sport === "football");
  return list.map((e, i) => ({ ...e, rank: i + 1 }));
}
