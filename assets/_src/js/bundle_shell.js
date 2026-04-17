/* --- wave36_perf.js --- */
(function(){
  if (typeof window === 'undefined' || window.__wave36Perf) return;
  window.__wave36Perf = true;
  var doc = document;
  var idCache = Object.create(null);
  var qsCache = Object.create(null);
  function alive(node){ try { return !!(node && doc && doc.contains(node)); } catch(_) { return !!node; } }
  function byId(id){ if(!id || !doc || typeof doc.getElementById !== 'function') return null; var hit = idCache[id]; if(alive(hit)) return hit; var el = doc.getElementById(id); if(el) idCache[id] = el; return el || null; }
  function qs(sel, root){ if(!sel || !doc) return null; if(root && root !== doc && typeof root.querySelector === 'function') return root.querySelector(sel); var hit = qsCache[sel]; if(alive(hit)) return hit; var el = doc.querySelector(sel); if(el) qsCache[sel] = el; return el || null; }
  function qsa(sel, root){ if(!sel || !doc) return []; var scope = root && typeof root.querySelectorAll === 'function' ? root : doc; try { return Array.prototype.slice.call(scope.querySelectorAll(sel)); } catch(_) { return []; } }
  function clear(){ idCache = Object.create(null); qsCache = Object.create(null); }
  function defer(fn, timeout){ try{ if('requestIdleCallback' in window){ return window.requestIdleCallback(function(){ try{ fn && fn(); }catch(_){} }, { timeout: timeout || 900 }); } }catch(_){} return window.setTimeout(function(){ try{ fn && fn(); }catch(_){} }, 0); }
  function afterPaint(fn){ return requestAnimationFrame(function(){ requestAnimationFrame(function(){ try{ fn && fn(); }catch(_){} }); }); }
  function onVisible(el, fn, options){ if(!el || typeof fn !== 'function') return function(){}; if(typeof IntersectionObserver !== 'function'){ defer(function(){ fn(el); }, 250); return function(){}; } var fired = false; var io = new IntersectionObserver(function(entries){ entries.forEach(function(entry){ if(fired) return; if(entry && entry.isIntersecting){ fired = true; try{ io.disconnect(); }catch(_){} fn(el); } }); }, options || { rootMargin:'120px 0px' }); io.observe(el); return function(){ try{ io.disconnect(); }catch(_){} }; }
  window.TrainerPerf = { version:'wave36', byId:byId, qs:qs, qsa:qsa, clear:clear, defer:defer, afterPaint:afterPaint, onVisible:onVisible };
  window.addEventListener('pagehide', clear, { passive:true });
})();

