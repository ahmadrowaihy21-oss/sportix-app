import {BASE_TIME, RuleError, type Role} from './booking';

export type Module = 'ROOMS'|'COUPONS'|'PRODUCTS'|'IMPACT';
export type Listing = {id:string;tenant:string;module:Exclude<Module,'ROOMS'>;kind:'COUPON'|'SUBSCRIPTION'|'PRODUCT'|'NONPROFIT'|'COMMERCIAL_EVENT';name:string;priceMinor:number;stock:number;capacity:number;status:'DRAFT'|'IN_REVIEW'|'APPROVED'|'PUBLISHED'|'PAUSED';submittedBy:string;reviewedBy?:string;version:number;};
export type Order = {id:string;listingId:string;tenant:string;quantity:number;amountMinor:number;state:'RESERVED'|'PAYMENT_AUTHORIZED'|'CONFIRMED'|'SHIPPED'|'DELIVERED'|'RETURN_REQUESTED'|'REFUND_PENDING'|'CANCELLED'|'EXPIRED';expiresAt:number;payment:'NONE'|'AUTHORIZED'|'CAPTURED'|'VOID_PENDING'|'REFUND_PENDING';version:number;};
export type Entitlement={id:string;listingId:string;tenant:string;kind:'COUPON'|'SUBSCRIPTION';uses:number;expiresAt:number;state:'ACTIVE'|'REDEEMED'|'EXPIRED';version:number;};
export type MarketState={now:number;sequence:number;organization:{id:string;approved:boolean;modules:Module[]};listings:Listing[];orders:Order[];entitlements:Entitlement[];registrations:{id:string;listingId:string;member:string}[];};
export type DemoActor={id:string;role:Role;tenant:string;modules:Module[]};
export const marketActors:Record<string,DemoActor>={
 ADMIN:{id:'demo-admin',role:'ADMIN',tenant:'*',modules:['ROOMS','COUPONS','PRODUCTS','IMPACT']},
 PARTNER:{id:'demo-partner',role:'PARTNER',tenant:'demo-tenant-a',modules:['ROOMS','COUPONS','PRODUCTS','IMPACT']},
 MANAGER:{id:'demo-manager',role:'MANAGER',tenant:'demo-tenant-a',modules:['ROOMS']},
 REVIEWER:{id:'demo-reviewer',role:'REVIEWER',tenant:'demo-tenant-a',modules:['ROOMS','COUPONS','PRODUCTS','IMPACT']},
 FOREIGN:{id:'demo-foreign',role:'PARTNER',tenant:'demo-tenant-b',modules:['COUPONS','PRODUCTS','IMPACT']}
};
export function ensure(value:unknown,code:string):asserts value{if(!value)throw new RuleError(code);}
export function seedMarket():MarketState{return {now:BASE_TIME,sequence:0,organization:{id:'demo-tenant-a',approved:true,modules:['ROOMS','COUPONS','PRODUCTS','IMPACT']},listings:[
 {id:'demo-coupon',tenant:'demo-tenant-a',module:'COUPONS',kind:'COUPON',name:'كوبون حصة تجريبية',priceMinor:8000,stock:10,capacity:1,status:'PUBLISHED',submittedBy:'demo-partner',reviewedBy:'demo-reviewer',version:1},
 {id:'demo-subscription',tenant:'demo-tenant-a',module:'COUPONS',kind:'SUBSCRIPTION',name:'اشتراك تجريبي · 4 حصص',priceMinor:24000,stock:10,capacity:4,status:'PUBLISHED',submittedBy:'demo-partner',reviewedBy:'demo-reviewer',version:1},
 {id:'demo-product',tenant:'demo-tenant-a',module:'PRODUCTS',kind:'PRODUCT',name:'مضرب تجريبي',priceMinor:16000,stock:2,capacity:0,status:'PUBLISHED',submittedBy:'demo-partner',reviewedBy:'demo-reviewer',version:1},
 {id:'demo-impact',tenant:'demo-tenant-a',module:'IMPACT',kind:'NONPROFIT',name:'مبادرة رياضية تجريبية',priceMinor:0,stock:0,capacity:3,status:'DRAFT',submittedBy:'demo-partner',version:1},
 {id:'demo-event',tenant:'demo-tenant-a',module:'IMPACT',kind:'COMMERCIAL_EVENT',name:'فعالية تجريبية مجانية',priceMinor:0,stock:0,capacity:5,status:'DRAFT',submittedBy:'demo-partner',version:1}
 ],orders:[],entitlements:[],registrations:[]};}
