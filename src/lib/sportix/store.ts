import { create } from "zustand";
import { toast } from "sonner";
import {
  comments as seedComments,
  initialFriendships,
  matches as seedMatches,
  messages as seedMessages,
  posts as seedPosts,
  threads as seedThreads,
  users,
  VIEWER_ID,
} from "./mock";
import { seedTransactions } from "./mock-sponsors";
import {
  derivePostSponsor,
  extraSponsorCount,
  STAR_TIERS,
  type EligibilityState,
  type SponsorTransaction,
  type StarTierId,
} from "./stars";
import type {
  ChatMessage,
  CommentItem,
  CommunityPost,
  FriendshipState,
  GroupType,
  Screen,
  Sheet,
  SportMatch,
  TabId,
  Thread,
} from "./types";

let seq = 100;

function nid(prefix: string) {
  seq += 1;
  return `${prefix}-${seq}`;
}

export interface SportixStore {
  viewerId: string;
  tab: TabId;
  stack: Screen[];
  sheet: Sheet | null;
  toastMessage: string | null;
  posts: CommunityPost[];
  comments: CommentItem[];
  friendships: Record<string, FriendshipState>;
  muted: Record<string, boolean>;
  blocked: Record<string, boolean>;
  matches: SportMatch[];
  threads: Thread[];
  messages: ChatMessage[];
  achievementFilter: "latest" | "top" | "friends" | "sport" | "zone";
  matchFilter: "upcoming" | "live" | "completed";
  peopleQuery: string;
  dmQuery: string;
  setTab: (tab: TabId) => void;
  push: (screen: Screen) => void;
  pop: () => void;
  closeAll: () => void;
  openSheet: (sheet: Sheet) => void;
  closeSheet: () => void;
  flash: (message: string) => void;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  toggleCommentLike: (commentId: string) => void;
  repost: (postId: string, comment?: string) => void;
  requestFriend: (userId: string) => void;
  acceptFriend: (userId: string) => void;
  cancelRequest: (userId: string) => void;
  muteUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  transactions: SponsorTransaction[];
  completeSponsorship: (input: {
    postId?: string;
    athleteId: string;
    scope: "post" | "athlete";
    tierId: StarTierId;
    outcome: "success" | "failed";
  }) => SponsorTransaction | null;
  canSponsor: (userId: string, postId?: string) => { ok: boolean; reason?: string };
  openProfile: (userId: string) => void;
  openMessages: () => void;
  openOrCreateDm: (userId: string) => void;
  sendMessage: (threadId: string, text: string) => void;
  createGroup: (input: {
    name: string;
    type: GroupType;
    memberIds: string[];
    matchId?: string;
  }) => void;
  createMatchGroup: (matchId: string) => void;
  setAchievementFilter: (f: SportixStore["achievementFilter"]) => void;
  setMatchFilter: (f: SportixStore["matchFilter"]) => void;
  setPeopleQuery: (q: string) => void;
  setDmQuery: (q: string) => void;
  publishGoPost: (post: CommunityPost) => void;
  removeGoPosts: () => void;
  removeWeeklyPosts: () => void;
}

function notify(message: string) {
  toast(message, { duration: 2200 });
}

function eligibilityFor(post: CommunityPost): EligibilityState {
  const author = users[post.authorId];
  if (author?.ageRestricted || author?.messagePolicy === "restricted") return "restricted";
  if (post.verification === "pending" || post.verification === "insufficient") return "limited";
  return "eligible";
}

function withDerivedSponsors(posts: CommunityPost[], txs: SponsorTransaction[]): CommunityPost[] {
  return posts.map((p) => {
    const st = derivePostSponsor(p.id, txs, eligibilityFor(p));
    return {
      ...p,
      sponsor: {
        topSponsorId: st.top_sponsor_user_id,
        extraCount: extraSponsorCount(st),
        topSponsorTier: st.top_sponsor_tier,
        sponsorMomentum: st.sponsor_momentum,
        visibilityEligibility: st.visibility_eligibility,
        sponsorCount: st.sponsor_count,
      },
    };
  });
}

