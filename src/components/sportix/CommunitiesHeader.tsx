import { MessageCircle, UserPlus } from "lucide-react";
import { useSportix } from "@/lib/sportix/store";

export function CommunitiesHeader() {
  const setTab = useSportix((s) => s.setTab);
  const openMessages = useSportix((s) => s.openMessages);
  const unread = useSportix((s) => s.threads.reduce((n, t) => n + t.unread, 0));

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-bg/92 px-2 backdrop-blur-md">
      <button
        type="button"
        onClick={() => setTab("people")}
        className="inline-flex h-11 min-w-11 items-center gap-1 rounded-md px-2 text-xs font-semibold hover:bg-elevated"
        aria-label="Add people"
      >
        <UserPlus className="size-5" />
        <span>ADD</span>
      </button>
      <div className="text-center">
        <p className="font-display text-sm leading-none tracking-[0.18em]">SPORTIX</p>
        <p className="mt-0.5 text-3xs font-medium tracking-[0.28em] text-muted">COMMUNITIES</p>
      </div>
      <button
        type="button"
        onClick={openMessages}
        className="relative flex size-11 items-center justify-center rounded-md hover:bg-elevated"
        aria-label={unread ? `Messages, ${unread} unread` : "Messages"}
      >
        <MessageCircle className="size-5" />
        {unread > 0 ? (
          <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-lime px-1 text-[10px] font-bold text-lime-fg">
            {unread}
          </span>
        ) : null}
      </button>
    </header>
  );
}
