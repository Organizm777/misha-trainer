#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = process.cwd();
const GRADE_PAGES = Array.from({ length: 11 }, (_, i) => `grade${i + 1}_v2.html`);
const INCLUDE_RE = /\/assets\/js\/(grade\d+_data\.|bundle_boosters\.|chunk_grade_content_|chunk_subject_expansion_|chunk_grade10_lazy_wave86s\.)/;
const GRADE10_SUBJECT_RE = /^(grade10_subject_.*_wave86s|grade10_subject_oly_(logic|cross|traps|deep)_wave87c)\.[a-f0-9]{10}\.js$/;
const errors = [];
function assert(cond, message){ if (!cond) errors.push(message); }
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function parseScripts(htmlFile){
  const html = read(htmlFile);
  return [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map(m => m[1].replace(/^\.\//, ''));
}
function selectedScriptsForGrade(grade){
  const scripts = parseScripts(`grade${grade}_v2.html`).filter(src => INCLUDE_RE.test('/' + src));
  if (grade === 10) {
    const dir = path.join(ROOT, 'assets/js');
    const subjectChunks = fs.readdirSync(dir)
      .filter(name => GRADE10_SUBJECT_RE.test(name))
      .map(name => 'assets/js/' + name)
      .sort((a, b) => {
        const at = /grade10_subject_oly_(logic|cross|traps|deep)_wave87c/.test(a);
        const bt = /grade10_subject_oly_(logic|cross|traps|deep)_wave87c/.test(b);
        if (at !== bt) return at ? 1 : -1;
        return a.localeCompare(b);
      });
    const lazyIndex = scripts.findIndex(src => /chunk_grade10_lazy_wave86s\./.test(src));
    if (lazyIndex >= 0) scripts.splice(lazyIndex + 1, 0, ...subjectChunks);
    else scripts.push(...subjectChunks);
  }
  return [...new Set(scripts)];
}
function makeClassList(){ return { add(){}, remove(){}, contains(){ return false; }, toggle(){ return false; } }; }
function makeElement(tag){
  return {
    tagName: String(tag || 'div').toUpperCase(),
    style: {}, dataset: {}, children: [], attributes: {}, classList: makeClassList(),
    appendChild(child){ this.children.push(child); child.parentNode = this; return child; },
    insertAdjacentElement(){}, insertAdjacentHTML(){},
    remove(){},
    setAttribute(k, v){ this.attributes[k] = String(v); },
    getAttribute(k){ return Object.prototype.hasOwnProperty.call(this.attributes, k) ? this.attributes[k] : null; },
    addEventListener(){}, removeEventListener(){},
    querySelector(){ return null; }, querySelectorAll(){ return []; }, closest(){ return null; },
    animate(){ return { onfinish: null }; },
    get innerHTML(){ return this._innerHTML || ''; },
    set innerHTML(v){ this._innerHTML = String(v); },
    get textContent(){ return this._textContent || ''; },
    set textContent(v){ this._textContent = String(v); },
    focus(){}
  };
}
function makeContext(grade){
  const store = Object.create(null);
  const document = {
    readyState: 'complete',
    currentScript: null,
    head: makeElement('head'),
    body: makeElement('body'),
    documentElement: makeElement('html'),
    createElement: makeElement,
    createTextNode(text){ return { nodeType: 3, textContent: String(text) }; },
    addEventListener(){}, removeEventListener(){},
    querySelector(){ return null; }, querySelectorAll(){ return []; },
    getElementById(){ return null; }
  };
  const ctx = {
    console: { log(){}, warn(){}, error(){}, info(){} },
    Math, Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError,
    parseInt, parseFloat, isFinite, isNaN, encodeURIComponent, decodeURIComponent,
    Promise,
    setTimeout(){ return 0; }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){}, requestAnimationFrame(){ return 0; }, cancelAnimationFrame(){},
    document,
    navigator: { vibrate(){}, clipboard: { writeText(){ return Promise.resolve(); } }, share(){ return Promise.resolve(); } },
    localStorage: {
      getItem(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem(k, v){ store[k] = String(v); }, removeItem(k){ delete store[k]; }, clear(){ Object.keys(store).forEach(k => delete store[k]); }
    },
    location: { href: `https://example.test/grade${grade}_v2.html`, search: '', pathname: `/grade${grade}_v2.html`, origin: 'https://example.test' },
    history: { pushState(){}, replaceState(){} },
    matchMedia(){ return { matches: false, addEventListener(){}, removeEventListener(){} }; },
    URL: { createObjectURL(){ return 'blob:mock'; }, revokeObjectURL(){} },
    Blob: function Blob(parts, opts){ this.parts = parts; this.opts = opts; },
    fetch(){ return Promise.reject(new Error('network disabled in theory audit')); },
    GRADE_NUM: String(grade),
    PROG: {}, DAILY: {}, STR: { badges: [] }, BADGES: [],
    openSubj(){}, ans(){}, checkBadges(){}, confetti(){}, cS: null, cT: null
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.globalThis = ctx;
  ctx.addEventListener = function(){};
  ctx.removeEventListener = function(){};
  return vm.createContext(ctx);
}
function runScript(ctx, rel){
  const file = path.join(ROOT, rel);
  if (!exists(rel)) throw new Error(`missing script ${rel}`);
  ctx.document.currentScript = { src: './' + rel, dataset: {} };
  vm.runInContext(read(rel), ctx, { filename: rel, timeout: 1000 });
}
function stripTags(html){
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function theoryStats(subjects){
  let subjectsCount = Array.isArray(subjects) ? subjects.length : 0;
  let topics = 0;
  let withTheory = 0;
  let missing = 0;
  let fallback = 0;
  for (const subject of Array.isArray(subjects) ? subjects : []) {
    for (const topic of Array.isArray(subject && subject.tops) ? subject.tops : []) {
      topics += 1;
      const hasTheory = !!stripTags(topic && topic.th);
      if (hasTheory) withTheory += 1;
      else missing += 1;
      if (topic && topic.__wave89aTheoryFallback) fallback += 1;
    }
  }
  return { subjects: subjectsCount, topics, withTheory, missing, fallback };
}

const manifest = JSON.parse(read('assets/asset-manifest.json'));
const builtFeatures = manifest.assets['assets/js/bundle_grade_runtime_features_wave87n.js'];
const builtBoosters = manifest.assets['assets/js/bundle_boosters.js'];
assert(builtFeatures, 'asset-manifest: missing bundle_grade_runtime_features_wave87n.js');
assert(builtBoosters, 'asset-manifest: missing bundle_boosters.js');
if (builtFeatures) {
  const featuresCode = read(builtFeatures);
  assert(featuresCode.includes('Теория в разработке'), 'runtime features built asset: missing theory-development fallback stub');
  assert(featuresCode.includes('__wave89aTheoryFallback'), 'runtime features built asset: missing fallback marker wiring');
}
if (builtBoosters) {
  const boostersCode = read(builtBoosters);
  assert(boostersCode.includes('__wave89aEnglishTheoryCoverage'), 'bundle_boosters built asset: missing English theory coverage export');
}

const reports = [];
for (let grade = 1; grade <= 11; grade += 1) {
  const ctx = makeContext(grade);
  const loadErrors = [];
  for (const src of selectedScriptsForGrade(grade)) {
    try { runScript(ctx, src); }
    catch (err) { loadErrors.push({ script: src, error: err && err.message || String(err) }); }
  }
  const subjectsBefore = ctx.window.SUBJ || ctx.SUBJ || [];
  const before = theoryStats(subjectsBefore);
  try { runScript(ctx, 'assets/_src/js/chunk_roadmap_wave86r_theory_achievements.js'); }
  catch (err) { loadErrors.push({ script: 'assets/_src/js/chunk_roadmap_wave86r_theory_achievements.js', error: err && err.message || String(err) }); }
  const subjectsAfter = ctx.window.SUBJ || ctx.SUBJ || [];
  const after = theoryStats(subjectsAfter);
  const runtimeAudit = ctx.window.wave86rTheoryAchievements && typeof ctx.window.wave86rTheoryAchievements.auditSnapshot === 'function'
    ? ctx.window.wave86rTheoryAchievements.auditSnapshot()
    : null;

  assert(loadErrors.length === 0, `grade${grade}: script load errors detected`);
  assert(after.missing === 0, `grade${grade}: missing theory remains after normalization (${after.missing})`);
  if (runtimeAudit) {
    assert(runtimeAudit.missingTheory === 0, `grade${grade}: wave86r runtime audit reports missingTheory=${runtimeAudit.missingTheory}`);
  } else {
    errors.push(`grade${grade}: wave86r runtime audit export missing`);
  }

  let english10 = null;
  let coverage = null;
  if (grade === 10) {
    english10 = (subjectsAfter || []).find(subject => subject && subject.id === 'eng') || null;
    coverage = ctx.window.__wave89aEnglishTheoryCoverage || null;
    const englishStats = theoryStats(english10 ? [english10] : []);
    assert(!!english10, 'grade10: English subject missing after content assembly');
    if (english10) {
      assert(englishStats.topics >= 19, `grade10 English: expected at least 19 topics after all injections, got ${englishStats.topics}`);
      assert(englishStats.withTheory === englishStats.topics, `grade10 English: every injected topic should have theory, got ${englishStats.withTheory}/${englishStats.topics}`);
      assert(englishStats.fallback === 0, `grade10 English: fallback theory should not be needed, got ${englishStats.fallback}`);
    }
    assert(!!coverage, 'grade10: __wave89aEnglishTheoryCoverage export missing');
    if (coverage) {
      assert(Number(coverage.totalTopics || 0) === 19, `grade10 English coverage export: expected totalTopics=19, got ${coverage.totalTopics}`);
      assert(Number(coverage.withTheory || 0) === 19, `grade10 English coverage export: expected withTheory=19, got ${coverage.withTheory}`);
      assert(Number(coverage.fallbackTopics || 0) === 0, `grade10 English coverage export: expected fallbackTopics=0, got ${coverage.fallbackTopics}`);
    }
    reports.push({
      grade,
      before,
      after,
      loadErrors,
      runtimeAudit,
      english10: english10 ? {
        topics: theoryStats([english10]).topics,
        withTheory: theoryStats([english10]).withTheory,
        fallback: theoryStats([english10]).fallback,
        ids: (english10.tops || []).map(topic => topic.id)
      } : null,
      coverage
    });
    continue;
  }
  reports.push({ grade, before, after, loadErrors, runtimeAudit });
}

const totals = reports.reduce((acc, row) => {
  acc.beforeMissing += Number(row.before && row.before.missing || 0);
  acc.afterMissing += Number(row.after && row.after.missing || 0);
  acc.fallbackTopics += Number(row.after && row.after.fallback || 0);
  acc.topics += Number(row.after && row.after.topics || 0);
  acc.loadErrors += Array.isArray(row.loadErrors) ? row.loadErrors.length : 0;
  return acc;
}, { beforeMissing: 0, afterMissing: 0, fallbackTopics: 0, topics: 0, loadErrors: 0 });

const report = {
  ok: errors.length === 0,
  totals,
  grades: reports,
  errors
};
console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
