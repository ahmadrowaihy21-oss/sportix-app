import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/sportix/ScreenHeader";
import { listingById } from "@/lib/marketplace/mock";
import { formatPoints } from "@/lib/marketplace/format";
import { useMarket } from "@/lib/marketplace/store";

const PRESETS = [500, 1000, 5000];

export function SportixImpactHome({ id }: { id: string }) {
  const pop = useMarket((s) => s.pop);
  const push = useMarket((s) => s.push);
  const program = useMarket((s) => s.impact);
  const points = useMarket((s) => s.pointsBalance);
  const checkout = useMarket((s) => s.checkout);
  const listing = listingById[id] ?? listingById[program.listingId];
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("");
  const [step, setStep] = useState<"view" | "confirm" | "success">("view");
  const pct = Math.min(100, Math.round((program.points_collected / program.points_goal) * 100));
  const chosen = custom ? Number(custom) || 0 : amount;

  if (!listing) return null;

  if (step === "success") {
    return (
      <div>
        <ScreenHeader title="SPORTIX IMPACT" onBack={pop} />
        <div className="space-y-3 px-4 py-8 text-center">
          <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-lime">
            Contribution recorded
          </p>
          <p className="text-lg font-semibold">{formatPoints(chosen)} points</p>
          <p className="text-sm text-muted">
            Logged against {program.title}. This is not confirmation that the project is built.
          </p>
          <Button className="w-full" onClick={() => push({ type: "activity" })}>
            Track program
          </Button>
          <Button variant="ghost" className="w-full" onClick={pop}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <ScreenHeader title="SPORTIX IMPACT" subtitle="Verified program" onBack={pop} />
      <img src={listing.image} alt="" className="aspect-photo w-full object-cover" />
      <div className="space-y-4 px-4 py-4">
        <h2 className="text-xl font-semibold">{program.title}</h2>
        <p className="text-sm text-muted">
          Verified program / {program.approved_partner}
        </p>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Impact goal</dt>
            <dd>{program.impact_goal}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Points collected</dt>
            <dd className="tabular">{formatPoints(program.points_collected)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Points goal</dt>
            <dd className="tabular">{formatPoints(program.points_goal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Your contribution</dt>
            <dd className="tabular">{formatPoints(program.user_contribution)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Delivery</dt>
            <dd>Not delivered · no evidence yet</dd>
          </div>
        </dl>
        <div>
          <div className="mb-1 flex justify-between text-2xs text-muted">
            <span>Collection {pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
            <div className="h-full bg-lime" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <p className="rounded-md bg-elevated px-3 py-2 text-2xs text-muted">
          A progress bar is collection only. SPORTIX does not claim this mosque is built until
          delivery evidence is verified.
        </p>

        {step === "view" ? (
          <>
            <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">
              Contribute points
            </p>
            <div className="flex gap-2">
              {PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={n > points}
                  onClick={() => {
                    setCustom("");
                    setAmount(n);
                  }}
                  className={
                    !custom && amount === n
                      ? "h-10 flex-1 rounded-full bg-lime text-2xs font-semibold text-lime-fg disabled:opacity-40"
                      : "h-10 flex-1 rounded-full bg-elevated text-2xs text-muted disabled:opacity-40"
                  }
                >
                  {formatPoints(n)}
                </button>
              ))}
            </div>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Custom"
              inputMode="numeric"
              className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none"
            />
            <p className="text-2xs text-muted">You have {formatPoints(points)} SPORTIX AI Points.</p>
            <Button className="w-full" disabled={chosen <= 0 || chosen > points} onClick={() => setStep("confirm")}>
              CONTRIBUTE POINTS
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm">Confirm {formatPoints(chosen)} SPORTIX AI Points.</p>
            <Button
              className="w-full"
              onClick={() => {
                const order = checkout({
                  source: "impact",
                  pointsUsed: chosen,
                  method: "points",
                  outcome: "success",
                  impactPoints: chosen,
                  clientKey: `impact-${Date.now()}`,
                });
                if (order) setStep("success");
              }}
            >
              CONFIRM CONTRIBUTION
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep("view")}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
