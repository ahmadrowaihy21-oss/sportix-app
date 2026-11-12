import { previewPointsQuote } from "@/lib/services/quote";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CalendarDays,
  CircleCheck,
  Search,
  Store,
} from "lucide-react";
import {
  kinds,
  type Kind,
  type ServiceRequest,
  type Actor,
} from "@/lib/services/model";
import { useServices, commandKey } from "@/lib/services/use-services";
const kindLabels: Record<Kind, [string, string]> = {
  CLUB: ["الأندية", "Clubs"],
  ACADEMY: ["الأكاديميات", "Academies"],
  COACH: ["المدربون", "Coaches"],
  VENUE: ["الملاعب", "Venues"],
  PRODUCT: ["المنتجات", "Products"],
  COUPON: ["القسائم", "Coupons"],
  SUBSCRIPTION: ["الاشتراكات", "Subscriptions"],
  IMPACT: ["الأثر المجتمعي", "Impact"],
};
const statusLabels: Record<string, [string, string]> = {
  REQUESTED: ["بانتظار الشريك", "Awaiting partner"],
  ACCEPTED: ["قُبل الطلب", "Request accepted"],
  COMPLETED: ["مكتمل", "Completed"],
  CANCELLED: ["ملغى", "Cancelled"],
  REJECTED: ["مرفوض", "Rejected"],
  EXPIRED: ["انتهت المهلة", "Expired"],
  DRAFT: ["مسودة", "Draft"],
  IN_REVIEW: ["قيد المراجعة", "In review"],
  APPROVED: ["معتمد للنشر", "Approved"],
  PUBLISHED: ["منشور", "Published"],
  PAUSED: ["متوقف", "Paused"],
};
const errors: Record<string, [string, string]> = {
  CAPACITY_EXCEEDED: [
    "اكتملت السعة. حدّث القائمة واختر خدمة أخرى.",
    "Capacity is full. Refresh and choose another offer.",
  ],
  DUPLICATE_ACTIVE_REQUEST: [
    "لديك طلب قائم لهذه الخدمة.",
    "You already have an active request.",
  ],
  VERSION_CONFLICT: [
    "تغير الطلب أو العرض. حدّث الصفحة قبل المحاولة.",
    "This item changed. Refresh before retrying.",
  ],
  REQUEST_EXPIRED: [
    "انتهت مهلة الطلب. أنشئ طلبًا جديدًا.",
    "The hold expired. Create a new request.",
  ],
  PROVIDER_REQUIRED: [
    "تتطلب هذه الخطوة ربط مزود الدفع أو تنفيذ الخدمة.",
    "Payment or fulfilment provider is required.",
  ],
  SERVICES_NOT_CONFIGURED: [
    "خدمات الحسابات لم تُفعّل بعد. يلزم إعداد الخادم والشريك.",
    "Account services are not configured yet.",
  ],
  SIGN_IN_REQUIRED: [
    "يلزم تسجيل الدخول بحساب فعلي.",
    "A real signed-in account is required.",
  ],
  FORBIDDEN: [
    "لا يملك هذا الحساب صلاحية هذا الإجراء.",
    "This account is not permitted to perform this action.",
  ],
  ACCOUNT_NOT_READY: [
    "يحتاج الحساب إلى إكمال التهيئة المعتمدة.",
    "The account requires approved onboarding.",
  ],
};
const btn =
  "min-h-11 rounded-xl border border-border bg-elevated px-4 py-2 text-sm font-semibold disabled:opacity-40";
