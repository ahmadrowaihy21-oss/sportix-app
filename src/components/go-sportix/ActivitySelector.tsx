import { Bike, Footprints, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { ACTIVITIES } from "@/lib/go-sportix/format";
import { useGo } from "@/lib/go-sportix/store";
import type { ActivityKey } from "@/lib/go-sportix/types";

const items: { key: ActivityKey; icon: typeof Footprints; hint: string }[] = [
  { key: "running", icon: Footprints, hint: "GPS · Watch · Media required" },
  { key: "walking", icon: Footprints, hint: "Steps · Distance · Media required" },
  { key: "hiking", icon: Mountain, hint: "Route · Elevation · Media required" },
  { key: "cycling", icon: Bike, hint: "Target experience · profile pending" },
];

export function ActivitySelector() {
  const goHome = useGo((s) => s.goHome);
  const chooseActivity = useGo((s) => s.chooseActivity);

  return (
    <div>
      <ScreenHeader title="Start activity" subtitle="Choose how you move" onBack={goHome} />
      <div className="space-y-2 px-4 py-4">
        {items.map((item) => {
          const cfg = ACTIVITIES[item.key];
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => chooseActivity(item.key)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-4 text-left hover:border-lime/40"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-elevated text-lime">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{cfg.label}</span>
                <span className="block text-2xs text-muted">{item.hint}</span>
              </span>
            </button>
          );
        })}
        <Button variant="outline" className="w-full" onClick={goHome}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
