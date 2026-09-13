import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { useGo } from "@/lib/go-sportix/store";
import { useRooms, type MatchRoom, type RoomSport } from "@/lib/rooms/store";
import { useShell } from "@/lib/shell/store";
import { cn } from "@/lib/utils";

const SPORTS: (RoomSport | "ALL")[] = ["ALL", "Football", "Padel", "Running", "Walking", "Gym"];

export function RoomsHost() {
  const screen = useRooms((s) => s.screen);
  if (screen === "create") return <CreateRoom />;
  if (screen === "detail" || screen === "edge") return <RoomDetail />;
  if (screen === "post-match") return <PostMatch />;
  return <FindRooms />;
}

export function FindRooms() {
  const goHome = useGo((s) => s.goHome);
  const rooms = useRooms((s) => s.rooms);
  const filter = useRooms((s) => s.sportFilter);
  const setFilter = useRooms((s) => s.setSportFilter);
  const openRoom = useRooms((s) => s.openRoom);
  const openCreate = useRooms((s) => s.openCreate);
  const list = filter === "ALL" ? rooms : rooms.filter((r) => r.sport === filter);

  return (
    <div className="pb-8">
      <ScreenHeader title="Find a game" subtitle="Rooms · not Marketplace booking" onBack={goHome} />
      <div className="hide-scrollbar flex gap-1 overflow-x-auto px-4 pt-3">
        {SPORTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn("h-8 shrink-0 rounded-full px-3 text-3xs", filter === s ? "bg-lime text-lime-fg" : "bg-elevated text-muted")}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-2 px-4 py-4">
        {list.map((r) => (
          <RoomCard key={r.id} room={r} onOpen={() => openRoom(r.id)} />
        ))}
        <Button variant="outline" className="w-full" onClick={openCreate}>
          CREATE A GAME
        </Button>
      </div>
    </div>
  );
}

function RoomCard({ room, onOpen }: { room: MatchRoom; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="w-full rounded-2xl border border-border bg-surface p-4 text-left">
      <p className="text-2xs tracking-[0.14em] text-lime">{room.sport} · {room.state}</p>
      <h3 className="mt-1 text-sm font-semibold">{room.title}</h3>
      <p className="text-2xs text-muted">
        {room.level} · {room.taken}/{room.seats} · {room.timeLabel} · {room.place} · {room.privacy}
      </p>
      <p className="mt-2 text-2xs text-faint">Why this match? {room.why}</p>
    </button>
  );
}

