import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Activity,
  ArrowUpLeft,
  Check,
  ChevronLeft,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Plus,
  Search,
  ShieldCheck,
  Target,
  Users,
  X,
} from "lucide-react";
import {
  approveReport,
  athleteReports,
  parseStoredState,
  positions,
  sampleState,
  STORAGE_KEY,
  validateAthlete,
  validateReport,
} from "../../lib/academy/model";
import type {
  AcademyState,
  Athlete,
  Position,
  Report,
} from "../../lib/academy/model";
import "./academy.css";

type Tab = "overview" | "players" | "reports" | "athlete";
const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "players", label: "اللاعبون", icon: Users },
  { id: "reports", label: "مراجعة التقارير", icon: ClipboardCheck },
  { id: "athlete", label: "رحلة اللاعب", icon: Activity },
];
const previewId = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Array.from(crypto.getRandomValues(new Uint32Array(4)), (n) =>
        n.toString(16).padStart(8, "0"),
      ).join("");
const number = (n: number, digits = 0) =>
  n.toLocaleString("ar-SA", { maximumFractionDigits: digits });
const dateLabel = (s: string) =>
  new Intl.DateTimeFormat("ar-SA", {
    month: "short",
    day: "numeric",
    calendar: "gregory",
    timeZone: "UTC",
  }).format(new Date(s));

