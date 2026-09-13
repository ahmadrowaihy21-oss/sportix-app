import type { ActivityConfig, ActivityKey } from "./types";

export const ACTIVITIES: Record<ActivityKey, ActivityConfig> = {
  running: {
    key: "running",
    label: "Running",
    liveLabel: "LIVE RUN",
    startCta: "START RUN",
    sportLabel: "RUNNING",
    mediaRequired: true,
    verificationReady: true,
    paceSecPerKm: 351,
    stepsPerKm: 1400,
    elevationPerKm: 4,
    speedKmh: 10.26,
  },
  walking: {
    key: "walking",
    label: "Walking",
    liveLabel: "LIVE WALK",
    startCta: "START WALK",
    sportLabel: "WALKING",
    mediaRequired: true,
    verificationReady: true,
    paceSecPerKm: 720,
    stepsPerKm: 1600,
    elevationPerKm: 6,
    speedKmh: 5,
  },
  hiking: {
    key: "hiking",
    label: "Hiking",
    liveLabel: "LIVE HIKE",
    startCta: "START HIKE",
    sportLabel: "HIKING",
    mediaRequired: true,
    verificationReady: true,
    paceSecPerKm: 840,
    stepsPerKm: 1500,
    elevationPerKm: 48,
    speedKmh: 4.28,
  },
  cycling: {
    key: "cycling",
    label: "Cycling",
    liveLabel: "LIVE RIDE",
    startCta: "START RIDE",
    sportLabel: "CYCLING",
    mediaRequired: true,
    verificationReady: false,
    paceSecPerKm: 131,
    stepsPerKm: 0,
    elevationPerKm: 18,
    speedKmh: 27.4,
  },
};

export function formatDuration(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function formatPace(secPerKm: number) {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return "—";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60) % 60;
  return `${m}:${String(s).padStart(2, "0")} / KM`;
}

export function formatKm(km: number) {
  return km.toFixed(2);
}

export function currentPace(elapsedSec: number, distanceKm: number, fallback: number) {
  if (distanceKm < 0.02) return fallback;
  return elapsedSec / distanceKm;
}

export const VERIFY_CHECKS = [
  { id: "identity", label: "Checking Session Identity..." },
  { id: "time", label: "Checking Time Integrity..." },
  { id: "gps", label: "Checking GPS / Route..." },
  { id: "activity", label: "Checking Activity Data..." },
  { id: "health", label: "Checking Health / Watch..." },
  { id: "media", label: "Checking Media Evidence..." },
  { id: "context", label: "Checking Context Consistency..." },
  { id: "final", label: "Finalizing SPORTIX Verification..." },
] as const;

/** 1 real second ≈ 160 activity seconds so a 5.42 km run completes in ~12s. */
export const DEMO_SPEED = 160;
