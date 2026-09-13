import { Star } from "lucide-react";
import { users } from "@/lib/sportix/mock";
import type { SponsorState } from "@/lib/sportix/types";
import { VerifiedMark } from "./VerificationBadge";

export function SponsorIndicator({
  sponsor,
  scope,
  onClick,
}: {
  sponsor: SponsorState;
  scope: "post" | "athlete";
  onClick?: () => void;
}) {
  const top = sponsor.topSponsorId ? users[sponsor.topSponsorId] : undefined;
  const scopeLabel = scope === "post" ? "This Post" : "Athlete";

  let detail = "Be the first Sponsor";
  if (top) {
    detail =
      sponsor.extraCount > 0
        ? `Top Sponsor: ${top.displayName} +${sponsor.extraCount} sponsors`
        : `Top Sponsor: ${top.displayName}`;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 border-t border-border px-4 py-2.5 text-left hover:bg-elevated/50"
      aria-label={`SPORTIX SPONSOR, ${scopeLabel}. ${detail}`}
    >
      <span className="flex size-7 items-center justify-center rounded-full bg-lime/15 text-lime">
        <Star className="size-3.5 fill-lime" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-2xs font-semibold tracking-wide text-fg">
          SPORTIX SPONSOR
          <span className="ml-1.5 font-medium text-muted">· {scopeLabel}</span>
        </span>
        <span className="mt-0.5 flex items-center gap-1 truncate text-2xs text-muted">
          {detail}
          {top?.verified ? <VerifiedMark className="size-3" /> : null}
        </span>
      </span>
    </button>
  );
}
