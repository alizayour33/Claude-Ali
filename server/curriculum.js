'use strict';

const { db } = require('./db');

/** المراحل الدراسية التي تنتظم تحتها الصفوف. */
const STAGES = {
  kindergarten: { key: 'kindergarten', name: 'رياض الأطفال', icon: '🧸', order: 0 },
  primary: { key: 'primary', name: 'المرحلة الابتدائية', icon: '🏫', order: 1 },
  middle: { key: 'middle', name: 'المرحلة المتوسطة', icon: '📚', order: 2 },
  secondary: { key: 'secondary', name: 'المرحلة الثانوية', icon: '🎓', order: 3 },
};

const GRADE_ORDINALS = [
  'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس',
  'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر',
];

/**
 * سُلَّم الصفوف: الروضة الأولى (‎-1‎) والثانية (‎0‎) ثم الصفوف من الأول إلى الثاني عشر،
 * وكل صف مرتبط بالعمر المعتاد له وبمرحلته الدراسية.
 */
const GRADE_LEVELS = [
  { grade: -1, title: 'الروضة الأولى', stage: 'kindergarten', age: 4 },
  { grade: 0, title: 'الروضة الثانية', stage: 'kindergarten', age: 5 },
  ...GRADE_ORDINALS.map((ordinal, i) => ({
    grade: i + 1,
    title: `الصف ${ordinal}`,
    stage: i + 1 <= 6 ? 'primary' : i + 1 <= 9 ? 'middle' : 'secondary',
    age: 6 + i,
  })),
];

const gradeLevel = (grade) => GRADE_LEVELS.find((level) => level.grade === Number(grade)) || null;
const gradeTitle = (grade) => gradeLevel(grade)?.title || null;
const stageOfGrade = (grade) => gradeLevel(grade)?.stage || '';
const stageName = (stage) => STAGES[stage]?.name || '';
const gradeForAge = (age) => GRADE_LEVELS.find((level) => level.age === Number(age))?.grade ?? null;

/** ترتيب الصف في القوائم: الروضة الأولى = ١ ثم تصاعدياً حتى الثاني عشر = ١٤. */
const orderForGrade = (grade) => Number(grade) + 2;

/** نِسب المواد تختلف بحسب المرحلة: القرآن والأخلاق أكثر في الصغر، والفقه والعقيدة أكثر في الكبر. */
function sharesForGrade(grade) {
  const g = Number(grade);
  if (g <= 0) return { quran: 50, fiqh: 5, aqeedah: 10, seerah: 15, akhlaq: 20 }; // الروضة
  if (g <= 3) return { quran: 45, fiqh: 10, aqeedah: 15, seerah: 15, akhlaq: 15 }; // ابتدائي أوّل
  if (g <= 6) return { quran: 38, fiqh: 17, aqeedah: 17, seerah: 15, akhlaq: 13 }; // ابتدائي عليا
  if (g <= 9) return { quran: 35, fiqh: 20, aqeedah: 18, seerah: 15, akhlaq: 12 }; // متوسط
  return { quran: 30, fiqh: 25, aqeedah: 20, seerah: 13, akhlaq: 12 }; // ثانوي
}

/** المواد الافتراضية لكل سنة، والنسبة الافتراضية لكل مادة من مجموع الساعات. */
const DEFAULT_SUBJECTS = [
  { key: 'quran',   name: 'قرآن',  icon: '📖', color: '#2f7d55', share: 35 },
  { key: 'fiqh',    name: 'فقه',   icon: '⚖️', color: '#1f6f8b', share: 20 },
  { key: 'aqeedah', name: 'عقيدة', icon: '🕌', color: '#6b4fa8', share: 18 },
  { key: 'seerah',  name: 'سيرة',  icon: '🗺️', color: '#b8622a', share: 15 },
  { key: 'akhlaq',  name: 'أخلاق', icon: '🌿', color: '#8a7a1f', share: 12 },
];

/**
 * توزيع عدد الحصص على المواد حسب النِّسب بطريقة أكبر الباقي،
 * مع ضمان حصة واحدة على الأقل لكل مادة لها نسبة أكبر من صفر.
 */
function allocate(total, shares) {
  const weights = shares.map((s) => Math.max(0, Number(s) || 0));
  const sum = weights.reduce((a, b) => a + b, 0);
  const n = weights.length;
  if (!n || total <= 0) return weights.map(() => 0);
  if (sum === 0) {
    // لا نِسب: توزيع متساوٍ
    const base = Math.floor(total / n);
    const out = weights.map(() => base);
    for (let i = 0; i < total - base * n; i++) out[i]++;
    return out;
  }

  const exact = weights.map((w) => (w / sum) * total);
  const out = exact.map((v) => Math.floor(v));
  let remaining = total - out.reduce((a, b) => a + b, 0);
  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; remaining > 0; k++, remaining--) out[order[k % n].i]++;

  // مادة لها نسبة لكن لم تحصل على شيء: نأخذ حصة من أكبر مادة
  for (let i = 0; i < n; i++) {
    if (weights[i] > 0 && out[i] === 0) {
      let max = 0;
      for (let j = 1; j < n; j++) if (out[j] > out[max]) max = j;
      if (out[max] > 1) {
        out[max]--;
        out[i]++;
      }
    }
  }
  return out;
}

/** عدد الحصص المطلوب لسنة: مجموع الساعات ÷ مدة الحصة. */
function sessionsPerYear(year) {
  const minutes = Math.max(5, Number(year.session_minutes) || 60);
  const hours = Math.max(1, Number(year.total_hours) || 300);
  return Math.max(1, Math.round((hours * 60) / minutes));
}

