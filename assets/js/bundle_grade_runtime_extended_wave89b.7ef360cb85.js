/* wave91e: merged learning formats runtime */
/* wave91e: learning formats pack — explain-to-friend, pomodoro, exam countdown, Anki import export */
(function(){
  'use strict';
  var WAVE = 'wave91e';
  var STYLE_ID = 'wave91e-learning-formats-style';
  var timers = { pomodoro: null, boot: null };

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

/* wave89b: merge pass for grade runtime extensions (wave87w + wave87x + wave88c + wave88d) */
/* bundle_grade_runtime_interactions_wave87w */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave87wInteractiveFormats) return;

  var root = window;
  var grade = String(root.GRADE_NUM || root.GRADE_NO || '');
  if (!/^(8|9|10|11)$/.test(grade)) {
    root.__wave87wInteractiveFormats = { version:'wave88b', active:false, grade:grade };
    return;
  }

  var TYPES = Object.freeze({
    FIND_ERROR: 'find-error',
    SEQUENCE: 'sequence',
    MATCH: 'match',
    MULTI_SELECT: 'multi-select'
  });

  function asText(value){
    return String(value == null ? '' : value);
  }
  function unique(list){
    var out = [];
    (Array.isArray(list) ? list : []).forEach(function(item){
      var value = asText(item).trim();
      if (!value) return;
      if (out.indexOf(value) === -1) out.push(value);
    });
    return out;
  }
  function clone(list){
    return Array.isArray(list) ? list.slice() : [];
  }
  function shuffleLite(list){
    var copy = clone(list);
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }
  function toast(msg){
    try {
      if (typeof root.toast === 'function') root.toast(msg);
    } catch (_err) {}
  }
  function currentQuestion(){
    var lexicalQuestion;
    try {
      lexicalQuestion = typeof prob !== 'undefined' ? prob : undefined;
    } catch (_err) {
      lexicalQuestion = undefined;
    }
    if (lexicalQuestion && typeof lexicalQuestion === 'object') return lexicalQuestion;
    return root.prob && typeof root.prob === 'object' ? root.prob : null;
  }
  function isInteractiveQuestion(question){
    if (!question || typeof question !== 'object') return false;
    return question.interactionType === TYPES.FIND_ERROR ||
      question.interactionType === TYPES.SEQUENCE ||
      question.interactionType === TYPES.MATCH ||
      question.interactionType === TYPES.MULTI_SELECT;
  }
  function isComplexInteractive(question){
    return !!(question && (
      question.interactionType === TYPES.SEQUENCE ||
      question.interactionType === TYPES.MATCH ||
      question.interactionType === TYPES.MULTI_SELECT
    ));
  }
  function isEditableTarget(target){
    var tag = target && target.tagName ? String(target.tagName).toLowerCase() : '';
    return tag === 'input' || tag === 'textarea' || tag === 'select' || !!(target && target.isContentEditable);
  }
  function onPlayScreen(){
    var screen = document.getElementById('s-play');
    return !!(screen && screen.classList && screen.classList.contains('on'));
  }
  function shouldEnhance(question){
    question = question || currentQuestion();
    return !!(isInteractiveQuestion(question) && !root.rushMode && !root.diagMode && onPlayScreen());
  }
  function ensureArray(question, key){
    if (!Array.isArray(question[key])) question[key] = [];
    return question[key];
  }
  function ensureState(question){
    if (!question) return null;
    if (!question.__wave87wState || typeof question.__wave87wState !== 'object') {
      question.__wave87wState = {};
    }
    return question.__wave87wState;
  }
  function ensureSequenceState(question){
    var state = ensureState(question);
    if (!state) return null;
    var correct = clone(question.sequenceItems || []);
    if (!Array.isArray(state.picked)) state.picked = [];
    if (!Array.isArray(state.pool) || !state.pool.length) {
      var basePool = clone(question.sequencePool || []);
      if (!basePool.length) basePool = shuffleLite(correct);
      state.pool = basePool;
    }
    state.picked = state.picked.filter(function(item){ return correct.indexOf(item) !== -1; });
    state.pool = state.pool.filter(function(item){ return correct.indexOf(item) !== -1 && state.picked.indexOf(item) === -1; });
    correct.forEach(function(item){
      if (state.picked.indexOf(item) === -1 && state.pool.indexOf(item) === -1) state.pool.push(item);
    });
    return state;
  }
  function ensureMatchState(question){
    var state = ensureState(question);
    if (!state) return null;
    var pairs = Array.isArray(question.matchPairs) ? question.matchPairs : [];
    if (!Array.isArray(state.selection) || state.selection.length !== pairs.length) {
      state.selection = Array.from({ length: pairs.length }, function(){ return ''; });
    }
    if (!Array.isArray(question.matchOptions) || !question.matchOptions.length) {
      question.matchOptions = shuffleLite(unique(pairs.map(function(pair){ return Array.isArray(pair) ? pair[1] : ''; })));
    }
    return state;
  }
  function declaredMultiSelectOptions(question){
    return unique([].concat(
      Array.isArray(question && question.multiSelectOptions) ? question.multiSelectOptions : [],
      Array.isArray(question && question.multiSelectItems) ? question.multiSelectItems : [],
      Array.isArray(question && question.optionLabels) ? question.optionLabels : [],
      Array.isArray(question && question.optionsRaw) ? question.optionsRaw : []
    ));
  }
  function multiSelectCorrect(question){
    var direct = unique(question && question.multiSelectAnswers);
    var base = declaredMultiSelectOptions(question);
    if (direct.length) return base.length ? base.filter(function(item){ return direct.indexOf(item) !== -1; }) : direct;
    var parsed = [];
    var raw = asText(question && question.answer);
    if (raw) parsed = raw.split('|').map(function(item){ return asText(item).trim(); }).filter(Boolean);
    parsed = unique(parsed);
    return base.length ? base.filter(function(item){ return parsed.indexOf(item) !== -1; }) : parsed;
  }
  function multiSelectAllOptions(question){
    return unique([].concat(
      declaredMultiSelectOptions(question),
      multiSelectCorrect(question)
    ));
  }
  function multiSelectMin(question){
    var fallback = multiSelectCorrect(question).length || 2;
    var value = Number(question && question.multiSelectMin);
    if (!(value > 0)) value = fallback;
    var total = multiSelectAllOptions(question).length || value;
    return Math.max(1, Math.min(total, Math.round(value)));
  }
  function multiSelectMax(question){
    var min = multiSelectMin(question);
    var fallback = multiSelectCorrect(question).length || min;
    var value = Number(question && question.multiSelectMax);
    if (!(value > 0)) value = fallback;
    var total = multiSelectAllOptions(question).length || value;
    return Math.max(min, Math.min(total, Math.round(value)));
  }
  function selectionFromRaw(question, raw){
    var values = [];
    if (Array.isArray(raw)) values = raw;
    else {
      var text = asText(raw);
      if (!text) values = [];
      else values = text.split('|').map(function(item){ return asText(item).trim(); });
    }
    return normalizeMultiSelect(question, values);
  }
  function normalizeMultiSelect(question, values){
    var all = multiSelectAllOptions(question);
    var picked = unique(values).filter(Boolean);
    if (!all.length) return picked;
    return all.filter(function(item){ return picked.indexOf(item) !== -1; });
  }
  function serializeMultiSelect(question, values){
    return normalizeMultiSelect(question, values).join(' | ');
  }
  function displayMultiSelect(question, values){
    return normalizeMultiSelect(question, values).join(', ');
  }
  function ensureMultiSelectState(question){
    var state = ensureState(question);
    if (!state) return null;
    state.selected = normalizeMultiSelect(question, state.selected || []);
    return state;
  }
  function optionWord(count){
    var n = Math.abs(Number(count) || 0) % 100;
    var d = n % 10;
    if (n >= 11 && n <= 19) return 'вариантов';
    if (d === 1) return 'вариант';
    if (d >= 2 && d <= 4) return 'варианта';
    return 'вариантов';
  }
  function requirementText(question){
    var min = multiSelectMin(question);
    var max = multiSelectMax(question);
    if (min === max) return 'Нужно отметить ровно ' + min + ' ' + optionWord(min) + '.';
    return 'Нужно отметить от ' + min + ' до ' + max + ' ' + optionWord(max) + '.';
  }
  function countText(count){
    return count + ' ' + optionWord(count);
  }
  function toggleMultiSelect(question, value){
    if (!question || hasSelection()) return false;
    var state = ensureMultiSelectState(question);
    if (!state) return false;
    var item = asText(value).trim();
    if (!item) return false;
    var idx = state.selected.indexOf(item);
    if (idx !== -1) {
      state.selected.splice(idx, 1);
      state.selected = normalizeMultiSelect(question, state.selected);
      return true;
    }
    var max = multiSelectMax(question);
    if (max && state.selected.length >= max) {
      toast(max === multiSelectMin(question)
        ? 'Можно выбрать только ' + countText(max) + '.'
        : 'Нужно выбрать не больше ' + countText(max) + '.');
      return false;
    }
    state.selected.push(item);
    state.selected = normalizeMultiSelect(question, state.selected);
    return true;
  }
  function findErrorSteps(question){
    return clone(question.errorSteps || question.findErrorSteps || question.steps || []);
  }
  function serializeSequence(items){
    return clone(items).map(asText).filter(Boolean).join(' → ');
  }
  function serializePairs(pairs, selection){
    return (Array.isArray(pairs) ? pairs : []).map(function(pair, idx){
      var left = asText(Array.isArray(pair) ? pair[0] : '');
      var right = asText(selection && selection[idx] != null ? selection[idx] : (Array.isArray(pair) ? pair[1] : ''));
      return left + ' → ' + right;
    }).join(' | ');
  }
  function displayAnswer(question, raw){
    var value = asText(raw);
    if (!question) return value;
    if (question.interactionType === TYPES.SEQUENCE) return value || serializeSequence(question.sequenceItems || []);
    if (question.interactionType === TYPES.MATCH) return value || serializePairs(question.matchPairs || [], null);
    if (question.interactionType === TYPES.MULTI_SELECT) return displayMultiSelect(question, raw ? selectionFromRaw(question, raw) : multiSelectCorrect(question));
    return value;
  }
  function ensureOption(question, value){
    value = asText(value);
    var answer = asText(question && question.answer);
    var list = unique([answer].concat(Array.isArray(question && question.options) ? question.options : []).concat([value]));
    question.options = list;
    return list.indexOf(value);
  }
  function submitCustomValue(question, value){
    if (!question || hasSelection()) return false;
    var idx = ensureOption(question, value);
    if (idx < 0) return false;
    if (typeof baseAns === 'function') {
      baseAns.call(root, idx);
      return true;
    }
    return false;
  }
  function stepButton(label, text, className){
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className || 'opt';
    var key = document.createElement('span');
    key.className = 'k';
    key.textContent = asText(label);
    var body = document.createElement('span');
    body.textContent = asText(text);
    button.appendChild(key);
    button.appendChild(body);
    return button;
  }
  function card(title, text){
    var wrap = document.createElement('div');
    wrap.className = 'fb';
    if (title) {
      var head = document.createElement('div');
      head.className = 'fbr';
      head.textContent = title;
      wrap.appendChild(head);
    }
    if (text) {
      var body = document.createElement('div');
      body.className = 'fbh';
      body.textContent = text;
      wrap.appendChild(body);
    }
    return wrap;
  }
  function makePrimaryButton(text){
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-p';
    button.textContent = text;
    return button;
  }
  function makeSecondaryButton(text){
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-o';
    button.textContent = text;
    return button;
  }
  function appendExplanationBlock(rootEl, title, content){
    if (!content) return;
    var box = document.createElement('div');
    box.className = 'fbex';
    if (title) {
      var strong = document.createElement('b');
      strong.textContent = title + ': ';
      box.appendChild(strong);
    }
    box.appendChild(document.createTextNode(asText(content)));
    rootEl.appendChild(box);
  }
  function appendSequenceList(rootEl, items, prefix){
    clone(items).forEach(function(item, idx){
      var node = stepButton(prefix || (idx + 1), item, 'opt ok');
      node.disabled = true;
      rootEl.appendChild(node);
    });
  }
  function appendMatchRows(rootEl, pairs, selection, markUser){
    (Array.isArray(pairs) ? pairs : []).forEach(function(pair, idx){
      var left = asText(Array.isArray(pair) ? pair[0] : '');
      var right = asText(Array.isArray(pair) ? pair[1] : '');
      var chosen = asText(selection && selection[idx]);
      var row = document.createElement('div');
      row.className = 'fbex';
      var title = document.createElement('b');
      title.textContent = left + ' → ';
      row.appendChild(title);
      row.appendChild(document.createTextNode(right));
      if (markUser && chosen && chosen !== right) {
        row.appendChild(document.createElement('br'));
        var user = document.createElement('span');
        user.textContent = 'Ваш вариант: ' + chosen;
        row.appendChild(user);
      }
      rootEl.appendChild(row);
    });
  }
  function feedbackTitle(correct, withHelp, type){
    if (correct && withHelp) return '✓ Верно, но с подсказкой — не в зачёт серии';
    if (correct) return '✓ Верно!';
    if (type === TYPES.SEQUENCE) return '✗ Порядок шагов получился неверным';
    if (type === TYPES.MATCH) return '✗ Есть ошибки в сопоставлении';
    if (type === TYPES.MULTI_SELECT) return '✗ Есть ошибки в выборе вариантов';
    return '✗ Неверный шаг';
  }
  function renderInteractiveFeedback(question){
    if (!shouldEnhance(question)) return;
    var slot = document.getElementById('fba');
    if (!slot) return;
    if (!hasSelection()) {
      slot.innerHTML = '';
      return;
    }
    slot.innerHTML = '';
    var correct = asText(selectionValue()) === asText(question.answer);
    var wrap = document.createElement('div');
    wrap.className = 'fb';

    var head = document.createElement('div');
    head.className = 'fbr';
    head.textContent = feedbackTitle(correct, !!root.usedHelp, question.interactionType);
    wrap.appendChild(head);

    if (!correct && question.hint) {
      var hint = document.createElement('div');
      hint.className = 'fbh';
      hint.textContent = '💡 ' + asText(question.hint);
      wrap.appendChild(hint);
    }

    if (question.interactionType === TYPES.FIND_ERROR) {
      appendExplanationBlock(wrap, 'Первый неверный шаг', displayAnswer(question, question.answer));
      if (!correct) appendExplanationBlock(wrap, 'Ваш выбор', displayAnswer(question, root.sel));
    } else if (question.interactionType === TYPES.SEQUENCE) {
      appendExplanationBlock(wrap, 'Правильный порядок', displayAnswer(question, question.answer));
      if (!correct) appendExplanationBlock(wrap, 'Ваш порядок', displayAnswer(question, root.sel));
    } else if (question.interactionType === TYPES.MATCH) {
      var matchState = ensureMatchState(question);
      appendMatchRows(wrap, question.matchPairs || [], matchState && matchState.selection, !correct);
    } else if (question.interactionType === TYPES.MULTI_SELECT) {
      appendExplanationBlock(wrap, 'Правильный набор', displayAnswer(question, question.answer));
      if (!correct) appendExplanationBlock(wrap, 'Ваш выбор', displayAnswer(question, root.sel));
    }

    appendExplanationBlock(wrap, 'Разбор', question.ex || question.hint || '');

    var next = makePrimaryButton('Следующий →');
    next.addEventListener('click', function(){ if (typeof root.nextQ === 'function') root.nextQ(); });
    wrap.appendChild(next);
    slot.appendChild(wrap);
  }

  function renderFindError(question, opts){
    var steps = findErrorSteps(question);
    opts.innerHTML = '';
    opts.appendChild(card('Найди первый неверный шаг', 'Прочитай решение и нажми на строку, где впервые появилась ошибка.'));
    steps.forEach(function(step, idx){
      var className = 'opt';
      if (hasSelection()) {
        className += ' done';
        if (asText(step) === asText(question.answer)) className += ' ok';
        else if (asText(step) === asText(selectionValue())) className += ' no';
        else className += ' dim';
      }
      var button = stepButton(idx + 1, step, className);
      button.disabled = hasSelection();
      if (!hasSelection()) {
        button.addEventListener('click', function(){ submitCustomValue(question, step); });
      }
      opts.appendChild(button);
    });
  }

  function renderSequence(question, opts){
    var steps = clone(question.sequenceItems || []);
    var state = ensureSequenceState(question);
    opts.innerHTML = '';
    opts.appendChild(card('Расставь шаги по порядку', 'Сначала собери правильную последовательность, потом нажми «Проверить».'));

    if (hasSelection()) {
      appendSequenceList(opts, steps);
      return;
    }

    var chosenBox = card('Ваш порядок', state.picked.length ? 'Нажми на шаг, если хочешь убрать его из ответа.' : 'Пока пусто — начни собирать алгоритм снизу.');
    state.picked.forEach(function(item, idx){
      var button = stepButton(idx + 1, item, 'opt');
      button.addEventListener('click', function(){
        state.picked.splice(idx, 1);
        state.pool.push(item);
        if (typeof root.render === 'function') root.render();
      });
      chosenBox.appendChild(button);
    });
    opts.appendChild(chosenBox);

    var poolBox = card('Доступные шаги', 'Нажимай на шаги в том порядке, в котором их нужно выполнить.');
    state.pool.forEach(function(item, idx){
      var button = stepButton(String.fromCharCode(65 + idx), item, 'opt');
      button.addEventListener('click', function(){
        state.pool.splice(idx, 1);
        state.picked.push(item);
        if (typeof root.render === 'function') root.render();
      });
      poolBox.appendChild(button);
    });
    opts.appendChild(poolBox);

    var submit = makePrimaryButton('Проверить порядок');
    submit.addEventListener('click', function(){
      if (state.picked.length !== steps.length) return toast('Собери весь порядок до конца.');
      submitCustomValue(question, serializeSequence(state.picked));
    });
    opts.appendChild(submit);

    var reset = makeSecondaryButton('Сбросить порядок');
    reset.addEventListener('click', function(){
      state.picked = [];
      state.pool = clone(question.sequencePool || []);
      if (!state.pool.length) state.pool = shuffleLite(steps);
      if (typeof root.render === 'function') root.render();
    });
    opts.appendChild(reset);
  }

  function renderMatch(question, opts){
    var pairs = Array.isArray(question.matchPairs) ? question.matchPairs : [];
    var state = ensureMatchState(question);
    opts.innerHTML = '';
    opts.appendChild(card('Соедини пары', 'Для каждого элемента слева выбери соответствующий вариант справа.'));

    pairs.forEach(function(pair, idx){
      var row = document.createElement('div');
      row.className = 'fb';

      var head = document.createElement('div');
      head.className = 'fbr';
      head.textContent = asText(Array.isArray(pair) ? pair[0] : '');
      row.appendChild(head);

      var hint = document.createElement('div');
      hint.className = 'fbh';
      hint.textContent = !hasSelection() ? 'Выбери соответствие из списка.' : 'Правильная пара: ' + asText(Array.isArray(pair) ? pair[1] : '');
      row.appendChild(hint);

      var select = document.createElement('select');
      select.setAttribute('aria-label', 'Выбери пару для ' + asText(Array.isArray(pair) ? pair[0] : ''));
      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Выбери соответствие';
      select.appendChild(placeholder);
      clone(question.matchOptions || []).forEach(function(option){
        var item = document.createElement('option');
        item.value = option;
        item.textContent = option;
        if (asText(state.selection[idx]) === asText(option)) item.selected = true;
        select.appendChild(item);
      });
      select.disabled = hasSelection();
      if (!hasSelection()) {
        select.addEventListener('change', function(){ state.selection[idx] = asText(select.value); });
      }
      row.appendChild(select);
      opts.appendChild(row);
    });

    if (hasSelection()) return;

    var submit = makePrimaryButton('Проверить пары');
    submit.addEventListener('click', function(){
      if (state.selection.some(function(item){ return !asText(item); })) return toast('Заполни все пары.');
      submitCustomValue(question, serializePairs(pairs, state.selection));
    });
    opts.appendChild(submit);

    var reset = makeSecondaryButton('Сбросить пары');
    reset.addEventListener('click', function(){
      state.selection = Array.from({ length: pairs.length }, function(){ return ''; });
      if (typeof root.render === 'function') root.render();
    });
    opts.appendChild(reset);
  }

  function renderMultiSelect(question, opts){
    var all = multiSelectAllOptions(question);
    var state = ensureMultiSelectState(question);
    var min = multiSelectMin(question);
    var max = multiSelectMax(question);
    var chosen = hasSelection() ? selectionFromRaw(question, root.sel) : state.selected;
    var correct = multiSelectCorrect(question);

    opts.innerHTML = '';
    opts.appendChild(card('Выбери несколько ответов', requirementText(question) + ' Затем нажми «Проверить».'));

    var summary = card('Текущий выбор', chosen.length
      ? 'Отмечено: ' + countText(chosen.length) + '. ' + requirementText(question)
      : 'Пока ничего не отмечено. ' + requirementText(question));
    if (chosen.length && !hasSelection()) {
      chosen.forEach(function(item){
        var chip = stepButton('✓', item, 'opt ok');
        chip.setAttribute('role', 'checkbox');
        chip.setAttribute('aria-checked', 'true');
        chip.addEventListener('click', function(){
          toggleMultiSelect(question, item);
          if (typeof root.render === 'function') root.render();
        });
        summary.appendChild(chip);
      });
    } else if (hasSelection()) {
      appendExplanationBlock(summary, 'Вы выбрали', displayMultiSelect(question, chosen) || 'ничего');
    }
    opts.appendChild(summary);

    var pool = card('Варианты', 'Можно отметить несколько пунктов. Номер на кнопке можно использовать с клавиатуры.');
    all.forEach(function(item, idx){
      var selected = chosen.indexOf(item) !== -1;
      var isCorrect = correct.indexOf(item) !== -1;
      var className = 'opt';
      if (hasSelection()) {
        className += ' done';
        if (isCorrect) className += ' ok';
        else if (selected) className += ' no';
        else className += ' dim';
      } else if (selected) {
        className += ' ok';
      }
      var button = stepButton(idx + 1, item, className);
      button.setAttribute('role', 'checkbox');
      button.setAttribute('aria-checked', selected ? 'true' : 'false');
      button.setAttribute('aria-keyshortcuts', String(idx + 1));
      if (!hasSelection()) {
        button.addEventListener('click', function(){
          if (toggleMultiSelect(question, item) && typeof root.render === 'function') root.render();
        });
      } else {
        button.disabled = true;
      }
      pool.appendChild(button);
    });
    opts.appendChild(pool);

    if (hasSelection()) return;

    var submit = makePrimaryButton('Проверить варианты');
    submit.addEventListener('click', function(){
      if (state.selected.length < min || state.selected.length > max) return toast(requirementText(question));
      submitCustomValue(question, serializeMultiSelect(question, state.selected));
    });
    opts.appendChild(submit);

    var reset = makeSecondaryButton('Сбросить выбор');
    reset.addEventListener('click', function(){
      state.selected = [];
      if (typeof root.render === 'function') root.render();
    });
    opts.appendChild(reset);
  }

  function enhanceInteractiveQuestion(){
    var question = currentQuestion();
    if (!shouldEnhance(question)) return;
    var opts = document.getElementById('opts');
    if (!opts) return;
    opts.setAttribute('role', 'group');
    opts.setAttribute('aria-label', question.interactionType === TYPES.MULTI_SELECT ? 'Множественный выбор' : 'Интерактивное задание');
    if (question.interactionType === TYPES.FIND_ERROR) renderFindError(question, opts);
    else if (question.interactionType === TYPES.SEQUENCE) renderSequence(question, opts);
    else if (question.interactionType === TYPES.MATCH) renderMatch(question, opts);
    else if (question.interactionType === TYPES.MULTI_SELECT) renderMultiSelect(question, opts);
    renderInteractiveFeedback(question);
  }

  function bindInteractiveKeyboard(){
    document.addEventListener('keydown', function(event){
      var question = currentQuestion();
      if (!shouldEnhance(question) || !question || hasSelection()) return;
      if (question.interactionType !== TYPES.MULTI_SELECT) return;
      if (isEditableTarget(event.target)) return;
      var key = asText(event.key);
      if (/^[1-6]$/.test(key)) {
        var idx = Number(key) - 1;
        var all = multiSelectAllOptions(question);
        if (!all[idx]) return;
        event.preventDefault();
        event.stopPropagation();
        if (toggleMultiSelect(question, all[idx]) && typeof root.render === 'function') root.render();
        return;
      }
      if (key === 'Enter' || key === 'NumpadEnter') {
        var state = ensureMultiSelectState(question);
        var min = multiSelectMin(question);
        var max = multiSelectMax(question);
        event.preventDefault();
        event.stopPropagation();
        if (state.selected.length < min || state.selected.length > max) return toast(requirementText(question));
        submitCustomValue(question, serializeMultiSelect(question, state.selected));
      }
    }, true);
  }

  bindInteractiveKeyboard();

  var baseNextQ = typeof root.nextQ === 'function' ? root.nextQ : null;
  if (baseNextQ) {
    root.nextQ = function(){
      var result;
      var tries = 0;
      do {
        result = baseNextQ.apply(this, arguments);
        tries += 1;
        if (!(root.rushMode && isComplexInteractive(currentQuestion()))) break;
      } while (tries < 8);
      return result;
    };
  }

  var baseRender = typeof root.render === 'function' ? root.render : null;
  if (baseRender) {
    root.render = function(){
      var result = baseRender.apply(this, arguments);
      try { enhanceInteractiveQuestion(); } catch (_err) {}
      return result;
    };
  }

  var baseAns = typeof root.ans === 'function' ? root.ans : null;
  if (baseAns) {
    root.ans = function(idx){
      var question = currentQuestion();
      if (!shouldEnhance(question)) return baseAns.apply(this, arguments);
      if (!isInteractiveQuestion(question)) return baseAns.apply(this, arguments);
      if (question.interactionType === TYPES.FIND_ERROR) return baseAns.apply(this, arguments);
      return null;
    };
  }

  root.__wave87wInteractiveFormats = {
    version: 'wave88b',
    active: true,
    grade: grade,
    types: Object.keys(TYPES).map(function(key){ return TYPES[key]; }),
    isInteractiveQuestion: isInteractiveQuestion,
    shouldEnhance: shouldEnhance,
    serializeSequence: serializeSequence,
    serializePairs: serializePairs,
    serializeMultiSelect: serializeMultiSelect,
    multiSelectOptions: multiSelectAllOptions,
    multiSelectCorrect: multiSelectCorrect
  };
})();


