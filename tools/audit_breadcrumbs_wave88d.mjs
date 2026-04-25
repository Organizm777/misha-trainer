#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);

function read(rel){
  return fs.readFileSync(path.join(repoRoot, rel), 'utf8');
}
function readJSON(rel){
  return JSON.parse(read(rel));
}
function exists(rel){
  return fs.existsSync(path.join(repoRoot, rel));
}
function walk(node, visitor){
  if (!node || node.nodeType !== 1) return;
  visitor(node);
  for (const child of (node.children || [])) walk(child, visitor);
}
function labels(items){
  return Array.from(items || [], (item) => String(item && item.label || ''));
}

class MockClassList {
  constructor(owner, seed = []) {
    this.owner = owner;
    this.set = new Set(seed.filter(Boolean).map((name) => String(name)));
    this.sync();
  }
  sync(){ this.owner._className = Array.from(this.set).join(' '); }
  add(...names){ names.forEach((name) => this.set.add(String(name))); this.sync(); }
  remove(...names){ names.forEach((name) => this.set.delete(String(name))); this.sync(); }
  contains(name){ return this.set.has(String(name)); }
}

class MockElement {
  constructor(tagName, opts = {}) {
    this.nodeType = 1;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.id = opts.id || '';
    this._className = '';
    this.attributes = new Map();
    this.children = [];
    this.parentNode = null;
    this.hidden = false;
    this.textContent = opts.textContent || '';
    this.classList = new MockClassList(this, []);
    this.className = opts.className || '';
  }
  appendChild(child){
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  insertBefore(child, ref){
    child.parentNode = this;
    if (!ref) {
      this.children.push(child);
      return child;
    }
    const idx = this.children.indexOf(ref);
    if (idx === -1) this.children.push(child);
    else this.children.splice(idx, 0, child);
    return child;
  }
  removeChild(child){
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }
  get firstChild(){ return this.children[0] || null; }
  setAttribute(name, value){
    const key = String(name);
    const next = String(value);
    if (key === 'id') this.id = next;
    else if (key === 'class') this.className = next;
    else this.attributes.set(key, next);
  }
  getAttribute(name){
    const key = String(name);
    if (key === 'id') return this.id || null;
    if (key === 'class') return this.className || null;
    return this.attributes.has(key) ? this.attributes.get(key) : null;
  }
  hasAttribute(name){
    const key = String(name);
    if (key === 'id') return !!this.id;
    if (key === 'class') return !!this.className;
    return this.attributes.has(key);
  }
}

Object.defineProperty(MockElement.prototype, 'className', {
  get(){ return this._className || ''; },
  set(value){
    const next = String(value || '');
    this._className = next;
    if (this.classList) this.classList.set = new Set(next.split(/\s+/).filter(Boolean));
  }
});

class MockDocument {
  constructor() {
    this.readyState = 'complete';
    this.body = new MockElement('body', { id:'body' });
    this.documentElement = this.body;
    this.listeners = { click: [], DOMContentLoaded: [] };
  }
  createElement(tagName){ return new MockElement(tagName); }
  addEventListener(type, handler){
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(handler);
  }
  getElementById(id){
    let found = null;
    walk(this.body, (node) => { if (!found && node.id === id) found = node; });
    return found;
  }
  dispatchClick(target){
    const event = {
      target,
      defaultPrevented: false,
      propagationStopped: false,
      preventDefault(){ this.defaultPrevented = true; },
      stopPropagation(){ this.propagationStopped = true; }
    };
    for (const handler of (this.listeners.click || [])) handler(event);
    return event;
  }
}

function mk(tagName, opts){ return new MockElement(tagName, opts); }
function setActiveScreen(document, activeId){
  ['s-main','s-subj','s-theory','s-play','s-result','s-prog','s-info'].forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    if (id === activeId) node.classList.add('on');
    else node.classList.remove('on');
  });
}
function buildFixture(){
  const document = new MockDocument();
  const hosts = {};
  for (const [id, on] of [['s-main', true], ['s-subj', false], ['s-theory', false], ['s-play', false], ['s-result', false], ['s-prog', false], ['s-info', false]]) {
    const screen = mk('div', { id, className: on ? 'scr on' : 'scr' });
    const host = mk('div', { className:'w' });
    host.appendChild(mk('div', { className:'screen-marker', textContent:id }));
    screen.appendChild(host);
    document.body.appendChild(screen);
    hosts[id] = host;
  }
  return { document, hosts };
}

