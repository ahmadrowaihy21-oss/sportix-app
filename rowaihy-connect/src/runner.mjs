import { performance } from 'node:perf_hooks';
const MAX_BODY = 512 * 1024;
export async function runCheck(baseUrl, check, { fetcher = fetch, signal } = {}) {
  const started = performance.now();
  const assertions = [];
  let status = null;
  let body = '';
  let bytes = 0;
  let response;
  const timeout = AbortSignal.timeout(check.maxMs);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  try {
    response = await fetcher(new URL(check.path, baseUrl), {
      method: check.method, redirect: 'manual', signal: combined,
      headers: { 'User-Agent': 'ROWAIHY-CONNECT/0.1', Accept: 'application/json, text/html, text/plain;q=0.9, */*;q=0.1' }
    });
    status = response.status;
    assertions.push({ label: 'رمز HTTP', expected: check.expectedStatus, actual: status, passed: status === check.expectedStatus });
    if (check.method !== 'HEAD' && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          bytes += part.value.byteLength;
          if (bytes > MAX_BODY) throw new Error('تجاوزت الاستجابة الحد الأقصى: 512 كيلوبايت');
          body += decoder.decode(part.value, { stream: true });
        }
        body += decoder.decode();
      } finally { await reader.cancel().catch(() => {}); }
    }
    if (check.contains) assertions.push({ label: 'النص المطلوب', expected: check.contains, actual: body.includes(check.contains), passed: body.includes(check.contains) });
    if (check.jsonPath) {
      try {
        let actual = JSON.parse(body);
        if (check.jsonPath !== '$') for (const key of check.jsonPath.split('.')) actual = actual != null && Object.hasOwn(Object(actual), key) ? actual[key] : undefined;
        const expected = JSON.parse(check.jsonExpected);
        const passed = deepEqual(actual, expected);
        assertions.push({ label: 'JSON: ' + check.jsonPath, expected, actual: actual === undefined ? '(غير موجود)' : actual, passed });
      } catch { assertions.push({ label: 'JSON: ' + check.jsonPath, expected: JSON.parse(check.jsonExpected), actual: 'الاستجابة ليست JSON صالحًا', passed: false }); }
    }
    const durationMs = Math.round(performance.now() - started);
    assertions.push({ label: 'الوقت بالمللي ثانية', expected: check.maxMs, actual: durationMs, passed: durationMs <= check.maxMs });
    return { checkId: check.id, name: check.name, path: check.path, status, durationMs, passed: assertions.every(x => x.passed), assertions, error: null };
  } catch (error) {
    const cancelled = signal?.aborted;
    return { checkId: check.id, name: check.name, path: check.path, status, durationMs: Math.round(performance.now() - started), passed: false, assertions,
      error: cancelled ? 'أُلغي التشغيل' : timeout.aborted ? 'انتهت مهلة الفحص' : 'تعذر إكمال الطلب: ' + String(error.message).slice(0, 300) };
  }
}
function deepEqual(a, b) {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));
}
export class RunQueue {
  constructor(store, { concurrency = 2, fetcher = fetch } = {}) {
    this.store = store; this.concurrency = concurrency; this.fetcher = fetcher;
    this.pending = []; this.active = new Map(); this.closed = false;
  }
  enqueue(run) { if (this.closed) throw new Error('Queue closed'); this.pending.push(run.id); this.pump(); }
  cancel(id) {
    const run = this.store.getRun(id);
    if (!run || !['queued','running'].includes(run.status)) return false;
    this.pending = this.pending.filter(x => x !== id);
    this.active.get(id)?.abort();
    this.store.finishRun(id, 'cancelled');
    return true;
  }
  pump() {
    while (!this.closed && this.active.size < this.concurrency && this.pending.length) {
      const id = this.pending.shift();
      const control = new AbortController(); this.active.set(id, control);
      this.work(id, control).catch(error => {
        this.store.finishRun(id, 'failed', String(error.message).slice(0,300));
      }).finally(() => { this.active.delete(id); this.pump(); });
    }
  }
  async work(id, control) {
    const run = this.store.getRun(id);
    if (!run || run.status !== 'queued') return;
    this.store.startRun(id);
    for (const check of run.project.checks) {
      if (control.signal.aborted) return;
      const result = await runCheck(run.project.baseUrl, check, { fetcher: this.fetcher, signal: control.signal });
      if (control.signal.aborted) return;
      this.store.addResult(id, result);
    }
    const latest = this.store.getRun(id);
    this.store.finishRun(id, latest.results.every(x => x.passed) ? 'passed' : 'failed');
  }
  async close() {
    this.closed = true;
    for (const id of this.pending) this.store.finishRun(id, 'interrupted');
    this.pending = [];
    for (const [id, control] of this.active) { control.abort(); this.store.finishRun(id, 'interrupted'); }
    while (this.active.size) await new Promise(resolve => setTimeout(resolve, 10));
  }
}
