#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = process.cwd();

function parseScripts(htmlFile){
  const html = fs.readFileSync(path.join(ROOT, htmlFile), 'utf8');
  return [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map(m => m[1].replace(/^\.\//, ''));
}
function makeRandom(seed){
  let s = seed >>> 0;
  return function(){
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}
function makeClassList(){ return { add(){}, remove(){}, contains(){ return false; }, toggle(){ return false; } }; }
function makeElement(tag){
  return {
    tagName: String(tag || 'div').toUpperCase(),
    style: {}, dataset: {}, children: [], attributes: {}, classList: makeClassList(),
    appendChild(child){ this.children.push(child); if (child && typeof child.onload === 'function') child.onload(); return child; },
    remove(){}, setAttribute(k, v){ this.attributes[k] = String(v); }, getAttribute(k){ return this.attributes[k] || null; },
    addEventListener(){}, removeEventListener(){}, closest(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; },
    animate(){ return { onfinish: null }; },
    get innerHTML(){ return this._innerHTML || ''; }, set innerHTML(v){ this._innerHTML = String(v); },
    get textContent(){ return this._textContent || ''; }, set textContent(v){ this._textContent = String(v); }
  };
}
function makeContext(page){
  const store = Object.create(null);
  const random = makeRandom(page.includes('grade10') ? 0x8710 : 0x8711);
  const math = Object.create(Math);
  math.random = random;
  const document = {
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
    Math: math, Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError,
    parseInt, parseFloat, isFinite, isNaN, encodeURIComponent, decodeURIComponent,
    setTimeout(fn){ if (typeof fn === 'function') return 0; return 0; }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){},
    Promise, document,
    localStorage: {
      getItem(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem(k, v){ store[k] = String(v); }, removeItem(k){ delete store[k]; }, clear(){ Object.keys(store).forEach(k => delete store[k]); }
    },
    navigator: { vibrate(){}, clipboard: { writeText(){ return Promise.resolve(); } }, share(){ return Promise.resolve(); } },
    location: { href: `https://example.test/${page}`, search: '', pathname: `/${page}`, origin: 'https://example.test' },
    history: { pushState(){}, replaceState(){} },
    matchMedia(){ return { matches: false, addEventListener(){}, removeEventListener(){} }; },
    URL: { createObjectURL(){ return 'blob:mock'; }, revokeObjectURL(){} }, Blob: function Blob(parts, opts){ this.parts = parts; this.opts = opts; },
    fetch(){ return Promise.reject(new Error('network disabled in audit')); }
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.globalThis = ctx;
  ctx.addEventListener = function(){};
  ctx.removeEventListener = function(){};
  return vm.createContext(ctx);
}
const HELPERS = `
const shuffle = o => { const a = [...(o || [])]; for (let i = a.length - 1; i > 0; i--) { const j = 0 | Math.random() * (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = o => (o && o.length ? o[0 | Math.random() * o.length] : undefined);
const uniq = o => (o || []).filter((v, i, arr) => arr.indexOf(v) === i);
const esc = o => String(o == null ? '' : o);
const sub = o => String(o == null ? '' : o);
const sup = o => String(o == null ? '' : o);
function mkQ(q, a, o, h, tag, color, bg, code, isMath, ex){
  return { question: String(q), answer: String(a), options: shuffle(uniq([a].concat(o || []).map(v => String(v)))), hint: String(h || ''), tag, color, bg, code: code || null, isMath: !!isMath, ex: String(ex || '') };
}
function fillW(answer, gens){
  const list = uniq([answer].concat((gens || []).map(fn => { try { return typeof fn === 'function' ? fn() : fn; } catch (e) { return '?'; } })).map(v => String(v)));
  while (list.length < 4) list.push('вариант ' + list.length);
  return list;
}
function range(a,b){ const out = []; for (let i = a; i <= b; i++) out.push(i); return out; }
`;
function runScript(ctx, rel){
  const abs = path.join(ROOT, rel);
  ctx.document.currentScript = { src: './' + rel, dataset: {} };
  vm.runInContext(fs.readFileSync(abs, 'utf8'), ctx, { filename: rel, timeout: 1000 });
}
function normalizeQuestion(row){
  if (!row || typeof row !== 'object') return null;
  const question = String(row.question ?? row.q ?? '').trim();
  const answer = String(row.answer ?? row.a ?? '').trim();
  const options = Array.isArray(row.options ?? row.o) ? (row.options ?? row.o).map(v => String(v).trim()).filter(Boolean) : [];
  const ex = String(row.ex ?? '').trim();
  return { question, answer, options, ex };
}

function auditGrade10(){
  const ctx = makeContext('grade10_v2.html');
  vm.runInContext(HELPERS, ctx, { filename: 'helpers.js', timeout: 1000 });
  const scripts = parseScripts('grade10_v2.html').filter(src => /assets\/js\/(grade10_data\.|bundle_boosters\.|chunk_grade_content_|chunk_subject_expansion_)/.test(src));
  scripts.forEach(src => runScript(ctx, src));
  const report = ctx.window.wave87mTransition1011 && ctx.window.wave87mTransition1011.report ? ctx.window.wave87mTransition1011.report() : null;
  const subject = ctx.window.SUBJ.find(item => item && item.id === 'bridge1011');
  const samples = {};
  (subject && Array.isArray(subject.tops) ? subject.tops : []).forEach(topic => {
    const q = normalizeQuestion(topic.gen());
    samples[topic.id] = q;
  });
  const failures = [];
  if (!report) failures.push('wave87m runtime report missing on grade10');
  if (!subject) failures.push('bridge1011 subject missing on grade10');
  if (subject && subject.nm !== 'Переход 10→11') failures.push('bridge1011 subject has unexpected title');
  if (subject && subject.tops.length !== 6) failures.push(`bridge1011 topic count is ${subject.tops.length}, expected 6`);
  const expectedTopics = ['math_bridge','russian_bridge','physics_bridge','english_bridge','biology_bridge','chemistry_bridge'];
  expectedTopics.forEach(topicId => {
    if (!subject || !subject.tops.some(item => item && item.id === topicId)) failures.push(`missing topic ${topicId}`);
    const q = samples[topicId];
    if (!q || !q.question || !q.answer || q.options.length < 4 || q.options.indexOf(q.answer) === -1 || !q.ex) failures.push(`invalid sample for ${topicId}`);
  });
  if (report && Object.values(report.topicRowCounts || {}).some(count => count < 8)) failures.push('at least one topic has fewer than 8 explicit rows');
  return { report, subjectTopics: subject ? subject.tops.length : 0, samples, failures };
}

function auditDiagnostic(){
  const ctx = makeContext('diagnostic.html');
  const scripts = parseScripts('diagnostic.html').filter(src => src.startsWith('assets/js/inline_diagnostic_1_') ||
    src.startsWith('assets/js/inline_diagnostic_2_') ||
    /assets\/js\/(bundle_diagnostic_tools\.|chunk_subject_expansion_wave31_|chunk_subject_expansion_wave32_|chunk_subject_expansion_wave33_|chunk_subject_expansion_wave38_|chunk_subject_expansion_wave56_|chunk_subject_expansion_wave57_|chunk_subject_expansion_wave58_|chunk_subject_expansion_wave59_|chunk_subject_expansion_wave60_|chunk_subject_expansion_wave61_|chunk_grade_content_wave87m_transition_1011|chunk_subject_expansion_wave63_)/.test(src));
  scripts.forEach(src => runScript(ctx, src));
  const report = ctx.window.wave87mTransition1011 && ctx.window.wave87mTransition1011.report ? ctx.window.wave87mTransition1011.report() : null;
  const counts = vm.runInContext(`({
    algebra: (QBANK.algebra || []).filter(row => row && row.src === 'wave87m').length,
    geometry: (QBANK.geometry || []).filter(row => row && row.src === 'wave87m').length,
    russian: (QBANK.russian || []).filter(row => row && row.src === 'wave87m').length,
    physics: (QBANK.physics || []).filter(row => row && row.src === 'wave87m').length,
    english: (QBANK.english || []).filter(row => row && row.src === 'wave87m').length,
    biology: (QBANK.biology || []).filter(row => row && row.src === 'wave87m').length,
    chemistry: (QBANK.chemistry || []).filter(row => row && row.src === 'wave87m').length
  })`, ctx, { timeout: 1000 });
  const failures = [];
  if (!report) failures.push('wave87m runtime report missing on diagnostic');
  const expectedMinimums = { algebra: 6, geometry: 2, russian: 8, physics: 8, english: 8, biology: 8, chemistry: 8 };
  Object.entries(expectedMinimums).forEach(([key, min]) => {
    if ((counts[key] || 0) < min) failures.push(`${key} diagnostic rows = ${counts[key] || 0}, expected at least ${min}`);
  });
  return { report, counts, failures };
}

const grade10 = auditGrade10();
const diagnostic = auditDiagnostic();
const output = {
  ok: grade10.failures.length === 0 && diagnostic.failures.length === 0,
  wave: 'wave87m',
  grade10,
  diagnostic
};
console.log(JSON.stringify(output, null, 2));
process.exit(output.ok ? 0 : 1);
