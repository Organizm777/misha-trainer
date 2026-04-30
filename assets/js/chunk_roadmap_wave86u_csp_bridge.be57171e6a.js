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


/* --- wave92h_personalization_focus.js --- */
(function(){
  'use strict';
  if (window.__wave92hBooted) return;
  window.__wave92hBooted = true;

  var VERSION = 'wave92h';
  var KEY = {
    profiles: 'trainer_profiles_wave92h',
    active: 'trainer_active_profile_wave92h',
    onboarding: 'trainer_onboarding_wave92h',
    focus: 'trainer_focus_mode_wave92h',
    themeSchedule: 'trainer_theme_schedule_wave92h',
    seen: 'trainer_seen_wave92h',
    microDone: 'trainer_micro_lessons_done_wave92h',
    backupHint: 'trainer_clipboard_backup_hint_wave92h'
  };

  function ready(fn){
    if (typeof document === 'undefined') return;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }
  function get(k){ try { return localStorage.getItem(k); } catch(_) { return null; } }
  function set(k,v){ try { localStorage.setItem(k, String(v)); } catch(_) {} }
  function remove(k){ try { localStorage.removeItem(k); } catch(_) {} }
  function jget(k, fallback){
    try { var raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : fallback; } catch(_) { return fallback; }
  }
  function jset(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(_) {} }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(ch){
      return ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch === '"' ? '&quot;' : '&#39;';
    });
  }
  function page(){ return (location.pathname || '').split('/').pop() || 'index.html'; }
  function isIndex(){ var p = page(); return p === 'index.html' || p === ''; }
  function gradeFromPage(){ var m = /grade(\d+)_v2\.html/.exec(page()); return m ? Number(m[1]) : 0; }
  function isGradePage(){ return !!gradeFromPage(); }
  function inPlay(){ var p = document.getElementById('s-play'); return !!(p && p.classList && p.classList.contains('on')); }
  function track(kind, meta){
    try { if (window.trainerEvents && typeof window.trainerEvents.track === 'function') window.trainerEvents.track(kind, meta || {}); } catch(_) {}
  }
  function showToast(msg){
    if (inPlay()) return;
    var n = document.getElementById('wave92h-toast');
    if (!n) {
      n = document.createElement('div');
      n.id = 'wave92h-toast';
      n.className = 'wave92h-toast';
      n.setAttribute('role', 'status');
      n.setAttribute('aria-live', 'polite');
      document.body.appendChild(n);
    }
    n.textContent = msg;
    n.hidden = false;
    clearTimeout(n._t);
    n._t = setTimeout(function(){ n.hidden = true; }, 2600);
  }

  function profiles(){
    var p = jget(KEY.profiles, []);
    return Array.isArray(p) ? p.filter(function(x){ return x && x.id; }) : [];
  }
  function saveProfiles(list){ jset(KEY.profiles, list || []); }
  function activeId(){ return get(KEY.active) || ''; }
  function setActive(id){ set(KEY.active, id); }
  function currentProfile(){
    var list = profiles(), id = activeId();
    for (var i=0;i<list.length;i++) if (list[i].id === id) return list[i];
    if (list.length) return list[0];
    var legacyGrade = Number(get('trainer_my_grade_wave92a') || gradeFromPage() || 0);
    return { id: '', name: '', emoji: '🙂', grade: legacyGrade || '', goal: '', minutes: 15, weak: '' };
  }
  function profileLabel(p){
    p = p || currentProfile();
    var parts = [];
    if (p.name) parts.push((p.emoji || '🙂') + ' ' + p.name);
    if (p.grade) parts.push(p.grade + ' класс');
    if (p.goal) parts.push(p.goal);
    return parts.join(' · ') || 'Профиль не настроен';
  }
  function moodKey(){ var p=currentProfile(); return 'trainer_mood_wave92h:' + (p.id || 'default'); }
  function saveMood(value){
    var list = jget(moodKey(), []); if (!Array.isArray(list)) list = [];
    list.unshift({ value: value, ts: Date.now(), page: page(), grade: gradeFromPage() || currentProfile().grade || null });
    list = list.slice(0, 40);
    jset(moodKey(), list);
    track('mood_checkin', { value: value, grade: gradeFromPage() || currentProfile().grade || null });
    showToast(value === 'tired' ? 'Ок: сегодня лучше 5 спокойных задач и разбор ошибок.' : value === 'ready' ? 'Отлично: можно взять тему посложнее.' : 'Зафиксировал настроение.');
    renderAll();
  }

  function installCss(){
    if (!document.documentElement || document.documentElement.dataset.wave92hCss === '1') return;
    var rules = [
      '.wave92h-card{margin:12px 0;padding:14px;border-radius:18px;background:var(--card,#fff);color:var(--text,#111827);border:1px solid rgba(148,163,184,.35);box-shadow:0 8px 28px rgba(15,23,42,.10)}',
      '.wave92h-card h2,.wave92h-card h3{margin:0 0 6px;font-size:1.05rem}.wave92h-card p{margin:.35rem 0;color:var(--muted,#64748b)}',
      '.wave92h-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.wave92h-row button,.wave92h-row a{min-height:44px;border-radius:12px;border:1px solid rgba(148,163,184,.45);padding:9px 12px;background:rgba(148,163,184,.12);color:inherit;text-decoration:none;font-weight:750}',
      '.wave92h-pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 9px;background:rgba(59,130,246,.12);font-size:.9rem;font-weight:750}',
      '.wave92h-modal{position:fixed;inset:0;z-index:2147483003;display:grid;place-items:center;padding:18px;background:rgba(15,23,42,.58)}',
      '.wave92h-modal[hidden],.wave92h-toast[hidden]{display:none!important}.wave92h-box{width:min(620px,100%);max-height:88vh;overflow:auto;border-radius:22px;background:var(--card,#fff);color:var(--text,#111827);padding:18px;box-shadow:0 30px 90px rgba(0,0,0,.36)}',
      '.wave92h-box label{display:block;margin:10px 0 4px;font-weight:750}.wave92h-box input,.wave92h-box select,.wave92h-box textarea{width:100%;box-sizing:border-box;border-radius:12px;border:1px solid rgba(148,163,184,.55);padding:10px;background:var(--bg,#fff);color:var(--text,#111827);font:inherit}',
      '.wave92h-toast{position:fixed;left:12px;right:12px;top:calc(58px + env(safe-area-inset-top));z-index:2147483002;max-width:560px;margin:0 auto;padding:10px 12px;border-radius:14px;background:var(--card,#fff);color:var(--text,#111827);box-shadow:0 10px 35px rgba(15,23,42,.18);border:1px solid rgba(148,163,184,.35);font-weight:750}',
      'html.wave92h-focus .daily-mini,html.wave92h-focus #daily-meter,html.wave92h-focus .wave91h-advanced,html.wave92h-focus .wave91g-main-card{display:none!important}',
      '#s-play.on .wave92h-card,#s-play.on .wave92h-toast{display:none!important}',
      '@media (prefers-reduced-motion:reduce){.wave92h-card,.wave92h-modal{transition:none!important;animation:none!important}}'
    ];
    function trySheet(){
      var sheets = document.styleSheets || [];
      for (var i=sheets.length-1;i>=0;i--){
        try { sheets[i].cssRules; return sheets[i]; } catch(_) {}
      }
      return null;
    }
    var sheet = trySheet();
    if (!sheet) { setTimeout(installCss, 120); return; }
    for (var j=0;j<rules.length;j++) { try { sheet.insertRule(rules[j], sheet.cssRules.length); } catch(_) {} }
    document.documentElement.dataset.wave92hCss = '1';
  }

  function applyFocus(){
    var on = get(KEY.focus) === '1';
    document.documentElement.classList.toggle('wave92h-focus', on);
    var b = document.querySelector('[data-wave92h-action="focus-toggle"]');
    if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function applyThemeSchedule(){
    var cfg = jget(KEY.themeSchedule, { enabled: false, darkFrom: 19, darkTo: 7 });
    var base = get('trainer_theme') || 'system';
    if (!cfg || !cfg.enabled || (base && base !== 'system')) return;
    var h = new Date().getHours();
    var from = Number(cfg.darkFrom == null ? 19 : cfg.darkFrom), to = Number(cfg.darkTo == null ? 7 : cfg.darkTo);
    var dark = from > to ? (h >= from || h < to) : (h >= from && h < to);
    if (dark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }
  function scheduleLabel(){
    var cfg = jget(KEY.themeSchedule, { enabled:false, darkFrom:19, darkTo:7 });
    return cfg && cfg.enabled ? 'Тема по расписанию: вкл' : 'Тема по расписанию: выкл';
  }

  function ensureIndexHub(){
    if (!isIndex() || !document.body || document.getElementById('wave92h-home')) return;
    var wrap = document.querySelector('.w');
    var header = document.querySelector('.header') || (wrap && wrap.firstElementChild);
    if (!wrap || !header) return;
    var p = currentProfile();
    var grade = Number(p.grade || get('trainer_my_grade_wave92a') || 0);
    var node = document.createElement('section');
    node.id = 'wave92h-home';
    node.className = 'wave92h-card';
    var gradeLink = grade ? '<a href="grade' + grade + '_v2.html">В мой класс</a>' : '';
    node.innerHTML =
      '<h2>👤 Персональная главная</h2>' +
      '<p><span class="wave92h-pill">' + esc(profileLabel(p)) + '</span></p>' +
      '<p>' + esc(p.weak ? ('Фокус: ' + p.weak) : 'Настрой профиль, чтобы быстрый вход и подсказки были персональными.') + '</p>' +
      '<div class="wave92h-row">' + gradeLink +
      '<button type="button" data-wave92h-action="profile">Профиль</button>' +
      '<button type="button" data-wave92h-action="onboarding">Онбординг</button>' +
      '<button type="button" data-wave92h-mood="ready">🔥 Готов</button>' +
      '<button type="button" data-wave92h-mood="ok">🙂 Норм</button>' +
      '<button type="button" data-wave92h-mood="tired">😐 Тяжело</button>' +
      '</div>';
    header.insertAdjacentElement('afterend', node);
  }

  function microLessonText(grade){
    if (grade <= 4) return 'Мини-урок: перед ответом проговори правило вслух. Если ошибся — найди одно слово в условии, которое подсказало правильный ход.';
    if (grade <= 7) return 'Мини-урок: выпиши, что спрашивают, и только потом выбирай вариант. Это снижает случайные ошибки в задачах с длинным условием.';
    if (grade === 8 || grade === 9) return 'Мини-урок: для ОГЭ-тем сначала определи тип задания, затем вспомни шаблон решения. Не считай, пока не понял тип.';
    return 'Мини-урок: в старших классах сначала отделяй данные, формулу/правило и проверку ответа. Это быстрее, чем угадывать из вариантов.';
  }
  function ensureGradeCoach(){
    var grade = gradeFromPage();
    if (!grade || !document.body || document.getElementById('wave92h-grade-coach')) return;
    var host = document.querySelector('#s-main .w .fade') || document.querySelector('#s-main .w');
    if (!host || !host.parentElement) return;
    var p = currentProfile();
    var node = document.createElement('section');
    node.id = 'wave92h-grade-coach';
    node.className = 'wave92h-card';
    node.innerHTML =
      '<h3>⏱ 30 секунд перед тренировкой</h3>' +
      '<p>' + esc(microLessonText(grade)) + '</p>' +
      '<p><span class="wave92h-pill">' + esc(profileLabel(p)) + '</span></p>' +
      '<div class="wave92h-row">' +
      '<button type="button" data-wave92h-action="micro-done">Понял, к темам</button>' +
      '<button type="button" data-wave92h-action="focus-toggle" aria-pressed="false">Режим фокуса</button>' +
      '<button type="button" data-wave92h-action="profile">Профиль</button>' +
      '</div>';
    host.insertAdjacentElement('afterend', node);
  }

  function enhanceQuickPanel(){
    var p = document.getElementById('wave92g-panel');
    if (!p || document.getElementById('wave92h-quick-row')) return;
    var row = document.createElement('div');
    row.id = 'wave92h-quick-row';
    row.className = 'wave92g-row wave92h-row';
    row.innerHTML =
      '<button type="button" data-wave92h-action="profile">Профиль</button>' +
      '<button type="button" data-wave92h-action="onboarding">Онбординг</button>' +
      '<button type="button" data-wave92h-action="focus-toggle" aria-pressed="false">Фокус</button>' +
      '<button type="button" data-wave92h-action="theme-toggle">' + esc(scheduleLabel()) + '</button>' +
      '<button type="button" data-wave92h-action="clipboard-backup">Бэкап в clipboard</button>';
    p.appendChild(row);
    applyFocus();
  }

  function closeModal(){ var m = document.getElementById('wave92h-modal'); if (m) m.remove(); }
  function modalBase(title, body){
    closeModal();
    var m = document.createElement('section');
    m.id = 'wave92h-modal';
    m.className = 'wave92h-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-labelledby', 'wave92h-modal-title');
    m.innerHTML = '<div class="wave92h-box"><h2 id="wave92h-modal-title">' + esc(title) + '</h2>' + body + '</div>';
    document.body.appendChild(m);
    var first = m.querySelector('input,select,textarea,button');
    if (first && first.focus) first.focus();
    return m;
  }
  function profileOptions(active){
    var list = profiles();
    if (!list.length) return '<p class="muted">Профилей пока нет.</p>';
    return '<div class="wave92h-row">' + list.map(function(p){
      return '<button type="button" data-wave92h-action="switch-profile" data-profile-id="' + esc(p.id) + '" aria-pressed="' + (p.id === active ? 'true' : 'false') + '">' + esc((p.emoji || '🙂') + ' ' + (p.name || 'Ученик') + (p.grade ? ' · ' + p.grade : '')) + '</button>';
    }).join('') + '</div>';
  }
  function showProfileModal(profileOverride){
    var p = profileOverride || currentProfile();
    var body =
      '<p class="muted">Несколько профилей позволяют разделить прогресс детей или режимы подготовки без внешнего сервера.</p>' +
      profileOptions(p.id) +
      '<input id="wave92h-profile-id" type="hidden" value="' + esc(p.id || '') + '">' +
      '<label for="wave92h-name">Имя</label><input id="wave92h-name" autocomplete="nickname" value="' + esc(p.name || '') + '" placeholder="Например, Миша">' +
      '<label for="wave92h-emoji">Emoji</label><input id="wave92h-emoji" value="' + esc(p.emoji || '🙂') + '" maxlength="4">' +
      '<label for="wave92h-grade">Класс</label><select id="wave92h-grade">' + Array.from({length:11}, function(_,i){ var g=i+1; return '<option value="' + g + '"' + (Number(p.grade)===g?' selected':'') + '>' + g + ' класс</option>'; }).join('') + '</select>' +
      '<label for="wave92h-goal">Цель</label><input id="wave92h-goal" value="' + esc(p.goal || '') + '" placeholder="ОГЭ, ЕГЭ, подтянуть алгебру…">' +
      '<label for="wave92h-weak">Слабые темы / фокус</label><textarea id="wave92h-weak" rows="3" placeholder="Например: вероятность, орфография, физика">' + esc(p.weak || '') + '</textarea>' +
      '<label for="wave92h-minutes">Минут в день</label><input id="wave92h-minutes" type="number" min="5" max="90" value="' + esc(p.minutes || 15) + '">' +
      '<div class="wave92h-row"><button type="button" data-wave92h-action="save-profile">Сохранить</button><button type="button" data-wave92h-action="new-profile">Новый профиль</button><button type="button" data-wave92h-action="delete-profile">Удалить профиль</button><button type="button" data-wave92h-action="close-modal">Закрыть</button></div>';
    modalBase('Профиль ученика', body);
  }
  function showOnboardingModal(){
    var p = currentProfile();
    var body =
      '<p>Короткая настройка: класс, цель, слабые темы и дневная норма. Всё хранится локально.</p>' +
      '<label for="wave92h-on-name">Имя</label><input id="wave92h-on-name" value="' + esc(p.name || '') + '" placeholder="Имя ученика">' +
      '<label for="wave92h-on-grade">Класс</label><select id="wave92h-on-grade">' + Array.from({length:11}, function(_,i){ var g=i+1; return '<option value="' + g + '"' + (Number(p.grade)===g?' selected':'') + '>' + g + ' класс</option>'; }).join('') + '</select>' +
      '<label for="wave92h-on-goal">Главная цель</label><select id="wave92h-on-goal"><option>Ежедневная привычка</option><option>Подготовка к ОГЭ</option><option>Подготовка к ЕГЭ</option><option>Подтянуть оценки</option><option>Вступительные / дизайн</option></select>' +
      '<label for="wave92h-on-weak">Что сейчас сложнее всего?</label><textarea id="wave92h-on-weak" rows="3" placeholder="2–3 темы через запятую"></textarea>' +
      '<label for="wave92h-on-minutes">Сколько минут в день реально?</label><select id="wave92h-on-minutes"><option value="10">10 минут</option><option value="15" selected>15 минут</option><option value="25">25 минут</option><option value="40">40 минут</option></select>' +
      '<div class="wave92h-row"><button type="button" data-wave92h-action="save-onboarding">Готово</button><button type="button" data-wave92h-action="close-modal">Закрыть</button></div>';
    modalBase('Онбординг', body);
  }

  function saveProfileFromModal(){
    var id = (document.getElementById('wave92h-profile-id') || {}).value || ('p' + Date.now().toString(36));
    var p = {
      id: id,
      name: ((document.getElementById('wave92h-name') || {}).value || '').trim() || 'Ученик',
      emoji: ((document.getElementById('wave92h-emoji') || {}).value || '🙂').trim() || '🙂',
      grade: Number(((document.getElementById('wave92h-grade') || {}).value || gradeFromPage() || 10)),
      goal: ((document.getElementById('wave92h-goal') || {}).value || '').trim(),
      weak: ((document.getElementById('wave92h-weak') || {}).value || '').trim(),
      minutes: Number(((document.getElementById('wave92h-minutes') || {}).value || 15)),
      updatedAt: Date.now()
    };
    var list = profiles().filter(function(x){ return x.id !== id; });
    list.unshift(p);
    saveProfiles(list);
    setActive(id);
    set('trainer_my_grade_wave92a', String(p.grade));
    try { if (window.trainerStore && window.trainerStore.set) window.trainerStore.set(KEY.profiles, JSON.stringify(list)); } catch(_) {}
    closeModal(); renderAll(); showToast('Профиль сохранён'); track('profile_save', { grade: p.grade });
  }
  function saveOnboarding(){
    var p = currentProfile();
    var id = p.id || ('p' + Date.now().toString(36));
    var next = {
      id: id,
      name: ((document.getElementById('wave92h-on-name') || {}).value || p.name || 'Ученик').trim(),
      emoji: p.emoji || '🙂',
      grade: Number(((document.getElementById('wave92h-on-grade') || {}).value || p.grade || 10)),
      goal: ((document.getElementById('wave92h-on-goal') || {}).value || 'Ежедневная привычка'),
      weak: ((document.getElementById('wave92h-on-weak') || {}).value || p.weak || '').trim(),
      minutes: Number(((document.getElementById('wave92h-on-minutes') || {}).value || p.minutes || 15)),
      updatedAt: Date.now()
    };
    var list = profiles().filter(function(x){ return x.id !== id; });
    list.unshift(next); saveProfiles(list); setActive(id); set('trainer_my_grade_wave92a', String(next.grade));
    jset(KEY.onboarding, { done: true, ts: Date.now(), profile: id, grade: next.grade, goal: next.goal });
    closeModal(); renderAll(); showToast('Онбординг сохранён'); track('onboarding_complete', { grade: next.grade, goal: next.goal });
  }
  function switchProfile(id){ if (!id) return; setActive(id); renderAll(); showToast('Профиль переключён'); track('profile_switch', {}); }
  function newProfile(){ closeModal(); showProfileModal({ id: '', name: '', emoji: '🙂', grade: gradeFromPage() || Number(get('trainer_my_grade_wave92a') || 10), goal: '', weak: '', minutes: 15 }); }
  function deleteProfile(){
    var hid = document.getElementById('wave92h-profile-id');
    var id = hid ? hid.value : currentProfile().id;
    if (!id) return closeModal();
    saveProfiles(profiles().filter(function(x){ return x.id !== id; }));
    if (activeId() === id) remove(KEY.active);
    closeModal(); renderAll(); showToast('Профиль удалён'); track('profile_delete', {});
  }

  function backupPayload(){
    var data = {};
    try {
      for (var i=0;i<localStorage.length;i++) {
        var k = localStorage.key(i);
        if (/^(trainer_|wave)/.test(k)) data[k] = localStorage.getItem(k);
      }
    } catch(_) {}
    return JSON.stringify({ version: VERSION, exported_at: new Date().toISOString(), page: page(), data: data }, null, 2);
  }
  function fallbackDownload(text){
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }));
    a.download = 'trainer_backup_wave92h.json';
    document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 300);
  }
  function clipboardBackup(){
    var text = backupPayload();
    set(KEY.backupHint, String(Date.now()));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function(){ showToast('Бэкап скопирован в clipboard'); track('clipboard_backup', { ok: true }); }, function(){ fallbackDownload(text); showToast('Clipboard недоступен — скачал JSON'); track('clipboard_backup', { fallback: true }); });
    } else {
      fallbackDownload(text); showToast('Clipboard недоступен — скачал JSON'); track('clipboard_backup', { fallback: true });
    }
  }

  function toggleFocus(){
    var next = get(KEY.focus) === '1' ? '0' : '1';
    set(KEY.focus, next); applyFocus(); showToast(next === '1' ? 'Режим фокуса включён' : 'Режим фокуса выключен'); track('focus_mode_toggle', { value: next });
  }
  function toggleThemeSchedule(){
    var cfg = jget(KEY.themeSchedule, { enabled:false, darkFrom:19, darkTo:7 });
    cfg.enabled = !cfg.enabled;
    jset(KEY.themeSchedule, cfg);
    applyThemeSchedule();
    var b = document.querySelector('[data-wave92h-action="theme-toggle"]');
    if (b) b.textContent = scheduleLabel();
    showToast(scheduleLabel());
    track('theme_schedule_toggle', { enabled: !!cfg.enabled });
  }
  function markMicroDone(){
    var grade = gradeFromPage();
    var done = jget(KEY.microDone, {}); done['grade' + grade] = Date.now(); jset(KEY.microDone, done);
    showToast('Мини-урок отмечен. Теперь выбери тему.'); track('micro_lesson_done', { grade: grade });
  }

  function showWhatsNew(){
    if (get(KEY.seen) === VERSION || inPlay() || /embed\.html$/.test(page())) return;
    if (document.getElementById('wave92g-whats-new')) { setTimeout(showWhatsNew, 1600); return; }
    var body = '<p>Добавлены профили учеников, быстрый онбординг, настроение дня, режим фокуса, тема по расписанию, clipboard-бэкап и 30-секундные микроуроки.</p>' +
      '<p class="muted">Все новые блоки скрываются во время активной тренировки: вопрос остаётся чистым.</p>' +
      '<div class="wave92h-row"><button type="button" data-wave92h-action="whats-new-close">Понятно</button><button type="button" data-wave92h-action="onboarding">Настроить профиль</button></div>';
    modalBase('Что нового в wave92h', body);
    track('wave92h_whats_new_show', {});
  }

  function handleClick(e){
    if (!e.target || !e.target.closest) return;
    var mood = e.target.closest('[data-wave92h-mood]');
    if (mood) { saveMood(mood.getAttribute('data-wave92h-mood')); e.preventDefault(); return; }
    var b = e.target.closest('[data-wave92h-action]');
    if (!b) return;
    var a = b.getAttribute('data-wave92h-action');
    if (a === 'profile') showProfileModal();
    else if (a === 'onboarding') showOnboardingModal();
    else if (a === 'save-profile') saveProfileFromModal();
    else if (a === 'save-onboarding') saveOnboarding();
    else if (a === 'switch-profile') switchProfile(b.getAttribute('data-profile-id'));
    else if (a === 'new-profile') newProfile();
    else if (a === 'delete-profile') deleteProfile();
    else if (a === 'close-modal') closeModal();
    else if (a === 'clipboard-backup') clipboardBackup();
    else if (a === 'focus-toggle') toggleFocus();
    else if (a === 'theme-toggle') toggleThemeSchedule();
    else if (a === 'micro-done') markMicroDone();
    else if (a === 'whats-new-close') { set(KEY.seen, VERSION); closeModal(); track('wave92h_whats_new_close', {}); }
    e.preventDefault();
  }

  function updateExistingNodes(){
    var home = document.getElementById('wave92h-home');
    if (home) { home.remove(); ensureIndexHub(); }
    var coach = document.getElementById('wave92h-grade-coach');
    if (coach) { coach.remove(); ensureGradeCoach(); }
    var row = document.getElementById('wave92h-quick-row');
    if (row) row.remove();
    enhanceQuickPanel();
    applyFocus();
  }
  function renderAll(){ ensureIndexHub(); ensureGradeCoach(); enhanceQuickPanel(); updateExistingNodes(); }

  ready(function(){
    installCss();
    applyFocus();
    applyThemeSchedule();
    setInterval(applyThemeSchedule, 5 * 60 * 1000);
    document.addEventListener('click', handleClick, true);
    renderAll();
    try {
      var mo = new MutationObserver(function(){ if (!inPlay()) { enhanceQuickPanel(); } });
      mo.observe(document.body, { childList:true, subtree:true });
    } catch(_) {}
    setTimeout(showWhatsNew, isGradePage() ? 2200 : 1800);
    window.__wave92h = {
      version: VERSION,
      profiles: profiles,
      currentProfile: currentProfile,
      clipboardBackup: clipboardBackup,
      applyFocus: applyFocus,
      applyThemeSchedule: applyThemeSchedule
    };
    track('wave92h_boot', { page: page(), grade: gradeFromPage() || null });
  });
})();

