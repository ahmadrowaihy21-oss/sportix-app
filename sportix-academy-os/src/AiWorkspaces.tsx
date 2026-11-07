import { useEffect, useState } from 'react';
import { api } from './netlifyClient';
import { AlertTriangle, ArrowLeft, BookOpenCheck, CheckCircle2, ClipboardList, Copy, FileText, LockKeyhole, RefreshCw, ShieldCheck, Sparkles, TrendingUp, WandSparkles } from 'lucide-react';

type RecordItem = { id: string; [field: string]: unknown };
type ReportType = 'training_advisor' | 'player_development';
type AiResult = {
  id?: string;
  type: ReportType;
  text: string;
  createdAt?: string;
  evidenceCount: number;
  scope?: string;
  demo?: boolean;
};

interface Props {
  mode: 'advisor' | 'development';
  demo: boolean;
  players: RecordItem[];
  sessions: RecordItem[];
  quality: RecordItem[];
  evaluations: RecordItem[];
  plans: RecordItem[];
  exposures: RecordItem[];
  onLogin: () => void;
  openPage: (page: 'quality' | 'sessions' | 'development' | 'reports') => void;
  initialPlayerId?: string;
}

function dateLabel(date?: string) {
  if (!date) return '';
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('ar-SA', { dateStyle: 'medium' });
}

function demoAdvisor(props: Props) {
  const completed = props.sessions.filter(s => s.status === 'completed').length;
  return `معاينة تعليمية — ليست نتيجة من نموذج ذكاء اصطناعي.\n\nالمدخلات: ${props.sessions.length} حصة، منها ${completed} منفذة، و${props.quality.length} مراجعة جودة بشرية.\n\nما يجب مراجعته:\n• اربط هدف الحصة بمواقف وقرارات قابلة للملاحظة.\n• تأكد من تسجيل الدقائق الفعلية وفرص الممارسة بدل الاكتفاء بمدة الحصة المخططة.\n• قارن مراجعة الجودة بالتنفيذ، وسجّل قرار المدير الفني للحصة التالية.\n\nنقص الأدلة: لا يمكن إثبات تحسّن اللاعب أو سبب تفاوت جودة التدريب من عدد الحصص وحده.\n\nلتشغيل تحليل الذكاء الاصطناعي على سجلات أكاديميتك، سجل الدخول.`;
}

function demoPlayer(props: Props, id: string) {
  const evaluations = props.evaluations.filter(e => e.playerId === id);
  const plans = props.plans.filter(e => e.playerId === id);
  const doses = props.exposures.filter(e => e.playerId === id);
  return `معاينة تعليمية — لا تستخدم نموذج ذكاء اصطناعي.\n\nملف اللاعب المختار يحتوي ${evaluations.length} تقييمات بشرية، و${plans.length} خطط تطوير، و${doses.length} ملاحظات جرعة تدريب.\n\nملخص للتدريب: استعرض المجالات التي لديها تقييمات فعلية، وحدد معيارًا موحدًا لاختبار المهارة مجددًا.\n\nخطوة تالية: يراجع المدرب هدفًا واحدًا قابلًا للقياس، ويختبر انتقال المهارة إلى موقف لعب.\n\nقيود: لا يمكن إثبات ارتفاع المستوى دون قياسات متكررة في سياق قابل للمقارنة؛ لا يوجد تحليل نفسي أو طبي أو رؤية حاسوبية هنا.\n\nسجل الدخول لإصدار تقرير AI مرتبط بالسجلات الفعلية.`;
}

