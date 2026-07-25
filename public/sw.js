// خدمة العمل: تخزين هيكل التطبيق للعمل السريع وبدون شبكة، مع تجاوز طلبات الـ API
const CACHE = 'manhaj-shell-v1';
const SHELL = [
  '/', '/index.html', '/css/app.css', '/manifest.webmanifest', '/icon.svg',
  '/js/app.js', '/js/api.js', '/js/dom.js', '/js/store.js', '/js/router.js',
  '/js/views/home.js', '/js/views/year.js', '/js/views/session.js', '/js/views/parts.js',
  '/js/views/auth.js', '/js/views/me.js', '/js/views/admin.js', '/js/views/admin-session.js',
  '/js/views/admin-users.js', '/js/views/resource-view.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  // بيانات الـ API والملفات المرفوعة تُطلب من الشبكة دائماً
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/scorm/')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => cached || caches.match('/index.html'));
      return cached || network;
    })
  );
});
