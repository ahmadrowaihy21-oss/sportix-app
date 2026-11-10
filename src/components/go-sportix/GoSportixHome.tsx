import { ArrowUpRight, Bike, Dumbbell, Footprints, Mountain, Play, Plus, QrCode, Settings2, Swords, Trophy } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useGo } from "@/lib/go-sportix/store";
import { useWeekly, useWeeklyBoard } from "@/lib/weekly-legends/store";
import { ActivityAudienceChip } from "./ActivityAudienceChip";

export function GoSportixHome() {
  const openSelect = useGo((s) => s.openSelect);
  const openGym = useGo((s) => s.openGym);
  const openFind = useGo((s) => s.openFind);
  const openCreate = useGo((s) => s.openCreate);
  const openSettings = useGo((s) => s.openSettings);
  const audience = useGo((s) => s.audience);
  const resetDemo = useGo((s) => s.resetDemo);
  const session = useGo((s) => s.session);
  const navigate = useNavigate();
  const markEntered = useWeekly((s) => s.markEntered);
  const { meGlobal } = useWeeklyBoard();
  const lastMove = useWeekly((s) => s.lastMove);

  return (
    <div className="space-y-5 px-4 pb-10 pt-5">
      {session && (session.state === "ACTIVE" || session.state === "PAUSED" || session.state === "MEDIA_REQUIRED" || session.state === "MEDIA_ATTACHED") ? (
        <button
          type="button"
          onClick={() => useGo.setState({ screen: session.media ? "media" : "live" })}
          className="w-full rounded-2xl border border-lime/40 bg-lime/10 px-4 py-3 text-left"
        >
          <p className="text-2xs font-semibold tracking-[0.16em] text-lime">SESSION IN PROGRESS</p>
          <p className="mt-1 text-sm">Resume {session.activity}</p>
        </button>
      ) : null}
      <div>
        <p className="font-display text-3xl leading-none tracking-tight">GO SPORTIX</p>
        <p className="mt-2 text-sm text-muted">Start. Move. Prove. Verify. Record.</p>
        <div className="mt-3">
          <ActivityAudienceChip audience={audience} onClick={openSettings} />
        </div>
      </div>

      <Button className="h-14 w-full text-base" onClick={openSelect}>
        <Play className="size-5" />
        START ACTIVITY
      </Button>

      <section aria-labelledby="go-systems-heading" className="space-y-3">
        <h2 id="go-systems-heading" className="text-2xs font-semibold tracking-[0.16em] text-muted">
          GO SPORTIX SYSTEMS
        </h2>
        <a
          href="https://knoq-fight-intelligence.ahmadrowaihy.chatgpt.site/go-sportix/knoq"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-2xl border border-red-500/30 bg-surface px-4 py-4 text-left transition-colors hover:border-red-400/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400"
          aria-label="Open KNOQ boxing system, private coach workspace in a new tab"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 font-display text-2xl text-red-400" aria-hidden="true">K</span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-xl tracking-wide">KNOQ <span className="font-sans text-2xs text-red-300">BOXING</span></span>
            <span className="mt-1 block text-xs leading-relaxed text-muted">Manual video review, boxing metrics and session comparison.</span>
            <span className="mt-2 block text-3xs text-faint">Private workspace · ChatGPT sign-in · Opens in a new tab</span>
          </span>
          <ArrowUpRight className="size-4 shrink-0 text-red-300" aria-hidden="true" />
        </a>
      </section>

      <button
        type="button"
        onClick={() => {
          markEntered();
          void navigate({ to: "/weekly-legends" });
        }}
        className="flex w-full items-center gap-3 rounded-2xl border border-lime/35 bg-lime/10 px-4 py-3 text-left"
      >
        <Trophy className="size-5 text-lime" />
        <span className="min-w-0 flex-1">
          <span className="block text-2xs font-semibold tracking-[0.14em] text-lime">WEEKLY LEGENDS</span>
          <span className="text-sm">
            You are #{meGlobal?.rank ?? "—"}
            {lastMove ? ` · ↑ ${lastMove.from - lastMove.to} this session` : ""}
          </span>
        </span>
      </button>

      <div className="grid grid-cols-2 gap-2">
        <Action icon={Swords} label="FIND A GAME" onClick={openFind} />
        <Action icon={Plus} label="CREATE A GAME" onClick={openCreate} />
        <Action icon={QrCode} label="GYM CHECK-IN" onClick={openGym} />
        <Action icon={Settings2} label="SETTINGS" onClick={openSettings} />
      </div>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-lime">Verified completion</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          A qualifying activity becomes SPORTIX VERIFIED only after required evidence is satisfied.
          Media is required. Sharing is not.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-3xs text-muted">
          <span className="inline-flex items-center gap-1 rounded-full bg-elevated px-2 py-1">
            <Footprints className="size-3 text-lime" /> Run
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-elevated px-2 py-1">
            <Footprints className="size-3 text-lime" /> Walk
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-elevated px-2 py-1">
            <Mountain className="size-3 text-lime" /> Hike
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-elevated px-2 py-1">
            <Bike className="size-3 text-warn" /> Cycle · target
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-elevated px-2 py-1">
            <Dumbbell className="size-3 text-lime" /> Gym
          </span>
        </div>
      </section>

      <button type="button" onClick={resetDemo} className="w-full text-center text-3xs text-faint">
        Reset demo
      </button>
    </div>
  );
}

function Action({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Play;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-20 flex-col items-start justify-center gap-2 rounded-2xl border border-border bg-surface px-3 py-3 text-left hover:border-border-strong"
    >
      <Icon className="size-5 text-lime" />
      <span className="text-2xs font-semibold tracking-[0.12em]">{label}</span>
    </button>
  );
}