const manifest = readJSON('assets/asset-manifest.json');
const healthz = readJSON('healthz.json');
const jsLogical = 'assets/js/bundle_grade_runtime_breadcrumbs_wave88d.js';
const cssLogical = 'assets/css/wave88d_breadcrumbs.css';
const builtJs = manifest.assets[jsLogical];
const builtCss = manifest.assets[cssLogical];
assert(builtJs, `asset-manifest: missing ${jsLogical}`);
assert(builtCss, `asset-manifest: missing ${cssLogical}`);
assert(exists(builtJs), `built runtime missing: ${builtJs}`);
assert(exists(builtCss), `built css missing: ${builtCss}`);
assert(healthz.wave === 'wave88d', `healthz.wave should be wave88d, got ${healthz.wave}`);
assert(String(healthz.cache || '').includes('wave88d'), `healthz.cache should reference wave88d, got ${healthz.cache}`);

for (let grade = 1; grade <= 11; grade += 1) {
  const html = read(`grade${grade}_v2.html`);
  assert(html.includes(`./${builtJs}`), `grade${grade}_v2.html: missing ${builtJs}`);
  assert(html.includes(`./${builtCss}`), `grade${grade}_v2.html: missing ${builtCss}`);
}
for (const page of ['index.html','dashboard.html','diagnostic.html','tests.html','spec_subjects.html']) {
  const html = read(page);
  assert(!html.includes(`./${builtJs}`), `${page}: should not include ${builtJs}`);
  assert(!html.includes(`./${builtCss}`), `${page}: should not include ${builtCss}`);
}

const sw = read('sw.js');
assert(sw.includes(`./${builtJs}`), 'sw.js: missing breadcrumb runtime precache asset');
assert(sw.includes(`./${builtCss}`), 'sw.js: missing breadcrumb css precache asset');
assert(sw.includes('trainer-build-wave88d-2026-04-25'), 'sw.js: cache name should be bumped to wave88d');

const srcJs = read('assets/_src/js/bundle_grade_runtime_breadcrumbs_wave88d.js');
const srcCss = read('assets/_src/css/wave88d_breadcrumbs.css');
assert(srcJs.includes("version: 'wave88d'") || srcJs.includes("version:'wave88d'"), 'runtime source: missing wave88d version tag');
assert(srcJs.includes('Выйти из текущей сессии? Результат будет сохранён.'), 'runtime source: missing play-exit confirmation');
assert(srcCss.includes('.wave88d-breadcrumbs'), 'css source: missing .wave88d-breadcrumbs rules');

const fixture = buildFixture();
const document = fixture.document;
const counters = { go: [], openSubj: [], goSubj: 0, endSession: 0, assigned: [] };
const window = {
  document,
  console,
  GRADE_TITLE: '📘 8 класс',
  GRADE_NUM: '8',
  cS: { id:'alg', nm:'Алгебра' },
  cT: { id:'quad', nm:'Квадратные уравнения' },
  mix: false,
  globalMix: false,
  rushMode: false,
  diagMode: false,
  mixFilter: null,
  confirmValue: true,
  confirm(message){ counters.lastConfirm = message; return this.confirmValue; },
  location: {
    href: 'https://example.test/grade8_v2.html',
    assign(url){ counters.assigned.push(url); this.href = url; }
  },
  clearTimeout(){},
  setTimeout(fn){ if (typeof fn === 'function') fn(); return 1; },
  go(screen){ counters.go.push(screen); setActiveScreen(document, `s-${screen}`); },
  openSubj(subjectId){ counters.openSubj.push(subjectId); setActiveScreen(document, 's-subj'); },
  goSubj(){ counters.goSubj += 1; setActiveScreen(document, 's-subj'); },
  startQuiz(){ setActiveScreen(document, 's-play'); },
  startDiag(){ this.diagMode = true; setActiveScreen(document, 's-play'); },
  startGlobalMix(){ this.globalMix = true; this.mix = true; setActiveScreen(document, 's-play'); },
  startRush(){ this.rushMode = true; setActiveScreen(document, 's-play'); },
  endSession(){ counters.endSession += 1; setActiveScreen(document, 's-result'); },
  wave21OpenTopic(){ setActiveScreen(document, 's-theory'); }
};
window.window = window;
window.self = window;
window.globalThis = window;
class MutationObserver {
  constructor(callback){ this.callback = callback; }
  observe(){}
  disconnect(){}
}
const context = vm.createContext({
  window,
  document,
  MutationObserver,
  console,
  setTimeout: window.setTimeout,
  clearTimeout: window.clearTimeout,
  location: window.location,
  confirm: window.confirm.bind(window)
});
vm.runInContext(srcJs, context, { filename:'bundle_grade_runtime_breadcrumbs_wave88d.js', timeout:1000 });
const api = context.window.__wave88dBreadcrumbs;
assert(api && api.version === 'wave88d', 'runtime export missing or wrong version');
assert(api.active === true, 'runtime export should stay active');
assert(api.gradeLabel() === '8 класс', `gradeLabel() should normalize emoji prefix, got ${api.gradeLabel()}`);

