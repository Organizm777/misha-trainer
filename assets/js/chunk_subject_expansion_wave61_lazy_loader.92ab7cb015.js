/* wave91: lazy loader for senior-school expansion */
(function(global){
  'use strict';
  if (!global || global.__wave91SeniorSchoolLazyLoader) return;
  global.__wave91SeniorSchoolLazyLoader = { version:'wave91', target:"./assets/js/chunk_subject_expansion_wave61_senior_school_10_11.61cb4ae0a9.js", loaded:false };
  function refreshAfterLoad(){
    global.__wave91SeniorSchoolLazyLoader.loaded = true;
    try { if (typeof global.refreshMain === 'function') global.refreshMain(); } catch(_err) {}
    try { if (typeof global.updateHeroMeta === 'function') global.updateHeroMeta(); } catch(_err2) {}
    try { if (typeof global.renderProg === 'function') global.renderProg(); } catch(_err3) {}
    try { if (global.__wave89dSimpleMode && typeof global.__wave89dSimpleMode.sync === 'function') global.__wave89dSimpleMode.sync(); } catch(_err4) {}
  }
  function load(attempt){
    var maxAttempts = 3;
    attempt = attempt || 1;
    if (global.wave61SeniorSchool) { refreshAfterLoad(); return; }
    global.__wave91SeniorSchoolLazyLoader.loading = true;
    var old = document.querySelector && document.querySelector('script[data-wave92b-senior-loader="1"]');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var script = document.createElement('script');
    script.src = global.__wave91SeniorSchoolLazyLoader.target;
    script.async = true;
    script.dataset.wave92bSeniorLoader = '1';
    script.onload = refreshAfterLoad;
    script.onerror = function(){
      if (attempt < maxAttempts) setTimeout(function(){ load(attempt + 1); }, 250 * attempt);
      else { global.__wave91SeniorSchoolLazyLoader.error = true; global.__wave91SeniorSchoolLazyLoader.loading = false; }
    };
    (document.head || document.documentElement || document.body).appendChild(script);
  }
  function schedule(){ setTimeout(load, 0); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once:true });
  else schedule();
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
