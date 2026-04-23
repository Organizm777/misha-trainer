(function(){
  'use strict';
  var VERSION = 'wave86u';
  var DATA_PREFIX = 'data-wave86u-on-';
  var STATIC_CLICK_ATTR = 'data-wave87e-click';
  var EVENTS = ['click','input','change','keydown','load','error'];
  var stats = { stripped: 0, executed: 0, staticExecuted: 0, blocked: 0, byEvent: {}, lastBlocked: null, lastStaticBlocked: null };

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
    EVENTS.forEach(function(type){ document.addEventListener(type, handler(type), true); });
  }

  function getStaticTarget(start){
    for(var el=start; el && el !== document; el = el.parentElement){
      if(el.nodeType === 1 && el.hasAttribute(STATIC_CLICK_ATTR)) return el;
    }
    return null;
  }
  function callIfAvailable(name, args){
    var fn = window && window[name];
    if(typeof fn !== 'function') throw new Error('Missing static handler: ' + name);
    return fn.apply(window, args || []);
  }
  function runStaticAction(action, el, event){
    switch(String(action || '')){
      case 'dashboard-report': return callIfAvailable('downloadDashboardReport');
      case 'dashboard-csv': return callIfAvailable('downloadDashboardCSV');
      case 'dashboard-png': return callIfAvailable('downloadDashboardPNG');
      case 'print': return window.print && window.print();
      case 'confirm-exit': return callIfAvailable('confirmExit');
      case 'diag-next': return callIfAvailable('nextQ');
      case 'diag-skip': return callIfAvailable('skipQ');
      case 'diag-share': return callIfAvailable('shareResult');
      case 'go-select': return callIfAvailable('go', ['select']);
      case 'go-main': return callIfAvailable('go', ['main']);
      case 'go-info': return callIfAvailable('go', ['info']);
      case 'go-prog': return callIfAvailable('go', ['prog']);
      case 'go-subj': return callIfAvailable('goSubj');
      case 'start-normal-quiz': return callIfAvailable('wave86uStartNormalQuiz');
      case 'end-session': return callIfAvailable('endSession');
      case 'share-session': return callIfAvailable('shareSession');
      case 'back-after-result': return callIfAvailable('wave86uBackAfterResult');
      case 'toggle-privacy': return callIfAvailable('togglePrivacy');
      case 'show-journal': return callIfAvailable('showJournal');
      case 'show-badges': return callIfAvailable('showBadges');
      case 'show-profile': return callIfAvailable('showHallOfFame');
      case 'show-class-select': return callIfAvailable('showClassSelect');
      case 'show-about': return callIfAvailable('showAbout');
      case 'generate-report': return callIfAvailable('generateReport');
      case 'show-backup': return callIfAvailable('showBackupModal');
      case 'show-date-editor': return callIfAvailable('showDateEditor');
      case 'share-report': return callIfAvailable('shareReport');
      case 'reset-progress': return callIfAvailable('resetProgress');
      case 'test-launch-iq': return callIfAvailable('launchIQ');
      case 'test-launch-style': return callIfAvailable('launchStyle');
      case 'test-launch-temp': return callIfAvailable('launchTemp');
      case 'test-launch-motiv': return callIfAvailable('launchMotiv');
      case 'test-launch-holland': return callIfAvailable('launchHolland');
      case 'test-launch-psychknow': return callIfAvailable('launchPsychKnow');
      case 'test-launch-anxiety': return callIfAvailable('launchAnxiety');
      case 'test-portrait': return callIfAvailable('showPortrait');
      case 'test-start-iq': return callIfAvailable('startIQ');
      case 'test-menu': return callIfAvailable('go', ['menu']);
      case 'test-menu-refresh':
        callIfAvailable('go', ['menu']);
        return callIfAvailable('refreshMenu');
      case 'test-share-psych': return callIfAvailable('sharePsych');
    }
    throw new Error('Unknown static action: ' + action);
  }
  function installStaticActions(){
    document.addEventListener('click', function(event){
      var el = getStaticTarget(event.target);
      if(!el) return;
      event.preventDefault();
      try{
        runStaticAction(el.getAttribute(STATIC_CLICK_ATTR), el, event);
        stats.staticExecuted++;
      }catch(err){
        stats.blocked++;
        stats.lastStaticBlocked = el.getAttribute(STATIC_CLICK_ATTR) || '';
        if(window.console && console.warn) console.warn('[wave87e static actions] handler failed:', err, stats.lastStaticBlocked);
      }
    }, true);
  }

  bootTheme();
  installScrubber();
  installDelegates();
  installStaticActions();
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
        staticExecuted: stats.staticExecuted,
        blocked: stats.blocked,
        byEvent: Object.assign({}, stats.byEvent),
        lastBlocked: stats.lastBlocked,
        lastStaticBlocked: stats.lastStaticBlocked,
        scriptSrcHasUnsafeInline: /script-src[^;]*unsafe-inline/.test(content),
        inlineHandlerAttrsLeft: document.querySelectorAll(EVENTS.map(function(type){ return '[' + attrName(type) + ']'; }).join(',')).length,
        staticActionAttrs: document.querySelectorAll('[' + STATIC_CLICK_ATTR + ']').length,
        legacyStaticActionAttrs: document.querySelectorAll('[data-wave86u-on-click],[data-wave86u-on-input],[data-wave86u-on-change],[data-wave86u-on-keydown]').length
      };
    }
  };
})();
