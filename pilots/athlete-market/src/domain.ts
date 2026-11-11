export type Activity = {
  id: string; sport: string; startedAt: number; endedAt?: number;
  title?: string; note?: string; mediaPath?: string; mediaType?: string;
  published?: boolean; credited?: boolean; withdrawn?: boolean;
};
export type MarketQuote = {
  policyVersion: string; offerId: string; currency: 'SAR';
  priceMinor: number; pointsUsed: number; coverageMinor: number; athleteDueMinor: number;
};
export type Redemption = {
  id: string; offer: string; cost: number;
  status: 'reserved' | 'delivered' | 'cancelled'; at: number;
  quote?: MarketQuote; simulatedPaymentAt?: number;
  settlementStatus?: 'not_connected' | 'cancelled';
};
export type JourneyEvent = {
  id: string; type: string; resourceId: string; occurredAt: number;
  revision: number; pointsDelta: number; balanceAfter: number;
  delivery: 'internal_recorded';
};
export type AthleteState = {
  name: string; sport: string; city: string; balance: number; revision: number;
  activities: Activity[]; redemptions: Redemption[]; events?: JourneyEvent[];
};
// Demonstration policy only; commercial rates require a separate approved policy.
export const MARKET_POLICY = { version: 'market-sandbox-v1', pointValueMinor: 10, maxCoverageBasisPoints: 3000 } as const;
export const offers = [
  { id: 'recovery', name: 'جلسة استشفاء رياضي', partner: 'RECOVERY LAB', type: 'العناية والتعافي', cost: 200, priceMinor: 10000, icon: 'recovery', color: '#d6d2fa', description: 'جلسة استشفاء لمدة ٣٠ دقيقة. منتج توضيحي لا يمثل شريكًا متعاقدًا.' },
  { id: 'gear', name: 'معدات رياضية', partner: 'THE SPORT STORE', type: 'معدات رياضية', cost: 350, priceMinor: 15000, icon: 'gear', color: '#c3e8d0', description: 'منتج رياضي توضيحي لاختبار تغطية جزء من السعر بنقاط SPORTIX.' },
  { id: 'training', name: 'حصة تدريب شخصية', partner: 'MOVE STUDIO', type: 'تدريب وتطوير', cost: 500, priceMinor: 20000, icon: 'training', color: '#f6d8a9', description: 'حصة تدريب توضيحية. لا يُحجز موعد أو يُرسل مبلغ إلى جهة خارجية.' }
];
export function maxPointsFor(offerId: string, balance: number) {
  const offer = offers.find(o => o.id === offerId);
  if (!offer || !Number.isSafeInteger(balance) || balance < 0) return 0;
  return Math.min(balance, Math.floor(offer.priceMinor * MARKET_POLICY.maxCoverageBasisPoints / 10000 / MARKET_POLICY.pointValueMinor));
}
export function marketQuote(offerId: string, points: number, balance: number): MarketQuote {
  const offer = offers.find(o => o.id === offerId);
  if (!offer) throw new Error('المنتج غير موجود.');
  if (!Number.isSafeInteger(points) || points < 1) throw new Error('اختر عددًا صحيحًا من النقاط أكبر من صفر.');
  if (points > maxPointsFor(offerId, balance)) throw new Error('النقاط تتجاوز الرصيد أو حد تغطية المنتج.');
  const coverageMinor = points * MARKET_POLICY.pointValueMinor;
  return { policyVersion: MARKET_POLICY.version, offerId, currency: 'SAR', priceMinor: offer.priceMinor, pointsUsed: points, coverageMinor, athleteDueMinor: offer.priceMinor - coverageMinor };
}
export function initialState(name = 'رياضي جديد'): AthleteState {
  return { name, sport: 'الجري', city: 'الرياض', balance: 250, revision: 0, activities: [], redemptions: [], events: [] };
}
export function transition(state: AthleteState, kind: string, payload: Record<string, unknown>, id: string, now = Date.now()): AthleteState {
  if (!Number.isSafeInteger(state.balance) || state.balance < 0) throw new Error('حالة الرصيد تحتاج مراجعة.');
  const next: AthleteState = JSON.parse(JSON.stringify(state));
  next.events ||= [];
  const activity = next.activities.find(a => a.id === payload.activityId);
  let resourceId = String(payload.activityId || payload.redemptionId || id);
  if (kind === 'profile') {
    const name = String(payload.name || '').trim();
    if (name.length < 2 || name.length > 60) throw new Error('اكتب اسمًا بين حرفين و٦٠ حرفًا.');
    next.name = name;
    next.city = String(payload.city || 'الرياض').slice(0, 60);
    next.sport = String(payload.sport || 'الجري').slice(0, 30);
  } else if (kind === 'start') {
    if (next.activities.length >= 100) throw new Error('وصلت إلى حد جلسات التجربة.');
    if (next.activities.some(a => !a.endedAt)) throw new Error('أنهِ الجلسة الحالية أولًا.');
    if (!['الجري', 'كرة القدم', 'المشي', 'اللياقة', 'الدراجات'].includes(String(payload.sport))) throw new Error('اختر رياضة صحيحة.');
    next.activities.unshift({ id, sport: String(payload.sport), startedAt: now });
  } else if (kind === 'end') {
    if (!activity || activity.endedAt) throw new Error('الجلسة غير متاحة أو انتهت بالفعل.');
    activity.endedAt = Math.max(now, activity.startedAt);
  } else if (kind === 'publish') {
    if (!activity?.endedAt || !activity.mediaPath) throw new Error('أنهِ الجلسة وأرفق صورة أو فيديو قبل النشر.');
    if (activity.published || activity.withdrawn) throw new Error('لا يمكن إعادة نشر هذه الجلسة.');
    if (payload.consent !== true) throw new Error('موافقة المشاركة مطلوبة.');
    const title = String(payload.title || '').trim();
    if (title.length < 3 || title.length > 100) throw new Error('اكتب عنوانًا بين ٣ و١٠٠ حرف.');
    activity.title = title;
    activity.note = String(payload.note || '').slice(0, 500);
    activity.published = true;
    if (!activity.credited) { activity.credited = true; next.balance += 50; }
  } else if (kind === 'withdraw') {
    if (!activity?.published) throw new Error('المنشور غير متاح للسحب.');
    activity.published = false;
    activity.withdrawn = true;
    // Withdrawal is not blocked by wallet balance. Prior credit is retained, never re-awarded.
  } else if (kind === 'redeem') {
    if (next.redemptions.length >= 100) throw new Error('وصلت إلى حد طلبات التجربة.');
    if (payload.policyVersion !== MARKET_POLICY.version) throw new Error('تغيرت سياسة التغطية. راجع تفاصيل السعر مجددًا.');
    const quote = marketQuote(String(payload.offerId), Number(payload.points), next.balance);
    next.balance -= quote.pointsUsed;
    next.redemptions.unshift({ id, offer: quote.offerId, cost: quote.pointsUsed, quote, status: 'reserved', at: now, settlementStatus: 'not_connected' });
  } else if (kind === 'cancel' || kind === 'simulate_payment' || kind === 'deliver') {
    const order = next.redemptions.find(r => r.id === payload.redemptionId);
    if (!order || order.status !== 'reserved') throw new Error('الطلب ليس بانتظار الاستلام.');
    resourceId = order.id;
    if (kind === 'cancel') {
      order.status = 'cancelled'; order.settlementStatus = 'cancelled'; next.balance += order.cost;
    } else if (kind === 'simulate_payment') {
      if (!order.quote || order.simulatedPaymentAt) throw new Error('المحاكاة غير متاحة لهذا الطلب.');
      order.simulatedPaymentAt = now;
    } else {
      if (order.quote && order.quote.athleteDueMinor > 0 && !order.simulatedPaymentAt) throw new Error('أكمل محاكاة دفع المتبقي أولًا.');
      order.status = 'delivered';
    }
  } else { throw new Error('عملية غير مدعومة.'); }
  next.revision += 1;
  next.events.unshift({ id, type: kind, resourceId, occurredAt: now, revision: next.revision, pointsDelta: next.balance - state.balance, balanceAfter: next.balance, delivery: 'internal_recorded' });
  next.events = next.events.slice(0, 200);
  return next;
}
