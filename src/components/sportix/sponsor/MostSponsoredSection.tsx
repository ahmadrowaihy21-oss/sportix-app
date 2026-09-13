import { useMemo, useState } from "react";
import { users } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { deriveAthleteSponsor, starById, type StarTierId } from "@/lib/sportix/stars";
import { UserAvatar } from "../UserAvatar";
import { VerifiedMark } from "../VerificationBadge";
import { SponsorStarIcon } from "./SponsorStarIcon";
import { SponsorMomentumBadge } from "./SponsorMomentumBadge";

const sports = ["All", "Football", "Running", "Gym", "Padel"] as const;
const zones = ["All", "Jeddah Zone", "Riyadh Zone"] as const;

export function MostSponsoredSection() {
  const posts = useSportix((s) => s.posts);
  const txs = useSportix((s) => s.transactions);
  const openProfile = useSportix((s) => s.openProfile);
  const [sport, setSport] = useState<(typeof sports)[number]>("All");
  const [zone, setZone] = useState<(typeof zones)[number]>("All");

  const eligiblePosts = useMemo(() => {
    return posts
      .filter((p) => p.sponsor.visibilityEligibility === "eligible")
      .filter((p) => (p.sponsor.sponsorCount ?? 0) > 0)
      .filter((p) => {
        const u = users[p.authorId];
        if (sport !== "All" && String(u?.sport) !== sport) return false;
        if (zone !== "All" && u?.zone !== zone) return false;
        return true;
      })
      .sort((a, b) => (b.sponsor.sponsorMomentum ?? 0) - (a.sponsor.sponsorMomentum ?? 0));
  }, [posts, sport, zone]);

  const athletes = useMemo(() => {
    const ids = new Set(posts.map((p) => p.authorId).concat(Object.keys(users)));
    return [...ids]
      .map((id) => {
        const u = users[id];
        if (!u || u.isOrg || u.ageRestricted) return null;
        if (sport !== "All" && String(u.sport) !== sport) return null;
        if (zone !== "All" && u.zone !== zone) return null;
        const st = deriveAthleteSponsor(id, txs);
        if (st.total_sponsor_count === 0) return null;
        return { u, st };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .sort((a, b) => b.st.aggregate_sponsored_value - a.st.aggregate_sponsored_value);
  }, [posts, txs, sport, zone]);

  const rising = athletes.slice().reverse().slice(0, 3);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold">Most Sponsored</h2>
        <p className="mt-0.5 text-2xs text-muted">
          Visibility from SPORTIX SPONSOR. Not a sporting-performance ranking.
        </p>
      </div>
      <div className="hide-scrollbar flex gap-2 overflow-x-auto">
        {sports.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSport(s)}
            className={
              sport === s
                ? "h-8 shrink-0 rounded-full bg-lime px-3 text-2xs font-medium text-lime-fg"
                : "h-8 shrink-0 rounded-full bg-elevated px-3 text-2xs text-muted"
            }
          >
            {s === "All" ? "All sports" : `${s}`}
          </button>
        ))}
      </div>
      <div className="hide-scrollbar flex gap-2 overflow-x-auto">
        {zones.map((z) => (
          <button
            key={z}
            type="button"
            onClick={() => setZone(z)}
            className={
              zone === z
                ? "h-8 shrink-0 rounded-full bg-elevated px-3 text-2xs font-medium text-fg ring-1 ring-lime"
                : "h-8 shrink-0 rounded-full bg-elevated px-3 text-2xs text-muted"
            }
          >
            {z === "All" ? "All zones" : z.replace(" Zone", "")}
          </button>
        ))}
      </div>

      <div>
        <h3 className="mb-2 text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
          Most Sponsored Posts
        </h3>
        {eligiblePosts.length === 0 ? (
          <p className="rounded-xl border border-border px-3 py-6 text-center text-2xs text-muted">
            No sponsored {sport === "All" ? "content" : sport.toLowerCase()} this week in this zone.
          </p>
        ) : (
          <div className="space-y-2">
            {eligiblePosts.slice(0, 4).map((p, i) => {
              const u = users[p.authorId];
              const tier = starById((p.sponsor.topSponsorTier as StarTierId | null) ?? null);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => openProfile(p.authorId)}
                  className="flex w-full items-center gap-3 overflow-hidden rounded-xl border border-border bg-surface text-left"
                >
                  <img src={p.media.src} alt="" className="h-16 w-16 object-cover" />
                  <span className="min-w-0 flex-1 py-2 pr-3">
                    <span className="flex items-center gap-1 text-2xs text-muted">
                      #{i + 1} Most Sponsored
                      {tier ? <SponsorStarIcon tier={tier.tier_id} size="sm" /> : null}
                    </span>
                    <span className="block truncate text-xs font-semibold">
                      {p.achievement?.title ?? p.performance?.headline ?? p.context}
                    </span>
                    <span className="block truncate text-2xs text-muted">{u?.displayName}</span>
                  </span>
                  <SponsorMomentumBadge value={p.sponsor.sponsorMomentum ?? 0} className="mr-3" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
          Most Sponsored Athletes
        </h3>
        {athletes.length === 0 ? (
          <p className="rounded-xl border border-border px-3 py-6 text-center text-2xs text-muted">
            No sponsored athletes for this sport and zone.
          </p>
        ) : (
          <div className="space-y-2">
            {athletes.slice(0, 4).map(({ u, st }, i) => {
              const tier = starById(st.highest_star_received);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => openProfile(u.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 text-left"
                >
                  <UserAvatar userId={u.id} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1 text-xs font-semibold">
                      {u.displayName}
                      {u.verified ? <VerifiedMark className="size-3" /> : null}
                    </span>
                    <span className="block text-2xs text-muted">
                      #{i + 1} Most Sponsored · {u.sport} · not a performance rank
                    </span>
                  </span>
                  {tier ? <SponsorStarIcon tier={tier.tier_id} size="sm" /> : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {rising.length > 0 ? (
        <div>
          <h3 className="mb-2 text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
            Rising Sponsored Athletes
          </h3>
          <p className="mb-2 text-2xs text-faint">Early SPORTIX SPONSOR momentum this week.</p>
          <div className="flex gap-2">
            {rising.map(({ u }) => (
              <button
                key={u.id}
                type="button"
                onClick={() => openProfile(u.id)}
                className="flex-1 rounded-xl border border-border bg-surface p-2 text-center"
              >
                <UserAvatar userId={u.id} size="sm" className="mx-auto" />
                <p className="mt-1 truncate text-2xs font-medium">{u.displayName}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
