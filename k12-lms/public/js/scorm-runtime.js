// SCORM run-time API exposed to the content iframe.
// SCORM 1.2  → window.API            (LMSInitialize, LMSGetValue, LMSSetValue, LMSCommit, LMSFinish, ...)
// SCORM 2004 → window.API_1484_11    (Initialize, GetValue, SetValue, Commit, Terminate, ...)
// Both share one learner record that is saved to /api/courses/:id/attempt.

const ERR = {
  0: 'No error', 101: 'General exception', 103: 'Already initialized', 104: 'Content instance terminated',
  132: 'Store data before initialization', 142: 'Commit after termination', 201: 'Invalid argument',
  301: 'Not initialized', 401: 'Not implemented error', 402: 'Invalid set value, element is a keyword',
  403: 'Element is read only', 404: 'Element is write only', 405: 'Incorrect data type',
};

// ---- time helpers ----
function parse12Time(s) { // HHHH:MM:SS(.SS)
  const m = /^(\d{1,4}):(\d{2}):(\d{2}(?:\.\d+)?)$/.exec(String(s || ''));
  return m ? (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]) : 0;
}
function parseIsoDuration(s) { // P[nD]T[nH][nM][nS]
  const m = /^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(String(s || ''));
  return m ? (+(m[1] || 0)) * 86400 + (+(m[2] || 0)) * 3600 + (+(m[3] || 0)) * 60 + (+(m[4] || 0)) : 0;
}
const pad = (n, w = 2) => String(Math.floor(n)).padStart(w, '0');
export function format12Time(sec) {
  return `${pad(sec / 3600, 4)}:${pad((sec / 60) % 60)}:${pad(sec % 60)}`;
}
const formatIso = (sec) => `PT${Math.floor(sec / 3600)}H${Math.floor((sec / 60) % 60)}M${Math.floor(sec % 60)}S`;

const STATUS_12 = ['passed', 'completed', 'failed', 'incomplete', 'browsed', 'not attempted'];

/**
 * @param {object} o
 * @param {object} o.course   course record (id, scormVersion)
 * @param {string} o.learner  learner display name
 * @param {object|null} o.attempt saved attempt from the server
 * @param {(cmi:object)=>void} o.onChange called after every commit with the normalised record
 */