;
/* --- wave9_ui.js --- */
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

  function runtimeErrorStore(){
    if(!window.__trainerRuntimeErrors) window.__trainerRuntimeErrors = [];
    return window.__trainerRuntimeErrors;
  }

  function normalizeRuntimeMessage(value){
    if(value == null) return '';
    if(typeof value === 'string') return value;
    if(value && typeof value.message === 'string') return value.message;
    try { return JSON.stringify(value); } catch (_) { return String(value); }
  }

  function recordRuntimeError(kind, payload){
    const store = runtimeErrorStore();
    const entry = {
      kind: kind || 'error',
      message: normalizeRuntimeMessage(payload && payload.message ? payload.message : payload),
      detail: payload || null,
      page: (window.location && (window.location.pathname || window.location.href)) || '',
      at: Date.now()
    };
    store.push(entry);
    if(store.length > 50) store.splice(0, store.length - 50);
    return entry;
  }

  function bindRuntimeErrorCapture(){
    if(window.__trainerRuntimeCaptureBound) return;
    window.__trainerRuntimeCaptureBound = true;
    window.addEventListener('error', function(event){
      recordRuntimeError('error', {
        message: (event && event.message) || (event && event.error && event.error.message) || '',
        filename: event && event.filename || '',
        lineno: event && event.lineno || 0,
        colno: event && event.colno || 0
      });
    }, true);
    window.addEventListener('unhandledrejection', function(event){
      recordRuntimeError('unhandledrejection', {
        message: normalizeRuntimeMessage(event && event.reason),
        reason: normalizeRuntimeMessage(event && event.reason)
      });
    }, true);
  }

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
    const btn = document.getElementById(THEME_BTN_ID);
    if(btn && btn.remove) btn.remove();
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
    let lastToastKey = '';
    let lastToastAt = 0;
    window.alert = function(msg){
      const text = String(msg == null ? '' : msg).trim();
      if(!window.__trainerUserAlerts) window.__trainerUserAlerts = [];
      window.__trainerUserAlerts.push({ message:text, at:Date.now(), page:(window.location && (window.location.pathname || window.location.href)) || '' });
      if(window.__trainerUserAlerts.length > 50) window.__trainerUserAlerts.splice(0, window.__trainerUserAlerts.length - 50);
      if(text && text.length <= 120 && !/[\n\r]/.test(text)){
        const genericRetry = /что-?то пошло не так|попробуй ещё раз/i.test(text);
        const kind = /оффлайн|вниман/i.test(text) ? 'warn' : genericRetry ? 'warn' : /ошиб|невер|не удалось|не найден|нельзя/i.test(text) ? 'warn' : /✅|восстановлено|успех/i.test(text) ? 'success' : 'info';
        const normalized = text.replace(/^⚠️\s*/, '').replace(/^❌\s*/, '').replace(/^✅\s*/, '').trim();
        const key = kind + '|' + normalized;
        if(Date.now() - lastToastAt < 1600 && lastToastKey === key) return;
        lastToastKey = key;
        lastToastAt = Date.now();
        showToast(normalized, kind, kind === 'info' ? 1800 : 2200);
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
    bindRuntimeErrorCapture();
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

;
/* --- wave23_accessibility.js --- */
(() => {
  const STYLE_ID = 'wave23-a11y-style';
  const LIVE_ID = 'wave23-live';
  const SKIP_ID = 'wave23-skip-link';
  const MAIN_ID = 'wave23-main';
  const BTN_ATTR = 'data-wave23-button';
  const BTN_BOUND = 'data-wave23-button-bound';
  const DIALOG_ATTR = 'data-wave23-overlay';
  const INPUT_ATTR = 'data-wave23-input-bound';
  const ISOLATE_ATTR = 'data-wave23-isolated';
  const ISOLATE_HIDDEN_ATTR = 'data-wave23-prev-hidden';
  const ISOLATE_INERT_ATTR = 'data-wave23-prev-inert';

  const state = {
    modality: 'pointer',
    lastScreen: '',
    focusAfterRefresh: false,
    raf: 0,
  };

  function isElement(el){
    return !!el && typeof el === 'object';
  }

  function safeGet(el, attr){
    return isElement(el) && typeof el.getAttribute === 'function' ? el.getAttribute(attr) : null;
  }

  function safeSet(el, attr, value){
    if(isElement(el) && typeof el.setAttribute === 'function') el.setAttribute(attr, value);
  }

  function safeRemove(el, attr){
    if(isElement(el) && typeof el.removeAttribute === 'function') el.removeAttribute(attr);
  }

  function injectStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
      .skip-link{position:fixed;left:12px;top:12px;z-index:10001;padding:10px 14px;border-radius:12px;background:var(--text, #1a1a2e);color:#fff;text-decoration:none;font:700 13px/1.2 'Golos Text',system-ui,sans-serif;transform:translateY(-140%);opacity:0;transition:transform .18s ease,opacity .18s ease;box-shadow:0 12px 28px rgba(0,0,0,.2)}
      .skip-link:focus,.skip-link:focus-visible{transform:translateY(0);opacity:1;outline:3px solid var(--accent,#2563eb);outline-offset:2px}
      [role="button"]{cursor:pointer}
      [role="dialog"]:focus{outline:none}
      button,[role="button"],a.btn,.btn,.scard,.tbtn,.opt,.weak-btn,.qback,.hintt,.shpb,[data-theme-cycle]{min-height:44px;min-width:44px}
      input,select,textarea{font-size:16px}
      .wave23-focus-ring:focus-visible{outline:3px solid var(--accent,#2563eb);outline-offset:2px;box-shadow:0 0 0 5px rgba(37,99,235,.15)}
      html{scroll-behavior:smooth}
      @media (prefers-reduced-motion: reduce){
        *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
        .live-dot,.card,.spec-card,.spec-topic-card,.spec-quick-link,.spec-progress-fill,.spec-topic-bar-fill,.wave24-mobile-tip,.wave24-install-btn,.spec-card-arrow,.ca{animation:none!important;transition:none!important;transform:none!important}
        .wave24-bottom-nav a,.wave24-bottom-nav button,.spec-opt,.spec-btn,.spec-back,.spec-next{transition:none!important;transform:none!important}
      }
      @media (prefers-contrast: more){
        .skip-link{box-shadow:none;border:2px solid currentColor}
        button,[role="button"],a.btn,.btn,.scard,.tbtn,.opt,.weak-btn,.qback,.hintt,.shpb{border-width:2px!important}
        :focus-visible{outline:3px solid currentColor!important;outline-offset:2px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureLiveRegion(){
    let live = document.getElementById(LIVE_ID);
    if(!live){
      live = document.createElement('div');
      live.id = LIVE_ID;
      live.className = 'sr-only';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      document.body.appendChild(live);
    }
    return live;
  }

  function announce(text){
    const live = ensureLiveRegion();
    const msg = String(text || '').trim();
    if(!msg) return;
    live.textContent = '';
    setTimeout(() => { live.textContent = msg; }, 30);
  }
  window.wave23Announce = announce;

  function ensureSkipLink(){
    let link = document.getElementById(SKIP_ID);
    if(!link){
      link = document.createElement('a');
      link.id = SKIP_ID;
      link.href = '#' + MAIN_ID;
      link.className = 'skip-link';
      link.textContent = 'Перейти к содержимому';
      link.setAttribute('aria-label', 'Перейти к основному содержимому');
      if(document.body && typeof document.body.insertBefore === 'function') document.body.insertBefore(link, document.body.firstChild || null);
      else if(document.body && typeof document.body.appendChild === 'function') document.body.appendChild(link);
    }
  }

  function visible(el){
    if(!isElement(el)) return false;
    const style = window.getComputedStyle(el);
    const rects = typeof el.getClientRects === 'function' ? el.getClientRects() : [];
    return style.display !== 'none' && style.visibility !== 'hidden' && (el.offsetParent !== null || style.position === 'fixed' || style.position === 'sticky' || !!(rects && rects.length));
  }

  function readGlobal(name){
    try{
      return window.eval(`typeof ${name} !== \"undefined\" ? ${name} : null`);
    }catch(_){
      return null;
    }
  }

  function getFocusable(root){
    return [...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
      .filter(visible);
  }

  function textLabel(el){
    if(!isElement(el)) return 'Кнопка';
    const explicit = (safeGet(el, 'aria-label') || safeGet(el, 'title') || '').trim();
    if(explicit) return explicit;
    const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    if(/^←/.test(text)) return 'Назад';
    if(el.hasAttribute('data-theme-cycle')) return 'Переключить тему';
    if(!text || /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+$/u.test(text)){
      if((el.id || '').includes('theme')) return 'Переключить тему';
      if((el.id || '').includes('privacy')) return 'Настройка облака';
      return 'Кнопка';
    }
    return text.length > 120 ? text.slice(0, 117) + '…' : text;
  }

  function labelInputs(root=document){
    root.querySelectorAll('input,select,textarea').forEach((el) => {
      if(safeGet(el, INPUT_ATTR) === '1') return;
      const label = safeGet(el, 'aria-label') || safeGet(el, 'placeholder') || el.name || el.id || 'Поле ввода';
      if(!safeGet(el, 'aria-label')) safeSet(el, 'aria-label', label);
      if(el.id){
        const existing = document.querySelector(`label[for="${el.id}"]`);
        if(!existing){
          const sr = document.createElement('label');
          sr.className = 'sr-only';
          sr.setAttribute('for', el.id);
          sr.textContent = label;
          if(el.parentNode && typeof el.parentNode.insertBefore === 'function') el.parentNode.insertBefore(sr, el);
          else if(el.parentNode && typeof el.parentNode.appendChild === 'function') el.parentNode.appendChild(sr);
        }
      }
      el.setAttribute(INPUT_ATTR, '1');
    });
  }

  function bindRoleButton(el){
    if(!isElement(el)) return;
    if(safeGet(el, BTN_BOUND) === '1') return;
    const tag = el.tagName.toLowerCase();
    const semantic = /^(button|a|input|select|textarea|summary)$/.test(tag);
    if(!semantic){
      safeSet(el, 'role', safeGet(el, 'role') || 'button');
      if(!el.hasAttribute('tabindex')) el.tabIndex = 0;
    }
    el.classList.add('wave23-focus-ring');
    if(!safeGet(el, 'aria-label')) safeSet(el, 'aria-label', textLabel(el));
    if(!semantic){
      el.addEventListener('keydown', (event) => {
        if(event.key === 'Enter' || event.key === ' '){
          event.preventDefault();
          el.click();
        }
      });
    }
    el.setAttribute(BTN_BOUND, '1');
  }

  function decorateInteractive(root=document){
    const selector = [
      `[${BTN_ATTR}]`,
      '[onclick]',
      '.hintt',
      '.shpb',
      '.weak-btn',
      '.qback',
      '.opt',
      '[data-theme-cycle]'
    ].join(',');
    root.querySelectorAll(selector).forEach((el) => bindRoleButton(el));
    root.querySelectorAll('button,a,.scard,.tbtn,.btn,.weak-btn').forEach((el) => {
      el.classList.add('wave23-focus-ring');
      if(!safeGet(el, 'aria-label')) safeSet(el, 'aria-label', textLabel(el));
    });

    const toastHost = document.getElementById('trainer-toast-host');
    if(toastHost){
      toastHost.setAttribute('role', 'status');
      toastHost.setAttribute('aria-live', 'polite');
      toastHost.setAttribute('aria-atomic', 'true');
    }

    const feedback = document.getElementById('fba');
    if(feedback){
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      feedback.setAttribute('aria-atomic', 'true');
    }
    const hint = document.getElementById('ha');
    if(hint){
      hint.setAttribute('role', 'status');
      hint.setAttribute('aria-live', 'polite');
      hint.setAttribute('aria-atomic', 'true');
    }
    const pause = document.getElementById('pa');
    if(pause){
      pause.setAttribute('role', 'status');
      pause.setAttribute('aria-live', 'polite');
      pause.setAttribute('aria-atomic', 'true');
    }
  }

  function labelNavigation(nav, fallback){
    if(!isElement(nav)) return;
    if(!safeGet(nav, 'role')) safeSet(nav, 'role', 'navigation');
    if(!safeGet(nav, 'aria-label')) safeSet(nav, 'aria-label', fallback || 'Навигация');
  }

  function setListChildren(container, itemSelector){
    if(!isElement(container)) return;
    safeSet(container, 'role', 'list');
    const items = itemSelector ? container.querySelectorAll(itemSelector) : container.children;
    [...items].forEach((item) => {
      if(isElement(item) && !safeGet(item, 'role')) safeSet(item, 'role', 'listitem');
    });
  }

  function clearDialogIsolation(){
    document.querySelectorAll('[' + ISOLATE_ATTR + '="1"]').forEach((el) => {
      const prevHidden = safeGet(el, ISOLATE_HIDDEN_ATTR);
      if(prevHidden === 'null') safeRemove(el, 'aria-hidden');
      else if(prevHidden !== null) safeSet(el, 'aria-hidden', prevHidden);
      safeRemove(el, ISOLATE_HIDDEN_ATTR);
      const prevInert = safeGet(el, ISOLATE_INERT_ATTR);
      if('inert' in el) el.inert = prevInert === '1';
      safeRemove(el, ISOLATE_INERT_ATTR);
      safeRemove(el, ISOLATE_ATTR);
    });
  }

  function applyDialogIsolation(){
    clearDialogIsolation();
    const dialog = topDialog();
    if(!dialog || !document.body) return;
    const overlay = dialog.__wave23Overlay || dialog.closest('[' + DIALOG_ATTR + '="1"]') || dialog;
    const live = ensureLiveRegion();
    [...document.body.children].forEach((child) => {
      if(!isElement(child)) return;
      if(child === overlay || child === live) return;
      if(overlay && (overlay.contains(child) || child.contains(overlay))) return;
      safeSet(child, ISOLATE_ATTR, '1');
      const prevHidden = safeGet(child, 'aria-hidden');
      safeSet(child, ISOLATE_HIDDEN_ATTR, prevHidden === null ? 'null' : prevHidden);
      safeSet(child, 'aria-hidden', 'true');
      if('inert' in child){
        safeSet(child, ISOLATE_INERT_ATTR, child.inert ? '1' : '0');
        child.inert = true;
      }
    });
  }

  function setLandmarks(){
    const header = document.querySelector('header');
    if(header) header.setAttribute('role', 'banner');
    const footer = document.querySelector('footer, .foot');
    if(footer) footer.setAttribute('role', 'contentinfo');

    let main = document.getElementById(MAIN_ID) || document.querySelector('main');
    if(!main){
      main = document.querySelector('.scr.on .w') || document.querySelector('.scr.active .w') || document.querySelector('body > .w') || document.querySelector('body > div:not(.skip-link):not([id="'+LIVE_ID+'"])');
    }
    if(main && main !== document.body){
      if(!main.id) main.id = MAIN_ID;
      main.setAttribute('role', 'main');
      if(!safeGet(main, 'aria-label')) safeSet(main, 'aria-label', 'Основное содержимое');
      main.tabIndex = main.tabIndex || -1;
    }

    const navs = [...document.querySelectorAll('nav')];
    navs.forEach((nav, idx) => {
      let label = safeGet(nav, 'aria-label');
      if(!label){
        if(nav.id === 'wave24-bottom-nav') label = 'Быстрая мобильная навигация';
        else if(nav.classList.contains('spec-quick-nav')) label = 'Быстрые переходы по спецпредметам';
        else if(nav.classList.contains('quick-links')) label = 'Быстрые переходы';
        else label = idx === 0 ? 'Основная навигация' : ('Навигация ' + (idx + 1));
      }
      labelNavigation(nav, label);
    });

    document.querySelectorAll('.stats,.spec-stats').forEach((list) => setListChildren(list));
    document.querySelectorAll('.spec-tools').forEach((wrap, idx) => {
      safeSet(wrap, 'role', 'search');
      if(!safeGet(wrap, 'aria-label')) safeSet(wrap, 'aria-label', idx ? 'Поиск по темам' : 'Поиск по спецпредметам');
    });

    document.querySelectorAll('.scr').forEach((screen, idx) => {
      if(!safeGet(screen, 'role')) safeSet(screen, 'role', 'region');
      const title = screen.querySelector('h1,h2,h3');
      if(title){
        if(!title.id) title.id = `wave23-screen-title-${idx}`;
        safeSet(screen, 'aria-labelledby', title.id);
      }
    });
  }

  function updateScreens(){
    const screens = [...document.querySelectorAll('.scr')];
    if(!screens.length) return;
    const active = screens.find((screen) => screen.classList.contains('on') || screen.classList.contains('active')) || null;
    screens.forEach((screen) => {
      const on = screen === active;
      safeSet(screen, 'aria-hidden', on ? 'false' : 'true');
      if(on) safeSet(screen, 'aria-current', 'page');
      else safeRemove(screen, 'aria-current');
    });
    const key = active ? (active.id || active.className) : '';
    if(key && key !== state.lastScreen){
      state.lastScreen = key;
      if(state.modality === 'keyboard' || state.focusAfterRefresh){
        state.focusAfterRefresh = false;
        setTimeout(() => {
          const heading = active && active.querySelector('h1,h2,h3,[data-wave23-focus]');
          if(isElement(heading)){
            if(!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
            heading.focus({preventScroll:false});
          }
        }, 20);
      }
    }
  }

  function updateAnswerSemantics(){
    const group = document.getElementById('opts');
    if(group){
      group.setAttribute('role', 'radiogroup');
      if(!safeGet(group, 'aria-label')) safeSet(group, 'aria-label', 'Варианты ответа');
      [...group.querySelectorAll('.opt')].forEach((opt, idx) => {
        safeSet(opt, 'role', 'radio');
        const currentSel = readGlobal('sel');
        const selected = typeof currentSel === 'number' ? idx === currentSel : opt.classList.contains('ok') || opt.classList.contains('no');
        safeSet(opt, 'aria-checked', selected ? 'true' : 'false');
        if(opt.classList && opt.classList.contains && opt.classList.contains('dim')) safeSet(opt, 'aria-disabled', 'true');
        else safeRemove(opt, 'aria-disabled');
      });
    }
  }

  function markEnglishLang(){
    const englishActive = (() => {
      const currentSubject = readGlobal('cS');
      const diagSubject = readGlobal('curSubject');
      if(currentSubject && currentSubject.id === 'eng') return true;
      if(diagSubject && diagSubject.id === 'english') return true;
      const subjName = document.getElementById('quiz-subj-name');
      if(subjName && /англий/i.test(subjName.textContent || '')) return true;
      const active = document.querySelector('.scr.on,.scr.active');
      if(active && /англий/i.test(active.textContent || '')) return true;
      return false;
    })();
    ['tc','qb','opts','qcd','eng-level-block','q-txt','q-topic'].forEach((id) => {
      const el = document.getElementById(id);
      if(!el) return;
      if(englishActive) safeSet(el, 'lang', 'en');
      else if(safeGet(el, 'lang') === 'en') safeRemove(el, 'lang');
    });
  }

  function decorateDialogs(){
    const overlays = Array.from((document.body && document.body.children) || []).filter((node) => {
      if(!isElement(node) || !node.style || node.style.position !== 'fixed') return false;
      if(node === document.getElementById(SKIP_ID) || node.id === LIVE_ID || node.id === 'trainer-theme-btn' || node.id === 'trainer-toast-host') return false;
      const inset = (node.style.inset || '').replace(/\s+/g, '');
      const bg = String(node.style.background || '');
      const isBackdrop = inset === '0px' || inset === '0' || /rgba\(0,0,0/.test(bg) || (node.style.top === '0px' && node.style.left === '0px' && node.style.right === '0px' && node.style.bottom === '0px');
      const centered = node.style.alignItems === 'center' || node.style.justifyContent === 'center';
      return isBackdrop && centered;
    });
    overlays.forEach((overlay) => {
      if(safeGet(overlay, DIALOG_ATTR) === '1') return;
      safeSet(overlay, DIALOG_ATTR, '1');
      overlay.__wave23PrevFocus = isElement(document.activeElement) ? document.activeElement : null;
      const panel = [...(overlay.children || [])].find((node) => isElement(node)) || overlay;
      panel.__wave23Overlay = overlay;
      panel.__wave23PrevFocus = overlay.__wave23PrevFocus;
      safeSet(panel, 'role', 'dialog');
      safeSet(panel, 'aria-modal', 'true');
      panel.tabIndex = -1;
      const title = panel.querySelector('h1,h2,h3,h4');
      if(title){
        if(!title.id) title.id = 'wave23-dialog-title-' + Math.random().toString(36).slice(2,8);
        safeSet(panel, 'aria-labelledby', title.id);
      }else if(!safeGet(panel, 'aria-label')){
        safeSet(panel, 'aria-label', 'Диалоговое окно');
      }
      setTimeout(() => {
        const focusables = getFocusable(panel);
        (focusables[0] || panel).focus({preventScroll:false});
      }, 20);
      const dialogKeydown = (event) => {
        if(event.key === 'Escape'){
          event.preventDefault();
          overlay.remove();
          restoreDialogFocus(overlay);
          return;
        }
        if(event.key === 'Tab'){
          const focusables = getFocusable(panel);
          if(!focusables.length){
            event.preventDefault();
            panel.focus();
            return;
          }
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if(event.shiftKey && document.activeElement === first){
            event.preventDefault();
            last.focus();
          }else if(!event.shiftKey && document.activeElement === last){
            event.preventDefault();
            first.focus();
          }
        }
      };
      panel.addEventListener('keydown', dialogKeydown, true);
    });
  }

  function topDialog(){
    const panels = [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].filter(visible);
    return panels.length ? panels[panels.length - 1] : null;
  }

  function restoreDialogFocus(removed){
    if(!isElement(removed)) return;
    if(!topDialog()) clearDialogIsolation();
    const prev = removed.__wave23PrevFocus || removed.querySelector('[role="dialog"]')?.__wave23PrevFocus;
    if(isElement(prev) && (!document.contains || document.contains(prev))) {
      setTimeout(() => prev.focus({preventScroll:false}), 20);
    }
  }

  function onGlobalKeydown(event){
    if(event.key === 'Tab') state.modality = 'keyboard';
    if(event.key === 'Enter' || event.key === ' ') state.focusAfterRefresh = true;
    const dialog = topDialog();
    if(dialog){
      if(event.key === 'Escape'){
        event.preventDefault();
        const overlay = dialog.__wave23Overlay || dialog.closest(`[${DIALOG_ATTR}="1"]`) || dialog.parentElement;
        if(overlay && overlay.remove) overlay.remove();
        restoreDialogFocus(overlay || dialog);
        announce('Диалог закрыт');
        return;
      }
      if(event.key === 'Tab'){
        const focusables = getFocusable(dialog);
        if(!focusables.length){
          event.preventDefault();
          dialog.focus();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if(event.shiftKey && document.activeElement === first){
          event.preventDefault();
          last.focus();
        }else if(!event.shiftKey && document.activeElement === last){
          event.preventDefault();
          first.focus();
        }
      }
    }
  }

  function bindGlobals(){
    document.addEventListener('keydown', onGlobalKeydown, true);
    document.addEventListener('mousedown', () => { state.modality = 'pointer'; }, true);
    document.addEventListener('touchstart', () => { state.modality = 'touch'; }, { capture:true, passive:true });
    document.addEventListener('click', (event) => {
      const target = event.target;
      if(!isElement(target)) return;
      const text = (target.innerText || target.textContent || '').trim();
      if(/верно|неверно|правильно|неправильно/i.test(text)) announce(text);
    }, true);
  }

  function patchFunctions(){
    ['go','openSubj','goSubj','startQuiz','nextQ','render','renderProg','refreshMain','showBadges','showHallOfFame','showRushRecords','showBackupModal','startDiag','showResult','selectOpt'].forEach((name) => {
      const fn = window[name];
      if(typeof fn !== 'function' || fn.__wave23Wrapped) return;
      const wrapped = function(){
        const out = fn.apply(this, arguments);
        scheduleRefresh();
        return out;
      };
      wrapped.__wave23Wrapped = true;
      window[name] = wrapped;
    });
  }

  function refresh(){
    injectStyle();
    ensureLiveRegion();
    ensureSkipLink();
    labelInputs(document);
    decorateInteractive(document);
    patchFunctions();
    setLandmarks();
    updateScreens();
    updateAnswerSemantics();
    decorateDialogs();
    applyDialogIsolation();
    markEnglishLang();
    const host = document.getElementById('trainer-toast-host');
    if(host){
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      host.setAttribute('aria-atomic', 'true');
    }
  }

  function scheduleRefresh(){
    if(state.raf) return;
    state.raf = window.requestAnimationFrame(() => {
      state.raf = 0;
      refresh();
    });
  }
  window.wave23A11yRefresh = scheduleRefresh;

  function observe(){
    if(typeof MutationObserver === 'undefined') return;
    const bodyObserver = new MutationObserver((mutations) => {
      let needs = false;
      for(const mutation of mutations){
        if(mutation.type === 'childList'){
          mutation.removedNodes.forEach((node) => {
            if(isElement(node) && safeGet(node, DIALOG_ATTR) === '1') restoreDialogFocus(node);
          });
          if(mutation.addedNodes.length || mutation.removedNodes.length) needs = true;
        }
      }
      if(needs) scheduleRefresh();
    });
    bodyObserver.observe(document.body, {childList: true, subtree: true});

    if(document.querySelector('.scr')){
      const screenObserver = new MutationObserver(() => scheduleRefresh());
      document.querySelectorAll('.scr').forEach((screen) => screenObserver.observe(screen, {attributes: true, attributeFilter: ['class']}));
    }
  }

  function init(){
    refresh();
    bindGlobals();
    observe();
    announce('Доступность включена');
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();

;
/* --- wave24_mobile.js --- */
(() => {
  const STYLE_ID = 'wave24-mobile-style';
  const NAV_ID = 'wave24-bottom-nav';
  const INSTALL_ID = 'wave24-install-btn';
  const state = {
    page: null,
    installPrompt: null,
    wakeLock: null,
    wakeRequested: false,
    observer: null,
    touch: null,
  };

  function $(sel, root=document){ return root.querySelector(sel); }
  function $$(sel, root=document){ return [...root.querySelectorAll(sel)]; }
  function visible(el){
    if(!el || !(el instanceof Element)) return false;
    const st = getComputedStyle(el);
    return st.display !== 'none' && st.visibility !== 'hidden';
  }
  function compact(){ return window.matchMedia('(max-width: 1023px)').matches; }
  function tablet(){ return window.matchMedia('(min-width: 768px)').matches; }
  function standalone(){
    return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || !!navigator.standalone;
  }
  function pageType(){
    if(state.page) return state.page;
    if(typeof window.GRADE_NUM !== 'undefined' && window.GRADE_NUM !== null) return state.page = 'grade';
    var pathName = '';
    try { pathName = String((window.location && window.location.pathname) || '').toLowerCase().split('/').pop() || ''; } catch(_) {}
    if(pathName === 'dashboard.html') return state.page = 'dashboard';
    if(pathName === 'diagnostic.html') return state.page = 'diagnostic';
    if(pathName === 'tests.html') return state.page = 'tests';
    if(pathName === 'spec_subjects.html') return state.page = 'spec';
    if(pathName === 'index.html' || pathName === '') return state.page = 'index';
    const title = (document.title || '').toLowerCase();
    if(title.includes('родитель')) return state.page = 'dashboard';
    if(title.includes('спецпредмет') || title.includes('профессиональн')) return state.page = 'spec';
    if(title.includes('портрет') || title.includes('тесты')) return state.page = 'tests';
    if(title.includes('диагностика')) return state.page = 'diagnostic';
    return state.page = 'index';
  }

  function injectStyle(){
    if(typeof document === 'undefined' || !document.head) return;
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      :root{--wave24-nav-base-h:60px;--wave24-nav-safe-b:env(safe-area-inset-bottom,0px);--wave24-nav-total-h:calc(var(--wave24-nav-base-h) + var(--wave24-nav-safe-b))}
      body{overflow-x:hidden}
      body.wave24-mobile-shell{padding-bottom:calc(var(--wave24-nav-total-h) + 12px) !important;}
      body.wave24-save-data, body.wave24-save-data button, body.wave24-save-data input, body.wave24-save-data select, body.wave24-save-data textarea{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif !important;}
      body.wave24-mobile-shell header,body.wave24-mobile-shell .header{background:var(--bg,#f5f3ee)!important;color:var(--text,#1a1a2e)!important;border-bottom:1px solid var(--border,#e2e0d8)}
      body.wave24-mobile-shell header h1,body.wave24-mobile-shell header p,body.wave24-mobile-shell .header h1,body.wave24-mobile-shell .header p{color:inherit!important}
      @media (max-width: 1023px){
        html,body{overscroll-behavior-y:contain;scroll-padding-top:calc(72px + env(safe-area-inset-top,0));}
      }
      .wave24-install-btn{position:fixed;right:12px;bottom:calc(var(--wave24-nav-total-h) + 12px);z-index:9998;display:none!important;align-items:center;gap:8px;padding:10px 14px;border:none;border-radius:999px;background:var(--text,#1a1a2e);color:#fff;font:700 12px/1.2 'Golos Text',system-ui,sans-serif;box-shadow:0 12px 28px rgba(0,0,0,.22);cursor:pointer;-webkit-appearance:none;touch-action:manipulation}
      .wave24-install-btn:active{transform:scale(.98)}
      .wave24-install-btn[hidden]{display:none!important}
      .wave24-bottom-nav{position:fixed;left:0;right:0;bottom:0;z-index:9997;display:flex;gap:8px;align-items:stretch;box-sizing:border-box;height:var(--wave24-nav-total-h);min-height:var(--wave24-nav-total-h);max-height:var(--wave24-nav-total-h);padding:0 max(12px, env(safe-area-inset-right,0px)) var(--wave24-nav-safe-b) max(12px, env(safe-area-inset-left,0px));margin:0;background:rgba(245,243,238,.96);backdrop-filter:blur(14px);border-top:1px solid var(--border,#e2e0d8);box-shadow:0 -8px 28px rgba(0,0,0,.08)}
      html[data-theme="dark"] .wave24-bottom-nav{background:rgba(20,20,32,.96)}
      .wave24-bottom-nav a,.wave24-bottom-nav button{flex:1;min-width:0;height:var(--wave24-nav-base-h);min-height:var(--wave24-nav-base-h);max-height:var(--wave24-nav-base-h);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:6px 6px;border:none;border-radius:14px;background:transparent;color:var(--muted,#6b6a74);font:700 11px/1.1 'Golos Text',system-ui,sans-serif;text-decoration:none;cursor:pointer;-webkit-appearance:none;touch-action:manipulation}
      .wave24-bottom-nav .wave24-ic{display:block;width:24px;height:24px;min-height:24px;flex:0 0 24px;line-height:24px;text-align:center;overflow:hidden}.wave24-bottom-nav .wave24-ic svg{display:block;width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      .wave24-bottom-nav .is-active{background:var(--abg,#dbeafe);color:var(--accent,#2563eb)}
      .wave24-bottom-nav .is-quiet{opacity:.75}
      .wave24-mobile-tip{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--wave24-nav-total-h) + 12px);z-index:9996;background:var(--card,#fff);color:var(--muted,#6b6a74);border:1px solid var(--border,#e2e0d8);border-radius:999px;padding:8px 12px;font:600 11px/1.2 'Golos Text',system-ui,sans-serif;box-shadow:0 10px 24px rgba(0,0,0,.08);opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease}
      .wave24-mobile-tip.show{opacity:1;transform:translateX(-50%) translateY(-4px)}
      .wave24-has-bottom-nav .w{padding-bottom:12px;}
      .wave24-has-bottom-nav header,.wave24-has-bottom-nav .header{padding-right:max(16px, env(safe-area-inset-right,0));padding-left:max(16px, env(safe-area-inset-left,0));}
      @media (max-width: 1023px){
        body.wave24-mobile-shell .w{padding-left:max(14px, env(safe-area-inset-left,0));padding-right:max(14px, env(safe-area-inset-right,0));}
        body.wave24-mobile-shell header{padding-left:max(14px, env(safe-area-inset-left,0));padding-right:max(14px, env(safe-area-inset-right,0));}
        #wave21-main-actions .btn,#wave22-dashboard-actions .btn{min-height:46px}
      }
      @media (min-width: 768px){
        body.wave24-mobile-shell{padding-bottom:calc(var(--wave24-nav-total-h) + 12px) !important;}
        body.wave24-mobile-shell .w{max-width:980px !important;}
        #sg,#tl,.subj-grid,.grid,.stats,.subject-stack,#wave22-insights,#wave22-subjects,.wave22-subject-breakdown{display:grid !important;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}
        .subject-stack>.subject-card,#wave22-insights>.chart-card,#wave22-subjects>.chart-card{margin:0 !important}
      }
      @media (min-width: 1200px){
        #sg,#tl,.grid{grid-template-columns:repeat(3,minmax(0,1fr));}
      }
      @media (max-width: 767px){
        .wave24-bottom-nav{display:flex}
      }
      @media (min-width: 1024px){
        html,body{overscroll-behavior-y:auto;}
        .wave24-bottom-nav,.wave24-install-btn,.wave24-mobile-tip{display:none !important}
        body.wave24-mobile-shell{padding-bottom:env(safe-area-inset-bottom,0) !important;}
      }
      @media (orientation: landscape) and (max-height: 560px){
        .wave24-bottom-nav{padding-top:6px;padding-bottom:calc(6px + env(safe-area-inset-bottom,0));}
        .wave24-bottom-nav a,.wave24-bottom-nav button{padding:6px 6px;font-size:10px}
        .wave24-bottom-nav .wave24-ic{width:22px;height:22px;min-height:22px;flex:0 0 22px}.wave24-bottom-nav .wave24-ic svg{width:22px;height:22px}
        .wave24-install-btn{bottom:calc(var(--wave24-nav-total-h) + 12px);padding:8px 12px}
      }
    `;
    document.head.appendChild(style);
  }

  function applyConnectionMode(){
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if(!conn) return;
    const slow = /2g/.test(conn.effectiveType || '') || !!conn.saveData;
    if(conn.saveData && document.body && document.body.classList) document.body.classList.add('wave24-save-data');
    if(slow && typeof window.showToast === 'function'){
      window.showToast(conn.saveData ? 'Экономия трафика: облегчённый режим' : 'Медленное соединение: упрощённый режим');
    }
  }

  function iconSvg(name){
    switch(name){
      case 'home':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"></path><path d="M5 9.5V21h14V9.5"></path></svg>';
      case 'diagnostic':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"></rect><path d="M8 7h8"></path><path d="M8 11h8"></path><path d="M8 15h5"></path></svg>';
      case 'tests':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6"></path><path d="M10 3v5.3l-4.5 7.4A4 4 0 0 0 8.9 22h6.2a4 4 0 0 0 3.4-6.3L14 8.3V3"></path></svg>';
      case 'spec':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="11" rx="2"></rect><path d="M9 7V5a3 3 0 0 1 6 0v2"></path><path d="M4 11h16"></path></svg>';
      case 'panel':
      case 'progress':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V10"></path><path d="M12 19V5"></path><path d="M19 19v-8"></path><path d="M3 21h18"></path></svg>';
      case 'profile':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 20a8 8 0 0 1 16 0"></path></svg>';
      case 'classes':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1.5"></rect><rect x="14" y="4" width="6" height="6" rx="1.5"></rect><rect x="4" y="14" width="6" height="6" rx="1.5"></rect><rect x="14" y="14" width="6" height="6" rx="1.5"></rect></svg>';
      default:
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle></svg>';
    }
  }

  function navItems(){
    switch(pageType()){
      case 'grade':
        return [
          { key:'home', icon:'home', label:'Главная', action:()=>window.go && window.go('main') },
          { key:'progress', icon:'progress', label:'Прогресс', action:()=>window.go && window.go('prog') },
          { key:'profile', icon:'profile', label:'Профиль', action:()=>window.showHallOfFame && window.showHallOfFame() },
          { key:'classes', icon:'classes', label:'Классы', action:()=>window.showClassSelect && window.showClassSelect() },
        ];
      case 'dashboard':
        return [
          { key:'home', icon:'home', label:'Главная', href:'index.html' },
          { key:'diagnostic', icon:'diagnostic', label:'Диагностика', href:'diagnostic.html' },
          { key:'tests', icon:'tests', label:'Тесты', href:'tests.html' },
          { key:'dashboard', icon:'panel', label:'Панель', href:'dashboard.html' },
        ];
      case 'diagnostic':
        return [
          { key:'home', icon:'home', label:'Главная', href:'index.html' },
          { key:'diagnostic', icon:'diagnostic', label:'Диагностика', href:'diagnostic.html' },
          { key:'tests', icon:'tests', label:'Тесты', href:'tests.html' },
          { key:'dashboard', icon:'panel', label:'Панель', href:'dashboard.html' },
        ];
      case 'tests':
        return [
          { key:'home', icon:'home', label:'Главная', href:'index.html' },
          { key:'diagnostic', icon:'diagnostic', label:'Диагностика', href:'diagnostic.html' },
          { key:'tests', icon:'tests', label:'Тесты', href:'tests.html' },
          { key:'dashboard', icon:'panel', label:'Панель', href:'dashboard.html' },
        ];
      case 'spec':
        return [
          { key:'home', icon:'home', label:'Главная', href:'index.html' },
          { key:'diagnostic', icon:'diagnostic', label:'Диагностика', href:'diagnostic.html' },
          { key:'spec', icon:'spec', label:'Спец', href:'spec_subjects.html' },
          { key:'dashboard', icon:'panel', label:'Панель', href:'dashboard.html' },
        ];
      default:
        return [
          { key:'home', icon:'home', label:'Главная', href:'index.html' },
          { key:'diagnostic', icon:'diagnostic', label:'Диагностика', href:'diagnostic.html' },
          { key:'tests', icon:'tests', label:'Тесты', href:'tests.html' },
          { key:'dashboard', icon:'panel', label:'Панель', href:'dashboard.html' },
        ];
    }
  }

  function focusNavItem(node, mode){
    const nav = node && node.parentElement;
    if(!nav) return;
    const items = $$('[data-key]', nav);
    const idx = items.indexOf(node);
    if(idx === -1 || !items.length) return;
    let next = idx;
    if(mode === 'home') next = 0;
    else if(mode === 'end') next = items.length - 1;
    else next = (idx + mode + items.length) % items.length;
    const target = items[next];
    if(target && target.focus) target.focus();
  }

  function createNavNode(item){
    const node = item.href ? document.createElement('a') : document.createElement('button');
    node.className = 'wave24-nav-item';
    node.dataset.key = item.key;
    if(item.href) node.href = item.href;
    else node.type = 'button';
    node.setAttribute('aria-label', item.label);
    node.innerHTML = `<span class="wave24-ic" aria-hidden="true">${iconSvg(item.icon)}</span><span class="wave24-tx">${item.label}</span>`;
    if(item.action) node.addEventListener('click', item.action);
    node.addEventListener('keydown', (event) => {
      if(event.key === 'ArrowRight' || event.key === 'ArrowDown'){
        event.preventDefault();
        focusNavItem(node, 1);
      }else if(event.key === 'ArrowLeft' || event.key === 'ArrowUp'){
        event.preventDefault();
        focusNavItem(node, -1);
      }else if(event.key === 'Home'){
        event.preventDefault();
        focusNavItem(node, 'home');
      }else if(event.key === 'End'){
        event.preventDefault();
        focusNavItem(node, 'end');
      }
    });
    return node;
  }

  function injectBottomNav(){
    if(typeof document === 'undefined' || !document.body) return;
    let nav = document.getElementById(NAV_ID);
    if(!nav){
      nav = document.createElement('nav');
      nav.id = NAV_ID;
      nav.className = 'wave24-bottom-nav';
      nav.setAttribute('aria-label', 'Быстрая мобильная навигация');
      if(document.body && document.body.appendChild) document.body.appendChild(nav);
    }
    nav.innerHTML = '';
    navItems().forEach(item => nav.appendChild(createNavNode(item)));
    if(document.body && document.body.classList) document.body.classList.add('wave24-mobile-shell', 'wave24-has-bottom-nav');
    updateNavState();
  }

  function activeNavKey(){
    const type = pageType();
    if(type === 'grade'){
      if($('#s-prog.on')) return 'progress';
      return 'home';
    }
    if(type === 'dashboard') return 'dashboard';
    if(type === 'diagnostic') return 'diagnostic';
    if(type === 'tests') return 'tests';
    if(type === 'spec') return 'spec';
    return 'home';
  }

  function updateNavState(){
    const nav = document.getElementById(NAV_ID);
    if(!nav) return;
    const active = activeNavKey();
    $$('[data-key]', nav).forEach((el) => {
      el.classList.toggle('is-active', el.dataset.key === active);
      if(el.dataset.key !== active && pageType()==='grade' && (el.dataset.key === 'profile' || el.dataset.key === 'classes')){
        el.classList.add('is-quiet');
      } else {
        el.classList.remove('is-quiet');
      }
      const label = ((el.querySelector('.wave24-tx') || {}).textContent || el.textContent || '').replace(/\s+/g, ' ').trim();
      if(el.dataset.key === active){
        el.setAttribute('aria-current', 'page');
        if(label) el.setAttribute('aria-label', label + ', текущая страница');
      }
      else {
        el.removeAttribute('aria-current');
        if(label) el.setAttribute('aria-label', label);
      }
    });
  }

  async function requestWakeLock(){
    if(state.wakeRequested || state.wakeLock || !('wakeLock' in navigator)) return;
    state.wakeRequested = true;
    try{
      const lock = await navigator.wakeLock.request('screen');
      state.wakeLock = lock;
      lock.addEventListener('release', () => {
        if(state.wakeLock === lock) state.wakeLock = null;
      });
    }catch(_){
    }finally{
      state.wakeRequested = false;
    }
  }

  async function releaseWakeLock(){
    if(!state.wakeLock) return;
    const lock = state.wakeLock;
    state.wakeLock = null;
    try{ await lock.release(); }catch(_){ }
  }

  function shouldWake(){
    if(document.hidden) return false;
    const type = pageType();
    if(type === 'grade') return !!$('#s-play.on');
    if(type === 'diagnostic') return !!$('#s-quiz.on');
    return false;
  }
  function compactInstallUi(){
    try {
      return !!(window.matchMedia && window.matchMedia('(max-width: 1023px)').matches);
    } catch(_) {
      return false;
    }
  }

  function syncWakeLock(){
    if(shouldWake()) requestWakeLock();
    else releaseWakeLock();
  }

  function currentGradeBackAction(){
    if($('#s-theory.on') && typeof window.goSubj === 'function') return () => window.goSubj();
    if($('#s-subj.on') && typeof window.go === 'function') return () => window.go('main');
    if($('#s-prog.on') && typeof window.go === 'function') return () => window.go('main');
    if($('#s-info.on') && typeof window.go === 'function') return () => window.go('main');
    if($('#s-result.on')) return () => window.globalMix ? window.go && window.go('main') : window.goSubj && window.goSubj();
    return null;
  }

  function swipeBack(){
    const type = pageType();
    if(type === 'grade'){
      const action = currentGradeBackAction();
      if(action){ action(); return true; }
      return false;
    }
    if(type === 'tests' && typeof window.go === 'function' && !$('#s-menu.active')){ window.go('menu'); return true; }
    if(type === 'diagnostic' && typeof window.go === 'function' && $('#s-result.on')){ window.go('select'); return true; }
    return false;
  }

  function swipeNext(){
    const type = pageType();
    if(type === 'grade' && $('#s-play.on') && window.sel !== null && !window.rushMode && !window.diagMode && typeof window.nextQ === 'function'){
      window.nextQ();
      return true;
    }
    if(type === 'diagnostic'){
      const nextBtn = $('.next-btn.show');
      if(nextBtn){ nextBtn.click(); return true; }
    }
    return false;
  }

  function ensureTip(){
    if(typeof document === 'undefined' || !document.body) return null;
    let tip = $('.wave24-mobile-tip');
    if(!tip){
      tip = document.createElement('div');
      tip.className = 'wave24-mobile-tip';
      tip.setAttribute('aria-hidden', 'true');
      document.body.appendChild(tip);
    }
    return tip;
  }

  let tipTimer = 0;
  function showTip(text){
    const tip = ensureTip();
    if(!tip) return;
    tip.textContent = text;
    tip.classList.add('show');
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => tip.classList.remove('show'), 1400);
  }

  function bindGestures(){
    document.addEventListener('touchstart', (event) => {
      if(!compact()) return;
      if(event.touches.length !== 1) return;
      const t = event.touches[0];
      const target = event.target;
      if(target && target.closest && target.closest('input,textarea,select,[contenteditable="true"]')) return;
      state.touch = { x: t.clientX, y: t.clientY, at: Date.now() };
    }, { passive: true });

    document.addEventListener('touchend', (event) => {
      if(!compact() || !state.touch) return;
      const changed = event.changedTouches && event.changedTouches[0];
      if(!changed) return;
      const dx = changed.clientX - state.touch.x;
      const dy = changed.clientY - state.touch.y;
      const dt = Date.now() - state.touch.at;
      state.touch = null;
      if(dt > 900) return;
      if(Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 1.3 || Math.abs(dy) > 42) return;
      if(dx > 0){
        if(swipeBack()) showTip('← Назад');
      }else if(dx < 0){
        if(swipeNext()) showTip('Следующий →');
      }
    }, { passive: true });
  }

  function bindInstallPrompt(){
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      state.installPrompt = event;
      syncInstallChip();
    });
    window.addEventListener('appinstalled', () => {
      state.installPrompt = null;
      syncInstallChip();
    });
  }

  async function promptInstall(){
    if(!state.installPrompt) return false;
    try{
      await state.installPrompt.prompt();
      await state.installPrompt.userChoice;
      state.installPrompt = null;
      syncInstallChip();
      return true;
    }catch(_){
      return false;
    }
  }

  function syncInstallChip(){
    if(typeof document === 'undefined' || !document.body) return;
    let btn = document.getElementById(INSTALL_ID);
    if(!btn){
      btn = document.createElement('button');
      btn.id = INSTALL_ID;
      btn.type = 'button';
      btn.className = 'wave24-install-btn';
      btn.textContent = '⬇ Установить';
      btn.hidden = true;
      btn.addEventListener('click', () => { promptInstall(); });
      if(document.body && document.body.appendChild) document.body.appendChild(btn);
    }
    btn.hidden = true;
    btn.style.display = 'none';
    btn.setAttribute('aria-hidden', 'true');
  }

  function patchFunctions(){
    ['go','startQuiz','endSession','showHallOfFame','showClassSelect','showAbout'].forEach((name) => {
      const orig = window[name];
      if(typeof orig !== 'function' || orig.__wave24wrapped) return;
      const wrapped = function(...args){
        const out = orig.apply(this, args);
        setTimeout(() => { updateNavState(); syncWakeLock(); }, 20);
        return out;
      };
      wrapped.__wave24wrapped = true;
      window[name] = wrapped;
    });
    if(pageType() === 'diagnostic'){
      ['startDiag','nextQ','showResult'].forEach((name) => {
        const orig = window[name];
        if(typeof orig !== 'function' || orig.__wave24wrapped) return;
        const wrapped = function(...args){
          const out = orig.apply(this, args);
          setTimeout(() => { updateNavState(); syncWakeLock(); }, 20);
          return out;
        };
        wrapped.__wave24wrapped = true;
        window[name] = wrapped;
      });
    }
  }

  function observeScreens(){
    const nodes = $$('.scr');
    if(state.observer) state.observer.disconnect();
    if(!nodes.length || typeof MutationObserver === 'undefined') return;
    state.observer = new MutationObserver(() => {
      updateNavState();
      syncWakeLock();
    });
    nodes.forEach((node) => state.observer.observe(node, { attributes: true, attributeFilter: ['class'] }));
    document.addEventListener('visibilitychange', syncWakeLock, { passive: true });
  }

  function exposeDebug(){
    window.wave24Debug = {
      pageType,
      activeNavKey,
      hasBottomNav: () => !!document.getElementById(NAV_ID),
      navLabels: () => $$('#'+NAV_ID+' [data-key]').map(el => el.textContent.replace(/\s+/g, ' ').trim()),
      swipeBack,
      swipeNext,
      tabletGrid: () => {
        const target = $('#sg') || $('#tl') || $('#wave22-insights') || $('.subject-stack') || $('.grid') || $('.subj-grid');
        if(!target) return { display: null, columns: 0 };
        const cs = getComputedStyle(target);
        return { display: cs.display, columns: (cs.gridTemplateColumns || '').split(' ').filter(Boolean).length };
      },
      wakeWanted: shouldWake,
      installVisible: () => !!document.getElementById(INSTALL_ID) && !document.getElementById(INSTALL_ID).hidden,
    };
  }

  function init(){
    if(typeof document === 'undefined' || !document.body || !document.body.classList) return;
    injectStyle();
    document.body.classList.add('wave24-mobile-shell');
    applyConnectionMode();
    injectBottomNav();
    bindInstallPrompt();
    bindGestures();
    patchFunctions();
    observeScreens();
    updateNavState();
    syncWakeLock();
    syncInstallChip();
    exposeDebug();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

;
/* --- wave27_platform.js --- */
(function(){
  if(window.__wave27PlatformLoaded) return;
  window.__wave27PlatformLoaded = true;
  var VERSION='wave27';
  var STYLE_ID='wave27-platform-style';
  var BANNER_ID='wave27-update-banner';
  var state={regs:[],refreshPending:false,mockMode:false};
  function appendTarget(){
    if(document.head && typeof document.head.appendChild === 'function') return document.head;
    if(document.body && typeof document.body.appendChild === 'function') return document.body;
    if(document.documentElement && typeof document.documentElement.appendChild === 'function') return document.documentElement;
    return null;
  }
  function safeAppend(node){ var target=appendTarget(); if(target) target.appendChild(node); }
  function ensureStyles(){
    if(document.getElementById(STYLE_ID)) return;
    var style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=[
      '#'+BANNER_ID+'{position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0));transform:translateX(-50%);z-index:14010;display:flex;align-items:center;gap:10px;padding:12px 14px;max-width:min(92vw,460px);border-radius:16px;border:1px solid var(--border,#e2e0d8);background:var(--card,#fff);color:var(--text,#1a1a2e);box-shadow:0 18px 38px rgba(0,0,0,.18)}',
      '#'+BANNER_ID+'[hidden]{display:none!important}',
      '#'+BANNER_ID+' .wave27-copy{flex:1;min-width:0}',
      '#'+BANNER_ID+' .wave27-title{font:800 13px/1.2 "Unbounded",system-ui,sans-serif;margin:0 0 4px}',
      '#'+BANNER_ID+' .wave27-desc{font:600 11px/1.45 "Golos Text",system-ui,sans-serif;color:var(--muted,#6b6a74);margin:0}',
      '#'+BANNER_ID+' .wave27-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
      '#'+BANNER_ID+' .wave27-btn{min-height:40px;padding:0 14px;border:none;border-radius:12px;font:800 12px/1 "Golos Text",system-ui,sans-serif;cursor:pointer;touch-action:manipulation}',
      '#'+BANNER_ID+' .wave27-btn.primary{background:var(--accent,#2563eb);color:#fff}',
      '#'+BANNER_ID+' .wave27-btn.ghost{background:var(--abg,#eef2ff);color:var(--accent,#2563eb)}',
      '#'+BANNER_ID+' .wave27-chip{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:12px;background:var(--abg,#eef2ff);font-size:18px;line-height:1}',
      '@media (max-width:640px){#'+BANNER_ID+'{bottom:calc(92px + env(safe-area-inset-bottom,0));padding:12px;align-items:flex-start}#'+BANNER_ID+' .wave27-actions{width:100%}#'+BANNER_ID+' .wave27-btn{flex:1}}'
    ].join('');
    safeAppend(style);
  }
  function ensureColorSchemeMeta(){
    var meta=document.querySelector('meta[name="color-scheme"]');
    if(!meta){meta=document.createElement('meta');meta.setAttribute('name','color-scheme');safeAppend(meta)}
    meta.setAttribute('content','light dark');
  }
  function installTimerTracking(){
    if(window.__wave27TimerTrackingInstalled) return;
    window.__wave27TimerTrackingInstalled=true;
    var rawSetTimeout=window.setTimeout.bind(window), rawClearTimeout=window.clearTimeout.bind(window), rawSetInterval=window.setInterval.bind(window), rawClearInterval=window.clearInterval.bind(window);
    var timeouts=new Set(), intervals=new Set();
    window.setTimeout=function(fn,ms){var args=[].slice.call(arguments,2);var id=rawSetTimeout(function(){timeouts.delete(id);if(typeof fn==='function') return fn.apply(this,args);try{return Function(String(fn))()}catch(_){return void 0}},ms);timeouts.add(id);return id};
    window.clearTimeout=function(id){timeouts.delete(id);return rawClearTimeout(id)};
    window.setInterval=function(fn,ms){var args=[].slice.call(arguments,2);var id=rawSetInterval(function(){if(typeof fn==='function') return fn.apply(this,args);try{return Function(String(fn))()}catch(_){return void 0}},ms);intervals.add(id);return id};
    window.clearInterval=function(id){intervals.delete(id);return rawClearInterval(id)};
    window.__wave27Timers={timeouts:timeouts,intervals:intervals,clearAll:function(){timeouts.forEach(function(id){rawClearTimeout(id)});intervals.forEach(function(id){rawClearInterval(id)});timeouts.clear();intervals.clear()},counts:function(){return{timeouts:timeouts.size,intervals:intervals.size}}};
    if(!window.requestIdleCallback){window.requestIdleCallback=function(cb,opts){var start=Date.now();return window.setTimeout(function(){cb({didTimeout:!!(opts&&opts.timeout&&(Date.now()-start)>=opts.timeout),timeRemaining:function(){return Math.max(0,50-(Date.now()-start))}})},1)}}
    if(!window.cancelIdleCallback){window.cancelIdleCallback=function(id){window.clearTimeout(id)}}
    window.addEventListener('pagehide',function(){try{window.__wave27Timers&&window.__wave27Timers.clearAll()}catch(_){}},{once:true});
  }
  function bannerNode(){return document.getElementById(BANNER_ID)}
  function hideUpdateBanner(){var n=bannerNode();if(n)n.remove();state.mockMode=false}
  function attachActions(node,reg){var later=node.querySelector('[data-wave27-later]');var apply=node.querySelector('[data-wave27-apply]');if(later) later.addEventListener('click',hideUpdateBanner);if(apply) apply.addEventListener('click',function(){if(reg&&reg.waiting&&reg.waiting.postMessage){state.refreshPending=true;reg.waiting.postMessage({type:'SKIP_WAITING'})}else hideUpdateBanner()})}
  function showUpdateBanner(reg,opts){opts=opts||{};ensureStyles();var node=bannerNode();if(!node){node=document.createElement('div');node.id=BANNER_ID;node.setAttribute('role','status');node.setAttribute('aria-live','polite');node.innerHTML='<div class="wave27-chip" aria-hidden="true">⬆️</div><div class="wave27-copy"><div class="wave27-title">Доступна новая версия</div><p class="wave27-desc">Можно обновить приложение сейчас и сразу перейти на свежий кэш.</p></div><div class="wave27-actions"><button class="wave27-btn ghost" type="button" data-wave27-later>Позже</button><button class="wave27-btn primary" type="button" data-wave27-apply>Обновить</button></div>';var target=(document.body&&typeof document.body.appendChild==='function')?document.body:appendTarget(); if(target) target.appendChild(node)}state.mockMode=!!opts.mock;attachActions(node,reg||null);return node}
  function regSeen(reg){return state.regs.indexOf(reg)!==-1}
  function hookRegistration(reg){if(!reg||regSeen(reg))return;state.regs.push(reg);if(reg.waiting) showUpdateBanner(reg);reg.addEventListener('updatefound',function(){var worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',function(){if(worker.state==='installed'&&navigator.serviceWorker.controller) showUpdateBanner(reg)})})}
  function initSWUpdates(){if(!('serviceWorker' in navigator) || !navigator.serviceWorker) return;var sw=navigator.serviceWorker;if(typeof sw.addEventListener==='function'){sw.addEventListener('controllerchange',function(){if(!state.refreshPending)return;state.refreshPending=false;try{location.reload()}catch(_){}})}var getReg=typeof sw.getRegistration==='function'?sw.getRegistration.bind(sw):null;if(!getReg) return;Promise.all([getReg('./sw.js').catch(function(){return null}),getReg().catch(function(){return null})]).then(function(list){list.filter(Boolean).forEach(hookRegistration)});if(sw.ready&&typeof sw.ready.then==='function'){sw.ready.then(function(reg){hookRegistration(reg);window.setTimeout(function(){try{reg.update&&reg.update()}catch(_){}},2500)}).catch(function(){})}}
  function init(){ensureColorSchemeMeta();installTimerTracking();initSWUpdates()}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  window.__wave27Platform={version:VERSION,updateVisible:function(){return !!bannerNode()},hideUpdateBanner:hideUpdateBanner,showMockUpdateBanner:function(){return showUpdateBanner({waiting:{postMessage:function(){}}},{mock:true})},manifestHref:function(){var el=document.querySelector('link[rel="manifest"]');return el&&el.getAttribute('href')},hasAppleTouchIcon:function(){return !!document.querySelector('link[rel="apple-touch-icon"]')},preconnectCount:function(){return document.querySelectorAll('link[rel="preconnect"]').length},cspPresent:function(){return !!document.querySelector('meta[http-equiv="Content-Security-Policy"]')},timerCounts:function(){return window.__wave27Timers?window.__wave27Timers.counts():{timeouts:0,intervals:0}}};
})();


;
/* --- wave40_settings_shell.js --- */
(function(){
  if (typeof window === 'undefined' || window.__wave40SettingsShell) return;
  window.__wave40SettingsShell = true;

  var THEME_KEY = 'trainer_theme';
  var SETTINGS_BTN_ID = 'trainer-settings-btn';
  var SETTINGS_HOST_ID = 'trainer-settings-host';
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
      '\n#' + SETTINGS_HOST_ID + '{display:flex;justify-content:flex-end;gap:8px;max-width:960px;margin:calc(12px + env(safe-area-inset-top,0)) auto 0;padding:0 max(14px, env(safe-area-inset-right,0)) 0 max(14px, env(safe-area-inset-left,0))}' +
      '\n#' + SETTINGS_HOST_ID + '.is-inline{max-width:none;margin:0;padding:0;display:block}' +
      '\n#' + SETTINGS_BTN_ID + '{position:static;z-index:auto;display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 14px;border:1px solid rgba(26,26,46,.08);border-radius:14px;background:var(--card,#fff);color:var(--text,#1a1a2e);box-shadow:none;font:700 12px/1 "Golos Text",system-ui,sans-serif;cursor:pointer;opacity:1;transition:transform .18s ease,box-shadow .18s ease,background .18s ease,color .18s ease}' +
      '\n#' + SETTINGS_BTN_ID + ':hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(0,0,0,.05)}' +
      '\n#' + SETTINGS_HOST_ID + '.is-inline #' + SETTINGS_BTN_ID + '{width:100%;min-height:44px;padding:12px 14px;border-radius:12px}' +
      '\nhtml[data-theme="dark"] #' + SETTINGS_BTN_ID + '{background:var(--card,#1e1e2e);color:var(--text,#e8e6e0);border:1px solid rgba(255,255,255,.10)}' +
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
  function ensureHost(){
    var host = document.getElementById(SETTINGS_HOST_ID);
    if (host) return host;
    host = document.createElement('div');
    host.id = SETTINGS_HOST_ID;
    var specNav = document.querySelector('.spec-quick-nav');
    if (specNav) { host.className = 'spec-quick-link is-inline'; specNav.appendChild(host); return host; }
    var quickLinks = document.querySelector('.quick-links');
    if (quickLinks) { host.className = 'quick-link is-inline'; quickLinks.appendChild(host); return host; }
    var shell = document.querySelector('.w, .spec-wrap, #app, main');
    if (shell && shell.firstChild) shell.insertBefore(host, shell.firstChild);
    else (document.body || document.documentElement).appendChild(host);
    return host;
  }
  function ensureButton(){
    if (!document.body) return null;
    var btn = document.getElementById(SETTINGS_BTN_ID);
    if (btn) return btn;
    var host = ensureHost();
    if (!host) return null;
    btn = document.createElement('button');
    btn.id = SETTINGS_BTN_ID;
    btn.type = 'button';
    btn.textContent = 'Настройки';
    btn.setAttribute('aria-label', 'Настройки');
    btn.setAttribute('title', 'Настройки');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', openSettings);
    host.appendChild(btn);
    return btn;
  }
  function refreshButton(){
    var btn = document.getElementById(SETTINGS_BTN_ID);
    if (!btn) return;
    var meta = themeMeta();
    btn.textContent = 'Настройки';
    btn.title = 'Настройки · тема: ' + meta.label;
    btn.setAttribute('aria-label', 'Настройки. Тема: ' + meta.label + '.');
  }
  function compactInstallUi(){
    try { return !!(window.matchMedia && window.matchMedia('(max-width: 1023px)').matches); } catch(_) { return false; }
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
    html += '<div class="wave40-settings-row"><div class="wave40-settings-note">Текущая тема: <b>' + themeMeta().label + '</b>.</div><div class="wave40-settings-note">Wave 50</div></div>';
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
    var btn = document.getElementById(SETTINGS_BTN_ID);
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
  function openSettings(){
    ensureStyles();
    closeSettings();
    var settingsBtn = ensureButton();
    if (settingsBtn) settingsBtn.setAttribute('aria-expanded', 'true');
    hideLegacyThemeButton();
    wrapToast();
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
