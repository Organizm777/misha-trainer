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
function walk(node, visitor){
  if (!node || node.nodeType !== 1) return;
  visitor(node);
  (node.children || []).forEach((child) => walk(child, visitor));
}
class MockClassList {
  constructor(owner, seed = []) {
    this.owner = owner;
    this.set = new Set(seed.filter(Boolean));
  }
  add(...names) { names.forEach((name) => this.set.add(String(name))); this.owner.className = Array.from(this.set).join(' '); }
  remove(...names) { names.forEach((name) => this.set.delete(String(name))); this.owner.className = Array.from(this.set).join(' '); }
  contains(name) { return this.set.has(String(name)); }
}
class MockElement {
  constructor(tagName, opts = {}) {
    this.nodeType = 1;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.id = opts.id || '';
    this.className = opts.className || '';
    this.classList = new MockClassList(this, this.className.split(/\s+/).filter(Boolean));
    this.attributes = new Map();
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.hidden = false;
    this.disabled = false;
    this.isContentEditable = false;
    this.clickCount = 0;
    this.textContent = opts.textContent || '';
  }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  setAttribute(name, value) {
    if (name === 'id') this.id = String(value);
    else if (name === 'class') {
      this.className = String(value);
      this.classList = new MockClassList(this, this.className.split(/\s+/).filter(Boolean));
    } else this.attributes.set(String(name), String(value));
  }
  getAttribute(name) {
    if (name === 'id') return this.id || null;
    if (name === 'class') return this.className || null;
    return this.attributes.has(String(name)) ? this.attributes.get(String(name)) : null;
  }
  hasAttribute(name) {
    if (name === 'id') return !!this.id;
    if (name === 'class') return !!this.className;
    return this.attributes.has(String(name));
  }
  removeAttribute(name) {
    if (name === 'id') this.id = '';
    else if (name === 'class') {
      this.className = '';
      this.classList = new MockClassList(this, []);
    } else this.attributes.delete(String(name));
  }
  click() { this.clickCount += 1; }
}
class MockDocument {
  constructor() {
    this.body = new MockElement('body', { id:'body' });
    this.documentElement = this.body;
    this.listeners = { keydown: [] };
  }
  getElementById(id) {
    let found = null;
    walk(this.body, (node) => {
      if (!found && node.id === id) found = node;
    });
    return found;
  }
  addEventListener(type, handler) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(handler);
  }
  dispatchKey(key, target) {
    const event = {
      key,
      target: target || this.body,
      defaultPrevented: false,
      propagationStopped: false,
      preventDefault() { this.defaultPrevented = true; },
      stopPropagation() { this.propagationStopped = true; }
    };
    (this.listeners.keydown || []).forEach((handler) => handler(event));
    return event;
  }
}

function mk(tag, opts) {
  return new MockElement(tag, opts);
}
function setActiveScreen(doc, id) {
  ['s-main','s-subj','s-theory','s-play','s-result','s-prog','s-info'].forEach((screenId) => {
    const node = doc.getElementById(screenId);
    if (!node) return;
    if (screenId === id) node.classList.add('on');
    else node.classList.remove('on');
  });
}
function buildFixture() {
  const document = new MockDocument();
  const body = document.body;

  const screens = {
    main: mk('div', { id:'s-main', className:'scr on' }),
    subj: mk('div', { id:'s-subj', className:'scr' }),
    theory: mk('div', { id:'s-theory', className:'scr' }),
    play: mk('div', { id:'s-play', className:'scr' }),
    result: mk('div', { id:'s-result', className:'scr' }),
    prog: mk('div', { id:'s-prog', className:'scr' }),
    info: mk('div', { id:'s-info', className:'scr' })
  };
  Object.values(screens).forEach((node) => body.appendChild(node));

  const sg = mk('div', { id:'sg' });
  screens.main.appendChild(sg);
  for (let i = 0; i < 10; i += 1) sg.appendChild(mk('button', { className:'scard' }));

  const tl = mk('div', { id:'tl' });
  screens.subj.appendChild(tl);
  for (let i = 0; i < 10; i += 1) tl.appendChild(mk('button', { className:'tbtn' }));

  const theoryBack = mk('button', { className:'qback' });
  theoryBack.setAttribute('data-wave87r-action', 'go-subj');
  screens.theory.appendChild(theoryBack);
  const startQuiz = mk('button', { className:'btn btn-p' });
  startQuiz.setAttribute('data-wave87r-action', 'start-normal-quiz');
  screens.theory.appendChild(startQuiz);

  const endSession = mk('button', { className:'qback' });
  endSession.setAttribute('data-wave87r-action', 'end-session');
  screens.play.appendChild(endSession);
  const opts = mk('div', { id:'opts' });
  screens.play.appendChild(opts);
  const playPrimary = mk('button', { className:'btn btn-p' });
  opts.appendChild(playPrimary);
  const fba = mk('div', { id:'fba' });
  screens.play.appendChild(fba);
  const nextBtn = mk('button', { className:'btn btn-p' });
  fba.appendChild(nextBtn);

  const backAfterResult = mk('button', { className:'btn btn-d' });
  backAfterResult.setAttribute('data-wave87r-action', 'back-after-result');
  screens.result.appendChild(backAfterResult);

  const goMainFromSubj = mk('button', { className:'btn btn-o' });
  goMainFromSubj.setAttribute('data-wave87r-action', 'go-main');
  screens.subj.appendChild(goMainFromSubj);

  const goMainFromProg = mk('button', { className:'btn btn-d' });
  goMainFromProg.setAttribute('data-wave87r-action', 'go-main');
  screens.prog.appendChild(goMainFromProg);

  const goMainFromInfo = mk('button', { className:'btn btn-d' });
  goMainFromInfo.setAttribute('data-wave87r-action', 'go-main');
  screens.info.appendChild(goMainFromInfo);

  return {
    document,
    sg,
    tl,
    startQuiz,
    playPrimary,
    nextBtn,
    endSession,
    backAfterResult,
    goMainFromSubj,
    goMainFromProg,
    goMainFromInfo,
    theoryBack,
    screens
  };
}

