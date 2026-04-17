/* --- wave17_english_diag.js --- */
(function(){
  if (typeof window === 'undefined') return;
  if (typeof QBANK === 'undefined' || typeof SUBJECTS === 'undefined') return;

  window.ENGLISH_DIAG_CONFIGS = {
    junior: { grades:[2,3,4], level:'A1', focus:'letters, sounds, first words, simple phrases' },
    basic: { grades:[5,6,7], level:'A2', focus:'to be, Present/Past Simple, modal verbs, everyday vocabulary' },
    middle: { grades:[8,9], level:'B1', focus:'all main tenses, passive, conditionals 0–2, word formation' },
    senior: { grades:[10,11], level:'B2-C1', focus:'mixed tenses, advanced grammar, articles, phrasal verbs, collocations' }
  };

  var EXTRA = [
    {g:2, topic:'A1', q:'Какая буква идёт после C?', opts:['D','B','E','F'], a:'D', hint:'A, B, C, D.'},
    {g:2, topic:'A1', q:'Выбери правильное: “What colour is the sun?”', opts:['yellow','purple','brown','grey'], a:'yellow', hint:'Sun = yellow in basic A1 vocabulary.'},
    {g:3, topic:'A1', q:'“I ___ eight years old.”', opts:['am','is','are','be'], a:'am', hint:'With I we use am.'},
    {g:3, topic:'A1', q:'Закончи фразу: “My name ___ Kate.”', opts:['is','am','are','be'], a:'is', hint:'My name is ...'},
    {g:4, topic:'A1', q:'Выбери правильное: “She ___ got a doll.”', opts:['has','have','is','are'], a:'has', hint:'She/he/it + has got.'},
    {g:4, topic:'A1', q:'Выбери правильный ответ: “Can you swim?”', opts:['Yes, I can.','Yes, I am.','Yes, I do.','Yes, I have.'], a:'Yes, I can.', hint:'Answer to can-question.'},
    {g:5, topic:'A2', q:'Выбери правильное: “They ___ in the park every Sunday.”', opts:['play','plays','are play','played'], a:'play', hint:'They + Present Simple base form.'},
    {g:5, topic:'A2', q:'Как правильно: “We ___ got two cats.”', opts:['have','has','are','is'], a:'have', hint:'We/you/they + have got.'},
    {g:6, topic:'A2', q:'Выбери Future form: “Look at the clouds! It ___ rain.”', opts:['is going to','will','does','has'], a:'is going to', hint:'Visible evidence → going to.'},
    {g:6, topic:'A2', q:'Выбери правильную степень сравнения: “This bag is ___ than that one.”', opts:['bigger','more big','biggest','the bigger'], a:'bigger', hint:'Short adjective → bigger.'},
    {g:7, topic:'A2', q:'Выбери правильное: “There ___ some milk in the fridge.”', opts:['is','are','am','be'], a:'is', hint:'Milk is uncountable → there is.'},
    {g:7, topic:'A2', q:'Выбери модальный глагол: “You ___ be polite to your teacher.”', opts:['must','can','would','did'], a:'must', hint:'Must = strong obligation.'},
    {g:8, topic:'B1', q:'Выбери правильное: “I ___ TV when you called.”', opts:['was watching','watched','have watched','am watching'], a:'was watching', hint:'Interrupted action in the past → Past Continuous.'},
    {g:8, topic:'B1', q:'Выбери артикль: “She wants to become ___ doctor.”', opts:['a','an','the','—'], a:'a', hint:'Doctor starts with a consonant sound.'},
    {g:9, topic:'B1', q:'Выбери условное: “If I ___ more time, I would learn Spanish.”', opts:['had','have','will have','had had'], a:'had', hint:'Second conditional → If + Past Simple.'},
    {g:9, topic:'B1', q:'Passive voice: “The homework ___ tomorrow.”', opts:['will be checked','will check','is checking','checked'], a:'will be checked', hint:'Future passive = will be + V3.'},
    {g:10, topic:'B2', q:'Выбери правильное: “This time tomorrow, I ___ on the train.”', opts:['will be travelling','travel','will travel','have travelled'], a:'will be travelling', hint:'Action in progress at a future moment.'},
    {g:10, topic:'B2', q:'Выбери dependent preposition: “She is interested ___ science.”', opts:['in','on','at','for'], a:'in', hint:'Interested in.'},
    {g:11, topic:'C1', q:'Выбери reported speech: “She said she ___ tired.”', opts:['was','is','has been','will be'], a:'was', hint:'Backshift in reported speech.'},
    {g:11, topic:'C1', q:'Выбери правильное: “Had I known, I ___ earlier.”', opts:['would have left','would leave','left','had left'], a:'would have left', hint:'Conditional inversion → third conditional meaning.'}
  ];

  var existing = Array.isArray(QBANK.english) ? QBANK.english.slice() : [];
  var seen = new Set(existing.map(function(q){ return q.q; }));
  EXTRA.forEach(function(item){ if (!seen.has(item.q)) { existing.push(item); seen.add(item.q); } });
  QBANK.english = existing;

  var subj = (SUBJECTS || []).find(function(s){ return s.id === 'english'; });
  if (subj) {
    subj.sub = '2–11 классы';
    subj.desc = 'A1 → C1: лексика, времена, grammar, exam-style English';
  }

  function mapEngLevel(result){
    var tested = ((result && result.tested) || []).map(function(pair){
      return { grade:+pair[0], ok:+((pair[1]||{}).ok||0), total:+((pair[1]||{}).total||0) };
    }).filter(function(row){ return row.total > 0; });
    if (!tested.length) return { level:'Starter', note:'Пока слишком мало данных для оценки.' };

    var mastered = tested.filter(function(row){ return row.total >= 1 && row.ok / row.total >= 0.6; }).map(function(row){ return row.grade; });
    var highest = mastered.length ? Math.max.apply(Math, mastered) : Math.max.apply(Math, tested.map(function(row){ return row.grade; }));
    var level = highest <= 4 ? 'A1' : highest <= 7 ? 'A2' : highest <= 9 ? 'B1' : highest <= 10 ? 'B2' : 'C1';
    if ((result.pct || 0) < 45) {
      if (level === 'C1') level = 'B2';
      else if (level === 'B2') level = 'B1';
      else if (level === 'B1') level = 'A2';
      else if (level === 'A2') level = 'A1';
    }
    var noteMap = {
      A1: 'База: первые слова, короткие фразы, very basic grammar.',
      A2: 'Школьный фундамент: to be, Present/Past Simple, модальные, everyday vocabulary.',
      B1: 'Уверенный школьный уровень: времена, passive, conditionals 0–2, word formation.',
      B2: 'Сильный уровень: mixed tenses, essay grammar, phrasal verbs, collocations.',
      C1: 'Продвинутый школьный уровень: advanced grammar и уверенный exam-style English.'
    };
    return { level: level, note: noteMap[level] || 'Оценивай прогресс по карте знаний и слабым темам.' };
  }

  var _origShowResult = typeof window.showResult === 'function' ? window.showResult : null;
  if (_origShowResult) {
    window.showResult = function(){
      var out = _origShowResult.apply(this, arguments);
      try {
        if (!window._diagResult || !window._diagResult.subj || window._diagResult.subj.id !== 'english') return out;
        var info = mapEngLevel(window._diagResult);
        var old = document.getElementById('eng-level-block');
        if (old) old.remove();
        var hero = document.querySelector('#s-result .res-hero');
        if (!hero || !hero.parentNode) return out;
        var block = document.createElement('div');
        block.className = 'ins-block';
        block.id = 'eng-level-block';
        block.innerHTML = '<h3>🇬🇧 English level</h3>' +
          '<div style="font-size:26px;font-weight:900;color:#2563eb;margin-bottom:6px">'+ info.level +'</div>' +
          '<p style="font-size:13px;line-height:1.6;color:var(--text);margin-bottom:8px">'+ info.note +'</p>' +
          '<p style="font-size:12px;color:var(--muted)">Уровень оценивается по самым сильным классам, которые ты прошёл в диагностике, и затем слегка корректируется общей точностью. Это не международный сертификат, а полезный ориентир внутри тренажёра.</p>';
        hero.parentNode.insertBefore(block, hero.nextSibling);
        window._diagResult.englishLevel = info.level;
      } catch(_){}
      return out;
    };
  }

  window.__engDiagMeta = {
    count: QBANK.english.length,
    minGrade: Math.min.apply(Math, QBANK.english.map(function(q){ return q.g; })),
    maxGrade: Math.max.apply(Math, QBANK.english.map(function(q){ return q.g; })),
    configs: Object.keys(window.ENGLISH_DIAG_CONFIGS || {})
  };
})();

