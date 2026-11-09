'use strict';
const $ = s => document.querySelector(s);
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={queued:'في الانتظار',running:'جارٍ التشغيل',passed:'ناجح',failed:'فشل',cancelled:'ملغي',interrupted:'توقف قبل الاكتمال'};
let state={projects:[],runs:[],runner:{active:0,queued:0}},view='dashboard',filter='all',signature='',firstLoad=true,selectedRun=null,checkSeq=0;
function date(value){return value?new Date(value).toLocaleString('ar-SA',{dateStyle:'short',timeStyle:'short'}):'—';}
function badge(status){return '<span class="badge '+esc(status)+'">'+esc(labels[status]||'لم يُختبر')+'</span>';}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),5000);}
async function api(path,method='GET',data){
  const r=await fetch(path,{method,cache:'no-store',headers:{'Content-Type':'application/json','X-Rowaihy-Request':'1'},body:data===undefined?undefined:JSON.stringify(data)});
  const d=await r.json();if(!r.ok)throw Error(d.error||'تعذر إكمال العملية');return d;
}
async function refresh(){
  try{
    const d=await api('/api/state');state=d;$('#connection').textContent='● متصل محليًا';$('#connection').classList.remove('offline');
    const next=JSON.stringify(d);if(next!==signature){signature=next;render();if(selectedRun&&$('#run-dialog').open)renderRun(d.runs.find(x=>x.id===selectedRun));}
    firstLoad=false;
  }catch(error){
    $('#connection').textContent='● الاتصال متوقف';$('#connection').classList.add('offline');
    if(firstLoad)$('#main').innerHTML='<div class="empty"><h1>تعذر الاتصال بالخادم المحلي</h1><p>تأكد أن نافذة تشغيل ROWAIHY CONNECT ما زالت مفتوحة، ثم أعد المحاولة.</p><button class="button" data-action="refresh">إعادة المحاولة</button></div>';
  }
}
function latest(project){return state.runs.find(r=>r.projectId===project.id);}
function openRunFor(project){return state.runs.find(r=>r.projectId===project.id&&['running','queued'].includes(r.status));}
function projectCards(projects){
  if(!projects.length)return '<div class="empty"><div class="empty-icon" aria-hidden="true">▦</div><h2>ابدأ بمشروعك الأول.</h2><p>أضف رابط نسخة الاختبار، وحدد ما تتوقعه من كل صفحة أو واجهة API. يمكنك أيضًا تجربة فحص التطبيق المحلي نفسه.</p><div class="actions"><button class="button" data-action="new">+ إضافة مشروع</button><button class="button secondary" data-action="self">إضافة فحص ذاتي</button></div></div>';
  return '<div class="project-grid">'+projects.map(p=>{
    const r=latest(p),open=openRunFor(p);
    return '<article class="project-card"><div class="project-top"><div><h3>'+esc(p.name)+'</h3><span class="url">'+esc(p.baseUrl)+'</span></div><span class="project-symbol" aria-hidden="true">↗</span></div><p class="project-notes">'+esc(p.notes||'بيئة اختبار مستقلة')+'</p><div class="project-bottom"><div class="project-meta">'+p.checks.length+' فحص · '+(r?badge(r.status):badge('new'))+'</div><div class="actions">'+(open?'<button class="button secondary small" data-action="cancel" data-id="'+open.id+'">إلغاء التشغيل</button>':'<button class="button small" data-action="run" data-id="'+p.id+'">تشغيل الفحوصات</button>')+'<button class="text-button" data-action="edit" data-id="'+p.id+'">تعديل</button><button class="text-button" data-action="delete" data-id="'+p.id+'">حذف</button></div></div></article>';
  }).join('')+'</div>';
}
function runRows(runs){
  if(!runs.length)return '<div class="empty"><h2>سجل واضح لكل تجربة.</h2><p>شغّل فحوصات أحد مشاريعك لتظهر النتائج هنا، مع وقت التنفيذ وأسباب الفشل والتقرير القابل للتنزيل.</p></div>';
  return '<div class="runs-panel"><div class="table-scroll"><table><thead><tr><th>المشروع</th><th>الحالة</th><th>الفحوصات الناجحة</th><th>الوقت</th><th>التقرير</th></tr></thead><tbody>'+runs.map(r=>'<tr><td>'+esc(r.project.name)+'<span class="cell-sub">'+esc(r.project.baseUrl)+'</span></td><td>'+badge(r.status)+'</td><td>'+r.results.filter(x=>x.passed).length+' / '+r.project.checks.length+'</td><td>'+esc(date(r.createdAt))+'</td><td><button class="text-button" data-action="detail" data-id="'+r.id+'">التفاصيل</button></td></tr>').join('')+'</tbody></table></div></div>';
}
function render(){
  const active=document.activeElement;
  const focusKey=active?.dataset?.action?{action:active.dataset.action,id:active.dataset.id}:null;
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-current',b.dataset.view===view?'page':'false');});
  const titles={dashboard:['YOUR SYSTEMS. IN FOCUS.','اختبر بثقة. افهم ما تغيّر.','مساحة واحدة لاختبار أنظمتك، ومتابعة نتائجها من جهازك.'],projects:['PROJECTS / TEST SUITES','مشاريعك تحت الاختبار.','حدد رابط البيئة وشروط النجاح لكل فحص.'],runs:['RUNS / RESULTS','كل تشغيل، بقصته الكاملة.','آخر 200 تشغيل. كل تقرير يحتفظ بإعدادات المشروع وقت تشغيله.']};
  const t=titles[view];
  let html='<section class="page-head"><div><span class="eyebrow" dir="ltr">'+t[0]+'</span><h1>'+t[1]+'</h1><p>'+t[2]+'</p></div><div class="actions"><button class="button" data-action="new">+ مشروع جديد</button>'+(view==='projects'?'<button class="button secondary" data-action="import">استيراد</button><a class="button secondary" href="/api/export" download>تصدير المشاريع</a>':'')+'</div></section>';
  if(view==='dashboard'){
    const completed=state.runs.filter(x=>['passed','failed'].includes(x.status)),checks=completed.flatMap(x=>x.results),rate=checks.length?Math.round(checks.filter(x=>x.passed).length/checks.length*100)+'%':'—';
    html+='<div class="stats">'+[
      ['المشاريع',state.projects.length,'مشروع محفوظ على جهازك','▦'],
      ['التشغيلات',state.runs.length,'ضمن آخر 200 تشغيل','↗'],
      ['نجاح الفحوصات',rate,'من التشغيلات المكتملة المعروضة','✓'],
      ['يعمل الآن',state.runner.active,'في الانتظار: '+state.runner.queued,'◉']
    ].map(([title,value,note,icon])=>'<div class="stat"><div class="stat-top"><span>'+title+'</span><span class="stat-icon" aria-hidden="true">'+icon+'</span></div><strong>'+value+'</strong><small>'+note+'</small></div>').join('')+'</div>';
    html+='<div class="intro-note"><span class="big-icon" aria-hidden="true">◈</span><div><h3>اختبارات محددة. نتائج فعلية.</h3><p>راقب رمز HTTP، والنص المطلوب، وقيم JSON، ووقت الاستجابة. فحص النجاح يعني تحقق شروطك؛ لا يُعد تدقيقًا أمنيًا شاملًا أو اختبارًا لتفاعلات المتصفح.</p></div></div>';
    html+='<div class="section-head"><h2>المشاريع الأخيرة</h2><button class="text-button" data-view="projects">عرض المشاريع ←</button></div>'+projectCards(state.projects.slice(0,4));
    html+='<div class="section-head"><h2>آخر التشغيلات</h2><button class="text-button" data-view="runs">السجل الكامل ←</button></div>'+runRows(state.runs.slice(0,5));
  }else if(view==='projects')html+=projectCards(state.projects);
  else html+='<div class="section-head"><h2>سجل النتائج</h2><label>تصفية الحالة<select id="run-filter" class="filter">'+['all','passed','failed','running','queued','cancelled','interrupted'].map(x=>'<option value="'+x+'" '+(filter===x?'selected':'')+'>'+esc(x==='all'?'كل الحالات':labels[x])+'</option>').join('')+'</select></label></div>'+runRows(state.runs.filter(r=>filter==='all'||r.status===filter));
  $('#main').innerHTML=html;
  if(focusKey){const selector='[data-action="'+CSS.escape(focusKey.action)+'"]'+(focusKey.id?'[data-id="'+CSS.escape(focusKey.id)+'"]':'');$('#main').querySelector(selector)?.focus({preventScroll:true});}
}
function addCheck(c={}){
  const i=++checkSeq,el=document.createElement('fieldset');el.dataset.check='true';
  el.innerHTML='<legend>فحص '+i+'</legend><div class="check-head"><label>اسم الفحص<input data-field="name" required maxlength="120" value="'+esc(c.name||'')+'" placeholder="مثل: حالة API"></label><button type="button" class="text-button remove-check" aria-label="حذف هذا الفحص">حذف الفحص</button></div><div class="check-grid"><label>الطريقة<select data-field="method"><option>GET</option><option '+(c.method==='HEAD'?'selected':'')+'>HEAD</option></select></label><label>المسار<input data-field="path" dir="ltr" required maxlength="2048" value="'+esc(c.path||'/')+'" placeholder="/api/health"></label><label>رمز HTTP<input data-field="expectedStatus" type="number" min="100" max="599" required value="'+esc(c.expectedStatus??200)+'"></label><label>المهلة (ms)<input data-field="maxMs" type="number" min="100" max="30000" required value="'+esc(c.maxMs??5000)+'"></label></div><label>نص مطلوب في الاستجابة — اختياري<input data-field="contains" maxlength="1000" value="'+esc(c.contains||'')+'"></label><div class="json-grid"><label>مسار JSON — اختياري<input data-field="jsonPath" dir="ltr" maxlength="200" placeholder="data.ready" value="'+esc(c.jsonPath||'')+'"></label><label>القيمة المتوقعة بصيغة JSON<input data-field="jsonExpected" dir="ltr" maxlength="1000" placeholder="true" value="'+esc(c.jsonExpected||'')+'"></label></div>';
  $('#check-fields').append(el);
}
function editor(project){
  const form=$('#project-form');form.reset();form.elements.id.value=project?.id||'';form.elements.name.value=project?.name||'';form.elements.baseUrl.value=project?.baseUrl||'';form.elements.notes.value=project?.notes||'';
  $('#editor-title').textContent=project?'تعديل المشروع':'مشروع جديد';$('#form-error').textContent='';$('#check-fields').replaceChildren();checkSeq=0;
  for(const c of project?.checks||[{name:'الصفحة الرئيسية',path:'/'}])addCheck(c);
  $('#editor').showModal();
}
function renderRun(run){
  if(!run)return;
  $('#run-title').textContent=run.project.name+' · تفاصيل التشغيل';
  const show=x=>{const value=typeof x==='object'?JSON.stringify(x):String(x??'—');return esc(value.length>1800?value.slice(0,1800)+'…':value);};
  $('#run-detail').innerHTML='<p class="url">'+esc(run.project.baseUrl)+'</p><div class="actions">'+badge(run.status)+'<span class="subtext">'+esc(date(run.createdAt))+'</span><a class="button secondary small" href="/api/runs/'+run.id+'/report" download>تنزيل تقرير HTML</a>'+(['queued','running'].includes(run.status)?'<button class="button secondary small" data-action="cancel" data-id="'+run.id+'">إلغاء التشغيل</button>':'')+'</div><p class="helper">'+run.results.length+' من '+run.project.checks.length+' فحصًا اكتمل. تُحفظ نتائج هذه التجربة منفصلة عن تعديلات المشروع اللاحقة.</p>'+(run.error?'<p class="error-text">'+esc(run.error)+'</p>':'')+run.results.map(r=>'<article class="result-card"><div class="result-head"><h3>'+esc(r.name)+'</h3>'+badge(r.passed?'passed':'failed')+'</div><p class="url">'+esc(r.path)+' · '+r.durationMs+' ms</p>'+(r.error?'<p class="error-text">'+esc(r.error)+'</p>':'')+r.assertions.map(a=>'<div class="assertion '+(a.passed?'good':'bad')+'"><span>'+(a.passed?'✓ ':'× ')+esc(a.label)+'</span><span>المتوقع: '+show(a.expected)+'</span><span>الفعلي: '+show(a.actual)+'</span></div>').join('')+'</article>').join('');
}
document.addEventListener('click',async e=>{
  const nav=e.target.closest('[data-view]');if(nav){view=nav.dataset.view;render();return;}
  const button=e.target.closest('[data-action]');if(!button)return;
  const action=button.dataset.action,id=button.dataset.id;
  try{
    if(action==='new')return editor();
    if(action==='edit')return editor(state.projects.find(p=>p.id===id));
    if(action==='refresh')return refresh();
    if(action==='import')return $('#import-file').click();
    if(action==='detail'){selectedRun=id;renderRun(await api('/api/runs/'+id));$('#run-dialog').showModal();return;}
    if(action==='delete'&&!confirm('سيُحذف هذا المشروع وسجل اختباراته المحلي. هل تريد المتابعة؟'))return;
    button.disabled=true;
    if(action==='run'){await api('/api/projects/'+id+'/runs','POST');toast('أُضيف التشغيل إلى قائمة الاختبار');}
    if(action==='cancel'){await api('/api/runs/'+id+'/cancel','POST');toast('أُلغي التشغيل');}
    if(action==='delete'){await api('/api/projects/'+id,'DELETE');toast('حُذف المشروع وسجله');}
    if(action==='self'){
      const p=await api('/api/projects','POST',{name:'فحص ROWAIHY CONNECT المحلي',baseUrl:location.origin,notes:'فحص ذاتي للخادم المحلي؛ لا يتصل بمشاريعك الخارجية.',checks:[{name:'الخادم يعمل',path:'/api/health',jsonPath:'ok',jsonExpected:'true'},{name:'واجهة التحكم',path:'/',contains:'ROWAIHY CONNECT'}]});
      await api('/api/projects/'+p.id+'/runs','POST');toast('أُضيف الفحص الذاتي وبدأ تشغيله');
    }
    await refresh();
  }catch(error){toast(error.message);}
  finally{button.disabled=false;}
});
$('#project-form').addEventListener('submit',async e=>{
  e.preventDefault();$('#form-error').textContent='';
  const form=e.target,checks=[...document.querySelectorAll('[data-check]')].map(el=>Object.fromEntries([...el.querySelectorAll('[data-field]')].map(x=>[x.dataset.field,x.value])));
  const data={name:form.elements.name.value,baseUrl:form.elements.baseUrl.value,notes:form.elements.notes.value,checks},id=form.elements.id.value;
  $('#save-project').disabled=true;
  try{await api(id?'/api/projects/'+id:'/api/projects',id?'PUT':'POST',data);$('#editor').close();toast('حُفظ المشروع وفحوصاته');await refresh();}
  catch(error){$('#form-error').textContent=error.message;}
  finally{$('#save-project').disabled=false;}
});
$('#add-check').addEventListener('click',()=>{if(document.querySelectorAll('[data-check]').length>=30)return toast('الحد الأقصى 30 فحصًا');addCheck();});
$('#check-fields').addEventListener('click',e=>{if(e.target.closest('.remove-check')){if(document.querySelectorAll('[data-check]').length<=1)return toast('احتفظ بفحص واحد على الأقل');e.target.closest('fieldset').remove();}});
for(const id of ['close-editor','cancel-editor'])$('#'+id).addEventListener('click',()=>$('#editor').close());
$('#close-run').addEventListener('click',()=>{selectedRun=null;$('#run-dialog').close();});
$('#run-dialog').addEventListener('close',()=>{selectedRun=null;});
document.addEventListener('change',e=>{if(e.target.id==='run-filter'){filter=e.target.value;render();}});
$('#import-file').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    if(file.size>256*1024)throw Error('حجم الملف أكبر من 256 كيلوبايت');
    const data=JSON.parse(await file.text());
    if(!confirm('ستُضاف المشاريع من الملف دون حذف المشاريع الحالية. هل تريد المتابعة؟'))return;
    const result=await api('/api/projects/import','POST',data);toast('أُضيف '+result.imported+' مشروعًا');await refresh();
  }catch(error){toast(error.message);}finally{e.target.value='';}
});
async function poll(){await refresh();setTimeout(poll,document.hidden?10000:1800);}poll();
