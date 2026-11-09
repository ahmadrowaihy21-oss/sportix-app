import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHub } from '../src/server.mjs';
import { renderReport } from '../src/report.mjs';
async function until(read,predicate){for(let i=0;i<120;i++){const value=await read();if(predicate(value))return value;await new Promise(r=>setTimeout(r,20));}throw Error('Run did not finish');}
test('local end-to-end project creation, actual HTTP check, report and persistence snapshot',async t=>{
  const fixture=http.createServer((_req,res)=>{res.setHeader('Content-Type','application/json');res.end('{"ready":true}');});
  await new Promise(done=>fixture.listen(0,'127.0.0.1',done));
  const hub=await createHub({port:0,dbPath:':memory:'});
  t.after(async()=>{await hub.close();await new Promise(done=>{fixture.close(done);fixture.closeAllConnections();});});
  const request=(path,method='GET',body)=>fetch(hub.url+path,{method,headers:{Origin:hub.url,'X-Rowaihy-Request':'1','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  assert.equal((await request('/api/health')).status,200);
  const denied=await fetch(hub.url+'/api/projects',{method:'POST',headers:{Origin:'https://untrusted.test','Content-Type':'application/json'},body:'{}'});assert.equal(denied.status,403);
  const response=await request('/api/projects','POST',{name:'Project <script>',baseUrl:'http://127.0.0.1:'+fixture.address().port,checks:[{name:'Health',path:'/',jsonPath:'ready',jsonExpected:'true'}]});
  assert.equal(response.status,201);const p=await response.json();
  const launched=await request('/api/projects/'+p.id+'/runs','POST');assert.equal(launched.status,202);const run=await launched.json();
  const result=await until(async()=>(await request('/api/runs/'+run.id)).json(),r=>!['queued','running'].includes(r.status));
  assert.equal(result.status,'passed');assert.equal(result.results.length,1);
  const report=await request('/api/runs/'+run.id+'/report');assert.match(report.headers.get('Content-Disposition'),/attachment/);const html=await report.text();assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('Project <script>'));
  const exported=await(await request('/api/export')).json();assert.equal(exported.version,1);assert.equal(exported.projects.length,1);
  const invalid=await request('/api/projects/import','POST',{version:1,projects:[exported.projects[0],{name:'bad'}]});assert.equal(invalid.status,400);
  assert.equal((await(await request('/api/state')).json()).projects.length,1);
});
test('report safely encodes project text and failure diagnostics',()=>{
  const html=renderReport({id:'test',project:{name:'<img src=x onerror=alert(1)>',baseUrl:'http://localhost/',checks:[{}]},results:[{name:'<script>',path:'/',passed:false,status:500,durationMs:3,error:'<svg onload=x>',assertions:[]}],status:'failed',createdAt:'now'});
  assert.ok(!html.includes('<svg onload=x>'));assert.ok(html.includes('&lt;svg'));
});
