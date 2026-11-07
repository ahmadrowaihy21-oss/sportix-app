import {InputError,validEvidenceUrl} from './domain.mjs';
const need=(v,s)=>{if(!v)throw new InputError(s);};
const txt=(v,max=2000,required=false)=>{need(typeof v==='string'&&v.trim().length<=max,'Invalid or oversized text.');const s=v.trim();need(!required||s,'Required field missing.');return s;};
const pick=(v,options)=>{need(options.includes(v),'Invalid selection.');return v;};
const date=v=>{if(!v)return '';need(typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'Invalid date.');return v;};
const url=v=>{need(validEvidenceUrl(v),'A valid HTTPS evidence link is required.');return v;};
const id=()=>crypto.randomUUID();
const task=(title,titleEn)=>({id:id(),title,titleEn,status:'planned',evidence:null});
export function operationsSeed(){return {projects:[],competitors:[],priorities:[],logs:[],imports:[],receipts:[],integrations:['Similarweb','Metricool','Supermetrics'].map(name=>({id:name.toLowerCase(),name,status:'planned',owner:'',requirements:'',evidence:'',note:'',verifiedAt:null,reviewer:null}))};}
function newCase(p){return {id:id(),title:txt(p.title,100,true),client:txt(p.client,120,true),service:txt(p.service,100,true),brief:txt(p.brief,5000),requirements:txt(p.requirements||'',4000),owner:txt(p.owner||'',100),due:date(p.due||''),stage:'intake',weakness:'',blocker:'',decision:'',scopeApproval:null,sourceId:null,legacy:false,files:[],tasks:[task('مراجعة المتطلبات','Review requirements'),task('اعتماد النطاق','Approve scope'),task('تحديد معايير القبول','Define acceptance criteria')]};}
export function applyOperations(current,input,actor,now=new Date().toISOString()){
 const s=structuredClone(current),p=input.payload||{},action=input.action;let detail='';
 const project=()=>{const item=s.projects.find(x=>x.id===p.id);need(item,'Client project not found.');return item;};
 switch(action){
 case 'createCase':{need(s.projects.length<500,'Project limit reached.');const item=newCase(p);s.projects.unshift(item);detail='Client intake: '+item.title;break;}
 case 'linkOrder':{need(p.source&&p.source.id,'Source order not found.');if(s.projects.some(x=>x.sourceId===p.source.id))return s;need(s.projects.length<500,'Project limit reached.');const item=newCase({title:p.source.title,client:p.source.client||'Website client / عميل الموقع',service:p.source.service,brief:p.source.brief||'',owner:'',due:''});item.id='order:'+p.source.id;item.sourceId=p.source.id;s.projects.unshift(item);detail='Website order linked: '+item.title;break;}
 case 'updateCase':{const item=project();for(const k of ['requirements','weakness','blocker','decision'])item[k]=txt(p[k]||'',4000);item.owner=txt(p.owner||'',100);item.due=date(p.due||'');item.stage=pick(p.stage,['intake','scoping','delivery','review','completed','paused']);if(item.stage==='completed')need(item.tasks.length&&item.tasks.every(t=>t.status==='completed'&&t.evidence)&&item.scopeApproval&&p.attest===true,'Reviewed evidence, scope approval and explicit completion review are required.');detail='Project updated: '+item.title;break;}
 case 'addTask':{const item=project();need(item.tasks.length<100,'Task limit reached.');item.tasks.push(task(txt(p.title,200,true),txt(p.title,200,true)));if(item.stage==='completed')item.stage='review';detail='Task added: '+p.title;break;}
 case 'taskEvidence':{const item=project(),t=item.tasks.find(x=>x.id===p.taskId);need(t,'Task missing.');need(p.reviewed===true,'Review the evidence before completion.');t.evidence={url:url(p.url),note:txt(p.note,2000,true),reviewer:actor,reviewedAt:now};t.status='completed';detail='Evidence reviewed: '+t.title;break;}
 case 'reopenTask':{const item=project(),t=item.tasks.find(x=>x.id===p.taskId);need(t,'Task missing.');t.status='planned';t.evidence=null;if(item.stage==='completed')item.stage='review';detail='Task reopened: '+t.title;break;}
 case 'approveScope':{const item=project();need(p.confirm===true,'Confirm scope review.');item.scopeApproval={note:txt(p.note,3000,true),by:actor,at:now};detail='Scope approved: '+item.title;break;}
 case 'addFile':{const item=project();need(item.files.length<100,'File limit reached.');item.files.push({id:id(),name:txt(p.name,180,true),url:url(p.url),addedAt:now});detail='File reference added: '+p.name;break;}
 case 'integration':{const item=s.integrations.find(x=>x.id===p.id);need(item,'Workflow missing.');item.status=pick(p.status,['planned','checking','verified']);item.owner=txt(p.owner||'',100);item.requirements=txt(p.requirements||'',3000);item.note=txt(p.note||'',3000);item.evidence=p.evidence?url(p.evidence):'';if(item.status==='verified'){need(item.evidence&&item.note&&item.owner&&p.reviewed===true,'Verification requires an owner, test evidence, result note and review.');item.verifiedAt=now;item.reviewer=actor;}else{item.verifiedAt=null;item.reviewer=null;}detail='Integration verification: '+item.name;break;}
 case 'addCompetitor':{need(s.competitors.length<300,'Comparison limit reached.');const kind=pick(p.kind,['fact','estimate','assumption']);const source=p.source?url(p.source):'';const checkedAt=date(p.checkedAt||'');if(kind!=='assumption')need(source&&checkedAt,'A source and verification date are required.');s.competitors.unshift({id:id(),name:txt(p.name,120,true),metric:txt(p.metric,100,true),value:txt(p.value,100,true),unit:txt(p.unit,60,true),period:txt(p.period,100,true),market:txt(p.market,100,true),kind,source,checkedAt,note:txt(p.note||'',2000),createdAt:now});detail='Competitor observation: '+p.name;break;}
 case 'addPriority':{need(s.priorities.length<300,'Priority limit reached.');s.priorities.unshift({id:id(),title:txt(p.title,250,true),owner:txt(p.owner,100,true),due:date(p.due),done:false});detail='Weekly priority: '+p.title;break;}
 case 'priorityStatus':{const item=s.priorities.find(x=>x.id===p.id);need(item&&typeof p.done==='boolean','Invalid priority.');item.done=p.done;detail='Priority reviewed: '+item.title;break;}
 case 'importLegacy':{
  const data=p.data;need(data&&Array.isArray(data.projects)&&data.projects.length<=150&&Array.isArray(data.logs)&&data.logs.length<=1000,'Invalid Operations Hub export.');
  need(typeof p.digest==='string'&&/^[0-9a-f]{64}$/.test(p.digest),'Invalid import identity.');
  if(s.imports.includes(p.digest))return s;
  need(s.projects.length+data.projects.length<=500,'Project limit reached.');
  const val=(x,max=2000)=>txt(typeof x==='string'?x:'',max);
  for(const legacy of data.projects){
   need(Array.isArray(legacy.name)&&Array.isArray(legacy.client)&&Array.isArray(legacy.tasks)&&legacy.tasks.length<=100,'Invalid legacy project.');
   const item=newCase({title:val(legacy.name[0],100),client:val(legacy.client[0],120),service:val(legacy.service,100),brief:val(legacy.brief,5000),owner:val(legacy.owner?.[0],100),due:legacy.date||''});
   item.legacy=true;item.weakness=val(legacy.weak?.[0]);item.blocker=val(legacy.block?.[0]);item.decision=val(legacy.decision?.[0]);item.legacyStage=val(legacy.stage?.[0]);item.legacyBudget=val(String(legacy.budget||''),100);
   item.tasks=legacy.tasks.map(t=>({...task(val(t[0],200),val(t[1]||t[0],200)),legacyReference:val(t[3],500)}));
   need(!legacy.files||Array.isArray(legacy.files),'Invalid legacy file references.');item.legacyFiles=(legacy.files||[]).slice(0,100).map(x=>val(x,500));s.projects.push(item);
  }
  const importedLogs=data.logs.map(l=>({id:id(),at:now,actor,action:'legacy_record',detail:val(l.text,3000),legacyTime:val(l.time,100),unverified:true}));s.logs.unshift(...importedLogs);
  const titles=['تثبيت نطاق الإصدار الأول','جمع عروض أسعار دراسة الجدوى','مراجعة صلاحيات أدوات التحليل'];
  if(Array.isArray(data.priorities))data.priorities.slice(0,3).forEach((done,i)=>s.priorities.push({id:id(),title:titles[i],owner:'مستورد — يحتاج مراجعة',due:'',done:false,legacyReviewed:done===true}));
  s.imports.push(p.digest);detail='Imported '+data.projects.length+' legacy projects; historical claims require evidence review.';break;
 }
 default:throw new InputError('Unknown operation.');
 }
 s.logs.unshift({id:id(),at:now,actor,action,detail});need(JSON.stringify(s).length<2500000,'Workspace size limit reached.');return s;
}
