(() => {
  const STYLE_ID = 'wave23-a11y-style';
  const LIVE_ID = 'wave23-live';
  const SKIP_ID = 'wave23-skip-link';
  const MAIN_ID = 'wave23-main';
  const BTN_ATTR = 'data-wave23-button';
  const BTN_BOUND = 'data-wave23-button-bound';
  const DIALOG_ATTR = 'data-wave23-overlay';
  const INPUT_ATTR = 'data-wave23-input-bound';

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
    return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
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

  function setLandmarks(){
    const header = document.querySelector('header');
    if(header) header.setAttribute('role', 'banner');
    const footer = document.querySelector('footer');
    if(footer) footer.setAttribute('role', 'contentinfo');

    let main = document.getElementById(MAIN_ID) || document.querySelector('main');
    if(!main){
      main = document.querySelector('.scr.on .w') || document.querySelector('.scr.active .w') || document.querySelector('body > .w') || document.querySelector('body > div:not(.skip-link):not([id="'+LIVE_ID+'"])');
    }
    if(main && main !== document.body){
      if(!main.id) main.id = MAIN_ID;
      main.setAttribute('role', 'main');
      main.tabIndex = main.tabIndex || -1;
    }

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
    document.addEventListener('touchstart', () => { state.modality = 'touch'; }, true);
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
