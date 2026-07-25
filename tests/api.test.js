'use strict';

// اختبارات تشغيلية للـ API: تعمل على قاعدة بيانات مؤقتة معزولة
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const AdmZip = require('adm-zip');

const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'manhaj-test-'));
process.env.DATA_DIR = DATA_DIR;
process.env.NO_DEMO_STUDENT = '1';
process.env.ADMIN_PASSWORD = 'test-admin-pass';

const app = require('../server/index');
const { ensureSeed } = require('../server/seed');

let base;
let server;
const cookies = { admin: '', student: '' };

/** طلب بسيط يحمل كوكي الجلسة ويعيد الحالة والجسم. */
async function call(method, urlPath, { body, form, as } = {}) {
  const headers = {};
  if (as && cookies[as]) headers.cookie = cookies[as];
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${base}${urlPath}`, { method, headers, body: payload, redirect: 'manual' });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, json, text, headers: res.headers, setCookie };
}

function rememberCookie(role, setCookie) {
  const found = setCookie.find((c) => c.startsWith('manhaj_sid='));
  if (found) cookies[role] = found.split(';')[0];
}

test.before(async () => {
  ensureSeed();
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => {
  server?.close();
  fs.rmSync(DATA_DIR, { recursive: true, force: true });
});

test('التهيئة تنشئ ١٤ صفاً من الروضة الأولى إلى الثاني عشر بـ٣٠٠ حصة لكل صف', async () => {
  const health = await call('GET', '/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.json.years, 14);
  assert.equal(health.json.sessions, 4200);

  const years = await call('GET', '/api/years');
  assert.equal(years.json.years.length, 14);
  for (const year of years.json.years) {
    assert.equal(year.session_count, 300, `${year.title} يجب أن يحتوي ٣٠٠ حصة`);
    assert.equal(year.total_hours, 300);
  }

  // الترتيب: الروضة الأولى ثم الثانية ثم الصفوف من الأول إلى الثاني عشر
  const titles = years.json.years.map((y) => y.title);
  assert.equal(titles[0], 'الروضة الأولى');
  assert.equal(titles[1], 'الروضة الثانية');
  assert.equal(titles[2], 'الصف الأول');
  assert.equal(titles[13], 'الصف الثاني عشر');
  assert.deepEqual(years.json.years.map((y) => y.grade), [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test('كل صف مربوط بمرحلته الدراسية', async () => {
  const { json } = await call('GET', '/api/years');
  const stageOf = (title) => json.years.find((y) => y.title === title).stage;
  assert.equal(stageOf('الروضة الأولى'), 'kindergarten');
  assert.equal(stageOf('الصف الأول'), 'primary');
  assert.equal(stageOf('الصف السادس'), 'primary');
  assert.equal(stageOf('الصف السابع'), 'middle');
  assert.equal(stageOf('الصف التاسع'), 'middle');
  assert.equal(stageOf('الصف العاشر'), 'secondary');
  assert.equal(stageOf('الصف الثاني عشر'), 'secondary');
  assert.equal(json.years.find((y) => y.title === 'الصف الأول').stage_name, 'المرحلة الابتدائية');

  const middle = await call('GET', '/api/years?stage=middle');
  assert.equal(middle.json.years.length, 3);
});

test('التصفية بالعمر تُرجع الصف المناسب فقط', async () => {
  const res = await call('GET', '/api/years?age=8');
  assert.equal(res.status, 200);
  assert.equal(res.json.years.length, 1);
  assert.equal(res.json.years[0].title, 'الصف الثالث');

  const kg = await call('GET', '/api/years?age=4');
  assert.equal(kg.json.years[0].title, 'الروضة الأولى');
});

test('المواد الخمس موجودة ومجموع نِسبها ١٠٠٪ ومجموع حصصها ٣٠٠', async () => {
  const { json } = await call('GET', '/api/years/1');
  const names = json.year.subjects.map((s) => s.name);
  assert.deepEqual(names, ['قرآن', 'فقه', 'عقيدة', 'سيرة', 'أخلاق']);
  assert.equal(json.year.subjects.reduce((sum, s) => sum + s.share, 0), 100);
  assert.equal(json.year.subjects.reduce((sum, s) => sum + s.session_count, 0), 300);
});

test('تسجيل الدخول كمشرف وإنشاء حساب طالب', async () => {
  const login = await call('POST', '/api/auth/login', {
    body: { username: 'admin', password: 'test-admin-pass' },
  });
  assert.equal(login.status, 200);
  assert.equal(login.json.user.role, 'admin');
  rememberCookie('admin', login.setCookie);

  const register = await call('POST', '/api/auth/register', {
    body: { username: 'tester', password: 'tester123', full_name: 'طالب اختبار', age: 8 },
  });
  assert.equal(register.status, 201);
  assert.ok(register.json.user.year_id, 'يجب ربط الطالب بصفّه تلقائياً');
  rememberCookie('student', register.setCookie);
});

test('الطالب لا يملك صلاحية تعديل المناهج', async () => {
  const res = await call('POST', '/api/years', { as: 'student', body: { title: 'صف غير مسموح' } });
  assert.equal(res.status, 403);
});

test('إنشاء صف برقم الصف يملأ العنوان والمرحلة والعمر والنِسب تلقائياً', async () => {
  // نحذف الصف الثاني عشر ثم نعيد إنشاءه برقمه فقط
  const before = await call('GET', '/api/years', { as: 'admin' });
  const target = before.json.years.find((y) => y.grade === 12);
  await call('DELETE', `/api/years/${target.id}`, { as: 'admin' });

  const res = await call('POST', '/api/years', { as: 'admin', body: { grade: 12 } });
  assert.equal(res.status, 201);
  assert.equal(res.json.year.title, 'الصف الثاني عشر');
  assert.equal(res.json.year.stage, 'secondary');
  assert.equal(res.json.year.age_min, 17);
  assert.equal(res.json.year.totals.sessions, 300);

  // نِسب المرحلة الثانوية: الفقه أعلى منه في الروضة
  const fiqh = res.json.year.subjects.find((s) => s.key === 'fiqh');
  assert.equal(fiqh.share, 25);
});

test('إنشاء صف جديد يولّد الحصص حسب النِسب ومدة الحصة', async () => {
  const res = await call('POST', '/api/years', {
    as: 'admin',
    body: { title: 'صف اختباري', age_min: 19, age_max: 20, total_hours: 100, session_minutes: 50 },
  });
  assert.equal(res.status, 201);
  // ١٠٠ ساعة × ٦٠ ÷ ٥٠ دقيقة = ١٢٠ حصة
  assert.equal(res.json.year.planned_sessions, 120);
  assert.equal(res.json.year.totals.sessions, 120);

  const again = await call('POST', `/api/years/${res.json.year.id}/generate`, { as: 'admin', body: {} });
  assert.equal(again.json.schedule.created, 0, 'إعادة التوليد لا تضيف حصصاً مكرّرة');
  assert.equal(again.json.schedule.total, 120);
});

test('التوليد لا يحذف حصة تحتوي مرفقات', async () => {
  const created = await call('POST', '/api/years', {
    as: 'admin',
    body: { title: 'صف الحماية', age_min: 21, age_max: 21, total_hours: 10, session_minutes: 60 },
  });
  const yearId = created.json.year.id;
  // نأخذ آخر حصة في مادة القرآن، وهي أكبر مادة ومن المؤكّد أن تقليص الساعات سيمسّها
  const quranId = created.json.year.subjects[0].id;
  const list = await call('GET', `/api/years/${yearId}/sessions?subject_id=${quranId}`, { as: 'admin' });
  const last = list.json.sessions[list.json.sessions.length - 1];

  const added = await call('POST', `/api/sessions/${last.id}/resources`, {
    as: 'admin',
    body: { kind: 'text', title: 'ملاحظة', text_content: 'محتوى' },
  });
  assert.equal(added.status, 201);

  // تقليص الساعات إلى ساعتين: الحذف يقع على الحصص الفارغة فقط
  await call('PATCH', `/api/years/${yearId}`, { as: 'admin', body: { total_hours: 2 } });
  const regen = await call('POST', `/api/years/${yearId}/generate`, { as: 'admin', body: {} });
  assert.equal(regen.json.schedule.total, 2);
  assert.ok(regen.json.schedule.deleted > 0);

  const survived = await call('GET', `/api/sessions/${last.id}`, { as: 'admin' });
  assert.equal(survived.status, 200, 'الحصة التي تحتوي مرفقاً يجب أن تبقى');
  assert.equal(survived.json.resources.length, 1);
});

test('ترقيم صفحات الحصص يعمل', async () => {
  const res = await call('GET', '/api/years/1/sessions?limit=10&offset=20', { as: 'student' });
  assert.equal(res.json.total, 300);
  assert.equal(res.json.sessions.length, 10);
  assert.equal(res.json.offset, 20);
});

test('رفع ملفات بأنواع مختلفة يكتشف النوع تلقائياً', async () => {
  const form = new FormData();
  form.append('files', new Blob([Buffer.from('%PDF-1.4 test')], { type: 'application/pdf' }), 'درس.pdf');
  form.append('files', new Blob([Buffer.from('fake-mp4')], { type: 'video/mp4' }), 'شرح.mp4');
  form.append('files', new Blob([Buffer.from('fake-mp3')]), 'تلاوة.mp3');
  form.append('files', new Blob([Buffer.from('fake-docx')]), 'خطة.docx');
  form.append('files', new Blob([Buffer.from('<p>مرحبا</p>')]), 'صفحة.html');

  const res = await call('POST', '/api/sessions/1/resources', { as: 'admin', form });
  assert.equal(res.status, 201);
  assert.deepEqual(res.json.resources.map((r) => r.kind), ['pdf', 'video', 'audio', 'office', 'html']);
  assert.equal(res.json.resources[0].file_name, 'درس.pdf', 'يجب حفظ اسم الملف العربي كما هو');

  const pdf = res.json.resources[0];
  const file = await call('GET', pdf.url, { as: 'student' });
  assert.equal(file.status, 200);
  assert.match(file.headers.get('content-type'), /application\/pdf/);
  assert.equal(file.headers.get('accept-ranges'), 'bytes');

  // طلب جزئي (Range) للتقديم في الفيديو
  const video = res.json.resources[1];
  const partial = await fetch(`${base}${video.url}`, { headers: { range: 'bytes=0-3', cookie: cookies.student } });
  assert.equal(partial.status, 206);
  assert.equal(partial.headers.get('content-range'), 'bytes 0-3/8');
});

test('حزمة SCORM تُستخرج ويُكتشف ملف انطلاقها ويُحفظ تقدّم الطالب', async () => {
  const zip = new AdmZip();
  zip.addFile('imsmanifest.xml', Buffer.from(`<?xml version="1.0"?>
    <manifest identifier="M1" version="1.2">
      <organizations default="ORG"><organization identifier="ORG">
        <item identifier="I1" identifierref="R1"><title>نشاط</title></item>
      </organization></organizations>
      <resources><resource identifier="R1" type="webcontent" href="sco/launch.html"/></resources>
    </manifest>`, 'utf8'));
  zip.addFile('sco/launch.html', Buffer.from('<html><body>نشاط تفاعلي</body></html>', 'utf8'));
  zip.addFile('../خارج-الحزمة.txt', Buffer.from('يجب تجاهل هذا المسار', 'utf8'));

  const form = new FormData();
  form.append('files', new Blob([zip.toBuffer()], { type: 'application/zip' }), 'نشاط.zip');
  form.append('title', 'نشاط تفاعلي');

  const res = await call('POST', '/api/sessions/2/resources', { as: 'admin', form });
  assert.equal(res.status, 201);
  const resource = res.json.resources[0];
  assert.equal(resource.kind, 'scorm');
  assert.equal(resource.launch_path, 'sco/launch.html');

  const content = await call('GET', resource.scorm_url, { as: 'student' });
  assert.equal(content.status, 200);
  assert.match(content.text, /نشاط تفاعلي/);

  // منع الخروج من مجلد الحزمة
  const escape = await call('GET', `/api/scorm/${resource.id}/content/%2e%2e%2f%2e%2e%2fmanhaj.db`, { as: 'student' });
  assert.equal(escape.status, 404);

  // تنزيل الحزمة الأصلية متاح للمعلم
  const archive = await call('GET', `${resource.url}?download=1`, { as: 'admin' });
  assert.equal(archive.status, 200);

  // حفظ نتيجة النشاط يعلّم الحصة كمنجزة تلقائياً
  const commit = await call('POST', `/api/scorm/${resource.id}/tracking`, {
    as: 'student',
    body: { lesson_status: 'passed', score_raw: '85', suspend_data: 'p=3', total_time: '0000:10:00' },
  });
  assert.equal(commit.status, 200);
  assert.equal(commit.json.tracking.lesson_status, 'passed');
  assert.equal(commit.json.tracking.score_raw, 85);

  const session = await call('GET', '/api/sessions/2', { as: 'student' });
  assert.equal(session.json.session.progress_status, 'completed');
});

test('تعليم الحصة منجزة ثم قراءة لوحة التقدّم', async () => {
  const mark = await call('POST', '/api/progress/1', { as: 'student', body: { status: 'completed' } });
  assert.equal(mark.status, 200);
  assert.equal(mark.json.progress.status, 'completed');

  // تسجيل وقت اطّلاع لا يلغي الإنجاز
  await call('POST', '/api/progress/1', { as: 'student', body: { status: 'in_progress', seconds: 120 } });
  const after = await call('GET', '/api/sessions/1', { as: 'student' });
  assert.equal(after.json.session.progress_status, 'completed');

  const progress = await call('GET', '/api/me/progress', { as: 'student' });
  assert.ok(progress.json.totals.completed >= 2);
  assert.ok(progress.json.subjects.length >= 5);
  assert.ok(progress.json.next, 'يجب اقتراح الحصة التالية');
});

test('المحتوى غير المنشور محجوب عن الطلاب ومتاح للمشرف', async () => {
  await call('PATCH', '/api/sessions/3', { as: 'admin', body: { is_published: false } });
  const asStudent = await call('GET', '/api/sessions/3', { as: 'student' });
  assert.equal(asStudent.status, 404);
  const asAdmin = await call('GET', '/api/sessions/3', { as: 'admin' });
  assert.equal(asAdmin.status, 200);
  await call('PATCH', '/api/sessions/3', { as: 'admin', body: { is_published: true } });
});

test('البحث يجد الحصص حسب العنوان والأهداف والمرفقات', async () => {
  const res = await call('GET', '/api/search?q=الفاتحة', { as: 'student' });
  assert.equal(res.status, 200);
  assert.ok(res.json.sessions.length >= 1);
});

test('تقارير الطلاب متاحة للمشرف فقط', async () => {
  const denied = await call('GET', '/api/reports/students', { as: 'student' });
  assert.equal(denied.status, 403);
  const allowed = await call('GET', '/api/reports/students', { as: 'admin' });
  assert.equal(allowed.status, 200);
  assert.ok(allowed.json.students.some((s) => s.username === 'tester'));
});

test('حذف مرفق يحذف ملفه من القرص', async () => {
  const form = new FormData();
  form.append('files', new Blob([Buffer.from('صورة')]), 'لوحة.png');
  const created = await call('POST', '/api/sessions/4/resources', { as: 'admin', form });
  const resource = created.json.resources[0];
  assert.ok(fs.existsSync(path.join(DATA_DIR, 'uploads', String(resource.id))));

  const removed = await call('DELETE', `/api/resources/${resource.id}`, { as: 'admin' });
  assert.equal(removed.status, 200);
  assert.equal(fs.existsSync(path.join(DATA_DIR, 'uploads', String(resource.id))), false);
  const gone = await call('GET', `/api/resources/${resource.id}/file`, { as: 'admin' });
  assert.equal(gone.status, 404);
});

test('الترحيل يحوّل قاعدة قديمة إلى صفوف دون فقد محتوى', async () => {
  const { db } = require('../server/db');
  const { migrateToGrades } = require('../server/seed');

  // نحاكي صفاً قديماً بعنوان آلي وبدون رقم صف، وفيه حصة تحمل مرفقاً
  const info = db
    .prepare(
      `INSERT INTO years (title, grade, stage, age_min, age_max, total_hours, session_minutes, order_index)
       VALUES ('المستوى القديم', NULL, '', 13, 13, 10, 60, 50)`
    )
    .run();
  const yearId = Number(info.lastInsertRowid);
  const subject = db
    .prepare(`INSERT INTO subjects (year_id, key, name, share, order_index) VALUES (?, 'quran', 'قرآن', 100, 0)`)
    .run(yearId);
  const session = db
    .prepare(
      `INSERT INTO class_sessions (year_id, subject_id, seq, global_seq, title) VALUES (?, ?, 1, 1, 'حصة قديمة')`
    )
    .run(yearId, Number(subject.lastInsertRowid));
  db.prepare(
    `INSERT INTO resources (session_id, kind, title, text_content) VALUES (?, 'text', 'مرفق قديم', 'محتوى')`
  ).run(Number(session.lastInsertRowid));

  db.prepare("DELETE FROM app_meta WHERE key = 'grades_v2'").run();
  migrateToGrades();

  const migrated = db.prepare('SELECT * FROM years WHERE id = ?').get(yearId);
  assert.equal(migrated.grade, 8, 'عمر ١٣ يقابل الصف الثامن');
  assert.equal(migrated.stage, 'middle');
  assert.equal(migrated.title, 'الصف الثامن', 'العنوان الآلي القديم يُستبدل باسم الصف');

  const kept = db
    .prepare('SELECT COUNT(*) AS c FROM resources WHERE session_id = ?')
    .get(Number(session.lastInsertRowid)).c;
  assert.equal(kept, 1, 'المرفقات لا تُفقد أثناء الترحيل');
});