/* bundle_grade_runtime_inputs_timing_wave87x */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave87xInputTimingRuntime) return;

  var root = window;
  var STYLE_ID = 'wave87x-input-timing-style';
  var SAMPLE_LIMIT = 360;
  var TRAINING_SAMPLE_LIMIT = 120;
  var MAX_ELAPSED_MS = 20 * 60 * 1000;
  var timingState = { activeQuestion:null, activeId:'', shownAt:0, logged:false };
  var allowProgrammaticAns = false;

  function gradeKey(){
    return String(root.GRADE_NUM || root.GRADE_NO || '');
  }
  function storageKey(){
    return 'trainer_response_timing_' + gradeKey();
  }
  function asText(value){
    return String(value == null ? '' : value);
  }
  function unique(list){
    var out = [];
    (Array.isArray(list) ? list : []).forEach(function(item){
      var value = asText(item);
      if (!value) return;
      if (out.indexOf(value) === -1) out.push(value);
    });
    return out;
  }
  function clone(list){
    return Array.isArray(list) ? list.slice() : [];
  }
  function toNumber(value){
    var n = Number(value);
    return isFinite(n) ? n : 0;
  }
  function safeJSONParse(raw, fallback){
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (_err) {
      return fallback;
    }
  }
  function readStore(){
    try {
      var raw = root.localStorage && root.localStorage.getItem(storageKey());
      var data = safeJSONParse(raw, { version:'wave87x', grade:gradeKey(), samples:[] });
      if (!data || typeof data !== 'object') data = { version:'wave87x', grade:gradeKey(), samples:[] };
      if (!Array.isArray(data.samples)) data.samples = [];
      return data;
    } catch (_err) {
      return { version:'wave87x', grade:gradeKey(), samples:[] };
    }
  }
  function writeStore(data){
    try {
      if (!root.localStorage) return false;
      var rows = Array.isArray(data && data.samples) ? data.samples.filter(function(item){
        return item && isFinite(item.ms) && item.ms > 0;
      }).slice(-SAMPLE_LIMIT) : [];
      var next = {
        version: 'wave87x',
        grade: gradeKey(),
        updatedAt: Date.now(),
        samples: rows
      };
      root.localStorage.setItem(storageKey(), JSON.stringify(next));
      return true;
    } catch (_err) {
      return false;
    }
  }
  function lexicalValue(getter){
    try {
      var value = getter();
      return value === undefined ? undefined : value;
    } catch (_err) {
      return undefined;
    }
  }
  function currentQuestion(){
    return root.prob && typeof root.prob === 'object' ? root.prob : null;
  }
  function onPlayScreen(){
    var screen = document.getElementById('s-play');
    return !!(screen && screen.classList && screen.classList.contains('on'));
  }
  function isEditableTarget(target){
    if (!target || typeof target !== 'object') return false;
    var tag = String(target.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || !!target.isContentEditable;
  }
  function toast(message){
    try {
      if (typeof root.toast === 'function') root.toast(message);
    } catch (_err) {}
  }
  function normalizeBaseText(value){
    return asText(value)
      .replace(/\u00a0/g, ' ')
      .replace(/[‐‑‒–—−]/g, '-')
      .replace(/[“”«»]/g, '"')
      .replace(/[’`]/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
  function normalizeClozeText(value){
    return normalizeBaseText(value)
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[.!?,;:]+$/g, '')
      .trim();
  }
  function normalizeTextAnswer(value){
    return normalizeBaseText(value)
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[“”«»"]/g, ' ')
      .replace(/[’'`]/g, '')
      .replace(/\s*-\s*/g, '-')
      .replace(/[^a-zа-я0-9\- ]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function compactTextAnswer(value){
    return normalizeTextAnswer(value).replace(/[\s-]+/g, '');
  }
  function normalizeUnit(value){
    return normalizeBaseText(value)
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/\s*([/%°])/g, '$1')
      .replace(/\s*\/\s*/g, '/')
      .replace(/\s*·\s*/g, '·')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function parseNumericValue(value){
    var raw = normalizeBaseText(value).replace(/,/g, '.');
    if (!raw) return null;
    if (/[=→]/.test(raw)) return null;
    var fraction = raw.match(/^([+-]?\d+)\s*\/\s*(\d+)(?:\s*(.*))?$/);
    if (fraction) {
      var denominator = Number(fraction[2]);
      var numerator = Number(fraction[1]);
      if (!isFinite(numerator) || !isFinite(denominator) || !denominator) return null;
      return {
        num: numerator / denominator,
        unit: normalizeUnit(fraction[3] || ''),
        raw: raw
      };
    }
    var match = raw.match(/^([+-]?\d+(?:\.\d+)?)(?:\s*(.*))?$/);
    if (!match) return null;
    var num = Number(match[1]);
    if (!isFinite(num)) return null;
    return {
      num: num,
      unit: normalizeUnit(match[2] || ''),
      raw: raw
    };
  }
  function isNumericLikeAnswer(answer){
    var raw = normalizeBaseText(answer);
    if (!raw) return false;
    if (/[=→]/.test(raw)) return false;
    if (/√|sqrt|sin|cos|tan|tg|ctg|log|ln|\^|\(|\)/i.test(raw)) return false;
    if (!/^[+-]?\d/.test(raw.replace(/,/g, '.'))) return false;
    return !!parseNumericValue(raw);
  }
  function hasBlankMarker(question){
    return /_{2,}/.test(asText(question && question.question));
  }
  function currentSubjectId(){
    var lexicalSubject = lexicalValue(function(){ return cS; });
    var subject = lexicalSubject && typeof lexicalSubject === 'object' ? lexicalSubject : (root.cS && typeof root.cS === 'object' ? root.cS : null);
    if (subject && subject.id) return String(subject.id);
    var mixed = lexicalValue(function(){ return globalMix; });
    return (mixed == null ? !!root.globalMix : !!mixed) ? 'mix' : '';
  }
  function selectionValue(){
    var lexicalSelection = lexicalValue(function(){ return sel; });
    if (lexicalSelection !== undefined) return lexicalSelection == null ? null : lexicalSelection;
    return root.sel == null ? null : root.sel;
  }
  function hasSelection(){
    return selectionValue() !== null;
  }
  function explicitInputMode(question){
    var mode = normalizeClozeText(question && question.inputMode);
    if (!mode) return '';
    if (mode === 'cloze' || mode === 'fill' || mode === 'blank') return 'cloze';
    if (mode === 'text' || mode === 'input' || mode === 'free-text' || mode === 'short-text' || mode === 'fuzzy-text') return 'text';
    if (mode === 'numeric' || mode === 'number' || mode === 'free-number') return 'numeric';
    return '';
  }
  function pageGrade(){
    var lexicalGrade = lexicalValue(function(){ return typeof GRADE_NUM !== 'undefined' ? GRADE_NUM : (typeof GRADE_NO !== 'undefined' ? GRADE_NO : undefined); });
    var page = toNumber(root.GRADE_NUM || root.GRADE_NO || lexicalGrade || 0);
    return page > 0 ? page : 0;
  }
  function autoInputEligible(question){
    var page = pageGrade();
    if (page) return page >= 8;
    var grade = toNumber(question && (question.grade != null ? question.grade : question.g != null ? question.g : 0));
    return grade >= 8;
  }
  function inputModeFor(question){
    if (!question || !onPlayScreen() || root.rushMode || root.diagMode) return '';
    if (question.interactionType) return '';
    var explicit = explicitInputMode(question);
    if (explicit) return explicit;
    if (!autoInputEligible(question)) return '';
    if (hasBlankMarker(question) && !question.code && !isNumericLikeAnswer(question.answer)) return 'cloze';
    var sid = currentSubjectId();
    var numericSubject = /^(alg|geo|phy|chem|prob)$/.test(sid);
    if (!question.code && isNumericLikeAnswer(question.answer) && (question.isMath || numericSubject)) return 'numeric';
    return '';
  }
  function ensureInputState(question){
    if (!question) return null;
    if (!question.__wave87xInputState || typeof question.__wave87xInputState !== 'object') {
      question.__wave87xInputState = {
        draft: '',
        lastValue: '',
        lastCanonical: '',
        mode: ''
      };
    }
    return question.__wave87xInputState;
  }
  function acceptedAnswers(question){
    return unique([question && question.answer].concat(Array.isArray(question && question.acceptedAnswers) ? question.acceptedAnswers : []).concat(Array.isArray(question && question.answers) ? question.answers : []));
  }
  function formatExampleNumber(value){
    if (!isFinite(value)) return '';
    var rounded = Math.round(value * 1000) / 1000;
    return asText(rounded).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1').replace(/\.$/, '').replace('.', ',');
  }
  function fractionExample(question){
    var answers = acceptedAnswers(question);
    for (var i = 0; i < answers.length; i++) {
      var raw = normalizeBaseText(answers[i]);
      var match = raw.replace(/,/g, '.').match(/^([+-]?\d+)\s*\/\s*(\d+)(?:\s*(.*))?$/);
      if (!match) continue;
      var numerator = Number(match[1]);
      var denominator = Number(match[2]);
      if (!isFinite(numerator) || !isFinite(denominator) || !denominator) continue;
      var unit = normalizeBaseText(match[3] || '');
      var fractionText = match[1] + '/' + match[2] + (unit ? ' ' + unit : '');
      var decimalText = formatExampleNumber(numerator / denominator) + (unit ? ' ' + unit : '');
      return { fraction:fractionText, decimal:decimalText };
    }
    return null;
  }
  function numbersClose(a, b){
    var tolerance = Math.max(1e-6, Math.abs(a) * 1e-6, Math.abs(b) * 1e-6);
    return Math.abs(a - b) <= tolerance;
  }
  function toInteger(value, fallback){
    var num = Number(value);
    return isFinite(num) ? Math.max(0, Math.floor(num)) : fallback;
  }
  function fuzzyMinLength(question){
    var raw = question && (question.fuzzyMinLength != null ? question.fuzzyMinLength : question.minFuzzyLength);
    return Math.max(3, toInteger(raw, 7));
  }
  function textTolerance(question, compactAnswer){
    var len = asText(compactAnswer).length;
    var derived = 0;
    if (len >= 7 && len <= 10) derived = 1;
    else if (len >= 11 && len <= 18) derived = 2;
    else if (len > 18) derived = 3;
    var explicit = question && (question.fuzzyMaxDistance != null ? question.fuzzyMaxDistance : question.maxTypos);
    if (explicit == null || explicit === '') return derived;
    return Math.max(0, Math.min(derived, toInteger(explicit, derived)));
  }
  function levenshteinDistance(a, b, maxDistance){
    a = asText(a);
    b = asText(b);
    if (a === b) return 0;
    var aLen = a.length;
    var bLen = b.length;
    if (!aLen) return bLen;
    if (!bLen) return aLen;
    if (typeof maxDistance === 'number' && Math.abs(aLen - bLen) > maxDistance) return maxDistance + 1;
    var prev = new Array(bLen + 1);
    var curr = new Array(bLen + 1);
    for (var j = 0; j <= bLen; j++) prev[j] = j;
    for (var i = 1; i <= aLen; i++) {
      curr[0] = i;
      var minRow = curr[0];
      var ch = a.charAt(i - 1);
      for (var k = 1; k <= bLen; k++) {
        var cost = ch === b.charAt(k - 1) ? 0 : 1;
        var value = Math.min(prev[k] + 1, curr[k - 1] + 1, prev[k - 1] + cost);
        curr[k] = value;
        if (value < minRow) minRow = value;
      }
      if (typeof maxDistance === 'number' && minRow > maxDistance) return maxDistance + 1;
      var swap = prev;
      prev = curr;
      curr = swap;
    }
    return prev[bLen];
  }
  function fuzzyRatio(a, b, distance){
    return 1 - toNumber(distance) / Math.max(asText(a).length, asText(b).length, 1);
  }
  function matchTextInput(question, entered, answers, primaryAnswer){
    var normalizedEntered = normalizeTextAnswer(entered);
    var compactEntered = compactTextAnswer(entered);
    if (!normalizedEntered) return { ok:false, canonical:primaryAnswer, entered:entered };

    for (var i = 0; i < answers.length; i++) {
      var exactCandidate = asText(answers[i]);
      if (!exactCandidate) continue;
      if (normalizedEntered === normalizeTextAnswer(exactCandidate)) {
        return { ok:true, canonical:primaryAnswer || exactCandidate, entered:entered, matched:exactCandidate, matchKind:'text-exact', distance:0 };
      }
      if (compactEntered && compactEntered === compactTextAnswer(exactCandidate)) {
        return { ok:true, canonical:primaryAnswer || exactCandidate, entered:entered, matched:exactCandidate, matchKind:'text-normalized', distance:0 };
      }
    }

    var minLen = fuzzyMinLength(question);
    for (var j = 0; j < answers.length; j++) {
      var fuzzyCandidate = asText(answers[j]);
      if (!fuzzyCandidate) continue;
      var compactCandidate = compactTextAnswer(fuzzyCandidate);
      var tolerance = textTolerance(question, compactCandidate);
      if (!compactEntered || !compactCandidate || tolerance <= 0) continue;
      if (compactEntered.length < minLen || compactCandidate.length < minLen) continue;
      if (Math.abs(compactEntered.length - compactCandidate.length) > tolerance) continue;
      var distance = levenshteinDistance(compactEntered, compactCandidate, tolerance);
      if (!isFinite(distance) || distance > tolerance) continue;
      var ratio = fuzzyRatio(compactEntered, compactCandidate, distance);
      var minRatio = compactCandidate.length >= 14 ? 0.72 : compactCandidate.length >= 10 ? 0.78 : 0.84;
      if (ratio < minRatio) continue;
      return { ok:true, canonical:primaryAnswer || fuzzyCandidate, entered:entered, matched:fuzzyCandidate, matchKind:'text-fuzzy', distance:distance };
    }

    return { ok:false, canonical:primaryAnswer, entered:entered };
  }
  function matchInput(question, rawValue, mode){
    var entered = normalizeBaseText(rawValue);
    var answers = acceptedAnswers(question);
    var primaryAnswer = asText(question && question.answer);
    if (!entered) return { ok:false, canonical:primaryAnswer, entered:'' };

    if (mode === 'numeric') {
      var parsedInput = parseNumericValue(entered);
      if (parsedInput) {
        for (var i = 0; i < answers.length; i++) {
          var candidate = asText(answers[i]);
          var parsedAnswer = parseNumericValue(candidate);
          if (!parsedAnswer) continue;
          if (!numbersClose(parsedInput.num, parsedAnswer.num)) continue;
          if (parsedInput.unit && parsedAnswer.unit && parsedInput.unit !== parsedAnswer.unit) continue;
          return { ok:true, canonical:primaryAnswer || candidate, entered:entered, matched:candidate, matchKind:'numeric', distance:0 };
        }
      }
      var plainInput = normalizeUnit(entered.replace(/,/g, '.'));
      for (var j = 0; j < answers.length; j++) {
        var candidateText = asText(answers[j]);
        if (plainInput && plainInput === normalizeUnit(candidateText.replace(/,/g, '.'))) {
          return { ok:true, canonical:primaryAnswer || candidateText, entered:entered, matched:candidateText, matchKind:'numeric', distance:0 };
        }
      }
      return { ok:false, canonical:primaryAnswer, entered:entered };
    }

    if (mode === 'text') return matchTextInput(question, entered, answers, primaryAnswer);

    var normalizedEntered = normalizeClozeText(entered);
    for (var k = 0; k < answers.length; k++) {
      var item = asText(answers[k]);
      if (normalizedEntered && normalizedEntered === normalizeClozeText(item)) {
        return { ok:true, canonical:primaryAnswer || item, entered:entered, matched:item, matchKind:'cloze', distance:0 };
      }
    }
    return { ok:false, canonical:primaryAnswer, entered:entered };
  }
  function questionFingerprint(question){
    var raw = [
      asText(question && question.question),
      asText(question && question.answer),
      asText(question && question.tag),
      asText(question && question.code)
    ].join('|');
    var hash = 0;
    for (var i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    }
    return 'q' + (hash >>> 0).toString(16);
  }
  function modeName(){
    if (root.rushMode) return 'rush';
    if (root.diagMode) return 'diag';
    return 'train';
  }
  function pushTimingSample(sample){
    var data = readStore();
    var list = Array.isArray(data.samples) ? data.samples.slice(-SAMPLE_LIMIT + 1) : [];
    list.push(sample);
    data.samples = list;
    writeStore(data);
  }
  function armTiming(question){
    if (!question || !onPlayScreen() || hasSelection()) return;
    if (timingState.activeQuestion === question && !timingState.logged) return;
    timingState.activeQuestion = question;
    timingState.activeId = questionFingerprint(question);
    timingState.shownAt = Date.now();
    timingState.logged = false;
  }
  function captureTiming(question){
    if (!question || !timingState.shownAt || timingState.logged) return null;
    if (timingState.activeQuestion !== question && timingState.activeId !== questionFingerprint(question)) return null;
    var elapsed = Date.now() - timingState.shownAt;
    if (!isFinite(elapsed) || elapsed <= 0 || elapsed > MAX_ELAPSED_MS) {
      timingState.logged = true;
      return null;
    }
    var state = ensureInputState(question);
    var sample = {
      ts: Date.now(),
      ms: Math.round(elapsed),
      qid: timingState.activeId || questionFingerprint(question),
      grade: gradeKey(),
      mode: modeName(),
      subject: currentSubjectId(),
      tag: asText(question.tag),
      correct: asText(selectionValue()) === asText(question.answer),
      usedHelp: !!root.usedHelp,
      inputMode: state && state.mode ? state.mode : (inputModeFor(question) || 'choice')
    };
    pushTimingSample(sample);
    if (!question.__wave87xTiming || typeof question.__wave87xTiming !== 'object') question.__wave87xTiming = {};
    question.__wave87xTiming.last = sample;
    timingState.logged = true;
    return sample;
  }
  function ensureOption(question, value){
    value = asText(value);
    var answer = asText(question && question.answer);
    question.options = unique([answer].concat(Array.isArray(question && question.options) ? question.options : []).concat([value]));
    return question.options.indexOf(value);
  }
  function submitCustomValue(question, value){
    if (!question || hasSelection() || typeof root.ans !== 'function') return false;
    var idx = ensureOption(question, value);
    if (idx < 0) return false;
    allowProgrammaticAns = true;
    try {
      root.ans(idx);
      return true;
    } finally {
      allowProgrammaticAns = false;
    }
  }
  function formatSeconds(ms){
    var sec = Math.max(0, toNumber(ms)) / 1000;
    var digits = sec < 10 ? 1 : 0;
    return sec.toFixed(digits).replace('.', ',') + ' с';
  }
  function injectStyles(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave87x-input-card{display:flex;flex-direction:column;gap:10px}',
      '.wave87x-input-box{padding:14px 16px;border-radius:18px;border:1px solid rgba(107,107,126,.16);background:rgba(255,255,255,.6)}',
      '.wave87x-input-title{font-weight:800;font-size:14px;line-height:1.35}',
      '.wave87x-input-note{font-size:12px;color:var(--muted);line-height:1.45}',
      '.wave87x-input-row{display:flex;gap:8px;align-items:stretch}',
      '.wave87x-input{flex:1;min-width:0;padding:14px 16px;border-radius:14px;border:1px solid var(--border);background:var(--card);color:var(--text);font:600 16px/1.2 Golos Text,system-ui,sans-serif;box-shadow:inset 0 1px 0 rgba(255,255,255,.2)}',
      '.wave87x-input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(96,165,250,.18)}',
      '.wave87x-chiprow{display:flex;flex-wrap:wrap;gap:8px}',
      '.wave87x-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(107,107,126,.12);font-size:12px;font-weight:700;line-height:1.2}',
      '.wave87x-chip.ok{background:rgba(34,197,94,.14);color:#15803d}',
      '.wave87x-chip.no{background:rgba(239,68,68,.14);color:#b91c1c}',
      '.wave87x-input-inline{font-size:13px;color:var(--text);line-height:1.45}',
      '.wave87x-progress-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}',
      '.wave87x-progress-stat{padding:12px;border-radius:16px;border:1px solid rgba(107,107,126,.12);background:rgba(255,255,255,.55)}',
      '.wave87x-progress-stat .v{display:block;font-size:22px;font-weight:800;line-height:1.1}',
      '.wave87x-progress-stat .l{display:block;font-size:12px;color:var(--muted);margin-top:4px}',
      '.wave87x-topic-list{margin:12px 0 0;padding-left:18px}',
      '.wave87x-topic-list li{margin:6px 0;font-size:13px;line-height:1.4}',
      '@media (max-width:560px){.wave87x-input-row{flex-direction:column}.wave87x-progress-grid{grid-template-columns:1fr}}'
    ].join('');
    (document.head || document.documentElement).appendChild(style);
  }
  function makeButton(text, className){
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className || 'btn btn-p';
    button.textContent = text;
    return button;
  }
  function inputPlaceholder(mode, question){
    var customPlaceholder = asText(question && question.inputPlaceholder).trim();
    if (customPlaceholder) return customPlaceholder;
    if (mode === 'numeric') {
      var fraction = fractionExample(question);
      if (fraction) return 'Например: ' + fraction.fraction + ' или ' + fraction.decimal;
      var parsed = parseNumericValue(question && question.answer);
      return parsed && parsed.unit ? 'Например: 12 или 0,5 ' + parsed.unit : 'Введите число';
    }
    if (mode === 'text') return 'Введите слово или короткую фразу';
    return 'Впиши пропущенное слово или форму';
  }
  function inputHelperText(mode, question){
    var customHelper = asText(question && (question.inputHelper || question.inputNote || question.inputHint)).trim();
    if (customHelper) return customHelper;
    if (mode === 'numeric') {
      var fraction = fractionExample(question);
      if (fraction) return 'Можно вводить дробь вроде ' + fraction.fraction + ' или десятичное число ' + fraction.decimal + '. Нажми Enter, чтобы проверить.';
      return parseNumericValue(question && question.answer) && parseNumericValue(question.answer).unit ? 'Можно вводить число с единицами или без них. Нажми Enter, чтобы проверить.' : 'Допускаются точка и запятая. Нажми Enter, чтобы проверить.';
    }
    if (mode === 'text') {
      return textTolerance(question, compactTextAnswer(question && question.answer)) > 0
        ? 'Регистр не важен. В длинных словах допускается небольшая опечатка. Нажми Enter, чтобы проверить.'
        : 'Регистр не важен. Введи слово или короткую фразу и нажми Enter.';
    }
    return 'Регистр не важен. Нажми Enter, чтобы проверить.';
  }
  function currentInputElement(){
    return document.getElementById('wave87x-free-answer');
  }
  function submitCurrentInput(question, mode){
    if (!question || hasSelection()) return false;
    var state = ensureInputState(question);
    var input = currentInputElement();
    var rawValue = input ? input.value : state.draft;
    state.draft = rawValue;
    if (!normalizeBaseText(rawValue)) {
      toast('Сначала введи ответ.');
      try { if (input) input.focus(); } catch (_err) {}
      return false;
    }
    var verdict = matchInput(question, rawValue, mode);
    state.mode = mode;
    state.lastValue = rawValue;
    state.lastCanonical = verdict.ok ? verdict.canonical : asText(question.answer);
    state.lastMatchKind = verdict.ok ? (verdict.matchKind || '') : '';
    state.lastDistance = verdict.ok && isFinite(verdict.distance) ? verdict.distance : 0;
    state.lastMatched = verdict.ok ? asText(verdict.matched || verdict.canonical) : '';
    return submitCustomValue(question, verdict.ok ? verdict.canonical : normalizeBaseText(rawValue));
  }
  function renderInputQuestion(){
    var question = currentQuestion();
    var mode = inputModeFor(question);
    if (!mode) return;

    injectStyles();
    var opts = document.getElementById('opts');
    if (!opts) return;

    var state = ensureInputState(question);
    state.mode = mode;

    var wrap = document.createElement('div');
    wrap.className = 'wave87x-input-card';

    var box = document.createElement('div');
    box.className = 'wave87x-input-box';

    var title = document.createElement('div');
    title.className = 'wave87x-input-title';
    title.textContent = mode === 'numeric' ? 'Введите числовой ответ' : mode === 'text' ? 'Введите короткий ответ' : 'Впишите пропущенный фрагмент';
    box.appendChild(title);

    var note = document.createElement('div');
    note.className = 'wave87x-input-note';
    note.textContent = inputHelperText(mode, question);
    box.appendChild(note);

    var row = document.createElement('div');
    row.className = 'wave87x-input-row';

    var input = document.createElement('input');
    input.id = 'wave87x-free-answer';
    input.className = 'wave87x-input';
    input.type = 'text';
    input.autocomplete = 'off';
    input.autocapitalize = 'off';
    input.spellcheck = false;
    input.inputMode = mode === 'numeric' ? 'decimal' : 'text';
    input.placeholder = inputPlaceholder(mode, question);
    input.setAttribute('aria-label', title.textContent);
    input.value = hasSelection() ? (state.lastValue || state.draft || '') : (state.draft || '');
    input.disabled = hasSelection();
    if (!hasSelection()) {
      input.addEventListener('input', function(){ state.draft = input.value; });
      input.addEventListener('keydown', function(event){
        if (event.key === 'Enter' || event.key === 'NumpadEnter') {
          event.preventDefault();
          submitCurrentInput(question, mode);
        }
      });
    }
    row.appendChild(input);

    if (!hasSelection()) {
      var submit = makeButton('Проверить', 'btn btn-p');
      submit.addEventListener('click', function(){ submitCurrentInput(question, mode); });
      row.appendChild(submit);
    }
    box.appendChild(row);

    if (hasSelection()) {
      var info = document.createElement('div');
      info.className = 'wave87x-chiprow';

      var typed = document.createElement('span');
      typed.className = 'wave87x-chip ' + (asText(selectionValue()) === asText(question.answer) ? 'ok' : 'no');
      typed.textContent = 'Ввод: ' + (state.lastValue || '—');
      info.appendChild(typed);

      var timing = question.__wave87xTiming && question.__wave87xTiming.last ? question.__wave87xTiming.last : null;
      if (timing) {
        var chip = document.createElement('span');
        chip.className = 'wave87x-chip';
        chip.textContent = '⏱ ' + formatSeconds(timing.ms);
        info.appendChild(chip);
      }
      if (state.lastMatchKind === 'text-fuzzy') {
        var fuzzyChip = document.createElement('span');
        fuzzyChip.className = 'wave87x-chip';
        fuzzyChip.textContent = '≈ опечатка зачтена';
        info.appendChild(fuzzyChip);
      }
      box.appendChild(info);

      if (state.lastCanonical && normalizeBaseText(state.lastCanonical) !== normalizeBaseText(state.lastValue || '')) {
        var canonical = document.createElement('div');
        canonical.className = 'wave87x-input-inline';
        canonical.textContent = 'Зачтено как: ' + state.lastCanonical;
        box.appendChild(canonical);
      }
    }

    wrap.appendChild(box);
    opts.innerHTML = '';
    opts.setAttribute('role', 'group');
    opts.setAttribute('aria-label', mode === 'numeric' ? 'Числовой ответ' : mode === 'text' ? 'Текстовый ответ' : 'Ответ с вводом');
    opts.appendChild(wrap);

    if (!hasSelection()) {
      setTimeout(function(){
        try {
          input.focus({ preventScroll:true });
          if (mode === 'numeric' && input.value) input.select();
        } catch (_err) {}
      }, 0);
    }
  }
  function appendTimingToFeedback(){
    var question = currentQuestion();
    if (!question || !hasSelection()) return;
    var sample = question.__wave87xTiming && question.__wave87xTiming.last ? question.__wave87xTiming.last : null;
    if (!sample) return;
    var slot = document.getElementById('fba');
    if (!slot) return;
    var box = slot.querySelector('.fb');
    if (!box || box.querySelector('[data-wave87x-feedback-time]')) return;
    var info = document.createElement('div');
    info.className = 'fbh';
    info.setAttribute('data-wave87x-feedback-time', '1');
    info.textContent = '⏱ Время ответа: ' + formatSeconds(sample.ms);
    var nextButton = box.querySelector('button.btn');
    if (nextButton) box.insertBefore(info, nextButton);
    else box.appendChild(info);
  }
  function average(values){
    if (!values.length) return 0;
    var total = 0;
    values.forEach(function(item){ total += toNumber(item); });
    return total / values.length;
  }
  function median(values){
    if (!values.length) return 0;
    var copy = values.map(toNumber).sort(function(a, b){ return a - b; });
    var mid = Math.floor(copy.length / 2);
    return copy.length % 2 ? copy[mid] : (copy[mid - 1] + copy[mid]) / 2;
  }
  function buildTimingStats(){
    var data = readStore();
    var rows = Array.isArray(data.samples) ? data.samples.filter(function(item){
      return item && isFinite(item.ms) && item.ms > 0;
    }) : [];
    var byMode = { train:[], rush:[], diag:[] };
    rows.forEach(function(item){
      var key = item.mode === 'rush' ? 'rush' : item.mode === 'diag' ? 'diag' : 'train';
      byMode[key].push(item);
    });
    var train = byMode.train.slice(-TRAINING_SAMPLE_LIMIT);
    var msList = train.map(function(item){ return toNumber(item.ms); }).filter(function(item){ return item > 0; });
    if (!msList.length) {
      return {
        total: 0,
        counts: { train:byMode.train.length, rush:byMode.rush.length, diag:byMode.diag.length }
      };
    }

    var slowMap = {};
    train.forEach(function(item){
      var tag = asText(item.tag) || 'Без темы';
      if (!slowMap[tag]) slowMap[tag] = { tag:tag, count:0, total:0 };
      slowMap[tag].count += 1;
      slowMap[tag].total += toNumber(item.ms);
    });

    var slowTopics = Object.keys(slowMap).map(function(key){
      return {
        tag: key,
        count: slowMap[key].count,
        avgMs: slowMap[key].count ? slowMap[key].total / slowMap[key].count : 0
      };
    }).filter(function(item){ return item.count >= 2; }).sort(function(a, b){ return b.avgMs - a.avgMs; }).slice(0, 3);

    var fastCount = msList.filter(function(item){ return item <= 10000; }).length;
    var correctCount = train.filter(function(item){ return !!item.correct; }).length;
    return {
      total: train.length,
      counts: { train:byMode.train.length, rush:byMode.rush.length, diag:byMode.diag.length },
      avgMs: average(msList),
      medianMs: median(msList),
      recentMs: average(msList.slice(-10)),
      fastPct: train.length ? Math.round(fastCount / train.length * 100) : 0,
      correctPct: train.length ? Math.round(correctCount / train.length * 100) : 0,
      slowTopics: slowTopics
    };
  }
  function appendTimingProgress(){
    injectStyles();
    var host = document.getElementById('prog-content');
    if (!host) return;
    var old = host.querySelector('[data-wave87x-timing-card]');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var stats = buildTimingStats();
    if (!stats.total) return;

    var card = document.createElement('div');
    card.className = 'rcard';
    card.setAttribute('data-wave87x-timing-card', '1');

    var title = document.createElement('h3');
    title.textContent = '⏱ Скорость ответа';
    card.appendChild(title);

    var lead = document.createElement('div');
    lead.className = 'wave87x-input-note';
    lead.textContent = 'Считаются последние ' + stats.total + ' ответов в обычном тренажёре. Лог по скорости хранится отдельно для каждого класса.';
    card.appendChild(lead);

    var grid = document.createElement('div');
    grid.className = 'wave87x-progress-grid';
    [
      { value:formatSeconds(stats.avgMs), label:'среднее время' },
      { value:formatSeconds(stats.medianMs), label:'медиана' },
      { value:formatSeconds(stats.recentMs), label:'последние 10 ответов' },
      { value:String(stats.counts.train), label:'записей в журнале' }
    ].forEach(function(item){
      var cell = document.createElement('div');
      cell.className = 'wave87x-progress-stat';
      var value = document.createElement('span');
      value.className = 'v';
      value.textContent = item.value;
      var label = document.createElement('span');
      label.className = 'l';
      label.textContent = item.label;
      cell.appendChild(value);
      cell.appendChild(label);
      grid.appendChild(cell);
    });
    card.appendChild(grid);

    var chips = document.createElement('div');
    chips.className = 'wave87x-chiprow';
    [
      '≤10 с: ' + stats.fastPct + '%',
      'точность: ' + stats.correctPct + '%',
      '⚡ молния: ' + stats.counts.rush,
      '📝 диагностика: ' + stats.counts.diag
    ].forEach(function(text){
      var chip = document.createElement('span');
      chip.className = 'wave87x-chip';
      chip.textContent = text;
      chips.appendChild(chip);
    });
    card.appendChild(chips);

    if (stats.slowTopics && stats.slowTopics.length) {
      var slowTitle = document.createElement('div');
      slowTitle.className = 'wave87x-input-inline';
      slowTitle.style.marginTop = '12px';
      slowTitle.innerHTML = '<b>Где ответы идут медленнее всего:</b>';
      card.appendChild(slowTitle);

      var list = document.createElement('ol');
      list.className = 'wave87x-topic-list';
      stats.slowTopics.forEach(function(item){
        var li = document.createElement('li');
        li.textContent = item.tag + ' — в среднем ' + formatSeconds(item.avgMs) + ' (' + item.count + ' ответ' + (item.count === 1 ? '' : item.count >= 2 && item.count <= 4 ? 'а' : 'ов') + ')';
        list.appendChild(li);
      });
      card.appendChild(list);
    }

    var secondChild = host.children && host.children[1] ? host.children[1] : null;
    if (secondChild) host.insertBefore(card, secondChild);
    else host.appendChild(card);
  }
  function bindKeyboardGuard(){
    document.addEventListener('keydown', function(event){
      if (!onPlayScreen()) return;
      var question = currentQuestion();
      var mode = inputModeFor(question);
      if (!mode || hasSelection()) return;
      if (isEditableTarget(event.target)) return;
      var key = asText(event.key);
      if (/^[1-4a-dA-D]$/.test(key)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (key === 'Enter' || key === 'NumpadEnter') {
        var input = currentInputElement();
        if (!input) return;
        event.preventDefault();
        event.stopPropagation();
        submitCurrentInput(question, mode);
      }
    }, true);
  }

  bindKeyboardGuard();

  var baseAns = typeof root.ans === 'function' ? root.ans : null;
  if (baseAns) {
    root.ans = function(idx){
      var question = currentQuestion();
      if (inputModeFor(question) && !allowProgrammaticAns) return null;
      var hadSelection = hasSelection();
      var result = baseAns.apply(this, arguments);
      try {
        if (!hadSelection && question && hasSelection()) captureTiming(question);
      } catch (_err) {}
      return result;
    };
  }

  var baseRender = typeof root.render === 'function' ? root.render : null;
  if (baseRender) {
    root.render = function(){
      var result = baseRender.apply(this, arguments);
      try {
        armTiming(currentQuestion());
        renderInputQuestion();
        appendTimingToFeedback();
      } catch (_err) {}
      return result;
    };
  }

  var baseRenderProg = typeof root.renderProg === 'function' ? root.renderProg : null;
  if (baseRenderProg) {
    root.renderProg = function(){
      var result = baseRenderProg.apply(this, arguments);
      try { appendTimingProgress(); } catch (_err) {}
      return result;
    };
  }

  root.__wave87xInputTimingRuntime = {
    version: 'wave87z',
    inputModeFor: inputModeFor,
    matchInput: matchInput,
    readStore: readStore,
    buildTimingStats: buildTimingStats,
    questionFingerprint: questionFingerprint,
    levenshteinDistance: levenshteinDistance,
    normalizeTextAnswer: normalizeTextAnswer,
    matchTextInput: matchTextInput,
    currentQuestion: currentQuestion,
    currentSubjectId: currentSubjectId,
    selectionValue: selectionValue,
    hasSelection: hasSelection,
    pageGrade: pageGrade
  };
})();


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
    return hasSelection() && typeof root.sel !== 'undefined';
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


(function(){
  'use strict';
  if (typeof window === 'undefined') return;
  window.__wave89bMergedRuntime = {
    version: 'wave89b',
    components: ['wave87w','wave87x','wave88c','wave88d','wave89d','wave89e','wave89f','wave89g','wave89h','wave89k','wave89m','wave89n']
  };
})();


/* wave89d: simple mode / simplified UX gate */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89dSimpleMode) return;

  var root = window;
  var STORAGE_KEY = 'trainer_ui_mode';
  var LEGACY_STORAGE_KEY = 'trainer_simple_mode_v1';
  var OVERLAY_ID = 'wave89d-settings-modal';
  var HIDE_ATTR = 'data-wave89d-hide-simple';
  var CLASS_NAME = 'simple-mode';
  var bindQueueTimer = 0;
  var syncTimer = 0;
  var observer = null;
  var originalAbout = typeof root.showAbout === 'function' ? root.showAbout : null;
  var state = { enabled: true };

  function safeReadMode(){
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      raw = String(raw == null ? '' : raw).trim().toLowerCase();
      if (raw === 'simple') return true;
      if (raw === 'full') return false;
      var legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      legacy = String(legacy == null ? '' : legacy).trim().toLowerCase();
      if (legacy === 'on') return true;
      if (legacy === 'off') return false;
      return true;
    } catch (_err) {
      return true;
    }
  }
  function safeWriteMode(enabled){
    try { localStorage.setItem(STORAGE_KEY, enabled ? 'simple' : 'full'); } catch (_err) {}
    try { localStorage.setItem(LEGACY_STORAGE_KEY, enabled ? 'on' : 'off'); } catch (_err2) {}
  }
  function isEnabled(){
    return state.enabled;
  }
  function emitChange(){
    try {
      document.dispatchEvent(new CustomEvent('trainer:simplemodechange', { detail:{ enabled: state.enabled } }));
    } catch (_err) {}
  }
  function toast(message){
    try {
      if (typeof root.toast === 'function') root.toast(message);
      else if (typeof root.alert === 'function') root.alert(message);
    } catch (_err) {}
  }
  function addClass(node, enabled){
    if (!node || !node.classList) return;
    node.classList[enabled ? 'add' : 'remove'](CLASS_NAME);
  }
  function applyModeClasses(){
    state.enabled = safeReadMode();
    addClass(document.documentElement, state.enabled);
    addClass(document.body, state.enabled);
    return state.enabled;
  }
  function clearSavedMixFilter(){
    try {
      mixFilter = null;
      if (typeof saveMixFilter === 'function') saveMixFilter();
    } catch (_err) {
      try {
        localStorage.removeItem('trainer_mix_filter_' + String(root.GRADE_NUM || root.GRADE_NO || '10'));
      } catch (_err2) {}
    }
  }
  function gradeKey(){
    return String(root.GRADE_NUM || root.GRADE_NO || '10');
  }
  function safeJSON(raw, fallback){
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (_err) {
      return fallback;
    }
  }
  function readStore(key, fallback){
    try {
      return safeJSON(localStorage.getItem(key), fallback);
    } catch (_err) {
      return fallback;
    }
  }
  function reviewCounts(){
    var api = root.wave28Debug;
    var counts = { due:0, sticky:0, total:0 };
    try { counts.due = api && typeof api.dueCount === 'function' ? Number(api.dueCount()) || 0 : 0; } catch (_err) {}
    try { counts.sticky = api && typeof api.stickyCount === 'function' ? Number(api.stickyCount()) || 0 : 0; } catch (_err) {}
    try { counts.total = api && typeof api.totalCount === 'function' ? Number(api.totalCount()) || 0 : 0; } catch (_err) {}
    return counts;
  }
  function journalCount(){
    var rows = readStore('trainer_journal_' + gradeKey(), []);
    return Array.isArray(rows) ? rows.length : 0;
  }
  function savedSnapshot(){
    var snap = readStore('trainer_session_snapshot_' + gradeKey(), null);
    return snap && typeof snap === 'object' ? snap : null;
  }
  function savedLastTopic(){
    var last = readStore('trainer_last_topic_' + gradeKey(), null);
    return last && typeof last === 'object' ? last : null;
  }
  function totalSolvedOk(){
    var streak = readStore('trainer_streak_' + gradeKey(), {});
    return Number(streak && streak.totalOk) || 0;
  }
  function topicAttempts(progress, subjectId, topicId){
    var subj = progress && progress[subjectId];
    var row = subj && subj[topicId];
    return row ? (Number(row.ok) || 0) + (Number(row.err) || 0) : 0;
  }
  function unlockedSubject(subject){
    if (!subject || !subject.locked) return true;
    return totalSolvedOk() >= (Number(subject.unlockAt) || 0);
  }
  function findNewTopic(preferredSubjectId){
    var progress = readStore('trainer_progress_' + gradeKey(), {});
    var subjects = Array.isArray(root.SUBJ) ? root.SUBJ.slice() : [];
    if (!subjects.length) return null;
    if (preferredSubjectId) {
      subjects.sort(function(a, b){
        if (a && a.id === preferredSubjectId) return -1;
        if (b && b.id === preferredSubjectId) return 1;
        return 0;
      });
    }
    for (var i = 0; i < subjects.length; i += 1) {
      var subj = subjects[i];
      if (!unlockedSubject(subj)) continue;
      var topics = Array.isArray(subj && subj.tops) ? subj.tops : [];
      for (var j = 0; j < topics.length; j += 1) {
        var topic = topics[j];
        if (!topic) continue;
        if (topicAttempts(progress, subj.id, topic.id) === 0) return { subj:subj, topic:topic };
      }
    }
    return null;
  }
  function startFallbackMix(){
    if (typeof root.startGlobalMix === 'function') {
      root.startGlobalMix();
      return true;
    }
    if (typeof root.showMixFilter === 'function' && root.showMixFilter.__wave89dOriginal) {
      root.showMixFilter.__wave89dOriginal();
      return true;
    }
    if (typeof root.showMixFilter === 'function') {
      root.showMixFilter();
      return true;
    }
    return false;
  }
  function resolvePracticePlan(){
    var review = reviewCounts();
    if (review.due > 0 && typeof root.startDueReview === 'function') {
      return { kind:'due-review', message:'🔁 Сначала повторим ошибки за сегодня.' };
    }
    if (review.sticky > 0 && typeof root.startStickyReview === 'function') {
      return { kind:'sticky-review', message:'📌 Сначала повторим сложные ошибки.' };
    }
    if ((review.total > 0 || journalCount() > 0) && typeof root.startWeakTrainingByTopics === 'function') {
      return { kind:'weak-topics', message:'🎯 Начинаю со слабых тем.' };
    }
    var snap = savedSnapshot();
    if (snap && snap.prob && typeof root.wave21ResumeSession === 'function') {
      return { kind:'resume-session', message:'⏯ Продолжаю незавершённую сессию.' };
    }
    var last = savedLastTopic();
    if (last && last.subjId && last.topicId && typeof root.wave21ContinueLastTopic === 'function') {
      return { kind:'continue-last', message:'📚 Продолжаю последнюю тему.' };
    }
    var fresh = findNewTopic(last && last.subjId);
    if (fresh && typeof root.wave21OpenTopic === 'function') {
      return {
        kind: 'new-topic',
        subjectId: fresh.subj.id,
        topicId: fresh.topic.id,
        label: String(fresh.subj.nm || fresh.subj.id) + ' → ' + String(fresh.topic.nm || fresh.topic.id),
        message: '🆕 Новая тема: ' + String(fresh.subj.nm || fresh.subj.id) + ' → ' + String(fresh.topic.nm || fresh.topic.id) + '.'
      };
    }
    return { kind:'global-mix', message:'⚡ Запускаю обычную тренировку.' };
  }
  function runPracticePlan(plan){
    if (!plan || typeof plan !== 'object') return startFallbackMix();
    if (plan.message) toast(plan.message);
    if (plan.kind === 'due-review' && typeof root.startDueReview === 'function') {
      root.startDueReview();
      return true;
    }
    if (plan.kind === 'sticky-review' && typeof root.startStickyReview === 'function') {
      root.startStickyReview();
      return true;
    }
    if (plan.kind === 'weak-topics' && typeof root.startWeakTrainingByTopics === 'function') {
      root.startWeakTrainingByTopics();
      return true;
    }
    if (plan.kind === 'resume-session' && typeof root.wave21ResumeSession === 'function') {
      root.wave21ResumeSession();
      return true;
    }
    if (plan.kind === 'continue-last' && typeof root.wave21ContinueLastTopic === 'function') {
      root.wave21ContinueLastTopic();
      return true;
    }
    if (plan.kind === 'new-topic' && typeof root.wave21OpenTopic === 'function') {
      return !!root.wave21OpenTopic(plan.subjectId, plan.topicId, 'train');
    }
    return startFallbackMix();
  }
  function blockAdvanced(kind){
    var message = 'Эта функция скрыта в простом режиме.';
    if (kind === 'rush') message = '⚡ Молния скрыта в простом режиме.';
    else if (kind === 'rating') message = '🏆 Рейтинг скрыт в простом режиме.';
    else if (kind === 'exam') message = '📝 Экзамен и weekly challenge скрыты в простом режиме.';
    else if (kind === 'sync') message = '☁️ Синхронизация скрыта в простом режиме.';
    toast(message);
    return false;
  }
  function directPractice(){
    clearSavedMixFilter();
    state.lastPlan = resolvePracticePlan();
    return runPracticePlan(state.lastPlan);
  }
  function patchFunction(name, resolver){
    var fn = root[name];
    if (typeof fn !== 'function' || fn.__wave89dPatched) return false;
    var wrapped = function(){
      return resolver.call(this, fn, arguments);
    };
    wrapped.__wave89dPatched = true;
    wrapped.__wave89dOriginal = fn;
    root[name] = wrapped;
    return true;
  }
  function patchWaveObjects(){
    var examApi = root.wave86pChallenge;
    if (examApi && !examApi.__wave89dPatched) {
      ['startWeeklyChallenge', 'startExamPicker', 'showLeaderboards'].forEach(function(name){
        var fn = examApi[name];
        if (typeof fn !== 'function' || fn.__wave89dPatched) return;
        examApi[name] = function(){
          if (isEnabled()) return blockAdvanced(name === 'showLeaderboards' ? 'rating' : 'exam');
          return fn.apply(this, arguments);
        };
        examApi[name].__wave89dPatched = true;
      });
      examApi.__wave89dPatched = true;
    }
    var cloudApi = root.wave86wCloudSync;
    if (cloudApi && typeof cloudApi.open === 'function' && !cloudApi.open.__wave89dPatched) {
      var openSync = cloudApi.open;
      cloudApi.open = function(){
        if (isEnabled()) return blockAdvanced('sync');
        return openSync.apply(this, arguments);
      };
      cloudApi.open.__wave89dPatched = true;
    }
  }
  function ensureGlobalsPatched(){
    if (typeof root.showAbout === 'function' && !root.showAbout.__wave89dSettingsEntry) {
      if (!originalAbout || originalAbout.__wave89dSettingsEntry) originalAbout = root.showAbout;
      var wrappedAbout = function(){ return openSettings(); };
      wrappedAbout.__wave89dPatched = true;
      wrappedAbout.__wave89dSettingsEntry = true;
      wrappedAbout.__wave89dOriginal = originalAbout;
      root.showAbout = wrappedAbout;
    }
    patchFunction('showMixFilter', function(original){
      if (!isEnabled()) return original.apply(this, Array.prototype.slice.call(arguments[1] || []));
      return directPractice();
    });
    patchFunction('startRush', function(original, args){
      if (isEnabled()) return blockAdvanced('rush');
      return original.apply(this, Array.prototype.slice.call(args || []));
    });
    patchFunction('showRushRecords', function(original, args){
      if (isEnabled()) return blockAdvanced('rating');
      return original.apply(this, Array.prototype.slice.call(args || []));
    });
    patchFunction('showLeaderboard', function(original, args){
      if (isEnabled()) return blockAdvanced('rating');
      return original.apply(this, Array.prototype.slice.call(args || []));
    });
    patchFunction('renderCloudModal', function(original, args){
      if (isEnabled()) return blockAdvanced('sync');
      return original.apply(this, Array.prototype.slice.call(args || []));
    });
    patchWaveObjects();
  }
  function onOverlayKeydown(event){
    if (!event || event.key !== 'Escape') return;
    closeSettings();
  }
  function closeSettings(){
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (root.removeEventListener) root.removeEventListener('keydown', onOverlayKeydown, true);
  }
  function settingsButton(label, kind){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wave89d-settings-btn' + (kind === 'accent' ? ' accent' : '');
    btn.textContent = label;
    return btn;
  }
  function updateOverlay(){
    var overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;
    var enabled = isEnabled();
    var pill = overlay.querySelector('[data-wave89d-pill]');
    var note = overlay.querySelector('[data-wave89d-note]');
    var action = overlay.querySelector('[data-wave89d-toggle]');
    var modeButtons = overlay.querySelectorAll('[data-wave89d-mode]');
    if (pill) {
      pill.textContent = enabled ? 'ВКЛ' : 'ВЫКЛ';
      pill.classList.toggle('off', !enabled);
    }
    if (note) {
      note.textContent = enabled
        ? 'Простой: предметы, темы, вопросы — и больше ничего.'
        : 'Полный: экзамены, PvP, аналитика, SM-2 и все фичи.';
    }
    if (action) action.textContent = enabled ? 'Полный режим' : 'Простой режим';
    if (modeButtons && modeButtons.length) {
      Array.prototype.slice.call(modeButtons).forEach(function(btn){
        var mode = btn.getAttribute('data-wave89d-mode');
        var active = enabled ? mode === 'simple' : mode === 'full';
        if (btn.classList) btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
  }
  function openLegacyAbout(){
    if (typeof originalAbout !== 'function') return;
    closeSettings();
    setTimeout(function(){
      try { originalAbout(); } catch (_err) {}
    }, 20);
  }
  function goInfoFromSettings(){
    closeSettings();
    setTimeout(function(){
      try {
        if (typeof root.go === 'function') root.go('info');
      } catch (_err) {}
      scheduleSync();
    }, 20);
  }
  function openTourFromSettings(){
    closeSettings();
    setTimeout(function(){
      try {
        if (root.__wave89eOnboarding && typeof root.__wave89eOnboarding.start === 'function') root.__wave89eOnboarding.start({ manual:true, source:'settings' });
        else if (typeof root.toast === 'function') root.toast('Тур пока не готов.');
      } catch (_err) {}
      scheduleSync();
    }, 20);
  }
  function buildSettingsOverlay(){
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'wave89d-settings-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'wave89d-settings-title');
    overlay.addEventListener('click', function(event){
      if (event.target === overlay) closeSettings();
    });

    var card = document.createElement('div');
    card.className = 'wave89d-settings-card';

    var header = document.createElement('div');
    header.className = 'wave89d-settings-head';
    var title = document.createElement('h3');
    title.id = 'wave89d-settings-title';
    title.className = 'wave89d-settings-title';
    title.textContent = '⚙️ Настройки';
    var subtitle = document.createElement('p');
    subtitle.className = 'wave89d-settings-sub';
    subtitle.textContent = 'Выбери простой учебный интерфейс или полный режим со всеми возможностями.';
    header.appendChild(title);
    header.appendChild(subtitle);

    var section = document.createElement('div');
    section.className = 'wave89d-settings-section';
    var row = document.createElement('div');
    row.className = 'wave89d-settings-row';
    var copy = document.createElement('div');
    copy.className = 'wave89d-settings-copy';
    var strong = document.createElement('strong');
    strong.textContent = '📱 Режим';
    var desc = document.createElement('p');
    desc.setAttribute('data-wave89d-note', '');
    copy.appendChild(strong);
    copy.appendChild(desc);
    var pill = document.createElement('span');
    pill.className = 'wave89d-settings-pill';
    pill.setAttribute('data-wave89d-pill', '');
    row.appendChild(copy);
    row.appendChild(pill);
    section.appendChild(row);

    var actions = document.createElement('div');
    actions.className = 'wave89d-settings-actions';
    var simpleBtn = settingsButton('Простой', 'accent');
    simpleBtn.setAttribute('data-wave89d-mode', 'simple');
    simpleBtn.addEventListener('click', function(){
      setEnabled(true);
      updateOverlay();
    });
    var fullBtn = settingsButton('Полный');
    fullBtn.setAttribute('data-wave89d-mode', 'full');
    fullBtn.addEventListener('click', function(){
      setEnabled(false);
      updateOverlay();
    });
    var toggle = settingsButton('', 'accent');
    toggle.setAttribute('data-wave89d-toggle', '');
    toggle.addEventListener('click', function(){
      setEnabled(!isEnabled());
      updateOverlay();
    });
    var infoBtn = settingsButton('📖 Справка');
    infoBtn.addEventListener('click', goInfoFromSettings);
    var tourBtn = settingsButton('👋 Быстрый тур');
    tourBtn.addEventListener('click', openTourFromSettings);
    var aboutBtn = settingsButton('ℹ️ О проекте');
    aboutBtn.addEventListener('click', openLegacyAbout);
    var closeBtn = settingsButton('Закрыть');
    closeBtn.addEventListener('click', closeSettings);
    actions.appendChild(simpleBtn);
    actions.appendChild(fullBtn);
    actions.appendChild(infoBtn);
    actions.appendChild(tourBtn);
    actions.appendChild(aboutBtn);
    actions.appendChild(closeBtn);

    card.appendChild(header);
    card.appendChild(section);
    card.appendChild(actions);
    overlay.appendChild(card);
    return overlay;
  }
  function openSettings(){
    closeSettings();
    var overlay = buildSettingsOverlay();
    document.body.appendChild(overlay);
    if (root.addEventListener) root.addEventListener('keydown', onOverlayKeydown, true);
    updateOverlay();
    return overlay;
  }
  function relabelAboutButtons(){
    Array.prototype.slice.call(document.querySelectorAll('[data-wave87r-action="show-about"]')).forEach(function(btn){
      if (!btn) return;
      btn.textContent = '⚙️ Настройки';
      btn.setAttribute('aria-label', 'Настройки');
      btn.setAttribute('title', 'Настройки');
      btn.setAttribute('data-wave89d-settings-entry', '1');
    });
  }
  function bindDynamicButton(button, role, extra){
    if (!button || button.__wave89dBoundRole === role) return;
    button.__wave89dBoundRole = role;
    try { button.removeAttribute('onclick'); } catch (_err) {}
    button.addEventListener('click', function(event){
      if (!button.isConnected) return;
      if (event && event.preventDefault) event.preventDefault();
      if (event && event.stopImmediatePropagation) event.stopImmediatePropagation();
      if (event && event.stopPropagation) event.stopPropagation();
      if (role === 'practice') {
        if (isEnabled()) directPractice();
        else if (typeof root.showMixFilter === 'function' && root.showMixFilter.__wave89dOriginal) root.showMixFilter.__wave89dOriginal();
        else if (typeof root.showMixFilter === 'function') root.showMixFilter();
        return;
      }
      if (role === 'rush') {
        if (isEnabled()) { blockAdvanced('rush'); return; }
        if (typeof root.startRush === 'function') root.startRush(Number(extra || 3) || 3);
        return;
      }
      if (role === 'rating') {
        if (isEnabled()) { blockAdvanced('rating'); return; }
        if (typeof root.showRushRecords === 'function') {
          if (root.showRushRecords.__wave89dOriginal) root.showRushRecords.__wave89dOriginal();
          else root.showRushRecords();
        }
      }
    }, true);
  }
  function syncDailyMeter(){
    var host = document.getElementById('daily-meter');
    if (!host) return;
    var practiceButton = host.querySelector('button[onclick*="showMixFilter"]');
    if (practiceButton) {
      practiceButton.textContent = isEnabled() ? '▶ Заниматься' : '⚡ Всё вперемешку';
      bindDynamicButton(practiceButton, 'practice', '');
    }
    Array.prototype.slice.call(host.querySelectorAll('button[onclick*="startRush("]')).forEach(function(btn){
      var raw = String(btn.getAttribute('onclick') || '');
      var match = raw.match(/startRush\((\d+)\)/);
      bindDynamicButton(btn, 'rush', match ? match[1] : '3');
      if (btn.parentElement) btn.parentElement.setAttribute(HIDE_ATTR, '1');
    });
    Array.prototype.slice.call(host.querySelectorAll('button[onclick*="showRushRecords"]')).forEach(function(btn){
      bindDynamicButton(btn, 'rating', '');
      if (btn.parentElement) btn.parentElement.setAttribute(HIDE_ATTR, '1');
    });
  }
  function updateOpenOverlayCopy(){
    updateOverlay();
  }
  function syncDynamic(){
    applyModeClasses();
    ensureGlobalsPatched();
    relabelAboutButtons();
    syncDailyMeter();
    updateOpenOverlayCopy();
  }
  function scheduleSync(){
    if (syncTimer && typeof root.clearTimeout === 'function') root.clearTimeout(syncTimer);
    syncTimer = (typeof root.setTimeout === 'function' ? root.setTimeout : setTimeout)(function(){
      syncTimer = 0;
      syncDynamic();
    }, 40);
  }
  function scheduleBindQueue(){
    if (bindQueueTimer && typeof root.clearTimeout === 'function') root.clearTimeout(bindQueueTimer);
    bindQueueTimer = (typeof root.setTimeout === 'function' ? root.setTimeout : setTimeout)(function(){
      bindQueueTimer = 0;
      ensureGlobalsPatched();
    }, 120);
  }
  function bind(){
    applyModeClasses();
    ensureGlobalsPatched();
    relabelAboutButtons();
    syncDailyMeter();
    if (document.addEventListener) {
      document.addEventListener('click', function(event){
        var target = event && event.target && event.target.closest ? event.target.closest('[data-wave87r-action="show-about"]') : null;
        if (!target) return;
        scheduleSync();
      }, true);
    }
    if (typeof MutationObserver === 'function' && document.body) {
      observer = new MutationObserver(function(){
        scheduleBindQueue();
        scheduleSync();
      });
      try { observer.observe(document.body, { childList:true, subtree:true }); } catch (_err) {}
    }
    scheduleSync();
  }
  function setEnabled(enabled, options){
    state.enabled = !!enabled;
    safeWriteMode(state.enabled);
    applyModeClasses();
    scheduleBindQueue();
    scheduleSync();
    try {
      if (typeof root.renderDailyMeter === 'function') root.renderDailyMeter();
    } catch (_err) {}
    if (!options || !options.silent) {
      toast(state.enabled ? '✅ Простой режим включён' : '✨ Продвинутые режимы снова доступны');
    }
    emitChange();
    return state.enabled;
  }

  if (document.readyState === 'loading' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  root.__wave89dSimpleMode = {
    version: 'wave89d',
    storageKey: STORAGE_KEY,
    legacyStorageKey: LEGACY_STORAGE_KEY,
    isEnabled: isEnabled,
    setEnabled: setEnabled,
    openSettings: openSettings,
    closeSettings: closeSettings,
    sync: syncDynamic,
    resolvePracticePlan: resolvePracticePlan,
    runPracticePlan: runPracticePlan,
    directPractice: directPractice,
    getLastPlan: function(){ return state.lastPlan || null; },
    blockAdvanced: blockAdvanced,
    selectors: {
      examCard: '#wave86p-challenge-card',
      pvpCard: '#wave86v-pvp-card',
      cloudButtons: ['#wave86w-main-cloud-btn', '#wave86w-profile-cloud-btn', '#wave86w-backup-cloud-section', '#wave86w-remote-banner'],
      hallButtons: ['[data-wave68-action="leaders"]', '[data-wave68-action="sync"]', '#wave68-sync-now']
    }
  };
})();


/* wave89e: onboarding / first-visit tour */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89eOnboarding) return;

  var root = window;
  var STORAGE_KEY = 'trainer_onboarding_wave89e_v1';
  var OVERLAY_ID = 'wave89e-tour-overlay';
  var TARGET_ATTR = 'data-wave89e-tour-target';
  var BODY_CLASS = 'wave89e-tour-open';
  var KEYDOWN_BOUND = false;
  var stepTimer = 0;
  var state = {
    open: false,
    manual: false,
    stepIndex: 0,
    highlighted: null,
    tourTopic: null,
    stepCount: 3,
    completed: false,
    lastReason: ''
  };

  function safeRead(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw == null ? fallback : raw;
    } catch (_err) {
      return fallback;
    }
  }
  function safeReadJson(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_err) {
      return fallback;
    }
  }
  function safeWrite(key, value){
    try { localStorage.setItem(key, value); } catch (_err) {}
  }
  function toast(message){
    try {
      if (typeof root.toast === 'function') root.toast(message);
      else if (typeof root.alert === 'function') root.alert(message);
    } catch (_err) {}
  }
  function gradeKey(){
    return String(root.GRADE_NUM || root.GRADE_NO || '10');
  }
  function totalSolvedOk(){
    var streak = safeReadJson('trainer_streak_' + gradeKey(), {});
    return Number(streak && streak.totalOk) || 0;
  }
  function hasMeaningfulProgress(){
    var progress = safeReadJson('trainer_progress_' + gradeKey(), {});
    if (progress && typeof progress === 'object') {
      var subjectIds = Object.keys(progress);
      for (var i = 0; i < subjectIds.length; i += 1) {
        var subj = progress[subjectIds[i]];
        if (!subj || typeof subj !== 'object') continue;
        var topicIds = Object.keys(subj);
        for (var j = 0; j < topicIds.length; j += 1) {
          var row = subj[topicIds[j]];
          if (!row || typeof row !== 'object') continue;
          if ((Number(row.ok) || 0) + (Number(row.err) || 0) > 0) return true;
        }
      }
    }
    var journal = safeReadJson('trainer_journal_' + gradeKey(), []);
    if (Array.isArray(journal) && journal.length) return true;
    var snap = safeReadJson('trainer_session_snapshot_' + gradeKey(), null);
    if (snap && typeof snap === 'object' && snap.prob) return true;
    var last = safeReadJson('trainer_last_topic_' + gradeKey(), null);
    if (last && typeof last === 'object' && last.subjId && last.topicId) return true;
    return totalSolvedOk() > 0;
  }
  function hasSeenTour(){
    var value = String(safeRead(STORAGE_KEY, '') || '').trim().toLowerCase();
    return value === 'done' || value === 'skipped';
  }
  function markSeen(kind){
    safeWrite(STORAGE_KEY, kind === 'skip' ? 'skipped' : 'done');
  }
  function activeScreenId(){
    var screen = document.querySelector('.scr.on');
    return screen && screen.id ? screen.id : '';
  }
  function clearStepTimer(){
    if (!stepTimer) return;
    try { (root.clearTimeout || clearTimeout)(stepTimer); } catch (_err) {}
    stepTimer = 0;
  }
  function addBodyClass(enabled){
    if (!document.body || !document.body.classList) return;
    document.body.classList[enabled ? 'add' : 'remove'](BODY_CLASS);
    if (document.documentElement && document.documentElement.classList) {
      document.documentElement.classList[enabled ? 'add' : 'remove'](BODY_CLASS);
    }
  }
  function clearHighlight(){
    if (state.highlighted && state.highlighted.removeAttribute) {
      try { state.highlighted.removeAttribute(TARGET_ATTR); } catch (_err) {}
    }
    state.highlighted = null;
  }
  function highlightTarget(node){
    clearHighlight();
    if (!node) return null;
    try { node.setAttribute(TARGET_ATTR, '1'); } catch (_err) {}
    state.highlighted = node;
    try {
      if (typeof node.scrollIntoView === 'function') node.scrollIntoView({ block:'center', inline:'nearest', behavior:'smooth' });
    } catch (_err2) {}
    return node;
  }
  function ensureMain(){
    try {
      if (typeof root.go === 'function') root.go('main');
    } catch (_err) {}
  }
  function subjectUnlocked(subject){
    if (!subject || !subject.locked) return true;
    return totalSolvedOk() >= (Number(subject.unlockAt) || 0);
  }
  function findTourTopic(){
    if (state.tourTopic) return state.tourTopic;
    var subjects = Array.isArray(root.SUBJ) ? root.SUBJ : [];
    for (var i = 0; i < subjects.length; i += 1) {
      var subj = subjects[i];
      if (!subjectUnlocked(subj)) continue;
      var topics = Array.isArray(subj && subj.tops) ? subj.tops : [];
      for (var j = 0; j < topics.length; j += 1) {
        var topic = topics[j];
        if (!topic) continue;
        state.tourTopic = { subj:subj, topic:topic };
        return state.tourTopic;
      }
    }
    return null;
  }
  function openTheoryStep(){
    var meta = findTourTopic();
    if (!meta) {
      ensureMain();
      return false;
    }
    try {
      if (typeof root.wave21OpenTopic === 'function') return !!root.wave21OpenTopic(meta.subj.id, meta.topic.id, 'theory');
    } catch (_err) {}
    ensureMain();
    return false;
  }
  function currentStep(){
    var idx = state.stepIndex;
    var step2Meta = findTourTopic();
    var topicLabel = step2Meta ? String(step2Meta.subj.nm || step2Meta.subj.id) + ' → ' + String(step2Meta.topic.nm || step2Meta.topic.id) : 'любая тема';
    var steps = [
      {
        id: 'pick-subject',
        title: '1. Начни с предмета',
        lead: 'Сначала выбери предмет на главном экране.',
        body: 'Карточки предметов — это вход в темы и теорию. В простом режиме здесь остаётся только самое нужное: обычный тренажёр без лишних сценариев.',
        selector: '#sg',
        prepare: ensureMain,
        cta: 'Дальше'
      },
      {
        id: 'read-theory',
        title: '2. Сначала теория, потом тренажёр',
        lead: 'Перед вопросами открой короткую шпаргалку по теме.',
        body: 'Я уже показал пример темы: ' + topicLabel + '. Прочитай теорию и запускай тренировку кнопкой «✏️ Начать тренажёр» — так вход в новую тему проще и спокойнее.',
        selector: '#s-theory .btn.btn-p[data-wave87r-action="start-normal-quiz"], #tc',
        prepare: openTheoryStep,
        cta: 'Дальше'
      },
      {
        id: 'smart-start',
        title: '3. Кнопка «▶ Заниматься» ведёт сама',
        lead: 'Когда не знаешь, с чего начать, жми одну кнопку.',
        body: 'На главном экране «▶ Заниматься» сама выберет следующий полезный шаг: ошибки, слабые темы, незавершённую или новую тему. В «⚙️ Настройки» можно в любой момент выключить простой режим и снова включить продвинутые сценарии.',
        selector: '#daily-meter',
        prepare: ensureMain,
        cta: 'Готово'
      }
    ];
    return steps[idx] || steps[0];
  }
  function queryTarget(selector){
    if (!selector) return null;
    var parts = String(selector).split(',');
    for (var i = 0; i < parts.length; i += 1) {
      var item = String(parts[i] || '').trim();
      if (!item) continue;
      var found = document.querySelector(item);
      if (found) return found;
    }
    return null;
  }
  function overlayButton(label, action, kind){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wave89e-tour-btn' + (kind ? ' ' + kind : '');
    btn.setAttribute('data-wave89e-action', action);
    btn.textContent = label;
    return btn;
  }
  function buildOverlay(){
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'wave89e-tour-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'wave89e-tour-title');

    var card = document.createElement('div');
    card.className = 'wave89e-tour-card';

    var badge = document.createElement('div');
    badge.className = 'wave89e-tour-badge';
    badge.textContent = '👋 Быстрый старт';

    var title = document.createElement('h3');
    title.id = 'wave89e-tour-title';
    title.className = 'wave89e-tour-title';

    var lead = document.createElement('p');
    lead.className = 'wave89e-tour-lead';
    lead.setAttribute('data-wave89e-tour', 'lead');

    var body = document.createElement('p');
    body.className = 'wave89e-tour-body';
    body.setAttribute('data-wave89e-tour', 'body');

    var progress = document.createElement('div');
    progress.className = 'wave89e-tour-progress';
    progress.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < state.stepCount; i += 1) {
      var dot = document.createElement('span');
      dot.className = 'wave89e-tour-dot';
      dot.setAttribute('data-wave89e-dot', String(i));
      progress.appendChild(dot);
    }

    var footer = document.createElement('div');
    footer.className = 'wave89e-tour-actions';
    footer.appendChild(overlayButton('Пропустить', 'skip', 'ghost'));
    footer.appendChild(overlayButton('Назад', 'prev', 'ghost'));
    footer.appendChild(overlayButton('Дальше', 'next', 'accent'));

    card.appendChild(badge);
    card.appendChild(title);
    card.appendChild(lead);
    card.appendChild(body);
    card.appendChild(progress);
    card.appendChild(footer);
    overlay.appendChild(card);

    overlay.addEventListener('click', function(event){
      var actionNode = event && event.target && event.target.closest ? event.target.closest('[data-wave89e-action]') : null;
      if (!actionNode) return;
      var action = actionNode.getAttribute('data-wave89e-action');
      if (action === 'skip') {
        close({ mark:'skip', reason:'skip' });
      } else if (action === 'prev') {
        prev();
      } else if (action === 'next') {
        next();
      }
    });
    return overlay;
  }
  function ensureOverlay(){
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) return overlay;
    overlay = buildOverlay();
    document.body.appendChild(overlay);
    return overlay;
  }
  function onKeydown(event){
    if (!state.open || !event) return;
    if (event.key === 'Escape') {
      if (event.preventDefault) event.preventDefault();
      close({ mark: state.manual ? '' : 'skip', reason:'escape' });
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'Enter') {
      if (event.preventDefault) event.preventDefault();
      next();
      return;
    }
    if (event.key === 'ArrowLeft') {
      if (event.preventDefault) event.preventDefault();
      prev();
    }
  }
  function bindKeydown(){
    if (KEYDOWN_BOUND || !root.addEventListener) return;
    root.addEventListener('keydown', onKeydown, true);
    KEYDOWN_BOUND = true;
  }
  function unbindKeydown(){
    if (!KEYDOWN_BOUND || !root.removeEventListener) return;
    root.removeEventListener('keydown', onKeydown, true);
    KEYDOWN_BOUND = false;
  }
  function updateOverlay(){
    if (!state.open) return;
    var step = currentStep();
    var overlay = ensureOverlay();
    var title = overlay.querySelector('#wave89e-tour-title');
    var lead = overlay.querySelector('[data-wave89e-tour="lead"]');
    var body = overlay.querySelector('[data-wave89e-tour="body"]');
    var prevBtn = overlay.querySelector('[data-wave89e-action="prev"]');
    var nextBtn = overlay.querySelector('[data-wave89e-action="next"]');
    if (title) title.textContent = step.title;
    if (lead) lead.textContent = step.lead;
    if (body) body.textContent = step.body;
    if (prevBtn) prevBtn.disabled = state.stepIndex === 0;
    if (nextBtn) nextBtn.textContent = step.cta || (state.stepIndex >= state.stepCount - 1 ? 'Готово' : 'Дальше');
    Array.prototype.slice.call(overlay.querySelectorAll('[data-wave89e-dot]')).forEach(function(dot){
      var idx = Number(dot.getAttribute('data-wave89e-dot')) || 0;
      dot.classList.toggle('active', idx === state.stepIndex);
    });
    clearStepTimer();
    stepTimer = (root.setTimeout || setTimeout)(function(){
      stepTimer = 0;
      highlightTarget(queryTarget(step.selector));
    }, 90);
  }
  function showStep(index){
    state.stepIndex = Math.max(0, Math.min(state.stepCount - 1, Number(index) || 0));
    var step = currentStep();
    try { if (step.prepare) step.prepare(); } catch (_err) {}
    updateOverlay();
  }
  function next(){
    if (!state.open) return false;
    if (state.stepIndex >= state.stepCount - 1) {
      close({ mark:'done', reason:'complete' });
      return true;
    }
    showStep(state.stepIndex + 1);
    return true;
  }
  function prev(){
    if (!state.open) return false;
    if (state.stepIndex <= 0) return false;
    showStep(state.stepIndex - 1);
    return true;
  }
  function isBusyScreen(){
    var screen = activeScreenId();
    return screen === 's-play' || screen === 's-result';
  }
  function shouldAutoOpen(){
    if (hasSeenTour()) return false;
    if (isBusyScreen()) return false;
    return !hasMeaningfulProgress();
  }
  function close(options){
    options = options || {};
    state.open = false;
    state.completed = options.mark === 'done';
    state.lastReason = options.reason || '';
    clearStepTimer();
    clearHighlight();
    addBodyClass(false);
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    unbindKeydown();
    if (options.mark) markSeen(options.mark === 'skip' ? 'skip' : 'done');
    if (typeof options.after === 'function') {
      try { options.after(); } catch (_err) {}
    }
    return true;
  }
  function start(options){
    options = options || {};
    if (!options.manual && !shouldAutoOpen()) return false;
    if (options.manual && isBusyScreen()) {
      toast('Заверши текущую сессию, чтобы открыть быстрый тур.');
      return false;
    }
    close({});
    state.open = true;
    state.manual = !!options.manual;
    state.completed = false;
    state.lastReason = 'open';
    state.tourTopic = null;
    addBodyClass(true);
    bindKeydown();
    showStep(0);
    return true;
  }
  function scheduleAutoOpen(){
    if (!shouldAutoOpen()) return false;
    clearStepTimer();
    stepTimer = (root.setTimeout || setTimeout)(function(){
      stepTimer = 0;
      start({ manual:false, auto:true });
    }, 260);
    return true;
  }
  function bind(){
    scheduleAutoOpen();
  }

  if (document.readyState === 'loading' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  root.__wave89eOnboarding = {
    version: 'wave89e',
    storageKey: STORAGE_KEY,
    start: start,
    next: next,
    prev: prev,
    close: close,
    shouldAutoOpen: shouldAutoOpen,
    scheduleAutoOpen: scheduleAutoOpen,
    activeScreenId: activeScreenId,
    findTourTopic: findTourTopic,
    isOpen: function(){ return !!state.open; },
    getState: function(){
      return {
        open: !!state.open,
        manual: !!state.manual,
        stepIndex: state.stepIndex,
        stepCount: state.stepCount,
        completed: !!state.completed,
        lastReason: state.lastReason,
        hasSeen: hasSeenTour()
      };
    }
  };
})();



