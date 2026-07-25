'use strict';

const express = require('express');
const { db } = require('../db');
const auth = require('../auth');
const { wrap, bad, clampInt } = require('../util');

const router = express.Router();

const publicUser = (u) =>
  u && {
    id: u.id,
    username: u.username,
    full_name: u.full_name,
    role: u.role,
    age: u.age,
    year_id: u.year_id,
  };

/** يختار السنة المناسبة لعمر معيّن. */
function yearForAge(age) {
  if (!age) return null;
  return (
    db
      .prepare(
        `SELECT id FROM years WHERE is_published = 1 AND ? BETWEEN age_min AND age_max
         ORDER BY order_index, id LIMIT 1`
      )
      .get(age)?.id ?? null
  );
}

router.get('/me', (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post(
  '/register',
  wrap((req, res) => {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const fullName = String(req.body.full_name || '').trim();
    const age = req.body.age == null || req.body.age === '' ? null : clampInt(req.body.age, 3, 99, null);

    if (!/^[a-z0-9_.-]{3,32}$/.test(username)) {
      throw bad('اسم المستخدم: ٣ إلى ٣٢ حرفاً إنجليزياً أو رقماً (بدون مسافات)');
    }
    if (password.length < 6) throw bad('كلمة المرور يجب أن تكون ٦ أحرف على الأقل');
    if (fullName.length < 2) throw bad('الاسم الكامل مطلوب');
    if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) {
      throw bad('اسم المستخدم مستخدم بالفعل');
    }

    const info = db
      .prepare(
        `INSERT INTO users (username, password_hash, full_name, role, age, year_id)
         VALUES (?, ?, ?, 'student', ?, ?)`
      )
      .run(username, auth.hashPassword(password), fullName, age, yearForAge(age));

    auth.startSession(res, info.lastInsertRowid);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ user: publicUser(user) });
  })
);

router.post(
  '/login',
  wrap((req, res) => {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !auth.verifyPassword(password, user.password_hash)) {
      throw bad('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
    auth.startSession(res, user.id);
    res.json({ user: publicUser(user) });
  })
);

router.post('/logout', (req, res) => {
  auth.endSession(req, res);
  res.json({ ok: true });
});

/** تحديث بيانات الحساب: العمر يُعيد ربط الطالب بالسنة المناسبة. */
router.patch(
  '/me',
  auth.requireAuth,
  wrap((req, res) => {
    const current = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const fullName = req.body.full_name == null ? current.full_name : String(req.body.full_name).trim();
    if (fullName.length < 2) throw bad('الاسم الكامل مطلوب');

    let age = current.age;
    let yearId = current.year_id;
    if (req.body.age !== undefined) {
      age = req.body.age === '' || req.body.age === null ? null : clampInt(req.body.age, 3, 99, current.age);
      yearId = yearForAge(age);
    }
    if (req.body.year_id !== undefined && req.body.year_id !== null && req.body.year_id !== '') {
      const y = db.prepare('SELECT id FROM years WHERE id = ?').get(Number(req.body.year_id));
      if (!y) throw bad('السنة غير موجودة');
      yearId = y.id;
    }

    if (req.body.password) {
      if (String(req.body.password).length < 6) throw bad('كلمة المرور يجب أن تكون ٦ أحرف على الأقل');
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
        auth.hashPassword(String(req.body.password)),
        current.id
      );
    }

    db.prepare('UPDATE users SET full_name = ?, age = ?, year_id = ? WHERE id = ?').run(
      fullName,
      age,
      yearId,
      current.id
    );
    res.json({ user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(current.id)) });
  })
);

/** إدارة المستخدمين (المشرف فقط). */
router.get(
  '/users',
  auth.requireAdmin,
  wrap((req, res) => {
    const users = db
      .prepare(
        `SELECT u.id, u.username, u.full_name, u.role, u.age, u.year_id, u.created_at, y.title AS year_title,
                (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.status = 'completed') AS completed
         FROM users u LEFT JOIN years y ON y.id = u.year_id
         ORDER BY u.role, u.full_name`
      )
      .all();
    res.json({ users });
  })
);

router.post(
  '/users',
  auth.requireAdmin,
  wrap((req, res) => {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const fullName = String(req.body.full_name || '').trim();
    const role = ['admin', 'teacher', 'student'].includes(req.body.role) ? req.body.role : 'student';
    const age = req.body.age ? clampInt(req.body.age, 3, 99, null) : null;
    if (!/^[a-z0-9_.-]{3,32}$/.test(username)) throw bad('اسم مستخدم غير صالح');
    if (password.length < 6) throw bad('كلمة المرور يجب أن تكون ٦ أحرف على الأقل');
    if (fullName.length < 2) throw bad('الاسم الكامل مطلوب');
    if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) throw bad('اسم المستخدم مستخدم بالفعل');

    const info = db
      .prepare(
        `INSERT INTO users (username, password_hash, full_name, role, age, year_id)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(username, auth.hashPassword(password), fullName, role, age, yearForAge(age));
    res.status(201).json({ user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)) });
  })
);

router.patch(
  '/users/:id',
  auth.requireAdmin,
  wrap((req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(req.params.id));
    if (!user) throw bad('المستخدم غير موجود');
    const role = ['admin', 'teacher', 'student'].includes(req.body.role) ? req.body.role : user.role;
    if (user.role === 'admin' && role !== 'admin') {
      const admins = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'").get().c;
      if (admins <= 1) throw bad('لا يمكن إزالة آخر مشرف');
    }
    const fullName = req.body.full_name ? String(req.body.full_name).trim() : user.full_name;
    const age = req.body.age === undefined ? user.age : req.body.age ? clampInt(req.body.age, 3, 99, user.age) : null;
    const yearId =
      req.body.year_id === undefined
        ? user.year_id
        : req.body.year_id
          ? Number(req.body.year_id)
          : yearForAge(age);

    if (req.body.password) {
      if (String(req.body.password).length < 6) throw bad('كلمة المرور قصيرة');
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
        auth.hashPassword(String(req.body.password)),
        user.id
      );
    }
    db.prepare('UPDATE users SET full_name = ?, role = ?, age = ?, year_id = ? WHERE id = ?').run(
      fullName,
      role,
      age,
      yearId,
      user.id
    );
    res.json({ user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(user.id)) });
  })
);

router.delete(
  '/users/:id',
  auth.requireAdmin,
  wrap((req, res) => {
    const id = Number(req.params.id);
    if (id === req.user.id) throw bad('لا يمكنك حذف حسابك');
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) throw bad('المستخدم غير موجود');
    if (user.role === 'admin') {
      const admins = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'").get().c;
      if (admins <= 1) throw bad('لا يمكن حذف آخر مشرف');
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ ok: true });
  })
);

module.exports = router;
