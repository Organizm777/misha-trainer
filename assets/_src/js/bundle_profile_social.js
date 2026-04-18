(function(root, factory){
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(root || globalThis, true);
  } else {
    root.wave68Profile = factory(root || window, false);
  }
})(typeof window !== 'undefined' ? window : globalThis, function(root, isNode){
  'use strict';

  var CONFIG = {
    key: 'trainer_profile_social_v1',
    cloudCacheKey: 'trainer_profile_social_cloud_cache_v1',
    cloudBinKey: 'trainer_cloud_bin_id',
    profileActiveKey: 'trainer35_active_profile_v1',
    profilesKey: 'trainer35_profiles_v1',
    profileScopePrefix: 'trainer35_scoped:',
    xpKey: 'trainer_xp_state_v1',
    metaKey: 'trainer_meta_state_v1',
    maxLeaderboard: 20,
    cloudTimeout: 6500,
    version: 68
  };

  var QR_PROVIDER = 'https://api.qrserver.com/v1/create-qr-code/';
  var STYLE_ID = 'wave68-profile-style';
  var TOAST_ID = 'wave68-profile-toast';
  var AVATARS = [
    { id:'fox', icon:'🦊', label:'Лис' },
    { id:'owl', icon:'🦉', label:'Сова' },
    { id:'rocket', icon:'🚀', label:'Ракета' },
    { id:'spark', icon:'✨', label:'Искра' },
    { id:'robot', icon:'🤖', label:'Робот' },
    { id:'lion', icon:'🦁', label:'Лев' },
    { id:'cat', icon:'🐱', label:'Кот' },
    { id:'panda', icon:'🐼', label:'Панда' },
    { id:'tiger', icon:'🐯', label:'Тигр' },
    { id:'whale', icon:'🐋', label:'Кит' },
    { id:'koala', icon:'🐨', label:'Коала' },
    { id:'dolphin', icon:'🐬', label:'Дельфин' },
    { id:'unicorn', icon:'🦄', label:'Единорог' },
    { id:'crown', icon:'👑', label:'Корона' },
    { id:'medal', icon:'🏅', label:'Медаль' },
    { id:'star', icon:'⭐', label:'Звезда' },
    { id:'comet', icon:'☄️', label:'Комета' },
    { id:'palette', icon:'🎨', label:'Палитра' },
    { id:'book', icon:'📘', label:'Книга' },
    { id:'bulb', icon:'💡', label:'Идея' }
  ];

  var SUBJECT_LABELS = {
    math: 'Математика', mathall: 'Математика', algebra: 'Алгебра', geometry: 'Геометрия',
    rus: 'Русский', russian: 'Русский', eng: 'Английский', english: 'Английский',
    phys: 'Физика', physics: 'Физика', chem: 'Химия', chemistry: 'Химия', biology: 'Биология',
    geo: 'География', geography: 'География', history: 'История', social: 'Обществознание',
    lit: 'Литература', literature: 'Литература', info: 'Информатика', informatics: 'Информатика',
    diplomacy: 'Дипломатия', construction: 'Строительство', procurement: 'Закупки',
    management: 'Управление', gkh: 'ЖКХ', psychology: 'Психология'
  };

  var storage = {
    get: function(key){
      try { return root.localStorage ? root.localStorage.getItem(key) : null; } catch (_) { return null; }
    },
    set: function(key, value){
      try { if (root.localStorage) root.localStorage.setItem(key, String(value)); } catch (_) {}
    },
    remove: function(key){
      try { if (root.localStorage) root.localStorage.removeItem(key); } catch (_) {}
    }
  };

  var liveClockProfile = '';
  var liveClockStartedAt = 0;

  function hasOwn(obj, key){ return Object.prototype.hasOwnProperty.call(obj || {}, key); }
  function asObj(value){ return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function toNum(value){ return Number(value || 0) || 0; }
  function esc(text){
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function nowIso(){ return new Date().toISOString(); }
  function safeParse(raw, fallback){ try { return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; } }
  function stripUrl(){ try { return String(root.location.href || '').replace(/[?#].*$/, ''); } catch (_) { return ''; } }
  function base64UrlEncode(text){
    var src = typeof text === 'string' ? text : JSON.stringify(text || {});
    try {
      if (typeof Buffer !== 'undefined' && Buffer.from) return Buffer.from(src, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'');
    } catch (_) {}
    try { return btoa(unescape(encodeURIComponent(src))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); } catch (_) { return src; }
  }
  function base64UrlDecode(text){
    var raw = String(text || '').replace(/-/g,'+').replace(/_/g,'/');
    while (raw.length % 4) raw += '=';
    try {
      if (typeof Buffer !== 'undefined' && Buffer.from) return Buffer.from(raw, 'base64').toString('utf8');
    } catch (_) {}
    try { return decodeURIComponent(escape(atob(raw))); } catch (_) { return raw; }
  }
  function hashText(text){
    var str = String(text || '');
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return (h >>> 0).toString(36).toUpperCase();
  }

  function activeProfileId(){
    try {
      if (root.wave35Debug && typeof root.wave35Debug.activeProfileId === 'function') return String(root.wave35Debug.activeProfileId() || 'p1');
    } catch (_) {}
    return storage.get(CONFIG.profileActiveKey) || 'p1';
  }
  function scopedKey(baseKey, profileId){ return CONFIG.profileScopePrefix + (profileId || activeProfileId()) + ':' + baseKey; }
  function loadProfiles(){
    try {
      if (root.wave35Debug && typeof root.wave35Debug.profiles === 'function') {
        var rows = root.wave35Debug.profiles();
        if (Array.isArray(rows) && rows.length) return rows;
      }
    } catch (_) {}
    return safeParse(storage.get(CONFIG.profilesKey), []);
  }
  function activeProfileName(){
    try {
      if (root.wave35Debug && typeof root.wave35Debug.activeProfile === 'function') {
        var current = root.wave35Debug.activeProfile();
        if (current && current.name) return String(current.name);
      }
    } catch (_) {}
    var rows = loadProfiles();
    var id = activeProfileId();
    for (var i = 0; i < rows.length; i++) if (rows[i] && rows[i].id === id) return String(rows[i].name || 'Ученик');
    return 'Ученик';
  }

  function avatarById(id){
    for (var i = 0; i < AVATARS.length; i++) if (AVATARS[i].id === id) return AVATARS[i];
    return AVATARS[1];
  }

  function defaultState(){
    return {
      avatarId: 'owl',
      tagline: '',
      trackedMs: 0,
      shareCount: 0,
      syncCount: 0,
      lastSyncAt: '',
      publicCode: '',
      lastLeaderboard: [],
      updatedAt: ''
    };
  }

  function normalizeState(state){
    state = Object.assign(defaultState(), asObj(state));
    state.avatarId = avatarById(state.avatarId).id;
    state.tagline = String(state.tagline || '').trim().slice(0, 48);
    state.trackedMs = Math.max(0, Math.round(toNum(state.trackedMs)));
    state.shareCount = Math.max(0, Math.round(toNum(state.shareCount)));
    state.syncCount = Math.max(0, Math.round(toNum(state.syncCount)));
    state.lastSyncAt = String(state.lastSyncAt || '');
    state.publicCode = String(state.publicCode || '');
    state.updatedAt = String(state.updatedAt || '');
    state.lastLeaderboard = Array.isArray(state.lastLeaderboard) ? state.lastLeaderboard.slice(0, CONFIG.maxLeaderboard) : [];
    return state;
  }

  function loadState(profileId){
    var raw = storage.get(scopedKey(CONFIG.key, profileId)) || storage.get(CONFIG.key);
    var state = normalizeState(safeParse(raw, defaultState()));
    if (!state.publicCode) {
      state.publicCode = publicCodeFor(profileId || activeProfileId(), activeProfileName());
      saveState(state, profileId);
    }
    return state;
  }
  function saveState(state, profileId){
    var normalized = normalizeState(state);
    if (!normalized.publicCode) normalized.publicCode = publicCodeFor(profileId || activeProfileId(), activeProfileName());
    normalized.updatedAt = nowIso();
    storage.set(scopedKey(CONFIG.key, profileId), JSON.stringify(normalized));
    return normalized;
  }

  function loadScopedRawJson(baseKey, profileId, fallback){ return safeParse(storage.get(scopedKey(baseKey, profileId)) || storage.get(baseKey), fallback); }
  function loadXpState(){
    try { if (root.wave66Xp && typeof root.wave66Xp.loadState === 'function') return root.wave66Xp.loadState(); } catch (_) {}
    return asObj(loadScopedRawJson(CONFIG.xpKey, activeProfileId(), {}));
  }
  function loadXpSummary(){
    try { if (root.wave66Xp && typeof root.wave66Xp.summarize === 'function') return root.wave66Xp.summarize(); } catch (_) {}
    var state = loadXpState();
    var answered = Math.max(0, toNum(state.answered));
    var correct = Math.max(0, toNum(state.correct));
    var hintCorrect = Math.max(0, toNum(state.hintCorrect));
    var wrong = Math.max(0, toNum(state.wrong));
    return {
      xp: Math.max(0, toNum(state.xp)),
      level: 1,
      rank: { label: 'Новичок', icon: '🌱' },
      answered: answered,
      correct: correct,
      hintCorrect: hintCorrect,
      wrong: wrong,
      diagnosticsDone: Math.max(0, toNum(state.diagnosticsDone)),
      topicsCompleted: Math.max(0, toNum(state.topicsCompleted)),
      maxStreak: Math.max(0, toNum(state.maxStreak))
    };
  }
  function loadMetaState(){
    try { if (root.wave67Meta && typeof root.wave67Meta.loadState === 'function') return root.wave67Meta.loadState(); } catch (_) {}
    return asObj(loadScopedRawJson(CONFIG.metaKey, activeProfileId(), {}));
  }
  function loadMetaSnapshot(xpSummary){
    try {
      if (root.wave67Meta && typeof root.wave67Meta.snapshot === 'function') return root.wave67Meta.snapshot(root.wave67Meta.loadState(), xpSummary || loadXpSummary());
    } catch (_) {}
    var metaState = loadMetaState();
    return {
      unlockedCount: Object.keys(asObj(metaState.unlocked)).length,
      secretUnlocked: 0,
      totalCount: 35,
      daily: [],
      weekly: [],
      achievements: [],
      recent: []
    };
  }

  function publicCodeFor(profileId, name){ return hashText(String(profileId || '') + '|' + String(name || '') + '|trainer').slice(0, 8); }


  function drawRoundRect(ctx, x, y, w, h, r){
    r = Math.max(0, Math.min(r || 0, Math.min(w, h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function formatDuration(ms){
    var totalMin = Math.max(0, Math.round(toNum(ms) / 60000));
    if (totalMin < 60) return totalMin + ' мин';
    var hours = Math.floor(totalMin / 60);
    var mins = totalMin % 60;
    return hours + ' ч ' + mins + ' мин';
  }

  function subjectLabel(id){
    var key = String(id || '').toLowerCase();
    if (SUBJECT_LABELS[key]) return SUBJECT_LABELS[key];
    try {
      if (Array.isArray(root.SUBJ)) {
        for (var i = 0; i < root.SUBJ.length; i++) {
          var row = root.SUBJ[i];
          if (row && String(row.id || '').toLowerCase() === key) return row.nm || row.id;
        }
      }
    } catch (_) {}
    return id || '—';
  }

  function favoriteSubjectFrom(subjectStats){
    subjectStats = asObj(subjectStats);
    var best = null;
    Object.keys(subjectStats).forEach(function(id){
      var row = asObj(subjectStats[id]);
      var answers = Math.max(0, toNum(row.answers));
      var correct = Math.max(0, toNum(row.correct));
      if (!answers) return;
      if (!best || answers > best.answers || (answers === best.answers && correct > best.correct)) {
        best = { id: id, answers: answers, correct: correct };
      }
    });
    if (!best) return { id:'', label:'—', answers:0, correct:0 };
    return { id: best.id, label: subjectLabel(best.id), answers: best.answers, correct: best.correct };
  }

  function aggregateActivity(){
    var map = {};
    var keys = [];
    for (var grade = 1; grade <= 11; grade++) {
      keys.push('trainer_activity_' + grade);
      keys.push('m' + grade + '_activity');
      keys.push('trainer_daily_' + grade);
      keys.push('m' + grade + '_daily');
    }
    keys.forEach(function(key){
      var payload = safeParse(storage.get(key), null);
      if (Array.isArray(payload)) {
        payload.forEach(function(row){
          if (!row || !row.date) return;
          var date = String(row.date);
          if (!map[date]) map[date] = { total:0 };
          map[date].total += Math.max(0, toNum(row.total || (toNum(row.ok) + toNum(row.err))));
        });
      } else if (payload && payload.date) {
        if (!map[payload.date]) map[payload.date] = { total:0 };
        map[payload.date].total += Math.max(0, toNum(payload.ok) + toNum(payload.err));
      }
    });
    var activeDays = Object.keys(map).filter(function(date){ return toNum(map[date].total) > 0; }).length;
    return { activeDays: activeDays, totalByDay: map };
  }

  function currentTrackedMs(state){
    var value = Math.max(0, toNum((state || {}).trackedMs));
    if (!isNode && liveClockProfile === activeProfileId() && liveClockStartedAt > 0) value += Math.max(0, Date.now() - liveClockStartedAt);
    return value;
  }

  function buildProfileSummary(input){
    input = asObj(input);
    if (hasOwn(input, 'totalAnswers') && hasOwn(input, 'accuracyPct') && hasOwn(input, 'publicCode')) {
      var ready = Object.assign({}, input);
      ready.avatar = ready.avatar || avatarById(ready.avatarId);
      ready.rankLabel = ready.rankLabel || 'Новичок';
      ready.rankIcon = ready.rankIcon || '🌱';
      ready.timeLabel = ready.timeLabel || formatDuration(ready.trackedMs || 0);
      ready.recentAchievements = Array.isArray(ready.recentAchievements) ? ready.recentAchievements : [];
      return ready;
    }
    var profileState = normalizeState(input.profileState || loadState());
    var xpSummary = asObj(input.xpSummary || loadXpSummary());
    var xpState = asObj(input.xpState || loadXpState());
    var metaSnapshot = asObj(input.metaSnapshot || loadMetaSnapshot(xpSummary));
    var metaState = asObj(input.metaState || loadMetaState());
    var activity = asObj(input.activity || aggregateActivity());
    var avatar = avatarById(profileState.avatarId);
    var totalAnswers = Math.max(0, toNum(xpSummary.answered) || toNum((window.STR || {}).totalQs));
    var totalCorrect = Math.max(0, toNum(xpSummary.correct) + toNum(xpSummary.hintCorrect) || toNum((window.STR || {}).totalOk));
    var totalWrong = Math.max(0, totalAnswers - totalCorrect);
    var accuracyPct = totalAnswers ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    var favorite = favoriteSubjectFrom(asObj(xpState.subjectStats));
    var rank = asObj(xpSummary.rank);
    var trackedMs = currentTrackedMs(profileState);
    var profileId = input.profileId || activeProfileId();
    var name = String(input.name || activeProfileName() || 'Ученик');
    var publicCode = profileState.publicCode || publicCodeFor(profileId, name);
    return {
      profileId: profileId,
      name: name,
      avatarId: avatar.id,
      avatar: avatar,
      publicCode: publicCode,
      tagline: profileState.tagline || '',
      xp: Math.max(0, toNum(xpSummary.xp)),
      level: Math.max(1, toNum(xpSummary.level || ((root.wave66Xp && root.wave66Xp.levelForXp) ? root.wave66Xp.levelForXp(toNum(xpSummary.xp)) : 1))),
      rankLabel: String(rank.label || 'Новичок'),
      rankIcon: String(rank.icon || '🌱'),
      progressPct: Math.max(0, Math.min(100, toNum((xpSummary.progress || {}).pct))),
      totalAnswers: totalAnswers,
      totalCorrect: totalCorrect,
      totalWrong: totalWrong,
      accuracyPct: accuracyPct,
      favoriteSubjectId: favorite.id,
      favoriteSubject: favorite.label,
      favoriteAnswers: favorite.answers,
      trackedMs: trackedMs,
      timeLabel: formatDuration(trackedMs),
      achievementsCount: Math.max(0, toNum(metaSnapshot.unlockedCount)),
      secretAchievements: Math.max(0, toNum(metaSnapshot.secretUnlocked)),
      diagnosticsDone: Math.max(0, toNum(xpSummary.diagnosticsDone)),
      topicsCompleted: Math.max(0, toNum(xpSummary.topicsCompleted)),
      missionDays: Math.max(0, toNum(metaState.missionDays)),
      weekWins: Math.max(0, toNum(metaState.weekWins)),
      bestCombo: Math.max(0, toNum(metaState.bestCombo)),
      bestStreak: Math.max(0, toNum(xpSummary.maxStreak)),
      activeDays: Math.max(0, toNum(activity.activeDays)),
      shareCount: Math.max(0, toNum(profileState.shareCount)),
      syncCount: Math.max(0, toNum(profileState.syncCount)),
      lastSyncAt: profileState.lastSyncAt || '',
      recentAchievements: Array.isArray(xpSummary.recentAchievements) ? xpSummary.recentAchievements.slice(0, 4) : []
    };
  }

  function buildPublicSnapshot(summary){
    summary = buildProfileSummary(summary);
    return {
      v: CONFIG.version,
      code: summary.publicCode,
      profileId: summary.profileId,
      name: summary.name,
      avatarId: summary.avatarId,
      level: summary.level,
      xp: summary.xp,
      rank: summary.rankLabel,
      rankIcon: summary.rankIcon,
      stats: {
        answers: summary.totalAnswers,
        accuracyPct: summary.accuracyPct,
        favoriteSubject: summary.favoriteSubject,
        timeLabel: summary.timeLabel,
        achievements: summary.achievementsCount,
        diagnostics: summary.diagnosticsDone,
        topics: summary.topicsCompleted,
        missionDays: summary.missionDays,
        weekWins: summary.weekWins,
        bestCombo: summary.bestCombo,
        bestStreak: summary.bestStreak,
        activeDays: summary.activeDays
      },
      generatedAt: nowIso()
    };
  }

  function encodeSnapshot(snapshot){ return base64UrlEncode(JSON.stringify(snapshot || {})); }
  function decodeSnapshot(payload){
    try { return JSON.parse(base64UrlDecode(payload)); } catch (_) { return null; }
  }
  function buildProfileLink(summary){ return stripUrl() + '#profile=' + encodeSnapshot(buildPublicSnapshot(summary)); }

  function sortProfiles(rows){
    return (Array.isArray(rows) ? rows.slice() : []).sort(function(a, b){
      a = asObj(a); b = asObj(b);
      return toNum(b.xp) - toNum(a.xp)
        || toNum(b.level) - toNum(a.level)
        || toNum(b.accuracyPct) - toNum(a.accuracyPct)
        || toNum(b.answers) - toNum(a.answers)
        || String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
    });
  }

  function leaderboardEntryFromSummary(summary){
    summary = buildProfileSummary(summary);
    return {
      code: summary.publicCode,
      profileId: summary.profileId,
      name: summary.name,
      avatarId: summary.avatarId,
      level: summary.level,
      xp: summary.xp,
      accuracyPct: summary.accuracyPct,
      answers: summary.totalAnswers,
      achievements: summary.achievementsCount,
      favoriteSubject: summary.favoriteSubject,
      updatedAt: nowIso()
    };
  }

  function mergeCloudDoc(doc, entry){
    doc = Object.assign({}, asObj(doc));
    var profiles = Array.isArray(doc.profiles) ? doc.profiles.slice() : [];
    var next = null;
    entry = Object.assign({}, asObj(entry));
    for (var i = 0; i < profiles.length; i++) {
      var row = asObj(profiles[i]);
      if ((entry.code && row.code === entry.code) || (entry.profileId && row.profileId === entry.profileId)) {
        next = Object.assign({}, row, entry);
        profiles[i] = next;
        next = null;
        break;
      }
    }
    if (next === null) {
      var found = false;
      for (var j = 0; j < profiles.length; j++) {
        var existing = asObj(profiles[j]);
        if ((entry.code && existing.code === entry.code) || (entry.profileId && existing.profileId === entry.profileId)) {
          found = true;
          break;
        }
      }
      if (!found) profiles.push(entry);
    }
    doc.profiles = sortProfiles(profiles).slice(0, 100);
    return doc;
  }

  function privateModeEnabled(){
    try { if (typeof root.getPrivateMode === 'function') return !!root.getPrivateMode(); } catch (_) {}
    var value = storage.get('trainer_private');
    return value === null || value === '1';
  }

  function cloudBinId(){ return String(root.rushBinId || root.RUSH_BIN_ID || storage.get(CONFIG.cloudBinKey) || ''); }
  function localFallbackLeaderboard(summary){
    var state = loadState();
    var rows = Array.isArray(state.lastLeaderboard) && state.lastLeaderboard.length ? state.lastLeaderboard.slice() : [leaderboardEntryFromSummary(summary || buildProfileSummary())];
    return sortProfiles(rows).slice(0, CONFIG.maxLeaderboard);
  }

  function fetchWithTimeout(url, options, timeoutMs){
    if (typeof fetch !== 'function') return Promise.reject(new Error('fetch unavailable'));
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = null;
    options = options || {};
    if (controller) {
      options.signal = controller.signal;
      timer = setTimeout(function(){ try { controller.abort(); } catch (_) {} }, timeoutMs || CONFIG.cloudTimeout);
    }
    return fetch(url, options).then(function(response){ if (timer) clearTimeout(timer); return response; }, function(error){ if (timer) clearTimeout(timer); throw error; });
  }

  function cacheLeaderboard(rows){
    var state = loadState();
    state.lastLeaderboard = sortProfiles(rows).slice(0, CONFIG.maxLeaderboard);
    saveState(state);
  }

  function updateSelfMeta(patch){
    var state = loadState();
    Object.keys(asObj(patch)).forEach(function(key){ state[key] = patch[key]; });
    return saveState(state);
  }

  function loadLeaderboard(){
    var summary = buildProfileSummary();
    if (privateModeEnabled() || !cloudBinId() || typeof fetch !== 'function') return Promise.resolve({ ok:false, reason: privateModeEnabled() ? 'private' : 'no-cloud', profiles: localFallbackLeaderboard(summary) });
    var url = 'https://api.npoint.io/' + cloudBinId();
    return fetchWithTimeout(url, null, CONFIG.cloudTimeout).then(function(response){ return response.json(); }).then(function(doc){
      var rows = sortProfiles((doc && doc.profiles) || []).slice(0, CONFIG.maxLeaderboard);
      if (!rows.length) rows = localFallbackLeaderboard(summary);
      cacheLeaderboard(rows);
      return { ok:true, profiles: rows };
    }).catch(function(){ return { ok:false, reason:'network', profiles: localFallbackLeaderboard(summary) }; });
  }

  function syncProfileToCloud(){
    var summary = buildProfileSummary();
    if (privateModeEnabled()) return Promise.resolve({ ok:false, reason:'private', profiles: localFallbackLeaderboard(summary) });
    if (!cloudBinId() || typeof fetch !== 'function') return Promise.resolve({ ok:false, reason:'no-cloud', profiles: localFallbackLeaderboard(summary) });
    var url = 'https://api.npoint.io/' + cloudBinId();
    var entry = leaderboardEntryFromSummary(summary);
    return fetchWithTimeout(url, null, CONFIG.cloudTimeout).then(function(response){ return response.json(); }).catch(function(){ return {}; }).then(function(doc){
      var merged = mergeCloudDoc(doc, entry);
      return fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      }, CONFIG.cloudTimeout).then(function(){
        updateSelfMeta({ syncCount: loadState().syncCount + 1, lastSyncAt: nowIso(), lastLeaderboard: sortProfiles(merged.profiles).slice(0, CONFIG.maxLeaderboard) });
        return { ok:true, profiles: sortProfiles(merged.profiles).slice(0, CONFIG.maxLeaderboard) };
      });
    }).catch(function(){ return { ok:false, reason:'network', profiles: localFallbackLeaderboard(summary) }; });
  }

  function recentAchievementsHtml(summary, dark){
    var rows = Array.isArray(summary.recentAchievements) ? summary.recentAchievements.slice(0, 4) : [];
    if (!rows.length) return '<div class="wave68-muted">Пока без новых достижений — продолжай серию.</div>';
    return rows.map(function(item){
      return '<span class="wave68-chip' + (dark ? ' dark' : '') + '">' + esc(item.icon || '🏆') + ' ' + esc(item.title || item.id || 'Достижение') + '</span>';
    }).join('');
  }

  function ensureStyle(){
    if (isNode || !root.document || root.document.getElementById(STYLE_ID)) return;
    var style = root.document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave68-card{margin:10px 0;padding:14px;border:1px solid var(--border,#e5e7eb);border-radius:16px;background:var(--card,#fff);box-shadow:0 10px 30px rgba(15,23,42,.05)}',
      '.wave68-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between}',
      '.wave68-avatar{width:54px;height:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;background:linear-gradient(135deg,#dbeafe,#ede9fe);flex-shrink:0}',
      '.wave68-name{font-family:Unbounded,system-ui,sans-serif;font-size:14px;font-weight:900;line-height:1.25}',
      '.wave68-sub{font-size:11px;color:var(--muted,#6b7280);line-height:1.45;margin-top:4px}',
      '.wave68-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
      '.wave68-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(37,99,235,.08);color:#1d4ed8;font-size:11px;font-weight:800;border:1px solid rgba(37,99,235,.1)}',
      '.wave68-chip.dark{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.12)}',
      '.wave68-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}',
      '.wave68-kpi{padding:10px;border-radius:12px;background:var(--bg,#f8fafc);border:1px solid var(--border,#e5e7eb)}',
      '.wave68-kpi b{display:block;font-family:Unbounded,system-ui,sans-serif;font-size:14px;line-height:1.1}',
      '.wave68-kpi span{display:block;font-size:10px;color:var(--muted,#6b7280);margin-top:4px}',
      '.wave68-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}',
      '.wave68-btn{flex:1 1 calc(33.333% - 6px);min-width:120px;padding:10px 12px;border-radius:12px;border:1px solid var(--border,#e5e7eb);background:var(--card,#fff);font:700 12px/1.2 Golos Text,system-ui,sans-serif;color:var(--text,#111827);cursor:pointer}',
      '.wave68-btn.accent{background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;border-color:transparent}',
      '.wave68-muted{font-size:11px;color:var(--muted,#6b7280);line-height:1.5}',
      '.wave68-holder{margin:10px 0}',
      '.wave68-overlay{position:fixed;inset:0;background:rgba(15,23,42,.56);backdrop-filter:blur(6px);z-index:10006;padding:18px calc(14px + env(safe-area-inset-right,0px)) calc(18px + env(safe-area-inset-bottom,0px)) calc(14px + env(safe-area-inset-left,0px));display:flex;align-items:flex-start;justify-content:center;overflow:auto}',
      '.wave68-overlay-card{width:min(100%,720px);margin-top:max(12px,env(safe-area-inset-top,0px));background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:18px;padding:16px;box-shadow:0 24px 60px rgba(15,23,42,.25)}',
      '.wave68-overlay-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}',
      '.wave68-overlay-title{font-family:Unbounded,system-ui,sans-serif;font-size:16px;font-weight:900;line-height:1.25}',
      '.wave68-close{width:38px;height:38px;border-radius:12px;border:1px solid var(--border,#e5e7eb);background:var(--bg,#f8fafc);font-size:18px;cursor:pointer}',
      '.wave68-avatar-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}',
      '.wave68-avatar-btn{padding:12px;border-radius:14px;border:1px solid var(--border,#e5e7eb);background:var(--card,#fff);font-size:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;min-height:70px}',
      '.wave68-avatar-btn.active{outline:2px solid #2563eb;border-color:#2563eb;background:#eef4ff}',
      '.wave68-row{display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.wave68-field{margin-top:10px}',
      '.wave68-field label{display:block;font-size:11px;color:var(--muted,#6b7280);margin-bottom:6px}',
      '.wave68-input{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border,#e5e7eb);background:var(--card,#fff);font:600 13px/1.2 Golos Text,system-ui,sans-serif;color:var(--text,#111827)}',
      '.wave68-qr-wrap{display:grid;grid-template-columns:280px 1fr;gap:16px;align-items:start}',
      '.wave68-qr-box{border:1px solid var(--border,#e5e7eb);border-radius:16px;padding:12px;background:#fff;display:flex;align-items:center;justify-content:center}',
      '.wave68-qr-box img{width:100%;max-width:256px;height:auto;display:block;image-rendering:pixelated}',
      '.wave68-code{width:100%;min-height:120px;border-radius:12px;border:1px solid var(--border,#e5e7eb);padding:10px 12px;font:12px/1.45 JetBrains Mono,monospace;background:var(--bg,#f8fafc);color:var(--text,#111827)}',
      '.wave68-leader{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--border,#e5e7eb);border-radius:14px;background:var(--card,#fff);margin-top:8px}',
      '.wave68-leader-left{display:flex;align-items:center;gap:10px;min-width:0}',
      '.wave68-leader-rank{width:28px;text-align:center;font:900 13px/1 Unbounded,system-ui,sans-serif;color:#2563eb}',
      '.wave68-leader-avatar{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;background:linear-gradient(135deg,#dbeafe,#ede9fe)}',
      '.wave68-leader-name{font-weight:800;font-size:13px;line-height:1.2}',
      '.wave68-leader-sub{font-size:10px;color:var(--muted,#6b7280);margin-top:4px}',
      '.wave68-leader-metric{text-align:right;font-size:11px;color:var(--muted,#6b7280)}',
      '.wave68-toast{position:fixed;left:50%;bottom:calc(102px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(10px);z-index:10008;padding:10px 14px;border-radius:999px;background:rgba(15,23,42,.96);color:#fff;font-size:12px;font-weight:800;opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;max-width:min(92vw,420px);text-align:center;box-shadow:0 12px 28px rgba(0,0,0,.28)}',
      '.wave68-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}',
      '@media (max-width:800px){.wave68-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.wave68-qr-wrap{grid-template-columns:1fr}.wave68-avatar-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}',
      '@media (max-width:520px){.wave68-actions{flex-direction:column}.wave68-btn{min-width:0;flex:1 1 auto}.wave68-avatar-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}'
    ].join('');
    root.document.head.appendChild(style);
  }

  function toast(message){
    if (isNode || !root.document || !message) return;
    ensureStyle();
    var node = root.document.getElementById(TOAST_ID);
    if (!node) {
      node = root.document.createElement('div');
      node.id = TOAST_ID;
      node.className = 'wave68-toast';
      root.document.body.appendChild(node);
    }
    node.textContent = String(message);
    node.className = 'wave68-toast on';
    clearTimeout(node._tid);
    node._tid = setTimeout(function(){ node.className = 'wave68-toast'; }, 1800);
  }

  function overlay(title, subtitle){
    ensureStyle();
    var wrap = root.document.createElement('div');
    wrap.className = 'wave68-overlay';
    wrap.innerHTML = '<div class="wave68-overlay-card"><div class="wave68-overlay-head"><div><div class="wave68-overlay-title">' + esc(title || '') + '</div>' + (subtitle ? '<div class="wave68-sub" style="margin-top:6px">' + esc(subtitle) + '</div>' : '') + '</div><button type="button" class="wave68-close" aria-label="Закрыть">×</button></div><div class="wave68-overlay-body"></div></div>';
    wrap.querySelector('.wave68-close').addEventListener('click', function(){ wrap.remove(); });
    wrap.addEventListener('click', function(ev){ if (ev.target === wrap) wrap.remove(); });
    root.document.body.appendChild(wrap);
    return { wrap: wrap, body: wrap.querySelector('.wave68-overlay-body') };
  }

  function cardHtml(summary, compact){
    summary = buildProfileSummary(summary);
    return '<div class="wave68-card">'
      + '<div class="wave68-head">'
      + '<div style="display:flex;gap:12px;min-width:0"><div class="wave68-avatar">' + esc(summary.avatar.icon) + '</div><div style="min-width:0">'
      + '<div class="wave68-name">' + esc(summary.name) + '</div>'
      + '<div class="wave68-sub">' + esc(summary.rankIcon + ' ' + summary.rankLabel + ' · уровень ' + summary.level + ' · ' + summary.xp + ' XP') + '</div>'
      + '<div class="wave68-sub">Код профиля: <b>' + esc(summary.publicCode) + '</b>' + (summary.tagline ? ' · ' + esc(summary.tagline) : '') + '</div>'
      + '</div></div>'
      + '<div class="wave68-chip">' + (summary.totalAnswers === 0 ? '—' : summary.accuracyPct + '%') + ' точность</div>'
      + '</div>'
      + '<div class="wave68-grid">'
      + '<div class="wave68-kpi"><b>' + summary.totalAnswers + '</b><span>решено вопросов</span></div>'
      + '<div class="wave68-kpi"><b>' + esc(summary.favoriteSubject) + '</b><span>любимый предмет</span></div>'
      + '<div class="wave68-kpi"><b>' + esc(summary.timeLabel) + '</b><span>время в приложении</span></div>'
      + '<div class="wave68-kpi"><b>' + summary.achievementsCount + '</b><span>достижений</span></div>'
      + '</div>'
      + (compact ? '' : '<div class="wave68-badges">'
        + '<span class="wave68-chip">🩺 Диагностик: ' + summary.diagnosticsDone + '</span>'
        + '<span class="wave68-chip">🗺 Тем: ' + summary.topicsCompleted + '</span>'
        + '<span class="wave68-chip">🔥 Лучшая серия: ' + summary.bestStreak + '</span>'
        + '<span class="wave68-chip">✨ Комбо: ' + summary.bestCombo + '</span>'
        + '</div>')
      + '<div class="wave68-badges" style="margin-top:10px">' + recentAchievementsHtml(summary, false) + '</div>'
      + '<div class="wave68-actions">'
      + '<button type="button" class="wave68-btn" data-wave68-action="avatar">🧑 Аватар</button>'
      + '<button type="button" class="wave68-btn" data-wave68-action="qr">📱 QR</button>'
      + '<button type="button" class="wave68-btn" data-wave68-action="png">🖼 PNG</button>'
      + '<button type="button" class="wave68-btn" data-wave68-action="leaders">🏁 Лидеры</button>'
      + '<button type="button" class="wave68-btn accent" data-wave68-action="sync">☁️ Синхр.</button>'
      + '</div>'
      + '</div>';
  }

  function attachActionHandlers(host){
    if (!host) return;
    Array.prototype.slice.call(host.querySelectorAll('[data-wave68-action]')).forEach(function(btn){
      if (btn.__wave68Bound) return;
      btn.__wave68Bound = true;
      btn.addEventListener('click', function(){
        var action = btn.getAttribute('data-wave68-action');
        if (action === 'avatar') openAvatarPicker();
        else if (action === 'qr') showProfileQr();
        else if (action === 'png') downloadProfilePng();
        else if (action === 'leaders') showLeaderboard();
        else if (action === 'sync') syncProfileToCloud().then(function(result){
          if (result.ok) toast('Профиль синхронизирован');
          else if (result.reason === 'private') toast('Сначала выключи приватный режим');
          else if (result.reason === 'no-cloud') toast('Не настроен облачный бин');
          else toast('Не удалось синхронизировать');
        });
      });
    });
  }

  function openAvatarPicker(){
    if (isNode || !root.document) return;
    var state = loadState();
    var ui = overlay('Аватар и подпись', 'Выбери один из 20 аватаров для активного профиля.');
    var summary = buildProfileSummary();
    ui.body.innerHTML = '<div class="wave68-card" style="margin-top:0">'
      + '<div class="wave68-head"><div style="display:flex;gap:12px;align-items:center"><div class="wave68-avatar" id="wave68-avatar-preview">' + esc(summary.avatar.icon) + '</div><div><div class="wave68-name">' + esc(summary.name) + '</div><div class="wave68-sub">Код профиля: <b>' + esc(summary.publicCode) + '</b></div></div></div><div class="wave68-chip">уровень ' + summary.level + '</div></div>'
      + '<div class="wave68-field"><label>Короткая подпись</label><input class="wave68-input" id="wave68-tagline" maxlength="48" placeholder="Например: Готов к рывку" value="' + esc(state.tagline || '') + '"></div>'
      + '<div class="wave68-field"><label>Аватары</label><div class="wave68-avatar-grid" id="wave68-avatar-grid">'
      + AVATARS.map(function(row){ return '<button type="button" class="wave68-avatar-btn' + (row.id === state.avatarId ? ' active' : '') + '" data-avatar-id="' + esc(row.id) + '" aria-label="' + esc(row.label) + '">' + esc(row.icon) + '</button>'; }).join('')
      + '</div></div>'
      + '<div class="wave68-actions"><button type="button" class="wave68-btn accent" id="wave68-save-avatar">Сохранить</button><button type="button" class="wave68-btn" id="wave68-copy-code">Скопировать код</button></div>'
      + '</div>';
    var selected = state.avatarId;
    Array.prototype.slice.call(ui.body.querySelectorAll('[data-avatar-id]')).forEach(function(btn){
      btn.addEventListener('click', function(){
        selected = btn.getAttribute('data-avatar-id') || 'owl';
        Array.prototype.slice.call(ui.body.querySelectorAll('[data-avatar-id]')).forEach(function(node){ node.classList.toggle('active', node === btn); });
        ui.body.querySelector('#wave68-avatar-preview').textContent = avatarById(selected).icon;
      });
    });
    ui.body.querySelector('#wave68-save-avatar').addEventListener('click', function(){
      var next = loadState();
      next.avatarId = selected;
      next.tagline = String(ui.body.querySelector('#wave68-tagline').value || '').trim().slice(0, 48);
      saveState(next);
      refreshUi();
      toast('Профиль обновлён');
      ui.wrap.remove();
    });
    ui.body.querySelector('#wave68-copy-code').addEventListener('click', function(){ copyText(summary.publicCode, 'Код профиля скопирован'); });
  }

  function qrImageSrc(text, size){
    var n = Math.max(160, Math.min(512, toNum(size) || 280));
    return QR_PROVIDER + '?size=' + n + 'x' + n + '&margin=0&data=' + encodeURIComponent(String(text || ''));
  }

  function copyText(text, successMessage){
    if (!text) return;
    if (root.navigator && root.navigator.clipboard && typeof root.navigator.clipboard.writeText === 'function') {
      root.navigator.clipboard.writeText(String(text)).then(function(){ if (successMessage) toast(successMessage); }).catch(function(){ try { root.prompt('Скопируй:', String(text)); } catch (_) {} });
      return;
    }
    try { root.prompt('Скопируй:', String(text)); } catch (_) {}
  }

  function showProfileQr(){
    if (isNode || !root.document) return;
    var summary = buildProfileSummary();
    var link = buildProfileLink(summary);
    var ui = overlay('QR профиля', 'Покажи код другу или открой на другом устройстве для сравнения.');
    ui.body.innerHTML = '<div class="wave68-qr-wrap"><div class="wave68-qr-box"><img alt="QR профиля" src="' + esc(qrImageSrc(link, 280)) + '"></div><div>'
      + '<div class="wave68-card" style="margin-top:0">' + cardHtml(summary, true) + '</div>'
      + '<div class="wave68-field"><label>Ссылка профиля</label><textarea class="wave68-code" readonly>' + esc(link) + '</textarea></div>'
      + '<div class="wave68-actions"><button type="button" class="wave68-btn accent" id="wave68-copy-link">📋 Скопировать ссылку</button><button type="button" class="wave68-btn" id="wave68-copy-code2">🔑 Скопировать код</button></div>'
      + '</div></div>';
    attachActionHandlers(ui.body);
    ui.body.querySelector('#wave68-copy-link').addEventListener('click', function(){
      var state = loadState();
      state.shareCount += 1;
      saveState(state);
      copyText(link, 'Ссылка профиля скопирована');
    });
    ui.body.querySelector('#wave68-copy-code2').addEventListener('click', function(){ copyText(summary.publicCode, 'Код профиля скопирован'); });
  }

  function buildProfilePngCanvas(summary){
    summary = buildProfileSummary(summary);
    if (isNode || !root.document) return null;
    var canvas = root.document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    var grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.arc(1040, 120, 120, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(140, 540, 100, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px Unbounded, sans-serif';
    ctx.fillText(summary.name, 120, 100);
    ctx.font = '700 24px Golos Text, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fillText(summary.rankIcon + ' ' + summary.rankLabel + ' · уровень ' + summary.level + ' · ' + summary.xp + ' XP', 120, 146);

    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    drawRoundRect(ctx, 120, 180, 180, 180, 28);
    ctx.fill();
    ctx.font = '900 108px Apple Color Emoji, Segoe UI Emoji, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(summary.avatar.icon, 210, 300);
    ctx.textAlign = 'left';

    var cards = [
      { x: 340, y: 190, w: 220, h: 110, value: summary.totalAnswers, label: 'решено вопросов' },
      { x: 580, y: 190, w: 220, h: 110, value: summary.accuracyPct + '%', label: 'точность' },
      { x: 820, y: 190, w: 220, h: 110, value: summary.achievementsCount, label: 'достижений' },
      { x: 340, y: 320, w: 220, h: 110, value: summary.favoriteSubject, label: 'любимый предмет' },
      { x: 580, y: 320, w: 220, h: 110, value: summary.timeLabel, label: 'время в приложении' },
      { x: 820, y: 320, w: 220, h: 110, value: summary.bestStreak, label: 'лучшая серия' }
    ];
    cards.forEach(function(card){
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      drawRoundRect(ctx, card.x, card.y, card.w, card.h, 24);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 30px Unbounded, sans-serif';
      ctx.fillText(String(card.value), card.x + 20, card.y + 48);
      ctx.font = '700 16px Golos Text, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      ctx.fillText(card.label, card.x + 20, card.y + 78);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    drawRoundRect(ctx, 120, 470, 920, 100, 24);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px Unbounded, sans-serif';
    ctx.fillText('Профиль ученика · код ' + summary.publicCode, 150, 515);
    ctx.font = '700 18px Golos Text, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    var line = 'Диагностик: ' + summary.diagnosticsDone + ' · тем: ' + summary.topicsCompleted + ' · активных дней: ' + summary.activeDays + ' · неделя побед: ' + summary.weekWins;
    ctx.fillText(line, 150, 550);
    if (summary.recentAchievements && summary.recentAchievements.length) {
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.font = '700 16px Golos Text, sans-serif';
      ctx.fillText('Недавние достижения: ' + summary.recentAchievements.map(function(item){ return (item.icon || '🏆') + ' ' + (item.title || item.id); }).join(' · '), 150, 580);
    }
    return canvas;
  }

  function downloadProfilePng(){
    if (isNode || !root.document) return;
    var summary = buildProfileSummary();
    var canvas = buildProfilePngCanvas(summary);
    if (!canvas) return;
    var state = loadState();
    state.shareCount += 1;
    saveState(state);
    if (canvas.toBlob) {
      canvas.toBlob(function(blob){
        if (!blob) return;
        var fileName = 'trainer_profile_' + summary.publicCode + '.png';
        var file = null;
        try { file = new File([blob], fileName, { type:'image/png' }); } catch (_) {}
        if (root.navigator && root.navigator.share && file && (!root.navigator.canShare || root.navigator.canShare({ files:[file] }))) {
          root.navigator.share({ title:'Профиль ученика', text:'Мой профиль в тренажёре', files:[file] }).catch(function(){ downloadBlob(fileName, blob); });
        } else downloadBlob(fileName, blob);
      }, 'image/png');
    }
  }

  function downloadBlob(fileName, blob){
    if (isNode || !root.document || !blob) return;
    var url = URL.createObjectURL(blob);
    var a = root.document.createElement('a');
    a.href = url;
    a.download = fileName;
    root.document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1200);
  }

  function leaderboardHtml(rows, selfCode){
    rows = sortProfiles(rows).slice(0, CONFIG.maxLeaderboard);
    if (!rows.length) return '<div class="wave68-muted">Лидеров пока нет. Синхронизируй первый профиль и задай темп.</div>';
    return rows.map(function(row, index){
      row = asObj(row);
      var avatar = avatarById(row.avatarId).icon;
      var isSelf = row.code === selfCode;
      return '<div class="wave68-leader"' + (isSelf ? ' style="border-color:#2563eb;box-shadow:0 0 0 1px rgba(37,99,235,.18) inset"' : '') + '>'
        + '<div class="wave68-leader-left"><div class="wave68-leader-rank">' + (index + 1) + '</div><div class="wave68-leader-avatar">' + esc(avatar) + '</div><div style="min-width:0"><div class="wave68-leader-name">' + esc(row.name || 'Ученик') + (isSelf ? ' · это ты' : '') + '</div><div class="wave68-leader-sub">' + esc((row.favoriteSubject || '—') + ' · ' + (row.code || '')) + '</div></div></div>'
        + '<div class="wave68-leader-metric"><b style="display:block;color:var(--text,#111827)">' + toNum(row.xp) + ' XP</b><span>' + toNum(row.accuracyPct) + '% · ' + toNum(row.answers) + ' вопр.</span></div>'
        + '</div>';
    }).join('');
  }

  function showLeaderboard(){
    if (isNode || !root.document) return;
    var summary = buildProfileSummary();
    var ui = overlay('Таблица лидеров', 'Сравнение профилей через npoint.io. Если облако не настроено, показывается локальный кэш.');
    ui.body.innerHTML = '<div class="wave68-card" style="margin-top:0"><div class="wave68-row"><div class="wave68-name">Топ профилей</div><div class="wave68-chip">код ' + esc(summary.publicCode) + '</div></div><div class="wave68-sub">Сортировка: XP → уровень → точность → объём решённых вопросов.</div><div id="wave68-leaderboard-box" style="margin-top:10px">' + leaderboardHtml(localFallbackLeaderboard(summary), summary.publicCode) + '</div><div class="wave68-actions"><button type="button" class="wave68-btn accent" id="wave68-sync-now">Обновить из облака</button><button type="button" class="wave68-btn" id="wave68-copy-self">Скопировать код</button></div></div>';
    ui.body.querySelector('#wave68-copy-self').addEventListener('click', function(){ copyText(summary.publicCode, 'Код профиля скопирован'); });
    ui.body.querySelector('#wave68-sync-now').addEventListener('click', function(){
      syncProfileToCloud().then(function(syncRes){
        var rows = syncRes && syncRes.profiles ? syncRes.profiles : localFallbackLeaderboard(summary);
        ui.body.querySelector('#wave68-leaderboard-box').innerHTML = leaderboardHtml(rows, summary.publicCode);
        toast(syncRes.ok ? 'Лидеры обновлены' : (syncRes.reason === 'private' ? 'Открой публикацию результатов' : 'Показан локальный рейтинг'));
      });
    });
    loadLeaderboard().then(function(res){ ui.body.querySelector('#wave68-leaderboard-box').innerHTML = leaderboardHtml(res.profiles, summary.publicCode); });
  }

  function renderIndexCard(){
    if (isNode || !root.document || root.document.getElementById('s-main')) return;
    var anchor = root.document.getElementById('wave68-index-holder-anchor') || root.document.querySelector('.foot') || root.document.querySelector('.stats');
    if (!anchor) return;
    var holder = root.document.getElementById('wave68-index-holder');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave68-index-holder';
      holder.className = 'wave68-holder';
      anchor.parentNode.insertBefore(holder, anchor);
    }
    holder.innerHTML = cardHtml(buildProfileSummary(), true);
    attachActionHandlers(holder);
  }

  function renderDashboardCard(){
    if (isNode || !root.document || !root.document.getElementById('grades')) return;
    var hero = root.document.querySelector('.hero');
    if (!hero) return;
    var holder = root.document.getElementById('wave68-dashboard-holder');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave68-dashboard-holder';
      holder.className = 'wave68-holder';
      hero.insertAdjacentElement('afterend', holder);
    }
    holder.innerHTML = cardHtml(buildProfileSummary(), false);
    attachActionHandlers(holder);
    var nameEl = root.document.getElementById('name');
    if (nameEl) nameEl.textContent = buildProfileSummary().avatar.icon + ' ' + buildProfileSummary().name;
  }

  function decorateHallOfFame(){
    if (isNode || !root.document) return;
    var overlays = Array.prototype.slice.call(root.document.querySelectorAll('body > div[style*="position:fixed"], body > .wave68-overlay'));
    if (!overlays.length) return;
    var overlay = overlays[overlays.length - 1];
    if (!overlay || overlay.classList.contains('wave68-overlay')) return;
    var card = overlay.firstElementChild;
    if (!card || card.querySelector('.wave68-profile-hof')) return;
    var section = root.document.createElement('div');
    section.className = 'wave68-profile-hof';
    section.innerHTML = '<div class="wave68-card" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.14);color:#fff;box-shadow:none">'
      + '<div class="wave68-head"><div style="display:flex;gap:12px;align-items:center"><div class="wave68-avatar">' + esc(buildProfileSummary().avatar.icon) + '</div><div><div class="wave68-name" style="color:#fff">' + esc(buildProfileSummary().name) + '</div><div class="wave68-sub" style="color:#dbeafe">' + esc(buildProfileSummary().rankIcon + ' ' + buildProfileSummary().rankLabel + ' · код ' + buildProfileSummary().publicCode) + '</div></div></div><div class="wave68-chip dark">' + buildProfileSummary().xp + ' XP</div></div>'
      + '<div class="wave68-grid"><div class="wave68-kpi" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)"><b>' + buildProfileSummary().totalAnswers + '</b><span style="color:#dbeafe">вопросов</span></div><div class="wave68-kpi" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)"><b>' + buildProfileSummary().accuracyPct + '%</b><span style="color:#dbeafe">точность</span></div><div class="wave68-kpi" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)"><b>' + esc(buildProfileSummary().favoriteSubject) + '</b><span style="color:#dbeafe">любимый предмет</span></div><div class="wave68-kpi" style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)"><b>' + buildProfileSummary().achievementsCount + '</b><span style="color:#dbeafe">достижений</span></div></div>'
      + '<div class="wave68-actions"><button type="button" class="wave68-btn" data-wave68-action="avatar">🧑 Аватар</button><button type="button" class="wave68-btn" data-wave68-action="qr">📱 QR</button><button type="button" class="wave68-btn" data-wave68-action="leaders">🏁 Лидеры</button><button type="button" class="wave68-btn accent" data-wave68-action="sync">☁️ Синхр.</button></div>'
      + '</div>';
    var anchor = card.querySelector('.wave67-profile-meta') || card.querySelector('.wave66-profile-xp');
    if (anchor && anchor.insertAdjacentElement) anchor.insertAdjacentElement('afterend', section);
    else card.appendChild(section);
    attachActionHandlers(section);
  }

  function patchHallOfFame(){
    if (isNode || !root.showHallOfFame || root.__wave68HallPatched) return;
    var original = root.showHallOfFame;
    root.showHallOfFame = function(){
      var out = original.apply(this, arguments);
      setTimeout(decorateHallOfFame, 0);
      return out;
    };
    root.__wave68HallPatched = true;
  }

  function patchBackup(){
    if (root.getBackupSnapshot && !root.__wave68ProfileBackupGetPatched) {
      var originalGet = root.getBackupSnapshot;
      root.getBackupSnapshot = function(){
        var snap = originalGet.apply(this, arguments);
        try { snap.profileSocialState = loadState(); } catch (_) {}
        return snap;
      };
      root.__wave68ProfileBackupGetPatched = true;
    }
    if (root.applyBackupSnapshot && !root.__wave68ProfileBackupApplyPatched) {
      var originalApply = root.applyBackupSnapshot;
      root.applyBackupSnapshot = function(payload){
        var out = originalApply.apply(this, arguments);
        try { if (payload && payload.profileSocialState) saveState(payload.profileSocialState); } catch (_) {}
        setTimeout(refreshUi, 0);
        return out;
      };
      root.__wave68ProfileBackupApplyPatched = true;
    }
  }

  function parseProfileHash(){
    try {
      var hash = String(root.location.hash || '').replace(/^#/, '');
      if (!hash) return null;
      var parts = hash.split('&');
      for (var i = 0; i < parts.length; i++) {
        var pair = parts[i].split('=');
        if (pair[0] === 'profile') return decodeSnapshot(pair.slice(1).join('='));
      }
    } catch (_) {}
    return null;
  }

  function showSharedProfile(snapshot){
    if (isNode || !root.document || !snapshot) return;
    var local = buildProfileSummary();
    var avatar = avatarById(snapshot.avatarId || 'owl');
    var ui = overlay('Профиль по QR', 'Снимок прогресса можно сравнить с локальным профилем.');
    var localBetter = toNum(local.xp) > toNum(snapshot.xp) ? 'Ты впереди по XP' : (toNum(local.xp) < toNum(snapshot.xp) ? 'Друг впереди по XP' : 'По XP ничья');
    ui.body.innerHTML = '<div class="wave68-card" style="margin-top:0"><div class="wave68-row"><div class="wave68-name">' + esc(snapshot.name || 'Профиль') + '</div><div class="wave68-chip">' + esc(snapshot.code || '') + '</div></div>'
      + '<div class="wave68-head" style="margin-top:10px"><div style="display:flex;gap:12px;align-items:center"><div class="wave68-avatar">' + esc(avatar.icon) + '</div><div><div class="wave68-sub">' + esc((snapshot.rankIcon || '🌱') + ' ' + (snapshot.rank || 'Новичок') + ' · уровень ' + toNum(snapshot.level)) + '</div><div class="wave68-sub">' + esc(toNum(snapshot.xp) + ' XP · ' + toNum((snapshot.stats || {}).accuracyPct) + '% точность') + '</div></div></div><div class="wave68-chip">' + esc(localBetter) + '</div></div>'
      + '<div class="wave68-grid"><div class="wave68-kpi"><b>' + toNum((snapshot.stats || {}).answers) + '</b><span>решено вопросов</span></div><div class="wave68-kpi"><b>' + esc((snapshot.stats || {}).favoriteSubject || '—') + '</b><span>любимый предмет</span></div><div class="wave68-kpi"><b>' + esc((snapshot.stats || {}).timeLabel || '0 мин') + '</b><span>время в приложении</span></div><div class="wave68-kpi"><b>' + toNum((snapshot.stats || {}).achievements) + '</b><span>достижений</span></div></div>'
      + '<div class="wave68-muted" style="margin-top:10px">Снимок создан: ' + esc(new Date(snapshot.generatedAt || Date.now()).toLocaleString('ru-RU')) + '</div></div>';
  }

  function startLiveClock(){
    if (isNode || !root.document) return;
    if (root.document.hidden) return;
    if (liveClockStartedAt > 0 && liveClockProfile === activeProfileId()) return;
    liveClockProfile = activeProfileId();
    liveClockStartedAt = Date.now();
  }

  function stopLiveClock(){
    if (isNode || liveClockStartedAt <= 0) return;
    var state = loadState(liveClockProfile || activeProfileId());
    state.trackedMs += Math.max(0, Date.now() - liveClockStartedAt);
    saveState(state, liveClockProfile || activeProfileId());
    liveClockStartedAt = 0;
    liveClockProfile = '';
  }

  function installTimeTracking(){
    if (isNode || !root.document || root.__wave68TimeTracking) return;
    startLiveClock();
    root.document.addEventListener('visibilitychange', function(){ if (root.document.hidden) stopLiveClock(); else startLiveClock(); });
    root.addEventListener('pagehide', stopLiveClock);
    root.addEventListener('beforeunload', stopLiveClock);
    root.__wave68TimeTracking = true;
  }

  function refreshUi(){
    if (isNode || !root.document) return;
    ensureStyle();
    renderIndexCard();
    renderDashboardCard();
    decorateHallOfFame();
  }

  function init(){
    if (isNode || !root.document) return;
    ensureStyle();
    installTimeTracking();
    patchBackup();
    patchHallOfFame();
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', refreshUi, { once:true });
    else refreshUi();
    root.addEventListener('wave66-xp-updated', function(){ setTimeout(refreshUi, 0); });
    root.addEventListener('wave67-meta-updated', function(){ setTimeout(refreshUi, 0); });
    root.addEventListener('dashboard-state-ready', function(){ setTimeout(renderDashboardCard, 0); });
    setTimeout(function(){ var shared = parseProfileHash(); if (shared) showSharedProfile(shared); }, 50);
  }

  var api = {
    config: CONFIG,
    avatars: AVATARS,
    defaultState: defaultState,
    normalizeState: normalizeState,
    loadState: loadState,
    saveState: saveState,
    buildProfileSummary: buildProfileSummary,
    buildPublicSnapshot: buildPublicSnapshot,
    encodeSnapshot: encodeSnapshot,
    decodeSnapshot: decodeSnapshot,
    buildProfileLink: buildProfileLink,
    publicCodeFor: publicCodeFor,
    leaderboardEntryFromSummary: leaderboardEntryFromSummary,
    sortProfiles: sortProfiles,
    mergeCloudDoc: mergeCloudDoc,
    localFallbackLeaderboard: localFallbackLeaderboard,
    loadLeaderboard: loadLeaderboard,
    syncProfileToCloud: syncProfileToCloud,
    buildProfilePngCanvas: buildProfilePngCanvas,
    openAvatarPicker: openAvatarPicker,
    showProfileQr: showProfileQr,
    showLeaderboard: showLeaderboard,
    refreshUi: refreshUi,
    init: init
  };

  init();
  return api;
});
