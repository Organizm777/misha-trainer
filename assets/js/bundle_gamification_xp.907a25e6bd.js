(function(root, factory){
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(root || globalThis, true);
  } else {
    root.wave66Xp = factory(root || window, false);
  }
})(typeof window !== 'undefined' ? window : globalThis, function(root, isNode){
  'use strict';

  var CONFIG = {
    key: 'trainer_xp_state_v1',
    profileActiveKey: 'trainer35_active_profile_v1',
    profileScopePrefix: 'trainer35_scoped:',
    maxLevel: 50,
    maxXp: 50000,
    xpCorrect: 10,
    xpHint: 5,
    xpStreak5: 20
  };

  var RANKS = [
    { min: 1,  max: 6,  label: 'Новичок', icon: '🌱' },
    { min: 7,  max: 13, label: 'Ученик', icon: '📘' },
    { min: 14, max: 20, label: 'Знаток', icon: '🧠' },
    { min: 21, max: 28, label: 'Мастер', icon: '🏅' },
    { min: 29, max: 36, label: 'Эксперт', icon: '🎯' },
    { min: 37, max: 43, label: 'Гуру', icon: '🔮' },
    { min: 44, max: 50, label: 'Легенда', icon: '👑' }
  ];

  var storage = {
    get: function(key){
      try { return Storage.prototype.getItem.call(root.localStorage, key); } catch (_) { return null; }
    },
    set: function(key, value){
      try { Storage.prototype.setItem.call(root.localStorage, key, String(value)); } catch (_) {}
    },
    remove: function(key){
      try { Storage.prototype.removeItem.call(root.localStorage, key); } catch (_) {}
    }
  };

  function esc(text){
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function activeProfileId(){
    return storage.get(CONFIG.profileActiveKey) || 'p1';
  }

  function scopedKey(baseKey){
    return CONFIG.profileScopePrefix + activeProfileId() + ':' + baseKey;
  }

  function readScopedJSON(baseKey, fallback){
    var scoped = storage.get(scopedKey(baseKey));
    var raw = scoped != null ? scoped : storage.get(baseKey);
    if (!raw) return cloneState(fallback);
    try { return Object.assign(cloneState(fallback), JSON.parse(raw)); } catch (_) { return cloneState(fallback); }
  }

  function writeScopedJSON(baseKey, value){
    storage.set(scopedKey(baseKey), JSON.stringify(value));
  }

  function cloneState(state){
    return JSON.parse(JSON.stringify(state || defaultState()));
  }

  function defaultState(){
    return {
      xp: 0,
      totalAwards: 0,
      correct: 0,
      hintCorrect: 0,
      streakBonuses: 0,
      bonusXp: 0,
      levelUps: 0,
      lastGain: 0,
      lastReason: '',
      lastLabel: '',
      updatedAt: '',
      history: []
    };
  }

  function thresholdForLevel(level){
    level = Math.max(1, Math.min(CONFIG.maxLevel, Math.round(level || 1)));
    if (level <= 1) return 0;
    if (level >= CONFIG.maxLevel) return CONFIG.maxXp;
    var ratio = (level - 1) / (CONFIG.maxLevel - 1);
    return Math.round(CONFIG.maxXp * ratio * ratio);
  }

  function levelForXp(xp){
    xp = Math.max(0, Number(xp) || 0);
    var level = 1;
    for (var i = 2; i <= CONFIG.maxLevel; i++) {
      if (xp >= thresholdForLevel(i)) level = i;
      else break;
    }
    return level;
  }

  function rankForLevel(level){
    level = Math.max(1, Math.min(CONFIG.maxLevel, Number(level) || 1));
    for (var i = 0; i < RANKS.length; i++) {
      if (level >= RANKS[i].min && level <= RANKS[i].max) return RANKS[i];
    }
    return RANKS[RANKS.length - 1];
  }

  function progressForXp(xp){
    var level = levelForXp(xp);
    var current = thresholdForLevel(level);
    var next = level >= CONFIG.maxLevel ? CONFIG.maxXp : thresholdForLevel(level + 1);
    var segment = Math.max(1, next - current);
    var progress = level >= CONFIG.maxLevel ? 1 : Math.max(0, Math.min(1, ((xp - current) / segment)));
    return {
      level: level,
      currentXp: current,
      nextXp: next,
      currentInLevel: Math.max(0, xp - current),
      neededInLevel: segment,
      progress: progress,
      pct: Math.round(progress * 100),
      rank: rankForLevel(level)
    };
  }

  function describeGain(reason, amount, label){
    if (!amount) return '';
    if (label) return '+' + amount + ' XP · ' + label;
    if (reason === 'hint') return '+5 XP за верный ответ с подсказкой';
    if (reason === 'streak5') return '+20 XP за серию из 5';
    if (reason === 'diagnostic') return '+' + amount + ' XP за диагностику';
    if (reason === 'mission') return '+' + amount + ' XP за миссию';
    return '+' + amount + ' XP за верный ответ';
  }

  function trimHistory(rows){
    rows = Array.isArray(rows) ? rows : [];
    return rows.slice(-30);
  }

  function loadState(){
    var state = readScopedJSON(CONFIG.key, defaultState());
    state.history = trimHistory(state.history);
    return state;
  }

  function saveState(state){
    state = Object.assign(defaultState(), state || {});
    state.history = trimHistory(state.history);
    writeScopedJSON(CONFIG.key, state);
    return state;
  }

  function summarize(state){
    state = state || loadState();
    var progress = progressForXp(state.xp || 0);
    return {
      xp: Number(state.xp || 0),
      level: progress.level,
      rank: progress.rank,
      progress: progress,
      correct: Number(state.correct || 0),
      hintCorrect: Number(state.hintCorrect || 0),
      streakBonuses: Number(state.streakBonuses || 0),
      bonusXp: Number(state.bonusXp || 0),
      totalAwards: Number(state.totalAwards || 0),
      levelUps: Number(state.levelUps || 0),
      lastGain: Number(state.lastGain || 0),
      lastReason: state.lastReason || '',
      lastLabel: state.lastLabel || '',
      updatedAt: state.updatedAt || '',
      history: trimHistory(state.history || [])
    };
  }

  function applyAward(state, type, meta){
    state = Object.assign(defaultState(), state || {});
    meta = meta || {};
    var before = summarize(state);
    var delta = 0;
    if (type === 'correct') {
      delta = meta.withHint ? CONFIG.xpHint : CONFIG.xpCorrect;
      if (meta.withHint) state.hintCorrect = Number(state.hintCorrect || 0) + 1;
      else state.correct = Number(state.correct || 0) + 1;
    } else if (type === 'streak5') {
      delta = CONFIG.xpStreak5;
      state.streakBonuses = Number(state.streakBonuses || 0) + 1;
    } else if (type === 'bonus') {
      delta = Math.max(0, Math.round(Number(meta.amount || 0)));
      state.bonusXp = Number(state.bonusXp || 0) + delta;
    }
    state.xp = Math.min(CONFIG.maxXp, Math.max(0, Number(state.xp || 0) + delta));
    state.totalAwards = Number(state.totalAwards || 0) + (delta > 0 ? 1 : 0);
    state.lastGain = delta;
    state.lastReason = meta.reason || type;
    state.lastLabel = meta.label || '';
    state.updatedAt = new Date().toISOString();
    state.history = trimHistory((state.history || []).concat([{
      ts: state.updatedAt,
      type: type,
      reason: meta.reason || type,
      label: meta.label || '',
      gain: delta,
      withHint: !!meta.withHint,
      tag: meta.tag || '',
      source: meta.source || ''
    }]));
    var after = summarize(state);
    if (after.level > before.level) state.levelUps = Number(state.levelUps || 0) + (after.level - before.level);
    return { state: state, delta: delta, before: before, after: after, leveledUp: after.level > before.level };
  }

  function dispatchUpdate(detail){
    if (!root.document || typeof root.CustomEvent !== 'function') return;
    try { root.dispatchEvent(new CustomEvent('wave66-xp-updated', { detail: detail })); } catch (_) {}
  }

  function award(type, meta){
    var result = applyAward(loadState(), type, meta);
    saveState(result.state);
    dispatchUpdate(result);
    if (!isNode && result.delta > 0) maybeShowToast(result);
    if (!isNode && result.leveledUp) showLevelUp(result.after);
    return result;
  }

  function levelCardHtml(summary, compact){
    compact = !!compact;
    var label = compact ? ('Ур. ' + summary.level) : ('Уровень ' + summary.level + ' · ' + summary.rank.icon + ' ' + summary.rank.label);
    var xpText = compact ? (summary.xp.toLocaleString('ru-RU') + ' XP') : (summary.xp.toLocaleString('ru-RU') + ' XP из ' + summary.progress.nextXp.toLocaleString('ru-RU'));
    return '<div class="wave66-xp-card' + (compact ? ' compact' : '') + '">' +
      '<div class="wave66-xp-top">' +
        '<div class="wave66-xp-title">' + esc(label) + '</div>' +
        '<div class="wave66-xp-meta">' + esc(xpText) + '</div>' +
      '</div>' +
      '<div class="wave66-xp-bar"><div class="wave66-xp-fill" style="width:' + summary.progress.pct + '%"></div></div>' +
      '<div class="wave66-xp-sub">До следующего уровня: <b>' + Math.max(0, summary.progress.nextXp - summary.xp).toLocaleString('ru-RU') + ' XP</b></div>' +
    '</div>';
  }

  function ensureStyle(){
    if (!root.document || root.document.getElementById('wave66-xp-style')) return;
    var style = root.document.createElement('style');
    style.id = 'wave66-xp-style';
    style.textContent = [
      '.wave66-xp-card{margin-top:10px;padding:12px 14px;border:1px solid var(--border,#e5e7eb);border-radius:14px;background:var(--card,#fff);color:var(--text,#111827);box-shadow:0 10px 24px rgba(15,23,42,.06)}',
      '.wave66-xp-card.compact{padding:10px 12px}',
      '.wave66-xp-top{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:8px}',
      '.wave66-xp-title{font-family:Unbounded,system-ui,sans-serif;font-size:13px;font-weight:900;line-height:1.25}',
      '.wave66-xp-meta{font-size:11px;color:var(--muted,#6b7280);white-space:nowrap}',
      '.wave66-xp-bar{height:10px;border-radius:999px;background:rgba(37,99,235,.12);overflow:hidden}',
      '.wave66-xp-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#2563eb,#7c3aed)}',
      '.wave66-xp-sub{margin-top:6px;font-size:11px;color:var(--muted,#6b7280)}',
      '.wave66-main-strip{margin-top:8px}',
      '.wave66-index-wrap{margin:16px 0 0}',
      '.wave66-dashboard-wrap{margin:10px 0 18px}',
      '.wave66-toast{position:fixed;left:50%;bottom:calc(76px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(16px);z-index:10001;background:rgba(17,24,39,.96);color:#fff;border-radius:999px;padding:10px 14px;font-size:12px;font-weight:700;box-shadow:0 14px 30px rgba(0,0,0,.25);opacity:0;pointer-events:none;transition:opacity .22s ease, transform .22s ease;max-width:min(92vw,420px);text-align:center}',
      '.wave66-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}',
      '.wave66-levelup-overlay{position:fixed;inset:0;background:rgba(15,23,42,.58);display:flex;align-items:center;justify-content:center;padding:20px;z-index:10002}',
      '.wave66-levelup-card{width:min(92vw,360px);border-radius:22px;padding:24px 22px;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#fff;text-align:center;box-shadow:0 30px 60px rgba(15,23,42,.35);animation:wave66-pop .35s ease both}',
      '.wave66-levelup-card .big{font-family:Unbounded,system-ui,sans-serif;font-size:32px;font-weight:900;margin:8px 0 6px}',
      '.wave66-levelup-card .ttl{font-family:Unbounded,system-ui,sans-serif;font-size:14px;font-weight:900;letter-spacing:.3px}',
      '.wave66-levelup-card .sub{font-size:12px;opacity:.9;line-height:1.45;margin-top:8px}',
      '@keyframes wave66-pop{from{opacity:0;transform:scale(.9) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}'
    ].join('');
    root.document.head.appendChild(style);
  }

  function renderGradePanel(){
    if (!root.document) return;
    var badge = root.document.getElementById('player-badge');
    if (!badge || !root.document.getElementById('s-main')) return;
    var holder = root.document.getElementById('wave66-main-strip');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave66-main-strip';
      holder.className = 'wave66-main-strip';
      badge.insertAdjacentElement('afterend', holder);
    }
    holder.innerHTML = levelCardHtml(summarize(), false);
  }

  function renderIndexCard(){
    if (!root.document || root.document.getElementById('s-main')) return;
    var stats = root.document.querySelector('.header .stats');
    if (!stats) return;
    var holder = root.document.getElementById('wave66-index-wrap');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave66-index-wrap';
      holder.className = 'wave66-index-wrap';
      stats.insertAdjacentElement('afterend', holder);
    }
    var summary = summarize();
    holder.innerHTML = levelCardHtml(summary, false);
  }

  function renderDashboardCard(){
    if (!root.document || !root.document.querySelector('.hero')) return;
    var hero = root.document.querySelector('.hero');
    var holder = root.document.getElementById('wave66-dashboard-wrap');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave66-dashboard-wrap';
      holder.className = 'wave66-dashboard-wrap';
      hero.insertAdjacentElement('afterend', holder);
    }
    var summary = summarize();
    holder.innerHTML = levelCardHtml(summary, false);
    var rank = root.document.getElementById('rank');
    if (rank) {
      rank.textContent = summary.rank.icon + ' ' + summary.rank.label + ' · уровень ' + summary.level + ' · ' + summary.xp.toLocaleString('ru-RU') + ' XP';
    }
  }

  function decorateHallOfFame(){
    if (!root.document) return;
    var overlays = Array.prototype.slice.call(root.document.querySelectorAll('body > div[style*="position:fixed"]'));
    if (!overlays.length) return;
    var overlay = overlays[overlays.length - 1];
    var card = overlay && overlay.firstElementChild;
    if (!card || card.querySelector('.wave66-profile-xp')) return;
    var summary = summarize();
    var section = root.document.createElement('div');
    section.className = 'wave66-profile-xp';
    section.style.margin = '0 0 14px';
    section.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px">' +
      '<div style="font-family:Unbounded,system-ui,sans-serif;font-size:13px;font-weight:900;color:#fff">' + esc(summary.rank.icon + ' ' + summary.rank.label + ' · уровень ' + summary.level) + '</div>' +
      '<div style="font-size:11px;color:#c7d2fe">' + summary.xp.toLocaleString('ru-RU') + ' XP</div>' +
      '</div>' +
      '<div style="height:10px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden"><div style="height:100%;width:' + summary.progress.pct + '%;border-radius:999px;background:linear-gradient(90deg,#fbbf24,#f472b6)"></div></div>' +
      '<div style="margin-top:6px;font-size:11px;color:#c7d2fe">До следующего уровня: ' + Math.max(0, summary.progress.nextXp - summary.xp).toLocaleString('ru-RU') + ' XP</div>';
    var statsGrid = card.children[1] || null;
    if (statsGrid && statsGrid.insertAdjacentElement) statsGrid.insertAdjacentElement('afterend', section);
    else card.appendChild(section);
  }

  function maybeShowToast(result){
    if (!root.document || !result || !result.delta) return;
    var toast = root.document.getElementById('wave66-xp-toast');
    if (!toast) {
      toast = root.document.createElement('div');
      toast.id = 'wave66-xp-toast';
      toast.className = 'wave66-toast';
      root.document.body.appendChild(toast);
    }
    toast.textContent = describeGain(result.state.lastReason, result.delta, result.state.lastLabel);
    toast.classList.add('on');
    clearTimeout(toast._tid);
    toast._tid = setTimeout(function(){ toast.classList.remove('on'); }, 1600);
  }

  function showLevelUp(summary){
    if (!root.document || root.document.getElementById('wave66-levelup')) return;
    var overlay = root.document.createElement('div');
    overlay.id = 'wave66-levelup';
    overlay.className = 'wave66-levelup-overlay';
    overlay.innerHTML = '<div class="wave66-levelup-card">' +
      '<div class="ttl">Новый уровень</div>' +
      '<div class="big">' + summary.level + '</div>' +
      '<div style="font-size:18px;font-weight:800">' + esc(summary.rank.icon + ' ' + summary.rank.label) + '</div>' +
      '<div class="sub">Продолжай серию: верные ответы, тренировки без подсказок и ровные стрики дают больше XP.</div>' +
      '</div>';
    overlay.addEventListener('click', function(){ overlay.remove(); });
    root.document.body.appendChild(overlay);
    if (typeof root.confetti === 'function') {
      try { root.confetti(60); } catch (_) {}
    }
    setTimeout(function(){ if (overlay && overlay.parentNode) overlay.remove(); }, 2400);
  }

  function patchAns(){
    if (!root.ans || root.__wave66AnsPatched) return;
    var original = root.ans;
    root.ans = function(index){
      var alreadySelected = false;
      try { alreadySelected = typeof sel !== 'undefined' && sel !== null; } catch (_) { alreadySelected = false; }
      if (alreadySelected) return original.apply(this, arguments);
      var beforeStreak = 0;
      try { beforeStreak = st && Number(st.streak || 0); } catch (_) { beforeStreak = 0; }
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
      if (isCorrect) {
        award('correct', { withHint: withHint, tag: tag, source: 'grade' });
        var afterStreak = 0;
        try { afterStreak = st && Number(st.streak || 0); } catch (_) { afterStreak = 0; }
        if (!withHint && afterStreak >= 5 && afterStreak % 5 === 0 && afterStreak !== beforeStreak) {
          award('streak5', { tag: tag, source: 'grade' });
        }
      }
      return out;
    };
    root.__wave66AnsPatched = true;
  }

  function patchHallOfFame(){
    if (!root.showHallOfFame || root.__wave66HallPatched) return;
    var original = root.showHallOfFame;
    root.showHallOfFame = function(){
      var out = original.apply(this, arguments);
      setTimeout(decorateHallOfFame, 0);
      return out;
    };
    root.__wave66HallPatched = true;
  }

  function patchPlayerBadge(){
    if (!root.renderPlayerBadge || root.__wave66BadgePatched) return;
    var original = root.renderPlayerBadge;
    root.renderPlayerBadge = function(){
      var out = original.apply(this, arguments);
      renderGradePanel();
      return out;
    };
    root.__wave66BadgePatched = true;
  }

  function patchBackup(){
    if (root.getBackupSnapshot && !root.__wave66BackupGetPatched) {
      var originalGet = root.getBackupSnapshot;
      root.getBackupSnapshot = function(){
        var snap = originalGet.apply(this, arguments);
        try { snap.xpState = loadState(); } catch (_) {}
        return snap;
      };
      root.__wave66BackupGetPatched = true;
    }
    if (root.applyBackupSnapshot && !root.__wave66BackupApplyPatched) {
      var originalApply = root.applyBackupSnapshot;
      root.applyBackupSnapshot = function(payload){
        var out = originalApply.apply(this, arguments);
        try {
          if (payload && payload.xpState) saveState(Object.assign(defaultState(), payload.xpState));
        } catch (_) {}
        dispatchUpdate({ state: loadState(), after: summarize() });
        return out;
      };
      root.__wave66BackupApplyPatched = true;
    }
  }

  function patchDiagnostic(){
    if (!root.addEventListener || root.__wave66DiagPatched) return;
    root.addEventListener('wave25-diagnostic-saved', function(ev){
      var entry = ev && ev.detail ? ev.detail : null;
      if (!entry || !entry.subjectId) return;
      var totalOk = Math.max(0, Number(entry.totalOk || 0));
      if (!totalOk) return;
      var before = summarize(loadState());
      var state = loadState();
      for (var i = 0; i < totalOk; i++) state = applyAward(state, 'correct', { withHint: false, tag: entry.subjectId, source: 'diagnostic' }).state;
      saveState(state);
      var after = summarize(state);
      dispatchUpdate({ state: state, before: before, after: after, delta: totalOk * CONFIG.xpCorrect, leveledUp: after.level > before.level });
      if (!isNode) {
        maybeShowToast({ delta: totalOk * CONFIG.xpCorrect, state: { lastReason: 'diagnostic' } });
        if (after.level > before.level) showLevelUp(after);
      }
    });
    root.__wave66DiagPatched = true;
  }

  function refreshUi(){
    ensureStyle();
    renderGradePanel();
    renderIndexCard();
    renderDashboardCard();
    decorateHallOfFame();
  }

  function init(){
    if (isNode || !root.document) return;
    ensureStyle();
    patchAns();
    patchHallOfFame();
    patchPlayerBadge();
    patchBackup();
    patchDiagnostic();
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', refreshUi, { once: true });
    } else {
      refreshUi();
    }
    root.addEventListener('wave66-xp-updated', function(){ setTimeout(refreshUi, 0); });
    root.addEventListener('dashboard-state-ready', function(){ setTimeout(renderDashboardCard, 0); });
  }

  function grantBonus(amount, label, meta){
    meta = Object.assign({}, meta || {}, { amount: amount, label: label || '', reason: (meta && meta.reason) || 'bonus' });
    return award('bonus', meta);
  }

  var api = {
    config: CONFIG,
    ranks: RANKS,
    thresholdForLevel: thresholdForLevel,
    levelForXp: levelForXp,
    rankForLevel: rankForLevel,
    progressForXp: progressForXp,
    defaultState: defaultState,
    loadState: loadState,
    saveState: saveState,
    summarize: summarize,
    applyAward: applyAward,
    award: award,
    grantBonus: grantBonus,
    refreshUi: refreshUi,
    init: init
  };

  init();
  return api;
});
//# sourceMappingURL=bundle_gamification_xp.907a25e6bd.js.map
