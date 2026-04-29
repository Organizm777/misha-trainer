(function(){
  'use strict';
  var KEY='trainer_navigation_log_wave91j';
  var MAX=160;
  function parse(raw,fallback){try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}}
  function read(){try{var rows=parse(localStorage.getItem(KEY),[]);return Array.isArray(rows)?rows:[]}catch(_){return []}}
  function write(rows){try{localStorage.setItem(KEY,JSON.stringify(rows.slice(-MAX)))}catch(_){}}
  function clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim().slice(0,180)}
  function record(evt){
    var entry={ts:new Date().toISOString(),page:location.pathname||'/',kind:evt&&evt.kind||'navigation',target:clean(evt&&evt.target),href:clean(evt&&evt.href),meta:evt&&evt.meta||null};
    var rows=read(); rows.push(entry); write(rows);
    try{window.dispatchEvent(new CustomEvent('trainer:navigation-log',{detail:entry}))}catch(_){}
    return entry;
  }
  function download(){
    var payload=JSON.stringify({wave:'wave91j',exportedAt:new Date().toISOString(),rows:read()},null,2);
    try{var blob=new Blob([payload],{type:'application/json;charset=utf-8'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='trainer-navigation-log.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},0);return true}catch(_){return false}
  }
  window.TrainerNavigationLog={version:'wave91j',key:KEY,record:record,read:read,clear:function(){write([])},download:download};
  document.addEventListener('click',function(ev){
    var el=ev.target&&ev.target.closest?ev.target.closest('a,button,[data-action],[data-wave87r-action],[data-wave91j-action]'):null;
    if(!el)return;
    record({kind:el.tagName==='A'?'link':'action',target:el.getAttribute('aria-label')||el.textContent||el.getAttribute('data-action')||el.getAttribute('data-wave87r-action')||'',href:el.getAttribute('href')||'',meta:{id:el.id||'',className:clean(el.className||'')}});
  },true);
  record({kind:'pageview',target:document.title||location.pathname,href:location.href});
})();

;/* --- wave92d_indexeddb_analytics_install_accessibility.js --- */
(function(){
  'use strict';
  if (window.__wave92dUxBooted) return;
  window.__wave92dUxBooted = true;
  var DB_NAME = 'trainer3_events_wave92d';
  var STORE = 'events';
  var FALLBACK_KEY = 'trainer_events_fallback_wave92d';
  var DISMISS_KEY = 'trainer_install_dismissed_wave92d';
  var dbPromise = null;
  var installPrompt = null;
  function now(){ try { return new Date().toISOString(); } catch(_) { return String(Date.now()); } }
  function safeText(v, max){ return String(v == null ? '' : v).replace(/\s+/g,' ').trim().slice(0, max || 180); }
  function safeGet(k){ try { return localStorage.getItem(k); } catch(_) { return null; } }
  function safeSet(k,v){ try { localStorage.setItem(k,v); } catch(_) {} }
  function page(){ try { return (location.pathname || '/').split('/').pop() || 'index.html'; } catch(_) { return 'unknown'; } }
  function grade(){ try { return window.GRADE_NUM || document.documentElement.getAttribute('data-grade') || document.body.getAttribute('data-grade') || null; } catch(_) { return null; } }
  function openDb(){
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function(resolve, reject){
      if (!('indexedDB' in window)) { reject(new Error('indexedDB unavailable')); return; }
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function(){
        var db = req.result;
        var store = db.objectStoreNames.contains(STORE) ? req.transaction.objectStore(STORE) : db.createObjectStore(STORE, { keyPath:'id', autoIncrement:true });
        if (!store.indexNames.contains('by_ts')) store.createIndex('by_ts','ts');
        if (!store.indexNames.contains('by_kind')) store.createIndex('by_kind','kind');
        if (!store.indexNames.contains('by_page')) store.createIndex('by_page','page');
      };
      req.onsuccess = function(){ resolve(req.result); };
      req.onerror = function(){ reject(req.error || new Error('indexedDB open failed')); };
    });
    return dbPromise;
  }
  function fallback(entry){
    try {
      var rows = JSON.parse(safeGet(FALLBACK_KEY) || '[]');
      if (!Array.isArray(rows)) rows = [];
      rows.push(entry);
      safeSet(FALLBACK_KEY, JSON.stringify(rows.slice(-300)));
    } catch(_) {}
  }
  function track(kind, meta){
    var entry = { ts: now(), kind: safeText(kind || 'event', 64), page: page(), grade: grade(), meta: meta || {} };
    openDb().then(function(db){
      try {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).add(entry);
      } catch(_) { fallback(entry); }
    }).catch(function(){ fallback(entry); });
    try { window.dispatchEvent(new CustomEvent('trainer:event', { detail: entry })); } catch(_) {}
    return entry;
  }
  function readAll(cb){
    openDb().then(function(db){
      var tx = db.transaction(STORE, 'readonly');
      var req = tx.objectStore(STORE).getAll();
      req.onsuccess = function(){ cb(req.result || []); };
      req.onerror = function(){ cb([]); };
    }).catch(function(){
      try { cb(JSON.parse(safeGet(FALLBACK_KEY) || '[]') || []); } catch(_) { cb([]); }
    });
  }
  function clearAll(cb){
    openDb().then(function(db){
      var tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = function(){ safeSet(FALLBACK_KEY, '[]'); if(cb) cb(true); };
      tx.onerror = function(){ if(cb) cb(false); };
    }).catch(function(){ safeSet(FALLBACK_KEY, '[]'); if(cb) cb(true); });
  }
  window.trainerEvents = window.trainerEvents || {};
  window.trainerEvents.track = track;
  window.trainerEvents.readAll = readAll;
  window.trainerEvents.clearAll = clearAll;
  window.trainerEvents.dbName = DB_NAME;
  function inPlay(){
    var s = document.getElementById('s-play') || document.getElementById('play') || document.querySelector('[data-screen="play"].on');
    return !!(s && /\bon\b|\bactive\b/.test(String(s.className || '')));
  }
  function standalone(){
    try { return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || !!navigator.standalone; } catch(_) { return false; }
  }
  function ensureStyle(){
    if (document.getElementById('wave92d-ux-style')) return;
    var st = document.createElement('style');
    st.id = 'wave92d-ux-style';
    st.textContent = ''+
      '.wave92d-install-banner{position:fixed;left:max(12px,env(safe-area-inset-left,0px));right:max(12px,env(safe-area-inset-right,0px));bottom:calc(76px + env(safe-area-inset-bottom,0px));z-index:9999;display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--border,#e2e0d8);border-radius:18px;background:var(--card,#fff);color:var(--text,#1a1a2e);box-shadow:0 18px 42px rgba(0,0,0,.18);font:600 13px/1.35 Golos Text,system-ui,sans-serif}'+
      '.wave92d-install-banner[hidden]{display:none!important}.wave92d-install-copy{flex:1;min-width:0}.wave92d-install-title{font-weight:900;margin-bottom:2px}.wave92d-install-sub{color:var(--muted,#6b6a74);font-size:12px}.wave92d-install-actions{display:flex;gap:8px}.wave92d-install-actions button{min-height:44px;border-radius:12px;border:1px solid var(--border,#e2e0d8);padding:0 12px;font-weight:800;background:var(--chip,#eef2ff);color:var(--text,#1a1a2e)}.wave92d-install-actions .primary{border-color:transparent;background:var(--accent,#2563eb);color:#fff}'+
      '#wave24-bottom-nav a,#wave24-bottom-nav button{min-height:44px!important}'+
      'button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:3px solid var(--accent,#2563eb)!important;outline-offset:3px!important}'+
      '@media (min-width:1024px){.wave92d-install-banner{max-width:430px;left:auto;bottom:22px}}@media (prefers-reduced-motion:reduce){.wave92d-install-banner,*{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important}}';
    document.head.appendChild(st);
  }
  function renderInstall(){
    if (!document.body) return;
    ensureStyle();
    var old = document.getElementById('wave92d-install-banner');
    if (standalone() || safeGet(DISMISS_KEY) === '1' || !installPrompt || inPlay()) { if(old) old.hidden = true; return; }
    var node = old;
    if (!node) {
      node = document.createElement('section');
      node.id = 'wave92d-install-banner';
      node.className = 'wave92d-install-banner';
      node.setAttribute('role','region');
      node.setAttribute('aria-label','Установка приложения');
      node.innerHTML = '<div class="wave92d-install-copy"><div class="wave92d-install-title">Установить тренажёр?</div><div class="wave92d-install-sub">Будет открываться как приложение и работать офлайн.</div></div><div class="wave92d-install-actions"><button type="button" data-wave92d-dismiss>Позже</button><button type="button" class="primary" data-wave92d-install>Установить</button></div>';
      document.body.appendChild(node);
      node.querySelector('[data-wave92d-dismiss]').addEventListener('click', function(){ safeSet(DISMISS_KEY,'1'); node.hidden = true; track('install_dismiss'); });
      node.querySelector('[data-wave92d-install]').addEventListener('click', function(){
        var p = installPrompt; if(!p) return;
        track('install_prompt_open');
        try { p.prompt(); Promise.resolve(p.userChoice).then(function(choice){ track('install_choice', { outcome: choice && choice.outcome || 'unknown' }); installPrompt = null; node.hidden = true; }); } catch(_) { node.hidden = true; }
      });
    }
    node.hidden = false;
  }
  function annotate(){
    if (!document.body) return;
    ensureStyle();
    var main = document.querySelector('main') || document.querySelector('.scr.on .w') || document.querySelector('.w');
    if (main) { if(!main.id) main.id = 'main-content'; main.setAttribute('role','main'); }
    var skip = document.getElementById('wave92d-skip');
    if (!skip && main) {
      skip = document.createElement('a'); skip.id = 'wave92d-skip'; skip.className = 'skip-link'; skip.href = '#' + main.id; skip.textContent = 'К основному содержимому'; document.body.insertBefore(skip, document.body.firstChild);
    }
    var opts = document.getElementById('opts');
    if (opts) { opts.setAttribute('role','radiogroup'); opts.setAttribute('aria-label','Варианты ответа');
      Array.prototype.forEach.call(opts.querySelectorAll('button,.opt'), function(el, idx){ if(!el.getAttribute('aria-label')) el.setAttribute('aria-label','Вариант ответа ' + (idx + 1) + ': ' + safeText(el.textContent, 90)); });
    }
    Array.prototype.forEach.call(document.querySelectorAll('#wave24-bottom-nav,nav'), function(nav){ if(!nav.getAttribute('aria-label')) nav.setAttribute('aria-label','Навигация'); });
    renderInstall();
  }
  function bindClicks(){
    document.addEventListener('click', function(ev){
      var el = ev.target && ev.target.closest ? ev.target.closest('a,button,[role="button"],.card,.scard,.tbtn,.opt') : null;
      if (!el) return;
      var kind = el.classList && el.classList.contains('opt') ? 'answer_click' : 'ui_click';
      track(kind, { id: el.id || '', text: safeText(el.getAttribute('aria-label') || el.textContent, 120), href: el.getAttribute && el.getAttribute('href') || '' });
    }, true);
  }
  function wrap(name, kind, metaFn){
    var fn = window[name];
    if (typeof fn !== 'function' || fn.__wave92dTracked) return;
    var wrapped = function(){
      var args = arguments, out;
      try { out = fn.apply(this, args); } finally { try { track(kind || name, metaFn ? metaFn(args) : { args: Array.prototype.slice.call(args,0,3).map(function(v){return safeText(v,80);}) }); } catch(_) {} }
      return out;
    };
    wrapped.__wave92dTracked = true;
    wrapped.__wave92dOrig = fn;
    window[name] = wrapped;
  }
  function wrapGlobals(){
    wrap('go','screen_change', function(args){ return { target: safeText(args && args[0],80) }; });
    wrap('startQuiz','quiz_start', function(){ return { grade: grade() }; });
    wrap('endSession','quiz_end', function(){ try { return { ok: window.st && window.st.ok, err: window.st && window.st.err }; } catch(_) { return {}; } });
    wrap('ans','answer_submit', function(args){
      var idx = args && args[0], value = null, correct = null;
      try { value = window.prob && window.prob.options ? window.prob.options[idx] : null; correct = window.prob ? value === window.prob.answer : null; } catch(_) {}
      return { index: idx, correct: correct, topic: safeText(window.prob && window.prob.tag,80) };
    });
    wrap('startDiag','diagnostic_start'); wrap('showResult','diagnostic_result');
  }
  function init(){
    if (!document.body) return;
    annotate(); bindClicks(); wrapGlobals(); track('page_view', { title: safeText(document.title,120), standalone: standalone() });
    window.addEventListener('beforeinstallprompt', function(e){ try { e.preventDefault(); } catch(_) {} installPrompt = e; track('install_available'); renderInstall(); });
    window.addEventListener('appinstalled', function(){ installPrompt = null; safeSet(DISMISS_KEY,'1'); track('install_done'); renderInstall(); });
    try { new MutationObserver(function(){ annotate(); wrapGlobals(); }).observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class','hidden'] }); } catch(_) {}
    setInterval(wrapGlobals, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else init();
})();
