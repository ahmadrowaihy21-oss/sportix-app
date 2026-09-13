import { useState } from "react";
import { Trophy } from "lucide-react";
import { useSportix } from "@/lib/sportix/store";
import type { CommunityPost as CommunityPostModel } from "@/lib/sportix/types";
import { BottomSheet } from "./BottomSheet";
import { CommunityActionBar } from "./CommunityActionBar";
import { EngagementProofBar } from "./EngagementProofBar";
import { PerformanceCard } from "./PerformanceCard";
import { TopSponsorIndicator } from "./sponsor/TopSponsorIndicator";
import { UserHeader } from "./UserHeader";
import { VerificationBadge } from "./VerificationBadge";

function Caption({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 140 || text.split("\n").length > 3;
  return (
    <p className="px-4 pb-1 text-sm leading-relaxed text-fg">
      {long && !open ? `${text.slice(0, 140).trim()}… ` : text + " "}
      {long ? (
        <button
          type="button"
          className="text-muted hover:text-fg"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "less" : "more"}
        </button>
      ) : null}
    </p>
  );
}

function AchievementHero({ post }: { post: CommunityPostModel }) {
  const a = post.achievement;
  if (!a) return null;
  return (
    <div className="relative">
      <img src={post.media.src} alt={post.media.alt} className="aspect-photo w-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-2xs tracking-[0.18em] text-lime">{a.badgeLabel.toUpperCase()}</p>
        <div className="mt-1 flex items-center gap-2">
          <Trophy className="size-6 text-lime" aria-hidden="true" />
          <h3 className="font-display text-3xl leading-none tracking-tight">{a.title}</h3>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-muted">
          <VerificationBadge state={post.verification} />
          <span>{a.date}</span>
          {typeof a.spAi === "number" ? <span className="text-lime">+{a.spAi} SP AI</span> : null}
          {typeof a.sspAi === "number" ? <span>+{a.sspAi} SSP AI</span> : null}
          {typeof a.weeklyRank === "number" ? <span>#{a.weeklyRank} Weekly</span> : null}
        </div>
      </div>
    </div>
  );
}

function MatchHero({ post }: { post: CommunityPostModel }) {
  const m = post.match;
  if (!m) return null;
  return (
    <div className="relative">
      <img src={post.media.src} alt={post.media.alt} className="aspect-photo w-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-t from-bg/90 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-2xs tracking-[0.16em] text-muted uppercase">{m.title}</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium">
              {m.home} <span className="text-muted">vs</span> {m.away}
            </p>
            <p className="mt-0.5 text-2xs text-muted">
              {m.venue} · {m.when}
            </p>
          </div>
          {m.score ? (
            <p className="font-display text-4xl leading-none tracking-tight tabular">{m.score}</p>
          ) : null}
        </div>
        <div className="mt-2">
          <VerificationBadge state={post.verification} />
        </div>
      </div>
    </div>
  );
}

export function CommunityPostCard({ post }: { post: CommunityPostModel }) {
  const openSheet = useSportix((s) => s.openSheet);
  const toggleLike = useSportix((s) => s.toggleLike);
  const toggleSave = useSportix((s) => s.toggleSave);
  const push = useSportix((s) => s.push);
  const blocked = useSportix((s) => s.blocked[post.authorId]);
  const muted = useSportix((s) => s.muted[post.authorId]);

  if (blocked || muted) return null;

  const showPerformance =
    Boolean(post.performance) &&
    post.kind !== "social" &&
    post.kind !== "achievement" &&
    post.verification !== "unverified";

  return (
    <article className="border-b border-border bg-bg">
      <UserHeader
        userId={post.authorId}
        timeLabel={post.createdAt}
        onOverflow={() => openSheet({ type: "overflow", postId: post.id, userId: post.authorId })}
      />
      <p className="px-4 pb-2 text-2xs uppercase tracking-[0.14em] text-muted">{post.context}</p>

      {post.kind === "achievement" ? (
        <AchievementHero post={post} />
      ) : post.kind === "match" ? (
        <MatchHero post={post} />
      ) : post.kind === "activity" ? (
        <div className="md:grid md:grid-cols-2 md:items-stretch">
          <img
            src={post.media.src}
            alt={post.media.alt}
            className="aspect-photo w-full object-cover md:h-full md:min-h-72"
          />
          {showPerformance && post.performance ? (
            <PerformanceCard
              data={post.performance}
              verification={post.verification}
              onView={() => push({ type: "performance", postId: post.id })}
              layout="side"
            />
          ) : null}
        </div>
      ) : (
        <img
          src={post.media.src}
          alt={post.media.alt}
          className="aspect-photo w-full object-cover"
        />
      )}

      {showPerformance && post.performance && post.kind !== "activity" ? (
        <PerformanceCard
          data={post.performance}
          verification={post.verification}
          onView={() => push({ type: "performance", postId: post.id })}
        />
      ) : null}

      {post.kind === "match" && post.match ? (
        <button
          type="button"
          onClick={() => push({ type: "match", matchId: post.match!.matchId })}
          className="px-4 pt-3 text-2xs font-medium text-lime hover:underline"
        >
          Open match
        </button>
      ) : null}

      <div className="pt-3">
        <Caption text={post.caption} />
      </div>
      {post.goEvidence ? <GoEvidenceRow post={post} /> : null}
      <EngagementProofBar post={post} onComments={() => openSheet({ type: "comments", postId: post.id })} />
      <CommunityActionBar
        post={post}
        onLike={() => toggleLike(post.id)}
        onComment={() => openSheet({ type: "comments", postId: post.id })}
        onRepost={() => openSheet({ type: "repost", postId: post.id })}
        onSponsor={() => openSheet({ type: "sponsor", postId: post.id })}
        onSave={() => toggleSave(post.id)}
      />
      <TopSponsorIndicator
        sponsor={post.sponsor}
        scope="post"
        onClick={() => openSheet({ type: "sponsor", postId: post.id })}
        onHistory={() => push({ type: "sponsor-history", postId: post.id })}
      />
    </article>
  );
}

function GoEvidenceRow({ post }: { post: CommunityPostModel }) {
  const ev = post.goEvidence;
  const [open, setOpen] = useState(false);
  if (!ev) return null;
  const rows = [
    ["Session Identity", true],
    ["GPS", ev.gps],
    ["Route", ev.route],
    ["Time", ev.time],
    ["Health / Watch", ev.health],
    ["Media Evidence", ev.media],
  ] as const;
  return (
    <div className="px-4 pb-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-2xs font-semibold tracking-[0.12em] text-lime"
        >
          WHY VERIFIED?
        </button>
        {ev.sportIdUpdated ? (
          <span className="text-2xs font-semibold text-lime">SPORT ID UPDATED</span>
        ) : null}
      </div>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="SPORTIX EVIDENCE">
        <div className="space-y-3 px-4 pb-8">
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-bg">
            {rows.map(([k, ok]) => (
              <li key={k} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{k}</span>
                <span className={ok ? "font-semibold text-lime" : "text-faint"}>{ok ? "✓" : "○"}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm">
            Media type <span className="font-semibold">{ev.subjectType}</span>
          </p>
          <p className="text-sm">
            Evidence quality <span className="font-semibold text-lime">{ev.quality}</span>
          </p>
          <p className="text-sm">
            Verification{" "}
            <span className="font-semibold text-lime">
              {post.verification === "verified" ? "SPORTIX VERIFIED" : post.verification}
            </span>
          </p>
          <p className="text-3xs text-faint">Protected model internals are not shown.</p>
        </div>
      </BottomSheet>
    </div>
  );
}

