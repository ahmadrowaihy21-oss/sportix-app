import {englishError} from './english-ui.js';
export function loginUrl(){
  return 'login.html?next='+encodeURIComponent(location.pathname+location.search+location.hash);
}
export function nextPage(){
  const fallback='/studio.html';
  try{
    const dest=new URL(new URLSearchParams(location.search).get('next')||fallback,location.origin);
    const allowed=['/studio.html','/mind.html','/workspace.html','/plans.html','/services.html','/order-review.html','/showcase.html','/orders.html'];
    return dest.origin===location.origin&&allowed.includes(dest.pathname)?dest.pathname+dest.search+dest.hash:fallback;
  }catch{return fallback;}
}
export async function request(path,body){
  const r=await fetch('/api/studio/'+path,{method:body===undefined?'GET':'POST',cache:'no-store',
    headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const result=await r.json();if(!r.ok){const e=new Error(englishError(result.error,result.code));e.code=result.code;throw e;}
  return result;
}
