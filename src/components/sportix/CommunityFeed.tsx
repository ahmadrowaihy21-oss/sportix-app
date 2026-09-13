import { users } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { starById } from "@/lib/sportix/stars";
import { CommunityPostCard } from "./CommunityPost";
import { SponsorMomentumBadge } from "./sponsor/SponsorMomentumBadge";
import { SponsorStarIcon } from "./sponsor/SponsorStarIcon";
import { Link } from "@tanstack/react-router";
import { useWeekly, useWeeklyBoard } from "@/lib/weekly-legends/store";

const FEED_IDS = [
  "post-run",
  "post-social",
  "post-gym",
  "post-match",
  "post-achieve",
  "post-swim",
  "post-tennis",
];

export function CommunityFeed() {
  const posts = useSportix((s) => s.posts);
  const openSheet = useSportix((s) => s.openSheet);
  const extras = posts.filter(
    (p) => p.id.startsWith("post-go-") || p.id.startsWith("post-wl-") || p.goEvidence,
  );
  const feed = [
    ...extras,
    ...FEED_IDS.map((id) => posts.find((p) => p.id === id)).filter(
      (p): p is NonNullable<typeof p> => Boolean(p),
    ),
  ];
  const momentum = posts
    .filter(
      (p) =>
        p.sponsor.visibilityEligibility === "eligible" && (p.sponsor.sponsorMomentum ?? 0) > 0,
    )
    .slice()
    .sort((a, b) => (b.sponsor.sponsorMomentum ?? 0) - (a.sponsor.sponsorMomentum ?? 0))
    .slice(0, 4);

  return (
    <div>
      <WeeklyLegendsStrip />
      {momentum.length > 0 ? (
        <section className="border-b border-border px-4 py-3">
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-lime">
            SPORTIX SPONSOR MOMENTUM
          </p>
          <p className="mt-0.5 text-3xs text-muted">
            Visibility this week · not a sporting rank, SP AI, or SSP AI
          </p>
          <div className="hide-scrollbar mt-2 flex gap-2 overflow-x-auto">
            {momentum.map((p) => {
              const u = users[p.authorId];
              const tier = starById(p.sponsor.topSponsorTier ?? null);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => openSheet({ type: "sponsor", postId: p.id })}
                  className="flex min-w-44 max-w-52 shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-2.5 py-2 text-left"
                >
                  {tier ? <SponsorStarIcon tier={tier.tier_id} size="sm" /> : null}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-2xs font-semibold">{u?.displayName}</span>
                    <span className="block truncate text-3xs text-muted">
                      {p.achievement?.title ?? p.performance?.headline ?? p.context}
                    </span>
                  </span>
                  <SponsorMomentumBadge value={p.sponsor.sponsorMomentum ?? 0} />
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
      {feed.map((post) => (
        <CommunityPostCard key={post.id} post={post} />
      ))}
      <p className="px-6 py-10 text-center text-2xs text-faint">
        You are up to date
      </p>
    </div>
  );
}

function WeeklyLegendsStrip() {
  const week = useWeekly((s) => s.week);
  const { meGlobal } = useWeeklyBoard();
  return (
    <Link
      to="/weekly-legends"
      className="flex items-center justify-between border-b border-border px-4 py-3 hover:bg-elevated/40"
    >
      <span>
        <span className="block text-2xs font-semibold tracking-[0.16em] text-lime">WEEKLY LEGENDS</span>
        <span className="text-2xs text-muted">Week {week} · verified competition</span>
      </span>
      <span className="font-display text-xl tabular">#{meGlobal?.rank ?? "—"}</span>
    </Link>
  );
}
