// حالة التطبيق المشتركة + إشعارات
import { h } from './dom.js';

export const state = {
  user: null,
  ageFilter: Number(localStorage.getItem('manhaj:age')) || null,
};

const listeners = new Set();
export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const notify = () => listeners.forEach((fn) => fn(state));

export function setUser(user) {
  state.user = user || null;
  notify();
}

export function setAgeFilter(age) {
  state.ageFilter = age || null;
  if (age) localStorage.setItem('manhaj:age', String(age));
  else localStorage.removeItem('manhaj:age');
  notify();
}

export const isStaff = () => !!state.user && ['admin', 'teacher'].includes(state.user.role);
export const isAdmin = () => state.user?.role === 'admin';

let toastHost = null;
export function toast(message, variant = '') {
  toastHost = toastHost || document.querySelector('[data-toasts]');
  if (!toastHost) return;
  const el = h('div', { class: `toast${variant ? ' ' + variant : ''}` }, message);
  toastHost.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s';
    setTimeout(() => el.remove(), 320);
  }, 3200);
}

export const toastError = (err) => toast(err?.message || 'حدث خطأ غير متوقّع', 'err');
export const confirmAction = (message) => window.confirm(message);

/** تغليف مُعالِج غير متزامن بحماية من الأخطاء وتعطيل الزر أثناء التنفيذ. */
export function busy(button, fn) {
  return async (event) => {
    const btn = button || event.currentTarget;
    const label = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = '…';
    }
    try {
      await fn(event);
    } catch (err) {
      toastError(err);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = label;
      }
    }
  };
}
