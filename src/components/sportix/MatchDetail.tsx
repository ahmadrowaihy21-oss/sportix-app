import { users } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "./ScreenHeader";
import { UserAvatar } from "./UserAvatar";
import { VerificationBadge } from "./VerificationBadge";
import { CommunityPostCard } from "./CommunityPost";

export function MatchDetail({ matchId }: { matchId: string }) {
  const match = useSportix((s) => s.matches.find((m) => m.id === matchId));
  const posts = useSportix((s) => s.posts);
  const pop = useSportix((s) => s.pop);
  const push = useSportix((s) => s.push);
  const createMatchGroup = useSportix((s) => s.createMatchGroup);
  const openProfile = useSportix((s) => s.openProfile);
  if (!match) {
    return (
      <div>
        <ScreenHeader title="Match" onBack={pop} />
        <p className="p-6 text-sm text-muted">Match not found.</p>
      </div>
    );
  }
  const related = posts.filter((p) => match.relatedPostIds.includes(p.id));

  return (
    <div>
      <ScreenHeader title={match.title} subtitle={match.venue} onBack={pop} />
      <img src={match.media} alt="" className="aspect-video w-full object-cover" />
      <div className="px-4 py-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xs uppercase tracking-[0.16em] text-muted">{match.state}</p>
            <p className="mt-1 text-lg font-semibold">
              {match.home} vs {match.away}
            </p>
            <p className="text-sm text-muted">
              {match.when} · {match.venue}
            </p>
          </div>
          {match.score ? (
            <p className="font-display text-5xl leading-none tabular">{match.score}</p>
          ) : null}
        </div>
        <div className="mt-3">
          {match.verifiedResult ? (
            <VerificationBadge state="verified" />
          ) : (
            <p className="text-2xs text-muted">Result not yet verified</p>
          )}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">{match.details}</p>
      </div>

      <section className="border-t border-border px-4 py-4">
        <h3 className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
          Participants
        </h3>
        <ul className="mt-3 space-y-2">
          {match.participantIds.map((id) => {
            const u = users[id];
            const accepted = match.acceptedIds.includes(id);
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => openProfile(id)}
                  className="flex w-full items-center gap-3 rounded-md py-1 text-left"
                >
                  <UserAvatar userId={id} size="sm" />
                  <span className="flex-1 text-sm font-medium">{u?.displayName}</span>
                  <span className="text-2xs text-muted">{accepted ? "Accepted" : "Pending"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {match.highlights.length > 0 ? (
        <section className="border-t border-border px-4 py-4">
          <h3 className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
            Highlights
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {match.highlights.map((h) => (
              <li key={h} className="text-muted">
                {h}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="border-t border-border px-4 py-4">
        <h3 className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
          Match Group
        </h3>
        <p className="mt-2 text-sm text-muted">
          A Match Room may create a Match Group after participants are accepted.
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => createMatchGroup(match.id)}>
            {match.matchGroupId ? "Open Match Group" : "Create Match Group"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => push({ type: "group-create", matchId: match.id })}
          >
            Custom group
          </Button>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-border pt-2">
          <h3 className="px-4 py-3 text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
            Community posts
          </h3>
          {related.map((p) => (
            <CommunityPostCard key={p.id} post={p} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
