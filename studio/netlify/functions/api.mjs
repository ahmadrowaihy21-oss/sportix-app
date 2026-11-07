const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function handleApi(req,context,cfg,fetcher=fetch){
 if(!cfg?.ownerId||!cfg?.secret||!cfg?.token||!cfg?.origin||!cfg?.backend)return json({error:'The secure connection is not configured.'},503);
 if(!context.user)return json({error:'Sign in with the project owner’s Netlify account.',code:'signin'},401);
 if(context.user.id!==cfg.ownerId)return json({error:'This private workspace is restricted to the founder.',code:'forbidden'},403);
 const url=new URL(req.url);
 if(url.origin!==cfg.origin)return json({error:'Open the production workspace to continue.'},403);
 if(!['GET','POST'].includes(req.method))return json({error:'Method not allowed.'},405);
 if(!/^\/api\/(core|studio)\/[a-z0-9-]+(?:\/[a-z0-9-]+)?$/.test(url.pathname)||url.pathname==='/api/studio/mind-operations')return json({error:'Unknown route.'},404);
 if(req.method==='POST'&&(req.headers.get('origin')!==url.origin||!req.headers.get('content-type')?.startsWith('application/json')))return json({error:'Invalid request origin or content type.'},403);
 if(Number(req.headers.get('content-length'))>1500000)return json({error:'Request too large.'},413);
 const body=req.method==='POST'?await req.text():'';
 if(body.length>1500000)return json({error:'Request too large.'},413);
 const envelope=JSON.stringify({v:1,at:Date.now(),nonce:crypto.randomUUID(),origin:cfg.origin,userId:context.user.id,path:url.pathname+url.search,method:req.method,body});
 const enc=new TextEncoder();const key=await crypto.subtle.importKey('raw',enc.encode(cfg.secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signature=Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(envelope))),b=>b.toString(16).padStart(2,'0')).join('');
 try{
  const result=await fetcher(cfg.backend+'/api/netlify-bridge',{method:'POST',redirect:'manual',signal:AbortSignal.timeout(55000),headers:{'Content-Type':'application/json','X-Project-R-Signature':signature,'OAI-Sites-Authorization':'Bearer '+cfg.token},body:envelope});
  if(!result.headers.get('content-type')?.includes('application/json'))return json({error:'The secure backend could not be reached. No result was confirmed.'},502);
  return new Response(result.body,{status:result.status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return json({error:'The request timed out or the connection failed. Refresh to check saved data before trying again.'},504)}
}
export default async(req,context)=>{
 let cfg;try{cfg=JSON.parse(Netlify.env.get('PROJECT_R_BRIDGE_CONFIG')||'null')}catch{return json({error:'Connection configuration is invalid.'},503)}
 return handleApi(req,context,cfg);
};
export const config={path:['/api/core/*','/api/studio/*']};
