'use strict';

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const { db, driver } = require('./db');
const { attachUser } = require('./auth');
const { HttpError } = require('./util');
const { ensureSeed } = require('./seed');

const authRoutes = require('./routes/auth');
const curriculumRoutes = require('./routes/curriculum');
const resourceRoutes = require('./routes/resources');
const progressRoutes = require('./routes/progress');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const app = express();
app.set('trust proxy', true);
app.disable('x-powered-by');

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(attachUser);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    years: db.prepare('SELECT COUNT(*) AS c FROM years').get().c,
    sessions: db.prepare('SELECT COUNT(*) AS c FROM class_sessions').get().c,
    resources: db.prepare('SELECT COUNT(*) AS c FROM resources').get().c,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', curriculumRoutes);
app.use('/api', resourceRoutes);
app.use('/api', progressRoutes);

// مشغّل حزم SCORM يعمل داخل إطار مستقل
app.get('/scorm/play', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'scorm', 'player.html')));

app.use(
  express.static(PUBLIC_DIR, {
    index: 'index.html',
    setHeaders: (res, filePath) => {
      if (/\.(html|webmanifest)$/.test(filePath) || filePath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

// أي مسار غير معروف (خارج /api) يعيد تطبيق الواجهة ليتولّى التوجيه
app.get(/^\/(?!api\/).*/, (req, res, next) => {
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.use((req, res) => res.status(404).json({ error: 'المسار غير موجود' }));

// معالج الأخطاء: يوحّد شكل الرسائل ويحوّل أخطاء الرفع إلى رسائل عربية
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const map = {
      LIMIT_FILE_SIZE: `حجم الملف أكبر من الحد المسموح (${process.env.MAX_UPLOAD_MB || 1024} ميجابايت)`,
      LIMIT_FILE_COUNT: 'عدد الملفات أكبر من الحد المسموح',
      LIMIT_UNEXPECTED_FILE: 'حقل ملفات غير متوقّع',
    };
    return res.status(400).json({ error: map[err.code] || 'تعذّر رفع الملف' });
  }
  const status = err instanceof HttpError ? err.status : err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || 'خطأ غير متوقّع' });
});

if (require.main === module) {
  ensureSeed();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`منهاج يعمل على http://localhost:${PORT}  (SQLite: ${driver})`);
  });
}

module.exports = app;
