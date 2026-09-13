import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { useGo } from "@/lib/go-sportix/store";
import { useRooms } from "@/lib/rooms/store";
import { useShell } from "@/lib/shell/store";
import type { NotifCategory } from "@/lib/shell/store";
import { useSportix } from "@/lib/sportix/store";
import { cn } from "@/lib/utils";

const CATS: { id: NotifCategory; label: string }[] = [
  { id: "friends", label: "Friends" },
  { id: "chat", label: "Chat" },
  { id: "room", label: "Rooms" },
  { id: "verification", label: "Verification" },
  { id: "sport-id", label: "SPORT ID" },
  { id: "weekly", label: "Weekly" },
  { id: "sponsor", label: "Sponsor" },
  { id: "marketplace", label: "Marketplace" },
  { id: "prayer", label: "Prayer" },
];

export function NotificationCenter() {
  const items = useShell((s) => s.notifications);
  const muted = useShell((s) => s.muted);
  const toggleMute = useShell((s) => s.toggleMute);
  const digest = useShell((s) => s.digest);
  const setDigest = useShell((s) => s.setDigest);
  const markRead = useShell((s) => s.markRead);
  const markAllRead = useShell((s) => s.markAllRead);
  const close = () => useShell.getState().setOverlay("none");
  const navigate = useNavigate();

  const open = (n: (typeof items)[number]) => {
    markRead(n.id);
    close();
    if (n.payload?.tab) useSportix.getState().setTab(n.payload.tab as "people");
    if (n.payload?.room) {
      useGo.getState().openFind();
      useRooms.getState().openRoom(n.payload.room);
    }
    void navigate({ to: n.href as "/" | "/communities" | "/go-sportix" | "/weekly-legends" | "/sport-id" | "/marketplace" });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg">
      <div className="mx-auto max-w-md pb-16">
        <ScreenHeader title="Notifications" onBack={close} />
        <div className="flex items-center justify-between px-4 py-2">
          <button type="button" className="text-2xs text-lime" onClick={markAllRead}>
            Mark all read
          </button>
          <button type="button" className="text-2xs text-muted" onClick={() => setDigest(!digest)}>
            Digest {digest ? "on" : "off"}
          </button>
        </div>
        <div className="hide-scrollbar flex gap-1 overflow-x-auto px-4 pb-2">
          {CATS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleMute(c.id)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-3xs",
                muted.includes(c.id) ? "bg-elevated text-faint line-through" : "bg-surface text-muted",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <ul>
          {items.map((n) => (
            <li key={n.id} className="border-b border-border">
              <button type="button" onClick={() => open(n)} className="w-full px-4 py-3 text-left">
                <p className={cn("text-sm font-semibold", !n.read && "text-lime")}>{n.title}</p>
                <p className="text-2xs text-muted">{n.body}</p>
                <p className="mt-1 text-3xs text-faint">{n.at} · {n.category}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SettingsShell() {
  const close = () => useShell.getState().setOverlay("none");
  const s = useShell();
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg">
      <div className="mx-auto max-w-md pb-20">
        <ScreenHeader title="Settings" onBack={close} />
        <div className="space-y-2 px-4 py-4">
          <Row label="Profile / SPORT ID" onClick={() => { close(); void navigate({ to: "/sport-id" }); }} />
          <p className="pt-3 text-2xs tracking-[0.14em] text-muted">PRIVACY & AUDIENCE</p>
          {(["PUBLIC", "FRIENDS", "ONLY ME"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                s.setAudience(a);
                useGo.getState().setAudience(a);
              }}
              className={cn("h-11 w-full rounded-xl border text-sm", s.audience === a ? "border-lime" : "border-border")}
            >
              Verified posts · {a}
            </button>
          ))}
          <p className="pt-3 text-2xs tracking-[0.14em] text-muted">PERMISSIONS</p>
          <p className="text-2xs text-muted">
            Location {s.location} · Camera {s.camera} · Health {s.health} · Notifications {s.notifPerm}
          </p>
          {s.location === "denied" ? <p className="text-2xs text-warn">Outdoor GPS verification limited.</p> : null}
          {s.camera === "denied" ? <p className="text-2xs text-warn">Media-required activities cannot reach VERIFIED_COMPLETED until media is attached from library.</p> : null}
          <p className="pt-3 text-2xs tracking-[0.14em] text-muted">PRAYER AWARENESS</p>
          <Button variant={s.prayer ? "lime" : "outline"} className="w-full" onClick={() => s.setPrayer(!s.prayer)}>
            {s.prayer ? "Enabled" : "Off"} · never scored
          </Button>
          <p className="pt-3 text-2xs tracking-[0.14em] text-muted">LANGUAGE</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant={s.lang === "en" ? "lime" : "outline"} onClick={() => s.setLang("en")}>English</Button>
            <Button variant={s.lang === "ar" ? "lime" : "outline"} onClick={() => s.setLang("ar")}>العربية</Button>
          </div>
          <p className="pt-3 text-2xs tracking-[0.14em] text-muted">ACCESSIBILITY · SECURITY · DATA</p>
          <p className="text-2xs text-muted">Large tap targets. Reduced-motion respected. Session is local to this prototype. Consent controls live here; partners do not get private SPORT ID by default.</p>
          <Button variant="outline" className="w-full" onClick={() => useSportix.getState().openMessages()}>
            Blocked / muted users
          </Button>
          <Button variant="muted" className="w-full" onClick={() => { s.resetOnboarding(); }}>
            Replay onboarding
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-12 w-full rounded-xl border border-border bg-surface px-3 text-left text-sm">
      {label}
    </button>
  );
}
