import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../src/store.mjs';
import { normalizeProject } from '../src/validation.mjs';
const project=()=>normalizeProject({name:'Original',baseUrl:'http://localhost/',checks:[{name:'Home',path:'/'}]});
test('persists definitions and marks unfinished work interrupted after restart',()=>{
  const dir=mkdtempSync(join(tmpdir(),'rowaihy-'));
  try{
    const file=join(dir,'test.sqlite');let store=new Store(file);const p=store.saveProject(project()),run=store.createRun(p);
    store.startRun(run.id);store.saveProject({...project(),name:'Edited'},p.id);store.close();
    store=new Store(file);assert.equal(store.getProject(p.id).name,'Edited');assert.equal(store.getRun(run.id).project.name,'Original');assert.equal(store.getRun(run.id).status,'interrupted');store.close();
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('keeps newest 200 runs visible and prevents deleting projects with active work',()=>{
  const store=new Store(':memory:'),p=store.saveProject(project());let latest;
  for(let i=0;i<205;i++){latest=store.createRun(p);store.finishRun(latest.id,'passed');}
  assert.equal(store.listRuns().length,200);assert.equal(store.listRuns()[0].id,latest.id);
  const active=store.createRun(p);assert.throws(()=>store.deleteProject(p.id));store.finishRun(active.id,'cancelled');
  assert.equal(store.deleteProject(p.id),true);assert.equal(store.getRun(latest.id),null);store.close();
});

test('refuses a second live database owner before altering active run state',()=>{
  const dir=mkdtempSync(join(tmpdir(),'rowaihy-owner-'));
  try {
    const file=join(dir,'test.sqlite'),first=new Store(file),p=first.saveProject(project()),run=first.createRun(p);
    assert.throws(()=>new Store(file),/نسخة أخرى/);
    assert.equal(first.getRun(run.id).status,'queued');
    first.close();const recovered=new Store(file);assert.equal(recovered.getRun(run.id).status,'interrupted');recovered.close();
  } finally {rmSync(dir,{recursive:true,force:true});}
});
