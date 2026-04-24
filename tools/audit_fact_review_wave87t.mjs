#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = process.cwd();
const SAMPLE_PER_GRADE = Number(process.env.SAMPLE_PER_GRADE || 50);
const TARGET_RUNS = Number(process.env.TARGET_RUNS || 40);
const GRADE_PAGES = Array.from({ length: 11 }, (_, i) => `grade${i + 1}_v2.html`);
const INCLUDE_RE = /\/assets\/js\/(grade\d+_data\.|bundle_boosters\.|chunk_grade_content_|chunk_subject_expansion_|chunk_grade10_lazy_wave86s\.)/;
const GRADE10_SUBJECT_RE = /^(grade10_subject_.*_wave86s|grade10_subject_oly_(logic|cross|traps|deep)_wave87c)\.[a-f0-9]{10}\.js$/;
const LATIN_ONLY_ANSWER_RE = /^(?=.*[a-z])[A-Za-z][A-Za-z -]{2,}$/;
const PRIMARY_DECIMAL_RE = /\d+[.,]\d{4,}/;
const ALLOW_LATIN_ONLY_SUBJECTS = new Set(['eng', 'inf']);

function parseScripts(htmlFile) {
  const html = fs.readFileSync(path.join(ROOT, htmlFile), 'utf8');
  return [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map(m => m[1].replace(/^\.\//, ''));
}

function makeRandom(seed) {
  let s = seed >>> 0;
  return function random() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function makeClassList() {
  return { add() {}, remove() {}, contains() { return false; }, toggle() { return false; } };
}

function makeElement(tag) {
  return {
    tagName: String(tag || 'div').toUpperCase(),
    style: {}, dataset: {}, children: [], attributes: {}, classList: makeClassList(),
    appendChild(child) { this.children.push(child); if (child && typeof child.onload === 'function') setTimeout(child.onload, 0); return child; },
    remove() {}, setAttribute(k, v) { this.attributes[k] = String(v); }, getAttribute(k) { return this.attributes[k] || null; },
    addEventListener() {}, removeEventListener() {}, closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
    animate() { return { onfinish: null }; },
    get innerHTML() { return this._innerHTML || ''; }, set innerHTML(v) { this._innerHTML = String(v); },
    get textContent() { return this._textContent || ''; }, set textContent(v) { this._textContent = String(v); }
  };
}

function makeContext(grade) {
  const store = Object.create(null);
  const random = makeRandom(0x87f000 + grade);
  const math = Object.create(Math);
  math.random = random;
  const document = {
    currentScript: null,
    head: makeElement('head'), body: makeElement('body'), documentElement: makeElement('html'),
    createElement: makeElement,
    createTextNode(text) { return { nodeType: 3, textContent: String(text) }; },
    addEventListener() {}, removeEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, getElementById() { return makeElement('div'); }
  };
  const ctx = {
    console: { log() {}, warn() {}, error() {}, info() {} },
    Math: math, Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError,
    parseInt, parseFloat, isFinite, isNaN, encodeURIComponent, decodeURIComponent,
    setTimeout(fn) { if (typeof fn === 'function') return 0; return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    Promise, document,
    localStorage: {
      getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; }, clear() { Object.keys(store).forEach(k => delete store[k]); }
    },
    navigator: { vibrate() {}, clipboard: { writeText() { return Promise.resolve(); } }, share() { return Promise.resolve(); } },
    location: { href: `https://example.test/grade${grade}_v2.html`, search: '', pathname: `/grade${grade}_v2.html`, origin: 'https://example.test' },
    history: { pushState() {}, replaceState() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {} }; },
    URL: { createObjectURL() { return 'blob:mock'; }, revokeObjectURL() {} }, Blob: function Blob(parts, opts) { this.parts = parts; this.opts = opts; },
    fetch() { return Promise.reject(new Error('network disabled in audit')); },
    GRADE_NUM: String(grade)
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.globalThis = ctx;
  ctx.addEventListener = function() {};
  ctx.removeEventListener = function() {};
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
function makeOptionFillers(question, answer){
  const base = String(answer == null ? '' : answer), out = [];
  function add(v){ v = String(v); if (v && v !== base && !out.includes(v)) out.push(v); }
  const n = Number(base.replace(',', '.'));
  if (isFinite(n) && base.trim() !== '') { [-2,-1,1,2,3].forEach(d => add(String(n + d))); if (n % 1) [-0.1,0.1,0.5,-0.5].forEach(d => add(String(+(n + d).toFixed(2)))); }
  ['нельзя определить','оба варианта','нет правильного ответа','неверно','верно','другое значение','зависит от условия'].forEach(add);
  return out;
}
function prepareOptions(options, answer, question){
  let list = uniq([answer].concat(Array.isArray(options) ? options : []).filter(v => v !== undefined && v !== null).map(v => String(v)));
  if (!list.includes(String(answer))) list.unshift(String(answer));
  const fillers = makeOptionFillers(question, answer);
  for (let i = 0; list.length < 4 && i < fillers.length; i++) if (!list.includes(fillers[i])) list.push(fillers[i]);
  for (let i = 1; list.length < 4; i++) { const v = 'вариант ' + i; if (!list.includes(v)) list.push(v); }
  return shuffle(list.slice(0,4));
}
function mkQ(q, a, o, h, tag, color, bg, code, isMath, ex){
  const row = { question: q, answer: String(a == null ? '' : a), options: prepareOptions(o, a, q), hint: h, tag: tag, color: color, bg: bg, code: code || null, isMath: !!isMath };
  if (ex) row.ex = String(ex);
  return row;
}
function fillW(answer, gens){
  let list = uniq([answer].concat((gens || []).map(fn => { try { return typeof fn === 'function' ? fn() : fn; } catch (e) { return '?'; } })).map(v => String(v)));
  let n = 0;
  while (list.length < 4 && n++ < 10) (gens || []).forEach(fn => { try { const v = typeof fn === 'function' ? fn() : fn; if (!list.includes(String(v))) list.push(String(v)); } catch (e) {} });
  while (list.length < 4) list.push(String(pick(range(0, 50))));
  return list;
}
function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ const t=b; b=a%b; a=t; } return a; }
`;

function runScript(ctx, rel) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error(`missing script ${rel}`);
  ctx.document.currentScript = { src: './' + rel, dataset: {} };
  const code = fs.readFileSync(file, 'utf8');
  vm.runInContext(code, ctx, { filename: rel, timeout: 1000 });
}

function selectedScriptsForGrade(grade) {
  const page = `grade${grade}_v2.html`;
  const scripts = parseScripts(page).filter(src => INCLUDE_RE.test('/' + src));
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
    const lazyIndex = scripts.findIndex(s => /chunk_grade10_lazy_wave86s\./.test(s));
    if (lazyIndex >= 0) scripts.splice(lazyIndex + 1, 0, ...subjectChunks);
    else scripts.push(...subjectChunks);
  }
  return [...new Set(scripts)];
}

function normalizeQuestion(q) {
  if (Array.isArray(q)) {
    const [question, answer, ...rest] = q;
    const hint = rest.length ? rest[rest.length - 1] : '';
    const opts = rest.slice(0, 3).map(v => typeof v === 'function' ? v() : v);
    return { question, answer, options: [answer, ...opts], hint, ex: '' };
  }
  if (!q || typeof q !== 'object') return null;
  let options = q.options ?? q.o ?? q.opts ?? [];
  if (!Array.isArray(options)) options = [];
  options = options.map(v => typeof v === 'function' ? v() : v);
  return {
    question: q.question ?? q.q ?? q.text ?? '',
    answer: q.answer ?? q.a ?? '',
    options,
    hint: q.hint ?? q.h ?? '',
    ex: q.ex ?? ''
  };
}

function cleanText(v) {
  return String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
}

function loadGrade(grade) {
  const ctx = makeContext(grade);
  vm.runInContext(HELPERS, ctx, { filename: 'fact-audit-helpers.js', timeout: 1000 });
  const scripts = selectedScriptsForGrade(grade);
  const loadErrors = [];
  for (const src of scripts) {
    try { runScript(ctx, src); }
    catch (err) { loadErrors.push({ script: src, error: err && err.message || String(err) }); }
  }
  const subjects = ctx.window.SUBJ || ctx.SUBJ || [];
  return { ctx, scripts, subjects, loadErrors };
}

function collectRoundRobinSamples(grade, subjects, count) {
  const topics = [];
  for (const subject of subjects) {
    const subjectId = subject && subject.id || '?';
    const tops = Array.isArray(subject && subject.tops) ? subject.tops : [];
    for (const topic of tops) {
      if (topic && typeof topic.gen === 'function') {
        topics.push({ subjectId, subjectName: subject.nm || subjectId, topicId: topic.id || '?', topicName: topic.nm || topic.id || '?', gen: topic.gen });
      }
    }
  }
  const out = [];
  const topicErrors = [];
  if (!topics.length) return { samples: out, topicErrors };
  let cursor = 0;
  let safety = 0;
  while (out.length < count && safety++ < topics.length * Math.max(4, Math.ceil(count / Math.max(1, topics.length)) + 4)) {
    const topic = topics[cursor % topics.length];
    cursor++;
    try {
      const row = normalizeQuestion(topic.gen());
      if (!row) throw new Error('generator returned empty row');
      out.push({
        grade,
        subjectId: topic.subjectId,
        subjectName: topic.subjectName,
        topicId: topic.topicId,
        topicName: topic.topicName,
        question: cleanText(row.question),
        answer: cleanText(row.answer),
        hint: cleanText(row.hint),
        ex: cleanText(row.ex)
      });
    } catch (err) {
      topicErrors.push({ grade, subjectId: topic.subjectId, topicId: topic.topicId, error: err && err.message || String(err) });
    }
  }
  return { samples: out, topicErrors };
}

function findTopic(subjects, subjectId, topicId) {
  for (const subject of subjects) {
    if ((subject && subject.id) !== subjectId) continue;
    for (const topic of (subject && Array.isArray(subject.tops) ? subject.tops : [])) {
      if ((topic && topic.id) === topicId && typeof topic.gen === 'function') return topic;
    }
  }
  return null;
}

function classifyIssue(sample) {
  const issues = [];
  if (!ALLOW_LATIN_ONLY_SUBJECTS.has(sample.subjectId) && LATIN_ONLY_ANSWER_RE.test(sample.answer)) {
    issues.push('latin_only_answer');
  }
  if (/^Буквы Е, Ё, Ю, Я могут обозначать:/u.test(sample.question)) {
    issues.push('broad_yo_ya_stem');
  }
  if (/Как называется/i.test(sample.question) && (/,/.test(sample.answer) || (sample.answer.includes(' и ') && sample.answer.split(/\s+/).length >= 3))) {
    issues.push('descriptive_name_answer');
  }
  if (sample.grade <= 4 && PRIMARY_DECIMAL_RE.test(sample.answer)) {
    issues.push('long_decimal_primary');
  }
  return issues;
}

function extractBetween(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start === -1) return '';
  const end = endMarker ? text.indexOf(endMarker, start) : -1;
  return end === -1 ? text.slice(start) : text.slice(start, end);
}

function sourceGuards() {
  const out = [];
  const grade1 = fs.readFileSync(path.join(ROOT, 'assets/_src/js/grade1_data.js'), 'utf8');
  const boosters = fs.readFileSync(path.join(ROOT, 'assets/_src/js/bundle_boosters.js'), 'utf8');
  const grade5 = fs.readFileSync(path.join(ROOT, 'assets/_src/js/grade5_data.js'), 'utf8');
  const grade11 = fs.readFileSync(path.join(ROOT, 'assets/_src/js/chunk_subject_expansion_wave86m_gap_balance_grade11_wave87d.js'), 'utf8');
  const source11 = extractBetween(grade11, '"source11_wave87j": {', '}, "culture11_wave87j"');
  function assert(name, ok, detail) { out.push({ name, ok: !!ok, detail }); }
  assert('grade1_yo_ya_stem_is_scoped', grade1.includes("В начале слова буквы Е, Ё, Ю, Я могут обозначать:") && !grade1.includes("Буквы Е, Ё, Ю, Я могут обозначать:"), 'grade1_data.js should keep the scoped stem and drop the broad one');
  assert('bundle_boosters_rome_senate_stem_fixed', boosters.includes("Как назывался совет знати, игравший важную роль в Древнем Риме?") && !boosters.includes("Как назывался выборный орган власти в Древнем Риме?"), 'bundle_boosters.js should keep the corrected Roman Senate wording');
  assert('bundle_boosters_water_cycle_answer_fixed', boosters.includes("a:'круговорот воды'") && !boosters.includes("a:'испарение, облака, осадки и сток'"), 'bundle_boosters.js should answer the term, not the process description');
  assert('grade5_roman_republic_wording_fixed', grade5.includes("власть сената и выборных магистратов") && !grade5.includes("власть выборных лиц (сенат, консулы)"), 'grade5_data.js should keep the refined Roman republic wording');
  const forbiddenEnglishTerms = [
    '"author position"','"historical context"','"reliability"','"bias"','"corroboration"','"limitation"',
    '"provenance"','"purpose of source"','"intended audience"','"primary source"','"secondary source"','"tone"','"factual claim"','"interpretation"'
  ];
  assert('grade11_history_source_terms_localized', forbiddenEnglishTerms.every(term => !source11.includes(term)), 'source11_wave87j should not keep English answer labels inside the Russian history bank');
  return out;
}

function targetedChecks(gradeContexts) {
  const checks = [];
  function add(name, ok, detail) { checks.push({ name, ok: !!ok, detail }); }

  const grade4 = gradeContexts.get(4);
  if (grade4) {
    const speed = findTopic(grade4.subjects, 'math', 'speed');
    let bad = null;
    if (speed) {
      for (let i = 0; i < TARGET_RUNS; i++) {
        const row = normalizeQuestion(speed.gen());
        const answer = cleanText(row && row.answer);
        if (PRIMARY_DECIMAL_RE.test(answer)) { bad = { question: cleanText(row.question), answer }; break; }
      }
    }
    add('grade4_speed_no_long_decimals', !!speed && !bad, bad ? `Unexpected decimal answer: ${bad.answer} — ${bad.question}` : 'grade4 speed generator stayed on clean integer outputs');
  }

  const grade6 = gradeContexts.get(6);
  if (grade6) {
    const hydro = findTopic(grade6.subjects, 'geo6', 'hydro');
    let seen = null;
    if (hydro) {
      for (let i = 0; i < TARGET_RUNS; i++) {
        const row = normalizeQuestion(hydro.gen());
        const question = cleanText(row && row.question);
        if (/Как называется круговорот воды/i.test(question)) {
          seen = { question, answer: cleanText(row && row.answer) };
          break;
        }
      }
    }
    add('grade6_water_cycle_term_answer', !!seen && seen.answer === 'круговорот воды', seen ? `${seen.question} => ${seen.answer}` : 'water-cycle question not sampled in targeted run');
  }

  const grade11 = gradeContexts.get(11);
  if (grade11) {
    const source = findTopic(grade11.subjects, 'his', 'source11_wave87j');
    let bad = null;
    if (source) {
      for (let i = 0; i < TARGET_RUNS; i++) {
        const row = normalizeQuestion(source.gen());
        const answer = cleanText(row && row.answer);
        if (LATIN_ONLY_ANSWER_RE.test(answer)) { bad = { question: cleanText(row.question), answer }; break; }
      }
    }
    add('grade11_history_source_answers_localized', !!source && !bad, bad ? `${bad.answer} — ${bad.question}` : 'grade11 history-source samples stayed in localized Russian terminology');
  }
  return checks;
}

function main() {
  const gradeContexts = new Map();
  const perGrade = [];
  const loadErrors = [];
  const topicErrors = [];
  const suspicious = [];

  for (let grade = 1; grade <= GRADE_PAGES.length; grade++) {
    const loaded = loadGrade(grade);
    gradeContexts.set(grade, loaded);
    loadErrors.push(...loaded.loadErrors.map(item => ({ grade, ...item })));
    const sampled = collectRoundRobinSamples(grade, loaded.subjects, SAMPLE_PER_GRADE);
    topicErrors.push(...sampled.topicErrors);
    const counters = { latin_only_answer: 0, descriptive_name_answer: 0, long_decimal_primary: 0, broad_yo_ya_stem: 0 };
    const examples = [];
    for (const sample of sampled.samples) {
      const flags = classifyIssue(sample);
      if (!flags.length) continue;
      for (const flag of flags) counters[flag] = (counters[flag] || 0) + 1;
      suspicious.push({ ...sample, flags });
      if (examples.length < 3) examples.push({
        subjectId: sample.subjectId,
        topicId: sample.topicId,
        question: sample.question,
        answer: sample.answer,
        flags
      });
    }
    perGrade.push({
      grade,
      subjects: loaded.subjects.length,
      scripts: loaded.scripts.length,
      reviewed: sampled.samples.length,
      suspicious: Object.values(counters).reduce((sum, value) => sum + value, 0),
      counters,
      examples
    });
  }

  const guards = sourceGuards();
  const targeted = targetedChecks(gradeContexts);
  const guardFailures = guards.filter(item => !item.ok);
  const targetedFailures = targeted.filter(item => !item.ok);

  const result = {
    wave: 'wave87t',
    samplePerGrade: SAMPLE_PER_GRADE,
    targetedRuns: TARGET_RUNS,
    perGrade,
    totals: {
      reviewed: perGrade.reduce((sum, item) => sum + item.reviewed, 0),
      suspicious: suspicious.length,
      loadErrors: loadErrors.length,
      topicErrors: topicErrors.length,
      sourceGuardFailures: guardFailures.length,
      targetedFailures: targetedFailures.length
    },
    sourceGuards: guards,
    targetedChecks: targeted,
    loadErrors,
    topicErrors,
    suspiciousExamples: suspicious.slice(0, 12)
  };

  console.log(JSON.stringify(result, null, 2));
  if (loadErrors.length || topicErrors.length || suspicious.length || guardFailures.length || targetedFailures.length) {
    process.exit(1);
  }
}

main();
