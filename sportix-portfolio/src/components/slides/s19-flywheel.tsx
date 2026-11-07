import { SlideFrame } from "@/components/deck/SlideFrame";
import { Kicker, Quote, Title } from "@/components/deck/primitives";

const NODES = [
  { n: "01", t: "Participation", d: "Play, visit, train, attend." },
  { n: "02", t: "Data", d: "Sessions, tickets, stamps, sensors." },
  { n: "03", t: "Intelligence", d: "Evidence, confidence, insight." },
  { n: "04", t: "Value", d: "Development, discovery, memory." },
  { n: "05", t: "Revenue", d: "Subscriptions, contracts, commerce." },
  { n: "06", t: "Growth", d: "More venues, partners, athletes, visitors." },
];

export function SlideFlywheel() {
  return (
    <SlideFrame n={19} kicker="Compounding system">
      <div className="flex h-full flex-col">
        <div className="flex flex-col gap-4">
          <Kicker>Platform flywheel</Kicker>
          <Title size="lg">Participation is the raw material. Intelligence is the product.</Title>
        </div>

        <div className="mt-10 grid grid-cols-6 gap-4">
          {NODES.map((node) => (
            <div key={node.n} className="panel flex flex-col rounded-lg p-6">
              <span className="num text-[14px] text-lime">{node.n}</span>
              <h3 className="mt-4 mb-2 font-display text-[24px] font-medium tracking-tight">{node.t}</h3>
              <p className="m-0 text-[16px] text-muted">{node.d}</p>
            </div>
          ))}
        </div>


        <div className="mt-8 panel rounded-lg p-7">
          <p className="m-0 font-display text-[24px] leading-snug font-medium tracking-tight">
            More participation produces more evidence. More evidence improves intelligence — after
            validation. Better intelligence produces better development, better visits and better
            partner value. That value funds growth, which produces more participation.
          </p>
        </div>

        <div className="mt-6">
          <Quote>The flywheel only turns if evidence remains honest. Fake scores break the loop.</Quote>
        </div>
      </div>
    </SlideFrame>
  );
}
