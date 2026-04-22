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
