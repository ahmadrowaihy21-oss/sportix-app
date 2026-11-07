import { SlideFrame } from "@/components/deck/SlideFrame";
import { BrandImg, Chip, Kicker, Title } from "@/components/deck/primitives";

const CLUSTERS = [
  { t: "Events", d: "Match days, festivals, cultural nights — one relationship, not one ticket." },
  { t: "Culture", d: "Heritage, performance, neighbourhoods. Discovery with a memory." },
  { t: "Tourism", d: "Destinations and itineraries designed as journeys, not listings." },
  { t: "Destinations", d: "Experience Map as a living layer over the city." },
  { t: "Mobility", d: "Travel-ready planning that sits beside the visit, not in another silo." },
  { t: "Community", d: "People who came for the same night, and might return together." },
  { t: "Rewards", d: "Value that follows verified presence." },
  { t: "Memory", d: "Post-event retention — the visit continues after the lights go down." },
];

export function SlideYhh() {
  return (
    <SlideFrame n={13} kicker="Experience intelligence" plate="/plates/courtyard.jpg" overlay={0.78} variant="yhh">
      <div className="flex h-full gap-14">
        <div className="flex w-[420px] shrink-0 flex-col items-start">
          <BrandImg src="/brand/yalla-hayyihom.png" alt="Yalla Hayyihom" shine="yal" className="h-[640px] w-auto" />

        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4">
            <Kicker tone="gold">Yalla Hayyihom</Kicker>
            <Title size="lg">Fan, visitor and experience intelligence.</Title>
          </div>
          <p className="slide-lead mt-5 mb-6">
            A sibling application of the same SPORTIX AI SYSTEMS core. Distinct brand. Shared
            evidence, identity and trust rules.
          </p>
          <Chip tone="gold">Culture · tourism · events · mobility · memory</Chip>
          <div className="mt-8 grid flex-1 grid-cols-2 gap-4">
            {CLUSTERS.map((c) => (
              <div key={c.t} className="panel rounded-md p-4">
                <p className="m-0 text-[20px] font-semibold" style={{ color: "var(--color-gold)" }}>
                  {c.t}
                </p>
                <p className="mt-1 mb-0 text-[17px] leading-relaxed text-muted">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
