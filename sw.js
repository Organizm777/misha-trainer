const CACHE_NAME = 'trainer-build-wave91j-2026-04-29';
const STATIC_CACHE = CACHE_NAME + '-static';
const RUNTIME_CACHE = CACHE_NAME + '-runtime';
const ASSETS = [
  './.',
  './index.html',
  './dashboard.html',
  './diagnostic.html',
  './tests.html',
  './spec_subjects.html',
  './content_depth.html',
  './teacher.html',
  './embed.html',
  './landing.html',
  './staging.html',
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
  './assets/css/engine10.dac1e147e6.css',
  './assets/css/wave86x_inline_dashboard.314891eaa4.css',
  './assets/css/wave86x_inline_diagnostic.0bd1520b48.css',
  './assets/css/wave86x_inline_grade.79896c8b48.css',
  './assets/css/wave86x_inline_index.18cebf0885.css',
  './assets/css/wave86x_inline_spec_subjects.d549c141b2.css',
  './assets/css/wave86x_inline_tests.45c5256157.css',
  './assets/css/wave86z_static_style_classes.7a515bc89a.css',
  './assets/css/wave88d_breadcrumbs.26637df710.css',
  './assets/css/wave89p_self_host_fonts.5603de96b7.css',
  './assets/css/wave91j_content_depth.1e5dc33349.css',
  './assets/js/bundle_boosters.ce945f33ae.js',
  './assets/js/bundle_content_depth.927eb95760.js',
  './assets/js/bundle_dashboard_tools.9025bc19a4.js',
  './assets/js/bundle_diagnostic_tools.9792be3cd6.js',
  './assets/js/bundle_embed_widget.11310cbc74.js',
  './assets/js/bundle_error_tracking.dc19ab4e63.js',
  './assets/js/bundle_exam.79b5ffec4f.js',
  './assets/js/bundle_gamification_meta.9853e9e1bb.js',
  './assets/js/bundle_gamification_xp.907a25e6bd.js',
  './assets/js/bundle_grade_runtime_core_wave87n.1bd154a017.js',
  './assets/js/bundle_grade_runtime_extended_wave89b.3e59e96288.js',
  './assets/js/bundle_grade_runtime_features_wave87n.eb9412775e.js',
  './assets/js/bundle_grade_runtime_services_wave87n.39c7b1ae64.js',
  './assets/js/bundle_navigation_logger.9ffdcfacd7.js',
  './assets/js/bundle_profile_social.6f6ed7e2ff.js',
  './assets/js/bundle_sharing.75450d41f8.js',
  './assets/js/bundle_shell.5670562070.js',
  './assets/js/bundle_special_subjects.f45ea13d73.js',
  './assets/js/bundle_teacher_mode.a4017c6e0e.js',
  './assets/js/chunk_exam_bank_wave89q.cc4e296d5f.js',
  './assets/js/chunk_grade10_lazy_wave86s.135fbaef2b.js',
  './assets/js/chunk_grade_content_wave12_english_wave86t.61be17ebe4.js',
  './assets/js/chunk_grade_content_wave13_english_wave86t.4415e1929d.js',
  './assets/js/chunk_grade_content_wave14_english_wave86t.0138e4338f.js',
  './assets/js/chunk_grade_content_wave15_english_wave86t.839380b3d8.js',
  './assets/js/chunk_grade_content_wave16_theory_wave86t.5fef41b501.js',
  './assets/js/chunk_grade_content_wave19_mesh_8911_wave86t.83ac4ed3ac.js',
  './assets/js/chunk_grade_content_wave20_mesh_567primary_wave86t.3fee5cde9b.js',
  './assets/js/chunk_grade_content_wave34_world_wave86t.6314d997cf.js',
  './assets/js/chunk_grade_content_wave86k_roadmap_gaps_wave86t.bef30c1ab8.js',
  './assets/js/chunk_grade_content_wave86l_content_balance_wave86t.0047d86915.js',
  './assets/js/chunk_grade_content_wave86l_informatics_56_wave86t.a624ae8740.js',
  './assets/js/chunk_grade_content_wave87m_transition_1011.fadee67605.js',
  './assets/js/chunk_grade_lazy_payloads_wave91h.f1c9080079.js',
  './assets/js/chunk_roadmap_wave86q_accessibility_theme.0864633c36.js',
  './assets/js/chunk_roadmap_wave86u_csp_bridge.c9e654ca09.js',
  './assets/js/chunk_roadmap_wave86x_style_csp_bridge.bd9c395426.js',
  './assets/js/chunk_subject_expansion_wave31_russian.1702ff758a.js',
  './assets/js/chunk_subject_expansion_wave32_math.8957f08038.js',
  './assets/js/chunk_subject_expansion_wave33_science.7379e9af46.js',
  './assets/js/chunk_subject_expansion_wave38_content_consolidation.c6477aad95.js',
  './assets/js/chunk_subject_expansion_wave56_primary_math.eaf5b54a60.js',
  './assets/js/chunk_subject_expansion_wave57_primary_russian_1_4.89e342a7d4.js',
  './assets/js/chunk_subject_expansion_wave60_biology_history_english_5_8.ecfc9c5b63.js',
  './assets/js/chunk_subject_expansion_wave61_lazy_loader.dff54f3c62.js',
  './assets/js/chunk_subject_expansion_wave61_senior_school_10_11.61cb4ae0a9.js',
  './assets/js/chunk_subject_expansion_wave63_quality.f64a8f682f.js',
  './assets/js/chunk_subject_expansion_wave86l_grade3_balance.9681242b09.js',
  './assets/js/chunk_subject_expansion_wave86m_gap_balance_grade10_wave87d.fed9ebd45c.js',
  './assets/js/chunk_subject_expansion_wave86m_gap_balance_grade11_wave87d.4f8f37e921.js',
  './assets/js/chunk_subject_expansion_wave86m_gap_balance_grade4_wave87d.35837f11a8.js',
  './assets/js/chunk_subject_expansion_wave86m_gap_balance_grade5_wave87d.f3ed9c450f.js',
  './assets/js/chunk_subject_expansion_wave86m_gap_balance_grade6_wave87d.0a4973707d.js',
  './assets/js/chunk_subject_expansion_wave86m_gap_balance_grade7_wave87d.8bf079afdc.js',
  './assets/js/chunk_subject_expansion_wave86m_gap_balance_grade8_wave87d.b863389469.js',
  './assets/js/chunk_subject_expansion_wave86m_gap_balance_grade9_wave87d.0cfd6b7a6b.js',
  './assets/js/chunk_subject_expansion_wave89b_inputs_interactions_banks.bbaba018eb.js',
  './assets/js/chunk_subject_expansion_wave89c_secondary_stem_7_9.ea7e74deee.js',
  './assets/js/chunk_theory_wave91i.a8fa390972.js',
  './assets/js/engine10.a8d5b8c39f.js',
  './assets/js/exam_bank_ege_base_math_wave91.5b42298dd6.js',
  './assets/js/exam_bank_ege_english_wave91.f94768eaad.js',
  './assets/js/exam_bank_ege_history_wave91i.554a8f1c23.js',
  './assets/js/exam_bank_ege_informatics_wave91i.d437164d73.js',
  './assets/js/exam_bank_ege_physics_wave91.b767c24f9f.js',
  './assets/js/exam_bank_ege_profile_math_wave91.50d0bf4e90.js',
  './assets/js/exam_bank_ege_russian_wave91.82819627b2.js',
  './assets/js/exam_bank_ege_social_wave91.1176ac9f52.js',
  './assets/js/exam_bank_oge_english_wave91.93f27defd3.js',
  './assets/js/exam_bank_oge_history_wave91i.7278185444.js',
  './assets/js/exam_bank_oge_informatics_wave91i.7ae69c2535.js',
  './assets/js/exam_bank_oge_math_wave91.2355418287.js',
  './assets/js/exam_bank_oge_russian_wave91.d118db9daa.js',
  './assets/js/exam_bank_oge_social_wave91.fa205fa60a.js',
  './assets/js/grade10_data.5dbdf34ddd.js',
  './assets/js/grade10_subject_alg_wave86s.533785e914.js',
  './assets/js/grade10_subject_art_wave86s.84d7703046.js',
  './assets/js/grade10_subject_bio_wave86s.54aed4c3be.js',
  './assets/js/grade10_subject_chem_wave86s.30e00a80f4.js',
  './assets/js/grade10_subject_geo_wave86s.ce2eac1303.js',
  './assets/js/grade10_subject_geog_wave86s.e7ef128cc1.js',
  './assets/js/grade10_subject_his_wave86s.66c453b32f.js',
  './assets/js/grade10_subject_inf_wave86s.6101f53b69.js',
  './assets/js/grade10_subject_lit_wave86s.557c99cd43.js',
  './assets/js/grade10_subject_oly_cross_wave87c.15067e39a4.js',
  './assets/js/grade10_subject_oly_deep_wave87c.8c8ae2c5aa.js',
  './assets/js/grade10_subject_oly_logic_wave87c.4e7ea0f18b.js',
  './assets/js/grade10_subject_oly_strategy_wave91i.9079de7ddb.js',
  './assets/js/grade10_subject_oly_traps_wave87c.8c8acd7db6.js',
  './assets/js/grade10_subject_oly_wave86s.97190bb3c1.js',
  './assets/js/grade10_subject_phy_wave86s.56ec80c151.js',
  './assets/js/grade10_subject_prob_wave86s.4043fdfac3.js',
  './assets/js/grade10_subject_rus_wave86s.e1e2aeb718.js',
  './assets/js/grade10_subject_soc_wave86s.978ca2b4df.js',
  './assets/js/grade11_data.869160b7de.js',
  './assets/js/grade1_data.cf75f29a44.js',
  './assets/js/grade2_data.f40df3930a.js',
  './assets/js/grade3_data.b9452acec4.js',
  './assets/js/grade4_data.64a726fa7b.js',
  './assets/js/grade5_data.a4aecf961a.js',
  './assets/js/grade6_data.5b7810f079.js',
  './assets/js/grade7_data.cf7365a889.js',
  './assets/js/grade8_data.ef2a17eb15.js',
  './assets/js/grade9_data.8b3457c2ec.js',
  './assets/js/inline_dashboard_1_wave86u.e425d9d26a.js',
  './assets/js/inline_diagnostic_1_wave86u.10ff5e8d9b.js',
  './assets/js/inline_diagnostic_2_wave86u.1bca35f107.js',
  './assets/js/inline_index_1_wave86u.1bca35f107.js',
  './assets/js/inline_spec_subjects_1_wave86u.1bca35f107.js',
  './assets/js/inline_tests_1_wave86u.08cb8f7dc8.js',
  './assets/js/inline_tests_2_wave86u.ae4d81b485.js',
  './assets/js/inline_tests_3_wave86u.bab0f051a9.js',
  './assets/js/wave35_plans.f812119619.js',
  './assets/data/api/trainer3_content_api.json',
  './assets/data/content_depth/cross_grade_diagnostic.json',
  './assets/data/content_depth/final_essay_bank.json',
  './assets/data/content_depth/functional_literacy_pisa.json',
  './assets/data/content_depth/manifest.json',
  './assets/data/content_depth/school_question_pack_middle.json',
  './assets/data/content_depth/school_question_pack_primary.json',
  './assets/data/content_depth/school_question_pack_senior.json',
  './assets/data/content_depth/textbook_bindings.json',
  './assets/data/exam_bank/catalog.json',
  './assets/data/exam_bank/ege_base_math_2026_foundation.json',
  './assets/data/exam_bank/ege_english_2026_foundation.json',
  './assets/data/exam_bank/ege_history_2026_foundation.json',
  './assets/data/exam_bank/ege_informatics_2026_foundation.json',
  './assets/data/exam_bank/ege_physics_2026_foundation.json',
  './assets/data/exam_bank/ege_profile_math_2026_foundation.json',
  './assets/data/exam_bank/ege_russian_2026_foundation.json',
  './assets/data/exam_bank/ege_social_2026_foundation.json',
  './assets/data/exam_bank/oge_english_2026_foundation.json',
  './assets/data/exam_bank/oge_history_2026_foundation.json',
  './assets/data/exam_bank/oge_informatics_2026_foundation.json',
  './assets/data/exam_bank/oge_math_2026_foundation.json',
  './assets/data/exam_bank/oge_russian_2026_foundation.json',
  './assets/data/exam_bank/oge_social_2026_foundation.json',
  './assets/data/exam_banks/ege_math_profile_2026.json',
  './assets/data/exam_banks/manifest.json',
  './assets/data/exam_banks/oge_math_2026.json',
  './assets/data/spec_subjects/architecture.json',
  './assets/data/spec_subjects/construction.json',
  './assets/data/spec_subjects/design_entrance.json',
  './assets/data/spec_subjects/diplomacy.json',
  './assets/data/spec_subjects/fashion_design.json',
  './assets/data/spec_subjects/gkh.json',
  './assets/data/spec_subjects/graphic_design.json',
  './assets/data/spec_subjects/interior_design.json',
  './assets/data/spec_subjects/management.json',
  './assets/data/spec_subjects/procurement.json',
  './assets/data/spec_subjects/psychology.json',
  './api/index.json',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];
