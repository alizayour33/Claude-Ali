# منهاج — منصة تعليمية للمناهج الشرعية

تطبيق ويب يعمل على الجوال والحاسب (واجهة عربية RTL، مهيّأ للتثبيت كتطبيق PWA) لإدارة مناهج
**القرآن، الفقه، العقيدة، السيرة، الأخلاق** مقسّمة **حسب السنوات والأعمار**، مع **٣٠٠ ساعة لكل سنة**
موزّعة تلقائياً على المواد، ودعم رفع كل أنواع المحتوى: ملفات أوفيس، PDF، فيديو، صوت، صور،
حزم SCORM التفاعلية، نصوص، وصفحات HTML.

---

## الفكرة في سطور

| المستوى | الوصف |
| --- | --- |
| **المستوى / السنة** | مرتبط بفئة عمرية (مثلاً عمر ٨ سنوات)، وله مجموع ساعات (٣٠٠ افتراضياً) ومدة الحصة (٦٠ دقيقة) |
| **المادة** | قرآن / فقه / عقيدة / سيرة / أخلاق (قابلة للإضافة والحذف)، ولكل مادة **نسبة** من مجموع الساعات |
| **الحصة** | ساعة تدريسية واحدة لها عنوان وأهداف وخطة، وترتيب داخل المادة وترتيب عام داخل السنة |
| **المرفق** | محتوى الحصة: PDF، فيديو، صوت، صورة، ملف أوفيس، حزمة SCORM، نص، HTML، أو رابط خارجي |

**التوزيع التلقائي:** عدد الحصص = (مجموع الساعات × ٦٠) ÷ مدة الحصة. تُوزَّع على المواد بطريقة
«أكبر الباقي» حسب النِسب، ثم تُرتَّب الحصص بالتبادل بين المواد حتى لا تتكدّس مادة واحدة في بداية السنة.
مثال (٣٠٠ ساعة، حصة ٦٠ دقيقة، أعمار ٦–٩): قرآن ١٣٥، عقيدة ٤٥، سيرة ٤٥، أخلاق ٤٥، فقه ٣٠ = ٣٠٠ حصة.

النِسب الافتراضية تتغيّر مع العمر: القرآن والأخلاق أكثر في الصغر، والفقه والعقيدة أكثر في الكبر
(انظر `sharesForAge` في `server/seed.js`).

---

## التشغيل

```bash
npm install
npm start           # http://localhost:3000
```

**لا يحتاج المشروع أي مترجم أو أدوات بناء.** قاعدة البيانات تعمل عبر `node:sqlite` المدمجة في
نود ٢٢٫٥ أو أحدث. وإن كانت حزمة `better-sqlite3` (اختيارية) مثبّتة ومبنية بنجاح فسيستخدمها
تلقائياً؛ وإن فشل بناؤها فلا يتوقّف التثبيت ولا التشغيل. السطر المطبوع عند الإقلاع يوضّح المحرّك
المستخدم، ويمكن إجباره بـ`MANHAJ_SQLITE_DRIVER=node` أو `=better`.

### على ويندوز (PowerShell)

```powershell
npm.cmd install     # npm.cmd تتجاوز منع تشغيل السكربتات في PowerShell
npm.cmd start
```

