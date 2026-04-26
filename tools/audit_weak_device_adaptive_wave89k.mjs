#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import assert from 'assert/strict';
import vm from 'vm';

const ROOT = process.cwd();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const readJSON = (rel) => JSON.parse(read(rel));
function waveRank(value){
  const raw = String(value || '').trim().toLowerCase();
  const match = raw.match(/^wave(\d+)([a-z]*)$/);
  if (!match) return -1;
  const major = Number(match[1]) || 0;
  const suffix = match[2] || '';
  let minor = 0;
  for (let i = 0; i < suffix.length; i += 1) minor = minor * 26 + (suffix.charCodeAt(i) - 96);
  return major * 1000 + minor;
}
function createClassList(initial = []){
  const set = new Set(initial.filter(Boolean));
  return {
    add(...names){ names.forEach((name) => set.add(String(name))); },
    remove(...names){ names.forEach((name) => set.delete(String(name))); },
    contains(name){ return set.has(String(name)); },
    toString(){ return Array.from(set).join(' '); }
  };
}
function createNode(tagName){
  return {
    tagName: String(tagName || 'div').toUpperCase(),
    classList: createClassList(),
    style: {},
    clientWidth: 0,
    clientHeight: 0,
    addEventListener(){},
    removeEventListener(){},
    appendChild(){},
    setAttribute(){},
    getAttribute(){ return null; }
  };
}
function makeContext(options = {}){
  const html = createNode('html');
  const body = createNode('body');
  html.clientWidth = options.width || 0;
  html.clientHeight = options.height || 0;
  body.clientWidth = options.width || 0;
  body.clientHeight = options.height || 0;
  const mediaListeners = [];
  const mediaState = {
    coarse: !!options.coarse,
    reduced: !!options.reducedMotion
  };
  const connection = {
    saveData: !!options.saveData,
    addEventListener(_type, fn){ mediaListeners.push(fn); },
    addListener(fn){ mediaListeners.push(fn); }
  };
  const document = {
    readyState: 'complete',
    documentElement: html,
    body,
    addEventListener(){},
    removeEventListener(){},
    dispatchEvent(){},
    createElement: createNode,
    getElementById(){ return null; },
    querySelector(){ return null; },
    querySelectorAll(){ return []; }
  };
  const context = vm.createContext({
    console: { log(){}, warn(){}, error(){}, info(){} },
    Math, Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError,
    parseInt, parseFloat, isFinite, isNaN,
    document,
    navigator: {
      maxTouchPoints: options.maxTouchPoints || 0,
      deviceMemory: options.deviceMemory,
      hardwareConcurrency: options.hardwareConcurrency,
      connection
    },
    innerWidth: options.width || 0,
    innerHeight: options.height || 0,
    addEventListener(){},
    removeEventListener(){},
    setTimeout(fn){ if (typeof fn === 'function') fn(); return 1; },
    clearTimeout(){},
    CustomEvent: function CustomEvent(type, init){ this.type = type; this.detail = init && init.detail; },
    matchMedia(query){
      const q = String(query || '');
      const matches = q.includes('prefers-reduced-motion') ? mediaState.reduced : mediaState.coarse;
      return {
        matches,
        media: q,
        addEventListener(_type, fn){ mediaListeners.push(fn); },
        addListener(fn){ mediaListeners.push(fn); }
      };
    }
  });
  context.window = context;
  context.self = context;
  context.globalThis = context;
  context.document = document;
  return { context, html, body };
}

