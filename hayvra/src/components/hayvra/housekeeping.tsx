import { useEffect, useState } from "react";

const SERVICES = ["Full clean", "Light clean", "Towel change", "Linen change"] as const;
const SLOTS = [
  { value: "10:00", label: "10:00" },
  { value: "12:00", label: "12:00" },
  { value: "14:00", label: "14:00" },
  { value: "16:00", label: "16:00" },
] as const;

type Status = "confirmed" | "held" | "needs_reconfirm" | "in_progress" | "completed";
type Sync = "local" | "pending" | "opera";
type Role = "guest" | "staff";
type Sample = "open" | "progress" | "done";

type Request = {
  service: string;
  date: string;
  time: string;
  status: Status;
  interrupted: boolean;
};

type Audit = { at: string; message: string };

const STATUS_LABEL: Record<Status, string> = {
  confirmed: "Time confirmed",
  held: "Held for privacy",
  needs_reconfirm: "Waiting for confirmation",
  in_progress: "In progress",
  completed: "Cleaning complete",
};

function isoOf(day: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
}

function nextOpening() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const current = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const upcoming = SLOTS.find((slot) => slot.value > current);
  if (upcoming) return { date: isoOf(now), time: upcoming.value };
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { date: isoOf(tomorrow), time: SLOTS[0].value };
}

