/* wave86w: optional cross-device cloud sync via Supabase or Firebase REST.
 * Static/offline-first: no SDK, no credentials baked into the build.
 */
(function(){
  'use strict';

  var root = window;
  var VERSION = 'wave86w';
  var CONFIG_KEY = 'trainer_wave86w_sync_config';
  var META_KEY_PREFIX = 'trainer_wave86w_sync_meta_';
  var STYLE_ID = 'wave86w-cloud-sync-style';
  var AUTO_PUSH_DELAY = 1600;
  var autoTimer = null;
  var lastStatus = null;
  var lastRemoteEnvelope = null;

  function isGradePage(){ return /^\/?.*grade\d+_v2\.html(?:$|[?#])/.test(location.pathname) || !!root.GRADE_NUM; }
  function gradeKey(){ return String(root.GRADE_NUM || root.GRADE_NO || (location.pathname.match(/grade(\d+)_v2/) || [,''])[1] || ''); }
  function nowIso(){ return new Date().toISOString(); }
  function toNum(v){ var n = Number(v); return isFinite(n) ? n : 0; }
  function hasFn(fn){ return typeof fn === 'function'; }
  function getName(){ try { return hasFn(root.getPlayerName) ? root.getPlayerName() : (localStorage.getItem('trainer_player_name') || 'Ученик'); } catch(e){ return 'Ученик'; } }
  function getCode(){ try { return hasFn(root.getPlayerCode) ? root.getPlayerCode() : (localStorage.getItem('trainer_player_code') || ''); } catch(e){ return ''; } }
  function setCode(v){ try { if(hasFn(root.setPlayerCode)) root.setPlayerCode(v); else localStorage.setItem('trainer_player_code', v); } catch(e){} }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, function(ch){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]; }); }
  function normalizeUrl(v){ return String(v || '').trim().replace(/\/+$/, ''); }
  function safeJson(text, fallback){ try { return JSON.parse(text); } catch(e){ return fallback; } }
  function lsGet(key, fallback){ try { var v = localStorage.getItem(key); return v == null ? fallback : v; } catch(e){ return fallback; } }
  function lsSet(key, value){ try { localStorage.setItem(key, value); return true; } catch(e){ return false; } }
  function lsRemove(key){ try { localStorage.removeItem(key); } catch(e){} }
  function metaKey(){ return META_KEY_PREFIX + gradeKey(); }
  function readMeta(){ return safeJson(lsGet(metaKey(), '{}'), {}) || {}; }
  function writeMeta(meta){ lsSet(metaKey(), JSON.stringify(meta || {})); }
  function isPrivate(){ try { return hasFn(root.getPrivateMode) ? !!root.getPrivateMode() : lsGet('trainer_private', '1') !== '0'; } catch(e){ return true; } }

  function randomId(prefix){
    var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var out = prefix || '';
    if(root.crypto && crypto.getRandomValues){
      var buf = new Uint8Array(10);
      crypto.getRandomValues(buf);
      for(var i=0;i<buf.length;i++) out += alphabet[buf[i] % alphabet.length];
      return out;
    }
    for(var j=0;j<10;j++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
  }

  function defaultConfig(){
    var code = getCode();
    if(!code){ code = randomId(''); setCode(code); }
    return {
      enabled: false,
      provider: 'supabase',
      syncId: code,
      autoPush: false,
      autoPull: false,
      deviceId: lsGet('trainer_wave86w_device_id', '') || randomId('dev_'),
      deviceName: lsGet('trainer_wave86w_device_name', '') || defaultDeviceName(),
      supabaseUrl: '',
      supabaseAnonKey: '',
      supabaseTable: 'trainer_sync_snapshots',
      firebaseProjectId: '',
      firebaseApiKey: '',
      firebaseCollection: 'trainer_sync'
    };
  }

  function defaultDeviceName(){
    var ua = (navigator.userAgent || '').toLowerCase();
    if(/iphone|ipad|android/.test(ua)) return 'Телефон';
    if(/mac|win|linux/.test(ua)) return 'Компьютер';
    return 'Устройство';
  }

  function externalConfig(){
    var cfg = root.TRAINER_SYNC_CONFIG || root.trainerSyncConfig || null;
    if(!cfg || typeof cfg !== 'object') return {};
    return {
      enabled: cfg.enabled,
      provider: cfg.provider,
      syncId: cfg.syncId,
      autoPush: cfg.autoPush,
      autoPull: cfg.autoPull,
      deviceName: cfg.deviceName,
      supabaseUrl: cfg.supabaseUrl || cfg.url,
      supabaseAnonKey: cfg.supabaseAnonKey || cfg.anonKey,
      supabaseTable: cfg.supabaseTable || cfg.table,
      firebaseProjectId: cfg.firebaseProjectId || cfg.projectId,
      firebaseApiKey: cfg.firebaseApiKey || cfg.apiKey,
      firebaseCollection: cfg.firebaseCollection || cfg.collection
    };
  }

  function readConfig(){
    var base = defaultConfig();
    var saved = safeJson(lsGet(CONFIG_KEY, '{}'), {}) || {};
    var ext = externalConfig();
    var cfg = Object.assign(base, saved, ext);
    cfg.provider = cfg.provider === 'firebase' ? 'firebase' : 'supabase';
    cfg.syncId = String(cfg.syncId || base.syncId || '').trim() || randomId('');
    cfg.deviceId = String(cfg.deviceId || base.deviceId || randomId('dev_'));
    cfg.deviceName = String(cfg.deviceName || base.deviceName || defaultDeviceName()).trim() || defaultDeviceName();
    cfg.supabaseUrl = normalizeUrl(cfg.supabaseUrl);
    cfg.supabaseAnonKey = String(cfg.supabaseAnonKey || '').trim();
    cfg.supabaseTable = String(cfg.supabaseTable || 'trainer_sync_snapshots').trim() || 'trainer_sync_snapshots';
    cfg.firebaseProjectId = String(cfg.firebaseProjectId || '').trim();
    cfg.firebaseApiKey = String(cfg.firebaseApiKey || '').trim();
    cfg.firebaseCollection = String(cfg.firebaseCollection || 'trainer_sync').trim() || 'trainer_sync';
    lsSet('trainer_wave86w_device_id', cfg.deviceId);
    lsSet('trainer_wave86w_device_name', cfg.deviceName);
    return cfg;
  }

  function saveConfig(cfg){
    var clean = Object.assign(readConfig(), cfg || {});
    clean.provider = clean.provider === 'firebase' ? 'firebase' : 'supabase';
    clean.syncId = String(clean.syncId || '').trim();
    clean.deviceName = String(clean.deviceName || '').trim() || defaultDeviceName();
    clean.supabaseUrl = normalizeUrl(clean.supabaseUrl);
    clean.supabaseAnonKey = String(clean.supabaseAnonKey || '').trim();
    clean.supabaseTable = String(clean.supabaseTable || 'trainer_sync_snapshots').trim() || 'trainer_sync_snapshots';
    clean.firebaseProjectId = String(clean.firebaseProjectId || '').trim();
    clean.firebaseApiKey = String(clean.firebaseApiKey || '').trim();
    clean.firebaseCollection = String(clean.firebaseCollection || 'trainer_sync').trim() || 'trainer_sync';
    lsSet('trainer_wave86w_device_name', clean.deviceName);
    lsSet(CONFIG_KEY, JSON.stringify(clean));
    return clean;
  }

  function validateConfig(cfg){
    if(!cfg.syncId) throw new Error('Укажи sync-код. Его нужно ввести на втором устройстве.');
    if(cfg.provider === 'supabase'){
      if(!cfg.supabaseUrl || !/^https:\/\/.+\.supabase\.co$/i.test(cfg.supabaseUrl)) throw new Error('Для Supabase нужен URL вида https://xxxx.supabase.co');
      if(!cfg.supabaseAnonKey) throw new Error('Для Supabase нужен anon public key.');
      if(!cfg.supabaseTable) throw new Error('Укажи имя таблицы Supabase.');
      return true;
    }
    if(!cfg.firebaseProjectId) throw new Error('Для Firebase нужен projectId.');
    if(!cfg.firebaseApiKey) throw new Error('Для Firebase нужен Web API key.');
    if(!cfg.firebaseCollection) throw new Error('Укажи коллекцию Firestore.');
    return true;
  }

  function stableStringify(value){
    if(value === null || typeof value !== 'object') return JSON.stringify(value);
    if(Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    return '{' + Object.keys(value).sort().map(function(key){ return JSON.stringify(key) + ':' + stableStringify(value[key]); }).join(',') + '}';
  }

  function snapshotForChecksum(snapshot){
    var clone = JSON.parse(JSON.stringify(snapshot || {}));
    delete clone.exportedAt;
    delete clone.__wave86wCloud;
    return clone;
  }

  async function checksum(value){
    var text = stableStringify(snapshotForChecksum(value));
    if(root.crypto && crypto.subtle && root.TextEncoder){
      try {
        var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.prototype.map.call(new Uint8Array(buf), function(b){ return b.toString(16).padStart(2, '0'); }).join('');
      } catch(e){}
    }
    var h1 = 0x811c9dc5;
    for(var i=0;i<text.length;i++){ h1 ^= text.charCodeAt(i); h1 = Math.imul(h1, 0x01000193); }
    return ('00000000' + (h1 >>> 0).toString(16)).slice(-8);
  }

  function buildSnapshot(){
    if(!hasFn(root.getBackupSnapshot)) throw new Error('Backup API ещё не загружен. Открой страницу класса ещё раз.');
    var snap = root.getBackupSnapshot();
    if(!snap || snap.app !== 'trainer') throw new Error('Backup snapshot не создан.');
    return snap;
  }

  async function buildEnvelope(cfg){
    var snap = buildSnapshot();
    var sum = await checksum(snap);
    var now = nowIso();
    snap.__wave86wCloud = {
      version: VERSION,
      syncId: cfg.syncId,
      provider: cfg.provider,
      deviceId: cfg.deviceId,
      deviceName: cfg.deviceName,
      updatedAt: now,
      checksum: sum
    };
    return {
      app: 'trainer',
      format: 'cloud-sync-envelope',
      version: 1,
      wave: VERSION,
      syncId: cfg.syncId,
      grade: gradeKey(),
      playerName: getName(),
      playerCode: getCode(),
      provider: cfg.provider,
      deviceId: cfg.deviceId,
      deviceName: cfg.deviceName,
      updatedAt: now,
      updatedTs: Date.now(),
      checksum: sum,
      snapshot: snap
    };
  }

  function recordId(cfg){ return String(cfg.syncId || '').trim() + '-grade-' + gradeKey(); }

  function fetchJson(url, opts, timeoutMs){
    timeoutMs = timeoutMs || 12000;
    var ctrl = new AbortController();
    var timer = setTimeout(function(){ try { ctrl.abort(); } catch(e){} }, timeoutMs);
    opts = opts || {};
    opts.signal = ctrl.signal;
    return fetch(url, opts).then(async function(res){
      var text = await res.text().catch(function(){ return ''; });
      var body = text ? safeJson(text, text) : null;
      clearTimeout(timer);
      if(!res.ok){
        var msg = (body && (body.message || body.error || body.hint)) || text || ('HTTP ' + res.status);
        throw new Error(msg);
      }
      return body;
    }).catch(function(err){ clearTimeout(timer); throw err; });
  }

  function supabaseHeaders(cfg, prefer){
    var h = {
      'apikey': cfg.supabaseAnonKey,
      'Authorization': 'Bearer ' + cfg.supabaseAnonKey,
      'Content-Type': 'application/json'
    };
    if(prefer) h.Prefer = prefer;
    return h;
  }

  function supabaseBase(cfg){ return cfg.supabaseUrl + '/rest/v1/' + encodeURIComponent(cfg.supabaseTable); }

  async function supabasePush(cfg, envelope){
    var body = {
      id: recordId(cfg),
      sync_id: cfg.syncId,
      grade: gradeKey(),
      updated_at: envelope.updatedAt,
      checksum: envelope.checksum,
      payload: envelope
    };
    var url = supabaseBase(cfg);
    var data = await fetchJson(url, {
      method: 'POST',
      headers: supabaseHeaders(cfg, 'resolution=merge-duplicates,return=representation'),
      body: JSON.stringify(body)
    });
    return Array.isArray(data) && data[0] && data[0].payload ? data[0].payload : envelope;
  }

  async function supabasePull(cfg){
    var url = supabaseBase(cfg) + '?id=eq.' + encodeURIComponent(recordId(cfg)) + '&select=id,updated_at,checksum,payload&limit=1';
    var data = await fetchJson(url, { method: 'GET', headers: supabaseHeaders(cfg) });
    var row = Array.isArray(data) ? data[0] : null;
    return row && row.payload ? normalizeEnvelope(row.payload) : null;
  }

  function firebaseUrl(cfg){
    var doc = encodeURIComponent(recordId(cfg));
    var url = 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(cfg.firebaseProjectId) + '/databases/(default)/documents/' + encodeURIComponent(cfg.firebaseCollection) + '/' + doc;
    return cfg.firebaseApiKey ? url + '?key=' + encodeURIComponent(cfg.firebaseApiKey) : url;
  }

  function firebaseDoc(envelope){
    return { fields: {
      syncId: { stringValue: String(envelope.syncId || '') },
      grade: { stringValue: String(envelope.grade || '') },
      updatedAt: { timestampValue: envelope.updatedAt },
      updatedTs: { integerValue: String(envelope.updatedTs || Date.now()) },
      checksum: { stringValue: String(envelope.checksum || '') },
      payloadJson: { stringValue: JSON.stringify(envelope) }
    }};
  }

  function parseFirebaseDoc(doc){
    if(!doc || !doc.fields || !doc.fields.payloadJson) return null;
    var text = doc.fields.payloadJson.stringValue || '';
    return normalizeEnvelope(safeJson(text, null));
  }

  async function firebasePush(cfg, envelope){
    var doc = await fetchJson(firebaseUrl(cfg), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firebaseDoc(envelope))
    });
    return parseFirebaseDoc(doc) || envelope;
  }

  async function firebasePull(cfg){
    try { return parseFirebaseDoc(await fetchJson(firebaseUrl(cfg), { method: 'GET' })); }
    catch(e){ if(String(e && e.message || '').indexOf('NOT_FOUND') >= 0 || String(e && e.message || '').indexOf('404') >= 0) return null; throw e; }
  }

  function normalizeEnvelope(env){
    if(!env || typeof env !== 'object') return null;
    if(env.format === 'cloud-sync-envelope' && env.snapshot && env.snapshot.app === 'trainer') return env;
    if(env.app === 'trainer' && env.format === 'grade-backup'){
      return {
        app: 'trainer', format: 'cloud-sync-envelope', version: 1, wave: VERSION,
        syncId: '', grade: String(env.grade || gradeKey()), playerName: env.player && env.player.name || 'Ученик',
        playerCode: env.player && env.player.code || '', provider: 'unknown', deviceId: '', deviceName: 'Импорт',
        updatedAt: env.exportedAt || nowIso(), updatedTs: Date.parse(env.exportedAt || '') || Date.now(), checksum: '', snapshot: env
      };
    }
    return null;
  }

  async function adapterPush(cfg, env){
    return cfg.provider === 'firebase' ? firebasePush(cfg, env) : supabasePush(cfg, env);
  }
  async function adapterPull(cfg){
    return cfg.provider === 'firebase' ? firebasePull(cfg) : supabasePull(cfg);
  }

  function summarizeSnapshot(snapshot){
    var str = snapshot && snapshot.streak || {};
    var daily = snapshot && snapshot.daily || {};
    var progress = snapshot && snapshot.progress || {};
    var topics = 0;
    try { Object.keys(progress).forEach(function(sid){ topics += Object.keys(progress[sid] || {}).length; }); } catch(e){}
    return {
      totalQs: toNum(str.totalQs),
      totalOk: toNum(str.totalOk),
      current: toNum(str.current),
      best: toNum(str.best),
      today: toNum(daily.ok) + toNum(daily.err),
      topics: topics,
      exportedAt: snapshot && snapshot.exportedAt || ''
    };
  }

  function statusText(env){
    if(!env) return 'В облаке пока нет копии для этого класса.';
    var s = summarizeSnapshot(env.snapshot || {});
    var pct = s.totalQs ? Math.round(s.totalOk / s.totalQs * 100) : 0;
    return 'Облако: ' + (env.playerName || 'Ученик') + ' · ' + s.totalQs + ' вопросов · ' + pct + '% · ' + (env.updatedAt || 'без даты');
  }

  async function pushNow(reason){
    var cfg = readConfig();
    validateConfig(cfg);
    if(isPrivate()) throw new Error('Включён приватный режим. Отключи его в профиле, чтобы отправлять данные в облако.');
    var env = await buildEnvelope(cfg);
    var saved = normalizeEnvelope(await adapterPush(cfg, env)) || env;
    var meta = readMeta();
    meta.lastPushAt = nowIso();
    meta.lastChecksum = env.checksum;
    meta.lastProvider = cfg.provider;
    meta.lastReason = reason || 'manual';
    meta.lastRemoteAt = saved.updatedAt || env.updatedAt;
    writeMeta(meta);
    lastStatus = '✅ Сохранено в облако: ' + env.updatedAt;
    lastRemoteEnvelope = saved;
    return saved;
  }

  async function pullRemote(){
    var cfg = readConfig();
    validateConfig(cfg);
    var env = normalizeEnvelope(await adapterPull(cfg));
    lastRemoteEnvelope = env;
    return env;
  }

  async function applyRemote(env){
    env = normalizeEnvelope(env || lastRemoteEnvelope);
    if(!env || !env.snapshot) throw new Error('В облаке нет копии для восстановления.');
    if(String(env.snapshot.grade || env.grade || '') !== gradeKey()) throw new Error('Копия относится к другому классу.');
    if(!hasFn(root.applyBackupSnapshot)) throw new Error('Restore API ещё не загружен.');
    var ok = root.applyBackupSnapshot(env.snapshot);
    var meta = readMeta();
    meta.lastPullAt = nowIso();
    meta.lastRemoteAt = env.updatedAt || '';
    meta.lastChecksum = env.checksum || '';
    writeMeta(meta);
    lastStatus = '✅ Восстановлено из облака: ' + (env.updatedAt || 'без даты');
    return ok;
  }

  function canAutoPush(){
    var cfg = readConfig();
    return !!(cfg.enabled && cfg.autoPush && (cfg.supabaseUrl || cfg.firebaseProjectId));
  }

  function scheduleAutoPush(reason){
    if(!canAutoPush() || isPrivate()) return;
    clearTimeout(autoTimer);
    autoTimer = setTimeout(function(){ pushNow(reason || 'auto').catch(function(err){ lastStatus = '⚠️ Автосинхронизация: ' + (err && err.message || err); }); }, AUTO_PUSH_DELAY);
  }

  function installHooks(){
    if(root.__wave86wCloudHooksInstalled) return;
    root.__wave86wCloudHooksInstalled = true;
    var oldEnd = root.endSession;
    if(hasFn(oldEnd)){
      root.endSession = function(){
        var result = oldEnd.apply(this, arguments);
        scheduleAutoPush('endSession');
        return result;
      };
    }
    var oldApply = root.applyBackupSnapshot;
    if(hasFn(oldApply)){
      root.applyBackupSnapshot = function(){
        var result = oldApply.apply(this, arguments);
        setTimeout(function(){ try { injectButtons(); } catch(e){} }, 120);
        return result;
      };
    }
    var oldCloudSave = root.cloudSave;
    if(hasFn(oldCloudSave)){
      root.cloudSave = function(){
        var ret;
        try { ret = oldCloudSave.apply(this, arguments); } finally { scheduleAutoPush('cloudSave'); }
        return ret;
      };
    }
    document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'hidden') scheduleAutoPush('visibility'); });
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave86w-cloud-btn{border-color:#0ea5e9!important;color:#0369a1!important}',
      '.wave86w-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10020;display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto}',
      '.wave86w-card{background:var(--card,#fff);color:var(--text,var(--ink,#1a1a2e));border:1px solid var(--border,#e5e7eb);border-radius:18px;padding:20px;max-width:560px;width:100%;box-shadow:0 18px 42px rgba(0,0,0,.25);max-height:92vh;overflow:auto}',
      '.wave86w-title{font-family:Unbounded,system-ui,sans-serif;font-size:17px;font-weight:900;margin:0 0 6px;text-align:center}',
      '.wave86w-sub{font-size:12px;color:var(--muted,#6b7280);line-height:1.5;text-align:center;margin:0 0 14px}',
      '.wave86w-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
      '.wave86w-field{display:flex;flex-direction:column;gap:4px;margin-bottom:8px}',
      '.wave86w-field label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--muted,#6b7280)}',
      '.wave86w-field input,.wave86w-field select{width:100%;padding:10px;border:1px solid var(--border,#e5e7eb);border-radius:10px;background:var(--bg,#fff);color:var(--text,var(--ink,#111827));font:12px Golos Text,system-ui,sans-serif}',
      '.wave86w-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}',
      '.wave86w-btn{flex:1;min-width:135px;border:1px solid var(--border,#e5e7eb);border-radius:10px;background:var(--bg,#f8fafc);color:var(--text,#111827);font-weight:800;font-size:12px;padding:10px;cursor:pointer;font-family:Golos Text,system-ui,sans-serif}',
      '.wave86w-btn.primary{background:#0ea5e9;color:#fff;border-color:#0ea5e9}',
      '.wave86w-btn.danger{background:#fee2e2;color:#b91c1c;border-color:#fecaca}',
      '.wave86w-note{font-size:11px;color:var(--muted,#6b7280);line-height:1.5;margin-top:10px}',
      '.wave86w-status{background:var(--abg,#f3f4f6);border-radius:12px;padding:12px;font-size:12px;line-height:1.5;margin-top:10px;white-space:pre-wrap}',
      '.wave86w-provider{border:1px solid var(--border,#e5e7eb);border-radius:12px;padding:10px;margin-top:8px}',
      '.wave86w-hide{display:none!important}',
      '@media(max-width:560px){.wave86w-grid{grid-template-columns:1fr}.wave86w-btn{min-width:100%}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function field(id, label, value, type, placeholder){
    return '<div class="wave86w-field"><label for="' + id + '">' + esc(label) + '</label><input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(value || '') + '" placeholder="' + esc(placeholder || '') + '"></div>';
  }

  function providerPanel(cfg){
    return '<div class="wave86w-provider" id="wave86w-supabase-panel">' +
      '<div class="wave86w-grid">' +
      field('wave86w-supabase-url', 'Supabase URL', cfg.supabaseUrl, 'url', 'https://xxxx.supabase.co') +
      field('wave86w-supabase-key', 'Supabase anon key', cfg.supabaseAnonKey, 'password', 'eyJ...') +
      '</div>' + field('wave86w-supabase-table', 'Таблица', cfg.supabaseTable, 'text', 'trainer_sync_snapshots') +
      '<div class="wave86w-note">Таблица должна иметь поля: <b>id</b> text primary key, <b>sync_id</b> text, <b>grade</b> text, <b>updated_at</b> timestamptz, <b>checksum</b> text, <b>payload</b> jsonb.</div>' +
      '</div>' +
      '<div class="wave86w-provider" id="wave86w-firebase-panel">' +
      '<div class="wave86w-grid">' +
      field('wave86w-firebase-project', 'Firebase projectId', cfg.firebaseProjectId, 'text', 'my-project') +
      field('wave86w-firebase-key', 'Firebase Web API key', cfg.firebaseApiKey, 'password', 'AIza...') +
      '</div>' + field('wave86w-firebase-collection', 'Firestore collection', cfg.firebaseCollection, 'text', 'trainer_sync') +
      '<div class="wave86w-note">Используется Firestore REST. Документ: <code>syncId-grade-N</code>, payload хранится строкой JSON в поле <code>payloadJson</code>.</div>' +
      '</div>';
  }

  function readForm(){
    var cfg = readConfig();
    function val(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; }
    function checked(id){ var el = document.getElementById(id); return !!(el && el.checked); }
    cfg.enabled = checked('wave86w-enabled');
    cfg.provider = val('wave86w-provider') === 'firebase' ? 'firebase' : 'supabase';
    cfg.syncId = val('wave86w-sync-id') || cfg.syncId;
    cfg.deviceName = val('wave86w-device-name') || cfg.deviceName;
    cfg.autoPush = checked('wave86w-auto-push');
    cfg.autoPull = checked('wave86w-auto-pull');
    cfg.supabaseUrl = val('wave86w-supabase-url');
    cfg.supabaseAnonKey = val('wave86w-supabase-key');
    cfg.supabaseTable = val('wave86w-supabase-table') || 'trainer_sync_snapshots';
    cfg.firebaseProjectId = val('wave86w-firebase-project');
    cfg.firebaseApiKey = val('wave86w-firebase-key');
    cfg.firebaseCollection = val('wave86w-firebase-collection') || 'trainer_sync';
    return saveConfig(cfg);
  }

  function refreshProviderPanels(){
    var provider = (document.getElementById('wave86w-provider') || {}).value || 'supabase';
    var supa = document.getElementById('wave86w-supabase-panel');
    var fire = document.getElementById('wave86w-firebase-panel');
    if(supa) supa.classList.toggle('wave86w-hide', provider !== 'supabase');
    if(fire) fire.classList.toggle('wave86w-hide', provider !== 'firebase');
  }

  function setStatus(text, kind){
    var box = document.getElementById('wave86w-status');
    if(!box) return;
    box.textContent = text || '';
    box.style.color = kind === 'error' ? '#b91c1c' : kind === 'ok' ? '#166534' : '';
  }

  function localStatusLine(){
    var snap = null;
    try { snap = buildSnapshot(); } catch(e){}
    if(!snap) return 'Локально: backup API ещё не готов.';
    var s = summarizeSnapshot(snap);
    var pct = s.totalQs ? Math.round(toNum(s.totalOk) / s.totalQs * 100) : 0;
    return 'Локально: ' + getName() + ' · ' + s.totalQs + ' вопросов · ' + pct + '% · ' + gradeKey() + ' класс';
  }

  function renderCloudModal(){
    ensureStyle();
    var cfg = readConfig();
    var meta = readMeta();
    var overlay = document.createElement('div');
    overlay.className = 'wave86w-overlay';
    overlay.addEventListener('click', function(ev){ if(ev.target === overlay) overlay.remove(); });
    var card = document.createElement('div');
    card.className = 'wave86w-card';
    card.addEventListener('click', function(ev){ ev.stopPropagation(); });
    card.innerHTML =
      '<h3 class="wave86w-title">☁️ Синхронизация между устройствами</h3>' +
      '<p class="wave86w-sub">F2: ручная и опциональная авто-синхронизация текущего класса через Supabase или Firebase. Данные остаются в твоём проекте, без SDK и без внешнего backend в сборке.</p>' +
      '<div class="wave86w-grid">' +
      '<div class="wave86w-field"><label for="wave86w-provider">Провайдер</label><select id="wave86w-provider"><option value="supabase">Supabase REST</option><option value="firebase">Firebase Firestore REST</option></select></div>' +
      field('wave86w-sync-id', 'Sync-код', cfg.syncId, 'text', 'один и тот же на устройствах') +
      field('wave86w-device-name', 'Имя устройства', cfg.deviceName, 'text', 'Телефон / ноутбук') +
      '<div class="wave86w-field"><label>Режим</label><label style="font-size:12px;text-transform:none;letter-spacing:0;font-weight:700;color:inherit"><input id="wave86w-enabled" type="checkbox" ' + (cfg.enabled ? 'checked' : '') + '> включить sync</label><label style="font-size:12px;text-transform:none;letter-spacing:0;font-weight:700;color:inherit"><input id="wave86w-auto-push" type="checkbox" ' + (cfg.autoPush ? 'checked' : '') + '> автосохранение после тренировки</label><label style="font-size:12px;text-transform:none;letter-spacing:0;font-weight:700;color:inherit"><input id="wave86w-auto-pull" type="checkbox" ' + (cfg.autoPull ? 'checked' : '') + '> проверять облако при входе</label></div>' +
      '</div>' + providerPanel(cfg) +
      '<div class="wave86w-actions">' +
      '<button class="wave86w-btn" id="wave86w-save">💾 Сохранить настройки</button>' +
      '<button class="wave86w-btn" id="wave86w-copy">📋 Копировать sync-код</button>' +
      '<button class="wave86w-btn primary" id="wave86w-push">⬆️ Отправить в облако</button>' +
      '<button class="wave86w-btn" id="wave86w-check">🔎 Проверить облако</button>' +
      '<button class="wave86w-btn" id="wave86w-pull">⬇️ Восстановить из облака</button>' +
      '<button class="wave86w-btn danger" id="wave86w-clear">🧹 Сбросить настройки</button>' +
      '<button class="wave86w-btn" id="wave86w-close">Закрыть</button>' +
      '</div>' +
      '<div class="wave86w-status" id="wave86w-status"></div>' +
      '<div class="wave86w-note">Для второго устройства: открой тот же класс, введи тот же sync-код и те же параметры Supabase/Firebase, затем нажми «Восстановить из облака». Приватный режим блокирует отправку, но не блокирует ручное восстановление.</div>';
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    var provider = document.getElementById('wave86w-provider');
    if(provider) provider.value = cfg.provider;
    refreshProviderPanels();
    if(provider) provider.addEventListener('change', refreshProviderPanels);
    setStatus(localStatusLine() + '\n' + (lastStatus || '') + (meta.lastPushAt ? '\nПоследний push: ' + meta.lastPushAt : '') + (meta.lastPullAt ? '\nПоследний pull: ' + meta.lastPullAt : ''));

    document.getElementById('wave86w-save').addEventListener('click', function(){
      try { var saved = readForm(); validateConfig(saved); setStatus('✅ Настройки сохранены.\n' + localStatusLine(), 'ok'); }
      catch(e){ setStatus('⚠️ ' + (e && e.message || e), 'error'); }
    });
    document.getElementById('wave86w-copy').addEventListener('click', async function(){
      var code = (document.getElementById('wave86w-sync-id') || {}).value || readConfig().syncId;
      try { await navigator.clipboard.writeText(code); setStatus('✅ Sync-код скопирован: ' + code, 'ok'); }
      catch(e){ setStatus('Sync-код: ' + code); }
    });
    document.getElementById('wave86w-push').addEventListener('click', async function(){
      try { var cfgNow = readForm(); validateConfig(cfgNow); setStatus('Отправляю snapshot в облако…'); var env = await pushNow('manual'); setStatus('✅ Snapshot отправлен.\n' + statusText(env) + '\n' + localStatusLine(), 'ok'); }
      catch(e){ setStatus('⚠️ ' + (e && e.message || e), 'error'); }
    });
    document.getElementById('wave86w-check').addEventListener('click', async function(){
      try { var cfgNow = readForm(); validateConfig(cfgNow); setStatus('Проверяю облако…'); var env = await pullRemote(); setStatus(statusText(env) + '\n' + localStatusLine(), env ? 'ok' : ''); }
      catch(e){ setStatus('⚠️ ' + (e && e.message || e), 'error'); }
    });
    document.getElementById('wave86w-pull').addEventListener('click', async function(){
      try {
        var cfgNow = readForm(); validateConfig(cfgNow); setStatus('Загружаю snapshot из облака…');
        var env = lastRemoteEnvelope || await pullRemote();
        if(!env){ setStatus('В облаке пока нет snapshot для этого sync-кода и класса.'); return; }
        var msg = statusText(env) + '\n\nЛокальные данные текущего класса будут заменены облачной копией. Продолжить?';
        if(!confirm(msg)){ setStatus('Восстановление отменено.\n' + statusText(env)); return; }
        await applyRemote(env);
        setStatus('✅ Восстановлено. Обновляю экран…\n' + statusText(env), 'ok');
        setTimeout(function(){ try { if(hasFn(root.refreshMain)) root.refreshMain(); if(hasFn(root.renderProg)) root.renderProg(); } catch(e){} }, 120);
      } catch(e){ setStatus('⚠️ ' + (e && e.message || e), 'error'); }
    });
    document.getElementById('wave86w-clear').addEventListener('click', function(){
      if(!confirm('Удалить локальные настройки синхронизации? Прогресс не будет удалён.')) return;
      lsRemove(CONFIG_KEY); lsRemove(metaKey()); lastRemoteEnvelope = null; lastStatus = null;
      overlay.remove(); renderCloudModal();
    });
    document.getElementById('wave86w-close').addEventListener('click', function(){ overlay.remove(); });
    return overlay;
  }

  function injectButtons(){
    if(!isGradePage() || !document.body) return;
    ensureStyle();
    if(!document.getElementById('wave86w-main-cloud-btn')){
      var backupBtn = Array.prototype.find.call(document.querySelectorAll('button'), function(btn){ return /showBackupModal/.test(btn.getAttribute('data-wave86u-on-click') || '') || /Резервная копия/.test(btn.textContent || ''); });
      var row = backupBtn && backupBtn.parentElement;
      if(row){
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'wave86w-main-cloud-btn';
        btn.className = 'btn btn-o wave86w-cloud-btn';
        btn.style.flex = '1';
        btn.textContent = '☁️ Синхронизация';
        btn.addEventListener('click', renderCloudModal);
        if(row.children.length >= 2){
          var newRow = document.createElement('div');
          newRow.style.cssText = 'display:flex;gap:8px;margin-bottom:8px';
          newRow.appendChild(btn);
          row.parentNode.insertBefore(newRow, row.nextSibling);
        } else {
          row.appendChild(btn);
        }
      }
    }
    if(!document.getElementById('wave86w-profile-cloud-btn')){
      var player = document.getElementById('player-badge');
      if(player){
        var small = document.createElement('button');
        small.type = 'button';
        small.id = 'wave86w-profile-cloud-btn';
        small.className = 'wave86w-cloud-btn';
        small.style.cssText = 'margin-top:6px;border:1px solid #0ea5e9;border-radius:999px;background:transparent;padding:5px 10px;font-size:10px;font-weight:800;cursor:pointer;font-family:Golos Text,sans-serif';
        small.textContent = '☁ sync';
        small.addEventListener('click', renderCloudModal);
        player.appendChild(document.createElement('br'));
        player.appendChild(small);
      }
    }
  }

  function enhanceBackupOverlay(){
    var old = root.showBackupModal;
    if(!hasFn(old) || root.__wave86wBackupModalPatched) return;
    root.__wave86wBackupModalPatched = true;
    root.showBackupModal = function(){
      var result = old.apply(this, arguments);
      setTimeout(function(){
        try {
          var body = document.querySelector('.wave29-body');
          if(!body || document.getElementById('wave86w-backup-cloud-section')) return;
          ensureStyle();
          var section = document.createElement('div');
          section.className = 'wave29-section';
          section.id = 'wave86w-backup-cloud-section';
          section.innerHTML = '<h4>Облако</h4><div class="wave29-note" style="margin-top:4px">Синхронизация текущего класса через Supabase/Firebase поверх этого backup snapshot.</div>';
          var actions = document.createElement('div');
          actions.className = 'wave29-actions wave29-no-print';
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'wave29-btn accent';
          btn.textContent = '☁️ Открыть синхронизацию';
          btn.addEventListener('click', renderCloudModal);
          actions.appendChild(btn);
          section.appendChild(actions);
          body.appendChild(section);
        } catch(e){}
      }, 80);
      return result;
    };
  }

  async function autoPullOnBoot(){
    var cfg = readConfig();
    if(!cfg.enabled || !cfg.autoPull) return;
    try {
      validateConfig(cfg);
      var env = await pullRemote();
      if(!env) return;
      var meta = readMeta();
      if(meta.lastRemoteAt === env.updatedAt || meta.lastChecksum === env.checksum) return;
      lastRemoteEnvelope = env;
      showIncomingRemoteBanner(env);
    } catch(e){ lastStatus = '⚠️ Auto-pull: ' + (e && e.message || e); }
  }

  function showIncomingRemoteBanner(env){
    if(document.getElementById('wave86w-remote-banner')) return;
    ensureStyle();
    var box = document.createElement('div');
    box.id = 'wave86w-remote-banner';
    box.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0));z-index:10010;max-width:560px;margin:auto;background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:14px;padding:12px;box-shadow:0 10px 28px rgba(0,0,0,.2);font-size:12px;line-height:1.45;color:var(--text,#111827)';
    var text = document.createElement('div');
    text.textContent = statusText(env);
    var actions = document.createElement('div');
    actions.className = 'wave86w-actions';
    var open = document.createElement('button'); open.className = 'wave86w-btn primary'; open.textContent = 'Открыть sync'; open.addEventListener('click', function(){ box.remove(); renderCloudModal(); });
    var close = document.createElement('button'); close.className = 'wave86w-btn'; close.textContent = 'Позже'; close.addEventListener('click', function(){ box.remove(); });
    actions.appendChild(open); actions.appendChild(close); box.appendChild(text); box.appendChild(actions); document.body.appendChild(box);
  }

  function init(){
    if(!isGradePage()) return;
    installHooks();
    enhanceBackupOverlay();
    injectButtons();
    setTimeout(injectButtons, 250);
    setTimeout(injectButtons, 900);
    setTimeout(autoPullOnBoot, 1200);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();

  root.wave86wCloudSync = {
    version: VERSION,
    readConfig: readConfig,
    saveConfig: saveConfig,
    buildSnapshot: buildSnapshot,
    buildEnvelope: buildEnvelope,
    pushNow: pushNow,
    pullRemote: pullRemote,
    applyRemote: applyRemote,
    open: renderCloudModal,
    auditSnapshot: async function(){
      var cfg = readConfig();
      var snap = null;
      var sum = '';
      try { snap = buildSnapshot(); sum = await checksum(snap); } catch(e){}
      return {
        version: VERSION,
        grade: gradeKey(),
        provider: cfg.provider,
        enabled: !!cfg.enabled,
        hasSupabaseUrl: !!cfg.supabaseUrl,
        hasSupabaseKey: !!cfg.supabaseAnonKey,
        hasFirebaseProject: !!cfg.firebaseProjectId,
        hasFirebaseKey: !!cfg.firebaseApiKey,
        syncId: cfg.syncId ? 'set' : '',
        snapshotReady: !!snap,
        checksum: sum,
        hasPush: typeof pushNow === 'function',
        hasPull: typeof pullRemote === 'function',
        buttonPresent: !!document.getElementById('wave86w-main-cloud-btn'),
        backupPatched: !!root.__wave86wBackupModalPatched,
        cspInlineSafe: true
      };
    }
  };
})();