/* wave89f: hamburger menu / secondary actions */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89fHamburgerMenu) return;

  var root = window;
  var TRIGGER_ID = 'wave89f-menu-trigger';
  var OVERLAY_ID = 'wave89f-menu-overlay';
  var PANEL_ID = 'wave89f-menu-panel';
  var BODY_CLASS = 'wave89f-menu-open';
  var HIDE_ATTR = 'data-wave89f-relocated';
  var ROW_ATTR = 'data-wave89f-menu-row';
  var ROW_EMPTY_ATTR = 'data-wave89f-empty-row';
  var observer = null;
  var syncTimer = 0;
  var keydownBound = false;
  var state = { open:false };

  function asText(value){
    return String(value == null ? '' : value);
  }
  function isElement(node){
    return !!(node && typeof node === 'object' && node.nodeType === 1);
  }
  function hasClass(node, className){
    return !!(isElement(node) && node.classList && node.classList.contains(className));
  }
  function toast(message){
    try {
      if (typeof root.toast === 'function') root.toast(message);
      else if (typeof root.alert === 'function') root.alert(message);
    } catch (_err) {}
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
  function addBodyClass(enabled){
    if (document.body && document.body.classList) document.body.classList[enabled ? 'add' : 'remove'](BODY_CLASS);
    if (document.documentElement && document.documentElement.classList) {
      document.documentElement.classList[enabled ? 'add' : 'remove'](BODY_CLASS);
    }
  }
  function applyTriggerState(open){
    var btn = getById(TRIGGER_ID);
    if (!btn) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.classList.toggle('open', !!open);
  }
  function gradeLabel(){
    try {
      if (root.__wave88dBreadcrumbs && typeof root.__wave88dBreadcrumbs.gradeLabel === 'function') {
        return root.__wave88dBreadcrumbs.gradeLabel();
      }
    } catch (_err) {}
    var raw = asText(root.GRADE_TITLE || root.GRADE_NUM || root.GRADE_NO || '').trim();
    raw = raw.replace(/^[^0-9А-Яа-яA-Za-z]+/, '').trim();
    if (!raw) raw = 'Класс';
    if (!/класс/i.test(raw)) raw += ' класс';
    return raw;
  }
  function isSimpleMode(){
    return !!(root.__wave89dSimpleMode && typeof root.__wave89dSimpleMode.isEnabled === 'function' && root.__wave89dSimpleMode.isEnabled());
  }
  function blockAdvanced(kind){
    if (root.__wave89dSimpleMode && typeof root.__wave89dSimpleMode.blockAdvanced === 'function') {
      return root.__wave89dSimpleMode.blockAdvanced(kind);
    }
    toast('Эта функция скрыта в простом режиме.');
    return false;
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
  function menuSections(){
    var simple = isSimpleMode();
    var sections = [
      {
        title: 'Учёба',
        items: [
          { id:'help', icon:'📖', label:'Справка', note:'Коротко вспомнить режимы и логику тренажёра' },
          { id:'journal', icon:'🔁', label:'Ошибки', note:'Открыть журнал ошибок и слабых тем' },
          { id:'badges', icon:'🏆', label:'Награды', note:'Посмотреть достижения, серии и бейджи' },
          { id:'dates', icon:'📅', label:'Даты диагностик', note:'Сместить фокус микса к ближайшим проверочным' }
        ]
      },
      {
        title: 'Аккаунт',
        items: [
          { id:'profile', icon:'👑', label:'Профиль', note:'Серия, статистика и код восстановления' },
          simple ? null : { id:'rating', icon:'🏆', label:'Рейтинг Молнии', note:'Локальный и общий рейтинг по режиму «Молния»' }
        ]
      },
      {
        title: 'Отчёты и экспорт',
        items: [
          { id:'report', icon:'📊', label:'Отчёт для родителя', note:'Открыть подробный снимок прогресса', accent:true },
          { id:'share-report', icon:'📤', label:'Поделиться прогрессом', note:'Создать ссылку-отчёт со снимком результатов' },
          { id:'export-csv', icon:'⬇️', label:'Экспорт CSV', note:'Скачать таблицу прогресса для родителя' },
          { id:'export-json', icon:'🧾', label:'Экспорт JSON', note:'Скачать JSON прогресса текущего класса' }
        ]
      },
      {
        title: 'Данные',
        items: [
          { id:'backup', icon:'💾', label:'Резервная копия', note:'Сохранить и восстановить данные текущего класса' },
          simple ? null : { id:'sync', icon:'☁️', label:'Синхронизация', note:'Облако между устройствами без лишних кнопок на главной' }
        ]
      },
      {
        title: 'Система',
        items: [
          { id:'settings', icon:'⚙️', label:'Настройки', note:'Простой режим, оформление и быстрый тур' },
          { id:'classes', icon:'🏫', label:'Другой класс', note:'Вернуться к выбору класса или открыть список классов' }
        ]
      }
    ];
    return sections.map(function(section){
      return {
        title: section.title,
        items: (Array.isArray(section.items) ? section.items : []).filter(Boolean)
      };
    }).filter(function(section){ return section.items.length > 0; });
  }
  function visibleItemIds(){
    return menuSections().reduce(function(acc, section){
      section.items.forEach(function(item){ acc.push(item.id); });
      return acc;
    }, []);
  }
  function getHydrator(){
    return root.wave87nRuntimeSplit && typeof root.wave87nRuntimeSplit.hydrateForAction === 'function'
      ? root.wave87nRuntimeSplit.hydrateForAction
      : null;
  }
  function hydrate(action, opts){
    var fn = getHydrator();
    if (typeof fn === 'function' && action) {
      try { return Promise.resolve(fn(action, opts || {})); } catch (_err) { return Promise.resolve(false); }
    }
    return Promise.resolve(false);
  }
  function loadServices(opts){
    var api = root.wave87nRuntimeSplit;
    if (api && typeof api.loadServices === 'function') {
      try { return Promise.resolve(api.loadServices(opts || {})); } catch (_err) { return Promise.resolve(false); }
    }
    return Promise.resolve(false);
  }
  function scheduleSync(){
    if (syncTimer && typeof root.clearTimeout === 'function') root.clearTimeout(syncTimer);
    syncTimer = (typeof root.setTimeout === 'function' ? root.setTimeout : setTimeout)(function(){
      syncTimer = 0;
      sync();
    }, 50);
  }
  function closeMenu(){
    state.open = false;
    var overlay = getById(OVERLAY_ID);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    addBodyClass(false);
    applyTriggerState(false);
    if (keydownBound && root.removeEventListener) {
      root.removeEventListener('keydown', onKeydown, true);
      keydownBound = false;
    }
    return true;
  }
  function closeThen(run){
    closeMenu();
    (root.setTimeout || setTimeout)(function(){
      try { if (typeof run === 'function') run(); } catch (_err) {}
      scheduleSync();
    }, 20);
  }
  function runMenuAction(id){
    id = asText(id).trim();
    if (!id) return false;
    if (!maybeLeavePlay()) return false;
    if (id === 'help') {
      closeThen(function(){
        if (typeof root.go === 'function') root.go('info');
        else toast('Справка пока недоступна.');
      });
      return true;
    }
    if (id === 'journal') {
      closeThen(function(){
        if (typeof root.showJournal === 'function') root.showJournal();
        else toast('Журнал ошибок пока недоступен.');
      });
      return true;
    }
    if (id === 'badges') {
      closeThen(function(){
        hydrate('show-badges', { interactive:true, source:'menu-badges' }).then(function(){
          if (typeof root.showBadges === 'function') root.showBadges();
          else toast('Награды пока недоступны.');
        });
      });
      return true;
    }
    if (id === 'dates') {
      closeThen(function(){
        if (typeof root.showDateEditor === 'function') root.showDateEditor();
        else toast('Редактор дат пока недоступен.');
      });
      return true;
    }
    if (id === 'profile') {
      closeThen(function(){
        hydrate('show-profile', { interactive:true, source:'menu-profile' }).then(function(){
          if (typeof root.showHallOfFame === 'function') root.showHallOfFame();
        });
      });
      return true;
    }
    if (id === 'rating') {
      if (isSimpleMode()) return blockAdvanced('rating');
      closeThen(function(){
        if (typeof root.showRushRecords === 'function') root.showRushRecords();
        else toast('Рейтинг пока недоступен.');
      });
      return true;
    }
    if (id === 'report') {
      closeThen(function(){
        hydrate('generate-report', { interactive:true, source:'menu-report' }).then(function(){
          if (typeof root.generateReport === 'function') root.generateReport();
          else toast('Отчёт пока загружается.');
        });
      });
      return true;
    }
    if (id === 'share-report') {
      closeThen(function(){
        hydrate('share-report', { interactive:true, source:'menu-share-report' }).then(function(){
          if (typeof root.shareReport === 'function') root.shareReport();
          else toast('Поделиться прогрессом пока нельзя.');
        });
      });
      return true;
    }
    if (id === 'export-csv' || id === 'export-json') {
      closeThen(function(){
        var api = root.wave86nProgressTools;
        var format = id === 'export-csv' ? 'csv' : 'json';
        if (api && typeof api.exportParentProgress === 'function') api.exportParentProgress(format);
        else toast('Экспорт пока не готов.');
      });
      return true;
    }
    if (id === 'backup') {
      closeThen(function(){
        hydrate('show-backup', { interactive:true, source:'menu-backup' }).then(function(){
          if (typeof root.showBackupModal === 'function') root.showBackupModal();
          else toast('Резервная копия пока загружается.');
        });
      });
      return true;
    }
    if (id === 'sync') {
      if (isSimpleMode()) return blockAdvanced('sync');
      closeThen(function(){
        loadServices({ ui:{ scope:'runtime', kind:'services', action:'sync', title:'Подгружаю синхронизацию', label:'Загружаю облачные сервисы и резервное хранилище…' } }).then(function(){
          if (root.wave86wCloudSync && typeof root.wave86wCloudSync.open === 'function') root.wave86wCloudSync.open();
          else toast('Синхронизация ещё загружается.');
        });
      });
      return true;
    }
    if (id === 'settings') {
      closeThen(function(){
        if (root.__wave89dSimpleMode && typeof root.__wave89dSimpleMode.openSettings === 'function') root.__wave89dSimpleMode.openSettings();
        else if (typeof root.showAbout === 'function') root.showAbout();
      });
      return true;
    }
    if (id === 'classes') {
      closeThen(function(){
        if (typeof root.showClassSelect === 'function') root.showClassSelect();
        else if (root.location && typeof root.location.assign === 'function') root.location.assign('index.html?choose');
        else if (root.location) root.location.href = 'index.html?choose';
      });
      return true;
    }
    return false;
  }
  function menuActionButton(item){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wave89f-menu-item' + (item.accent ? ' accent' : '');
    btn.setAttribute('data-wave89f-item', item.id);

    var icon = document.createElement('span');
    icon.className = 'wave89f-menu-item-icon';
    icon.textContent = item.icon || '•';

    var copy = document.createElement('span');
    copy.className = 'wave89f-menu-item-copy';
    var strong = document.createElement('strong');
    strong.textContent = item.label;
    var note = document.createElement('span');
    note.textContent = item.note || '';
    copy.appendChild(strong);
    copy.appendChild(note);

    btn.appendChild(icon);
    btn.appendChild(copy);
    btn.addEventListener('click', function(){ runMenuAction(item.id); });
    return btn;
  }
  function buildMenuOverlay(){
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'wave89f-menu-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'wave89f-menu-title');
    overlay.addEventListener('click', function(event){
      if (event.target === overlay) closeMenu();
    });

    var panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.className = 'wave89f-menu-panel';

    var head = document.createElement('div');
    head.className = 'wave89f-menu-head';

    var meta = document.createElement('div');
    meta.className = 'wave89f-menu-meta';
    var badge = document.createElement('div');
    badge.className = 'wave89f-menu-badge';
    badge.textContent = '☰ Быстрое меню';
    var title = document.createElement('h3');
    title.id = 'wave89f-menu-title';
    title.className = 'wave89f-menu-title';
    title.textContent = gradeLabel();
    var sub = document.createElement('p');
    sub.className = 'wave89f-menu-sub';
    sub.textContent = isSimpleMode()
      ? 'В простом режиме вторичные функции собраны здесь, а главное остаётся на экране.'
      : 'Вторичные функции и данные собраны в одном месте без перегруза главного экрана.';
    meta.appendChild(badge);
    meta.appendChild(title);
    meta.appendChild(sub);

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'wave89f-menu-close';
    close.setAttribute('aria-label', 'Закрыть меню');
    close.textContent = '✕';
    close.addEventListener('click', closeMenu);

    head.appendChild(meta);
    head.appendChild(close);
    panel.appendChild(head);

    var sections = menuSections();
    for (var i = 0; i < sections.length; i += 1) {
      var section = sections[i];
      var wrap = document.createElement('section');
      wrap.className = 'wave89f-menu-section';
      var heading = document.createElement('h4');
      heading.className = 'wave89f-menu-section-title';
      heading.textContent = section.title;
      var grid = document.createElement('div');
      grid.className = 'wave89f-menu-grid';
      section.items.forEach(function(item){ grid.appendChild(menuActionButton(item)); });
      wrap.appendChild(heading);
      wrap.appendChild(grid);
      panel.appendChild(wrap);
    }

    overlay.appendChild(panel);
    return overlay;
  }
  function openMenu(){
    closeMenu();
    var overlay = buildMenuOverlay();
    document.body.appendChild(overlay);
    state.open = true;
    addBodyClass(true);
    applyTriggerState(true);
    if (!keydownBound && root.addEventListener) {
      root.addEventListener('keydown', onKeydown, true);
      keydownBound = true;
    }
    var closeBtn = overlay.querySelector('.wave89f-menu-close');
    if (closeBtn && typeof closeBtn.focus === 'function') {
      try { closeBtn.focus({ preventScroll:true }); } catch (_err) { try { closeBtn.focus(); } catch (_err2) {} }
    }
    return overlay;
  }
  function toggleMenu(){
    return state.open ? closeMenu() : openMenu();
  }
  function onKeydown(event){
    if (!state.open || !event) return;
    if (event.key === 'Escape') {
      if (event.preventDefault) event.preventDefault();
      closeMenu();
    }
  }
  function ensureTrigger(){
    var header = document.querySelector('header');
    if (!header) return null;
    var button = getById(TRIGGER_ID);
    if (button && button.parentNode !== header) {
      try { button.parentNode.removeChild(button); } catch (_err) {}
      button = null;
    }
    if (!button) {
      button = document.createElement('button');
      button.id = TRIGGER_ID;
      button.type = 'button';
      button.className = 'wave89f-menu-trigger';
      button.textContent = '☰';
      button.setAttribute('aria-label', 'Открыть быстрое меню');
      button.setAttribute('title', 'Меню');
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', OVERLAY_ID);
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', function(event){
        if (event && event.preventDefault) event.preventDefault();
        toggleMenu();
      });
      header.appendChild(button);
    }
    return button;
  }
  function markRelocated(node){
    if (!isElement(node)) return;
    node.setAttribute(HIDE_ATTR, '1');
    if (node.parentElement) node.parentElement.setAttribute(ROW_ATTR, '1');
  }
  function syncRelocatedNodes(){
    Array.prototype.slice.call(document.querySelectorAll('[data-wave87r-action="show-profile"], [data-wave87r-action="generate-report"], [data-wave87r-action="show-backup"], [data-wave87r-action="share-report"]')).forEach(markRelocated);
    Array.prototype.slice.call(document.querySelectorAll('#wave86n-export-row, #wave86w-main-cloud-btn')).forEach(markRelocated);
    Array.prototype.slice.call(document.querySelectorAll('#daily-meter button[onclick*="showRushRecords"]')).forEach(markRelocated);
  }
  function isRelocated(node){
    return !!(isElement(node) && typeof node.getAttribute === 'function' && node.getAttribute(HIDE_ATTR) === '1');
  }
  function syncEmptyRows(){
    Array.prototype.slice.call(document.querySelectorAll('[' + ROW_ATTR + '="1"]')).forEach(function(row){
      var visible = 0;
      Array.prototype.slice.call(row.children || []).forEach(function(child){
        if (!isElement(child) || isRelocated(child)) return;
        if (child.hidden) return;
        if (child.style && (child.style.display === 'none' || child.style.visibility === 'hidden')) return;
        visible += 1;
      });
      row.setAttribute(ROW_EMPTY_ATTR, visible ? '0' : '1');
    });
  }
  function syncOpenOverlay(){
    if (!state.open) return;
    var overlay = getById(OVERLAY_ID);
    if (!overlay) {
      state.open = false;
      addBodyClass(false);
      applyTriggerState(false);
      return;
    }
    var panel = getById(PANEL_ID);
    if (!panel || overlay.parentNode !== document.body) {
      closeMenu();
      openMenu();
    }
  }
  function sync(){
    ensureTrigger();
    syncRelocatedNodes();
    syncEmptyRows();
    syncOpenOverlay();
  }
  function bind(){
    ensureTrigger();
    syncRelocatedNodes();
    syncEmptyRows();
    if (document.addEventListener) {
      document.addEventListener('trainer:simplemodechange', scheduleSync);
    }
    if (typeof MutationObserver === 'function' && document.body) {
      observer = new MutationObserver(scheduleSync);
      try {
        observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class', 'hidden', 'aria-hidden'] });
      } catch (_err) {}
    }
    scheduleSync();
  }

  if (document.readyState === 'loading' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  root.__wave89fHamburgerMenu = {
    version: 'wave89f',
    triggerId: TRIGGER_ID,
    overlayId: OVERLAY_ID,
    open: openMenu,
    close: closeMenu,
    toggle: toggleMenu,
    sync: sync,
    menuSections: menuSections,
    visibleItemIds: visibleItemIds,
    runMenuAction: runMenuAction,
    activeScreenId: activeScreenId,
    maybeLeavePlay: maybeLeavePlay,
    isOpen: function(){ return !!state.open; },
    isSimpleMode: isSimpleMode
  };
})();

