'use strict';

const express = require('express');
const { db } = require('../db');
const { requireStaff, isStaff } = require('../auth');
const { wrap, bad, notFound, clampInt, bool } = require('../util');
const {
  DEFAULT_SESSIONS,
  DEFAULT_SESSION_MINUTES,
  DEFAULT_TOTAL_HOURS,
  DEFAULT_SUBJECTS,
  GRADE_LEVELS,
  STAGES,
  generateYearSchedule,
  gradeLevel,
  orderForGrade,
  reorderYearSchedule,
  sharesForGrade,
  stageName,
  yearOverview,
  sessionsPerYear,
} = require('../curriculum');

const router = express.Router();

const uid = (req) => req.user?.id ?? -1;

/* ------------------------------- السنوات ------------------------------- */

router.get(
  '/years',
  wrap((req, res) => {
    const staff = isStaff(req.user);
    const age = req.query.age ? clampInt(req.query.age, 3, 99, null) : null;
    const stage = STAGES[req.query.stage] ? req.query.stage : null;
    const rows = db
      .prepare(
        `SELECT y.*,
                (SELECT COUNT(*) FROM class_sessions c WHERE c.year_id = y.id) AS session_count,
                (SELECT COUNT(*) FROM subjects s WHERE s.year_id = y.id) AS subject_count,
                (SELECT COUNT(*) FROM class_sessions c JOIN resources r ON r.session_id = c.id
                  WHERE c.year_id = y.id) AS resource_count,
                (SELECT COUNT(*) FROM class_sessions c JOIN progress p
                   ON p.session_id = c.id AND p.user_id = ? AND p.status = 'completed'
                  WHERE c.year_id = y.id) AS completed_count
         FROM years y
         WHERE (? = 1 OR y.is_published = 1)
           AND (? IS NULL OR ? BETWEEN y.age_min AND y.age_max)
           AND (? IS NULL OR y.stage = ?)
         ORDER BY y.order_index, y.age_min, y.id`
      )
      .all(uid(req), staff ? 1 : 0, age, age, stage, stage);
    res.json({
      stages: Object.values(STAGES),
      grades: GRADE_LEVELS,
      years: rows.map((y) => ({
        ...y,
        is_published: !!y.is_published,
        stage_name: stageName(y.stage),
        planned_sessions: sessionsPerYear(y),
      })),
    });
  })
);

router.get(
  '/years/:id',
  wrap((req, res) => {
    const year = yearOverview(Number(req.params.id), uid(req));
    if (!year) throw notFound('السنة غير موجودة');
    if (!year.is_published && !isStaff(req.user)) throw notFound('السنة غير متاحة');
    res.json({ year });
  })
);