/**
 * ترتيب الحصص داخل السنة بتبادل المواد: كل مادة تُنشر بالتساوي على مدى السنة
 * حتى لا تتكدس حصص مادة واحدة في بدايتها.
 */
function reorderYearSchedule(yearId) {
  const subjects = db
    .prepare('SELECT id FROM subjects WHERE year_id = ? ORDER BY order_index, id')
    .all(yearId);
  const rows = [];
  subjects.forEach((subject, subjectIdx) => {
    const list = db
      .prepare('SELECT id FROM class_sessions WHERE subject_id = ? ORDER BY seq, id')
      .all(subject.id);
    list.forEach((row, i) => {
      rows.push({ id: row.id, seq: i + 1, key: (i + 0.5) / list.length, subjectIdx });
    });
  });
  rows.sort((a, b) => a.key - b.key || a.subjectIdx - b.subjectIdx);

  const update = db.prepare('UPDATE class_sessions SET seq = ?, global_seq = ? WHERE id = ?');
  db.transaction(() => {
    rows.forEach((row, i) => update.run(row.seq, i + 1, row.id));
  })();
  return rows.length;
}

/**
 * توليد جدول الحصص لسنة دراسية.
 * الحصص الموجودة تبقى كما هي؛ يُضاف الناقص، ويُحذف الزائد الفارغ فقط
 * (الحصص التي تحتوي مرفقات لا تُحذف أبداً).
 */
function generateYearSchedule(yearId) {
  const year = db.prepare('SELECT * FROM years WHERE id = ?').get(yearId);
  if (!year) throw new Error('السنة غير موجودة');

  const subjects = db
    .prepare('SELECT * FROM subjects WHERE year_id = ? ORDER BY order_index, id')
    .all(yearId);
  if (!subjects.length) throw new Error('أضف المواد أولاً');

  const total = sessionsPerYear(year);
  const targets = allocate(total, subjects.map((s) => s.share));

  const insert = db.prepare(`
    INSERT INTO class_sessions (year_id, subject_id, seq, global_seq, title, duration_minutes)
    VALUES (?, ?, ?, ?, ?, ?)`);
  const emptyTail = db.prepare(`
    SELECT s.id FROM class_sessions s
    WHERE s.subject_id = ?
      AND NOT EXISTS (SELECT 1 FROM resources r WHERE r.session_id = s.id)
      AND s.objectives = '' AND s.summary = ''
    ORDER BY s.seq DESC, s.id DESC LIMIT ?`);
  const del = db.prepare('DELETE FROM class_sessions WHERE id = ?');

  const report = { created: 0, deleted: 0, kept: 0, total: 0 };

  db.transaction(() => {
    subjects.forEach((subject, idx) => {
      const target = targets[idx];
      const existing = db
        .prepare('SELECT COUNT(*) AS c FROM class_sessions WHERE subject_id = ?')
        .get(subject.id).c;

      if (existing < target) {
        for (let i = existing; i < target; i++) {
          insert.run(
            yearId,
            subject.id,
            i + 1,
            i + 1,
            `${subject.name} — الحصة ${i + 1}`,
            year.session_minutes
          );
          report.created++;
        }
      } else if (existing > target) {
        const removable = emptyTail.all(subject.id, existing - target);
        removable.forEach((row) => {
          del.run(row.id);
          report.deleted++;
        });
        report.kept += existing - target - removable.length;
      }
    });
  })();

  report.total = reorderYearSchedule(yearId);
  return report;
}

/** إحصاءات سنة: عدد الحصص والساعات لكل مادة + تقدّم مستخدم إن وُجد. */
function yearOverview(yearId, userId = null) {
  const year = db.prepare('SELECT * FROM years WHERE id = ?').get(yearId);
  if (!year) return null;

  const subjects = db
    .prepare(
      `SELECT s.*,
              (SELECT COUNT(*) FROM class_sessions c WHERE c.subject_id = s.id) AS session_count,
              (SELECT COALESCE(SUM(c.duration_minutes), 0) FROM class_sessions c WHERE c.subject_id = s.id) AS minutes,
              (SELECT COUNT(*) FROM class_sessions c JOIN resources r ON r.session_id = c.id
                WHERE c.subject_id = s.id) AS resource_count,
              (SELECT COUNT(*) FROM class_sessions c JOIN progress p
                 ON p.session_id = c.id AND p.user_id = ? AND p.status = 'completed'
                WHERE c.subject_id = s.id) AS completed_count
       FROM subjects s WHERE s.year_id = ? ORDER BY s.order_index, s.id`
    )
    .all(userId ?? -1, yearId);

  const totals = subjects.reduce(
    (acc, s) => {
      acc.sessions += s.session_count;
      acc.minutes += s.minutes;
      acc.completed += s.completed_count;
      acc.resources += s.resource_count;
      return acc;
    },
    { sessions: 0, minutes: 0, completed: 0, resources: 0 }
  );

  return {
    ...year,
    is_published: !!year.is_published,
    stage_name: stageName(year.stage),
    planned_sessions: sessionsPerYear(year),
    subjects: subjects.map((s) => ({ ...s, hours: Math.round((s.minutes / 60) * 10) / 10 })),
    totals: { ...totals, hours: Math.round((totals.minutes / 60) * 10) / 10 },
  };
}

module.exports = {
  STAGES,
  GRADE_LEVELS,
  gradeLevel,
  gradeTitle,
  gradeForAge,
  stageOfGrade,
  stageName,
  orderForGrade,
  sharesForGrade,
  DEFAULT_SUBJECTS,
  allocate,
  sessionsPerYear,
  generateYearSchedule,
  reorderYearSchedule,
  yearOverview,
};
