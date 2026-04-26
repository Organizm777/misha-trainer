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
assert.ok(waveRank(healthz.wave) >= waveRank('wave89f'), `healthz.wave should be wave89f+ (got ${healthz.wave})`);
assert.ok(waveRank(healthz.build_id) >= waveRank('wave89f'), `healthz.build_id should be wave89f+ (got ${healthz.build_id})`);
assert.ok(String(healthz.cache || '').includes(String(healthz.build_id || '')), `healthz.cache should reference healthz.build_id (got ${healthz.cache})`);

const runtimeLogical = 'assets/js/bundle_grade_runtime_extended_wave89b.js';
const cssLogical = 'assets/css/wave88d_breadcrumbs.css';
const runtimeBuilt = manifest.assets?.[runtimeLogical];
const cssBuilt = manifest.assets?.[cssLogical];
assert.ok(runtimeBuilt, `asset-manifest: missing ${runtimeLogical}`);
assert.ok(cssBuilt, `asset-manifest: missing ${cssLogical}`);
assert.ok(exists(runtimeBuilt), `missing built runtime asset ${runtimeBuilt}`);
assert.ok(exists(cssBuilt), `missing built css asset ${cssBuilt}`);
assert.ok(sw.includes(`./${runtimeBuilt}`), 'sw.js should precache the rebuilt merged runtime');
assert.ok(sw.includes(`./${cssBuilt}`), 'sw.js should precache the rebuilt shared css');

const srcRuntime = read('assets/_src/js/bundle_grade_runtime_extended_wave89b.js');
const srcCss = read('assets/_src/css/wave88d_breadcrumbs.css');
const builtRuntimeSource = read(runtimeBuilt);
const builtCssSource = read(cssBuilt);
const changelog = read('CHANGELOG.md');
const docs = read('docs/HAMBURGER_MENU_wave89f.md');
const validateWorkflow = read('.github/workflows/validate-questions.yml');
const lighthouseWorkflow = read('.github/workflows/lighthouse-budget.yml');
const toolsReadme = read('tools/README.md');
const claude = read('CLAUDE.md');

assert.ok(srcRuntime.includes('/* wave89f: hamburger menu / secondary actions */'), 'runtime source should contain the wave89f hamburger marker');
assert.ok(srcRuntime.includes('__wave89fHamburgerMenu'), 'runtime source should expose the wave89f hamburger API');
assert.ok(srcRuntime.includes('wave89f-menu-trigger'), 'runtime source should inject the hamburger trigger');
assert.ok(srcRuntime.includes('wave89f-menu-overlay'), 'runtime source should build the hamburger overlay');
assert.ok(srcRuntime.includes('exportParentProgress'), 'runtime source should route CSV/JSON export through progress tools');
assert.ok(srcRuntime.includes('wave86wCloudSync.open'), 'runtime source should route sync through the cloud-sync modal');
assert.ok(srcRuntime.includes('showRushRecords'), 'runtime source should move the rating entry into the menu');
assert.ok(srcRuntime.includes('showHallOfFame'), 'runtime source should move the profile entry into the menu');
assert.ok(srcRuntime.includes("components: ['wave87w'"), 'merged runtime marker should keep the merged component metadata');
assert.ok(srcRuntime.includes("'wave89h'"), 'merged runtime marker should include wave89h');

assert.ok(srcCss.includes('.wave89f-menu-trigger'), 'css source should style the hamburger trigger');
assert.ok(srcCss.includes('.wave89f-menu-overlay'), 'css source should style the hamburger overlay');
assert.ok(srcCss.includes('[data-wave89f-relocated="1"]'), 'css source should hide relocated legacy buttons');
assert.ok(srcCss.includes('wave89f-menu-open'), 'css source should lock scrolling while the menu is open');

assert.ok(builtRuntimeSource.includes('/* wave89f: hamburger menu / secondary actions */'), 'built runtime should contain the wave89f hamburger code');
assert.ok(builtCssSource.includes('.wave89f-menu-trigger'), 'built css should contain the hamburger styles');

