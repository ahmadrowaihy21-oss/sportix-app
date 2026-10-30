export type Position = "حارس مرمى" | "مدافع" | "وسط" | "مهاجم";
export type Athlete = {
  id: string;
  alias: string;
  shirt: number;
  position: Position;
  createdAt: string;
};
export type Report = {
  id: string;
  athleteId: string;
  date: string;
  minutes: number;
  distanceKm: number;
  maxSpeedKmh: number;
  sprints: number;
  coverage: number;
  note: string;
  status: "draft" | "approved";
  source: "sample" | "manual";
  approvedAt?: string;
};
export type AcademyState = {
  version: 1;
  athletes: Athlete[];
  reports: Report[];
};
export const positions: Position[] = ["حارس مرمى", "مدافع", "وسط", "مهاجم"];
export const STORAGE_KEY = "sportix.academy.preview.v1";
export function validateAthlete(
  input: Pick<Athlete, "alias" | "shirt" | "position">,
  existing: Athlete[],
): string | null {
  if (!input.alias.trim() || input.alias.trim().length > 40)
    return "أدخل اسمًا تجريبيًا من 1 إلى 40 حرفًا.";
  if (!Number.isInteger(input.shirt) || input.shirt < 1 || input.shirt > 99)
    return "رقم القميص يجب أن يكون من 1 إلى 99.";
  if (existing.some((a) => a.shirt === input.shirt))
    return "رقم القميص مستخدم بالفعل.";
  if (!positions.includes(input.position)) return "اختر مركزًا صالحًا.";
  return null;
}
export function validateReport(
  input: Omit<Report, "id" | "status" | "source" | "approvedAt">,
  athletes: Athlete[],
): string | null {
  if (!athletes.some((a) => a.id === input.athleteId))
    return "اختر لاعبًا موجودًا.";
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.date) ||
    Number.isNaN(Date.parse(input.date)) ||
    new Date(input.date).toISOString().slice(0, 10) !== input.date
  )
    return "أدخل تاريخًا صالحًا.";
  const fields: [number, number, number][] = [
    [input.minutes, 1, 150],
    [input.distanceKm, 0, 30],
    [input.maxSpeedKmh, 0, 50],
    [input.sprints, 0, 200],
    [input.coverage, 0, 100],
  ];
  if (fields.some(([n, min, max]) => !Number.isFinite(n) || n < min || n > max))
    return "راجع القيم: الدقائق 1–150، المسافة 0–30، السرعة 0–50، الجري السريع 0–200، التغطية 0–100.";
  if (!Number.isInteger(input.sprints))
    return "عدد مرات الجري السريع يجب أن يكون عددًا صحيحًا.";
  if (input.note.length > 1000) return "ملاحظة المدرب لا تتجاوز 1000 حرف.";
  return null;
}
export function approveReport(
  state: AcademyState,
  id: string,
  now: string,
): AcademyState {
  const report = state.reports.find((r) => r.id === id);
  if (!report) throw new Error("التقرير غير موجود.");
  if (report.coverage < 95)
    throw new Error("التغطية أقل من 95٪؛ أبقِ التقرير قيد المراجعة.");
  if (report.status === "approved") return state;
  return {
    ...state,
    reports: state.reports.map((r) =>
      r.id === id ? { ...r, status: "approved", approvedAt: now } : r,
    ),
  };
}
export function athleteReports(
  state: AcademyState,
  athleteId: string,
): Report[] {
  return state.reports
    .filter((r) => r.athleteId === athleteId && r.status === "approved")
    .sort((a, b) => a.date.localeCompare(b.date));
}
export function parseStoredState(raw: string): AcademyState | null {
  try {
    const s = JSON.parse(raw) as AcademyState;
    if (
      s.version !== 1 ||
      !Array.isArray(s.athletes) ||
      !Array.isArray(s.reports) ||
      s.athletes.length > 200 ||
      s.reports.length > 2000
    )
      return null;
    const seen: Athlete[] = [];
    for (const a of s.athletes) {
      if (
        typeof a.id !== "string" ||
        !a.id ||
        typeof a.alias !== "string" ||
        typeof a.createdAt !== "string" ||
        seen.some((x) => x.id === a.id) ||
        validateAthlete(a, seen)
      )
        return null;
      seen.push(a);
    }
    const reportIds = new Set<string>();
    for (const r of s.reports) {
      if (
        typeof r.id !== "string" ||
        !r.id ||
        reportIds.has(r.id) ||
        typeof r.note !== "string" ||
        !["draft", "approved"].includes(r.status) ||
        !["sample", "manual"].includes(r.source) ||
        validateReport(r, s.athletes)
      )
        return null;
      if (
        r.status === "approved" &&
        (r.coverage < 95 || typeof r.approvedAt !== "string")
      )
        return null;
      reportIds.add(r.id);
    }
    return s;
  } catch {
    return null;
  }
}
export function sampleState(): AcademyState {
  return {
    version: 1,
    athletes: [
      {
        id: "demo-01",
        alias: "لاعب تجريبي 01",
        shirt: 10,
        position: "وسط",
        createdAt: "2026-10-01",
      },
      {
        id: "demo-02",
        alias: "لاعب تجريبي 02",
        shirt: 7,
        position: "مهاجم",
        createdAt: "2026-10-01",
      },
      {
        id: "demo-03",
        alias: "لاعب تجريبي 03",
        shirt: 4,
        position: "مدافع",
        createdAt: "2026-10-01",
      },
    ],
    reports: [
      {
        id: "r1",
        athleteId: "demo-01",
        date: "2026-10-10",
        minutes: 60,
        distanceKm: 6.1,
        maxSpeedKmh: 26.8,
        sprints: 8,
        coverage: 97,
        note: "بيانات اصطناعية لتجربة مقارنة الجلسات.",
        status: "approved",
        source: "sample",
        approvedAt: "2026-10-11T10:00:00Z",
      },
      {
        id: "r2",
        athleteId: "demo-01",
        date: "2026-10-17",
        minutes: 60,
        distanceKm: 6.5,
        maxSpeedKmh: 27.2,
        sprints: 10,
        coverage: 98,
        note: "بيانات اصطناعية؛ لا تمثل تقييمًا للاعب حقيقي.",
        status: "approved",
        source: "sample",
        approvedAt: "2026-10-18T10:00:00Z",
      },
      {
        id: "r3",
        athleteId: "demo-01",
        date: "2026-10-24",
        minutes: 60,
        distanceKm: 6.8,
        maxSpeedKmh: 28.1,
        sprints: 11,
        coverage: 97,
        note: "راجع القيم ومصدرها قبل الاعتماد. لا توجد توصية آلية أو استنتاجات نفسية.",
        status: "draft",
        source: "sample",
      },
      {
        id: "r4",
        athleteId: "demo-02",
        date: "2026-10-24",
        minutes: 60,
        distanceKm: 6.3,
        maxSpeedKmh: 29.2,
        sprints: 14,
        coverage: 92,
        note: "نموذج لتقرير تغطيته غير كافية؛ لا يمكن اعتماده.",
        status: "draft",
        source: "sample",
      },
    ],
  };
}
