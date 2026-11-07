import { SlideFrame } from "@/components/deck/SlideFrame";
import { BrandImg, Chip, Kicker, Quote, Title } from "@/components/deck/primitives";

const PHASES = [
  { n: "01", t: "Embedded Security", d: "Inside SPORTIX Ecosystem and Yalla Hayyihom. Protect users, identity, evidence and payments from day one of build." },
  { n: "02", t: "Shared Security Infrastructure", d: "Common controls, identity, cloud posture and AI-security patterns reused across applications." },
  { n: "03", t: "Enterprise Digital Trust", d: "Institutional-grade assurance for clubs, venues, federations and destination operators." },
  { n: "04", t: "Potential B2B commercialization", d: "Only if capability and market readiness justify it. Not existing revenue. Not a day-one P&L." },
];

const DOMAINS = ["Cybersecurity", "Secure Cloud", "AI Security", "Digital Trust"];

export function SlideSecurity() {
  return (
    <SlideFrame n={16} kicker="Digital trust" plate="/plates/metal.jpg" overlay={0.8}>
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between gap-10">
          <div className="flex max-w-[1100px] flex-col gap-4">
            <Kicker>SPORTIX AI Security Systems</Kicker>
            <Title size="lg">Trust is a roadmap. Not a spin-out.</Title>
          </div>
          <Chip>Progressive · Phase 4 is not current revenue</Chip>
        </div>

        <div className="mt-8 grid flex-1 grid-cols-4 gap-4">
          {PHASES.map((p) => (
            <div key={p.n} className="panel flex flex-col rounded-lg p-6">
              <span className="num text-[16px] text-lime">Phase {p.n}</span>
              <h3 className="mt-4 mb-3 font-display text-[26px] leading-snug font-medium tracking-tight">
                {p.t}
              </h3>
              <p className="m-0 text-[18px] leading-relaxed text-muted">{p.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {DOMAINS.map((d) => (
              <div key={d} className="chip chip-lime">
                {d}
              </div>
            ))}
          </div>
          <BrandImg
            src="/brand/sportix-security.png"
            alt="SPORTIX AI Security Systems"
            shine="sec"
            className="h-[168px] w-auto shrink-0"
          />
        </div>

        <div className="mt-6">
          <Quote>
            Built first to secure the ecosystem. Commercialized only when capability and market
            readiness justify it.
          </Quote>
        </div>
      </div>
    </SlideFrame>
  );
}
