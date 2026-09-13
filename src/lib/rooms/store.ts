import { create } from "zustand";
import { VIEWER_ID } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import type { CommunityPost } from "@/lib/sportix/types";
import { useSportId } from "@/lib/sport-id/store";
import { useWeekly } from "@/lib/weekly-legends/store";
import { useShell } from "@/lib/shell/store";

export type RoomSport = "Football" | "Padel" | "Running" | "Walking" | "Gym";
export type RoomPrivacy = "PUBLIC" | "FRIENDS" | "INVITE ONLY";
export type RoomState =
  | "DRAFT"
  | "OPEN"
  | "JOINING"
  | "FULL"
  | "CONFIRMING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED"
  | "REVIEW";

export type ProviderState = "ready" | "timeout" | "unavailable" | "booking-failed";

export interface MatchRoom {
  id: string;
  sport: RoomSport;
  title: string;
  hostId: string;
  level: string;
  seats: number;
  taken: number;
  timeLabel: string;
  place: string;
  privacy: RoomPrivacy;
  state: RoomState;
  waitlist: string[];
  joinRequests: string[];
  members: string[];
  gender?: string;
  age?: string;
  price?: string;
  rules?: string;
  confirmationEndsAt: number | null;
  venueName: string;
  mapsUrl: string;
  bookingUrl?: string;
  providerState: ProviderState;
  why: string;
  viewerIn: boolean;
  edge?: string;
}

export type RoomScreen = "list" | "create" | "detail" | "post-match" | "edge";

export interface RoomsStore {
  rooms: MatchRoom[];
  sportFilter: RoomSport | "ALL";
  screen: RoomScreen;
  selectedId: string | null;
  createStep: number;
  draft: Partial<MatchRoom>;
  postMatch: {
    attendance: "present" | "no-show" | null;
    outcome: string;
    peer: { sportsmanship: number; reliability: number; team: number };
    done: boolean;
  };
  setSportFilter: (s: RoomsStore["sportFilter"]) => void;
  openList: () => void;
  openCreate: () => void;
  openRoom: (id: string) => void;
  setCreateStep: (n: number) => void;
  patchDraft: (p: Partial<MatchRoom>) => void;
  createRoom: () => void;
  join: (id: string) => void;
  leave: (id: string) => void;
  requestJoin: (id: string) => void;
  confirm: (id: string) => void;
  startPlay: (id: string) => void;
  complete: (id: string) => void;
  applyEdge: (id: string, edge: string) => void;
  setAttendance: (v: "present" | "no-show") => void;
  setOutcome: (v: string) => void;
  setPeer: (k: keyof RoomsStore["postMatch"]["peer"], n: number) => void;
  finishPostMatch: () => void;
}

const nowPlus = (min: number) => Date.now() + min * 60_000;

const seedRooms: MatchRoom[] = [
  {
    id: "room-corniche",
    sport: "Football",
    title: "Corniche 5-a-side",
    hostId: "faisal",
    level: "Intermediate",
    seats: 10,
    taken: 8,
    timeLabel: "Today · 19:30",
    place: "Corniche pitch · Jeddah",
    privacy: "PUBLIC",
    state: "OPEN",
    waitlist: [],
    joinRequests: [],
    members: ["faisal", "ahmed", "abdullah"],
    confirmationEndsAt: null,
    venueName: "Corniche 5-a-side",
    mapsUrl: "https://maps.google.com/?q=Jeddah+Corniche",
    providerState: "ready",
    why: "Level match · 2 seats · your usual zone · friends in the room",
    viewerIn: false,
  },
  {
    id: "room-padel",
    sport: "Padel",
    title: "Al Rawdah social padel",
    hostId: "nora",
    level: "Social",
    seats: 4,
    taken: 4,
    timeLabel: "Tomorrow · 21:00",
    place: "Al Rawdah courts",
    privacy: "FRIENDS",
    state: "FULL",
    waitlist: ["sara"],
    joinRequests: [],
    members: ["nora", "layla", "maya", "sara"],
    confirmationEndsAt: null,
    venueName: "Al Rawdah Padel",
    mapsUrl: "https://maps.google.com/?q=Al+Rawdah+Jeddah",
    bookingUrl: "https://example.com/book",
    providerState: "ready",
    why: "Friends-only padel at your preferred evening window",
    viewerIn: false,
  },
  {
    id: "room-run",
    sport: "Running",
    title: "Easy 8K group run",
    hostId: "sara",
    level: "Easy",
    seats: 20,
    taken: 11,
    timeLabel: "Fri · 06:30",
    place: "Corniche north",
    privacy: "PUBLIC",
    state: "CONFIRMING",
    waitlist: [],
    joinRequests: [],
    members: ["sara", "yousef"],
    confirmationEndsAt: nowPlus(18),
    venueName: "Corniche north gate",
    mapsUrl: "https://maps.google.com/?q=Jeddah+Corniche",
    providerState: "ready",
    why: "Pace overlap with your last verified run",
    viewerIn: true,
  },
];

