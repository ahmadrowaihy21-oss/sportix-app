// @vitest-environment happy-dom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from '../src/App';

const mocks=vi.hoisted(()=>({getUser:vi.fn(),get:vi.fn()}));
vi.mock('../src/netlifyClient',()=>({auth:{getUser:mocks.getUser,signOut:vi.fn(),signInWithRedirect:vi.fn()},api:{get:mocks.get,post:vi.fn(),put:vi.fn(),delete:vi.fn()}}));
beforeEach(()=>{vi.clearAllMocks();localStorage.clear();mocks.getUser.mockResolvedValue(null);window.scrollTo=vi.fn();});
afterEach(cleanup);
async function start(){render(<App/>);await screen.findByRole('button',{name:'صمّم حصة تدريبية'});}
describe('Arabic academy workspace',()=>{
  it('opens all 17 workspaces without a render failure',async()=>{
    await start();const sidebar=document.querySelector('.sidebar-content')!;
    const labels=within(sidebar as HTMLElement).getAllByRole('button').map(b=>b.textContent!);
    expect(labels.length).toBe(17);
    for(const name of labels){fireEvent.click(within(sidebar as HTMLElement).getByRole('button',{name,exact:true}));expect(document.querySelector('main h1')).not.toBeNull();}
  });
  it('adds a session with displayed default coach and retains all fields after completion',async()=>{
    await start();fireEvent.click(screen.getByRole('button',{name:'صمّم حصة تدريبية'}));
    const modal=screen.getByRole('dialog');
    fireEvent.change(within(modal).getByLabelText(/عنوان الحصة/),{target:{value:'حصة اختبار آلي'}});
    fireEvent.change(within(modal).getByLabelText(/السلوك \/ الهدف/),{target:{value:'استلام الكرة تحت الضغط'}});
    fireEvent.click(within(modal).getByRole('button',{name:'حفظ السجل'}));
    await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(()=>expect(JSON.parse(localStorage.getItem('sportix_academy_workflow_v2_demo')!).sessions.some((s:any)=>s.title==='حصة اختبار آلي')).toBe(true));
    const saved=JSON.parse(localStorage.getItem('sportix_academy_workflow_v2_demo')!).sessions.find((s:any)=>s.title==='حصة اختبار آلي');
    expect(saved.coachId).toBe('c1');expect(saved.objectives).toBe('استلام الكرة تحت الضغط');
    fireEvent.click(screen.getByRole('button',{name:'تنفيذ الحصص والحضور',exact:true}));
    fireEvent.click(screen.getByRole('button',{name:'اعتماد انتهاء التنفيذ'}));
    await waitFor(()=>{
      const completed=JSON.parse(localStorage.getItem('sportix_academy_workflow_v2_demo')!).sessions.find((s:any)=>s.id===saved.id);
      expect(completed.status).toBe('completed');expect(completed.title).toBe(saved.title);expect(completed.coachId).toBe(saved.coachId);expect(completed.objectives).toBe(saved.objectives);
    });
  });
  it('never presents demo players as account data after a bootstrap failure',async()=>{
    mocks.getUser.mockResolvedValue({userId:'u1',email:'test@example.com'});mocks.get.mockRejectedValue(new Error('unavailable'));
    await start();expect(screen.queryByText('أكاديمية SPORTIX النموذجية')).toBeNull();
    fireEvent.click(screen.getByRole('button',{name:'اللاعبون و SPORT ID',exact:true}));
    expect(screen.queryByText('سالم العتيبي')).toBeNull();
  });
  it('keeps local session data after remounting the application',async()=>{
    await start();const saved=localStorage.getItem('sportix_academy_workflow_v2_demo');expect(saved).toBeTruthy();
    const data=JSON.parse(saved!);data.academy.name='أكاديمية الاختبار المحفوظ';localStorage.setItem('sportix_academy_workflow_v2_demo',JSON.stringify(data));cleanup();
    await start();expect(screen.getByText('أكاديمية الاختبار المحفوظ')).toBeTruthy();
  });
});