export function CreateRoom() {
  const step = useRooms((s) => s.createStep);
  const setStep = useRooms((s) => s.setCreateStep);
  const draft = useRooms((s) => s.draft);
  const patch = useRooms((s) => s.patchDraft);
  const create = useRooms((s) => s.createRoom);
  const openList = useRooms((s) => s.openList);
  const steps = ["SPORT", "PLAYERS", "LEVEL", "DATE/TIME", "PLACE", "PRIVACY", "OPTIONAL", "CREATE"];

  return (
    <div className="pb-8">
      <ScreenHeader title="Create a game" subtitle={steps[step - 1]} onBack={openList} />
      <div className="space-y-3 px-4 py-4">
        {step === 1 ? (
          (["Football", "Padel", "Running", "Walking", "Gym"] as RoomSport[]).map((s) => (
            <Choice key={s} on={draft.sport === s} onClick={() => patch({ sport: s })} label={s} />
          ))
        ) : null}
        {step === 2 ? (
          <label className="block text-sm">
            Seats
            <input
              type="number"
              value={draft.seats ?? 10}
              onChange={(e) => patch({ seats: Number(e.target.value) })}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-3 text-fg"
            />
          </label>
        ) : null}
        {step === 3 ? (
          ["Open", "Beginner", "Intermediate", "Advanced"].map((l) => (
            <Choice key={l} on={draft.level === l} onClick={() => patch({ level: l })} label={l} />
          ))
        ) : null}
        {step === 4 ? (
          <label className="block text-sm">
            When
            <input
              value={draft.timeLabel ?? ""}
              onChange={(e) => patch({ timeLabel: e.target.value })}
              placeholder="Tonight · 20:00"
              className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-3 text-fg"
            />
          </label>
        ) : null}
        {step === 5 ? (
          <label className="block text-sm">
            Place
            <input
              value={draft.place ?? ""}
              onChange={(e) => patch({ place: e.target.value })}
              placeholder="Corniche pitch"
              className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-3 text-fg"
            />
          </label>
        ) : null}
        {step === 6 ? (
          (["PUBLIC", "FRIENDS", "INVITE ONLY"] as const).map((p) => (
            <Choice key={p} on={draft.privacy === p} onClick={() => patch({ privacy: p })} label={p} />
          ))
        ) : null}
        {step === 7 ? (
          <>
            <Field label="Gender (optional)" value={draft.gender} onChange={(v) => patch({ gender: v })} />
            <Field label="Age (optional)" value={draft.age} onChange={(v) => patch({ age: v })} />
            <Field label="Price (optional)" value={draft.price} onChange={(v) => patch({ price: v })} />
            <Field label="Rules (optional)" value={draft.rules} onChange={(v) => patch({ rules: v })} />
            <p className="text-2xs text-faint">Venue/field booking is not Marketplace. Place belongs to GO SPORTIX rooms.</p>
          </>
        ) : null}
        {step === 8 ? (
          <>
            <p className="font-display text-3xl">{draft.title || draft.sport || "New match"}</p>
            <p className="text-sm text-muted">
              {draft.place} · {draft.timeLabel} · {draft.privacy}
            </p>
            <Button
              className="w-full"
              onClick={() => {
                if (!draft.title) patch({ title: `${draft.sport ?? "Match"} · ${draft.place ?? "Jeddah"}` });
                create();
              }}
            >
              CREATE ROOM
            </Button>
          </>
        ) : null}
        {step < 8 ? (
          <Button
            className="w-full"
            onClick={() => {
              if (step === 1 && !draft.title) patch({ title: `${draft.sport} match` });
              setStep(step + 1);
            }}
          >
            Next
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-3 text-fg" />
    </label>
  );
}

function Choice({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("h-12 w-full rounded-xl border", on ? "border-lime bg-lime/10" : "border-border bg-surface")}>
      {label}
    </button>
  );
}

export function RoomDetail() {
  const id = useRooms((s) => s.selectedId);
  const rooms = useRooms((s) => s.rooms);
  const openList = useRooms((s) => s.openList);
  const room = rooms.find((r) => r.id === id);
  const join = useRooms((s) => s.join);
  const leave = useRooms((s) => s.leave);
  const requestJoin = useRooms((s) => s.requestJoin);
  const confirm = useRooms((s) => s.confirm);
  const startPlay = useRooms((s) => s.startPlay);
  const complete = useRooms((s) => s.complete);
  const applyEdge = useRooms((s) => s.applyEdge);
  const prayerOn = useShell((s) => s.prayer);

  if (!room) {
    return (
      <div>
        <ScreenHeader title="Room" onBack={openList} />
        <p className="p-6 text-sm text-muted">Room not found.</p>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <ScreenHeader title={room.title} subtitle={`${room.state} · ${room.sport}`} onBack={openList} />
      <div className="space-y-3 px-4 py-4">
        <p className="text-sm text-muted">
          {room.level} · {room.taken}/{room.seats} seats · {room.timeLabel}
        </p>
        <p className="text-sm">{room.place}</p>
        <p className="text-2xs text-faint">Why this match? {room.why}</p>
        {room.privacy === "INVITE ONLY" && !room.viewerIn ? (
          <Button onClick={() => requestJoin(room.id)}>Request to join</Button>
        ) : !room.viewerIn ? (
          <Button className="w-full" onClick={() => join(room.id)}>
            {room.state === "FULL" ? "Join waitlist" : "Join room"}
          </Button>
        ) : (
          <p className="text-sm text-lime">You are in this room</p>
        )}

        {room.state === "CONFIRMING" ? (
          <Button className="w-full" onClick={() => confirm(room.id)}>
            Confirm attendance
          </Button>
        ) : null}
        {room.state === "CONFIRMED" || room.state === "JOINING" || (room.viewerIn && room.state === "OPEN") ? (
          <Button className="w-full" variant="outline" onClick={() => startPlay(room.id)}>
            Start play
          </Button>
        ) : null}
        {room.state === "IN_PROGRESS" ? (
          <Button className="w-full" onClick={() => complete(room.id)}>
            MATCH COMPLETE
          </Button>
        ) : null}

        <div className="rounded-2xl border border-border bg-surface p-3">
          <p className="text-2xs tracking-[0.14em] text-muted">VENUE / PROVIDER</p>
          <p className="mt-1 text-sm">{room.venueName} · {room.providerState}</p>
          <a href={room.mapsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-2xs text-lime">
            Directions
          </a>
          {room.bookingUrl ? (
            <a href={room.bookingUrl} target="_blank" rel="noreferrer" className="ml-3 text-2xs text-lime">
              External booking
            </a>
          ) : null}
          <p className="mt-2 text-3xs text-faint">Handoff only. This is not a Marketplace checkout.</p>
        </div>

        {prayerOn ? (
          <p className="text-2xs text-muted">
            Suggest Adjust time or Add prayer break. Dismiss anytime. Prayer is never scored.
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Edge id={room.id} k="player-cancel" l="Player cancels" apply={applyEdge} />
          <Edge id={room.id} k="host-cancel" l="Host cancels" apply={applyEdge} />
          <Edge id={room.id} k="no-show" l="No-show" apply={applyEdge} />
          <Edge id={room.id} k="waitlist" l="Promote waitlist" apply={applyEdge} />
          <Edge id={room.id} k="venue" l="Venue unavailable" apply={applyEdge} />
          <Edge id={room.id} k="timeout" l="Provider timeout" apply={applyEdge} />
          <Edge id={room.id} k="booking" l="Booking failure" apply={applyEdge} />
          <Edge id={room.id} k="attendance" l="Attendance dispute" apply={applyEdge} />
          <Edge id={room.id} k="outcome" l="Outcome dispute" apply={applyEdge} />
          <Edge id={room.id} k="verify-review" l="Verification review" apply={applyEdge} />
        </div>
        {room.edge ? <p className="text-sm text-warn">Edge applied: {room.edge}</p> : null}
        {room.viewerIn ? (
          <Button variant="muted" className="w-full" onClick={() => leave(room.id)}>
            Leave room
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function Edge({
  id,
  k,
  l,
  apply,
}: {
  id: string;
  k: string;
  l: string;
  apply: (id: string, k: string) => void;
}) {
  return (
    <button type="button" onClick={() => apply(id, k)} className="rounded-xl border border-border bg-bg px-2 py-2 text-left text-3xs text-muted">
      {l}
    </button>
  );
}

export function PostMatch() {
  const pm = useRooms((s) => s.postMatch);
  const setAttendance = useRooms((s) => s.setAttendance);
  const setOutcome = useRooms((s) => s.setOutcome);
  const setPeer = useRooms((s) => s.setPeer);
  const finish = useRooms((s) => s.finishPostMatch);
  const openList = useRooms((s) => s.openList);

  return (
    <div className="pb-10">
      <ScreenHeader title="Match complete" onBack={openList} />
      <div className="space-y-4 px-4 py-4">
        <p className="text-2xs tracking-[0.14em] text-lime">ATTENDANCE</p>
        <div className="grid grid-cols-2 gap-2">
          <Choice on={pm.attendance === "present"} onClick={() => setAttendance("present")} label="Present" />
          <Choice on={pm.attendance === "no-show"} onClick={() => setAttendance("no-show")} label="No-show" />
        </div>
        <label className="block text-sm">
          Outcome
          <input value={pm.outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="5-3 · we played" className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-3 text-fg" />
        </label>
        <p className="text-2xs tracking-[0.14em] text-lime">PEER EVALUATION</p>
        <p className="text-2xs text-faint">Sportsmanship / reliability / team play. Not SPORTIX Vision performance.</p>
        {(["sportsmanship", "reliability", "team"] as const).map((k) => (
          <label key={k} className="block text-sm">
            {k} · {pm.peer[k]}
            <input
              type="range"
              min={1}
              max={10}
              value={pm.peer[k]}
              onChange={(e) => setPeer(k, Number(e.target.value))}
              className="w-full"
            />
          </label>
        ))}
        <Button className="w-full" disabled={!pm.attendance} onClick={finish}>
          VERIFY MATCH
        </Button>
      </div>
    </div>
  );
}