for (let grade = 1; grade <= 11; grade += 1) {
  const page = `grade${grade}_v2.html`;
  const html = read(page);
  assert.ok(html.includes(`./${runtimeBuilt}`), `${page} should reference the rebuilt merged runtime`);
  assert.ok(html.includes(`./${cssBuilt}`), `${page} should reference the rebuilt shared css asset`);
  const scriptCount = (html.match(/<script\b[^>]*\bsrc=/g) || []).length;
  assert.ok(scriptCount <= 20, `${page} should stay within the 20-script budget (got ${scriptCount})`);
}

assert.ok(changelog.includes('## wave89f'), 'CHANGELOG should document wave89f');
assert.ok(docs.includes('profile/rating/backup/sync/export'), 'wave89f doc should mention the relocated secondary actions');
assert.ok(validateWorkflow.includes('node tools/audit_hamburger_wave89f.mjs'), 'validate workflow should run the wave89f hamburger audit');
assert.ok(lighthouseWorkflow.includes('node tools/audit_hamburger_wave89f.mjs'), 'lighthouse workflow should run the wave89f hamburger audit');
assert.ok(toolsReadme.includes('audit_hamburger_wave89f.mjs'), 'tools README should list the wave89f hamburger audit');
assert.ok(claude.includes('### wave89f hamburger menu'), 'CLAUDE.md should document the wave89f hamburger wave');

const runtimeMarker = '/* wave89f: hamburger menu / secondary actions */';
const runtimeStart = srcRuntime.indexOf(runtimeMarker);
assert.ok(runtimeStart >= 0, 'could not find the wave89f runtime marker');
const isolatedRuntime = srcRuntime.slice(runtimeStart);

function createClassList(initial = []){
  const set = new Set(initial.filter(Boolean));
  return {
    add(...names){ names.forEach((name) => set.add(String(name))); },
    remove(...names){ names.forEach((name) => set.delete(String(name))); },
    contains(name){ return set.has(String(name)); },
    toggle(name, force){
      if (force === true) { set.add(String(name)); return true; }
      if (force === false) { set.delete(String(name)); return false; }
      if (set.has(String(name))) { set.delete(String(name)); return false; }
      set.add(String(name));
      return true;
    },
    toString(){ return Array.from(set).join(' '); },
    toArray(){ return Array.from(set); },
    setFromString(value){
      set.clear();
      String(value || '').split(/\s+/).forEach((part) => { if (part) set.add(part); });
    }
  };
}

