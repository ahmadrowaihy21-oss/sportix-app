import { Link } from "@tanstack/react-router";
import { useGo } from "@/lib/go-sportix/store";
import { useAthlete } from "@/lib/athlete/store";
import { syncSyntheticViews } from "@/lib/athlete/bridge";
import { useSportId } from "@/lib/sport-id/store";

export function IntegrationNotice({
  section,
}: {
  section: "go" | "community" | "sport-id" | "market";
}) {
  const data = useAthlete((s) => s.data);
  const persistenceError = useAthlete((s) => s.persistenceError);
  const session = useGo((s) => s.session);
  const setAudience = useGo((s) => s.setAudience);
  const view = useSportId((s) => s.view);
  const a = data.activities.find((x) => x.id === session?.id);
  return (
    <aside
      className="m-4 space-y-3 rounded-xl border border-lime/30 bg-surface p-4 text-sm"
      dir="rtl"
    >
      <strong className="block text-lime">
        ربط ATHLETE التجريبي · بيانات اصطناعية
      </strong>
      <p>
        التحقق والمشتريات والنقاط التشغيلية غير مفعّلة. يُحفظ سجل الأنشطة
        الاصطناعية في هذا المتصفح؛ الصور والجلسة الجارية لا تُحفظ.
      </p>
      {persistenceError && (
        <p role="alert">
          تعذر حفظ السجل أو استعادته. لا تعتمد على استمرار البيانات بعد إغلاق
          الصفحة.
        </p>
      )}
      {section === "go" && a ? (
        <div className="space-y-2">
          <label className="block">
            مشاركة هذا النشاط{" "}
            <select
              aria-label="مشاركة النشاط"
              className="mx-2 rounded bg-bg p-2"
              value={a.consent.audience}
              onChange={(e) =>
                setAudience(
                  e.target.value === "PRIVATE"
                    ? "ONLY ME"
                    : (e.target.value as "FRIENDS" | "PUBLIC"),
                )
              }
            >
              <option value="PRIVATE">أنا فقط</option>
              <option value="FRIENDS">الأصدقاء</option>
              <option value="PUBLIC">عام</option>
            </select>
          </label>
          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={a.consent.shareMetrics}
              onChange={(e) => {
                useAthlete.getState().dispatch(`metrics-${a.id}-${a.version}`, {
                  op: "consent.set",
                  id: a.id,
                  version: a.version,
                  audience: a.consent.audience,
                  shareMetrics: e.target.checked,
                });
                syncSyntheticViews();
              }}
            />
            مشاركة المسافة والمدة والخطوات التجريبية
          </label>
          <p>
            لا تُشارك الصور أو الموقع أو البيانات الصحية. اختيار «أنا فقط» يسحب
            المنشور.
          </p>
        </div>
      ) : null}
      {section === "sport-id" && view === "owner" ? (
        <div>
          <p className="break-all" dir="ltr">
            SPORTIX USER ID: {data.identity.sportixUserId}
          </p>
          <p>سجل الربط الخاص: {data.sportId.length} · مكافآت ممنوحة: 0</p>
          <ul>
            {data.sportId.map((r) => (
              <li
                key={r.id}
                className="mt-2 rounded border border-border p-2"
                dir="ltr"
              >
                {r.kind} · {r.status} · {r.metrics.distanceKm.toFixed(2)} km ·
                synthetic / unverified
              </li>
            ))}
          </ul>
          {data.activities
            .filter((x) => x.status === "SIMULATED_COMPLETED")
            .map((activity) => (
              <label key={activity.id} className="mt-3 block text-xs">
                مشاركة {activity.kind}
                <select
                  aria-label={`Audience ${activity.id}`}
                  value={activity.consent.audience}
                  className="mx-2 rounded bg-bg p-2"
                  onChange={(e) => {
                    useAthlete
                      .getState()
                      .dispatch(`privacy-${activity.id}-${activity.version}`, {
                        op: "consent.set",
                        id: activity.id,
                        version: activity.version,
                        audience: e.target.value as
                          "PRIVATE" | "FRIENDS" | "PUBLIC",
                        shareMetrics: activity.consent.shareMetrics,
                      });
                    syncSyntheticViews();
                  }}
                >
                  <option value="PRIVATE">أنا فقط</option>
                  <option value="FRIENDS">الأصدقاء</option>
                  <option value="PUBLIC">عام</option>
                </select>
              </label>
            ))}
        </div>
      ) : null}
      <Link to="/services" className="inline-block text-lime underline">
        خدمات الشركاء وطلباتي
      </Link>
    </aside>
  );
}