const manifest = readJSON('assets/asset-manifest.json');
const builtRel = manifest.assets['assets/js/bundle_grade_runtime_keyboard_wave88c.js'];
assert(builtRel, 'asset-manifest: missing logical runtime entry');
assert(fs.existsSync(path.join(repoRoot, builtRel)), `built runtime missing: ${builtRel}`);

for (let grade = 1; grade <= 11; grade += 1) {
  const html = read(`grade${grade}_v2.html`);
  assert(html.includes(`./${builtRel}`), `grade${grade}_v2.html: missing keyboard runtime`);
}
['index.html','dashboard.html','diagnostic.html','tests.html','spec_subjects.html'].forEach((page) => {
  const html = read(page);
  assert(!html.includes(`./${builtRel}`), `${page}: should not include keyboard runtime`);
});

const sw = read('sw.js');
assert(sw.includes(`./${builtRel}`), 'sw.js: missing keyboard runtime precache asset');

const src = read('assets/_src/js/bundle_grade_runtime_keyboard_wave88c.js');
assert(src.includes("version: 'wave88c'") || src.includes("version:'wave88c'"), 'runtime source: missing wave88c version tag');

const fixture = buildFixture();
const document = fixture.document;
const window = {
  document,
  prob: null,
  sel: null,
  clearTimeout() {},
  setTimeout(fn) { fn(); return 1; }
};
class MutationObserver {
  constructor(callback) { this.callback = callback; }
  observe() {}
  disconnect() {}
}
const context = vm.createContext({
  window,
  document,
  MutationObserver,
  console,
  setTimeout: window.setTimeout,
  clearTimeout: window.clearTimeout
});
vm.runInContext(src, context, { filename:'bundle_grade_runtime_keyboard_wave88c.js' });
const runtimeApi = context.window.__wave88cKeyboardShortcuts;
assert(runtimeApi && runtimeApi.version === 'wave88c', 'runtime export missing or wrong version');

const secondSubject = fixture.sg.children[1];
const tenthTopic = fixture.tl.children[9];
assert(secondSubject.getAttribute('aria-keyshortcuts') === '2', 'second subject: missing aria-keyshortcuts=2');
assert(tenthTopic.getAttribute('aria-keyshortcuts') === '0', 'tenth topic: missing aria-keyshortcuts=0');
assert(fixture.startQuiz.getAttribute('aria-keyshortcuts') === 'Enter', 'start button: missing Enter aria-keyshortcuts');

setActiveScreen(document, 's-main');
document.dispatchKey('2');
setActiveScreen(document, 's-subj');
document.dispatchKey('0');
setActiveScreen(document, 's-theory');
document.dispatchKey('Enter');

setActiveScreen(document, 's-play');
context.window.sel = 1;
document.dispatchKey('Enter');
context.window.sel = null;
context.window.prob = { interactionType:'sequence' };
document.dispatchKey('Enter');
context.window.prob = null;
document.dispatchKey('Escape');

setActiveScreen(document, 's-result');
document.dispatchKey('Enter');
document.dispatchKey('Escape');

setActiveScreen(document, 's-prog');
document.dispatchKey('Escape');

const input = mk('input', { id:'editable-test' });
fixture.screens.main.appendChild(input);
setActiveScreen(document, 's-main');
document.dispatchKey('1', input);

const dialog = mk('div', { className:'dialog' });
dialog.setAttribute('role', 'dialog');
dialog.setAttribute('aria-modal', 'true');
fixture.screens.main.appendChild(dialog);
document.dispatchKey('3');
fixture.screens.main.children.pop();

const healthz = readJSON('healthz.json');
assert(healthz.wave === 'wave88c', `healthz.json: expected wave88c, got ${healthz.wave}`);
assert(healthz.build_id === 'wave88c', `healthz.json: expected build_id wave88c, got ${healthz.build_id}`);

const docRel = 'docs/KEYBOARD_SHORTCUTS_wave88c.md';
assert(fs.existsSync(path.join(repoRoot, docRel)), `${docRel}: missing`);

console.log(JSON.stringify({
  built: builtRel,
  healthzWave: healthz.wave,
  testedScreens: ['main', 'subj', 'theory', 'play', 'result', 'prog'],
  clickCounts: {
    secondSubject: secondSubject.clickCount,
    tenthTopic: tenthTopic.clickCount,
    startQuiz: fixture.startQuiz.clickCount,
    nextAfterAnswer: fixture.nextBtn.clickCount,
    playPrimary: fixture.playPrimary.clickCount,
    endSession: fixture.endSession.clickCount,
    backAfterResult: fixture.backAfterResult.clickCount,
    goMain: fixture.goMainFromSubj.clickCount + fixture.goMainFromProg.clickCount + fixture.goMainFromInfo.clickCount
  },
  hashedAssetCount: healthz.hashed_asset_count
}, null, 2));
