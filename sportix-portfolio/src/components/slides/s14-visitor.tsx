import { SlideFrame } from "@/components/deck/SlideFrame";
import { Chip, Kicker, Title } from "@/components/deck/primitives";

const PHASES = [
  {
    name: "Before",
    steps: [
      { n: "01", t: "Discover" },
      { n: "02", t: "Connect / Ticket" },
      { n: "03", t: "Know me" },
      { n: "04", t: "Plan" },
      { n: "05", t: "Travel ready" },
    ],
  },
  {
    name: "During",
    steps: [
      { n: "06", t: "Arrive" },
      { n: "07", t: "Navigate" },
      { n: "08", t: "Experience" },
      { n: "09", t: "Explore" },
      { n: "10", t: "Participate" },
    ],
  },
  {
    name: "Proof",
    steps: [
      { n: "11", t: "Verify" },
      { n: "12", t: "Stamp" },
      { n: "13", t: "Reward" },
    ],
  },
  {
    name: "After",
    steps: [
      { n: "14", t: "Capture" },
      { n: "15", t: "Remember" },
      { n: "16", t: "Share" },
      { n: "17", t: "Next adventure" },
      { n: "18", t: "Return" },
    ],
  },
];

export function SlideVisitor() {
  return (
    <SlideFrame n={14} kicker="YHH lifecycle" plate="/plates/civic.jpg" overlay={0.84} variant="yhh">
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <Kicker tone="gold">Visitor journey</Kicker>
            <Title size="lg">The visit is a lifecycle. Not a ticket scan.</Title>
          </div>
          <Chip tone="gold">Designed journey</Chip>
        </div>

        <div className="mt-8 grid flex-1 grid-cols-4 gap-4">
          {PHASES.map((p) => (
            <div key={p.name} className="panel flex flex-col rounded-lg p-6">
              <p className="m-0 text-[14px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--color-gold)" }}>
                {p.name}
              </p>
              <div className="mt-5 flex flex-col gap-3">
                {p.steps.map((s) => (
                  <div key={s.t} className="flex items-baseline gap-3">
                    <span className="num w-6 text-[13px] text-subtle">{s.n}</span>
                    <span className="font-display text-[20px] font-medium tracking-tight">{s.t}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-lg p-6" style={{ border: "1px solid color-mix(in oklab, var(--color-gold) 40%, transparent)", background: "var(--color-gold-dim)" }}>
            <p className="m-0 text-[14px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--color-gold)" }}>
              Open / non-ticketed locations
            </p>
            <p className="mt-2 mb-0 text-[18px] text-fg">
              Location-based arrival confirmation / geofence may confirm arrival.
            </p>
          </div>
          <div className="rounded-lg p-6" style={{ border: "1px solid color-mix(in oklab, var(--color-gold) 40%, transparent)", background: "var(--color-gold-dim)" }}>
            <p className="m-0 text-[14px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--color-gold)" }}>
              Ticketed / controlled-entry venues
            </p>
            <p className="mt-2 mb-0 text-[18px] text-fg">
              ENTRY_VERIFIED must come from the authorised ticketing / access-control system. GPS alone does not prove entry at a gated venue.
            </p>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
