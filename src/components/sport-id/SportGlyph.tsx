import { Bike, Footprints, PersonStanding, Target } from "lucide-react";
import type { SportKey } from "@/lib/sport-id/types";
import { cn } from "@/lib/utils";

function Ball({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3.2c2.2 1.8 3.4 4.4 3.4 8.8S14.2 19 12 20.8C9.8 19 8.6 16.4 8.6 12S9.8 5 12 3.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M4.8 9.2h14.4M4.8 14.8h14.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function SportGlyph({ sport, className }: { sport: SportKey | string; className?: string }) {
  const cls = cn("size-5", className);
  if (sport === "football") return <Ball className={cls} />;
  if (sport === "padel") return <Target className={cls} />;
  if (sport === "running") return <PersonStanding className={cls} />;
  if (sport === "walking") return <Footprints className={cls} />;
  if (sport === "cycling") return <Bike className={cls} />;
  return <Target className={cls} />;
}
