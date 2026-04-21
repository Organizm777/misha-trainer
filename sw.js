const CACHE_NAME = 'trainer-build-wave86l-2026-04-21';
const STATIC_CACHE = CACHE_NAME + '-static';
const RUNTIME_CACHE = CACHE_NAME + '-runtime';
const ASSETS = [
  './.',
  './index.html',
  './dashboard.html',
  './diagnostic.html',
  './tests.html',
  './spec_subjects.html',
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
  './manifest.webmanifest',
  './healthz.json',
  './CHANGELOG.md',
  './assets/asset-manifest.json',
  './assets/js/bundle_boosters.db639b7b5f.js',
  './assets/js/bundle_dashboard_tools.5592be36f3.js',
  './assets/js/bundle_diagnostic_tools.641a191419.js',
  './assets/js/bundle_error_tracking.e8a9fb4295.js',
  './assets/js/bundle_exam.21c1f611f3.js',
  './assets/js/bundle_gamification_meta.9853e9e1bb.js',
  './assets/js/bundle_gamification_xp.907a25e6bd.js',
  './assets/js/bundle_grade_after.c926100b23.js',
  './assets/js/bundle_grade_content.3581ba449e.js',
  './assets/js/bundle_profile_social.6f6ed7e2ff.js',
  './assets/js/bundle_sharing.75450d41f8.js',
  './assets/js/bundle_shell.366a4cb99e.js',
  './assets/js/bundle_special_subjects.82d8040232.js',
  './assets/js/chunk_subject_expansion_wave31_russian.24fba9b173.js',
  './assets/js/chunk_subject_expansion_wave32_math.8957f08038.js',
  './assets/js/chunk_subject_expansion_wave33_science.7379e9af46.js',
  './assets/js/chunk_subject_expansion_wave38_content_consolidation.c6477aad95.js',
  './assets/js/chunk_subject_expansion_wave56_primary_math.eaf5b54a60.js',
  './assets/js/chunk_subject_expansion_wave57_primary_russian_1_4.89e342a7d4.js',
  './assets/js/chunk_subject_expansion_wave58_secondary_math_7_9.e89d86ed52.js',
  './assets/js/chunk_subject_expansion_wave59_physics_chemistry_7_9.b5b4b3f802.js',
  './assets/js/chunk_subject_expansion_wave60_biology_history_english_5_8.ecfc9c5b63.js',
  './assets/js/chunk_subject_expansion_wave61_senior_school_10_11.89f9ca6da8.js',
  './assets/js/chunk_subject_expansion_wave63_quality.ce03edc00c.js',
  './assets/js/engine10.7ca51a035a.js',
  './assets/js/grade10_data.fe39570706.js',
  './assets/js/grade8_data.7cbce1213a.js',
  './assets/js/grade9_data.5cebade080.js',
  './assets/js/grade11_data.11d53fbdce.js',
  './assets/js/wave35_plans.f812119619.js',
  './assets/css/engine10.73ed700043.css',
  './assets/data/spec_subjects/construction.json',
  './assets/data/spec_subjects/diplomacy.json',
  './assets/data/spec_subjects/gkh.json',
  './assets/data/spec_subjects/management.json',
  './assets/data/spec_subjects/procurement.json',
  './assets/data/spec_subjects/psychology.json',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];
function isCacheable(request, response){ return request.method === 'GET' && response && (response.ok || response.type === 'opaque'); }
async function precache(){
  const cache = await caches.open(STATIC_CACHE);
  const MAX_ATTEMPTS = 3;
  const BASE_DELAY = 300;
  const CONCURRENCY = 6;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function addWithRetry(url){
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++){
      try { await cache.add(url); return true; }
      catch (err) {
        if (attempt === MAX_ATTEMPTS) { console.warn('SW precache gave up after ' + MAX_ATTEMPTS + ' attempts:', url, err); return false; }
        await wait(BASE_DELAY * Math.pow(3, attempt - 1));
      }
    }
    return false;
  }
  const queue = ASSETS.slice();
  const workers = Array.from({length: CONCURRENCY}, async () => { while (queue.length) { const url = queue.shift(); if (url) await addWithRetry(url); } });
  await Promise.all(workers);
}
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
