import type { Config } from '@netlify/functions';
import { getUser } from '@netlify/identity';
import { getDatabase } from '@netlify/database';
import { getStore } from '@netlify/blobs';
import OpenAI from 'openai';

export const config: Config = {
  path: ['/api/_healthcheck', '/api/academy/v2/*'],
  rateLimit: { action: 'rate_limit', aggregateBy: 'ip', windowSize: 60, windowLimit: 120 },
};

type Data = Record<string, unknown>;
type Account = { id: string; email?: string };
const KINDS = [
  'players', 'coaches', 'curricula', 'drills', 'sessions', 'attendance',
  'exposures', 'quality', 'evaluations', 'plans', 'nominations', 'evidence',
] as const;
type Kind = (typeof KINDS)[number];
const names = [
  'الفني', 'البدني', 'التكتيكي', 'القرارات', 'الأداء الذهني المرصود',
  'علم النفس الرياضي', 'الميكانيكا الحيوية', 'السلوك والقيادة',
  'الأحمال والجاهزية', 'ثبات الأداء', 'التطور طويل المدى', 'ملاءمة الدور',
];
const allowed: Record<Kind, string[]> = {
  players: ['name','birthYear','position','cohort','guardianConsent','notes','status'],
  coaches: ['name','role','speciality','qualification','phone','status'],
  curricula: ['title','cohort','cycle','objective','technicalFocus','tacticalFocus','physicalFocus','socialFocus','status'],
  drills: ['title','phase','focus','format','minutes','players','area','challenge','goal','successCriteria','coachCues'],
  sessions: ['title','date','cohort','coachId','objectives','drillIds','duration','venue','status','notes'],
  attendance: ['sessionId','playerId','status'],
  exposures: ['sessionId','playerId','activeMinutes','attempts','successful','touches','note'],
  quality: ['sessionId','reviewer','objectives','realism','opportunities','feedback','reflection','note','approved'],
  evaluations: ['playerId','domain','score','note','source','evidenceRef','evaluatedAt'],
  plans: ['playerId','title','target','baseline','targetValue','dueDate','status','coachNotes'],
  nominations: ['playerId','target','reason','status','sharedExternally'],
  evidence: ['playerId','sessionId','title','filename','contentType','sizeBytes','path','status'],
};
const numeric = new Set(['birthYear','minutes','players','duration','activeMinutes','attempts','successful','touches','objectives','realism','opportunities','feedback','reflection','score','baseline','targetValue','sizeBytes']);
const booleans = new Set(['guardianConsent','approved','sharedExternally']);
const text = (value: unknown, max = 300): string => typeof value === 'string' ? value.trim().slice(0, max) : '';
const obj = (v: unknown): Data => v && typeof v === 'object' && !Array.isArray(v) ? v as Data : {};
const failure = (msg: string, status = 400) => Response.json({ error: msg, message: msg }, { status });
class InputError extends Error {}
let db: ReturnType<typeof getDatabase> | undefined;

