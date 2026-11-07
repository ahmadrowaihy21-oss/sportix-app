import { SlideFrame } from "@/components/deck/SlideFrame";
import { Chip, Kicker, Title } from "@/components/deck/primitives";

const STAGES = [
  {
    n: "01",
    t: "Build",
    d: "Core identity, capture quality, evidence objects, app loops, security-by-construction.",
  },
  {
    n: "02",
    t: "Validate",
    d: "Benchmarks, calibration, field protocols. Models do not skip this gate.",
  },
  {
    n: "03",
    t: "Pilot",
    d: "Designed pilots with schools, academies, venues or destinations. Evidence of use, not logos on a slide.",
  },
  {
    n: "04",
    t: "Revenue",
    d: "Subscriptions, institutional contracts, marketplace and sponsorship where the loop is real.",
  },
  {
    n: "05",
    t: "Scale",
    d: "More sports, more cities, GCC, then international environments that look like the Saudi proving ground.",
  },
];

const STREAMS = [
  { t: "Product", d: "SPORTIX app loop, SPORT ID, YHH visitor loop, Cultural Passport." },
  { t: "Intelligence", d: "Vision pipeline, confidence, human review, sensor fusion hypotheses." },
  { t: "Trust", d: "Embedded security → shared infrastructure. Phase 4 stays gated." },
  { t: "Commercial", d: "Payer map, native vs strategic sponsorship, institutional offers." },
  { t: "IP", d: "Protect, file only what should be public, keep secrets secret." },
];

export function SlideRoadmap() {
  return (
    <SlideFrame n={22} kicker="How it gets built">
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <Kicker>Execution roadmap</Kicker>
            <Title size="lg">Each gate is evidence. Not a date on a slide.</Title>
          </div>
          <Chip>Planned pathway</Chip>
        </div>
        <div className="mt-8 grid grid-cols-5 gap-3">
          {STAGES.map((s) => (
            <div key={s.n} className="panel rounded-lg p-5">
              <span className="num text-[14px] text-lime">{s.n}</span>
              <h3 className="mt-3 mb-3 font-display text-[26px] font-medium tracking-tight">{s.t}</h3>
              <p className="m-0 text-[16px] leading-relaxed text-muted">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid flex-1 grid-cols-5 gap-3">
          {STREAMS.map((s) => (
            <div key={s.t} className="rounded-lg p-5" style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-line)" }}>
              <p className="m-0 text-[14px] font-semibold tracking-[0.16em] text-lime uppercase">{s.t}</p>
              <p className="mt-3 mb-0 text-[16px] leading-relaxed text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
