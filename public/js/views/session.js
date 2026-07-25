// صفحة الحصة: الأهداف والمرفقات وتعليم الإنجاز
import { h, num, empty, chip, pageHead, fmtMinutes } from '../dom.js';
import { api } from '../api.js';
import { state, isStaff, toast, toastError } from '../store.js';
import { resourceCard } from './resource-view.js';
import { backLink } from './parts.js';

/** يسجّل وقت الاطّلاع على الحصة ويرسله عند مغادرة الصفحة. */
function trackTime(sessionId) {
  if (!state.user) return;
  const startedAt = Date.now();
  api.markProgress(sessionId, { status: 'in_progress', seconds: 0 }).catch(() => {});
  let sent = false;
  const send = () => {
    if (sent) return;
    sent = true;
    const seconds = Math.round((Date.now() - startedAt) / 1000);
    if (seconds < 5 || !navigator.sendBeacon) return;
    navigator.sendBeacon(
      `/api/progress/${sessionId}`,
      new Blob([JSON.stringify({ status: 'in_progress', seconds })], { type: 'application/json' })
    );
  };
  window.addEventListener('pagehide', send, { once: true });
  window.addEventListener('hashchange', send, { once: true });
}

export async function sessionView({ params }) {
  const data = await api.session(params.id);
  const { session, resources, year, prev, next } = data;
  const trackingByResource = new Map((data.scorm_tracking || []).map((t) => [t.resource_id, t]));
  trackTime(session.id);

  let completed = session.progress_status === 'completed';
  const statusChip = h('span', { class: `chip ${completed ? 'ok' : ''}` }, completed ? '✔ منجزة' : 'لم تُنجز بعد');

  const completeBtn = h('button', { class: `btn ${completed ? 'ghost' : ''}`, type: 'button' },
    completed ? '↺ إلغاء الإنجاز' : '✔ تعليم كمنجزة');
  completeBtn.addEventListener('click', async () => {
    completeBtn.disabled = true;
    try {
      if (completed) {
        await api.resetProgress(session.id);
        completed = false;
        toast('أُلغي تعليم الإنجاز');
      } else {
        await api.markProgress(session.id, { status: 'completed' });
        completed = true;
        toast('أحسنت! تم تعليم الحصة كمنجزة', 'ok');
      }
      completeBtn.textContent = completed ? '↺ إلغاء الإنجاز' : '✔ تعليم كمنجزة';
      completeBtn.className = `btn ${completed ? 'ghost' : ''}`;
      statusChip.textContent = completed ? '✔ منجزة' : 'لم تُنجز بعد';
      statusChip.className = `chip ${completed ? 'ok' : ''}`;
    } catch (err) {
      toastError(err);
    } finally {
      completeBtn.disabled = false;
    }
  });

  const info = [
    session.objectives && h('div', { class: 'card' },
      h('div', { class: 'card-title' }, h('h3', {}, '🎯 أهداف الحصة')),
      h('div', { class: 'text-body' }, session.objectives)),
    session.summary && h('div', { class: 'card' },
      h('div', { class: 'card-title' }, h('h3', {}, '🧾 خطة الحصة')),
      h('div', { class: 'text-body' }, session.summary)),
  ].filter(Boolean);

  return h('div', {},
    h('div', { class: 'row', style: { marginBottom: '.6rem' } },
      backLink(`#/year/${year.id}/subject/${session.subject_id}`, `${session.subject_icon} ${session.subject_name}`),
      backLink(`#/year/${year.id}`, year.title),
      isStaff() ? h('a', { class: 'btn sm soft', href: `#/admin/session/${session.id}` }, '✎ تحرير الحصة') : null),
    pageHead(
      `${year.title} · ${session.subject_name} · الحصة ${num(session.seq)} (الترتيب العام ${num(session.global_seq)})`,
      session.title,
      null
    ),
    h('div', { class: 'row', style: { marginBottom: '.8rem' } },
      state.user ? statusChip : null,
      chip(`⏱ ${fmtMinutes(session.duration_minutes)}`),
      chip(`📎 ${num(resources.length)} مرفق`),
      !session.is_published ? chip('مسودة', 'warn') : null),
    ...info,
    h('h2', { style: { marginTop: '1rem' } }, 'المحتوى والمرفقات'),
    resources.length
      ? h('div', {}, ...resources.map((r) => resourceCard(r, { tracking: trackingByResource.get(r.id) || null })))
      : empty('📎', 'لا توجد مرفقات لهذه الحصة',
          isStaff() ? 'أضف ملفات أو فيديو أو حزمة SCORM من صفحة تحرير الحصة.' : 'سيضيف المعلم المحتوى قريباً.'),
    h('div', { class: 'sticky-actions' },
      prev ? h('a', { class: 'btn ghost sm', href: `#/session/${prev.id}` }, '› السابقة') : h('span', { class: 'spacer' }),
      h('span', { class: 'spacer' }),
      state.user ? completeBtn : h('a', { class: 'btn sm', href: '#/login' }, 'سجّل الدخول لحفظ تقدّمك'),
      h('span', { class: 'spacer' }),
      next ? h('a', { class: 'btn soft sm', href: `#/session/${next.id}` }, 'التالية ‹') : h('span', { class: 'spacer' })));
}
