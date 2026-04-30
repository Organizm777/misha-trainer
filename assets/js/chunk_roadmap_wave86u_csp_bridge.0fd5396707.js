(function(){
  'use strict';
  var VERSION = 'wave86u';
  var DATA_PREFIX = 'data-wave86u-on-';
  var ACTION_MARKER_ATTR = 'data-wave87r-action';
  var EVENTS = ['click','input','change','keydown','load','error'];
  var stats = { stripped: 0, executed: 0, blocked: 0, byEvent: {}, lastBlocked: null };

  function bootTheme(){
    try{
      var t = localStorage.getItem('trainer_theme') || 'system';
      if(t && t !== 'system') document.documentElement.setAttribute('data-theme', t);
      else document.documentElement.removeAttribute('data-theme');
    }catch(e){}
  }

  function attrName(type){ return 'on' + type; }
  function dataName(type){ return DATA_PREFIX + type; }
  function hasInlineHandler(el){
    if(!el || el.nodeType !== 1) return false;
    for(var i=0;i<EVENTS.length;i++) if(el.hasAttribute(attrName(EVENTS[i]))) return true;
    return false;
  }
  function scrubElement(el){
    if(!el || el.nodeType !== 1) return;
    for(var i=0;i<EVENTS.length;i++){
      var type = EVENTS[i];
      var name = attrName(type);
      if(el.hasAttribute(name)){
        var code = el.getAttribute(name) || '';
        if(code && !el.hasAttribute(dataName(type))) el.setAttribute(dataName(type), code);
        el.removeAttribute(name);
        stats.stripped++;
        stats.byEvent[type] = (stats.byEvent[type] || 0) + 1;
      }
    }
  }
  function scan(root){
    if(!root) return;
    if(root.nodeType === 1) scrubElement(root);
    if(root.querySelectorAll){
      var selector = EVENTS.map(function(type){ return '[' + attrName(type) + ']'; }).join(',');
      var list = root.querySelectorAll(selector);
      for(var i=0;i<list.length;i++) scrubElement(list[i]);
    }
  }
  function installScrubber(){
    if(typeof document === 'undefined' || !document.documentElement) return;
    scan(document.documentElement);
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ scan(document.documentElement); }, {once:true});
    try{
      var mo = new MutationObserver(function(records){
        for(var i=0;i<records.length;i++){
          var rec = records[i];
          if(rec.type === 'attributes') scrubElement(rec.target);
          if(rec.addedNodes){
            for(var j=0;j<rec.addedNodes.length;j++) scan(rec.addedNodes[j]);
          }
        }
      });
      mo.observe(document.documentElement, {childList:true, subtree:true, attributes:true, attributeFilter: EVENTS.map(attrName)});
    }catch(e){}
  }

  function findActionTarget(start, type){
    var data = dataName(type);
    for(var el=start; el && el !== document; el = el.parentElement){
      if(el.nodeType === 1 && el.hasAttribute(data)) return el;
      if(el.nodeType === 1 && el.hasAttribute(attrName(type))){ scrubElement(el); if(el.hasAttribute(data)) return el; }
    }
    return null;
  }
  function stripOuterParens(s){
    s = String(s || '').trim();
    while(s[0] === '(' && s[s.length-1] === ')'){
      var d=0, ok=true, q=null, esc=false;
      for(var i=0;i<s.length;i++){
        var ch=s[i];
        if(q){ if(esc) esc=false; else if(ch==='\\') esc=true; else if(ch===q) q=null; continue; }
        if(ch === '"' || ch === "'" || ch === '`'){ q=ch; continue; }
        if(ch==='(') d++;
        if(ch===')') d--;
        if(d===0 && i<s.length-1){ ok=false; break; }
      }
      if(!ok) break;
      s = s.slice(1,-1).trim();
    }
    return s;
  }
  function splitTopLevel(src, sep){
    var out=[], buf='', q=null, esc=false, p=0, b=0, c=0;
    for(var i=0;i<src.length;i++){
      var ch=src[i];
      if(q){ buf+=ch; if(esc) esc=false; else if(ch==='\\') esc=true; else if(ch===q) q=null; continue; }
      if(ch === '"' || ch === "'" || ch === '`'){ q=ch; buf+=ch; continue; }
      if(ch==='(') p++; else if(ch===')') p=Math.max(0,p-1);
      else if(ch==='[') b++; else if(ch===']') b=Math.max(0,b-1);
      else if(ch==='{') c++; else if(ch==='}') c=Math.max(0,c-1);
      if(ch===sep && p===0 && b===0 && c===0){ if(buf.trim()) out.push(buf.trim()); buf=''; }
      else buf+=ch;
    }
    if(buf.trim()) out.push(buf.trim());
    return out;
  }
  function splitStatements(src){ return splitTopLevel(String(src || ''), ';'); }
  function unquote(s){
    s = String(s || '').trim();
    if((s[0] === '"' && s[s.length-1] === '"') || (s[0] === "'" && s[s.length-1] === "'")){
      try{ return JSON.parse('"' + s.slice(1,-1).replace(/\\'/g,"'").replace(/"/g,'\\"') + '"'); }
      catch(e){ return s.slice(1,-1).replace(/\\'/g,"'").replace(/\\"/g,'"').replace(/\\n/g,'\n'); }
    }
    return s;
  }
  function topLevelIndex(src, token){
    var q=null, esc=false, p=0, b=0, c=0;
    for(var i=0;i<=src.length-token.length;i++){
      var ch=src[i];
      if(q){ if(esc) esc=false; else if(ch==='\\') esc=true; else if(ch===q) q=null; continue; }
      if(ch === '"' || ch === "'" || ch === '`'){ q=ch; continue; }
      if(ch==='(') p++; else if(ch===')') p=Math.max(0,p-1);
      else if(ch==='[') b++; else if(ch===']') b=Math.max(0,b-1);
      else if(ch==='{') c++; else if(ch==='}') c=Math.max(0,c-1);
      if(p===0 && b===0 && c===0 && src.slice(i,i+token.length)===token) return i;
    }
    return -1;
  }
  function parseArgs(src, el, event){
    src = String(src || '').trim();
    if(!src) return [];
    return splitTopLevel(src, ',').map(function(part){ return parseExpr(part, el, event); });
  }
  function parseExpr(expr, el, event){
    var s = stripOuterParens(String(expr || '').trim());
    if(!s) return undefined;
    var plus = splitTopLevel(s, '+');
    if(plus.length > 1) return plus.map(function(x){ var v=parseExpr(x, el, event); return v == null ? '' : String(v); }).join('');
    var orIdx = topLevelIndex(s, '||');
    if(orIdx >= 0){
      var left = parseExpr(s.slice(0, orIdx), el, event);
      return left || parseExpr(s.slice(orIdx+2), el, event);
    }
    if(s === 'this') return el;
    if(s === 'event') return event;
    if(s === 'this.value') return el && 'value' in el ? el.value : '';
    if(s === 'true' || s === '!0') return true;
    if(s === 'false' || s === '!1') return false;
    if(s === 'null') return null;
    if(/^[-]?\d+(?:\.\d+)?$/.test(s)) return Number(s);
    if((s[0] === '"' && s[s.length-1] === '"') || (s[0] === "'" && s[s.length-1] === "'")) return unquote(s);
    var m;
    if((m = /^decodeURIComponent\(([\s\S]*)\)$/.exec(s))) return decodeURIComponent(String(parseExpr(m[1], el, event) || ''));
    if((m = /^document\.getElementById\(([\s\S]*)\)\.value$/.exec(s))){
      var node = document.getElementById(parseExpr(m[1], el, event));
      return node && 'value' in node ? node.value : '';
    }
    if((m = /^document\.getElementById\(([\s\S]*)\)$/.exec(s))) return document.getElementById(parseExpr(m[1], el, event));
    if((m = /^this\.closest\(([\s\S]*)\)$/.exec(s))) return el && el.closest ? el.closest(parseExpr(m[1], el, event)) : null;
    if((m = /^window\.([A-Za-z_$][\w$]*)$/.exec(s))) return window[m[1]];
    if((m = /^([A-Za-z_$][\w$]*)$/.exec(s))) return window[m[1]];
    return undefined;
  }
  function resolvePath(path){
    path = String(path || '').replace(/^window\./,'');
    if(!/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(path)) return null;
    var parts = path.split('.'), ctx = window, obj = window;
    for(var i=0;i<parts.length;i++){
      ctx = obj;
      obj = obj && obj[parts[i]];
    }
    return {ctx: ctx, value: obj};
  }
  function callPath(path, args){
    var res = resolvePath(path);
    if(!res || typeof res.value !== 'function') throw new Error('Blocked or missing handler: ' + path);
    return res.value.apply(res.ctx, args || []);
  }
  function assignGlobal(stmt){
    var m = /^([A-Za-z_$][\w$]*)\s*=\s*([\s\S]+)$/.exec(stmt);
    if(!m) return false;
    var name=m[1], rhs=stripOuterParens(m[2]);
    if(rhs === '!' + name) window[name] = !window[name];
    else window[name] = parseExpr(rhs, null, null);
    return true;
  }
  function customNameFlow(stmt, el){
    var m = /document\.getElementById\(['"]([^'"]+)['"]\)/.exec(stmt);
    if(!m || !/registerPlayer\(/.test(stmt)) return false;
    var input = document.getElementById(m[1]);
    var value = ((input && input.value) || '').trim();
    if(value) callPath('registerPlayer', [value, el && el.closest ? el.closest('div[style*=fixed]') : null]);
    else if(input && input.focus) input.focus();
    return true;
  }
  function executeIf(stmt, el, event){
    var m;
    if((m = /^if\s*\(\s*event\.key\s*={2,3}\s*(['"])(.*?)\1\s*\)\s*\{([\s\S]*)\}$/.exec(stmt))){
      if(event && event.key === m[2]) executeCode(m[3], el, event);
      return true;
    }
    if((m = /^if\s*\(\s*confirm\((.*?)\)\s*\)\s*\{([\s\S]*)\}$/.exec(stmt))){
      var msg = parseExpr(m[1], el, event);
      if(window.confirm(String(msg == null ? '' : msg))) executeCode(m[2], el, event);
      return true;
    }
    if((m = /^if\s*\(\s*([A-Za-z_$][\w$]*)\s*\)\s*([A-Za-z_$][\w$]*)\s*=\s*([\s\S]+)$/.exec(stmt))){
      if(window[m[1]]) window[m[2]] = parseExpr(m[3], el, event);
      return true;
    }
    return false;
  }
  function executeStatement(stmt, el, event){
    stmt = String(stmt || '').trim();
    if(!stmt) return;
    stmt = stmt.replace(/\\'/g, "'").replace(/\\"/g, '"');
    if(customNameFlow(stmt, el)) return;
    if(executeIf(stmt, el, event)) return;
    var comma = splitTopLevel(stmt, ',');
    if(comma.length > 1){ comma.forEach(function(part){ executeStatement(part, el, event); }); return; }
    var q = topLevelIndex(stmt, '?');
    if(q >= 0){
      var colon = topLevelIndex(stmt.slice(q+1), ':');
      if(colon >= 0){
        var cond = stripOuterParens(stmt.slice(0,q));
        executeStatement(window[cond] ? stmt.slice(q+1, q+1+colon) : stmt.slice(q+2+colon), el, event);
        return;
      }
    }
    var m;
    if(stmt === 'event.stopPropagation()'){ if(event) event.stopPropagation(); return; }
    if(stmt === 'event.preventDefault()'){ if(event) event.preventDefault(); return; }
    if((m = /^this\.closest\(([\s\S]+)\)\.remove\(\)$/.exec(stmt))){ var c = el && el.closest ? el.closest(parseExpr(m[1], el, event)) : null; if(c) c.remove(); return; }
    if((m = /^this\.closest\(([\s\S]+)\)\s*&&\s*this\.closest\(([\s\S]+)\)\.remove\(\)$/.exec(stmt))){ var c2 = el && el.closest ? el.closest(parseExpr(m[1], el, event)) : null; if(c2) c2.remove(); return; }
    if((m = /^const\s+([A-Za-z_$][\w$]*)\s*=\s*this\.closest\(([\s\S]+)\)$/.exec(stmt))){ window.__wave86uTemp = el && el.closest ? el.closest(parseExpr(m[2], el, event)) : null; return; }
    if(stmt === 'm&&m.remove()' || stmt === 'm && m.remove()'){ if(window.__wave86uTemp) window.__wave86uTemp.remove(); return; }
    if((m = /^localStorage\.removeItem\(([\s\S]+)\)$/.exec(stmt))){ try{ localStorage.removeItem(String(parseExpr(m[1], el, event))); }catch(e){} return; }
    if((m = /^localStorage\.setItem\(([\s\S]+)\)$/.exec(stmt))){ var aa=parseArgs(m[1], el, event); try{ localStorage.setItem(String(aa[0]), String(aa[1])); }catch(e){} return; }
    if((m = /^document\.getElementById\((.*?)\)\s*&&\s*document\.getElementById\((.*?)\)\.scrollIntoView\(([\s\S]*)\)$/.exec(stmt))){ var node=document.getElementById(parseExpr(m[1], el, event)); if(node && node.scrollIntoView) node.scrollIntoView({behavior:'smooth',block:'center'}); return; }
    if((m = /^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*&&\s*\1\(\)$/.exec(stmt))){ var r=resolvePath(m[1]); if(r && typeof r.value === 'function') r.value.call(r.ctx); return; }
    if((m = /^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\((.*)\)$/.exec(stmt))){ callPath(m[1], parseArgs(m[2], el, event)); return; }
    if(assignGlobal(stmt)) return;
    stats.blocked++;
    stats.lastBlocked = stmt;
    if(window.console && console.warn) console.warn('[wave86u CSP bridge] blocked inline handler:', stmt);
  }
  function executeCode(code, el, event){
    if(customNameFlow(String(code || '').replace(/\\'/g, "'").replace(/\\"/g, '"'), el)) return;
    splitStatements(code).forEach(function(stmt){ executeStatement(stmt, el, event); });
  }
  function handler(type){
    return function(event){
      var el = findActionTarget(event.target, type);
      if(!el) return;
      var code = el.getAttribute(dataName(type)) || '';
      if(!code) return;
      if(type === 'click') event.preventDefault();
      try{
        executeCode(code, el, event);
        stats.executed++;
      }catch(err){
        stats.blocked++;
        stats.lastBlocked = code;
        if(window.console && console.warn) console.warn('[wave86u CSP bridge] handler failed:', err, code);
      }
    };
  }
  function installDelegates(){
    if(typeof document === 'undefined' || typeof document.addEventListener !== 'function') return;
    EVENTS.forEach(function(type){ document.addEventListener(type, handler(type), true); });
  }

  bootTheme();
  installScrubber();
  installDelegates();

  window.wave86uCspBridge = {
    version: VERSION,
    scan: scan,
    auditSnapshot: function(){
      var meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      var content = meta ? meta.getAttribute('content') || '' : '';
      return {
        version: VERSION,
        stripped: stats.stripped,
        executed: stats.executed,
        blocked: stats.blocked,
        byEvent: Object.assign({}, stats.byEvent),
        lastBlocked: stats.lastBlocked,
        scriptSrcHasUnsafeInline: /script-src[^;]*unsafe-inline/.test(content),
        inlineHandlerAttrsLeft: document.querySelectorAll(EVENTS.map(function(type){ return '[' + attrName(type) + ']'; }).join(',')).length,
        staticActionAttrs: document.querySelectorAll('[' + ACTION_MARKER_ATTR + ']').length,
        legacyStaticActionAttrs: document.querySelectorAll('[data-wave86u-on-click],[data-wave86u-on-input],[data-wave86u-on-change],[data-wave86u-on-keydown]').length
      };
    }
  };
})();
;
/* --- wave92g_mobile_a11y_security.js --- */
(function(){
  'use strict';
  if (window.__wave92gBooted) return;
  window.__wave92gBooted = true;

  var VERSION = 'wave92g';
  var KEY = {
    font: 'trainer_font_size_wave92g',
    contrast: 'trainer_high_contrast_wave92g',
    dyslexia: 'trainer_dyslexia_wave92g',
    haptic: 'trainer_haptics_wave92g',
    seen: 'trainer_seen_wave92g',
    schema: 'trainer_storage_schema_version',
    lastPurge: 'trainer_data_purge_wave92g',
    scrollPrefix: 'trainer_scroll_wave92g:'
  };

  function now(){
    try { return new Date().toISOString(); } catch(_) { return String(Date.now()); }
  }
  function page(){
    try {
      var p = (location.pathname || '').split('/').pop();
      return p || 'index.html';
    } catch(_) {
      return 'index.html';
    }
  }
  function safeText(v, max){
    return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max || 180);
  }
  function get(k){
    try { return localStorage.getItem(k); } catch(_) { return null; }
  }
  function set(k, v){
    try { localStorage.setItem(k, String(v)); } catch(_) {}
    try {
      if (window.trainerStore && typeof window.trainerStore.set === 'function') {
        window.trainerStore.set(k, String(v));
      }
    } catch(_) {}
  }
  function del(k){
    try { localStorage.removeItem(k); } catch(_) {}
    try {
      if (window.trainerStore && typeof window.trainerStore.remove === 'function') {
        window.trainerStore.remove(k);
      }
    } catch(_) {}
  }
  function ready(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }
  function inPlay(){
    var p = document.getElementById('s-play');
    return !!(p && /\bon\b/.test(' ' + p.className + ' ') && !p.hidden);
  }
  function isGradePage(){
    return /^grade\d+_v2\.html$/.test(page());
  }
  function rootIsSimple(){
    return document.body && document.body.classList && document.body.classList.contains('simple-mode');
  }
  function track(kind, meta){
    meta = meta || {};
    meta.wave = VERSION;
    meta.page = page();
    try {
      if (window.trainerEvents && typeof window.trainerEvents.track === 'function') {
        window.trainerEvents.track(kind, meta);
        return;
      }
    } catch(_) {}
    try {
      window.dispatchEvent(new CustomEvent('trainer:event', { detail: { kind: kind, meta: meta, at: Date.now() } }));
    } catch(_) {}
  }

  function installCss(){
    if (!document.documentElement || document.documentElement.dataset.wave92gCss === '1') return;
    var rules = [
      '.wave92g-a11y-btn{position:fixed;right:12px;bottom:calc(74px + env(safe-area-inset-bottom));z-index:2147483000;border:0;border-radius:999px;padding:10px 13px;min-width:44px;min-height:44px;background:var(--card,#fff);color:var(--text,#111827);box-shadow:0 8px 30px rgba(15,23,42,.18);font-weight:800;cursor:pointer}',
      'body.simple-mode #s-play.on ~ .wave92g-a11y-btn,body.simple-mode .wave92g-a11y-btn[data-hidden="1"]{display:none!important}',
      '.wave92g-panel{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:2147483001;max-width:560px;margin:0 auto;padding:16px;border-radius:20px;background:var(--card,#fff);color:var(--text,#111827);box-shadow:0 20px 70px rgba(15,23,42,.32);border:1px solid rgba(148,163,184,.35)}',
      '.wave92g-panel[hidden],.wave92g-toast[hidden],.wave92g-whats-new[hidden]{display:none!important}',
      '.wave92g-panel h2,.wave92g-whats-new h2{margin:0 0 8px;font-size:1.05rem}',
      '.wave92g-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}',
      '.wave92g-panel button,.wave92g-whats-new button{min-height:44px;border-radius:12px;border:1px solid rgba(148,163,184,.45);padding:9px 12px;background:rgba(148,163,184,.12);color:inherit;font-weight:750}',
      '.wave92g-panel button[aria-pressed="true"]{outline:3px solid rgba(59,130,246,.45);background:rgba(59,130,246,.16)}',
      '.wave92g-toast{position:fixed;left:12px;right:12px;top:calc(12px + env(safe-area-inset-top));z-index:2147482999;max-width:540px;margin:0 auto;padding:10px 12px;border-radius:14px;background:var(--card,#fff);color:var(--text,#111827);box-shadow:0 10px 35px rgba(15,23,42,.18);border:1px solid rgba(148,163,184,.35);font-weight:750}',
      '#s-play.on .wave92g-toast{display:none!important}',
      '.wave92g-whats-new{position:fixed;inset:0;z-index:2147483002;display:grid;place-items:center;background:rgba(15,23,42,.56);padding:18px}',
      '.wave92g-whats-new>div{max-width:560px;background:var(--card,#fff);color:var(--text,#111827);border-radius:22px;padding:18px;box-shadow:0 30px 80px rgba(0,0,0,.38)}',
      'html[data-wave92g-font="large"] body{font-size:18px}',
      'html[data-wave92g-font="xl"] body{font-size:20px}',
      'html.wave92g-high-contrast{--bg:#000!important;--card:#000!important;--text:#fff!important;--muted:#e5e7eb!important;color-scheme:dark}',
      'html.wave92g-high-contrast a,html.wave92g-high-contrast button{outline-color:#facc15!important}',
      'html.wave92g-dyslexia body{font-family:"Golos Text",system-ui,sans-serif!important;letter-spacing:.025em;word-spacing:.08em;line-height:1.68}',
      'html.wave92g-focus-visible :focus-visible{outline:3px solid #f59e0b!important;outline-offset:3px!important}',
      '@media (pointer:coarse){button,a.btn,.btn,.card,[role="button"],#opts button,.opt{min-height:44px;min-width:44px}}',
      '@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.001ms!important}}',
      '@media (orientation:landscape) and (max-height:620px){.wave92g-panel{max-height:82vh;overflow:auto}.wave92g-a11y-btn{bottom:12px}}'
    ];
    function trySheet(){
      var sheets = document.styleSheets || [];
      for (var i = sheets.length - 1; i >= 0; i--) {
        var s = sheets[i];
        try {
          if (!s.href || (location.origin && s.href.indexOf(location.origin) === 0) || s.href.indexOf(location.pathname.replace(/[^\/]*$/, '')) !== -1) {
            s.cssRules;
            return s;
          }
        } catch(_) {}
      }
      return null;
    }
    var sheet = trySheet();
    if (!sheet) {
      setTimeout(installCss, 100);
      return;
    }
    for (var j = 0; j < rules.length; j++) {
      try { sheet.insertRule(rules[j], sheet.cssRules.length); } catch(_) {}
    }
    document.documentElement.dataset.wave92gCss = '1';
  }

  function applyPrefs(){
    var html = document.documentElement;
    var font = get(KEY.font) || 'normal';
    if (font !== 'large' && font !== 'xl') font = 'normal';
    html.setAttribute('data-wave92g-font', font);
    html.classList.toggle('wave92g-high-contrast', get(KEY.contrast) === '1');
    html.classList.toggle('wave92g-dyslexia', get(KEY.dyslexia) === '1');
    html.classList.add('wave92g-focus-visible');
  }

  function ensureToast(){
    var n = document.getElementById('wave92g-toast');
    if (n) return n;
    n = document.createElement('div');
    n.id = 'wave92g-toast';
    n.className = 'wave92g-toast';
    n.setAttribute('role', 'status');
    n.setAttribute('aria-live', 'polite');
    n.hidden = true;
    document.body.appendChild(n);
    return n;
  }
  function showStatus(msg, ms){
    if (!document.body || inPlay()) return;
    var n = ensureToast();
    n.textContent = msg;
    n.hidden = false;
    clearTimeout(n._t);
    n._t = setTimeout(function(){ n.hidden = true; }, ms || 2600);
  }
  function onlineStatus(){
    if (!navigator || !('onLine' in navigator)) return;
    if (navigator.onLine) showStatus('Онлайн · данные доступны', 1600);
    else showStatus('Офлайн · тренажёр работает из кэша', 4200);
    track('network_status', { online: !!navigator.onLine });
  }

  function ensurePanel(){
    if (!document.body) return null;
    var panel = document.getElementById('wave92g-panel');
    if (panel) return panel;
    panel = document.createElement('section');
    panel.id = 'wave92g-panel';
    panel.className = 'wave92g-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-labelledby', 'wave92g-title');
    panel.innerHTML =
      '<h2 id="wave92g-title">Быстрые настройки</h2>' +
      '<p class="muted">Мобильный UX, доступность и локальная аналитика. Экран тренировки не засоряется.</p>' +
      '<div class="wave92g-row" aria-label="Размер шрифта">' +
      '<button type="button" data-wave92g-font="normal">Обычный текст</button>' +
      '<button type="button" data-wave92g-font="large">Крупнее</button>' +
      '<button type="button" data-wave92g-font="xl">Максимум</button>' +
      '</div>' +
      '<div class="wave92g-row">' +
      '<button type="button" data-wave92g-toggle="contrast">Высокий контраст</button>' +
      '<button type="button" data-wave92g-toggle="dyslexia">Читабельный шрифт</button>' +
      '<button type="button" data-wave92g-toggle="haptic">Виброотклик</button>' +
      '</div>' +
      '<div class="wave92g-row">' +
      '<button type="button" data-wave92g-action="export-analytics">CSV аналитики</button>' +
      '<button type="button" data-wave92g-action="share">Поделиться</button>' +
      '<button type="button" data-wave92g-action="purge">Очистить старые события</button>' +
      '<button type="button" data-wave92g-action="close">Закрыть</button>' +
      '</div>';
    document.body.appendChild(panel);
    syncPressed();
    return panel;
  }
  function ensureButton(){
    if (!document.body || document.getElementById('wave92g-a11y-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'wave92g-a11y-btn';
    btn.className = 'wave92g-a11y-btn';
    btn.type = 'button';
    btn.setAttribute('aria-controls', 'wave92g-panel');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Быстрые настройки доступности');
    btn.textContent = '⚙︎';
    document.body.appendChild(btn);
    btn.addEventListener('click', function(){
      haptic(8);
      togglePanel();
      track('ui_click', { id: 'wave92g-a11y-btn' });
    });
    updateButtonVisibility();
  }
  function updateButtonVisibility(){
    var b = document.getElementById('wave92g-a11y-btn');
    if (!b) return;
    var hide = inPlay() || /embed\.html$/.test(page());
    b.dataset.hidden = hide ? '1' : '0';
    b.hidden = !!hide;
  }
  function syncPressed(){
    var p = document.getElementById('wave92g-panel');
    if (!p) return;
    var font = get(KEY.font) || 'normal';
    var buttons = p.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      if (b.dataset.wave92gFont) b.setAttribute('aria-pressed', b.dataset.wave92gFont === font ? 'true' : 'false');
      if (b.dataset.wave92gToggle === 'contrast') b.setAttribute('aria-pressed', get(KEY.contrast) === '1' ? 'true' : 'false');
      if (b.dataset.wave92gToggle === 'dyslexia') b.setAttribute('aria-pressed', get(KEY.dyslexia) === '1' ? 'true' : 'false');
      if (b.dataset.wave92gToggle === 'haptic') b.setAttribute('aria-pressed', get(KEY.haptic) === '0' ? 'false' : 'true');
    }
  }
  function togglePanel(force){
    if (inPlay()) return;
    var p = ensurePanel();
    var b = document.getElementById('wave92g-a11y-btn');
    var open = typeof force === 'boolean' ? force : p.hidden;
    p.hidden = !open;
    if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      syncPressed();
      var first = p.querySelector('button');
      if (first && typeof first.focus === 'function') first.focus();
    } else if (b && typeof b.focus === 'function') {
      b.focus();
    }
  }

  function haptic(ms){
    if (get(KEY.haptic) === '0') return;
    try {
      if (navigator.vibrate) navigator.vibrate(ms || 12);
    } catch(_) {}
  }

  function csvEscape(v){
    return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  }
  function download(name, mime, text){
    try {
      var blob = new Blob([text], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      setTimeout(function(){ try { URL.revokeObjectURL(url); a.remove(); } catch(_){} }, 0);
    } catch(_) {
      showStatus('Экспорт недоступен в этом браузере');
    }
  }
  function exportAnalytics(){
    function finish(rows){
      rows = rows || [];
      var head = ['at','kind','page','meta'];
      var lines = [head.join(',')];
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i] || {};
        var meta = r.meta || r.detail || {};
        lines.push([
          csvEscape(r.at || r.ts || ''),
          csvEscape(r.kind || ''),
          csvEscape((meta && meta.page) || r.page || ''),
          csvEscape(JSON.stringify(meta || {}))
        ].join(','));
      }
      download('trainer_analytics_wave92g.csv', 'text/csv;charset=utf-8', lines.join('\n'));
      showStatus('CSV аналитики сохранён');
      track('analytics_export_csv', { rows: rows.length });
    }
    try {
      if (window.trainerEvents && typeof window.trainerEvents.readAll === 'function') {
        window.trainerEvents.readAll(finish);
        return;
      }
    } catch(_) {}
    var fallback = [];
    try { fallback = JSON.parse(get('trainer_events_fallback_wave92d') || '[]') || []; } catch(_) { fallback = []; }
    finish(fallback);
  }
  function sharePage(){
    var data = { title: document.title || 'Тренажёр', text: 'Тренажёр к диагностикам', url: location.href };
    try {
      if (navigator.share) {
        navigator.share(data).then(function(){ track('share_done', { via: 'webshare' }); }).catch(function(){});
        return;
      }
    } catch(_) {}
    try {
      navigator.clipboard.writeText(location.href).then(function(){ showStatus('Ссылка скопирована'); track('share_done', { via: 'clipboard' }); });
    } catch(_) {
      showStatus(location.href, 4800);
    }
  }

  function purgeOldEvents(){
    var cutoff = Date.now() - 180 * 24 * 60 * 60 * 1000;
    var removed = 0;
    function old(v){
      var t = Number(v && (v.at || v.ts || v.time || 0));
      if (!t && v && typeof v.at === 'string') t = Date.parse(v.at);
      return t && t < cutoff;
    }
    ['trainer_events_fallback_wave92d','trainer_navigation_log_wave91j'].forEach(function(k){
      try {
        var arr = JSON.parse(localStorage.getItem(k) || '[]');
        if (!Array.isArray(arr)) return;
        var keep = arr.filter(function(x){ return !old(x); });
        removed += arr.length - keep.length;
        localStorage.setItem(k, JSON.stringify(keep));
      } catch(_) {}
    });
    try {
      if (window.indexedDB) {
        var req = indexedDB.open('trainer3_events_wave92d');
        req.onsuccess = function(){
          try {
            var db = req.result;
            if (!db.objectStoreNames.contains('events')) return db.close();
            var tx = db.transaction('events', 'readwrite');
            var st = tx.objectStore('events');
            st.openCursor().onsuccess = function(ev){
              var cur = ev.target.result;
              if (!cur) return;
              if (old(cur.value)) { removed += 1; try { cur.delete(); } catch(_){} }
              cur.continue();
            };
            tx.oncomplete = function(){ try { db.close(); } catch(_){} };
          } catch(_) {}
        };
      }
    } catch(_) {}
    set(KEY.lastPurge, now());
    showStatus(removed ? ('Удалено старых событий: ' + removed) : 'Старых событий не найдено');
    track('old_data_purge', { removed: removed });
  }
  function autoPurge(){
    var last = Date.parse(get(KEY.lastPurge) || '0') || 0;
    if (Date.now() - last > 14 * 24 * 60 * 60 * 1000) purgeOldEvents();
  }

  function setupStorageSchema(){
    set(KEY.schema, 'wave92g/v1');
    try { if (window.trainerStore && window.trainerStore.set) window.trainerStore.set(KEY.schema, 'wave92g/v1'); } catch(_) {}
  }

  function setupSemantics(){
    try {
      var main = document.querySelector('main,[role="main"],#s-main');
      if (main && !main.id) main.id = 'main';
      if (main) main.setAttribute('role', 'main');
      if (!document.querySelector('a[href="#main"].skip-link') && document.body) {
        var skip = document.createElement('a');
        skip.href = '#main';
        skip.className = 'skip-link';
        skip.textContent = 'К содержанию';
        document.body.insertBefore(skip, document.body.firstChild);
      }
    } catch(_) {}
    refreshOptionRoles();
  }
  function refreshOptionRoles(){
    try {
      var opts = document.getElementById('opts');
      if (!opts) return;
      opts.setAttribute('role', 'radiogroup');
      opts.setAttribute('aria-label', 'Варианты ответа');
      var btns = opts.querySelectorAll('button,.opt,[data-answer]');
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        b.setAttribute('role', 'radio');
        if (!b.hasAttribute('aria-checked')) b.setAttribute('aria-checked', 'false');
        if (!b.hasAttribute('tabindex')) b.setAttribute('tabindex', i === 0 ? '0' : '-1');
      }
    } catch(_) {}
  }
  function markSelected(el){
    try {
      var opts = document.getElementById('opts');
      if (!opts) return;
      var btns = opts.querySelectorAll('[role="radio"]');
      for (var i = 0; i < btns.length; i++) {
        btns[i].setAttribute('aria-checked', btns[i] === el ? 'true' : 'false');
        btns[i].setAttribute('tabindex', btns[i] === el ? '0' : '-1');
      }
    } catch(_) {}
  }

  function setupSwipeAndPull(){
    var sx = 0, sy = 0, st = 0;
    document.addEventListener('touchstart', function(e){
      var t = e.touches && e.touches[0];
      if (!t) return;
      sx = t.clientX;
      sy = t.clientY;
      st = Date.now();
    }, { passive: true });
    document.addEventListener('touchend', function(e){
      var t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      var dx = t.clientX - sx, dy = t.clientY - sy, dt = Date.now() - st;
      if (dt > 900) return;
      if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        if (inPlay() && dx < 0) {
          var next = findNextButton();
          if (next) { haptic(8); next.click(); track('swipe_next', {}); }
        } else if (!inPlay() && dx > 0) {
          haptic(8);
          track('swipe_back', {});
          var back = document.querySelector('a[href="./index.html"],a[href="index.html"],a[href="../index.html"],button[data-wave87r-action="go-main"]');
          if (back) back.click();
          else if (history.length > 1) history.back();
          else location.href = './index.html';
        }
      }
      if (!inPlay() && sy < 24 && dy > 96 && Math.abs(dy) > Math.abs(dx) * 1.5 && (window.scrollY || 0) < 6) {
        haptic(10);
        showStatus('Обновляю страницу…');
        track('pull_to_refresh', {});
        setTimeout(function(){ location.reload(); }, 180);
      }
    }, { passive: true });
  }
  function findNextButton(){
    var btns = document.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      var txt = safeText(btns[i].textContent, 40).toLowerCase();
      var act = btns[i].getAttribute('data-wave87r-action') || '';
      if (/далее|следующ/.test(txt) || /next/i.test(act)) return btns[i];
    }
    return null;
  }

  function setupScrollRestore(){
    var k = KEY.scrollPrefix + page();
    try {
      var saved = parseInt(get(k) || '0', 10);
      if (saved && !inPlay()) setTimeout(function(){ window.scrollTo(0, saved); }, 50);
    } catch(_) {}
    var timer = 0;
    window.addEventListener('scroll', function(){
      if (timer) return;
      timer = setTimeout(function(){
        timer = 0;
        if (!inPlay()) set(k, String(window.scrollY || 0));
      }, 400);
    }, { passive: true });
  }

  function showWhatsNew(){
    if (get(KEY.seen) === VERSION || inPlay() || !document.body || /embed\.html$/.test(page())) return;
    var n = document.createElement('section');
    n.id = 'wave92g-whats-new';
    n.className = 'wave92g-whats-new';
    n.setAttribute('role', 'dialog');
    n.setAttribute('aria-modal', 'true');
    n.setAttribute('aria-labelledby', 'wave92g-wn-title');
    n.innerHTML =
      '<div><h2 id="wave92g-wn-title">Что нового</h2>' +
      '<p>Добавлены мобильные жесты, быстрые настройки доступности, offline-статус, CSV-экспорт локальной аналитики, SRI и Permissions-Policy.</p>' +
      '<p class="muted">В simple-mode экран тренировки остаётся чистым: вопрос, варианты, feedback и «Далее».</p>' +
      '<button type="button" data-wave92g-action="whats-new-close">Понятно</button></div>';
    document.body.appendChild(n);
    var btn = n.querySelector('button');
    if (btn) btn.focus();
    track('whats_new_show', {});
  }

  function handlePanelAction(target){
    if (!target || !target.closest) return false;
    var b = target.closest('[data-wave92g-font],[data-wave92g-toggle],[data-wave92g-action]');
    if (!b) return false;
    haptic(8);
    if (b.dataset.wave92gFont) {
      set(KEY.font, b.dataset.wave92gFont);
      applyPrefs();
      syncPressed();
      track('font_size_set', { value: b.dataset.wave92gFont });
      return true;
    }
    if (b.dataset.wave92gToggle) {
      var k = b.dataset.wave92gToggle === 'contrast' ? KEY.contrast : (b.dataset.wave92gToggle === 'dyslexia' ? KEY.dyslexia : KEY.haptic);
      var next = get(k) === '1' ? '0' : '1';
      if (b.dataset.wave92gToggle === 'haptic') next = get(k) === '0' ? '1' : '0';
      set(k, next);
      applyPrefs();
      syncPressed();
      track('accessibility_toggle', { key: b.dataset.wave92gToggle, value: next });
      return true;
    }
    var action = b.dataset.wave92gAction;
    if (action === 'export-analytics') exportAnalytics();
    if (action === 'share') sharePage();
    if (action === 'purge') purgeOldEvents();
    if (action === 'close') togglePanel(false);
    if (action === 'whats-new-close') {
      set(KEY.seen, VERSION);
      var modal = document.getElementById('wave92g-whats-new');
      if (modal) modal.remove();
      track('whats_new_close', {});
    }
    return true;
  }

  function setupDelegates(){
    document.addEventListener('click', function(e){
      if (handlePanelAction(e.target)) return;
      if (e.target && e.target.closest) {
        var radio = e.target.closest('#opts [role="radio"]');
        if (radio) {
          markSelected(radio);
          haptic(10);
          track('answer_select_a11y', { text: safeText(radio.textContent, 80) });
        } else if (e.target.closest('button,a,[role="button"]')) {
          haptic(5);
        }
      }
      updateButtonVisibility();
    }, true);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') {
        var p = document.getElementById('wave92g-panel');
        if (p && !p.hidden) togglePanel(false);
      }
      if ((e.key === 'F2' || e.key === '?') && !inPlay()) {
        var p2 = document.getElementById('wave92g-panel');
        if (!p2 || p2.hidden) togglePanel(true);
      }
    });
  }

  function setupObservers(){
    try {
      var mo = new MutationObserver(function(){
        refreshOptionRoles();
        updateButtonVisibility();
      });
      mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class','hidden'] });
    } catch(_) {}
  }

  ready(function(){
    installCss();
    applyPrefs();
    setupStorageSchema();
    setupSemantics();
    ensureButton();
    ensurePanel();
    setupDelegates();
    setupObservers();
    setupSwipeAndPull();
    setupScrollRestore();
    autoPurge();
    window.addEventListener('online', onlineStatus);
    window.addEventListener('offline', onlineStatus);
    if (!navigator.onLine) onlineStatus();
    setTimeout(showWhatsNew, isGradePage() ? 1200 : 700);
    window.__wave92g = {
      version: VERSION,
      refreshOptionRoles: refreshOptionRoles,
      exportAnalytics: exportAnalytics,
      purgeOldEvents: purgeOldEvents,
      preferences: applyPrefs
    };
    track('wave92g_boot', { simple: rootIsSimple(), online: navigator.onLine !== false });
  });
})();

