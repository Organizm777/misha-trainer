(function(){
  var LOG_KEY = 'trainer_runtime_errors_v73';
  var CFG_KEY = 'trainer_runtime_errors_cfg_v73';
  var MAX_DEFAULT = 50;
  var DASHBOARD_CARD_ID = 'wave73-runtime-health';
  var DASHBOARD_SECTION_ID = 'wave73-runtime-health-title';
  var tracker = window.TrainerErrorTracking || {};

  function safeParse(raw, fallback){ if(!raw) return fallback; try{return JSON.parse(raw);}catch(_){return fallback;} }
  function safeGet(key, fallback){ try{return safeParse(localStorage.getItem(key), fallback);}catch(_){return fallback;} }
  function safeSet(key, value){ try{localStorage.setItem(key, JSON.stringify(value));}catch(_){ } }
  function readConfig(){
    var cfg = safeGet(CFG_KEY, {});
    var runtimeCfg = window.__TRAINER_ERROR_TRACKING__ || {};
    var merged = {};
    Object.keys(cfg||{}).forEach(function(key){ merged[key] = cfg[key]; });
    Object.keys(runtimeCfg||{}).forEach(function(key){ merged[key] = runtimeCfg[key]; });
    if(!merged.maxEntries || merged.maxEntries < 1) merged.maxEntries = MAX_DEFAULT;
    if(merged.dashboardCard !== false) merged.dashboardCard = true;
    return merged;
  }
  function writeConfig(patch){ var current = readConfig(); Object.keys(patch||{}).forEach(function(key){ current[key] = patch[key]; }); safeSet(CFG_KEY, current); return current; }
  function getLogs(){ var rows = safeGet(LOG_KEY, []); return Array.isArray(rows) ? rows : []; }
  function setLogs(rows){ safeSet(LOG_KEY, rows); }
  function normalizeEvent(raw){
    return { ts:new Date().toISOString(), page:location.pathname || '/', href:location.href, kind:raw&&raw.kind?raw.kind:'error', message:raw&&raw.message?String(raw.message):'Unknown runtime error', source:raw&&raw.source?String(raw.source):'', line:raw&&raw.line?Number(raw.line)||0:0, column:raw&&raw.column?Number(raw.column)||0:0, stack:raw&&raw.stack?String(raw.stack).slice(0,4000):'', userAgent:navigator.userAgent || '' };
  }
  function pushLog(entry){ var cfg = readConfig(); var rows = getLogs(); rows.push(entry); while(rows.length > cfg.maxEntries){ rows.shift(); } setLogs(rows); return rows; }
  function summarize(rows){ var list = Array.isArray(rows) ? rows : getLogs(); var byKind = {}; var latest = list.length ? list[list.length-1] : null; list.forEach(function(row){ var kind = row && row.kind ? row.kind : 'error'; byKind[kind] = (byKind[kind] || 0) + 1; }); return { total:list.length, byKind:byKind, latest:latest }; }
  function downloadText(name, text, mime){ try{ var blob = new Blob([text], {type:mime || 'application/json;charset=utf-8'}); var href = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(href); }, 0); return true; }catch(_){ return false; } }
  function exportLogs(){ return JSON.stringify({ exportedAt:new Date().toISOString(), summary:summarize(), logs:getLogs() }, null, 2); }
  function flushRemote(entry){ var cfg = readConfig(); if(!cfg.endpoint) return false; var payload = JSON.stringify({ source:'trainer-runtime', entry:entry, summary:summarize() }); try{ if(navigator.sendBeacon){ return navigator.sendBeacon(cfg.endpoint, payload); } }catch(_){ } try{ fetch(cfg.endpoint, { method:'POST', headers:{'content-type':'application/json'}, body:payload, keepalive:true, mode:'cors' }).catch(function(){}); return true; }catch(_){ return false; } }
  function escapeHtml(value){ return String(value == null ? '' : value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function record(raw){ var entry = normalizeEvent(raw || {}); pushLog(entry); flushRemote(entry); renderDashboardCard(); return entry; }
  function clear(){ setLogs([]); renderDashboardCard(); }
  function ensureSection(container){ var section = document.getElementById(DASHBOARD_SECTION_ID); if(section) return section; section = document.createElement('div'); section.id = DASHBOARD_SECTION_ID; section.className = 'section'; section.textContent = 'Стабильность runtime'; container.appendChild(section); return section; }
  function renderDashboardCard(){
    var cfg = readConfig();
    if(!cfg.dashboardCard || !document || !document.body) return;
    var isDashboard = /dashboard\.html(?:$|[?#])/.test(location.pathname) || location.pathname === '/dashboard.html';
    if(!isDashboard) return;
    var wrap = document.querySelector('.w');
    if(!wrap) return;
    var anchor = document.querySelector('.dash-actions') || document.querySelector('.back') || wrap.lastElementChild;
    ensureSection(wrap);
    var card = document.getElementById(DASHBOARD_CARD_ID);
    if(!card){ card = document.createElement('div'); card.id = DASHBOARD_CARD_ID; card.className = 'analytics-note'; if(anchor && anchor.parentNode === wrap) wrap.insertBefore(card, anchor); else wrap.appendChild(card); }
    var summary = summarize(); var latest = summary.latest;
    card.innerHTML = ''
      + '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">'
      + '  <div><b style="display:block;font-size:13px">Локальный журнал ошибок</b><span style="font-size:11px;color:var(--muted)">Хранит последние runtime-события и позволяет выгрузить их в JSON.</span></div>'
      + '  <div style="font-family:JetBrains Mono,monospace;font-size:16px;font-weight:800">' + summary.total + '</div>'
      + '</div>'
      + (latest ? '<div style="margin-top:8px;font-size:11px;line-height:1.45;color:var(--muted)"><b style="color:var(--text)">Последняя ошибка:</b> ' + escapeHtml(latest.message) + '<br><span>' + escapeHtml((latest.kind || 'error') + ' · ' + (latest.ts || '')) + '</span></div>' : '<div style="margin-top:8px;font-size:11px;line-height:1.45;color:var(--muted)">Зафиксированных ошибок пока нет.</div>')
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">'
      + '  <button type="button" id="wave73-export-errors" class="dash-btn" style="flex:1 1 180px">📥 Выгрузить ошибки</button>'
      + '  <button type="button" id="wave73-clear-errors" class="dash-btn" style="flex:1 1 180px">🧹 Очистить журнал</button>'
      + '</div>';
    var exportBtn = document.getElementById('wave73-export-errors');
    var clearBtn = document.getElementById('wave73-clear-errors');
    if(exportBtn){ exportBtn.onclick = function(){ downloadText('trainer-runtime-errors.json', exportLogs(), 'application/json;charset=utf-8'); }; }
    if(clearBtn){ clearBtn.onclick = clear; }
  }
  window.addEventListener('error', function(event){ record({ kind:'error', message:event && event.message, source:event && event.filename, line:event && event.lineno, column:event && event.colno, stack:event && event.error && event.error.stack }); });
  window.addEventListener('unhandledrejection', function(event){ var reason = event && event.reason; record({ kind:'unhandledrejection', message: reason && reason.message ? reason.message : String(reason || 'Unhandled promise rejection'), stack: reason && reason.stack ? reason.stack : '' }); });
  tracker.record = record; tracker.getLogs = getLogs; tracker.getSummary = function(){ return summarize(); }; tracker.clear = clear; tracker.export = exportLogs; tracker.setConfig = writeConfig; tracker.renderDashboardCard = renderDashboardCard; tracker.download = function(){ return downloadText('trainer-runtime-errors.json', exportLogs(), 'application/json;charset=utf-8'); };
  window.TrainerErrorTracking = tracker;
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderDashboardCard, {once:true}); else renderDashboardCard();
})();
