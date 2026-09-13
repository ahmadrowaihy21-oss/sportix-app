import { Button } from "@/components/ui/button";
import { footballVision } from "@/lib/sport-id/mock";
import { useSportId } from "@/lib/sport-id/store";

export function VisionInsightCard() {
  const push = useSportId((s) => s.push);
  const v = footballVision;
  return (
    <section className="rounded-2xl border border-lime/30 bg-surface p-4">
      <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-lime">SPORTIX Vision</p>
      <p className="mt-1 text-2xs text-muted">Intelligence on evidence — not a chatbot.</p>
      <div className="mt-4 space-y-3">
        <Block kicker="What happened">
          <ul className="space-y-1">
            {v.happened.map((h) => (
              <li key={h.label} className="flex justify-between text-sm">
                <span>{h.label}</span>
                <span className="font-display tabular">{h.value}</span>
              </li>
            ))}
          </ul>
        </Block>
        <Block kicker="Why">{v.why}</Block>
        <Block kicker="What next">{v.next}</Block>
      </div>
      <Button
        className="mt-4 w-full"
        variant="outline"
        onClick={() => push({ type: "vision", sport: "football" })}
      >
        View full SPORTIX Vision report
      </Button>
    </section>
  );
}

function Block({ kicker, children }: { kicker: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-3xs font-semibold uppercase tracking-[0.16em] text-muted">{kicker}</p>
      <div className="mt-1 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
