// نقطة انطلاق التطبيق: التنقّل، المظهر، البحث، وتسجيل المسارات
import { h, clear, empty, num } from './dom.js';
import { api } from './api.js';
import { state, setUser, subscribe, isStaff, isAdmin, toastError } from './store.js';
import { route, startRouter, currentPath, navigate } from './router.js';
import { homeView } from './views/home.js';
import { yearView, subjectView } from './views/year.js';
import { sessionView } from './views/session.js';
import { loginView, profileView } from './views/auth.js';
import { meView } from './views/me.js';
import { adminView, adminYearView } from './views/admin.js';
import { adminSessionView } from './views/admin-session.js';
import { usersView, reportsView } from './views/admin-users.js';

/* ---------------------------------- المظهر ---------------------------------- */
const THEME_KEY = 'manhaj:theme';
const applyTheme = (theme) => {
  if (theme) document.documentElement.dataset.theme = theme;
  else delete document.documentElement.dataset.theme;
};
applyTheme(localStorage.getItem(THEME_KEY));
document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
  const current = document.documentElement.dataset.theme;
  const isDark = current === 'dark' || (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const next = isDark ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

/* ---------------------------------- التنقّل ---------------------------------- */
const sideNav = document.querySelector('[data-side-nav]');
const bottomNav = document.querySelector('[data-bottom-nav]');
const scrim = document.querySelector('[data-scrim]');
const userChip = document.querySelector('[data-user-chip]');

const closeNav = () => {
  sideNav.classList.remove('open');
  scrim.hidden = true;
};
document.querySelector('[data-nav-toggle]').addEventListener('click', () => {
  sideNav.classList.toggle('open');
  scrim.hidden = !sideNav.classList.contains('open');
});
scrim.addEventListener('click', closeNav);

function navItems() {
  const items = [
    { group: 'التعلّم', links: [
      { href: '#/', icon: '🏠', label: 'الرئيسية' },
      { href: '#/me', icon: '📈', label: 'تقدّمي', auth: true },
    ] },
  ];
  if (isStaff()) {
    items.push({ group: 'الإدارة', links: [
      { href: '#/admin', icon: '🗂️', label: 'الصفوف والمناهج' },
      { href: '#/admin/reports', icon: '📊', label: 'تقارير الطلاب' },
      ...(isAdmin() ? [{ href: '#/admin/users', icon: '👥', label: 'المستخدمون' }] : []),
    ] });
  }
  items.push({ group: 'الحساب', links: state.user
    ? [{ href: '#/profile', icon: '⚙️', label: 'حسابي' }]
    : [{ href: '#/login', icon: '🔑', label: 'دخول / حساب جديد' }] });
  return items;
}

function renderNav() {
  const path = `#${currentPath().split('?')[0]}`;
  clear(sideNav);
  navItems().forEach((section) => {
    const links = section.links.filter((link) => !link.auth || state.user);
    if (!links.length) return;
    sideNav.appendChild(
      h('div', { class: 'nav-group' },
        h('h4', {}, section.group),
        ...links.map((link) =>
          h('a', { class: `nav-link${path === link.href ? ' active' : ''}`, href: link.href, onclick: closeNav },
            h('span', { class: 'ico' }, link.icon), link.label)))
    );
  });

  const quick = [
    { href: '#/', icon: '🏠', label: 'الرئيسية' },
    ...(state.user ? [{ href: '#/me', icon: '📈', label: 'تقدّمي' }] : []),
    ...(isStaff() ? [{ href: '#/admin', icon: '🗂️', label: 'الإدارة' }] : []),
    state.user ? { href: '#/profile', icon: '⚙️', label: 'حسابي' } : { href: '#/login', icon: '🔑', label: 'دخول' },
  ];
  clear(bottomNav);
  quick.forEach((link) =>
    bottomNav.appendChild(
      h('a', { class: path === link.href ? 'active' : '', href: link.href },
        h('span', { class: 'ico' }, link.icon), h('span', {}, link.label))));

  if (state.user) {
    userChip.hidden = false;
    clear(userChip).append(
      h('span', { class: 'avatar' }, (state.user.full_name || '؟').trim().charAt(0)),
      h('a', { class: 'name', href: '#/profile', style: { color: '#fff' } }, state.user.full_name)
    );
  } else {
    userChip.hidden = true;
    clear(userChip);
  }
}

subscribe(renderNav);
window.addEventListener('hashchange', renderNav);

/* ----------------------------------- البحث ----------------------------------- */
const dialog = document.querySelector('[data-search-dialog]');
const searchForm = document.querySelector('[data-search-form]');
const searchResults = document.querySelector('[data-search-results]');

document.querySelector('[data-search-open]').addEventListener('click', () => {
  dialog.showModal();
  searchForm.q.focus();
});
dialog.addEventListener('click', (event) => {
  if (event.target.matches('[data-close-dialog]')) dialog.close();
});
searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const term = searchForm.q.value.trim();
  if (term.length < 2) return;
  clear(searchResults).appendChild(h('p', { class: 'muted small' }, 'جارٍ البحث…'));
  try {
    const { sessions } = await api.search(term);
    clear(searchResults);
    if (!sessions.length) {
      searchResults.appendChild(empty('🔍', 'لا نتائج', 'جرّب كلمة أخرى'));
      return;
    }
    sessions.forEach((s) =>
      searchResults.appendChild(
        h('a', {
          class: 'session-item',
          href: `#/session/${s.id}`,
          onclick: () => dialog.close(),
        },
          h('span', { class: 'seq' }, num(s.seq)),
          h('span', { class: 'body' },
            h('strong', {}, s.title),
            h('span', { class: 'sub' }, h('span', {}, `${s.subject_icon} ${s.subject_name}`), h('span', {}, `${num(s.resource_count)} مرفق`))))
      ));
  } catch (err) {
    clear(searchResults).appendChild(h('p', { class: 'muted small' }, err.message));
  }
});

/* ---------------------------------- المسارات ---------------------------------- */
route('/', homeView);
route('/year/:id', yearView);
route('/year/:id/subject/:subjectId', subjectView);
route('/session/:id', sessionView);
route('/login', loginView);
route('/profile', profileView);
route('/me', meView);
route('/admin', adminView);
route('/admin/year/:id', adminYearView);
route('/admin/session/:id', adminSessionView);
route('/admin/users', usersView);
route('/admin/reports', reportsView);

/* ----------------------------------- الإقلاع ----------------------------------- */
(async () => {
  try {
    const { user } = await api.me();
    setUser(user);
  } catch (err) {
    toastError(err);
  }
  renderNav();
  startRouter(document.querySelector('[data-view]'));

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
})();

// إعادة تحميل الصفحة الحالية عند العودة من الخلفية بعد وقت طويل ليس ضرورياً،
// لكن نحدّث حالة المستخدم لتفادي انتهاء الجلسة بصمت
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState !== 'visible' || !state.user) return;
  try {
    const { user } = await api.me();
    if (!user) {
      setUser(null);
      navigate('/login');
    }
  } catch {
    /* تجاهل */
  }
});
