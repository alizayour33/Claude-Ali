// أدوات مساعدة لبناء الواجهة بدون مكتبات خارجية
const SVG_TAGS = new Set(['svg', 'path', 'circle', 'g', 'rect', 'line']);

export function h(tag, props = null, ...children) {
  const el = SVG_TAGS.has(tag)
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);

  for (const [key, value] of Object.entries(props || {})) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'html') el.innerHTML = value;
    else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
    else if (key === 'value' || (key === 'checked' && el instanceof HTMLInputElement)) el[key] = value;
    else el.setAttribute(key, value === true ? '' : value);
  }
  append(el, children);
  return el;
}

export function append(parent, children) {
  for (const child of children.flat(4)) {
    if (child == null || child === false) continue;
    parent.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return parent;
}

export const frag = (...children) => append(document.createDocumentFragment(), children);
export const clear = (node) => {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
};

/* ------------------------------- تنسيق القيم ------------------------------- */
const arabicNum = new Intl.NumberFormat('ar-EG');
export const num = (n) => arabicNum.format(Number(n) || 0);

export function fmtBytes(bytes) {
  const b = Number(bytes) || 0;
  if (b < 1024) return `${num(b)} بايت`;
  if (b < 1024 ** 2) return `${num(Math.round(b / 1024))} كيلوبايت`;
  if (b < 1024 ** 3) return `${num(Math.round((b / 1024 ** 2) * 10) / 10)} ميجابايت`;
  return `${num(Math.round((b / 1024 ** 3) * 10) / 10)} جيجابايت`;
}

export function fmtMinutes(minutes) {
  const m = Math.round(Number(minutes) || 0);
  if (m < 60) return `${num(m)} دقيقة`;
  const hours = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${num(hours)} ساعة و${num(rest)} دقيقة` : `${num(hours)} ساعة`;
}

export function fmtDate(value) {
  if (!value) return '—';
  const iso = String(value).includes('T') ? value : String(value).replace(' ', 'T') + 'Z';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}

export const pct = (done, total) => (total > 0 ? Math.round((done / total) * 100) : 0);

/* ------------------------------ أنواع المرفقات ------------------------------ */
export const KINDS = {
  pdf: { icon: '📄', label: 'PDF' },
  video: { icon: '🎬', label: 'فيديو' },
  audio: { icon: '🎧', label: 'صوت' },
  image: { icon: '🖼️', label: 'صورة' },
  office: { icon: '📊', label: 'ملف أوفيس' },
  scorm: { icon: '🧩', label: 'تفاعلي SCORM' },
  text: { icon: '📝', label: 'نص' },
  html: { icon: '🌐', label: 'صفحة HTML' },
  link: { icon: '🔗', label: 'رابط' },
};
export const kindMeta = (kind) => KINDS[kind] || { icon: '📎', label: 'مرفق' };

/* ------------------------------ مكوّنات جاهزة ------------------------------ */
export const progressBar = (done, total) =>
  h('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': pct(done, total), 'aria-valuemin': 0, 'aria-valuemax': 100 },
    h('span', { style: { width: `${pct(done, total)}%` } }));

export const ring = (done, total, color) =>
  h('div', { class: 'ring', style: { '--p': pct(done, total), ...(color ? { '--ring-color': color } : {}) } },
    h('span', {}, `${num(pct(done, total))}٪`));

export const chip = (label, variant) => h('span', { class: `chip${variant ? ' ' + variant : ''}` }, label);

export const spinner = () => h('div', { class: 'loading' }, h('div', { class: 'spinner', role: 'status', 'aria-label': 'جارٍ التحميل' }));

export const empty = (icon, title, hint) =>
  h('div', { class: 'empty' }, h('span', { class: 'big' }, icon), h('strong', {}, title), hint && h('p', { class: 'small' }, hint));

export const pageHead = (eyebrow, title, subtitle) =>
  h('header', { class: 'page-head' },
    eyebrow && h('div', { class: 'eyebrow' }, eyebrow),
    h('h1', {}, title),
    subtitle && h('p', {}, subtitle));

/** تنقية HTML الذي يكتبه المعلم قبل عرضه داخل الصفحة. */
export function sanitizeHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = String(html || '');
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
  const drop = [];
  while (walker.nextNode()) {
    const el = walker.currentNode;
    const tag = el.tagName.toLowerCase();
    if (['script', 'iframe', 'object', 'embed', 'link', 'meta', 'style', 'form'].includes(tag)) {
      drop.push(el);
      continue;
    }
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();
      if (name.startsWith('on') || (['href', 'src', 'xlink:href'].includes(name) && /^\s*javascript:/i.test(value))) {
        el.removeAttribute(attr.name);
      }
    }
    if (tag === 'a') {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }
  }
  drop.forEach((el) => el.remove());
  return template.innerHTML;
}
