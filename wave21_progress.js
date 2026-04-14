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
