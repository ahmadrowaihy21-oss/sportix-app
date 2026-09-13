import { MapPin, Trophy } from "lucide-react";
import { users, VIEWER_ID } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";
import { VerificationBadge } from "./VerificationBadge";
import { SportIcon } from "./SportIcon";

const filters = [
  { id: "latest", label: "Latest" },
  { id: "top", label: "Top" },
  { id: "friends", label: "Friends" },
  { id: "sport", label: "My Sport" },
  { id: "zone", label: "My Zone" },
] as const;

export function AchievementsTab() {
  const posts = useSportix((s) => s.posts);
  const friendships = useSportix((s) => s.friendships);
  const filter = useSportix((s) => s.achievementFilter);
  const setFilter = useSportix((s) => s.setAchievementFilter);
  const openProfile = useSportix((s) => s.openProfile);
  const viewer = users[VIEWER_ID]!;

  let list = posts.filter((p) => p.kind === "achievement" && p.verification === "verified");
  if (list.length === 0) {
    list = posts.filter((p) => p.verification === "verified" && p.kind !== "social");
  }
  if (filter === "friends") {
    list = list.filter((p) => friendships[p.authorId] === "friends" || p.authorId === VIEWER_ID);
  }
  if (filter === "sport") {
    list = list.filter((p) => users[p.authorId]?.sport === viewer.sport);
  }
  if (filter === "zone") {
    list = list.filter((p) => users[p.authorId]?.zone === viewer.zone);
  }
  if (filter === "top") {
    list = [...list].sort((a, b) => b.engagement.likeCount - a.engagement.likeCount);
  }

  return (
    <div>
      <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "h-8 shrink-0 rounded-full px-3 text-2xs font-medium",
              filter === f.id ? "bg-lime text-lime-fg" : "bg-elevated text-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ul className="space-y-3 px-4 pb-8">
        {list.map((post) => {
          const u = users[post.authorId];
          const a = post.achievement;
          return (
            <li key={post.id}>
              <button
                type="button"
                onClick={() => openProfile(post.authorId)}
                className="w-full overflow-hidden rounded-xl border border-border bg-surface text-left"
              >
                <div className="relative">
                  <img src={post.media.src} alt={post.media.alt} className="h-36 w-full object-cover" />
                  <div className="absolute inset-0 bg-linear-to-t from-bg via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="font-display text-2xl leading-none tracking-tight">
                      {a?.title ?? post.performance?.headline}
                    </p>
                    <div className="mt-1">
                      <VerificationBadge state="verified" compact />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-3">
                  <UserAvatar userId={post.authorId} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{u?.displayName}</p>
                    <p className="flex items-center gap-1 text-2xs text-muted">
                      <SportIcon sport={u?.sport ?? "Football"} className="size-3" />
                      {u?.sport}
                    </p>
                  </div>
                  <div className="text-right text-2xs text-muted">
                    {typeof (a?.spAi ?? post.performance?.spAi) === "number" ? (
                      <p className="text-lime">+{a?.spAi ?? post.performance?.spAi} SP AI</p>
                    ) : null}
                    {typeof (a?.weeklyRank ?? post.performance?.weeklyRank) === "number" ? (
                      <p className="inline-flex items-center gap-1">
                        <Trophy className="size-3" />#{a?.weeklyRank ?? post.performance?.weeklyRank}
                      </p>
                    ) : null}
                    {u?.zone ? (
                      <p className="inline-flex items-center gap-1">
                        <MapPin className="size-3" />
                        {u.zone}
                      </p>
                    ) : null}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
