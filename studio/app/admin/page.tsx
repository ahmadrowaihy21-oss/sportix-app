import {env} from 'cloudflare:workers';
import {getChatGPTUser,chatGPTSignInPath} from '../chatgpt-auth';
import {coreAdmin} from '@/lib/core/access.mjs';
import Dashboard from './dashboard';
import './globals.css';
export const dynamic='force-dynamic';
export const metadata={title:'PROJECT R STUDIO | ROWAIHY MIND Core'};
export default async function Admin(){
 const user=await getChatGPTUser();
 if(!user)return <main style={{maxWidth:680,margin:'100px auto',padding:30}}><h1>PROJECT R STUDIO</h1><h2>ROWAIHY MIND Core</h2><p>سجّل الدخول بحساب المؤسس للوصول إلى الإدارة.</p><a className="btn primary" href={chatGPTSignInPath('/admin')} target="_top">تسجيل الدخول · Sign in</a><p><a href="/studio.html">بوابة العملاء · Client portal</a></p></main>;
 if(!coreAdmin(env,user.email))return <main style={{maxWidth:680,margin:'100px auto',padding:30}}><h1>مساحة الإدارة خاصة بالمؤسس</h1><p>هذه الصفحة غير متاحة لحسابك. يمكنك متابعة طلباتك من بوابة العملاء.</p><a className="btn" href="/studio.html">Client portal · بوابة العملاء</a></main>;
 return <Dashboard/>;
}
