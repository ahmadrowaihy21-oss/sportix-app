import { useState } from "react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { useGo } from "@/lib/go-sportix/store";
import type { Audience, DemoOutcome } from "@/lib/go-sportix/types";
import { cn } from "@/lib/utils";
import { EvidenceStatus } from "./EvidenceStatus";
import { MediaPreview } from "./MediaPreview";

export function GoSettings() {
  const goHome = useGo((s) => s.goHome);
  const audience = useGo((s) => s.audience);
  const setAudience = useGo((s) => s.setAudience);
  const demoOutcome = useGo((s) => s.demoOutcome);
  const setDemoOutcome = useGo((s) => s.setDemoOutcome);
  const resetDemo = useGo((s) => s.resetDemo);
  const options: Audience[] = ["PUBLIC", "FRIENDS", "ONLY ME"];
  const outcomes: { id: DemoOutcome; label: string }[] = [
    { id: "verified", label: "Happy path · VERIFIED" },
    { id: "insufficient", label: "Error · INSUFFICIENT EVIDENCE" },
    { id: "review", label: "REVIEW REQUIRED" },
  ];

  return (
    <div>
      <ScreenHeader title="GO SPORTIX settings" onBack={goHome} />
      <div className="space-y-5 px-4 py-4">
        <section>
          <h2 className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
            Verified activity post audience
          </h2>
          <p className="mt-1 text-sm text-muted">
            Preconfigured. This is not asked at the end of a workout and is not a verification gate.
          </p>
          <div className="mt-3 grid gap-2">
            {options.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAudience(a)}
                className={cn(
                  "h-12 rounded-xl border text-sm font-semibold",
                  audience === a ? "border-lime bg-lime/10 text-fg" : "border-border bg-surface text-muted",
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
            Developer demo state
          </h2>
          <div className="mt-3 grid gap-2">
            {outcomes.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setDemoOutcome(o.id)}
                className={cn(
                  "h-12 rounded-xl border px-3 text-left text-sm",
                  demoOutcome === o.id ? "border-lime bg-lime/10" : "border-border bg-surface text-muted",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </section>
        <Button variant="outline" className="w-full" onClick={resetDemo}>
          RESET DEMO
        </Button>
      </div>
    </div>
  );
}

export function GymCheckIn() {
  const goHome = useGo((s) => s.goHome);
  const [phase, setPhase] = useState<"scan" | "session" | "media" | "done">("scan");
  const [media, setMedia] = useState<string | null>(null);

  return (
    <div>
      <ScreenHeader title="Gym check-in" subtitle="QR / barcode" onBack={goHome} />
      <div className="space-y-4 px-4 py-4">
        {phase === "scan" ? (
          <>
            <div className="flex aspect-photo items-center justify-center rounded-2xl border border-dashed border-border bg-surface">
              <div className="text-center">
                <QrCode className="mx-auto size-16 text-lime" />
                <p className="mt-3 text-sm text-muted">Align gym QR inside the frame</p>
              </div>
            </div>
            <Button className="h-14 w-full" onClick={() => setPhase("session")}>
              CHECK IN
            </Button>
          </>
        ) : null}
        {phase === "session" ? (
          <>
            <p className="text-2xs font-semibold tracking-[0.16em] text-lime">SESSION ACTIVE</p>
            <p className="font-display text-4xl">Force studio · Jeddah</p>
            <p className="text-sm text-muted">Media evidence required before check-out verification.</p>
            <EvidenceStatus media={false} gps={false} />
            <Button className="w-full" onClick={() => setPhase("media")}>
              CHECK OUT
            </Button>
          </>
        ) : null}
        {phase === "media" ? (
          <>
            <p className="text-sm text-muted">
              Add a photo of the gym floor or yourself. You are never required to show yourself.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setMedia(URL.createObjectURL(f));
              }}
            />
            {media ? <MediaPreview url={media} type="photo" subject="PLACE" /> : null}
            <Button className="w-full" disabled={!media} onClick={() => setPhase("done")}>
              FINISH & VERIFY
            </Button>
          </>
        ) : null}
        {phase === "done" ? (
          <>
            <p className="font-display text-4xl">GYM VERIFIED ✓</p>
            <p className="text-sm text-muted">Check-in and check-out bound. SPORT ID updated for gym attendance.</p>
            {media ? <MediaPreview url={media} type="photo" subject="PLACE" /> : null}
            <Button className="w-full" onClick={goHome}>
              Done
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function FindGame() {
  const goHome = useGo((s) => s.goHome);
  const [joined, setJoined] = useState<string | null>(null);
  const games = [
    { id: "g1", title: "Corniche 5-a-side", when: "Today · 19:30", spot: "Open 2 spots" },
    { id: "g2", title: "Padel social · Al Rawdah", when: "Tomorrow · 21:00", spot: "1 spot" },
    { id: "g3", title: "Easy 8K group run", when: "Fri · 06:30", spot: "Open" },
  ];
  return (
    <div>
      <ScreenHeader title="Find a game" subtitle="Participation · not venue booking" onBack={goHome} />
      <div className="space-y-2 px-4 py-4">
        <p className="text-sm text-muted">
          Match Room lives in GO SPORTIX. This is not Marketplace venue booking.
        </p>
        {games.map((g) => (
          <article key={g.id} className="rounded-2xl border border-border bg-surface p-4">
            <h3 className="text-sm font-semibold">{g.title}</h3>
            <p className="mt-1 text-2xs text-muted">
              {g.when} · {g.spot}
            </p>
            <Button
              className="mt-3 w-full"
              variant={joined === g.id ? "muted" : "lime"}
              onClick={() => setJoined(g.id)}
            >
              {joined === g.id ? "Joined" : "Join"}
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}

export function CreateGame() {
  const goHome = useGo((s) => s.goHome);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("Thursday padel");
  if (done) {
    return (
      <div>
        <ScreenHeader title="Game created" onBack={goHome} />
        <div className="space-y-3 px-4 py-6">
          <p className="font-display text-4xl leading-none">{name}</p>
          <p className="text-sm text-muted">
            Players join from GO SPORTIX. Field rental is not listed here.
          </p>
          <Button className="w-full" onClick={goHome}>
            Done
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <ScreenHeader title="Create a game" onBack={goHome} />
      <form
        className="space-y-3 px-4 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          setDone(true);
        }}
      >
        <label className="block text-sm">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-3"
          />
        </label>
        <p className="text-2xs text-muted">Not a Marketplace listing. No venue checkout.</p>
        <Button className="w-full" type="submit">
          Create game
        </Button>
      </form>
    </div>
  );
}
