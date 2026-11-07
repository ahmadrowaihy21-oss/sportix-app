import { SlideFrame } from "@/components/deck/SlideFrame";
import { Kicker, Quote, Title } from "@/components/deck/primitives";

const ATHLETE = [
  "School records sit in one system",
  "Club minutes sit in another",
  "Federation pathways are paper or siloed",
  "Video is unstructured",
  "Rewards are disconnected from verified play",
  "Identity resets at every institution",
];

const VISITOR = [
  "Tickets do not become a relationship",
  "Culture and sport are booked separately",
  "Mobility is a different app",
  "Open sites have no arrival proof",
  "Memories leave with the phone camera",
  "There is no reason to return except the next ad",
];

export function SlideWhy() {
  return (
    <SlideFrame n={3} kicker="The problem">
      <div className="flex h-full flex-col">
        <div className="flex flex-col gap-4">
          <Kicker>Why this exists</Kicker>
          <Title>
            The journeys are real.
            <br />
            The infrastructure is not.
          </Title>
        </div>

        <div className="mt-10 grid flex-1 grid-cols-2 gap-8">
          <BrokenColumn
            eyebrow="Athlete"
            title="A career made of fragments"
            items={ATHLETE}
          />
          <BrokenColumn
            eyebrow="Visitor / fan"
            title="An experience that ends at the gate"
            items={VISITOR}
          />
        </div>

        <div className="mt-8 flex items-center gap-10">
          <Quote>
            SPORTIX AI is designed as the continuity layer — identity, verified evidence and
            intelligence that travel with the person.
          </Quote>
        </div>
      </div>
    </SlideFrame>
  );
}

function BrokenColumn({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="panel flex flex-col rounded-lg p-8">
      <p className="kicker m-0">{eyebrow}</p>
      <h3 className="mt-3 mb-6 font-display text-[28px] leading-tight font-medium tracking-tight">
        {title}
      </h3>
      <ul className="m-0 flex flex-col gap-3 p-0">
        {items.map((item, i) => (
          <li key={item} className="flex list-none items-start gap-4">
            <span className="num mt-0.5 text-[15px] text-subtle">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[17px] text-fg">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