router.post(
  '/years',
  requireStaff,
  wrap((req, res) => {
    // عند تمرير رقم الصف تُملأ بقيّة الحقول تلقائياً (العنوان والمرحلة والعمر والنِسب)
    const level = req.body.grade != null ? gradeLevel(req.body.grade) : null;
    const title = String(req.body.title || level?.title || '').trim();
    if (!title) throw bad('عنوان الصف مطلوب');
    const grade = level ? level.grade : null;
    const stage = STAGES[req.body.stage] ? req.body.stage : level?.stage || '';
    const ageMin = clampInt(req.body.age_min, 3, 99, level?.age ?? 6);
    const ageMax = clampInt(req.body.age_max, ageMin, 99, level?.age ?? ageMin);
    const totalHours = clampInt(req.body.total_hours, 1, 5000, DEFAULT_TOTAL_HOURS);
    const sessionMinutes = clampInt(req.body.session_minutes, 5, 480, DEFAULT_SESSION_MINUTES);
    const orderIndex =
      req.body.order_index != null
        ? clampInt(req.body.order_index, 0, 999, 0)
        : level
          ? orderForGrade(level.grade)
          : (db.prepare('SELECT COALESCE(MAX(order_index), 0) + 1 AS n FROM years').get().n);

    const info = db
      .prepare(
        `INSERT INTO years (title, grade, stage, age_min, age_max, description, total_hours, session_minutes, order_index, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        title,
        grade,
        stage,
        ageMin,
        ageMax,
        String(req.body.description || ''),
        totalHours,
        sessionMinutes,
        orderIndex,
        req.body.is_published === undefined ? 1 : bool(req.body.is_published) ? 1 : 0
      );
    const yearId = Number(info.lastInsertRowid);

    // المواد الافتراضية الخمس، ثم توليد الجدول إذا طُلب
    const insertSubject = db.prepare(
      `INSERT INTO subjects (year_id, key, name, icon, color, share, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    // المواد الافتراضية تأخذ نِسب المرحلة الخاصة بالصف، ما لم يرسل الطالبُ مواد بنِسب صريحة
    const gradeShares = level ? sharesForGrade(level.grade) : null;
    const subjects = Array.isArray(req.body.subjects) && req.body.subjects.length
      ? req.body.subjects
      : DEFAULT_SUBJECTS.map((subject) => ({ ...subject, share: gradeShares?.[subject.key] ?? subject.share }));
    db.transaction(() => {
      subjects.forEach((s, i) => {
        const def = DEFAULT_SUBJECTS.find((d) => d.key === s.key) || DEFAULT_SUBJECTS[0];
        insertSubject.run(
          yearId,
          String(s.key || `subject_${i + 1}`),
          String(s.name || def.name),
          String(s.icon || def.icon),
          String(s.color || def.color),
          clampInt(s.share, 0, 100, def.share),
          i
        );
      });
    })();

    let schedule = null;
    if (req.body.generate === undefined || bool(req.body.generate)) {
      schedule = generateYearSchedule(yearId);
    }
    res.status(201).json({ year: yearOverview(yearId, uid(req)), schedule });
  })
);

router.patch(
  '/years/:id',
  requireStaff,
  wrap((req, res) => {
    const year = db.prepare('SELECT * FROM years WHERE id = ?').get(Number(req.params.id));
    if (!year) throw notFound('السنة غير موجودة');
    const nextLevel = req.body.grade != null ? gradeLevel(req.body.grade) : null;
    const next = {
      title: req.body.title != null ? String(req.body.title).trim() || year.title : year.title,
      grade: req.body.grade != null ? (nextLevel ? nextLevel.grade : null) : year.grade,
      stage: STAGES[req.body.stage] ? req.body.stage : nextLevel ? nextLevel.stage : year.stage,
      age_min: req.body.age_min != null ? clampInt(req.body.age_min, 3, 99, year.age_min) : year.age_min,
      age_max: req.body.age_max != null ? clampInt(req.body.age_max, 3, 99, year.age_max) : year.age_max,
      description: req.body.description != null ? String(req.body.description) : year.description,
      total_hours: req.body.total_hours != null ? clampInt(req.body.total_hours, 1, 5000, year.total_hours) : year.total_hours,
      session_minutes:
        req.body.session_minutes != null ? clampInt(req.body.session_minutes, 5, 480, year.session_minutes) : year.session_minutes,
      order_index:
        req.body.order_index != null
          ? clampInt(req.body.order_index, 0, 999, year.order_index)
          : nextLevel
            ? orderForGrade(nextLevel.grade)
            : year.order_index,
      is_published: req.body.is_published != null ? (bool(req.body.is_published) ? 1 : 0) : year.is_published,
    };
    if (next.age_max < next.age_min) next.age_max = next.age_min;

    db.prepare(
      `UPDATE years SET title = ?, grade = ?, stage = ?, age_min = ?, age_max = ?, description = ?,
                        total_hours = ?, session_minutes = ?, order_index = ?, is_published = ? WHERE id = ?`
    ).run(
      next.title, next.grade, next.stage, next.age_min, next.age_max, next.description,
      next.total_hours, next.session_minutes, next.order_index, next.is_published, year.id
    );
    res.json({ year: yearOverview(year.id, uid(req)) });
  })
);

router.delete(
  '/years/:id',
  requireStaff,
  wrap((req, res) => {
    const year = db.prepare('SELECT * FROM years WHERE id = ?').get(Number(req.params.id));
    if (!year) throw notFound('السنة غير موجودة');
    db.prepare('DELETE FROM years WHERE id = ?').run(year.id);
    res.json({ ok: true });
  })
);

/** توليد/إكمال جدول الحصص حسب نِسب المواد. */
router.post(
  '/years/:id/generate',
  requireStaff,
  wrap((req, res) => {
    const yearId = Number(req.params.id);
    if (!db.prepare('SELECT 1 FROM years WHERE id = ?').get(yearId)) throw notFound('السنة غير موجودة');
    const schedule = generateYearSchedule(yearId);
    res.json({ schedule, year: yearOverview(yearId, uid(req)) });
  })
);

/* -------------------------------- المواد -------------------------------- */

router.post(
  '/years/:id/subjects',
  requireStaff,
  wrap((req, res) => {
    const yearId = Number(req.params.id);
    if (!db.prepare('SELECT 1 FROM years WHERE id = ?').get(yearId)) throw notFound('السنة غير موجودة');
    const name = String(req.body.name || '').trim();
    if (!name) throw bad('اسم المادة مطلوب');
    const key = String(req.body.key || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '') || `s${Date.now().toString(36)}`;
    if (db.prepare('SELECT 1 FROM subjects WHERE year_id = ? AND key = ?').get(yearId, key)) {
      throw bad('هذه المادة موجودة في هذه السنة');
    }
    const orderIndex = db
      .prepare('SELECT COALESCE(MAX(order_index), -1) + 1 AS n FROM subjects WHERE year_id = ?')
      .get(yearId).n;
    const info = db
      .prepare(
        `INSERT INTO subjects (year_id, key, name, icon, color, share, target_sessions, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        yearId,
        key,
        name,
        String(req.body.icon || '📘'),
        String(req.body.color || '#3f7d5f'),
        clampInt(req.body.share, 0, 100, 10),
        req.body.target_sessions === '' || req.body.target_sessions == null
          ? null
          : clampInt(req.body.target_sessions, 0, 5000, null),
        orderIndex
      );
    res.status(201).json({ subject: db.prepare('SELECT * FROM subjects WHERE id = ?').get(info.lastInsertRowid) });
  })
);

router.patch(
  '/subjects/:id',
  requireStaff,
  wrap((req, res) => {
    const subject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(Number(req.params.id));
    if (!subject) throw notFound('المادة غير موجودة');
    // target_sessions: عدد حصص ثابت للمادة، أو null لتأخذ نصيبها من النسبة المئوية
    const target =
      req.body.target_sessions === undefined
        ? subject.target_sessions
        : req.body.target_sessions === '' || req.body.target_sessions === null
          ? null
          : clampInt(req.body.target_sessions, 0, 5000, subject.target_sessions);

    db.prepare(
      `UPDATE subjects SET name = ?, icon = ?, color = ?, share = ?, target_sessions = ?, order_index = ? WHERE id = ?`
    ).run(
      req.body.name != null ? String(req.body.name).trim() || subject.name : subject.name,
      req.body.icon != null ? String(req.body.icon) : subject.icon,
      req.body.color != null ? String(req.body.color) : subject.color,
      req.body.share != null ? clampInt(req.body.share, 0, 100, subject.share) : subject.share,
      target,
      req.body.order_index != null ? clampInt(req.body.order_index, 0, 999, subject.order_index) : subject.order_index,
      subject.id
    );
    res.json({ subject: db.prepare('SELECT * FROM subjects WHERE id = ?').get(subject.id) });
  })
);

router.delete(
  '/subjects/:id',
  requireStaff,
  wrap((req, res) => {
    const subject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(Number(req.params.id));
    if (!subject) throw notFound('المادة غير موجودة');
    db.prepare('DELETE FROM subjects WHERE id = ?').run(subject.id);
    reorderYearSchedule(subject.year_id);
    res.json({ ok: true });
  })
);

/* -------------------------------- الحصص -------------------------------- */

const sessionListQuery = (extra) => `
  SELECT c.*, s.name AS subject_name, s.icon AS subject_icon, s.color AS subject_color, s.key AS subject_key,
         (SELECT COUNT(*) FROM resources r WHERE r.session_id = c.id) AS resource_count,
         (SELECT GROUP_CONCAT(DISTINCT r.kind) FROM resources r WHERE r.session_id = c.id) AS resource_kinds,
         p.status AS progress_status
  FROM class_sessions c
  JOIN subjects s ON s.id = c.subject_id
  LEFT JOIN progress p ON p.session_id = c.id AND p.user_id = ?
  ${extra}`;

const decorate = (row) => ({
  ...row,
  is_published: !!row.is_published,
  resource_kinds: row.resource_kinds ? row.resource_kinds.split(',') : [],
});

router.get(
  '/years/:id/sessions',
  wrap((req, res) => {
    const yearId = Number(req.params.id);
    const year = db.prepare('SELECT * FROM years WHERE id = ?').get(yearId);
    if (!year) throw notFound('السنة غير موجودة');
    const staff = isStaff(req.user);
    if (!year.is_published && !staff) throw notFound('السنة غير متاحة');

    const subjectId = req.query.subject_id ? Number(req.query.subject_id) : null;
    const q = req.query.q ? `%${String(req.query.q).trim()}%` : null;
    // الترقيم اختياري: بدون limit تُعاد كل الحصص
    const limit = req.query.limit ? clampInt(req.query.limit, 1, 500, 50) : null;
    const offset = clampInt(req.query.offset, 0, 100000, 0);

    const filters = `WHERE c.year_id = ?
            AND (? IS NULL OR c.subject_id = ?)
            AND (? = 1 OR c.is_published = 1)
            AND (? IS NULL OR c.title LIKE ? OR c.objectives LIKE ? OR c.summary LIKE ?)`;
    const args = [yearId, subjectId, subjectId, staff ? 1 : 0, q, q, q, q];

    const total = db
      .prepare(`SELECT COUNT(*) AS c FROM class_sessions c ${filters}`)
      .get(...args).c;
    const rows = db
      .prepare(
        sessionListQuery(`${filters}
          ORDER BY ${subjectId ? 'c.seq' : 'c.global_seq'}, c.id
          ${limit ? 'LIMIT ? OFFSET ?' : ''}`)
      )
      .all(uid(req), ...args, ...(limit ? [limit, offset] : []));
    res.json({ sessions: rows.map(decorate), total, limit, offset });
  })
);

router.get(
  '/sessions/:id',
  wrap((req, res) => {
    const staff = isStaff(req.user);
    const row = db
      .prepare(
        sessionListQuery(`
        WHERE c.id = ?`)
      )
      .get(uid(req), Number(req.params.id));
    if (!row) throw notFound('الحصة غير موجودة');
    const year = db.prepare('SELECT * FROM years WHERE id = ?').get(row.year_id);
    if ((!row.is_published || !year.is_published) && !staff) throw notFound('الحصة غير متاحة');

    const resources = db
      .prepare('SELECT * FROM resources WHERE session_id = ? ORDER BY order_index, id')
      .all(row.id)
      .map((r) => ({
        ...r,
        // النص/HTML يُرسل مع المرفق مباشرة، أما الملفات فتُطلب عبر مسارها
        url: r.file_path ? `/api/resources/${r.id}/file` : r.external_url || null,
        download_url: r.file_path ? `/api/resources/${r.id}/file?download=1` : null,
        scorm_url: r.kind === 'scorm' && r.launch_path ? `/api/scorm/${r.id}/content/${r.launch_path}` : null,
      }));

    const neighbour = (dir) =>
      db
        .prepare(
          `SELECT id, title, global_seq FROM class_sessions
           WHERE year_id = ? AND (? = 1 OR is_published = 1)
             AND global_seq ${dir === 'next' ? '>' : '<'} ?
           ORDER BY global_seq ${dir === 'next' ? 'ASC' : 'DESC'} LIMIT 1`
        )
        .get(row.year_id, staff ? 1 : 0, row.global_seq) || null;

    res.json({
      session: decorate(row),
      resources,
      year: { id: year.id, title: year.title, age_min: year.age_min, age_max: year.age_max },
      prev: neighbour('prev'),
      next: neighbour('next'),
      scorm_tracking: req.user
        ? db
            .prepare('SELECT * FROM scorm_tracking WHERE user_id = ? AND resource_id IN (SELECT id FROM resources WHERE session_id = ?)')
            .all(req.user.id, row.id)
        : [],
    });
  })
);

/** إضافة حصة واحدة أو عدة حصص دفعة واحدة إلى مادة. */
router.post(
  '/subjects/:id/sessions',
  requireStaff,
  wrap((req, res) => {
    const subject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(Number(req.params.id));
    if (!subject) throw notFound('المادة غير موجودة');
    const year = db.prepare('SELECT * FROM years WHERE id = ?').get(subject.year_id);
    const count = clampInt(req.body.count, 1, 200, 1);
    const duration = clampInt(req.body.duration_minutes, 5, 480, year.session_minutes);
    const published = req.body.is_published === undefined ? 1 : bool(req.body.is_published) ? 1 : 0;

    const insert = db.prepare(
      `INSERT INTO class_sessions (year_id, subject_id, seq, global_seq, title, objectives, summary, duration_minutes, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const created = [];
    db.transaction(() => {
      let seq = db
        .prepare('SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM class_sessions WHERE subject_id = ?')
        .get(subject.id).n;
      for (let i = 0; i < count; i++, seq++) {
        const title =
          count === 1 && req.body.title
            ? String(req.body.title).trim()
            : `${subject.name} — الحصة ${seq}`;
        const info = insert.run(
          subject.year_id,
          subject.id,
          seq,
          seq,
          title,
          String(req.body.objectives || ''),
          String(req.body.summary || ''),
          duration,
          published
        );
        created.push(Number(info.lastInsertRowid));
      }
    })();
    reorderYearSchedule(subject.year_id);

    const sessions = created.map((id) => db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(id));
    res.status(201).json({ session: sessions[0], sessions, created: sessions.length });
  })
);

router.patch(
  '/sessions/:id',
  requireStaff,
  wrap((req, res) => {
    const s = db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(Number(req.params.id));
    if (!s) throw notFound('الحصة غير موجودة');
    db.prepare(
      `UPDATE class_sessions SET title = ?, objectives = ?, summary = ?, duration_minutes = ?,
                                 is_published = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(
      req.body.title != null ? String(req.body.title).trim() || s.title : s.title,
      req.body.objectives != null ? String(req.body.objectives) : s.objectives,
      req.body.summary != null ? String(req.body.summary) : s.summary,
      req.body.duration_minutes != null ? clampInt(req.body.duration_minutes, 5, 480, s.duration_minutes) : s.duration_minutes,
      req.body.is_published != null ? (bool(req.body.is_published) ? 1 : 0) : s.is_published,
      s.id
    );
    res.json({ session: db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(s.id) });
  })
);

/** نقل حصة داخل مادتها لأعلى/لأسفل ثم إعادة ترتيب جدول السنة. */
router.post(
  '/sessions/:id/move',
  requireStaff,
  wrap((req, res) => {
    const s = db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(Number(req.params.id));
    if (!s) throw notFound('الحصة غير موجودة');
    const up = String(req.body.direction || 'up') === 'up';
    const other = db
      .prepare(
        `SELECT * FROM class_sessions WHERE subject_id = ? AND seq ${up ? '<' : '>'} ?
         ORDER BY seq ${up ? 'DESC' : 'ASC'} LIMIT 1`
      )
      .get(s.subject_id, s.seq);
    if (!other) return res.json({ ok: true, moved: false });
    db.transaction(() => {
      db.prepare('UPDATE class_sessions SET seq = ? WHERE id = ?').run(other.seq, s.id);
      db.prepare('UPDATE class_sessions SET seq = ? WHERE id = ?').run(s.seq, other.id);
    })();
    reorderYearSchedule(s.year_id);
    res.json({ ok: true, moved: true });
  })
);

router.delete(
  '/sessions/:id',
  requireStaff,
  wrap((req, res) => {
    const s = db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(Number(req.params.id));
    if (!s) throw notFound('الحصة غير موجودة');
    db.prepare('DELETE FROM class_sessions WHERE id = ?').run(s.id);
    reorderYearSchedule(s.year_id);
    res.json({ ok: true });
  })
);

/** بحث سريع في عناوين الحصص والمرفقات. */
router.get(
  '/search',
  wrap((req, res) => {
    const term = String(req.query.q || '').trim();
    if (term.length < 2) return res.json({ sessions: [] });
    const like = `%${term}%`;
    const staff = isStaff(req.user);
    const rows = db
      .prepare(
        sessionListQuery(`
        JOIN years y ON y.id = c.year_id
        WHERE (? = 1 OR (c.is_published = 1 AND y.is_published = 1))
          AND (c.title LIKE ? OR c.objectives LIKE ? OR c.summary LIKE ?
               OR EXISTS (SELECT 1 FROM resources r WHERE r.session_id = c.id AND (r.title LIKE ? OR r.description LIKE ?)))
        ORDER BY c.year_id, c.global_seq LIMIT 60`)
      )
      .all(uid(req), staff ? 1 : 0, like, like, like, like, like);
    res.json({ sessions: rows.map(decorate) });
  })
);

module.exports = router;
