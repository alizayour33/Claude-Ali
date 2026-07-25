'use strict';

const fs = require('fs');
const path = require('path');

/** يلتف على معالِج async ليُمرَّر أي خطأ إلى معالج أخطاء Express. */
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const bad = (msg) => new HttpError(400, msg);
const notFound = (msg = 'العنصر غير موجود') => new HttpError(404, msg);

const EXT_KINDS = {
  pdf: 'pdf',
  mp4: 'video', webm: 'video', ogv: 'video', mov: 'video', m4v: 'video', mkv: 'video', avi: 'video',
  mp3: 'audio', m4a: 'audio', aac: 'audio', wav: 'audio', ogg: 'audio', oga: 'audio', opus: 'audio',
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', svg: 'image', avif: 'image', bmp: 'image',
  doc: 'office', docx: 'office', dot: 'office', dotx: 'office', rtf: 'office',
  xls: 'office', xlsx: 'office', xlsm: 'office', csv: 'office',
  ppt: 'office', pptx: 'office', ppsx: 'office',
  odt: 'office', ods: 'office', odp: 'office',
  htm: 'html', html: 'html',
  txt: 'text', md: 'text',
  zip: 'scorm',
};

const MIMES = {
  pdf: 'application/pdf',
  mp4: 'video/mp4', webm: 'video/webm', ogv: 'video/ogg', mov: 'video/quicktime', m4v: 'video/x-m4v', mkv: 'video/x-matroska',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/opus',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp',
  svg: 'image/svg+xml', avif: 'image/avif', bmp: 'image/bmp',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',
  rtf: 'application/rtf', csv: 'text/csv',
  htm: 'text/html', html: 'text/html', txt: 'text/plain; charset=utf-8', md: 'text/markdown; charset=utf-8',
  js: 'text/javascript', css: 'text/css', json: 'application/json', xml: 'application/xml',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', eot: 'application/vnd.ms-fontobject',
  swf: 'application/x-shockwave-flash', zip: 'application/zip',
};

const ext = (name) => path.extname(String(name || '')).replace('.', '').toLowerCase();
const kindFromName = (name) => EXT_KINDS[ext(name)] || null;
const mimeFromName = (name) => MIMES[ext(name)] || 'application/octet-stream';

/** اسم ملف آمن للتخزين على القرص (يمنع الخروج من المجلد). */
function safeFileName(name) {
  const base = path.basename(String(name || 'file')).replace(/[\x00-\x1f\\/:*?"<>|]/g, '_');
  return base.slice(0, 180) || 'file';
}

/** بثّ ملف مع دعم Range حتى يعمل التقديم/الترجيع في الفيديو والصوت على الجوال. */
function streamFile(req, res, filePath, { mime, download = false, fileName } = {}) {
  const stat = fs.statSync(filePath);
  const type = mime || mimeFromName(filePath);
  const disposition = download
    ? `attachment; filename*=UTF-8''${encodeURIComponent(fileName || path.basename(filePath))}`
    : `inline; filename*=UTF-8''${encodeURIComponent(fileName || path.basename(filePath))}`;

  res.setHeader('Content-Type', type);
  res.setHeader('Content-Disposition', disposition);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.setHeader('Last-Modified', stat.mtime.toUTCString());

  const range = req.headers.range;
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (m) {
      let start = m[1] ? parseInt(m[1], 10) : 0;
      let end = m[2] ? parseInt(m[2], 10) : stat.size - 1;
      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= stat.size) {
        res.status(416).setHeader('Content-Range', `bytes */${stat.size}`);
        return res.end();
      }
      end = Math.min(end, stat.size - 1);
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
      res.setHeader('Content-Length', end - start + 1);
      return fs.createReadStream(filePath, { start, end }).pipe(res);
    }
  }

  res.setHeader('Content-Length', stat.size);
  if (req.method === 'HEAD') return res.end();
  return fs.createReadStream(filePath).pipe(res);
}

/** يمنع الخروج من المجلد الجذر عبر ../ في مسارات SCORM. */
function resolveWithin(rootDir, relative) {
  const target = path.resolve(rootDir, '.' + path.sep + String(relative || '').replace(/^[/\\]+/, ''));
  const root = path.resolve(rootDir);
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  return target;
}

