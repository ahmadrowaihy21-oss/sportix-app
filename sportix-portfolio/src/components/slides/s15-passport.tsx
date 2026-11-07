import { SlideFrame } from "@/components/deck/SlideFrame";
import { Chip, Kicker, Title } from "@/components/deck/primitives";

const LEFT = [
  { t: "Cultural Passport", d: "A living record of verified cultural and sporting presence — stamps earned, not badges bought." },
  { t: "Experience Map", d: "Personalised discovery across events, neighbourhoods, heritage and partner places." },
  { t: "Verified visits", d: "Presence that can be evidenced. Open sites by geofence; gated venues by authorised entry." },
  { t: "Memories", d: "Capture designed to become a post-event object, not a camera roll that dies." },
];

const RIGHT = [
  { t: "Rewards & partner offers", d: "Value that follows the stamp — hospitality, retail, return visits." },
  { t: "Event community", d: "The people who shared the night remain a graph, not a crowd that dissolves." },
  { t: "Personalised journeys", d: "Know-me logic: the next plan starts from who you already were last time." },
  { t: "Post-event retention", d: "The commercial and cultural point: a reason to return." },
];

export function SlidePassport() {
  return (
    <SlideFrame n={15} kicker="Culture + tourism" plate="/plates/courtyard.jpg" overlay={0.82} variant="yhh">
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <Kicker tone="gold">Cultural Passport & Experience Intelligence</Kicker>
            <Title size="lg">Verified presence becomes memory — then return.</Title>
          </div>
          <Chip tone="gold">Designed retention instrument</Chip>
        </div>
        <div className="mt-8 grid flex-1 grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            {LEFT.map((x) => (
              <div key={x.t} className="panel flex-1 rounded-lg p-6">
                <p className="m-0 text-[22px] font-semibold" style={{ color: "var(--color-gold)" }}>{x.t}</p>
                <p className="mt-2 mb-0 text-[17px] leading-relaxed text-muted">{x.d}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {RIGHT.map((x) => (
              <div key={x.t} className="panel flex-1 rounded-lg p-6">
                <p className="m-0 text-[22px] font-semibold text-fg">{x.t}</p>
                <p className="mt-2 mb-0 text-[17px] leading-relaxed text-muted">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
