import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export function EvidenceStatus({
  gps,
  activity,
  time,
  health,
  media,
}: {
  gps?: boolean;
  activity?: boolean;
  time?: boolean;
  health?: boolean;
  media: boolean;
}) {
  const rows = [
    { k: "GPS", ok: gps ?? true },
    { k: "ACTIVITY", ok: activity ?? true },
    { k: "TIME", ok: time ?? true },
    { k: "HEALTH / WATCH", ok: health ?? true },
    { k: "MEDIA", ok: media },
  ];
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li key={r.k} className="flex items-center justify-between text-2xs">
          <span className="tracking-[0.12em] text-muted">{r.k}</span>
          <span className={cn("inline-flex items-center gap-1 font-semibold", r.ok ? "text-lime" : "text-faint")}>
            {r.ok ? <Check className="size-3.5" strokeWidth={2.4} /> : <Circle className="size-3.5" />}
            {r.ok ? "✓" : "○"}
          </span>
        </li>
      ))}
    </ul>
  );
}
