'use strict';

const crypto = require('crypto');
const { db } = require('./db');

const SESSION_DAYS = 30;
const COOKIE = 'manhaj_sid';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${key}`;
}

function verifyPassword(password, stored) {
  const [scheme, salt, key] = String(stored || '').split('$');
  if (scheme !== 'scrypt' || !salt || !key) return false;
  const expected = Buffer.from(key, 'hex');
  const actual = crypto.scryptSync(password, salt, expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

const insertSession = db.prepare(
  `INSERT INTO auth_sessions (token, user_id, expires_at)
   VALUES (?, ?, datetime('now', '+${SESSION_DAYS} days'))`
);
const deleteSession = db.prepare('DELETE FROM auth_sessions WHERE token = ?');
const findSession = db.prepare(`
  SELECT u.id, u.username, u.full_name, u.role, u.age, u.year_id
  FROM auth_sessions s JOIN users u ON u.id = s.user_id
  WHERE s.token = ? AND s.expires_at > datetime('now')`);

function startSession(res, userId) {
  db.prepare("DELETE FROM auth_sessions WHERE expires_at <= datetime('now')").run();
  const token = crypto.randomBytes(32).toString('hex');
  insertSession.run(token, userId);
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    secure: process.env.COOKIE_SECURE === '1',
    path: '/',
  });
  return token;
}

function endSession(req, res) {
  const token = req.cookies?.[COOKIE];
  if (token) deleteSession.run(token);
  res.clearCookie(COOKIE, { path: '/' });
}

/** Populates req.user when a valid session cookie is present. */
function attachUser(req, _res, next) {
  const token = req.cookies?.[COOKIE];
  req.user = token ? findSession.get(token) || null : null;
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'يجب تسجيل الدخول' });
  next();
}

/** Staff = admin or teacher; the only roles allowed to change curriculum content. */
function requireStaff(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'يجب تسجيل الدخول' });
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'هذه العملية متاحة للمشرفين والمعلمين فقط' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'يجب تسجيل الدخول' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'هذه العملية متاحة للمشرف فقط' });
  next();
}

const isStaff = (user) => !!user && (user.role === 'admin' || user.role === 'teacher');

module.exports = {
  COOKIE,
  hashPassword,
  verifyPassword,
  startSession,
  endSession,
  attachUser,
  requireAuth,
  requireStaff,
  requireAdmin,
  isStaff,
};
