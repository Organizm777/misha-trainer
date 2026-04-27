#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = process.cwd();
const runtimeSrc = fs.readFileSync(path.join(ROOT, 'assets/_src/js/bundle_grade_runtime_inputs_timing_wave87x.js'), 'utf8');

function assert(condition, message){ if (!condition) throw new Error(message); }
function makeClassList(on){
  return {
    add(){}, remove(){}, toggle(){ return false; },
    contains(name){ return !!on && name === 'on'; }
  };
}
function createDocument(onPlayScreen){
  const allNodes = [];
  function register(node){ allNodes.push(node); return node; }
  function traverse(node, visit){
    if (!node) return;
    visit(node);
    const children = Array.isArray(node.children) ? node.children : [];
    children.forEach((child) => traverse(child, visit));
  }
  function findById(id){
    let found = null;
    [document.head, document.body, document.documentElement].forEach((root) => {
      if (found || !root) return;
      traverse(root, (node) => {
        if (!found && node.id === id) found = node;
      });
    });
    if (found) return found;
    return allNodes.find((node) => node && node.id === id) || null;
  }
  function makeElement(tag, opts = {}){
    const node = {
      tagName: String(tag || 'div').toUpperCase(),
      style: {}, dataset: {}, attributes: {}, children: [], parentNode:null,
      classList: makeClassList(!!opts.on), disabled:false, value:'', id:opts.id || '',
      appendChild(child){ if (child) { child.parentNode = this; this.children.push(child); } return child; },
      insertBefore(child){ if (child) { child.parentNode = this; this.children.push(child); } return child; },
      remove(){ if (!this.parentNode) return; this.parentNode.children = this.parentNode.children.filter((child) => child !== this); this.parentNode = null; },
      setAttribute(name, value){ this.attributes[name] = String(value); if (name === 'id') this.id = String(value); },
      getAttribute(name){ return name === 'id' ? (this.id || null) : (this.attributes[name] || null); },
      addEventListener(){}, removeEventListener(){},
      closest(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; },
      focus(){}, select(){},
      get innerHTML(){ return this._innerHTML || ''; },
      set innerHTML(value){ this._innerHTML = String(value); this.children = []; },
      get textContent(){ return this._textContent || ''; },
      set textContent(value){ this._textContent = String(value); }
    };
    return register(node);
  }
  const document = {
    currentScript: null,
    head: null,
    body: null,
    documentElement: null,
    createElement: makeElement,
    createTextNode(text){ return register({ nodeType:3, textContent:String(text), children:[] }); },
    addEventListener(){}, removeEventListener(){},
    querySelector(){ return null; }, querySelectorAll(){ return []; },
    getElementById(id){
      if (id === 's-play') return findById(id) || register({ id, children:[], classList: makeClassList(onPlayScreen), appendChild(){}, insertBefore(){}, querySelector(){ return null; } });
      if (id === 'opts') {
        const existing = findById(id);
        if (existing) return existing;
        const node = makeElement('div');
        node.id = id;
        document.body.appendChild(node);
        return node;
      }
      if (id === 'fba' || id === 'prog-content') {
        const existing = findById(id);
        if (existing) return existing;
        const node = makeElement('div');
        node.id = id;
        document.body.appendChild(node);
        return node;
      }
      return findById(id);
    }
  };
  document.head = makeElement('head');
  document.body = makeElement('body');
  document.documentElement = makeElement('html');
  document.documentElement.appendChild(document.head);
  document.documentElement.appendChild(document.body);
  const playNode = makeElement('div', { on:onPlayScreen, id:'s-play' });
  document.body.appendChild(playNode);
  const optsNode = makeElement('div', { id:'opts' });
  document.body.appendChild(optsNode);
  return document;
}
function makeContext({ grade, question, selection = undefined }){
  const document = createDocument(true);
  const ctx = {
    console: { log(){}, warn(){}, error(){}, info(){} },
    Math, Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError,
    parseInt, parseFloat, isFinite, isNaN, encodeURIComponent, decodeURIComponent,
    setTimeout(fn){ if (typeof fn === 'function') fn(); return 0; }, clearTimeout(){}, setInterval(){ return 0; }, clearInterval(){},
    Promise,
    document,
    localStorage: { getItem(){ return null; }, setItem(){}, removeItem(){}, clear(){} },
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
    cS: { id:'alg' },
    prob: question,
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

function renderScenario({ grade, question, selection }){
  const ctx = makeContext({ grade, question, selection });
  vm.runInContext(runtimeSrc, ctx, { filename:'bundle_grade_runtime_inputs_timing_wave87x.js', timeout:1000 });
  ctx.render();
  const input = ctx.document.getElementById('wave87x-free-answer');
  const opts = ctx.document.getElementById('opts');
  return {
    hasInput: !!input,
    disabled: input ? !!input.disabled : null,
    value: input ? input.value : null,
    optsChildren: Array.isArray(opts && opts.children) ? opts.children.length : 0
  };
}

const junior = renderScenario({
  grade: 2,
  question: { question:'Сколько будет 2+2?', answer:'4', isMath:true, grade:10 },
  selection: undefined
});
const senior = renderScenario({
  grade: 10,
  question: { question:'Сколько будет 2+2?', answer:'4', isMath:true, grade:2 },
  selection: undefined
});
const answered = renderScenario({
  grade: 10,
  question: { question:'Сколько будет 2+2?', answer:'4', isMath:true, grade:2, __wave87xInputState:{ draft:'', lastValue:'4', lastCanonical:'4', mode:'numeric' } },
  selection: '4'
});

assert(junior.hasInput === false, 'grade 2 auto-mode: unexpected free-input widget rendered');
assert(senior.hasInput === true, 'grade 10 auto-mode: expected free-input widget to render');
assert(senior.disabled === false, 'grade 10 auto-mode: fresh free-input must stay editable');
assert(answered.hasInput === true, 'answered senior question: free-input widget should stay visible');
assert(answered.disabled === true, 'answered senior question: free-input widget should lock after answer');

console.log(JSON.stringify({
  ok: true,
  wave: 'wave89w',
  scenarios: { junior, senior, answered }
}, null, 2));
