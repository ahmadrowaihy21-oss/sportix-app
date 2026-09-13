import { BadgeCheck } from "lucide-react";
import { trustLabel } from "@/lib/marketplace/format";
import type { PartnerTrust } from "@/lib/marketplace/types";
import { cn } from "@/lib/utils";

export function VerifiedPartnerBadge({
  trust,
  compact = false,
}: {
  trust: PartnerTrust;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-lime",
        compact ? "text-3xs" : "text-2xs",
      )}
    >
      <BadgeCheck className={compact ? "size-3" : "size-3.5"} />
      {trustLabel(trust)}
    </span>
  );
}
