import { SlideFrame } from "@/components/deck/SlideFrame";
import { Chip, Kicker, Title } from "@/components/deck/primitives";

const LAYERS = [
  {
    n: "01",
    name: "Capture & sensors",
    detail: "Vision, optional body/foot nodes, authorised access events. Quality is a first-class input.",
  },
  {
    n: "02",
    name: "Data intelligence",
    detail: "Session objects, identity binding, longitudinal stores, partner and venue context.",
  },
  {
    n: "03",
    name: "Model infrastructure",
    detail: "Training, evaluation, versioning and promotion paths. Models do not skip gates.",
  },
  {
    n: "04",
    name: "Computer vision",
    detail: "Detect, track, pose/action, evidence extraction. Always with capture-quality checks.",
  },
  {
    n: "05",
    name: "AI interpretation",
    detail: "Contextual estimates against role, game model, phase and development stage.",
  },
  {
    n: "06",
    name: "Confidence & evidence",
    detail: "Every score carries a confidence and a traceable evidence pack. No naked numbers.",
  },
  {
    n: "07",
    name: "MLOps & orchestration",
    detail: "Pipelines, monitoring, rollback, environment separation. Designed, not improvised.",
  },
  {
    n: "08",
    name: "Governed AI services",
    detail: "The commercial interface: APIs and products that inherit policy, review and audit.",
  },
];

export function SlideSystems() {
  return (
    <SlideFrame n={5} kicker="Intelligence core" plate="/plates/datahall.jpg" overlay={0.86}>
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between gap-8">
          <div className="flex max-w-[980px] flex-col gap-4">
            <Kicker>SPORTIX AI SYSTEMS</Kicker>
            <Title size="lg">The core is a governed intelligence layer.</Title>
          </div>
          <Chip>Designed · not production-deployed</Chip>
        </div>
        <p className="slide-lead mt-5 mb-0">
          Applications consume this stack. They do not each invent their own AI. Human review remains
          on the decision path.
        </p>
        <div className="mt-8 grid flex-1 grid-cols-4 grid-rows-2 gap-4">
          {LAYERS.map((layer) => (
            <div key={layer.n} className="panel flex flex-col rounded-lg p-5">
              <span className="num text-[14px] text-lime">{layer.n}</span>
              <h3 className="mt-3 mb-2 font-display text-[20px] leading-snug font-semibold tracking-tight">
                {layer.name}
              </h3>
              <p className="m-0 text-[16px] leading-relaxed text-muted">{layer.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