/* wave89g: minimal main footer / utility condensation */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89gMinimalFooter) return;

  var root = window;
  var FOOTER_ID = 'wave89g-main-footer';
  var FOOTER_HINT_ID = 'wave89g-main-footer-hint';
  var LEGACY_ATTR = 'data-wave89g-footer-legacy';
  var LEGACY_ACTIONS = ['go-info', 'show-journal', 'show-badges', 'show-class-select', 'go-prog', 'show-about', 'show-date-editor'];
  var syncTimer = 0;
  var observer = null;

  function isElement(node){
    return !!(node && typeof node === 'object' && node.nodeType === 1);
  }
  function getById(id){
    return document.getElementById ? document.getElementById(id) : null;
  }
  function mainScreen(){
    return getById('s-main');
  }
  function mainWrap(){
    var screen = mainScreen();
    return screen && screen.querySelector ? screen.querySelector('.w') : null;
  }
  function inFooter(node){
    for (var current = node; current; current = current.parentElement) {
      if (current.id === FOOTER_ID) return true;
    }
    return false;
  }
  function toast(message){
    try {
      if (typeof root.toast === 'function') root.toast(message);
      else if (typeof root.alert === 'function') root.alert(message);
    } catch (_err) {}
  }
  function runAction(action){
    if (action === 'go-prog') {
      if (typeof root.go === 'function') root.go('prog');
      else toast('Прогресс пока недоступен.');
      return true;
    }
    if (action === 'show-about') {
      if (typeof root.showAbout === 'function') root.showAbout();
      else toast('Настройки пока недоступны.');
      return true;
    }
    return false;
  }
  function footerButton(label, action, accent){
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn ' + (accent ? 'btn-p' : 'btn-o') + ' wave89g-main-footer-btn';
    button.setAttribute('data-wave87r-action', action);
    button.setAttribute('data-wave89g-action', action);
    button.textContent = label;
    button.addEventListener('click', function(event){
      if (event && event.preventDefault) event.preventDefault();
      runAction(action);
    });
    return button;
  }
  function buildFooter(){
    var host = document.createElement('section');
    host.id = FOOTER_ID;
    host.className = 'wave89g-main-footer';
    host.setAttribute('aria-label', 'Быстрые действия');

    var hint = document.createElement('p');
    hint.id = FOOTER_HINT_ID;
    hint.className = 'wave89g-main-footer-hint';
    hint.textContent = 'Остальное — в меню ☰';

    var grid = document.createElement('div');
    grid.className = 'wave89g-main-footer-grid';
    grid.appendChild(footerButton('📈 Прогресс', 'go-prog', true));
    grid.appendChild(footerButton('⚙️ Настройки', 'show-about', false));

    host.appendChild(hint);
    host.appendChild(grid);
    return host;
  }
  function ensureFooter(){
    var wrap = mainWrap();
    if (!wrap) return null;
    var footer = getById(FOOTER_ID);
    if (!footer) {
      footer = buildFooter();
      var anchor = getById('daily-meter');
      if (anchor && anchor.parentElement === wrap) {
        if (anchor.nextSibling) wrap.insertBefore(footer, anchor.nextSibling);
        else wrap.appendChild(footer);
      } else {
        wrap.appendChild(footer);
      }
    }
    return footer;
  }
  function collectLegacyButtons(){
    var screen = mainScreen();
    if (!screen || !screen.querySelectorAll) return [];
    var out = [];
    LEGACY_ACTIONS.forEach(function(action){
      Array.prototype.slice.call(screen.querySelectorAll('[data-wave87r-action="' + action + '"]')).forEach(function(node){
        out.push(node);
      });
    });
    return out;
  }
  function hideLegacyRows(){
    collectLegacyButtons().forEach(function(node){
      if (!isElement(node) || inFooter(node)) return;
      var row = node.parentElement;
      if (row && isElement(row) && !inFooter(row)) row.setAttribute(LEGACY_ATTR, '1');
    });
  }
  function sync(){
    ensureFooter();
    hideLegacyRows();
  }
  function scheduleSync(){
    if (syncTimer && typeof root.clearTimeout === 'function') root.clearTimeout(syncTimer);
    syncTimer = (typeof root.setTimeout === 'function' ? root.setTimeout : setTimeout)(function(){
      syncTimer = 0;
      sync();
    }, 40);
  }
  function bind(){
    sync();
    if (document.addEventListener) {
      document.addEventListener('trainer:simplemodechange', scheduleSync);
    }
    if (typeof MutationObserver === 'function' && document.body) {
      observer = new MutationObserver(scheduleSync);
      try {
        observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['class', 'hidden', 'aria-hidden'] });
      } catch (_err) {}
    }
    scheduleSync();
  }

  if (document.readyState === 'loading' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  root.__wave89gMinimalFooter = {
    version: 'wave89g',
    footerId: FOOTER_ID,
    legacyAttr: LEGACY_ATTR,
    sync: sync,
    legacyActions: LEGACY_ACTIONS.slice(),
    visibleButtons: function(){
      var footer = getById(FOOTER_ID);
      if (!footer || !footer.querySelectorAll) return [];
      return Array.prototype.slice.call(footer.querySelectorAll('[data-wave89g-action]')).map(function(node){
        return node.getAttribute('data-wave89g-action') || '';
      }).filter(Boolean);
    },
    hiddenLegacyRows: function(){
      return document.querySelectorAll ? document.querySelectorAll('[' + LEGACY_ATTR + '="1"]').length : 0;
    }
  };
})();


