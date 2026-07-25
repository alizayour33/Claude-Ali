// موجّه بسيط يعتمد على الهاش (#/path) ليعمل بدون إعدادات سيرفر إضافية
import { clear, spinner, empty, h } from './dom.js';

const routes = [];
let target = null;
let currentToken = 0;

export function route(pattern, loader) {
  const keys = [];
  const regex = new RegExp(
    '^' +
      pattern
        .split('/')
        .map((part) => {
          if (part.startsWith(':')) {
            keys.push(part.slice(1));
            return '([^/]+)';
          }
          return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        })
        .join('/') +
      '/?$'
  );
  routes.push({ regex, keys, loader });
}

export const currentPath = () => {
  const hash = location.hash.replace(/^#/, '');
  return hash || '/';
};

export function navigate(path, { replace = false } = {}) {
  const next = `#${path.startsWith('/') ? path : '/' + path}`;
  if (location.hash === next) return resolve();
  if (replace) location.replace(next);
  else location.hash = next;
}

async function resolve() {
  if (!target) return;
  const token = ++currentToken;
  const [pathname, queryString = ''] = currentPath().split('?');
  const query = Object.fromEntries(new URLSearchParams(queryString));

  const match = routes
    .map((r) => ({ r, m: r.regex.exec(pathname) }))
    .find((x) => x.m);

  clear(target).appendChild(spinner());

  if (!match) {
    clear(target).appendChild(
      h('div', {}, empty('🧭', 'الصفحة غير موجودة', 'تحقّق من الرابط أو ارجع للصفحة الرئيسية'),
        h('div', { class: 'center' }, h('a', { class: 'btn', href: '#/' }, 'الصفحة الرئيسية')))
    );
    return;
  }

  const params = Object.fromEntries(match.r.keys.map((key, i) => [key, decodeURIComponent(match.m[i + 1])]));
  try {
    const node = await match.r.loader({ params, query, navigate, path: pathname });
    if (token !== currentToken) return; // تم الانتقال لصفحة أخرى أثناء التحميل
    clear(target).appendChild(node ?? h('div'));
    target.focus({ preventScroll: true });
    if (!location.hash.includes('noscroll')) window.scrollTo({ top: 0, behavior: 'instant' });
  } catch (err) {
    if (token !== currentToken) return;
    clear(target).appendChild(
      h('div', { class: 'card' },
        h('h2', {}, 'تعذّر تحميل الصفحة'),
        h('p', { class: 'muted' }, err.message || 'خطأ غير متوقّع'),
        h('button', { class: 'btn', onclick: () => resolve() }, 'إعادة المحاولة'))
    );
  }
}

export function startRouter(mountTarget) {
  target = mountTarget;
  window.addEventListener('hashchange', resolve);
  resolve();
}

export const reload = resolve;
