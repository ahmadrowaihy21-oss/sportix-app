import { cn } from "@/lib/utils";

export function SponsorMomentumBadge({
  value,
  label = "Momentum",
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  if (value <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-lime/30 bg-lime/10 px-2 py-0.5 text-3xs font-medium text-lime",
        className,
      )}
      title="SPORTIX SPONSOR MOMENTUM is a visibility signal. It does not change SP AI, SSP AI or sporting rank."
    >
      {label} {value}
    </span>
  );
}