/* wave89h: skeleton loading / lazy chunks */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89hLazySkeleton) return;

  var root = window;
  var OVERLAY_ID = 'wave89h-lazy-overlay';
  var BODY_CLASS = 'wave89h-lazy-open';
  var pending = Object.create(null);
  var state = { open:false, timer:0 };

  function getById(id){
    return document.getElementById ? document.getElementById(id) : null;
  }
  function body(){
    return document.body || document.documentElement || null;
  }
  function setBodyState(active){
    var node = body();
    if (!node || !node.classList) return;
    if (active) node.classList.add(BODY_CLASS);
    else node.classList.remove(BODY_CLASS);
  }
  function hasPending(){
    return Object.keys(pending).length > 0;
  }
  function latestPending(){
    var ids = Object.keys(pending);
    return ids.length ? pending[ids[ids.length - 1]] : null;
  }
  function resolveCopy(detail){
    detail = detail || {};
    var title = detail.title || 'Подгружаю модуль…';
    var label = detail.label || 'Нужный блок подгружается отдельным чанком и откроется автоматически.';
    if (detail.scope === 'subject') {
      title = detail.title || 'Подгружаю предмет 10 класса…';
      label = detail.label || 'Банк предмета загружается отдельным чанком и откроется сразу после загрузки.';
    }
    if (detail.scope === 'runtime' && detail.kind === 'services') {
      title = detail.title || 'Подгружаю сервисы…';
      label = detail.label || 'Загружаю дополнительные экраны и сервисные модули.';
    }
    if (detail.scope === 'runtime' && detail.kind === 'features') {
      title = detail.title || 'Подгружаю возможности…';
      label = detail.label || 'Загружаю дополнительный интерфейс для выбранного действия.';
    }
    return { title:title, label:label };
  }
  function line(widthClass){
    var span = document.createElement('span');
    span.className = 'wave89h-skeleton-line ' + widthClass;
    span.setAttribute('aria-hidden', 'true');
    return span;
  }
  function ensureOverlay(){
    var overlay = getById(OVERLAY_ID);
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'wave89h-lazy-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    var card = document.createElement('div');
    card.className = 'wave89h-lazy-card';
    card.setAttribute('role', 'status');
    card.setAttribute('aria-live', 'polite');
    card.setAttribute('aria-atomic', 'true');

    var badge = document.createElement('div');
    badge.className = 'wave89h-lazy-badge';
    badge.textContent = 'Загрузка';

    var title = document.createElement('h3');
    title.className = 'wave89h-lazy-title';
    title.setAttribute('data-wave89h-title', '');

    var copy = document.createElement('p');
    copy.className = 'wave89h-lazy-copy';
    copy.setAttribute('data-wave89h-copy', '');

    var skeleton = document.createElement('div');
    skeleton.className = 'wave89h-skeleton';
    skeleton.appendChild(line('w92'));
    skeleton.appendChild(line('w76'));
    skeleton.appendChild(line('w58'));

    card.appendChild(badge);
    card.appendChild(title);
    card.appendChild(copy);
    card.appendChild(skeleton);
    overlay.appendChild(card);
    (body() || document.documentElement).appendChild(overlay);
    return overlay;
  }
  function syncCopy(){
    var overlay = ensureOverlay();
    var info = resolveCopy(latestPending());
    var title = overlay.querySelector ? overlay.querySelector('[data-wave89h-title]') : null;
    var copy = overlay.querySelector ? overlay.querySelector('[data-wave89h-copy]') : null;
    if (title) title.textContent = info.title;
    if (copy) copy.textContent = info.label;
  }
  function openOverlay(){
    if (state.open || !hasPending()) return false;
    state.open = true;
    var overlay = ensureOverlay();
    syncCopy();
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-visible');
    setBodyState(true);
    return true;
  }
  function closeOverlay(){
    if (state.timer && typeof root.clearTimeout === 'function') {
      root.clearTimeout(state.timer);
      state.timer = 0;
    }
    if (hasPending()) return false;
    state.open = false;
    var overlay = getById(OVERLAY_ID);
    if (overlay) {
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('is-visible');
    }
    setBodyState(false);
    return true;
  }
  function scheduleOpen(){
    if (state.open) {
      syncCopy();
      return;
    }
    if (state.timer) return;
    state.timer = (typeof root.setTimeout === 'function' ? root.setTimeout : setTimeout)(function(){
      state.timer = 0;
      if (hasPending()) openOverlay();
    }, 120);
  }
  function onStart(event){
    var detail = event && event.detail ? event.detail : {};
    var id = String(detail.id || ('wave89h-fallback-' + Date.now()));
    pending[id] = Object.assign({ id:id }, detail || {});
    syncCopy();
    scheduleOpen();
  }
  function onEnd(event){
    var detail = event && event.detail ? event.detail : {};
    var id = String(detail.id || '');
    if (id && pending[id]) delete pending[id];
    if (state.timer && !hasPending() && typeof root.clearTimeout === 'function') {
      root.clearTimeout(state.timer);
      state.timer = 0;
    }
    if (hasPending()) syncCopy();
    closeOverlay();
  }
  function bind(){
    if (root.addEventListener) {
      root.addEventListener('trainer:lazy-start', onStart);
      root.addEventListener('trainer:lazy-end', onEnd);
      root.addEventListener('pagehide', function(){
        pending = Object.create(null);
        closeOverlay();
      }, { once:true });
    }
  }

  if (document.readyState === 'loading' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  root.__wave89hLazySkeleton = {
    version: 'wave89h',
    overlayId: OVERLAY_ID,
    isOpen: function(){ return !!state.open; },
    pendingCount: function(){ return Object.keys(pending).length; },
    latest: function(){ return latestPending(); },
    syncCopy: syncCopy,
    close: function(){ pending = Object.create(null); return closeOverlay(); }
  };
})();

/* wave89k: weak-device adaptive UI / readability + tap targets */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89kAdaptiveUi) return;

  var root = window;
  var applyTimer = 0;
  var mediaBindings = [];
  var state = {
    enabled:false,
    coarse:false,
    compact:false,
    lowMemory:false,
    lowCpu:false,
    saveData:false,
    reducedMotion:false,
    viewportWidth:0,
    viewportHeight:0
  };
  var CLASSES = {
    enabled:'wave89k-weak-ui',
    coarse:'wave89k-coarse',
    compact:'wave89k-compact',
    reduced:'wave89k-reduced-motion'
  };

  function numberOf(value){
    var num = Number(value);
    return num > 0 ? num : 0;
  }
  function docEl(){
    return document.documentElement || null;
  }
  function body(){
    return document.body || null;
  }
  function navigatorInfo(){
    return root.navigator || {};
  }
  function viewport(){
    var html = docEl();
    var bodyNode = body();
    return {
      width: Math.max(numberOf(root.innerWidth), numberOf(html && html.clientWidth), numberOf(bodyNode && bodyNode.clientWidth)),
      height: Math.max(numberOf(root.innerHeight), numberOf(html && html.clientHeight), numberOf(bodyNode && bodyNode.clientHeight))
    };
  }
  function mediaMatches(query){
    try {
      return !!(root.matchMedia && root.matchMedia(query).matches);
    } catch (_err) {
      return false;
    }
  }
  function setClass(node, name, enabled){
    if (!node || !node.classList || !name) return;
    if (enabled) node.classList.add(name);
    else node.classList.remove(name);
  }
  function cloneState(source){
    return {
      enabled: !!(source && source.enabled),
      coarse: !!(source && source.coarse),
      compact: !!(source && source.compact),
      lowMemory: !!(source && source.lowMemory),
      lowCpu: !!(source && source.lowCpu),
      saveData: !!(source && source.saveData),
      reducedMotion: !!(source && source.reducedMotion),
      viewportWidth: numberOf(source && source.viewportWidth),
      viewportHeight: numberOf(source && source.viewportHeight)
    };
  }
  function sameState(a, b){
    return !!(a && b &&
      a.enabled === b.enabled &&
      a.coarse === b.coarse &&
      a.compact === b.compact &&
      a.lowMemory === b.lowMemory &&
      a.lowCpu === b.lowCpu &&
      a.saveData === b.saveData &&
      a.reducedMotion === b.reducedMotion &&
      a.viewportWidth === b.viewportWidth &&
      a.viewportHeight === b.viewportHeight);
  }
  function applyClasses(next){
    [docEl(), body()].forEach(function(node){
      setClass(node, CLASSES.enabled, next.enabled);
      setClass(node, CLASSES.coarse, next.coarse);
      setClass(node, CLASSES.compact, next.compact);
      setClass(node, CLASSES.reduced, next.reducedMotion);
    });
  }
  function evaluate(){
    var nav = navigatorInfo();
    var size = viewport();
    var coarse = mediaMatches('(pointer: coarse)') || mediaMatches('(any-pointer: coarse)') || numberOf(nav.maxTouchPoints) > 0 || ('ontouchstart' in root);
    var compact = !!((size.width && size.width <= 560) || (size.height && size.height <= 720));
    var lowMemory = !!(numberOf(nav.deviceMemory) && numberOf(nav.deviceMemory) <= 4);
    var lowCpu = !!(numberOf(nav.hardwareConcurrency) && numberOf(nav.hardwareConcurrency) <= 4);
    var saveData = !!(nav.connection && nav.connection.saveData);
    var reducedMotion = mediaMatches('(prefers-reduced-motion: reduce)');
    return {
      enabled: !!(coarse || compact || lowMemory || lowCpu || saveData || reducedMotion),
      coarse: coarse,
      compact: compact,
      lowMemory: lowMemory,
      lowCpu: lowCpu,
      saveData: saveData,
      reducedMotion: reducedMotion,
      viewportWidth: size.width,
      viewportHeight: size.height
    };
  }
  function emit(next){
    try {
      document.dispatchEvent(new CustomEvent('trainer:adaptivechange', { detail: cloneState(next) }));
    } catch (_err) {}
  }
  function apply(){
    var next = cloneState(evaluate());
    applyClasses(next);
    if (!sameState(state, next)) emit(next);
    state = next;
    return cloneState(state);
  }
  function scheduleApply(){
    if (applyTimer && typeof root.clearTimeout === 'function') root.clearTimeout(applyTimer);
    applyTimer = (typeof root.setTimeout === 'function' ? root.setTimeout : setTimeout)(function(){
      applyTimer = 0;
      apply();
    }, 40);
  }
  function bindMedia(query){
    try {
      if (!root.matchMedia) return;
      var media = root.matchMedia(query);
      if (!media || mediaBindings.indexOf(media) !== -1) return;
      mediaBindings.push(media);
      if (typeof media.addEventListener === 'function') media.addEventListener('change', scheduleApply);
      else if (typeof media.addListener === 'function') media.addListener(scheduleApply);
    } catch (_err) {}
  }
  function bindConnection(){
    try {
      var connection = navigatorInfo().connection;
      if (!connection) return;
      if (typeof connection.addEventListener === 'function') connection.addEventListener('change', scheduleApply);
      else if (typeof connection.addListener === 'function') connection.addListener(scheduleApply);
    } catch (_err) {}
  }
  function bind(){
    apply();
    if (root.addEventListener) {
      root.addEventListener('resize', scheduleApply, { passive:true });
      root.addEventListener('orientationchange', scheduleApply, { passive:true });
      root.addEventListener('pageshow', scheduleApply);
    }
    if (document.addEventListener) {
      document.addEventListener('trainer:simplemodechange', scheduleApply);
    }
    bindConnection();
    bindMedia('(pointer: coarse)');
    bindMedia('(any-pointer: coarse)');
    bindMedia('(prefers-reduced-motion: reduce)');
  }

  if (document.readyState === 'loading' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }

  root.__wave89kAdaptiveUi = {
    version: 'wave89k',
    classes: CLASSES,
    evaluate: evaluate,
    apply: apply,
    current: function(){ return cloneState(state); },
    isEnabled: function(){ return !!state.enabled; },
    scheduleApply: scheduleApply
  };
})();



