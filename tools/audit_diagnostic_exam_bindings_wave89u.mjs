#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'asset-manifest.json'), 'utf8'));
const diagnosticHtml = fs.readFileSync(path.join(ROOT, 'diagnostic.html'), 'utf8');

const LOGICALS = {
  inlineDiagnostic: 'assets/js/inline_diagnostic_1_wave86u.js',
  diagnosticTools: 'assets/js/bundle_diagnostic_tools.js',
  exam: 'assets/js/bundle_exam.js'
};

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
function assertLoaded(page, html, logical){
  const built = builtAsset(logical);
  const scripts = htmlScripts(html);
  if (!scripts.includes(built)) throw new Error(`${page} must load ${built}`);
  return built;
}

const built = {
  inlineDiagnostic: assertLoaded('diagnostic.html', diagnosticHtml, LOGICALS.inlineDiagnostic),
  diagnosticTools: assertLoaded('diagnostic.html', diagnosticHtml, LOGICALS.diagnosticTools),
  exam: assertLoaded('diagnostic.html', diagnosticHtml, LOGICALS.exam)
};

function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

const sourceChecks = {
  inlineDiagnosticSource: read('assets/_src/js/inline_diagnostic_1_wave86u.js'),
  diagnosticToolsSource: read('assets/_src/js/bundle_diagnostic_tools.js'),
  examSource: read('assets/_src/js/bundle_exam.js'),
  inlineDiagnosticBuilt: read(built.inlineDiagnostic),
  diagnosticToolsBuilt: read(built.diagnosticTools),
  examBuilt: read(built.exam)
};

const requiredSnippets = [
  { key:'inlineDiagnosticDataAttr', target:'inlineDiagnosticSource', pattern:'data-wave89u-diag-action' },
  { key:'inlineDiagnosticBinding', target:'inlineDiagnosticSource', pattern:'wave89uDiagnosticBinding' },
  { key:'diagnosticToolsDataAttr', target:'diagnosticToolsSource', pattern:'data-wave89u-diag-tools-action' },
  { key:'diagnosticToolsBinding', target:'diagnosticToolsSource', pattern:'wave89uDiagnosticToolsBinding' },
  { key:'examDataAttr', target:'examSource', pattern:'data-wave89u-exam-action' },
  { key:'examBinding', target:'examSource', pattern:'wave89uExamBinding' },
  { key:'inlineDiagnosticBuiltDataAttr', target:'inlineDiagnosticBuilt', pattern:'data-wave89u-diag-action' },
  { key:'diagnosticToolsBuiltDataAttr', target:'diagnosticToolsBuilt', pattern:'data-wave89u-diag-tools-action' },
  { key:'examBuiltDataAttr', target:'examBuilt', pattern:'data-wave89u-exam-action' },
  { key:'examFreezeGuard', target:'inlineDiagnosticSource', pattern:'if(window.__wave30ActivePack) return;' }
];

