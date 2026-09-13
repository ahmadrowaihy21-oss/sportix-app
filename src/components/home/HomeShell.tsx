import { Bell, Play, Plus, Swords, Trophy } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useGo } from "@/lib/go-sportix/store";
import { useMarket } from "@/lib/marketplace/store";
import { useRooms } from "@/lib/rooms/store";
import { useShell } from "@/lib/shell/store";
import { t } from "@/lib/shell/i18n";
import { nextPrayer } from "@/lib/shell/prayer";
import { useSportId } from "@/lib/sport-id/store";
import { useWeekly, useWeeklyBoard } from "@/lib/weekly-legends/store";
import { WeekCountdown } from "@/components/weekly-legends/WeeklyHeader";

export function HomeShell() {
  const lang = useShell((s) => s.lang);
  const overlay = useShell((s) => s.setOverlay);
  const prayerOn = useShell((s) => s.prayer);
  const unread = useShell((s) => s.notifications.filter((n) => !n.read).length);
  const session = useGo((s) => s.session);
  const navigate = useNavigate();
  const { meGlobal, next } = useWeeklyBoard();
  const ssp = useWeekly((s) => s.ssp);
  const endsAt = useWeekly((s) => s.endsAt);
  const lastMove = useWeekly((s) => s.lastMove);
  const records = useSportId((s) => s.goRecords);
  const points = useMarket((s) => s.pointsBalance);
  const rooms = useRooms((s) => s.rooms);
  const pending = rooms.filter((r) => r.viewerIn && (r.state === "CONFIRMING" || r.state === "FULL" || r.state === "REVIEW"));
  const prayer = nextPrayer();
  const live = session && ["ACTIVE", "PAUSED", "MEDIA_REQUIRED", "MEDIA_ATTACHED"].includes(session.state);

  const goStart = () => {
    useGo.getState().openSelect();
    void navigate({ to: "/go-sportix" });
  };
  const goFind = () => {
    useGo.getState().openFind();
    useRooms.getState().openList();
    void navigate({ to: "/go-sportix" });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-16 md:max-w-3xl lg:max-w-4xl">
      <header className="flex h-14 items-center justify-between px-4">
        <div>
          <p className="font-display text-sm tracking-[0.18em] text-lime">SPORTIX</p>
          <p className="text-2xs text-muted">What should I do next?</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t(lang, "notifications")}
            onClick={() => overlay("notifications")}
            className="relative flex size-11 items-center justify-center rounded-md hover:bg-elevated"
          >
            <Bell className="size-5" />
            {unread ? (
              <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-lime px-1 text-center text-[10px] font-bold text-lime-fg">
                {unread}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      <div className="space-y-4 px-4 pb-8">
        {prayerOn ? (
          <div className="rounded-2xl border border-border bg-surface px-4 py-3">
            <p className="text-2xs font-semibold tracking-[0.14em] text-muted">{t(lang, "prayer")}</p>
            <p className="mt-1 text-sm">
              Next {prayer.name} · {prayer.at} · in {prayer.mins} min
            </p>
            <p className="text-3xs text-faint">Optional awareness. Not scored. Not rewarded.</p>
          </div>
        ) : null}

        <section>
          <p className="text-2xs font-semibold tracking-[0.16em] text-lime">{t(lang, "nextMove")}</p>
          {live ? (
            <Button
              className="mt-3 h-14 w-full"
              onClick={() => {
                useGo.setState({ screen: session?.media ? "media" : "live" });
                void navigate({ to: "/go-sportix" });
              }}
            >
              <Play className="size-5" />
              {t(lang, "continueActivity")}
            </Button>
          ) : (
            <Button className="mt-3 h-14 w-full" onClick={goStart}>
              <Play className="size-5" />
              {t(lang, "startActivity")}
            </Button>
          )}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button type="button" onClick={goFind} className="rounded-2xl border border-border bg-surface px-3 py-3 text-left">
              <Swords className="size-4 text-lime" />
              <p className="mt-2 text-2xs font-semibold">{t(lang, "findGame")}</p>
            </button>
            <button
              type="button"
              onClick={() => {
                useGo.getState().openCreate();
                useRooms.getState().openCreate();
                void navigate({ to: "/go-sportix" });
              }}
              className="rounded-2xl border border-border bg-surface px-3 py-3 text-left"
            >
              <Plus className="size-4 text-lime" />
              <p className="mt-2 text-2xs font-semibold">{t(lang, "createGame")}</p>
            </button>
          </div>
        </section>

        <button
          type="button"
          onClick={() => void navigate({ to: "/weekly-legends" })}
          className="w-full rounded-2xl border border-lime/35 bg-lime/10 px-4 py-4 text-left"
        >
          <p className="flex items-center gap-2 text-2xs font-semibold tracking-[0.16em] text-lime">
            <Trophy className="size-4" /> {t(lang, "weekly")}
          </p>
          <div className="mt-2 flex items-end justify-between">
            <p className="font-display text-5xl leading-none">#{meGlobal?.rank ?? "—"}</p>
            <WeekCountdown endsAt={endsAt} />
          </div>
          <p className="mt-2 text-sm">
            {ssp.toLocaleString()} SSP AI
            {lastMove ? ` · ↑ ${lastMove.from - lastMove.to}` : ""}
            {next ? ` · ${Math.max(0, next.ssp - ssp)} to #${next.rank}` : ""}
          </p>
        </button>

        <button
          type="button"
          onClick={() => void navigate({ to: "/sport-id" })}
          className="w-full rounded-2xl border border-border bg-surface px-4 py-4 text-left"
        >
          <p className="text-2xs font-semibold tracking-[0.16em] text-muted">SPORT ID</p>
          <p className="mt-1 text-sm">
            {records[0]
              ? `Latest: ${records[0].distanceKm.toFixed(2)} KM ${records[0].activity} · verified`
              : "No GO SPORTIX activity this session yet"}
          </p>
        </button>

        <section>
          <p className="text-2xs font-semibold tracking-[0.16em] text-muted">MATCHES FOR YOU</p>
          <div className="mt-2 space-y-2">
            {rooms.slice(0, 2).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  useGo.getState().openFind();
                  useRooms.getState().openRoom(r.id);
                  void navigate({ to: "/go-sportix" });
                }}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-left"
              >
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="text-2xs text-muted">
                  {r.timeLabel} · {r.taken}/{r.seats} · {r.state}
                </p>
              </button>
            ))}
          </div>
        </section>

        {pending.length ? (
          <section className="rounded-2xl border border-warn/40 bg-warn/10 px-4 py-3">
            <p className="text-2xs font-semibold text-warn">PENDING</p>
            {pending.map((r) => (
              <p key={r.id} className="mt-1 text-sm">
                {r.title} · {r.state}
              </p>
            ))}
          </section>
        ) : null}

        <button
          type="button"
          onClick={() => void navigate({ to: "/marketplace" })}
          className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-left"
        >
          <p className="text-2xs font-semibold tracking-[0.16em] text-muted">MARKETPLACE VALUE</p>
          <p className="mt-1 text-sm">{points.toLocaleString()} SPORTIX AI Points · spending never changes SSP</p>
        </button>

        <button type="button" onClick={() => overlay("settings")} className="w-full text-center text-2xs text-faint">
          {t(lang, "settings")}
        </button>
      </div>
    </div>
  );
}
