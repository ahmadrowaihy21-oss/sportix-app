import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProject } from '../src/validation.mjs';
const base = extra => ({name:'مشروع',baseUrl:'http://localhost:3000/',checks:[{name:'الرئيسية',path:'/'}],...extra});
test('normalizes expected status, timeout and JSON types',()=>{
  const p=normalizeProject(base({checks:[{name:'API',path:'/health',expectedStatus:'200',maxMs:'1000',jsonPath:'data.ok',jsonExpected:'true'}]}));
  assert.equal(p.checks[0].maxMs,1000);assert.equal(p.checks[0].expectedStatus,200);
});
test('rejects credential URLs, unsupported schemes and cross-origin paths',()=>{
  for(const baseUrl of ['file:///etc/passwd','http://user:password@localhost/','javascript:alert(1)'])assert.throws(()=>normalizeProject(base({baseUrl})));
  for(const path of ['https://other.test/','//other.test/','/a\\b'])assert.throws(()=>normalizeProject(base({checks:[{name:'x',path}]})));
});
test('rejects unsafe methods, invalid expected values and invalid HEAD body checks',()=>{
  for(const check of [{method:'POST'},{expectedStatus:999},{maxMs:99},{jsonPath:'data.ok',jsonExpected:'undefined'},{method:'HEAD',contains:'x'}])
    assert.throws(()=>normalizeProject(base({checks:[{name:'x',path:'/',...check}]})));
  assert.throws(()=>normalizeProject(base({checks:[]})));
});
