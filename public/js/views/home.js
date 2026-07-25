// الصفحة الرئيسية: اختيار العمر ثم المستويات المتاحة
import { h, num, pageHead, empty, chip, progressBar, pct, fmtMinutes } from '../dom.js';
import { api } from '../api.js';
import { state, setAgeFilter, isStaff } from '../store.js';
import { navigate } from '../router.js';

const AGES = Array.from({ length: 14 }, (_, i) => 5 + i); // ٥ إلى ١٨ سنة

export function yearTile(year) {
  const total = year.session_count ?? 0;
  const done = year.completed_count ?? 0;
  const ageLabel = year.age_min === year.age_max ? `${num(year.age_min)} سنة` : `${num(year.age_min)}–${num(year.age_max)} سنة`;
  return h('a', { class: 'tile', href: `#/year/${year.id}` },
    h('div', { class: 'tile-top' },
      h('span', { class: 'tile-icon' }, '🎓'),
      h('div', {},
        h('strong', {}, year.title),
        h('div', { class: 'tile-meta' }, chip(`العمر: ${ageLabel}`), !year.is_published ? chip('غير منشور', 'warn') : null))),
    h('div', { class: 'tile-meta' },
      chip(`${num(year.total_hours)} ساعة`),
      chip(`${num(total)} حصة`),
      chip(`${num(year.resource_count ?? 0)} مرفق`)),
    state.user ? h('div', {}, progressBar(done, total),
      h('div', { class: 'small muted' }, `أنجزت ${num(done)} من ${num(total)} حصة (${num(pct(done, total))}٪)`)) : null);
}

export async function homeView() {
  const age = state.ageFilter;
  const [{ years }, progress] = await Promise.all([
    api.years(age || undefined),
    state.user ? api.myProgress().catch(() => null) : Promise.resolve(null),
  ]);

  const ageGrid = h('div', { class: 'age-grid' },
    ...AGES.map((value) =>
      h('button', {
        class: `age-btn${age === value ? ' active' : ''}`,
        type: 'button',
        onclick: () => {
          setAgeFilter(age === value ? null : value);
          navigate('/');
        },
      }, h('strong', {}, num(value)), h('small', {}, 'سنة'))),
    h('button', {
      class: `age-btn${!age ? ' active' : ''}`,
      type: 'button',
      onclick: () => {
        setAgeFilter(null);
        navigate('/');
      },
    }, h('strong', {}, '⋯'), h('small', {}, 'كل الأعمار')));

  const continueCard = progress?.next
    ? h('section', { class: 'card', style: { borderColor: 'var(--brand)' } },
        h('div', { class: 'card-title' }, h('h2', {}, '▶ أكمل من حيث توقّفت')),
        h('p', { class: 'muted small' },
          `${progress.next.subject_icon} ${progress.next.subject_name} — ${progress.next.title}`),
        h('a', { class: 'btn block', href: `#/session/${progress.next.id}` }, 'ابدأ الحصة'))
    : null;

  const statsRow = state.user && progress
    ? h('div', { class: 'grid cols-4', style: { marginBottom: '.9rem' } },
        h('div', { class: 'stat' }, h('strong', {}, num(progress.totals?.completed ?? 0)), h('small', {}, 'حصة منجزة')),
        h('div', { class: 'stat' }, h('strong', {}, fmtMinutes(progress.totals?.minutes ?? 0).split(' ')[0]), h('small', {}, 'ساعة دراسية')),
        h('div', { class: 'stat' }, h('strong', {}, num(progress.subjects?.length ?? 0)), h('small', {}, 'مادة في مستواك')),
        h('div', { class: 'stat' }, h('strong', {}, num(progress.years?.length ?? 0)), h('small', {}, 'مستوى نشط')))
    : null;

  return h('div', {},
    pageHead(
      'منصة منهاج',
      'اختر العمر لتظهر خطة السنة',
      'كل سنة دراسية = ٣٠٠ ساعة موزّعة على القرآن والفقه والعقيدة والسيرة والأخلاق، مع مرفقات فيديو وصوت وPDF وأوفيس وSCORM.'
    ),
    continueCard,
    statsRow,
    h('section', { class: 'card' },
      h('div', { class: 'card-title' }, h('h2', {}, '👶 الفئة العمرية')),
      ageGrid),
    h('section', { style: { marginTop: '1rem' } },
      h('div', { class: 'row between', style: { marginBottom: '.5rem' } },
        h('h2', { style: { margin: 0 } }, age ? `مستويات عمر ${num(age)} سنة` : 'جميع المستويات'),
        isStaff() ? h('a', { class: 'btn sm soft', href: '#/admin' }, '➕ إدارة المستويات') : null),
      years.length
        ? h('div', { class: 'grid cols-3' }, ...years.map(yearTile))
        : empty('🗂️', 'لا توجد مستويات لهذا العمر',
            isStaff() ? 'أضف مستوى جديداً من صفحة الإدارة.' : 'جرّب اختيار عمر آخر أو تواصل مع المشرف.')));
}