/* wave92j: storage integrity, quota guard, monthly backup and SW update notice */
(function(){
  'use strict';
  var root = window;
  if (!root || root.__wave92jAppSafety) return;
  var VERSION = 'wave92j';
  var DAY = 86400000;
  var BACKUP_KEY = 'trainer_auto_backup_last_wave92j';
  var CORRUPT_KEY = 'trainer_corrupt_keys_wave92j';
  var QUOTA_KEY = 'trainer_quota_notice_wave92j';
  var RAW_SET = null, RAW_REMOVE = null, RAW_GET = null;
  try { RAW_SET = Storage.prototype.setItem; RAW_REMOVE = Storage.prototype.removeItem; RAW_GET = Storage.prototype.getItem; } catch(_) {}

  function now(){ return Date.now(); }
  function page(){ try { return (location.pathname || '/').split('/').pop() || 'index.html'; } catch(_) { return 'index.html'; } }
  function get(k){ try { return RAW_GET ? RAW_GET.call(localStorage, k) : localStorage.getItem(k); } catch(_) { return null; } }
  function set(k,v){ try { RAW_SET ? RAW_SET.call(localStorage, k, String(v)) : localStorage.setItem(k, String(v)); return true; } catch(_) { return false; } }
  function remove(k){ try { RAW_REMOVE ? RAW_REMOVE.call(localStorage, k) : localStorage.removeItem(k); return true; } catch(_) { return false; } }
  function txt(v,n){ return String(v == null ? '' : v).replace(/\s+/g,' ').trim().slice(0, n || 240); }
  function isAppKey(k){ return /^(trainer_|wave\d+|exam|rush|daily)/i.test(String(k || '')); }
  function looksJson(v){ v = String(v == null ? '' : v).trim(); return v.charAt(0) === '{' || v.charAt(0) === '['; }
  function track(kind, meta){ try { if (root.trainerEvents && root.trainerEvents.track) root.trainerEvents.track(kind, meta || {}); } catch(_) {} }
  function activePlay(){ try { var s = document.getElementById('s-play'); return !!(s && /\bon\b/.test(s.className || '')); } catch(_) { return false; } }

  function ensureCss(){
    if (document.getElementById('wave92j-app-safety-css')) return;
    var css = '.wave92j-banner{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:99998;background:var(--card,#fff);color:var(--text,#111827);border:1px solid var(--border,#e5e7eb);box-shadow:0 18px 42px rgba(15,23,42,.2);border-radius:16px;padding:12px;display:flex;gap:10px;align-items:flex-start;max-width:720px;margin:0 auto}.wave92j-banner strong{display:block;font-size:14px;margin-bottom:3px}.wave92j-banner p{margin:0;font-size:12px;line-height:1.45;color:var(--muted,#6b7280)}.wave92j-banner .wave92j-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.wave92j-banner button{min-height:40px;border-radius:12px;border:1px solid var(--border,#e5e7eb);background:var(--card,#fff);color:inherit;font-weight:700;padding:8px 10px}.wave92j-banner button.primary{background:var(--accent,#2563eb);border-color:var(--accent,#2563eb);color:#fff}.wave92j-banner .x{margin-left:auto;min-width:40px}.scr#s-play.on ~ .wave92j-banner,body.simple-mode #s-play.on .wave92j-banner{display:none!important}@media(max-width:540px){.wave92j-banner{left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));font-size:12px}}';
    try {
      var style = document.createElement('style');
      style.id = 'wave92j-app-safety-css';
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);
    } catch(_) {}
  }
  function toast(message){
    try {
      if (typeof root.showToast === 'function') { root.showToast(message, 'info', 2600); return; }
      if (typeof root.toast === 'function') { root.toast(message); return; }
    } catch(_) {}
  }
  function banner(id, title, message, actions){
    if (!document.body || activePlay()) { toast(title || message); return null; }
    ensureCss();
    var old = document.getElementById(id); if (old) old.remove();
    var n = document.createElement('div');
    n.id = id;
    n.className = 'wave92j-banner';
    n.setAttribute('role', 'status');
    n.setAttribute('aria-live', 'polite');
    var copy = document.createElement('div'); copy.style.flex = '1';
    var h = document.createElement('strong'); h.textContent = title || '';
    var p = document.createElement('p'); p.textContent = message || '';
    copy.appendChild(h); copy.appendChild(p);
    if (actions && actions.length) {
      var row = document.createElement('div'); row.className = 'wave92j-actions';
      actions.forEach(function(a){
        var b = document.createElement('button'); b.type = 'button'; b.textContent = a.label || 'OK';
        if (a.primary) b.className = 'primary';
        b.addEventListener('click', function(ev){ ev.preventDefault(); try { a.run && a.run(n); } catch(_) {} });
        row.appendChild(b);
      });
      copy.appendChild(row);
    }
    var close = document.createElement('button'); close.type='button'; close.className='x'; close.setAttribute('aria-label','Закрыть'); close.textContent='×'; close.addEventListener('click', function(){ n.remove(); });
    n.appendChild(copy); n.appendChild(close);
    document.body.appendChild(n);
    return n;
  }

  function backupPayload(){
    var data = {}, keys = [];
    try { for (var i=0;i<localStorage.length;i++){ var k = localStorage.key(i); if (isAppKey(k)) keys.push(k); } } catch(_) {}
    keys.sort().forEach(function(k){ data[k] = get(k); });
    return JSON.stringify({ version: VERSION, exported_at: new Date().toISOString(), page: page(), data: data }, null, 2);
  }
  function downloadBackup(text){
    try {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type:'application/json;charset=utf-8' }));
      a.download = 'trainer_backup_wave92j.json';
      document.body.appendChild(a); a.click();
      setTimeout(function(){ try { URL.revokeObjectURL(a.href); a.remove(); } catch(_) {} }, 300);
    } catch(_) {}
  }
  function copyBackup(){
    var payload = backupPayload();
    set(BACKUP_KEY, String(now()));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(payload).then(function(){ toast('Бэкап прогресса скопирован.'); track('monthly_backup_copy', { ok:true }); }, function(){ downloadBackup(payload); toast('Clipboard недоступен — скачал backup JSON.'); track('monthly_backup_copy', { fallback:true }); });
    } else {
      downloadBackup(payload); toast('Clipboard недоступен — скачал backup JSON.'); track('monthly_backup_copy', { fallback:true });
    }
  }
  function maybeMonthlyBackup(){
    if (/embed\.html$/.test(page())) return;
    var last = Number(get(BACKUP_KEY) || 0);
    if (last && now() - last < 30 * DAY) return;
    banner('wave92j-monthly-backup', 'Резервная копия прогресса', 'Раз в месяц можно скопировать локальный бэкап, чтобы не потерять прогресс при сбое браузера.', [
      { label:'Скопировать бэкап', primary:true, run:function(n){ copyBackup(); if(n) n.remove(); } },
      { label:'Напомнить позже', run:function(n){ set(BACKUP_KEY, String(now() - 25 * DAY)); if(n) n.remove(); } }
    ]);
  }

  function checkIntegrity(){
    var bad = [];
    try {
      for (var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i), v = get(k);
        if (!isAppKey(k) || !looksJson(v)) continue;
        try { JSON.parse(v); } catch(e) { bad.push(k); }
      }
    } catch(_) {}
    if (!bad.length) { remove(CORRUPT_KEY); return []; }
    set(CORRUPT_KEY, JSON.stringify({ at: now(), keys: bad.slice(0,50) }));
    banner('wave92j-storage-integrity', 'Есть повреждённые данные', 'Найдено повреждённых JSON-записей: ' + bad.length + '. Сначала скопируй бэкап, затем можно очистить только эти записи.', [
      { label:'Скопировать бэкап', primary:true, run:copyBackup },
      { label:'Очистить повреждённые', run:function(n){ bad.forEach(remove); toast('Повреждённые записи очищены.'); track('storage_corrupt_clean', { count: bad.length }); if(n) n.remove(); } }
    ]);
    track('storage_corrupt_detected', { count: bad.length, keys: bad.slice(0,10) });
    return bad;
  }

  function isQuotaError(e){ return !!(e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014)); }
  function pruneOldLocalData(){
    var cutoff = now() - 180 * DAY, removed = [];
    var safe = /(event|events|analytics|navigation|nav|log|logs|scroll|seen|whats|fallback)/i;
    try {
      var keys = [];
      for (var i=0;i<localStorage.length;i++) keys.push(localStorage.key(i));
      keys.forEach(function(k){
        if (!isAppKey(k) || !safe.test(k)) return;
        var v = get(k), ts = 0;
        if (looksJson(v)) {
          try {
            var parsed = JSON.parse(v);
            if (Array.isArray(parsed) && parsed.length) {
              var first = parsed[0] || {}; ts = Date.parse(first.ts || first.at || first.date || '') || Number(first.updatedAt || first.createdAt || 0);
            } else if (parsed && typeof parsed === 'object') {
              ts = Date.parse(parsed.ts || parsed.at || parsed.date || '') || Number(parsed.updatedAt || parsed.createdAt || parsed.savedAt || 0);
            }
          } catch(_) {}
        }
        if (!ts || ts < cutoff) { remove(k); removed.push(k); }
      });
    } catch(_) {}
    if (removed.length) track('quota_prune_old_data', { count: removed.length });
    return removed;
  }
  function showQuotaNotice(removed){
    set(QUOTA_KEY, String(now()));
    banner('wave92j-quota-notice', 'Браузерное хранилище почти заполнено', 'Старые журналы очищены: ' + (removed && removed.length || 0) + '. Прогресс не удалялся. Сделай бэкап на всякий случай.', [
      { label:'Скопировать бэкап', primary:true, run:copyBackup },
      { label:'Понятно', run:function(n){ if(n) n.remove(); } }
    ]);
  }
  function installQuotaGuard(){
    if (!RAW_SET || RAW_SET.__wave92jQuotaGuard) return;
    var guarded = function(key, value){
      try { return RAW_SET.apply(this, arguments); }
      catch(e) {
        if (this === localStorage && isQuotaError(e)) {
          var removed = pruneOldLocalData();
          showQuotaNotice(removed);
          try { return RAW_SET.apply(this, arguments); } catch(e2) { throw e2; }
        }
        throw e;
      }
    };
    guarded.__wave92jQuotaGuard = true;
    try { Storage.prototype.setItem = guarded; } catch(_) {}
  }

  function showUpdateNotice(){
    banner('wave92j-sw-updated', 'Обновлено! Перезагрузите для новой версии', 'Новая версия уже установлена в Service Worker. Перезагрузка применит свежий кэш.', [
      { label:'Перезагрузить', primary:true, run:function(){ try { location.reload(); } catch(_) {} } },
      { label:'Позже', run:function(n){ if(n) n.remove(); } }
    ]);
    track('sw_update_notice', { cache: root.__TRAINER_CACHE || '' });
  }
  function installSwUpdateNotice(){
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker) return;
    try {
      navigator.serviceWorker.addEventListener('message', function(event){
        var d = event && event.data || {};
        if (d.type === 'TRAINER_SW_UPDATED' || d.type === 'SW_UPDATED') showUpdateNotice();
      });
      navigator.serviceWorker.addEventListener('controllerchange', function(){
        if (root.__wave92jControllerChanged) return;
        root.__wave92jControllerChanged = true;
        setTimeout(showUpdateNotice, 250);
      });
    } catch(_) {}
  }
  function init(){
    installQuotaGuard();
    installSwUpdateNotice();
    setTimeout(checkIntegrity, 900);
    setTimeout(maybeMonthlyBackup, 1800);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else init();
  root.__wave92jAppSafety = { version:VERSION, checkIntegrity:checkIntegrity, backupPayload:backupPayload, copyBackup:copyBackup, pruneOldLocalData:pruneOldLocalData };
})();
