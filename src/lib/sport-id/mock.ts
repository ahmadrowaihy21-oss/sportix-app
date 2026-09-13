import type {
  AchievementRecord,
  DevelopmentPoint,
  EvidenceEnvelope,
  JourneyEvent,
  SessionRecord,
  SportKey,
  SportRecord,
  VisionReport,
} from "./types";

const SID = "/media/sport-id";

export const OWNER_ID = "yousef";
export const OWNER_NAME = "Yousef N.";
export const OWNER_CITY = "Jeddah";
export const MEMBER_SINCE = "2026";
export const MOCK_BANNER =
  "Prototype demonstration data. Not a production measurement claim.";

function env(partial: Partial<EvidenceEnvelope> & Pick<EvidenceEnvelope, "state">): EvidenceEnvelope {
  return {
    quality: "high",
    coveragePct: 94,
    confidencePct: 92,
    humanReview: "completed",
    lastUpdated: "12 Sep 2026",
    modelVersion: "vision-fb-2026.09",
    sessionsUsed: 14,
    latestSession: "10 Sep 2026",
    sources: [
      { id: "vis", label: "SPORTIX Vision", quality: "high", className: "vision" },
      { id: "lf", label: "Left foot sensor", quality: "high", className: "foot-sensor" },
      { id: "rf", label: "Right foot sensor", quality: "high", className: "foot-sensor" },
    ],
    limitations: ["Derived from approved session summaries. Raw streams are not shown."],
    ...partial,
  };
}

const fb = env({
  state: "verified",
  coveragePct: 94,
  confidencePct: 92,
  sessionsUsed: 14,
  latestSession: "10 Sep 2026",
});

const runEv = env({
  state: "verified",
  modelVersion: "endurance-2026.08",
  coveragePct: 96,
  confidencePct: 90,
  sessionsUsed: 74,
  latestSession: "11 Sep 2026",
  sources: [
    { id: "gps", label: "GPS", quality: "high", className: "gps" },
    { id: "route", label: "Route", quality: "high", className: "gnss" },
    { id: "watch", label: "Health / Watch", quality: "high", className: "watch" },
  ],
});

const walkEv = env({
  state: "verified",
  modelVersion: "walk-2026.07",
  coveragePct: 91,
  confidencePct: 88,
  sessionsUsed: 94,
  latestSession: "12 Sep 2026",
  sources: [
    { id: "steps", label: "Steps", quality: "high", className: "watch" },
    { id: "gps", label: "GPS / Distance", quality: "high", className: "gps" },
  ],
});

const padelPilot = env({
  state: "pilot",
  quality: "medium",
  coveragePct: 71,
  confidencePct: 74,
  humanReview: "pending",
  modelVersion: "padel-pilot-2026.09",
  sessionsUsed: 18,
  latestSession: "08 Sep 2026",
  sources: [{ id: "vis", label: "SPORTIX Vision", quality: "medium", className: "vision" }],
  limitations: [
    "Padel verification is in a pilot / reference profile. Not all results are SPORTIX VERIFIED.",
  ],
});

const padelOk = env({
  state: "verified",
  quality: "high",
  coveragePct: 88,
  confidencePct: 86,
  modelVersion: "padel-pilot-2026.09",
  sessionsUsed: 12,
  sources: [{ id: "vis", label: "SPORTIX Vision", quality: "high", className: "vision" }],
  limitations: ["Verified only where production rules already passed in this pilot."],
});

const cyclePending = env({
  state: "pending-review",
  quality: "limited",
  coveragePct: 64,
  confidencePct: 58,
  humanReview: "pending",
  modelVersion: "cycle-profile-draft",
  sessionsUsed: 63,
  latestSession: "09 Sep 2026",
  sources: [
    { id: "gps", label: "GPS", quality: "medium", className: "gps" },
    { id: "dev", label: "Device evidence", quality: "medium", className: "watch" },
  ],
  limitations: ["Canonical SPORTIX cycling verification profile is not formally approved."],
});

export const sportOrder: SportKey[] = ["football", "padel", "running", "walking", "cycling"];

