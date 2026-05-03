/* --- wave93a_mobile_layer.js --- */
(function(){
  'use strict';
  var VERSION = 'wave93a';
  if (window.__wave93aMobileLayer && window.__wave93aMobileLayer.version === VERSION) return;

  var NAV_ID = 'wave24-bottom-nav';
  var STYLE_ID = 'wave93a-mobile-style';
  var INSTALL_ID = 'wave93a-install-banner';
  var OFFLINE_ID = 'wave93a-offline-indicator';
  var PULL_ID = 'wave93a-pull-indicator';
  var SHARE_ID = 'wave93a-share-fab';
  var TIP_ID = 'wave93a-mobile-tip';
  var STORE_PREFIX = 'trainer_wave93a_mobile_';
  var state = { installPrompt: null, pull: null, refreshBusy: false, lastOffline: false, navTimer: 0, tipTimer: 0 };

  function safe(label, fn){
    try { return fn(); }
    catch (err) { try { console.warn('[wave93a mobile] ' + label, err); } catch (_) {} }
  }
  function qs(sel, root){ return (root || document).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function ready(fn){ if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ safe('init', fn); }, { once: true }); else safe('init', fn); }
  function compact(){ return !!(window.matchMedia && window.matchMedia('(max-width: 1023px)').matches); }
  function phone(){ return !!(window.matchMedia && window.matchMedia('(max-width: 767px)').matches); }
  function standalone(){ return !!((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone); }
  function currentFile(){ try { return String((window.location && window.location.pathname) || '').toLowerCase().split('/').pop() || 'index.html'; } catch (_) { return 'index.html'; } }
  function pageKey(){
    var p = currentFile();
    if (/^grade\d+_v2\.html$/.test(p) || typeof window.GRADE_NUM !== 'undefined') return 'grade';
    if (p === 'index.html' || p === '') return 'index';
    if (p === 'dashboard.html') return 'dashboard';
    if (p === 'diagnostic.html') return 'diagnostic';
    if (p === 'tests.html') return 'tests';
    if (p === 'spec_subjects.html') return 'spec';
    if (p === 'content_depth.html') return 'content';
    return 'disabled';
  }
  function activeScreen(id){ return !!qs('#' + id + '.on,#' + id + '.active'); }
  function blockingSession(){ return activeScreen('s-play') || activeScreen('s-quiz') || activeScreen('quiz-screen') || activeScreen('exam-screen'); }
  function interactiveTarget(target){ return !!(target && target.closest && target.closest('input,textarea,select,button,a,[role="button"],[contenteditable="true"],.wave24-bottom-nav,.wave93a-mobile-ui')); }
  function html(value){ return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]; }); }
  function storeGet(key){ try { return localStorage.getItem(STORE_PREFIX + key); } catch (_) { return null; } }
  function storeSet(key, val){ try { localStorage.setItem(STORE_PREFIX + key, String(val)); } catch (_) {} }

  function ensureViewportFit(){
    var meta = qs('meta[name="viewport"]');
    if (!meta && document.head) { meta = document.createElement('meta'); meta.name = 'viewport'; meta.content = 'width=device-width,initial-scale=1,viewport-fit=cover'; document.head.appendChild(meta); return; }
    if (!meta) return;
    var content = meta.getAttribute('content') || '';
    if (!/viewport-fit\s*=\s*cover/i.test(content)) meta.setAttribute('content', content ? content.replace(/\s+$/, '') + ',viewport-fit=cover' : 'width=device-width,initial-scale=1,viewport-fit=cover');
  }

  function ensureStyle(){
    if (!document.head || document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
:root{--wave93a-safe-top:env(safe-area-inset-top,0px);--wave93a-safe-right:env(safe-area-inset-right,0px);--wave93a-safe-bottom:env(safe-area-inset-bottom,0px);--wave93a-safe-left:env(safe-area-inset-left,0px);--wave93a-nav-h:64px;--wave93a-nav-total:calc(var(--wave93a-nav-h) + var(--wave93a-safe-bottom));}
html{scroll-padding-top:calc(12px + var(--wave93a-safe-top));scroll-padding-bottom:calc(var(--wave93a-nav-total) + 24px);}body.wave93a-mobile-ready{overflow-x:hidden;}
.wave93a-mobile-ui{box-sizing:border-box;font-family:var(--font-body,'Golos Text',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif);}
.wave24-bottom-nav{padding-left:max(12px,var(--wave93a-safe-left))!important;padding-right:max(12px,var(--wave93a-safe-right))!important;padding-bottom:var(--wave93a-safe-bottom)!important;min-height:var(--wave93a-nav-total)!important;height:var(--wave93a-nav-total)!important;}
.wave24-bottom-nav a,.wave24-bottom-nav button{min-width:44px!important;min-height:44px!important;touch-action:manipulation;}
.wave93a-install-banner{position:fixed;left:max(12px,var(--wave93a-safe-left));right:max(12px,var(--wave93a-safe-right));bottom:calc(var(--wave93a-nav-total) + 12px);z-index:10030;display:none;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border,#e2e0d8);border-radius:18px;background:var(--card,#fff);color:var(--text,#1a1a2e);box-shadow:0 18px 42px rgba(0,0,0,.16);}
.wave93a-install-banner.is-visible{display:flex}.wave93a-install-banner strong{display:block;font-size:13px;line-height:1.15}.wave93a-install-banner span{display:block;font-size:11px;line-height:1.25;color:var(--muted,#6b6a74);margin-top:2px}.wave93a-install-copy{min-width:0;flex:1}.wave93a-install-banner button{min-height:44px;border:0;border-radius:12px;padding:8px 10px;font-weight:800;cursor:pointer;touch-action:manipulation}.wave93a-install-main{background:var(--accent,#2563eb);color:#fff}.wave93a-install-close{background:var(--abg,#eef2ff);color:var(--text,#1a1a2e)}
.wave93a-offline-indicator{position:fixed;left:50%;top:calc(8px + var(--wave93a-safe-top));transform:translateX(-50%) translateY(-8px);z-index:10040;display:flex;align-items:center;gap:8px;max-width:min(92vw,520px);padding:9px 12px;border-radius:999px;border:1px solid var(--border,#e2e0d8);background:var(--card,#fff);color:var(--text,#1a1a2e);font-weight:800;font-size:12px;box-shadow:0 12px 30px rgba(0,0,0,.16);opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease;}.wave93a-offline-indicator.is-visible{opacity:1;transform:translateX(-50%) translateY(0)}.wave93a-offline-indicator.is-offline{background:#111827;color:#fff;border-color:#111827}.wave93a-offline-indicator.is-online{background:#ecfdf5;color:#065f46;border-color:#a7f3d0}
.wave93a-pull-indicator{position:fixed;left:50%;top:calc(10px + var(--wave93a-safe-top));z-index:10035;width:52px;height:52px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:var(--card,#fff);color:var(--text,#1a1a2e);border:1px solid var(--border,#e2e0d8);box-shadow:0 14px 36px rgba(0,0,0,.16);font-size:22px;font-weight:900;opacity:0;transform:translateX(-50%) translateY(-58px) scale(.92);transition:opacity .12s ease,transform .12s ease;pointer-events:none;}.wave93a-pull-indicator.is-visible{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}.wave93a-pull-indicator.is-armed{background:var(--accent,#2563eb);color:#fff}
.wave93a-share-fab{position:fixed;right:max(12px,var(--wave93a-safe-right));bottom:calc(var(--wave93a-nav-total) + 76px);z-index:10020;width:48px;height:48px;border:0;border-radius:999px;background:var(--text,#1a1a2e);color:#fff;font-size:20px;font-weight:900;box-shadow:0 16px 36px rgba(0,0,0,.2);display:none;align-items:center;justify-content:center;cursor:pointer;touch-action:manipulation}.wave93a-share-fab.is-visible{display:flex}
.wave93a-mobile-tip{position:fixed;left:50%;bottom:calc(var(--wave93a-nav-total) + 16px);z-index:10025;transform:translateX(-50%) translateY(8px);max-width:min(92vw,520px);padding:9px 12px;border-radius:999px;background:var(--text,#1a1a2e);color:#fff;font-size:12px;font-weight:800;box-shadow:0 12px 30px rgba(0,0,0,.2);opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease;text-align:center}.wave93a-mobile-tip.is-visible{opacity:1;transform:translateX(-50%) translateY(0)}
@media (max-width:1023px){body.wave93a-mobile-ready{padding-left:max(0px,var(--wave93a-safe-left));padding-right:max(0px,var(--wave93a-safe-right));}button,.btn,[role="button"],input[type="button"],input[type="submit"],.cta,.opt,.ca,.spec-opt,.spec-btn,.next-btn,.back,.nav-link{min-height:44px;touch-action:manipulation;}input,select,textarea{font-size:16px!important;}a,button{-webkit-tap-highlight-color:rgba(37,99,235,.18);}body.wave93a-has-bottom-nav{padding-bottom:calc(var(--wave93a-nav-total) + 12px)!important;}}
@media (min-width:1024px){.wave93a-install-banner,.wave93a-offline-indicator,.wave93a-pull-indicator,.wave93a-share-fab,.wave93a-mobile-tip{display:none!important}.wave24-bottom-nav[data-wave93a="1"]{display:none!important}}
@media (orientation:landscape) and (max-height:560px){:root{--wave93a-nav-h:54px}.wave24-bottom-nav a,.wave24-bottom-nav button{font-size:10px!important;padding-top:4px!important;padding-bottom:4px!important}.wave24-bottom-nav .wave24-ic{width:20px!important;height:20px!important;min-height:20px!important;flex-basis:20px!important}.wave93a-install-banner{display:none!important}.wave93a-share-fab{width:44px;height:44px;bottom:calc(var(--wave93a-nav-total) + 10px)}}
@media (prefers-reduced-motion:reduce){.wave93a-install-banner,.wave93a-offline-indicator,.wave93a-pull-indicator,.wave93a-share-fab,.wave93a-mobile-tip{transition:none!important}}
`;
    document.head.appendChild(style);
  }

  function icon(name){
    var icons = {
      home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"></path><path d="M5 9.5V21h14V9.5"></path></svg>', diagnostic:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"></rect><path d="M8 7h8M8 11h8M8 15h5"></path></svg>', tests:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M10 3v5.3l-4.5 7.4A4 4 0 0 0 8.9 22h6.2a4 4 0 0 0 3.4-6.3L14 8.3V3"></path></svg>', dashboard:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V10M12 19V5M19 19v-8M3 21h18"></path></svg>', spec:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="11" rx="2"></rect><path d="M9 7V5a3 3 0 0 1 6 0v2M4 11h16"></path></svg>',
      play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v14l12-7z"></path></svg>', theory:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v15H8a3 3 0 0 1-3-3z"></path><path d="M8 8h8M8 12h8"></path></svg>', progress:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18l5-5 4 4 7-9"></path><path d="M4 22h18"></path></svg>', classes:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"></rect><rect x="13" y="4" width="7" height="7" rx="1.5"></rect><rect x="4" y="13" width="7" height="7" rx="1.5"></rect><rect x="13" y="13" width="7" height="7" rx="1.5"></rect></svg>', profile:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>'
    };
    return icons[name] || '';
  }
  function navItems(){
    if (pageKey() === 'disabled') return [];
    if (pageKey() === 'grade') return [{key:'learn',icon:'play',label:'Учёба',action:'main'},{key:'theory',icon:'theory',label:'Теория',action:'theory'},{key:'progress',icon:'progress',label:'Прогресс',action:'progress'},{key:'classes',icon:'classes',label:'Классы',action:'classes'},{key:'profile',icon:'profile',label:'Профиль',action:'profile'}];
    return [{key:'index',icon:'home',label:'Главная',href:'index.html'},{key:'diagnostic',icon:'diagnostic',label:'Диагн.',href:'diagnostic.html'},{key:'tests',icon:'tests',label:'Тесты',href:'tests.html'},{key:'dashboard',icon:'dashboard',label:'Панель',href:'dashboard.html'},{key:'spec',icon:'spec',label:'Спец',href:'spec_subjects.html'}];
  }
  function activeKey(){
    var key = pageKey();
    if (key !== 'grade') return key === 'content' ? 'index' : key;
    if (activeScreen('s-prog')) return 'progress';
    if (activeScreen('s-theory')) return 'theory';
    return 'learn';
  }
  function runAction(action){
    if (action === 'main') { if (typeof window.go === 'function') { window.go('main'); return true; } window.location.href = 'index.html'; return true; }
    if (action === 'theory') { if (activeScreen('s-play') && typeof window.goSubj === 'function') { window.goSubj(); return true; } if (typeof window.go === 'function') { window.go('subj'); return true; } return false; }
    if (action === 'progress') { if (typeof window.go === 'function') { window.go('prog'); return true; } return false; }
    if (action === 'classes') { if (typeof window.showClassSelect === 'function') { window.showClassSelect(); return true; } window.location.href = 'index.html'; return true; }
    if (action === 'profile') { if (typeof window.showHallOfFame === 'function') { window.showHallOfFame(); return true; } if (typeof window.go === 'function') { window.go('info'); return true; } return false; }
    return false;
  }
  function createNavItem(item){
    var el = item.href ? document.createElement('a') : document.createElement('button');
    el.className = 'wave24-nav-item'; el.dataset.key = item.key; el.setAttribute('aria-label', item.label);
    if (item.href) el.href = item.href; else el.type = 'button';
    el.innerHTML = '<span class="wave24-ic" aria-hidden="true">' + icon(item.icon) + '</span><span class="wave24-tx">' + html(item.label) + '</span>';
    if (item.action) el.addEventListener('click', function(event){ event.preventDefault(); if (runAction(item.action)) { scheduleNav(); showTip(item.label); } });
    return el;
  }
  function ensureBottomNav(){
    var items = navItems();
    var nav = document.getElementById(NAV_ID);
    if (!items.length) { if (nav && nav.dataset.wave93a === '1') nav.hidden = true; return; }
    if (!nav) { nav = document.createElement('nav'); nav.id = NAV_ID; nav.className = 'wave24-bottom-nav'; document.body.appendChild(nav); }
    nav.hidden = false; nav.dataset.wave93a = '1'; nav.classList.add('wave93a-mobile-ui'); nav.setAttribute('aria-label', 'Быстрая мобильная навигация');
    var stamp = pageKey() + ':' + items.map(function(x){ return x.key; }).join(',');
    if (nav.dataset.wave93aStamp !== stamp) { nav.innerHTML = ''; items.forEach(function(item){ nav.appendChild(createNavItem(item)); }); nav.dataset.wave93aStamp = stamp; }
    document.body.classList.add('wave93a-mobile-ready', 'wave93a-has-bottom-nav', 'wave24-mobile-shell', 'wave24-has-bottom-nav');
    updateNavState();
  }
  function updateNavState(){
    var nav = document.getElementById(NAV_ID); if (!nav) return;
    var key = activeKey();
    qsa('[data-key]', nav).forEach(function(el){ var on = el.dataset.key === key; el.classList.toggle('is-active', on); if (on) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); });
  }
  function scheduleNav(){ clearTimeout(state.navTimer); state.navTimer = setTimeout(function(){ safe('nav', function(){ ensureBottomNav(); updateNavState(); syncShareFab(); }); }, 60); }

  function ensureTip(){ var tip = document.getElementById(TIP_ID); if (!tip) { tip = document.createElement('div'); tip.id = TIP_ID; tip.className = 'wave93a-mobile-tip wave93a-mobile-ui'; tip.setAttribute('role','status'); tip.setAttribute('aria-live','polite'); document.body.appendChild(tip); } return tip; }
  function showTip(text){ if (!compact()) return; var tip = ensureTip(); tip.textContent = text; tip.classList.add('is-visible'); clearTimeout(state.tipTimer); state.tipTimer = setTimeout(function(){ tip.classList.remove('is-visible'); }, 1500); }

  function likelyIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  function installDismissed(){ var until = Number(storeGet('install_dismissed_until') || 0); return until && Date.now() < until; }
  function dismissInstall(){ storeSet('install_dismissed_until', Date.now() + 7 * 24 * 60 * 60 * 1000); syncInstallBanner(); }
  function ensureInstallBanner(){
    var node = document.getElementById(INSTALL_ID);
    if (!node) { node = document.createElement('div'); node.id = INSTALL_ID; node.className = 'wave93a-install-banner wave93a-mobile-ui'; node.setAttribute('role','status'); node.setAttribute('aria-live','polite'); node.innerHTML = '<div class="wave93a-install-copy"><strong>Установить тренажёр</strong><span>Быстрый запуск и офлайн-доступ.</span></div><button type="button" class="wave93a-install-main">Установить</button><button type="button" class="wave93a-install-close" aria-label="Скрыть установку">×</button>'; node.querySelector('.wave93a-install-main').addEventListener('click', promptInstall); node.querySelector('.wave93a-install-close').addEventListener('click', dismissInstall); document.body.appendChild(node); }
    return node;
  }
  function syncInstallBanner(){
    var node = ensureInstallBanner();
    var iosHint = likelyIOS() && !state.installPrompt && !standalone();
    var allowed = compact() && !standalone() && !installDismissed() && (state.installPrompt || iosHint) && pageKey() !== 'disabled';
    node.classList.toggle('is-visible', !!allowed); node.setAttribute('aria-hidden', allowed ? 'false' : 'true');
    var span = node.querySelector('.wave93a-install-copy span'); var main = node.querySelector('.wave93a-install-main');
    if (span) span.textContent = iosHint ? 'Safari: Поделиться → На экран Домой.' : 'Быстрый запуск и офлайн-доступ.';
    if (main) main.textContent = iosHint ? 'Как?' : 'Установить';
  }
  function promptInstall(){
    if (state.installPrompt && typeof state.installPrompt.prompt === 'function') { var evt = state.installPrompt; state.installPrompt = null; Promise.resolve(evt.prompt()).then(function(){ return evt.userChoice; }).catch(function(){}).then(syncInstallBanner); return; }
    showTip(likelyIOS() ? 'Safari: Поделиться → На экран Домой' : 'Браузер пока не разрешил установку');
  }
  function bindInstall(){
    window.addEventListener('beforeinstallprompt', function(event){ event.preventDefault(); state.installPrompt = event; syncInstallBanner(); });
    window.addEventListener('appinstalled', function(){ state.installPrompt = null; syncInstallBanner(); showTip('Приложение установлено'); });
  }

  function ensureOfflineIndicator(){ var node = document.getElementById(OFFLINE_ID); if (!node) { node = document.createElement('div'); node.id = OFFLINE_ID; node.className = 'wave93a-offline-indicator wave93a-mobile-ui'; node.setAttribute('role','status'); node.setAttribute('aria-live','polite'); document.body.appendChild(node); } return node; }
  function syncOfflineIndicator(){
    var node = ensureOfflineIndicator(); var online = navigator.onLine !== false; clearTimeout(node.__wave93aTimer); node.classList.remove('is-online','is-offline');
    if (!online) { state.lastOffline = true; node.textContent = '● Офлайн: работаем из кэша'; node.classList.add('is-visible','is-offline'); }
    else if (state.lastOffline) { state.lastOffline = false; node.textContent = '● Снова онлайн'; node.classList.add('is-visible','is-online'); node.__wave93aTimer = setTimeout(function(){ node.classList.remove('is-visible','is-online'); }, 1800); }
    else node.classList.remove('is-visible');
  }

  function ensurePullIndicator(){ var node = document.getElementById(PULL_ID); if (!node) { node = document.createElement('div'); node.id = PULL_ID; node.className = 'wave93a-pull-indicator wave93a-mobile-ui'; node.setAttribute('aria-hidden','true'); node.textContent = '↻'; document.body.appendChild(node); } return node; }
  function canPullRefresh(){ return phone() && !state.refreshBusy && pageKey() !== 'disabled' && !blockingSession() && (window.scrollY || document.documentElement.scrollTop || 0) <= 2; }
  function refreshApp(){
    if (state.refreshBusy) return; state.refreshBusy = true; showTip('Обновляю…');
    safe('sw update', function(){ if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) navigator.serviceWorker.getRegistration().then(function(reg){ if (reg && reg.update) return reg.update(); }).catch(function(){}); });
    safe('refresh event', function(){ window.dispatchEvent(new CustomEvent('trainer:mobile-refresh', { detail: { wave: VERSION } })); });
    setTimeout(function(){ window.location.reload(); }, 180);
  }
  function bindPullToRefresh(){
    var indicator = null;
    document.addEventListener('touchstart', function(event){ if (!canPullRefresh() || event.touches.length !== 1 || interactiveTarget(event.target)) return; var t = event.touches[0]; state.pull = { x: t.clientX, y: t.clientY, armed: false }; indicator = ensurePullIndicator(); }, { passive: true });
    document.addEventListener('touchmove', function(event){
      if (!state.pull || !event.touches.length) return; var t = event.touches[0]; var dx = Math.abs(t.clientX - state.pull.x); var dy = t.clientY - state.pull.y;
      if (dx > 42 || dy < 8) return; if (!canPullRefresh()) { state.pull = null; return; } if (event.cancelable && dy > 16) event.preventDefault();
      var node = indicator || ensurePullIndicator(); state.pull.armed = dy > 86; node.classList.add('is-visible'); node.classList.toggle('is-armed', state.pull.armed); node.style.transform = 'translateX(-50%) translateY(' + Math.min(32, Math.max(0, dy - 44)) + 'px) scale(' + (state.pull.armed ? '1.05' : '1') + ')';
    }, { passive: false });
    document.addEventListener('touchend', function(){ if (!state.pull) return; var armed = state.pull.armed; state.pull = null; var node = indicator || ensurePullIndicator(); node.classList.remove('is-visible','is-armed'); node.style.transform = ''; if (armed) refreshApp(); }, { passive: true });
  }

  function ensureShareFab(){ var node = document.getElementById(SHARE_ID); if (!node) { node = document.createElement('button'); node.id = SHARE_ID; node.type = 'button'; node.className = 'wave93a-share-fab wave93a-mobile-ui'; node.setAttribute('aria-label','Поделиться страницей'); node.textContent = '↗'; node.addEventListener('click', shareCurrentPage); document.body.appendChild(node); } return node; }
  function syncShareFab(){ var node = ensureShareFab(); var show = compact() && pageKey() !== 'disabled' && !blockingSession(); node.classList.toggle('is-visible', !!show); }
  function fallbackCopy(text){
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function(resolve, reject){ try { var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly',''); ta.style.position = 'fixed'; ta.style.left = '-9999px'; document.body.appendChild(ta); ta.select(); var ok = document.execCommand('copy'); document.body.removeChild(ta); ok ? resolve() : reject(new Error('copy failed')); } catch (err) { reject(err); } });
  }
  function shareCurrentPage(){
    var payload = { title: document.title || 'Тренажёр', text: 'Тренажёр к диагностикам', url: window.location.href };
    if (navigator.share) { navigator.share(payload).then(function(){ showTip('Ссылка отправлена'); }).catch(function(err){ if (!err || err.name !== 'AbortError') showTip('Не получилось поделиться'); }); return; }
    fallbackCopy(payload.url).then(function(){ showTip('Ссылка скопирована'); }).catch(function(){ showTip('Скопируй ссылку из адресной строки'); });
  }

  function syncLandscape(){ if (document.body) document.body.classList.toggle('wave93a-landscape', !!(window.matchMedia && window.matchMedia('(orientation: landscape) and (max-height: 560px)').matches)); }
  function bindEvents(){
    ['resize','orientationchange','hashchange','popstate','online','offline','visibilitychange'].forEach(function(type){ window.addEventListener(type, function(){ safe(type, function(){ syncLandscape(); syncOfflineIndicator(); syncInstallBanner(); syncShareFab(); scheduleNav(); }); }, { passive: true }); });
    ['trainer:start','trainer:render','trainer:answer','trainer:end','trainer:screen','trainer:exam:render','trainer:exam:result'].forEach(function(type){ document.addEventListener(type, scheduleNav, false); });
    document.addEventListener('click', function(){ setTimeout(scheduleNav, 30); }, { passive: true });
  }

  function init(){
    if (!document.body) return;
    ensureViewportFit(); ensureStyle(); document.body.classList.add('wave93a-mobile-ready'); ensureBottomNav(); ensureInstallBanner(); ensureOfflineIndicator(); ensurePullIndicator(); ensureShareFab();
    bindInstall(); bindPullToRefresh(); bindEvents(); syncLandscape(); syncOfflineIndicator(); syncInstallBanner(); syncShareFab(); scheduleNav();
    window.__wave93aMobileLayer = { version: VERSION, booted: true, pageKey: pageKey, refresh: refreshApp, share: shareCurrentPage, status: function(){ return { compact: compact(), page: pageKey(), nav: !!document.getElementById(NAV_ID), installPrompt: !!state.installPrompt, online: navigator.onLine !== false, standalone: standalone(), landscape: document.body.classList.contains('wave93a-landscape') }; } };
  }
  ready(init);
})();
