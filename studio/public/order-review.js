import {serviceName} from './service-catalog-en.js';
import {request,loginUrl} from './member-nav.js';
const $=id=>document.getElementById(id),note=$('request-status');
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
let expert=false,queue=new URLSearchParams(location.search).get('queue')==='1';
const states={requested:'Awaiting scope review',reviewing:'Under review',quoted:'Quote awaiting your approval',accepted:'Quote approved · awaiting payment confirmation'};
const flag=(message,bad=false)=>{note.textContent=message;note.style.color=bad?'#9a3228':'';};
function input(parent,label,type='text'){const l=node('label',label),i=node(type==='textarea'?'textarea':'input');if(type!=='textarea')i.type=type;i.required=true;l.append(i);parent.append(l);return i;}
async function update(item,action,data,button){button.disabled=true;try{await request('service-requests/'+item.id,{action,revision:item.revision,...data});await renderOrders();}catch(e){flag(e.message,true);button.disabled=false;}}
async function renderOrders(){
 const result=await request('service-requests'+(queue?'?queue=1':''));expert=result.isExpert;$('orders-section').hidden=false;$('queue-toggle').hidden=!expert;$('orders-title').textContent=queue?'Team requests':'My orders';$('queue-toggle').textContent=queue?'View my orders':'Review queue';const host=$('orders');host.replaceChildren();
 if(!result.items.length)host.append(node('p','No requests in this list yet.','r-note'));
 for(const item of result.items){
  const d=item.document,c=node('article',null,'r-order');c.append(node('span',states[item.status]||item.status,'r-badge'),node('h3',d.request.projectName+' · '+serviceName(item.service,d.package.name)),node('p',d.request.sector+' · '+d.request.market),node('p',d.request.details),node('p','Contact: '+d.request.contact),node('code',item.id));
  if(d.request.horizon)c.append(node('p','First-year plan plus a '+d.request.horizon+' year forecast and break-even analysis.'));
  if(d.request.analysis){const a=d.request.analysis;c.append(node('p','Websites: '+a.domains.join(' · ')),node('p','Period: '+a.from+' to '+a.to));}
  if(d.reviewNote)c.append(node('p','Team note: '+d.reviewNote));
  if(d.quote){c.append(node('h4','Quote: '+d.quote.price.toLocaleString('en-SA')+' SAR'),node('p',d.quote.scope));
   if(item.status==='quoted'&&!queue){const l=node('label',null,'check-label'),agree=node('input');agree.type='checkbox';l.append(agree,document.createTextNode('I approve the scope and price shown above. This step does not charge any payment.'));c.append(l);const b=node('button','Approve quote','btn dark');b.disabled=true;b.type='button';agree.onchange=()=>b.disabled=!agree.checked;b.onclick=()=>update(item,'accept',{quoteId:d.quote.id,price:d.quote.price,consent:agree.checked},b);c.append(b);}
  }
  if(expert&&queue&&['requested','reviewing','quoted'].includes(item.status)){
   const f=node('form'),amount=input(f,'Final quote amount (SAR)','number');amount.min=String(d.package.price??1);amount.step='.01';amount.value=d.quote?.price??d.package.price??'';
   const scope=input(f,'Scope, deliverables, timeline, costs, tax, and renewal if applicable','textarea');scope.maxLength=3500;scope.value=d.quote?.scope||'';
   const b=node('button','Save client quote','btn dark');b.type='submit';f.append(b);f.onsubmit=e=>{e.preventDefault();if(f.reportValidity())update(item,'quote',{price:Number(amount.value),scope:scope.value},b);};c.append(f);
  }
  const tracking=node('a','Track production and messages →','btn outline');tracking.href='orders.html?id='+encodeURIComponent(item.id);c.append(tracking);host.append(c);
 }
}
$('queue-toggle').onclick=async()=>{queue=!queue;try{await renderOrders();}catch(e){flag(e.message,true);}};
async function init(){
 try{const auth=await request('auth/session');$('request-login').href=loginUrl();$('request-login').hidden=auth.authenticated;
 $('auth-note').textContent=auth.authenticated?'Review and approve your project quotes here.':auth.configured?'Sign in to review your requests.':'Google sign-in is awaiting activation. Your orders will appear after you sign in.';
 if(auth.authenticated)await renderOrders();
 }catch(e){flag(e.message,true);}
}
init();
