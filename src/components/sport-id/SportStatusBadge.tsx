import { AlertTriangle, Check, FlaskConical, Hourglass, Plus } from "lucide-react";
import type { SportRecordState, VerificationState } from "@/lib/sport-id/types";
import { cn } from "@/lib/utils";

const sportLabels: Record<SportRecordState, string> = {
  verified: "Verified sport",
  building: "Building SPORT ID",
  pilot: "Pilot / limited verification",
  interest: "Interest only",
  "pending-profile": "Technical verification profile pending",
};

const verifyLabels: Record<VerificationState | "pending-profile", string> = {
  verified: "SPORTIX VERIFIED",
  "pending-review": "PENDING REVIEW",
  insufficient: "INSUFFICIENT EVIDENCE",
  "re-test": "RE-TEST REQUIRED",
  abstained: "ABSTAINED",
  pilot: "PILOT EVIDENCE",
  "pending-profile": "PROFILE PENDING",
};

export function SportStatusBadge({
  state,
  compact,
}: {
  state: SportRecordState;
  compact?: boolean;
}) {
  const Icon =
    state === "verified"
      ? Check
      : state === "pilot"
        ? FlaskConical
        : state === "interest"
          ? Plus
          : state === "pending-profile"
            ? AlertTriangle
            : Hourglass;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide",
        compact ? "text-3xs" : "text-2xs",
        state === "verified"
          ? "bg-lime/15 text-lime"
          : state === "pilot"
            ? "bg-warn/15 text-warn"
            : state === "interest"
              ? "bg-elevated text-muted"
              : "bg-warn/10 text-warn",
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {sportLabels[state]}
    </span>
  );
}

export function VerificationStatus({
  state,
}: {
  state: VerificationState | "pending-profile";
}) {
  const verified = state === "verified";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-2xs font-semibold tracking-wide",
        verified ? "text-lime" : "text-warn",
      )}
    >
      {verified ? <Check className="size-3.5" aria-hidden="true" /> : <AlertTriangle className="size-3.5" aria-hidden="true" />}
      {verifyLabels[state]}
    </span>
  );
}
