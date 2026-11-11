const CACHE_PREFIX = 'assemblee-cm2-';
const CACHE_NAME = 'assemblee-cm2-v7';
const PRECACHE_URLS = [
  '/assemblercm2/',
  '/assemblercm2/etape/1-hemicycle/',
  '/assemblercm2/etape/2-galerie/',
  '/assemblercm2/etape/3-secrets/',
  '/assemblercm2/etape/4-constitution-justice/',
  '/assemblercm2/etape/5-frise-napoleon/',
  '/assemblercm2/etape/6-parlement-enfants/',
  '/assemblercm2/etape/7-contre-pouvoir-senat/',
  '/assemblercm2/etape/8-videos/',
  '/assemblercm2/etape/9-carte-mentale/',
  '/assemblercm2/etape/10-mini-jeux/',
  '/assemblercm2/etape/11-quiz-diplome/',
  '/assemblercm2/etape/12-sources-credits/',
  '/assemblercm2/enseignants/',
  '/assemblercm2/glossaire/',
  '/assemblercm2/credits/',
  '/assemblercm2/styleguide/',
  '/assemblercm2/favicon.svg',
  '/assemblercm2/manifest.webmanifest',
  '/assemblercm2/fonts/fredoka-600.woff2',
  '/assemblercm2/fonts/fredoka-700.woff2',
  '/assemblercm2/fonts/atkinson-400.woff2',
  '/assemblercm2/fonts/atkinson-700.woff2',
  '/assemblercm2/fonts/cinzel-700.woff2',
  '/assemblercm2/img/avatars/avatar-deputee.webp',
  '/assemblercm2/img/avatars/avatar-depute.webp',
  '/assemblercm2/img/avatars/avatar-malik.webp',
  '/assemblercm2/img/avatars/avatar-papa.webp',
  '/assemblercm2/img/avatars/avatar-duo.webp',
  '/assemblercm2/img/avatars/avatar-deputee.png',
  '/assemblercm2/img/avatars/avatar-depute.png',
  '/assemblercm2/img/avatars/avatar-malik.png',
  '/assemblercm2/img/avatars/avatar-papa.png',
  '/assemblercm2/img/avatars/avatar-duo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const acceptHeader = event.request.headers.get('accept') || '';
  const isHtmlNavigation =
    event.request.mode === 'navigate' || acceptHeader.includes('text/html');

  if (isHtmlNavigation) {
    // Network-First for HTML pages so new deployments and styles are always up-to-date
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-First with background refresh for static assets (images, fonts, scripts)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
