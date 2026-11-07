import { SlideFrame } from "@/components/deck/SlideFrame";
import { BrandImg, Chip, Kicker, Title } from "@/components/deck/primitives";

const FAMILIES = [
  {
    n: "01",
    name: "Identity & participation",
    items: [
      { t: "SPORT ID", d: "Persistent athletic identity across school, club and federation contexts." },
      { t: "GO SPORTIX", d: "The participation surface — discover, join, play." },
      { t: "Match / Activity Rooms", d: "Session objects that can carry evidence." },
      { t: "Community", d: "Teams, peers, local sport graphs." },
    ],
  },
  {
    n: "02",
    name: "Intelligence & development",
    items: [
      { t: "SPORTIX Vision", d: "Evidence-first computer vision on captured sessions." },
      { t: "Smart Evaluation", d: "Contextual measurement. No universal player score." },
      { t: "Smart Coaching", d: "Designed as a support layer for coaches, not a replacement." },
      { t: "Talent Discovery", d: "Opportunity routing from verified evidence, with human review." },
    ],
  },
  {
    n: "03",
    name: "Commerce & institutions",
    items: [
      { t: "Rewards", d: "Motivation loop tied to verified participation." },
      { t: "Marketplace", d: "Bookings, kit, services — commission engine." },
      { t: "Partners / Sponsors", d: "Native placements and campaign systems, distinct from corporate sponsorship." },
      { t: "Clubs · Academies · Venues", d: "Institutional dashboards and operational tools." },
    ],
  },
];

export function SlideEcosystem() {
  return (
    <SlideFrame n={7} kicker="Sports intelligence" plate="/plates/academy.jpg" overlay={0.82}>
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-6">
            <BrandImg
              src="/brand/sportix-ecosystem.png"
              alt="SPORTIX Ecosystem"
              shine="eco"
              className="h-[200px] w-auto"
            />
            <div className="flex flex-col gap-4">
              <Kicker>SPORTIX Ecosystem</Kicker>
              <Title size="lg">A continuous sports system — not a feature list.</Title>
            </div>
          </div>
          <Chip>Selected depth · not a 98-box catalogue</Chip>
        </div>
        <div className="mt-8 grid flex-1 grid-cols-3 gap-5">
          {FAMILIES.map((f) => (
            <div key={f.n} className="panel flex flex-col rounded-lg p-6">
              <span className="num text-[16px] text-lime">{f.n}</span>
              <h3 className="mt-3 mb-6 font-display text-[26px] font-medium tracking-tight">{f.name}</h3>
              <div className="flex flex-col gap-5">
                {f.items.map((item) => (
                  <div key={item.t}>
                    <p className="m-0 text-[20px] font-semibold text-fg">{item.t}</p>
                    <p className="mt-1 mb-0 text-[17px] leading-relaxed text-muted">{item.d}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
