import { SlideFrame } from "@/components/deck/SlideFrame";
import { Chip, Kicker, Title } from "@/components/deck/primitives";

const DONE = [
  "Product vision",
  "Product architecture",
  "Technical architecture",
  "Engineering specifications",
  "User journeys",
  "Prototypes",
  "Revenue models",
  "Integration architecture",
  "AI / computer vision design",
  "Sensor architecture",
  "Intellectual-property landscape",
  "Patent candidates / invention themes",
  "Strategic pilot design",
  "Validation planning",
  "Commercialization planning",
];

const NOT = [
  "All AI models trained",
  "All systems production-deployed",
  "Hardware manufactured at scale",
  "Sensors certified",
  "Completed operational pilots as a claim of traction",
  "Named major-organisation partnerships unless evidenced",
  "Patents filed or granted",
  "Phase-4 security revenue",
];

export function SlideStage() {
  return (
    <SlideFrame n={21} kicker="Honesty of maturity">
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <Kicker>Current stage</Kicker>
            <Title size="lg">Founding / pre-launch execution.</Title>
          </div>
          <Chip tone="lime">Do not overclaim</Chip>
        </div>
        <div className="mt-8 grid flex-1 grid-cols-2 gap-6">
          <div className="panel flex flex-col rounded-lg p-7">
            <p className="m-0 text-[14px] font-semibold tracking-[0.2em] text-lime uppercase">
              Significant work completed in
            </p>
            <ul className="mt-5 mb-0 grid grid-cols-1 gap-2 p-0">
              {DONE.map((x) => (
                <li key={x} className="list-none text-[18px] text-fg">
                  <span className="text-lime">· </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel flex flex-col rounded-lg p-7">
            <p className="m-0 text-[14px] font-semibold tracking-[0.2em] text-subtle uppercase">
              Not claimed
            </p>
            <ul className="mt-5 mb-0 grid grid-cols-1 gap-2 p-0">
              {NOT.map((x) => (
                <li key={x} className="list-none text-[18px] text-muted">
                  <span className="text-subtle">· </span>
                  {x}
                </li>
              ))}
            </ul>
            <p className="mt-auto mb-0 pt-6 text-[16px] text-muted">
              Language used throughout: designed, target architecture, planned, proposed,
              validation required, patent candidates.
            </p>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
