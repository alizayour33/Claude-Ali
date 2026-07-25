// إدارة المستويات والمواد وجدول الحصص
import { h, num, pageHead, empty, chip, clear, spinner, fmtMinutes } from '../dom.js';
import { api } from '../api.js';
import { isStaff, toast, toastError, confirmAction } from '../store.js';
import { navigate, reload } from '../router.js';
import { pager } from './parts.js';

const guard = () => {
  if (!isStaff()) {
    navigate('/login', { replace: true });
    return false;
  }
  return true;
};

const field = (label, input, hint) =>
  h('div', { class: 'field' }, h('label', {}, label), input, hint && h('div', { class: 'small muted' }, hint));

/* ------------------------------ قائمة المستويات ------------------------------ */

export async function adminView() {
  if (!guard()) return h('div');
  const { years, grades = [], stages = [] } = await api.years();

  const used = new Set(years.map((y) => y.grade));
  const available = grades.filter((g) => !used.has(g.grade));
  const stageNames = Object.fromEntries(stages.map((st) => [st.key, st.name]));

  const gradeSelect = h('select', {},
    h('option', { value: '' }, 'صف مخصّص (بدون ربط)'),
    ...available.map((g) => h('option', { value: String(g.grade) }, `${g.title} — عمر ${num(g.age)} (${stageNames[g.stage] || ''})`)));
  const title = h('input', { required: true, placeholder: 'مثال: الصف الأول' });
  const ageMin = h('input', { type: 'number', min: 3, max: 99, value: '6' });
  const ageMax = h('input', { type: 'number', min: 3, max: 99, value: '6' });

  // اختيار صف جاهز يملأ العنوان والعمر تلقائياً
  gradeSelect.addEventListener('change', () => {
    const level = grades.find((g) => String(g.grade) === gradeSelect.value);
    if (!level) return;
    title.value = level.title;
    ageMin.value = String(level.age);
    ageMax.value = String(level.age);
  });
  if (available.length) {
    gradeSelect.value = String(available[0].grade);
    gradeSelect.dispatchEvent(new Event('change'));
  }
  const hours = h('input', { type: 'number', min: 1, max: 5000, value: '180' });
  const minutes = h('input', { type: 'number', min: 5, max: 480, value: '60' });
  const description = h('textarea', { rows: 2, placeholder: 'وصف مختصر للصف' });
  const generate = h('input', { type: 'checkbox', checked: true });
  const submit = h('button', { class: 'btn', type: 'submit' }, 'إنشاء الصف');

  const createForm = h('form', {
    onsubmit: async (event) => {
      event.preventDefault();
      submit.disabled = true;
      try {
        const { year, schedule } = await api.post('/api/years', {
          grade: gradeSelect.value === '' ? null : Number(gradeSelect.value),
          title: title.value.trim(),
          age_min: Number(ageMin.value),
          age_max: Number(ageMax.value),
          total_hours: Number(hours.value),
          session_minutes: Number(minutes.value),
          description: description.value,
          generate: generate.checked,
        });
        toast(schedule ? `تم إنشاء «${year.title}» مع ${num(schedule.created)} حصة` : `تم إنشاء «${year.title}»`, 'ok');
        navigate(`/admin/year/${year.id}`);
      } catch (err) {
        toastError(err);
      } finally {
        submit.disabled = false;
      }
    },
  },
    field('الصف الدراسي', gradeSelect, 'يملأ العنوان والعمر ونِسب المواد المناسبة للمرحلة تلقائياً'),
    field('عنوان الصف', title),
    h('div', { class: 'field-row' }, field('العمر من', ageMin), field('العمر إلى', ageMax)),
    h('div', { class: 'field-row' },
      field('مجموع الساعات', hours, 'الافتراضي ١٨٠ ساعة = ١٨٠ حصة'),
      field('مدة الحصة (دقيقة)', minutes, 'عدد الحصص = الساعات × ٦٠ ÷ مدة الحصة')),
    field('الوصف', description),
    h('label', { class: 'checkbox' }, generate, 'توليد جدول الحصص تلقائياً بعد الإنشاء'),
    submit);

  const rows = years.map((year) =>
    h('div', { class: 'card' },
      h('div', { class: 'row between' },
        h('div', {},
          h('strong', {}, year.title),
          h('div', { class: 'row', style: { marginTop: '.3rem' } },
            year.stage_name ? chip(year.stage_name, 'brand') : null,
            chip(year.age_min === year.age_max ? `${num(year.age_min)} سنة` : `${num(year.age_min)}–${num(year.age_max)} سنة`),
            chip(`${num(year.total_hours)} ساعة`),
            chip(`${num(year.session_count)} / ${num(year.planned_sessions)} حصة`),
            chip(`${num(year.resource_count)} مرفق`),
            year.is_published ? chip('منشور', 'ok') : chip('غير منشور', 'warn'))),
        h('div', { class: 'btn-row' },
          h('a', { class: 'btn sm soft', href: `#/admin/year/${year.id}` }, '⚙ إدارة'),
          h('a', { class: 'btn sm ghost', href: `#/year/${year.id}` }, '👁 معاينة'),
          h('button', {
            class: 'btn sm danger',
            type: 'button',
            onclick: async () => {
              if (!confirmAction(`حذف «${year.title}» مع كل مواده وحصصه ومرفقاته؟`)) return;
              try {
                await api.del(`/api/years/${year.id}`);
                toast('تم الحذف');
                reload();
              } catch (err) {
                toastError(err);
              }
            },
          }, '🗑')))));

  return h('div', {},
    pageHead('لوحة الإدارة', 'الصفوف الدراسية والمناهج',
      'من الروضة الأولى إلى الصف الثاني عشر — كل صف مرتبط بمرحلته وعمره، ويحتوي المواد الخمس وجدول حصصه.'),
    h('div', { class: 'row', style: { marginBottom: '.8rem' } },
      h('a', { class: 'btn sm soft', href: '#/admin/reports' }, '📊 تقارير الطلاب'),
      h('a', { class: 'btn sm soft', href: '#/admin/users' }, '👥 المستخدمون')),
    h('details', { class: 'acc' },
      h('summary', {}, '➕ إضافة صف جديد'),
      h('div', {}, createForm)),
    years.length ? h('div', {}, ...rows) : empty('🗂️', 'لا توجد صفوف', 'ابدأ بإضافة صف.'));
}

