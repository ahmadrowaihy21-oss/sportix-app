import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { ACTIVITIES } from "@/lib/go-sportix/format";
import { useGo } from "@/lib/go-sportix/store";
import { ActivityAudienceChip } from "./ActivityAudienceChip";

export function ActivityPreflight() {
  const session = useGo((s) => s.session);
  const startActivity = useGo((s) => s.startActivity);
  const openSelect = useGo((s) => s.openSelect);
  const audience = useGo((s) => s.audience);
  const openSettings = useGo((s) => s.openSettings);
  if (!session) return null;
  const cfg = ACTIVITIES[session.activity];

  return (
    <div>
      <ScreenHeader title={cfg.label} subtitle="Ready to start" onBack={openSelect} />
      <div className="space-y-4 px-4 py-4">
        <ActivityAudienceChip audience={audience} onClick={openSettings} />
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          <ReadyRow k="GPS" v="READY ✓" />
          <ReadyRow k="HEALTH" v="CONNECTED ✓" />
          <ReadyRow k="WATCH" v="CONNECTED ✓" />
          <ReadyRow k="LOCATION" v="READY ✓" />
        </ul>
        <div className="rounded-2xl border border-lime/35 bg-lime/10 p-4">
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-lime">
            Media evidence
          </p>
          <p className="mt-1 text-sm font-semibold">Required before completion</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            You may add a photo/video of yourself or the activity place. You are never required to
            show yourself.
          </p>
        </div>
        {session.activity === "cycling" ? (
          <p className="rounded-xl border border-warn/40 bg-warn/10 px-3 py-2 text-2xs text-warn">
            Cycling is a target experience. Technical verification profile is pending — this will not
            claim SPORTIX VERIFIED production cycling.
          </p>
        ) : null}
        <Button className="h-14 w-full text-base" onClick={startActivity}>
          {cfg.startCta}
        </Button>
      </div>
    </div>
  );
}

function ReadyRow({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="tracking-[0.12em] text-muted">{k}</span>
      <span className="inline-flex items-center gap-1 font-semibold text-lime">
        <Check className="size-3.5" />
        {v.replace(" ✓", "")}
      </span>
    </li>
  );
}
