import { MessageCircle, ShieldAlert } from "lucide-react";
import { users, VIEWER_ID } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { asAthleteIndicator, deriveAthleteSponsor } from "@/lib/sportix/stars";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "./ScreenHeader";
import { FriendControl } from "./UserHeader";
import { CommunityPostCard } from "./CommunityPost";
import { SportIcon } from "./SportIcon";
import { SportixSponsorButton } from "./sponsor/SportixSponsorButton";
import { TopSponsorIndicator } from "./sponsor/TopSponsorIndicator";
import { UserAvatar } from "./UserAvatar";
import { VerifiedMark } from "./VerificationBadge";

export function UserProfile({ userId }: { userId: string }) {
  const user = users[userId];
  const pop = useSportix((s) => s.pop);
  const push = useSportix((s) => s.push);
  const openSheet = useSportix((s) => s.openSheet);
  const openOrCreateDm = useSportix((s) => s.openOrCreateDm);
  const friendship = useSportix((s) => s.friendships[userId] ?? "none");
  const allPosts = useSportix((s) => s.posts);
  const txs = useSportix((s) => s.transactions);
  const posts = allPosts.filter((p) => p.authorId === userId);
  if (!user) return null;

  const isSelf = userId === VIEWER_ID;
  const canMessage =
    !user.ageRestricted &&
    user.messagePolicy !== "restricted" &&
    (isSelf || friendship === "friends");
  const athleteSponsor = asAthleteIndicator(deriveAthleteSponsor(userId, txs));

  const stats = [
    { label: "Verified Achievements", value: String(user.achievementCount) },
    { label: "SP AI", value: user.spAi.toLocaleString() },
    { label: "SSP AI", value: user.sspAi.toLocaleString() },
    { label: "Weekly Rank", value: user.weeklyRank ? `#${user.weeklyRank}` : "—" },
    { label: "Zone Rank", value: user.zoneRank ? `#${user.zoneRank}` : "—" },
    {
      label: "Friends",
      value: user.friendCount.toString(),
      hint: user.mutualCount ? `${user.mutualCount} mutuals` : undefined,
    },
  ];

  return (
    <div>
      <ScreenHeader
        title="Profile"
        onBack={pop}
        right={
          <button
            type="button"
            className="px-3 text-2xs text-muted"
            onClick={() => openSheet({ type: "overflow", userId })}
          >
            Safety
          </button>
        }
      />
      <div className="px-4 pt-5">
        <UserAvatar userId={userId} size="xl" />
        <h2 className="mt-3 flex items-center gap-1.5 text-xl font-semibold">
          {user.displayName}
          {user.verified ? <VerifiedMark /> : null}
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <SportIcon sport={user.sport} />
          {user.sport}
          <span aria-hidden="true">·</span>
          {user.city}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{user.bio}</p>
        {user.ageRestricted ? (
          <p className="mt-3 flex items-start gap-2 rounded-md bg-elevated px-3 py-2 text-2xs text-muted">
            <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-warn" />
            Age-restricted account. Direct messages and SPORTIX SPONSOR are limited by policy.
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {!isSelf ? <FriendControl userId={userId} /> : null}
          <Button
            variant={canMessage ? "outline" : "muted"}
            size="sm"
            className="h-8"
            disabled={!canMessage}
            onClick={() => openOrCreateDm(userId)}
            aria-label={canMessage ? "Message" : "Message disabled until friends"}
          >
            <MessageCircle className="size-3.5" />
            {canMessage ? "Message" : "Message locked"}
          </Button>
          {!isSelf ? (
            <SportixSponsorButton
              compact
              onClick={() => openSheet({ type: "athlete-sponsor", userId })}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-px bg-border">
        {stats.map((s) => (
          <div key={s.label} className="bg-bg px-3 py-3">
            <p className="font-display text-xl leading-none tabular">{s.value}</p>
            <p className="mt-1 text-2xs text-muted">{s.label}</p>
            {s.hint ? <p className="text-3xs text-faint">{s.hint}</p> : null}
          </div>
        ))}
      </div>

      <div className="mt-2 border-y border-border">
        <TopSponsorIndicator
          sponsor={athleteSponsor}
          scope="athlete"
          onClick={() => openSheet({ type: "athlete-sponsor", userId })}
          onHistory={() => push({ type: "sponsor-history", userId })}
        />
        {isSelf ? (
          <button
            type="button"
            onClick={() => push({ type: "creator-earnings", userId })}
            className="w-full px-4 pb-2.5 text-left text-2xs text-muted hover:text-fg"
          >
            Creator allocation · not SP AI / SSP AI
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => push({ type: "sport-id", userId })}
        className="flex h-12 w-full items-center justify-between px-4 text-sm font-medium hover:bg-elevated"
      >
        View SPORT ID
        <span className="text-2xs text-muted">Identity + proof</span>
      </button>

      <h3 className="px-4 pb-2 pt-5 text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
        Community posts
      </h3>
      {posts.length === 0 ? (
        <p className="px-4 pb-8 text-sm text-muted">No posts yet.</p>
      ) : (
        posts.map((p) => <CommunityPostCard key={p.id} post={p} />)
      )}
    </div>
  );
}
