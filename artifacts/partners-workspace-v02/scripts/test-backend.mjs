import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
await mkdir('work',{recursive:true});
await build({entryPoints:['tests/backend-worker.ts'],outfile:'work/backend-test.mjs',bundle:true,format:'esm',platform:'browser'});
const mf=new Miniflare({modules:true,scriptPath:'work/backend-test.mjs',compatibilityDate:'2026-05-15',d1Databases:['DB'],log:undefined});
const db=await mf.getD1Database('DB');await db.prepare(await readFile('drizzle/0000_young_ricochet.sql','utf8')).run();
const results=[];
const assert=(ok,msg='assertion failed')=>{if(!ok)throw new Error(msg)};
async function test(id,title,fn){try{await fn();results.push({id,title,passed:true});}catch(e){results.push({id,title,passed:false,error:String(e)});}}
async function call(owner,cmd,headers={}){const r=await mf.dispatchFetch('https://sandbox.test/api/sandbox',{method:cmd?'POST':'GET',headers:{...(owner?{'oai-authenticated-user-id':owner}:{}),...(cmd?{'content-type':'application/json',origin:'https://sandbox.test'}:{}),...headers},body:cmd?JSON.stringify(cmd):undefined});return {status:r.status,...await r.json()};}
const command=(op,id,extra={})=>({key:crypto.randomUUID(),role:'PARTNER',op,id,...extra});
try{
await test('D01','المصادقة مطلوبة على الخادم',async()=>{assert((await call(null)).status===401);});
await test('D02','منع طلب تعديل من Origin آخر',async()=>{assert((await call('origin',command('order.reserve','demo-product',{quantity:1}),{origin:'https://attacker.test'})).status===403);});
await test('D03','عزل بيانات هويتين مختلفتين',async()=>{await call('owner-a',command('order.reserve','demo-product',{quantity:1}));assert((await call('owner-b')).state.market.orders.length===0);});
await test('D04','20 طلب مخزون متزامن: نجاح طلبين فقط',async()=>{const all=await Promise.all(Array.from({length:20},()=>call('stock-race',command('order.reserve','demo-product',{quantity:1}))));assert(all.filter(x=>x.status===200).length===2,JSON.stringify(all.map(x=>x.error||x.status)));assert(all.filter(x=>x.error==='OUT_OF_STOCK').length===18);const s=(await call('stock-race')).state;assert(s.market.orders.length===2&&s.market.listings.find(l=>l.id==='demo-product').stock===0&&s.audit.length===2&&s.outbox.length===2);});
await test('D05','100 محاولة استخدام كوبون: استهلاك واحد فقط',async()=>{const issue=await call('coupon-race',command('entitlement.issue','demo-coupon'));const e=issue.result;const all=await Promise.all(Array.from({length:100},()=>call('coupon-race',command('entitlement.redeem',e.id,{version:e.version}))));assert(all.filter(x=>x.status===200).length===1);assert(all.filter(x=>x.error==='VERSION_CONFLICT').length===99);const s=(await call('coupon-race')).state;assert(s.market.entitlements[0].uses===0&&s.audit.length===2);});
await test('D06','100 حجز غرفة متزامن على المورد نفسه: قفل واحد',async()=>{const bookings=[];for(let i=0;i<100;i++)bookings.push((await call('rooms-race',command('rooms.request'))).result);const all=await Promise.all(bookings.map(b=>call('rooms-race',command('rooms.hold',b.id,{version:b.version}))));assert(all.filter(x=>x.status===200).length===1);assert(all.filter(x=>x.error==='SLOT_CONFLICT').length===99);assert((await call('rooms-race')).state.rooms.bookings.filter(b=>b.state==='TEMPORARY_SLOT_HOLD').length===1);});
await test('D07','20 إعادة متزامنة بالمفتاح نفسه: أثر واحد',async()=>{const c=command('order.reserve','demo-product',{quantity:1});const all=await Promise.all(Array.from({length:20},()=>call('idempotency-race',c)));assert(all.every(x=>x.status===200));assert(new Set(all.map(x=>x.result.id)).size===1);const s=(await call('idempotency-race')).state;assert(s.audit.length===1&&s.market.orders.length===1);});
await test('D08','تعارض حمولة Idempotency لا يغير المخزون',async()=>{const c=command('order.reserve','demo-product',{quantity:1});await call('changed-key',c);const r=await call('changed-key',{...c,quantity:2});assert(r.status===409&&r.error==='IDEMPOTENCY_CONFLICT');assert((await call('changed-key')).state.market.orders.length===1);});
await test('D09','فشل الصلاحية لا يضيف حدثًا',async()=>{const r=await call('role-check',{...command('order.reserve','demo-product',{quantity:1}),role:'REVIEWER'});assert(r.status===403);assert((await call('role-check')).state.audit.length===0);});
await test('D10','إعادة قراءة الحالة تثبت الحفظ في D1',async()=>{const a=await call('persist',command('order.reserve','demo-product',{quantity:1}));const b=await call('persist');assert(b.state.revision===a.state.revision&&b.state.market.orders[0].id===a.result.id);});
}finally{await mf.dispose();}
await writeFile('public/specs/backend-results.json',JSON.stringify({executedAt:new Date().toISOString(),scope:'Real local D1/SQLite via Miniflare and HTTP requests. Not Railway/PostgreSQL or live payment/provider tests.',results},null,2));
console.log(`${results.filter(x=>x.passed).length}/${results.length} database/API checks passed`);for(const r of results)if(!r.passed)console.error(r);if(results.some(x=>!x.passed))process.exitCode=1;
