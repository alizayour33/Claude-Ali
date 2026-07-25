// الصفحة الرئيسية: الصفوف الدراسية من الروضة الأولى إلى الصف الثاني عشر
import { h, num, pageHead, empty, chip, progressBar, pct, fmtMinutes } from '../dom.js';
import { api } from '../api.js';
import { state, setAgeFilter, isStaff } from '../store.js';
import { navigate } from '../router.js';

const AGES = Array.from({ length: 15 }, (_, i) => 4 + i); // ٤ إلى ١٨ سنة

const STAGE_ICONS = {
  kindergarten: '🧸',
  primary: '🏫',
  middle: '📚',
  secondary: '🎓',
};

export function yearTile(year) {
  const total = year.session_count ?? 0;
  const done = year.completed_count ?? 0;
  const ageLabel = year.age_min === year.age_max ? `${num(year.age_min)} سنة` : `${num(year.age_min)}–${num(year.age_max)} سنة`;
  return h('a', { class: 'tile', href: `#/year/${year.id}` },
    h('div', { class: 'tile-top' },
      h('span', { class: 'tile-icon' }, STAGE_ICONS[year.stage] || '🎓'),
      h('div', {},
        h('strong', {}, year.title),
        h('div', { class: 'tile-meta' },
          chip(`العمر: ${ageLabel}`),
          !year.is_published ? chip('غير منشور', 'warn') : null))),
    h('div', { class: 'tile-meta' },
      chip(`${num(year.total_hours)} ساعة`),
      chip(`${num(total)} حصة`),
      chip(`${num(year.resource_count ?? 0)} مرفق`)),
    state.user ? h('div', {}, progressBar(done, total),
      h('div', { class: 'small muted' }, `أنجزت ${num(done)} من ${num(total)} حصة (${num(pct(done, total))}٪)`)) : null);
}

export async function homeView() {
  const age = state.ageFilter;
  const [data, progress] = await Promise.all([
    api.years(age || undefined),
    state.user ? api.myProgress().catch(() => null) : Promise.resolve(null),
  ]);
  const { years, stages = [] } = data;

  /* الصفوف مجموعة تحت مراحلها الدراسية */
  const grouped = [...stages]
    .sort((a, b) => a.order - b.order)
    .map((stage) => ({ stage, items: years.filter((y) => y.stage === stage.key) }))
    .filter((group) => group.items.length);
  const ungrouped = years.filter((y) => !stages.some((s) => s.key === y.stage));
  if (ungrouped.length) {
    grouped.push({ stage: { key: '', name: 'صفوف أخرى', icon: '🗂️', order: 99 }, items: ungrouped });
  }

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
        h('div', { class: 'stat' }, h('strong', {}, num(Math.round((progress.totals?.minutes ?? 0) / 60))), h('small', {}, 'ساعة دراسية')),
        h('div', { class: 'stat' }, h('strong', {}, num(progress.subjects?.length ?? 0)), h('small', {}, 'مادة في صفّك')),
        h('div', { class: 'stat' }, h('strong', {}, num(years.length)), h('small', {}, 'صف متاح')))
    : null;

  return h('div', {},
    pageHead(
      'منصة منهاج',
      'اختر الصف الدراسي',
      'من الروضة الأولى إلى الصف الثاني عشر — كل صف ٣٠٠ ساعة موزّعة على القرآن والفقه والعقيدة والسيرة والأخلاق، مع مرفقات فيديو وصوت وPDF وأوفيس وSCORM.'
    ),
    continueCard,
    statsRow,
    age
      ? h('div', { class: 'row', style: { marginBottom: '.8rem' } },
          chip(`مصفّى حسب العمر: ${num(age)} سنة`, 'brand'),
          h('button', {
            class: 'btn sm ghost',
            type: 'button',
            onclick: () => {
              setAgeFilter(null);
              navigate('/');
            },
          }, '✖ إلغاء التصفية'))
      : null,

    grouped.length
      ? h('div', {},
          ...grouped.map((group) =>
            h('section', { style: { marginBottom: '1.2rem' } },
              h('div', { class: 'row between', style: { marginBottom: '.5rem' } },
                h('h2', { style: { margin: 0 } }, `${group.stage.icon || ''} ${group.stage.name}`),
                chip(`${num(group.items.length)} صف`)),
              h('div', { class: 'grid cols-3' }, ...group.items.map(yearTile)))))
      : empty('🗂️', age ? `لا يوجد صف مطابق لعمر ${num(age)} سنة` : 'لا توجد صفوف بعد',
          isStaff() ? 'أضف صفاً جديداً من صفحة الإدارة.' : 'جرّب إلغاء التصفية أو تواصل مع المشرف.'),

    h('details', { class: 'acc' },
      h('summary', {}, '🎂 أو اختر حسب عمر الطالب'),
      h('div', {},
        h('p', { class: 'small muted' }, 'يُعرض الصف الموافق لعمر الطالب المعتاد.'),
        ageGrid)),

    isStaff()
      ? h('div', { class: 'row', style: { marginTop: '.8rem' } },
          h('a', { class: 'btn sm soft', href: '#/admin' }, '⚙ إدارة الصفوف والمناهج'))
      : null,
    state.user && progress?.totals
      ? h('p', { class: 'small muted center', style: { marginTop: '1rem' } },
          `إجمالي ما أنجزته: ${num(progress.totals.completed)} حصة — ${fmtMinutes(progress.totals.minutes)}`)
      : null);
}
