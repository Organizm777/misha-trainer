#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = process.cwd();
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function assert(condition, message){ if (!condition) throw new Error(message); }

function makeNode(tag, ids){
  const node = {
    tagName: String(tag || 'div').toUpperCase(),
    style: {},
    dataset: {},
    children: [],
    attributes: {},
    className: '',
    type: '',
    href: '',
    disabled: false,
    parentNode: null,
    _textContent: '',
    _innerHTML: '',
    appendChild(child){
      if (child && typeof child === 'object') child.parentNode = this;
      this.children.push(child);
      return child;
    },
    insertBefore(child, ref){
      if (child && typeof child === 'object') child.parentNode = this;
      const idx = this.children.indexOf(ref);
      if (idx === -1) this.children.push(child);
      else this.children.splice(idx, 0, child);
      if (child && child.id) ids[child.id] = child;
      return child;
    },
    setAttribute(name, value){ this.attributes[name] = String(value); },
    getAttribute(name){ return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null; },
    addEventListener(){},
    removeEventListener(){},
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    remove(){
      if (!this.parentNode || !Array.isArray(this.parentNode.children)) return;
      const idx = this.parentNode.children.indexOf(this);
      if (idx !== -1) this.parentNode.children.splice(idx, 1);
      if (this.id && ids[this.id] === this) delete ids[this.id];
      this.parentNode = null;
    }
  };
  Object.defineProperty(node, 'textContent', {
    get(){ return this._textContent || ''; },
    set(value){ this._textContent = String(value); }
  });
  Object.defineProperty(node, 'innerHTML', {
    get(){ return this._innerHTML || ''; },
    set(value){ this._innerHTML = String(value); }
  });
  Object.defineProperty(node, 'id', {
    get(){ return this._id || ''; },
    set(value){
      const next = String(value || '');
      if (this._id && ids[this._id] === this) delete ids[this._id];
      this._id = next;
      if (next) ids[next] = this;
    }
  });
  return node;
}