function clock() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function Housekeeping() {
  const [role, setRole] = useState<Role>("guest");
  const [stay, setStay] = useState(true);
  const [dnd, setDnd] = useState(false);
  const [sync, setSync] = useState<Sync>("local");
  const [request, setRequest] = useState<Request | null>(null);
  const [sample, setSample] = useState<Sample>("open");
  const [service, setService] = useState<string>(SERVICES[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState<string>(SLOTS[0].value);
  const [todayIso, setTodayIso] = useState("");
  const [audit, setAudit] = useState<Audit[]>([]);
  const [notice, setNotice] = useState("Room 1208 has no cleaning task until the guest confirms a time.");

  useEffect(() => {
    const opening = nextOpening();
    setTodayIso(isoOf(new Date()));
    setDate(opening.date);
    setTime(opening.time);
    setAudit([{ at: clock(), message: "Privacy and on-request housekeeping sample. The data is fictional." }]);
  }, []);

  function log(message: string) {
    setAudit((prev) => [{ at: clock(), message }, ...prev].slice(0, 8));
  }

  const executable =
    stay &&
    sync === "local" &&
    !dnd &&
    !!request &&
    (request.status === "confirmed" || request.status === "in_progress");

  function toggleDnd() {
    if (!stay) {
      setNotice("There is no active stay on this room.");
      return;
    }
    if (sync === "opera") {
      log("A local attempt did not cancel a privacy state that came from OPERA");
      setNotice("The OPERA state still stands. A guest cancellation does not open the room for cleaning until sync is resolved.");
      return;
    }
    const next = !dnd;
    const wasLive = request?.status === "in_progress";
    setDnd(next);
    if (next) {
      setRequest((current) => {
        if (!current || current.status === "completed") return current;
        return { ...current, status: "held", interrupted: current.status === "in_progress" };
      });
      const message = wasLive
        ? "Privacy was turned on during service. Staff were told to leave and escalate to a supervisor. The door is not opened or locked automatically."
        : "Room privacy is on, and the housekeeping task is blocked from execution.";
      log(message);
      setNotice(
        sync === "pending"
          ? "Do Not Disturb was saved locally only. OPERA could not be confirmed, so this does not claim the whole hotel received the state."
          : message,
      );
      return;
    }
    setRequest((current) =>
      current && current.status === "held" ? { ...current, status: "needs_reconfirm" } : current,
    );
    log("Do Not Disturb was turned off. The held request needs confirmation again. It does not resume on its own.");
    setNotice(
      sync === "pending"
        ? "The preference was lifted locally, and the external confirmation is still pending. Execution will not start before sync and a new confirmation."
        : "Do Not Disturb is off. Confirm the time again if you still want cleaning.",
    );
  }

  function requestCleaning() {
    if (!stay) {
      setNotice("Cleaning cannot be requested without an active stay.");
      return;
    }
    if (!date || (todayIso && date < todayIso)) {
      setNotice("Choose a valid date.");
      return;
    }
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const current = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (date === todayIso && time <= current) {
      setNotice("Choose a later time, or another day.");
      return;
    }
    const blocked = dnd || sync === "opera";
    setRequest({
      service,
      date,
      time,
      status: blocked ? "held" : "confirmed",
      interrupted: false,
    });
    if (sync === "opera") {
      log("A cleaning request was saved on hold because OPERA requires Do Not Disturb");
      setNotice("The request is saved but held. OPERA privacy prevents it from reaching housekeeping.");
      return;
    }
    if (dnd) {
      log("A cleaning time was saved on hold because of Do Not Disturb");
      setNotice("The request is saved and held. It will not appear for execution until privacy is lifted and the time is confirmed again.");
      return;
    }
    if (sync === "pending") {
      log("A time was saved, and execution is paused until OPERA sync returns");
      setNotice("The time is confirmed inside HAYVRA, but SYNC_PENDING blocks execution until the external system confirms.");
      return;
    }
    log("A cleaning request was confirmed for the guest’s chosen time");
    setNotice("The request is confirmed. Housekeeping can see it at that time, without identity data.");
  }

  function reconfirm() {
    if (!stay || !request || request.status !== "needs_reconfirm") return;
    if (dnd || sync === "opera") {
      setNotice("A time cannot be confirmed again while privacy is still on.");
      return;
    }
    if (sync === "pending") {
      setNotice("External confirmation is deferred. Execution will not be sent before sync returns.");
      return;
    }
    setRequest({ ...request, status: "confirmed", interrupted: false });
    log("The guest confirmed that the cleaning time should resume");
    setNotice("The time is confirmed and the task is available to the team.");
  }

  function cancel() {
    if (!request || request.status === "completed") return;
    setRequest(null);
    log("The guest cancelled the cleaning time");
    setNotice("The request was cancelled and removed from the execution list.");
  }

  function startTask() {
    if (request?.status === "in_progress" && executable) {
      setNotice("The task is already underway. An older device does not open the room again.");
      return;
    }
    if (!executable || !request || request.status !== "confirmed") {
      log("Starting the task was refused because the room is not available for execution");
      setNotice("It cannot start. Privacy is on, sync is pending, or the request is not confirmed.");
      return;
    }
    setRequest({ ...request, status: "in_progress" });
    log("Staff started the task after checking privacy and the stay");
    setNotice("Cleaning has started in the simulation.");
  }

  function completeTask() {
    if (!executable || !request || request.status !== "in_progress") {
      setNotice("There is no task in progress to finish.");
      return;
    }
    setRequest({ ...request, status: "completed", interrupted: false });
    log("Cleaning finished and the guest was notified inside the simulation");
    setNotice("The service is complete. A new time can be requested.");
  }

  function applySync(next: Sync) {
    if (!stay) {
      setNotice("There is no stay to sync.");
      return;
    }
    if (next === "pending") {
      setSync("pending");
      log("OPERA sync failed. The state is SYNC_PENDING and execution has stopped");
      setNotice("External confirmation failed. A supervisor is notified in this example, and cleaning will not start from HAYVRA until sync returns.");
      return;
    }
    if (next === "opera") {
      setSync("opera");
      setDnd(true);
      setRequest((current) => {
        if (!current || current.status === "completed") return current;
        return {
          ...current,
          status: "held",
          interrupted: current.status === "in_progress",
        };
      });
      log("Do Not Disturb arrived from OPERA and took priority over the HAYVRA task");
      setNotice("OPERA privacy overrides the local task. Cleaning will not be sent until it is resolved and the guest confirms the time.");
      return;
    }
    const wasOpera = sync === "opera";
    setSync("local");
    if (wasOpera) {
      setDnd(false);
      setRequest((current) =>
        current && current.status === "held" ? { ...current, status: "needs_reconfirm" } : current,
      );
      log("The OPERA state was lifted. The request needs the guest to confirm again");
      setNotice("Sync has returned and OPERA privacy was lifted. The request does not go back to the execution list on its own.");
      return;
    }
    log("Sync with OPERA has returned");
    setNotice("Sync is healthy in this example. Execution still depends on the guest’s confirmation and the privacy state.");
  }

  function endStay() {
    setStay(false);
    setDnd(false);
    setSync("local");
    setRequest(null);
    log("The stay ended or the room was reassigned. Previous room tasks are void");
    setNotice("Room 1208 no longer has an active stay. The old request is not valid.");
  }

  function newStay() {
    setStay(true);
    setDnd(false);
    setSync("local");
    setRequest(null);
    setSample("open");
    log("A new stay. Permissions from the previous stay do not carry over");
    setNotice("A new sample stay has started on room 1208.");
  }

  function safety() {
    log("A separate safety path: an emergency escalation was logged without cancelling privacy and without creating a cleaning task");
    setNotice("The safety path was written to the log. Do Not Disturb is not a lock, and an emergency is not used for ordinary cleaning.");
  }

  const headline = statusCopy(stay, dnd, sync, request);
  const activeCount = (sample === "done" ? 0 : 1) + (executable ? 1 : 0);
  const blockedCount = 2 + (stay && !executable ? 1 : 0);

  return (
    <section id="privacy" className="scroll-mt-24 border-t border-gold/20 py-20 md:py-28" aria-labelledby="privacy-title">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <p className="num" lang="en" dir="ltr">
          03.1
        </p>
        <p className="kicker mt-5" lang="en" dir="ltr">
          HAYVRA Privacy & Smart Housekeeping
        </p>
        <h2 id="privacy-title" className="mt-3 max-w-3xl text-3xl font-light md:text-5xl">
          Guest privacy, and cleaning when they ask
        </h2>
        <p className="quiet mt-5 max-w-3xl">
          A routine cleaning visit is not created during a stay unless the guest confirms a request. Do Not Disturb holds the task, and turning it off does not resume the task by itself. This simulation does not connect to Oracle OPERA, a lock, or a staff member.
        </p>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Simulation role">
          <button type="button" role="tab" aria-selected={role === "guest"} className={role === "guest" ? "choice is-on" : "choice"} onClick={() => setRole("guest")}>
            Guest app
          </button>
          <button type="button" role="tab" aria-selected={role === "staff"} className={role === "staff" ? "choice is-on" : "choice"} onClick={() => setRole("staff")}>
            Housekeeping board
          </button>
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            {role === "guest" ? (
              <div className="folio px-5 py-6 md:px-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-light">My room — 1208</h3>
                    <p className="quiet mt-1 text-sm">{stay ? "Active stay · sample" : "No active stay"}</p>
                  </div>
                  <span className="sim">{stay ? "Guest" : "Closed"}</span>
                </div>

                <div className="mt-6 border border-navy/15 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-light">Do Not Disturb</p>
                      <p className="quiet mt-1 text-sm">Blocks routine housekeeping visits. It is not a physical lock, and it does not cancel the safety path.</p>
                    </div>
                    <button type="button" className={dnd ? "choice is-on" : "choice"} aria-pressed={dnd} onClick={toggleDnd} disabled={!stay}>
                      {dnd ? "On" : "Off"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 border border-navy/15 px-4 py-4">
                  <p className="text-lg font-light">Request a room clean</p>
                  <p className="quiet mt-1 text-sm">Choose a service and a time from the open slots.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="field">
                      Service
                      <select value={service} onChange={(e) => setService(e.target.value)}>
                        {SERVICES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      Date
                      <input type="date" value={date} min={todayIso || undefined} onChange={(e) => setDate(e.target.value)} required />
                    </label>
                    <label className="field">
                      Time
                      <select value={time} onChange={(e) => setTime(e.target.value)}>
                        {SLOTS.map((slot) => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="field">
                      Request status
                      <p className="sim min-h-11">{request ? STATUS_LABEL[request.status] : "No request"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" className="btn btn-gold" onClick={requestCleaning} disabled={!stay}>
                      {request?.status === "completed" ? "Request a new clean" : "Confirm the cleaning request"}
                    </button>
                    {request?.status === "needs_reconfirm" ? (
                      <button type="button" className="btn btn-line !text-navy" onClick={reconfirm}>
                        Confirm the time again
                      </button>
                    ) : null}
                    <button type="button" className="btn btn-line !text-navy" onClick={cancel} disabled={!request || request.status === "completed"}>
                      Cancel the request
                    </button>
                  </div>
                  <p className="quiet mt-4 text-sm leading-relaxed">
                    {request
                      ? `${request.service} — ${request.date} at ${request.time}. ${request.interrupted ? "A visit in progress was stopped because of privacy." : STATUS_LABEL[request.status]}.`
                      : "Nothing is sent to a real staff member. The times are fictional."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="panel px-5 py-6 md:px-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-light">Housekeeping tasks</h3>
                    <p className="quiet mt-1 text-sm">Only tasks that may be carried out. No guest name, and no reason for the guest’s choice.</p>
                  </div>
                  <span className="sim">Simulation</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="border border-gold/20 px-4 py-4">
                    <strong className="block text-3xl font-light tabular-nums">{activeCount}</strong>
                    <span className="quiet text-sm">Ready to run</span>
                  </div>
                  <div className="border border-gold/20 px-4 py-4">
                    <strong className="block text-3xl font-light tabular-nums">{blockedCount}</strong>
                    <span className="quiet text-sm">Not available to clean</span>
                  </div>
                </div>
                <ul className="mt-5">
                  <StaffRow
                    room="1210"
                    detail="Full clean — 11:30"
                    state={sample === "done" ? "Complete" : sample === "progress" ? "In progress" : "Confirmed"}
                    action={sample === "done" ? undefined : sample === "progress" ? "Finish cleaning" : "Start cleaning"}
                    onAction={() => setSample((value) => (value === "open" ? "progress" : "done"))}
                  />
                  {executable && request ? (
                    <StaffRow
                      room="1208"
                      detail={`${request.service} — ${request.date} at ${request.time}`}
                      state={request.status === "in_progress" ? "In progress" : "Confirmed"}
                      action={request.status === "in_progress" ? "Finish cleaning" : "Start cleaning"}
                      onAction={request.status === "in_progress" ? completeTask : startTask}
                    />
                  ) : null}
                </ul>
                <div className="mt-5 border-t border-gold/20 pt-4">
                  <p className="kicker">Hidden from execution</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center justify-between gap-3">
                      <span>Room 1204</span>
                      <span className="sim">Privacy</span>
                    </li>
                    <li className="flex items-center justify-between gap-3">
                      <span>Room 1216</span>
                      <span className="sim">No request</span>
                    </li>
                    {stay && !executable ? (
                      <li className="flex items-center justify-between gap-3">
                        <span>Room 1208</span>
                        <span className="sim">{blockReason(dnd, sync, request)}</span>
                      </li>
                    ) : null}
                  </ul>
                </div>
                <button type="button" className="btn btn-line mt-5" onClick={startTask}>
                  Retry from an older device
                </button>
                <p className="note mt-4">The retry checks privacy now. A task saved earlier is not enough to enter.</p>
              </div>
            )}
            <p className="note mt-4" role="status">
              {notice}
            </p>
          </div>

          <aside className="grid gap-4">
            <div className="panel px-4 py-5">
              <p className="kicker" lang="en" dir="ltr">
                Room 1208
              </p>
              <h3 className="mt-3 text-2xl font-light">{headline[0]}</h3>
              <p className="quiet mt-3 text-sm leading-relaxed">{headline[1]}</p>
            </div>
            <div className="panel px-4 py-5">
              <p className="text-lg font-light">Sync simulation</p>
              <p className="quiet mt-2 text-sm">These are not guest controls. They show what happens if OPERA is ahead, or if it cannot be reached.</p>
              <div className="choice-stack mt-4 flex flex-col gap-2">
                <button type="button" className={sync === "local" && stay ? "choice is-on" : "choice"} aria-pressed={sync === "local"} onClick={() => applySync("local")}>
                  Sync is healthy
                </button>
                <button type="button" className={sync === "pending" ? "choice is-on" : "choice"} aria-pressed={sync === "pending"} onClick={() => applySync("pending")}>
                  OPERA unavailable
                </button>
                <button type="button" className={sync === "opera" ? "choice is-on" : "choice"} aria-pressed={sync === "opera"} onClick={() => applySync("opera")}>
                  Do Not Disturb from OPERA
                </button>
                <button type="button" className="choice" onClick={stay ? endStay : newStay}>
                  {stay ? "End the stay or move the room" : "Start a new stay"}
                </button>
                <button type="button" className="choice" onClick={safety}>
                  Separate safety path
                </button>
              </div>
            </div>
            <div className="panel px-4 py-5">
              <p className="text-lg font-light">Recent events</p>
              <ul className="audit mt-3">
                {audit.map((item, index) => (
                  <li key={`${item.at}-${index}`}>
                    {item.message}
                    <time dateTime={item.at}>{item.at}</time>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function StaffRow({
  room,
  detail,
  state,
  action,
  onAction,
}: {
  room: string;
  detail: string;
  state: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <li className="border-b border-gold/15 py-4 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <b className="font-medium">Room {room}</b>
        <span className="sim">{state}</span>
      </div>
      <p className="quiet mt-1 text-sm">{detail}</p>
      {action && onAction ? (
        <button type="button" className="btn btn-gold mt-3" onClick={onAction}>
          {action}
        </button>
      ) : null}
    </li>
  );
}

function blockReason(dnd: boolean, sync: Sync, request: Request | null) {
  if (sync === "pending") return "Sync pending";
  if (sync === "opera" || dnd) return request?.interrupted ? "Leave now" : "Privacy";
  if (!request) return "No request";
  if (request.status === "needs_reconfirm") return "Awaiting confirmation";
  if (request.status === "held") return "Held";
  if (request.status === "completed") return "Complete";
  return "Not available";
}

function statusCopy(stay: boolean, dnd: boolean, sync: Sync, request: Request | null): [string, string] {
  if (!stay) return ["No stay on this room", "Moving the room or ending the stay voids the old tasks."];
  if (sync === "pending") return ["SYNC_PENDING", "The app does not claim the whole hotel received the privacy state. Execution is paused, and a supervisor is notified in this example."];
  if (sync === "opera") return ["OPERA requires privacy", "The service state from OPERA overrides the cleaning task until it is resolved, and then the guest confirms again."];
  if (dnd) return ["Privacy is on", "No task can be executed. An emergency is a separate, logged path, and it is not used for ordinary cleaning."];
  if (!request) return ["Cleaning on request", "There is no routine visit to room 1208 in this simulation."];
  if (request.status === "needs_reconfirm") return ["The time needs your confirmation", "After privacy is lifted, the old request does not return to the team by itself."];
  if (request.status === "held") return ["The request is held", "It will not be assigned while privacy is on."];
  if (request.status === "in_progress") return ["Cleaning is underway", "It started after a current privacy check."];
  if (request.status === "completed") return ["The service is complete", "You can book another time whenever you wish."];
  return ["Time confirmed", "The team can see the task at that time, without the guest’s identity."];
}
