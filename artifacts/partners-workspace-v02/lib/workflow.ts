import {BookingEngine, actors,fixtureRoom,BASE_TIME,type Snapshot} from './booking';
import {MarketEngine,marketActors,ensure,seedMarket,type MarketState} from './market';
export type Command={key:string;op:string;role:string;id?:string;version?:number;quantity?:number;member?:string;ms?:number;priceMinor?:number;stock?:number;capacity?:number;};
export type WorkflowEvent={id:string;type:string;at:string;aggregateId:string;actor:string;synthetic:true;delivery:'DISABLED';};
export type WorkflowState={schema:2;revision:number;market:MarketState;rooms:Snapshot;audit:WorkflowEvent[];outbox:WorkflowEvent[];receipts:Record<string,{fingerprint:string;result:unknown}>;};
export function seedWorkflow():WorkflowState{return {schema:2,revision:0,market:seedMarket(),rooms:new BookingEngine().snapshot(),audit:[],outbox:[],receipts:{}};}
export function execute(state:WorkflowState,cmd:Command){
 ensure(cmd&&typeof cmd==='object'&&typeof cmd.key==='string'&&/^[A-Za-z0-9_-]{8,100}$/.test(cmd.key),'INVALID_KEY');
 ensure(typeof cmd.op==='string'&&Object.hasOwn(marketActors,cmd.role),'FORBIDDEN');
 const {key,...payload}=cmd,fingerprint=JSON.stringify(payload),old=state.receipts[key];
 if(old){ensure(old.fingerprint===fingerprint,'IDEMPOTENCY_CONFLICT');return {state,result:old.result,replayed:true};}
 ensure(Object.keys(state.receipts).length<1000,'SANDBOX_LIMIT');
 const next=structuredClone(state),m=new MarketEngine(next.market),b=new BookingEngine(next.rooms),a=marketActors[cmd.role];
 let result:unknown;const id=cmd.id||'',v=cmd.version??-1;
 if(cmd.op.startsWith('listing.')){const op=cmd.op.split('.')[1];ensure(['submit','approve','publish','pause','edit'].includes(op),'UNKNOWN_COMMAND');result=op==='edit'?m.edit(id,cmd.priceMinor!,cmd.stock!,cmd.capacity!,v,a):m.publication(id,op as 'submit'|'approve'|'publish'|'pause',v,a);}
 else if(cmd.op==='order.reserve')result=m.reserve(id,cmd.quantity!,a);
 else if(cmd.op.startsWith('order.')){const op=cmd.op.split('.')[1];ensure(['authorize','confirm','ship','deliver','return','refund','cancel'].includes(op),'UNKNOWN_COMMAND');result=m.orderAction(id,op as 'authorize',v,a);}
 else if(cmd.op==='entitlement.issue')result=m.issue(id,a);
 else if(cmd.op==='entitlement.redeem')result=m.redeem(id,v,a);
 else if(cmd.op==='impact.register')result=m.register(id,cmd.member||'',a);
 else if(cmd.op==='clock.advance'){ensure(a.role==='ADMIN','FORBIDDEN');m.advance(cmd.ms!);b.advance(cmd.ms!);result={now:m.data.now};}
 else if(cmd.op==='rooms.request'){ensure(a.role==='PARTNER'||a.role==='ADMIN','FORBIDDEN');let start=Math.floor(b.data.now/86400000)*86400000+17*3600000;if(start<=b.data.now)start+=86400000;const r={...fixtureRoom,id:`demo-room-${next.revision}`,start,end:start+3600000};result=b.request(r,'demo-court-a',key);}
 else if(cmd.op==='rooms.hold'){ensure(a.role==='PARTNER'||a.role==='ADMIN','FORBIDDEN');result=b.hold(id,v);}
 else if(cmd.op==='rooms.notify'){ensure(a.role==='ADMIN','FORBIDDEN');result=b.notify(id,v);}
 else if(cmd.op==='rooms.authorize'){ensure(a.role==='ADMIN','FORBIDDEN');result=b.authorize(id,v);}
 else if(cmd.op==='rooms.confirm'){ensure(a.role==='ADMIN','FORBIDDEN');result=b.confirm(id,v,b.booking(id).lease||'',actors.SYSTEM);}
 else if(cmd.op==='rooms.cancel'){ensure(a.role==='ADMIN'||a.role==='PARTNER','FORBIDDEN');result=b.cancel(id,v,actors[cmd.role as 'ADMIN'|'PARTNER']);}
 else if(cmd.op==='rooms.refresh'){ensure(a.role==='ADMIN'||a.role==='PARTNER','FORBIDDEN');b.refresh('demo-court-a',actors[cmd.role as 'ADMIN'|'PARTNER']);result={refreshed:true};}
 else throw new Error('UNKNOWN_COMMAND');
 next.market=m.data;next.rooms=b.snapshot();next.revision++;
 const event:WorkflowEvent={id:`evt-${next.revision}`,type:cmd.op,at:new Date().toISOString(),aggregateId:id||String((result as {id?:string})?.id||'workspace'),actor:a.id,synthetic:true,delivery:'DISABLED'};
 next.audit.push(event);next.outbox.push(event);next.receipts[key]={fingerprint,result:structuredClone(result)};
 return {state:next,result,replayed:false};
}
