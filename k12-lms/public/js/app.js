import { installRuntime } from './scorm-runtime.js';

const $view = document.getElementById('view');
const state = { curriculum: null, config: null, runtime: null };

// ---------- helpers ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content; };

async function api(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  const key = sessionStorage.getItem('adminKey');
  if (key) headers['x-admin-key'] = key;
  if (opts.json) { headers['content-type'] = 'application/json'; opts.body = JSON.stringify(opts.json); }
  const res = await fetch(path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status });
  return data;
}

function toast(msg, kind = '') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast ${kind}`; t.hidden = false;
  clearTimeout(toast.timer); toast.timer = setTimeout(() => { t.hidden = true; }, 3500);
}

const learner = {
  get: () => { try { return localStorage.getItem('learnerName') || ''; } catch { return ''; } },
  set: (v) => { try { localStorage.setItem('learnerName', v); } catch { /* private mode */ } renderLearner(); },
};
function renderLearner() {
  const n = learner.get();
  document.getElementById('learnerBtn').innerHTML = n
    ? `<span class="avatar">${esc(n[0].toUpperCase())}</span><span class="lname">${esc(n)}</span>`
    : '<span class="avatar" aria-hidden="true">?</span><span class="lname">Learner sign-in</span>';
}
function askLearner() {
  return new Promise((resolve) => {
    const d = document.getElementById('learnerDialog');
    const f = document.getElementById('learnerForm');
    f.name.value = learner.get();
    d.onclose = () => {
      if (d.returnValue === 'ok' && f.name.value.trim()) { learner.set(f.name.value.trim()); resolve(learner.get()); } else resolve(null);
    };
    d.showModal();
  });
}
document.getElementById('learnerBtn').onclick = askLearner;

const subjectOf = (id) => state.curriculum.subjects.find((s) => s.id === id) || { name: id, color: '#888' };
const gradeOf = (id) => state.curriculum.grades.find((g) => g.id === String(id));
const statusLabel = (s) => ({ passed: 'Passed', completed: 'Completed', failed: 'Failed', incomplete: 'In progress', browsed: 'Browsed' }[s] || 'Not started');
const statusClass = (s) => ({ passed: 'ok', completed: 'ok', failed: 'bad', incomplete: 'warn' }[s] || '');
const fmtTime = (t) => { const [hh, mm, ss] = String(t || '0:0:0').split(':').map(Number); return hh ? `${hh}h ${mm}m` : `${mm}m ${Math.round(ss)}s`; };
const fmtSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

async function loadCurriculum() { state.curriculum = await api('/api/curriculum'); }

// ---------- router ----------
const routes = [
  [/^#?\/?$/, viewHome],
  [/^#\/grade\/([^/]+)$/, viewGrade],
  [/^#\/grade\/([^/]+)\/([^/]+)$/, viewSubject],
  [/^#\/play\/([^/]+)$/, viewPlayer],
  [/^#\/teacher$/, viewTeacher],
];
async function route() {
  if (state.runtime) { state.runtime.close(); state.runtime = null; }
  document.body.classList.remove('playing');
  const hash = location.hash || '#/';
  document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('on',
    (a.dataset.nav === 'teacher') === hash.startsWith('#/teacher')));
  for (const [re, fn] of routes) {
    const m = re.exec(hash);
    if (m) {
      $view.innerHTML = '<div class="loading">Loading…</div>';
      try { await fn(...m.slice(1).map(decodeURIComponent)); } catch (e) {
        $view.innerHTML = `<div class="wrap"><div class="empty">Something went wrong: ${esc(e.message)}</div></div>`;
      }
      $view.focus({ preventScroll: true });
      return;
    }
  }
  location.hash = '#/';
}
window.addEventListener('hashchange', route);

// ---------- views ----------
async function viewHome() {
  await loadCurriculum();
  const featured = (await api('/api/courses?grade=9&subject=science'))[0];
  const bands = ['Elementary', 'Middle School', 'High School'];
  $view.innerHTML = '';
  $view.append(h(`
    <section class="hero">
      <div class="wrap">
        <p class="eyebrow">K-12 Curriculum · SCORM 1.2 &amp; 2004</p>
        <h1>Every grade, every subject, one place to learn.</h1>
        <p class="lead">Browse courses from Kindergarten to Grade 12, play interactive SCORM lessons and track scores and completion for every learner.</p>
      </div>
    </section>
    <div class="wrap">
      ${featured ? `
      <a class="feature" href="#/play/${featured.id}">
        <div class="feature-art" aria-hidden="true">
          <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="46" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="2"/>
          <circle cx="60" cy="60" r="26" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="2"/>
          <circle cx="60" cy="60" r="9" fill="currentColor"/><circle cx="106" cy="60" r="5" fill="currentColor"/>
          <circle cx="34" cy="60" r="5" fill="currentColor"/><circle cx="60" cy="14" r="5" fill="currentColor"/></svg>
        </div>
        <div>
          <span class="tag" style="--c:${subjectOf('science').color}">Featured · Grade 9 Science</span>
          <h2>${esc(featured.title)}</h2>
          <p>${esc(featured.description)}</p>
          <span class="btn primary">▶ Play SCORM lesson</span>
        </div>
      </a>` : ''}
      ${bands.map((band) => `
        <h2 class="section">${band}</h2>
        <div class="grades">
          ${state.curriculum.grades.filter((g) => g.band === band).map((g) => `
            <a class="grade ${g.id === '9' ? 'hl' : ''}" href="#/grade/${g.id}">
              <span class="gnum">${g.id}</span>
              <span class="gname">${esc(g.name)}</span>
              <span class="gmeta">${g.courseCount ? `${g.courseCount} course${g.courseCount > 1 ? 's' : ''}` : 'No courses yet'}</span>
            </a>`).join('')}
        </div>`).join('')}
    </div>`));
}

async function viewGrade(gid) {
  await loadCurriculum();
  const g = gradeOf(gid);
  if (!g) { location.hash = '#/'; return; }
  $view.innerHTML = '';
  $view.append(h(`
    <div class="wrap">
      <nav class="crumbs"><a href="#/">Grades</a> › <span>${esc(g.name)}</span></nav>
      <h1>${esc(g.name)} <small class="muted">· ${esc(g.band)} · age ~${g.age}</small></h1>
      <div class="subjects">
        ${state.curriculum.subjects.map((s) => {
          const n = g.subjects.find((x) => x.id === s.id).courseCount;
          return `<a class="subject" href="#/grade/${g.id}/${s.id}" style="--c:${s.color}">
            <span class="sbar"></span><b>${esc(s.name)}</b>
            <span class="muted">${n ? `${n} SCORM course${n > 1 ? 's' : ''}` : 'Empty — attach a SCORM package'}</span></a>`;
        }).join('')}
      </div>
    </div>`));
}

async function viewSubject(gid, sid) {
  await loadCurriculum();
  const g = gradeOf(gid); const s = subjectOf(sid);
  if (!g) { location.hash = '#/'; return; }
  const courses = await api(`/api/courses?grade=${encodeURIComponent(gid)}&subject=${encodeURIComponent(sid)}`);
  $view.innerHTML = '';
  $view.append(h(`
    <div class="wrap">
      <nav class="crumbs"><a href="#/">Grades</a> › <a href="#/grade/${g.id}">${esc(g.name)}</a> › <span>${esc(s.name)}</span></nav>
      <h1 style="--c:${s.color}" class="subject-title">${esc(g.name)} ${esc(s.name)}</h1>
      <div class="cols">
        <section>
          <h2 class="section">Courses</h2>
          <div class="courses" id="courseList">
            ${courses.length ? courses.map(courseCard).join('') : '<div class="empty">No SCORM courses here yet. Attach one with the form →</div>'}
          </div>
        </section>
        <aside>${uploadForm({ grade: g.id, subject: s.id, lock: true })}</aside>
      </div>
    </div>`));
  wireUpload($view.querySelector('form.upload'), () => viewSubject(gid, sid));
  wireCourseActions();
}

function courseCard(c) {
  return `<article class="course" data-id="${c.id}">
    <div class="ctop">
      <span class="tag" style="--c:${subjectOf(c.subject).color}">SCORM ${esc(c.scormVersion)}</span>
      <span class="muted small">${fmtSize(c.sizeBytes)} · ${c.learners} learner${c.learners === 1 ? '' : 's'} · ${c.completed} done</span>
    </div>
    <h3>${esc(c.title)}</h3>
    ${c.description ? `<p class="muted">${esc(c.description)}</p>` : ''}
    <div class="row">
      <a class="btn primary" href="#/play/${c.id}">▶ Play</a>
      <a class="btn ghost" href="#/teacher" data-report="${c.id}">Results</a>
      <button class="btn ghost danger" data-del="${c.id}" type="button">Remove</button>
    </div>
  </article>`;
}

function wireCourseActions() {
  $view.querySelectorAll('[data-del]').forEach((b) => {
    b.onclick = async () => {
      if (!confirm('Remove this course and all learner results for it?')) return;
      try { await api(`/api/courses/${b.dataset.del}`, { method: 'DELETE' }); toast('Course removed'); route(); } catch (e) { handleAuth(e); }
    };
  });
  $view.querySelectorAll('[data-report]').forEach((a) => {
    a.onclick = (e) => { e.preventDefault(); sessionStorage.setItem('reportCourse', a.dataset.report); location.hash = '#/teacher'; };
  });
}

function handleAuth(e) {
  if (e.status === 401) {
    const k = prompt('Enter the teacher key (ADMIN_KEY) to manage courses:');
    if (k) { sessionStorage.setItem('adminKey', k); toast('Key saved — try again.'); }
  } else toast(e.message, 'bad');
}

function uploadForm({ grade = '9', subject = 'science', lock = false } = {}) {
  const gradeOpts = state.curriculum.grades.map((g) => `<option value="${g.id}" ${g.id === grade ? 'selected' : ''}>${esc(g.name)}</option>`).join('');
  const subjOpts = state.curriculum.subjects.map((s) => `<option value="${s.id}" ${s.id === subject ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
  return `<form class="upload card" enctype="multipart/form-data">
    <h2>Attach SCORM package</h2>
    <p class="muted small">Upload a SCORM 1.2 or 2004 <b>.zip</b> exported from Articulate, iSpring, Captivate, H5P, etc. It must contain <code>imsmanifest.xml</code>.</p>
    <label class="drop">
      <input type="file" name="package" accept=".zip,application/zip" required>
      <span class="drop-text">Choose a .zip or drop it here</span>
    </label>
    <div class="grid2">
      <label>Grade <select name="grade" ${lock ? 'disabled' : ''}>${gradeOpts}</select></label>
      <label>Subject <select name="subject" ${lock ? 'disabled' : ''}>${subjOpts}</select></label>
    </div>
    ${lock ? `<input type="hidden" name="grade" value="${grade}"><input type="hidden" name="subject" value="${subject}">` : ''}
    <label>Title <span class="muted small">(optional — read from the manifest)</span><input name="title" maxlength="200"></label>
    <label>Description <textarea name="description" rows="2" maxlength="1000"></textarea></label>
    <div class="progressbar" hidden><div></div></div>
    <button class="primary" type="submit">Upload &amp; attach</button>
    <p class="muted small">No package handy? <a href="/sample/grade9-science-atoms.zip">Download the Grade 9 Science sample</a> and upload it.</p>
  </form>`;
}

