'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const { createStore } = require('./store');
const { importPackage } = require('./scorm');
const { GRADES, SUBJECTS, gradeById, subjectById } = require('./curriculum');

const SAMPLE_DIR = path.join(__dirname, '..', 'sample', 'grade9-science-atoms');

/**
 * Build the Express app.
 * opts.dataDir   where courses.json and extracted packages live
 * opts.adminKey  if set, uploads/deletes need header "x-admin-key"
 * opts.seed      import the Grade 9 Science sample when the catalogue is empty (default true)
 */
function createApp(opts = {}) {
  const dataDir = path.resolve(opts.dataDir || path.join(__dirname, '..', 'data'));
  const pkgDir = path.join(dataDir, 'packages');
  fs.mkdirSync(pkgDir, { recursive: true });
  const store = createStore(path.join(dataDir, 'db.json'));
  const db = store.data;
  const maxMb = Number(opts.maxUploadMb || process.env.MAX_UPLOAD_MB || 500);
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxMb * 1024 * 1024 },
  });

  function addCourse({ zipBuffer, grade, subject, title, description, fileName }) {
    if (!gradeById(grade)) throw httpError(400, `Unknown grade "${grade}".`);
    if (!subjectById(subject)) throw httpError(400, `Unknown subject "${subject}".`);
    const id = crypto.randomUUID();
    const dest = path.join(pkgDir, id);
    let info;
    try {
      info = importPackage(zipBuffer, dest);
    } catch (e) {
      fs.rmSync(dest, { recursive: true, force: true });
      throw e;
    }
    const course = {
      id,
      grade: String(grade),
      subject,
      title: (title || '').trim() || info.title || fileName || 'Untitled SCORM course',
      description: (description || '').trim(),
      scormVersion: info.version,
      launch: info.launch,
      fileName: fileName || null,
      sizeBytes: zipBuffer.length,
      createdAt: new Date().toISOString(),
    };
    db.courses.push(course);
    store.save();
    return course;
  }

  if (opts.seed !== false && db.courses.length === 0 && fs.existsSync(SAMPLE_DIR)) {
    const zip = new AdmZip();
    zip.addLocalFolder(SAMPLE_DIR);
    addCourse({
      zipBuffer: zip.toBuffer(),
      grade: '9',
      subject: 'science',
      title: 'Atoms, Elements & the Periodic Table',
      description: 'Grade 9 Physical Science — Unit 2. Interactive lesson with a 6-question check for understanding (pass mark 70%).',
      fileName: 'grade9-science-atoms.zip',
    });
    store.flush();
  }

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));

  const requireAdmin = (req, res, next) => {
    const key = opts.adminKey ?? process.env.ADMIN_KEY;
    if (!key || req.get('x-admin-key') === key) return next();
    res.status(401).json({ error: 'Teacher key required to change courses.' });
  };

  const withCounts = (c) => {
    const attempts = Object.values(db.attempts).filter((a) => a.courseId === c.id);
    return { ...c, learners: attempts.length, completed: attempts.filter(isDone).length };
  };

  // ---- Catalogue ---------------------------------------------------------
  app.get('/api/config', (req, res) => {
    res.json({ needsAdminKey: Boolean(opts.adminKey ?? process.env.ADMIN_KEY), maxUploadMb: maxMb });
  });

  app.get('/api/curriculum', (req, res) => {
    res.json({
      subjects: SUBJECTS,
      grades: GRADES.map((g) => {
        const courses = db.courses.filter((c) => c.grade === g.id);
        return {
          ...g,
          courseCount: courses.length,
          subjects: SUBJECTS.map((s) => ({ id: s.id, courseCount: courses.filter((c) => c.subject === s.id).length })),
        };
      }),
    });
  });

  app.get('/api/courses', (req, res) => {
    let list = db.courses;
    if (req.query.grade) list = list.filter((c) => c.grade === String(req.query.grade));
    if (req.query.subject) list = list.filter((c) => c.subject === req.query.subject);
    res.json(list.map(withCounts));
  });

  app.get('/api/courses/:id', (req, res) => {
    const c = findCourse(req.params.id);
    res.json(withCounts(c));
  });

  app.post('/api/courses', requireAdmin, upload.single('package'), (req, res) => {
    if (!req.file) throw httpError(400, 'Attach a SCORM .zip file in the "package" field.');
    if (!/\.zip$/i.test(req.file.originalname) && req.file.mimetype !== 'application/zip') {
      throw httpError(400, 'SCORM packages must be .zip files.');
    }
    const course = addCourse({
      zipBuffer: req.file.buffer,
      grade: req.body.grade,
      subject: req.body.subject,
      title: req.body.title,
      description: req.body.description,
      fileName: req.file.originalname,
    });
    res.status(201).json(course);
  });

  app.patch('/api/courses/:id', requireAdmin, (req, res) => {
    const c = findCourse(req.params.id);
    const { title, description, grade, subject } = req.body || {};
    if (grade !== undefined) { if (!gradeById(grade)) throw httpError(400, 'Unknown grade.'); c.grade = String(grade); }
    if (subject !== undefined) { if (!subjectById(subject)) throw httpError(400, 'Unknown subject.'); c.subject = subject; }
    if (typeof title === 'string' && title.trim()) c.title = title.trim();
    if (typeof description === 'string') c.description = description.trim();
    store.save();
    res.json(c);
  });

  app.delete('/api/courses/:id', requireAdmin, (req, res) => {
    const c = findCourse(req.params.id);
    db.courses = db.courses.filter((x) => x.id !== c.id);
    for (const k of Object.keys(db.attempts)) if (db.attempts[k].courseId === c.id) delete db.attempts[k];
    fs.rmSync(path.join(pkgDir, c.id), { recursive: true, force: true });
    store.save();
    res.json({ ok: true });
  });

  // ---- SCORM content (served same-origin so the SCO can reach window.API) --
  app.get('/content/:id/*', (req, res) => {
    const c = findCourse(req.params.id);
    const root = path.join(pkgDir, c.id);
    const rel = req.params[0] || '';
    const file = path.resolve(root, rel);
    if (!file.startsWith(root + path.sep)) throw httpError(400, 'Bad path.');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw httpError(404, 'File not found in package.');
    res.sendFile(file);
  });

  // ---- SCORM runtime data (cmi.*) per learner ---------------------------
  const learnerKey = (req) => {
    const name = String(req.query.learner || req.body?.learnerName || '').trim();
    if (!name) throw httpError(400, 'Learner name is required.');
    return { name: name.slice(0, 80), id: name.toLowerCase().replace(/\s+/g, ' ').slice(0, 80) };
  };

  app.get('/api/courses/:id/attempt', (req, res) => {
    const c = findCourse(req.params.id);
    const l = learnerKey(req);
    res.json(db.attempts[`${c.id}:${l.id}`] || null);
  });

  app.post('/api/courses/:id/attempt', (req, res) => {
    const c = findCourse(req.params.id);
    const l = learnerKey(req);
    const key = `${c.id}:${l.id}`;
    const cmi = req.body?.cmi;
    if (!cmi || typeof cmi !== 'object') throw httpError(400, 'Body must include a "cmi" object.');
    const prev = db.attempts[key] || { courseId: c.id, learnerId: l.id, learnerName: l.name, startedAt: new Date().toISOString(), sessions: 0 };
    const next = {
      ...prev,
      learnerName: l.name,
      cmi: sanitizeCmi(cmi),
      updatedAt: new Date().toISOString(),
      sessions: prev.sessions + (req.body.newSession ? 1 : 0),
    };
    db.attempts[key] = next;
    store.save();
    res.json(next);
  });

  app.get('/api/reports', (req, res) => {
    const rows = Object.values(db.attempts).map((a) => {
      const c = db.courses.find((x) => x.id === a.courseId);
      return {
        courseId: a.courseId,
        courseTitle: c?.title,
        grade: c?.grade,
        subject: c?.subject,
        learnerName: a.learnerName,
        status: a.cmi?.lesson_status || 'not attempted',
        score: a.cmi?.score_raw ?? null,
        totalTime: a.cmi?.total_time || '0000:00:00',
        sessions: a.sessions,
        updatedAt: a.updatedAt,
      };
    }).filter((r) => r.courseTitle)
      .filter((r) => !req.query.courseId || r.courseId === req.query.courseId)
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    res.json(rows);
  });

  // ---- Static front-end ------------------------------------------------
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.get('/sample/grade9-science-atoms.zip', (req, res) => {
    const zip = new AdmZip();
    zip.addLocalFolder(SAMPLE_DIR);
    res.type('application/zip').attachment('grade9-science-atoms.zip').send(zip.toBuffer());
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
    if (status >= 500) console.error(err);
    const msg = err.code === 'LIMIT_FILE_SIZE' ? `File is larger than ${maxMb} MB.` : err.message || 'Server error';
    res.status(status).json({ error: msg });
  });

  function findCourse(id) {
    const c = db.courses.find((x) => x.id === id);
    if (!c) throw httpError(404, 'Course not found.');
    return c;
  }

  app.locals.store = store;
  return app;
}

// Keep only the SCORM 1.2 / 2004 fields we persist, as strings, with size caps.
const CMI_FIELDS = [
  'lesson_status', 'completion_status', 'success_status', 'score_raw', 'score_min', 'score_max', 'score_scaled',
  'lesson_location', 'suspend_data', 'total_time', 'entry', 'exit', 'interactions',
];
function sanitizeCmi(cmi) {
  const out = {};
  for (const k of CMI_FIELDS) {
    if (cmi[k] === undefined || cmi[k] === null) continue;
    if (k === 'interactions') {
      out.interactions = Array.isArray(cmi.interactions)
        ? cmi.interactions.slice(0, 250).map((i) => Object.fromEntries(Object.entries(i || {}).map(([a, b]) => [a, String(b).slice(0, 4000)])))
        : [];
      continue;
    }
    out[k] = String(cmi[k]).slice(0, k === 'suspend_data' ? 64000 : 4000);
  }
  return out;
}

const isDone = (a) => ['completed', 'passed'].includes(a.cmi?.lesson_status) ||
  a.cmi?.completion_status === 'completed';

function httpError(status, message) { return Object.assign(new Error(message), { status }); }

module.exports = { createApp };
