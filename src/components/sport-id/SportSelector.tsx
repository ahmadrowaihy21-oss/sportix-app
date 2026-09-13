import { Plus } from "lucide-react";
import { sportOrder, sports } from "@/lib/sport-id/mock";
import { useSportId } from "@/lib/sport-id/store";
import { cn } from "@/lib/utils";
import { SportGlyph } from "./SportGlyph";
import { SportStatusBadge } from "./SportStatusBadge";

export function SportSelector() {
  const selected = useSportId((s) => s.selected);
  const setSelected = useSportId((s) => s.setSelected);
  const push = useSportId((s) => s.push);
  const added = useSportId((s) => s.added);

  return (
    <section className="px-4 pt-5">
      <h2 className="text-2xs font-semibold uppercase tracking-[0.16em] text-muted">My sports</h2>
      <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {sportOrder.map((key) => {
          const rec = sports[key];
          const on = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              aria-pressed={on}
              className={cn(
                "w-36 shrink-0 rounded-2xl border p-3 text-left",
                on ? "border-lime bg-lime/10" : "border-border bg-surface",
              )}
            >
              <SportGlyph sport={key} className="size-6 text-lime" />
              <p className="mt-2 text-xs font-semibold">{rec.label}</p>
              <p className="mt-0.5 text-3xs tabular text-muted">
                {rec.sessionsValue} {rec.sessionsLabel.toLowerCase()}
              </p>
              <div className="mt-2">
                <SportStatusBadge state={rec.state} compact />
              </div>
            </button>
          );
        })}
        {added.map((a) => (
          <div
            key={a.id}
            className="w-36 shrink-0 rounded-2xl border border-dashed border-border bg-surface p-3"
          >
            <p className="text-xs font-semibold">{a.label}</p>
            <p className="mt-1 text-3xs text-muted">Interest only</p>
          </div>
        ))}
        <button
          type="button"
          onClick={() => push({ type: "add-sport" })}
          className="flex w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border text-muted"
        >
          <Plus className="size-5" />
          <span className="text-3xs font-semibold">Add sport</span>
        </button>
      </div>
    </section>
  );
}