api.renderAll();
for (const screenId of ['s-main','s-subj','s-theory','s-play','s-result','s-prog','s-info']) {
  const host = fixture.hosts[screenId];
  const nav = host.firstChild;
  assert(nav && nav.classList.contains('wave88d-breadcrumbs'), `${screenId}: missing injected breadcrumb nav`);
  assert(nav.getAttribute('aria-label') === 'Навигация', `${screenId}: wrong aria-label`);
}

assert.deepEqual(labels(api.buildItems('s-main')), ['Главная', '8 класс'], 's-main trail mismatch');
assert.deepEqual(labels(api.buildItems('s-subj')), ['Главная', '8 класс', 'Алгебра'], 's-subj trail mismatch');
assert.deepEqual(labels(api.buildItems('s-theory')), ['Главная', '8 класс', 'Алгебра', 'Квадратные уравнения'], 's-theory trail mismatch');
assert.deepEqual(labels(api.buildItems('s-play')), ['Главная', '8 класс', 'Алгебра', 'Квадратные уравнения'], 's-play normal trail mismatch');
assert.deepEqual(labels(api.buildItems('s-result')), ['Главная', '8 класс', 'Алгебра', 'Квадратные уравнения'], 's-result normal trail mismatch');
assert.deepEqual(labels(api.buildItems('s-prog')), ['Главная', '8 класс', 'Прогресс'], 's-prog trail mismatch');
assert.deepEqual(labels(api.buildItems('s-info')), ['Главная', '8 класс', 'Справка'], 's-info trail mismatch');

context.window.diagMode = true;
assert.deepEqual(labels(api.buildItems('s-play')), ['Главная', '8 класс', 'Алгебра', 'Диагностика'], 'diagnostic trail mismatch');
context.window.diagMode = false;

context.window.cT = null;
context.window.mix = true;
assert.deepEqual(labels(api.buildItems('s-play')), ['Главная', '8 класс', 'Алгебра', 'Всё вперемешку'], 'subject mix trail mismatch');

context.window.cS = null;
context.window.globalMix = true;
context.window.mixFilter = ['alg', 'geo'];
assert.deepEqual(labels(api.buildItems('s-play')), ['Главная', '8 класс', 'Сборная'], 'global filtered mix trail mismatch');
context.window.mixFilter = null;
assert.deepEqual(labels(api.buildItems('s-play')), ['Главная', '8 класс', 'Всё вперемешку'], 'global mix trail mismatch');

context.window.globalMix = false;
context.window.mix = false;
context.window.rushMode = true;
assert.deepEqual(labels(api.buildItems('s-play')), ['Главная', '8 класс', 'Молния'], 'rush trail mismatch');
context.window.rushMode = false;
context.window.cS = { id:'alg', nm:'Алгебра' };
context.window.cT = { id:'quad', nm:'Квадратные уравнения' };

setActiveScreen(document, 's-play');
context.window.confirmValue = false;
assert(api.navigate('main') === false, 'navigate(main) should abort when confirm=false');
assert(counters.endSession === 0, 'endSession should not run when confirm=false');
context.window.confirmValue = true;
assert(api.navigate('main') === true, 'navigate(main) should succeed when confirm=true');
assert(counters.endSession === 1, 'endSession should run once when leaving play');
assert(counters.go.at(-1) === 'main', 'go(main) should run after leaving play');
assert(counters.lastConfirm === 'Выйти из текущей сессии? Результат будет сохранён.', 'unexpected confirm prompt');

setActiveScreen(document, 's-subj');
assert(api.navigate('subj') === true, 'navigate(subj) should succeed');
assert(counters.openSubj.at(-1) === 'alg', 'navigate(subj) should reopen the current subject');
assert(api.navigate('home') === true, 'navigate(home) should succeed');
assert(counters.assigned.at(-1) === 'index.html?choose', 'navigate(home) should assign index.html?choose');

const summary = {
  ok: true,
  wave: healthz.wave,
  cache: healthz.cache,
  breadcrumbRuntime: builtJs,
  breadcrumbCss: builtCss,
  hashedAssetCount: manifest.hashed_asset_count,
  verifiedPages: 11
};
console.log(JSON.stringify(summary, null, 2));
