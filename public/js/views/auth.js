// تسجيل الدخول وإنشاء حساب طالب
import { h, num, pageHead } from '../dom.js';
import { api } from '../api.js';
import { setUser, state, toast, toastError } from '../store.js';
import { navigate } from '../router.js';

const AGES = Array.from({ length: 15 }, (_, i) => 4 + i); // ٤ إلى ١٨ سنة

function field(label, input) {
  return h('div', { class: 'field' }, h('label', { for: input.id || undefined }, label), input);
}

export async function loginView({ query }) {
  if (state.user) {
    navigate('/me', { replace: true });
    return h('div');
  }

  let mode = query.mode === 'register' ? 'register' : 'login';
  const host = h('div', { class: 'auth-wrap' });

  const render = () => {
    host.replaceChildren();
    const tabs = h('div', { class: 'tabs' },
      h('button', { class: mode === 'login' ? 'active' : '', type: 'button', onclick: () => { mode = 'login'; render(); } }, 'دخول'),
      h('button', { class: mode === 'register' ? 'active' : '', type: 'button', onclick: () => { mode = 'register'; render(); } }, 'حساب جديد'));

    const username = h('input', { id: 'username', name: 'username', autocomplete: 'username', required: true, placeholder: 'مثال: ali' });
    const password = h('input', { id: 'password', name: 'password', type: 'password', autocomplete: mode === 'login' ? 'current-password' : 'new-password', required: true, minlength: 6 });
    const fullName = h('input', { id: 'full_name', name: 'full_name', autocomplete: 'name', required: true, placeholder: 'الاسم كما تحب أن يظهر' });
    const ageSelect = h('select', { id: 'age', name: 'age' },
      h('option', { value: '' }, 'اختر العمر (اختياري)'),
      ...AGES.map((a) => h('option', { value: String(a) }, `${num(a)} سنة`)));

    const submit = h('button', { class: 'btn block', type: 'submit' }, mode === 'login' ? 'دخول' : 'إنشاء الحساب');

    const form = h('form', {
      onsubmit: async (event) => {
        event.preventDefault();
        submit.disabled = true;
        try {
          const payload = { username: username.value.trim().toLowerCase(), password: password.value };
          const result = mode === 'login'
            ? await api.login(payload)
            : await api.register({ ...payload, full_name: fullName.value.trim(), age: ageSelect.value || null });
          setUser(result.user);
          toast(`أهلاً بك ${result.user.full_name}`, 'ok');
          navigate(result.user.role === 'student' ? '/me' : '/admin');
        } catch (err) {
          toastError(err);
        } finally {
          submit.disabled = false;
        }
      },
    },
      field('اسم المستخدم', username),
      mode === 'register' ? field('الاسم الكامل', fullName) : null,
      field('كلمة المرور', password),
      mode === 'register' ? field('العمر', ageSelect) : null,
      mode === 'register' ? h('p', { class: 'small muted' }, 'العمر يحدّد صفّك الدراسي تلقائياً (٦ سنوات = الصف الأول)، ويمكن تغييره لاحقاً.') : null,
      submit);

    host.append(
      pageHead('منصة منهاج', mode === 'login' ? 'تسجيل الدخول' : 'حساب طالب جديد',
        'حفظ التقدّم ونتائج الأنشطة التفاعلية يتطلّب حساباً.'),
      h('section', { class: 'card' }, tabs, form),
      h('p', { class: 'small muted center' }, 'يمكنك تصفّح المناهج والمرفقات دون حساب، لكن التقدّم لا يُحفظ.')
    );
  };

  render();
  return host;
}

export async function profileView() {
  if (!state.user) {
    navigate('/login', { replace: true });
    return h('div');
  }
  const fullName = h('input', { value: state.user.full_name, required: true });
  const ageSelect = h('select', {},
    h('option', { value: '' }, 'غير محدّد'),
    ...AGES.map((a) => h('option', { value: String(a), selected: state.user.age === a }, `${num(a)} سنة`)));
  const password = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'اتركها فارغة لعدم التغيير', minlength: 6 });
  const submit = h('button', { class: 'btn', type: 'submit' }, 'حفظ التعديلات');

  const form = h('form', {
    onsubmit: async (event) => {
      event.preventDefault();
      submit.disabled = true;
      try {
        const body = { full_name: fullName.value.trim(), age: ageSelect.value || null };
        if (password.value) body.password = password.value;
        const { user } = await api.patch('/api/auth/me', body);
        setUser(user);
        password.value = '';
        toast('تم حفظ البيانات', 'ok');
      } catch (err) {
        toastError(err);
      } finally {
        submit.disabled = false;
      }
    },
  },
    field('الاسم الكامل', fullName),
    field('العمر', ageSelect),
    field('كلمة مرور جديدة', password),
    submit);

  return h('div', {},
    pageHead('حسابي', state.user.full_name, `اسم المستخدم: ${state.user.username} — الصفة: ${
      { admin: 'مشرف', teacher: 'معلم', student: 'طالب' }[state.user.role]
    }`),
    h('section', { class: 'card' }, form),
    h('section', { class: 'card' },
      h('h3', {}, 'تسجيل الخروج'),
      h('button', {
        class: 'btn danger',
        type: 'button',
        onclick: async () => {
          await api.logout();
          setUser(null);
          toast('تم تسجيل الخروج');
          navigate('/');
        },
      }, 'خروج')));
}
