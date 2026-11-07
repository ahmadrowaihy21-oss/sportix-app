export class InputError extends Error {}
const need=(condition,message)=>{if(!condition)throw new InputError(message)};
const text=(v,max=2500)=>{need(typeof v==='string'&&v.trim().length<=max,'Invalid or oversized text.');return v.trim()};
const required=(v,max=2500)=>{const s=text(v,max);need(s.length>0,'Required field is missing.');return s};
const date=v=>{const s=required(v,10);need(/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s,'Invalid date.');return s};
export function validEvidenceUrl(v){try {const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password&&u.hostname.includes('.')}catch{return false}}
const choice=(v,allowed)=>{need(allowed.includes(v),'Invalid selection.');return v};
export function applyAction(current,input,actor,now=new Date().toISOString()){
 need(input&&typeof input==='object','Invalid request.');
 const s=structuredClone(current); const a=input.action; const p=input.payload??{};
 const id=()=>crypto.randomUUID();
 let detail='',projectId=p.projectId,evidenceHistory;
 const proj=()=>{const v=s.projects.find(x=>x.id===p.projectId);need(v,'Project not found.');return v};
 switch(a){
 case 'createProject':{
  need(s.projects.length<150,'Project limit reached.');const name=required(p.name,100);need(!s.projects.some(x=>x.name.toLowerCase()===name.toLowerCase()),'Project already exists.');
  projectId=id(); s.projects.push({id:projectId,name,initials:name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase(),category:choice(p.category,['AI & Products','SportsTech','Hospitality','Commerce','Other']),color:'#ad9aef',description:required(p.description,500),status:'planned',source:'',sourceLabel:'Owner entry',basis:'Added by owner · delivery unverified',features:[],weakness:'',blocker:'',decision:'',priority:required(p.priority,500),priorityLevel:choice(p.priorityLevel,['high','medium','low']),owner:required(p.owner,100),due:p.due?date(p.due):''}); detail=name;break;
 }
 case 'addFeature':{const pr=proj();need(pr.features.length<100,'Feature limit reached.');pr.features.push({id:id(),title:required(p.title,200),status:'planned'});if(pr.status==='completed')pr.status='needs_review';detail=p.title;break;}
 case 'featureStatus':{const pr=proj();const f=pr.features.find(x=>x.id===p.featureId);need(f,'Feature not found.');const prior=structuredClone(f);const status=choice(p.status,['planned','in_progress','blocked','in_review','completed']);
  if(status==='completed'){need(p.attest===true,'Human review is required.');need(validEvidenceUrl(p.url),'A valid HTTPS evidence link is required.');f.evidence={url:p.url,kind:choice(p.kind,['Test report','Deployed flow','Pull request','Design review','Document']),summary:required(p.summary,1500),result:required(p.result,1500),reviewer:actor,reviewedAt:now};}
  else delete f.evidence;
  detail=f.title+': '+f.status+' → '+status;f.status=status;if(status!=='completed'&&pr.status==='completed')pr.status='needs_review';evidenceHistory={before:prior,after:structuredClone(f)};break;
 }
 case 'projectUpdate':{const pr=proj();const nextStatus=choice(p.status,['planned','in_progress','needs_review','blocked','paused','completed']);if(nextStatus==='completed'){need(pr.features.length>0&&pr.features.every(f=>f.status==='completed'&&f.evidence),'Every feature needs reviewed evidence before completing the project.');need(p.attest===true,'Confirm that the full project scope has been reviewed.');}pr.status=nextStatus;pr.priority=required(p.priority,500);pr.priorityLevel=choice(p.priorityLevel,['high','medium','low']);pr.weakness=text(p.weakness);pr.blocker=text(p.blocker);pr.owner=required(p.owner,100);pr.due=p.due?date(p.due):'';detail=pr.name;break;}
 case 'weekly':{const pr=proj();const u={id:id(),projectId:pr.id,week:date(p.week),wins:text(p.wins),planned:required(p.planned),weakness:text(p.weakness),blocker:text(p.blocker),decision:text(p.decision),priority:required(p.priority,500),evidence:text(p.evidence),author:actor,createdAt:now};
  need(!s.updates.some(x=>x.projectId===pr.id&&x.week===u.week),'An update already exists for this project and week.');s.updates.unshift(u);pr.priority=u.priority;pr.weakness=u.weakness;pr.blocker=u.blocker;
  if(u.decision)s.decisions.push({id:id(),projectId:pr.id,title:u.decision,context:'Weekly update '+u.week,status:'open'});detail=pr.name+' · '+u.week+' · claims require feature verification';break;
 }
 case 'addTask':{proj();s.tasks.push({id:id(),projectId:p.projectId,title:required(p.title,250),due:date(p.due),priority:choice(p.priority,['high','medium','low']),done:false});detail=p.title;break;}
 case 'taskStatus':{const t=s.tasks.find(x=>x.id===p.id);need(t,'Task not found.');need(typeof p.done==='boolean','Invalid task state.');t.done=p.done;detail=t.title+' · '+(t.done?'done':'reopened');projectId=t.projectId;break;}
 case 'addDecision':{proj();s.decisions.unshift({id:id(),projectId:p.projectId,title:required(p.title,500),context:required(p.context),status:'open'});detail=p.title;break;}
 case 'resolveDecision':{const d=s.decisions.find(x=>x.id===p.id);need(d&&d.status==='open','Decision is not open.');d.answer=required(p.answer);d.status='resolved';d.decidedBy=actor;d.decidedAt=now;detail=d.title;projectId=d.projectId;break;}
 case 'saveStudy':{proj();need(s.studies.length<500,'Study limit reached.');s.studies.unshift({id:id(),projectId:p.projectId,title:required(p.title,150),age:choice(p.age,['18–24','25–44','45–64','65+','All adults','Under 18']),gender:choice(p.gender,['Inclusive / neutral','Feminine address','Masculine address']),culture:choice(p.culture,['Saudi Arabia','Gulf / GCC','International']),language:choice(p.language,['English','Arabic']),tone:choice(p.tone,['Friendly','Professional','Simple']),questions:required(p.questions,12000),createdAt:now,status:'draft'});detail=p.title;break;}
 default:throw new InputError('Unknown action.');
 }
 s.activity.unshift({id:id(),at:now,actor,action:a,detail,projectId,...(evidenceHistory?{evidenceHistory}:{})});
 need(JSON.stringify(s).length<1500000,'Workspace limit reached. Export your records before expanding.');
 return s;
}
