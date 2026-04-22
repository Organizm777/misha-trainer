#!/usr/bin/env node
const fs=require('fs'), path=require('path'), vm=require('vm');
function makeClassList(){return {add(){},remove(){},toggle(){},contains(){return false;}}}
function el(){return {style:{},dataset:{},classList:makeClassList(),children:[],attributes:{},appendChild(c){this.children.push(c); if(c&&typeof c.onload==='function') setTimeout(c.onload,0); return c;},addEventListener(){},removeEventListener(){},setAttribute(k,v){this.attributes[k]=String(v)},getAttribute(k){return this.attributes[k]||null},hasAttribute(k){return Object.prototype.hasOwnProperty.call(this.attributes,k)},removeAttribute(k){delete this.attributes[k]},querySelector(){return null},querySelectorAll(){return []},closest(){return null},remove(){},animate(){return {onfinish:null}},innerHTML:'',textContent:'',insertAdjacentHTML(){}};}
const doc={currentScript:null,head:el(),body:el(),documentElement:el(),createElement(){return el()},createTextNode(t){return {textContent:String(t)}},addEventListener(){},removeEventListener(){},querySelector(){return null},querySelectorAll(sel){return []},getElementById(id){return el()}};
const backing={};
function Storage(){};
Storage.prototype.getItem=function(k){return Object.prototype.hasOwnProperty.call(backing,k)?backing[k]:null};
Storage.prototype.setItem=function(k,v){backing[k]=String(v)};
Storage.prototype.removeItem=function(k){delete backing[k]};
Storage.prototype.clear=function(){Object.keys(backing).forEach(k=>delete backing[k])};
Storage.prototype.key=function(i){return Object.keys(backing)[i]||null};
const localStorage=new Storage();Object.defineProperty(localStorage,'length',{get(){return Object.keys(backing).length}});
const ctx={console:{log(){},warn(){},error(){},info(){}},document:doc,window:null,self:null,globalThis:null,Storage,localStorage,sessionStorage:new Storage(),navigator:{clipboard:{writeText(){return Promise.resolve()}},share(){return Promise.resolve()},vibrate(){},serviceWorker:{register(){return Promise.resolve({})},addEventListener(){},controller:{}}},location:{href:'https://example.test/diagnostic.html',origin:'https://example.test',pathname:'/diagnostic.html',search:''},history:{pushState(){},replaceState(){}},matchMedia(){return {matches:false,addEventListener(){},removeEventListener(){}}},setTimeout(fn){return 0},clearTimeout(){},setInterval(){return 0},clearInterval(){},alert(){},prompt(){return ''},confirm(){return true},scrollTo(){},fetch(){return Promise.reject(new Error('offline'))},URL:{createObjectURL(){return 'blob:x'},revokeObjectURL(){}},Blob:function(){},MutationObserver:function(){this.observe=function(){};this.disconnect=function(){}},Promise,Math,Date,JSON,Array,Object,String,Number,RegExp,Error,parseInt,parseFloat,isFinite,isNaN};
ctx.window=ctx;ctx.self=ctx;ctx.globalThis=ctx;ctx.addEventListener=()=>{};ctx.removeEventListener=()=>{};
vm.createContext(ctx);
const html=fs.readFileSync('diagnostic.html','utf8');
const scripts=[...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)].map(m=>m[1].replace(/^\.\//,''));
const errors=[];
for(const src of scripts){try{doc.currentScript={src:'./'+src,dataset:{}};vm.runInContext(fs.readFileSync(src,'utf8'),ctx,{filename:src,timeout:1000});}catch(e){errors.push({src,error:e.message});}}
function safeEval(expr, fallback){try{return vm.runInContext(expr,ctx,{timeout:1000})}catch(e){return fallback}}
const qbankKeys=safeEval('Object.keys(QBANK)',[]);
const subjectCount=safeEval('SUBJECTS.length',0);
const report = {ok: errors.length === 0 && scripts.length === 24 && qbankKeys.length >= 10 && subjectCount >= 10 && typeof ctx.startDiag === 'function' && typeof ctx.shareResult === 'function', scripts:scripts.length, errors, qbankKeys, subjectCount, hasStartDiag:typeof ctx.startDiag==='function', hasShareResult:typeof ctx.shareResult==='function'};
console.log(JSON.stringify(report,null,2));
if(!report.ok) process.exit(1);