function wireUpload(form, done) {
  const drop = form.querySelector('.drop');
  const input = form.querySelector('input[type=file]');
  const text = form.querySelector('.drop-text');
  input.onchange = () => { text.textContent = input.files[0] ? `${input.files[0].name} · ${fmtSize(input.files[0].size)}` : 'Choose a .zip or drop it here'; };
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove('over')));
  drop.addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer.files[0]) { input.files = e.dataTransfer.files; input.onchange(); } });

  form.onsubmit = (e) => {
    e.preventDefault();
    if (!input.files[0]) { toast('Choose a SCORM .zip first', 'bad'); return; }
    const fd = new FormData(form);
    const bar = form.querySelector('.progressbar'); const fill = bar.firstElementChild;
    const btn = form.querySelector('button[type=submit]');
    bar.hidden = false; btn.disabled = true;
    // XHR for upload progress
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/courses');
    const key = sessionStorage.getItem('adminKey');
    if (key) xhr.setRequestHeader('x-admin-key', key);
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) fill.style.width = `${(ev.loaded / ev.total) * 100}%`; };
    xhr.onload = () => {
      btn.disabled = false; bar.hidden = true; fill.style.width = '0';
      let data = {}; try { data = JSON.parse(xhr.responseText); } catch { /* ignore */ }
      if (xhr.status === 201) { toast(`Attached “${data.title}” (SCORM ${data.scormVersion})`, 'ok'); done(data); } else handleAuth(Object.assign(new Error(data.error || 'Upload failed'), { status: xhr.status }));
    };
    xhr.onerror = () => { btn.disabled = false; bar.hidden = true; toast('Network error during upload', 'bad'); };
    xhr.send(fd);
  };
}

