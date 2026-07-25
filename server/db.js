'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, '..', 'data');

const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const SCORM_DIR = path.join(DATA_DIR, 'scorm');
const TMP_DIR = path.join(DATA_DIR, 'tmp');

for (const dir of [DATA_DIR, UPLOAD_DIR, SCORM_DIR, TMP_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(path.join(DATA_DIR, 'manhaj.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin','teacher','student')),
  age           INTEGER,
  year_id       INTEGER REFERENCES years(id) ON DELETE SET NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

-- سنة دراسية / مستوى عمري
CREATE TABLE IF NOT EXISTS years (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  title           TEXT NOT NULL,
  age_min         INTEGER NOT NULL,
  age_max         INTEGER NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  total_hours     INTEGER NOT NULL DEFAULT 300,
  session_minutes INTEGER NOT NULL DEFAULT 60,
  order_index     INTEGER NOT NULL DEFAULT 0,
  is_published    INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- المواد: فقه، قرآن، عقيدة، سيرة، أخلاق (قابلة للتوسعة)
CREATE TABLE IF NOT EXISTS subjects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  year_id     INTEGER NOT NULL REFERENCES years(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT '📘',
  color       TEXT NOT NULL DEFAULT '#3f7d5f',
  share       INTEGER NOT NULL DEFAULT 20,
  order_index INTEGER NOT NULL DEFAULT 0,
  UNIQUE (year_id, key)
);

-- الحصص (الساعات التدريسية)
CREATE TABLE IF NOT EXISTS class_sessions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  year_id          INTEGER NOT NULL REFERENCES years(id) ON DELETE CASCADE,
  subject_id       INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  seq              INTEGER NOT NULL DEFAULT 1,
  global_seq       INTEGER NOT NULL DEFAULT 1,
  title            TEXT NOT NULL,
  objectives       TEXT NOT NULL DEFAULT '',
  summary          TEXT NOT NULL DEFAULT '',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  is_published     INTEGER NOT NULL DEFAULT 1,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_year    ON class_sessions(year_id, global_seq);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON class_sessions(subject_id, seq);

-- المرفقات: pdf / video / audio / image / office / scorm / text / html / link
CREATE TABLE IF NOT EXISTS resources (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  INTEGER NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('pdf','video','audio','image','office','scorm','text','html','link')),
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  file_name   TEXT,
  file_path   TEXT,
  mime        TEXT,
  size_bytes  INTEGER,
  text_content TEXT,
  external_url TEXT,
  launch_path  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_resources_session ON resources(session_id, order_index);

CREATE TABLE IF NOT EXISTS progress (
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id    INTEGER NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed')),
  seconds_spent INTEGER NOT NULL DEFAULT 0,
  completed_at  TEXT,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, session_id)
);

CREATE TABLE IF NOT EXISTS scorm_tracking (
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id   INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  lesson_status TEXT NOT NULL DEFAULT 'not attempted',
  score_raw     REAL,
  score_min     REAL,
  score_max     REAL,
  total_time    TEXT NOT NULL DEFAULT '0000:00:00',
  location      TEXT NOT NULL DEFAULT '',
  suspend_data  TEXT NOT NULL DEFAULT '',
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, resource_id)
);
`);

module.exports = { db, DATA_DIR, UPLOAD_DIR, SCORM_DIR, TMP_DIR };
