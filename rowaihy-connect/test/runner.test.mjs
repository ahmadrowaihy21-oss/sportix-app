import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { runCheck, RunQueue } from '../src/runner.mjs';
import { normalizeProject } from '../src/validation.mjs';
import { Store } from '../src/store.mjs';
const check=overrides=>({id:'1',name:'API',path:'/health',method:'GET',expectedStatus:200,maxMs:2000,contains:'',jsonPath:'',jsonExpected:'',...overrides});
test('verifies status, literal content and semantic JSON equality without following redirects',async()=>{
  let options;
  const r=await runCheck('http://localhost/',check({contains:'ok',jsonPath:'data',jsonExpected:'{"b":2,"a":1}'}),{fetcher:async(_url,o)=>{options=o;return Response.json({ok:true,data:{a:1,b:2}});}});
  assert.equal(r.passed,true);assert.equal(options.redirect,'manual');
  const wrong=await runCheck('http://localhost/',check({jsonPath:'ok',jsonExpected:'"true"'}),{fetcher:async()=>Response.json({ok:true})});
  assert.equal(wrong.passed,false);
});
test('reports response mismatch, malformed JSON and network failure distinctly',async()=>{
  const status=await runCheck('http://localhost/',check(),{fetcher:async()=>new Response('',{status:503})});assert.equal(status.passed,false);assert.equal(status.status,503);
  const bad=await runCheck('http://localhost/',check({jsonPath:'ok',jsonExpected:'true'}),{fetcher:async()=>new Response('<html>')});assert.equal(bad.passed,false);assert.match(bad.assertions[1].actual,/JSON/);
  const error=await runCheck('http://localhost/',check(),{fetcher:async()=>{throw Error('offline');}});assert.match(error.error,/offline/);
});
test('caps downloaded response bodies',async()=>{
  const r=await runCheck('http://localhost/',check(),{fetcher:async()=>new Response('x'.repeat(512*1024+1))});
  assert.equal(r.passed,false);assert.match(r.error,/512/);
});
test('applies an actual request timeout',async t=>{
  const fixture=http.createServer((_req,res)=>{const timer=setTimeout(()=>res.end('ok'),800);res.on('close',()=>clearTimeout(timer));});
  await new Promise(done=>fixture.listen(0,'127.0.0.1',done));
  t.after(()=>new Promise(done=>{fixture.close(done);fixture.closeAllConnections();}));
  const r=await runCheck('http://127.0.0.1:'+fixture.address().port,check({maxMs:100}));
  assert.equal(r.passed,false);assert.match(r.error,/مهلة/);
});
test('cancellation does not turn an active run into success',async()=>{
  const store=new Store(':memory:');
  const project=store.saveProject(normalizeProject({name:'q',baseUrl:'http://localhost/',checks:[{name:'q',path:'/'}]}));
  const queue=new RunQueue(store,{fetcher:(_url,options)=>new Promise((_resolve,reject)=>{options.signal.addEventListener('abort',()=>reject(Error('cancelled')),{once:true});})});
  const run=store.createRun(project);queue.enqueue(run);assert.equal(queue.cancel(run.id),true);
  await queue.close();assert.equal(store.getRun(run.id).status,'cancelled');assert.equal(store.getRun(run.id).results.length,0);store.close();
});

test('runs at most two projects concurrently and drains queued work',async()=>{
  const store=new Store(':memory:');let current=0,peak=0;
  const queue=new RunQueue(store,{concurrency:2,fetcher:async()=>{current++;peak=Math.max(peak,current);await new Promise(r=>setTimeout(r,25));current--;return Response.json({ok:true});}});
  const runs=[];
  for(let i=0;i<5;i++){const p=store.saveProject(normalizeProject({name:'Project '+i,baseUrl:'http://localhost/',checks:[{name:'Home',path:'/'}]}));const r=store.createRun(p);runs.push(r.id);queue.enqueue(r);}
  for(let i=0;i<100&&runs.some(id=>store.getRun(id).status!=='passed');i++)await new Promise(r=>setTimeout(r,15));
  assert.equal(peak,2);assert.ok(runs.every(id=>store.getRun(id).status==='passed'));
  await queue.close();store.close();
});