async function viewPlayer(id) {
  await loadCurriculum();
  const course = await api(`/api/courses/${id}`);
  let name = learner.get();
  if (!name) name = await askLearner();
  if (!name) { history.back(); return; }
  const attempt = await api(`/api/courses/${id}/attempt?learner=${encodeURIComponent(name)}`);
  const g = gradeOf(course.grade); const s = subjectOf(course.subject);

  document.body.classList.add('playing');
  $view.innerHTML = '';
  $view.append(h(`
    <div class="player">
      <div class="pbar">
        <a class="btn ghost" href="#/grade/${course.grade}/${course.subject}">← Exit</a>
        <div class="ptitle"><b>${esc(course.title)}</b><span class="muted small">${esc(g?.name)} · ${esc(s.name)} · SCORM ${esc(course.scormVersion)}</span></div>
        <div class="pstats">
          <span class="pill" id="pStatus"></span>
          <span class="pill" id="pScore"></span>
          <button class="btn ghost" id="pFull" type="button" title="Full screen">⛶</button>
        </div>
      </div>
      <iframe id="sco" title="${esc(course.title)}" allow="fullscreen; autoplay"></iframe>
    </div>`));

  const showStats = (a) => {
    const c = a?.cmi || {};
    const st = document.getElementById('pStatus'); const sc = document.getElementById('pScore');
    if (!st) return;
    st.textContent = statusLabel(c.lesson_status); st.className = `pill ${statusClass(c.lesson_status)}`;
    sc.textContent = c.score_raw !== undefined && c.score_raw !== '' ? `Score ${c.score_raw}%` : 'No score yet';
  };
  showStats(attempt);
  state.runtime = installRuntime({ course, learner: name, attempt, onChange: showStats });
  const frame = document.getElementById('sco');
  const [launchPath, ...query] = course.launch.split('?');
  frame.src = `/content/${course.id}/${launchPath.split('/').map(encodeURIComponent).join('/')}${query.length ? `?${query.join('?')}` : ''}`;
  document.getElementById('pFull').onclick = () => (document.querySelector('.player').requestFullscreen?.());
}