let seq = 20;
function nid(p: string) {
  seq += 1;
  return `${p}-${seq}`;
}

export const useRooms = create<RoomsStore>((set, get) => ({
  rooms: seedRooms,
  sportFilter: "ALL",
  screen: "list",
  selectedId: null,
  createStep: 1,
  draft: { sport: "Football", privacy: "PUBLIC", seats: 10, level: "Intermediate" },
  postMatch: {
    attendance: null,
    outcome: "",
    peer: { sportsmanship: 8, reliability: 8, team: 8 },
    done: false,
  },

  setSportFilter: (sportFilter) => set({ sportFilter }),
  openList: () => set({ screen: "list", selectedId: null }),
  openCreate: () => set({ screen: "create", createStep: 1 }),
  openRoom: (id) => set({ screen: "detail", selectedId: id }),
  setCreateStep: (createStep) => set({ createStep }),
  patchDraft: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),

  createRoom: () => {
    const d = get().draft;
    const room: MatchRoom = {
      id: nid("room"),
      sport: (d.sport as RoomSport) ?? "Football",
      title: d.title || "New match",
      hostId: VIEWER_ID,
      level: d.level || "Open",
      seats: d.seats || 10,
      taken: 1,
      timeLabel: d.timeLabel || "Tonight",
      place: d.place || "Jeddah",
      privacy: (d.privacy as RoomPrivacy) ?? "PUBLIC",
      state: "OPEN",
      waitlist: [],
      joinRequests: [],
      members: [VIEWER_ID],
      gender: d.gender,
      age: d.age,
      price: d.price,
      rules: d.rules,
      confirmationEndsAt: null,
      venueName: d.place || "Jeddah",
      mapsUrl: "https://maps.google.com/?q=Jeddah",
      providerState: "ready",
      why: "You created this room",
      viewerIn: true,
    };
    set((s) => ({ rooms: [room, ...s.rooms], selectedId: room.id, screen: "detail" }));
    useShell.getState().notify({
      category: "room",
      title: "Room created",
      body: room.title,
      href: "/go-sportix",
      payload: { room: room.id },
    });
  },

  join: (id) =>
    set((s) => ({
      rooms: s.rooms.map((r) => {
        if (r.id !== id) return r;
        if (r.state === "FULL") {
          return { ...r, waitlist: r.waitlist.includes(VIEWER_ID) ? r.waitlist : [...r.waitlist, VIEWER_ID] };
        }
        const taken = Math.min(r.seats, r.taken + 1);
        return {
          ...r,
          taken,
          viewerIn: true,
          members: r.members.includes(VIEWER_ID) ? r.members : [...r.members, VIEWER_ID],
          state: taken >= r.seats ? "FULL" : "JOINING",
        };
      }),
      selectedId: id,
      screen: "detail",
    })),

  leave: (id) =>
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === id
          ? { ...r, viewerIn: false, taken: Math.max(0, r.taken - 1), state: r.state === "FULL" ? "OPEN" : r.state }
          : r,
      ),
    })),

  requestJoin: (id) =>
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === id
          ? { ...r, joinRequests: r.joinRequests.includes(VIEWER_ID) ? r.joinRequests : [...r.joinRequests, VIEWER_ID] }
          : r,
      ),
    })),

  confirm: (id) =>
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === id ? { ...r, state: "CONFIRMED", confirmationEndsAt: null } : r,
      ),
    })),

  startPlay: (id) =>
    set((s) => ({
      rooms: s.rooms.map((r) => (r.id === id ? { ...r, state: "IN_PROGRESS" } : r)),
    })),

  complete: (id) => {
    set((s) => ({
      rooms: s.rooms.map((r) => (r.id === id ? { ...r, state: "COMPLETED" } : r)),
      screen: "post-match",
      selectedId: id,
      postMatch: { attendance: null, outcome: "", peer: { sportsmanship: 8, reliability: 8, team: 8 }, done: false },
    }));
  },

  applyEdge: (id, edge) => {
    set((s) => ({
      selectedId: id,
      screen: "edge",
      rooms: s.rooms.map((r) => {
        if (r.id !== id) return r;
        if (edge === "player-cancel") return { ...r, viewerIn: false, taken: Math.max(0, r.taken - 1), state: "OPEN", edge };
        if (edge === "host-cancel") return { ...r, state: "CANCELLED", edge };
        if (edge === "no-show") return { ...r, state: "DISPUTED", edge };
        if (edge === "waitlist") {
          const next = r.waitlist[0];
          return {
            ...r,
            state: "OPEN",
            taken: Math.min(r.seats, r.taken + (next ? 1 : 0)),
            waitlist: r.waitlist.slice(1),
            members: next ? [...r.members, next] : r.members,
            edge,
          };
        }
        if (edge === "venue") return { ...r, providerState: "unavailable", state: "REVIEW", edge };
        if (edge === "timeout") return { ...r, providerState: "timeout", state: "REVIEW", edge };
        if (edge === "booking") return { ...r, providerState: "booking-failed", state: "REVIEW", edge };
        if (edge === "attendance") return { ...r, state: "DISPUTED", edge };
        if (edge === "outcome") return { ...r, state: "DISPUTED", edge };
        if (edge === "verify-review") return { ...r, state: "REVIEW", edge };
        return { ...r, edge };
      }),
    }));
    useShell.getState().notify({
      category: "room",
      title: "Room update",
      body: edge.replace("-", " "),
      href: "/go-sportix",
      payload: { room: id },
    });
  },

  setAttendance: (attendance) => set((s) => ({ postMatch: { ...s.postMatch, attendance } })),
  setOutcome: (outcome) => set((s) => ({ postMatch: { ...s.postMatch, outcome } })),
  setPeer: (k, n) => set((s) => ({ postMatch: { ...s.postMatch, peer: { ...s.postMatch.peer, [k]: n } } })),

  finishPostMatch: () => {
    const { selectedId, rooms, postMatch } = get();
    const room = rooms.find((r) => r.id === selectedId);
    if (!room || postMatch.attendance !== "present") {
      set((s) => ({ postMatch: { ...s.postMatch, done: true }, screen: "detail" }));
      return;
    }
    const post: CommunityPost = {
      id: `post-wl-match-${room.id}`,
      authorId: VIEWER_ID,
      kind: "match",
      createdAt: "now",
      context: `${room.sport} · ${room.place}`,
      media: { src: "/media/football-match.jpg", alt: "Verified match" },
      caption: `SPORTIX VERIFIED MATCH · ${room.title}`,
      verification: "verified",
      match: {
        matchId: room.id,
        title: room.title,
        home: "Yousef N.",
        away: "Room",
        score: postMatch.outcome || "Played",
        venue: room.place,
        when: room.timeLabel,
        state: "completed",
      },
      engagement: { likeCount: 0, commentCount: 0, repostCount: 0, likedBy: [] },
      sponsor: { topSponsorId: null, extraCount: 0 },
      liked: false,
      saved: false,
      reposted: false,
    };
    useSportix.getState().publishGoPost(post);
    useWeekly.getState().applyVerifiedActivity({ sessionId: `match-${room.id}`, activity: "running" });
    useSportId.getState().recordWeeklyLegacy({
      id: `match-${room.id}`,
      week: useWeekly.getState().week,
      title: `Verified match · ${room.title}`,
      context: room.place,
      rank: 0,
      ssp: 0,
      sportLabel: room.sport,
      dateLabel: room.timeLabel,
    });
    useShell.getState().notify({
      category: "verification",
      title: "Match verified",
      body: room.title,
      href: "/communities",
    });
    set((s) => ({
      postMatch: { ...s.postMatch, done: true },
      rooms: s.rooms.map((r) => (r.id === room.id ? { ...r, state: "COMPLETED" } : r)),
      screen: "detail",
    }));
  },
}));
