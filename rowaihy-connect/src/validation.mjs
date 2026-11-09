export class InputError extends Error {}
export function text(value, label, max = 200, required = true) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new InputError(label);
  return value.trim();
}
export function normalizeProject(input) {
  if (!input || typeof input !== 'object') throw new InputError('بيانات المشروع غير صالحة');
  const name = text(input.name, 'اكتب اسم المشروع', 100);
  const raw = text(input.baseUrl, 'اكتب رابط المشروع', 2048);
  let base; try { base = new URL(raw); } catch { throw new InputError('الرابط غير صالح'); }
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.hash) throw new InputError('استخدم رابط HTTP أو HTTPS بلا بيانات دخول أو جزء #');
  if (base.port && ['25','110','143','465','587','993','995'].includes(base.port)) throw new InputError('استخدم منفذ تطبيق ويب');
  const source = input.checks;
  if (!Array.isArray(source) || !source.length || source.length > 30) throw new InputError('أضف من فحص واحد إلى 30 فحصًا');
  const checks = source.map((item, index) => {
    if (!item || typeof item !== 'object') throw new InputError('الفحص غير صالح');
    const name = text(item.name, 'اكتب اسم كل فحص', 120);
    const path = text(item.path, 'اكتب مسار كل فحص', 2048);
    let url; try { url = new URL(path, base); } catch { throw new InputError('مسار الفحص غير صالح'); }
    if (url.origin !== base.origin || url.username || url.password || url.hash || path.includes('\\')) throw new InputError('كل فحص يجب أن يبقى داخل عنوان المشروع نفسه');
    const method = item.method ?? 'GET';
    if (!['GET', 'HEAD'].includes(method)) throw new InputError('النسخة الحالية تدعم GET وHEAD');
    const expectedStatus = Number(item.expectedStatus ?? 200);
    const maxMs = Number(item.maxMs ?? 5000);
    if (!Number.isInteger(expectedStatus) || expectedStatus < 100 || expectedStatus > 599) throw new InputError('رمز HTTP المتوقع غير صالح');
    if (!Number.isInteger(maxMs) || maxMs < 100 || maxMs > 30000) throw new InputError('حدد مهلة بين 100 و30000 مللي ثانية');
    const contains = text(item.contains ?? '', 'النص المتوقع طويل جدًا', 1000, false);
    const jsonPath = text(item.jsonPath ?? '', 'مسار JSON غير صالح', 200, false);
    const jsonExpected = text(item.jsonExpected ?? '', 'قيمة JSON طويلة جدًا', 1000, false);
    if (jsonPath && !/^(?:\$|[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*)$/.test(jsonPath)) throw new InputError('استخدم مسار JSON مثل status أو data.ready أو $ للجذر');
    if (jsonPath) { try { JSON.parse(jsonExpected); } catch { throw new InputError('القيمة المتوقعة يجب أن تكون JSON صحيحًا، مثل true أو "ok"'); } }
    if (method === 'HEAD' && (contains || jsonPath)) throw new InputError('فحص HEAD لا يحتوي على جسم استجابة');
    return { id: String(index + 1), name, path, method, expectedStatus, maxMs, contains, jsonPath, jsonExpected };
  });
  return { name, baseUrl: base.href, notes: text(input.notes ?? '', 'الملاحظات طويلة جدًا', 1500, false), checks };
}
