import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks=vi.hoisted(()=>({user:vi.fn(),query:vi.fn(),database:vi.fn()}));
vi.mock('@netlify/identity',()=>({getUser:mocks.user}));
vi.mock('@netlify/database',()=>({getDatabase:mocks.database}));
vi.mock('@netlify/blobs',()=>({getStore:vi.fn()}));
vi.mock('openai',()=>({default:vi.fn()}));
import handler from '../netlify/functions/academy.mts';

const origin='https://sportix-academy-os.netlify.app';
const req=(path:string,method='GET',body?:unknown,from=origin)=>new Request(origin+path,{method,headers:{'content-type':'application/json',origin:from},...(body===undefined?{}:{body:JSON.stringify(body)})});
type StoredRow={owner:string;kind:string;id:string;data:Record<string,unknown>;created_at?:number};
let rows:StoredRow[]=[];
beforeEach(()=>{
  vi.clearAllMocks();rows=[];
  mocks.user.mockResolvedValue({id:'account-a'});
  mocks.database.mockReturnValue({pool:{query:mocks.query}});
  mocks.query.mockImplementation(async(sql:string,p:unknown[]=[])=>{
    if(sql.startsWith('SELECT 1')) return {rows:[]};
    if(sql.startsWith('INSERT')) {
      const previous=rows.find(r=>r.owner===p[0]&&r.kind===p[1]&&r.id===p[2]);
      const row={owner:String(p[0]),kind:String(p[1]),id:String(p[2]),data:JSON.parse(String(p[3])),created_at:previous?.created_at??Math.max(0,...rows.map(r=>r.created_at??0))+1};
      rows=rows.filter(r=>!(r.owner===row.owner&&r.kind===row.kind&&r.id===row.id));rows.push(row);return {rows:[]};
    }
    if(sql.includes("data->>'playerId'")) return {rows:rows.filter(r=>r.owner===p[0]&&r.data.playerId===p[1])};
    if(sql.startsWith('SELECT')) {
      let selected=rows.filter(r=>r.owner===p[0]&&r.kind===p[1]&&(!sql.includes('id=$3')||r.id===p[2]));
      const order=sql.match(/ORDER BY created_at (ASC|DESC)(?:,id (ASC|DESC))?/);
      if(order) selected.sort((a,b)=>((a.created_at??0)-(b.created_at??0))*(order[1]==='DESC'?-1:1)||(order[2]?a.id.localeCompare(b.id)*(order[2]==='DESC'?-1:1):0));
      if(sql.includes('LIMIT $3')) selected=selected.slice(0,Number(p[2]));
      return {rows:selected};
    }
    if(sql.startsWith('DELETE')) {const found=rows.filter(r=>r.owner===p[0]&&r.kind===p[1]&&r.id===p[2]);rows=rows.filter(r=>!found.includes(r));return {rows:found};}
    throw new Error('Unrecognized test query');
  });
});

