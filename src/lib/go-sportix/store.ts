import { create } from "zustand";
import { useAthlete } from "../athlete/store.ts";
import { syncSyntheticViews } from "../athlete/bridge.ts";
import { useSportix } from "@/lib/sportix/store";
import { useSportId } from "@/lib/sport-id/store";
import { useWeekly } from "@/lib/weekly-legends/store";
import { useShell } from "@/lib/shell/store";
import { useRooms } from "@/lib/rooms/store";
import { ACTIVITIES, DEMO_SPEED } from "./format";
import type {
  ActivityKey,
  ActivitySession,
  Audience,
  DemoOutcome,
  GoScreen,
  MediaEvidence,
  MediaSubject,
  SessionState,
} from "./types";

let seq = 1;
function nid(prefix: string) {
  seq += 1;
  return `${prefix}-${Date.now()}-${seq}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface GoStore {
  screen: GoScreen;
  session: ActivitySession | null;
  audience: Audience;
  subjectType: MediaSubject;
  demoOutcome: DemoOutcome;
  lastTick: number;
  goHome: () => void;
  openSelect: () => void;
  openGym: () => void;
  openFind: () => void;
  openCreate: () => void;
  openSettings: () => void;
  chooseActivity: (key: ActivityKey) => void;
  startActivity: () => void;
  tick: (now: number) => void;
  pause: () => void;
  resume: () => void;
  requestFinish: () => void;
  returnToActivity: () => void;
  setSubjectType: (s: MediaSubject) => void;
  attachMedia: (file: File) => void;
  clearMedia: () => void;
  finishAndVerify: () => void;
  applyVerificationStep: (index: number, ok: boolean) => void;
  completeVerification: (outcome: DemoOutcome) => void;
  showPost: () => void;
  setAudience: (a: Audience) => void;
  setDemoOutcome: (o: DemoOutcome) => void;
  resetDemo: () => void;
}

function emptySession(activity: ActivityKey): ActivitySession {
  return {
    id: nid("ses-go"),
    activity,
    state: "CREATED",
    startedAt: Date.now(),
    elapsedSec: 0,
    distanceKm: 0,
    steps: 0,
    elevationM: 0,
    speedKmh: ACTIVITIES[activity].speedKmh,
    gpsQuality: "HIGH",
    media: null,
    postId: null,
    sportIdRecordId: null,
    outcome: null,
  };
}

function setState(
  session: ActivitySession,
  state: SessionState,
): ActivitySession {
  return { ...session, state };
}

export const useGo = create<GoStore>((set, get) => ({
  screen: "home",
  session: null,
  audience: "ONLY ME",
  subjectType: "PLACE",
  demoOutcome: "verified",
  lastTick: 0,

  goHome: () => set({ screen: "home" }),
  openSelect: () => set({ screen: "select" }),
  openGym: () => set({ screen: "gym" }),
  openFind: () => {
    useRooms.getState().openList();
    set({ screen: "find-game" });
  },
  openCreate: () => {
    useRooms.getState().openCreate();
    set({ screen: "create-game" });
  },
  openSettings: () => set({ screen: "settings" }),

  chooseActivity: (key) => {
    const session = emptySession(key);
    useAthlete.getState().dispatch(`create-${session.id}`, {
      op: "activity.create",
      id: session.id,
      kind: key,
    });
    set({
      screen: "preflight",
      session,
      subjectType: "PLACE",
      audience: "ONLY ME",
    });
  },

  startActivity: () => {
    const session = get().session;
    if (!session || session.state !== "CREATED") return;
    set({
      screen: "live",
      lastTick: performance.now(),
      session: { ...setState(session, "ACTIVE"), startedAt: Date.now() },
    });
  },

  tick: (now) => {
    const { session, lastTick } = get();
    if (!session || session.state !== "ACTIVE") return;
    const dt = Math.min(250, now - lastTick) / 1000;
    if (dt <= 0) return;
    const cfg = ACTIVITIES[session.activity];
    const activitySec = dt * DEMO_SPEED;
    const wobble = 1 + Math.sin((session.elapsedSec + activitySec) / 18) * 0.04;
    const kmPerSec = (1 / cfg.paceSecPerKm) * wobble;
    const addKm = activitySec * kmPerSec;
    const distanceKm = session.distanceKm + addKm;
    const elapsedSec = session.elapsedSec + activitySec;
    const steps = session.steps + addKm * cfg.stepsPerKm;
    const elevationM = session.elevationM + addKm * cfg.elevationPerKm;
    const speedKmh =
      distanceKm > 0.01 ? distanceKm / (elapsedSec / 3600) : cfg.speedKmh;
    set({
      lastTick: now,
      session: {
        ...session,
        elapsedSec,
        distanceKm,
        steps,
        elevationM,
        speedKmh,
      },
    });
  },

  pause: () => {
    const session = get().session;
    if (!session || session.state !== "ACTIVE") return;
    set({ session: setState(session, "PAUSED") });
  },

  resume: () => {
    const session = get().session;
    if (!session || session.state !== "PAUSED") return;
    set({ lastTick: performance.now(), session: setState(session, "ACTIVE") });
  },

  requestFinish: () => {
    const session = get().session;
    if (
      !session ||
      !["ACTIVE", "PAUSED", "MEDIA_REQUIRED", "MEDIA_ATTACHED"].includes(
        session.state,
      )
    )
      return;
    if (!session.media) {
      set({
        screen: "media",
        session: setState(
          {
            ...session,
            state: session.state === "ACTIVE" ? "PAUSED" : session.state,
          },
          "MEDIA_REQUIRED",
        ),
      });
      return;
    }
    set({
      screen: "media",
      session: setState(session, "MEDIA_ATTACHED"),
    });
  },

  returnToActivity: () => {
    const session = get().session;
    if (!session) return;
    const next: SessionState = session.media
      ? "PAUSED"
      : session.state === "MEDIA_REQUIRED"
        ? "PAUSED"
        : "PAUSED";
    set({ screen: "live", session: { ...session, state: next } });
  },

  setSubjectType: (subjectType) => set({ subjectType }),

  attachMedia: (file) => {
    const session = get().session;
    if (
      !session ||
      !["MEDIA_REQUIRED", "MEDIA_ATTACHED", "INSUFFICIENT_EVIDENCE"].includes(
        session.state,
      )
    )
      return;
    if (session.media?.url.startsWith("blob:"))
      URL.revokeObjectURL(session.media.url);
    const url = URL.createObjectURL(file);
    const evidence: MediaEvidence = {
      media_evidence_id: nid("med"),
      session_id: session.id,
      user_id: useAthlete.getState().data.identity.sportixUserId,
      media_type: file.type.startsWith("video") ? "video" : "photo",
      subject_type: get().subjectType,
      capture_or_attach_time: new Date().toISOString(),
      session_binding: true,
      device_ref: "prototype-device",
      privacy_state: "session-bound",
      verification_state: "attached",
      evidence_ref: nid("ev"),
      url,
      fileName: file.name,
    };
    set({
      session: {
        ...session,
        media: evidence,
        state: "MEDIA_ATTACHED",
      },
    });
  },

  clearMedia: () => {
    const session = get().session;
    if (!session) return;
    if (session.media?.url.startsWith("blob:"))
      URL.revokeObjectURL(session.media.url);
    set({ session: { ...session, media: null, state: "MEDIA_REQUIRED" } });
  },

  finishAndVerify: () => {
    const session = get().session;
    if (
      session &&
      !["MEDIA_REQUIRED", "MEDIA_ATTACHED", "INSUFFICIENT_EVIDENCE"].includes(
        session.state,
      )
    )
      return;
    if (!session?.media) {
      set({
        screen: "media",
        session: session ? setState(session, "MEDIA_REQUIRED") : session,
      });
      return;
    }
    set({ screen: "verify", session: setState(session, "VERIFYING") });
  },

  applyVerificationStep: () => undefined,

  completeVerification: (forced) => {
    const session = get().session;
    if (!session || session.state !== "VERIFYING" || !session.media) return;
    const data = useAthlete.getState().data;
    const activity = data.activities.find((a) => a.id === session.id);
    if (
      !activity ||
      session.media.session_id !== session.id ||
      session.media.user_id !== data.identity.sportixUserId
    )
      return;
    if (session.elapsedSec <= 0 || session.distanceKm <= 0) {
      set({
        screen: "success",
        session: {
          ...session,
          state: "INSUFFICIENT_EVIDENCE",
          outcome: "insufficient",
        },
      });
      return;
    }
    const outcome = session.activity === "cycling" ? "review" : forced;
    useAthlete.getState().dispatch(`submit-${session.id}-${activity.version}`, {
      op: "activity.submit",
      id: session.id,
      version: activity.version,
      metrics: {
        durationSec: session.elapsedSec,
        distanceKm: session.distanceKm,
        steps: Math.round(session.steps),
      },
      evidenceRef: `synthetic-evidence-${session.id}`,
    });
    const next = useAthlete
      .getState()
      .dispatch(`simulate-${session.id}-${activity.version}`, {
        op: "activity.simulate",
        id: session.id,
        version: activity.version + 1,
        outcome: outcome === "verified" ? "pass" : outcome,
      });
    syncSyntheticViews();
    const updated = next.activities.find((a) => a.id === session.id)!;
    set({
      screen: "success",
      session: {
        ...session,
        state: updated.status as SessionState,
        outcome,
        postId: next.posts.find((p) => p.activityId === session.id)?.id ?? null,
        sportIdRecordId: `sid-${session.id}`,
      },
    });
    useShell.getState().notify({
      category: "sport-id",
      title: "Simulation recorded",
      body: "Private SPORT ID test record updated. No verification or rewards granted.",
      href: "/sport-id",
    });
  },

  showPost: () => set({ screen: "post" }),

  setAudience: (audience) => {
    const session = get().session;
    if (session) {
      const a = useAthlete
        .getState()
        .data.activities.find((x) => x.id === session.id);
      if (a) {
        const next = useAthlete
          .getState()
          .dispatch(`consent-${a.id}-${a.version}`, {
            op: "consent.set",
            id: a.id,
            version: a.version,
            audience: audience === "ONLY ME" ? "PRIVATE" : audience,
            shareMetrics: false,
          });
        syncSyntheticViews();
        set({
          session: {
            ...session,
            postId: next.posts.find((p) => p.activityId === a.id)?.id ?? null,
          },
        });
      }
    }
    set({ audience });
    useShell.getState().setAudience(audience);
  },
  setDemoOutcome: (demoOutcome) => set({ demoOutcome }),

  resetDemo: () => {
    const session = get().session;
    if (session?.media?.url.startsWith("blob:"))
      URL.revokeObjectURL(session.media.url);
    useSportix.getState().removeGoPosts();
    useSportId.getState().resetGoRecords();
    useWeekly.getState().revertGoSessions();
    useAthlete.getState().reset();
    syncSyntheticViews();
    seq = 1;
    set({
      screen: "home",
      session: null,
      audience: "ONLY ME",
      subjectType: "PLACE",
      demoOutcome: "verified",
      lastTick: 0,
    });
  },
}));
