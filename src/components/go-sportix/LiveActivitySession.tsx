import { useEffect } from "react";
import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACTIVITIES, currentPace, formatDuration, formatKm, formatPace } from "@/lib/go-sportix/format";
import { useGo } from "@/lib/go-sportix/store";
import { ActivityAudienceChip } from "./ActivityAudienceChip";
import { EvidenceStatus } from "./EvidenceStatus";
import { LiveMetricCard } from "./LiveMetricCard";

export function LiveActivitySession() {
  const session = useGo((s) => s.session);
  const tick = useGo((s) => s.tick);
  const pause = useGo((s) => s.pause);
  const resume = useGo((s) => s.resume);
  const requestFinish = useGo((s) => s.requestFinish);
  const audience = useGo((s) => s.audience);
  const openSettings = useGo((s) => s.openSettings);

  useEffect(() => {
    if (session?.state !== "ACTIVE") return;
    let raf = 0;
    const loop = (now: number) => {
      tick(now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [session?.state, tick]);

  if (!session) return null;
  const cfg = ACTIVITIES[session.activity];
  const paused = session.state === "PAUSED";
  const pace = formatPace(currentPace(session.elapsedSec, session.distanceKm, cfg.paceSecPerKm));
  const progress = Math.min(1, session.distanceKm / 5.42);

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col">
      <div className="flex items-center justify-between px-4 pt-4">
        <div>
          <p className="text-2xs font-semibold tracking-[0.18em] text-lime">
            {paused ? "ACTIVITY PAUSED" : cfg.liveLabel}
          </p>
          <p className="mt-1 text-2xs text-muted">{cfg.label}</p>
        </div>
        <ActivityAudienceChip audience={audience} onClick={openSettings} />
      </div>

      <div className="px-4 pt-6 text-center">
        <p className="font-display text-6xl leading-none tabular tracking-tight">
          {formatDuration(session.elapsedSec)}
        </p>
        <p className="mt-2 text-2xs uppercase tracking-[0.16em] text-muted">Duration</p>
      </div>

      <div className="mx-4 mt-6 h-1.5 overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full bg-lime transition-[width] duration-150"
          style={{ width: `${Math.max(4, progress * 100)}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 px-4">
        <LiveMetricCard label="Distance" value={`${formatKm(session.distanceKm)} KM`} />
        {session.activity === "cycling" ? (
          <LiveMetricCard label="Speed" value={`${session.speedKmh.toFixed(1)} KM/H`} />
        ) : (
          <LiveMetricCard label="Pace" value={pace} />
        )}
        {session.activity === "cycling" ? (
          <LiveMetricCard label="Elevation" value={`${Math.round(session.elevationM)} M`} />
        ) : (
          <LiveMetricCard label="Steps" value={Math.round(session.steps).toLocaleString()} />
        )}
        <LiveMetricCard label="GPS Quality" value={session.gpsQuality} />
        {session.activity === "hiking" ? (
          <LiveMetricCard label="Elevation" value={`${Math.round(session.elevationM)} M`} />
        ) : null}
      </div>

      <div className="mx-4 mt-4 rounded-2xl border border-border bg-surface p-4">
        <p className="mb-2 text-2xs font-semibold uppercase tracking-[0.16em] text-muted">Evidence</p>
        <EvidenceStatus media={Boolean(session.media)} />
      </div>

      {session.activity === "cycling" ? (
        <p className="px-4 pt-3 text-2xs text-warn">
          Camera capture only while safely stopped. Do not film while riding.
        </p>
      ) : null}

      <div className="mt-auto grid grid-cols-2 gap-2 px-4 py-6">
        {paused ? (
          <Button variant="outline" className="h-14" onClick={resume}>
            <Play className="size-4" />
            RESUME
          </Button>
        ) : (
          <Button variant="outline" className="h-14" onClick={pause}>
            <Pause className="size-4" />
            PAUSE
          </Button>
        )}
        <Button className="h-14" onClick={requestFinish}>
          <Square className="size-4" />
          FINISH
        </Button>
      </div>
    </div>
  );
}
