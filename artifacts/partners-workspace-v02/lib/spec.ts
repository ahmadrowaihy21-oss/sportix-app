export const sources=[
 {id:'EV-07',title:'SPORTIX CORE — architecture وAPI وMCP والأمن',kind:'تصميم معتمد',url:'https://app.notion.com/p/4112e6080e9581c18caafd8092efdcc9',note:'الهوية والنطاقات وطبقة API والأحداث؛ MCP لا يستبدل معاملات التشغيل.'},
 {id:'EV-08',title:'Analytics Hub REST — Google Cloud',kind:'وثائق رسمية',url:'https://docs.cloud.google.com/bigquery/docs/reference/analytics-hub/rest',note:'Data Exchanges وListings وSubscriptions للبيانات التحليلية؛ لا يمثل حجزًا أو اشتراك خدمة رياضية.'},
 {id:'EV-01',title:'GO SPORTIX وROOMS وحجز الأنشطة',kind:'تصميم معتمد',url:'https://app.notion.com/p/4112e6080e9581bf8e51d14fcda2f8b7',note:'قرار 9 نوفمبر 2026: PARTNERS + ROOMS CONNECT ومسار Claim & Confirm. لا يثبت التشغيل.'},
 {id:'EV-02',title:'MARKETPLACE وPARTNERS وPOINT',kind:'تصميم معتمد',url:'https://app.notion.com/p/4112e6080e958118877ce445502bfded',note:'بوابة موحدة للشركاء وعزل المؤسسات؛ الغرفة ليست منتج متجر.'},
 {id:'EV-03',title:'SPORTIX BRAND DNA',kind:'مرجع الهوية',url:'https://app.notion.com/p/4112e6080e9581eea5e5f115aabf17f1',note:'فحمي + ليموني + فضي، العربية RTL ووضوح تقارير التشغيل.'},
 {id:'EV-04',title:'Rooms.tsx',kind:'كود مقروء',url:'https://github.com/ahmadrowaihy21-oss/sportix-app/blob/main/src/components/rooms/Rooms.tsx',note:'SHA a37346f4bc97fdab3f72bbc65ab5941691c25445. إنشاء/عرض غرف، انتظار وحالات طرفية ورابط حجز خارجي. لم يُشغّل المستودع في هذه المراجعة.'},
 {id:'EV-05',title:'rooms/store.ts',kind:'كود مقروء',url:'https://github.com/ahmadrowaihy21-oss/sportix-app/blob/main/src/lib/rooms/store.ts',note:'SHA bbe5c9f7fe54b52f9f735948df808c561bc8d61f. Zustand وبيانات تجريبية؛ confirm يغيّر حالة الغرفة محليًا. لا يثبت قفلًا ذريًا أو تفويض دفع.'},
 {id:'EV-06',title:'Master Canon · الصفحات 41–44',kind:'وثيقة مقروءة',url:'https://chatgpt.com/library?file_id=libfile_4d9c978fdf048191b35f15d5be610219&account_id=personal',note:'وقت ومكان وسعة الغرفة، الحد الأدنى، الإلغاء، الدفع المقسم، وفصل الحضور عن التحقق الرياضي.'}
];
export const reuse=[
 ['RoomsHost / FindRooms','موجود في الكود','إعادة استخدام مشروطة','تبويبات الغرف وفلتر الرياضة بعد مراجعة الوصول واللغة.','EV-04'],
 ['CreateRoom / RoomDetail','موجود في الكود','تعديل','حقول وقت منظمة وresource_id؛ فصل حضور الغرفة عن تأكيد الحجز.','EV-04'],
 ['useRooms / MatchRoom','موجود في الكود','تعديل جذري','تخزين محلي فقط؛ إبقاء RoomState منفصلًا عن BookingState وإضافة booking_id.','EV-05'],
 ['applyEdge / providerState','موجود في الكود','استبدال الربط','واجهة للحالات الطرفية؛ استبدال التبديل المحلي بأحداث خادم موثقة.','EV-05'],
 ['finishPostMatch','موجود في الكود','حاجز قبل إعادة الاستخدام','مسار محلي ينشر نتيجة verified بعد present؛ يلزم فصل دليل الحضور عن Verification قبل أي إنتاج.','EV-05'],
 ['SPORTIX PARTNERS onboarding','تصميم مقترح','تطوير جديد','هوية مؤسسة، أهلية، موافقات، دعوة مدير منشأة وعزل tenant.','EV-01 / EV-02'],
 ['Inventory + holds + booking','تصميم مقترح','تطوير جديد','قاعدة بيانات معاملات، حجز حصري للمورد والفترة، انتهاء وحفظ أحداث.','AC-01 / AC-08'],
 ['Payment / notifications / calendar','غير مختبر','تكامل جديد','Webhook موقع، إقرارات استلام، إعادة محاولات، تعويض مالي؛ التقويم ليس مصدر التوافر.','INT-01 / INT-02']
];
export const entities=[
 ['ModuleGrant / Membership','org_id, user_id, module, role, resource_scope, version','منح وحدات ROOMS / COUPONS / PRODUCTS / IMPACT مستقلة عن اسم المؤسسة'],
 ['Listing / PublicationReview','listing_id, org_id, kind, status, submitted_by, reviewed_by, version','مراجعة مستقلة قبل النشر؛ تعديل مؤثر يعيد العرض للمراجعة'],
 ['Inventory / Order / Reservation','sku_id, available, reserved, order_id, expires_at, quote_minor','لا مخزون سالب؛ قفل صف SKU؛ الإلغاء يعيد الحجز مرة واحدة'],
 ['Entitlement / Redemption / Subscription','entitlement_id, owner_id, expires_at, remaining_uses, redemption_key','قفل الاستحقاق؛ الصلاحية والعدد؛ منع إعادة الاستخدام والتكرار'],
 ['ImpactOffer / Registration','offer_id, entity_nature, capacity, member_id, terms_version','قيد فريد (offer_id,member_id)؛ لا خلط للتبرعات والبيع'],
 ['workflow_workspaces — المنفذ للمختبر','owner PK, revision, document, updated_at','وثيقة معزولة لكل هوية؛ تحديث D1 شرطي يحفظ الحالة والتدقيق وOutbox معًا'],
 ['Partner','partner_id (PK), tenant_id, legal_name, status, submitted_by','مؤسسة واحدة؛ حالات DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED / CHANGES_REQUIRED / SUSPENDED.'],
 ['Membership','user_id + tenant_id (PK), role, venue_scope[], active','الهوية والنطاق من الجلسة الموثقة؛ لا تثق بدور أو tenant من المتصفح.'],
 ['Venue','venue_id (PK), tenant_id (FK), type, city, timezone, eligibility','ملعب/مركز/أكاديمية؛ Asia/Riyadh للعرض، UTC للتخزين.'],
 ['Resource','resource_id (PK), venue_id (FK), sport, player_capacity, status, version','كل ملعب/قاعة مورد حصري مستقل؛ سعة اللاعبين ليست عدد حجوزات متزامنة.'],
 ['Service / PriceVersion','service_id (PK), resource_id (FK), duration, price_minor, currency, version','SAR بالهللات؛ snapshot لسعر شامل/غير شامل الضريبة حسب قرار تجاري قبل الإنتاج.'],
 ['AvailabilityRule / Exception','rule_id (PK), resource_id (FK), weekday, hours, effective_range','توليد فترات [start,end) من جدول أسبوعي واستثناءات؛ التوافر الحي له checked_at وversion.'],
 ['Maintenance / SafetyBlock','block_id (PK), resource_id (FK), during, severity, status, evidence','يتشارك قفل صف المورد مع تأكيد الحجز؛ إغلاق الحظر يحتاج مراجعًا مخولًا ودليلًا.'],
 ['Room','room_id (PK), host_id (FK), sport, location, start, end, minimum, players','مشاركة وعضوية منفصلتان عن الحجز؛ booking_id لا يعني اكتمال نشاط موثق.'],
 ['Booking / Allocation','booking_id (PK), room_id/resource_id (FK), state, version, lease_token, expires_at','قيد عدم تداخل للمورد؛ حجز نشط واحد للغرفة؛ تحويل hold إلى confirmed في المعاملة نفسها.'],
 ['PaymentAuthorization','auth_id (PK), booking_id (FK), amount_minor, currency, status, expires_at','مرجع تفويض فقط؛ لا بيانات بطاقة. المطابقة الدقيقة للقيمة/العملة/الحجز قبل التأكيد.'],
 ['Outbox / DeliveryReceipt','event_id (PK), booking_id (FK), attempt, provider_receipt, delivered_at','التزامن مع المعاملة؛ retries وdeduplication. VENUE_NOTIFIED بعد إقرار صالح فقط.'],
 ['AuditEvent / IdempotencyKey','event_id (PK), actor, tenant, action, version, evidence / scoped_key','سجل append-only؛ مفتاح التكرار مرتبط بالهوية والمسار وبصمة جسم الطلب ونتيجته.']
];
export const permissions=[
 ['إدارة عروض السوق والمنتجات والاشتراكات','نعم ضمن نطاق مدقق','مؤسسته + منح الوحدة','فقط عند منحه وحدة السوق؛ fixture الغرف لا يملكها','مراجعة فقط'],
 ['نشر عرض في SPORTIX MARKET','بعد اعتماد مستقل','بعد اعتماد مستقل','لا في fixture مدير المنشأة','يُراجع ولا ينشر'],
 ['استخدام قسيمة / تأكيد طلب / تسجيل IMPACT','وفق قيود المجال','مؤسسته + منح الوحدة','لا في fixture مدير المنشأة','لا'],
 ['اعتماد شريك / تعليق نشره','نعم + تدقيق','لا','لا','مراجعة نطاقه؛ منع اعتماد طلبه'],
 ['إدارة المنشآت والخدمات والأسعار','نطاق إداري مدقق','مؤسسته فقط','المنشآت المسندة فقط','قراءة فقط'],
 ['إسناد مدير / صلاحيات','نعم دون تجاوز العزل','داخل مؤسسته ودون تصعيد إداري','لا','لا'],
 ['Claim / Confirm / Valid Reject','بسبب مسجل + جميع الشروط','نطاق مؤسسته','نطاق المنشأة','لا'],
 ['الإلغاء التشغيلي','حسب السياسة + تدقيق','نطاق مؤسسته','نطاق المنشأة','توصية فقط'],
 ['فتح صيانة / حظر سلامة','نعم','نطاق مؤسسته','نطاق المنشأة','قراءة وتوصية'],
 ['رفع حظر سلامة','اعتماد مستقل + دليل','طلب مراجعة فقط','طلب مراجعة فقط','مراجعة مخولة؛ دون اعتماد ذاتي'],
 ['تقارير الحجز والتدقيق','حد الحاجة ونطاق المهمة','بيانات مؤسسته','بيانات المنشأة','قراءة نطاق المراجعة'],
 ['تفويض / تحصيل / استرداد دفع','تتبع؛ لا تعديل سجل المزود','تتبع نطاقه','حالة دفع فقط','قراءة مدققة']
];
export const contracts=[
 {method:'POST',path:'/v1/market/listings',role:'PARTNER + MODULE GRANT',description:'إنشاء عرض للسوق في مسودة',body:{module:'COUPONS',kind:'SUBSCRIPTION',name:'اشتراك تجريبي',price_minor:24000,currency:'SAR'},result:'201 listing_id + DRAFT + version'},
 {method:'POST',path:'/v1/market/listings/{id}/review',role:'REVIEWER',description:'مراجعة مستقلة لعرض السوق',body:{decision:'APPROVED',evidence_ref:'demo-review'},result:'200 APPROVED؛ منع الاعتماد الذاتي'},
 {method:'POST',path:'/v1/market/listings/{id}/publish',role:'PARTNER + MODULE GRANT',description:'نشر عرض مؤهل داخل SPORTIX MARKET',body:{policy_version:'draft-2'},result:'200 PUBLISHED + version؛ اعتماد مستقل أولًا'},
 {method:'POST',path:'/v1/market/orders',role:'ATHLETE',description:'حجز مخزون ذري مع سعر ثابت ومهلة',body:{listing_id:'demo-product',quantity:1,quote_version:1},result:'201 RESERVED + expires_at؛ لا مخزون سالب'},
 {method:'POST',path:'/v1/market/orders/{id}/confirm',role:'PAYMENT SERVICE',description:'تأكيد بعد تفويض موثوق ومطابق',body:{authorization_id:'demo-auth'},result:'200 CONFIRMED؛ التحصيل والتسوية منفصلان'},
 {method:'POST',path:'/v1/market/orders/{id}/cancel',role:'ATHLETE / PARTNER',description:'إلغاء وتحرير الحجز مرة واحدة',body:{reason:'demo-cancel',policy_version:'draft-2'},result:'200 CANCELLED + VOID_PENDING أو REFUND_PENDING'},
 {method:'POST',path:'/v1/market/orders/{id}/returns',role:'ATHLETE',description:'طلب إرجاع بعد التسليم',body:{reason:'demo-return'},result:'202 RETURN_REQUESTED؛ لا إعادة مخزون قبل الفحص'},
 {method:'POST',path:'/v1/market/entitlements/{id}/redeem',role:'PARTNER + COUPONS GRANT',description:'استخدام كوبون أو حصة اشتراك ذريًا',body:{use_count:1,resource_id:'demo-court-a'},result:'200 remaining_uses؛ منع التكرار والصلاحية المنتهية'},
 {method:'POST',path:'/v1/market/impact/{id}/registrations',role:'ATHLETE',description:'التسجيل في عرض IMPACT وفق صفته وسعته',body:{participant_id:'demo-member-1',terms_version:'draft-2'},result:'201 registration_id؛ عضو واحد لكل عرض؛ التبرع منفصل'},
 {method:'POST',path:'/v1/partners',role:'PARTNER',description:'إنشاء ملف مؤسسة اصطناعي في DRAFT',body:{display_name:'شريك تجريبي 01',partner_types:['VENUE']},result:'201 Partner؛ tenant مشتق من الهوية'},
 {method:'POST',path:'/v1/partners/{id}/submit',role:'PARTNER',description:'إرسال الملف للمراجعة بعد اكتمال البيانات',body:{document_refs:['demo-doc-01'],policy_version:'draft-1'},result:'202 SUBMITTED؛ لا تنشر المنشأة تلقائيًا'},
 {method:'POST',path:'/v1/partners/{id}/review',role:'REVIEWER / ADMIN',description:'قرار أهلية مستقل عن مقدم الطلب',body:{decision:'APPROVED',evidence_ref:'demo-review-01'},result:'200 APPROVED أو CHANGES_REQUIRED؛ SELF_APPROVAL مرفوض'},
 {method:'POST',path:'/v1/venues',role:'PARTNER / ADMIN',description:'إضافة منشأة إلى المؤسسة المصرّح بها',body:{partner_id:'demo-partner-01',type:'VENUE',city:'جدة',timezone:'Asia/Riyadh'},result:'201 Venue؛ لا قبول لـ tenant غير مطابق'},
 {method:'POST',path:'/v1/venues/{id}/resources',role:'PARTNER / MANAGER',description:'إنشاء ملعب أو قاعة قابلة للحجز',body:{sport:'PADEL',capacity:4,exclusive:true},result:'201 Resource'},
 {method:'PATCH',path:'/v1/resources/{id}',role:'PARTNER / MANAGER',description:'تعديل الخدمة والسعة والأسعار بإصدار',body:{capacity:4,price_minor:18000,currency:'SAR',schedule:{open:'08:00',close:'24:00'}},result:'200 + ETag؛ الأسعار القديمة تبقى في الحجوزات القائمة'},
 {method:'POST',path:'/v1/resources/{id}/blocks',role:'PARTNER / MANAGER',description:'فتح صيانة أو حظر سلامة بفترة ودليل',body:{type:'MAINTENANCE',start:'2026-11-10T17:00:00Z',end:'2026-11-10T18:00:00Z',evidence_ref:'demo-maint-01'},result:'201 block؛ تصعيد الحجوزات المؤكدة المتأثرة'},
 {method:'GET',path:'/v1/rooms/{id}/venue-matches',role:'HOST / MEMBER',description:'مطابقة الرياضة والمكان والوقت والسعة والسياسات',body:null,result:'200 matches[] + exclusions[] + checked_at + availability_version؛ لا ضمان حجز'},
 {method:'POST',path:'/v1/bookings',role:'HOST',description:'طلب ربط غرفة بمورد ومن ثم بدء مسار القفل',body:{room_id:'demo-room-01',resource_id:'demo-court-a',start:'2026-11-10T17:00:00Z',end:'2026-11-10T18:00:00Z'},result:'201 REQUESTED + booking_id + version + quote'},
 {method:'POST',path:'/v1/bookings/{id}/hold',role:'HOST',description:'قفل ذري للفترة والمورد؛ مدة مقترحة 5 دقائق',body:{availability_version:1},result:'200 TEMPORARY_SLOT_HOLD + expires_at؛ lease داخلي لا يُكشف لعميل عام'},
 {method:'POST',path:'/internal/bookings/{id}/notification-ack',role:'SERVICE',description:'تثبيت إقرار استلام إشعار المنشأة',body:{event_id:'demo-event-01',provider_receipt:'demo-receipt-01'},result:'200 VENUE_NOTIFIED؛ TTL ثابت ولا تأكيد عند تعذر التسليم'},
 {method:'POST',path:'/v1/bookings/{id}/claim',role:'PARTNER / MANAGER',description:'استلام الطلب اختياريًا دون تأكيد أو تمديد المهلة',body:{},result:'200 CLAIMED'},
 {method:'POST',path:'/v1/bookings/{id}/payment-authorization',role:'HOST',description:'بدء تفويض في بيئة مزود معتمدة؛ لا بيانات بطاقة في SPORTIX',body:{payment_method_token:'demo-token'},result:'202 AUTHORIZATION_PENDING؛ النتيجة النهائية من webhook موثّق'},
 {method:'POST',path:'/v1/bookings/{id}/confirm',role:'PARTNER / MANAGER / AUTO SERVICE',description:'إعادة التحقق من القفل والتوافر والصيانة والسياسات والتفويض',body:{expected_price_version:1},result:'200 CONFIRMED؛ معاملة واحدة وتحويل allocation دون فجوة'},
 {method:'POST',path:'/v1/bookings/{id}/reject',role:'PARTNER / MANAGER',description:'رفض قبل التأكيد مع reason_code ودليل',body:{reason_code:'MAINTENANCE_OPEN',evidence_ref:'demo-maint-01'},result:'200 VALID_REJECT + payment_resolution=VOID_PENDING عند وجود تفويض'},
 {method:'POST',path:'/v1/bookings/{id}/cancel',role:'HOST / PARTNER / MANAGER',description:'إلغاء حسب نسخة السياسة المسجلة في الحجز',body:{reason_code:'HOST_CANCELLED',policy_version:'draft-1'},result:'200 CANCELLED + VOID_PENDING أو REFUND_PENDING؛ لا ادعاء اكتمال الاسترداد'},
 {method:'POST',path:'/webhooks/payments',role:'SIGNED PROVIDER',description:'توقيع + timestamp + dedup event_id + مطابقة مرجع الحجز',body:{event_id:'demo-provider-01',authorization_id:'demo-auth-01',status:'AUTHORIZED',amount_minor:18000,currency:'SAR'},result:'200 accepted؛ الأحداث المتأخرة لا تعيد حجزًا منتهيًا؛ فك التفويض خارج المعاملة'}
];
export const tasks=[
 {id:'SPRC-01',title:'تثبيت الهوية والأدوار وعزل المؤسسات',owner:'Backend / Security',phase:'P0',acceptance:'AC-17، AC-18، AC-19، AC-26 + فحص IDOR على الخادم',status:'مقترح'},
 {id:'SPRC-02',title:'تسجيل الشريك واعتماد الأهلية',owner:'Product / Backend',phase:'P0',acceptance:'مراجعة مستقلة؛ لا نشر قبل اعتماد المؤسسة والمنشأة',status:'مقترح'},
 {id:'SPRC-03',title:'الموارد والخدمات والأسعار والجداول',owner:'Partners Frontend',phase:'P0',acceptance:'موارد مستقلة، سعر snapshot، استثناءات صيانة مؤرخة',status:'مقترح'},
 {id:'SPRC-04',title:'قفل ذري للحجز ومنع التداخل',owner:'Backend / Database',phase:'P0',acceptance:'عميلان/عاملان و100 طلب على قاعدة حقيقية؛ ناجح واحد',status:'مقترح'},
 {id:'SPRC-05',title:'إشعارات مؤرخة مع إقرار استلام',owner:'Integrations',phase:'P1',acceptance:'Outbox، retries، عدم التكرار، انتهاء دون تأكيد',status:'مقترح'},
 {id:'SPRC-06',title:'تفويض الدفع والإلغاء والتعويض',owner:'Payments',phase:'P0',acceptance:'Sandbox webhook مكرر/متأخر؛ void/refund reconciled',status:'مقترح'},
 {id:'SPRC-07',title:'واجهة المطابقة داخل GO SPORTIX',owner:'Athlete Frontend',phase:'P1',acceptance:'رياضة/موقع/موعد/سعة + سبب الاستبعاد + تحديث حي',status:'مقترح'},
 {id:'SPRC-08',title:'فصل RoomState عن BookingState والتحقق الرياضي',owner:'Core Frontend',phase:'P0',acceptance:'حضور الغرفة لا يؤكد الملعب ولا يمنح verified أو نقاطًا',status:'مقترح'},
 {id:'SPRC-09',title:'اختبارات الصيانة والسلامة المتزامنة',owner:'QA / Operations',phase:'P0',acceptance:'تزامن فتح الحظر مع confirm على قاعدة فعلية',status:'مقترح'},
 {id:'SPRC-10',title:'مراجعة النموذج ثم ربط أدوات المتابعة',owner:'Founder / Product',phase:'P1',acceptance:'موافقة صريحة قبل النشر أو إنشاء مهام أو إرسال رسائل',status:'جاهز للمراجعة'}
];
export const integrations=[
 ['خادم المختبر / D1','API محفوظ ومعاملات مشروطة بالإصدار','اختبارات D1 محلية فعلية؛ أدوار المجال والدفع اصطناعية'],
 ['Railway','هوية الحساب متحققة؛ إنشاء المشروع محجوب لانتهاء التجربة','لم ينشأ مشروع؛ حزمة PostgreSQL معدة وغير منشورة'],
 ['Analytics Hub','وثائق REST الرسمية مقروءة','مشاركة بيانات تحليلية فقط؛ لا مشروع GCP أو ربط تشغيلي'],
 ['Linear','بحث قراءة فقط؛ لم تظهر نتائج SPORTIX','مهام SPRC-01…10 جاهزة محليًا؛ لم تُنشأ خارجيًا'],
 ['Slack','بحث القنوات العامة لم يُظهر نتائج SPORTIX','إشعار مهام/تشغيل مقترح؛ لا رسائل أو مسودات خارجية'],
 ['Notion','قُرئت صفحات GO / MARKET / CORE / BRAND','القرارات والهوية موثقة؛ توثيق نتيجة التنفيذ في CORE وMARKET'],
 ['GitHub','قُرئت ملفات rooms وgo-sportix','دليل وجود مكونات؛ الواجهة المنشورة داخل ATHLETE لم تتغير؛ حزمة مستقلة للمراجعة'],
 ['Figma','الاتصال متاح؛ لم يُحدد ملف التصميم','لا مطابقة pixel-level؛ الواجهة ترجمة جديدة للهوية الموثقة'],
 ['Google Drive','بحث SPORTIX دون نتائج','لا دليل إضافي على ملفات أو تكامل تشغيلي'],
 ['Outlook Calendar','بحث SPORTIX دون أحداث مطابقة','مزامنة تقويم مقترحة وغير مختبرة؛ ليس مصدر حجز'],
 ['SharePoint / OneDrive','ظهرت ملفات عامة عن SPORTIX','لم يُعتمد عرض استثماري بوصفه مواصفة حجز'],
 ['Payment provider','غير موصول وغير مختبر','كل المبالغ والتفويضات في النموذج اصطناعية']
];
export const productionTests=[
 ['DB-01','100 طلب عبر عمليتين مستقلتين','حجز حصري واحد وتعارضات متوقعة؛ إعادة الفحص على فترات متداخلة'],
 ['DB-02','تسابق تأكيد/انتهاء مهلة','قرار واحد عند الحد الزمني؛ لا تأكيد بعد expires_at ولا تحرير حجز مؤكد'],
 ['DB-03','تسابق صيانة/تأكيد','قفل المورد نفسه؛ لا تأكيد إذا سبق حظر الصيانة الالتزام'],
 ['SEC-01','تلاعب tenant وvenue وrole','403/404 ولا تسريب بيانات مؤسسة أخرى؛ اختبار session/JWT حقيقي'],
 ['PAY-01','Webhook مكرر أو متأخر أو مزور','رفض التوقيع الخطأ؛ dedup؛ فك تفويض الحجز المنتهي وتعويض فشل التحصيل'],
 ['OUT-01','فشل الإشعار أو انقطاع العامل','إعادة محاولات قابلة للتدقيق؛ بقاء القفل حتى الانتهاء فقط'],
 ['OPS-01','صيانة طارئة بعد CONFIRMED','تجميد الاستقبال، حالة حادث وتشغيل بديل/إلغاء؛ لا حذف صامت للحجز'],
 ['E2E-01','رحلة الشريك إلى الرياضي','أهلية معتمدة + API حقيقي + صلاحيات + دفع sandbox + استجابة واجهة']
];
