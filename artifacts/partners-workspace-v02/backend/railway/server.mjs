// Isolated synthetic sandbox adapter. No live partners, payment or outbound integrations.
import {createServer} from 'node:http';
import {createHash,timingSafeEqual} from 'node:crypto';
import pg from 'pg';
import {execute,seedWorkflow} from './workflow.mjs';
const secret=process.env.SANDBOX_SERVICE_TOKEN;
if(!secret||secret.length<32||!process.env.DATABASE_URL)throw new Error('DATABASE_URL and a strong SANDBOX_SERVICE_TOKEN are required');
const digest=s=>createHash('sha256').update(s).digest();
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:5000,statement_timeout:5000});
function send(res,code,body){res.writeHead(code,{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(body));}
const server=createServer(async(req,res)=>{
 if(req.url==='/health'&&req.method==='GET'){try{await pool.query('SELECT 1');send(res,200,{ok:true,mode:'SYNTHETIC_ONLY',externalDelivery:'DISABLED'});}catch{send(res,503,{ok:false});}return;}
 if(req.url!=='/v1/sandbox'){send(res,404,{error:'NOT_FOUND'});return;}
 if(!timingSafeEqual(digest(req.headers.authorization||''),digest(`Bearer ${secret}`))){send(res,401,{error:'UNAUTHENTICATED'});return;}
 // This header is issued by the trusted BFF after authenticating the visitor.
 const owner=req.headers['x-sportix-sandbox-owner'];
 if(typeof owner!=='string'||!/^[A-Za-z0-9_-]{8,128}$/.test(owner)){send(res,400,{error:'OWNER_REQUIRED'});return;}
 if(!['GET','POST'].includes(req.method)){send(res,405,{error:'METHOD_NOT_ALLOWED'});return;}
 let cmd;
 if(req.method==='POST'){
  if(!req.headers['content-type']?.startsWith('application/json')){send(res,415,{error:'JSON_REQUIRED'});return;}
  let raw='',bytes=0;try{for await(const chunk of req){bytes+=chunk.length;if(bytes>8192){send(res,413,{error:'PAYLOAD_TOO_LARGE'});return;}raw+=chunk;}cmd=JSON.parse(raw);}catch{send(res,400,{error:'INVALID_JSON'});return;}
 }
 let client;
 try{
  client=await pool.connect();await client.query('BEGIN');
  await client.query('INSERT INTO sandbox_workspaces(owner,document) VALUES($1,$2) ON CONFLICT(owner) DO NOTHING',[owner,seedWorkflow()]);
  const {rows}=await client.query('SELECT document FROM sandbox_workspaces WHERE owner=$1 FOR UPDATE',[owner]);
  const state=rows[0].document;
  if(req.method==='GET'){await client.query('COMMIT');send(res,200,{state,storage:'POSTGRES_SANDBOX',synthetic:true,externalDelivery:'DISABLED'});return;}
  const outcome=execute(state,cmd);
  if(JSON.stringify(outcome.state).length>1000000)throw new Error('SANDBOX_LIMIT');
  if(!outcome.replayed)await client.query('UPDATE sandbox_workspaces SET revision=$1,document=$2,updated_at=now() WHERE owner=$3',[outcome.state.revision,outcome.state,owner]);
  await client.query('COMMIT');send(res,200,outcome);
 }catch(e){
  if(client)await client.query('ROLLBACK').catch(()=>{});
  const code=e instanceof Error?e.message:'';
  const known=/^[A-Z_]+$/.test(code);send(res,known?(['FORBIDDEN','MODULE_FORBIDDEN'].includes(code)?403:['VERSION_CONFLICT','IDEMPOTENCY_CONFLICT','OUT_OF_STOCK','SLOT_CONFLICT'].includes(code)?409:422):503,{error:known?code:'DATABASE_UNAVAILABLE'});
 }finally{client?.release();}
});
server.listen(Number(process.env.PORT||3000),'0.0.0.0');
process.on('SIGTERM',()=>server.close(()=>pool.end().finally(()=>process.exit(0))));
