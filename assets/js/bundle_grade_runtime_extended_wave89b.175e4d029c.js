/* wave92f: lazy feature-pack loader for full mode only */
(function(){
  'use strict';
  var root = window;
  if (!root || root.__wave92fFeaturePackLoader) return;
  var SRC = "./assets/js/chunk_grade_featurepacks_wave92f.7bc99f042c.js";
  var attempts = 0, loading = false, loaded = false;
  function ls(k){ try { return localStorage.getItem(k); } catch(_) { return null; } }
  function isSimple(){
    var mode = ls('trainer_ui_mode');
    if (!mode) mode = ls('trainer_simple_mode_v1') === '0' ? 'full' : 'simple';
    if (mode === 'full') return false;
    try { if (document.documentElement.classList.contains('simple-mode') || document.body.classList.contains('simple-mode')) return true; } catch(_) {}
    return mode !== 'full';
  }
  function load(reason){
    if (loaded || loading || isSimple()) return false;
    if (!document || !document.createElement) return false;
    loading = true; attempts += 1;
    var s = document.createElement('script');
    s.defer = true; s.src = SRC; s.setAttribute('data-wave92f-featurepacks', reason || 'full-mode');
    s.onload = function(){ loaded = true; loading = false; root.__wave92fFeaturePacksLoaded = true; };
    s.onerror = function(){ loading = false; if (attempts < 3) setTimeout(function(){ load('retry-' + attempts); }, 400 * attempts); };
    (document.head || document.documentElement).appendChild(s);
    return true;
  }
  function maybe(){ load('mode-check'); }
  root.__wave92fFeaturePackLoader = { version:'wave92f', src:SRC, load:load, isSimple:isSimple, status:function(){ return { loaded:loaded, loading:loading, attempts:attempts, simple:isSimple() }; } };
  root.wave92fLoadFeaturePacks = load;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', maybe, { once:true }); else setTimeout(maybe, 0);
  try { new MutationObserver(maybe).observe(document.documentElement, { attributes:true, attributeFilter:['class','data-theme'] }); } catch(_) {}
  try { new MutationObserver(maybe).observe(document.body, { attributes:true, attributeFilter:['class'] }); } catch(_) {}
  if (root && typeof root.addEventListener === 'function') root.addEventListener('storage', function(ev){ if (ev && ev.key === 'trainer_ui_mode') maybe(); });
})();


