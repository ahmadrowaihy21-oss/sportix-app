import { ChevronRight, MapPin, Trophy, Users } from "lucide-react";
import { recommendedUserIds, users, VIEWER_ID } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { FriendControl } from "./UserHeader";
import { MatchCard } from "./MatchCard";
import { MostSponsoredSection } from "./sponsor/MostSponsoredSection";
import { SportIcon } from "./SportIcon";
import { UserAvatar } from "./UserAvatar";
import { VerificationBadge } from "./VerificationBadge";
import { VerifiedMark } from "./VerificationBadge";

export function DiscoverTab() {
  const posts = useSportix((s) => s.posts);
  const matches = useSportix((s) => s.matches);
  const openProfile = useSportix((s) => s.openProfile);
  const push = useSportix((s) => s.push);
  const setTab = useSportix((s) => s.setTab);
  const viewer = users[VIEWER_ID]!;
  const trending = posts.filter((p) => p.kind === "achievement" || p.id === "post-run");
  const suggested = matches.filter((m) => m.state !== "completed");

  return (
    <div className="space-y-7 px-4 py-4 pb-10">
      <MostSponsoredSection />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recommended athletes</h2>
          <button type="button" onClick={() => setTab("people")} className="text-2xs text-muted">
            See all
          </button>
        </div>
        <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1">
          {recommendedUserIds.map((id) => {
            const u = users[id];
            if (!u) return null;
            return (
              <article
                key={id}
                className="w-40 shrink-0 rounded-xl border border-border bg-surface p-3"
              >
                <button type="button" onClick={() => openProfile(id)} className="w-full text-left">
                  <UserAvatar userId={id} size="lg" />
                  <p className="mt-2 flex items-center gap-1 text-xs font-semibold">
                    <span className="truncate">{u.displayName}</span>
                    {u.verified ? <VerifiedMark className="size-3" /> : null}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-2xs text-muted">
                    <SportIcon sport={u.sport} />
                    {u.sport}
                  </p>
                  <p className="flex items-center gap-1 text-2xs text-muted">
                    <MapPin className="size-3" />
                    {u.zone}
                  </p>
                  {u.mutualCount > 0 ? (
                    <p className="mt-1 text-2xs text-faint">{u.mutualCount} mutuals</p>
                  ) : (
                    <p className="mt-1 text-2xs text-faint">Same sport relevance</p>
                  )}
                </button>
                <div className="mt-2">
                  <FriendControl userId={id} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Trending verified achievements</h2>
        <div className="space-y-2">
          {trending.map((p) => {
            const u = users[p.authorId];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => openProfile(p.authorId)}
                className="flex w-full gap-3 overflow-hidden rounded-xl border border-border bg-surface text-left"
              >
                <img src={p.media.src} alt="" className="h-20 w-24 object-cover" />
                <div className="min-w-0 flex-1 py-2 pr-3">
                  <p className="truncate text-xs font-semibold">
                    {p.achievement?.title ?? p.performance?.headline}
                  </p>
                  <p className="mt-0.5 truncate text-2xs text-muted">{u?.displayName}</p>
                  <div className="mt-1 flex items-center gap-2 text-2xs text-muted">
                    <VerificationBadge state="verified" compact />
                    {typeof p.achievement?.weeklyRank === "number" ||
                    typeof p.performance?.weeklyRank === "number" ? (
                      <span className="inline-flex items-center gap-1">
                        <Trophy className="size-3" />
                        #{p.achievement?.weeklyRank ?? p.performance?.weeklyRank}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Sports communities</h2>
        <div className="space-y-2">
          {[
            { name: "Jeddah Football", members: "2.4k", sport: "Football" as const },
            { name: "Corniche Runners", members: "860", sport: "Running" as const },
            { name: "Riyadh Strength", members: "1.1k", sport: "Gym" as const },
          ].map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-elevated text-lime">
                <SportIcon sport={c.sport} className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="flex items-center gap-1 text-2xs text-muted">
                  <Users className="size-3" />
                  {c.members} · {viewer.zone}
                </p>
              </div>
              <ChevronRight className="size-4 text-faint" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Suggested activities</h2>
        <div className="space-y-3">
          {suggested.map((m) => (
            <MatchCard key={m.id} match={m} onOpen={() => push({ type: "match", matchId: m.id })} />
          ))}
        </div>
      </section>
    </div>
  );
}