const manifest = readJSON('assets/asset-manifest.json');
const healthz = readJSON('healthz.json');
const srcRuntime = read('assets/_src/js/bundle_grade_runtime_extended_wave89b.js');
const srcCss = read('assets/_src/css/wave88d_breadcrumbs.css');
const builtRuntimePath = manifest.assets['assets/js/bundle_grade_runtime_extended_wave89b.js'];
const builtCssPath = manifest.assets['assets/css/wave88d_breadcrumbs.css'];
const builtRuntime = read(builtRuntimePath);
const builtCss = read(builtCssPath);
const changelog = read('CHANGELOG.md');
const docs = read('docs/WEAK_DEVICE_ADAPTIVE_wave89k.md');
const claude = read('CLAUDE.md');
const toolsReadme = read('tools/README.md');
const validateWorkflow = read('.github/workflows/validate-questions.yml');
const lighthouseWorkflow = read('.github/workflows/lighthouse-budget.yml');

assert.ok(waveRank(healthz.wave) >= waveRank('wave89k'), `healthz.wave should be wave89k+ (got ${healthz.wave})`);
assert.ok(waveRank(healthz.build_id) >= waveRank('wave89k'), `healthz.build_id should be wave89k+ (got ${healthz.build_id})`);
assert.equal(manifest.version, healthz.version, 'manifest/healthz versions should match');
assert.ok(manifest.hashed_asset_count >= 101, 'hashed asset count should stay populated');

const gradePages = Array.from({ length:11 }, (_, idx) => `grade${idx + 1}_v2.html`);
gradePages.forEach((page) => {
  const html = read(page);
  assert.ok(html.includes(`./${builtRuntimePath}`), `${page} should reference rebuilt merged runtime`);
  assert.ok(html.includes(`./${builtCssPath}`), `${page} should reference rebuilt shared grade css`);
});

assert.ok(srcRuntime.includes('/* wave89k: weak-device adaptive UI / readability + tap targets */'), 'runtime source should contain the wave89k marker');
assert.ok(srcRuntime.includes('window.__wave89kAdaptiveUi'), 'runtime source should expose __wave89kAdaptiveUi');
assert.ok(srcRuntime.includes('deviceMemory'), 'runtime source should check navigator.deviceMemory');
assert.ok(srcRuntime.includes('hardwareConcurrency'), 'runtime source should check navigator.hardwareConcurrency');
assert.ok(srcRuntime.includes('saveData'), 'runtime source should check navigator.connection.saveData');
assert.ok(srcRuntime.includes('(pointer: coarse)'), 'runtime source should check coarse pointers');
assert.ok(srcRuntime.includes('wave89k-weak-ui'), 'runtime source should apply the wave89k weak-ui class');
assert.ok(srcRuntime.includes('wave89k-reduced-motion'), 'runtime source should apply the wave89k reduced-motion class');
assert.ok(builtRuntime.includes('/* wave89k: weak-device adaptive UI / readability + tap targets */'), 'rebuilt runtime should keep the wave89k marker');

assert.ok(srcCss.includes('/* wave89k: weak-device adaptive UI / readability + tap targets */'), 'css source should contain the wave89k marker');
assert.ok(srcCss.includes('html.wave89k-weak-ui .btn'), 'css source should target core buttons for wave89k');
assert.ok(srcCss.includes('min-height:48px;'), 'css source should enforce 48px tap targets');
assert.ok(srcCss.includes('font-size:16px;'), 'css source should enforce 16px core text');
assert.ok(srcCss.includes('html.wave89k-weak-ui .searchfield'), 'css source should enlarge the search field');
assert.ok(srcCss.includes('html.wave89k-reduced-motion .fade'), 'css source should disable extra motion in reduced-motion mode');
assert.ok(srcCss.includes('html.wave89k-weak-ui .wave89h-lazy-card'), 'css source should simplify blur-heavy overlays in wave89k mode');
assert.ok(builtCss.includes('/* wave89k: weak-device adaptive UI / readability + tap targets */'), 'rebuilt css should keep the wave89k marker');

