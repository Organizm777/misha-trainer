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
assert.ok(waveRank(healthz.wave) >= waveRank('wave89g'), `healthz.wave should be wave89g+ (got ${healthz.wave})`);
assert.ok(waveRank(healthz.build_id) >= waveRank('wave89g'), `healthz.build_id should be wave89g+ (got ${healthz.build_id})`);
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
const docs = read('docs/MINIMAL_FOOTER_wave89g.md');
const validateWorkflow = read('.github/workflows/validate-questions.yml');
const lighthouseWorkflow = read('.github/workflows/lighthouse-budget.yml');
const toolsReadme = read('tools/README.md');
const claude = read('CLAUDE.md');

assert.ok(srcRuntime.includes('/* wave89g: minimal main footer / utility condensation */'), 'runtime source should contain the wave89g footer marker');
assert.ok(srcRuntime.includes('__wave89gMinimalFooter'), 'runtime source should expose the wave89g footer API');
assert.ok(srcRuntime.includes("components: ['wave87w'"), 'merged runtime marker should keep the merged component metadata');
assert.ok(srcRuntime.includes("'wave89h'"), 'merged runtime marker should include wave89h');
assert.ok(srcRuntime.includes("var LEGACY_ACTIONS = ['go-info', 'show-journal', 'show-badges', 'show-class-select', 'go-prog', 'show-about', 'show-date-editor'];"), 'runtime source should define the wave89g legacy footer actions');
assert.ok(srcRuntime.includes("id:'help'"), 'hamburger menu should now expose help');
assert.ok(srcRuntime.includes("id:'journal'"), 'hamburger menu should now expose journal/errors');
assert.ok(srcRuntime.includes("id:'badges'"), 'hamburger menu should now expose badges');
assert.ok(srcRuntime.includes("id:'dates'"), 'hamburger menu should now expose date editing');
assert.ok(srcRuntime.includes("footerButton('📈 Прогресс', 'go-prog', true)"), 'runtime source should create the progress footer button');
assert.ok(srcRuntime.includes("footerButton('⚙️ Настройки', 'show-about', false)"), 'runtime source should create the settings footer button');

assert.ok(srcCss.includes('.wave89g-main-footer'), 'css source should style the compact footer container');
assert.ok(srcCss.includes('.wave89g-main-footer-grid'), 'css source should style the compact footer grid');
assert.ok(srcCss.includes('[data-wave89g-footer-legacy="1"]'), 'css source should hide legacy utility rows');

assert.ok(builtRuntimeSource.includes('/* wave89g: minimal main footer / utility condensation */'), 'built runtime should contain the wave89g footer code');
assert.ok(builtCssSource.includes('.wave89g-main-footer'), 'built css should contain the wave89g footer styles');

for (let grade = 1; grade <= 11; grade += 1) {
  const page = `grade${grade}_v2.html`;
  const html = read(page);
  assert.ok(html.includes(`./${runtimeBuilt}`), `${page} should reference the rebuilt merged runtime`);
  assert.ok(html.includes(`./${cssBuilt}`), `${page} should reference the rebuilt shared css asset`);
  const scriptCount = (html.match(/<script\b[^>]*\bsrc=/g) || []).length;
  assert.ok(scriptCount <= 20, `${page} should stay within the 20-script budget (got ${scriptCount})`);
}

for (const page of ['index.html','dashboard.html','diagnostic.html','tests.html','spec_subjects.html']) {
  const html = read(page);
  assert.ok(!html.includes(`./${runtimeBuilt}`), `${page} should not load the merged grade runtime`);
}