const attr = (tag, name) => {
  const m = new RegExp(`${name}\\s*=\\s*"([^"]*)"|${name}\\s*=\\s*'([^']*)'`, 'i').exec(tag);
  return m ? (m[1] ?? m[2] ?? '') : '';
};

/**
 * يستخرج نقطة انطلاق حزمة SCORM من imsmanifest.xml (يدعم SCORM 1.2 و2004).
 * يرجع مساراً نسبياً داخل مجلد الحزمة، أو null.
 */
function findScormLaunch(rootDir) {
  const manifestPath = resolveWithin(rootDir, 'imsmanifest.xml');
  if (manifestPath && fs.existsSync(manifestPath)) {
    const xml = fs.readFileSync(manifestPath, 'utf8');

    const resourcesTag = /<resources\b[^>]*>/i.exec(xml);
    const resourcesBase = resourcesTag ? attr(resourcesTag[0], 'xml:base') : '';

    const byId = new Map();
    for (const m of xml.matchAll(/<resource\b[^>]*>/gi)) {
      const id = attr(m[0], 'identifier');
      const href = attr(m[0], 'href');
      const base = attr(m[0], 'xml:base');
      if (id) byId.set(id, { href, base });
    }

    const orgsTag = /<organizations\b[^>]*>/i.exec(xml);
    const defaultOrg = orgsTag ? attr(orgsTag[0], 'default') : '';
    let scope = xml;
    if (defaultOrg) {
      const orgRe = new RegExp(
        `<organization\\b[^>]*identifier\\s*=\\s*["']${defaultOrg}["'][^>]*>([\\s\\S]*?)</organization>`,
        'i'
      );
      const found = orgRe.exec(xml);
      if (found) scope = found[1];
    }

    for (const m of scope.matchAll(/<item\b[^>]*>/gi)) {
      const ref = attr(m[0], 'identifierref');
      const entry = ref && byId.get(ref);
      if (entry?.href) {
        const rel = decodeURIComponent(
          [resourcesBase, entry.base, entry.href].filter(Boolean).join('').replace(/\/{2,}/g, '/')
        );
        if (resolveWithin(rootDir, rel.split('?')[0]) && fs.existsSync(resolveWithin(rootDir, rel.split('?')[0]))) {
          return rel;
        }
      }
    }
    for (const entry of byId.values()) {
      if (entry.href && /\.html?(\?|$)/i.test(entry.href)) {
        const rel = decodeURIComponent([resourcesBase, entry.base, entry.href].filter(Boolean).join(''));
        const abs = resolveWithin(rootDir, rel.split('?')[0]);
        if (abs && fs.existsSync(abs)) return rel;
      }
    }
  }

  // لا مانيفست صالح: نبحث عن ملف بداية معروف
  const candidates = ['index.html', 'index_lms.html', 'story.html', 'story_html5.html', 'launch.html', 'default.html', 'index.htm', 'scormdriver/indexAPI.html'];
  for (const name of candidates) {
    const abs = resolveWithin(rootDir, name);
    if (abs && fs.existsSync(abs)) return name;
  }
  const walk = (dir, depth = 0) => {
    if (depth > 3) return null;
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return null;
    }
    for (const e of entries) {
      if (e.isFile() && /\.html?$/i.test(e.name)) return path.relative(rootDir, path.join(dir, e.name));
    }
    for (const e of entries) {
      if (e.isDirectory()) {
        const hit = walk(path.join(dir, e.name), depth + 1);
        if (hit) return hit;
      }
    }
    return null;
  };
  const found = walk(rootDir);
  return found ? found.split(path.sep).join('/') : null;
}

/** حذف ملف/مجلد بهدوء (يُستخدم عند حذف مرفق). */
function removeQuietly(target) {
  if (!target) return;
  try {
    fs.rmSync(target, { recursive: true, force: true });
  } catch {
    /* تجاهل */
  }
}

const clampInt = (value, min, max, fallback) => {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const bool = (v) => v === true || v === 1 || v === '1' || v === 'true' || v === 'on';

module.exports = {
  wrap,
  HttpError,
  bad,
  notFound,
  ext,
  kindFromName,
  mimeFromName,
  safeFileName,
  streamFile,
  resolveWithin,
  findScormLaunch,
  removeQuietly,
  clampInt,
  bool,
};
