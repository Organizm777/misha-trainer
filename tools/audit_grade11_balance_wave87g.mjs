#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const GRADE = 11;
const EXPECTED = {
  art: ['art11_modern_wave87g', 'art11_rus_wave87g', 'art11_media_wave87g', 'art11_theatre_wave87g'],
  oly: ['oly11_logic_wave87g', 'oly11_inter_wave87g', 'oly11_research_wave87g', 'oly11_strategy_wave87g']
};
const GENERIC_RE = /Выбери понятие|Что означает|Какое понятие относится к теме|Выбери верную пару по теме/;
const INCLUDE_RE = /\/assets\/js\/(grade\d+_data\.|bundle_boosters\.|chunk_grade_content_|chunk_subject_expansion_)/;

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function parseScripts(htmlFile){
  const html = read(htmlFile);
  return [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map(m => m[1].replace(/^\.\//, '')).filter(src => INCLUDE_RE.test('/' + src));
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
function makeContext(){
  const store = Object.create(null);
  const math = Object.create(Math); math.random = makeRandom(0x870011);
  const document = { currentScript:null, head:elem('head'), body:elem('body'), documentElement:elem('html'),
    createElement:elem, createTextNode(text){ return { nodeType:3, textContent:String(text) }; },
    addEventListener(){}, removeEventListener(){}, querySelector(){ return null; }, querySelectorAll(){ return []; }, getElementById(){ return elem('div'); }
  };
  const ctx = { console:{ log(){}, warn(){}, error(){}, info(){} }, Math:math, Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError,
    parseInt, parseFloat, isFinite, isNaN, encodeURIComponent, decodeURIComponent,
    setTimeout(){ return 0; }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){}, Promise, document,
    localStorage:{ getItem(k){ return Object.prototype.hasOwnProperty.call(store,k) ? store[k] : null; }, setItem(k,v){ store[k] = String(v); }, removeItem(k){ delete store[k]; }, clear(){ Object.keys(store).forEach(k => delete store[k]); } },
    navigator:{ vibrate(){}, clipboard:{ writeText(){ return Promise.resolve(); } }, share(){ return Promise.resolve(); } },
    location:{ href:'https://example.test/grade11_v2.html', search:'', pathname:'/grade11_v2.html', origin:'https://example.test' }, history:{ pushState(){}, replaceState(){} },
    matchMedia(){ return { matches:false, addEventListener(){}, removeEventListener(){} }; },
    URL:{ createObjectURL(){ return 'blob:mock'; }, revokeObjectURL(){} }, Blob:function Blob(parts, opts){ this.parts=parts; this.opts=opts; },
    fetch(){ return Promise.reject(new Error('network disabled')); }, GRADE_NUM:'11'
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
  vm.runInContext(read(rel), ctx, { filename:rel, timeout:1500 });
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
  const ctx = makeContext();
  vm.runInContext(HELPERS, ctx, { filename:'wave87g-audit-helpers.js', timeout:1000 });
  const loadErrors = [];
  for (const script of parseScripts('grade11_v2.html')) {
    try { runScript(ctx, script); } catch (err) { loadErrors.push({ script, error: err?.message || String(err) }); }
  }
  const subj = ctx.window.SUBJ || [];
  const subjects = Object.fromEntries(subj.map(s => [s.id, { name:s.nm, topics:(s.tops || []).map(t => t.id) }]));
  const failures = [];
  const samples = [];
  for (const [subjectId, topicIds] of Object.entries(EXPECTED)) {
    const subject = subj.find(s => s && s.id === subjectId);
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
        if (!row.question || !row.answer || row.options.length < 4 || unique.size !== row.options.length || !unique.has(row.answer) || !row.ex) failures.push({ subject:subjectId, topic:topicId, sample:i+1, error:'invalid row', row });
        if (GENERIC_RE.test(row.question)) failures.push({ subject:subjectId, topic:topicId, sample:i+1, error:'generic facts stem leaked', question:row.question });
        seen.add(row.question);
        if (samples.length < 12) samples.push({ subject:subjectId, topic:topicId, question:row.question, answer:row.answer });
      }
      if (seen.size < 5) failures.push({ subject:subjectId, topic:topicId, error:'too few unique sampled questions', unique:seen.size });
    }
  }
  const snap = ctx.window.wave87gGrade11Balance?.auditSnapshot?.() || null;
  const expectedTopicCount = Object.values(EXPECTED).flat().length;
  const expectedQuestionRows = expectedTopicCount * 15;
  if (!snap) failures.push({ error:'missing wave87gGrade11Balance auditSnapshot' });
  if (snap && snap.total !== expectedQuestionRows) failures.push({ error:'unexpected bank total', total:snap.total, expected:expectedQuestionRows });
  const ref = assertHashedReference();
  if (!ref.builtExists || !ref.htmlReferencesBuilt || !ref.swReferencesBuilt || !ref.manifestReferencesBuilt) failures.push({ error:'hashed reference mismatch', ref });
  const output = {
    ok: loadErrors.length === 0 && failures.length === 0,
    wave:'wave87g',
    grade:GRADE,
    subjects:subj.length,
    topics:subj.reduce((sum, s) => sum + ((s.tops || []).length), 0),
    expectedSubjects:Object.keys(EXPECTED),
    expectedTopicCount,
    expectedQuestionRows,
    snapshot:snap,
    subjectTopicCounts:Object.fromEntries(Object.entries(subjects).map(([id, v]) => [id, v.topics.length])),
    hash:ref.hash,
    references:ref,
    loadErrors,
    failures,
    sample:samples
  };
  console.log(JSON.stringify(output, null, 2));
  process.exit(output.ok ? 0 : 1);
}
main();
