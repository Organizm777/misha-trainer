/* --- wave93d_accessibility_settings_layer.js --- */
(function(){
  'use strict';
  var WAVE = 'wave93d';
  if (window.__wave93dA11yBooted) return;
  var KEY_FONT = 'trainer_wave93b_font_size';
  var KEY_CONTRAST = 'trainer_wave93b_contrast';
  var KEY_MOTION = 'trainer_wave93b_motion';
  var FONT_VALUES = {normal:true, large:true, xlarge:true};
  var CONTRAST_VALUES = {normal:true, high:true};
  var MOTION_VALUES = {system:true, reduce:true};
  var syncTimer = 0;
  var intervalId = 0;
  var lastScreenId = '';
  var firstScreenSync = true;
  function safe(label, fn){
    try { return typeof fn === 'function' ? fn() : undefined; }
    catch (err) { try { console.warn('[wave93d a11y] ' + label, err); } catch (_) {} }
  }
  function qs(sel, root){ return (root || document).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function has(obj, key){ return Object.prototype.hasOwnProperty.call(obj, key); }
  function clean(value, max){ return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max || 160); }
  function storageGet(key, fallback){
    try { return localStorage.getItem(key) || fallback; }
    catch (_) { return fallback; }
  }
  function storageSet(key, value){
    try { localStorage.setItem(key, value); } catch (_) {}
  }
  function normalize(value, allowed, fallback){
    value = String(value || fallback || '');
    return has(allowed, value) ? value : fallback;
  }
  function prefs(){
    return {
      font: normalize(storageGet(KEY_FONT, 'normal'), FONT_VALUES, 'normal'),
      contrast: normalize(storageGet(KEY_CONTRAST, 'normal'), CONTRAST_VALUES, 'normal'),
      motion: normalize(storageGet(KEY_MOTION, 'system'), MOTION_VALUES, 'system')
    };
  }
  function applyPrefs(){
    var p = prefs();
    var root = document.documentElement;
    root.setAttribute('data-wave93b-font', p.font);
    root.setAttribute('data-wave93b-contrast', p.contrast);
    root.setAttribute('data-wave93b-motion', p.motion);
    root.setAttribute('data-wave93b-a11y', 'ready');
    if (!root.getAttribute('lang')) root.setAttribute('lang', 'ru');
    updateToolbarState();
  }
  function liveRegion(){
    var node = document.getElementById('wave93b-live');
    if (node) return node;
    if (!document.body) return null;
    node = document.createElement('div');
    node.id = 'wave93b-live';
    node.className = 'wave93b-sr-only';
    node.setAttribute('aria-live', 'polite');
    node.setAttribute('aria-atomic', 'true');
    document.body.appendChild(node);
    return node;
  }
  function announce(message){
    var node = liveRegion();
    if (!node) return;
    node.textContent = '';
    window.setTimeout(function(){ node.textContent = String(message || ''); }, 30);
  }
  function ensureSettingsBridge(){
    qsa('#wave93b-a11y,.wave93b-a11y,#wave93b-a11y-panel').forEach(function(node){
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
    updateToolbarState();
  }
  function updateToolbarState(){
    var p = prefs();
    qsa('[data-wave93b-font]').forEach(function(btn){
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-wave93b-font') === p.font));
    });
    qsa('[data-wave93b-contrast]').forEach(function(btn){
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-wave93b-contrast') === p.contrast));
    });
    qsa('[data-wave93b-motion]').forEach(function(btn){
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-wave93b-motion') === p.motion));
    });
  }
  function setPanel(open){
    updateToolbarState();
  }
  function handleToolbarAction(event){
    var target = event.target && event.target.closest ? event.target.closest('[data-wave93b-action],[data-wave93b-font],[data-wave93b-contrast],[data-wave93b-motion]') : null;
    if (!target) return;
    var action = target.getAttribute('data-wave93b-action');
    if (action === 'close-panel') {
      event.preventDefault();
      setPanel(false);
      return;
    }
    var font = target.getAttribute('data-wave93b-font');
    var contrast = target.getAttribute('data-wave93b-contrast');
    var motion = target.getAttribute('data-wave93b-motion');
    if (font) {
      event.preventDefault();
      storageSet(KEY_FONT, normalize(font, FONT_VALUES, 'normal'));
      applyPrefs();
      announce(font === 'normal' ? 'Обычный размер текста' : font === 'large' ? 'Текст увеличен' : 'Максимальный размер текста');
      scheduleSync(30);
    } else if (contrast) {
      event.preventDefault();
      storageSet(KEY_CONTRAST, normalize(contrast, CONTRAST_VALUES, 'normal'));
      applyPrefs();
      announce(contrast === 'high' ? 'Высокий контраст включён' : 'Обычный контраст включён');
      scheduleSync(30);
    } else if (motion) {
      event.preventDefault();
      storageSet(KEY_MOTION, normalize(motion, MOTION_VALUES, 'system'));
      applyPrefs();
      announce(motion === 'reduce' ? 'Анимация сведена к минимуму' : 'Анимация по системной настройке');
      scheduleSync(30);
    }
  }
  function ensureSkipTarget(target){
    if (!target) return;
    qsa('#main-content').forEach(function(node){
      if (node !== target && node.id === 'main-content') node.removeAttribute('id');
    });
    target.id = 'main-content';
    if (target.tagName !== 'MAIN' && !target.getAttribute('role')) target.setAttribute('role', 'main');
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  }
  function visibleScreen(){
    return qs('.scr.on') || qs('main') || qs('.w') || document.body;
  }
  function syncScreens(){
    qsa('.scr').forEach(function(scr){
      var active = scr.classList.contains('on');
      scr.setAttribute('aria-hidden', active ? 'false' : 'true');
      if (active && !scr.getAttribute('aria-label')) {
        var heading = qs('h1,h2,h3,.hdr-title,.res-title', scr);
        var name = clean(heading && heading.textContent, 80);
        if (name) scr.setAttribute('aria-label', name);
      }
    });
    var active = visibleScreen();
    var main = qs('.w', active) || active;
    ensureSkipTarget(main);
    var id = (active && (active.id || active.getAttribute('aria-label') || active.className)) || 'page';
    if (id !== lastScreenId) {
      var isFirst = firstScreenSync;
      firstScreenSync = false;
      lastScreenId = id;
      if (!isFirst) focusScreen(active, main);
    }
  }
  function focusScreen(active, main){
    if (!active || !document.hasFocus || !document.hasFocus()) return;
    var ae = document.activeElement;
    var tag = ae && ae.tagName ? ae.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || (ae && ae.isContentEditable)) return;
    var target = qs('h1,h2,h3,.hdr-title,#qb,#q-card,.qcard,[data-wave93b-focus]', active) || main;
    if (!target || !target.focus) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    try { target.focus({preventScroll:true}); } catch (_) { try { target.focus(); } catch (_err) {} }
  }
  function labelFromAttrs(el){
    return clean(el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('placeholder') || el.getAttribute('data-wave87r-action') || el.getAttribute('data-wave89t-play-action') || el.getAttribute('href') || el.textContent, 120);
  }
  function syncInteractive(){
    qsa('img:not([alt])').forEach(function(img){ img.setAttribute('alt', ''); });
    qsa('a[target="_blank"]').forEach(function(a){
      var rel = clean(a.getAttribute('rel'));
      if (!/noopener/.test(rel)) a.setAttribute('rel', clean(rel + ' noopener noreferrer'));
    });
    qsa('input,textarea,select').forEach(function(el){
      if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return;
      var label = labelFromAttrs(el);
      if (label) el.setAttribute('aria-label', label);
    });
    qsa('[data-wave87r-action], [data-wave89t-play-action], .hdr-back, .qback, .tbtn, .scard').forEach(function(el){
      var native = /^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName || '');
      if (!native && !el.getAttribute('role')) el.setAttribute('role', 'button');
      if (!native && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      if (!el.getAttribute('aria-label')) {
        var label = labelFromAttrs(el);
        if (label) el.setAttribute('aria-label', label);
      }
    });
    qsa('nav:not([aria-label])').forEach(function(nav){ nav.setAttribute('aria-label', 'Навигация'); });
    qsa('#sts,.sbar,#q-pgtext,#q-prog,.qprog,#tmr,.notice,.wave24-offline-indicator').forEach(function(el){
      if (!el.getAttribute('role')) el.setAttribute('role', 'status');
      if (!el.getAttribute('aria-live')) el.setAttribute('aria-live', 'polite');
    });
    qsa('#fba,#hint-box,.fb,.toast,.report-toast').forEach(function(el){
      if (!el.getAttribute('role')) el.setAttribute('role', 'status');
      if (!el.getAttribute('aria-live')) el.setAttribute('aria-live', 'polite');
    });
  }
  function questionElement(group){
    return qs('#qb') || qs('#q-card') || qs('#q-txt') || qs('.qcard') || qs('[data-wave93b-question]', group && group.closest ? group.closest('.scr') : document);
  }
  function syncRadioGroups(){
    var groups = qsa('#opts,.opts,#q-opts,#p-opts,.likert');
    groups.forEach(function(group){
      var options = qsa('button.opt,.opt,.likert-opt,[role="radio"]', group).filter(function(el){ return el && el !== group; });
      if (options.length < 2) return;
      group.setAttribute('role', 'radiogroup');
      if (!group.getAttribute('aria-label')) group.setAttribute('aria-label', 'Варианты ответа');
      var question = questionElement(group);
      if (question) {
        if (!question.id) question.id = 'wave93b-question-' + Math.random().toString(36).slice(2, 8);
        group.setAttribute('aria-describedby', question.id);
      }
      var selectedIndex = -1;
      var hasExplicitSelected = options.some(function(el){ return /\bselected\b/.test(el.className || ''); });
      var hasWrongSelected = options.some(function(el){ return /\bno\b|\bwrong\b|\bincorrect\b/.test(el.className || ''); });
      options.forEach(function(el, index){
        var cls = String(el.className || '');
        var checked = false;
        if (hasExplicitSelected) checked = /\bselected\b/.test(cls);
        else if (hasWrongSelected) checked = /\bno\b|\bwrong\b|\bincorrect\b/.test(cls);
        else checked = /\bok\b|\bcorrect\b/.test(cls) || el.getAttribute('aria-pressed') === 'true';
        if (checked && selectedIndex < 0) selectedIndex = index;
      });
      if (selectedIndex < 0) selectedIndex = 0;
      options.forEach(function(el, index){
        var checked = index === selectedIndex && /\b(done|selected|ok|no|correct|wrong|incorrect)\b/.test(String(el.className || '') + ' ' + String(el.getAttribute('aria-pressed') || ''));
        el.setAttribute('role', 'radio');
        el.setAttribute('aria-checked', String(!!checked));
        el.setAttribute('aria-posinset', String(index + 1));
        el.setAttribute('aria-setsize', String(options.length));
        if (!el.getAttribute('aria-keyshortcuts')) el.setAttribute('aria-keyshortcuts', String(index + 1) + (index < 4 ? ' ' + 'ABCD'[index] : ''));
        if (!el.getAttribute('aria-label')) {
          var label = clean(el.textContent, 120);
          el.setAttribute('aria-label', 'Вариант ' + (index + 1) + (label ? ': ' + label : ''));
        }
        if (el.disabled || el.getAttribute('aria-disabled') === 'true') el.setAttribute('tabindex', '-1');
        else el.setAttribute('tabindex', String(index === selectedIndex ? 0 : -1));
      });
    });
  }
  function activateNonNative(el, event){
    var native = /^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(el.tagName || '');
    if (native) return false;
    event.preventDefault();
    if (typeof el.click === 'function') el.click();
    return true;
  }
  function handleKeyboard(event){
    if (!event) return;
    var target = event.target;
    if (!target || !target.closest) return;
    var radio = target.closest('[role="radio"]');
    if (radio) {
      var group = radio.closest('[role="radiogroup"]');
      var options = group ? qsa('[role="radio"]', group).filter(function(el){ return el.getAttribute('aria-disabled') !== 'true' && !el.disabled; }) : [];
      var index = options.indexOf(radio);
      if ((event.key === ' ' || event.key === 'Enter') && index >= 0) {
        event.preventDefault();
        if (typeof radio.click === 'function') radio.click();
        scheduleSync(80);
        return;
      }
      if ((event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowUp') && options.length) {
        event.preventDefault();
        var delta = (event.key === 'ArrowRight' || event.key === 'ArrowDown') ? 1 : -1;
        var next = options[(index + delta + options.length) % options.length];
        if (next && next.focus) next.focus();
        return;
      }
    }
    var roleButton = target.closest('[role="button"]');
    if (roleButton && (event.key === ' ' || event.key === 'Enter')) activateNonNative(roleButton, event);
  }
  function syncAll(){
    safe('apply prefs', applyPrefs);
    safe('settings bridge', ensureSettingsBridge);
    safe('live region', liveRegion);
    safe('screens', syncScreens);
    safe('interactive', syncInteractive);
    safe('radio groups', syncRadioGroups);
  }
  function scheduleSync(delay){
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(function(){ syncAll(); }, typeof delay === 'number' ? delay : 90);
  }
  function bindEvents(){
    document.addEventListener('click', function(event){
      handleToolbarAction(event);
      scheduleSync(100);
    }, true);
    document.addEventListener('keydown', handleKeyboard, true);
    document.addEventListener('focusin', function(){ scheduleSync(120); }, true);
    ['trainer:start','trainer:render','trainer:answer','trainer:end','trainer:themechange'].forEach(function(type){
      document.addEventListener(type, function(){ scheduleSync(40); });
    });
    window.addEventListener('pageshow', function(){ scheduleSync(40); });
    window.addEventListener('hashchange', function(){ scheduleSync(40); });
    if (!intervalId) intervalId = window.setInterval(function(){ scheduleSync(0); }, 1600);
  }
  function boot(){
    if (window.__wave93dA11yBooted) return;
    window.__wave93dA11yBooted = true;
    syncAll();
    bindEvents();
    var api = {
      wave: WAVE,
      sync: function(){ scheduleSync(0); },
      prefs: prefs,
      setFont: function(value){ storageSet(KEY_FONT, normalize(value, FONT_VALUES, 'normal')); applyPrefs(); scheduleSync(0); },
      setContrast: function(value){ storageSet(KEY_CONTRAST, normalize(value, CONTRAST_VALUES, 'normal')); applyPrefs(); scheduleSync(0); },
      setMotion: function(value){ storageSet(KEY_MOTION, normalize(value, MOTION_VALUES, 'system')); applyPrefs(); scheduleSync(0); }
    };
    window.__wave93dA11y = api;
    window.__wave93bA11y = api;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ safe('boot', boot); }, {once:true});
  } else {
    safe('boot', boot);
  }
})();