;
/* --- wave25_diagnostics.js --- */
(function(){
  if (typeof window === 'undefined') return;
  if (!document.getElementById('subj-grid') || typeof SUBJECTS === 'undefined') return;

  var HISTORY_KEY = 'trainer_diag_history_v2';
  var MODE_KEY = 'trainer_diag_mode_v1';
  var MAX_HISTORY = 80;

  var SUBJECT_CONFIGS = {
    math: { track:'База', exams:['ВПР'], badge:'1–6', focus:'арифметика и задачи' },
    algebra: { track:'Core', exams:['ОГЭ','ЕГЭ'], badge:'7–11', focus:'уравнения и функции' },
    geometry: { track:'Core', exams:['ОГЭ','ЕГЭ'], badge:'7–11', focus:'планиметрия и стереометрия' },
    mathall: { track:'Core', exams:['ОГЭ','ЕГЭ'], badge:'3–11', focus:'сквозная математика' },
    physics: { track:'STEM', exams:['ОГЭ','ЕГЭ'], badge:'7–11', focus:'механика и физика' },
    russian: { track:'Обязательный', exams:['ОГЭ','ЕГЭ'], badge:'1–11', focus:'орфография и синтаксис' },
    history: { track:'Гуманитарный', exams:['ОГЭ','ЕГЭ'], badge:'5–11', focus:'хронология и причины' },
    informatics: { track:'STEM', exams:['ОГЭ','ЕГЭ'], badge:'7–11', focus:'алгоритмы и логика' },
    literature: { track:'Гуманитарный', exams:['ОГЭ','ЕГЭ'], badge:'5–11', focus:'авторы и произведения' },
    social: { track:'Гуманитарный', exams:['ОГЭ','ЕГЭ'], badge:'8–11', focus:'право и экономика' },
    biology: { track:'Естественные науки', exams:['ОГЭ','ЕГЭ'], badge:'5–11', focus:'организмы и системы' },
    geography: { track:'Естественные науки', exams:['ОГЭ','ЕГЭ'], badge:'5–11', focus:'карта, климат, страны' },
    english: { track:'Languages', exams:['ОГЭ','ЕГЭ'], badge:'2–11', focus:'grammar, vocabulary, exam English' }
  };

  var MODES = {
    full: { id:'full', label:'Полная', short:'20 / 10', maxQ:20, timeLimit:600, allowSkip:true, strict:false, desc:'20 вопросов · 10 минут' },
    micro:{ id:'micro',label:'Микро', short:'10 / 5', maxQ:10, timeLimit:300, allowSkip:true, strict:false, desc:'10 вопросов · 5 минут' },
    exam: { id:'exam', label:'Экзамен', short:'20 / 8', maxQ:20, timeLimit:480, allowSkip:false, strict:true, desc:'20 вопросов · 8 минут · без пропусков' }
  };

  var EXAM_PACKS = {
    oge: { label:'ОГЭ core', subjects:['mathall','russian','history','social','informatics'], note:'обязательные и частые предметы ОГЭ' },
    ege: { label:'ЕГЭ core', subjects:['mathall','russian','english','history','social','physics'], note:'ядро для старшей школы' },
    eng: { label:'English', subjects:['english'], note:'English level A1 → C1' }
  };

  window.WAVE25_DIAG_SUBJECT_CONFIGS = SUBJECT_CONFIGS;
  window.WAVE25_DIAG_MODES = MODES;

  function safeJSON(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(_) {
      return fallback;
    }
  }

  function loadHistory(){
    var rows = safeJSON(HISTORY_KEY, []);
    if (!Array.isArray(rows)) rows = [];
    rows.sort(function(a,b){ return Number(b.ts||0) - Number(a.ts||0); });
    return rows;
  }

  function saveHistory(rows){
    rows = (rows || []).slice(0, MAX_HISTORY);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(rows)); } catch(_) {}
  }

  function getModeId(){
    var id = null;
    try { id = localStorage.getItem(MODE_KEY) || 'full'; } catch(_) { id = 'full'; }
    if (!MODES[id]) id = 'full';
    return id;
  }

  function getMode(){ return MODES[getModeId()] || MODES.full; }

  function setMode(id){
    if (!MODES[id]) return;
    try { localStorage.setItem(MODE_KEY, id); } catch(_) {}
    renderModeBar();
  }

  function clearHistory(){
    try { localStorage.removeItem(HISTORY_KEY); } catch(_) {}
    renderHistorySummary();
  }

  function fmtSec(sec){
    sec = Math.max(0, Number(sec || 0));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function fmtDate(ts){
    try {
      return new Date(ts).toLocaleDateString('ru-RU', { day:'numeric', month:'short' });
    } catch(_) {
      return '—';
    }
  }

  function trendLabel(delta){
    if (delta === null || typeof delta === 'undefined' || isNaN(delta)) return 'первый замер';
    if (delta > 0) return 'рост +' + delta + '%';
    if (delta < 0) return 'ниже на ' + Math.abs(delta) + '%';
    return 'без изменений';
  }

  function ensureStyle(){
    if (document.getElementById('wave25-diag-style')) return;
    var style = document.createElement('style');
    style.id = 'wave25-diag-style';
    style.textContent = '' +
      '.wave25-mode-wrap{margin-top:14px}.wave25-modebar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}.wave25-chip{border:1.5px solid var(--border);background:var(--card);color:var(--ink);border-radius:999px;padding:8px 12px;font-size:12px;font-weight:700;cursor:pointer}.wave25-chip.active{background:var(--ink);color:var(--bg);border-color:var(--ink)}' +
      '.wave25-subhint{font-size:11px;color:var(--muted);margin-top:8px;line-height:1.45}.wave25-packbar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:10px}.wave25-pack{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:999px;background:var(--card);border:1px solid var(--border);font-size:11px;color:var(--muted)}' +
      '.wave25-cardmeta{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.wave25-pill{display:inline-flex;align-items:center;gap:4px;padding:4px 7px;border-radius:999px;background:var(--bg);border:1px solid var(--border);font-size:9px;font-weight:700;color:var(--muted)}' +
      '.wave25-history-card{background:var(--card);border:1.5px solid var(--border);border-radius:14px;padding:14px 16px;margin:0 0 18px}.wave25-h-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px}.wave25-h-stat{background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:10px 8px;text-align:center}.wave25-h-stat b{display:block;font-family:Unbounded,system-ui,sans-serif;font-size:15px}.wave25-h-stat span{display:block;font-size:10px;color:var(--muted);margin-top:4px}' +
      '.wave25-h-list{display:flex;flex-direction:column;gap:8px}.wave25-h-row{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:10px 0;border-top:1px dashed var(--border)}.wave25-h-row:first-child{border-top:none;padding-top:0}.wave25-h-subj{font-size:12px;font-weight:700}.wave25-h-meta{font-size:10px;color:var(--muted);margin-top:2px}.wave25-h-score{font-family:JetBrains Mono,monospace;font-size:13px;font-weight:800}.wave25-h-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}' +
      '.wave25-btn{flex:1 1 140px;padding:10px 12px;border-radius:10px;border:none;background:var(--ink);color:var(--bg);font-size:12px;font-weight:700;cursor:pointer}.wave25-btn.alt{background:var(--card);color:var(--ink);border:1.5px solid var(--border)}' +
      '.wave25-timer{margin-left:8px;display:inline-flex;align-items:center;justify-content:center;min-width:58px;padding:5px 8px;border-radius:999px;background:var(--card);border:1px solid var(--border);font-family:JetBrains Mono,monospace;font-size:11px;font-weight:800;color:var(--ink)}.wave25-timer.low{color:var(--red);border-color:rgba(220,38,38,.35)}' +
      '.wave25-modepill{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:999px;background:var(--card);border:1px solid var(--border);font-size:10px;color:var(--muted);font-weight:700;margin-left:8px}.wave25-modepill strong{color:var(--ink)}' +
      '.wave25-note{font-size:12px;color:var(--muted);line-height:1.5}.wave25-empty{padding:10px 0 0;color:var(--muted);font-size:12px;text-align:center}.wave25-trend-up{color:var(--green)}.wave25-trend-down{color:var(--red)}.wave25-trend-flat{color:var(--muted)}' +
      '@media (max-width:560px){.wave25-h-grid{grid-template-columns:1fr}.wave25-h-actions .wave25-btn{flex:1 1 100%}}';
    document.head.appendChild(style);
  }

  function ensureModeUi(){
    ensureStyle();
    var intro = document.querySelector('.subj-intro');
    if (intro && !document.getElementById('wave25-mode-wrap')) {
      var wrap = document.createElement('div');
      wrap.id = 'wave25-mode-wrap';
      wrap.className = 'wave25-mode-wrap';
      wrap.innerHTML = '<div class="wave25-modebar" id="wave25-modebar"></div>' +
        '<div class="wave25-subhint" id="wave25-modehint"></div>' +
        '<div class="wave25-packbar" id="wave25-packbar"></div>';
      intro.appendChild(wrap);
    }
    var grid = document.getElementById('subj-grid');
    if (grid && !document.getElementById('wave25-history-card')) {
      var card = document.createElement('div');
      card.id = 'wave25-history-card';
      card.className = 'wave25-history-card';
      grid.parentNode.insertBefore(card, grid.nextSibling);
    }
    renderModeBar();
    renderSubjectMeta();
    renderHistorySummary();
  }

  function renderModeBar(){
    var bar = document.getElementById('wave25-modebar');
    var hint = document.getElementById('wave25-modehint');
    var pack = document.getElementById('wave25-packbar');
    if (!bar || !hint || !pack) return;
    var active = getModeId();
    bar.innerHTML = Object.keys(MODES).map(function(id){
      var mode = MODES[id];
      return '<button class="wave25-chip' + (id === active ? ' active' : '') + '" onclick="wave25Diag.setMode(\'' + id + '\')">' + mode.label + ' · ' + mode.short + '</button>';
    }).join('');
    hint.textContent = (MODES[active] && MODES[active].desc) || '';
    pack.innerHTML = Object.keys(EXAM_PACKS).map(function(key){
      var item = EXAM_PACKS[key];
      return '<span class="wave25-pack"><b>' + item.label + '</b><span>' + item.note + '</span></span>';
    }).join('');
  }

  function renderSubjectMeta(){
    var cards = document.querySelectorAll('#subj-grid .scard');
    if (!cards.length || !window.SUBJECTS) return;
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var subj = window.SUBJECTS[i];
      if (!subj || card.querySelector('.wave25-cardmeta')) continue;
      var cfg = SUBJECT_CONFIGS[subj.id];
      if (!cfg) continue;
      var meta = document.createElement('div');
      meta.className = 'wave25-cardmeta';
      var pills = [];
      pills.push('<span class="wave25-pill">🎯 ' + cfg.track + '</span>');
      pills.push('<span class="wave25-pill">📚 ' + cfg.badge + '</span>');
      if (cfg.exams && cfg.exams.length) pills.push('<span class="wave25-pill">🏁 ' + cfg.exams.join(' / ') + '</span>');
      meta.innerHTML = pills.join('');
      var desc = card.querySelector('.scard-desc');
      if (desc) desc.parentNode.insertBefore(meta, desc.nextSibling);
      else card.appendChild(meta);
    }
  }

  function getLastEntry(){
    var rows = loadHistory();
    return rows.length ? rows[0] : null;
  }

  function renderHistorySummary(){
    var root = document.getElementById('wave25-history-card');
    if (!root) return;
    var rows = loadHistory();
    if (!rows.length) {
      root.innerHTML = '<div class="hdr-title" style="font-size:12px;margin-bottom:6px">История диагностик</div><div class="wave25-empty">Пока пусто. Пройди первую диагностику — здесь появятся результаты, динамика и быстрый повтор.</div>';
      return;
    }
    var last = rows[0];
    var last30 = rows.filter(function(row){ return Number(row.ts || 0) >= Date.now() - 30 * 86400000; });
    var avg30 = last30.length ? Math.round(last30.reduce(function(sum,row){ return sum + Number(row.pct || 0); }, 0) / last30.length) : Number(last.pct || 0);
    var best = rows.slice().sort(function(a,b){ return Number(b.pct || 0) - Number(a.pct || 0); })[0];
    root.innerHTML = '<div class="hdr-title" style="font-size:12px;margin-bottom:10px">История диагностик</div>' +
      '<div class="wave25-h-grid">' +
        '<div class="wave25-h-stat"><b>' + rows.length + '</b><span>всего попыток</span></div>' +
        '<div class="wave25-h-stat"><b>' + avg30 + '%</b><span>среднее за 30 дней</span></div>' +
        '<div class="wave25-h-stat"><b>' + (best ? best.subjectName : '—') + '</b><span>лучший предмет</span></div>' +
      '</div>' +
      '<div class="wave25-h-list">' + rows.slice(0, 5).map(function(row){
        var delta = row.deltaFromPrev;
        var cls = delta > 0 ? 'wave25-trend-up' : delta < 0 ? 'wave25-trend-down' : 'wave25-trend-flat';
        return '<div class="wave25-h-row">' +
          '<div><div class="wave25-h-subj">' + row.subjectName + '</div><div class="wave25-h-meta">' + fmtDate(row.ts) + ' · ' + row.modeLabel + ' · ' + trendLabel(delta) + '</div></div>' +
          '<div class="wave25-h-score ' + cls + '">' + row.pct + '%</div>' +
        '</div>';
      }).join('') + '</div>' +
      '<div class="wave25-h-actions">' +
        '<button class="wave25-btn" onclick="wave25Diag.repeatLast()">↻ Повторить последний предмет</button>' +
        '<button class="wave25-btn alt" onclick="wave25Diag.clearHistory()">Очистить историю</button>' +
      '</div>';
  }

  function repeatLast(){
    var last = getLastEntry();
    if (!last || !last.subjectId || typeof startDiag !== 'function') return;
    setMode(last.modeId || 'full');
    startDiag(last.subjectId);
  }

  function ensureTimerUi(){
    var prog = document.getElementById('q-prog');
    if (prog && !document.getElementById('wave25-timer-pill')) {
      var pill = document.createElement('span');
      pill.id = 'wave25-timer-pill';
      pill.className = 'wave25-timer';
      pill.textContent = fmtSec((getMode().timeLimit || 0));
      prog.parentNode.appendChild(pill);
    }
    var sub = document.getElementById('quiz-subj-sub');
    if (sub && !document.getElementById('wave25-mode-pill')) {
      var mp = document.createElement('span');
      mp.id = 'wave25-mode-pill';
      mp.className = 'wave25-modepill';
      mp.innerHTML = '<strong>' + getMode().label + '</strong>';
      sub.parentNode.appendChild(mp);
    }
  }

  function updateTimerUi(){
    ensureTimerUi();
    var pill = document.getElementById('wave25-timer-pill');
    var mp = document.getElementById('wave25-mode-pill');
    var session = window.__wave25DiagSession || null;
    var mode = getMode();
    if (mp) mp.innerHTML = '<strong>' + mode.label + '</strong> · ' + mode.short;
    if (!pill) return;
    var left = session && typeof session.remaining === 'number' ? session.remaining : mode.timeLimit;
    pill.textContent = fmtSec(left);
    pill.className = 'wave25-timer' + (left <= 60 ? ' low' : '');
  }

  function stopTimer(){
    var session = window.__wave25DiagSession;
    if (session && session.timerId) {
      clearInterval(session.timerId);
      session.timerId = null;
    }
  }

  function startTimer(){
    stopTimer();
    var session = window.__wave25DiagSession;
    if (!session) return;
    session.remaining = Math.max(0, Number(session.timeLimit || 0));
    updateTimerUi();
    session.timerId = setInterval(function(){
      var spent = Math.floor((Date.now() - session.startedAt) / 1000);
      session.remaining = Math.max(0, Number(session.timeLimit || 0) - spent);
      updateTimerUi();
      if (session.remaining <= 0) {
        stopTimer();
        session.timedOut = true;
        if (document.getElementById('s-quiz') && document.getElementById('s-quiz').classList.contains('on')) {
          try { showResult(); } catch(_) {}
        }
      }
    }, 1000);
  }

  function recentSameSubject(rows, subjectId){
    return rows.filter(function(row){ return row.subjectId === subjectId; }).slice(0, 4);
  }

  function uniqueGapTopics(result){
    var out = [];
    (result.gaps || []).forEach(function(pair){
      var data = pair[1] || {};
      (data.topics || []).forEach(function(topic){ if (out.indexOf(topic) === -1) out.push(topic); });
    });
    return out;
  }

  function saveEntryFromResult(result){
    var rows = loadHistory();
    var session = window.__wave25DiagSession || {};
    var prev = null;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].subjectId === result.subj.id) { prev = rows[i]; break; }
    }
    var mode = MODES[session.modeId] || getMode();
    var testedGrades = (result.tested || []).map(function(pair){ return Number(pair[0]); }).filter(function(v){ return !isNaN(v); });
    var gapGrades = (result.gaps || []).map(function(pair){ return Number(pair[0]); }).filter(function(v){ return !isNaN(v); });
    var strongGrades = (result.strong || []).map(function(pair){ return Number(pair[0]); }).filter(function(v){ return !isNaN(v); });
    var gapTopics = uniqueGapTopics(result);
    var entry = {
      ts: Date.now(),
      date: new Date().toISOString(),
      subjectId: result.subj.id,
      subjectName: result.subj.name,
      modeId: mode.id,
      modeLabel: mode.label,
      totalQ: Number(result.totalQ || 0),
      totalOk: Number(result.totalOk || 0),
      pct: Number(result.pct || 0),
      testedGrades: testedGrades,
      gapGrades: gapGrades,
      strongGrades: strongGrades,
      gapTopics: gapTopics.slice(0, 6),
      englishLevel: result.englishLevel || null,
      elapsedSec: session.startedAt ? Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000)) : null,
      timeLimit: Number(session.timeLimit || mode.timeLimit || 0),
      timedOut: !!session.timedOut,
      examTags: (SUBJECT_CONFIGS[result.subj.id] && SUBJECT_CONFIGS[result.subj.id].exams) || [],
      deltaFromPrev: prev ? Number(result.pct || 0) - Number(prev.pct || 0) : null
    };
    rows.unshift(entry);
    saveHistory(rows);
    return { entry: entry, prev: prev, sameSubject: recentSameSubject(rows, result.subj.id) };
  }

  function ensureResultBlocks(){
    var rec = document.getElementById('rec-block');
    if (!rec || !rec.parentNode) return;
    if (!document.getElementById('wave25-delta-block')) {
      var delta = document.createElement('div');
      delta.id = 'wave25-delta-block';
      delta.className = 'ins-block';
      delta.innerHTML = '<h3>📈 Динамика</h3><div id="wave25-delta-list"></div>';
      rec.parentNode.insertBefore(delta, rec.nextSibling);
    }
    if (!document.getElementById('wave25-history-block')) {
      var hist = document.createElement('div');
      hist.id = 'wave25-history-block';
      hist.className = 'ins-block';
      hist.innerHTML = '<h3>🗂 Последние попытки по предмету</h3><div id="wave25-history-list"></div>';
      var anchor = document.getElementById('wave25-delta-block');
      anchor.parentNode.insertBefore(hist, anchor.nextSibling);
    }
  }

  function renderResultEnhancements(state){
    if (!state || !state.entry) return;
    ensureResultBlocks();
    var deltaRoot = document.getElementById('wave25-delta-list');
    var histRoot = document.getElementById('wave25-history-list');
    if (!deltaRoot || !histRoot) return;
    var entry = state.entry;
    var prev = state.prev;
    var delta = entry.deltaFromPrev;
    var deltaCls = delta > 0 ? 'wave25-trend-up' : delta < 0 ? 'wave25-trend-down' : 'wave25-trend-flat';
    var deltaText = prev ? ('Относительно прошлой попытки: <b class="' + deltaCls + '">' + (delta > 0 ? '+' : '') + delta + '%</b>.') : 'Это первый замер по предмету — отсюда начнётся история роста.';
    var timeText = entry.elapsedSec != null ? (fmtSec(entry.elapsedSec) + ' из ' + fmtSec(entry.timeLimit)) : '—';
    var gapText = entry.gapTopics && entry.gapTopics.length ? entry.gapTopics.join(', ') : 'крупных пробелов не найдено';
    var modeNote = entry.modeId === 'exam' ? 'Строгий режим: без пропусков и без подсказок.' : entry.modeId === 'micro' ? 'Короткий формат для быстрой проверки перед уроком.' : 'Полный формат для карты знаний по классам.';
    deltaRoot.innerHTML = '' +
      '<div class="ins-row"><span>🕒</span><div><b>Режим:</b> ' + entry.modeLabel + '. ' + modeNote + '<br><span class="wave25-note">Время: ' + timeText + (entry.timedOut ? ' · лимит вышел' : '') + '</span></div></div>' +
      '<div class="ins-row"><span>📈</span><div>' + deltaText + '<br><span class="wave25-note">Сейчас стоит добить: ' + gapText + '.</span></div></div>' +
      '<div class="ins-row"><span>🗂</span><div>Результат сохранён в историю диагностик и появится в родительской панели.</div></div>';
    histRoot.innerHTML = state.sameSubject.map(function(row){
      var cls = row.deltaFromPrev > 0 ? 'wave25-trend-up' : row.deltaFromPrev < 0 ? 'wave25-trend-down' : 'wave25-trend-flat';
      return '<div class="wave25-h-row">' +
        '<div><div class="wave25-h-subj">' + fmtDate(row.ts) + ' · ' + row.modeLabel + '</div><div class="wave25-h-meta">' + (row.gapTopics && row.gapTopics.length ? 'Темы: ' + row.gapTopics.slice(0, 3).join(', ') : 'Без крупных пробелов') + '</div></div>' +
        '<div class="wave25-h-score ' + cls + '">' + row.pct + '%</div>' +
      '</div>';
    }).join('');
  }

  function setDiagShellState(mode){
    try {
      if (!document.body) return;
      document.body.setAttribute('data-trainer-screen', mode === 'immersive' ? 'immersive' : 'browse');
    } catch(_) {}
  }

  function patchStart(){
    if (window.__wave25DiagPatchedStart || typeof window.startDiag !== 'function') return;
    var original = window.startDiag;
    window.startDiag = function(subjId){
      window.__wave25DiagSaved = false;
      window.__wave25DiagSession = null;
      original.apply(this, arguments);
      var mode = getMode();
      if (typeof questions !== 'undefined' && Array.isArray(questions) && questions.length > mode.maxQ) {
        questions = questions.slice(0, mode.maxQ);
      }
      window.__wave25DiagSession = {
        subjId: subjId,
        modeId: mode.id,
        startedAt: Date.now(),
        timeLimit: mode.timeLimit,
        maxQ: mode.maxQ,
        timedOut: false,
        timerId: null,
        allowSkip: mode.allowSkip
      };
      if (typeof qIndex !== 'undefined') qIndex = 0;
      if (typeof window.renderQ === 'function') window.renderQ();
      startTimer();
      renderHistorySummary();
      setDiagShellState('immersive');
    };
    window.__wave25DiagPatchedStart = true;
  }

  function patchRender(){
    if (window.__wave25DiagPatchedRender || typeof window.renderQ !== 'function') return;
    var original = window.renderQ;
    window.renderQ = function(){
      var out = original.apply(this, arguments);
      ensureModeUi();
      ensureTimerUi();
      updateTimerUi();
      var skip = document.getElementById('skip-btn');
      var mode = getMode();
      if (skip) skip.style.display = mode.allowSkip ? 'block' : 'none';
      setDiagShellState('immersive');
      return out;
    };
    window.__wave25DiagPatchedRender = true;
  }

  function patchSelectOpt(){
    if (window.__wave25DiagPatchedSelect || typeof window.selectOpt !== 'function') return;
    var original = window.selectOpt;
    window.selectOpt = function(btn, chosen, correct, hint){
      var mode = getMode();
      var out = original.call(this, btn, chosen, correct, mode.strict ? 'Разбор — после результата.' : hint);
      if (mode.strict) {
        var box = document.getElementById('hint-box');
        if (box) {
          box.textContent = '';
          box.className = 'hint-box';
        }
      }
      return out;
    };
    window.__wave25DiagPatchedSelect = true;
  }

  function patchSkip(){
    if (window.__wave25DiagPatchedSkip || typeof window.skipQ !== 'function') return;
    var original = window.skipQ;
    window.skipQ = function(){
      if (!getMode().allowSkip) return;
      return original.apply(this, arguments);
    };
    window.__wave25DiagPatchedSkip = true;
  }

  function patchGo(){
    if (window.__wave25DiagPatchedGo || typeof window.go !== 'function') return;
    var original = window.go;
    window.go = function(id){
      if (id !== 'quiz') stopTimer();
      if (id === 'select' || id === 'res') setDiagShellState('browse');
      else if (id === 'quiz') setDiagShellState('immersive');
      return original.apply(this, arguments);
    };
    window.__wave25DiagPatchedGo = true;
  }

  function patchShowResult(){
    if (window.__wave25DiagPatchedResult || typeof window.showResult !== 'function') return;
    var original = window.showResult;
    window.showResult = function(){
      stopTimer();
      var out = original.apply(this, arguments);
      try {
        if (!window.__wave25DiagSaved && window._diagResult && window._diagResult.subj) {
          var state = saveEntryFromResult(window._diagResult);
          window.__wave25DiagSaved = true;
          renderHistorySummary();
          renderResultEnhancements(state);
          try { window.dispatchEvent(new CustomEvent('wave25-diagnostic-saved', { detail: state.entry })); } catch(_) {}
        }
      } catch(_) {}
      setDiagShellState('browse');
      return out;
    };
    window.__wave25DiagPatchedResult = true;
  }

  function init(){
    ensureModeUi();
    patchStart();
    patchRender();
    patchSelectOpt();
    patchSkip();
    patchGo();
    patchShowResult();
    updateTimerUi();
    setDiagShellState('browse');
  }

  window.wave25Diag = {
    setMode: setMode,
    getModeId: getModeId,
    getMode: getMode,
    getHistory: loadHistory,
    clearHistory: clearHistory,
    repeatLast: repeatLast,
    subjectConfigs: SUBJECT_CONFIGS,
    modes: MODES,
    historyKey: HISTORY_KEY
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();

