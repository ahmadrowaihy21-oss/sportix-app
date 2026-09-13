import { cn } from "@/lib/utils";
import { SponsorStarIcon } from "./SponsorStarIcon";

export function SportixSponsorButton({
  onClick,
  compact = false,
}: {
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="SPORTIX SPONSOR"
      className={cn(
        "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-lime transition-colors duration-150 hover:text-fg",
        compact && "h-8 min-h-8 flex-none flex-row gap-1.5 rounded-full border border-lime/40 px-3",
      )}
    >
      <SponsorStarIcon tier="green" size="sm" />
      <span className="text-3xs font-semibold tracking-wide">
        {compact ? "SPORTIX SPONSOR" : "Sponsor"}
      </span>
    </button>
  );
}
