// In-memory specification simulator. No database, payment or outbound calls.
export type Role = 'ADMIN'|'PARTNER'|'MANAGER'|'REVIEWER'|'HOST'|'SYSTEM';
export type Actor = { id:string; role:Role; tenant:string; venues:string[] };
export type BookingState = 'REQUESTED'|'TEMPORARY_SLOT_HOLD'|'VENUE_NOTIFIED'|'CLAIMED'|'CONFIRMED'|'VALID_REJECT'|'CANCELLED'|'EXPIRED';
export type Venue = {id:string;tenant:string;name:string;type:string;city:string;sport:string;capacity:number;price:number;open:number;close:number;available:boolean;maintenance:boolean;safe:boolean;eligible:boolean;policy:boolean;checkedAt:number;version:number};
export type Room = {id:string;name:string;sport:string;city:string;players:number;minimum:number;start:number;end:number;host:string};
export type Payment = {id:string;booking:string;status:'AUTHORIZED'|'VOID_PENDING'|'VOIDED'|'CAPTURED'|'REFUND_PENDING';amount:number;currency:'SAR';expiresAt:number};
export type Booking = {id:string;room:Room;venue:string;tenant:string;state:BookingState;version:number;lease?:string;expiresAt?:number;payment?:Payment;price:number;currency:'SAR';reason?:string;claimedBy?:string;notification?:'ACKNOWLEDGED';createdBy:string};
export type Event = {id:string;at:number;booking:string;actor:string;action:string;state:BookingState;version:number;note:string};
export type Snapshot = {now:number;venues:Venue[];bookings:Booking[];events:Event[];sequence:number;keys:Record<string,{fingerprint:string;id:string}>};
export const BASE_TIME=Date.parse('2026-11-10T15:00:00Z');
export const TTL=300_000, FRESHNESS=60_000; // Proposed, awaiting policy approval.
export const roles:Record<Role,string>={ADMIN:'مسؤول SPORTIX PARTNERS',PARTNER:'الشريك',MANAGER:'مدير المنشأة',REVIEWER:'المراجع',HOST:'منظم الغرفة · محاكاة',SYSTEM:'خدمة التأكيد · محاكاة'};
export const actors:Record<Role,Actor>={
 ADMIN:{id:'demo-admin',role:'ADMIN',tenant:'*',venues:[]},PARTNER:{id:'demo-partner',role:'PARTNER',tenant:'demo-tenant-a',venues:[]},
 MANAGER:{id:'demo-manager',role:'MANAGER',tenant:'demo-tenant-a',venues:['demo-court-a']},REVIEWER:{id:'demo-reviewer',role:'REVIEWER',tenant:'demo-tenant-a',venues:[]},
 HOST:{id:'demo-host',role:'HOST',tenant:'demo-athlete',venues:[]},SYSTEM:{id:'demo-system',role:'SYSTEM',tenant:'*',venues:[]}
};
export const fixtureRoom:Room={id:'demo-room-01',name:'غرفة البادل التجريبية',sport:'بادل',city:'جدة',players:4,minimum:4,start:Date.parse('2026-11-10T17:00:00Z'),end:Date.parse('2026-11-10T18:00:00Z'),host:'demo-host'};
export function seedVenues():Venue[]{
 const c={tenant:'demo-tenant-a',city:'جدة',open:8,close:24,available:true,maintenance:false,safe:true,eligible:true,policy:true,checkedAt:BASE_TIME,version:1};
 return [{...c,id:'demo-court-a',name:'ملعب تجريبي A',type:'ملعب',sport:'بادل',capacity:4,price:180},
 {...c,id:'demo-center-b',name:'مركز تجريبي B',type:'مركز رياضي',sport:'كرة قدم',capacity:12,price:280},
 {...c,id:'demo-academy-c',name:'أكاديمية تجريبية C',type:'أكاديمية',sport:'بادل',capacity:8,price:240,maintenance:true},
 {...c,id:'demo-court-d',tenant:'demo-tenant-b',name:'ملعب تجريبي D',type:'ملعب',sport:'بادل',capacity:4,price:200,city:'الرياض'}];
}
export class RuleError extends Error{code:string;constructor(code:string){super(code);this.code=code;}}
function req(condition:unknown,code:string):asserts condition{if(!condition)throw new RuleError(code);}
export function can(a:Actor,action:'manage'|'review'|'confirm'|'claim',v:Venue){
 if(a.role==='REVIEWER')return action==='review'&&a.tenant===v.tenant;
 if(a.role==='ADMIN')return true;if(a.role==='SYSTEM')return action==='confirm';if(a.tenant!==v.tenant)return false;
 if(a.role==='PARTNER')return action!=='review';return a.role==='MANAGER'&&a.venues.includes(v.id)&&action!=='review';
}
export function matchReasons(v:Venue,r:Room){
 const h=(t:number)=>{const d=new Date(t+10800000);return d.getUTCHours()+d.getUTCMinutes()/60;};
 const sameDay=new Date(r.start+10800000).toISOString().slice(0,10)===new Date(r.end-1+10800000).toISOString().slice(0,10);
 const end=h(r.end)===0?24:h(r.end);
 return [v.sport!==r.sport&&'SPORT_MISMATCH',v.city!==r.city&&'LOCATION_MISMATCH',r.players>v.capacity&&'CAPACITY_EXCEEDED',r.players<r.minimum&&'MIN_PLAYERS',(!sameDay||h(r.start)<v.open||end>v.close)&&'OUTSIDE_SCHEDULE',!v.available&&'UNAVAILABLE',v.maintenance&&'MAINTENANCE_OPEN',!v.safe&&'SAFETY_BLOCK',!v.eligible&&'VENUE_INELIGIBLE',!v.policy&&'POLICY_BLOCK'].filter(Boolean) as string[];
}
export const messages:Record<string,string>={FORBIDDEN:'الصلاحية أو نطاق المنشأة لا يسمحان بهذا الإجراء.',NOT_FOUND:'السجل غير موجود.',INVALID_TRANSITION:'هذا الانتقال غير مسموح من الحالة الحالية.',VERSION_CONFLICT:'نسخة قديمة؛ أعد قراءة الحجز.',SLOT_CONFLICT:'الموعد متداخل مع حجز مؤقت أو مؤكد آخر.',ROOM_ALREADY_BOOKED:'للغرفة حجز نشط بالفعل.',HOLD_EXPIRED:'انتهت المهلة؛ يلزم طلب جديد وفحص جديد.',LEASE_MISMATCH:'رمز القفل لا يخص هذا الحجز.',PAYMENT_REQUIRED:'تفويض دفع صالح بالقيمة والعملة نفسيهما مطلوب.',AVAILABILITY_STALE:'بيانات التوافر قديمة؛ يلزم تحقق جديد.',MAINTENANCE_OPEN:'توجد صيانة مفتوحة على المورد.',SAFETY_BLOCK:'حظر سلامة يمنع الحجز.',VENUE_INELIGIBLE:'المنشأة غير مؤهلة لاستقبال الغرف.',POLICY_BLOCK:'سياسات الاستقبال غير مستوفاة.',SPORT_MISMATCH:'الرياضة غير متوافقة.',LOCATION_MISMATCH:'المدينة غير متوافقة.',CAPACITY_EXCEEDED:'عدد اللاعبين أكبر من السعة.',MIN_PLAYERS:'لم يتحقق الحد الأدنى للاعبين.',OUTSIDE_SCHEDULE:'الموعد خارج ساعات العمل.',UNAVAILABLE:'المورد غير متاح.',INVALID_INPUT:'تحقق من الوقت والسعة والسعر.',IDEMPOTENCY_CONFLICT:'استُخدم المفتاح لطلب مختلف.',REASON_REQUIRED:'يلزم سبب رفض معتبر ودليل اصطناعي.',SELF_APPROVAL:'لا يمكن للمقدّم اعتماد طلبه بنفسه.'};
export class BookingEngine{
 data:Snapshot;
 constructor(snapshot?:Snapshot){this.data=snapshot?structuredClone(snapshot):{now:BASE_TIME,venues:seedVenues(),bookings:[],events:[],sequence:0,keys:{}};}
 id(p:string){return `${p}-${String(++this.data.sequence).padStart(3,'0')}`;}
 venue(id:string){const v=this.data.venues.find(v=>v.id===id);req(v,'NOT_FOUND');return v;}
 booking(id:string){const b=this.data.bookings.find(b=>b.id===id);req(b,'NOT_FOUND');return b;}
 event(b:Booking,a:Actor,action:string,note=''){this.data.events.unshift({id:this.id('event'),at:this.data.now,booking:b.id,actor:a.id,action,state:b.state,version:b.version,note});}
 change(b:Booking,s:BookingState,a:Actor,note=''){b.state=s;b.version++;this.event(b,a,s,note);}
 activeHold(b:Booking){return ['TEMPORARY_SLOT_HOLD','VENUE_NOTIFIED','CLAIMED'].includes(b.state);}
 blocks(b:Booking){return b.state==='CONFIRMED'||(this.activeHold(b)&&this.data.now<b.expiresAt!);}
 release(b:Booking){delete b.lease;if(b.payment?.status==='AUTHORIZED')b.payment.status='VOID_PENDING';if(b.payment?.status==='CAPTURED')b.payment.status='REFUND_PENDING';}
 expire(){for(const b of this.data.bookings)if(this.activeHold(b)&&this.data.now>=b.expiresAt!){this.release(b);this.change(b,'EXPIRED',actors.SYSTEM,'انتهاء المهلة لا يؤكد الحجز');}}
 checkVersion(b:Booking,v:number){req(b.version===v,'VERSION_CONFLICT');}
 assertMatching(v:Venue,r:Room){const reasons=matchReasons(v,r);req(!reasons.length,reasons[0]??'INVALID_INPUT');}
 request(room:Room,venueId:string,key:string,a:Actor=actors.HOST){
  req(a.role==='HOST'&&room.host===a.id,'FORBIDDEN');req(key.trim()&&Number.isInteger(room.players)&&room.players>0&&Number.isInteger(room.minimum)&&room.minimum>0&&room.start<room.end&&room.start>this.data.now,'INVALID_INPUT');
  const v=this.venue(venueId),fingerprint=JSON.stringify({room,venueId}),scoped=`${a.id}:${key}`,old=this.data.keys[scoped];
  if(old){req(old.fingerprint===fingerprint,'IDEMPOTENCY_CONFLICT');return this.booking(old.id);}
  const b:Booking={id:this.id('demo-booking'),room:structuredClone(room),venue:venueId,tenant:v.tenant,state:'REQUESTED',version:1,price:Math.round(v.price*(room.end-room.start)/3600000),currency:'SAR',createdBy:a.id};
  this.data.bookings.push(b);this.data.keys[scoped]={fingerprint,id:b.id};this.event(b,a,'REQUESTED');return b;
 }
 hold(id:string,version:number,a:Actor=actors.HOST){
  this.expire();const b=this.booking(id);req(a.role==='HOST'&&b.createdBy===a.id,'FORBIDDEN');this.checkVersion(b,version);req(b.state==='REQUESTED','INVALID_TRANSITION');
  const v=this.venue(b.venue);this.assertMatching(v,b.room);req(this.data.now-v.checkedAt<=FRESHNESS,'AVAILABILITY_STALE');
  const active=this.data.bookings.filter(x=>x.id!==b.id&&this.blocks(x));req(!active.some(x=>x.room.id===b.room.id),'ROOM_ALREADY_BOOKED');
  req(!active.some(x=>x.venue===b.venue&&x.room.start<b.room.end&&b.room.start<x.room.end),'SLOT_CONFLICT');
  b.expiresAt=this.data.now+TTL;b.lease=this.id('lease');this.change(b,'TEMPORARY_SLOT_HOLD',a);return b;
 }
 checkLive(id:string,version:number){this.expire();const b=this.booking(id);req(b.state!=='EXPIRED','HOLD_EXPIRED');this.checkVersion(b,version);req(this.activeHold(b),'INVALID_TRANSITION');return b;}
 notify(id:string,version:number,a:Actor=actors.SYSTEM){req(a.role==='SYSTEM','FORBIDDEN');const b=this.checkLive(id,version);req(b.state==='TEMPORARY_SLOT_HOLD','INVALID_TRANSITION');b.notification='ACKNOWLEDGED';this.change(b,'VENUE_NOTIFIED',a,'إقرار استلام اصطناعي؛ لم تُرسل رسالة');return b;}
 claim(id:string,version:number,a:Actor){const b=this.checkLive(id,version);req(can(a,'claim',this.venue(b.venue)),'FORBIDDEN');req(b.state==='VENUE_NOTIFIED','INVALID_TRANSITION');b.claimedBy=a.id;this.change(b,'CLAIMED',a,'Claim لا يعني Confirm');return b;}
 authorize(id:string,version:number,a:Actor=actors.SYSTEM){req(a.role==='SYSTEM','FORBIDDEN');const b=this.checkLive(id,version);b.payment={id:this.id('demo-auth'),booking:b.id,status:'AUTHORIZED',amount:b.price,currency:'SAR',expiresAt:this.data.now+TTL};b.version++;this.event(b,a,'PAYMENT_AUTHORIZED','تفويض اصطناعي دون خصم');return b;}
 confirm(id:string,version:number,lease:string,a:Actor){
  const b=this.checkLive(id,version),v=this.venue(b.venue);req(can(a,'confirm',v),'FORBIDDEN');req(['VENUE_NOTIFIED','CLAIMED'].includes(b.state),'INVALID_TRANSITION');req(b.lease===lease,'LEASE_MISMATCH');this.assertMatching(v,b.room);req(this.data.now-v.checkedAt<=FRESHNESS,'AVAILABILITY_STALE');
  const p=b.payment;req(p&&p.booking===b.id&&p.status==='AUTHORIZED'&&p.expiresAt>this.data.now&&p.amount===b.price&&p.currency===b.currency,'PAYMENT_REQUIRED');
  req(!this.data.bookings.some(x=>x.id!==b.id&&this.blocks(x)&&x.venue===b.venue&&x.room.start<b.room.end&&b.room.start<x.room.end),'SLOT_CONFLICT');
  this.change(b,'CONFIRMED',a,'تحويل القفل إلى حجز حصري؛ التحصيل خارج المحاكاة');return b;
 }
 reject(id:string,version:number,reason:string,evidence:string,a:Actor){
  this.expire();const b=this.booking(id);this.checkVersion(b,version);req(can(a,'claim',this.venue(b.venue)),'FORBIDDEN');req(['REQUESTED','TEMPORARY_SLOT_HOLD','VENUE_NOTIFIED','CLAIMED'].includes(b.state),'INVALID_TRANSITION');
  req(['MAINTENANCE_OPEN','SAFETY_BLOCK','CAPACITY_EXCEEDED','UNAVAILABLE','VENUE_INELIGIBLE','POLICY_BLOCK'].includes(reason)&&evidence.trim().length>=5,'REASON_REQUIRED');b.reason=reason;this.release(b);this.change(b,'VALID_REJECT',a,`${reason} · ${evidence}`);return b;
 }
 cancel(id:string,version:number,a:Actor){this.expire();const b=this.booking(id);this.checkVersion(b,version);req((a.role==='HOST'&&b.createdBy===a.id)||can(a,'manage',this.venue(b.venue)),'FORBIDDEN');req(!['CANCELLED','EXPIRED','VALID_REJECT'].includes(b.state),'INVALID_TRANSITION');this.release(b);this.change(b,'CANCELLED',a,'تحرير المورد؛ معالجة مالية منفصلة بحسب السياسة');return b;}
 advance(ms:number){req(ms>=0,'INVALID_INPUT');this.data.now+=ms;this.expire();}
 refresh(id:string,a:Actor){const v=this.venue(id);req(can(a,'manage',v),'FORBIDDEN');v.checkedAt=this.data.now;v.version++;}
 updateVenue(id:string,patch:Partial<Pick<Venue,'capacity'|'price'|'open'|'close'|'available'|'maintenance'|'safe'|'eligible'|'policy'>>,a:Actor){const v=this.venue(id);req(can(a,'manage',v),'FORBIDDEN');const n={...v,...patch};req(Number.isInteger(n.capacity)&&n.capacity>0&&n.price>0&&n.open>=0&&n.close<=24&&n.open<n.close,'INVALID_INPUT');Object.assign(v,patch,{version:v.version+1});}
 snapshot(){return structuredClone(this.data);}
}
export function reviewApplication(submittedBy:string,actor:Actor){req(['ADMIN','REVIEWER'].includes(actor.role),'FORBIDDEN');req(actor.id!==submittedBy,'SELF_APPROVAL');return 'APPROVED' as const;}
