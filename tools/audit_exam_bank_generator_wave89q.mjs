#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'asset-manifest.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'data', 'exam_bank', 'catalog.json'), 'utf8'));
const chunkLogical = 'assets/js/chunk_exam_bank_wave89q.js';
const examLogical = 'assets/js/bundle_exam.js';
const dashboardHtml = fs.readFileSync(path.join(ROOT, 'dashboard.html'), 'utf8');
const diagnosticHtml = fs.readFileSync(path.join(ROOT, 'diagnostic.html'), 'utf8');

function builtAsset(logical){
  const built = manifest.assets && manifest.assets[logical];
  if (!built) throw new Error(`asset-manifest missing ${logical}`);
  const abs = path.join(ROOT, built);
  if (!fs.existsSync(abs)) throw new Error(`missing built asset ${built}`);
  return built;
}
function htmlScripts(html){
  return [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map((match) => match[1].replace(/^\.\//, ''));
}
function orderOf(list, value){ return list.findIndex((entry) => entry === value); }
function assertScriptOrder(page, html, chunkBuilt, examBuilt){
  const scripts = htmlScripts(html);
  const chunkIndex = orderOf(scripts, chunkBuilt);
  const examIndex = orderOf(scripts, examBuilt);
  if (chunkIndex < 0) throw new Error(`${page} must load ${chunkBuilt}`);
  if (examIndex < 0) throw new Error(`${page} must load ${examBuilt}`);
  if (chunkIndex > examIndex) throw new Error(`${page} must load ${chunkBuilt} before ${examBuilt}`);
  return scripts;
}
function makeClassList(){
  return { add(){}, remove(){}, toggle(){}, contains(){ return false; } };
}
function el(){
  return {
    style:{},
    dataset:{},
    classList:makeClassList(),
    children:[],
    attributes:{},
    appendChild(child){ this.children.push(child); if (child && typeof child.onload === 'function') setTimeout(child.onload, 0); return child; },
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
const doc = {
  currentScript:null,
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
const backing = {};
function Storage(){}
Storage.prototype.getItem = function(key){ return Object.prototype.hasOwnProperty.call(backing, key) ? backing[key] : null; };
Storage.prototype.setItem = function(key, value){ backing[key] = String(value); };
Storage.prototype.removeItem = function(key){ delete backing[key]; };
Storage.prototype.clear = function(){ Object.keys(backing).forEach((key) => delete backing[key]); };
Storage.prototype.key = function(index){ return Object.keys(backing)[index] || null; };
const localStorage = new Storage();
Object.defineProperty(localStorage, 'length', { get(){ return Object.keys(backing).length; } });

const ctx = {
  console:{ log(){}, warn(){}, error(){}, info(){} },
  document:doc,
  window:null,
  self:null,
  globalThis:null,
  Storage,
  localStorage,
  sessionStorage:new Storage(),
  navigator:{
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
  Math,
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
vm.createContext(ctx);

const chunkBuilt = builtAsset(chunkLogical);
const examBuilt = builtAsset(examLogical);
const diagnosticScripts = assertScriptOrder('diagnostic.html', diagnosticHtml, chunkBuilt, examBuilt);
const dashboardScripts = assertScriptOrder('dashboard.html', dashboardHtml, chunkBuilt, examBuilt);

let builderCheck = { ok:false };
try {
  const raw = execFileSync(process.execPath, ['tools/build_exam_bank_runtime_wave89q.mjs', '--check'], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
  builderCheck = JSON.parse(raw || '{}');
} catch (error) {
  const stderr = error && typeof error.stderr === 'string' ? error.stderr.trim() : '';
  const stdout = error && typeof error.stdout === 'string' ? error.stdout.trim() : '';
  console.error(JSON.stringify({ ok:false, reason:'builder-check-failed', stderr, stdout }, null, 2));
  process.exit(1);
}

const loadErrors = [];
for (const src of diagnosticScripts) {
  try {
    doc.currentScript = { src: './' + src, dataset:{} };
    const code = fs.readFileSync(path.join(ROOT, src), 'utf8');
    vm.runInContext(code, ctx, { filename:src, timeout:3000 });
  } catch (error) {
    loadErrors.push({ src, error: error.message });
  }
}

function safeJSON(expr, fallback){
  try {
    const raw = vm.runInContext(`JSON.stringify(${expr})`, ctx, { timeout:3000 });
    return raw == null ? fallback : JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

const runtimePayload = safeJSON('WAVE89Q_EXAM_BANK', null);
const runtimeFamilies = runtimePayload && runtimePayload.families ? Object.keys(runtimePayload.families) : [];
const expectedFamilies = Object.values(catalog.structures || {}).map((structure) => String(structure.family_id || '')).filter(Boolean);
const EXPECTED_MIN_VARIANTS = {
  oge_math_2026_full: 10,
  oge_russian_2026_full: 5,
  oge_english_2026_full: 5,
  oge_social_2026_full: 5,
  ege_base_math_2026_full: 5,
  ege_profile_math_2026_part1: 10,
  ege_russian_2026_part1: 5,
  ege_social_2026_part1: 5,
  ege_english_2026_part1: 5,
  ege_physics_2026_part1: 5
};
const auditSnapshot = safeJSON('wave30Exam && wave30Exam.auditSnapshot ? wave30Exam.auditSnapshot() : null', null);
const exportedSnapshot = safeJSON('wave89ExamBank && wave89ExamBank.exportSnapshot ? wave89ExamBank.exportSnapshot() : null', null);

const requiredRowFields = ['exam','subject','year','variant','task_num','type','max_score','q','a','o','h','ex','criteria','topic_tag'];
const familyReports = {};
const packAliasChecks = [];
let rowValidationErrors = 0;
let kimValidationErrors = 0;

for (const familyId of expectedFamilies) {
  const blueprint = safeJSON(`wave89ExamBank && wave89ExamBank.getBlueprint(${JSON.stringify(familyId)})`, null);
  const rows = safeJSON(`wave89ExamBank && wave89ExamBank.getRows(${JSON.stringify(familyId)})`, []);
  const runtimeFamily = runtimePayload && runtimePayload.families ? runtimePayload.families[familyId] : null;
  const variants = Array.isArray(runtimeFamily && runtimeFamily.variants) ? runtimeFamily.variants.slice() : [1];
  const sampleVariant = Number(variants[0] || 1) || 1;
  const kim = safeJSON(`wave89ExamBank && wave89ExamBank.buildKim(${JSON.stringify(familyId)}, ${JSON.stringify(sampleVariant)})`, null);
  const rowFieldErrors = [];
  rows.forEach((row, index) => {
    requiredRowFields.forEach((field) => {
      if (typeof row[field] === 'undefined' || row[field] === null || (field === 'q' && !String(row[field]).trim())) {
        rowFieldErrors.push({ index, field });
      }
    });
    if (!Array.isArray(row.o)) rowFieldErrors.push({ index, field:'o:not-array' });
    if (!Array.isArray(row.criteria)) rowFieldErrors.push({ index, field:'criteria:not-array' });
    if (typeof row.max_score !== 'number' || row.max_score <= 0) rowFieldErrors.push({ index, field:'max_score:not-positive' });
    if (Array.isArray(row.o) && row.o.length && !row.o.includes(row.a)) rowFieldErrors.push({ index, field:'answer-not-in-options' });
  });
  rowValidationErrors += rowFieldErrors.length;
  const packIds = Array.isArray(runtimeFamily && runtimeFamily.pack_ids) ? runtimeFamily.pack_ids.slice() : [];
  const minVariants = EXPECTED_MIN_VARIANTS[familyId] || 1;
  if (!kim || !Array.isArray(kim.questions) || !kim.questions.length) kimValidationErrors += 1;
  if (kim && blueprint && kim.maxQ !== blueprint.task_count) kimValidationErrors += 1;
  if (kim && kim.generatedFromStructuredBank !== true) kimValidationErrors += 1;
  if (kim && kim.generatedFromStructuredJson !== true) kimValidationErrors += 1;
  if (kim && kim.structuredFamilySource !== 'json_bank') kimValidationErrors += 1;
  if (kim && kim.structuredFamilyId !== familyId) kimValidationErrors += 1;
  if (kim && kim.structuredSchema !== 'wave89q_exam_bank_v1') kimValidationErrors += 1;
  if (variants.length < minVariants) kimValidationErrors += 1;
  if (packIds.length !== variants.length) kimValidationErrors += 1;
  familyReports[familyId] = {
    rowCount: Array.isArray(rows) ? rows.length : 0,
    blueprintTaskCount: blueprint && Array.isArray(blueprint.tasks) ? blueprint.tasks.length : 0,
    kimQuestionCount: kim && Array.isArray(kim.questions) ? kim.questions.length : 0,
    generatedFromStructuredJson: !!(kim && kim.generatedFromStructuredJson),
    structuredFamilySource: kim && kim.structuredFamilySource ? kim.structuredFamilySource : '',
    variants,
    packIds,
    minVariants,
    rowFieldErrors: rowFieldErrors.slice(0, 12)
  };
  for (const packId of packIds) {
    const direct = safeJSON(`wave89ExamBank && wave89ExamBank.buildKimForPack(${JSON.stringify(packId)})`, null);
    const viaWave30 = safeJSON(`wave30Exam && wave30Exam.buildPack(${JSON.stringify(packId)})`, null);
    packAliasChecks.push({
      familyId,
      packId,
      directOk: !!(direct && direct.generatedFromStructuredJson === true && direct.structuredFamilySource === 'json_bank'),
      wave30Ok: !!(viaWave30 && viaWave30.generatedFromStructuredJson === true && viaWave30.structuredFamilySource === 'json_bank'),
      sameQuestionCount: !!(direct && viaWave30 && direct.maxQ === viaWave30.maxQ),
      structuredFamilyId: direct && direct.structuredFamilyId ? direct.structuredFamilyId : ''
    });
  }
}

const snapshotPackChecks = packAliasChecks.map((row) => {
  const pack = auditSnapshot && auditSnapshot.packs ? auditSnapshot.packs[row.packId] : null;
  return {
    packId: row.packId,
    inAuditSnapshot: !!pack,
    generatedFromStructuredJson: !!(pack && pack.generatedFromStructuredJson === true),
    structuredFamilySource: pack && pack.structuredFamilySource ? pack.structuredFamilySource : '',
    structuredFamilyId: pack && pack.structuredFamilyId ? pack.structuredFamilyId : ''
  };
});

const ok = builderCheck && builderCheck.ok === true
  && loadErrors.length === 0
  && runtimePayload && runtimePayload.schema === 'wave89q_exam_bank_v1'
  && Array.isArray(runtimeFamilies) && runtimeFamilies.length === expectedFamilies.length
  && expectedFamilies.every((familyId) => runtimeFamilies.includes(familyId))
  && exportedSnapshot && exportedSnapshot.schema === 'wave89q_exam_bank_v1'
  && auditSnapshot && auditSnapshot.structuredSchema === 'wave89q_exam_bank_v1'
  && auditSnapshot.features && auditSnapshot.features.hasStructuredBank === true
  && auditSnapshot.features.hasWave89ExamBankAlias === true
  && auditSnapshot.features.hasStructuredJsonRuntime === true
  && rowValidationErrors === 0
  && kimValidationErrors === 0
  && expectedFamilies.every((familyId) => {
    const report = familyReports[familyId];
    return report && report.variants.length >= (EXPECTED_MIN_VARIANTS[familyId] || 1) && report.packIds.length === report.variants.length;
  })
  && packAliasChecks.length === expectedFamilies.reduce((sum, familyId) => sum + ((familyReports[familyId] && familyReports[familyId].packIds.length) || 0), 0)
  && packAliasChecks.every((row) => row.directOk && row.wave30Ok && row.sameQuestionCount)
  && snapshotPackChecks.every((row) => row.inAuditSnapshot && row.generatedFromStructuredJson && row.structuredFamilySource === 'json_bank');

const report = {
  ok,
  builderCheck,
  chunkBuilt,
  examBuilt,
  diagnosticScripts: diagnosticScripts.length,
  dashboardScripts: dashboardScripts.length,
  loadErrors,
  expectedFamilies,
  runtimeFamilies,
  runtimeSchema: runtimePayload && runtimePayload.schema,
  auditSnapshot,
  familyReports,
  packAliasChecks,
  snapshotPackChecks,
  rowValidationErrors,
  kimValidationErrors
};

console.log(JSON.stringify(report, null, 2));
if (!ok) process.exit(1);