إن ظهرت رسالة `running scripts is disabled on this system` فاستخدم `npm.cmd` كما أعلاه،
أو نفّذ الأوامر في Command Prompt، أو اسمح بالسكربتات لمستخدمك:
`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

عند أول تشغيل تُنشأ قاعدة البيانات وتُهيَّأ ١٢ مستوى (أعمار ٦ إلى ١٧) بـ**٣٦٠٠ حصة**، مع أمثلة محتوى
في المستوى الأول، وحسابان:

| الحساب | المستخدم | كلمة المرور | الصفة |
| --- | --- | --- | --- |
| المشرف | `admin` | `admin12345` | إدارة كاملة |
| طالب تجريبي | `student` | `student123` | تصفّح وتقدّم |

> **غيّر كلمة مرور المشرف قبل النشر** — أو مرّر `ADMIN_PASSWORD` قبل أول تشغيل.

### أوامر أخرى

```bash
npm run dev     # تشغيل مع إعادة التحميل عند تغيير الملفات
npm test        # ١٥ اختباراً للـ API على قاعدة بيانات مؤقتة
npm run seed    # تهيئة البيانات الأوّلية إن كانت القاعدة فارغة
npm run reset   # حذف كل المناهج ثم إعادة التهيئة (لا يحذف المستخدمين)
```

### متغيّرات البيئة

| المتغيّر | الافتراضي | الوظيفة |
| --- | --- | --- |
| `PORT` | `3000` | منفذ الخدمة |
| `DATA_DIR` | `./data` | مجلد قاعدة البيانات والملفات المرفوعة |
| `MAX_UPLOAD_MB` | `1024` | أقصى حجم للملف الواحد |
| `ADMIN_USER` / `ADMIN_PASSWORD` / `ADMIN_NAME` | `admin` / `admin12345` | حساب المشرف الأول |
| `COOKIE_SECURE` | `0` | اجعله `1` عند العمل خلف HTTPS |
| `NO_DEMO_STUDENT` | `0` | `1` لمنع إنشاء الحساب التجريبي |
| `MANHAJ_SQLITE_DRIVER` | `auto` | `node` لإجبار sqlite المدمجة، `better` لإجبار better-sqlite3 |

---

## الأدوار

- **مشرف (admin):** كل شيء + إدارة المستخدمين والصفات.
- **معلم (teacher):** إنشاء وتعديل المستويات والمواد والحصص والمرفقات، ورؤية تقارير الطلاب.
- **طالب (student):** تصفّح المنشور فقط، تعليم الحصص كمنجزة، حفظ نتائج أنشطة SCORM، لوحة تقدّم شخصية.

الزائر بدون حساب يستطيع التصفّح والاطّلاع على المرفقات المنشورة، لكن التقدّم لا يُحفظ.

---

## أنواع المرفقات وكيف تُعرض

| النوع | الصيغ | طريقة العرض على الجوال |
| --- | --- | --- |
| PDF | `.pdf` | عرض داخل الصفحة + فتح في تبويب + تنزيل |
| فيديو | `.mp4 .webm .mov .m4v .mkv` | مشغّل داخلي `playsinline` مع دعم Range (تقديم/ترجيع) |
| صوت | `.mp3 .m4a .wav .ogg .opus .aac` | مشغّل صوتي |
| صور | `.png .jpg .webp .gif .svg .avif` | معاينة + تكبير |
| أوفيس | `.docx .xlsx .pptx .doc .xls .ppt .odt .ods .odp .rtf .csv` | بطاقة ملف مع تنزيل (تُفتح بتطبيق أوفيس على الجوال) |
| SCORM | `.zip` (SCORM 1.2 و2004) | تشغيل داخلي مع حفظ الحالة والدرجة، أو ملء الشاشة |
| نص | يُكتب مباشرة | عرض منسّق يحافظ على الأسطر |
| HTML | يُكتب مباشرة أو `.html` | المكتوب يُنقّى ويُعرض؛ الملف يُعرض داخل `iframe` معزول |
| رابط | أي `http(s)` | روابط يوتيوب/فيميو تُضمَّن تلقائياً، وغيرها كزر فتح |

يمكن رفع حتى **٢٠ ملفاً في المرة**، ويُكتشف النوع من الامتداد تلقائياً (مع إمكانية تحديده يدوياً).

### دعم SCORM

- يُستخرج ملف ZIP، ويُقرأ `imsmanifest.xml` لتحديد نقطة الانطلاق (مع دعم `xml:base` والمؤسّسة
  الافتراضية)، وإن لم يوجد مانيفست يُبحث عن `index.html` / `story.html` وغيرها.
- مسارات الملفات داخل الحزمة محميّة من الخروج عن المجلد (`../`).
- المشغّل (`/scorm/play?resource=ID`) يوفّر واجهة **SCORM 1.2** (`window.API`) و**SCORM 2004**
  (`window.API_1484_11`): `Initialize/LMSInitialize`، `GetValue`، `SetValue`، `Commit`، `Terminate`.
- تُحفظ لكل طالب: الحالة (`lesson_status`)، الدرجة، `suspend_data` (لمتابعة النشاط من حيث توقّف)،
  الموقع، والوقت الكلي. وعند `completed` أو `passed` تُعلَّم الحصة كمنجزة تلقائياً.
- الحزمة الأصلية تبقى قابلة للتنزيل للمعلم.

---

## بنية المشروع

```
server/
  index.js        تهيئة Express والمسارات ومعالجة الأخطاء
  db.js           SQLite: اختيار المحرّك (node:sqlite أو better-sqlite3) والمخطط والمجلدات
  auth.js         تشفير كلمات المرور (scrypt) وجلسات الكوكيز والصلاحيات
  curriculum.js   توزيع الساعات على المواد وتوليد الجداول وإحصاءات السنة
  seed.js         البيانات الأوّلية (١٢ مستوى + أمثلة محتوى)
  util.js         بثّ الملفات مع Range، اكتشاف الأنواع، قراءة مانيفست SCORM
  routes/         auth.js · curriculum.js · resources.js · progress.js
