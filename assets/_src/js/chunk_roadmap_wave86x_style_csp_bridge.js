(function(){
  'use strict';
  var VERSION = 'wave86x';
  var DATA_STYLE = 'data-wave86x-style';
  var DATA_FIXED = 'data-wave86x-fixed';
  var CLASS_PREFIX = 'w86x_style_';
  var linkEl = null;
  var cssUrl = null;
  var pending = false;
  var cssRules = [];
  var extraBlocks = [];
  var ruleByStyle = Object.create(null);
  var stats = { applied: 0, generatedRules: 0, adoptedBlocks: 0, rejected: 0, scans: 0 };

  function hashText(text){
    var h = 2166136261;
    text = String(text || '');
    for(var i=0;i<text.length;i++){
      h ^= text.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return (h >>> 0).toString(36);
  }
  function splitDecls(styleText){
    var out = [];
    var buf = '';
    var quote = null;
    var esc = false;
    var paren = 0;
    var src = String(styleText || '');
    for(var i=0;i<src.length;i++){
      var ch = src[i];
      if(quote){
        buf += ch;
        if(esc) esc = false;
        else if(ch === '\\') esc = true;
        else if(ch === quote) quote = null;
        continue;
      }
      if(ch === '"' || ch === "'"){
        quote = ch;
        buf += ch;
        continue;
      }
      if(ch === '(') paren++;
      else if(ch === ')' && paren) paren--;
      if(ch === ';' && paren === 0){
        if(buf.trim()) out.push(buf.trim());
        buf = '';
      }else{
        buf += ch;
      }
    }
    if(buf.trim()) out.push(buf.trim());
    return out;
  }
  function sanitizeStyle(styleText){
    var decls = splitDecls(styleText);
    var clean = [];
    for(var i=0;i<decls.length;i++){
      var d = decls[i];
      var idx = d.indexOf(':');
      if(idx <= 0) continue;
      var prop = d.slice(0, idx).trim().toLowerCase();
      var val = d.slice(idx + 1).trim();
      if(!/^(?:--)?[a-z][a-z0-9_-]*$/.test(prop)) { stats.rejected++; continue; }
      if(/[<>{}]/.test(val)) { stats.rejected++; continue; }
      if(/expression\s*\(|behavior\s*:|javascript\s*:|url\s*\(\s*['"]?\s*javascript\s*:/i.test(val)) { stats.rejected++; continue; }
      val = val.replace(/!important\s*$/i, '').trim();
      if(!val) continue;
      clean.push(prop + ':' + val + '!important');
    }
    return clean.join(';');
  }
  function ensureLink(){
    if(linkEl && linkEl.parentNode) return linkEl;
    linkEl = document.getElementById('wave86x-style-csp-sheet');
    if(!linkEl){
      linkEl = document.createElement('link');
      linkEl.id = 'wave86x-style-csp-sheet';
      linkEl.rel = 'stylesheet';
      linkEl.setAttribute('data-wave86x-generated', '1');
      (document.head || document.documentElement).appendChild(linkEl);
    }
    return linkEl;
  }
  function scheduleSheetUpdate(){
    if(pending) return;
    pending = true;
    setTimeout(updateSheet, 0);
  }
  function updateSheet(){
    pending = false;
    try{
      ensureLink();
      var css = cssRules.join('\n') + (extraBlocks.length ? '\n' + extraBlocks.join('\n') : '');
      var blob = new Blob([css], {type:'text/css'});
      var nextUrl = URL.createObjectURL(blob);
      var oldUrl = cssUrl;
      cssUrl = nextUrl;
      linkEl.href = nextUrl;
      if(oldUrl) setTimeout(function(){ try{ URL.revokeObjectURL(oldUrl); }catch(e){} }, 5000);
    }catch(e){
      if(window.console && console.warn) console.warn('[wave86x style CSP] failed to update stylesheet', e);
    }
  }
  function dropGeneratedClasses(el){
    if(!el || !el.classList) return;
    var list = Array.prototype.slice.call(el.classList);
    for(var i=0;i<list.length;i++){
      if(list[i].indexOf(CLASS_PREFIX) === 0) el.classList.remove(list[i]);
    }
  }
  function classForStyle(styleText){
    var clean = sanitizeStyle(styleText);
    if(!clean) return '';
    if(ruleByStyle[clean]) return ruleByStyle[clean];
    var cls = CLASS_PREFIX + hashText(clean);
    ruleByStyle[clean] = cls;
    cssRules.push('.' + cls + '{' + clean + '}');
    stats.generatedRules++;
    scheduleSheetUpdate();
    return cls;
  }
  function applyStyle(el, styleText){
    if(!el || el.nodeType !== 1 || !styleText) return;
    var cls = classForStyle(styleText);
    if(!cls) return;
    dropGeneratedClasses(el);
    el.classList.add(cls);
    if(/(^|;)\s*position\s*:\s*fixed\b/i.test(String(styleText))) el.setAttribute(DATA_FIXED, '1');
    if(el.hasAttribute('style')) el.removeAttribute('style');
    if(el.hasAttribute(DATA_STYLE)) el.removeAttribute(DATA_STYLE);
    stats.applied++;
  }
  function adoptStyleElement(el){
    if(!el || el.nodeType !== 1 || el.tagName !== 'STYLE' || el.getAttribute('data-wave86x-generated')) return;
    var css = el.textContent || '';
    if(!css.trim()) { try{ el.remove(); }catch(e){} return; }
    if(/<\/?style|javascript\s*:/i.test(css)) { stats.rejected++; return; }
    extraBlocks.push(css);
    stats.adoptedBlocks++;
    scheduleSheetUpdate();
    try{ el.remove(); }catch(e){}
  }
  function scrubElement(el){
    if(!el || el.nodeType !== 1) return;
    if(el.tagName === 'STYLE') { adoptStyleElement(el); return; }
    if(el.hasAttribute(DATA_STYLE)) applyStyle(el, el.getAttribute(DATA_STYLE) || '');
    else if(el.hasAttribute('style')) applyStyle(el, el.getAttribute('style') || '');
  }
  function scan(root){
    if(!root) return;
    stats.scans++;
    if(root.nodeType === 1) scrubElement(root);
    if(root.querySelectorAll){
      var list = root.querySelectorAll('[' + DATA_STYLE + '],[style],style:not([data-wave86x-generated])');
      for(var i=0;i<list.length;i++) scrubElement(list[i]);
    }
  }
  function installObserver(){
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
      mo.observe(document.documentElement, {childList:true, subtree:true, attributes:true, attributeFilter:['style', DATA_STYLE]});
    }catch(e){}
  }
  function patchClosest(){
    try{
      if(!window.Element || !Element.prototype.closest || Element.prototype.__wave86xStyleClosestPatched) return;
      var originalClosest = Element.prototype.closest;
      Element.prototype.closest = function(selector){
        if(selector === 'div[style*=fixed]' || selector === 'div[style*="fixed"]' || selector === "div[style*='fixed']"){
          selector = 'div[' + DATA_FIXED + '="1"],div[style*=fixed]';
        }
        return originalClosest.call(this, selector);
      };
      Object.defineProperty(Element.prototype, '__wave86xStyleClosestPatched', {value:true});
    }catch(e){}
  }

  patchClosest();
  installObserver();
  window.wave86xStyleCspBridge = {
    version: VERSION,
    scan: scan,
    auditSnapshot: function(){
      var meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      var content = meta ? meta.getAttribute('content') || '' : '';
      return {
        version: VERSION,
        applied: stats.applied,
        generatedRules: stats.generatedRules,
        adoptedBlocks: stats.adoptedBlocks,
        rejected: stats.rejected,
        scans: stats.scans,
        styleSrcHasUnsafeInline: /style-src[^;]*unsafe-inline/.test(content) || /style-src-elem[^;]*unsafe-inline/.test(content) || /style-src-attr[^;]*unsafe-inline/.test(content),
        inlineStyleBlocksLeft: document.querySelectorAll('style:not([data-wave86x-generated])').length,
        inlineStyleAttrsLeft: document.querySelectorAll('[style]').length,
        migratedStyleAttrsLeft: document.querySelectorAll('[' + DATA_STYLE + ']').length,
        fixedMarkers: document.querySelectorAll('[' + DATA_FIXED + '="1"]').length
      };
    }
  };
})();
