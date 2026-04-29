/* wave91h: lazy payload loader for performance budget */
(function(global){
  'use strict';
  if (!global || global.__wave91hLazyPayloads) return;
  var MAP = {
  "5": [
    "./assets/js/chunk_grade_content_wave86l_content_balance_wave86t.0047d86915.js",
    "./assets/js/chunk_subject_expansion_wave60_biology_history_english_5_8.ecfc9c5b63.js"
  ],
  "6": [
    "./assets/js/chunk_subject_expansion_wave60_biology_history_english_5_8.ecfc9c5b63.js"
  ],
  "7": [
    "./assets/js/chunk_subject_expansion_wave89c_secondary_stem_7_9.ea7e74deee.js",
    "./assets/js/chunk_subject_expansion_wave60_biology_history_english_5_8.ecfc9c5b63.js"
  ],
  "8": [
    "./assets/js/chunk_subject_expansion_wave38_content_consolidation.c6477aad95.js",
    "./assets/js/chunk_subject_expansion_wave89c_secondary_stem_7_9.ea7e74deee.js",
    "./assets/js/chunk_subject_expansion_wave60_biology_history_english_5_8.ecfc9c5b63.js"
  ],
  "9": [
    "./assets/js/chunk_subject_expansion_wave89c_secondary_stem_7_9.ea7e74deee.js"
  ],
  "11": [
    "./assets/js/chunk_subject_expansion_wave86m_gap_balance_grade11_wave87d.4f8f37e921.js"
  ]
};
  function grade(){ return String(global.GRADE_NUM || global.GRADE_NO || (location.pathname.match(/grade(\d+)_/)||[])[1] || ''); }
  function refresh(){
    try { if (typeof global.refreshMain === 'function') global.refreshMain(); } catch(_){}
    try { if (typeof global.updateHeroMeta === 'function') global.updateHeroMeta(); } catch(_){}
    try { if (typeof global.renderProg === 'function') global.renderProg(); } catch(_){}
    try { if (typeof global.render === 'function') global.render(); } catch(_){}
    try { if (global.__wave89dSimpleMode && typeof global.__wave89dSimpleMode.sync === 'function') global.__wave89dSimpleMode.sync(); } catch(_){}
  }
  function present(src){
    var name = String(src || '').split('/').pop().replace(/\.[0-9a-f]{10}(?=\.js$)/, '');
    var stem = name.replace(/\.js$/, '');
    return !!document.querySelector('script[src*="' + stem + '"]');
  }
  function loadOne(src, done){
    if (!src || present(src)) return done();
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.fetchPriority = 'low';
    s.onload = function(){ done(); };
    s.onerror = function(){ state.errors.push(src); done(); };
    (document.head || document.documentElement || document.body).appendChild(s);
  }
  var state = global.__wave91hLazyPayloads = { version:'wave91h', grade:grade(), loaded:[], errors:[], map:MAP };
  function run(){
    var list = (MAP[grade()] || []).slice();
    function next(){
      var src = list.shift();
      if (!src) { state.done = true; refresh(); return; }
      loadOne(src, function(){ state.loaded.push(src); refresh(); next(); });
    }
    setTimeout(next, 0);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once:true });
  else run();
})(typeof globalThis !== 'undefined' ? globalThis : window);
