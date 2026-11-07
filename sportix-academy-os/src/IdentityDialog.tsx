import { useEffect, useState, type FormEvent } from 'react';
import { identityActions } from './netlifyClient';
import { ShieldCheck, X } from 'lucide-react';
import type { AuthProvider, Settings } from '@netlify/identity';

export default function IdentityDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'invite' | 'recovery'>('login');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const show = () => {
      setMode(identityActions.hasInvite() ? 'invite' : identityActions.needsRecovery() ? 'recovery' : 'login');
      setPassword('');
      setOpen(true);
      identityActions.getSettings().then(setSettings).catch(() => setMessage('تسجيل الدخول غير متاح حاليًا. تواصل مع إدارة الأكاديمية.'));
    };
    window.addEventListener('sportix-identity-open', show);
    identityActions.initialize().then(() => {
      if (identityActions.hasInvite() || identityActions.needsRecovery()) show();
    }).catch(() => { setMessage('رابط الدخول غير صالح أو منتهي. اطلب رابطًا جديدًا.'); setOpen(true); });
    return () => window.removeEventListener('sportix-identity-open', show);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    if (password.length < 8) { setMessage('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل'); return; }
    if ((mode === 'login' || mode === 'signup') && !email.includes('@')) { setMessage('البريد الإلكتروني غير صالح'); return; }
    setBusy(true);
    try {
      if (mode === 'recovery') {
        await identityActions.resetPassword(password);
        location.reload();
      } else if (mode === 'invite') {
        await identityActions.acceptInvite(password);
        location.reload();
      } else if (mode === 'signup') {
        await identityActions.signup(email.trim(), password);
        setMessage('تم إرسال تعليمات التأكيد إلى بريدك. أكمل التأكيد قبل تسجيل الدخول.');
      } else {
        await identityActions.login(email.trim(), password);
        location.reload();
      }
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'لم تكتمل العملية. تحقق من إعدادات Netlify Identity.');
    } finally { setBusy(false); }
  }

  if (!open) return null;
  return <div className="sportix-auth-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
    <section className="sportix-auth-dialog" dir="rtl" role="dialog" aria-modal="true" aria-label="حساب الأكاديمية">
      <button className="sportix-auth-close" type="button" aria-label="إغلاق" onClick={() => setOpen(false)}><X size={21}/></button>
      <ShieldCheck color="#c4ff24" size={38}/>
      <div className="sportix-auth-eyebrow">SPORTIX ACADEMY / SECURE ACCESS</div>
      <h2>{mode === 'login' ? 'الدخول لمساحة الأكاديمية' : mode === 'signup' ? 'إنشاء حساب الأكاديمية' : mode === 'recovery' ? 'تعيين كلمة مرور جديدة' : 'قبول الدعوة'}</h2>
      <p>يُستخدم الحساب لحفظ سجلات التدريب واللاعبين بصورة منفصلة عن وضع العرض.</p>
      <form onSubmit={submit}>
        {(mode === 'login' || mode === 'signup') && <label>البريد الإلكتروني<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/></label>}
        <label>كلمة المرور<input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/></label>
        {message && <div role="status" className="sportix-auth-message">{message}</div>}
        <button type="submit" className="sportix-auth-submit" disabled={busy || !settings}>{busy ? 'جارٍ التحقق...' : mode === 'login' ? 'دخول' : mode === 'signup' ? 'إنشاء الحساب' : mode === 'recovery' ? 'حفظ كلمة المرور' : 'قبول الدعوة'}</button>
      </form>
      {(mode === 'login' || mode === 'signup') && settings && !settings.disableSignup && <button className="sportix-auth-switch" onClick={() => {setMessage('');setMode(mode === 'login' ? 'signup' : 'login');}}>{mode === 'login' ? 'لا تملك حسابًا؟ أنشئ حسابًا' : 'لديك حساب؟ سجل الدخول'}</button>}
      {mode === 'login' && settings && Object.entries(settings.providers).filter(([provider, enabled]) => provider !== 'email' && enabled).map(([provider]) => <button key={provider} className="sportix-auth-switch" onClick={() => identityActions.oauthLogin(provider as AuthProvider)}>الدخول عبر {provider}</button>)}
      {settings?.disableSignup && <small>الوصول بدعوة من إدارة الأكاديمية.</small>}
    </section>
  </div>;
}
