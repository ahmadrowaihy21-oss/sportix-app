import { useEffect, useState, type ReactNode } from 'react';
import {
  Activity, ArrowLeft, BarChart3, BookOpen, CalendarDays, Check,
  CheckCircle2, ChevronDown, ChevronLeft, CircleAlert, ClipboardCheck, Clock3,
  CloudUpload, Download, Eye, FileBarChart2, FileVideo2, Flag, GraduationCap,
  Home, Layers3, ListChecks, LogIn, LogOut, Menu,
  Pencil, Play, Plus, Search, Settings, ShieldCheck,
  Sparkles, Target, Trash2, TrendingUp, Trophy, UserRound, UserRoundCheck,
  UserRoundPlus, Users, Video, X, Zap, type LucideIcon
} from 'lucide-react';
import { api, auth } from './netlifyClient';
import AiWorkspaces from './AiWorkspaces';
import './academy-ai.css';

type Entry = { id: string; [key: string]: any };
type Kind = 'players' | 'coaches' | 'curricula' | 'drills' | 'sessions' | 'attendance' | 'exposures' | 'quality' | 'evaluations' | 'plans' | 'nominations' | 'evidence';
type Page = 'dashboard' | 'workflow' | 'curricula' | 'drills' | 'planner' | 'sessions' | 'quality' | 'players' | 'exposure' | 'development' | 'coaches' | 'talent' | 'evidence' | 'reports' | 'governance' | 'aiAdvisor' | 'aiDevelopment';
type Academy = { name: string; city: string; sport: string };
type Store = { academy: Academy; activity: Entry[] } & Record<Kind, Entry[]>;
type FormState = { kind: Kind; id?: string; values: Record<string, any> };
type Field = { key: string; label: string; type?: 'text' | 'date' | 'number' | 'textarea' | 'select' | 'checkbox' | 'multi'; options?: string[] | {value:string;label:string}[]; required?: boolean; wide?: boolean; placeholder?: string; min?: number; max?: number; hint?: string };

const domains = ['الفني','البدني','التكتيكي','القرارات','الأداء الذهني المرصود','علم النفس الرياضي','الميكانيكا الحيوية','السلوك والقيادة','الأحمال والجاهزية','ثبات الأداء','التطور طويل المدى','ملاءمة الدور'];
const cohorts = ['تحت 9','تحت 11','تحت 13','تحت 15','تحت 17','تحت 19','الفريق الأول'];
const positions = ['حارس مرمى','قلب دفاع','ظهير','محور','وسط','جناح','صانع ألعاب','مهاجم'];
const phases = ['تهيئة مهارية','تحدي واتخاذ قرار','تطبيق في اللعب'];
const focuses = ['استلام وتمرير','التمركز','الضغط والتحولات','الإنهاء','الاستحواذ','1 ضد 1','التحرك بدون كرة','الدفاع','حارس المرمى'];
const datestr = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const stamp = () => new Date().toISOString();
const maybeDate = (v: any) => {if (!v) return 'غير محدد';const d = new Date(`${String(v).slice(0,10)}T12:00:00`);return Number.isNaN(d.getTime())?'—':d.toLocaleDateString('ar-SA',{day:'numeric',month:'short',year:'numeric'});};
const scoreQuality = (r: Entry) => ['objectives','realism','opportunities','feedback','reflection'].every(k=>r[k]!==undefined) ? Math.round((Number(r.objectives)*30+Number(r.realism)*25+Number(r.opportunities)*20+Number(r.feedback)*15+Number(r.reflection)*10)/5) : null;
const avatar = (name: string) => (name||'لاعب').split(/\s+/).slice(0,2).map(s=>s[0]).join('');
const keys: Kind[] = ['players','coaches','curricula','drills','sessions','attendance','exposures','quality','evaluations','plans','nominations','evidence'];
const demoKey = 'sportix_academy_workflow_v2_demo';

const nav: { group: string; items: { id:Page;label:string;icon:LucideIcon;code:string }[] }[] = [
  {group:'المركز الرئيسي',items:[{id:'dashboard',label:'لوحة الأكاديمية',icon:Home,code:'01'},{id:'workflow',label:'سير العمل',icon:Layers3,code:'02'}]},
  {group:'التخطيط والتشغيل',items:[{id:'curricula',label:'المناهج التدريبية',icon:BookOpen,code:'03'},{id:'drills',label:'مكتبة التمارين',icon:Flag,code:'04'},{id:'planner',label:'خطة الأسبوع',icon:CalendarDays,code:'05'},{id:'sessions',label:'تنفيذ الحصص والحضور',icon:ClipboardCheck,code:'06'}]},
  {group:'الجودة والتطوير',items:[{id:'quality',label:'قياس جودة التدريب',icon:BarChart3,code:'07'},{id:'players',label:'اللاعبون و SPORT ID',icon:Users,code:'08'},{id:'exposure',label:'جرعة التدريب',icon:Activity,code:'09'},{id:'development',label:'التقييم وخطط التطور',icon:TrendingUp,code:'10'},{id:'coaches',label:'المدربون والجهاز الفني',icon:GraduationCap,code:'11'},{id:'aiAdvisor',label:'SPORTIX AI مستشار التدريب',icon:Sparkles,code:'AI'},{id:'aiDevelopment',label:'SPORTIX AI تقرير اللاعب',icon:TrendingUp,code:'AI'}]},
  {group:'المخرجات والحوكمة',items:[{id:'talent',label:'المواهب والفرص',icon:Trophy,code:'12'},{id:'evidence',label:'الفيديو والأدلة',icon:Video,code:'13'},{id:'reports',label:'التقارير والمؤشرات',icon:FileBarChart2,code:'14'},{id:'governance',label:'الحوكمة والإعدادات',icon:ShieldCheck,code:'15'}]}
];
const navItems=nav.flatMap(x=>x.items);
const workflow: {page: Page;title:string;desc:string;deliverable:string;number:string}[] = [
  {number:'01',page:'curricula',title:'اعتماد المنهج',desc:'الأهداف بحسب الفئات العمرية والموسم',deliverable:'منهج موحّد'},
  {number:'02',page:'planner',title:'تخطيط الأسبوع',desc:'ربط الحصص بالمنهج والمدرب والتمارين',deliverable:'خطة حصص'},
  {number:'03',page:'sessions',title:'تنفيذ التدريب',desc:'تسجيل الحضور ومحتوى الحصة الفعلي',deliverable:'سجل حضور'},
  {number:'04',page:'exposure',title:'قياس جرعة التدريب',desc:'الدقائق والمحاولات والقرارات من ملاحظة بشرية',deliverable:'حجم ممارسة'},
  {number:'05',page:'quality',title:'مراجعة جودة الحصة',desc:'خمسة معايير وملاحظات المدير الفني',deliverable:'تقييم جودة'},
  {number:'06',page:'aiAdvisor',title:'مستشار التدريب الذكي',desc:'اقتراح أولويات التحسين من مراجعات الجودة والجرعات المسجلة، بعد إذن المستخدم',deliverable:'مسودة توصيات'},
  {number:'07',page:'development',title:'تقييم تطور اللاعب',desc:'المهارة، الدليل، وخطة فردية قابلة للمتابعة',deliverable:'خطة تطوير'},
  {number:'08',page:'aiDevelopment',title:'تقرير اللاعب الذكي',desc:'ملخص مدعوم بالأدلة والمجالات الناقصة في ملف اللاعب',deliverable:'مسودة تطور اللاعب'},
  {number:'09',page:'reports',title:'مراجعة البرنامج',desc:'تقارير التغطية والتطور وتحسين الأسبوع القادم',deliverable:'قرار فني'}
];
const weightLabels = [
 {key:'objectives',label:'تحقيق أهداف الحصة',weight:30,desc:'هل ظهر السلوك المستهدف بوضوح؟'},
 {key:'realism',label:'واقعية مواقف اللعب',weight:25,desc:'قرارات وضغوط ومساحات قريبة من المباراة'},
 {key:'opportunities',label:'فرص التعلم والمشاركة',weight:20,desc:'نصيب كل لاعب من الفرص المؤهلة'},
 {key:'feedback',label:'توجيه المدرب',weight:15,desc:'تغذية راجعة مفيدة وقابلة للتطبيق'},
 {key:'reflection',label:'التوثيق والمراجعة',weight:10,desc:'ملاحظات وأهداف قابلة للمتابعة'}
];
const moduleRows = [
 ['A01','هوية المنشأة والفروع','تشغيلي'],['A02','أدوار الموظفين والتفويض','تطوير لاحق'],['A03','الفئات والفرق','تشغيلي'],['A04','الملفات والانتساب','تشغيلي'],
 ['A05','تقويم التدريب','تشغيلي'],['A06','الحضور والانضباط','تشغيلي'],['A07','الأدلة وملاحظات المدرب','تشغيلي'],['A08','رفع الفيديو القصير','تجريبي'],
 ['A09','التقييم الشامل 12 مجالًا','تشغيلي'],['A10','مراجعة المدرب','تشغيلي'],['A11','أهداف اللاعب','تشغيلي'],['A12','خطة التطوير والمتابعة','تشغيلي'],
 ['A13','قياس حجم التدريب','يدوي'],['A14','الجاهزية المتخصصة','تطوير لاحق'],['A15','الإحالة لمختص','تطوير لاحق'],['A16','ترشيح المواهب','مسودة فقط'],
 ['A17','وصول الكشافين','تطوير لاحق'],['A18','التجارب الرسمية','تطوير لاحق'],['A19','حماية الناشئين والموافقات','جزئي'],['A20','التقارير والمراجعة','تشغيلي']
];