assert.ok(changelog.includes('## wave89g'), 'CHANGELOG should document wave89g');
assert.ok(docs.includes('2 visible quick actions'), 'wave89g doc should describe the two-button footer');
assert.ok(validateWorkflow.includes('node tools/audit_minimal_footer_wave89g.mjs'), 'validate workflow should run the wave89g footer audit');
assert.ok(lighthouseWorkflow.includes('node tools/audit_minimal_footer_wave89g.mjs'), 'lighthouse workflow should run the wave89g footer audit');
assert.ok(toolsReadme.includes('audit_minimal_footer_wave89g.mjs'), 'tools README should list the wave89g footer audit');
assert.ok(claude.includes('### wave89g minimal footer'), 'CLAUDE.md should document the wave89g footer wave');

const marker = '/* wave89g: minimal main footer / utility condensation */';
const start = srcRuntime.indexOf(marker);
assert.ok(start >= 0, 'could not locate the wave89g runtime marker');
const isolatedRuntime = srcRuntime.slice(start);

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
    setFromString(value){
      set.clear();
      String(value || '').split(/\s+/).forEach((part) => { if (part) set.add(part); });
    }
  };
}

function parseSelector(selector){
  const raw = String(selector || '').trim();
  const attr = raw.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
  if (attr) return { type:'attr', name:attr[1], value: attr[2] ?? null };
  if (raw.startsWith('#')) return { type:'id', value: raw.slice(1) };
  if (raw.startsWith('.')) return { type:'class', value: raw.slice(1) };
  return { type:'tag', value: raw.toUpperCase() };
}

function matches(node, selector){
  const parsed = parseSelector(selector);
  if (!node || node.nodeType !== 1) return false;
  if (parsed.type === 'id') return node.id === parsed.value;
  if (parsed.type === 'class') return node.classList.contains(parsed.value);
  if (parsed.type === 'tag') return node.tagName === parsed.value;
  if (parsed.type === 'attr') {
    if (!node.hasAttribute(parsed.name)) return false;
    if (parsed.value == null) return true;
    return node.getAttribute(parsed.name) === parsed.value;
  }
  return false;
}