/* wave89m: adaptive difficulty */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89mAdaptiveDifficulty) return;

  var root = window;
  var SESSION_STREAK_TRIGGER = 5;
  var SESSION_TROUBLE_TRIGGER = 2;
  var SESSION_SLOW_TRIGGER = 3;
  var SESSION_SHIFT_MIN = -1;
  var SESSION_SHIFT_MAX = 1;
  var STORAGE_PREFIX = 'trainer_adaptive_difficulty_';
  var PROGRESS_ATTR = 'data-wave89m-progress-card';
  var PLAY_ATTR = 'data-wave89m-play-card';
  var CANDIDATE_COUNT = 14;
  var LEVELS = ['easy', 'medium', 'hard'];
  var RU_LABELS = {
    easy: 'лёгкий',
    medium: 'средний',
    hard: 'сложный'
  };
  var state = {
    active: false,
    shift: 0,
    correctRun: 0,
    troubleRun: 0,
    slowRun: 0,
    answers: 0,
    lastReason: '',
    lastChange: 0,
    lastTarget: 'easy',
    lastBucket: 'easy',
    sessionMode: ''
  };
  var timingCache = { key:'', rows:[] };

  function gradeKey(){ return String(root.GRADE_NUM || root.GRADE_NO || ''); }
  function storageKey(){ return STORAGE_PREFIX + gradeKey(); }
  function asText(value){ return String(value == null ? '' : value); }
  function num(value){ var out = Number(value); return isFinite(out) ? out : 0; }
  function int(value){ return Math.max(0, Math.floor(num(value))); }
  function clamp(value, min, max){ return Math.min(max, Math.max(min, num(value))); }
  function clone(value){
    try { return JSON.parse(JSON.stringify(value)); }
    catch (_err) { return value; }
  }
  function safeJSON(raw, fallback){
    try { return raw ? JSON.parse(raw) : fallback; }
    catch (_err) { return fallback; }
  }
  function normalizeText(value){
    return asText(value).toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
  }
  function safeReadStore(){
    try {
      var raw = root.localStorage && root.localStorage.getItem(storageKey());
      var data = safeJSON(raw, { version:'wave89m', grade:gradeKey(), topics:{} });
      if (!data || typeof data !== 'object') data = { version:'wave89m', grade:gradeKey(), topics:{} };
      if (!data.topics || typeof data.topics !== 'object') data.topics = {};
      return data;
    } catch (_err) {
      return { version:'wave89m', grade:gradeKey(), topics:{} };
    }
  }
  function safeWriteStore(data){
    try {
      if (!root.localStorage) return false;
      var topics = data && data.topics && typeof data.topics === 'object' ? data.topics : {};
      root.localStorage.setItem(storageKey(), JSON.stringify({
        version: 'wave89m',
        grade: gradeKey(),
        updatedAt: Date.now(),
        topics: topics
      }));
      return true;
    } catch (_err) {
      return false;
    }
  }
  function bucketName(value){
    var raw = normalizeText(value);
    if (raw === 'hard' || raw === '3' || raw === 'сложный') return 'hard';
    if (raw === 'medium' || raw === '2' || raw === 'средний') return 'medium';
    if (raw === 'easy' || raw === '1' || raw === 'легкий' || raw === 'лёгкий') return 'easy';
    return 'medium';
  }
  function bucketLevel(bucket){ return LEVELS.indexOf(bucketName(bucket)); }
  function levelBucket(level){ return LEVELS[Math.max(0, Math.min(2, Math.round(num(level))))] || 'medium'; }
  function levelNumber(value){
    if (typeof value === 'number') {
      var direct = Math.round(num(value));
      if (direct >= 1 && direct <= 3) return direct;
      if (direct < 0) direct = 0;
      if (direct > 2) direct = 2;
      return direct + 1;
    }
    var level = bucketLevel(value);
    if (level < 0) level = 1;
    if (level > 2) level = 2;
    return level + 1;
  }
  function levelLabel(value){
    var bucket;
    if (typeof value === 'number') {
      var direct = Math.round(num(value));
      bucket = direct >= 1 && direct <= 3 ? levelBucket(direct - 1) : levelBucket(direct);
    } else {
      bucket = bucketName(value);
    }
    return RU_LABELS[bucket] || RU_LABELS.medium;
  }
  function inferDifficulty(question){
    if (!question || typeof question !== 'object') return 'medium';
    var questionText = asText(question.question || question.q);
    var answerText = asText(question.answer || question.a);
    var tag = asText(question.tag || question.topic || question.topicName);
    var grade = num(question.grade || question.g || root.GRADE_NUM || root.GRADE_NO || 0);
    var score = 0;
    var numbers = questionText.match(/-?\d+(?:[\.,]\d+)?/g) || [];
    if (questionText.length >= 90) score += 1;
    if (numbers.length >= 3) score += 1;
    if (/√|\^|≤|≥|\/|дроб|процент|скорост|уравнен|функц|координат|вектор|производн|интеграл|логарифм|тригоном|электростат|электромаг|биохим|органик|polit|sozio|socio|право|эконом|grammar|article|modal|conditional/i.test(questionText + ' ' + tag)) score += 1;
    if (/почему|объясни|сделай вывод|наиболее вероятно|какой вывод|сравни|определи по описанию|выбери утверждение|justify|explain/i.test(questionText)) score += 1;
    if (grade >= 9) score += 1;
    if (grade >= 11) score += 1;
    if (answerText.length >= 24) score += 1;
    return score <= 1 ? 'easy' : (score <= 3 ? 'medium' : 'hard');
  }
  function difficultyOf(question){
    if (!question || typeof question !== 'object') return 'medium';
    if (question.diffBucket || question.difficulty) return bucketName(question.diffBucket || question.difficulty);
    var explicitLevel = int(question.difficultyLevel || question.level || 0);
    if (explicitLevel >= 1 && explicitLevel <= 3) return levelBucket(explicitLevel - 1);
    var score = num(question.diffScore);
    if (score >= 4) return 'hard';
    if (score >= 2) return 'medium';
    return inferDifficulty(question);
  }
  function getCurrentQuestion(){
    try { if (typeof prob !== 'undefined' && prob && typeof prob === 'object') return prob; } catch (_err) {}
    return root.prob && typeof root.prob === 'object' ? root.prob : null;
  }
  function setCurrentQuestion(question){
    try { prob = question; } catch (_err) {}
    root.prob = question;
  }
  function getSelection(){
    try { if (typeof sel !== 'undefined') return sel; } catch (_err) {}
    return root.sel;
  }
  function setSelection(value){
    try { sel = value; } catch (_err) {}
    root.sel = value;
  }
  function setHintState(value){
    try { hintOn = !!value; } catch (_err) {}
    root.hintOn = !!value;
  }
  function setTheoryState(value){
    try { shpOn = !!value; } catch (_err) {}
    root.shpOn = !!value;
  }
  function setHelpState(value){
    try { usedHelp = !!value; } catch (_err) {}
    root.usedHelp = !!value;
  }
  function getUsedHelp(){
    try { if (typeof usedHelp !== 'undefined') return !!usedHelp; } catch (_err) {}
    return !!root.usedHelp;
  }
  function getCurrentSubject(){
    try { if (typeof cS !== 'undefined') return cS; } catch (_err) {}
    return root.cS || null;
  }
  function setCurrentSubject(subject){
    try { cS = subject; } catch (_err) {}
    root.cS = subject || null;
  }
  function getCurrentTopic(){
    try { if (typeof cT !== 'undefined') return cT; } catch (_err) {}
    return root.cT || null;
  }
  function setCurrentTopic(topic){
    try { cT = topic; } catch (_err) {}
    root.cT = topic || null;
  }
  function getCurrentTheory(){
    try { if (typeof curTheory !== 'undefined') return curTheory; } catch (_err) {}
    return root.curTheory || null;
  }
  function setCurrentTheory(theory){
    try { curTheory = theory; } catch (_err) {}
    root.curTheory = theory || null;
  }
  function getSeenMap(){
    try { if (typeof seenQs !== 'undefined' && seenQs && typeof seenQs === 'object') return seenQs; } catch (_err) {}
    return root.seenQs && typeof root.seenQs === 'object' ? root.seenQs : null;
  }
  function getStats(){
    try { if (typeof st !== 'undefined' && st && typeof st === 'object') return st; } catch (_err) {}
    return root.st && typeof root.st === 'object' ? root.st : null;
  }
  function getMixStreak(){
    try { if (typeof mixStreak !== 'undefined') return mixStreak; } catch (_err) {}
    return root.mixStreak || null;
  }
  function setMixStreak(next){
    try { mixStreak = next; } catch (_err) {}
    root.mixStreak = next;
  }
  function isRushMode(){
    try { if (typeof rushMode !== 'undefined') return !!rushMode; } catch (_err) {}
    return !!root.rushMode;
  }
  function isDiagMode(){
    try { if (typeof diagMode !== 'undefined') return !!diagMode; } catch (_err) {}
    return !!root.diagMode;
  }
  function isGlobalMixMode(){
    try { if (typeof globalMix !== 'undefined') return !!globalMix; } catch (_err) {}
    return !!root.globalMix;
  }
  function isMixMode(){
    try { if (typeof mix !== 'undefined') return !!mix; } catch (_err) {}
    return !!root.mix;
  }
  function timingRuntime(){
    return root.__wave87xInputTimingRuntime && typeof root.__wave87xInputTimingRuntime.readStore === 'function'
      ? root.__wave87xInputTimingRuntime
      : null;
  }
  function timingRows(){
    var rt = timingRuntime();
    if (!rt) return [];
    if (timingCache.key === gradeKey() && timingCache.rows.length) return timingCache.rows.slice();
    var data = rt.readStore();
    var rows = Array.isArray(data && data.samples) ? data.samples.filter(function(item){
      return item && item.mode === 'train';
    }) : [];
    timingCache.key = gradeKey();
    timingCache.rows = rows.slice();
    return rows.slice();
  }
  function invalidateTimingCache(){ timingCache.key = ''; timingCache.rows = []; }
  function emptyBucketStats(){ return { asked:0, correct:0, totalMs:0 }; }
  function contextKey(subjectId, topicId, topicName){
    var sid = asText(subjectId || 'global') || 'global';
    var tid = asText(topicId || ('tag:' + normalizeText(topicName || 'misc')));
    return sid + '::' + tid;
  }
  function normalizeProfile(profile, context){
    var ctx = context || {};
    var out = profile && typeof profile === 'object' ? clone(profile) : {};
    out.subjectId = asText(out.subjectId || ctx.subjectId);
    out.topicId = asText(out.topicId || ctx.topicId);
    out.subjectName = asText(out.subjectName || ctx.subjectName);
    out.topicName = asText(out.topicName || ctx.topicName);
    out.key = asText(out.key || ctx.key || contextKey(out.subjectId, out.topicId, out.topicName));
    out.asked = int(out.asked);
    out.correct = int(out.correct);
    out.wrong = int(out.wrong);
    out.helped = int(out.helped);
    out.totalMs = int(out.totalMs);
    out.lastMs = int(out.lastMs);
    out.lastTarget = bucketName(out.lastTarget || 'easy');
    out.lastBucket = bucketName(out.lastBucket || 'easy');
    out.level = clamp(out.level, 0, 2);
    out.updatedAt = int(out.updatedAt);
    out.recent = Array.isArray(out.recent) ? out.recent.map(function(item){ return item ? 1 : 0; }).slice(-12) : [];
    out.buckets = out.buckets && typeof out.buckets === 'object' ? out.buckets : {};
    LEVELS.forEach(function(bucket){
      var row = out.buckets[bucket] && typeof out.buckets[bucket] === 'object' ? out.buckets[bucket] : {};
      out.buckets[bucket] = {
        asked: int(row.asked),
        correct: int(row.correct),
        totalMs: int(row.totalMs)
      };
    });
    return out;
  }
  function safeFindTopicMeta(subjectId, topicTag){
    var normalizedTag = normalizeText(topicTag);
    var wantedSubject = normalizeText(subjectId);
    if (!normalizedTag) return null;
    if (typeof findTopicMeta === 'function') {
      try {
        var direct = findTopicMeta(subjectId, topicTag);
        if (direct && direct.topic) return direct;
      } catch (_err) {}
      try {
        var loose = findTopicMeta(topicTag);
        if (loose && loose.topic) {
          if (!wantedSubject || normalizeText(loose.subj && loose.subj.id) === wantedSubject) return loose;
        }
      } catch (_err2) {}
    }
    var allSubjects = Array.isArray(root.SUBJ) ? root.SUBJ : [];
    var fallback = null;
    for (var s = 0; s < allSubjects.length; s++) {
      var subject = allSubjects[s];
      if (!subject || !Array.isArray(subject.tops)) continue;
      if (wantedSubject && normalizeText(subject.id) !== wantedSubject) continue;
      for (var t = 0; t < subject.tops.length; t++) {
        var topic = subject.tops[t];
        if (!topic) continue;
        var name = normalizeText(topic.nm || topic.name || topic.id);
        var id = normalizeText(topic.id);
        if (name === normalizedTag || id === normalizedTag) return { subj:subject, topic:topic };
        if (!fallback && (name.indexOf(normalizedTag) >= 0 || normalizedTag.indexOf(name) >= 0 || id === normalizedTag)) {
          fallback = { subj:subject, topic:topic };
        }
      }
    }
    return fallback;
  }
  function inferContext(question, subjectRef, topicRef){
    var subject = subjectRef || getCurrentSubject();
    var topic = topicRef || getCurrentTopic();
    var tag = asText(question && (question.tag || question.topic || question.topicName));
    if ((!topic || !topic.id) && tag) {
      var meta = safeFindTopicMeta(subject && subject.id, tag);
      if (meta && meta.topic) {
        if (!subject) subject = meta.subj || subject;
        topic = meta.topic;
      }
    }
    if (!subject && topic && Array.isArray(root.SUBJ)) {
      root.SUBJ.some(function(candidate){
        if (!candidate || !Array.isArray(candidate.tops)) return false;
        var found = candidate.tops.some(function(row){ return row === topic; });
        if (found) subject = candidate;
        return found;
      });
    }
    var subjectId = asText(subject && subject.id);
    var topicId = asText(topic && topic.id);
    var topicName = asText(topic && topic.nm) || tag || 'Тема';
    return {
      subjectId: subjectId,
      subjectName: asText(subject && subject.nm),
      topicId: topicId || ('tag:' + normalizeText(topicName)),
      topicName: topicName,
      key: contextKey(subjectId, topicId, topicName)
    };
  }
  function readProfile(context){
    var ctx = context || {};
    var store = safeReadStore();
    return normalizeProfile(store.topics[ctx.key], ctx);
  }
  function writeProfile(profile, context){
    var ctx = context || profile || {};
    var store = safeReadStore();
    var next = normalizeProfile(profile, ctx);
    store.topics[next.key] = next;
    safeWriteStore(store);
    return next;
  }
  function recentAccuracy(profile, size){
    var rows = Array.isArray(profile && profile.recent) ? profile.recent.slice(-Math.max(1, int(size) || 6)) : [];
    if (!rows.length) return profile && profile.asked ? profile.correct / Math.max(1, profile.asked) : 0;
    var ok = rows.filter(Boolean).length;
    return ok / rows.length;
  }
  function averageMs(profile){
    return profile && profile.asked ? profile.totalMs / Math.max(1, profile.asked) : 0;
  }
  function timingSummary(context){
    var ctx = context || {};
    var rows = timingRows();
    var subjectId = normalizeText(ctx.subjectId);
    var topicName = normalizeText(ctx.topicName);
    var filtered = rows.filter(function(item){
      if (!item) return false;
      if (subjectId && normalizeText(item.subject) !== subjectId) return false;
      if (topicName && normalizeText(item.tag) !== topicName) return false;
      return true;
    }).slice(-12);
    var totalMs = 0;
    var ok = 0;
    filtered.forEach(function(item){ totalMs += num(item.ms); if (item.correct) ok += 1; });
    return {
      count: filtered.length,
      avgMs: filtered.length ? totalMs / filtered.length : 0,
      correctPct: filtered.length ? Math.round(ok / filtered.length * 100) : 0
    };
  }
  function recommendBaseLevel(profile, context){
    var p = normalizeProfile(profile, context);
    var timing = timingSummary(context || p);
    if (!p.asked) {
      if (timing.count >= 10 && timing.correctPct >= 84 && (!timing.avgMs || timing.avgMs <= 17000)) return 1;
      if (timing.count >= 6 && timing.correctPct >= 74 && (!timing.avgMs || timing.avgMs <= 22000)) return 1;
      return 0;
    }
    var recent6 = recentAccuracy(p, 6);
    var recent8 = recentAccuracy(p, 8);
    var avgMsValue = timing.count ? timing.avgMs : averageMs(p);
    var mediumAcc = p.buckets.medium.asked ? p.buckets.medium.correct / Math.max(1, p.buckets.medium.asked) : recent6;
    var hardAcc = p.buckets.hard.asked ? p.buckets.hard.correct / Math.max(1, p.buckets.hard.asked) : recent8;
    var level = 0;
    if (p.asked >= 7 && recent6 >= 0.72 && (!avgMsValue || avgMsValue <= 22000)) level = 1;
    if (timing.count >= 8 && timing.correctPct >= 82 && (!timing.avgMs || timing.avgMs <= 18000)) level = Math.max(level, 1);
    if (p.asked >= 18 && recent8 >= 0.82 && mediumAcc >= 0.72 && (!avgMsValue || avgMsValue <= 17000)) level = 2;
    if (p.buckets.hard.asked >= 5 && hardAcc < 0.55) level = Math.min(level, 1);
    if (p.asked >= 4 && recent6 <= 0.45) level = 0;
    if (timing.count >= 8 && timing.correctPct <= 55 && timing.avgMs >= 26000) level = 0;
    if (avgMsValue >= 30000 && recent6 < 0.65) level = Math.max(0, level - 1);
    return clamp(level, 0, 2);
  }
  function effectiveTargetLevel(profile, context){
    var baseLevel = recommendBaseLevel(profile, context);
    return clamp(baseLevel + state.shift, 0, 2);
  }
  function effectiveTargetBucket(profile, context){ return levelBucket(effectiveTargetLevel(profile, context)); }
  function questionSeenCount(question){
    var seen = getSeenMap();
    if (!seen) return 0;
    var key = asText(question && question.question) + asText(question && question.answer);
    return int(seen[key]);
  }
  function slowThreshold(bucket){
    if (bucket === 'hard') return 30000;
    if (bucket === 'medium') return 22000;
    return 16000;
  }
  function applyOutcome(profile, context, outcome){
    var previous = normalizeProfile(profile, context);
    var previousTarget = effectiveTargetLevel(previous, context);
    var p = normalizeProfile(profile, context);
    var bucket = bucketName(outcome && outcome.bucket);
    var correct = !!(outcome && outcome.correct);
    var helped = !!(outcome && outcome.usedHelp);
    var ms = Math.max(0, int(outcome && outcome.ms));
    var slow = !!(ms && ms > slowThreshold(bucket));

    p.asked += 1;
    p.correct += correct ? 1 : 0;
    p.wrong += correct ? 0 : 1;
    p.helped += helped ? 1 : 0;
    p.totalMs += ms;
    p.lastMs = ms;
    p.lastTarget = bucketName(outcome && outcome.target);
    p.lastBucket = bucket;
    p.updatedAt = Date.now();
    p.recent.push(correct ? 1 : 0);
    if (p.recent.length > 12) p.recent = p.recent.slice(-12);
    p.buckets[bucket].asked += 1;
    p.buckets[bucket].correct += correct ? 1 : 0;
    p.buckets[bucket].totalMs += ms;

    state.answers += 1;
    if (correct && !helped) {
      state.correctRun += 1;
      state.troubleRun = 0;
    } else {
      state.correctRun = 0;
      state.troubleRun += 1;
    }
    state.slowRun = slow ? state.slowRun + 1 : 0;
    state.lastChange = 0;
    state.lastReason = '';

    var nextBaseLevel = recommendBaseLevel(p, context);
    if (state.correctRun >= SESSION_STREAK_TRIGGER && previousTarget < 2) {
      state.shift = clamp((previousTarget + 1) - nextBaseLevel, SESSION_SHIFT_MIN, SESSION_SHIFT_MAX);
      state.correctRun = 0;
      state.troubleRun = 0;
      state.slowRun = 0;
      state.lastChange = 1;
      state.lastReason = '5 верных подряд — повышаем сложность на один шаг';
    } else if ((state.troubleRun >= SESSION_TROUBLE_TRIGGER || helped) && previousTarget > 0) {
      state.shift = clamp((previousTarget - 1) - nextBaseLevel, SESSION_SHIFT_MIN, SESSION_SHIFT_MAX);
      state.troubleRun = 0;
      state.slowRun = 0;
      state.lastChange = -1;
      state.lastReason = 'серия ошибок или помощь — временно упрощаем на один шаг';
    } else if (state.slowRun >= SESSION_SLOW_TRIGGER && previousTarget > 0) {
      state.shift = clamp((previousTarget - 1) - nextBaseLevel, SESSION_SHIFT_MIN, SESSION_SHIFT_MAX);
      state.slowRun = 0;
      state.lastChange = -1;
      state.lastReason = 'ответы идут слишком медленно — снижаем нагрузку на один шаг';
    }

    p.level = nextBaseLevel;
    state.lastTarget = levelBucket(clamp(nextBaseLevel + state.shift, 0, 2));
    state.lastBucket = bucket;
    return normalizeProfile(p, context);
  }
  function levelCountSummary(){
    var store = safeReadStore();
    var counts = { easy:0, medium:0, hard:0 };
    Object.keys(store.topics || {}).forEach(function(key){
      var profile = normalizeProfile(store.topics[key], store.topics[key]);
      profile.level = recommendBaseLevel(profile, profile);
      counts[levelBucket(profile.level)] += 1;
    });
    return counts;
  }
  function buildSummary(){
    var store = safeReadStore();
    var profiles = Object.keys(store.topics || {}).map(function(key){
      var profile = normalizeProfile(store.topics[key], store.topics[key]);
      profile.level = recommendBaseLevel(profile, profile);
      return profile;
    }).filter(function(profile){ return profile.asked > 0; });
    profiles.sort(function(a, b){ return int(b.updatedAt) - int(a.updatedAt); });
    return {
      totalTopics: profiles.length,
      counts: levelCountSummary(),
      latest: profiles.slice(0, 5)
    };
  }
  function randomItem(list){
    var rows = Array.isArray(list) ? list : [];
    return rows.length ? rows[Math.floor(Math.random() * rows.length)] : null;
  }
  function finalizeQuestion(raw){
    var question = raw;
    try {
      if (typeof prepareQuestion === 'function') question = prepareQuestion(raw);
      else if (typeof root.prepareQuestion === 'function') question = root.prepareQuestion(raw);
    } catch (_err) {}
    if (question && typeof question === 'object') {
      var bucket = difficultyOf(question);
      question.difficulty = bucket;
      question.diffBucket = bucket;
      question.difficultyLevel = levelNumber(bucket);
      question.difficultyLabel = bucket;
    }
    return question;
  }
  function candidateScore(candidate, seenMap, forcedTargetLevel){
    var context = candidate && candidate.context ? candidate.context : inferContext(candidate && candidate.raw, candidate && candidate.subject, candidate && candidate.topic);
    var profile = readProfile(context);
    var targetLevel = forcedTargetLevel == null ? effectiveTargetLevel(profile, context) : clamp(forcedTargetLevel, 0, 2);
    var bucket = difficultyOf(candidate && candidate.raw);
    var questionLevel = bucketLevel(bucket);
    var key = asText(candidate && candidate.raw && candidate.raw.question) + asText(candidate && candidate.raw && candidate.raw.answer);
    var seenCount = seenMap && typeof seenMap === 'object' ? int(seenMap[key]) : questionSeenCount(candidate && candidate.raw);
    var score = 12 - Math.abs(questionLevel - targetLevel) * 5;
    if (seenCount === 0) score += 3;
    else if (seenCount === 1) score += 1;
    else score -= Math.min(6, seenCount * 2);
    if (profile.asked < 4 && questionLevel === 0) score += 1;
    if (profile.asked >= 12 && targetLevel === 2 && questionLevel === 2) score += 1;
    if (profile.asked >= 8 && targetLevel === 1 && questionLevel === 1) score += 1;
    return {
      score: score,
      seenCount: seenCount,
      targetLevel: targetLevel,
      targetBucket: levelBucket(targetLevel),
      bucket: bucket,
      context: context,
      profile: profile
    };
  }
  function selectCandidateFromPool(pool, seenMap, forcedTargetLevel){
    var list = Array.isArray(pool) ? pool.filter(function(item){ return item && item.raw; }) : [];
    if (!list.length) return null;
    var best = null;
    list.forEach(function(candidate, index){
      var scored = candidateScore(candidate, seenMap, forcedTargetLevel);
      var scoredCandidate = Object.assign({ index:index }, candidate, scored);
      if (!best || scoredCandidate.score > best.score || (scoredCandidate.score === best.score && scoredCandidate.seenCount < best.seenCount)) {
        best = scoredCandidate;
      }
    });
    return best;
  }
  function snapshotGlobalMix(){
    return {
      subject: getCurrentSubject(),
      topic: getCurrentTopic(),
      theory: getCurrentTheory(),
      mixStreak: clone(getMixStreak())
    };
  }
  function restoreGlobalMix(snapshot){
    if (!snapshot) return;
    setCurrentSubject(snapshot.subject || null);
    setCurrentTopic(snapshot.topic || null);
    setCurrentTheory(snapshot.theory || null);
    setMixStreak(snapshot.mixStreak || null);
  }
  function generateTopicCandidates(subject, topic, limit){
    var out = [];
    if (!topic || typeof topic.gen !== 'function') return out;
    for (var i = 0; i < limit; i++) {
      try {
        var raw = topic.gen();
        if (!raw || typeof raw !== 'object') continue;
        out.push({ raw:raw, subject:subject, topic:topic, context: inferContext(raw, subject, topic) });
      } catch (_err) {}
    }
    return out;
  }
  function generateMixedCandidates(subject, limit){
    var out = [];
    var topics = subject && Array.isArray(subject.tops) ? subject.tops.filter(function(topic){ return topic && typeof topic.gen === 'function'; }) : [];
    for (var i = 0; i < limit; i++) {
      var topic = randomItem(topics);
      if (!topic) break;
      try {
        var raw = topic.gen();
        if (!raw || typeof raw !== 'object') continue;
        out.push({ raw:raw, subject:subject, topic:topic, context: inferContext(raw, subject, topic) });
      } catch (_err) {}
    }
    return out;
  }
  function generateGlobalMixCandidates(limit){
    var out = [];
    if (typeof genGlobalMix !== 'function' && typeof root.genGlobalMix !== 'function') return out;
    var picker = typeof genGlobalMix === 'function' ? genGlobalMix : root.genGlobalMix;
    for (var i = 0; i < limit; i++) {
      var snapshot = snapshotGlobalMix();
      try {
        var raw = picker();
        var subject = getCurrentSubject();
        var topic = null;
        var tag = asText(raw && (raw.tag || raw.topic || raw.topicName));
        if (subject && tag) {
          topic = safeFindTopicMeta(subject.id, tag);
          topic = topic && topic.topic ? topic.topic : null;
        }
        var theoryAfter = getCurrentTheory();
        var mixStateAfter = clone(getMixStreak());
        restoreGlobalMix(snapshot);
        if (!raw || typeof raw !== 'object') continue;
        out.push({
          raw: raw,
          subject: subject,
          topic: topic,
          theoryAfter: theoryAfter,
          mixStateAfter: mixStateAfter,
          context: inferContext(raw, subject, topic)
        });
      } catch (_err) {
        restoreGlobalMix(snapshot);
      }
    }
    return out;
  }
  function gatherCandidates(limit){
    var count = Math.max(6, int(limit) || CANDIDATE_COUNT);
    if (isGlobalMixMode()) return generateGlobalMixCandidates(count);
    var subject = getCurrentSubject();
    if (isMixMode()) return generateMixedCandidates(subject, count);
    var topic = getCurrentTopic();
    if (topic && typeof topic.gen === 'function') return generateTopicCandidates(subject, topic, count);
    return [];
  }
  function shouldDelegateNextQ(){
    if (isRushMode() || isDiagMode()) return true;
    if (Array.isArray(root.__wave21QuestionQueue)) return true;
    if (root.__wave28CurrentReviewKey) return true;
    if (root.__wave21SessionMode === 'error-review') return true;
    if (root.wave28Debug && typeof root.wave28Debug.isReviewMode === 'function' && root.wave28Debug.isReviewMode()) return true;
    return false;
  }
  function noteText(){
    if (state.lastReason) return state.lastReason;
    if (state.lastChange > 0) return 'Серия идёт уверенно — поднимаем сложность на один шаг.';
    if (state.lastChange < 0) return 'Ошибки или медленные ответы — временно снижаем сложность на один шаг.';
    return 'Движок учитывает точность по теме и время ответа, включая накопленные тайминг-сэмплы: вопросы уже тегированы по уровням 1–3, после 5 уверенных верных подряд сложность растёт на один шаг, после серии ошибок или медленных ответов временно снижается.';
  }
  function onPlayScreen(){
    var screen = document.getElementById('s-play');
    return !!(screen && screen.classList && screen.classList.contains('on'));
  }
  function percentage(ok, total){
    return total ? Math.round(num(ok) / Math.max(1, num(total)) * 100) : 0;
  }
  function formatSeconds(ms){
    if (!ms) return '—';
    var sec = Math.max(0, num(ms)) / 1000;
    var digits = sec < 10 ? 1 : 0;
    return sec.toFixed(digits).replace('.', ',') + ' с';
  }
  function removePlayCard(){
    var existing = document.querySelector ? document.querySelector('[' + PLAY_ATTR + ']') : null;
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
  }
  function renderPlayCard(){
    if (!onPlayScreen() || shouldDelegateNextQ()) { removePlayCard(); return; }
    var question = getCurrentQuestion();
    if (!question) { removePlayCard(); return; }
    var context = inferContext(question);
    var profile = readProfile(context);
    var target = effectiveTargetBucket(profile, context);
    var bucket = difficultyOf(question);
    state.lastTarget = target;
    state.lastBucket = bucket;

    var qcard = document.getElementById('qc');
    var host = qcard && qcard.parentNode ? qcard.parentNode : document.getElementById('pa');
    if (!host) return;
    var card = host.querySelector ? host.querySelector('[' + PLAY_ATTR + ']') : null;
    if (!card) {
      card = document.createElement('div');
      card.className = 'wave89m-adaptive-card';
      card.setAttribute(PLAY_ATTR, '1');
      if (qcard && host.insertBefore) host.insertBefore(card, qcard);
      else host.appendChild(card);
    }
    card.innerHTML = '';

    var title = document.createElement('div');
    title.className = 'wave89m-adaptive-title';
    title.textContent = '🎚 Адаптивная сложность';
    card.appendChild(title);

    var chips = document.createElement('div');
    chips.className = 'wave89m-adaptive-chips';
    [
      'цель: ' + levelNumber(target) + '/3 · ' + levelLabel(target),
      'вопрос: ' + levelNumber(bucket) + '/3 · ' + levelLabel(bucket),
      'серия: ' + state.correctRun,
      'ответов: ' + profile.asked
    ].forEach(function(text){
      var chip = document.createElement('span');
      chip.className = 'wave89m-adaptive-chip';
      chip.textContent = text;
      chips.appendChild(chip);
    });
    if (state.lastChange > 0 || state.lastChange < 0) {
      var deltaChip = document.createElement('span');
      deltaChip.className = 'wave89m-adaptive-chip';
      deltaChip.textContent = state.lastChange > 0 ? '↑ усложняем' : '↓ упрощаем';
      chips.appendChild(deltaChip);
    }
    card.appendChild(chips);

    var note = document.createElement('div');
    note.className = 'wave89m-adaptive-note';
    note.textContent = noteText();
    card.appendChild(note);
  }
  function appendProgressCard(){
    var host = document.getElementById('prog-content');
    if (!host) return;
    var old = host.querySelector ? host.querySelector('[' + PROGRESS_ATTR + ']') : null;
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var summary = buildSummary();
    if (!summary.totalTopics) return;

    var card = document.createElement('div');
    card.className = 'rcard wave89m-adaptive-card';
    card.setAttribute(PROGRESS_ATTR, '1');

    var title = document.createElement('h3');
    title.className = 'wave89m-adaptive-title';
    title.textContent = '🎚 Адаптивная сложность';
    card.appendChild(title);

    var note = document.createElement('div');
    note.className = 'wave89m-adaptive-note';
    note.textContent = 'Движок подстраивает сложность по теме по точности и времени ответа. После 5 уверенных верных подряд целевой уровень повышается на один шаг; после серии ошибок, подсказок или медленных ответов временно снижается.';
    card.appendChild(note);

    var chips = document.createElement('div');
    chips.className = 'wave89m-adaptive-chips';
    [
      'уровень 1: ' + summary.counts.easy,
      'уровень 2: ' + summary.counts.medium,
      'уровень 3: ' + summary.counts.hard,
      'профилей: ' + summary.totalTopics
    ].forEach(function(text){
      var chip = document.createElement('span');
      chip.className = 'wave89m-adaptive-chip';
      chip.textContent = text;
      chips.appendChild(chip);
    });
    card.appendChild(chips);

    if (summary.latest && summary.latest.length) {
      var list = document.createElement('ol');
      list.className = 'wave89m-adaptive-list';
      summary.latest.forEach(function(profile){
        var li = document.createElement('li');
        var avg = averageMs(profile);
        li.textContent = (profile.subjectName || 'Предмет') + ' → ' + (profile.topicName || 'Тема')
          + ' — ур. ' + levelNumber(profile.level) + ' · ' + levelLabel(profile.level)
          + ' · ' + percentage(profile.correct, profile.asked) + '%'
          + (avg ? ' · ' + formatSeconds(avg) : '');
        list.appendChild(li);
      });
      card.appendChild(list);
    }

    var secondChild = host.children && host.children[1] ? host.children[1] : null;
    if (secondChild) host.insertBefore(card, secondChild);
    else host.appendChild(card);
  }
  function resetState(){
    state.active = !isRushMode() && !isDiagMode();
    state.shift = 0;
    state.correctRun = 0;
    state.troubleRun = 0;
    state.slowRun = 0;
    state.answers = 0;
    state.lastReason = '';
    state.lastChange = 0;
    state.lastTarget = 'easy';
    state.lastBucket = 'easy';
    state.sessionMode = isGlobalMixMode() ? 'global-mix' : (isMixMode() ? 'subject-mix' : (getCurrentTopic() ? 'topic' : 'idle'));
  }
  function setSeen(question){
    var seen = getSeenMap();
    if (!seen || !question) return;
    var key = asText(question.question) + asText(question.answer);
    seen[key] = int(seen[key]) + 1;
  }
  function applyCandidate(candidate){
    if (!candidate || !candidate.raw) return false;
    var question = finalizeQuestion(candidate.raw);
    if (!question) return false;

    if (isGlobalMixMode()) {
      if (candidate.subject) setCurrentSubject(candidate.subject);
      setCurrentTopic(null);
      if (candidate.topic) setCurrentTheory(candidate.topic.th || candidate.theoryAfter || null);
      else setCurrentTheory(candidate.theoryAfter || null);
      if (candidate.mixStateAfter) setMixStreak(candidate.mixStateAfter);
    } else if (isMixMode()) {
      if (candidate.subject) setCurrentSubject(candidate.subject);
      setCurrentTopic(null);
      if (candidate.topic && candidate.topic.th) setCurrentTheory(candidate.topic.th);
    } else {
      if (candidate.subject) setCurrentSubject(candidate.subject);
      if (candidate.topic) {
        setCurrentTopic(candidate.topic);
        if (candidate.topic.th) setCurrentTheory(candidate.topic.th);
      }
    }

    setCurrentQuestion(question);
    setSeen(question);
    setSelection(null);
    setHintState(false);
    setTheoryState(false);
    setHelpState(false);
    state.active = true;
    state.lastTarget = candidate.targetBucket || difficultyOf(question);
    state.lastBucket = difficultyOf(question);
    if (typeof render === 'function') render();
    try { root.scrollTo({ top:0, behavior:'smooth' }); } catch (_err) {}
    return true;
  }
  function recordOutcome(contextOrQuestion, outcome){
    var context = null;
    if (contextOrQuestion && contextOrQuestion.key) context = contextOrQuestion;
    else if (contextOrQuestion && contextOrQuestion.raw) context = contextOrQuestion.context || inferContext(contextOrQuestion.raw, contextOrQuestion.subject, contextOrQuestion.topic);
    else context = inferContext(contextOrQuestion || getCurrentQuestion());
    var profile = applyOutcome(readProfile(context), context, outcome || {});
    writeProfile(profile, context);
    invalidateTimingCache();
    return {
      profile: profile,
      state: clone(state),
      summary: buildSummary()
    };
  }

  var baseStartQuiz = typeof root.startQuiz === 'function' ? root.startQuiz : null;
  if (baseStartQuiz) {
    root.startQuiz = function(){
      resetState();
      return baseStartQuiz.apply(this, arguments);
    };
  }

  var baseNextQ = typeof root.nextQ === 'function' ? root.nextQ : null;
  if (baseNextQ) {
    root.nextQ = function(){
      if (shouldDelegateNextQ()) return baseNextQ.apply(this, arguments);
      var candidates = gatherCandidates(CANDIDATE_COUNT);
      var chosen = selectCandidateFromPool(candidates, getSeenMap(), null);
      if (!chosen || !applyCandidate(chosen)) return baseNextQ.apply(this, arguments);
      return true;
    };
  }

  var baseAns = typeof root.ans === 'function' ? root.ans : null;
  if (baseAns) {
    root.ans = function(){
      var question = getCurrentQuestion();
      var hadSelection = getSelection() != null;
      var result = baseAns.apply(this, arguments);
      try {
        if (!question || hadSelection || shouldDelegateNextQ()) return result;
        if (getSelection() == null) return result;
        var sample = question.__wave87xTiming && question.__wave87xTiming.last ? question.__wave87xTiming.last : null;
        recordOutcome(question, {
          correct: asText(getSelection()) === asText(question.answer),
          usedHelp: getUsedHelp(),
          ms: sample && sample.ms ? num(sample.ms) : 0,
          bucket: difficultyOf(question),
          target: state.lastTarget || difficultyOf(question)
        });
      } catch (_err) {}
      return result;
    };
  }

  var baseRender = typeof root.render === 'function' ? root.render : null;
  if (baseRender) {
    root.render = function(){
      var result = baseRender.apply(this, arguments);
      try { renderPlayCard(); } catch (_err) {}
      return result;
    };
  }

  var baseRenderProg = typeof root.renderProg === 'function' ? root.renderProg : null;
  if (baseRenderProg) {
    root.renderProg = function(){
      var result = baseRenderProg.apply(this, arguments);
      try { appendProgressCard(); } catch (_err) {}
      return result;
    };
  }

  var baseEndSession = typeof root.endSession === 'function' ? root.endSession : null;
  if (baseEndSession) {
    root.endSession = function(){
      state.active = false;
      return baseEndSession.apply(this, arguments);
    };
  }

  root.__wave89mAdaptiveDifficulty = {
    version: 'wave89m',
    storageKey: storageKey,
    readStore: safeReadStore,
    writeStore: safeWriteStore,
    readProfile: readProfile,
    writeProfile: writeProfile,
    inferContext: inferContext,
    difficultyOf: difficultyOf,
    bucketLevel: bucketLevel,
    levelBucket: levelBucket,
    levelNumber: levelNumber,
    levelLabel: levelLabel,
    timingSummary: timingSummary,
    invalidateTimingCache: invalidateTimingCache,
    recommendBaseLevel: recommendBaseLevel,
    effectiveTargetBucket: effectiveTargetBucket,
    selectCandidateFromPool: selectCandidateFromPool,
    candidateScore: candidateScore,
    applyOutcome: applyOutcome,
    recordOutcome: recordOutcome,
    buildSummary: buildSummary,
    resetSession: resetState,
    clear: function(){ try { if (root.localStorage) root.localStorage.removeItem(storageKey()); } catch (_err) {} resetState(); invalidateTimingCache(); },
    currentState: function(){ return clone(state); },
    noteText: noteText
  };
})();


