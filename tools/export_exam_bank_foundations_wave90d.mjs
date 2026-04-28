#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'assets', 'asset-manifest.json');
const DIAGNOSTIC_HTML_PATH = path.join(ROOT, 'diagnostic.html');
const CATALOG_PATH = path.join(ROOT, 'assets', 'data', 'exam_bank', 'catalog.json');
const EXAM_SOURCE_PATH = path.join(ROOT, 'assets', '_src', 'js', 'bundle_exam.js');
const DATA_DIR = path.join(ROOT, 'assets', 'data', 'exam_bank');
const args = new Set(process.argv.slice(2));
const checkMode = args.has('--check');
const TARGET_VARIANT_COUNT = 10;
const MARKER = 'wave90d_variant_depth';
const TARGET_BANK_IDS = [
  'oge_russian_2026_foundation',
  'oge_english_2026_foundation',
  'oge_social_2026_foundation',
  'ege_base_math_2026_foundation',
  'ege_russian_2026_foundation',
  'ege_social_2026_foundation',
  'ege_english_2026_foundation',
  'ege_physics_2026_foundation'
];

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function readJSON(rel){ return JSON.parse(read(rel)); }
function write(rel, value){ fs.writeFileSync(path.join(ROOT, rel), value); }
function writeJSON(rel, value){ write(rel, JSON.stringify(value, null, 2) + '\n'); }
function toNum(v){ return Number(v || 0) || 0; }
function fail(message){ throw new Error(message); }
function stableJSON(value){ return JSON.stringify(value, null, 2) + '\n'; }
function htmlScripts(html){ return [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map((match) => match[1].replace(/^\.\//, '')); }
function makeClassList(){ return { add(){}, remove(){}, toggle(){}, contains(){ return false; } }; }
function hashSeed(seed){
  var str = String(seed == null ? '' : seed);
  var h = 2166136261 >>> 0;
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function seededRandomFactory(seed){
  var state = hashSeed(seed) || 123456789;
  return function(){
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
function createSeededMath(seed){
  var math = Object.create(Math);
  var rnd = seededRandomFactory(seed);
  math.random = function(){ return rnd(); };
  return math;
}
function el(){
  return {
    style:{},
    dataset:{},
    classList:makeClassList(),
    children:[],
    attributes:{},
    appendChild(child){ this.children.push(child); if (child && typeof child.onload === 'function') child.onload(); return child; },
    addEventListener(){},
    removeEventListener(){},
    setAttribute(key, value){ this.attributes[key] = String(value); },
    getAttribute(key){ return this.attributes[key] || null; },
    hasAttribute(key){ return Object.prototype.hasOwnProperty.call(this.attributes, key); },
    removeAttribute(key){ delete this.attributes[key]; },
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    closest(){ return null; },
    remove(){},
    animate(){ return { onfinish:null }; },
    insertAdjacentHTML(){},
    innerHTML:'',
    textContent:''
  };
}
function Storage(){ this._backing = {}; }
Storage.prototype.getItem = function(key){ return Object.prototype.hasOwnProperty.call(this._backing, key) ? this._backing[key] : null; };
Storage.prototype.setItem = function(key, value){ this._backing[key] = String(value); };
Storage.prototype.removeItem = function(key){ delete this._backing[key]; };
Storage.prototype.clear = function(){ Object.keys(this._backing).forEach((key) => delete this._backing[key]); };
Storage.prototype.key = function(index){ return Object.keys(this._backing)[index] || null; };
Object.defineProperty(Storage.prototype, 'length', { get(){ return Object.keys(this._backing).length; } });

function createContext(){
  const seededMath = createSeededMath('wave90d_export_runtime');
  const document = {
    currentScript:null,
    readyState:'complete',
    head:el(),
    body:el(),
    documentElement:el(),
    createElement(){ return el(); },
    createTextNode(text){ return { textContent:String(text) }; },
    addEventListener(){},
    removeEventListener(){},
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    getElementById(){ return el(); }
  };
  const ctx = {
    console:{ log(){}, warn(){}, error(){}, info(){} },
    document,
    window:null,
    self:null,
    globalThis:null,
    Storage,
    localStorage:new Storage(),
    sessionStorage:new Storage(),
    navigator:{
      webdriver:false,
      clipboard:{ writeText(){ return Promise.resolve(); } },
      share(){ return Promise.resolve(); },
      vibrate(){},
      serviceWorker:{ register(){ return Promise.resolve({}); }, addEventListener(){}, controller:{} }
    },
    location:{ href:'https://example.test/diagnostic.html', origin:'https://example.test', pathname:'/diagnostic.html', search:'', hash:'' },
    history:{ pushState(){}, replaceState(){} },
    matchMedia(){ return { matches:false, addEventListener(){}, removeEventListener(){} }; },
    setTimeout(){ return 0; },
    clearTimeout(){},
    setInterval(){ return 0; },
    clearInterval(){},
    alert(){},
    prompt(){ return ''; },
    confirm(){ return true; },
    scrollTo(){},
    fetch(){ return Promise.reject(new Error('offline')); },
    URL:{ createObjectURL(){ return 'blob:x'; }, revokeObjectURL(){} },
    Blob:function(){},
    MutationObserver:function(){ this.observe = function(){}; this.disconnect = function(){}; },
    Promise,
    Math: seededMath,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    RegExp,
    Error,
    parseInt,
    parseFloat,
    isFinite,
    isNaN,
    Set,
    Map
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.globalThis = ctx;
  ctx.addEventListener = () => {};
  ctx.removeEventListener = () => {};
  return vm.createContext(ctx);
}

function reverseManifest(manifest){
  const out = new Map();
  Object.entries(manifest.assets || {}).forEach(([logical, built]) => out.set(String(built), logical));
  return out;
}

function loadGeneratorRuntime(){
  const manifest = readJSON('assets/asset-manifest.json');
  const reverse = reverseManifest(manifest);
  const scripts = htmlScripts(read('diagnostic.html'));
  const ctx = createContext();
  const loadErrors = [];
  scripts.forEach((src) => {
    const logical = reverse.get(src) || src;
    if (logical === 'assets/js/chunk_exam_bank_wave89q.js') return;
    const file = logical === 'assets/js/bundle_exam.js'
      ? path.relative(ROOT, EXAM_SOURCE_PATH).replace(/\\/g, '/')
      : src;
    try {
      ctx.document.currentScript = { src: './' + file, dataset:{} };
      vm.runInContext(read(file), ctx, { filename:file, timeout:5000 });
    } catch (error) {
      loadErrors.push({ src:file, error:error.message });
    }
  });
  if (loadErrors.length) fail('generator runtime failed to load: ' + JSON.stringify(loadErrors.slice(0, 6)));
  const hasBuilder = vm.runInContext(`!!(window.wave30Exam && typeof window.wave30Exam.buildLegacyPack === 'function')`, ctx, { timeout:1000 });
  if (!hasBuilder) fail('wave30Exam.buildLegacyPack is unavailable in export runtime');
  return ctx;
}

function safeJSON(ctx, expr, fallback){
  try {
    const raw = vm.runInContext(`JSON.stringify(${expr})`, ctx, { timeout:5000 });
    return raw == null ? fallback : JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function structuredTypeFromQuestion(question){
  if (!question || typeof question !== 'object') return 'single';
  if (question.inputMode === 'text') return 'short_text';
  if (question.inputMode === 'numeric') return 'short_numeric';
  if (question.interactionType === 'match') return 'match';
  if (question.interactionType === 'sequence') return 'sequence';
  if (question.interactionType === 'find-error') return 'find_error';
  if (question.interactionType === 'multi-select' || Array.isArray(question.correctAnswers)) return 'multiple';
  return 'single';
}

function criteriaForQuestion(question, points, type){
  if (Array.isArray(question && question.criteria) && question.criteria.length) return question.criteria.slice();
  if (type === 'short_text' || type === 'short_numeric') return ['1 балл за точный ответ без лишних символов.'];
  if (type === 'multiple') return ['1 балл только при выборе всех верных вариантов.'];
  if (points > 1) return [String(points) + ' балла за полный и верный ответ.', 'Проверьте ход решения и итоговый результат.'];
  return ['1 балл за верный ответ.'];
}

function topicTag(value){
  return String(value || '').toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'exam_topic';
}

function explanationFor(question){
  const direct = String((question && question.ex) || '').trim();
  if (direct) return direct;
  const answer = String((question && question.a) || '').trim();
  const hint = String((question && question.hint) || '').trim();
  if (answer && hint) return `Правильный ответ: ${answer}. ${hint}`;
  if (answer) return `Правильный ответ: ${answer}.`;
  return hint || 'Разбор появится в следующем обновлении экзаменационного банка.';
}

function packPrefix(bankId){
  return String(bankId || '').replace(/_2026_foundation$/, '_var');
}

function familyStructure(catalog, bankId){
  const match = Object.values(catalog.structures || {}).find((structure) => String(structure.bank_id || '') === bankId);
  if (!match) fail(`catalog.json is missing structure for ${bankId}`);
  return match;
}

function sequentialTasks(total){
  return Array.from({ length:total }, (_, index) => index + 1);
}

const catalog = readJSON('assets/data/exam_bank/catalog.json');
const ctx = loadGeneratorRuntime();
const report = { ok:true, wave:'wave90d', checkMode, targetVariantCount:TARGET_VARIANT_COUNT, banks:{} };
let drift = false;

for (const bankId of TARGET_BANK_IDS) {
  const rel = path.join('assets', 'data', 'exam_bank', `${bankId}.json`).replace(/\\/g, '/');
  const current = readJSON(rel);
  const structure = familyStructure(catalog, bankId);
  const prefix = packPrefix(bankId);
  const slots = Array.isArray(structure.slots) ? structure.slots.slice().sort((a, b) => toNum(a.task_num) - toNum(b.task_num)) : [];
  const slotByTask = new Map(slots.map((slot) => [toNum(slot.task_num), slot]));
  const variants = sequentialTasks(TARGET_VARIANT_COUNT);
  const items = [];
  const variantReports = [];

  variants.forEach((variantNo) => {
    const packId = `${prefix}${variantNo}`;
    const built = safeJSON(ctx, `window.wave30Exam.buildLegacyPack(${JSON.stringify(packId)})`, null);
    if (!built || !Array.isArray(built.questions) || !built.questions.length) fail(`Could not build ${packId}`);
    const selectedQuestions = built.questions.filter((question) => slotByTask.has(toNum(question.taskNo))).sort((a, b) => toNum(a.taskNo) - toNum(b.taskNo));
    const taskNums = selectedQuestions.map((question) => toNum(question.taskNo));
    const expectedTasks = sequentialTasks(slots.length);
    if (selectedQuestions.length !== slots.length) fail(`${packId} exported question count mismatch: got ${selectedQuestions.length}, expected ${slots.length}`);
    if (JSON.stringify(taskNums) !== JSON.stringify(expectedTasks)) fail(`${packId} task numbering mismatch: ${JSON.stringify(taskNums)}`);

    selectedQuestions.forEach((question) => {
      const taskNo = toNum(question.taskNo);
      const slot = slotByTask.get(taskNo);
      if (!slot) fail(`${packId} task ${taskNo} is missing from catalog slots`);
      const type = structuredTypeFromQuestion(question);
      const sourceTag = [String(question.sourceTag || question.bankSource || '').trim(), MARKER].filter(Boolean).join('|');
      items.push({
        exam: current.exam || built.exam,
        subject: current.subject || current.subject_id || built.subjectId,
        year: toNum(current.year || structure.year),
        variant: variantNo,
        task_num: taskNo,
        type,
        max_score: toNum(slot.max_score || question.points || 1),
        q: question.q,
        a: question.a,
        o: Array.isArray(question.opts) ? question.opts.slice() : [],
        h: String(question.hint || '').trim(),
        ex: explanationFor(question),
        criteria: criteriaForQuestion(question, toNum(slot.max_score || question.points || 1), type),
        topic_tag: slot.topic_tag || topicTag(question.section || question.topic),
        section: slot.section || question.section || '',
        topic: question.topic || slot.section || '',
        grades: built.grades || structure.grades || current.grades || '',
        source_pack: packId,
        source_tag: sourceTag,
        score_kind: built.scoreKind || structure.score_kind || '',
        score_model: built.scoreModel || structure.score_model || '',
        part: slot.part || question.part || (toNum(slot.max_score || question.points || 1) > 1 ? 'B' : 'A')
      });
    });

    variantReports.push({
      packId,
      builtQuestionCount: built.questions.length,
      exportedQuestionCount: selectedQuestions.length,
      maxPoints: toNum(built.maxPoints),
      sections: Array.from(new Set((selectedQuestions || []).map((question) => String(question.section || '')))).filter(Boolean)
    });
  });

  items.sort((a, b) => toNum(a.variant) - toNum(b.variant) || toNum(a.task_num) - toNum(b.task_num));
  const next = {
    ...current,
    source: 'wave90d variant-depth export',
    variants,
    item_count: items.length,
    items
  };
  const nextSource = stableJSON(next);
  const currentSource = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const changed = currentSource !== nextSource;
  if (!checkMode && changed) write(rel, nextSource);
  if (checkMode && changed) drift = true;
  report.banks[bankId] = {
    file: rel,
    changed,
    variants,
    itemCount: items.length,
    taskCount: slots.length,
    expectedRows: slots.length * TARGET_VARIANT_COUNT,
    variantReports
  };
}

report.ok = !drift;
report.note = checkMode
  ? 'check mode compares generated bank JSON with the committed files without writing them'
  : 'write mode regenerates the targeted exam-bank JSON files from live legacy pack builders and stamps rows with wave90d_variant_depth';
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