assert.ok(changelog.includes('## wave89k'), 'CHANGELOG should document wave89k');
assert.ok(docs.includes('min-font 16px'), 'wave89k doc should mention 16px text');
assert.ok(docs.includes('48px+ tap targets'), 'wave89k doc should mention 48px tap targets');
assert.ok(claude.includes('### wave89k weak-device adaptive UI'), 'CLAUDE.md should document the wave89k adaptive UI wave');
assert.ok(toolsReadme.includes('audit_weak_device_adaptive_wave89k.mjs'), 'tools README should list the wave89k audit');
assert.ok(validateWorkflow.includes('node tools/audit_weak_device_adaptive_wave89k.mjs'), 'validate workflow should run the wave89k audit');
assert.ok(lighthouseWorkflow.includes('node tools/audit_weak_device_adaptive_wave89k.mjs'), 'lighthouse workflow should run the wave89k audit');

const marker = '/* wave89k: weak-device adaptive UI / readability + tap targets */';
const start = srcRuntime.indexOf(marker);
assert.ok(start >= 0, 'could not isolate the wave89k runtime block');
const isolated = srcRuntime.slice(start);

const weak = makeContext({ width:390, height:780, coarse:true, maxTouchPoints:5, deviceMemory:2, hardwareConcurrency:4, saveData:true, reducedMotion:false });
vm.runInContext(isolated, weak.context, { filename:'wave89k-weak.vm.js', timeout:1500 });
assert.ok(weak.context.window.__wave89kAdaptiveUi, 'vm weak: API should be exported');
assert.equal(weak.context.window.__wave89kAdaptiveUi.version, 'wave89k', 'vm weak: version mismatch');
const weakState = weak.context.window.__wave89kAdaptiveUi.apply();
assert.equal(weakState.enabled, true, 'vm weak: adaptive UI should enable on weak touch devices');
assert.equal(weakState.coarse, true, 'vm weak: coarse pointer should be detected');
assert.equal(weakState.lowMemory, true, 'vm weak: low memory should be detected');
assert.equal(weakState.lowCpu, true, 'vm weak: low cpu should be detected');
assert.equal(weakState.saveData, true, 'vm weak: save-data should be detected');
assert.ok(weak.html.classList.contains('wave89k-weak-ui'), 'vm weak: html should receive wave89k-weak-ui');
assert.ok(weak.body.classList.contains('wave89k-weak-ui'), 'vm weak: body should receive wave89k-weak-ui');
assert.ok(weak.html.classList.contains('wave89k-coarse'), 'vm weak: html should receive wave89k-coarse');

const desktop = makeContext({ width:1366, height:900, coarse:false, maxTouchPoints:0, deviceMemory:8, hardwareConcurrency:8, saveData:false, reducedMotion:false });
vm.runInContext(isolated, desktop.context, { filename:'wave89k-desktop.vm.js', timeout:1500 });
const desktopState = desktop.context.window.__wave89kAdaptiveUi.apply();
assert.equal(desktopState.enabled, false, 'vm desktop: adaptive UI should stay off on roomy desktops');
assert.ok(!desktop.html.classList.contains('wave89k-weak-ui'), 'vm desktop: html should stay without wave89k-weak-ui');

const reduced = makeContext({ width:1024, height:768, coarse:false, maxTouchPoints:0, deviceMemory:8, hardwareConcurrency:8, saveData:false, reducedMotion:true });
vm.runInContext(isolated, reduced.context, { filename:'wave89k-reduced.vm.js', timeout:1500 });
const reducedState = reduced.context.window.__wave89kAdaptiveUi.apply();
assert.equal(reducedState.enabled, true, 'vm reduced: reduced-motion alone should enable adaptive UI');
assert.equal(reducedState.reducedMotion, true, 'vm reduced: reduced motion should be detected');
assert.ok(reduced.html.classList.contains('wave89k-reduced-motion'), 'vm reduced: html should receive wave89k-reduced-motion');

console.log(JSON.stringify({
  ok: true,
  wave: healthz.wave,
  hashedAssetCount: manifest.hashed_asset_count,
  gradePages: gradePages.length,
  weakState,
  desktopState,
  reducedState
}, null, 2));
