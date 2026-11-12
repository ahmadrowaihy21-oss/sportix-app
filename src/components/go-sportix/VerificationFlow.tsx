import { useEffect, useState } from "react";
import { BadgeCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ACTIVITIES,
  currentPace,
  formatDuration,
  formatKm,
  formatPace,
  VERIFY_CHECKS,
} from "@/lib/go-sportix/format";
import { useGo } from "@/lib/go-sportix/store";
import { cn } from "@/lib/utils";
import { MediaPreview } from "./MediaPreview";

export function VerificationProgress() {
  const session = useGo((s) => s.session);
  const completeVerification = useGo((s) => s.completeVerification);
  const demoOutcome = useGo((s) => s.demoOutcome);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!session || session.state !== "VERIFYING") return;
    if (step >= VERIFY_CHECKS.length) {
      const t = window.setTimeout(() => completeVerification(demoOutcome), 480);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 420);
    return () => window.clearTimeout(t);
  }, [step, session, completeVerification, demoOutcome]);

  if (!session) return null;
  const failAt = demoOutcome === "insufficient" ? 5 : -1;

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col px-5 py-8">
      <p className="text-2xs font-semibold tracking-[0.2em] text-lime">
        SIMULATION CHECK
      </p>
      <h1 className="mt-2 font-display text-4xl leading-none">
        Testing the activity flow
      </h1>
      <p className="mt-2 text-sm text-muted">
        Synthetic checks only. GPS, sensors and media have not been verified by
        a server.
      </p>
      <ol className="mt-8 space-y-3">
        {VERIFY_CHECKS.map((c, i) => {
          const done = i < step;
          const current = i === step;
          const failed = failAt === i && done;
          return (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className={cn(done || current ? "text-fg" : "text-faint")}>
                {c.label.replace("...", "")}
              </span>
              <span
                className={cn(
                  "text-2xs font-semibold",
                  failed ? "text-danger" : done ? "text-lime" : "text-faint",
                )}
              >
                {failed ? "✗" : done ? "✓" : current ? "…" : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function VerifiedActivitySuccess() {
  const session = useGo((s) => s.session);
  const showPost = useGo((s) => s.showPost);
  const clearMedia = useGo((s) => s.clearMedia);
  const goHome = useGo((s) => s.goHome);

  useEffect(() => {
    if (
      session?.state !== "SIMULATED_COMPLETED" &&
      session?.state !== "REVIEW_REQUIRED"
    )
      return;
    const t = window.setTimeout(() => showPost(), 1600);
    return () => window.clearTimeout(t);
  }, [session?.state, showPost]);

  if (!session) return null;
  const cfg = ACTIVITIES[session.activity];
  const pace = formatPace(
    currentPace(session.elapsedSec, session.distanceKm, cfg.paceSecPerKm),
  );
  const verified = session.state === "SIMULATED_COMPLETED";
  const review = session.state === "REVIEW_REQUIRED";
  const missing = session.state === "INSUFFICIENT_EVIDENCE";

  if (missing) {
    return (
      <div className="space-y-4 px-4 py-8">
        <ShieldAlert className="size-10 text-warn" />
        <h1 className="font-display text-4xl leading-none">
          INSUFFICIENT EVIDENCE
        </h1>
        <p className="text-sm text-muted">
          Uploaded media could not be bound to this session. This activity is
          not SPORTIX VERIFIED.
        </p>
        <Button
          className="w-full"
          onClick={() => useGo.setState({ screen: "media" })}
        >
          ATTACH ANOTHER PHOTO
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            clearMedia();
            useGo.setState({ screen: "media" });
          }}
        >
          RETAKE
        </Button>
        <Button variant="faint" className="w-full" onClick={goHome}>
          End without verifying
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-8">
      {verified ? (
        <BadgeCheck className="size-12 text-lime" strokeWidth={2.2} />
      ) : (
        <ShieldQuestion className="size-12 text-warn" />
      )}
      <div>
        <p className="text-2xs font-semibold tracking-[0.18em] text-lime">
          {verified ? "SIMULATION COMPLETED" : "REVIEW REQUIRED"}
        </p>
        <h1 className="mt-2 font-display text-5xl leading-none">
          {cfg.sportLabel}
        </h1>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat k="Distance" v={`${formatKm(session.distanceKm)} KM`} />
        <Stat k="Time" v={formatDuration(session.elapsedSec)} />
        <Stat k="Pace" v={pace} />
      </div>
      {session.media ? (
        <MediaPreview
          url={session.media.url}
          type={session.media.media_type}
          subject={session.media.subject_type}
        />
      ) : null}
      <ul className="space-y-1 text-sm">
        <li className="flex justify-between">
          <span className="text-muted">Evidence quality</span>
          <span className="text-lime">
            {verified ? "SIMULATED" : "PENDING"}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="text-muted">MEDIA</span>
          <span>
            {session.media?.subject_type} {verified ? "✓" : ""}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="text-muted">SPORT ID</span>
          <span className="text-lime">
            {verified ? "TEST RECORD" : "TEST STATUS"}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="text-muted">SSP / REWARD</span>
          <span className="text-lime">{"BLOCKED · NO REWARD"}</span>
        </li>
      </ul>
      {review ? (
        <p className="text-2xs text-warn">
          Cycling technical verification profile pending. Session recorded — not
          production SPORTIX VERIFIED cycling.
        </p>
      ) : null}
      <p className="text-2xs text-faint">Opening sharing controls…</p>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="font-display text-lg leading-none tabular">{v}</p>
      <p className="mt-1 text-3xs text-muted">{k}</p>
    </div>
  );
}