function makeNode(tagName, doc){
  const listeners = new Map();
  const attrs = new Map();
  const node = {
    nodeType: 1,
    tagName: String(tagName || 'div').toUpperCase(),
    ownerDocument: doc,
    children: [],
    parentNode: null,
    parentElement: null,
    style: {},
    hidden: false,
    disabled: false,
    textContent: '',
    isContentEditable: false,
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
      list.forEach((fn) => fn.call(node, event));
      return true;
    },
    setAttribute(name, value){ attrs.set(String(name), String(value)); },
    getAttribute(name){ return attrs.has(String(name)) ? attrs.get(String(name)) : null; },
    hasAttribute(name){ return attrs.has(String(name)); },
    removeAttribute(name){ attrs.delete(String(name)); },
    focus(){},
    click(){
      const list = listeners.get('click') || [];
      list.forEach((fn) => fn.call(node, { type:'click', target:node, preventDefault(){}, stopPropagation(){} }));
    },
    querySelector(selector){
      return queryWithin(node, selector, true);
    },
    querySelectorAll(selector){
      return queryWithin(node, selector, false);
    }
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

function matchesSelector(node, selector){
  const sel = String(selector || '').trim();
  if (!sel) return false;
  if (sel === 'header') return node.tagName === 'HEADER';
  if (sel.startsWith('#')) return node.id === sel.slice(1);
  if (sel.startsWith('.')) return node.classList.contains(sel.slice(1));
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

function runVm(options = {}){
  const calls = [];
  const timeouts = [];
  const documentElement = makeNode('html', null);
  const body = makeNode('body', null);
  const header = makeNode('header', null);
  const screens = {};
  [
    's-main','s-subj','s-theory','s-play','s-result','s-prog','s-info'
  ].forEach((id) => {
    const node = makeNode('div', null);
    node.id = id;
    node.className = id === (options.activeScreen || 's-main') ? 'scr on' : 'scr';
    screens[id] = node;
    body.appendChild(node);
  });
  body.appendChild(header);
  documentElement.appendChild(body);

  const document = {
    readyState: 'complete',
    documentElement,
    body,
    addEventListener(){},
    removeEventListener(){},
    dispatchEvent(){ return true; },
    createElement(tag){ return makeNode(tag, document); },
    getElementById(id){
      return queryWithin(documentElement, `#${id}`, true);
    },
    querySelector(selector){
      if (selector === 'header') return header;
      return queryWithin(documentElement, selector, true);
    },
    querySelectorAll(selector){
      const sel = String(selector || '').trim();
      if (!sel) return [];
      if (sel === '[data-wave87r-action="show-profile"], [data-wave87r-action="generate-report"], [data-wave87r-action="show-backup"], [data-wave87r-action="share-report"]') return [];
      if (sel === '#wave86n-export-row, #wave86w-main-cloud-btn') return [];
      if (sel === '#daily-meter button[onclick*="showRushRecords"]') return [];
      if (sel === '[data-wave89f-menu-row="1"]') return [];
      return queryWithin(documentElement, selector, false);
    }
  };
  documentElement.ownerDocument = document;
  body.ownerDocument = document;
  header.ownerDocument = document;
  Object.values(screens).forEach((node) => { node.ownerDocument = document; });

  const context = {
    window: {},
    document,
    localStorage: {
      getItem(){ return null; },
      setItem(){},
      removeItem(){}
    },
    MutationObserver: function(){ this.observe = function(){}; this.disconnect = function(){}; },
    CustomEvent: function(type, init){ this.type = type; this.detail = init && init.detail; },
    console,
    setTimeout(fn){ if (typeof fn === 'function') fn(); const id = timeouts.length + 1; timeouts.push(id); return id; },
    clearTimeout(){},
    addEventListener(){},
    removeEventListener(){},
    toast(msg){ calls.push(['toast', String(msg)]); },
    alert(msg){ calls.push(['alert', String(msg)]); },
    confirm(){ calls.push(['confirm']); return options.confirmResult !== false; },
    showHallOfFame(){ calls.push(['show-profile']); },
    showRushRecords(){ calls.push(['show-rating']); },
    generateReport(){ calls.push(['generate-report']); },
    shareReport(){ calls.push(['share-report']); },
    showBackupModal(){ calls.push(['show-backup']); },
    showAbout(){ calls.push(['show-about']); },
    showClassSelect(){ calls.push(['show-class-select']); },
    endSession(){ calls.push(['end-session']); return true; },
    location: {
      href: '',
      assign(url){ calls.push(['assign', String(url)]); this.href = String(url); }
    },
    wave86nProgressTools: {
      exportParentProgress(format){ calls.push(['export', String(format)]); }
    },
    wave86wCloudSync: {
      open(){ calls.push(['sync-open']); }
    },
    wave87nRuntimeSplit: {
      hydrateForAction(action){ calls.push(['hydrate', String(action)]); return true; },
      loadServices(){ calls.push(['load-services']); return true; }
    },
    __wave89dSimpleMode: {
      isEnabled(){ return options.simpleMode !== false; },
      blockAdvanced(kind){ calls.push(['block-advanced', String(kind)]); return false; },
      openSettings(){ calls.push(['open-settings']); }
    },
    GRADE_NUM: options.grade || '10',
    GRADE_NO: options.grade || '10',
    GRADE_TITLE: options.gradeTitle || '10 класс'
  };
  context.window = context;
  vm.runInNewContext(isolatedRuntime, context, { timeout: 1000 });
  return { context, calls, document, header };
}

async function flushMicrotasks(){
  await Promise.resolve();
  await Promise.resolve();
}

const simpleVm = runVm({ simpleMode:true, activeScreen:'s-main' });
assert.ok(simpleVm.context.window.__wave89fHamburgerMenu, 'vm: __wave89fHamburgerMenu should be exposed');
assert.equal(simpleVm.context.window.__wave89fHamburgerMenu.triggerId, 'wave89f-menu-trigger', 'vm: triggerId mismatch');
const simpleItems = simpleVm.context.window.__wave89fHamburgerMenu.visibleItemIds();
['profile', 'report', 'share-report', 'export-csv', 'export-json', 'backup', 'settings', 'classes'].forEach((id) => {
  assert.ok(simpleItems.includes(id), `vm: simple-mode menu should include ${id}`);
});
['rating', 'sync'].forEach((id) => {
  assert.ok(!simpleItems.includes(id), `vm: simple-mode menu should hide ${id}`);
});
assert.ok(simpleVm.document.getElementById('wave89f-menu-trigger'), 'vm: bind() should inject the hamburger trigger into the header');
simpleVm.context.window.__wave89fHamburgerMenu.open();
assert.ok(simpleVm.document.getElementById('wave89f-menu-overlay'), 'vm: open() should create the menu overlay');
assert.equal(simpleVm.context.window.__wave89fHamburgerMenu.isOpen(), true, 'vm: menu should report open state after open()');
simpleVm.context.window.__wave89fHamburgerMenu.close();
assert.equal(simpleVm.context.window.__wave89fHamburgerMenu.isOpen(), false, 'vm: menu should close cleanly');
simpleVm.context.window.__wave89fHamburgerMenu.runMenuAction('rating');
assert.ok(simpleVm.calls.some(([kind, value]) => kind === 'block-advanced' && value === 'rating'), 'vm: rating action should be blocked in simple mode');

const advancedVm = runVm({ simpleMode:false, activeScreen:'s-main' });
const advancedItems = advancedVm.context.window.__wave89fHamburgerMenu.visibleItemIds();
['rating', 'sync'].forEach((id) => {
  assert.ok(advancedItems.includes(id), `vm: advanced menu should expose ${id}`);
});
advancedVm.context.window.__wave89fHamburgerMenu.runMenuAction('profile');
await flushMicrotasks();
assert.ok(advancedVm.calls.some(([kind, value]) => kind === 'hydrate' && value === 'show-profile'), 'vm: profile action should hydrate show-profile');
assert.ok(advancedVm.calls.some(([kind]) => kind === 'show-profile'), 'vm: profile action should open the profile modal');
advancedVm.context.window.__wave89fHamburgerMenu.runMenuAction('export-csv');
assert.ok(advancedVm.calls.some(([kind, value]) => kind === 'export' && value === 'csv'), 'vm: export-csv should call the progress-tools exporter');
advancedVm.context.window.__wave89fHamburgerMenu.runMenuAction('sync');
await flushMicrotasks();
assert.ok(advancedVm.calls.some(([kind]) => kind === 'load-services'), 'vm: sync action should warm services');
assert.ok(advancedVm.calls.some(([kind]) => kind === 'sync-open'), 'vm: sync action should open the cloud-sync modal');
advancedVm.context.window.__wave89fHamburgerMenu.runMenuAction('classes');
assert.ok(advancedVm.calls.some(([kind]) => kind === 'show-class-select'), 'vm: classes action should open the class picker');

const blockedPlayVm = runVm({ simpleMode:false, activeScreen:'s-play', confirmResult:false });
assert.equal(blockedPlayVm.context.window.__wave89fHamburgerMenu.runMenuAction('report'), false, 'vm: report action should abort when play-screen confirm is cancelled');
assert.ok(blockedPlayVm.calls.some(([kind]) => kind === 'confirm'), 'vm: play-screen action should confirm before leaving the session');
assert.ok(!blockedPlayVm.calls.some(([kind]) => kind === 'generate-report'), 'vm: report action should not run after cancelled confirm');

const leavePlayVm = runVm({ simpleMode:false, activeScreen:'s-play', confirmResult:true });
leavePlayVm.context.window.__wave89fHamburgerMenu.runMenuAction('report');
await flushMicrotasks();
assert.ok(leavePlayVm.calls.some(([kind]) => kind === 'end-session'), 'vm: confirmed play-screen action should end the session first');
assert.ok(leavePlayVm.calls.some(([kind, value]) => kind === 'hydrate' && value === 'generate-report'), 'vm: report action should hydrate generate-report after leaving play');
assert.ok(leavePlayVm.calls.some(([kind]) => kind === 'generate-report'), 'vm: report action should open the parent report after leaving play');

console.log(JSON.stringify({
  ok: true,
  wave: healthz.wave,
  runtime: runtimeBuilt,
  css: cssBuilt,
  hashedAssetCount: healthz.hashed_asset_count,
  visibleItemsSimple: simpleItems,
  visibleItemsAdvanced: advancedItems
}, null, 2));