/* wave92f: IndexedDB durable storage bridge */
(function(){
  'use strict';
  var root = window;
  if (!root || root.__wave92fStorageBridge) return;
  root.__wave92fStorageBridge = true;
  var DB = 'trainer3_store_wave92f', STORE = 'kv', VERSION = 1;
  var rawSet = null, rawRemove = null, rawGet = null;
  try { rawSet = Storage.prototype.setItem; rawRemove = Storage.prototype.removeItem; rawGet = Storage.prototype.getItem; } catch(_) {}
  function trainerKey(k){ return /^trainer_|^wave\d+|^exam|^rush|^daily/i.test(String(k || '')); }
  function safeLocalGet(k){ try { return rawGet ? rawGet.call(localStorage, k) : localStorage.getItem(k); } catch(_) { return null; } }
  function safeLocalSet(k,v){ try { return rawSet ? rawSet.call(localStorage, k, String(v)) : localStorage.setItem(k, String(v)); } catch(_) { return false; } }
  function safeLocalRemove(k){ try { return rawRemove ? rawRemove.call(localStorage, k) : localStorage.removeItem(k); } catch(_) { return false; } }
  var dbp = null;
  function open(){
    if (dbp) return dbp;
    dbp = new Promise(function(resolve, reject){
      if (!('indexedDB' in root)) { reject(new Error('IndexedDB unavailable')); return; }
      var req = indexedDB.open(DB, VERSION);
      req.onupgradeneeded = function(){
        var db = req.result;
        var st = db.objectStoreNames.contains(STORE) ? req.transaction.objectStore(STORE) : db.createObjectStore(STORE, { keyPath:'key' });
        if (!st.indexNames.contains('by_updatedAt')) st.createIndex('by_updatedAt', 'updatedAt');
      };
      req.onsuccess = function(){ resolve(req.result); };
      req.onerror = function(){ reject(req.error || new Error('IndexedDB open failed')); };
    });
    return dbp;
  }
  function tx(mode, fn){
    return open().then(function(db){ return new Promise(function(resolve, reject){
      try {
        var tr = db.transaction(STORE, mode), st = tr.objectStore(STORE), out = fn(st);
        tr.oncomplete = function(){ resolve(out); };
        tr.onerror = function(){ reject(tr.error); };
        tr.onabort = function(){ reject(tr.error || new Error('aborted')); };
      } catch(e) { reject(e); }
    }); });
  }
  function set(key, value){
    key = String(key || '');
    return tx('readwrite', function(st){ st.put({ key:key, value:String(value == null ? '' : value), updatedAt:Date.now() }); }).catch(function(){ safeLocalSet(key, value); });
  }
  function get(key){
    key = String(key || '');
    return open().then(function(db){ return new Promise(function(resolve){
      try {
        var r = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
        r.onsuccess = function(){ resolve(r.result ? r.result.value : safeLocalGet(key)); };
        r.onerror = function(){ resolve(safeLocalGet(key)); };
      } catch(_) { resolve(safeLocalGet(key)); }
    }); }).catch(function(){ return safeLocalGet(key); });
  }
  function remove(key){ key = String(key || ''); return tx('readwrite', function(st){ st.delete(key); }).catch(function(){ safeLocalRemove(key); }); }
  function keys(){
    return open().then(function(db){ return new Promise(function(resolve){
      try { var r = db.transaction(STORE,'readonly').objectStore(STORE).getAllKeys(); r.onsuccess=function(){ resolve(r.result || []); }; r.onerror=function(){ resolve([]); }; } catch(_) { resolve([]); }
    }); }).catch(function(){ return []; });
  }
  function migrate(){
    try {
      var batch = [];
      for (var i=0;i<localStorage.length;i++){ var k = localStorage.key(i); if (trainerKey(k)) batch.push([k, safeLocalGet(k)]); }
      batch.slice(0, 500).forEach(function(row){ set(row[0], row[1]); });
    } catch(_) {}
    open().then(function(db){
      try {
        var r = db.transaction(STORE,'readonly').objectStore(STORE).getAll();
        r.onsuccess = function(){ (r.result || []).forEach(function(row){ if (row && row.key && safeLocalGet(row.key) == null) safeLocalSet(row.key, row.value); }); };
      } catch(_) {}
    }).catch(function(){});
  }
  try {
    if (rawSet && !Storage.prototype.setItem.__wave92fStore) {
      Storage.prototype.setItem = function(key, value){ var out = rawSet.apply(this, arguments); if (this === localStorage && trainerKey(key)) set(key, value); return out; };
      Storage.prototype.setItem.__wave92fStore = true;
    }
    if (rawRemove && !Storage.prototype.removeItem.__wave92fStore) {
      Storage.prototype.removeItem = function(key){ var out = rawRemove.apply(this, arguments); if (this === localStorage && trainerKey(key)) remove(key); return out; };
      Storage.prototype.removeItem.__wave92fStore = true;
    }
  } catch(_) {}
  root.trainerStore = root.trainerStore || {};
  root.trainerStore.version = 'wave92f';
  root.trainerStore.dbName = DB;
  root.trainerStore.get = get;
  root.trainerStore.set = function(key, value){ safeLocalSet(key, value); return set(key, value); };
  root.trainerStore.remove = function(key){ safeLocalRemove(key); return remove(key); };
  root.trainerStore.keys = keys;
  root.trainerStore.migrate = migrate;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', migrate, { once:true }); else setTimeout(migrate, 0);
})();

