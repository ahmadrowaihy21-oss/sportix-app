const PRAYERS = [
  { name: "Fajr", h: 5, m: 2 },
  { name: "Dhuhr", h: 12, m: 17 },
  { name: "Asr", h: 15, m: 42 },
  { name: "Maghrib", h: 18, m: 27 },
  { name: "Isha", h: 19, m: 57 },
] as const;

export function nextPrayer(now = new Date()) {
  for (const p of PRAYERS) {
    const t = new Date(now);
    t.setHours(p.h, p.m, 0, 0);
    if (t.getTime() > now.getTime()) {
      const mins = Math.round((t.getTime() - now.getTime()) / 60_000);
      return { name: p.name, at: `${String(p.h).padStart(2, "0")}:${String(p.m).padStart(2, "0")}`, mins };
    }
  }
  return { name: "Fajr", at: "05:02", mins: 8 * 60 };
}
