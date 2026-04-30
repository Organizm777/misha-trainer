/* wave91e: merged learning formats runtime */
/* wave91e: learning formats pack — explain-to-friend, pomodoro, exam countdown, Anki import export */
(function(){
  'use strict';
  var WAVE = 'wave91e';
  var STYLE_ID = 'wave91e-learning-formats-style';
  var timers = { pomodoro: null, boot: null };
  function isSimpleMode(){
    try {
      var raw = localStorage.getItem('trainer_ui_mode');
      raw = String(raw == null ? '' : raw).trim().toLowerCase();
      if (raw === 'full') return false;
      if (raw === 'simple' || raw === '') return true;
    } catch(_){ return true; }
    try {
      return !!((document.body && document.body.classList && document.body.classList.contains('simple-mode')) ||
        (document.documentElement && document.documentElement.classList && document.documentElement.classList.contains('simple-mode')));
    } catch(_){ return true; }
  }
  function removeIf(id){ try { var el = document.getElementById(id); if (el && el.parentNode) el.parentNode.removeChild(el); } catch(_){} }

  function gradeKey(){ try { return String(window.GRADE_NUM || window.GRADE_NO || '10'); } catch(_){ return '10'; } }
  function now(){ return Date.now ? Date.now() : +new Date(); }
  function esc(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function stripTags(html){
    return String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function readJSON(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch(_){ return fallback; }
  }
  function writeJSON(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(_){ }
  }
  function toast(message){
    try {
      var old = document.querySelector('.wave91e-toast');
      if (old) old.remove();
      var el = document.createElement('div');
      el.className = 'wave91e-toast';
      el.setAttribute('role', 'status');
      el.textContent = String(message || '');
      document.body.appendChild(el);
      requestAnimationFrame(function(){ el.classList.add('show'); });
      setTimeout(function(){ if (el && el.parentNode) el.remove(); }, 2600);
    } catch(_){ }
  }
  function downloadText(filename, text, mime){
    try {
      var blob = new Blob([String(text || '')], { type: mime || 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function(){ URL.revokeObjectURL(url); if (a && a.parentNode) a.remove(); }, 500);
      return true;
    } catch(err){
      try { console.warn('[wave91e] download failed', err); } catch(_){ }
      return false;
    }
  }

  function injectStyle(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave91e-card{margin:10px 0;padding:14px;border:1px solid var(--border);border-radius:18px;background:var(--card);box-shadow:0 10px 28px rgba(15,23,42,.06)}',
      '.wave91e-card h3{margin:0 0 6px;font-family:Unbounded,system-ui,sans-serif;font-size:14px;font-weight:900}',
      '.wave91e-sub{font-size:12px;line-height:1.45;color:var(--muted);margin-bottom:10px}',
      '.wave91e-actions{display:flex;gap:8px;flex-wrap:wrap}',
      '.wave91e-btn{border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);font-family:Golos Text,system-ui,sans-serif;font-size:12px;font-weight:850;padding:9px 11px;cursor:pointer}',
      '.wave91e-btn.primary{border-color:transparent;background:var(--accent);color:#fff}',
      '.wave91e-btn.good{border-color:transparent;background:var(--green);color:#fff}',
      '.wave91e-btn.warn{border-color:transparent;background:var(--orange);color:#fff}',
      '.wave91e-btn.danger{border-color:transparent;background:var(--red);color:#fff}',
      '.wave91e-mono{font-family:JetBrains Mono,ui-monospace,Menlo,Consolas,monospace;font-weight:900}',
      '.wave91e-timer{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}',
      '.wave91e-time{font-size:24px;color:var(--accent)}',
      '.wave91e-progress{height:8px;border-radius:999px;background:var(--border);overflow:hidden;margin:8px 0 10px}',
      '.wave91e-progress>span{display:block;height:100%;width:0;background:var(--accent);transition:width .25s ease}',
      '.wave91e-mini{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:999px;padding:5px 9px;font-size:11px;font-weight:900;background:var(--card);color:var(--muted)}',
      '.wave91e-play-host{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}',
      '.wave91e-explain-card{margin:8px 0 10px;padding:10px;border:1px dashed var(--border);border-radius:14px;background:var(--abg)}',
      '.wave91e-modal{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.55)}',
      '.wave91e-dialog{width:min(560px,100%);max-height:88vh;overflow:auto;border-radius:18px;background:var(--card);color:var(--text);border:1px solid var(--border);box-shadow:0 24px 70px rgba(0,0,0,.28);padding:18px}',
      '.wave91e-dialog h3{font-family:Unbounded,system-ui,sans-serif;font-size:16px;margin:0 0 8px}',
      '.wave91e-dialog textarea{width:100%;min-height:130px;resize:vertical;border:1px solid var(--border);border-radius:14px;background:var(--bg);color:var(--text);padding:12px;font-family:Golos Text,system-ui,sans-serif;font-size:14px;line-height:1.45;box-sizing:border-box}',
      '.wave91e-model{margin:10px 0;padding:12px;border-radius:14px;background:var(--gbg);color:var(--text);font-size:13px;line-height:1.5}',
      '.wave91e-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}',
      '.wave91e-toast{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0));transform:translateX(-50%) translateY(14px);z-index:100001;max-width:min(440px,calc(100vw - 28px));padding:12px 14px;border-radius:16px;background:var(--text);color:var(--bg);font-weight:900;font-size:13px;box-shadow:0 14px 34px rgba(0,0,0,.24);opacity:0;pointer-events:none}',
      '.wave91e-toast.show{animation:wave91eToast 2.5s ease forwards}',
      '@keyframes wave91eToast{0%{opacity:0;transform:translateX(-50%) translateY(14px) scale(.96)}14%,84%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(8px) scale(.98)}}',
      'body.simple-mode .wave91e-card,html.simple-mode .wave91e-card,body.simple-mode .wave91e-mini,html.simple-mode .wave91e-mini,body.simple-mode .wave91e-explain-card,html.simple-mode .wave91e-explain-card,body.simple-mode .wave91e-play-host,html.simple-mode .wave91e-play-host{display:none!important}',
      '@media(max-width:520px){.wave91e-grid{grid-template-columns:1fr}.wave91e-actions{display:grid;grid-template-columns:1fr 1fr}.wave91e-btn{width:100%}}',
      '@media(prefers-reduced-motion:reduce){.wave91e-toast.show{animation:none;opacity:1}.wave91e-progress>span{transition:none}}'
    ].join('\n');
    var head = document.head || (document.querySelector && document.querySelector('head')) || document.documentElement || document.body;
    if (head && head.appendChild) head.appendChild(style);
  }

  function pomodoroKey(){ return 'trainer_pomodoro_wave91e_' + gradeKey(); }
  function defaultPomodoro(){ return { running:false, mode:'focus', durationSec:25*60, startedAt:0, endAt:0, completed:0, totalFocusSec:0, history:[] }; }
  function readPomodoro(){
    var state = Object.assign(defaultPomodoro(), readJSON(pomodoroKey(), {}));
    if (!Array.isArray(state.history)) state.history = [];
    if (state.running && now() >= Number(state.endAt || 0)) {
      var dur = Number(state.durationSec || 0) || 0;
      state.running = false;
      if (state.mode === 'focus') {
        state.completed = (Number(state.completed) || 0) + 1;
        state.totalFocusSec = (Number(state.totalFocusSec) || 0) + dur;
      }
      state.history.push({ ts: now(), mode: state.mode, durationSec: dur, completed: true });
      state.history = state.history.slice(-60);
      writeJSON(pomodoroKey(), state);
      toast(state.mode === 'focus' ? '🍅 Pomodoro завершён. Сделай короткий перерыв.' : 'Перерыв завершён. Можно возвращаться к теме.');
    }
    return state;
  }
  function savePomodoro(state){ writeJSON(pomodoroKey(), state); }
  function formatSec(sec){
    sec = Math.max(0, Math.floor(Number(sec || 0)));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }
  function startPomodoro(seconds, mode){
    var state = readPomodoro();
    state.running = true;
    state.mode = mode || 'focus';
    state.durationSec = seconds;
    state.startedAt = now();
    state.endAt = now() + seconds * 1000;
    savePomodoro(state);
    renderPomodoro();
    toast(mode === 'break' ? '☕ Перерыв запущен.' : '🍅 Pomodoro запущен: 25 минут фокуса.');
  }
  function stopPomodoro(){
    var state = readPomodoro();
    if (state.running) state.history.push({ ts: now(), mode: state.mode, durationSec: state.durationSec, completed:false });
    state.running = false;
    state.endAt = 0;
    state.startedAt = 0;
    state.history = state.history.slice(-60);
    savePomodoro(state);
    renderPomodoro();
  }
  function pomodoroRemaining(state){ return state.running ? Math.ceil((Number(state.endAt || 0) - now()) / 1000) : 0; }
  function renderPomodoro(){
    var state = readPomodoro();
    var rem = pomodoroRemaining(state);
    var pct = state.running && state.durationSec ? Math.max(0, Math.min(100, Math.round((1 - rem / state.durationSec) * 100))) : 0;
    var completed = Number(state.completed || 0);
    var html = '<div class="wave91e-timer"><div><h3>🍅 Pomodoro-тренировка</h3><div class="wave91e-sub">25 минут фокуса + короткий перерыв. Счётчик сохраняется в этом классе.</div></div>' +
      '<div class="wave91e-time wave91e-mono">' + (state.running ? formatSec(rem) : '25:00') + '</div></div>' +
      '<div class="wave91e-progress" aria-hidden="true"><span style="width:' + pct + '%"></span></div>' +
      '<div class="wave91e-sub">Сессий фокуса: <b>' + completed + '</b>' + (state.running ? ' · режим: <b>' + (state.mode === 'break' ? 'перерыв' : 'фокус') + '</b>' : '') + '</div>' +
      '<div class="wave91e-actions">' +
        '<button type="button" class="wave91e-btn primary" data-wave91e-pomodoro="focus">25 мин фокус</button>' +
        '<button type="button" class="wave91e-btn" data-wave91e-pomodoro="break">5 мин перерыв</button>' +
        '<button type="button" class="wave91e-btn danger" data-wave91e-pomodoro="stop">Сбросить</button>' +
      '</div>';
    var card = document.getElementById('wave91e-pomodoro-card');
    if (card) {
      card.innerHTML = html;
      card.querySelector('[data-wave91e-pomodoro="focus"]').addEventListener('click', function(){ startPomodoro(25 * 60, 'focus'); });
      card.querySelector('[data-wave91e-pomodoro="break"]').addEventListener('click', function(){ startPomodoro(5 * 60, 'break'); });
      card.querySelector('[data-wave91e-pomodoro="stop"]').addEventListener('click', stopPomodoro);
    }
    var mini = document.getElementById('wave91e-pomodoro-mini');
    if (mini) mini.textContent = state.running ? ('🍅 ' + formatSec(rem)) : ('🍅 ' + completed);
  }
  function mountPomodoro(){
    if (isSimpleMode()) { removeIf('wave91e-pomodoro-card'); return; }
    var main = document.querySelector('#s-main .w');
    if (!main || document.getElementById('wave91e-pomodoro-card')) return;
    var card = document.createElement('section');
    card.id = 'wave91e-pomodoro-card';
    card.className = 'wave91e-card';
    var anchor = document.getElementById('daily-meter') || document.getElementById('wave21-main-actions') || document.getElementById('sg');
    if (anchor && anchor.parentNode === main) main.insertBefore(card, anchor.nextSibling);
    else main.appendChild(card);
    renderPomodoro();
  }
  function mountPomodoroMini(){
    if (isSimpleMode()) { removeIf('wave91e-pomodoro-mini'); return; }
    var qh = document.querySelector('#s-play .qh');
    if (!qh || document.getElementById('wave91e-pomodoro-mini')) return;
    var mini = document.createElement('button');
    mini.id = 'wave91e-pomodoro-mini';
    mini.type = 'button';
    mini.className = 'wave91e-mini wave91e-mono';
    mini.addEventListener('click', function(){ try { go('main'); } catch(_){ } setTimeout(function(){ var c = document.getElementById('wave91e-pomodoro-card'); if(c) c.scrollIntoView({ behavior:'smooth', block:'center' }); }, 60); });
    qh.appendChild(mini);
    renderPomodoro();
  }

  function getCurrentQuestion(){ try { return (typeof prob !== 'undefined' && prob) ? prob : null; } catch(_){ return null; } }
  function isAnswered(){ try { return typeof sel !== 'undefined' && sel !== null; } catch(_){ return true; } }
  function isExamLike(){ try { return !!(diagMode || rushMode); } catch(_){ return false; } }
  function currentSubjectName(){ try { return cS && cS.nm ? cS.nm : ''; } catch(_){ return ''; } }
  function currentTopicName(){ try { return cT && cT.nm ? cT.nm : (getCurrentQuestion() && getCurrentQuestion().tag || ''); } catch(_){ return ''; } }
  function explainKey(){ return 'trainer_explain_friend_wave91e_' + gradeKey(); }
  function loadExplainRows(){ var rows = readJSON(explainKey(), []); return Array.isArray(rows) ? rows : []; }
  function saveExplainRow(row){
    var rows = loadExplainRows();
    rows.push(row);
    writeJSON(explainKey(), rows.slice(-120));
  }
  function modelExplanation(q){
    var parts = [];
    if (q && q.ex) parts.push(String(q.ex));
    if (q && q.hint && parts.join(' ').indexOf(String(q.hint)) === -1) parts.push('Подсказка: ' + String(q.hint));
    if (q && q.answer) parts.push('Ключевой ответ: ' + String(q.answer) + '.');
    return parts.join(' ') || 'Сформулируй правило, покажи ход рассуждения и проверь ответ по условию.';
  }
  function mountExplainFriend(){
    if (isSimpleMode()) { removeIf('wave91e-explain-host'); return; }
    var q = getCurrentQuestion();
    var target = document.getElementById('ha');
    if (!target || !q || isAnswered() || isExamLike()) return;
    var host = document.getElementById('wave91e-explain-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'wave91e-explain-host';
      host.className = 'wave91e-explain-card';
      target.parentNode.insertBefore(host, target);
    }
    host.innerHTML = '<div class="wave91e-sub" style="margin-bottom:8px"><b>👥 Объясни другу</b> — напиши ход решения своими словами, потом сравни с эталоном.</div>' +
      '<div class="wave91e-actions"><button type="button" class="wave91e-btn good" id="wave91e-open-explain">Объяснить</button></div>';
    var btn = document.getElementById('wave91e-open-explain');
    if (btn) btn.addEventListener('click', openExplainFriend);
  }
  function openExplainFriend(){
    var q = getCurrentQuestion();
    if (!q) return;
    injectStyle();
    var overlay = document.createElement('div');
    overlay.className = 'wave91e-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    var dialog = document.createElement('div');
    dialog.className = 'wave91e-dialog';
    dialog.innerHTML = '<h3>👥 Объясни другу</h3>' +
      '<div class="wave91e-sub">Задача: <b>' + esc(q.question) + '</b></div>' +
      '<textarea id="wave91e-explain-text" placeholder="Напиши так, будто объясняешь однокласснику: что дано, какое правило применить, почему ответ такой..."></textarea>' +
      '<div class="wave91e-actions" style="margin-top:10px"><button type="button" class="wave91e-btn primary" id="wave91e-show-model">Показать эталон</button><button type="button" class="wave91e-btn" id="wave91e-close-explain">Закрыть</button></div>' +
      '<div id="wave91e-model-box" hidden></div>';
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    function close(){ if (overlay && overlay.parentNode) overlay.remove(); }
    overlay.addEventListener('click', function(ev){ if (ev.target === overlay) close(); });
    dialog.querySelector('#wave91e-close-explain').addEventListener('click', close);
    dialog.querySelector('#wave91e-show-model').addEventListener('click', function(){
      var draft = dialog.querySelector('#wave91e-explain-text').value || '';
      var box = dialog.querySelector('#wave91e-model-box');
      box.hidden = false;
      box.innerHTML = '<div class="wave91e-model"><b>Эталон:</b><br>' + esc(modelExplanation(q)) + '</div>' +
        '<div class="wave91e-sub">Оцени своё объяснение:</div>' +
        '<div class="wave91e-grid">' +
          '<button type="button" class="wave91e-btn good" data-wave91e-grade="understood">Понял</button>' +
          '<button type="button" class="wave91e-btn warn" data-wave91e-grade="partial">Не совсем</button>' +
          '<button type="button" class="wave91e-btn danger" data-wave91e-grade="lost">Не понял</button>' +
        '</div>';
      Array.prototype.slice.call(box.querySelectorAll('[data-wave91e-grade]')).forEach(function(btn){
        btn.addEventListener('click', function(){
          saveExplainRow({
            ts: now(),
            grade: gradeKey(),
            subject: currentSubjectName(),
            topic: currentTopicName(),
            q: q.question,
            answer: q.answer,
            hint: q.hint || '',
            ex: q.ex || '',
            draft: draft,
            selfGrade: btn.getAttribute('data-wave91e-grade')
          });
          toast('Объяснение сохранено. Это засчитывается как активное повторение.');
          close();
        });
      });
    });
    setTimeout(function(){ var ta = dialog.querySelector('textarea'); if (ta) ta.focus(); }, 30);
  }

  function normalizeJournalRow(row){
    return {
      q: row && (row.q || row.question) || '',
      your: row && (row.your || row.yourAnswer || row.chosen) || '',
      correct: row && (row.correct || row.answer || row.a) || '',
      hint: row && row.hint || '',
      ex: row && row.ex || '',
      tag: row && row.tag || 'Ошибки'
    };
  }
  function loadJournalRows(){
    var rows = readJSON('trainer_journal_' + gradeKey(), []);
    if (!Array.isArray(rows)) rows = [];
    return rows.map(normalizeJournalRow).filter(function(row){ return row.q && row.correct; });
  }
  function ankiField(value){
    return String(value == null ? '' : value)
      .replace(/\r?\n/g, '<br>')
      .replace(/\t/g, ' ')
      .replace(/"/g, '&quot;');
  }
  function exportAnkiImport(){
    var rows = loadJournalRows();
    if (!rows.length) { toast('В журнале ошибок пока нет карточек для экспорта.'); return; }
    var seen = Object.create(null);
    var lines = ['#separator:tab', '#html:true', '#tags column:3'];
    rows.slice(-200).reverse().forEach(function(row){
      var key = row.q + '|' + row.correct;
      if (seen[key]) return;
      seen[key] = true;
      var front = '<b>' + ankiField(row.tag) + '</b><br>' + ankiField(row.q) + (row.your ? '<br><span style="color:#dc2626">Мой ответ: ' + ankiField(row.your) + '</span>' : '');
      var back = '<b>Ответ:</b> ' + ankiField(row.correct) + (row.hint ? '<br><br><b>Подсказка:</b> ' + ankiField(row.hint) : '') + (row.ex ? '<br><br><b>Разбор:</b> ' + ankiField(row.ex) : '');
      var tags = ['trainer3', 'grade_' + gradeKey(), String(row.tag || 'errors').replace(/\s+/g, '_').replace(/[^\wа-яА-ЯёЁ_:-]/g, '')].join(' ');
      lines.push(front + '\t' + back + '\t' + tags);
    });
    var name = 'trainer3_grade' + gradeKey() + '_errors_anki_import.txt';
    if (downloadText(name, lines.join('\n') + '\n', 'text/plain;charset=utf-8')) {
      toast('Экспорт готов: импортируй файл в Anki как Basic-карточки.');
    }
  }
  function mountAnkiCard(){
    if (isSimpleMode()) { removeIf('wave91e-anki-card'); return; }
    var main = document.querySelector('#s-main .w');
    if (!main || document.getElementById('wave91e-anki-card')) return;
    var card = document.createElement('section');
    card.id = 'wave91e-anki-card';
    card.className = 'wave91e-card';
    var count = loadJournalRows().length;
    card.innerHTML = '<h3>🗂 Экспорт ошибок в Anki</h3>' +
      '<div class="wave91e-sub">Создаёт Anki-compatible TSV-файл из журнала ошибок. Карточек сейчас: <b>' + count + '</b>.</div>' +
      '<div class="wave91e-actions"><button type="button" class="wave91e-btn primary" id="wave91e-export-anki">Скачать Anki import</button></div>';
    var after = document.getElementById('wave91e-pomodoro-card') || document.getElementById('daily-meter') || document.getElementById('sg');
    if (after && after.parentNode === main) main.insertBefore(card, after.nextSibling);
    else main.appendChild(card);
    card.querySelector('#wave91e-export-anki').addEventListener('click', exportAnkiImport);
  }

  function examCountdownKey(){ return 'trainer_exam_date_wave91e_' + gradeKey(); }
  function examLabel(){ var g = gradeKey(); return g === '9' ? 'ОГЭ' : (g === '11' ? 'ЕГЭ' : 'экзамена'); }
  function daysUntil(dateValue){
    if (!dateValue) return null;
    var target = new Date(String(dateValue) + 'T00:00:00');
    if (Number.isNaN(+target)) return null;
    var today = new Date();
    var base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.ceil((target - base) / 86400000);
  }
  function mountExamCountdown(){
    if (isSimpleMode()) { removeIf('wave91e-exam-countdown'); return; }
    var g = gradeKey();
    if (g !== '9' && g !== '11') return;
    var main = document.querySelector('#s-main .w');
    if (!main || document.getElementById('wave91e-exam-countdown')) return;
    var value = String(readJSON(examCountdownKey(), '') || '');
    var days = daysUntil(value);
    var label = examLabel();
    var card = document.createElement('section');
    card.id = 'wave91e-exam-countdown';
    card.className = 'wave91e-card';
    card.innerHTML = '<h3>⏳ Обратный отсчёт до ' + label + '</h3>' +
      '<div class="wave91e-sub">' + (days == null ? 'Укажи дату первого экзамена — виджет покажет план на сегодня.' : (days >= 0 ? 'До ' + label + ': <b>' + days + '</b> дн.' : label + ' уже прошёл по этой дате.')) + '</div>' +
      '<div class="wave91e-actions"><input id="wave91e-exam-date-input" type="date" value="' + esc(value) + '" style="flex:1;min-width:150px;border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);padding:9px 11px;font:inherit"><button type="button" class="wave91e-btn primary" id="wave91e-save-exam-date">Сохранить</button></div>' +
      '<div class="wave91e-sub" style="margin-top:10px">План на сегодня: решить 5 экзаменационных заданий и разобрать все ошибки.</div>';
    var after = document.getElementById('wave91e-anki-card') || document.getElementById('wave91e-pomodoro-card') || document.getElementById('daily-meter') || document.getElementById('sg');
    if (after && after.parentNode === main) main.insertBefore(card, after.nextSibling);
    else main.appendChild(card);
    card.querySelector('#wave91e-save-exam-date').addEventListener('click', function(){
      var input = card.querySelector('#wave91e-exam-date-input');
      writeJSON(examCountdownKey(), input ? input.value : '');
      card.remove();
      mountExamCountdown();
      toast('Дата ' + label + ' сохранена.');
    });
  }

  function mountAll(){
    injectStyle();
    mountPomodoro();
    mountPomodoroMini();
    mountAnkiCard();
    mountExamCountdown();
    mountExplainFriend();
    renderPomodoro();
  }
  function patchRender(){
    try {
      if (typeof render !== 'function' || render.__wave91ePatched) return false;
      var original = render;
      var patched = function(){
        var result = original.apply(this, arguments);
        setTimeout(mountAll, 0);
        return result;
      };
      patched.__wave91ePatched = true;
      render = patched;
      window.render = patched;
      return true;
    } catch(_){ return false; }
  }
  function patchGo(){
    try {
      if (typeof go !== 'function' || go.__wave91ePatched) return false;
      var original = go;
      var patched = function(){
        var result = original.apply(this, arguments);
        setTimeout(mountAll, 0);
        return result;
      };
      patched.__wave91ePatched = true;
      go = patched;
      window.go = patched;
      return true;
    } catch(_){ return false; }
  }
  function scheduleTicker(){
    if (timers.pomodoro) clearInterval(timers.pomodoro);
    timers.pomodoro = setInterval(function(){ try { renderPomodoro(); } catch(_){ } }, 1000);
  }
  function boot(){
    if (!document.getElementById('s-main')) return;
    injectStyle();
    patchRender();
    patchGo();
    mountAll();
    scheduleTicker();
    window.wave91eLearningFormats = {
      version: WAVE,
      explainKey: explainKey(),
      pomodoroKey: pomodoroKey(),
      exportAnkiImport: exportAnkiImport,
      readPomodoro: readPomodoro,
      explainRows: loadExplainRows,
      journalRows: loadJournalRows,
      auditSnapshot: function(){
        var g = gradeKey();
        return {
          wave: WAVE,
          grade: g,
          hasPomodoroCard: !!document.getElementById('wave91e-pomodoro-card') || !!document.getElementById('s-main'),
          hasExplainPatch: typeof render === 'function' && !!render.__wave91ePatched,
          hasAnkiExport: typeof exportAnkiImport === 'function',
          hasCountdown: (g === '9' || g === '11') ? (!!document.getElementById('wave91e-exam-countdown') || !!document.getElementById('s-main')) : true,
          pomodoro: readPomodoro(),
          explainCount: loadExplainRows().length,
          journalCount: loadJournalRows().length
        };
      }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
  window.addEventListener('load', function(){ setTimeout(boot, 0); }, { once:true });
  timers.boot = setInterval(function(){
    try {
      if (patchRender() && patchGo()) { mountAll(); clearInterval(timers.boot); }
      else mountAll();
    } catch(_){ }
  }, 500);
  setTimeout(function(){ try { clearInterval(timers.boot); } catch(_){ } }, 8000);
})();

/* wave91f: compact learning tools pack */
(function(){
'use strict';
if(typeof window==='undefined'||window.__wave91fLearningPack)return;window.__wave91fLearningPack=1;
var r=window,W='wave91f',SID='wave91f-style',timer=0;
function simple(){try{var raw=localStorage.getItem('trainer_ui_mode');raw=String(raw==null?'':raw).trim().toLowerCase();if(raw==='full')return false;if(raw==='simple'||raw==='')return true;return !!((document.body&&document.body.classList&&document.body.classList.contains('simple-mode'))||(document.documentElement&&document.documentElement.classList&&document.documentElement.classList.contains('simple-mode')))}catch(_){return true}}
function rm(id){try{var x=document.getElementById(id);if(x&&x.parentNode)x.parentNode.removeChild(x)}catch(_){}}
function g(){try{return String(r.GRADE_NUM||r.GRADE_NO||'10')}catch(e){return'10'}}
function ts(){return Date.now?Date.now():(+new Date())}
function day(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function e(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function txt(x){return String(x==null?'':x).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
function n(x){return txt(x).toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]+/g,' ').trim()}
function R(k,f){try{var v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}}
function S(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function K(s){return'trainer_'+s+'_wave91f_'+g()}
function q(){try{if(typeof prob!=='undefined'&&prob)return prob}catch(e){}return r.prob||null}
function cs(){try{if(typeof cS!=='undefined'&&cS)return cS}catch(e){}return r.cS||null}
function ct(){try{if(typeof cT!=='undefined'&&cT)return cT}catch(e){}return r.cT||null}
function selv(){try{if(typeof sel!=='undefined')return sel}catch(e){}return r.sel}
function qs(x){return x&&(x.question||x.q||x.text||x.prompt)||''}
function qa(x){return x&&(x.answer||x.a||x.correct||x.ans)||''}
function qo(x){return x&&(Array.isArray(x.options)?x.options:(Array.isArray(x.o)?x.o:[]))||[]}
function subj(){var s=cs();return s&&(s.nm||s.name||s.id)||''}
function topic(x){var t=ct();return t&&(t.nm||t.name)||x&&(x.tag||x.topic_tag||x.topic)||'Тема'}
function qid(x){return n(subj()+'|'+topic(x)+'|'+qs(x)).slice(0,180)||String(ts())}
function chosen(x){var s=selv(),o=qo(x);if(typeof s==='number'&&o[s]!=null)return o[s];if(typeof s==='string'&&/^\d+$/.test(s)&&o[+s]!=null)return o[+s];return s==null?'':s}
function ok(x){return n(chosen(x))===n(qa(x))}
function toast(m){try{var old=document.querySelector('.wave91f-toast');if(old)old.remove();var d=document.createElement('div');d.className='wave91f-toast';d.textContent=m;document.body.appendChild(d);requestAnimationFrame(function(){d.classList.add('show')});setTimeout(function(){if(d.parentNode)d.remove()},2400)}catch(e){}}
function dl(name,body,type){try{var b=new Blob([body],{type:type||'text/plain;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},400)}catch(e){}}
function css(){if(document.getElementById(SID))return;var s=document.createElement('style');s.id=SID;s.textContent='.wave91f-card{margin:10px 0;padding:14px;border:1px solid var(--border);border-radius:18px;background:var(--card);box-shadow:0 10px 28px rgba(15,23,42,.06)}.wave91f-card h3{margin:0 0 6px;font-family:Unbounded,system-ui,sans-serif;font-size:14px}.wave91f-sub{font-size:12px;line-height:1.45;color:var(--muted);margin:0 0 10px}.wave91f-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.wave91f-btn{border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);font:800 12px Golos Text,system-ui;padding:9px 11px;cursor:pointer}.wave91f-btn.primary{border-color:transparent;background:var(--accent);color:#fff}.wave91f-btn.danger{border-color:transparent;background:var(--red);color:#fff}.wave91f-input,.wave91f-ta{border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);padding:9px 11px;font:inherit}.wave91f-ta{width:100%;min-height:70px;box-sizing:border-box}.wave91f-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}.wave91f-kpi{padding:10px;border:1px solid var(--border);border-radius:14px;background:var(--bg)}.wave91f-kpi b{display:block;font-size:18px}.wave91f-banner{margin:8px 0;padding:10px;border:1px dashed var(--accent);border-radius:14px;background:color-mix(in srgb,var(--accent) 10%,transparent);font-size:12px}.wave91f-tools{margin:8px 0 10px;padding:10px;border:1px solid var(--border);border-radius:14px;background:var(--card)}.wave91f-modal{position:fixed;inset:0;z-index:10060;background:rgba(15,23,42,.58);display:flex;align-items:center;justify-content:center;padding:16px}.wave91f-dialog{width:min(920px,100%);max-height:88vh;overflow:auto;border:1px solid var(--border);border-radius:22px;background:var(--card);color:var(--text);padding:16px;box-shadow:0 24px 80px rgba(0,0,0,.28)}.wave91f-map{width:100%;min-height:430px;border:1px solid var(--border);border-radius:16px;background:var(--bg)}.wave91f-toast{position:fixed;left:50%;bottom:22px;z-index:10070;transform:translateX(-50%) translateY(10px);opacity:0;padding:10px 13px;border-radius:14px;background:var(--text);color:var(--bg);font-size:13px;font-weight:850;box-shadow:0 18px 50px rgba(0,0,0,.25);transition:.18s}.wave91f-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}body.simple-mode .wave91f-adv,html.simple-mode .wave91f-adv,body.simple-mode #wave91f-tools,html.simple-mode #wave91f-tools,body.simple-mode .wave91f-tools,html.simple-mode .wave91f-tools,body.simple-mode #wave91f-main-card,html.simple-mode #wave91f-main-card,body.simple-mode #wave91f-plan-banner,html.simple-mode #wave91f-plan-banner,body.simple-mode #wave91f-marathon-banner,html.simple-mode #wave91f-marathon-banner{display:none!important}';var hp=document.head||document.documentElement||document.body;if(hp&&hp.appendChild)hp.appendChild(s)}
function main(){return document.querySelector('#s-main .w')||document.querySelector('#s-main')}
function play(){return document.querySelector('#s-play .w')||document.querySelector('#s-play')}
function anchor(){return document.getElementById('wave91e-exam-countdown')||document.getElementById('wave91e-anki-card')||document.getElementById('wave91e-pomodoro-card')||document.getElementById('daily-meter')||document.getElementById('sg')}
function ins(a,x,p){if(a&&a.parentNode)a.parentNode.insertBefore(x,a.nextSibling);else if(p)p.appendChild(x)}
function modal(t,h,cb){css();var o=document.createElement('div'),d=document.createElement('div');o.className='wave91f-modal';d.className='wave91f-dialog';d.innerHTML='<div class="wave91f-actions" style="justify-content:space-between"><h3>'+e(t)+'</h3><button class="wave91f-btn" data-x>Закрыть</button></div>'+h;o.appendChild(d);document.body.appendChild(o);function close(){o.remove()}o.onclick=function(ev){if(ev.target===o)close()};d.querySelector('[data-x]').onclick=close;if(cb)cb(d,close);return d}
function subjects(){try{return Array.isArray(r.SUBJ)?r.SUBJ:[]}catch(e){return[]}}
function mapHtml(){var s=cs()||subjects()[0]||{},tt=Array.isArray(s.t)?s.t:(Array.isArray(s.topics)?s.topics:[]);if(!tt.length)tt=subjects().slice(0,10).map(function(x){return{nm:x.nm||x.name||x.id}});tt=tt.slice(0,18);if(!tt.length)return'<p class="wave91f-sub">Темы не найдены.</p>';var cx=430,cy=225,rad=Math.min(170,70+tt.length*7),svg='<svg class="wave91f-map" viewBox="0 0 860 450"><text x="24" y="34" font-size="18" font-weight="900" fill="currentColor">'+e(s.nm||s.name||'Предмет')+'</text>';var ns=tt.map(function(t,i){var a=-Math.PI/2+i*2*Math.PI/tt.length;return{x:cx+Math.cos(a)*rad+Math.sin(i)*14,y:cy+Math.sin(a)*rad+Math.cos(i)*12,n:String(t.nm||t.name||t.tag||('Тема '+(i+1)))}});ns.forEach(function(p,i){var b=ns[(i+1)%ns.length];svg+='<line x1="'+p.x+'" y1="'+p.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="var(--border)"/>';if(i%3===0&&ns[i+3])svg+='<line x1="'+p.x+'" y1="'+p.y+'" x2="'+ns[i+3].x+'" y2="'+ns[i+3].y+'" stroke="var(--border)"/>'});ns.forEach(function(p){var sh=p.n.length>23?p.n.slice(0,22)+'…':p.n;svg+='<g tabindex="0" data-topic="'+e(p.n)+'"><circle cx="'+p.x+'" cy="'+p.y+'" r="34" fill="var(--card)" stroke="var(--accent)" stroke-width="2"/><text x="'+p.x+'" y="'+(p.y+4)+'" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor">'+e(sh)+'</text></g>'});return'<p class="wave91f-sub">Кликни по узлу: тренажёр подскажет, как связать тему с соседними.</p>'+svg+'<div id="wave91f-map-note" class="wave91f-banner">Выбери тему на карте.</div>'}
function openMap(){modal('🕸 Карта связей тем',mapHtml(),function(d){Array.prototype.forEach.call(d.querySelectorAll('[data-topic]'),function(x){x.onclick=function(){var m=d.querySelector('#wave91f-map-note');if(m)m.innerHTML='<b>'+e(x.getAttribute('data-topic'))+'</b>: повтори правило, затем объясни связь с двумя соседними темами.'}})})}
function journal(){var a=R('trainer_journal_'+g(),[]);return(Array.isArray(a)?a:[]).map(function(x){return{q:x&&(x.q||x.question||x.text)||'',y:x&&(x.your||x.yourAnswer||x.chosen||x.selected)||'',c:x&&(x.correct||x.answer||x.a)||'',tag:x&&(x.tag||x.topic)||'Ошибка'}}).filter(function(x){return x.q&&x.c})}
function dmap(){var x=R(K('error_diary'),{});return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}
function openDiary(){var rows=journal().slice(-12).reverse(),m=dmap(),h=rows.length?'<p class="wave91f-sub">Заполни причину ошибки и правило самопроверки.</p>':'<p class="wave91f-sub">Журнал ошибок пока пуст.</p>';rows.forEach(function(x,i){var id=n(x.q+'|'+x.c).slice(0,120)||String(i),v=m[id]||{};h+='<div class="wave91f-card" data-id="'+e(id)+'"><b>'+e(x.tag)+'</b><p class="wave91f-sub">'+e(x.q)+'</p><div class="wave91f-grid"><div class="wave91f-kpi"><span>Мой</span><b style="font-size:13px">'+e(x.y||'—')+'</b></div><div class="wave91f-kpi"><span>Верно</span><b style="font-size:13px">'+e(x.c)+'</b></div></div><textarea class="wave91f-ta" data-f="why" placeholder="Что перепутал?">'+e(v.why||'')+'</textarea><textarea class="wave91f-ta" data-f="fix" placeholder="Как проверю себя?">'+e(v.fix||'')+'</textarea><button class="wave91f-btn primary" data-save>Сохранить</button></div>'});h+='<button class="wave91f-btn" id="wave91f-diary-export">Экспорт TSV</button>';modal('📓 Дневник ошибок',h,function(d){Array.prototype.forEach.call(d.querySelectorAll('[data-save]'),function(b){b.onclick=function(){var row=b.closest('[data-id]'),id=row.getAttribute('data-id');m[id]={ts:ts(),why:row.querySelector('[data-f=why]').value,fix:row.querySelector('[data-f=fix]').value};S(K('error_diary'),m);toast('Запись сохранена')}});var ex=d.querySelector('#wave91f-diary-export');if(ex)ex.onclick=function(){var lines=['id\twhy\tfix'];Object.keys(m).forEach(function(k){lines.push([k,m[k].why||'',m[k].fix||''].join('\t'))});dl('trainer3_grade'+g()+'_error_diary.tsv',lines.join('\n')+'\n','text/tab-separated-values;charset=utf-8')}})}
function mar(){var s=R(K('marathon'),null);return s&&typeof s==='object'?s:{active:false,score:0,best:0,seen:{},hist:[]}}
function savem(s){s.hist=Array.isArray(s.hist)?s.hist.slice(-40):[];S(K('marathon'),s)}
function startM(){var s=mar();s.active=true;s.score=0;s.seen={};s.startedAt=ts();savem(s);toast('Марафон запущен')}
function stopM(rn){var s=mar();if(!s.active)return;s.active=false;s.reason=rn||'stop';s.best=Math.max(+s.best||0,+s.score||0);s.hist.push({ts:ts(),score:s.score,reason:s.reason});savem(s);toast((rn==='wrong'?'Первая ошибка. ':'Марафон остановлен. ')+'Счёт: '+s.score)}
function tickM(){if(simple()){rm('wave91f-marathon-banner');return;}var x=q(),s=mar();if(!x||!s.active)return;var p=play(),b=document.getElementById('wave91f-marathon-banner');if(p&&!b){b=document.createElement('div');b.id='wave91f-marathon-banner';b.className='wave91f-banner';p.insertBefore(b,p.firstChild)}if(b)b.innerHTML='🏃 <b>Марафон</b> · счёт: <b>'+s.score+'</b> <button class="wave91f-btn" id="wave91f-stop-m">Стоп</button>';var sb=document.getElementById('wave91f-stop-m');if(sb)sb.onclick=function(){stopM('manual')};if(selv()==null)return;var id=qid(x);s.seen=s.seen||{};if(s.seen[id])return;s.seen[id]=1;if(ok(x)){s.score=(+s.score||0)+1;savem(s)}else stopM('wrong')}
function diff(){var m=R(K('difficulty_tags'),{});return m&&typeof m==='object'&&!Array.isArray(m)?m:{}}
function setD(l){var x=q();if(!x)return;var m=diff();m[qid(x)]={level:l,ts:ts(),subject:subj(),topic:topic(x),q:qs(x)};S(K('difficulty_tags'),m);toast('Сложность: '+l);var box=document.getElementById('wave91f-tools');if(box)box.remove();tools()}
function diffStats(){var m=diff(),o=[0,0,0,0];Object.keys(m).forEach(function(k){var l=+m[k].level;if(l>=1&&l<=3){o[0]++;o[l]++}});return o}
function plan(){var p=R(K('control_work_plan'),{});return p&&typeof p==='object'?p:{}}
function left(d){if(!d)return null;var x=new Date(d+'T00:00:00'),t=new Date(),b=new Date(t.getFullYear(),t.getMonth(),t.getDate());return Math.ceil((x-b)/86400000)}
function savePlan(){var d=document.getElementById('wave91f-plan-date'),t=document.getElementById('wave91f-plan-topic');S(K('control_work_plan'),{date:d?d.value:'',topic:t?t.value:'',ts:ts()});toast('План сохранён');var c=document.getElementById('wave91f-main-card');if(c)c.remove();card()}
function pom(){var s=R('trainer_pomodoro_wave91e_'+g(),{}),h=Array.isArray(s.history)?s.history:[];return{done:+s.completed||0,min:Math.round(h.reduce(function(a,x){return a+(x&&x.completed!==false?(+x.durationSec||0):0)},(+s.completed||0)*1500)/60)}}
function freeze(){var s=R(K('streak_freeze'),null);return s&&typeof s==='object'?s:{balance:2,used:[]}}
function useFreeze(){var s=freeze(),d=day();s.used=Array.isArray(s.used)?s.used:[];if(s.used.indexOf(d)>=0)return toast('Freeze уже активен сегодня');if((+s.balance||0)<=0)return toast('Freeze закончились');s.balance=(+s.balance||0)-1;s.used.push(d);S(K('streak_freeze'),s);toast('Freeze активирован');var c=document.getElementById('wave91f-main-card');if(c)c.remove();card()}
function card(){if(simple()){rm('wave91f-main-card');return;}var h=main();if(!h||document.getElementById('wave91f-main-card'))return;var m=mar(),ds=diffStats(),p=plan(),pm=pom(),fr=freeze(),ld=left(p.date),c=document.createElement('section');c.id='wave91f-main-card';c.className='wave91f-card';c.innerHTML='<h3>🧩 Форматы wave91f</h3><p class="wave91f-sub">Карта тем, дневник ошибок, марафон, теги сложности, план к контрольной, статистика Pomodoro и streak freeze.</p><div class="wave91f-grid"><div class="wave91f-kpi"><span>Марафон best</span><b>'+m.best+'</b></div><div class="wave91f-kpi"><span>Сложность 1/2/3</span><b>'+ds[1]+' · '+ds[2]+' · '+ds[3]+'</b></div><div class="wave91f-kpi"><span>Pomodoro</span><b>'+pm.done+' / '+pm.min+'м</b></div><div class="wave91f-kpi"><span>Freeze</span><b>'+fr.balance+'</b></div></div><div class="wave91f-actions" style="margin-top:10px"><button class="wave91f-btn primary" id="wave91f-map">Карта тем</button><button class="wave91f-btn" id="wave91f-diary">Дневник ошибок</button><button class="wave91f-btn" id="wave91f-marathon">Старт марафона</button><button class="wave91f-btn" id="wave91f-freeze">Freeze сегодня</button></div><div class="wave91f-grid" style="margin-top:10px"><input class="wave91f-input" type="date" id="wave91f-plan-date" value="'+e(p.date||'')+'"><input class="wave91f-input" id="wave91f-plan-topic" placeholder="Тема контрольной" value="'+e(p.topic||'')+'"></div><p class="wave91f-sub">'+(p.date||p.topic?'Контрольная: <b>'+e(p.topic||'повторение')+'</b>'+(ld==null?'':' · осталось '+ld+' дн.'):'План к контрольной пока не задан.')+'</p><button class="wave91f-btn primary" id="wave91f-plan-save">Сохранить план</button>';ins(anchor(),c,h);var bMap=c.querySelector('#wave91f-map');if(bMap)bMap.onclick=openMap;var bDiary=c.querySelector('#wave91f-diary');if(bDiary)bDiary.onclick=openDiary;var bMar=c.querySelector('#wave91f-marathon');if(bMar)bMar.onclick=startM;var bFr=c.querySelector('#wave91f-freeze');if(bFr)bFr.onclick=useFreeze;var bPlan=c.querySelector('#wave91f-plan-save');if(bPlan)bPlan.onclick=savePlan}
function banner(){if(simple()){rm('wave91f-plan-banner');return;}var p=plan(),h=play()||main();if(!h||(!p.date&&!p.topic))return;if(document.getElementById('wave91f-plan-banner'))return;var b=document.createElement('div');b.id='wave91f-plan-banner';b.className='wave91f-banner';var ld=left(p.date);b.innerHTML='🎯 <b>Фокус к контрольной</b>: '+e(p.topic||'повторение')+(ld==null?'':' · '+ld+' дн.')+'. Сегодня: 5 заданий + разбор ошибок.';h.insertBefore(b,h.firstChild)}
function speak(){try{var x=q();if(!x||!r.speechSynthesis)return toast('Озвучивание недоступно');var u=new SpeechSynthesisUtterance(txt(qs(x)));u.lang=/англ|english/i.test(subj())?'en-US':'ru-RU';u.rate=u.lang==='en-US'?.92:1;r.speechSynthesis.cancel();r.speechSynthesis.speak(u)}catch(e){toast('Не удалось озвучить')}}
function tools(){if(simple()){rm('wave91f-tools');return;}var h=play(),x=q();if(!h||!x||document.getElementById('wave91f-tools'))return;var m=diff(),lv=m[qid(x)]&&m[qid(x)].level,eng=/англ|english/i.test(subj())||/[a-z]{3,}/i.test(qs(x)),d=document.createElement('div');d.id='wave91f-tools';d.className='wave91f-tools';d.innerHTML='<div class="wave91f-actions"><span>🏷 Сложность</span><button class="wave91f-btn" data-d="1" aria-pressed="'+(lv==1)+'">1</button><button class="wave91f-btn" data-d="2" aria-pressed="'+(lv==2)+'">2</button><button class="wave91f-btn" data-d="3" aria-pressed="'+(lv==3)+'">3</button>'+(eng?'<button class="wave91f-btn" id="wave91f-speak">🔊 Озвучить</button>':'')+'</div>';var a=document.getElementById('ha')||h.firstChild;if(a&&a.parentNode)a.parentNode.insertBefore(d,a);else h.insertBefore(d,h.firstChild);Array.prototype.forEach.call(d.querySelectorAll('[data-d]'),function(b){b.onclick=function(){setD(+b.getAttribute('data-d'))}});var sp=d.querySelector('#wave91f-speak');if(sp)sp.onclick=speak}
function hot(){if(r.__wave91fHotkeys)return;r.__wave91fHotkeys=1;document.addEventListener('keydown',function(ev){if(ev.ctrlKey||ev.metaKey||ev.altKey)return;var tag=ev.target&&ev.target.tagName;if(/INPUT|TEXTAREA|SELECT/.test(tag||''))return;var k=String(ev.key||'').toLowerCase();if(k==='?')modal('⌨️ Горячие клавиши','<div class="wave91f-grid"><div class="wave91f-kpi"><span>M</span><b style="font-size:13px">Главная</b></div><div class="wave91f-kpi"><span>D</span><b style="font-size:13px">Дневник ошибок</b></div><div class="wave91f-kpi"><span>P</span><b style="font-size:13px">Pomodoro</b></div><div class="wave91f-kpi"><span>?</span><b style="font-size:13px">Справка</b></div></div>');else if(k==='m'){try{go('main')}catch(e){}}else if(k==='d')openDiary();else if(k==='p'){var p=document.getElementById('wave91e-pomodoro-card');if(p)p.scrollIntoView({behavior:'smooth',block:'center'})}})}
function mount(){css();hot();card();banner();tools();tickM()}
function patch(){try{if(typeof render==='function'&&!render.__wave91f){var o=render;render=function(){var z=o.apply(this,arguments);setTimeout(mount,0);return z};render.__wave91f=1;r.render=render}}catch(e){}try{if(typeof go==='function'&&!go.__wave91f){var og=go;go=function(){var z=og.apply(this,arguments);setTimeout(mount,0);return z};go.__wave91f=1;r.go=go}}catch(e){}}
function boot(){patch();mount();r.wave91fLearningFormats={version:W,keys:{diary:K('error_diary'),marathon:K('marathon'),difficulty:K('difficulty_tags'),control:K('control_work_plan'),freeze:K('streak_freeze')},auditSnapshot:function(){return{wave:W,grade:g(),hasCard:!!document.getElementById('wave91f-main-card')||!!document.getElementById('s-main'),hasTools:!!document.getElementById('wave91f-tools')||!!document.getElementById('s-play'),marathon:mar(),difficulty:diffStats(),control:plan(),freeze:freeze(),journal:journal().length}},openTopicMap:openMap,openErrorDiary:openDiary,startMarathon:startM,stopMarathon:stopM,speakQuestion:speak}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();if(r&&typeof r.addEventListener==='function')r.addEventListener('load',function(){setTimeout(boot,0)},{once:true});if(typeof setInterval==='function'){timer=setInterval(function(){patch();mount()},700);if(typeof setTimeout==='function')setTimeout(function(){clearInterval(timer)},9000)}
})();

/* wave91g: visual content and interactive task formats */
(function(){
  'use strict';
  var W = 'wave91g';
  var STYLE_ID = 'wave91g-visual-interactive-style';
  var tickTimer = null;
  function isSimpleMode(){
    try {
      var raw = localStorage.getItem('trainer_ui_mode');
      raw = String(raw == null ? '' : raw).trim().toLowerCase();
      if (raw === 'full') return false;
      if (raw === 'simple' || raw === '') return true;
      return !!((document.body && document.body.classList && document.body.classList.contains('simple-mode')) ||
        (document.documentElement && document.documentElement.classList && document.documentElement.classList.contains('simple-mode')));
    } catch(_){ return true; }
  }
  function removeById(id){ try { var el=document.getElementById(id); if(el&&el.parentNode)el.parentNode.removeChild(el); } catch(_){} }

  function esc(v){
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function strip(html){
    return String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function lower(v){ return String(v || '').toLowerCase().replace(/ё/g, 'е'); }
  function grade(){
    try { return String(window.GRADE_NUM || window.GRADE_NO || '10'); } catch(_){ return '10'; }
  }
  function subj(){
    try { return window.cS || null; } catch(_){ return null; }
  }
  function topic(){
    try { return window.cT || null; } catch(_){ return null; }
  }
  function question(){
    try { return window.prob || null; } catch(_){ return null; }
  }
  function qText(q){
    if (!q) return '';
    return strip([q.question, q.q, q.text, q.tag, q.hint, q.ex].filter(Boolean).join(' '));
  }
  function currentText(){
    var s = subj(), t = topic(), q = question();
    return [s && s.nm, s && s.id, t && t.nm, t && t.id, qText(q)].filter(Boolean).join(' ');
  }
  function keyFor(q){
    if (!q) return 'none';
    return [subj() && subj().id, topic() && topic().id, q.question || q.q || '', q.answer || q.a || ''].join('|').slice(0, 240);
  }
  function active(id){
    var el = document.getElementById(id);
    return !!(el && /\bon\b/.test(el.className || ''));
  }
  function toast(msg){
    try {
      var old = document.querySelector('.wave91g-toast');
      if (old) old.remove();
      var el = document.createElement('div');
      el.className = 'wave91g-toast';
      el.setAttribute('role', 'status');
      el.textContent = String(msg || '');
      document.body.appendChild(el);
      requestAnimationFrame(function(){ el.classList.add('show'); });
      setTimeout(function(){ if (el && el.parentNode) el.remove(); }, 2400);
    } catch(_){}
  }
  function injectStyle(){
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      '.wave91g-card{margin:10px 0;padding:14px;border:1px solid var(--border);border-radius:18px;background:var(--card);box-shadow:0 10px 26px rgba(15,23,42,.06)}',
      '.wave91g-card h3{margin:0 0 6px;font-family:Unbounded,system-ui,sans-serif;font-size:14px;font-weight:900}',
      '.wave91g-sub{font-size:12px;line-height:1.45;color:var(--muted);margin:0 0 10px}',
      '.wave91g-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
      '.wave91g-btn{border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);font-family:Golos Text,system-ui,sans-serif;font-size:12px;font-weight:850;padding:9px 11px;cursor:pointer}',
      '.wave91g-btn.primary{border-color:transparent;background:var(--accent);color:#fff}',
      '.wave91g-btn.good{border-color:transparent;background:var(--green);color:#fff}',
      '.wave91g-btn.warn{border-color:transparent;background:var(--orange);color:#fff}',
      '.wave91g-svg{width:100%;height:auto;display:block;border-radius:14px;background:linear-gradient(180deg,rgba(148,163,184,.12),rgba(148,163,184,.04));border:1px solid var(--border);margin:8px 0}',
      '.wave91g-caption{font-size:12px;line-height:1.45;color:var(--muted)}',
      '.wave91g-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:8px}',
      '.wave91g-chip{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid var(--border);border-radius:13px;background:var(--bg);padding:9px 10px;font-size:12px;font-weight:850}',
      '.wave91g-list{display:grid;gap:8px;margin:10px 0}',
      '.wave91g-item{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid var(--border);border-radius:13px;background:var(--bg);padding:9px 10px}',
      '.wave91g-item span{font-size:12px;font-weight:850}',
      '.wave91g-mini{font-size:11px;color:var(--muted);font-weight:800}',
      '.wave91g-table{width:100%;border-collapse:collapse;margin:8px 0;font-size:12px}',
      '.wave91g-table th,.wave91g-table td{border:1px solid var(--border);padding:7px;text-align:left}',
      '.wave91g-table th{background:var(--abg);font-weight:900}',
      '.wave91g-modal{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.55)}',
      '.wave91g-dialog{width:min(680px,100%);max-height:88vh;overflow:auto;border-radius:18px;background:var(--card);color:var(--text);border:1px solid var(--border);box-shadow:0 24px 70px rgba(0,0,0,.28);padding:18px}',
      '.wave91g-dialog h3{font-family:Unbounded,system-ui,sans-serif;font-size:16px;margin:0 0 8px}',
      '.wave91g-canvas{width:100%;height:180px;border:1px dashed var(--border);border-radius:14px;background:var(--bg);touch-action:none}',
      '.wave91g-plane{cursor:crosshair}',
      '.wave91g-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%) translateY(12px);z-index:100001;border:1px solid var(--border);border-radius:999px;background:var(--card);color:var(--text);padding:10px 14px;font-size:12px;font-weight:900;box-shadow:0 16px 40px rgba(0,0,0,.22);opacity:0;transition:opacity .16s ease,transform .16s ease}',
      '.wave91g-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}',
      'body.simple-mode .wave91g-main-card,html.simple-mode .wave91g-main-card,body.simple-mode #wave91g-visual,html.simple-mode #wave91g-visual,body.simple-mode #wave91g-format,html.simple-mode #wave91g-format,body.simple-mode #wave91g-play-tools,html.simple-mode #wave91g-play-tools{display:none!important}',
      '@media print{.wave91g-card,.wave91g-modal,.wave91g-toast{display:none!important}}'
    ].join('\n');
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    var head = document.head || (document.querySelector && document.querySelector('head')) || document.documentElement || document.body;
    if (head && head.appendChild) head.appendChild(style);
  }

  function svgText(x, y, text, size){
    return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+(size||13)+'" font-family="Golos Text,Arial" fill="currentColor">'+esc(text)+'</text>';
  }
  function geometrySvg(text){
    var t = lower(text);
    if (/окруж|круг|радиус|диаметр|хорд|касател/.test(t)) {
      return {
        kind:'geometry',
        title:'📐 Геометрический чертёж',
        caption:'Окружность: радиус идёт от центра к точке окружности, диаметр проходит через центр и равен двум радиусам.',
        svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Окружность с радиусом, диаметром и касательной"><circle cx="180" cy="110" r="70" fill="none" stroke="currentColor" stroke-width="3"/><line x1="110" y1="110" x2="250" y2="110" stroke="currentColor" stroke-width="3"/><line x1="180" y1="110" x2="230" y2="61" stroke="currentColor" stroke-width="3"/><line x1="250" y1="28" x2="250" y2="192" stroke="currentColor" stroke-width="2" stroke-dasharray="5 5"/><circle cx="180" cy="110" r="4" fill="currentColor"/><circle cx="230" cy="61" r="4" fill="currentColor"/>'+svgText(180,132,'O',13)+svgText(180,101,'d',13)+svgText(210,84,'r',13)+svgText(278,112,'касательная',12)+'</svg>'
      };
    }
    if (/трапец|параллелограмм|ромб|четырехуголь|прямоуголь/.test(t)) {
      return {
        kind:'geometry',
        title:'📐 Геометрический чертёж',
        caption:'Четырёхугольник: отметь параллельные стороны, высоту и углы — так легче выбрать формулу площади или признак.',
        svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Трапеция с высотой"><polygon points="95,155 265,155 230,65 130,65" fill="none" stroke="currentColor" stroke-width="3"/><line x1="130" y1="65" x2="130" y2="155" stroke="currentColor" stroke-width="2" stroke-dasharray="5 5"/><path d="M130 155 L145 155 L145 140" fill="none" stroke="currentColor" stroke-width="2"/>'+svgText(180,58,'a',13)+svgText(180,176,'b',13)+svgText(118,115,'h',13)+svgText(93,172,'A',13)+svgText(269,172,'B',13)+svgText(235,60,'C',13)+svgText(126,60,'D',13)+'</svg>'
      };
    }
    if (/координат|график|парабол|функц|ось|точк/.test(t)) {
      return {
        kind:'geometry',
        title:'📈 График / координаты',
        caption:'Для графиков сначала подпиши оси, затем найди ключевые точки: пересечения, вершину, промежутки роста и убывания.',
        svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Координатная плоскость с параболой"><line x1="35" y1="170" x2="330" y2="170" stroke="currentColor" stroke-width="2"/><line x1="70" y1="25" x2="70" y2="195" stroke="currentColor" stroke-width="2"/><path d="M95 150 Q180 35 265 150" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="180" cy="70" r="4" fill="currentColor"/>'+svgText(333,164,'x',13)+svgText(82,32,'y',13)+svgText(180,62,'вершина',12)+'</svg>'
      };
    }
    return {
      kind:'geometry',
      title:'📐 Геометрический чертёж',
      caption:'Треугольник: сумма углов 180°. Для задач на равенство и подобие отмечай равные стороны, углы и высоты прямо на схеме.',
      svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Треугольник с высотой и углами"><polygon points="70,165 290,165 175,45" fill="none" stroke="currentColor" stroke-width="3"/><line x1="175" y1="45" x2="175" y2="165" stroke="currentColor" stroke-width="2" stroke-dasharray="5 5"/><path d="M175 165 L190 165 L190 150" fill="none" stroke="currentColor" stroke-width="2"/><path d="M92 165 A30 30 0 0 1 111 143" fill="none" stroke="currentColor" stroke-width="2"/><path d="M267 165 A30 30 0 0 0 248 143" fill="none" stroke="currentColor" stroke-width="2"/>'+svgText(70,184,'A',13)+svgText(290,184,'B',13)+svgText(175,37,'C',13)+svgText(188,112,'h',13)+svgText(176,187,'основание',12)+'</svg>'
    };
  }
  function geographySvg(text){
    var t = lower(text);
    if (/росси|сибир|урал|волг|кавказ|москва|байкал/.test(t)) {
      return {
        kind:'geography',
        title:'🗺️ Географическая схема',
        caption:'Схема России: для ответа держи в голове запад—восток, Урал как границу Европы и Азии, крупные реки и природные зоны.',
        svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Схематическая карта России"><path d="M45 120 C70 65 125 70 150 80 C190 45 250 58 320 85 C300 120 318 155 270 165 C220 176 170 155 120 170 C90 177 55 160 45 120 Z" fill="none" stroke="currentColor" stroke-width="3"/><line x1="150" y1="78" x2="150" y2="168" stroke="currentColor" stroke-width="2" stroke-dasharray="5 5"/><path d="M92 126 C110 138 130 142 150 145" fill="none" stroke="currentColor" stroke-width="2"/><path d="M205 92 C218 125 210 145 228 166" fill="none" stroke="currentColor" stroke-width="2"/>'+svgText(98,112,'Европ. часть',11)+svgText(172,95,'Урал',11)+svgText(245,122,'Сибирь',11)+svgText(148,187,'Волга',11)+svgText(225,184,'Енисей',11)+'</svg>'
      };
    }
    if (/климат|зон|тундр|тайг|степ|пустын/.test(t)) {
      return {
        kind:'geography',
        title:'🌍 Карта природных зон',
        caption:'Природные зоны меняются с севера на юг: холоднее и влажнее на севере, суше и теплее к югу.',
        svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Пояса природных зон"><rect x="45" y="42" width="270" height="30" rx="8" fill="none" stroke="currentColor"/><rect x="45" y="78" width="270" height="30" rx="8" fill="none" stroke="currentColor"/><rect x="45" y="114" width="270" height="30" rx="8" fill="none" stroke="currentColor"/><rect x="45" y="150" width="270" height="30" rx="8" fill="none" stroke="currentColor"/>'+svgText(180,62,'тундра',12)+svgText(180,98,'тайга',12)+svgText(180,134,'степь',12)+svgText(180,170,'полупустыни',12)+svgText(28,58,'север',11)+svgText(28,174,'юг',11)+'</svg>'
      };
    }
    return {
      kind:'geography',
      title:'🗺️ Географическая схема',
      caption:'Для карты сначала определи материк/регион, затем найди широту, соседние территории, моря и главные направления.',
      svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Схематическая карта мира"><path d="M70 80 C95 45 140 50 145 88 C125 100 100 118 78 108 C60 102 58 92 70 80 Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M162 62 C188 48 220 58 228 88 C210 105 188 101 174 120 C150 105 147 78 162 62 Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M238 118 C270 108 300 124 303 150 C275 168 242 160 238 118 Z" fill="none" stroke="currentColor" stroke-width="2"/><line x1="35" y1="110" x2="325" y2="110" stroke="currentColor" stroke-dasharray="5 5"/>'+svgText(180,105,'экватор',11)+svgText(103,138,'Америка',11)+svgText(190,138,'Евразия/Африка',11)+svgText(278,184,'Австралия',11)+'</svg>'
    };
  }
  function chemistrySvg(text){
    var t = lower(text);
    if (/бензол|аромат/.test(t)) {
      return {
        kind:'chemistry',
        title:'🧪 Структурная формула',
        caption:'Бензольное кольцо изображают шестиугольником с делокализованными π-связями. Это помогает отличать ароматические соединения.',
        svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Бензольное кольцо"><polygon points="180,45 245,82 245,157 180,195 115,157 115,82" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="180" cy="120" r="42" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="7 5"/>'+svgText(180,124,'C₆H₆',18)+'</svg>'
      };
    }
    if (/этанол|спирт|c2h5oh/.test(t)) {
      return {
        kind:'chemistry',
        title:'🧪 Структурная формула',
        caption:'У спиртов функциональная группа —OH. В этаноле она присоединена к углеводородному радикалу C₂H₅.',
        svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Этанол CH3-CH2-OH"><line x1="105" y1="110" x2="175" y2="110" stroke="currentColor" stroke-width="3"/><line x1="175" y1="110" x2="245" y2="110" stroke="currentColor" stroke-width="3"/>'+svgText(80,116,'CH₃',22)+svgText(175,116,'CH₂',22)+svgText(270,116,'OH',22)+svgText(245,148,'гидроксильная группа',11)+'</svg>'
      };
    }
    if (/уксус|карбон|кислот|cooh/.test(t)) {
      return {
        kind:'chemistry',
        title:'🧪 Структурная формула',
        caption:'Карбоновые кислоты содержат группу —COOH. В задачах ищи кислотные свойства именно по этой группе.',
        svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Уксусная кислота CH3-COOH"><line x1="95" y1="112" x2="155" y2="112" stroke="currentColor" stroke-width="3"/><line x1="155" y1="112" x2="215" y2="112" stroke="currentColor" stroke-width="3"/><line x1="215" y1="112" x2="265" y2="112" stroke="currentColor" stroke-width="3"/><line x1="215" y1="106" x2="215" y2="60" stroke="currentColor" stroke-width="3"/>'+svgText(75,118,'CH₃',20)+svgText(155,118,'C',20)+svgText(215,52,'O',20)+svgText(285,118,'OH',20)+svgText(214,148,'—COOH',12)+'</svg>'
      };
    }
    if (/аммиак|nh3/.test(t)) {
      return {
        kind:'chemistry',
        title:'🧪 Структурная формула',
        caption:'У аммиака три связи N—H и неподелённая электронная пара у азота.',
        svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Аммиак NH3"><line x1="180" y1="105" x2="180" y2="55" stroke="currentColor" stroke-width="3"/><line x1="180" y1="105" x2="120" y2="150" stroke="currentColor" stroke-width="3"/><line x1="180" y1="105" x2="240" y2="150" stroke="currentColor" stroke-width="3"/>'+svgText(180,112,'N',24)+svgText(180,47,'H',20)+svgText(110,164,'H',20)+svgText(250,164,'H',20)+svgText(206,86,'··',20)+'</svg>'
      };
    }
    return {
      kind:'chemistry',
      title:'🧪 Структурная формула',
      caption:'Структурная формула показывает, какие атомы соединены связями. Для реакции сначала найди функциональную группу.',
      svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Общая структурная формула"><line x1="100" y1="110" x2="170" y2="110" stroke="currentColor" stroke-width="3"/><line x1="170" y1="110" x2="240" y2="110" stroke="currentColor" stroke-width="3"/><line x1="170" y1="110" x2="170" y2="65" stroke="currentColor" stroke-width="3"/>'+svgText(80,116,'R',22)+svgText(170,116,'C',22)+svgText(260,116,'X',22)+svgText(170,57,'O/H',18)+svgText(180,160,'R—C—X: ищи группу и связи',12)+'</svg>'
    };
  }
  function physicsSvg(text){
    var t = lower(text);
    if (/электр|цеп|ток|напряж|сопротив|ом/.test(t)) {
      return {
        kind:'physics',
        title:'⚗️ Схема опыта',
        caption:'Электрическая цепь: ток идёт только по замкнутому контуру. Амперметр включают последовательно, вольтметр — параллельно участку.',
        svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Электрическая цепь"><rect x="80" y="65" width="200" height="110" rx="10" fill="none" stroke="currentColor" stroke-width="3"/><line x1="95" y1="175" x2="130" y2="175" stroke="currentColor" stroke-width="3"/><line x1="135" y1="166" x2="135" y2="184" stroke="currentColor" stroke-width="3"/><line x1="145" y1="160" x2="145" y2="190" stroke="currentColor" stroke-width="3"/><circle cx="230" cy="65" r="24" fill="none" stroke="currentColor" stroke-width="3"/><path d="M210 65 L220 55 L230 75 L240 55 L250 65" fill="none" stroke="currentColor" stroke-width="2"/>'+svgText(140,206,'источник',11)+svgText(230,69,'A',18)+svgText(233,109,'амперметр',11)+'</svg>'
      };
    }
    if (/линз|оптик|луч|фокус|зеркал/.test(t)) {
      return {
        kind:'physics',
        title:'⚗️ Схема опыта',
        caption:'Оптика: построй главный луч через оптический центр и луч, параллельный оси, который после линзы идёт через фокус.',
        svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Линза и ход лучей"><line x1="35" y1="115" x2="325" y2="115" stroke="currentColor" stroke-width="2"/><path d="M180 45 C160 80 160 150 180 185 C200 150 200 80 180 45 Z" fill="none" stroke="currentColor" stroke-width="3"/><line x1="75" y1="70" x2="180" y2="70" stroke="currentColor" stroke-width="2"/><line x1="180" y1="70" x2="270" y2="115" stroke="currentColor" stroke-width="2"/><line x1="75" y1="70" x2="270" y2="160" stroke="currentColor" stroke-width="2" stroke-dasharray="5 5"/>'+svgText(125,131,'F',12)+svgText(255,131,'F',12)+svgText(180,205,'линза',12)+'</svg>'
      };
    }
    if (/маятник|колеб|период|частот/.test(t)) {
      return {
        kind:'physics',
        title:'⚗️ Схема опыта',
        caption:'Маятник: период зависит от длины нити и ускорения свободного падения, а не от массы груза.',
        svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Маятник"><line x1="100" y1="42" x2="260" y2="42" stroke="currentColor" stroke-width="3"/><line x1="180" y1="42" x2="225" y2="150" stroke="currentColor" stroke-width="3"/><line x1="180" y1="42" x2="180" y2="162" stroke="currentColor" stroke-dasharray="5 5"/><circle cx="225" cy="150" r="20" fill="none" stroke="currentColor" stroke-width="3"/><path d="M158 78 A46 46 0 0 0 205 78" fill="none" stroke="currentColor" stroke-width="2"/>'+svgText(198,95,'φ',14)+svgText(146,115,'l',13)+svgText(225,186,'груз',12)+'</svg>'
      };
    }
    if (/рычаг|момент|блок|сила/.test(t)) {
      return {
        kind:'physics',
        title:'⚗️ Схема опыта',
        caption:'Рычаг: сравнивай моменты сил F·d относительно точки опоры. Чем длиннее плечо, тем меньше нужна сила.',
        svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Рычаг"><line x1="55" y1="120" x2="305" y2="120" stroke="currentColor" stroke-width="5"/><polygon points="180,120 160,170 200,170" fill="none" stroke="currentColor" stroke-width="3"/><line x1="95" y1="120" x2="95" y2="165" stroke="currentColor" stroke-width="3"/><line x1="270" y1="120" x2="270" y2="78" stroke="currentColor" stroke-width="3"/>'+svgText(95,184,'F₁',14)+svgText(270,70,'F₂',14)+svgText(180,188,'опора',12)+svgText(135,105,'d₁',12)+svgText(225,105,'d₂',12)+'</svg>'
      };
    }
    return {
      kind:'physics',
      title:'⚗️ Схема опыта',
      caption:'В физике схема нужна для сил, направлений, приборов и известных величин. Подпиши, что дано, что нужно найти, и выбери формулу.',
      svg:'<svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Общая схема опыта"><rect x="80" y="120" width="90" height="50" rx="8" fill="none" stroke="currentColor" stroke-width="3"/><line x1="170" y1="145" x2="260" y2="145" stroke="currentColor" stroke-width="3"/><path d="M260 145 L244 136 M260 145 L244 154" fill="none" stroke="currentColor" stroke-width="3"/><line x1="125" y1="120" x2="125" y2="70" stroke="currentColor" stroke-width="3"/><path d="M125 70 L116 86 M125 70 L134 86" fill="none" stroke="currentColor" stroke-width="3"/>'+svgText(268,139,'F',14)+svgText(142,78,'N',14)+svgText(125,190,'тело',12)+'</svg>'
    };
  }
  function visual(){
    var text = currentText();
    var s = subj();
    var sid = lower(s && ((s.id || '') + ' ' + (s.nm || '') + ' ' + (s.name || '')));
    // wave92a: visual aids are gated by the selected subject first.
    // Short text regexes like "ток", "ом", "луч" caused false physics diagrams in ОБЖ/соц./history topics.
    var geoHints = /треуг|окруж|радиус|диаметр|параллел|угол|трапец|координат|парабол|график/.test(lower(text));
    if (/геом|geometry/.test(sid) || ((/alg|math|алгеб|матем/.test(sid)) && geoHints)) return geometrySvg(text);
    if (/геогр|geography/.test(sid)) return geographySvg(text);
    if (/хим|chem/.test(sid)) return chemistrySvg(text);
    if (/физ|physics/.test(sid)) return physicsSvg(text);
    return null;
  }
  function mountVisual(){
    if (isSimpleMode()) { removeById('wave91g-visual'); return; }
    var host = document.getElementById('s-play');
    var q = question();
    var old = document.getElementById('wave91g-visual');
    if (!active('s-play') || !host || !q) {
      if (old) old.remove();
      return;
    }
    var v = visual();
    var key = keyFor(q) + '|' + (v && v.kind || 'none');
    if (!v) {
      if (old) old.remove();
      return;
    }
    if (old && old.getAttribute('data-key') === key) return;
    if (old) old.remove();
    var card = document.createElement('div');
    card.id = 'wave91g-visual';
    card.className = 'wave91g-card';
    card.setAttribute('data-key', key);
    card.innerHTML = '<h3>'+esc(v.title)+'</h3>'+v.svg+'<p class="wave91g-caption">'+esc(v.caption)+'</p>';
    var qc = document.getElementById('qc');
    if (qc && qc.parentNode) qc.parentNode.insertBefore(card, qc.nextSibling);
  }

  function sampleQuestions(limit){
    var out = [];
    var t = topic();
    if (t && typeof t.gen === 'function') {
      var guard = 0;
      while (out.length < (limit || 8) && guard < 40) {
        guard += 1;
        try {
          var q = t.gen();
          if (q && qText(q)) out.push(q);
        } catch(_){}
      }
    }
    if (!out.length && question()) out.push(question());
    return out;
  }
  function worksheetHtml(){
    var s = subj(), t = topic();
    var title = 'Рабочий лист';
    if (s && s.nm) title += ' · ' + s.nm;
    if (t && t.nm) title += ' · ' + t.nm;
    var qs = sampleQuestions(10);
    var rows = qs.map(function(q, i){
      var opts = Array.isArray(q.options) ? q.options : (Array.isArray(q.o) ? q.o : []);
      var optHtml = opts.length ? '<ol type="A">'+opts.map(function(o){ return '<li>'+esc(strip(o))+'</li>'; }).join('')+'</ol>' : '<div class="line"></div><div class="line"></div>';
      return '<section><h3>Задание '+(i+1)+'</h3><p>'+esc(qText(q))+'</p>'+optHtml+'<p class="hint">Подсказка для проверки: '+esc(strip(q.hint || q.h || 'сначала выпиши известные данные и правило.'))+'</p></section>';
    }).join('');
    return '<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>'+esc(title)+'</title><style>body{font-family:Arial,sans-serif;max-width:820px;margin:28px auto;color:#111;line-height:1.35}h1{font-size:22px}section{break-inside:avoid;border:1px solid #ddd;border-radius:12px;padding:12px;margin:12px 0}.hint{color:#666;font-size:12px}.line{border-bottom:1px solid #bbb;height:28px}.meta{font-size:12px;color:#666}button{padding:10px 14px;border-radius:10px;border:1px solid #aaa;background:#fff;font-weight:700}@media print{button{display:none}body{margin:0}}</style></head><body><button onclick="window.print()">Печать / сохранить как PDF</button><h1>'+esc(title)+'</h1><p class="meta">Сгенерировано тренажёром · '+esc(new Date().toLocaleDateString('ru-RU'))+' · '+qs.length+' заданий</p>'+rows+'</body></html>';
  }
  function openWorksheet(){
    try {
      var html = worksheetHtml();
      var w = window.open('', '_blank');
      if (!w) throw new Error('popup blocked');
      w.document.open();
      w.document.write(html);
      w.document.close();
      setTimeout(function(){ try { w.focus(); } catch(_){} }, 120);
    } catch(e) {
      try {
        var blob = new Blob([worksheetHtml()], { type:'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'worksheet_grade_' + grade() + '.html';
        document.body.appendChild(a);
        a.click();
        setTimeout(function(){ URL.revokeObjectURL(url); if (a.parentNode) a.remove(); }, 500);
      } catch(_){ toast('Не удалось создать рабочий лист'); }
    }
  }

  function modal(title, body){
    var old = document.querySelector('.wave91g-modal');
    if (old) old.remove();
    var m = document.createElement('div');
    m.className = 'wave91g-modal';
    m.innerHTML = '<div class="wave91g-dialog" role="dialog" aria-modal="true"><h3>'+esc(title)+'</h3><div class="wave91g-body">'+body+'</div><div class="wave91g-actions"><button class="wave91g-btn primary" data-close="1">Закрыть</button></div></div>';
    m.addEventListener('click', function(ev){
      if (ev.target === m || (ev.target && ev.target.getAttribute('data-close'))) m.remove();
    });
    document.body.appendChild(m);
    return m;
  }
  function sortWidget(){
    var items = ['Прочитать условие', 'Выписать данные', 'Выбрать правило', 'Решить', 'Проверить ответ'];
    return '<p class="wave91g-sub">F1: сортировка шагов решения. Перемести этапы в правильный порядок и проверь себя.</p><div id="wave91g-sort-list" class="wave91g-list">'+items.sort(function(){ return Math.random() - 0.5; }).map(function(x){ return '<div class="wave91g-item" data-v="'+esc(x)+'"><span>'+esc(x)+'</span><span><button class="wave91g-btn" data-up="1">↑</button><button class="wave91g-btn" data-down="1">↓</button></span></div>'; }).join('')+'</div><button class="wave91g-btn good" id="wave91g-sort-check">Проверить порядок</button>';
  }
  function matchWidget(){
    return '<p class="wave91g-sub">F2: соответствие A↔B. Соедини понятие с объяснением.</p><table class="wave91g-table"><tr><th>A</th><th>B</th></tr><tr><td>Гипотеза</td><td><select data-match="Гипотеза"><option>выбери</option><option>предположение</option><option>единица измерения</option><option>итог вычисления</option></select></td></tr><tr><td>Формула</td><td><select data-match="Формула"><option>выбери</option><option>связь величин</option><option>историческая дата</option><option>стиль дизайна</option></select></td></tr><tr><td>Критерий</td><td><select data-match="Критерий"><option>выбери</option><option>признак проверки</option><option>случайная величина</option><option>часть речи</option></select></td></tr></table><button class="wave91g-btn good" id="wave91g-match-check">Проверить соответствие</button>';
  }
  function tableWidget(){
    return '<p class="wave91g-sub">F3: работа с таблицей данных. Найди максимум, минимум и сделай вывод.</p><table class="wave91g-table"><tr><th>День</th><th>Задания</th><th>Ошибки</th><th>Точность</th></tr><tr><td>Пн</td><td>20</td><td>5</td><td>75%</td></tr><tr><td>Вт</td><td>24</td><td>4</td><td>83%</td></tr><tr><td>Ср</td><td>18</td><td>6</td><td>67%</td></tr></table><p class="wave91g-sub">Вопрос: в какой день точность была максимальной?</p><div class="wave91g-actions"><button class="wave91g-btn" data-table-a="Пн">Пн</button><button class="wave91g-btn" data-table-a="Вт">Вт</button><button class="wave91g-btn" data-table-a="Ср">Ср</button></div>';
  }
  function graphWidget(){
    return '<p class="wave91g-sub">F4: анализ графика. Прочитай по оси X и Y, где значение максимально.</p><svg class="wave91g-svg" viewBox="0 0 360 220" role="img" aria-label="Линейный график"><line x1="45" y1="175" x2="320" y2="175" stroke="currentColor" stroke-width="2"/><line x1="55" y1="25" x2="55" y2="185" stroke="currentColor" stroke-width="2"/><polyline points="70,150 120,125 170,95 220,130 270,70" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="270" cy="70" r="5" fill="currentColor"/>'+svgText(70,195,'1',11)+svgText(120,195,'2',11)+svgText(170,195,'3',11)+svgText(220,195,'4',11)+svgText(270,195,'5',11)+svgText(280,62,'max',12)+'</svg><button class="wave91g-btn good" data-graph-check="5">Максимум при x=5</button>';
  }
  function constructionWidget(){
    return '<p class="wave91g-sub">F5: геометрическое построение. Кликни на плоскости там, где должна быть точка пересечения медиан условного треугольника.</p><svg id="wave91g-plane" class="wave91g-svg wave91g-plane" viewBox="0 0 360 220" role="img" aria-label="Плоскость для построения"><defs><pattern id="w91g-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="currentColor" stroke-width=".4" opacity=".25"/></pattern></defs><rect x="0" y="0" width="360" height="220" fill="url(#w91g-grid)"/><polygon points="75,170 290,165 170,45" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="180" cy="123" r="4" fill="currentColor" opacity=".25"/></svg><p class="wave91g-mini" id="wave91g-plane-note">Нажми на чертёж.</p>';
  }
  function canvasWidget(){
    return '<p class="wave91g-sub">F6: рукописный ввод формул. Напиши решение от руки — это черновик, который можно очистить.</p><canvas id="wave91g-canvas" class="wave91g-canvas" width="640" height="220"></canvas><div class="wave91g-actions"><button class="wave91g-btn" id="wave91g-canvas-clear">Очистить</button><button class="wave91g-btn good" id="wave91g-canvas-save">Сохранить черновик</button></div>';
  }
  function bindLab(root){
    var list = root.querySelector('#wave91g-sort-list');
    if (list) {
      list.addEventListener('click', function(ev){
        var b = ev.target && ev.target.closest && ev.target.closest('button');
        if (!b) return;
        var item = b.closest('.wave91g-item');
        if (!item) return;
        if (b.getAttribute('data-up') && item.previousElementSibling) list.insertBefore(item, item.previousElementSibling);
        if (b.getAttribute('data-down') && item.nextElementSibling) list.insertBefore(item.nextElementSibling, item);
      });
      var chk = root.querySelector('#wave91g-sort-check');
      if (chk) chk.onclick = function(){
        var good = ['Прочитать условие','Выписать данные','Выбрать правило','Решить','Проверить ответ'];
        var got = Array.prototype.map.call(list.querySelectorAll('.wave91g-item'), function(el){ return el.getAttribute('data-v'); });
        toast(got.join('|') === good.join('|') ? 'Порядок верный' : 'Пока порядок нарушен');
      };
    }
    var match = root.querySelector('#wave91g-match-check');
    if (match) match.onclick = function(){
      var ok = true;
      Array.prototype.forEach.call(root.querySelectorAll('[data-match]'), function(sel){
        var k = sel.getAttribute('data-match'), v = sel.value;
        if ((k === 'Гипотеза' && v !== 'предположение') || (k === 'Формула' && v !== 'связь величин') || (k === 'Критерий' && v !== 'признак проверки')) ok = false;
      });
      toast(ok ? 'Соответствия верные' : 'Есть неверные пары');
    };
    Array.prototype.forEach.call(root.querySelectorAll('[data-table-a]'), function(b){
      b.onclick = function(){ toast(b.getAttribute('data-table-a') === 'Вт' ? 'Верно: 83%' : 'Проверь строку с максимальной точностью'); };
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-graph-check]'), function(b){
      b.onclick = function(){ toast('Верно: самая высокая точка на x=' + b.getAttribute('data-graph-check')); };
    });
    var plane = root.querySelector('#wave91g-plane');
    if (plane) plane.addEventListener('click', function(ev){
      var r = plane.getBoundingClientRect();
      var x = (ev.clientX - r.left) * 360 / Math.max(1, r.width);
      var y = (ev.clientY - r.top) * 220 / Math.max(1, r.height);
      var old = plane.querySelector('.wave91g-user-point');
      if (old) old.remove();
      var c = document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('class','wave91g-user-point');
      c.setAttribute('cx', String(Math.round(x)));
      c.setAttribute('cy', String(Math.round(y)));
      c.setAttribute('r','7');
      c.setAttribute('fill','currentColor');
      plane.appendChild(c);
      var note = root.querySelector('#wave91g-plane-note');
      var dist = Math.sqrt(Math.pow(x - 180, 2) + Math.pow(y - 123, 2));
      if (note) note.textContent = dist < 25 ? 'Попал близко к центру масс.' : 'Попробуй ближе к пересечению медиан.';
    });
    var canvas = root.querySelector('#wave91g-canvas');
    if (canvas) {
      var ctx = canvas.getContext('2d'), down = false;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#111827';
      function pt(ev){
        var r = canvas.getBoundingClientRect();
        var e = ev.touches && ev.touches[0] ? ev.touches[0] : ev;
        return { x:(e.clientX-r.left)*canvas.width/Math.max(1,r.width), y:(e.clientY-r.top)*canvas.height/Math.max(1,r.height) };
      }
      function start(ev){ down = true; var p = pt(ev); ctx.beginPath(); ctx.moveTo(p.x,p.y); ev.preventDefault(); }
      function move(ev){ if(!down) return; var p = pt(ev); ctx.lineTo(p.x,p.y); ctx.stroke(); ev.preventDefault(); }
      function end(){ down = false; }
      canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move); document.addEventListener('mouseup', end);
      canvas.addEventListener('touchstart', start, { passive:false }); canvas.addEventListener('touchmove', move, { passive:false }); canvas.addEventListener('touchend', end);
      var clear = root.querySelector('#wave91g-canvas-clear');
      if (clear) clear.onclick = function(){ ctx.clearRect(0,0,canvas.width,canvas.height); };
      var save = root.querySelector('#wave91g-canvas-save');
      if (save) save.onclick = function(){
        try { localStorage.setItem('trainer_formula_canvas_wave91g_'+grade(), canvas.toDataURL('image/png')); toast('Черновик сохранён'); }
        catch(_){ toast('Не удалось сохранить черновик'); }
      };
    }
  }
  function openLab(kind){
    var tabs = '<div class="wave91g-actions"><button class="wave91g-btn" data-kind="sort">F1 timeline</button><button class="wave91g-btn" data-kind="match">F2 match</button><button class="wave91g-btn" data-kind="table">F3 table</button><button class="wave91g-btn" data-kind="graph">F4 graph</button><button class="wave91g-btn" data-kind="construct">F5 plane</button><button class="wave91g-btn" data-kind="canvas">F6 canvas</button></div>';
    function body(k){
      if (k === 'match') return matchWidget();
      if (k === 'table') return tableWidget();
      if (k === 'graph') return graphWidget();
      if (k === 'construct') return constructionWidget();
      if (k === 'canvas') return canvasWidget();
      return sortWidget();
    }
    var root = modal('🧩 Интерактивные форматы', tabs + '<div id="wave91g-lab-body" class="wave91g-card">'+body(kind || 'sort')+'</div>');
    function set(k){
      var box = root.querySelector('#wave91g-lab-body');
      if (box) {
        box.innerHTML = body(k);
        bindLab(root);
      }
    }
    root.addEventListener('click', function(ev){
      var b = ev.target && ev.target.closest && ev.target.closest('[data-kind]');
      if (b) set(b.getAttribute('data-kind'));
    });
    bindLab(root);
  }
  function customFormat(){
    if (isSimpleMode()) { removeById('wave91g-format'); return; }
    var q = question();
    if (!q || !active('s-play')) return;
    var kind = lower(q.format || q.fmt || q.type || q.kind || '');
    if (!kind || !/(sort|timeline|match|table|graph|construct|canvas|hand)/.test(kind)) return;
    var old = document.getElementById('wave91g-format');
    var key = keyFor(q) + '|' + kind;
    if (old && old.getAttribute('data-key') === key) return;
    if (old) old.remove();
    var card = document.createElement('div');
    card.id = 'wave91g-format';
    card.className = 'wave91g-card';
    card.setAttribute('data-key', key);
    card.innerHTML = '<h3>🧩 Интерактивное задание</h3><p class="wave91g-sub">Этот вопрос поддерживает расширенный формат: '+esc(kind)+'.</p><button class="wave91g-btn primary" id="wave91g-open-format">Открыть интерактив</button>';
    var opts = document.getElementById('opts') || document.getElementById('qc');
    if (opts && opts.parentNode) opts.parentNode.insertBefore(card, opts);
    var b = card.querySelector('#wave91g-open-format');
    if (b) b.onclick = function(){ openLab(kind); };
  }
  function mainCard(){
    if (isSimpleMode()) { removeById('wave91g-main-card'); return; }
    if (!active('s-main')) return;
    if (document.getElementById('wave91g-main-card')) return;
    var host = document.querySelector('#s-main .w');
    if (!host) return;
    var card = document.createElement('div');
    card.id = 'wave91g-main-card';
    card.className = 'wave91g-card wave91g-main-card';
    card.innerHTML = '<h3>🧩 Визуальные и практические задания</h3><p class="wave91g-sub">SVG-чертежи для геометрии, карты для географии, структурные формулы для химии, схемы опытов для физики и шесть интерактивных форматов заданий.</p><div class="wave91g-grid"><button class="wave91g-btn primary" id="wave91g-open-lab">Открыть интерактив</button><button class="wave91g-btn" id="wave91g-open-worksheet">Рабочий лист / PDF</button></div>';
    var after = document.getElementById('sg') || host.firstElementChild;
    if (after && after.parentNode) after.parentNode.insertBefore(card, after.nextSibling);
    else host.appendChild(card);
    var lab = card.querySelector('#wave91g-open-lab');
    if (lab) lab.onclick = function(){ openLab('sort'); };
    var ws = card.querySelector('#wave91g-open-worksheet');
    if (ws) ws.onclick = openWorksheet;
  }
  function playTools(){
    if (isSimpleMode()) { removeById('wave91g-play-tools'); return; }
    if (!active('s-play') || !question()) return;
    if (document.getElementById('wave91g-play-tools')) return;
    var h = document.getElementById('s-play');
    var w = h && h.querySelector('.w');
    if (!w) return;
    var box = document.createElement('div');
    box.id = 'wave91g-play-tools';
    box.className = 'wave91g-actions';
    box.innerHTML = '<button class="wave91g-btn" id="wave91g-play-lab">🧩 Интерактив</button><button class="wave91g-btn" id="wave91g-play-sheet">🧾 Лист</button>';
    var anchor = document.getElementById('ha') || document.getElementById('pa') || w.lastElementChild;
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(box, anchor);
    else w.appendChild(box);
    var b1 = box.querySelector('#wave91g-play-lab');
    if (b1) b1.onclick = function(){ openLab('sort'); };
    var b2 = box.querySelector('#wave91g-play-sheet');
    if (b2) b2.onclick = openWorksheet;
  }
  function mount(){
    injectStyle();
    mainCard();
    mountVisual();
    customFormat();
    playTools();
  }
  function patch(){
    try {
      if (typeof render === 'function' && !render.__wave91g) {
        var oldRender = render;
        render = function(){
          var out = oldRender.apply(this, arguments);
          setTimeout(mount, 0);
          return out;
        };
        render.__wave91g = true;
        window.render = render;
      }
    } catch(_){}
    try {
      if (typeof go === 'function' && !go.__wave91g) {
        var oldGo = go;
        go = function(){
          var out = oldGo.apply(this, arguments);
          setTimeout(mount, 0);
          return out;
        };
        go.__wave91g = true;
        window.go = go;
      }
    } catch(_){}
  }
  function boot(){
    patch();
    mount();
    window.wave91gVisualInteractive = {
      version: W,
      grade: grade(),
      openWorksheet: openWorksheet,
      openInteractiveLab: openLab,
      auditSnapshot: function(){
        return {
          wave: W,
          hasMainCard: !!document.getElementById('wave91g-main-card') || !!document.getElementById('s-main'),
          hasVisual: !!document.getElementById('wave91g-visual') || !!document.getElementById('s-play'),
          supports: ['E1-geometry-svg','E2-geography-svg','E3-chemistry-structures','E5-print-worksheet-pdf','E6-physics-schemes','F1-sort','F2-match','F3-table','F4-graph','F5-construction','F6-canvas']
        };
      }
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
  window.addEventListener('load', function(){ setTimeout(boot, 0); }, { once:true });
  if (typeof setInterval === 'function') {
    tickTimer = setInterval(function(){ patch(); mount(); }, 900);
    if (typeof setTimeout === 'function') setTimeout(function(){ clearInterval(tickTimer); }, 10000);
  }
})();

/* wave91h: UX, gamification and local reporting pack */
(function(){
  'use strict';
  var W='wave91h',r=window,timer=null;
  function g(){return String(r.GRADE_NUM||r.GRADE_NO||document.body.getAttribute('data-grade')||'x')}
  function day(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function e(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
  function txt(x){return String(x==null?'':x).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
  function R(k,f){try{var v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(_){return f}}
  function S(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}
  function K(s){return 'trainer_'+s+'_wave91h_'+g()}
  function subjects(){return Array.isArray(r.SUBJ)?r.SUBJ:[]}
  function topicsOf(s){return (s&&(Array.isArray(s.tops)?s.tops:Array.isArray(s.t)?s.t:Array.isArray(s.topics)?s.topics:[]))||[]}
  function main(){return document.querySelector('#s-main .w')||document.getElementById('s-main')}
  function active(id){var x=document.getElementById(id);return !!(x&&/\bon\b/.test(x.className||''))}
  function curS(){try{if(typeof cS!=='undefined'&&cS)return cS}catch(_){}return r.cS||null}
  function curT(){try{if(typeof cT!=='undefined'&&cT)return cT}catch(_){}return r.cT||null}
  function toast(m){try{if(typeof showToast==='function')return showToast(m);var d=document.createElement('div');d.className='wave91h-toast';d.textContent=m;document.body.appendChild(d);requestAnimationFrame(function(){d.classList.add('show')});setTimeout(function(){if(d.parentNode)d.remove()},2400)}catch(_){}}
  function dl(n,b,t){try{var u=URL.createObjectURL(new Blob([b],{type:t||'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download=n;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},300)}catch(_){}}
  function css(){if(document.getElementById('wave91h-style'))return;var s=document.createElement('style');s.id='wave91h-style';s.textContent='.wave91h-card{margin:10px 0;padding:14px;border:1px solid var(--border);border-radius:18px;background:var(--card);box-shadow:0 10px 28px rgba(15,23,42,.06)}.wave91h-card h3{margin:0 0 6px;font-family:Unbounded,system-ui,sans-serif;font-size:14px}.wave91h-sub{font-size:12px;line-height:1.45;color:var(--muted);margin:0 0 10px}.wave91h-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:9px}.wave91h-kpi{padding:10px;border:1px solid var(--border);border-radius:14px;background:var(--bg)}.wave91h-kpi span{display:block;color:var(--muted);font-size:10px}.wave91h-kpi b{display:block;font-size:17px}.wave91h-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.wave91h-btn{border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);font:800 12px Golos Text,system-ui;padding:9px 11px;cursor:pointer}.wave91h-btn.primary{border-color:transparent;background:var(--accent);color:#fff}.wave91h-input{border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);padding:9px 11px;font:inherit;min-width:0}.wave91h-bar{height:9px;background:var(--border);border-radius:999px;overflow:hidden}.wave91h-fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--green));border-radius:inherit}.wave91h-heat{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}.wave91h-cell{padding:8px;border:1px solid var(--border);border-radius:12px;background:var(--bg);font-size:11px}.wave91h-cell b{display:block;font-size:11px}.wave91h-cell[data-l="0"]{opacity:.62}.wave91h-cell[data-l="1"]{border-color:var(--orange)}.wave91h-cell[data-l="2"]{border-color:var(--accent)}.wave91h-cell[data-l="3"]{border-color:var(--green)}.wave91h-modal{position:fixed;inset:0;z-index:10072;background:rgba(15,23,42,.58);display:flex;align-items:center;justify-content:center;padding:16px}.wave91h-dialog{width:min(920px,100%);max-height:88vh;overflow:auto;border:1px solid var(--border);border-radius:22px;background:var(--card);color:var(--text);padding:16px;box-shadow:0 24px 80px rgba(0,0,0,.28)}.wave91h-word{display:flex;gap:5px;flex-wrap:wrap;margin:7px 0}.wave91h-letter{min-width:30px;text-align:center;border-radius:9px;padding:7px 6px;border:1px solid var(--border);font-weight:900}.wave91h-letter.good{background:var(--gbg);color:var(--green)}.wave91h-letter.mid{background:var(--obg);color:var(--orange)}.wave91h-qr svg{width:min(280px,100%);height:auto;background:#fff;border-radius:14px;padding:10px}.wave91h-toast{position:fixed;left:50%;bottom:24px;z-index:10080;transform:translateX(-50%) translateY(10px);opacity:0;padding:10px 13px;border-radius:14px;background:var(--text);color:var(--bg);font-size:13px;font-weight:850;box-shadow:0 18px 50px rgba(0,0,0,.25);transition:.18s}.wave91h-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}.wave91h-quiet{margin:8px 0;padding:9px 11px;border:1px dashed var(--orange);border-radius:14px;background:var(--obg);color:var(--orange);font-size:12px;font-weight:800}body.wave91h-quiet-active .wave91e-pomodoro-mini,body.wave91h-quiet-active .wave91f-toast,body.wave91h-quiet-active .wave91h-toast{filter:saturate(.4);opacity:.9}body.simple-mode .wave91h-advanced{display:none!important}';(document.head||document.documentElement).appendChild(s)}
  function modal(t,h,cb){css();var o=document.createElement('div'),d=document.createElement('div');o.className='wave91h-modal';d.className='wave91h-dialog';d.innerHTML='<div class="wave91h-actions" style="justify-content:space-between"><h3>'+e(t)+'</h3><button class="wave91h-btn" data-x>Закрыть</button></div>'+h;o.appendChild(d);document.body.appendChild(o);function close(){o.remove()}o.onclick=function(ev){if(ev.target===o)close()};d.querySelector('[data-x]').onclick=close;if(cb)cb(d,close);return d}
  function progress(){return R('trainer_progress_'+g(),{})||{}}
  function journal(){var a=R('trainer_journal_'+g(),[]);return Array.isArray(a)?a:[]}
  function marathon(){var x=R('trainer_marathon_wave91f_'+g(),null)||R('trainer_marathon_wave91h_'+g(),null);if(!x||typeof x!=='object')x=R('trainer_marathon_wave91f_'+g(),{});return x&&typeof x==='object'?x:{}}
  function answerCount(){var p=progress(),n=0;['total','answered','questions','count'].forEach(function(k){if(+p[k]>n)n=+p[k]});if(p.ok||p.err)n=Math.max(n,(+p.ok||0)+(+p.err||0));var act=R('trainer_activity_'+g(),[]);if(Array.isArray(act))n=Math.max(n,act.reduce(function(a,x){return a+(+((x&&x.count)||1)||0)},0));n=Math.max(n,journal().length);return n}
  function level(){var n=answerCount(),names=['Новичок','Ученик','Практик','Знаток','Мастер','Эксперт','Легенда'],limits=[0,50,150,400,900,1800,3200],i=0;for(var j=0;j<limits.length;j++)if(n>=limits[j])i=j;var next=limits[i+1]||limits[i],pct=next>limits[i]?Math.round((n-limits[i])/(next-limits[i])*100):100;return{name:names[i]||'Легенда',idx:i+1,total:n,next:next,pct:Math.max(0,Math.min(100,pct))}}
  function heatRows(){var rows=[],p=progress(),diff=R('trainer_difficulty_tags_wave91f_'+g(),{}),j=journal();subjects().forEach(function(s){topicsOf(s).slice(0,9).forEach(function(t){var name=t.nm||t.name||t.id||'Тема',key=String((s.id||s.nm)+'|'+(t.id||name)).toLowerCase(),score=0;if(JSON.stringify(p).toLowerCase().indexOf(String(t.id||name).toLowerCase())>=0)score=2;Object.keys(diff||{}).forEach(function(k){var v=diff[k]||{};if(String(v.topic||'').toLowerCase().indexOf(String(name).toLowerCase())>=0)score=Math.max(score,2)});j.forEach(function(x){if(JSON.stringify(x).toLowerCase().indexOf(String(name).toLowerCase())>=0)score=Math.max(score,1)});if(answerCount()>60&&score<1)score=1;rows.push({subject:s.nm||s.name||s.id,topic:name,level:Math.min(3,score)})})});return rows.slice(0,64)}
  function openHeat(){var rows=heatRows(),h='<p class="wave91h-sub">G2: карта знаний показывает темы по состоянию локального прогресса, журнала ошибок и ручных тегов сложности.</p><div class="wave91h-heat">'+rows.map(function(x){var l=['нет данных','ошибки/повтор','в работе','уверенно'][x.level]||'нет данных';return '<div class="wave91h-cell" data-l="'+x.level+'"><b>'+e(x.topic)+'</b><span>'+e(x.subject)+'</span><br><small>'+l+'</small></div>'}).join('')+'</div>';modal('🧠 Heat map знаний',h)}
  function fgos(){var groups=[['Математика',['мат','алг','геом','вероят']],['Язык и речь',['рус','лит','англ','english']],['Естественно-научные',['физ','хим','био','геог','окруж']],['Социально-гуманитарные',['ист','общ','soc']],['Цифровые',['инф','код','it']],['Творческие',['арт','искус','дизайн']]],subs=subjects(),ans=answerCount();return groups.map(function(gp){var topics=0;subs.forEach(function(s){var nm=String((s.id||'')+' '+(s.nm||s.name||'')).toLowerCase();if(gp[1].some(function(k){return nm.indexOf(k)>=0}))topics+=topicsOf(s).length||1});var pct=Math.max(0,Math.min(100,Math.round((ans/(Math.max(8,topics)*4))*100)));return{name:gp[0],topics:topics,pct:pct}})}
  function fgosHtml(){return '<div class="wave91h-grid">'+fgos().map(function(x){return '<div class="wave91h-kpi"><span>'+e(x.name)+' · '+x.topics+' тем</span><b>'+x.pct+'%</b><div class="wave91h-bar"><div class="wave91h-fill" style="width:'+x.pct+'%"></div></div></div>'}).join('')+'</div>'}
  function openFgos(){modal('📘 Прогресс ФГОС', '<p class="wave91h-sub">G4: агрегированный ориентир по предметным областям. Процент считается по локальной активности и числу тем в области.</p>'+fgosHtml())}
  function notifCfg(){return R(K('notifications'),{enabled:false,time:'18:00'})}
  function quietCfg(){return R(K('quiet_hour'),{enabled:false,from:'21:00',to:'07:00'})}
  function minOf(v){var m=/^(\d{1,2}):(\d{2})$/.exec(v||'');return m?+m[1]*60+ +m[2]:0}
  function quietActive(){var c=quietCfg();if(!c.enabled)return false;var d=new Date(),n=d.getHours()*60+d.getMinutes(),a=minOf(c.from),b=minOf(c.to);return a<=b?(n>=a&&n<b):(n>=a||n<b)}
  function applyQuiet(){var on=quietActive();if(document.body&&document.body.classList&&typeof document.body.classList.toggle==='function')document.body.classList.toggle('wave91h-quiet-active',on);var host=main();if(!host)return;var old=document.getElementById('wave91h-quiet-banner');if(on&&!old){var b=document.createElement('div');b.id='wave91h-quiet-banner';b.className='wave91h-quiet';b.textContent='🌙 Тихий час активен: уведомления и лишние сигналы приглушены.';(typeof host.insertBefore==='function'?host.insertBefore(b,host.firstChild):(typeof host.appendChild==='function'&&host.appendChild(b)))}else if(!on&&old)old.remove()}
  function showNotification(){var c=notifCfg();if(!c.enabled||quietActive()||!('Notification' in r)||Notification.permission!=='granted')return;var title='Тренажёр: 15 минут практики';var body='Сегодня: 5 заданий и разбор одной ошибки.';try{if(navigator.serviceWorker&&navigator.serviceWorker.ready){navigator.serviceWorker.ready.then(function(reg){try{reg.showNotification(title,{body:body,tag:'trainer3-daily-'+g(),icon:'./assets/icons/icon-192.png'})}catch(_){new Notification(title,{body:body})}})}else new Notification(title,{body:body})}catch(_){}}
  function scheduleNotification(){var c=notifCfg();if(!c.enabled)return;var d=new Date(),p=(c.time||'18:00').split(':'),t=new Date();t.setHours(+p[0]||18,+p[1]||0,0,0);if(t<=d)t.setDate(t.getDate()+1);var delay=Math.min(t-d,2147480000);setTimeout(function(){showNotification();scheduleNotification()},delay)}
  function saveNotify(d){var time=d.querySelector('#wave91h-notify-time').value||'18:00',enabled=d.querySelector('#wave91h-notify-enabled').checked,c=notifCfg();c.time=time;c.enabled=enabled;S(K('notifications'),c);if(enabled&&'Notification' in r&&Notification.permission==='default')Notification.requestPermission().then(function(){toast('Настройки уведомлений сохранены')});else toast('Настройки уведомлений сохранены');scheduleNotification()}
  function openSettings(){var n=notifCfg(),q=quietCfg(),h='<div class="wave91h-grid"><label class="wave91h-kpi"><span>G1 Notification API</span><b style="font-size:13px"><input id="wave91h-notify-enabled" type="checkbox" '+(n.enabled?'checked':'')+'> напоминать</b><input id="wave91h-notify-time" class="wave91h-input" type="time" value="'+e(n.time||'18:00')+'"></label><label class="wave91h-kpi"><span>G6 Тихий час</span><b style="font-size:13px"><input id="wave91h-quiet-enabled" type="checkbox" '+(q.enabled?'checked':'')+'> включён</b><div class="wave91h-actions"><input id="wave91h-quiet-from" class="wave91h-input" type="time" value="'+e(q.from||'21:00')+'"><input id="wave91h-quiet-to" class="wave91h-input" type="time" value="'+e(q.to||'07:00')+'"></div></label></div><button class="wave91h-btn primary" id="wave91h-save-ux">Сохранить</button>';modal('⚙️ Уведомления и тихий час',h,function(d){d.querySelector('#wave91h-save-ux').onclick=function(){saveNotify(d);S(K('quiet_hour'),{enabled:d.querySelector('#wave91h-quiet-enabled').checked,from:d.querySelector('#wave91h-quiet-from').value||'21:00',to:d.querySelector('#wave91h-quiet-to').value||'07:00'});applyQuiet()}})}
  function seasonal(){var m=new Date().getMonth(),name=m<2?'Зимний рывок':m<5?'Весенний спринт':m<8?'Летняя база':m<11?'Осенний зачёт':'Зимний рывок',pts=answerCount();return{name:name,pts:pts,pct:Math.min(100,Math.round(pts/3))}}
  function quizTarget(){var terms=['УГОЛ','СИЛА','АТОМ','РИФМА','ГРАФИК','КОРЕНЬ','СТИЛЬ','ВЕКТОР','ТЕЗИС','КОСИНУС'];var d=day().replace(/-/g,''),n=0;for(var i=0;i<d.length;i++)n+=d.charCodeAt(i);return terms[(n+parseInt(g(),10)||0)%terms.length]}
  function quiz(){return R(K('daily_quiz_'+day()),{target:quizTarget(),tries:[],done:false})}
  function renderTry(tar,got){got=String(got||'').toUpperCase();var out='<div class="wave91h-word">';for(var i=0;i<Math.max(tar.length,got.length);i++){var ch=got[i]||'·',cl=tar[i]===got[i]?'good':(tar.indexOf(ch)>=0?'mid':'');out+='<span class="wave91h-letter '+cl+'">'+e(ch)+'</span>'}return out+'</div>'}
  function openQuiz(){var q=quiz(),h='<p class="wave91h-sub">H2: термин дня в Wordle-стиле. Введи слово, получи подсветку букв. Попыток: 6.</p><div id="wave91h-quiz-box">'+q.tries.map(function(x){return renderTry(q.target,x)}).join('')+'</div>'+(q.done?'<p class="wave91h-sub"><b>Готово:</b> '+e(q.target)+'</p>':'<div class="wave91h-actions"><input id="wave91h-quiz-input" class="wave91h-input" placeholder="Слово"><button id="wave91h-quiz-send" class="wave91h-btn primary">Проверить</button></div>');modal('🧩 Daily quiz',h,function(d){var b=d.querySelector('#wave91h-quiz-send');if(b)b.onclick=function(){var inp=d.querySelector('#wave91h-quiz-input'),v=String(inp.value||'').trim().toUpperCase();if(!v)return;q.tries.push(v);q.done=v===q.target||q.tries.length>=6;S(K('daily_quiz_'+day()),q);d.remove();openQuiz()}})}
  function parentReport(){var lv=level(),sea=seasonal(),body='<!doctype html><html lang="ru"><meta charset="utf-8"><title>Отчёт родителю</title><style>body{font-family:system-ui,sans-serif;margin:32px;color:#111}h1{font-size:24px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.card{border:1px solid #ddd;border-radius:14px;padding:14px}.bar{height:10px;background:#eee;border-radius:999px;overflow:hidden}.fill{height:100%;background:#111}.muted{color:#666;font-size:13px}@media print{button{display:none}}</style><button onclick="print()">Печать / сохранить PDF</button><h1>Отчёт родителю · '+e(g())+' класс</h1><p class="muted">Сформировано '+new Date().toLocaleString('ru-RU')+'</p><div class="grid"><div class="card"><b>Уровень</b><h2>'+e(lv.name)+'</h2><p>'+lv.total+' ответов</p><div class="bar"><div class="fill" style="width:'+lv.pct+'%"></div></div></div><div class="card"><b>Сезон</b><h2>'+e(sea.name)+'</h2><p>'+sea.pts+' очков активности</p></div></div><h2>ФГОС</h2>'+fgosHtml().replace(/wave91h-/g,'')+'<h2>Ошибки</h2><p>Записей в журнале: '+journal().length+'</p></html>';var w=open('','_blank');if(w){w.document.write(body);w.document.close();setTimeout(function(){try{w.focus()}catch(_){}},100)}else dl('trainer3_parent_report_grade'+g()+'.html',body,'text/html;charset=utf-8')}
  function gfMul(x,y){var r=0;while(y){if(y&1)r^=x;y>>=1;x<<=1;if(x&256)x^=0x11d}return r}
  function gfPow(x,n){var r=1;while(n--)r=gfMul(r,x);return r}
  function rs(data,ec){var gen=[1];for(var i=0;i<ec;i++){var next=new Array(gen.length+1).fill(0);for(var j=0;j<gen.length;j++){next[j]^=gfMul(gen[j],gfPow(2,i));next[j+1]^=gen[j]}gen=next}var res=new Array(ec).fill(0);data.forEach(function(d){var f=d^res[0];res.shift();res.push(0);for(var j=0;j<ec;j++)res[j]^=gfMul(gen[j+1],f)});return res}
  function bitsPush(a,v,n){for(var i=n-1;i>=0;i--)a.push((v>>>i)&1)}
  function qrSvg(payload){var alpha='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:',text=String(payload||'TRAINER').toUpperCase().replace(/[^0-9A-Z $%*+\-.\/:]/g,'-').slice(0,42),bits=[];bitsPush(bits,2,4);bitsPush(bits,text.length,9);for(var i=0;i<text.length;i+=2){var a=alpha.indexOf(text[i]),b=alpha.indexOf(text[i+1]);if(b>=0)bitsPush(bits,a*45+b,11);else bitsPush(bits,a,6)}bitsPush(bits,0,4);while(bits.length%8)bits.push(0);var data=[];for(i=0;i<bits.length;i+=8)data.push(parseInt(bits.slice(i,i+8).join(''),2));while(data.length<34)data.push(data.length%2?0x11:0xec);data=data.slice(0,34);var code=data.concat(rs(data,10)),N=25,m=[],res=[];for(i=0;i<N;i++){m[i]=new Array(N).fill(null);res[i]=new Array(N).fill(false)}function set(x,y,v,fix){if(x<0||y<0||x>=N||y>=N)return;m[y][x]=v;if(fix)res[y][x]=true}function finder(x,y){for(var yy=-1;yy<=7;yy++)for(var xx=-1;xx<=7;xx++){var on=xx>=0&&yy>=0&&xx<7&&yy<7&&(xx===0||yy===0||xx===6||yy===6||(xx>=2&&xx<=4&&yy>=2&&yy<=4));set(x+xx,y+yy,on,true)}}finder(0,0);finder(N-7,0);finder(0,N-7);for(i=8;i<N-8;i++){set(i,6,i%2===0,true);set(6,i,i%2===0,true)}function align(cx,cy){for(var y=-2;y<=2;y++)for(var x=-2;x<=2;x++)set(cx+x,cy+y,Math.max(Math.abs(x),Math.abs(y))!==1,true)}align(18,18);set(8,N-8,true,true);var stream=[];code.forEach(function(c){bitsPush(stream,c,8)});var k=0,up=true;for(var x=N-1;x>0;x-=2){if(x===6)x--;for(var yy=0;yy<N;yy++){var y=up?N-1-yy:yy;for(var dx=0;dx<2;dx++){var xx=x-dx;if(res[y][xx])continue;var bit=stream[k++]||0,mask=(xx+y)%2===0;set(xx,y,!!(bit^mask),false)}}up=!up}var fmt='111011111000100';for(i=0;i<15;i++){var bit=fmt[i]==='1',pos=[[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[7,8],[8,8],[8,7],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0]][i];set(pos[0],pos[1],bit,true);var pos2=[[8,24],[8,23],[8,22],[8,21],[8,20],[8,19],[8,18],[17,8],[18,8],[19,8],[20,8],[21,8],[22,8],[23,8],[24,8]][i];set(pos2[0],pos2[1],bit,true)}var cell=8,svg='<svg viewBox="0 0 '+(N+8)*cell+' '+(N+8)*cell+'" role="img" aria-label="QR"><rect width="100%" height="100%" fill="#fff"/>';for(var y=0;y<N;y++)for(x=0;x<N;x++)if(m[y][x])svg+='<rect x="'+((x+4)*cell)+'" y="'+((y+4)*cell)+'" width="'+cell+'" height="'+cell+'" fill="#111"/>';return svg+'</svg>'}
  function qrPayload(){var s=curS(),t=curT(),raw='TRN-G'+g()+'-'+((s&&s.id)||'MAIN')+'-'+((t&&t.id)||day());return raw.toUpperCase().replace(/[^0-9A-Z $%*+\-.\/:]/g,'-').slice(0,42)}
  function openQr(){var p=qrPayload();modal('🔳 QR-код параграфа', '<p class="wave91h-sub">G7: локальный QR для текущего класса/темы. Его можно вставить в распечатку или тетрадь.</p><div class="wave91h-qr">'+qrSvg(p)+'</div><p class="wave91h-sub"><code>'+e(p)+'</code></p><button class="wave91h-btn" id="wave91h-copy-qr">Скопировать код</button>',function(d){var b=d.querySelector('#wave91h-copy-qr');if(b)b.onclick=function(){try{navigator.clipboard.writeText(p);toast('Код скопирован')}catch(_){toast('Скопируй код вручную')}}})}
  function leaderboard(){var m=R('trainer_marathon_wave91f_'+g(),{}),hist=Array.isArray(m.hist)?m.hist:[],rows=hist.concat([{ts:Date.now(),score:+m.best||0,reason:'best'}]).filter(function(x){return +x.score>0}).sort(function(a,b){return (+b.score||0)-(+a.score||0)}).slice(0,10),h='<p class="wave91h-sub">H4: локальный лидерборд марафона до первой ошибки.</p><table style="width:100%;border-collapse:collapse">'+rows.map(function(x,i){return '<tr><td style="padding:8px;border-bottom:1px solid var(--border)">#'+(i+1)+'</td><td style="padding:8px;border-bottom:1px solid var(--border)"><b>'+e(x.score)+'</b></td><td style="padding:8px;border-bottom:1px solid var(--border)">'+new Date(x.ts||Date.now()).toLocaleDateString('ru-RU')+'</td></tr>'}).join('')+'</table><button class="wave91h-btn" id="wave91h-lb-export">Экспорт CSV</button>';modal('🏁 Marathon leaderboard',h,function(d){var b=d.querySelector('#wave91h-lb-export');if(b)b.onclick=function(){dl('trainer3_marathon_leaderboard_grade'+g()+'.csv','rank,score,date\n'+rows.map(function(x,i){return [i+1,x.score,new Date(x.ts||Date.now()).toISOString()].join(',')}).join('\n'),'text/csv;charset=utf-8')}})}
  function card(){try{var raw=localStorage.getItem('trainer_ui_mode');raw=String(raw==null?'':raw).trim().toLowerCase();if(raw!=='full'){var old=document.getElementById('wave91h-main-card');if(old&&old.parentNode)old.parentNode.removeChild(old);return;}}catch(_){return;}var h=main();if(!h||document.getElementById('wave91h-main-card'))return;var lv=level(),sea=seasonal(),q=quiz(),c=document.createElement('section');c.id='wave91h-main-card';c.className='wave91h-card wave91h-advanced';c.innerHTML='<h3>🚀 UX и геймификация wave91h</h3><p class="wave91h-sub">Уровни, heat map, ФГОС, PDF-отчёт, уведомления, тихий час, QR-коды, daily quiz, сезонные события и leaderboard марафона.</p><div class="wave91h-grid"><div class="wave91h-kpi"><span>H1 уровень</span><b>'+e(lv.name)+'</b><div class="wave91h-bar"><div class="wave91h-fill" style="width:'+lv.pct+'%"></div></div></div><div class="wave91h-kpi"><span>H2 quiz</span><b>'+(q.done?'готово':'сегодня')+'</b></div><div class="wave91h-kpi"><span>H3 '+e(sea.name)+'</span><b>'+sea.pts+' очк.</b><div class="wave91h-bar"><div class="wave91h-fill" style="width:'+sea.pct+'%"></div></div></div></div><div class="wave91h-actions" style="margin-top:10px"><button class="wave91h-btn primary" id="wave91h-heat">Heat map</button><button class="wave91h-btn" id="wave91h-fgos">ФГОС</button><button class="wave91h-btn" id="wave91h-report">PDF-отчёт</button><button class="wave91h-btn" id="wave91h-quiz">Daily quiz</button><button class="wave91h-btn" id="wave91h-qr">QR</button><button class="wave91h-btn" id="wave91h-lb">Leaderboard</button><button class="wave91h-btn" id="wave91h-settings">Уведомления</button></div>';var after=document.getElementById('wave91g-main-card')||document.getElementById('wave91f-main-card')||document.getElementById('sg')||h.firstElementChild;if(after&&after.parentNode&&typeof after.parentNode.insertBefore==='function')after.parentNode.insertBefore(c,after.nextSibling);else if(h&&typeof h.appendChild==='function')h.appendChild(c);var bHeat=c.querySelector('#wave91h-heat');if(bHeat)bHeat.onclick=openHeat;var bFgos=c.querySelector('#wave91h-fgos');if(bFgos)bFgos.onclick=openFgos;var bReport=c.querySelector('#wave91h-report');if(bReport)bReport.onclick=parentReport;var bQuiz=c.querySelector('#wave91h-quiz');if(bQuiz)bQuiz.onclick=openQuiz;var bQr=c.querySelector('#wave91h-qr');if(bQr)bQr.onclick=openQr;var bLb=c.querySelector('#wave91h-lb');if(bLb)bLb.onclick=leaderboard;var bSet=c.querySelector('#wave91h-settings');if(bSet)bSet.onclick=openSettings}
  function patch(){try{if(typeof render==='function'&&!render.__wave91h){var o=render;render=function(){var z=o.apply(this,arguments);setTimeout(mount,0);return z};render.__wave91h=1;r.render=render}}catch(_){}try{if(typeof go==='function'&&!go.__wave91h){var og=go;go=function(){var z=og.apply(this,arguments);setTimeout(mount,0);return z};go.__wave91h=1;r.go=go}}catch(_){}}
  function mount(){css();applyQuiet();if(active('s-main'))card()}
  function boot(){patch();mount();scheduleNotification();r.wave91hUxGamification={version:W,keys:{notifications:K('notifications'),quiet:K('quiet_hour'),dailyQuiz:K('daily_quiz_'+day())},level:level(),seasonal:seasonal(),fgos:fgos(),auditSnapshot:function(){return{wave:W,grade:g(),hasCard:!!document.getElementById('wave91h-main-card')||!!document.getElementById('s-main'),level:level(),seasonal:seasonal(),heatCells:heatRows().length,fgos:fgos().length,quietActive:quietActive(),supports:['G1-notification-api','G2-knowledge-heatmap','G3-parent-pdf-report','G4-fgos-progress','G6-quiet-hour','G7-qr-codes','G8-daily-mini-banner','H1-levels','H2-daily-quiz','H3-seasonal-events','H4-marathon-leaderboard']}},openHeatmap:openHeat,openParentReport:parentReport,openQr:openQr}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();if(r&&typeof r.addEventListener==='function')r.addEventListener('load',function(){setTimeout(boot,0)},{once:true});if(typeof setInterval==='function'){timer=setInterval(function(){patch();mount()},1200);if(typeof setTimeout==='function')setTimeout(function(){clearInterval(timer)},10000)}
})();

/* wave92f: featurepack chunk marker */
(function(){ if(typeof window!=='undefined'){ window.__wave92fFeaturePacksLoaded=true; window.__wave92fFeaturePacks={version:'wave92f', moved:['wave91e','wave91f','wave91g','wave91h']}; } })();
