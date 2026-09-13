import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSar, type SponsorStarTier } from "@/lib/sportix/stars";
import { SponsorStarIcon } from "./SponsorStarIcon";

export function SponsorStarCard({
  tier,
  selected,
  onSelect,
}: {
  tier: SponsorStarTier;
  selected?: boolean;
  onSelect: () => void;
}) {
  const prestige = tier.prestige_level >= 4;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors duration-150",
        selected ? "border-lime bg-lime/10" : "border-border bg-surface hover:bg-elevated",
        tier.tier_id === "signature" && "border-lime/40",
        tier.tier_id === "elite" && "border-star-yellow/30",
      )}
    >
      <SponsorStarIcon
        tier={tier.tier_id}
        size={prestige ? "lg" : "md"}
        prestige={tier.tier_id === "signature"}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{tier.name}</span>
        <span className="mt-0.5 block font-display text-xl leading-none tabular">
          {formatSar(tier.gross_amount_sar)}
        </span>
        <span className="mt-1 block text-2xs text-muted">
          Creator receives {formatSar(tier.creator_allocation_sar)}
        </span>
      </span>
      <span className="inline-flex items-center gap-0.5 text-2xs font-medium text-fg">
        Select Star
        <ChevronRight className="size-3.5" />
      </span>
    </button>
  );
}
