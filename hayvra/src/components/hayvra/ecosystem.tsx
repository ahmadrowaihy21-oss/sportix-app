import { useState, type ReactNode } from "react";
import { GuestKeyCard } from "@/components/hayvra/key-card";

const INDEX = [
  { href: "#guest", n: "01", name: "Guest", en: "Guest" },
  { href: "#os", n: "02", name: "Operations", en: "OS" },
  { href: "#intelligence", n: "03", name: "Intelligence", en: "Intelligence" },
  { href: "#connect", n: "04", name: "Connect", en: "Connect" },
  { href: "#key", n: "05", name: "Key", en: "Key" },
  { href: "#growth", n: "06", name: "Growth", en: "Growth" },
  { href: "#rewards", n: "07", name: "Rewards", en: "Rewards" },
];

export function Ecosystem() {
  return (
    <div id="ecosystem" className="scroll-mt-24">
      <section className="border-t border-gold/20 px-5 py-20 md:px-8 md:py-28" aria-labelledby="eco-title">
        <div className="mx-auto w-full max-w-6xl">
          <p className="num">02</p>
          <p className="kicker mt-5" lang="en" dir="ltr">
            Hayvra Ecosystem
          </p>
          <h2 id="eco-title" className="mt-3 max-w-3xl text-3xl font-light md:text-5xl">
            Seven systems, one ecosystem
          </h2>
          <p className="quiet mt-5 max-w-3xl">
            Each system has a role. None of them replaces the hotel system, and no link is shown as live today.
          </p>
          <ol className="mt-10 grid grid-cols-2 gap-px bg-gold/25 sm:grid-cols-4 lg:grid-cols-7">
            {INDEX.map((item) => (
              <li key={item.href} className="bg-navy">
                <a href={item.href} className="flex min-h-24 flex-col justify-between p-3 no-underline hover:text-gold">
                  <span className="num">{item.n}</span>
                  <span className="mt-4 block text-sm">{item.name}</span>
                  <span className="kicker mt-1" lang="en" dir="ltr">
                    {item.en}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <GuestChapter />
      <OsChapter />
      <IntelChapter />
      <ConnectChapter />
      <KeyChapter />
      <GrowthChapter />
      <RewardsChapter />
    </div>
  );
}

function Chapter({
  id,
  index,
  en,
  title,
  children,
  text,
}: {
  id: string;
  index: string;
  en: string;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-gold/20 py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-10 px-5 md:grid-cols-2 md:gap-16 md:px-8">
        <div>
          <p className="num">{index}</p>
          <p className="kicker mt-5" lang="en" dir="ltr">
            {en}
          </p>
          <h2 id={`${id}-title`} className="mt-3 text-3xl font-light md:text-5xl">
            {title}
          </h2>
          <p className="mt-6 text-base leading-relaxed md:text-lg">{text}</p>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

type GuestTab = "stay" | "dine" | "climate" | "assist" | "book" | "privacy" | "key";

function GuestChapter() {
  const [tab, setTab] = useState<GuestTab>("stay");
  const [temp, setTemp] = useState(22);
  const [light, setLight] = useState("Quiet");
  const [openCurtain, setOpenCurtain] = useState(true);
  const [ordered, setOrdered] = useState(false);
  const [booked, setBooked] = useState(false);
  const [draft, setDraft] = useState("");
  const [lines, setLines] = useState([
    { from: "guest", text: "I need two extra pillows." },
    { from: "hayvra", text: "I will send this to housekeeping. I will not change room devices without hotel policy." },
  ]);

  const tabs: { id: GuestTab; label: string }[] = [
    { id: "stay", label: "Stay" },
    { id: "dine", label: "Dining" },
    { id: "climate", label: "Room" },
    { id: "assist", label: "Assistant" },
    { id: "book", label: "Amenities" },
    { id: "privacy", label: "Privacy" },
    { id: "key", label: "Key" },
  ];

  return (
    <Chapter
      id="guest"
      index="02.1"
      en="HAYVRA Guest"
      title="The intelligent guest app"
      text="Stay, dining, amenity booking, privacy, and a conversational assistant. Climate, lighting, curtains, and the digital key appear only when the hotel’s setup allows them. Tap a function to explore the interface."
    >
      <div className="phone mx-auto">
        <div className="phone-screen" role="tabpanel">
          <div className="flex items-center justify-between px-4 pt-4">
            <span className="kicker" lang="en" dir="ltr">
              Hayvra Guest
            </span>
            <span className="sim">Simulation</span>
          </div>
          <div className="px-4 py-4 text-sm leading-relaxed">
            {tab === "stay" ? (
              <>
                <p className="text-lg font-light">Your stay</p>
                <p className="mt-3">Suite · example 1214</p>
                <p className="quiet">Arrival tomorrow · three nights</p>
                <p className="mt-4">Room preparation is shown to the team. Devices wait for a real connection.</p>
              </>
            ) : null}
            {tab === "dine" ? (
              <>
                <p className="text-lg font-light">Breakfast in the room</p>
                <p className="mt-3">Tea · pastries · fruit</p>
                <p className="quiet mt-2">A sample menu, with no real prices.</p>
                <button type="button" className="btn btn-gold mt-4 w-full" onClick={() => setOrdered(true)}>
                  {ordered ? "Sent to dining · simulation" : "Send the order"}
                </button>
              </>
            ) : null}
            {tab === "climate" ? (
              <>
                <p className="text-lg font-light">Room climate</p>
                <p className="mt-3 text-3xl tabular-nums">{temp}°</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" className="btn btn-line !text-navy" onClick={() => setTemp((n) => Math.max(18, n - 1))}>
                    Cooler
                  </button>
                  <button type="button" className="btn btn-line !text-navy" onClick={() => setTemp((n) => Math.min(26, n + 1))}>
                    Warmer
                  </button>
                </div>
                <p className="mt-4">Lighting: {light}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="choice !text-navy" onClick={() => setLight("Quiet")}>Quiet</button>
                  <button type="button" className="choice !text-navy" onClick={() => setLight("Welcome")}>Welcome</button>
                </div>
                <button type="button" className="btn btn-line !text-navy mt-4 w-full" onClick={() => setOpenCurtain((v) => !v)}>
                  Curtains: {openCurtain ? "Open" : "Closed"}
                </button>
                <p className="quiet mt-3">These controls are an interface only. They work in a hotel if the device is linked.</p>
              </>
            ) : null}
            {tab === "assist" ? (
              <>
                <p className="text-lg font-light">Assistant</p>
                <ul className="mt-3 space-y-2">
                  {lines.map((line, i) => (
                    <li key={`${line.from}-${i}`} className={line.from === "guest" ? "quiet" : ""}>
                      {line.from === "guest" ? "Guest: " : "HAYVRA: "}
                      {line.text}
                    </li>
                  ))}
                </ul>
                <form
                  className="mt-4 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = draft.trim();
                    if (!text) return;
                    setLines((prev) => [
                      ...prev,
                      { from: "guest", text },
                      {
                        from: "hayvra",
                        text: "This assistant is illustrative. In operation, requests go to the team under the hotel’s permissions.",
                      },
                    ]);
                    setDraft("");
                  }}
                >
                  <label className="sr-only" htmlFor="assist-draft">
                    Sample message
                  </label>
                  <input
                    id="assist-draft"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="min-h-11 flex-1 border border-navy/20 bg-transparent px-2 text-navy"
                    placeholder="Write a sample request"
                  />
                  <button type="submit" className="btn btn-gold">
                    Send
                  </button>
                </form>
              </>
            ) : null}
            {tab === "book" ? (
              <>
                <p className="text-lg font-light">Pool</p>
                <p className="mt-3 quiet">Two sample sessions: 10:00 and 16:00.</p>
                <button type="button" className="btn btn-gold mt-4 w-full" onClick={() => setBooked(true)}>
                  {booked ? "Booked in the simulation" : "Book the session"}
                </button>
              </>
            ) : null}
            {tab === "privacy" ? (
              <>
                <p className="text-lg font-light">Room privacy</p>
                <p className="mt-3">Cleaning starts only when you ask. Do Not Disturb holds the task, and it resumes only if you confirm again.</p>
                <a className="btn btn-line !text-navy mt-4 w-full" href="#privacy">
                  Try the simulation
                </a>
              </>
            ) : null}
            {tab === "key" ? (
              <>
                <p className="text-lg font-light">Digital key</p>
                <p className="mt-3">The guest card is added to the phone wallet after sign-in. It is not on by default.</p>
                <a className="btn btn-line !text-navy mt-4 w-full" href="#key">
                  Sign in to add the card
                </a>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Guest app functions">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? "choice is-on" : "choice"}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </Chapter>
  );
}

type Status = "New" | "In progress" | "Done";

function OsChapter() {
  const [tasks, setTasks] = useState([
    { id: "hk", dept: "Housekeeping", title: "Prepare suite 1214", status: "New" as Status },
    { id: "mt", dept: "Maintenance", title: "Corridor climate note", status: "New" as Status },
    { id: "fb", dept: "Dining", title: "Breakfast to the room", status: "In progress" as Status },
    { id: "fo", dept: "Reception", title: "Welcome on arrival", status: "Done" as Status },
  ]);
  const cycle: Status[] = ["New", "In progress", "Done"];
  return (
    <Chapter
      id="os"
      index="02.2"
      en="HAYVRA OS"
      title="Hotel operations on one path"
      text="Tasks, requests, housekeeping, maintenance, and coordination between departments. The board below is sample data marked as a simulation. It is not the performance of a live hotel."
    >
      <div className="panel">
        <div className="flex items-center justify-between border-b border-gold/20 px-4 py-3">
          <p className="kicker" lang="en" dir="ltr">HAYVRA OS</p>
          <span className="sim">Simulation</span>
        </div>
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className="border-b border-gold/15 last:border-b-0">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-start"
                onClick={() =>
                  setTasks((prev) =>
                    prev.map((row) =>
                      row.id === task.id
                        ? { ...row, status: cycle[(cycle.indexOf(row.status) + 1) % cycle.length] ?? "New" }
                        : row,
                    ),
                  )
                }
              >
                <span>
                  <span className="quiet block text-xs">{task.dept}</span>
                  <span className="mt-1 block">{task.title}</span>
                </span>
                <span className="sim">{task.status}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="note mt-4">Tap a task to move its status inside the simulation. Nothing is sent to a real department.</p>
    </Chapter>
  );
}

const INSIGHTS = [
  {
    id: "ask",
    title: "Understanding a request",
    body: "“Two pillows” becomes a housekeeping task. It is not a silent command to the devices.",
  },
  {
    id: "fit",
    title: "Personalization",
    body: "A room preference is applied if the guest allows it and the hotel has linked the equipment.",
  },
  {
    id: "fix",
    title: "A maintenance note",
    body: "Repeated sample reports are shown to maintenance as a recommendation, not as an automatic shutdown.",
  },
];

function IntelChapter() {
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  return (
    <Chapter
      id="intelligence"
      index="02.3"
      en="HAYVRA Intelligence"
      title="A mind that recommends. A team that decides."
      text="It understands guest requests, suggests personalization, and surfaces patterns that help maintenance and efficiency. It does not control devices outside permissions, and it does not act without review when the decision is operational."
    >
      <ul className="space-y-3">
        {INSIGHTS.map((item) => (
          <li key={item.id} className="panel px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="inline-block size-2 bg-intel" aria-hidden="true" />
              <h3 className="text-lg font-light">{item.title}</h3>
            </div>
            <p className="quiet mt-2 text-sm leading-relaxed">{item.body}</p>
            <button
              type="button"
              className="choice mt-4"
              aria-pressed={Boolean(approved[item.id])}
              onClick={() => setApproved((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
            >
              {approved[item.id] ? "Approved in the simulation" : "Staff approval"}
            </button>
          </li>
        ))}
      </ul>
    </Chapter>
  );
}

const NODES = [
  { id: "opera", name: "Oracle OPERA / OHIP", body: "The reference for reservation and stay data where OPERA is used. Not a replacement, and not a partnership announcement." },
  { id: "pos", name: "Hotel POS", body: "A point-of-sale link is possible only with a vendor agreement and hotel permissions." },
  { id: "bms", name: "Building Management", body: "The building system is linked if the vendor provides an interface and permission." },
  { id: "hvac", name: "HVAC", body: "Climate control depends on compatibility. It is not assumed in every room." },
  { id: "light", name: "Smart Lighting", body: "Smart lighting is an option when it exists. It is not required for the app to run." },
  { id: "locks", name: "Digital Locks", body: "Digital locks need installation and permissions. The key is not a promise that is already live." },
  { id: "iot", name: "IoT Gateways", body: "An IoT gateway connects what the hotel allows. It is not a ready-made network." },
  { id: "room", name: "Room Automation", body: "Room automation is added room by room, according to the equipment, not as a default for the whole hotel." },
];

function ConnectChapter() {
  const [id, setId] = useState("opera");
  const node = NODES.find((item) => item.id === id) ?? NODES[0];
  return (
    <Chapter
      id="connect"
      index="02.4"
      en="HAYVRA Connect"
      title="Integration where the hotel allows it"
      text="One engine for connecting hotel systems. The diagram is interactive and explanatory. It does not represent completed production integrations."
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {NODES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === id ? "choice is-on" : "choice"}
              aria-pressed={item.id === id}
              onClick={() => setId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="panel px-5 py-5">
          <p className="kicker" lang="en" dir="ltr">HAYVRA Connect</p>
          <h3 className="mt-3 text-2xl font-light" lang="en" dir="ltr">{node?.name}</h3>
          <p className="mt-3 leading-relaxed">{node?.body}</p>
          <p className="note mt-4">A link depends on vendor fit, permissions, and installation.</p>
        </div>
      </div>
    </Chapter>
  );
}

function KeyChapter() {
  const [signedIn, setSignedIn] = useState(false);
  return (
    <Chapter
      id="key"
      index="02.5"
      en="HAYVRA Key"
      title="The guest card, after sign-in"
      text="The guest card is added to the phone wallet after sign-in."
    >
      <GuestKeyCard issued={signedIn} />
      <div className="mt-4">
        {signedIn ? (
          <button type="button" className="choice" onClick={() => setSignedIn(false)}>
            Sign out
          </button>
        ) : (
          <button type="button" className="choice is-on" onClick={() => setSignedIn(true)}>
            Sign in
          </button>
        )}
      </div>
      <p className="note mt-4">
        {signedIn
          ? "The guest card was added to the wallet after sign-in. This is an example on the page. It does not open a door."
          : "Sign in to add the guest card to iPhone Wallet and Android Wallet."}
      </p>
    </Chapter>
  );
}

function GrowthChapter() {
  const [consent, setConsent] = useState(false);
  const [open, setOpen] = useState(true);
  return (
    <Chapter
      id="growth"
      index="02.6"
      en="HAYVRA Growth Intelligence"
      title="Growth that waits for the guest"
      text="Direct booking, consented personal marketing, ancillary offers, loyalty, reputation, revenue measurement, and an opportunity tied to operational capacity. The figures below are invented examples."
    >
      <div className="folio px-4 py-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm">Growth board · invented example</p>
          <span className="sim">Not results</span>
        </div>
        <p className="mt-6 text-4xl font-light tabular-nums">12</p>
        <p className="quiet text-sm">Direct-booking enquiries in the sample week. An invented number, for illustration.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className="choice" aria-pressed={consent} onClick={() => setConsent((v) => !v)}>
            Guest consent: {consent ? "Yes" : "No"}
          </button>
          <button type="button" className="choice" aria-pressed={open} onClick={() => setOpen((v) => !v)}>
            Operational capacity: {open ? "Open" : "Full"}
          </button>
        </div>
        <p className="mt-5 border-t border-navy/15 pt-4 text-sm leading-relaxed">
          {consent && open
            ? "An extra service can be offered because the guest consented and operations can deliver it. This is still a scene, not a campaign that was sent."
            : "No personal message is sent. Either consent is missing, or operational capacity is not available."}
        </p>
      </div>
    </Chapter>
  );
}

const REWARDS = [
  { id: "stay", name: "HAYVRA", use: "Approved stay services, if SPORTIX accepts the redemption." },
  { id: "sport", name: "SPORTIX", use: "Play communities and approved sports experiences on the points network." },
  { id: "crowd", name: "YALLA HAYYIHOM", use: "Approved audience and event experiences. Yalla Hayyihom does not issue the points." },
];

function RewardsChapter() {
  const [id, setId] = useState("stay");
  const [asked, setAsked] = useState<string | null>(null);
  const place = REWARDS.find((item) => item.id === id) ?? REWARDS[0];
  return (
    <Chapter
      id="rewards"
      index="02.7"
      en="HAYVRA Rewards · SPORTIX Points"
      title="Rewards on one network, with one authority"
      text="A guest earns SPORTIX Points from qualifying transactions and uses them in approved services at HAYVRA, SPORTIX, and Yalla Hayyihom. Issuance, quantity, value, redemption rules, and balances belong only to SPORTIX."
    >
      <div className="panel px-5 py-5">
        <div className="flex items-center justify-between">
          <p className="kicker" lang="en" dir="ltr">SPORTIX Points</p>
          <span className="inline-block size-2 bg-oasis" aria-hidden="true" />
        </div>
        <p className="mt-6 text-4xl font-light tabular-nums">2,400</p>
        <p className="quiet text-sm">A sample balance. It was not issued here, and this screen will not change it.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {REWARDS.map((item) => (
            <button key={item.id} type="button" className={id === item.id ? "choice is-on" : "choice"} aria-pressed={id === item.id} onClick={() => setId(item.id)}>
              {item.name}
            </button>
          ))}
        </div>
        <p className="mt-4 leading-relaxed">{place?.use}</p>
        <button type="button" className="btn btn-gold mt-5" onClick={() => setAsked(place?.name ?? "")}>
          Request a redemption
        </button>
        {asked ? (
          <p className="note mt-4">
            A redemption of {asked} was requested inside the simulation and notionally sent to SPORTIX. The balance stayed at 2,400 because HAYVRA does not deduct points or change their value.
          </p>
        ) : null}
      </div>
      <p className="note mt-4">
        Hotels, retailers, partners, and HAYVRA may not change the value of the points or issue them independently.
      </p>
    </Chapter>
  );
}
