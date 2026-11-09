import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { Store } from './store.mjs';
import { RunQueue } from './runner.mjs';
import { InputError, normalizeProject } from './validation.mjs';
import { renderReport } from './report.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const headers = {'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"};
async function readJson(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new InputError('استخدم JSON');
  let content=''; let size=0;
  for await (const chunk of req) { size+=chunk.length; if(size>256*1024) throw new InputError('حجم الطلب أكبر من الحد المسموح'); content+=chunk; }
  try { return JSON.parse(content); } catch { throw new InputError('JSON غير صالح'); }
}
function json(res, value, status=200) { res.writeHead(status,{...headers,'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value)); }
export async function createHub({port=4310, dbPath=join(root,'data','rowaihy.sqlite'), fetcher=fetch}={}) {
  if(!Number.isInteger(port)||port<0||port>65535) throw new Error('PORT غير صالح');
  const store=new Store(dbPath),queue=new RunQueue(store,{fetcher});
  const server=http.createServer(async(req,res)=>{
    try {
      const p=server.address().port;
      if(!['127.0.0.1:'+p,'localhost:'+p].includes(req.headers.host)) return json(res,{error:'اسم المضيف غير مسموح'},403);
      const origin='http://'+req.headers.host,url=new URL(req.url,origin),path=url.pathname;
      if(url.origin!==origin) return json(res,{error:'عنوان الطلب غير مسموح'},403);
      if(!['GET','HEAD'].includes(req.method)) {
        if(req.headers.origin!==origin||req.headers['x-rowaihy-request']!=='1') return json(res,{error:'افتح التطبيق من عنوانه المحلي لإجراء التعديلات'},403);
        if(!['POST','PUT','DELETE'].includes(req.method)) return json(res,{error:'طريقة غير مدعومة'},405);
      }
      if(req.method==='GET'&&path==='/api/health') return json(res,{ok:true,app:'ROWAIHY CONNECT',version:'0.1.0',mode:'local'});
      if(req.method==='GET'&&path==='/api/state') return json(res,{projects:store.listProjects(),runs:store.listRuns(),runner:{active:queue.active.size,queued:queue.pending.length}});
      if(req.method==='GET'&&path==='/api/export') {res.setHeader('Content-Disposition','attachment; filename="rowaihy-projects.json"');return json(res,{version:1,exportedAt:new Date().toISOString(),projects:store.listProjects().map(({name,baseUrl,notes,checks})=>({name,baseUrl,notes,checks}))});}
      if(req.method==='POST'&&path==='/api/projects/import') {
        const d=await readJson(req);
        if(d.version!==1||!Array.isArray(d.projects)||!d.projects.length||d.projects.length>50) throw new InputError('ملف المشاريع غير صالح؛ الحد 50 مشروعًا');
        const documents=d.projects.map(normalizeProject);store.db.exec('BEGIN');
        try {for(const document of documents)store.saveProject(document);store.db.exec('COMMIT');}
        catch(error){store.db.exec('ROLLBACK');throw error;}
        return json(res,{imported:documents.length},201);
      }
      if(req.method==='POST'&&path==='/api/projects') return json(res,store.saveProject(normalizeProject(await readJson(req))),201);
      const projectMatch=path.match(/^\/api\/projects\/([a-f0-9-]+)$/);
      if(projectMatch&&req.method==='PUT') {
        if(!store.getProject(projectMatch[1]))return json(res,{error:'المشروع غير موجود'},404);
        return json(res,store.saveProject(normalizeProject(await readJson(req)),projectMatch[1]));
      }
      if(projectMatch&&req.method==='DELETE') {
        if(store.hasOpenRun(projectMatch[1]))return json(res,{error:'أوقف تشغيل اختبارات المشروع قبل حذفه'},409);
        return json(res,{deleted:store.deleteProject(projectMatch[1])});
      }
      const projectRun=path.match(/^\/api\/projects\/([a-f0-9-]+)\/runs$/);
      if(projectRun&&req.method==='POST') {
        const project=store.getProject(projectRun[1]);
        if(!project)return json(res,{error:'المشروع غير موجود'},404);
        if(store.hasOpenRun(project.id))return json(res,{error:'يوجد تشغيل جارٍ لهذا المشروع'},409);
        if(queue.pending.length>=20)return json(res,{error:'قائمة الانتظار ممتلئة'},429);
        const run=store.createRun(project);queue.enqueue(run);return json(res,run,202);
      }
      const match=path.match(/^\/api\/runs\/([a-f0-9-]+)(?:\/(cancel|report))?$/);
      if(match) {
        const run=store.getRun(match[1]);if(!run)return json(res,{error:'التشغيل غير موجود'},404);
        if(req.method==='GET'&&!match[2])return json(res,run);
        if(req.method==='POST'&&match[2]==='cancel')return json(res,{cancelled:queue.cancel(run.id)});
        if(req.method==='GET'&&match[2]==='report'){res.writeHead(200,{...headers,'Content-Type':'text/html; charset=utf-8','Content-Disposition':'attachment; filename="rowaihy-run-'+run.id+'.html"'});return res.end(renderReport(run));}
      }
      const files={'/':['index.html','text/html'],'/index.html':['index.html','text/html'],'/style.css':['style.css','text/css'],'/app.js':['app.js','text/javascript']};
      if(['GET','HEAD'].includes(req.method)&&files[path]) {
        const [name,type]=files[path],content=await readFile(join(root,'public',name));
        res.writeHead(200,{...headers,'Content-Type':type+'; charset=utf-8'});return res.end(req.method==='HEAD'?undefined:content);
      }
      return json(res,{error:'المسار غير موجود'},404);
    }catch(error){if(!res.headersSent)json(res,{error:error instanceof InputError?error.message:'تعذر إكمال العملية محليًا'},error instanceof InputError?400:500);else res.end();}
  });
  server.requestTimeout=15000;server.headersTimeout=10000;
  await new Promise((done,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',done);});
  return {server,store,queue,url:'http://127.0.0.1:'+server.address().port,close:async()=>{
    const closed=new Promise(done=>server.close(done));server.closeIdleConnections();await queue.close();await closed;store.close();
  }};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const hub=await createHub({port:Number(process.env.PORT??4310)});
  console.log('ROWAIHY CONNECT: '+hub.url);console.log('Local test workspace. Press Ctrl+C to stop.');
  let closing=false;const shutdown=async()=>{if(closing)return;closing=true;await hub.close();process.exit(0);};
  process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
}
