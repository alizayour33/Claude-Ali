'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AdmZip = require('adm-zip');
const { createApp } = require('../server/app');
const { parseManifest } = require('../server/scorm');

function start(opts = {}) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'k12lms-'));
  const app = createApp({ dataDir, ...opts });
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const base = `http://127.0.0.1:${server.address().port}`;
      resolve({ base, close: () => { server.close(); app.locals.store.flush(); fs.rmSync(dataDir, { recursive: true, force: true }); } });
    });
  });
}

function zipOf(files) {
  const z = new AdmZip();
  for (const [name, content] of Object.entries(files)) z.addFile(name, Buffer.from(content));
  return z.toBuffer();
}

async function upload(base, buf, fields = {}, headers = {}) {
  const fd = new FormData();
  fd.append('package', new Blob([buf], { type: 'application/zip' }), 'pkg.zip');
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  const res = await fetch(`${base}/api/courses`, { method: 'POST', body: fd, headers });
  return { status: res.status, body: await res.json() };
}

const MANIFEST_2004 = `<?xml version="1.0"?>
<manifest identifier="m" xmlns="http://www.imsglobal.org/xsd/imscp_v1p1" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3">
 <metadata><schema>ADL SCORM</schema><schemaversion>2004 4th Edition</schemaversion></metadata>
 <organizations default="o2"><organization identifier="o1"><title>Wrong</title><item identifier="i0" identifierref="r0"><title>x</title></item></organization>
 <organization identifier="o2"><title>Photosynthesis</title><item identifier="i1" identifierref="r1"><title>Lesson</title></item></organization></organizations>
 <resources xml:base="content/"><resource identifier="r0" adlcp:scormType="sco" href="wrong.html"/>
 <resource identifier="r1" adlcp:scormType="sco" href="start.html"/></resources>
</manifest>`;

test('parses SCORM 2004 manifests: default org, xml:base and version', () => {
  const info = parseManifest(MANIFEST_2004);
  assert.equal(info.version, '2004');
  assert.equal(info.title, 'Photosynthesis');
  assert.equal(info.launch, 'content/start.html');
});

test('seeds the Grade 9 Science SCORM 1.2 sample and serves its launch file', async () => {
  const s = await start();
  try {
    const list = await (await fetch(`${s.base}/api/courses?grade=9&subject=science`)).json();
    assert.equal(list.length, 1);
    assert.equal(list[0].scormVersion, '1.2');
    assert.equal(list[0].launch, 'index.html');
    const html = await (await fetch(`${s.base}/content/${list[0].id}/index.html`)).text();
    assert.match(html, /Atoms, Elements/);
    const cur = await (await fetch(`${s.base}/api/curriculum`)).json();
    assert.equal(cur.grades.length, 13);
    assert.equal(cur.grades.find((g) => g.id === '9').courseCount, 1);
  } finally { s.close(); }
});

test('uploads a SCORM 2004 package nested in a folder', async () => {
  const s = await start({ seed: false });
  try {
    const buf = zipOf({ 'pkg/imsmanifest.xml': MANIFEST_2004, 'pkg/content/start.html': '<h1>hi</h1>', 'pkg/content/wrong.html': 'x' });
    const r = await upload(s.base, buf, { grade: '9', subject: 'science' });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.title, 'Photosynthesis');
    assert.equal(r.body.launch, 'pkg/content/start.html');
    const res = await fetch(`${s.base}/content/${r.body.id}/pkg/content/start.html`);
    assert.equal(res.status, 200);
  } finally { s.close(); }
});

test('rejects zips without a manifest, unknown grades and path traversal', async () => {
  const s = await start({ seed: false });
  try {
    let r = await upload(s.base, zipOf({ 'index.html': 'x' }), { grade: '9', subject: 'science' });
    assert.equal(r.status, 400);
    assert.match(r.body.error, /imsmanifest/);
    r = await upload(s.base, zipOf({ 'imsmanifest.xml': MANIFEST_2004 }), { grade: '14', subject: 'science' });
    assert.equal(r.status, 400);
    const res = await fetch(`${s.base}/content/nope/..%2F..%2Fdb.json`);
    assert.equal(res.status, 404);
  } finally { s.close(); }
});

test('saves and returns SCORM attempt data; reports list it', async () => {
  const s = await start();
  try {
    const [c] = await (await fetch(`${s.base}/api/courses`)).json();
    const post = await fetch(`${s.base}/api/courses/${c.id}/attempt?learner=Sara`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ newSession: true, cmi: { lesson_status: 'passed', score_raw: '83', total_time: '0000:05:10', suspend_data: '{"slide":7}' } }),
    });
    assert.equal(post.status, 200);
    const a = await (await fetch(`${s.base}/api/courses/${c.id}/attempt?learner=sara`)).json();
    assert.equal(a.cmi.lesson_status, 'passed');
    assert.equal(a.sessions, 1);
    const rep = await (await fetch(`${s.base}/api/reports`)).json();
    assert.equal(rep[0].learnerName, 'Sara');
    assert.equal(rep[0].score, '83');
  } finally { s.close(); }
});

test('ADMIN_KEY protects uploads and deletes', async () => {
  const s = await start({ adminKey: 'secret' });
  try {
    const buf = zipOf({ 'imsmanifest.xml': MANIFEST_2004, 'content/start.html': 'x' });
    assert.equal((await upload(s.base, buf, { grade: '1', subject: 'math' })).status, 401);
    const ok = await upload(s.base, buf, { grade: '1', subject: 'math' }, { 'x-admin-key': 'secret' });
    assert.equal(ok.status, 201);
    const del = await fetch(`${s.base}/api/courses/${ok.body.id}`, { method: 'DELETE', headers: { 'x-admin-key': 'secret' } });
    assert.equal(del.status, 200);
  } finally { s.close(); }
});