public/
  index.html      هيكل التطبيق
  css/app.css     نظام تصميم للجوال أولاً + وضع ليلي
  js/             وحدات ES: router · api · store · dom + views/
  scorm/player.html   مشغّل SCORM مع واجهة LMS
  sw.js, manifest.webmanifest, icon.svg   ملفات PWA
tests/api.test.js  اختبارات API (node:test)
data/              قاعدة البيانات والملفات المرفوعة (غير مُتعقَّبة في git)
```

## واجهة الـ API (مختصر)

| الطريقة | المسار | الوصف |
| --- | --- | --- |
| `POST` | `/api/auth/login` · `/register` · `/logout` | الجلسات |
| `GET` | `/api/auth/me` · `PATCH /api/auth/me` | الحساب الحالي |
| `GET/POST/PATCH/DELETE` | `/api/auth/users[/:id]` | إدارة المستخدمين (مشرف) |
| `GET` | `/api/years?age=8` | المستويات (مصفّاة بالعمر) |
| `GET` | `/api/years/:id` | تفاصيل مستوى مع المواد والإحصاءات |
| `POST` | `/api/years/:id/generate` | توليد/إكمال جدول الحصص |
| `GET` | `/api/years/:id/sessions?subject_id=&q=&limit=&offset=` | الحصص مع ترقيم صفحات |
| `GET/PATCH/DELETE` | `/api/sessions/:id` | حصة واحدة ومرفقاتها |
| `POST` | `/api/sessions/:id/resources` | رفع ملفات (multipart) أو إضافة نص/HTML/رابط |
| `GET` | `/api/resources/:id/file[?download=1]` | بثّ الملف (يدعم Range) |
| `GET` | `/api/scorm/:id/content/*` · `/meta` · `POST /tracking` | محتوى SCORM وحالته |
| `POST/DELETE` | `/api/progress/:sessionId` | تعليم الإنجاز أو إلغاؤه |
| `GET` | `/api/me/progress` · `/api/reports/students[/:id]` | لوحة الطالب وتقارير المعلم |

## الأمان

- كلمات المرور بـ`scrypt` وملح عشوائي؛ الجلسات بكوكي `httpOnly` + `sameSite=lax` (٣٠ يوماً).
- المحتوى غير المنشور (سنة أو حصة) محجوب عن الطلاب والزوار، ويشمل ذلك ملفات المرفقات نفسها.
- منع الخروج عن المجلدات في مسارات الملفات وحزم SCORM.
- تنقية HTML الذي يكتبه المعلم قبل عرضه (إزالة `script` و`on*` و`javascript:`).
- الملفات المرفوعة تُخزَّن خارج المسارات الثابتة وتُخدَم عبر مسار يتحقّق من الصلاحية.

## ملاحظات للنشر

- ضع التطبيق خلف Nginx/Caddy مع HTTPS، واضبط `COOKIE_SECURE=1`، وارفع `client_max_body_size`
  ليتوافق مع `MAX_UPLOAD_MB`.
- النسخ الاحتياطي = مجلد `data/` بالكامل (قاعدة البيانات + المرفقات + حزم SCORM).
- خدمة الـ Service Worker تُسجَّل على HTTPS فقط، وتخزّن هيكل الواجهة دون بيانات الـ API.

---

## English summary

**Manhaj** is a mobile-first, RTL Arabic learning platform for Islamic-studies curricula.
Levels are keyed to a learner's age; each level holds **300 hours** distributed across
Quran, Fiqh, Aqeedah, Seerah and Akhlaq by configurable percentages, auto-generating one
session per teaching hour and interleaving subjects across the year. Every session accepts
any mix of PDF, Office documents, video, audio, images, interactive **SCORM 1.2/2004**
packages, rich text, HTML and external links (YouTube/Vimeo auto-embed). Student progress,
time-on-task and SCORM scores are tracked per user; staff get per-student reports.

Stack: Node.js + Express + SQLite, no frontend build step (plain ES modules), installable
as a PWA. **No native compilation required**: it uses the built-in `node:sqlite` module
(Node 22.5+), falling back to it automatically when the optional `better-sqlite3` package
isn't built. Run `npm install && npm start` (on Windows PowerShell: `npm.cmd install`),
then sign in as `admin` / `admin12345`. Tests: `npm test` — the suite runs green on both
drivers.
