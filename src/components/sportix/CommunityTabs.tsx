import { useSportix } from "@/lib/sportix/store";
import type { TabId } from "@/lib/sportix/types";
import { cn } from "@/lib/utils";

const tabs: { id: TabId; label: string }[] = [
  { id: "feed", label: "Feed" },
  { id: "achievements", label: "Achievements" },
  { id: "matches", label: "Matches" },
  { id: "discover", label: "Discover" },
  { id: "people", label: "People" },
];

export function CommunityTabs() {
  const tab = useSportix((s) => s.tab);
  const setTab = useSportix((s) => s.setTab);

  return (
    <nav
      aria-label="Communities"
      className="sticky top-14 z-10 border-b border-border bg-bg/92 backdrop-blur-md"
    >
      <div className="hide-scrollbar flex gap-1 overflow-x-auto px-2">
        {tabs.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "relative h-11 shrink-0 px-3 text-sm font-medium",
                selected ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {t.label}
              {selected ? (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-lime" />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