function makeContext(){
  const ids = Object.create(null);
  const parent = makeNode('main', ids);
  const anchor = makeNode('p', ids);
  anchor.className = 'section-label';
  anchor.textContent = 'Выбери класс';
  parent.appendChild(anchor);

  const body = makeNode('body', ids);
  body.appendChild(parent);
  const head = makeNode('head', ids);
  const document = {
    readyState: 'complete',
    head,
    body,
    documentElement: makeNode('html', ids),
    currentScript: null,
    createElement(tag){ return makeNode(tag, ids); },
    createTextNode(text){ return { nodeType:3, textContent:String(text) }; },
    addEventListener(){},
    removeEventListener(){},
    querySelector(selector){
      if (selector === '.section-label') return anchor;
      if (selector === '.grid' || selector === '.header') return anchor;
      return null;
    },
    querySelectorAll(){ return []; },
    getElementById(id){ return ids[id] || null; }
  };
  const store = Object.create(null);
  const ctx = {
    console: { log(){}, warn(){}, error(){}, info(){} },
    Math, Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError,
    Intl,
    setTimeout(fn){ if (typeof fn === 'function') fn(); return 0; },
    clearTimeout(){},
    Promise,
    document,
    localStorage: {
      getItem(key){ return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
      setItem(key, value){ store[key] = String(value); },
      removeItem(key){ delete store[key]; }
    },
    location: { href:'https://example.test/index.html', pathname:'/index.html', origin:'https://example.test' },
    navigator: {},
    history: { pushState(){}, replaceState(){} }
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.globalThis = ctx;
  return { ctx:vm.createContext(ctx), document, anchor, parent };
}

const manifest = JSON.parse(read('assets/asset-manifest.json'));
const jsLogical = 'assets/js/chunk_roadmap_wave88a_daily_question.js';
const cssLogical = 'assets/css/wave88a_daily_question.css';
const jsBuilt = manifest.assets && manifest.assets[jsLogical];
const cssBuilt = manifest.assets && manifest.assets[cssLogical];
assert(jsBuilt, `asset-manifest.json: missing ${jsLogical}`);
assert(cssBuilt, `asset-manifest.json: missing ${cssLogical}`);
assert(exists(jsBuilt), `missing built asset ${jsBuilt}`);
assert(exists(cssBuilt), `missing built asset ${cssBuilt}`);

const jsSrc = read('assets/_src/js/chunk_roadmap_wave88a_daily_question.js');
const cssSrc = read('assets/_src/css/wave88a_daily_question.css');
assert(jsSrc.includes('window.__wave88aDailyQuestion'), 'source JS: missing wave88a guard export');
assert(jsSrc.includes('STORAGE_PREFIX') && jsSrc.includes('pickForDate') && jsSrc.includes('SECTION_ID'), 'source JS: missing key daily-question helpers');
assert((jsSrc.match(/id:'w88a_/g) || []).length >= 16, 'source JS: expected at least 16 curated daily questions');
assert(cssSrc.includes('.w88a-daily') && cssSrc.includes('.w88a-daily__grid') && cssSrc.includes('.w88a-daily__status'), 'source CSS: missing daily question selectors');

const pageChecks = [];
const indexHtml = read('index.html');
assert(indexHtml.includes('./' + jsBuilt), `index.html: missing ${jsBuilt}`);
assert(indexHtml.includes('./' + cssBuilt), `index.html: missing ${cssBuilt}`);
pageChecks.push({ page:'index.html', hasJs:true, hasCss:true });
for (let grade = 1; grade <= 11; grade++) {
  const htmlFile = `grade${grade}_v2.html`;
  const html = read(htmlFile);
  const hasJs = html.includes('./' + jsBuilt);
  const hasCss = html.includes('./' + cssBuilt);
  assert(!hasJs, `${htmlFile}: unexpected ${jsBuilt}`);
  assert(!hasCss, `${htmlFile}: unexpected ${cssBuilt}`);
  pageChecks.push({ page:htmlFile, hasJs, hasCss });
}
assert(read('sw.js').includes(`'./${jsBuilt}'`), `sw.js: missing ${jsBuilt}`);
assert(read('sw.js').includes(`'./${cssBuilt}'`), `sw.js: missing ${cssBuilt}`);

const sandbox = makeContext();
vm.runInContext(jsSrc, sandbox.ctx, { filename:'chunk_roadmap_wave88a_daily_question.js', timeout:1000 });
const api = sandbox.ctx.window.__wave88aDailyQuestion;
assert(api && api.version === 'wave88a', 'runtime export missing or wrong version');
assert(api.poolSize >= 16, `expected poolSize >= 16, got ${api && api.poolSize}`);
assert(typeof api.currentId === 'string' && api.currentId, 'currentId should be non-empty');
assert(api.storageKey('2026-04-25') === 'trainer_wave88a_daily_question_2026-04-25', 'storageKey should preserve the wave88a prefix');
const pickA = api.pickForDate('2026-04-25');
const pickB = api.pickForDate('2026-04-25');
assert(pickA && pickB && pickA.id === pickB.id, 'pickForDate should be deterministic for the same date');
const section = sandbox.document.getElementById('wave88a-daily-question');
assert(section && section.parentNode === sandbox.parent, 'render should insert the daily-question section before the first anchor');
assert(section.children.length >= 5, `rendered section should have multiple child blocks, got ${section.children.length}`);

const healthz = JSON.parse(read('healthz.json'));
assert(/^wave88[abc]$/.test(healthz.wave), `healthz.json: expected wave88a/wave88b/wave88c, got ${healthz.wave}`);
assert(/^wave88[abc]$/.test(healthz.build_id), `healthz.json: expected build_id wave88a/wave88b/wave88c, got ${healthz.build_id}`);
assert(healthz.hashed_asset_count === Object.keys(manifest.assets || {}).length, 'healthz.json: hashed_asset_count mismatch');

const docRel = 'docs/DAILY_QUESTION_wave88a.md';
assert(exists(docRel), `missing ${docRel}`);

console.log(JSON.stringify({
  jsBuilt,
  cssBuilt,
  healthzWave: healthz.wave,
  rendered: {
    sectionId: section.id,
    childCount: section.children.length,
    currentId: api.currentId,
    answered: api.answered,
    correct: api.correct,
    poolSize: api.poolSize
  },
  pageChecks,
  hashedAssetCount: Object.keys(manifest.assets || {}).length
}, null, 2));
