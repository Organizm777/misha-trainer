#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import assert from 'assert/strict';
import vm from 'vm';

const ROOT = process.cwd();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const readJSON = (rel) => JSON.parse(read(rel));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

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

const manifest = readJSON('assets/asset-manifest.json');
const healthz = readJSON('healthz.json');
const sw = read('sw.js');
assert.ok(waveRank(healthz.wave) >= waveRank('wave89h'), `healthz.wave should be wave89h+ (got ${healthz.wave})`);
assert.ok(waveRank(healthz.build_id) >= waveRank('wave89h'), `healthz.build_id should be wave89h+ (got ${healthz.build_id})`);
assert.ok(String(healthz.cache || '').includes(String(healthz.build_id || '')), `healthz.cache should reference healthz.build_id (got ${healthz.cache})`);

const logical = {
  core: 'assets/js/bundle_grade_runtime_core_wave87n.js',
  runtime: 'assets/js/bundle_grade_runtime_extended_wave89b.js',
  css: 'assets/css/wave88d_breadcrumbs.css',
  lazy10: 'assets/js/chunk_grade10_lazy_wave86s.js'
};
const built = Object.fromEntries(Object.entries(logical).map(([k, rel]) => [k, manifest.assets?.[rel] || '']));
for (const [k, rel] of Object.entries(built)) {
  assert.ok(rel, `asset-manifest: missing ${logical[k]}`);
  assert.ok(exists(rel), `missing built asset ${rel}`);
  assert.ok(sw.includes(`./${rel}`), `sw.js should precache ${rel}`);
}

const srcCore = read('assets/_src/js/bundle_grade_runtime_core_wave87n.js');
const srcRuntime = read('assets/_src/js/bundle_grade_runtime_extended_wave89b.js');
const srcCss = read('assets/_src/css/wave88d_breadcrumbs.css');
const srcLazy10 = read('assets/_src/js/chunk_grade10_lazy_wave86s.js');
const builtCore = read(built.core);
const builtRuntime = read(built.runtime);
const builtCss = read(built.css);
const builtLazy10 = read(built.lazy10);
const changelog = read('CHANGELOG.md');
const docs = read('docs/SKELETON_LOADING_wave89h.md');
const toolsReadme = read('tools/README.md');
const claude = read('CLAUDE.md');
const validateWorkflow = read('.github/workflows/validate-questions.yml');
const lighthouseWorkflow = read('.github/workflows/lighthouse-budget.yml');

assert.ok(srcCore.includes('/* wave89h: lazy loading skeleton events */'), 'core source should contain the wave89h marker');
assert.ok(srcCore.includes("trainer:lazy-"), 'core source should emit trainer:lazy-* events');
assert.ok(srcCore.includes('actionUiMeta'), 'core source should expose actionUiMeta');
assert.ok(srcCore.includes("hydrateForAction(action, { interactive:true, source:'direct-click' })"), 'core source should request interactive hydration for direct click actions');
assert.ok(srcCore.includes("hydrateForAction(action, { warmup:true, source:'intent-warmup' })"), 'core source should keep warmup hydration without UI');
assert.ok(srcCore.includes("function loadServices(opts){ return load('services', opts); }"), 'core source should accept opt-in UI metadata for loadServices');

assert.ok(srcRuntime.includes('/* wave89h: skeleton loading / lazy chunks */'), 'merged runtime source should contain the wave89h skeleton marker');
assert.ok(srcRuntime.includes('root.__wave89hLazySkeleton'), 'merged runtime source should expose the wave89h API');
assert.ok(srcRuntime.includes("hydrate('show-badges', { interactive:true, source:'menu-badges' })"), 'menu badges should hydrate interactively');
assert.ok(srcRuntime.includes("hydrate('show-profile', { interactive:true, source:'menu-profile' })"), 'menu profile should hydrate interactively');
assert.ok(srcRuntime.includes("loadServices({ ui:{ scope:'runtime', kind:'services', action:'sync'"), 'menu sync should request lazy-service skeleton UI');
assert.ok(srcRuntime.includes("components: ['wave87w'"), 'merged runtime marker should keep the merged component metadata');
assert.ok(srcRuntime.includes("'wave89h'"), 'merged runtime marker should include wave89h');

assert.ok(srcLazy10.includes('/* wave89h: grade10 lazy subject skeleton */'), 'grade10 lazy loader source should contain the wave89h marker');
assert.ok(srcLazy10.includes('subjectUiMeta'), 'grade10 lazy loader should expose subjectUiMeta');
assert.ok(srcLazy10.includes('wave89h-inline-card'), 'grade10 lazy loader should render inline skeleton cards');
assert.ok(srcLazy10.includes("trainer:lazy-"), 'grade10 lazy loader should emit trainer:lazy-* events');
assert.ok(srcLazy10.includes("hydrateAll({ ui: subjectUiMeta(null, 'all') })"), 'grade10 lazy loader should wrap global hydration with skeleton UI');

