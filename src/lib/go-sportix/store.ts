import { create } from "zustand";
import { VIEWER_ID } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import type { CommunityPost } from "@/lib/sportix/types";
import { useSportId } from "@/lib/sport-id/store";
import { useWeekly } from "@/lib/weekly-legends/store";
import { useShell } from "@/lib/shell/store";
import { useRooms } from "@/lib/rooms/store";
import { ACTIVITIES, currentPace, DEMO_SPEED, formatDuration, formatKm, formatPace } from "./format";
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
  return `${prefix}-${seq}`;
}

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
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

function setState(session: ActivitySession, state: SessionState): ActivitySession {
  return { ...session, state };
}

function publishAndSync(session: ActivitySession, outcome: DemoOutcome) {
  const cfg = ACTIVITIES[session.activity];
  const paceSec = currentPace(session.elapsedSec, session.distanceKm, cfg.paceSecPerKm);
  const duration = formatDuration(session.elapsedSec);
  const pace = formatPace(paceSec);
  const km = formatKm(session.distanceKm);
  const mediaUrl = session.media?.url ?? "";
  const postId = nid("post-go");
  const recordId = nid("sid-go");
  const verified = outcome === "verified";

  const post: CommunityPost = {
    id: postId,
    authorId: VIEWER_ID,
    kind: "activity",
    createdAt: "now",
    context: `${cfg.sportLabel} · Jeddah Zone`,
    media: {
      src: mediaUrl,
      alt: session.media?.subject_type === "SELF" ? "Self media from activity" : "Place media from activity",
    },
    caption: verified
      ? `SPORTIX VERIFIED · ${km} KM · ${duration} · ${pace}`
      : `Activity recorded · verification ${outcome === "review" ? "in review" : "insufficient"}`,
    verification: verified ? "verified" : outcome === "review" ? "pending" : "insufficient",
    performance: {
      sportLabel: cfg.sportLabel,
      headline: `${km} KM`,
      metrics: [
        { label: "Duration", value: duration },
        { label: "Pace", value: pace },
        { label: "Evidence", value: verified ? "HIGH" : "—" },
      ],
      spAi: verified ? 12 : undefined,
      zone: "Jeddah Zone",
    },
    engagement: { likeCount: 0, commentCount: 0, repostCount: 0, likedBy: [] },
    sponsor: { topSponsorId: null, extraCount: 0 },
    liked: false,
    saved: false,
    reposted: false,
    goEvidence: session.media
      ? {
          sessionId: session.id,
          subjectType: session.media.subject_type,
          quality: verified ? "HIGH" : "LIMITED",
          sportIdUpdated: verified,
          gps: true,
          route: true,
          time: true,
          health: true,
          media: true,
        }
      : undefined,
  };

  useSportix.getState().publishGoPost(post);

  if (verified) {
    useSportId.getState().recordVerifiedActivity({
      id: recordId,
      sessionId: session.id,
      postId,
      activity: session.activity,
      distanceKm: session.distanceKm,
      durationSec: session.elapsedSec,
      paceLabel: pace,
      steps: Math.round(session.steps),
      mediaUrl,
      subjectType: session.media?.subject_type ?? "PLACE",
      dateLabel: todayLabel(),
      quality: "HIGH",
    });
    useWeekly.getState().applyVerifiedActivity({
      sessionId: session.id,
      activity: session.activity,
    });
    useShell.getState().notify({
      category: "verification",
      title: "Activity Verified",
      body: `${cfg.sportLabel} · ${km} KM · SPORT ID updated`,
      href: "/go-sportix",
    });
    useShell.getState().notify({
      category: "weekly",
      title: "Weekly Legends updated",
      body: "Eligible SSP applied from VERIFIED_COMPLETED. Sharing was not required.",
      href: "/weekly-legends",
    });
    useShell.getState().notify({
      category: "sport-id",
      title: "SPORT ID updated",
      body: "Verified activity recorded. Independent of post visibility.",
      href: "/sport-id",
    });
  }

  return { postId, recordId };
}

export const useGo = create<GoStore>((set, get) => ({
  screen: "home",
  session: null,
  audience: "FRIENDS",
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

  chooseActivity: (key) =>
    set({
      screen: "preflight",
      session: emptySession(key),
      subjectType: "PLACE",
    }),

  startActivity: () => {
    const session = get().session;
    if (!session) return;
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
    const speedKmh = distanceKm > 0.01 ? distanceKm / (elapsedSec / 3600) : cfg.speedKmh;
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
    if (!session) return;
    if (!session.media) {
      set({
        screen: "media",
        session: setState({ ...session, state: session.state === "ACTIVE" ? "PAUSED" : session.state }, "MEDIA_REQUIRED"),
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
    const next: SessionState = session.media ? "PAUSED" : session.state === "MEDIA_REQUIRED" ? "PAUSED" : "PAUSED";
    set({ screen: "live", session: { ...session, state: next } });
  },

  setSubjectType: (subjectType) => set({ subjectType }),

  attachMedia: (file) => {
    const session = get().session;
    if (!session) return;
    if (session.media?.url.startsWith("blob:")) URL.revokeObjectURL(session.media.url);
    const url = URL.createObjectURL(file);
    const evidence: MediaEvidence = {
      media_evidence_id: nid("med"),
      session_id: session.id,
      user_id: VIEWER_ID,
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
    if (session.media?.url.startsWith("blob:")) URL.revokeObjectURL(session.media.url);
    set({ session: { ...session, media: null, state: "MEDIA_REQUIRED" } });
  },

  finishAndVerify: () => {
    const session = get().session;
    if (!session?.media) {
      set({ screen: "media", session: session ? setState(session, "MEDIA_REQUIRED") : session });
      return;
    }
    set({ screen: "verify", session: setState(session, "VERIFYING") });
  },

  applyVerificationStep: () => undefined,

  completeVerification: (forced) => {
    const session = get().session;
    if (!session) return;
    const cycling = session.activity === "cycling" && !ACTIVITIES.cycling.verificationReady;
    const outcome: DemoOutcome = cycling ? "review" : forced ?? get().demoOutcome;
    if (outcome !== "verified") {
      set({
        screen: "success",
        session: {
          ...session,
          state: outcome === "review" ? "REVIEW_REQUIRED" : "INSUFFICIENT_EVIDENCE",
          outcome,
        },
      });
      if (outcome === "insufficient") return;
    }
    const { postId, recordId } = publishAndSync(session, outcome);
    set({
      screen: "success",
      session: {
        ...session,
        postId,
        sportIdRecordId: recordId,
        outcome,
        state:
          outcome === "verified"
            ? "VERIFIED_COMPLETED"
            : outcome === "review"
              ? "REVIEW_REQUIRED"
              : "INSUFFICIENT_EVIDENCE",
        media: session.media
          ? { ...session.media, verification_state: outcome === "verified" ? "accepted" : "rejected" }
          : null,
      },
    });
  },

  showPost: () => set({ screen: "post" }),

  setAudience: (audience) => {
    set({ audience });
    useShell.getState().setAudience(audience);
  },
  setDemoOutcome: (demoOutcome) => set({ demoOutcome }),

  resetDemo: () => {
    const session = get().session;
    if (session?.media?.url.startsWith("blob:")) URL.revokeObjectURL(session.media.url);
    useSportix.getState().removeGoPosts();
    useSportId.getState().resetGoRecords();
    useWeekly.getState().revertGoSessions();
    seq = 1;
    set({
      screen: "home",
      session: null,
      audience: "FRIENDS",
      subjectType: "PLACE",
      demoOutcome: "verified",
      lastTick: 0,
    });
  },
}));
