import { cn } from "@/lib/utils";
import type { Audience } from "@/lib/go-sportix/types";

export function ActivityAudienceChip({
  audience,
  onClick,
}: {
  audience: Audience;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center rounded-full border border-border bg-elevated px-2.5 text-3xs font-semibold tracking-wide text-muted",
        onClick && "hover:text-fg",
      )}
    >
      Audience: {audience}
    </button>
  );
}
