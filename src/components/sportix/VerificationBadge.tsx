import { BadgeCheck, Clock3, ShieldAlert, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationState } from "@/lib/sportix/types";

const copy: Record<
  VerificationState,
  { label: string; icon: typeof BadgeCheck; className: string }
> = {
  verified: {
    label: "Verified by SPORTIX",
    icon: BadgeCheck,
    className: "text-lime",
  },
  pending: {
    label: "Pending Verification",
    icon: Clock3,
    className: "text-warn",
  },
  insufficient: {
    label: "Insufficient Evidence",
    icon: ShieldAlert,
    className: "text-warn",
  },
  unverified: {
    label: "Manual / Unverified",
    icon: ShieldOff,
    className: "text-muted",
  },
};

export function VerificationBadge({
  state,
  compact = false,
  className,
}: {
  state: VerificationState;
  compact?: boolean;
  className?: string;
}) {
  const item = copy[state];
  const Icon = item.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-2xs font-medium",
        item.className,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" strokeWidth={2.2} aria-hidden="true" />
      <span>{compact && state === "verified" ? "Verified" : item.label}</span>
    </span>
  );
}

export function VerifiedMark({ className }: { className?: string }) {
  return (
    <BadgeCheck
      className={cn("size-4 shrink-0 text-lime", className)}
      strokeWidth={2.2}
      aria-label="Verified"
    />
  );
}
