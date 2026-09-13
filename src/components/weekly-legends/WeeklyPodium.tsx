import { useWeekly } from "@/lib/weekly-legends/store";
import { useWeeklyBoard } from "@/lib/weekly-legends/store";
import { cn } from "@/lib/utils";

const medals = ["GOLD", "SILVER", "BRONZE"] as const;
const medalClass = ["text-star-yellow", "text-star-silver", "text-warn"];

export function WeeklyPodium() {
  const { all } = useWeeklyBoard();
  const open = useWeekly((s) => s.open);
  const top = all.slice(0, 3);
  const order = [top[1], top[0], top[2]];
  return (
    <section className="px-4">
      <h2 className="text-sm font-semibold">Weekly podium</h2>
      <p className="text-2xs text-muted">Eligible weekly SSP AI · not popularity, not sponsor spend</p>
      <div className="mt-3 grid grid-cols-3 items-end gap-2">
        {order.map((a, visual) => {
          if (!a) return null;
          const place = a.rank;
          const tall = place === 1 ? "h-36" : place === 2 ? "h-28" : "h-24";
          return (
            <button
              key={a.userId}
              type="button"
              onClick={() => open("athlete", a.userId)}
              className={cn("rounded-2xl border border-border bg-surface p-2 text-center", tall)}
            >
              <p className={cn("text-3xs font-semibold tracking-[0.14em]", medalClass[place - 1])}>
                {medals[place - 1]}
              </p>
              {a.avatar ? (
                <img src={a.avatar} alt="" className="mx-auto mt-1 size-10 rounded-full object-cover ring-1 ring-border" />
              ) : (
                <span className="mx-auto mt-1 flex size-10 items-center justify-center rounded-full bg-elevated text-2xs">
                  {a.name.slice(0, 1)}
                </span>
              )}
              <p className="mt-1 truncate text-2xs font-semibold">{a.name}</p>
              <p className="font-display text-lg tabular">{a.ssp.toLocaleString()}</p>
              <p className="text-3xs text-muted">{a.zone}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
