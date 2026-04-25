#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = process.cwd();
const EXPECTED = {
  8: ['multibio8w88b', 'multihis8w88b'],
  9: ['multichem9w88b', 'multisoc9w88b'],
  10: ['multiinf10w88b', 'multisoc10w88b'],
  11: ['multirus11w88b', 'multibio11w88b']
};
const INCLUDE_RE = /\/assets\/js\/(grade\d+_data\.|bundle_boosters\.|chunk_grade_content_|chunk_subject_expansion_|chunk_grade10_lazy_wave86s\.)/;

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function assert(condition, message){ if (!condition) throw new Error(message); }
function uniq(list){ return (Array.isArray(list) ? list : []).map((item) => String(item)).filter((item, idx, arr) => item && arr.indexOf(item) === idx); }
function parseScripts(htmlFile){
  const html = read(htmlFile);
  return [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map((m) => m[1].replace(/^\.\//, ''));
}
function makeClassList(){ return { add(){}, remove(){}, contains(){ return false; }, toggle(){ return false; } }; }
function makeElement(tag){
  return {
    tagName: String(tag || 'div').toUpperCase(),
    style: {}, dataset: {}, children: [], attributes: {}, classList: makeClassList(),
    appendChild(child){ this.children.push(child); return child; },
    remove(){}, setAttribute(k, v){ this.attributes[k] = String(v); }, getAttribute(k){ return this.attributes[k] || null; },
    addEventListener(){}, removeEventListener(){}, closest(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; },
    get innerHTML(){ return this._innerHTML || ''; }, set innerHTML(v){ this._innerHTML = String(v); },
    get textContent(){ return this._textContent || ''; }, set textContent(v){ this._textContent = String(v); }
  };
}
function makeContentContext(grade){
  const store = Object.create(null);
  const document = {
    currentScript: null,
    head: makeElement('head'),
    body: makeElement('body'),
    documentElement: makeElement('html'),
    createElement: makeElement,
    createTextNode(text){ return { nodeType:3, textContent:String(text) }; },
    addEventListener(){}, removeEventListener(){},
    querySelector(){ return null; }, querySelectorAll(){ return []; }, getElementById(){ return makeElement('div'); }
  };
  const ctx = {
    console: { log(){}, warn(){}, error(){}, info(){} },
    Math, Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError,
    parseInt, parseFloat, isFinite, isNaN, encodeURIComponent, decodeURIComponent,
    setTimeout(fn){ if (typeof fn === 'function') return 0; return 0; }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){},
    Promise,
    document,
    localStorage: {
      getItem(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem(k, v){ store[k] = String(v); }, removeItem(k){ delete store[k]; }, clear(){ Object.keys(store).forEach((k) => delete store[k]); }
    },
    navigator: { vibrate(){}, clipboard:{ writeText(){ return Promise.resolve(); } }, share(){ return Promise.resolve(); } },
    location: { href:`https://example.test/grade${grade}_v2.html`, search:'', pathname:`/grade${grade}_v2.html`, origin:'https://example.test' },
    history: { pushState(){}, replaceState(){} },
    matchMedia(){ return { matches:false, addEventListener(){}, removeEventListener(){} }; },
    URL: { createObjectURL(){ return 'blob:mock'; }, revokeObjectURL(){} },
    Blob: function Blob(parts, opts){ this.parts = parts; this.opts = opts; },
    fetch(){ return Promise.reject(new Error('network disabled in audit')); },
    GRADE_NUM: String(grade),
    rushMode: false,
    diagMode: false,
    globalMix: false,
    cS: { id:'eng' },
    prob: null,
    sel: null,
    usedHelp: false,
    toast(){},
    ans(){},
    render(){},
    renderProg(){}
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.globalThis = ctx;
  ctx.addEventListener = function(){};
  ctx.removeEventListener = function(){};
  return vm.createContext(ctx);
}
const HELPERS = `
const shuffle = o => [...(o || [])];
const pick = o => (o && o.length ? o[0] : undefined);
const range = (a,b) => { const r=[]; for(let i=a;i<=b;i++) r.push(i); return r; };
const uniq = o => (o || []).filter((v, i, arr) => arr.indexOf(v) === i);
const esc = o => String(o == null ? '' : o).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const sub = o => String(o == null ? '' : o);
const sup = o => String(o == null ? '' : o);
function mkQ(q, a, o, h, tag, color, bg, code, isMath, ex){
  const answer = String(a == null ? '' : a);
  const options = uniq([answer].concat(Array.isArray(o) ? o.map(v => String(v == null ? '' : v)) : [])).slice(0, 4);
  while (options.length < 4) options.push('вариант ' + (options.length + 1));
  const row = { question:q, answer:answer, options:options, hint:h, tag:tag, color:color, bg:bg, code:code || null, isMath:!!isMath };
  if (ex) row.ex = String(ex);
  return row;
}
function fillW(answer, gens){ return [String(answer), '1', '2', '3']; }
function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ const t=b; b=a%b; a=t; } return a; }
`;
function runScript(ctx, rel){
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error(`missing script ${rel}`);
  ctx.document.currentScript = { src:'./' + rel, dataset:{} };
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename:rel, timeout:1000 });
}
function loadGrade(grade){
  const ctx = makeContentContext(grade);
  vm.runInContext(HELPERS, ctx, { filename:'audit-helpers.js', timeout:1000 });
  const scripts = parseScripts(`grade${grade}_v2.html`).filter((src) => INCLUDE_RE.test('/' + src));
  const loaded = [];
  scripts.forEach((src) => { runScript(ctx, src); loaded.push(src); });
  return { ctx, loaded };
}
function findTopic(ctx, topicId){
  const subjects = ctx.window.SUBJ || [];
  for (const subject of subjects) {
    for (const topic of (subject && Array.isArray(subject.tops) ? subject.tops : [])) {
      if (topic && topic.id === topicId) return { subjectId: subject.id, topic };
    }
  }
  return null;
}
function validateGenerated(row, topicId){
  assert(row && typeof row === 'object', `${topicId}: generator returned empty row`);
  assert(String(row.question || '').trim(), `${topicId}: empty question`);
  assert(String(row.answer || '').trim(), `${topicId}: empty answer`);
  assert(row.interactionType === 'multi-select', `${topicId}: expected interactionType=multi-select, got ${row.interactionType}`);
  assert(Array.isArray(row.multiSelectOptions) && row.multiSelectOptions.length === 6, `${topicId}: expected 6 multiSelectOptions`);
  assert(uniq(row.multiSelectOptions).length === 6, `${topicId}: multiSelectOptions should stay unique`);
  assert(Array.isArray(row.multiSelectAnswers) && [2, 3].includes(row.multiSelectAnswers.length), `${topicId}: expected 2 or 3 correct answers`);
  assert(row.multiSelectMin === row.multiSelectAnswers.length, `${topicId}: multiSelectMin should equal the number of correct answers`);
  assert(row.multiSelectMax === row.multiSelectAnswers.length, `${topicId}: multiSelectMax should equal the number of correct answers`);
  assert(Array.isArray(row.options) && row.options.length >= 4, `${topicId}: expected >=4 fallback options`);
  assert(row.options.map(String).includes(String(row.answer)), `${topicId}: canonical answer missing from fallback options`);
  assert(row.answer.split('|').map((item) => item.trim()).filter(Boolean).length === row.multiSelectAnswers.length, `${topicId}: canonical answer should serialize all correct options`);
  assert(String(row.ex || '').trim(), `${topicId}: expected explanation text`);
}
function makeRuntimeContext(){
  const store = Object.create(null);
  const playScreen = {
    classList: { contains(name){ return name === 'on'; } }
  };
  const document = {
    currentScript: null,
    head: makeElement('head'),
    body: makeElement('body'),
    createElement: makeElement,
    createTextNode(text){ return { nodeType:3, textContent:String(text) }; },
    addEventListener(){}, removeEventListener(){},
    getElementById(id){
      if (id === 's-play') return playScreen;
      return null;
    },
    querySelector(){ return null; }, querySelectorAll(){ return []; }
  };
  const ctx = {
    console: { log(){}, warn(){}, error(){}, info(){} },
    Math, Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError,
    parseInt, parseFloat, isFinite, isNaN,
    setTimeout(fn){ if (typeof fn === 'function') return 0; return 0; }, clearTimeout(){},
    Promise,
    document,
    localStorage: {
      getItem(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem(k, v){ store[k] = String(v); }, removeItem(k){ delete store[k]; }
    },
    navigator: { clipboard:{ writeText(){ return Promise.resolve(); } }, share(){ return Promise.resolve(); } },
    location: { href:'https://example.test/grade8_v2.html', pathname:'/grade8_v2.html', origin:'https://example.test' },
    GRADE_NUM: '8',
    rushMode: false,
    diagMode: false,
    prob: null,
    sel: null,
    usedHelp: false,
    toast(){},
    nextQ(){},
    render(){},
    ans(){}
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.globalThis = ctx;
  return vm.createContext(ctx);
}

const manifest = JSON.parse(read('assets/asset-manifest.json'));
const runtimeLogical = 'assets/js/bundle_grade_runtime_interactions_wave87w.js';
const chunkLogical = 'assets/js/chunk_subject_expansion_wave88b_multi_select_banks.js';
const runtimeBuilt = manifest.assets && manifest.assets[runtimeLogical];
const chunkBuilt = manifest.assets && manifest.assets[chunkLogical];
assert(runtimeBuilt, `manifest missing ${runtimeLogical}`);
assert(chunkBuilt, `manifest missing ${chunkLogical}`);
assert(exists(runtimeBuilt), `missing built runtime ${runtimeBuilt}`);
assert(exists(chunkBuilt), `missing built chunk ${chunkBuilt}`);

const runtimeSrc = read('assets/_src/js/bundle_grade_runtime_interactions_wave87w.js');
assert(runtimeSrc.includes("MULTI_SELECT: 'multi-select'"), 'runtime source: missing multi-select type constant');
assert(runtimeSrc.includes('renderMultiSelect') && runtimeSrc.includes('toggleMultiSelect'), 'runtime source: missing multi-select render/toggle helpers');
assert(runtimeSrc.includes('serializeMultiSelect') && runtimeSrc.includes('/^[1-6]$/'), 'runtime source: missing serializer or keyboard shortcut handling');
assert(runtimeSrc.includes("version: 'wave88b'") || runtimeSrc.includes("version:'wave88b'"), 'runtime source: missing wave88b version tag');

const runtimeCtx = makeRuntimeContext();
vm.runInContext(runtimeSrc, runtimeCtx, { filename:'bundle_grade_runtime_interactions_wave87w.js', timeout:1000 });
const runtimeApi = runtimeCtx.window.__wave87wInteractiveFormats;
assert(runtimeApi && runtimeApi.version === 'wave88b', 'runtime export missing or wrong version');
assert(runtimeApi.active === true, 'runtime export should stay active for grade 8');
const sampleQuestion = {
  interactionType:'multi-select',
  multiSelectOptions:['A', 'B', 'C', 'D', 'E', 'F'],
  multiSelectAnswers:['C', 'A'],
  answer:'C | A'
};
const serialized = runtimeApi.serializeMultiSelect(sampleQuestion, ['C', 'A']);
assert(serialized === 'A | C', `serializeMultiSelect should canonicalize option order, got ${serialized}`);
const runtimeCorrect = runtimeApi.multiSelectCorrect(sampleQuestion);
assert(JSON.stringify(runtimeCorrect) === JSON.stringify(['A', 'C']), `multiSelectCorrect should normalize to ['A','C'], got ${JSON.stringify(runtimeCorrect)}`);
assert(runtimeApi.multiSelectOptions(sampleQuestion).length === 6, 'multiSelectOptions should expose all six options');

for (let grade = 1; grade <= 7; grade++) {
  const html = read(`grade${grade}_v2.html`);
  assert(!html.includes('./' + chunkBuilt), `grade${grade}_v2.html: unexpected ${chunkBuilt}`);
}

const pageChecks = [];
const gradeSummaries = [];
let totalRows = 0;
for (const grade of [8, 9, 10, 11]) {
  const html = read(`grade${grade}_v2.html`);
  assert(html.includes('./' + runtimeBuilt), `grade${grade}_v2.html: missing ${runtimeBuilt}`);
  assert(html.includes('./' + chunkBuilt), `grade${grade}_v2.html: missing ${chunkBuilt}`);
  const { ctx, loaded } = loadGrade(grade);
  const meta = ctx.window.__wave88bMultiSelectBanks;
  assert(meta && meta.version === 'wave88b', `grade ${grade}: missing __wave88bMultiSelectBanks export`);
  assert(meta.topicCount === EXPECTED[grade].length, `grade ${grade}: expected ${EXPECTED[grade].length} topics, got ${meta.topicCount}`);
  assert(meta.rowCount === 12, `grade ${grade}: expected 12 rows, got ${meta.rowCount}`);
  totalRows += meta.rowCount;
  const topics = [];
  EXPECTED[grade].forEach((topicId) => {
    const found = findTopic(ctx, topicId);
    assert(found, `grade ${grade}: missing injected topic ${topicId}`);
    const row = found.topic.gen();
    validateGenerated(row, topicId);
    topics.push({
      topicId,
      subjectId: found.subjectId,
      answer: String(row.answer),
      correctCount: row.multiSelectAnswers.length,
      optionCount: row.multiSelectOptions.length
    });
  });
  pageChecks.push({ grade, hasRuntime:true, hasChunk:true });
  gradeSummaries.push({
    grade,
    topicCount: meta.topicCount,
    rowCount: meta.rowCount,
    loadedScripts: loaded.length,
    topics
  });
}
assert(totalRows === 48, `expected 48 multi-select rows across grades 8–11, got ${totalRows}`);
assert(read('sw.js').includes(`'./${runtimeBuilt}'`), `sw.js: missing ${runtimeBuilt}`);
assert(read('sw.js').includes(`'./${chunkBuilt}'`), `sw.js: missing ${chunkBuilt}`);

const healthz = JSON.parse(read('healthz.json'));
assert(/^wave88[bcd]$/.test(healthz.wave), `healthz.json: expected wave88b/wave88c/wave88d, got ${healthz.wave}`);
assert(/^wave88[bcd]$/.test(healthz.build_id), `healthz.json: expected build_id wave88b/wave88c/wave88d, got ${healthz.build_id}`);
assert(healthz.hashed_asset_count === Object.keys(manifest.assets || {}).length, 'healthz.json: hashed_asset_count mismatch');

const docRel = 'docs/MULTI_SELECT_wave88b.md';
assert(exists(docRel), `missing ${docRel}`);

console.log(JSON.stringify({
  runtimeBuilt,
  chunkBuilt,
  healthzWave: healthz.wave,
  runtimeChecks: {
    version: runtimeApi.version,
    serialized,
    runtimeCorrect,
    optionCount: runtimeApi.multiSelectOptions(sampleQuestion).length
  },
  pageChecks,
  gradeSummaries,
  totalRows,
  hashedAssetCount: Object.keys(manifest.assets || {}).length
}, null, 2));
