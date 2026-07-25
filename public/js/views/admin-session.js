// تحرير حصة: البيانات + إدارة المرفقات (رفع ملفات، نص، HTML، رابط، SCORM)
import { h, num, pageHead, empty, chip, clear, kindMeta, fmtBytes, KINDS } from '../dom.js';
import { api } from '../api.js';
import { isStaff, toast, toastError, confirmAction } from '../store.js';
import { navigate } from '../router.js';
import { resourceCard } from './resource-view.js';

const field = (label, input, hint) =>
  h('div', { class: 'field' }, h('label', {}, label), input, hint && h('div', { class: 'small muted' }, hint));

const ACCEPT = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp', '.rtf', '.csv',
  '.mp4', '.webm', '.mov', '.m4v', '.mkv', '.mp3', '.m4a', '.wav', '.ogg', '.opus',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif',
  '.zip', '.html', '.htm', '.txt', '.md',
].join(',');

export async function adminSessionView({ params }) {
  if (!isStaff()) {
    navigate('/login', { replace: true });
    return h('div');
  }

  const data = await api.session(params.id);
  const { session, year } = data;

  /* -------------------------- بيانات الحصة -------------------------- */
  const title = h('input', { value: session.title, required: true });
  const duration = h('input', { type: 'number', min: 5, max: 480, value: String(session.duration_minutes) });
  const objectives = h('textarea', { rows: 3, value: session.objectives, placeholder: 'أهداف الحصة، هدف في كل سطر' });
  const summary = h('textarea', { rows: 3, value: session.summary, placeholder: 'خطة الحصة وطريقة العرض والتقويم' });
  const published = h('input', { type: 'checkbox', checked: session.is_published });

  const infoForm = h('form', {
    onsubmit: async (event) => {
      event.preventDefault();
      try {
        await api.patch(`/api/sessions/${session.id}`, {
          title: title.value.trim(),
          duration_minutes: Number(duration.value),
          objectives: objectives.value,
          summary: summary.value,
          is_published: published.checked,
        });
        toast('تم حفظ بيانات الحصة', 'ok');
      } catch (err) {
        toastError(err);
      }
    },
  },
    field('عنوان الحصة', title),
    field('مدة الحصة (دقيقة)', duration),
    field('الأهداف', objectives),
    field('خطة الحصة', summary),
    h('label', { class: 'checkbox' }, published, 'منشورة للطلاب'),
    h('button', { class: 'btn', type: 'submit' }, '💾 حفظ'));

  /* -------------------------- قائمة المرفقات -------------------------- */
  const listHost = h('div', {});

  const renderResources = (resources) => {
    clear(listHost);
    if (!resources.length) {
      listHost.appendChild(empty('📎', 'لا توجد مرفقات', 'ارفع ملفاً أو أضف نصاً أو رابطاً من الأسفل.'));
      return;
    }
    resources.forEach((resource, index) => {
      const meta = kindMeta(resource.kind);
      const editTitle = h('input', { value: resource.title });
      const editDesc = h('input', { value: resource.description || '', placeholder: 'وصف مختصر (اختياري)' });
      const editText = ['text', 'html'].includes(resource.kind) && resource.text_content != null
        ? h('textarea', { rows: 6, value: resource.text_content })
        : null;

      const move = (direction) => async () => {
        try {
          await api.post(`/api/resources/${resource.id}/move`, { direction });
          await refresh();
        } catch (err) {
          toastError(err);
        }
      };

      // صف مضغوط: المعاينة والتحرير داخل أقسام قابلة للفتح حتى لا تطول الصفحة
      const row = h('div', { class: 'session-item' },
        h('span', { class: 'seq' }, meta.icon),
        h('span', { class: 'body' },
          h('strong', {}, resource.title),
          h('span', { class: 'sub' },
            h('span', {}, meta.label),
            resource.size_bytes ? h('span', {}, fmtBytes(resource.size_bytes)) : null,
            resource.file_name ? h('span', {}, resource.file_name) : null,
            resource.kind === 'scorm' && !resource.launch_path ? chip('بلا ملف انطلاق', 'warn') : null)),
        h('span', { class: 'btn-row' },
          h('button', { class: 'btn sm ghost', type: 'button', title: 'تحريك لأعلى', disabled: index === 0, onclick: move('up') }, '▲'),
          h('button', { class: 'btn sm ghost', type: 'button', title: 'تحريك لأسفل', disabled: index === resources.length - 1, onclick: move('down') }, '▼'),
          h('button', {
            class: 'btn sm danger', type: 'button', title: 'حذف',
            onclick: async () => {
              if (!confirmAction(`حذف المرفق «${resource.title}»؟`)) return;
              try {
                await api.del(`/api/resources/${resource.id}`);
                toast('تم حذف المرفق');
                await refresh();
              } catch (err) {
                toastError(err);
              }
            },
          }, '🗑')));

      const previewHost = h('div', {});
      const preview = h('details', {
        class: 'acc',
        ontoggle: (event) => {
          if (event.currentTarget.open && !previewHost.childElementCount) {
            previewHost.appendChild(resourceCard(resource));
          }
        },
      }, h('summary', {}, '👁 معاينة'), h('div', {}, previewHost));

      const editor = h('details', { class: 'acc' },
        h('summary', {}, '✎ تحرير'),
        h('div', {},
          field('العنوان', editTitle),
          field('الوصف', editDesc),
          editText ? field('المحتوى', editText) : null,
          resource.kind === 'scorm' && resource.launch_path
            ? h('p', { class: 'small muted' }, `ملف الانطلاق: ${resource.launch_path}`)
            : null,
          h('button', {
            class: 'btn sm', type: 'button',
            onclick: async () => {
              try {
                await api.patch(`/api/resources/${resource.id}`, {
                  title: editTitle.value.trim(),
                  description: editDesc.value,
                  ...(editText ? { text_content: editText.value } : {}),
                });
                toast('تم حفظ المرفق', 'ok');
                await refresh();
              } catch (err) {
                toastError(err);
              }
            },
          }, '💾 حفظ المرفق')));

      listHost.append(h('div', { style: { marginBottom: '.6rem' } }, row, preview, editor));
    });
  };

  const refresh = async () => {
    try {
      const fresh = await api.session(session.id);
      renderResources(fresh.resources);
    } catch (err) {
      toastError(err);
    }
  };

  /* -------------------------- رفع الملفات -------------------------- */
  const fileInput = h('input', { type: 'file', multiple: true, accept: ACCEPT });
  const kindSelect = h('select', {},
    h('option', { value: '' }, 'تحديد تلقائي حسب نوع الملف'),
    ...Object.entries(KINDS)
      .filter(([key]) => !['text', 'link'].includes(key))
      .map(([key, meta]) => h('option', { value: key }, `${meta.icon} ${meta.label}`)));
  const uploadTitle = h('input', { placeholder: 'عنوان المرفق (يُستخدم اسم الملف إذا تُرك فارغاً)' });
  const uploadDesc = h('input', { placeholder: 'وصف (اختياري)' });
  const progressWrap = h('div', { class: 'progress', hidden: true }, h('span', { style: { width: '0%' } }));
  const uploadBtn = h('button', { class: 'btn', type: 'submit' }, '⬆ رفع المرفقات');

  const uploadForm = h('form', {
    onsubmit: async (event) => {
      event.preventDefault();
      if (!fileInput.files.length) return toast('اختر ملفاً واحداً على الأقل', 'err');
      const formData = new FormData();
      [...fileInput.files].forEach((file) => formData.append('files', file));
      if (kindSelect.value) formData.append('kind', kindSelect.value);
      if (uploadTitle.value.trim()) formData.append('title', uploadTitle.value.trim());
      if (uploadDesc.value.trim()) formData.append('description', uploadDesc.value.trim());

      uploadBtn.disabled = true;
      progressWrap.hidden = false;
      try {
        const { resources } = await api.upload(`/api/sessions/${session.id}/resources`, formData, (percent) => {
          progressWrap.firstChild.style.width = `${percent}%`;
        });
        toast(`تم رفع ${num(resources.length)} مرفق`, 'ok');
        fileInput.value = '';
        uploadTitle.value = '';
        uploadDesc.value = '';
        await refresh();
      } catch (err) {
        toastError(err);
      } finally {
        uploadBtn.disabled = false;
        progressWrap.hidden = true;
        progressWrap.firstChild.style.width = '0%';
      }
    },
  },
    field('الملفات', fileInput,
      'PDF، وورد/إكسل/بوربوينت، فيديو، صوت، صور، صفحات HTML، وحزم SCORM بصيغة ZIP. حتى ٢٠ ملفاً في المرة.'),
    field('نوع المرفق', kindSelect),
    field('العنوان', uploadTitle),
    field('الوصف', uploadDesc),
    progressWrap,
    h('div', { style: { marginTop: '.5rem' } }, uploadBtn));

  /* -------------------------- نص / HTML / رابط -------------------------- */
  const textKind = h('select', {},
    h('option', { value: 'text' }, '📝 نص عادي'),
    h('option', { value: 'html' }, '🌐 HTML منسّق'),
    h('option', { value: 'link' }, '🔗 رابط خارجي (يوتيوب/فيميو يُضمَّن تلقائياً)'));
  const textTitle = h('input', { required: true, placeholder: 'عنوان المرفق' });
  const textBody = h('textarea', { rows: 6, placeholder: 'النص أو كود HTML' });
  const linkUrl = h('input', { type: 'url', placeholder: 'https://…', hidden: true });
  textKind.addEventListener('change', () => {
    const isLink = textKind.value === 'link';
    linkUrl.hidden = !isLink;
    textBody.hidden = isLink;
  });

  const textForm = h('form', {
    onsubmit: async (event) => {
      event.preventDefault();
      try {
        const body = { kind: textKind.value, title: textTitle.value.trim() };
        if (textKind.value === 'link') body.external_url = linkUrl.value.trim();
        else body.text_content = textBody.value;
        await api.post(`/api/sessions/${session.id}/resources`, body);
        toast('تمت الإضافة', 'ok');
        textTitle.value = '';
        textBody.value = '';
        linkUrl.value = '';
        await refresh();
      } catch (err) {
        toastError(err);
      }
    },
  },
    field('النوع', textKind),
    field('العنوان', textTitle),
    field('المحتوى', textBody),
    linkUrl,
    h('button', { class: 'btn', type: 'submit' }, '➕ إضافة'));

  renderResources(data.resources);

  return h('div', {},
    h('div', { class: 'row', style: { marginBottom: '.6rem' } },
      h('a', { class: 'btn ghost sm', href: `#/admin/year/${year.id}?subject=${session.subject_id}` }, '› حصص المادة'),
      h('a', { class: 'btn ghost sm', href: `#/session/${session.id}` }, '👁 معاينة الحصة')),
    pageHead(`${year.title} · ${session.subject_icon} ${session.subject_name} · الحصة ${num(session.seq)}`,
      session.title, 'حرّر بيانات الحصة ثم أضف المرفقات بأي نوع.'),
    h('section', { class: 'card' },
      h('div', { class: 'card-title' }, h('h3', {}, '📝 بيانات الحصة')),
      infoForm),
    h('h2', { style: { marginTop: '1.1rem' } }, `المرفقات ${data.resources.length ? `(${num(data.resources.length)})` : ''}`),
    listHost,
    h('section', { class: 'card' },
      h('div', { class: 'card-title' }, h('h3', {}, '⬆ رفع ملفات')),
      uploadForm),
    h('section', { class: 'card' },
      h('div', { class: 'card-title' }, h('h3', {}, '✍ نص أو HTML أو رابط')),
      textForm),
    h('p', { class: 'small muted' },
      'حزم SCORM: ارفع ملف ZIP يحتوي imsmanifest.xml — يُستخرج تلقائياً ويُشغَّل داخل التطبيق مع حفظ الدرجات ونسبة الإكمال لكل طالب.'));
}
