import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleApi} from '../netlify/functions/api.mjs';
const cfg={ownerId:'founder',secret:'test-secret',token:'backend-token',origin:'https://studio.test',backend:'https://backend.test'};
const get=(path='/api/core/identity',headers={})=>new Request(cfg.origin+path,{headers});
test('rejects anonymous, spoofed headers and other logged-in users before contacting backend',async()=>{
 const noFetch=()=>{throw Error('should not fetch')};
 assert.equal((await handleApi(get(),{},cfg,noFetch)).status,401);
 assert.equal((await handleApi(get(undefined,{'oai-authenticated-user-id':'founder','x-nf-user':'founder'}),{},cfg,noFetch)).status,401);
 assert.equal((await handleApi(get(),{user:{id:'other'}},cfg,noFetch)).status,403);
});
test('signed server request uses verified account and never exposes credentials in response',async()=>{
 let outgoing;const response=await handleApi(get(),{user:{id:'founder'}},cfg,async(url,options)=>{outgoing={url,...options};return Response.json({ok:true})});
 assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:true});
 assert.equal(outgoing.url,'https://backend.test/api/netlify-bridge');assert.equal(JSON.parse(outgoing.body).userId,'founder');assert.equal(outgoing.redirect,'manual');assert.match(outgoing.headers['X-Project-R-Signature'],/^[a-f0-9]{64}$/);
 assert.equal(response.headers.get('OAI-Sites-Authorization'),null);
});
test('rejects cross-origin mutation, bridge recursion, unknown methods and wrong deployment origin',async()=>{
 const post=new Request(cfg.origin+'/api/core/operations',{method:'POST',headers:{origin:'https://evil.test','content-type':'application/json'},body:'{}'});
 assert.equal((await handleApi(post,{user:{id:'founder'}},cfg)).status,403);
 assert.equal((await handleApi(get('/api/studio/mind-operations'),{user:{id:'founder'}},cfg)).status,404);
 assert.equal((await handleApi(new Request(cfg.origin+'/api/core/identity',{method:'DELETE'}),{user:{id:'founder'}},cfg)).status,405);
 assert.equal((await handleApi(new Request('https://preview.test/api/core/identity'),{user:{id:'founder'}},cfg)).status,403);
});
test('backend auth redirects and failures surface as errors, not success',async()=>{
 assert.equal((await handleApi(get(),{user:{id:'founder'}},cfg,async()=>new Response('',{status:302,headers:{location:'/login'}}))).status,502);
 assert.equal((await handleApi(get(),{user:{id:'founder'}},cfg,async()=>{throw Error('timeout')})).status,504);
});
