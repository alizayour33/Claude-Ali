// عرض المرفقات بحسب نوعها: PDF / فيديو / صوت / صور / أوفيس / SCORM / نص / HTML / رابط
import { h, kindMeta, fmtBytes, sanitizeHtml, chip } from '../dom.js';

/** يحوّل روابط يوتيوب/فيميو إلى رابط تضمين قابل للعرض داخل الصفحة. */
function embedUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    if (host.endsWith('youtube.com')) {
      if (url.pathname.startsWith('/embed/')) return rawUrl;
      const id = url.searchParams.get('v');
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (host.endsWith('vimeo.com') && /^\/\d+/.test(url.pathname)) {
      return `https://player.vimeo.com/video/${url.pathname.split('/')[1]}`;
    }
  } catch {
    /* رابط غير صالح */
  }
  return null;
}

const openInTab = (url, label = 'فتح في تبويب جديد') =>
  h('a', { class: 'btn ghost sm', href: url, target: '_blank', rel: 'noopener' }, label);

const downloadBtn = (url, label = '⬇ تنزيل') =>
  h('a', { class: 'btn soft sm', href: url, download: '' }, label);

function fileCard(resource, extraButtons = []) {
  const meta = kindMeta(resource.kind);
  return h('div', { class: 'file-card' },
    h('span', { class: 'f-icon' }, meta.icon),
    h('div', { class: 'f-meta' },
      h('strong', { class: 'small', style: { display: 'block', color: 'var(--text)' } }, resource.file_name || resource.title),
      [resource.size_bytes ? fmtBytes(resource.size_bytes) : null, meta.label].filter(Boolean).join(' · ')),
    h('div', { class: 'btn-row' }, ...extraButtons));
}

function scormBody(resource, tracking) {
  if (!resource.scorm_url) {
    return h('div', { class: 'r-body' },
      h('p', { class: 'small muted' }, 'لم يتم العثور على ملف انطلاق داخل الحزمة (imsmanifest.xml أو index.html). يمكنك تنزيل الحزمة ومراجعتها.'),
      resource.download_url ? downloadBtn(resource.download_url, '⬇ تنزيل الحزمة') : null);
  }
  const playerUrl = `/scorm/play?resource=${resource.id}`;
  const wrap = h('div', { class: 'frame-wrap' },
    h('iframe', {
      src: playerUrl,
      title: resource.title,
      allowfullscreen: true,
      allow: 'autoplay; fullscreen; microphone',
    }));

  const statusChip = tracking
    ? chip(
        {
          completed: '✔ مكتمل',
          passed: '✔ ناجح',
          failed: '✖ غير ناجح',
          incomplete: '⏳ لم يكتمل',
          browsed: '👁 تمت المشاهدة',
        }[tracking.lesson_status] || 'قيد المحاولة',
        ['completed', 'passed'].includes(tracking.lesson_status) ? 'ok' : 'warn'
      )
    : null;

  return h('div', {},
    h('div', { class: 'r-body' },
      h('div', { class: 'row' },
        statusChip,
        tracking?.score_raw != null ? chip(`الدرجة: ${tracking.score_raw}`) : null,
        h('span', { class: 'spacer' }),
        openInTab(playerUrl, '⛶ تشغيل بملء الشاشة'),
        resource.download_url ? downloadBtn(resource.download_url, '⬇ الحزمة') : null)),
    wrap);
}

/** يبني بطاقة عرض لمرفق واحد. tracking = سجل SCORM للمستخدم إن وُجد. */
export function resourceCard(resource, { tracking = null, actions = null } = {}) {
  const meta = kindMeta(resource.kind);
  const header = h('header', {},
    h('span', { class: 'r-icon' }, meta.icon),
    h('span', { class: 'r-title' }, resource.title),
    chip(meta.label),
    actions);

  let body;
  switch (resource.kind) {
    case 'pdf':
      body = h('div', {},
        h('div', { class: 'frame-wrap' },
          h('iframe', { src: `${resource.url}#view=FitH`, title: resource.title })),
        h('div', { class: 'r-body row' },
          h('span', { class: 'small muted' }, 'إن لم يظهر الملف على جوالك:'),
          openInTab(resource.url),
          downloadBtn(resource.download_url || resource.url)));
      break;

    case 'video':
      body = h('div', {},
        h('div', { class: 'r-body flush' },
          h('video', {
            src: resource.url,
            controls: true,
            playsinline: true,
            preload: 'metadata',
            controlslist: 'nodownload',
          })),
        h('div', { class: 'r-body row' }, downloadBtn(resource.download_url || resource.url)));
      break;

    case 'audio':
      body = h('div', { class: 'r-body' },
        h('audio', { src: resource.url, controls: true, preload: 'metadata' }),
        h('div', { class: 'row', style: { marginTop: '.5rem' } }, downloadBtn(resource.download_url || resource.url)));
      break;

    case 'image':
      body = h('div', {},
        h('a', { href: resource.url, target: '_blank', rel: 'noopener' },
          h('img', { class: 'preview', src: resource.url, alt: resource.title, loading: 'lazy' })),
        h('div', { class: 'r-body row' }, openInTab(resource.url, 'تكبير الصورة'), downloadBtn(resource.download_url || resource.url)));
      break;

    case 'office':
      body = h('div', { class: 'r-body' },
        fileCard(resource, [downloadBtn(resource.download_url || resource.url, '⬇ تنزيل الملف')]),
        h('p', { class: 'small muted', style: { marginTop: '.5rem', marginBottom: 0 } },
          'ملفات وورد/إكسل/بوربوينت تُفتح بتطبيق أوفيس على الجوال بعد التنزيل.'));
      break;

    case 'scorm':
      body = scormBody(resource, tracking);
      break;

    case 'text':
      body = h('div', { class: 'r-body' }, h('div', { class: 'text-body' }, resource.text_content || ''));
      break;

    case 'html':
      body = resource.text_content
        ? h('div', { class: 'r-body' }, h('div', { class: 'html-body', html: sanitizeHtml(resource.text_content) }))
        : h('div', {},
            h('div', { class: 'frame-wrap short' },
              h('iframe', {
                src: resource.url,
                title: resource.title,
                sandbox: 'allow-scripts allow-same-origin allow-popups allow-forms',
              })),
            h('div', { class: 'r-body row' }, openInTab(resource.url)));
      break;

    case 'link': {
      const embed = embedUrl(resource.external_url);
      body = embed
        ? h('div', {},
            h('div', { class: 'frame-wrap' },
              h('iframe', {
                src: embed,
                title: resource.title,
                allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen',
                allowfullscreen: true,
              })),
            h('div', { class: 'r-body row' }, openInTab(resource.external_url, 'فتح المصدر')))
        : h('div', { class: 'r-body' },
            h('a', { class: 'btn soft', href: resource.external_url, target: '_blank', rel: 'noopener' }, '🔗 فتح الرابط'),
            h('p', { class: 'small muted', style: { margin: '.5rem 0 0' } }, resource.external_url));
      break;
    }

    default:
      body = h('div', { class: 'r-body' }, fileCard(resource, resource.url ? [downloadBtn(resource.url)] : []));
  }

  return h('article', { class: 'resource', id: `resource-${resource.id}` },
    header,
    resource.description ? h('div', { class: 'r-body small muted', style: { paddingBottom: 0 } }, resource.description) : null,
    body);
}
