// طبقة الاتصال بالـ API
async function request(method, path, body) {
  const options = { method, headers: {}, credentials: 'same-origin' };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  const res = await fetch(path, options);
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: 'استجابة غير متوقّعة من السيرفر' };
    }
  }
  if (!res.ok) {
    const err = new Error(data?.error || `فشل الطلب (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data ?? {};
}

/** رفع ملفات مع نسبة تقدّم (XHR لأن fetch لا يوفّر تقدّم الرفع). */
function upload(path, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', path, true);
    xhr.withCredentials = true;
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener('load', () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText || '{}');
      } catch {
        data = {};
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else {
        const err = new Error(data?.error || `فشل الرفع (${xhr.status})`);
        err.status = xhr.status;
        reject(err);
      }
    });
    xhr.addEventListener('error', () => reject(new Error('انقطع الاتصال أثناء الرفع')));
    xhr.addEventListener('abort', () => reject(new Error('تم إلغاء الرفع')));
    xhr.send(formData);
  });
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body ?? {}),
  patch: (path, body) => request('PATCH', path, body ?? {}),
  del: (path) => request('DELETE', path),
  upload,

  me: () => request('GET', '/api/auth/me'),
  login: (payload) => request('POST', '/api/auth/login', payload),
  register: (payload) => request('POST', '/api/auth/register', payload),
  logout: () => request('POST', '/api/auth/logout', {}),

  years: (age) => request('GET', `/api/years${age ? `?age=${encodeURIComponent(age)}` : ''}`),
  year: (id) => request('GET', `/api/years/${id}`),
  yearSessions: (id, params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString();
    return request('GET', `/api/years/${id}/sessions${qs ? `?${qs}` : ''}`);
  },
  session: (id) => request('GET', `/api/sessions/${id}`),
  search: (q) => request('GET', `/api/search?q=${encodeURIComponent(q)}`),
  myProgress: () => request('GET', '/api/me/progress'),
  markProgress: (sessionId, payload) => request('POST', `/api/progress/${sessionId}`, payload),
  resetProgress: (sessionId) => request('DELETE', `/api/progress/${sessionId}`),
  students: () => request('GET', '/api/reports/students'),
  student: (id) => request('GET', `/api/reports/students/${id}`),
  users: () => request('GET', '/api/auth/users'),
};
