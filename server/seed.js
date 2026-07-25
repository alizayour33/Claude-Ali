'use strict';

const { db, meta } = require('./db');
const { hashPassword } = require('./auth');
const {
  DEFAULT_SUBJECTS,
  GRADE_LEVELS,
  generateYearSchedule,
  gradeTitle,
  gradeForAge,
  orderForGrade,
  sharesForGrade,
  stageOfGrade,
} = require('./curriculum');

const insertYear = () =>
  db.prepare(
    `INSERT INTO years (title, grade, stage, age_min, age_max, description, total_hours, session_minutes, order_index, is_published)
     VALUES (?, ?, ?, ?, ?, ?, 300, 60, ?, 1)`
  );

const insertSubject = () =>
  db.prepare(
    `INSERT INTO subjects (year_id, key, name, icon, color, share, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

const describe = (level) =>
  `منهاج ${level.title} (عمر ${level.age} سنة): ٣٠٠ ساعة موزّعة على القرآن والفقه والعقيدة والسيرة والأخلاق.`;

/** ينشئ صفاً دراسياً واحداً بمواده الخمس (بدون توليد الحصص). */
function createGradeYear(level) {
  const info = insertYear().run(
    level.title,
    level.grade,
    level.stage,
    level.age,
    level.age,
    describe(level),
    orderForGrade(level.grade)
  );
  const yearId = Number(info.lastInsertRowid);
  const shares = sharesForGrade(level.grade);
  const addSubject = insertSubject();
  DEFAULT_SUBJECTS.forEach((subject, index) => {
    addSubject.run(
      yearId,
      subject.key,
      subject.name,
      subject.icon,
      subject.color,
      shares[subject.key] ?? subject.share,
      index
    );
  });
  return yearId;
}

/** ينشئ سُلَّم الصفوف كاملاً: الروضة الأولى والثانية ثم الصفوف من الأول إلى الثاني عشر. */
function seedGrades() {
  const created = [];
  db.transaction(() => {
    GRADE_LEVELS.forEach((level) => created.push(createGradeYear(level)));
  })();
  created.forEach((yearId) => generateYearSchedule(yearId));
  return created;
}

/** أمثلة محتوى في أول حصة من كل مادة بصف معيّن ليظهر التطبيق عاملاً من أول تشغيل. */
function seedSampleResources(yearId) {
  const sessions = db
    .prepare(
      `SELECT c.id, c.title, s.key FROM class_sessions c JOIN subjects s ON s.id = c.subject_id
       WHERE c.year_id = ? AND c.seq = 1 ORDER BY s.order_index`
    )
    .all(yearId);

  const samples = {
    quran: {
      objectives: 'حفظ سورة الفاتحة مع إتقان مخارج الحروف، ومعرفة معاني مفرداتها.',
      summary: 'تلاوة جماعية ثم فردية، مع تدريب على المدود والوقف.',
      resource: {
        kind: 'text',
        title: 'نص سورة الفاتحة',
        text_content:
          'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n' +
          'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ\n' +
          'الرَّحْمَٰنِ الرَّحِيمِ\n' +
          'مَالِكِ يَوْمِ الدِّينِ\n' +
          'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ\n' +
          'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ\n' +
          'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      },
    },
    fiqh: {
      objectives: 'معرفة معنى الطهارة وأقسام المياه، وحفظ خطوات الوضوء بالترتيب.',
      summary: 'شرح عملي لخطوات الوضوء مع تطبيق أمام المعلم.',
      resource: {
        kind: 'html',
        title: 'خطوات الوضوء — بطاقة تفاعلية',
        text_content:
          '<h3>خطوات الوضوء</h3><ol>' +
          '<li>النية وقول: بسم الله</li>' +
          '<li>غسل الكفين ثلاثاً</li>' +
          '<li>المضمضة والاستنشاق ثلاثاً</li>' +
          '<li>غسل الوجه ثلاثاً</li>' +
          '<li>غسل اليدين إلى المرفقين</li>' +
          '<li>مسح الرأس والأذنين</li>' +
          '<li>غسل الرجلين إلى الكعبين</li>' +
          '</ol><p><strong>تنبيه:</strong> الترتيب والموالاة من فروض الوضوء.</p>',
      },
    },
    aqeedah: {
      objectives: 'معرفة أركان الإيمان الستة والاستدلال عليها بحديث جبريل.',
      summary: 'حوار صفّي حول معنى الإيمان بالله وملائكته وكتبه ورسله.',
      resource: {
        kind: 'text',
        title: 'أركان الإيمان الستة',
        text_content:
          '١) الإيمان بالله\n٢) الإيمان بملائكته\n٣) الإيمان بكتبه\n٤) الإيمان برسله\n' +
          '٥) الإيمان باليوم الآخر\n٦) الإيمان بالقدر خيره وشره',
      },
    },
    seerah: {
      objectives: 'التعرّف على نسب النبي ﷺ ومولده وبيئة مكة قبل البعثة.',
      summary: 'سرد قصصي مع خط زمني مبسّط لأحداث ما قبل البعثة.',
      resource: {
        kind: 'text',
        title: 'مولد النبي ﷺ — نقاط أساسية',
        text_content:
          '• وُلد ﷺ في مكة عام الفيل.\n• أبوه عبد الله بن عبد المطلب، وأمه آمنة بنت وهب.\n' +
          '• كفله جدّه عبد المطلب ثم عمّه أبو طالب.\n• عُرف قبل البعثة بالصادق الأمين.',
      },
    },
    akhlaq: {
      objectives: 'تعلّم آداب السلام والاستئذان وتطبيقها في الصف والبيت.',
      summary: 'تمثيل مواقف عملية للسلام والاستئذان مع تقويم جماعي.',
      resource: {
        kind: 'html',
        title: 'آداب السلام',
        text_content:
          '<h3>آداب السلام</h3><ul>' +
          '<li>ابدأ بالسلام: «السلام عليكم ورحمة الله وبركاته»</li>' +
          '<li>يسلّم الصغير على الكبير، والراكب على الماشي</li>' +
          '<li>ردّ السلام بأحسن منه</li>' +
          '<li>الاستئذان ثلاثاً قبل الدخول</li>' +
          '</ul>',
      },
    },
  };

  const updateSession = db.prepare('UPDATE class_sessions SET objectives = ?, summary = ? WHERE id = ?');
  const insertResource = db.prepare(
    `INSERT INTO resources (session_id, kind, title, description, order_index, text_content)
     VALUES (?, ?, ?, '', 0, ?)`
  );

  db.transaction(() => {
    sessions.forEach((session) => {
      const sample = samples[session.key];
      if (!sample) return;
      updateSession.run(sample.objectives, sample.summary, session.id);
      insertResource.run(session.id, sample.resource.kind, sample.resource.title, sample.resource.text_content);
    });
  })();
}

/** ينشئ حساب المشرف إن لم يوجد أي مشرف. */
function ensureAdmin() {
  const exists = db.prepare("SELECT 1 FROM users WHERE role = 'admin'").get();
  if (exists) return null;
  const username = (process.env.ADMIN_USER || 'admin').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'admin12345';
  db.prepare(
    `INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, 'admin')`
  ).run(username, hashPassword(password), process.env.ADMIN_NAME || 'مشرف المنصة');
  return { username, password };
}

/**
 * ترحيل قواعد البيانات المنشأة قبل اعتماد الصفوف الدراسية:
 * يملأ الصف والمرحلة من العمر، ويُصلح عناوين المستويات الآلية القديمة،
 * ثم يضيف صفوف الروضة الناقصة مرة واحدة فقط. لا يحذف أي محتوى.
 */
function migrateToGrades() {
  const pending = db.prepare('SELECT * FROM years WHERE grade IS NULL').all();
  const report = { updated: 0, renamed: 0, added: 0 };

  if (pending.length) {
    const update = db.prepare(
      'UPDATE years SET grade = ?, stage = ?, title = ?, order_index = ? WHERE id = ?'
    );
    db.transaction(() => {
      pending.forEach((year) => {
        const grade = gradeForAge(year.age_min);
        if (grade === null) return; // صف خارج السُلَّم: يبقى كما هو
        // العناوين الآلية القديمة («المستوى الأول» …) تُستبدل باسم الصف، وما عداها يبقى كما كتبه المشرف
        const isAutoTitle = /^المستوى\s/.test(year.title);
        const title = isAutoTitle ? gradeTitle(grade) : year.title;
        if (isAutoTitle) report.renamed++;
        update.run(grade, stageOfGrade(grade), title, orderForGrade(grade), year.id);
        report.updated++;
      });
    })();
  }

  // صفوف الروضة لم تكن موجودة في النسخة السابقة: تُضاف مرة واحدة فقط
  if (db.prepare('SELECT COUNT(*) AS c FROM years').get().c > 0 && !meta.get('grades_v2')) {
    const missing = GRADE_LEVELS.filter(
      (level) => !db.prepare('SELECT 1 FROM years WHERE grade = ?').get(level.grade)
    );
    missing.forEach((level) => {
      const yearId = createGradeYear(level);
      generateYearSchedule(yearId);
      report.added++;
    });
  }
  meta.set('grades_v2', '1');
  return report;
}

/** بيانات أوّلية تُنشأ مرة واحدة فقط عند أول تشغيل. */
function ensureSeed() {
  const admin = ensureAdmin();
  if (admin) {
    console.log(`تم إنشاء حساب المشرف: ${admin.username} / ${admin.password}`);
  }

  const years = db.prepare('SELECT COUNT(*) AS c FROM years').get().c;
  if (years === 0) {
    console.log('جارٍ تهيئة المناهج (من الروضة الأولى إلى الصف الثاني عشر × ٣٠٠ ساعة)...');
    const created = seedGrades();
    seedSampleResources(created[2]); // الصف الأول
    const sessions = db.prepare('SELECT COUNT(*) AS c FROM class_sessions').get().c;
    console.log(`تمت التهيئة: ${created.length} صفاً دراسياً، ${sessions} حصة.`);
    meta.set('grades_v2', '1');

    const demoUser = db.prepare('SELECT 1 FROM users WHERE username = ?').get('student');
    if (!demoUser && process.env.NO_DEMO_STUDENT !== '1') {
      db.prepare(
        `INSERT INTO users (username, password_hash, full_name, role, age, year_id)
         VALUES ('student', ?, 'طالب تجريبي', 'student', 8, ?)`
      ).run(hashPassword('student123'), created[4]); // الصف الثالث
      console.log('تم إنشاء حساب طالب تجريبي: student / student123');
    }
    return;
  }

  const migration = migrateToGrades();
  if (migration.updated || migration.added) {
    console.log(
      `ترحيل إلى الصفوف الدراسية: ${migration.updated} صفاً محدّثاً، ` +
        `${migration.renamed} عنواناً مُعاد تسميته، ${migration.added} صفاً جديداً.`
    );
  }
}

function reset() {
  db.exec(`
    DELETE FROM scorm_tracking; DELETE FROM progress; DELETE FROM resources;
    DELETE FROM class_sessions; DELETE FROM subjects; DELETE FROM years;
    DELETE FROM app_meta WHERE key = 'grades_v2';
  `);
  console.log('تم حذف المناهج السابقة.');
}

if (require.main === module) {
  if (process.argv.includes('--force')) reset();
  ensureSeed();
  console.log('انتهى.');
}

module.exports = { ensureSeed, seedGrades, migrateToGrades, createGradeYear, ensureAdmin };