export function installRuntime({ course, learner, attempt, onChange }) {
  const saved = attempt?.cmi || {};
  const totalSeconds = parse12Time(saved.total_time);
  let sessionSeconds = 0;
  let initialized = false;
  let terminated = false;
  let lastError = 0;
  let dirty = false;
  let newSession = true;

  // Unified record (SCORM 1.2 vocabulary + 2004 extras)
  const rec = {
    lesson_status: saved.lesson_status || 'not attempted',
    completion_status: saved.completion_status || 'unknown',
    success_status: saved.success_status || 'unknown',
    score_raw: saved.score_raw ?? '', score_min: saved.score_min ?? '', score_max: saved.score_max ?? '',
    score_scaled: saved.score_scaled ?? '',
    lesson_location: saved.lesson_location || '',
    suspend_data: saved.suspend_data || '',
    exit: '',
    entry: saved.lesson_status && saved.lesson_status !== 'not attempted' ? 'resume' : 'ab-initio',
    interactions: Array.isArray(saved.interactions) ? saved.interactions.map((i) => ({ ...i })) : [],
  };
  if (saved.exit && saved.exit !== 'suspend' && /passed|completed|failed/.test(saved.lesson_status || '')) rec.entry = '';

  const learnerId = learner.toLowerCase().replace(/\s+/g, '.');

  function snapshot() {
    return {
      ...rec,
      total_time: format12Time(totalSeconds + sessionSeconds),
    };
  }

  async function persist(final) {
    dirty = false;
    const body = JSON.stringify({ learnerName: learner, cmi: snapshot(), newSession });
    newSession = false;
    try {
      const res = await fetch(`/api/courses/${course.id}/attempt?learner=${encodeURIComponent(learner)}`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: Boolean(final),
      });
      if (res.ok) onChange?.(await res.json());
    } catch (e) { console.warn('SCORM save failed', e); }
  }

  const ok = () => { lastError = 0; return 'true'; };
  const fail = (code, ret = 'false') => { lastError = code; return ret; };

  function interaction(parts, write, value) {
    // parts: ['interactions', n, field, ...]
    const n = Number(parts[1]);
    if (!Number.isInteger(n) || n < 0) return fail(201, write ? 'false' : '');
    if (n > rec.interactions.length) return fail(201, write ? 'false' : '');
    const field = parts.slice(2).join('.');
    if (!write) {
      const it = rec.interactions[n];
      if (!it) return fail(201, '');
      lastError = 0;
      return it[field] ?? '';
    }
    if (!rec.interactions[n]) rec.interactions[n] = {};
    rec.interactions[n][field] = String(value);
    dirty = true;
    return ok();
  }

  // ----- SCORM 1.2 -----
  const get12 = (el) => {
    if (!initialized) return fail(301, '');
    switch (el) {
      case 'cmi.core._children': return ok() && 'student_id,student_name,lesson_location,credit,lesson_status,entry,score,total_time,lesson_mode,exit,session_time';
      case 'cmi.core.score._children': return ok() && 'raw,min,max';
      case 'cmi.core.student_id': lastError = 0; return learnerId;
      case 'cmi.core.student_name': lastError = 0; return learner;
      case 'cmi.core.lesson_location': lastError = 0; return rec.lesson_location;
      case 'cmi.core.credit': lastError = 0; return 'credit';
      case 'cmi.core.lesson_status': lastError = 0; return rec.lesson_status;
      case 'cmi.core.entry': lastError = 0; return rec.entry;
      case 'cmi.core.score.raw': lastError = 0; return String(rec.score_raw);
      case 'cmi.core.score.min': lastError = 0; return String(rec.score_min);
      case 'cmi.core.score.max': lastError = 0; return String(rec.score_max);
      case 'cmi.core.total_time': lastError = 0; return format12Time(totalSeconds);
      case 'cmi.core.lesson_mode': lastError = 0; return 'normal';
      case 'cmi.core.exit': case 'cmi.core.session_time': return fail(404, '');
      case 'cmi.suspend_data': lastError = 0; return rec.suspend_data;
      case 'cmi.launch_data': lastError = 0; return '';
      case 'cmi.comments': lastError = 0; return '';
      case 'cmi.student_data.mastery_score': lastError = 0; return '';
      case 'cmi.interactions._children': lastError = 0; return 'id,objectives,time,type,correct_responses,weighting,student_response,result,latency';
      case 'cmi.interactions._count': lastError = 0; return String(rec.interactions.length);
      default: {
        const parts = el.replace(/^cmi\./, '').split('.');
        if (parts[0] === 'interactions') return fail(404, ''); // interactions are write-only in 1.2
        return fail(401, '');
      }
    }
  };

  const set12 = (el, v) => {
    if (!initialized) return fail(301);
    v = String(v);
    switch (el) {
      case 'cmi.core.lesson_location': rec.lesson_location = v.slice(0, 255); break;
      case 'cmi.core.lesson_status':
        if (!STATUS_12.includes(v) || v === 'not attempted') return fail(405);
        rec.lesson_status = v;
        if (v === 'passed' || v === 'completed') rec.completion_status = 'completed';
        if (v === 'passed') rec.success_status = 'passed';
        if (v === 'failed') rec.success_status = 'failed';
        if (v === 'incomplete') rec.completion_status = 'incomplete';
        break;
      case 'cmi.core.score.raw': case 'cmi.core.score.min': case 'cmi.core.score.max':
        if (v !== '' && (isNaN(Number(v)) || Number(v) < 0 || Number(v) > 100)) return fail(405);
        rec['score_' + el.split('.').pop()] = v; break;
      case 'cmi.core.exit':
        if (!['time-out', 'suspend', 'logout', ''].includes(v)) return fail(405);
        rec.exit = v; break;
      case 'cmi.core.session_time': {
        if (!/^\d{2,4}:\d{2}:\d{2}(\.\d{1,2})?$/.test(v)) return fail(405);
        sessionSeconds = parse12Time(v); break;
      }
      case 'cmi.suspend_data': if (v.length > 4096 * 16) return fail(405); rec.suspend_data = v; break;
      case 'cmi.comments': break;
      case 'cmi.core.student_id': case 'cmi.core.student_name': case 'cmi.core.credit': case 'cmi.core.entry':
      case 'cmi.core.total_time': case 'cmi.core.lesson_mode': case 'cmi.launch_data': case 'cmi.interactions._count':
        return fail(403);
      default: {
        const parts = el.replace(/^cmi\./, '').split('.');
        if (parts[0] === 'interactions') return interaction(parts, true, v);
        return fail(401);
      }
    }
    dirty = true;
    return ok();
  };

  function finish(final) {
    if (rec.lesson_status === 'not attempted') rec.lesson_status = 'incomplete';
    persist(final);
  }

  window.API = {
    LMSInitialize(arg) {
      if (arg !== '' && arg !== undefined) return fail(201);
      if (initialized) return fail(101);
      initialized = true; terminated = false;
      return ok();
    },
    LMSFinish(arg) {
      if (arg !== '' && arg !== undefined) return fail(201);
      if (!initialized) return fail(301);
      initialized = false; terminated = true;
      finish(true);
      return ok();
    },
    LMSGetValue: get12,
    LMSSetValue: set12,
    LMSCommit(arg) {
      if (arg !== '' && arg !== undefined) return fail(201);
      if (!initialized) return fail(301);
      persist(false);
      return ok();
    },
    LMSGetLastError: () => String(lastError),
    LMSGetErrorString: (c) => ERR[c] || '',
    LMSGetDiagnostic: (c) => ERR[c ?? lastError] || '',
  };

  // ----- SCORM 2004 -----
  const COMPLETION = ['completed', 'incomplete', 'not attempted', 'unknown'];
  const SUCCESS = ['passed', 'failed', 'unknown'];
  function sync2004Status() {
    if (rec.success_status === 'passed') rec.lesson_status = 'passed';
    else if (rec.success_status === 'failed') rec.lesson_status = 'failed';
    else if (rec.completion_status === 'completed') rec.lesson_status = 'completed';
    else if (rec.completion_status === 'incomplete') rec.lesson_status = 'incomplete';
  }
  const map2004 = (parts) => {
    // cmi.interactions.n.learner_response → student_response (shared storage)
    const p = parts.slice();
    if (p[2] === 'learner_response') p[2] = 'student_response';
    if (p[2] === 'timestamp') p[2] = 'time';
    return p;
  };
  window.API_1484_11 = {
    Initialize(arg) {
      if (arg !== '') return fail(201);
      if (terminated) return fail(104);
      if (initialized) return fail(103);
      initialized = true; return ok();
    },
    Terminate(arg) {
      if (arg !== '') return fail(201);
      if (!initialized) return fail(terminated ? 113 : 112);
      initialized = false; terminated = true;
      finish(true);
      return ok();
    },
    Commit(arg) {
      if (arg !== '') return fail(201);
      if (!initialized) return fail(terminated ? 143 : 142);
      persist(false); return ok();
    },
    GetValue(el) {
      if (!initialized) return fail(terminated ? 123 : 122, '');
      lastError = 0;
      switch (el) {
        case 'cmi._version': return '1.0';
        case 'cmi.learner_id': return learnerId;
        case 'cmi.learner_name': return learner;
        case 'cmi.location': return rec.lesson_location;
        case 'cmi.completion_status': return rec.completion_status;
        case 'cmi.success_status': return rec.success_status;
        case 'cmi.score.scaled': return String(rec.score_scaled);
        case 'cmi.score.raw': return String(rec.score_raw);
        case 'cmi.score.min': return String(rec.score_min);
        case 'cmi.score.max': return String(rec.score_max);
        case 'cmi.suspend_data': return rec.suspend_data;
        case 'cmi.entry': return rec.entry;
        case 'cmi.mode': return 'normal';
        case 'cmi.credit': return 'credit';
        case 'cmi.launch_data': return '';
        case 'cmi.total_time': return formatIso(totalSeconds);
        case 'cmi.completion_threshold': case 'cmi.scaled_passing_score': case 'cmi.progress_measure': return '';
        case 'cmi.interactions._count': return String(rec.interactions.length);
        case 'cmi.exit': case 'cmi.session_time': return fail(405, '');
        default: {
          const parts = el.replace(/^cmi\./, '').split('.');
          if (parts[0] === 'interactions') return interaction(map2004(parts), false);
          return fail(401, '');
        }
      }
    },
    SetValue(el, v) {
      if (!initialized) return fail(terminated ? 133 : 132);
      v = String(v);
      switch (el) {
        case 'cmi.location': rec.lesson_location = v.slice(0, 1000); break;
        case 'cmi.completion_status': if (!COMPLETION.includes(v)) return fail(406); rec.completion_status = v; sync2004Status(); break;
        case 'cmi.success_status': if (!SUCCESS.includes(v)) return fail(406); rec.success_status = v; sync2004Status(); break;
        case 'cmi.score.scaled':
          if (isNaN(Number(v)) || Number(v) < -1 || Number(v) > 1) return fail(407);
          rec.score_scaled = v;
          if (rec.score_raw === '') rec.score_raw = String(Math.round(Number(v) * 100));
          break;
        case 'cmi.score.raw': case 'cmi.score.min': case 'cmi.score.max':
          if (isNaN(Number(v))) return fail(406); rec['score_' + el.split('.').pop()] = v; break;
        case 'cmi.suspend_data': rec.suspend_data = v.slice(0, 64000); break;
        case 'cmi.exit': rec.exit = v; break;
        case 'cmi.session_time': sessionSeconds = parseIsoDuration(v); break;
        case 'cmi.progress_measure': break;
        default: {
          const parts = el.replace(/^cmi\./, '').split('.');
          if (parts[0] === 'interactions') return interaction(map2004(parts), true, v);
          return fail(404);
        }
      }
      dirty = true;
      return ok();
    },
    GetLastError: () => String(lastError),
    GetErrorString: (c) => ERR[c] || '',
    GetDiagnostic: (c) => ERR[c ?? lastError] || '',
  };

  return {
    /** Call when the player is closed without the SCO calling Finish/Terminate. */
    close() {
      if (initialized || dirty) { initialized = false; terminated = true; finish(true); }
      delete window.API;
      delete window.API_1484_11;
    },
    snapshot,
  };
}