async function viewTeacher() {
  await loadCurriculum();
  const [courses, reports, config] = await Promise.all([api('/api/courses'), api('/api/reports'), api('/api/config')]);
  const focus = sessionStorage.getItem('reportCourse');
  sessionStorage.removeItem('reportCourse');
  $view.innerHTML = '';
  $view.append(h(`
    <div class="wrap">
      <h1>Teacher dashboard</h1>
      <p class="muted">Attach SCORM packages to any grade and subject, and follow learner progress.${config.needsAdminKey ? ' Uploads need the teacher key.' : ''}</p>
      <div class="cols">
        <section>
          <h2 class="section">Learner results</h2>
          <div class="filter">
            <label>Course <select id="rFilter"><option value="">All courses</option>
              ${courses.map((c) => `<option value="${c.id}" ${c.id === focus ? 'selected' : ''}>${esc(gradeOf(c.grade)?.name)} · ${esc(c.title)}</option>`).join('')}
            </select></label>
          </div>
          <div class="tablewrap"><table class="table" id="rTable"></table></div>
          <h2 class="section">All courses (${courses.length})</h2>
          <div class="courses">${courses.map(courseCard).join('') || '<div class="empty">No courses yet.</div>'}</div>
        </section>
        <aside>${uploadForm({})}</aside>
      </div>
    </div>`));
  const drawTable = () => {
    const f = document.getElementById('rFilter').value;
    const rows = reports.filter((r) => !f || r.courseId === f);
    document.getElementById('rTable').innerHTML = rows.length ? `
      <thead><tr><th>Learner</th><th>Course</th><th>Status</th><th>Score</th><th>Time</th><th>Last activity</th></tr></thead>
      <tbody>${rows.map((r) => `<tr>
        <td>${esc(r.learnerName)}</td>
        <td>${esc(gradeOf(r.grade)?.name)} · ${esc(r.courseTitle)}</td>
        <td><span class="pill ${statusClass(r.status)}">${statusLabel(r.status)}</span></td>
        <td>${r.score !== null && r.score !== '' ? `${esc(r.score)}%` : '—'}</td>
        <td>${fmtTime(r.totalTime)}</td>
        <td class="muted small">${r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '—'}</td></tr>`).join('')}</tbody>`
      : '<tbody><tr><td class="empty">No learner activity yet. Play a course to see results here.</td></tr></tbody>';
  };
  document.getElementById('rFilter').onchange = drawTable;
  drawTable();
  wireUpload($view.querySelector('form.upload'), (c) => { location.hash = `#/grade/${c.grade}/${c.subject}`; });
  wireCourseActions();
}

renderLearner();
route();