async function query<T = Data>(sql: string, params: unknown[] = []): Promise<T[]> {
  db ??= getDatabase();
  const result = await db.pool.query(sql, params);
  return result.rows as T[];
}
async function list(owner: string, kind: string, limit = 200): Promise<Data[]> {
  const rows = await query<{id:string;data:Data}>(
    'SELECT id,data FROM sportix_academy_records WHERE owner_id=$1 AND kind=$2 ORDER BY created_at DESC,id DESC LIMIT $3',
    [owner,kind,limit],
  );
  // Fetch the newest window, then retain chronological order for workspace consumers.
  return rows.reverse().map(({id,data}) => ({...obj(data),id}));
}
async function get(owner: string, kind: string, id: string): Promise<Data|null> {
  const [row] = await query<{id:string;data:Data}>(
    'SELECT id,data FROM sportix_academy_records WHERE owner_id=$1 AND kind=$2 AND id=$3 LIMIT 1',
    [owner,kind,id],
  );
  return row ? {...obj(row.data),id:row.id} : null;
}
async function write(owner:string,kind:string,id:string,data:Data): Promise<Data> {
  await query('INSERT INTO sportix_academy_records(owner_id,kind,id,data) VALUES ($1,$2,$3,$4::jsonb) ON CONFLICT(owner_id,kind,id) DO UPDATE SET data=EXCLUDED.data',
    [owner,kind,id,JSON.stringify(data)]);
  return {...data,id};
}
async function remove(owner:string,kind:string,id:string):Promise<boolean> {
  const rows=await query<{id:string}>('DELETE FROM sportix_academy_records WHERE owner_id=$1 AND kind=$2 AND id=$3 RETURNING id',[owner,kind,id]);
  return rows.length>0;
}
async function activity(owner:string,verb:string,kind:string,id:string) {
  try { await write(owner,'activity',crypto.randomUUID(),{verb,kind,objectId:id,createdAt:new Date().toISOString()}); }
  catch (e) { console.warn('Activity log failed',e); }
}
function sanitized(kind:Kind,body:unknown):Data {
  const src=obj(body),out:Data={};
  for(const field of allowed[kind]) {
    if(!Object.prototype.hasOwnProperty.call(src,field)) continue;
    if(numeric.has(field) && !(kind==='sessions' && field==='objectives')) {
      if(src[field]==='' || src[field]===null || src[field]===undefined) continue;
      const v=Number(src[field]);
      if(!Number.isFinite(v)) throw new InputError(`قيمة ${field} غير صالحة`);
      out[field]=v;
    } else if(booleans.has(field)) out[field]=src[field]===true;
    else if(field==='drillIds') out[field]=Array.isArray(src[field])?(src[field] as unknown[]).filter(v=>typeof v==='string').slice(0,15):[];
    else out[field]=text(src[field],['note','notes','coachCues','objective','objectives','target'].includes(field)?900:300);
  }
  return out;
}
function validate(kind:Kind,r:Data):string|null {
  if(kind==='players'&&(!text(r.name)||!Number.isInteger(Number(r.birthYear))||Number(r.birthYear)<1990||Number(r.birthYear)>new Date().getFullYear()-4)) return 'اسم اللاعب وسنة ميلاده الصحيحة مطلوبان';
  if(kind==='coaches'&&!text(r.name)) return 'اسم المدرب مطلوب';
  if(kind==='curricula'&&(!text(r.title)||!text(r.cohort)||!text(r.objective))) return 'عنوان المنهج والفئة والهدف مطلوبون';
  if(kind==='drills'&&(!text(r.title)||!text(r.goal))) return 'اسم التمرين وهدفه مطلوبان';
  if(kind==='sessions'&&(!text(r.title)||!/^\d{4}-\d{2}-\d{2}$/.test(text(r.date))||!text(r.objectives))) return 'عنوان الحصة وتاريخها وأهدافها مطلوبة';
  if(kind==='sessions'&&(!Number.isFinite(Number(r.duration))||Number(r.duration)<1||Number(r.duration)>360)) return 'مدة الحصة يجب أن تكون من 1 إلى 360 دقيقة';
  if(kind==='attendance'&&(!text(r.playerId)||!text(r.sessionId)||!['present','absent','excused'].includes(text(r.status)))) return 'حالة الحضور غير صحيحة';
  if(kind==='exposures'&&(!text(r.playerId)||!text(r.sessionId)||!['activeMinutes','attempts','successful','touches'].every(k=>typeof r[k]==='number' && Number.isFinite(r[k]) && Number(r[k])>=0)||Number(r.successful)>Number(r.attempts))) return 'بيانات الجرعة التدريبية غير صحيحة';
  if(kind==='quality'&&(!text(r.sessionId)||!text(r.reviewer)||!['objectives','realism','opportunities','feedback','reflection'].every(k=>Number.isInteger(Number(r[k]))&&Number(r[k])>=0&&Number(r[k])<=5))) return 'حدد جلسة ومراجعًا ودرجات المحاور الخمسة من صفر إلى خمسة';
  if(kind==='evaluations'&&(!text(r.playerId)||!names.includes(text(r.domain))||!Number.isInteger(Number(r.score))||Number(r.score)<1||Number(r.score)>5||!text(r.note))) return 'اختر اللاعب والمجال والدرجة والملاحظة';
  if(kind==='plans'&&(!text(r.playerId)||!text(r.title)||!text(r.target))) return 'اللاعب وهدف التطوير ومعيار القياس مطلوبون';
  if(kind==='nominations'&&(!text(r.playerId)||!text(r.target))) return 'اللاعب والجهة المقترحة مطلوبان';
  return null;
}
function qualityScore(v:Data):number {
  return Math.round((Number(v.objectives)*30+Number(v.realism)*25+Number(v.opportunities)*20+Number(v.feedback)*15+Number(v.reflection)*10)/5);
}
async function checkRelated(owner:string,kind:Kind,r:Data):Promise<string|null> {
  if(['attendance','exposures','evaluations','plans','nominations','evidence'].includes(kind)&&!await get(owner,'players',text(r.playerId))) return 'لاعب غير موجود في حساب الأكاديمية';
  if(['attendance','exposures','quality'].includes(kind)&&!await get(owner,'sessions',text(r.sessionId))) return 'الحصة غير موجودة';
  if(kind==='sessions'&&r.coachId&&!await get(owner,'coaches',text(r.coachId))) return 'المدرب غير مسجل';
  if(kind==='sessions'&&Array.isArray(r.drillIds)) {
    for(const id of r.drillIds) if(!await get(owner,'drills',String(id))) return 'أحد التمارين المحددة غير موجود';
  }
  if(kind==='nominations') {
    const player=await get(owner,'players',text(r.playerId));
    if(player?.guardianConsent!==true) return 'تحتاج موافقة ولي الأمر قبل إعداد مسودة ترشيح الناشئ';
  }
  return null;
}
async function jsonBody(req:Request):Promise<Data> {
  const type=req.headers.get('content-type')||'';
  if(!type.includes('application/json')) throw new InputError('يجب إرسال البيانات بصيغة JSON');
  try { return obj(await req.json()); } catch { throw new InputError('بيانات JSON غير صالحة'); }
}
const redacted=(v:unknown, names:string[]):string=>{
  let s=text(v,250).replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,'[محجوب]').replace(/(?:\+?966|0)5\d{8}/g,'[محجوب]');
  for(const name of names) if(name.length>2) s=s.split(name).join('[لاعب]');
  return s;
};
const AI_POLICY='أنت مستشار رياضي في SPORTIX ACADEMY. استخدم فقط حقائق سجلات JSON. لا تختلق أرقامًا أو تحسنًا أو أدلة، ولا تستنتج تشخيصًا طبيًا أو نفسيًا من الفيديو. لا تحكم نهائيًا على مواهب الأطفال. افصل ملاحظات المدرب عن القياسات الموضوعية، واذكر حدود البيانات والعينات الصغيرة. كل النتائج مسودة للمراجعة البشرية. الرد بالعربية.';
async function generateAi(prompt:string):Promise<string> {
  if(!process.env.OPENAI_BASE_URL && !process.env.OPENAI_API_KEY) throw new Error('NETLIFY_AI_UNCONFIGURED');
  const client=new OpenAI({ timeout: 40_000, maxRetries: 0 });
  const model=process.env.SPORTIX_AI_MODEL||'gpt-6.1-sol';
  const reply=await client.chat.completions.create({
    model,
    max_completion_tokens:1800,
    messages:[{role:'system',content:AI_POLICY},{role:'user',content:prompt}],
  });
  return reply.choices[0]?.message?.content?.trim()||'';
}
async function saveReport(owner:string,report:Data):Promise<Data> {
  const id=crypto.randomUUID();
  const result=await write(owner,'ai_reports',id,{...report,createdAt:new Date().toISOString(),status:'draft_for_human_review'});
  await activity(owner,'create','ai_reports',id);
  return result;
}
async function aiAdvisor(owner:string,b:Data):Promise<Response> {
  const cohort=text(b.cohort)||'الكل';
  const permitted=['الكل','تحت 9','تحت 11','تحت 13','تحت 15','تحت 17','تحت 19','الفريق الأول'];
  if(!permitted.includes(cohort))return failure('الفئة المحددة غير مدعومة');
  const [sessions,quality,exposures,drills]=await Promise.all(['sessions','quality','exposures','drills'].map(kind=>list(owner,kind)));
  const selected=sessions.filter(s=>cohort==='الكل'||s.cohort===cohort).slice(-40), ids=new Set(selected.map(s=>s.id));
  const ratings=quality.filter(q=>ids.has(q.sessionId)).slice(-40),xp=exposures.filter(e=>ids.has(e.sessionId)).slice(-80);
  if(!selected.length)return failure('لا توجد حصص لهذه الفئة. أنشئ جلسة أولًا.',422);
  if(!ratings.length&&!xp.length)return failure('سجل مراجعة جودة أو جرعة تدريب أولًا حتى يكون لدى المستشار أدلة.',422);
  const facts={cohort,sessionCount:selected.length,completed:selected.filter(s=>s.status==='completed').length,
    sessions:selected.map(s=>({id:s.id,date:s.date,minutes:s.duration,status:s.status,drillCount:Array.isArray(s.drillIds)?s.drillIds.length:0})),
    quality:ratings.map(q=>({sessionId:q.sessionId,score:q.score,objectives:q.objectives,realism:q.realism,opportunities:q.opportunities,feedback:q.feedback,reflection:q.reflection,source:'human_review'})),
    exposure:xp.map(e=>({sessionId:e.sessionId,activeMinutes:e.activeMinutes,attempts:e.attempts,successful:e.successful,source:'human_observation'})),
    drillFocusCounts:drills.reduce<Record<string,number>>((acc,d)=>{const f=text(d.focus);if(f)acc[f]=(acc[f]||0)+1;return acc;},{}),
    limitations:['الأوزان استرشادية خاصة بسبورتكس','الدرجات بشرية وليست نتيجة رؤية حاسوبية','الأعداد وحدها لا تثبت تحقق التعلم']};
  try {
    const result=await generateAi(`حلل هذه السجلات فقط وفق 5 أقسام: ملخص بالأعداد الصحيحة، أدلة داعمة بمعرفات الحصص، ثلاث أولويات للتحسين، الفجوات والحدود، قائمة تحقق للمدير الفني. لا تستنتج علاقة سببية. JSON:\n${JSON.stringify(facts)}`);
    if(result.length<40)return failure('لم ينتج تقرير كافٍ؛ أعد المحاولة.',503);
    return Response.json(await saveReport(owner,{type:'training_advisor',text:result,evidenceCount:ratings.length+xp.length,scope:cohort}));
  } catch(e) { console.warn('Advisor request unavailable',e);return failure('لم تتوفر خدمة الذكاء الاصطناعي؛ تحقق من Netlify AI Gateway والرصيد.',503);}
}
async function aiPlayer(owner:string,b:Data):Promise<Response> {
  const playerId=text(b.playerId,100);
  if(!playerId)return failure('اختر لاعبًا');
  const player=await get(owner,'players',playerId);
  if(!player)return failure('اللاعب غير موجود ضمن الحساب',404);
  const [evaluations,plans,exposures,people]=await Promise.all(['evaluations','plans','exposures','players'].map(kind=>list(owner,kind)));
  const ev=evaluations.filter(e=>e.playerId===playerId).slice(-40), pl=plans.filter(p=>p.playerId===playerId).slice(-30), xp=exposures.filter(x=>x.playerId===playerId).slice(-40);
  if(!ev.length&&!pl.length&&!xp.length)return failure('أضف تقييمًا أو خطة تطوير أو جرعة تدريب أولًا',422);
  const names=people.map(p=>text(p.name,100)).filter(Boolean);
  const withNotes=b.includeNotes===true;
  const facts={athlete:'اللاعب المحدد',cohort:player.cohort,position:player.position,
    evaluations:ev.map(e=>({id:e.id,domain:e.domain,score:e.score,date:e.evaluatedAt||e.createdAt,source:'human_review',...(withNotes?{note:redacted(e.note,names)}:{})})),
    plans:pl.map(p=>({id:p.id,status:p.status,dueDate:p.dueDate,baseline:p.baseline??null,targetValue:p.targetValue??null,...(withNotes?{goal:redacted(p.title,names),target:redacted(p.target,names)}:{})})),
    exposure:xp.map(x=>({id:x.id,activeMinutes:x.activeMinutes,attempts:x.attempts,successful:x.successful,source:'human_observation'})),
    limitations:['لا توجد قياسات كاميرات أو حساسات متحققة','لا تصنيف نهائي أو تشخيص','لا إثبات تحسن دون اختبارين متكافئين']};
  try {
    const result=await generateAi(`أنتج تقرير تطور اللاعب من JSON فقط: الأدلة المتوفرة، أولويات فنية موثقة بالمعرفات، خطة عمل أسبوعية مقترحة، اختبار إعادة قياس، الثغرات. إذا لم ترسل ملاحظات المدرب صرح بذلك. لا تذكر اسمه أو عمره. JSON:\n${JSON.stringify(facts)}`);
    if(result.length<40)return failure('لم ينتج التقرير محتوى كافيًا',503);
    return Response.json(await saveReport(owner,{type:'player_development',text:result,evidenceCount:ev.length+pl.length+xp.length,scope:'athlete_record',playerId}));
  } catch(e) { console.warn('Player report unavailable',e);return failure('تعذر توليد التقرير؛ تحقق من خدمة الذكاء الاصطناعي.',503);}
}

