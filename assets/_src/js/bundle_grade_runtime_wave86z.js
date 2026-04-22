/* wave86z grade runtime bundle: concatenated post-engine runtime chunks.
 * Order is intentionally identical to the old grade-page script order.
 */

;/* ---- chunk_roadmap_wave86q_accessibility_theme.js ---- */
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

  function updateToggle(mode){
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    mode = normalizeMode(mode || currentMode());
    btn.textContent = icons[mode];
    btn.setAttribute('aria-label', labels[mode] + '. Нажмите, чтобы переключить тему.');
    btn.setAttribute('title', labels[mode]);
    btn.setAttribute('data-mode', mode);
  }

  function applyTheme(mode){
    mode = normalizeMode(mode);
    if (mode === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', mode);
    setThemeMeta(mode);
    updateToggle(mode);
    try { document.dispatchEvent(new CustomEvent('trainer:themechange', {detail: {mode: mode}})); } catch (err) {}
  }

  function nextMode(mode){
    var i = MODES.indexOf(normalizeMode(mode));
    return MODES[(i + 1) % MODES.length];
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
      '.theme-toggle{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0));z-index:10000;width:42px;height:42px;border-radius:999px;border:1.5px solid var(--border,#e2e0d8);background:var(--card,#fff);color:var(--text,#1a1a2e);box-shadow:0 8px 20px rgba(0,0,0,.16);font-size:18px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif}' +
      '.theme-toggle:focus-visible,.skip-link:focus-visible,.btn:focus-visible,.card:focus-visible,.scard:focus-visible,.tbtn:focus-visible,.opt:focus-visible,.qback:focus-visible,a:focus-visible,button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid var(--accent,#2563eb)!important;outline-offset:3px!important}' +
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

  function installThemeToggle(){
    applyTheme(currentMode());
    if (!document.body || document.getElementById('theme-toggle')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'theme-toggle';
    btn.className = 'theme-toggle';
    btn.addEventListener('click', function(){
      var mode = nextMode(currentMode());
      safeSet(THEME_KEY, mode);
      applyTheme(mode);
      announce(labels[mode]);
    });
    document.body.appendChild(btn);
    updateToggle(currentMode());
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
    installThemeToggle();
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
          themeToggle: !!document.getElementById('theme-toggle'),
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

;/* ---- bundle_grade_after.js ---- */
/* --- wave17_english_infra.js --- */
(function(){
  if (typeof window === 'undefined') return;
  var gradeNum = +(window.GRADE_NUM || 0);
  if (gradeNum < 2 || gradeNum > 11) return;
  if (typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;

  var TARGETS = {2:2,3:2,4:2,5:4,6:4,7:6,8:8,9:8,10:12,11:12};
  var STAGES = [
    {id:'starter', label:'Starter', title:'Старт', hint:'Первые слова и уверенность в базовых фразах.'},
    {id:'A1', label:'A1', title:'A1', hint:'Буквы, простые слова, короткие фразы и very basic grammar.'},
    {id:'A2', label:'A2', title:'A2', hint:'Школьная база: to be, Present/Past Simple, модальные, повседневная лексика.'},
    {id:'B1', label:'B1', title:'B1', hint:'Уверенная школьная грамматика: времена, passive, conditionals 0–2, word formation.'},
    {id:'B2', label:'B2', title:'B2', hint:'Сложные структуры, эссе, phrasal verbs, exam-style grammar.'},
    {id:'C1', label:'C1', title:'C1', hint:'Продвинутый школьный английский и уверенная ЕГЭ-грамматика.'}
  ];
  var LEVEL_COLORS = {starter:'#64748b', A1:'#16a34a', A2:'#0d9488', B1:'#2563eb', B2:'#7c3aed', C1:'#be185d'};

  function safeJSON(key){
    try{ return JSON.parse(localStorage.getItem(key) || '{}'); }catch(_){ return {}; }
  }
  function pct(ok, total){ return total ? Math.round(ok / total * 100) : 0; }

  function summarizeGrade(g){
    var raw = safeJSON('trainer_progress_' + g);
    var eng = raw && raw.eng ? raw.eng : {};
    var topicIds = Object.keys(eng || {});
    var active = 0, mastered = 0, ok = 0, total = 0;
    topicIds.forEach(function(topicId){
      var stat = eng[topicId] || {};
      var good = +(stat.ok || 0);
      var bad = +(stat.err || 0);
      var sum = good + bad;
      ok += good;
      total += sum;
      if(sum > 0) active += 1;
      if(sum >= 4 && good / sum >= 0.75) mastered += 1;
    });
    return {
      grade: g,
      target: TARGETS[g] || 0,
      active: active,
      mastered: mastered,
      ok: ok,
      total: total,
      pct: pct(ok, total)
    };
  }

  function bandSnapshot(summary, grades){
    var rows = grades.map(function(g){ return summary[g]; });
    var active = rows.reduce(function(s, row){ return s + row.active; }, 0);
    var mastered = rows.reduce(function(s, row){ return s + row.mastered; }, 0);
    var ok = rows.reduce(function(s, row){ return s + row.ok; }, 0);
    var total = rows.reduce(function(s, row){ return s + row.total; }, 0);
    var target = rows.reduce(function(s, row){ return s + row.target; }, 0);
    return { grades: grades, active: active, mastered: mastered, ok: ok, total: total, pct: pct(ok, total), target: target };
  }

  function computeEnglishLevel(){
    var summary = {};
    for(var g = 2; g <= 11; g++) summary[g] = summarizeGrade(g);

    var a1 = bandSnapshot(summary, [2,3,4]);
    var a2 = bandSnapshot(summary, [5,6,7]);
    var b1 = bandSnapshot(summary, [8,9]);
    var b2 = bandSnapshot(summary, [10]);
    var c1 = bandSnapshot(summary, [11]);
    var allRows = Object.keys(summary).map(function(k){ return summary[k]; });
    var activeTopics = allRows.reduce(function(s, row){ return s + row.active; }, 0);
    var masteredTopics = allRows.reduce(function(s, row){ return s + row.mastered; }, 0);
    var totalOk = allRows.reduce(function(s, row){ return s + row.ok; }, 0);
    var totalAttempts = allRows.reduce(function(s, row){ return s + row.total; }, 0);
    var current = STAGES[0];
    var next = STAGES[1];

    if (a1.active >= 2 || a1.mastered >= 1 || a1.total >= 8) { current = STAGES[1]; next = STAGES[2]; }
    if (a2.mastered >= 4 || (a2.active >= 6 && a2.pct >= 70)) { current = STAGES[2]; next = STAGES[3]; }
    if (b1.mastered >= 5 || (b1.active >= 8 && b1.pct >= 70)) { current = STAGES[3]; next = STAGES[4]; }
    if (b2.mastered >= 4 || (b2.active >= 5 && b2.pct >= 72)) { current = STAGES[4]; next = STAGES[5]; }
    if (c1.mastered >= 7 || (c1.active >= 8 && c1.pct >= 72)) { current = STAGES[5]; next = null; }

    var progressPct = 0;
    if (current.id === 'starter') progressPct = Math.min(100, Math.round(((a1.active + a1.mastered) / Math.max(a1.target || 1, 1)) * 35));
    else if (current.id === 'A1') progressPct = Math.min(100, Math.round(((a2.mastered || a2.active * 0.6) / Math.max(a2.target || 1, 1)) * 100));
    else if (current.id === 'A2') progressPct = Math.min(100, Math.round(((b1.mastered || b1.active * 0.6) / Math.max(b1.target || 1, 1)) * 100));
    else if (current.id === 'B1') progressPct = Math.min(100, Math.round(((b2.mastered || b2.active * 0.6) / Math.max(b2.target || 1, 1)) * 100));
    else if (current.id === 'B2') progressPct = Math.min(100, Math.round(((c1.mastered || c1.active * 0.6) / Math.max(c1.target || 1, 1)) * 100));
    else progressPct = 100;

    return {
      level: current.label,
      title: current.title,
      hint: current.hint,
      nextLevel: next ? next.label : 'max',
      nextHint: next ? next.hint : 'Верхняя цель текущей English vertical уже достигнута.',
      progressPct: progressPct,
      color: LEVEL_COLORS[current.label] || LEVEL_COLORS.starter,
      activeTopics: activeTopics,
      masteredTopics: masteredTopics,
      totalAttempts: totalAttempts,
      totalOk: totalOk,
      accuracy: pct(totalOk, totalAttempts),
      bands: {a1:a1, a2:a2, b1:b1, b2:b2, c1:c1},
      grades: summary
    };
  }

  window.getEnglishLevelSummary = computeEnglishLevel;

  window.ENG_SHARED_GUIDES = window.ENG_SHARED_GUIDES || {
    irregulars: {
      title: 'Неправильные глаголы · top 100',
      icon: '📚',
      html: '<div lang="en"><h3>Top irregular verbs</h3><div class="fm">be — was/were — been · go — went — gone · see — saw — seen · do — did — done · have — had — had</div><p><b>Группы для запоминания:</b></p><ul><li>Одинаковые формы: cut — cut — cut, put — put — put, let — let — let.</li><li>2-я и 3-я формы одинаковы: build — built — built, find — found — found, send — sent — sent.</li><li>Все формы разные: go — went — gone, see — saw — seen, take — took — taken.</li></ul><div class="ex">be — was/were — been · become — became — become · begin — began — begun · break — broke — broken · bring — brought — brought · buy — bought — bought · choose — chose — chosen · come — came — come · drink — drank — drunk · eat — ate — eaten · fall — fell — fallen · feel — felt — felt · forget — forgot — forgotten · get — got — got/gotten · give — gave — given · know — knew — known · make — made — made · read — read — read · speak — spoke — spoken · write — wrote — written</div><p>Мини-алгоритм: <b>learn → check → use</b>. Сначала выучи 10, потом сразу применяй их в предложениях.</p></div>'
    },
    wordform: {
      title: 'Словообразование',
      icon: '🧩',
      html: '<div lang="en"><h3>Word formation</h3><div class="fm">happy → happiness / unhappy · create → creative / creation · decide → decision / decisive</div><p><b>Частые суффиксы:</b></p><ul><li><b>-tion / -sion</b>: decide → decision, collect → collection</li><li><b>-ment</b>: develop → development</li><li><b>-ness</b>: kind → kindness</li><li><b>-ful / -less</b>: useful / useless</li><li><b>-able / -ible</b>: comfortable, possible</li><li><b>-ive / -ous / -al</b>: active, dangerous, natural</li><li><b>-ly</b>: quick → quickly</li></ul><p><b>Частые приставки:</b> un-, in-, im-, ir-, dis-, mis-, re-.</p><div class="ex">SCIENCE → scientific / scientist · EMPLOY → employee / employer / employment · POSSIBLE → impossible / possibility</div></div>'
    },
    phrasal: {
      title: 'Фразовые глаголы',
      icon: '🔗',
      html: '<div lang="en"><h3>Phrasal verbs · essential pack</h3><div class="fm">give up = stop · look after = take care of · put off = postpone · get over = recover</div><ul><li><b>look after</b> = заботиться о</li><li><b>look for</b> = искать</li><li><b>look forward to</b> = ждать с нетерпением</li><li><b>give up</b> = бросать</li><li><b>give away</b> = отдавать</li><li><b>pick up</b> = подобрать / заехать / освоить</li><li><b>put off</b> = откладывать</li><li><b>take off</b> = взлетать / снимать</li><li><b>turn on/off</b> = включать / выключать</li><li><b>work out</b> = понять / решить / тренироваться</li></ul><div class="ex">I can\'t <b>put off</b> this task any longer. · She <b>looks after</b> her little brother. · We are <b>looking forward to</b> the trip.</div></div>'
    },
    articles: {
      title: 'Артикли: decision tree',
      icon: '🌀',
      html: '<div lang="en"><h3>Articles</h3><div class="fm">a/an = one of many · the = specific / already known · ∅ = no article</div><p><b>1. Это впервые упоминается и предмет один из многих?</b> → <b>a/an</b></p><p><b>2. Говорим о конкретном, уже известном или единственном?</b> → <b>the</b></p><p><b>3. Говорим в общем, с неисчисляемыми или устойчивыми выражениями?</b> → <b>∅</b></p><ul><li><b>a book</b>, <b>an apple</b></li><li><b>the sun</b>, <b>the book on the table</b>, <b>the Volga</b></li><li><b>at school</b>, <b>go home</b>, <b>by bus</b>, <b>love</b>, <b>information</b></li></ul><div class="ex">I bought <b>a</b> book. <b>The</b> book is on the desk. · She goes to <b>school</b> by <b>bus</b>.</div></div>'
    }
  };

  function ensureStyles(){
    if (document.getElementById('eng-infra-styles')) return;
    var style = document.createElement('style');
    style.id = 'eng-infra-styles';
    style.textContent = '\n.eng-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:800;background:rgba(37,99,235,.12);color:var(--accent);margin-left:6px;white-space:nowrap}\n.eng-panel{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:12px 14px;margin:10px 0}\n.eng-panel h4{margin:0 0 8px;font-size:13px;font-weight:800;font-family:Unbounded,system-ui,sans-serif}\n.eng-panel p{margin:0;font-size:12px;line-height:1.55;color:var(--muted)}\n.eng-mini-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}\n.eng-mini{background:var(--abg);border-radius:10px;padding:8px 10px}\n.eng-mini .v{font-size:16px;font-weight:900}\n.eng-mini .l{font-size:10px;color:var(--muted);margin-top:3px}\n.eng-tools{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 12px}\n.eng-tool-btn{border:none;border-radius:10px;padding:8px 10px;background:var(--abg);color:var(--text);font-size:12px;font-weight:700;cursor:pointer;font-family:Golos Text,sans-serif}\n.eng-tool-btn.level{background:rgba(37,99,235,.10);color:var(--accent)}\n.eng-breakdown{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}\n.eng-breakdown .cell{background:var(--abg);border-radius:10px;padding:8px 10px}\n.eng-breakdown .cell b{display:block;font-size:13px;margin-bottom:4px}\n';
    document.head.appendChild(style);
  }

  function overlayFrame(title, bodyHtml){
    ensureStyles();
    var mask = document.createElement('div');
    mask.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto';
    mask.onclick = function(){ mask.remove(); };
    var card = document.createElement('div');
    card.style.cssText = 'background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:18px;padding:22px 18px;max-width:560px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 12px 30px rgba(0,0,0,.25)';
    card.onclick = function(ev){ ev.stopPropagation(); };
    card.innerHTML = '<h3 style="font-family:Unbounded,system-ui,sans-serif;font-size:16px;font-weight:800;margin-bottom:12px;text-align:center">'+ title +'</h3>' + bodyHtml + '<button class="btn btn-d" style="width:100%;margin-top:14px" onclick="this.closest(\'div[style*=fixed]\').remove()">Закрыть</button>';
    mask.appendChild(card);
    document.body.appendChild(mask);
    return mask;
  }

  window.showEnglishGuide = function(id){
    ensureStyles();
    var guide = window.ENG_SHARED_GUIDES && window.ENG_SHARED_GUIDES[id];
    if (!guide) return;
    overlayFrame(guide.icon + ' ' + guide.title, guide.html);
  };

  window.showEnglishLevelModal = function(){
    var s = computeEnglishLevel();
    var rows = [
      ['A1 · 2–4 классы', s.bands.a1],
      ['A2 · 5–7 классы', s.bands.a2],
      ['B1 · 8–9 классы', s.bands.b1],
      ['B2 · 10 класс', s.bands.b2],
      ['C1 · 11 класс', s.bands.c1]
    ];
    var body = '<div class="eng-panel"><h4>English level: <span style="color:'+ s.color +'">'+ s.level +'</span></h4><p>'+ s.hint +'</p><div class="eng-mini-grid"><div class="eng-mini"><div class="v">'+ s.masteredTopics +'</div><div class="l">мастер-тем</div></div><div class="eng-mini"><div class="v">'+ s.accuracy +'%</div><div class="l">точность по English</div></div><div class="eng-mini"><div class="v">'+ s.activeTopics +'</div><div class="l">тем с активностью</div></div><div class="eng-mini"><div class="v">'+ s.progressPct +'%</div><div class="l">до следующего уровня</div></div></div></div>';
    body += '<div class="eng-breakdown">' + rows.map(function(pair){ var row = pair[1]; return '<div class="cell"><b>'+ pair[0] +'</b><div style="font-size:12px">'+ row.mastered +' mastered · '+ row.active +' active</div><div style="font-size:11px;color:var(--muted);margin-top:4px">'+ row.pct +'% точность · цель '+ row.target +' тем</div></div>'; }).join('') + '</div>';
    body += '<div class="eng-panel"><h4>Как это считается</h4><p>Уровень растёт не по одному случайному попаданию, а по сумме English-тем в разных классах. Тема считается «mastered», когда в ней уже есть серия решённых задач и точность не ниже 75%.</p></div>';
    overlayFrame('🇬🇧 English level', body);
  };

  function appendBadgeChip(){
    ensureStyles();
    var host = document.querySelector('#player-badge button');
    if (!host) return;
    var old = host.querySelector('[data-eng-chip]');
    if (old) old.remove();
    var s = computeEnglishLevel();
    var chip = document.createElement('span');
    chip.className = 'eng-chip';
    chip.setAttribute('data-eng-chip', '1');
    chip.textContent = '🇬🇧 ' + s.level;
    chip.title = 'English level: ' + s.level + ' · ' + s.hint;
    host.appendChild(chip);
  }

  function injectProgressCard(){
    ensureStyles();
    var root = document.getElementById('prog-content');
    if (!root) return;
    var old = root.querySelector('[data-eng-progress-card]');
    if (old) old.remove();
    var s = computeEnglishLevel();
    var card = document.createElement('div');
    card.className = 'rcard';
    card.setAttribute('data-eng-progress-card', '1');
    card.innerHTML = '<h3 style="display:flex;align-items:center;gap:8px"><span style="font-size:20px">🇬🇧</span> English level <span style="margin-left:auto;color:'+ s.color +';font-weight:900">'+ s.level +'</span></h3>' +
      '<div class="ptrack" style="margin-top:10px"><div class="pfill" style="width:'+ s.progressPct +'% ;background:'+ s.color +'"></div></div>' +
      '<div style="display:flex;justify-content:space-between;gap:10px;margin-top:8px;font-size:12px;color:var(--muted)"><span>'+ s.masteredTopics +' mastered тем</span><span>'+ s.accuracy +'% точность</span></div>' +
      '<div style="margin-top:8px;font-size:12px;color:var(--text);line-height:1.55">'+ s.hint + (s.nextLevel !== 'max' ? ' Следующий ориентир — <b>'+ s.nextLevel +'</b>.' : ' Верхняя цель текущей English vertical уже закрыта.') + '</div>' +
      '<button class="btn btn-o" style="width:100%;margin-top:10px" onclick="showEnglishLevelModal()">Подробнее по уровням</button>';
    root.prepend(card);
  }

  function patchHallOfFameModal(){
    ensureStyles();
    var overlays = Array.prototype.slice.call(document.body.children).filter(function(node){ return node && node.style && node.style.position === 'fixed'; });
    var overlay = overlays[overlays.length - 1];
    if (!overlay || !overlay.firstElementChild) return;
    var card = overlay.firstElementChild;
    if (card.querySelector('[data-eng-profile-block]')) return;
    var s = computeEnglishLevel();
    var block = document.createElement('div');
    block.setAttribute('data-eng-profile-block', '1');
    block.style.cssText = 'margin:12px 0 16px;background:rgba(255,255,255,.08);border-radius:12px;padding:12px';
    block.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:18px">🇬🇧</span><span style="font-size:13px;font-weight:800">English level</span><span style="margin-left:auto;font-size:15px;font-weight:900;color:'+ s.color +'">'+ s.level +'</span></div>' +
      '<div style="font-size:11px;color:#cbd5e1;line-height:1.55">'+ s.hint +'</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px"><div style="background:rgba(255,255,255,.08);border-radius:10px;padding:8px 6px;text-align:center"><div style="font-size:15px;font-weight:900">'+ s.masteredTopics +'</div><div style="font-size:10px;color:#cbd5e1">mastered тем</div></div><div style="background:rgba(255,255,255,.08);border-radius:10px;padding:8px 6px;text-align:center"><div style="font-size:15px;font-weight:900">'+ s.accuracy +'%</div><div style="font-size:10px;color:#cbd5e1">точность</div></div></div>' +
      '<button style="margin-top:10px;width:100%;padding:9px 10px;border:none;border-radius:10px;background:rgba(37,99,235,.18);color:#dbeafe;font-weight:800;cursor:pointer;font-size:12px" onclick="showEnglishLevelModal()">Развернуть English level</button>';
    var statsGrid = card.querySelector('div[style*="display:grid;grid-template-columns:1fr 1fr"]');
    if (statsGrid && statsGrid.parentNode) statsGrid.parentNode.insertBefore(block, statsGrid.nextSibling); else card.appendChild(block);
  }

  function renderGuideButtons(){
    ensureStyles();
    if (typeof cS === 'undefined' || !cS || cS.id !== 'eng') {
      var stale = document.getElementById('eng-extra-tools');
      if (stale) stale.remove();
      return;
    }
    var anchor = document.getElementById('topic-search-slot');
    var list = document.getElementById('tl');
    if (!anchor || !list) return;
    var old = document.getElementById('eng-extra-tools');
    if (old) old.remove();
    var s = computeEnglishLevel();
    var wrap = document.createElement('div');
    wrap.id = 'eng-extra-tools';
    wrap.className = 'eng-panel';
    var buttons = '<div class="eng-tools"><button class="eng-tool-btn level" type="button" onclick="showEnglishLevelModal()">🇬🇧 English level: '+ s.level +'</button>';
    if (gradeNum >= 5) {
      buttons += '<button class="eng-tool-btn" type="button" onclick="showEnglishGuide(\'irregulars\')">📚 Неправильные</button>';
      buttons += '<button class="eng-tool-btn" type="button" onclick="showEnglishGuide(\'wordform\')">🧩 Словообразование</button>';
      buttons += '<button class="eng-tool-btn" type="button" onclick="showEnglishGuide(\'phrasal\')">🔗 Фразовые</button>';
      buttons += '<button class="eng-tool-btn" type="button" onclick="showEnglishGuide(\'articles\')">🌀 Артикли</button>';
    }
    buttons += '</div>';
    wrap.innerHTML = '<h4>English infrastructure</h4><p>'+ s.hint +'</p>' + buttons + '<div style="font-size:11px;color:var(--muted)">Общие шпаргалки помогают держать сквозную English vertical от A1 до C1, а не учить каждый класс отдельно как изолированный остров.</div>';
    list.parentNode.insertBefore(wrap, list);
  }

  var _origRenderPlayerBadge = typeof window.renderPlayerBadge === 'function' ? window.renderPlayerBadge : null;
  if (_origRenderPlayerBadge) {
    window.renderPlayerBadge = function(){
      var r = _origRenderPlayerBadge.apply(this, arguments);
      appendBadgeChip();
      return r;
    };
  }

  var _origRenderProg = typeof window.renderProg === 'function' ? window.renderProg : null;
  if (_origRenderProg) {
    window.renderProg = function(){
      var r = _origRenderProg.apply(this, arguments);
      injectProgressCard();
      return r;
    };
  }

  var _origOpenSubj = typeof window.openSubj === 'function' ? window.openSubj : null;
  if (_origOpenSubj) {
    window.openSubj = function(){
      var r = _origOpenSubj.apply(this, arguments);
      renderGuideButtons();
      return r;
    };
  }

  var _origShowHallOfFame = typeof window.showHallOfFame === 'function' ? window.showHallOfFame : null;
  if (_origShowHallOfFame) {
    window.showHallOfFame = function(){
      var r = _origShowHallOfFame.apply(this, arguments);
      patchHallOfFameModal();
      return r;
    };
  }

  setTimeout(function(){
    try { appendBadgeChip(); } catch(_) {}
    try { renderGuideButtons(); } catch(_) {}
  }, 0);

  window.__wave17EnglishInfra = {
    grade: gradeNum,
    sharedGuides: Object.keys(window.ENG_SHARED_GUIDES || {}),
    level: computeEnglishLevel()
  };
})();

;
/* --- wave9_ui.js --- */
(function(){
  const THEME_KEY = 'trainer_theme';
  const TOAST_HOST_ID = 'trainer-toast-host';
  const OFFLINE_ID = 'trainer-offline-pill';
  const THEME_BTN_ID = 'trainer-theme-btn';
  const STYLE_ID = 'wave9-ui-style';
  const THEME_META_COLOR = { light: '#1a1a2e', dark: '#0e0e1a' };

  function getStorage(){
    try { return window.localStorage; } catch (_) { return null; }
  }

  function getThemePref(){
    try {
      const v = (getStorage() && getStorage().getItem(THEME_KEY)) || 'system';
      return ['light','dark','system'].includes(v) ? v : 'system';
    } catch (_) {
      return 'system';
    }
  }

  function effectiveTheme(pref){
    if(pref === 'light' || pref === 'dark') return pref;
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (_) {
      return 'light';
    }
  }

  function ensureStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
html[data-theme="dark"]{color-scheme:dark;--bg:#141420;--card:#1e1e2e;--text:#e8e6e0;--ink:#e8e6e0;--muted:#9a9aae;--border:#2e2e3e;--abg:#1e2a4a;--gbg:#0e2e1a;--rbg:#2e1010;--obg:#2e2010;--pbg:#201e30;--ybg:#2e2a10;--tbg:#0e2e2a}
html[data-theme="light"]{color-scheme:light}
html[data-theme="dark"],html[data-theme="dark"] body{background:#141420!important;color:#e8e6e0!important}
html[data-theme="light"],html[data-theme="light"] body{background:#f5f3ee!important;color:#1a1a2e!important}
html[data-theme="dark"] header,html[data-theme="dark"] .header,html[data-theme="dark"] footer{background:#0e0e1a!important;color:#e8e6e0!important}
html[data-theme="dark"] .card,html[data-theme="dark"] .stat,html[data-theme="dark"] .scard,html[data-theme="dark"] .tcard,html[data-theme="dark"] .qcard,html[data-theme="dark"] .rcard,html[data-theme="dark"] .icard,html[data-theme="dark"] .opt,html[data-theme="dark"] .tbtn,html[data-theme="dark"] .fb,html[data-theme="dark"] .dm,html[data-theme="dark"] .searchfield{background:var(--card)!important;color:var(--text)!important;border-color:var(--border)!important}
html[data-theme="dark"] .sub,html[data-theme="dark"] .cs,html[data-theme="dark"] .ct,html[data-theme="dark"] .cl,html[data-theme="dark"] .dt,html[data-theme="dark"] .stat-l,html[data-theme="dark"] .foot-text,html[data-theme="dark"] .searchmeta{color:var(--muted)!important}
html[data-theme="dark"] .live-pill,html[data-theme="dark"] .tg{background:#e8e6e0!important;color:#141420!important}
html[data-theme="dark"] .opt .k{background:#2a2a3a!important;color:#c7c7d5!important}
html[data-theme="dark"] .ptrack,html[data-theme="dark"] .pgbar,html[data-theme="dark"] .dm-bar{background:#2a2a3a!important}
html[data-theme="dark"] .qcode,html[data-theme="dark"] .tcard .fm{background:#1a1a2a!important;border-color:#2e2e3e!important;color:#d8d6cf!important}
html[data-theme="dark"] .tcard li,html[data-theme="dark"] .tcard p,html[data-theme="dark"] [style*="color:#374151"]{color:#cbd5e1!important}
html[data-theme="dark"] [style*="color:#1a1a2e"]{color:var(--text)!important}
html[data-theme="dark"] [style*="color:#6b6b7e"],html[data-theme="dark"] [style*="color:#6b6a74"]{color:var(--muted)!important}
html[data-theme="dark"] [style*="background:#fff"],html[data-theme="dark"] [style*="background: #fff"]{background:var(--card)!important}
html[data-theme="dark"] [style*="background:#f5f3ee"],html[data-theme="dark"] [style*="background: #f5f3ee"]{background:var(--bg)!important}
html[data-theme="dark"] [style*="border:#ddd"],html[data-theme="dark"] [style*="border:1px solid #ddd"],html[data-theme="dark"] [style*="border-color:#ddd"]{border-color:var(--border)!important}
html[data-theme="dark"] input,html[data-theme="dark"] textarea,html[data-theme="dark"] select{background:#1a1a2a!important;color:#e8e6e0!important;border-color:#3a3a4e!important}
#${THEME_BTN_ID}{position:fixed;top:calc(12px + env(safe-area-inset-top,0));right:12px;z-index:12000;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:44px;min-height:44px;padding:0 12px;border:none;border-radius:999px;background:rgba(255,255,255,.92);color:#1a1a2e;box-shadow:0 10px 24px rgba(0,0,0,.18);font:700 12px/1 'Golos Text',system-ui,sans-serif;cursor:pointer;backdrop-filter:blur(10px)}
html[data-theme="dark"] #${THEME_BTN_ID}{background:rgba(30,30,46,.94);color:#e8e6e0;border:1px solid rgba(255,255,255,.08)}
#${OFFLINE_ID}{position:fixed;top:calc(62px + env(safe-area-inset-top,0));left:50%;transform:translateX(-50%);z-index:11950;padding:8px 12px;border-radius:999px;background:#1a1a2e;color:#fff;font:700 12px/1 'Golos Text',system-ui,sans-serif;box-shadow:0 10px 24px rgba(0,0,0,.18);display:none}
#${OFFLINE_ID}.show{display:inline-flex;align-items:center;gap:7px}
#${OFFLINE_ID} .dot{width:8px;height:8px;border-radius:50%;background:#f59e0b;display:inline-block}
#${TOAST_HOST_ID}{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0));transform:translateX(-50%);z-index:13000;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;max-width:min(92vw,420px)}
.${TOAST_HOST_ID}-item{pointer-events:auto;display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:14px;background:rgba(26,26,46,.96);color:#fff;box-shadow:0 14px 28px rgba(0,0,0,.22);font:700 13px/1.35 'Golos Text',system-ui,sans-serif;animation:toastIn .18s ease both;max-width:100%}
.${TOAST_HOST_ID}-item.info{background:rgba(37,99,235,.95)}
.${TOAST_HOST_ID}-item.success{background:rgba(22,163,74,.96)}
.${TOAST_HOST_ID}-item.warn{background:rgba(234,88,12,.96)}
.${TOAST_HOST_ID}-item.error{background:rgba(220,38,38,.96)}
.${TOAST_HOST_ID}-item.fadeout{animation:toastOut .18s ease both}
.${TOAST_HOST_ID}-icon{font-size:14px;line-height:1}
@keyframes toastIn{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes toastOut{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(10px) scale(.98)}}
@media (max-width:520px){#${THEME_BTN_ID}{min-width:40px;min-height:40px;padding:0 10px;font-size:11px}#${OFFLINE_ID}{top:calc(56px + env(safe-area-inset-top,0));font-size:11px}}
`;
    const head = document.head || document.body || document.documentElement;
    if(head && head.appendChild) head.appendChild(style);
  }

  function ensureToastHost(){
    let host = document.getElementById(TOAST_HOST_ID);
    if(host) return host;
    host = document.createElement('div');
    host.id = TOAST_HOST_ID;
    (document.body || document.documentElement).appendChild(host);
    return host;
  }

  function iconFor(type){
    return type === 'success' ? '✅' : type === 'warn' ? '⚠️' : type === 'error' ? '⛔' : 'ℹ️';
  }

  function showToast(message, type, ms){
    if(!message) return;
    ensureStyles();
    const host = ensureToastHost();
    const item = document.createElement('div');
    item.className = `${TOAST_HOST_ID}-item ${type || 'info'}`;
    item.innerHTML = `<span class="${TOAST_HOST_ID}-icon">${iconFor(type)}</span><span>${String(message).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</span>`;
    host.appendChild(item);
    const ttl = typeof ms === 'number' ? ms : 2200;
    const tid = setTimeout(() => {
      item.classList.add('fadeout');
      setTimeout(() => item.remove(), 180);
    }, ttl);
    item.addEventListener('click', () => {
      clearTimeout(tid);
      item.remove();
    });
  }
  window.showToast = showToast;

  function runtimeErrorStore(){
    if(!window.__trainerRuntimeErrors) window.__trainerRuntimeErrors = [];
    return window.__trainerRuntimeErrors;
  }

  function normalizeRuntimeMessage(value){
    if(value == null) return '';
    if(typeof value === 'string') return value;
    if(value && typeof value.message === 'string') return value.message;
    try { return JSON.stringify(value); } catch (_) { return String(value); }
  }

  function recordRuntimeError(kind, payload){
    const store = runtimeErrorStore();
    const entry = {
      kind: kind || 'error',
      message: normalizeRuntimeMessage(payload && payload.message ? payload.message : payload),
      detail: payload || null,
      page: (window.location && (window.location.pathname || window.location.href)) || '',
      at: Date.now()
    };
    store.push(entry);
    if(store.length > 50) store.splice(0, store.length - 50);
    return entry;
  }

  function bindRuntimeErrorCapture(){
    if(window.__trainerRuntimeCaptureBound) return;
    window.__trainerRuntimeCaptureBound = true;
    window.addEventListener('error', function(event){
      recordRuntimeError('error', {
        message: (event && event.message) || (event && event.error && event.error.message) || '',
        filename: event && event.filename || '',
        lineno: event && event.lineno || 0,
        colno: event && event.colno || 0
      });
    }, true);
    window.addEventListener('unhandledrejection', function(event){
      recordRuntimeError('unhandledrejection', {
        message: normalizeRuntimeMessage(event && event.reason),
        reason: normalizeRuntimeMessage(event && event.reason)
      });
    }, true);
  }

  function syncThemeButton(){
    const btn = document.getElementById(THEME_BTN_ID);
    if(!btn) return;
    const pref = getThemePref();
    const text = pref === 'light' ? '☀️' : pref === 'dark' ? '🌙' : '🖥️';
    const label = pref === 'light' ? 'Светлая' : pref === 'dark' ? 'Тёмная' : 'Системная';
    btn.textContent = text;
    btn.setAttribute('aria-label', `Тема: ${label}. Нажми, чтобы переключить.`);
    btn.title = `Тема: ${label}`;
  }

  function applyTheme(pref, silent){
    ensureStyles();
    const value = pref || getThemePref();
    const root = document.documentElement || {};
    if(value === 'system') {
      if(root.removeAttribute) root.removeAttribute('data-theme');
      else if(root.setAttribute) root.setAttribute('data-theme', '');
    } else if(root.setAttribute) {
      root.setAttribute('data-theme', value);
    } else {
      root['data-theme'] = value;
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    const eff = effectiveTheme(value);
    if(meta) meta.setAttribute('content', THEME_META_COLOR[eff]);
    const cmeta = document.querySelector('meta[name="color-scheme"]');
    if(cmeta) cmeta.setAttribute('content', 'light dark');
    syncThemeButton();
    if(!silent) showToast(`Тема: ${value === 'system' ? 'как в системе' : value === 'dark' ? 'тёмная' : 'светлая'}`, 'info', 1600);
  }

  function setThemePref(next, silent){
    try {
      const storage = getStorage();
      storage && storage.setItem(THEME_KEY, next);
    } catch (_) {}
    applyTheme(next, silent);
  }

  function cycleTheme(){
    const order = ['system','light','dark'];
    const current = getThemePref();
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];
    setThemePref(next, false);
  }

  function mountThemeButton(){
    const btn = document.getElementById(THEME_BTN_ID);
    if(btn && btn.remove) btn.remove();
  }

  function updateOfflinePill(show){
    let pill = document.getElementById(OFFLINE_ID);
    if(!pill){
      pill = document.createElement('div');
      pill.id = OFFLINE_ID;
      pill.innerHTML = '<span class="dot"></span><span>Работаете офлайн</span>';
      (document.body || document.documentElement).appendChild(pill);
    }
    if(pill.classList && pill.classList.toggle) pill.classList.toggle('show', !!show);
    else pill.className = show ? 'show' : '';
  }

  function syncConnectivity(silent){
    const online = typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
    updateOfflinePill(!online);
    if(!silent) showToast(online ? 'Соединение восстановлено' : 'Работаете офлайн', online ? 'success' : 'warn', 1800);
  }

  function patchAlert(){
    if(window.__wave9AlertPatched) return;
    window.__wave9AlertPatched = true;
    const nativeAlert = typeof window.alert === 'function' ? window.alert.bind(window) : function(){};
    window.__nativeAlert = nativeAlert;
    let lastToastKey = '';
    let lastToastAt = 0;
    window.alert = function(msg){
      const text = String(msg == null ? '' : msg).trim();
      if(!window.__trainerUserAlerts) window.__trainerUserAlerts = [];
      window.__trainerUserAlerts.push({ message:text, at:Date.now(), page:(window.location && (window.location.pathname || window.location.href)) || '' });
      if(window.__trainerUserAlerts.length > 50) window.__trainerUserAlerts.splice(0, window.__trainerUserAlerts.length - 50);
      if(text && text.length <= 120 && !/[\n\r]/.test(text)){
        const genericRetry = /что-?то пошло не так|попробуй ещё раз/i.test(text);
        const kind = /оффлайн|вниман/i.test(text) ? 'warn' : genericRetry ? 'warn' : /ошиб|невер|не удалось|не найден|нельзя/i.test(text) ? 'warn' : /✅|восстановлено|успех/i.test(text) ? 'success' : 'info';
        const normalized = text.replace(/^⚠️\s*/, '').replace(/^❌\s*/, '').replace(/^✅\s*/, '').trim();
        const key = kind + '|' + normalized;
        if(Date.now() - lastToastAt < 1600 && lastToastKey === key) return;
        lastToastKey = key;
        lastToastAt = Date.now();
        showToast(normalized, kind, kind === 'info' ? 1800 : 2200);
        return;
      }
      return nativeAlert(text);
    };
  }

  function currentScreen(){
    const on = document.querySelector && document.querySelector('.scr.on');
    return on && on.id ? on.id.replace(/^s-/, '') : null;
  }

  function hasActiveSession(){
    const play = document.getElementById && document.getElementById('s-play');
    return !!(play && play.classList && play.classList.contains('on'));
  }

  function initScreenHistory(){
    if(!window.go || !document.querySelector || !document.querySelector('.scr')) return;
    if(window.__wave9HistoryReady) return;
    window.__wave9HistoryReady = true;
    let suppress = false;
    const nativeGo = window.go.bind(window);
    const nativeEndSession = typeof window.endSession === 'function' ? window.endSession.bind(window) : null;

    function writeState(screen, replace){
      if(!window.history || !history.pushState) return;
      const clean = (window.location.pathname || '').split('#')[0] || '';
      const hash = screen ? `#${screen}` : '';
      const method = replace ? 'replaceState' : 'pushState';
      try { history[method]({ trainerApp: true, screen: screen || 'main' }, '', `${clean}${hash}`); } catch (_) {}
    }

    window.go = function(screen){
      const before = currentScreen();
      const result = nativeGo(screen);
      const after = currentScreen() || screen || before || 'main';
      if(!suppress && after && after !== before) writeState(after, false);
      return result;
    };

    const initial = (window.location.hash || '').replace(/^#/, '');
    const current = currentScreen() || 'main';
    if(initial && document.getElementById(`s-${initial}`)){
      suppress = true;
      nativeGo(initial);
      suppress = false;
    }
    writeState(currentScreen() || current, true);

    window.addEventListener('popstate', function(event){
      const target = event && event.state && event.state.trainerApp ? event.state.screen : null;
      if(!target) return;
      if(hasActiveSession() && target !== 'play'){
        const ok = typeof window.confirm === 'function'
          ? window.confirm('Выйти из текущей сессии? Результат будет сохранён.')
          : true;
        if(!ok){
          suppress = true;
          writeState(currentScreen() || 'play', false);
          suppress = false;
          return;
        }
        if(nativeEndSession){
          suppress = true;
          nativeEndSession();
          writeState(currentScreen() || 'result', true);
          suppress = false;
          showToast('Сессия завершена и сохранена', 'success', 1800);
          return;
        }
      }
      suppress = true;
      nativeGo(target);
      suppress = false;
    });

    window.addEventListener('beforeunload', function(event){
      if(!hasActiveSession()) return;
      event.preventDefault();
      event.returnValue = '';
      return '';
    });
  }

  function init(){
    ensureStyles();
    patchAlert();
    mountThemeButton();
    applyTheme(getThemePref(), true);
    syncConnectivity(true);
    initScreenHistory();
    window.addEventListener('online', function(){ syncConnectivity(false); });
    window.addEventListener('offline', function(){ syncConnectivity(false); });
    bindRuntimeErrorCapture();
    try {
      const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      if(mq && mq.addEventListener){
        mq.addEventListener('change', function(){ if(getThemePref() === 'system') applyTheme('system', true); });
      }
    } catch (_) {}
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

;
/* --- wave18_cleanup.js --- */
(function(){
  function gradeKey(){ return String(window.GRADE_NUM || '10'); }
  function rushStoreKey(){ return 'trainer_rush_best_' + gradeKey(); }
  function rushPublicKey(){ return 'trainer_rush_public_' + gradeKey(); }
  function hasCloudRush(){ return !!(window.rushBinId || window.RUSH_BIN_ID); }
  function safeJSON(raw, fallback){
    try{
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    }catch(_){
      return fallback;
    }
  }
  function escHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function playerName(){
    try{ return (window.getPlayerName ? getPlayerName() : localStorage.getItem('trainer_player_name')) || 'Ученик'; }
    catch(_){ return 'Ученик'; }
  }
  function getRushPublishMode(){
    try{
      const stored = localStorage.getItem(rushPublicKey());
      if(stored === '1') return true;
      if(stored === '0') return false;
      if(hasCloudRush() && typeof window.getPrivateMode === 'function') return !window.getPrivateMode();
      return false;
    }catch(_){
      return false;
    }
  }
  function setRushPublishMode(value){
    try{ localStorage.setItem(rushPublicKey(), value ? '1' : '0'); }catch(_){ }
  }
  function rushModeLabel(){
    return getRushPublishMode() ? '🌐 Публикация в общем рейтинге включена' : '👤 Общий рейтинг выключен';
  }
  function readRushStore(){
    const data = safeJSON(localStorage.getItem(rushStoreKey()) || '{}', {});
    if(!Array.isArray(data._records)) data._records = [];
    return data;
  }
  function writeRushStore(data){
    try{ localStorage.setItem(rushStoreKey(), JSON.stringify(data)); }catch(_){ }
  }
  function localRushRecords(){
    const data = readRushStore();
    return Array.isArray(data._records) ? data._records.slice() : [];
  }
  function normalizeEntries(list, source){
    return (Array.isArray(list) ? list : []).map(function(row){
      return {
        name: String((row && row.name) || '?').slice(0, 20),
        min: Number(row && row.min) || 0,
        score: Number(row && row.score) || 0,
        date: String((row && row.date) || ''),
        ts: Number(row && row.ts) || 0,
        source: source || (row && row.source) || 'local'
      };
    }).filter(function(row){
      return (row.min === 3 || row.min === 5) && Number.isFinite(row.score);
    });
  }
  function bestRows(entries, minute){
    const best = Object.create(null);
    normalizeEntries(entries).forEach(function(row){
      if(row.min !== minute) return;
      const key = row.name || '?';
      if(!(key in best) || row.score > best[key].score){
        best[key] = row;
      }
    });
    return Object.values(best).sort(function(a,b){ return b.score - a.score || (b.ts || 0) - (a.ts || 0); }).slice(0, 10);
  }
  function latestRows(localRows, cloudRows){
    return normalizeEntries([].concat(localRows || [], cloudRows || [])).sort(function(a,b){ return (b.ts || 0) - (a.ts || 0); }).slice(0, 10);
  }
  function gradeLabel(){
    const raw = String(window.GRADE_TITLE || (window.GRADE_NUM ? window.GRADE_NUM + ' класс' : 'класс'));
    const cleaned = raw.replace(/^[^0-9]*\s*/, '').trim();
    return cleaned || (window.GRADE_NUM ? window.GRADE_NUM + ' класс' : 'класс');
  }
  function minuteBlock(title, rows, accent, background){
    if(!rows.length){
      return '<div style="text-align:center;color:var(--muted);font-size:11px;padding:14px 10px">Пока пусто. Сыграй первым.</div>';
    }
    const me = playerName();
    let html = '<div style="font-size:11px;font-weight:800;color:'+accent+';text-align:center;margin-bottom:8px">'+title+'</div>';
    rows.forEach(function(row, idx){
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : String(idx + 1);
      const mine = row.name === me;
      html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:10px;'+(mine ? 'background:'+background+';border:1px solid '+accent+'33;' : '')+'">'
        + '<div style="width:22px;text-align:center;font-size:12px">'+medal+'</div>'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:12px;font-weight:'+(mine ? '800' : '700')+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escHtml(row.name)+'</div>'
        + '<div style="font-size:10px;color:var(--muted)">'+escHtml(row.source === 'cloud' ? 'общий рейтинг' : 'это устройство')+'</div>'
        + '</div>'
        + '<div style="font-size:'+(idx === 0 ? '22px' : '16px')+';font-weight:900;color:'+accent+'">'+row.score+'</div>'
        + '</div>';
    });
    return html;
  }
  function latestBlock(rows){
    if(!rows.length) return '';
    let html = '<div style="margin-top:14px"><div style="font-size:12px;font-weight:800;margin-bottom:6px;color:var(--muted)">Последние игры</div>';
    rows.forEach(function(row){
      html += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)">'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+escHtml(row.name)+'</div>'
        + '<div style="font-size:10px;color:var(--muted)">'+escHtml((row.date || '') + (row.min ? ' · ' + row.min + ' мин' : ''))+' · '+escHtml(row.source === 'cloud' ? 'общий' : 'локальный')+'</div>'
        + '</div>'
        + '<div style="font-size:17px;font-weight:900">'+row.score+'</div>'
        + '</div>';
    });
    html += '</div>';
    return html;
  }
  async function fetchCloudRushRows(){
    if(!hasCloudRush()) return [];
    try{
      const url = 'https://api.npoint.io/' + (window.rushBinId || window.RUSH_BIN_ID);
      const res = window.fetchWithTimeout ? await window.fetchWithTimeout(url, null, 5000) : await fetch(url);
      const data = await res.json();
      return normalizeEntries((data && data.records) || [], 'cloud');
    }catch(_){
      return [];
    }
  }
  async function pushRushRecordPatched(name, min, score){
    if(!hasCloudRush() || !getRushPublishMode()) return false;
    try{
      const url = 'https://api.npoint.io/' + (window.rushBinId || window.RUSH_BIN_ID);
      const fetcher = window.fetchWithTimeout ? window.fetchWithTimeout : async function(u, opts){ return fetch(u, opts); };
      const current = await fetcher(url, null, 5000);
      const payload = await current.json();
      payload.records || (payload.records = []);
      payload.records.push({
        name: String(name || playerName()).slice(0, 20),
        min: Number(min) || 0,
        score: Number(score) || 0,
        date: (new Date()).toLocaleDateString('ru', { day:'numeric', month:'short' }) + ' ' + (new Date()).toLocaleTimeString('ru', { hour:'2-digit', minute:'2-digit' }),
        ts: Date.now()
      });
      if(payload.records.length > 120) payload.records = payload.records.slice(-120);
      await fetcher(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }, 5000);
      return true;
    }catch(err){
      try{
        const q = safeJSON(localStorage.getItem('rush_queue') || '[]', []);
        q.push({ name:String(name || playerName()).slice(0,20), min:Number(min)||0, score:Number(score)||0, ts:Date.now(), reason:'cloud' });
        localStorage.setItem('rush_queue', JSON.stringify(q.slice(-20)));
      }catch(_){ }
      return false;
    }
  }
  function patchPrivacyButton(){
    const original = typeof window.renderPrivacyBtn === 'function' ? window.renderPrivacyBtn : null;
    window.renderPrivacyBtn = function(){
      if(original) original();
      const btn = document.getElementById('privacy-btn');
      if(!btn) return;
      const hidden = typeof window.getPrivateMode === 'function' ? window.getPrivateMode() : true;
      btn.textContent = hidden ? '☁️ Облако выключено' : '☁️ Облако включено';
      btn.style.background = hidden ? '#fee2e2' : '#dbeafe';
      btn.style.color = hidden ? '#dc2626' : '#2563eb';
      btn.title = hidden
        ? 'Облако выключено: код восстановления не обновляется, резервная копия доступна только через файл или код переноса.'
        : 'Облако включено: можно синхронизировать текущий класс и восстанавливать его по коду.';
      let note = document.getElementById('privacy-note');
      if(!note && btn.parentElement){
        note = document.createElement('div');
        note.id = 'privacy-note';
        note.style.cssText = 'margin-top:6px;font-size:11px;line-height:1.45;color:var(--muted)';
        btn.parentElement.appendChild(note);
      }
      if(note){
        note.textContent = hidden
          ? 'Пока облако выключено, резервная копия работает только через файл или код переноса. Рейтинг Молнии настраивается отдельно.'
          : 'Облако включено: код восстановления можно обновлять, а рейтинг Молнии управляется своей настройкой.';
      }
    };
  }
  function patchInfoCopy(){
    const root = document.getElementById('s-info');
    if(!root) return;
    const blocks = Array.from(root.querySelectorAll('p'));
    blocks.forEach(function(p){
      const txt = (p.textContent || '').trim();
      if(txt.includes('Рекорды сохраняются')){
        p.textContent = hasCloudRush()
          ? 'Рекорды Молнии всегда сохраняются на этом устройстве. Публикация в общий рейтинг включается отдельно — по желанию.'
          : 'В этом классе Молния сохраняет рекорды только на этом устройстве. Общий рейтинг пока не подключён.';
      }
      if(txt.includes('Код восстановления показывается')){
        p.textContent = hasCloudRush()
          ? 'Код восстановления показывается в профиле, если включено облако. Для надёжности всегда доступны резервная копия: файл или код переноса без облака.'
          : 'В этом классе облачная синхронизация пока не включена. Для переноса прогресса используй резервную копию: файл или код переноса.';
      }
    });
  }
  function currentModalCard(){
    const overlays = Array.from(document.querySelectorAll('div[style*="z-index:9999"]'));
    return overlays.length ? overlays[overlays.length - 1] : null;
  }
  async function showRushRecordsPatched(){
    try{
      const best = readRushStore();
      window.rushBest = { 3: best[3] || 0, 5: best[5] || 0 };
    }catch(_){ }
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto';
    overlay.onclick = function(){ overlay.remove(); };
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:18px;padding:22px 18px;max-width:420px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 12px 30px rgba(0,0,0,.25)';
    card.onclick = function(ev){ ev.stopPropagation(); };
    card.innerHTML = '<div style="text-align:center;padding:24px"><div style="font-size:24px">⏳</div><div style="font-size:13px;color:var(--muted);margin-top:8px">Загружаю рейтинг Молнии...</div></div>';
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const localRows = normalizeEntries(localRushRecords(), 'local');
    const cloudRows = await fetchCloudRushRows();
    const local3 = bestRows(localRows, 3);
    const local5 = bestRows(localRows, 5);
    const cloud3 = bestRows(cloudRows, 3);
    const cloud5 = bestRows(cloudRows, 5);
    const latest = latestRows(localRows, cloudRows);
    const sharedEnabled = getRushPublishMode();
    const localOnly = !hasCloudRush();

    let html = '<h3 style="font-family:Unbounded,system-ui,sans-serif;font-size:16px;font-weight:800;margin-bottom:8px;text-align:center">🏆 Молния — '+escHtml(gradeLabel())+'</h3>';
    html += '<div style="font-size:11px;color:var(--muted);line-height:1.55;text-align:center;margin-bottom:12px">На устройстве рекорды сохраняются всегда. Общий рейтинг и облачная синхронизация теперь настраиваются отдельно.</div>';

    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">';
    html += '<div style="background:#fef9c3;border-radius:14px;padding:10px">'+minuteBlock('Это устройство · 3 мин', local3, '#92400e', '#fff7ed')+'</div>';
    html += '<div style="background:#fee2e2;border-radius:14px;padding:10px">'+minuteBlock('Это устройство · 5 мин', local5, '#991b1b', '#fff7ed')+'</div>';
    html += '</div>';

    if(localOnly){
      html += '<div style="background:var(--abg);border-radius:12px;padding:12px;font-size:11px;line-height:1.55;color:var(--muted);margin-bottom:10px">☁️ В этом классе общий рейтинг пока не подключён. Локальный рейтинг уже работает и хранится на этом устройстве.</div>';
    } else {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">';
      html += '<div style="background:#ede9fe;border-radius:14px;padding:10px">'+minuteBlock('Общий рейтинг · 3 мин', cloud3, '#6d28d9', '#ede9fe')+'</div>';
      html += '<div style="background:#dbeafe;border-radius:14px;padding:10px">'+minuteBlock('Общий рейтинг · 5 мин', cloud5, '#1d4ed8', '#dbeafe')+'</div>';
      html += '</div>';
      html += '<div style="background:var(--abg);border-radius:12px;padding:12px;margin-bottom:10px">'
        + '<div style="font-size:11px;font-weight:800;margin-bottom:4px">'+escHtml(rushModeLabel())+'</div>'
        + '<div style="font-size:11px;color:var(--muted);line-height:1.5">'
        + (sharedEnabled
            ? 'Новые рекорды могут попадать в общий рейтинг, даже если облако для резервной копии выключено.'
            : 'Пока общий рейтинг выключен, новые рекорды останутся только на этом устройстве. Включить публикацию можно в один тап.')
        + '</div>'
        + '<button type="button" id="rush-public-toggle" style="margin-top:8px;width:100%;padding:10px;border:none;border-radius:10px;background:'+(sharedEnabled ? '#fee2e2' : '#dcfce7')+';color:'+(sharedEnabled ? '#991b1b' : '#166534')+';font-weight:800;cursor:pointer">'+(sharedEnabled ? '👤 Не публиковать в общий рейтинг' : '🌐 Публиковать в общий рейтинг')+'</button>'
        + '</div>';
    }

    html += latestBlock(latest);
    html += '<button type="button" style="margin-top:12px;width:100%;padding:10px;border:none;border-radius:10px;background:var(--text);color:var(--bg);font-weight:800;cursor:pointer" onclick="this.closest(\'div[style*=fixed]\').remove()">Закрыть</button>';
    card.innerHTML = html;
    const toggle = card.querySelector('#rush-public-toggle');
    if(toggle){
      toggle.addEventListener('click', function(){
        const next = !getRushPublishMode();
        setRushPublishMode(next);
        if(typeof window.showToast === 'function'){
          window.showToast(next ? 'Общий рейтинг Молнии включён' : 'Общий рейтинг Молнии выключен', next ? 'success' : 'warn', 2200);
        }
        overlay.remove();
        window.showRushRecords();
      }, { once: true });
    }
  }

  function patchFunctions(){
    window.getRushPublishMode = getRushPublishMode;
    window.setRushPublishMode = setRushPublishMode;
    window.pushRushRecord = pushRushRecordPatched;
    window.showRushRecords = showRushRecordsPatched;
    try{ getRushPublishMode = window.getRushPublishMode; }catch(_){}
    try{ setRushPublishMode = window.setRushPublishMode; }catch(_){}
    try{ pushRushRecord = window.pushRushRecord; }catch(_){}
    try{ showRushRecords = window.showRushRecords; }catch(_){}
    patchPrivacyButton();
    try{ renderPrivacyBtn = window.renderPrivacyBtn; }catch(_){}
    patchInfoCopy();
    if(typeof window.renderPrivacyBtn === 'function') window.renderPrivacyBtn();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchFunctions, { once:true });
  else patchFunctions();
})();

;
/* --- wave21_progress.js --- */
(function(){
  const GRADE = String(window.GRADE_NUM || '10');
  const FAV_KEY = 'trainer_favs_' + GRADE;
  const LAST_KEY = 'trainer_last_topic_' + GRADE;
  const SNAP_KEY = 'trainer_session_snapshot_' + GRADE;
  const SOFT_SESSION_GOAL = 20;

  function clone(v){
    try { return JSON.parse(JSON.stringify(v)); } catch { return null; }
  }
  function readJSON(key, fallback){
    try {
      const raw = localStorage.getItem(key);
      if(!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }
  function writeJSON(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
  function toast(msg){
    try {
      if(typeof showToast === 'function') showToast(msg);
      else alert(msg);
    } catch {}
  }
  function ensureStyles(){
    if(document.getElementById('wave21-progress-style')) return;
    const style = document.createElement('style');
    style.id = 'wave21-progress-style';
    style.textContent = `
      .wave21-main-actions{display:flex;flex-direction:column;gap:10px;margin:12px 0}
      .wave21-chiprow{display:flex;flex-wrap:wrap;gap:8px}
      .wave21-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;border:1px solid var(--border);background:var(--card);color:var(--text);font:600 12px 'Golos Text',sans-serif;cursor:pointer}
      .wave21-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px 16px}
      .wave21-card h3{font:800 13px Unbounded,system-ui,sans-serif;margin-bottom:8px}
      .wave21-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .wave21-sub{font-size:11px;color:var(--muted);line-height:1.5}
      .wave21-mini-btn{border:none;border-radius:10px;padding:9px 12px;background:var(--abg);color:var(--accent);font:700 12px 'Golos Text',sans-serif;cursor:pointer}
      .wave21-mini-btn.alt{background:var(--obg);color:var(--orange)}
      .wave21-mini-btn.good{background:var(--gbg);color:var(--green)}
      .wave21-favs{display:flex;flex-direction:column;gap:6px;margin-top:8px}
      .wave21-favbtn{display:flex;align-items:center;gap:8px;border:none;border-radius:11px;background:var(--card);border:1px solid var(--border);padding:10px 12px;width:100%;text-align:left;color:var(--text);cursor:pointer;font:600 12px 'Golos Text',sans-serif}
      .wave21-favbtn .star{color:var(--orange);font-size:13px}
      .wave21-favmark{margin-left:8px;color:var(--orange);font-size:12px;flex-shrink:0}
      .wave21-session{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:10px 12px;margin-bottom:8px}
      .wave21-session-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
      .wave21-session-title{font-size:12px;font-weight:800;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .wave21-session-sub{font-size:10px;color:var(--muted)}
      .wave21-session-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
      .wave21-iconbtn{border:none;border-radius:8px;padding:6px 8px;background:var(--abg);color:var(--accent);font:700 11px 'Golos Text',sans-serif;cursor:pointer}
      .wave21-iconbtn.alt{background:var(--obg);color:var(--orange)}
      .wave21-iconbtn.good{background:var(--gbg);color:var(--green)}
      .wave21-note{font-size:10px;color:var(--muted);margin-top:4px;line-height:1.4}
      .wave21-toolbar{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 12px}
      .wave21-result-actions{display:flex;flex-direction:column;gap:8px;margin:8px 0 12px}
      .wave21-resume-strong{font-weight:800;color:var(--accent)}
    `;
    document.head.appendChild(style);
  }

  function favList(){
    return readJSON(FAV_KEY, []).filter(Boolean);
  }
  function saveFavList(list){
    writeJSON(FAV_KEY, Array.from(new Set(list)));
  }
  function favKeyFor(subjId, topicId){
    return subjId + '::' + topicId;
  }
  function isFav(subjId, topicId){
    return favList().includes(favKeyFor(subjId, topicId));
  }
  function findTopicMeta(subjId, topicId){
    const subj = (SUBJ || []).find(s => s.id === subjId);
    if(!subj) return null;
    const topic = (subj.tops || []).find(t => t.id === topicId);
    if(!topic) return null;
    return { subj, topic };
  }
  function toggleFav(subjId, topicId){
    const key = favKeyFor(subjId, topicId);
    const list = favList();
    const idx = list.indexOf(key);
    let added = false;
    if(idx >= 0) list.splice(idx, 1);
    else { list.unshift(key); added = true; }
    saveFavList(list.slice(0, 60));
    return added;
  }
  function getLastTopic(){
    return readJSON(LAST_KEY, null);
  }
  function saveLastTopic(){
    if(!cS || !cT) return;
    writeJSON(LAST_KEY, {
      subjId: cS.id,
      topicId: cT.id,
      subjectName: cS.nm,
      topicName: cT.nm,
      at: Date.now()
    });
  }
  function clearSnapshot(){
    try { localStorage.removeItem(SNAP_KEY); } catch {}
  }
  function currentScreenId(){
    const el = document.querySelector('.scr.on');
    return el ? el.id : '';
  }
  function sessionGoal(){
    if(Array.isArray(window.__wave21QuestionQueue) && window.__wave21QuestionQueueTotal) return window.__wave21QuestionQueueTotal;
    if(typeof demoMode !== 'undefined' && demoMode) return 10;
    if(diagMode) return diagMax || 20;
    if(rushMode) return 0;
    return SOFT_SESSION_GOAL;
  }
  function questionNumber(){
    const answered = st && (st.ok + st.err) || 0;
    if(!prob) return answered;
    return answered + (sel === null ? 1 : 0);
  }
  function topicBadgeText(){
    if(window.__wave21SessionMode === 'error-review') return '🔁 Повтор ошибок';
    if(diagMode) return '📝 Диагностика';
    if(rushMode) return '⚡ Молния';
    if(globalMix) return '🎯 Всё вперемешку';
    if(mix && cS) return '🎯 Микс: ' + cS.nm;
    if(cT) return cT.nm;
    return 'Тренировка';
  }
  function ensureSessionSlot(){
    ensureStyles();
    const wrap = document.querySelector('#s-play .w');
    if(!wrap) return null;
    let slot = document.getElementById('wave21-session-slot');
    if(!slot){
      slot = document.createElement('div');
      slot.id = 'wave21-session-slot';
      const sts = document.getElementById('sts');
      if(sts) wrap.insertBefore(slot, sts);
      else wrap.insertBefore(slot, wrap.firstChild);
    }
    return slot;
  }
  function renderSessionProgress(){
    const slot = ensureSessionSlot();
    if(!slot) return;
    if(currentScreenId() !== 's-play' || !prob){ slot.innerHTML = ''; return; }
    const qn = questionNumber();
    const goal = sessionGoal();
    const overGoal = !!(goal && qn > goal);
    const barWidth = goal ? Math.min(100, Math.round((Math.min(qn, goal) / goal) * 100)) : 0;
    const favBtn = (cS && cT && !globalMix && !mix && !diagMode && !rushMode)
      ? `<button type="button" class="wave21-iconbtn ${isFav(cS.id, cT.id) ? 'alt' : ''}" onclick="wave21ToggleFavorite()">${isFav(cS.id, cT.id) ? '★ В избранном' : '☆ В избранное'}</button>`
      : '';
    const restartBtn = (window.__wave21LastSessionErrors && window.__wave21LastSessionErrors.length && currentScreenId()==='s-play' && !rushMode)
      ? `<button type="button" class="wave21-iconbtn good" onclick="wave21RepeatSessionErrors()">🔁 Ошибки</button>`
      : '';
    const label = !goal
      ? `Вопрос ${Math.max(1, qn)}`
      : overGoal
        ? `Вопрос ${qn} · сверх нормы (+${qn - goal})`
        : `Вопрос ${Math.max(1, qn)} из ${goal}`;
    const sub = goal && !diagMode && !rushMode
      ? (overGoal
          ? `Мини-сессия пройдена. Нажми «← Завершить», чтобы увидеть итог — или продолжай для бонуса.`
          : `Мини-сессия на ${goal} вопросов. После ${goal}-го вопроса можно завершить и оценить прогресс.`)
      : (diagMode ? 'Строгий режим без подсказок.' : (rushMode ? 'В режиме Молния количество вопросов не фиксировано.' : ''));
    slot.innerHTML = `
      <div class="wave21-session">
        <div class="wave21-session-top">
          <div>
            <div class="wave21-session-title"><span>${topicBadgeText()}</span><span class="wave21-session-sub">${label}</span></div>
            ${sub ? `<div class="wave21-note">${sub}</div>` : ''}
          </div>
          <div class="wave21-session-actions">
            ${favBtn}
            ${restartBtn}
          </div>
        </div>
        ${goal ? `<div class="pgbar"><div class="pgfill" style="width:${barWidth}%;background:${overGoal ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : (diagMode ? 'var(--orange)' : 'var(--accent)')}"></div></div>` : ''}
      </div>`;
  }

  function buildSnapshot(){
    if(currentScreenId() !== 's-play' || !prob) return null;
    return {
      v: 21,
      grade: GRADE,
      savedAt: Date.now(),
      hdr: document.getElementById('hdr') ? document.getElementById('hdr').textContent : '',
      subjectId: cS ? cS.id : null,
      topicId: cT ? cT.id : null,
      mix: !!mix,
      globalMix: !!globalMix,
      rushMode: !!rushMode,
      diagMode: !!diagMode,
      curTheory: curTheory || null,
      st: clone(st) || { ok: 0, err: 0, streak: 0, best: 0 },
      sesTopics: clone(sesTopics) || {},
      seenQs: clone(seenQs) || {},
      prob: clone(prob),
      wrongAnswers: clone(wrongAnswers) || [],
      sessionErrors: clone(window.__wave21SessionErrors || []) || [],
      queue: clone(window.__wave21QuestionQueue || null),
      queueTotal: window.__wave21QuestionQueueTotal || 0,
      sessionMode: window.__wave21SessionMode || '',
      tv: tv,
      rushTime: rushTime,
      rushErrors: rushErrors,
      rushScore: rushScore,
      diagTime: diagTime,
      diagMax: diagMax,
      mixFilter: clone(mixFilter),
      savedCount: (st && (st.ok + st.err)) || 0
    };
  }
  function maybeSaveSnapshot(force){
    if(currentScreenId() !== 's-play' || !prob || sel !== null) return;
    const count = (st && (st.ok + st.err)) || 0;
    const last = Number(window.__wave21LastSavedCount || -999);
    if(!force && count !== 0 && count - last < 3) return;
    const snap = buildSnapshot();
    if(!snap) return;
    writeJSON(SNAP_KEY, snap);
    window.__wave21LastSavedCount = count;
  }
  function restoreTimerForResume(){
    if(ti) clearInterval(ti);
    const tmr = document.getElementById('tmr');
    if(!tmr) return;
    if(rushMode){
      tmr.textContent = fmt(tv);
      ti = setInterval(() => {
        tv--;
        tmr.textContent = fmt(tv);
        if(tv <= 0){ clearInterval(ti); endSession(); }
      }, 1000);
    } else if(diagMode){
      tmr.textContent = fmt(tv);
      ti = setInterval(() => {
        tv--;
        tmr.textContent = fmt(tv);
        if(tv <= 0){ clearInterval(ti); endSession(); }
      }, 1000);
    } else {
      tmr.textContent = fmt(tv);
      ti = setInterval(() => {
        tv++;
        tmr.textContent = fmt(tv);
      }, 1000);
    }
  }
  function resumeSnapshot(){
    const snap = readJSON(SNAP_KEY, null);
    if(!snap){ toast('Нет сохранённой сессии.'); return false; }
    if(String(snap.grade || '') !== GRADE){ toast('Сохранённая сессия относится к другому классу.'); return false; }
    const subj = snap.subjectId ? (SUBJ || []).find(s => s.id === snap.subjectId) : null;
    const topic = subj && snap.topicId ? (subj.tops || []).find(t => t.id === snap.topicId) : null;
    cS = subj || null;
    cT = topic || null;
    mix = !!snap.mix;
    globalMix = !!snap.globalMix;
    rushMode = !!snap.rushMode;
    diagMode = !!snap.diagMode;
    curTheory = topic && topic.th ? topic.th : (snap.curTheory || null);
    st = snap.st || { ok: 0, err: 0, streak: 0, best: 0 };
    sesTopics = snap.sesTopics || {};
    seenQs = snap.seenQs || {};
    prob = snap.prob || null;
    wrongAnswers = Array.isArray(snap.wrongAnswers) ? snap.wrongAnswers : [];
    window.__wave21SessionErrors = Array.isArray(snap.sessionErrors) ? snap.sessionErrors : [];
    window.__wave21QuestionQueue = Array.isArray(snap.queue) ? snap.queue : null;
    window.__wave21QuestionQueueTotal = snap.queueTotal || 0;
    window.__wave21SessionMode = snap.sessionMode || null;
    tv = +snap.tv || 0;
    rushTime = +snap.rushTime || rushTime;
    rushErrors = +snap.rushErrors || 0;
    rushScore = +snap.rushScore || 0;
    diagTime = +snap.diagTime || diagTime;
    diagMax = +snap.diagMax || diagMax;
    if('mixFilter' in snap) mixFilter = Array.isArray(snap.mixFilter) ? snap.mixFilter : null;
    sel = null;
    hintOn = false;
    shpOn = false;
    usedHelp = false;
    if(document.getElementById('hdr')){
      document.getElementById('hdr').textContent = snap.hdr || (cS ? cS.nm.toUpperCase() : 'ПОДГОТОВКА');
    }
    go('play');
    restoreTimerForResume();
    render();
    maybeSaveSnapshot(true);
    toast('Вернул тебя к незавершённой сессии.');
    return true;
  }

  function openTopic(subjId, topicId, mode){
    const meta = findTopicMeta(subjId, topicId);
    if(!meta) return false;
    openSubj(subjId);
    cT = meta.topic;
    curTheory = cT.th || null;
    if(mode === 'train'){
      mix = false;
      globalMix = false;
      rushMode = false;
      diagMode = false;
      document.getElementById('hdr').textContent = meta.subj.nm.toUpperCase();
      startQuiz();
    } else {
      document.getElementById('tc').innerHTML = cT.th || '<div class="tcard"><p>Шпаргалка скоро появится.</p></div>';
      go('theory');
    }
    return true;
  }
  function continueLastTopic(){
    const last = getLastTopic();
    if(!last){ toast('Последняя тема пока не сохранена.'); return; }
    if(!openTopic(last.subjId, last.topicId, 'train')) toast('Тема из прошлой сессии сейчас недоступна.');
  }
  function randomTopic(){
    const pool = [];
    (SUBJ || []).forEach(subj => {
      if(subj.locked && (STR.totalOk || 0) < (subj.unlockAt || 0)) return;
      (subj.tops || []).forEach(topic => pool.push({ subj, topic }));
    });
    if(!pool.length) return toast('Случайная тема пока недоступна.');
    const picked = pool[Math.floor(Math.random() * pool.length)];
    openTopic(picked.subj.id, picked.topic.id, 'theory');
    toast('Случайная тема: ' + picked.subj.nm + ' → ' + picked.topic.nm);
  }

  function renderFavsMain(){
    const list = favList();
    if(!list.length) return '';
    const items = list.map(key => {
      const parts = key.split('::');
      const meta = findTopicMeta(parts[0], parts[1]);
      return meta ? { key, meta } : null;
    }).filter(Boolean).slice(0, 6);
    if(!items.length) return '';
    return `<div class="wave21-card" id="wave21-favs"><h3>★ Избранные темы</h3><div class="wave21-sub">Быстрый доступ к темам, к которым хочешь вернуться.</div><div class="wave21-favs">${items.map(({meta}) => `<button type="button" class="wave21-favbtn" onclick="wave21OpenTopic('${meta.subj.id}','${meta.topic.id}','train')"><span class="star">★</span><span style="flex:1">${esc(meta.subj.nm)} → ${esc(meta.topic.nm)}</span></button>`).join('')}</div></div>`;
  }
  function renderMainActions(){
    ensureStyles();
    const main = document.querySelector('#s-main .w');
    if(!main) return;
    let box = document.getElementById('wave21-main-actions');
    if(!box){
      box = document.createElement('div');
      box.id = 'wave21-main-actions';
      box.className = 'wave21-main-actions';
      const daily = document.getElementById('daily-meter');
      if(daily && daily.parentNode === main){
        main.insertBefore(box, daily.nextSibling);
      } else {
        const search = document.getElementById('main-search-slot');
        main.insertBefore(box, search ? search.nextSibling : main.firstChild);
      }
    }
    const last = getLastTopic();
    const snap = readJSON(SNAP_KEY, null);
    const lastMeta = last ? findTopicMeta(last.subjId, last.topicId) : null;
    const snapMeta = snap && snap.subjectId && snap.topicId ? findTopicMeta(snap.subjectId, snap.topicId) : null;
    const parts = [];
    if(snap && snap.prob){
      const count = ((snap.st && (snap.st.ok + snap.st.err)) || 0);
      const label = snapMeta ? `${snapMeta.subj.nm} → ${snapMeta.topic.nm}` : (snap.sessionMode === 'error-review' ? 'Повтор ошибок' : 'Незавершённая сессия');
      parts.push(`<button type="button" class="scard" onclick="wave21ResumeSession()"><div class="ic" style="background:var(--abg);color:var(--accent)">▶</div><div style="flex:1"><div class="nm">Вернуться к сессии</div><div class="dt"><span class="wave21-resume-strong">${esc(label)}</span> · сохранено после ${count} ${declNum(count,'вопроса','вопросов','вопросов')}</div></div></button>`);
    }
    if(lastMeta){
      parts.push(`<button type="button" class="scard" onclick="wave21ContinueLastTopic()"><div class="ic" style="background:var(--gbg);color:var(--green)">⏯</div><div style="flex:1"><div class="nm">Продолжить тему</div><div class="dt">${esc(lastMeta.subj.nm)} → ${esc(lastMeta.topic.nm)}</div></div></button>`);
    }
    parts.push(`<div class="wave21-chiprow"><button type="button" class="wave21-chip" onclick="wave21RandomTopic()">🎲 Случайная тема</button>${favList().length ? `<button type="button" class="wave21-chip" onclick="document.getElementById('wave21-favs') && document.getElementById('wave21-favs').scrollIntoView({behavior:'smooth',block:'center'})">★ Избранное: ${favList().length}</button>` : ''}</div>`);
    parts.push(renderFavsMain());
    box.innerHTML = parts.join('');
  }
  function decorateTopicButtons(){
    if(!cS) return;
    const buttons = Array.from(document.querySelectorAll('#tl .tbtn'));
    if(!buttons.length) return;
    const q = normText(topicSearch);
    const topics = (cS.tops || []).filter(t => !q || matchText(t.nm, q) || matchText(t.id, q));
    topics.forEach((topic, idx) => {
      const btn = buttons[idx];
      if(!btn) return;
      btn.dataset.topicId = topic.id;
      btn.title = isFav(cS.id, topic.id) ? 'Тема в избранном. Открой тему и нажми ★, чтобы убрать.' : (btn.title || '');
      const old = btn.querySelector('.wave21-favmark');
      if(old) old.remove();
      if(isFav(cS.id, topic.id)){
        const mark = document.createElement('span');
        mark.className = 'wave21-favmark';
        mark.textContent = '★';
        btn.appendChild(mark);
      }
    });
  }
  function injectTheoryToolbar(){
    ensureStyles();
    const wrap = document.querySelector('#s-theory .w');
    if(!wrap) return;
    let bar = document.getElementById('wave21-theory-toolbar');
    if(!bar){
      bar = document.createElement('div');
      bar.id = 'wave21-theory-toolbar';
      bar.className = 'wave21-toolbar';
      const tc = document.getElementById('tc');
      wrap.insertBefore(bar, tc);
    }
    if(!cS || !cT){ bar.innerHTML = ''; return; }
    const active = isFav(cS.id, cT.id);
    bar.innerHTML = `
      <button type="button" class="wave21-mini-btn ${active ? 'alt' : ''}" onclick="wave21ToggleFavorite()">${active ? '★ В избранном' : '☆ В избранное'}</button>
      <button type="button" class="wave21-mini-btn" onclick="wave21RandomTopic()">🎲 Случайная тема</button>
      <button type="button" class="wave21-mini-btn good" onclick="wave21ContinueLastTopic()">⏯ Продолжить</button>`;
  }
  function injectResultActions(errorReviewSubjectId, errorReviewTopicId, wasErrorReview){
    ensureStyles();
    if(currentScreenId() !== 's-result') return;
    let box = document.getElementById('wave21-result-actions');
    if(!box){
      box = document.createElement('div');
      box.id = 'wave21-result-actions';
      box.className = 'wave21-result-actions';
      const resTopics = document.getElementById('res-topics');
      if(resTopics && resTopics.parentNode) resTopics.parentNode.insertBefore(box, resTopics.nextSibling);
    }
    if(wasErrorReview){
      const title = document.getElementById('res-title');
      const emoji = document.getElementById('res-emoji');
      if(title) title.textContent = 'Повтор ошибок завершён';
      if(emoji) emoji.textContent = '🔁';
    }
    const canRepeat = Array.isArray(window.__wave21LastSessionErrors) && window.__wave21LastSessionErrors.length > 0;
    const canContinue = !!(errorReviewSubjectId && errorReviewTopicId);
    box.innerHTML = [
      canRepeat ? `<button type="button" class="btn btn-o" onclick="wave21RepeatSessionErrors()">🔁 Повторить ошибки этой сессии</button>` : '',
      canContinue ? `<button type="button" class="btn btn-o" onclick="wave21OpenTopic('${errorReviewSubjectId}','${errorReviewTopicId}','train')">⏯ Вернуться к теме</button>` : ''
    ].filter(Boolean).join('');
  }

  function makeQueueQuestion(item){
    const baseOptions = Array.isArray(item.options) ? item.options.slice() : [];
    const options = uniq([item.answer, item.chosen || '', ...baseOptions].filter(Boolean));
    return {
      question: item.question,
      answer: item.answer,
      options: shuffle(options.length >= 2 ? options.slice(0, 4) : uniq([item.answer, item.chosen || 'Не знаю', 'Ещё подумать', 'Пропустить']).slice(0, 4)),
      hint: item.hint || '',
      tag: item.tag || 'Ошибки',
      color: item.color || '#2563eb',
      bg: item.bg || '#dbeafe',
      code: item.code || null,
      isMath: !!item.isMath,
      __subjectId: item.subjectId || null,
      __topicId: item.topicId || null
    };
  }
  function repeatSessionErrors(){
    if(!Array.isArray(window.__wave21LastSessionErrors) || !window.__wave21LastSessionErrors.length){
      toast('Ошибок в последней сессии нет.');
      return;
    }
    const seed = window.__wave21LastSessionErrors.map(item => makeQueueQuestion(item));
    window.__wave21QuestionQueue = seed;
    window.__wave21QuestionQueueTotal = seed.length;
    window.__wave21SessionMode = 'error-review';
    const first = window.__wave21LastSessionErrors[0];
    if(first && first.subjectId){
      const meta = findTopicMeta(first.subjectId, first.topicId);
      cS = meta ? meta.subj : ((SUBJ || []).find(s => s.id === first.subjectId) || cS);
      cT = meta ? meta.topic : cT;
    }
    mix = false;
    globalMix = false;
    rushMode = false;
    diagMode = false;
    document.getElementById('hdr').textContent = '🔁 ОШИБКИ';
    startQuiz();
  }

  const _origRefreshMain = refreshMain;
  refreshMain = function(){
    const res = _origRefreshMain.apply(this, arguments);
    try { renderMainActions(); } catch {}
    return res;
  };

  const _origOpenSubj = openSubj;
  openSubj = function(){
    const res = _origOpenSubj.apply(this, arguments);
    try { decorateTopicButtons(); } catch {}
    return res;
  };

  const _origGo = go;
  go = function(screen){
    const res = _origGo.apply(this, arguments);
    try {
      if(screen === 'main') renderMainActions();
      if(screen === 'subj') decorateTopicButtons();
      if(screen === 'theory') injectTheoryToolbar();
      if(screen === 'play') renderSessionProgress();
      if(screen === 'result') injectResultActions(cS && cS.id, cT && cT.id, window.__wave21SessionMode === 'error-review');
    } catch {}
    return res;
  };

  const _origStartQuiz = startQuiz;
  startQuiz = function(){
    const usingQueue = Array.isArray(window.__wave21QuestionQueue) && window.__wave21QuestionQueue.length > 0;
    if(cS && cT && !rushMode) saveLastTopic();
    window.__wave21SessionErrors = [];
    if(!usingQueue){
      window.__wave21QuestionQueue = null;
      window.__wave21QuestionQueueTotal = 0;
      if(window.__wave21SessionMode !== 'error-review') window.__wave21SessionMode = null;
    }
    window.__wave21LastSavedCount = -1;
    const res = _origStartQuiz.apply(this, arguments);
    try { maybeSaveSnapshot(true); } catch {}
    return res;
  };

  const _origNextQ = nextQ;
  nextQ = function(){
    if(Array.isArray(window.__wave21QuestionQueue)){
      if(window.__wave21QuestionQueue.length === 0){
        if((st.ok + st.err) >= (window.__wave21QuestionQueueTotal || 0)) return endSession();
        window.__wave21QuestionQueue = null;
        window.__wave21QuestionQueueTotal = 0;
        window.__wave21SessionMode = null;
      } else {
        const item = clone(window.__wave21QuestionQueue.shift());
        if(item){
          prob = item;
          if(item.__subjectId){
            const meta = findTopicMeta(item.__subjectId, item.__topicId);
            if(meta){ cS = meta.subj; cT = meta.topic; curTheory = cT.th || curTheory; }
          }
          sel = null;
          hintOn = false;
          shpOn = false;
          usedHelp = false;
          render();
          try { window.scrollTo({top:0,behavior:'smooth'}); } catch {}
          return;
        }
      }
    }
    return _origNextQ.apply(this, arguments);
  };

  const _origRender = render;
  render = function(){
    const res = _origRender.apply(this, arguments);
    try {
      renderSessionProgress();
      maybeSaveSnapshot(false);
    } catch {}
    return res;
  };

  const _origAns = ans;
  ans = function(idx){
    const active = prob ? {
      subjectId: cS ? cS.id : null,
      topicId: cT ? cT.id : (typeof findTopicId === 'function' ? findTopicId(prob.tag) : null),
      question: prob.question,
      answer: prob.answer,
      options: Array.isArray(prob.options) ? prob.options.slice() : [],
      hint: prob.hint || '',
      tag: prob.tag,
      color: prob.color,
      bg: prob.bg,
      code: prob.code || null,
      isMath: !!prob.isMath,
      chosen: prob && prob.options ? prob.options[idx] : null
    } : null;
    const result = _origAns.apply(this, arguments);
    try {
      if(active && active.chosen !== active.answer){
        window.__wave21SessionErrors = window.__wave21SessionErrors || [];
        window.__wave21SessionErrors.push(active);
      }
    } catch {}
    return result;
  };

  const _origEndSession = endSession;
  endSession = function(){
    const wasErrorReview = window.__wave21SessionMode === 'error-review';
    const previousSubjectId = cS && cS.id;
    const previousTopicId = cT && cT.id;
    window.__wave21LastSessionErrors = clone(window.__wave21SessionErrors || []) || [];
    const res = _origEndSession.apply(this, arguments);
    clearSnapshot();
    window.__wave21LastSavedCount = -1;
    window.__wave21QuestionQueue = null;
    window.__wave21QuestionQueueTotal = 0;
    injectResultActions(previousSubjectId, previousTopicId, wasErrorReview);
    window.__wave21SessionMode = null;
    window.__wave21SessionErrors = [];
    return res;
  };

  window.wave21ToggleFavorite = function(){
    if(!cS || !cT) return;
    const added = toggleFav(cS.id, cT.id);
    saveLastTopic();
    injectTheoryToolbar();
    decorateTopicButtons();
    renderMainActions();
    renderSessionProgress();
    toast(added ? 'Тема добавлена в избранное.' : 'Тема удалена из избранного.');
  };
  window.wave21ContinueLastTopic = continueLastTopic;
  window.wave21RandomTopic = randomTopic;
  window.wave21ResumeSession = resumeSnapshot;
  window.wave21OpenTopic = openTopic;
  window.wave21RepeatSessionErrors = repeatSessionErrors;
  window.wave21ForceSnapshot = function(){ maybeSaveSnapshot(true); };

  ensureStyles();
  setTimeout(() => {
    try { renderMainActions(); decorateTopicButtons(); injectTheoryToolbar(); renderSessionProgress(); } catch {}
  }, 0);
})();

;
/* --- wave23_accessibility.js --- */
(() => {
  const STYLE_ID = 'wave23-a11y-style';
  const LIVE_ID = 'wave23-live';
  const SKIP_ID = 'wave23-skip-link';
  const MAIN_ID = 'wave23-main';
  const BTN_ATTR = 'data-wave23-button';
  const BTN_BOUND = 'data-wave23-button-bound';
  const DIALOG_ATTR = 'data-wave23-overlay';
  const INPUT_ATTR = 'data-wave23-input-bound';
  const ISOLATE_ATTR = 'data-wave23-isolated';
  const ISOLATE_HIDDEN_ATTR = 'data-wave23-prev-hidden';
  const ISOLATE_INERT_ATTR = 'data-wave23-prev-inert';

  const state = {
    modality: 'pointer',
    lastScreen: '',
    focusAfterRefresh: false,
    raf: 0,
  };

  function isElement(el){
    return !!el && typeof el === 'object';
  }

  function safeGet(el, attr){
    return isElement(el) && typeof el.getAttribute === 'function' ? el.getAttribute(attr) : null;
  }

  function safeSet(el, attr, value){
    if(isElement(el) && typeof el.setAttribute === 'function') el.setAttribute(attr, value);
  }

  function safeRemove(el, attr){
    if(isElement(el) && typeof el.removeAttribute === 'function') el.removeAttribute(attr);
  }

  function injectStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
      .skip-link{position:fixed;left:12px;top:12px;z-index:10001;padding:10px 14px;border-radius:12px;background:var(--text, #1a1a2e);color:#fff;text-decoration:none;font:700 13px/1.2 'Golos Text',system-ui,sans-serif;transform:translateY(-140%);opacity:0;transition:transform .18s ease,opacity .18s ease;box-shadow:0 12px 28px rgba(0,0,0,.2)}
      .skip-link:focus,.skip-link:focus-visible{transform:translateY(0);opacity:1;outline:3px solid var(--accent,#2563eb);outline-offset:2px}
      [role="button"]{cursor:pointer}
      [role="dialog"]:focus{outline:none}
      button,[role="button"],a.btn,.btn,.scard,.tbtn,.opt,.weak-btn,.qback,.hintt,.shpb,[data-theme-cycle]{min-height:44px;min-width:44px}
      input,select,textarea{font-size:16px}
      .wave23-focus-ring:focus-visible{outline:3px solid var(--accent,#2563eb);outline-offset:2px;box-shadow:0 0 0 5px rgba(37,99,235,.15)}
      html{scroll-behavior:smooth}
      @media (prefers-reduced-motion: reduce){
        *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
        .live-dot,.card,.spec-card,.spec-topic-card,.spec-quick-link,.spec-progress-fill,.spec-topic-bar-fill,.wave24-mobile-tip,.wave24-install-btn,.spec-card-arrow,.ca{animation:none!important;transition:none!important;transform:none!important}
        .wave24-bottom-nav a,.wave24-bottom-nav button,.spec-opt,.spec-btn,.spec-back,.spec-next{transition:none!important;transform:none!important}
      }
      @media (prefers-contrast: more){
        .skip-link{box-shadow:none;border:2px solid currentColor}
        button,[role="button"],a.btn,.btn,.scard,.tbtn,.opt,.weak-btn,.qback,.hintt,.shpb{border-width:2px!important}
        :focus-visible{outline:3px solid currentColor!important;outline-offset:2px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureLiveRegion(){
    let live = document.getElementById(LIVE_ID);
    if(!live){
      live = document.createElement('div');
      live.id = LIVE_ID;
      live.className = 'sr-only';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      document.body.appendChild(live);
    }
    return live;
  }

  function announce(text){
    const live = ensureLiveRegion();
    const msg = String(text || '').trim();
    if(!msg) return;
    live.textContent = '';
    setTimeout(() => { live.textContent = msg; }, 30);
  }
  window.wave23Announce = announce;

  function ensureSkipLink(){
    let link = document.getElementById(SKIP_ID);
    if(!link){
      link = document.createElement('a');
      link.id = SKIP_ID;
      link.href = '#' + MAIN_ID;
      link.className = 'skip-link';
      link.textContent = 'Перейти к содержимому';
      link.setAttribute('aria-label', 'Перейти к основному содержимому');
      if(document.body && typeof document.body.insertBefore === 'function') document.body.insertBefore(link, document.body.firstChild || null);
      else if(document.body && typeof document.body.appendChild === 'function') document.body.appendChild(link);
    }
  }

  function visible(el){
    if(!isElement(el)) return false;
    const style = window.getComputedStyle(el);
    const rects = typeof el.getClientRects === 'function' ? el.getClientRects() : [];
    return style.display !== 'none' && style.visibility !== 'hidden' && (el.offsetParent !== null || style.position === 'fixed' || style.position === 'sticky' || !!(rects && rects.length));
  }

  function readGlobal(name){
    try{
      return window.eval(`typeof ${name} !== \"undefined\" ? ${name} : null`);
    }catch(_){
      return null;
    }
  }

  function getFocusable(root){
    return [...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
      .filter(visible);
  }

  function textLabel(el){
    if(!isElement(el)) return 'Кнопка';
    const explicit = (safeGet(el, 'aria-label') || safeGet(el, 'title') || '').trim();
    if(explicit) return explicit;
    const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    if(/^←/.test(text)) return 'Назад';
    if(el.hasAttribute('data-theme-cycle')) return 'Переключить тему';
    if(!text || /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+$/u.test(text)){
      if((el.id || '').includes('theme')) return 'Переключить тему';
      if((el.id || '').includes('privacy')) return 'Настройка облака';
      return 'Кнопка';
    }
    return text.length > 120 ? text.slice(0, 117) + '…' : text;
  }

  function labelInputs(root=document){
    root.querySelectorAll('input,select,textarea').forEach((el) => {
      if(safeGet(el, INPUT_ATTR) === '1') return;
      const label = safeGet(el, 'aria-label') || safeGet(el, 'placeholder') || el.name || el.id || 'Поле ввода';
      if(!safeGet(el, 'aria-label')) safeSet(el, 'aria-label', label);
      if(el.id){
        const existing = document.querySelector(`label[for="${el.id}"]`);
        if(!existing){
          const sr = document.createElement('label');
          sr.className = 'sr-only';
          sr.setAttribute('for', el.id);
          sr.textContent = label;
          if(el.parentNode && typeof el.parentNode.insertBefore === 'function') el.parentNode.insertBefore(sr, el);
          else if(el.parentNode && typeof el.parentNode.appendChild === 'function') el.parentNode.appendChild(sr);
        }
      }
      el.setAttribute(INPUT_ATTR, '1');
    });
  }

  function bindRoleButton(el){
    if(!isElement(el)) return;
    if(safeGet(el, BTN_BOUND) === '1') return;
    const tag = el.tagName.toLowerCase();
    const semantic = /^(button|a|input|select|textarea|summary)$/.test(tag);
    if(!semantic){
      safeSet(el, 'role', safeGet(el, 'role') || 'button');
      if(!el.hasAttribute('tabindex')) el.tabIndex = 0;
    }
    el.classList.add('wave23-focus-ring');
    if(!safeGet(el, 'aria-label')) safeSet(el, 'aria-label', textLabel(el));
    if(!semantic){
      el.addEventListener('keydown', (event) => {
        if(event.key === 'Enter' || event.key === ' '){
          event.preventDefault();
          el.click();
        }
      });
    }
    el.setAttribute(BTN_BOUND, '1');
  }

  function decorateInteractive(root=document){
    const selector = [
      `[${BTN_ATTR}]`,
      '[onclick]',
      '.hintt',
      '.shpb',
      '.weak-btn',
      '.qback',
      '.opt',
      '[data-theme-cycle]'
    ].join(',');
    root.querySelectorAll(selector).forEach((el) => bindRoleButton(el));
    root.querySelectorAll('button,a,.scard,.tbtn,.btn,.weak-btn').forEach((el) => {
      el.classList.add('wave23-focus-ring');
      if(!safeGet(el, 'aria-label')) safeSet(el, 'aria-label', textLabel(el));
    });

    const toastHost = document.getElementById('trainer-toast-host');
    if(toastHost){
      toastHost.setAttribute('role', 'status');
      toastHost.setAttribute('aria-live', 'polite');
      toastHost.setAttribute('aria-atomic', 'true');
    }

    const feedback = document.getElementById('fba');
    if(feedback){
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      feedback.setAttribute('aria-atomic', 'true');
    }
    const hint = document.getElementById('ha');
    if(hint){
      hint.setAttribute('role', 'status');
      hint.setAttribute('aria-live', 'polite');
      hint.setAttribute('aria-atomic', 'true');
    }
    const pause = document.getElementById('pa');
    if(pause){
      pause.setAttribute('role', 'status');
      pause.setAttribute('aria-live', 'polite');
      pause.setAttribute('aria-atomic', 'true');
    }
  }

  function labelNavigation(nav, fallback){
    if(!isElement(nav)) return;
    if(!safeGet(nav, 'role')) safeSet(nav, 'role', 'navigation');
    if(!safeGet(nav, 'aria-label')) safeSet(nav, 'aria-label', fallback || 'Навигация');
  }

  function setListChildren(container, itemSelector){
    if(!isElement(container)) return;
    safeSet(container, 'role', 'list');
    const items = itemSelector ? container.querySelectorAll(itemSelector) : container.children;
    [...items].forEach((item) => {
      if(isElement(item) && !safeGet(item, 'role')) safeSet(item, 'role', 'listitem');
    });
  }

  function clearDialogIsolation(){
    document.querySelectorAll('[' + ISOLATE_ATTR + '="1"]').forEach((el) => {
      const prevHidden = safeGet(el, ISOLATE_HIDDEN_ATTR);
      if(prevHidden === 'null') safeRemove(el, 'aria-hidden');
      else if(prevHidden !== null) safeSet(el, 'aria-hidden', prevHidden);
      safeRemove(el, ISOLATE_HIDDEN_ATTR);
      const prevInert = safeGet(el, ISOLATE_INERT_ATTR);
      if('inert' in el) el.inert = prevInert === '1';
      safeRemove(el, ISOLATE_INERT_ATTR);
      safeRemove(el, ISOLATE_ATTR);
    });
  }

  function applyDialogIsolation(){
    clearDialogIsolation();
    const dialog = topDialog();
    if(!dialog || !document.body) return;
    const overlay = dialog.__wave23Overlay || dialog.closest('[' + DIALOG_ATTR + '="1"]') || dialog;
    const live = ensureLiveRegion();
    [...document.body.children].forEach((child) => {
      if(!isElement(child)) return;
      if(child === overlay || child === live) return;
      if(overlay && (overlay.contains(child) || child.contains(overlay))) return;
      safeSet(child, ISOLATE_ATTR, '1');
      const prevHidden = safeGet(child, 'aria-hidden');
      safeSet(child, ISOLATE_HIDDEN_ATTR, prevHidden === null ? 'null' : prevHidden);
      safeSet(child, 'aria-hidden', 'true');
      if('inert' in child){
        safeSet(child, ISOLATE_INERT_ATTR, child.inert ? '1' : '0');
        child.inert = true;
      }
    });
  }

  function setLandmarks(){
    const header = document.querySelector('header');
    if(header) header.setAttribute('role', 'banner');
    const footer = document.querySelector('footer, .foot');
    if(footer) footer.setAttribute('role', 'contentinfo');

    let main = document.getElementById(MAIN_ID) || document.querySelector('main');
    if(!main){
      main = document.querySelector('.scr.on .w') || document.querySelector('.scr.active .w') || document.querySelector('body > .w') || document.querySelector('body > div:not(.skip-link):not([id="'+LIVE_ID+'"])');
    }
    if(main && main !== document.body){
      if(!main.id) main.id = MAIN_ID;
      main.setAttribute('role', 'main');
      if(!safeGet(main, 'aria-label')) safeSet(main, 'aria-label', 'Основное содержимое');
      main.tabIndex = main.tabIndex || -1;
    }

    const navs = [...document.querySelectorAll('nav')];
    navs.forEach((nav, idx) => {
      let label = safeGet(nav, 'aria-label');
      if(!label){
        if(nav.id === 'wave24-bottom-nav') label = 'Быстрая мобильная навигация';
        else if(nav.classList.contains('spec-quick-nav')) label = 'Быстрые переходы по спецпредметам';
        else if(nav.classList.contains('quick-links')) label = 'Быстрые переходы';
        else label = idx === 0 ? 'Основная навигация' : ('Навигация ' + (idx + 1));
      }
      labelNavigation(nav, label);
    });

    document.querySelectorAll('.stats,.spec-stats').forEach((list) => setListChildren(list));
    document.querySelectorAll('.spec-tools').forEach((wrap, idx) => {
      safeSet(wrap, 'role', 'search');
      if(!safeGet(wrap, 'aria-label')) safeSet(wrap, 'aria-label', idx ? 'Поиск по темам' : 'Поиск по спецпредметам');
    });

    document.querySelectorAll('.scr').forEach((screen, idx) => {
      if(!safeGet(screen, 'role')) safeSet(screen, 'role', 'region');
      const title = screen.querySelector('h1,h2,h3');
      if(title){
        if(!title.id) title.id = `wave23-screen-title-${idx}`;
        safeSet(screen, 'aria-labelledby', title.id);
      }
    });
  }

  function updateScreens(){
    const screens = [...document.querySelectorAll('.scr')];
    if(!screens.length) return;
    const active = screens.find((screen) => screen.classList.contains('on') || screen.classList.contains('active')) || null;
    screens.forEach((screen) => {
      const on = screen === active;
      safeSet(screen, 'aria-hidden', on ? 'false' : 'true');
      if(on) safeSet(screen, 'aria-current', 'page');
      else safeRemove(screen, 'aria-current');
    });
    const key = active ? (active.id || active.className) : '';
    if(key && key !== state.lastScreen){
      state.lastScreen = key;
      if(state.modality === 'keyboard' || state.focusAfterRefresh){
        state.focusAfterRefresh = false;
        setTimeout(() => {
          const heading = active && active.querySelector('h1,h2,h3,[data-wave23-focus]');
          if(isElement(heading)){
            if(!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
            heading.focus({preventScroll:false});
          }
        }, 20);
      }
    }
  }

  function updateAnswerSemantics(){
    const group = document.getElementById('opts');
    if(group){
      group.setAttribute('role', 'radiogroup');
      if(!safeGet(group, 'aria-label')) safeSet(group, 'aria-label', 'Варианты ответа');
      [...group.querySelectorAll('.opt')].forEach((opt, idx) => {
        safeSet(opt, 'role', 'radio');
        const currentSel = readGlobal('sel');
        const selected = typeof currentSel === 'number' ? idx === currentSel : opt.classList.contains('ok') || opt.classList.contains('no');
        safeSet(opt, 'aria-checked', selected ? 'true' : 'false');
        if(opt.classList && opt.classList.contains && opt.classList.contains('dim')) safeSet(opt, 'aria-disabled', 'true');
        else safeRemove(opt, 'aria-disabled');
      });
    }
  }

  function markEnglishLang(){
    const englishActive = (() => {
      const currentSubject = readGlobal('cS');
      const diagSubject = readGlobal('curSubject');
      if(currentSubject && currentSubject.id === 'eng') return true;
      if(diagSubject && diagSubject.id === 'english') return true;
      const subjName = document.getElementById('quiz-subj-name');
      if(subjName && /англий/i.test(subjName.textContent || '')) return true;
      const active = document.querySelector('.scr.on,.scr.active');
      if(active && /англий/i.test(active.textContent || '')) return true;
      return false;
    })();
    ['tc','qb','opts','qcd','eng-level-block','q-txt','q-topic'].forEach((id) => {
      const el = document.getElementById(id);
      if(!el) return;
      if(englishActive) safeSet(el, 'lang', 'en');
      else if(safeGet(el, 'lang') === 'en') safeRemove(el, 'lang');
    });
  }

  function decorateDialogs(){
    const overlays = Array.from((document.body && document.body.children) || []).filter((node) => {
      if(!isElement(node) || !node.style || node.style.position !== 'fixed') return false;
      if(node === document.getElementById(SKIP_ID) || node.id === LIVE_ID || node.id === 'trainer-theme-btn' || node.id === 'trainer-toast-host') return false;
      const inset = (node.style.inset || '').replace(/\s+/g, '');
      const bg = String(node.style.background || '');
      const isBackdrop = inset === '0px' || inset === '0' || /rgba\(0,0,0/.test(bg) || (node.style.top === '0px' && node.style.left === '0px' && node.style.right === '0px' && node.style.bottom === '0px');
      const centered = node.style.alignItems === 'center' || node.style.justifyContent === 'center';
      return isBackdrop && centered;
    });
    overlays.forEach((overlay) => {
      if(safeGet(overlay, DIALOG_ATTR) === '1') return;
      safeSet(overlay, DIALOG_ATTR, '1');
      overlay.__wave23PrevFocus = isElement(document.activeElement) ? document.activeElement : null;
      const panel = [...(overlay.children || [])].find((node) => isElement(node)) || overlay;
      panel.__wave23Overlay = overlay;
      panel.__wave23PrevFocus = overlay.__wave23PrevFocus;
      safeSet(panel, 'role', 'dialog');
      safeSet(panel, 'aria-modal', 'true');
      panel.tabIndex = -1;
      const title = panel.querySelector('h1,h2,h3,h4');
      if(title){
        if(!title.id) title.id = 'wave23-dialog-title-' + Math.random().toString(36).slice(2,8);
        safeSet(panel, 'aria-labelledby', title.id);
      }else if(!safeGet(panel, 'aria-label')){
        safeSet(panel, 'aria-label', 'Диалоговое окно');
      }
      setTimeout(() => {
        const focusables = getFocusable(panel);
        (focusables[0] || panel).focus({preventScroll:false});
      }, 20);
      const dialogKeydown = (event) => {
        if(event.key === 'Escape'){
          event.preventDefault();
          overlay.remove();
          restoreDialogFocus(overlay);
          return;
        }
        if(event.key === 'Tab'){
          const focusables = getFocusable(panel);
          if(!focusables.length){
            event.preventDefault();
            panel.focus();
            return;
          }
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if(event.shiftKey && document.activeElement === first){
            event.preventDefault();
            last.focus();
          }else if(!event.shiftKey && document.activeElement === last){
            event.preventDefault();
            first.focus();
          }
        }
      };
      panel.addEventListener('keydown', dialogKeydown, true);
    });
  }

  function topDialog(){
    const panels = [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].filter(visible);
    return panels.length ? panels[panels.length - 1] : null;
  }

  function restoreDialogFocus(removed){
    if(!isElement(removed)) return;
    if(!topDialog()) clearDialogIsolation();
    const prev = removed.__wave23PrevFocus || removed.querySelector('[role="dialog"]')?.__wave23PrevFocus;
    if(isElement(prev) && (!document.contains || document.contains(prev))) {
      setTimeout(() => prev.focus({preventScroll:false}), 20);
    }
  }

  function onGlobalKeydown(event){
    if(event.key === 'Tab') state.modality = 'keyboard';
    if(event.key === 'Enter' || event.key === ' ') state.focusAfterRefresh = true;
    const dialog = topDialog();
    if(dialog){
      if(event.key === 'Escape'){
        event.preventDefault();
        const overlay = dialog.__wave23Overlay || dialog.closest(`[${DIALOG_ATTR}="1"]`) || dialog.parentElement;
        if(overlay && overlay.remove) overlay.remove();
        restoreDialogFocus(overlay || dialog);
        announce('Диалог закрыт');
        return;
      }
      if(event.key === 'Tab'){
        const focusables = getFocusable(dialog);
        if(!focusables.length){
          event.preventDefault();
          dialog.focus();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if(event.shiftKey && document.activeElement === first){
          event.preventDefault();
          last.focus();
        }else if(!event.shiftKey && document.activeElement === last){
          event.preventDefault();
          first.focus();
        }
      }
    }
  }

  function bindGlobals(){
    document.addEventListener('keydown', onGlobalKeydown, true);
    document.addEventListener('mousedown', () => { state.modality = 'pointer'; }, true);
    document.addEventListener('touchstart', () => { state.modality = 'touch'; }, { capture:true, passive:true });
    document.addEventListener('click', (event) => {
      const target = event.target;
      if(!isElement(target)) return;
      const text = (target.innerText || target.textContent || '').trim();
      if(/верно|неверно|правильно|неправильно/i.test(text)) announce(text);
    }, true);
  }

  function patchFunctions(){
    ['go','openSubj','goSubj','startQuiz','nextQ','render','renderProg','refreshMain','showBadges','showHallOfFame','showRushRecords','showBackupModal','startDiag','showResult','selectOpt'].forEach((name) => {
      const fn = window[name];
      if(typeof fn !== 'function' || fn.__wave23Wrapped) return;
      const wrapped = function(){
        const out = fn.apply(this, arguments);
        scheduleRefresh();
        return out;
      };
      wrapped.__wave23Wrapped = true;
      window[name] = wrapped;
    });
  }

  function refresh(){
    injectStyle();
    ensureLiveRegion();
    ensureSkipLink();
    labelInputs(document);
    decorateInteractive(document);
    patchFunctions();
    setLandmarks();
    updateScreens();
    updateAnswerSemantics();
    decorateDialogs();
    applyDialogIsolation();
    markEnglishLang();
    const host = document.getElementById('trainer-toast-host');
    if(host){
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      host.setAttribute('aria-atomic', 'true');
    }
  }

  function scheduleRefresh(){
    if(state.raf) return;
    state.raf = window.requestAnimationFrame(() => {
      state.raf = 0;
      refresh();
    });
  }
  window.wave23A11yRefresh = scheduleRefresh;

  function observe(){
    if(typeof MutationObserver === 'undefined') return;
    const bodyObserver = new MutationObserver((mutations) => {
      let needs = false;
      for(const mutation of mutations){
        if(mutation.type === 'childList'){
          mutation.removedNodes.forEach((node) => {
            if(isElement(node) && safeGet(node, DIALOG_ATTR) === '1') restoreDialogFocus(node);
          });
          if(mutation.addedNodes.length || mutation.removedNodes.length) needs = true;
        }
      }
      if(needs) scheduleRefresh();
    });
    bodyObserver.observe(document.body, {childList: true, subtree: true});

    if(document.querySelector('.scr')){
      const screenObserver = new MutationObserver(() => scheduleRefresh());
      document.querySelectorAll('.scr').forEach((screen) => screenObserver.observe(screen, {attributes: true, attributeFilter: ['class']}));
    }
  }

  function init(){
    refresh();
    bindGlobals();
    observe();
    announce('Доступность включена');
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();

;
/* --- wave24_mobile.js --- */
(() => {
  const STYLE_ID = 'wave24-mobile-style';
  const NAV_ID = 'wave24-bottom-nav';
  const INSTALL_ID = 'wave24-install-btn';
  const state = {
    page: null,
    installPrompt: null,
    wakeLock: null,
    wakeRequested: false,
    observer: null,
    touch: null,
  };

  function $(sel, root=document){ return root.querySelector(sel); }
  function $$(sel, root=document){ return [...root.querySelectorAll(sel)]; }
  function visible(el){
    if(!el || !(el instanceof Element)) return false;
    const st = getComputedStyle(el);
    return st.display !== 'none' && st.visibility !== 'hidden';
  }
  function compact(){ return window.matchMedia('(max-width: 1023px)').matches; }
  function tablet(){ return window.matchMedia('(min-width: 768px)').matches; }
  function standalone(){
    return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || !!navigator.standalone;
  }
  function pageType(){
    if(state.page) return state.page;
    if(typeof window.GRADE_NUM !== 'undefined' && window.GRADE_NUM !== null) return state.page = 'grade';
    var pathName = '';
    try { pathName = String((window.location && window.location.pathname) || '').toLowerCase().split('/').pop() || ''; } catch(_) {}
    if(pathName === 'dashboard.html') return state.page = 'dashboard';
    if(pathName === 'diagnostic.html') return state.page = 'diagnostic';
    if(pathName === 'tests.html') return state.page = 'tests';
    if(pathName === 'index.html' || pathName === '') return state.page = 'index';
    const title = (document.title || '').toLowerCase();
    if(title.includes('родитель')) return state.page = 'dashboard';
    if(title.includes('портрет') || title.includes('тесты')) return state.page = 'tests';
    if(title.includes('диагностика')) return state.page = 'diagnostic';
    return state.page = 'index';
  }

  function injectStyle(){
    if(typeof document === 'undefined' || !document.head) return;
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      :root{--wave24-nav-base-h:60px;--wave24-nav-safe-b:env(safe-area-inset-bottom,0px);--wave24-nav-total-h:calc(var(--wave24-nav-base-h) + var(--wave24-nav-safe-b))}
      body{overflow-x:hidden}
      body.wave24-mobile-shell{padding-bottom:calc(var(--wave24-nav-total-h) + 12px) !important;}
      body.wave24-save-data, body.wave24-save-data button, body.wave24-save-data input, body.wave24-save-data select, body.wave24-save-data textarea{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif !important;}
      body.wave24-mobile-shell header,body.wave24-mobile-shell .header{background:var(--bg,#f5f3ee)!important;color:var(--text,#1a1a2e)!important;border-bottom:1px solid var(--border,#e2e0d8)}
      body.wave24-mobile-shell header h1,body.wave24-mobile-shell header p,body.wave24-mobile-shell .header h1,body.wave24-mobile-shell .header p{color:inherit!important}
      @media (max-width: 1023px){
        html,body{overscroll-behavior-y:contain;scroll-padding-top:calc(72px + env(safe-area-inset-top,0));}
      }
      .wave24-install-btn{position:fixed;right:12px;bottom:calc(var(--wave24-nav-total-h) + 12px);z-index:9998;display:none!important;align-items:center;gap:8px;padding:10px 14px;border:none;border-radius:999px;background:var(--text,#1a1a2e);color:#fff;font:700 12px/1.2 'Golos Text',system-ui,sans-serif;box-shadow:0 12px 28px rgba(0,0,0,.22);cursor:pointer;-webkit-appearance:none;touch-action:manipulation}
      .wave24-install-btn:active{transform:scale(.98)}
      .wave24-install-btn[hidden]{display:none!important}
      .wave24-bottom-nav{position:fixed;left:0;right:0;bottom:0;z-index:9997;display:flex;gap:8px;align-items:stretch;box-sizing:border-box;height:var(--wave24-nav-total-h);min-height:var(--wave24-nav-total-h);max-height:var(--wave24-nav-total-h);padding:0 max(12px, env(safe-area-inset-right,0px)) var(--wave24-nav-safe-b) max(12px, env(safe-area-inset-left,0px));margin:0;background:rgba(245,243,238,.96);backdrop-filter:blur(14px);border-top:1px solid var(--border,#e2e0d8);box-shadow:0 -8px 28px rgba(0,0,0,.08)}
      html[data-theme="dark"] .wave24-bottom-nav{background:rgba(20,20,32,.96)}
      .wave24-bottom-nav a,.wave24-bottom-nav button{flex:1;min-width:0;height:var(--wave24-nav-base-h);min-height:var(--wave24-nav-base-h);max-height:var(--wave24-nav-base-h);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:6px 6px;border:none;border-radius:14px;background:transparent;color:var(--muted,#6b6a74);font:700 11px/1.1 'Golos Text',system-ui,sans-serif;text-decoration:none;cursor:pointer;-webkit-appearance:none;touch-action:manipulation}
      .wave24-bottom-nav .wave24-ic{display:block;width:24px;height:24px;min-height:24px;flex:0 0 24px;line-height:24px;text-align:center;overflow:hidden}.wave24-bottom-nav .wave24-ic svg{display:block;width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      .wave24-bottom-nav .is-active{background:var(--abg,#dbeafe);color:var(--accent,#2563eb)}
      .wave24-bottom-nav .is-quiet{opacity:.75}
      .wave24-mobile-tip{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--wave24-nav-total-h) + 12px);z-index:9996;background:var(--card,#fff);color:var(--muted,#6b6a74);border:1px solid var(--border,#e2e0d8);border-radius:999px;padding:8px 12px;font:600 11px/1.2 'Golos Text',system-ui,sans-serif;box-shadow:0 10px 24px rgba(0,0,0,.08);opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease}
      .wave24-mobile-tip.show{opacity:1;transform:translateX(-50%) translateY(-4px)}
      .wave24-has-bottom-nav .w{padding-bottom:12px;}
      .wave24-has-bottom-nav header,.wave24-has-bottom-nav .header{padding-right:max(16px, env(safe-area-inset-right,0));padding-left:max(16px, env(safe-area-inset-left,0));}
      @media (max-width: 1023px){
        body.wave24-mobile-shell .w{padding-left:max(14px, env(safe-area-inset-left,0));padding-right:max(14px, env(safe-area-inset-right,0));}
        body.wave24-mobile-shell header{padding-left:max(14px, env(safe-area-inset-left,0));padding-right:max(14px, env(safe-area-inset-right,0));}
        #wave21-main-actions .btn,#wave22-dashboard-actions .btn{min-height:46px}
      }
      @media (min-width: 768px){
        body.wave24-mobile-shell{padding-bottom:calc(var(--wave24-nav-total-h) + 12px) !important;}
        body.wave24-mobile-shell .w{max-width:980px !important;}
        #sg,#tl,.subj-grid,.grid,.stats,.subject-stack,#wave22-insights,#wave22-subjects,.wave22-subject-breakdown{display:grid !important;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}
        .subject-stack>.subject-card,#wave22-insights>.chart-card,#wave22-subjects>.chart-card{margin:0 !important}
      }
      @media (min-width: 1200px){
        #sg,#tl,.grid{grid-template-columns:repeat(3,minmax(0,1fr));}
      }
      @media (max-width: 767px){
        .wave24-bottom-nav{display:flex}
      }
      @media (min-width: 1024px){
        html,body{overscroll-behavior-y:auto;}
        .wave24-bottom-nav,.wave24-install-btn,.wave24-mobile-tip{display:none !important}
        body.wave24-mobile-shell{padding-bottom:env(safe-area-inset-bottom,0) !important;}
      }
      @media (orientation: landscape) and (max-height: 560px){
        .wave24-bottom-nav{padding-top:6px;padding-bottom:calc(6px + env(safe-area-inset-bottom,0));}
        .wave24-bottom-nav a,.wave24-bottom-nav button{padding:6px 6px;font-size:10px}
        .wave24-bottom-nav .wave24-ic{width:22px;height:22px;min-height:22px;flex:0 0 22px}.wave24-bottom-nav .wave24-ic svg{width:22px;height:22px}
        .wave24-install-btn{bottom:calc(var(--wave24-nav-total-h) + 12px);padding:8px 12px}
      }
    `;
    document.head.appendChild(style);
  }

  function applyConnectionMode(){
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if(!conn) return;
    const slow = /2g/.test(conn.effectiveType || '') || !!conn.saveData;
    if(conn.saveData && document.body && document.body.classList) document.body.classList.add('wave24-save-data');
    if(slow && typeof window.showToast === 'function'){
      window.showToast(conn.saveData ? 'Экономия трафика: облегчённый режим' : 'Медленное соединение: упрощённый режим');
    }
  }

  function iconSvg(name){
    switch(name){
      case 'home':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"></path><path d="M5 9.5V21h14V9.5"></path></svg>';
      case 'diagnostic':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"></rect><path d="M8 7h8"></path><path d="M8 11h8"></path><path d="M8 15h5"></path></svg>';
      case 'tests':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6"></path><path d="M10 3v5.3l-4.5 7.4A4 4 0 0 0 8.9 22h6.2a4 4 0 0 0 3.4-6.3L14 8.3V3"></path></svg>';
      case 'spec':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="11" rx="2"></rect><path d="M9 7V5a3 3 0 0 1 6 0v2"></path><path d="M4 11h16"></path></svg>';
      case 'panel':
      case 'progress':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V10"></path><path d="M12 19V5"></path><path d="M19 19v-8"></path><path d="M3 21h18"></path></svg>';
      case 'profile':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 20a8 8 0 0 1 16 0"></path></svg>';
      case 'classes':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1.5"></rect><rect x="14" y="4" width="6" height="6" rx="1.5"></rect><rect x="4" y="14" width="6" height="6" rx="1.5"></rect><rect x="14" y="14" width="6" height="6" rx="1.5"></rect></svg>';
      default:
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle></svg>';
    }
  }

  function navItems(){
    switch(pageType()){
      case 'grade':
        return [
          { key:'home', icon:'home', label:'Главная', action:()=>window.go && window.go('main') },
          { key:'progress', icon:'progress', label:'Прогресс', action:()=>window.go && window.go('prog') },
          { key:'profile', icon:'profile', label:'Профиль', action:()=>window.showHallOfFame && window.showHallOfFame() },
          { key:'classes', icon:'classes', label:'Классы', action:()=>window.showClassSelect && window.showClassSelect() },
        ];
      case 'dashboard':
        return [
          { key:'home', icon:'home', label:'Главная', href:'index.html' },
          { key:'diagnostic', icon:'diagnostic', label:'Диагностика', href:'diagnostic.html' },
          { key:'tests', icon:'tests', label:'Тесты', href:'tests.html' },
          { key:'dashboard', icon:'panel', label:'Панель', href:'dashboard.html' },
        ];
      case 'diagnostic':
        return [
          { key:'home', icon:'home', label:'Главная', href:'index.html' },
          { key:'diagnostic', icon:'diagnostic', label:'Диагностика', href:'diagnostic.html' },
          { key:'tests', icon:'tests', label:'Тесты', href:'tests.html' },
          { key:'dashboard', icon:'panel', label:'Панель', href:'dashboard.html' },
        ];
      case 'tests':
        return [
          { key:'home', icon:'home', label:'Главная', href:'index.html' },
          { key:'diagnostic', icon:'diagnostic', label:'Диагностика', href:'diagnostic.html' },
          { key:'tests', icon:'tests', label:'Тесты', href:'tests.html' },
          { key:'dashboard', icon:'panel', label:'Панель', href:'dashboard.html' },
        ];
      default:
        return [
          { key:'home', icon:'home', label:'Главная', href:'index.html' },
          { key:'diagnostic', icon:'diagnostic', label:'Диагностика', href:'diagnostic.html' },
          { key:'tests', icon:'tests', label:'Тесты', href:'tests.html' },
          { key:'dashboard', icon:'panel', label:'Панель', href:'dashboard.html' },
        ];
    }
  }

  function focusNavItem(node, mode){
    const nav = node && node.parentElement;
    if(!nav) return;
    const items = $$('[data-key]', nav);
    const idx = items.indexOf(node);
    if(idx === -1 || !items.length) return;
    let next = idx;
    if(mode === 'home') next = 0;
    else if(mode === 'end') next = items.length - 1;
    else next = (idx + mode + items.length) % items.length;
    const target = items[next];
    if(target && target.focus) target.focus();
  }

  function createNavNode(item){
    const node = item.href ? document.createElement('a') : document.createElement('button');
    node.className = 'wave24-nav-item';
    node.dataset.key = item.key;
    if(item.href) node.href = item.href;
    else node.type = 'button';
    node.setAttribute('aria-label', item.label);
    node.innerHTML = `<span class="wave24-ic" aria-hidden="true">${iconSvg(item.icon)}</span><span class="wave24-tx">${item.label}</span>`;
    if(item.action) node.addEventListener('click', item.action);
    node.addEventListener('keydown', (event) => {
      if(event.key === 'ArrowRight' || event.key === 'ArrowDown'){
        event.preventDefault();
        focusNavItem(node, 1);
      }else if(event.key === 'ArrowLeft' || event.key === 'ArrowUp'){
        event.preventDefault();
        focusNavItem(node, -1);
      }else if(event.key === 'Home'){
        event.preventDefault();
        focusNavItem(node, 'home');
      }else if(event.key === 'End'){
        event.preventDefault();
        focusNavItem(node, 'end');
      }
    });
    return node;
  }

  function injectBottomNav(){
    if(typeof document === 'undefined' || !document.body) return;
    let nav = document.getElementById(NAV_ID);
    if(!nav){
      nav = document.createElement('nav');
      nav.id = NAV_ID;
      nav.className = 'wave24-bottom-nav';
      nav.setAttribute('aria-label', 'Быстрая мобильная навигация');
      if(document.body && document.body.appendChild) document.body.appendChild(nav);
    }
    nav.innerHTML = '';
    navItems().forEach(item => nav.appendChild(createNavNode(item)));
    if(document.body && document.body.classList) document.body.classList.add('wave24-mobile-shell', 'wave24-has-bottom-nav');
    updateNavState();
  }

  function activeNavKey(){
    const type = pageType();
    if(type === 'grade'){
      if($('#s-prog.on')) return 'progress';
      return 'home';
    }
    if(type === 'dashboard') return 'dashboard';
    if(type === 'diagnostic') return 'diagnostic';
    if(type === 'tests') return 'tests';
    return 'home';
  }

  function updateNavState(){
    const nav = document.getElementById(NAV_ID);
    if(!nav) return;
    const active = activeNavKey();
    $$('[data-key]', nav).forEach((el) => {
      el.classList.toggle('is-active', el.dataset.key === active);
      if(el.dataset.key !== active && pageType()==='grade' && (el.dataset.key === 'profile' || el.dataset.key === 'classes')){
        el.classList.add('is-quiet');
      } else {
        el.classList.remove('is-quiet');
      }
      const label = ((el.querySelector('.wave24-tx') || {}).textContent || el.textContent || '').replace(/\s+/g, ' ').trim();
      if(el.dataset.key === active){
        el.setAttribute('aria-current', 'page');
        if(label) el.setAttribute('aria-label', label + ', текущая страница');
      }
      else {
        el.removeAttribute('aria-current');
        if(label) el.setAttribute('aria-label', label);
      }
    });
  }

  async function requestWakeLock(){
    if(state.wakeRequested || state.wakeLock || !('wakeLock' in navigator)) return;
    state.wakeRequested = true;
    try{
      const lock = await navigator.wakeLock.request('screen');
      state.wakeLock = lock;
      lock.addEventListener('release', () => {
        if(state.wakeLock === lock) state.wakeLock = null;
      });
    }catch(_){
    }finally{
      state.wakeRequested = false;
    }
  }

  async function releaseWakeLock(){
    if(!state.wakeLock) return;
    const lock = state.wakeLock;
    state.wakeLock = null;
    try{ await lock.release(); }catch(_){ }
  }

  function shouldWake(){
    if(document.hidden) return false;
    const type = pageType();
    if(type === 'grade') return !!$('#s-play.on');
    if(type === 'diagnostic') return !!$('#s-quiz.on');
    return false;
  }

  function syncWakeLock(){
    if(shouldWake()) requestWakeLock();
    else releaseWakeLock();
  }

  function currentGradeBackAction(){
    if($('#s-theory.on') && typeof window.goSubj === 'function') return () => window.goSubj();
    if($('#s-subj.on') && typeof window.go === 'function') return () => window.go('main');
    if($('#s-prog.on') && typeof window.go === 'function') return () => window.go('main');
    if($('#s-info.on') && typeof window.go === 'function') return () => window.go('main');
    if($('#s-result.on')) return () => window.globalMix ? window.go && window.go('main') : window.goSubj && window.goSubj();
    return null;
  }

  function swipeBack(){
    const type = pageType();
    if(type === 'grade'){
      const action = currentGradeBackAction();
      if(action){ action(); return true; }
      return false;
    }
    if(type === 'tests' && typeof window.go === 'function' && !$('#s-menu.active')){ window.go('menu'); return true; }
    if(type === 'diagnostic' && typeof window.go === 'function' && $('#s-result.on')){ window.go('select'); return true; }
    return false;
  }

  function swipeNext(){
    const type = pageType();
    if(type === 'grade' && $('#s-play.on') && window.sel !== null && !window.rushMode && !window.diagMode && typeof window.nextQ === 'function'){
      window.nextQ();
      return true;
    }
    if(type === 'diagnostic'){
      const nextBtn = $('.next-btn.show');
      if(nextBtn){ nextBtn.click(); return true; }
    }
    return false;
  }

  function ensureTip(){
    if(typeof document === 'undefined' || !document.body) return null;
    let tip = $('.wave24-mobile-tip');
    if(!tip){
      tip = document.createElement('div');
      tip.className = 'wave24-mobile-tip';
      tip.setAttribute('aria-hidden', 'true');
      document.body.appendChild(tip);
    }
    return tip;
  }

  let tipTimer = 0;
  function showTip(text){
    const tip = ensureTip();
    if(!tip) return;
    tip.textContent = text;
    tip.classList.add('show');
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => tip.classList.remove('show'), 1400);
  }

  function bindGestures(){
    document.addEventListener('touchstart', (event) => {
      if(!compact()) return;
      if(event.touches.length !== 1) return;
      const t = event.touches[0];
      const target = event.target;
      if(target && target.closest && target.closest('input,textarea,select,[contenteditable="true"]')) return;
      state.touch = { x: t.clientX, y: t.clientY, at: Date.now() };
    }, { passive: true });

    document.addEventListener('touchend', (event) => {
      if(!compact() || !state.touch) return;
      const changed = event.changedTouches && event.changedTouches[0];
      if(!changed) return;
      const dx = changed.clientX - state.touch.x;
      const dy = changed.clientY - state.touch.y;
      const dt = Date.now() - state.touch.at;
      state.touch = null;
      if(dt > 900) return;
      if(Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 1.3 || Math.abs(dy) > 42) return;
      if(dx > 0){
        if(swipeBack()) showTip('← Назад');
      }else if(dx < 0){
        if(swipeNext()) showTip('Следующий →');
      }
    }, { passive: true });
  }

  function bindInstallPrompt(){
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      state.installPrompt = event;
      syncInstallChip();
    });
    window.addEventListener('appinstalled', () => {
      state.installPrompt = null;
      syncInstallChip();
    });
  }

  async function promptInstall(){
    if(!state.installPrompt) return false;
    try{
      await state.installPrompt.prompt();
      await state.installPrompt.userChoice;
      state.installPrompt = null;
      syncInstallChip();
      return true;
    }catch(_){
      return false;
    }
  }

  function syncInstallChip(){
    if(typeof document === 'undefined' || !document.body) return;
    let btn = document.getElementById(INSTALL_ID);
    if(!btn){
      btn = document.createElement('button');
      btn.id = INSTALL_ID;
      btn.type = 'button';
      btn.className = 'wave24-install-btn';
      btn.textContent = '⬇ Установить';
      btn.hidden = true;
      btn.addEventListener('click', () => { promptInstall(); });
      if(document.body && document.body.appendChild) document.body.appendChild(btn);
    }
    btn.hidden = true;
    btn.style.display = 'none';
    btn.setAttribute('aria-hidden', 'true');
  }

  function patchFunctions(){
    ['go','startQuiz','endSession','showHallOfFame','showClassSelect','showAbout'].forEach((name) => {
      const orig = window[name];
      if(typeof orig !== 'function' || orig.__wave24wrapped) return;
      const wrapped = function(...args){
        const out = orig.apply(this, args);
        setTimeout(() => { updateNavState(); syncWakeLock(); }, 20);
        return out;
      };
      wrapped.__wave24wrapped = true;
      window[name] = wrapped;
    });
    if(pageType() === 'diagnostic'){
      ['startDiag','nextQ','showResult'].forEach((name) => {
        const orig = window[name];
        if(typeof orig !== 'function' || orig.__wave24wrapped) return;
        const wrapped = function(...args){
          const out = orig.apply(this, args);
          setTimeout(() => { updateNavState(); syncWakeLock(); }, 20);
          return out;
        };
        wrapped.__wave24wrapped = true;
        window[name] = wrapped;
      });
    }
  }

  function observeScreens(){
    const nodes = $$('.scr');
    if(state.observer) state.observer.disconnect();
    if(!nodes.length || typeof MutationObserver === 'undefined') return;
    state.observer = new MutationObserver(() => {
      updateNavState();
      syncWakeLock();
    });
    nodes.forEach((node) => state.observer.observe(node, { attributes: true, attributeFilter: ['class'] }));
    document.addEventListener('visibilitychange', syncWakeLock, { passive: true });
  }

  function exposeDebug(){
    window.wave24Debug = {
      pageType,
      activeNavKey,
      hasBottomNav: () => !!document.getElementById(NAV_ID),
      navLabels: () => $$('#'+NAV_ID+' [data-key]').map(el => el.textContent.replace(/\s+/g, ' ').trim()),
      swipeBack,
      swipeNext,
      tabletGrid: () => {
        const target = $('#sg') || $('#tl') || $('#wave22-insights') || $('.subject-stack') || $('.grid') || $('.subj-grid');
        if(!target) return { display: null, columns: 0 };
        const cs = getComputedStyle(target);
        return { display: cs.display, columns: (cs.gridTemplateColumns || '').split(' ').filter(Boolean).length };
      },
      wakeWanted: shouldWake,
      installVisible: () => !!document.getElementById(INSTALL_ID) && !document.getElementById(INSTALL_ID).hidden,
    };
  }

  function init(){
    if(typeof document === 'undefined' || !document.body || !document.body.classList) return;
    injectStyle();
    document.body.classList.add('wave24-mobile-shell');
    applyConnectionMode();
    injectBottomNav();
    bindInstallPrompt();
    bindGestures();
    patchFunctions();
    observeScreens();
    updateNavState();
    syncWakeLock();
    syncInstallChip();
    exposeDebug();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

;
/* --- wave26_quality.js --- */
(function(){
  if(window.__wave26QualityBooted) return;
  window.__wave26QualityBooted = true;

  function esc(v){
    return String(v ?? '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  function cleanValue(v){
    return typeof v === 'string' ? v.replace(/\s+/g,' ').trim() : v;
  }

  function hasMeaningfulHint(v){
    return typeof v === 'string' && v.replace(/\s+/g,' ').trim().length >= 6;
  }

  const GENERIC_RE = /^(как правильно\??|правильное ударение:?|выбери(?:те)? (?:верный|правильный) вариант:?|укажите(?:\s+)?(?:верный|правильный) вариант:?|найди(?:те)? ошибк[ауи]:?|что выведет программа\??)$/i;

  function buildPromptDescriptor(payload){
    const question = cleanValue(payload && payload.question) || '';
    const tag = cleanValue(payload && payload.tag) || '';
    const options = Array.isArray(payload && payload.options)
      ? payload.options.map(cleanValue).filter(v => v !== undefined && v !== null && String(v).trim() !== '')
      : [];
    const generic = GENERIC_RE.test(question) || question.length < 12;
    const preview = options.slice(0,2).map(v => String(v)).join(' / ');
    const parts = [];
    if(generic && tag) parts.push(tag);
    if(generic && preview) parts.push(preview);
    const context = parts.join(' · ');
    const journalLabel = generic && context
      ? `${question} · ${context}`
      : (tag && question.toLowerCase().indexOf(tag.toLowerCase()) === -1 && question.length < 26
          ? `${question} · ${tag}`
          : question);
    return { question, tag, options, generic, preview, context, journalLabel };
  }

  function defaultHintFor(payload){
    const d = buildPromptDescriptor(payload || {});
    const answer = cleanValue(payload && payload.answer);
    const topicPart = d.tag ? `Тема: ${d.tag}. ` : '';
    const answerPart = answer !== undefined && answer !== null && String(answer).trim() !== ''
      ? `Верный ответ: ${answer}.`
      : 'Подумай, какое правило здесь срабатывает.';
    return `${topicPart}${answerPart}`;
  }

  function findTheoryByTag(tag){
    if(!tag || !Array.isArray(window.SUBJ)) return '';
    for(const subj of SUBJ){
      for(const topic of (subj.tops || [])){
        if(topic && topic.nm === tag) return topic.th || '';
      }
    }
    return '';
  }

  function injectStyles(){
    if(document.getElementById('wave26-quality-style')) return;
    const style = document.createElement('style');
    style.id = 'wave26-quality-style';
    style.textContent = `
      .wave26-qmeta{margin-top:8px;font-size:11px;color:var(--muted);line-height:1.5}
      .wave26-x{margin-top:10px;padding:12px 14px;border:1px solid var(--border);border-radius:14px;background:color-mix(in srgb,var(--card) 92%, var(--bg));text-align:left}
      .wave26-xhead{font-weight:800;font-size:13px;margin-bottom:6px;color:var(--text)}
      .wave26-xbody{font-size:12px;line-height:1.55;color:var(--text)}
      .wave26-xmeta{display:flex;flex-wrap:wrap;gap:6px 8px;margin-top:8px}
      .wave26-xmeta span{font-size:10px;color:var(--muted);padding:4px 8px;border-radius:999px;background:var(--chip)}
      .wave26-xactions{margin-top:10px}
      .wave26-xbtn{padding:8px 12px;border:none;border-radius:10px;background:var(--text);color:var(--bg);font-weight:700;font-size:12px;cursor:pointer;font-family:Golos Text,sans-serif}
    `;
    document.head.appendChild(style);
  }

  function patchMkQ(){
    if(typeof mkQ !== 'function' || mkQ._wave26Patched) return;
    const orig = mkQ;
    mkQ = function(q,a,o,h,t,c,b,code,isMath){
      const cleanedQuestion = cleanValue(q);
      const cleanedAnswer = cleanValue(a);
      const cleanedOptions = Array.isArray(o) ? o.map(cleanValue) : o;
      const cleanedHint = hasMeaningfulHint(h) ? cleanValue(h) : defaultHintFor({question: cleanedQuestion, answer: cleanedAnswer, tag: t, options: cleanedOptions});
      const row = orig(cleanedQuestion, cleanedAnswer, cleanedOptions, cleanedHint, t, c, b, code, isMath);
      row._wave26 = buildPromptDescriptor(row);
      if(!hasMeaningfulHint(row.hint)) row.hint = defaultHintFor(row);
      return row;
    };
    mkQ._wave26Patched = true;
    mkQ._wave26Orig = orig;
  }

  function applyQuestionContext(){
    if(typeof prob === 'undefined' || !prob) return;
    prob._wave26 = prob._wave26 || buildPromptDescriptor(prob);
    const qb = document.getElementById('qb');
    if(!qb) return;
    qb.textContent = prob._wave26.question;
    let meta = document.getElementById('wave26-qmeta');
    if(!meta){
      meta = document.createElement('div');
      meta.id = 'wave26-qmeta';
      meta.className = 'wave26-qmeta';
      qb.insertAdjacentElement('afterend', meta);
    }
    if(prob._wave26.context){
      meta.textContent = prob._wave26.context;
      meta.style.display = 'block';
    }else{
      meta.textContent = '';
      meta.style.display = 'none';
    }
  }

  function enrichExplanation(){
    const slot = document.getElementById('fba');
    if(!slot) return;
    const old = slot.querySelector('.wave26-x');
    if(old) old.remove();
    if(typeof prob === 'undefined' || !prob) return;
    if(typeof sel === 'undefined' || sel === null) return;
    if(typeof rushMode !== 'undefined' && rushMode) return;

    const correct = sel === prob.answer;
    const d = prob._wave26 || buildPromptDescriptor(prob);
    const hint = hasMeaningfulHint(prob.hint) ? cleanValue(prob.hint) : defaultHintFor(prob);
    const theory = findTheoryByTag(prob.tag);
    const card = document.createElement('div');
    card.className = 'wave26-x';
    card.innerHTML = `
      <div class="wave26-xhead">${correct ? 'Почему это верно' : 'Почему это неверно'}</div>
      <div class="wave26-xbody">${esc(hint)}</div>
      <div class="wave26-xmeta">
        ${d.tag ? `<span>Тема: ${esc(d.tag)}</span>` : ''}
        ${!correct ? `<span>Ваш ответ: ${esc(sel)}</span>` : ''}
        <span>Верный ответ: ${esc(prob.answer)}</span>
      </div>
      ${theory && !(typeof diagMode !== 'undefined' && diagMode) ? '<div class="wave26-xactions"><button type="button" class="wave26-xbtn" onclick="wave26Quality.openTheory()">📖 Открыть шпаргалку</button></div>' : ''}
    `;
    slot.appendChild(card);
  }

  function patchRender(){
    if(typeof render !== 'function' || render._wave26Patched) return;
    const orig = render;
    render = function(){
      const out = orig.apply(this, arguments);
      try{ applyQuestionContext(); }catch(_e){}
      try{ enrichExplanation(); }catch(_e){}
      return out;
    };
    render._wave26Patched = true;
    render._wave26Orig = orig;
  }

  function patchJournal(){
    if(typeof addToJournal !== 'function' || addToJournal._wave26Patched) return;
    const orig = addToJournal;
    addToJournal = function(entry){
      try{
        if(entry && entry.q){
          const d = buildPromptDescriptor({question: entry.q, tag: entry.tag, options: [entry.correct, entry.yourAnswer].filter(v => v !== undefined)});
          entry = Object.assign({}, entry, {
            q: d.journalLabel,
            hint: hasMeaningfulHint(entry.hint) ? cleanValue(entry.hint) : defaultHintFor({question: d.question, answer: entry.correct, tag: entry.tag, options: [entry.correct, entry.yourAnswer]})
          });
        }
      }catch(_e){}
      return orig.call(this, entry);
    };
    addToJournal._wave26Patched = true;
    addToJournal._wave26Orig = orig;
  }

  function boot(){
    injectStyles();
    patchMkQ();
    patchRender();
    patchJournal();
    window.wave26Quality = {
      version: 'wave26',
      buildPromptDescriptor,
      defaultHintFor,
      openTheory(){
        try{
          shpOn = true;
          usedHelp = true;
          render();
          const box = document.getElementById('shp-area');
          if(box) box.scrollIntoView({behavior:'smooth', block:'start'});
        }catch(_e){}
      },
      hasMeaningfulHint
    };
    try{ if(typeof prob !== 'undefined' && prob) render(); }catch(_e){}
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  }else{
    boot();
  }
  setTimeout(boot, 0);
  setTimeout(boot, 250);
})();

;
/* --- wave27_platform.js --- */
(function(){
  if(window.__wave27PlatformLoaded) return;
  window.__wave27PlatformLoaded = true;
  var VERSION='wave27';
  var STYLE_ID='wave27-platform-style';
  var BANNER_ID='wave27-update-banner';
  var state={regs:[],refreshPending:false,mockMode:false};
  function appendTarget(){
    if(document.head && typeof document.head.appendChild === 'function') return document.head;
    if(document.body && typeof document.body.appendChild === 'function') return document.body;
    if(document.documentElement && typeof document.documentElement.appendChild === 'function') return document.documentElement;
    return null;
  }
  function safeAppend(node){ var target=appendTarget(); if(target) target.appendChild(node); }
  function ensureStyles(){
    if(document.getElementById(STYLE_ID)) return;
    var style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=[
      '#'+BANNER_ID+'{position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0));transform:translateX(-50%);z-index:14010;display:flex;align-items:center;gap:10px;padding:12px 14px;max-width:min(92vw,460px);border-radius:16px;border:1px solid var(--border,#e2e0d8);background:var(--card,#fff);color:var(--text,#1a1a2e);box-shadow:0 18px 38px rgba(0,0,0,.18)}',
      '#'+BANNER_ID+'[hidden]{display:none!important}',
      '#'+BANNER_ID+' .wave27-copy{flex:1;min-width:0}',
      '#'+BANNER_ID+' .wave27-title{font:800 13px/1.2 "Unbounded",system-ui,sans-serif;margin:0 0 4px}',
      '#'+BANNER_ID+' .wave27-desc{font:600 11px/1.45 "Golos Text",system-ui,sans-serif;color:var(--muted,#6b6a74);margin:0}',
      '#'+BANNER_ID+' .wave27-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
      '#'+BANNER_ID+' .wave27-btn{min-height:40px;padding:0 14px;border:none;border-radius:12px;font:800 12px/1 "Golos Text",system-ui,sans-serif;cursor:pointer;touch-action:manipulation}',
      '#'+BANNER_ID+' .wave27-btn.primary{background:var(--accent,#2563eb);color:#fff}',
      '#'+BANNER_ID+' .wave27-btn.ghost{background:var(--abg,#eef2ff);color:var(--accent,#2563eb)}',
      '#'+BANNER_ID+' .wave27-chip{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:12px;background:var(--abg,#eef2ff);font-size:18px;line-height:1}',
      '@media (max-width:640px){#'+BANNER_ID+'{bottom:calc(92px + env(safe-area-inset-bottom,0));padding:12px;align-items:flex-start}#'+BANNER_ID+' .wave27-actions{width:100%}#'+BANNER_ID+' .wave27-btn{flex:1}}'
    ].join('');
    safeAppend(style);
  }
  function ensureColorSchemeMeta(){
    var meta=document.querySelector('meta[name="color-scheme"]');
    if(!meta){meta=document.createElement('meta');meta.setAttribute('name','color-scheme');safeAppend(meta)}
    meta.setAttribute('content','light dark');
  }
  function installTimerTracking(){
    if(window.__wave27TimerTrackingInstalled) return;
    window.__wave27TimerTrackingInstalled=true;
    var rawSetTimeout=window.setTimeout.bind(window), rawClearTimeout=window.clearTimeout.bind(window), rawSetInterval=window.setInterval.bind(window), rawClearInterval=window.clearInterval.bind(window);
    var timeouts=new Set(), intervals=new Set();
    window.setTimeout=function(fn,ms){var args=[].slice.call(arguments,2);var id=rawSetTimeout(function(){timeouts.delete(id);if(typeof fn==='function') return fn.apply(this,args);try{return Function(String(fn))()}catch(_){return void 0}},ms);timeouts.add(id);return id};
    window.clearTimeout=function(id){timeouts.delete(id);return rawClearTimeout(id)};
    window.setInterval=function(fn,ms){var args=[].slice.call(arguments,2);var id=rawSetInterval(function(){if(typeof fn==='function') return fn.apply(this,args);try{return Function(String(fn))()}catch(_){return void 0}},ms);intervals.add(id);return id};
    window.clearInterval=function(id){intervals.delete(id);return rawClearInterval(id)};
    window.__wave27Timers={timeouts:timeouts,intervals:intervals,clearAll:function(){timeouts.forEach(function(id){rawClearTimeout(id)});intervals.forEach(function(id){rawClearInterval(id)});timeouts.clear();intervals.clear()},counts:function(){return{timeouts:timeouts.size,intervals:intervals.size}}};
    if(!window.requestIdleCallback){window.requestIdleCallback=function(cb,opts){var start=Date.now();return window.setTimeout(function(){cb({didTimeout:!!(opts&&opts.timeout&&(Date.now()-start)>=opts.timeout),timeRemaining:function(){return Math.max(0,50-(Date.now()-start))}})},1)}}
    if(!window.cancelIdleCallback){window.cancelIdleCallback=function(id){window.clearTimeout(id)}}
    window.addEventListener('pagehide',function(){try{window.__wave27Timers&&window.__wave27Timers.clearAll()}catch(_){}},{once:true});
  }
  function bannerNode(){return document.getElementById(BANNER_ID)}
  function hideUpdateBanner(){var n=bannerNode();if(n)n.remove();state.mockMode=false}
  function attachActions(node,reg){var later=node.querySelector('[data-wave27-later]');var apply=node.querySelector('[data-wave27-apply]');if(later) later.addEventListener('click',hideUpdateBanner);if(apply) apply.addEventListener('click',function(){if(reg&&reg.waiting&&reg.waiting.postMessage){state.refreshPending=true;reg.waiting.postMessage({type:'SKIP_WAITING'})}else hideUpdateBanner()})}
  function showUpdateBanner(reg,opts){opts=opts||{};ensureStyles();var node=bannerNode();if(!node){node=document.createElement('div');node.id=BANNER_ID;node.setAttribute('role','status');node.setAttribute('aria-live','polite');node.innerHTML='<div class="wave27-chip" aria-hidden="true">⬆️</div><div class="wave27-copy"><div class="wave27-title">Доступна новая версия</div><p class="wave27-desc">Можно обновить приложение сейчас и сразу перейти на свежий кэш.</p></div><div class="wave27-actions"><button class="wave27-btn ghost" type="button" data-wave27-later>Позже</button><button class="wave27-btn primary" type="button" data-wave27-apply>Обновить</button></div>';var target=(document.body&&typeof document.body.appendChild==='function')?document.body:appendTarget(); if(target) target.appendChild(node)}state.mockMode=!!opts.mock;attachActions(node,reg||null);return node}
  function regSeen(reg){return state.regs.indexOf(reg)!==-1}
  function hookRegistration(reg){if(!reg||regSeen(reg))return;state.regs.push(reg);if(reg.waiting) showUpdateBanner(reg);reg.addEventListener('updatefound',function(){var worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',function(){if(worker.state==='installed'&&navigator.serviceWorker.controller) showUpdateBanner(reg)})})}
  function initSWUpdates(){if(!('serviceWorker' in navigator) || !navigator.serviceWorker) return;var sw=navigator.serviceWorker;if(typeof sw.addEventListener==='function'){sw.addEventListener('controllerchange',function(){if(!state.refreshPending)return;state.refreshPending=false;try{location.reload()}catch(_){}})}var getReg=typeof sw.getRegistration==='function'?sw.getRegistration.bind(sw):null;if(!getReg) return;Promise.all([getReg('./sw.js').catch(function(){return null}),getReg().catch(function(){return null})]).then(function(list){list.filter(Boolean).forEach(hookRegistration)});if(sw.ready&&typeof sw.ready.then==='function'){sw.ready.then(function(reg){hookRegistration(reg);window.setTimeout(function(){try{reg.update&&reg.update()}catch(_){}},2500)}).catch(function(){})}}
  function init(){ensureColorSchemeMeta();installTimerTracking();initSWUpdates()}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  window.__wave27Platform={version:VERSION,updateVisible:function(){return !!bannerNode()},hideUpdateBanner:hideUpdateBanner,showMockUpdateBanner:function(){return showUpdateBanner({waiting:{postMessage:function(){}}},{mock:true})},manifestHref:function(){var el=document.querySelector('link[rel="manifest"]');return el&&el.getAttribute('href')},hasAppleTouchIcon:function(){return !!document.querySelector('link[rel="apple-touch-icon"]')},preconnectCount:function(){return document.querySelectorAll('link[rel="preconnect"]').length},cspPresent:function(){return !!document.querySelector('meta[http-equiv="Content-Security-Policy"]')},timerCounts:function(){return window.__wave27Timers?window.__wave27Timers.counts():{timeouts:0,intervals:0}}};
})();

;
/* --- wave28_spaced.js --- */
(function(){
  if (window.wave28Debug) return;

  var REVIEW_KEY = 'trainer_review_' + (window.GRADE_NUM || '10');
  var REVIEW_STEPS = [1, 3, 7, 14, 30];
  var MAX_JOURNAL = 150;
  var MAX_REVIEW_ITEMS = 240;
  var reviewMode = null;

  function nowTs(){ return Date.now(); }
  function dayStart(ts){ var d = new Date(ts || Date.now()); d.setHours(0,0,0,0); return d.getTime(); }
  function addDays(ts, days){ var d = new Date(ts); d.setDate(d.getDate() + days); return d.getTime(); }
  function clone(x){ try { return JSON.parse(JSON.stringify(x)); } catch(e){ return x; } }
  function norm(v){ return String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); }
  function readJSON(key, fallback){ try{ var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : clone(fallback); }catch(e){ return clone(fallback); } }
  function writeJSON(key, value){ try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){} }
  function uniq(arr){ var seen = {}; return (arr || []).filter(function(v){ var k = norm(v); if(!k || seen[k]) return false; seen[k] = 1; return true; }); }
  function sh(arr){ return typeof shuffle === 'function' ? shuffle(arr.slice()) : arr.slice(); }
  function hasFn(fn){ return typeof fn === 'function'; }
  function say(msg, type, ms){ if(hasFn(window.showToast)) window.showToast(msg, type || 'info', ms || 2200); else alert(msg); }
  function reviewKey(entry){ return [norm(entry.tag), norm(entry.correct), norm(entry.q)].join('¦').slice(0, 320); }
  function gradeKey(){ return String(window.GRADE_NUM || '10'); }

  function ensureStyles(){
    if (document.getElementById('wave28-style')) return;
    var style = document.createElement('style');
    style.id = 'wave28-style';
    style.textContent = [
      '.wave28-card{margin-top:10px;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:12px 12px 10px;box-shadow:0 8px 22px rgba(0,0,0,.06)}',
      '.wave28-title{font-family:Unbounded,system-ui,sans-serif;font-size:12px;font-weight:800;margin-bottom:8px}',
      '.wave28-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:10px}',
      '.wave28-stat{background:linear-gradient(180deg,var(--bg),var(--card));border:1px solid var(--border);border-radius:12px;padding:8px 6px;text-align:center}',
      '.wave28-stat .v{font-size:18px;font-weight:900;line-height:1.1}',
      '.wave28-stat .l{font-size:10px;color:var(--muted);margin-top:2px}',
      '.wave28-actions{display:flex;gap:6px;flex-wrap:wrap}',
      '.wave28-actions .btn{flex:1;min-width:110px;font-size:12px;padding:9px}',
      '.wave28-muted{font-size:11px;color:var(--muted);line-height:1.45}',
      '.wave28-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)}',
      '.wave28-row:last-child{border-bottom:none}',
      '.wave28-chip{font-size:10px;padding:3px 8px;border-radius:999px;background:var(--abg);color:var(--accent);font-weight:700}',
      '#wave28-session-meta{margin-top:8px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:10px}',
      '#wave28-session-meta .ttl{font-size:11px;font-weight:800;margin-bottom:6px;color:var(--accent)}',
      '#wave28-session-meta .bar{height:8px;background:var(--border);border-radius:999px;overflow:hidden;margin-bottom:6px}',
      '#wave28-session-meta .fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--green));border-radius:999px}',
      '#wave28-session-meta .meta{display:flex;justify-content:space-between;gap:8px;font-size:11px;color:var(--muted)}',
      '.wave28-list{display:grid;gap:6px;margin-top:8px}',
      '.wave28-item{padding:8px 10px;border:1px solid var(--border);border-radius:10px;background:var(--bg)}',
      '.wave28-item .q{font-size:12px;font-weight:700;line-height:1.35}',
      '.wave28-item .m{font-size:10px;color:var(--muted);margin-top:3px}',
      '.wave28-mini-actions{display:flex;gap:6px;margin-top:6px}',
      '.wave28-mini-actions button{flex:1;border:none;border-radius:8px;padding:7px 8px;font-size:11px;font-weight:700;cursor:pointer}',
      '.wave28-mini-actions .th{background:var(--abg);color:var(--accent)}',
      '.wave28-mini-actions .tr{background:var(--gbg);color:var(--green)}',
      '.wave28-mini-actions .rv{background:var(--obg);color:var(--orange)}',
      '@media (max-width:520px){.wave28-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}'
    ].join('');
    document.head.appendChild(style);
  }
  ensureStyles();

  function loadJournalSafe(){
    var rows = readJSON('trainer_journal_' + gradeKey(), []);
    return Array.isArray(rows) ? rows.filter(Boolean) : [];
  }
  function saveJournalSafe(rows){
    var clean = Array.isArray(rows) ? rows.filter(Boolean).slice(-MAX_JOURNAL) : [];
    writeJSON('trainer_journal_' + gradeKey(), clean);
  }
  window.loadJournal = loadJournalSafe;
  window.saveJournal = saveJournalSafe;

  function loadReviewState(){
    var state = readJSON(REVIEW_KEY, {version:1, items:{}});
    if (!state || typeof state !== 'object') state = {version:1, items:{}};
    if (!state.items || typeof state.items !== 'object') state.items = {};
    return state;
  }
  function saveReviewState(state){
    var items = Object.values(state.items || {}).sort(function(a,b){ return (b.updatedAt||0) - (a.updatedAt||0); }).slice(0, MAX_REVIEW_ITEMS);
    var out = {version:1, items:{}};
    items.forEach(function(item){ out.items[item.key] = item; });
    writeJSON(REVIEW_KEY, out);
  }
  function listReviewItems(state){ return Object.values((state || loadReviewState()).items || {}); }
  function dueItems(state){
    var ts = nowTs();
    return listReviewItems(state).filter(function(item){ return (item.dueAt || 0) <= ts; }).sort(function(a,b){
      if ((a.dueAt||0) !== (b.dueAt||0)) return (a.dueAt||0) - (b.dueAt||0);
      if ((b.wrongCount||0) !== (a.wrongCount||0)) return (b.wrongCount||0) - (a.wrongCount||0);
      return (b.updatedAt||0) - (a.updatedAt||0);
    });
  }
  function stickyItems(state){
    return listReviewItems(state).filter(function(item){ return !!item.sticky; }).sort(function(a,b){
      if ((b.wrongCount||0) !== (a.wrongCount||0)) return (b.wrongCount||0) - (a.wrongCount||0);
      return (b.updatedAt||0) - (a.updatedAt||0);
    });
  }
  function masteredCount(state){
    return listReviewItems(state).filter(function(item){ return !item.sticky && (item.step||0) >= 3; }).length;
  }
  function topicMetaByIds(subjectId, topicId){
    if (!subjectId || !topicId || !Array.isArray(window.SUBJ)) return null;
    for (var i=0;i<SUBJ.length;i++){
      var subj = SUBJ[i];
      if (subj.id !== subjectId) continue;
      for (var j=0;j<(subj.tops||[]).length;j++) if (subj.tops[j].id === topicId) return {subj:subj, topic:subj.tops[j]};
    }
    return null;
  }
  function findMeta(entry){
    var meta = topicMetaByIds(entry.subjectId, entry.topicId);
    if (meta) return meta;
    if (hasFn(window.findTopicMeta)){
      try {
        meta = findTopicMeta(entry.tag);
        if (meta) return meta;
      } catch(e){}
    }
    if (!Array.isArray(window.SUBJ)) return null;
    for (var i=0;i<SUBJ.length;i++){
      var subj = SUBJ[i];
      for (var j=0;j<(subj.tops||[]).length;j++){
        var topic = subj.tops[j];
        if (topic.nm === entry.tag) return {subj:subj, topic:topic};
      }
    }
    return null;
  }
  function buildFallbackOptions(entry){
    var base = uniq([entry.correct, entry.yourAnswer, 'Не знаю', 'Другое']);
    while (base.length < 4) base.push('Вариант ' + (base.length + 1));
    return sh(base.slice(0, 4));
  }
  function sanitizedOptions(entry){
    var opts = uniq((entry.options || []).concat([entry.correct, entry.yourAnswer]));
    if (opts.length < 2) return buildFallbackOptions(entry);
    while (opts.length < 4){
      var filler = entry.correct + ' •' + (opts.length);
      opts.push(filler);
      opts = uniq(opts);
      if (opts.length > 6) break;
    }
    return sh(opts.slice(0, Math.max(2, Math.min(4, opts.length))));
  }
  function dayLabel(ts){
    var diff = Math.round((dayStart(ts) - dayStart()) / 86400000);
    if (diff <= 0) return 'сегодня';
    return 'через ' + diff + ' ' + declNum(diff, 'день', 'дня', 'дней');
  }
  function countByTag(items){
    var out = {};
    (items || []).forEach(function(item){
      var tag = item.tag || 'Без темы';
      if (!out[tag]) out[tag] = {count:0, sample:item};
      out[tag].count += 1;
    });
    return Object.entries(out).sort(function(a,b){ return b[1].count - a[1].count; });
  }
  function enrichEntry(entry){
    var meta = findMeta(entry) || {};
    return Object.assign({}, entry, {
      key: reviewKey(entry),
      q: entry.q || (window.prob && prob.question) || '',
      correct: entry.correct || (window.prob && prob.answer) || '',
      yourAnswer: entry.yourAnswer || entry.your || '',
      tag: entry.tag || (window.prob && prob.tag) || (meta.topic && meta.topic.nm) || '',
      hint: entry.hint || (window.prob && prob.hint) || '',
      options: sanitizedOptions(Object.assign({}, entry, {options: entry.options || (window.prob && prob.options) || []})),
      code: entry.code || (window.prob && prob.code) || '',
      isMath: !!(entry.isMath || (window.prob && prob.isMath)),
      bg: entry.bg || (window.prob && prob.bg) || (meta.subj && meta.subj.bg) || 'var(--card)',
      color: entry.color || (window.prob && prob.color) || (meta.subj && meta.subj.cl) || 'var(--text)',
      subjectId: entry.subjectId || (meta.subj && meta.subj.id) || (window.cS && cS.id) || '',
      topicId: entry.topicId || (meta.topic && meta.topic.id) || (window.cT && cT.id) || '',
      ts: entry.ts || nowTs()
    });
  }
  function registerMistake(entry){
    var row = enrichEntry(entry);
    var state = loadReviewState();
    var item = state.items[row.key] || {
      key: row.key,
      createdAt: nowTs(),
      rightCount: 0,
      wrongCount: 0,
      reviewCorrectStreak: 0,
      step: 0,
      intervalDays: REVIEW_STEPS[0]
    };
    item.q = row.q;
    item.correct = row.correct;
    item.tag = row.tag;
    item.hint = row.hint || item.hint || '';
    item.options = sanitizedOptions(row);
    item.code = row.code || '';
    item.isMath = !!row.isMath;
    item.bg = row.bg || item.bg || 'var(--card)';
    item.color = row.color || item.color || 'var(--text)';
    item.subjectId = row.subjectId || item.subjectId || '';
    item.topicId = row.topicId || item.topicId || '';
    item.updatedAt = nowTs();
    item.lastSeenAt = nowTs();
    item.lastWrongAt = nowTs();
    item.lastOutcome = 'wrong';
    item.wrongCount = (item.wrongCount || 0) + 1;
    item.reviewCorrectStreak = 0;
    item.step = 0;
    item.intervalDays = REVIEW_STEPS[0];
    item.dueAt = addDays(dayStart(), REVIEW_STEPS[0]);
    item.sticky = (item.wrongCount || 0) >= 3;
    state.items[item.key] = item;
    saveReviewState(state);
    return item;
  }
  function advanceReviewSuccess(key, helped){
    var state = loadReviewState();
    var item = state.items[key];
    if (!item) return null;
    item.updatedAt = nowTs();
    item.lastSeenAt = nowTs();
    item.rightCount = (item.rightCount || 0) + 1;
    item.reviewCorrectStreak = (item.reviewCorrectStreak || 0) + 1;
    item.lastOutcome = helped ? 'helped' : 'correct';
    if (helped){
      item.intervalDays = Math.max(1, item.intervalDays || REVIEW_STEPS[0]);
      item.dueAt = addDays(dayStart(), 1);
    } else {
      item.step = Math.min(REVIEW_STEPS.length - 1, (item.step || 0) + 1);
      item.intervalDays = REVIEW_STEPS[item.step];
      item.dueAt = addDays(dayStart(), item.intervalDays);
    }
    if ((item.reviewCorrectStreak || 0) >= 2) item.sticky = false;
    state.items[key] = item;
    saveReviewState(state);
    return item;
  }
  function clearReviewState(){ try{ localStorage.removeItem(REVIEW_KEY); }catch(e){} }

  var _oldAddToJournal = window.addToJournal;
  window.addToJournal = function(entry){
    var row = enrichEntry(entry || {});
    if (hasFn(_oldAddToJournal)) _oldAddToJournal(row); else {
      var journal = loadJournalSafe();
      journal.push(row);
      saveJournalSafe(journal);
    }
    registerMistake(row);
    setTimeout(function(){ try{ renderReviewCard(); }catch(e){} try{ appendReviewProgress(); }catch(e){} }, 0);
  };

  function getReviewSummary(){
    var state = loadReviewState();
    return {
      total: listReviewItems(state).length,
      due: dueItems(state).length,
      sticky: stickyItems(state).length,
      mastered: masteredCount(state)
    };
  }
  function buildProb(item){
    return {
      question: item.q,
      answer: item.correct,
      options: sanitizedOptions(item),
      hint: item.hint || 'Повтори правило и попробуй ещё раз.',
      tag: item.tag || 'Повторение',
      bg: item.bg || 'var(--card)',
      color: item.color || 'var(--text)',
      code: item.code || null,
      isMath: !!item.isMath
    };
  }
  function setContextFromItem(item){
    var meta = findMeta(item);
    if (meta){
      window.cS = meta.subj;
      window.cT = meta.topic;
      window.curTheory = meta.topic.th || null;
    } else {
      window.cT = null;
      window.curTheory = null;
    }
  }
  function startReviewDeck(kind, items){
    if (!items || !items.length) return say('Сегодня повторять нечего.', 'info', 2200);
    reviewMode = {
      kind: kind,
      items: items.slice(0, 20).map(clone),
      startedAt: nowTs()
    };
    window.__wave28CurrentReviewKey = '';
    window.rushMode = false;
    window.diagMode = false;
    window.globalMix = false;
    window.mix = false;
    if (document.getElementById('hdr')) document.getElementById('hdr').textContent = kind === 'sticky' ? '📌 СЛОЖНЫЕ ВОПРОСЫ' : '🔁 ПОВТОРЕНИЕ';
    startQuiz();
  }
  function startDueReview(){ startReviewDeck('due', dueItems()); }
  function startStickyReview(){ startReviewDeck('sticky', stickyItems()); }
  window.startDueReview = startDueReview;
  window.startStickyReview = startStickyReview;

  var _oldNextQ = window.nextQ;
  window.nextQ = function(){
    if (reviewMode){
      var index = (window.st ? st.ok + st.err : 0);
      if (index >= reviewMode.items.length) return endSession();
      var item = reviewMode.items[index];
      setContextFromItem(item);
      window.prob = buildProb(item);
      window.__wave28CurrentReviewKey = item.key;
      window.sel = null;
      window.hintOn = false;
      window.shpOn = false;
      window.usedHelp = false;
      render();
      try{ window.scrollTo({top:0, behavior:'smooth'}); }catch(e){}
      return;
    }
    return _oldNextQ.apply(this, arguments);
  };

  var _oldRender = window.render;
  window.render = function(){
    var out = _oldRender.apply(this, arguments);
    if (reviewMode){
      var pa = document.getElementById('pa');
      if (pa){
        var idx = Math.min(reviewMode.items.length, (window.st ? st.ok + st.err : 0) + 1);
        var current = reviewMode.items[Math.max(0, idx - 1)] || reviewMode.items[0];
        var pct = Math.round(((idx - 1) / Math.max(1, reviewMode.items.length)) * 100);
        pa.innerHTML = '<div id="wave28-session-meta">'
          + '<div class="ttl">' + (reviewMode.kind === 'sticky' ? '📌 Мои сложные вопросы' : '🔁 Повторение ошибок') + '</div>'
          + '<div class="bar"><div class="fill" style="width:' + pct + '%"></div></div>'
          + '<div class="meta"><span>Карточка ' + idx + ' из ' + reviewMode.items.length + '</span><span>Следующий интервал: ' + ((current && current.intervalDays) || 1) + ' д.</span></div>'
          + '</div>';
      }
    }
    return out;
  };

  var _oldAns = window.ans;
  window.ans = function(index){
    var prevSel = window.sel;
    var answerValue = window.prob && prob.options ? prob.options[index] : null;
    var expected = window.prob ? prob.answer : null;
    var key = window.__wave28CurrentReviewKey || (window.prob ? reviewKey({q:prob.question, correct:prob.answer, tag:prob.tag}) : '');
    var wasReview = !!reviewMode;
    var res = _oldAns.apply(this, arguments);
    if (prevSel === null && answerValue != null){
      if (wasReview && key && answerValue === expected){
        advanceReviewSuccess(key, !!window.usedHelp);
      } else if (!wasReview && key && answerValue === expected){
        var state = loadReviewState();
        if (state.items[key]) advanceReviewSuccess(key, !!window.usedHelp);
      }
      setTimeout(function(){ try{ renderReviewCard(); }catch(e){} try{ appendReviewProgress(); }catch(e){} }, 0);
      if (wasReview && window.st && (st.ok + st.err) >= ((reviewMode && reviewMode.items && reviewMode.items.length) || 0) && reviewMode){
        setTimeout(function(){ if(reviewMode) endSession(); }, 220);
      }
    }
    return res;
  };

  var _oldEndSession = window.endSession;
  window.endSession = function(){
    var mode = reviewMode;
    reviewMode = null;
    var res = _oldEndSession.apply(this, arguments);
    if (mode){
      setTimeout(function(){
        var host = document.getElementById('res-topics');
        if (host){
          var state = loadReviewState();
          var due = dueItems(state).length;
          var sticky = stickyItems(state).length;
          var mastered = masteredCount(state);
          var html = '<div class="rcard"><h3>🔁 Повторение ошибок</h3>'
            + '<div class="wave28-stats" style="margin-top:10px">'
            + '<div class="wave28-stat"><div class="v" style="color:var(--accent)">' + due + '</div><div class="l">сегодня</div></div>'
            + '<div class="wave28-stat"><div class="v" style="color:var(--red)">' + sticky + '</div><div class="l">сложные</div></div>'
            + '<div class="wave28-stat"><div class="v" style="color:var(--green)">' + mastered + '</div><div class="l">закреплены</div></div>'
            + '<div class="wave28-stat"><div class="v">' + listReviewItems(state).length + '</div><div class="l">в журнале</div></div>'
            + '</div>'
            + '<div class="wave28-actions">'
            + '<button class="btn btn-p" ' + (due ? 'onclick="startDueReview()"' : 'disabled style="opacity:.5"') + '>🔁 Повторить сегодня</button>'
            + '<button class="btn btn-o" ' + (sticky ? 'onclick="startStickyReview()"' : 'disabled style="opacity:.5"') + '>📌 Мои сложные</button>'
            + '</div></div>';
          host.innerHTML += html;
        }
        var resultBtns = document.querySelectorAll('#s-result .btn, #s-result button');
        resultBtns.forEach(function(btn){ if ((btn.textContent || '').indexOf('Назад') !== -1) btn.onclick = function(){ go('main'); }; });
      }, 0);
    }
    return res;
  };

  var _oldResetProgress = window.resetProgress;
  if (hasFn(_oldResetProgress)){
    window.resetProgress = function(){
      var res = _oldResetProgress.apply(this, arguments);
      clearReviewState();
      setTimeout(function(){ try{ renderReviewCard(); }catch(e){} try{ appendReviewProgress(); }catch(e){} }, 0);
      return res;
    };
  }

  var _oldGetBackupSnapshot = window.getBackupSnapshot;
  if (hasFn(_oldGetBackupSnapshot)){
    window.getBackupSnapshot = function(){
      var snap = _oldGetBackupSnapshot.apply(this, arguments);
      snap.review = loadReviewState();
      return snap;
    };
  }
  var _oldApplyBackupSnapshot = window.applyBackupSnapshot;
  if (hasFn(_oldApplyBackupSnapshot)){
    window.applyBackupSnapshot = function(payload){
      var ok = _oldApplyBackupSnapshot.apply(this, arguments);
      if (payload && payload.review && typeof payload.review === 'object') saveReviewState(payload.review);
      else if (payload && Array.isArray(payload.journal)) clearReviewState();
      setTimeout(function(){ try{ renderReviewCard(); }catch(e){} try{ appendReviewProgress(); }catch(e){} }, 0);
      return ok;
    };
  }

  function jumpTag(tag, mode){
    if (hasFn(window.jumpToTopic)) return jumpToTopic(tag, mode || 'train');
    say('Прыжок к теме пока недоступен.', 'warn', 2200);
  }
  function renderReviewCard(){
    ensureStyles();
    var host = document.getElementById('daily-meter');
    if (!host) return;
    var old = document.getElementById('wave28-review-card');
    if (old) old.remove();
    var state = loadReviewState();
    var total = listReviewItems(state).length;
    var due = dueItems(state).length;
    var sticky = stickyItems(state).length;
    var mastered = masteredCount(state);
    if (!total) return;
    var card = document.createElement('div');
    card.id = 'wave28-review-card';
    card.className = 'wave28-card';
    card.innerHTML = '<div class="wave28-title">🔁 Повторение ошибок</div>'
      + '<div class="wave28-stats">'
      + '<div class="wave28-stat"><div class="v" style="color:var(--accent)">' + due + '</div><div class="l">сегодня</div></div>'
      + '<div class="wave28-stat"><div class="v" style="color:var(--red)">' + sticky + '</div><div class="l">сложные</div></div>'
      + '<div class="wave28-stat"><div class="v" style="color:var(--green)">' + mastered + '</div><div class="l">закреплены</div></div>'
      + '<div class="wave28-stat"><div class="v">' + total + '</div><div class="l">в журнале</div></div>'
      + '</div>'
      + '<div class="wave28-muted" style="margin-bottom:10px">Ошибки теперь попадают в интервальное повторение: 1 / 3 / 7 / 14 / 30 дней. После двух уверенных повторов вопрос снимается с пометки «сложный».</div>'
      + '<div class="wave28-actions">'
      + '<button class="btn btn-p" ' + (due ? 'onclick="startDueReview()"' : 'disabled style="opacity:.45"') + '>🔁 Повторить сегодня</button>'
      + '<button class="btn btn-o" ' + (sticky ? 'onclick="startStickyReview()"' : 'disabled style="opacity:.45"') + '>📌 Мои сложные</button>'
      + '<button class="btn btn-o" onclick="showJournal()">📚 Журнал</button>'
      + '</div>';
    host.appendChild(card);
  }

  function appendReviewProgress(){
    var host = document.getElementById('prog-content');
    if (!host) return;
    var old = document.getElementById('wave28-prog-card');
    if (old) old.remove();
    var state = loadReviewState();
    var total = listReviewItems(state).length;
    if (!total) return;
    var due = dueItems(state);
    var sticky = stickyItems(state);
    var groups = countByTag(due.slice(0, 8));
    var card = document.createElement('div');
    card.id = 'wave28-prog-card';
    card.className = 'rcard';
    var chips = groups.length ? groups.map(function(pair){ return '<span class="wave28-chip">' + esc(pair[0]) + ': ' + pair[1].count + '</span>'; }).join('') : '<span class="wave28-muted">На сегодня повторов нет.</span>';
    card.innerHTML = '<h3>🔁 Журнал ошибок и интервальное повторение</h3>'
      + '<div class="wave28-stats" style="margin-top:10px">'
      + '<div class="wave28-stat"><div class="v" style="color:var(--accent)">' + due.length + '</div><div class="l">сегодня</div></div>'
      + '<div class="wave28-stat"><div class="v" style="color:var(--red)">' + sticky.length + '</div><div class="l">сложные</div></div>'
      + '<div class="wave28-stat"><div class="v" style="color:var(--green)">' + masteredCount(state) + '</div><div class="l">закреплены</div></div>'
      + '<div class="wave28-stat"><div class="v">' + total + '</div><div class="l">всего карт</div></div>'
      + '</div>'
      + '<div class="wave28-muted" style="margin-bottom:8px">Сегодня в повторе сильнее всего выпадают такие темы:</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">' + chips + '</div>'
      + '<div class="wave28-actions">'
      + '<button class="btn btn-p" ' + (due.length ? 'onclick="startDueReview()"' : 'disabled style="opacity:.45"') + '>🔁 Повторить сегодня</button>'
      + '<button class="btn btn-o" ' + (sticky.length ? 'onclick="startStickyReview()"' : 'disabled style="opacity:.45"') + '>📌 Сложные</button>'
      + '<button class="btn btn-o" onclick="showJournal()">📚 Открыть журнал</button>'
      + '</div>';
    host.appendChild(card);
  }
  var _oldRenderDailyMeter = window.renderDailyMeter;
  if (hasFn(_oldRenderDailyMeter)) window.renderDailyMeter = function(){ var out = _oldRenderDailyMeter.apply(this, arguments); try{ renderReviewCard(); }catch(e){} return out; };
  var _oldRenderProg = window.renderProg;
  if (hasFn(_oldRenderProg)) window.renderProg = function(){ var out = _oldRenderProg.apply(this, arguments); try{ appendReviewProgress(); }catch(e){} return out; };

  var _oldStartWeakTraining = window.startWeakTraining;
  window.startWeakTrainingByTopics = _oldStartWeakTraining;

  window.showJournal = function(){
    ensureStyles();
    var journal = loadJournalSafe();
    var state = loadReviewState();
    var due = dueItems(state);
    var sticky = stickyItems(state);
    var grouped = countByTag(due.slice(0, 12));
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto';
    overlay.onclick = function(){ overlay.remove(); };
    var card = document.createElement('div');
    card.style.cssText = 'background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:16px;padding:24px 20px;max-width:460px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 12px 30px rgba(0,0,0,.25)';
    card.onclick = function(e){ e.stopPropagation(); };
    var html = '<h3 style="font-family:Unbounded,system-ui,sans-serif;font-size:16px;font-weight:800;margin-bottom:12px;text-align:center">🔁 Журнал ошибок</h3>'
      + '<div class="wave28-stats">'
      + '<div class="wave28-stat"><div class="v" style="color:var(--accent)">' + due.length + '</div><div class="l">сегодня</div></div>'
      + '<div class="wave28-stat"><div class="v" style="color:var(--red)">' + sticky.length + '</div><div class="l">сложные</div></div>'
      + '<div class="wave28-stat"><div class="v" style="color:var(--green)">' + masteredCount(state) + '</div><div class="l">закреплены</div></div>'
      + '<div class="wave28-stat"><div class="v">' + journal.length + '</div><div class="l">последних ошибок</div></div>'
      + '</div>'
      + '<div class="wave28-muted" style="margin-bottom:10px">Ошибки попадают в интервальное повторение: 1 / 3 / 7 / 14 / 30 дней. После двух успешных повторов вопрос перестаёт считаться «сложным».</div>'
      + '<div class="wave28-actions" style="margin-bottom:12px">'
      + '<button class="btn btn-p" ' + (due.length ? 'onclick="this.closest(\'div[style*=fixed]\').remove();startDueReview()"' : 'disabled style="opacity:.45"') + '>🔁 Повторить сегодня</button>'
      + '<button class="btn btn-o" ' + (sticky.length ? 'onclick="this.closest(\'div[style*=fixed]\').remove();startStickyReview()"' : 'disabled style="opacity:.45"') + '>📌 Мои сложные</button>'
      + '<button class="btn btn-o" onclick="this.closest(\'div[style*=fixed]\').remove();startWeakTrainingByTopics && startWeakTrainingByTopics()">🎯 По слабым темам</button>'
      + '</div>';

    if (grouped.length){
      html += '<div class="wave28-title" style="font-size:11px">Сегодня пора повторить</div><div class="wave28-list">';
      grouped.forEach(function(pair){
        var tag = pair[0], info = pair[1], enc = encodeURIComponent(tag);
        html += '<div class="wave28-item"><div class="q">' + esc(tag) + '</div><div class="m">' + info.count + ' ' + declNum(info.count, 'вопрос', 'вопроса', 'вопросов') + ' · ' + dayLabel(info.sample.dueAt || nowTs()) + '</div>'
          + '<div class="wave28-mini-actions">'
          + '<button class="th" onclick="event.stopPropagation();jumpToTopic(decodeURIComponent(\'' + enc + '\'),' + '\'theory\'' + ')">📖 Шпаргалка</button>'
          + '<button class="tr" onclick="event.stopPropagation();jumpToTopic(decodeURIComponent(\'' + enc + '\'),' + '\'train\'' + ')">✏️ Тема</button>'
          + '<button class="rv" onclick="event.stopPropagation();this.closest(\'div[style*=fixed]\').remove();startDueReview()">🔁 Повтор</button>'
          + '</div></div>';
      });
      html += '</div>';
    }

    if (sticky.length){
      html += '<div class="wave28-title" style="font-size:11px;margin-top:12px">Сложные вопросы</div><div class="wave28-list">';
      sticky.slice(0, 6).forEach(function(item){
        html += '<div class="wave28-item"><div class="q">' + esc(item.q) + '</div><div class="m">' + esc(item.tag) + ' · ошибок: ' + (item.wrongCount||0) + ' · ' + dayLabel(item.dueAt || nowTs()) + '</div></div>';
      });
      html += '</div>';
    }

    if (journal.length){
      html += '<div class="wave28-title" style="font-size:11px;margin-top:12px">Последние ошибки</div><div class="wave28-list">';
      journal.slice(-10).reverse().forEach(function(item){
        html += '<div class="wave28-item"><div class="q">' + esc(item.q) + '</div><div class="m"><span style="color:var(--red)">✗ ' + esc(item.your || item.yourAnswer || '') + '</span> → <span style="color:var(--green)">✓ ' + esc(item.correct) + '</span>' + (item.hint ? ' · 💡 ' + esc(item.hint) : '') + '</div></div>';
      });
      html += '</div>';
    } else {
      html += '<div style="text-align:center;color:var(--muted);padding:24px 0;font-size:13px">Ошибок пока нет. Решай задачи!</div>';
    }

    html += '<button style="margin-top:12px;width:100%;padding:8px;border:none;border-radius:8px;background:transparent;color:var(--red);font-size:11px;cursor:pointer;font-family:Golos Text,sans-serif" onclick="if(confirm(\'Очистить журнал ошибок и интервальное повторение?\')){localStorage.removeItem(\'' + 'trainer_journal_' + gradeKey() + '\');localStorage.removeItem(\'' + REVIEW_KEY + '\');this.closest(\'div[style*=fixed]\').remove();refreshMain&&refreshMain();renderProg&&renderProg();}">Очистить журнал и повторение</button>';
    html += '<button style="margin-top:8px;width:100%;padding:10px;border:none;border-radius:8px;background:var(--text);color:var(--bg);font-weight:700;font-size:14px;cursor:pointer;font-family:Golos Text,sans-serif" onclick="this.closest(\'div[style*=fixed]\').remove()">Закрыть</button>';

    card.innerHTML = html;
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    window._weakOverlay = overlay;
  };

  function patchMainJournalButton(){
    document.querySelectorAll('button[onclick*="showJournal"]').forEach(function(btn){
      var txt = (btn.textContent || '').trim();
      if (txt.indexOf('Слабые') !== -1) btn.textContent = '🔁 Повторение';
    });
  }
  patchMainJournalButton();
  setTimeout(patchMainJournalButton, 0);

  window.wave28Debug = {
    version: 'wave28',
    loadReview: function(){ return loadReviewState(); },
    dueCount: function(){ return dueItems().length; },
    stickyCount: function(){ return stickyItems().length; },
    totalCount: function(){ return listReviewItems(loadReviewState()).length; },
    masteredCount: function(){ return masteredCount(loadReviewState()); },
    markAllDue: function(){ var s = loadReviewState(); listReviewItems(s).forEach(function(item){ item.dueAt = dayStart() - 1000; item.updatedAt = nowTs(); s.items[item.key] = item; }); saveReviewState(s); renderReviewCard(); appendReviewProgress(); },
    clear: function(){ clearReviewState(); saveJournalSafe([]); renderReviewCard(); appendReviewProgress(); },
    isReviewMode: function(){ return !!reviewMode; },
    startDueReview: startDueReview,
    startStickyReview: startStickyReview
  };

  setTimeout(function(){ try{ renderReviewCard(); }catch(e){} try{ appendReviewProgress(); }catch(e){} }, 0);
})();


;
/* --- wave41_olympiad_and_ux.js --- */
(function(){
  if (typeof window === 'undefined' || window.__wave41OlyUx) return;
  window.__wave41OlyUx = true;

  function rand(list){ return list[Math.floor(Math.random() * list.length)]; }
  function shuffleLite(list){
    var arr = list.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }
  function unique(list){ var out=[]; list.forEach(function(item){ if (out.indexOf(item)===-1) out.push(item); }); return out; }
  function mk(question, answer, wrongs, hint, tag){
    var opts = unique([String(answer)].concat((wrongs || []).map(function(item){ return String(item); })));
    while (opts.length < 4) opts.push(String(answer));
    if (typeof window.mkQ === 'function') return window.mkQ(question, String(answer), shuffleLite(opts).slice(0,4), hint, tag || 'Олимпиада', '#b45309', '#fef3c7');
    return { question:question, answer:String(answer), options:shuffleLite(opts).slice(0,4), hint:hint, tag:tag || 'Олимпиада', color:'#b45309', bg:'#fef3c7' };
  }
  function longHint(title, steps){ return title + ' Шаги: ' + steps.join(' → '); }

  function logicBirthday(){
    var table = [
      { n:20, a:'≈41%', wrong:['≈10%','≈20%','≈80%'] },
      { n:23, a:'≈50%', wrong:['≈23%','≈5%','≈99%'] },
      { n:30, a:'≈71%', wrong:['≈30%','≈50%','≈90%'] },
      { n:40, a:'≈89%', wrong:['≈40%','≈60%','≈99%'] },
      { n:50, a:'≈97%', wrong:['≈50%','≈75%','≈85%'] }
    ];
    var item = rand(table);
    var q = 'В комнате собрались ' + item.n + ' человек. Какова вероятность того, что хотя бы у двоих совпадёт день рождения? Считаем, что дни рождения распределены равномерно по 365 дням, високосные годы не учитываем.';
    var h = longHint('Это классический парадокс дней рождения.', ['считаем противоположное событие — что все дни рождения разные', 'перемножаем вероятности 365/365 · 364/365 · ...', 'вычитаем результат из 1', 'для ' + item.n + ' человек получается около ' + item.a]);
    return mk(q, item.a, item.wrong, h, 'Олимпиада · логика');
  }
  function logicHandshakes(){
    var n = rand([8,10,12,15,18,20]);
    var ans = n * (n - 1) / 2;
    var q = 'На школьном сборе присутствуют ' + n + ' участников. Каждый пожал руку каждому ровно один раз. Сколько рукопожатий произойдёт всего?';
    var h = longHint('Каждая пара людей даёт ровно одно рукопожатие.', ['считаем число пар', 'используем формулу C(n,2)=n·(n−1)/2', n + '·' + (n - 1) + '/2 = ' + ans]);
    return mk(q, ans, [ans - n, ans + n, n * n], h, 'Олимпиада · логика');
  }
  function logicRemainders(){
    var base = rand([2,3,7,9]);
    var pow = rand([5,6,7,8,9,10,11,12]);
    var mod = rand([3,5,7,9,11]);
    while (mod === base) mod = rand([3,5,7,9,11]);
    var ans = 1;
    for (var i = 0; i < pow; i++) ans = (ans * base) % mod;
    var q = 'Найдите остаток от деления числа ' + base + '^' + pow + ' на ' + mod + '. Полный перебор не нужен: задача решается через цикл остатков.';
    var h = longHint('Выписываем несколько первых степеней по модулю ' + mod + '.', ['строим цикл остатков и замечаем период', 'сводим большую степень к остатку по длине периода', 'получаем остаток ' + ans]);
    return mk(q, ans, [String((ans + 1) % mod), String((ans + mod - 1) % mod), String(base % mod)], h, 'Олимпиада · логика');
  }
  function logicPigeonhole(){
    var boxes = rand([7,12]), total = boxes + rand([1,2,3,4]);
    var q = boxes === 12
      ? 'В классе ' + total + ' учеников. Можно ли гарантировать, что хотя бы двое из них родились в одном месяце?'
      : 'В коробке лежат носки ' + boxes + ' разных цветов, по много каждого цвета. Нужно вынуть ' + total + ' носков. Гарантируется ли, что хотя бы два носка будут одного цвета?';
    var h = longHint('Это принцип Дирихле.', ['если объектов больше, чем ящиков', 'хотя бы в одном ящике окажется минимум два объекта', total + ' > ' + boxes, 'поэтому ответ: да']);
    return mk(q, 'Да', ['Нет', 'Только если объектов вдвое больше', 'Недостаточно данных'], h, 'Олимпиада · логика');
  }
  function logicFamily(){ return rand([logicBirthday, logicHandshakes, logicRemainders, logicPigeonhole])(); }

  function crossPhysics(){
    var v = rand([54,72,90,108]), t = rand([2,3,4,5]), meters = Math.round(v / 3.6 * t), ans = meters + ' м';
    var q = 'Робот движется равномерно со скоростью ' + v + ' км/ч в течение ' + t + ' секунд. Какой путь он проходит? В ответе нужен путь в метрах.';
    var h = longHint('Сначала переводим скорость в м/с.', [v + ' км/ч = ' + (v / 3.6) + ' м/с', 'формула пути s = v·t', (v / 3.6) + '·' + t + ' = ' + meters + ' м']);
    return mk(q, ans, [Math.round(v*t) + ' м', Math.round(v/3.6) + ' м', Math.round(meters/2) + ' м'], h, 'Олимпиада · межпредметные');
  }
  function crossChemistry(){
    var hCount = rand([2,3,4]), oCount = rand([1,2,3]), formula = 'H' + (hCount > 1 ? hCount : '') + 'O' + (oCount > 1 ? oCount : ''), ans = hCount + 16 * oCount;
    var q = 'Найдите относительную молекулярную массу вещества ' + formula + '. Используйте Ar(H)=1 и Ar(O)=16.';
    var hint = longHint('Складываем вклад каждого атома.', [hCount + ' атом(а) H дают ' + hCount, oCount + ' атом(а) O дают ' + (16 * oCount), 'сумма = ' + ans]);
    return mk(q, ans, [ans + 1, ans + 8, 16 * oCount], hint, 'Олимпиада · межпредметные');
  }
  function crossAstronomy(){
    var item = rand([
      {q:'Почему на Луне астронавт может подпрыгнуть выше, чем на Земле?', a:'Из-за меньшего ускорения свободного падения', wrong:['Потому что на Луне нет воздуха','Потому что масса человека становится нулевой','Потому что скафандр работает как пружина']},
      {q:'Почему летом в умеренных широтах день длиннее, чем зимой?', a:'Из-за наклона земной оси к плоскости орбиты', wrong:['Из-за того, что Земля летом ближе к Солнцу','Из-за более высокой скорости вращения Земли летом','Из-за влияния Луны']},
      {q:'Почему на больших высотах вода закипает при более низкой температуре?', a:'Потому что атмосферное давление меньше', wrong:['Потому что вода становится легче','Потому что кислорода меньше','Потому что молекулы воды меняют состав']}
    ]);
    var hint = longHint('Нужно найти реальный физический механизм.', ['определяем, какая величина меняется в условии', 'связываем её с наблюдаемым эффектом', 'отбрасываем бытовые, но неверные объяснения']);
    return mk(item.q + ' Выберите наиболее точное объяснение.', item.a, item.wrong, hint, 'Олимпиада · межпредметные');
  }
  function crossConversions(){
    var item = rand([
      {q:'Переведите 2,5 кг в граммы.', a:'2500 г', wrong:['250 г','25 000 г','2,5 г'], h:'1 кг = 1000 г.'},
      {q:'Переведите 3,2 км в метры.', a:'3200 м', wrong:['320 м','32 000 м','3,2 м'], h:'1 км = 1000 м.'},
      {q:'Переведите 180° в радианы.', a:'π рад', wrong:['π/2 рад','2π рад','180π рад'], h:'180° соответствуют π радианам.'}
    ]);
    var hint = longHint('Это задача на единицы измерения.', [item.h, 'проверяем порядок величины', 'записываем ответ с единицей']);
    return mk(item.q, item.a, item.wrong, hint, 'Олимпиада · межпредметные');
  }
  function crossFamily(){ return rand([crossPhysics, crossChemistry, crossAstronomy, crossConversions])(); }

  function trapOrder(){
    var a = rand([2,3,4,5,6]), b = rand([2,3,4,5]), c = rand([2,3,4,5]), ans = a + b * c;
    var q = 'Ученик быстро посчитал выражение ' + a + ' + ' + b + ' × ' + c + ' и получил ' + ((a+b)*c) + '. Что должно получиться на самом деле?';
    var h = longHint('Сначала выполняются умножение и деление.', ['сначала ' + b + '×' + c + '=' + (b*c), 'только потом прибавляем ' + a, 'получаем ' + ans]);
    return mk(q, ans, [((a+b)*c), a*b + c, a + b + c], h, 'Олимпиада · ловушки');
  }
  function trapPercent(){
    var p = rand([10,20,25,30,40]), price = rand([400,500,600,800,1000]), discounted = Math.round(price * (100 - p) / 100);
    var q = 'Товар стоил ' + price + ' рублей. Сначала магазин сделал скидку ' + p + '%, а через неделю поднял цену на те же ' + p + '% уже от новой цены. Вернётся ли цена к исходной?';
    var h = longHint('Одинаковые проценты в разные стороны считаются от разных баз.', ['после скидки цена = ' + discounted, 'потом увеличиваем уже ' + discounted + ' на ' + p + '%', 'получаем ' + Math.round(discounted*(100+p)/100), 'это не равно исходным ' + price]);
    return mk(q, 'Нет', ['Да', 'Только если цена чётная', 'Недостаточно данных'], h, 'Олимпиада · ловушки');
  }
  function trapAverage(){
    var a = rand([2,4,6,8]), b = rand([12,14,16,18]), ans = (a + b) / 2;
    var q = 'Среднее арифметическое двух чисел равно ' + ans + '. Одно из чисел равно ' + a + '. Второе число какое? Некоторые ученики по ошибке отвечают ' + (ans - a) + '. Выберите правильный ответ.';
    var h = longHint('Среднее двух чисел — это сумма, делённая на 2.', ['восстанавливаем сумму: ' + ans + '·2 = ' + (2*ans), 'из суммы вычитаем известное число ' + a, 'получаем ' + b]);
    return mk(q, b, [ans - a, ans + a, a * b], h, 'Олимпиада · ловушки');
  }
  function trapGeometry(){
    var side = rand([4,5,6,7,8]), inc = rand([1,2,3]), oldArea = side * side, newArea = (side + inc) * (side + inc), diff = newArea - oldArea;
    var q = 'Квадрат со стороной ' + side + ' см увеличили так, что каждая сторона стала на ' + inc + ' см больше. На сколько квадратных сантиметров увеличилась площадь?';
    var h = longHint('Нельзя просто прибавить ' + inc + ' к площади.', ['старая площадь: ' + side + '^2 = ' + oldArea, 'новая площадь: ' + (side+inc) + '^2 = ' + newArea, 'разность = ' + diff]);
    return mk(q, diff, [2 * side * inc, oldArea + inc, newArea], h, 'Олимпиада · ловушки');
  }
  function trapFamily(){ return rand([trapOrder, trapPercent, trapAverage, trapGeometry])(); }

  function deepDerivative(){
    var a = rand([2,3,4,5]), b = rand([2,3,4]), ans = (a*b) + 'x^' + (b-1);
    var q = 'Найдите производную функции f(x) = ' + a + 'x^' + b + '. Ответ нужен в алгебраической форме.';
    var h = longHint('Используем правило (x^n)ʼ = n·x^(n−1).', ['производная от x^' + b + ' равна ' + b + 'x^' + (b-1), 'коэффициент ' + a + ' сохраняется', 'итог: ' + ans]);
    return mk(q, ans, [a + 'x^' + (b-1), (a+b) + 'x^' + (b-1), (a*b) + 'x^' + b], h, 'Олимпиада · углублённые');
  }
  function deepIntegral(){
    var a = rand([2,3,4,5]), b = rand([1,2,3,4]), pow = b + 1, ans = (a + '/' + pow) + 'x^' + pow + ' + C';
    var q = 'Найдите неопределённый интеграл ∫ ' + a + 'x^' + b + ' dx. Выберите правильный результат.';
    var h = longHint('При интегрировании степени показатель увеличивается на 1, а коэффициент делится на новый показатель.', ['новая степень: ' + pow, 'новый коэффициент: ' + a + '/' + pow, 'добавляем +C']);
    return mk(q, ans, [a + 'x^' + pow + ' + C', Math.round(a / pow) + 'x^' + b + ' + C', (a*pow) + 'x^' + pow + ' + C'], h, 'Олимпиада · углублённые');
  }
  function deepLimit(){
    var a = rand([2,3,4,5]), b = rand([1,2,3,4]), ans = a + '/' + b;
    var q = 'Вычислите предел lim ( ' + a + 'x + 1 ) / ( ' + b + 'x − 3 ) при x → ∞. Полный разбор выполнять не нужно, достаточно выбрать верный ответ.';
    var h = longHint('Для дроби из многочленов одинаковой степени при x → ∞ важны только старшие члены.', ['оставляем ' + a + 'x и ' + b + 'x', 'отношение коэффициентов = ' + a + '/' + b, 'это и есть предел']);
    return mk(q, ans, ['0', '∞', String((a+b)/b)], h, 'Олимпиада · углублённые');
  }
  function deepMatrix(){
    var a = rand([1,2,3,4]), b = rand([0,1,2,3]), c = rand([0,1,2,3]), d = rand([1,2,3,4]), ans = a*d - b*c;
    var q = 'Для матрицы [[ ' + a + ', ' + b + ' ], [ ' + c + ', ' + d + ' ]] найдите определитель. Вспомните формулу для матрицы 2×2.';
    var h = longHint('Определитель матрицы 2×2 считается как ad − bc.', [a + '·' + d + ' = ' + (a*d), b + '·' + c + ' = ' + (b*c), 'разность = ' + ans]);
    return mk(q, ans, [a*d + b*c, a + d - b - c, a + d], h, 'Олимпиада · углублённые');
  }
  function deepFamily(){ return rand([deepDerivative, deepIntegral, deepLimit, deepMatrix])(); }

  function theoryMap(){
    return {
      logic: '<h3>Логика и смекалка</h3><p><b>Главные инструменты:</b> принцип Дирихле, подсчёт пар, циклы остатков, рассмотрение противоположного события.</p><ol><li>Сначала формализуй условие: что считается, что гарантируется и что требуется найти.</li><li>Если речь о совпадениях или «хотя бы один раз», часто удобно считать противоположное событие.</li><li>Если задача про рукопожатия, связи, отрезки между объектами — почти всегда нужно считать пары.</li><li>Если в условии большие степени и деление с остатком — ищи период.</li></ol><div class="ex">При 23 людях вероятность совпадения дней рождения уже около 50%, хотя интуитивно кажется, что она должна быть намного меньше.</div>',
      cross: '<h3>Межпредметные задачи</h3><p>Здесь побеждает не зазубривание, а аккуратный перевод между языками разных предметов: формулы, единицы, базовые законы природы.</p><ol><li>Проверь единицы измерения до вычислений.</li><li>В физике сначала приведи всё к СИ, потом подставляй в формулу.</li><li>В химии и биологии выписывай, какие величины даны прямо, а какие нужно восстановить по смыслу.</li><li>В астрономии и географии ищи причинно-следственную связь, а не красивый, но бытовой ответ.</li></ol><div class="ex">Типичная ошибка: подставить км/ч напрямую в формулу пути, если ответ требуется в метрах.</div>',
      traps: '<h3>Ловушки</h3><p>Ловушки проверяют не сложность, а дисциплину мышления. Большинство ошибок появляется из-за спешки.</p><ol><li>Следи за порядком действий.</li><li>Проверяй, от какой базы считается процент.</li><li>Не путай среднее, сумму и разность.</li><li>В геометрии отделяй изменение длины от изменения площади.</li></ol><div class="ex">Скидка 20% и потом наценка 20% не возвращают цену обратно: проценты считаются от разных величин.</div>',
      deep: '<h3>Углублённые задачи</h3><p>Алгоритм важнее памяти на отдельный ответ.</p><ol><li>Для производной вспоминай базовое правило и цепочку преобразований.</li><li>Для интеграла увеличивай степень на 1 и дели коэффициент на новый показатель.</li><li>Для пределов при x → ∞ сравнивай старшие степени.</li><li>Для матрицы 2×2 держи в голове формулу ad − bc.</li></ol><div class="ex">Перед тем как считать предел, спроси себя: какие слагаемые реально влияют на поведение выражения при очень больших x?</div>'
    };
  }

  function patchOlympiad(){
    if (!Array.isArray(window.SUBJ)) return false;
    var oly = null;
    for (var i = 0; i < window.SUBJ.length; i++) if (window.SUBJ[i] && window.SUBJ[i].id === 'oly') { oly = window.SUBJ[i]; break; }
    if (!oly || !Array.isArray(oly.tops)) return false;
    var th = theoryMap();
    if (window.OLY_TH && typeof window.OLY_TH === 'object') Object.keys(th).forEach(function(key){ window.OLY_TH[key] = th[key]; });
    oly.tops.forEach(function(topic){
      if (!topic || !topic.id) return;
      if (th[topic.id]) topic.th = th[topic.id];
      if (topic.id === 'logic') topic.gen = logicFamily;
      if (topic.id === 'cross') topic.gen = crossFamily;
      if (topic.id === 'traps') topic.gen = trapFamily;
      if (topic.id === 'deep') topic.gen = deepFamily;
    });
    return true;
  }

  function init(){ patchOlympiad(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.wave41Debug = window.wave41Debug || {};
  window.wave41Debug.olyPatched = patchOlympiad;
  window.wave41Debug.sampleOlympiad = function(kind){
    var map = { logic:logicFamily, cross:crossFamily, traps:trapFamily, deep:deepFamily };
    return map[kind || 'logic'] ? map[kind || 'logic']() : null;
  };
})();

;/* ---- chunk_roadmap_wave86n_progress_tools.js ---- */
/* --- wave86n_progress_tools.js --- */
(function(){
  if (typeof window === 'undefined' || window.wave86nProgressTools) return;

  var VERSION = 'wave86n';
  var STYLE_ID = 'wave86n-progress-tools-style';
  var OBSERVER_FLAG = '__wave86nProgressToolsObserver';

  function grade(){ return String(window.GRADE_NUM || '10'); }
  function subjects(){ return Array.isArray(window.SUBJ) ? window.SUBJ : []; }
  function esc(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function toNum(value){ return Number(value || 0) || 0; }
  function pct(ok, total){ return total > 0 ? Math.round((ok / total) * 100) : 0; }
  function localDateISO(date){
    var d = date instanceof Date ? date : new Date(date);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function addDays(date, delta){
    var d = date instanceof Date ? new Date(date.getTime()) : new Date(date);
    d.setDate(d.getDate() + delta);
    return d;
  }
  function fmtRuDate(iso){
    try { return new Date(iso + 'T12:00:00').toLocaleDateString('ru-RU', { day:'numeric', month:'short' }).replace('.', ''); }
    catch (_) { return iso; }
  }
  function readJSON(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (_) {
      return fallback;
    }
  }
  function progress(){
    var data = readJSON('trainer_progress_' + grade(), {});
    return data && typeof data === 'object' ? data : {};
  }
  function streakState(){
    var data = readJSON('trainer_streak_' + grade(), {});
    return data && typeof data === 'object' ? data : {};
  }
  function dailyState(){
    var data = readJSON('trainer_daily_' + grade(), null);
    return data && typeof data === 'object' ? data : null;
  }
  function activityRows(){
    var list = readJSON('trainer_activity_' + grade(), []);
    if (!Array.isArray(list)) list = [];
    var byDate = {};
    list.forEach(function(row){
      if (row && row.date) byDate[String(row.date)] = Object.assign({}, row);
    });
    var today = dailyState();
    if (today && today.date) {
      byDate[String(today.date)] = Object.assign({}, byDate[String(today.date)] || {}, {
        date: String(today.date),
        ok: toNum(today.ok),
        err: toNum(today.err),
        pure: toNum(today.pure),
        mixErr: toNum(today.mixErr),
        total: toNum(today.ok) + toNum(today.err)
      });
    }
    return Object.keys(byDate).sort().map(function(date){ return byDate[date]; });
  }
  function isDayDone(row){
    if (!row) return false;
    var total = toNum(row.total != null ? row.total : toNum(row.ok) + toNum(row.err));
    var ok = toNum(row.ok);
    var pure = toNum(row.pure);
    var mixErr = toNum(row.mixErr);
    return (pure >= 20 && mixErr === 0) || (total >= 100 && ok / Math.max(1, total) >= 0.75);
  }
  function dayLevel(row){
    if (!row) return 0;
    var total = toNum(row.total != null ? row.total : toNum(row.ok) + toNum(row.err));
    if (isDayDone(row)) return 3;
    if (total >= 20 || toNum(row.pure) >= 10) return 2;
    if (total > 0 || toNum(row.pure) > 0) return 1;
    return 0;
  }
  function topicStats(subjId, topicId){
    var prog = progress();
    var row = prog[subjId] && prog[subjId][topicId] ? prog[subjId][topicId] : {};
    var ok = toNum(row.ok);
    var err = toNum(row.err);
    return { ok: ok, err: err, total: ok + err, pct: pct(ok, ok + err), last: row.last || '' };
  }
  function starsForStats(stats){
    var total = toNum(stats && stats.total);
    var value = toNum(stats && stats.pct);
    if (total >= 10 && value >= 85) return 3;
    if (total >= 6 && value >= 70) return 2;
    if (total >= 3 && value >= 50) return 1;
    return 0;
  }
  function starText(count){
    count = Math.max(0, Math.min(3, toNum(count)));
    return '★'.repeat(count) + '☆'.repeat(3 - count);
  }
  function subjectStats(subj){
    var ok = 0;
    var err = 0;
    var stars = 0;
    var mastered = 0;
    var topics = Array.isArray(subj && subj.tops) ? subj.tops : [];
    topics.forEach(function(topic){
      var s = topicStats(subj.id, topic.id);
      ok += s.ok;
      err += s.err;
      var st = starsForStats(s);
      stars += st;
      if (st === 3) mastered += 1;
    });
    var total = ok + err;
    return {
      ok: ok,
      err: err,
      total: total,
      pct: pct(ok, total),
      topics: topics.length,
      stars: stars,
      maxStars: topics.length * 3,
      mastered: mastered
    };
  }
  function findSubjectByName(text){
    text = String(text || '').toLowerCase().replace(/ё/g, 'е').trim();
    if (!text) return null;
    var list = subjects();
    for (var i = 0; i < list.length; i++) {
      var name = String(list[i].nm || '').toLowerCase().replace(/ё/g, 'е').trim();
      if (text.indexOf(name) === 0 || name.indexOf(text) === 0) return list[i];
    }
    return null;
  }
  function currentSubject(){
    var hdr = document.getElementById('hdr');
    var text = hdr ? hdr.textContent : '';
    return findSubjectByName(String(text || '').toLowerCase());
  }
  function findTopicByName(subj, text){
    if (!subj || !Array.isArray(subj.tops)) return null;
    var needle = String(text || '').toLowerCase().replace(/ё/g, 'е').trim();
    if (!needle) return null;
    for (var i = 0; i < subj.tops.length; i++) {
      var topic = subj.tops[i];
      var name = String(topic.nm || '').toLowerCase().replace(/ё/g, 'е').trim();
      if (name === needle || needle.indexOf(name) === 0 || name.indexOf(needle) === 0) return topic;
    }
    return null;
  }
  function ensureStyles(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave86n-subject-progress{margin-top:7px;height:6px;border-radius:999px;background:rgba(107,107,126,.16);overflow:hidden}',
      '.wave86n-subject-progress span{display:block;height:100%;border-radius:999px;background:currentColor;transition:width .18s ease}',
      '.wave86n-subject-meta{margin-top:4px;font-size:10px;line-height:1.35;color:var(--muted);font-weight:700}',
      '.wave86n-topic-stars{margin-left:auto;margin-right:8px;font:900 11px/1 JetBrains Mono,monospace;color:#f59e0b;letter-spacing:-1px;white-space:nowrap}',
      '.wave86n-tool-btn{border:none;border-radius:10px;padding:8px 10px;font:800 11px/1.1 Golos Text,system-ui,sans-serif;cursor:pointer;background:rgba(37,99,235,.1);color:#2563eb}',
      '.wave86n-tool-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}',
      '.wave86n-export-row{display:flex;gap:8px;margin:10px 0 14px;flex-wrap:wrap}',
      '.wave86n-export-row button{flex:1;min-width:132px;border:1px solid var(--border);border-radius:12px;padding:10px 12px;background:var(--card);color:var(--text);font:800 12px/1 Golos Text,system-ui,sans-serif;cursor:pointer}',
      '.wave86n-modal{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.52);display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto}',
      '.wave86n-card{width:min(440px,100%);max-height:88vh;overflow:auto;background:var(--card,#fff);color:var(--text,#1a1a2e);border:1px solid var(--border,#e2e0d8);border-radius:18px;padding:20px;box-shadow:0 18px 50px rgba(0,0,0,.24)}',
      '.wave86n-card h3{margin:0 0 10px;font-family:Unbounded,system-ui,sans-serif;font-size:16px;font-weight:900;text-align:center}',
      '.wave86n-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:12px}',
      '.wave86n-day{aspect-ratio:1;border-radius:10px;display:flex;align-items:center;justify-content:center;font:800 11px/1 JetBrains Mono,monospace;border:1px solid rgba(107,107,126,.16);background:rgba(107,107,126,.08);color:var(--muted)}',
      '.wave86n-day[data-level="1"]{background:#dbeafe;color:#1d4ed8}',
      '.wave86n-day[data-level="2"]{background:#fef3c7;color:#92400e}',
      '.wave86n-day[data-level="3"]{background:#dcfce7;color:#15803d}',
      '.wave86n-card .close{width:100%;margin-top:14px;border:none;border-radius:12px;padding:12px;background:var(--text,#1a1a2e);color:var(--bg,#fff);font:800 13px/1 Golos Text,system-ui,sans-serif;cursor:pointer}',
      '.wave86n-summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}',
      '.wave86n-summary-grid div{border:1px solid var(--border,#e2e0d8);border-radius:12px;padding:9px;text-align:center}',
      '.wave86n-summary-grid b{display:block;font-size:18px;margin-bottom:2px}',
      '.wave86n-summary-grid span{font-size:10px;color:var(--muted)}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }
  function decorateSubjectCards(){
    var cards = document.querySelectorAll('#sg .scard');
    cards.forEach(function(card){
      var nameNode = card.querySelector('.nm');
      if (!nameNode) return;
      var raw = nameNode.childNodes && nameNode.childNodes.length ? nameNode.childNodes[0].textContent : nameNode.textContent;
      var subj = findSubjectByName(raw);
      if (!subj) return;
      var box = card.children && card.children[1] ? card.children[1] : nameNode.parentElement;
      if (!box || box.querySelector('.wave86n-subject-progress')) return;
      var stats = subjectStats(subj);
      var color = stats.total ? (stats.pct >= 80 ? 'var(--green)' : stats.pct >= 50 ? 'var(--orange)' : 'var(--red)') : 'var(--muted)';
      var progress = document.createElement('div');
      progress.className = 'wave86n-subject-progress';
      progress.style.color = color;
      progress.setAttribute('aria-label', 'Прогресс предмета ' + stats.pct + '%');
      progress.innerHTML = '<span style="width:' + (stats.total ? stats.pct : 0) + '%"></span>';
      var meta = document.createElement('div');
      meta.className = 'wave86n-subject-meta';
      meta.textContent = stats.total ? ('⭐ ' + stats.stars + '/' + stats.maxStars + ' · освоено тем: ' + stats.mastered + '/' + stats.topics) : ('⭐ 0/' + stats.maxStars + ' · начни первую тему');
      box.appendChild(progress);
      box.appendChild(meta);
    });
  }
  function decorateTopicButtons(){
    var subj = currentSubject();
    if (!subj) return;
    var buttons = document.querySelectorAll('#tl .tbtn');
    buttons.forEach(function(btn){
      if (btn.querySelector('.wave86n-topic-stars')) return;
      var labelNode = btn.querySelector('span[style*="flex:1"]') || btn.children[1];
      if (!labelNode) return;
      var label = String(labelNode.textContent || '').trim();
      if (!label || /вперемешку|диагностика/i.test(label)) return;
      var topic = findTopicByName(subj, label);
      if (!topic) return;
      var stats = topicStats(subj.id, topic.id);
      var stars = starsForStats(stats);
      var node = document.createElement('span');
      node.className = 'wave86n-topic-stars';
      node.textContent = starText(stars);
      node.title = stats.total ? ('Звёзды темы: ' + stars + '/3 · ' + stats.pct + '% · ' + stats.total + ' ответов') : 'Звёзды темы: 0/3 · ещё нет ответов';
      node.setAttribute('aria-label', node.title);
      var pctNode = btn.querySelector('.tpct');
      btn.insertBefore(node, pctNode || null);
    });
  }
  function ensureDailyTools(){
    var host = document.querySelector('#daily-meter .dm');
    if (!host || host.querySelector('.wave86n-tool-row')) return;
    var row = document.createElement('div');
    row.className = 'wave86n-tool-row';
    row.innerHTML = '<button type="button" class="wave86n-tool-btn" onclick="wave86nProgressTools.showStreakCalendar()">📆 Календарь серии</button><button type="button" class="wave86n-tool-btn" onclick="wave86nProgressTools.exportParentProgress(\'csv\')">⬇️ CSV</button><button type="button" class="wave86n-tool-btn" onclick="wave86nProgressTools.exportParentProgress(\'json\')">⬇️ JSON</button>';
    host.appendChild(row);
  }
  function ensureProgressExportRow(){
    var content = document.getElementById('prog-content');
    if (!content || document.getElementById('wave86n-export-row')) return;
    var row = document.createElement('div');
    row.id = 'wave86n-export-row';
    row.className = 'wave86n-export-row';
    row.innerHTML = '<button type="button" onclick="wave86nProgressTools.exportParentProgress(\'csv\')">⬇️ CSV для родителя</button><button type="button" onclick="wave86nProgressTools.exportParentProgress(\'json\')">⬇️ JSON прогресса</button><button type="button" onclick="wave86nProgressTools.showStreakCalendar()">📆 Календарь серии</button>';
    content.parentNode.insertBefore(row, content.nextSibling);
  }
  function buildSnapshot(){
    var streak = streakState();
    var rows = [];
    var totals = { ok:0, err:0, topics:0, mastered:0, stars:0, maxStars:0 };
    subjects().forEach(function(subj){
      (subj.tops || []).forEach(function(topic){
        var stats = topicStats(subj.id, topic.id);
        var stars = starsForStats(stats);
        rows.push({
          grade: grade(),
          subjectId: subj.id,
          subject: subj.nm,
          topicId: topic.id,
          topic: topic.nm,
          ok: stats.ok,
          err: stats.err,
          total: stats.total,
          accuracyPct: stats.pct,
          stars: stars,
          last: stats.last || ''
        });
        totals.ok += stats.ok;
        totals.err += stats.err;
        totals.topics += 1;
        totals.stars += stars;
        totals.maxStars += 3;
        if (stars === 3) totals.mastered += 1;
      });
    });
    var activity = activityRows();
    var activeDays = activity.filter(function(row){ return toNum(row.total) > 0 || toNum(row.pure) > 0; }).length;
    var doneDays = activity.filter(isDayDone).length;
    return {
      app: 'trainer3',
      wave: VERSION,
      generatedAt: new Date().toISOString(),
      grade: grade(),
      summary: {
        ok: totals.ok,
        err: totals.err,
        total: totals.ok + totals.err,
        accuracyPct: pct(totals.ok, totals.ok + totals.err),
        topics: totals.topics,
        masteredTopics: totals.mastered,
        stars: totals.stars,
        maxStars: totals.maxStars,
        activeDays: activeDays,
        doneDays: doneDays,
        currentStreak: toNum(streak.current),
        bestStreak: toNum(streak.best)
      },
      topics: rows,
      activity: activity
    };
  }
  function csvEscape(value){
    var s = String(value == null ? '' : value);
    return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function snapshotToCSV(snapshot){
    var header = ['grade','subject','topic','ok','err','total','accuracyPct','stars','last'];
    var lines = [header.join(';')];
    snapshot.topics.forEach(function(row){
      lines.push(header.map(function(key){ return csvEscape(row[key]); }).join(';'));
    });
    lines.push('');
    lines.push(['summary','total',snapshot.summary.total,'accuracyPct',snapshot.summary.accuracyPct,'stars',snapshot.summary.stars + '/' + snapshot.summary.maxStars].map(csvEscape).join(';'));
    lines.push(['summary','activeDays',snapshot.summary.activeDays,'doneDays',snapshot.summary.doneDays,'currentStreak',snapshot.summary.currentStreak,'bestStreak',snapshot.summary.bestStreak].map(csvEscape).join(';'));
    return lines.join('\n');
  }
  function downloadFile(filename, mime, content){
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(function(){ URL.revokeObjectURL(url); link.remove(); }, 0);
  }
  function exportParentProgress(format){
    var snapshot = buildSnapshot();
    var stamp = localDateISO(new Date());
    if (format === 'json') {
      downloadFile('trainer_grade' + grade() + '_progress_' + stamp + '.json', 'application/json;charset=utf-8', JSON.stringify(snapshot, null, 2));
    } else {
      downloadFile('trainer_grade' + grade() + '_progress_' + stamp + '.csv', 'text/csv;charset=utf-8', '\ufeff' + snapshotToCSV(snapshot));
    }
  }
  function calendarRows(){
    var rows = activityRows();
    var byDate = {};
    rows.forEach(function(row){ if (row && row.date) byDate[String(row.date)] = row; });
    var today = new Date();
    var out = [];
    for (var i = 41; i >= 0; i--) {
      var date = addDays(today, -i);
      var iso = localDateISO(date);
      var row = byDate[iso] || { date: iso, ok:0, err:0, total:0, pure:0 };
      out.push(row);
    }
    return out;
  }
  function showStreakCalendar(){
    ensureStyles();
    var rows = calendarRows();
    var streak = streakState();
    var active = rows.filter(function(row){ return toNum(row.total) > 0 || toNum(row.pure) > 0; }).length;
    var done = rows.filter(isDayDone).length;
    var html = '<div class="wave86n-card" onclick="event.stopPropagation()">' +
      '<h3>📆 Календарь серии</h3>' +
      '<div style="font-size:12px;color:var(--muted);line-height:1.5;text-align:center">Последние 42 дня. Зелёный день — дневная норма или рывок 20/20.</div>' +
      '<div class="wave86n-summary-grid"><div><b>' + esc(toNum(streak.current)) + '</b><span>текущая серия</span></div><div><b>' + esc(toNum(streak.best)) + '</b><span>рекорд</span></div><div><b>' + esc(done) + '/' + esc(active || 0) + '</b><span>дней закрыто</span></div></div>' +
      '<div class="wave86n-cal">' + rows.map(function(row){
        var level = dayLevel(row);
        var total = toNum(row.total != null ? row.total : toNum(row.ok) + toNum(row.err));
        var label = fmtRuDate(row.date) + ': ' + (total ? (toNum(row.ok) + '/' + total + ' верно') : 'нет занятий') + (isDayDone(row) ? ' · норма выполнена' : '');
        return '<div class="wave86n-day" data-level="' + level + '" title="' + esc(label) + '">' + esc(String(Number(row.date.slice(-2)))) + '</div>';
      }).join('') + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:12px;font-size:11px;color:var(--muted);justify-content:center;flex-wrap:wrap"><span>□ нет</span><span>🟦 старт</span><span>🟨 активно</span><span>🟩 закрыто</span></div>' +
      '<button type="button" class="close" onclick="this.closest(\'.wave86n-modal\').remove()">Закрыть</button>' +
      '</div>';
    var modal = document.createElement('div');
    modal.className = 'wave86n-modal';
    modal.innerHTML = html;
    modal.onclick = function(){ modal.remove(); };
    document.body.appendChild(modal);
  }
  function enhance(){
    ensureStyles();
    decorateSubjectCards();
    decorateTopicButtons();
    ensureDailyTools();
    ensureProgressExportRow();
  }
  var scheduled = false;
  function scheduleEnhance(){
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function(){ scheduled = false; enhance(); });
  }
  function initObserver(){
    if (window[OBSERVER_FLAG] || !document.body || typeof MutationObserver === 'undefined') return;
    window[OBSERVER_FLAG] = true;
    var observer = new MutationObserver(scheduleEnhance);
    observer.observe(document.body, { childList:true, subtree:true });
  }

  window.wave86nProgressTools = {
    version: VERSION,
    buildSnapshot: buildSnapshot,
    exportParentProgress: exportParentProgress,
    showStreakCalendar: showStreakCalendar,
    enhance: enhance
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ enhance(); initObserver(); });
  } else {
    enhance();
    initObserver();
  }
})();

;/* ---- chunk_roadmap_wave86p_exam_challenge.js ---- */
/* --- wave86p: exam mode + weekly challenge + local leaderboards --- */
(function(){
  if (typeof window === 'undefined') return;
  if (window.wave86pChallenge) return;

  var VERSION = 'wave86p';
  var CARD_ID = 'wave86p-challenge-card';
  var STYLE_ID = 'wave86p-challenge-style';
  var MODAL_ID = 'wave86p-modal';
  var COUNT = 20;
  var EXAM_SECONDS = 10 * 60;

  function gradeKey(){ return String(window.GRADE_NUM || ''); }
  function storeKey(){ return 'trainer_wave86p_results_' + gradeKey(); }
  function progressKey(){ return 'trainer_progress_' + gradeKey(); }
  function streakKey(){ return 'trainer_streak_' + gradeKey(); }
  function dailyKey(){ return 'trainer_daily_' + gradeKey(); }
  function activityKey(){ return 'trainer_activity_' + gradeKey(); }
  function weekId(ts){
    var d = new Date(ts || Date.now());
    var target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var day = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - day);
    var yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    var week = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
    return target.getUTCFullYear() + '-W' + String(week).padStart(2, '0');
  }
  function today(){ return new Date().toISOString().slice(0, 10); }
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function toNum(v){ return Number(v || 0) || 0; }
  function pct(ok, total){ return total ? Math.round(ok / total * 100) : 0; }
  function markFromPct(value){ return value >= 85 ? 5 : value >= 65 ? 4 : value >= 45 ? 3 : 2; }
  function declNum(n, one, two, five){
    n = Math.abs(Number(n) || 0);
    var mod100 = n % 100;
    var mod10 = n % 10;
    if (mod100 > 10 && mod100 < 20) return five;
    if (mod10 > 1 && mod10 < 5) return two;
    if (mod10 === 1) return one;
    return five;
  }
  function safeRead(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(_) { return fallback; }
  }
  function safeWrite(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(_) {}
  }
  function playerName(){
    try {
      if (typeof window.getPlayerName === 'function') return window.getPlayerName() || 'Ученик';
      return localStorage.getItem('trainer_player_name') || 'Ученик';
    } catch(_) { return 'Ученик'; }
  }
  function hashSeed(seed){
    var str = String(seed == null ? '' : seed);
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function seededRandomFactory(seed){
    var state = hashSeed(seed) || 123456789;
    return function(){
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }
  function stableShuffle(list, seed){
    var out = (list || []).slice();
    var rnd = seededRandomFactory(seed);
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }
  function withSeed(seed, fn){
    var old = Math.random;
    Math.random = seededRandomFactory(seed);
    try { return fn(); }
    finally { Math.random = old; }
  }
  function optionFillers(answer){
    var a = String(answer == null ? '' : answer);
    var out = [];
    function push(v){ v = String(v); if (v && v !== a && out.indexOf(v) === -1) out.push(v); }
    var n = Number(a.replace(',', '.'));
    if (isFinite(n) && a.trim() !== '') {
      [-2, -1, 1, 2, 3, 5].forEach(function(delta){ push(String(n + delta)); });
      if (n % 1) [-0.5, -0.1, 0.1, 0.5].forEach(function(delta){ push(String(+(n + delta).toFixed(2))); });
    }
    ['верно', 'неверно', 'нельзя определить', 'оба варианта', 'нет правильного ответа', 'другое значение', 'зависит от условия'].forEach(push);
    return out;
  }
  function normalizeQuestion(row, meta, seed){
    if (!row || typeof row !== 'object') return null;
    var q = row.question != null ? row.question : row.q;
    var answer = row.answer != null ? row.answer : row.a;
    if (q == null || answer == null) return null;
    var opts = [];
    if (Array.isArray(row.options)) opts = row.options.slice();
    else if (Array.isArray(row.opts)) opts = row.opts.slice();
    else if (Array.isArray(row.o)) opts = [answer].concat(row.o);
    opts.unshift(answer);
    var seen = {};
    opts = opts.filter(function(v){
      var key = String(v);
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
    var fillers = optionFillers(answer);
    var k = 0;
    while (opts.length < 4 && k < fillers.length) {
      if (opts.indexOf(fillers[k]) === -1) opts.push(fillers[k]);
      k++;
    }
    while (opts.length < 4) opts.push('вариант ' + opts.length);
    opts = stableShuffle(opts.slice(0, 4), seed + ':opts');
    return {
      question: String(q),
      answer: String(answer),
      options: opts,
      hint: row.hint || row.h || 'Разбери правило в теории темы и попробуй похожий вопрос ещё раз.',
      ex: row.ex || row.explain || row.explanation || '',
      code: row.code || null,
      tag: row.tag || (meta.topic && meta.topic.nm) || 'Тема',
      subjectId: meta.subject.id,
      subjectName: meta.subject.nm,
      topicId: meta.topic.id,
      topicName: meta.topic.nm,
      color: row.color || meta.subject.cl || 'var(--accent)',
      bg: row.bg || meta.subject.bg || 'var(--abg)'
    };
  }
  function unlocked(subject){
    if (!subject || !subject.locked) return true;
    var s = safeRead(streakKey(), {});
    return toNum(s.totalOk) >= toNum(subject.unlockAt);
  }
  function subjects(){
    var list = Array.isArray(window.SUBJ) ? window.SUBJ : [];
    return list.filter(function(s){ return s && !s.hidden && unlocked(s) && Array.isArray(s.tops); });
  }
  function topicPool(subjectId){
    var out = [];
    subjects().forEach(function(subject){
      if (subjectId && subject.id !== subjectId) return;
      (subject.tops || []).forEach(function(topic){
        if (topic && typeof topic.gen === 'function') out.push({ subject: subject, topic: topic });
      });
    });
    return out;
  }
  function buildDeck(mode, subjectId, count, fixedSeed){
    var pool = topicPool(subjectId);
    count = count || COUNT;
    if (!pool.length) return [];
    var seed = fixedSeed || [VERSION, gradeKey(), mode, subjectId || 'all', mode === 'weekly' ? weekId() : Date.now()].join(':');
    pool = stableShuffle(pool, seed + ':pool');
    var deck = [];
    var extras = [];
    var seen = {};
    var guard = 0;
    while (deck.length < count && guard < count * 12) {
      var meta = pool[guard % pool.length];
      var qSeed = seed + ':q:' + guard + ':' + meta.subject.id + ':' + meta.topic.id;
      var raw = null;
      try { raw = withSeed(qSeed, function(){ return meta.topic.gen(); }); } catch(_) { raw = null; }
      var item = normalizeQuestion(raw, meta, qSeed);
      if (item) {
        var key = item.question + '|' + item.answer;
        if (!seen[key]) { seen[key] = true; deck.push(item); }
        else { extras.push(item); }
      }
      guard++;
    }
    while (deck.length < count && extras.length) deck.push(extras.shift());
    return deck;
  }
  function readResults(){
    var rows = safeRead(storeKey(), []);
    return Array.isArray(rows) ? rows : [];
  }
  function saveResult(entry){
    var rows = readResults();
    rows.unshift(entry);
    safeWrite(storeKey(), rows.slice(0, 120));
  }
  function updateProgress(deck, answers){
    var prog = safeRead(progressKey(), {});
    deck.forEach(function(q, i){
      if (!q || !q.subjectId || !q.topicId) return;
      prog[q.subjectId] = prog[q.subjectId] || {};
      prog[q.subjectId][q.topicId] = prog[q.subjectId][q.topicId] || { ok:0, err:0 };
      var row = prog[q.subjectId][q.topicId];
      if (answers[i] === q.answer) row.ok = toNum(row.ok) + 1;
      else row.err = toNum(row.err) + 1;
      row.last = new Date().toLocaleDateString('ru-RU');
    });
    safeWrite(progressKey(), prog);
  }
  function updateDaily(ok, err){
    var d = safeRead(dailyKey(), { date: today(), ok:0, err:0, pure:0, subjs:{} });
    if (!d || typeof d !== 'object' || d.date !== today()) d = { date: today(), ok:0, err:0, pure:0, subjs:{} };
    d.ok = toNum(d.ok) + ok;
    d.err = toNum(d.err) + err;
    if (err === 0) d.pure = toNum(d.pure) + ok;
    safeWrite(dailyKey(), d);
    var a = safeRead(activityKey(), []);
    if (!Array.isArray(a)) a = [];
    var row = a.filter(function(x){ return x && x.date === today(); })[0];
    if (!row) { row = { date: today(), ok:0, err:0, pure:0, total:0 }; a.push(row); }
    row.ok = toNum(row.ok) + ok;
    row.err = toNum(row.err) + err;
    row.total = toNum(row.ok) + toNum(row.err);
    if (err === 0) row.pure = toNum(row.pure) + ok;
    a.sort(function(x, y){ return String(x.date).localeCompare(String(y.date)); });
    safeWrite(activityKey(), a.slice(-365));
  }
  function updateStreakTotals(ok, total){
    var s = safeRead(streakKey(), {});
    if (!s || typeof s !== 'object') s = {};
    s.totalQs = toNum(s.totalQs) + total;
    s.totalOk = toNum(s.totalOk) + ok;
    s.badges = Array.isArray(s.badges) ? s.badges : [];
    safeWrite(streakKey(), s);
  }
  function css(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '' +
      '.w86p-card{margin:12px 0;padding:14px;border-radius:16px;background:linear-gradient(135deg,rgba(37,99,235,.12),rgba(124,58,237,.10));border:1px solid rgba(37,99,235,.18)}' +
      '.w86p-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}.w86p-icon{font-size:24px}.w86p-title{font-weight:900;font-size:14px;font-family:Unbounded,system-ui,sans-serif}.w86p-sub{font-size:11px;color:var(--muted);margin-top:2px;line-height:1.35}.w86p-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.w86p-btn{border:none;border-radius:12px;padding:10px 8px;background:var(--card);color:var(--text);border:1px solid var(--border);font-size:12px;font-weight:800;cursor:pointer;font-family:Golos Text,system-ui,sans-serif}.w86p-btn.primary{background:var(--accent);color:#fff;border-color:var(--accent)}' +
      '.w86p-mask{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto}.w86p-box{background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:20px;max-width:560px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:0 20px 50px rgba(0,0,0,.35);padding:18px}.w86p-top{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}.w86p-close{margin-left:auto;border:none;background:transparent;color:var(--muted);font-size:24px;line-height:1;cursor:pointer}.w86p-meta{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.w86p-pill{border-radius:999px;background:var(--abg);color:var(--muted);font-size:11px;font-weight:800;padding:5px 8px}.w86p-progress{height:8px;background:var(--abg);border-radius:999px;overflow:hidden;margin:10px 0}.w86p-fill{height:100%;background:var(--accent);border-radius:999px}.w86p-q{padding:14px;border-radius:14px;background:var(--abg);margin:12px 0}.w86p-tag{display:inline-flex;margin-bottom:8px;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:900}.w86p-qtext{font-size:16px;font-weight:800;line-height:1.45}.w86p-code{white-space:pre-wrap;font-family:JetBrains Mono,monospace;font-size:12px;background:rgba(0,0,0,.08);padding:10px;border-radius:10px;margin-top:8px}.w86p-options{display:grid;gap:8px}.w86p-opt{display:flex;align-items:center;gap:10px;text-align:left;border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:13px;padding:12px;cursor:pointer;font-weight:700;font-family:Golos Text,system-ui,sans-serif}.w86p-opt .k{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:var(--abg);font-weight:900}.w86p-opt.ok{border-color:var(--green);background:var(--gbg)}.w86p-opt.no{border-color:var(--red);background:var(--rbg)}.w86p-opt.dim{opacity:.62}.w86p-next{width:100%;margin-top:12px}.w86p-breakdown{display:grid;gap:8px;margin:12px 0}.w86p-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px}.w86p-row b{flex:1}.w86p-score{font-family:Unbounded,system-ui,sans-serif;font-size:40px;font-weight:900;text-align:center;margin:8px 0}.w86p-subject-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.w86p-lb-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.w86p-lb-tabs button{border:1px solid var(--border);background:var(--abg);color:var(--text);border-radius:999px;padding:6px 9px;font-size:11px;font-weight:800;cursor:pointer}.w86p-empty{text-align:center;color:var(--muted);font-size:13px;padding:24px 8px}' +
      '@media(max-width:520px){.w86p-actions,.w86p-subject-grid{grid-template-columns:1fr}.w86p-qtext{font-size:15px}}';
    document.head.appendChild(style);
  }
  function modal(inner){
    closeModal();
    css();
    var mask = document.createElement('div');
    mask.id = MODAL_ID;
    mask.className = 'w86p-mask';
    mask.setAttribute('role', 'dialog');
    mask.setAttribute('aria-modal', 'true');
    mask.innerHTML = '<div class="w86p-box">' + inner + '</div>';
    mask.addEventListener('click', function(ev){ if (ev.target === mask) confirmClose(); });
    document.body.appendChild(mask);
    var focus = mask.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (focus && focus.focus) setTimeout(function(){ focus.focus(); }, 30);
    return mask;
  }
  function closeModal(){
    var old = document.getElementById(MODAL_ID);
    if (old) old.remove();
  }
  function confirmClose(){
    if (window.__wave86pState && window.__wave86pState.running && !window.__wave86pState.finished) {
      if (!confirm('Завершить текущий режим? Результат этой попытки не сохранится.')) return;
      clearInterval(window.__wave86pState.timer);
    }
    window.__wave86pState = null;
    closeModal();
  }
  function renderCard(){
    css();
    if (!subjects().length) return;
    var old = document.getElementById(CARD_ID);
    if (old) old.remove();
    var anchor = document.getElementById('daily-meter') || document.getElementById('sg');
    if (!anchor || !anchor.parentNode) return;
    var best = readResults().filter(function(r){ return r && r.mode === 'weekly' && r.weekId === weekId(); })
      .sort(function(a, b){ return toNum(b.pct) - toNum(a.pct); })[0];
    var card = document.createElement('div');
    card.id = CARD_ID;
    card.className = 'w86p-card';
    card.innerHTML = '<div class="w86p-head"><div class="w86p-icon">🏁</div><div style="flex:1"><div class="w86p-title">Экзамен и weekly challenge</div><div class="w86p-sub">20 фиксированных вопросов, таймер для экзамена, оценка и локальные рейтинги по классу/предмету.' + (best ? ' Лучший weekly этой недели: ' + best.pct + '%.' : '') + '</div></div></div>' +
      '<div class="w86p-actions"><button class="w86p-btn primary" type="button" data-w86p="weekly">Еженедельный вызов</button><button class="w86p-btn" type="button" data-w86p="exam">Экзамен 20</button><button class="w86p-btn" type="button" data-w86p="leaderboard">Рейтинги</button></div>';
    card.querySelector('[data-w86p="weekly"]').addEventListener('click', function(){ startRun('weekly', ''); });
    card.querySelector('[data-w86p="exam"]').addEventListener('click', showExamPicker);
    card.querySelector('[data-w86p="leaderboard"]').addEventListener('click', function(){ showLeaderboards('all'); });
    anchor.parentNode.insertBefore(card, anchor.nextSibling);
  }
  function topHtml(title, subtitle){
    return '<div class="w86p-top"><div><div class="w86p-title">' + esc(title) + '</div><div class="w86p-sub">' + esc(subtitle || '') + '</div></div><button class="w86p-close" type="button" aria-label="Закрыть">×</button></div>';
  }
  function showExamPicker(){
    var list = subjects();
    var buttons = '<button class="w86p-btn primary" type="button" data-subj="">Все предметы</button>' + list.map(function(s){
      return '<button class="w86p-btn" type="button" data-subj="' + esc(s.id) + '">' + esc((s.ic || '') + ' ' + s.nm) + '</button>';
    }).join('');
    var mask = modal(topHtml('Экзамен 20', 'Выбери предмет. Набор фиксируется на старте, время — 10 минут, оценка показывается в конце.') + '<div class="w86p-subject-grid">' + buttons + '</div>');
    mask.querySelector('.w86p-close').addEventListener('click', confirmClose);
    Array.prototype.forEach.call(mask.querySelectorAll('[data-subj]'), function(btn){
      btn.addEventListener('click', function(){ startRun('exam', btn.getAttribute('data-subj') || ''); });
    });
  }
  function fmt(sec){
    sec = Math.max(0, toNum(sec));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }
  function startRun(mode, subjectId){
    var subject = subjectId ? subjects().filter(function(s){ return s.id === subjectId; })[0] : null;
    var deck = buildDeck(mode, subjectId, COUNT);
    if (deck.length < 4) {
      modal(topHtml('Не хватает вопросов', 'Для выбранного набора нет достаточного числа генераторов.') + '<div class="w86p-empty">Попробуй «Все предметы» или другой предмет.</div><button class="w86p-btn primary" style="width:100%" type="button" data-close>Понятно</button>');
      document.querySelector('#' + MODAL_ID + ' [data-close]').addEventListener('click', closeModal);
      document.querySelector('#' + MODAL_ID + ' .w86p-close').addEventListener('click', confirmClose);
      return;
    }
    var state = {
      running: true,
      finished: false,
      mode: mode,
      subjectId: subjectId || '',
      subjectName: subject ? subject.nm : 'Все предметы',
      title: mode === 'weekly' ? 'Еженедельный вызов' : 'Экзамен 20',
      subtitle: mode === 'weekly' ? 'Неделя ' + weekId() + ' · 20 вопросов' : (subject ? subject.nm + ' · ' : 'Все предметы · ') + '10 минут',
      deck: deck,
      index: 0,
      answers: [],
      startedAt: Date.now(),
      timeLeft: mode === 'exam' ? EXAM_SECONDS : 0,
      timer: null
    };
    window.__wave86pState = state;
    if (mode === 'exam') {
      state.timer = setInterval(function(){
        if (!window.__wave86pState || window.__wave86pState !== state) return clearInterval(state.timer);
        state.timeLeft--;
        var node = document.getElementById('w86p-timer');
        if (node) node.textContent = fmt(state.timeLeft);
        if (state.timeLeft <= 0) finishRun();
      }, 1000);
    }
    renderRun();
  }
  function renderRun(){
    var state = window.__wave86pState;
    if (!state) return;
    var q = state.deck[state.index];
    var answered = state.answers[state.index] != null;
    var selected = state.answers[state.index];
    var progress = Math.round((state.index) / state.deck.length * 100);
    var meta = '<div class="w86p-meta"><span class="w86p-pill">Вопрос ' + (state.index + 1) + ' из ' + state.deck.length + '</span><span class="w86p-pill">' + esc(state.subjectName) + '</span>' + (state.mode === 'exam' ? '<span class="w86p-pill">⏱ <span id="w86p-timer">' + fmt(state.timeLeft) + '</span></span>' : '<span class="w86p-pill">' + weekId() + '</span>') + '</div>';
    var options = q.options.map(function(opt, i){
      var cls = 'w86p-opt';
      if (answered) {
        if (opt === q.answer) cls += ' ok';
        else if (opt === selected) cls += ' no';
        else cls += ' dim';
      }
      return '<button class="' + cls + '" type="button" data-answer="' + esc(opt) + '"' + (answered ? ' disabled' : '') + '><span class="k">' + 'ABCD'[i] + '</span><span>' + esc(opt) + '</span></button>';
    }).join('');
    var feedback = '';
    if (answered && state.mode === 'weekly') {
      var ok = selected === q.answer;
      feedback = '<div class="w86p-q" style="border:1px solid ' + (ok ? 'var(--green)' : 'var(--red)') + '"><b>' + (ok ? '✓ Верно' : '✗ Ответ: ' + esc(q.answer)) + '</b>' + (q.hint ? '<div class="w86p-sub" style="margin-top:6px">💡 ' + esc(q.hint) + '</div>' : '') + (q.ex ? '<div class="w86p-sub" style="margin-top:4px">📘 ' + esc(q.ex) + '</div>' : '') + '</div>';
    }
    var nextLabel = state.index + 1 >= state.deck.length ? 'Завершить' : 'Следующий →';
    var body = topHtml(state.title, state.subtitle) + meta + '<div class="w86p-progress"><div class="w86p-fill" style="width:' + progress + '%"></div></div>' +
      '<div class="w86p-q"><span class="w86p-tag" style="background:' + esc(q.bg) + ';color:' + esc(q.color) + '">' + esc(q.subjectName + ' · ' + q.topicName) + '</span><div class="w86p-qtext">' + esc(q.question) + '</div>' + (q.code ? '<div class="w86p-code">' + esc(q.code) + '</div>' : '') + '</div><div class="w86p-options">' + options + '</div>' + feedback +
      (answered ? '<button class="w86p-btn primary w86p-next" type="button" data-next>' + nextLabel + '</button>' : '');
    var mask = modal(body);
    mask.querySelector('.w86p-close').addEventListener('click', confirmClose);
    Array.prototype.forEach.call(mask.querySelectorAll('[data-answer]'), function(btn){
      btn.addEventListener('click', function(){
        if (state.answers[state.index] != null) return;
        state.answers[state.index] = btn.getAttribute('data-answer');
        if (state.mode === 'exam') {
          if (state.index + 1 >= state.deck.length) finishRun();
          else { state.index++; renderRun(); }
        } else {
          renderRun();
        }
      });
    });
    var next = mask.querySelector('[data-next]');
    if (next) next.addEventListener('click', function(){
      if (state.index + 1 >= state.deck.length) finishRun();
      else { state.index++; renderRun(); }
    });
  }
  function resultBreakdown(deck, answers){
    var map = {};
    deck.forEach(function(q, i){
      var key = q.subjectId + '|' + q.topicId;
      map[key] = map[key] || { subjectId:q.subjectId, subjectName:q.subjectName, topicId:q.topicId, topicName:q.topicName, ok:0, total:0 };
      map[key].total++;
      if (answers[i] === q.answer) map[key].ok++;
    });
    return Object.keys(map).map(function(k){ return map[k]; }).sort(function(a, b){ return pct(a.ok, a.total) - pct(b.ok, b.total); });
  }
  function finishRun(){
    var state = window.__wave86pState;
    if (!state || state.finished) return;
    state.finished = true;
    state.running = false;
    if (state.timer) clearInterval(state.timer);
    var total = state.deck.length;
    var ok = 0;
    state.deck.forEach(function(q, i){ if (state.answers[i] === q.answer) ok++; });
    var value = pct(ok, total);
    var mark = markFromPct(value);
    var spent = Math.round((Date.now() - state.startedAt) / 1000);
    var breakdown = resultBreakdown(state.deck, state.answers);
    updateProgress(state.deck, state.answers);
    updateDaily(ok, total - ok);
    updateStreakTotals(ok, total);
    var entry = {
      id: VERSION + '-' + Date.now(),
      mode: state.mode,
      grade: gradeKey(),
      weekId: weekId(),
      subjectId: state.subjectId || 'all',
      subjectName: state.subjectName,
      name: playerName(),
      ok: ok,
      total: total,
      pct: value,
      mark: mark,
      seconds: spent,
      ts: Date.now(),
      topics: breakdown.slice(0, 12)
    };
    saveResult(entry);
    try { if (typeof window.refreshMain === 'function') window.refreshMain(); } catch(_) {}
    renderResult(entry, breakdown, state.deck, state.answers);
  }
  function renderResult(entry, breakdown, deck, answers){
    var rows = breakdown.slice(0, 8).map(function(r){
      var p = pct(r.ok, r.total);
      return '<div class="w86p-row"><b>' + esc(r.subjectName + ' · ' + r.topicName) + '</b><span>' + r.ok + '/' + r.total + '</span><span style="font-weight:900;color:' + (p >= 80 ? 'var(--green)' : p >= 50 ? 'var(--orange)' : 'var(--red)') + '">' + p + '%</span></div>';
    }).join('');
    var wrong = deck.map(function(q, i){ return { q:q, a:answers[i] }; }).filter(function(x){ return x.a !== x.q.answer; }).slice(0, 5).map(function(x){
      return '<div class="w86p-row"><b>' + esc(x.q.question) + '</b><span style="color:var(--red)">' + esc(x.a || '—') + '</span><span style="color:var(--green)">✓ ' + esc(x.q.answer) + '</span></div>';
    }).join('');
    var body = topHtml(entry.mode === 'weekly' ? 'Weekly challenge завершён' : 'Экзамен завершён', entry.subjectName + ' · ' + entry.name) +
      '<div class="w86p-score" style="color:' + (entry.pct >= 80 ? 'var(--green)' : entry.pct >= 50 ? 'var(--orange)' : 'var(--red)') + '">' + entry.pct + '%</div>' +
      '<div style="text-align:center;font-size:15px;font-weight:900;margin-bottom:8px">Оценка: ' + entry.mark + ' · ' + entry.ok + ' из ' + entry.total + '</div>' +
      '<div class="w86p-meta" style="justify-content:center"><span class="w86p-pill">⏱ ' + fmt(entry.seconds) + '</span><span class="w86p-pill">' + esc(entry.weekId) + '</span><span class="w86p-pill">Сохранено в рейтинг</span></div>' +
      (rows ? '<div class="w86p-breakdown"><div class="w86p-title">По темам</div>' + rows + '</div>' : '') +
      (wrong ? '<div class="w86p-breakdown"><div class="w86p-title">Ошибки</div>' + wrong + '</div>' : '') +
      '<div class="w86p-actions"><button class="w86p-btn primary" type="button" data-repeat>Повторить</button><button class="w86p-btn" type="button" data-lb>Рейтинг</button><button class="w86p-btn" type="button" data-close>Закрыть</button></div>';
    var mask = modal(body);
    mask.querySelector('.w86p-close').addEventListener('click', function(){ window.__wave86pState = null; closeModal(); });
    mask.querySelector('[data-close]').addEventListener('click', function(){ window.__wave86pState = null; closeModal(); });
    mask.querySelector('[data-lb]').addEventListener('click', function(){ window.__wave86pState = null; showLeaderboards(entry.subjectId); });
    mask.querySelector('[data-repeat]').addEventListener('click', function(){ var mode = entry.mode; var subjectId = entry.subjectId === 'all' ? '' : entry.subjectId; window.__wave86pState = null; startRun(mode, subjectId); });
  }
  function topRows(rows, subjectId){
    var filtered = rows.filter(function(r){ return !subjectId || subjectId === 'all' || r.subjectId === subjectId; });
    filtered.sort(function(a, b){ return toNum(b.pct) - toNum(a.pct) || toNum(a.seconds) - toNum(b.seconds) || toNum(b.ts) - toNum(a.ts); });
    return filtered.slice(0, 20);
  }
  function showLeaderboards(subjectId){
    subjectId = subjectId || 'all';
    var rows = readResults();
    var list = subjects();
    var tabs = '<button type="button" data-tab="all">Класс</button>' + list.map(function(s){ return '<button type="button" data-tab="' + esc(s.id) + '">' + esc(s.ic || '') + ' ' + esc(s.nm) + '</button>'; }).join('');
    var top = topRows(rows, subjectId);
    var table = top.length ? top.map(function(r, i){
      return '<div class="w86p-row"><span style="width:28px;font-weight:900">' + (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1) + '</span><b>' + esc(r.name || 'Ученик') + '<div class="w86p-sub">' + esc(r.mode === 'weekly' ? 'weekly' : 'экзамен') + ' · ' + esc(r.subjectName || 'Все предметы') + ' · ' + new Date(r.ts).toLocaleDateString('ru-RU') + '</div></b><span style="font-weight:900">' + r.pct + '%</span><span>оценка ' + r.mark + '</span></div>';
    }).join('') : '<div class="w86p-empty">Рейтинг пока пуст. Пройди weekly challenge или экзамен — результат появится здесь.</div>';
    var body = topHtml('Локальные рейтинги', 'По этому устройству: общий рейтинг класса и срезы по предметам.') + '<div class="w86p-lb-tabs">' + tabs + '</div>' + table + '<button class="w86p-btn primary" style="width:100%;margin-top:12px" type="button" data-close>Закрыть</button>';
    var mask = modal(body);
    mask.querySelector('.w86p-close').addEventListener('click', confirmClose);
    mask.querySelector('[data-close]').addEventListener('click', closeModal);
    Array.prototype.forEach.call(mask.querySelectorAll('[data-tab]'), function(btn){
      if ((btn.getAttribute('data-tab') || 'all') === subjectId) btn.style.background = 'var(--accent)', btn.style.color = '#fff';
      btn.addEventListener('click', function(){ showLeaderboards(btn.getAttribute('data-tab') || 'all'); });
    });
  }
  function init(){
    if (!Array.isArray(window.SUBJ) || !document.getElementById('s-main')) return false;
    renderCard();
    return true;
  }
  var tries = 0;
  function boot(){
    if (init()) return;
    if (++tries < 40) setTimeout(boot, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.wave86pChallenge = {
    version: VERSION,
    buildDeck: buildDeck,
    startWeeklyChallenge: function(){ startRun('weekly', ''); },
    startExamPicker: showExamPicker,
    showLeaderboards: showLeaderboards,
    readResults: readResults,
    auditSnapshot: function(){
      var rows = readResults();
      return {
        version: VERSION,
        grade: gradeKey(),
        subjects: subjects().length,
        topicPool: topicPool('').length,
        weeklyDeck: buildDeck('weekly', '', COUNT, VERSION + ':audit:' + gradeKey() + ':weekly').length,
        examDeck: buildDeck('exam', '', COUNT, VERSION + ':audit:' + gradeKey() + ':exam').length,
        results: rows.length
      };
    }
  };
})();

;/* ---- chunk_roadmap_wave86v_pvp_link_battle.js ---- */
/* --- wave86v: PvP battle by shareable link --- */
(function(){
  if (typeof window === 'undefined') return;
  if (window.wave86vPvpBattle) return;

  var VERSION = 'wave86v';
  var CARD_ID = 'wave86v-pvp-card';
  var MODAL_ID = 'wave86v-modal';
  var STYLE_ID = 'wave86v-pvp-style';
  var COUNT = 10;
  var BATTLE_SECONDS = 7 * 60;
  var MAX_HISTORY = 80;

  function gradeKey(){ return String(window.GRADE_NUM || ''); }
  function storeKey(){ return 'trainer_wave86v_duels_' + gradeKey(); }
  function progressKey(){ return 'trainer_progress_' + gradeKey(); }
  function streakKey(){ return 'trainer_streak_' + gradeKey(); }
  function dailyKey(){ return 'trainer_daily_' + gradeKey(); }
  function activityKey(){ return 'trainer_activity_' + gradeKey(); }
  function today(){ return new Date().toISOString().slice(0, 10); }
  function toNum(v){ return Number(v || 0) || 0; }
  function pct(ok, total){ return total ? Math.round(ok / total * 100) : 0; }
  function markFromPct(value){ return value >= 85 ? 5 : value >= 65 ? 4 : value >= 45 ? 3 : 2; }
  function fmt(sec){ sec = Math.max(0, toNum(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function safeRead(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(_) { return fallback; }
  }
  function safeWrite(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(_) {}
  }
  function playerName(){
    try {
      if (typeof window.getPlayerName === 'function') return window.getPlayerName() || 'Ученик';
      return localStorage.getItem('trainer_player_name') || 'Ученик';
    } catch(_) { return 'Ученик'; }
  }
  function hashSeed(seed){
    var str = String(seed == null ? '' : seed);
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function randomToken(){
    return (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)).toLowerCase();
  }
  function encodePayload(payload){
    var json = JSON.stringify(payload || {});
    try {
      if (window.TextEncoder) {
        var bytes = new TextEncoder().encode(json);
        var bin = '';
        for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
      }
    } catch(_) {}
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  function decodePayload(raw){
    try {
      raw = String(raw || '').replace(/-/g, '+').replace(/_/g, '/');
      while (raw.length % 4) raw += '=';
      var bin = atob(raw);
      try {
        if (window.TextDecoder) {
          var bytes = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          return JSON.parse(new TextDecoder().decode(bytes));
        }
      } catch(_) {}
      return JSON.parse(decodeURIComponent(escape(bin)));
    } catch(_) { return null; }
  }
  function getChallengeParam(){
    try {
      var url = new URL(window.location.href);
      var q = url.searchParams.get('pvp');
      if (q) return q;
      var hash = String(window.location.hash || '').replace(/^#/, '');
      if (!hash) return '';
      if (hash.indexOf('pvp=') === 0) return hash.slice(4).split('&')[0];
      var m = hash.match(/(?:^|&)pvp=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : '';
    } catch(_) { return ''; }
  }
  function cleanChallenge(payload){
    if (!payload || typeof payload !== 'object') return null;
    var grade = String(payload.grade || '');
    var seed = String(payload.seed || '');
    if (!grade || !seed || seed.length > 180) return null;
    var count = Math.max(4, Math.min(20, toNum(payload.count) || COUNT));
    var out = {
      v: String(payload.v || VERSION),
      id: String(payload.id || ('duel-' + hashSeed(seed).toString(36))).slice(0, 80),
      grade: grade,
      subjectId: String(payload.subjectId || '').slice(0, 80),
      subjectName: String(payload.subjectName || 'Все предметы').slice(0, 120),
      seed: seed,
      count: count,
      createdAt: toNum(payload.createdAt) || Date.now(),
      inviter: String(payload.inviter || 'Ученик').slice(0, 80)
    };
    if (payload.hostResult && typeof payload.hostResult === 'object') {
      out.hostResult = {
        name: String(payload.hostResult.name || out.inviter || 'Ученик').slice(0, 80),
        ok: toNum(payload.hostResult.ok),
        total: toNum(payload.hostResult.total) || count,
        pct: toNum(payload.hostResult.pct),
        mark: toNum(payload.hostResult.mark),
        seconds: toNum(payload.hostResult.seconds),
        ts: toNum(payload.hostResult.ts) || out.createdAt
      };
    }
    return out;
  }
  function subjects(){
    var list = Array.isArray(window.SUBJ) ? window.SUBJ : [];
    return list.filter(function(s){ return s && !s.hidden && Array.isArray(s.tops); });
  }
  function subjectById(id){
    var list = subjects();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function ensureReady(subjectId){
    if (String(window.GRADE_NUM || '') === '10' && window.wave86sGrade10Lazy) {
      if (subjectId && typeof window.wave86sGrade10Lazy.hydrateSubject === 'function') return window.wave86sGrade10Lazy.hydrateSubject(subjectId);
      if (typeof window.wave86sGrade10Lazy.hydrateAll === 'function') return window.wave86sGrade10Lazy.hydrateAll();
    }
    return Promise.resolve();
  }
  function buildDeck(challenge){
    if (!window.wave86pChallenge || typeof window.wave86pChallenge.buildDeck !== 'function') return [];
    return window.wave86pChallenge.buildDeck('pvp', challenge.subjectId || '', challenge.count || COUNT, challenge.seed) || [];
  }
  function readHistory(){
    var rows = safeRead(storeKey(), []);
    return Array.isArray(rows) ? rows : [];
  }
  function saveHistory(entry){
    var rows = readHistory();
    rows.unshift(entry);
    safeWrite(storeKey(), rows.slice(0, MAX_HISTORY));
  }
  function updateProgress(deck, answers){
    var prog = safeRead(progressKey(), {});
    deck.forEach(function(q, i){
      if (!q || !q.subjectId || !q.topicId) return;
      prog[q.subjectId] = prog[q.subjectId] || {};
      prog[q.subjectId][q.topicId] = prog[q.subjectId][q.topicId] || { ok:0, err:0 };
      var row = prog[q.subjectId][q.topicId];
      if (answers[i] === q.answer) row.ok = toNum(row.ok) + 1;
      else row.err = toNum(row.err) + 1;
      row.last = new Date().toLocaleDateString('ru-RU');
    });
    safeWrite(progressKey(), prog);
  }
  function updateDaily(ok, err){
    var d = safeRead(dailyKey(), { date: today(), ok:0, err:0, pure:0, subjs:{} });
    if (!d || typeof d !== 'object' || d.date !== today()) d = { date: today(), ok:0, err:0, pure:0, subjs:{} };
    d.ok = toNum(d.ok) + ok;
    d.err = toNum(d.err) + err;
    if (err === 0) d.pure = toNum(d.pure) + ok;
    safeWrite(dailyKey(), d);
    var a = safeRead(activityKey(), []);
    if (!Array.isArray(a)) a = [];
    var row = a.filter(function(x){ return x && x.date === today(); })[0];
    if (!row) { row = { date: today(), ok:0, err:0, pure:0, total:0 }; a.push(row); }
    row.ok = toNum(row.ok) + ok;
    row.err = toNum(row.err) + err;
    row.total = toNum(row.ok) + toNum(row.err);
    if (err === 0) row.pure = toNum(row.pure) + ok;
    a.sort(function(x, y){ return String(x.date).localeCompare(String(y.date)); });
    safeWrite(activityKey(), a.slice(-365));
  }
  function updateStreakTotals(ok, total){
    var s = safeRead(streakKey(), {});
    if (!s || typeof s !== 'object') s = {};
    s.totalQs = toNum(s.totalQs) + total;
    s.totalOk = toNum(s.totalOk) + ok;
    s.badges = Array.isArray(s.badges) ? s.badges : [];
    safeWrite(streakKey(), s);
  }
  function css(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '' +
      '.w86v-card{margin:12px 0;padding:14px;border-radius:16px;background:linear-gradient(135deg,rgba(245,158,11,.13),rgba(239,68,68,.10));border:1px solid rgba(245,158,11,.22)}' +
      '.w86v-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}.w86v-icon{font-size:24px}.w86v-title{font-weight:900;font-size:14px;font-family:Unbounded,system-ui,sans-serif}.w86v-sub{font-size:11px;color:var(--muted);margin-top:2px;line-height:1.35}.w86v-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.w86v-btn{border:none;border-radius:12px;padding:10px 9px;background:var(--card);color:var(--text);border:1px solid var(--border);font-size:12px;font-weight:800;cursor:pointer;font-family:Golos Text,system-ui,sans-serif}.w86v-btn.primary{background:var(--accent);color:#fff;border-color:var(--accent)}' +
      '.w86v-mask{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto}.w86v-box{background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:20px;max-width:580px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:0 22px 56px rgba(0,0,0,.38);padding:18px}.w86v-top{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}.w86v-close{margin-left:auto;border:none;background:transparent;color:var(--muted);font-size:24px;line-height:1;cursor:pointer}.w86v-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.w86v-meta{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.w86v-pill{border-radius:999px;background:var(--abg);color:var(--muted);font-size:11px;font-weight:800;padding:5px 8px}.w86v-progress{height:8px;background:var(--abg);border-radius:999px;overflow:hidden;margin:10px 0}.w86v-fill{height:100%;background:var(--accent);border-radius:999px}.w86v-q{padding:14px;border-radius:14px;background:var(--abg);margin:12px 0}.w86v-tag{display:inline-flex;margin-bottom:8px;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:900}.w86v-qtext{font-size:16px;font-weight:800;line-height:1.45}.w86v-code{white-space:pre-wrap;font-family:JetBrains Mono,monospace;font-size:12px;background:rgba(0,0,0,.08);padding:10px;border-radius:10px;margin-top:8px}.w86v-options{display:grid;gap:8px}.w86v-opt{display:flex;align-items:center;gap:10px;text-align:left;border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:13px;padding:12px;cursor:pointer;font-weight:700;font-family:Golos Text,system-ui,sans-serif}.w86v-opt .k{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:var(--abg);font-weight:900}.w86v-score{font-family:Unbounded,system-ui,sans-serif;font-size:40px;font-weight:900;text-align:center;margin:8px 0}.w86v-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px}.w86v-row b{flex:1}.w86v-empty{text-align:center;color:var(--muted);font-size:13px;padding:22px 8px}.w86v-linkbox{word-break:break-all;border:1px dashed var(--border);background:var(--abg);border-radius:12px;padding:10px;font-size:11px;color:var(--muted);margin:10px 0}.w86v-verdict{padding:12px;border-radius:14px;background:var(--abg);font-weight:900;text-align:center;margin:12px 0}.w86v-muted{opacity:.72}' +
      '@media(max-width:520px){.w86v-actions,.w86v-grid{grid-template-columns:1fr}.w86v-qtext{font-size:15px}}';
    document.head.appendChild(style);
  }
  function topHtml(title, subtitle){
    return '<div class="w86v-top"><div><div class="w86v-title">' + esc(title) + '</div><div class="w86v-sub">' + esc(subtitle || '') + '</div></div><button class="w86v-close" type="button" aria-label="Закрыть">×</button></div>';
  }
  function modal(inner){
    closeModal();
    css();
    var mask = document.createElement('div');
    mask.id = MODAL_ID;
    mask.className = 'w86v-mask';
    mask.setAttribute('role', 'dialog');
    mask.setAttribute('aria-modal', 'true');
    mask.innerHTML = '<div class="w86v-box">' + inner + '</div>';
    mask.addEventListener('click', function(ev){ if (ev.target === mask) confirmClose(); });
    document.body.appendChild(mask);
    var close = mask.querySelector('.w86v-close');
    if (close) close.addEventListener('click', confirmClose);
    var focus = mask.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (focus && focus.focus) setTimeout(function(){ focus.focus(); }, 30);
    return mask;
  }
  function closeModal(){
    var old = document.getElementById(MODAL_ID);
    if (old) old.remove();
  }
  function confirmClose(){
    if (window.__wave86vState && window.__wave86vState.running && !window.__wave86vState.finished) {
      if (!confirm('Завершить текущую PvP-битву? Результат этой попытки не сохранится.')) return;
      clearInterval(window.__wave86vState.timer);
    }
    window.__wave86vState = null;
    closeModal();
  }
  function challengeUrl(challenge){
    var payload = encodePayload(challenge);
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('pvp', payload);
      url.hash = '';
      return url.toString();
    } catch(_) {
      return String(window.location.href).split('#')[0].split('?')[0] + '?pvp=' + payload;
    }
  }
  function copyText(text, label){
    function fallback(){
      try {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', 'readonly');
        area.style.position = 'fixed';
        area.style.left = '-9999px';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
        toast(label || 'Скопировано');
      } catch(_) { prompt('Скопируй вручную:', text); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function(){ toast(label || 'Скопировано'); }).catch(fallback);
    } else fallback();
  }
  function shareText(title, text, url){
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url }).catch(function(){});
    } else {
      copyText([text, url].filter(Boolean).join('\n'), 'Текст для отправки скопирован');
    }
  }
  function toast(text){
    try {
      var old = document.getElementById('wave86v-toast');
      if (old) old.remove();
      var node = document.createElement('div');
      node.id = 'wave86v-toast';
      node.textContent = text;
      node.style.cssText = 'position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:100002;background:var(--text);color:var(--card);border-radius:999px;padding:10px 14px;font-size:12px;font-weight:900;box-shadow:0 10px 26px rgba(0,0,0,.22)';
      document.body.appendChild(node);
      setTimeout(function(){ if (node && node.parentNode) node.remove(); }, 2200);
    } catch(_) {}
  }
  function createChallenge(subjectId){
    var s = subjectId ? subjectById(subjectId) : null;
    var seed = [VERSION, gradeKey(), subjectId || 'all', randomToken()].join(':');
    return {
      v: VERSION,
      id: 'duel-' + hashSeed(seed).toString(36),
      grade: gradeKey(),
      subjectId: subjectId || '',
      subjectName: s ? s.nm : 'Все предметы',
      seed: seed,
      count: COUNT,
      createdAt: Date.now(),
      inviter: playerName()
    };
  }
  function showCreatePicker(){
    var list = subjects();
    var buttons = '<button class="w86v-btn primary" type="button" data-subj="">Все предметы</button>' + list.map(function(s){
      return '<button class="w86v-btn" type="button" data-subj="' + esc(s.id) + '">' + esc((s.ic || '') + ' ' + s.nm) + '</button>';
    }).join('');
    var mask = modal(topHtml('PvP-битва по ссылке', 'Выбери предмет. Сначала пройди 10 вопросов сам, затем отправь ссылку сопернику — он получит тот же набор и сравнение результата.') + '<div class="w86v-grid">' + buttons + '</div><div class="w86v-sub" style="margin-top:10px">Работает без сервера: в ссылке хранится только seed набора и твой итоговый результат.</div>');
    Array.prototype.forEach.call(mask.querySelectorAll('[data-subj]'), function(btn){
      btn.addEventListener('click', function(){
        var subjectId = btn.getAttribute('data-subj') || '';
        ensureReady(subjectId).then(function(){ startBattle(createChallenge(subjectId), 'host'); }).catch(function(){ startBattle(createChallenge(subjectId), 'host'); });
      });
    });
  }
  function showIncoming(challenge){
    var wrongGrade = challenge.grade && challenge.grade !== gradeKey();
    var target = 'grade' + challenge.grade + '_v2.html?pvp=' + encodePayload(challenge);
    var body = topHtml('Тебя вызвали на PvP-битву', (challenge.inviter || 'Ученик') + ' · ' + challenge.subjectName + ' · ' + challenge.count + ' вопросов') +
      (wrongGrade ? '<div class="w86v-verdict">Эта ссылка для ' + esc(challenge.grade) + ' класса, а сейчас открыт ' + esc(gradeKey()) + ' класс.</div><a class="w86v-btn primary" style="display:block;text-align:center;text-decoration:none" href="' + esc(target) + '">Открыть нужный класс</a>' : '<div class="w86v-meta"><span class="w86v-pill">' + esc(challenge.subjectName) + '</span><span class="w86v-pill">⏱ ' + fmt(BATTLE_SECONDS) + '</span><span class="w86v-pill">' + challenge.count + ' вопросов</span></div>' + (challenge.hostResult ? '<div class="w86v-verdict">Результат соперника: ' + esc(challenge.hostResult.name) + ' — ' + challenge.hostResult.ok + '/' + challenge.hostResult.total + ' · ' + challenge.hostResult.pct + '% · ' + fmt(challenge.hostResult.seconds) + '</div>' : '<div class="w86v-verdict">Соперник прислал seed без результата. После прохождения можно поделиться своим итогом.</div>') + '<div class="w86v-actions"><button class="w86v-btn primary" type="button" data-start>Принять вызов</button><button class="w86v-btn" type="button" data-copy>Скопировать ссылку</button></div>');
    var mask = modal(body);
    var start = mask.querySelector('[data-start]');
    if (start) start.addEventListener('click', function(){ ensureReady(challenge.subjectId).then(function(){ startBattle(challenge, 'guest'); }).catch(function(){ startBattle(challenge, 'guest'); }); });
    var copy = mask.querySelector('[data-copy]');
    if (copy) copy.addEventListener('click', function(){ copyText(challengeUrl(challenge), 'Ссылка скопирована'); });
  }
  function startBattle(challenge, role){
    challenge = cleanChallenge(challenge);
    if (!challenge) return;
    var deck = buildDeck(challenge);
    if (deck.length < Math.min(4, challenge.count || COUNT)) {
      var m = modal(topHtml('Не хватает вопросов', 'Для выбранной дуэли не удалось собрать стабильный набор.') + '<div class="w86v-empty">Попробуй другой предмет или режим «Все предметы».</div><button class="w86v-btn primary" type="button" data-close style="width:100%">Понятно</button>');
      var b = m.querySelector('[data-close]');
      if (b) b.addEventListener('click', closeModal);
      return;
    }
    var state = {
      running: true,
      finished: false,
      role: role || 'guest',
      challenge: challenge,
      deck: deck.slice(0, challenge.count || COUNT),
      index: 0,
      answers: [],
      startedAt: Date.now(),
      timeLeft: BATTLE_SECONDS,
      timer: null
    };
    window.__wave86vState = state;
    state.timer = setInterval(function(){
      if (!window.__wave86vState || window.__wave86vState !== state) return clearInterval(state.timer);
      state.timeLeft--;
      var node = document.getElementById('w86v-timer');
      if (node) node.textContent = fmt(state.timeLeft);
      if (state.timeLeft <= 0) finishBattle();
    }, 1000);
    renderBattle();
  }
  function renderBattle(){
    var state = window.__wave86vState;
    if (!state) return;
    var q = state.deck[state.index];
    var progress = Math.round(state.index / state.deck.length * 100);
    var opts = (q.options || []).map(function(opt, i){
      return '<button class="w86v-opt" type="button" data-answer="' + esc(opt) + '"><span class="k">' + 'ABCD'[i] + '</span><span>' + esc(opt) + '</span></button>';
    }).join('');
    var title = state.role === 'host' ? 'Создание PvP-ссылки' : 'PvP-вызов от ' + (state.challenge.inviter || 'ученика');
    var body = topHtml(title, state.challenge.subjectName + ' · отвечай без подсказок, результат сравним в конце') +
      '<div class="w86v-meta"><span class="w86v-pill">Вопрос ' + (state.index + 1) + ' из ' + state.deck.length + '</span><span class="w86v-pill">⏱ <span id="w86v-timer">' + fmt(state.timeLeft) + '</span></span><span class="w86v-pill">PvP 1v1</span></div>' +
      '<div class="w86v-progress"><div class="w86v-fill" style="width:' + progress + '%"></div></div>' +
      '<div class="w86v-q"><span class="w86v-tag" style="background:' + esc(q.bg || 'var(--abg)') + ';color:' + esc(q.color || 'var(--accent)') + '">' + esc((q.subjectName || '') + ' · ' + (q.topicName || q.tag || 'Тема')) + '</span><div class="w86v-qtext">' + esc(q.question) + '</div>' + (q.code ? '<div class="w86v-code">' + esc(q.code) + '</div>' : '') + '</div><div class="w86v-options">' + opts + '</div>';
    var mask = modal(body);
    Array.prototype.forEach.call(mask.querySelectorAll('[data-answer]'), function(btn){
      btn.addEventListener('click', function(){
        if (!window.__wave86vState || window.__wave86vState !== state) return;
        state.answers[state.index] = btn.getAttribute('data-answer');
        if (state.index + 1 >= state.deck.length) finishBattle();
        else { state.index++; renderBattle(); }
      });
    });
  }
  function resultBreakdown(deck, answers){
    var map = {};
    deck.forEach(function(q, i){
      var key = (q.subjectId || '') + '|' + (q.topicId || '');
      map[key] = map[key] || { subjectName:q.subjectName || 'Предмет', topicName:q.topicName || q.tag || 'Тема', ok:0, total:0 };
      map[key].total++;
      if (answers[i] === q.answer) map[key].ok++;
    });
    return Object.keys(map).map(function(k){ return map[k]; }).sort(function(a, b){ return pct(a.ok, a.total) - pct(b.ok, b.total); });
  }
  function compare(me, host){
    if (!host) return { label:'Результат готов', cls:'', detail:'Отправь ссылку сопернику, чтобы он прошёл тот же набор.' };
    if (me.pct > host.pct) return { label:'Победа! 🏆', cls:'color:var(--green)', detail:'Ты набрал больше процентов, чем соперник.' };
    if (me.pct < host.pct) return { label:'Поражение — реванш? ⚡', cls:'color:var(--red)', detail:'Соперник набрал больше процентов.' };
    if (me.seconds < host.seconds) return { label:'Победа по времени! 🏁', cls:'color:var(--green)', detail:'Проценты равны, но ты справился быстрее.' };
    if (me.seconds > host.seconds) return { label:'Проценты равны, соперник быстрее', cls:'color:var(--orange)', detail:'Попробуй реванш и сократи время.' };
    return { label:'Ничья 🤝', cls:'', detail:'Одинаковые проценты и время.' };
  }
  function finishBattle(){
    var state = window.__wave86vState;
    if (!state || state.finished) return;
    state.finished = true;
    state.running = false;
    if (state.timer) clearInterval(state.timer);
    var total = state.deck.length;
    var ok = 0;
    state.deck.forEach(function(q, i){ if (state.answers[i] === q.answer) ok++; });
    var value = pct(ok, total);
    var spent = Math.round((Date.now() - state.startedAt) / 1000);
    var me = { name: playerName(), ok: ok, total: total, pct: value, mark: markFromPct(value), seconds: spent, ts: Date.now() };
    var challenge = cleanChallenge(state.challenge);
    if (state.role === 'host') challenge.hostResult = me;
    updateProgress(state.deck, state.answers);
    updateDaily(ok, total - ok);
    updateStreakTotals(ok, total);
    var entry = {
      id: VERSION + '-' + Date.now(),
      challengeId: challenge.id,
      role: state.role,
      grade: gradeKey(),
      subjectId: challenge.subjectId || 'all',
      subjectName: challenge.subjectName,
      seed: challenge.seed,
      result: me,
      hostResult: challenge.hostResult || null,
      ts: Date.now()
    };
    saveHistory(entry);
    try { if (typeof window.refreshMain === 'function') window.refreshMain(); } catch(_) {}
    renderResult(challenge, me, resultBreakdown(state.deck, state.answers), state.deck, state.answers, state.role);
  }
  function resultText(challenge, me){
    return 'PvP-битва, ' + gradeKey() + ' класс · ' + challenge.subjectName + ': ' + me.name + ' — ' + me.ok + '/' + me.total + ' (' + me.pct + '%), оценка ' + me.mark + ', время ' + fmt(me.seconds) + '.';
  }
  function renderResult(challenge, me, breakdown, deck, answers, role){
    var link = role === 'host' ? challengeUrl(challenge) : '';
    var host = role === 'guest' ? challenge.hostResult : null;
    var verdict = compare(me, host);
    var rows = breakdown.slice(0, 6).map(function(r){
      var p = pct(r.ok, r.total);
      return '<div class="w86v-row"><b>' + esc(r.subjectName + ' · ' + r.topicName) + '</b><span>' + r.ok + '/' + r.total + '</span><span style="font-weight:900;color:' + (p >= 80 ? 'var(--green)' : p >= 50 ? 'var(--orange)' : 'var(--red)') + '">' + p + '%</span></div>';
    }).join('');
    var wrong = deck.map(function(q, i){ return { q:q, a:answers[i] }; }).filter(function(x){ return x.a !== x.q.answer; }).slice(0, 4).map(function(x){
      return '<div class="w86v-row"><b>' + esc(x.q.question) + '</b><span style="color:var(--red)">' + esc(x.a || '—') + '</span><span style="color:var(--green)">✓ ' + esc(x.q.answer) + '</span></div>';
    }).join('');
    var shareBlock = role === 'host'
      ? '<div class="w86v-linkbox">' + esc(link) + '</div><div class="w86v-actions"><button class="w86v-btn primary" type="button" data-share-link>Отправить вызов</button><button class="w86v-btn" type="button" data-copy-link>Копировать ссылку</button></div>'
      : '<div class="w86v-actions"><button class="w86v-btn primary" type="button" data-share-result>Отправить мой результат</button><button class="w86v-btn" type="button" data-rematch>Реванш</button></div>';
    var body = topHtml(role === 'host' ? 'PvP-ссылка готова' : 'PvP-битва завершена', challenge.subjectName + ' · ' + me.name) +
      '<div class="w86v-score" style="color:' + (me.pct >= 80 ? 'var(--green)' : me.pct >= 50 ? 'var(--orange)' : 'var(--red)') + '">' + me.pct + '%</div>' +
      '<div style="text-align:center;font-size:15px;font-weight:900;margin-bottom:8px">' + me.ok + ' из ' + me.total + ' · оценка ' + me.mark + ' · ' + fmt(me.seconds) + '</div>' +
      '<div class="w86v-verdict" style="' + verdict.cls + '">' + esc(verdict.label) + '<div class="w86v-sub" style="margin-top:4px">' + esc(verdict.detail) + '</div></div>' +
      (host ? '<div class="w86v-row"><b>Соперник: ' + esc(host.name) + '</b><span>' + host.ok + '/' + host.total + '</span><span>' + host.pct + '%</span><span>' + fmt(host.seconds) + '</span></div>' : '') +
      shareBlock +
      (rows ? '<div style="margin-top:12px"><div class="w86v-title">По темам</div>' + rows + '</div>' : '') +
      (wrong ? '<div style="margin-top:12px"><div class="w86v-title">Ошибки</div>' + wrong + '</div>' : '') +
      '<button class="w86v-btn" style="width:100%;margin-top:12px" type="button" data-close>Закрыть</button>';
    var mask = modal(body);
    var close = mask.querySelector('[data-close]');
    if (close) close.addEventListener('click', function(){ window.__wave86vState = null; closeModal(); });
    var copy = mask.querySelector('[data-copy-link]');
    if (copy) copy.addEventListener('click', function(){ copyText(link, 'PvP-ссылка скопирована'); });
    var share = mask.querySelector('[data-share-link]');
    if (share) share.addEventListener('click', function(){ shareText('PvP-битва', resultText(challenge, me) + ' Прими вызов и сравним результат.', link); });
    var shareResult = mask.querySelector('[data-share-result]');
    if (shareResult) shareResult.addEventListener('click', function(){ shareText('Мой PvP-результат', resultText(challenge, me), ''); });
    var rematch = mask.querySelector('[data-rematch]');
    if (rematch) rematch.addEventListener('click', function(){ showCreatePicker(); });
  }
  function showHistory(){
    var rows = readHistory();
    var bodyRows = rows.length ? rows.slice(0, 20).map(function(r, i){
      var me = r.result || {};
      var host = r.hostResult || null;
      var verdict = r.role === 'guest' && host ? compare(me, host).label : (r.role === 'host' ? 'Ссылка создана' : 'Дуэль');
      return '<div class="w86v-row"><span style="width:28px;font-weight:900">' + (i + 1) + '</span><b>' + esc(r.subjectName || 'Все предметы') + '<div class="w86v-sub">' + esc(verdict) + ' · ' + new Date(r.ts).toLocaleDateString('ru-RU') + '</div></b><span style="font-weight:900">' + toNum(me.pct) + '%</span><span>' + fmt(me.seconds) + '</span></div>';
    }).join('') : '<div class="w86v-empty">История PvP пока пустая. Создай дуэль и отправь ссылку.</div>';
    var mask = modal(topHtml('История PvP', 'Последние локальные дуэли на этом устройстве.') + bodyRows + '<button class="w86v-btn primary" style="width:100%;margin-top:12px" type="button" data-close>Закрыть</button>');
    var btn = mask.querySelector('[data-close]');
    if (btn) btn.addEventListener('click', closeModal);
  }
  function renderCard(){
    css();
    if (!subjects().length || !window.wave86pChallenge) return;
    var old = document.getElementById(CARD_ID);
    if (old) old.remove();
    var anchor = document.getElementById('wave86p-challenge-card') || document.getElementById('daily-meter') || document.getElementById('sg');
    if (!anchor || !anchor.parentNode) return;
    var rows = readHistory();
    var last = rows[0] && rows[0].result ? rows[0].result : null;
    var card = document.createElement('div');
    card.id = CARD_ID;
    card.className = 'w86v-card';
    card.innerHTML = '<div class="w86v-head"><div class="w86v-icon">⚔️</div><div style="flex:1"><div class="w86v-title">PvP-битва по ссылке</div><div class="w86v-sub">Асинхронная дуэль 1v1: один и тот же seed, 10 вопросов, сравнение процентов и времени.' + (last ? ' Последний результат: ' + last.pct + '%.' : '') + '</div></div></div><div class="w86v-actions"><button class="w86v-btn primary" type="button" data-w86v="create">Создать дуэль</button><button class="w86v-btn" type="button" data-w86v="history">История PvP</button></div>';
    card.querySelector('[data-w86v="create"]').addEventListener('click', showCreatePicker);
    card.querySelector('[data-w86v="history"]').addEventListener('click', showHistory);
    anchor.parentNode.insertBefore(card, anchor.nextSibling);
  }
  function bootIncomingOnce(){
    if (window.__wave86vIncomingHandled) return;
    var raw = getChallengeParam();
    if (!raw) return;
    var payload = cleanChallenge(decodePayload(raw));
    if (!payload) return;
    window.__wave86vIncomingHandled = true;
    setTimeout(function(){ showIncoming(payload); }, 300);
  }
  function init(){
    if (!Array.isArray(window.SUBJ) || !document.getElementById('s-main') || !window.wave86pChallenge) return false;
    renderCard();
    bootIncomingOnce();
    return true;
  }
  var tries = 0;
  function boot(){
    if (init()) return;
    if (++tries < 60) setTimeout(boot, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.wave86vPvpBattle = {
    version: VERSION,
    createChallenge: createChallenge,
    encodePayload: encodePayload,
    decodePayload: decodePayload,
    buildDeck: function(challenge){ return buildDeck(cleanChallenge(challenge)); },
    startBattle: function(challenge, role){ return startBattle(challenge, role || 'guest'); },
    showCreatePicker: showCreatePicker,
    showHistory: showHistory,
    readHistory: readHistory,
    auditSnapshot: function(){
      var challenge = createChallenge('');
      var deck = buildDeck(challenge);
      var encoded = encodePayload(challenge);
      var decoded = cleanChallenge(decodePayload(encoded));
      return {
        version: VERSION,
        grade: gradeKey(),
        subjects: subjects().length,
        cardMounted: !!document.getElementById(CARD_ID),
        deckSize: deck.length,
        encodedRoundtrip: !!decoded && decoded.seed === challenge.seed && decoded.grade === challenge.grade,
        history: readHistory().length,
        seconds: BATTLE_SECONDS
      };
    }
  };
})();

;/* ---- chunk_roadmap_wave86r_theory_achievements.js ---- */
(function(){
  'use strict';
  var WAVE = 'wave86r';
  var STYLE_ID = 'wave86r-theory-achievements-style';

  function hasReducedMotion(){
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch(e){ return false; }
  }
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }
  function stripTags(html){
    return String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi,' ')
      .replace(/<style[\s\S]*?<\/style>/gi,' ')
      .replace(/<[^>]+>/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }
  function gradeLabel(){
    var g = String(window.GRADE_NUM || '').trim();
    return g ? g + ' класс' : 'текущий класс';
  }
  function getSubjects(){
    try { return Array.isArray(SUBJ) ? SUBJ : []; }
    catch(e){ return []; }
  }
  function getProgress(){
    try { return (typeof PROG !== 'undefined' && PROG && typeof PROG === 'object') ? PROG : {}; }
    catch(e){ return {}; }
  }
  function getDaily(){
    try { return (typeof DAILY !== 'undefined' && DAILY && typeof DAILY === 'object') ? DAILY : {}; }
    catch(e){ return {}; }
  }
  function getStreak(){
    try { return (typeof STR !== 'undefined' && STR && typeof STR === 'object') ? STR : {}; }
    catch(e){ return {}; }
  }
  function getTPStats(subjectId, topicId){
    var p = getProgress();
    return p[subjectId] && p[subjectId][topicId] ? p[subjectId][topicId] : {ok:0, err:0};
  }
  function topicStars(subjectId, topicId){
    var t = getTPStats(subjectId, topicId);
    var total = (+t.ok || 0) + (+t.err || 0);
    var pct = total ? ((+t.ok || 0) / total) : 0;
    if(total >= 10 && pct >= .85) return 3;
    if(total >= 6 && pct >= .70) return 2;
    if(total >= 3 && pct >= .50) return 1;
    return 0;
  }
  function progressSummary(){
    var summary = {
      subjects:getSubjects().length,
      topics:0,
      attemptedTopics:0,
      masteredTopics:0,
      totalStars:0,
      activeSubjects:0,
      strongSubjects:0,
      recoveredTopics:0,
      totalOk:0,
      totalErr:0,
      weeklyBest:0
    };
    getSubjects().forEach(function(subject){
      var subjectOk = 0;
      var subjectErr = 0;
      (subject.tops || []).forEach(function(topic){
        summary.topics++;
        var tp = getTPStats(subject.id, topic.id);
        var ok = +tp.ok || 0;
        var err = +tp.err || 0;
        var total = ok + err;
        var stars = topicStars(subject.id, topic.id);
        subjectOk += ok;
        subjectErr += err;
        summary.totalOk += ok;
        summary.totalErr += err;
        summary.totalStars += stars;
        if(total > 0) summary.attemptedTopics++;
        if(stars >= 3) summary.masteredTopics++;
        if(err > 0 && total >= 5 && ok / total >= .8) summary.recoveredTopics++;
      });
      var subjectTotal = subjectOk + subjectErr;
      if(subjectTotal > 0) summary.activeSubjects++;
      if(subjectTotal >= 10 && subjectOk / subjectTotal >= .7) summary.strongSubjects++;
    });
    try {
      var raw = localStorage.getItem('trainer_wave86p_results_' + (window.GRADE_NUM || '10')) || '[]';
      var rows = JSON.parse(raw);
      if(Array.isArray(rows)) rows.forEach(function(row){
        if(row && row.mode === 'weekly') summary.weeklyBest = Math.max(summary.weeklyBest, +row.pct || 0);
      });
    } catch(e) {}
    return summary;
  }
  function makeFallbackTheory(topic, subject){
    var tn = esc(topic && topic.nm || 'Тема');
    var sn = esc(subject && subject.nm || 'предмет');
    return '<div class="tcard wave86r-generated-theory">' +
      '<h3>📖 Теория: ' + tn + '</h3>' +
      '<p><b>' + sn + '</b>, ' + gradeLabel() + '. Сначала выдели, что именно спрашивают, затем вспомни правило, определение или алгоритм из темы.</p>' +
      '<ul>' +
        '<li>Найди ключевые слова в условии и отбрось лишнее.</li>' +
        '<li>Сравни варианты: правильный должен полностью соответствовать вопросу.</li>' +
        '<li>После ошибки прочитай блок «Разбор» и повтори похожий вопрос.</li>' +
      '</ul>' +
      '<div class="ex">Мини-чеклист: условие → правило → вычисление или вывод → проверка ответа.</div>' +
    '</div>';
  }
  function normalizeTopicTheory(){
    getSubjects().forEach(function(subject){
      (subject.tops || []).forEach(function(topic){
        if(!topic) return;
        if(!topic.th || !stripTags(topic.th)) topic.th = makeFallbackTheory(topic, subject);
      });
    });
  }
  function injectStyles(){
    if(document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave86r-theory{margin:-2px 0 8px 24px;border:1px solid var(--border);border-radius:12px;background:var(--abg);overflow:hidden}',
      '.wave86r-theory>summary{list-style:none;cursor:pointer;padding:9px 12px;font-size:12px;font-weight:800;color:var(--accent);display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.wave86r-theory>summary::-webkit-details-marker{display:none}',
      '.wave86r-theory>summary:after{content:"⌄";font-size:13px;opacity:.7;transition:transform .18s}',
      '.wave86r-theory[open]>summary:after{transform:rotate(180deg)}',
      '.wave86r-theory-body{padding:0 12px 12px;font-size:12px;line-height:1.55;color:var(--text)}',
      '.wave86r-theory-body .tcard{margin:0;padding:12px;background:transparent!important;border:none!important}',
      '.wave86r-theory-body h3{font-size:13px;margin-bottom:6px}',
      '.wave86r-theory-body p,.wave86r-theory-body li{font-size:12px;line-height:1.55}',
      '.wave86r-theory-actions{display:flex;gap:8px;margin-top:8px}',
      '.wave86r-theory-actions button{flex:1;padding:8px;border:none;border-radius:9px;background:var(--text);color:var(--bg);font-weight:800;font-size:12px;font-family:Golos Text,system-ui,sans-serif;cursor:pointer}',
      '.wave86r-toast{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0));transform:translateX(-50%) translateY(12px);z-index:100000;max-width:min(420px,calc(100vw - 28px));padding:12px 14px;border-radius:16px;background:var(--text);color:var(--bg);font-weight:900;font-size:13px;box-shadow:0 14px 34px rgba(0,0,0,.22);opacity:0;pointer-events:none}',
      '.wave86r-toast.show{animation:wave86rToast 2.2s ease forwards}',
      '@keyframes wave86rToast{0%{opacity:0;transform:translateX(-50%) translateY(12px) scale(.96)}14%,82%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(8px) scale(.98)}}',
      '.wave86r-achievement-note{display:inline-flex;align-items:center;gap:6px;margin-left:8px;padding:2px 8px;border-radius:999px;background:var(--ybg);color:var(--yellow);font-size:10px;font-weight:900}',
      '@media(prefers-reduced-motion:reduce){.wave86r-toast.show{animation:none;opacity:1}.wave86r-theory>summary:after{transition:none}}'
    ].join('\n');
    document.head.appendChild(style);
  }
  function toast(message){
    try {
      injectStyles();
      var old = document.querySelector('.wave86r-toast');
      if(old) old.remove();
      var el = document.createElement('div');
      el.className = 'wave86r-toast';
      el.setAttribute('role','status');
      el.textContent = message;
      document.body.appendChild(el);
      requestAnimationFrame(function(){ el.classList.add('show'); });
      setTimeout(function(){ if(el && el.parentNode) el.remove(); }, hasReducedMotion() ? 1600 : 2400);
    } catch(e) {}
  }
  function topicByButtonText(subject, text){
    var clean = String(text || '').replace(/\s+/g,' ').trim();
    var best = null;
    (subject.tops || []).forEach(function(topic){
      if(best) return;
      if(clean.indexOf(topic.nm) !== -1) best = topic;
    });
    return best;
  }
  function enhanceTopicList(){
    try {
      injectStyles();
      normalizeTopicTheory();
      if(typeof cS === 'undefined' || !cS || !document.getElementById('tl')) return;
      var list = document.getElementById('tl');
      if(list.getAttribute('data-wave86r-subject') === cS.id && list.querySelector('.wave86r-theory')) return;
      list.setAttribute('data-wave86r-subject', cS.id);
      Array.prototype.slice.call(list.querySelectorAll('.tbtn')).forEach(function(btn){
        if(btn.getAttribute('data-wave86r-theory-bound')) return;
        var txt = btn.textContent || '';
        if(/Всё вперемешку|Диагностика/.test(txt)) return;
        var topic = topicByButtonText(cS, txt);
        if(!topic) return;
        btn.setAttribute('data-wave86r-theory-bound','1');
        var details = document.createElement('details');
        details.className = 'wave86r-theory';
        details.innerHTML = '<summary>📖 Теория по теме</summary>' +
          '<div class="wave86r-theory-body">' + (topic.th || makeFallbackTheory(topic, cS)) +
          '<div class="wave86r-theory-actions"><button type="button">Открыть тему</button></div></div>';
        var goBtn = details.querySelector('button');
        if(goBtn) goBtn.addEventListener('click', function(ev){
          ev.preventDefault();
          ev.stopPropagation();
          cT = topic;
          mix = false;
          var tc = document.getElementById('tc');
          if(tc) tc.innerHTML = topic.th || makeFallbackTheory(topic, cS);
          if(typeof go === 'function') go('theory');
        });
        btn.insertAdjacentElement('afterend', details);
      });
    } catch(e) {}
  }
  function patchOpenSubj(){
    try {
      if(typeof openSubj !== 'function' || openSubj.__wave86rPatched) return;
      var original = openSubj;
      var patched = function(){
        normalizeTopicTheory();
        var result = original.apply(this, arguments);
        setTimeout(enhanceTopicList, 0);
        return result;
      };
      patched.__wave86rPatched = true;
      openSubj = patched;
      window.openSubj = patched;
    } catch(e) {}
  }
  function registerAchievements(){
    try {
      if(typeof BADGES === 'undefined' || !Array.isArray(BADGES) || BADGES.__wave86rRegistered) return;
      var defs = [
        {id:'w86r_topic_start',icon:'🌱',name:'Тема начата',desc:'3+ ответа в одной теме',check:function(){return progressSummary().attemptedTopics >= 1;}},
        {id:'w86r_topic_master',icon:'⭐',name:'Тема на 3 звезды',desc:'10+ ответов и 85%+ в теме',check:function(){return progressSummary().masteredTopics >= 1;}},
        {id:'w86r_topic_3',icon:'⭐⭐⭐',name:'Три сильные темы',desc:'3 темы на 3 звезды',check:function(){return progressSummary().masteredTopics >= 3;}},
        {id:'w86r_topic_10',icon:'🌟',name:'Десятка тем',desc:'10 тем на 3 звезды',check:function(){return progressSummary().masteredTopics >= 10;}},
        {id:'w86r_stars_25',icon:'✨',name:'25 звёзд',desc:'Набери 25 звёзд за темы',check:function(){return progressSummary().totalStars >= 25;}},
        {id:'w86r_subject_1',icon:'🎯',name:'Сильный предмет',desc:'10+ ответов и 70%+ в предмете',check:function(){return progressSummary().strongSubjects >= 1;}},
        {id:'w86r_subject_3',icon:'🧭',name:'Три предмета',desc:'3 предмета с устойчивым результатом',check:function(){return progressSummary().strongSubjects >= 3;}},
        {id:'w86r_balanced',icon:'🌈',name:'Кругозор',desc:'Есть ответы по каждому предмету класса',check:function(){var s=progressSummary();return s.subjects > 0 && s.activeSubjects >= s.subjects;}},
        {id:'w86r_clean10',icon:'🧼',name:'Чистая десятка',desc:'10 верных подряд в дневном рывке',check:function(){var d=getDaily();return (+d.pure || 0) >= 10;}},
        {id:'w86r_accuracy80',icon:'💎',name:'Точная рука',desc:'50+ ответов с точностью 80%+',check:function(){var s=progressSummary(), total=s.totalOk+s.totalErr;return total >= 50 && s.totalOk / total >= .8;}},
        {id:'w86r_recovery',icon:'🛠️',name:'Ошибка исправлена',desc:'После ошибок тема доведена до 80%+',check:function(){return progressSummary().recoveredTopics >= 1;}},
        {id:'w86r_weekly',icon:'🗓️',name:'Weekly герой',desc:'80%+ в weekly challenge',check:function(){return progressSummary().weeklyBest >= 80;}}
      ];
      var known = Object.create(null);
      BADGES.forEach(function(b){ known[b.id] = true; });
      defs.forEach(function(def){ if(!known[def.id]) BADGES.push(def); });
      BADGES.__wave86rRegistered = true;
    } catch(e) {}
  }
  function patchCheckBadges(){
    try {
      if(typeof checkBadges !== 'function' || checkBadges.__wave86rPatched) return;
      var original = checkBadges;
      var patched = function(){
        var before = [];
        try { before = (getStreak().badges || []).slice(); } catch(e) {}
        var result = original.apply(this, arguments);
        try {
          var after = getStreak().badges || [];
          var gained = after.filter(function(id){ return before.indexOf(id) === -1 && /^w86r_/.test(id); });
          if(gained.length){
            var names = [];
            if(typeof BADGES !== 'undefined') gained.forEach(function(id){
              var b = BADGES.find(function(x){ return x.id === id; });
              if(b) names.push(b.icon + ' ' + b.name);
            });
            toast('Новая ачивка: ' + (names[0] || 'достижение'));
          }
        } catch(e) {}
        return result;
      };
      patched.__wave86rPatched = true;
      checkBadges = patched;
      window.checkBadges = patched;
    } catch(e) {}
  }
  function patchAnswerReaction(){
    try {
      if(typeof ans !== 'function' || ans.__wave86rPatched) return;
      var original = ans;
      var patched = function(index){
        var wasOpen = true;
        var isCorrect = false;
        try {
          wasOpen = (typeof sel === 'undefined' || sel === null);
          if(wasOpen && typeof prob !== 'undefined' && prob && prob.options) isCorrect = prob.options[index] === prob.answer;
        } catch(e) {}
        var result = original.apply(this, arguments);
        try {
          if(wasOpen){
            if(isCorrect){
              if(typeof st !== 'undefined' && st && st.streak && st.streak % 5 === 0){
                toast('🔥 Серия ' + st.streak + ': держишь темп!');
                if(!hasReducedMotion() && typeof confetti === 'function') confetti(18);
              } else {
                toast('✅ Верно!');
              }
            } else {
              toast('📘 Ошибка — смотри разбор ниже');
            }
          }
        } catch(e) {}
        return result;
      };
      patched.__wave86rPatched = true;
      ans = patched;
      window.ans = patched;
    } catch(e) {}
  }
  function exposeAudit(){
    window.wave86rTheoryAchievements = {
      wave: WAVE,
      normalizeTopicTheory: normalizeTopicTheory,
      enhanceTopicList: enhanceTopicList,
      progressSummary: progressSummary,
      auditSnapshot: function(){
        normalizeTopicTheory();
        var subjects = getSubjects();
        var missingTheory = 0;
        subjects.forEach(function(subject){
          (subject.tops || []).forEach(function(topic){ if(!topic.th || !stripTags(topic.th)) missingTheory++; });
        });
        var badgeCount = 0;
        try { badgeCount = BADGES.filter(function(b){ return /^w86r_/.test(b.id); }).length; } catch(e) {}
        return {
          wave: WAVE,
          subjects: subjects.length,
          topics: progressSummary().topics,
          missingTheory: missingTheory,
          addedAchievements: badgeCount,
          openSubjPatched: typeof openSubj === 'function' && !!openSubj.__wave86rPatched,
          ansPatched: typeof ans === 'function' && !!ans.__wave86rPatched,
          checkBadgesPatched: typeof checkBadges === 'function' && !!checkBadges.__wave86rPatched
        };
      }
    };
  }
  function boot(){
    injectStyles();
    normalizeTopicTheory();
    registerAchievements();
    patchCheckBadges();
    patchAnswerReaction();
    patchOpenSubj();
    exposeAudit();
    setTimeout(function(){
      try { if(typeof checkBadges === 'function') checkBadges(); } catch(e) {}
      enhanceTopicList();
    }, 0);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();

;/* ---- bundle_gamification_xp.js ---- */
(function(root, factory){
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(root || globalThis, true);
  } else {
    root.wave66Xp = factory(root || window, false);
  }
})(typeof window !== 'undefined' ? window : globalThis, function(root, isNode){
  'use strict';

  var CONFIG = {
    key: 'trainer_xp_state_v1',
    profileActiveKey: 'trainer35_active_profile_v1',
    profileScopePrefix: 'trainer35_scoped:',
    maxLevel: 50,
    maxXp: 50000,
    xpCorrect: 10,
    xpHint: 5,
    xpStreak5: 20
  };

  var RANKS = [
    { min: 1,  max: 6,  label: 'Новичок', icon: '🌱' },
    { min: 7,  max: 13, label: 'Ученик', icon: '📘' },
    { min: 14, max: 20, label: 'Знаток', icon: '🧠' },
    { min: 21, max: 28, label: 'Мастер', icon: '🏅' },
    { min: 29, max: 36, label: 'Эксперт', icon: '🎯' },
    { min: 37, max: 43, label: 'Гуру', icon: '🔮' },
    { min: 44, max: 50, label: 'Легенда', icon: '👑' }
  ];

  var storage = {
    get: function(key){
      try { return Storage.prototype.getItem.call(root.localStorage, key); } catch (_) { return null; }
    },
    set: function(key, value){
      try { Storage.prototype.setItem.call(root.localStorage, key, String(value)); } catch (_) {}
    },
    remove: function(key){
      try { Storage.prototype.removeItem.call(root.localStorage, key); } catch (_) {}
    }
  };

  function esc(text){
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function activeProfileId(){
    return storage.get(CONFIG.profileActiveKey) || 'p1';
  }

  function scopedKey(baseKey){
    return CONFIG.profileScopePrefix + activeProfileId() + ':' + baseKey;
  }

  function readScopedJSON(baseKey, fallback){
    var scoped = storage.get(scopedKey(baseKey));
    var raw = scoped != null ? scoped : storage.get(baseKey);
    if (!raw) return cloneState(fallback);
    try { return Object.assign(cloneState(fallback), JSON.parse(raw)); } catch (_) { return cloneState(fallback); }
  }

  function writeScopedJSON(baseKey, value){
    storage.set(scopedKey(baseKey), JSON.stringify(value));
  }

  function cloneState(state){
    return JSON.parse(JSON.stringify(state || defaultState()));
  }

  function defaultState(){
    return {
      xp: 0,
      totalAwards: 0,
      correct: 0,
      hintCorrect: 0,
      streakBonuses: 0,
      bonusXp: 0,
      levelUps: 0,
      lastGain: 0,
      lastReason: '',
      lastLabel: '',
      updatedAt: '',
      history: []
    };
  }

  function thresholdForLevel(level){
    level = Math.max(1, Math.min(CONFIG.maxLevel, Math.round(level || 1)));
    if (level <= 1) return 0;
    if (level >= CONFIG.maxLevel) return CONFIG.maxXp;
    var ratio = (level - 1) / (CONFIG.maxLevel - 1);
    return Math.round(CONFIG.maxXp * ratio * ratio);
  }

  function levelForXp(xp){
    xp = Math.max(0, Number(xp) || 0);
    var level = 1;
    for (var i = 2; i <= CONFIG.maxLevel; i++) {
      if (xp >= thresholdForLevel(i)) level = i;
      else break;
    }
    return level;
  }

  function rankForLevel(level){
    level = Math.max(1, Math.min(CONFIG.maxLevel, Number(level) || 1));
    for (var i = 0; i < RANKS.length; i++) {
      if (level >= RANKS[i].min && level <= RANKS[i].max) return RANKS[i];
    }
    return RANKS[RANKS.length - 1];
  }

  function progressForXp(xp){
    var level = levelForXp(xp);
    var current = thresholdForLevel(level);
    var next = level >= CONFIG.maxLevel ? CONFIG.maxXp : thresholdForLevel(level + 1);
    var segment = Math.max(1, next - current);
    var progress = level >= CONFIG.maxLevel ? 1 : Math.max(0, Math.min(1, ((xp - current) / segment)));
    return {
      level: level,
      currentXp: current,
      nextXp: next,
      currentInLevel: Math.max(0, xp - current),
      neededInLevel: segment,
      progress: progress,
      pct: Math.round(progress * 100),
      rank: rankForLevel(level)
    };
  }

  function describeGain(reason, amount, label){
    if (!amount) return '';
    if (label) return '+' + amount + ' XP · ' + label;
    if (reason === 'hint') return '+5 XP за верный ответ с подсказкой';
    if (reason === 'streak5') return '+20 XP за серию из 5';
    if (reason === 'diagnostic') return '+' + amount + ' XP за диагностику';
    if (reason === 'mission') return '+' + amount + ' XP за миссию';
    return '+' + amount + ' XP за верный ответ';
  }

  function trimHistory(rows){
    rows = Array.isArray(rows) ? rows : [];
    return rows.slice(-30);
  }

  function loadState(){
    var state = readScopedJSON(CONFIG.key, defaultState());
    state.history = trimHistory(state.history);
    return state;
  }

  function saveState(state){
    state = Object.assign(defaultState(), state || {});
    state.history = trimHistory(state.history);
    writeScopedJSON(CONFIG.key, state);
    return state;
  }

  function summarize(state){
    state = state || loadState();
    var progress = progressForXp(state.xp || 0);
    return {
      xp: Number(state.xp || 0),
      level: progress.level,
      rank: progress.rank,
      progress: progress,
      correct: Number(state.correct || 0),
      hintCorrect: Number(state.hintCorrect || 0),
      streakBonuses: Number(state.streakBonuses || 0),
      bonusXp: Number(state.bonusXp || 0),
      totalAwards: Number(state.totalAwards || 0),
      levelUps: Number(state.levelUps || 0),
      lastGain: Number(state.lastGain || 0),
      lastReason: state.lastReason || '',
      lastLabel: state.lastLabel || '',
      updatedAt: state.updatedAt || '',
      history: trimHistory(state.history || [])
    };
  }

  function applyAward(state, type, meta){
    state = Object.assign(defaultState(), state || {});
    meta = meta || {};
    var before = summarize(state);
    var delta = 0;
    if (type === 'correct') {
      delta = meta.withHint ? CONFIG.xpHint : CONFIG.xpCorrect;
      if (meta.withHint) state.hintCorrect = Number(state.hintCorrect || 0) + 1;
      else state.correct = Number(state.correct || 0) + 1;
    } else if (type === 'streak5') {
      delta = CONFIG.xpStreak5;
      state.streakBonuses = Number(state.streakBonuses || 0) + 1;
    } else if (type === 'bonus') {
      delta = Math.max(0, Math.round(Number(meta.amount || 0)));
      state.bonusXp = Number(state.bonusXp || 0) + delta;
    }
    state.xp = Math.min(CONFIG.maxXp, Math.max(0, Number(state.xp || 0) + delta));
    state.totalAwards = Number(state.totalAwards || 0) + (delta > 0 ? 1 : 0);
    state.lastGain = delta;
    state.lastReason = meta.reason || type;
    state.lastLabel = meta.label || '';
    state.updatedAt = new Date().toISOString();
    state.history = trimHistory((state.history || []).concat([{
      ts: state.updatedAt,
      type: type,
      reason: meta.reason || type,
      label: meta.label || '',
      gain: delta,
      withHint: !!meta.withHint,
      tag: meta.tag || '',
      source: meta.source || ''
    }]));
    var after = summarize(state);
    if (after.level > before.level) state.levelUps = Number(state.levelUps || 0) + (after.level - before.level);
    return { state: state, delta: delta, before: before, after: after, leveledUp: after.level > before.level };
  }

  function dispatchUpdate(detail){
    if (!root.document || typeof root.CustomEvent !== 'function') return;
    try { root.dispatchEvent(new CustomEvent('wave66-xp-updated', { detail: detail })); } catch (_) {}
  }

  function award(type, meta){
    var result = applyAward(loadState(), type, meta);
    saveState(result.state);
    dispatchUpdate(result);
    if (!isNode && result.delta > 0) maybeShowToast(result);
    if (!isNode && result.leveledUp) showLevelUp(result.after);
    return result;
  }

  function levelCardHtml(summary, compact){
    compact = !!compact;
    var label = compact ? ('Ур. ' + summary.level) : ('Уровень ' + summary.level + ' · ' + summary.rank.icon + ' ' + summary.rank.label);
    var xpText = compact ? (summary.xp.toLocaleString('ru-RU') + ' XP') : (summary.xp.toLocaleString('ru-RU') + ' XP из ' + summary.progress.nextXp.toLocaleString('ru-RU'));
    return '<div class="wave66-xp-card' + (compact ? ' compact' : '') + '">' +
      '<div class="wave66-xp-top">' +
        '<div class="wave66-xp-title">' + esc(label) + '</div>' +
        '<div class="wave66-xp-meta">' + esc(xpText) + '</div>' +
      '</div>' +
      '<div class="wave66-xp-bar"><div class="wave66-xp-fill" style="width:' + summary.progress.pct + '%"></div></div>' +
      '<div class="wave66-xp-sub">До следующего уровня: <b>' + Math.max(0, summary.progress.nextXp - summary.xp).toLocaleString('ru-RU') + ' XP</b></div>' +
    '</div>';
  }

  function ensureStyle(){
    if (!root.document || root.document.getElementById('wave66-xp-style')) return;
    var style = root.document.createElement('style');
    style.id = 'wave66-xp-style';
    style.textContent = [
      '.wave66-xp-card{margin-top:10px;padding:12px 14px;border:1px solid var(--border,#e5e7eb);border-radius:14px;background:var(--card,#fff);color:var(--text,#111827);box-shadow:0 10px 24px rgba(15,23,42,.06)}',
      '.wave66-xp-card.compact{padding:10px 12px}',
      '.wave66-xp-top{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:8px}',
      '.wave66-xp-title{font-family:Unbounded,system-ui,sans-serif;font-size:13px;font-weight:900;line-height:1.25}',
      '.wave66-xp-meta{font-size:11px;color:var(--muted,#6b7280);white-space:nowrap}',
      '.wave66-xp-bar{height:10px;border-radius:999px;background:rgba(37,99,235,.12);overflow:hidden}',
      '.wave66-xp-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#2563eb,#7c3aed)}',
      '.wave66-xp-sub{margin-top:6px;font-size:11px;color:var(--muted,#6b7280)}',
      '.wave66-main-strip{margin-top:8px}',
      '.wave66-index-wrap{margin:16px 0 0}',
      '.wave66-dashboard-wrap{margin:10px 0 18px}',
      '.wave66-toast{position:fixed;left:50%;bottom:calc(76px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(16px);z-index:10001;background:rgba(17,24,39,.96);color:#fff;border-radius:999px;padding:10px 14px;font-size:12px;font-weight:700;box-shadow:0 14px 30px rgba(0,0,0,.25);opacity:0;pointer-events:none;transition:opacity .22s ease, transform .22s ease;max-width:min(92vw,420px);text-align:center}',
      '.wave66-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}',
      '.wave66-levelup-overlay{position:fixed;inset:0;background:rgba(15,23,42,.58);display:flex;align-items:center;justify-content:center;padding:20px;z-index:10002}',
      '.wave66-levelup-card{width:min(92vw,360px);border-radius:22px;padding:24px 22px;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#fff;text-align:center;box-shadow:0 30px 60px rgba(15,23,42,.35);animation:wave66-pop .35s ease both}',
      '.wave66-levelup-card .big{font-family:Unbounded,system-ui,sans-serif;font-size:32px;font-weight:900;margin:8px 0 6px}',
      '.wave66-levelup-card .ttl{font-family:Unbounded,system-ui,sans-serif;font-size:14px;font-weight:900;letter-spacing:.3px}',
      '.wave66-levelup-card .sub{font-size:12px;opacity:.9;line-height:1.45;margin-top:8px}',
      '@keyframes wave66-pop{from{opacity:0;transform:scale(.9) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}'
    ].join('');
    root.document.head.appendChild(style);
  }

  function renderGradePanel(){
    if (!root.document) return;
    var badge = root.document.getElementById('player-badge');
    if (!badge || !root.document.getElementById('s-main')) return;
    var holder = root.document.getElementById('wave66-main-strip');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave66-main-strip';
      holder.className = 'wave66-main-strip';
      badge.insertAdjacentElement('afterend', holder);
    }
    holder.innerHTML = levelCardHtml(summarize(), false);
  }

  function renderIndexCard(){
    if (!root.document || root.document.getElementById('s-main')) return;
    var stats = root.document.querySelector('.header .stats');
    if (!stats) return;
    var holder = root.document.getElementById('wave66-index-wrap');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave66-index-wrap';
      holder.className = 'wave66-index-wrap';
      stats.insertAdjacentElement('afterend', holder);
    }
    var summary = summarize();
    holder.innerHTML = levelCardHtml(summary, false);
  }

  function renderDashboardCard(){
    if (!root.document || !root.document.querySelector('.hero')) return;
    var hero = root.document.querySelector('.hero');
    var holder = root.document.getElementById('wave66-dashboard-wrap');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave66-dashboard-wrap';
      holder.className = 'wave66-dashboard-wrap';
      hero.insertAdjacentElement('afterend', holder);
    }
    var summary = summarize();
    holder.innerHTML = levelCardHtml(summary, false);
    var rank = root.document.getElementById('rank');
    if (rank) {
      rank.textContent = summary.rank.icon + ' ' + summary.rank.label + ' · уровень ' + summary.level + ' · ' + summary.xp.toLocaleString('ru-RU') + ' XP';
    }
  }

  function decorateHallOfFame(){
    if (!root.document) return;
    var overlays = Array.prototype.slice.call(root.document.querySelectorAll('body > div[style*="position:fixed"]'));
    if (!overlays.length) return;
    var overlay = overlays[overlays.length - 1];
    var card = overlay && overlay.firstElementChild;
    if (!card || card.querySelector('.wave66-profile-xp')) return;
    var summary = summarize();
    var section = root.document.createElement('div');
    section.className = 'wave66-profile-xp';
    section.style.margin = '0 0 14px';
    section.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px">' +
      '<div style="font-family:Unbounded,system-ui,sans-serif;font-size:13px;font-weight:900;color:#fff">' + esc(summary.rank.icon + ' ' + summary.rank.label + ' · уровень ' + summary.level) + '</div>' +
      '<div style="font-size:11px;color:#c7d2fe">' + summary.xp.toLocaleString('ru-RU') + ' XP</div>' +
      '</div>' +
      '<div style="height:10px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden"><div style="height:100%;width:' + summary.progress.pct + '%;border-radius:999px;background:linear-gradient(90deg,#fbbf24,#f472b6)"></div></div>' +
      '<div style="margin-top:6px;font-size:11px;color:#c7d2fe">До следующего уровня: ' + Math.max(0, summary.progress.nextXp - summary.xp).toLocaleString('ru-RU') + ' XP</div>';
    var statsGrid = card.children[1] || null;
    if (statsGrid && statsGrid.insertAdjacentElement) statsGrid.insertAdjacentElement('afterend', section);
    else card.appendChild(section);
  }

  function maybeShowToast(result){
    if (!root.document || !result || !result.delta) return;
    var toast = root.document.getElementById('wave66-xp-toast');
    if (!toast) {
      toast = root.document.createElement('div');
      toast.id = 'wave66-xp-toast';
      toast.className = 'wave66-toast';
      root.document.body.appendChild(toast);
    }
    toast.textContent = describeGain(result.state.lastReason, result.delta, result.state.lastLabel);
    toast.classList.add('on');
    clearTimeout(toast._tid);
    toast._tid = setTimeout(function(){ toast.classList.remove('on'); }, 1600);
  }

  function showLevelUp(summary){
    if (!root.document || root.document.getElementById('wave66-levelup')) return;
    var overlay = root.document.createElement('div');
    overlay.id = 'wave66-levelup';
    overlay.className = 'wave66-levelup-overlay';
    overlay.innerHTML = '<div class="wave66-levelup-card">' +
      '<div class="ttl">Новый уровень</div>' +
      '<div class="big">' + summary.level + '</div>' +
      '<div style="font-size:18px;font-weight:800">' + esc(summary.rank.icon + ' ' + summary.rank.label) + '</div>' +
      '<div class="sub">Продолжай серию: верные ответы, тренировки без подсказок и ровные стрики дают больше XP.</div>' +
      '</div>';
    overlay.addEventListener('click', function(){ overlay.remove(); });
    root.document.body.appendChild(overlay);
    if (typeof root.confetti === 'function') {
      try { root.confetti(60); } catch (_) {}
    }
    setTimeout(function(){ if (overlay && overlay.parentNode) overlay.remove(); }, 2400);
  }

  function patchAns(){
    if (!root.ans || root.__wave66AnsPatched) return;
    var original = root.ans;
    root.ans = function(index){
      var alreadySelected = false;
      try { alreadySelected = typeof sel !== 'undefined' && sel !== null; } catch (_) { alreadySelected = false; }
      if (alreadySelected) return original.apply(this, arguments);
      var beforeStreak = 0;
      try { beforeStreak = st && Number(st.streak || 0); } catch (_) { beforeStreak = 0; }
      var selected = null;
      var isCorrect = false;
      var withHint = false;
      var tag = '';
      try {
        selected = prob && prob.options ? prob.options[index] : null;
        isCorrect = !!(prob && selected === prob.answer);
        withHint = !!usedHelp;
        tag = prob && prob.tag ? prob.tag : '';
      } catch (_) {}
      var out = original.apply(this, arguments);
      if (isCorrect) {
        award('correct', { withHint: withHint, tag: tag, source: 'grade' });
        var afterStreak = 0;
        try { afterStreak = st && Number(st.streak || 0); } catch (_) { afterStreak = 0; }
        if (!withHint && afterStreak >= 5 && afterStreak % 5 === 0 && afterStreak !== beforeStreak) {
          award('streak5', { tag: tag, source: 'grade' });
        }
      }
      return out;
    };
    root.__wave66AnsPatched = true;
  }

  function patchHallOfFame(){
    if (!root.showHallOfFame || root.__wave66HallPatched) return;
    var original = root.showHallOfFame;
    root.showHallOfFame = function(){
      var out = original.apply(this, arguments);
      setTimeout(decorateHallOfFame, 0);
      return out;
    };
    root.__wave66HallPatched = true;
  }

  function patchPlayerBadge(){
    if (!root.renderPlayerBadge || root.__wave66BadgePatched) return;
    var original = root.renderPlayerBadge;
    root.renderPlayerBadge = function(){
      var out = original.apply(this, arguments);
      renderGradePanel();
      return out;
    };
    root.__wave66BadgePatched = true;
  }

  function patchBackup(){
    if (root.getBackupSnapshot && !root.__wave66BackupGetPatched) {
      var originalGet = root.getBackupSnapshot;
      root.getBackupSnapshot = function(){
        var snap = originalGet.apply(this, arguments);
        try { snap.xpState = loadState(); } catch (_) {}
        return snap;
      };
      root.__wave66BackupGetPatched = true;
    }
    if (root.applyBackupSnapshot && !root.__wave66BackupApplyPatched) {
      var originalApply = root.applyBackupSnapshot;
      root.applyBackupSnapshot = function(payload){
        var out = originalApply.apply(this, arguments);
        try {
          if (payload && payload.xpState) saveState(Object.assign(defaultState(), payload.xpState));
        } catch (_) {}
        dispatchUpdate({ state: loadState(), after: summarize() });
        return out;
      };
      root.__wave66BackupApplyPatched = true;
    }
  }

  function patchDiagnostic(){
    if (!root.addEventListener || root.__wave66DiagPatched) return;
    root.addEventListener('wave25-diagnostic-saved', function(ev){
      var entry = ev && ev.detail ? ev.detail : null;
      if (!entry || !entry.subjectId) return;
      var totalOk = Math.max(0, Number(entry.totalOk || 0));
      if (!totalOk) return;
      var before = summarize(loadState());
      var state = loadState();
      for (var i = 0; i < totalOk; i++) state = applyAward(state, 'correct', { withHint: false, tag: entry.subjectId, source: 'diagnostic' }).state;
      saveState(state);
      var after = summarize(state);
      dispatchUpdate({ state: state, before: before, after: after, delta: totalOk * CONFIG.xpCorrect, leveledUp: after.level > before.level });
      if (!isNode) {
        maybeShowToast({ delta: totalOk * CONFIG.xpCorrect, state: { lastReason: 'diagnostic' } });
        if (after.level > before.level) showLevelUp(after);
      }
    });
    root.__wave66DiagPatched = true;
  }

  function refreshUi(){
    ensureStyle();
    renderGradePanel();
    renderIndexCard();
    renderDashboardCard();
    decorateHallOfFame();
  }

  function init(){
    if (isNode || !root.document) return;
    ensureStyle();
    patchAns();
    patchHallOfFame();
    patchPlayerBadge();
    patchBackup();
    patchDiagnostic();
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', refreshUi, { once: true });
    } else {
      refreshUi();
    }
    root.addEventListener('wave66-xp-updated', function(){ setTimeout(refreshUi, 0); });
    root.addEventListener('dashboard-state-ready', function(){ setTimeout(renderDashboardCard, 0); });
  }

  function grantBonus(amount, label, meta){
    meta = Object.assign({}, meta || {}, { amount: amount, label: label || '', reason: (meta && meta.reason) || 'bonus' });
    return award('bonus', meta);
  }

  var api = {
    config: CONFIG,
    ranks: RANKS,
    thresholdForLevel: thresholdForLevel,
    levelForXp: levelForXp,
    rankForLevel: rankForLevel,
    progressForXp: progressForXp,
    defaultState: defaultState,
    loadState: loadState,
    saveState: saveState,
    summarize: summarize,
    applyAward: applyAward,
    award: award,
    grantBonus: grantBonus,
    refreshUi: refreshUi,
    init: init
  };

  init();
  return api;
});

;/* ---- bundle_gamification_meta.js ---- */
(function(root, factory){
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(root || globalThis, true);
  } else {
    root.wave67Meta = factory(root || window, false);
  }
})(typeof window !== 'undefined' ? window : globalThis, function(root, isNode){
  'use strict';

  var CONFIG = {
    key: 'trainer_meta_state_v1',
    profileActiveKey: 'trainer35_active_profile_v1',
    profileScopePrefix: 'trainer35_scoped:',
    totalAchievements: 35,
    dailyMissionCount: 3,
    weeklyMissionCount: 2
  };

  var storage = {
    get: function(key){
      try { return Storage.prototype.getItem.call(root.localStorage, key); } catch (_) { return null; }
    },
    set: function(key, value){
      try { Storage.prototype.setItem.call(root.localStorage, key, String(value)); } catch (_) {}
    }
  };

  function esc(text){
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function nowDate(now){ return now instanceof Date ? now : new Date(now || Date.now()); }
  function pad2(v){ return String(v).padStart(2, '0'); }
  function activeProfileId(){ return storage.get(CONFIG.profileActiveKey) || 'p1'; }
  function scopedKey(baseKey){ return CONFIG.profileScopePrefix + activeProfileId() + ':' + baseKey; }
  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }

  function dayKey(now){
    var d = nowDate(now);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function isoWeekKey(now){
    var d = nowDate(now);
    var dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var dayNum = dt.getUTCDay() || 7;
    dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
    var week = Math.ceil((((dt - yearStart) / 86400000) + 1) / 7);
    return dt.getUTCFullYear() + '-W' + pad2(week);
  }

  var DAILY_DEFS = [
    { id: 'daily_answers_20', title: 'Ответь на 20 вопросов', target: 20, kind: 'answers' },
    { id: 'daily_topics_3', title: 'Пройди 3 темы', target: 3, kind: 'topics' },
    { id: 'daily_xp_100', title: 'Набери 100 XP', target: 100, kind: 'xp' }
  ];

  var WEEKLY_DEFS = [
    { id: 'weekly_topics_5', title: 'Пройди 5 новых тем', target: 5, kind: 'topics' },
    { id: 'weekly_combo_10', title: 'Серия из 10 правильных', target: 10, kind: 'combo' }
  ];

  function achievement(id, title, desc, cond, secret, icon){
    return { id: id, title: title, desc: desc, condition: cond, secret: !!secret, icon: icon || '🏆' };
  }

  var ACHIEVEMENTS = [
    achievement('first_answer', 'Первые шаги', 'Ответь на первый вопрос.', function(s){ return s.totalAnswers >= 1; }, false, '👣'),
    achievement('first_correct', 'Точно в цель', 'Дай первый правильный ответ.', function(s){ return s.correct >= 1; }, false, '🎯'),
    achievement('warmup_10', 'Разогрев', 'Ответь на 10 вопросов.', function(s){ return s.totalAnswers >= 10; }, false, '🔥'),
    achievement('answers_50', 'Темп взят', 'Ответь на 50 вопросов.', function(s){ return s.totalAnswers >= 50; }, false, '⚡'),
    achievement('answers_100', 'Сотня', 'Ответь на 100 вопросов.', function(s){ return s.totalAnswers >= 100; }, false, '💯'),
    achievement('answers_250', 'Марафонец', 'Ответь на 250 вопросов.', function(s){ return s.totalAnswers >= 250; }, false, '🏃'),
    achievement('answers_500', 'Машина решений', 'Ответь на 500 вопросов.', function(s){ return s.totalAnswers >= 500; }, false, '🤖'),
    achievement('answers_1000', 'Гигабайт знаний', 'Ответь на 1000 вопросов.', function(s){ return s.totalAnswers >= 1000; }, false, '📚'),
    achievement('nohint_25', 'Самостоятельно', '25 верных ответов без подсказки.', function(s){ return s.noHintCorrect >= 25; }, false, '🧩'),
    achievement('nohint_100', 'Уверенный ход', '100 верных ответов без подсказки.', function(s){ return s.noHintCorrect >= 100; }, false, '🛡️'),
    achievement('nohint_250', 'Без шпаргалки', '250 верных ответов без подсказки.', function(s){ return s.noHintCorrect >= 250; }, false, '🧠'),
    achievement('combo_3', 'Комбо x1.5', 'Собери серию из 3 правильных без подсказки.', function(s){ return s.bestCombo >= 3; }, false, '✨'),
    achievement('combo_5', 'Комбо x2', 'Собери серию из 5 правильных без подсказки.', function(s){ return s.bestCombo >= 5; }, false, '⚔️'),
    achievement('combo_10', 'Стоик', 'Собери серию из 10 правильных без подсказки.', function(s){ return s.bestCombo >= 10; }, false, '🏔️'),
    achievement('combo_20', 'Несокрушимый', 'Собери серию из 20 правильных без подсказки.', function(s){ return s.bestCombo >= 20; }, false, '🗿'),
    achievement('topics_5', 'Исследователь', 'Открой 5 разных тем.', function(s){ return uniqueCount(s.topicsSeen) >= 5; }, false, '🧭'),
    achievement('topics_15', 'Картограф', 'Открой 15 разных тем.', function(s){ return uniqueCount(s.topicsSeen) >= 15; }, false, '🗺️'),
    achievement('topics_30', 'Полигистор', 'Открой 30 разных тем.', function(s){ return uniqueCount(s.topicsSeen) >= 30; }, false, '🌐'),
    achievement('diagnostic_1', 'Диагност', 'Пройди первую диагностику.', function(s){ return s.diagnosticsTaken >= 1; }, false, '🩺'),
    achievement('diagnostic_5', 'Трекер прогресса', 'Пройди 5 диагностик.', function(s){ return s.diagnosticsTaken >= 5; }, false, '📈'),
    achievement('daily_1', 'План на день', 'Закрой все миссии дня один раз.', function(s){ return s.missionDays >= 1; }, false, '📅'),
    achievement('daily_7', 'Ритм недели', 'Закрой все миссии дня 7 раз.', function(s){ return s.missionDays >= 7; }, false, '🗓️'),
    achievement('weekly_1', 'Челлендж принят', 'Закрой все недельные челленджи.', function(s){ return s.weekWins >= 1; }, false, '🏁'),
    achievement('weekly_4', 'Стабильный прогресс', 'Закрой все недельные челленджи 4 раза.', function(s){ return s.weekWins >= 4; }, false, '🚀'),
    achievement('level_5', 'Пятый уровень', 'Достигни 5 уровня.', function(s, xp){ return xp.level >= 5; }, false, '🥉'),
    achievement('level_10', 'Десятый уровень', 'Достигни 10 уровня.', function(s, xp){ return xp.level >= 10; }, false, '🥈'),
    achievement('level_20', 'Двадцатый уровень', 'Достигни 20 уровня.', function(s, xp){ return xp.level >= 20; }, false, '🥇'),
    achievement('level_30', 'Тридцатый уровень', 'Достигни 30 уровня.', function(s, xp){ return xp.level >= 30; }, false, '🏆'),
    achievement('level_40', 'Сороковой уровень', 'Достигни 40 уровня.', function(s, xp){ return xp.level >= 40; }, false, '👑'),
    achievement('level_50', 'Легенда', 'Достигни 50 уровня.', function(s, xp){ return xp.level >= 50; }, false, '🌟'),

    achievement('secret_combo_13', 'Чёртова дюжина', 'Серия из 13 правильных без подсказки.', function(s){ return s.bestCombo >= 13; }, true, '🕵️'),
    achievement('secret_topics_day_10', 'Спринтер тем', 'Открой 10 тем за один день.', function(s){ return uniqueCount((s.day || {}).topics) >= 10; }, true, '🪄'),
    achievement('secret_topics_week_20', 'Архитектор недели', 'Открой 20 тем за неделю.', function(s){ return uniqueCount((s.week || {}).topics) >= 20; }, true, '🔐'),
    achievement('secret_full_board', 'Чистый лист', 'Закрой все миссии дня и недели в одной неделе.', function(s){ return !!(s.day && s.day.allCompleted && s.week && s.week.allCompleted); }, true, '🎁'),
    achievement('secret_xp_cap', 'Потолок XP', 'Набери максимум — 50 000 XP.', function(s, xp){ return xp.xp >= 50000; }, true, '🪙')
  ];

  function defaultState(){
    return {
      combo: 0,
      bestCombo: 0,
      totalAnswers: 0,
      correct: 0,
      wrong: 0,
      noHintCorrect: 0,
      hintCorrect: 0,
      diagnosticsTaken: 0,
      missionDays: 0,
      weekWins: 0,
      topicsSeen: {},
      subjectsSeen: {},
      unlocked: {},
      unlockOrder: [],
      day: { key: '', answers: 0, xp: 0, topics: {}, completed: {}, allCompleted: false },
      week: { key: '', topics: {}, bestCombo: 0, completed: {}, allCompleted: false }
    };
  }

  function uniqueCount(map){ return Object.keys(map || {}).length; }
  function loadState(){
    var raw = storage.get(scopedKey(CONFIG.key)) || storage.get(CONFIG.key);
    if (!raw) return ensurePeriods(defaultState());
    try { return ensurePeriods(Object.assign(defaultState(), JSON.parse(raw))); } catch (_) { return ensurePeriods(defaultState()); }
  }
  function saveState(state){
    state = ensurePeriods(Object.assign(defaultState(), state || {}));
    storage.set(scopedKey(CONFIG.key), JSON.stringify(state));
    return state;
  }

  function ensurePeriods(state, now){
    state = Object.assign(defaultState(), state || {});
    var dk = dayKey(now);
    var wk = isoWeekKey(now);
    if (!state.day || state.day.key !== dk) {
      state.day = { key: dk, answers: 0, xp: 0, topics: {}, completed: {}, allCompleted: false };
    }
    if (!state.week || state.week.key !== wk) {
      state.week = { key: wk, topics: {}, bestCombo: 0, completed: {}, allCompleted: false };
    }
    if (!state.topicsSeen) state.topicsSeen = {};
    if (!state.subjectsSeen) state.subjectsSeen = {};
    if (!state.unlocked) state.unlocked = {};
    if (!Array.isArray(state.unlockOrder)) state.unlockOrder = [];
    return state;
  }

  function comboMultiplierForStreak(streak){
    if (streak >= 10) return 3;
    if (streak >= 5) return 2;
    if (streak >= 3) return 1.5;
    return 1;
  }

  function comboBonusForStreak(streak){
    if (streak >= 10) return 20;
    if (streak >= 5) return 10;
    if (streak >= 3) return 5;
    return 0;
  }

  function currentXpSummary(){
    if (root.wave66Xp && typeof root.wave66Xp.summarize === 'function') return root.wave66Xp.summarize();
    return { xp: 0, level: 1, rank: { label: 'Новичок', icon: '🌱' } };
  }

  function recordAnswer(state, payload){
    payload = payload || {};
    state = ensurePeriods(state, payload.now);
    state.totalAnswers += 1;
    state.day.answers += 1;
    if (payload.correct) {
      state.correct += 1;
      if (payload.withHint) {
        state.hintCorrect += 1;
        state.combo = 0;
      } else {
        state.noHintCorrect += 1;
        state.combo += 1;
        if (state.combo > state.bestCombo) state.bestCombo = state.combo;
        if (state.combo > Number(state.week.bestCombo || 0)) state.week.bestCombo = state.combo;
      }
      if (payload.tag) {
        state.topicsSeen[payload.tag] = payload.tag;
        state.day.topics[payload.tag] = payload.tag;
        state.week.topics[payload.tag] = payload.tag;
      }
    } else {
      state.wrong += 1;
      state.combo = 0;
    }
    var multiplier = comboMultiplierForStreak(state.combo);
    var bonus = (!payload.withHint && payload.correct) ? comboBonusForStreak(state.combo) : 0;
    return { state: state, combo: { streak: state.combo, multiplier: multiplier, bonus: bonus } };
  }

  function recordXp(state, payload){
    payload = payload || {};
    state = ensurePeriods(state, payload.now);
    state.day.xp += Math.max(0, Number(payload.delta || 0));
    return { state: state };
  }

  function recordDiagnostic(state, payload){
    payload = payload || {};
    state = ensurePeriods(state, payload.now);
    state.diagnosticsTaken += 1;
    if (payload.subjectId) state.subjectsSeen[payload.subjectId] = payload.subjectId;
    var totalQ = Math.max(0, Number(payload.totalQ || 0));
    var totalOk = Math.max(0, Number(payload.totalOk || 0));
    if (totalQ) {
      state.totalAnswers += totalQ;
      state.day.answers += totalQ;
      state.correct += totalOk;
      state.noHintCorrect += totalOk;
      state.wrong += Math.max(0, totalQ - totalOk);
    }
    return { state: state };
  }

  function missionProgress(def, state){
    state = ensurePeriods(state);
    if (def.kind === 'answers') return Number(state.day.answers || 0);
    if (def.kind === 'xp') return Number(state.day.xp || 0);
    if (def.kind === 'topics' && def.id.indexOf('weekly') === 0) return uniqueCount(state.week.topics);
    if (def.kind === 'topics') return uniqueCount(state.day.topics);
    if (def.kind === 'combo') return Math.max(Number(state.bestCombo || 0), Number((state.week || {}).bestCombo || 0));
    return 0;
  }

  function evaluateMissions(state, now){
    state = ensurePeriods(state, now);
    var completed = [];
    DAILY_DEFS.forEach(function(def){
      var progress = missionProgress(def, state);
      if (progress >= def.target && !state.day.completed[def.id]) {
        state.day.completed[def.id] = new Date(now || Date.now()).toISOString();
        completed.push({ scope: 'day', def: def, progress: progress });
      }
    });
    WEEKLY_DEFS.forEach(function(def){
      var progress = missionProgress(def, state);
      if (progress >= def.target && !state.week.completed[def.id]) {
        state.week.completed[def.id] = new Date(now || Date.now()).toISOString();
        completed.push({ scope: 'week', def: def, progress: progress });
      }
    });
    var dailyDone = DAILY_DEFS.every(function(def){ return !!state.day.completed[def.id]; });
    if (dailyDone && !state.day.allCompleted) {
      state.day.allCompleted = true;
      state.missionDays += 1;
    }
    var weeklyDone = WEEKLY_DEFS.every(function(def){ return !!state.week.completed[def.id]; });
    if (weeklyDone && !state.week.allCompleted) {
      state.week.allCompleted = true;
      state.weekWins += 1;
    }
    return { state: state, completed: completed };
  }

  function evaluateAchievements(state, xpSummary, now){
    state = ensurePeriods(state, now);
    xpSummary = xpSummary || currentXpSummary();
    var unlocked = [];
    ACHIEVEMENTS.forEach(function(def){
      if (state.unlocked[def.id]) return;
      var ok = false;
      try { ok = !!def.condition(state, xpSummary || { xp: 0, level: 1 }); } catch (_) { ok = false; }
      if (ok) {
        var ts = new Date(now || Date.now()).toISOString();
        state.unlocked[def.id] = ts;
        state.unlockOrder.push({ id: def.id, ts: ts });
        unlocked.push(def);
      }
    });
    state.unlockOrder = state.unlockOrder.slice(-60);
    return { state: state, unlocked: unlocked };
  }

  function getMissionSnapshot(state, xpSummary){
    state = ensurePeriods(state);
    xpSummary = xpSummary || currentXpSummary();
    var daily = DAILY_DEFS.map(function(def){
      var progress = missionProgress(def, state);
      return { id: def.id, title: def.title, target: def.target, progress: Math.min(def.target, progress), done: !!state.day.completed[def.id], scope: 'day' };
    });
    var weekly = WEEKLY_DEFS.map(function(def){
      var progress = missionProgress(def, state);
      return { id: def.id, title: def.title, target: def.target, progress: Math.min(def.target, progress), done: !!state.week.completed[def.id], scope: 'week' };
    });
    var unlockedCount = Object.keys(state.unlocked || {}).length;
    var secretTotal = ACHIEVEMENTS.filter(function(def){ return def.secret; }).length;
    var secretUnlocked = ACHIEVEMENTS.filter(function(def){ return def.secret && state.unlocked[def.id]; }).length;
    return {
      state: state,
      xp: xpSummary,
      combo: { streak: Number(state.combo || 0), multiplier: comboMultiplierForStreak(Number(state.combo || 0)), bonus: comboBonusForStreak(Number(state.combo || 0)) },
      daily: daily,
      weekly: weekly,
      unlockedCount: unlockedCount,
      totalCount: ACHIEVEMENTS.length,
      secretUnlocked: secretUnlocked,
      secretTotal: secretTotal,
      visibleUnlocked: unlockedCount - secretUnlocked,
      recent: state.unlockOrder.slice(-6).reverse().map(function(row){ return findAchievement(row.id); })
    };
  }

  function findAchievement(id){
    for (var i = 0; i < ACHIEVEMENTS.length; i++) if (ACHIEVEMENTS[i].id === id) return ACHIEVEMENTS[i];
    return null;
  }

  function snapshot(state, xpSummary){
    state = ensurePeriods(state);
    var snap = getMissionSnapshot(state, xpSummary);
    snap.achievements = ACHIEVEMENTS.map(function(def){
      return { id: def.id, title: def.title, desc: def.desc, icon: def.icon, secret: def.secret, unlocked: !!state.unlocked[def.id] };
    });
    return snap;
  }

  function reduceAnswer(state, payload, xpSummary){
    var out = recordAnswer(state, payload);
    var state2 = out.state;
    var missionOut = evaluateMissions(state2, payload && payload.now);
    var achOut = evaluateAchievements(missionOut.state, xpSummary, payload && payload.now);
    return { state: achOut.state, combo: out.combo, completed: missionOut.completed, unlocked: achOut.unlocked };
  }

  function reduceXp(state, payload, xpSummary){
    var out = recordXp(state, payload);
    var missionOut = evaluateMissions(out.state, payload && payload.now);
    var achOut = evaluateAchievements(missionOut.state, xpSummary, payload && payload.now);
    return { state: achOut.state, completed: missionOut.completed, unlocked: achOut.unlocked };
  }

  function reduceDiagnostic(state, payload, xpSummary){
    var out = recordDiagnostic(state, payload);
    var missionOut = evaluateMissions(out.state, payload && payload.now);
    var achOut = evaluateAchievements(missionOut.state, xpSummary, payload && payload.now);
    return { state: achOut.state, completed: missionOut.completed, unlocked: achOut.unlocked };
  }

  function dispatchUpdate(detail){
    if (!root.document || typeof root.CustomEvent !== 'function') return;
    try { root.dispatchEvent(new CustomEvent('wave67-meta-updated', { detail: detail })); } catch (_) {}
  }

  function saveAndDispatch(result){
    saveState(result.state);
    dispatchUpdate({ state: result.state, snapshot: snapshot(result.state, currentXpSummary()), completed: result.completed || [], unlocked: result.unlocked || [] });
    return result;
  }

  function queueToast(message, kind){
    if (isNode || !root.document || !message) return;
    ensureStyle();
    var toast = root.document.getElementById('wave67-meta-toast');
    if (!toast) {
      toast = root.document.createElement('div');
      toast.id = 'wave67-meta-toast';
      toast.className = 'wave67-toast';
      root.document.body.appendChild(toast);
    }
    toast.className = 'wave67-toast on ' + (kind || 'info');
    toast.textContent = message;
    clearTimeout(toast._tid);
    toast._tid = setTimeout(function(){ toast.className = 'wave67-toast'; }, 1800);
  }

  function handleOutcome(result){
    result = result || {};
    if (result.unlocked && result.unlocked.length) {
      queueToast('Достижение: ' + result.unlocked[0].title, 'ach');
      if (result.completed && result.completed.length > 0) {
        setTimeout(function(){ queueToast('Миссия: ' + result.completed[0].def.title, 'mission'); }, 450);
      }
      return;
    }
    if (result.completed && result.completed.length) queueToast('Миссия: ' + result.completed[0].def.title, 'mission');
  }

  function ensureStyle(){
    if (!root.document || root.document.getElementById('wave67-meta-style')) return;
    var style = root.document.createElement('style');
    style.id = 'wave67-meta-style';
    style.textContent = [
      '.wave67-card{margin-top:10px;padding:12px 14px;border:1px solid var(--border,#e5e7eb);border-radius:14px;background:var(--card,#fff);box-shadow:0 10px 24px rgba(15,23,42,.06)}',
      '.wave67-title{font-family:Unbounded,system-ui,sans-serif;font-size:13px;font-weight:900;line-height:1.25;margin:0 0 8px}',
      '.wave67-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px}',
      '.wave67-meta{font-size:11px;color:var(--muted,#6b7280)}',
      '.wave67-stack{display:grid;gap:8px}',
      '.wave67-mission{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}',
      '.wave67-mission-title{font-size:12px;font-weight:700;line-height:1.35}',
      '.wave67-bar{height:8px;border-radius:999px;background:rgba(37,99,235,.12);overflow:hidden;margin-top:5px}',
      '.wave67-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#06b6d4,#2563eb)}',
      '.wave67-chip{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:800;background:rgba(37,99,235,.08);color:#1d4ed8}',
      '.wave67-ach-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}',
      '.wave67-ach{border:1px solid var(--border,#e5e7eb);border-radius:12px;padding:8px 10px;background:rgba(255,255,255,.75)}',
      '.wave67-ach.secret.locked{opacity:.65;filter:saturate(.6)}',
      '.wave67-ach .nm{font-size:12px;font-weight:800;line-height:1.3}',
      '.wave67-ach .ds{font-size:11px;color:var(--muted,#6b7280);margin-top:3px;line-height:1.35}',
      '.wave67-ach .ic{font-size:16px;margin-right:6px}',
      '.wave67-inline{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}',
      '.wave67-toast{position:fixed;left:50%;bottom:calc(118px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(10px);z-index:10003;background:rgba(15,23,42,.95);color:#fff;border-radius:999px;padding:10px 14px;font-size:12px;font-weight:800;opacity:0;pointer-events:none;transition:opacity .2s ease, transform .2s ease;max-width:min(92vw,420px);text-align:center;box-shadow:0 12px 30px rgba(0,0,0,.28)}',
      '.wave67-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}',
      '.wave67-toast.mission{background:rgba(37,99,235,.96)}',
      '.wave67-toast.ach{background:rgba(124,58,237,.96)}',
      '.wave67-grade-strip{margin-top:10px}',
      '.wave67-dashboard-wrap{margin:10px 0 18px}',
      '.wave67-index-wrap{margin:10px 0 0}',
      '@media (max-width:640px){.wave67-ach-grid{grid-template-columns:1fr}}'
    ].join('');
    root.document.head.appendChild(style);
  }

  function listHtml(items){
    return items.map(function(item){
      var pct = Math.max(0, Math.min(100, Math.round((item.progress / item.target) * 100)));
      return '<div class="wave67-mission">' +
        '<div><div class="wave67-mission-title">' + esc(item.title) + '</div><div class="wave67-bar"><div class="wave67-fill" style="width:' + pct + '%"></div></div></div>' +
        '<div class="wave67-meta">' + item.progress + '/' + item.target + (item.done ? ' ✓' : '') + '</div>' +
      '</div>';
    }).join('');
  }

  function recentAchievementsHtml(snap, limit, dark){
    var rows = snap.achievements.filter(function(item){ return item.unlocked; }).slice(-limit).reverse();
    if (!rows.length) rows = snap.achievements.filter(function(item){ return !item.secret; }).slice(0, limit);
    return rows.map(function(item){
      var title = item.secret && !item.unlocked ? 'Секретное достижение' : item.title;
      var desc = item.secret && !item.unlocked ? 'Откроется после особого действия.' : item.desc;
      return '<div class="wave67-ach' + (item.secret ? ' secret' : '') + (item.secret && !item.unlocked ? ' locked' : '') + '"' + (dark ? ' style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);color:#fff"' : '') + '>' +
        '<div class="nm"><span class="ic">' + esc(item.icon) + '</span>' + esc(title) + '</div>' +
        '<div class="ds"' + (dark ? ' style="color:#c7d2fe"' : '') + '>' + esc(desc) + '</div>' +
      '</div>';
    }).join('');
  }

  function renderGradeStrip(){
    if (!root.document || !root.document.getElementById('s-main')) return;
    var anchor = root.document.getElementById('wave66-main-strip');
    if (!anchor) return;
    var holder = root.document.getElementById('wave67-grade-strip');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave67-grade-strip';
      holder.className = 'wave67-grade-strip';
      anchor.insertAdjacentElement('afterend', holder);
    }
    var snap = snapshot(loadState(), currentXpSummary());
    holder.innerHTML = '<div class="wave67-card">' +
      '<div class="wave67-row"><div class="wave67-title">Комбо и миссии</div><div class="wave67-chip">x' + snap.combo.multiplier + ' · серия ' + snap.combo.streak + '</div></div>' +
      '<div class="wave67-inline"><span class="wave67-chip">Миссий дня: ' + snap.daily.filter(function(v){ return v.done; }).length + '/' + snap.daily.length + '</span><span class="wave67-chip">Достижений: ' + snap.unlockedCount + '/' + snap.totalCount + '</span></div>' +
      '</div>';
  }

  function renderIndexCard(){
    if (!root.document || root.document.getElementById('s-main')) return;
    var anchor = root.document.getElementById('wave66-index-wrap');
    if (!anchor) return;
    var holder = root.document.getElementById('wave67-index-wrap');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave67-index-wrap';
      holder.className = 'wave67-index-wrap';
      anchor.insertAdjacentElement('afterend', holder);
    }
    var snap = snapshot(loadState(), currentXpSummary());
    holder.innerHTML = '<div class="wave67-card">' +
      '<div class="wave67-row"><div class="wave67-title">Сегодняшний прогресс</div><div class="wave67-chip">' + snap.daily.filter(function(v){ return v.done; }).length + '/' + snap.daily.length + ' миссии</div></div>' +
      listHtml(snap.daily) +
      '<div class="wave67-inline"><span class="wave67-chip">Комбо: x' + snap.combo.multiplier + '</span><span class="wave67-chip">Ачивки: ' + snap.unlockedCount + '/' + snap.totalCount + '</span></div>' +
      '</div>';
  }

  function renderDashboardCard(){
    if (!root.document || !root.document.querySelector('.hero')) return;
    var anchor = root.document.getElementById('wave66-dashboard-wrap') || root.document.querySelector('.hero');
    var holder = root.document.getElementById('wave67-dashboard-wrap');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave67-dashboard-wrap';
      holder.className = 'wave67-dashboard-wrap';
      anchor.insertAdjacentElement('afterend', holder);
    }
    var snap = snapshot(loadState(), currentXpSummary());
    holder.innerHTML = '<div class="wave67-card">' +
      '<div class="wave67-row"><div class="wave67-title">Миссии и достижения</div><div class="wave67-chip">' + snap.secretUnlocked + '/' + snap.secretTotal + ' секретных</div></div>' +
      '<div class="wave67-stack">' + listHtml(snap.daily) + '</div>' +
      '<div class="wave67-title" style="margin-top:12px">Недельные челленджи</div>' + listHtml(snap.weekly) +
      '<div class="wave67-inline"><span class="wave67-chip">Лучшее комбо: ' + (loadState().bestCombo || 0) + '</span><span class="wave67-chip">Достижений: ' + snap.unlockedCount + '/' + snap.totalCount + '</span></div>' +
      '</div>';
  }

  function decorateHallOfFame(){
    if (!root.document) return;
    var overlays = Array.prototype.slice.call(root.document.querySelectorAll('body > div[style*="position:fixed"]'));
    if (!overlays.length) return;
    var overlay = overlays[overlays.length - 1];
    var card = overlay && overlay.firstElementChild;
    if (!card || card.querySelector('.wave67-profile-meta')) return;
    var snap = snapshot(loadState(), currentXpSummary());
    var section = root.document.createElement('div');
    section.className = 'wave67-profile-meta';
    section.style.margin = '0 0 14px';
    section.innerHTML = '<div class="wave67-title" style="color:#fff">Миссии и достижения</div>' +
      '<div class="wave67-card" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.12);color:#fff;box-shadow:none">' +
      '<div class="wave67-row"><div class="wave67-meta" style="color:#c7d2fe">Миссий дня: ' + snap.daily.filter(function(v){ return v.done; }).length + '/' + snap.daily.length + ' · недели: ' + snap.weekly.filter(function(v){ return v.done; }).length + '/' + snap.weekly.length + '</div><div class="wave67-chip" style="background:rgba(255,255,255,.12);color:#fff">' + snap.unlockedCount + '/' + snap.totalCount + '</div></div>' +
      listHtml(snap.daily) +
      '<div class="wave67-title" style="margin-top:12px;color:#fff">Недавние достижения</div>' +
      '<div class="wave67-ach-grid">' + recentAchievementsHtml(snap, 4, true) + '</div>' +
      '</div>';
    var xpSection = card.querySelector('.wave66-profile-xp');
    if (xpSection && xpSection.insertAdjacentElement) xpSection.insertAdjacentElement('afterend', section);
    else card.appendChild(section);
  }

  function refreshUi(){
    ensureStyle();
    renderGradeStrip();
    renderIndexCard();
    renderDashboardCard();
    decorateHallOfFame();
  }

  function processAnswerEvent(payload){
    var state = loadState();
    var result = reduceAnswer(state, payload, currentXpSummary());
    saveAndDispatch(result);
    if (!isNode && result.combo.bonus > 0 && payload.correct && !payload.withHint && root.wave66Xp && typeof root.wave66Xp.grantBonus === 'function') {
      var label = 'Комбо x' + result.combo.multiplier;
      root.wave66Xp.grantBonus(result.combo.bonus, label, { reason: 'combo', tag: payload.tag || '', source: 'grade', combo: result.combo.streak, multiplier: result.combo.multiplier });
    }
    handleOutcome(result);
    if (!isNode) setTimeout(refreshUi, 0);
    return result;
  }

  function processXpDelta(delta){
    var state = loadState();
    var result = reduceXp(state, { delta: delta }, currentXpSummary());
    saveAndDispatch(result);
    handleOutcome(result);
    if (!isNode) setTimeout(refreshUi, 0);
    return result;
  }

  function processDiagnostic(payload){
    var state = loadState();
    var result = reduceDiagnostic(state, payload || {}, currentXpSummary());
    saveAndDispatch(result);
    handleOutcome(result);
    if (!isNode) setTimeout(refreshUi, 0);
    return result;
  }

  function patchAns(){
    if (!root.ans || root.__wave67MetaAnsPatched) return;
    var original = root.ans;
    root.ans = function(index){
      var alreadySelected = false;
      try { alreadySelected = typeof sel !== 'undefined' && sel !== null; } catch (_) { alreadySelected = false; }
      if (alreadySelected) return original.apply(this, arguments);
      var selected = null;
      var isCorrect = false;
      var withHint = false;
      var tag = '';
      try {
        selected = prob && prob.options ? prob.options[index] : null;
        isCorrect = !!(prob && selected === prob.answer);
        withHint = !!usedHelp;
        tag = prob && prob.tag ? prob.tag : '';
      } catch (_) {}
      var out = original.apply(this, arguments);
      processAnswerEvent({ correct: isCorrect, withHint: withHint, tag: tag, now: Date.now() });
      return out;
    };
    root.__wave67MetaAnsPatched = true;
  }

  function patchHallOfFame(){
    if (!root.showHallOfFame || root.__wave67MetaHofPatched) return;
    var original = root.showHallOfFame;
    root.showHallOfFame = function(){
      var out = original.apply(this, arguments);
      setTimeout(decorateHallOfFame, 0);
      return out;
    };
    root.__wave67MetaHofPatched = true;
  }

  function patchPlayerBadge(){
    if (!root.renderPlayerBadge || root.__wave67MetaBadgePatched) return;
    var original = root.renderPlayerBadge;
    root.renderPlayerBadge = function(){
      var out = original.apply(this, arguments);
      setTimeout(renderGradeStrip, 0);
      return out;
    };
    root.__wave67MetaBadgePatched = true;
  }

  function patchBackup(){
    if (root.getBackupSnapshot && !root.__wave67MetaBackupGetPatched) {
      var originalGet = root.getBackupSnapshot;
      root.getBackupSnapshot = function(){
        var snap = originalGet.apply(this, arguments);
        try { snap.metaState = loadState(); } catch (_) {}
        return snap;
      };
      root.__wave67MetaBackupGetPatched = true;
    }
    if (root.applyBackupSnapshot && !root.__wave67MetaBackupApplyPatched) {
      var originalApply = root.applyBackupSnapshot;
      root.applyBackupSnapshot = function(payload){
        var out = originalApply.apply(this, arguments);
        try { if (payload && payload.metaState) saveState(Object.assign(defaultState(), payload.metaState)); } catch (_) {}
        dispatchUpdate({ state: loadState(), snapshot: snapshot(loadState(), currentXpSummary()) });
        setTimeout(refreshUi, 0);
        return out;
      };
      root.__wave67MetaBackupApplyPatched = true;
    }
  }

  function init(){
    if (isNode || !root.document) return;
    ensureStyle();
    patchAns();
    patchHallOfFame();
    patchPlayerBadge();
    patchBackup();
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', refreshUi, { once: true });
    else refreshUi();
    root.addEventListener('wave66-xp-updated', function(ev){
      var delta = ev && ev.detail ? Number(ev.detail.delta || 0) : 0;
      if (delta > 0) processXpDelta(delta);
      else setTimeout(refreshUi, 0);
    });
    root.addEventListener('wave25-diagnostic-saved', function(ev){
      var detail = ev && ev.detail ? ev.detail : null;
      if (!detail) return;
      processDiagnostic({ subjectId: detail.subjectId, totalQ: detail.totalQ, totalOk: detail.totalOk, now: Date.now() });
    });
    root.addEventListener('wave67-meta-updated', function(){ setTimeout(refreshUi, 0); });
    root.addEventListener('dashboard-state-ready', function(){ setTimeout(renderDashboardCard, 0); });
  }

  var api = {
    config: CONFIG,
    dailyDefs: DAILY_DEFS,
    weeklyDefs: WEEKLY_DEFS,
    achievementDefs: ACHIEVEMENTS,
    defaultState: defaultState,
    ensurePeriods: ensurePeriods,
    loadState: loadState,
    saveState: saveState,
    dayKey: dayKey,
    isoWeekKey: isoWeekKey,
    comboMultiplierForStreak: comboMultiplierForStreak,
    comboBonusForStreak: comboBonusForStreak,
    recordAnswer: recordAnswer,
    recordXp: recordXp,
    recordDiagnostic: recordDiagnostic,
    evaluateMissions: evaluateMissions,
    evaluateAchievements: evaluateAchievements,
    reduceAnswer: reduceAnswer,
    reduceXp: reduceXp,
    reduceDiagnostic: reduceDiagnostic,
    snapshot: snapshot,
    processAnswerEvent: processAnswerEvent,
    processXpDelta: processXpDelta,
    processDiagnostic: processDiagnostic,
    refreshUi: refreshUi,
    init: init,
    findAchievement: findAchievement
  };

  init();
  return api;
});

;/* ---- bundle_sharing.js ---- */
/* --- wave29_sharing.js --- */
(function(){
  if(window.wave29Debug) return;

  var VERSION = 'wave29';
  var REPORT_HASH_KEY = 'pr';
  var QR_CHUNK = 300;
  var QR_PROVIDER = 'https://api.qrserver.com/v1/create-qr-code/';
  var SHARED_FLAG = '__wave29SharedReport';
  var STYLE_ID = 'wave29-style';

  function toNum(v){ return Number(v || 0) || 0; }
  function pct(ok, total){ return total > 0 ? Math.round(ok / total * 100) : 0; }
  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function hasFn(fn){ return typeof fn === 'function'; }
  function safeJSON(key, fallback){ try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch(e){ return fallback; } }
  function gradeKey(){ try { return hasFn(window.currentGradeKey) ? currentGradeKey() : String(window.GRADE_NUM || '10'); } catch(e){ return String(window.GRADE_NUM || '10'); } }
  function gradeTitle(){ return window.GRADE_TITLE || (gradeKey() + ' класс'); }
  function nowTs(){ return Date.now(); }
  function formatDate(ts, opts){ try { return new Date(ts || nowTs()).toLocaleDateString('ru-RU', opts || { day:'numeric', month:'long', year:'numeric' }); } catch(e){ return ''; } }
  function formatShortDate(ts){ try { return new Date(ts || nowTs()).toLocaleDateString('ru-RU', { day:'numeric', month:'short' }).replace('.', ''); } catch(e){ return ''; } }
  function formatMonthLabel(isoMonth){
    try {
      var parts = String(isoMonth || '').split('-');
      var d = new Date(Number(parts[0] || 0), Math.max(0, Number(parts[1] || 1) - 1), 1);
      return d.toLocaleDateString('ru-RU', { month:'short' }).replace('.', '');
    } catch(e){ return String(isoMonth || ''); }
  }
  function decl(n, one, few, many){ return hasFn(window.declNum) ? declNum(n, one, few, many) : (Math.abs(n)%10 === 1 && Math.abs(n)%100 !== 11 ? one : ([2,3,4].indexOf(Math.abs(n)%10) !== -1 && [12,13,14].indexOf(Math.abs(n)%100) === -1 ? few : many)); }

  function isGradePage(){ return typeof window.GRADE_NUM !== 'undefined' && !!document.getElementById('s-main'); }
  function isDashboardPage(){ return !!document.getElementById('grades') && !!document.getElementById('activity'); }

  function readHashParam(key){
    try {
      var hash = String(location.hash || '').replace(/^#/, '');
      if(!hash) return '';
      var parts = hash.split('&');
      for(var i=0;i<parts.length;i++){
        var pair = parts[i].split('=');
        if(pair[0] === key) return pair.slice(1).join('=');
      }
    } catch(e){}
    return '';
  }

  function stripUrl(){
    try {
      return String(location.href || '').replace(/[?#].*$/, '');
    } catch(e){
      return '';
    }
  }

  function base64UrlEncode(value){
    var text = typeof value === 'string' ? value : JSON.stringify(value);
    try {
      return btoa(unescape(encodeURIComponent(text))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    } catch(e){
      return text;
    }
  }

  function base64UrlDecode(text){
    var raw = String(text || '').replace(/-/g,'+').replace(/_/g,'/');
    while(raw.length % 4) raw += '=';
    try {
      return decodeURIComponent(escape(atob(raw)));
    } catch(e){
      return raw;
    }
  }

  function hashText(text){
    var str = String(text || '');
    var h = 2166136261;
    for(var i=0;i<str.length;i++){
      h ^= str.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return (h >>> 0).toString(36);
  }

  function getLastDates(count){
    var out = [];
    var now = new Date();
    for(var i=count-1;i>=0;i--){
      var d = new Date(now);
      d.setHours(0,0,0,0);
      d.setDate(now.getDate() - i);
      out.push(d.toISOString().slice(0,10));
    }
    return out;
  }

  function collectActivityMap(){
    var map = {};
    var activity = Array.isArray(window.ACTIVITY) ? window.ACTIVITY : safeJSON('trainer_activity_' + gradeKey(), []);
    activity.forEach(function(row){
      if(!row || !row.date) return;
      map[row.date] = {
        total: toNum(row.total || (toNum(row.ok) + toNum(row.err))),
        ok: toNum(row.ok),
        err: toNum(row.err),
        pure: toNum(row.pure)
      };
    });
    var daily = (window.DAILY && window.DAILY.date) ? window.DAILY : safeJSON('trainer_daily_' + gradeKey(), null);
    if(daily && daily.date){
      map[daily.date] = {
        total: toNum(daily.ok) + toNum(daily.err),
        ok: toNum(daily.ok),
        err: toNum(daily.err),
        pure: toNum(daily.pure)
      };
    }
    return map;
  }

  function summarizeRecent(activityMap, days){
    var dates = getLastDates(days);
    var total = 0, ok = 0, err = 0, active = 0, pure = 0;
    dates.forEach(function(date){
      var row = activityMap[date] || { total:0, ok:0, err:0, pure:0 };
      total += toNum(row.total);
      ok += toNum(row.ok);
      err += toNum(row.err);
      pure += toNum(row.pure);
      if(toNum(row.total) > 0) active += 1;
    });
    return { total: total, ok: ok, err: err, active: active, pure: pure, pct: pct(ok, total) };
  }

  function weekBuckets(activityMap, weeks){
    var dates = getLastDates(weeks * 7);
    var buckets = [];
    for(var i=0;i<weeks;i++){
      var slice = dates.slice(i*7, i*7 + 7);
      var total = 0, ok = 0, err = 0, active = 0;
      slice.forEach(function(date){
        var row = activityMap[date] || { total:0, ok:0, err:0 };
        total += toNum(row.total);
        ok += toNum(row.ok);
        err += toNum(row.err);
        if(toNum(row.total) > 0) active += 1;
      });
      buckets.push({
        label: formatShortDate(slice[0]),
        total: total,
        ok: ok,
        err: err,
        active: active,
        pct: pct(ok, total)
      });
    }
    return buckets;
  }

  function monthBuckets(activityMap, months){
    var now = new Date();
    var list = [];
    for(var i=months-1;i>=0;i--){
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      var key = d.toISOString().slice(0,7);
      list.push({ key: key, label: formatMonthLabel(key), total: 0, ok: 0, err: 0, active: 0, pct: 0 });
    }
    Object.keys(activityMap || {}).forEach(function(date){
      var key = String(date || '').slice(0,7);
      for(var i=0;i<list.length;i++){
        if(list[i].key !== key) continue;
        var row = activityMap[date] || {};
        list[i].total += toNum(row.total);
        list[i].ok += toNum(row.ok);
        list[i].err += toNum(row.err);
        if(toNum(row.total) > 0) list[i].active += 1;
      }
    });
    list.forEach(function(row){ row.pct = pct(row.ok, row.total); });
    return list;
  }

  function collectReviewSummary(){
    var key = 'trainer_review_' + gradeKey();
    var review = safeJSON(key, { items:{} });
    if(!review || typeof review !== 'object' || !review.items) review = { items:{} };
    var items = Object.keys(review.items).map(function(k){ return review.items[k]; }).filter(Boolean);
    var due = 0, sticky = 0, mastered = 0;
    var ts = nowTs();
    items.forEach(function(item){
      if(toNum(item.dueAt) <= ts) due += 1;
      if(item.sticky) sticky += 1;
      if(!item.sticky && toNum(item.step) >= 3) mastered += 1;
    });
    return { total: items.length, due: due, sticky: sticky, mastered: mastered };
  }

  function collectSubjectRows(){
    var rows = [];
    var allWeak = [];
    (window.SUBJ || []).forEach(function(subj){
      if(!subj || subj.locked) return;
      var ok = 0, err = 0, started = 0, strong = 0, weak = 0, topics = [];
      (subj.tops || []).forEach(function(topic){
        var stat = hasFn(window.getTP) ? getTP(subj.id, topic.id) : { ok:0, err:0 };
        var tOk = toNum(stat.ok), tErr = toNum(stat.err), total = tOk + tErr;
        if(total > 0){
          var tPct = pct(tOk, total);
          started += 1;
          if(total >= 3 && tPct >= 80) strong += 1;
          if(total >= 3 && tPct < 60){ weak += 1; allWeak.push({ label: subj.nm + ' → ' + topic.nm, count: tErr || 1, pct: tPct, total: total }); }
          topics.push({ name: topic.nm, pct: tPct, total: total, err: tErr });
        }
        ok += tOk;
        err += tErr;
      });
      var total = ok + err;
      if(!total) return;
      rows.push({
        id: subj.id,
        ic: subj.ic,
        name: subj.nm,
        color: subj.cl || '#2563eb',
        bg: subj.bg || '#dbeafe',
        ok: ok,
        err: err,
        total: total,
        pct: pct(ok, total),
        started: started,
        strong: strong,
        weak: weak,
        topics: topics
      });
    });
    rows.sort(function(a,b){ return b.total - a.total || a.pct - b.pct || a.name.localeCompare(b.name, 'ru'); });
    allWeak.sort(function(a,b){ return b.count - a.count || a.pct - b.pct; });
    return { rows: rows, weakTopics: allWeak };
  }

  function collectJournalWeakTopics(){
    var rows = [];
    try {
      var journal = hasFn(window.loadJournal) ? loadJournal() : safeJSON('trainer_journal_' + gradeKey(), []);
      var grouped = {};
      (Array.isArray(journal) ? journal : []).forEach(function(item){
        var label = item && item.tag ? String(item.tag) : 'Без темы';
        if(!grouped[label]) grouped[label] = { label: label, count: 0 };
        grouped[label].count += 1;
      });
      rows = Object.keys(grouped).map(function(key){ return grouped[key]; }).sort(function(a,b){ return b.count - a.count || a.label.localeCompare(b.label, 'ru'); });
    } catch(e){}
    return rows;
  }

  function buildGradeSnapshot(){
    var subjectPack = collectSubjectRows();
    var subjects = subjectPack.rows;
    var activityMap = collectActivityMap();
    var review = collectReviewSummary();
    var recent7 = summarizeRecent(activityMap, 7);
    var recent30 = summarizeRecent(activityMap, 30);
    var weeks = weekBuckets(activityMap, 4);
    var months = monthBuckets(activityMap, 4);
    var totalQs = toNum(window.STR && STR.totalQs) || subjects.reduce(function(sum, row){ return sum + row.total; }, 0);
    var totalOk = toNum(window.STR && STR.totalOk) || subjects.reduce(function(sum, row){ return sum + row.ok; }, 0);
    var weakJournal = collectJournalWeakTopics();
    var weakFallback = subjectPack.weakTopics.map(function(row){ return { label: row.label, count: row.count, pct: row.pct }; });
    var weak = (weakJournal.length ? weakJournal : weakFallback).slice(0, 6);
    var daily = (window.DAILY && window.DAILY.date) ? window.DAILY : safeJSON('trainer_daily_' + gradeKey(), { date:'', ok:0, err:0, pure:0 });
    var status = hasFn(window.dailyDone) ? dailyDone() : null;
    return {
      version: 1,
      kind: 'grade-parent',
      grade: gradeKey(),
      gradeTitle: gradeTitle(),
      name: hasFn(window.getPlayerName) ? getPlayerName() : 'Ученик',
      generatedAt: nowTs(),
      totalQs: totalQs,
      totalPct: pct(totalOk, totalQs),
      currentStreak: toNum(window.STR && STR.current),
      bestStreak: toNum(window.STR && STR.best),
      doneDays: toNum(window.STR && STR.totalDone),
      today: { total: toNum(daily.ok) + toNum(daily.err), ok: toNum(daily.ok), err: toNum(daily.err), pure: toNum(daily.pure), status: status || '' },
      last7: recent7,
      last30: recent30,
      weeks: weeks,
      months: months,
      review: review,
      subjects: subjects.slice(0, 8),
      weak: weak
    };
  }

  function compactGradeSnapshot(snapshot){
    return {
      v: 1,
      k: 'g',
      g: snapshot.grade,
      gt: snapshot.gradeTitle,
      n: snapshot.name,
      ts: snapshot.generatedAt,
      q: snapshot.totalQs,
      p: snapshot.totalPct,
      cs: snapshot.currentStreak,
      bs: snapshot.bestStreak,
      dd: snapshot.doneDays,
      td: [snapshot.today.total, snapshot.today.ok, snapshot.today.err, snapshot.today.pure, snapshot.today.status || ''],
      d7: [snapshot.last7.total, snapshot.last7.active, snapshot.last7.pct, snapshot.last7.pure || 0],
      d30: [snapshot.last30.total, snapshot.last30.active, snapshot.last30.pct, snapshot.last30.pure || 0],
      w: (snapshot.weeks || []).map(function(row){ return [row.label, row.total, row.pct, row.active || 0]; }),
      m: (snapshot.months || []).map(function(row){ return [row.label, row.total, row.pct, row.active || 0]; }),
      r: [snapshot.review.total, snapshot.review.due, snapshot.review.sticky, snapshot.review.mastered],
      s: (snapshot.subjects || []).slice(0, 6).map(function(row){ return [row.ic, row.name, row.total, row.pct, row.weak, row.strong, row.started, row.color || '#2563eb']; }),
      wk: (snapshot.weak || []).slice(0, 6).map(function(row){ return [row.label, row.count, toNum(row.pct)]; })
    };
  }

  function normalizeGradeSnapshot(payload){
    if(!payload || payload.k !== 'g') throw new Error('Не тот формат отчёта');
    return {
      version: payload.v || 1,
      kind: 'grade-parent',
      grade: String(payload.g || ''),
      gradeTitle: payload.gt || '',
      name: payload.n || 'Ученик',
      generatedAt: toNum(payload.ts) || nowTs(),
      totalQs: toNum(payload.q),
      totalPct: toNum(payload.p),
      currentStreak: toNum(payload.cs),
      bestStreak: toNum(payload.bs),
      doneDays: toNum(payload.dd),
      today: { total: toNum((payload.td || [])[0]), ok: toNum((payload.td || [])[1]), err: toNum((payload.td || [])[2]), pure: toNum((payload.td || [])[3]), status: String((payload.td || [])[4] || '') },
      last7: { total: toNum((payload.d7 || [])[0]), active: toNum((payload.d7 || [])[1]), pct: toNum((payload.d7 || [])[2]), pure: toNum((payload.d7 || [])[3]) },
      last30: { total: toNum((payload.d30 || [])[0]), active: toNum((payload.d30 || [])[1]), pct: toNum((payload.d30 || [])[2]), pure: toNum((payload.d30 || [])[3]) },
      weeks: (payload.w || []).map(function(row){ return { label: row[0], total: toNum(row[1]), pct: toNum(row[2]), active: toNum(row[3]) }; }),
      months: (payload.m || []).map(function(row){ return { label: row[0], total: toNum(row[1]), pct: toNum(row[2]), active: toNum(row[3]) }; }),
      review: { total: toNum((payload.r || [])[0]), due: toNum((payload.r || [])[1]), sticky: toNum((payload.r || [])[2]), mastered: toNum((payload.r || [])[3]) },
      subjects: (payload.s || []).map(function(row){ return { ic: row[0], name: row[1], total: toNum(row[2]), pct: toNum(row[3]), weak: toNum(row[4]), strong: toNum(row[5]), started: toNum(row[6]), color: row[7] || '#2563eb' }; }),
      weak: (payload.wk || []).map(function(row){ return { label: row[0], count: toNum(row[1]), pct: toNum(row[2]) }; })
    };
  }

  function encodeGradeSnapshot(snapshot){ return base64UrlEncode(compactGradeSnapshot(snapshot)); }
  function decodeGradeSnapshot(text){ return normalizeGradeSnapshot(JSON.parse(base64UrlDecode(text))); }
  function buildReportLink(snapshot){ return stripUrl() + '#' + REPORT_HASH_KEY + '=' + encodeGradeSnapshot(snapshot); }
  function parseReportLink(url){
    var text = String(url || '');
    var match = text.match(new RegExp('#' + REPORT_HASH_KEY + '=([^&]+)'));
    return match ? decodeGradeSnapshot(match[1]) : null;
  }

  function buildGradeReportText(snapshot){
    var lines = [
      '📊 Отчёт для родителя — ' + snapshot.name,
      snapshot.gradeTitle + ' · ' + formatDate(snapshot.generatedAt),
      '━━━━━━━━━━━━━━━',
      '🔢 Всего задач: ' + snapshot.totalQs,
      '🎯 Средняя точность: ' + snapshot.totalPct + '%',
      '🔥 Текущая серия: ' + snapshot.currentStreak + ' ' + decl(snapshot.currentStreak, 'день', 'дня', 'дней'),
      '🏆 Лучший рекорд: ' + snapshot.bestStreak,
      '📆 Активных дней: ' + snapshot.doneDays,
      '🗓 За 7 дней: ' + snapshot.last7.total + ' задач · ' + snapshot.last7.active + ' активных дней · ' + snapshot.last7.pct + '%',
      '🗓 За 30 дней: ' + snapshot.last30.total + ' задач · ' + snapshot.last30.active + ' активных дней · ' + snapshot.last30.pct + '%'
    ];
    if(snapshot.review && snapshot.review.total){
      lines.push('🔁 Повторение: ' + snapshot.review.due + ' на сегодня · ' + snapshot.review.sticky + ' сложных · ' + snapshot.review.mastered + ' закреплено');
    }
    if(snapshot.subjects && snapshot.subjects.length){
      lines.push('━━━━━━━━━━━━━━━', 'По предметам:');
      snapshot.subjects.slice(0, 6).forEach(function(row){
        lines.push(row.ic + ' ' + row.name + ': ' + row.pct + '% · ' + row.total + ' задач');
      });
    }
    if(snapshot.weak && snapshot.weak.length){
      lines.push('━━━━━━━━━━━━━━━', 'Зоны роста:');
      snapshot.weak.slice(0, 5).forEach(function(row){
        lines.push('• ' + row.label + ': ' + row.count + ' ' + decl(row.count, 'ошибка', 'ошибки', 'ошибок') + (row.pct ? ' · ' + row.pct + '%' : ''));
      });
    }
    return lines.join('\n');
  }

  function appendTarget(){
    if(document.head && typeof document.head.appendChild === 'function') return document.head;
    if(document.body && typeof document.body.appendChild === 'function') return document.body;
    if(document.documentElement && typeof document.documentElement.appendChild === 'function') return document.documentElement;
    return null;
  }

  function ensureStyles(){
    if(document.getElementById && document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave29-overlay{position:fixed;inset:0;z-index:16000;background:rgba(0,0,0,.58);display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto}',
      '.wave29-overlay[hidden]{display:none!important}',
      '.wave29-card{background:var(--card,#fff);color:var(--text,#1a1a2e);border:1px solid var(--border,#e5e7eb);border-radius:22px;box-shadow:0 24px 44px rgba(0,0,0,.24);width:min(100%,760px);max-height:92vh;overflow:auto}',
      '.wave29-head{padding:20px 20px 14px;border-bottom:1px solid var(--border,#e5e7eb)}',
      '.wave29-kicker{font-size:11px;font-weight:700;color:var(--muted,#6b7280);text-transform:uppercase;letter-spacing:.06em}',
      '.wave29-title{font:800 20px/1.15 "Unbounded",system-ui,sans-serif;margin-top:6px}',
      '.wave29-sub{margin-top:8px;font-size:13px;line-height:1.45;color:var(--muted,#6b7280)}',
      '.wave29-body{padding:16px 20px 20px}',
      '.wave29-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}',
      '.wave29-metric{background:linear-gradient(180deg,var(--bg,#f5f3ee),var(--card,#fff));border:1px solid var(--border,#e5e7eb);border-radius:16px;padding:12px 10px;text-align:center}',
      '.wave29-metric .n{font:900 22px/1 "Unbounded",system-ui,sans-serif}',
      '.wave29-metric .l{margin-top:6px;font-size:10px;color:var(--muted,#6b7280);text-transform:uppercase;letter-spacing:.05em;font-weight:700}',
      '.wave29-section{margin-top:14px;background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:18px;padding:14px}',
      '.wave29-section h4{font:800 13px/1.2 "Unbounded",system-ui,sans-serif;margin-bottom:10px}',
      '.wave29-note{font-size:12px;line-height:1.5;color:var(--muted,#6b7280)}',
      '.wave29-pillrow{display:flex;flex-wrap:wrap;gap:6px}',
      '.wave29-pill{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:999px;background:var(--bg,#f5f3ee);border:1px solid var(--border,#e5e7eb);font-size:11px;color:var(--muted,#6b7280)}',
      '.wave29-bars{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;align-items:end}',
      '.wave29-bar{display:flex;flex-direction:column;gap:6px;align-items:center}',
      '.wave29-barbox{width:100%;height:88px;display:flex;align-items:flex-end}',
      '.wave29-barfill{width:100%;border-radius:10px 10px 6px 6px;background:var(--accent,#2563eb);min-height:8px}',
      '.wave29-barlbl{font-size:10px;color:var(--muted,#6b7280);text-align:center}',
      '.wave29-barval{font-size:10px;font-weight:700;color:var(--muted,#6b7280)}',
      '.wave29-subjects{display:grid;gap:8px}',
      '.wave29-subject{border:1px solid var(--border,#e5e7eb);border-radius:14px;padding:10px 12px;background:var(--bg,#f5f3ee)}',
      '.wave29-subject-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}',
      '.wave29-subject-name{font-size:13px;font-weight:800}',
      '.wave29-subject-meta{margin-top:4px;font-size:11px;color:var(--muted,#6b7280)}',
      '.wave29-subject-pct{font:800 16px/1 "JetBrains Mono",monospace}',
      '.wave29-track{height:8px;background:var(--border,#e5e7eb);border-radius:999px;overflow:hidden;margin-top:8px}',
      '.wave29-fill{height:100%;border-radius:999px}',
      '.wave29-weaklist{display:grid;gap:6px}',
      '.wave29-weak{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:9px 10px;border-radius:12px;background:var(--bg,#f5f3ee);border:1px solid var(--border,#e5e7eb)}',
      '.wave29-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}',
      '.wave29-btn{flex:1 1 calc(33.333% - 6px);min-width:150px;min-height:42px;border:none;border-radius:12px;padding:10px 12px;font:800 12px/1.2 "Golos Text",system-ui,sans-serif;cursor:pointer}',
      '.wave29-btn.dark{background:var(--text,#1a1a2e);color:var(--bg,#fff)}',
      '.wave29-btn.light{background:var(--bg,#f5f3ee);color:var(--text,#1a1a2e);border:1px solid var(--border,#e5e7eb)}',
      '.wave29-btn.accent{background:var(--accent,#2563eb);color:#fff}',
      '.wave29-close{position:absolute;top:12px;right:12px;width:36px;height:36px;border:none;border-radius:999px;background:rgba(255,255,255,.14);color:inherit;font-size:18px;cursor:pointer}',
      '.wave29-card-wrap{position:relative}',
      '.wave29-qr-wrap{display:grid;grid-template-columns:260px 1fr;gap:14px;align-items:start}',
      '.wave29-qr-box{background:#fff;border:1px solid var(--border,#e5e7eb);border-radius:18px;padding:12px;display:flex;align-items:center;justify-content:center;min-height:284px}',
      '.wave29-qr-box img{display:block;width:100%;max-width:240px;height:auto;image-rendering:pixelated}',
      '.wave29-qr-meta{font-size:12px;line-height:1.55;color:var(--muted,#6b7280)}',
      '.wave29-code{width:100%;min-height:112px;padding:10px;border:1px solid var(--border,#e5e7eb);border-radius:12px;background:var(--bg,#f5f3ee);color:var(--text,#1a1a2e);font:600 11px/1.45 "JetBrains Mono",monospace;resize:vertical}',
      '.wave29-scan{display:grid;gap:10px}',
      '.wave29-video{width:100%;aspect-ratio:3/4;background:#000;border-radius:16px;border:1px solid var(--border,#e5e7eb);object-fit:cover}',
      '.wave29-scan-status{font-size:12px;line-height:1.5;color:var(--muted,#6b7280)}',
      '.wave29-banner{margin-top:12px;padding:10px 12px;border-radius:14px;background:var(--abg,#eef2ff);color:var(--accent,#2563eb);font-size:12px;line-height:1.5;font-weight:600}',
      '.wave29-dash-summary{margin-bottom:14px}',
      '.wave29-mini-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
      '.wave29-mini-card{background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:16px;padding:12px}',
      '.wave29-mini-card .k{font-size:10px;color:var(--muted,#6b7280);text-transform:uppercase;font-weight:700;letter-spacing:.05em}',
      '.wave29-mini-card .v{margin-top:6px;font:900 20px/1 "Unbounded",system-ui,sans-serif}',
      '.wave29-mini-card .s{margin-top:6px;font-size:11px;color:var(--muted,#6b7280);line-height:1.45}',
      '.wave29-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
      '.wave29-badge{display:inline-flex;align-items:center;padding:5px 8px;border-radius:999px;background:var(--bg,#f5f3ee);border:1px solid var(--border,#e5e7eb);font-size:10px;color:var(--muted,#6b7280)}',
      '.wave29-empty{padding:18px 10px;text-align:center;color:var(--muted,#6b7280);font-size:12px}',
      '@media (max-width:720px){.wave29-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.wave29-qr-wrap{grid-template-columns:1fr}.wave29-btn{flex:1 1 calc(50% - 4px)}}',
      '@media (max-width:520px){.wave29-bars{grid-template-columns:repeat(2,minmax(0,1fr))}.wave29-mini-grid{grid-template-columns:1fr}.wave29-btn{flex:1 1 100%}}',
      '@media print{body.wave29-print-mode > *:not(.wave29-print-host){display:none!important}body.wave29-print-mode{background:#fff!important;color:#111!important}body.wave29-print-mode .wave29-print-host{position:static!important;inset:auto!important;background:#fff!important;padding:0!important;display:block!important;overflow:visible!important}body.wave29-print-mode .wave29-card{box-shadow:none!important;border:none!important;border-radius:0!important;width:100%!important;max-height:none!important}body.wave29-print-mode .wave29-no-print{display:none!important}}'
    ].join('');
    var target = appendTarget();
    if(target) target.appendChild(style);
  }
  ensureStyles();

  function overlayCard(title, subtitle){
    var overlay = document.createElement('div');
    overlay.className = 'wave29-overlay wave29-print-host';
    overlay.addEventListener('click', function(){ overlay.remove(); });
    var wrap = document.createElement('div');
    wrap.className = 'wave29-card wave29-card-wrap';
    wrap.addEventListener('click', function(ev){ ev.stopPropagation(); });
    if(title || subtitle){
      var head = document.createElement('div');
      head.className = 'wave29-head';
      head.innerHTML = '<div class="wave29-kicker">Wave 29</div><div class="wave29-title">' + esc(title || '') + '</div>' + (subtitle ? '<div class="wave29-sub">' + esc(subtitle) + '</div>' : '');
      wrap.appendChild(head);
    }
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'wave29-close wave29-no-print';
    close.innerHTML = '×';
    close.addEventListener('click', function(){ overlay.remove(); });
    wrap.appendChild(close);
    overlay.appendChild(wrap);
    document.body.appendChild(overlay);
    return { overlay: overlay, card: wrap };
  }

  function colorForPct(value){
    return value >= 80 ? 'var(--green,#16a34a)' : value >= 60 ? 'var(--orange,#ea580c)' : 'var(--red,#dc2626)';
  }

  function subjectBar(row){
    var fill = clamp(row.pct || 0, 0, 100);
    var color = row.color || colorForPct(fill);
    return '<div class="wave29-subject">' +
      '<div class="wave29-subject-head"><div><div class="wave29-subject-name">' + esc((row.ic ? row.ic + ' ' : '') + row.name) + '</div><div class="wave29-subject-meta">' + row.total + ' задач · ' + row.started + ' тем · сильных ' + row.strong + ' · зон роста ' + row.weak + '</div></div><div class="wave29-subject-pct" style="color:' + esc(color) + '">' + row.pct + '%</div></div>' +
      '<div class="wave29-track"><div class="wave29-fill" style="width:' + fill + '%;background:' + esc(color) + '"></div></div>' +
    '</div>';
  }

  function weekBars(rows){
    var max = Math.max(1, (rows || []).reduce(function(m, row){ return Math.max(m, toNum(row.total)); }, 0));
    if(!(rows || []).length) return '<div class="wave29-empty">Пока мало данных</div>';
    return '<div class="wave29-bars">' + rows.map(function(row){
      var height = row.total ? Math.max(10, Math.round(row.total / max * 88)) : 8;
      return '<div class="wave29-bar"><div class="wave29-barval">' + row.total + '</div><div class="wave29-barbox"><div class="wave29-barfill" style="height:' + height + 'px;background:' + colorForPct(row.pct) + '"></div></div><div class="wave29-barlbl">' + esc(row.label) + '<br>' + row.pct + '%</div></div>';
    }).join('') + '</div>';
  }

  function buildParentPngCanvas(snapshot){
    var canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1500;
    var ctx = canvas.getContext('2d');
    if(!ctx) return canvas;

    function rr(x, y, w, h, r){
      var rr = Math.min(r, w/2, h/2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }
    function card(x, y, w, h, label, value, sub){
      ctx.fillStyle = '#ffffff'; rr(x,y,w,h,24); ctx.fill();
      ctx.fillStyle = '#6b7280'; ctx.font = '700 24px sans-serif'; ctx.fillText(label, x+22, y+34);
      ctx.fillStyle = '#111827'; ctx.font = '900 52px sans-serif'; ctx.fillText(String(value), x+22, y+92);
      ctx.fillStyle = '#4b5563'; ctx.font = '500 20px sans-serif'; ctx.fillText(sub, x+22, y+126);
    }

    ctx.fillStyle = '#f5f3ee';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '900 54px sans-serif';
    ctx.fillText('Отчёт для родителя', 64, 82);
    ctx.font = '700 26px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText((snapshot.name || 'Ученик') + ' · ' + (snapshot.gradeTitle || ''), 64, 120);
    ctx.fillText(formatDate(snapshot.generatedAt), 840, 82);

    card(64, 156, 250, 148, 'Задач', snapshot.totalQs, 'за всё время');
    card(330, 156, 250, 148, 'Точность', snapshot.totalPct + '%', 'средний результат');
    card(596, 156, 250, 148, 'Серия', snapshot.currentStreak, 'текущая серия');
    card(862, 156, 274, 148, '30 дней', snapshot.last30.total, snapshot.last30.active + ' активных дней');

    ctx.fillStyle = '#1a1a2e';
    ctx.font = '800 32px sans-serif';
    ctx.fillText('Неделя и месяц', 64, 366);
    ctx.fillStyle = '#4b5563';
    ctx.font = '500 24px sans-serif';
    ctx.fillText('7 дней: ' + snapshot.last7.total + ' задач · ' + snapshot.last7.pct + '% · ' + snapshot.last7.active + ' активных дней', 64, 408);
    ctx.fillText('30 дней: ' + snapshot.last30.total + ' задач · ' + snapshot.last30.pct + '% · ' + snapshot.last30.active + ' активных дней', 64, 442);

    ctx.fillStyle = '#1a1a2e';
    ctx.font = '800 32px sans-serif';
    ctx.fillText('Предметы', 64, 514);
    (snapshot.subjects || []).slice(0, 6).forEach(function(row, idx){
      var y = 560 + idx * 118;
      ctx.fillStyle = '#ffffff'; rr(64, y, 1072, 86, 20); ctx.fill();
      ctx.fillStyle = row.color || '#2563eb'; rr(64, y, 12, 86, 8); ctx.fill();
      ctx.fillStyle = '#111827'; ctx.font = '800 28px sans-serif'; ctx.fillText((row.ic || '') + ' ' + row.name, 96, y + 32);
      ctx.fillStyle = '#6b7280'; ctx.font = '500 20px sans-serif'; ctx.fillText(row.total + ' задач · тем ' + row.started + ' · зон роста ' + row.weak, 96, y + 62);
      ctx.fillStyle = row.color || '#2563eb'; ctx.font = '900 36px sans-serif'; ctx.fillText(row.pct + '%', 1000, y + 52);
      ctx.fillStyle = '#e5e7eb'; rr(726, y + 58, 250, 10, 5); ctx.fill();
      ctx.fillStyle = row.color || '#2563eb'; rr(726, y + 58, Math.max(12, Math.round(250 * clamp(row.pct, 0, 100) / 100)), 10, 5); ctx.fill();
    });

    ctx.fillStyle = '#1a1a2e';
    ctx.font = '800 32px sans-serif';
    ctx.fillText('Зоны роста', 64, 1300);
    ctx.fillStyle = '#4b5563';
    ctx.font = '600 22px sans-serif';
    (snapshot.weak || []).slice(0, 5).forEach(function(row, idx){
      ctx.fillText('• ' + row.label + ' — ' + row.count + ' ош.' + (row.pct ? ' · ' + row.pct + '%' : ''), 64, 1344 + idx * 32);
    });

    ctx.fillStyle = '#6b7280';
    ctx.font = '500 22px sans-serif';
    ctx.fillText('Сформировано в тренажёре · wave 29', 64, 1452);
    return canvas;
  }

  function downloadBlob(filename, blob){
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 600);
  }

  function downloadParentPng(snapshot){
    var canvas = buildParentPngCanvas(snapshot);
    if(!canvas || !canvas.toBlob) return;
    canvas.toBlob(function(blob){
      if(!blob) return;
      var stamp = new Date(snapshot.generatedAt || nowTs()).toISOString().slice(0,10);
      downloadBlob('parent_report_grade' + (snapshot.grade || 'x') + '_' + stamp + '.png', blob);
    }, 'image/png');
  }

  function printParentReport(overlay){
    var cleanup = function(){ document.body.classList.remove('wave29-print-mode'); try { window.removeEventListener('afterprint', cleanup); } catch(e){} };
    document.body.classList.add('wave29-print-mode');
    try { window.addEventListener('afterprint', cleanup); } catch(e){}
    try { window.print(); } catch(e){ cleanup(); }
    setTimeout(cleanup, 1600);
  }

  function renderParentReport(snapshot, opts){
    opts = opts || {};
    var ui = overlayCard('📊 Отчёт для родителя', snapshot.gradeTitle + ' · ' + snapshot.name + ' · ' + formatDate(snapshot.generatedAt));
    var banner = opts.shared ? '<div class="wave29-banner">Это ссылка-отчёт со снимком прогресса. Она только показывает состояние на момент создания и не меняет данные на устройстве.</div>' : '';
    var body = document.createElement('div');
    body.className = 'wave29-body';
    body.innerHTML =
      banner +
      '<div class="wave29-grid">' +
        '<div class="wave29-metric"><div class="n">' + snapshot.totalQs + '</div><div class="l">задач</div></div>' +
        '<div class="wave29-metric"><div class="n">' + snapshot.totalPct + '%</div><div class="l">точность</div></div>' +
        '<div class="wave29-metric"><div class="n">🔥' + snapshot.currentStreak + '</div><div class="l">текущая серия</div></div>' +
        '<div class="wave29-metric"><div class="n">' + snapshot.doneDays + '</div><div class="l">активных дней</div></div>' +
      '</div>' +
      '<div class="wave29-section"><h4>🗓 Неделя и месяц</h4><div class="wave29-mini-grid"><div class="wave29-mini-card"><div class="k">7 дней</div><div class="v">' + snapshot.last7.total + '</div><div class="s">' + snapshot.last7.active + ' активных дней · ' + snapshot.last7.pct + '% точность</div></div><div class="wave29-mini-card"><div class="k">30 дней</div><div class="v">' + snapshot.last30.total + '</div><div class="s">' + snapshot.last30.active + ' активных дней · ' + snapshot.last30.pct + '% точность</div></div></div><div class="wave29-note" style="margin-top:10px">Сегодня: ' + snapshot.today.total + ' задач' + (snapshot.today.status ? ' · статус: ' + esc(snapshot.today.status) : '') + (snapshot.today.pure ? ' · без подсказок: ' + snapshot.today.pure : '') + '</div></div>' +
      '<div class="wave29-section"><h4>📈 По неделям</h4>' + weekBars(snapshot.weeks || []) + '</div>' +
      '<div class="wave29-section"><h4>🗓 По месяцам</h4><div class="wave29-pillrow">' + (snapshot.months || []).map(function(row){ return '<span class="wave29-pill">' + esc(row.label) + ' · ' + row.total + ' задач · ' + row.pct + '%</span>'; }).join('') + '</div></div>' +
      '<div class="wave29-section"><h4>🔁 Повторение ошибок</h4><div class="wave29-pillrow"><span class="wave29-pill">в журнале: ' + snapshot.review.total + '</span><span class="wave29-pill">на сегодня: ' + snapshot.review.due + '</span><span class="wave29-pill">сложные: ' + snapshot.review.sticky + '</span><span class="wave29-pill">закреплены: ' + snapshot.review.mastered + '</span></div></div>' +
      '<div class="wave29-section"><h4>📚 Предметы</h4><div class="wave29-subjects">' + ((snapshot.subjects || []).length ? snapshot.subjects.map(subjectBar).join('') : '<div class="wave29-empty">Пока мало данных по предметам</div>') + '</div></div>' +
      '<div class="wave29-section"><h4>🎯 Зоны роста</h4><div class="wave29-weaklist">' + ((snapshot.weak || []).length ? snapshot.weak.map(function(row){ return '<div class="wave29-weak"><div><b>' + esc(row.label) + '</b>' + (row.pct ? '<div class="wave29-note">точность: ' + row.pct + '%</div>' : '') + '</div><div style="font-weight:900;color:' + colorForPct(row.pct || 0) + '">' + row.count + ' ' + decl(row.count, 'ошибка', 'ошибки', 'ошибок') + '</div></div>'; }).join('') : '<div class="wave29-empty">Ошибок пока нет — отлично!</div>') + '</div></div>';

    var actions = document.createElement('div');
    actions.className = 'wave29-actions wave29-no-print';
    var link = buildReportLink(snapshot);
    window.__wave29LastReportLink = link;
    window.__wave29LastReportText = buildGradeReportText(snapshot);
    actions.innerHTML =
      '<button type="button" class="wave29-btn accent" id="wave29-report-share">💬 Отправить</button>' +
      '<button type="button" class="wave29-btn light" id="wave29-report-link">🔗 Ссылка</button>' +
      '<button type="button" class="wave29-btn light" id="wave29-report-qr">📱 QR</button>' +
      '<button type="button" class="wave29-btn light" id="wave29-report-png">🖼 PNG</button>' +
      '<button type="button" class="wave29-btn dark" id="wave29-report-print">🖨 Печать</button>' +
      '<button type="button" class="wave29-btn light" id="wave29-report-close">Закрыть</button>';

    body.appendChild(actions);
    ui.card.appendChild(body);

    body.querySelector('#wave29-report-share').addEventListener('click', function(){
      if(hasFn(window.doShare)) doShare('Отчёт для родителя', window.__wave29LastReportText);
      else if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(window.__wave29LastReportText);
    });
    body.querySelector('#wave29-report-link').addEventListener('click', function(){ copyText(link, '✅ Ссылка на отчёт скопирована'); });
    body.querySelector('#wave29-report-qr').addEventListener('click', function(){ showQrPackage(link, 'QR-ссылка на отчёт', 'Открой ссылку на другом устройстве или отсканируй её телефоном.', 'report'); });
    body.querySelector('#wave29-report-png').addEventListener('click', function(){ downloadParentPng(snapshot); });
    body.querySelector('#wave29-report-print').addEventListener('click', function(){ printParentReport(ui.overlay); });
    body.querySelector('#wave29-report-close').addEventListener('click', function(){ ui.overlay.remove(); });
    return ui.overlay;
  }

  function copyText(text, success){
    try {
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(String(text || '')).then(function(){ if(success) alert(success); }).catch(function(){ hasFn(window.showShareText) ? showShareText(String(text || '')) : alert(String(text || '')); });
        return;
      }
    } catch(e){}
    if(hasFn(window.showShareText)) showShareText(String(text || '')); else alert(String(text || ''));
  }

  function qrImageSrc(text, size){
    var n = size || 256;
    return QR_PROVIDER + '?size=' + n + 'x' + n + '&margin=0&data=' + encodeURIComponent(String(text || ''));
  }

  function buildQrFrames(text, kind){
    var src = String(text || '');
    if(!src) return [];
    if(src.length <= QR_CHUNK) return [src];
    var parts = [];
    for(var i=0;i<src.length;i+=QR_CHUNK) parts.push(src.slice(i, i + QR_CHUNK));
    var sig = hashText(src);
    return parts.map(function(chunk, idx){ return 'W29|' + (kind || 'data') + '|' + sig + '|' + (idx + 1) + '|' + parts.length + '|' + chunk; });
  }

  function parseQrFrame(text){
    var src = String(text || '');
    if(src.indexOf('W29|') !== 0) return null;
    var parts = src.split('|');
    if(parts.length < 6) return null;
    return { kind: parts[1], sig: parts[2], index: toNum(parts[3]), total: toNum(parts[4]), chunk: parts.slice(5).join('|') };
  }

  function showQrPackage(text, title, subtitle, kind){
    var frames = buildQrFrames(text, kind || 'data');
    var state = { index: 0, frames: frames, timer: null, playing: frames.length > 1 };
    window.__wave29LastQrFrames = frames.slice();
    var ui = overlayCard(title, subtitle + (frames.length > 1 ? ' Пакет разбит на ' + frames.length + ' QR-кадров.' : ''));
    var body = document.createElement('div');
    body.className = 'wave29-body';
    body.innerHTML =
      '<div class="wave29-qr-wrap"><div class="wave29-qr-box"><img id="wave29-qr-img" alt="QR"></div><div class="wave29-qr-meta"><div id="wave29-qr-counter" style="font-weight:800;margin-bottom:8px"></div><div>Если код длинный, покажи кадры по очереди и отсканируй их с другого устройства. Импорт соберёт пакет автоматически.</div><div class="wave29-actions wave29-no-print" style="margin-top:14px"><button type="button" class="wave29-btn light" id="wave29-qr-prev">◀ Назад</button><button type="button" class="wave29-btn light" id="wave29-qr-play">⏯ Пауза</button><button type="button" class="wave29-btn light" id="wave29-qr-next">Вперёд ▶</button><button type="button" class="wave29-btn dark" id="wave29-qr-copy">📋 Скопировать текст</button></div><textarea class="wave29-code wave29-no-print" id="wave29-qr-code" readonly style="margin-top:10px"></textarea></div></div>';
    ui.card.appendChild(body);
    var img = body.querySelector('#wave29-qr-img');
    var counter = body.querySelector('#wave29-qr-counter');
    var textarea = body.querySelector('#wave29-qr-code');
    var playBtn = body.querySelector('#wave29-qr-play');
    function render(){
      var frame = state.frames[state.index] || '';
      img.src = qrImageSrc(frame, 256);
      textarea.value = frame;
      counter.textContent = state.frames.length > 1 ? ('Кадр ' + (state.index + 1) + ' из ' + state.frames.length) : 'Один QR-код';
      playBtn.textContent = state.playing ? '⏸ Пауза' : '▶ Авто';
    }
    img.addEventListener('error', function(){
      counter.textContent = counter.textContent + ' · QR-изображение не загрузилось, используй текст кадра ниже';
    });
    function stop(){ if(state.timer){ clearInterval(state.timer); state.timer = null; } }
    function maybePlay(){
      stop();
      if(!state.playing || state.frames.length <= 1) return;
      state.timer = setInterval(function(){ state.index = (state.index + 1) % state.frames.length; render(); }, 1200);
    }
    body.querySelector('#wave29-qr-prev').addEventListener('click', function(){ state.index = (state.index - 1 + state.frames.length) % state.frames.length; render(); });
    body.querySelector('#wave29-qr-next').addEventListener('click', function(){ state.index = (state.index + 1) % state.frames.length; render(); });
    body.querySelector('#wave29-qr-play').addEventListener('click', function(){ state.playing = !state.playing; maybePlay(); render(); });
    body.querySelector('#wave29-qr-copy').addEventListener('click', function(){ copyText(text, '✅ Текст QR-пакета скопирован'); });
    ui.overlay.addEventListener('remove', stop);
    ui.overlay.addEventListener('DOMNodeRemoved', stop);
    render(); maybePlay();
    return ui.overlay;
  }

  function canScanQr(){
    try { return !!(window.BarcodeDetector && navigator.mediaDevices && navigator.mediaDevices.getUserMedia); } catch(e){ return false; }
  }

  function stopStream(video){
    try {
      var stream = video && video.srcObject;
      if(stream && stream.getTracks) stream.getTracks().forEach(function(track){ try { track.stop(); } catch(e){} });
      if(video) video.srcObject = null;
    } catch(e){}
  }

  function showQrScanner(opts){
    opts = opts || {};
    var onResult = opts.onResult || function(){};
    var session = null;
    var ui = overlayCard(opts.title || '📷 Сканировать QR', opts.subtitle || 'Наведи камеру на QR-код или выбери изображение.');
    var body = document.createElement('div');
    body.className = 'wave29-body';
    body.innerHTML = '<div class="wave29-scan"><video class="wave29-video" id="wave29-scan-video" autoplay playsinline muted></video><div class="wave29-scan-status" id="wave29-scan-status">Запрашиваю доступ к камере…</div><div class="wave29-actions wave29-no-print"><label class="wave29-btn light" style="display:inline-flex;align-items:center;justify-content:center;cursor:pointer">🖼 Фото QR<input type="file" accept="image/*" id="wave29-scan-file" style="display:none"></label><button type="button" class="wave29-btn dark" id="wave29-scan-close">Закрыть</button></div></div>';
    ui.card.appendChild(body);
    var video = body.querySelector('#wave29-scan-video');
    var status = body.querySelector('#wave29-scan-status');
    var fileInput = body.querySelector('#wave29-scan-file');
    var detector = null;
    var timer = null;
    var closed = false;

    function setStatus(text){ status.textContent = text; }
    function cleanup(){ closed = true; if(timer) clearTimeout(timer); stopStream(video); ui.overlay.remove(); }
    body.querySelector('#wave29-scan-close').addEventListener('click', cleanup);
    ui.overlay.addEventListener('click', function(){ closed = true; if(timer) clearTimeout(timer); stopStream(video); });

    function acceptText(text){
      var frame = parseQrFrame(text);
      if(frame){
        if(!session || session.sig !== frame.sig){ session = { sig: frame.sig, total: frame.total, chunks: {}, kind: frame.kind }; }
        session.chunks[frame.index] = frame.chunk;
        var got = Object.keys(session.chunks).length;
        setStatus('Собираю QR-пакет: ' + got + ' из ' + session.total + ' кадров');
        if(got >= session.total){
          var full = '';
          for(var i=1;i<=session.total;i++) full += session.chunks[i] || '';
          cleanup();
          onResult(full, session.kind || 'data');
        }
        return;
      }
      cleanup();
      onResult(text, 'raw');
    }

    async function detectFromSource(source){
      if(!detector) detector = new BarcodeDetector({ formats:['qr_code'] });
      var found = await detector.detect(source);
      if(found && found.length && found[0].rawValue){ acceptText(found[0].rawValue); return true; }
      return false;
    }

    async function loop(){
      if(closed) return;
      try {
        var ok = await detectFromSource(video);
        if(ok) return;
      } catch(e){}
      timer = setTimeout(loop, 240);
    }

    fileInput.addEventListener('change', async function(){
      var file = fileInput.files && fileInput.files[0];
      if(!file) return;
      if(!window.BarcodeDetector){ setStatus('В этом браузере нет BarcodeDetector. Используй код или .json файл.'); return; }
      try {
        setStatus('Пробую прочитать QR с изображения…');
        var bitmap = await createImageBitmap(file);
        var ok = await detectFromSource(bitmap);
        if(!ok) setStatus('На изображении не найден QR-код.');
      } catch(e){
        setStatus('Не удалось прочитать изображение.');
      } finally {
        fileInput.value = '';
      }
    });

    if(!canScanQr()){
      setStatus('В этом браузере нет встроенного сканера QR. Для импорта используй код переноса или .json файл.');
      return ui.overlay;
    }

    (async function(){
      try {
        detector = new BarcodeDetector({ formats:['qr_code'] });
        var stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        video.srcObject = stream;
        try { await video.play(); } catch(e){}
        setStatus('Наведи камеру на QR-код. Для длинного пакета сканируй кадры по очереди.');
        loop();
      } catch(e){
        setStatus('Не удалось открыть камеру. Разреши доступ или используй импорт по коду / файлу.');
      }
    })();

    return ui.overlay;
  }

  function handleBackupQrText(text){
    try {
      if(/^https?:/i.test(String(text || ''))){
        alert('Это ссылка, а не backup-код. Для отчёта открой ссылку в браузере.');
        return;
      }
      importBackupFromText(String(text || ''), document.querySelector('.wave29-overlay'));
    } catch(e){
      alert('⚠️ Не удалось импортировать QR-пакет');
    }
  }

  function renderBackupModal(mode){
    var isImport = mode === 'import';
    var code = hasFn(window.encodeTransferPayload) && hasFn(window.getBackupSnapshot) ? encodeTransferPayload(getBackupSnapshot()) : '';
    var ui = overlayCard(isImport ? '📦 Восстановить копию' : '💾 Резервная копия', isImport ? 'Импорт по коду, JSON-файлу или QR-пакету.' : 'Экспорт текущего класса без облака: код, JSON и QR-пакет.');
    var body = document.createElement('div');
    body.className = 'wave29-body';
    var qrCount = buildQrFrames(code, 'backup').length;
    body.innerHTML =
      (!isImport ? '<div class="wave29-section"><h4>Экспорт</h4><textarea readonly class="wave29-code" id="wave29-backup-export">' + esc(code) + '</textarea><div class="wave29-note" style="margin-top:8px">Код переноса можно вставить в другой класс того же номера. Если код длинный, QR будет разбит на ' + qrCount + ' кадров.</div><div class="wave29-actions wave29-no-print"><button type="button" class="wave29-btn light" id="wave29-backup-copy">📋 Скопировать код</button><button type="button" class="wave29-btn light" id="wave29-backup-file">⬇️ Скачать .json</button><button type="button" class="wave29-btn accent" id="wave29-backup-qr-btn">📱 QR-экспорт</button></div></div>' : '') +
      '<div class="wave29-section"><h4>Импорт</h4><textarea class="wave29-code" id="wave29-backup-import" placeholder="Вставь сюда код переноса"></textarea><div class="wave29-actions wave29-no-print"><button type="button" class="wave29-btn accent" id="wave29-backup-restore">📥 Восстановить</button><label class="wave29-btn light" style="display:inline-flex;align-items:center;justify-content:center;cursor:pointer">📂 Выбрать файл<input type="file" accept=".json,application/json,text/plain" id="wave29-backup-file-input" style="display:none"></label><button type="button" class="wave29-btn light" id="wave29-backup-scan">📷 Сканировать QR</button></div><div class="wave29-note" style="margin-top:8px">В импорт входят прогресс, серия, активность, даты, журнал ошибок, интервальное повторение, фильтр микса и локальные рекорды текущего класса.</div></div>';
    ui.card.appendChild(body);

    var input = body.querySelector('#wave29-backup-import');
    var fileInput = body.querySelector('#wave29-backup-file-input');
    var btnRestore = body.querySelector('#wave29-backup-restore');
    btnRestore.addEventListener('click', function(){ importBackupFromText(input.value, ui.overlay); });
    fileInput.addEventListener('change', function(){ importBackupFromFileInput(fileInput, ui.overlay); });
    body.querySelector('#wave29-backup-scan').addEventListener('click', function(){ showQrScanner({ title:'📷 Импорт backup по QR', subtitle:'Сканируй QR-код или весь QR-пакет по кадрам.', onResult: handleBackupQrText }); });

    if(!isImport){
      body.querySelector('#wave29-backup-copy').addEventListener('click', function(){ copyText(code, '✅ Код переноса скопирован'); });
      body.querySelector('#wave29-backup-file').addEventListener('click', function(){ downloadBackupFile(); });
      body.querySelector('#wave29-backup-qr-btn').addEventListener('click', function(){ showQrPackage(code, '📱 QR-экспорт backup', 'Покажи QR на одном устройстве и импортируй на другом через сканер.', 'backup'); });
    }
    return ui.overlay;
  }

  function installGradeOverrides(){
    var oldGenerate = window.generateReport;
    window.generateReport = function(){
      var snap = buildGradeSnapshot();
      window.__wave29LastSnapshot = snap;
      return renderParentReport(snap, { shared:false });
    };

    window.shareReport = function(){
      var snap = buildGradeSnapshot();
      window.__wave29LastSnapshot = snap;
      if(hasFn(window.doShare)) doShare('Отчёт для родителя', buildGradeReportText(snap));
      else copyText(buildGradeReportText(snap));
    };

    window.showBackupModal = function(mode){ return renderBackupModal(mode); };
    window.openParentReport = window.generateReport;
    window.__wave29OldGenerateReport = oldGenerate;
  }

  function parseSharedGradeFromHash(){
    var encoded = readHashParam(REPORT_HASH_KEY);
    if(!encoded) return null;
    try { return decodeGradeSnapshot(encoded); } catch(e){ return null; }
  }

  function installSharedMode(){
    var shared = parseSharedGradeFromHash();
    if(!shared || !isGradePage()) return null;
    window[SHARED_FLAG] = shared;
    window.pickName = function(){};
    window.showWelcome = function(){};
    setTimeout(function(){
      try { renderParentReport(shared, { shared:true }); } catch(e){}
    }, 80);
    return shared;
  }

  function dashboardSummaryHtml(state){
    var data = state && state.analytics ? state.analytics : null;
    if(!data || !data.weeks || !data.months) return '';
    var weeks = data.weeks.slice(-2);
    var months = data.months.slice(-3);
    return '<div class="wave29-dash-summary">' +
      '<div class="section">Weekly / monthly summary</div>' +
      '<div class="wave29-mini-grid">' + weeks.map(function(row, idx){ return '<div class="wave29-mini-card"><div class="k">' + (idx === weeks.length - 1 ? 'Эта неделя' : 'Прошлая неделя') + '</div><div class="v">' + row.total + '</div><div class="s">' + row.acc + '% точность · ' + row.label + '</div></div>'; }).join('') + '</div>' +
      '<div class="wave29-section" style="margin-top:8px"><h4>🗓 По месяцам</h4><div class="wave29-badges">' + months.map(function(row){ return '<span class="wave29-badge">' + esc(row.label) + ' · ' + row.total + ' задач · ' + row.acc + '%</span>'; }).join('') + '</div><div class="wave29-note" style="margin-top:8px">За 30 дней: ' + data.last30Total + ' задач · ' + data.last30Active + ' активных дней. ' + (data.subjectSummary && data.subjectSummary.best ? ('Лучший предмет: ' + esc(data.subjectSummary.best.label) + ' (' + data.subjectSummary.best.acc + '%). ') : '') + (data.subjectSummary && data.subjectSummary.weakest ? ('Зона роста: ' + esc(data.subjectSummary.weakest.label) + ' (' + data.subjectSummary.weakest.acc + '%).') : '') + '</div></div>' +
    '</div>';
  }

  function initDashboardEnhancements(){
    if(!isDashboardPage() || !window._dashboardState) return;
    var host = document.getElementById('wave29-dashboard-summary');
    if(!host){
      host = document.createElement('div');
      host.id = 'wave29-dashboard-summary';
      var ref = document.querySelector('.dash-actions');
      if(ref && ref.parentNode) ref.parentNode.insertBefore(host, ref);
      else if(document.body) document.body.appendChild(host);
    }
    host.innerHTML = dashboardSummaryHtml(window._dashboardState);
  }

  function installDashboardEnhancements(){
    var run = function(){ try { initDashboardEnhancements(); } catch(e){} };
    try { window.addEventListener('dashboard-state-ready', run); } catch(e){}
    setTimeout(run, 50);
    setTimeout(run, 220);
    setTimeout(run, 600);
  }

  function init(){
    if(isGradePage()){
      installGradeOverrides();
      installSharedMode();
    }
    if(isDashboardPage()){
      installDashboardEnhancements();
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.wave29Debug = {
    version: VERSION,
    buildGradeSnapshot: buildGradeSnapshot,
    encodeGradeSnapshot: encodeGradeSnapshot,
    decodeGradeSnapshot: decodeGradeSnapshot,
    buildReportLink: buildReportLink,
    parseReportLink: parseReportLink,
    buildReportText: buildGradeReportText,
    buildParentPngCanvas: buildParentPngCanvas,
    buildQrFrames: buildQrFrames,
    parseQrFrame: parseQrFrame,
    showQrPackage: showQrPackage,
    canScanQr: canScanQr,
    openReport: function(){ return renderParentReport(buildGradeSnapshot(), { shared:false }); },
    openBackup: function(mode){ return renderBackupModal(mode); },
    hasPrintStyle: function(){ return !!document.getElementById(STYLE_ID); },
    dashboardSummaryPresent: function(){ return !!document.getElementById('wave29-dashboard-summary'); },
    sharedSnapshot: function(){ return window[SHARED_FLAG] || null; },
    lastQrFrameCount: function(){ return (window.__wave29LastQrFrames || []).length; }
  };
})();

;/* ---- bundle_profile_social.js ---- */
(function(root, factory){
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(root || globalThis, true);
  } else {
    root.wave68Profile = factory(root || window, false);
  }
})(typeof window !== 'undefined' ? window : globalThis, function(root, isNode){
  'use strict';

  var CONFIG = {
    key: 'trainer_profile_social_v1',
    cloudCacheKey: 'trainer_profile_social_cloud_cache_v1',
    cloudBinKey: 'trainer_cloud_bin_id',
    profileActiveKey: 'trainer35_active_profile_v1',
    profilesKey: 'trainer35_profiles_v1',
    profileScopePrefix: 'trainer35_scoped:',
    xpKey: 'trainer_xp_state_v1',
    metaKey: 'trainer_meta_state_v1',
    maxLeaderboard: 20,
    cloudTimeout: 6500,
    version: 68
  };

  var QR_PROVIDER = 'https://api.qrserver.com/v1/create-qr-code/';
  var STYLE_ID = 'wave68-profile-style';
  var TOAST_ID = 'wave68-profile-toast';
  var AVATARS = [
    { id:'fox', icon:'🦊', label:'Лис' },
    { id:'owl', icon:'🦉', label:'Сова' },
    { id:'rocket', icon:'🚀', label:'Ракета' },
    { id:'spark', icon:'✨', label:'Искра' },
    { id:'robot', icon:'🤖', label:'Робот' },
    { id:'lion', icon:'🦁', label:'Лев' },
    { id:'cat', icon:'🐱', label:'Кот' },
    { id:'panda', icon:'🐼', label:'Панда' },
    { id:'tiger', icon:'🐯', label:'Тигр' },
    { id:'whale', icon:'🐋', label:'Кит' },
    { id:'koala', icon:'🐨', label:'Коала' },
    { id:'dolphin', icon:'🐬', label:'Дельфин' },
    { id:'unicorn', icon:'🦄', label:'Единорог' },
    { id:'crown', icon:'👑', label:'Корона' },
    { id:'medal', icon:'🏅', label:'Медаль' },
    { id:'star', icon:'⭐', label:'Звезда' },
    { id:'comet', icon:'☄️', label:'Комета' },
    { id:'palette', icon:'🎨', label:'Палитра' },
    { id:'book', icon:'📘', label:'Книга' },
    { id:'bulb', icon:'💡', label:'Идея' }
  ];

  var SUBJECT_LABELS = {
    math: 'Математика', mathall: 'Математика', algebra: 'Алгебра', geometry: 'Геометрия',
    rus: 'Русский', russian: 'Русский', eng: 'Английский', english: 'Английский',
    phys: 'Физика', physics: 'Физика', chem: 'Химия', chemistry: 'Химия', biology: 'Биология',
    geo: 'География', geography: 'География', history: 'История', social: 'Обществознание',
    lit: 'Литература', literature: 'Литература', info: 'Информатика', informatics: 'Информатика',
    diplomacy: 'Дипломатия', construction: 'Строительство', procurement: 'Закупки',
    management: 'Управление', gkh: 'ЖКХ', psychology: 'Психология'
  };

  var storage = {
    get: function(key){
      try { return root.localStorage ? root.localStorage.getItem(key) : null; } catch (_) { return null; }
    },
    set: function(key, value){
      try { if (root.localStorage) root.localStorage.setItem(key, String(value)); } catch (_) {}
    },
    remove: function(key){
      try { if (root.localStorage) root.localStorage.removeItem(key); } catch (_) {}
    }
  };

  var liveClockProfile = '';
  var liveClockStartedAt = 0;

  function hasOwn(obj, key){ return Object.prototype.hasOwnProperty.call(obj || {}, key); }
  function asObj(value){ return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function toNum(value){ return Number(value || 0) || 0; }
  function esc(text){
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function nowIso(){ return new Date().toISOString(); }
  function safeParse(raw, fallback){ try { return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; } }
  function stripUrl(){ try { return String(root.location.href || '').replace(/[?#].*$/, ''); } catch (_) { return ''; } }
  function base64UrlEncode(text){
    var src = typeof text === 'string' ? text : JSON.stringify(text || {});
    try {
      if (typeof Buffer !== 'undefined' && Buffer.from) return Buffer.from(src, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'');
    } catch (_) {}
    try { return btoa(unescape(encodeURIComponent(src))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); } catch (_) { return src; }
  }
  function base64UrlDecode(text){
    var raw = String(text || '').replace(/-/g,'+').replace(/_/g,'/');
    while (raw.length % 4) raw += '=';
    try {
      if (typeof Buffer !== 'undefined' && Buffer.from) return Buffer.from(raw, 'base64').toString('utf8');
    } catch (_) {}
    try { return decodeURIComponent(escape(atob(raw))); } catch (_) { return raw; }
  }
  function hashText(text){
    var str = String(text || '');
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return (h >>> 0).toString(36).toUpperCase();
  }

  function activeProfileId(){
    try {
      if (root.wave35Debug && typeof root.wave35Debug.activeProfileId === 'function') return String(root.wave35Debug.activeProfileId() || 'p1');
    } catch (_) {}
    return storage.get(CONFIG.profileActiveKey) || 'p1';
  }
  function scopedKey(baseKey, profileId){ return CONFIG.profileScopePrefix + (profileId || activeProfileId()) + ':' + baseKey; }
  function loadProfiles(){
    try {
      if (root.wave35Debug && typeof root.wave35Debug.profiles === 'function') {
        var rows = root.wave35Debug.profiles();
        if (Array.isArray(rows) && rows.length) return rows;
      }
    } catch (_) {}
    return safeParse(storage.get(CONFIG.profilesKey), []);
  }
  function activeProfileName(){
    try {
      if (root.wave35Debug && typeof root.wave35Debug.activeProfile === 'function') {
        var current = root.wave35Debug.activeProfile();
        if (current && current.name) return String(current.name);
      }
    } catch (_) {}
    var rows = loadProfiles();
    var id = activeProfileId();
    for (var i = 0; i < rows.length; i++) if (rows[i] && rows[i].id === id) return String(rows[i].name || 'Ученик');
    return 'Ученик';
  }

  function avatarById(id){
    for (var i = 0; i < AVATARS.length; i++) if (AVATARS[i].id === id) return AVATARS[i];
    return AVATARS[1];
  }

  function defaultState(){
    return {
      avatarId: 'owl',
      tagline: '',
      trackedMs: 0,
      shareCount: 0,
      syncCount: 0,
      lastSyncAt: '',
      publicCode: '',
      lastLeaderboard: [],
      updatedAt: ''
    };
  }

  function normalizeState(state){
    state = Object.assign(defaultState(), asObj(state));
    state.avatarId = avatarById(state.avatarId).id;
    state.tagline = String(state.tagline || '').trim().slice(0, 48);
    state.trackedMs = Math.max(0, Math.round(toNum(state.trackedMs)));
    state.shareCount = Math.max(0, Math.round(toNum(state.shareCount)));
    state.syncCount = Math.max(0, Math.round(toNum(state.syncCount)));
    state.lastSyncAt = String(state.lastSyncAt || '');
    state.publicCode = String(state.publicCode || '');
    state.updatedAt = String(state.updatedAt || '');
    state.lastLeaderboard = Array.isArray(state.lastLeaderboard) ? state.lastLeaderboard.slice(0, CONFIG.maxLeaderboard) : [];
    return state;
  }

  function loadState(profileId){
    var raw = storage.get(scopedKey(CONFIG.key, profileId)) || storage.get(CONFIG.key);
    var state = normalizeState(safeParse(raw, defaultState()));
    if (!state.publicCode) {
      state.publicCode = publicCodeFor(profileId || activeProfileId(), activeProfileName());
      saveState(state, profileId);
    }
    return state;
  }
  function saveState(state, profileId){
    var normalized = normalizeState(state);
    if (!normalized.publicCode) normalized.publicCode = publicCodeFor(profileId || activeProfileId(), activeProfileName());
    normalized.updatedAt = nowIso();
    storage.set(scopedKey(CONFIG.key, profileId), JSON.stringify(normalized));
    return normalized;
  }

  function loadScopedRawJson(baseKey, profileId, fallback){ return safeParse(storage.get(scopedKey(baseKey, profileId)) || storage.get(baseKey), fallback); }
  function loadXpState(){
    try { if (root.wave66Xp && typeof root.wave66Xp.loadState === 'function') return root.wave66Xp.loadState(); } catch (_) {}
    return asObj(loadScopedRawJson(CONFIG.xpKey, activeProfileId(), {}));
  }
  function loadXpSummary(){
    try { if (root.wave66Xp && typeof root.wave66Xp.summarize === 'function') return root.wave66Xp.summarize(); } catch (_) {}
    var state = loadXpState();
    var answered = Math.max(0, toNum(state.answered));
    var correct = Math.max(0, toNum(state.correct));
    var hintCorrect = Math.max(0, toNum(state.hintCorrect));
    var wrong = Math.max(0, toNum(state.wrong));
    return {
      xp: Math.max(0, toNum(state.xp)),
      level: 1,
      rank: { label: 'Новичок', icon: '🌱' },
      answered: answered,
      correct: correct,
      hintCorrect: hintCorrect,
      wrong: wrong,
      diagnosticsDone: Math.max(0, toNum(state.diagnosticsDone)),
      topicsCompleted: Math.max(0, toNum(state.topicsCompleted)),
      maxStreak: Math.max(0, toNum(state.maxStreak))
    };
  }
  function loadMetaState(){
    try { if (root.wave67Meta && typeof root.wave67Meta.loadState === 'function') return root.wave67Meta.loadState(); } catch (_) {}
    return asObj(loadScopedRawJson(CONFIG.metaKey, activeProfileId(), {}));
  }
  function loadMetaSnapshot(xpSummary){
    try {
      if (root.wave67Meta && typeof root.wave67Meta.snapshot === 'function') return root.wave67Meta.snapshot(root.wave67Meta.loadState(), xpSummary || loadXpSummary());
    } catch (_) {}
    var metaState = loadMetaState();
    return {
      unlockedCount: Object.keys(asObj(metaState.unlocked)).length,
      secretUnlocked: 0,
      totalCount: 35,
      daily: [],
      weekly: [],
      achievements: [],
      recent: []
    };
  }

  function publicCodeFor(profileId, name){ return hashText(String(profileId || '') + '|' + String(name || '') + '|trainer').slice(0, 8); }


  function drawRoundRect(ctx, x, y, w, h, r){
    r = Math.max(0, Math.min(r || 0, Math.min(w, h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function formatDuration(ms){
    var totalMin = Math.max(0, Math.round(toNum(ms) / 60000));
    if (totalMin < 60) return totalMin + ' мин';
    var hours = Math.floor(totalMin / 60);
    var mins = totalMin % 60;
    return hours + ' ч ' + mins + ' мин';
  }

  function subjectLabel(id){
    var key = String(id || '').toLowerCase();
    if (SUBJECT_LABELS[key]) return SUBJECT_LABELS[key];
    try {
      if (Array.isArray(root.SUBJ)) {
        for (var i = 0; i < root.SUBJ.length; i++) {
          var row = root.SUBJ[i];
          if (row && String(row.id || '').toLowerCase() === key) return row.nm || row.id;
        }
      }
    } catch (_) {}
    return id || '—';
  }

  function favoriteSubjectFrom(subjectStats){
    subjectStats = asObj(subjectStats);
    var best = null;
    Object.keys(subjectStats).forEach(function(id){
      var row = asObj(subjectStats[id]);
      var answers = Math.max(0, toNum(row.answers));
      var correct = Math.max(0, toNum(row.correct));
      if (!answers) return;
      if (!best || answers > best.answers || (answers === best.answers && correct > best.correct)) {
        best = { id: id, answers: answers, correct: correct };
      }
    });
    if (!best) return { id:'', label:'—', answers:0, correct:0 };
    return { id: best.id, label: subjectLabel(best.id), answers: best.answers, correct: best.correct };
  }

  function aggregateActivity(){
    var map = {};
    var keys = [];
    for (var grade = 1; grade <= 11; grade++) {
      keys.push('trainer_activity_' + grade);
      keys.push('m' + grade + '_activity');
      keys.push('trainer_daily_' + grade);
      keys.push('m' + grade + '_daily');
    }
    keys.forEach(function(key){
      var payload = safeParse(storage.get(key), null);
      if (Array.isArray(payload)) {
        payload.forEach(function(row){
          if (!row || !row.date) return;
          var date = String(row.date);
          if (!map[date]) map[date] = { total:0 };
          map[date].total += Math.max(0, toNum(row.total || (toNum(row.ok) + toNum(row.err))));
        });
      } else if (payload && payload.date) {
        if (!map[payload.date]) map[payload.date] = { total:0 };
        map[payload.date].total += Math.max(0, toNum(payload.ok) + toNum(payload.err));
      }
    });
    var activeDays = Object.keys(map).filter(function(date){ return toNum(map[date].total) > 0; }).length;
    return { activeDays: activeDays, totalByDay: map };
  }

  function currentTrackedMs(state){
    var value = Math.max(0, toNum((state || {}).trackedMs));
    if (!isNode && liveClockProfile === activeProfileId() && liveClockStartedAt > 0) value += Math.max(0, Date.now() - liveClockStartedAt);
    return value;
  }

  function buildProfileSummary(input){
    input = asObj(input);
    if (hasOwn(input, 'totalAnswers') && hasOwn(input, 'accuracyPct') && hasOwn(input, 'publicCode')) {
      var ready = Object.assign({}, input);
      ready.avatar = ready.avatar || avatarById(ready.avatarId);
      ready.rankLabel = ready.rankLabel || 'Новичок';
      ready.rankIcon = ready.rankIcon || '🌱';
      ready.timeLabel = ready.timeLabel || formatDuration(ready.trackedMs || 0);
      ready.recentAchievements = Array.isArray(ready.recentAchievements) ? ready.recentAchievements : [];
      return ready;
    }
    var profileState = normalizeState(input.profileState || loadState());
    var xpSummary = asObj(input.xpSummary || loadXpSummary());
    var xpState = asObj(input.xpState || loadXpState());
    var metaSnapshot = asObj(input.metaSnapshot || loadMetaSnapshot(xpSummary));
    var metaState = asObj(input.metaState || loadMetaState());
    var activity = asObj(input.activity || aggregateActivity());
    var avatar = avatarById(profileState.avatarId);
    var totalAnswers = Math.max(0, toNum(xpSummary.answered) || toNum((window.STR || {}).totalQs));
    var totalCorrect = Math.max(0, toNum(xpSummary.correct) + toNum(xpSummary.hintCorrect) || toNum((window.STR || {}).totalOk));
    var totalWrong = Math.max(0, totalAnswers - totalCorrect);
    var accuracyPct = totalAnswers ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    var favorite = favoriteSubjectFrom(asObj(xpState.subjectStats));
    var rank = asObj(xpSummary.rank);
    var trackedMs = currentTrackedMs(profileState);
    var profileId = input.profileId || activeProfileId();
    var name = String(input.name || activeProfileName() || 'Ученик');
    var publicCode = profileState.publicCode || publicCodeFor(profileId, name);
    return {
      profileId: profileId,
      name: name,
      avatarId: avatar.id,
      avatar: avatar,
      publicCode: publicCode,
      tagline: profileState.tagline || '',
      xp: Math.max(0, toNum(xpSummary.xp)),
      level: Math.max(1, toNum(xpSummary.level || ((root.wave66Xp && root.wave66Xp.levelForXp) ? root.wave66Xp.levelForXp(toNum(xpSummary.xp)) : 1))),
      rankLabel: String(rank.label || 'Новичок'),
      rankIcon: String(rank.icon || '🌱'),
      progressPct: Math.max(0, Math.min(100, toNum((xpSummary.progress || {}).pct))),
      totalAnswers: totalAnswers,
      totalCorrect: totalCorrect,
      totalWrong: totalWrong,
      accuracyPct: accuracyPct,
      favoriteSubjectId: favorite.id,
      favoriteSubject: favorite.label,
      favoriteAnswers: favorite.answers,
      trackedMs: trackedMs,
      timeLabel: formatDuration(trackedMs),
      achievementsCount: Math.max(0, toNum(metaSnapshot.unlockedCount)),
      secretAchievements: Math.max(0, toNum(metaSnapshot.secretUnlocked)),
      diagnosticsDone: Math.max(0, toNum(xpSummary.diagnosticsDone)),
      topicsCompleted: Math.max(0, toNum(xpSummary.topicsCompleted)),
      missionDays: Math.max(0, toNum(metaState.missionDays)),
      weekWins: Math.max(0, toNum(metaState.weekWins)),
      bestCombo: Math.max(0, toNum(metaState.bestCombo)),
      bestStreak: Math.max(0, toNum(xpSummary.maxStreak)),
      activeDays: Math.max(0, toNum(activity.activeDays)),
      shareCount: Math.max(0, toNum(profileState.shareCount)),
      syncCount: Math.max(0, toNum(profileState.syncCount)),
      lastSyncAt: profileState.lastSyncAt || '',
      recentAchievements: Array.isArray(xpSummary.recentAchievements) ? xpSummary.recentAchievements.slice(0, 4) : []
    };
  }

  function buildPublicSnapshot(summary){
    summary = buildProfileSummary(summary);
    return {
      v: CONFIG.version,
      code: summary.publicCode,
      profileId: summary.profileId,
      name: summary.name,
      avatarId: summary.avatarId,
      level: summary.level,
      xp: summary.xp,
      rank: summary.rankLabel,
      rankIcon: summary.rankIcon,
      stats: {
        answers: summary.totalAnswers,
        accuracyPct: summary.accuracyPct,
        favoriteSubject: summary.favoriteSubject,
        timeLabel: summary.timeLabel,
        achievements: summary.achievementsCount,
        diagnostics: summary.diagnosticsDone,
        topics: summary.topicsCompleted,
        missionDays: summary.missionDays,
        weekWins: summary.weekWins,
        bestCombo: summary.bestCombo,
        bestStreak: summary.bestStreak,
        activeDays: summary.activeDays
      },
      generatedAt: nowIso()
    };
  }

  function encodeSnapshot(snapshot){ return base64UrlEncode(JSON.stringify(snapshot || {})); }
  function decodeSnapshot(payload){
    try { return JSON.parse(base64UrlDecode(payload)); } catch (_) { return null; }
  }
  function buildProfileLink(summary){ return stripUrl() + '#profile=' + encodeSnapshot(buildPublicSnapshot(summary)); }

  function sortProfiles(rows){
    return (Array.isArray(rows) ? rows.slice() : []).sort(function(a, b){
      a = asObj(a); b = asObj(b);
      return toNum(b.xp) - toNum(a.xp)
        || toNum(b.level) - toNum(a.level)
        || toNum(b.accuracyPct) - toNum(a.accuracyPct)
        || toNum(b.answers) - toNum(a.answers)
        || String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
    });
  }

  function leaderboardEntryFromSummary(summary){
    summary = buildProfileSummary(summary);
    return {
      code: summary.publicCode,
      profileId: summary.profileId,
      name: summary.name,
      avatarId: summary.avatarId,
      level: summary.level,
      xp: summary.xp,
      accuracyPct: summary.accuracyPct,
      answers: summary.totalAnswers,
      achievements: summary.achievementsCount,
      favoriteSubject: summary.favoriteSubject,
      updatedAt: nowIso()
    };
  }

  function mergeCloudDoc(doc, entry){
    doc = Object.assign({}, asObj(doc));
    var profiles = Array.isArray(doc.profiles) ? doc.profiles.slice() : [];
    var next = null;
    entry = Object.assign({}, asObj(entry));
    for (var i = 0; i < profiles.length; i++) {
      var row = asObj(profiles[i]);
      if ((entry.code && row.code === entry.code) || (entry.profileId && row.profileId === entry.profileId)) {
        next = Object.assign({}, row, entry);
        profiles[i] = next;
        next = null;
        break;
      }
    }
    if (next === null) {
      var found = false;
      for (var j = 0; j < profiles.length; j++) {
        var existing = asObj(profiles[j]);
        if ((entry.code && existing.code === entry.code) || (entry.profileId && existing.profileId === entry.profileId)) {
          found = true;
          break;
        }
      }
      if (!found) profiles.push(entry);
    }
    doc.profiles = sortProfiles(profiles).slice(0, 100);
    return doc;
  }

  function privateModeEnabled(){
    try { if (typeof root.getPrivateMode === 'function') return !!root.getPrivateMode(); } catch (_) {}
    var value = storage.get('trainer_private');
    return value === null || value === '1';
  }

  function cloudBinId(){ return String(root.rushBinId || root.RUSH_BIN_ID || storage.get(CONFIG.cloudBinKey) || ''); }
  function localFallbackLeaderboard(summary){
    var state = loadState();
    var rows = Array.isArray(state.lastLeaderboard) && state.lastLeaderboard.length ? state.lastLeaderboard.slice() : [leaderboardEntryFromSummary(summary || buildProfileSummary())];
    return sortProfiles(rows).slice(0, CONFIG.maxLeaderboard);
  }

  function fetchWithTimeout(url, options, timeoutMs){
    if (typeof fetch !== 'function') return Promise.reject(new Error('fetch unavailable'));
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = null;
    options = options || {};
    if (controller) {
      options.signal = controller.signal;
      timer = setTimeout(function(){ try { controller.abort(); } catch (_) {} }, timeoutMs || CONFIG.cloudTimeout);
    }
    return fetch(url, options).then(function(response){ if (timer) clearTimeout(timer); return response; }, function(error){ if (timer) clearTimeout(timer); throw error; });
  }

  function cacheLeaderboard(rows){
    var state = loadState();
    state.lastLeaderboard = sortProfiles(rows).slice(0, CONFIG.maxLeaderboard);
    saveState(state);
  }

  function updateSelfMeta(patch){
    var state = loadState();
    Object.keys(asObj(patch)).forEach(function(key){ state[key] = patch[key]; });
    return saveState(state);
  }

  function loadLeaderboard(){
    var summary = buildProfileSummary();
    if (privateModeEnabled() || !cloudBinId() || typeof fetch !== 'function') return Promise.resolve({ ok:false, reason: privateModeEnabled() ? 'private' : 'no-cloud', profiles: localFallbackLeaderboard(summary) });
    var url = 'https://api.npoint.io/' + cloudBinId();
    return fetchWithTimeout(url, null, CONFIG.cloudTimeout).then(function(response){ return response.json(); }).then(function(doc){
      var rows = sortProfiles((doc && doc.profiles) || []).slice(0, CONFIG.maxLeaderboard);
      if (!rows.length) rows = localFallbackLeaderboard(summary);
      cacheLeaderboard(rows);
      return { ok:true, profiles: rows };
    }).catch(function(){ return { ok:false, reason:'network', profiles: localFallbackLeaderboard(summary) }; });
  }

  function syncProfileToCloud(){
    var summary = buildProfileSummary();
    if (privateModeEnabled()) return Promise.resolve({ ok:false, reason:'private', profiles: localFallbackLeaderboard(summary) });
    if (!cloudBinId() || typeof fetch !== 'function') return Promise.resolve({ ok:false, reason:'no-cloud', profiles: localFallbackLeaderboard(summary) });
    var url = 'https://api.npoint.io/' + cloudBinId();
    var entry = leaderboardEntryFromSummary(summary);
    return fetchWithTimeout(url, null, CONFIG.cloudTimeout).then(function(response){ return response.json(); }).catch(function(){ return {}; }).then(function(doc){
      var merged = mergeCloudDoc(doc, entry);
      return fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      }, CONFIG.cloudTimeout).then(function(){
        updateSelfMeta({ syncCount: loadState().syncCount + 1, lastSyncAt: nowIso(), lastLeaderboard: sortProfiles(merged.profiles).slice(0, CONFIG.maxLeaderboard) });
        return { ok:true, profiles: sortProfiles(merged.profiles).slice(0, CONFIG.maxLeaderboard) };
      });
    }).catch(function(){ return { ok:false, reason:'network', profiles: localFallbackLeaderboard(summary) }; });
  }

  function recentAchievementsHtml(summary, dark){
    var rows = Array.isArray(summary.recentAchievements) ? summary.recentAchievements.slice(0, 4) : [];
    if (!rows.length) return '<div class="wave68-muted">Пока без новых достижений — продолжай серию.</div>';
    return rows.map(function(item){
      return '<span class="wave68-chip' + (dark ? ' dark' : '') + '">' + esc(item.icon || '🏆') + ' ' + esc(item.title || item.id || 'Достижение') + '</span>';
    }).join('');
  }

  function ensureStyle(){
    if (isNode || !root.document || root.document.getElementById(STYLE_ID)) return;
    var style = root.document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave68-card{margin:10px 0;padding:14px;border:1px solid var(--border,#e5e7eb);border-radius:16px;background:var(--card,#fff);box-shadow:0 10px 30px rgba(15,23,42,.05)}',
      '.wave68-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between}',
      '.wave68-avatar{width:54px;height:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;background:linear-gradient(135deg,#dbeafe,#ede9fe);flex-shrink:0}',
      '.wave68-name{font-family:Unbounded,system-ui,sans-serif;font-size:14px;font-weight:900;line-height:1.25}',
      '.wave68-sub{font-size:11px;color:var(--muted,#6b7280);line-height:1.45;margin-top:4px}',
      '.wave68-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
      '.wave68-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(37,99,235,.08);color:#1d4ed8;font-size:11px;font-weight:800;border:1px solid rgba(37,99,235,.1)}',
      '.wave68-chip.dark{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.12)}',
      '.wave68-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}',
      '.wave68-kpi{padding:10px;border-radius:12px;background:var(--bg,#f8fafc);border:1px solid var(--border,#e5e7eb)}',
      '.wave68-kpi b{display:block;font-family:Unbounded,system-ui,sans-serif;font-size:14px;line-height:1.1}',
      '.wave68-kpi span{display:block;font-size:10px;color:var(--muted,#6b7280);margin-top:4px}',
      '.wave68-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}',
      '.wave68-btn{flex:1 1 calc(33.333% - 6px);min-width:120px;padding:10px 12px;border-radius:12px;border:1px solid var(--border,#e5e7eb);background:var(--card,#fff);font:700 12px/1.2 Golos Text,system-ui,sans-serif;color:var(--text,#111827);cursor:pointer}',
      '.wave68-btn.accent{background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;border-color:transparent}',
      '.wave68-muted{font-size:11px;color:var(--muted,#6b7280);line-height:1.5}',
      '.wave68-holder{margin:10px 0}',
      '.wave68-overlay{position:fixed;inset:0;background:rgba(15,23,42,.56);backdrop-filter:blur(6px);z-index:10006;padding:18px calc(14px + env(safe-area-inset-right,0px)) calc(18px + env(safe-area-inset-bottom,0px)) calc(14px + env(safe-area-inset-left,0px));display:flex;align-items:flex-start;justify-content:center;overflow:auto}',
      '.wave68-overlay-card{width:min(100%,720px);margin-top:max(12px,env(safe-area-inset-top,0px));background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:18px;padding:16px;box-shadow:0 24px 60px rgba(15,23,42,.25)}',
      '.wave68-overlay-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}',
      '.wave68-overlay-title{font-family:Unbounded,system-ui,sans-serif;font-size:16px;font-weight:900;line-height:1.25}',
      '.wave68-close{width:38px;height:38px;border-radius:12px;border:1px solid var(--border,#e5e7eb);background:var(--bg,#f8fafc);font-size:18px;cursor:pointer}',
      '.wave68-avatar-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}',
      '.wave68-avatar-btn{padding:12px;border-radius:14px;border:1px solid var(--border,#e5e7eb);background:var(--card,#fff);font-size:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;min-height:70px}',
      '.wave68-avatar-btn.active{outline:2px solid #2563eb;border-color:#2563eb;background:#eef4ff}',
      '.wave68-row{display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.wave68-field{margin-top:10px}',
      '.wave68-field label{display:block;font-size:11px;color:var(--muted,#6b7280);margin-bottom:6px}',
      '.wave68-input{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border,#e5e7eb);background:var(--card,#fff);font:600 13px/1.2 Golos Text,system-ui,sans-serif;color:var(--text,#111827)}',
      '.wave68-qr-wrap{display:grid;grid-template-columns:280px 1fr;gap:16px;align-items:start}',
      '.wave68-qr-box{border:1px solid var(--border,#e5e7eb);border-radius:16px;padding:12px;background:#fff;display:flex;align-items:center;justify-content:center}',
      '.wave68-qr-box img{width:100%;max-width:256px;height:auto;display:block;image-rendering:pixelated}',
      '.wave68-code{width:100%;min-height:120px;border-radius:12px;border:1px solid var(--border,#e5e7eb);padding:10px 12px;font:12px/1.45 JetBrains Mono,monospace;background:var(--bg,#f8fafc);color:var(--text,#111827)}',
      '.wave68-leader{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--border,#e5e7eb);border-radius:14px;background:var(--card,#fff);margin-top:8px}',
      '.wave68-leader-left{display:flex;align-items:center;gap:10px;min-width:0}',
      '.wave68-leader-rank{width:28px;text-align:center;font:900 13px/1 Unbounded,system-ui,sans-serif;color:#2563eb}',
      '.wave68-leader-avatar{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;background:linear-gradient(135deg,#dbeafe,#ede9fe)}',
      '.wave68-leader-name{font-weight:800;font-size:13px;line-height:1.2}',
      '.wave68-leader-sub{font-size:10px;color:var(--muted,#6b7280);margin-top:4px}',
      '.wave68-leader-metric{text-align:right;font-size:11px;color:var(--muted,#6b7280)}',
      '.wave68-toast{position:fixed;left:50%;bottom:calc(102px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(10px);z-index:10008;padding:10px 14px;border-radius:999px;background:rgba(15,23,42,.96);color:#fff;font-size:12px;font-weight:800;opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;max-width:min(92vw,420px);text-align:center;box-shadow:0 12px 28px rgba(0,0,0,.28)}',
      '.wave68-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}',
      '@media (max-width:800px){.wave68-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.wave68-qr-wrap{grid-template-columns:1fr}.wave68-avatar-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}',
      '@media (max-width:520px){.wave68-actions{flex-direction:column}.wave68-btn{min-width:0;flex:1 1 auto}.wave68-avatar-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}'
    ].join('');
    root.document.head.appendChild(style);
  }

  function toast(message){
    if (isNode || !root.document || !message) return;
    ensureStyle();
    var node = root.document.getElementById(TOAST_ID);
    if (!node) {
      node = root.document.createElement('div');
      node.id = TOAST_ID;
      node.className = 'wave68-toast';
      root.document.body.appendChild(node);
    }
    node.textContent = String(message);
    node.className = 'wave68-toast on';
    clearTimeout(node._tid);
    node._tid = setTimeout(function(){ node.className = 'wave68-toast'; }, 1800);
  }

  function overlay(title, subtitle){
    ensureStyle();
    var wrap = root.document.createElement('div');
    wrap.className = 'wave68-overlay';
    wrap.innerHTML = '<div class="wave68-overlay-card"><div class="wave68-overlay-head"><div><div class="wave68-overlay-title">' + esc(title || '') + '</div>' + (subtitle ? '<div class="wave68-sub" style="margin-top:6px">' + esc(subtitle) + '</div>' : '') + '</div><button type="button" class="wave68-close" aria-label="Закрыть">×</button></div><div class="wave68-overlay-body"></div></div>';
    wrap.querySelector('.wave68-close').addEventListener('click', function(){ wrap.remove(); });
    wrap.addEventListener('click', function(ev){ if (ev.target === wrap) wrap.remove(); });
    root.document.body.appendChild(wrap);
    return { wrap: wrap, body: wrap.querySelector('.wave68-overlay-body') };
  }

  function cardHtml(summary, compact){
    summary = buildProfileSummary(summary);
    return '<div class="wave68-card">'
      + '<div class="wave68-head">'
      + '<div style="display:flex;gap:12px;min-width:0"><div class="wave68-avatar">' + esc(summary.avatar.icon) + '</div><div style="min-width:0">'
      + '<div class="wave68-name">' + esc(summary.name) + '</div>'
      + '<div class="wave68-sub">' + esc(summary.rankIcon + ' ' + summary.rankLabel + ' · уровень ' + summary.level + ' · ' + summary.xp + ' XP') + '</div>'
      + '<div class="wave68-sub">Код профиля: <b>' + esc(summary.publicCode) + '</b>' + (summary.tagline ? ' · ' + esc(summary.tagline) : '') + '</div>'
      + '</div></div>'
      + '<div class="wave68-chip">' + (summary.totalAnswers === 0 ? '—' : summary.accuracyPct + '%') + ' точность</div>'
      + '</div>'
      + '<div class="wave68-grid">'
      + '<div class="wave68-kpi"><b>' + summary.totalAnswers + '</b><span>решено вопросов</span></div>'
      + '<div class="wave68-kpi"><b>' + esc(summary.favoriteSubject) + '</b><span>любимый предмет</span></div>'
      + '<div class="wave68-kpi"><b>' + esc(summary.timeLabel) + '</b><span>время в приложении</span></div>'
      + '<div class="wave68-kpi"><b>' + summary.achievementsCount + '</b><span>достижений</span></div>'
      + '</div>'
      + (compact ? '' : '<div class="wave68-badges">'
        + '<span class="wave68-chip">🩺 Диагностик: ' + summary.diagnosticsDone + '</span>'
        + '<span class="wave68-chip">🗺 Тем: ' + summary.topicsCompleted + '</span>'
        + '<span class="wave68-chip">🔥 Лучшая серия: ' + summary.bestStreak + '</span>'
        + '<span class="wave68-chip">✨ Комбо: ' + summary.bestCombo + '</span>'
        + '</div>')
      + '<div class="wave68-badges" style="margin-top:10px">' + recentAchievementsHtml(summary, false) + '</div>'
      + '<div class="wave68-actions">'
      + '<button type="button" class="wave68-btn" data-wave68-action="avatar">🧑 Аватар</button>'
      + '<button type="button" class="wave68-btn" data-wave68-action="qr">📱 QR</button>'
      + '<button type="button" class="wave68-btn" data-wave68-action="png">🖼 PNG</button>'
      + '<button type="button" class="wave68-btn" data-wave68-action="leaders">🏁 Лидеры</button>'
      + '<button type="button" class="wave68-btn accent" data-wave68-action="sync">☁️ Синхр.</button>'
      + '</div>'
      + '</div>';
  }

  function attachActionHandlers(host){
    if (!host) return;
    Array.prototype.slice.call(host.querySelectorAll('[data-wave68-action]')).forEach(function(btn){
      if (btn.__wave68Bound) return;
      btn.__wave68Bound = true;
      btn.addEventListener('click', function(){
        var action = btn.getAttribute('data-wave68-action');
        if (action === 'avatar') openAvatarPicker();
        else if (action === 'qr') showProfileQr();
        else if (action === 'png') downloadProfilePng();
        else if (action === 'leaders') showLeaderboard();
        else if (action === 'sync') syncProfileToCloud().then(function(result){
          if (result.ok) toast('Профиль синхронизирован');
          else if (result.reason === 'private') toast('Сначала выключи приватный режим');
          else if (result.reason === 'no-cloud') toast('Не настроен облачный бин');
          else toast('Не удалось синхронизировать');
        });
      });
    });
  }

  function openAvatarPicker(){
    if (isNode || !root.document) return;
    var state = loadState();
    var ui = overlay('Аватар и подпись', 'Выбери один из 20 аватаров для активного профиля.');
    var summary = buildProfileSummary();
    ui.body.innerHTML = '<div class="wave68-card" style="margin-top:0">'
      + '<div class="wave68-head"><div style="display:flex;gap:12px;align-items:center"><div class="wave68-avatar" id="wave68-avatar-preview">' + esc(summary.avatar.icon) + '</div><div><div class="wave68-name">' + esc(summary.name) + '</div><div class="wave68-sub">Код профиля: <b>' + esc(summary.publicCode) + '</b></div></div></div><div class="wave68-chip">уровень ' + summary.level + '</div></div>'
      + '<div class="wave68-field"><label>Короткая подпись</label><input class="wave68-input" id="wave68-tagline" maxlength="48" placeholder="Например: Готов к рывку" value="' + esc(state.tagline || '') + '"></div>'
      + '<div class="wave68-field"><label>Аватары</label><div class="wave68-avatar-grid" id="wave68-avatar-grid">'
      + AVATARS.map(function(row){ return '<button type="button" class="wave68-avatar-btn' + (row.id === state.avatarId ? ' active' : '') + '" data-avatar-id="' + esc(row.id) + '" aria-label="' + esc(row.label) + '">' + esc(row.icon) + '</button>'; }).join('')
      + '</div></div>'
      + '<div class="wave68-actions"><button type="button" class="wave68-btn accent" id="wave68-save-avatar">Сохранить</button><button type="button" class="wave68-btn" id="wave68-copy-code">Скопировать код</button></div>'
      + '</div>';
    var selected = state.avatarId;
    Array.prototype.slice.call(ui.body.querySelectorAll('[data-avatar-id]')).forEach(function(btn){
      btn.addEventListener('click', function(){
        selected = btn.getAttribute('data-avatar-id') || 'owl';
        Array.prototype.slice.call(ui.body.querySelectorAll('[data-avatar-id]')).forEach(function(node){ node.classList.toggle('active', node === btn); });
        ui.body.querySelector('#wave68-avatar-preview').textContent = avatarById(selected).icon;
      });
    });
    ui.body.querySelector('#wave68-save-avatar').addEventListener('click', function(){
      var next = loadState();
      next.avatarId = selected;
      next.tagline = String(ui.body.querySelector('#wave68-tagline').value || '').trim().slice(0, 48);
      saveState(next);
      refreshUi();
      toast('Профиль обновлён');
      ui.wrap.remove();
    });
    ui.body.querySelector('#wave68-copy-code').addEventListener('click', function(){ copyText(summary.publicCode, 'Код профиля скопирован'); });
  }

  function qrImageSrc(text, size){
    var n = Math.max(160, Math.min(512, toNum(size) || 280));
    return QR_PROVIDER + '?size=' + n + 'x' + n + '&margin=0&data=' + encodeURIComponent(String(text || ''));
  }

  function copyText(text, successMessage){
    if (!text) return;
    if (root.navigator && root.navigator.clipboard && typeof root.navigator.clipboard.writeText === 'function') {
      root.navigator.clipboard.writeText(String(text)).then(function(){ if (successMessage) toast(successMessage); }).catch(function(){ try { root.prompt('Скопируй:', String(text)); } catch (_) {} });
      return;
    }
    try { root.prompt('Скопируй:', String(text)); } catch (_) {}
  }

  function showProfileQr(){
    if (isNode || !root.document) return;
    var summary = buildProfileSummary();
    var link = buildProfileLink(summary);
    var ui = overlay('QR профиля', 'Покажи код другу или открой на другом устройстве для сравнения.');
    ui.body.innerHTML = '<div class="wave68-qr-wrap"><div class="wave68-qr-box"><img alt="QR профиля" src="' + esc(qrImageSrc(link, 280)) + '"></div><div>'
      + '<div class="wave68-card" style="margin-top:0">' + cardHtml(summary, true) + '</div>'
      + '<div class="wave68-field"><label>Ссылка профиля</label><textarea class="wave68-code" readonly>' + esc(link) + '</textarea></div>'
      + '<div class="wave68-actions"><button type="button" class="wave68-btn accent" id="wave68-copy-link">📋 Скопировать ссылку</button><button type="button" class="wave68-btn" id="wave68-copy-code2">🔑 Скопировать код</button></div>'
      + '</div></div>';
    attachActionHandlers(ui.body);
    ui.body.querySelector('#wave68-copy-link').addEventListener('click', function(){
      var state = loadState();
      state.shareCount += 1;
      saveState(state);
      copyText(link, 'Ссылка профиля скопирована');
    });
    ui.body.querySelector('#wave68-copy-code2').addEventListener('click', function(){ copyText(summary.publicCode, 'Код профиля скопирован'); });
  }

  function buildProfilePngCanvas(summary){
    summary = buildProfileSummary(summary);
    if (isNode || !root.document) return null;
    var canvas = root.document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    var grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.arc(1040, 120, 120, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(140, 540, 100, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px Unbounded, sans-serif';
    ctx.fillText(summary.name, 120, 100);
    ctx.font = '700 24px Golos Text, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fillText(summary.rankIcon + ' ' + summary.rankLabel + ' · уровень ' + summary.level + ' · ' + summary.xp + ' XP', 120, 146);

    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    drawRoundRect(ctx, 120, 180, 180, 180, 28);
    ctx.fill();
    ctx.font = '900 108px Apple Color Emoji, Segoe UI Emoji, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(summary.avatar.icon, 210, 300);
    ctx.textAlign = 'left';

    var cards = [
      { x: 340, y: 190, w: 220, h: 110, value: summary.totalAnswers, label: 'решено вопросов' },
      { x: 580, y: 190, w: 220, h: 110, value: summary.accuracyPct + '%', label: 'точность' },
      { x: 820, y: 190, w: 220, h: 110, value: summary.achievementsCount, label: 'достижений' },
      { x: 340, y: 320, w: 220, h: 110, value: summary.favoriteSubject, label: 'любимый предмет' },
      { x: 580, y: 320, w: 220, h: 110, value: summary.timeLabel, label: 'время в приложении' },
      { x: 820, y: 320, w: 220, h: 110, value: summary.bestStreak, label: 'лучшая серия' }
    ];
    cards.forEach(function(card){
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      drawRoundRect(ctx, card.x, card.y, card.w, card.h, 24);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 30px Unbounded, sans-serif';
      ctx.fillText(String(card.value), card.x + 20, card.y + 48);
      ctx.font = '700 16px Golos Text, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      ctx.fillText(card.label, card.x + 20, card.y + 78);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    drawRoundRect(ctx, 120, 470, 920, 100, 24);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px Unbounded, sans-serif';
    ctx.fillText('Профиль ученика · код ' + summary.publicCode, 150, 515);
    ctx.font = '700 18px Golos Text, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    var line = 'Диагностик: ' + summary.diagnosticsDone + ' · тем: ' + summary.topicsCompleted + ' · активных дней: ' + summary.activeDays + ' · неделя побед: ' + summary.weekWins;
    ctx.fillText(line, 150, 550);
    if (summary.recentAchievements && summary.recentAchievements.length) {
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.font = '700 16px Golos Text, sans-serif';
      ctx.fillText('Недавние достижения: ' + summary.recentAchievements.map(function(item){ return (item.icon || '🏆') + ' ' + (item.title || item.id); }).join(' · '), 150, 580);
    }
    return canvas;
  }

  function downloadProfilePng(){
    if (isNode || !root.document) return;
    var summary = buildProfileSummary();
    var canvas = buildProfilePngCanvas(summary);
    if (!canvas) return;
    var state = loadState();
    state.shareCount += 1;
    saveState(state);
    if (canvas.toBlob) {
      canvas.toBlob(function(blob){
        if (!blob) return;
        var fileName = 'trainer_profile_' + summary.publicCode + '.png';
        var file = null;
        try { file = new File([blob], fileName, { type:'image/png' }); } catch (_) {}
        if (root.navigator && root.navigator.share && file && (!root.navigator.canShare || root.navigator.canShare({ files:[file] }))) {
          root.navigator.share({ title:'Профиль ученика', text:'Мой профиль в тренажёре', files:[file] }).catch(function(){ downloadBlob(fileName, blob); });
        } else downloadBlob(fileName, blob);
      }, 'image/png');
    }
  }

  function downloadBlob(fileName, blob){
    if (isNode || !root.document || !blob) return;
    var url = URL.createObjectURL(blob);
    var a = root.document.createElement('a');
    a.href = url;
    a.download = fileName;
    root.document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1200);
  }

  function leaderboardHtml(rows, selfCode){
    rows = sortProfiles(rows).slice(0, CONFIG.maxLeaderboard);
    if (!rows.length) return '<div class="wave68-muted">Лидеров пока нет. Синхронизируй первый профиль и задай темп.</div>';
    return rows.map(function(row, index){
      row = asObj(row);
      var avatar = avatarById(row.avatarId).icon;
      var isSelf = row.code === selfCode;
      return '<div class="wave68-leader"' + (isSelf ? ' style="border-color:#2563eb;box-shadow:0 0 0 1px rgba(37,99,235,.18) inset"' : '') + '>'
        + '<div class="wave68-leader-left"><div class="wave68-leader-rank">' + (index + 1) + '</div><div class="wave68-leader-avatar">' + esc(avatar) + '</div><div style="min-width:0"><div class="wave68-leader-name">' + esc(row.name || 'Ученик') + (isSelf ? ' · это ты' : '') + '</div><div class="wave68-leader-sub">' + esc((row.favoriteSubject || '—') + ' · ' + (row.code || '')) + '</div></div></div>'
        + '<div class="wave68-leader-metric"><b style="display:block;color:var(--text,#111827)">' + toNum(row.xp) + ' XP</b><span>' + toNum(row.accuracyPct) + '% · ' + toNum(row.answers) + ' вопр.</span></div>'
        + '</div>';
    }).join('');
  }

  function showLeaderboard(){
    if (isNode || !root.document) return;
    var summary = buildProfileSummary();
    var ui = overlay('Таблица лидеров', 'Сравнение профилей через npoint.io. Если облако не настроено, показывается локальный кэш.');
    ui.body.innerHTML = '<div class="wave68-card" style="margin-top:0"><div class="wave68-row"><div class="wave68-name">Топ профилей</div><div class="wave68-chip">код ' + esc(summary.publicCode) + '</div></div><div class="wave68-sub">Сортировка: XP → уровень → точность → объём решённых вопросов.</div><div id="wave68-leaderboard-box" style="margin-top:10px">' + leaderboardHtml(localFallbackLeaderboard(summary), summary.publicCode) + '</div><div class="wave68-actions"><button type="button" class="wave68-btn accent" id="wave68-sync-now">Обновить из облака</button><button type="button" class="wave68-btn" id="wave68-copy-self">Скопировать код</button></div></div>';
    ui.body.querySelector('#wave68-copy-self').addEventListener('click', function(){ copyText(summary.publicCode, 'Код профиля скопирован'); });
    ui.body.querySelector('#wave68-sync-now').addEventListener('click', function(){
      syncProfileToCloud().then(function(syncRes){
        var rows = syncRes && syncRes.profiles ? syncRes.profiles : localFallbackLeaderboard(summary);
        ui.body.querySelector('#wave68-leaderboard-box').innerHTML = leaderboardHtml(rows, summary.publicCode);
        toast(syncRes.ok ? 'Лидеры обновлены' : (syncRes.reason === 'private' ? 'Открой публикацию результатов' : 'Показан локальный рейтинг'));
      });
    });
    loadLeaderboard().then(function(res){ ui.body.querySelector('#wave68-leaderboard-box').innerHTML = leaderboardHtml(res.profiles, summary.publicCode); });
  }

  function renderIndexCard(){
    if (isNode || !root.document || root.document.getElementById('s-main')) return;
    var anchor = root.document.getElementById('wave68-index-holder-anchor') || root.document.querySelector('.foot') || root.document.querySelector('.stats');
    if (!anchor) return;
    var holder = root.document.getElementById('wave68-index-holder');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave68-index-holder';
      holder.className = 'wave68-holder';
      anchor.parentNode.insertBefore(holder, anchor);
    }
    holder.innerHTML = cardHtml(buildProfileSummary(), true);
    attachActionHandlers(holder);
  }

  function renderDashboardCard(){
    if (isNode || !root.document || !root.document.getElementById('grades')) return;
    var hero = root.document.querySelector('.hero');
    if (!hero) return;
    var holder = root.document.getElementById('wave68-dashboard-holder');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave68-dashboard-holder';
      holder.className = 'wave68-holder';
      hero.insertAdjacentElement('afterend', holder);
    }
    holder.innerHTML = cardHtml(buildProfileSummary(), false);
    attachActionHandlers(holder);
    var nameEl = root.document.getElementById('name');
    if (nameEl) nameEl.textContent = buildProfileSummary().avatar.icon + ' ' + buildProfileSummary().name;
  }

  function decorateHallOfFame(){
    if (isNode || !root.document) return;
    var overlays = Array.prototype.slice.call(root.document.querySelectorAll('body > div[style*="position:fixed"], body > .wave68-overlay'));
    if (!overlays.length) return;
    var overlay = overlays[overlays.length - 1];
    if (!overlay || overlay.classList.contains('wave68-overlay')) return;
    var card = overlay.firstElementChild;
    if (!card || card.querySelector('.wave68-profile-hof')) return;
    var section = root.document.createElement('div');
    section.className = 'wave68-profile-hof';
    section.innerHTML = '<div class="wave68-card" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.14);color:#fff;box-shadow:none">'
      + '<div class="wave68-head"><div style="display:flex;gap:12px;align-items:center"><div class="wave68-avatar">' + esc(buildProfileSummary().avatar.icon) + '</div><div><div class="wave68-name" style="color:#fff">' + esc(buildProfileSummary().name) + '</div><div class="wave68-sub" style="color:#dbeafe">' + esc(buildProfileSummary().rankIcon + ' ' + buildProfileSummary().rankLabel + ' · код ' + buildProfileSummary().publicCode) + '</div></div></div><div class="wave68-chip dark">' + buildProfileSummary().xp + ' XP</div></div>'
      + '<div class="wave68-grid"><div class="wave68-kpi" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)"><b>' + buildProfileSummary().totalAnswers + '</b><span style="color:#dbeafe">вопросов</span></div><div class="wave68-kpi" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)"><b>' + buildProfileSummary().accuracyPct + '%</b><span style="color:#dbeafe">точность</span></div><div class="wave68-kpi" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)"><b>' + esc(buildProfileSummary().favoriteSubject) + '</b><span style="color:#dbeafe">любимый предмет</span></div><div class="wave68-kpi" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)"><b>' + buildProfileSummary().achievementsCount + '</b><span style="color:#dbeafe">достижений</span></div></div>'
      + '<div class="wave68-actions"><button type="button" class="wave68-btn" data-wave68-action="avatar">🧑 Аватар</button><button type="button" class="wave68-btn" data-wave68-action="qr">📱 QR</button><button type="button" class="wave68-btn" data-wave68-action="leaders">🏁 Лидеры</button><button type="button" class="wave68-btn accent" data-wave68-action="sync">☁️ Синхр.</button></div>'
      + '</div>';
    var anchor = card.querySelector('.wave67-profile-meta') || card.querySelector('.wave66-profile-xp');
    if (anchor && anchor.insertAdjacentElement) anchor.insertAdjacentElement('afterend', section);
    else card.appendChild(section);
    attachActionHandlers(section);
  }

  function patchHallOfFame(){
    if (isNode || !root.showHallOfFame || root.__wave68HallPatched) return;
    var original = root.showHallOfFame;
    root.showHallOfFame = function(){
      var out = original.apply(this, arguments);
      setTimeout(decorateHallOfFame, 0);
      return out;
    };
    root.__wave68HallPatched = true;
  }

  function patchBackup(){
    if (root.getBackupSnapshot && !root.__wave68ProfileBackupGetPatched) {
      var originalGet = root.getBackupSnapshot;
      root.getBackupSnapshot = function(){
        var snap = originalGet.apply(this, arguments);
        try { snap.profileSocialState = loadState(); } catch (_) {}
        return snap;
      };
      root.__wave68ProfileBackupGetPatched = true;
    }
    if (root.applyBackupSnapshot && !root.__wave68ProfileBackupApplyPatched) {
      var originalApply = root.applyBackupSnapshot;
      root.applyBackupSnapshot = function(payload){
        var out = originalApply.apply(this, arguments);
        try { if (payload && payload.profileSocialState) saveState(payload.profileSocialState); } catch (_) {}
        setTimeout(refreshUi, 0);
        return out;
      };
      root.__wave68ProfileBackupApplyPatched = true;
    }
  }

  function parseProfileHash(){
    try {
      var hash = String(root.location.hash || '').replace(/^#/, '');
      if (!hash) return null;
      var parts = hash.split('&');
      for (var i = 0; i < parts.length; i++) {
        var pair = parts[i].split('=');
        if (pair[0] === 'profile') return decodeSnapshot(pair.slice(1).join('='));
      }
    } catch (_) {}
    return null;
  }

  function showSharedProfile(snapshot){
    if (isNode || !root.document || !snapshot) return;
    var local = buildProfileSummary();
    var avatar = avatarById(snapshot.avatarId || 'owl');
    var ui = overlay('Профиль по QR', 'Снимок прогресса можно сравнить с локальным профилем.');
    var localBetter = toNum(local.xp) > toNum(snapshot.xp) ? 'Ты впереди по XP' : (toNum(local.xp) < toNum(snapshot.xp) ? 'Друг впереди по XP' : 'По XP ничья');
    ui.body.innerHTML = '<div class="wave68-card" style="margin-top:0"><div class="wave68-row"><div class="wave68-name">' + esc(snapshot.name || 'Профиль') + '</div><div class="wave68-chip">' + esc(snapshot.code || '') + '</div></div>'
      + '<div class="wave68-head" style="margin-top:10px"><div style="display:flex;gap:12px;align-items:center"><div class="wave68-avatar">' + esc(avatar.icon) + '</div><div><div class="wave68-sub">' + esc((snapshot.rankIcon || '🌱') + ' ' + (snapshot.rank || 'Новичок') + ' · уровень ' + toNum(snapshot.level)) + '</div><div class="wave68-sub">' + esc(toNum(snapshot.xp) + ' XP · ' + toNum((snapshot.stats || {}).accuracyPct) + '% точность') + '</div></div></div><div class="wave68-chip">' + esc(localBetter) + '</div></div>'
      + '<div class="wave68-grid"><div class="wave68-kpi"><b>' + toNum((snapshot.stats || {}).answers) + '</b><span>решено вопросов</span></div><div class="wave68-kpi"><b>' + esc((snapshot.stats || {}).favoriteSubject || '—') + '</b><span>любимый предмет</span></div><div class="wave68-kpi"><b>' + esc((snapshot.stats || {}).timeLabel || '0 мин') + '</b><span>время в приложении</span></div><div class="wave68-kpi"><b>' + toNum((snapshot.stats || {}).achievements) + '</b><span>достижений</span></div></div>'
      + '<div class="wave68-muted" style="margin-top:10px">Снимок создан: ' + esc(new Date(snapshot.generatedAt || Date.now()).toLocaleString('ru-RU')) + '</div></div>';
  }

  function startLiveClock(){
    if (isNode || !root.document) return;
    if (root.document.hidden) return;
    if (liveClockStartedAt > 0 && liveClockProfile === activeProfileId()) return;
    liveClockProfile = activeProfileId();
    liveClockStartedAt = Date.now();
  }

  function stopLiveClock(){
    if (isNode || liveClockStartedAt <= 0) return;
    var state = loadState(liveClockProfile || activeProfileId());
    state.trackedMs += Math.max(0, Date.now() - liveClockStartedAt);
    saveState(state, liveClockProfile || activeProfileId());
    liveClockStartedAt = 0;
    liveClockProfile = '';
  }

  function installTimeTracking(){
    if (isNode || !root.document || root.__wave68TimeTracking) return;
    startLiveClock();
    root.document.addEventListener('visibilitychange', function(){ if (root.document.hidden) stopLiveClock(); else startLiveClock(); });
    root.addEventListener('pagehide', stopLiveClock);
    root.addEventListener('beforeunload', stopLiveClock);
    root.__wave68TimeTracking = true;
  }

  function refreshUi(){
    if (isNode || !root.document) return;
    ensureStyle();
    renderIndexCard();
    renderDashboardCard();
    decorateHallOfFame();
  }

  function init(){
    if (isNode || !root.document) return;
    ensureStyle();
    installTimeTracking();
    patchBackup();
    patchHallOfFame();
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', refreshUi, { once:true });
    else refreshUi();
    root.addEventListener('wave66-xp-updated', function(){ setTimeout(refreshUi, 0); });
    root.addEventListener('wave67-meta-updated', function(){ setTimeout(refreshUi, 0); });
    root.addEventListener('dashboard-state-ready', function(){ setTimeout(renderDashboardCard, 0); });
    setTimeout(function(){ var shared = parseProfileHash(); if (shared) showSharedProfile(shared); }, 50);
  }

  var api = {
    config: CONFIG,
    avatars: AVATARS,
    defaultState: defaultState,
    normalizeState: normalizeState,
    loadState: loadState,
    saveState: saveState,
    buildProfileSummary: buildProfileSummary,
    buildPublicSnapshot: buildPublicSnapshot,
    encodeSnapshot: encodeSnapshot,
    decodeSnapshot: decodeSnapshot,
    buildProfileLink: buildProfileLink,
    publicCodeFor: publicCodeFor,
    leaderboardEntryFromSummary: leaderboardEntryFromSummary,
    sortProfiles: sortProfiles,
    mergeCloudDoc: mergeCloudDoc,
    localFallbackLeaderboard: localFallbackLeaderboard,
    loadLeaderboard: loadLeaderboard,
    syncProfileToCloud: syncProfileToCloud,
    buildProfilePngCanvas: buildProfilePngCanvas,
    openAvatarPicker: openAvatarPicker,
    showProfileQr: showProfileQr,
    showLeaderboard: showLeaderboard,
    refreshUi: refreshUi,
    init: init
  };

  init();
  return api;
});

;/* ---- chunk_roadmap_wave86w_cloud_sync.js ---- */
/* wave86w: optional cross-device cloud sync via Supabase or Firebase REST.
 * Static/offline-first: no SDK, no credentials baked into the build.
 */
(function(){
  'use strict';

  var root = window;
  var VERSION = 'wave86w';
  var CONFIG_KEY = 'trainer_wave86w_sync_config';
  var META_KEY_PREFIX = 'trainer_wave86w_sync_meta_';
  var STYLE_ID = 'wave86w-cloud-sync-style';
  var AUTO_PUSH_DELAY = 1600;
  var autoTimer = null;
  var lastStatus = null;
  var lastRemoteEnvelope = null;

  function isGradePage(){ return /^\/?.*grade\d+_v2\.html(?:$|[?#])/.test(location.pathname) || !!root.GRADE_NUM; }
  function gradeKey(){ return String(root.GRADE_NUM || root.GRADE_NO || (location.pathname.match(/grade(\d+)_v2/) || [,''])[1] || ''); }
  function nowIso(){ return new Date().toISOString(); }
  function toNum(v){ var n = Number(v); return isFinite(n) ? n : 0; }
  function hasFn(fn){ return typeof fn === 'function'; }
  function getName(){ try { return hasFn(root.getPlayerName) ? root.getPlayerName() : (localStorage.getItem('trainer_player_name') || 'Ученик'); } catch(e){ return 'Ученик'; } }
  function getCode(){ try { return hasFn(root.getPlayerCode) ? root.getPlayerCode() : (localStorage.getItem('trainer_player_code') || ''); } catch(e){ return ''; } }
  function setCode(v){ try { if(hasFn(root.setPlayerCode)) root.setPlayerCode(v); else localStorage.setItem('trainer_player_code', v); } catch(e){} }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(ch){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]; }); }
  function normalizeUrl(v){ return String(v || '').trim().replace(/\/+$/, ''); }
  function safeJson(text, fallback){ try { return JSON.parse(text); } catch(e){ return fallback; } }
  function lsGet(key, fallback){ try { var v = localStorage.getItem(key); return v == null ? fallback : v; } catch(e){ return fallback; } }
  function lsSet(key, value){ try { localStorage.setItem(key, value); return true; } catch(e){ return false; } }
  function lsRemove(key){ try { localStorage.removeItem(key); } catch(e){} }
  function metaKey(){ return META_KEY_PREFIX + gradeKey(); }
  function readMeta(){ return safeJson(lsGet(metaKey(), '{}'), {}) || {}; }
  function writeMeta(meta){ lsSet(metaKey(), JSON.stringify(meta || {})); }
  function isPrivate(){ try { return hasFn(root.getPrivateMode) ? !!root.getPrivateMode() : lsGet('trainer_private', '1') !== '0'; } catch(e){ return true; } }

  function randomId(prefix){
    var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var out = prefix || '';
    if(root.crypto && crypto.getRandomValues){
      var buf = new Uint8Array(10);
      crypto.getRandomValues(buf);
      for(var i=0;i<buf.length;i++) out += alphabet[buf[i] % alphabet.length];
      return out;
    }
    for(var j=0;j<10;j++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
  }

  function defaultConfig(){
    var code = getCode();
    if(!code){ code = randomId(''); setCode(code); }
    return {
      enabled: false,
      provider: 'supabase',
      syncId: code,
      autoPush: false,
      autoPull: false,
      deviceId: lsGet('trainer_wave86w_device_id', '') || randomId('dev_'),
      deviceName: lsGet('trainer_wave86w_device_name', '') || defaultDeviceName(),
      supabaseUrl: '',
      supabaseAnonKey: '',
      supabaseTable: 'trainer_sync_snapshots',
      firebaseProjectId: '',
      firebaseApiKey: '',
      firebaseCollection: 'trainer_sync'
    };
  }

  function defaultDeviceName(){
    var ua = (navigator.userAgent || '').toLowerCase();
    if(/iphone|ipad|android/.test(ua)) return 'Телефон';
    if(/mac|win|linux/.test(ua)) return 'Компьютер';
    return 'Устройство';
  }

  function externalConfig(){
    var cfg = root.TRAINER_SYNC_CONFIG || root.trainerSyncConfig || null;
    if(!cfg || typeof cfg !== 'object') return {};
    return {
      enabled: cfg.enabled,
      provider: cfg.provider,
      syncId: cfg.syncId,
      autoPush: cfg.autoPush,
      autoPull: cfg.autoPull,
      deviceName: cfg.deviceName,
      supabaseUrl: cfg.supabaseUrl || cfg.url,
      supabaseAnonKey: cfg.supabaseAnonKey || cfg.anonKey,
      supabaseTable: cfg.supabaseTable || cfg.table,
      firebaseProjectId: cfg.firebaseProjectId || cfg.projectId,
      firebaseApiKey: cfg.firebaseApiKey || cfg.apiKey,
      firebaseCollection: cfg.firebaseCollection || cfg.collection
    };
  }

  function readConfig(){
    var base = defaultConfig();
    var saved = safeJson(lsGet(CONFIG_KEY, '{}'), {}) || {};
    var ext = externalConfig();
    var cfg = Object.assign(base, saved, ext);
    cfg.provider = cfg.provider === 'firebase' ? 'firebase' : 'supabase';
    cfg.syncId = String(cfg.syncId || base.syncId || '').trim() || randomId('');
    cfg.deviceId = String(cfg.deviceId || base.deviceId || randomId('dev_'));
    cfg.deviceName = String(cfg.deviceName || base.deviceName || defaultDeviceName()).trim() || defaultDeviceName();
    cfg.supabaseUrl = normalizeUrl(cfg.supabaseUrl);
    cfg.supabaseAnonKey = String(cfg.supabaseAnonKey || '').trim();
    cfg.supabaseTable = String(cfg.supabaseTable || 'trainer_sync_snapshots').trim() || 'trainer_sync_snapshots';
    cfg.firebaseProjectId = String(cfg.firebaseProjectId || '').trim();
    cfg.firebaseApiKey = String(cfg.firebaseApiKey || '').trim();
    cfg.firebaseCollection = String(cfg.firebaseCollection || 'trainer_sync').trim() || 'trainer_sync';
    lsSet('trainer_wave86w_device_id', cfg.deviceId);
    lsSet('trainer_wave86w_device_name', cfg.deviceName);
    return cfg;
  }

  function saveConfig(cfg){
    var clean = Object.assign(readConfig(), cfg || {});
    clean.provider = clean.provider === 'firebase' ? 'firebase' : 'supabase';
    clean.syncId = String(clean.syncId || '').trim();
    clean.deviceName = String(clean.deviceName || '').trim() || defaultDeviceName();
    clean.supabaseUrl = normalizeUrl(clean.supabaseUrl);
    clean.supabaseAnonKey = String(clean.supabaseAnonKey || '').trim();
    clean.supabaseTable = String(clean.supabaseTable || 'trainer_sync_snapshots').trim() || 'trainer_sync_snapshots';
    clean.firebaseProjectId = String(clean.firebaseProjectId || '').trim();
    clean.firebaseApiKey = String(clean.firebaseApiKey || '').trim();
    clean.firebaseCollection = String(clean.firebaseCollection || 'trainer_sync').trim() || 'trainer_sync';
    lsSet('trainer_wave86w_device_name', clean.deviceName);
    lsSet(CONFIG_KEY, JSON.stringify(clean));
    return clean;
  }

  function validateConfig(cfg){
    if(!cfg.syncId) throw new Error('Укажи sync-код. Его нужно ввести на втором устройстве.');
    if(cfg.provider === 'supabase'){
      if(!cfg.supabaseUrl || !/^https:\/\/.+\.supabase\.co$/i.test(cfg.supabaseUrl)) throw new Error('Для Supabase нужен URL вида https://xxxx.supabase.co');
      if(!cfg.supabaseAnonKey) throw new Error('Для Supabase нужен anon public key.');
      if(!cfg.supabaseTable) throw new Error('Укажи имя таблицы Supabase.');
      return true;
    }
    if(!cfg.firebaseProjectId) throw new Error('Для Firebase нужен projectId.');
    if(!cfg.firebaseApiKey) throw new Error('Для Firebase нужен Web API key.');
    if(!cfg.firebaseCollection) throw new Error('Укажи коллекцию Firestore.');
    return true;
  }

  function stableStringify(value){
    if(value === null || typeof value !== 'object') return JSON.stringify(value);
    if(Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    return '{' + Object.keys(value).sort().map(function(key){ return JSON.stringify(key) + ':' + stableStringify(value[key]); }).join(',') + '}';
  }

  function snapshotForChecksum(snapshot){
    var clone = JSON.parse(JSON.stringify(snapshot || {}));
    delete clone.exportedAt;
    delete clone.__wave86wCloud;
    return clone;
  }

  async function checksum(value){
    var text = stableStringify(snapshotForChecksum(value));
    if(root.crypto && crypto.subtle && root.TextEncoder){
      try {
        var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.prototype.map.call(new Uint8Array(buf), function(b){ return b.toString(16).padStart(2, '0'); }).join('');
      } catch(e){}
    }
    var h1 = 0x811c9dc5;
    for(var i=0;i<text.length;i++){ h1 ^= text.charCodeAt(i); h1 = Math.imul(h1, 0x01000193); }
    return ('00000000' + (h1 >>> 0).toString(16)).slice(-8);
  }

  function buildSnapshot(){
    if(!hasFn(root.getBackupSnapshot)) throw new Error('Backup API ещё не загружен. Открой страницу класса ещё раз.');
    var snap = root.getBackupSnapshot();
    if(!snap || snap.app !== 'trainer') throw new Error('Backup snapshot не создан.');
    return snap;
  }

  async function buildEnvelope(cfg){
    var snap = buildSnapshot();
    var sum = await checksum(snap);
    var now = nowIso();
    snap.__wave86wCloud = {
      version: VERSION,
      syncId: cfg.syncId,
      provider: cfg.provider,
      deviceId: cfg.deviceId,
      deviceName: cfg.deviceName,
      updatedAt: now,
      checksum: sum
    };
    return {
      app: 'trainer',
      format: 'cloud-sync-envelope',
      version: 1,
      wave: VERSION,
      syncId: cfg.syncId,
      grade: gradeKey(),
      playerName: getName(),
      playerCode: getCode(),
      provider: cfg.provider,
      deviceId: cfg.deviceId,
      deviceName: cfg.deviceName,
      updatedAt: now,
      updatedTs: Date.now(),
      checksum: sum,
      snapshot: snap
    };
  }

  function recordId(cfg){ return String(cfg.syncId || '').trim() + '-grade-' + gradeKey(); }

  function fetchJson(url, opts, timeoutMs){
    timeoutMs = timeoutMs || 12000;
    var ctrl = new AbortController();
    var timer = setTimeout(function(){ try { ctrl.abort(); } catch(e){} }, timeoutMs);
    opts = opts || {};
    opts.signal = ctrl.signal;
    return fetch(url, opts).then(async function(res){
      var text = await res.text().catch(function(){ return ''; });
      var body = text ? safeJson(text, text) : null;
      clearTimeout(timer);
      if(!res.ok){
        var msg = (body && (body.message || body.error || body.hint)) || text || ('HTTP ' + res.status);
        throw new Error(msg);
      }
      return body;
    }).catch(function(err){ clearTimeout(timer); throw err; });
  }

  function supabaseHeaders(cfg, prefer){
    var h = {
      'apikey': cfg.supabaseAnonKey,
      'Authorization': 'Bearer ' + cfg.supabaseAnonKey,
      'Content-Type': 'application/json'
    };
    if(prefer) h.Prefer = prefer;
    return h;
  }

  function supabaseBase(cfg){ return cfg.supabaseUrl + '/rest/v1/' + encodeURIComponent(cfg.supabaseTable); }

  async function supabasePush(cfg, envelope){
    var body = {
      id: recordId(cfg),
      sync_id: cfg.syncId,
      grade: gradeKey(),
      updated_at: envelope.updatedAt,
      checksum: envelope.checksum,
      payload: envelope
    };
    var url = supabaseBase(cfg);
    var data = await fetchJson(url, {
      method: 'POST',
      headers: supabaseHeaders(cfg, 'resolution=merge-duplicates,return=representation'),
      body: JSON.stringify(body)
    });
    return Array.isArray(data) && data[0] && data[0].payload ? data[0].payload : envelope;
  }

  async function supabasePull(cfg){
    var url = supabaseBase(cfg) + '?id=eq.' + encodeURIComponent(recordId(cfg)) + '&select=id,updated_at,checksum,payload&limit=1';
    var data = await fetchJson(url, { method: 'GET', headers: supabaseHeaders(cfg) });
    var row = Array.isArray(data) ? data[0] : null;
    return row && row.payload ? normalizeEnvelope(row.payload) : null;
  }

  function firebaseUrl(cfg){
    var doc = encodeURIComponent(recordId(cfg));
    var url = 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(cfg.firebaseProjectId) + '/databases/(default)/documents/' + encodeURIComponent(cfg.firebaseCollection) + '/' + doc;
    return cfg.firebaseApiKey ? url + '?key=' + encodeURIComponent(cfg.firebaseApiKey) : url;
  }

  function firebaseDoc(envelope){
    return { fields: {
      syncId: { stringValue: String(envelope.syncId || '') },
      grade: { stringValue: String(envelope.grade || '') },
      updatedAt: { timestampValue: envelope.updatedAt },
      updatedTs: { integerValue: String(envelope.updatedTs || Date.now()) },
      checksum: { stringValue: String(envelope.checksum || '') },
      payloadJson: { stringValue: JSON.stringify(envelope) }
    }};
  }

  function parseFirebaseDoc(doc){
    if(!doc || !doc.fields || !doc.fields.payloadJson) return null;
    var text = doc.fields.payloadJson.stringValue || '';
    return normalizeEnvelope(safeJson(text, null));
  }

  async function firebasePush(cfg, envelope){
    var doc = await fetchJson(firebaseUrl(cfg), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firebaseDoc(envelope))
    });
    return parseFirebaseDoc(doc) || envelope;
  }

  async function firebasePull(cfg){
    try { return parseFirebaseDoc(await fetchJson(firebaseUrl(cfg), { method: 'GET' })); }
    catch(e){ if(String(e && e.message || '').indexOf('NOT_FOUND') >= 0 || String(e && e.message || '').indexOf('404') >= 0) return null; throw e; }
  }

  function normalizeEnvelope(env){
    if(!env || typeof env !== 'object') return null;
    if(env.format === 'cloud-sync-envelope' && env.snapshot && env.snapshot.app === 'trainer') return env;
    if(env.app === 'trainer' && env.format === 'grade-backup'){
      return {
        app: 'trainer', format: 'cloud-sync-envelope', version: 1, wave: VERSION,
        syncId: '', grade: String(env.grade || gradeKey()), playerName: env.player && env.player.name || 'Ученик',
        playerCode: env.player && env.player.code || '', provider: 'unknown', deviceId: '', deviceName: 'Импорт',
        updatedAt: env.exportedAt || nowIso(), updatedTs: Date.parse(env.exportedAt || '') || Date.now(), checksum: '', snapshot: env
      };
    }
    return null;
  }

  async function adapterPush(cfg, env){
    return cfg.provider === 'firebase' ? firebasePush(cfg, env) : supabasePush(cfg, env);
  }
  async function adapterPull(cfg){
    return cfg.provider === 'firebase' ? firebasePull(cfg) : supabasePull(cfg);
  }

  function summarizeSnapshot(snapshot){
    var str = snapshot && snapshot.streak || {};
    var daily = snapshot && snapshot.daily || {};
    var progress = snapshot && snapshot.progress || {};
    var topics = 0;
    try { Object.keys(progress).forEach(function(sid){ topics += Object.keys(progress[sid] || {}).length; }); } catch(e){}
    return {
      totalQs: toNum(str.totalQs),
      totalOk: toNum(str.totalOk),
      current: toNum(str.current),
      best: toNum(str.best),
      today: toNum(daily.ok) + toNum(daily.err),
      topics: topics,
      exportedAt: snapshot && snapshot.exportedAt || ''
    };
  }

  function statusText(env){
    if(!env) return 'В облаке пока нет копии для этого класса.';
    var s = summarizeSnapshot(env.snapshot || {});
    var pct = s.totalQs ? Math.round(s.totalOk / s.totalQs * 100) : 0;
    return 'Облако: ' + (env.playerName || 'Ученик') + ' · ' + s.totalQs + ' вопросов · ' + pct + '% · ' + (env.updatedAt || 'без даты');
  }

  async function pushNow(reason){
    var cfg = readConfig();
    validateConfig(cfg);
    if(isPrivate()) throw new Error('Включён приватный режим. Отключи его в профиле, чтобы отправлять данные в облако.');
    var env = await buildEnvelope(cfg);
    var saved = normalizeEnvelope(await adapterPush(cfg, env)) || env;
    var meta = readMeta();
    meta.lastPushAt = nowIso();
    meta.lastChecksum = env.checksum;
    meta.lastProvider = cfg.provider;
    meta.lastReason = reason || 'manual';
    meta.lastRemoteAt = saved.updatedAt || env.updatedAt;
    writeMeta(meta);
    lastStatus = '✅ Сохранено в облако: ' + env.updatedAt;
    lastRemoteEnvelope = saved;
    return saved;
  }

  async function pullRemote(){
    var cfg = readConfig();
    validateConfig(cfg);
    var env = normalizeEnvelope(await adapterPull(cfg));
    lastRemoteEnvelope = env;
    return env;
  }

  async function applyRemote(env){
    env = normalizeEnvelope(env || lastRemoteEnvelope);
    if(!env || !env.snapshot) throw new Error('В облаке нет копии для восстановления.');
    if(String(env.snapshot.grade || env.grade || '') !== gradeKey()) throw new Error('Копия относится к другому классу.');
    if(!hasFn(root.applyBackupSnapshot)) throw new Error('Restore API ещё не загружен.');
    var ok = root.applyBackupSnapshot(env.snapshot);
    var meta = readMeta();
    meta.lastPullAt = nowIso();
    meta.lastRemoteAt = env.updatedAt || '';
    meta.lastChecksum = env.checksum || '';
    writeMeta(meta);
    lastStatus = '✅ Восстановлено из облака: ' + (env.updatedAt || 'без даты');
    return ok;
  }

  function canAutoPush(){
    var cfg = readConfig();
    return !!(cfg.enabled && cfg.autoPush && (cfg.supabaseUrl || cfg.firebaseProjectId));
  }

  function scheduleAutoPush(reason){
    if(!canAutoPush() || isPrivate()) return;
    clearTimeout(autoTimer);
    autoTimer = setTimeout(function(){ pushNow(reason || 'auto').catch(function(err){ lastStatus = '⚠️ Автосинхронизация: ' + (err && err.message || err); }); }, AUTO_PUSH_DELAY);
  }

  function installHooks(){
    if(root.__wave86wCloudHooksInstalled) return;
    root.__wave86wCloudHooksInstalled = true;
    var oldEnd = root.endSession;
    if(hasFn(oldEnd)){
      root.endSession = function(){
        var result = oldEnd.apply(this, arguments);
        scheduleAutoPush('endSession');
        return result;
      };
    }
    var oldApply = root.applyBackupSnapshot;
    if(hasFn(oldApply)){
      root.applyBackupSnapshot = function(){
        var result = oldApply.apply(this, arguments);
        setTimeout(function(){ try { injectButtons(); } catch(e){} }, 120);
        return result;
      };
    }
    var oldCloudSave = root.cloudSave;
    if(hasFn(oldCloudSave)){
      root.cloudSave = function(){
        var ret;
        try { ret = oldCloudSave.apply(this, arguments); } finally { scheduleAutoPush('cloudSave'); }
        return ret;
      };
    }
    document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'hidden') scheduleAutoPush('visibility'); });
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave86w-cloud-btn{border-color:#0ea5e9!important;color:#0369a1!important}',
      '.wave86w-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10020;display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto}',
      '.wave86w-card{background:var(--card,#fff);color:var(--text,var(--ink,#1a1a2e));border:1px solid var(--border,#e5e7eb);border-radius:18px;padding:20px;max-width:560px;width:100%;box-shadow:0 18px 42px rgba(0,0,0,.25);max-height:92vh;overflow:auto}',
      '.wave86w-title{font-family:Unbounded,system-ui,sans-serif;font-size:17px;font-weight:900;margin:0 0 6px;text-align:center}',
      '.wave86w-sub{font-size:12px;color:var(--muted,#6b7280);line-height:1.5;text-align:center;margin:0 0 14px}',
      '.wave86w-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
      '.wave86w-field{display:flex;flex-direction:column;gap:4px;margin-bottom:8px}',
      '.wave86w-field label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--muted,#6b7280)}',
      '.wave86w-field input,.wave86w-field select{width:100%;padding:10px;border:1px solid var(--border,#e5e7eb);border-radius:10px;background:var(--bg,#fff);color:var(--text,var(--ink,#111827));font:12px Golos Text,system-ui,sans-serif}',
      '.wave86w-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}',
      '.wave86w-btn{flex:1;min-width:135px;border:1px solid var(--border,#e5e7eb);border-radius:10px;background:var(--bg,#f8fafc);color:var(--text,#111827);font-weight:800;font-size:12px;padding:10px;cursor:pointer;font-family:Golos Text,system-ui,sans-serif}',
      '.wave86w-btn.primary{background:#0ea5e9;color:#fff;border-color:#0ea5e9}',
      '.wave86w-btn.danger{background:#fee2e2;color:#b91c1c;border-color:#fecaca}',
      '.wave86w-note{font-size:11px;color:var(--muted,#6b7280);line-height:1.5;margin-top:10px}',
      '.wave86w-status{background:var(--abg,#f3f4f6);border-radius:12px;padding:12px;font-size:12px;line-height:1.5;margin-top:10px;white-space:pre-wrap}',
      '.wave86w-provider{border:1px solid var(--border,#e5e7eb);border-radius:12px;padding:10px;margin-top:8px}',
      '.wave86w-hide{display:none!important}',
      '@media(max-width:560px){.wave86w-grid{grid-template-columns:1fr}.wave86w-btn{min-width:100%}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function field(id, label, value, type, placeholder){
    return '<div class="wave86w-field"><label for="' + id + '">' + esc(label) + '</label><input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(value || '') + '" placeholder="' + esc(placeholder || '') + '"></div>';
  }

  function providerPanel(cfg){
    return '<div class="wave86w-provider" id="wave86w-supabase-panel">' +
      '<div class="wave86w-grid">' +
      field('wave86w-supabase-url', 'Supabase URL', cfg.supabaseUrl, 'url', 'https://xxxx.supabase.co') +
      field('wave86w-supabase-key', 'Supabase anon key', cfg.supabaseAnonKey, 'password', 'eyJ...') +
      '</div>' + field('wave86w-supabase-table', 'Таблица', cfg.supabaseTable, 'text', 'trainer_sync_snapshots') +
      '<div class="wave86w-note">Таблица должна иметь поля: <b>id</b> text primary key, <b>sync_id</b> text, <b>grade</b> text, <b>updated_at</b> timestamptz, <b>checksum</b> text, <b>payload</b> jsonb.</div>' +
      '</div>' +
      '<div class="wave86w-provider" id="wave86w-firebase-panel">' +
      '<div class="wave86w-grid">' +
      field('wave86w-firebase-project', 'Firebase projectId', cfg.firebaseProjectId, 'text', 'my-project') +
      field('wave86w-firebase-key', 'Firebase Web API key', cfg.firebaseApiKey, 'password', 'AIza...') +
      '</div>' + field('wave86w-firebase-collection', 'Firestore collection', cfg.firebaseCollection, 'text', 'trainer_sync') +
      '<div class="wave86w-note">Используется Firestore REST. Документ: <code>syncId-grade-N</code>, payload хранится строкой JSON в поле <code>payloadJson</code>.</div>' +
      '</div>';
  }

  function readForm(){
    var cfg = readConfig();
    function val(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; }
    function checked(id){ var el = document.getElementById(id); return !!(el && el.checked); }
    cfg.enabled = checked('wave86w-enabled');
    cfg.provider = val('wave86w-provider') === 'firebase' ? 'firebase' : 'supabase';
    cfg.syncId = val('wave86w-sync-id') || cfg.syncId;
    cfg.deviceName = val('wave86w-device-name') || cfg.deviceName;
    cfg.autoPush = checked('wave86w-auto-push');
    cfg.autoPull = checked('wave86w-auto-pull');
    cfg.supabaseUrl = val('wave86w-supabase-url');
    cfg.supabaseAnonKey = val('wave86w-supabase-key');
    cfg.supabaseTable = val('wave86w-supabase-table') || 'trainer_sync_snapshots';
    cfg.firebaseProjectId = val('wave86w-firebase-project');
    cfg.firebaseApiKey = val('wave86w-firebase-key');
    cfg.firebaseCollection = val('wave86w-firebase-collection') || 'trainer_sync';
    return saveConfig(cfg);
  }

  function refreshProviderPanels(){
    var provider = (document.getElementById('wave86w-provider') || {}).value || 'supabase';
    var supa = document.getElementById('wave86w-supabase-panel');
    var fire = document.getElementById('wave86w-firebase-panel');
    if(supa) supa.classList.toggle('wave86w-hide', provider !== 'supabase');
    if(fire) fire.classList.toggle('wave86w-hide', provider !== 'firebase');
  }

  function setStatus(text, kind){
    var box = document.getElementById('wave86w-status');
    if(!box) return;
    box.textContent = text || '';
    box.style.color = kind === 'error' ? '#b91c1c' : kind === 'ok' ? '#166534' : '';
  }

  function localStatusLine(){
    var snap = null;
    try { snap = buildSnapshot(); } catch(e){}
    if(!snap) return 'Локально: backup API ещё не готов.';
    var s = summarizeSnapshot(snap);
    var pct = s.totalQs ? Math.round(toNum(s.totalOk) / s.totalQs * 100) : 0;
    return 'Локально: ' + getName() + ' · ' + s.totalQs + ' вопросов · ' + pct + '% · ' + gradeKey() + ' класс';
  }

  function renderCloudModal(){
    ensureStyle();
    var cfg = readConfig();
    var meta = readMeta();
    var overlay = document.createElement('div');
    overlay.className = 'wave86w-overlay';
    overlay.addEventListener('click', function(ev){ if(ev.target === overlay) overlay.remove(); });
    var card = document.createElement('div');
    card.className = 'wave86w-card';
    card.addEventListener('click', function(ev){ ev.stopPropagation(); });
    card.innerHTML =
      '<h3 class="wave86w-title">☁️ Синхронизация между устройствами</h3>' +
      '<p class="wave86w-sub">F2: ручная и опциональная авто-синхронизация текущего класса через Supabase или Firebase. Данные остаются в твоём проекте, без SDK и без внешнего backend в сборке.</p>' +
      '<div class="wave86w-grid">' +
      '<div class="wave86w-field"><label for="wave86w-provider">Провайдер</label><select id="wave86w-provider"><option value="supabase">Supabase REST</option><option value="firebase">Firebase Firestore REST</option></select></div>' +
      field('wave86w-sync-id', 'Sync-код', cfg.syncId, 'text', 'один и тот же на устройствах') +
      field('wave86w-device-name', 'Имя устройства', cfg.deviceName, 'text', 'Телефон / ноутбук') +
      '<div class="wave86w-field"><label>Режим</label><label style="font-size:12px;text-transform:none;letter-spacing:0;font-weight:700;color:inherit"><input id="wave86w-enabled" type="checkbox" ' + (cfg.enabled ? 'checked' : '') + '> включить sync</label><label style="font-size:12px;text-transform:none;letter-spacing:0;font-weight:700;color:inherit"><input id="wave86w-auto-push" type="checkbox" ' + (cfg.autoPush ? 'checked' : '') + '> автосохранение после тренировки</label><label style="font-size:12px;text-transform:none;letter-spacing:0;font-weight:700;color:inherit"><input id="wave86w-auto-pull" type="checkbox" ' + (cfg.autoPull ? 'checked' : '') + '> проверять облако при входе</label></div>' +
      '</div>' + providerPanel(cfg) +
      '<div class="wave86w-actions">' +
      '<button class="wave86w-btn" id="wave86w-save">💾 Сохранить настройки</button>' +
      '<button class="wave86w-btn" id="wave86w-copy">📋 Копировать sync-код</button>' +
      '<button class="wave86w-btn primary" id="wave86w-push">⬆️ Отправить в облако</button>' +
      '<button class="wave86w-btn" id="wave86w-check">🔎 Проверить облако</button>' +
      '<button class="wave86w-btn" id="wave86w-pull">⬇️ Восстановить из облака</button>' +
      '<button class="wave86w-btn danger" id="wave86w-clear">🧹 Сбросить настройки</button>' +
      '<button class="wave86w-btn" id="wave86w-close">Закрыть</button>' +
      '</div>' +
      '<div class="wave86w-status" id="wave86w-status"></div>' +
      '<div class="wave86w-note">Для второго устройства: открой тот же класс, введи тот же sync-код и те же параметры Supabase/Firebase, затем нажми «Восстановить из облака». Приватный режим блокирует отправку, но не блокирует ручное восстановление.</div>';
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    var provider = document.getElementById('wave86w-provider');
    if(provider) provider.value = cfg.provider;
    refreshProviderPanels();
    if(provider) provider.addEventListener('change', refreshProviderPanels);
    setStatus(localStatusLine() + '\n' + (lastStatus || '') + (meta.lastPushAt ? '\nПоследний push: ' + meta.lastPushAt : '') + (meta.lastPullAt ? '\nПоследний pull: ' + meta.lastPullAt : ''));

    document.getElementById('wave86w-save').addEventListener('click', function(){
      try { var saved = readForm(); validateConfig(saved); setStatus('✅ Настройки сохранены.\n' + localStatusLine(), 'ok'); }
      catch(e){ setStatus('⚠️ ' + (e && e.message || e), 'error'); }
    });
    document.getElementById('wave86w-copy').addEventListener('click', async function(){
      var code = (document.getElementById('wave86w-sync-id') || {}).value || readConfig().syncId;
      try { await navigator.clipboard.writeText(code); setStatus('✅ Sync-код скопирован: ' + code, 'ok'); }
      catch(e){ setStatus('Sync-код: ' + code); }
    });
    document.getElementById('wave86w-push').addEventListener('click', async function(){
      try { var cfgNow = readForm(); validateConfig(cfgNow); setStatus('Отправляю snapshot в облако…'); var env = await pushNow('manual'); setStatus('✅ Snapshot отправлен.\n' + statusText(env) + '\n' + localStatusLine(), 'ok'); }
      catch(e){ setStatus('⚠️ ' + (e && e.message || e), 'error'); }
    });
    document.getElementById('wave86w-check').addEventListener('click', async function(){
      try { var cfgNow = readForm(); validateConfig(cfgNow); setStatus('Проверяю облако…'); var env = await pullRemote(); setStatus(statusText(env) + '\n' + localStatusLine(), env ? 'ok' : ''); }
      catch(e){ setStatus('⚠️ ' + (e && e.message || e), 'error'); }
    });
    document.getElementById('wave86w-pull').addEventListener('click', async function(){
      try {
        var cfgNow = readForm(); validateConfig(cfgNow); setStatus('Загружаю snapshot из облака…');
        var env = lastRemoteEnvelope || await pullRemote();
        if(!env){ setStatus('В облаке пока нет snapshot для этого sync-кода и класса.'); return; }
        var msg = statusText(env) + '\n\nЛокальные данные текущего класса будут заменены облачной копией. Продолжить?';
        if(!confirm(msg)){ setStatus('Восстановление отменено.\n' + statusText(env)); return; }
        await applyRemote(env);
        setStatus('✅ Восстановлено. Обновляю экран…\n' + statusText(env), 'ok');
        setTimeout(function(){ try { if(hasFn(root.refreshMain)) root.refreshMain(); if(hasFn(root.renderProg)) root.renderProg(); } catch(e){} }, 120);
      } catch(e){ setStatus('⚠️ ' + (e && e.message || e), 'error'); }
    });
    document.getElementById('wave86w-clear').addEventListener('click', function(){
      if(!confirm('Удалить локальные настройки синхронизации? Прогресс не будет удалён.')) return;
      lsRemove(CONFIG_KEY); lsRemove(metaKey()); lastRemoteEnvelope = null; lastStatus = null;
      overlay.remove(); renderCloudModal();
    });
    document.getElementById('wave86w-close').addEventListener('click', function(){ overlay.remove(); });
    return overlay;
  }

  function injectButtons(){
    if(!isGradePage() || !document.body) return;
    ensureStyle();
    if(!document.getElementById('wave86w-main-cloud-btn')){
      var backupBtn = Array.prototype.find.call(document.querySelectorAll('button'), function(btn){ return /showBackupModal/.test(btn.getAttribute('data-wave86u-on-click') || '') || /Резервная копия/.test(btn.textContent || ''); });
      var row = backupBtn && backupBtn.parentElement;
      if(row){
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'wave86w-main-cloud-btn';
        btn.className = 'btn btn-o wave86w-cloud-btn';
        btn.style.flex = '1';
        btn.textContent = '☁️ Синхронизация';
        btn.addEventListener('click', renderCloudModal);
        if(row.children.length >= 2){
          var newRow = document.createElement('div');
          newRow.style.cssText = 'display:flex;gap:8px;margin-bottom:8px';
          newRow.appendChild(btn);
          row.parentNode.insertBefore(newRow, row.nextSibling);
        } else {
          row.appendChild(btn);
        }
      }
    }
    if(!document.getElementById('wave86w-profile-cloud-btn')){
      var player = document.getElementById('player-badge');
      if(player){
        var small = document.createElement('button');
        small.type = 'button';
        small.id = 'wave86w-profile-cloud-btn';
        small.className = 'wave86w-cloud-btn';
        small.style.cssText = 'margin-top:6px;border:1px solid #0ea5e9;border-radius:999px;background:transparent;padding:5px 10px;font-size:10px;font-weight:800;cursor:pointer;font-family:Golos Text,sans-serif';
        small.textContent = '☁ sync';
        small.addEventListener('click', renderCloudModal);
        player.appendChild(document.createElement('br'));
        player.appendChild(small);
      }
    }
  }

  function enhanceBackupOverlay(){
    var old = root.showBackupModal;
    if(!hasFn(old) || root.__wave86wBackupModalPatched) return;
    root.__wave86wBackupModalPatched = true;
    root.showBackupModal = function(){
      var result = old.apply(this, arguments);
      setTimeout(function(){
        try {
          var body = document.querySelector('.wave29-body');
          if(!body || document.getElementById('wave86w-backup-cloud-section')) return;
          ensureStyle();
          var section = document.createElement('div');
          section.className = 'wave29-section';
          section.id = 'wave86w-backup-cloud-section';
          section.innerHTML = '<h4>Облако</h4><div class="wave29-note" style="margin-top:4px">Синхронизация текущего класса через Supabase/Firebase поверх этого backup snapshot.</div>';
          var actions = document.createElement('div');
          actions.className = 'wave29-actions wave29-no-print';
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'wave29-btn accent';
          btn.textContent = '☁️ Открыть синхронизацию';
          btn.addEventListener('click', renderCloudModal);
          actions.appendChild(btn);
          section.appendChild(actions);
          body.appendChild(section);
        } catch(e){}
      }, 80);
      return result;
    };
  }

  async function autoPullOnBoot(){
    var cfg = readConfig();
    if(!cfg.enabled || !cfg.autoPull) return;
    try {
      validateConfig(cfg);
      var env = await pullRemote();
      if(!env) return;
      var meta = readMeta();
      if(meta.lastRemoteAt === env.updatedAt || meta.lastChecksum === env.checksum) return;
      lastRemoteEnvelope = env;
      showIncomingRemoteBanner(env);
    } catch(e){ lastStatus = '⚠️ Auto-pull: ' + (e && e.message || e); }
  }

  function showIncomingRemoteBanner(env){
    if(document.getElementById('wave86w-remote-banner')) return;
    ensureStyle();
    var box = document.createElement('div');
    box.id = 'wave86w-remote-banner';
    box.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0));z-index:10010;max-width:560px;margin:auto;background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:14px;padding:12px;box-shadow:0 10px 28px rgba(0,0,0,.2);font-size:12px;line-height:1.45;color:var(--text,#111827)';
    var text = document.createElement('div');
    text.textContent = statusText(env);
    var actions = document.createElement('div');
    actions.className = 'wave86w-actions';
    var open = document.createElement('button'); open.className = 'wave86w-btn primary'; open.textContent = 'Открыть sync'; open.addEventListener('click', function(){ box.remove(); renderCloudModal(); });
    var close = document.createElement('button'); close.className = 'wave86w-btn'; close.textContent = 'Позже'; close.addEventListener('click', function(){ box.remove(); });
    actions.appendChild(open); actions.appendChild(close); box.appendChild(text); box.appendChild(actions); document.body.appendChild(box);
  }

  function init(){
    if(!isGradePage()) return;
    installHooks();
    enhanceBackupOverlay();
    injectButtons();
    setTimeout(injectButtons, 250);
    setTimeout(injectButtons, 900);
    setTimeout(autoPullOnBoot, 1200);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  root.wave86wCloudSync = {
    version: VERSION,
    readConfig: readConfig,
    saveConfig: saveConfig,
    buildSnapshot: buildSnapshot,
    buildEnvelope: buildEnvelope,
    pushNow: pushNow,
    pullRemote: pullRemote,
    applyRemote: applyRemote,
    open: renderCloudModal,
    auditSnapshot: async function(){
      var cfg = readConfig();
      var snap = null;
      var sum = '';
      try { snap = buildSnapshot(); sum = await checksum(snap); } catch(e){}
      return {
        version: VERSION,
        grade: gradeKey(),
        provider: cfg.provider,
        enabled: !!cfg.enabled,
        hasSupabaseUrl: !!cfg.supabaseUrl,
        hasSupabaseKey: !!cfg.supabaseAnonKey,
        hasFirebaseProject: !!cfg.firebaseProjectId,
        hasFirebaseKey: !!cfg.firebaseApiKey,
        syncId: cfg.syncId ? 'set' : '',
        snapshotReady: !!snap,
        checksum: sum,
        hasPush: typeof pushNow === 'function',
        hasPull: typeof pullRemote === 'function',
        buttonPresent: !!document.getElementById('wave86w-main-cloud-btn'),
        backupPatched: !!root.__wave86wBackupModalPatched,
        cspInlineSafe: true
      };
    }
  };
})();

;/* ---- bundle_error_tracking.js ---- */
(function(){
  var LOG_KEY = 'trainer_runtime_errors_v73';
  var CFG_KEY = 'trainer_runtime_errors_cfg_v73';
  var MAX_DEFAULT = 50;
  var DASHBOARD_CARD_ID = 'wave73-runtime-health';
  var DASHBOARD_SECTION_ID = 'wave73-runtime-health-title';
  var tracker = window.TrainerErrorTracking || {};

  function safeParse(raw, fallback){ if(!raw) return fallback; try{return JSON.parse(raw);}catch(_){return fallback;} }
  function safeGet(key, fallback){ try{return safeParse(localStorage.getItem(key), fallback);}catch(_){return fallback;} }
  function safeSet(key, value){ try{localStorage.setItem(key, JSON.stringify(value));}catch(_){ } }
  function readConfig(){
    var cfg = safeGet(CFG_KEY, {});
    var runtimeCfg = window.__TRAINER_ERROR_TRACKING__ || {};
    var merged = {};
    Object.keys(cfg||{}).forEach(function(key){ merged[key] = cfg[key]; });
    Object.keys(runtimeCfg||{}).forEach(function(key){ merged[key] = runtimeCfg[key]; });
    if(!merged.maxEntries || merged.maxEntries < 1) merged.maxEntries = MAX_DEFAULT;
    if(merged.dashboardCard !== false) merged.dashboardCard = true;
    return merged;
  }
  function writeConfig(patch){ var current = readConfig(); Object.keys(patch||{}).forEach(function(key){ current[key] = patch[key]; }); safeSet(CFG_KEY, current); return current; }
  function getLogs(){ var rows = safeGet(LOG_KEY, []); return Array.isArray(rows) ? rows : []; }
  function setLogs(rows){ safeSet(LOG_KEY, rows); }
  function normalizeEvent(raw){
    return { ts:new Date().toISOString(), page:location.pathname || '/', href:location.href, kind:raw&&raw.kind?raw.kind:'error', message:raw&&raw.message?String(raw.message):'Unknown runtime error', source:raw&&raw.source?String(raw.source):'', line:raw&&raw.line?Number(raw.line)||0:0, column:raw&&raw.column?Number(raw.column)||0:0, stack:raw&&raw.stack?String(raw.stack).slice(0,4000):'', userAgent:navigator.userAgent || '' };
  }
  function pushLog(entry){ var cfg = readConfig(); var rows = getLogs(); rows.push(entry); while(rows.length > cfg.maxEntries){ rows.shift(); } setLogs(rows); return rows; }
  function summarize(rows){ var list = Array.isArray(rows) ? rows : getLogs(); var byKind = {}; var latest = list.length ? list[list.length-1] : null; list.forEach(function(row){ var kind = row && row.kind ? row.kind : 'error'; byKind[kind] = (byKind[kind] || 0) + 1; }); return { total:list.length, byKind:byKind, latest:latest }; }
  function downloadText(name, text, mime){ try{ var blob = new Blob([text], {type:mime || 'application/json;charset=utf-8'}); var href = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(href); }, 0); return true; }catch(_){ return false; } }
  function exportLogs(){ return JSON.stringify({ exportedAt:new Date().toISOString(), summary:summarize(), logs:getLogs() }, null, 2); }
  function flushRemote(entry){ var cfg = readConfig(); if(!cfg.endpoint) return false; var payload = JSON.stringify({ source:'trainer-runtime', entry:entry, summary:summarize() }); try{ if(navigator.sendBeacon){ return navigator.sendBeacon(cfg.endpoint, payload); } }catch(_){ } try{ fetch(cfg.endpoint, { method:'POST', headers:{'content-type':'application/json'}, body:payload, keepalive:true, mode:'cors' }).catch(function(){}); return true; }catch(_){ return false; } }
  function escapeHtml(value){ return String(value == null ? '' : value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function record(raw){ var entry = normalizeEvent(raw || {}); pushLog(entry); flushRemote(entry); renderDashboardCard(); return entry; }
  function clear(){ setLogs([]); renderDashboardCard(); }
  function ensureSection(container){ var section = document.getElementById(DASHBOARD_SECTION_ID); if(section) return section; section = document.createElement('div'); section.id = DASHBOARD_SECTION_ID; section.className = 'section'; section.textContent = 'Стабильность runtime'; container.appendChild(section); return section; }
  function renderDashboardCard(){
    var cfg = readConfig();
    if(!cfg.dashboardCard || !document || !document.body) return;
    var isDashboard = /dashboard\.html(?:$|[?#])/.test(location.pathname) || location.pathname === '/dashboard.html';
    if(!isDashboard) return;
    var wrap = document.querySelector('.w');
    if(!wrap) return;
    var anchor = document.querySelector('.dash-actions') || document.querySelector('.back') || wrap.lastElementChild;
    ensureSection(wrap);
    var card = document.getElementById(DASHBOARD_CARD_ID);
    if(!card){ card = document.createElement('div'); card.id = DASHBOARD_CARD_ID; card.className = 'analytics-note'; if(anchor && anchor.parentNode === wrap) wrap.insertBefore(card, anchor); else wrap.appendChild(card); }
    var summary = summarize(); var latest = summary.latest;
    card.innerHTML = ''
      + '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">'
      + '  <div><b style="display:block;font-size:13px">Локальный журнал ошибок</b><span style="font-size:11px;color:var(--muted)">Хранит последние runtime-события и позволяет выгрузить их в JSON.</span></div>'
      + '  <div style="font-family:JetBrains Mono,monospace;font-size:16px;font-weight:800">' + summary.total + '</div>'
      + '</div>'
      + (latest ? '<div style="margin-top:8px;font-size:11px;line-height:1.45;color:var(--muted)"><b style="color:var(--text)">Последняя ошибка:</b> ' + escapeHtml(latest.message) + '<br><span>' + escapeHtml((latest.kind || 'error') + ' · ' + (latest.ts || '')) + '</span></div>' : '<div style="margin-top:8px;font-size:11px;line-height:1.45;color:var(--muted)">Зафиксированных ошибок пока нет.</div>')
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">'
      + '  <button type="button" id="wave73-export-errors" class="dash-btn" style="flex:1 1 180px">📥 Выгрузить ошибки</button>'
      + '  <button type="button" id="wave73-clear-errors" class="dash-btn" style="flex:1 1 180px">🧹 Очистить журнал</button>'
      + '</div>';
    var exportBtn = document.getElementById('wave73-export-errors');
    var clearBtn = document.getElementById('wave73-clear-errors');
    if(exportBtn){ exportBtn.onclick = function(){ downloadText('trainer-runtime-errors.json', exportLogs(), 'application/json;charset=utf-8'); }; }
    if(clearBtn){ clearBtn.onclick = clear; }
  }
  window.addEventListener('error', function(event){ record({ kind:'error', message:event && event.message, source:event && event.filename, line:event && event.lineno, column:event && event.colno, stack:event && event.error && event.error.stack }); });
  window.addEventListener('unhandledrejection', function(event){ var reason = event && event.reason; record({ kind:'unhandledrejection', message: reason && reason.message ? reason.message : String(reason || 'Unhandled promise rejection'), stack: reason && reason.stack ? reason.stack : '' }); });
  tracker.record = record; tracker.getLogs = getLogs; tracker.getSummary = function(){ return summarize(); }; tracker.clear = clear; tracker.export = exportLogs; tracker.setConfig = writeConfig; tracker.renderDashboardCard = renderDashboardCard; tracker.download = function(){ return downloadText('trainer-runtime-errors.json', exportLogs(), 'application/json;charset=utf-8'); };
  window.TrainerErrorTracking = tracker;
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderDashboardCard, {once:true}); else renderDashboardCard();
})();

;window.__wave86zGradeRuntimeBundle = Object.freeze({wave:'wave86z', bundled:["chunk_roadmap_wave86q_accessibility_theme.js","bundle_grade_after.js","chunk_roadmap_wave86n_progress_tools.js","chunk_roadmap_wave86p_exam_challenge.js","chunk_roadmap_wave86v_pvp_link_battle.js","chunk_roadmap_wave86r_theory_achievements.js","bundle_gamification_xp.js","bundle_gamification_meta.js","bundle_sharing.js","bundle_profile_social.js","chunk_roadmap_wave86w_cloud_sync.js","bundle_error_tracking.js"], generatedAt:'2026-04-22T00:00:00Z'});