assert.ok(srcCss.includes('.wave89h-lazy-overlay'), 'shared css source should style the lazy overlay');
assert.ok(srcCss.includes('.wave89h-inline-card'), 'shared css source should style inline lazy cards');
assert.ok(srcCss.includes('.wave89h-skeleton-line'), 'shared css source should style skeleton lines');
assert.ok(srcCss.includes('@keyframes wave89h-shimmer'), 'shared css source should define the shimmer animation');

assert.ok(builtCore.includes('/* wave89h: lazy loading skeleton events */'), 'rebuilt core bundle should contain the wave89h marker');
assert.ok(builtRuntime.includes('/* wave89h: skeleton loading / lazy chunks */'), 'rebuilt merged runtime should contain the wave89h marker');
assert.ok(builtLazy10.includes('/* wave89h: grade10 lazy subject skeleton */'), 'rebuilt grade10 lazy chunk should contain the wave89h marker');
assert.ok(builtCss.includes('.wave89h-lazy-overlay'), 'rebuilt shared css should contain the wave89h styles');

for (let grade = 1; grade <= 11; grade += 1) {
  const html = read(`grade${grade}_v2.html`);
  assert.ok(html.includes(`./${built.core}`), `grade${grade}_v2.html should load the rebuilt core runtime`);
  assert.ok(html.includes(`./${built.runtime}`), `grade${grade}_v2.html should load the rebuilt merged runtime`);
  assert.ok(html.includes(`./${built.css}`), `grade${grade}_v2.html should load the rebuilt shared css`);
}
assert.ok(read('grade10_v2.html').includes(`./${built.lazy10}`), 'grade10_v2.html should load the rebuilt grade10 lazy chunk');

assert.ok(changelog.includes('## wave89h'), 'CHANGELOG should document wave89h');
assert.ok(docs.includes('trainer:lazy-start'), 'wave89h doc should describe the lazy-start event bridge');
assert.ok(toolsReadme.includes('audit_skeleton_loading_wave89h.mjs'), 'tools README should list the wave89h skeleton audit');
assert.ok(claude.includes('### wave89h skeleton loading'), 'CLAUDE.md should document the wave89h skeleton wave');
assert.ok(validateWorkflow.includes('node tools/audit_skeleton_loading_wave89h.mjs'), 'validate workflow should run the wave89h audit');
assert.ok(lighthouseWorkflow.includes('node tools/audit_skeleton_loading_wave89h.mjs'), 'lighthouse workflow should run the wave89h audit');

function createClassList(initial = []){
  const set = new Set(initial.filter(Boolean));
  return {
    add(...names){ names.forEach((name) => set.add(String(name))); },
    remove(...names){ names.forEach((name) => set.delete(String(name))); },
    contains(name){ return set.has(String(name)); },
    toString(){ return Array.from(set).join(' '); },
    setFromString(value){
      set.clear();
      String(value || '').split(/\s+/).forEach((part) => { if (part) set.add(part); });
    }
  };
}

function matchesSelector(node, selector){
  const sel = String(selector || '').trim();
  if (!sel || !node || node.nodeType !== 1) return false;
  if (sel.startsWith('#')) return node.id === sel.slice(1);
  if (sel.startsWith('.')) return node.classList.contains(sel.slice(1));
  const attr = sel.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
  if (attr) {
    if (!node.hasAttribute(attr[1])) return false;
    if (attr[2] == null) return true;
    return node.getAttribute(attr[1]) === attr[2];
  }
  return node.tagName === sel.toUpperCase();
}

function queryWithin(rootNode, selector, firstOnly){
  const selectors = String(selector || '').split(',').map((s) => s.trim()).filter(Boolean);
  const out = [];
  function walk(node){
    if (!node || !node.children) return false;
    for (const child of node.children) {
      for (const sel of selectors) {
        if (matchesSelector(child, sel)) {
          out.push(child);
          if (firstOnly) return true;
          break;
        }
      }
      if (walk(child) && firstOnly) return true;
    }
    return false;
  }
  walk(rootNode);
  return firstOnly ? (out[0] || null) : out;
}

