'use strict';

const { db } = require('./db');
const { hashPassword } = require('./auth');
const { DEFAULT_SUBJECTS, generateYearSchedule } = require('./curriculum');

const ORDINALS = [
  'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس',
  'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر',
];

/** نِسب المواد تتغيّر مع العمر: القرآن والأخلاق أكثر في الصغر، والفقه والعقيدة أكثر في الكبر. */
function sharesForAge(age) {
  if (age <= 9) return { quran: 45, fiqh: 10, aqeedah: 15, seerah: 15, akhlaq: 15 };
  if (age <= 13) return { quran: 35, fiqh: 20, aqeedah: 18, seerah: 15, akhlaq: 12 };
  return { quran: 30, fiqh: 25, aqeedah: 20, seerah: 13, akhlaq: 12 };
}

const AGES = Array.from({ length: 12 }, (_, i) => 6 + i); // ٦ إلى ١٧ سنة

function seedYears() {
  const insertYear = db.prepare(
    `INSERT INTO years (title, age_min, age_max, description, total_hours, session_minutes, order_index, is_published)
     VALUES (?, ?, ?, ?, 300, 60, ?, 1)`
  );
  const insertSubject = db.prepare(
    `INSERT INTO subjects (year_id, key, name, icon, color, share, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const created = [];
  db.transaction(() => {
    AGES.forEach((age, i) => {
      const title = `المستوى ${ORDINALS[i]}`;
      const info = insertYear.run(
        title,
        age,
        age,
        `منهاج متكامل لعمر ${age} سنة: ٣٠٠ ساعة موزّعة على القرآن والفقه والعقيدة والسيرة والأخلاق.`,
        i
      );
      const yearId = Number(info.lastInsertRowid);
      const shares = sharesForAge(age);
      DEFAULT_SUBJECTS.forEach((s, idx) => {
        insertSubject.run(yearId, s.key, s.name, s.icon, s.color, shares[s.key] ?? s.share, idx);
      });
      created.push(yearId);
    });
  })();

  created.forEach((yearId) => generateYearSchedule(yearId));
  return created;
}

/** أمثلة محتوى في أول حصة من كل مادة بالمستوى الأول ليظهر التطبيق عاملاً من أول تشغيل. */
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

/** بيانات أوّلية تُنشأ مرة واحدة فقط عند أول تشغيل. */
function ensureSeed() {
  const admin = ensureAdmin();
  if (admin) {
    console.log(`تم إنشاء حساب المشرف: ${admin.username} / ${admin.password}`);
  }
  const years = db.prepare('SELECT COUNT(*) AS c FROM years').get().c;
  if (years === 0) {
    console.log('جارٍ تهيئة المناهج (١٢ مستوى × ٣٠٠ ساعة)...');
    const created = seedYears();
    seedSampleResources(created[0]);
    const sessions = db.prepare('SELECT COUNT(*) AS c FROM class_sessions').get().c;
    console.log(`تمت التهيئة: ${created.length} مستوى، ${sessions} حصة.`);

    const demoUser = db.prepare('SELECT 1 FROM users WHERE username = ?').get('student');
    if (!demoUser && process.env.NO_DEMO_STUDENT !== '1') {
      db.prepare(
        `INSERT INTO users (username, password_hash, full_name, role, age, year_id)
         VALUES ('student', ?, 'طالب تجريبي', 'student', 8, ?)`
      ).run(hashPassword('student123'), created[2]);
      console.log('تم إنشاء حساب طالب تجريبي: student / student123');
    }
  }
}

function reset() {
  db.exec(`
    DELETE FROM scorm_tracking; DELETE FROM progress; DELETE FROM resources;
    DELETE FROM class_sessions; DELETE FROM subjects; DELETE FROM years;
  `);
  console.log('تم حذف المناهج السابقة.');
}

if (require.main === module) {
  if (process.argv.includes('--force')) reset();
  ensureSeed();
  console.log('انتهى.');
}

module.exports = { ensureSeed, sharesForAge, seedYears, ensureAdmin };
