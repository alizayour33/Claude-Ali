// عناصر مشتركة بين الصفحات
import { h, num, chip, kindMeta, ring, progressBar, pct } from '../dom.js';

/** عنصر حصة في القائمة. */
export function sessionItem(session, { showSubject = true } = {}) {
  const done = session.progress_status === 'completed';
  return h('a', { class: `session-item${done ? ' done' : ''}`, href: `#/session/${session.id}` },
    h('span', { class: 'seq' }, done ? '✔' : num(session.seq)),
    h('span', { class: 'body' },
      h('strong', {}, session.title),
      h('span', { class: 'sub' },
        showSubject ? h('span', {}, `${session.subject_icon} ${session.subject_name}`) : null,
        h('span', {}, `${num(session.duration_minutes)} دقيقة`),
        session.resource_count
          ? h('span', { class: 'kind-dots' }, ...session.resource_kinds.map((k) => h('span', { title: kindMeta(k).label }, kindMeta(k).icon)))
          : h('span', { class: 'muted' }, 'لا مرفقات'),
        !session.is_published ? chip('مسودة', 'warn') : null)),
    h('span', { class: 'muted', 'aria-hidden': 'true' }, '‹'));
}

/** بطاقة مادة داخل مستوى. */
export function subjectTile(subject, yearId, { showProgress = true } = {}) {
  const total = subject.session_count ?? 0;
  const done = subject.completed_count ?? 0;
  return h('a', {
    class: 'tile',
    href: `#/year/${yearId}/subject/${subject.id}`,
    style: { '--tile-color': subject.color },
  },
    h('div', { class: 'tile-top' },
      h('span', { class: 'tile-icon' }, subject.icon),
      h('div', { style: { flex: '1' } },
        h('strong', {}, subject.name),
        h('div', { class: 'tile-meta' },
          chip(`${num(total)} حصة`),
          chip(`${num(Math.round(subject.hours ?? total))} ساعة`),
          chip(`${num(subject.share)}٪ من الخطة`))),
      showProgress && total ? ring(done, total, subject.color) : null),
    showProgress && total
      ? h('div', {}, progressBar(done, total),
          h('div', { class: 'small muted' }, `${num(done)} / ${num(total)} — ${num(pct(done, total))}٪`))
      : null);
}

export const backLink = (href, label) => h('a', { class: 'btn ghost sm', href }, `› ${label}`);

/** شريط تنقّل بين صفحات القوائم الطويلة (٣٠٠ حصة لا تُعرض في صفحة واحدة). */
export function pager({ total, limit, offset }, onChange) {
  if (!limit || total <= limit) return null;
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.ceil(total / limit);
  return h('div', { class: 'row between', style: { marginTop: '.6rem' } },
    h('button', {
      class: 'btn ghost sm', type: 'button', disabled: page <= 1,
      onclick: () => onChange(Math.max(0, offset - limit)),
    }, '› السابق'),
    h('span', { class: 'small muted' }, `صفحة ${num(page)} من ${num(pages)} · ${num(total)} حصة`),
    h('button', {
      class: 'btn ghost sm', type: 'button', disabled: page >= pages,
      onclick: () => onChange(offset + limit),
    }, 'التالي ‹'));
}
