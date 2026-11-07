import { SlideFrame } from "@/components/deck/SlideFrame";
import { Chip, Kicker, Quote, Title } from "@/components/deck/primitives";

const PHASES = [
  {
    name: "Connect & identity",
    steps: [
      { n: "01", t: "Connect" },
      { n: "02", t: "Build SPORT ID" },
      { n: "03", t: "Discover / Join" },
    ],
  },
  {
    name: "Play & evidence",
    steps: [
      { n: "04", t: "Play / Train" },
      { n: "05", t: "Verify" },
      { n: "06", t: "Record" },
      { n: "07", t: "Understand" },
    ],
  },
  {
    name: "Progress & reward",
    steps: [
      { n: "08", t: "Progress" },
      { n: "09", t: "Reward" },
      { n: "10", t: "Recognize" },
      { n: "11", t: "Optional share" },
    ],
  },
  {
    name: "Return",
    steps: [
      { n: "12", t: "Redeem" },
      { n: "13", t: "Return" },
    ],
  },
];

export function SlideAthleteJourney() {
  return (
    <SlideFrame n={8} kicker="SPORTIX app journey">
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <Kicker>Athlete user journey</Kicker>
            <Title size="lg">The app loop. Not the career pathway.</Title>
          </div>
          <Chip tone="lime">SPORT ID is the spine</Chip>
        </div>

        <div className="mt-8 grid flex-1 grid-cols-4 gap-4">
          {PHASES.map((p) => (
            <div key={p.name} className="panel flex flex-col rounded-lg p-6">
              <p className="m-0 text-[14px] font-semibold tracking-[0.18em] text-lime uppercase">
                {p.name}
              </p>
              <div className="mt-6 flex flex-col gap-4">
                {p.steps.map((s) => (
                  <div key={s.n} className="flex items-baseline gap-3">
                    <span className="num w-7 text-[14px] text-subtle">{s.n}</span>
                    <span className="font-display text-[22px] font-medium tracking-tight">{s.t}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 panel rounded-lg p-6">
          <p className="m-0 mb-3 text-[14px] font-semibold tracking-[0.2em] text-subtle uppercase">
            Intelligence loop inside the app
          </p>
          <div className="flex items-center justify-between gap-3 text-[17px] font-semibold">
            {[
              "Participation",
              "Verified evidence",
              "SPORT ID",
              "AI-enabled insight",
              "Opportunity / reward",
              "Motivation",
              "More participation",
            ].map((x, i, arr) => (
              <span key={x} className="flex items-center gap-3">
                <span>{x}</span>
                {i < arr.length - 1 ? <span className="text-lime">→</span> : null}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-5">
          <Quote>This page is the product loop. The next page is the institutional pathway. They are not the same diagram.</Quote>
        </div>
      </div>
    </SlideFrame>
  );
}
