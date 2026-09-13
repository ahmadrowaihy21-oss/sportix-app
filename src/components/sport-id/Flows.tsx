import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { addableSports } from "@/lib/sport-id/mock";
import { useSportId } from "@/lib/sport-id/store";
import { useGo } from "@/lib/go-sportix/store";

const intents = [
  "Track my activity",
  "Build my SPORT ID",
  "Connect an existing source",
  "Join matches",
  "Join an academy / club",
];

export function AddSportFlow() {
  const pop = useSportId((s) => s.pop);
  const addSport = useSportId((s) => s.addSport);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sport, setSport] = useState<(typeof addableSports)[number] | null>(null);
  const [intent, setIntent] = useState(intents[0]);

  return (
    <div className="pb-24">
      <ScreenHeader title="Add sport" subtitle={`Step ${step} of 3`} onBack={pop} />
      <div className="space-y-4 px-4 py-4">
        {step === 1 ? (
          <>
            <h2 className="text-sm font-semibold">Choose sport</h2>
            {addableSports.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSport(s)}
                className={
                  sport?.id === s.id
                    ? "flex h-12 w-full items-center rounded-xl border border-lime bg-lime/10 px-3 text-sm"
                    : "flex h-12 w-full items-center rounded-xl border border-border bg-surface px-3 text-sm"
                }
              >
                {s.label}
              </button>
            ))}
            <Button className="w-full" disabled={!sport} onClick={() => setStep(2)}>
              Continue
            </Button>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <h2 className="text-sm font-semibold">What do you want to do?</h2>
            {intents.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIntent(i)}
                className={
                  intent === i
                    ? "flex min-h-12 w-full items-center rounded-xl border border-lime bg-lime/10 px-3 py-2 text-left text-sm"
                    : "flex min-h-12 w-full items-center rounded-xl border border-border bg-surface px-3 py-2 text-left text-sm"
                }
              >
                {i}
              </button>
            ))}
            <Button className="w-full" onClick={() => setStep(3)}>
              Continue
            </Button>
          </>
        ) : null}
        {step === 3 ? (
          <>
            <h2 className="text-sm font-semibold">Evidence setup</h2>
            <p className="text-sm text-muted">
              Adding {sport?.label} does not make it a verified sport. Interest only is allowed until
              evidence exists.
            </p>
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted">
              <li>Football needs SPORTIX Vision, match evidence, sensors where applicable.</li>
              <li>Running needs GPS and health / watch with time integrity.</li>
              <li>Selected intent: {intent}</li>
            </ul>
            <Button
              className="w-full"
              onClick={() => sport && addSport(sport.id, sport.label, intent)}
            >
              Save as Interest only
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => sport && addSport(sport.id, sport.label, "Build my SPORT ID")}
            >
              Start building SPORT ID
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function SensorProfiles() {
  const pop = useSportId((s) => s.pop);
  return (
    <div className="pb-24">
      <ScreenHeader title="Verification sources" subtitle="Independent evidence" onBack={pop} />
      <div className="space-y-4 px-4 py-4">
        <p className="text-sm text-muted">
          SPORTIX combines independent sources. No single sensor is universal ground truth. Raw
          streams stay off SPORT ID.
        </p>
        <Profile
          title="School"
          steps="SPORTIX Vision → Athlete shortlist → Dual foot sensors where required → Controlled re-test → Coach review → SPORT ID evidence"
        />
        <Profile
          title="Academy"
          steps="SPORTIX Vision + dual foot sensors + body GNSS / IMU. Optional UWB / LPS. Purpose: longitudinal development."
        />
        <Profile
          title="Pro club"
          steps="Elite SPORTIX Vision + body + foot + UWB / LPS. Connected ball, biomechanics and physiology are separately governed."
        />
      </div>
    </div>
  );
}

function Profile({ title, steps }: { title: string; steps: string }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{steps}</p>
    </article>
  );
}

export function PlayLoopScreen() {
  const pop = useSportId((s) => s.pop);
  const selected = useSportId((s) => s.selected);
  const navigate = useNavigate();
  const label =
    selected === "running"
      ? "Start new run"
      : selected === "football" || selected === "padel"
        ? "Find match"
        : "Continue development";
  return (
    <div className="pb-24">
      <ScreenHeader title="GO SPORTIX" subtitle="Play → verify → record" onBack={pop} />
      <div className="space-y-3 px-4 py-6">
        <p className="text-sm leading-relaxed text-muted">
          Participation stays in GO SPORTIX / Match Room. It is not Marketplace venue booking and
          not a Community post.
        </p>
        <Button
          className="w-full"
          onClick={() => {
            if (selected === "running") useGo.getState().chooseActivity("running");
            else if (selected === "walking") useGo.getState().chooseActivity("walking");
            else if (selected === "cycling") useGo.getState().chooseActivity("cycling");
            else useGo.getState().openFind();
            void navigate({ to: "/go-sportix" });
          }}
        >
          {label}
        </Button>
        <p className="text-2xs text-faint">Prototype destination. Field rental is not listed here.</p>
      </div>
    </div>
  );
}
