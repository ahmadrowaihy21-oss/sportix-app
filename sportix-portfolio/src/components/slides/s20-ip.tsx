import { SlideFrame } from "@/components/deck/SlideFrame";
import { Chip, Kicker, Title } from "@/components/deck/primitives";

const MIX = [
  { t: "Patent", d: "Filed only where a claim can be examined without disclosing the crown jewels. Candidates, not grants." },
  { t: "Trade secret", d: "Fusion logic, calibration recipes, operational playbooks that should never become a public claim chart." },
  { t: "Software / copyright", d: "Code, interfaces, capture pipelines, product surfaces." },
  { t: "Data / model know-how", d: "Longitudinal evidence, labelled sessions, evaluation sets, promotion gates." },
  { t: "Brand / trademark", d: "SPORTIX, Yalla Hayyihom and the marks that keep the architecture visually distinct." },
];

export function SlideIp() {
  return (
    <SlideFrame n={20} kicker="Protection mix">
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between">
          <div className="flex max-w-[1000px] flex-col gap-4">
            <Kicker>IP & defensibility</Kicker>
            <Title size="lg">Architecture, data, network — then patents, carefully.</Title>
          </div>
          <Chip>Qualified language only</Chip>
        </div>

        <div className="mt-8 grid grid-cols-[320px_1fr] gap-6">
          <div className="panel flex flex-col justify-between rounded-lg p-8">
            <div>
              <p className="m-0 text-[14px] font-semibold tracking-[0.2em] text-subtle uppercase">Identified</p>
              <p className="num mt-4 mb-0 text-[84px] leading-none font-medium text-lime">97</p>
            </div>
            <p className="m-0 text-[18px] leading-relaxed text-muted">
              Identified invention themes / patent candidates. Not 97 patents. Not filed. Not granted.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {MIX.map((m) => (
              <div key={m.t} className="panel grid grid-cols-[200px_1fr] items-center rounded-md px-6 py-4">
                <p className="m-0 font-display text-[20px] font-semibold tracking-tight">{m.t}</p>
                <p className="m-0 text-[17px] text-muted">{m.d}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 mb-0 text-[17px] text-muted">
          Claim charts, model weights and sensitive algorithms are withheld from this portfolio.
          They belong in NDA rooms, not in a document that travels.
        </p>
      </div>
    </SlideFrame>
  );
}