/* wave89n: guided learning path */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89nLearningPath) return;

  var root = window;
  var STORAGE_PREFIX = 'trainer_learning_path_';
  var THEORY_ATTR = 'data-wave89n-theory-card';
  var PLAY_ATTR = 'data-wave89n-play-card';
  var PROGRESS_ATTR = 'data-wave89n-progress-card';
  var STAGE_ORDER = ['theory', 'example', 'easy', 'medium', 'hard'];
  var STAGE_LABELS = {
    theory: 'Теория',
    example: 'Пример',
    easy: 'Лёгкое',
    medium: 'Среднее',
    hard: 'Сложное'
  };
  var STAGE_ICONS = {
    theory: '📖',
    example: '🧪',
    easy: '🟢',
    medium: '🟠',
    hard: '🔴'
  };
  var state = {
    active: false,
    phase: 'idle',
    topicKey: '',
    subjectId: '',
    topicId: '',
    currentStage: '',
    stageResults: {},
    example: null,
    lastCompletedTopicKey: '',
    completionCounted: false,
    lastPlanStages: []
  };
  var cache = {};

  function asText(value){ return String(value == null ? '' : value); }
  function cleanText(value){ return asText(value).replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim(); }
  function norm(value){ return cleanText(value).toLowerCase().replace(/ё/g, 'е'); }
  function num(value){ var out = Number(value); return isFinite(out) ? out : 0; }
  function clone(value){ try { return JSON.parse(JSON.stringify(value)); } catch (_err) { return value; } }
  function esc(value){ return asText(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function safeJSON(raw, fallback){ try { return raw ? JSON.parse(raw) : fallback; } catch (_err) { return fallback; } }
  function uniqText(list){
    var seen = {};
    var out = [];
    (Array.isArray(list) ? list : []).forEach(function(item){
      var value = cleanText(item);
      if (!value) return;
      var key = norm(value);
      if (seen[key]) return;
      seen[key] = true;
      out.push(value);
    });
    return out;
  }
  function gradeKey(){ return String(root.GRADE_NUM || root.GRADE_NO || ''); }
  function storageKey(){ return STORAGE_PREFIX + gradeKey(); }
  function currentSubject(){ try { if (typeof cS !== 'undefined') return cS; } catch (_err) {} return root.cS || null; }
  function currentTopic(){ try { if (typeof cT !== 'undefined') return cT; } catch (_err) {} return root.cT || null; }
  function currentQuestion(){ try { if (typeof prob !== 'undefined') return prob; } catch (_err) {} return root.prob || null; }
  function currentSelection(){ try { if (typeof sel !== 'undefined') return sel; } catch (_err) {} return root.sel; }
  function usedHelpState(){ try { if (typeof usedHelp !== 'undefined') return !!usedHelp; } catch (_err) {} return !!root.usedHelp; }
  function activeScreen(screenId){
    var node = root.document && root.document.getElementById ? root.document.getElementById(screenId) : null;
    var cls = cleanText(node && node.className);
    return !!node && /(^|\s)on($|\s)/.test(cls);
  }
  function removeByAttr(attr){
    if (!root.document || !root.document.querySelectorAll) return;
    Array.prototype.slice.call(root.document.querySelectorAll('[' + attr + ']')).forEach(function(node){
      if (node && typeof node.remove === 'function') node.remove();
      else if (node && node.parentNode && typeof node.parentNode.removeChild === 'function') node.parentNode.removeChild(node);
    });
  }
  function readStore(){
    try {
      var raw = root.localStorage && root.localStorage.getItem(storageKey());
      var data = safeJSON(raw, { version:'wave89n', grade:gradeKey(), topics:{} });
      if (!data || typeof data !== 'object') data = { version:'wave89n', grade:gradeKey(), topics:{} };
      if (!data.topics || typeof data.topics !== 'object') data.topics = {};
      return data;
    } catch (_err) {
      return { version:'wave89n', grade:gradeKey(), topics:{} };
    }
  }
  function writeStore(data){
    try {
      if (!root.localStorage) return false;
      root.localStorage.setItem(storageKey(), JSON.stringify({
        version: 'wave89n',
        grade: gradeKey(),
        updatedAt: Date.now(),
        topics: data && data.topics && typeof data.topics === 'object' ? data.topics : {}
      }));
      return true;
    } catch (_err) {
      return false;
    }
  }
  function progressStore(){
    try {
      var raw = root.localStorage && root.localStorage.getItem('trainer_progress_' + gradeKey());
      var data = safeJSON(raw, {});
      return data && typeof data === 'object' ? data : {};
    } catch (_err) {
      return {};
    }
  }
  function topicAttempts(subjectId, topicId){
    var progress = progressStore();
    var subj = progress && progress[subjectId];
    var row = subj && subj[topicId];
    return row ? (num(row.ok) + num(row.err)) : 0;
  }
  function topicKey(subject, topic){
    var sid = cleanText(subject && subject.id);
    var tid = cleanText(topic && topic.id);
    return sid + '::' + tid;
  }
  function defaultRecord(subject, topic){
    return {
      subjectId: cleanText(subject && subject.id),
      topicId: cleanText(topic && topic.id),
      subjectName: cleanText(subject && subject.nm),
      topicName: cleanText(topic && topic.nm),
      startedRuns: 0,
      completedRuns: 0,
      stageStats: {},
      lastStage: '',
      lastPath: [],
      lastRunAt: 0,
      theorySeenAt: 0,
      exampleSeenAt: 0,
      lastExample: null
    };
  }
  function updateRecord(subject, topic, mutator){
    if (!subject || !topic) return null;
    var store = readStore();
    var key = topicKey(subject, topic);
    var record = store.topics[key] && typeof store.topics[key] === 'object' ? store.topics[key] : defaultRecord(subject, topic);
    if (typeof mutator === 'function') mutator(record);
    record.subjectId = cleanText(subject.id);
    record.topicId = cleanText(topic.id);
    record.subjectName = cleanText(subject.nm);
    record.topicName = cleanText(topic.nm);
    record.updatedAt = Date.now();
    store.topics[key] = record;
    writeStore(store);
    return clone(record);
  }
  function readRecord(subject, topic){
    if (!subject || !topic) return null;
    var store = readStore();
    var key = topicKey(subject, topic);
    var record = store.topics[key] && typeof store.topics[key] === 'object' ? store.topics[key] : defaultRecord(subject, topic);
    store.topics[key] = record;
    return clone(record);
  }
  function difficultyApi(){
    return root.__wave89mAdaptiveDifficulty && typeof root.__wave89mAdaptiveDifficulty.difficultyOf === 'function'
      ? root.__wave89mAdaptiveDifficulty
      : null;
  }
  function difficultyOf(question){
    var api = difficultyApi();
    if (api) return api.difficultyOf(question);
    var raw = norm(question && (question.diffBucket || question.difficulty || question.difficultyLabel || question.level || 'medium'));
    if (raw === 'hard' || raw === '3') return 'hard';
    if (raw === 'easy' || raw === '1') return 'easy';
    return 'medium';
  }
  function questionKey(question){
    return norm(question && question.question) + '||' + norm(question && question.answer);
  }
  function finalizeQuestion(raw, subject, topic){
    if (!raw || typeof raw !== 'object') return null;
    var question = clone(raw) || {};
    if (question.question == null && question.q != null) question.question = question.q;
    if (question.answer == null && question.a != null) question.answer = question.a;
    if (question.options == null) question.options = question.opts != null ? question.opts : question.o;
    if (question.hint == null && question.h != null) question.hint = question.h;
    if (question.tag == null && question.topic != null) question.tag = question.topic;
    if (!question.tag && topic && topic.nm) question.tag = topic.nm;
    if (!question.color && subject && subject.cl) question.color = subject.cl;
    if (!question.bg && subject && subject.bg) question.bg = subject.bg;
    if (typeof root.prepareQuestion === 'function') {
      try { question = root.prepareQuestion(question) || question; } catch (_err) {}
    }
    if (question.answer == null) question.answer = '';
    question.answer = asText(question.answer);
    if (!Array.isArray(question.options) || !question.options.length) question.options = uniqText([question.answer, 'Вариант 2', 'Вариант 3', 'Вариант 4']).slice(0, 4);
    question.__subjectId = subject && subject.id ? subject.id : null;
    question.__topicId = topic && topic.id ? topic.id : null;
    return question;
  }
  function chooseExample(pool){
    var ordered = [];
    if (pool && pool.buckets) {
      ordered = ordered.concat(pool.buckets.easy || [], pool.buckets.medium || [], pool.buckets.hard || []);
    }
    var best = null;
    for (var i = 0; i < ordered.length; i += 1) {
      var item = ordered[i];
      if (!item) continue;
      if (!item.interactionType && !item.inputMode) return clone(item);
      if (!best) best = item;
    }
    return best ? clone(best) : null;
  }
  function sampleTopic(subject, topic){
    if (!subject || !topic || typeof topic.gen !== 'function') return null;
    var key = topicKey(subject, topic);
    if (cache[key] && cache[key].total >= 1) return clone(cache[key]);
    var buckets = { easy:[], medium:[], hard:[] };
    var all = [];
    var seen = {};
    var attempts = 0;
    while (attempts < 36 && all.length < 18) {
      attempts += 1;
      var raw = null;
      try { raw = topic.gen(); } catch (_err) { raw = null; }
      var question = finalizeQuestion(raw, subject, topic);
      if (!question || !cleanText(question.question) || !cleanText(question.answer)) continue;
      var keyQuestion = questionKey(question);
      if (seen[keyQuestion]) continue;
      seen[keyQuestion] = true;
      var bucket = difficultyOf(question);
      question.__wave89nStage = bucket;
      all.push(question);
      if (!buckets[bucket]) buckets[bucket] = [];
      buckets[bucket].push(question);
    }
    var pool = {
      key: key,
      sampledAt: Date.now(),
      total: all.length,
      buckets: {
        easy: clone(buckets.easy),
        medium: clone(buckets.medium),
        hard: clone(buckets.hard)
      },
      example: chooseExample({ buckets:buckets })
    };
    cache[key] = clone(pool);
    return clone(pool);
  }
  function buildGuidedPlan(subject, topic){
    var pool = sampleTopic(subject, topic);
    if (!pool) return null;
    var queue = new root.Array();
    var used = {};
    ['easy', 'medium', 'hard'].forEach(function(bucket){
      var list = pool.buckets && Array.isArray(pool.buckets[bucket]) ? pool.buckets[bucket] : [];
      for (var i = 0; i < list.length; i += 1) {
        var candidate = list[i];
        var keyQuestion = questionKey(candidate);
        if (used[keyQuestion]) continue;
        used[keyQuestion] = true;
        candidate = clone(candidate);
        candidate.__wave89nStage = bucket;
        queue.push(candidate);
        break;
      }
    });
    if (!queue.length && pool.example) {
      var fallback = clone(pool.example);
      fallback.__wave89nStage = difficultyOf(fallback);
      queue.push(fallback);
    }
    return {
      key: topicKey(subject, topic),
      example: pool.example ? clone(pool.example) : null,
      queue: queue,
      buckets: pool.buckets ? clone(pool.buckets) : { easy:[], medium:[], hard:[] },
      total: pool.total || queue.length,
      stageOrder: (function(){
        var stageOrder = new root.Array();
        queue.forEach(function(item){ stageOrder.push(item && item.__wave89nStage ? item.__wave89nStage : difficultyOf(item)); });
        return stageOrder;
      })()
    };
  }
  function shouldSeedForTopic(subject, topic){
    if (!subject || !topic) return false;
    if (root.mix || root.globalMix || root.rushMode || root.diagMode) return false;
    if (Array.isArray(root.__wave21QuestionQueue) && root.__wave21QuestionQueue.length) return false;
    if (root.__wave21SessionMode === 'error-review') return false;
    if (root.__wave28CurrentReviewKey) return false;
    var record = readRecord(subject, topic);
    if ((num(record.completedRuns) || 0) > 0) return false;
    return topicAttempts(subject.id, topic.id) === 0 || num(record.startedRuns) === 0;
  }
  function markTheory(subject, topic){
    return updateRecord(subject, topic, function(record){
      if (!record.theorySeenAt) record.theorySeenAt = Date.now();
    });
  }
  function markExample(subject, topic, example){
    return updateRecord(subject, topic, function(record){
      if (!record.exampleSeenAt) record.exampleSeenAt = Date.now();
      if (example) {
        record.lastExample = {
          question: cleanText(example.question).slice(0, 220),
          answer: cleanText(example.answer),
          bucket: difficultyOf(example)
        };
      }
    });
  }
  function recordStage(subject, topic, stage, outcome, question){
    if (!subject || !topic || !stage) return null;
    return updateRecord(subject, topic, function(record){
      record.stageStats = record.stageStats && typeof record.stageStats === 'object' ? record.stageStats : {};
      var row = record.stageStats[stage] && typeof record.stageStats[stage] === 'object'
        ? record.stageStats[stage]
        : { attempts:0, correct:0, wrong:0, helped:0, lastMs:0 };
      row.attempts += 1;
      if (outcome && outcome.correct) row.correct += 1;
      else row.wrong += 1;
      if (outcome && outcome.usedHelp) row.helped += 1;
      if (outcome && outcome.ms) row.lastMs = Math.round(num(outcome.ms));
      if (question && question.question) row.lastQuestion = cleanText(question.question).slice(0, 180);
      record.stageStats[stage] = row;
      record.lastStage = stage;
      record.lastRunAt = Date.now();
      if (stage === 'hard' && !state.completionCounted) {
        record.completedRuns = num(record.completedRuns) + 1;
        state.completionCounted = true;
      }
    });
  }
  function seedGuidedPath(subject, topic){
    var plan = buildGuidedPlan(subject, topic);
    if (!plan || !plan.queue || !plan.queue.length) return false;
    updateRecord(subject, topic, function(record){
      record.startedRuns = num(record.startedRuns) + 1;
      record.lastPath = plan.stageOrder.slice();
      record.lastRunAt = Date.now();
    });
    if (plan.example) markExample(subject, topic, plan.example);
    root.__wave21QuestionQueue = plan.queue.map(function(item){ return clone(item); });
    root.__wave21QuestionQueueTotal = plan.queue.length;
    root.__wave21SessionMode = 'learning-path';
    state.active = true;
    state.phase = 'guided';
    state.topicKey = topicKey(subject, topic);
    state.subjectId = cleanText(subject.id);
    state.topicId = cleanText(topic.id);
    state.currentStage = plan.queue[0] && plan.queue[0].__wave89nStage ? plan.queue[0].__wave89nStage : '';
    state.stageResults = {};
    state.example = plan.example ? {
      question: cleanText(plan.example.question),
      answer: cleanText(plan.example.answer),
      hint: cleanText(plan.example.hint || plan.example.h),
      ex: cleanText(plan.example.ex),
      bucket: difficultyOf(plan.example)
    } : null;
    state.lastPlanStages = plan.stageOrder.slice();
    state.completionCounted = false;
    return true;
  }
  function syncStateFromContext(){
    var subject = currentSubject();
    var topic = currentTopic();
    var question = currentQuestion();
    if (!subject || !topic) return false;
    var key = topicKey(subject, topic);
    if (root.__wave21SessionMode === 'learning-path' || (question && question.__wave89nStage)) {
      state.active = true;
      state.topicKey = key;
      state.subjectId = cleanText(subject.id);
      state.topicId = cleanText(topic.id);
      state.phase = root.__wave21SessionMode === 'learning-path' ? 'guided' : (state.phase === 'regular' ? 'regular' : 'guided');
      if (question && question.__wave89nStage) state.currentStage = question.__wave89nStage;
      return true;
    }
    return false;
  }
  function finishGuidedPhase(){
    if (!state.active) return false;
    state.phase = 'regular';
    state.currentStage = '';
    state.lastCompletedTopicKey = state.topicKey;
    root.__wave21QuestionQueue = null;
    root.__wave21QuestionQueueTotal = 0;
    if (root.__wave21SessionMode === 'learning-path') root.__wave21SessionMode = null;
    try {
      if (typeof root.showToast === 'function') root.showToast('🧭 Маршрут темы пройден — дальше обычная тренировка.', 'success', 2200);
    } catch (_err) {}
    return true;
  }
  function supportsAutoSeed(){
    return typeof root.wave21OpenTopic === 'function'
      || typeof root.wave21ResumeSession === 'function'
      || typeof root.wave21ForceSnapshot === 'function';
  }
  function stageStatus(record, stage, currentStage){
    if (stage === 'theory') return record && record.theorySeenAt ? 'done' : 'idle';
    if (stage === 'example') return (record && (record.exampleSeenAt || record.lastExample)) || state.example ? 'done' : 'idle';
    if (currentStage === stage) return 'active';
    if (state.stageResults && state.stageResults[stage] && state.stageResults[stage].attempted) {
      return state.stageResults[stage].correct ? 'done' : 'warn';
    }
    if (state.phase === 'regular' && state.lastCompletedTopicKey && state.lastCompletedTopicKey === state.topicKey) return 'done';
    var row = record && record.stageStats && record.stageStats[stage];
    if (row && row.attempts) return row.correct > 0 ? 'done' : 'warn';
    return 'idle';
  }
  function stageChip(stage, status){
    return '<span class="wave89n-step ' + esc(status || 'idle') + '"><span class="ico">' + esc(STAGE_ICONS[stage] || '•') + '</span><span>' + esc(STAGE_LABELS[stage] || stage) + '</span></span>';
  }
  function renderTheoryCard(){
    if (!activeScreen('s-theory')) { removeByAttr(THEORY_ATTR); return; }
    var subject = currentSubject();
    var topic = currentTopic();
    var host = root.document && root.document.getElementById ? root.document.getElementById('tc') : null;
    if (!host || !subject || !topic) { removeByAttr(THEORY_ATTR); return; }
    var plan = buildGuidedPlan(subject, topic);
    if (!plan) { removeByAttr(THEORY_ATTR); return; }
    var record = markTheory(subject, topic) || readRecord(subject, topic);
    if (plan.example) record = markExample(subject, topic, plan.example) || record;
    removeByAttr(THEORY_ATTR);
    var card = root.document.createElement('div');
    card.className = 'tcard wave89n-path-card';
    card.setAttribute(THEORY_ATTR, '');
    var example = plan.example;
    var exampleHtml = example
      ? '<div class="wave89n-example"><div class="wave89n-example-q"><b>Пример:</b> ' + esc(example.question) + '</div><div class="wave89n-example-a">Ответ: <b>' + esc(example.answer) + '</b></div>' + ((example.ex || example.hint) ? '<div class="wave89n-note">' + esc(example.ex || example.hint) + '</div>' : '') + '</div>'
      : '<div class="wave89n-note">Для этой темы пока не удалось собрать отдельный пример, но стартовая лестница сложности всё равно сработает при запуске тренажёра.</div>';
    card.innerHTML = '<div class="wave89n-path-head"><div><div class="wave89n-path-title">🧭 Маршрут темы</div><div class="wave89n-path-sub">Сначала теория и пример, затем 3 стартовых шага: лёгкое → среднее → сложное.</div></div>'
      + (num(record.completedRuns) > 0 ? '<span class="wave89n-badge done">Пройдено</span>' : '<span class="wave89n-badge">Новый маршрут</span>')
      + '</div><div class="wave89n-steps">'
      + STAGE_ORDER.map(function(stage){ return stageChip(stage, stageStatus(record, stage, '')); }).join('')
      + '</div>' + exampleHtml
      + '<div class="wave89n-note">После стартовой лестницы тренировка перейдёт в обычный режим и подхватит уже существующую адаптивную сложность.</div>';
    host.appendChild(card);
  }
  function renderPlayCard(){
    if (!activeScreen('s-play')) { removeByAttr(PLAY_ATTR); return; }
    var subject = currentSubject();
    var topic = currentTopic();
    var host = root.document && root.document.getElementById ? root.document.getElementById('pa') : null;
    if (!host || !subject || !topic) { removeByAttr(PLAY_ATTR); return; }
    syncStateFromContext();
    var key = topicKey(subject, topic);
    if (!(root.__wave21SessionMode === 'learning-path' || (state.active && state.topicKey === key))) { removeByAttr(PLAY_ATTR); return; }
    var record = readRecord(subject, topic) || defaultRecord(subject, topic);
    var question = currentQuestion();
    var currentStage = question && question.__wave89nStage ? question.__wave89nStage : '';
    removeByAttr(PLAY_ATTR);
    var card = root.document.createElement('div');
    card.className = 'wave89n-path-card wave89n-play-card';
    card.setAttribute(PLAY_ATTR, '');
    var note = currentStage
      ? 'Сейчас идёт шаг «' + (STAGE_LABELS[currentStage] || currentStage) + '». После стартовых вопросов тренировка продолжится в обычном режиме.'
      : 'Стартовая лестница сложности уже пройдена — дальше идёт обычная тренировка по теме.';
    var exampleHtml = state.example && state.phase === 'guided'
      ? '<div class="wave89n-note">Короткий пример перед стартом: <b>' + esc(state.example.answer) + '</b> — ' + esc(state.example.question) + '.</div>'
      : '';
    card.innerHTML = '<div class="wave89n-path-head"><div><div class="wave89n-path-title">🧭 Маршрут темы</div><div class="wave89n-path-sub">' + esc(topic.nm || '') + '</div></div>'
      + '<span class="wave89n-badge ' + esc(state.phase === 'regular' ? 'done' : '') + '">' + esc(state.phase === 'regular' ? 'Обычный режим' : 'Стартовый путь') + '</span></div>'
      + '<div class="wave89n-steps">' + STAGE_ORDER.map(function(stage){ return stageChip(stage, stageStatus(record, stage, currentStage)); }).join('') + '</div>'
      + exampleHtml + '<div class="wave89n-note">' + esc(note) + '</div>';
    host.appendChild(card);
  }
  function summarizeStore(){
    var store = readStore();
    var totalTopics = 0;
    if (Array.isArray(root.SUBJ)) {
      root.SUBJ.forEach(function(subject){ totalTopics += Array.isArray(subject && subject.tops) ? subject.tops.length : 0; });
    }
    var started = 0;
    var completed = 0;
    var theorySeen = 0;
    var exampleReady = 0;
    var lastTopic = null;
    Object.keys(store.topics || {}).forEach(function(key){
      var record = store.topics[key];
      if (!record || typeof record !== 'object') return;
      started += 1;
      if (num(record.completedRuns) > 0) completed += 1;
      if (record.theorySeenAt) theorySeen += 1;
      if (record.lastExample) exampleReady += 1;
      if (!lastTopic || num(record.lastRunAt) > num(lastTopic.lastRunAt)) lastTopic = record;
    });
    return {
      totalTopics: totalTopics,
      started: started,
      completed: completed,
      theorySeen: theorySeen,
      exampleReady: exampleReady,
      lastTopic: lastTopic ? clone(lastTopic) : null
    };
  }
  function appendProgressCard(){
    var host = root.document && root.document.getElementById ? root.document.getElementById('prog-content') : null;
    if (!host) { removeByAttr(PROGRESS_ATTR); return; }
    var summary = summarizeStore();
    removeByAttr(PROGRESS_ATTR);
    var card = root.document.createElement('div');
    card.className = 'rcard wave89n-path-card';
    card.setAttribute(PROGRESS_ATTR, '');
    var completedPct = summary.totalTopics ? Math.round(summary.completed / summary.totalTopics * 100) : 0;
    var lastHtml = summary.lastTopic
      ? '<li><b>Последняя тема:</b> ' + esc(summary.lastTopic.subjectName) + ' → ' + esc(summary.lastTopic.topicName) + '</li>'
      : '<li><b>Последняя тема:</b> пока нет запусков маршрута</li>';
    card.innerHTML = '<div class="wave89n-path-head"><div><div class="wave89n-path-title">🧭 Learning path</div><div class="wave89n-path-sub">Маршрут по темам: теория → пример → лёгкое → среднее → сложное.</div></div>'
      + '<span class="wave89n-badge">' + esc(completedPct + '%') + '</span></div>'
      + '<div class="wave89n-steps">'
      + '<span class="wave89n-step done"><span class="ico">📚</span><span>Тем начато: ' + esc(summary.started) + '</span></span>'
      + '<span class="wave89n-step ' + (summary.completed ? 'done' : 'idle') + '"><span class="ico">✅</span><span>Пройдено: ' + esc(summary.completed) + '</span></span>'
      + '<span class="wave89n-step ' + (summary.theorySeen ? 'done' : 'idle') + '"><span class="ico">📖</span><span>Теория открыта: ' + esc(summary.theorySeen) + '</span></span>'
      + '<span class="wave89n-step ' + (summary.exampleReady ? 'done' : 'idle') + '"><span class="ico">🧪</span><span>Примеры готовы: ' + esc(summary.exampleReady) + '</span></span>'
      + '</div><ul class="wave89n-note-list">' + lastHtml + '<li><b>Всего тем в классе:</b> ' + esc(summary.totalTopics) + '</li></ul>';
    host.appendChild(card);
  }
  function resetState(){
    state.active = false;
    state.phase = 'idle';
    state.topicKey = '';
    state.subjectId = '';
    state.topicId = '';
    state.currentStage = '';
    state.stageResults = {};
    state.example = null;
    state.completionCounted = false;
    state.lastPlanStages = [];
  }

  var baseStartQuiz = typeof root.startQuiz === 'function' ? root.startQuiz : null;
  if (baseStartQuiz) {
    root.startQuiz = function(){
      var subject = currentSubject();
      var topic = currentTopic();
      if (supportsAutoSeed() && shouldSeedForTopic(subject, topic)) seedGuidedPath(subject, topic);
      else syncStateFromContext();
      return baseStartQuiz.apply(this, arguments);
    };
  }

  var baseAns = typeof root.ans === 'function' ? root.ans : null;
  if (baseAns) {
    root.ans = function(){
      var question = currentQuestion();
      var stage = question && question.__wave89nStage ? question.__wave89nStage : '';
      var subject = currentSubject();
      var topic = currentTopic();
      var hadSelection = currentSelection() != null;
      var result = baseAns.apply(this, arguments);
      try {
        if (!stage || hadSelection || currentSelection() == null) return result;
        var sample = question.__wave87xTiming && question.__wave87xTiming.last ? question.__wave87xTiming.last : null;
        state.stageResults[stage] = {
          attempted: true,
          correct: norm(currentSelection()) === norm(question.answer),
          usedHelp: usedHelpState(),
          ms: sample && sample.ms ? Math.round(num(sample.ms)) : 0
        };
        recordStage(subject, topic, stage, state.stageResults[stage], question);
        try {
          var adaptive = root.__wave89mAdaptiveDifficulty;
          if (adaptive && typeof adaptive.recordOutcome === 'function') {
            var adaptiveState = adaptive.currentState && typeof adaptive.currentState === 'function' ? adaptive.currentState() : null;
            adaptive.recordOutcome(question, {
              correct: !!state.stageResults[stage].correct,
              usedHelp: !!state.stageResults[stage].usedHelp,
              ms: state.stageResults[stage].ms || 0,
              bucket: difficultyOf(question),
              target: adaptiveState && adaptiveState.lastTarget ? adaptiveState.lastTarget : difficultyOf(question)
            });
          }
        } catch (_err) {}
        state.currentStage = stage;
        state.active = true;
        state.topicKey = topicKey(subject, topic);
        state.subjectId = cleanText(subject && subject.id);
        state.topicId = cleanText(topic && topic.id);
      } catch (_err) {}
      return result;
    };
  }

  var baseNextQ = typeof root.nextQ === 'function' ? root.nextQ : null;
  if (baseNextQ) {
    root.nextQ = function(){
      if (state.active && root.__wave21SessionMode === 'learning-path' && Array.isArray(root.__wave21QuestionQueue) && root.__wave21QuestionQueue.length === 0) finishGuidedPhase();
      var result = baseNextQ.apply(this, arguments);
      try { renderPlayCard(); } catch (_err) {}
      return result;
    };
  }

  var baseRender = typeof root.render === 'function' ? root.render : null;
  if (baseRender) {
    root.render = function(){
      var result = baseRender.apply(this, arguments);
      try { renderPlayCard(); } catch (_err) {}
      return result;
    };
  }

  var baseRenderProg = typeof root.renderProg === 'function' ? root.renderProg : null;
  if (baseRenderProg) {
    root.renderProg = function(){
      var result = baseRenderProg.apply(this, arguments);
      try { appendProgressCard(); } catch (_err) {}
      return result;
    };
  }

  var baseGo = typeof root.go === 'function' ? root.go : null;
  if (baseGo) {
    root.go = function(screen){
      var result = baseGo.apply(this, arguments);
      try {
        if (screen === 'theory') renderTheoryCard();
        else removeByAttr(THEORY_ATTR);
        if (screen === 'play') renderPlayCard();
        else removeByAttr(PLAY_ATTR);
        if (screen === 'prog') appendProgressCard();
        else removeByAttr(PROGRESS_ATTR);
      } catch (_err) {}
      return result;
    };
  }

  var baseEndSession = typeof root.endSession === 'function' ? root.endSession : null;
  if (baseEndSession) {
    root.endSession = function(){
      var result = baseEndSession.apply(this, arguments);
      resetState();
      removeByAttr(PLAY_ATTR);
      return result;
    };
  }

  function init(){
    try {
      if (activeScreen('s-theory')) renderTheoryCard();
      if (activeScreen('s-play')) renderPlayCard();
      if (activeScreen('s-prog')) appendProgressCard();
    } catch (_err) {}
  }
  if (root.document && root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  root.__wave89nLearningPath = {
    version: 'wave89n',
    storageKey: storageKey,
    readStore: readStore,
    writeStore: writeStore,
    readRecord: readRecord,
    updateRecord: updateRecord,
    topicAttempts: topicAttempts,
    buildGuidedPlan: buildGuidedPlan,
    seedGuidedPath: seedGuidedPath,
    shouldSeedForTopic: shouldSeedForTopic,
    markTheory: markTheory,
    markExample: markExample,
    recordStage: recordStage,
    finishGuidedPhase: finishGuidedPhase,
    renderTheoryCard: renderTheoryCard,
    renderPlayCard: renderPlayCard,
    appendProgressCard: appendProgressCard,
    summarizeStore: summarizeStore,
    currentState: function(){ return clone(state); },
    clear: function(){ try { if (root.localStorage) root.localStorage.removeItem(storageKey()); } catch (_err) {} resetState(); cache = {}; }
  };
})();



/* wave89x: lazy-load senior optional input / interaction banks to keep grade pages under the proxy JS budget */
(function(){
  'use strict';
  if (typeof window === 'undefined' || window.__wave89xOptionalInputBanks) return;

  var root = window;
  var grade = String(root.GRADE_NUM || root.GRADE_NO || '');
  var enabled = /^(8|9|10|11)$/.test(grade);
  var chunkSrc = './assets/js/chunk_subject_expansion_wave89b_inputs_interactions_banks.bbaba018eb.js';
  var state = {
    version: 'wave89x',
    active: enabled,
    grade: grade,
    chunkSrc: chunkSrc,
    status: enabled ? 'idle' : 'skipped',
    patchedOpenSubj: false,
    loadCount: 0,
    waitCount: 0
  };
  root.__wave89xOptionalInputBanks = state;
  if (!enabled || !root.document) return;

  var loadPromise = null;
  var loaded = false;

  function nowTs(){
    try { return Date.now(); }
    catch (_err) { return +new Date(); }
  }

  function hasOptionalTopics(){
    var subjects = Array.isArray(root.SUBJ) ? root.SUBJ : [];
    for (var i = 0; i < subjects.length; i += 1) {
      var subject = subjects[i];
      var topics = subject && Array.isArray(subject.tops) ? subject.tops : [];
      for (var j = 0; j < topics.length; j += 1) {
        var topicId = String(topics[j] && topics[j].id || '');
        if (/^(?:num(?:alg|prob|phy|chem)(?:8|9|10|11)w87y|text(?:rus|eng)(?:8|9|10|11)w87z|multi(?:bio8|his8|chem9|soc9|inf10|soc10|rus11|bio11)w88b)$/.test(topicId)) return true;
      }
    }
    return false;
  }

  function markReady(source){
    loaded = true;
    state.status = 'ready';
    state.loadedAt = nowTs();
    state.readyFrom = source || state.lastReason || 'runtime';
    try {
      root.dispatchEvent(new CustomEvent('wave89x-optional-input-banks-ready', {
        detail: {
          grade: grade,
          chunkSrc: chunkSrc,
          readyFrom: state.readyFrom
        }
      }));
    } catch (_err) {}
    return true;
  }

  function currentSubjectId(){
    var subject = root.cS;
    return subject && subject.id ? String(subject.id) : '';
  }

  function refreshCurrentSubject(){
    if (typeof root.openSubj !== 'function') return false;
    var screen = root.document.getElementById('s-subj');
    if (!(screen && screen.classList && screen.classList.contains('on'))) return false;
    var subjectId = currentSubjectId();
    if (!subjectId) return false;
    try {
      root.openSubj(subjectId, { keepSearch:true });
      state.refreshedOpenSubject = true;
      return true;
    } catch (_err) {
      return false;
    }
  }

  function attachExistingScript(existing, resolve, reject){
    if (!existing) return false;
    existing.addEventListener('load', function(){
      markReady('existing-script');
      resolve(true);
    }, { once:true });
    existing.addEventListener('error', function(){
      state.status = 'error';
      state.error = 'existing-script-failed';
      reject(new Error('existing optional banks script failed to load'));
    }, { once:true });
    return true;
  }

  function ensureLoaded(reason){
    reason = reason || 'runtime';
    state.lastReason = reason;
    if (loaded || hasOptionalTopics()) return Promise.resolve(markReady('topics-present'));
    if (loadPromise) return loadPromise;

    state.status = 'loading';
    state.requestedAt = nowTs();
    state.loadCount += 1;

    loadPromise = new Promise(function(resolve, reject){
      var existing = root.document.querySelector('script[data-wave89x-optional-banks],script[src$="chunk_subject_expansion_wave89b_inputs_interactions_banks.bbaba018eb.js"]');
      if (attachExistingScript(existing, resolve, reject)) return;
      var script = root.document.createElement('script');
      script.src = chunkSrc;
      script.defer = true;
      script.async = true;
      script.setAttribute('data-wave89x-optional-banks', '1');
      script.addEventListener('load', function(){
        markReady('dynamic-script');
        resolve(true);
      }, { once:true });
      script.addEventListener('error', function(){
        state.status = 'error';
        state.error = 'dynamic-script-failed';
        reject(new Error('dynamic optional banks script failed to load'));
      }, { once:true });
      (root.document.head || root.document.documentElement || root.document.body).appendChild(script);
    }).catch(function(err){
      state.status = 'error';
      state.errorMessage = err && err.message ? String(err.message) : 'unknown-error';
      return false;
    });

    return loadPromise;
  }

  function notifyWait(){
    state.waitCount += 1;
    state.lastWaitAt = nowTs();
    try {
      if (typeof root.toast === 'function') root.toast('Загружаем расширенные задания…');
    } catch (_err) {}
  }

  function patchOpenSubj(){
    if (typeof root.openSubj !== 'function' || root.__wave89xOptionalInputBanksPatchedOpenSubj) return false;
    var original = root.openSubj;
    root.openSubj = function(subjectId, opts){
      if (loaded || hasOptionalTopics()) {
        markReady('topics-present');
        return original.apply(this, arguments);
      }
      var args = arguments;
      notifyWait();
      ensureLoaded('open-subject').then(function(){
        original.apply(root, args);
      }).catch(function(){
        original.apply(root, args);
      });
      return false;
    };
    root.__wave89xOptionalInputBanksPatchedOpenSubj = true;
    state.patchedOpenSubj = true;
    return true;
  }

  function primeOnIntent(){
    if (state.intentPrimed) return;
    state.intentPrimed = true;
    var once = function(){
      ensureLoaded('user-intent');
      root.document.removeEventListener('pointerdown', onPointer, true);
      root.document.removeEventListener('keydown', onKey, true);
    };
    function isMainUiTarget(target){
      if (!target || typeof target.closest !== 'function') return false;
      return !!target.closest('#sg, #s-main, #player-badge, #main-search-slot');
    }
    function onPointer(event){
      if (!isMainUiTarget(event.target)) return;
      once();
    }
    function onKey(event){
      if (!isMainUiTarget(event.target)) return;
      if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
      once();
    }
    root.document.addEventListener('pointerdown', onPointer, true);
    root.document.addEventListener('keydown', onKey, true);
  }

  function scheduleWarmup(){
    if (state.warmupScheduled) return;
    state.warmupScheduled = true;
    var run = function(){
      ensureLoaded('warmup').then(function(ok){
        if (ok) refreshCurrentSubject();
      });
    };
    var onLoad = function(){
      if (typeof root.requestIdleCallback === 'function') {
        root.requestIdleCallback(run, { timeout: 1500 });
      } else {
        root.setTimeout(run, 300);
      }
    };
    if (root.document.readyState === 'complete' || typeof root.addEventListener !== 'function') onLoad();
    else root.addEventListener('load', onLoad, { once:true });
  }

  function init(){
    patchOpenSubj();
    primeOnIntent();
    scheduleWarmup();
    if (hasOptionalTopics()) markReady('topics-present');
  }

  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  if (typeof root.addEventListener === 'function') {
    root.addEventListener('wave89x-optional-input-banks-ready', function(){
      refreshCurrentSubject();
    });
  }

  state.ensureLoaded = ensureLoaded;
  state.isReady = function(){ return !!loaded || hasOptionalTopics(); };
})();

/* wave91f: compact learning tools pack */
(function(){
'use strict';
if(typeof window==='undefined'||window.__wave91fLearningPack)return;window.__wave91fLearningPack=1;
var r=window,W='wave91f',SID='wave91f-style',timer=0;
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
function css(){if(document.getElementById(SID))return;var s=document.createElement('style');s.id=SID;s.textContent='.wave91f-card{margin:10px 0;padding:14px;border:1px solid var(--border);border-radius:18px;background:var(--card);box-shadow:0 10px 28px rgba(15,23,42,.06)}.wave91f-card h3{margin:0 0 6px;font-family:Unbounded,system-ui,sans-serif;font-size:14px}.wave91f-sub{font-size:12px;line-height:1.45;color:var(--muted);margin:0 0 10px}.wave91f-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.wave91f-btn{border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);font:800 12px Golos Text,system-ui;padding:9px 11px;cursor:pointer}.wave91f-btn.primary{border-color:transparent;background:var(--accent);color:#fff}.wave91f-btn.danger{border-color:transparent;background:var(--red);color:#fff}.wave91f-input,.wave91f-ta{border:1px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);padding:9px 11px;font:inherit}.wave91f-ta{width:100%;min-height:70px;box-sizing:border-box}.wave91f-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}.wave91f-kpi{padding:10px;border:1px solid var(--border);border-radius:14px;background:var(--bg)}.wave91f-kpi b{display:block;font-size:18px}.wave91f-banner{margin:8px 0;padding:10px;border:1px dashed var(--accent);border-radius:14px;background:color-mix(in srgb,var(--accent) 10%,transparent);font-size:12px}.wave91f-tools{margin:8px 0 10px;padding:10px;border:1px solid var(--border);border-radius:14px;background:var(--card)}.wave91f-modal{position:fixed;inset:0;z-index:10060;background:rgba(15,23,42,.58);display:flex;align-items:center;justify-content:center;padding:16px}.wave91f-dialog{width:min(920px,100%);max-height:88vh;overflow:auto;border:1px solid var(--border);border-radius:22px;background:var(--card);color:var(--text);padding:16px;box-shadow:0 24px 80px rgba(0,0,0,.28)}.wave91f-map{width:100%;min-height:430px;border:1px solid var(--border);border-radius:16px;background:var(--bg)}.wave91f-toast{position:fixed;left:50%;bottom:22px;z-index:10070;transform:translateX(-50%) translateY(10px);opacity:0;padding:10px 13px;border-radius:14px;background:var(--text);color:var(--bg);font-size:13px;font-weight:850;box-shadow:0 18px 50px rgba(0,0,0,.25);transition:.18s}.wave91f-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}body.simple-mode .wave91f-adv{display:none!important}';var hp=document.head||document.documentElement||document.body;if(hp&&hp.appendChild)hp.appendChild(s)}
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
function tickM(){var x=q(),s=mar();if(!x||!s.active)return;var p=play(),b=document.getElementById('wave91f-marathon-banner');if(p&&!b){b=document.createElement('div');b.id='wave91f-marathon-banner';b.className='wave91f-banner';p.insertBefore(b,p.firstChild)}if(b)b.innerHTML='🏃 <b>Марафон</b> · счёт: <b>'+s.score+'</b> <button class="wave91f-btn" id="wave91f-stop-m">Стоп</button>';var sb=document.getElementById('wave91f-stop-m');if(sb)sb.onclick=function(){stopM('manual')};if(selv()==null)return;var id=qid(x);s.seen=s.seen||{};if(s.seen[id])return;s.seen[id]=1;if(ok(x)){s.score=(+s.score||0)+1;savem(s)}else stopM('wrong')}
function diff(){var m=R(K('difficulty_tags'),{});return m&&typeof m==='object'&&!Array.isArray(m)?m:{}}
function setD(l){var x=q();if(!x)return;var m=diff();m[qid(x)]={level:l,ts:ts(),subject:subj(),topic:topic(x),q:qs(x)};S(K('difficulty_tags'),m);toast('Сложность: '+l);var box=document.getElementById('wave91f-tools');if(box)box.remove();tools()}
function diffStats(){var m=diff(),o=[0,0,0,0];Object.keys(m).forEach(function(k){var l=+m[k].level;if(l>=1&&l<=3){o[0]++;o[l]++}});return o}
function plan(){var p=R(K('control_work_plan'),{});return p&&typeof p==='object'?p:{}}
function left(d){if(!d)return null;var x=new Date(d+'T00:00:00'),t=new Date(),b=new Date(t.getFullYear(),t.getMonth(),t.getDate());return Math.ceil((x-b)/86400000)}
function savePlan(){var d=document.getElementById('wave91f-plan-date'),t=document.getElementById('wave91f-plan-topic');S(K('control_work_plan'),{date:d?d.value:'',topic:t?t.value:'',ts:ts()});toast('План сохранён');var c=document.getElementById('wave91f-main-card');if(c)c.remove();card()}
function pom(){var s=R('trainer_pomodoro_wave91e_'+g(),{}),h=Array.isArray(s.history)?s.history:[];return{done:+s.completed||0,min:Math.round(h.reduce(function(a,x){return a+(x&&x.completed!==false?(+x.durationSec||0):0)},(+s.completed||0)*1500)/60)}}
function freeze(){var s=R(K('streak_freeze'),null);return s&&typeof s==='object'?s:{balance:2,used:[]}}
function useFreeze(){var s=freeze(),d=day();s.used=Array.isArray(s.used)?s.used:[];if(s.used.indexOf(d)>=0)return toast('Freeze уже активен сегодня');if((+s.balance||0)<=0)return toast('Freeze закончились');s.balance=(+s.balance||0)-1;s.used.push(d);S(K('streak_freeze'),s);toast('Freeze активирован');var c=document.getElementById('wave91f-main-card');if(c)c.remove();card()}
function card(){var h=main();if(!h||document.getElementById('wave91f-main-card'))return;var m=mar(),ds=diffStats(),p=plan(),pm=pom(),fr=freeze(),ld=left(p.date),c=document.createElement('section');c.id='wave91f-main-card';c.className='wave91f-card';c.innerHTML='<h3>🧩 Форматы wave91f</h3><p class="wave91f-sub">Карта тем, дневник ошибок, марафон, теги сложности, план к контрольной, статистика Pomodoro и streak freeze.</p><div class="wave91f-grid"><div class="wave91f-kpi"><span>Марафон best</span><b>'+m.best+'</b></div><div class="wave91f-kpi"><span>Сложность 1/2/3</span><b>'+ds[1]+' · '+ds[2]+' · '+ds[3]+'</b></div><div class="wave91f-kpi"><span>Pomodoro</span><b>'+pm.done+' / '+pm.min+'м</b></div><div class="wave91f-kpi"><span>Freeze</span><b>'+fr.balance+'</b></div></div><div class="wave91f-actions" style="margin-top:10px"><button class="wave91f-btn primary" id="wave91f-map">Карта тем</button><button class="wave91f-btn" id="wave91f-diary">Дневник ошибок</button><button class="wave91f-btn" id="wave91f-marathon">Старт марафона</button><button class="wave91f-btn" id="wave91f-freeze">Freeze сегодня</button></div><div class="wave91f-grid" style="margin-top:10px"><input class="wave91f-input" type="date" id="wave91f-plan-date" value="'+e(p.date||'')+'"><input class="wave91f-input" id="wave91f-plan-topic" placeholder="Тема контрольной" value="'+e(p.topic||'')+'"></div><p class="wave91f-sub">'+(p.date||p.topic?'Контрольная: <b>'+e(p.topic||'повторение')+'</b>'+(ld==null?'':' · осталось '+ld+' дн.'):'План к контрольной пока не задан.')+'</p><button class="wave91f-btn primary" id="wave91f-plan-save">Сохранить план</button>';ins(anchor(),c,h);var bMap=c.querySelector('#wave91f-map');if(bMap)bMap.onclick=openMap;var bDiary=c.querySelector('#wave91f-diary');if(bDiary)bDiary.onclick=openDiary;var bMar=c.querySelector('#wave91f-marathon');if(bMar)bMar.onclick=startM;var bFr=c.querySelector('#wave91f-freeze');if(bFr)bFr.onclick=useFreeze;var bPlan=c.querySelector('#wave91f-plan-save');if(bPlan)bPlan.onclick=savePlan}
function banner(){var p=plan(),h=play()||main();if(!h||(!p.date&&!p.topic))return;if(document.getElementById('wave91f-plan-banner'))return;var b=document.createElement('div');b.id='wave91f-plan-banner';b.className='wave91f-banner';var ld=left(p.date);b.innerHTML='🎯 <b>Фокус к контрольной</b>: '+e(p.topic||'повторение')+(ld==null?'':' · '+ld+' дн.')+'. Сегодня: 5 заданий + разбор ошибок.';h.insertBefore(b,h.firstChild)}
function speak(){try{var x=q();if(!x||!r.speechSynthesis)return toast('Озвучивание недоступно');var u=new SpeechSynthesisUtterance(txt(qs(x)));u.lang=/англ|english/i.test(subj())?'en-US':'ru-RU';u.rate=u.lang==='en-US'?.92:1;r.speechSynthesis.cancel();r.speechSynthesis.speak(u)}catch(e){toast('Не удалось озвучить')}}
function tools(){var h=play(),x=q();if(!h||!x||document.getElementById('wave91f-tools'))return;var m=diff(),lv=m[qid(x)]&&m[qid(x)].level,eng=/англ|english/i.test(subj())||/[a-z]{3,}/i.test(qs(x)),d=document.createElement('div');d.id='wave91f-tools';d.className='wave91f-tools';d.innerHTML='<div class="wave91f-actions"><span>🏷 Сложность</span><button class="wave91f-btn" data-d="1" aria-pressed="'+(lv==1)+'">1</button><button class="wave91f-btn" data-d="2" aria-pressed="'+(lv==2)+'">2</button><button class="wave91f-btn" data-d="3" aria-pressed="'+(lv==3)+'">3</button>'+(eng?'<button class="wave91f-btn" id="wave91f-speak">🔊 Озвучить</button>':'')+'</div>';var a=document.getElementById('ha')||h.firstChild;if(a&&a.parentNode)a.parentNode.insertBefore(d,a);else h.insertBefore(d,h.firstChild);Array.prototype.forEach.call(d.querySelectorAll('[data-d]'),function(b){b.onclick=function(){setD(+b.getAttribute('data-d'))}});var sp=d.querySelector('#wave91f-speak');if(sp)sp.onclick=speak}
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
      'body.simple-mode .wave91g-main-card{display:none!important}',
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
  function card(){var h=main();if(!h||document.getElementById('wave91h-main-card'))return;var lv=level(),sea=seasonal(),q=quiz(),c=document.createElement('section');c.id='wave91h-main-card';c.className='wave91h-card wave91h-advanced';c.innerHTML='<h3>🚀 UX и геймификация wave91h</h3><p class="wave91h-sub">Уровни, heat map, ФГОС, PDF-отчёт, уведомления, тихий час, QR-коды, daily quiz, сезонные события и leaderboard марафона.</p><div class="wave91h-grid"><div class="wave91h-kpi"><span>H1 уровень</span><b>'+e(lv.name)+'</b><div class="wave91h-bar"><div class="wave91h-fill" style="width:'+lv.pct+'%"></div></div></div><div class="wave91h-kpi"><span>H2 quiz</span><b>'+(q.done?'готово':'сегодня')+'</b></div><div class="wave91h-kpi"><span>H3 '+e(sea.name)+'</span><b>'+sea.pts+' очк.</b><div class="wave91h-bar"><div class="wave91h-fill" style="width:'+sea.pct+'%"></div></div></div></div><div class="wave91h-actions" style="margin-top:10px"><button class="wave91h-btn primary" id="wave91h-heat">Heat map</button><button class="wave91h-btn" id="wave91h-fgos">ФГОС</button><button class="wave91h-btn" id="wave91h-report">PDF-отчёт</button><button class="wave91h-btn" id="wave91h-quiz">Daily quiz</button><button class="wave91h-btn" id="wave91h-qr">QR</button><button class="wave91h-btn" id="wave91h-lb">Leaderboard</button><button class="wave91h-btn" id="wave91h-settings">Уведомления</button></div>';var after=document.getElementById('wave91g-main-card')||document.getElementById('wave91f-main-card')||document.getElementById('sg')||h.firstElementChild;if(after&&after.parentNode&&typeof after.parentNode.insertBefore==='function')after.parentNode.insertBefore(c,after.nextSibling);else if(h&&typeof h.appendChild==='function')h.appendChild(c);var bHeat=c.querySelector('#wave91h-heat');if(bHeat)bHeat.onclick=openHeat;var bFgos=c.querySelector('#wave91h-fgos');if(bFgos)bFgos.onclick=openFgos;var bReport=c.querySelector('#wave91h-report');if(bReport)bReport.onclick=parentReport;var bQuiz=c.querySelector('#wave91h-quiz');if(bQuiz)bQuiz.onclick=openQuiz;var bQr=c.querySelector('#wave91h-qr');if(bQr)bQr.onclick=openQr;var bLb=c.querySelector('#wave91h-lb');if(bLb)bLb.onclick=leaderboard;var bSet=c.querySelector('#wave91h-settings');if(bSet)bSet.onclick=openSettings}
  function patch(){try{if(typeof render==='function'&&!render.__wave91h){var o=render;render=function(){var z=o.apply(this,arguments);setTimeout(mount,0);return z};render.__wave91h=1;r.render=render}}catch(_){}try{if(typeof go==='function'&&!go.__wave91h){var og=go;go=function(){var z=og.apply(this,arguments);setTimeout(mount,0);return z};go.__wave91h=1;r.go=go}}catch(_){}}
  function mount(){css();applyQuiet();if(active('s-main'))card()}
  function boot(){patch();mount();scheduleNotification();r.wave91hUxGamification={version:W,keys:{notifications:K('notifications'),quiet:K('quiet_hour'),dailyQuiz:K('daily_quiz_'+day())},level:level(),seasonal:seasonal(),fgos:fgos(),auditSnapshot:function(){return{wave:W,grade:g(),hasCard:!!document.getElementById('wave91h-main-card')||!!document.getElementById('s-main'),level:level(),seasonal:seasonal(),heatCells:heatRows().length,fgos:fgos().length,quietActive:quietActive(),supports:['G1-notification-api','G2-knowledge-heatmap','G3-parent-pdf-report','G4-fgos-progress','G6-quiet-hour','G7-qr-codes','G8-daily-mini-banner','H1-levels','H2-daily-quiz','H3-seasonal-events','H4-marathon-leaderboard']}},openHeatmap:openHeat,openParentReport:parentReport,openQr:openQr}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();if(r&&typeof r.addEventListener==='function')r.addEventListener('load',function(){setTimeout(boot,0)},{once:true});if(typeof setInterval==='function'){timer=setInterval(function(){patch();mount()},1200);if(typeof setTimeout==='function')setTimeout(function(){clearInterval(timer)},10000)}
})();


/* wave91i: lazy theory enrichment loader */
(function(){
  'use strict';
  if(window.__wave91iTheoryLoader) return;
  window.__wave91iTheoryLoader = { version:'wave91i', src:"./assets/js/chunk_theory_wave91i.a8fa390972.js", loaded:false };
  function load(){
    if(window.__wave91iTheoryLoader.loaded) return;
    window.__wave91iTheoryLoader.loaded = true;
    if(!document || !document.createElement) return;
    var s=document.createElement('script');
    s.defer=true;
    s.src=window.__wave91iTheoryLoader.src;
    if(s.dataset) s.dataset.wave91iTheory='1'; else if(s.setAttribute) s.setAttribute('data-wave91i-theory','1');
    (document.head||document.documentElement).appendChild(s);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(load,0); }, { once:true });
  else setTimeout(load,0);
})();


/* wave92a: session resume + question issue report */
(function(){
  'use strict';
  var root=window, grade=String(root.GRADE_NUM||root.GRADE_NO||'');
  function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function safeSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}}
  function safeGet(k,f){try{var v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(_){return f}}
  function active(id){var x=document.getElementById(id);return !!(x&&/\bon\b/.test(x.className||''))}
  function text(id){var x=document.getElementById(id);return x?String(x.textContent||'').replace(/\s+/g,' ').trim():''}
  function remember(){
    var subj='',topic='';
    try{ if(typeof cS!=='undefined'&&cS) subj=cS.nm||cS.name||cS.id||''; }catch(_){}
    try{ if(typeof cT!=='undefined'&&cT) topic=cT.nm||cT.name||cT.id||''; }catch(_){}
    safeSet('trainer_last_session_wave92a',{grade:grade,url:(root.location&&root.location.pathname?root.location.pathname.split('/').pop():('grade'+grade+'_v2.html')),subject:subj,topic:topic,ts:Date.now()});
  }
  function download(name,body,type){try{var url=URL.createObjectURL(new Blob([body],{type:type||'application/json;charset=utf-8'}));var a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(url);a.remove()},300)}catch(_){}}
  function report(){
    var rows=safeGet('trainer_question_reports_wave92a',[]); if(!Array.isArray(rows)) rows=[];
    var rec={grade:grade,subject:'',topic:text('qt'),question:text('qb'),code:text('qcd'),url:(root.location&&root.location.pathname)||'',ts:new Date().toISOString()};
    try{ if(typeof cS!=='undefined'&&cS) rec.subject=cS.nm||cS.name||cS.id||''; }catch(_){}
    try{ if(typeof cT!=='undefined'&&cT) rec.topic=(rec.topic?rec.topic+' · ':'')+(cT.nm||cT.name||cT.id||''); }catch(_){}
    rows.push(rec); safeSet('trainer_question_reports_wave92a',rows.slice(-100));
    if(confirm('Записал ошибку в локальный журнал. Скачать JSON-отчёт?')) download('trainer3_question_report_grade'+grade+'.json', JSON.stringify(rec,null,2));
  }
  function mount(){
    remember();
    var qc=document.getElementById('qc'); if(!active('s-play')||!qc) return;
    if(document.getElementById('wave92a-report-question')) return;
    var b=document.createElement('button'); b.id='wave92a-report-question'; b.type='button'; b.className='btn btn-o wave92a-report-question'; b.textContent='⚑ Ошибка в вопросе'; b.onclick=report;
    qc.parentNode.insertBefore(b, qc.nextSibling);
  }
  function css(){if(document.getElementById('wave92a-grade-style'))return;var s=document.createElement('style');s.id='wave92a-grade-style';s.textContent='.wave92a-report-question{margin:8px 0 0;width:100%;font-size:12px;opacity:.88}.wave92a-report-question:focus-visible{outline:3px solid var(--accent,#2563eb);outline-offset:2px}';(document.head||document.documentElement).appendChild(s)}
  function patch(){try{if(typeof go==='function'&&!go.__wave92a){var og=go;go=function(){var z=og.apply(this,arguments);setTimeout(mount,0);return z};go.__wave92a=1;root.go=go}}catch(_){}try{if(typeof render==='function'&&!render.__wave92a){var or=render;render=function(){var z=or.apply(this,arguments);setTimeout(mount,0);return z};render.__wave92a=1;root.render=render}}catch(_){}}
  function boot(){css();remember();patch();setTimeout(mount,0)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  if(root&&typeof root.addEventListener==='function')root.addEventListener('load',function(){setTimeout(boot,0)},{once:true});
})();