/* -------------------------- إدارة مستوى: مواد وحصص -------------------------- */

function subjectRow(subject, onChanged) {
  const name = h('input', { value: subject.name });
  const icon = h('input', { value: subject.icon, style: { maxWidth: '4.5rem', textAlign: 'center' } });
  const color = h('input', { type: 'color', value: subject.color });
  const share = h('input', { type: 'number', min: 0, max: 100, value: String(subject.share), style: { maxWidth: '5.5rem' } });
  const target = h('input', {
    type: 'number', min: 0, max: 5000, placeholder: 'حسب النسبة',
    value: subject.target_sessions == null ? '' : String(subject.target_sessions),
  });

  return h('div', { class: 'card' },
    h('div', { class: 'row between' },
      h('strong', {}, `${subject.icon} ${subject.name}`),
      h('div', { class: 'row' },
        chip(`${num(subject.session_count)} حصة`),
        chip(fmtMinutes(subject.minutes)),
        subject.target_sessions == null ? chip(`${num(subject.share)}٪`) : chip(`عدد ثابت: ${num(subject.target_sessions)}`, 'brand'))),
    h('div', { class: 'field-row', style: { marginTop: '.5rem' } },
      field('الاسم', name), field('الرمز', icon), field('اللون', color), field('النسبة ٪', share),
      field('عدد الحصص', target, 'اتركه فارغاً ليُحسب من النسبة')),
    h('div', { class: 'btn-row' },
      h('button', {
        class: 'btn sm',
        type: 'button',
        onclick: async () => {
          try {
            await api.patch(`/api/subjects/${subject.id}`, {
              name: name.value.trim(),
              icon: icon.value.trim(),
              color: color.value,
              share: Number(share.value),
              target_sessions: target.value === '' ? null : Number(target.value),
            });
            toast('تم حفظ المادة — استخدم «توليد الجدول» لتطبيق عدد الحصص', 'ok');
            onChanged();
          } catch (err) {
            toastError(err);
          }
        },
      }, '💾 حفظ'),
      h('a', { class: 'btn sm ghost', href: `#/year/${subject.year_id}/subject/${subject.id}` }, '👁 معاينة'),
      h('button', {
        class: 'btn sm danger',
        type: 'button',
        onclick: async () => {
          if (!confirmAction(`حذف مادة «${subject.name}» وكل حصصها ومرفقاتها؟`)) return;
          try {
            await api.del(`/api/subjects/${subject.id}`);
            toast('تم حذف المادة');
            onChanged();
          } catch (err) {
            toastError(err);
          }
        },
      }, '🗑')));
}