function makeNode(tagName, doc){
  const attrs = new Map();
  const node = {
    nodeType: 1,
    tagName: String(tagName || 'div').toUpperCase(),
    ownerDocument: doc,
    parentNode: null,
    parentElement: null,
    children: [],
    style: {},
    textContent: '',
    classList: createClassList(),
    appendChild(child){
      if (!child) return child;
      child.parentNode = node;
      child.parentElement = node;
      node.children.push(child);
      return child;
    },
    removeChild(child){
      const idx = node.children.indexOf(child);
      if (idx >= 0) node.children.splice(idx, 1);
      if (child) {
        child.parentNode = null;
        child.parentElement = null;
      }
      return child;
    },
    setAttribute(name, value){ attrs.set(String(name), String(value)); },
    getAttribute(name){ return attrs.has(String(name)) ? attrs.get(String(name)) : null; },
    hasAttribute(name){ return attrs.has(String(name)); },
    removeAttribute(name){ attrs.delete(String(name)); },
    querySelector(selector){ return queryWithin(node, selector, true); },
    querySelectorAll(selector){ return queryWithin(node, selector, false); }
  };
  Object.defineProperty(node, 'id', {
    get(){ return attrs.get('id') || ''; },
    set(value){ attrs.set('id', String(value)); }
  });
  Object.defineProperty(node, 'className', {
    get(){ return node.classList.toString(); },
    set(value){ node.classList.setFromString(value); }
  });
  return node;
}

const marker = '/* wave89h: skeleton loading / lazy chunks */';
const start = srcRuntime.indexOf(marker);
assert.ok(start >= 0, 'could not locate the wave89h runtime marker');
const isolated = srcRuntime.slice(start);

function runVm(){
  const timers = [];
  let timerSeq = 0;
  const listeners = new Map();
  const documentElement = makeNode('html', null);
  const body = makeNode('body', null);
  documentElement.appendChild(body);
  const document = {
    readyState: 'complete',
    body,
    documentElement,
    createElement(tag){ return makeNode(tag, document); },
    getElementById(id){ return queryWithin(documentElement, `#${id}`, true); },
    querySelector(selector){ return queryWithin(documentElement, selector, true); },
    querySelectorAll(selector){ return queryWithin(documentElement, selector, false); },
    addEventListener(){},
    removeEventListener(){}
  };
  const root = {
    document,
    addEventListener(type, handler){
      const key = String(type);
      const list = listeners.get(key) || [];
      list.push(handler);
      listeners.set(key, list);
    },
    removeEventListener(type, handler){
      const key = String(type);
      const list = listeners.get(key) || [];
      listeners.set(key, list.filter((fn) => fn !== handler));
    },
    dispatchEvent(event){
      const key = String(event && event.type || '');
      const list = listeners.get(key) || [];
      list.forEach((fn) => fn.call(root, event));
      return true;
    },
    setTimeout(fn){
      const id = ++timerSeq;
      timers.push({ id, fn });
      return id;
    },
    clearTimeout(id){
      const idx = timers.findIndex((row) => row.id === id);
      if (idx >= 0) timers.splice(idx, 1);
    }
  };
  class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  }
  const context = vm.createContext({
    window: root,
    document,
    CustomEvent,
    console,
    setTimeout: root.setTimeout.bind(root),
    clearTimeout: root.clearTimeout.bind(root)
  });
  vm.runInContext(isolated, context, { timeout: 2000 });
  function flushTimers(){
    while (timers.length) {
      const timer = timers.shift();
      timer.fn();
    }
  }
  return { root, document, flushTimers };
}

const vmState = runVm();
assert.ok(vmState.root.__wave89hLazySkeleton, 'VM should expose __wave89hLazySkeleton');
vmState.root.dispatchEvent(new (class {
  constructor(){ this.type = 'trainer:lazy-start'; this.detail = { id:'req-1', scope:'runtime', kind:'services', title:'Подгружаю профиль', label:'Загружаю профиль и сервисы…' }; }
})());
assert.equal(vmState.root.__wave89hLazySkeleton.pendingCount(), 1, 'pendingCount should increment after lazy-start');
assert.equal(vmState.root.__wave89hLazySkeleton.isOpen(), false, 'overlay should wait for the debounce timer before opening');
vmState.flushTimers();
assert.equal(vmState.root.__wave89hLazySkeleton.isOpen(), true, 'overlay should open after flushing the debounce timer');
const overlay = vmState.document.getElementById('wave89h-lazy-overlay');
assert.ok(overlay, 'overlay should be created in the VM');
assert.equal(overlay.getAttribute('aria-hidden'), 'false', 'overlay should be visible after lazy-start');
assert.equal(vmState.root.__wave89hLazySkeleton.latest()?.id, 'req-1', 'latest pending request should be req-1');
vmState.root.dispatchEvent(new (class {
  constructor(){ this.type = 'trainer:lazy-end'; this.detail = { id:'req-1' }; }
})());
assert.equal(vmState.root.__wave89hLazySkeleton.pendingCount(), 0, 'pendingCount should drop after lazy-end');
assert.equal(vmState.root.__wave89hLazySkeleton.isOpen(), false, 'overlay should close after the pending request ends');
assert.equal(overlay.getAttribute('aria-hidden'), 'true', 'overlay should become hidden after lazy-end');

console.log(JSON.stringify({
  ok: true,
  wave: healthz.wave,
  core: built.core,
  runtime: built.runtime,
  css: built.css,
  lazy10: built.lazy10,
  hashedAssetCount: healthz.hashed_asset_count
}, null, 2));
