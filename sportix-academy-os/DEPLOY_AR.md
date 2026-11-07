# نشر SPORTIX ACADEMY OS على Netlify

**مشروع Netlify الجاهز:** `sportix-academy-os`

**لوحة المشروع:** https://app.netlify.com/projects/sportix-academy-os

## النشر

1. استخرج ملفات ZIP بالكامل في مجلد مشروع، ثم ارفعها إلى مستودع Git خاص مستقل على GitHub. **لا ترفع ZIP نفسه كصفحة ثابتة على Netlify Drop**؛ هذا المشروع يحتاج Build وFunctions وDatabase.
2. في Netlify افتح المشروع أعلاه، ثم **Project configuration → Build & deploy → Repository → Link repository**، واختر مستودع الأكاديمية الجديد.
3. البناء مضبوط داخل `netlify.toml` على `npm run build`، ومجلد النشر `dist`. بعد ربط المستودع سيتم بناء الموقع وتفعيل وظائف API وتطبيق migration قاعدة البيانات بحسب أهلية الحساب.
4. فعّل **Netlify Identity** من `https://app.netlify.com/projects/sportix-academy-os/identity`، والأفضل إعداد **Invite only** ثم دعوة الإدارة الفنية للاختبار. تسجيل الدخول لا يعمل قبل تفعيل Identity.
5. تأكد من تفعيل Netlify Database وتطبيق migration، وتحقق من `https://sportix-academy-os.netlify.app/api/_healthcheck` بعد النشر.
6. فعّل Netlify AI Gateway، وتحقق من اسم الموديل المدعوم ضمن الإعداد `SPORTIX_AI_MODEL` عندما يلزم؛ توليد التقارير يحتاج سجلات صالحة وحسابًا مسجلًا وتكلفة استخدام.

## ملاحظات

- **الدومين `acpf.sportixpartners.com`** مرتبط ببورتفوليو SPORTIX ACADEMY السابق على مشروع Netlify مختلف؛ لم نغيره.
- حسابات AppDeploy وبياناتها **لم تُنقل** إلى قاعدة Netlify؛ يتطلب نقلها تفويضًا وخطة ترحيل مستقلة.
- لا تدخل بيانات شخصية أو فيديوهات حقيقية لقاصرين قبل استكمال أدوار الموظفين والموافقات وحماية البيانات وتقييم استضافة البيانات في السعودية.
- إن ظهر `404` أو صفحة Netlify افتراضية قبل أول نشر، فالموقع **غير منشور بعد**.
- عند تشغيل Netlify Identity، حساب التسجيل يخص Netlify الجديد ولا يفتح حساب AppDeploy السابق تلقائيًا.
