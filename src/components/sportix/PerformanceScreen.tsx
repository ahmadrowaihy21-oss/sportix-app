import { users } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { ScreenHeader } from "./ScreenHeader";
import { VerificationBadge } from "./VerificationBadge";

export function PerformanceScreen({ postId }: { postId: string }) {
  const post = useSportix((s) => s.posts.find((p) => p.id === postId));
  const pop = useSportix((s) => s.pop);
  if (!post?.performance) {
    return (
      <div>
        <ScreenHeader title="Performance" onBack={pop} />
        <p className="p-6 text-sm text-muted">No verified performance layer on this post.</p>
      </div>
    );
  }
  const p = post.performance;
  const author = users[post.authorId];

  return (
    <div>
      <ScreenHeader title="Performance" subtitle={author?.displayName} onBack={pop} />
      <div className="p-4">
        <img
          src={post.media.src}
          alt={post.media.alt}
          className="max-h-64 w-full rounded-lg object-cover"
        />
        <div className="mt-4 flex items-center justify-between">
          <p className="font-display tracking-[0.18em] text-muted">{p.sportLabel}</p>
          <VerificationBadge state={post.verification} />
        </div>
        <p className="mt-2 font-display text-5xl leading-none tabular">{p.headline}</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {p.metrics.map((m) => (
            <div key={m.label} className="rounded-md bg-surface p-3">
              <p className="font-display text-xl tabular">{m.value}</p>
              <p className="mt-1 text-2xs text-muted">{m.label}</p>
            </div>
          ))}
        </div>
        {p.deepMetrics && p.deepMetrics.length > 0 ? (
          <>
            <h3 className="mt-6 text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
              Full evidence
            </h3>
            <dl className="mt-2 divide-y divide-border rounded-lg border border-border">
              {p.deepMetrics.map((m) => (
                <div key={m.label} className="flex items-center justify-between px-3 py-2.5">
                  <dt className="text-sm text-muted">{m.label}</dt>
                  <dd className="font-display text-lg tabular">{m.value}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : null}
        {p.splits && p.splits.length > 0 ? (
          <>
            <h3 className="mt-6 text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
              Splits
            </h3>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {p.splits.map((s) => (
                <div key={s.label} className="rounded-md bg-surface p-3 text-center">
                  <p className="text-2xs text-muted">{s.label}</p>
                  <p className="mt-1 font-display text-lg tabular">{s.value}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}
        {post.verification === "verified" && typeof p.spAi === "number" ? (
          <p className="mt-6 text-sm text-lime">+{p.spAi} SP AI awarded for verified evidence.</p>
        ) : null}
        {post.verification !== "verified" ? (
          <p className="mt-6 text-sm text-muted">
            This activity is not SPORTIX Verified. Rank and SP AI are withheld until evidence
            clears.
          </p>
        ) : null}
      </div>
    </div>
  );
}
