const CACHE_NAME = 'trainer-v39';
const STATIC_CACHE = CACHE_NAME + '-static';
const RUNTIME_CACHE = CACHE_NAME + '-runtime';
const ASSETS = [
  './',
  './index.html',
  './diagnostic.html',
  './tests.html',
  './dashboard.html',
  './assets/js/wave35_plans.js?v=42',
  './assets/js/engine10.js',
  './assets/js/bundle_boosters.js?v=42',
  './assets/js/bundle_dashboard_tools.js',
  './assets/js/bundle_diagnostic_tools.js',
  './assets/js/bundle_exam.js',
  './assets/js/bundle_grade_after.js?v=42',
  './assets/js/bundle_grade_content.js',
  './assets/js/bundle_sharing.js',
  './assets/js/bundle_shell.js?v=42',
  './assets/js/bundle_subject_expansion.js',
  './assets/css/engine10.css',
  './manifest.webmanifest',
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
  './grade11_v2.html',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
];
function isCacheable(request, response){ return request.method === 'GET' && response && (response.ok || response.type === 'opaque'); }
async function precache(){ const cache = await caches.open(STATIC_CACHE); for (const url of ASSETS){ try{ await cache.add(url); }catch(err){ console.warn('SW precache skipped:', url, err); } } }
async function staleWhileRevalidate(request, cacheName){ const cache = await caches.open(cacheName); const cached = await cache.match(request); const networkPromise = fetch(request).then(response => { if(isCacheable(request, response)) cache.put(request, response.clone()); return response; }).catch(() => null); if(cached) return { response: cached, revalidate: networkPromise }; const fresh = await networkPromise; return { response: fresh, revalidate: Promise.resolve(fresh) }; }
self.addEventListener('install', event => { event.waitUntil((async () => { await precache(); await self.skipWaiting(); })()); });
self.addEventListener('activate', event => { event.waitUntil((async () => { const keys = await caches.keys(); await Promise.all(keys.filter(key => ![STATIC_CACHE, RUNTIME_CACHE].includes(key)).map(key => caches.delete(key))); await self.clients.claim(); })()); });
self.addEventListener('message', event => { if(event && event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  const isFont = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');
  const isSameOrigin = url.origin === self.location.origin;
  if(!isFont && !isSameOrigin) return;
  const cacheName = isSameOrigin ? STATIC_CACHE : RUNTIME_CACHE;
  event.respondWith((async () => {
    const result = await staleWhileRevalidate(request, cacheName);
    if(result.revalidate) event.waitUntil(result.revalidate.then(() => undefined).catch(() => undefined));
    if(result.response) return result.response;
    if(request.mode === 'navigate'){
      const fallback = await caches.match('./index.html');
      if(fallback) return fallback;
    }
    return fetch(request);
  })());
});
