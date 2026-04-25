#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = process.cwd();
const EXPECTED = {
  8: ['textrus8w87z', 'texteng8w87z'],
  9: ['textrus9w87z', 'texteng9w87z'],
  10: ['textrus10w87z', 'texteng10w87z'],
  11: ['textrus11w87z', 'texteng11w87z']
};
const INCLUDE_RE = /\/assets\/js\/(grade\d+_data\.|bundle_boosters\.|chunk_grade_content_|chunk_subject_expansion_|chunk_grade10_lazy_wave86s\.)/;

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function assert(condition, message){ if (!condition) throw new Error(message); }
function parseScripts(htmlFile){
  const html = read(htmlFile);
  return [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map((m) => m[1].replace(/^\.\//, ''));
}
function makeClassList(on){ return { add(){}, remove(){}, contains(name){ return !!on && name === 'on'; }, toggle(){ return false; } }; }
function makeElement(tag, opts = {}){
  return {
    tagName: String(tag || 'div').toUpperCase(),
    style: {}, dataset: {}, children: [], attributes: {},
    classList: makeClassList(!!opts.on),
    appendChild(child){ this.children.push(child); return child; },
    remove(){},
    setAttribute(k, v){ this.attributes[k] = String(v); },
    getAttribute(k){ return this.attributes[k] || null; },
    addEventListener(){}, removeEventListener(){},
    closest(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; },
    focus(){},
    get innerHTML(){ return this._innerHTML || ''; },
    set innerHTML(v){ this._innerHTML = String(v); },
    get textContent(){ return this._textContent || ''; },
    set textContent(v){ this._textContent = String(v); }
  };
}
function makeDocument(onPlayScreen){
  const nodes = Object.create(null);
  function getNode(id){
    if (!nodes[id]) nodes[id] = makeElement('div', { on:id === 's-play' && onPlayScreen });
    return nodes[id];
  }
  return {
    currentScript: null,
    head: makeElement('head'),
    body: makeElement('body'),
    documentElement: makeElement('html'),
    createElement: makeElement,
    createTextNode(text){ return { nodeType:3, textContent:String(text) }; },
    addEventListener(){}, removeEventListener(){},
    querySelector(){ return null; }, querySelectorAll(){ return []; },
    getElementById(id){ return getNode(id); }
  };
}
function makeContext(grade, onPlayScreen = false){
  const store = Object.create(null);
  const document = makeDocument(onPlayScreen);
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
  const ctx = makeContext(grade, false);
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
  assert(row.inputMode === 'text', `${topicId}: expected inputMode=text, got ${row.inputMode}`);
  assert(Array.isArray(row.acceptedAnswers) && row.acceptedAnswers.length >= 1, `${topicId}: expected acceptedAnswers`);
  assert(Number.isFinite(row.fuzzyMaxDistance), `${topicId}: expected fuzzyMaxDistance`);
  assert(Number.isFinite(row.fuzzyMinLength), `${topicId}: expected fuzzyMinLength`);
  assert(String(row.ex || '').trim(), `${topicId}: expected explanation text`);
}

const manifest = JSON.parse(read('assets/asset-manifest.json'));
const runtimeLogical = 'assets/js/bundle_grade_runtime_inputs_timing_wave87x.js';
const chunkLogical = 'assets/js/chunk_subject_expansion_wave87z_text_input_banks.js';
const runtimeBuilt = manifest.assets && manifest.assets[runtimeLogical];
const chunkBuilt = manifest.assets && manifest.assets[chunkLogical];
assert(runtimeBuilt, `manifest missing ${runtimeLogical}`);
assert(chunkBuilt, `manifest missing ${chunkLogical}`);
assert(exists(runtimeBuilt), `missing built runtime ${runtimeBuilt}`);
assert(exists(chunkBuilt), `missing built chunk ${chunkBuilt}`);

const runtimeSrc = read('assets/_src/js/bundle_grade_runtime_inputs_timing_wave87x.js');
assert(runtimeSrc.includes('function normalizeTextAnswer'), 'runtime source: missing normalizeTextAnswer');
assert(runtimeSrc.includes('function levenshteinDistance'), 'runtime source: missing levenshteinDistance');
assert(runtimeSrc.includes("mode === 'text'"), 'runtime source: missing explicit text mode handling');
assert(runtimeSrc.includes("text-fuzzy"), 'runtime source: missing fuzzy text match kind');
assert(runtimeSrc.includes('canonical:primaryAnswer ||'), 'runtime source: missing canonical answer preservation');

for (let grade = 1; grade <= 7; grade++) {
  assert(!read(`grade${grade}_v2.html`).includes('./' + chunkBuilt), `grade${grade}_v2.html: unexpected ${chunkBuilt}`);
}

const runtimeCtx = makeContext(8, true);
vm.runInContext(read('assets/_src/js/bundle_grade_runtime_inputs_timing_wave87x.js'), runtimeCtx, { filename:'bundle_grade_runtime_inputs_timing_wave87x.js', timeout:1000 });
const runtimeApi = runtimeCtx.window.__wave87xInputTimingRuntime;
assert(runtimeApi && runtimeApi.version === 'wave87z', 'runtime export missing or wrong version');
assert(runtimeApi.inputModeFor({ inputMode:'text' }) === 'text', 'inputModeFor(text) should return text');
const numericVerdict = runtimeApi.matchInput({ answer:'10%', acceptedAnswers:['10', '10 %'] }, '10', 'numeric');
assert(numericVerdict.ok && numericVerdict.canonical === '10%', 'numeric accepted answer should resolve to canonical official answer');
const altTextVerdict = runtimeApi.matchInput({ answer:'organisation', acceptedAnswers:['organization'], fuzzyMaxDistance:2, fuzzyMinLength:7 }, 'organization', 'text');
assert(altTextVerdict.ok && altTextVerdict.canonical === 'organisation', 'accepted text variant should resolve to canonical official answer');
const fuzzyVerdict = runtimeApi.matchInput({ answer:'environment', acceptedAnswers:[], fuzzyMaxDistance:2, fuzzyMinLength:7 }, 'enviroment', 'text');
assert(fuzzyVerdict.ok && fuzzyVerdict.canonical === 'environment' && fuzzyVerdict.matchKind === 'text-fuzzy', 'fuzzy text match should accept a small typo');
const wrongVerdict = runtimeApi.matchInput({ answer:'environment', acceptedAnswers:[], fuzzyMaxDistance:2, fuzzyMinLength:7 }, 'movement', 'text');
assert(!wrongVerdict.ok, 'fuzzy text match should reject unrelated answers');

const pageChecks = [];
const gradeSummaries = [];
for (const grade of [8, 9, 10, 11]) {
  const html = read(`grade${grade}_v2.html`);
  assert(html.includes('./' + chunkBuilt), `grade${grade}_v2.html: missing ${chunkBuilt}`);
  assert(html.includes('./' + runtimeBuilt), `grade${grade}_v2.html: missing ${runtimeBuilt}`);
  const { ctx, loaded } = loadGrade(grade);
  const meta = ctx.window.__wave87zTextInputBanks;
  assert(meta && meta.version === 'wave87z', `grade ${grade}: missing __wave87zTextInputBanks export`);
  assert(meta.topicCount === EXPECTED[grade].length, `grade ${grade}: expected ${EXPECTED[grade].length} topics, got ${meta.topicCount}`);
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
      inputMode: row.inputMode,
      acceptedAnswers: (row.acceptedAnswers || []).length,
      fuzzyMaxDistance: row.fuzzyMaxDistance,
      fuzzyMinLength: row.fuzzyMinLength
    });
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
assert(/^(wave87z|wave88[abcd]|wave89a)$/.test(healthz.wave), `healthz.json: expected wave87z/wave88a/wave88b/wave88c/wave88d/wave89a, got ${healthz.wave}`);
assert(/^(wave87z|wave88[abcd]|wave89a)$/.test(healthz.build_id), `healthz.json: expected build_id wave87z/wave88a/wave88b/wave88c/wave88d/wave89a, got ${healthz.build_id}`);
assert(healthz.hashed_asset_count === Object.keys(manifest.assets || {}).length, 'healthz.json: hashed_asset_count mismatch');

const docRel = 'docs/TEXT_INPUT_FUZZY_wave87z.md';
assert(exists(docRel), `missing ${docRel}`);

console.log(JSON.stringify({
  chunkBuilt,
  runtimeBuilt,
  healthzWave: healthz.wave,
  fuzzyChecks: {
    numericCanonical: numericVerdict,
    acceptedTextCanonical: altTextVerdict,
    fuzzyVerdict,
    wrongVerdict
  },
  pageChecks,
  gradeSummaries,
  hashedAssetCount: Object.keys(manifest.assets || {}).length
}, null, 2));
