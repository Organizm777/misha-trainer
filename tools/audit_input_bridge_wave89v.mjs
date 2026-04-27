#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = process.cwd();
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel){ return fs.existsSync(path.join(ROOT, rel)); }
function assert(condition, message){ if (!condition) throw new Error(message); }

const engineSrc = read('assets/_src/js/engine10.js');
const runtimeSrc = read('assets/_src/js/bundle_grade_runtime_inputs_timing_wave87x.js');
const mergedSrc = read('assets/_src/js/bundle_grade_runtime_extended_wave89b.js');
const manifest = JSON.parse(read('assets/asset-manifest.json'));

function built(logical){
  const rel = manifest.assets && manifest.assets[logical];
  assert(rel, `asset-manifest missing ${logical}`);
  assert(exists(rel), `missing built asset ${rel}`);
  return read(rel);
}

const engineBuilt = built('assets/js/engine10.js');
const mergedBuilt = built('assets/js/bundle_grade_runtime_extended_wave89b.js');
const runtimeBuilt = manifest.assets['assets/js/bundle_grade_runtime_inputs_timing_wave87x.js']
  ? built('assets/js/bundle_grade_runtime_inputs_timing_wave87x.js')
  : '';

function hasBridge(source){
  return source.includes('window.__wave89vStateBridge')
    && source.includes('bindWindowState("sel"')
    && source.includes('bindWindowState("prob"')
    && source.includes('bindWindowState("cS"')
    && source.includes('bindWindowState("cT"')
    && source.includes('bindWindowState("hintOn"')
    && source.includes('bindWindowState("shpOn"')
    && source.includes('bindWindowState("usedHelp"')
    && source.includes('bindWindowState("mix"')
    && source.includes('bindWindowState("globalMix"')
    && source.includes('bindWindowState("rushMode"')
    && source.includes('bindWindowState("diagMode"');
}

function hasRuntimeFallbacks(source){
  return source.includes('function lexicalValue(getter)')
    && source.includes('var lexicalQuestion = lexicalValue(function(){ return prob; });')
    && source.includes('var lexicalSubject = lexicalValue(function(){ return cS; });')
    && source.includes('function selectionValue()')
    && source.includes('function hasSelection()')
    && source.includes('function pageGrade()')
    && source.includes('var page = pageGrade();')
    && source.includes('if (page) return page >= 8;');
}

function explicitPrecedesGuard(source){
  const explicitIdx = source.indexOf('var explicit = explicitInputMode(question);');
  const guardIdx = source.indexOf("if (!autoInputEligible(question)) return '';");
  return explicitIdx >= 0 && guardIdx > explicitIdx;
}

function usesSafeSelectionChecks(source){
  return source.includes('input.disabled = hasSelection();')
    && !source.includes('input.disabled = root.sel !== null;')
    && source.includes("if (!question || hasSelection() || typeof root.ans !== 'function') return false;")
    && !source.includes("if (!question || root.sel !== null || typeof root.ans !== 'function') return false;");
}

function exportsHelpers(source){
  return source.includes('selectionValue: selectionValue')
    && source.includes('hasSelection: hasSelection')
    && source.includes('pageGrade: pageGrade');
}

function makeClassList(on){
  return {
    add(){}, remove(){}, toggle(){ return false; },
    contains(name){ return !!on && name === 'on'; }
  };
}

function makeElement(tag, opts = {}){
  return {
    tagName: String(tag || 'div').toUpperCase(),
    style: {}, dataset: {}, children: [], attributes: {}, disabled:false, value:'',
    classList: makeClassList(!!opts.on),
    appendChild(child){ this.children.push(child); return child; },
    insertBefore(child){ this.children.push(child); return child; },
    remove(){},
    setAttribute(k, v){ this.attributes[k] = String(v); },
    getAttribute(k){ return this.attributes[k] || null; },
    addEventListener(){}, removeEventListener(){},
    closest(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; },
    focus(){}, select(){},
    get innerHTML(){ return this._innerHTML || ''; },
    set innerHTML(v){ this._innerHTML = String(v); this.children = []; },
    get textContent(){ return this._textContent || ''; },
    set textContent(v){ this._textContent = String(v); }
  };
}

