import { ChevronRight, TrendingUp } from "lucide-react";
import type { SkillMetric } from "@/lib/sport-id/types";
import { VerificationStatus } from "./SportStatusBadge";

export function SkillMetricCard({
  skill,
  onOpen,
}: {
  skill: SkillMetric;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 text-left"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{skill.label}</span>
        <span className="mt-1 flex flex-wrap items-center gap-2">
          <VerificationStatus state={skill.evidence.state} />
          {typeof skill.trend90 === "number" ? (
            <span className="inline-flex items-center gap-0.5 text-2xs text-lime">
              <TrendingUp className="size-3" />
              {skill.trend90 > 0 ? "+" : ""}
              {skill.trend90}% / 90 days
            </span>
          ) : null}
        </span>
      </span>
      <span className="text-right">
        <span className="block font-display text-2xl leading-none tabular">{skill.value}</span>
        {skill.unit ? <span className="text-3xs text-muted">{skill.unit}</span> : null}
      </span>
      <ChevronRight className="size-4 text-faint" />
    </button>
  );
}

export function PerformanceDimensionCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="font-display text-3xl leading-none tabular">{value}</p>
      <p className="mt-1 text-2xs text-muted">{label}</p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-elevated">
        <div className="h-full bg-lime" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
