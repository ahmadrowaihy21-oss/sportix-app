import {englishError} from './english-ui.js';
import {request as memberRequest, loginUrl} from './member-nav.js';
import {plans as planData} from './subscription-plans.js';
const plans=planData.map(p=>({...p,name:({idea:'Idea',founder:'Founder',studio:'Studio'})[p.id]||p.name}));
let walletNumber='',membership;
import {processingRates,processingOrder} from './points-rates.js';
const pane=document.getElementById('content'),statusBox=document.getElementById('status'),queueLink=document.getElementById('queue-link');
const sectorOptions=['Digital marketplaces','Engineering','Manufacturing','Tourism','Sports','Culture','Technology','Education','Services','Other sector'];
const stageNames={intake:'Brief preparation',strategy:'Strategic direction',research_due:'Competitor research',market:'Competitor research complete',study:'Initial feasibility study',review:'Portfolio review',quote:'Consultation quote',dispute:'Objection review',consultation:'Approved consultation',handoff:'Build team follow-up'};
const nextAction={intake:'summary',research_due:'research',market:'study',study:'portfolio'};
const actionNames={summary:'Draft the brief and questions',research:'Research competitors online',study:'Prepare the initial feasibility study',portfolio:'Build portfolio',fix:'Fix defect',resolveFree:'Apply free repair',deliverConsult:'Prepare revised version'};
let current=null,accountExpert=false,busy=false;
const el=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt!=null)n.textContent=txt;if(cls)n.className=cls;return n;};
const flag=(msg='',bad=false)=>{statusBox.textContent=msg;statusBox.classList.toggle('error',bad);};
const isoDate=x=>new Intl.DateTimeFormat('en-SA',{dateStyle:'medium',calendar:'gregory'}).format(new Date(x));
function block(title,parent=pane){const c=el('section',null,'work-card');c.append(el('h2',title));parent.append(c);return c;}
function btn(title,fn,primary=true){const b=el('button',title,'btn '+(primary?'dark':'outline'));b.type='button';b.onclick=fn;return b;}
function actions(parent,...items){const line=el('div',null,'work-actions');line.append(...items);parent.append(line);}
function field(spec,grid,value=''){
  const label=el('label',null,'input-label'+(spec.full?' full':''));label.append(el('span',spec.label));
  const e=el(spec.options?'select':spec.long?'textarea':'input');e.name=spec.key;e.required=!spec.optional;
  if(spec.options){e.append(new Option('Choose…',''));spec.options.forEach(item=>{const [val,name]=Array.isArray(item)?item:[item,item];e.append(new Option(name,val));});}
  else if(!spec.long){e.type=spec.number?'number':'text';if(spec.number){e.min='0';e.max='10000000000';e.step='any';}}
  e.value=value??'';e.maxLength=spec.max||900;label.append(e);if(spec.hint)label.append(el('small',spec.hint));grid.append(label);return e;
}
function consent(form,txt){const l=el('label',null,'check-label'),x=el('input');x.type='checkbox';x.required=true;l.append(x,el('span',txt));form.append(l);return x;}
function submit(form,label,fn){
  const b=el('button',label,'btn dark');b.type='submit';actions(form,b);
  form.onsubmit=e=>{e.preventDefault();if(!busy&&form.reportValidity())fn();};
}
function list(parent,items){const ul=el('ul',null,'work-list');items.forEach(x=>ul.append(el('li',x)));parent.append(ul);}
function sub(parent,title,description){parent.append(el('h3',title),el('p',description));}
function requestUUID(){
  if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
  const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;
  const h=Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
  return [h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20)].join('-');
}
function fromStorage(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{return {};}}
async function api(path,options={}){
  const r=await fetch('/api/studio/'+path,{cache:'no-store',...options,headers:{'Content-Type':'application/json'}});
  const data=await r.json().catch(()=>({error:'Could not read the service response.'}));
  if(!r.ok){const e=new Error(englishError(data.error,data.code));e.code=data.code;e.status=r.status;throw e;}
  return data;
}
async function refreshWallet(){
  const wallet=await api('wallet');
  walletNumber=wallet.number;
  document.getElementById('wallet-link').textContent='My wallet · '+pointCount(wallet.balance);
  return wallet;
}
function costLabel(action,chain=false){
  const steps=chain?processingOrder.slice(processingOrder.indexOf(action)):[action];
  return pointCount(steps.reduce((sum,step)=>sum+processingRates[step],0));
}
function errorView(e){
  flag(e.message||'Connection failed. Please try again.',true);
  if(e.code==='insufficient_points'){const link=el('a','Open my wallet');link.href='?wallet=1';statusBox.append(' ',link);}
  if(e.code==='signin'||e.code==='google_signin'){location.replace(loginUrl());}
}
function setBusy(value){busy=value;pane.setAttribute('aria-busy',String(value));pane.querySelectorAll('button').forEach(b=>b.disabled=value);}
function settings(p){return {isExpert:p.isExpert??accountExpert,isOwner:p.isOwner??true};}
async function mutate(action,args={}){
  const data=await api('projects/'+current.id,{method:'POST',body:JSON.stringify({...args,action,requestId:requestUUID(),revision:current.revision})});
  current={...settings(current),...data};
}
async function perform(action,args={},chain=false){
  if(busy)return;setBusy(true);flag(actionNames[action]||'Saving changes…');
  try{
    await mutate(action,args);renderProject();
    while(chain && nextAction[current.stage]){
      setBusy(true);const next=nextAction[current.stage];flag(actionNames[next]+'…');await mutate(next);renderProject();
    }
    flag();
  }catch(e){if(e.status===409){try{current=await api('projects/'+current.id);renderProject();}catch{}}
    errorView(e);
  }finally{setBusy(false);try{await refreshWallet();}catch{/* The completed project action is independent of refreshing its balance. */}}
}
function renderIntake(notice){
  pane.replaceChildren();const c=block('Tell us about your idea'),f=el('form'),g=el('div',null,'field-grid');
  c.append(el('p','We will organize your answers into a professional brief, then clarify your market and direction before researching competitors.','section-note'));
  const intakeKey='rowaihy.intake.'+walletNumber;
  const saved=fromStorage(intakeKey);
  const specs=[
    {key:'name',label:'Project name',max:80},{key:'kind',label:'Product type',options:[['digital','Digital · platform or app'],['physical','Physical · tangible product']]},
    {key:'sector',label:'Sector',options:[...new Set([...sectorOptions,...(saved.sector?[saved.sector]:[])])]},
    {key:'market',label:'Target market',hint:'Country or city, such as Jeddah, Saudi Arabia.',max:150},
    {key:'idea',label:'What do you want to build?',long:true,full:true,max:1600},
    {key:'customer',label:'Who is your first customer?',max:450},{key:'problem',label:'What problem are you solving for them?',max:1200},
    {key:'pain',label:'What pain point does your service address?',hint:'Wasted time, cost, complexity, limited access…',optional:true,long:true,max:1000},
    {key:'impact',label:'What benefit does the user gain, and how will you measure it?',optional:true,long:true,max:1000},
    {key:'partnerImpact',label:'Who are potential partners, and what value do they gain?',optional:true,long:true,max:1000},
    {key:'revenues',label:'How will the project earn sustainable revenue?',optional:true,long:true,max:1000},
    {key:'personality',label:'What personality and brand DNA do you want?',optional:true,long:true,max:1000},
    {key:'requirements',label:'Which licenses and requirements do you know of or need to verify?',optional:true,long:true,max:1000},
    {key:'team',label:'Who is on the team, and which initial roles do you need?',optional:true,long:true,max:1000},
    {key:'evidence',label:'What have you tested so far?',optional:true,long:true,full:true,max:1000}];
  for(const s of specs)field(s,g,saved[s.key]);f.append(g);c.append(f);
  const draft=()=>Object.fromEntries(new FormData(f));
  f.addEventListener('input',()=>{try{localStorage.setItem(intakeKey,JSON.stringify(draft()));}catch{}});
  const agreement=consent(f,notice.text);
  const processing=el('details',null,'past');
  processing.append(el('summary','Who processes the project brief?'),el('p','The current processing provider is OpenAI.'));
  f.append(processing);
  let requestId=requestUUID();
  submit(f,'Draft professional brief · '+costLabel('summary')+' ←',async()=>{
    setBusy(true);flag('Saving your idea…');
    try{
      const r=await api('projects',{method:'POST',body:JSON.stringify({id:requestId,brief:draft(),intakeConsent:{accepted:agreement.checked,version:notice.version}})});
      current={...r,isOwner:true,isExpert:accountExpert};history.replaceState(null,'','?id='+r.id);renderProject();setBusy(false);
      await perform('summary');
    }catch(e){errorView(e);setBusy(false); if(e.status===409)requestId=requestUUID();}
  });
}
function summaryCredit(){
  const credit=el('small','Powered by OpenAI','summary-credit');
  credit.lang='en';
  credit.dir='ltr';
  return credit;
}
function strategyForm(parent,d){
  const c=block('Approve the brief and set your direction',parent),f=el('form'),g=el('div',null,'field-grid');
  const draftKey='rowaihy.strategy.'+current.id, saved=fromStorage(draftKey);
  field({key:'summary',label:'Executive summary',full:true,long:true,max:4500},g,saved.summary??d.summary.summary);
  g.append(summaryCredit());
  d.summary.questions.forEach((q,i)=>field({key:'q'+i,label:q.question,hint:q.reason,long:true,full:true},g,saved['q'+i]));
  ['price','variable','fixed'].forEach((key,i)=>field({key,label:['Unit or subscription price (SAR)','Variable unit cost (SAR)','Monthly fixed costs (SAR)'][i],optional:true,number:true,hint:'Optional — saved as your assumption.'},g,saved[key]));
  field({key:'horizon',label:'Financial planning horizon',options:[['3','3 years'],['4','4 years'],['5','5 years']]},g,saved.horizon||'3');
  ['monthlyUnits','growthPercent','startupCost'].forEach((key,i)=>{
    const n=field({key,label:['Expected monthly unit sales in year one','Expected annual sales growth (%)','Pre-launch setup cost (SAR)'][i],optional:true,number:true,hint:'Planning assumption. Leave blank if not yet defined.'},g,saved[key]);
    n.max=key==='growthPercent'?'100':'100000000';
  });
  g.append(el('p','The initial financial model uses one revenue unit and assumes constant pricing, costs, and fixed expenses. The consulting study details revenue streams and scenarios.','section-note'));
  f.append(g);c.append(f);f.oninput=()=>{try{localStorage.setItem(draftKey,JSON.stringify(Object.fromEntries(new FormData(f))));}catch{}};
  consent(f,'I approve this description as the reference for building the portfolio and reviewing objections.');
  f.append(el('p','After approval, we research competitors and prepare the study and portfolio. If credits run out, resume from your last saved step.','section-note'));
  submit(f,'Approve direction and continue processing · up to '+costLabel('research',true)+' ←',()=>{
    const form=new FormData(f),num=k=>form.get(k)===''?null:Number(form.get(k));
    perform('strategy',{summary:form.get('summary'),answers:d.summary.questions.map((_,i)=>form.get('q'+i)),price:num('price'),variable:num('variable'),fixed:num('fixed'),planning:{horizon:num('horizon'),monthlyUnits:num('monthlyUnits'),growthPercent:num('growthPercent'),startupCost:num('startupCost')}},true);
  });
}
function evidenceLink(s){const a=el('a',s.title||s.url);a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function marketView(d){
  const c=block('Market competitors');c.append(el('small','Research date '+d.market.asOf));
  c.append(el('p','Source: documented web research. Specialized market intelligence analysis is prepared by a PROJECT R STUDIO analyst, reviewed, and delivered as a separate report.','section-note'));
  const grid=el('div',null,'result-grid');c.append(grid);
  for(const m of d.market.competitors){const x=el('article',null,'market-card');x.append(el('small',m.type==='direct'?'Direct competitor':'Indirect alternative'),el('h3',m.name),el('p',m.offer),el('p',m.overlap),evidenceLink(m.source));grid.append(x);}
  if(!d.market.competitors.length)c.append(el('p','Available sources were insufficient to document a specific competitor.'));
  c.append(el('p',d.market.gap,'section-note'));
  const details=el('details',null,'past');details.append(el('summary','Research sources'));const ul=el('ol',null,'source-list');
  d.market.sources.forEach(s=>{const li=el('li');li.append(evidenceLink(s));ul.append(li);});details.append(ul);c.append(details);
  const lic=block('Licensing and operating requirements');
  lic.append(el('p','An initial overview based on the market and activity. Verify current requirements with the issuing authority before implementation.','section-note'));
  for(const l of d.market.licensing||[]){sub(lic,l.name+' · '+l.authority,l.condition);lic.append(evidenceLink(l.source));}
  if(!d.market.licensing?.length)lic.append(el('p','No verified licensing information is available for this project yet.'));
  list(lic,d.market.licensingGaps||[]);
}
function studyView(d){
  const s=d.study,c=block('Initial feasibility study');
  sub(c,{test:'Recommendation · test demand',revise:'Recommendation · refine the idea',pilot:'Recommendation · run a small pilot'}[s.verdict],s.rationale);
  sub(c,'Market and demand',s.market);sub(c,'Implementation and operations',s.operations);sub(c,'Commercial feasibility',s.commercial);
  const n=d.economics,fmt=a=>a==null?'Not available':a.toLocaleString('en-SA');
  sub(c,'Unit economics · founder assumptions','Unit price '+fmt(n.price)+' SAR, variable cost '+fmt(n.variable)+' SAR, and monthly fixed cost '+fmt(n.fixed)+' SAR.');
  if(n.contribution!==null)c.append(el('p','Contribution margin '+fmt(n.contribution)+' SAR per unit.'));
  c.append(el('p',n.breakEven===null?'Break-even cannot be calculated from the current inputs.':'Break-even '+fmt(n.breakEven)+' units per month.'));
  for(const [label,rows] of [['Assumptions to validate',s.assumptions],['Risks',s.risks],['Missing data',s.missingInputs]]){c.append(el('h3',label));list(c,rows);}
  sub(c,'Next experiment',s.experiment);sub(c,'Experiment success criterion',s.successCriterion);
  if(s.foundation){
    const f=block('Project foundation and DNA · draft');
    for(const [key,label] of [['definition','What is the project?'],['pains','The pain point the service addresses'],['beneficiaryImpact','Impact on the user'],['partnerImpact','Value for partners'],['requirements','Activity requirements'],['brandDNA','Personality and DNA'],['visualIdentity','Visual identity direction'],['logoBrief','Logo design brief'],['staffing','Required roles and staffing'],['annualOperations','Annual operating cost']])sub(f,label,s.foundation[key]);
    f.append(el('h3','Revenue streams'));list(f,s.foundation.revenueSources);
    f.append(el('p','The identity and logo here are a design direction and brief. Final brand and logo files are delivered within the approved Project foundation scope.','section-note'));
  }
  if(s.growth){
    const g=block('Feasibility and growth plan · draft');
    for(const [key,label] of [['capitalUses','Capital and use of funds'],['revenueModel','Revenue streams and estimates'],['yearOne','First year'],['breakEven','Path to break-even'],['multiYear','Multi-year plan'],['whereToPlay','Where is your market?'],['howToWin','How will you compete?']])sub(g,label,s.growth[key]);
    g.append(el('h3','Potential partners'));list(g,s.growth.partners);g.append(el('h3','Go-to-market plan'));list(g,s.growth.marketEntry);
  }
  if(d.financialPlan)financialPlanView(d.financialPlan);
}
function financialPlanView(p){
  const c=block('Financial model · '+p.input.horizon+' years');
  if(p.missing.length){sub(c,'Data required to complete calculations',p.missing.join('، '));return;}
  const fmt=n=>n.toLocaleString('en-SA',{maximumFractionDigits:2});
  sub(c,'Estimated cash requirement',fmt(p.capitalRequired)+' SAR, before contingency reserves.');
  sub(c,'Operating break-even',p.operatingBreakEvenMonth===null?'Not reached within the model horizon.':'First month revenue covers operating costs: '+p.operatingBreakEvenMonth);
  sub(c,'Setup cost payback',p.paybackMonth===null?'Setup costs are not recovered within the model horizon.':'Month '+p.paybackMonth+' Based on the entered assumptions.');
  function table(title,rows,key){
    const details=el('details',null,'past');details.append(el('summary',title));const wrap=el('div',null,'r-table'),t=el('table'),head=el('thead'),tr=el('tr');
    const cols=[[key,key==='month'?'Month':'Year'],['revenue','Revenue (SAR)'],['operatingCost','Operating costs (SAR)'],['operatingCash','Operating surplus'],['cumulative','Cumulative after setup']];
    cols.forEach(([,label])=>{const h=el('th',label);h.scope='col';tr.append(h);});head.append(tr);t.append(head);const body=el('tbody');
    rows.forEach(row=>{const r=el('tr');cols.forEach(([k])=>r.append(el('td',fmt(row[k]))));body.append(r);});t.append(body);wrap.append(t);details.append(wrap);c.append(details);
  }
  table('First-year monthly breakdown',p.months,'month');table('Annual plan through year '+p.input.horizon,p.years,'year');
  c.append(el('p',p.limitations,'section-note'));
}
function saveFile(html){
  const u=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
  const a=document.createElement('a');a.href=u;a.download='project-portfolio.html';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
}
async function exportPortfolio(d){
  try{
    const css=await Promise.all(['style.css','workspace.css'].map(async url=>{const r=await fetch(url);if(!r.ok)throw Error();return r.text();}));
    const safe=JSON.stringify([d.brief.kind,d.portfolio]).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
    const style=css.join('\n').replace(/@font-face\s*\{[^}]*\}/g,'');
    saveFile('<!doctype html><html lang="en" dir="ltr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Project portfolio</title><style>'+style+'</style><main class="container work" id="p"></main><script>('+window.renderShowcase.toString()+')(document.getElementById("p"),...'+safe+');<\/script></html>');
  }catch{flag('Could not download the portfolio. Please try again.',true);}
}
function sharing(parent,d){
  const box=block('Share portfolio',parent);
  box.append(el('p','Download HTML to explore the portfolio outside this site. The hosted version follows the current site access permissions.'));
  if(d.share){
    const url=new URL('showcase.html',location.href);url.hash=d.share.token;const a=el('a','Open shared version · revision '+d.share.version,'result-link');a.href=url.href;a.target='_blank';a.rel='noopener';box.append(a);
    actions(box,btn('Copy link',async()=>{try{await navigator.clipboard.writeText(url.href);flag('Portfolio link copied.');}catch{flag(url.href);}},false),btn('Disable sharing',()=>perform('share',{enabled:false}),false),btn('Download portfolio',()=>exportPortfolio(d),false));
  }else actions(box,btn('Create a portfolio version link',()=>perform('share',{enabled:true})),btn('Download portfolio',()=>exportPortfolio(d),false));
}
function reviewForm(c,d){
  const f=el('form'),grid=el('div',null,'field-grid');
  const type=field({key:'choice',label:'What would you like to do?',options:[['approve','Approve and request contact from the development team'],['fix','Defect against the approved brief — free repair'],['consult','Error or change in my brief — consultation quote'],['dispute','Request review of the objection classification']]},grid);
  const note=field({key:'note',label:'Order details',long:true,optional:true,full:true,max:1300},grid);
  const contact=field({key:'contact',label:'Preferred contact method',optional:true,max:180,full:true},grid);
  f.append(grid);const yes=consent(f,'I agree to share the project file and contact details with the full development team.');
  const toggle=()=>{const approved=type.value==='approve';contact.parentElement.hidden=!approved;contact.required=approved;yes.parentElement.hidden=!approved;yes.required=approved;note.required=!!type.value&&!approved;};
  type.onchange=toggle;toggle();
  f.append(el('p','Repairs against the approved brief are free. Consultation to correct the founder brief starts at SAR 500, with the amount shown before approval.','billing-note'));
  submit(f,'Submit my choice',()=>perform(type.value,{note:note.value,contact:contact.value,consent:yes.checked}));c.append(f);
}
function ticketView(c,d){
  const t=d.ticket;c.append(el('p',t.note));
  if(current.stage==='quote'){
    c.append(el('p','Portfolio brief correction consultation · '+t.fee+' SAR','billing-note'));
    if(t.reason)c.append(el('p',t.reason));
    const f=el('form'),g=el('div',null,'field-grid');const contact=field({key:'contact',label:'Consultant contact method',max:180},g);f.append(g);
    const yes=consent(f,'I approve the consultation request for '+t.fee+' SAR. No payment is charged automatically.');submit(f,'Approve consultation',()=>perform('acceptQuote',{ticketId:t.id,amount:t.fee,contact:contact.value,consent:yes.checked}));
    c.append(f);actions(c,btn('Decline quote and return to portfolio',()=>perform('decline'),false));
  }else{
    const states={waiting:'Request is in the studio team queue',contacted:'The specialist recorded contacting you',delivered:'Delivered'};
    c.append(el('p',states[t.status]||t.status));
    if(t.contact)c.append(el('p','Contact method: '+t.contact));
    if(t.acceptedFee)c.append(el('p','Approved consultation: '+t.acceptedFee+' SAR'));
  }
}
function expertControls(c,d){
  if(!accountExpert||!['handoff','dispute','consultation'].includes(current.stage))return;
  const t=d.ticket;const box=block('Studio team actions',c);
  if(t.status==='waiting')actions(box,btn('Record contact after completion',()=>perform('contact'),false));
  if(current.stage==='handoff')return;
  const f=el('form'),g=el('div',null,'field-grid'),note=field({key:'note',label:current.stage==='dispute'?'Brief review outcome':'Agreed correction after consultation',long:true,full:true,max:1300},g);
  if(current.stage==='dispute'){
    const mode=field({key:'mode',label:'Resolution type',options:[['resolveFree','Free repair'],['quoteChange','Offer consultation quote']]},g);
    const fee=field({key:'fee',label:'Quote amount in SAR',number:true,optional:true},g,500);fee.min='500';
    mode.onchange=()=>{fee.parentElement.hidden=mode.value!=='quoteChange';fee.required=mode.value==='quoteChange';};mode.onchange();f.append(g);submit(f,'Apply decision',()=>perform(mode.value,{amount:Number(fee.value),note:note.value}));
  }else{f.append(g);submit(f,'Deliver revised portfolio',()=>perform('deliverConsult',{note:note.value}));}
  box.append(f);
}
function renderProject(){
  pane.replaceChildren();const d=current.document;
  const mast=block(current.title);mast.append(el('p',stageNames[current.stage],'kicker'));
  const kind=d.brief.kind==='physical'?'Physical product':'Digital product';mast.append(el('p',kind+' · '+d.brief.sector+' · '+d.brief.market));
  const rec=el('details',null,'past');rec.append(el('summary','Original brief'));
  sub(rec,'Idea',d.brief.idea);sub(rec,'Customer and problem',d.brief.customer+' · '+d.brief.problem);mast.append(rec);
  if(d.summary&&current.stage!=='strategy'){
    const b=block('Approved brief'),summary=d.approvedSummary||d.summary.summary;
    b.append(el('p',summary));
    if(summary===d.summary.summary)b.append(summaryCredit());
    if(d.strategy?.length){const v=el('details',null,'past');v.append(el('summary','Approved direction'));d.strategy.forEach(x=>sub(v,x.question,x.answer));b.append(v);}
  }
  if(current.stage==='strategy')strategyForm(pane,d);
  if(d.market)marketView(d);
  if(d.study)studyView(d);
  if(d.portfolio){const host=el('div');pane.append(host);window.renderShowcase(host,d.brief.kind,d.portfolio);}
  if(nextAction[current.stage]){const n=nextAction[current.stage];const chain=n!=='summary';actions(pane,btn(actionNames[n]+(chain?' · Continue journey through ':' · ')+costLabel(n,chain),()=>perform(n,{},chain)));}
  if(current.stage==='review'){const c=block('Review and approve version '+d.portfolioVersion);reviewForm(c,d);}
  else if(d.ticket){const c=block(stageNames[current.stage]);if(current.isOwner!==false||current.stage!=='quote')ticketView(c,d);expertControls(pane,d);}
  if(d.portfolio&&current.isOwner!==false)sharing(pane,d);
  if(d.history.length){
    const h=el('details',null,'past');h.append(el('summary','Approval and revision history'));d.history.forEach(x=>h.append(el('p',isoDate(x.at||x.closedAt||x.createdAt)+' · '+({free_fix:'Free repair',consultation_agreement:'Consultation approval',approved:'Portfolio approval',consult:'Consultation'}[x.kind]||'Review')+(x.fee!=null?' · '+x.fee+' SAR':''))));pane.append(h);
  }
}
function pointCount(value){
  if(value===1)return '1 credit';
  if(value===2)return '2 credits';
  return value.toLocaleString('en-SA')+(value>=3&&value<=10?' credits':' credit');
}
const pointNames={summary:'Brief drafting',research:'Competitor research',study:'Feasibility study',portfolio:'Build portfolio',grant:'Add credits',subscription:'Subscription credits'};
function renderWallet(wallet){
  pane.replaceChildren();
  const card=block('PROJECT R STUDIO wallet'),balance=el('div',null,'points-balance');
  balance.append(el('span','Available processing credits'),el('strong',pointCount(wallet.balance)));
  card.append(balance);
  if(membership)renderSubscription(card,membership);
  const number=el('code',wallet.number,'points-number');number.dir='ltr';
  const copy=btn('Copy wallet number',async()=>{
    try{await navigator.clipboard.writeText(wallet.number);flag('Wallet number copied.');}
    catch{flag('You can select and copy the wallet number.');}
  },false);
  const numberLine=el('div',null,'work-actions');numberLine.append(number,copy);card.append(numberLine);
  walletRates();
  const log=block('Recent wallet activity');
  if(!wallet.history.length)log.append(el('p','Top-ups and processing activity will appear here.'));
  for(const tx of wallet.history){
    const row=el('div',null,'file-line');
    const state={held:'Reserved',released:'Returned to balance',posted:tx.amount>0?'Added':'Deducted'}[tx.state];
    row.append(el('span',pointNames[tx.action]||tx.action),el('span',pointCount(Math.abs(tx.amount))+' · '+state),el('small',isoDate(tx.createdAt)));log.append(row);
  }
  if(wallet.canGrant)renderGrantForm();
}
function renderSubscription(card,info){
  const sub=info.subscription;if(!sub)return;
  const states={draft:'Awaiting first payment',active:'Active',canceled:'Cancelled',cancelled:'Cancelled',failed:'Could not create payment',creating:'Creating payment link',uncompleted:'Renewal stopped',completed:'Complete'};
  const name=plans.find(p=>p.id===sub.plan)?.name||sub.plan;
  card.append(el('h3','Subscription '+name),el('p',(states[sub.status]||sub.status)+' · '+sub.price+' SAR per month'));
  if(sub.nextPay&&sub.status==='active')card.append(el('p','Next renewal reported by the payment provider: '+sub.nextPay));
  if(sub.checkout){const link=el('a','Continue payment','btn outline');link.href=sub.checkout;card.append(link);}
  if(['draft','active'].includes(sub.status)){
    const cancel=btn('Stop monthly renewal',async()=>{
      if(!confirm('Stop monthly renewal for your previous subscription?'))return;
      cancel.disabled=true;
      try{membership=await memberRequest('subscription/cancel',{id:sub.id});renderWallet(await refreshWallet());flag('Monthly renewal stopped.');}
      catch(e){cancel.disabled=false;errorView(e);}
    },false);
    actions(card,cancel);
  }
}
function walletRates(){
  const rates=block('Processing cost');
  processingOrder.forEach(action=>{
    const line=el('div',null,'file-line');line.append(el('span',pointNames[action]),el('strong',pointCount(processingRates[action])));rates.append(line);
  });
  rates.append(el('p','Credits are reserved when a step starts and charged when its result is saved. If processing fails, credits return to your balance. Saving an idea and repairing defects against the approved brief are free.','section-note'));
}
function renderGrantForm(){
  const box=block('Add credits to a client wallet'),f=el('form'),g=el('div',null,'field-grid');
  const number=field({key:'wallet',label:'Client wallet number',max:36},g);number.dir='ltr';
  const amount=field({key:'points',label:'Number of credits',number:true},g);amount.min='1';amount.step='1';amount.max='100000';
  f.append(g);box.append(f);
  let sending=false;
  submit(f,'Add credits',async()=>{
    if(sending)return;
    sending=true;
    const target=number.value.trim().toLowerCase(),points=Number(amount.value);
    const key='rowaihy.pending-grant.'+target+'.'+points;
    const requestId=fromStorage(key).requestId||requestUUID();
    try{
      localStorage.setItem(key,JSON.stringify({requestId}));
      f.querySelector('button').disabled=true;
      await api('wallet/grant',{method:'POST',body:JSON.stringify({number:target,amount:points,requestId})});
      localStorage.removeItem(key);f.reset();
      flag('Added '+pointCount(points)+' to the client wallet.');
      try{renderWallet(await refreshWallet());}catch{flag('Credits added. Refresh the page to see the updated balance.');}
    }catch(e){errorView(e);}
    finally{sending=false;f.querySelector('button').disabled=false;}
  });
}
async function main(){
  pane.replaceChildren();flag('Opening project workspace…');
  const query=new URLSearchParams(location.search);
  try{
    const auth=await memberRequest('auth/session');
    if(!auth.authenticated){location.replace(loginUrl());return;}
    const info=await api('projects');accountExpert=info.isExpert;queueLink.hidden=!accountExpert;flag();
    const wallet=await refreshWallet();
    if(query.has('wallet')){
      membership=await memberRequest('subscription');
      renderWallet(wallet);
      try{membership=await memberRequest('subscription/sync',{});renderWallet(await refreshWallet());}catch(e){errorView(e);}
      return;
    }
    if(query.has('new')){renderIntake(info.intakeNotice);return;}
    if(query.has('queue')){
      const q=await api('queue');const c=block('Expert team requests');const services=el('a','Request review','btn outline');services.href='order-review.html?queue=1#orders-section';c.append(services);if(!q.items.length)c.append(el('p','No requests are waiting for the team.'));
      q.items.forEach(i=>{const line=el('div',null,'ticket-line'),a=el('a',i.title,'result-link');a.href='?id='+i.id;line.append(a,el('span',stageNames[i.stage]),el('small',i.ticket.contact||'Review project'));c.append(line);});return;
    }
    if(query.has('id')){current=await api('projects/'+encodeURIComponent(query.get('id')));renderProject();return;}
    if(!info.projects.length){renderIntake(info.intakeNotice);return;}
    const c=block('My projects');info.projects.forEach(p=>{const row=el('div',null,'file-line'),a=el('a',p.title);a.href='?id='+p.id;row.append(a,el('span',stageNames[p.stage]),el('small',isoDate(p.updated_at)));c.append(row);});
  }catch(e){
    if(e.code==='signin'&&query.has('wallet')){
      const intro=block('PROJECT R STUDIO wallet');intro.append(el('p','Sign in to view your processing credits and wallet number.'));walletRates();
    }
    errorView(e);
  }
}
document.getElementById('logout').onclick=async()=>{
  try{throw new Error('This private workspace uses your Netlify session. Sign out through your Netlify account menu.');}catch(e){errorView(e);}
};
main();
