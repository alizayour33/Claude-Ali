// إدارة المستخدمين وتقارير الطلاب
import { h, num, pageHead, empty, chip, pct, progressBar, fmtDate, fmtMinutes } from '../dom.js';
import { api } from '../api.js';
import { isAdmin, isStaff, toast, toastError, confirmAction, state } from '../store.js';
import { navigate, reload } from '../router.js';

const ROLES = { admin: 'مشرف', teacher: 'معلم', student: 'طالب' };
const field = (label, input) => h('div', { class: 'field' }, h('label', {}, label), input);

export async function usersView() {
  if (!isAdmin()) {
    navigate(isStaff() ? '/admin' : '/login', { replace: true });
    return h('div');
  }
  const [{ users }, { years }] = await Promise.all([api.users(), api.years()]);

  const username = h('input', { required: true, placeholder: 'اسم المستخدم بالإنجليزية' });
  const fullName = h('input', { required: true, placeholder: 'الاسم الكامل' });
  const password = h('input', { type: 'password', required: true, minlength: 6, autocomplete: 'new-password' });
  const role = h('select', {}, ...Object.entries(ROLES).map(([value, label]) => h('option', { value, selected: value === 'student' }, label)));
  const age = h('input', { type: 'number', min: 3, max: 99, placeholder: 'العمر (للطلاب)' });

  const createForm = h('form', {
    onsubmit: async (event) => {
      event.preventDefault();
      try {
        await api.post('/api/auth/users', {
          username: username.value.trim().toLowerCase(),
          full_name: fullName.value.trim(),
          password: password.value,
          role: role.value,
          age: age.value || null,
        });
        toast('تم إنشاء الحساب', 'ok');
        reload();
      } catch (err) {
        toastError(err);
      }
    },
  },
    h('div', { class: 'field-row' }, field('اسم المستخدم', username), field('الاسم الكامل', fullName)),
    h('div', { class: 'field-row' }, field('كلمة المرور', password), field('الصفة', role), field('العمر', age)),
    h('button', { class: 'btn', type: 'submit' }, '➕ إنشاء'));

  const rows = users.map((user) => {
    const roleSelect = h('select', { style: { minWidth: '7rem' } },
      ...Object.entries(ROLES).map(([value, label]) => h('option', { value, selected: value === user.role }, label)));
    const yearSelect = h('select', { style: { minWidth: '9rem' } },
      h('option', { value: '' }, 'بدون مستوى'),
      ...years.map((y) => h('option', { value: String(y.id), selected: y.id === user.year_id }, y.title)));
    const newPassword = h('input', { type: 'password', placeholder: 'كلمة مرور جديدة', style: { minWidth: '9rem' } });

    return h('div', { class: 'card' },
      h('div', { class: 'row between' },
        h('div', {},
          h('strong', {}, user.full_name),
          h('div', { class: 'row', style: { marginTop: '.3rem' } },
            chip(`@${user.username}`),
            chip(ROLES[user.role], user.role === 'student' ? '' : 'brand'),
            user.age ? chip(`${num(user.age)} سنة`) : null,
            user.year_title ? chip(user.year_title) : null,
            chip(`${num(user.completed)} حصة منجزة`))),
        h('span', { class: 'small muted' }, fmtDate(user.created_at))),
      h('div', { class: 'field-row', style: { marginTop: '.5rem' } },
        field('الصفة', roleSelect), field('المستوى', yearSelect), field('كلمة المرور', newPassword)),
      h('div', { class: 'btn-row' },
        h('button', {
          class: 'btn sm', type: 'button',
          onclick: async () => {
            try {
              await api.patch(`/api/auth/users/${user.id}`, {
                role: roleSelect.value,
                year_id: yearSelect.value || null,
                ...(newPassword.value ? { password: newPassword.value } : {}),
              });
              toast('تم التحديث', 'ok');
              reload();
            } catch (err) {
              toastError(err);
            }
          },
        }, '💾 حفظ'),
        user.id !== state.user.id
          ? h('button', {
              class: 'btn sm danger', type: 'button',
              onclick: async () => {
                if (!confirmAction(`حذف حساب «${user.full_name}»؟`)) return;
                try {
                  await api.del(`/api/auth/users/${user.id}`);
                  toast('تم الحذف');
                  reload();
                } catch (err) {
                  toastError(err);
                }
              },
            }, '🗑')
          : chip('حسابك', 'brand')));
  });

  return h('div', {},
    h('div', { class: 'row', style: { marginBottom: '.6rem' } }, h('a', { class: 'btn ghost sm', href: '#/admin' }, '› لوحة الإدارة')),
    pageHead('الإدارة', 'المستخدمون', `${num(users.length)} حساب`),
    h('details', { class: 'acc' }, h('summary', {}, '➕ إضافة مستخدم'), h('div', {}, createForm)),
    users.length ? h('div', {}, ...rows) : empty('👥', 'لا مستخدمين'));
}

export async function reportsView() {
  if (!isStaff()) {
    navigate('/login', { replace: true });
    return h('div');
  }
  const { students } = await api.students();

  const table = h('div', { class: 'table-wrap' },
    h('table', {},
      h('thead', {}, h('tr', {},
        h('th', {}, 'الطالب'), h('th', {}, 'العمر'), h('th', {}, 'المستوى'),
        h('th', {}, 'الإنجاز'), h('th', {}, 'الساعات'), h('th', {}, 'آخر نشاط'))),
      h('tbody', {},
        ...students.map((s) =>
          h('tr', {},
            h('td', {}, h('strong', {}, s.full_name), h('div', { class: 'small muted' }, `@${s.username}`)),
            h('td', {}, s.age ? num(s.age) : '—'),
            h('td', {}, s.year_title || '—'),
            h('td', { style: { minWidth: '150px' } },
              h('div', { class: 'small' }, `${num(s.completed)} / ${num(s.total)} (${num(pct(s.completed, s.total))}٪)`),
              progressBar(s.completed, s.total)),
            h('td', {}, fmtMinutes(s.minutes)),
            h('td', {}, fmtDate(s.last_activity)))))));

  return h('div', {},
    h('div', { class: 'row', style: { marginBottom: '.6rem' } }, h('a', { class: 'btn ghost sm', href: '#/admin' }, '› لوحة الإدارة')),
    pageHead('التقارير', 'تقدّم الطلاب', `${num(students.length)} طالب`),
    students.length ? h('section', { class: 'card' }, table) : empty('📊', 'لا يوجد طلاب مسجّلون بعد'));
}
