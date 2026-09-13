import { Search } from "lucide-react";
import { users, VIEWER_ID } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { PeopleCard } from "./PeopleCard";
import { UserAvatar } from "./UserAvatar";

export function PeopleTab() {
  const query = useSportix((s) => s.peopleQuery);
  const setQuery = useSportix((s) => s.setPeopleQuery);
  const openProfile = useSportix((s) => s.openProfile);
  const friendships = useSportix((s) => s.friendships);
  const blocked = useSportix((s) => s.blocked);
  const viewer = users[VIEWER_ID]!;

  const list = Object.values(users).filter((u) => {
    if (u.id === VIEWER_ID || u.isOrg) return false;
    if (blocked[u.id]) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.sport.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q)
    );
  });

  const incoming = list.filter((u) => friendships[u.id] === "incoming");
  const rest = list.filter((u) => friendships[u.id] !== "incoming");

  return (
    <div className="px-4 pb-8">
      <label className="relative mt-3 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people, sport, zone"
          aria-label="Search people"
          className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-sm outline-none placeholder:text-faint"
        />
      </label>
      <button
        type="button"
        onClick={() => openProfile(VIEWER_ID)}
        className="mt-5 flex w-full items-center gap-3 rounded-xl border border-lime/30 bg-surface p-3 text-left"
      >
        <UserAvatar userId={VIEWER_ID} size="lg" />
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{viewer.displayName} · You</span>
          <span className="block text-2xs text-muted">Profile, SPORT ID, creator allocation</span>
        </span>
      </button>
      {incoming.length > 0 ? (
        <section className="mt-5">
          <h2 className="mb-2 text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
            Requests
          </h2>
          <div className="space-y-2">
            {incoming.map((u) => (
              <PeopleCard key={u.id} userId={u.id} onOpen={() => openProfile(u.id)} />
            ))}
          </div>
        </section>
      ) : null}
      <section className="mt-5">
        <h2 className="mb-2 text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
          People
        </h2>
        <div className="space-y-2">
          {rest.map((u) => (
            <PeopleCard key={u.id} userId={u.id} onOpen={() => openProfile(u.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}
