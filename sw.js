const CACHE_NAME = 'trainer-v2';
const ASSETS = [
  './',
  './index.html',
  './grade1.html',
  './grade2.html',
  './grade3.html',
  './grade4.html',
  './grade5.html',
  './grade6.html',
  './grade7.html',
  './grade8.html',
  './grade9.html',
  './grade10.html',
  './grade11.html',
  './diagnostic.html',
  './tests.html'
];

const FONT_URLS = [
  'https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Golos+Text:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // For Google Fonts: cache-first (cache on first load, serve from cache after)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return response;
        });
      })
    );
    return;
  }
  
  // For local assets: network-first with cache fallback
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  
  // Everything else: network only
  e.respondWith(fetch(e.request));
});