function sampleData(): Store {
  const t=datestr();
  return {
    academy:{name:'أكاديمية SPORTIX النموذجية',city:'جدة',sport:'كرة القدم'},
    players:[
      {id:'p1',name:'سالم العتيبي',birthYear:2012,position:'جناح',cohort:'تحت 15',guardianConsent:true,status:'active'},
      {id:'p2',name:'عبدالله الحربي',birthYear:2011,position:'محور',cohort:'تحت 15',guardianConsent:true,status:'active'},
      {id:'p3',name:'مازن الغامدي',birthYear:2012,position:'مهاجم',cohort:'تحت 15',guardianConsent:true,status:'active'},
      {id:'p4',name:'فهد الشهري',birthYear:2013,position:'قلب دفاع',cohort:'تحت 13',guardianConsent:false,status:'active'},
      {id:'p5',name:'راشد المالكي',birthYear:2013,position:'حارس مرمى',cohort:'تحت 13',guardianConsent:true,status:'active'},
      {id:'p6',name:'يوسف القرني',birthYear:2010,position:'صانع ألعاب',cohort:'تحت 17',guardianConsent:true,status:'active'}
    ],
    coaches:[{id:'c1',name:'خالد القحطاني',role:'مدير فني',speciality:'تطوير الناشئين',qualification:'شهادة تدريب مهنية',status:'active'},
      {id:'c2',name:'محمد الحربي',role:'مدرب',speciality:'تحت 15',qualification:'مدرب معتمد داخليًا (مثال)',status:'active'},
      {id:'c3',name:'ناصر المالكي',role:'مدرب',speciality:'تحت 13',qualification:'مدرب أكاديمية (مثال)',status:'active'}],
    curricula:[{id:'m1',title:'مسار التحكم والقرار',cohort:'تحت 15',cycle:'نوفمبر 2026',objective:'تحسين الاستلام والقرار تحت الضغط',technicalFocus:'اللمسة الأولى',tacticalFocus:'فتح زوايا التمرير',physicalFocus:'التوازن',socialFocus:'التواصل',status:'active'},
      {id:'m2',title:'مسار الضغط والتحول',cohort:'تحت 13',cycle:'نوفمبر 2026',objective:'تطوير الضغط الجماعي بعد فقد الكرة',technicalFocus:'الافتكاك',tacticalFocus:'التحول الدفاعي',physicalFocus:'الرشاقة',socialFocus:'التنسيق',status:'active'}],
    drills:[
      {id:'d1',title:'استلام تحت ضغط 3v1',phase:'تهيئة مهارية',focus:'استلام وتمرير',format:'3 ضد 1',minutes:15,players:4,area:'12 × 12 متر',challenge:'منافس محدود',goal:'توجيه اللمسة الأولى بعيدًا عن الضغط',successCriteria:'قرار مناسب في 7 من 10 محاولات',coachCues:'وضع الجسم قبل الاستلام'},
      {id:'d2',title:'روندو بخيارات متغيرة',phase:'تحدي واتخاذ قرار',focus:'الاستحواذ',format:'5 ضد 2',minutes:20,players:7,area:'18 × 18 متر',challenge:'ضغط واقعي',goal:'قراءة خيار التمرير قبل الاستلام',successCriteria:'اختيار مناسب في ثلثي المحاولات',coachCues:'مسح بصري مبكر'},
      {id:'d3',title:'لعبة مصغرة 5v5 + حراس',phase:'تطبيق في اللعب',focus:'التمركز',format:'5 ضد 5',minutes:25,players:12,area:'40 × 28 متر',challenge:'منافسة واقعية',goal:'تطبيق البناء والضغط خلال اللعب',successCriteria:'مراجعة 5 مواقف بالفيديو أو الملاحظة',coachCues:'تحليل دور اللاعب ضمن الخطة'},
      {id:'d4',title:'ضغط جماعي بعد الفقد',phase:'تحدي واتخاذ قرار',focus:'الضغط والتحولات',format:'6 ضد 6',minutes:20,players:12,area:'35 × 25 متر',challenge:'منافسة واقعية',goal:'توقيت الضغط وإغلاق خط التمرير',successCriteria:'4 استرجاعات صحيحة من 8 مواقف',coachCues:'متى نضغط ومتى نتراجع'},
      {id:'d5',title:'إنهاء الهجمة تحت ضغط',phase:'تطبيق في اللعب',focus:'الإنهاء',format:'4 ضد 3',minutes:20,players:8,area:'ثلث الملعب',challenge:'ضغط واقعي',goal:'صناعة فرصة وإنهاء صحيح',successCriteria:'مراجعة جودة القرار لا الأهداف فقط',coachCues:'وضع الجسم وجودة القرار'},
      {id:'d6',title:'توازن وتحكم بالكرة',phase:'تهيئة مهارية',focus:'1 ضد 1',format:'ثنائيات',minutes:15,players:10,area:'10 × 12 متر',challenge:'منافس محدود',goal:'حماية الكرة والانتقال بالقدمين',successCriteria:'إتمام 6 من 10 مواقف',coachCues:'تغيير اتجاه وحماية المساحة'}
    ],
    sessions:[
      {id:'s1',title:'التمرير تحت الضغط',date:t,cohort:'تحت 15',coachId:'c2',objectives:'تحسين قراءة المساحة والاستلام تحت الضغط',drillIds:['d1','d2','d3'],duration:85,venue:'ملعب الأكاديمية',status:'completed'},
      {id:'s2',title:'الضغط والتحول الدفاعي',date:t,cohort:'تحت 13',coachId:'c3',objectives:'التنسيق الجماعي بعد فقد الكرة',drillIds:['d4','d3'],duration:80,venue:'الملعب الفرعي',status:'planned'},
      {id:'s3',title:'إنهاء الهجمات',date:t,cohort:'تحت 17',coachId:'c1',objectives:'اختيار الحل المناسب قبل التسديد',drillIds:['d5'],duration:70,venue:'ملعب الأكاديمية',status:'draft'}
    ],
    attendance:[{id:'s1-p1',sessionId:'s1',playerId:'p1',status:'present'},{id:'s1-p2',sessionId:'s1',playerId:'p2',status:'present'},{id:'s1-p3',sessionId:'s1',playerId:'p3',status:'present'}],
    exposures:[{id:'s1-p1',sessionId:'s1',playerId:'p1',activeMinutes:65,attempts:10,successful:7,touches:42,note:'ملاحظة مدرب توضيحية'},
      {id:'s1-p2',sessionId:'s1',playerId:'p2',activeMinutes:65,attempts:10,successful:8,touches:39,note:'ملاحظة مدرب توضيحية'}],
    quality:[{id:'s1',sessionId:'s1',reviewer:'المدير الفني',objectives:4,realism:4,opportunities:3,feedback:4,reflection:3,score:76,note:'تحسين توزيع فرص المشاركة في الحصة المقبلة',approved:false}],
    evaluations:[{id:'e1',playerId:'p1',domain:'الفني',score:3,note:'تحتاج اللمسة الأولى إلى دقة أكبر تحت الضغط',source:'human_review',evaluatedAt:t},
      {id:'e2',playerId:'p1',domain:'القرارات',score:4,note:'اختيار جيد للتمرير في معظم المواقف المرصودة',source:'human_review',evaluatedAt:t},
      {id:'e3',playerId:'p2',domain:'التكتيكي',score:4,note:'يتحرك لدعم حامل الكرة',source:'human_review',evaluatedAt:t}],
    plans:[{id:'pl1',playerId:'p1',title:'رفع جودة اللمسة الأولى',target:'8 قرارات مناسبة من 10 في اختبار متكافئ',baseline:6,targetValue:8,dueDate:t,status:'active',coachNotes:'إعادة اختبار بمواقف مشابهة'},
      {id:'pl2',playerId:'p2',title:'تحسين المسح البصري',target:'مراجعة 5 مواقف لعب',dueDate:t,status:'active'}],
    nominations:[{id:'n1',playerId:'p1',target:'برنامج كشف المواهب',reason:'متابعة فنية داخلية مع ملاحظة موثقة',status:'draft',sharedExternally:false}],
    evidence:[],
    activity:[{id:'a1',action:'seed',kind:'demo',objectId:'demo',createdAt:stamp()}]
  };
}
function emptyStore(): Store {
  const records=Object.fromEntries(keys.map(k=>[k,[] as Entry[]])) as Record<Kind,Entry[]>;
  return {academy:{name:'أكاديمية SPORTIX',city:'جدة',sport:'كرة القدم'},activity:[],...records};
}
function demoData(): Store {
  try {const saved=localStorage.getItem(demoKey);if(saved){const r=JSON.parse(saved);const base=sampleData();return {...base,...r,academy:{...base.academy,...r.academy},activity:Array.isArray(r.activity)?r.activity:[],...Object.fromEntries(keys.map(k=>[k,Array.isArray(r[k])?r[k]:base[k]]))} as Store;}}catch{ /* ignore corrupt samples */ }
  return sampleData();
}
function idOf(kind: Kind, r: Record<string,any>) {
  if(kind==='quality') return String(r.sessionId);
  if(kind==='attendance' || kind==='exposures') return `${r.sessionId}-${r.playerId}`;
  return `demo_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
}
function csvExport(rows: Entry[], name: string) {
  if(!rows.length) return;
  const cols=Array.from(new Set(rows.flatMap(r=>Object.keys(r))));
  const escaped=(v:any)=>{const raw=String(Array.isArray(v)?v.join('|'):v??'');const safe=/^[\s]*[=+@-]/.test(raw)?"'"+raw:raw;return `"${safe.replace(/"/g,'""')}"`;};
  const csv='\uFEFF'+[cols.join(','),...rows.map(r=>cols.map(k=>escaped(r[k])).join(','))].join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`SPORTIX_${name}_${datestr()}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
}
function SportixLogo({compact=false}:{compact?:boolean}) {
  return <div className={`brand ${compact?'compact':''}`}>
    <svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="markSilver" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f3faf9"/><stop offset="1" stopColor="#7b8f91"/></linearGradient></defs><path d="M31 3 61 53 41 46 32 27 23 46 3 53Z" fill="url(#markSilver)"/><path d="M32 9 32 27 41 46 59 53Z" fill="#ceff36"/><path d="m19 58 13-15 13 15-13-7Z" fill="#caff2c"/></svg>
    {!compact && <div className="brand-words"><strong>SPORTI<span>X</span></strong><small>ACADEMY <em>OS</em></small></div>}
  </div>;
}
function Chip({children, tone='neutral'}:{children:ReactNode;tone?:'lime'|'neutral'|'orange'|'red'|'blue'}){return <span className={`chip ${tone}`}>{children}</span>}
function Button({children,onClick,icon:Icon,variant='primary',disabled=false,type='button'}:{children:ReactNode;onClick?:()=>void;icon?:LucideIcon;variant?:'primary'|'outline'|'quiet'|'danger';disabled?:boolean;type?:'button'|'submit'}){return <button type={type} className={`btn ${variant}`} onClick={onClick} disabled={disabled}>{Icon&&<Icon size={16}/>}<span>{children}</span></button>}
function SectionHeader({eyebrow,title,desc,actions}:{eyebrow:string;title:string;desc:string;actions?:ReactNode}){return <div className="section-heading"><div><div className="kicker">{eyebrow}</div><h1>{title}</h1><p>{desc}</p></div>{actions&&<div className="heading-actions">{actions}</div>}</div>}
function Empty({title,desc,button,onClick}:{title:string;desc:string;button?:string;onClick?:()=>void}){return <div className="empty"><div className="empty-illustration"><Flag size={30}/></div><h3>{title}</h3><p>{desc}</p>{button&&onClick&&<Button icon={Plus} onClick={onClick}>{button}</Button>}</div>}
function Metric({label,value,note,icon:Icon,accent=false}:{label:string;value:string|number;note:string;icon:LucideIcon;accent?:boolean}){return <div className={`metric-card ${accent?'accent':''}`}><div className="metric-top"><span>{label}</span><Icon size={19}/></div><strong>{value}</strong><small>{note}</small></div>}
function Progress({value,max=100}:{value:number;max?:number}){return <div className="progress"><span style={{width:`${Math.max(0,Math.min(100,(value/max)*100))}%`}}/></div>}
function TennisPitch(){return <div className="pitch-art" aria-hidden="true"><div className="pitch-frame"><span className="centerline"/><span className="centercircle"/><span className="box-one"/><span className="box-two"/><b className="ball p1"/><b className="ball p2"/><b className="ball p3"/><b className="ball p4"/><b className="ball p5"/><i className="tactic"/></div><div className="pitch-bottom">SPORTIX <b>TRAINING INTELLIGENCE</b></div></div>}

function App(){
  const [page,setPage]=useState<Page>('dashboard');
  const [menu,setMenu]=useState(false);
  const [data,setData]=useState<Store>(demoData);
  const [user,setUser]=useState<{userId:string;name?:string;email?:string}|null>(null);
  const [demo,setDemo]=useState(true);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [form,setForm]=useState<FormState|null>(null);
  const [search,setSearch]=useState('');
  const [cohortFilter,setCohortFilter]=useState('الكل');
  const [selectedPlayer,setSelectedPlayer]=useState('p1');
  const [selectedSession,setSelectedSession]=useState('s1');
  const [selectedCoach,setSelectedCoach]=useState('c1');
  const [staffView,setStaffView]=useState('مدير الأكاديمية');
  const [file,setFile]=useState<File|null>(null);
  const [qualityTab,setQualityTab]=useState<'reviews'|'rubric'>('reviews');
  const [settingsDraft,setSettingsDraft]=useState<{name:string;city:string}|null>(null);
  const notify=(s:string)=>setNotice(s);
  useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),5000);return()=>clearTimeout(t);},[notice]);
  useEffect(()=>{let mounted=true;auth.getUser().then(async u=>{if(!mounted)return;if(u){setUser(u);setDemo(false);setData(emptyStore());try {const r=await api.get('/api/academy/v2/bootstrap');if(!mounted)return;const raw=r.data as Partial<Store>;const sample=emptyStore();setData({...sample,...raw,academy:{...sample.academy,...raw.academy},activity:Array.isArray(raw.activity)?raw.activity:[],...Object.fromEntries(keys.map(k=>[k,Array.isArray(raw[k])?raw[k]:[]]))} as Store);}catch{notify('تعذر تحميل بيانات الحساب؛ تأكد من الاتصال وأعد المحاولة.');}}else{setDemo(true);setData(demoData());}}).catch(()=>notify('تعذر فحص تسجيل الدخول. يعمل العرض التجريبي محليًا.')).finally(()=>{if(mounted)setLoading(false)});return()=>{mounted=false};},[]);
  useEffect(()=>{if(demo&&!loading)try{localStorage.setItem(demoKey,JSON.stringify(data));}catch{notify('مساحة التخزين المحلي ممتلئة؛ صدر نسخة من بياناتك.');}},[data,demo,loading]);
  useEffect(()=>{if(!data.players.some(x=>x.id===selectedPlayer))setSelectedPlayer(data.players[0]?.id||'')},[data.players,selectedPlayer]);
  useEffect(()=>{if(!data.sessions.some(x=>x.id===selectedSession))setSelectedSession(data.sessions[0]?.id||'')},[data.sessions,selectedSession]);
  useEffect(()=>{if(!data.coaches.some(x=>x.id===selectedCoach))setSelectedCoach(data.coaches[0]?.id||'')},[data.coaches,selectedCoach]);
  const player=data.players.find(x=>x.id===selectedPlayer);
  const session=data.sessions.find(x=>x.id===selectedSession);
  const actor=navItems.find(x=>x.id===page)||navItems[0];
  const pct=(n:number,d:number)=>d>0?Math.round(n/d*100):null;
  const doneSessions=data.sessions.filter(s=>s.status==='completed');
  const qualitySamples=data.quality.map(x=>scoreQuality(x)).filter((n):n is number=>n!==null);
  const qualityAvg=qualitySamples.length?Math.round(qualitySamples.reduce((s,n)=>s+n,0)/qualitySamples.length):null;
  const attendancePct=pct(data.attendance.filter(x=>x.status==='present').length,data.attendance.length);
  const livePlans=data.plans.filter(x=>x.status!=='completed');
  const playerEval=data.evaluations.filter(x=>x.playerId===selectedPlayer);
  const playerPlans=data.plans.filter(x=>x.playerId===selectedPlayer);
  const focusCounts=data.drills.reduce<Record<string,number>>((m,x)=>(m[x.focus]=(m[x.focus]||0)+1,m),{});
  const filteredPlayers=data.players.filter(x=>(cohortFilter==='الكل'||x.cohort===cohortFilter)&&(x.name+x.cohort+x.position).includes(search));
  const go=(p:Page)=>{setPage(p);setMenu(false);setSearch('');setCohortFilter('الكل');window.scrollTo({top:0,behavior:'smooth'});};
  function begin(kind:Kind, initial:Record<string,any>={},id?:string){
    if(['attendance','exposures','quality','evaluations','plans','nominations','evidence'].includes(kind) && ['exposures','evaluations','plans','nominations','evidence'].includes(kind) && !data.players.length){notify('سجّل لاعبًا أولًا.');go('players');return;}
    const existing=id?data[kind].find(x=>x.id===id):null;
    const base:Record<string,any>=kind==='sessions'?{date:datestr(),cohort:'تحت 15',duration:90,status:'planned',drillIds:[]}:
      kind==='players'?{cohort:'تحت 15',position:'جناح',guardianConsent:false,status:'active'}:
      kind==='drills'?{phase:phases[0],focus:focuses[0],minutes:15,players:10,challenge:'منافس محدود'}:
      kind==='quality'?{sessionId:selectedSession,reviewer:staffView,objectives:3,realism:3,opportunities:3,feedback:3,reflection:3,approved:false}:
      kind==='evaluations'?{playerId:selectedPlayer,domain:domains[0],score:3}:
      kind==='exposures'?{sessionId:selectedSession,playerId:selectedPlayer,activeMinutes:0,attempts:0,successful:0,touches:0}:
      kind==='curricula'?{cohort:'تحت 15',cycle:'الشهر الحالي',status:'active'}:
      kind==='nominations'?{playerId:selectedPlayer,target:'',status:'draft',sharedExternally:false}:
      kind==='plans'?{playerId:selectedPlayer,status:'active'}:
      kind==='attendance'?{sessionId:selectedSession,playerId:selectedPlayer,status:'present'}:
      kind==='evidence'?{playerId:selectedPlayer,sessionId:selectedSession}:{};
    const values={...base,...existing,...initial};
    for(const field of fields[kind]||[]) if(field.type==='select' && values[field.key]===undefined && field.options?.length){const first=field.options[0];values[field.key]=typeof first==='string'?first:first.value;}
    setForm({kind,id,values});setFile(null);
  }
  const updateForm=(k:string,v:any)=>setForm(old=>old?{...old,values:{...old.values,[k]:v}}:null);
  const optimistic=(kind:Kind,item:Entry,verb:'create'|'update')=>{setData(prev=>({...prev,[kind]:verb==='update'||['quality','attendance','exposures'].includes(kind)?[...prev[kind].filter(r=>r.id!==item.id),item]:[...prev[kind],item],activity:[{id:`log_${Date.now()}`,action:verb,kind,objectId:item.id,createdAt:stamp()},...prev.activity].slice(0,80)}));};
  async function write(kind:Kind,values:Record<string,any>,id?:string){
    if(demo){const realId=id||idOf(kind,values);const previous=id?data[kind].find(item=>item.id===id):undefined;const item:Entry={...previous,...values,id:realId,updatedAt:stamp()};if(kind==='nominations'){item.status='draft';item.sharedExternally=false};if(kind==='quality')item.score=scoreQuality(item)||0;optimistic(kind,item,id?'update':'create');return item;}
    const route=`/api/academy/v2/records/${kind}${id?`/${id}`:''}`;
    const response=id?await api.put(route,values):await api.post(route,values);
    const item=response.data as Entry;optimistic(kind,item,id?'update':'create');return item;
  }
  async function saveForm(){
    if(!form)return;
    const {kind,values,id}=form;const v={...values};
    const required:Partial<Record<Kind,string[]>>={players:['name','birthYear'],coaches:['name'],curricula:['title','cohort','objective'],drills:['title','goal'],sessions:['title','date','objectives'],quality:['sessionId','reviewer'],evaluations:['playerId','note'],plans:['playerId','title','target'],nominations:['playerId','target'],exposures:['playerId','sessionId'],evidence:['playerId','title']};
    const misses=(required[kind]||[]).filter(k=>v[k]===undefined||v[k]===null||String(v[k]).trim()==='');
    if(misses.length){notify('أكمل الحقول المطلوبة قبل الحفظ.');return;}
    if(kind==='players'&&(Number(v.birthYear)<1990||Number(v.birthYear)>new Date().getFullYear()-4)){notify('سنة ميلاد اللاعب غير صحيحة.');return;}
    if(kind==='exposures' && (Number(v.successful)>Number(v.attempts)||Number(v.activeMinutes)<0)){notify('القرارات المناسبة لا يمكن أن تتجاوز مجموع المحاولات.');return;}
    if(kind==='nominations'){const p=data.players.find(x=>x.id===v.playerId);if(!p?.guardianConsent){notify('الترشيح يتطلب تسجيل موافقة ولي الأمر أولًا.');return;}}
    if(kind==='quality'&&!['objectives','realism','opportunities','feedback','reflection'].every(k=>Number(v[k])>=0&&Number(v[k])<=5)){notify('تقييم جودة الحصة يجب أن يكون بين 0 و5 لكل محور.');return;}
    setBusy(true);
    try{
      if(kind==='evidence'){
        if(demo){notify('حفظ الفيديو الفعلي يتطلب حسابًا مسجلًا؛ البيانات التجريبية لا تُرفع.');return;}
        if(!file){notify('اختر ملف الفيديو.');return;}
        if(file.size>2*1024*1024){notify('الحد التجريبي للرفع 2 ميجابايت فقط.');return;}
        if(!['video/mp4','video/webm','video/quicktime'].includes(file.type)){notify('صيغة الفيديو غير مدعومة.');return;}
        const content=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.onerror=()=>reject(Error('فشل قراءة الملف'));reader.readAsDataURL(file)});
        const response=await api.post('/api/academy/v2/evidence/upload',{...v,filename:file.name,contentType:file.type,content});
        optimistic('evidence',response.data as Entry,'create');
      }else{
        const result=await write(kind,v,id);
        if(kind==='players')setSelectedPlayer(result.id);
        if(kind==='sessions')setSelectedSession(result.id);
        if(kind==='coaches')setSelectedCoach(result.id);
        if(kind==='evaluations'||kind==='plans'||kind==='nominations')setSelectedPlayer(String(v.playerId));
      }
      setForm(null);notify('تم حفظ السجل بنجاح');
    }catch(e){notify(e instanceof Error?`تعذر الحفظ: ${e.message}`:'تعذر الحفظ؛ أعد المحاولة');}finally{setBusy(false)}
  }
  async function remove(kind:Kind,id:string){
    if(!window.confirm('تأكيد حذف هذا السجل؟ قد يتطلب الاحتفاظ بسجلات اللاعب المرتبطة به.'))return;
    setBusy(true);
    try{if(!demo)await api.delete(`/api/academy/v2/records/${kind}/${id}`);
      setData(prev=>({...prev,[kind]:prev[kind].filter(x=>x.id!==id)}));notify('تم حذف السجل');
    }catch(e){notify(e instanceof Error?e.message:'لم يتم الحذف');}finally{setBusy(false)}
  }
  async function setStatus(kind:Kind,id:string,changes:Record<string,any>){setBusy(true);try{await write(kind,changes,id);notify('تم تحديث الحالة');}catch(e){notify(e instanceof Error?e.message:'تعذر التحديث');}finally{setBusy(false)}}
  async function attendance(sessionId:string,playerId:string,status:string){const id=`${sessionId}-${playerId}`;try{await write('attendance',{sessionId,playerId,status},data.attendance.some(x=>x.id===id)?id:undefined);notify('تم تسجيل الحضور');}catch(e){notify(e instanceof Error?e.message:'تعذر تحديث الحضور')}}
  async function login(){try{await auth.signInWithRedirect()}catch(e){notify(e instanceof Error?e.message:'تعذر تسجيل الدخول')}}
  async function logout(){try{await auth.signOut();setUser(null);setDemo(true);setData(demoData());go('dashboard');notify('تم تسجيل الخروج');}catch{notify('تعذر تسجيل الخروج')}}
  async function saveAcademy(){const n=(settingsDraft?.name??data.academy.name).trim(),c=(settingsDraft?.city??data.academy.city).trim();if(!n){notify('اسم الأكاديمية مطلوب');return}setBusy(true);try{if(!demo)await api.put('/api/academy/v2/settings',{name:n,city:c});setData(s=>({...s,academy:{...s.academy,name:n,city:c}}));setSettingsDraft(null);notify('تم حفظ إعدادات الأكاديمية')}catch(e){notify(e instanceof Error?e.message:'تعذر حفظ الإعدادات')}finally{setBusy(false)}}
  async function openEvidence(v:Entry){if(demo){notify('هذا مثال توضيحي لا يحتوي على فيديو مخزن.');return;}const popup=window.open('', '_blank');try{const r=await api.get(`/api/academy/v2/evidence/${v.id}/url`);if(r.data.url){if(popup){popup.opener=null;popup.location.href=r.data.url}else{window.location.assign(r.data.url)}}else{popup?.close();notify('الملف غير متاح')}}catch{popup?.close();notify('تعذر فتح الملف')}}
  const getName=(kind:'players'|'coaches'|'sessions'|'drills',id:string)=>data[kind].find(x=>x.id===id)?.name||data[kind].find(x=>x.id===id)?.title||'غير محدد';
  const field=(key:string,label:string,extra:Partial<Field>={}):Field=>({key,label,...extra});
  const option=(arr:Entry[],label:string)=>arr.map(x=>({value:x.id,label:x[label]||x.name||x.title||x.id}));
  const fields:Partial<Record<Kind,Field[]>>={
    players:[field('name','اسم اللاعب',{required:true}),field('birthYear','سنة الميلاد',{type:'number',required:true,min:1990,max:new Date().getFullYear()-4}),field('cohort','الفئة العمرية',{type:'select',options:cohorts}),field('position','المركز',{type:'select',options:positions}),field('guardianConsent','تم توثيق موافقة ولي الأمر',{type:'checkbox',wide:true,hint:'علم إداري فقط؛ لا يمثل وثيقة موافقة مُتحققًا منها.'}),field('notes','ملاحظات فنية داخلية',{type:'textarea',wide:true})],
    coaches:[field('name','اسم المدرب',{required:true}),field('role','الصفة',{type:'select',options:['مدير فني','مدرب','محلل أداء','مسؤول فئات']}),field('speciality','التخصص أو الفئة'),field('qualification','المؤهل المهني'),field('status','الحالة',{type:'select',options:['active','inactive']})],
    curricula:[field('title','اسم المنهج',{required:true}),field('cohort','الفئة',{type:'select',options:cohorts}),field('cycle','الفترة الزمنية'),field('objective','هدف التعلم الرئيسي',{type:'textarea',wide:true,required:true}),field('technicalFocus','الجانب الفني'),field('tacticalFocus','الجانب التكتيكي'),field('physicalFocus','جانب الحركة والبدني'),field('socialFocus','جانب السلوك والتعاون'),field('status','الحالة',{type:'select',options:[{value:'active',label:'معتمد داخليًا'},{value:'draft',label:'مسودة'}]})],
    drills:[field('title','اسم التمرين',{required:true}),field('phase','مرحلة التعلّم',{type:'select',options:phases}),field('focus','المحور الفني',{type:'select',options:focuses}),field('format','صيغة اللعب (مثال: 3 ضد 1)'),field('minutes','الدقائق',{type:'number',min:1}),field('players','عدد المشاركين',{type:'number',min:1}),field('area','المساحة'),field('challenge','الضغط التنافسي',{type:'select',options:['بدون منافس','منافس محدود','منافسة واقعية']}),field('goal','هدف التمرين',{type:'textarea',wide:true,required:true}),field('successCriteria','مؤشر تحقق الهدف',{type:'textarea',wide:true}),field('coachCues','نقاط توجيه المدرب',{type:'textarea',wide:true})],
    sessions:[field('title','عنوان الحصة',{required:true}),field('date','تاريخ التدريب',{type:'date',required:true}),field('cohort','الفئة',{type:'select',options:cohorts}),field('coachId','المدرب',{type:'select',options:option(data.coaches,'name')}),field('duration','المدة المخططة بالدقائق',{type:'number',min:1,max:360}),field('venue','الملعب'),field('objectives','السلوك / الهدف القابل للقياس',{type:'textarea',wide:true,required:true}),field('drillIds','اختيار التمارين الثلاثية',{type:'multi',wide:true,options:option(data.drills,'title'),hint:'حدد التمارين بالترتيب: تهيئة، تحدٍ، تطبيق لعب.'}),field('status','مرحلة الحصة',{type:'select',options:[{value:'draft',label:'مسودة'},{value:'planned',label:'مجدولة'},{value:'completed',label:'منفذة'}]}),field('notes','ملاحظات المدرب',{type:'textarea',wide:true})],
    quality:[field('sessionId','الحصة',{type:'select',options:option(data.sessions,'title'),required:true}),field('reviewer','المراجع الفني',{required:true}),...weightLabels.map(w=>field(w.key,`${w.label} (${w.weight}%)`,{type:'select',options:[0,1,2,3,4,5].map(v=>({value:String(v),label:`${v} / 5`}))})),field('note','التفسير والتوصية',{type:'textarea',wide:true,hint:'الدرجة استرشادية مصممة لـSPORTIX وليست اعتمادًا خارجيًا.'})],
    exposures:[field('sessionId','الجلسة',{type:'select',options:option(data.sessions,'title')}),field('playerId','اللاعب',{type:'select',options:option(data.players,'name')}),field('activeMinutes','الدقائق الفعلية',{type:'number',min:0}),field('attempts','محاولات/قرارات مرصودة',{type:'number',min:0}),field('successful','محاولات مناسبة',{type:'number',min:0}),field('touches','لمسات تم حصرها يدويًا',{type:'number',min:0}),field('note','مصدر القياس والملاحظات',{type:'textarea',wide:true,hint:'لا تُعامل تقديرات المدرب على أنها قياس حساسات أو رؤية حاسوبية.'})],
    evaluations:[field('playerId','اللاعب',{type:'select',options:option(data.players,'name'),required:true}),field('domain','مجال التقييم',{type:'select',options:domains}),field('score','تقييم المراجعة البشرية',{type:'select',options:[1,2,3,4,5].map(x=>({value:String(x),label:`${x} من 5`}))}),field('note','ملاحظة قابلة للمراجعة',{type:'textarea',wide:true,required:true}),field('evidenceRef','مرجع دليل أو جلسة'),field('evaluatedAt','تاريخ الرصد',{type:'date'})],
    plans:[field('playerId','اللاعب',{type:'select',options:option(data.players,'name'),required:true}),field('title','هدف التطوير',{required:true}),field('target','مؤشر أو اختبار إعادة القياس',{type:'textarea',wide:true,required:true}),field('baseline','قياس البداية إن وُجد',{type:'number'}),field('targetValue','القيمة المستهدفة',{type:'number'}),field('dueDate','موعد المراجعة',{type:'date'}),field('coachNotes','مسؤول وخطة المتابعة',{type:'textarea',wide:true}),field('status','الحالة',{type:'select',options:[{value:'active',label:'قيد التطوير'},{value:'completed',label:'مكتملة'},{value:'paused',label:'متوقفة'}]})],
    nominations:[field('playerId','اللاعب',{type:'select',options:option(data.players,'name'),required:true}),field('target','النادي أو المسار',{required:true}),field('reason','مبرر الترشيح المهني',{type:'textarea',wide:true,hint:'مسودة داخلية فقط. لا توجد مشاركة تلقائية مع الأندية والكشافين.'})],
    evidence:[field('playerId','اللاعب',{type:'select',options:option(data.players,'name')}),field('sessionId','جلسة مرجعية',{type:'select',options:option(data.sessions,'title')}),field('title','عنوان المقطع',{required:true})]
  };
  const titles:Partial<Record<Kind,string>>={players:'لاعب',coaches:'مدرب',curricula:'منهج',drills:'تمرين',sessions:'حصة',quality:'مراجعة جودة',attendance:'حضور',exposures:'جرعة تدريب',evaluations:'تقييم لاعب',plans:'خطة تطوير',nominations:'ترشيح موهبة',evidence:'دليل فيديو'};
  const showRow=(kind:Kind,rows:Entry[],columns:{key:string;title:string;render?:(r:Entry)=>ReactNode}[],emptyText:string)=>rows.length?<div className="table-scroll"><table><thead><tr>{columns.map(c=><th key={c.key}>{c.title}</th>)}<th className="actions-cell">الإجراءات</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}>{columns.map(c=><td key={c.key}>{c.render?c.render(r):String(r[c.key]??'—')}</td>)}<td><div className="row-actions"><button title="تعديل" onClick={()=>begin(kind,{},r.id)}><Pencil size={16}/></button>{!['quality','attendance'].includes(kind)&&<button title="حذف" className="danger-icon" onClick={()=>remove(kind,r.id)}><Trash2 size={15}/></button>}</div></td></tr>)}</tbody></table></div>:<Empty title="لا توجد سجلات بعد" desc={emptyText}/>;

  if(loading)return <div className="full-loading"><SportixLogo/><div className="spinner"/><p>جاري تجهيز مساحة SPORTIX ACADEMY...</p></div>;
  return <div className="application" dir="rtl">
    {menu&&<button className="mobile-overlay" aria-label="إغلاق القائمة" onClick={()=>setMenu(false)} />}
    <aside className={`sidebar ${menu?'opened':''}`}>
      <div className="sidebar-logo"><SportixLogo/><div className="mini-subtitle">FOOTBALL TRAINING INTELLIGENCE</div></div>
      <div className="academy-switch"><div className="academy-icon"><GraduationCap size={22}/></div><div><strong>{data.academy.name}</strong><small>{data.academy.city} · كرة القدم</small></div><ChevronDown size={15}/></div>
      <div className="sidebar-content">{nav.map(group=><div className="nav-group" key={group.group}><div className="group-heading">{group.group}</div>{group.items.map(n=><button className={`nav-link ${page===n.id?'on':''}`} key={n.id} onClick={()=>go(n.id)}><n.icon size={19}/><span>{n.label}</span>{page===n.id&&<i/>}</button>)}</div>)}</div>
      <div className="sidebar-foot"><div className="side-tip"><ShieldCheck size={19}/><div><b>SPORTIX GOVERNANCE</b><small>المصدر · الصلاحية · مراجعة المدرب</small></div></div><small>SPORTIX ECOSYSTEM / ACADEMY OS 2.0</small></div>
    </aside>
    <div className="shell">
      <header className="app-topbar"><div className="top-current"><button className="icon-button mobile-nav" aria-label="فتح القائمة" onClick={()=>setMenu(true)}><Menu size={22}/></button><actor.icon size={19}/><span>{actor.label}</span><ChevronLeft className="faint" size={15}/></div><div className="top-end"><label className="role-select"><span>وضع الدور</span><select aria-label="دور العرض التجريبي" value={staffView} onChange={e=>setStaffView(e.target.value)}><option>مدير الأكاديمية</option><option>مدير فني</option><option>مدرب</option><option>محلل أداء</option></select></label><Chip tone={demo?'orange':'lime'}>{demo?'عرض تجريبي':'مساحة محفوظة'}</Chip><button className="icon-button" title="سير العمل" onClick={()=>go('workflow')}><ListChecks size={18}/></button><button className="account" onClick={user?logout:login}>{user?<LogOut size={16}/>:<LogIn size={16}/>}<span>{user?.name||'تسجيل الدخول'}</span></button></div></header>
      {demo&&<div className="demo-banner"><span><Sparkles size={16}/> <b>بيئة توضيحية</b> — السجلات الظاهرة أمثلة افتراضية، والتعديلات تُحفظ على جهازك فقط.</span><button onClick={login}>تسجيل الدخول للحفظ السحابي <ArrowLeft size={15}/></button></div>}
      <main className="page-content">
        {page==='dashboard'&&<>
          <div className="hero"><div className="hero-copy"><div className="kicker"><Zap size={15}/> THE FUTURE OF FOOTBALL DEVELOPMENT</div><h1>من التخطيط<br/><em>إلى التطور الحقيقي.</em></h1><p>مساحة عمل واحدة تتيح للأكاديمية بناء منهج التدريب، توثيق الحصص، قياس جودة التعلم، ومتابعة أداء الرياضيين عبر الموسم.</p><div className="hero-buttons"><Button icon={Plus} onClick={()=>begin('sessions')}>صمّم حصة تدريبية</Button><Button variant="outline" icon={Layers3} onClick={()=>go('workflow')}>استعرض سير العمل</Button></div><div className="hero-tags"><span><CheckCircle2 size={13}/> منهج موحّد</span><span><CheckCircle2 size={13}/> تقييم بالأدلة</span><span><CheckCircle2 size={13}/> قرار المدرب</span></div></div><TennisPitch/><div className="hero-stripe">SPORTIX ACADEMY <b>OS</b></div></div>
          <div className="metric-grid"><Metric label="اللاعبون" value={data.players.length} note="ملف تطوير لكل لاعب" icon={Users}/><Metric label="الحصص المُنفذة" value={doneSessions.length} note={`من أصل ${data.sessions.length} جلسة`} icon={CalendarDays}/><Metric label="متوسط جودة التدريب" value={qualityAvg===null?'—':`${qualityAvg}/100`} note={`${qualitySamples.length} مراجعة بشرية`} icon={BarChart3} accent/><Metric label="خطط التطوير النشطة" value={livePlans.length} note="أهداف قابلة للمتابعة" icon={Target}/></div>
          <div className="dashboard-layout"><section className="panel"><div className="panel-heading"><div><span className="kicker">YOUR WORKFLOW</span><h2>خريطة العمل من 9 مراحل</h2></div><button className="inline-link" onClick={()=>go('workflow')}>عرض التفاصيل <ArrowLeft size={15}/></button></div><div className="mini-flow">{workflow.slice(0,5).map(w=><button key={w.number} onClick={()=>go(w.page)}><b>{w.number}</b><strong>{w.title}</strong><ChevronLeft size={16}/></button>)}</div></section><section className="panel"><div className="panel-heading"><div><span className="kicker">NEXT SESSIONS</span><h2>جدول التدريب</h2></div><button className="inline-link" onClick={()=>go('planner')}>الجدول <ArrowLeft size={15}/></button></div>{data.sessions.slice(0,4).map(s=><button className="upcoming" key={s.id} onClick={()=>{setSelectedSession(s.id);go('sessions')}}><div className="date-block"><CalendarDays size={18}/></div><div><strong>{s.title}</strong><small>{s.cohort} · {maybeDate(s.date)} · {s.duration} دقيقة</small></div><Chip tone={s.status==='completed'?'lime':'neutral'}>{s.status==='completed'?'منفذة':'قادمة'}</Chip></button>)}{!data.sessions.length&&<Empty title="لا توجد حصص" desc="ابدأ بتخطيط أسبوعك"/>}</section></div>
          <div className="info-banner"><div><div className="kicker">SPORTIX LEARNING LOOP</div><h2>الحصة الأفضل ليست التي تنتهي فقط. بل التي تترك أثرًا يمكن قياسه.</h2><p>كل درجة معروضة مرتبطة بملاحظة أو مصدر. التحليل النفسي والطبي والرؤية الحاسوبية ليست استنتاجات تلقائية من مقطع فيديو.</p></div><Button variant="outline" icon={TrendingUp} onClick={()=>go('development')}>تطور اللاعب</Button></div>
        </>}
        {page==='workflow'&&<>
          <SectionHeader eyebrow="ACADEMY OPERATING WORKFLOW" title="سير عمل واحد، لا خطوات مبعثرة" desc="اتبع رحلة التدريب أسبوعيًا: التخطيط، التنفيذ، الملاحظة، المراجعة، ثم تحسين البرنامج. كل خطوة تنقلك إلى مساحة العمل المناسبة." actions={<Button icon={Plus} onClick={()=>begin('curricula')}>ابدأ بمنهج جديد</Button>}/>
          <div className="workflow-canvas"><div className="workflow-intro"><div><span className="kicker">SPORTIX OPERATING CYCLE</span><h2>TRAIN → MEASURE → DEVELOP</h2><p>الرحلة قابلة للتكرار لكل فئة ومدرب، دون إصدار أحكام آلية غير مفسرة.</p></div><div className="workflow-ring"><span>9</span><small>مراحل واضحة</small></div></div><div className="workflow-steps">{workflow.map((w,i)=><button key={w.number} className="workflow-step" onClick={()=>go(w.page)}><div className="number">{w.number}</div><div className="content"><small>المرحلة {i+1}</small><strong>{w.title}</strong><p>{w.desc}</p><span>المخرج: {w.deliverable}</span></div><ArrowLeft size={19}/></button>)}</div></div>
        </>}
        {page==='curricula'&&<>
          <SectionHeader eyebrow="ACADEMY CURRICULUM" title="مناهج تدريب حسب العمر والمرحلة" desc="يحدد المدير الفني أهداف التعلم التي تُبنى عليها خطة الأسبوع؛ لا يبدأ التقويم بمجرد ملء أيام فارغة." actions={<Button icon={Plus} onClick={()=>begin('curricula')}>إنشاء منهج</Button>}/>
          <div className="cards three">{data.curricula.map(c=><div className="feature-card" key={c.id}><div className="feature-top"><div className="tile-icon"><BookOpen size={21}/></div><Chip tone="lime">{c.cohort}</Chip></div><h3>{c.title}</h3><p>{c.objective}</p><div className="focus-rows"><span>فني <b>{c.technicalFocus||'—'}</b></span><span>تكتيكي <b>{c.tacticalFocus||'—'}</b></span><span>حركي <b>{c.physicalFocus||'—'}</b></span><span>اجتماعي <b>{c.socialFocus||'—'}</b></span></div><div className="card-actions"><Button variant="outline" icon={Pencil} onClick={()=>begin('curricula',{},c.id)}>تعديل المنهج</Button><button className="icon-button" title="حذف" onClick={()=>remove('curricula',c.id)}><Trash2 size={16}/></button></div></div>)}{!data.curricula.length&&<div className="span-all"><Empty title="المنهج لم يُبنَ بعد" desc="ابدأ بتحديد أهداف الفئة العمرية" button="إنشاء منهج" onClick={()=>begin('curricula')}/></div>}</div>
          <div className="reference-block"><div><span className="kicker">FOUR CORNERS + SPORTIX DOMAINS</span><h3>ماذا نخطط لكل فئة؟</h3><p>الجانب الفني والتكتيكي والبدني والاجتماعي، ثم التقييم الفردي عبر المجالات الاثني عشر عند توفر الأدلة ووسيلة القياس المناسبة.</p></div><Button variant="quiet" icon={TrendingUp} onClick={()=>go('development')}>شاهد المجالات الـ12</Button></div>
        </>}
        {page==='drills'&&<>
          <SectionHeader eyebrow="TRAINING LIBRARY" title="مكتبة التمارين" desc="صمّم تدريبًا متدرجًا من المهارة إلى القرار ثم التطبيق في اللعب، واربط كل تمرين بسلوك قابل للملاحظة." actions={<Button icon={Plus} onClick={()=>begin('drills')}>إضافة تمرين</Button>}/>
          <div className="chip-row">{['الكل',...phases].map(f=><button key={f} className={cohortFilter===f?'active':''} onClick={()=>setCohortFilter(f)}>{f}</button>)}</div>
          <div className="cards three">{data.drills.filter(x=>cohortFilter==='الكل'||x.phase===cohortFilter).map(d=><div className="drill-card" key={d.id}><div className="drill-head"><Chip tone="lime">{d.phase}</Chip><span className="mono">{d.minutes||15} MIN</span></div><div className="drill-field"><span/><span/><span/></div><h3>{d.title}</h3><p>{d.goal}</p><div className="drill-info"><span>{d.focus}</span><span>{d.format}</span><span>{d.challenge}</span></div><div className="drill-criteria"><small>معيار النجاح</small><strong>{d.successCriteria||'يحدده المدرب'}</strong></div><div className="card-actions"><Button variant="outline" icon={Pencil} onClick={()=>begin('drills',{},d.id)}>تحرير</Button><Button variant="quiet" icon={Trash2} onClick={()=>remove('drills',d.id)}>حذف</Button></div></div>)}{!data.drills.length&&<div className="span-all"><Empty title="المكتبة فارغة" desc="صمّم أول تمرين وفق الهدف" button="إضافة تمرين" onClick={()=>begin('drills')}/></div>}</div>
        </>}
        {page==='planner'&&<>
          <SectionHeader eyebrow="WEEKLY TRAINING PLANNER" title="خطة التدريب الأسبوعية" desc="كل حصة تضم هدفًا، مدربًا مسؤولًا، تمارين متدرجة، وتاريخًا واضحًا. اختر الحصة لتجهيز التنفيذ." actions={<Button icon={Plus} onClick={()=>begin('sessions')}>تخطيط حصة</Button>}/>
          <div className="plan-overview"><div><span className="kicker">SESSION STRUCTURE</span><h3>هيكل الحصة الاحترافية</h3><p>تهيئة مهارية ← تحدٍ واتخاذ قرار ← تطبيق في اللعب. الترتيب المقترح إرشادي ويعدله المدرب حسب العمر والهدف.</p></div><div className="phase-badges">{phases.map((p,i)=><span key={p}><b>0{i+1}</b>{p}</span>)}</div></div>
          {data.sessions.length?<div className="week-grid">{[...data.sessions].sort((a,b)=>String(a.date).localeCompare(String(b.date))).map(s=><button key={s.id} className="week-card" onClick={()=>{setSelectedSession(s.id);go('sessions')}}><div className="week-card-top"><div className="week-date"><CalendarDays size={18}/>{maybeDate(s.date)}</div><Chip tone={s.status==='completed'?'lime':s.status==='draft'?'orange':'neutral'}>{s.status==='completed'?'منفذة':s.status==='draft'?'مسودة':'مجدولة'}</Chip></div><h3>{s.title}</h3><p>{s.objectives||'هدف لم يُحدد'}</p><div className="week-card-meta"><span><Users size={15}/>{s.cohort}</span><span><Clock3 size={15}/>{s.duration} دقيقة</span><span><UserRoundCheck size={15}/>{getName('coaches',s.coachId)}</span></div><div className="week-footer">{Array.isArray(s.drillIds)?s.drillIds.length:0} تمارين مرتبطة <ArrowLeft size={17}/></div></button>)}</div>:<Empty title="لا توجد خطة أسبوعية" desc="أنشئ حصة واربِطها بمكتبة التمارين" button="تخطيط حصة" onClick={()=>begin('sessions')}/>}
        </>}
        {page==='sessions'&&<>
          <SectionHeader eyebrow="TRAINING EXECUTION" title="تنفيذ الحصص والحضور" desc="حدد الجلسة والفئة، ثم سجل المشاركة الفعلية. نتائج التدريب تتطلب ملاحظات وأدلة لاحقة." actions={<Button icon={Plus} onClick={()=>begin('sessions')}>حصة جديدة</Button>}/>
          <div className="two-col"><section className="panel"><div className="panel-heading"><h2>الحصص</h2><Chip>{data.sessions.length} حصة</Chip></div><div className="session-cards">{data.sessions.map(s=><button key={s.id} className={`session-choice ${selectedSession===s.id?'selected':''}`} onClick={()=>setSelectedSession(s.id)}><div className="session-icon"><CalendarDays size={20}/></div><div><strong>{s.title}</strong><small>{s.cohort} · {maybeDate(s.date)}</small><small>{getName('coaches',s.coachId)} · {s.duration} دقيقة</small></div><ChevronLeft size={17}/></button>)}{!data.sessions.length&&<Empty title="لا توجد حصص" desc="أضف حصة من التخطيط"/>}</div></section>
          <section className="panel">{session?<><div className="panel-heading"><div><span className="kicker">SESSION TRACKER</span><h2>{session.title}</h2></div><button className="icon-button" onClick={()=>begin('sessions',{},session.id)} title="تعديل الحصة"><Pencil size={17}/></button></div><div className="session-meta"><span><Flag size={16}/>{session.cohort}</span><span><Clock3 size={16}/>{session.duration} دقيقة</span><span><UserRound size={16}/>{getName('coaches',session.coachId)}</span></div><div className="goal-box"><b>هدف الحصة</b><p>{session.objectives}</p></div><div className="inline-drills">{(Array.isArray(session.drillIds)?session.drillIds:[]).map((did:string,i:number)=><div key={did}><b>0{i+1}</b><span>{getName('drills',did)}</span></div>)}</div><div className="divider"/><div className="panel-heading"><h3>حضور اللاعبين</h3><Chip tone="orange">مراجعة بشرية</Chip></div><div className="attendance-items">{data.players.filter(p=>p.cohort===session.cohort).map(p=>{const st=data.attendance.find(x=>x.sessionId===session.id&&x.playerId===p.id)?.status;return <div className="att-item" key={p.id}><div className="person"><div className="mini-avatar">{avatar(p.name)}</div><strong>{p.name}</strong></div><div className="att-buttons">{[{id:'present',txt:'حاضر'},{id:'absent',txt:'غائب'},{id:'excused',txt:'عذر'}].map(s=><button key={s.id} className={st===s.id?'current':''} onClick={()=>attendance(session.id,p.id,s.id)}>{s.txt}</button>)}</div></div>})}{!data.players.some(p=>p.cohort===session.cohort)&&<Empty title="الفئة بلا لاعبين" desc="سجل لاعبين لهذه الفئة أولًا"/>}</div><div className="session-bottom"><Button variant="outline" icon={CheckCircle2} onClick={()=>setStatus('sessions',session.id,{status:'completed'})} disabled={session.status==='completed'||busy}>اعتماد انتهاء التنفيذ</Button><Button variant="outline" icon={BarChart3} onClick={()=>go('quality')}>تقييم الجودة</Button></div></>:<Empty title="اختر حصة" desc="لتسجيل الحضور والمتابعة"/>}</section></div>
        </>}
        {page==='quality'&&<>
          <SectionHeader eyebrow="SPORTIX TRAINING QUALITY ENGINE" title="قياس جودة الحصة" desc="تقييم بشري وفق خمسة محاور موزونة، يُراجعه المدير الفني وتُحفظ أسبابه. ليس اعتمادًا من FIFA أو أي جهة خارجية." actions={<Button icon={Plus} onClick={()=>begin('quality')}>مراجعة حصة</Button>}/>
          <div className="quality-summary"><div className="quality-big"><small>متوسط الجودة المسجل</small><strong>{qualityAvg===null?'—':qualityAvg}<span>{qualityAvg===null?'':' / 100'}</span></strong><p>{qualitySamples.length} مراجعة متاحة · مؤشر استرشادي</p></div><div className="quality-weights">{weightLabels.map(w=><div key={w.key}><span>{w.label}</span><b>{w.weight}%</b><Progress value={w.weight} max={30}/></div>)}</div></div>
          <div className="tab-bar"><button className={qualityTab==='reviews'?'active':''} onClick={()=>setQualityTab('reviews')}>التقييمات والمخرجات</button><button className={qualityTab==='rubric'?'active':''} onClick={()=>setQualityTab('rubric')}>شرح معايير القياس</button></div>
          {qualityTab==='reviews'?<div className="cards two">{data.quality.map(q=>{const score=scoreQuality(q);return <div className="quality-card" key={q.id}><div className="quality-card-top"><div><span className="kicker">HUMAN QUALITY REVIEW</span><h3>{getName('sessions',q.sessionId)}</h3><small>المراجع: {q.reviewer}</small></div><div className="quality-score">{score??'—'}<small>/100</small></div></div><div className="quality-chart">{weightLabels.map(w=><div key={w.key}><span>{w.label}</span><Progress value={Number(q[w.key]||0)} max={5}/><b>{q[w.key]??'—'}/5</b></div>)}</div><blockquote>{q.note||'لا توجد ملاحظة تفسيرية'}</blockquote><div className="card-actions"><Button variant="outline" icon={Pencil} onClick={()=>begin('quality',{},q.id)}>تحديث المراجعة</Button></div></div>})}{!data.quality.length&&<div className="span-all"><Empty title="لم تُراجع جودة أي حصة" desc="ابدأ بمراجعة حصة منفذة ثم حدد جوانب التحسين" button="مراجعة حصة" onClick={()=>begin('quality')}/></div>}</div>:<div className="cards three">{weightLabels.map((w,i)=><div className="feature-card rubric-card" key={w.key}><span className="rubric-number">0{i+1}</span><h3>{w.label}</h3><p>{w.desc}</p><b>الوزن المقترح: {w.weight}%</b></div>)}</div>}
        </>}
        {page==='players'&&<>
          <SectionHeader eyebrow="ATHLETE IDENTITY & COHORTS" title="ملفات اللاعبين" desc="الملف المرجعي داخل الأكاديمية، مرتبط بالحضور والتقييمات وخطط التطوير، دون ادعاء اعتماد هوية رياضية خارج النظام." actions={<Button icon={UserRoundPlus} onClick={()=>begin('players')}>تسجيل لاعب</Button>}/>
          <div className="two-col"><section className="panel"><div className="filterbar"><div className="searchbox"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث عن لاعب..."/></div><select value={cohortFilter} onChange={e=>setCohortFilter(e.target.value)}><option>الكل</option>{cohorts.map(c=><option key={c}>{c}</option>)}</select></div><div className="player-rows">{filteredPlayers.map(p=><button key={p.id} className={`player-choice ${selectedPlayer===p.id?'selected':''}`} onClick={()=>setSelectedPlayer(p.id)}><div className="big-avatar">{avatar(p.name)}</div><div><strong>{p.name}</strong><small>{p.cohort} · {p.position}</small></div>{p.guardianConsent?<ShieldCheck color="#c8ff35" size={17}/>:<CircleAlert color="#f5b75d" size={17}/>}<ChevronLeft size={15}/></button>)}{!filteredPlayers.length&&<Empty title="لا يوجد لاعبون" desc="غير الفئة أو سجّل لاعبًا جديدًا"/>}</div></section><section className="panel">{player?<><div className="profile-top"><div className="profile-avatar">{avatar(player.name)}</div><div><div className="kicker">PLAYER RECORD</div><h2>{player.name}</h2><p>{player.cohort} · {player.position}</p></div></div><div className="profile-facts"><div><small>سنة الميلاد</small><b>{player.birthYear}</b></div><div><small>التقييمات</small><b>{playerEval.length}</b></div><div><small>خطط التطوير</small><b>{playerPlans.length}</b></div></div><div className="consent-row"><ShieldCheck size={22}/><div><strong>موافقة ولي الأمر</strong><small>{player.guardianConsent?'تسجيل إداري يستوجب التحقق قبل المشاركة الخارجية':'غير مسجلة — لا يمكن ترشيح اللاعب'}</small></div><Chip tone={player.guardianConsent?'lime':'orange'}>{player.guardianConsent?'مسجلة':'مطلوبة'}</Chip></div><div className="profile-domain"><h3>أحدث ملاحظات اللاعب</h3>{playerEval.slice(-4).map(e=><div className="eval-line" key={e.id}><b>{e.domain}</b><span>{e.score}/5</span></div>)}{!playerEval.length&&<p className="muted">لا توجد تقييمات بعد.</p>}</div><div className="card-actions"><Button icon={BarChart3} variant="outline" onClick={()=>go('development')}>تقييم شامل</Button><Button variant="outline" icon={Pencil} onClick={()=>begin('players',{},player.id)}>تعديل الملف</Button></div></>:<Empty title="اختر لاعبًا" desc="ستظهر هنا بياناته وخططه"/>}</section></div>
        </>}
        {page==='exposure'&&<>
          <SectionHeader eyebrow="TRAINING EXPOSURE" title="قياس جرعة التدريب" desc="نسجل الوقت الفعلي وفرص الممارسة والقرارات المناسبة. بيانات الإدخال يدويّة وليست نتائج رؤية حاسوبية." actions={<Button icon={Plus} onClick={()=>begin('exposures')}>تسجيل جرعة لاعب</Button>}/>
          <div className="metric-grid smaller"><Metric label="سجلات التدريب" value={data.exposures.length} note="حصة × لاعب" icon={Activity}/><Metric label="دقائق ممارسة فعلية" value={data.exposures.reduce((a,b)=>a+Number(b.activeMinutes||0),0)} note="ملاحظات بشرية" icon={Clock3}/><Metric label="محاولات مرصودة" value={data.exposures.reduce((a,b)=>a+Number(b.attempts||0),0)} note="تحتاج تعريفًا ثابتًا للمحاولة" icon={Flag}/><Metric label="القرارات المناسبة" value={`${pct(data.exposures.reduce((a,b)=>a+Number(b.successful||0),0),data.exposures.reduce((a,b)=>a+Number(b.attempts||0),0))??'—'}%`} note="مقام محدود بالعينة المسجلة" icon={CheckCircle2}/></div>
          <section className="panel"><div className="panel-heading"><h2>سجلات القياس</h2><Button variant="outline" icon={Download} onClick={()=>csvExport(data.exposures,'training_exposure')}>تصدير CSV</Button></div>{showRow('exposures',data.exposures,[{key:'playerId',title:'اللاعب',render:r=>getName('players',r.playerId)},{key:'sessionId',title:'الحصة',render:r=>getName('sessions',r.sessionId)},{key:'activeMinutes',title:'الدقائق الفعلية'},{key:'attempts',title:'محاولات'},{key:'successful',title:'مناسبة'},{key:'touches',title:'لمسات'}],'سجّل وقت الممارسة بعد تنفيذ الجلسة')}</section>
        </>}
        {page==='development'&&<>
          <SectionHeader eyebrow="PLAYER DEVELOPMENT INTELLIGENCE" title="التقييم الشامل وخطط التطوير" desc="12 مجالًا لتحليل الرياضي، وتقييمات بشرية مرتبطة بسياقها. تتبع تطور المهارة عبر الزمن بدل اختزال اللاعب في درجة واحدة." actions={<><Button variant="outline" icon={Plus} onClick={()=>begin('evaluations')}>تقييم لاعب</Button><Button icon={Target} onClick={()=>begin('plans')}>خطة تطوير</Button></>}/>
          <div className="player-selector"><div className="person"><div className="mini-avatar">{avatar(player?.name||'لاعب')}</div><strong>اختر اللاعب</strong></div><select value={selectedPlayer} onChange={e=>setSelectedPlayer(e.target.value)}>{data.players.map(p=><option key={p.id} value={p.id}>{p.name} · {p.cohort}</option>)}</select><Chip tone="orange">تقييم مدرب غير تشخيصي</Chip></div>
          <div className="domain-grid">{domains.map((d,i)=>{const found=[...playerEval].reverse().find(e=>e.domain===d);return <button className="domain-card" key={d} onClick={()=>begin('evaluations',{playerId:selectedPlayer,domain:d,score:found?.score||3})}><div className="domain-top"><span>{String(i+1).padStart(2,'0')}</span><Activity size={17}/></div><h3>{d}</h3>{found?<><div className="stars">{Array.from({length:5},(_,j)=><i className={j<Number(found.score)?'filled':''} key={j}/>)}</div><small>{found.note}</small></>:<><Chip>غير مقاس</Chip><small>إضافة ملاحظة بشرية</small></>}</button>})}</div>
          <section className="panel"><div className="panel-heading"><div><span className="kicker">INDIVIDUAL DEVELOPMENT PLANS</span><h2>خطط اللاعب: {player?.name||'—'}</h2></div><Button icon={Plus} variant="outline" onClick={()=>begin('plans',{playerId:selectedPlayer})}>خطة جديدة</Button></div>{playerPlans.length?<div className="plan-cards">{playerPlans.map(p=><div className="player-plan" key={p.id}><div className="player-plan-top"><Target size={21}/><Chip tone={p.status==='completed'?'lime':p.status==='paused'?'orange':'neutral'}>{p.status==='completed'?'مكتملة':p.status==='paused'?'متوقفة':'قيد العمل'}</Chip></div><h3>{p.title}</h3><p>{p.target}</p><div className="due"><Clock3 size={14}/> {maybeDate(p.dueDate)}</div><div className="card-actions"><Button variant="outline" icon={Check} onClick={()=>setStatus('plans',p.id,{status:p.status==='completed'?'active':'completed'})}>{p.status==='completed'?'إعادة فتح':'اعتماد الاكتمال'}</Button><button className="icon-button" onClick={()=>begin('plans',{},p.id)} title="تعديل"><Pencil size={16}/></button></div></div>)}</div>:<Empty title="لا توجد خطط بعد" desc="حدد هدفًا ونقطة قياس ومتى تعيد الاختبار" button="خطة تطوير" onClick={()=>begin('plans',{playerId:selectedPlayer})}/>}</section>
        </>}
        {page==='coaches'&&<>
          <SectionHeader eyebrow="COACHING & TECHNICAL STAFF" title="الجهاز الفني والمدربون" desc="تعيين مسؤول الحصة وربط المدرب بالمناهج وتقارير الجودة. التقييم المبني على الملاحظة يحتاج اعتماد المدير الفني." actions={<Button icon={UserRoundPlus} onClick={()=>begin('coaches')}>إضافة مدرب</Button>}/>
          <div className="cards three">{data.coaches.map(c=><div className="coach-card" key={c.id}><div className="coach-head"><div className="coach-avatar">{avatar(c.name)}</div><Chip tone="lime">{c.role||'مدرب'}</Chip></div><h3>{c.name}</h3><p>{c.speciality||'تخصص غير محدد'}</p><div className="coach-sub"><GraduationCap size={17}/>{c.qualification||'مؤهل غير مدخل'}</div><div className="coach-count">{data.sessions.filter(s=>s.coachId===c.id).length} حصص مرتبطة بالمدرب</div><div className="card-actions"><Button variant="outline" icon={Pencil} onClick={()=>begin('coaches',{},c.id)}>تعديل</Button><Button variant="quiet" icon={ClipboardCheck} onClick={()=>{setSelectedCoach(c.id);go('quality')}}>مراجعة التدريب</Button></div></div>)}{!data.coaches.length&&<Empty title="لا يوجد مدربون" desc="سجّل الجهاز الفني أولًا" button="إضافة مدرب" onClick={()=>begin('coaches')}/>}</div><div className="info-banner muted-banner"><div><span className="kicker">COACH OBSERVATION</span><h2>جودة المدرب تُراجع بالسلوك والأدلة، لا بالانطباع.</h2><p>خطط الجلسات، نسبة تنفيذ الأهداف، توجيه اللاعبين، وتوصيات المدير الفني تُراجع في مساحة جودة التدريب. لا يوجد تصنيف آلي للمدربين.</p></div><Button variant="outline" icon={BarChart3} onClick={()=>go('quality')}>قياس الجودة</Button></div>
        </>}
        {page==='talent'&&<>
          <SectionHeader eyebrow="TALENT DISCOVERY & CONTROLLED SHARING" title="المواهب والفرص" desc="اكتشاف مبني على التطور والأدلة، وليس أعلى درجة مفردة. الترشيحات هنا مسودات داخلية وليست إرسالًا إلى كشّافين." actions={<Button icon={Plus} onClick={()=>begin('nominations')}>ترشيح موهبة</Button>}/>
          <div className="talent-path">{['ملف لاعب','ملاحظات موثقة','موافقة ولي الأمر','ترشيح داخلي','كشاف مخول لاحقًا'].map((n,i)=><div key={n}><span>0{i+1}</span><b>{n}</b>{i===4&&<small>غير مفعل</small>}</div>)}</div>
          <section className="panel"><div className="panel-heading"><h2>سجل الترشيحات الداخلية</h2><Chip tone="orange">لا مشاركة خارجية</Chip></div>{showRow('nominations',data.nominations,[{key:'playerId',title:'اللاعب',render:r=>getName('players',r.playerId)},{key:'target',title:'الجهة المحتملة'},{key:'reason',title:'المبرر الفني'},{key:'status',title:'الحالة',render:()=> <Chip tone="orange">مسودة</Chip>}],'لم يُنشأ أي ترشيح بعد')}</section>
        </>}
        {page==='evidence'&&<>
          <SectionHeader eyebrow="SPORTIX VISION / EVIDENCE LIBRARY" title="الفيديو والأدلة" desc="تخزين مقاطع قصيرة مُصرّح بها وربطها باللاعب والجلسة. لا يوجد تحليل رؤية حاسوبية مباشر أو قياس نفسي من الفيديو." actions={<Button icon={CloudUpload} onClick={()=>begin('evidence')}>رفع مقطع قصير</Button>}/>
          <div className="evidence-banner"><div><div className="kicker">VIDEO × HUMAN REVIEW</div><h2>من اللقطة إلى الملاحظة، ثم قرار المدرب.</h2><p>يُقبل الفيديو في الحساب المسجل بحد تجريبي 2 ميجابايت، ويظل خاصًا. تحتاج الميزات المتقدمة كاميرات ومعايرة وحقوق بيانات.</p><Button variant="outline" icon={Plus} onClick={()=>begin('evidence')}>إضافة فيديو دليل</Button></div><div className="video-bubble"><Play size={39}/><span>SPORTIX VISION</span></div></div>
          <section className="panel"><div className="panel-heading"><h2>مكتبة الأدلة</h2><Chip>{data.evidence.length} ملف</Chip></div>{data.evidence.length?<div className="evidence-list">{data.evidence.map(x=><div className="evidence-item" key={x.id}><div className="file-icon"><FileVideo2 size={22}/></div><div><strong>{x.title}</strong><small>{getName('players',x.playerId)} · {x.filename||'ملف فيديو'} · محفوظ بلا تحليل آلي</small></div><Button variant="outline" icon={Eye} onClick={()=>openEvidence(x)}>عرض</Button></div>)}</div>:<Empty title="لا توجد مقاطع محفوظة" desc="بعد تسجيل الدخول يمكنك حفظ أدلة فيديو صغيرة"/>}</section>
        </>}
        {page==='reports'&&<>
          <SectionHeader eyebrow="ACADEMY PERFORMANCE REPORTS" title="مؤشرات قابلة للتفسير" desc="لوحات تعتمد على السجلات الفعلية داخل مساحة الأكاديمية؛ أرقام العرض الافتراضية ليست نتائج عملاء أو نجاحًا مثبتًا." actions={<Button icon={Download} onClick={()=>csvExport(data.evaluations,'player_assessments')} variant="outline">تصدير تقييمات CSV</Button>}/>
          <div className="metric-grid"><Metric label="الحضور المسجل" value={attendancePct===null?'—':`${attendancePct}%`} note={`${data.attendance.length} قرارات حضور`} icon={UserRoundCheck}/><Metric label="متوسط جودة الحصة" value={qualityAvg===null?'—':`${qualityAvg}/100`} note="مراجعات بشرية فقط" icon={BarChart3}/><Metric label="تغطية المناهج" value={data.curricula.length} note="مناهج لفئات الأكاديمية" icon={BookOpen}/><Metric label="ملاحظات التطور" value={data.evaluations.length} note="12 مجالًا حسب الدليل" icon={TrendingUp}/></div>
          <div className="two-col"><section className="panel"><div className="panel-heading"><h2>توزيع التمارين حسب المحور</h2><Chip>{data.drills.length} تمرين</Chip></div><div className="report-bars">{Object.entries(focusCounts).sort((a,b)=>b[1]-a[1]).map(([f,n])=><div key={f}><div><span>{f}</span><b>{n} تمرين</b></div><Progress value={n} max={Math.max(1,...Object.values(focusCounts))}/></div>)}{!data.drills.length&&<Empty title="لا توجد تمارين" desc="أضف تمارين لتظهر التغطية"/>}</div></section><section className="panel"><div className="panel-heading"><h2>البرنامج حسب الحالة</h2><Chip>Training coverage</Chip></div><div className="report-status">{[{label:'حصص منفذة',n:doneSessions.length,total:data.sessions.length},{label:'خطط مكتملة',n:data.plans.filter(p=>p.status==='completed').length,total:data.plans.length},{label:'لاعبون مُقيّمون',n:new Set(data.evaluations.map(x=>x.playerId)).size,total:data.players.length},{label:'حصص مراجعَة الجودة',n:data.quality.length,total:data.sessions.length}].map(r=><div key={r.label}><div><b>{r.label}</b><span>{r.n} / {r.total}</span></div><Progress value={r.n} max={r.total||1}/></div>)}</div></section></div>
          <div className="ai-report-shortcuts"><Button icon={Sparkles} onClick={()=>go('aiAdvisor')}>مستشار التدريب الذكي</Button><Button variant="outline" icon={TrendingUp} onClick={()=>go('aiDevelopment')}>تقرير تطور اللاعب الذكي</Button></div>
          <div className="export-row"><Button icon={Download} variant="outline" onClick={()=>csvExport(data.sessions,'sessions')}>تصدير الجلسات</Button><Button icon={Download} variant="outline" onClick={()=>csvExport(data.quality,'quality')}>تصدير الجودة</Button><Button icon={Download} variant="outline" onClick={()=>csvExport(data.players,'players')}>تصدير اللاعبين</Button></div>
        </>}
        {page==='aiAdvisor'&&<AiWorkspaces mode="advisor" demo={demo} players={data.players} sessions={data.sessions} quality={data.quality} evaluations={data.evaluations} plans={data.plans} exposures={data.exposures} onLogin={login} openPage={go}/>}
        {page==='aiDevelopment'&&<AiWorkspaces mode="development" demo={demo} players={data.players} sessions={data.sessions} quality={data.quality} evaluations={data.evaluations} plans={data.plans} exposures={data.exposures} onLogin={login} openPage={go} initialPlayerId={selectedPlayer}/>}
        {page==='governance'&&<>
          <SectionHeader eyebrow="SPORTIX GOVERNANCE & CONFIGURATION" title="الحوكمة وإعدادات الأكاديمية" desc="صلاحيات الوصول، موافقات الناشئين، مصدر القياسات، وسجل الإجراءات: متطلبات أساسية قبل الاستخدام المؤسسي الفعلي." actions={<Chip tone="orange">تشغيل تجريبي</Chip>}/>
          <div className="two-col"><section className="panel"><div className="panel-heading"><h2>بيانات الأكاديمية</h2><Settings size={19}/></div><div className="settings-form"><label>اسم الأكاديمية<input value={settingsDraft?.name??data.academy.name} onChange={e=>setSettingsDraft(v=>({name:e.target.value,city:v?.city??data.academy.city}))}/></label><label>المدينة<input value={settingsDraft?.city??data.academy.city} onChange={e=>setSettingsDraft(v=>({name:v?.name??data.academy.name,city:e.target.value}))}/></label><label>الرياضة<input readOnly value="كرة القدم"/></label><Button icon={Check} disabled={busy} onClick={saveAcademy}>حفظ الإعدادات</Button></div></section><section className="panel"><div className="panel-heading"><h2>حالة الحماية</h2><ShieldCheck size={20}/></div><div className="governance-lines"><div><CheckCircle2 size={19}/><span>السجلات السحابية معزولة حسب حساب المستخدم</span></div><div><CheckCircle2 size={19}/><span>الترشيحات الداخلية بلا نشر آلي</span></div><div><CircleAlert size={19}/><span>موافقات ولي الأمر تحتاج توثيقًا قانونيًا مستقلًا</span></div><div><CircleAlert size={19}/><span>أدوار الموظفين والفرق والمؤسسات غير مفعلة إنتاجيًا</span></div><div><CircleAlert size={19}/><span>تقييمات الحسّاسات والرؤية الحاسوبية تحتاج اعتمادًا واختبار دقة</span></div></div></section></div>
          <section className="panel"><div className="panel-heading"><div><span className="kicker">20 ACADEMY MODULES</span><h2>خريطة الوحدات المعتمدة</h2></div></div><div className="modules-table">{moduleRows.map(([code,title,status])=><div key={code}><span>{code}</span><b>{title}</b><Chip tone={status==='تشغيلي'?'lime':status==='تطوير لاحق'?'neutral':'orange'}>{status}</Chip></div>)}</div></section><section className="panel"><div className="panel-heading"><h2>سجل العمليات المتاح</h2><Chip>ليس سجل تدقيق نهائيًا</Chip></div><div className="activity-list">{data.activity.slice(0,8).map(a=><div key={a.id}><span><Clock3 size={16}/>{maybeDate(a.createdAt)}</span><strong>{a.action}</strong><small>{a.kind} · {a.objectId}</small></div>)}{!data.activity.length&&<p className="muted">لا توجد عمليات مسجلة بعد.</p>}</div></section>
        </>}
      </main>
    </div>
    {notice&&<div role="status" className="toast"><CircleAlert size={18}/>{notice}<button onClick={()=>setNotice('')}><X size={17}/></button></div>}
    {form&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setForm(null)}}><div className="modal" role="dialog" aria-modal="true" aria-label={`${form.id?'تعديل':'إضافة'} ${titles[form.kind]}`}><div className="modal-header"><div><div className="kicker">SPORTIX WORKSPACE</div><h2>{form.id?'تعديل':'إضافة'} {titles[form.kind]}</h2></div><button className="icon-button" title="إغلاق" onClick={()=>setForm(null)}><X size={20}/></button></div><div className="modal-body"><div className="form-grid">{(fields[form.kind]||[]).map(f=><label key={f.key} className={`${f.wide?'wide':''} ${f.type==='checkbox'?'checkbox-label':''}`}><span>{f.label}{f.required&&<em> *</em>}</span>{f.type==='textarea'?<textarea value={String(form.values[f.key]??'')} onChange={e=>updateForm(f.key,e.target.value)} placeholder={f.placeholder||'أدخل التفاصيل'} rows={3}/>:f.type==='select'?<select value={String(form.values[f.key] ?? (typeof f.options?.[0] === 'string' ? f.options[0] : (f.options?.[0] as {value?:string})?.value) ?? '')} onChange={e=>updateForm(f.key,e.target.value)}>{(f.options||[]).map(o=>{const obj=typeof o==='string'?{value:o,label:o}:o;return <option key={obj.value} value={obj.value}>{obj.label}</option>})}</select>:f.type==='multi'?<div className="multi-options">{(f.options||[]).map(o=>{const obj=typeof o==='string'?{value:o,label:o}:o;const values=Array.isArray(form.values[f.key])?form.values[f.key]:[];return <label key={obj.value}><input type="checkbox" checked={values.includes(obj.value)} onChange={e=>updateForm(f.key,e.target.checked?[...values,obj.value]:values.filter((x:string)=>x!==obj.value))}/>{obj.label}</label>})}</div>:f.type==='checkbox'?<input type="checkbox" checked={form.values[f.key]===true} onChange={e=>updateForm(f.key,e.target.checked)}/>:<input type={f.type||'text'} value={String(form.values[f.key]??'')} min={f.min} max={f.max} placeholder={f.placeholder||''} onChange={e=>updateForm(f.key,f.type==='number'?e.target.value:e.target.value)}/ >}{f.hint&&<small className="form-hint">{f.hint}</small>}</label>)}{form.kind==='evidence'&&<label className="wide"><span>ملف الفيديو (حتى 2MB) *</span><input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e=>setFile(e.target.files?.[0]||null)}/><small className="form-hint">لا يرفع في العرض التجريبي. تخزين خاص بالحساب عند تسجيل الدخول.</small></label>}</div></div><div className="modal-bottom"><Button variant="outline" onClick={()=>setForm(null)}>إلغاء</Button><Button icon={Check} disabled={busy||(form.kind==='evidence'&&demo)} onClick={saveForm}>{busy?'جارٍ الحفظ...':'حفظ السجل'}</Button></div></div></div>}
  </div>;
}
export default App;