describe('Academy server regressions',()=>{
  it('retains the newest saved record when bootstrap reaches its record window',async()=>{
    rows=Array.from({length:205},(_,i)=>({owner:'account-a',kind:'coaches',id:`coach-${String(i).padStart(3,'0')}`,created_at:i+1,data:{name:`مدرب تجريبي ${i}`}}));
    const created=await handler(req('/api/academy/v2/records/coaches','POST',{name:'أحدث مدرب محفوظ'}));
    expect(created.status).toBe(201);const saved=await created.json();
    const response=await handler(req('/api/academy/v2/bootstrap'));
    expect(response.status).toBe(200);const data=await response.json();
    expect(data.coaches).toHaveLength(200);
    expect(data.coaches.at(-1)).toMatchObject({id:saved.id,name:'أحدث مدرب محفوظ'});
  });
  it('returns the newest AI reports after history exceeds sixty reports',async()=>{
    rows=Array.from({length:70},(_,i)=>({owner:'account-a',kind:'ai_reports',id:`report-${String(i).padStart(2,'0')}`,created_at:i+1,data:{text:`تقرير تجريبي ${i}`}}));
    const response=await handler(req('/api/academy/v2/ai/history'));
    expect(response.status).toBe(200);const data=await response.json();
    expect(data.items).toHaveLength(20);
    expect(data.items[0]).toMatchObject({id:'report-69',text:'تقرير تجريبي 69'});
    expect(data.items.at(-1).id).toBe('report-50');
  });

  it('denies anonymous access before reading database records',async()=>{
    mocks.user.mockResolvedValue(null);
    const response=await handler(req('/api/academy/v2/bootstrap'));
    expect(response.status).toBe(401);expect(mocks.query).not.toHaveBeenCalled();
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('rejects cross-origin writes',async()=>{
    const r=await handler(req('/api/academy/v2/records/coaches','POST',{name:'Test'},'https://elsewhere.example'));
    expect(r.status).toBe(403);expect(mocks.query).not.toHaveBeenCalled();
  });
  it('saves text session objectives and preserves them on status changes',async()=>{
    const created=await handler(req('/api/academy/v2/records/sessions','POST',{title:'حصة اختبار',date:'2026-11-04',objectives:'استلام الكرة تحت الضغط',duration:60,status:'planned'}));
    expect(created.status).toBe(201);const record=await created.json();
    expect(record.objectives).toBe('استلام الكرة تحت الضغط');
    const updated=await handler(req(`/api/academy/v2/records/sessions/${record.id}`,'PUT',{status:'completed'}));
    expect(updated.status).toBe(200);expect((await updated.json()).objectives).toBe(record.objectives);
  });
  it('keeps quality objectives numeric and calculates weighted score on the server',async()=>{
    rows.push({owner:'account-a',kind:'sessions',id:'s1',data:{}});
    const r=await handler(req('/api/academy/v2/records/quality','POST',{sessionId:'s1',reviewer:'مراجع',objectives:'5',realism:'4',opportunities:'3',feedback:'2',reflection:'1',score:100,approved:true}));
    expect(r.status).toBe(201);const record=await r.json();
    expect(record.score).toBe(70);expect(record.objectives).toBe(5);expect(record.approved).toBe(false);
  });
  it('cannot read or update records owned by another account',async()=>{
    rows.push({owner:'account-b',kind:'players',id:'other',data:{name:'Private',birthYear:2012}});
    const r=await handler(req('/api/academy/v2/bootstrap'));
    expect((await r.json()).players).toEqual([]);
    const update=await handler(req('/api/academy/v2/records/players/other','PUT',{name:'Changed'}));
    expect(update.status).toBe(404);expect(rows[0].data.name).toBe('Private');
  });
  it('blocks references to another account coach',async()=>{
    rows.push({owner:'account-b',kind:'coaches',id:'c1',data:{name:'Coach'}});
    const r=await handler(req('/api/academy/v2/records/sessions','POST',{title:'حصة',date:'2026-11-04',objectives:'هدف',duration:60,coachId:'c1'}));
    expect(r.status).toBe(400);
  });
  it.each([{activeMinutes:-1,attempts:1,successful:0,touches:0},{activeMinutes:60,attempts:1,successful:2,touches:0},{activeMinutes:60,attempts:1,successful:-1,touches:0}])('rejects invalid exposure: %j',async(values)=>{
    const r=await handler(req('/api/academy/v2/records/exposures','POST',{sessionId:'s1',playerId:'p1',...values}));expect(r.status).toBe(400);
  });
  it('returns validation errors for malformed numeric values',async()=>{
    const r=await handler(req('/api/academy/v2/records/players','POST',{name:'اختبار',birthYear:'invalid'}));expect(r.status).toBe(400);
  });
  it('prevents deleting a player referenced only by training exposure',async()=>{
    rows.push({owner:'account-a',kind:'exposures',id:'x1',data:{playerId:'p1'}});
    expect((await handler(req('/api/academy/v2/records/players/p1','DELETE'))).status).toBe(409);
  });
  it('does not generate an AI report without supporting records',async()=>{
    const r=await handler(req('/api/academy/v2/ai/training-advisor','POST',{cohort:'الكل'}));expect(r.status).toBe(422);
  });
  it('reports database failure rather than a false healthy status',async()=>{
    mocks.query.mockRejectedValueOnce(new Error('unavailable'));
    const r=await handler(req('/api/_healthcheck'));expect(r.status).toBe(503);expect((await r.json()).ok).toBe(false);
  });
  it('reports readiness after probing the actual schema',async()=>{
    const r=await handler(req('/api/_healthcheck'));expect(r.status).toBe(200);expect((await r.json()).database).toBe('ready');
    expect(mocks.query).toHaveBeenCalledWith('SELECT 1 FROM sportix_academy_records LIMIT 0',[]);
  });
});
