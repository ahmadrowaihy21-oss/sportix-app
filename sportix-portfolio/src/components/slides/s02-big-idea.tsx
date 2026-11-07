import { SlideFrame } from "@/components/deck/SlideFrame";
import { BrandImg, Chip, Kicker, Quote, Title } from "@/components/deck/primitives";

const APPS = [
  {
    n: "01",
    name: "SPORTIX AI SYSTEMS",
    role: "Core intelligence layer",
    items: ["AI · Computer Vision", "Data · MLOps", "Confidence · Evidence", "Governed AI services"],
    logo: "/brand/sportix-intelligence.png",
    shine: "ai" as const,
  },
  {
    n: "02",
    name: "SPORTIX ECOSYSTEM",
    role: "Sports intelligence",
    items: ["SPORT ID · Participation", "Talent · Development", "Community · Venues", "Marketplace · Rewards"],
    logo: "/brand/sportix-ecosystem.png",
    shine: "eco" as const,
  },
  {
    n: "03",
    name: "YALLA HAYYIHOM",
    role: "Fan & visitor intelligence",
    items: ["Events · Culture", "Tourism · Destinations", "Mobility · Community", "Cultural Passport"],
    logo: "/brand/yalla-hayyihom.png",
    shine: "yal" as const,
  },
  {
    n: "04",
    name: "SECURITY SYSTEMS",
    role: "Progressive digital trust",
    items: ["Embedded security first", "Shared infrastructure", "Enterprise digital trust", "Future B2B — not day one"],
    logo: "/brand/sportix-security.png",
    shine: "sec" as const,
  },
] as const;

export function SlideBigIdea() {
  return (
    <SlideFrame n={2} kicker="Corporate architecture" plate="/plates/datahall.jpg" overlay={0.78}>
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between gap-10">
          <div className="flex max-w-[1100px] flex-col gap-5">
            <Kicker>The big idea</Kicker>
            <Title>
              One intelligence company.
              <br />
              Multiple scalable applications.
            </Title>
          </div>
          <Chip tone="lime">Not four unrelated startups</Chip>
        </div>

        <div className="mt-8 grid flex-1 grid-cols-4 gap-5">
          {APPS.map((app) => (
            <div key={app.name} className="panel flex flex-col rounded-lg p-6">
              <BrandImg src={app.logo} alt={app.name} shine={app.shine} className="mb-4 h-[120px] w-auto" />
              <span className="num text-[17px] text-lime">{app.n}</span>
              <p className="mt-4 mb-0 text-[16px] font-semibold tracking-[0.14em] text-lime uppercase">
                {app.role}
              </p>
              <h3 className="mt-2 mb-5 font-display text-[24px] leading-snug font-semibold tracking-tight">
                {app.name}
              </h3>
              <ul className="mt-auto flex flex-col gap-2 p-0">
                {app.items.map((item) => (
                  <li key={item} className="list-none text-[18px] text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Quote>One intelligence core. Multiple market applications. Multiple revenue engines.</Quote>
        </div>
      </div>
    </SlideFrame>
  );
}