export function AcademyWorkspace({
  homeHref = "/sport-id",
}: {
  homeHref?: string;
}) {
  const [state, setState] = useState<AcademyState>(sampleState);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [selected, setSelected] = useState("demo-01");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"player" | "report" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [storageIssue, setStorageIssue] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = parseStoredState(raw);
        if (saved) {
          setState(saved);
          setSelected(saved.athletes[0]?.id ?? "");
        } else
          setStorageIssue(
            "تعذر قراءة البيانات المحفوظة؛ تُعرض نسخة تجريبية جديدة.",
          );
      }
    } catch {
      setStorageIssue(
        "الحفظ المحلي غير متاح في هذا المتصفح؛ ستعمل التجربة لهذه الزيارة.",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      setStorageIssue(
        "لم تُحفظ التغييرات محليًا. أبقِ الصفحة مفتوحة حتى تنتهي من التجربة.",
      );
    }
  }, [state, ready]);
  useEffect(() => {
    if (modal) {
      previousFocus.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
      previousFocus.current?.focus();
    }
  }, [modal]);
  const player = state.athletes.find((a) => a.id === selected);
  const drafts = state.reports.filter((r) => r.status === "draft");
  const approved = state.reports.filter((r) => r.status === "approved");
  const visiblePlayers = state.athletes.filter((a) =>
    (a.alias + " " + a.shirt).includes(query),
  );
  const history = athleteReports(state, selected);
  const latest = history.at(-1);
  const comparable =
    history.length >= 2 && history.at(-2)?.minutes === latest?.minutes;
  const delta =
    comparable && latest
      ? latest.distanceKm - history[history.length - 2].distanceKm
      : null;
  const currentReports =
    tab === "athlete"
      ? history.slice().reverse()
      : state.reports
          .filter((r) => r.athleteId === selected)
          .sort((a, b) => b.date.localeCompare(a.date));
  function open(type: "player" | "report") {
    setError("");
    setModal(type);
  }
  function addPlayer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const candidate = {
      alias: String(data.get("alias") || "").trim(),
      shirt: Number(data.get("shirt")),
      position: String(data.get("position")) as Position,
    };
    const problem = validateAthlete(candidate, state.athletes);
    if (problem) {
      setError(problem);
      return;
    }
    if (state.athletes.length >= 200) {
      setError("وصلت النسخة التجريبية إلى حد 200 لاعب.");
      return;
    }
    const athlete: Athlete = {
      ...candidate,
      id: previewId(),
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, athletes: [...s.athletes, athlete] }));
    setSelected(athlete.id);
    setModal(null);
    setTab("players");
    setNotice("أُضيف اللاعب التجريبي. يمكنك تسجيل جلسة له.");
  }
  function addReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const d = new FormData(event.currentTarget);
    const input = {
      athleteId: String(d.get("athleteId")),
      date: String(d.get("date")),
      minutes: Number(d.get("minutes")),
      distanceKm: Number(d.get("distanceKm")),
      maxSpeedKmh: Number(d.get("maxSpeedKmh")),
      sprints: Number(d.get("sprints")),
      coverage: Number(d.get("coverage")),
      note: String(d.get("note") || "").trim(),
    };
    const problem = validateReport(input, state.athletes);
    if (problem) {
      setError(problem);
      return;
    }
    if (state.reports.length >= 2000) {
      setError("وصلت النسخة التجريبية إلى حد 2000 تقرير.");
      return;
    }
    const report: Report = {
      ...input,
      id: previewId(),
      status: "draft",
      source: "manual",
    };
    setState((s) => ({ ...s, reports: [...s.reports, report] }));
    setSelected(input.athleteId);
    setModal(null);
    setTab("reports");
    setNotice("حُفظت الجلسة كمسودة؛ لن تظهر في رحلة اللاعب قبل الاعتماد.");
  }
  function approve(id: string) {
    try {
      setState(approveReport(state, id, new Date().toISOString()));
      setNotice("اعتُمد التقرير التجريبي وأصبح ظاهرًا في رحلة اللاعب.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "تعذر الاعتماد.");
    }
  }
  return (
    <div className="academy" dir="rtl" lang="ar">
      <aside className="ac-sidebar">
        <a
          className="ac-brand"
          href={homeHref}
          aria-label={
            homeHref === "/sport-id"
              ? "العودة إلى هوية سبورتكس"
              : "سبورتكس — بداية الصفحة"
          }
        >
          <span className="ac-brand-symbol">
            S<span>↗</span>
          </span>
          <span>
            SPORTIX<small>ACADEMY WORKSPACE</small>
          </span>
        </a>
        <div className="ac-org">
          <span className="ac-org-icon">
            <ShieldCheck size={22} />
          </span>
          <div>
            <strong>أكاديمية سبورتكس</strong>
            <small>مساحة عرض تجريبية</small>
          </div>
          <span className="ac-dot" />
        </div>
        <span className="ac-nav-label">مساحة العمل</span>
        <nav aria-label="التنقل في الأكاديمية">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => {
                setTab(id);
                setQuery("");
              }}
              aria-current={tab === id ? "page" : undefined}
            >
              <Icon size={19} />
              {label}
              {id === "reports" && drafts.length > 0 ? (
                <span className="ac-count">{number(drafts.length)}</span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="ac-sidebar-bottom">
          <div className="ac-mini-pitch">
            <span />
            <i />
          </div>
          <strong>من الدليل إلى التطور.</strong>
          <p>كل جلسة خطوة لفهم أداء اللاعب ودعم رحلته الرياضية.</p>
          <div className="ac-user">
            <span>م</span>
            <div>
              <strong>مساحة المدرب</strong>
              <small>تجربة الأدوار · دون حسابات فعلية</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="ac-main">
        <header className="ac-topbar">
          <div>
            <span className="ac-breadcrumb">سبورتكس / الأكاديمية</span>
            <span className="ac-top-title">مركز تطوير اللاعبين</span>
          </div>
          <div className="ac-top-meta">
            <span className="ac-preview-pill">نسخة تجريبية</span>
            <span className="ac-avatar">S</span>
          </div>
        </header>
        <main>
          <div className="ac-demo-banner">
            <ShieldCheck size={18} />
            <p>
              <strong>بيانات اصطناعية للتجربة.</strong> لا تدخل أسماء أو بيانات
              حقيقية. الحفظ على هذا المتصفح فقط، وتبديل العرض لا يمثل صلاحيات
              دخول.
            </p>
          </div>
          {storageIssue ? (
            <p className="ac-warning" role="alert">
              {storageIssue}
            </p>
          ) : null}
          <div className="ac-page-heading">
            <div>
              <p className="ac-eyebrow">SPORTIX PERFORMANCE</p>
              <h1>
                {tab === "overview"
                  ? "كل لاعب، رحلة تستحق التطوير."
                  : tabs.find((t) => t.id === tab)?.label}
              </h1>
              <p>
                {tab === "athlete"
                  ? "التقارير المعتمدة فقط، في مسار تطور واضح."
                  : "أدر اللاعبين، راجع الأدلة، واجعل تطورهم قابلًا للمتابعة."}
              </p>
            </div>
            <button
              className="ac-primary"
              onClick={() => open(tab === "reports" ? "report" : "player")}
            >
              <Plus size={18} />
              {tab === "reports" ? "تسجيل جلسة" : "إضافة لاعب"}
            </button>
          </div>
          {notice ? (
            <div className="ac-notice" role="status">
              <Check size={18} />
              <span>{notice}</span>
              <button aria-label="إغلاق التنبيه" onClick={() => setNotice("")}>
                <X size={16} />
              </button>
            </div>
          ) : null}
          {tab === "overview" ? (
            <>
              <section className="ac-stats" aria-label="إحصاءات مساحة العرض">
                <Stat
                  label="لاعبون في الأكاديمية"
                  value={number(state.athletes.length)}
                  detail="ملفات تجريبية"
                  icon={Users}
                />
                <Stat
                  label="بانتظار المراجعة"
                  value={number(drafts.length)}
                  detail="قبل إتاحتها للاعب"
                  icon={ClipboardCheck}
                />
                <Stat
                  label="تقارير معتمدة"
                  value={number(approved.length)}
                  detail="متاحة في رحلة اللاعب"
                  icon={FileText}
                />
                <Stat
                  label="مصادر قياس متصلة"
                  value="٠"
                  detail="لا توجد كاميرات أو أجهزة مربوطة"
                  icon={Target}
                />
              </section>
              <section className="ac-overview-grid">
                <div className="ac-card ac-focus">
                  <div className="ac-section-head">
                    <div>
                      <p className="ac-eyebrow">الخطوة التالية</p>
                      <h2>الأداء يبدأ بمراجعة موثوقة.</h2>
                    </div>
                    <span className="ac-icon-box">
                      <ClipboardCheck />
                    </span>
                  </div>
                  <p>
                    راجع مصدر كل جلسة وتغطية القياس، ثم اعتمد التقرير ليظهر في
                    ملف اللاعب.
                  </p>
                  <div className="ac-workflow">
                    <span>
                      <i>١</i>أضف لاعبًا
                    </span>
                    <ChevronLeft size={16} />
                    <span>
                      <i>٢</i>سجّل جلسة
                    </span>
                    <ChevronLeft size={16} />
                    <span>
                      <i>٣</i>راجع واعتمد
                    </span>
                  </div>
                  <button
                    className="ac-primary"
                    onClick={() => setTab("reports")}
                  >
                    مراجعة التقارير <ArrowUpLeft size={17} />
                  </button>
                  <div className="ac-focus-lines" aria-hidden="true" />
                </div>
                <div className="ac-card ac-readiness">
                  <div className="ac-section-head">
                    <h2>جاهزية التجربة</h2>
                    <span className="ac-live-label">مرحلة أولى</span>
                  </div>
                  <Readiness
                    title="هوية اللاعب وقائمة الأكاديمية"
                    detail="إضافة ملف تجريبي ومركز ورقم قميص"
                    done
                  />
                  <Readiness
                    title="مراجعة التقرير ورحلة التطور"
                    detail="مسودة ← اعتماد ← عرض للاعب"
                    done
                  />
                  <Readiness
                    title="ربط بيانات الملعب"
                    detail="بانتظار خدمة القياس والتحقق الميداني"
                  />
                  <Readiness
                    title="حسابات وصلاحيات إنتاجية"
                    detail="بانتظار ربط الهوية والتخزين الخادمي"
                  />
                </div>
              </section>
            </>
          ) : null}
          {tab === "overview" || tab === "players" ? (
            <section className="ac-card">
              <div className="ac-section-head">
                <div>
                  <h2>
                    لاعبو الأكاديمية{" "}
                    <span className="ac-heading-count">
                      {number(state.athletes.length)}
                    </span>
                  </h2>
                  <p>اختر لاعبًا للاطلاع على جلساته ومتابعة تطوره.</p>
                </div>
                <label className="ac-search">
                  <Search size={17} />
                  <input
                    aria-label="البحث عن لاعب"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث بالاسم أو رقم القميص"
                  />
                </label>
              </div>
              <div className="ac-player-table">
                <div className="ac-table-head">
                  <span>اللاعب</span>
                  <span>المركز</span>
                  <span>الجلسات</span>
                  <span>حالة التقرير الأخير</span>
                  <span />
                </div>
                {visiblePlayers.map((a) => {
                  const reports = state.reports
                    .filter((r) => r.athleteId === a.id)
                    .sort((x, y) => y.date.localeCompare(x.date));
                  return (
                    <button
                      className="ac-player-row"
                      key={a.id}
                      onClick={() => {
                        setSelected(a.id);
                        setTab("reports");
                      }}
                    >
                      <span className="ac-player-name">
                        <span className="ac-shirt">{number(a.shirt)}</span>
                        <span>
                          <strong>{a.alias}</strong>
                          <small>SPORT ID · تجريبي</small>
                        </span>
                      </span>
                      <span className="ac-position">{a.position}</span>
                      <span>
                        {number(reports.length)} <small>جلسات</small>
                      </span>
                      <span>
                        <Badge report={reports[0]} />
                      </span>
                      <ArrowUpLeft size={19} />
                    </button>
                  );
                })}
                {!visiblePlayers.length ? (
                  <div className="ac-empty">
                    لا توجد نتائج مطابقة. جرّب اسمًا آخر أو أضف لاعبًا.
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
          {tab === "reports" || tab === "athlete" ? (
            <>
              <div className="ac-player-toolbar">
                <label>
                  ملف اللاعب
                  <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    {state.athletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.alias} · {a.shirt}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="ac-secondary"
                  onClick={() =>
                    tab === "athlete" ? setTab("reports") : setTab("athlete")
                  }
                >
                  {tab === "athlete" ? "العودة للمراجعة" : "عرض رحلة اللاعب"}{" "}
                  <ArrowUpLeft size={16} />
                </button>
              </div>
              {player ? (
                <div className="ac-profile-strip">
                  <span className="ac-shirt large">{number(player.shirt)}</span>
                  <div>
                    <p className="ac-eyebrow">SPORT ID · DEMO</p>
                    <h2>{player.alias}</h2>
                    <p>{player.position} · كرة القدم</p>
                  </div>
                  <span className="ac-profile-note">
                    {tab === "athlete"
                      ? "عرض اللاعب التجريبي"
                      : "عرض المدرب التجريبي"}
                  </span>
                </div>
              ) : null}
              {tab === "athlete" ? (
                <section className="ac-card ac-growth">
                  <div className="ac-section-head">
                    <div>
                      <h2>مسار التطور</h2>
                      <p>
                        المسافة في الجلسات المعتمدة — كيلومتر. راعِ اختلاف دقائق
                        اللعب.
                      </p>
                    </div>
                    {delta !== null ? (
                      <span className="ac-trend">
                        {delta >= 0 ? "+" : ""}
                        {number(delta, 1)} كم عن الجلسة السابقة
                      </span>
                    ) : null}
                  </div>
                  {history.length ? (
                    <>
                      <div className="ac-chart">
                        {history.map((r) => (
                          <div key={r.id} className="ac-chart-column">
                            <span>{number(r.distanceKm, 1)} كم</span>
                            <div
                              style={{
                                height: `${Math.max(4, (r.distanceKm / Math.max(...history.map((x) => x.distanceKm), 1)) * 125)}px`,
                              }}
                            />
                            <small>
                              {dateLabel(r.date)}
                              <br />
                              {number(r.minutes)} دقيقة
                            </small>
                          </div>
                        ))}
                      </div>
                      <p className="ac-caption">
                        قيم تجريبية أو مدخلة يدويًا؛ ارتفاع المسافة وحده لا يثبت
                        تحسن الأداء.
                      </p>
                    </>
                  ) : (
                    <div className="ac-empty">
                      لا توجد تقارير معتمدة بعد. تظهر الجلسة هنا بعد مراجعتها
                      واعتمادها.
                    </div>
                  )}
                </section>
              ) : null}
              <div className="ac-section-head ac-reports-heading">
                <div>
                  <h2>
                    {tab === "athlete"
                      ? "سجل الجلسات المعتمدة"
                      : "تقارير اللاعب"}
                  </h2>
                  <p>
                    {tab === "athlete"
                      ? "الدليل وملاحظة المدرب في مكان واحد."
                      : "تحقق من المصدر والقيم قبل الاعتماد."}
                  </p>
                </div>
                {tab === "reports" ? (
                  <button
                    className="ac-secondary"
                    onClick={() => open("report")}
                  >
                    <Plus size={16} />
                    تسجيل جلسة
                  </button>
                ) : null}
              </div>
              <div className="ac-report-list">
                {currentReports.map((r) => (
                  <article key={r.id} className="ac-card ac-report">
                    <div className="ac-section-head">
                      <div className="ac-report-date">
                        <span className="ac-icon-box">
                          <Activity size={20} />
                        </span>
                        <div>
                          <h3>جلسة {dateLabel(r.date)}</h3>
                          <p>
                            {number(r.minutes)} دقيقة ·{" "}
                            {r.source === "sample"
                              ? "مثال اصطناعي"
                              : "إدخال يدوي تجريبي"}{" "}
                            · دون تحليل آلي
                          </p>
                        </div>
                      </div>
                      <Badge report={r} />
                    </div>
                    <div className="ac-report-metrics">
                      <Metric
                        label="المسافة"
                        value={number(r.distanceKm, 1)}
                        unit="كم"
                      />
                      <Metric
                        label="أقصى سرعة"
                        value={number(r.maxSpeedKmh, 1)}
                        unit="كم/س"
                      />
                      <Metric
                        label="مرات الجري السريع"
                        value={number(r.sprints)}
                        unit="إدخال يدوي"
                      />
                      <Metric
                        label="تغطية القياس"
                        value={number(r.coverage)}
                        unit="٪"
                      />
                    </div>
                    <div className="ac-report-note">
                      <strong>ملاحظة المدرب</strong>
                      <p>{r.note || "لا توجد ملاحظة مسجلة."}</p>
                    </div>
                    <div className="ac-report-footer">
                      <p>
                        {r.coverage < 95
                          ? "تغطية غير كافية: يلزم تصحيح مصدر القياس قبل الاعتماد."
                          : "مصدر تجريبي؛ لا توجد لقطات فيديو أو قياسات موثقة مرتبطة."}
                      </p>
                      {tab === "reports" && r.status === "draft" ? (
                        <button
                          className="ac-primary"
                          disabled={r.coverage < 95}
                          onClick={() => approve(r.id)}
                        >
                          <Check size={16} />
                          اعتماد التقرير التجريبي
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))}
                {!currentReports.length ? (
                  <div className="ac-card ac-empty">
                    <FileText size={32} />
                    <h3>رحلة جديدة، دون جلسات بعد.</h3>
                    <p>
                      {tab === "athlete"
                        ? "لم يُعتمد أي تقرير لهذا اللاعب."
                        : "سجّل أول جلسة تجريبية لهذا اللاعب لتبدأ المراجعة."}
                    </p>
                    {tab === "reports" ? (
                      <button
                        className="ac-primary"
                        onClick={() => open("report")}
                      >
                        تسجيل أول جلسة
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
          <footer className="ac-footer">
            <span>
              SPORTIX <b>AI SYSTEMS</b>
            </span>
            <p>تجربة أولية · لا تحليل نفسي ولا قرارات ترشيح آلية</p>
            <span>بُنيت لتطوير رحلة الرياضي ↗</span>
          </footer>
        </main>
      </div>
      <dialog
        className="ac-dialog"
        ref={dialog}
        onCancel={() => setModal(null)}
        onClose={() => setModal(null)}
        aria-labelledby="ac-dialog-title"
      >
        <div className="ac-dialog-heading">
          <div>
            <p className="ac-eyebrow">مساحة تجريبية</p>
            <h2 id="ac-dialog-title">
              {modal === "player" ? "إضافة لاعب تجريبي" : "تسجيل جلسة تجريبية"}
            </h2>
          </div>
          <button
            className="ac-close"
            aria-label="إغلاق النافذة"
            onClick={() => setModal(null)}
          >
            <X />
          </button>
        </div>
        <p className="ac-dialog-help">
          استخدم بيانات خيالية فقط. تُحفظ على هذا المتصفح، ولا تُرسل إلى خدمة
          تحليل أو قاعدة بيانات.
        </p>
        {modal === "player" ? (
          <form onSubmit={addPlayer}>
            <label>
              الاسم التجريبي
              <input
                autoFocus
                name="alias"
                required
                maxLength={40}
                placeholder="مثال: لاعب تجريبي 04"
              />
            </label>
            <div className="ac-form-grid">
              <label>
                رقم القميص
                <input name="shirt" type="number" min={1} max={99} required />
              </label>
              <label>
                المركز
                <select name="position">
                  {positions.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
            </div>
            {error ? (
              <p role="alert" className="ac-warning">
                {error}
              </p>
            ) : null}
            <button className="ac-primary ac-submit" type="submit">
              إضافة اللاعب <Plus size={17} />
            </button>
          </form>
        ) : null}
        {modal === "report" ? (
          <form onSubmit={addReport}>
            <label>
              اللاعب
              <select
                autoFocus
                name="athleteId"
                defaultValue={selected}
                required
              >
                {state.athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.alias}
                  </option>
                ))}
              </select>
            </label>
            <div className="ac-form-grid">
              <label>
                تاريخ الجلسة
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </label>
              <label>
                دقائق اللعب
                <input
                  name="minutes"
                  type="number"
                  min={1}
                  max={150}
                  required
                  defaultValue={60}
                />
              </label>
              <label>
                المسافة — كم
                <input
                  name="distanceKm"
                  type="number"
                  min={0}
                  max={30}
                  step="0.01"
                  required
                />
              </label>
              <label>
                أقصى سرعة — كم/س
                <input
                  name="maxSpeedKmh"
                  type="number"
                  min={0}
                  max={50}
                  step="0.1"
                  required
                />
              </label>
              <label>
                مرات الجري السريع
                <input
                  name="sprints"
                  type="number"
                  min={0}
                  max={200}
                  required
                />
              </label>
              <label>
                تغطية القياس — ٪
                <input
                  name="coverage"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  required
                />
              </label>
            </div>
            <label>
              ملاحظة المدرب
              <textarea
                name="note"
                maxLength={1000}
                rows={3}
                placeholder="ملاحظة مرتبطة بالأداء، دون استنتاجات نفسية."
              />
            </label>
            {error ? (
              <p role="alert" className="ac-warning">
                {error}
              </p>
            ) : null}
            <button className="ac-primary ac-submit" type="submit">
              حفظ كمسودة <FileText size={17} />
            </button>
          </form>
        ) : null}
      </dialog>
    </div>
  );
}
function Stat({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <article className="ac-card ac-stat">
      <div>
        <span>{label}</span>
        <Icon size={20} />
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}
function Readiness({
  title,
  detail,
  done = false,
}: {
  title: string;
  detail: string;
  done?: boolean;
}) {
  return (
    <div className="ac-readiness-row">
      <span className={done ? "done" : ""}>
        {done ? <Check size={14} /> : <span />}
      </span>
      <div>
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}
function Badge({ report }: { report?: Report }) {
  return (
    <span
      className={`ac-badge ${report?.status === "approved" ? "approved" : report ? "draft" : "empty"}`}
    >
      {report?.status === "approved"
        ? "معتمد تجريبيًا"
        : report
          ? "قيد المراجعة"
          : "دون جلسات"}
    </span>
  );
}
function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div>
      <span>{label}</span>
      <strong>
        {value} <small>{unit}</small>
      </strong>
    </div>
  );
}
