> وثيقة تاريخية من حزمة 11 نوفمبر؛ الحالة الحالية والاختبارات والحدود في [تغطية MVP](../athlete-mvp-coverage-ar.md).

# ATHLETE × PARTNERS — فصل العقد عن التشغيل

مرجع القراءة: PR#2، commit `6db3b3f6093a7f289017d2245fb336dc17e6d8af`، مجلد `artifacts/partners-workspace-v02`.

| عقد المختبر الموجود | الاستخدام في الحزمة | الناقص للتشغيل |
|---|---|---|
| Listing: id, tenant, module, kind, priceMinor, stock, capacity, status, version | مخطط تحقق runtime ومحول يعرض PRODUCT/COUPON/SUBSCRIPTION المنشور فقط | API كتالوج مخول، حقوق عرض، حالة اعتماد المؤسسة، مزامنة الإصدارات |
| submittedBy / reviewedBy | يمنع اعتماد ذاتي للعرض المقدم للمحول | IAM حقيقي واستعلام حالة اعتماد المؤسسة |
| Order: RESERVED → PAYMENT_AUTHORIZED → CONFIRMED → SHIPPED → DELIVERED | لا يُحوّل إلى paid في ATHLETE؛ intent يبقى AWAITING_OPERATIONAL_BACKEND | حجز ذري، webhook مزود دفع، تحرير مخزون، استرجاع وتسوية |
| Entitlement: ACTIVE / REDEEMED / EXPIRED, uses, expiresAt, version | نوع الكوبون/الاشتراك معلوم؛ إصدار وصرف القسيمة محجوب | ربط المستحق بالرياضي، تحقق الموقع/الموظف، منع إعادة استخدام QR |
| Command: key / op / role / id / version | قاعدة مفاتيح التكرار وإصدار المورد أعيد استخدامها محليًا | الدور في المختبر محاكاة، لا ينقل كصلاحية إنتاجية |
| /api/sandbox، D1_ATOMIC_SANDBOX، synthetic:true، externalDelivery:DISABLED | لا يتم استدعاء endpoint؛ fixture ثابتة مأخوذة من seedMarket | لا يوجد بروتوكول إنتاجي بين التطبيقين |
| النقاط | طلب معاينة اختياري requestedPoints؛ الرصيد القابل للصرف والخصم والمكافأة = صفر | مختبر الشركاء لا يعرّف دفتر نقاط تشغيليًا للرياضي؛ يلزم عقد مستقل |

الكود الجديد `src/lib/athlete/partners.ts` لا يرسل HTTP ولا يقرأ بيانات D1. حجز المعاينة وفحص مخزونها لا يحجز أي مخزون حقيقي. رقم نسخة العرض جزء من الطلب المعاين ولا يتخطى تحقق الخادم المطلوب.

أعيد تشغيل 28 اختبار Rooms و24 اختبار Market/Workflow من المصدر المثبت محليًا، ونجحت كلها. اختبارات HTTP/D1 العشرة المذكورة في PR لم تُعد هنا، وتظل دليلًا تاريخيًا من PR وليست نتيجة لهذه الجلسة. لا نعلن إعادة تنفيذ 62 اختبارًا. لا توجد مفاتيح أو ربط بمزود الدفع أو مخزون حقيقي ضمن الحزمة.
