(function(){
  'use strict';
  var WAVE = 'wave86r';
  var STYLE_ID = 'wave86r-theory-achievements-style';

  function hasReducedMotion(){
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch(e){ return false; }
  }
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }
  function stripTags(html){
    return String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi,' ')
      .replace(/<style[\s\S]*?<\/style>/gi,' ')
      .replace(/<[^>]+>/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }
  function gradeLabel(){
    var g = String(window.GRADE_NUM || '').trim();
    return g ? g + ' класс' : 'текущий класс';
  }
  function getSubjects(){
    try { return Array.isArray(SUBJ) ? SUBJ : []; }
    catch(e){ return []; }
  }
  function getProgress(){
    try { return (typeof PROG !== 'undefined' && PROG && typeof PROG === 'object') ? PROG : {}; }
    catch(e){ return {}; }
  }
  function getDaily(){
    try { return (typeof DAILY !== 'undefined' && DAILY && typeof DAILY === 'object') ? DAILY : {}; }
    catch(e){ return {}; }
  }
  function getStreak(){
    try { return (typeof STR !== 'undefined' && STR && typeof STR === 'object') ? STR : {}; }
    catch(e){ return {}; }
  }
  function getTPStats(subjectId, topicId){
    var p = getProgress();
    return p[subjectId] && p[subjectId][topicId] ? p[subjectId][topicId] : {ok:0, err:0};
  }
  function topicStars(subjectId, topicId){
    var t = getTPStats(subjectId, topicId);
    var total = (+t.ok || 0) + (+t.err || 0);
    var pct = total ? ((+t.ok || 0) / total) : 0;
    if(total >= 10 && pct >= .85) return 3;
    if(total >= 6 && pct >= .70) return 2;
    if(total >= 3 && pct >= .50) return 1;
    return 0;
  }
  function progressSummary(){
    var summary = {
      subjects:getSubjects().length,
      topics:0,
      attemptedTopics:0,
      masteredTopics:0,
      totalStars:0,
      activeSubjects:0,
      strongSubjects:0,
      recoveredTopics:0,
      totalOk:0,
      totalErr:0,
      weeklyBest:0
    };
    getSubjects().forEach(function(subject){
      var subjectOk = 0;
      var subjectErr = 0;
      (subject.tops || []).forEach(function(topic){
        summary.topics++;
        var tp = getTPStats(subject.id, topic.id);
        var ok = +tp.ok || 0;
        var err = +tp.err || 0;
        var total = ok + err;
        var stars = topicStars(subject.id, topic.id);
        subjectOk += ok;
        subjectErr += err;
        summary.totalOk += ok;
        summary.totalErr += err;
        summary.totalStars += stars;
        if(total > 0) summary.attemptedTopics++;
        if(stars >= 3) summary.masteredTopics++;
        if(err > 0 && total >= 5 && ok / total >= .8) summary.recoveredTopics++;
      });
      var subjectTotal = subjectOk + subjectErr;
      if(subjectTotal > 0) summary.activeSubjects++;
      if(subjectTotal >= 10 && subjectOk / subjectTotal >= .7) summary.strongSubjects++;
    });
    try {
      var raw = localStorage.getItem('trainer_wave86p_results_' + (window.GRADE_NUM || '10')) || '[]';
      var rows = JSON.parse(raw);
      if(Array.isArray(rows)) rows.forEach(function(row){
        if(row && row.mode === 'weekly') summary.weeklyBest = Math.max(summary.weeklyBest, +row.pct || 0);
      });
    } catch(e) {}
    return summary;
  }
  function makeFallbackTheory(topic, subject){
    var tn = esc(topic && topic.nm || 'Тема');
    var sn = esc(subject && subject.nm || 'предмет');
    return '<div class="tcard wave86r-generated-theory wave89a-theory-stub">' +
      '<h3>📖 Теория в разработке</h3>' +
      '<p>Для темы <b>' + tn + '</b> по предмету <b>' + sn + '</b> пока не добавлена отдельная шпаргалка. Тренажёр уже работает, а подробная теория будет расширена в следующих волнах.</p>' +
      '<ul>' +
        '<li>Сначала прочитайте формулировку вопроса и выделите ключевые слова.</li>' +
        '<li>После ошибки откройте подсказку и разберите правильный ответ шаг за шагом.</li>' +
        '<li>Повторите тему ещё раз — так проще закрепить правило до появления полной шпаргалки.</li>' +
      '</ul>' +
      '<div class="ex">Статус: временный fallback вместо скрытой кнопки теории.</div>' +
    '</div>';
  }
  function normalizeTopicTheory(){
    getSubjects().forEach(function(subject){
      (subject.tops || []).forEach(function(topic){
        if(!topic) return;
        if(!topic.th || !stripTags(topic.th)) { topic.th = makeFallbackTheory(topic, subject); topic.__wave89aTheoryFallback = true; }
        else if (topic.__wave89aTheoryFallback) delete topic.__wave89aTheoryFallback;
      });
    });
  }
  function injectStyles(){
    if(document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.wave86r-theory{margin:-2px 0 8px 24px;border:1px solid var(--border);border-radius:12px;background:var(--abg);overflow:hidden}',
      '.wave86r-theory>summary{list-style:none;cursor:pointer;padding:9px 12px;font-size:12px;font-weight:800;color:var(--accent);display:flex;align-items:center;justify-content:space-between;gap:8px}',
      '.wave86r-theory>summary::-webkit-details-marker{display:none}',
      '.wave86r-theory>summary:after{content:"⌄";font-size:13px;opacity:.7;transition:transform .18s}',
      '.wave86r-theory[open]>summary:after{transform:rotate(180deg)}',
      '.wave86r-theory-body{padding:0 12px 12px;font-size:12px;line-height:1.55;color:var(--text)}',
      '.wave86r-theory-body .tcard{margin:0;padding:12px;background:transparent!important;border:none!important}',
      '.wave86r-theory-body h3{font-size:13px;margin-bottom:6px}',
      '.wave86r-theory-body p,.wave86r-theory-body li{font-size:12px;line-height:1.55}',
      '.wave86r-theory-actions{display:flex;gap:8px;margin-top:8px}',
      '.wave86r-theory-actions button{flex:1;padding:8px;border:none;border-radius:9px;background:var(--text);color:var(--bg);font-weight:800;font-size:12px;font-family:Golos Text,system-ui,sans-serif;cursor:pointer}',
      '.wave86r-toast{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0));transform:translateX(-50%) translateY(12px);z-index:100000;max-width:min(420px,calc(100vw - 28px));padding:12px 14px;border-radius:16px;background:var(--text);color:var(--bg);font-weight:900;font-size:13px;box-shadow:0 14px 34px rgba(0,0,0,.22);opacity:0;pointer-events:none}',
      '.wave86r-toast.show{animation:wave86rToast 2.2s ease forwards}',
      '@keyframes wave86rToast{0%{opacity:0;transform:translateX(-50%) translateY(12px) scale(.96)}14%,82%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(8px) scale(.98)}}',
      '.wave86r-achievement-note{display:inline-flex;align-items:center;gap:6px;margin-left:8px;padding:2px 8px;border-radius:999px;background:var(--ybg);color:var(--yellow);font-size:10px;font-weight:900}',
      '@media(prefers-reduced-motion:reduce){.wave86r-toast.show{animation:none;opacity:1}.wave86r-theory>summary:after{transition:none}}'
    ].join('\n');
    document.head.appendChild(style);
  }
  function toast(message){
    try {
      injectStyles();
      var old = document.querySelector('.wave86r-toast');
      if(old) old.remove();
      var el = document.createElement('div');
      el.className = 'wave86r-toast';
      el.setAttribute('role','status');
      el.textContent = message;
      document.body.appendChild(el);
      requestAnimationFrame(function(){ el.classList.add('show'); });
      setTimeout(function(){ if(el && el.parentNode) el.remove(); }, hasReducedMotion() ? 1600 : 2400);
    } catch(e) {}
  }
  function topicByButtonText(subject, text){
    var clean = String(text || '').replace(/\s+/g,' ').trim();
    var best = null;
    (subject.tops || []).forEach(function(topic){
      if(best) return;
      if(clean.indexOf(topic.nm) !== -1) best = topic;
    });
    return best;
  }
  function enhanceTopicList(){
    try {
      injectStyles();
      normalizeTopicTheory();
      if(typeof cS === 'undefined' || !cS || !document.getElementById('tl')) return;
      var list = document.getElementById('tl');
      if(list.getAttribute('data-wave86r-subject') === cS.id && list.querySelector('.wave86r-theory')) return;
      list.setAttribute('data-wave86r-subject', cS.id);
      Array.prototype.slice.call(list.querySelectorAll('.tbtn')).forEach(function(btn){
        if(btn.getAttribute('data-wave86r-theory-bound')) return;
        var txt = btn.textContent || '';
        if(/Всё вперемешку|Диагностика/.test(txt)) return;
        var topic = topicByButtonText(cS, txt);
        if(!topic) return;
        btn.setAttribute('data-wave86r-theory-bound','1');
        var details = document.createElement('details');
        details.className = 'wave86r-theory';
        details.innerHTML = '<summary>📖 Теория по теме</summary>' +
          '<div class="wave86r-theory-body">' + (topic.th || makeFallbackTheory(topic, cS)) +
          '<div class="wave86r-theory-actions"><button type="button">Открыть тему</button></div></div>';
        var goBtn = details.querySelector('button');
        if(goBtn) goBtn.addEventListener('click', function(ev){
          ev.preventDefault();
          ev.stopPropagation();
          cT = topic;
          mix = false;
          var tc = document.getElementById('tc');
          if(tc) tc.innerHTML = topic.th || makeFallbackTheory(topic, cS);
          if(typeof go === 'function') go('theory');
        });
        btn.insertAdjacentElement('afterend', details);
      });
    } catch(e) {}
  }
  function patchOpenSubj(){
    try {
      if(typeof openSubj !== 'function' || openSubj.__wave86rPatched) return;
      var original = openSubj;
      var patched = function(){
        normalizeTopicTheory();
        var result = original.apply(this, arguments);
        setTimeout(enhanceTopicList, 0);
        return result;
      };
      patched.__wave86rPatched = true;
      openSubj = patched;
      window.openSubj = patched;
    } catch(e) {}
  }
  function registerAchievements(){
    try {
      if(typeof BADGES === 'undefined' || !Array.isArray(BADGES) || BADGES.__wave86rRegistered) return;
      var defs = [
        {id:'w86r_topic_start',icon:'🌱',name:'Тема начата',desc:'3+ ответа в одной теме',check:function(){return progressSummary().attemptedTopics >= 1;}},
        {id:'w86r_topic_master',icon:'⭐',name:'Тема на 3 звезды',desc:'10+ ответов и 85%+ в теме',check:function(){return progressSummary().masteredTopics >= 1;}},
        {id:'w86r_topic_3',icon:'⭐⭐⭐',name:'Три сильные темы',desc:'3 темы на 3 звезды',check:function(){return progressSummary().masteredTopics >= 3;}},
        {id:'w86r_topic_10',icon:'🌟',name:'Десятка тем',desc:'10 тем на 3 звезды',check:function(){return progressSummary().masteredTopics >= 10;}},
        {id:'w86r_stars_25',icon:'✨',name:'25 звёзд',desc:'Набери 25 звёзд за темы',check:function(){return progressSummary().totalStars >= 25;}},
        {id:'w86r_subject_1',icon:'🎯',name:'Сильный предмет',desc:'10+ ответов и 70%+ в предмете',check:function(){return progressSummary().strongSubjects >= 1;}},
        {id:'w86r_subject_3',icon:'🧭',name:'Три предмета',desc:'3 предмета с устойчивым результатом',check:function(){return progressSummary().strongSubjects >= 3;}},
        {id:'w86r_balanced',icon:'🌈',name:'Кругозор',desc:'Есть ответы по каждому предмету класса',check:function(){var s=progressSummary();return s.subjects > 0 && s.activeSubjects >= s.subjects;}},
        {id:'w86r_clean10',icon:'🧼',name:'Чистая десятка',desc:'10 верных подряд в дневном рывке',check:function(){var d=getDaily();return (+d.pure || 0) >= 10;}},
        {id:'w86r_accuracy80',icon:'💎',name:'Точная рука',desc:'50+ ответов с точностью 80%+',check:function(){var s=progressSummary(), total=s.totalOk+s.totalErr;return total >= 50 && s.totalOk / total >= .8;}},
        {id:'w86r_recovery',icon:'🛠️',name:'Ошибка исправлена',desc:'После ошибок тема доведена до 80%+',check:function(){return progressSummary().recoveredTopics >= 1;}},
        {id:'w86r_weekly',icon:'🗓️',name:'Weekly герой',desc:'80%+ в weekly challenge',check:function(){return progressSummary().weeklyBest >= 80;}}
      ];
      var known = Object.create(null);
      BADGES.forEach(function(b){ known[b.id] = true; });
      defs.forEach(function(def){ if(!known[def.id]) BADGES.push(def); });
      BADGES.__wave86rRegistered = true;
    } catch(e) {}
  }
  function patchCheckBadges(){
    try {
      if(typeof checkBadges !== 'function' || checkBadges.__wave86rPatched) return;
      var original = checkBadges;
      var patched = function(){
        var before = [];
        try { before = (getStreak().badges || []).slice(); } catch(e) {}
        var result = original.apply(this, arguments);
        try {
          var after = getStreak().badges || [];
          var gained = after.filter(function(id){ return before.indexOf(id) === -1 && /^w86r_/.test(id); });
          if(gained.length){
            var names = [];
            if(typeof BADGES !== 'undefined') gained.forEach(function(id){
              var b = BADGES.find(function(x){ return x.id === id; });
              if(b) names.push(b.icon + ' ' + b.name);
            });
            toast('Новая ачивка: ' + (names[0] || 'достижение'));
          }
        } catch(e) {}
        return result;
      };
      patched.__wave86rPatched = true;
      checkBadges = patched;
      window.checkBadges = patched;
    } catch(e) {}
  }
  function patchAnswerReaction(){
    try {
      if(typeof ans !== 'function' || ans.__wave86rPatched) return;
      var original = ans;
      var patched = function(index){
        var wasOpen = true;
        var isCorrect = false;
        try {
          wasOpen = (typeof sel === 'undefined' || sel === null);
          if(wasOpen && typeof prob !== 'undefined' && prob && prob.options) isCorrect = prob.options[index] === prob.answer;
        } catch(e) {}
        var result = original.apply(this, arguments);
        try {
          if(wasOpen){
            if(isCorrect){
              if(typeof st !== 'undefined' && st && st.streak && st.streak % 5 === 0){
                toast('🔥 Серия ' + st.streak + ': держишь темп!');
                if(!hasReducedMotion() && typeof confetti === 'function') confetti(18);
              } else {
                toast('✅ Верно!');
              }
            } else {
              toast('📘 Ошибка — смотри разбор ниже');
            }
          }
        } catch(e) {}
        return result;
      };
      patched.__wave86rPatched = true;
      ans = patched;
      window.ans = patched;
    } catch(e) {}
  }
  function exposeAudit(){
    window.wave86rTheoryAchievements = {
      wave: WAVE,
      normalizeTopicTheory: normalizeTopicTheory,
      enhanceTopicList: enhanceTopicList,
      progressSummary: progressSummary,
      auditSnapshot: function(){
        normalizeTopicTheory();
        var subjects = getSubjects();
        var missingTheory = 0;
        var fallbackTopics = 0;
        subjects.forEach(function(subject){
          (subject.tops || []).forEach(function(topic){
            if(!topic.th || !stripTags(topic.th)) missingTheory++;
            if(topic.__wave89aTheoryFallback) fallbackTopics++;
          });
        });
        var badgeCount = 0;
        try { badgeCount = BADGES.filter(function(b){ return /^w86r_/.test(b.id); }).length; } catch(e) {}
        return {
          wave: WAVE,
          subjects: subjects.length,
          topics: progressSummary().topics,
          missingTheory: missingTheory,
          fallbackTopics: fallbackTopics,
          addedAchievements: badgeCount,
          openSubjPatched: typeof openSubj === 'function' && !!openSubj.__wave86rPatched,
          ansPatched: typeof ans === 'function' && !!ans.__wave86rPatched,
          checkBadgesPatched: typeof checkBadges === 'function' && !!checkBadges.__wave86rPatched
        };
      }
    };
  }
  function boot(){
    injectStyles();
    normalizeTopicTheory();
    registerAchievements();
    patchCheckBadges();
    patchAnswerReaction();
    patchOpenSubj();
    exposeAudit();
    setTimeout(function(){
      try { if(typeof checkBadges === 'function') checkBadges(); } catch(e) {}
      enhanceTopicList();
    }, 0);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
