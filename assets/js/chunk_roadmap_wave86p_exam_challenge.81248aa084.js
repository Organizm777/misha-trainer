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
