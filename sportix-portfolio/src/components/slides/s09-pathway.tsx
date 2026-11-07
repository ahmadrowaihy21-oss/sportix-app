import { SlideFrame } from "@/components/deck/SlideFrame";
import { Chip, Kicker, Title } from "@/components/deck/primitives";

const STAGES = [
  {
    n: "01",
    name: "School",
    d: "Participation first. Cameras before wearables. Identity begins here.",
  },
  {
    n: "02",
    name: "Academy",
    d: "Longitudinal development. Vision plus selected body and foot sensing.",
  },
  {
    n: "03",
    name: "Club",
    d: "Competitive context. Fusion where the game model demands it.",
  },
  {
    n: "04",
    name: "Federation",
    d: "Selection and pathway governance. Evidence packs, not rumours.",
  },
  {
    n: "05",
    name: "National team",
    d: "The rare end of a long record — still a human decision.",
  },
];

export function SlidePathway() {
  return (
    <SlideFrame n={9} kicker="Long-term pathway" plate="/plates/academy.jpg" overlay={0.8}>
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex max-w-[980px] flex-col gap-4">
            <Kicker>Athlete development pathway</Kicker>
            <Title size="lg">School to national team — one identity underneath.</Title>
          </div>
          <Chip>Distinct from the app journey</Chip>
        </div>

        <div className="mt-12 grid grid-cols-5 gap-4">
          {STAGES.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="panel flex h-full flex-col rounded-lg p-6">
                <span className="num text-[14px] text-lime">{s.n}</span>
                <h3 className="mt-4 mb-3 font-display text-[26px] font-medium tracking-tight">
                  {s.name}
                </h3>
                <p className="m-0 text-[17px] leading-relaxed text-muted">{s.d}</p>
              </div>
              {i < STAGES.length - 1 ? (
                <div className="absolute top-1/2 -right-3 z-10 hidden text-lime lg:block">→</div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-lg px-8 py-6" style={{ background: "var(--color-lime-dim)", border: "1px solid color-mix(in oklab, var(--color-lime) 40%, transparent)" }}>
          <p className="m-0 text-[14px] font-semibold tracking-[0.22em] text-lime uppercase">
            Continuity layer
          </p>
          <p className="m-0 font-display text-[28px] font-medium tracking-tight">
            SPORT ID + SPORTIX AI travel with the athlete. Institutions change. The record does not reset.
          </p>
        </div>

        <p className="mt-6 mb-0 text-[18px] text-muted">
          Designed so a school session, an academy block and a club match can sit on the same identity
          object — with confidence labels that keep early, noisy data from pretending to be elite evidence.
        </p>
      </div>
    </SlideFrame>
  );
}
