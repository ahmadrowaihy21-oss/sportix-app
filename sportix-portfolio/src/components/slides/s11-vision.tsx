import { SlideFrame } from "@/components/deck/SlideFrame";
import { Chip, Kicker, Quote, Title } from "@/components/deck/primitives";

const LOOP = [
  "Capture",
  "Quality",
  "Detect",
  "Track",
  "Pose / Action",
  "Extract evidence",
  "Measure",
  "Estimate confidence",
  "AI interpretation",
  "Human review",
  "Outcome feedback",
];

export function SlideVision() {
  return (
    <SlideFrame n={11} kicker="Evidence-first vision" plate="/plates/stadium.jpg" overlay={0.86}>
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <Kicker>SPORTIX Computer Vision</Kicker>
            <Title size="lg">An evidence factory. Not an autonomous selector.</Title>
          </div>
          <Chip>Target architecture</Chip>
        </div>

        <div className="mt-8 grid grid-cols-6 gap-3">
          {LOOP.slice(0, 6).map((step, i) => (
            <Step key={step} n={i + 1} label={step} />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-5 gap-3">
          {LOOP.slice(6).map((step, i) => (
            <Step key={step} n={i + 7} label={step} last={i === 4} />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-5">
          <div className="panel rounded-lg p-6">
            <p className="m-0 text-[14px] font-semibold tracking-[0.18em] text-lime uppercase">Quality gate</p>
            <p className="mt-3 mb-0 text-[18px] leading-relaxed text-muted">
              If capture quality fails, interpretation does not proceed as if it were elite evidence.
            </p>
          </div>
          <div className="panel rounded-lg p-6">
            <p className="m-0 text-[14px] font-semibold tracking-[0.18em] text-lime uppercase">Confidence</p>
            <p className="mt-3 mb-0 text-[18px] leading-relaxed text-muted">
              Every measurement carries an estimate of confidence. Weak evidence stays labelled weak.
            </p>
          </div>
          <div className="panel rounded-lg p-6">
            <p className="m-0 text-[14px] font-semibold tracking-[0.18em] text-lime uppercase">Human review</p>
            <p className="mt-3 mb-0 text-[18px] leading-relaxed text-muted">
              Coaches, scouts and officials remain on the path. Models do not select or reject athletes.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Quote>
            No score without evidence. No evidence without capture quality. No production promotion
            without benchmark, calibration and field validation.
          </Quote>
        </div>
      </div>
    </SlideFrame>
  );
}

function Step({ n, label, last }: { n: number; label: string; last?: boolean }) {
  return (
    <div
      className="panel flex items-center gap-3 rounded-md px-4 py-4"
      style={last ? { borderColor: "color-mix(in oklab, var(--color-lime) 50%, transparent)" } : undefined}
    >
      <span className="num text-[13px] text-lime">{String(n).padStart(2, "0")}</span>
      <span className="text-[16px] font-semibold leading-tight">{label}</span>
    </div>
  );
}
