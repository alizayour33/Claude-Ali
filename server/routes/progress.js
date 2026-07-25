'use strict';

const express = require('express');
const { db } = require('../db');
const { requireAuth, requireStaff } = require('../auth');
const { wrap, notFound, clampInt } = require('../util');

const router = express.Router();

/** تحديث حالة حصة للطالب الحالي (جارية / منجزة) مع تجميع وقت المشاهدة. */
router.post(
  '/progress/:sessionId',
  requireAuth,
  wrap((req, res) => {
    const session = db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(Number(req.params.sessionId));
    if (!session) throw notFound('الحصة غير موجودة');
    const status = req.body.status === 'completed' ? 'completed' : 'in_progress';
    const seconds = clampInt(req.body.seconds, 0, 86400, 0);

    db.prepare(
      `INSERT INTO progress (user_id, session_id, status, seconds_spent, completed_at, updated_at)
       VALUES (?, ?, ?, ?, CASE WHEN ? = 'completed' THEN datetime('now') END, datetime('now'))
       ON CONFLICT(user_id, session_id) DO UPDATE SET
         -- تسجيل وقت الاطّلاع لا يُلغي إنجازاً سابقاً
         status = CASE WHEN progress.status = 'completed' THEN 'completed' ELSE excluded.status END,
         seconds_spent = progress.seconds_spent + excluded.seconds_spent,
         completed_at = CASE WHEN excluded.status = 'completed'
                             THEN COALESCE(progress.completed_at, datetime('now')) END,
         updated_at = datetime('now')`
    ).run(req.user.id, session.id, status, seconds, status);

    res.json({
      progress: db.prepare('SELECT * FROM progress WHERE user_id = ? AND session_id = ?').get(req.user.id, session.id),
    });
  })
);

router.delete(
  '/progress/:sessionId',
  requireAuth,
  wrap((req, res) => {
    db.prepare('DELETE FROM progress WHERE user_id = ? AND session_id = ?').run(
      req.user.id,
      Number(req.params.sessionId)
    );
    res.json({ ok: true });
  })
);

/** لوحة الطالب: تقدّمه في كل سنة ومادة + الحصة التالية. */
router.get(
  '/me/progress',
  requireAuth,
  wrap((req, res) => {
    const perYear = db
      .prepare(
        `SELECT y.id, y.title, y.age_min, y.age_max,
                COUNT(c.id) AS total,
                SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) AS completed,
                COALESCE(SUM(CASE WHEN p.status = 'completed' THEN c.duration_minutes ELSE 0 END), 0) AS minutes_done
         FROM years y
         JOIN class_sessions c ON c.year_id = y.id AND c.is_published = 1
         LEFT JOIN progress p ON p.session_id = c.id AND p.user_id = ?
         WHERE y.is_published = 1
         GROUP BY y.id
         HAVING completed > 0 OR y.id = ?
         ORDER BY y.order_index, y.id`
      )
      .all(req.user.id, req.user.year_id ?? -1);

    const perSubject = req.user.year_id
      ? db
          .prepare(
            `SELECT s.id, s.name, s.icon, s.color,
                    COUNT(c.id) AS total,
                    SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) AS completed
             FROM subjects s
             LEFT JOIN class_sessions c ON c.subject_id = s.id AND c.is_published = 1
             LEFT JOIN progress p ON p.session_id = c.id AND p.user_id = ?
             WHERE s.year_id = ?
             GROUP BY s.id ORDER BY s.order_index, s.id`
          )
          .all(req.user.id, req.user.year_id)
      : [];

    const recent = db
      .prepare(
        `SELECT c.id, c.title, c.global_seq, s.name AS subject_name, s.icon AS subject_icon,
                y.title AS year_title, p.status, p.updated_at
         FROM progress p
         JOIN class_sessions c ON c.id = p.session_id
         JOIN subjects s ON s.id = c.subject_id
         JOIN years y ON y.id = c.year_id
         WHERE p.user_id = ?
         ORDER BY p.updated_at DESC LIMIT 8`
      )
      .all(req.user.id);

    const nextSession = req.user.year_id
      ? db
          .prepare(
            `SELECT c.id, c.title, c.global_seq, s.name AS subject_name, s.icon AS subject_icon
             FROM class_sessions c
             JOIN subjects s ON s.id = c.subject_id
             LEFT JOIN progress p ON p.session_id = c.id AND p.user_id = ?
             WHERE c.year_id = ? AND c.is_published = 1 AND (p.status IS NULL OR p.status <> 'completed')
             ORDER BY c.global_seq LIMIT 1`
          )
          .get(req.user.id, req.user.year_id) || null
      : null;

    const totals = db
      .prepare(
        `SELECT COUNT(*) AS completed,
                COALESCE(SUM(c.duration_minutes), 0) AS minutes,
                COALESCE(SUM(p.seconds_spent), 0) AS seconds_spent
         FROM progress p JOIN class_sessions c ON c.id = p.session_id
         WHERE p.user_id = ? AND p.status = 'completed'`
      )
      .get(req.user.id);

    res.json({ years: perYear, subjects: perSubject, recent, next: nextSession, totals });
  })
);

/** تقرير للمعلم/المشرف عن تقدّم الطلاب. */
router.get(
  '/reports/students',
  requireStaff,
  wrap((req, res) => {
    const students = db
      .prepare(
        `SELECT u.id, u.full_name, u.username, u.age, y.title AS year_title, y.id AS year_id,
                (SELECT COUNT(*) FROM class_sessions c WHERE c.year_id = u.year_id AND c.is_published = 1) AS total,
                (SELECT COUNT(*) FROM progress p JOIN class_sessions c ON c.id = p.session_id
                  WHERE p.user_id = u.id AND p.status = 'completed') AS completed,
                (SELECT COALESCE(SUM(c.duration_minutes), 0) FROM progress p JOIN class_sessions c ON c.id = p.session_id
                  WHERE p.user_id = u.id AND p.status = 'completed') AS minutes,
                (SELECT MAX(p.updated_at) FROM progress p WHERE p.user_id = u.id) AS last_activity
         FROM users u LEFT JOIN years y ON y.id = u.year_id
         WHERE u.role = 'student'
         ORDER BY u.full_name`
      )
      .all();
    res.json({ students });
  })
);

router.get(
  '/reports/students/:id',
  requireStaff,
  wrap((req, res) => {
    const student = db
      .prepare('SELECT id, full_name, username, age, year_id FROM users WHERE id = ? AND role = \'student\'')
      .get(Number(req.params.id));
    if (!student) throw notFound('الطالب غير موجود');
    const subjects = student.year_id
      ? db
          .prepare(
            `SELECT s.name, s.icon, s.color, COUNT(c.id) AS total,
                    SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) AS completed
             FROM subjects s
             LEFT JOIN class_sessions c ON c.subject_id = s.id AND c.is_published = 1
             LEFT JOIN progress p ON p.session_id = c.id AND p.user_id = ?
             WHERE s.year_id = ? GROUP BY s.id ORDER BY s.order_index`
          )
          .all(student.id, student.year_id)
      : [];
    const scorm = db
      .prepare(
        `SELECT t.*, r.title AS resource_title, c.title AS session_title
         FROM scorm_tracking t
         JOIN resources r ON r.id = t.resource_id
         JOIN class_sessions c ON c.id = r.session_id
         WHERE t.user_id = ? ORDER BY t.updated_at DESC LIMIT 50`
      )
      .all(student.id);
    res.json({ student, subjects, scorm });
  })
);

module.exports = router;
