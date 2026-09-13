import { Plus, Search, Users } from "lucide-react";
import { VIEWER_ID } from "@/lib/sportix/mock";
import { useSportix } from "@/lib/sportix/store";
import { ScreenHeader } from "./ScreenHeader";
import { UserAvatar } from "./UserAvatar";

export function MessageInbox() {
  const pop = useSportix((s) => s.pop);
  const push = useSportix((s) => s.push);
  const threads = useSportix((s) => s.threads);
  const query = useSportix((s) => s.dmQuery);
  const setQuery = useSportix((s) => s.setDmQuery);
  const unreadTotal = threads.reduce((n, t) => n + t.unread, 0);

  const list = threads.filter((t) =>
    query.trim() ? t.title.toLowerCase().includes(query.toLowerCase()) : true,
  );

  return (
    <div>
      <ScreenHeader
        title="Messages"
        subtitle={unreadTotal ? `${unreadTotal} unread` : undefined}
        onBack={pop}
        right={
          <button
            type="button"
            onClick={() => push({ type: "group-create" })}
            className="mr-1 inline-flex h-10 items-center gap-1 rounded-md px-2 text-xs font-medium text-lime hover:bg-elevated"
            aria-label="Create group"
          >
            <Plus className="size-4" />
            Group
          </button>
        }
      />
      <div className="px-4 py-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search messages"
            className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-sm text-fg caret-lime outline-none placeholder:text-faint"
          />
        </label>
      </div>
      <ul>
        {list.map((t) => {
          const other = t.memberIds.find((id) => id !== VIEWER_ID);
          const avatarId = t.kind === "dm" ? other : undefined;
          return (
            <li key={t.id} className="border-b border-border">
              <button
                type="button"
                onClick={() => push({ type: "chat", threadId: t.id })}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-elevated/40"
              >
                {avatarId ? (
                  <UserAvatar userId={avatarId} />
                ) : (
                  <span className="flex size-10 items-center justify-center rounded-full bg-elevated text-lime">
                    <Users className="size-4" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{t.title}</span>
                    <span className="text-2xs text-muted">{t.lastAt}</span>
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted">
                      {t.kind === "group" && t.groupType
                        ? `${t.groupType === "match" ? "Match Group · " : ""}${t.lastMessage}`
                        : t.lastMessage}
                    </span>
                    {t.unread > 0 ? (
                      <span className="flex size-5 items-center justify-center rounded-full bg-lime text-3xs font-bold text-lime-fg">
                        {t.unread}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="px-6 py-6 text-center text-2xs text-faint">
        Direct messages require a friendship or approved relationship.
      </p>
    </div>
  );
}
