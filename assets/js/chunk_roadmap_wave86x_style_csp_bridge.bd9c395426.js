(function(){
  'use strict';
  var VERSION = 'wave87q-cssom-sheet';
  var DATA_FIXED = 'data-wave87p-fixed';
  var LEGACY_FIXED = 'data-wave86x-fixed';
  var CLASS_PREFIX = 'w87q_rt_';
  var TARGET_SHEET_TOKEN = 'wave86z_static_style_classes';
  var targetSheet = null;
  var sheetWatchInstalled = false;
  var pendingInline = [];
  var pendingBlocks = [];
  var ruleByStyle = Object.create(null);
  var insertedBlockByHash = Object.create(null);
  var stats = {
    applied: 0,
    generatedRules: 0,
    adoptedBlocks: 0,
    rejected: 0,
    scans: 0,
    queuedInline: 0,
    queuedBlocks: 0,
    sheetReady: 0,
    sheetActivations: 0
  };

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

  function stripCssComments(cssText){
    return String(cssText || '').replace(/\/\*[\s\S]*?\*\//g, '');
  }

  function splitCssRules(cssText){
    var src = stripCssComments(cssText);
    var out = [];
    var buf = '';
    var quote = null;
    var esc = false;
    var depth = 0;
    for(var i=0;i<src.length;i++){
      var ch = src[i];
      buf += ch;
      if(quote){
        if(esc) esc = false;
        else if(ch === '\\') esc = true;
        else if(ch === quote) quote = null;
        continue;
      }
      if(ch === '"' || ch === "'"){
        quote = ch;
        continue;
      }
      if(ch === '{'){
        depth++;
        continue;
      }
      if(ch === '}'){
        if(depth) depth--;
        if(depth === 0 && buf.trim()){
          out.push(buf.trim());
          buf = '';
        }
        continue;
      }
      if(ch === ';' && depth === 0 && /^\s*@/.test(buf)){
        out.push(buf.trim());
        buf = '';
      }
    }
    if(buf.trim()) out.push(buf.trim());
    return out.filter(function(rule){ return !!rule; });
  }

  function dropGeneratedClasses(el){
    if(!el || !el.classList) return;
    var list = Array.prototype.slice.call(el.classList);
    for(var i=0;i<list.length;i++){
      if(list[i].indexOf(CLASS_PREFIX) === 0) el.classList.remove(list[i]);
    }
  }

  function markFixed(el, styleText){
    var isFixed = /(^|;)\s*position\s*:\s*fixed\b/i.test(String(styleText || ''));
    if(isFixed){
      el.setAttribute(DATA_FIXED, '1');
      el.setAttribute(LEGACY_FIXED, '1');
    }else{
      el.removeAttribute(DATA_FIXED);
      el.removeAttribute(LEGACY_FIXED);
    }
  }

  function sheetHref(sheet){
    try{
      return String((sheet && sheet.href) || (sheet && sheet.ownerNode && sheet.ownerNode.href) || '');
    }catch(e){
      return '';
    }
  }

  function sheetMatches(sheet){
    return sheetHref(sheet).indexOf(TARGET_SHEET_TOKEN) !== -1;
  }

  function canUseSheet(sheet){
    if(!sheet || !sheetMatches(sheet)) return false;
    try{
      void sheet.cssRules;
      return true;
    }catch(e){
      return false;
    }
  }

  function findTargetSheet(){
    if(canUseSheet(targetSheet)){
      stats.sheetReady = 1;
      return targetSheet;
    }
    var sheets = document.styleSheets || [];
    for(var i=0;i<sheets.length;i++){
      if(canUseSheet(sheets[i])){
        targetSheet = sheets[i];
        stats.sheetReady = 1;
        return targetSheet;
      }
    }
    return null;
  }

  function bindMatchingLinks(){
    if(!document.querySelectorAll) return;
    var links = document.querySelectorAll('link[href*="' + TARGET_SHEET_TOKEN + '"]');
    for(var i=0;i<links.length;i++){
      var link = links[i];
      if(link.__wave87qStyleBridgeBound) continue;
      link.__wave87qStyleBridgeBound = true;
      try{ link.addEventListener('load', maybeActivateSheet, {once:true}); }catch(e){}
    }
  }

  function installSheetWatch(){
    if(sheetWatchInstalled) return;
    sheetWatchInstalled = true;
    bindMatchingLinks();
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', function(){ bindMatchingLinks(); maybeActivateSheet(); }, {once:true});
    }
    try{ window.addEventListener('load', maybeActivateSheet, {once:true}); }catch(e){}
    setTimeout(function(){ bindMatchingLinks(); maybeActivateSheet(); }, 0);
    try{
      var mo = new MutationObserver(function(records){
        var needsCheck = false;
        for(var i=0;i<records.length;i++){
          var rec = records[i];
          if(!rec.addedNodes) continue;
          for(var j=0;j<rec.addedNodes.length;j++){
            var node = rec.addedNodes[j];
            if(!node || node.nodeType !== 1) continue;
            if((node.tagName === 'LINK' && String(node.getAttribute('href') || '').indexOf(TARGET_SHEET_TOKEN) !== -1) || (node.querySelector && node.querySelector('link[href*="' + TARGET_SHEET_TOKEN + '"]'))){
              needsCheck = true;
              break;
            }
          }
          if(needsCheck) break;
        }
        if(needsCheck){
          bindMatchingLinks();
          maybeActivateSheet();
        }
      });
      mo.observe(document.documentElement, {childList:true, subtree:true});
    }catch(e){}
  }

  function insertRuleText(ruleText){
    var sheet = findTargetSheet();
    if(!sheet) return false;
    try{
      sheet.insertRule(ruleText, sheet.cssRules.length);
      return true;
    }catch(e){
      stats.rejected++;
      if(window.console && console.warn) console.warn('[wave87q runtime style] failed to insert rule', e, ruleText);
      return false;
    }
  }

  function ensureStyleRule(clean){
    var entry = ruleByStyle[clean];
    if(!entry){
      entry = {
        cls: CLASS_PREFIX + hashText(clean),
        rule: '.' + (CLASS_PREFIX + hashText(clean)) + '{' + clean + '}',
        inserted: false
      };
      ruleByStyle[clean] = entry;
    }
    if(!entry.inserted){
      if(!insertRuleText(entry.rule)) return '';
      entry.inserted = true;
      stats.generatedRules++;
    }
    return entry.cls;
  }

  function queueInline(el, styleText){
    if(!el || el.nodeType !== 1) return;
    el.__wave87qPendingStyle = styleText;
    if(el.__wave87qInlineQueued) return;
    el.__wave87qInlineQueued = true;
    pendingInline.push(el);
    stats.queuedInline++;
    installSheetWatch();
  }

  function queueBlock(el){
    if(!el || el.nodeType !== 1 || el.tagName !== 'STYLE') return;
    if(el.__wave87qBlockQueued) return;
    el.__wave87qBlockQueued = true;
    pendingBlocks.push(el);
    stats.queuedBlocks++;
    installSheetWatch();
  }

  function applyInlineStyleNow(el, styleText){
    if(!el || el.nodeType !== 1) return;
    var clean = sanitizeStyle(styleText);
    if(!clean){
      markFixed(el, '');
      if(el.hasAttribute('style')) el.removeAttribute('style');
      el.__wave87qPendingStyle = '';
      el.__wave87qInlineQueued = false;
      return;
    }
    var cls = ensureStyleRule(clean);
    if(!cls){
      queueInline(el, styleText);
      return;
    }
    dropGeneratedClasses(el);
    el.classList.add(cls);
    markFixed(el, styleText);
    if(el.hasAttribute('style')) el.removeAttribute('style');
    el.__wave87qPendingStyle = '';
    el.__wave87qInlineQueued = false;
    stats.applied++;
  }

  function applyInlineStyle(el, styleText){
    if(!el || el.nodeType !== 1 || !styleText) return;
    if(!findTargetSheet()){
      queueInline(el, styleText);
      return;
    }
    applyInlineStyleNow(el, styleText);
  }

  function adoptStyleElementNow(el){
    if(!el || el.nodeType !== 1 || el.tagName !== 'STYLE') return;
    var css = el.textContent || '';
    if(!css.trim()){
      try{ el.remove(); }catch(e){}
      el.__wave87qBlockQueued = false;
      return;
    }
    var rules = splitCssRules(css);
    if(!rules.length){
      stats.rejected++;
      try{ el.remove(); }catch(e){}
      el.__wave87qBlockQueued = false;
      return;
    }
    var inserted = 0;
    for(var i=0;i<rules.length;i++){
      var rule = rules[i];
      var key = hashText(rule);
      if(insertedBlockByHash[key]) continue;
      if(insertRuleText(rule)){
        insertedBlockByHash[key] = true;
        inserted++;
      }
    }
    if(inserted) stats.adoptedBlocks++;
    try{ el.remove(); }catch(e){}
    el.__wave87qBlockQueued = false;
  }

  function adoptStyleElement(el){
    if(!el || el.nodeType !== 1 || el.tagName !== 'STYLE') return;
    if(!findTargetSheet()){
      queueBlock(el);
      return;
    }
    adoptStyleElementNow(el);
  }

  function flushPending(){
    var sheet = findTargetSheet();
    if(!sheet) return false;
    if(!sheet.__wave87qStyleBridgeActivated){
      sheet.__wave87qStyleBridgeActivated = true;
      stats.sheetActivations++;
    }

    if(pendingInline.length){
      var inline = pendingInline.slice();
      pendingInline.length = 0;
      for(var i=0;i<inline.length;i++){
        var el = inline[i];
        if(!el || el.nodeType !== 1) continue;
        el.__wave87qInlineQueued = false;
        var styleText = el.hasAttribute && el.hasAttribute('style') ? (el.getAttribute('style') || el.__wave87qPendingStyle || '') : (el.__wave87qPendingStyle || '');
        if(styleText) applyInlineStyleNow(el, styleText);
      }
    }

    if(pendingBlocks.length){
      var blocks = pendingBlocks.slice();
      pendingBlocks.length = 0;
      for(var j=0;j<blocks.length;j++){
        var styleEl = blocks[j];
        if(!styleEl || styleEl.nodeType !== 1 || styleEl.tagName !== 'STYLE') continue;
        styleEl.__wave87qBlockQueued = false;
        adoptStyleElementNow(styleEl);
      }
    }
    return true;
  }

  function maybeActivateSheet(){
    installSheetWatch();
    bindMatchingLinks();
    return flushPending();
  }

  function scrubElement(el){
    if(!el || el.nodeType !== 1) return;
    if(el.tagName === 'STYLE') { adoptStyleElement(el); return; }
    if(el.hasAttribute('style')) applyInlineStyle(el, el.getAttribute('style') || '');
  }

  function scan(root){
    if(!root) return;
    stats.scans++;
    installSheetWatch();
    if(root.nodeType === 1) scrubElement(root);
    if(root.querySelectorAll){
      var list = root.querySelectorAll('[style],style');
      for(var i=0;i<list.length;i++) scrubElement(list[i]);
    }
  }

  function installObserver(){
    scan(document.documentElement);
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', function(){
        bindMatchingLinks();
        maybeActivateSheet();
        scan(document.documentElement);
      }, {once:true});
    }
    try{
      var mo = new MutationObserver(function(records){
        var sheetCandidate = false;
        for(var i=0;i<records.length;i++){
          var rec = records[i];
          if(rec.type === 'attributes'){
            scrubElement(rec.target);
            continue;
          }
          if(rec.addedNodes){
            for(var j=0;j<rec.addedNodes.length;j++){
              var node = rec.addedNodes[j];
              if(!node || node.nodeType !== 1) continue;
              if((node.tagName === 'LINK' && String(node.getAttribute('href') || '').indexOf(TARGET_SHEET_TOKEN) !== -1) || (node.querySelector && node.querySelector('link[href*="' + TARGET_SHEET_TOKEN + '"]'))){
                sheetCandidate = true;
              }
              scan(node);
            }
          }
        }
        if(sheetCandidate){
          bindMatchingLinks();
          maybeActivateSheet();
        }
      });
      mo.observe(document.documentElement, {childList:true, subtree:true, attributes:true, attributeFilter:['style']});
    }catch(e){}
    setTimeout(function(){ bindMatchingLinks(); maybeActivateSheet(); }, 0);
  }

  function patchClosest(){
    try{
      if(!window.Element || !Element.prototype.closest || Element.prototype.__wave87pRuntimeStyleClosestPatched) return;
      var originalClosest = Element.prototype.closest;
      Element.prototype.closest = function(selector){
        if(selector === 'div[style*=fixed]' || selector === 'div[style*="fixed"]' || selector === "div[style*='fixed']"){
          selector = 'div[' + DATA_FIXED + '="1"],div[' + LEGACY_FIXED + '="1"],div[style*=fixed]';
        }
        return originalClosest.call(this, selector);
      };
      Object.defineProperty(Element.prototype, '__wave87pRuntimeStyleClosestPatched', {value:true});
    }catch(e){}
  }

  patchClosest();
  installObserver();

  var api = {
    version: VERSION,
    scan: scan,
    flushPending: flushPending,
    auditSnapshot: function(){
      var meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      var content = meta ? meta.getAttribute('content') || '' : '';
      var sheet = findTargetSheet();
      var ruleCount = null;
      try{ ruleCount = sheet ? sheet.cssRules.length : null; }catch(e){ ruleCount = null; }
      return {
        version: VERSION,
        applied: stats.applied,
        generatedRules: stats.generatedRules,
        adoptedBlocks: stats.adoptedBlocks,
        rejected: stats.rejected,
        scans: stats.scans,
        queuedInline: stats.queuedInline,
        queuedBlocks: stats.queuedBlocks,
        pendingInline: pendingInline.length,
        pendingBlocks: pendingBlocks.length,
        sheetReady: !!sheet,
        sheetHref: sheet ? sheetHref(sheet) : '',
        sheetRuleCount: ruleCount,
        sheetActivations: stats.sheetActivations,
        styleSrcHasUnsafeInline: /style-src[^;]*unsafe-inline/.test(content) || /style-src-elem[^;]*unsafe-inline/.test(content) || /style-src-attr[^;]*unsafe-inline/.test(content),
        styleSrcHasBlob: /style-src[^;]*blob:/.test(content) || /style-src-elem[^;]*blob:/.test(content),
        inlineStyleBlocksLeft: document.querySelectorAll('style').length,
        inlineStyleAttrsLeft: document.querySelectorAll('[style]').length,
        fixedMarkers: document.querySelectorAll('[' + DATA_FIXED + '="1"],[' + LEGACY_FIXED + '="1"]').length
      };
    }
  };

  window.wave87qRuntimeStyleBridge = api;
  window.wave87pRuntimeStyleBridge = api;
  window.wave86xStyleCspBridge = api;
})();
