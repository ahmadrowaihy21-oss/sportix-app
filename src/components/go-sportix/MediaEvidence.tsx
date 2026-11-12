import { useRef } from "react";
import { Camera, ImagePlus, MapPin, User, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import {
  ACTIVITIES,
  currentPace,
  formatDuration,
  formatKm,
  formatPace,
} from "@/lib/go-sportix/format";
import { useGo } from "@/lib/go-sportix/store";
import { cn } from "@/lib/utils";
import { EvidenceStatus } from "./EvidenceStatus";
import { MediaPreview } from "./MediaPreview";

export function MediaEvidenceRequirement() {
  const session = useGo((s) => s.session);
  const returnToActivity = useGo((s) => s.returnToActivity);
  const finishAndVerify = useGo((s) => s.finishAndVerify);
  const subjectType = useGo((s) => s.subjectType);
  const setSubjectType = useGo((s) => s.setSubjectType);
  const attachMedia = useGo((s) => s.attachMedia);
  const clearMedia = useGo((s) => s.clearMedia);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const attachRef = useRef<HTMLInputElement>(null);

  if (!session) return null;
  const cfg = ACTIVITIES[session.activity];
  const ready = Boolean(session.media);
  const pace = formatPace(
    currentPace(session.elapsedSec, session.distanceKm, cfg.paceSecPerKm),
  );

  const onFile = (file: File | undefined) => {
    if (file) attachMedia(file);
  };

  return (
    <div className="pb-8">
      <ScreenHeader
        title="Media evidence required"
        subtitle="Stop safely first"
        onBack={returnToActivity}
      />
      <div className="space-y-4 px-4 py-4">
        <p className="rounded-xl border border-warn/40 bg-warn/10 px-3 py-3 text-sm text-warn">
          Please stop safely before capturing media. Never take a photo while
          running or cycling.
        </p>
        <p className="text-sm leading-relaxed text-muted">
          Use the synthetic sample to test this flow. Uploaded media stays local
          and is not verified.
        </p>

        <Button
          className="w-full"
          onClick={() =>
            attachMedia(
              new File(
                [
                  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#101811"/><text x="60" y="190" fill="#b4ff52" font-size="30">SPORTIX SYNTHETIC TEST</text></svg>',
                ],
                "synthetic-evidence.svg",
                { type: "image/svg+xml" },
              ),
            )
          }
        >
          USE SYNTHETIC EVIDENCE
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSubjectType("SELF")}
            className={cn(
              "rounded-2xl border px-3 py-4 text-left",
              subjectType === "SELF"
                ? "border-lime bg-lime/10"
                : "border-border bg-surface",
            )}
          >
            <User className="size-5 text-lime" />
            <p className="mt-2 text-sm font-semibold">SELF</p>
            <p className="text-2xs text-muted">Photo/video of yourself</p>
          </button>
          <button
            type="button"
            onClick={() => setSubjectType("PLACE")}
            className={cn(
              "rounded-2xl border px-3 py-4 text-left",
              subjectType === "PLACE"
                ? "border-lime bg-lime/10"
                : "border-border bg-surface",
            )}
          >
            <MapPin className="size-5 text-lime" />
            <p className="mt-2 text-sm font-semibold">PLACE</p>
            <p className="text-2xs text-muted">
              Photo/video of the activity place
            </p>
          </button>
        </div>

        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.currentTarget.value = "";
          }}
        />
        <input
          ref={videoRef}
          type="file"
          accept="video/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.currentTarget.value = "";
          }}
        />
        <input
          ref={attachRef}
          type="file"
          accept="image/*,video/*"
          aria-label="Attach activity media"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.currentTarget.value = "";
          }}
        />

        {session.media ? (
          <MediaPreview
            url={session.media.url}
            type={session.media.media_type}
            subject={session.media.subject_type}
            onChange={() => {
              clearMedia();
              attachRef.current?.click();
            }}
          />
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => photoRef.current?.click()}>
            <Camera className="size-4" />
            TAKE PHOTO
          </Button>
          <Button variant="outline" onClick={() => videoRef.current?.click()}>
            <Video className="size-4" />
            RECORD VIDEO
          </Button>
        </div>
        <Button
          variant="muted"
          className="w-full"
          onClick={() => attachRef.current?.click()}
        >
          <ImagePlus className="size-4" />
          ATTACH PHOTO
        </Button>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
            Evidence
          </p>
          <EvidenceStatus media={ready} />
          <p className="mt-3 text-2xs text-faint">
            {formatKm(session.distanceKm)} KM ·{" "}
            {formatDuration(session.elapsedSec)} · {pace}
          </p>
        </div>

        <Button
          className="h-14 w-full text-base"
          disabled={!ready}
          onClick={finishAndVerify}
        >
          FINISH & VERIFY
        </Button>
        <Button variant="outline" className="w-full" onClick={returnToActivity}>
          RETURN TO ACTIVITY
        </Button>
      </div>
    </div>
  );
}
