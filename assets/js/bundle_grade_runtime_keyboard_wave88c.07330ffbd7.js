/* bundle_grade_runtime_keyboard_wave88c */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave88cKeyboardShortcuts) return;

  var root = window;
  var DIGIT_MAP = { '1':0, '2':1, '3':2, '4':3, '5':4, '6':5, '7':6, '8':7, '9':8, '0':9 };
  var NUMPAD_MAP = { 'Numpad1':0, 'Numpad2':1, 'Numpad3':2, 'Numpad4':3, 'Numpad5':4, 'Numpad6':5, 'Numpad7':6, 'Numpad8':7, 'Numpad9':8, 'Numpad0':9 };
  var syncTimer = 0;
  var observer = null;

  function asText(value){
    return String(value == null ? '' : value);
  }
  function isArray(value){
    return Object.prototype.toString.call(value) === '[object Array]';
  }
  function isElement(node){
    return !!(node && typeof node === 'object' && node.nodeType === 1);
  }
  function hasClass(node, className){
    return !!(isElement(node) && node.classList && node.classList.contains(className));
  }
  function isEditableTarget(target){
    if (!target || typeof target !== 'object') return false;
    var tag = asText(target.tagName).toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || !!target.isContentEditable;
  }
  function isVisible(node){
    if (!isElement(node)) return false;
    if (node.hidden) return false;
    if (node.disabled) return false;
    if (typeof node.getAttribute === 'function') {
      if (node.getAttribute('aria-hidden') === 'true') return false;
    }
    var style = node.style || {};
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return true;
  }
  function classListContainsAll(node, names){
    if (!isElement(node) || !node.classList) return false;
    for (var i = 0; i < names.length; i += 1) {
      if (!node.classList.contains(names[i])) return false;
    }
    return true;
  }
  function walk(node, visitor){
    if (!isElement(node)) return;
    visitor(node);
    var children = node.children || [];
    for (var i = 0; i < children.length; i += 1) walk(children[i], visitor);
  }
  function getById(id){
    return document.getElementById ? document.getElementById(id) : null;
  }
  function activeScreenId(){
    var ids = ['s-main', 's-subj', 's-theory', 's-play', 's-result', 's-prog', 's-info'];
    for (var i = 0; i < ids.length; i += 1) {
      var node = getById(ids[i]);
      if (hasClass(node, 'on')) return ids[i];
    }
    return '';
  }
  function findActionButtons(action){
    var all = [];
    walk(document.body || document.documentElement, function(node){
      if (!isVisible(node) || typeof node.getAttribute !== 'function') return;
      if (node.getAttribute('data-wave87r-action') === action) all.push(node);
    });
    return all;
  }
  function findActionButton(action){
    var all = findActionButtons(action);
    return all.length ? all[0] : null;
  }
  function clickNode(node){
    if (!isVisible(node) || typeof node.click !== 'function') return false;
    node.click();
    return true;
  }
  function visibleChildrenWithClass(containerId, className){
    var host = getById(containerId);
    if (!host) return [];
    var out = [];
    walk(host, function(node){
      if (node === host) return;
      if (hasClass(node, className) && isVisible(node)) out.push(node);
    });
    return out;
  }
  function firstPrimaryButton(containerId){
    var host = getById(containerId);
    if (!host) return null;
    var match = null;
    walk(host, function(node){
      if (match || node === host) return;
      if (classListContainsAll(node, ['btn', 'btn-p']) && isVisible(node)) match = node;
    });
    return match;
  }
  function hasOpenDialog(){
    var found = false;
    walk(document.body || document.documentElement, function(node){
      if (found || !isVisible(node) || typeof node.getAttribute !== 'function') return;
      if (node.getAttribute('role') === 'dialog' && node.getAttribute('aria-modal') === 'true') found = true;
    });
    return found;
  }
  function mergeShortcuts(node, value){
    if (!isElement(node) || !value) return;
    var current = asText(node.getAttribute && node.getAttribute('aria-keyshortcuts'));
    var parts = {};
    current.split(/\s+/).forEach(function(item){
      item = asText(item).trim();
      if (item) parts[item] = true;
    });
    asText(value).split(/\s+/).forEach(function(item){
      item = asText(item).trim();
      if (item) parts[item] = true;
    });
    var out = Object.keys(parts).join(' ');
    if (out && typeof node.setAttribute === 'function') node.setAttribute('aria-keyshortcuts', out);
  }
  function syncDigitShortcuts(containerId, className){
    var keys = ['1','2','3','4','5','6','7','8','9','0'];
    var nodes = visibleChildrenWithClass(containerId, className);
    for (var i = 0; i < nodes.length && i < keys.length; i += 1) {
      mergeShortcuts(nodes[i], keys[i]);
    }
  }
  function syncActionShortcuts(){
    findActionButtons('start-normal-quiz').forEach(function(node){ mergeShortcuts(node, 'Enter'); });
    findActionButtons('back-after-result').forEach(function(node){ mergeShortcuts(node, 'Escape Enter'); });
    findActionButtons('end-session').forEach(function(node){ mergeShortcuts(node, 'Escape'); });
    findActionButtons('go-main').forEach(function(node){ mergeShortcuts(node, 'Escape'); });
    findActionButtons('go-subj').forEach(function(node){ mergeShortcuts(node, 'Escape'); });
  }
  function syncShortcuts(){
    syncDigitShortcuts('sg', 'scard');
    syncDigitShortcuts('tl', 'tbtn');
    syncActionShortcuts();
  }
  function scheduleSync(){
    if (syncTimer) root.clearTimeout(syncTimer);
    syncTimer = root.setTimeout(function(){
      syncTimer = 0;
      syncShortcuts();
    }, 60);
  }
  function digitIndexForKey(key){
    if (Object.prototype.hasOwnProperty.call(DIGIT_MAP, key)) return DIGIT_MAP[key];
    if (Object.prototype.hasOwnProperty.call(NUMPAD_MAP, key)) return NUMPAD_MAP[key];
    return -1;
  }
  function currentQuestion(){
    return root.prob && typeof root.prob === 'object' ? root.prob : null;
  }
  function isFreeInputActive(){
    return !!getById('wave87x-free-answer');
  }
  function isMultiSelectQuestion(question){
    return !!(question && question.interactionType === 'multi-select');
  }
  function hasResolvedSelection(){
    return root.sel !== null && typeof root.sel !== 'undefined';
  }
  function handleDigitKey(key){
    var idx = digitIndexForKey(key);
    if (idx < 0) return false;
    var screen = activeScreenId();
    var items;
    if (screen === 's-main') {
      items = visibleChildrenWithClass('sg', 'scard');
      return !!(items[idx] && clickNode(items[idx]));
    }
    if (screen === 's-subj') {
      items = visibleChildrenWithClass('tl', 'tbtn');
      return !!(items[idx] && clickNode(items[idx]));
    }
    return false;
  }
  function handleEnterKey(){
    var screen = activeScreenId();
    if (screen === 's-theory') {
      return clickNode(findActionButton('start-normal-quiz'));
    }
    if (screen === 's-result') {
      return clickNode(findActionButton('back-after-result'));
    }
    if (screen !== 's-play') return false;
    if (hasResolvedSelection()) {
      return clickNode(firstPrimaryButton('fba'));
    }
    var question = currentQuestion();
    if (isFreeInputActive() || isMultiSelectQuestion(question)) return false;
    return clickNode(firstPrimaryButton('opts'));
  }
  function handleEscapeKey(){
    var screen = activeScreenId();
    if (screen === 's-subj') return clickNode(findActionButton('go-main'));
    if (screen === 's-theory') return clickNode(findActionButton('go-subj'));
    if (screen === 's-play') return clickNode(findActionButton('end-session'));
    if (screen === 's-result') return clickNode(findActionButton('back-after-result'));
    if (screen === 's-prog' || screen === 's-info') return clickNode(findActionButton('go-main'));
    return false;
  }
  function onKeydown(event){
    var key = asText(event && event.key);
    if (!key) return;
    if (hasOpenDialog()) return;
    if (isEditableTarget(event.target)) return;
    var acted = false;
    var isDigit = digitIndexForKey(key) >= 0;
    if (isDigit) acted = handleDigitKey(key);
    else if (key === 'Enter' || key === 'NumpadEnter') acted = handleEnterKey();
    else if (key === 'Escape') acted = handleEscapeKey();
    if (!acted) return;
    if (event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
  }
  function bind(){
    if (document.addEventListener) document.addEventListener('keydown', onKeydown, true);
    if (typeof MutationObserver === 'function' && document.body) {
      observer = new MutationObserver(scheduleSync);
      try {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'style', 'aria-hidden', 'hidden']
        });
      } catch (_err) {}
    }
    scheduleSync();
  }

  bind();

  root.__wave88cKeyboardShortcuts = {
    version: 'wave88c',
    active: true,
    sync: scheduleSync,
    activeScreenId: activeScreenId,
    digitIndexForKey: digitIndexForKey,
    handleDigitKey: handleDigitKey,
    handleEnterKey: handleEnterKey,
    handleEscapeKey: handleEscapeKey,
    hasOpenDialog: hasOpenDialog
  };
})();