export function ServiceWorkspace({ partner = false }: { partner?: boolean }) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const text = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const [role, setRole] = useState<Actor["role"]>(
    partner ? "partner" : "athlete",
  );
  const { view, error, busy, sandbox, dispatch, reload, reset } =
    useServices(role);
  const [tab, setTab] = useState<"catalog" | "requests" | "new">("catalog");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [points, setPoints] = useState(0);
  const [notice, setNotice] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [newKind, setNewKind] = useState<Kind>("CLUB");
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    city: "",
    price: "0",
    capacity: "3",
    startsAt: "",
  });
  const offers =
    view?.offers.filter(
      (o) =>
        (filter === "ALL" || o.kind === filter) &&
        `${o.title} ${o.city}`.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];
  const chosen = view?.offers.find((o) => o.id === selected);
  const validQuantity =
    Number.isInteger(quantity) && quantity >= 1 && quantity <= 10;
  const quoteBase = previewPointsQuote(
    chosen && validQuantity ? chosen.priceMinor * quantity : 0,
    0,
  );
  const quote = previewPointsQuote(
    quoteBase.priceMinor,
    Math.min(points, quoteBase.maxPoints),
  );
  const action = async (
    r: ServiceRequest,
    op:
      | "request.accept"
      | "request.reject"
      | "request.cancel"
      | "request.complete"
      | "request.redeem",
  ) => {
    if (await dispatch({ op, id: r.id, version: r.version }))
      setNotice(text("تم تحديث الطلب وحفظه.", "Request updated and saved."));
  };
  return (
    <main
      className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-28"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="font-display text-lg tracking-widest text-lime">
          SPORTIX <span className="text-fg">ATHLETE</span>
        </Link>
        <button
          className={btn}
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
        >
          {text("English", "العربية")}
        </button>
      </header>
      <section className="rounded-3xl border border-lime/20 bg-surface p-6 sm:p-8">
        <p className="mb-3 text-xs font-bold tracking-widest text-lime">
          {partner ? "SPORTIX PARTNERS" : "YOUR NEXT MOVE"}
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">
          {partner
            ? text("خدماتك تصل للرياضي.", "Bring your services to athletes.")
            : text(
                "كل ما تحتاجه لخطوتك القادمة.",
                "Everything for your next move.",
              )}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          {partner
            ? text(
                "أنشئ عرضك، تابِع المراجعة، وأدر الطلبات من مكان واحد.",
                "Create offers, follow reviews and manage requests in one place.",
              )
            : text(
                "اكتشف الشركاء، اطلب الخدمة، وتابع حالتها حتى الاكتمال.",
                "Discover partners, request a service and follow its progress.",
              )}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to={partner ? "/services" : "/partners"} className={btn}>
            {partner
              ? text("رحلة الرياضي", "Athlete journey")
              : text("مساحة الشريك", "Partner workspace")}{" "}
            <ArrowUpRight className="inline size-4" />
          </Link>
          <Link to="/sport-id" className={btn}>
            SPORT ID
          </Link>
          <Link to="/go-sportix" className={btn}>
            GO SPORTIX
          </Link>
        </div>
      </section>
      <aside
        className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm leading-6"
        role="note"
      >
        {sandbox
          ? text(
              "تجربة MVP ببيانات اصطناعية محفوظة في هذا المتصفح. تبديل الأدوار للعرض فقط. لا دفع فعلي، ولا حجز لدى شريك خارجي، ولا نقاط قابلة للصرف.",
              "MVP sandbox. Synthetic data is saved in this browser. Role switching is for demonstration. No real payment, external booking or spendable points.",
            )
          : text(
              "طلبات بحسابات موثقة. قبول الطلب لا يُعد دفعًا أو إصدار قسيمة؛ تظهر حالة كل خطوة في الطلب.",
              "Authenticated requests. Acceptance does not confirm payment or issue an entitlement.",
            )}
        {sandbox && partner && (
          <label className="mt-3 block">
            {text("شخصية التجربة", "Demo role")}{" "}
            <select
              aria-label="Demo role"
              className="mx-2 rounded bg-bg p-2"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as Actor["role"]);
                setTab("catalog");
              }}
            >
              <option value="partner">{text("الشريك", "Partner")}</option>
              <option value="reviewer">
                {text("المراجع المستقل", "Independent reviewer")}
              </option>
            </select>
          </label>
        )}
      </aside>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        {[
          [Store, view?.offers.length ?? 0, text("عروض", "Offers")],
          [
            CalendarDays,
            view?.requests.filter((r) =>
              ["REQUESTED", "ACCEPTED"].includes(r.status),
            ).length ?? 0,
            text("طلبات قائمة", "Active requests"),
          ],
          [
            CircleCheck,
            view?.requests.filter((r) => r.status === "COMPLETED").length ?? 0,
            text("مكتملة", "Completed"),
          ],
        ].map(([Icon, count, label]) => {
          const I = Icon as typeof Store;
          return (
            <div
              key={String(label)}
              className="rounded-2xl border border-border p-3"
            >
              <I className="mx-auto mb-2 size-5 text-lime" />
              <strong className="block text-2xl">{String(count)}</strong>
              {String(label)}
            </div>
          );
        })}
      </div>
      <nav aria-label="Service sections" className="flex flex-wrap gap-2">
        <button
          className={btn}
          aria-pressed={tab === "catalog"}
          onClick={() => setTab("catalog")}
        >
          {text("الخدمات", "Services")}
        </button>
        <button
          className={btn}
          aria-pressed={tab === "requests"}
          onClick={() => setTab("requests")}
        >
          {text("الطلبات", "Requests")}
        </button>
        {partner && role === "partner" && (
          <button className={btn} onClick={() => setTab("new")}>
            {text("عرض جديد", "New offer")}
          </button>
        )}
        <button className={btn} disabled={busy} onClick={() => void reload()}>
          {text("تحديث", "Refresh")}
        </button>
      </nav>
      {error && (
        <div role="alert" className="rounded-xl border border-red-400/40 p-4">
          {errors[error]
            ? text(...errors[error])
            : text(
                "تعذر إكمال العملية. تحقق من المدخلات أو التخزين وأعد المحاولة.",
                "Could not complete the operation. Check the inputs or storage and retry.",
              )}{" "}
          <code className="block break-all text-xs text-muted">{error}</code>
        </div>
      )}
      {notice && (
        <p role="status" className="text-lime">
          {notice}
        </p>
      )}
      {!view && !error && <p>{text("جارٍ التحميل…", "Loading…")}</p>}
      {tab === "catalog" && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3">
              <Search className="size-4" />
              <input
                aria-label="Search services"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={text(
                  "ابحث عن خدمة أو مدينة",
                  "Search services or city",
                )}
                className="min-h-11 w-full bg-transparent"
              />
            </label>
            <select
              aria-label="Service category"
              className="min-h-11 rounded-xl border border-border bg-bg px-3"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">
                {text("جميع الخدمات", "All services")}
              </option>
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {text(...kindLabels[k])}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((o) => (
              <article
                key={o.id}
                data-testid={`offer-${o.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
              >
                <p className="text-xs font-bold text-lime">
                  {text(...kindLabels[o.kind])} · {o.city}
                </p>
                <h2 className="text-lg font-bold">{o.title}</h2>
                <p className="flex-1 text-sm leading-6 text-muted">
                  {o.description}
                </p>
                {o.startsAt && (
                  <p className="text-sm">
                    {new Date(o.startsAt).toLocaleString(
                      lang === "ar" ? "ar-SA" : "en-GB",
                      {
                        timeZone: "Asia/Riyadh",
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    )}{" "}
                    {text("(الرياض)", "(Riyadh)")}
                  </p>
                )}
                <p>
                  {o.priceMinor / 100} {text("ر.س.", "SAR")} ·{" "}
                  {text(`متاح ${o.remaining}`, `${o.remaining} available`)}
                </p>
                {partner ? (
                  <>
                    <p className="text-sm text-muted">
                      {text(...statusLabels[o.status])}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {((role === "partner" &&
                        ["DRAFT", "APPROVED", "PUBLISHED", "PAUSED"].includes(
                          o.status,
                        )) ||
                        (role === "reviewer" && o.status === "IN_REVIEW")) && (
                        <button
                          disabled={busy}
                          className={btn}
                          onClick={() =>
                            void dispatch({
                              op:
                                role === "reviewer"
                                  ? "offer.approve"
                                  : o.status === "DRAFT"
                                    ? "offer.submit"
                                    : o.status === "PUBLISHED"
                                      ? "offer.pause"
                                      : "offer.publish",
                              id: o.id,
                              version: o.version,
                            })
                          }
                        >
                          {role === "reviewer"
                            ? text("اعتماد المراجعة", "Approve review")
                            : o.status === "DRAFT"
                              ? text("إرسال للمراجعة", "Submit for review")
                              : o.status === "PUBLISHED"
                                ? text("إيقاف العرض", "Pause offer")
                                : text("نشر العرض", "Publish offer")}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <button
                    className={`${btn} bg-lime text-black`}
                    disabled={busy || o.remaining < 1}
                    onClick={() => {
                      setSelected(o.id);
                      setConsent(false);
                      setQuantity(1);
                      setPoints(0);
                    }}
                  >
                    {text("طلب الخدمة", "Request service")}
                  </button>
                )}
              </article>
            ))}
          </div>
          {offers.length === 0 && (
            <p className="rounded-xl border border-border p-6">
              {text(
                "لا توجد خدمات مطابقة حاليًا.",
                "No matching services at the moment.",
              )}
            </p>
          )}
        </>
      )}
      {chosen && !partner && tab === "catalog" && (
        <section
          aria-label="Request confirmation"
          className="space-y-4 rounded-2xl border border-lime p-5"
        >
          <h2 className="text-xl font-bold">
            {text("تأكيد طلب", "Confirm request")}: {chosen.title}
          </h2>
          <p className="text-sm">
            {text(
              "يحفظ الطلب السعة مؤقتًا لمدة تصل إلى 15 دقيقة حتى يراجعه الشريك. يمكنك الإلغاء قبل بدء الخدمة. السعر للعرض؛ لم يتم تحصيل أي مبلغ.",
              "A request temporarily holds capacity for up to 15 minutes for partner review. Cancel before the service starts. No amount is collected.",
            )}
          </p>
          {chosen.kind === "PRODUCT" && (
            <label>
              {text("الكمية", "Quantity")}{" "}
              <input
                aria-label="Quantity"
                type="number"
                min="1"
                max={Math.min(10, chosen.remaining)}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20 rounded bg-bg p-2"
              />
            </label>
          )}
          <p className="font-bold">
            {text("إجمالي الطلب", "Request total")}:{" "}
            {(chosen.priceMinor * quantity) / 100} SAR ·{" "}
            {text("النقاط: 0", "Points: 0")}
          </p>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 size-5"
            />
            {text(
              "أوافق على مشاركة معرّف حسابي وبيانات هذا الطلب مع الشريك لمعالجته. لا يُشارك النشاط أو الموقع أو البيانات الصحية.",
              "I consent to share my account identifier and this request with the partner for processing. Activity, location and health data are not shared.",
            )}
          </label>
          {sandbox && (
            <div className="space-y-2 rounded-xl border border-border p-3 text-sm">
              <label className="block">
                {text("معاينة تغطية النقاط", "Preview points coverage")}{" "}
                <input
                  aria-label="Preview points"
                  type="range"
                  min="0"
                  max={quoteBase.maxPoints}
                  value={Math.min(points, quoteBase.maxPoints)}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </label>
              <p>
                {text("السعر الأصلي", "Original")}: {quote.priceMinor / 100} SAR
                · {text("تغطية SPORTIX", "SPORTIX coverage")}:{" "}
                {quote.coverageMinor / 100} SAR ·{" "}
                {text("حصة الرياضي", "Athlete remainder")}:{" "}
                {quote.athleteDueMinor / 100} SAR
              </p>
              <p className="text-xs text-muted">
                {text(
                  "سياسة اختبار فقط: النقطة = 0.10 ريال، بحد أقصى 30%. المعاينة لا تخصم نقاطًا ولا تُعتمد على الطلب.",
                  "Test policy only: 0.10 SAR per point, capped at 30%. Preview does not debit points or apply a discount to the request.",
                )}
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              disabled={!consent || busy || !validQuantity}
              className={`${btn} bg-lime text-black`}
              onClick={async () => {
                const key = commandKey();
                if (
                  await dispatch(
                    {
                      op: "request.create",
                      id: key,
                      offerId: chosen.id,
                      offerVersion: chosen.version,
                      quantity,
                      consent: true,
                    },
                    key,
                  )
                ) {
                  setSelected(null);
                  setTab("requests");
                  setNotice(
                    text(
                      "تم حفظ طلبك. يمكنك متابعة رد الشريك هنا.",
                      "Request saved. Follow the partner response here.",
                    ),
                  );
                }
              }}
            >
              {text("تأكيد وإرسال الطلب", "Confirm and submit")}
            </button>
            <button className={btn} onClick={() => setSelected(null)}>
              {text("رجوع", "Back")}
            </button>
          </div>
        </section>
      )}
      {tab === "requests" && (
        <section className="space-y-4">
          {view?.requests.length === 0 && (
            <p>{text("لم تُنشأ طلبات بعد.", "No requests yet.")}</p>
          )}
          {view?.requests
            .slice()
            .reverse()
            .map((r) => (
              <article
                key={r.id}
                data-testid={`request-${r.id}`}
                className="space-y-3 rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <h2 className="font-bold">{r.title}</h2>
                  <span className="rounded-full bg-lime/10 px-3 py-1 text-xs text-lime">
                    {text(...statusLabels[r.status])}
                  </span>
                </div>
                <p className="text-sm">
                  {text("الكمية", "Quantity")}: {r.quantity} ·{" "}
                  {r.priceMinor / 100} SAR ·{" "}
                  {text(
                    "المدفوع: 0 · النقاط المخصومة: 0",
                    "Captured: 0 · Points debited: 0",
                  )}
                </p>
                <p className="break-all text-xs text-muted">
                  {text("مرجع الطلب", "Request reference")}: {r.id}
                </p>
                {r.status === "REQUESTED" && (
                  <p className="text-xs text-muted">
                    {text("تنتهي مهلة الرد", "Response deadline")}:{" "}
                    {new Date(r.expiresAt).toLocaleTimeString(
                      lang === "ar" ? "ar-SA" : "en-GB",
                      { timeZone: "Asia/Riyadh" },
                    )}
                  </p>
                )}
                {r.entitlement && (
                  <p className="text-sm text-lime">
                    {r.entitlement.status === "SIMULATED_USED"
                      ? text("قسيمة تجريبية مستخدمة", "Simulated coupon used")
                      : Date.parse(r.entitlement.expiresAt) <= Date.now()
                        ? text(
                            "انتهى الاستحقاق التجريبي",
                            "Simulated entitlement expired",
                          )
                        : text(
                            "استحقاق تجريبي نشط — لا يُستخدم خارج المختبر",
                            "Simulated active entitlement — sandbox only",
                          )}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {!partner && ["REQUESTED", "ACCEPTED"].includes(r.status) && (
                    <button
                      disabled={busy}
                      className={btn}
                      onClick={() => void action(r, "request.cancel")}
                    >
                      {text("إلغاء الطلب", "Cancel request")}
                    </button>
                  )}
                  {role === "partner" && r.status === "REQUESTED" && (
                    <button
                      disabled={busy}
                      className={btn}
                      onClick={() => void action(r, "request.accept")}
                    >
                      {text("قبول الطلب", "Accept request")}
                    </button>
                  )}
                  {role === "partner" &&
                    ["REQUESTED", "ACCEPTED"].includes(r.status) && (
                      <button
                        disabled={busy}
                        className={btn}
                        onClick={() => void action(r, "request.reject")}
                      >
                        {text("رفض الطلب", "Reject request")}
                      </button>
                    )}
                  {role === "partner" && r.status === "ACCEPTED" && (
                    <button
                      disabled={busy}
                      className={btn}
                      onClick={() => void action(r, "request.complete")}
                    >
                      {sandbox
                        ? text("محاكاة إتمام الخدمة", "Simulate completion")
                        : text("إتمام الخدمة", "Complete service")}
                    </button>
                  )}
                  {role === "partner" &&
                    r.kind === "COUPON" &&
                    r.entitlement?.status === "SIMULATED_ACTIVE" && (
                      <button
                        disabled={busy}
                        className={btn}
                        onClick={() => void action(r, "request.redeem")}
                      >
                        {text("محاكاة استخدام القسيمة", "Simulate redemption")}
                      </button>
                    )}
                  {!partner &&
                    r.status === "COMPLETED" &&
                    r.rating === null && (
                      <label className="text-sm">
                        {text("قيّم الخدمة", "Rate service")}{" "}
                        <select
                          aria-label={`Rating ${r.id}`}
                          className="rounded bg-bg p-2"
                          defaultValue=""
                          disabled={busy}
                          onChange={(e) => {
                            if (e.target.value)
                              void dispatch({
                                op: "request.rate",
                                id: r.id,
                                version: r.version,
                                rating: Number(e.target.value),
                              });
                          }}
                        >
                          <option value="">{text("اختر", "Choose")}</option>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n} / 5
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  {r.rating && (
                    <p>
                      {text("تقييمك", "Your rating")}: {r.rating} / 5
                    </p>
                  )}
                </div>
              </article>
            ))}
        </section>
      )}
      {tab === "new" && role === "partner" && (
        <form
          className="space-y-4 rounded-2xl border border-border p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await dispatch({
              op: "offer.create",
              offer: {
                id: commandKey(),
                kind: newKind,
                title: draft.title,
                description: draft.description,
                city: draft.city,
                priceMinor: Math.round(Number(draft.price) * 100),
                capacity: Number(draft.capacity),
                startsAt: draft.startsAt
                  ? new Date(draft.startsAt + ":00+03:00").toISOString()
                  : null,
                durationDays: 30,
              },
            });
            if (ok) {
              setTab("catalog");
              setDraft({
                title: "",
                description: "",
                city: "",
                price: "0",
                capacity: "3",
                startsAt: "",
              });
              setNotice(
                text(
                  "حُفظت المسودة. أرسلها للمراجعة قبل النشر.",
                  "Draft saved. Submit for review before publishing.",
                ),
              );
            }
          }}
        >
          <h2 className="text-xl font-bold">{text("عرض جديد", "New offer")}</h2>
          <label className="block">
            {text("نوع الخدمة", "Service type")}
            <select
              aria-label="Offer kind"
              value={newKind}
              onChange={(e) => setNewKind(e.target.value as Kind)}
              className="mt-1 block w-full rounded-xl border border-border bg-bg p-3"
            >
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {text(...kindLabels[k])}
                </option>
              ))}
            </select>
          </label>
          {(
            [
              "title",
              "description",
              "city",
              "price",
              "capacity",
              "startsAt",
            ] as const
          ).map((field) => (
            <label key={field} className="block">
              {text(
                {
                  title: "اسم الخدمة",
                  description: "الوصف",
                  city: "المدينة",
                  price: "السعر بالريال",
                  capacity: "السعة",
                  startsAt: "الموعد بتوقيت الرياض (إلزامي للمدرب والملعب)",
                }[field],
                field,
              )}
              <input
                aria-label={`Offer ${field}`}
                required={
                  field !== "startsAt" || ["COACH", "VENUE"].includes(newKind)
                }
                type={
                  ["price", "capacity"].includes(field)
                    ? "number"
                    : field === "startsAt"
                      ? "datetime-local"
                      : "text"
                }
                min={
                  field === "capacity" ? 1 : field === "price" ? 0 : undefined
                }
                max={
                  field === "capacity"
                    ? 10000
                    : field === "price"
                      ? 10000
                      : undefined
                }
                step={field === "price" ? "0.01" : undefined}
                maxLength={field === "description" ? 500 : 100}
                value={draft[field]}
                onChange={(e) =>
                  setDraft({ ...draft, [field]: e.target.value })
                }
                className="mt-1 block w-full rounded-xl border border-border bg-bg p-3"
              />
            </label>
          ))}
          <button className={`${btn} bg-lime text-black`} disabled={busy}>
            {text("حفظ المسودة", "Save draft")}
          </button>
        </form>
      )}
      <details className="rounded-xl border border-border p-4 text-sm">
        <summary className="cursor-pointer">
          {text("سجل تغييرات الطلبات", "Request change log")}
        </summary>
        <ul className="mt-3 space-y-2" dir="ltr">
          {view?.audit
            .slice(-15)
            .reverse()
            .map((a, i) => (
              <li key={i} className="break-all">
                {a.op} · {a.entityId} · {a.at}
              </li>
            ))}
        </ul>
      </details>
      {sandbox && (
        <footer className="text-sm text-muted">
          <button className="underline" onClick={() => setResetOpen(true)}>
            {text("إعادة ضبط التجربة", "Reset sandbox")}
          </button>
          {resetOpen && (
            <div className="mt-3 space-y-2">
              <p>
                {text(
                  "سيُمسح سجل خدمات التجربة في هذا المتصفح. هل تريد المتابعة؟",
                  "This clears the service sandbox history in this browser. Continue?",
                )}
              </p>
              <button
                className={btn}
                onClick={() => {
                  void reset();
                  setResetOpen(false);
                  setNotice("");
                }}
              >
                {text("مسح سجل التجربة", "Clear sandbox history")}
              </button>
              <button className={btn} onClick={() => setResetOpen(false)}>
                {text("احتفاظ بالسجل", "Keep history")}
              </button>
            </div>
          )}
        </footer>
      )}
    </main>
  );
}
