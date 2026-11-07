import {serviceById,catalogVersion} from './service-catalog-en.js';
export const draftKey='project-r.journey.v1';
export function blankDraft(){return {service:'',projectName:'',sector:'',market:'Saudi Arabia',details:'',contact:'',horizon:'3',analysisDomains:'',analysisFrom:'',analysisTo:'',consent:false};}
export function cleanDraft(value){
  const result=blankDraft();
  if(!value||typeof value!=='object')return result;
  for(const key of Object.keys(result))if(typeof value[key]===typeof result[key])result[key]=typeof value[key]==='string'?value[key].slice(0,3000):value[key];
  if(!serviceById(result.service))result.service='';
  return result;
}
export function validateDraft(d,step=3,month=new Date().toISOString().slice(0,7)){
  const errors={};
  if(!serviceById(d.service))errors.service='Choose the service closest to your needs.';
  if(step>=2){
    for(const [key,max,message] of [['projectName',80,'Enter a project name. A working name is fine.'],['sector',100,'Enter your industry or sector.'],['market',150,'Enter your target market or country.'],['details',2500,'Describe your idea, who it serves, and what you want to achieve.']])if(!d[key]?.trim()||d[key].length>max)errors[key]=message;
    if(d.service==='growth'&&![3,4,5].includes(Number(d.horizon)))errors.horizon='Choose a period of 3 to 5 years.';
    if(d.service==='market-analysis'){
      const domains=d.analysisDomains.trim().split(/[\s,،;]+/).filter(Boolean);
      if(!domains.length||domains.length>10||domains.some(value=>{try{const u=new URL(value.includes('://')?value:'https://'+value),h=u.hostname;return !['https:','http:'].includes(u.protocol)||!!(u.username||u.password||u.port)||!h.includes('.')||/^\d[\d.]+$/.test(h)||h.split('.').some(p=>!/^([a-z0-9]|[a-z0-9][a-z0-9-]{0,61}[a-z0-9])$/i.test(p));}catch{return true;}}))errors.analysisDomains='Enter 1 to 10 valid websites, such as example.com.';
      if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(d.analysisFrom))errors.analysisFrom='Choose a start month.';
      if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(d.analysisTo)||d.analysisTo>month||d.analysisFrom>d.analysisTo)errors.analysisTo='Choose an end month on or after the start, no later than the current month.';
    }
  }
  if(step>=3){if(!d.contact?.trim()||d.contact.length>180)errors.contact='Add an email address or contact method.';if(d.consent!==true)errors.consent='Review and select the consent checkbox before submitting.';}
  return errors;
}
export function completedSteps(d){return !d.service?0:Object.keys(validateDraft(d,2)).length?1:Object.keys(validateDraft(d,3)).length?2:3;}
export function payload(d,id){return {...cleanDraft(d),id,catalogVersion};}
export function createSubmission(request,uuid,store={}){
  let pending=null,inflight=false;
  try{const saved=store.load?.();if(saved&&typeof saved.signature==='string'&&typeof saved.id==='string')pending=saved;}catch{}
  return async function submit(d,authenticated){
    if(!authenticated)throw new Error('Sign in before submitting your request.');
    if(Object.keys(validateDraft(d)).length)throw new Error('Complete the details and consent before submitting.');
    if(inflight)throw new Error('Your request is being sent.');
    const signature=JSON.stringify(cleanDraft(d));
    if(!pending||pending.signature!==signature){pending={signature,id:uuid()};try{store.save?.(pending);}catch{}}
    inflight=true;
    try{const result=await request('service-requests',payload(d,pending.id));pending=null;try{store.save?.(null);}catch{}return result;}finally{inflight=false;}
  };
}
