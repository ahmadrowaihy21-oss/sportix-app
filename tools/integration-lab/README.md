# SPORTIX — تجهيز أدوات التكامل

تاريخ التحقق: 2026-11-09. هذه مساحة تطوير منفصلة عن تطبيق SPORTIX، تستخدم بيانات اصطناعية فقط. لا تتصل بـ SAP أو متجر فعلي أو بوابة دفع.

## الحالة المثبتة

| الأداة | داخل ChatGPT | بيئة التطوير في الجلسة |
|---|---|---|
| GitHub | تم التحقق من اتصال الحساب `ahmadrowaihy21-oss` | تجهيز فرع `codex/integration-tools` |
| GitHub Actions | عبر مستودع GitHub؛ ليس اتصالًا منفصلًا | سير اختبار Postman مرفق؛ نجاحه على GitHub يتحدد من صفحة Actions |
| VS Code | لم تظهر إضافة مطابقة في البحث | ثُبت الإصدار 1.145.2 وتحقق تشغيل CLI؛ لم تُختبر الواجهة الرسومية |
| Postman | لم تظهر إضافة مطابقة في البحث | ثُبت Postman CLI 1.87.0؛ نجحت 4 طلبات و10 assertions محليًا؛ لم يُربط حساب Postman Cloud |
| n8n | لم تظهر إضافة مطابقة في البحث | ثُبت 2.46.7 وشُغل سير عمل محلي يقرأ health/catalog؛ لا توجد استضافة دائمة أو حساب n8n Cloud مربوط |
| SAP Integration Suite | لا يوجد اتصال متاح في هذه الجلسة | متوقف على حساب SAP BTP واشتراك Integration Suite والوصول إلى tenant |
| Google Secret Manager | لا يوجد اتصال متاح في هذه الجلسة | لم يُفعّل؛ لم يتوفر مشروع Google Cloud مصرح به، وCLI غير مثبت |
| Google Cloud Monitoring | لا يوجد اتصال متاح في هذه الجلسة | لم يُفعّل؛ لم تُنشأ مراقبة أو تنبيهات |

بحث دليل الأدوات لا يثبت عدم وجود المنتج لدى المزود؛ يصف فقط ما أمكن إيجاده في هذه الجلسة. تثبيت الأدوات في بيئة الجلسة لا يثبت تثبيتها على جهاز المستخدم، ولا يضمن بقاء خدماتها بعد انتهاء البيئة. ملفات الإعداد والاختبار محفوظة في هذا المستودع.

فحص إضافي: Swagger أعاد HTTP 401 ويحتاج إعادة ربط الحساب. محاولة فتح Google Cloud Console أعادت Site Unavailable؛ لا يثبت ذلك وجود مشكلة في حساب المستخدم.

## تشغيل المختبر

المتطلب: Node.js 24.x. افتح `sportix-integration.code-workspace` من جذر المستودع، أو نفذ داخل هذا المجلد:

```sh
npm ci
npm test
```

يشغل الاختبار خادمًا مؤقتًا على `127.0.0.1:4318`، وينفذ مجموعة Postman ثم يغلقه. يغطي صحة الخدمة، بيانات المنتجات الاصطناعية، المسار غير الموجود، ورفض الكتابة. لا يحتاج مفتاح Postman API. يمكن استيراد `postman.collection.json` في Postman؛ قاعدة API محلية وليست رابط معاينة عام.

للعمل التفاعلي يمكن تشغيل `npm start`. يتوفر أيضًا وصف الواجهة في `openapi.json`.

### اختبار n8n

```sh
npm install --prefix .runtime --no-save n8n@2.46.7
N8N_BIN="$PWD/.runtime/node_modules/.bin/n8n" npm run test:n8n
```

الأمر الأخير بصيغة POSIX shell. يستورد سير العمل في قاعدة مؤقتة ثم ينفذه ويتحقق من نتيجة التنفيذ والبيانات المسترجعة. يحذف القاعدة بعد انتهاء الاختبار. لا ينشر webhook ولا يفعّل تشغيلًا دوريًا. لا يحتوي سير العمل على credentials أو عقد Python. ظهر تحذير بأن Python task runner غير مجهز؛ لذلك لم يُختبر تشغيل Python داخل n8n.

التثبيت المحلي عبر npm مناسب لهذا الاختبار. يتطلب التشغيل الدائم اختيار استضافة، وتخزينًا دائمًا، وإعداد حساب المالك وHTTPS والنسخ الاحتياطية قبل الاستخدام الفعلي.

## إكمال الحسابات الخارجية

| الخدمة | المطلوب التالي | معيار إثبات التشغيل |
|---|---|---|
| SAP | رابط SAP BTP/Integration Suite tenant والوصول المصرح به؛ اختيار منتج SAP المراد ربطه | نشر وتشغيل iFlow تجريبي ضد sandbox مع سجل نتيجة |
| Secret Manager | Project ID واتصال Google Cloud مصادق عليه وتحديد موضع تخزين الأسرار | تفعيل API، ضبط صلاحية workload محددة، واختبار الوصول دون إظهار قيمة السر |
| Cloud Monitoring | المشروع نفسه، الخدمة المستهدفة وقناة التنبيه | ظهور قياسات فعلية واختبار تنبيه موثق |
| Postman Cloud | تسجيل الدخول إلى workspace المقصود | استيراد المجموعة وتشغيلها في مساحة العمل |
| n8n دائم | رابط instance قائم أو اختيار الاستضافة | دخول المالك وتنفيذ سير العمل بعد إعادة التشغيل |

لا ترسل كلمات مرور أو API keys في المحادثة أو GitHub. هذا المختبر لا يحتاجها.

بعد إتاحة Google Cloud CLI والوصول المصرح به، يوفر الأمر التالي فحصًا للقراءة فقط:

```sh
npm run cloud:check -- YOUR_PROJECT_ID
```

يفحص تفعيل `secretmanager.googleapis.com` و`monitoring.googleapis.com` دون إنشاء موارد أو قراءة أسرار. لا يكفي تفعيل API وحده لإثبات صلاحيات IAM أو إعداد التنبيهات أو توطين البيانات. في هذه الجلسة أعاد الفحص exit 2 لأن Google Cloud CLI غير مثبت.

## حدود GitHub Actions

الملف `.github/workflows/integration-tools.yml` يشغل مجموعة Postman على بيانات اصطناعية، بصلاحية قراءة المستودع فقط. لا ينشر تطبيق SPORTIX ولا يتصل بالحسابات الإنتاجية. اختبار n8n منفذ محليًا، وليس ضمن هذا السير. نتيجة هذا المختبر لا تمثل نتيجة اختبارات التطبيق الكامل.

## مصادر الإعداد

- [VS Code CLI](https://code.visualstudio.com/docs/configure/command-line)
- [Postman CLI installation](https://learning.postman.com/docs/postman-cli/postman-cli-installation/)
- [Postman local and cloud configuration](https://learning.postman.com/docs/postman-cli/postman-cli-authenticate-and-configure)
- [n8n npm installation](https://docs.n8n.io/hosting/installation/npm/)
- [SAP Integration Suite](https://help.sap.com/docs/SAP_INTEGRATION_SUITE)
- [Secret Manager API setup](https://docs.cloud.google.com/secret-manager/docs/configuring-secret-manager)
- [Monitoring API setup](https://docs.cloud.google.com/monitoring/api/enable-api)

هذا العمل يثبت تجهيز أدوات واختبارًا محليًا فقط؛ لا يمثل تدقيقًا لامتثال سدايا أو اعتمادًا لموقع معالجة بيانات SPORTIX.
