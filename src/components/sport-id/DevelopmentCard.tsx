import { Button } from "@/components/ui/button";
import { footballDevelopment } from "@/lib/sport-id/mock";
import { useSportId } from "@/lib/sport-id/store";

export function DevelopmentCard() {
  const push = useSportId((s) => s.push);
  return (
    <section>
      <h3 className="text-sm font-semibold">6 month development</h3>
      <div className="mt-3 space-y-2">
        {footballDevelopment.map((d) => (
          <div key={d.label} className="rounded-xl border border-border bg-surface px-3 py-2.5">
            <div className="flex items-baseline justify-between text-sm">
              <span>{d.label}</span>
              <span className="tabular text-muted">
                {d.from} → <span className="text-fg">{d.to}</span>
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-elevated">
              <div className="h-full bg-lime" style={{ width: `${d.to}%` }} />
            </div>
          </div>
        ))}
      </div>
      <Button
        className="mt-3 w-full"
        variant="outline"
        onClick={() => push({ type: "development", sport: "football" })}
      >
        View full journey
      </Button>
    </section>
  );
}
