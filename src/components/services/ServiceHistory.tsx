import { Link } from "@tanstack/react-router";
import { useServices } from "@/lib/services/use-services";
export function ServiceHistory() {
  const { view } = useServices("athlete");
  return (
    <section
      className="m-4 rounded-xl border border-border p-4 text-sm"
      dir="rtl"
    >
      <h2 className="font-bold">رحلتي مع الشركاء</h2>
      <p className="mt-2">
        طلبات الخدمات: {view?.requests.length ?? 0} · المكتملة:{" "}
        {view?.requests.filter((r) => r.status === "COMPLETED").length ?? 0}
      </p>
      <p className="mt-1 text-xs text-muted">
        سجل خدمات منفصل عن توثيق الأداء الرياضي أو منح النقاط.
      </p>
      <Link to="/services" className="mt-3 inline-block text-lime underline">
        عرض خدماتي وطلباتي
      </Link>
    </section>
  );
}
