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
  function load(){
    if (global.wave61SeniorSchool || global.__wave91SeniorSchoolLazyLoader.loading) { refreshAfterLoad(); return; }
    global.__wave91SeniorSchoolLazyLoader.loading = true;
    var script = document.createElement('script');
    script.src = global.__wave91SeniorSchoolLazyLoader.target;
    script.async = true;
    script.onload = refreshAfterLoad;
    script.onerror = function(){ global.__wave91SeniorSchoolLazyLoader.error = true; };
    (document.head || document.documentElement || document.body).appendChild(script);
  }
  function schedule(){ setTimeout(load, 0); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once:true });
  else schedule();
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
