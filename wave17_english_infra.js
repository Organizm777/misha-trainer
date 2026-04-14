(function(){
  if (typeof window === 'undefined') return;
  var gradeNum = +(window.GRADE_NUM || 0);
  if (gradeNum < 2 || gradeNum > 11) return;
  if (typeof SUBJ === 'undefined' || !Array.isArray(SUBJ)) return;

  var TARGETS = {2:2,3:2,4:2,5:4,6:4,7:6,8:8,9:8,10:6,11:12};
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
