import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = process.cwd();
const SAMPLE_PER_TOPIC = Number(process.env.REPEAT_SAMPLE_PER_TOPIC || 10);
const GRADE_PAGES = Array.from({ length: 11 }, (_, i) => `grade${i + 1}_v2.html`);
const INCLUDE_RE = /\/assets\/js\/(grade\d+_data\.|bundle_boosters\.|chunk_grade_content_|chunk_subject_expansion_|chunk_grade10_lazy_wave86s\.)/;
const GRADE10_SUBJECT_RE = /^(grade10_subject_.*_wave86s|grade10_subject_oly_(logic|cross|traps|deep)_wave87c)\.[a-f0-9]{10}\.js$/;

function parseScripts(htmlFile){
  const html = fs.readFileSync(path.join(ROOT, htmlFile), 'utf8');
  return [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map(m => m[1].replace(/^\.\//, ''));
}
function makeRandom(seed){
  let s = seed >>> 0;
  return function random(){
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}
function makeClassList(){ return { add(){}, remove(){}, contains(){ return false; }, toggle(){ return false; } }; }
function makeElement(tag){
  return {
    tagName: String(tag || 'div').toUpperCase(),
    style: {}, dataset: {}, children: [], attributes: {}, classList: makeClassList(),
    appendChild(child){ this.children.push(child); if (child && typeof child.onload === 'function') setTimeout(child.onload, 0); return child; },
    remove(){}, setAttribute(k, v){ this.attributes[k] = String(v); }, getAttribute(k){ return this.attributes[k] || null; },
    addEventListener(){}, removeEventListener(){}, closest(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; },
    animate(){ return { onfinish: null }; },
    get innerHTML(){ return this._innerHTML || ''; }, set innerHTML(v){ this._innerHTML = String(v); },
    get textContent(){ return this._textContent || ''; }, set textContent(v){ this._textContent = String(v); }
  };
}
function makeContext(grade){
  const store = Object.create(null);
  const random = makeRandom(0x871000 + grade); // eslint-disable-line no-loss-of-precision
  const math = Object.create(Math);
  math.random = random;
  const document = {
    currentScript: null,
    head: makeElement('head'), body: makeElement('body'), documentElement: makeElement('html'),
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
    location: { href: `https://example.test/grade${grade}_v2.html`, search: '', pathname: `/grade${grade}_v2.html`, origin: 'https://example.test' },
    history: { pushState(){}, replaceState(){} },
    matchMedia(){ return { matches: false, addEventListener(){}, removeEventListener(){} }; },
    URL: { createObjectURL(){ return 'blob:mock'; }, revokeObjectURL(){} }, Blob: function Blob(parts, opts){ this.parts = parts; this.opts = opts; },
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
const shuffle = o => { const a = [...(o || [])]; for (let i = a.length - 1; i > 0; i--) { const j = 0 | Math.random() * (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = o => (o && o.length ? o[0 | Math.random() * o.length] : undefined);
const range = (a,b) => { const r=[]; for(let i=a;i<=b;i++) r.push(i); return r; };
const uniq = o => (o || []).filter((v, i, arr) => arr.indexOf(v) === i);
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
function runScript(ctx, rel){
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error(`missing script ${rel}`);
  ctx.document.currentScript = { src: './' + rel, dataset: {} };
  const code = fs.readFileSync(file, 'utf8');
  vm.runInContext(code, ctx, { filename: rel, timeout: 1000 });
}
function selectedScriptsForGrade(grade){
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
function normalizeQuestion(q){
  if (Array.isArray(q)) {
    const [question, answer, ...rest] = q;
    const hint = rest.length ? rest[rest.length - 1] : '';
    const opts = rest.slice(0, 3).map(v => typeof v === 'function' ? v() : v);
    return { question, answer, options: [answer, ...opts], hint };
  }
  if (!q || typeof q !== 'object') return null;
  const question = q.question ?? q.q ?? q.text ?? '';
  const answer = q.answer ?? q.a ?? '';
  let options = q.options ?? q.o ?? q.opts ?? [];
  if (!Array.isArray(options)) options = [];
  options = options.map(v => typeof v === 'function' ? v() : v);
  return { question, answer, options, hint: q.hint ?? q.h ?? '', ex: q.ex ?? '' };
}
function validateRow(row){
  const errors = [];
  if (!row) return ['generator returned empty/non-object question'];
  const q = String(row.question ?? '').trim();
  const a = String(row.answer ?? '').trim();
  const opts = Array.isArray(row.options) ? row.options.map(v => String(v ?? '').trim()).filter(Boolean) : [];
  if (!q) errors.push('empty question');
  if (!a) errors.push('empty answer');
  if (opts.length < 4) errors.push(`only ${opts.length} options`);
  const unique = new Set(opts);
  if (unique.size !== opts.length) errors.push('duplicate options');
  if (a && !unique.has(a)) errors.push('answer not included in options');
  return errors;
}
function cleanPrompt(v){ return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().toLowerCase().replace(/ё/g, 'е'); }
function liveBankCount(topic){
  let max = 0;
  if (!topic || typeof topic !== 'object') return max;
  for (const [key, value] of Object.entries(topic)) {
    if (!/^_wave(86|87).*(LiveBankCount|BankCount)$/.test(key)) continue;
    const num = Number(value) || 0;
    if (num > max) max = num;
  }
  return max;
}

const result = {
  ok: true,
  samplePerTopic: SAMPLE_PER_TOPIC,
  totals: {
    grades: 0,
    scripts: 0,
    liveBankTopics: 0,
    sampledQuestions: 0,
    immediateRepeats: 0,
    lowDiversityTopics: 0,
    failures: 0,
    loadErrors: 0,
    recentRepeatBlocked: 0,
    repeatAccepted: 0
  },
  grades: [],
  failures: []
};
function fail(message){ result.ok = false; result.totals.failures += 1; result.failures.push(message); }

for (let grade = 1; grade <= 11; grade += 1) {
  const ctx = makeContext(grade);
  vm.runInContext(HELPERS, ctx, { filename: 'repeat-guard-helpers.js', timeout: 1000 });
  const scripts = selectedScriptsForGrade(grade);
  const loadErrors = [];
  for (const src of scripts) {
    try { runScript(ctx, src); }
    catch (err) { loadErrors.push({ script: src, error: err && err.message || String(err) }); }
  }
  const gradeOut = { grade, scripts: scripts.length, liveBankTopics: 0, sampledQuestions: 0, immediateRepeats: 0, lowDiversityTopics: 0, failures: [], loadErrors, quality: ctx.window.WAVE63_QUALITY_RUNTIME || null };
  result.totals.grades += 1;
  result.totals.scripts += scripts.length;
  result.totals.loadErrors += loadErrors.length;
  if (loadErrors.length) fail(`grade ${grade}: ${loadErrors.length} script load errors`);
  const subjects = ctx.window.SUBJ || ctx.SUBJ || [];
  for (const subject of subjects) {
    const tops = Array.isArray(subject && subject.tops) ? subject.tops : [];
    for (const topic of tops) {
      const count = liveBankCount(topic);
      if (count < 8 || !topic || typeof topic.gen !== 'function') continue;
      gradeOut.liveBankTopics += 1;
      result.totals.liveBankTopics += 1;
      let prevPrompt = '';
      let repeats = 0;
      const uniq = new Set();
      for (let i = 0; i < SAMPLE_PER_TOPIC; i += 1) {
        const row = normalizeQuestion(topic.gen());
        gradeOut.sampledQuestions += 1;
        result.totals.sampledQuestions += 1;
        const errs = validateRow(row);
        if (errs.length) {
          const msg = `grade ${grade} ${subject.id}:${topic.id} invalid row ${i + 1}: ${errs.join(', ')}`;
          gradeOut.failures.push(msg);
          fail(msg);
        }
        const prompt = row ? cleanPrompt(row.question) : '';
        if (prompt) {
          if (prompt === prevPrompt) repeats += 1;
          prevPrompt = prompt;
          uniq.add(prompt);
        }
      }
      if (repeats > 0) {
        gradeOut.immediateRepeats += repeats;
        result.totals.immediateRepeats += repeats;
        const msg = `grade ${grade} ${subject.id}:${topic.id} repeated prompt ${repeats} time(s) in ${SAMPLE_PER_TOPIC} draws`;
        gradeOut.failures.push(msg);
        fail(msg);
      }
      if (uniq.size < Math.min(6, SAMPLE_PER_TOPIC - 2)) {
        gradeOut.lowDiversityTopics += 1;
        result.totals.lowDiversityTopics += 1;
        const msg = `grade ${grade} ${subject.id}:${topic.id} low diversity: ${uniq.size} unique prompts from ${SAMPLE_PER_TOPIC}`;
        gradeOut.failures.push(msg);
        fail(msg);
      }
    }
  }
  if (gradeOut.quality) {
    result.totals.recentRepeatBlocked += Number(gradeOut.quality.recentRepeatBlocked || 0);
    result.totals.repeatAccepted += Number(gradeOut.quality.repeatAccepted || 0);
  }
  result.grades.push(gradeOut);
}

fs.writeFileSync('/mnt/data/wave87i_repeat_guard_audit.json', JSON.stringify(result, null, 2), 'utf8');
console.log(JSON.stringify({ ok: result.ok, totals: result.totals }, null, 2));
if (!result.ok) process.exit(1);