export const useSportix = create<SportixStore>((set, get) => ({
  viewerId: VIEWER_ID,
  tab: "feed",
  stack: [],
  sheet: null,
  toastMessage: null,
  posts: withDerivedSponsors(
    seedPosts.map((p) => ({ ...p, engagement: { ...p.engagement } })),
    seedTransactions,
  ),
  comments: seedComments.map((c) => ({ ...c })),
  friendships: { ...initialFriendships },
  muted: {},
  blocked: {},
  matches: seedMatches.map((m) => ({ ...m })),
  threads: seedThreads.map((t) => ({ ...t })),
  messages: seedMessages.map((m) => ({ ...m })),
  transactions: seedTransactions.map((t) => ({ ...t })),
  achievementFilter: "latest",
  matchFilter: "live",
  peopleQuery: "",
  dmQuery: "",

  setTab: (tab) => set({ tab, stack: [] }),
  push: (screen) => set((s) => ({ stack: [...s.stack, screen], sheet: null })),
  pop: () => set((s) => ({ stack: s.stack.slice(0, -1) })),
  closeAll: () => set({ stack: [], sheet: null }),
  openSheet: (sheet) => set({ sheet }),
  closeSheet: () => set({ sheet: null }),
  flash: (message) => notify(message),

  toggleLike: (postId) =>
    set((s) => ({
      posts: s.posts.map((p) => {
        if (p.id !== postId) return p;
        const liked = !p.liked;
        const likedBy = liked
          ? [VIEWER_ID, ...p.engagement.likedBy.filter((id) => id !== VIEWER_ID)]
          : p.engagement.likedBy.filter((id) => id !== VIEWER_ID);
        return {
          ...p,
          liked,
          engagement: {
            ...p.engagement,
            likedBy,
            likeCount: p.engagement.likeCount + (liked ? 1 : -1),
          },
        };
      }),
    })),

  toggleSave: (postId) => {
    const post = get().posts.find((p) => p.id === postId);
    const next = !post?.saved;
    set((s) => ({
      posts: s.posts.map((p) => (p.id === postId ? { ...p, saved: !p.saved } : p)),
    }));
    notify(next ? "Saved" : "Removed from saved");
  },

  addComment: (postId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const item: CommentItem = {
      id: nid("c"),
      postId,
      authorId: VIEWER_ID,
      text: trimmed,
      createdAt: "now",
      likes: 0,
      liked: false,
    };
    set((s) => ({
      comments: [...s.comments, item],
      posts: s.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              engagement: { ...p.engagement, commentCount: p.engagement.commentCount + 1 },
            }
          : p,
      ),
    }));
  },

  toggleCommentLike: (commentId) =>
    set((s) => ({
      comments: s.comments.map((c) =>
        c.id === commentId
          ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) }
          : c,
      ),
    })),

  repost: (postId, comment) => {
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              reposted: true,
              engagement: { ...p.engagement, repostCount: p.engagement.repostCount + 1 },
            }
          : p,
      ),
      sheet: null,
    }));
    notify(comment?.trim() ? "Reposted with comment" : "Reposted");
  },

  requestFriend: (userId) => {
    const current = get().friendships[userId];
    if (current === "friends" || current === "requested") return;
    if (current === "incoming") {
      get().acceptFriend(userId);
      return;
    }
    set((s) => ({ friendships: { ...s.friendships, [userId]: "requested" } }));
    notify("Request sent");
    window.setTimeout(() => {
      const state = get().friendships[userId];
      if (state !== "requested") return;
      set((s) => ({ friendships: { ...s.friendships, [userId]: "friends" } }));
      const name = users[userId]?.displayName ?? "They";
      notify(`${name} accepted your request`);
    }, 1600);
  },

  acceptFriend: (userId) => {
    set((s) => ({ friendships: { ...s.friendships, [userId]: "friends" } }));
    notify("You are now friends");
  },

  cancelRequest: (userId) => {
    set((s) => ({ friendships: { ...s.friendships, [userId]: "none" } }));
  },

  muteUser: (userId) => {
    set((s) => ({ muted: { ...s.muted, [userId]: true }, sheet: null }));
    notify("User muted");
  },

  blockUser: (userId) => {
    set((s) => ({ blocked: { ...s.blocked, [userId]: true }, sheet: null }));
    notify("User blocked");
  },

  canSponsor: (userId, postId) => {
    const user = users[userId];
    if (user?.ageRestricted || user?.messagePolicy === "restricted") {
      return { ok: false, reason: "SPORTIX SPONSOR is restricted for this account" };
    }
    if (get().blocked[userId]) {
      return { ok: false, reason: "This account is blocked" };
    }
    if (postId) {
      const post = get().posts.find((p) => p.id === postId);
      if (post?.sponsor.visibilityEligibility === "restricted") {
        return { ok: false, reason: "This content is not eligible for SPORTIX SPONSOR" };
      }
    }
    return { ok: true };
  },

  completeSponsorship: ({ postId, athleteId, scope, tierId, outcome }) => {
    const gate = get().canSponsor(athleteId, postId);
    if (!gate.ok) {
      notify(gate.reason ?? "Not eligible");
      return null;
    }
    const tier = STAR_TIERS[tierId];
    const record: SponsorTransaction = {
      sponsor_transaction_id: nid("tx"),
      sponsor_user_id: VIEWER_ID,
      recipient_user_id: athleteId,
      post_id: postId ?? null,
      scope,
      tier_id: tier.tier_id,
      gross_amount_sar: tier.gross_amount_sar,
      sportix_allocation_sar: tier.sportix_allocation_sar,
      creator_allocation_sar: tier.creator_allocation_sar,
      payment_state: outcome === "success" ? "completed" : "failed",
      created_at: new Date().toISOString(),
      audit_ref: nid("aud"),
    };
    set((s) => {
      const transactions = [...s.transactions, record];
      return {
        transactions,
        posts: withDerivedSponsors(s.posts, transactions),
      };
    });
    return record;
  },

  openProfile: (userId) => {
    get().push({ type: "profile", userId });
  },

  openMessages: () => {
    get().push({ type: "messages" });
  },

  openOrCreateDm: (userId) => {
    const user = users[userId];
    const friend = get().friendships[userId] === "friends" || userId === VIEWER_ID;
    if (user?.ageRestricted || user?.messagePolicy === "restricted") {
      notify("Messaging is restricted for this account");
      return;
    }
    if (!friend) {
      notify("Message after you become friends");
      return;
    }
    const existing = get().threads.find(
      (t) => t.kind === "dm" && t.memberIds.includes(userId) && t.memberIds.includes(VIEWER_ID),
    );
    if (existing) {
      get().push({ type: "chat", threadId: existing.id });
      return;
    }
    const thread: Thread = {
      id: nid("thread"),
      kind: "dm",
      title: user?.displayName ?? "Chat",
      memberIds: [VIEWER_ID, userId],
      lastMessage: "New conversation",
      lastAt: "now",
      unread: 0,
      avatar: user?.avatar,
    };
    set((s) => ({ threads: [thread, ...s.threads] }));
    get().push({ type: "chat", threadId: thread.id });
  },

  sendMessage: (threadId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const msg: ChatMessage = {
      id: nid("m"),
      threadId,
      authorId: VIEWER_ID,
      text: trimmed,
      at: "now",
    };
    set((s) => ({
      messages: [...s.messages, msg],
      threads: s.threads.map((t) =>
        t.id === threadId ? { ...t, lastMessage: trimmed, lastAt: "now", unread: 0 } : t,
      ),
    }));
  },

  createGroup: ({ name, type, memberIds, matchId }) => {
    const thread: Thread = {
      id: nid("thread"),
      kind: "group",
      groupType: type,
      title: name.trim() || "New group",
      memberIds: [VIEWER_ID, ...memberIds.filter((id) => id !== VIEWER_ID)],
      lastMessage: "Group created",
      lastAt: "now",
      unread: 0,
      matchId,
    };
    set((s) => ({
      threads: [thread, ...s.threads],
      matches: matchId
        ? s.matches.map((m) => (m.id === matchId ? { ...m, matchGroupId: thread.id } : m))
        : s.matches,
      stack: [
        ...s.stack.filter((sc) => sc.type !== "group-create"),
        { type: "chat", threadId: thread.id },
      ],
    }));
    notify("Group created");
  },

  createMatchGroup: (matchId) => {
    const match = get().matches.find((m) => m.id === matchId);
    if (!match) return;
    if (match.matchGroupId) {
      get().push({ type: "chat", threadId: match.matchGroupId });
      return;
    }
    get().createGroup({
      name: `${match.title} · Match Group`,
      type: "match",
      memberIds: match.acceptedIds,
      matchId,
    });
  },

  setAchievementFilter: (achievementFilter) => set({ achievementFilter }),
  setMatchFilter: (matchFilter) => set({ matchFilter }),
  setPeopleQuery: (peopleQuery) => set({ peopleQuery }),
  setDmQuery: (dmQuery) => set({ dmQuery }),

  publishGoPost: (post) =>
    set((s) => ({
      posts: withDerivedSponsors([post, ...s.posts.filter((p) => p.id !== post.id)], s.transactions),
    })),

  removeGoPosts: () =>
    set((s) => ({
      posts: s.posts.filter((p) => !p.id.startsWith("post-go-") && !p.goEvidence),
    })),

  removeWeeklyPosts: () =>
    set((s) => ({
      posts: s.posts.filter((p) => !p.id.startsWith("post-wl-")),
    })),
}));

export function useViewer() {
  return users[VIEWER_ID]!;
}
