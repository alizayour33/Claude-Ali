'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');

const { db, UPLOAD_DIR, SCORM_DIR, TMP_DIR } = require('../db');
const { requireStaff, requireAuth, isStaff } = require('../auth');
const {
  wrap, bad, notFound, kindFromName, mimeFromName, safeFileName,
  streamFile, resolveWithin, findScormLaunch, removeQuietly, clampInt, ext,
} = require('../util');

const router = express.Router();

const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 1024);
const KINDS = ['pdf', 'video', 'audio', 'image', 'office', 'scorm', 'text', 'html', 'link'];

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, TMP_DIR),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname || '')}`),
  }),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024, files: 20 },
});

/** يتحقق أن المرفق متاح للمستخدم الحالي (المنشور فقط لغير المشرفين). */
function loadResource(req, id) {
  const row = db
    .prepare(
      `SELECT r.*, c.is_published AS session_published, c.title AS session_title, y.is_published AS year_published
       FROM resources r
       JOIN class_sessions c ON c.id = r.session_id
       JOIN years y ON y.id = c.year_id
       WHERE r.id = ?`
    )
    .get(Number(id));
  if (!row) throw notFound('المرفق غير موجود');
  if ((!row.session_published || !row.year_published) && !isStaff(req.user)) throw notFound('المرفق غير متاح');
  return row;
}

const publicResource = (r) => ({
  ...r,
  url: r.file_path ? `/api/resources/${r.id}/file` : r.external_url || null,
  download_url: r.file_path ? `/api/resources/${r.id}/file?download=1` : null,
  scorm_url: r.kind === 'scorm' && r.launch_path ? `/api/scorm/${r.id}/content/${r.launch_path}` : null,
});

/* ------------------------------ إضافة مرفقات ------------------------------ */

/**
 * إضافة مرفق واحد أو أكثر إلى حصة.
 * - بملفات: multipart/form-data مع الحقل files (حتى ٢٠ ملفاً)
 * - بدون ملف: نص أو HTML أو رابط خارجي
 */
router.post(
  '/sessions/:id/resources',
  requireStaff,
  upload.array('files', 20),
  wrap((req, res) => {
    const session = db.prepare('SELECT * FROM class_sessions WHERE id = ?').get(Number(req.params.id));
    if (!session) {
      (req.files || []).forEach((f) => removeQuietly(f.path));
      throw notFound('الحصة غير موجودة');
    }

    const files = req.files || [];
    const requestedKind = KINDS.includes(req.body.kind) ? req.body.kind : null;
    const created = [];
    let order = db
      .prepare('SELECT COALESCE(MAX(order_index), -1) + 1 AS n FROM resources WHERE session_id = ?')
      .get(session.id).n;

    const insert = db.prepare(
      `INSERT INTO resources (session_id, kind, title, description, order_index, file_name, file_path,
                              mime, size_bytes, text_content, external_url, launch_path)
       VALUES (@session_id, @kind, @title, @description, @order_index, @file_name, @file_path,
               @mime, @size_bytes, @text_content, @external_url, @launch_path)`
    );

    if (!files.length) {
      const kind = requestedKind || 'text';
      const title = String(req.body.title || '').trim();
      if (!title) throw bad('عنوان المرفق مطلوب');
      if (kind === 'link') {
        const url = String(req.body.external_url || '').trim();
        if (!/^https?:\/\//i.test(url)) throw bad('الرابط يجب أن يبدأ بـ http أو https');
        const info = insert.run({
          session_id: session.id, kind, title, description: String(req.body.description || ''),
          order_index: order, file_name: null, file_path: null, mime: null, size_bytes: null,
          text_content: null, external_url: url, launch_path: null,
        });
        created.push(db.prepare('SELECT * FROM resources WHERE id = ?').get(info.lastInsertRowid));
      } else if (kind === 'text' || kind === 'html') {
        const content = String(req.body.text_content || '');
        if (!content.trim()) throw bad('محتوى المرفق مطلوب');
        const info = insert.run({
          session_id: session.id, kind, title, description: String(req.body.description || ''),
          order_index: order, file_name: null, file_path: null, mime: null, size_bytes: null,
          text_content: content, external_url: null, launch_path: null,
        });
        created.push(db.prepare('SELECT * FROM resources WHERE id = ?').get(info.lastInsertRowid));
      } else {
        throw bad('لم يتم إرسال أي ملف');
      }
      return res.status(201).json({ resources: created.map(publicResource) });
    }

    for (const [i, file] of files.entries()) {
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const kind = requestedKind || kindFromName(originalName) || 'office';
      const title = files.length === 1 && req.body.title?.trim()
        ? String(req.body.title).trim()
        : path.parse(originalName).name || `مرفق ${order + 1}`;

      const info = insert.run({
        session_id: session.id,
        kind,
        title,
        description: String(req.body.description || ''),
        order_index: order + i,
        file_name: originalName,
        file_path: null,
        mime: file.mimetype && file.mimetype !== 'application/octet-stream' ? file.mimetype : mimeFromName(originalName),
        size_bytes: file.size,
        text_content: null,
        external_url: null,
        launch_path: null,
      });
      const resourceId = Number(info.lastInsertRowid);

      try {
        if (kind === 'scorm' && ext(originalName) === 'zip') {
          const dir = path.join(SCORM_DIR, String(resourceId));
          fs.mkdirSync(dir, { recursive: true });
          const zip = new AdmZip(file.path);
          for (const entry of zip.getEntries()) {
            const target = resolveWithin(dir, entry.entryName);
            if (!target) continue; // مسار خارج المجلد: تجاهل
            if (entry.isDirectory) {
              fs.mkdirSync(target, { recursive: true });
            } else {
              fs.mkdirSync(path.dirname(target), { recursive: true });
              fs.writeFileSync(target, entry.getData());
            }
          }
          // نحفظ الحزمة الأصلية بجانب المجلد المستخرج ليتمكّن المعلم من تنزيلها
          fs.renameSync(file.path, `${dir}.zip`);
          const launch = findScormLaunch(dir);
          db.prepare('UPDATE resources SET file_path = ?, launch_path = ? WHERE id = ?').run(dir, launch, resourceId);
        } else {
          const dir = path.join(UPLOAD_DIR, String(resourceId));
          fs.mkdirSync(dir, { recursive: true });
          const dest = path.join(dir, safeFileName(originalName));
          fs.renameSync(file.path, dest);
          db.prepare('UPDATE resources SET file_path = ? WHERE id = ?').run(dest, resourceId);
        }
      } catch (err) {
        db.prepare('DELETE FROM resources WHERE id = ?').run(resourceId);
        removeQuietly(file.path);
        throw bad(`تعذّر معالجة الملف «${originalName}»: ${err.message}`);
      }
      created.push(db.prepare('SELECT * FROM resources WHERE id = ?').get(resourceId));
    }

    res.status(201).json({ resources: created.map(publicResource) });
  })
);

router.patch(
  '/resources/:id',
  requireStaff,
  wrap((req, res) => {
    const r = db.prepare('SELECT * FROM resources WHERE id = ?').get(Number(req.params.id));
    if (!r) throw notFound('المرفق غير موجود');
    db.prepare(
      `UPDATE resources SET title = ?, description = ?, text_content = ?, external_url = ?, order_index = ? WHERE id = ?`
    ).run(
      req.body.title != null ? String(req.body.title).trim() || r.title : r.title,
      req.body.description != null ? String(req.body.description) : r.description,
      req.body.text_content != null ? String(req.body.text_content) : r.text_content,
      req.body.external_url != null ? String(req.body.external_url) : r.external_url,
      req.body.order_index != null ? clampInt(req.body.order_index, 0, 9999, r.order_index) : r.order_index,
      r.id
    );
    res.json({ resource: publicResource(db.prepare('SELECT * FROM resources WHERE id = ?').get(r.id)) });
  })
);

router.post(
  '/resources/:id/move',
  requireStaff,
  wrap((req, res) => {
    const r = db.prepare('SELECT * FROM resources WHERE id = ?').get(Number(req.params.id));
    if (!r) throw notFound('المرفق غير موجود');
    const up = String(req.body.direction || 'up') === 'up';
    const other = db
      .prepare(
        `SELECT * FROM resources WHERE session_id = ? AND order_index ${up ? '<' : '>'} ?
         ORDER BY order_index ${up ? 'DESC' : 'ASC'} LIMIT 1`
      )
      .get(r.session_id, r.order_index);
    if (!other) return res.json({ ok: true, moved: false });
    db.transaction(() => {
      db.prepare('UPDATE resources SET order_index = ? WHERE id = ?').run(other.order_index, r.id);
      db.prepare('UPDATE resources SET order_index = ? WHERE id = ?').run(r.order_index, other.id);
    })();
    res.json({ ok: true, moved: true });
  })
);

router.delete(
  '/resources/:id',
  requireStaff,
  wrap((req, res) => {
    const r = db.prepare('SELECT * FROM resources WHERE id = ?').get(Number(req.params.id));
    if (!r) throw notFound('المرفق غير موجود');
    db.prepare('DELETE FROM resources WHERE id = ?').run(r.id);
    if (r.file_path) {
      if (r.kind === 'scorm') {
        removeQuietly(r.file_path);
        removeQuietly(`${r.file_path}.zip`);
      } else {
        removeQuietly(path.dirname(r.file_path));
      }
    }
    res.json({ ok: true });
  })
);

/* ------------------------------ تشغيل المرفقات ------------------------------ */

router.get(
  '/resources/:id/file',
  wrap((req, res) => {
    const r = loadResource(req, req.params.id);
    if (!r.file_path) throw notFound('لا يوجد ملف لهذا المرفق');
    // حزم SCORM تُنزَّل بصيغتها الأصلية (ZIP) بجانب مجلدها المستخرج
    const target = r.kind === 'scorm' ? `${r.file_path}.zip` : r.file_path;
    if (!fs.existsSync(target)) throw notFound('الملف غير موجود على السيرفر');
    streamFile(req, res, target, {
      mime: r.mime || mimeFromName(r.file_name),
      download: req.query.download === '1' || r.kind === 'office',
      fileName: r.file_name,
    });
  })
);

/** ملفات حزمة SCORM المستخرجة. */
router.get(
  '/scorm/:id/content/*',
  wrap((req, res) => {
    const r = loadResource(req, req.params.id);
    if (r.kind !== 'scorm' || !r.file_path) throw notFound('ليست حزمة SCORM');
    const rel = decodeURIComponent(req.params[0] || '').split('?')[0];
    const target = resolveWithin(r.file_path, rel);
    if (!target || !fs.existsSync(target) || fs.statSync(target).isDirectory()) throw notFound('الملف غير موجود في الحزمة');
    streamFile(req, res, target, { mime: mimeFromName(target) });
  })
);

/** بيانات المرفق للمشغّل (يُستخدم في صفحة تشغيل SCORM). */
router.get(
  '/scorm/:id/meta',
  wrap((req, res) => {
    const r = loadResource(req, req.params.id);
    if (r.kind !== 'scorm') throw notFound('ليست حزمة SCORM');
    res.json({
      resource: {
        id: r.id,
        title: r.title,
        session_id: r.session_id,
        session_title: r.session_title,
        launch_url: r.launch_path ? `/api/scorm/${r.id}/content/${r.launch_path}` : null,
      },
      tracking: req.user
        ? db.prepare('SELECT * FROM scorm_tracking WHERE user_id = ? AND resource_id = ?').get(req.user.id, r.id) || null
        : null,
    });
  })
);

/** حفظ نتائج SCORM (LMSCommit / Commit). */
router.post(
  '/scorm/:id/tracking',
  requireAuth,
  wrap((req, res) => {
    const r = loadResource(req, req.params.id);
    if (r.kind !== 'scorm') throw notFound('ليست حزمة SCORM');
    const current =
      db.prepare('SELECT * FROM scorm_tracking WHERE user_id = ? AND resource_id = ?').get(req.user.id, r.id) || {};
    const num = (v, fallback) => (v === '' || v == null || Number.isNaN(Number(v)) ? fallback ?? null : Number(v));
    const status = String(req.body.lesson_status || current.lesson_status || 'not attempted').toLowerCase();

    db.prepare(
      `INSERT INTO scorm_tracking (user_id, resource_id, lesson_status, score_raw, score_min, score_max,
                                   total_time, location, suspend_data, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id, resource_id) DO UPDATE SET
         lesson_status = excluded.lesson_status, score_raw = excluded.score_raw,
         score_min = excluded.score_min, score_max = excluded.score_max,
         total_time = excluded.total_time, location = excluded.location,
         suspend_data = excluded.suspend_data, updated_at = datetime('now')`
    ).run(
      req.user.id, r.id, status,
      num(req.body.score_raw, current.score_raw), num(req.body.score_min, current.score_min ?? 0),
      num(req.body.score_max, current.score_max ?? 100),
      String(req.body.total_time || current.total_time || '0000:00:00'),
      String(req.body.location ?? current.location ?? ''),
      String(req.body.suspend_data ?? current.suspend_data ?? '')
    );

    // إكمال الحزمة يُعلِّم الحصة كمنجزة تلقائياً
    if (['completed', 'passed'].includes(status)) {
      db.prepare(
        `INSERT INTO progress (user_id, session_id, status, completed_at, updated_at)
         VALUES (?, ?, 'completed', datetime('now'), datetime('now'))
         ON CONFLICT(user_id, session_id) DO UPDATE SET
           status = 'completed', completed_at = COALESCE(progress.completed_at, datetime('now')),
           updated_at = datetime('now')`
      ).run(req.user.id, r.session_id);
    }

    res.json({
      tracking: db.prepare('SELECT * FROM scorm_tracking WHERE user_id = ? AND resource_id = ?').get(req.user.id, r.id),
    });
  })
);

module.exports = router;