function queryWithin(rootNode, selector, firstOnly){
  const sels = String(selector || '').split(',').map((s) => s.trim()).filter(Boolean);
  const out = [];
  function walk(node){
    if (!node || !node.children) return false;
    for (const child of node.children) {
      for (const sel of sels) {
        if (matches(child, sel)) {
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

function createNode(tagName, doc){
  const attrs = new Map();
  const listeners = new Map();
  const node = {
    nodeType: 1,
    tagName: String(tagName || 'div').toUpperCase(),
    ownerDocument: doc,
    parentNode: null,
    parentElement: null,
    children: [],
    style: {},
    hidden: false,
    textContent: '',
    classList: createClassList(),
    appendChild(child){
      if (!child) return child;
      child.parentNode = node;
      child.parentElement = node;
      node.children.push(child);
      return child;
    },
    insertBefore(child, ref){
      if (!child) return child;
      child.parentNode = node;
      child.parentElement = node;
      const idx = node.children.indexOf(ref);
      if (idx >= 0) node.children.splice(idx, 0, child);
      else node.children.push(child);
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
    click(){
      const event = { type:'click', target:node, preventDefault(){}, stopPropagation(){} };
      node.dispatchEvent(event);
    },
    setAttribute(name, value){ attrs.set(String(name), String(value)); },
    getAttribute(name){ return attrs.has(String(name)) ? attrs.get(String(name)) : null; },
    hasAttribute(name){ return attrs.has(String(name)); },
    removeAttribute(name){ attrs.delete(String(name)); },
    querySelector(selector){ return queryWithin(node, selector, true); },
    querySelectorAll(selector){ return queryWithin(node, selector, false); },
    focus(){}
  };
  Object.defineProperty(node, 'id', {
    get(){ return attrs.get('id') || ''; },
    set(value){ attrs.set('id', String(value)); }
  });
  Object.defineProperty(node, 'className', {
    get(){ return node.classList.toString(); },
    set(value){ node.classList.setFromString(value); }
  });
  Object.defineProperty(node, 'nextSibling', {
    get(){
      if (!node.parentElement) return null;
      const siblings = node.parentElement.children || [];
      const idx = siblings.indexOf(node);
      return idx >= 0 && idx + 1 < siblings.length ? siblings[idx + 1] : null;
    }
  });
  return node;
}

function buildVm(){
  const calls = [];
  const documentElement = createNode('html', null);
  const body = createNode('body', null);
  documentElement.appendChild(body);

  const document = {
    readyState: 'complete',
    documentElement,
    body,
    createElement(tag){ return createNode(tag, document); },
    getElementById(id){ return queryWithin(documentElement, `#${id}`, true); },
    querySelector(selector){ return queryWithin(documentElement, selector, true); },
    querySelectorAll(selector){ return queryWithin(documentElement, selector, false); },
    addEventListener(){},
    removeEventListener(){}
  };
  documentElement.ownerDocument = document;
  body.ownerDocument = document;

  const main = createNode('div', document);
  main.id = 's-main';
  body.appendChild(main);
  const wrap = createNode('div', document);
  wrap.className = 'w';
  main.appendChild(wrap);
  const daily = createNode('div', document);
  daily.id = 'daily-meter';
  wrap.appendChild(daily);

  function addRow(actions){
    const row = createNode('div', document);
    wrap.appendChild(row);
    actions.forEach((action) => {
      const btn = createNode('button', document);
      btn.setAttribute('data-wave87r-action', action);
      btn.textContent = action;
      row.appendChild(btn);
    });
    return row;
  }

  addRow(['go-info', 'show-journal', 'show-badges']);
  addRow(['show-class-select']);
  addRow(['go-prog', 'show-about']);
  addRow(['show-date-editor']);

  const context = {
    window: null,
    document,
    console,
    MutationObserver: function(){ this.observe = function(){}; this.disconnect = function(){}; },
    setTimeout(fn){ if (typeof fn === 'function') fn(); return 1; },
    clearTimeout(){},
    requestAnimationFrame(fn){ if (typeof fn === 'function') fn(); return 1; },
    alert(msg){ calls.push(['alert', msg]); },
    go(screen){ calls.push(['go', screen]); },
    showAbout(){ calls.push(['showAbout']); }
  };
  context.window = context;
  context.self = context;
  context.globalThis = context;
  context.document.body = body;
  context.document.documentElement = documentElement;
  return { context, calls, document, wrap, daily };
}

const { context, calls, document, wrap, daily } = buildVm();
vm.createContext(context);
vm.runInContext(isolatedRuntime, context, { filename: 'wave89g_runtime.js' });

const api = context.window.__wave89gMinimalFooter;
assert.ok(api, 'wave89g runtime should expose the footer API');
assert.equal(api.version, 'wave89g', 'wave89g API should expose the correct version');
assert.deepEqual(Array.from(api.visibleButtons()), ['go-prog', 'show-about'], 'footer should expose exactly the two expected quick actions');
assert.equal(api.hiddenLegacyRows(), 4, 'all four legacy footer rows should be hidden');

const footer = document.getElementById(api.footerId);
assert.ok(footer, 'wave89g runtime should insert the compact footer');
assert.equal(wrap.children[1], footer, 'compact footer should be inserted right after daily-meter');
const footerButtons = footer.querySelectorAll('[data-wave89g-action]');
assert.equal(footerButtons.length, 2, 'compact footer should render exactly two buttons');
assert.ok((document.getElementById('wave89g-main-footer-hint') || {}).textContent.includes('☰'), 'footer hint should mention the hamburger menu');
footerButtons[0].click();
footerButtons[1].click();
assert.deepEqual(calls, [['go', 'prog'], ['showAbout']], 'footer buttons should route to progress and settings');

console.log(JSON.stringify({
  ok: true,
  wave: healthz.wave,
  runtime: runtimeBuilt,
  css: cssBuilt,
  hiddenLegacyRows: api.hiddenLegacyRows(),
  footerButtons: api.visibleButtons(),
  hashedAssetCount: healthz.hashed_asset_count
}, null, 2));