export default function AiWorkspaces(props: Props) {
  const isAdvisor = props.mode === 'advisor';
  const [playerId, setPlayerId] = useState(props.initialPlayerId || props.players[0]?.id || '');
  const [cohort, setCohort] = useState('الكل');
  const [includeNotes, setIncludeNotes] = useState(false);
  const [history, setHistory] = useState<AiResult[]>([]);
  const [result, setResult] = useState<AiResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const type: ReportType = isAdvisor ? 'training_advisor' : 'player_development';

  useEffect(() => {
    if (!props.players.some(p => p.id === playerId)) setPlayerId(props.players[0]?.id || '');
  }, [props.players, playerId]);

  useEffect(() => {
    if (props.demo) return;
    let active = true;
    setHistoryLoading(true);
    api.get('/api/academy/v2/ai/history')
      .then(r => { if (active) setHistory((r.data?.items || []) as AiResult[]); })
      .catch(() => { if (active) setError('تعذر تحميل التقارير السابقة. جرّب تحديث الصفحة.'); })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [props.demo]);

  async function generate() {
    setError('');
    setFeedback('');
    if (props.demo) {
      setResult({ type, text: isAdvisor ? demoAdvisor(props) : demoPlayer(props, playerId), evidenceCount: 0, demo: true });
      return;
    }
    if (!isAdvisor && !playerId) { setError('اختر لاعبًا قبل إصدار التقرير.'); return; }
    setBusy(true);
    try {
      const url = isAdvisor ? '/api/academy/v2/ai/training-advisor' : '/api/academy/v2/ai/player-report';
      const payload = isAdvisor ? { cohort } : { playerId, includeNotes };
      const response = await api.post(url, payload);
      const item = response.data as AiResult;
      setResult(item);
      setHistory(previous => [item, ...previous].slice(0, 20));
    } catch (e) {
      const err = e as { response?: { data?: { message?: string; error?: string } }; message?: string };
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'تعذر إصدار التقرير. تأكد من وجود بيانات كافية وحاول مجددًا.');
    } finally {
      setBusy(false);
    }
  }

  function copyReport() {
    if (!result) return;
    navigator.clipboard.writeText(result.text)
      .then(() => setFeedback('تم نسخ التقرير.'))
      .catch(() => setFeedback('تعذر النسخ تلقائيًا؛ يمكنك تحديد نص التقرير ونسخه.'));
  }

  const matchingHistory = history.filter(item => item.type === type);
  const selectedPlayer = props.players.find(p => p.id === playerId);
  const count = isAdvisor
    ? props.quality.length + props.sessions.length + props.exposures.length
    : props.evaluations.filter(x => x.playerId === playerId).length + props.plans.filter(x => x.playerId === playerId).length + props.exposures.filter(x => x.playerId === playerId).length;

  return (
    <div className="ai-workspace">
      <div className="ai-hero">
        <div>
          <div className="ai-eyebrow"><WandSparkles size={17}/> SPORTIX AI · FOOTBALL INTELLIGENCE</div>
          <h1>{isAdvisor ? 'مستشار جودة التدريب' : 'تقرير تطور اللاعب الذكي'}</h1>
          <p>{isAdvisor
            ? 'يقرأ تغطية الحصص ودرجات جودة التدريب وملاحظات الجرعة التدريبية ليقترح ما يستحق مراجعة المدير الفني أولًا.'
            : 'يلخص التقييمات البشرية وخطط التطوير وملاحظات الجرعة التدريبية للاعب مع توضيح الأدلة المتوفرة والناقصة.'}</p>
          <div className="ai-tagline"><ShieldCheck size={16}/> القرار النهائي للمدرب · لا قياسات مختلقة · لا تشخيص</div>
        </div>
        <div className="ai-symbol"><Sparkles size={48}/><span>SPORTIX AI</span></div>
      </div>

      <div className="ai-columns">
        <section className="ai-panel">
          <div className="ai-panel-head"><div className="ai-panel-icon"><ClipboardList size={20}/></div><div><h2>إعداد التحليل</h2><p>يتم توليد النتيجة عند الطلب، بعد مراجعة صلاحية البيانات.</p></div></div>
          {isAdvisor ? (
            <label className="ai-field">الفئة العمرية
              <select value={cohort} onChange={e => setCohort(e.target.value)}>
                {['الكل','تحت 9','تحت 11','تحت 13','تحت 15','تحت 17','تحت 19','الفريق الأول'].map(x => <option key={x}>{x}</option>)}
              </select>
            </label>
          ) : (
            <>
              <label className="ai-field">اللاعب
                <select value={playerId} onChange={e => {setPlayerId(e.target.value);setResult(null);}}>
                  {props.players.map(p => <option key={p.id} value={p.id}>{String(p.name || p.id)}</option>)}
                </select>
              </label>
              <label className="ai-check">
                <input type="checkbox" checked={includeNotes} onChange={e => setIncludeNotes(e.target.checked)}/>
                <span><b>إدراج الملاحظات الفنية المكتوبة</b><small>اختياري. يُرجى عدم استخدامه مع بيانات قاصرين حقيقية قبل توفير التفويض وحماية البيانات اللازمة.</small></span>
              </label>
            </>
          )}
          <div className="ai-availability"><BookOpenCheck size={18}/><span>{count} سجلًا متاحًا للفحص في مساحة العمل الحالية</span></div>
          {props.demo && <div className="ai-notice"><AlertTriangle size={18}/><span>وضع تجريبي: زر المعاينة يعرض شرحًا توضيحيًا ثابتًا، ولا يشغّل نموذج AI أو يحفظ تقريرًا على الخادم.</span></div>}
          {!props.demo && <div className="ai-notice"><LockKeyhole size={18}/><span>التحليل الفعلي يتم على الخادم، من سجلات حسابك فقط. لا تُرسل أسماء اللاعبين أو مقاطع الفيديو. استبعد بيانات الصحة والأطفال الحساسة.</span></div>}
          <div className="ai-actions">
            <button type="button" disabled={busy || (!isAdvisor && !selectedPlayer)} onClick={generate} className="ai-primary">
              {busy ? <RefreshCw size={18} className="ai-spin"/> : <Sparkles size={18}/>} {busy ? 'جارٍ تحليل السجلات...' : props.demo ? 'عرض المعاينة التوضيحية' : isAdvisor ? 'حلّل جودة التدريب' : 'أنشئ تقرير التطور'}
            </button>
            {props.demo && <button className="ai-secondary" type="button" onClick={props.onLogin}>تسجيل الدخول للتحليل الفعلي <ArrowLeft size={16}/></button>}
          </div>
          {error && <div className="ai-error" role="alert"><AlertTriangle size={17}/>{error}</div>}
        </section>

        <section className="ai-panel ai-context">
          <div className="ai-panel-head"><div className="ai-panel-icon"><TrendingUp size={20}/></div><div><h2>البيانات التي يعتمد عليها</h2><p>مخرجات مرتبطة بسجلات حقيقية، وليس تقديرًا من شكل الواجهة.</p></div></div>
          {isAdvisor ? <div className="ai-metrics">
            <div><strong>{props.sessions.filter(s => cohort === 'الكل' || s.cohort === cohort).length}</strong><span>جلسة تدريب</span></div>
            <div><strong>{props.quality.length}</strong><span>مراجعة جودة</span></div>
            <div><strong>{props.exposures.length}</strong><span>ملاحظة تدريب</span></div>
          </div> : <div className="ai-metrics">
            <div><strong>{props.evaluations.filter(e => e.playerId === playerId).length}</strong><span>تقييم بشرى</span></div>
            <div><strong>{props.plans.filter(p => p.playerId === playerId).length}</strong><span>خطة تطوير</span></div>
            <div><strong>{props.exposures.filter(e => e.playerId === playerId).length}</strong><span>ملاحظة تدريب</span></div>
          </div>}
          <div className="ai-guidance">
            <h3>سير العمل بعد التقرير</h3>
            <div><span>01</span><p>قراءة الأدلة ونقاط الضعف والبيانات المفقودة.</p></div>
            <div><span>02</span><p>مراجعة المدير الفني أو مدرب اللاعب للتوصيات.</p></div>
            <div><span>03</span><p>تحويل التوصيات إلى هدف أو تمرين ثم إعادة القياس.</p></div>
          </div>
          <button className="ai-navigation" onClick={() => props.openPage(isAdvisor ? 'quality' : 'development')}>
            {isAdvisor ? 'الانتقال إلى مراجعة جودة الحصص' : 'الانتقال إلى خطط تطوير اللاعبين'} <ArrowLeft size={17}/>
          </button>
        </section>
      </div>

      {result ? <section className="ai-panel ai-result">
        <div className="ai-result-head"><div><div className="ai-eyebrow"><CheckCircle2 size={16}/> {result.demo ? 'DEMO PREVIEW' : 'AI · DRAFT FOR HUMAN REVIEW'}</div><h2>{isAdvisor ? 'تقرير مستشار التدريب' : `تقرير تطوير ${result.demo ? String(selectedPlayer?.name || 'اللاعب') : 'اللاعب المختار'}`}</h2><small>{result.demo ? 'مادة توضيحية غير مولدة بالذكاء الاصطناعي' : `${dateLabel(result.createdAt)} · أدلة مرجعية ${result.evidenceCount || 0}`}</small></div>
        <button type="button" onClick={copyReport} className="ai-secondary"><Copy size={16}/> نسخ التقرير</button></div>
        <div className="ai-document" dir="rtl">{result.text.replace(/\\n/g, '\n')}</div>
        <div className="ai-report-warning"><AlertTriangle size={18}/> التقرير مسودة مساعدة للمدرب؛ لا اعتماد تلقائي، ولا استنتاج للحالة النفسية أو الطبية أو أي نتيجة رؤية حاسوبية.</div>
        {feedback && <p className="ai-feedback" role="status">{feedback}</p>}
      </section> : <section className="ai-empty"><FileText size={31}/><h3>ستظهر خلاصة التحليل هنا</h3><p>{props.demo ? 'اضغط عرض المعاينة لفهم شكل المخرجات المقترحة.' : 'حدد نطاق التحليل واضغط على زر إصدار التقرير. لن تُنشأ نتيجة إذا كانت الأدلة غير كافية.'}</p></section>}

      {!props.demo && <section className="ai-panel ai-history"><div className="ai-panel-head"><div className="ai-panel-icon"><FileText size={20}/></div><div><h2>سجل التقارير السابقة</h2><p>نسخ مرتبطة بحساب الأكاديمية لأغراض المراجعة.</p></div></div>
        {historyLoading ? <p>جارٍ تحميل السجل...</p> : matchingHistory.length ? <div className="ai-history-list">{matchingHistory.map((entry, index) => <button key={entry.id || index} onClick={() => {setResult(entry);setFeedback('');}}><span>{isAdvisor ? 'مراجعة جودة التدريب' : 'تقرير تطور لاعب'}</span><small>{dateLabel(entry.createdAt)} · {entry.evidenceCount || 0} أدلة</small><ArrowLeft size={17}/></button>)}</div> : <p className="ai-history-empty">لا توجد تقارير AI محفوظة بعد.</p>}
      </section>}
    </div>
  );
}