const CSP_BRIDGE_ASSETS = [
  './assets/js/chunk_roadmap_wave86u_csp_bridge.c9e654ca09.js',
  './assets/js/chunk_roadmap_wave86x_style_csp_bridge.bd9c395426.js'
];
const DIAGNOSTIC_OFFLINE_ASSETS = [
  './assets/css/wave86x_inline_diagnostic.0bd1520b48.css',
  './assets/css/wave86z_static_style_classes.7a515bc89a.css',
  './assets/css/wave89p_self_host_fonts.5603de96b7.css',
  './assets/js/inline_diagnostic_1_wave86u.10ff5e8d9b.js',
  './assets/js/inline_diagnostic_2_wave86u.1bca35f107.js',
  './assets/js/wave35_plans.f812119619.js',
  './assets/js/bundle_shell.5670562070.js',
  './assets/js/bundle_diagnostic_tools.9792be3cd6.js',
  './assets/js/chunk_roadmap_wave86q_accessibility_theme.0864633c36.js',
  './assets/js/chunk_subject_expansion_wave31_russian.1702ff758a.js',
  './assets/js/chunk_subject_expansion_wave32_math.8957f08038.js',
  './assets/js/chunk_subject_expansion_wave33_science.7379e9af46.js',
  './assets/js/chunk_subject_expansion_wave38_content_consolidation.c6477aad95.js',
  './assets/js/chunk_subject_expansion_wave56_primary_math.eaf5b54a60.js',
  './assets/js/chunk_subject_expansion_wave57_primary_russian_1_4.89e342a7d4.js',
  './assets/js/chunk_subject_expansion_wave89c_secondary_stem_7_9.ea7e74deee.js',
  './assets/js/chunk_subject_expansion_wave60_biology_history_english_5_8.ecfc9c5b63.js',
  './assets/js/chunk_subject_expansion_wave61_senior_school_10_11.61cb4ae0a9.js',
  './assets/js/chunk_grade_content_wave87m_transition_1011.fadee67605.js',
  './assets/js/chunk_subject_expansion_wave63_quality.f64a8f682f.js',
  './assets/js/bundle_gamification_xp.907a25e6bd.js',
  './assets/js/bundle_gamification_meta.9853e9e1bb.js',
  './assets/js/chunk_exam_bank_wave89q.cc4e296d5f.js',
  './assets/js/bundle_exam.79b5ffec4f.js',
  './assets/js/bundle_profile_social.6f6ed7e2ff.js',
  './assets/js/bundle_error_tracking.dc19ab4e63.js',
  './diagnostic.html'
];
const CRITICAL_ASSETS = Array.from(new Set(CSP_BRIDGE_ASSETS.concat(
  DIAGNOSTIC_OFFLINE_ASSETS,
  [
    './.',
    './index.html',
    './manifest.webmanifest',
    './assets/asset-manifest.json',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png'
  ]
)));
function isCacheable(request, response){ return request.method === 'GET' && response && (response.ok || response.type === 'opaque'); }
function isDocumentRequest(request){
  if (!request) return false;
  if (request.mode === 'navigate') return true;
  try {
    var accept = request.headers && request.headers.get ? request.headers.get('accept') || '' : '';
    return /text\/html/i.test(accept);
  } catch (_err) {
    return false;
  }
}
function shouldBypassRequest(request, url){
  if (!request || !url) return false;
  if (request.cache === 'no-store') return true;
  return /\/sw\.js(?:\?|$)/.test(url.pathname || '');
}
async function precache(){
  const cache = await caches.open(STATIC_CACHE);
  const MAX_ATTEMPTS = 3;
  const BASE_DELAY = 300;
  const CONCURRENCY = 6;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function addWithRetry(url, required){
    var lastErr = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++){
      try { await cache.add(url); return true; }
      catch (err) {
        lastErr = err;
        if (attempt < MAX_ATTEMPTS) await wait(BASE_DELAY * Math.pow(3, attempt - 1));
      }
    }
    if (required) throw new Error('SW critical precache failed for ' + url + ': ' + (lastErr && lastErr.message || lastErr));
    console.warn('SW optional precache gave up after ' + MAX_ATTEMPTS + ' attempts:', url, lastErr);
    return false;
  }
  for (const url of CRITICAL_ASSETS) await addWithRetry(url, true);
  const critical = new Set(CRITICAL_ASSETS);
  const queue = ASSETS.filter(url => !critical.has(url));
  const workers = Array.from({length: CONCURRENCY}, async () => {
    while (queue.length) {
      const url = queue.shift();
      if (url) await addWithRetry(url, false);
    }
  });
  await Promise.all(workers);
}
async function staleWhileRevalidate(request, cacheName){ const cache = await caches.open(cacheName); const cached = await cache.match(request); const networkPromise = fetch(request).then(response => { if(isCacheable(request, response)) cache.put(request, response.clone()); return response; }).catch(() => null); if(cached) return { response: cached, revalidate: networkPromise }; const fresh = await networkPromise; return { response: fresh, revalidate: Promise.resolve(fresh) }; }
async function networkFirst(request, cacheName){
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (isCacheable(request, response)) await cache.put(request, response.clone());
    return { response, from:'network' };
  } catch (_err) {
    const cached = await cache.match(request) || await caches.match(request);
    return { response: cached || null, from: cached ? 'cache' : 'none' };
  }
}
self.addEventListener('install', event => { event.waitUntil((async () => { await precache(); await self.skipWaiting(); })()); });
self.addEventListener('activate', event => { event.waitUntil((async () => { const keys = await caches.keys(); await Promise.all(keys.filter(key => ![STATIC_CACHE, RUNTIME_CACHE].includes(key)).map(key => caches.delete(key))); await self.clients.claim(); })()); });
self.addEventListener('message', event => { if(event && event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  if(!isSameOrigin || shouldBypassRequest(request, url)) return;
  const cacheName = isDocumentRequest(request) ? RUNTIME_CACHE : STATIC_CACHE;
  event.respondWith((async () => {
    if (isDocumentRequest(request)) {
      const result = await networkFirst(request, cacheName);
      if(result.response) return result.response;
      const fallback = await caches.match('./index.html');
      if(fallback) return fallback;
      return fetch(request);
    }
    const result = await staleWhileRevalidate(request, cacheName);
    if(result.revalidate) event.waitUntil(result.revalidate.then(() => undefined).catch(() => undefined));
    if(result.response) return result.response;
    return fetch(request);
  })());
});