function makeDocument(onPlayScreen){
  const nodes = Object.create(null);
  function getNode(id){
    if (!nodes[id]) nodes[id] = makeElement('div', { on:id === 's-play' && onPlayScreen });
    return nodes[id];
  }
  return {
    currentScript: null,
    head: makeElement('head'),
    body: makeElement('body'),
    documentElement: makeElement('html'),
    createElement: makeElement,
    createTextNode(text){ return { nodeType:3, textContent:String(text) }; },
    addEventListener(){}, removeEventListener(){},
    querySelector(){ return null; }, querySelectorAll(){ return []; },
    getElementById(id){ return getNode(id); }
  };
}

function makeContext({ grade, onPlayScreen = true, subjectId = 'alg', selection = undefined }){
  const store = Object.create(null);
  const document = makeDocument(onPlayScreen);
  const ctx = {
    console: { log(){}, warn(){}, error(){}, info(){} },
    Math, Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError,
    parseInt, parseFloat, isFinite, isNaN, encodeURIComponent, decodeURIComponent,
    setTimeout(fn){ if (typeof fn === 'function') fn(); return 0; }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){},
    Promise,
    document,
    localStorage: {
      getItem(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem(k, v){ store[k] = String(v); }, removeItem(k){ delete store[k]; }, clear(){ Object.keys(store).forEach((k) => delete store[k]); }
    },
    navigator: { vibrate(){}, clipboard:{ writeText(){ return Promise.resolve(); } } },
    location: { href:`https://example.test/grade${grade}_v2.html`, search:'', pathname:`/grade${grade}_v2.html`, origin:'https://example.test' },
    history: { pushState(){}, replaceState(){} },
    matchMedia(){ return { matches:false, addEventListener(){}, removeEventListener(){} }; },
    URL: { createObjectURL(){ return 'blob:mock'; }, revokeObjectURL(){} },
    Blob: function Blob(parts, opts){ this.parts = parts; this.opts = opts; },
    fetch(){ return Promise.reject(new Error('network disabled in audit')); },
    GRADE_NUM: String(grade),
    rushMode: false,
    diagMode: false,
    globalMix: false,
    cS: { id:subjectId },
    prob: null,
    sel: selection,
    usedHelp: false,
    toast(){},
    ans(){},
    render(){},
    renderProg(){}
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.globalThis = ctx;
  ctx.addEventListener = function(){};
  ctx.removeEventListener = function(){};
  return vm.createContext(ctx);
}

assert(hasBridge(engineSrc), 'engine10 source: missing wave89v window-state bridge');
assert(hasBridge(engineBuilt), 'engine10 built asset: missing wave89v window-state bridge');
assert(hasRuntimeFallbacks(runtimeSrc), 'inputs timing source: missing lexical fallback / page-grade guard');
assert(hasRuntimeFallbacks(mergedSrc), 'merged runtime source: missing lexical fallback / page-grade guard');
assert(explicitPrecedesGuard(runtimeSrc), 'inputs timing source: explicit input mode must win before junior guard');
assert(explicitPrecedesGuard(mergedSrc), 'merged runtime source: explicit input mode must win before junior guard');
assert(usesSafeSelectionChecks(runtimeSrc), 'inputs timing source: missing safe hasSelection-based disable / submit checks');
assert(usesSafeSelectionChecks(mergedSrc), 'merged runtime source: missing safe hasSelection-based disable / submit checks');
assert(exportsHelpers(runtimeSrc), 'inputs timing source: missing exported helper debug hooks');
assert(exportsHelpers(mergedSrc), 'merged runtime source: missing exported helper debug hooks');
assert(hasRuntimeFallbacks(mergedBuilt), 'merged runtime built asset: missing lexical fallback / page-grade guard');
assert(usesSafeSelectionChecks(mergedBuilt), 'merged runtime built asset: missing safe selection checks');
if (runtimeBuilt) {
  assert(hasRuntimeFallbacks(runtimeBuilt), 'inputs timing built asset: missing lexical fallback / page-grade guard');
  assert(usesSafeSelectionChecks(runtimeBuilt), 'inputs timing built asset: missing safe selection checks');
}

const grade2Html = read('grade2_v2.html');
const grade10Html = read('grade10_v2.html');
assert(!grade2Html.includes('chunk_subject_expansion_wave89b_inputs_interactions_banks'), 'grade2_v2.html: unexpected explicit input-bank chunk');
assert(grade10Html.includes('chunk_subject_expansion_wave89b_inputs_interactions_banks'), 'grade10_v2.html: missing explicit input-bank chunk');

const juniorCtx = makeContext({ grade:2, onPlayScreen:true, subjectId:'alg', selection:undefined });
vm.runInContext(runtimeSrc, juniorCtx, { filename:'bundle_grade_runtime_inputs_timing_wave87x.js', timeout:1000 });
const juniorApi = juniorCtx.window.__wave87xInputTimingRuntime;
assert(juniorApi && juniorApi.version === 'wave87z', 'runtime export missing or wrong version in junior context');
assert(juniorApi.pageGrade() === 2, 'junior context: expected pageGrade() === 2');
assert(juniorApi.selectionValue() === null, 'junior context: undefined selection should normalize to null');
assert(juniorApi.hasSelection() === false, 'junior context: undefined selection must not count as an answered question');
assert(juniorApi.inputModeFor({ question:'Сколько будет 2+2?', answer:'4', isMath:true, grade:10 }) === '', 'junior page: auto input must stay off even if row metadata says grade 10');
assert(juniorApi.inputModeFor({ question:'Впиши слово', answer:'берёза', inputMode:'text', grade:10 }) === 'text', 'explicit inputMode must still win before the junior auto-input guard');

const seniorCtx = makeContext({ grade:10, onPlayScreen:true, subjectId:'alg', selection:undefined });
vm.runInContext(runtimeSrc, seniorCtx, { filename:'bundle_grade_runtime_inputs_timing_wave87x.js', timeout:1000 });
const seniorApi = seniorCtx.window.__wave87xInputTimingRuntime;
assert(seniorApi && seniorApi.version === 'wave87z', 'runtime export missing or wrong version in senior context');
assert(seniorApi.pageGrade() === 10, 'senior context: expected pageGrade() === 10');
assert(seniorApi.inputModeFor({ question:'Сколько будет 2+2?', answer:'4', isMath:true, grade:2 }) === 'numeric', 'senior page: page-grade guard must still allow numeric auto-input even if row metadata is low');
seniorCtx.window.prob = { question:'Вопрос', answer:'4' };
assert(seniorApi.currentQuestion() && seniorApi.currentQuestion().answer === '4', 'currentQuestion fallback should see active question from global state');
seniorCtx.window.cS = { id:'alg' };
assert(seniorApi.currentSubjectId() === 'alg', 'currentSubjectId fallback should see active subject from global state');
seniorCtx.window.sel = '4';
assert(seniorApi.selectionValue() === '4', 'selectionValue should return explicit selection');
assert(seniorApi.hasSelection() === true, 'hasSelection should become true after a selection appears');

console.log(JSON.stringify({
  ok: true,
  wave: 'wave89v',
  bridge: {
    source: hasBridge(engineSrc),
    built: hasBridge(engineBuilt)
  },
  runtimeFallbacks: {
    sourceRuntime: hasRuntimeFallbacks(runtimeSrc),
    sourceMerged: hasRuntimeFallbacks(mergedSrc),
    builtMerged: hasRuntimeFallbacks(mergedBuilt),
    builtRuntime: runtimeBuilt ? hasRuntimeFallbacks(runtimeBuilt) : 'not-built'
  },
  safeSelectionChecks: {
    sourceRuntime: usesSafeSelectionChecks(runtimeSrc),
    sourceMerged: usesSafeSelectionChecks(mergedSrc),
    builtMerged: usesSafeSelectionChecks(mergedBuilt),
    builtRuntime: runtimeBuilt ? usesSafeSelectionChecks(runtimeBuilt) : 'not-built'
  },
  pages: {
    grade2HasExplicitInputChunk: false,
    grade10HasExplicitInputChunk: true
  },
  behavior: {
    juniorAutoInput: juniorApi.inputModeFor({ question:'2+2', answer:'4', isMath:true, grade:10 }),
    juniorExplicitInput: juniorApi.inputModeFor({ question:'Впиши слово', answer:'берёза', inputMode:'text', grade:10 }),
    seniorAutoInput: seniorApi.inputModeFor({ question:'2+2', answer:'4', isMath:true, grade:2 })
  }
}, null, 2));