/* wave92f: content expiry metadata runtime */
(function(){
  'use strict';
  var root = window;
  if (!root || root.__wave92fContentExpiry) return;
  var REGISTRY = {
    exam_banks_2026:{ title:'ОГЭ/ЕГЭ 2026', valid_until:'2027-08-31', review_after:'2026-09-01' },
    content_depth:{ title:'Дополнительные банки wave91j', valid_until:'2027-08-31', review_after:'2026-09-01' },
    school_runtime:{ title:'Школьный runtime и темы', valid_until:'2027-08-31', review_after:'2026-09-01' }
  };
  function daysUntil(s){ var d = Date.parse(String(s || '') + 'T00:00:00Z'); if (!isFinite(d)) return null; return Math.floor((d - Date.now())/86400000); }
  function status(id){ var r = REGISTRY[id]; if (!r) return null; var left = daysUntil(r.valid_until); return Object.assign({}, r, { id:id, days_left:left, expired:left !== null && left < 0, review_due:daysUntil(r.review_after) !== null && daysUntil(r.review_after) < 0 }); }
  function mount(){
    var bad = Object.keys(REGISTRY).map(status).filter(function(x){ return x && x.expired; });
    if (!bad.length || document.getElementById('wave92f-expiry-banner')) return;
    var host = document.querySelector('.subj-intro,.w,#s-main .w,main,body'); if (!host) return;
    var box = document.createElement('div'); box.id='wave92f-expiry-banner'; box.setAttribute('role','status'); box.style.cssText='margin:10px 0;padding:12px;border:1px solid #f59e0b;border-radius:14px;background:#fffbeb;color:#92400e;font-size:12px;line-height:1.45;font-weight:800';
    box.textContent='Контент требует ревизии: '+bad.map(function(x){return x.title;}).join(', ')+'. Обнови банки перед использованием как финального экзамена.';
    host.insertBefore ? host.insertBefore(box, host.firstChild) : document.body.appendChild(box);
  }
  root.__wave92fContentExpiry = { version:'wave92f', registry:REGISTRY, status:status, all:function(){ return Object.keys(REGISTRY).map(status); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once:true }); else setTimeout(mount,0);
})();
/* wave89b: merge pass for active grade runtime extensions (wave87x + wave88c + wave88d) */
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
    removePlayCard();
    return; // wave92j: adaptive difficulty UI disabled; engine stays under the hood.
    try {
      var modeRaw = localStorage.getItem('trainer_ui_mode');
      modeRaw = String(modeRaw == null ? '' : modeRaw).trim().toLowerCase();
      var simple = modeRaw !== 'full' && (modeRaw === 'simple' || modeRaw === '' || (document.body && document.body.classList && document.body.classList.contains('simple-mode')) || (document.documentElement && document.documentElement.classList && document.documentElement.classList.contains('simple-mode')));
      if (simple) { removePlayCard(); return; }
    } catch (_wave92cSimpleGuard) { removePlayCard(); return; }
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

  function installAdaptiveEngineEvents(){
    if (root.__wave89mAdaptiveEvents) return;
    root.__wave89mAdaptiveEvents = true;
    document.addEventListener('trainer:start', function(){ try { resetState(); } catch (_err) {} });
    document.addEventListener('trainer:answer', function(event){
      try {
        var question = event && event.detail && event.detail.question ? event.detail.question : getCurrentQuestion();
        if (!question || shouldDelegateNextQ()) return;
        var sample = question.__wave87xTiming && question.__wave87xTiming.last ? question.__wave87xTiming.last : null;
        recordOutcome(question, {
          correct: !!(event && event.detail && event.detail.correct),
          usedHelp: getUsedHelp(),
          ms: sample && sample.ms ? num(sample.ms) : 0,
          bucket: difficultyOf(question),
          target: state.lastTarget || difficultyOf(question)
        });
      } catch (_err) {}
    });
    document.addEventListener('trainer:end', function(){ try { state.active = false; } catch (_err) {} });
  }
  root.__wave87xCandidateSelectNext = function(){ return null; };
  installAdaptiveEngineEvents();

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

  function boot(){ try { init(); } catch(err) { try { console.warn('[wave92v guard] wave89x init failed', err); } catch(_) {} } }
  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();

  if (typeof root.addEventListener === 'function') {
    root.addEventListener('wave89x-optional-input-banks-ready', function(){
      refreshCurrentSubject();
    });
  }

  state.ensureLoaded = ensureLoaded;
  state.isReady = function(){ return !!loaded || hasOptionalTopics(); };
})();


/* wave92u: feature packs remain in the lazy chunk; disabled training stubs removed. */
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
  function patch(){
    if(root.__wave92aReportEvents) return;
    root.__wave92aReportEvents = true;
    document.addEventListener('trainer:render', function(){ setTimeout(mount,0); });
    document.addEventListener('click', function(){ setTimeout(function(){ remember(); mount(); },0); }, true);
  }
  function boot(){css();remember();patch();setTimeout(mount,0)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  if(root&&typeof root.addEventListener==='function')root.addEventListener('load',function(){setTimeout(boot,0)},{once:true});
})();

/* wave92c: clean training screen rule marker */
(function(){if(typeof window!=='undefined'){window.__wave92cCleanTraining={version:'wave92c',simpleDefault:true,playWidgetsHidden:['wave89m-adaptive','wave89n-path','wave91e-explain-pomodoro','wave91f-difficulty-marathon','wave91g-visual-tools'],allowedPlayElements:['question','answer-options','feedback','next','question-report']};}})();

