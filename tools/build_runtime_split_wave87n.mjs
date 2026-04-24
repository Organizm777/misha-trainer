#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const WAVE = 'wave87n';
const BUILD_DATE = '2026-04-23';
const CACHE_NAME = `trainer-build-${WAVE}-${BUILD_DATE}`;
const BUILD_VERSION = `${CACHE_NAME}`;
const GENERATED_AT = '2026-04-23T00:00:00Z';

const MANIFEST_PATH = path.join(ROOT, 'assets', 'asset-manifest.json');
const HEALTHZ_PATH = path.join(ROOT, 'healthz.json');
const SW_PATH = path.join(ROOT, 'sw.js');
const HTML_FILES = fs.readdirSync(ROOT).filter((name) => /^grade\d+_v2\.html$/.test(name)).sort();

function read(rel){
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function write(rel, data){
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, data);
}
function remove(rel){
  if (!rel) return;
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
  if (fs.existsSync(abs + '.map')) fs.unlinkSync(abs + '.map');
}
function hash10(text){
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 10);
}
function normalizeNewline(text){
  return String(text).replace(/\r\n/g, '\n');
}
function makeBundle({ title, sections, footer }){
  const body = sections.map((rel) => {
    const content = normalizeNewline(read(rel)).trim();
    return `;/* ---- ${path.basename(rel)} ---- */\n${content}\n`;
  }).join('\n');
  return `/* ${title} */\n\n${body}${footer ? `\n${footer}\n` : ''}`;
}
function publishBundle(manifest, logical, content){
  const srcRel = logical.replace('assets/', 'assets/_src/');
  const normalized = normalizeNewline(content).replace(/\n{3,}/g, '\n\n');
  write(srcRel, normalized);
  const hash = hash10(normalized);
  const builtRel = logical.replace(/\.js$/, `.${hash}.js`);
  write(builtRel, normalized);
  const oldBuilt = manifest.assets && manifest.assets[logical] ? manifest.assets[logical] : '';
  if (oldBuilt && oldBuilt !== builtRel) remove(oldBuilt);
  manifest.assets[logical] = builtRel;
  return { logical, srcRel, builtRel, hash, bytes: Buffer.byteLength(normalized) };
}
function removeManifestAsset(manifest, logical){
  const oldBuilt = manifest.assets && manifest.assets[logical] ? manifest.assets[logical] : '';
  if (oldBuilt) remove(oldBuilt);
  if (manifest.assets) delete manifest.assets[logical];
}
function replaceInFile(rel, matcher, replacement){
  const abs = path.join(ROOT, rel);
  const raw = fs.readFileSync(abs, 'utf8');
  const next = raw.replace(matcher, replacement);
  if (next !== raw) fs.writeFileSync(abs, next);
  return next !== raw;
}
function loaderSnippet(featuresBuiltRel, servicesBuiltRel){
  const featuresSrc = `./${featuresBuiltRel}`;
  const servicesSrc = `./${servicesBuiltRel}`;
  return `(function(){
  'use strict';
  if (typeof window === 'undefined' || window.wave87nRuntimeSplit) return;

  var root = window;
  var WAVE = 'wave87n';
  var PERF_KEY = 'trainer_perf_samples_wave87n_' + String(root.GRADE_NUM || root.GRADE_NO || 'na');
  var manifest = Object.freeze({
    wave: WAVE,
    features: ${JSON.stringify(featuresSrc)},
    services: ${JSON.stringify(servicesSrc)}
  });
  var loaded = { features:false, services:false };
  var loading = {};
  var perf = {
    wave: WAVE,
    grade: String(root.GRADE_NUM || root.GRADE_NO || ''),
    startedAt: Date.now(),
    timings: {},
    connection: {},
    lowEnd: false,
    bundles: loaded
  };

  function now(){
    try { return Math.round(performance.now()); }
    catch (_) { return 0; }
  }
  function safeJsonParse(raw, fallback){
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch (_) { return fallback; }
  }
  function connectionInfo(){
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
    return {
      effectiveType: conn && conn.effectiveType ? String(conn.effectiveType) : '',
      saveData: !!(conn && conn.saveData),
      downlink: conn && conn.downlink ? Number(conn.downlink) || 0 : 0,
      rtt: conn && conn.rtt ? Number(conn.rtt) || 0 : 0,
      hardwareConcurrency: navigator.hardwareConcurrency ? Number(navigator.hardwareConcurrency) || 0 : 0,
      deviceMemory: navigator.deviceMemory ? Number(navigator.deviceMemory) || 0 : 0
    };
  }
  function detectLowEnd(info){
    info = info || connectionInfo();
    return !!(
      info.saveData ||
      /^(?:slow-2g|2g|3g)$/i.test(info.effectiveType || '') ||
      (info.hardwareConcurrency && info.hardwareConcurrency <= 4) ||
      (info.deviceMemory && info.deviceMemory <= 4)
    );
  }
  function navSnapshot(){
    try {
      var nav = performance.getEntriesByType && performance.getEntriesByType('navigation');
      if (nav && nav[0]) {
        return {
          domContentLoadedEnd: Math.round(nav[0].domContentLoadedEventEnd || 0),
          loadEventEnd: Math.round(nav[0].loadEventEnd || 0),
          transferSize: Math.round(nav[0].transferSize || 0),
          type: nav[0].type || ''
        };
      }
    } catch (_) {}
    return { domContentLoadedEnd:0, loadEventEnd:0, transferSize:0, type:'' };
  }
  function record(name){
    perf.timings[name] = now();
    return perf.timings[name];
  }
  function persist(reason){
    perf.connection = connectionInfo();
    perf.lowEnd = detectLowEnd(perf.connection);
    perf.reason = reason || perf.reason || '';
    perf.nav = navSnapshot();
    try {
      var rows = safeJsonParse(localStorage.getItem(PERF_KEY), []);
      if (!Array.isArray(rows)) rows = [];
      var snapshot = JSON.parse(JSON.stringify(perf));
      snapshot.savedAt = new Date().toISOString();
      snapshot.bundles = { features: !!loaded.features, services: !!loaded.services };
      rows.push(snapshot);
      while (rows.length > 12) rows.shift();
      localStorage.setItem(PERF_KEY, JSON.stringify(rows));
    } catch (_) {}
    try { root.dispatchEvent(new CustomEvent('trainer:perf-sample', { detail: JSON.parse(JSON.stringify(perf)) })); } catch (_) {}
  }
  function scriptLoaded(src){
    var scripts = document.querySelectorAll('script[src]');
    for (var i = 0; i < scripts.length; i++) {
      var value = scripts[i].getAttribute('src') || '';
      if (value === src) return scripts[i];
    }
    return null;
  }
  function appendScript(kind, src){
    return new Promise(function(resolve, reject){
      var existing = scriptLoaded(src);
      if (existing && existing.getAttribute('data-wave87n-loaded') === '1') {
        loaded[kind] = true;
        return resolve(true);
      }
      var script = existing || document.createElement('script');
      function done(){
        loaded[kind] = true;
        script.setAttribute('data-wave87n-loaded', '1');
        record('loaded_' + kind);
        persist('loaded-' + kind);
        resolve(true);
      }
      function fail(){
        loading[kind] = null;
        reject(new Error('Failed to load ' + kind + ' bundle'));
      }
      script.addEventListener('load', done, { once:true });
      script.addEventListener('error', fail, { once:true });
      if (!existing) {
        script.defer = true;
        script.async = true;
        script.src = src;
        script.setAttribute('data-wave87n-kind', kind);
        document.head.appendChild(script);
      }
    });
  }
  function load(kind){
    if (loaded[kind]) return Promise.resolve(true);
    if (loading[kind]) return loading[kind];
    var src = manifest[kind];
    if (!src) return Promise.resolve(false);
    record('requested_' + kind);
    loading[kind] = appendScript(kind, src).catch(function(err){
      try { console.warn('[wave87n runtime split] failed to load', kind, err); } catch (_) {}
      return false;
    });
    return loading[kind];
  }
  function loadFeatures(){ return load('features'); }
  function loadServices(){ return load('services'); }
  function scheduleIdleLoads(){
    var info = connectionInfo();
    var lowEnd = detectLowEnd(info);
    var featureDelay = lowEnd ? 1200 : 550;
    var serviceDelay = lowEnd ? 2600 : 1300;
    setTimeout(function(){ loadFeatures(); }, featureDelay);
    setTimeout(function(){ loadServices(); }, serviceDelay);
    if (root.requestIdleCallback) {
      root.requestIdleCallback(function(){ loadFeatures(); }, { timeout: featureDelay + 600 });
      root.requestIdleCallback(function(){ loadServices(); }, { timeout: serviceDelay + 900 });
    }
  }
  var ACTION_ATTR = 'data-wave87r-action';
  function actionNameFromNode(node){
    for (var el = node; el && el !== document; el = el.parentElement) {
      if (el.nodeType === 1 && el.hasAttribute(ACTION_ATTR)) return el.getAttribute(ACTION_ATTR) || '';
    }
    return '';
  }
  function hydrateForAction(action){
    action = String(action || '');
    if (action === 'show-badges') return loadFeatures();
    if (action === 'show-profile') return loadFeatures().then(function(){ return loadServices(); });
    if (action === 'generate-report' || action === 'show-backup' || action === 'share-report') return loadServices();
    return Promise.resolve(false);
  }
  function bindDirectAction(action, handler){
    var nodes = document.querySelectorAll('[' + ACTION_ATTR + '="' + action + '"]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el || el.__wave87rDirectBound) continue;
      el.__wave87rDirectBound = true;
      el.addEventListener('click', function(event){
        if (event) event.preventDefault();
        Promise.resolve(hydrateForAction(action)).catch(function(){ return false; }).then(function(){
          try { handler(event); }
          catch (err) {
            try { console.warn('[wave87r direct action] failed', action, err); } catch (_) {}
          }
        });
      });
    }
  }
  function bindDirectActions(){
    bindDirectAction('go-info', function(){ if (typeof root.go === 'function') root.go('info'); });
    bindDirectAction('show-journal', function(){ if (typeof root.showJournal === 'function') root.showJournal(); });
    bindDirectAction('show-badges', function(){ if (typeof root.showBadges === 'function') root.showBadges(); });
    bindDirectAction('show-profile', function(){ if (typeof root.showHallOfFame === 'function') root.showHallOfFame(); });
    bindDirectAction('show-class-select', function(){ if (typeof root.showClassSelect === 'function') root.showClassSelect(); });
    bindDirectAction('go-prog', function(){ if (typeof root.go === 'function') root.go('prog'); });
    bindDirectAction('show-about', function(){ if (typeof root.showAbout === 'function') root.showAbout(); });
    bindDirectAction('generate-report', function(){ if (typeof root.generateReport === 'function') root.generateReport(); });
    bindDirectAction('show-backup', function(){ if (typeof root.showBackupModal === 'function') root.showBackupModal(); });
    bindDirectAction('show-date-editor', function(){ if (typeof root.showDateEditor === 'function') root.showDateEditor(); });
    bindDirectAction('go-main', function(){ if (typeof root.go === 'function') root.go('main'); });
    bindDirectAction('share-report', function(){ if (typeof root.shareReport === 'function') root.shareReport(); });
    bindDirectAction('reset-progress', function(){ if (typeof root.resetProgress === 'function') root.resetProgress(); });
    bindDirectAction('go-subj', function(){ if (typeof root.goSubj === 'function') root.goSubj(); });
    bindDirectAction('start-normal-quiz', function(){ if (typeof root.wave86uStartNormalQuiz === 'function') root.wave86uStartNormalQuiz(); });
    bindDirectAction('end-session', function(){ if (typeof root.endSession === 'function') root.endSession(); });
    bindDirectAction('toggle-privacy', function(){ if (typeof root.togglePrivacy === 'function') root.togglePrivacy(); });
    bindDirectAction('share-session', function(){ if (typeof root.shareSession === 'function') root.shareSession(); });
    bindDirectAction('back-after-result', function(){ if (typeof root.wave86uBackAfterResult === 'function') root.wave86uBackAfterResult(); });
  }
  function bindIntentWarmup(){
    function onIntent(event){
      var action = actionNameFromNode(event.target);
      if (!action) return;
      hydrateForAction(action);
    }
    document.addEventListener('pointerdown', onIntent, true);
    document.addEventListener('focusin', onIntent, true);
  }
  function interactiveReady(){
    return !!(
      document.getElementById('s-main') &&
      typeof root.go === 'function' &&
      typeof root.startQuiz === 'function' &&
      document.querySelector('#s-main .btn,#s-main .card,#s-main .scard,#s-main button')
    );
  }
  function waitInteractive(){
    function tick(){
      if (interactiveReady()) {
        record('interactive');
        persist('interactive');
        try { root.dispatchEvent(new CustomEvent('trainer:interactive', { detail: JSON.parse(JSON.stringify(perf)) })); } catch (_) {}
        scheduleIdleLoads();
        return;
      }
      if (now() > 10000) {
        record('interactive_timeout');
        persist('interactive-timeout');
        scheduleIdleLoads();
        return;
      }
      root.requestAnimationFrame ? root.requestAnimationFrame(tick) : setTimeout(tick, 50);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function(){
        record('dom_content_loaded');
        tick();
      }, { once:true });
    } else {
      record('dom_content_loaded');
      tick();
    }
  }

  perf.connection = connectionInfo();
  perf.lowEnd = detectLowEnd(perf.connection);
  record('core_boot');
  bindDirectActions();
  bindIntentWarmup();
  waitInteractive();
  root.addEventListener('pagehide', function(){ persist('pagehide'); }, { once:true });

  root.wave87nRuntimeSplit = {
    wave: WAVE,
    manifest: manifest,
    isLoaded: function(kind){ return !!loaded[kind]; },
    loadFeatures: loadFeatures,
    loadServices: loadServices,
    hydrateForAction: hydrateForAction,
    perfSnapshot: function(){
      var snap = JSON.parse(JSON.stringify(perf));
      snap.bundles = { features: !!loaded.features, services: !!loaded.services };
      snap.connection = connectionInfo();
      snap.lowEnd = detectLowEnd(snap.connection);
      return snap;
    },
    history: function(){
      try { return safeJsonParse(localStorage.getItem(PERF_KEY), []); }
      catch (_) { return []; }
    }
  };
})();`;
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

const featuresLogical = 'assets/js/bundle_grade_runtime_features_wave87n.js';
const servicesLogical = 'assets/js/bundle_grade_runtime_services_wave87n.js';
const coreLogical = 'assets/js/bundle_grade_runtime_core_wave87n.js';

const featuresBundle = makeBundle({
  title: 'wave87n grade runtime features bundle: exam/pvp/theory/gamification.',
  sections: [
    'assets/_src/js/chunk_roadmap_wave86r_theory_achievements.js',
    'assets/_src/js/chunk_roadmap_wave86p_exam_challenge.js',
    'assets/_src/js/chunk_roadmap_wave86v_pvp_link_battle.js',
    'assets/_src/js/bundle_gamification_xp.js',
    'assets/_src/js/bundle_gamification_meta.js'
  ],
  footer: `;window.__wave87nGradeRuntimeFeaturesBundle = Object.freeze({wave:'wave87n', role:'features', bundled:["chunk_roadmap_wave86r_theory_achievements.js","chunk_roadmap_wave86p_exam_challenge.js","chunk_roadmap_wave86v_pvp_link_battle.js","bundle_gamification_xp.js","bundle_gamification_meta.js"], generatedAt:'${GENERATED_AT}'});`
});
const features = publishBundle(manifest, featuresLogical, featuresBundle);

const servicesBundle = makeBundle({
  title: 'wave87n grade runtime services bundle: report/profile/cloud sync.',
  sections: [
    'assets/_src/js/bundle_sharing.js',
    'assets/_src/js/bundle_profile_social.js',
    'assets/_src/js/chunk_roadmap_wave86w_cloud_sync.js'
  ],
  footer: `;window.__wave87nGradeRuntimeServicesBundle = Object.freeze({wave:'wave87n', role:'services', bundled:["bundle_sharing.js","bundle_profile_social.js","chunk_roadmap_wave86w_cloud_sync.js"], generatedAt:'${GENERATED_AT}'});`
});
const services = publishBundle(manifest, servicesLogical, servicesBundle);

const coreBundle = makeBundle({
  title: 'wave87n grade runtime core bundle: theme/a11y/main runtime/progress/perf loader.',
  sections: [
    'assets/_src/js/chunk_roadmap_wave86q_accessibility_theme.js',
    'assets/_src/js/bundle_grade_after.js',
    'assets/_src/js/chunk_roadmap_wave86n_progress_tools.js',
    'assets/_src/js/bundle_error_tracking.js'
  ],
  footer: `${loaderSnippet(features.builtRel, services.builtRel)}\n;window.__wave87nGradeRuntimeCoreBundle = Object.freeze({wave:'wave87n', role:'core', lazy:['${features.builtRel}','${services.builtRel}'], bundled:["chunk_roadmap_wave86q_accessibility_theme.js","bundle_grade_after.js","chunk_roadmap_wave86n_progress_tools.js","bundle_error_tracking.js"], generatedAt:'${GENERATED_AT}'});`
});
const core = publishBundle(manifest, coreLogical, coreBundle);

removeManifestAsset(manifest, 'assets/js/bundle_grade_runtime_wave86z.js');

const runtimeScriptRe = /<script defer(?:="defer")? src="\.\/assets\/js\/bundle_grade_runtime_(?:wave86z|core_wave87n)\.[a-f0-9]{10}\.js"(?: fetchpriority="low")?><\/script>/g;
for (const file of HTML_FILES) {
  replaceInFile(file, runtimeScriptRe, `<script defer src="./${core.builtRel}"></script>`);
}

const swRaw = fs.readFileSync(SW_PATH, 'utf8');
let swNext = swRaw;
swNext = swNext.replace(/const CACHE_NAME = 'trainer-build-[^']+';/, `const CACHE_NAME = '${CACHE_NAME}';`);
swNext = swNext.replace(/\s+'\.\/assets\/js\/bundle_grade_runtime_wave86z\.[a-f0-9]{10}\.js',\n/, `\n  './${core.builtRel}',\n  './${features.builtRel}',\n  './${services.builtRel}',\n`);
if (swNext !== swRaw) fs.writeFileSync(SW_PATH, swNext);

manifest.version = BUILD_VERSION;
manifest.generated_at = GENERATED_AT;
manifest.hashed_asset_count = Object.keys(manifest.assets || {}).length;
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

const healthz = JSON.parse(fs.readFileSync(HEALTHZ_PATH, 'utf8'));
healthz.wave = WAVE;
healthz.version = BUILD_VERSION;
healthz.build_id = WAVE;
healthz.generated_at_utc = GENERATED_AT;
healthz.hashed_asset_count = manifest.hashed_asset_count;
healthz.cache = CACHE_NAME;
fs.writeFileSync(HEALTHZ_PATH, JSON.stringify(healthz, null, 2) + '\n');

console.log(JSON.stringify({
  wave: WAVE,
  cache: CACHE_NAME,
  updated: { core, features, services },
  gradePagesPatched: HTML_FILES.length,
  manifestCount: manifest.hashed_asset_count
}, null, 2));
