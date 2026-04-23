#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const ROOT = process.cwd();
const topicIds = ['logic', 'cross', 'traps', 'deep'];
const topicRe = /^grade10_subject_oly_(logic|cross|traps|deep)_wave87c\.[a-f0-9]{10}\.js$/;
const shellRe = /^grade10_subject_oly_wave86s\.[a-f0-9]{10}\.js$/;
function read(rel){ return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function size(rel){ return fs.statSync(path.join(ROOT, rel)).size; }
function jsAssets(){ return fs.readdirSync(path.join(ROOT, 'assets/js')); }
function makeElement(){ return { dataset:{}, style:{}, classList:{ add(){}, remove(){} }, children:[], appendChild(child){ this.children.push(child); if(child && typeof child.onload === 'function') child.onload(); return child; }, addEventListener(){}, removeEventListener(){}, setAttribute(){}, getAttribute(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; }, closest(){ return null; } }; }
function makeContext(){
  const document = { currentScript:null, head:makeElement(), body:makeElement(), documentElement:makeElement(), createElement:makeElement, addEventListener(){}, removeEventListener(){}, querySelector(){ return null; }, querySelectorAll(){ return []; }, getElementById(){ return makeElement(); } };
  const ctx = { console, Math:Object.create(Math), Date, JSON, Number, String, Boolean, Array, Object, RegExp, Error, TypeError, SyntaxError, parseInt, parseFloat, isFinite, isNaN, setTimeout(fn){ if(typeof fn === 'function') fn(); return 0; }, clearTimeout(){}, Promise, document, localStorage:{ getItem(){ return null; }, setItem(){}, removeItem(){} }, navigator:{}, location:{ href:'https://example.test/grade10_v2.html' }, GRADE_NUM:'10' };
  ctx.Math.random = (() => { let s = 0x87c10; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0x100000000); })();
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx; ctx.addEventListener = function(){}; ctx.removeEventListener = function(){};
  return vm.createContext(ctx);
}
const helpers = `
const shuffle=o=>{const a=[...(o||[])];for(let i=a.length-1;i>0;i--){const j=0|Math.random()*(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=o=>o&&o.length?o[0|Math.random()*o.length]:undefined;
const range=(a,b)=>{const r=[];for(let i=a;i<=b;i++)r.push(i);return r};
const uniq=o=>(o||[]).filter((v,i,a)=>a.indexOf(v)===i);
const sup=o=>(o+'').split('').map(ch=>'⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻'['0123456789+-'.indexOf(ch)]||ch).join('');
function prepareOptions(options,answer,q){let list=uniq([answer].concat(Array.isArray(options)?options:[]).filter(v=>v!==undefined&&v!==null).map(String));if(!list.includes(String(answer)))list.unshift(String(answer));for(let i=1;list.length<4;i++){const v='вариант '+i;if(!list.includes(v))list.push(v)}return shuffle(list.slice(0,4));}
function mkQ(q,a,o,h,tag,color,bg,code,isMath,ex){const row={question:q,answer:String(a==null?'':a),options:prepareOptions(o,a,q),hint:h,tag,color,bg,code:code||null,isMath:!!isMath}; if(ex) row.ex=String(ex); return row;}
function fillW(answer,gens){let list=uniq([answer].concat((gens||[]).map(fn=>{try{return typeof fn==='function'?fn():fn}catch{return'?'}})).map(String));let n=0;while(list.length<4&&n++<10)(gens||[]).forEach(fn=>{try{const v=typeof fn==='function'?fn():fn;if(!list.includes(String(v)))list.push(String(v))}catch{}});while(list.length<4)list.push(String(pick(range(0,50))));return list;}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t}return a;}
`;
function run(ctx, rel){ ctx.document.currentScript = { src:'./' + rel, dataset:{} }; vm.runInContext(read(rel), ctx, { filename: rel, timeout: 1200 }); }
function validate(row){ const errors=[]; if(!row || typeof row !== 'object') return ['not object']; const q=String(row.question||'').trim(); const a=String(row.answer||'').trim(); const o=Array.isArray(row.options)?row.options.map(v=>String(v||'').trim()).filter(Boolean):[]; if(!q) errors.push('empty question'); if(!a) errors.push('empty answer'); if(o.length<4) errors.push('less than 4 options'); if(new Set(o).size!==o.length) errors.push('duplicate options'); if(a && !new Set(o).has(a)) errors.push('answer not in options'); return errors; }
const names = jsAssets();
const shell = names.find(n => shellRe.test(n));
const topicFiles = Object.fromEntries(topicIds.map(id => [id, names.find(n => topicRe.test(n) && n.includes(`_${id}_`))]));
const grade10DataFile = names.find(n => /^grade10_data\.[a-f0-9]{10}\.js$/.test(n));
const lazyFile = names.find(n => /^chunk_grade10_lazy_wave86s\.[a-f0-9]{10}\.js$/.test(n));
const manifest = JSON.parse(read('assets/asset-manifest.json'));
const sw = read('sw.js');
const grade10DataSource = read('assets/_src/js/grade10_data.js');
const missing = [];
if(!shell) missing.push('shell');
if(!grade10DataFile) missing.push('grade10_data');
if(!lazyFile) missing.push('chunk_grade10_lazy');
for(const id of topicIds) if(!topicFiles[id]) missing.push(id);
const swMissing = [];
for(const file of [shell, ...Object.values(topicFiles)].filter(Boolean)) if(!sw.includes(`./assets/js/${file}`)) swMissing.push(file);
const manifestMissing = [];
for(const [source, built] of [
  ['assets/js/grade10_subject_oly_wave86s.js', shell && `assets/js/${shell}`],
  ...topicIds.map(id => [`assets/js/grade10_subject_oly_${id}_wave87c.js`, topicFiles[id] && `assets/js/${topicFiles[id]}`])
]) if(!built || manifest.assets[source] !== built) manifestMissing.push(source);
const ctx = makeContext();
vm.runInContext(helpers, ctx, { filename:'helpers', timeout:1000 });
if(grade10DataFile) run(ctx, `assets/js/${grade10DataFile}`);
if(lazyFile) run(ctx, `assets/js/${lazyFile}`);
if(shell) run(ctx, `assets/js/${shell}`);
for(const id of topicIds) if(topicFiles[id]) run(ctx, `assets/js/${topicFiles[id]}`);
const snapshot = ctx.window.wave87cOlyLazy && ctx.window.wave87cOlyLazy.auditSnapshot ? ctx.window.wave87cOlyLazy.auditSnapshot() : null;
const sampleFailures = [];
const oly = (ctx.window.SUBJ || []).find(s => s && s.id === 'oly');
for(const topic of (oly && oly.tops || [])){
  for(let i=0;i<5;i++){
    try { const row = topic.gen(); const errs = validate(row); if(errs.length) sampleFailures.push({ topic: topic.id, sample:i+1, errors: errs, row }); }
    catch(err){ sampleFailures.push({ topic: topic.id, sample:i+1, error: err && err.message || String(err) }); }
  }
}
const shellSize = shell ? size(`assets/js/${shell}`) : 0;
const topicSizes = Object.fromEntries(topicIds.map(id => [id, topicFiles[id] ? size(`assets/js/${topicFiles[id]}`) : 0]));
const output = {
  ok: missing.length === 0 && swMissing.length === 0 && manifestMissing.length === 0 && sampleFailures.length === 0 && !!snapshot && snapshot.loadedTopics === 4,
  wave: 'wave87c', task: 'N5 split grade10_subject_oly', shell, shellSize, topicFiles, topicSizes,
  maxTopicSize: Math.max(...Object.values(topicSizes)), totalTopicSize: Object.values(topicSizes).reduce((a,b)=>a+b,0),
  grade10DataUsesShell: shell ? grade10DataSource.includes(shell) : false,
  swMissing, manifestMissing, missing, snapshot, sampleFailures
};
console.log(JSON.stringify(output, null, 2));
if(!output.ok) process.exit(1);