export const sports: Record<SportKey, SportRecord> = {
  football: {
    key: "football",
    label: "Football",
    state: "verified",
    hero: `${SID}/football.png`,
    summary: "Football ID",
    sessionsLabel: "Verified sessions",
    sessionsValue: "28",
    lastVerified: "12 Sep 2026",
    extra: {
      position: "RW",
      foot: "Right",
      evidenceLevel: "Multi-source",
    },
    dimensions: [
      { id: "tech", label: "Technical", value: 84 },
      { id: "tact", label: "Tactical", value: 79 },
      { id: "phys", label: "Physical", value: 87 },
      { id: "cons", label: "Consistency", value: 82 },
    ],
    skills: [
      { id: "pass", label: "Passing accuracy", value: 87, trend90: 6, evidence: { ...fb, coveragePct: 95, confidencePct: 93, sessionsUsed: 16 }, public: true, professional: true },
      { id: "control", label: "Ball control", value: 89, trend90: 4, evidence: fb, public: true, professional: true },
      { id: "touch", label: "First touch", value: 91, trend90: 8, evidence: { ...fb, coveragePct: 93, confidencePct: 92, sessionsUsed: 14, latestSession: "10 Sep 2026" }, public: true, professional: true },
      { id: "shot", label: "Shooting accuracy", value: 78, trend90: 3, evidence: fb, public: false, professional: true },
      { id: "cross", label: "Crossing quality", value: 80, trend90: 5, evidence: fb, public: false, professional: true },
      { id: "drib", label: "Dribbling success", value: 85, trend90: 2, evidence: fb, public: true, professional: true },
      { id: "tack", label: "Tackling success", value: 74, trend90: 1, evidence: { ...fb, quality: "medium", coveragePct: 81, confidencePct: 84 }, public: false, professional: true },
    ],
  },
  padel: {
    key: "padel",
    label: "Padel",
    state: "pilot",
    hero: `${SID}/padel.png`,
    summary: "Padel ID",
    sessionsLabel: "Matches",
    sessionsValue: "42",
    lastVerified: "08 Sep 2026",
    extra: {
      visionSessions: "18",
      evidenceState: "Pilot / mixed",
    },
    dimensions: [
      { id: "tech", label: "Technical", value: 88 },
      { id: "tact", label: "Tactical", value: 84 },
      { id: "phys", label: "Physical", value: 81 },
      { id: "cons", label: "Consistency", value: 86 },
    ],
    skills: [
      { id: "fh", label: "Forehand accuracy", value: 86, evidence: padelOk, public: true, professional: true },
      { id: "bh", label: "Backhand accuracy", value: 82, evidence: padelPilot, public: true, professional: true },
      { id: "volley", label: "Volley quality", value: 87, evidence: padelOk, public: true, professional: true },
      { id: "smash", label: "Smash efficiency", value: 91, evidence: padelPilot, public: true, professional: true },
      { id: "lob", label: "Lob quality", value: 79, evidence: padelPilot, public: false, professional: true },
      { id: "serve", label: "Serve consistency", value: 84, evidence: padelOk, public: false, professional: true },
      { id: "return", label: "Return quality", value: 83, evidence: padelPilot, public: false, professional: true },
      { id: "variety", label: "Shot variety", value: 80, evidence: padelPilot, public: false, professional: true },
      { id: "winner", label: "Winner efficiency", value: 77, evidence: padelPilot, public: false, professional: true },
      { id: "ufe", label: "Unforced errors", value: 18, unit: " / set", evidence: padelPilot, public: false, professional: true },
      { id: "select", label: "Shot selection", value: 85, evidence: padelPilot, public: false, professional: true },
      { id: "decide", label: "Decision speed", value: 81, evidence: padelPilot, public: false, professional: true },
      { id: "pos", label: "Positioning", value: 84, evidence: padelOk, public: true, professional: true },
      { id: "aware", label: "Court awareness", value: 84, evidence: padelOk, public: true, professional: true },
      { id: "read", label: "Reading opponents", value: 78, evidence: padelPilot, public: false, professional: true },
      { id: "trans", label: "Transition timing", value: 80, evidence: padelPilot, public: false, professional: true },
      { id: "def", label: "Defensive rotation", value: 76, evidence: padelPilot, public: false, professional: true },
      { id: "off", label: "Offensive choices", value: 83, evidence: padelPilot, public: false, professional: true },
    ],
  },
  running: {
    key: "running",
    label: "Running",
    state: "verified",
    hero: `${SID}/running.jpg`,
    summary: "Running ID",
    sessionsLabel: "Verified runs",
    sessionsValue: "73",
    lastVerified: "11 Sep 2026",
    extra: {
      distance: "476.58 KM",
      best5k: "22:38",
      best10k: "48:12",
      avgPace: "5:12 / KM",
      last30: "72.4 KM",
      paceTrend: "+4.8%",
      distTrend: "+12%",
      consistency: "2 weeks",
    },
    dimensions: [],
    skills: [
      { id: "dist", label: "Verified distance", value: "476.58", unit: "KM", evidence: runEv, public: true, professional: true },
      { id: "pace", label: "Average pace", value: "5:12", unit: "/ KM", evidence: runEv, public: true, professional: true },
      { id: "five", label: "Best verified 5K", value: "22:38", evidence: runEv, public: true, professional: true },
      { id: "ten", label: "Best verified 10K", value: "48:12", evidence: runEv, public: true, professional: true },
    ],
  },
  walking: {
    key: "walking",
    label: "Walking",
    state: "verified",
    hero: `${SID}/walking.jpg`,
    summary: "Walking ID",
    sessionsLabel: "Verified walks",
    sessionsValue: "94",
    lastVerified: "12 Sep 2026",
    extra: {
      distance: "326 KM",
      steps: "612,480",
      month: "42.7 KM",
      longest: "12.4 KM",
      consistency: "4 weeks",
    },
    dimensions: [],
    skills: [
      { id: "wdist", label: "Verified distance", value: "326", unit: "KM", evidence: walkEv, public: true, professional: false },
      { id: "steps", label: "Verified steps", value: "612,480", evidence: walkEv, public: false, professional: false },
      { id: "long", label: "Longest walk", value: "12.4", unit: "KM", evidence: walkEv, public: true, professional: false },
    ],
  },
  cycling: {
    key: "cycling",
    label: "Cycling",
    state: "pending-profile",
    hero: `${SID}/cycling.jpg`,
    summary: "Cycling ID",
    sessionsLabel: "Rides",
    sessionsValue: "63",
    extra: {
      distance: "1,284 KM",
      longest: "82.6 KM",
      speed: "27.4 KM/H",
      elevation: "8,420 M",
      endurance: "+11%",
    },
    dimensions: [],
    skills: [
      { id: "cdist", label: "Distance", value: "1,284", unit: "KM", evidence: cyclePending, public: true, professional: true },
      { id: "spd", label: "Average speed", value: "27.4", unit: "KM/H", evidence: cyclePending, public: true, professional: true },
      { id: "elev", label: "Elevation", value: "8,420", unit: "M", evidence: cyclePending, public: false, professional: true },
    ],
  },
};

