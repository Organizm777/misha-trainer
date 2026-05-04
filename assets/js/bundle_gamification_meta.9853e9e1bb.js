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
//# sourceMappingURL=bundle_gamification_meta.9853e9e1bb.js.map
