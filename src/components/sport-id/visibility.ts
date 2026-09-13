import type { SkillMetric, SportKey, ViewMode } from "@/lib/sport-id/types";

export function visibleSkills(
  skills: SkillMetric[],
  view: ViewMode,
  metricsPublic: boolean,
  sport: SportKey,
) {
  if (view === "owner") return skills;
  if (view === "public") return metricsPublic ? skills.filter((s) => s.public) : [];
  if (sport === "walking") return [];
  return skills.filter((s) => s.professional);
}
