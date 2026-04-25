/* bundle_grade_runtime_breadcrumbs_wave88d */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave88dBreadcrumbs) return;

  var root = window;
  var SCREEN_IDS = ['s-main', 's-subj', 's-theory', 's-play', 's-result', 's-prog', 's-info'];
  var renderTimer = 0;
  var observer = null;

  function asText(value){
    return String(value == null ? '' : value);
  }
  function isElement(node){
    return !!(node && typeof node === 'object' && node.nodeType === 1);
  }
  function hasClass(node, className){
    return !!(isElement(node) && node.classList && node.classList.contains(className));
  }
  function getById(id){
    return document.getElementById ? document.getElementById(id) : null;
  }
  function walk(node, visitor){
    if (!isElement(node)) return;
    visitor(node);
    var children = node.children || [];
    for (var i = 0; i < children.length; i += 1) walk(children[i], visitor);
  }
  function firstChildWithClass(node, className){
    if (!isElement(node)) return null;
    var children = node.children || [];
    for (var i = 0; i < children.length; i += 1) {
      if (hasClass(children[i], className)) return children[i];
    }
    return null;
  }
  function clearChildren(node){
    if (!isElement(node)) return;
    while (node.firstChild && typeof node.removeChild === 'function') node.removeChild(node.firstChild);
    if (node.children && !node.firstChild && node.children.length && !node.removeChild) node.children = [];
  }
  function activeScreenId(){
    for (var i = 0; i < SCREEN_IDS.length; i += 1) {
      var node = getById(SCREEN_IDS[i]);
      if (hasClass(node, 'on')) return SCREEN_IDS[i];
    }
    return '';
  }
  function currentSubject(){
    try { if (typeof cS !== 'undefined' && cS) return cS; } catch (_err) {}
    return root.cS && typeof root.cS === 'object' ? root.cS : null;
  }
  function currentTopic(){
    try { if (typeof cT !== 'undefined' && cT) return cT; } catch (_err) {}
    return root.cT && typeof root.cT === 'object' ? root.cT : null;
  }
  function globalFlag(name){
    try {
      if (typeof globalThis !== 'undefined' && Object.prototype.hasOwnProperty.call(globalThis, name)) return globalThis[name];
    } catch (_err) {}
    return root[name];
  }
  function isRushMode(){ return !!globalFlag('rushMode'); }
  function isDiagMode(){ return !!globalFlag('diagMode'); }
  function isGlobalMixMode(){ return !!globalFlag('globalMix'); }
  function isMixMode(){ return !!globalFlag('mix'); }
  function hasMixFilter(){
    var value = globalFlag('mixFilter');
    return !!(value && typeof value.length === 'number' && value.length > 0);
  }
  function gradeLabel(){
    var raw = asText(root.GRADE_TITLE);
    raw = raw.replace(/^[^0-9А-Яа-яA-Za-z]+/, '').trim();
    if (!raw) raw = asText(root.GRADE_NUM).trim();
    if (!raw) return 'Класс';
    if (!/класс/i.test(raw)) raw += ' класс';
    return raw;
  }
  function sessionItems(screenId){
    var subject = currentSubject();
    var topic = currentTopic();
    var items = [];
    if (isRushMode()) {
      items.push({ label:'Молния', current:true });
      return items;
    }
    if (isDiagMode()) {
      if (subject) items.push({ label:asText(subject.nm || subject.name || 'Предмет'), route:'subj' });
      items.push({ label:'Диагностика', current:true });
      return items;
    }
    if (isGlobalMixMode()) {
      items.push({ label:hasMixFilter() ? 'Сборная' : 'Всё вперемешку', current:true });
      return items;
    }
    if (isMixMode() && subject && !topic) {
      items.push({ label:asText(subject.nm || subject.name || 'Предмет'), route:'subj' });
      items.push({ label:'Всё вперемешку', current:true });
      return items;
    }
    if (subject && topic) {
      items.push({ label:asText(subject.nm || subject.name || 'Предмет'), route:'subj' });
      items.push({ label:asText(topic.nm || topic.name || 'Тема'), current:true });
      return items;
    }
    if (subject) {
      items.push({ label:asText(subject.nm || subject.name || 'Предмет'), current:true });
      return items;
    }
    items.push({ label:screenId === 's-result' ? 'Результат' : 'Тренажёр', current:true });
    return items;
  }
  function buildItems(screenId){
    var items = [{ label:'Главная', route:'home' }];
    var grade = gradeLabel();
    if (screenId === 's-main') {
      items.push({ label:grade, current:true });
      return items;
    }
    items.push({ label:grade, route:'main' });
    if (screenId === 's-subj') {
      var subject = currentSubject();
      if (subject) items.push({ label:asText(subject.nm || subject.name || 'Предмет'), current:true });
      return items;
    }
    if (screenId === 's-theory') {
      var subj = currentSubject();
      var topic = currentTopic();
      if (subj) items.push({ label:asText(subj.nm || subj.name || 'Предмет'), route:'subj' });
      if (topic) items.push({ label:asText(topic.nm || topic.name || 'Тема'), current:true });
      return items;
    }
    if (screenId === 's-play' || screenId === 's-result') {
      return items.concat(sessionItems(screenId));
    }
    if (screenId === 's-prog') {
      items.push({ label:'Прогресс', current:true });
      return items;
    }
    if (screenId === 's-info') {
      items.push({ label:'Справка', current:true });
      return items;
    }
    return items;
  }
  function compactTrail(items){
    if (!items || !items.length) return false;
    if (items.length > 3) return true;
    for (var i = 0; i < items.length; i += 1) {
      if (asText(items[i].label).length > 18) return true;
    }
    return false;
  }
  function screenHost(screenId){
    var screen = getById(screenId);
    if (!screen) return null;
    return firstChildWithClass(screen, 'w') || screen;
  }
  function ensureNav(screenId){
    var host = screenHost(screenId);
    if (!host) return null;
    if (isElement(host.__wave88dBreadcrumbNav)) return host.__wave88dBreadcrumbNav;
    var nav = document.createElement('nav');
    nav.className = 'wave88d-breadcrumbs';
    nav.setAttribute('aria-label', 'Навигация');
    nav.setAttribute('data-wave88d-screen', screenId);
    var list = document.createElement('ol');
    list.className = 'wave88d-breadcrumb-list';
    nav.appendChild(list);
    nav.__wave88dList = list;
    if (typeof host.insertBefore === 'function') host.insertBefore(nav, host.firstChild || null);
    else if (typeof host.appendChild === 'function') host.appendChild(nav);
    host.__wave88dBreadcrumbNav = nav;
    return nav;
  }
  function makeCrumbNode(item){
    var node;
    if (item.current) {
      node = document.createElement('span');
      node.className = 'wave88d-crumb wave88d-crumb-current';
      node.setAttribute('aria-current', 'page');
    } else if (item.route === 'home') {
      node = document.createElement('a');
      node.className = 'wave88d-crumb wave88d-crumb-link';
      node.setAttribute('href', 'index.html?choose');
      node.setAttribute('data-wave88d-route', 'home');
    } else {
      node = document.createElement('button');
      node.className = 'wave88d-crumb wave88d-crumb-link';
      node.setAttribute('type', 'button');
      node.setAttribute('data-wave88d-route', asText(item.route));
    }
    node.textContent = asText(item.label);
    return node;
  }
  function renderScreen(screenId){
    var nav = ensureNav(screenId);
    if (!nav) return;
    var list = nav.__wave88dList || firstChildWithClass(nav, 'wave88d-breadcrumb-list');
    if (!list) {
      list = document.createElement('ol');
      list.className = 'wave88d-breadcrumb-list';
      nav.appendChild(list);
      nav.__wave88dList = list;
    }
    var items = buildItems(screenId);
    nav.hidden = !items.length;
    nav.setAttribute('data-compact', compactTrail(items) ? '1' : '0');
    clearChildren(list);
    for (var i = 0; i < items.length; i += 1) {
      var li = document.createElement('li');
      li.className = 'wave88d-breadcrumb-item';
      li.appendChild(makeCrumbNode(items[i]));
      list.appendChild(li);
    }
  }
  function renderAll(){
    for (var i = 0; i < SCREEN_IDS.length; i += 1) renderScreen(SCREEN_IDS[i]);
  }
  function scheduleRender(){
    if (renderTimer && typeof root.clearTimeout === 'function') root.clearTimeout(renderTimer);
    renderTimer = (typeof root.setTimeout === 'function' ? root.setTimeout : setTimeout)(function(){
      renderTimer = 0;
      renderAll();
    }, 40);
  }
  function routeNodeFromTarget(target){
    for (var node = target; node && node !== document; node = node.parentNode) {
      if (!isElement(node) || typeof node.getAttribute !== 'function') continue;
      var route = node.getAttribute('data-wave88d-route');
      if (route) return node;
    }
    return null;
  }
  function maybeLeavePlay(){
    if (activeScreenId() !== 's-play') return true;
    var ok = typeof root.confirm === 'function'
      ? root.confirm('Выйти из текущей сессии? Результат будет сохранён.')
      : true;
    if (!ok) return false;
    if (typeof root.endSession === 'function') root.endSession();
    return true;
  }
  function navigate(route){
    route = asText(route).trim();
    if (!route) return false;
    if (!maybeLeavePlay()) return false;
    if (route === 'home') {
      if (root.location && typeof root.location.assign === 'function') root.location.assign('index.html?choose');
      else if (root.location) root.location.href = 'index.html?choose';
      return true;
    }
    if (route === 'main') {
      if (typeof root.go === 'function') root.go('main');
      else return false;
      scheduleRender();
      return true;
    }
    if (route === 'subj') {
      var subject = currentSubject();
      if (subject && typeof root.openSubj === 'function') root.openSubj(subject.id);
      else if (typeof root.goSubj === 'function') root.goSubj();
      else return false;
      scheduleRender();
      return true;
    }
    return false;
  }
  function onClick(event){
    var node = routeNodeFromTarget(event && event.target);
    if (!node) return;
    if (event && event.preventDefault) event.preventDefault();
    if (event && event.stopPropagation) event.stopPropagation();
    navigate(node.getAttribute('data-wave88d-route') || '');
  }
  function wrap(name){
    var fn = root[name];
    if (typeof fn !== 'function' || fn.__wave88dWrapped) return;
    var wrapped = function(){
      var result = fn.apply(this, arguments);
      scheduleRender();
      return result;
    };
    wrapped.__wave88dWrapped = true;
    root[name] = wrapped;
  }
  function bind(){
    if (document.addEventListener) document.addEventListener('click', onClick, true);
    if (typeof MutationObserver === 'function' && document.body) {
      observer = new MutationObserver(scheduleRender);
      try {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'hidden', 'aria-hidden']
        });
      } catch (_err) {}
    }
    ['go', 'openSubj', 'goSubj', 'startQuiz', 'startDiag', 'startGlobalMix', 'startRush', 'endSession', 'wave21OpenTopic'].forEach(wrap);
    scheduleRender();
  }

  if (document.readyState === 'loading' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  root.__wave88dBreadcrumbs = {
    version: 'wave88d',
    active: true,
    buildItems: buildItems,
    renderAll: renderAll,
    scheduleRender: scheduleRender,
    navigate: navigate,
    activeScreenId: activeScreenId,
    gradeLabel: gradeLabel
  };
})();
