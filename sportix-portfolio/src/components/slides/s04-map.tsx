import { SlideFrame } from "@/components/deck/SlideFrame";
import { BrandImg, Chip, Kicker, Title } from "@/components/deck/primitives";

export function SlideMap() {
  return (
    <SlideFrame n={4} kicker="Architecture" plate="/plates/datahall.jpg" overlay={0.84}>
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <Kicker>Master ecosystem</Kicker>
            <Title size="lg">One core. Four layers. Shared evidence.</Title>
          </div>
          <Chip>Target architecture</Chip>
        </div>

        <div className="mt-8 panel flex items-center gap-8 rounded-lg p-6">
          <div>
            <p className="m-0 text-[14px] font-semibold tracking-[0.2em] text-lime uppercase">
              Parent
            </p>
            <h3 className="mt-1 mb-0 font-display text-[26px] font-medium tracking-tight">
              SPORTIX AI — intelligence company
            </h3>
          </div>
          <p className="m-0 ml-auto max-w-[48ch] text-[17px] text-muted">
            Applications inherit models, evidence rules, identity objects and trust controls from
            the same core. They do not fork into separate stacks.
          </p>
        </div>

        <div className="mt-5 grid flex-1 grid-cols-4 gap-4">
          <Layer
            n="01"
            name="SPORTIX AI SYSTEMS"
            blurb="The intelligence core."
            points={["AI & computer vision", "Data intelligence", "Model infrastructure", "MLOps & orchestration", "Confidence / evidence", "Governed AI services"]}
            logo="/brand/sportix-intelligence.png"
            shine="ai"
          />
          <Layer
            n="02"
            name="SPORTIX ECOSYSTEM"
            blurb="Sports intelligence."
            points={["SPORT ID", "Participation & community", "Talent discovery", "Athlete development", "Clubs / academies / venues", "Marketplace & sponsorship"]}
            logo="/brand/sportix-ecosystem.png"
            shine="eco"
          />
          <Layer
            n="03"
            name="YALLA HAYYIHOM"
            blurb="Fan, visitor & experience intelligence."
            points={["Events & culture", "Tourism & destinations", "Mobility", "Cultural Passport", "Verified visits", "Post-event memory"]}
            gold
            logo="/brand/yalla-hayyihom.png"
            shine="yal"
          />
          <Layer
            n="04"
            name="SECURITY SYSTEMS"
            blurb="Progressive digital trust."
            points={["Cybersecurity", "Secure cloud", "AI security", "Digital trust", "Embedded first", "B2B only when ready"]}
            note="Envelope, not a day-one company"
            logo="/brand/sportix-security.png"
            shine="sec"
          />
        </div>
      </div>
    </SlideFrame>
  );
}

function Layer({
  n,
  name,
  blurb,
  points,
  gold,
  note,
  logo,
  shine,
}: {
  n: string;
  name: string;
  blurb: string;
  points: string[];
  gold?: boolean;
  note?: string;
  logo?: string;
  shine?: "ai" | "eco" | "sec" | "yal";
}) {
  return (
    <div className="panel flex flex-col rounded-lg p-5">
      {logo ? (
        <BrandImg src={logo} alt={name} shine={shine} className="mb-3 h-[140px] w-auto" />
      ) : null}
      <span className="num text-[14px]" style={{ color: gold ? "var(--color-gold)" : "var(--color-lime)" }}>
        {n}
      </span>
      <h3 className="mt-3 mb-0 font-display text-[22px] leading-snug font-semibold tracking-tight">{name}</h3>
      <p className="mt-2 mb-4 text-[17px] text-muted">{blurb}</p>
      <ul className="m-0 flex flex-col gap-1.5 p-0">
        {points.map((p) => (
          <li key={p} className="list-none text-[17px] text-fg">
            <span style={{ color: gold ? "var(--color-gold)" : "var(--color-lime)" }}>· </span>
            {p}
          </li>
        ))}
      </ul>
      {note ? (
        <p className="mt-auto mb-0 pt-4 text-[13px] tracking-[0.12em] text-subtle uppercase">{note}</p>
      ) : null}
    </div>
  );
}
