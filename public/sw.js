const CACHE_PREFIX = 'assemblee-cm2-';
const CACHE_NAME = 'assemblee-cm2-v4';
const PRECACHE_URLS = [
  '/',
  '/etape/1-hemicycle/',
  '/etape/2-galerie/',
  '/etape/3-secrets/',
  '/etape/4-constitution-justice/',
  '/etape/5-frise-napoleon/',
  '/etape/6-parlement-enfants/',
  '/etape/7-contre-pouvoir-senat/',
  '/etape/8-videos/',
  '/etape/9-carte-mentale/',
  '/etape/10-mini-jeux/',
  '/etape/11-quiz-diplome/',
  '/etape/12-sources-credits/',
  '/enseignants/',
  '/glossaire/',
  '/credits/',
  '/styleguide/',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/fonts/fredoka-600.woff2',
  '/fonts/fredoka-700.woff2',
  '/fonts/atkinson-400.woff2',
  '/fonts/atkinson-700.woff2',
  '/img/avatars/avatar-deputee.webp',
  '/img/avatars/avatar-depute.webp',
  '/img/avatars/avatar-malik.webp',
  '/img/avatars/avatar-papa.webp',
  '/img/avatars/avatar-duo.webp'
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
