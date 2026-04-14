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
    if(document.getElementById(THEME_BTN_ID)) return;
    const btn = document.createElement('button');
    btn.id = THEME_BTN_ID;
    btn.type = 'button';
    btn.setAttribute('data-theme-cycle', '1');
    btn.addEventListener('click', cycleTheme);
    (document.body || document.documentElement).appendChild(btn);
    syncThemeButton();
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
    window.alert = function(msg){
      const text = String(msg == null ? '' : msg);
      if(text && text.length <= 96 && !/[\n\r]/.test(text)){
        const kind = /ошиб|невер|не удалось|не найден|нельзя/i.test(text) ? 'error' : /оффлайн|вниман/i.test(text) ? 'warn' : 'info';
        showToast(text, kind, 2400);
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
    window.addEventListener('error', function(){ showToast('Что-то пошло не так. Попробуй ещё раз.', 'error', 2600); });
    window.addEventListener('unhandledrejection', function(){ showToast('Не удалось завершить действие.', 'error', 2600); });
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
    const barWidth = goal ? Math.min(100, Math.round((Math.min(qn, goal) / goal) * 100)) : 0;
    const favBtn = (cS && cT && !globalMix && !mix && !diagMode && !rushMode)
      ? `<button type="button" class="wave21-iconbtn ${isFav(cS.id, cT.id) ? 'alt' : ''}" onclick="wave21ToggleFavorite()">${isFav(cS.id, cT.id) ? '★ В избранном' : '☆ В избранное'}</button>`
      : '';
    const restartBtn = (window.__wave21LastSessionErrors && window.__wave21LastSessionErrors.length && currentScreenId()==='s-play' && !rushMode)
      ? `<button type="button" class="wave21-iconbtn good" onclick="wave21RepeatSessionErrors()">🔁 Ошибки</button>`
      : '';
    const label = goal
      ? `Вопрос ${Math.max(1, qn)} из ${goal}`
      : `Вопрос ${Math.max(1, qn)}`;
    const sub = goal && !diagMode && !rushMode
      ? `Мини-сессия на ${goal} вопросов. После ${goal}-го вопроса можно завершить и оценить прогресс.`
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
        ${goal ? `<div class="pgbar"><div class="pgfill" style="width:${barWidth}%;background:${diagMode ? 'var(--orange)' : 'var(--accent)'}"></div></div>` : ''}
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
    return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
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

  function setLandmarks(){
    const header = document.querySelector('header');
    if(header) header.setAttribute('role', 'banner');
    const footer = document.querySelector('footer');
    if(footer) footer.setAttribute('role', 'contentinfo');

    let main = document.getElementById(MAIN_ID) || document.querySelector('main');
    if(!main){
      main = document.querySelector('.scr.on .w') || document.querySelector('.scr.active .w') || document.querySelector('body > .w') || document.querySelector('body > div:not(.skip-link):not([id="'+LIVE_ID+'"])');
    }
    if(main && main !== document.body){
      if(!main.id) main.id = MAIN_ID;
      main.setAttribute('role', 'main');
      main.tabIndex = main.tabIndex || -1;
    }

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
      :root{--wave24-nav-base-h:60px}
      body{overflow-x:hidden}
      body.wave24-mobile-shell{padding-bottom:calc(var(--wave24-nav-base-h) + 18px + env(safe-area-inset-bottom,0)) !important;}
      body.wave24-save-data, body.wave24-save-data button, body.wave24-save-data input, body.wave24-save-data select, body.wave24-save-data textarea{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif !important;}
      body.wave24-mobile-shell header,body.wave24-mobile-shell .header{background:var(--bg,#f5f3ee)!important;color:var(--text,#1a1a2e)!important;border-bottom:1px solid var(--border,#e2e0d8)}
      body.wave24-mobile-shell header h1,body.wave24-mobile-shell header p,body.wave24-mobile-shell .header h1,body.wave24-mobile-shell .header p{color:inherit!important}
      @media (max-width: 1023px){
        html,body{overscroll-behavior-y:contain;scroll-padding-top:calc(72px + env(safe-area-inset-top,0));}
      }
      .wave24-install-btn{position:fixed;right:12px;bottom:calc(var(--wave24-nav-base-h) + 18px + env(safe-area-inset-bottom,0));z-index:9998;display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border:none;border-radius:999px;background:var(--text,#1a1a2e);color:#fff;font:700 12px/1.2 'Golos Text',system-ui,sans-serif;box-shadow:0 12px 28px rgba(0,0,0,.22);cursor:pointer;-webkit-appearance:none;touch-action:manipulation}
      .wave24-install-btn:active{transform:scale(.98)}
      .wave24-install-btn[hidden]{display:none!important}
      .wave24-bottom-nav{position:fixed;left:0;right:0;bottom:0;z-index:9997;display:flex;gap:8px;align-items:stretch;height:calc(var(--wave24-nav-base-h) + env(safe-area-inset-bottom,0));min-height:calc(var(--wave24-nav-base-h) + env(safe-area-inset-bottom,0));padding:6px 12px calc(6px + env(safe-area-inset-bottom,0));background:rgba(245,243,238,.96);backdrop-filter:blur(14px);border-top:1px solid var(--border,#e2e0d8);box-shadow:0 -8px 28px rgba(0,0,0,.08)}
      html[data-theme="dark"] .wave24-bottom-nav{background:rgba(20,20,32,.96)}
      .wave24-bottom-nav a,.wave24-bottom-nav button{flex:1;min-width:0;min-height:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:6px 6px;border:none;border-radius:14px;background:transparent;color:var(--muted,#6b6a74);font:700 11px/1.1 'Golos Text',system-ui,sans-serif;text-decoration:none;cursor:pointer;-webkit-appearance:none;touch-action:manipulation}
      .wave24-bottom-nav .wave24-ic{font-size:18px;line-height:1}
      .wave24-bottom-nav .is-active{background:var(--abg,#dbeafe);color:var(--accent,#2563eb)}
      .wave24-bottom-nav .is-quiet{opacity:.75}
      .wave24-mobile-tip{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--wave24-nav-base-h) + 18px + env(safe-area-inset-bottom,0));z-index:9996;background:var(--card,#fff);color:var(--muted,#6b6a74);border:1px solid var(--border,#e2e0d8);border-radius:999px;padding:8px 12px;font:600 11px/1.2 'Golos Text',system-ui,sans-serif;box-shadow:0 10px 24px rgba(0,0,0,.08);opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease}
      .wave24-mobile-tip.show{opacity:1;transform:translateX(-50%) translateY(-4px)}
      .wave24-has-bottom-nav .w{padding-bottom:calc(22px + env(safe-area-inset-bottom,0));}
      .wave24-has-bottom-nav header,.wave24-has-bottom-nav .header{padding-right:max(16px, env(safe-area-inset-right,0));padding-left:max(16px, env(safe-area-inset-left,0));}
      @media (max-width: 1023px){
        body.wave24-mobile-shell .w{padding-left:max(14px, env(safe-area-inset-left,0));padding-right:max(14px, env(safe-area-inset-right,0));}
        body.wave24-mobile-shell header{padding-left:max(14px, env(safe-area-inset-left,0));padding-right:max(14px, env(safe-area-inset-right,0));}
        #wave21-main-actions .btn,#wave22-dashboard-actions .btn{min-height:46px}
      }
      @media (min-width: 768px){
        body.wave24-mobile-shell{padding-bottom:calc(var(--wave24-nav-base-h) + 24px + env(safe-area-inset-bottom,0)) !important;}
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
        .wave24-bottom-nav,.wave24-install-btn,.wave24-mobile-tip{display:none !important}
        body.wave24-mobile-shell{padding-bottom:env(safe-area-inset-bottom,0) !important;}
      }
      @media (orientation: landscape) and (max-height: 560px){
        .wave24-bottom-nav{padding-top:6px;padding-bottom:calc(6px + env(safe-area-inset-bottom,0));}
        .wave24-bottom-nav a,.wave24-bottom-nav button{padding:6px 6px;font-size:10px}
        .wave24-bottom-nav .wave24-ic{font-size:16px}
        .wave24-install-btn{bottom:calc(74px + env(safe-area-inset-bottom,0));padding:8px 12px}
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

  function navItems(){
    switch(pageType()){
      case 'grade':
        return [
          { key:'home', icon:'🏠', label:'Главная', action:()=>window.go && window.go('main') },
          { key:'progress', icon:'📈', label:'Прогресс', action:()=>window.go && window.go('prog') },
          { key:'profile', icon:'👤', label:'Профиль', action:()=>window.showHallOfFame && window.showHallOfFame() },
          { key:'classes', icon:'🏫', label:'Классы', action:()=>window.showClassSelect && window.showClassSelect() },
        ];
      case 'dashboard':
        return [
          { key:'home', icon:'🏠', label:'Главная', href:'index.html' },
          { key:'diagnostic', icon:'📝', label:'Диагностика', href:'diagnostic.html' },
          { key:'tests', icon:'🧠', label:'Тесты', href:'tests.html' },
          { key:'dashboard', icon:'📊', label:'Дашборд', href:'dashboard.html' },
        ];
      case 'diagnostic':
        return [
          { key:'home', icon:'🏠', label:'Главная', href:'index.html' },
          { key:'diagnostic', icon:'📝', label:'Диагностика', href:'diagnostic.html' },
          { key:'tests', icon:'🧠', label:'Тесты', href:'tests.html' },
          { key:'dashboard', icon:'📊', label:'Дашборд', href:'dashboard.html' },
        ];
      case 'tests':
        return [
          { key:'home', icon:'🏠', label:'Главная', href:'index.html' },
          { key:'diagnostic', icon:'📝', label:'Диагностика', href:'diagnostic.html' },
          { key:'tests', icon:'🧠', label:'Тесты', href:'tests.html' },
          { key:'dashboard', icon:'📊', label:'Дашборд', href:'dashboard.html' },
        ];
      default:
        return [
          { key:'home', icon:'🏠', label:'Главная', href:'index.html' },
          { key:'diagnostic', icon:'📝', label:'Диагностика', href:'diagnostic.html' },
          { key:'tests', icon:'🧠', label:'Тесты', href:'tests.html' },
          { key:'dashboard', icon:'📊', label:'Дашборд', href:'dashboard.html' },
        ];
    }
  }

  function createNavNode(item){
    const node = item.href ? document.createElement('a') : document.createElement('button');
    node.className = 'wave24-nav-item';
    node.dataset.key = item.key;
    if(item.href) node.href = item.href;
    else node.type = 'button';
    node.innerHTML = `<span class="wave24-ic" aria-hidden="true">${item.icon}</span><span class="wave24-tx">${item.label}</span>`;
    if(item.action) node.addEventListener('click', item.action);
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
      if(el.dataset.key === active) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
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
      if(typeof window.showToast === 'function') window.showToast('Можно установить на главный экран');
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
    const show = !!state.installPrompt && compact() && !standalone();
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
    btn.hidden = !show;
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
