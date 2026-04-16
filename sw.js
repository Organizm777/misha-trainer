const CACHE_NAME = 'trainer-v65';
const STATIC_CACHE = CACHE_NAME + '-static';
const RUNTIME_CACHE = CACHE_NAME + '-runtime';
const ASSETS = [
  './',
  './index.html',
  './diagnostic.html',
  './tests.html',
  './spec_subjects.html',
  './dashboard.html',
  './assets/js/wave35_plans.js?v=48',
  './assets/js/engine10.js',
  './assets/js/bundle_boosters.js?v=42',
  './assets/js/bundle_dashboard_tools.js?v=64',
  './assets/js/bundle_diagnostic_tools.js?v=48',
  './assets/js/bundle_exam.js?v=49',
  './assets/js/bundle_grade_after.js?v=48',
  './assets/js/bundle_grade_content.js',
  './assets/js/bundle_gamification_xp.js?v=67',
  './assets/js/bundle_gamification_meta.js?v=67',
  './assets/js/bundle_profile_social.js?v=68',
  './assets/js/bundle_sharing.js',
  './assets/js/bundle_special_subjects.js?v=56',
  './assets/js/bundle_shell.js?v=52',
  './assets/js/chunk_subject_expansion_wave31_russian.js?v=65',
  './assets/js/chunk_subject_expansion_wave32_math.js?v=65',
  './assets/js/chunk_subject_expansion_wave33_science.js?v=65',
  './assets/js/chunk_subject_expansion_wave38_content_consolidation.js?v=65',
  './assets/js/chunk_subject_expansion_wave56_primary_math.js?v=65',
  './assets/js/chunk_subject_expansion_wave57_primary_russian_1_4.js?v=65',
  './assets/js/chunk_subject_expansion_wave58_secondary_math_7_9.js?v=65',
  './assets/js/chunk_subject_expansion_wave59_physics_chemistry_7_9.js?v=65',
  './assets/js/chunk_subject_expansion_wave60_biology_history_english_5_8.js?v=65',
  './assets/js/chunk_subject_expansion_wave61_senior_school_10_11.js?v=65',
  './assets/js/chunk_subject_expansion_wave63_quality.js?v=65',
  './assets/data/spec_subjects/diplomacy.json?v=55',
  './assets/data/spec_subjects/construction.json?v=55',
  './assets/data/spec_subjects/procurement.json?v=55',
  './assets/data/spec_subjects/management.json?v=55',
  './assets/data/spec_subjects/gkh.json?v=55',
  './assets/data/spec_subjects/psychology.json?v=55',
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