export class MarketEngine{
 data:MarketState;constructor(state?:MarketState){this.data=structuredClone(state||seedMarket());}
 id(prefix:string){return `demo-${prefix}-${++this.data.sequence}`;}
 listing(id:string){const l=this.data.listings.find(x=>x.id===id);ensure(l,'NOT_FOUND');return l;}
 order(id:string){const o=this.data.orders.find(x=>x.id===id);ensure(o,'NOT_FOUND');return o;}
 scope(a:DemoActor,l:Listing,review=false){ensure(a,'FORBIDDEN');ensure(a.role==='ADMIN'||a.tenant===l.tenant,'FORBIDDEN');ensure(a.modules.includes(l.module),'MODULE_FORBIDDEN');ensure(review?['ADMIN','REVIEWER'].includes(a.role):['ADMIN','PARTNER','MANAGER'].includes(a.role),'FORBIDDEN');ensure(this.data.organization.approved&&this.data.organization.modules.includes(l.module),'MODULE_DISABLED');}
 version(actual:number,expected:number){ensure(actual===expected,'VERSION_CONFLICT');}
 publication(id:string,action:'submit'|'approve'|'publish'|'pause',version:number,a:DemoActor){const l=this.listing(id);this.scope(a,l,action==='approve');this.version(l.version,version);
  if(action==='submit'){ensure(['DRAFT','PAUSED'].includes(l.status),'INVALID_TRANSITION');l.status='IN_REVIEW';l.submittedBy=a.id;delete l.reviewedBy;}
  if(action==='approve'){ensure(l.status==='IN_REVIEW','INVALID_TRANSITION');ensure(l.submittedBy!==a.id,'SELF_APPROVAL');l.status='APPROVED';l.reviewedBy=a.id;}
  if(action==='publish'){ensure(l.status==='APPROVED'&&l.reviewedBy&&l.reviewedBy!==l.submittedBy,'APPROVAL_REQUIRED');l.status='PUBLISHED';}
  if(action==='pause'){ensure(l.status==='PUBLISHED','INVALID_TRANSITION');l.status='PAUSED';}
  l.version++;return l;
 }
 edit(id:string,priceMinor:number,stock:number,capacity:number,version:number,a:DemoActor){const l=this.listing(id);this.scope(a,l);this.version(l.version,version);ensure(l.status==='DRAFT','EDIT_REQUIRES_DRAFT');ensure([priceMinor,stock,capacity].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000),'INVALID_INPUT');ensure(l.module!=='IMPACT'||(priceMinor===0&&capacity>0),'PAID_IMPACT_DISABLED');l.priceMinor=priceMinor;l.stock=stock;l.capacity=capacity;l.version++;return l;}
 reserve(id:string,quantity:number,a:DemoActor){this.expire();const l=this.listing(id);this.scope(a,l);ensure(l.status==='PUBLISHED'&&l.kind==='PRODUCT','INVALID_TRANSITION');ensure(Number.isSafeInteger(quantity)&&quantity>0&&quantity<=20,'INVALID_INPUT');ensure(l.stock>=quantity,'OUT_OF_STOCK');l.stock-=quantity;l.version++;const o:Order={id:this.id('order'),listingId:id,tenant:l.tenant,quantity,amountMinor:l.priceMinor*quantity,state:'RESERVED',expiresAt:this.data.now+300000,payment:'NONE',version:1};this.data.orders.push(o);return o;}
 orderAction(id:string,action:'authorize'|'confirm'|'ship'|'deliver'|'return'|'refund'|'cancel',version:number,a:DemoActor){this.expire();const o=this.order(id),l=this.listing(o.listingId);this.scope(a,l);this.version(o.version,version);
  const from={authorize:'RESERVED',confirm:'PAYMENT_AUTHORIZED',ship:'CONFIRMED',deliver:'SHIPPED',return:'DELIVERED',refund:'RETURN_REQUESTED'};
  if(action==='cancel'){ensure(['RESERVED','PAYMENT_AUTHORIZED','CONFIRMED'].includes(o.state),'INVALID_TRANSITION');l.stock+=o.quantity;l.version++;o.state='CANCELLED';if(o.payment==='AUTHORIZED')o.payment='VOID_PENDING';if(o.payment==='CAPTURED')o.payment='REFUND_PENDING';}
  else {ensure(o.state===from[action],'INVALID_TRANSITION');if(action==='authorize'){o.state='PAYMENT_AUTHORIZED';o.payment='AUTHORIZED';}if(action==='confirm'){ensure(o.payment==='AUTHORIZED'&&o.expiresAt>this.data.now,'PAYMENT_REQUIRED');o.state='CONFIRMED';}if(action==='ship'){ensure(o.payment==='AUTHORIZED','PAYMENT_REQUIRED');o.payment='CAPTURED';o.state='SHIPPED';}if(action==='deliver')o.state='DELIVERED';if(action==='return')o.state='RETURN_REQUESTED';if(action==='refund'){o.state='REFUND_PENDING';o.payment='REFUND_PENDING';}}
  o.version++;return o;
 }
 issue(id:string,a:DemoActor){const l=this.listing(id);this.scope(a,l);ensure(l.status==='PUBLISHED'&&['COUPON','SUBSCRIPTION'].includes(l.kind),'INVALID_TRANSITION');ensure(l.stock>0,'OUT_OF_STOCK');l.stock--;l.version++;const e:Entitlement={id:this.id('entitlement'),listingId:id,tenant:l.tenant,kind:l.kind as Entitlement['kind'],uses:l.kind==='COUPON'?1:4,expiresAt:this.data.now+30*86400000,state:'ACTIVE',version:1};this.data.entitlements.push(e);return e;}
 redeem(id:string,version:number,a:DemoActor){this.expire();const e=this.data.entitlements.find(x=>x.id===id);ensure(e,'NOT_FOUND');this.scope(a,this.listing(e.listingId));this.version(e.version,version);ensure(e.state==='ACTIVE'&&e.uses>0&&e.expiresAt>this.data.now,'ENTITLEMENT_INACTIVE');e.uses--;if(e.uses===0)e.state='REDEEMED';e.version++;return e;}
 register(id:string,member:string,a:DemoActor){const l=this.listing(id);this.scope(a,l);ensure(l.status==='PUBLISHED'&&l.module==='IMPACT','INVALID_TRANSITION');ensure(/^demo-member-[1-9][0-9]?$/.test(member),'SYNTHETIC_ONLY');ensure(l.priceMinor===0,'PAID_IMPACT_DISABLED');ensure(!this.data.registrations.some(r=>r.listingId===id&&r.member===member),'DUPLICATE_REGISTRATION');ensure(this.data.registrations.filter(r=>r.listingId===id).length<l.capacity,'CAPACITY_EXCEEDED');const r={id:this.id('registration'),listingId:id,member};this.data.registrations.push(r);return r;}
 expire(){for(const o of this.data.orders)if(['RESERVED','PAYMENT_AUTHORIZED'].includes(o.state)&&o.expiresAt<=this.data.now){const l=this.listing(o.listingId);l.stock+=o.quantity;l.version++;o.state='EXPIRED';if(o.payment==='AUTHORIZED')o.payment='VOID_PENDING';o.version++;}for(const e of this.data.entitlements)if(e.state==='ACTIVE'&&e.expiresAt<=this.data.now){e.state='EXPIRED';e.version++;}}
 advance(ms:number){ensure(Number.isSafeInteger(ms)&&ms>0&&ms<=31*86400000,'INVALID_INPUT');this.data.now+=ms;this.expire();}
}
