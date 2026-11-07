import { SlideFrame } from "@/components/deck/SlideFrame";
import { Chip, Kicker, Title } from "@/components/deck/primitives";

const RINGS = [
  {
    n: "01",
    t: "Saudi Arabia",
    d: "Launch environment and strategic proving ground. Sports participation, tourism, culture, entertainment, smart venues, digital transformation and AI — designed to support, and potentially aligned with, Vision 2030 and World Cup 2034 readiness.",
  },
  {
    n: "02",
    t: "GCC",
    d: "Adjacent sporting, cultural and destination markets that share climate, calendar, language proximity and event density. Expansion is earned from Saudi evidence, not announced ahead of it.",
  },
  {
    n: "03",
    t: "Global",
    d: "The architecture is not a Saudi-only product. Identity, evidence and experience intelligence travel. International scale follows environments that look like the original proving ground.",
  },
];

export function SlideExpansion() {
  return (
    <SlideFrame n={23} kicker="Expansion thesis" plate="/plates/civic.jpg" overlay={0.82}>
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex max-w-[1040px] flex-col gap-4">
            <Kicker>Saudi → GCC → Global</Kicker>
            <Title size="lg">Built for this environment. Designed to leave it.</Title>
          </div>
          <Chip>No implied government endorsement</Chip>
        </div>
        <div className="mt-10 grid flex-1 grid-cols-3 gap-5">
          {RINGS.map((r) => (
            <div key={r.n} className="panel flex flex-col rounded-lg p-7">
              <span className="num text-[14px] text-lime">{r.n}</span>
              <h3 className="mt-4 mb-4 font-display text-[32px] font-medium tracking-tight">{r.t}</h3>
              <p className="m-0 text-[18px] leading-relaxed text-muted">{r.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 mb-0 text-[17px] text-muted">
          Language used: designed to support · relevant to · potentially aligned with · built for
          environments such as. Official partnership is a later evidence item, not a cover claim.
        </p>
      </div>
    </SlideFrame>
  );
}
