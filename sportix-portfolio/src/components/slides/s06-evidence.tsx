import { SlideFrame } from "@/components/deck/SlideFrame";
import { Chip, Kicker, Quote, Title } from "@/components/deck/primitives";

const STEPS = [
  { n: "01", t: "Evidence", d: "Capture that can be inspected." },
  { n: "02", t: "Validation", d: "Quality, calibration, identity bind." },
  { n: "03", t: "AI", d: "Interpretation under context." },
  { n: "04", t: "Confidence", d: "Estimate, not a verdict." },
  { n: "05", t: "Human decision", d: "Coach, scout, official, operator." },
];

export function SlideEvidence() {
  return (
    <SlideFrame n={6} kicker="Decision architecture">
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <Kicker>From data to intelligence</Kicker>
            <Title>
              AI proposes.
              <br />
              People decide.
            </Title>
          </div>
          <Chip tone="lime">Evidence-first</Chip>
        </div>

        <div className="mt-12 flex items-stretch gap-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex flex-1 items-stretch gap-3">
              <div
                className="panel flex flex-1 flex-col justify-between rounded-lg p-6"
                style={
                  i === STEPS.length - 1
                    ? { borderColor: "color-mix(in oklab, var(--color-lime) 55%, transparent)" }
                    : undefined
                }
              >
                <span className="num text-[15px] text-lime">{s.n}</span>
                <div>
                  <h3 className="m-0 font-display text-[26px] font-medium tracking-tight">{s.t}</h3>
                  <p className="mt-2 mb-0 text-[17px] text-muted">{s.d}</p>
                </div>
              </div>
              {i < STEPS.length - 1 ? (
                <div className="flex items-center">
                  <span className="text-lime">→</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-3 gap-6">
          <Quote>No score without evidence.</Quote>
          <Quote>No evidence without capture quality.</Quote>
          <Quote>No production promotion without benchmark, calibration and field validation.</Quote>
        </div>

        <p className="mt-8 mb-0 text-[18px] text-muted">
          SPORTIX AI is not designed to autonomously select or reject athletes. Intelligence supports
          the human decision and leaves a record of why.
        </p>
      </div>
    </SlideFrame>
  );
}
