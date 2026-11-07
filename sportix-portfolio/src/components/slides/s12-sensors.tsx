import { SlideFrame } from "@/components/deck/SlideFrame";
import { Chip, Kicker, MiniLabel, Title } from "@/components/deck/primitives";

const PADEL = [
  "Sensor",
  "Session",
  "SPORTIX App",
  "AI Gateway",
  "Vision + sensor fusion",
  "Evidence",
  "SPORT ID / community / rewards / partner value",
];

export function SlideSensors() {
  return (
    <SlideFrame n={12} kicker="Selected case studies" plate="/plates/padel.jpg" overlay={0.84}>
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <Kicker>SPORTIX sensor innovation</Kicker>
            <Title size="lg">Physical nodes. Same intelligence core.</Title>
          </div>
          <Chip>Proposed · not manufactured · validation required</Chip>
        </div>

        <div className="mt-8 grid flex-1 grid-cols-2 gap-6">
          <div className="panel flex flex-col rounded-lg p-7">
            <MiniLabel>Case 01 · Football</MiniLabel>
            <h3 className="mt-3 mb-4 font-display text-[28px] font-medium tracking-tight">
              Three-level sensing
            </h3>
            <p className="m-0 mb-6 text-[17px] leading-relaxed text-muted">
              Schools remain camera-first. Academies add foot and body nodes for development.
              Pro clubs add redundant fusion. Hardware follows the question being asked — it is
              not a uniform kit.
            </p>
            <div className="mt-auto flex flex-col gap-2">
              {["Schools — vision primary", "Academies — vision + foot + body", "Pro — multi-sensor fusion"].map(
                (row) => (
                  <div key={row} className="rounded-sm px-4 py-3 text-[16px]" style={{ background: "var(--color-surface-2)" }}>
                    {row}
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="panel flex flex-col rounded-lg p-7">
            <MiniLabel>Case 02 · SPORTIX Padel Sensor</MiniLabel>
            <h3 className="mt-3 mb-4 font-display text-[28px] font-medium tracking-tight">
              A proposed physical evidence node
            </h3>
            <p className="m-0 mb-6 text-[17px] leading-relaxed text-muted">
              Integrated with SPORTIX Ecosystem, SPORTIX AI SYSTEMS and SPORTIX Vision. Not a
              standalone gadget company. Not claimed as manufactured or field-validated.
            </p>
            <div className="mt-auto flex flex-col gap-2">
              {PADEL.map((row, i) => (
                <div key={row} className="flex items-center gap-3">
                  <span className="num w-6 text-[13px] text-lime">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[16px]">{row}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
