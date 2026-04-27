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
function parseScripts(htmlFile){
  return [...read(htmlFile).matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map((m) => m[1].replace(/^\.\//, ''));
}
function firstBuilt(manifest, logicals){
  for (const logical of logicals) {
    const built = manifest.assets && manifest.assets[logical];
    if (built) return { logical, built };
  }
  return { logical: logicals[0], built: '' };
}
function makeClassList(){
  const set = new Set();
  return {
    add(...names){ names.forEach((name) => set.add(String(name))); },
    remove(...names){ names.forEach((name) => set.delete(String(name))); },
    contains(name){ return set.has(String(name)); },
    toggle(name, force){
      const key = String(name);
      if (force === true) { set.add(key); return true; }
      if (force === false) { set.delete(key); return false; }
      if (set.has(key)) { set.delete(key); return false; }
      set.add(key);
      return true;
    },
    toString(){ return Array.from(set).join(' '); }
  };
}
function makeElement(tag){
  return {
    nodeType: 1,
    tagName: String(tag || 'div').toUpperCase(),
    style: {},
    dataset: {},
    children: [],
    attributes: {},
    hidden: false,
    classList: makeClassList(),
    appendChild(child){ this.children.push(child); if (child && typeof child.onload === 'function') child.onload(); return child; },
    removeChild(child){ this.children = this.children.filter((item) => item !== child); return child; },
    remove(){},
    setAttribute(k, v){ this.attributes[k] = String(v); },
    getAttribute(k){ return Object.prototype.hasOwnProperty.call(this.attributes, k) ? this.attributes[k] : null; },
    hasAttribute(k){ return Object.prototype.hasOwnProperty.call(this.attributes, k); },
    addEventListener(){},
    removeEventListener(){},
    closest(){ return null; },
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    animate(){ return { onfinish:null }; },
    click(){},
    get innerHTML(){ return this._innerHTML || ''; }, set innerHTML(v){ this._innerHTML = String(v); },
    get textContent(){ return this._textContent || ''; }, set textContent(v){ this._textContent = String(v); }
  };
}
function makeContext(page, grade){
  const store = Object.create(null);
  const document = {
    readyState: 'loading',
    currentScript: null,
    head: makeElement('head'),
    body: makeElement('body'),
    documentElement: makeElement('html'),
    createElement: makeElement,
    createTextNode(text){ return { nodeType: 3, textContent: String(text) }; },
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
    sessionStorage: {
      getItem(k){ return Object.prototype.hasOwnProperty.call(store, 's:' + k) ? store['s:' + k] : null; },
      setItem(k, v){ store['s:' + k] = String(v); }, removeItem(k){ delete store['s:' + k]; }, clear(){ Object.keys(store).filter((k) => k.startsWith('s:')).forEach((k) => delete store[k]); }
    },
    navigator: { userAgent:'Mozilla/5.0', standalone:false, vibrate(){}, clipboard:{ writeText(){ return Promise.resolve(); } }, share(){ return Promise.resolve(); } },
    location: { href:`https://example.test/${page}`, search:'', pathname:`/${page}`, origin:'https://example.test' },
    history: { pushState(){}, replaceState(){} },
    screen: { width: 1280, height: 800 },
    innerWidth: 1280,
    innerHeight: 800,
    alert(){}, confirm(){ return true; }, prompt(){ return ''; },
    matchMedia(){ return { matches:false, addEventListener(){}, removeEventListener(){} }; },
    URL: { createObjectURL(){ return 'blob:mock'; }, revokeObjectURL(){} },
    Blob: function Blob(parts, opts){ this.parts = parts; this.opts = opts; },
    CustomEvent: function CustomEvent(type, init){ this.type = type; this.detail = init && init.detail; },
    dispatchEvent(){ return true; },
    addEventListener(){}, removeEventListener(){},
    fetch(){ return Promise.reject(new Error('network disabled in audit')); },
    GRADE_NUM: String(grade)
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.globalThis = ctx;
  return vm.createContext(ctx);
}
const HELPERS = `
const shuffle = o => [...(o || [])];
const pick = o => (o && o.length ? o[0] : undefined);
const uniq = o => (o || []).filter((v, i, arr) => arr.indexOf(v) === i);
const esc = o => String(o == null ? '' : o).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const sub = o => String(o == null ? '' : o);
const sup = o => String(o == null ? '' : o);
function range(a,b){ const out = []; for (let i = a; i <= b; i++) out.push(i); return out; }
function gcd(a,b){ a=Math.abs(Number(a)||0); b=Math.abs(Number(b)||0); while(b){ const t=b; b=a%b; a=t; } return a || 1; }
function mkQ(q, a, o, h, tag, color, bg, code, isMath, ex){
  const answer = String(a == null ? '' : a);
  const options = uniq([answer].concat(Array.isArray(o) ? o.map(v => String(v == null ? '' : v)) : [])).slice(0, 4);
  while (options.length < 4) options.push('вариант ' + (options.length + 1));
  const row = { question:String(q == null ? '' : q), answer:answer, options:options, hint:String(h == null ? '' : h), tag:tag, color:color, bg:bg, code:code || null, isMath:!!isMath };
  if (ex != null) row.ex = String(ex);
  return row;
}
function fillW(answer, gens){
  const out = uniq([String(answer)].concat((gens || []).map(fn => {
    try { return typeof fn === 'function' ? fn() : fn; } catch (_err) { return '?'; }
  }).map(v => String(v))));
  while (out.length < 4) out.push('вариант ' + (out.length + 1));
  return out.slice(0, 4);
}
`;
function runScript(ctx, rel){
  const file = path.join(ROOT, rel);
  if (!exists(rel)) throw new Error(`missing script ${rel}`);
  ctx.document.currentScript = { src:'./' + rel, dataset:{} };
  vm.runInContext(read(rel), ctx, { filename:rel, timeout:1500 });
}
function loadGradeInitial(grade){
  const page = `grade${grade}_v2.html`;
  const ctx = makeContext(page, grade);
  vm.runInContext(HELPERS, ctx, { filename:'audit-helpers.js', timeout:1000 });
  const scripts = parseScripts(page).filter((src) => /assets\/js\/(grade\d+_data\.|bundle_boosters\.|chunk_grade_content_|chunk_subject_expansion_)/.test(src));
  const loaded = [];
  for (const src of scripts) {
    runScript(ctx, src);
    loaded.push(src);
  }
  return { ctx, loaded };
}
function inspectGradeSubjects(ctx, grade){
  const api = ctx.window.__wave89iSubjectColorGroups;
  assert(api && api.version === 'wave89i' && api.active, `grade ${grade}: missing __wave89iSubjectColorGroups export`);
  const palette = api.palette || {};
  const groups = Object.keys(palette);
  assert.equal(groups.length, 5, `grade ${grade}: expected 5 palette groups, got ${groups.length}`);
  const list = Array.isArray(ctx.window.SUBJ) ? ctx.window.SUBJ : [];
  assert(list.length >= 4, `grade ${grade}: expected subject list, got ${list.length}`);
  const pairSet = new Set();
  const usage = Object.create(null);
  const subjects = [];
  list.forEach((subject) => {
    assert(subject && typeof subject === 'object', `grade ${grade}: encountered invalid subject`);
    const key = String(subject.wave89iColorGroup || api.groupOf(subject) || '').trim();
    assert(key && palette[key], `grade ${grade}: subject ${subject.id || subject.nm || '?'} missing valid wave89iColorGroup`);
    const group = palette[key];
    assert.equal(subject.cl, group.cl, `grade ${grade}: subject ${subject.id} cl mismatch for group ${key}`);
    assert.equal(subject.bg, group.bg, `grade ${grade}: subject ${subject.id} bg mismatch for group ${key}`);
    assert.equal(subject.dot, group.dot, `grade ${grade}: subject ${subject.id} dot mismatch for group ${key}`);
    pairSet.add(`${subject.cl}|${subject.bg}`);
    usage[key] = (usage[key] || 0) + 1;
    const topics = Array.isArray(subject.tops) ? subject.tops : [];
    topics.forEach((topic) => {
      assert(topic && typeof topic === 'object', `grade ${grade}: invalid topic under ${subject.id}`);
      assert.equal(topic.wave89iColorGroup || key, key, `grade ${grade}: topic ${topic.id || topic.nm || '?'} group mismatch under ${subject.id}`);
      assert.equal(topic.dot, group.dot, `grade ${grade}: topic ${topic.id || topic.nm || '?'} dot mismatch under ${subject.id}`);
    });
    subjects.push({ id:subject.id, group:key, topics:topics.length });
  });
  return { subjectCount:list.length, pairCount:pairSet.size, usage, subjects };
}
function loadGrade10LazySample(manifest){
  const ctx = makeContext('grade10_v2.html', 10);
  vm.runInContext(HELPERS, ctx, { filename:'audit-helpers.js', timeout:1000 });
  const baseScripts = parseScripts('grade10_v2.html').filter((src) => /assets\/js\/(grade10_data\.|bundle_boosters\.|chunk_grade_content_|chunk_subject_expansion_)/.test(src));
  baseScripts.forEach((src) => runScript(ctx, src));
  const lazyBuilt = manifest.assets['assets/js/chunk_grade10_lazy_wave86s.js'];
  assert(lazyBuilt, 'manifest missing assets/js/chunk_grade10_lazy_wave86s.js');
  runScript(ctx, lazyBuilt);
  const phyBuilt = firstBuilt(manifest, ['assets/js/grade10_subject_phy_wave86s.js']).built;
  const artBuilt = firstBuilt(manifest, ['assets/js/grade10_subject_art_wave86s.js']).built;
  assert(phyBuilt && exists(phyBuilt), 'missing built grade10 physics lazy subject asset');
  assert(artBuilt && exists(artBuilt), 'missing built grade10 art lazy subject asset');
  runScript(ctx, phyBuilt);
  runScript(ctx, artBuilt);
  const api = ctx.window.__wave89iSubjectColorGroups;
  const palette = api && api.palette ? api.palette : {};
  function checkSubject(id, groupKey){
    const subject = (ctx.window.SUBJ || []).find((item) => item && item.id === id);
    assert(subject, `grade10 lazy sample: missing subject ${id}`);
    assert.equal(subject.wave89iColorGroup || api.groupOf(subject), groupKey, `grade10 lazy sample: subject ${id} group mismatch`);
    const group = palette[groupKey];
    assert(group, `grade10 lazy sample: missing palette group ${groupKey}`);
    const topics = Array.isArray(subject.tops) ? subject.tops : [];
    assert(topics.length >= 1, `grade10 lazy sample: subject ${id} should expose loaded topics`);
    topics.forEach((topic) => {
      assert.equal(topic.dot, group.dot, `grade10 lazy sample: topic ${topic.id || topic.nm || '?'} dot mismatch under ${id}`);
    });
    return { id, group:groupKey, topicCount:topics.length };
  }
  return {
    loadedLazySubjects: [checkSubject('phy', 'nature'), checkSubject('art', 'creative')]
  };
}

const manifest = readJSON('assets/asset-manifest.json');
const healthz = readJSON('healthz.json');
const sw = read('sw.js');
assert.ok(waveRank(healthz.wave) >= waveRank('wave89i'), `healthz.wave should be wave89i+ (got ${healthz.wave})`);
assert.ok(waveRank(healthz.build_id) >= waveRank('wave89i'), `healthz.build_id should be wave89i+ (got ${healthz.build_id})`);
assert.ok(String(healthz.cache || '').includes(String(healthz.build_id || '')), `healthz.cache should reference healthz.build_id (got ${healthz.cache})`);
assert.equal(healthz.hashed_asset_count, Object.keys(manifest.assets || {}).length, 'healthz hashed_asset_count mismatch');

const qualityLogical = 'assets/js/chunk_subject_expansion_wave63_quality.js';
const wave89bLogical = 'assets/js/chunk_subject_expansion_wave89b_inputs_interactions_banks.js';
const lazy10Logical = 'assets/js/chunk_grade10_lazy_wave86s.js';
const qualityBuilt = manifest.assets?.[qualityLogical];
const wave89bBuilt = manifest.assets?.[wave89bLogical];
const lazy10Built = manifest.assets?.[lazy10Logical];
assert.ok(qualityBuilt, `manifest missing ${qualityLogical}`);
assert.ok(wave89bBuilt, `manifest missing ${wave89bLogical}`);
assert.ok(lazy10Built, `manifest missing ${lazy10Logical}`);
for (const rel of [qualityBuilt, wave89bBuilt, lazy10Built]) {
  assert.ok(exists(rel), `missing built asset ${rel}`);
  assert.ok(sw.includes(`./${rel}`), `sw.js should precache ${rel}`);
}

const srcQuality = read('assets/_src/js/chunk_subject_expansion_wave63_quality.js');
const srcWave89b = read('assets/_src/js/chunk_subject_expansion_wave89b_inputs_interactions_banks.js');
const srcLazy10 = read('assets/_src/js/chunk_grade10_lazy_wave86s.js');
const builtQuality = read(qualityBuilt);
const builtWave89b = read(wave89bBuilt);
const builtLazy10 = read(lazy10Built);

assert.ok(srcQuality.includes('/* wave89i: subject color groups */'), 'quality source should contain the wave89i marker');
assert.ok(srcQuality.includes('window.__wave89iSubjectColorGroups'), 'quality source should expose __wave89iSubjectColorGroups');
assert.ok(srcQuality.includes("subject.cl = group.cl;"), 'quality source should normalize subject.cl');
assert.ok(srcQuality.includes("subject.bg = group.bg;"), 'quality source should normalize subject.bg');
assert.ok(srcQuality.includes("subject.dot = group.dot;"), 'quality source should normalize subject.dot');
assert.ok(srcQuality.includes("topic.dot = group.dot;"), 'quality source should normalize topic dots');
assert.ok(srcQuality.includes("applySubjectColorGroups(); wrapTopics(); sanitizeBankRows(); patchMkQ();"), 'quality source should apply colors before wrapping topics, sanitization and mkQ patching');
assert.ok(srcQuality.includes("if (/^(math|alg|geo|prob|inf)$/.test(id)) return 'logic';"), 'quality source should group logic subjects');
assert.ok(srcQuality.includes("if (/^(phy|chem|bio|world|okr|geo5|geo6|geog|obzh)$/.test(id)) return 'nature';"), 'quality source should group natural-science subjects');
assert.ok(srcQuality.includes("if (/^(rus|eng|lit|read)$/.test(id)) return 'language';"), 'quality source should group language subjects');
assert.ok(srcQuality.includes("if (/^(his|soc|orkse|odnknr)$/.test(id)) return 'society';"), 'quality source should group society subjects');
assert.ok(builtQuality.includes('/* wave89i: subject color groups */'), 'rebuilt quality chunk should contain the wave89i marker');
assert.ok(builtQuality.includes('window.__wave89iSubjectColorGroups'), 'rebuilt quality chunk should expose __wave89iSubjectColorGroups');

const wave89bExpected = "existing.dot = (subject && (subject.dot || subject.cl)) || topic.dot || existing.dot || (STYLES[subjectId] && STYLES[subjectId].color) || '#2563eb';";
assert.ok(srcWave89b.includes(wave89bExpected), 'wave89b merged banks source should inherit grouped subject colors for late topics');
assert.ok(builtWave89b.includes(wave89bExpected), 'rebuilt wave89b merged banks chunk should inherit grouped subject colors for late topics');
const lazyInitExpected = "topic = { id: row.id, nm: row.nm || row.id, dot: (subject && (subject.dot || subject.cl)) || row.dot || '#2563eb', th: '' };";
const lazySetExpected = "topic.dot = (subject && (subject.dot || subject.cl)) || row.dot || topic.dot || '#2563eb';";
assert.ok(srcLazy10.includes(lazyInitExpected), 'grade10 lazy helper source should inherit grouped subject colors for new lazy topics');
assert.ok(srcLazy10.includes(lazySetExpected), 'grade10 lazy helper source should enforce grouped color fallback for lazy topics');
assert.ok(builtLazy10.includes(lazyInitExpected), 'rebuilt grade10 lazy helper should inherit grouped subject colors for new lazy topics');
assert.ok(builtLazy10.includes(lazySetExpected), 'rebuilt grade10 lazy helper should enforce grouped color fallback for lazy topics');

const changelog = read('CHANGELOG.md');
const docs = read('docs/SUBJECT_COLOR_GROUPS_wave89i.md');
const toolsReadme = read('tools/README.md');
const claude = read('CLAUDE.md');
const validateWorkflow = read('.github/workflows/validate-questions.yml');
const lighthouseWorkflow = read('.github/workflows/lighthouse-budget.yml');
assert.ok(changelog.includes('## wave89i'), 'CHANGELOG should document wave89i');
assert.ok(docs.includes('5 palette groups'), 'wave89i doc should describe the 5 palette groups');
assert.ok(docs.includes('chunk_subject_expansion_wave89b_inputs_interactions_banks.js'), 'wave89i doc should mention late topic injectors');
assert.ok(docs.includes('chunk_grade10_lazy_wave86s.js'), 'wave89i doc should mention the lazy grade10 helper follow-up');
assert.ok(toolsReadme.includes('audit_subject_color_groups_wave89i.mjs'), 'tools README should list the wave89i audit');
assert.ok(claude.includes('### wave89i subject color groups'), 'CLAUDE.md should document wave89i');
assert.ok(validateWorkflow.includes('node tools/audit_subject_color_groups_wave89i.mjs'), 'validate workflow should run the wave89i audit');
assert.ok(lighthouseWorkflow.includes('node tools/audit_subject_color_groups_wave89i.mjs'), 'lighthouse workflow should run the wave89i audit');

const gradeSummaries = [];
const uniquePairs = new Set();
const globalUsage = Object.create(null);
for (let grade = 1; grade <= 11; grade += 1) {
  const page = `grade${grade}_v2.html`;
  const html = read(page);
  assert.ok(html.includes(`./${qualityBuilt}`), `${page} should reference the rebuilt quality chunk`);
  if (grade >= 8 && waveRank(healthz.wave) < waveRank('wave89x')) {
    assert.ok(html.includes(`./${wave89bBuilt}`), `${page} should reference the rebuilt wave89b merged banks chunk`);
  }
  if (grade >= 8 && waveRank(healthz.wave) >= waveRank('wave89x')) {
    assert.ok(!html.includes(`./${wave89bBuilt}`), `${page} should lazy-load the rebuilt wave89b merged banks chunk after wave89x`);
  }
  if (grade === 10) assert.ok(html.includes(`./${lazy10Built}`), 'grade10_v2.html should reference the rebuilt grade10 lazy helper');
  const { ctx, loaded } = loadGradeInitial(grade);
  const inspected = inspectGradeSubjects(ctx, grade);
  Object.entries(inspected.usage).forEach(([key, count]) => { globalUsage[key] = (globalUsage[key] || 0) + count; });
  inspected.subjects.forEach((subject) => {
    const api = ctx.window.__wave89iSubjectColorGroups;
    const group = api.palette[subject.group];
    uniquePairs.add(`${group.cl}|${group.bg}`);
  });
  gradeSummaries.push({ grade, loadedScripts: loaded.length, ...inspected });
}
assert.equal(uniquePairs.size, 5, `expected exactly 5 unique subject color pairs across grades, got ${uniquePairs.size}`);

const lazyGrade10 = loadGrade10LazySample(manifest);

console.log(JSON.stringify({
  ok: true,
  wave: 'wave89i',
  healthzWave: healthz.wave,
  hashedAssetCount: Object.keys(manifest.assets || {}).length,
  qualityBuilt,
  wave89bBuilt,
  lazy10Built,
  uniquePairs: Array.from(uniquePairs).sort(),
  uniquePairCount: uniquePairs.size,
  globalUsage,
  lazyGrade10,
  gradeSummaries
}, null, 2));