async function handleRequest(req:Request):Promise<Response> {
  const path=new URL(req.url).pathname;
  if(path==='/api/_healthcheck') {
    try {
      await query('SELECT 1 FROM sportix_academy_records LIMIT 0');
      return Response.json({ok:true,product:'SPORTIX ACADEMY OS',database:'ready',aiConfigured:Boolean(process.env.OPENAI_API_KEY)});
    } catch {
      return Response.json({ok:false,product:'SPORTIX ACADEMY OS',database:'unavailable'}, {status:503});
    }
  }
  if(!['GET','POST','PUT','DELETE'].includes(req.method)) return failure('طريقة الطلب غير مدعومة',405);
  if(req.method!=='GET') {
    const origin=req.headers.get('origin');
    if(!origin || origin!==new URL(req.url).origin) return failure('مصدر الطلب غير مسموح',403);
  }
  let user:Account|null=null;
  try {const verified=await getUser(); if(verified)user={id:verified.id,email:verified.email??undefined};}
  catch(e){console.warn('Identity verification unavailable',e);}
  if(!user)return failure('يجب تسجيل الدخول إلى Netlify Identity قبل الوصول إلى سجلات الأكاديمية.',401);
  const owner=user.id, method=req.method.toUpperCase();
  try {
    if(path==='/api/academy/v2/bootstrap'&&method==='GET') {
      const all=await Promise.all([...KINDS,'settings','activity'].map(k=>list(owner,k)));
      const result=Object.fromEntries([...KINDS,'settings','activity'].map((k,i)=>[k,all[i]]));
      const profile=all[KINDS.length].find(v=>v.id==='profile');
      return Response.json({...result,academy:profile||{name:'أكاديمية SPORTIX',city:'جدة',sport:'كرة القدم'}});
    }
    if(path==='/api/academy/v2/settings'&&method==='PUT') {
      const b=await jsonBody(req); const name=text(b.name,100),city=text(b.city,100);
      if(!name)return failure('اسم الأكاديمية مطلوب');
      const record=await write(owner,'settings','profile',{name,city,sport:'كرة القدم',updatedAt:new Date().toISOString()});
      await activity(owner,'update','settings','profile');
      return Response.json(record);
    }
    if(path==='/api/academy/v2/ai/history'&&method==='GET') {
      const rows=await list(owner,'ai_reports',60);
      return Response.json({items:rows.reverse().slice(0,20)});
    }
    if(path==='/api/academy/v2/ai/training-advisor'&&method==='POST')return aiAdvisor(owner,await jsonBody(req));
    if(path==='/api/academy/v2/ai/player-report'&&method==='POST')return aiPlayer(owner,await jsonBody(req));
    if(path==='/api/academy/v2/evidence/upload'&&method==='POST') {
      const b=await jsonBody(req),title=text(b.title,120),playerId=text(b.playerId,100),sessionId=text(b.sessionId,100);
      const filename=text(b.filename,130),mime=text(b.contentType,50),content=typeof b.content==='string'?b.content:'';
      if(!title||!playerId||!filename||!content)return failure('عنوان الدليل واللاعب والملف مطلوبة');
      if(!['video/mp4','video/webm','video/quicktime'].includes(mime)||content.length>2800000)return failure('يدعم هذا الإصدار مقاطع فيديو لا تتجاوز 2MB');
      if(!await get(owner,'players',playerId))return failure('اللاعب غير موجود');
      if(sessionId&&!await get(owner,'sessions',sessionId))return failure('الجلسة غير موجودة');
      const id=crypto.randomUUID(),key=`${owner}/${id}`;
      const bytes=Uint8Array.from(Buffer.from(content,'base64'));
      await getStore('academy-evidence').set(key,new Blob([bytes],{type:mime}));
      const record=await write(owner,'evidence',id,{title,playerId,sessionId,filename,contentType:mime,sizeBytes:bytes.length,path:key,status:'stored_unanalysed',createdAt:new Date().toISOString()});
      await activity(owner,'upload','evidence',id);
      return Response.json(record,{status:201});
    }
    const fileMatch=path.match(/^\/api\/academy\/v2\/evidence\/([^/]+)\/(?:file|url)$/);
    if(fileMatch&&method==='GET') {
      const id=decodeURIComponent(fileMatch[1]); const rec=await get(owner,'evidence',id);
      if(!rec)return failure('الدليل غير موجود',404);
      if(path.endsWith('/url'))return Response.json({url:`/api/academy/v2/evidence/${encodeURIComponent(id)}/file`});
      const blob=await getStore('academy-evidence').get(text(rec.path,500),{type:'blob'});
      if(!blob)return failure('الملف غير متاح',404);
      return new Response(blob,{headers:{'content-type':text(rec.contentType,80)||'application/octet-stream','content-disposition':`inline; filename="${text(rec.filename,120).replace(/"/g,'')}"`,'cache-control':'private, no-store'}});
    }
    const route=path.match(/^\/api\/academy\/v2\/records\/([^/]+)(?:\/([^/]+))?$/);
    if(route) {
      const kind=route[1] as Kind,id=route[2]?decodeURIComponent(route[2]):null;
      if(!KINDS.includes(kind))return failure('نوع السجل غير مدعوم',404);
      if(kind==='evidence')return failure('تخزين الأدلة يتطلب مسار الرفع المخصص',403);
      if(method==='POST'&&!id) {
        const rec=sanitized(kind,await jsonBody(req));
        const issue=validate(kind,rec)||await checkRelated(owner,kind,rec);
        if(issue)return failure(issue);
        const now=new Date().toISOString();
        if(kind==='nominations') {rec.status='draft';rec.sharedExternally=false;}
        if(kind==='evaluations') {rec.source='human_review';rec.evaluatedAt=now;}
        if(kind==='quality') {rec.approved=false;rec.score=qualityScore(rec);}
        const stable=kind==='quality'?text(rec.sessionId):['attendance','exposures'].includes(kind)?`${rec.sessionId}-${rec.playerId}`:crypto.randomUUID();
        const saved=await write(owner,kind,stable,{...rec,createdAt:now,updatedAt:now});
        await activity(owner,'create',kind,stable);
        return Response.json(saved,{status:201});
      }
      if(method==='PUT'&&id) {
        const previous=await get(owner,kind,id);
        if(!previous)return failure('السجل غير موجود',404);
        const changes=sanitized(kind,await jsonBody(req));
        const stableFields=kind==='quality'?['sessionId']:['attendance','exposures'].includes(kind)?['playerId','sessionId']:[];
        if(stableFields.some(key=>changes[key]!==undefined&&changes[key]!==previous[key])) return failure('لا يمكن تغيير ربط سجل قائم؛ أنشئ سجلًا للحصة واللاعب المطلوبين',409);
        if(kind==='nominations') {changes.status='draft';changes.sharedExternally=false;}
        const next={...previous,...changes};
        if(kind==='quality') {next.score=qualityScore(next);next.approved=false;}
        const issue=validate(kind,next)||await checkRelated(owner,kind,next);
        if(issue)return failure(issue);
        const saved=await write(owner,kind,id,{...next,updatedAt:new Date().toISOString()});
        await activity(owner,'update',kind,id);
        return Response.json(saved);
      }
      if(method==='DELETE'&&id) {
        if(['quality','attendance'].includes(kind))return failure('حذف هذا السجل غير متاح',403);
        if(kind==='players') {
          const linked=await query('SELECT id FROM sportix_academy_records WHERE owner_id=$1 AND data->>\'playerId\'=$2 LIMIT 1',[owner,id]);
          if(linked.length)return failure('اللاعب مرتبط بسجلات أخرى؛ أوقف نشاطه بدل الحذف',409);
        }
        if(kind==='sessions'||kind==='coaches'||kind==='drills') {
          const sql=kind==='sessions'?"SELECT id FROM sportix_academy_records WHERE owner_id=$1 AND data->>'sessionId'=$2 LIMIT 1":kind==='coaches'?"SELECT id FROM sportix_academy_records WHERE owner_id=$1 AND kind='sessions' AND data->>'coachId'=$2 LIMIT 1":"SELECT id FROM sportix_academy_records WHERE owner_id=$1 AND kind='sessions' AND (data->'drillIds') ? $2 LIMIT 1";
          if((await query(sql,[owner,id])).length) return failure('السجل مرتبط بسجلات أخرى ولا يمكن حذفه',409);
        }
        if(!await remove(owner,kind,id))return failure('السجل غير موجود',404);
        await activity(owner,'delete',kind,id);
        return Response.json({deleted:true});
      }
    }
    return failure('هذا المسار غير موجود',404);
  } catch(e) {
    if(e instanceof InputError) return failure(e.message);
    console.error('Academy request failure',e instanceof Error?e.name:'UnknownError');
    return failure('تعذر إتمام العملية على الخادم؛ راجع إعدادات Netlify Identity وDatabase.',503);
  }
}

export default async function handler(req:Request):Promise<Response> {
  const response=await handleRequest(req);
  response.headers.set('Cache-Control','private, no-store');
  response.headers.set('X-Content-Type-Options','nosniff');
  return response;
}
