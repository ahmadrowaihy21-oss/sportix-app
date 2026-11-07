import { SlideFrame } from "@/components/deck/SlideFrame";
import { Chip, Kicker, Title } from "@/components/deck/primitives";

const LEVELS = [
  {
    n: "01",
    name: "Schools",
    load: "Light sensing",
    points: [
      "Cameras first. Vision is primary.",
      "Foot sensors only for shortlisted candidates.",
      "Do not put GNSS, UWB, smart balls or insoles on every student.",
      "Purpose: participation, screening, safe introduction to evidence.",
    ],
  },
  {
    n: "02",
    name: "Academies",
    load: "Development sensing",
    points: [
      "Vision + foot nodes + body GNSS / IMU.",
      "Optional UWB / LPS where the pitch justifies it.",
      "Purpose: longitudinal development, not match-day spectacle.",
      "Same identity object, tighter calibration.",
    ],
  },
  {
    n: "03",
    name: "Pro clubs",
    load: "Redundant fusion",
    points: [
      "Vision + body positioning / IMU + foot sensing.",
      "UWB / LPS + optional specialist sensors.",
      "Redundant multi-sensor fusion.",
      "Purpose: high-integrity evidence under elite context.",
    ],
  },
];

export function SlideFootball() {
  return (
    <SlideFrame n={10} kicker="Sensing architecture">
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <Kicker>Football talent intelligence</Kicker>
            <Title size="lg">Sensing load must match the environment.</Title>
          </div>
          <Chip>Engineering specification · validation required</Chip>
        </div>

        <div className="mt-8 grid flex-1 grid-cols-3 gap-5">
          {LEVELS.map((l) => (
            <div key={l.n} className="panel flex flex-col rounded-lg p-6">
              <div className="flex items-center justify-between">
                <span className="num text-[14px] text-lime">{l.n}</span>
                <span className="chip chip-lime">{l.load}</span>
              </div>
              <h3 className="mt-5 mb-5 font-display text-[32px] font-medium tracking-tight">{l.name}</h3>
              <ul className="m-0 flex flex-col gap-3 p-0">
                {l.points.map((p) => (
                  <li key={p} className="list-none text-[17px] leading-relaxed text-muted">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-5 panel rounded-lg p-6">
          <p className="m-0 mb-3 text-[14px] font-semibold tracking-[0.2em] text-subtle uppercase">
            There is no universal player score
          </p>
          <p className="m-0 font-display text-[24px] font-medium tracking-tight">
            Evaluation is contextual:&nbsp;
            <span className="text-lime">PLAYER</span>
            <span className="text-subtle"> × </span>
            ROLE
            <span className="text-subtle"> × </span>
            GAME MODEL
            <span className="text-subtle"> × </span>
            OPPONENT
            <span className="text-subtle"> × </span>
            PHASE
            <span className="text-subtle"> × </span>
            CONTEXT
            <span className="text-subtle"> × </span>
            DEVELOPMENT STAGE
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}
