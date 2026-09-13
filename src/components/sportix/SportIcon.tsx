import { Dumbbell, Footprints, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Sport } from "@/lib/sportix/types";

function FootballMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 8.2 14.4 10l-.9 2.7H10.5L9.6 10 12 8.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.2 14 4.8M14.4 10l4.2-.4M13.5 12.7l1.8 3.9M10.5 12.7 8.7 16.6M9.6 10 5.4 9.6M12 8.2 10 4.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TennisMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M7 5.5c4 2.2 6.2 6.4 6.2 11.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M17 5.5c-4 2.2-6.2 6.4-6.2 11.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function SportIcon({
  sport,
  className,
}: {
  sport: Sport | string;
  className?: string;
}) {
  const cls = cn("size-3.5 shrink-0", className);
  switch (sport) {
    case "Football":
      return <FootballMark className={cls} />;
    case "Running":
      return <Footprints className={cls} strokeWidth={1.8} />;
    case "Gym":
      return <Dumbbell className={cls} strokeWidth={1.8} />;
    case "Swimming":
      return <Waves className={cls} strokeWidth={1.8} />;
    case "Tennis":
      return <TennisMark className={cls} />;
    default:
      return <FootballMark className={cls} />;
  }
}
