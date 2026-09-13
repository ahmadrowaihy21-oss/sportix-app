import { formatPoints } from "@/lib/marketplace/format";
import type { ImpactProgram } from "@/lib/marketplace/types";
import { listingById } from "@/lib/marketplace/mock";

export function ImpactProgramCard({
  program,
  onOpen,
}: {
  program: ImpactProgram;
  onOpen: () => void;
}) {
  const listing = listingById[program.listingId];
  const pct = Math.min(100, Math.round((program.points_collected / program.points_goal) * 100));
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full overflow-hidden rounded-2xl border border-border bg-surface text-left"
    >
      <img src={listing?.image} alt="" className="aspect-photo w-full object-cover" />
      <div className="space-y-2 p-3">
        <p className="text-3xs font-semibold uppercase tracking-[0.16em] text-lime">SPORTIX IMPACT</p>
        <p className="text-sm font-semibold">{program.title}</p>
        <p className="text-2xs text-muted">Verified program · {program.approved_partner}</p>
        <div>
          <div className="mb-1 flex justify-between text-2xs text-muted">
            <span>Points collected {pct}%</span>
            <span className="tabular">
              {formatPoints(program.points_collected)} / {formatPoints(program.points_goal)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
            <div className="h-full bg-lime" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <p className="text-3xs text-faint">
          Collected is not delivered. Impact is reported only after verified evidence.
        </p>
      </div>
    </button>
  );
}
