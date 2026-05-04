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
/* wave92q: disabled wave92g/wave92h automatic UI, panels, onboarding and floating controls removed. */
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