/* wave92j: core training improvements — answer history, retry wrongs, preload, progress, why, shortcuts */
(function(){
  'use strict';
  var root = window;
  if (!root || root.__wave92jTrainingCore) return;
  var VERSION = 'wave92j';
  var DB = 'trainer3_answer_history_wave92j';
  var STORE = 'answers';
  var dbp = null;
  var repeatQueue = [];
  var lastConfettiStreak = 0;
  var scheduledRender = 0;

  function txt(v,n){ return String(v == null ? '' : v).replace(/\s+/g,' ').trim().slice(0, n || 500); }
  function clone(v){ try { return JSON.parse(JSON.stringify(v)); } catch(_) { return v; } }
  function q(){ return root.prob && typeof root.prob === 'object' ? root.prob : null; }
  function grade(){ return String(root.GRADE_NUM || root.GRADE_NO || document.documentElement.getAttribute('data-grade') || '10'); }
  function isPlay(){ try { var s=document.getElementById('s-play'); return !!(s && /\bon\b/.test(s.className || '')); } catch(_) { return false; } }
  function selected(){ try { return root.sel; } catch(_) { return null; } }
  function canEnhanceNormal(){ return isPlay() && !root.rushMode && !root.diagMode; }
  function showToast(message){ try { if (typeof root.showToast === 'function') return root.showToast(message, 'info', 2200); if (typeof root.toast === 'function') return root.toast(message); } catch(_) {} }
  function track(kind, meta){ try { if (root.trainerEvents && root.trainerEvents.track) root.trainerEvents.track(kind, meta || {}); } catch(_) {} }
  function openDb(){
    if (dbp) return dbp;
    dbp = new Promise(function(resolve, reject){
      if (!('indexedDB' in root)) { reject(new Error('IndexedDB unavailable')); return; }
      var req = indexedDB.open(DB, 1);
      req.onupgradeneeded = function(){
        var db = req.result;
        var st = db.objectStoreNames.contains(STORE) ? req.transaction.objectStore(STORE) : db.createObjectStore(STORE, { keyPath:'id', autoIncrement:true });
        if (!st.indexNames.contains('by_ts')) st.createIndex('by_ts', 'ts');
        if (!st.indexNames.contains('by_grade')) st.createIndex('by_grade', 'grade');
        if (!st.indexNames.contains('by_topic')) st.createIndex('by_topic', 'topic');
        if (!st.indexNames.contains('by_correct')) st.createIndex('by_correct', 'correct');
      };
      req.onsuccess = function(){ resolve(req.result); };
      req.onerror = function(){ reject(req.error || new Error('open failed')); };
    });
    return dbp;
  }
  function saveAnswer(row){
    row = row || {};
    row.ts = new Date().toISOString();
    openDb().then(function(db){
      try { db.transaction(STORE, 'readwrite').objectStore(STORE).add(row); } catch(_) {}
    }).catch(function(){
      try {
        var key = 'trainer_answer_history_fallback_wave92j';
        var arr = JSON.parse(localStorage.getItem(key) || '[]');
        if (!Array.isArray(arr)) arr = [];
        arr.push(row);
        localStorage.setItem(key, JSON.stringify(arr.slice(-500)));
      } catch(_) {}
    });
  }
  function qKey(question){ return [txt(question && question.tag,80), txt(question && question.question,180), txt(question && question.answer,80)].join('¦').toLowerCase(); }
  function normalizeQuestion(raw){
    var out = raw;
    try { if (typeof root.prepareQuestion === 'function') out = root.prepareQuestion(clone(raw)); }
    catch(_) { out = clone(raw); }
    return out;
  }
  function generateAlternateWrongRepeat(base){
    var raw = null;
    try {
      var topic = root.cT;
      if (topic && typeof topic.gen === 'function') {
        for (var i=0;i<8;i++) {
          var cand = topic.gen();
          if (cand && txt(cand.question) && txt(cand.question) !== txt(base && base.question)) { raw = cand; break; }
        }
      }
    } catch(_) {}
    var prepared = normalizeQuestion(raw || base);
    if (prepared && raw == null && !prepared.__wave92jRepeatLabel) {
      prepared.question = 'Повторим похожую ошибку: ' + txt(prepared.question, 460);
      prepared.__wave92jRepeatLabel = true;
    }
    if (prepared) prepared.__wave92jRepeat = true;
    return prepared;
  }
  function scheduleWrongRepeat(question){
    if (!canEnhanceNormal() || !question) return;
    var item = generateAlternateWrongRepeat(question);
    if (!item || !item.question) return;
    repeatQueue.push({ due: 3 + Math.floor(Math.random() * 3), q: item, key: qKey(item), at: Date.now() });
    repeatQueue = repeatQueue.slice(-4);
    root.__wave92jRepeatQueue = repeatQueue;
    track('wrong_repeat_scheduled', { due: repeatQueue[repeatQueue.length-1].due, topic: txt(item.tag,80) });
  }
  function dueRepeat(){
    if (!repeatQueue.length || !canEnhanceNormal()) return null;
    for (var i=0;i<repeatQueue.length;i++) repeatQueue[i].due -= 1;
    var idx = repeatQueue.findIndex(function(x){ return x.due <= 0; });
    if (idx < 0) return null;
    var item = repeatQueue.splice(idx, 1)[0];
    root.__wave92jRepeatQueue = repeatQueue;
    return item && item.q;
  }
  function serveQuestion(question, source){
    if (!question) return false;
    try {
      root.prob = question;
      root.sel = null;
      root.hintOn = false;
      root.shpOn = false;
      root.usedHelp = false;
      if (root.seenQs) {
        var k = txt(question.question) + txt(question.answer);
        root.seenQs[k] = (root.seenQs[k] || 0) + 1;
      }
      if (typeof root.render === 'function') root.render();
      try { root.scrollTo({ top:0, behavior:'smooth' }); } catch(_) {}
      track('preloaded_question_served', { source: source || 'unknown', topic: txt(question.tag,80) });
      return true;
    } catch(_) { return false; }
  }
  function canPreload(){
    return canEnhanceNormal() && !root.mix && !root.globalMix && !(Array.isArray(root.__wave21QuestionQueue) && root.__wave21QuestionQueue.length) && root.cT && typeof root.cT.gen === 'function';
  }
  function preloadNext(){
    if (!canPreload() || selected() !== null) return;
    if (root.__wave92jPreparedNext && root.__wave92jPreparedNext.key === qKey(q())) return;
    var current = q(), raw = null;
    try {
      for (var i=0;i<8;i++) {
        raw = root.cT.gen();
        if (raw && txt(raw.question) && txt(raw.question) !== txt(current && current.question)) break;
      }
      var prepared = normalizeQuestion(raw);
      if (prepared && prepared.question) root.__wave92jPreparedNext = { key:qKey(current), q:prepared, at:Date.now() };
    } catch(_) {}
  }
  function injectCss(){
    if (document.getElementById('wave92j-training-css')) return;
    var css = '.wave92j-progress{margin:6px 0 10px;border-radius:999px;background:var(--line,#e5e7eb);height:7px;overflow:hidden}.wave92j-progress>i{display:block;height:100%;background:var(--accent,#2563eb);width:0}.wave92j-progress-label{font-size:12px;color:var(--muted,#6b7280);display:flex;justify-content:space-between;gap:8px;margin:4px 0 2px}.wave92j-why{margin-top:8px;padding:10px;border-radius:12px;background:var(--soft,#f8fafc);border:1px solid var(--border,#e5e7eb);font-size:12px;line-height:1.45}.wave92j-why b{display:block;margin-bottom:4px}.wave92j-particle{position:fixed;top:-12px;z-index:99999;pointer-events:none;border-radius:50%;background:var(--accent,#2563eb);opacity:.9}@media(prefers-reduced-motion:reduce){.wave92j-particle{display:none!important}}';
    try { var st = document.createElement('style'); st.id='wave92j-training-css'; st.textContent = css; (document.head || document.documentElement).appendChild(st); } catch(_) {}
  }
  function renderProgressStrip(){
    if (!isPlay() || !q()) return;
    injectCss();
    var host = document.getElementById('wave21-session-slot') || document.getElementById('sts');
    if (!host || document.getElementById('wave92j-progress-strip')) return;
    var total = root.st ? (+root.st.ok || 0) + (+root.st.err || 0) : 0;
    var current = total + (selected() === null ? 1 : 0);
    var goal = root.__wave21QuestionQueueTotal || 20;
    if (root.diagMode && root.diagMax) goal = root.diagMax;
    var acc = total ? Math.round(((root.st && +root.st.ok || 0) / total) * 100) : 0;
    var pct = goal ? Math.min(100, Math.round((Math.min(current, goal) / goal) * 100)) : 0;
    var currentLabel = current > goal ? current + ' (бонус +' + (current - goal) + ')' : current + ' из ' + goal;
    var box = document.createElement('div'); box.id = 'wave92j-progress-strip';
    box.innerHTML = '<div class="wave92j-progress-label"><span>' + currentLabel + '</span><span>точность ' + (total ? acc + '%' : '—') + '</span></div><div class="wave92j-progress" aria-hidden="true"><i style="width:' + pct + '%"></i></div>';
    try { host.appendChild(box); } catch(_) {}
  }
  function refreshProgressStrip(){
    var old = document.getElementById('wave92j-progress-strip');
    if (old) old.remove();
    renderProgressStrip();
  }
  function whyMap(question){
    var raw = question && (question.why || question.whys || question.optionWhy || question.option_why || question.wrong_explanations);
    if (!raw) return null;
    if (Array.isArray(raw)) {
      var map = {};
      (question.options || []).forEach(function(opt, idx){ if (raw[idx]) map[txt(opt,120)] = txt(raw[idx],400); });
      return map;
    }
    if (typeof raw === 'object') return raw;
    return null;
  }
  function appendWhyBlock(question, correct){
    if (!question || correct) return;
    var slot = document.getElementById('fba');
    if (!slot || slot.querySelector('.wave92j-why')) return;
    var picked = selected();
    var chosen = typeof picked === 'number' && question.options ? question.options[picked] : picked;
    var map = whyMap(question), chosenKey = txt(chosen,120);
    var reason = map && (map[chosenKey] || map[String(picked)] || map[picked] || map[txt(chosen,500)]);
    if (!reason) reason = 'Этот вариант не совпадает с правильным ответом и не проходит проверку по условию. Сравни его с разбором выше и найди место, где правило нарушено.';
    var box = document.createElement('div');
    box.className = 'wave92j-why';
    box.innerHTML = '<b>Почему выбранный вариант неверен</b><span></span>';
    box.querySelector('span').textContent = reason;
    slot.appendChild(box);
  }
  function haptic(correct){
    try {
      if (localStorage.getItem('trainer_haptics_wave92g') === '0') return;
      if (navigator.vibrate) navigator.vibrate(correct ? [50] : [35, 40, 35]);
    } catch(_) {}
  }
  function confetti(){
    if (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      for (var i=0;i<24;i++) {
        var el = document.createElement('i');
        el.className = 'wave92j-particle';
        el.style.left = (Math.random() * 100) + '%';
        el.style.width = el.style.height = (5 + Math.random() * 6) + 'px';
        document.body.appendChild(el);
        var dx = (Math.random() * 180 - 90), rot = 360 + Math.random() * 540;
        var anim = el.animate([{ transform:'translate3d(0,0,0) rotate(0deg)', opacity:1 }, { transform:'translate3d(' + dx + 'px,' + (innerHeight + 60) + 'px,0) rotate(' + rot + 'deg)', opacity:0 }], { duration: 900 + Math.random() * 900, easing:'cubic-bezier(.2,.6,.2,1)' });
        anim.onfinish = function(){ try { this.effect.target.remove(); } catch(_) {} };
      }
    } catch(_) {}
  }
  function maybeCelebrate(correct){
    if (!correct || !root.st || !root.st.streak || root.st.streak < 5) return;
    if (lastConfettiStreak === root.st.streak) return;
    lastConfettiStreak = root.st.streak;
    confetti();
    track('streak_confetti', { streak: root.st.streak });
  }
  function clickOptionByDigit(key){
    var idx = Number(key) - 1;
    if (idx < 0 || idx > 3 || !isPlay() || selected() !== null) return false;
    var opts = document.getElementById('opts');
    var buttons = opts ? Array.prototype.slice.call(opts.querySelectorAll('button.opt,.opt')) : [];
    var btn = buttons[idx];
    if (!btn || btn.disabled) return false;
    if (typeof btn.click === 'function') { btn.click(); return true; }
    return false;
  }
  function bindShortcuts(){
    if (root.__wave92jShortcutBound) return;
    root.__wave92jShortcutBound = true;
    document.addEventListener('keydown', function(event){
      if (!event || event.ctrlKey || event.metaKey || event.altKey) return;
      var tag = event.target && event.target.tagName ? String(event.target.tagName).toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (event.target && event.target.isContentEditable)) return;
      if (/^[1-4]$/.test(event.key) && clickOptionByDigit(event.key)) { event.preventDefault(); event.stopPropagation(); }
    }, true);
  }
  function patchReportConfirmation(){
    if (root.__wave92jReportConfirm) return;
    root.__wave92jReportConfirm = true;
    document.addEventListener('click', function(event){
      var target = event.target && event.target.closest ? event.target.closest('#wave92a-report-question') : null;
      if (!target) return;
      setTimeout(function(){ showToast('Спасибо, отметка сохранена. Её можно экспортировать из журнала ошибок.'); track('question_report_confirmed', { topic: txt(q() && q().tag, 80) }); }, 50);
    }, true);
  }
  function afterRender(){
    if (scheduledRender) cancelAnimationFrame(scheduledRender);
    scheduledRender = requestAnimationFrame(function(){
      scheduledRender = 0;
      try { refreshProgressStrip(); } catch(_) {}
      try { if (selected() !== null) appendWhyBlock(q(), q() && String(selected()) === String(q().answer)); } catch(_) {}
      try { preloadNext(); } catch(_) {}
    });
  }
  function wave92jNextProvider(){
    try {
      var rep = dueRepeat();
      if (rep) { track('preloaded_question_served', { source:'wrong-repeat', topic: txt(rep.tag,80) }); return { question: rep, source:'wrong-repeat' }; }
      var prepared = root.__wave92jPreparedNext;
      if (prepared && canPreload()) {
        root.__wave92jPreparedNext = null;
        track('preloaded_question_served', { source:'preload', topic: txt(prepared.q && prepared.q.tag,80) });
        return { question: prepared.q, source:'preload' };
      }
    } catch(_) {}
    return null;
  }
  function installEngineHooks(){
    if (root.__wave92lTrainingCoreHooked) return;
    root.__wave92lTrainingCoreHooked = true;
    root.__trainerNextQuestionProviders = root.__trainerNextQuestionProviders || [];
    root.__trainerNextQuestionProviders.push(wave92jNextProvider);
    document.addEventListener('trainer:answer', function(event){
      try {
        var d = event && event.detail || {};
        var question = clone(d.question || q());
        var chosen = d.choice;
        var correct = !!d.correct;
        var before = d.stBefore || null;
        saveAnswer({ grade: grade(), subject: txt(root.cS && root.cS.id,60), subjectName: txt(root.cS && root.cS.nm,120), topic: txt(question && question.tag,120), question: txt(question && question.question,500), answer: txt(question && question.answer,200), chosen: txt(chosen,200), correct: correct, usedHelp: !!d.usedHelp, sessionOkBefore: before && before.ok || 0, sessionErrBefore: before && before.err || 0 });
        haptic(correct);
        if (!correct) scheduleWrongRepeat(question);
        maybeCelebrate(correct);
        setTimeout(function(){ appendWhyBlock(q(), correct); refreshProgressStrip(); }, 80);
      } catch(_) {}
    });
    document.addEventListener('trainer:render', function(){ try { afterRender(); } catch(_) {} });
    document.addEventListener('trainer:start', function(){ repeatQueue = []; root.__wave92jPreparedNext = null; lastConfettiStreak = 0; try { preloadNext(); refreshProgressStrip(); } catch(_) {} });
    document.addEventListener('trainer:end', function(){ repeatQueue = []; root.__wave92jPreparedNext = null; });
  }
  function init(){ bindShortcuts(); patchReportConfirmation(); installEngineHooks(); afterRender(); }
  function boot(){ try { init(); } catch(err) { try { console.warn('[wave92v guard] wave92j init failed', err); } catch(_) {} } }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true }); else boot();
  root.__wave92jTrainingCore = { version:VERSION, dbName:DB, repeatQueue:function(){ return repeatQueue.slice(); }, preloadNext:preloadNext, saveAnswer:saveAnswer };
})();


