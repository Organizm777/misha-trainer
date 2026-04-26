#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = process.cwd();
const EXPECTED = {
  8: ['numalg8w87y', 'numprob8w87y', 'numphy8w87y', 'numchem8w87y'],
  9: ['numalg9w87y', 'numphy9w87y', 'numchem9w87y'],
  10: ['numalg10w87y', 'numprob10w87y', 'numphy10w87y', 'numchem10w87y'],
  11: ['numalg11w87y', 'numprob11w87y', 'numphy11w87y', 'numchem11w87y']
};
const INCLUDE_RE = /\/assets\/js\/(grade\d+_data\.|bundle_boosters\.|chunk_grade_content_|chunk_subject_expansion_|chunk_grade10_lazy_wave86s\.)/;

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function assert(condition, message){ if (!condition) throw new Error(message); }
function firstBuilt(manifest, logicals){
  for (const logical of logicals) {
    const built = manifest.assets && manifest.assets[logical];
    if (built) return { logical, built };
  }
  return { logical: logicals[0], built: '' };
}
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
function makeContext(grade){
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
    GRADE_NUM: String(grade)
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
  const ctx = makeContext(grade);
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
  assert(Array.isArray(row.options) && row.options.length >= 4, `${topicId}: expected >=4 options`);
  assert(row.options.map(String).includes(String(row.answer)), `${topicId}: answer missing from options`);
  assert(row.inputMode === 'numeric', `${topicId}: expected inputMode=numeric, got ${row.inputMode}`);
  assert(Array.isArray(row.acceptedAnswers) && row.acceptedAnswers.length >= 1, `${topicId}: expected acceptedAnswers`);
  assert(String(row.ex || '').trim(), `${topicId}: expected explanation text`);
}

const manifest = JSON.parse(read('assets/asset-manifest.json'));
const runtimeLogical = 'assets/js/bundle_grade_runtime_inputs_timing_wave87x.js';
const runtimeMergedLogical = 'assets/js/bundle_grade_runtime_extended_wave89b.js';
const chunkLogical = 'assets/js/chunk_subject_expansion_wave87y_free_input_banks.js';
const chunkMergedLogical = 'assets/js/chunk_subject_expansion_wave89b_inputs_interactions_banks.js';
const runtimeChoice = firstBuilt(manifest, [runtimeLogical, runtimeMergedLogical]);
const chunkChoice = firstBuilt(manifest, [chunkLogical, chunkMergedLogical]);
const runtimeBuilt = runtimeChoice.built;
const chunkBuilt = chunkChoice.built;
assert(runtimeBuilt, `manifest missing ${runtimeLogical} or ${runtimeMergedLogical}`);
assert(chunkBuilt, `manifest missing ${chunkLogical} or ${chunkMergedLogical}`);
assert(exists(runtimeBuilt), `missing built runtime ${runtimeBuilt}`);
assert(exists(chunkBuilt), `missing built chunk ${chunkBuilt}`);

const runtimeSrc = read('assets/_src/js/bundle_grade_runtime_inputs_timing_wave87x.js');
assert(runtimeSrc.includes('function fractionExample'), 'runtime source: missing fractionExample helper');
assert(runtimeSrc.includes('Можно вводить дробь вроде'), 'runtime source: missing numeric fraction helper text');
assert(runtimeSrc.includes('numerator / denominator'), 'runtime source: missing fraction numeric parser');

for (let grade = 1; grade <= 7; grade++) {
  assert(!read(`grade${grade}_v2.html`).includes('./' + chunkBuilt), `grade${grade}_v2.html: unexpected ${chunkBuilt}`);
}
const pageChecks = [];
const gradeSummaries = [];
for (const grade of [8, 9, 10, 11]) {
  const html = read(`grade${grade}_v2.html`);
  assert(html.includes('./' + chunkBuilt), `grade${grade}_v2.html: missing ${chunkBuilt}`);
  assert(html.includes('./' + runtimeBuilt), `grade${grade}_v2.html: missing ${runtimeBuilt}`);
  const { ctx, loaded } = loadGrade(grade);
  const meta = ctx.window.__wave87yFreeInputBanks;
  assert(meta && meta.version === 'wave87y', `grade ${grade}: missing __wave87yFreeInputBanks export`);
  assert(meta.topicCount === EXPECTED[grade].length, `grade ${grade}: expected ${EXPECTED[grade].length} topics, got ${meta.topicCount}`);
  const topics = [];
  EXPECTED[grade].forEach((topicId) => {
    const found = findTopic(ctx, topicId);
    assert(found, `grade ${grade}: missing injected topic ${topicId}`);
    const row = found.topic.gen();
    validateGenerated(row, topicId);
    topics.push({ topicId, subjectId:found.subjectId, answer:String(row.answer), inputMode:row.inputMode, acceptedAnswers:(row.acceptedAnswers || []).length });
  });
  pageChecks.push({ grade, hasChunk:true, hasRuntime:true });
  gradeSummaries.push({
    grade,
    topicCount: meta.topicCount,
    rowCount: meta.rowCount,
    loadedScripts: loaded.length,
    topics
  });
}
assert(read('sw.js').includes(`'./${runtimeBuilt}'`), `sw.js: missing ${runtimeBuilt}`);
assert(read('sw.js').includes(`'./${chunkBuilt}'`), `sw.js: missing ${chunkBuilt}`);

const healthz = JSON.parse(read('healthz.json'));
assert(/^(wave87[yz]|wave88[abcd]|wave89[a-z]+)$/i.test(String(healthz.wave || '')), `healthz.json: expected wave87y+ or a later wave89* build, got ${healthz.wave}`);
assert(/^(wave87[yz]|wave88[abcd]|wave89[a-z]+)$/i.test(String(healthz.build_id || '')), `healthz.json: expected build_id wave87y+ or a later wave89* build, got ${healthz.build_id}`);
assert(healthz.hashed_asset_count === Object.keys(manifest.assets || {}).length, 'healthz.json: hashed_asset_count mismatch');

const docRel = 'docs/FREE_INPUT_BANKS_wave87y.md';
assert(exists(docRel), `missing ${docRel}`);

console.log(JSON.stringify({
  chunkBuilt,
  runtimeBuilt,
  healthzWave: healthz.wave,
  pageChecks,
  gradeSummaries,
  hashedAssetCount: Object.keys(manifest.assets || {}).length
}, null, 2));
