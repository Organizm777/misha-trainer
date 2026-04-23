#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const EXPECTED = {
  eng: ['reading11_wave87j', 'essay11_wave87j'],
  his: ['source11_wave87j', 'culture11_wave87j'],
  lit: ['drama11_wave87j', 'warprose11_wave87j'],
  bio: ['biotech11_wave87j'],
  inf: ['encode11_wave87j'],
  rus: ['argument11_wave87j'],
  geog: ['globalgeo11_wave87j']
};
const EXPECTED_BANK_ROWS = Object.values(EXPECTED).flat().length * 15;
const GENERIC_RE = /Выбери понятие|Что означает|Какое понятие относится к теме|Выбери верную пару по теме/;
const INCLUDE_RE = /\/assets\/js\/(grade\d+_data\.|bundle_boosters\.|chunk_grade_content_|chunk_subject_expansion_|chunk_grade10_lazy_wave86s\.)/;
const GRADE10_SUBJECT_RE = /^(grade10_subject_.*_wave86s|grade10_subject_oly_(logic|cross|traps|deep)_wave87c)\.[a-f0-9]{10}\.js$/;

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function parseScripts(htmlFile){
  const html = read(htmlFile);
  return [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map(m => m[1].replace(/^\.\//, '')).filter(src => INCLUDE_RE.test('/' + src));
}
function selectedScriptsForGrade(grade){
  const scripts = parseScripts(`grade${grade}_v2.html`);
  if (grade === 10) {
    const subjectChunks = fs.readdirSync(path.join(ROOT, 'assets/js'))
      .filter(name => GRADE10_SUBJECT_RE.test(name))
      .map(name => 'assets/js/' + name)
      .sort((a, b) => {
        const aOly = /grade10_subject_oly_(logic|cross|traps|deep)_wave87c/.test(a);
        const bOly = /grade10_subject_oly_(logic|cross|traps|deep)_wave87c/.test(b);
        if (aOly !== bOly) return aOly ? 1 : -1;
        return a.localeCompare(b);
      });
    const idx = scripts.findIndex(s => /chunk_grade10_lazy_wave86s\./.test(s));
    if (idx >= 0) scripts.splice(idx + 1, 0, ...subjectChunks); else scripts.push(...subjectChunks);
  }
  return [...new Set(scripts)];
}
function makeRandom(seed){ let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0x100000000); }
function classList(){ return { add(){}, remove(){}, contains(){ return false; }, toggle(){ return false; } }; }
function elem(tag='div'){
  return { tagName:String(tag).toUpperCase(), style:{}, dataset:{}, children:[], attributes:{}, classList:classList(),
    appendChild(child){ this.children.push(child); return child; }, remove(){},
    setAttribute(k,v){ this.attributes[k] = String(v); }, getAttribute(k){ return this.attributes[k] || null; },
    addEventListener(){}, removeEventListener(){}, closest(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; },
    animate(){ return { onfinish:null }; },
    get innerHTML(){ return this._innerHTML || ''; }, set innerHTML(v){ this._innerHTML = String(v); },
    get textContent(){ return this._textContent || ''; }, set textContent(v){ this._textContent = String(v); }
  };
}
function makeContext(grade){
  const store = Object.create(null);
  const math = Object.create(Math); math.random = makeRandom(0x87_11_0 + grade);
  const document = { currentScript:null, head:elem('head'), body:elem('body'), documentElement:elem('html'),
    createElement:elem, createTextNode(text){ return { nodeType:3, textContent:String(text) }; },
    addEventListener(){}, removeEventListener(){}, querySelector(){ return null; }, querySelectorAll(){ return []; }, getElementById(){ return elem('div'); }
  };
  const ctx = { console:{ log(){}, warn(){}, error(){}, info(){} }, Math:math, Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError,
    parseInt, parseFloat, isFinite, isNaN, encodeURIComponent, decodeURIComponent,
    setTimeout(){ return 0; }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){}, Promise, document,
    localStorage:{ getItem(k){ return Object.prototype.hasOwnProperty.call(store,k) ? store[k] : null; }, setItem(k,v){ store[k] = String(v); }, removeItem(k){ delete store[k]; }, clear(){ Object.keys(store).forEach(k => delete store[k]); } },
    navigator:{ vibrate(){}, clipboard:{ writeText(){ return Promise.resolve(); } }, share(){ return Promise.resolve(); } },
    location:{ href:`https://example.test/grade${grade}_v2.html`, search:'', pathname:`/grade${grade}_v2.html`, origin:'https://example.test' }, history:{ pushState(){}, replaceState(){} },
    matchMedia(){ return { matches:false, addEventListener(){}, removeEventListener(){} }; },
    URL:{ createObjectURL(){ return 'blob:mock'; }, revokeObjectURL(){} }, Blob:function Blob(parts, opts){ this.parts=parts; this.opts=opts; },
    fetch(){ return Promise.reject(new Error('network disabled')); }, GRADE_NUM:String(grade)
  };
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx; ctx.addEventListener = function(){}; ctx.removeEventListener = function(){};
  return vm.createContext(ctx);
}
const HELPERS = `
const shuffle = o => { const a = [...(o || [])]; for (let i = a.length - 1; i > 0; i--) { const j = 0 | Math.random() * (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = o => (o && o.length ? o[0 | Math.random() * o.length] : undefined);
const range = (a,b) => { const r=[]; for(let i=a;i<=b;i++) r.push(i); return r; };
const uniq = o => (o || []).filter((v, i, arr) => arr.indexOf(v) === i);
const esc = o => (o + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const sub = o => (o + '').split('').map(ch => '₀₁₂₃₄₅₆₇₈₉₊₋'['0123456789+-'.indexOf(ch)] || ch).join('');
const sup = o => (o + '').split('').map(ch => '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻'['0123456789+-'.indexOf(ch)] || ch).join('');
function prepareOptions(options, answer){ let list = uniq([answer].concat(Array.isArray(options) ? options : []).filter(v => v !== undefined && v !== null).map(v => String(v))); while(list.length < 4) list.push('вариант ' + list.length); return shuffle(list.slice(0,4)); }
function mkQ(q, a, o, h, tag, color, bg, code, isMath, ex){ const row = { question:q, answer:String(a == null ? '' : a), options:prepareOptions(o, a), hint:h, tag, color, bg, code:code || null, isMath:!!isMath }; if (ex) row.ex = String(ex); return row; }
function fillW(answer, gens){ return prepareOptions((gens || []).map(fn => { try { return typeof fn === 'function' ? fn() : fn; } catch(e){ return '?'; } }), answer); }
function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ const t=b; b=a%b; a=t; } return a; }
`;
function runScript(ctx, rel){
  if (!fs.existsSync(path.join(ROOT, rel))) throw new Error(`missing script ${rel}`);
  ctx.document.currentScript = { src:'./' + rel, dataset:{} };
  vm.runInContext(read(rel), ctx, { filename:rel, timeout:2000 });
}
function loadGrade(grade){
  const ctx = makeContext(grade);
  vm.runInContext(HELPERS, ctx, { filename:'wave87j-audit-helpers.js', timeout:1000 });
  const loadErrors = [];
  for (const script of selectedScriptsForGrade(grade)) {
    try { runScript(ctx, script); } catch (err) { loadErrors.push({ script, error: err?.message || String(err) }); }
  }
  return { ctx, loadErrors };
}
function normalize(row){
  if (!row || typeof row !== 'object') return null;
  const question = String(row.question ?? row.q ?? row.text ?? '').trim();
  const answer = String(row.answer ?? row.a ?? '').trim();
  const options = Array.isArray(row.options ?? row.o) ? (row.options ?? row.o).map(v => String(v ?? '').trim()).filter(Boolean) : [];
  const ex = String(row.ex ?? '').trim();
  return { question, answer, options, ex };
}
function assertHashedReference(){
  const src = 'assets/_src/js/chunk_subject_expansion_wave86m_gap_balance_grade11_wave87d.js';
  const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, src))).digest('hex').slice(0, 10);
  const built = `assets/js/chunk_subject_expansion_wave86m_gap_balance_grade11_wave87d.${hash}.js`;
  return {
    hash,
    built,
    builtExists: fs.existsSync(path.join(ROOT, built)),
    htmlReferencesBuilt: read('grade11_v2.html').includes(built),
    swReferencesBuilt: read('sw.js').includes('./' + built),
    manifestReferencesBuilt: read('assets/asset-manifest.json').includes(built)
  };
}
function main(){
  const g10 = loadGrade(10);
  const g11 = loadGrade(11);
  const failures = [];
  const sample = [];
  const ctx11 = g11.ctx;
  const subj11 = ctx11.window.SUBJ || [];
  const subjectCounts11 = Object.fromEntries(subj11.map(s => [s.id, ((s.tops || []).length || 0)]));
  for (const [subjectId, topicIds] of Object.entries(EXPECTED)) {
    const subject = subj11.find(s => s && s.id === subjectId);
    if (!subject) { failures.push({ subject:subjectId, error:'missing subject' }); continue; }
    for (const topicId of topicIds) {
      const topic = (subject.tops || []).find(t => t && t.id === topicId);
      if (!topic) { failures.push({ subject:subjectId, topic:topicId, error:'missing topic' }); continue; }
      if (typeof topic.gen !== 'function') { failures.push({ subject:subjectId, topic:topicId, error:'missing gen' }); continue; }
      const seen = new Set();
      for (let i=0; i<15; i++) {
        const row = normalize(topic.gen());
        if (!row) { failures.push({ subject:subjectId, topic:topicId, sample:i+1, error:'empty question' }); continue; }
        const unique = new Set(row.options);
        if (!row.question || !row.answer || row.options.length < 4 || unique.size !== row.options.length || !unique.has(row.answer) || !row.ex) {
          failures.push({ subject:subjectId, topic:topicId, sample:i+1, error:'invalid row', row });
        }
        if (GENERIC_RE.test(row.question)) failures.push({ subject:subjectId, topic:topicId, sample:i+1, error:'generic facts stem leaked', question:row.question });
        seen.add(row.question);
        if (sample.length < 14) sample.push({ subject:subjectId, topic:topicId, question:row.question, answer:row.answer });
      }
      if (seen.size < 5) failures.push({ subject:subjectId, topic:topicId, error:'too few unique sampled questions', unique:seen.size });
    }
  }
  const snap = ctx11.window.wave87jGrade11Depth?.auditSnapshot?.() || null;
  if (!snap) failures.push({ error:'missing wave87jGrade11Depth auditSnapshot' });
  if (snap && snap.total !== EXPECTED_BANK_ROWS) failures.push({ error:'unexpected bank total', total:snap.total, expected:EXPECTED_BANK_ROWS });
  const totalTopics11 = subj11.reduce((sum, s) => sum + ((s.tops || []).length || 0), 0);
  const subj10 = g10.ctx.window.SUBJ || [];
  const totalTopics10 = subj10.reduce((sum, s) => sum + ((s.tops || []).length || 0), 0);
  if (totalTopics10 !== totalTopics11) failures.push({ error:'grade10/11 total topics mismatch', grade10:totalTopics10, grade11:totalTopics11 });
  const expectedCounts = { eng:15, his:5, lit:5, bio:5, inf:5, rus:8, geog:5 };
  for (const [id, count] of Object.entries(expectedCounts)) {
    if ((subjectCounts11[id] || 0) !== count) failures.push({ error:'unexpected subject topic count', subject:id, actual:subjectCounts11[id] || 0, expected:count });
  }
  const ref = assertHashedReference();
  if (!ref.builtExists || !ref.htmlReferencesBuilt || !ref.swReferencesBuilt || !ref.manifestReferencesBuilt) failures.push({ error:'hashed reference mismatch', ref });
  const output = {
    ok: g10.loadErrors.length === 0 && g11.loadErrors.length === 0 && failures.length === 0,
    wave:'wave87j',
    grade10:{ subjects:subj10.length, topics:totalTopics10 },
    grade11:{ subjects:subj11.length, topics:totalTopics11, subjectTopicCounts:subjectCounts11 },
    expectedTopicRows:EXPECTED_BANK_ROWS,
    snapshot:snap,
    references:ref,
    loadErrors:{ grade10:g10.loadErrors, grade11:g11.loadErrors },
    failures,
    sample
  };
  console.log(JSON.stringify(output, null, 2));
  process.exit(output.ok ? 0 : 1);
}
main();