/* wave92v: training swipe fallback + scroll memory */
;try {
(function(){
  'use strict';
  var root = window;
  if (!root || root.__wave92vTrainingUX) return;
  var VERSION = 'wave92v';
  var touch = null;
  var lastNextAt = 0;
  var saveTimer = 0;
  var restoreTimer = 0;
  var lastScreen = '';
  var swipeFallbackBound = false;
  var scrollMemoryBound = false;

  function now(){ return Date.now ? Date.now() : (new Date()).getTime(); }
  function safeWarn(label, err){ try { console.warn('[wave92v] ' + label, err); } catch(_) {} }
  function activeScreen(){ try { var n = document.querySelector('.scr.on'); return n && n.id || ''; } catch(_) { return ''; } }
  function isPlay(){ try { var s = document.getElementById('s-play'); return !!(s && /\bon\b/.test(s.className || '')); } catch(_) { return false; } }
  function selected(){ try { return root.sel !== null && typeof root.sel !== 'undefined'; } catch(_) { return false; } }
  function grade(){ return String(root.GRADE_NUM || root.GRADE_NO || document.documentElement.getAttribute('data-grade') || '10'); }
  function pathId(){ return String((root.location && root.location.pathname) || 'grade').replace(/[^a-z0-9_\-./]/gi, '_'); }
  function store(){ try { return root.sessionStorage || root.localStorage || null; } catch(_) { return null; } }
  function key(id){ return 'trainer_scroll_wave92v:' + pathId() + ':' + grade() + ':' + id; }
  function persistScreen(id){ return /^s-(main|subj|theory|prog|info|result)$/.test(id || ''); }
  function track(kind, meta){ try { if (root.trainerEvents && root.trainerEvents.track) root.trainerEvents.track(kind, meta || {}); } catch(_) {} }
  function toast(message){ try { if (typeof root.showToast === 'function') root.showToast(message, 'info', 1200); else if (typeof root.toast === 'function') root.toast(message); } catch(_) {} }
  function saveScrollNow(){
    var id = activeScreen();
    if (!persistScreen(id)) return;
    var st = store();
    if (!st) return;
    try {
      st.setItem(key(id), JSON.stringify({ y: Math.max(0, Math.round(root.scrollY || document.documentElement.scrollTop || 0)), t: now() }));
    } catch(_) {}
  }
  function saveScroll(){
    if (saveTimer) return;
    saveTimer = setTimeout(function(){ saveTimer = 0; saveScrollNow(); }, 120);
  }
  function readSaved(id){
    var st = store();
    if (!st || !persistScreen(id)) return null;
    try {
      var data = JSON.parse(st.getItem(key(id)) || 'null');
      if (!data || typeof data.y !== 'number') return null;
      if (data.y < 24) return null;
      if (data.t && now() - data.t > 12 * 60 * 60 * 1000) return null;
      return data;
    } catch(_) { return null; }
  }
  function restoreScroll(id){
    var saved = readSaved(id);
    if (!saved) return;
    clearTimeout(restoreTimer);
    function apply(){
      try {
        if (activeScreen() !== id) return;
        root.scrollTo({ top: saved.y, behavior: 'auto' });
      } catch(_) {
        try { root.scrollTo(0, saved.y); } catch(__) {}
      }
    }
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(apply); else setTimeout(apply, 0);
    restoreTimer = setTimeout(apply, 180);
  }
  function handleScreenChange(){
    var id = activeScreen();
    if (id === lastScreen) return;
    if (lastScreen) saveScrollNow();
    lastScreen = id;
    if (persistScreen(id)) restoreScroll(id);
  }
  function bindScrollMemory(){
    if (scrollMemoryBound) return;
    scrollMemoryBound = true;
    lastScreen = activeScreen();
    root.addEventListener('scroll', saveScroll, { passive:true });
    root.addEventListener('pagehide', saveScrollNow, { passive:true });
    root.addEventListener('beforeunload', saveScrollNow, { passive:true });
    document.addEventListener('click', function(){ saveScrollNow(); }, true);
    if (typeof MutationObserver !== 'undefined') {
      var nodes = Array.prototype.slice.call(document.querySelectorAll('.scr'));
      var observer = new MutationObserver(handleScreenChange);
      nodes.forEach(function(node){ observer.observe(node, { attributes:true, attributeFilter:['class'] }); });
      root.__wave92vTrainingUX.screenObserver = observer;
    }
    setTimeout(handleScreenChange, 40);
  }
  function canFallbackSwipe(){
    return isPlay() && selected() && !root.rushMode && !root.diagMode && typeof root.nextQ === 'function';
  }
  function fallbackNext(){
    if (!canFallbackSwipe()) return false;
    var t = now();
    if (t - lastNextAt < 650) return false;
    lastNextAt = t;
    try { root.nextQ(); toast('Следующий вопрос'); track('training_swipe_next', { source:'wave92v-fallback' }); return true; }
    catch(err) { safeWarn('fallback swipe next failed', err); return false; }
  }
  function ignoredGestureTarget(target){
    try { return !!(target && target.closest && target.closest('input,textarea,select,[contenteditable="true"],button,a,[role="button"],.opt,.qback,.btn')); }
    catch(_) { return false; }
  }
  function bindSwipeFallback(){
    if (swipeFallbackBound) return;
    if (root.wave24Debug && typeof root.wave24Debug.swipeNext === 'function') {
      root.__wave92vTrainingUX.swipeSource = 'wave24-mobile';
      return;
    }
    swipeFallbackBound = true;
    root.__wave92vTrainingUX.swipeSource = 'wave92v-fallback';
    document.addEventListener('touchstart', function(event){
      try {
        if (!isPlay() || !event.touches || event.touches.length !== 1) return;
        if (ignoredGestureTarget(event.target)) return;
        var t = event.touches[0];
        touch = { x:t.clientX, y:t.clientY, at:now() };
      } catch(_) { touch = null; }
    }, { passive:true });
    document.addEventListener('touchend', function(event){
      try {
        if (!touch || !event.changedTouches || !event.changedTouches[0]) return;
        var t = event.changedTouches[0];
        var dx = t.clientX - touch.x;
        var dy = t.clientY - touch.y;
        var dt = now() - touch.at;
        touch = null;
        if (dt > 900 || Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 1.3 || Math.abs(dy) > 48) return;
        if (dx < 0) fallbackNext();
      } catch(err) { touch = null; safeWarn('fallback swipe handler failed', err); }
    }, { passive:true });
  }
  function init(){
    if (typeof document === 'undefined' || !document.body) return;
    bindScrollMemory();
    bindSwipeFallback();
  }
  root.__wave92vTrainingUX = {
    version: VERSION,
    activeScreen: activeScreen,
    saveScroll: saveScrollNow,
    restoreScroll: restoreScroll,
    swipeSource: 'pending',
    scrollMemory: function(){ return scrollMemoryBound; }
  };
  function boot(){ try { init(); } catch(err) { safeWarn('init failed', err); } }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true }); else boot();
})();
} catch(e) { try { console.warn('[wave92v block] training UX failed', e); } catch(_) {} }
