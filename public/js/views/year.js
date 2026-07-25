// صفحة المستوى (السنة) وصفحة المادة
import { h, num, pageHead, empty, chip, spinner, clear, progressBar, pct, fmtMinutes } from '../dom.js';
import { api } from '../api.js';
import { state, isStaff } from '../store.js';
import { sessionItem, subjectTile, backLink, pager } from './parts.js';

export async function yearView({ params }) {
  const { year } = await api.year(params.id);
  const totals = year.totals;

  const scheduleHost = h('div', {}, spinner());
  const PAGE = 25;
  let loaded = false;
  const loadSchedule = async (offset = 0) => {
    loaded = true;
    clear(scheduleHost).appendChild(spinner());
    try {
      const page = await api.yearSessions(year.id, { limit: PAGE, offset });
      clear(scheduleHost).append(
        page.sessions.length
          ? h('div', { class: 'session-list' }, ...page.sessions.map((s) => sessionItem(s)))
          : empty('📋', 'لا توجد حصص بعد', isStaff() ? 'استخدم زر «توليد الجدول» في صفحة الإدارة.' : null),
        pager(page, loadSchedule) || h('span')
      );
    } catch (err) {
      clear(scheduleHost).appendChild(h('p', { class: 'muted' }, err.message));
    }
  };

  const details = h('details', { class: 'acc', ontoggle: (e) => e.currentTarget.open && !loaded && loadSchedule() },
    h('summary', {}, `📋 الجدول الكامل بالتتابع (${num(totals.sessions)} حصة)`),
    h('div', {}, scheduleHost));

  return h('div', {},
    h('div', { class: 'row', style: { marginBottom: '.6rem' } },
      backLink('#/', 'كل المستويات'),
      isStaff() ? h('a', { class: 'btn sm soft', href: `#/admin/year/${year.id}` }, '⚙ إدارة هذا المستوى') : null),
    pageHead(
      year.age_min === year.age_max ? `عمر ${num(year.age_min)} سنة` : `الأعمار ${num(year.age_min)}–${num(year.age_max)}`,
      year.title,
      year.description
    ),
    h('div', { class: 'grid cols-4', style: { marginBottom: '.9rem' } },
      h('div', { class: 'stat' }, h('strong', {}, num(year.total_hours)), h('small', {}, 'ساعة مقرّرة')),
      h('div', { class: 'stat' }, h('strong', {}, num(totals.sessions)), h('small', {}, 'حصة')),
      h('div', { class: 'stat' }, h('strong', {}, num(year.subjects.length)), h('small', {}, 'مادة')),
      h('div', { class: 'stat' }, h('strong', {}, num(totals.resources)), h('small', {}, 'مرفق'))),
    state.user
      ? h('section', { class: 'card' },
          h('div', { class: 'card-title' }, h('h3', {}, '📈 تقدّمك في هذا المستوى')),
          progressBar(totals.completed, totals.sessions),
          h('p', { class: 'small muted', style: { margin: '.4rem 0 0' } },
            `${num(totals.completed)} من ${num(totals.sessions)} حصة (${num(pct(totals.completed, totals.sessions))}٪) — ما يعادل ${fmtMinutes(totals.completed * (year.session_minutes || 60))}`))
      : null,
    h('h2', { style: { marginTop: '1.1rem' } }, 'المواد'),
    h('div', { class: 'grid cols-3' }, ...year.subjects.map((s) => subjectTile(s, year.id))),
    h('h2', { style: { marginTop: '1.1rem' } }, 'الجدول'),
    details);
}

export async function subjectView({ params }) {
  const PAGE = 25;
  const { year } = await api.year(params.id);
  const subject = year.subjects.find((s) => String(s.id) === String(params.subjectId));
  if (!subject) return empty('❓', 'المادة غير موجودة في هذا المستوى');

  const listHost = h('div', {}, spinner());
  let term = '';

  const load = async (offset = 0) => {
    clear(listHost).appendChild(spinner());
    try {
      const page = await api.yearSessions(year.id, {
        subject_id: subject.id, q: term || undefined, limit: PAGE, offset,
      });
      clear(listHost).append(
        page.sessions.length
          ? h('div', { class: 'session-list' }, ...page.sessions.map((s) => sessionItem(s, { showSubject: false })))
          : empty(term ? '🔍' : '📋', term ? 'لا نتائج مطابقة' : 'لا توجد حصص في هذه المادة بعد'),
        pager(page, load) || h('span')
      );
    } catch (err) {
      clear(listHost).appendChild(h('p', { class: 'muted' }, err.message));
    }
  };

  let debounce = null;
  const search = h('input', {
    type: 'search',
    placeholder: 'ابحث في حصص هذه المادة…',
    oninput: (event) => {
      term = event.target.value.trim();
      clearTimeout(debounce);
      debounce = setTimeout(() => load(0), 250);
    },
  });

  load(0);
  const done = subject.completed_count || 0;

  return h('div', {},
    h('div', { class: 'row', style: { marginBottom: '.6rem' } }, backLink(`#/year/${year.id}`, year.title)),
    pageHead(`${year.title} · ${num(subject.share)}٪ من الخطة`, `${subject.icon} ${subject.name}`,
      `${num(subject.session_count)} حصة — ${fmtMinutes(subject.minutes)}`),
    state.user
      ? h('section', { class: 'card' },
          progressBar(done, subject.session_count),
          h('p', { class: 'small muted', style: { margin: '.4rem 0 0' } },
            `أنجزت ${num(done)} من ${num(subject.session_count)} حصة (${num(pct(done, subject.session_count))}٪)`),
          isStaff() ? h('div', { class: 'row', style: { marginTop: '.5rem' } },
            h('a', { class: 'btn sm soft', href: `#/admin/year/${year.id}?subject=${subject.id}` }, '⚙ إدارة حصص المادة')) : null)
      : null,
    h('div', { class: 'field', style: { marginTop: '.9rem' } }, search),
    listHost);
}