export const footballVision: VisionReport = {
  sport: "football",
  happened: [
    { label: "Successful passes", value: "38" },
    { label: "Progressive carries", value: "7" },
    { label: "Shots", value: "4" },
  ],
  why: "Strong right-side positioning and fast first-touch execution created more attacking opportunities.",
  next: "Improve weak-foot receiving under pressure.",
};

export const footballDevelopment: DevelopmentPoint[] = [
  { label: "Passing", from: 76, to: 84 },
  { label: "First touch", from: 80, to: 91 },
  { label: "Dribbling", from: 82, to: 85 },
  { label: "Decision", from: 71, to: 79 },
  { label: "Physical", from: 81, to: 87 },
];

export const achievements: AchievementRecord[] = [
  { id: "ach-mvp", title: "Match MVP", sport: "football", date: "07 Sep 2026", event: "Corniche 5s", state: "verified", evidenceRef: "ev-match-07", relatedSession: "ses-fb-07", relatedPostId: "post-match" },
  { id: "ach-weekly", title: "Weekly Legend", sport: "football", date: "06 Sep 2026", event: "Jeddah Zone week", state: "verified", evidenceRef: "ev-week-06", relatedPostId: "post-achieve-match" },
  { id: "ach-pass", title: "Passing milestone", sport: "football", date: "10 Sep 2026", event: "Academy session", state: "verified", evidenceRef: "ev-pass-10", relatedSession: "ses-fb-10" },
  { id: "ach-speed", title: "Speed milestone", sport: "football", date: "02 Sep 2026", event: "Sprint block", state: "verified", evidenceRef: "ev-spd-02" },
  { id: "ach-skill", title: "Skill breakthrough", sport: "football", date: "10 Sep 2026", event: "First touch block", state: "verified", evidenceRef: "ev-touch-10", relatedSession: "ses-fb-10" },
  { id: "ach-5k", title: "5K personal best", sport: "running", date: "11 Sep 2026", event: "Corniche 5K", state: "verified", evidenceRef: "ev-5k-11", relatedSession: "ses-run-11", relatedPostId: "post-achieve" },
  { id: "ach-padel", title: "Tournament winner", sport: "padel", date: "20 Aug 2026", event: "Jeddah box league", state: "pilot", evidenceRef: "ev-padel-20" },
];

