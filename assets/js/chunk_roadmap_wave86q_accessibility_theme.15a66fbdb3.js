(function(){
  'use strict';

  var WAVE = 'wave86q';
  var THEME_KEY = 'trainer_theme';
  var MODES = ['system', 'light', 'dark'];
  var labels = {
    system: 'Тема: системная',
    light: 'Тема: светлая',
    dark: 'Тема: тёмная'
  };
  var icons = {
    system: '◐',
    light: '☀',
    dark: '☾'
  };
  var observerTimer = 0;

  function safeGet(key, fallback){
    try {
      var value = localStorage.getItem(key);
      return value || fallback;
    } catch (err) {
      return fallback;
    }
  }

  function safeSet(key, value){
    try { localStorage.setItem(key, value); } catch (err) {}
  }

  function normalizeMode(mode){
    mode = String(mode || 'system');
    return MODES.indexOf(mode) >= 0 ? mode : 'system';
  }

  function isSystemDark(){
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function setThemeMeta(mode){
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    var dark = mode === 'dark' || (mode === 'system' && isSystemDark());
    meta.setAttribute('content', dark ? '#141420' : '#1a1a2e');
  }

  function currentMode(){
    return normalizeMode(safeGet(THEME_KEY, 'system'));
  }

  function updateToggle(){ return false; }

  function applyTheme(mode){
    mode = normalizeMode(mode);
    if (mode === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', mode);
    setThemeMeta(mode);
    updateToggle(mode);
    try { document.dispatchEvent(new CustomEvent('trainer:themechange', {detail: {mode: mode}})); } catch (err) {}
  }

  function injectStyles(){
    if (document.getElementById('wave86q-style')) return;
    var css = '' +
      'html[data-theme=light]{color-scheme:light;--bg:#f5f3ee;--card:#fff;--text:#1a1a2e;--muted:#6b6b7e;--border:#e2e0d8;--abg:#dbeafe;--gbg:#dcfce7;--rbg:#fee2e2;--obg:#fff7ed;--pbg:#ede9fe;--ybg:#fef9c3;--tbg:#ccfbf1}' +
      'html[data-theme=light],html[data-theme=light] body{background:#f5f3ee!important;color:#1a1a2e!important}' +
      'html[data-theme=light] header{background:#1a1a2e!important}' +
      'html[data-theme=light] .card,html[data-theme=light] .extra,html[data-theme=light] .scard,html[data-theme=light] .tcard,html[data-theme=light] .qcard,html[data-theme=light] .rcard,html[data-theme=light] .icard,html[data-theme=light] .opt,html[data-theme=light] .tbtn,html[data-theme=light] .fb,html[data-theme=light] .dm,html[data-theme=light] .searchbox{background:#fff!important;color:#1a1a2e!important;border-color:#e2e0d8!important}' +
      'html[data-theme=light] input,html[data-theme=light] textarea,html[data-theme=light] select{background:#fff!important;color:#1a1a2e!important;border-color:#e2e0d8!important}' +
      'html[data-theme=dark]{color-scheme:dark;--bg:#141420;--card:#1e1e2e;--text:#e8e6e0;--muted:#9a9aae;--border:#2e2e3e;--abg:#1e2a4a;--gbg:#0e2e1a;--rbg:#2e1010;--obg:#2e2010;--pbg:#201e30;--ybg:#2e2a10;--tbg:#0e2e2a}' +
      'html[data-theme=dark],html[data-theme=dark] body{background:#141420!important;color:#e8e6e0!important}' +
      'html[data-theme=dark] header{background:#0e0e1a!important}' +
      'html[data-theme=dark] .card,html[data-theme=dark] .extra,html[data-theme=dark] .scard,html[data-theme=dark] .tcard,html[data-theme=dark] .qcard,html[data-theme=dark] .rcard,html[data-theme=dark] .icard,html[data-theme=dark] .opt,html[data-theme=dark] .tbtn,html[data-theme=dark] .fb,html[data-theme=dark] .dm,html[data-theme=dark] .searchbox{background:#1e1e2e!important;color:#e8e6e0!important;border-color:#2e2e3e!important}' +
      'html[data-theme=dark] input,html[data-theme=dark] textarea,html[data-theme=dark] select{background:#1a1a2a!important;color:#e8e6e0!important;border-color:#3a3a4e!important}' +
      'html[data-theme=dark] .w86z_s_edf39b16{--c:#818cf8!important}html[data-theme=dark] .card .cn{color:var(--c,#818cf8)!important}html[data-theme=dark] .card .ca{color:var(--muted,#9a9aae)!important}' +
      '.skip-link:focus-visible,.btn:focus-visible,.card:focus-visible,.scard:focus-visible,.tbtn:focus-visible,.opt:focus-visible,.qback:focus-visible,a:focus-visible,button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid var(--accent,#2563eb)!important;outline-offset:3px!important}' +
      '.skip-link{position:fixed;left:12px;top:12px;z-index:10001;transform:translateY(-160%);padding:10px 12px;border-radius:10px;background:var(--text,#1a1a2e);color:var(--bg,#f5f3ee);font-size:13px;font-weight:800;text-decoration:none;box-shadow:0 8px 20px rgba(0,0,0,.18)}' +
      '.skip-link:focus{transform:translateY(0)}' +
      '.wave86q-live{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}' +
      '.wave86q-index-search{margin:0 0 14px 0;background:var(--card,#fff);border:1px solid var(--border,#e2e0d8);border-radius:16px;padding:12px;box-shadow:0 1px 0 rgba(0,0,0,.02)}' +
      '.wave86q-search-label{display:block;font-size:12px;font-weight:800;color:var(--muted,#6b6b7e);margin-bottom:7px}' +
      '.wave86q-search-row{display:flex;gap:8px;align-items:center}' +
      '.wave86q-search-row input{flex:1;min-width:0;border:1.5px solid var(--border,#e2e0d8);border-radius:12px;padding:11px 12px;font:600 14px Golos Text,system-ui,sans-serif;background:var(--bg,#f5f3ee);color:var(--text,#1a1a2e)}' +
      '.wave86q-search-row button{border:none;border-radius:10px;padding:10px 12px;background:var(--text,#1a1a2e);color:var(--bg,#f5f3ee);font-weight:800;cursor:pointer}' +
      '.wave86q-search-meta{font-size:11px;line-height:1.45;color:var(--muted,#6b6b7e);margin-top:7px}' +
      '.wave86q-hidden{display:none!important}' +
      '.wave86q-result-share{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:8px 0 10px}' +
      '.wave86q-result-share button{border:1px solid var(--border,#e2e0d8);border-radius:10px;padding:10px 8px;background:var(--card,#fff);color:var(--text,#1a1a2e);font:800 12px Golos Text,system-ui,sans-serif;cursor:pointer}' +
      '@media (prefers-reduced-motion:reduce){*,::after,::before{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}';
    var style = document.createElement('style');
    style.id = 'wave86q-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function installThemeSync(){
    applyTheme(currentMode());
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var sync = function(){ if (currentMode() === 'system') setThemeMeta('system'); };
      if (mq.addEventListener) mq.addEventListener('change', sync);
      else if (mq.addListener) mq.addListener(sync);
    }
  }

  function ensureLiveRegion(){
    var live = document.getElementById('wave86q-live');
    if (live) return live;
    live = document.createElement('div');
    live.id = 'wave86q-live';
    live.className = 'wave86q-live';
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    document.body.appendChild(live);
    return live;
  }

  function announce(text){
    var live = ensureLiveRegion();
    live.textContent = '';
    window.setTimeout(function(){ live.textContent = String(text || ''); }, 20);
  }

  function ensureSkipLink(){
    if (document.getElementById('skip-link')) return;
    var link = document.createElement('a');
    link.id = 'skip-link';
    link.className = 'skip-link';
    link.href = '#main-content';
    link.textContent = 'Перейти к содержанию';
    document.body.insertBefore(link, document.body.firstChild);
    link.addEventListener('click', function(){
      window.setTimeout(function(){
        var target = document.getElementById('main-content');
        if (target && target.focus) target.focus({preventScroll: true});
      }, 0);
    });
  }

  function syncMainLandmark(){
    var active = document.querySelector('.scr.on .w') || document.querySelector('main') || document.querySelector('.w') || document.body;
    var old = document.getElementById('main-content');
    if (old && old !== active && old.tagName !== 'MAIN') {
      old.removeAttribute('id');
      old.removeAttribute('role');
      old.removeAttribute('tabindex');
    }
    if (active) {
      active.id = 'main-content';
      if (active.tagName !== 'MAIN') active.setAttribute('role', 'main');
      if (!active.hasAttribute('tabindex')) active.setAttribute('tabindex', '-1');
    }
    var header = document.querySelector('header');
    if (header && !header.hasAttribute('role')) header.setAttribute('role', 'banner');
  }

  function normalizeText(text){
    return String(text || '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/gi, ' ').replace(/\s+/g, ' ').trim();
  }

  function labelInteractive(el){
    if (!el || el.hasAttribute('aria-label')) return;
    var text = normalizeText(el.textContent).slice(0, 120);
    if (text) el.setAttribute('aria-label', text);
  }

  function syncInteractiveLabels(){
    var selectors = ['.card[href]', '.scard', '.tbtn', '.opt', '.btn', '.qback'];
    document.querySelectorAll(selectors.join(',')).forEach(labelInteractive);
    document.querySelectorAll('.opt').forEach(function(opt, idx){
      if (!opt.hasAttribute('aria-keyshortcuts')) opt.setAttribute('aria-keyshortcuts', String(idx + 1) + ' ' + 'ABCD'[idx]);
    });
    document.querySelectorAll('div[style*="position:fixed"]').forEach(function(node){
      var z = String(node.getAttribute('style') || '');
      if (z.indexOf('z-index:999') === -1) return;
      if (!node.hasAttribute('role')) node.setAttribute('role', 'dialog');
      if (!node.hasAttribute('aria-modal')) node.setAttribute('aria-modal', 'true');
    });
  }

  function installA11y(){
    ensureSkipLink();
    ensureLiveRegion();
    syncMainLandmark();
    syncInteractiveLabels();
    document.addEventListener('keydown', function(evt){
      if (evt.key !== 'Escape') return;
      var dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (dialog && dialog.remove) {
        dialog.remove();
        announce('Окно закрыто');
      }
    });
    var obs = new MutationObserver(function(){
      window.clearTimeout(observerTimer);
      observerTimer = window.setTimeout(function(){
        syncMainLandmark();
        syncInteractiveLabels();
        installResultShare();
      }, 80);
    });
    obs.observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style']});
  }

  var gradeKeywords = {
    'grade1_v2.html': '1 класс математика русский литературное чтение окружающий мир',
    'grade2_v2.html': '2 класс математика русский литературное чтение английский окружающий мир',
    'grade3_v2.html': '3 класс математика русский литературное чтение английский окружающий мир карта дроби текст',
    'grade4_v2.html': '4 класс математика русский литературное чтение английский окружающий мир орксэ',
    'grade5_v2.html': '5 класс математика русский английский история литература биология география обществознание информатика однкнр',
    'grade6_v2.html': '6 класс математика русский английский история литература биология география обществознание информатика',
    'grade7_v2.html': '7 класс алгебра геометрия физика русский английский история литература биология география информатика обществознание вероятность статистика',
    'grade8_v2.html': '8 класс алгебра геометрия физика химия биология география история русский английский информатика обществознание обж вероятность статистика',
    'grade9_v2.html': '9 класс алгебра геометрия физика химия биология география история русский английский информатика обществознание вероятность статистика обж огэ',
    'grade10_v2.html': '10 класс алгебра геометрия физика химия биология география история русский английский литература информатика обществознание обж егэ',
    'grade11_v2.html': '11 класс алгебра геометрия физика химия биология география история русский английский литература информатика обществознание обж егэ'
  };

  function installIndexSearch(){
    var grid = document.querySelector('.grid');
    if (!grid || document.getElementById('wave86q-index-search')) return false;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.card[href*="grade"]'));
    if (!cards.length) return false;
    var box = document.createElement('div');
    box.id = 'wave86q-index-search';
    box.className = 'wave86q-index-search';
    box.innerHTML = '<label class="wave86q-search-label" for="wave86q-index-search-input">Поиск класса или предмета</label>' +
      '<div class="wave86q-search-row"><input id="wave86q-index-search-input" type="search" placeholder="Например: 7, физика, английский, ОБЖ" autocomplete="off"><button type="button" id="wave86q-index-clear" aria-label="Очистить поиск">✕</button></div>' +
      '<div class="wave86q-search-meta" id="wave86q-index-search-meta">Поиск работает по номеру класса, предметам и добавленным runtime-темам.</div>';
    grid.parentNode.insertBefore(box, grid);
    var input = box.querySelector('input');
    var clear = box.querySelector('button');
    var meta = box.querySelector('#wave86q-index-search-meta');
    function apply(){
      var q = normalizeText(input.value);
      var shown = 0;
      cards.forEach(function(card){
        var href = (card.getAttribute('href') || '').split('/').pop();
        var hay = normalizeText(card.textContent + ' ' + href + ' ' + (gradeKeywords[href] || ''));
        var hit = !q || hay.indexOf(q) >= 0;
        card.classList.toggle('wave86q-hidden', !hit);
        if (hit) shown++;
      });
      meta.textContent = q ? ('Найдено: ' + shown + ' из ' + cards.length + '.') : 'Поиск работает по номеру класса, предметам и добавленным runtime-темам.';
      announce(q ? ('Найдено классов: ' + shown) : 'Поиск очищен');
    }
    input.addEventListener('input', apply);
    clear.addEventListener('click', function(){ input.value = ''; input.focus(); apply(); });
    return true;
  }

  function installSearch(){
    installIndexSearch();
    // На grade-страницах поиск по предметам/темам уже встроен в engine10 через main-search-slot/topic-search-slot.
    // Здесь оставляем только индексный поиск, чтобы не дублировать существующую логику движка.
  }


  function resultShareText(){
    var grade = window.GRADE_NUM ? (String(window.GRADE_NUM) + ' класс') : 'Тренажёр';
    var title = (document.getElementById('res-title') || {}).textContent || 'Результат тренировки';
    var score = (document.getElementById('res-score') || {}).textContent || '';
    var detail = (document.getElementById('res-detail') || {}).textContent || '';
    return [grade, title, score, detail].filter(Boolean).join(' · ');
  }

  function shareResultTo(kind){
    var url = location.href.split('#')[0];
    var text = resultShareText();
    var full = text + '\n' + url;
    if (kind === 'telegram') {
      window.open('https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text), '_blank', 'noopener');
      return;
    }
    if (kind === 'whatsapp') {
      window.open('https://wa.me/?text=' + encodeURIComponent(full), '_blank', 'noopener');
      return;
    }
    if (navigator.share) {
      navigator.share({title: 'Результат тренировки', text: text, url: url}).catch(function(){});
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(full).then(function(){ announce('Результат скопирован'); }).catch(function(){});
    }
  }

  function installResultShare(){
    var result = document.getElementById('s-result');
    if (!result || document.getElementById('wave86q-result-share')) return false;
    var anchor = document.getElementById('res-topics') || result.querySelector('.w');
    if (!anchor || !anchor.parentNode) return false;
    var box = document.createElement('div');
    box.id = 'wave86q-result-share';
    box.className = 'wave86q-result-share';
    box.setAttribute('aria-label', 'Быстро поделиться результатом');
    box.innerHTML = '<button type="button" data-wave86q-share="telegram">Telegram</button>' +
      '<button type="button" data-wave86q-share="whatsapp">WhatsApp</button>' +
      '<button type="button" data-wave86q-share="native">Поделиться</button>';
    box.addEventListener('click', function(evt){
      var btn = evt.target.closest('[data-wave86q-share]');
      if (!btn) return;
      shareResultTo(btn.getAttribute('data-wave86q-share'));
    });
    anchor.parentNode.insertBefore(box, anchor.nextSibling);
    return true;
  }

  function init(){
    injectStyles();
    installThemeSync();
    installA11y();
    installSearch();
    installResultShare();
    window.wave86qAccessibilityTheme = {
      version: WAVE,
      currentTheme: currentMode,
      applyTheme: applyTheme,
      auditSnapshot: function(){
        return {
          wave: WAVE,
          themeToggle: false,
          fabRemoved: !document.getElementById('theme-toggle'),
          skipLink: !!document.getElementById('skip-link'),
          liveRegion: !!document.getElementById('wave86q-live'),
          indexSearch: !!document.getElementById('wave86q-index-search'),
          resultShare: !!document.getElementById('wave86q-result-share'),
          mode: currentMode()
        };
      }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
