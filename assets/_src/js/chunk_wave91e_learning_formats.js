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
    document.head.appendChild(style);
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