export async function adminYearView({ params, query }) {
  if (!guard()) return h('div');
  const { year } = await api.year(params.id);
  const totalShare = year.subjects.reduce((sum, s) => sum + s.share, 0);

  /* إعدادات الصف */
  const title = h('input', { value: year.title, required: true });
  const ageMin = h('input', { type: 'number', min: 3, max: 99, value: String(year.age_min) });
  const ageMax = h('input', { type: 'number', min: 3, max: 99, value: String(year.age_max) });
  const hours = h('input', { type: 'number', min: 1, max: 5000, value: String(year.total_hours) });
  const minutes = h('input', { type: 'number', min: 5, max: 480, value: String(year.session_minutes) });
  const description = h('textarea', { rows: 2, value: year.description });
  const published = h('input', { type: 'checkbox', checked: year.is_published });

  const settingsForm = h('form', {
    onsubmit: async (event) => {
      event.preventDefault();
      try {
        await api.patch(`/api/years/${year.id}`, {
          title: title.value.trim(),
          age_min: Number(ageMin.value),
          age_max: Number(ageMax.value),
          total_hours: Number(hours.value),
          session_minutes: Number(minutes.value),
          description: description.value,
          is_published: published.checked,
        });
        toast('تم حفظ إعدادات الصف', 'ok');
        reload();
      } catch (err) {
        toastError(err);
      }
    },
  },
    field('العنوان', title),
    h('div', { class: 'field-row' }, field('العمر من', ageMin), field('العمر إلى', ageMax)),
    h('div', { class: 'field-row' }, field('مجموع الساعات', hours), field('مدة الحصة (دقيقة)', minutes)),
    field('الوصف', description),
    h('label', { class: 'checkbox' }, published, 'منشور للطلاب'),
    h('button', { class: 'btn', type: 'submit' }, '💾 حفظ الإعدادات'));

  /* إضافة مادة */
  const newSubjectName = h('input', { placeholder: 'اسم المادة الجديدة' });
  const newSubjectKey = h('input', { placeholder: 'المفتاح بالإنجليزية (اختياري)' });
  const newSubjectIcon = h('input', { value: '📘', style: { maxWidth: '4.5rem', textAlign: 'center' } });
  const newSubjectShare = h('input', { type: 'number', min: 0, max: 100, value: '10' });
  const newSubjectTarget = h('input', { type: 'number', min: 0, max: 5000, placeholder: 'حسب النسبة' });
  const addSubjectForm = h('form', {
    onsubmit: async (event) => {
      event.preventDefault();
      try {
        await api.post(`/api/years/${year.id}/subjects`, {
          name: newSubjectName.value.trim(),
          key: newSubjectKey.value.trim(),
          icon: newSubjectIcon.value.trim(),
          share: Number(newSubjectShare.value),
          target_sessions: newSubjectTarget.value === '' ? null : Number(newSubjectTarget.value),
        });
        toast('تمت إضافة المادة', 'ok');
        reload();
      } catch (err) {
        toastError(err);
      }
    },
  },
    h('div', { class: 'field-row' },
      field('اسم المادة', newSubjectName), field('المفتاح', newSubjectKey),
      field('الرمز', newSubjectIcon), field('النسبة ٪', newSubjectShare),
      field('عدد الحصص', newSubjectTarget, 'اختياري')),
    h('button', { class: 'btn sm', type: 'submit' }, '➕ إضافة المادة'));

  /* جدول الحصص */
  const selectedSubjectId = query.subject || year.subjects[0]?.id;
  const sessionsHost = h('div', {}, spinner());

  const PAGE = 20;

  const loadSessions = async (subjectId, offset = 0) => {
    clear(sessionsHost).appendChild(spinner());
    try {
      const page = await api.yearSessions(year.id, { subject_id: subjectId, limit: PAGE, offset });
      const sessions = page.sessions;
      const list = h('div', { class: 'session-list' },
        ...sessions.map((s) =>
          h('div', { class: 'session-item' },
            h('span', { class: 'seq' }, num(s.seq)),
            h('span', { class: 'body' },
              h('strong', {}, s.title),
              h('span', { class: 'sub' },
                h('span', {}, `${num(s.duration_minutes)} د`),
                h('span', {}, `${num(s.resource_count)} مرفق`),
                !s.is_published ? chip('مسودة', 'warn') : null)),
            h('span', { class: 'btn-row' },
              h('a', { class: 'btn sm soft', href: `#/admin/session/${s.id}` }, '✎'),
              h('button', {
                class: 'btn sm ghost', type: 'button', title: 'أعلى',
                onclick: async () => {
                  await api.post(`/api/sessions/${s.id}/move`, { direction: 'up' });
                  loadSessions(subjectId, page.offset);
                },
              }, '▲'),
              h('button', {
                class: 'btn sm ghost', type: 'button', title: 'أسفل',
                onclick: async () => {
                  await api.post(`/api/sessions/${s.id}/move`, { direction: 'down' });
                  loadSessions(subjectId, page.offset);
                },
              }, '▼'),
              h('button', {
                class: 'btn sm danger', type: 'button',
                onclick: async () => {
                  if (!confirmAction(`حذف الحصة «${s.title}» ومرفقاتها؟`)) return;
                  try {
                    await api.del(`/api/sessions/${s.id}`);
                    toast('تم حذف الحصة');
                    loadSessions(subjectId, page.offset);
                  } catch (err) {
                    toastError(err);
                  }
                },
              }, '🗑')))));

      clear(sessionsHost).append(
        h('div', { class: 'row between', style: { marginBottom: '.5rem' } },
          h('span', { class: 'small muted' }, `${num(page.total)} حصة في المادة`),
          h('span', { class: 'btn-row' },
            h('button', {
              class: 'btn sm', type: 'button',
              onclick: async () => {
                try {
                  const { session } = await api.post(`/api/subjects/${subjectId}/sessions`, {});
                  toast('تمت إضافة حصة', 'ok');
                  navigate(`/admin/session/${session.id}`);
                } catch (err) {
                  toastError(err);
                }
              },
            }, '➕ حصة جديدة'),
            h('button', {
              class: 'btn sm ghost', type: 'button',
              onclick: async (event) => {
                const answer = window.prompt('كم حصة تريد إضافتها إلى هذه المادة؟', '10');
                if (!answer) return;
                const count = Math.max(1, Math.min(200, parseInt(answer, 10) || 0));
                const btn = event.currentTarget;
                btn.disabled = true;
                try {
                  const result = await api.post(`/api/subjects/${subjectId}/sessions`, { count });
                  toast(`تمت إضافة ${num(result.created)} حصة`, 'ok');
                  loadSessions(subjectId, page.offset);
                } catch (err) {
                  toastError(err);
                } finally {
                  btn.disabled = false;
                }
              },
            }, '➕➕ إضافة عدة حصص'))),
        sessions.length ? list : empty('📋', 'لا توجد حصص في هذه المادة'),
        pager(page, (nextOffset) => loadSessions(subjectId, nextOffset)) || h('span')
      );
    } catch (err) {
      clear(sessionsHost).appendChild(h('p', { class: 'muted' }, err.message));
    }
  };

  const subjectSelect = h('select', {
    onchange: (e) => loadSessions(e.target.value, 0),
  }, ...year.subjects.map((s) => h('option', { value: String(s.id), selected: String(s.id) === String(selectedSubjectId) }, `${s.icon} ${s.name} (${num(s.session_count)})`)));

  if (selectedSubjectId) loadSessions(selectedSubjectId);
  else clear(sessionsHost).appendChild(empty('📚', 'أضف مادة أولاً'));

  return h('div', {},
    h('div', { class: 'row', style: { marginBottom: '.6rem' } },
      h('a', { class: 'btn ghost sm', href: '#/admin' }, '› الصفوف'),
      h('a', { class: 'btn ghost sm', href: `#/year/${year.id}` }, '👁 معاينة الصف')),
    pageHead(['إدارة صف', year.stage_name].filter(Boolean).join(' · '), year.title,
      `${num(year.totals.sessions)} حصة من أصل ${num(year.planned_sessions)} مخطّطة · ${num(year.totals.resources)} مرفق`),

    h('section', { class: 'card' },
      h('div', { class: 'card-title' }, h('h3', {}, '🧮 توليد جدول الحصص')),
      h('p', { class: 'small muted' },
        `توزيع ${num(year.total_hours)} ساعة (${num(year.planned_sessions)} حصة) على المواد: كل مادة حُدِّد لها «عدد حصص» تأخذه كما هو، والباقي يتقاسم ما تبقّى حسب النِسب. الحصص الموجودة تبقى، ويُضاف الناقص فقط، ولا تُحذف أي حصة تحتوي مرفقات.`),
      totalShare !== 100
        ? h('p', { class: 'small' }, chip(`مجموع النِسب ${num(totalShare)}٪ — يُفضّل أن يكون ١٠٠٪`, 'warn'))
        : null,
      h('button', {
        class: 'btn gold',
        type: 'button',
        onclick: async (event) => {
          const btn = event.currentTarget;
          btn.disabled = true;
          try {
            const { schedule } = await api.post(`/api/years/${year.id}/generate`, {});
            toast(`أُضيفت ${num(schedule.created)} حصة، حُذفت ${num(schedule.deleted)} فارغة، المجموع ${num(schedule.total)}`, 'ok');
            reload();
          } catch (err) {
            toastError(err);
          } finally {
            btn.disabled = false;
          }
        },
      }, '⚙ توليد/إكمال الجدول')),

    h('h2', { style: { marginTop: '1.1rem' } }, 'المواد والنِسب'),
    h('div', {}, ...year.subjects.map((s) => subjectRow(s, reload))),
    h('details', { class: 'acc' }, h('summary', {}, '➕ إضافة مادة'), h('div', {}, addSubjectForm)),

    h('h2', { style: { marginTop: '1.1rem' } }, 'حصص المادة'),
    h('section', { class: 'card' },
      field('اختر المادة', subjectSelect),
      sessionsHost),

    h('details', { class: 'acc', style: { marginTop: '1rem' } },
      h('summary', {}, '⚙ إعدادات الصف'),
      h('div', {}, settingsForm)));
}
