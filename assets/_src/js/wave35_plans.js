(function(){
  if (typeof window === 'undefined' || window.wave35Debug) return;

  var VERSION = 'wave35';
  var META_PREFIX = 'trainer35_';
  var PROFILE_KEY = META_PREFIX + 'profiles_v1';
  var ACTIVE_KEY = META_PREFIX + 'active_profile_v1';
  var AUTH_KEY = META_PREFIX + 'auth_v1';
  var MIGRATION_KEY = META_PREFIX + 'migrated_v1';
  var STYLE_ID = 'wave35-style';
  var SCOPE_PREFIX = META_PREFIX + 'scoped:';
  var GLOBAL_KEYS = {
    'trainer_theme': 1,
    'trainer_pwa_dismissed': 1,
    'trainer_visits': 1
  };
  var SUBJECT_LABELS = {
    math: 'Математика',
    mathall: 'Вся математика',
    algebra: 'Алгебра',
    geometry: 'Геометрия',
    geom: 'Геометрия',
    rus: 'Русский язык',
    russian: 'Русский язык',
    read: 'Литературное чтение',
    lit: 'Литература',
    literature: 'Литература',
    world: 'Окружающий мир',
    okr: 'Окружающий мир',
    eng: 'Английский',
    english: 'Английский',
    hist: 'История',
    history: 'История',
    inf: 'Информатика',
    informatics: 'Информатика',
    soc: 'Обществознание',
    social: 'Обществознание',
    bio: 'Биология',
    biology: 'Биология',
    geo: 'География',
    geo5: 'География',
    geography: 'География',
    phys: 'Физика',
    physics: 'Физика',
    chem: 'Химия',
    chemistry: 'Химия',
    prob: 'Вероятность',
    exam: 'Экзамен'
  };
  var MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];

  var originalStorage = {
    getItem: Storage.prototype.getItem,
    setItem: Storage.prototype.setItem,
    removeItem: Storage.prototype.removeItem,
    key: Storage.prototype.key,
    clear: Storage.prototype.clear
  };

  function num(v){ return Number(v || 0) || 0; }
  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function pct(ok, total){ return total > 0 ? Math.round(ok / total * 100) : 0; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function safeJSONParse(raw, fallback){ try { return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; } }
  function setMetaRaw(key, value){ try { originalStorage.setItem.call(localStorage, key, String(value)); } catch (_) {} }
  function getMetaRaw(key, fallback){ try { var raw = originalStorage.getItem.call(localStorage, key); return raw == null ? fallback : raw; } catch (_) { return fallback; } }
  function setMetaJSON(key, value){ try { originalStorage.setItem.call(localStorage, key, JSON.stringify(value)); } catch (_) {} }
  function getMetaJSON(key, fallback){ return safeJSONParse(getMetaRaw(key, ''), fallback); }
  function nowTs(){ return Date.now(); }
  function todayIso(){ return new Date().toISOString().slice(0, 10); }
  function isGradePage(){ return typeof window.GRADE_NUM !== 'undefined' && !!document.getElementById('s-main'); }
  function isDashboardPage(){ return !!document.getElementById('grades') && !!document.getElementById('activity'); }
  function isDiagnosticPage(){ return !!document.getElementById('s-select') || !!document.querySelector('.subj-grid'); }
  function gradeKey(){ return String(window.GRADE_NUM || ''); }
  function gradeTitle(){ return window.GRADE_TITLE || (gradeKey() ? (gradeKey() + ' класс') : 'Класс'); }
  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function decl(n, one, few, many){
    if (typeof window.declNum === 'function') return window.declNum(n, one, few, many);
    var a = Math.abs(n) % 100;
    var b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  }
  function formatDate(ts, opts){
    try { return new Date(ts).toLocaleDateString('ru-RU', opts || { day:'numeric', month:'long' }); }
    catch (_) { return ''; }
  }
  function hashText(text){
    var str = String(text || '');
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return (h >>> 0).toString(36);
  }
  function normalizePin(pin){ return String(pin || '').replace(/\D/g, '').slice(0, 8); }
  function hashPin(pin){ return hashText('pin:' + normalizePin(pin)); }

  function ensureProfiles(){
    var rows = getMetaJSON(PROFILE_KEY, null);
    if (!Array.isArray(rows) || !rows.length) {
      rows = [{ id:'p1', name:'Основной', createdAt: nowTs(), controlMode:false, pinHash:'' }];
      setMetaJSON(PROFILE_KEY, rows);
    }
    var clean = [];
    var used = {};
    rows.forEach(function(row, idx){
      if (!row || typeof row !== 'object') return;
      var id = String(row.id || ('p' + (idx + 1))).replace(/[^a-z0-9_-]/gi, '').slice(0, 24) || ('p' + (idx + 1));
      if (used[id]) return;
      used[id] = 1;
      clean.push({
        id: id,
        name: String(row.name || 'Профиль').slice(0, 32),
        createdAt: num(row.createdAt) || nowTs(),
        controlMode: !!row.controlMode,
        pinHash: String(row.pinHash || '')
      });
    });
    if (!clean.length) clean.push({ id:'p1', name:'Основной', createdAt: nowTs(), controlMode:false, pinHash:'' });
    setMetaJSON(PROFILE_KEY, clean);
    var active = getMetaRaw(ACTIVE_KEY, clean[0].id);
    if (!clean.some(function(row){ return row.id === active; })) {
      active = clean[0].id;
      setMetaRaw(ACTIVE_KEY, active);
    }
    return clean;
  }

  function loadProfiles(){ return ensureProfiles(); }
  function saveProfiles(rows){ setMetaJSON(PROFILE_KEY, rows || []); return loadProfiles(); }
  function activeProfileId(){ return getMetaRaw(ACTIVE_KEY, loadProfiles()[0].id); }
  function setActiveProfileId(id){ setMetaRaw(ACTIVE_KEY, id); }
  function getProfileById(id){ var rows = loadProfiles(); for (var i = 0; i < rows.length; i++) if (rows[i].id === id) return rows[i]; return rows[0] || null; }
  function activeProfile(){ return getProfileById(activeProfileId()); }
  function isTrainerKey(key){ return typeof key === 'string' && key.indexOf('trainer_') === 0; }
  function shouldScope(key){ return isTrainerKey(key) && key.indexOf(META_PREFIX) !== 0 && !GLOBAL_KEYS[key]; }
  function scopedKeyFor(profileId, key){ return shouldScope(key) ? (SCOPE_PREFIX + profileId + ':' + key) : key; }
  function scopedKey(key){ return scopedKeyFor(activeProfileId(), key); }

  function listRawKeys(){
    var keys = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = originalStorage.key.call(localStorage, i);
        if (key) keys.push(key);
      }
    } catch (_) {}
    return keys;
  }

  function migrateDefaultProfile(){
    if (getMetaRaw(MIGRATION_KEY, '')) return;
    var profiles = loadProfiles();
    var active = getMetaRaw(ACTIVE_KEY, profiles[0].id || 'p1');
    var keys = listRawKeys();
    keys.forEach(function(key){
      if (!shouldScope(key)) return;
      var target = scopedKeyFor(active, key);
      var existing = originalStorage.getItem.call(localStorage, target);
      if (existing != null) return;
      var value = originalStorage.getItem.call(localStorage, key);
      if (value != null) originalStorage.setItem.call(localStorage, target, value);
    });
    setMetaRaw(MIGRATION_KEY, '1');
  }

  function installStorageScope(){
    if (window.__wave35StorageScoped) return;
    ensureProfiles();
    migrateDefaultProfile();
    Storage.prototype.getItem = function(key){ return originalStorage.getItem.call(this, scopedKey(key)); };
    Storage.prototype.setItem = function(key, value){ return originalStorage.setItem.call(this, scopedKey(key), String(value)); };
    Storage.prototype.removeItem = function(key){ return originalStorage.removeItem.call(this, scopedKey(key)); };
    window.__wave35StorageScoped = true;
  }
  installStorageScope();

  function rawGetScoped(profileId, key){
    try { return originalStorage.getItem.call(localStorage, scopedKeyFor(profileId, key)); }
    catch (_) { return null; }
  }
  function rawSetScoped(profileId, key, value){
    try { originalStorage.setItem.call(localStorage, scopedKeyFor(profileId, key), String(value)); }
    catch (_) {}
  }
  function rawRemoveScoped(profileId, key){
    try { originalStorage.removeItem.call(localStorage, scopedKeyFor(profileId, key)); }
    catch (_) {}
  }
  function getScopedJSON(profileId, key, fallback){ return safeJSONParse(rawGetScoped(profileId, key), fallback); }
  function setScopedJSON(profileId, key, value){ rawSetScoped(profileId, key, JSON.stringify(value)); }

  function syncProfileNameFromPlayer(){
    var profile = activeProfile();
    if (!profile) return;
    var playerName = '';
    try { playerName = localStorage.getItem('trainer_player_name') || ''; } catch (_) { playerName = ''; }
    playerName = String(playerName || '').trim();
    if (!playerName || playerName === 'Ученик') return;
    if (profile.name === playerName) return;
    var rows = loadProfiles().map(function(row){ return row.id === profile.id ? { id: row.id, name: playerName, createdAt: row.createdAt, controlMode: !!row.controlMode, pinHash: row.pinHash || '' } : row; });
    saveProfiles(rows);
  }

  function createProfile(name, opts){
    opts = opts || {};
    var rows = loadProfiles();
    var next = 1;
    while (rows.some(function(row){ return row.id === ('p' + next); })) next += 1;
    var id = 'p' + next;
    var cleanName = String(name || ('Профиль ' + next)).trim().slice(0, 32) || ('Профиль ' + next);
    var row = {
      id: id,
      name: cleanName,
      createdAt: nowTs(),
      controlMode: !!opts.controlMode,
      pinHash: opts.pin ? hashPin(opts.pin) : ''
    };
    rows.push(row);
    saveProfiles(rows);
    rawSetScoped(id, 'trainer_player_name', cleanName);
    if (typeof window.genCode === 'function') rawSetScoped(id, 'trainer_player_code', window.genCode());
    return row;
  }

  function renameProfile(id, name){
    var rows = loadProfiles();
    var cleanName = String(name || '').trim().slice(0, 32);
    if (!cleanName) return loadProfiles();
    rows = rows.map(function(row){
      return row.id === id ? { id: row.id, name: cleanName, createdAt: row.createdAt, controlMode: !!row.controlMode, pinHash: row.pinHash || '' } : row;
    });
    saveProfiles(rows);
    rawSetScoped(id, 'trainer_player_name', cleanName);
    return rows;
  }

  function setProfilePin(id, pin){
    var cleanPin = normalizePin(pin);
    if (cleanPin.length < 4) throw new Error('PIN должен содержать минимум 4 цифры');
    var rows = loadProfiles().map(function(row){
      return row.id === id ? { id: row.id, name: row.name, createdAt: row.createdAt, controlMode: !!row.controlMode, pinHash: hashPin(cleanPin) } : row;
    });
    saveProfiles(rows);
    return getProfileById(id);
  }

  function clearProfilePin(id){
    var rows = loadProfiles().map(function(row){
      return row.id === id ? { id: row.id, name: row.name, createdAt: row.createdAt, controlMode: false, pinHash: '' } : row;
    });
    saveProfiles(rows);
    return getProfileById(id);
  }

  function setControlMode(id, enabled){
    var profile = getProfileById(id);
    if (!profile) return null;
    if (enabled && !profile.pinHash) throw new Error('Сначала задай PIN, потом включай контрольный режим');
    var rows = loadProfiles().map(function(row){
      return row.id === id ? { id: row.id, name: row.name, createdAt: row.createdAt, controlMode: !!enabled, pinHash: row.pinHash || '' } : row;
    });
    saveProfiles(rows);
    return getProfileById(id);
  }

  function deleteProfile(id){
    var rows = loadProfiles();
    if (rows.length <= 1) throw new Error('Нужен хотя бы один профиль');
    rows = rows.filter(function(row){ return row.id !== id; });
    saveProfiles(rows);
    if (activeProfileId() === id) setActiveProfileId(rows[0].id);
    listRawKeys().forEach(function(key){ if (String(key).indexOf(SCOPE_PREFIX + id + ':') === 0) originalStorage.removeItem.call(localStorage, key); });
    return rows;
  }

  function authState(){ return getMetaJSON(AUTH_KEY, { id:'', until:0 }); }
  function isUnlocked(profileId){
    var auth = authState();
    return auth && auth.id === profileId && num(auth.until) > nowTs();
  }
  function unlockProfile(profileId, ttlMs){ setMetaJSON(AUTH_KEY, { id: profileId, until: nowTs() + (ttlMs || 20 * 60 * 1000) }); }
  function clearUnlock(){ setMetaJSON(AUTH_KEY, { id:'', until:0 }); }
  function verifyProfilePin(profileId, pin){
    var profile = getProfileById(profileId);
    if (!profile || !profile.pinHash) return true;
    return profile.pinHash === hashPin(pin);
  }

  function safeJSON(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function planKey(grade){ return 'trainer_plan_' + String(grade || gradeKey()); }
  function defaultPlan(grade){ return { grade: String(grade || gradeKey()), weeklyTasks: 70, weeklyDays: 5, accuracyTarget: 75, note: '', updatedAt: 0 }; }
  function loadPlan(grade){
    var raw = safeJSON(planKey(grade), null);
    if (!raw || typeof raw !== 'object') return null;
    var plan = defaultPlan(grade);
    plan.weeklyTasks = clamp(num(raw.weeklyTasks || plan.weeklyTasks), 0, 500);
    plan.weeklyDays = clamp(num(raw.weeklyDays || plan.weeklyDays), 0, 7);
    plan.accuracyTarget = clamp(num(raw.accuracyTarget || plan.accuracyTarget), 0, 100);
    plan.note = String(raw.note || '').slice(0, 180);
    plan.updatedAt = num(raw.updatedAt || nowTs());
    return plan;
  }
  function savePlan(grade, plan){
    var merged = defaultPlan(grade);
    plan = plan || {};
    merged.weeklyTasks = clamp(num(plan.weeklyTasks || merged.weeklyTasks), 0, 500);
    merged.weeklyDays = clamp(num(plan.weeklyDays || merged.weeklyDays), 0, 7);
    merged.accuracyTarget = clamp(num(plan.accuracyTarget || merged.accuracyTarget), 0, 100);
    merged.note = String(plan.note || '').slice(0, 180);
    merged.updatedAt = nowTs();
    try { localStorage.setItem(planKey(grade), JSON.stringify(merged)); } catch (_) {}
    return merged;
  }
  function clearPlan(grade){ try { localStorage.removeItem(planKey(grade)); } catch (_) {} }

  function collectActivityMapForGrade(grade){
    var map = {};
    var history = safeJSON('trainer_activity_' + grade, []);
    var daily = safeJSON('trainer_daily_' + grade, null);
    (Array.isArray(history) ? history : []).forEach(function(row){
      if (!row || !row.date) return;
      map[row.date] = {
        total: num(row.total || (num(row.ok) + num(row.err))),
        ok: num(row.ok),
        err: num(row.err)
      };
    });
    if (daily && daily.date) {
      map[daily.date] = { total: num(daily.ok) + num(daily.err), ok: num(daily.ok), err: num(daily.err) };
    }
    return map;
  }

  function lastDates(count){
    var rows = [];
    var base = new Date();
    for (var i = count - 1; i >= 0; i--) {
      var d = new Date(base);
      d.setHours(0, 0, 0, 0);
      d.setDate(base.getDate() - i);
      rows.push(d.toISOString().slice(0, 10));
    }
    return rows;
  }

  function summarizeWeek(grade){
    var activityMap = collectActivityMapForGrade(grade);
    var dates = lastDates(7);
    var total = 0, ok = 0, err = 0, active = 0;
    dates.forEach(function(date){
      var row = activityMap[date] || { total:0, ok:0, err:0 };
      total += num(row.total);
      ok += num(row.ok);
      err += num(row.err);
      if (num(row.total) > 0) active += 1;
    });
    return { total: total, ok: ok, err: err, activeDays: active, accuracy: pct(ok, total) };
  }

  function planProgress(grade){
    var plan = loadPlan(grade);
    var actual = summarizeWeek(grade);
    if (!plan) return { grade: String(grade), hasPlan:false, plan:null, actual:actual, tasksPct:0, daysPct:0, accPct:0, status:'no-plan', label:'План не задан' };
    var tasksPct = plan.weeklyTasks > 0 ? clamp(Math.round(actual.total / plan.weeklyTasks * 100), 0, 200) : 100;
    var daysPct = plan.weeklyDays > 0 ? clamp(Math.round(actual.activeDays / plan.weeklyDays * 100), 0, 200) : 100;
    var accPct = plan.accuracyTarget > 0 ? clamp(Math.round(actual.accuracy / plan.accuracyTarget * 100), 0, 200) : 100;
    var composite = Math.round((Math.min(tasksPct, 100) + Math.min(daysPct, 100) + Math.min(accPct, 100)) / 3);
    var status = composite >= 95 ? 'ahead' : composite >= 70 ? 'on-track' : 'behind';
    var label = status === 'ahead' ? 'с запасом' : status === 'on-track' ? 'по плану' : 'ниже плана';
    return { grade: String(grade), hasPlan:true, plan:plan, actual:actual, tasksPct:tasksPct, daysPct:daysPct, accPct:accPct, composite: composite, status:status, label:label };
  }

  function parseRuDate(text){
    var raw = String(text || '').trim().toLowerCase();
    if (!raw) return null;
    var parts = raw.split(/\s+/);
    var day = num(parts[0]);
    var month = MONTHS.indexOf(parts[1]);
    if (!day || month < 0) return null;
    var now = new Date();
    var year = now.getFullYear();
    var date = new Date(year, month, day, 12, 0, 0, 0);
    if (date.getTime() < nowTs() - 86400000) date = new Date(year + 1, month, day, 12, 0, 0, 0);
    return date;
  }

  function daysUntilDate(date){
    if (!date) return null;
    return Math.max(0, Math.ceil((date.getTime() - nowTs()) / 86400000));
  }

  function currentSubjectMap(){
    var map = {};
    try {
      (window.SUBJ || []).forEach(function(subj){ if (subj && subj.id) map[subj.id] = subj; });
    } catch (_) {}
    return map;
  }

  function labelForSubjectId(id, fallback){
    return SUBJECT_LABELS[id] || fallback || String(id || 'Предмет');
  }

  function collectUpcomingForGrade(grade, subjectLookup){
    var payload = safeJSON('trainer_dates_' + grade, {});
    var rows = [];
    Object.keys(payload || {}).forEach(function(id){
      var text = payload[id];
      var date = parseRuDate(text);
      if (!date) return;
      var subj = subjectLookup && subjectLookup[id];
      rows.push({
        grade: String(grade),
        id: id,
        text: String(text),
        date: date,
        days: daysUntilDate(date),
        label: subj ? subj.nm : labelForSubjectId(id, id)
      });
    });
    rows.sort(function(a, b){ return a.date.getTime() - b.date.getTime(); });
    return rows;
  }

  function currentCountdown(){
    if (!isGradePage()) return null;
    var rows = collectUpcomingForGrade(gradeKey(), currentSubjectMap());
    return rows.length ? rows[0] : null;
  }

  function dashboardPlans(){
    var grades = ['1','2','3','4','5','6','7','8','9','10','11'];
    var rows = grades.map(function(grade){ return planProgress(grade); }).filter(function(row){ return row.hasPlan; });
    rows.sort(function(a, b){ return String(a.grade).localeCompare(String(b.grade), 'ru', { numeric:true }); });
    return rows;
  }

  function dashboardCountdowns(){
    var grades = ['1','2','3','4','5','6','7','8','9','10','11'];
    var all = [];
    grades.forEach(function(grade){ all = all.concat(collectUpcomingForGrade(grade, null)); });
    all.sort(function(a, b){ return a.date.getTime() - b.date.getTime(); });
    return all.slice(0, 8);
  }

  function ensureStyles(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave35-wrap{margin-top:12px}',
      '.wave35-card{background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:18px;padding:14px}',
      '.wave35-card.dark{background:linear-gradient(135deg,#1a1a2e,#2d2b55);color:#fff;border:none}',
      '.wave35-kicker{font-size:10px;text-transform:uppercase;letter-spacing:.08em;font-weight:800;color:var(--muted,#6b7280)}',
      '.wave35-card.dark .wave35-kicker{color:#c7d2fe}',
      '.wave35-title{margin-top:4px;font:800 14px/1.2 "Unbounded",system-ui,sans-serif}',
      '.wave35-sub{margin-top:6px;font-size:12px;line-height:1.5;color:var(--muted,#6b7280)}',
      '.wave35-card.dark .wave35-sub{color:#dbe4ff}',
      '.wave35-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}',
      '.wave35-metric{background:var(--bg,#f5f3ee);border:1px solid var(--border,#e5e7eb);border-radius:14px;padding:10px;text-align:center}',
      '.wave35-card.dark .wave35-metric{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.12)}',
      '.wave35-metric .n{font:900 18px/1 "Unbounded",system-ui,sans-serif}',
      '.wave35-metric .l{margin-top:6px;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted,#6b7280);font-weight:700}',
      '.wave35-card.dark .wave35-metric .l{color:#c7d2fe}',
      '.wave35-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}',
      '.wave35-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:var(--bg,#f5f3ee);border:1px solid var(--border,#e5e7eb);font-size:11px;color:var(--muted,#6b7280)}',
      '.wave35-card.dark .wave35-badge{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.12);color:#e2e8f0}',
      '.wave35-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}',
      '.wave35-btn{border:none;border-radius:12px;padding:10px 12px;font:800 12px/1.2 "Golos Text",system-ui,sans-serif;cursor:pointer;min-height:40px}',
      '.wave35-btn.dark{background:var(--text,#1a1a2e);color:var(--bg,#fff)}',
      '.wave35-btn.light{background:var(--bg,#f5f3ee);color:var(--text,#1a1a2e);border:1px solid var(--border,#e5e7eb)}',
      '.wave35-btn.accent{background:var(--accent,#2563eb);color:#fff}',
      '.wave35-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10020;padding:18px;display:flex;align-items:center;justify-content:center;overflow-y:auto}',
      '.wave35-modal{background:var(--card,#fff);color:var(--text,#1a1a2e);border:1px solid var(--border,#e5e7eb);border-radius:20px;max-width:460px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 18px 40px rgba(0,0,0,.28)}',
      '.wave35-modal-head{padding:18px 18px 14px;border-bottom:1px solid var(--border,#e5e7eb);position:sticky;top:0;background:inherit;z-index:2}',
      '.wave35-modal-body{padding:16px 18px 18px}',
      '.wave35-close{position:absolute;top:12px;right:12px;width:34px;height:34px;border:none;border-radius:999px;background:var(--bg,#f5f3ee);color:var(--text,#1a1a2e);font-size:18px;cursor:pointer}',
      '.wave35-field{display:grid;gap:6px;margin-top:10px}',
      '.wave35-field label{font-size:11px;font-weight:700;color:var(--muted,#6b7280);text-transform:uppercase;letter-spacing:.05em}',
      '.wave35-input,.wave35-textarea{width:100%;padding:11px 12px;border:1px solid var(--border,#e5e7eb);border-radius:12px;background:var(--bg,#f5f3ee);color:var(--text,#1a1a2e);font:600 14px/1.4 "Golos Text",system-ui,sans-serif}',
      '.wave35-textarea{min-height:92px;resize:vertical}',
      '.wave35-row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--border,#e5e7eb)}',
      '.wave35-row:last-child{border-bottom:none}',
      '.wave35-name{font-size:13px;font-weight:800}',
      '.wave35-meta{font-size:11px;color:var(--muted,#6b7280);margin-top:4px;line-height:1.45}',
      '.wave35-score{font:900 18px/1 "JetBrains Mono",monospace}',
      '.wave35-empty{padding:18px 10px;text-align:center;color:var(--muted,#6b7280);font-size:12px}',
      '.wave35-strip{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:10px}',
      '.wave35-chip{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);font-size:12px;font-weight:700;cursor:pointer;color:var(--text,#1a1a2e)}',
      '.wave35-chip small{font-size:10px;color:var(--muted,#6b7280);font-weight:700}',
      '.wave35-chip.lock{background:#fee2e2;color:#991b1b;border-color:#fecaca}',
      '.wave35-planlist{display:grid;gap:8px}',
      '.wave35-planrow{background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:14px;padding:12px}',
      '.wave35-track{height:8px;background:var(--border,#e5e7eb);border-radius:999px;overflow:hidden;margin-top:8px}',
      '.wave35-fill{height:100%;border-radius:999px}',
      '@media (max-width:560px){.wave35-grid{grid-template-columns:1fr}.wave35-actions{flex-direction:column}.wave35-btn{width:100%}}'
    ].join('');
    document.head.appendChild(style);
  }

  function overlay(title, subtitle){
    ensureStyles();
    var root = document.createElement('div');
    root.className = 'wave35-overlay';
    root.addEventListener('click', function(){ root.remove(); });
    var card = document.createElement('div');
    card.className = 'wave35-modal';
    card.addEventListener('click', function(ev){ ev.stopPropagation(); });
    var head = document.createElement('div');
    head.className = 'wave35-modal-head';
    head.innerHTML = '<div class="wave35-kicker">Wave 35</div><div class="wave35-title">' + esc(title || '') + '</div>' + (subtitle ? '<div class="wave35-sub">' + esc(subtitle) + '</div>' : '');
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'wave35-close';
    close.innerHTML = '×';
    close.addEventListener('click', function(){ root.remove(); });
    head.appendChild(close);
    var body = document.createElement('div');
    body.className = 'wave35-modal-body';
    card.appendChild(head);
    card.appendChild(body);
    root.appendChild(card);
    document.body.appendChild(root);
    return { root: root, card: card, body: body };
  }

  function colorForStatus(status){
    if (status === 'ahead') return 'var(--green,#16a34a)';
    if (status === 'on-track') return 'var(--accent,#2563eb)';
    if (status === 'behind') return 'var(--orange,#ea580c)';
    return 'var(--border,#e5e7eb)';
  }

  function currentPlanSummary(){
    var progress = planProgress(gradeKey());
    var countdown = currentCountdown();
    return { progress: progress, countdown: countdown };
  }

  function plannerCardHtml(){
    if (!isGradePage()) return '';
    var data = currentPlanSummary();
    var progress = data.progress;
    var countdown = data.countdown;
    var text = progress.hasPlan ? ('План недели: ' + progress.plan.weeklyTasks + ' задач, ' + progress.plan.weeklyDays + ' активных ' + decl(progress.plan.weeklyDays, 'день', 'дня', 'дней') + ', цель по точности ' + progress.plan.accuracyTarget + '%.') : 'Задай недельный план: сколько задач и в какие дни реально держать темп.';
    var badges = [];
    if (progress.hasPlan) badges.push('<span class="wave35-badge">🎯 ' + progress.label + '</span>');
    if (countdown) badges.push('<span class="wave35-badge">⏳ ' + esc(countdown.label) + ' · ' + countdown.days + ' ' + decl(countdown.days, 'день', 'дня', 'дней') + '</span>');
    if (activeProfile()) badges.push('<span class="wave35-badge">👤 ' + esc(activeProfile().name) + '</span>');
    return '<div class="wave35-card dark">' +
      '<div class="wave35-kicker">Planning / parent 2.0</div>' +
      '<div class="wave35-title">🎯 План недели и контроль</div>' +
      '<div class="wave35-sub">' + esc(text) + '</div>' +
      '<div class="wave35-grid">' +
        '<div class="wave35-metric"><div class="n">' + (progress.hasPlan ? (progress.actual.total + '/' + progress.plan.weeklyTasks) : progress.actual.total) + '</div><div class="l">задачи / неделя</div></div>' +
        '<div class="wave35-metric"><div class="n">' + (progress.hasPlan ? (progress.actual.activeDays + '/' + progress.plan.weeklyDays) : progress.actual.activeDays) + '</div><div class="l">активные дни</div></div>' +
        '<div class="wave35-metric"><div class="n">' + progress.actual.accuracy + '%</div><div class="l">точность 7 дней</div></div>' +
      '</div>' +
      '<div class="wave35-badges">' + badges.join('') + '</div>' +
      '<div class="wave35-actions"><button type="button" class="wave35-btn accent" id="wave35-open-plan">🎯 План</button><button type="button" class="wave35-btn light" id="wave35-open-profiles">👨‍👩‍👧 Профили</button><button type="button" class="wave35-btn light" id="wave35-open-lock">🔐 Контроль</button></div>' +
    '</div>';
  }

  function progressCardHtml(){
    if (!isGradePage()) return '';
    var progress = planProgress(gradeKey());
    if (!progress.hasPlan) {
      return '<div class="wave35-card"><div class="wave35-kicker">Progress vs plan</div><div class="wave35-title">План пока не задан</div><div class="wave35-sub">Задай недельную норму, и здесь появится сравнение по задачам, дням и точности.</div><div class="wave35-actions"><button type="button" class="wave35-btn accent" id="wave35-prog-plan">Задать план</button></div></div>';
    }
    return '<div class="wave35-card"><div class="wave35-kicker">Progress vs plan</div><div class="wave35-title">📈 Выполнение плана — ' + esc(progress.label) + '</div><div class="wave35-sub">За последние 7 дней: ' + progress.actual.total + ' задач, ' + progress.actual.activeDays + ' активных дней, ' + progress.actual.accuracy + '% точность.</div>' +
      '<div class="wave35-row"><div><div class="wave35-name">Задачи</div><div class="wave35-meta">' + progress.actual.total + ' из ' + progress.plan.weeklyTasks + '</div></div><div class="wave35-score" style="color:' + colorForStatus(progress.tasksPct >= 100 ? 'ahead' : progress.tasksPct >= 70 ? 'on-track' : 'behind') + '">' + progress.tasksPct + '%</div></div>' +
      '<div class="wave35-row"><div><div class="wave35-name">Активные дни</div><div class="wave35-meta">' + progress.actual.activeDays + ' из ' + progress.plan.weeklyDays + '</div></div><div class="wave35-score" style="color:' + colorForStatus(progress.daysPct >= 100 ? 'ahead' : progress.daysPct >= 70 ? 'on-track' : 'behind') + '">' + progress.daysPct + '%</div></div>' +
      '<div class="wave35-row"><div><div class="wave35-name">Точность</div><div class="wave35-meta">цель ' + progress.plan.accuracyTarget + '%</div></div><div class="wave35-score" style="color:' + colorForStatus(progress.accPct >= 100 ? 'ahead' : progress.accPct >= 90 ? 'on-track' : 'behind') + '">' + progress.actual.accuracy + '%</div></div>' +
      '<div class="wave35-actions"><button type="button" class="wave35-btn light" id="wave35-prog-edit">Изменить план</button></div></div>';
  }

  function renderPlannerCard(){
    if (!isGradePage()) return;
    ensureStyles();
    var host = document.getElementById('wave35-main-card');
    if (!host) {
      host = document.createElement('div');
      host.id = 'wave35-main-card';
      host.className = 'wave35-wrap';
      var anchor = document.getElementById('daily-meter') || document.getElementById('main-search-slot');
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(host, anchor.nextSibling);
    }
    if (!host) return;
    host.innerHTML = plannerCardHtml();
    var btnPlan = host.querySelector('#wave35-open-plan');
    var btnProfiles = host.querySelector('#wave35-open-profiles');
    var btnLock = host.querySelector('#wave35-open-lock');
    btnPlan && btnPlan.addEventListener('click', showPlanModal);
    btnProfiles && btnProfiles.addEventListener('click', showProfilesModal);
    btnLock && btnLock.addEventListener('click', showControlModal);
  }

  function renderProfileStrip(){
    if (!isGradePage()) return;
    ensureStyles();
    var host = document.getElementById('player-badge');
    if (!host) return;
    var strip = host.querySelector('.wave35-strip');
    if (!strip) {
      strip = document.createElement('div');
      strip.className = 'wave35-strip';
      host.appendChild(strip);
    }
    var profile = activeProfile();
    var plan = planProgress(gradeKey());
    strip.innerHTML = '';
    var btnProfile = document.createElement('button');
    btnProfile.type = 'button';
    btnProfile.className = 'wave35-chip';
    btnProfile.innerHTML = '<span>👤 ' + esc(profile ? profile.name : 'Профиль') + '</span><small>' + (profile && profile.controlMode ? 'контроль включён' : 'локальный профиль') + '</small>';
    btnProfile.addEventListener('click', showProfilesModal);
    strip.appendChild(btnProfile);
    var btnPlan = document.createElement('button');
    btnPlan.type = 'button';
    btnPlan.className = 'wave35-chip';
    btnPlan.innerHTML = '<span>🎯 ' + (plan.hasPlan ? plan.label : 'без плана') + '</span><small>' + (plan.hasPlan ? (plan.actual.total + '/' + plan.plan.weeklyTasks + ' задач') : 'задать план') + '</small>';
    btnPlan.addEventListener('click', showPlanModal);
    strip.appendChild(btnPlan);
    if (profile && profile.controlMode) {
      var btnLock = document.createElement('button');
      btnLock.type = 'button';
      btnLock.className = 'wave35-chip lock';
      btnLock.innerHTML = '<span>🔐 PIN</span><small>' + (isUnlocked(profile.id) ? 'доступ открыт' : 'требуется для настроек') + '</small>';
      btnLock.addEventListener('click', showControlModal);
      strip.appendChild(btnLock);
    }
  }

  function renderProgressAddon(){
    if (!isGradePage()) return;
    ensureStyles();
    var host = document.getElementById('prog-content');
    if (!host) return;
    var card = document.getElementById('wave35-progress-card');
    if (!card) {
      card = document.createElement('div');
      card.id = 'wave35-progress-card';
      card.className = 'wave35-wrap';
      host.insertBefore(card, host.firstChild);
    }
    card.innerHTML = progressCardHtml();
    var btnA = card.querySelector('#wave35-prog-plan');
    var btnB = card.querySelector('#wave35-prog-edit');
    btnA && btnA.addEventListener('click', showPlanModal);
    btnB && btnB.addEventListener('click', showPlanModal);
  }

  function planEditorFields(plan){
    plan = plan || defaultPlan(gradeKey());
    return '' +
      '<div class="wave35-field"><label>Задач в неделю</label><input class="wave35-input" id="wave35-plan-tasks" type="number" min="0" max="500" value="' + esc(plan.weeklyTasks) + '"></div>' +
      '<div class="wave35-field"><label>Активных дней в неделю</label><input class="wave35-input" id="wave35-plan-days" type="number" min="0" max="7" value="' + esc(plan.weeklyDays) + '"></div>' +
      '<div class="wave35-field"><label>Цель по точности, %</label><input class="wave35-input" id="wave35-plan-acc" type="number" min="0" max="100" value="' + esc(plan.accuracyTarget) + '"></div>' +
      '<div class="wave35-field"><label>Комментарий для родителя / ученика</label><textarea class="wave35-textarea" id="wave35-plan-note" placeholder="Например: сначала русский и математика, потом повторение ошибок">' + esc(plan.note || '') + '</textarea></div>';
  }

  function planInsightsHtml(){
    var progress = planProgress(gradeKey());
    var countdown = currentCountdown();
    var badges = '';
    if (countdown) badges += '<span class="wave35-badge">⏳ Ближайшая дата: ' + esc(countdown.label) + ' · ' + countdown.text + ' · через ' + countdown.days + ' ' + decl(countdown.days, 'день', 'дня', 'дней') + '</span>';
    if (progress.hasPlan) badges += '<span class="wave35-badge">📈 Сейчас: ' + progress.actual.total + ' задач · ' + progress.actual.activeDays + ' активных дней · ' + progress.actual.accuracy + '%</span>';
    return '<div class="wave35-card" style="margin-bottom:10px"><div class="wave35-kicker">Week snapshot</div><div class="wave35-title">Текущая неделя</div><div class="wave35-sub">План здесь задаётся на текущий класс и сравнивается только с последними 7 днями внутри этого профиля.</div><div class="wave35-badges">' + badges + '</div></div>';
  }

  function showPlanModal(){
    if (!isGradePage()) return;
    var current = loadPlan(gradeKey()) || defaultPlan(gradeKey());
    var ui = overlay('🎯 Недельный план', 'План задаётся отдельно для каждого класса и отдельного профиля.');
    ui.body.innerHTML = planInsightsHtml() + planEditorFields(current) +
      '<div class="wave35-actions"><button type="button" class="wave35-btn accent" id="wave35-save-plan">Сохранить</button><button type="button" class="wave35-btn light" id="wave35-clear-plan">Очистить план</button></div>';
    ui.body.querySelector('#wave35-save-plan').addEventListener('click', function(){
      savePlan(gradeKey(), {
        weeklyTasks: ui.body.querySelector('#wave35-plan-tasks').value,
        weeklyDays: ui.body.querySelector('#wave35-plan-days').value,
        accuracyTarget: ui.body.querySelector('#wave35-plan-acc').value,
        note: ui.body.querySelector('#wave35-plan-note').value
      });
      renderPlannerCard();
      renderProgressAddon();
      patchLastParentOverlay();
      ui.root.remove();
    });
    ui.body.querySelector('#wave35-clear-plan').addEventListener('click', function(){
      clearPlan(gradeKey());
      renderPlannerCard();
      renderProgressAddon();
      ui.root.remove();
    });
  }

  function profileRowHtml(row, current){
    var scopedName = rawGetScoped(row.id, 'trainer_player_name') || row.name;
    return '<div class="wave35-row" data-id="' + esc(row.id) + '">' +
      '<div><div class="wave35-name">' + esc(row.name) + (current ? ' · активный' : '') + '</div><div class="wave35-meta">Внутри профиля: ' + esc(scopedName) + (row.controlMode ? ' · контроль включён' : '') + (row.pinHash ? ' · PIN задан' : ' · без PIN') + '</div></div>' +
      '<div class="wave35-actions" style="margin-top:0"><button type="button" class="wave35-btn light wave35-switch">' + (current ? 'Открыт' : 'Открыть') + '</button></div>' +
    '</div>';
  }

  function requestPinModal(targetProfileId, done){
    var profile = getProfileById(targetProfileId || activeProfileId());
    if (!profile || !profile.pinHash) { done && done(true); return; }
    if (isUnlocked(profile.id)) { done && done(true); return; }
    var ui = overlay('🔐 Введите PIN', 'PIN относится к профилю «' + profile.name + '». Доступ откроется на 20 минут.');
    ui.body.innerHTML = '<div class="wave35-field"><label>PIN</label><input class="wave35-input" id="wave35-pin-input" type="password" inputmode="numeric" placeholder="4–8 цифр"></div><div class="wave35-actions"><button type="button" class="wave35-btn accent" id="wave35-pin-ok">Открыть</button><button type="button" class="wave35-btn light" id="wave35-pin-cancel">Отмена</button></div>';
    var input = ui.body.querySelector('#wave35-pin-input');
    ui.body.querySelector('#wave35-pin-cancel').addEventListener('click', function(){ ui.root.remove(); done && done(false); });
    ui.body.querySelector('#wave35-pin-ok').addEventListener('click', function(){
      var pin = normalizePin(input.value);
      if (!pin) { input.focus(); return; }
      if (!verifyProfilePin(profile.id, pin)) { alert('Неверный PIN'); input.focus(); input.select && input.select(); return; }
      unlockProfile(profile.id);
      ui.root.remove();
      done && done(true);
    });
    setTimeout(function(){ try { input.focus(); } catch (_) {} }, 30);
  }

  function withControlAccess(action){
    var profile = activeProfile();
    if (!profile || !profile.controlMode || !profile.pinHash) { action && action(); return; }
    requestPinModal(profile.id, function(ok){ if (ok) action && action(); });
  }

  function switchProfile(id){
    var target = getProfileById(id);
    if (!target) return false;
    var doSwitch = function(){ setActiveProfileId(id); location.reload(); };
    if (target.pinHash && !isUnlocked(target.id)) { requestPinModal(target.id, function(ok){ if (ok) doSwitch(); }); return true; }
    doSwitch();
    return true;
  }

  function showProfilesModal(){
    var ui = overlay('👨‍👩‍👧 Профили', 'Каждый профиль получает свой localStorage namespace: прогресс, дневник, планы, диагностики и экзаменные попытки разделены.');
    var rows = loadProfiles();
    ui.body.innerHTML = '<div class="wave35-card" style="margin-bottom:10px"><div class="wave35-kicker">Active profile</div><div class="wave35-title">' + esc(activeProfile().name) + '</div><div class="wave35-sub">Переключение профиля перезагрузит страницу и покажет отдельные данные.</div></div>' +
      '<div class="wave35-card" id="wave35-profile-list">' + rows.map(function(row){ return profileRowHtml(row, row.id === activeProfileId()); }).join('') + '</div>' +
      '<div class="wave35-card" style="margin-top:10px"><div class="wave35-kicker">Новый профиль</div><div class="wave35-field"><label>Имя профиля</label><input class="wave35-input" id="wave35-new-profile-name" placeholder="Например: Миша"></div><div class="wave35-actions"><button type="button" class="wave35-btn accent" id="wave35-create-profile">Создать</button><button type="button" class="wave35-btn light" id="wave35-open-control">PIN / контроль</button></div></div>';
    Array.prototype.forEach.call(ui.body.querySelectorAll('.wave35-switch'), function(btn){
      btn.addEventListener('click', function(){
        var row = btn.closest('[data-id]');
        if (!row) return;
        switchProfile(row.getAttribute('data-id'));
      });
    });
    ui.body.querySelector('#wave35-create-profile').addEventListener('click', function(){
      var input = ui.body.querySelector('#wave35-new-profile-name');
      var name = String(input.value || '').trim();
      if (!name) { input.focus(); return; }
      var created = createProfile(name);
      switchProfile(created.id);
    });
    ui.body.querySelector('#wave35-open-control').addEventListener('click', showControlModal);
  }

  function showControlModal(){
    var profile = activeProfile();
    var ui = overlay('🔐 Контрольный режим', 'PIN защищает переключение профилей и действия, которые меняют состояние класса: импорт, сброс и выбор класса.');
    ui.body.innerHTML = '<div class="wave35-card" style="margin-bottom:10px"><div class="wave35-kicker">Текущий профиль</div><div class="wave35-title">' + esc(profile.name) + '</div><div class="wave35-sub">' + (profile.controlMode ? 'Контрольный режим включён.' : 'Контрольный режим пока выключен.') + (profile.pinHash ? ' PIN уже задан.' : ' PIN ещё не задан.') + '</div><div class="wave35-badges"><span class="wave35-badge">' + (isUnlocked(profile.id) ? '✅ доступ открыт' : '⏳ доступ по PIN') + '</span></div></div>' +
      '<div class="wave35-field"><label>Новое имя профиля</label><input class="wave35-input" id="wave35-profile-name" value="' + esc(profile.name) + '"></div>' +
      '<div class="wave35-field"><label>PIN</label><input class="wave35-input" id="wave35-profile-pin" type="password" inputmode="numeric" placeholder="4–8 цифр"></div>' +
      '<div class="wave35-actions"><button type="button" class="wave35-btn accent" id="wave35-save-control">Сохранить</button><button type="button" class="wave35-btn light" id="wave35-toggle-control">' + (profile.controlMode ? 'Выключить контроль' : 'Включить контроль') + '</button></div>' +
      '<div class="wave35-actions"><button type="button" class="wave35-btn light" id="wave35-clear-pin">Убрать PIN</button><button type="button" class="wave35-btn light" id="wave35-delete-profile">Удалить профиль</button></div>';
    ui.body.querySelector('#wave35-save-control').addEventListener('click', function(){
      var name = ui.body.querySelector('#wave35-profile-name').value;
      var pin = normalizePin(ui.body.querySelector('#wave35-profile-pin').value);
      if (name.trim()) renameProfile(profile.id, name);
      if (pin) setProfilePin(profile.id, pin);
      renderProfileStrip();
      renderPlannerCard();
      ui.root.remove();
    });
    ui.body.querySelector('#wave35-toggle-control').addEventListener('click', function(){
      try {
        setControlMode(profile.id, !profile.controlMode);
        renderProfileStrip();
        ui.root.remove();
      } catch (err) {
        alert(err && err.message ? err.message : 'Не удалось изменить режим');
      }
    });
    ui.body.querySelector('#wave35-clear-pin').addEventListener('click', function(){
      clearProfilePin(profile.id);
      clearUnlock();
      renderProfileStrip();
      ui.root.remove();
    });
    ui.body.querySelector('#wave35-delete-profile').addEventListener('click', function(){
      if (!confirm('Удалить профиль «' + profile.name + '» вместе с его локальными данными?')) return;
      try {
        deleteProfile(profile.id);
        clearUnlock();
        ui.root.remove();
        location.reload();
      } catch (err) {
        alert(err && err.message ? err.message : 'Не удалось удалить профиль');
      }
    });
  }

  function planStatusText(row){
    if (!row || !row.hasPlan) return 'План не задан';
    return row.actual.total + '/' + row.plan.weeklyTasks + ' задач · ' + row.actual.activeDays + '/' + row.plan.weeklyDays + ' дней · ' + row.actual.accuracy + '%';
  }

  function dashboardHtml(){
    ensureStyles();
    var planRows = dashboardPlans();
    var countdownRows = dashboardCountdowns();
    var profile = activeProfile();
    var plansHtml = planRows.length ? planRows.map(function(row){
      return '<div class="wave35-planrow"><div class="wave35-row"><div><div class="wave35-name">' + esc(row.grade + ' класс') + '</div><div class="wave35-meta">' + esc(planStatusText(row)) + '</div></div><div class="wave35-score" style="color:' + colorForStatus(row.status) + '">' + row.composite + '%</div></div><div class="wave35-track"><div class="wave35-fill" style="width:' + clamp(row.composite, 0, 100) + '%;background:' + colorForStatus(row.status) + '"></div></div></div>';
    }).join('') : '<div class="wave35-empty">Планы по классам пока не заданы.</div>';
    var countdownHtml = countdownRows.length ? countdownRows.slice(0, 4).map(function(row){
      return '<div class="wave35-row"><div><div class="wave35-name">' + esc(row.grade + ' класс · ' + row.label) + '</div><div class="wave35-meta">' + esc(row.text) + '</div></div><div class="wave35-score" style="color:' + colorForStatus(row.days <= 7 ? 'behind' : row.days <= 21 ? 'on-track' : 'ahead') + '">' + row.days + '</div></div>';
    }).join('') : '<div class="wave35-empty">Дата диагностик пока не заполнена.</div>';
    return '<div class="wave35-card"><div class="wave35-kicker">Planning / parent 2.0</div><div class="wave35-title">🎯 Планы, countdowns и профили</div><div class="wave35-sub">Активный профиль: ' + esc(profile.name) + (profile.controlMode ? ' · контроль включён.' : ' · свободный режим.') + '</div><div class="wave35-actions"><button type="button" class="wave35-btn accent" id="wave35-dash-profiles">Профили</button><button type="button" class="wave35-btn light" id="wave35-dash-control">Контроль</button></div></div>' +
      '<div class="wave35-card" style="margin-top:8px"><div class="wave35-kicker">Progress vs plan</div><div class="wave35-title">По классам</div><div class="wave35-planlist">' + plansHtml + '</div></div>' +
      '<div class="wave35-card" style="margin-top:8px"><div class="wave35-kicker">Countdowns</div><div class="wave35-title">Ближайшие даты</div>' + countdownHtml + '</div>';
  }

  function renderDashboardAddon(){
    if (!isDashboardPage()) return;
    ensureStyles();
    var host = document.getElementById('wave35-dashboard-root');
    if (!host) {
      host = document.createElement('div');
      host.id = 'wave35-dashboard-root';
      var anchor = document.querySelector('.dash-actions');
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(host, anchor);
    }
    if (!host) return;
    host.innerHTML = dashboardHtml();
    var btnProfiles = host.querySelector('#wave35-dash-profiles');
    var btnControl = host.querySelector('#wave35-dash-control');
    btnProfiles && btnProfiles.addEventListener('click', showProfilesModal);
    btnControl && btnControl.addEventListener('click', showControlModal);
  }

  function appendPlanToDashboardReport(){
    if (!isDashboardPage() || window.__wave35DashReportPatched || typeof window.buildDashboardReport !== 'function') return;
    var original = window.buildDashboardReport;
    window.buildDashboardReport = function(state){
      var text = original(state);
      var rows = dashboardPlans();
      var countdownRows = dashboardCountdowns();
      if (rows.length) {
        text += '\n━━━━━━━━━━━━━━━\nПланы по классам:';
        rows.forEach(function(row){ text += '\n' + row.grade + ' класс: ' + row.actual.total + '/' + row.plan.weeklyTasks + ' задач, ' + row.actual.activeDays + '/' + row.plan.weeklyDays + ' дней, ' + row.actual.accuracy + '%'; });
      }
      if (countdownRows.length) {
        text += '\nБлижайшие даты:';
        countdownRows.slice(0, 3).forEach(function(row){ text += '\n' + row.grade + ' класс · ' + row.label + ': через ' + row.days + ' ' + decl(row.days, 'день', 'дня', 'дней'); });
      }
      return text;
    };
    window.__wave35DashReportPatched = true;
  }

  function patchGradeReportSharing(){
    if (!isGradePage()) return;
    if (typeof window.shareReport === 'function' && !window.__wave35SharePatched) {
      var originalShare = window.shareReport;
      window.shareReport = function(){
        var progress = planProgress(gradeKey());
        if (typeof window.wave29Debug === 'object' && typeof window.wave29Debug.buildReportText === 'function' && typeof window.doShare === 'function') {
          var baseText = window.wave29Debug.buildReportText(window.wave29Debug.buildGradeSnapshot ? window.wave29Debug.buildGradeSnapshot() : {});
          if (progress.hasPlan) {
            baseText += '\n━━━━━━━━━━━━━━━\nПлан недели:';
            baseText += '\n' + progress.actual.total + '/' + progress.plan.weeklyTasks + ' задач';
            baseText += '\n' + progress.actual.activeDays + '/' + progress.plan.weeklyDays + ' активных дней';
            baseText += '\nТочность: ' + progress.actual.accuracy + '% при цели ' + progress.plan.accuracyTarget + '%';
            if (progress.plan.note) baseText += '\nКомментарий: ' + progress.plan.note;
          }
          window.doShare('Прогресс подготовки', baseText);
          return;
        }
        return originalShare.apply(this, arguments);
      };
      window.__wave35SharePatched = true;
    }
    if (typeof window.generateReport === 'function' && !window.__wave35GeneratePatched) {
      var originalGenerate = window.generateReport;
      window.generateReport = function(){
        var result = originalGenerate.apply(this, arguments);
        setTimeout(patchLastParentOverlay, 40);
        setTimeout(patchLastParentOverlay, 220);
        return result;
      };
      window.openParentReport = window.generateReport;
      window.__wave35GeneratePatched = true;
    }
  }

  function patchLastParentOverlay(){
    if (!isGradePage()) return;
    var overlay = document.querySelector('.wave29-overlay:last-of-type .wave29-body');
    if (!overlay || overlay.querySelector('.wave35-parent-plan')) return;
    var progress = planProgress(gradeKey());
    if (!progress.hasPlan) return;
    var block = document.createElement('div');
    block.className = 'wave29-section wave35-parent-plan';
    block.innerHTML = '<h4>🎯 План недели</h4><div class="wave35-sub" style="margin-top:0">Задачи: ' + progress.actual.total + '/' + progress.plan.weeklyTasks + ' · активные дни: ' + progress.actual.activeDays + '/' + progress.plan.weeklyDays + ' · точность: ' + progress.actual.accuracy + '% при цели ' + progress.plan.accuracyTarget + '%.</div>' + (progress.plan.note ? '<div class="wave35-banner" style="margin-top:8px">Комментарий: ' + esc(progress.plan.note) + '</div>' : '');
    overlay.insertBefore(block, overlay.firstChild);
  }

  function patchBackup(){
    if (!isGradePage()) return;
    if (typeof window.getBackupSnapshot === 'function' && !window.__wave35BackupPatched) {
      var originalGet = window.getBackupSnapshot;
      window.getBackupSnapshot = function(){
        var snap = originalGet.apply(this, arguments);
        snap.wave35 = snap.wave35 || {};
        snap.wave35.plan = loadPlan(gradeKey()) || null;
        snap.wave35.profile = { name: activeProfile().name, id: activeProfile().id, controlMode: !!activeProfile().controlMode, hasPin: !!activeProfile().pinHash };
        return snap;
      };
      var originalApply = typeof window.applyBackupSnapshot === 'function' ? window.applyBackupSnapshot : null;
      if (originalApply) {
        window.applyBackupSnapshot = function(snapshot){
          var res = originalApply.apply(this, arguments);
          try {
            if (snapshot && snapshot.wave35 && snapshot.wave35.plan) savePlan(gradeKey(), snapshot.wave35.plan);
          } catch (_) {}
          setTimeout(function(){ renderPlannerCard(); renderProgressAddon(); patchLastParentOverlay(); }, 60);
          return res;
        };
      }
      window.__wave35BackupPatched = true;
    }
  }

  function protectAdminActions(){
    if (!isGradePage() && !isDashboardPage()) return;
    ['showBackupModal','resetProgress','showClassSelect'].forEach(function(name){
      var fn = window[name];
      if (typeof fn !== 'function' || fn.__wave35Protected) return;
      var original = fn;
      var wrapped = function(){
        var self = this;
        var args = arguments;
        withControlAccess(function(){ original.apply(self, args); });
      };
      wrapped.__wave35Protected = true;
      window[name] = wrapped;
    });
  }

  function patchNameSync(){
    if (typeof window.setPlayerName === 'function' && !window.__wave35NameSyncPatched) {
      var original = window.setPlayerName;
      window.setPlayerName = function(name){
        var res = original.apply(this, arguments);
        syncProfileNameFromPlayer();
        renderProfileStrip();
        return res;
      };
      window.__wave35NameSyncPatched = true;
    }
    syncProfileNameFromPlayer();
  }

  function wrapRenderHooks(){
    if (isGradePage()) {
      if (typeof window.renderPlayerBadge === 'function' && !window.__wave35BadgeWrapped) {
        var oldBadge = window.renderPlayerBadge;
        window.renderPlayerBadge = function(){ var res = oldBadge.apply(this, arguments); renderProfileStrip(); return res; };
        window.__wave35BadgeWrapped = true;
      }
      if (typeof window.refreshMain === 'function' && !window.__wave35MainWrapped) {
        var oldMain = window.refreshMain;
        window.refreshMain = function(){ var res = oldMain.apply(this, arguments); renderPlannerCard(); return res; };
        window.__wave35MainWrapped = true;
      }
      if (typeof window.renderProg === 'function' && !window.__wave35ProgWrapped) {
        var oldProg = window.renderProg;
        window.renderProg = function(){ var res = oldProg.apply(this, arguments); renderProgressAddon(); return res; };
        window.__wave35ProgWrapped = true;
      }
    }
  }

  function initGrade(){
    wrapRenderHooks();
    patchNameSync();
    protectAdminActions();
    patchBackup();
    patchGradeReportSharing();
    renderPlannerCard();
    renderProfileStrip();
    if (typeof window.renderProg === 'function') setTimeout(function(){ try { renderProgressAddon(); } catch (_) {} }, 40);
    setTimeout(patchLastParentOverlay, 120);
  }

  function initDashboard(){
    appendPlanToDashboardReport();
    renderDashboardAddon();
    setTimeout(renderDashboardAddon, 50);
    window.addEventListener('dashboard-state-ready', function(){ renderDashboardAddon(); });
  }

  function init(){
    ensureStyles();
    protectAdminActions();
    patchNameSync();
    if (isGradePage()) initGrade();
    if (isDashboardPage()) initDashboard();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  window.wave35Debug = {
    version: VERSION,
    activeProfile: activeProfile,
    activeProfileId: activeProfileId,
    profiles: loadProfiles,
    createProfile: createProfile,
    renameProfile: renameProfile,
    deleteProfile: deleteProfile,
    switchProfile: switchProfile,
    setProfilePin: setProfilePin,
    clearProfilePin: clearProfilePin,
    setControlMode: setControlMode,
    verifyProfilePin: verifyProfilePin,
    unlockProfile: unlockProfile,
    isUnlocked: isUnlocked,
    loadPlan: loadPlan,
    savePlan: savePlan,
    clearPlan: clearPlan,
    planProgress: planProgress,
    currentCountdown: currentCountdown,
    dashboardPlans: dashboardPlans,
    dashboardCountdowns: dashboardCountdowns,
    scopedKeyFor: scopedKeyFor,
    rawGetScoped: rawGetScoped,
    rawSetScoped: rawSetScoped,
    getScopedJSON: getScopedJSON,
    setScopedJSON: setScopedJSON,
    shouldScope: shouldScope,
    migrateDefaultProfile: migrateDefaultProfile,
    patchLastParentOverlay: patchLastParentOverlay,
    showPlanModal: showPlanModal,
    showProfilesModal: showProfilesModal,
    showControlModal: showControlModal
  };
})();
/* --- wave37_mechanics.js --- */
(function(){
  if (typeof window === 'undefined') return;
  if (window.__wave37BootInstalled) return;
  window.__wave37BootInstalled = true;

  var STYLE_ID = 'wave37-mechanics-style';
  var GRADE_CONF_KEY = function(){ return 'trainer_confidence_' + String(window.GRADE_NUM || '10'); };
  var DIAG_CONF_KEY = 'trainer_diag_confidence_v1';
  var gradeSession = [];
  var diagSession = [];

  function escHtml(s){
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function lineHtml(s){ return escHtml(s).replace(/\n/g, '<br>'); }
  function cleanText(s){ return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function safeJSON(raw, fallback){ try { return raw ? JSON.parse(raw) : fallback; } catch(_) { return fallback; } }
  function storeTemplate(){
    return {
      version: 1,
      total: 0,
      ok: 0,
      wrong: 0,
      overconfident: 0,
      underconfident: 0,
      byConfidence: {
        low: { ok:0, wrong:0 },
        mid: { ok:0, wrong:0 },
        high:{ ok:0, wrong:0 }
      },
      mechanics: {
        classic:0,
        gap:0,
        multi:0,
        match:0,
        mistake:0
      },
      rows: []
    };
  }
  function loadStore(key){
    var data = safeJSON(localStorage.getItem(key), null);
    if (!data || typeof data !== 'object') data = storeTemplate();
    data.byConfidence = data.byConfidence || { low:{ok:0,wrong:0}, mid:{ok:0,wrong:0}, high:{ok:0,wrong:0} };
    data.mechanics = data.mechanics || { classic:0, gap:0, multi:0, match:0, mistake:0 };
    if (!Array.isArray(data.rows)) data.rows = [];
    return data;
  }
  function saveStore(key, data){
    try { localStorage.setItem(key, JSON.stringify(data)); } catch(_) {}
  }
  function addStoreRow(key, row){
    var data = loadStore(key);
    var conf = row.confidence || 'mid';
    var mech = row.mechanic || 'classic';
    data.total += 1;
    if (row.ok) data.ok += 1; else data.wrong += 1;
    if (!data.byConfidence[conf]) data.byConfidence[conf] = { ok:0, wrong:0 };
    if (row.ok) data.byConfidence[conf].ok += 1; else data.byConfidence[conf].wrong += 1;
    data.mechanics[mech] = (data.mechanics[mech] || 0) + 1;
    if (!row.ok && conf === 'high') data.overconfident += 1;
    if (row.ok && conf === 'low') data.underconfident += 1;
    data.rows.push(row);
    if (data.rows.length > 320) data.rows = data.rows.slice(-320);
    saveStore(key, data);
    return data;
  }
  function removeStore(key){ try { localStorage.removeItem(key); } catch(_) {} }
  function confLabel(id){
    return id === 'low' ? '🤔 не уверен' : id === 'high' ? '💪 уверен' : '👌 нормально';
  }
  function confShort(id){
    return id === 'low' ? 'сомневался' : id === 'high' ? 'уверенно' : 'нормально';
  }
  function mechanicLabel(kind){
    return kind === 'gap' ? 'Впиши ответ'
      : kind === 'multi' ? 'Мультивыбор'
      : kind === 'match' ? 'Сопоставление'
      : kind === 'mistake' ? 'Найди ошибку'
      : 'Классика';
  }
  function stableHash(str){
    str = String(str || '');
    var h = 0, i, chr;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      h = ((h << 5) - h) + chr;
      h |= 0;
    }
    return Math.abs(h);
  }
  function pct(ok, total){ return total ? Math.round(ok / total * 100) : 0; }
  function pickFirstWrong(options, answer){
    if (!Array.isArray(options)) return 0;
    for (var i = 0; i < options.length; i++) if (options[i] !== answer) return i;
    return 0;
  }
  function summarizeSession(rows){
    rows = Array.isArray(rows) ? rows : [];
    var out = { total: rows.length, ok:0, wrong:0, highWrong:0, lowOk:0, kinds:{} };
    rows.forEach(function(row){
      var kind = row.mechanic || 'classic';
      out.kinds[kind] = (out.kinds[kind] || 0) + 1;
      if (row.ok) out.ok += 1; else out.wrong += 1;
      if (!row.ok && row.confidence === 'high') out.highWrong += 1;
      if (row.ok && row.confidence === 'low') out.lowOk += 1;
    });
    out.pct = pct(out.ok, out.total);
    return out;
  }
  function summaryText(summary){
    var bits = [];
    ['classic','gap','multi','match','mistake'].forEach(function(kind){
      if (summary.kinds[kind]) bits.push(mechanicLabel(kind) + ' — ' + summary.kinds[kind]);
    });
    return bits.join(' · ');
  }
  function confidenceInsight(ok, conf){
    if (!ok && conf === 'high') return 'Высокая уверенность + ошибка: эту тему полезно вынести в повторение.';
    if (ok && conf === 'low') return 'Получилось даже при низкой уверенности — значит база уже крепче, чем кажется.';
    if (ok && conf === 'high') return 'Уверенно и точно — хороший сигнал, что тема закрепляется.';
    return 'Сравнивай уверенность с точностью: так быстрее видно ловушки.';
  }
  function ensureStyles(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = ''
      + '.w37-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}'
      + '.w37-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:var(--abg);color:var(--accent);font-size:11px;font-weight:800;font-family:Unbounded,system-ui,sans-serif}'
      + '.w37-subpill{display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;background:var(--ybg);color:#92400e;font-size:10px;font-weight:700}'
      + '.w37-conf{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:12px}'
      + '.w37-confbtn{border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:12px;padding:10px 8px;font-size:12px;font-weight:700;cursor:pointer;line-height:1.2}'
      + '.w37-confbtn.on{border-color:var(--accent);box-shadow:0 0 0 2px rgba(59,130,246,.14);background:var(--abg);color:var(--accent)}'
      + '.w37-stack{display:grid;gap:10px}'
      + '.w37-input{width:100%;padding:14px 12px;border-radius:12px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:16px;font-weight:700;font-family:JetBrains Mono,monospace}'
      + '.w37-row{display:flex;gap:8px;flex-wrap:wrap}'
      + '.w37-choice{border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:14px;padding:12px;cursor:pointer;text-align:left;font-size:14px;line-height:1.45;width:100%}'
      + '.w37-choice.on{border-color:var(--accent);background:var(--abg)}'
      + '.w37-choice.ok{border-color:#16a34a;background:#dcfce7;color:#166534}'
      + '.w37-choice.no{border-color:#dc2626;background:#fee2e2;color:#991b1b}'
      + '.w37-choice.dim{opacity:.65}'
      + '.w37-k{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:999px;background:rgba(37,99,235,.08);font-size:11px;font-weight:800;margin-right:8px;color:var(--accent)}'
      + '.w37-help{font-size:11px;color:var(--muted);line-height:1.5}'
      + '.w37-submit{width:100%}'
      + '.w37-match{display:grid;gap:8px}'
      + '.w37-match-row{border:1px solid var(--border);border-radius:14px;padding:12px;background:var(--card)}'
      + '.w37-match-row .t{font-size:14px;line-height:1.45;margin-bottom:8px}'
      + '.w37-mini{display:flex;gap:8px;flex-wrap:wrap}'
      + '.w37-mini button{flex:1;min-width:120px;border:1px solid var(--border);background:var(--bg);color:var(--text);border-radius:10px;padding:9px 10px;font-weight:700;cursor:pointer}'
      + '.w37-mini button.on-ok{border-color:#16a34a;background:#dcfce7;color:#166534}'
      + '.w37-mini button.on-no{border-color:#dc2626;background:#fee2e2;color:#991b1b}'
      + '.w37-tags{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}'
      + '.w37-tag{font-size:11px;color:var(--muted);background:var(--bg);border:1px solid var(--border);border-radius:999px;padding:5px 8px}'
      + '.w37-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}'
      + '.w37-stat{border:1px solid var(--border);border-radius:14px;padding:12px;background:var(--card);text-align:center}'
      + '.w37-stat .v{font-size:22px;font-weight:900;font-family:JetBrains Mono,monospace}'
      + '.w37-stat .l{font-size:11px;color:var(--muted);margin-top:3px}'
      + '.w37-note{font-size:12px;color:var(--muted);line-height:1.55;margin-top:8px}'
      + '.w37-inline-note{margin-top:8px;font-size:12px;color:var(--muted)}'
      + '@media (max-width:640px){.w37-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.w37-conf{grid-template-columns:1fr}.w37-mini button{min-width:0}}';
    document.head.appendChild(style);
  }

  function buildConfidenceHtml(conf, setter){
    return '<div class="w37-conf">'
      + '<button class="w37-confbtn' + (conf === 'low' ? ' on' : '') + '" onclick="' + setter + '(\'low\')">🤔<br>Не уверен</button>'
      + '<button class="w37-confbtn' + (conf === 'mid' ? ' on' : '') + '" onclick="' + setter + '(\'mid\')">👌<br>Нормально</button>'
      + '<button class="w37-confbtn' + (conf === 'high' ? ' on' : '') + '" onclick="' + setter + '(\'high\')">💪<br>Уверен</button>'
      + '</div>';
  }

  function installGrade(){
    if (window.__wave37GradeInstalled) return true;
    if (!document.getElementById('s-play')) return false;
    if (typeof window.render !== 'function' || typeof window.ans !== 'function' || typeof window.startQuiz !== 'function') return false;
    ensureStyles();
    window.__wave37GradeInstalled = true;

    var original = {
      render: window.render,
      ans: window.ans,
      startQuiz: window.startQuiz,
      endSession: typeof window.endSession === 'function' ? window.endSession : null,
      shareSession: typeof window.shareSession === 'function' ? window.shareSession : null,
      renderProg: typeof window.renderProg === 'function' ? window.renderProg : null,
      refreshMain: typeof window.refreshMain === 'function' ? window.refreshMain : null,
      getBackupSnapshot: typeof window.getBackupSnapshot === 'function' ? window.getBackupSnapshot : null,
      applyBackupSnapshot: typeof window.applyBackupSnapshot === 'function' ? window.applyBackupSnapshot : null,
      resetProgress: typeof window.resetProgress === 'function' ? window.resetProgress : null
    };

    function currentKey(){ return GRADE_CONF_KEY(); }
    function shouldCustom(){ return !!(typeof prob !== 'undefined' && prob && !rushMode && !diagMode && Array.isArray(prob.options) && prob.options.length >= 4); }
    function makePrompt(question){
      var text = cleanText(question.question || '');
      if (!text) return 'Впиши ответ';
      if (text.indexOf('___') !== -1) return text;
      var out = text.replace(/\s*=\s*\?\s*$/,' = ___').replace(/\s*\?\s*$/,' ___');
      if (out === text) out = text + ' → ___';
      return out;
    }
    function chooseKind(question){
      if (!shouldCustom()) return 'classic';
      var slot = stableHash((window.GRADE_NUM || '10') + '|' + question.question + '|' + question.answer + '|' + question.tag) % 10;
      var gradeNum = +(window.GRADE_NUM || 10);
      if (gradeNum <= 4) {
        if (slot <= 1) return 'gap';
        if (slot === 2) return 'multi';
        return 'classic';
      }
      if (slot === 0) return 'gap';
      if (slot === 1) return 'multi';
      if (slot === 2) return 'match';
      if (slot === 3) return 'mistake';
      return 'classic';
    }
    function ensureMeta(question){
      if (!question) return null;
      if (question.__wave37) return question.__wave37;
      var kind = chooseKind(question);
      var meta = { kind: kind, confidence:'mid', answered:false, label: mechanicLabel(kind) };
      if (kind === 'gap') {
        if (String(question.answer || '').length > 36) {
          meta.kind = 'classic';
          meta.label = mechanicLabel('classic');
        } else {
          meta.prompt = makePrompt(question);
          meta.input = '';
        }
      }
      if (meta.kind === 'multi') {
        meta.items = typeof shuffle === 'function' ? shuffle(question.options.slice()) : question.options.slice();
        meta.picked = {};
      }
      if (meta.kind === 'match') {
        meta.items = typeof shuffle === 'function' ? shuffle(question.options.slice()) : question.options.slice();
        meta.map = {};
      }
      if (meta.kind === 'mistake') {
        var wrongs = question.options.filter(function(opt){ return opt !== question.answer; });
        if (!wrongs.length) {
          meta.kind = 'classic';
          meta.label = mechanicLabel('classic');
        } else {
          var wrong = wrongs[stableHash(question.question) % wrongs.length];
          meta.lines = typeof shuffle === 'function' ? shuffle([
            { text:'Условие: ' + cleanText(question.question), bad:false },
            { text:'Ответ ученика: ' + wrong, bad:true },
            { text:'Верный ответ: ' + question.answer, bad:false },
            { text:'Тема: ' + (question.tag || 'задача'), bad:false }
          ]) : [
            { text:'Условие: ' + cleanText(question.question), bad:false },
            { text:'Ответ ученика: ' + wrong, bad:true },
            { text:'Верный ответ: ' + question.answer, bad:false },
            { text:'Тема: ' + (question.tag || 'задача'), bad:false }
          ];
          meta.picked = null;
        }
      }
      question.__wave37 = meta;
      return meta;
    }
    function pushSessionRow(question, ok, meta, extra){
      var row = {
        ts: Date.now(),
        question: String(question.question || '').slice(0, 180),
        answer: question.answer,
        subject: cS && cS.id ? cS.id : (globalMix ? 'mix' : '?'),
        tag: question.tag,
        mechanic: meta.kind || 'classic',
        confidence: meta.confidence || 'mid',
        ok: !!ok,
        extra: extra || null
      };
      gradeSession.push(row);
      if (gradeSession.length > 60) gradeSession = gradeSession.slice(-60);
      addStoreRow(currentKey(), row);
      return row;
    }
    function decorateQuestion(meta){
      var qb = document.getElementById('qb');
      if (!qb || !prob) return;
      var text = meta.kind === 'gap' ? meta.prompt : prob.question;
      qb.innerHTML = '<div class="w37-head"><span class="w37-pill">✨ ' + escHtml(meta.label) + '</span>'
        + (meta.kind !== 'classic' ? '<span class="w37-subpill">новый формат</span>' : '')
        + '</div><div>' + lineHtml(text) + '</div>';
    }
    function renderClassic(meta){
      var opts = document.getElementById('opts');
      if (!opts) return;
      var inner = opts.innerHTML;
      opts.innerHTML = buildConfidenceHtml(meta.confidence || 'mid', 'wave37GradeSetConfidence') + '<div class="w37-stack">' + inner + '</div>';
      if (sel !== null) {
        var fba = document.getElementById('fba');
        if (fba) {
          var note = document.createElement('div');
          note.className = 'w37-inline-note';
          note.textContent = '🧠 Уверенность: ' + confLabel(meta.confidence || 'mid') + '. ' + confidenceInsight(sel === prob.answer, meta.confidence || 'mid');
          fba.appendChild(note);
        }
      }
    }
    function renderGap(meta){
      var opts = document.getElementById('opts');
      if (!opts) return;
      var html = buildConfidenceHtml(meta.confidence || 'mid', 'wave37GradeSetConfidence');
      if (sel === null) {
        html += '<div class="w37-stack"><input id="w37-grade-gap" class="w37-input" value="' + escHtml(meta.input || '') + '" placeholder="Введи ответ" onkeydown="if(event.key===\'Enter\'){wave37GradeSubmitGap()}">'
          + '<button class="btn btn-p w37-submit" onclick="wave37GradeSubmitGap()">Проверить</button>'
          + '<div class="w37-help">Без вариантов ответа: впиши короткий ответ сам.</div></div>';
      } else {
        var ok = meta.evaluation && meta.evaluation.ok;
        html += '<div class="w37-stack"><input class="w37-input" value="' + escHtml(meta.userInput || '') + '" disabled>'
          + '<div class="w37-tags"><span class="w37-tag">Твой ответ: ' + escHtml(meta.userInput || '—') + '</span><span class="w37-tag">Верный ответ: ' + escHtml(prob.answer) + '</span></div></div>';
        document.getElementById('fba').innerHTML = '<div class="fb"><div class="fbr" style="color:' + (ok ? (usedHelp ? 'var(--orange)' : 'var(--green)') : 'var(--red)') + '">' + (ok ? (usedHelp ? '✓ Верно, но с подсказкой' : '✓ Верно!') : '✗ Верный ответ: ' + escHtml(prob.answer)) + '</div>' + (prob.hint ? '<div class="fbh">💡 ' + escHtml(prob.hint) + '</div>' : '') + '<div class="fbh">🧠 Уверенность: ' + confLabel(meta.confidence || 'mid') + '. ' + confidenceInsight(ok, meta.confidence || 'mid') + '</div><button class="btn btn-p" style="width:auto;display:inline-block;padding:10px 24px" onclick="nextQ()">Следующий →</button></div>';
      }
      opts.innerHTML = html;
    }
    function renderMulti(meta){
      var opts = document.getElementById('opts');
      if (!opts) return;
      var html = buildConfidenceHtml(meta.confidence || 'mid', 'wave37GradeSetConfidence');
      html += '<div class="w37-help" style="margin-bottom:8px">Отметь все ловушки — то есть все неверные варианты.</div><div class="w37-stack">';
      meta.items.forEach(function(item, idx){
        var picked = !!meta.picked[idx];
        var cls = 'w37-choice';
        if (sel === null && picked) cls += ' on';
        if (sel !== null) {
          if (item !== prob.answer) cls += ' ok';
          else cls += ' dim';
        }
        html += '<button class="' + cls + '" ' + (sel === null ? 'onclick="wave37GradeToggleMulti(' + idx + ')"' : 'disabled') + '><span class="w37-k">' + String.fromCharCode(65 + idx) + '</span>' + escHtml(item) + '</button>';
      });
      html += '</div>';
      if (sel === null) html += '<button class="btn btn-p w37-submit" onclick="wave37GradeSubmitMulti()">Проверить выбор</button>';
      opts.innerHTML = html;
      if (sel !== null) {
        var ok = meta.evaluation && meta.evaluation.ok;
        var wrongs = meta.items.filter(function(item){ return item !== prob.answer; });
        document.getElementById('fba').innerHTML = '<div class="fb"><div class="fbr" style="color:' + (ok ? (usedHelp ? 'var(--orange)' : 'var(--green)') : 'var(--red)') + '">' + (ok ? (usedHelp ? '✓ Все ловушки найдены, но с подсказкой' : '✓ Все ловушки найдены') : '✗ Не все ловушки отмечены') + '</div><div class="fbh">Ловушки: ' + escHtml(wrongs.join(' · ')) + '</div><div class="fbh">Верный вариант: ' + escHtml(prob.answer) + '</div><div class="fbh">🧠 Уверенность: ' + confLabel(meta.confidence || 'mid') + '. ' + confidenceInsight(ok, meta.confidence || 'mid') + '</div><button class="btn btn-p" style="width:auto;display:inline-block;padding:10px 24px" onclick="nextQ()">Следующий →</button></div>';
      }
    }
    function renderMatch(meta){
      var opts = document.getElementById('opts');
      if (!opts) return;
      var html = buildConfidenceHtml(meta.confidence || 'mid', 'wave37GradeSetConfidence');
      html += '<div class="w37-help" style="margin-bottom:8px">Для каждого варианта отметь: это верный ответ или ловушка.</div><div class="w37-match">';
      meta.items.forEach(function(item, idx){
        var state = meta.map[idx] || '';
        var rowCls = 'w37-match-row';
        if (sel !== null) rowCls += item === prob.answer ? ' ok' : '';
        html += '<div class="' + rowCls + '"><div class="t">' + escHtml(item) + '</div><div class="w37-mini">'
          + '<button ' + (sel === null ? 'onclick="wave37GradeMarkMatch(' + idx + ',\'ok\')"' : 'disabled') + ' class="' + (state === 'ok' ? 'on-ok' : '') + '">✅ Верно</button>'
          + '<button ' + (sel === null ? 'onclick="wave37GradeMarkMatch(' + idx + ',\'no\')"' : 'disabled') + ' class="' + (state === 'no' ? 'on-no' : '') + '">❌ Ловушка</button>'
          + '</div></div>';
      });
      html += '</div>';
      if (sel === null) html += '<button class="btn btn-p w37-submit" onclick="wave37GradeSubmitMatch()">Проверить сопоставление</button>';
      opts.innerHTML = html;
      if (sel !== null) {
        var ok = meta.evaluation && meta.evaluation.ok;
        document.getElementById('fba').innerHTML = '<div class="fb"><div class="fbr" style="color:' + (ok ? (usedHelp ? 'var(--orange)' : 'var(--green)') : 'var(--red)') + '">' + (ok ? (usedHelp ? '✓ Сопоставление верное, но с подсказкой' : '✓ Всё сопоставлено верно') : '✗ Сопоставление неточное') + '</div><div class="fbh">Верный ответ: ' + escHtml(prob.answer) + ' — остальные варианты были ловушками.</div><div class="fbh">🧠 Уверенность: ' + confLabel(meta.confidence || 'mid') + '. ' + confidenceInsight(ok, meta.confidence || 'mid') + '</div><button class="btn btn-p" style="width:auto;display:inline-block;padding:10px 24px" onclick="nextQ()">Следующий →</button></div>';
      }
    }
    function renderMistake(meta){
      var opts = document.getElementById('opts');
      if (!opts) return;
      var html = buildConfidenceHtml(meta.confidence || 'mid', 'wave37GradeSetConfidence');
      html += '<div class="w37-help" style="margin-bottom:8px">Найди строку, где спрятана ошибка.</div><div class="w37-stack">';
      meta.lines.forEach(function(line, idx){
        var cls = 'w37-choice';
        if (meta.picked === idx && sel === null) cls += ' on';
        if (sel !== null) cls += line.bad ? ' ok' : ' dim';
        html += '<button class="' + cls + '" ' + (sel === null ? 'onclick="wave37GradePickMistake(' + idx + ')"' : 'disabled') + '><span class="w37-k">' + String.fromCharCode(65 + idx) + '</span>' + escHtml(line.text) + '</button>';
      });
      html += '</div>';
      if (sel === null) html += '<button class="btn btn-p w37-submit" onclick="wave37GradeSubmitMistake()">Проверить</button>';
      opts.innerHTML = html;
      if (sel !== null) {
        var ok = meta.evaluation && meta.evaluation.ok;
        var wrongLine = meta.lines.filter(function(line){ return line.bad; })[0];
        document.getElementById('fba').innerHTML = '<div class="fb"><div class="fbr" style="color:' + (ok ? (usedHelp ? 'var(--orange)' : 'var(--green)') : 'var(--red)') + '">' + (ok ? (usedHelp ? '✓ Ошибка найдена, но с подсказкой' : '✓ Ошибка найдена') : '✗ Ошибка была в другой строке') + '</div><div class="fbh">Нужная строка: ' + escHtml(wrongLine ? wrongLine.text : ('Ответ ученика: ' + prob.answer)) + '</div><div class="fbh">Правильный ответ по задаче: ' + escHtml(prob.answer) + '</div><div class="fbh">🧠 Уверенность: ' + confLabel(meta.confidence || 'mid') + '. ' + confidenceInsight(ok, meta.confidence || 'mid') + '</div><button class="btn btn-p" style="width:auto;display:inline-block;padding:10px 24px" onclick="nextQ()">Следующий →</button></div>';
      }
    }
    function renderCustom(meta){
      decorateQuestion(meta);
      if (meta.kind === 'gap') return renderGap(meta);
      if (meta.kind === 'multi') return renderMulti(meta);
      if (meta.kind === 'match') return renderMatch(meta);
      if (meta.kind === 'mistake') return renderMistake(meta);
      return renderClassic(meta);
    }
    function finishCustom(ok, extra){
      var meta = ensureMeta(prob);
      meta.answered = true;
      meta.evaluation = { ok: !!ok, extra: extra || null };
      pushSessionRow(prob, !!ok, meta, extra || null);
      var idx = ok ? Math.max(0, prob.options.indexOf(prob.answer)) : pickFirstWrong(prob.options, prob.answer);
      return original.ans.call(window, idx);
    }

    window.wave37GradeSetConfidence = function(id){
      var meta = ensureMeta(prob);
      if (!meta || sel !== null) return;
      meta.confidence = id;
      render();
    };
    window.wave37GradeSubmitGap = function(){
      if (!prob || sel !== null) return;
      var meta = ensureMeta(prob);
      var input = document.getElementById('w37-grade-gap');
      meta.input = input ? String(input.value || '').trim() : String(meta.input || '').trim();
      meta.userInput = meta.input;
      finishCustom(cleanText(meta.userInput).toLowerCase() === cleanText(prob.answer).toLowerCase(), { typed: meta.userInput });
    };
    window.wave37GradeToggleMulti = function(idx){
      if (!prob || sel !== null) return;
      var meta = ensureMeta(prob);
      meta.picked[idx] = !meta.picked[idx];
      render();
    };
    window.wave37GradeSubmitMulti = function(){
      if (!prob || sel !== null) return;
      var meta = ensureMeta(prob);
      var ok = true;
      meta.items.forEach(function(item, idx){
        var shouldPick = item !== prob.answer;
        if (!!meta.picked[idx] !== shouldPick) ok = false;
      });
      finishCustom(ok, { picked: meta.picked });
    };
    window.wave37GradeMarkMatch = function(idx, value){
      if (!prob || sel !== null) return;
      var meta = ensureMeta(prob);
      meta.map[idx] = value;
      render();
    };
    window.wave37GradeSubmitMatch = function(){
      if (!prob || sel !== null) return;
      var meta = ensureMeta(prob);
      var ok = true;
      meta.items.forEach(function(item, idx){
        var need = item === prob.answer ? 'ok' : 'no';
        if (meta.map[idx] !== need) ok = false;
      });
      finishCustom(ok, { map: meta.map });
    };
    window.wave37GradePickMistake = function(idx){
      if (!prob || sel !== null) return;
      var meta = ensureMeta(prob);
      meta.picked = idx;
      render();
    };
    window.wave37GradeSubmitMistake = function(){
      if (!prob || sel !== null) return;
      var meta = ensureMeta(prob);
      var target = -1;
      meta.lines.forEach(function(line, idx){ if (line.bad) target = idx; });
      finishCustom(meta.picked === target, { picked: meta.picked });
    };

    window.render = function(){
      var out = original.render.apply(this, arguments);
      try {
        if (!prob) return out;
        var meta = ensureMeta(prob);
        if (!meta) return out;
        renderCustom(meta);
      } catch(_) {}
      return out;
    };
    window.ans = function(idx){
      if (typeof sel !== 'undefined' && sel !== null) return;
      var meta = ensureMeta(prob);
      if (meta && meta.kind !== 'classic') return;
      try {
        var chosen = prob && prob.options ? prob.options[idx] : null;
        if (prob && chosen != null) {
          meta.answered = true;
          meta.evaluation = { ok: chosen === prob.answer, chosen: chosen };
          pushSessionRow(prob, chosen === prob.answer, meta, { chosen: chosen });
        }
      } catch(_) {}
      return original.ans.apply(this, arguments);
    };
    window.startQuiz = function(){
      gradeSession = [];
      return original.startQuiz.apply(this, arguments);
    };
    if (original.renderProg) {
      window.renderProg = function(){
        var out = original.renderProg.apply(this, arguments);
        try {
          var host = document.getElementById('prog-content');
          if (!host || document.getElementById('wave37-grade-progress')) return out;
          var data = loadStore(currentKey());
          var card = document.createElement('div');
          card.className = 'rcard';
          card.id = 'wave37-grade-progress';
          card.innerHTML = '<h3>🧠 Форматы 2.0 и уверенность</h3>'
            + '<div class="w37-grid">'
            + '<div class="w37-stat"><div class="v">' + data.total + '</div><div class="l">ответов с меткой уверенности</div></div>'
            + '<div class="w37-stat"><div class="v" style="color:var(--red)">' + data.overconfident + '</div><div class="l">ошибок при высокой уверенности</div></div>'
            + '<div class="w37-stat"><div class="v" style="color:var(--green)">' + data.underconfident + '</div><div class="l">верных ответов при сомнениях</div></div>'
            + '<div class="w37-stat"><div class="v">' + pct(data.ok, data.total) + '%</div><div class="l">средняя точность</div></div>'
            + '</div>'
            + '<div class="w37-note">Форматы: ' + escHtml(summaryText({ kinds:data.mechanics })) + '.</div>'
            + '<div class="w37-note">Смотри в первую очередь на ошибки при высокой уверенности: именно они лучше всего показывают ложную уверенность и опасные ловушки.</div>';
          host.insertBefore(card, host.firstChild);
        } catch(_) {}
        return out;
      };
    }
    if (original.endSession) {
      window.endSession = function(){
        var out = original.endSession.apply(this, arguments);
        try {
          if (!gradeSession.length || rushMode) return out;
          var host = document.getElementById('res-topics');
          if (!host || document.getElementById('wave37-grade-result')) return out;
          var sum = summarizeSession(gradeSession);
          var div = document.createElement('div');
          div.className = 'rcard';
          div.id = 'wave37-grade-result';
          div.innerHTML = '<h3>🧩 Форматы этой сессии</h3>'
            + '<div class="w37-grid">'
            + '<div class="w37-stat"><div class="v">' + sum.total + '</div><div class="l">всего вопросов</div></div>'
            + '<div class="w37-stat"><div class="v">' + sum.pct + '%</div><div class="l">точность</div></div>'
            + '<div class="w37-stat"><div class="v" style="color:var(--red)">' + sum.highWrong + '</div><div class="l">ошибок при высокой уверенности</div></div>'
            + '<div class="w37-stat"><div class="v" style="color:var(--green)">' + sum.lowOk + '</div><div class="l">верных при сомнениях</div></div>'
            + '</div>'
            + '<div class="w37-note">' + escHtml(summaryText(sum)) + '.</div>';
          host.insertAdjacentElement('afterend', div);
        } catch(_) {}
        return out;
      };
    }
    if (original.shareSession) {
      window.shareSession = function(){
        if (!gradeSession.length) return original.shareSession.apply(this, arguments);
        var total = st.ok + st.err;
        var acc = total ? Math.round(st.ok / total * 100) : 0;
        var sum = summarizeSession(gradeSession);
        var text = '📊 ' + (cS ? cS.nm : 'Тренировка') + ' — ' + acc + '% (' + st.ok + '/' + total + ')\n';
        text += '🧩 Форматы: ' + summaryText(sum) + '\n';
        if (sum.highWrong) text += '⚠️ Ошибок при высокой уверенности: ' + sum.highWrong + '\n';
        if (sum.lowOk) text += '✅ Верных при сомнениях: ' + sum.lowOk + '\n';
        Object.keys(sesTopics || {}).forEach(function(tag){
          var row = sesTopics[tag];
          var totalTag = (row.ok || 0) + (row.err || 0);
          if (!totalTag) return;
          var p = Math.round((row.ok || 0) / totalTag * 100);
          text += (p >= 80 ? '✅' : p >= 50 ? '⚠️' : '❌') + ' ' + tag + ': ' + p + '%\n';
        });
        if (typeof doShare === 'function') return doShare('Результат тренировки', text);
        return original.shareSession.apply(this, arguments);
      };
    }
    if (original.refreshMain) {
      window.refreshMain = function(){
        var out = original.refreshMain.apply(this, arguments);
        try {
          var anchor = document.getElementById('daily-meter');
          if (!anchor) return out;
          var old = document.getElementById('wave37-main-card');
          if (old) old.remove();
          var data = loadStore(currentKey());
          var sum = summarizeSession(gradeSession);
          var card = document.createElement('div');
          card.className = 'rcard';
          card.id = 'wave37-main-card';
          card.style.marginTop = '12px';
          card.innerHTML = '<h3>🧩 Форматы 2.0</h3><div class="w37-note">В тренажёре появились новые механики: впиши ответ, мультивыбор, сопоставление, поиск ошибки. Уверенность по каждому ответу тоже запоминается.</div><div class="w37-tags"><span class="w37-tag">всего ответов: ' + data.total + '</span><span class="w37-tag">ошибки при высокой уверенности: ' + data.overconfident + '</span><span class="w37-tag">последняя сессия: ' + (sum.total ? sum.total + ' вопросов' : 'пока нет') + '</span></div>';
          anchor.insertAdjacentElement('afterend', card);
        } catch(_) {}
        return out;
      };
    }
    if (original.getBackupSnapshot) {
      window.getBackupSnapshot = function(){
        var snap = original.getBackupSnapshot.apply(this, arguments);
        try {
          snap.wave37 = snap.wave37 || {};
          snap.wave37.confidence = loadStore(currentKey());
        } catch(_) {}
        return snap;
      };
    }
    if (original.applyBackupSnapshot) {
      window.applyBackupSnapshot = function(snapshot){
        var ok = original.applyBackupSnapshot.apply(this, arguments);
        try {
          if (snapshot && snapshot.wave37 && snapshot.wave37.confidence) saveStore(currentKey(), snapshot.wave37.confidence);
        } catch(_) {}
        return ok;
      };
    }
    if (original.resetProgress) {
      window.resetProgress = function(){
        var before = JSON.stringify(loadStore(currentKey()));
        var out = original.resetProgress.apply(this, arguments);
        try {
          if (Object.keys(PROG || {}).length === 0 && (STR.totalQs || 0) === 0 && (!ACTIVITY || !ACTIVITY.length)) removeStore(currentKey());
        } catch(_) {
          if (before !== JSON.stringify(loadStore(currentKey()))) removeStore(currentKey());
        }
        return out;
      };
    }

    setTimeout(function(){ try { refreshMain && refreshMain(); } catch(_) {} }, 80);
    return true;
  }

  function installDiagnostic(){
    if (window.__wave37DiagInstalled) return true;
    if (!document.getElementById('s-quiz')) return false;
    if (typeof window.renderQ !== 'function' || typeof window.selectOpt !== 'function' || typeof window.startDiag !== 'function') return false;
    ensureStyles();
    window.__wave37DiagInstalled = true;

    var original = {
      renderQ: window.renderQ,
      selectOpt: window.selectOpt,
      startDiag: window.startDiag,
      showResult: typeof window.showResult === 'function' ? window.showResult : null,
      shareResult: typeof window.shareResult === 'function' ? window.shareResult : null
    };

    function diagModeId(){
      try {
        return window.wave25Diag && typeof window.wave25Diag.getModeId === 'function' ? window.wave25Diag.getModeId() : 'full';
      } catch(_) { return 'full'; }
    }
    function shouldCustom(q){
      return !!(q && diagModeId() !== 'exam' && Array.isArray(q.opts) && q.opts.length >= 4);
    }
    function chooseDiagKind(q){
      if (!shouldCustom(q)) return 'classic';
      var slot = stableHash((curSubject && curSubject.id || 'diag') + '|' + q.q + '|' + q.a + '|' + q.topic) % 10;
      if (slot === 0) return 'gap';
      if (slot === 1) return 'multi';
      if (slot === 2) return 'match';
      if (slot === 3) return 'mistake';
      return 'classic';
    }
    function ensureDiagMeta(q){
      if (!q) return null;
      if (q.__wave37) return q.__wave37;
      var kind = chooseDiagKind(q);
      var meta = { kind: kind, confidence:'mid', answered:false, label: mechanicLabel(kind) };
      if (kind === 'gap') {
        if (String(q.a || '').length > 36) { meta.kind = 'classic'; meta.label = mechanicLabel('classic'); }
        else { meta.prompt = makeDiagPrompt(q); meta.input = ''; }
      }
      if (meta.kind === 'multi') { meta.items = typeof shuffle === 'function' ? shuffle(q.opts.slice()) : q.opts.slice(); meta.picked = {}; }
      if (meta.kind === 'match') { meta.items = typeof shuffle === 'function' ? shuffle(q.opts.slice()) : q.opts.slice(); meta.map = {}; }
      if (meta.kind === 'mistake') {
        var wrongs = q.opts.filter(function(opt){ return opt !== q.a; });
        if (!wrongs.length) { meta.kind = 'classic'; meta.label = mechanicLabel('classic'); }
        else {
          var wrong = wrongs[stableHash(q.q) % wrongs.length];
          meta.lines = typeof shuffle === 'function' ? shuffle([
            { text:'Условие: ' + cleanText(q.q), bad:false },
            { text:'Ответ ученика: ' + wrong, bad:true },
            { text:'Верный ответ: ' + q.a, bad:false },
            { text:'Тема: ' + (q.topic || 'диагностика'), bad:false }
          ]) : [
            { text:'Условие: ' + cleanText(q.q), bad:false },
            { text:'Ответ ученика: ' + wrong, bad:true },
            { text:'Верный ответ: ' + q.a, bad:false },
            { text:'Тема: ' + (q.topic || 'диагностика'), bad:false }
          ];
          meta.picked = null;
        }
      }
      q.__wave37 = meta;
      return meta;
    }
    function makeDiagPrompt(q){
      var text = cleanText(q.q || '');
      if (!text) return 'Впиши ответ';
      var out = text.replace(/\s*=\s*\?\s*$/,' = ___').replace(/\s*\?\s*$/,' ___');
      if (out === text) out = text + ' → ___';
      return out;
    }
    function currentDiagQuestion(){ return Array.isArray(questions) && qIndex < questions.length ? questions[qIndex] : null; }
    function recordDiag(ok, meta, extra){
      var q = currentDiagQuestion();
      if (!q) return;
      var row = {
        ts: Date.now(),
        subject: curSubject && curSubject.id ? curSubject.id : 'diag',
        grade: q.g,
        topic: q.topic,
        mechanic: meta.kind || 'classic',
        confidence: meta.confidence || 'mid',
        ok: !!ok,
        extra: extra || null
      };
      diagSession.push(row);
      if (diagSession.length > 60) diagSession = diagSession.slice(-60);
      addStoreRow(DIAG_CONF_KEY, row);
    }
    function decorateDiagQuestion(meta, q){
      var box = document.getElementById('q-txt');
      if (!box) return;
      var text = meta.kind === 'gap' ? meta.prompt : q.q;
      box.innerHTML = '<div class="w37-head"><span class="w37-pill">✨ ' + escHtml(meta.label) + '</span>' + (meta.kind !== 'classic' ? '<span class="w37-subpill">adaptive</span>' : '') + '</div><div>' + lineHtml(text) + '</div>';
    }
    function applyDiagClassic(meta, q){
      var opts = document.getElementById('opts');
      if (!opts) return;
      opts.innerHTML = buildConfidenceHtml(meta.confidence || 'mid', 'wave37DiagSetConfidence') + '<div class="w37-stack">' + opts.innerHTML + '</div>';
      if (meta.answered) {
        var hb = document.getElementById('hint-box');
        if (hb) hb.innerHTML += '<div class="w37-inline-note">🧠 Уверенность: ' + confLabel(meta.confidence || 'mid') + '. ' + confidenceInsight(meta.evaluation && meta.evaluation.ok, meta.confidence || 'mid') + '</div>';
      }
    }
    function renderDiagGap(meta, q){
      var opts = document.getElementById('opts');
      if (!opts) return;
      var html = buildConfidenceHtml(meta.confidence || 'mid', 'wave37DiagSetConfidence');
      if (!meta.answered) {
        html += '<div class="w37-stack"><input id="w37-diag-gap" class="w37-input" value="' + escHtml(meta.input || '') + '" placeholder="Введи ответ" onkeydown="if(event.key===\'Enter\'){wave37DiagSubmitGap()}" /><button class="next-btn show" style="display:block" onclick="wave37DiagSubmitGap()">Проверить</button><div class="w37-help">Диагностика без вариантов: впиши ответ сам.</div></div>';
        document.getElementById('next-btn').className = 'next-btn';
      } else {
        html += '<div class="w37-stack"><input class="w37-input" value="' + escHtml(meta.userInput || '') + '" disabled><div class="w37-tags"><span class="w37-tag">Твой ответ: ' + escHtml(meta.userInput || '—') + '</span><span class="w37-tag">Верный ответ: ' + escHtml(q.a) + '</span></div></div>';
      }
      opts.innerHTML = html;
      if (meta.answered) {
        var hb = document.getElementById('hint-box');
        hb.className = 'hint-box show';
        hb.innerHTML = (meta.evaluation && meta.evaluation.ok ? '✅ Верно.' : '❌ Верный ответ: ' + escHtml(q.a) + (q.hint ? '<br>💡 ' + escHtml(q.hint) : '')) + '<div class="w37-inline-note">🧠 Уверенность: ' + confLabel(meta.confidence || 'mid') + '. ' + confidenceInsight(meta.evaluation && meta.evaluation.ok, meta.confidence || 'mid') + '</div>';
      }
    }
    function renderDiagMulti(meta, q){
      var opts = document.getElementById('opts');
      if (!opts) return;
      var html = buildConfidenceHtml(meta.confidence || 'mid', 'wave37DiagSetConfidence');
      html += '<div class="w37-help" style="margin-bottom:8px">Отметь все неверные варианты.</div><div class="w37-stack">';
      meta.items.forEach(function(item, idx){
        var cls = 'w37-choice';
        if (!meta.answered && meta.picked[idx]) cls += ' on';
        if (meta.answered) cls += item !== q.a ? ' ok' : ' dim';
        html += '<button class="' + cls + '" ' + (!meta.answered ? 'onclick="wave37DiagToggleMulti(' + idx + ')"' : 'disabled') + '><span class="w37-k">' + String.fromCharCode(65 + idx) + '</span>' + escHtml(item) + '</button>';
      });
      html += '</div>';
      if (!meta.answered) html += '<button class="next-btn show" style="display:block" onclick="wave37DiagSubmitMulti()">Проверить</button>';
      opts.innerHTML = html;
      if (meta.answered) {
        var wrongs = meta.items.filter(function(item){ return item !== q.a; });
        var hb = document.getElementById('hint-box');
        hb.className = 'hint-box show';
        hb.innerHTML = (meta.evaluation && meta.evaluation.ok ? '✅ Ловушки найдены.' : '❌ Нужно было отметить все ловушки.') + '<br>Ловушки: ' + escHtml(wrongs.join(' · ')) + '<br>Верный вариант: ' + escHtml(q.a) + '<div class="w37-inline-note">🧠 Уверенность: ' + confLabel(meta.confidence || 'mid') + '. ' + confidenceInsight(meta.evaluation && meta.evaluation.ok, meta.confidence || 'mid') + '</div>';
      }
    }
    function renderDiagMatch(meta, q){
      var opts = document.getElementById('opts');
      if (!opts) return;
      var html = buildConfidenceHtml(meta.confidence || 'mid', 'wave37DiagSetConfidence');
      html += '<div class="w37-help" style="margin-bottom:8px">Для каждого варианта отметь: верно или ловушка.</div><div class="w37-match">';
      meta.items.forEach(function(item, idx){
        var state = meta.map[idx] || '';
        html += '<div class="w37-match-row"><div class="t">' + escHtml(item) + '</div><div class="w37-mini"><button ' + (!meta.answered ? 'onclick="wave37DiagMarkMatch(' + idx + ',\'ok\')"' : 'disabled') + ' class="' + (state === 'ok' ? 'on-ok' : '') + '">✅ Верно</button><button ' + (!meta.answered ? 'onclick="wave37DiagMarkMatch(' + idx + ',\'no\')"' : 'disabled') + ' class="' + (state === 'no' ? 'on-no' : '') + '">❌ Ловушка</button></div></div>';
      });
      html += '</div>';
      if (!meta.answered) html += '<button class="next-btn show" style="display:block" onclick="wave37DiagSubmitMatch()">Проверить</button>';
      opts.innerHTML = html;
      if (meta.answered) {
        var hb = document.getElementById('hint-box');
        hb.className = 'hint-box show';
        hb.innerHTML = (meta.evaluation && meta.evaluation.ok ? '✅ Сопоставление верное.' : '❌ Сопоставление не совпало.') + '<br>Верный ответ: ' + escHtml(q.a) + ' · остальные были ловушками.<div class="w37-inline-note">🧠 Уверенность: ' + confLabel(meta.confidence || 'mid') + '. ' + confidenceInsight(meta.evaluation && meta.evaluation.ok, meta.confidence || 'mid') + '</div>';
      }
    }
    function renderDiagMistake(meta, q){
      var opts = document.getElementById('opts');
      if (!opts) return;
      var html = buildConfidenceHtml(meta.confidence || 'mid', 'wave37DiagSetConfidence');
      html += '<div class="w37-help" style="margin-bottom:8px">Выбери строку, где спрятана ошибка.</div><div class="w37-stack">';
      meta.lines.forEach(function(line, idx){
        var cls = 'w37-choice';
        if (!meta.answered && meta.picked === idx) cls += ' on';
        if (meta.answered) cls += line.bad ? ' ok' : ' dim';
        html += '<button class="' + cls + '" ' + (!meta.answered ? 'onclick="wave37DiagPickMistake(' + idx + ')"' : 'disabled') + '><span class="w37-k">' + String.fromCharCode(65 + idx) + '</span>' + escHtml(line.text) + '</button>';
      });
      html += '</div>';
      if (!meta.answered) html += '<button class="next-btn show" style="display:block" onclick="wave37DiagSubmitMistake()">Проверить</button>';
      opts.innerHTML = html;
      if (meta.answered) {
        var wrongLine = meta.lines.filter(function(line){ return line.bad; })[0];
        var hb = document.getElementById('hint-box');
        hb.className = 'hint-box show';
        hb.innerHTML = (meta.evaluation && meta.evaluation.ok ? '✅ Ошибка найдена.' : '❌ Ошибка была в другой строке.') + '<br>' + escHtml(wrongLine ? wrongLine.text : ('Ответ ученика: ' + q.a)) + '<br>Верный ответ: ' + escHtml(q.a) + '<div class="w37-inline-note">🧠 Уверенность: ' + confLabel(meta.confidence || 'mid') + '. ' + confidenceInsight(meta.evaluation && meta.evaluation.ok, meta.confidence || 'mid') + '</div>';
      }
    }
    function renderDiagCurrent(){
      var q = currentDiagQuestion();
      if (!q) return;
      var meta = ensureDiagMeta(q);
      decorateDiagQuestion(meta, q);
      if (meta.kind === 'gap') return renderDiagGap(meta, q);
      if (meta.kind === 'multi') return renderDiagMulti(meta, q);
      if (meta.kind === 'match') return renderDiagMatch(meta, q);
      if (meta.kind === 'mistake') return renderDiagMistake(meta, q);
      return applyDiagClassic(meta, q);
    }
    function finishDiag(ok, extra){
      var q = currentDiagQuestion();
      var meta = ensureDiagMeta(q);
      meta.answered = true;
      meta.evaluation = { ok: !!ok, extra: extra || null };
      recordDiag(!!ok, meta, extra || null);
      var chosen = ok ? q.a : (q.opts.filter(function(opt){ return opt !== q.a; })[0] || q.a);
      var ghost = document.createElement('button');
      ghost.className = 'opt';
      original.selectOpt.call(window, ghost, chosen, q.a, q.hint);
      renderDiagCurrent();
    }

    window.wave37DiagSetConfidence = function(id){
      var q = currentDiagQuestion();
      if (!q) return;
      var meta = ensureDiagMeta(q);
      if (meta.answered) return;
      meta.confidence = id;
      renderDiagCurrent();
    };
    window.wave37DiagSubmitGap = function(){
      var q = currentDiagQuestion(); if (!q) return;
      var meta = ensureDiagMeta(q);
      var input = document.getElementById('w37-diag-gap');
      meta.input = input ? String(input.value || '').trim() : String(meta.input || '').trim();
      meta.userInput = meta.input;
      finishDiag(cleanText(meta.userInput).toLowerCase() === cleanText(q.a).toLowerCase(), { typed: meta.userInput });
    };
    window.wave37DiagToggleMulti = function(idx){
      var q = currentDiagQuestion(); if (!q) return;
      var meta = ensureDiagMeta(q);
      if (meta.answered) return;
      meta.picked[idx] = !meta.picked[idx];
      renderDiagCurrent();
    };
    window.wave37DiagSubmitMulti = function(){
      var q = currentDiagQuestion(); if (!q) return;
      var meta = ensureDiagMeta(q);
      var ok = true;
      meta.items.forEach(function(item, idx){ if (!!meta.picked[idx] !== (item !== q.a)) ok = false; });
      finishDiag(ok, { picked: meta.picked });
    };
    window.wave37DiagMarkMatch = function(idx, value){
      var q = currentDiagQuestion(); if (!q) return;
      var meta = ensureDiagMeta(q);
      if (meta.answered) return;
      meta.map[idx] = value;
      renderDiagCurrent();
    };
    window.wave37DiagSubmitMatch = function(){
      var q = currentDiagQuestion(); if (!q) return;
      var meta = ensureDiagMeta(q);
      var ok = true;
      meta.items.forEach(function(item, idx){ if (meta.map[idx] !== (item === q.a ? 'ok' : 'no')) ok = false; });
      finishDiag(ok, { map: meta.map });
    };
    window.wave37DiagPickMistake = function(idx){
      var q = currentDiagQuestion(); if (!q) return;
      var meta = ensureDiagMeta(q);
      if (meta.answered) return;
      meta.picked = idx;
      renderDiagCurrent();
    };
    window.wave37DiagSubmitMistake = function(){
      var q = currentDiagQuestion(); if (!q) return;
      var meta = ensureDiagMeta(q);
      var target = -1;
      meta.lines.forEach(function(line, idx){ if (line.bad) target = idx; });
      finishDiag(meta.picked === target, { picked: meta.picked });
    };

    window.renderQ = function(){
      var out = original.renderQ.apply(this, arguments);
      try { renderDiagCurrent(); } catch(_) {}
      return out;
    };
    window.selectOpt = function(btn, chosen, correct, hint){
      var q = currentDiagQuestion();
      var meta = ensureDiagMeta(q);
      if (meta && meta.kind !== 'classic') return;
      try {
        meta.answered = true;
        meta.evaluation = { ok: chosen === correct, chosen: chosen };
        recordDiag(chosen === correct, meta, { chosen: chosen });
      } catch(_) {}
      var out = original.selectOpt.call(this, btn, chosen, correct, hint);
      try { renderDiagCurrent(); } catch(_) {}
      return out;
    };
    window.startDiag = function(){
      diagSession = [];
      return original.startDiag.apply(this, arguments);
    };
    if (original.showResult) {
      window.showResult = function(){
        var out = original.showResult.apply(this, arguments);
        try {
          if (!diagSession.length || document.getElementById('wave37-diag-result')) return out;
          var sum = summarizeSession(diagSession);
          var anchor = document.getElementById('strong-block') || document.getElementById('gaps-block');
          if (!anchor || !anchor.parentNode) return out;
          var block = document.createElement('div');
          block.className = 'ins-block';
          block.id = 'wave37-diag-result';
          block.innerHTML = '<h3>🧩 Форматы и уверенность</h3>'
            + '<div class="w37-grid">'
            + '<div class="w37-stat"><div class="v">' + sum.total + '</div><div class="l">вопросов в попытке</div></div>'
            + '<div class="w37-stat"><div class="v">' + sum.pct + '%</div><div class="l">точность</div></div>'
            + '<div class="w37-stat"><div class="v" style="color:var(--red)">' + sum.highWrong + '</div><div class="l">ошибок при высокой уверенности</div></div>'
            + '<div class="w37-stat"><div class="v" style="color:var(--green)">' + sum.lowOk + '</div><div class="l">верных при сомнениях</div></div>'
            + '</div>'
            + '<div class="w37-note">' + escHtml(summaryText(sum)) + '. В экзаменном режиме новые механики отключаются и остаётся классический формат.</div>';
          anchor.parentNode.insertBefore(block, anchor.nextSibling);
        } catch(_) {}
        return out;
      };
    }
    if (original.shareResult) {
      window.shareResult = function(){
        if (!diagSession.length) return original.shareResult.apply(this, arguments);
        var r = window._diagResult;
        if (!r) return original.shareResult.apply(this, arguments);
        var sum = summarizeSession(diagSession);
        var text = '📊 Диагностика: ' + r.subj.name + '\n';
        text += 'Итого: ' + r.totalOk + '/' + r.totalQ + ' (' + r.pct + '%)\n';
        text += '🧩 Форматы: ' + summaryText(sum) + '\n';
        if (sum.highWrong) text += '⚠️ Ошибок при высокой уверенности: ' + sum.highWrong + '\n';
        if (sum.lowOk) text += '✅ Верных при сомнениях: ' + sum.lowOk + '\n';
        if (navigator.share) navigator.share({ title:'Диагностика: ' + r.subj.name, text:text }).catch(function(){ copyText(text); });
        else copyText(text);
      };
    }
    return true;
  }

  function tryBoot(){
    var gradeOk = !document.getElementById('s-play') || installGrade();
    var diagOk = !document.getElementById('s-quiz') || installDiagnostic();
    return gradeOk && diagOk;
  }

  function scheduleBoot(){
    if (tryBoot()) return;
    var ticks = 0;
    var id = setInterval(function(){
      ticks += 1;
      if (tryBoot() || ticks > 180) clearInterval(id);
    }, 120);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleBoot, { once:true });
  else scheduleBoot();
})();
/* --- wave39_gamification.js --- */
(function(){
  if (typeof window === 'undefined') return;
  if (window.wave39Debug) return;

  var VERSION = 'wave39';
  var STYLE_ID = 'wave39-style';
  var STATE_KEY = 'trainer_gamify_v2';
  var LOG_KEY = 'trainer_gamify_log_v2';
  var MISSION_DAY_KEY = 'trainer_gamify_missions_v2';
  var gradeAttempt = null;
  var diagAttempt = null;

  function num(v){ return Number(v || 0) || 0; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function jparse(raw, fallback){ try { return raw ? JSON.parse(raw) : fallback; } catch(_) { return fallback; } }
  function jget(key, fallback){ try { return jparse(localStorage.getItem(key), fallback); } catch(_) { return fallback; } }
  function jset(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch(_) {} }
  function todayIso(){ return new Date().toISOString().slice(0, 10); }
  function safeDate(d){ return String(d || '').slice(0, 10); }
  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function dayTs(iso){ return new Date(String(iso || '').slice(0,10) + 'T00:00:00').getTime(); }
  function diffDays(a, b){ return Math.round((dayTs(safeDate(a)) - dayTs(safeDate(b))) / 86400000); }
  function decl(n, one, few, many){
    if (typeof window.declNum === 'function') return window.declNum(n, one, few, many);
    var a = Math.abs(n) % 100;
    var b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  }
  function pct(ok, total){ return total > 0 ? Math.round(ok / total * 100) : 0; }
  function activeProfileName(){
    try {
      if (window.wave35Debug && typeof window.wave35Debug.activeProfile === 'function') {
        var p = window.wave35Debug.activeProfile();
        if (p && p.name) return String(p.name);
      }
    } catch(_) {}
    try { return localStorage.getItem('trainer_player_name') || 'Ученик'; } catch(_) { return 'Ученик'; }
  }
  function activeProfileId(){
    try {
      if (window.wave35Debug && typeof window.wave35Debug.activeProfileId === 'function') return String(window.wave35Debug.activeProfileId() || 'p1');
    } catch(_) {}
    return 'p1';
  }
  function isGradePage(){ return typeof window.GRADE_NUM !== 'undefined' && !!document.getElementById('s-play'); }
  function isDashboardPage(){ return !!document.getElementById('grades') && !!document.getElementById('activity'); }
  function isDiagnosticPage(){ return !!document.getElementById('s-select') && !!document.getElementById('s-quiz'); }
  function uniqPush(arr, value){ if (value == null) return; value = String(value); if (arr.indexOf(value) === -1) arr.push(value); }

  function defaultState(){
    return {
      version: VERSION,
      xp: 0,
      answers: 0,
      correct: 0,
      sessions: 0,
      diagnostics: 0,
      comboBest: 0,
      badgesSeen: 0,
      lastAward: null
    };
  }
  function defaultDay(date){
    return {
      date: safeDate(date || todayIso()),
      xp: 0,
      answers: 0,
      correct: 0,
      sessions: 0,
      diagnostics: 0,
      highAcc: 0,
      maxCombo: 0,
      subjects: []
    };
  }
  function loadState(){
    var state = jget(STATE_KEY, null);
    if (!state || typeof state !== 'object') state = defaultState();
    state.version = VERSION;
    state.xp = num(state.xp);
    state.answers = num(state.answers);
    state.correct = num(state.correct);
    state.sessions = num(state.sessions);
    state.diagnostics = num(state.diagnostics);
    state.comboBest = num(state.comboBest);
    state.badgesSeen = num(state.badgesSeen);
    state.lastAward = state.lastAward && typeof state.lastAward === 'object' ? state.lastAward : null;
    return state;
  }
  function saveState(state){ jset(STATE_KEY, state); return state; }
  function loadLog(){
    var log = jget(LOG_KEY, []);
    if (!Array.isArray(log)) log = [];
    log = log.filter(function(row){ return row && typeof row === 'object' && row.date; }).map(function(row){
      row = clone(row);
      row.date = safeDate(row.date);
      row.xp = num(row.xp);
      row.answers = num(row.answers);
      row.correct = num(row.correct);
      row.sessions = num(row.sessions);
      row.diagnostics = num(row.diagnostics);
      row.highAcc = num(row.highAcc);
      row.maxCombo = num(row.maxCombo);
      row.subjects = Array.isArray(row.subjects) ? row.subjects.map(function(s){ return String(s || ''); }).filter(Boolean) : [];
      return row;
    }).sort(function(a, b){ return a.date.localeCompare(b.date); }).slice(-180);
    return log;
  }
  function saveLog(log){ jset(LOG_KEY, (log || []).slice(-180)); }
  function getOrMakeDay(log, date){
    date = safeDate(date || todayIso());
    for (var i = 0; i < log.length; i++) if (log[i].date === date) return log[i];
    var row = defaultDay(date);
    log.push(row);
    log.sort(function(a, b){ return a.date.localeCompare(b.date); });
    while (log.length > 180) log.shift();
    return row;
  }

  function levelInfo(xp){
    xp = num(xp);
    var level = 1;
    var floor = 0;
    var step = 100;
    while (xp >= floor + step) {
      floor += step;
      level += 1;
      step = 100 + (level - 1) * 20;
    }
    return {
      level: level,
      floor: floor,
      next: floor + step,
      span: step,
      progress: xp - floor,
      remain: floor + step - xp
    };
  }
  function levelTitle(level){
    level = num(level);
    if (level >= 12) return 'Эксперт';
    if (level >= 9) return 'Мастер';
    if (level >= 7) return 'Практик';
    if (level >= 5) return 'Исследователь';
    if (level >= 3) return 'Следопыт';
    return 'Новичок';
  }
  function profileTone(level){
    if (level >= 12) return '👑';
    if (level >= 9) return '🏆';
    if (level >= 7) return '🧠';
    if (level >= 5) return '🚀';
    if (level >= 3) return '⭐';
    return '🌱';
  }
  function streakInfo(log){
    var dates = log.filter(function(row){ return num(row.answers) > 0 || num(row.xp) > 0; }).map(function(row){ return safeDate(row.date); }).sort();
    if (!dates.length) return { current:0, best:0, last:'' };
    var best = 1;
    var run = 1;
    for (var i = 1; i < dates.length; i++) {
      var d = diffDays(dates[i], dates[i - 1]);
      if (d === 1) run += 1;
      else if (d !== 0) run = 1;
      if (run > best) best = run;
    }
    var current = 1;
    for (var j = dates.length - 1; j > 0; j--) {
      var dd = diffDays(dates[j], dates[j - 1]);
      if (dd === 1) current += 1;
      else if (dd !== 0) break;
    }
    var last = dates[dates.length - 1];
    var gap = diffDays(todayIso(), last);
    if (gap > 1) current = 0;
    return { current: current, best: best, last: last };
  }
  function badgeCount(){
    var seen = {};
    for (var g = 1; g <= 11; g++) {
      var raw = jget('trainer_streak_' + g, null);
      var rows = raw && Array.isArray(raw.badges) ? raw.badges : [];
      rows.forEach(function(id){ seen[String(id)] = 1; });
    }
    return Object.keys(seen).length;
  }
  function subjectMix(log){
    var seen = {};
    log.forEach(function(row){ (row.subjects || []).forEach(function(s){ seen[s] = 1; }); });
    return Object.keys(seen).length;
  }
  function recentXp(log, days){
    days = num(days) || 7;
    var start = new Date(dayTs(todayIso()) - (days - 1) * 86400000).toISOString().slice(0,10);
    return log.filter(function(row){ return row.date >= start; }).reduce(function(sum, row){ return sum + num(row.xp); }, 0);
  }

  function loadMissionState(){
    var row = jget(MISSION_DAY_KEY, null);
    if (!row || typeof row !== 'object' || row.date !== todayIso()) row = { date: todayIso(), rewarded: [] };
    if (!Array.isArray(row.rewarded)) row.rewarded = [];
    return row;
  }
  function saveMissionState(row){ jset(MISSION_DAY_KEY, row); }
  function currentMissions(day){
    day = day || defaultDay(todayIso());
    return [
      { id:'warmup', title:'Разминка', label:'10 ответов сегодня', cur: Math.min(num(day.answers), 10), need: 10, reward: 25, done: num(day.answers) >= 10 },
      { id:'tempo', title:'Темп', label:'2 сессии за день', cur: Math.min(num(day.sessions) + num(day.diagnostics), 2), need: 2, reward: 30, done: (num(day.sessions) + num(day.diagnostics)) >= 2 },
      { id:'precision', title:'Точность', label:'хотя бы одна попытка 80%+', cur: num(day.highAcc) ? 1 : 0, need: 1, reward: 35, done: !!num(day.highAcc) }
    ];
  }
  function missionRewards(day){
    var missionState = loadMissionState();
    var missions = currentMissions(day);
    var completed = [];
    var bonus = 0;
    missions.forEach(function(m){
      if (m.done && missionState.rewarded.indexOf(m.id) === -1) {
        missionState.rewarded.push(m.id);
        bonus += m.reward;
        completed.push(m);
      }
    });
    saveMissionState(missionState);
    return { bonus: bonus, completed: completed, missions: missions };
  }

  function estimateGradeXp(payload){
    var base = num(payload.total) * 2 + num(payload.ok) + Math.min(12, num(payload.combo) * 2);
    if (num(payload.pct) >= 70) base += 6;
    if (num(payload.pct) >= 85) base += 8;
    if (num(payload.pct) >= 100) base += 12;
    if (payload.review) base += 5;
    if (payload.subject === 'Микс') base += 4;
    return Math.round(base);
  }
  function estimateDiagXp(payload){
    var base = num(payload.total) * 3 + num(payload.ok) * 2;
    if (num(payload.pct) >= 70) base += 10;
    if (num(payload.pct) >= 85) base += 12;
    if (num(payload.pct) >= 100) base += 18;
    if (payload.mode === 'exam') base += 8;
    return Math.round(base);
  }
  function computeXp(payload){
    return payload && payload.source === 'diagnostic' ? estimateDiagXp(payload) : estimateGradeXp(payload || {});
  }

  function applyAward(payload){
    if (!payload || !num(payload.total)) return null;
    var state = loadState();
    var log = loadLog();
    var day = getOrMakeDay(log, todayIso());
    var before = levelInfo(state.xp);
    var baseXp = computeXp(payload);

    state.xp += baseXp;
    state.answers += num(payload.total);
    state.correct += num(payload.ok);
    state.sessions += payload.source === 'diagnostic' ? 0 : 1;
    state.diagnostics += payload.source === 'diagnostic' ? 1 : 0;
    state.comboBest = Math.max(state.comboBest, num(payload.combo));
    state.badgesSeen = Math.max(state.badgesSeen, badgeCount());

    day.xp += baseXp;
    day.answers += num(payload.total);
    day.correct += num(payload.ok);
    day.sessions += payload.source === 'diagnostic' ? 0 : 1;
    day.diagnostics += payload.source === 'diagnostic' ? 1 : 0;
    if (num(payload.pct) >= 80) day.highAcc = 1;
    day.maxCombo = Math.max(day.maxCombo, num(payload.combo));
    uniqPush(day.subjects, payload.subject || 'Тренировка');

    var mission = missionRewards(day);
    if (mission.bonus) {
      state.xp += mission.bonus;
      day.xp += mission.bonus;
    }

    saveLog(log);
    var after = levelInfo(state.xp);
    var streak = streakInfo(log);
    state.lastAward = {
      ts: Date.now(),
      source: payload.source,
      subject: payload.subject,
      total: num(payload.total),
      ok: num(payload.ok),
      pct: num(payload.pct),
      combo: num(payload.combo),
      baseXp: baseXp,
      missionXp: mission.bonus,
      xpGain: baseXp + mission.bonus,
      beforeLevel: before.level,
      afterLevel: after.level,
      levelUp: after.level > before.level,
      missions: mission.completed.map(function(m){ return m.title; }),
      streak: streak.current
    };
    saveState(state);
    return {
      payload: clone(payload),
      state: state,
      before: before,
      after: after,
      day: clone(day),
      streak: streak,
      missions: mission.missions,
      completedMissions: mission.completed,
      baseXp: baseXp,
      missionXp: mission.bonus,
      xpGain: baseXp + mission.bonus,
      levelUp: after.level > before.level,
      badges: state.badgesSeen
    };
  }

  function loadSnapshot(){
    var state = loadState();
    var log = loadLog();
    var today = getOrMakeDay(log, todayIso());
    var level = levelInfo(state.xp);
    var streak = streakInfo(log);
    var badges = badgeCount();
    if (badges > state.badgesSeen) { state.badgesSeen = badges; saveState(state); }
    return {
      profile: activeProfileName(),
      profileId: activeProfileId(),
      state: state,
      log: log,
      today: clone(today),
      level: level,
      streak: streak,
      badges: badges,
      missions: currentMissions(today),
      mixSubjects: subjectMix(log),
      xp7: recentXp(log, 7),
      xp30: recentXp(log, 30)
    };
  }

  function ensureStyles(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = ''
      + '.wave39-wrap{margin-top:12px}'
      + '.wave39-card{border:1px solid var(--border);background:var(--card);border-radius:18px;padding:14px 14px 12px;box-shadow:0 12px 30px rgba(15,23,42,.06)}'
      + '.wave39-card.dark{background:linear-gradient(135deg,#0f172a,#172554);color:#fff;border-color:rgba(255,255,255,.12)}'
      + '.wave39-kicker{font-size:10px;text-transform:uppercase;letter-spacing:.12em;font-weight:800;color:var(--muted);margin-bottom:6px}'
      + '.wave39-card.dark .wave39-kicker{color:rgba(255,255,255,.68)}'
      + '.wave39-title{font-size:16px;font-weight:900;line-height:1.25}'
      + '.wave39-card.dark .wave39-title{color:#fff}'
      + '.wave39-sub{margin-top:4px;font-size:12px;line-height:1.55;color:var(--muted)}'
      + '.wave39-card.dark .wave39-sub{color:rgba(255,255,255,.82)}'
      + '.wave39-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}'
      + '.wave39-stat{border:1px solid var(--border);border-radius:14px;padding:12px;background:var(--bg);text-align:center}'
      + '.wave39-card.dark .wave39-stat{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.10)}'
      + '.wave39-stat .v{font-size:22px;font-weight:900;font-family:JetBrains Mono,monospace;line-height:1.1}'
      + '.wave39-stat .l{font-size:11px;color:var(--muted);margin-top:4px;line-height:1.35}'
      + '.wave39-card.dark .wave39-stat .l{color:rgba(255,255,255,.78)}'
      + '.wave39-progress{margin-top:10px}'
      + '.wave39-bar{height:10px;border-radius:999px;background:rgba(148,163,184,.22);overflow:hidden}'
      + '.wave39-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#22c55e,#60a5fa,#a78bfa)}'
      + '.wave39-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;font-size:11px;color:var(--muted)}'
      + '.wave39-card.dark .wave39-meta{color:rgba(255,255,255,.82)}'
      + '.wave39-pills{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}'
      + '.wave39-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:var(--abg);color:var(--accent);font-size:11px;font-weight:800}'
      + '.wave39-card.dark .wave39-pill{background:rgba(255,255,255,.12);color:#fff}'
      + '.wave39-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}'
      + '.wave39-chip{border:1px solid var(--border);border-radius:14px;background:var(--card);padding:10px 12px;display:flex;flex-direction:column;gap:3px;cursor:pointer}'
      + '.wave39-chip b{font-size:13px;line-height:1.2}'
      + '.wave39-chip span{font-size:11px;color:var(--muted);line-height:1.35}'
      + '.wave39-quests{display:grid;gap:8px;margin-top:12px}'
      + '.wave39-quest{border:1px solid var(--border);border-radius:14px;padding:10px 12px;background:var(--bg)}'
      + '.wave39-quest .t{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;font-weight:800}'
      + '.wave39-quest .s{font-size:11px;color:var(--muted);margin-top:4px;line-height:1.45}'
      + '.wave39-quest .r{font-size:11px;font-weight:800;color:#16a34a}'
      + '.wave39-quest.done{border-color:rgba(34,197,94,.28);background:rgba(34,197,94,.08)}'
      + '.wave39-inline{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}'
      + '.wave39-note{margin-top:8px;font-size:12px;line-height:1.55;color:var(--muted)}'
      + '.wave39-card.dark .wave39-note{color:rgba(255,255,255,.82)}'
      + '.wave39-live{margin-top:8px;padding:8px 10px;border:1px solid var(--border);border-radius:12px;background:var(--card);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}'
      + '.wave39-live .sub{font-size:11px;color:var(--muted);font-weight:600}'
      + '.wave39-toast{position:fixed;right:14px;bottom:14px;z-index:99998;max-width:320px;background:#0f172a;color:#fff;border-radius:16px;padding:14px 14px 12px;box-shadow:0 18px 40px rgba(15,23,42,.28);border:1px solid rgba(255,255,255,.08)}'
      + '.wave39-toast .h{font-weight:900;font-size:14px;display:flex;align-items:center;gap:8px}'
      + '.wave39-toast .b{font-size:12px;line-height:1.55;color:rgba(255,255,255,.84);margin-top:6px}'
      + '.wave39-toast .x{margin-top:8px;font-size:11px;color:#93c5fd;font-weight:800}'
      + '.wave39-mini-bars{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;align-items:end;margin-top:10px;height:48px}'
      + '.wave39-mini-bars span{display:block;border-radius:8px 8px 4px 4px;background:linear-gradient(180deg,#60a5fa,#2563eb);min-height:8px}'
      + '.wave39-mini-bars small{display:block;text-align:center;font-size:9px;color:var(--muted);margin-top:4px}'
      + '@media (max-width:720px){.wave39-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.wave39-strip{grid-template-columns:1fr}.wave39-live{display:block}.wave39-live .sub{display:block;margin-top:4px}}';
    document.head.appendChild(style);
  }

  function progressHtml(info){
    var pctFill = info.level.span > 0 ? Math.max(0, Math.min(100, Math.round(info.level.progress / info.level.span * 100))) : 0;
    return '<div class="wave39-progress"><div class="wave39-bar"><div class="wave39-fill" style="width:' + pctFill + '%"></div></div><div class="wave39-meta"><span>' + info.level.progress + ' XP в уровне</span><span>до следующего: ' + info.level.remain + ' XP</span></div></div>';
  }
  function missionListHtml(missions){
    return '<div class="wave39-quests">' + missions.map(function(m){
      var fill = m.need > 0 ? Math.round(m.cur / m.need * 100) : 0;
      if (fill > 100) fill = 100;
      return '<div class="wave39-quest' + (m.done ? ' done' : '') + '"><div class="t"><span>' + esc(m.title) + '</span><span class="r">+' + m.reward + ' XP</span></div><div class="s">' + esc(m.label) + ' · ' + m.cur + '/' + m.need + '</div><div class="wave39-bar" style="margin-top:8px;height:8px"><div class="wave39-fill" style="width:' + fill + '%"></div></div></div>';
    }).join('') + '</div>';
  }
  function miniBarsHtml(log){
    var out = [];
    for (var i = 6; i >= 0; i--) {
      var date = new Date(dayTs(todayIso()) - i * 86400000).toISOString().slice(0,10);
      var row = null;
      for (var j = 0; j < log.length; j++) if (log[j].date === date) { row = log[j]; break; }
      out.push({ date: date, xp: row ? num(row.xp) : 0 });
    }
    var maxXp = Math.max.apply(null, out.map(function(r){ return r.xp; }).concat([1]));
    return '<div class="wave39-mini-bars">' + out.map(function(r){
      var h = Math.max(8, Math.round(r.xp / maxXp * 44));
      var label = r.date.slice(8);
      return '<div><span style="height:' + h + 'px"></span><small>' + label + '</small></div>';
    }).join('') + '</div>';
  }

  function profileStripHtml(info){
    return '<div class="wave39-strip">'
      + '<button type="button" class="wave39-chip" id="wave39-chip-level"><b>' + profileTone(info.level.level) + ' Уровень ' + info.level.level + ' · ' + esc(levelTitle(info.level.level)) + '</b><span>' + esc(info.profile) + ' · всего ' + info.state.xp + ' XP</span></button>'
      + '<button type="button" class="wave39-chip" id="wave39-chip-badges"><b>🏅 Награды: ' + info.badges + '</b><span>открыто достижений по этому профилю</span></button>'
      + '<button type="button" class="wave39-chip" id="wave39-chip-missions"><b>🎯 Миссии: ' + info.missions.filter(function(m){ return m.done; }).length + '/3</b><span>сегодняшние задания и бонусный XP</span></button>'
      + '</div>';
  }
  function mainCardHtml(info){
    return '<div class="wave39-card dark">'
      + '<div class="wave39-kicker">Gamification 2.0</div>'
      + '<div class="wave39-title">' + profileTone(info.level.level) + ' ' + esc(levelTitle(info.level.level)) + ' · уровень ' + info.level.level + '</div>'
      + '<div class="wave39-sub">Профиль <b>' + esc(info.profile) + '</b>. XP растёт от обычных тренировок, диагностики, серий без ошибок и выполненных миссий.</div>'
      + '<div class="wave39-grid">'
        + '<div class="wave39-stat"><div class="v">' + info.state.xp + '</div><div class="l">всего XP</div></div>'
        + '<div class="wave39-stat"><div class="v">' + info.streak.current + '</div><div class="l">серия дней</div></div>'
        + '<div class="wave39-stat"><div class="v">' + info.state.comboBest + '</div><div class="l">лучший combo</div></div>'
        + '<div class="wave39-stat"><div class="v">' + info.badges + '</div><div class="l">награды</div></div>'
      + '</div>'
      + progressHtml(info)
      + '<div class="wave39-inline">'
        + '<span class="wave39-pill">⚡ 7 дней: ' + info.xp7 + ' XP</span>'
        + '<span class="wave39-pill">🧠 предметов затронуто: ' + info.mixSubjects + '</span>'
        + '<span class="wave39-pill">📊 точность: ' + pct(info.state.correct, info.state.answers) + '%</span>'
      + '</div>'
      + missionListHtml(info.missions)
      + '</div>';
  }
  function progressCardHtml(info){
    return '<div class="wave39-card">'
      + '<div class="wave39-kicker">Richer profile</div>'
      + '<div class="wave39-title">🏆 Профиль прогресса</div>'
      + '<div class="wave39-sub">Уровень растёт не только от количества задач, но и от качества: серии, точности, миссий и диагностики.</div>'
      + '<div class="wave39-grid">'
        + '<div class="wave39-stat"><div class="v">' + info.level.level + '</div><div class="l">текущий уровень</div></div>'
        + '<div class="wave39-stat"><div class="v">' + info.state.answers + '</div><div class="l">всего ответов</div></div>'
        + '<div class="wave39-stat"><div class="v">' + info.state.sessions + '</div><div class="l">тренировочных сессий</div></div>'
        + '<div class="wave39-stat"><div class="v">' + info.state.diagnostics + '</div><div class="l">диагностик</div></div>'
      + '</div>'
      + progressHtml(info)
      + '<div class="wave39-note">Лучший combo: <b>' + info.state.comboBest + '</b>. Лучшая серия по дням: <b>' + info.streak.best + '</b>. За 30 дней набрано <b>' + info.xp30 + ' XP</b>.</div>'
      + miniBarsHtml(info.log)
      + '</div>';
  }
  function dashboardCardHtml(info){
    return '<div class="wave39-card">'
      + '<div class="wave39-kicker">Gamification 2.0</div>'
      + '<div class="wave39-title">' + profileTone(info.level.level) + ' Профиль: ' + esc(info.profile) + '</div>'
      + '<div class="wave39-sub">Глобальный прогресс по активному профилю: XP, уровни, ежедневная серия и миссии на сегодня.</div>'
      + '<div class="wave39-grid">'
        + '<div class="wave39-stat"><div class="v">' + info.level.level + '</div><div class="l">уровень</div></div>'
        + '<div class="wave39-stat"><div class="v">' + info.state.xp + '</div><div class="l">накоплено XP</div></div>'
        + '<div class="wave39-stat"><div class="v">' + info.streak.current + '</div><div class="l">серия дней</div></div>'
        + '<div class="wave39-stat"><div class="v">' + info.badges + '</div><div class="l">награды</div></div>'
      + '</div>'
      + progressHtml(info)
      + missionListHtml(info.missions)
      + '<div class="wave39-note">За последние 7 дней: <b>' + info.xp7 + ' XP</b>. Активных предметов за всё время: <b>' + info.mixSubjects + '</b>.</div>'
      + '</div>';
  }
  function diagnosticCardHtml(info){
    return '<div class="wave39-card">'
      + '<div class="wave39-kicker">Gamification 2.0</div>'
      + '<div class="wave39-title">🎮 XP и миссии</div>'
      + '<div class="wave39-sub">Диагностика теперь тоже приносит XP. За сильные попытки идёт больший прирост, а выполненные миссии дают бонус.</div>'
      + '<div class="wave39-inline">'
        + '<span class="wave39-pill">уровень ' + info.level.level + '</span>'
        + '<span class="wave39-pill">сегодня: ' + info.today.xp + ' XP</span>'
        + '<span class="wave39-pill">серия: ' + info.streak.current + ' ' + decl(info.streak.current, 'день', 'дня', 'дней') + '</span>'
      + '</div>'
      + missionListHtml(info.missions)
      + '</div>';
  }
  function liveBadgeHtml(info, previewXp){
    return '<div class="wave39-live"><div>⭐ Потенциал: <b>+' + previewXp + ' XP</b> · 🔥 combo <b>' + num(window.st && window.st.streak) + '</b></div><div class="sub">Уровень ' + info.level.level + ' · ' + esc(levelTitle(info.level.level)) + ' · до следующего уровня ' + info.level.remain + ' XP</div></div>';
  }

  function ensureHost(id, anchor, position){
    var host = document.getElementById(id);
    if (host) return host;
    host = document.createElement('div');
    host.id = id;
    host.className = 'wave39-wrap';
    if (!anchor || !anchor.parentNode) return null;
    if (position === 'before') anchor.parentNode.insertBefore(host, anchor);
    else if (position === 'inside-top') anchor.insertBefore(host, anchor.firstChild);
    else anchor.parentNode.insertBefore(host, anchor.nextSibling);
    return host;
  }
  function wireProfileButtons(root){
    if (!root) return;
    var levelBtn = root.querySelector('#wave39-chip-level');
    var badgesBtn = root.querySelector('#wave39-chip-badges');
    var missionsBtn = root.querySelector('#wave39-chip-missions');
    levelBtn && levelBtn.addEventListener('click', function(){
      try { if (window.wave35Debug && typeof window.wave35Debug.showProfilesModal === 'function') window.wave35Debug.showProfilesModal(); }
      catch(_) {}
    });
    badgesBtn && badgesBtn.addEventListener('click', function(){ try { if (typeof window.showBadges === 'function') window.showBadges(); } catch(_) {} });
    missionsBtn && missionsBtn.addEventListener('click', function(){
      try {
        var prog = document.getElementById('s-prog');
        if (prog && typeof window.go === 'function') { window.go('prog'); if (typeof window.renderProg === 'function') setTimeout(window.renderProg, 30); }
      } catch(_) {}
    });
  }

  function renderGradeProfile(){
    if (!isGradePage()) return;
    ensureStyles();
    var badge = document.getElementById('player-badge');
    if (!badge) return;
    var host = badge.querySelector('#wave39-profile-strip');
    if (!host) {
      host = document.createElement('div');
      host.id = 'wave39-profile-strip';
      host.className = 'wave39-wrap';
      badge.appendChild(host);
    }
    host.innerHTML = profileStripHtml(loadSnapshot());
    wireProfileButtons(host);
  }
  function renderGradeMain(){
    if (!isGradePage()) return;
    ensureStyles();
    var anchor = document.getElementById('wave35-main-card') || document.getElementById('daily-meter') || document.getElementById('main-search-slot');
    if (!anchor) return;
    var host = ensureHost('wave39-main-card', anchor, 'after');
    if (!host) return;
    host.innerHTML = mainCardHtml(loadSnapshot());
  }
  function renderGradeProgress(){
    if (!isGradePage()) return;
    ensureStyles();
    var box = document.getElementById('prog-content');
    if (!box) return;
    var anchor = document.getElementById('wave37-grade-progress') || document.getElementById('wave35-progress-card') || box.firstChild || box;
    var host = document.getElementById('wave39-progress-card');
    if (!host) {
      host = document.createElement('div');
      host.id = 'wave39-progress-card';
      host.className = 'wave39-wrap';
      box.insertBefore(host, anchor && anchor.parentNode === box ? anchor.nextSibling : box.firstChild);
    }
    host.innerHTML = progressCardHtml(loadSnapshot());
  }
  function renderLiveBadge(){
    if (!isGradePage() || !document.getElementById('s-play')) return;
    if (typeof window.st === 'undefined' || typeof window.prob === 'undefined' || !window.prob) return;
    ensureStyles();
    var pa = document.getElementById('pa') || document.getElementById('sts');
    if (!pa) return;
    var live = document.getElementById('wave39-live-badge');
    if (!live) {
      live = document.createElement('div');
      live.id = 'wave39-live-badge';
      live.className = 'wave39-wrap';
      pa.insertAdjacentElement('afterbegin', live);
    }
    var total = num(window.st.ok) + num(window.st.err);
    if (!total && document.getElementById('s-play').style.display === 'none') { live.innerHTML = ''; return; }
    var preview = estimateGradeXp({ total: total, ok: num(window.st.ok), pct: pct(num(window.st.ok), total), combo: num(window.st.best), subject: currentGradeSubject() });
    live.innerHTML = liveBadgeHtml(loadSnapshot(), preview);
  }
  function renderGradeResult(summary){
    if (!isGradePage() || !summary) return;
    ensureStyles();
    var root = document.getElementById('res-topics');
    if (!root) return;
    var old = document.getElementById('wave39-grade-result');
    if (old) old.remove();
    var block = document.createElement('div');
    block.id = 'wave39-grade-result';
    block.className = 'wave39-wrap';
    block.innerHTML = '<div class="wave39-card"><div class="wave39-kicker">Session XP</div><div class="wave39-title">⭐ +' + summary.xpGain + ' XP за сессию</div><div class="wave39-sub">' + esc(summary.payload.subject || 'Тренировка') + ' · ' + summary.payload.ok + '/' + summary.payload.total + ' · ' + summary.payload.pct + '% · combo ' + summary.payload.combo + '</div><div class="wave39-inline"><span class="wave39-pill">база: +' + summary.baseXp + ' XP</span>' + (summary.missionXp ? '<span class="wave39-pill">миссии: +' + summary.missionXp + ' XP</span>' : '') + (summary.levelUp ? '<span class="wave39-pill">⬆️ уровень ' + summary.after.level + '</span>' : '<span class="wave39-pill">уровень ' + summary.after.level + '</span>') + '</div>' + (summary.completedMissions.length ? '<div class="wave39-note">Выполнены миссии: ' + summary.completedMissions.map(function(m){ return esc(m.title); }).join(' · ') + '.</div>' : '<div class="wave39-note">До следующего уровня осталось ' + summary.after.remain + ' XP.</div>') + '</div>';
    root.insertAdjacentElement('afterbegin', block);
  }
  function renderDashboard(){
    if (!isDashboardPage()) return;
    ensureStyles();
    var anchor = document.getElementById('wave35-dashboard-root') || document.getElementById('grades');
    if (!anchor) return;
    var host = ensureHost('wave39-dashboard-root', anchor, 'before');
    if (!host) return;
    host.innerHTML = dashboardCardHtml(loadSnapshot());
  }
  function renderDiagnosticHub(){
    if (!isDiagnosticPage()) return;
    ensureStyles();
    var grid = document.getElementById('subj-grid') || document.querySelector('.subj-grid');
    if (!grid) return;
    var host = ensureHost('wave39-diagnostic-root', grid, 'before');
    if (!host) return;
    host.innerHTML = diagnosticCardHtml(loadSnapshot());
  }
  function renderDiagnosticResult(summary){
    if (!isDiagnosticPage() || !summary) return;
    ensureStyles();
    var anchor = document.getElementById('strong-block') || document.getElementById('gaps-block');
    if (!anchor || !anchor.parentNode) return;
    var old = document.getElementById('wave39-diagnostic-result');
    if (old) old.remove();
    var host = document.createElement('div');
    host.id = 'wave39-diagnostic-result';
    host.className = 'wave39-wrap';
    host.innerHTML = '<div class="wave39-card"><div class="wave39-kicker">Diagnostic XP</div><div class="wave39-title">📝 +' + summary.xpGain + ' XP за диагностику</div><div class="wave39-sub">' + esc(summary.payload.subject || 'Диагностика') + ' · ' + summary.payload.ok + '/' + summary.payload.total + ' · ' + summary.payload.pct + '%</div><div class="wave39-inline"><span class="wave39-pill">база: +' + summary.baseXp + ' XP</span>' + (summary.missionXp ? '<span class="wave39-pill">миссии: +' + summary.missionXp + ' XP</span>' : '') + (summary.levelUp ? '<span class="wave39-pill">⬆️ уровень ' + summary.after.level + '</span>' : '<span class="wave39-pill">уровень ' + summary.after.level + '</span>') + '</div>' + '<div class="wave39-note">Серия дней: ' + summary.streak.current + '. До следующего уровня осталось ' + summary.after.remain + ' XP.</div></div>';
    anchor.parentNode.insertBefore(host, anchor.nextSibling);
  }

  function showToast(summary){
    if (!summary) return;
    var old = document.getElementById('wave39-toast');
    if (old) old.remove();
    var div = document.createElement('div');
    div.id = 'wave39-toast';
    div.className = 'wave39-toast';
    div.innerHTML = '<div class="h">' + (summary.levelUp ? '⬆️ Новый уровень!' : '⭐ XP начислен') + '</div><div class="b">+' + summary.xpGain + ' XP · уровень ' + summary.after.level + ' · ' + esc(levelTitle(summary.after.level)) + (summary.completedMissions.length ? '<br>Миссии: ' + summary.completedMissions.map(function(m){ return esc(m.title); }).join(' · ') : '') + '</div><div class="x">До следующего уровня: ' + summary.after.remain + ' XP</div>';
    document.body.appendChild(div);
    setTimeout(function(){ if (div && div.parentNode) div.remove(); }, 4800);
  }

  function currentGradeSubject(){
    try {
      if (window.cS && window.cS.nm) return String(window.cS.nm);
      if (window.globalMix) return 'Микс';
    } catch(_) {}
    return 'Тренировка';
  }
  function currentDiagMode(){
    try { return window.wave25Diag && typeof window.wave25Diag.getModeId === 'function' ? String(window.wave25Diag.getModeId() || 'full') : 'full'; }
    catch(_) { return 'full'; }
  }
  function gradePayload(){
    if (typeof window.st === 'undefined') return null;
    var total = num(window.st.ok) + num(window.st.err);
    if (!total) return null;
    var isReview = false;
    try { isReview = !!window.reviewMode; } catch(_) {}
    return {
      source: 'grade',
      subject: currentGradeSubject(),
      total: total,
      ok: num(window.st.ok),
      pct: pct(num(window.st.ok), total),
      combo: num(window.st.best),
      review: isReview
    };
  }
  function diagPayload(){
    var r = window._diagResult;
    if (!r || !r.subj) return null;
    return {
      source: 'diagnostic',
      subject: r.subj.name || 'Диагностика',
      total: num(r.totalQ),
      ok: num(r.totalOk),
      pct: num(r.pct),
      combo: 0,
      mode: currentDiagMode()
    };
  }

  function patchDashboardReport(){
    if (!isDashboardPage() || window.__wave39DashReportPatched || typeof window.buildDashboardReport !== 'function') return;
    var original = window.buildDashboardReport;
    window.buildDashboardReport = function(state){
      var text = original.apply(this, arguments);
      var info = loadSnapshot();
      text += '\n━━━━━━━━━━━━━━━\nGamification 2.0:';
      text += '\nПрофиль: ' + info.profile;
      text += '\nУровень: ' + info.level.level + ' (' + levelTitle(info.level.level) + ')';
      text += '\nXP: ' + info.state.xp + ' · серия дней: ' + info.streak.current;
      text += '\nМиссии сегодня: ' + info.missions.filter(function(m){ return m.done; }).length + '/3';
      return text;
    };
    window.__wave39DashReportPatched = true;
  }

  function refreshGradeUi(){ renderGradeProfile(); renderGradeMain(); renderGradeProgress(); renderLiveBadge(); }
  function refreshDashboardUi(){ patchDashboardReport(); renderDashboard(); }
  function refreshDiagnosticUi(){ renderDiagnosticHub(); }
  function refreshAll(){ if (isGradePage()) refreshGradeUi(); if (isDashboardPage()) refreshDashboardUi(); if (isDiagnosticPage()) refreshDiagnosticUi(); }

  function installGrade(){
    if (!isGradePage()) return true;
    if (window.__wave39GradeInstalled) return true;
    if (typeof window.startQuiz !== 'function' || typeof window.endSession !== 'function' || typeof window.render !== 'function') return false;
    ensureStyles();
    window.__wave39GradeInstalled = true;

    var original = {
      startQuiz: window.startQuiz,
      endSession: window.endSession,
      render: window.render,
      renderProg: typeof window.renderProg === 'function' ? window.renderProg : null,
      refreshMain: typeof window.refreshMain === 'function' ? window.refreshMain : null,
      renderPlayerBadge: typeof window.renderPlayerBadge === 'function' ? window.renderPlayerBadge : null
    };

    window.startQuiz = function(){
      gradeAttempt = { ts: Date.now(), awarded: false, subject: currentGradeSubject() };
      return original.startQuiz.apply(this, arguments);
    };
    window.endSession = function(){
      var payload = gradePayload();
      var summary = null;
      if (payload) {
        gradeAttempt = gradeAttempt || { ts: Date.now(), awarded: false, subject: currentGradeSubject() };
        if (!gradeAttempt.awarded) {
          summary = applyAward(payload);
          gradeAttempt.awarded = true;
        }
      }
      var out = original.endSession.apply(this, arguments);
      if (summary) {
        setTimeout(function(){ renderGradeResult(summary); showToast(summary); refreshGradeUi(); }, 80);
      } else {
        setTimeout(refreshGradeUi, 80);
      }
      return out;
    };
    window.render = function(){
      var out = original.render.apply(this, arguments);
      try { renderLiveBadge(); } catch(_) {}
      return out;
    };
    if (original.renderProg) {
      window.renderProg = function(){
        var out = original.renderProg.apply(this, arguments);
        try { renderGradeProgress(); } catch(_) {}
        return out;
      };
    }
    if (original.refreshMain) {
      window.refreshMain = function(){
        var out = original.refreshMain.apply(this, arguments);
        try { renderGradeMain(); } catch(_) {}
        return out;
      };
    }
    if (original.renderPlayerBadge) {
      window.renderPlayerBadge = function(){
        var out = original.renderPlayerBadge.apply(this, arguments);
        try { renderGradeProfile(); } catch(_) {}
        return out;
      };
    }

    setTimeout(refreshGradeUi, 120);
    return true;
  }

  function installDiagnostic(){
    if (!isDiagnosticPage()) return true;
    if (window.__wave39DiagnosticInstalled) return true;
    if (typeof window.startDiag !== 'function' || typeof window.showResult !== 'function') return false;
    ensureStyles();
    window.__wave39DiagnosticInstalled = true;

    var original = {
      startDiag: window.startDiag,
      showResult: window.showResult
    };

    window.startDiag = function(){
      diagAttempt = { ts: Date.now(), awarded: false };
      return original.startDiag.apply(this, arguments);
    };
    window.showResult = function(){
      var payload = diagPayload();
      var summary = null;
      if (payload) {
        diagAttempt = diagAttempt || { ts: Date.now(), awarded: false };
        if (!diagAttempt.awarded) {
          summary = applyAward(payload);
          diagAttempt.awarded = true;
        }
      }
      var out = original.showResult.apply(this, arguments);
      if (summary) {
        setTimeout(function(){ renderDiagnosticResult(summary); showToast(summary); refreshDiagnosticUi(); }, 80);
      } else {
        setTimeout(refreshDiagnosticUi, 80);
      }
      return out;
    };
    setTimeout(refreshDiagnosticUi, 120);
    return true;
  }

  function installDashboard(){
    if (!isDashboardPage()) return true;
    if (window.__wave39DashboardInstalled) return true;
    ensureStyles();
    window.__wave39DashboardInstalled = true;
    patchDashboardReport();
    setTimeout(refreshDashboardUi, 80);
    window.addEventListener('dashboard-state-ready', function(){ try { refreshDashboardUi(); } catch(_) {} });
    return true;
  }

  function tryBoot(){
    var a = installGrade();
    var b = installDiagnostic();
    var c = installDashboard();
    return a && b && c;
  }
  function schedule(){
    if (tryBoot()) return;
    var ticks = 0;
    var id = setInterval(function(){
      ticks += 1;
      if (tryBoot() || ticks > 180) clearInterval(id);
    }, 120);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once:true });
  else schedule();

  window.wave39Debug = {
    version: VERSION,
    loadState: loadState,
    loadLog: loadLog,
    loadSnapshot: loadSnapshot,
    levelInfo: levelInfo,
    levelTitle: levelTitle,
    streakInfo: streakInfo,
    currentMissions: currentMissions,
    computeXp: computeXp,
    applyAward: applyAward,
    badgeCount: badgeCount,
    refreshAll: refreshAll,
    estimateGradeXp: estimateGradeXp,
    estimateDiagXp: estimateDiagXp
  };
})();


;
/* --- wave40_settings_shell.js --- */
(function(){
  if (typeof window === 'undefined' || window.__wave40SettingsShell) return;
  window.__wave40SettingsShell = true;

  var THEME_KEY = 'trainer_theme';
  var SETTINGS_BTN_ID = 'trainer-settings-btn';
  var SETTINGS_MODAL_ID = 'trainer-settings-modal';
  var SETTINGS_STYLE_ID = 'wave40-settings-style';
  var LEGACY_THEME_BTN_ID = 'trainer-theme-btn';
  var LEGACY_INSTALL_ID = 'wave24-install-btn';
  var INSTALL_DISMISS_KEY = 'trainer_install_dismiss_until_v1';
  var META_COLORS = { light:'#1a1a2e', dark:'#0e0e1a' };
  var state = { installPrompt:null, toastWrapped:false, observer:null };

  function storage(){
    try { return window.localStorage; } catch(_) { return null; }
  }
  function now(){ return Date.now(); }
  function setStore(key, value){ try { var s = storage(); s && s.setItem(key, value); } catch(_) {} }
  function getStore(key){ try { var s = storage(); return s ? s.getItem(key) : null; } catch(_) { return null; } }
  function getThemePref(){
    var value = getStore(THEME_KEY) || 'system';
    return /^(light|dark|system)$/.test(value) ? value : 'system';
  }
  function effectiveTheme(pref){
    if (pref === 'light' || pref === 'dark') return pref;
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch(_) {
      return 'light';
    }
  }
  function applyTheme(pref, silent){
    var value = pref || getThemePref();
    var root = document.documentElement || null;
    if (root) {
      if (value === 'system') {
        if (root.removeAttribute) root.removeAttribute('data-theme');
      } else if (root.setAttribute) {
        root.setAttribute('data-theme', value);
      }
    }
    var meta = document.querySelector && document.querySelector('meta[name="theme-color"]');
    var eff = effectiveTheme(value);
    if (meta && meta.setAttribute) meta.setAttribute('content', META_COLORS[eff] || META_COLORS.light);
    refreshThemeButtons();
    if (!silent && typeof window.showToast === 'function') {
      window.showToast('Тема: ' + (value === 'system' ? 'как в системе' : value === 'dark' ? 'тёмная' : 'светлая'), 'info', 1600);
    }
  }
  function setThemePref(pref, silent){
    setStore(THEME_KEY, pref);
    applyTheme(pref, silent === true);
  }
  function themeMeta(){
    var pref = getThemePref();
    return {
      pref: pref,
      icon: pref === 'light' ? '☀️' : pref === 'dark' ? '🌙' : '🖥️',
      label: pref === 'light' ? 'Светлая' : pref === 'dark' ? 'Тёмная' : 'Системная'
    };
  }
  function standalone(){
    try {
      return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || !!window.navigator.standalone;
    } catch(_) {
      return false;
    }
  }
  function compactInstallUi(){
    try {
      return !!(window.matchMedia && window.matchMedia('(max-width: 1023px)').matches);
    } catch(_) {
      return false;
    }
  }
  function installDismissed(){
    var raw = +(getStore(INSTALL_DISMISS_KEY) || 0);
    return raw > now();
  }
  function dismissInstall(days){
    var ttl = (typeof days === 'number' ? days : 7) * 86400000;
    setStore(INSTALL_DISMISS_KEY, String(now() + ttl));
    syncLegacyInstallButton();
    refreshModal();
    if (typeof window.showToast === 'function') window.showToast('Подсказка установки скрыта на 7 дней', 'info', 1800);
  }
  function clearInstallDismiss(){
    try { var s = storage(); s && s.removeItem(INSTALL_DISMISS_KEY); } catch(_) {}
    syncLegacyInstallButton();
    refreshModal();
  }
  function hideLegacyThemeButton(){
    var btn = document.getElementById && document.getElementById(LEGACY_THEME_BTN_ID);
    if (btn) {
      btn.hidden = true;
      btn.setAttribute('aria-hidden', 'true');
      btn.style.display = 'none';
      btn.style.pointerEvents = 'none';
    }
  }
  function syncLegacyInstallButton(){
    var btn = document.getElementById && document.getElementById(LEGACY_INSTALL_ID);
    if (!btn) return;
    btn.hidden = true;
    btn.style.display = 'none';
    btn.setAttribute('aria-hidden', 'true');
  }
  function wrapToast(){
    if (state.toastWrapped || typeof window.showToast !== 'function') return;
    var nativeToast = window.showToast;
    window.showToast = function(message, type, ms){
      var text = String(message == null ? '' : message);
      if (/Можно установить на главный экран/i.test(text)) return;
      return nativeToast.call(this, message, type, ms);
    };
    state.toastWrapped = true;
  }
  function ensureStyles(){
    if (document.getElementById(SETTINGS_STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = SETTINGS_STYLE_ID;
    style.textContent = '\n#' + LEGACY_THEME_BTN_ID + '{display:none!important;pointer-events:none!important}' +
      '\n#' + SETTINGS_BTN_ID + '{position:fixed;top:calc(12px + env(safe-area-inset-top,0));right:12px;z-index:12001;display:inline-flex;align-items:center;justify-content:center;min-width:32px;min-height:32px;padding:0 7px;border:1px solid rgba(26,26,46,.06);border-radius:999px;background:rgba(255,255,255,.52);color:#1a1a2e;box-shadow:0 2px 8px rgba(0,0,0,.06);font:700 10px/1 "Golos Text",system-ui,sans-serif;cursor:pointer;backdrop-filter:blur(8px);opacity:.84;transition:opacity .18s ease,transform .18s ease,box-shadow .18s ease,background .18s ease}' +
      '\nhtml[data-theme="dark"] #' + SETTINGS_BTN_ID + '{background:rgba(30,30,46,.78);color:#e8e6e0;border:1px solid rgba(255,255,255,.10)}' +
      '\n#' + SETTINGS_MODAL_ID + '{position:fixed;inset:0;z-index:14000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.56)}' +
      '\n#' + SETTINGS_MODAL_ID + ' [data-settings-card]{width:min(100%,560px);max-height:88vh;overflow:auto;background:var(--card,#fff);color:var(--text,#111827);border:1px solid var(--border,#d7d3cc);border-radius:20px;padding:22px 18px;box-shadow:0 18px 40px rgba(0,0,0,.26)}' +
      '\n.wave40-settings-section{background:rgba(37,99,235,.06);border-radius:14px;padding:12px 12px;margin-top:12px}' +
      '\n.wave40-settings-title{display:flex;align-items:center;gap:8px;font:800 13px/1.2 "Unbounded",system-ui,sans-serif;margin:0 0 8px}' +
      '\n.wave40-settings-note{font-size:12px;line-height:1.55;color:var(--muted,#6b7280)}' +
      '\n.wave40-theme-grid,.wave40-action-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}' +
      '\n.wave40-theme-btn,.wave40-action-btn{border:none;border-radius:12px;padding:10px 10px;background:var(--card,#fff);color:var(--text,#111827);font:700 12px/1.35 "Golos Text",system-ui,sans-serif;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(26,26,46,.08)}' +
      '\n.wave40-theme-btn.active{box-shadow:inset 0 0 0 2px var(--accent,#2563eb);background:rgba(37,99,235,.10);color:var(--accent,#2563eb)}' +
      '\n.wave40-action-btn.primary{background:var(--text,#1a1a2e);color:var(--bg,#fff);box-shadow:none}' +
      '\n.wave40-action-btn.warn{background:rgba(234,88,12,.12);color:#c2410c;box-shadow:none}' +
      '\n.wave40-settings-row{display:flex;justify-content:space-between;gap:12px;align-items:center;font-size:12px;margin-top:8px}' +
      '\n.wave40-settings-pills{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}' +
      '\n.wave40-pill{padding:6px 10px;border-radius:999px;background:rgba(37,99,235,.10);color:var(--accent,#2563eb);font-size:11px;font-weight:800}' +
      '\n#' + SETTINGS_BTN_ID + ':focus-visible{outline:2px solid rgba(37,99,235,.35);outline-offset:2px}' +'\nbody[data-trainer-screen="immersive"] #' + SETTINGS_BTN_ID + '{opacity:.14;transform:scale(.88)}' +'\nbody[data-trainer-screen="immersive"] #' + SETTINGS_BTN_ID + ':hover,body[data-trainer-screen="immersive"] #' + SETTINGS_BTN_ID + ':focus-visible{opacity:.92;transform:scale(1)}' +'\n@media (min-width:1024px){#' + SETTINGS_BTN_ID + '{min-width:28px;min-height:28px;padding:0 5px;background:rgba(255,255,255,.34);box-shadow:0 1px 4px rgba(0,0,0,.035);opacity:.64}#' + SETTINGS_BTN_ID + ':hover{opacity:1;transform:translateY(-1px)}}' +
      '\n@media (max-width:520px){#' + SETTINGS_BTN_ID + '{min-width:32px;min-height:32px;padding:0 7px;font-size:10px}.wave40-theme-grid,.wave40-action-grid{grid-template-columns:1fr}.wave40-settings-row{flex-direction:column;align-items:flex-start}}' +
      '\n@media print{#' + SETTINGS_BTN_ID + ',#' + SETTINGS_MODAL_ID + ',#' + LEGACY_INSTALL_ID + '{display:none!important}}';
    (document.head || document.documentElement).appendChild(style);
  }
  function ensureButton(){
    var btn = document.getElementById(SETTINGS_BTN_ID);
    if (btn && btn.remove) btn.remove();
    return null;
  }
  function refreshButton(){
    var btn = document.getElementById(SETTINGS_BTN_ID);
    if (btn && btn.remove) btn.remove();
  }
  function quickActions(){
    var actions = [];
    if (typeof window.showBackupModal === 'function') actions.push({ text:'💾 Резервная копия', fn:function(){ closeSettings(); setTimeout(function(){ window.showBackupModal(); }, 20); } });
    if (typeof window.showClassSelect === 'function') actions.push({ text:'🏫 Выбрать класс', fn:function(){ closeSettings(); setTimeout(function(){ window.showClassSelect(); }, 20); } });
    if (typeof window.generateReport === 'function') actions.push({ text:'📊 Отчёт', fn:function(){ closeSettings(); setTimeout(function(){ window.generateReport(); }, 20); } });
    if (typeof window.showAbout === 'function') actions.push({ text:'ℹ️ О проекте', fn:function(){ closeSettings(); setTimeout(function(){ window.showAbout(); }, 20); } });
    return actions;
  }
  function installState(){
    return {
      available: !!state.installPrompt && compactInstallUi(),
      dismissed: installDismissed(),
      standalone: standalone(),
      compact: compactInstallUi()
    };
  }
  function actionButton(text, cls, id){
    return '<button type="button" class="wave40-action-btn ' + (cls || '') + '"' + (id ? ' data-action="' + id + '"' : '') + '>' + text + '</button>';
  }
  function themeButton(pref, icon, label){
    var active = getThemePref() === pref ? ' active' : '';
    return '<button type="button" class="wave40-theme-btn' + active + '" data-theme-pref="' + pref + '"><div style="font-size:18px;margin-bottom:4px">' + icon + '</div><div>' + label + '</div></button>';
  }
  function renderBody(){
    var info = installState();
    var actions = quickActions();
    var html = '';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div><h3 id="wave40-settings-title" style="margin:0;font:800 16px/1.2 Unbounded,system-ui,sans-serif">⚙️ Настройки</h3><div class="wave40-settings-note" style="margin-top:6px">Тема теперь живёт здесь, а не отдельной плавающей кнопкой.</div></div><button type="button" class="wave40-action-btn" data-action="close" style="min-width:44px">✕</button></div>';
    html += '<div class="wave40-settings-section"><div class="wave40-settings-title">🎨 Оформление</div><div class="wave40-settings-note">Выберите, как тренажёр выглядит на этом устройстве.</div><div class="wave40-theme-grid">' +
      themeButton('system', '🖥️', 'Системная') + themeButton('light', '☀️', 'Светлая') + themeButton('dark', '🌙', 'Тёмная') +
      '</div></div>';
    html += '<div class="wave40-settings-section"><div class="wave40-settings-title">📲 Приложение</div>';
    if (info.standalone) {
      html += '<div class="wave40-settings-note">Приложение уже установлено на устройство. Можно запускать его как обычное приложение.</div>';
    } else if (!info.compact) {
      html += '<div class="wave40-settings-note">На компьютере блок установки скрыт: без плавающих prompt-ов и лишних кнопок. Если браузер всё же поддерживает PWA, используйте его системное меню.</div>';
    } else if (info.available) {
      html += '<div class="wave40-settings-note">Установка остаётся только здесь, в настройках: без автопоказа и без синей навязчивой кнопки.</div>';
      html += '<div class="wave40-action-grid">' + actionButton('⬇ Установить', 'primary', 'install') + actionButton(info.dismissed ? '🔔 Вернуть prompt' : '🙈 Скрыть на 7 дней', info.dismissed ? '' : 'warn', info.dismissed ? 'install-undismiss' : 'install-dismiss') + '</div>';
    } else {
      html += '<div class="wave40-settings-note">На мобильном устройстве установка появится только когда браузер действительно разрешит PWA-install. До этого интерфейс остаётся чистым и без автоподсказок.</div>';
    }
    html += '<div class="wave40-settings-pills"><span class="wave40-pill">' + (navigator.onLine === false ? 'Офлайн' : 'Онлайн') + '</span><span class="wave40-pill">PWA shell</span></div></div>';
    if (actions.length) {
      html += '<div class="wave40-settings-section"><div class="wave40-settings-title">🚀 Быстрые действия</div><div class="wave40-action-grid">';
      actions.forEach(function(item, idx){ html += '<button type="button" class="wave40-action-btn" data-quick-action="' + idx + '">' + item.text + '</button>'; });
      html += '</div></div>';
    }
    html += '<div class="wave40-settings-row"><div class="wave40-settings-note">Текущая тема: <b>' + themeMeta().label + '</b>.</div><div class="wave40-settings-note">Wave 48</div></div>';
    return html;
  }
  function refreshThemeButtons(){
    var modal = document.getElementById(SETTINGS_MODAL_ID);
    if (!modal) { refreshButton(); return; }
    Array.prototype.slice.call(modal.querySelectorAll('[data-theme-pref]')).forEach(function(btn){
      var pref = btn.getAttribute('data-theme-pref');
      if (pref === getThemePref()) btn.classList.add('active'); else btn.classList.remove('active');
    });
    var row = modal.querySelector('[data-settings-body]');
    if (row) row.innerHTML = renderBody();
    refreshButton();
  }
  function refreshModal(){
    var modal = document.getElementById(SETTINGS_MODAL_ID);
    if (!modal) { refreshButton(); return; }
    var body = modal.querySelector('[data-settings-body]');
    if (body) body.innerHTML = renderBody();
    refreshButton();
  }
  async function promptInstall(){
    if (state.installPrompt && typeof state.installPrompt.prompt === 'function') {
      try {
        await state.installPrompt.prompt();
        if (state.installPrompt.userChoice) await state.installPrompt.userChoice;
        state.installPrompt = null;
        syncLegacyInstallButton();
        refreshModal();
        return true;
      } catch(_) {}
    }
    var legacy = document.getElementById(LEGACY_INSTALL_ID);
    if (legacy && !legacy.hidden && typeof legacy.click === 'function') {
      legacy.click();
      return true;
    }
    return false;
  }
  function closeSettings(){
    var modal = document.getElementById(SETTINGS_MODAL_ID);
    if (modal) modal.remove();
  }
  function openSettings(){
    ensureStyles();
    ensureButton();
    hideLegacyThemeButton();
    wrapToast();
    closeSettings();
    var modal = document.createElement('div');
    modal.id = SETTINGS_MODAL_ID;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'wave40-settings-title');
    modal.innerHTML = '<div data-settings-card><div data-settings-body>' + renderBody() + '</div></div>';
    modal.addEventListener('click', function(ev){ if (ev.target === modal) closeSettings(); });
    modal.addEventListener('keydown', function(ev){ if (ev.key === 'Escape') closeSettings(); });
    modal.addEventListener('click', function(ev){
      var target = ev.target;
      if (!target || !target.closest) return;
      var themeBtn = target.closest('[data-theme-pref]');
      if (themeBtn) { setThemePref(themeBtn.getAttribute('data-theme-pref'), false); refreshModal(); return; }
      var actionBtn = target.closest('[data-action]');
      if (actionBtn) {
        var action = actionBtn.getAttribute('data-action');
        if (action === 'close') { closeSettings(); return; }
        if (action === 'install') { promptInstall(); return; }
        if (action === 'install-dismiss') { dismissInstall(7); return; }
        if (action === 'install-undismiss') { clearInstallDismiss(); return; }
      }
      var quick = target.closest('[data-quick-action]');
      if (quick) {
        var idx = +(quick.getAttribute('data-quick-action') || -1);
        var actions = quickActions();
        if (actions[idx] && typeof actions[idx].fn === 'function') actions[idx].fn();
      }
    });
    (document.body || document.documentElement).appendChild(modal);
    var focusTarget = modal.querySelector('[data-theme-pref], [data-action="close"]');
    if (focusTarget && focusTarget.focus) setTimeout(function(){ try { focusTarget.focus(); } catch(_) {} }, 20);
  }
  function bindInstallEvents(){
    window.addEventListener('beforeinstallprompt', function(event){
      try { event.preventDefault(); } catch(_) {}
      state.installPrompt = event;
      syncLegacyInstallButton();
      refreshModal();
    }, true);
    window.addEventListener('appinstalled', function(){
      state.installPrompt = null;
      clearInstallDismiss();
      syncLegacyInstallButton();
      refreshModal();
    });
  }
  function bindThemeWatch(){
    try {
      var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      if (mq && mq.addEventListener) {
        mq.addEventListener('change', function(){ if (getThemePref() === 'system') applyTheme('system', true); refreshButton(); });
      }
    } catch(_) {}
  }
  function scheduleShellSync(){
    if (state.syncQueued) return;
    state.syncQueued = true;
    var runner = function(){
      state.syncQueued = false;
      wrapToast();
      hideLegacyThemeButton();
      syncLegacyInstallButton();
      refreshButton();
    };
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(runner, { timeout:120 });
    else window.setTimeout(runner, 80);
  }
  function watchDom(){
    if (state.observer || typeof MutationObserver !== 'function' || !document.body) return;
    state.observer = new MutationObserver(function(mutations){
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        if (mutation.type !== 'childList') continue;
        if ((mutation.addedNodes && mutation.addedNodes.length) || (mutation.removedNodes && mutation.removedNodes.length)) {
          scheduleShellSync();
          break;
        }
      }
    });
    state.observer.observe(document.body, { childList:true, subtree:false, attributes:false });
  }
  function init(){
    ensureStyles();
    ensureButton();
    wrapToast();
    hideLegacyThemeButton();
    applyTheme(getThemePref(), true);
    syncLegacyInstallButton();
    bindThemeWatch();
    watchDom();
    refreshButton();
    setTimeout(scheduleShellSync, 0);
    setTimeout(scheduleShellSync, 250);
    setTimeout(scheduleShellSync, 1200);
  }

  ensureStyles();
  window.showSettings = openSettings;
  bindInstallEvents();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