export const journey: JourneyEvent[] = [
  { id: "j1", date: "12 Sep 2026", title: "Football academy session", sport: "football", state: "verified" },
  { id: "j2", date: "11 Sep 2026", title: "Running 5K personal best", sport: "running", state: "verified" },
  { id: "j3", date: "09 Sep 2026", title: "Cycling 50 KM milestone", sport: "cycling", state: "pending-profile" },
  { id: "j4", date: "08 Sep 2026", title: "Padel match", sport: "padel", state: "pilot" },
  { id: "j5", date: "07 Sep 2026", title: "Corniche 5s · 2–1", sport: "football", state: "verified" },
  { id: "j6", date: "04 Sep 2026", title: "Corniche walk", sport: "walking", state: "verified" },
];

export const sessions: SessionRecord[] = [
  {
    id: "ses-fb-10",
    sport: "football",
    title: "Academy first-touch block",
    date: "10 Sep 2026",
    metrics: [
      { label: "First touch", value: "91" },
      { label: "Passes", value: "38" },
      { label: "Duration", value: "74 min" },
    ],
    evidence: fb,
  },
  {
    id: "ses-fb-07",
    sport: "football",
    title: "Corniche 5s",
    date: "07 Sep 2026",
    metrics: [
      { label: "Score", value: "2–1" },
      { label: "Position", value: "RW" },
    ],
    evidence: fb,
  },
  {
    id: "ses-run-11",
    sport: "running",
    title: "Verified 5K",
    date: "11 Sep 2026",
    metrics: [
      { label: "Distance", value: "5.00 KM" },
      { label: "Duration", value: "22:38" },
      { label: "Pace", value: "4:32 / KM" },
      { label: "Device", value: "Watch + GPS" },
    ],
    evidence: runEv,
    routeNote: "Corniche out-and-back. Time integrity passed. No pace anomaly.",
  },
  {
    id: "ses-walk-12",
    sport: "walking",
    title: "Corniche evening walk",
    date: "12 Sep 2026",
    metrics: [
      { label: "Distance", value: "6.2 KM" },
      { label: "Steps", value: "8,140" },
      { label: "Duration", value: "1:08" },
    ],
    evidence: walkEv,
  },
  {
    id: "ses-cy-09",
    sport: "cycling",
    title: "Coastal 50 KM",
    date: "09 Sep 2026",
    metrics: [
      { label: "Distance", value: "50.4 KM" },
      { label: "Speed", value: "28.1 KM/H" },
      { label: "Elevation", value: "310 M" },
    ],
    evidence: cyclePending,
    routeNote: "Device GPS only. Awaiting approved cycling verification profile.",
  },
];

export const addableSports = [
  { id: "tennis", label: "Tennis" },
  { id: "swimming", label: "Swimming" },
  { id: "gym", label: "Gym" },
];

export const JOURNEY_TOTALS = {
  sports: 5,
  activities: 246,
  matches: 68,
  achievements: 34,
};

export function trendSeries(end: number, delta: number) {
  const start = end - delta;
  return [0, 1, 2, 3, 4, 5].map((i) => ({
    t: `W${i + 1}`,
    v: Math.round(start + ((end - start) * i) / 5),
  }));
}
