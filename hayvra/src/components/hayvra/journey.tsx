import { useState } from "react";

const STEPS = [
  { id: "before", label: "Before arrival" },
  { id: "arrival", label: "Arrival" },
  { id: "room", label: "Room" },
  { id: "services", label: "Services" },
  { id: "depart", label: "Departure" },
  { id: "loyalty", label: "Loyalty" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export function Journey() {
  const [step, setStep] = useState<StepId>("before");
  const [automation, setAutomation] = useState(true);
  const [otherGuest, setOtherGuest] = useState(false);
  const [away, setAway] = useState(false);
  const stay = step === "room" || step === "services" || step === "depart";

  let pos: "far" | "door" | "in" = "far";
  if (step === "arrival") pos = "door";
  if (step === "room" || step === "services") pos = away ? "far" : "in";
  if (step === "depart") pos = away ? "far" : "door";

  const story = narrative(step, automation, otherGuest, away && stay);

  return (
    <section id="journey" className="scroll-mt-24 border-t border-gold/20 py-20 md:py-28" aria-labelledby="journey-title">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <p className="num">03</p>
        <p className="kicker mt-5" lang="en" dir="ltr">
          The Intelligent Guest Journey
        </p>
        <h2 id="journey-title" className="mt-3 max-w-3xl text-3xl font-light md:text-5xl">
          The guest journey, from approach to loyalty
        </h2>
        <p className="quiet mt-5 max-w-3xl">
          A concept simulation. It is not live tracking, and it does not control a real room.
        </p>
        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Journey stages">
          {STEPS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={step === item.id}
              className={step === item.id ? "choice is-on" : "choice"}
              onClick={() => setStep(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-8 grid items-stretch gap-8 md:grid-cols-2">
          <div>
            <div className="stage" aria-hidden="true">
              <div className="stage-room">
                <span className="kicker">Room</span>
              </div>
              <span className="stage-dot" data-pos={pos} />
            </div>
          </div>
          <div className="flex flex-col gap-5" aria-live="polite">
            <p className="text-xl font-light leading-relaxed md:text-2xl">{story}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="choice" aria-pressed={automation} onClick={() => setAutomation((v) => !v)}>
                Room automation: {automation ? "Available in this example" : "Not available"}
              </button>
              {stay ? (
                <>
                  <button type="button" className="choice" aria-pressed={otherGuest} onClick={() => setOtherGuest((v) => !v)}>
                    Another guest in the room: {otherGuest ? "Yes" : "No"}
                  </button>
                  <button type="button" className="choice" aria-pressed={away} onClick={() => setAway((v) => !v)}>
                    400 meters away: {away ? "Yes" : "No"}
                  </button>
                </>
              ) : null}
            </div>
            <p className="note">
              When guests are about 400 meters away, the system checks that the room is empty, then applies an energy-saving mode according to hotel policy. Location alone does not switch off the climate if another guest remains.
            </p>
            <a className="nav-link" href="#key">
              The guest card is added after sign-in
            </a>
            <a className="nav-link" href="#privacy">
              Room privacy and smart housekeeping
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function narrative(step: StepId, automation: boolean, otherGuest: boolean, away: boolean) {
  if (step === "before") {
    return automation
      ? "The guest is approaching. If the hotel has linked automation, the room starts preparing from the saved preference. Without devices, the preference stays ready for the team only."
      : "The guest is approaching. Preferences are saved for the team. Lighting and climate do not switch on, because this example hotel has no room automation.";
  }
  if (step === "arrival") {
    return "Arrival. A digital key is shown as a later step only if the integrations and permissions are complete. Digital reception stays available even without a smart lock.";
  }
  if (step === "room" || step === "services") {
    if (!automation) return "Digital services work: requests, amenities, and messages to departments. Climate and curtains do not appear because the devices are not linked.";
    if (away && otherGuest) return "Location says one guest has left. Another guest is still in the room, so the climate is not switched off from location alone.";
    if (away && !otherGuest) return "In this example the room is empty and the guests are 400 meters away. A saving mode can apply according to hotel policy, not as an absolute automatic decision.";
    return step === "services"
      ? "Dining and amenity requests arrive as tasks for the departments. Housekeeping is scheduled only when the guest asks, and Do Not Disturb holds it until the guest confirms again. The team and the operating system still carry out the work."
      : "The room is occupied. Climate, lighting, and curtains can be set from the app because automation is available in this example.";
  }
  if (step === "depart") {
    if (away && otherGuest) return "The departing guest has left, but the room is not empty. Energy saving is not applied from one person’s location.";
    if (away) return "After departure, and after the room is confirmed empty, a saving mode can follow hotel policy.";
    return "Departure is a clearer path for the folio and the farewell. Nothing in the room is switched off, because location alone is not enough.";
  }
  return "If the transaction qualifies, SPORTIX Points are calculated only under SPORTIX rules. The hotel does not issue the points and does not change their value.";
}