const forbiddenPatterns = [
  { key:'inlineDiagnosticInlineOnclick', target:'inlineDiagnosticSource', pattern:/onclick="/ },
  { key:'inlineDiagnosticBuiltInlineOnclick', target:'inlineDiagnosticBuilt', pattern:/onclick="/ },
  { key:'diagnosticToolsInlineOnclick', target:'diagnosticToolsSource', pattern:/onclick="/ },
  { key:'diagnosticToolsBuiltInlineOnclick', target:'diagnosticToolsBuilt', pattern:/onclick="/ },
  { key:'examInlineOnclick', target:'examSource', pattern:/onclick="/ },
  { key:'examBuiltInlineOnclick', target:'examBuilt', pattern:/onclick="/ },
  { key:'legacySelectOptInline', target:'inlineDiagnosticBuilt', pattern:/selectOptIdx\(this,/ },
  { key:'legacyModeInline', target:'diagnosticToolsBuilt', pattern:/wave25Diag\.setMode\(/ },
  { key:'legacyRepeatInline', target:'diagnosticToolsBuilt', pattern:/wave25Diag\.repeatLast\(/ },
  { key:'legacyClearInline', target:'diagnosticToolsBuilt', pattern:/wave25Diag\.clearHistory\(/ },
  { key:'legacyExamStartInline', target:'examBuilt', pattern:/wave30Exam\.startPack\(/ }
];

const staticReport = {};
for (const check of requiredSnippets) {
  staticReport[check.key] = sourceChecks[check.target].includes(check.pattern);
}
for (const check of forbiddenPatterns) {
  staticReport[check.key] = !check.pattern.test(sourceChecks[check.target]);
}

function makeClassList(){
  return {
    _set:new Set(),
    add(...names){ names.forEach((name) => this._set.add(name)); },
    remove(...names){ names.forEach((name) => this._set.delete(name)); },
    toggle(name, force){
      if (force === true) { this._set.add(name); return true; }
      if (force === false) { this._set.delete(name); return false; }
      if (this._set.has(name)) { this._set.delete(name); return false; }
      this._set.add(name); return true;
    },
    contains(name){ return this._set.has(name); }
  };
}
function makeStyle(){
  return {
    _map:{},
    setProperty(name, value){ this._map[name] = String(value); },
    removeProperty(name){ delete this._map[name]; },
    getPropertyValue(name){ return this._map[name] || ''; }
  };
}
function makeElement(tagName = 'div'){
  return {
    nodeType:1,
    tagName: String(tagName || 'div').toUpperCase(),
    style:makeStyle(),
    dataset:{},
    classList:makeClassList(),
    children:[],
    attributes:{},
    parentNode:null,
    disabled:false,
    innerHTML:'',
    textContent:'',
    appendChild(child){ if (child && typeof child === 'object') { child.parentNode = this; this.children.push(child); if (typeof child.onload === 'function') setTimeout(() => child.onload(), 0); } return child; },
    insertBefore(child){ return this.appendChild(child); },
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
    focus(){},
    blur(){}
  };
}

const elementById = new Map();
const selectorMap = new Map();
function getId(id){
  if (!elementById.has(id)) elementById.set(id, makeElement('div'));
  return elementById.get(id);
}
function getSelector(selector){
  if (!selectorMap.has(selector)) selectorMap.set(selector, makeElement('div'));
  return selectorMap.get(selector);
}

const documentStub = {
  currentScript:null,
  readyState:'complete',
  head:makeElement('head'),
  body:makeElement('body'),
  documentElement:makeElement('html'),
  createElement(tag){ return makeElement(tag); },
  createTextNode(text){ return { textContent:String(text) }; },
  addEventListener(){},
  removeEventListener(){},
  querySelector(selector){
    if (selector === '.subj-intro') return getSelector(selector);
    if (selector === '#s-quiz .qhdr') return getSelector(selector);
    return null;
  },
  querySelectorAll(selector){
    if (selector === '.scr') return ['s-select','s-quiz','s-result'].map((id) => getId(id));
    return [];
  },
  getElementById(id){ return getId(id); }
};

const storageBacking = {};
function Storage(){}
Storage.prototype.getItem = function(key){ return Object.prototype.hasOwnProperty.call(storageBacking, key) ? storageBacking[key] : null; };
Storage.prototype.setItem = function(key, value){ storageBacking[key] = String(value); };
Storage.prototype.removeItem = function(key){ delete storageBacking[key]; };
Storage.prototype.clear = function(){ Object.keys(storageBacking).forEach((key) => delete storageBacking[key]); };
Storage.prototype.key = function(index){ return Object.keys(storageBacking)[index] || null; };
Object.defineProperty(Storage.prototype, 'length', { get(){ return Object.keys(storageBacking).length; } });

const ctx = {
  console:{ log(){}, warn(){}, error(){}, info(){} },
  document:documentStub,
  window:null,
  self:null,
  globalThis:null,
  Storage,
  localStorage:new Storage(),
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
  requestAnimationFrame(callback){ if (typeof callback === 'function') callback(0); return 0; },
  cancelAnimationFrame(){},
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

const loadErrors = [];
for (const src of htmlScripts(diagnosticHtml)) {
  try {
    documentStub.currentScript = { src: './' + src, dataset:{} };
    const code = read(src);
    vm.runInContext(code, ctx, { filename:src, timeout:5000 });
  } catch (error) {
    loadErrors.push({ src, error:error.message });
  }
}

function safeJSON(expr, fallback){
  try {
    const raw = vm.runInContext(`JSON.stringify(${expr})`, ctx, { timeout:5000 });
    return raw == null ? fallback : JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

const bindingReport = {
  diagBinding: !!safeJSON('wave89uDiagnosticBinding && { actionAttr: wave89uDiagnosticBinding.actionAttr, answerIndexAttr: wave89uDiagnosticBinding.answerIndexAttr, bound: wave89uDiagnosticBinding.isBound && wave89uDiagnosticBinding.isBound() }', null),
  diagToolsBinding: !!safeJSON('wave89uDiagnosticToolsBinding && { actionAttr: wave89uDiagnosticToolsBinding.actionAttr, modeAttr: wave89uDiagnosticToolsBinding.modeAttr, bound: wave89uDiagnosticToolsBinding.isBound && wave89uDiagnosticToolsBinding.isBound() }', null),
  examBinding: !!safeJSON('wave89uExamBinding && { actionAttr: wave89uExamBinding.actionAttr, packAttr: wave89uExamBinding.packAttr, bound: wave89uExamBinding.isBound && wave89uExamBinding.isBound() }', null)
};
const bindingDetails = {
  diag: safeJSON('wave89uDiagnosticBinding && { actionAttr: wave89uDiagnosticBinding.actionAttr, answerIndexAttr: wave89uDiagnosticBinding.answerIndexAttr, bound: wave89uDiagnosticBinding.isBound && wave89uDiagnosticBinding.isBound() }', null),
  diagTools: safeJSON('wave89uDiagnosticToolsBinding && { actionAttr: wave89uDiagnosticToolsBinding.actionAttr, modeAttr: wave89uDiagnosticToolsBinding.modeAttr, bound: wave89uDiagnosticToolsBinding.isBound && wave89uDiagnosticToolsBinding.isBound() }', null),
  exam: safeJSON('wave89uExamBinding && { actionAttr: wave89uExamBinding.actionAttr, packAttr: wave89uExamBinding.packAttr, bound: wave89uExamBinding.isBound && wave89uExamBinding.isBound() }', null)
};

const examRuntime = safeJSON(`(function(){
  if (!wave30Exam || typeof wave30Exam.startPack !== 'function') return null;
  var ok = wave30Exam.startPack('oge_math_var1');
  if (!ok || !questions || questions.length < 2) return { ok:false, reason:'pack-not-started' };
  var before = questions[1] ? questions[1].q : '';
  var optsMarkup = document.getElementById('opts').innerHTML || '';
  if (typeof adaptNext === 'function') adaptNext(true);
  var afterTrue = questions[1] ? questions[1].q : '';
  if (typeof adaptNext === 'function') adaptNext(false);
  var afterFalse = questions[1] ? questions[1].q : '';
  return {
    ok:true,
    startReturned: ok,
    activePackId: window.__wave30ActivePack && window.__wave30ActivePack.id || '',
    generatedFromStructuredJson: !!(window.__wave30ActivePack && window.__wave30ActivePack.generatedFromStructuredJson),
    structuredFamilySource: window.__wave30ActivePack && window.__wave30ActivePack.structuredFamilySource || '',
    secondQuestionStableOnCorrect: before === afterTrue,
    secondQuestionStableOnWrong: before === afterFalse,
    optsHasDataAttr: optsMarkup.indexOf('data-wave89u-diag-action="answer"') !== -1,
    optsHasInlineOnclick: optsMarkup.indexOf('onclick="') === -1,
    questionCount: questions.length
  };
})()`, null);

const failures = [];
Object.entries(staticReport).forEach(([key, ok]) => { if (!ok) failures.push(key); });
if (!bindingDetails.diag || bindingDetails.diag.actionAttr !== 'data-wave89u-diag-action' || bindingDetails.diag.answerIndexAttr !== 'data-wave89u-diag-answer-index' || !bindingDetails.diag.bound) failures.push('diag-binding-export');
if (!bindingDetails.diagTools || bindingDetails.diagTools.actionAttr !== 'data-wave89u-diag-tools-action' || bindingDetails.diagTools.modeAttr !== 'data-wave89u-diag-tools-mode' || !bindingDetails.diagTools.bound) failures.push('diag-tools-binding-export');
if (!bindingDetails.exam || bindingDetails.exam.actionAttr !== 'data-wave89u-exam-action' || bindingDetails.exam.packAttr !== 'data-wave89u-pack-id' || !bindingDetails.exam.bound) failures.push('exam-binding-export');
if (!examRuntime || !examRuntime.ok) failures.push('exam-runtime-start');
if (!examRuntime || !examRuntime.secondQuestionStableOnCorrect) failures.push('exam-freeze-correct');
if (!examRuntime || !examRuntime.secondQuestionStableOnWrong) failures.push('exam-freeze-wrong');
if (!examRuntime || !examRuntime.generatedFromStructuredJson) failures.push('exam-generated-from-json');
if (!examRuntime || examRuntime.structuredFamilySource !== 'json_bank') failures.push('exam-family-source-json');
if (!examRuntime || !examRuntime.optsHasDataAttr) failures.push('opts-data-attr');
if (!examRuntime || !examRuntime.optsHasInlineOnclick) failures.push('opts-inline-onclick');
if (loadErrors.length) failures.push('load-errors');

const report = {
  ok: failures.length === 0,
  built,
  staticReport,
  bindingDetails,
  examRuntime,
  loadErrors,
  failures
};

if (!report.ok) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(JSON.stringify(report, null, 2));
