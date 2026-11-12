import {
  emptyServices,
  type Actor,
  type ServiceState,
  kinds,
} from "./model.ts";
export const demoAthlete: Actor = {
  id: "spx_test_athlete_001",
  role: "athlete",
  tenant: null,
  adult: true,
};
export const demoPartner: Actor = {
  id: "demo_partner",
  role: "partner",
  tenant: "demo_sportix_partner",
  adult: true,
};
export const demoReviewer: Actor = {
  id: "demo_reviewer",
  role: "reviewer",
  tenant: "demo_sportix_partner",
  adult: true,
};
const names = [
  "عضوية نادي رياضي",
  "برنامج أكاديمية كرة القدم",
  "جلسة مع مدرب",
  "حجز ملعب بادل",
  "مضرب رياضي",
  "قسيمة تجهيزات رياضية",
  "اشتراك لياقة شهري",
  "مبادرة رياضة للجميع",
];
export function demoServices(now = new Date().toISOString()): ServiceState {
  const state = emptyServices("sandbox");
  state.offers = kinds.map((kind, i) => ({
    id: `demo-${kind.toLowerCase()}`,
    tenant: demoPartner.tenant!,
    kind,
    title: names[i],
    description:
      "خدمة اصطناعية لاختبار رحلة الرياضي والشريك. لا دفع أو حجز خارجي.",
    city: "جدة",
    priceMinor: kind === "IMPACT" ? 0 : (i + 1) * 2500,
    capacity: 3,
    remaining: 3,
    startsAt: ["COACH", "VENUE"].includes(kind)
      ? new Date(Date.parse(now) + 7 * 86400000).toISOString()
      : null,
    durationDays: 30,
    status: "PUBLISHED",
    version: 1,
    submittedBy: demoPartner.id,
    reviewedBy: demoReviewer.id,
  }));
  return state;
}
