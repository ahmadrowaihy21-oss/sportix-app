> وثيقة تاريخية من حزمة 11 نوفمبر؛ الحالة الحالية والاختبارات والحدود في [تغطية MVP](../athlete-mvp-coverage-ar.md).

# حدود API المقترحة — غير منفذة أو منشورة

كل المسارات أدناه تصور للتنفيذ الخادمي التالي. المخطط المحلي الحالي لا يقدم HTTP endpoint.

| المسار | المدخلات الدنيا | الاستجابة / القيود |
|---|---|---|
| GET /api/v1/me | cookie session | هوية opaque من الخادم؛ 401 دون جلسة، 403 للموقوف؛ Cache-Control: no-store |
| POST /api/v1/activities | kind، Idempotency-Key | activityId مملوك للرياضي، CREATED؛ لا يقبل ownerId أو verified |
| POST /api/v1/activities/:id/evidence | expectedVersion، وصف media | رابط رفع قصير العمر ملكي؛ فحص المحتوى والحجم قبل التحقق |
| POST /api/v1/activities/:id/submit | expectedVersion | 202 للتحقق؛ لا قبول نتيجة من العميل |
| GET /api/v1/activities/:id | معرف المورد | الحالة والأدلة المسموحة للمالك فقط |
| PUT /api/v1/activities/:id/consent | expectedVersion، audience، shareMetrics، policyVersion | نسخه جديدة وإبطال الإسقاطات القديمة؛ لا تغيير المالك |
| GET /api/v1/sport-id/me | cookie session | سجل خاص مفصول حسب مصدره وحالته |
| GET /api/v1/community/feed | cursor | فلترة خادمية بالموافقة والعلاقة؛ ملخص منقح |
| GET /api/v1/market/listings | filters | عروض معتمدة منشورة، minor units، currency، version |
| POST /api/v1/market/intents | listingId، listingVersion، quantity، requestedPoints، Idempotency-Key | عرض سعر خادمي وحالة طلب؛ لا يتلقى amount كمرجع حقيقة |
| POST /api/v1/market/intents/:id/checkout | expectedVersion، paymentMethodToken | provider flow؛ لا حالة paid قبل webhook موثّق |
| POST /internal/payment-events | provider event | توقيع، منع إعادة التنفيذ، تطابق الطلب والمبلغ والعملة والمستفيد |
| POST /api/v1/partner/entitlements/:id/redeem | expectedVersion، redemptionToken، Idempotency-Key | IAM الشريك/الفرع وتحديث ذري؛ لا تجاوز من QR فقط |
| GET /api/v1/points/me | session | دفتر النقاط؛ لا endpoint عام لزيادة الرصيد |

الأخطاء الموحدة: `{error:{code,requestId,retryable}}` مع 401/403/404 (وفق سياسة منع كشف وجود الموارد)، 409 لتعارض النسخ/مفتاح التكرار، 422 للمدخلات، و503 لتعطل التبعيات. لا تتضمن الأخطاء بريدًا أو رموز جلسات أو بيانات أدلة.

متطلبات التخزين: users، auth_subjects، activities، evidence، activity_consents، sport_id_entries، community_projections، partner_listings، commerce_intents، stock_holds، payments، entitlements، points_ledger، idempotency_receipts، audit_events، outbox. قيود unique على subject ومستهلك الحدث وactivityId في SPORT ID. معاملتا المخزون والدفتر يجب أن تصمدا أمام التزامن الفعلي متعدد العمليات. لا ينفذ المخطط المحلي هذا الضمان.

بوابات قبول قبل التشغيل: جلسة حقيقية مثبتة؛ اختبار منع قراءة/تعديل هوية أخرى؛ rollback ذري؛ اختبار تزامن مخزون؛ توقيع webhook؛ replay/reordering؛ سحب مشاركة وإبطال cache؛ عزل مؤسسة؛ مبالغ وعملات واسترداد؛ سياسة قاصر؛ export/deletion/retention؛ تسجيل ومراقبة أخطاء ومراجعة صلاحيات.
