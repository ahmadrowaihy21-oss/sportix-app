import {execute,seedWorkflow,type Command,type WorkflowState} from './workflow';
export const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function sandboxApi(request:Request,db:D1Database|undefined,identity:string|null):Promise<Response>{
 if(!identity)return json({error:'UNAUTHENTICATED'},401);
 if(!db)return json({error:'DATABASE_UNAVAILABLE'},503);
 const url=new URL(request.url);
 if(!['GET','POST'].includes(request.method))return json({error:'METHOD_NOT_ALLOWED'},405);
 if(request.method==='POST'&&(request.headers.get('origin')!==url.origin||!request.headers.get('content-type')?.startsWith('application/json')))return json({error:'INVALID_ORIGIN'},403);
 const owner=identity;let cmd:Command|undefined;
 if(request.method==='POST'){
  const raw=await request.text();if(raw.length>8192)return json({error:'PAYLOAD_TOO_LARGE'},413);
  try{cmd=JSON.parse(raw);}catch{return json({error:'INVALID_JSON'},400);}
 }
 try{
  await db.prepare('INSERT OR IGNORE INTO workflow_workspaces(owner,revision,document,updated_at) VALUES(?,0,?,?)').bind(owner,JSON.stringify(seedWorkflow()),new Date().toISOString()).run();
  for(let attempt=0;attempt<12;attempt++){
   const row=await db.prepare('SELECT revision,document FROM workflow_workspaces WHERE owner=?').bind(owner).first<{revision:number;document:string}>();
   if(!row)return json({error:'DATABASE_UNAVAILABLE'},503);
   const state=JSON.parse(row.document) as WorkflowState;
   if(request.method==='GET')return json({state,storage:'D1_ATOMIC_SANDBOX',synthetic:true,externalDelivery:'DISABLED'});
   let outcome;try{outcome=execute(state,cmd!);}catch(e){const code=e instanceof Error?e.message:'INVALID_COMMAND';return json({error:code},['FORBIDDEN','MODULE_FORBIDDEN'].includes(code)?403:['VERSION_CONFLICT','IDEMPOTENCY_CONFLICT','OUT_OF_STOCK','SLOT_CONFLICT'].includes(code)?409:422);}
   if(outcome.replayed)return json({state,result:outcome.result,replayed:true});
   const document=JSON.stringify(outcome.state);if(document.length>1000000)return json({error:'SANDBOX_LIMIT'},422);
   const updated=await db.prepare('UPDATE workflow_workspaces SET revision=?,document=?,updated_at=? WHERE owner=? AND revision=?').bind(outcome.state.revision,document,new Date().toISOString(),owner,row.revision).run();
   if(updated.meta.changes===1)return json({state:outcome.state,result:outcome.result,replayed:false});
  }
  return json({error:'BUSY_RETRY_SAME_KEY',retryable:true},409);
 }catch{return json({error:'DATABASE_UNAVAILABLE'},503);}
}
