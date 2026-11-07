import {
  getUser as getIdentityUser,
  login as identityLogin,
  signup as identitySignup,
  logout as identityLogout,
  handleAuthCallback,
  acceptInvite,
  getSettings,
  oauthLogin,
  updateUser,
} from '@netlify/identity';

export type SportixUser = { userId: string; email?: string; name?: string };
let pendingCallback: Promise<unknown> | null = null;
let inviteToken: string | null = null;
let recoveryPending = false;

async function restoreIdentity() {
  if (!pendingCallback) {
    pendingCallback = handleAuthCallback().then(result => {
      if (result?.type === 'invite') inviteToken = result.token ?? null;
      recoveryPending = result?.type === 'recovery';
      if (inviteToken || recoveryPending) window.dispatchEvent(new Event('sportix-identity-open'));
      return result;
    });
  }
  try { await pendingCallback; } catch {
    throw new Error('تعذر تأكيد رابط الدخول. اطلب رابطًا جديدًا وحاول مرة أخرى.');
  }
}

async function request(method: string, path: string, body?: unknown) {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('خدمة الأكاديمية غير متاحة حاليًا. حاول مرة أخرى لاحقًا.');
  }
  const payload = await response.json();
  if (!response.ok) {
    const message = payload.error || payload.message || `HTTP ${response.status}`;
    const failure = new Error(message) as Error & { response?: { data: unknown; status: number } };
    failure.response = { data: payload, status: response.status };
    throw failure;
  }
  return { data: payload };
}

export const api = {
  get: (path: string) => request('GET', path),
  post: (path: string, body?: unknown) => request('POST', path, body),
  put: (path: string, body?: unknown) => request('PUT', path, body),
  delete: (path: string) => request('DELETE', path),
};

export const auth = {
  async getUser(): Promise<SportixUser | null> {
    await restoreIdentity();
    const user = await getIdentityUser();
    if (!user) return null;
    return {
      userId: user.id,
      email: user.email ?? undefined,
      name: user.email ?? undefined,
    };
  },
  async signInWithRedirect() {
    window.dispatchEvent(new Event('sportix-identity-open'));
  },
  async signOut() {
    await identityLogout();
  },
};

export const identityActions = {
  initialize: restoreIdentity,
  getSettings,
  oauthLogin,
  login: identityLogin,
  signup: identitySignup,
  acceptInvite: async (password: string) => {
    if (!inviteToken) throw new Error('رابط الدعوة غير موجود');
    await acceptInvite(inviteToken, password);
    inviteToken = null;
  },
  hasInvite: () => Boolean(inviteToken),
  needsRecovery: () => recoveryPending,
  resetPassword: async (password: string) => {
    if (!recoveryPending) throw new Error('رابط استعادة كلمة المرور غير موجود');
    await updateUser({ password });
    recoveryPending = false;
  },
};
