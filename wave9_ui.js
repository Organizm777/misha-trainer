(function(){
  const THEME_KEY = 'trainer_theme';
  const TOAST_HOST_ID = 'trainer-toast-host';
  const OFFLINE_ID = 'trainer-offline-pill';
  const THEME_BTN_ID = 'trainer-theme-btn';
  const STYLE_ID = 'wave9-ui-style';
  const THEME_META_COLOR = { light: '#1a1a2e', dark: '#0e0e1a' };

  function getStorage(){
    try { return window.localStorage; } catch (_) { return null; }
  }

  function getThemePref(){
    try {
      const v = (getStorage() && getStorage().getItem(THEME_KEY)) || 'system';
      return ['light','dark','system'].includes(v) ? v : 'system';
    } catch (_) {
      return 'system';
    }
  }

  function effectiveTheme(pref){
    if(pref === 'light' || pref === 'dark') return pref;
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (_) {
      return 'light';
    }
  }

  function ensureStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
html[data-theme="dark"]{color-scheme:dark;--bg:#141420;--card:#1e1e2e;--text:#e8e6e0;--ink:#e8e6e0;--muted:#9a9aae;--border:#2e2e3e;--abg:#1e2a4a;--gbg:#0e2e1a;--rbg:#2e1010;--obg:#2e2010;--pbg:#201e30;--ybg:#2e2a10;--tbg:#0e2e2a}
html[data-theme="light"]{color-scheme:light}
html[data-theme="dark"],html[data-theme="dark"] body{background:#141420!important;color:#e8e6e0!important}
html[data-theme="light"],html[data-theme="light"] body{background:#f5f3ee!important;color:#1a1a2e!important}
html[data-theme="dark"] header,html[data-theme="dark"] .header,html[data-theme="dark"] footer{background:#0e0e1a!important;color:#e8e6e0!important}
html[data-theme="dark"] .card,html[data-theme="dark"] .stat,html[data-theme="dark"] .scard,html[data-theme="dark"] .tcard,html[data-theme="dark"] .qcard,html[data-theme="dark"] .rcard,html[data-theme="dark"] .icard,html[data-theme="dark"] .opt,html[data-theme="dark"] .tbtn,html[data-theme="dark"] .fb,html[data-theme="dark"] .dm,html[data-theme="dark"] .searchfield{background:var(--card)!important;color:var(--text)!important;border-color:var(--border)!important}
html[data-theme="dark"] .sub,html[data-theme="dark"] .cs,html[data-theme="dark"] .ct,html[data-theme="dark"] .cl,html[data-theme="dark"] .dt,html[data-theme="dark"] .stat-l,html[data-theme="dark"] .foot-text,html[data-theme="dark"] .searchmeta{color:var(--muted)!important}
html[data-theme="dark"] .live-pill,html[data-theme="dark"] .tg{background:#e8e6e0!important;color:#141420!important}
html[data-theme="dark"] .opt .k{background:#2a2a3a!important;color:#c7c7d5!important}
html[data-theme="dark"] .ptrack,html[data-theme="dark"] .pgbar,html[data-theme="dark"] .dm-bar{background:#2a2a3a!important}
html[data-theme="dark"] .qcode,html[data-theme="dark"] .tcard .fm{background:#1a1a2a!important;border-color:#2e2e3e!important;color:#d8d6cf!important}
html[data-theme="dark"] .tcard li,html[data-theme="dark"] .tcard p,html[data-theme="dark"] [style*="color:#374151"]{color:#cbd5e1!important}
html[data-theme="dark"] [style*="color:#1a1a2e"]{color:var(--text)!important}
html[data-theme="dark"] [style*="color:#6b6b7e"],html[data-theme="dark"] [style*="color:#6b6a74"]{color:var(--muted)!important}
html[data-theme="dark"] [style*="background:#fff"],html[data-theme="dark"] [style*="background: #fff"]{background:var(--card)!important}
html[data-theme="dark"] [style*="background:#f5f3ee"],html[data-theme="dark"] [style*="background: #f5f3ee"]{background:var(--bg)!important}
html[data-theme="dark"] [style*="border:#ddd"],html[data-theme="dark"] [style*="border:1px solid #ddd"],html[data-theme="dark"] [style*="border-color:#ddd"]{border-color:var(--border)!important}
html[data-theme="dark"] input,html[data-theme="dark"] textarea,html[data-theme="dark"] select{background:#1a1a2a!important;color:#e8e6e0!important;border-color:#3a3a4e!important}
#${THEME_BTN_ID}{position:fixed;top:calc(12px + env(safe-area-inset-top,0));right:12px;z-index:12000;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:44px;min-height:44px;padding:0 12px;border:none;border-radius:999px;background:rgba(255,255,255,.92);color:#1a1a2e;box-shadow:0 10px 24px rgba(0,0,0,.18);font:700 12px/1 'Golos Text',system-ui,sans-serif;cursor:pointer;backdrop-filter:blur(10px)}
html[data-theme="dark"] #${THEME_BTN_ID}{background:rgba(30,30,46,.94);color:#e8e6e0;border:1px solid rgba(255,255,255,.08)}
#${OFFLINE_ID}{position:fixed;top:calc(62px + env(safe-area-inset-top,0));left:50%;transform:translateX(-50%);z-index:11950;padding:8px 12px;border-radius:999px;background:#1a1a2e;color:#fff;font:700 12px/1 'Golos Text',system-ui,sans-serif;box-shadow:0 10px 24px rgba(0,0,0,.18);display:none}
#${OFFLINE_ID}.show{display:inline-flex;align-items:center;gap:7px}
#${OFFLINE_ID} .dot{width:8px;height:8px;border-radius:50%;background:#f59e0b;display:inline-block}
#${TOAST_HOST_ID}{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0));transform:translateX(-50%);z-index:13000;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;max-width:min(92vw,420px)}
.${TOAST_HOST_ID}-item{pointer-events:auto;display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:14px;background:rgba(26,26,46,.96);color:#fff;box-shadow:0 14px 28px rgba(0,0,0,.22);font:700 13px/1.35 'Golos Text',system-ui,sans-serif;animation:toastIn .18s ease both;max-width:100%}
.${TOAST_HOST_ID}-item.info{background:rgba(37,99,235,.95)}
.${TOAST_HOST_ID}-item.success{background:rgba(22,163,74,.96)}
.${TOAST_HOST_ID}-item.warn{background:rgba(234,88,12,.96)}
.${TOAST_HOST_ID}-item.error{background:rgba(220,38,38,.96)}
.${TOAST_HOST_ID}-item.fadeout{animation:toastOut .18s ease both}
.${TOAST_HOST_ID}-icon{font-size:14px;line-height:1}
@keyframes toastIn{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes toastOut{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(10px) scale(.98)}}
@media (max-width:520px){#${THEME_BTN_ID}{min-width:40px;min-height:40px;padding:0 10px;font-size:11px}#${OFFLINE_ID}{top:calc(56px + env(safe-area-inset-top,0));font-size:11px}}
`;
    const head = document.head || document.body || document.documentElement;
    if(head && head.appendChild) head.appendChild(style);
  }

  function ensureToastHost(){
    let host = document.getElementById(TOAST_HOST_ID);
    if(host) return host;
    host = document.createElement('div');
    host.id = TOAST_HOST_ID;
    (document.body || document.documentElement).appendChild(host);
    return host;
  }

  function iconFor(type){
    return type === 'success' ? '✅' : type === 'warn' ? '⚠️' : type === 'error' ? '⛔' : 'ℹ️';
  }

  function showToast(message, type, ms){
    if(!message) return;
    ensureStyles();
    const host = ensureToastHost();
    const item = document.createElement('div');
    item.className = `${TOAST_HOST_ID}-item ${type || 'info'}`;
    item.innerHTML = `<span class="${TOAST_HOST_ID}-icon">${iconFor(type)}</span><span>${String(message).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</span>`;
    host.appendChild(item);
    const ttl = typeof ms === 'number' ? ms : 2200;
    const tid = setTimeout(() => {
      item.classList.add('fadeout');
      setTimeout(() => item.remove(), 180);
    }, ttl);
    item.addEventListener('click', () => {
      clearTimeout(tid);
      item.remove();
    });
  }
  window.showToast = showToast;

  function syncThemeButton(){
    const btn = document.getElementById(THEME_BTN_ID);
    if(!btn) return;
    const pref = getThemePref();
    const text = pref === 'light' ? '☀️' : pref === 'dark' ? '🌙' : '🖥️';
    const label = pref === 'light' ? 'Светлая' : pref === 'dark' ? 'Тёмная' : 'Системная';
    btn.textContent = text;
    btn.setAttribute('aria-label', `Тема: ${label}. Нажми, чтобы переключить.`);
    btn.title = `Тема: ${label}`;
  }

  function applyTheme(pref, silent){
    ensureStyles();
    const value = pref || getThemePref();
    const root = document.documentElement || {};
    if(value === 'system') {
      if(root.removeAttribute) root.removeAttribute('data-theme');
      else if(root.setAttribute) root.setAttribute('data-theme', '');
    } else if(root.setAttribute) {
      root.setAttribute('data-theme', value);
    } else {
      root['data-theme'] = value;
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    const eff = effectiveTheme(value);
    if(meta) meta.setAttribute('content', THEME_META_COLOR[eff]);
    const cmeta = document.querySelector('meta[name="color-scheme"]');
    if(cmeta) cmeta.setAttribute('content', 'light dark');
    syncThemeButton();
    if(!silent) showToast(`Тема: ${value === 'system' ? 'как в системе' : value === 'dark' ? 'тёмная' : 'светлая'}`, 'info', 1600);
  }

  function setThemePref(next, silent){
    try {
      const storage = getStorage();
      storage && storage.setItem(THEME_KEY, next);
    } catch (_) {}
    applyTheme(next, silent);
  }

  function cycleTheme(){
    const order = ['system','light','dark'];
    const current = getThemePref();
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];
    setThemePref(next, false);
  }

  function mountThemeButton(){
    if(document.getElementById(THEME_BTN_ID)) return;
    const btn = document.createElement('button');
    btn.id = THEME_BTN_ID;
    btn.type = 'button';
    btn.setAttribute('data-theme-cycle', '1');
    btn.addEventListener('click', cycleTheme);
    (document.body || document.documentElement).appendChild(btn);
    syncThemeButton();
  }

  function updateOfflinePill(show){
    let pill = document.getElementById(OFFLINE_ID);
    if(!pill){
      pill = document.createElement('div');
      pill.id = OFFLINE_ID;
      pill.innerHTML = '<span class="dot"></span><span>Работаете офлайн</span>';
      (document.body || document.documentElement).appendChild(pill);
    }
    if(pill.classList && pill.classList.toggle) pill.classList.toggle('show', !!show);
    else pill.className = show ? 'show' : '';
  }

  function syncConnectivity(silent){
    const online = typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
    updateOfflinePill(!online);
    if(!silent) showToast(online ? 'Соединение восстановлено' : 'Работаете офлайн', online ? 'success' : 'warn', 1800);
  }

  function patchAlert(){
    if(window.__wave9AlertPatched) return;
    window.__wave9AlertPatched = true;
    const nativeAlert = typeof window.alert === 'function' ? window.alert.bind(window) : function(){};
    window.__nativeAlert = nativeAlert;
    window.alert = function(msg){
      const text = String(msg == null ? '' : msg);
      if(text && text.length <= 96 && !/[\n\r]/.test(text)){
        const kind = /ошиб|невер|не удалось|не найден|нельзя/i.test(text) ? 'error' : /оффлайн|вниман/i.test(text) ? 'warn' : 'info';
        showToast(text, kind, 2400);
        return;
      }
      return nativeAlert(text);
    };
  }

  function currentScreen(){
    const on = document.querySelector && document.querySelector('.scr.on');
    return on && on.id ? on.id.replace(/^s-/, '') : null;
  }

  function hasActiveSession(){
    const play = document.getElementById && document.getElementById('s-play');
    return !!(play && play.classList && play.classList.contains('on'));
  }

  function initScreenHistory(){
    if(!window.go || !document.querySelector || !document.querySelector('.scr')) return;
    if(window.__wave9HistoryReady) return;
    window.__wave9HistoryReady = true;
    let suppress = false;
    const nativeGo = window.go.bind(window);
    const nativeEndSession = typeof window.endSession === 'function' ? window.endSession.bind(window) : null;

    function writeState(screen, replace){
      if(!window.history || !history.pushState) return;
      const clean = (window.location.pathname || '').split('#')[0] || '';
      const hash = screen ? `#${screen}` : '';
      const method = replace ? 'replaceState' : 'pushState';
      try { history[method]({ trainerApp: true, screen: screen || 'main' }, '', `${clean}${hash}`); } catch (_) {}
    }

    window.go = function(screen){
      const before = currentScreen();
      const result = nativeGo(screen);
      const after = currentScreen() || screen || before || 'main';
      if(!suppress && after && after !== before) writeState(after, false);
      return result;
    };

    const initial = (window.location.hash || '').replace(/^#/, '');
    const current = currentScreen() || 'main';
    if(initial && document.getElementById(`s-${initial}`)){
      suppress = true;
      nativeGo(initial);
      suppress = false;
    }
    writeState(currentScreen() || current, true);

    window.addEventListener('popstate', function(event){
      const target = event && event.state && event.state.trainerApp ? event.state.screen : null;
      if(!target) return;
      if(hasActiveSession() && target !== 'play'){
        const ok = typeof window.confirm === 'function'
          ? window.confirm('Выйти из текущей сессии? Результат будет сохранён.')
          : true;
        if(!ok){
          suppress = true;
          writeState(currentScreen() || 'play', false);
          suppress = false;
          return;
        }
        if(nativeEndSession){
          suppress = true;
          nativeEndSession();
          writeState(currentScreen() || 'result', true);
          suppress = false;
          showToast('Сессия завершена и сохранена', 'success', 1800);
          return;
        }
      }
      suppress = true;
      nativeGo(target);
      suppress = false;
    });

    window.addEventListener('beforeunload', function(event){
      if(!hasActiveSession()) return;
      event.preventDefault();
      event.returnValue = '';
      return '';
    });
  }

  function init(){
    ensureStyles();
    patchAlert();
    mountThemeButton();
    applyTheme(getThemePref(), true);
    syncConnectivity(true);
    initScreenHistory();
    window.addEventListener('online', function(){ syncConnectivity(false); });
    window.addEventListener('offline', function(){ syncConnectivity(false); });
    window.addEventListener('error', function(){ showToast('Что-то пошло не так. Попробуй ещё раз.', 'error', 2600); });
    window.addEventListener('unhandledrejection', function(){ showToast('Не удалось завершить действие.', 'error', 2600); });
    try {
      const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      if(mq && mq.addEventListener){
        mq.addEventListener('change', function(){ if(getThemePref() === 'system') applyTheme('system', true); });
      }
    } catch (_) {}
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
