// لوحة الطالب: التقدّم في الصف والمواد
import { h, num, pageHead, empty, chip, progressBar, ring, pct, fmtMinutes, fmtDate } from '../dom.js';
import { api } from '../api.js';
import { state } from '../store.js';
import { navigate } from '../router.js';

export async function meView() {
  if (!state.user) {
    navigate('/login', { replace: true });
    return h('div');
  }
  const data = await api.myProgress();
  const currentYear = data.years.find((y) => y.id === state.user.year_id) || data.years[0] || null;

  return h('div', {},
    pageHead('لوحتي', `مرحباً ${state.user.full_name}`,
      currentYear ? `صفّك الحالي: ${currentYear.title}` : 'لم يتم ربط حسابك بصف — حدّث عمرك من صفحة الحساب.'),
    h('div', { class: 'grid cols-4' },
      h('div', { class: 'stat' }, h('strong', {}, num(data.totals.completed)), h('small', {}, 'حصة منجزة')),
      h('div', { class: 'stat' }, h('strong', {}, num(Math.round((data.totals.minutes || 0) / 60))), h('small', {}, 'ساعة دراسية')),
      h('div', { class: 'stat' }, h('strong', {}, num(Math.round((data.totals.seconds_spent || 0) / 60))), h('small', {}, 'دقيقة اطّلاع')),
      h('div', { class: 'stat' }, h('strong', {}, num(data.subjects.length)), h('small', {}, 'مادة')),
    ),
    data.next
      ? h('section', { class: 'card', style: { marginTop: '.9rem', borderColor: 'var(--brand)' } },
          h('div', { class: 'card-title' }, h('h3', {}, '▶ الحصة التالية')),
          h('p', { class: 'muted small' }, `${data.next.subject_icon} ${data.next.subject_name} — ${data.next.title}`),
          h('a', { class: 'btn block', href: `#/session/${data.next.id}` }, 'ابدأ الآن'))
      : null,
    currentYear
      ? h('section', { class: 'card' },
          h('div', { class: 'card-title' }, h('h3', {}, `📈 تقدّمك في ${currentYear.title}`)),
          progressBar(currentYear.completed || 0, currentYear.total || 0),
          h('p', { class: 'small muted', style: { margin: '.4rem 0 0' } },
            `${num(currentYear.completed || 0)} من ${num(currentYear.total || 0)} حصة — ${fmtMinutes(currentYear.minutes_done || 0)} من ٣٠٠ ساعة`),
          h('a', { class: 'btn soft sm', style: { marginTop: '.5rem' }, href: `#/year/${currentYear.id}` }, 'عرض الصف'))
      : null,
    h('h2', { style: { marginTop: '1.1rem' } }, 'المواد'),
    data.subjects.length
      ? h('div', { class: 'grid cols-2' },
          ...data.subjects.map((s) =>
            h('div', { class: 'tile', style: { '--tile-color': s.color } },
              h('div', { class: 'tile-top' },
                h('span', { class: 'tile-icon' }, s.icon),
                h('div', { style: { flex: '1' } },
                  h('strong', {}, s.name),
                  h('div', { class: 'tile-meta' }, chip(`${num(s.completed || 0)} / ${num(s.total || 0)}`))),
                ring(s.completed || 0, s.total || 0, s.color)),
              progressBar(s.completed || 0, s.total || 0))))
      : empty('📚', 'لا توجد مواد مرتبطة بحسابك'),
    h('h2', { style: { marginTop: '1.1rem' } }, 'آخر نشاط'),
    data.recent.length
      ? h('div', { class: 'session-list' },
          ...data.recent.map((r) =>
            h('a', { class: `session-item${r.status === 'completed' ? ' done' : ''}`, href: `#/session/${r.id}` },
              h('span', { class: 'seq' }, r.status === 'completed' ? '✔' : '⏳'),
              h('span', { class: 'body' },
                h('strong', {}, r.title),
                h('span', { class: 'sub' },
                  h('span', {}, `${r.subject_icon} ${r.subject_name}`),
                  h('span', {}, r.year_title),
                  h('span', {}, fmtDate(r.updated_at)))))))
      : empty('🕓', 'لم تبدأ أي حصة بعد', 'اختر صفّك من الصفحة الرئيسية وابدأ أول حصة.'),
    h('p', { class: 'small muted center', style: { marginTop: '1rem' } },
      `نسبة إتمام صفّك: ${num(pct(currentYear?.completed || 0, currentYear?.total || 0))}٪`));
}
