const CACHE_NAME = 'trainer-v6';
const ASSETS = [
  './',
  './index.html',
  './diagnostic.html',
  './tests.html',
  './dashboard.html',
  './engine10.js',
  './engine10.css',
  './wave6_boosters.js',
  './grade1_v2.html',
  './grade2_v2.html',
  './grade3_v2.html',
  './grade4_v2.html',
  './grade5_v2.html',
  './grade6_v2.html',
  './grade7_v2.html',
  './grade8_v2.html',
  './grade9_v2.html',
  './grade10_v2.html',
  './grade11_v2.html'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (const url of ASSETS) {
      try {
        await cache.add(url);
      } catch (err) {
        console.warn('SW precache skipped:', url, err);
      }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(fetch(event.request));
});
