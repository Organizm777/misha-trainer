/* wave87n grade runtime features bundle: exam/pvp/theory/gamification. */

;/* ---- chunk_roadmap_wave86r_theory_achievements.js ---- */
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

;/* ---- chunk_roadmap_wave86p_exam_challenge.js ---- */
/* --- wave86p: exam mode + weekly challenge + local leaderboards --- */
(function(){
  if (typeof window === 'undefined') return;
  if (window.wave86pChallenge) return;

  var VERSION = 'wave86p';
  var CARD_ID = 'wave86p-challenge-card';
  var STYLE_ID = 'wave86p-challenge-style';
  var MODAL_ID = 'wave86p-modal';
  var COUNT = 20;
  var EXAM_SECONDS = 10 * 60;

  function gradeKey(){ return String(window.GRADE_NUM || ''); }
  function storeKey(){ return 'trainer_wave86p_results_' + gradeKey(); }
  function progressKey(){ return 'trainer_progress_' + gradeKey(); }
  function streakKey(){ return 'trainer_streak_' + gradeKey(); }
  function dailyKey(){ return 'trainer_daily_' + gradeKey(); }
  function activityKey(){ return 'trainer_activity_' + gradeKey(); }
  function weekId(ts){
    var d = new Date(ts || Date.now());
    var target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var day = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - day);
    var yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    var week = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
    return target.getUTCFullYear() + '-W' + String(week).padStart(2, '0');
  }
  function today(){ return new Date().toISOString().slice(0, 10); }
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function toNum(v){ return Number(v || 0) || 0; }
  function pct(ok, total){ return total ? Math.round(ok / total * 100) : 0; }
  function markFromPct(value){ return value >= 85 ? 5 : value >= 65 ? 4 : value >= 45 ? 3 : 2; }
  function declNum(n, one, two, five){
    n = Math.abs(Number(n) || 0);
    var mod100 = n % 100;
    var mod10 = n % 10;
    if (mod100 > 10 && mod100 < 20) return five;
    if (mod10 > 1 && mod10 < 5) return two;
    if (mod10 === 1) return one;
    return five;
  }
  function safeRead(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(_) { return fallback; }
  }
  function safeWrite(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(_) {}
  }
  function playerName(){
    try {
      if (typeof window.getPlayerName === 'function') return window.getPlayerName() || 'Ученик';
      return localStorage.getItem('trainer_player_name') || 'Ученик';
    } catch(_) { return 'Ученик'; }
  }
  function hashSeed(seed){
    var str = String(seed == null ? '' : seed);
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function seededRandomFactory(seed){
    var state = hashSeed(seed) || 123456789;
    return function(){
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }
  function stableShuffle(list, seed){
    var out = (list || []).slice();
    var rnd = seededRandomFactory(seed);
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }
  function withSeed(seed, fn){
    var old = Math.random;
    Math.random = seededRandomFactory(seed);
    try { return fn(); }
    finally { Math.random = old; }
  }
  function optionFillers(answer){
    var a = String(answer == null ? '' : answer);
    var out = [];
    function push(v){ v = String(v); if (v && v !== a && out.indexOf(v) === -1) out.push(v); }
    var n = Number(a.replace(',', '.'));
    if (isFinite(n) && a.trim() !== '') {
      [-2, -1, 1, 2, 3, 5].forEach(function(delta){ push(String(n + delta)); });
      if (n % 1) [-0.5, -0.1, 0.1, 0.5].forEach(function(delta){ push(String(+(n + delta).toFixed(2))); });
    }
    ['верно', 'неверно', 'нельзя определить', 'оба варианта', 'нет правильного ответа', 'другое значение', 'зависит от условия'].forEach(push);
    return out;
  }
  function normalizeQuestion(row, meta, seed){
    if (!row || typeof row !== 'object') return null;
    var q = row.question != null ? row.question : row.q;
    var answer = row.answer != null ? row.answer : row.a;
    if (q == null || answer == null) return null;
    var opts = [];
    if (Array.isArray(row.options)) opts = row.options.slice();
    else if (Array.isArray(row.opts)) opts = row.opts.slice();
    else if (Array.isArray(row.o)) opts = [answer].concat(row.o);
    opts.unshift(answer);
    var seen = {};
    opts = opts.filter(function(v){
      var key = String(v);
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
    var fillers = optionFillers(answer);
    var k = 0;
    while (opts.length < 4 && k < fillers.length) {
      if (opts.indexOf(fillers[k]) === -1) opts.push(fillers[k]);
      k++;
    }
    while (opts.length < 4) opts.push('вариант ' + opts.length);
    opts = stableShuffle(opts.slice(0, 4), seed + ':opts');
    return {
      question: String(q),
      answer: String(answer),
      options: opts,
      hint: row.hint || row.h || 'Разбери правило в теории темы и попробуй похожий вопрос ещё раз.',
      ex: row.ex || row.explain || row.explanation || '',
      code: row.code || null,
      tag: row.tag || (meta.topic && meta.topic.nm) || 'Тема',
      subjectId: meta.subject.id,
      subjectName: meta.subject.nm,
      topicId: meta.topic.id,
      topicName: meta.topic.nm,
      color: row.color || meta.subject.cl || 'var(--accent)',
      bg: row.bg || meta.subject.bg || 'var(--abg)'
    };
  }
  function unlocked(subject){
    if (!subject || !subject.locked) return true;
    var s = safeRead(streakKey(), {});
    return toNum(s.totalOk) >= toNum(subject.unlockAt);
  }
  function subjects(){
    var list = Array.isArray(window.SUBJ) ? window.SUBJ : [];
    return list.filter(function(s){ return s && !s.hidden && unlocked(s) && Array.isArray(s.tops); });
  }
  function topicPool(subjectId){
    var out = [];
    subjects().forEach(function(subject){
      if (subjectId && subject.id !== subjectId) return;
      (subject.tops || []).forEach(function(topic){
        if (topic && typeof topic.gen === 'function') out.push({ subject: subject, topic: topic });
      });
    });
    return out;
  }
  function buildDeck(mode, subjectId, count, fixedSeed){
    var pool = topicPool(subjectId);
    count = count || COUNT;
    if (!pool.length) return [];
    var seed = fixedSeed || [VERSION, gradeKey(), mode, subjectId || 'all', mode === 'weekly' ? weekId() : Date.now()].join(':');
    pool = stableShuffle(pool, seed + ':pool');
    var deck = [];
    var extras = [];
    var seen = {};
    var guard = 0;
    while (deck.length < count && guard < count * 12) {
      var meta = pool[guard % pool.length];
      var qSeed = seed + ':q:' + guard + ':' + meta.subject.id + ':' + meta.topic.id;
      var raw = null;
      try { raw = withSeed(qSeed, function(){ return meta.topic.gen(); }); } catch(_) { raw = null; }
      var item = normalizeQuestion(raw, meta, qSeed);
      if (item) {
        var key = item.question + '|' + item.answer;
        if (!seen[key]) { seen[key] = true; deck.push(item); }
        else { extras.push(item); }
      }
      guard++;
    }
    while (deck.length < count && extras.length) deck.push(extras.shift());
    return deck;
  }
  function readResults(){
    var rows = safeRead(storeKey(), []);
    return Array.isArray(rows) ? rows : [];
  }
  function saveResult(entry){
    var rows = readResults();
    rows.unshift(entry);
    safeWrite(storeKey(), rows.slice(0, 120));
  }
  function updateProgress(deck, answers){
    var prog = safeRead(progressKey(), {});
    deck.forEach(function(q, i){
      if (!q || !q.subjectId || !q.topicId) return;
      prog[q.subjectId] = prog[q.subjectId] || {};
      prog[q.subjectId][q.topicId] = prog[q.subjectId][q.topicId] || { ok:0, err:0 };
      var row = prog[q.subjectId][q.topicId];
      if (answers[i] === q.answer) row.ok = toNum(row.ok) + 1;
      else row.err = toNum(row.err) + 1;
      row.last = new Date().toLocaleDateString('ru-RU');
    });
    safeWrite(progressKey(), prog);
  }
  function updateDaily(ok, err){
    var d = safeRead(dailyKey(), { date: today(), ok:0, err:0, pure:0, subjs:{} });
    if (!d || typeof d !== 'object' || d.date !== today()) d = { date: today(), ok:0, err:0, pure:0, subjs:{} };
    d.ok = toNum(d.ok) + ok;
    d.err = toNum(d.err) + err;
    if (err === 0) d.pure = toNum(d.pure) + ok;
    safeWrite(dailyKey(), d);
    var a = safeRead(activityKey(), []);
    if (!Array.isArray(a)) a = [];
    var row = a.filter(function(x){ return x && x.date === today(); })[0];
    if (!row) { row = { date: today(), ok:0, err:0, pure:0, total:0 }; a.push(row); }
    row.ok = toNum(row.ok) + ok;
    row.err = toNum(row.err) + err;
    row.total = toNum(row.ok) + toNum(row.err);
    if (err === 0) row.pure = toNum(row.pure) + ok;
    a.sort(function(x, y){ return String(x.date).localeCompare(String(y.date)); });
    safeWrite(activityKey(), a.slice(-365));
  }
  function updateStreakTotals(ok, total){
    var s = safeRead(streakKey(), {});
    if (!s || typeof s !== 'object') s = {};
    s.totalQs = toNum(s.totalQs) + total;
    s.totalOk = toNum(s.totalOk) + ok;
    s.badges = Array.isArray(s.badges) ? s.badges : [];
    safeWrite(streakKey(), s);
  }
  function css(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '' +
      '.w86p-card{margin:12px 0;padding:14px;border-radius:16px;background:linear-gradient(135deg,rgba(37,99,235,.12),rgba(124,58,237,.10));border:1px solid rgba(37,99,235,.18)}' +
      '.w86p-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}.w86p-icon{font-size:24px}.w86p-title{font-weight:900;font-size:14px;font-family:Unbounded,system-ui,sans-serif}.w86p-sub{font-size:11px;color:var(--muted);margin-top:2px;line-height:1.35}.w86p-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.w86p-btn{border:none;border-radius:12px;padding:10px 8px;background:var(--card);color:var(--text);border:1px solid var(--border);font-size:12px;font-weight:800;cursor:pointer;font-family:Golos Text,system-ui,sans-serif}.w86p-btn.primary{background:var(--accent);color:#fff;border-color:var(--accent)}' +
      '.w86p-mask{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto}.w86p-box{background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:20px;max-width:560px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:0 20px 50px rgba(0,0,0,.35);padding:18px}.w86p-top{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}.w86p-close{margin-left:auto;border:none;background:transparent;color:var(--muted);font-size:24px;line-height:1;cursor:pointer}.w86p-meta{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.w86p-pill{border-radius:999px;background:var(--abg);color:var(--muted);font-size:11px;font-weight:800;padding:5px 8px}.w86p-progress{height:8px;background:var(--abg);border-radius:999px;overflow:hidden;margin:10px 0}.w86p-fill{height:100%;background:var(--accent);border-radius:999px}.w86p-q{padding:14px;border-radius:14px;background:var(--abg);margin:12px 0}.w86p-tag{display:inline-flex;margin-bottom:8px;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:900}.w86p-qtext{font-size:16px;font-weight:800;line-height:1.45}.w86p-code{white-space:pre-wrap;font-family:JetBrains Mono,monospace;font-size:12px;background:rgba(0,0,0,.08);padding:10px;border-radius:10px;margin-top:8px}.w86p-options{display:grid;gap:8px}.w86p-opt{display:flex;align-items:center;gap:10px;text-align:left;border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:13px;padding:12px;cursor:pointer;font-weight:700;font-family:Golos Text,system-ui,sans-serif}.w86p-opt .k{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:var(--abg);font-weight:900}.w86p-opt.ok{border-color:var(--green);background:var(--gbg)}.w86p-opt.no{border-color:var(--red);background:var(--rbg)}.w86p-opt.dim{opacity:.62}.w86p-next{width:100%;margin-top:12px}.w86p-breakdown{display:grid;gap:8px;margin:12px 0}.w86p-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px}.w86p-row b{flex:1}.w86p-score{font-family:Unbounded,system-ui,sans-serif;font-size:40px;font-weight:900;text-align:center;margin:8px 0}.w86p-subject-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.w86p-lb-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.w86p-lb-tabs button{border:1px solid var(--border);background:var(--abg);color:var(--text);border-radius:999px;padding:6px 9px;font-size:11px;font-weight:800;cursor:pointer}.w86p-empty{text-align:center;color:var(--muted);font-size:13px;padding:24px 8px}' +
      '@media(max-width:520px){.w86p-actions,.w86p-subject-grid{grid-template-columns:1fr}.w86p-qtext{font-size:15px}}';
    document.head.appendChild(style);
  }
  function modal(inner){
    closeModal();
    css();
    var mask = document.createElement('div');
    mask.id = MODAL_ID;
    mask.className = 'w86p-mask';
    mask.setAttribute('role', 'dialog');
    mask.setAttribute('aria-modal', 'true');
    mask.innerHTML = '<div class="w86p-box">' + inner + '</div>';
    mask.addEventListener('click', function(ev){ if (ev.target === mask) confirmClose(); });
    document.body.appendChild(mask);
    var focus = mask.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (focus && focus.focus) setTimeout(function(){ focus.focus(); }, 30);
    return mask;
  }
  function closeModal(){
    var old = document.getElementById(MODAL_ID);
    if (old) old.remove();
  }
  function confirmClose(){
    if (window.__wave86pState && window.__wave86pState.running && !window.__wave86pState.finished) {
      if (!confirm('Завершить текущий режим? Результат этой попытки не сохранится.')) return;
      clearInterval(window.__wave86pState.timer);
    }
    window.__wave86pState = null;
    closeModal();
  }
  function renderCard(){
    css();
    if (!subjects().length) return;
    var old = document.getElementById(CARD_ID);
    if (old) old.remove();
    var anchor = document.getElementById('daily-meter') || document.getElementById('sg');
    if (!anchor || !anchor.parentNode) return;
    var best = readResults().filter(function(r){ return r && r.mode === 'weekly' && r.weekId === weekId(); })
      .sort(function(a, b){ return toNum(b.pct) - toNum(a.pct); })[0];
    var card = document.createElement('div');
    card.id = CARD_ID;
    card.className = 'w86p-card';
    card.innerHTML = '<div class="w86p-head"><div class="w86p-icon">🏁</div><div style="flex:1"><div class="w86p-title">Экзамен и weekly challenge</div><div class="w86p-sub">20 фиксированных вопросов, таймер для экзамена, оценка и локальные рейтинги по классу/предмету.' + (best ? ' Лучший weekly этой недели: ' + best.pct + '%.' : '') + '</div></div></div>' +
      '<div class="w86p-actions"><button class="w86p-btn primary" type="button" data-w86p="weekly">Еженедельный вызов</button><button class="w86p-btn" type="button" data-w86p="exam">Экзамен 20</button><button class="w86p-btn" type="button" data-w86p="leaderboard">Рейтинги</button></div>';
    card.querySelector('[data-w86p="weekly"]').addEventListener('click', function(){ startRun('weekly', ''); });
    card.querySelector('[data-w86p="exam"]').addEventListener('click', showExamPicker);
    card.querySelector('[data-w86p="leaderboard"]').addEventListener('click', function(){ showLeaderboards('all'); });
    anchor.parentNode.insertBefore(card, anchor.nextSibling);
  }
  function topHtml(title, subtitle){
    return '<div class="w86p-top"><div><div class="w86p-title">' + esc(title) + '</div><div class="w86p-sub">' + esc(subtitle || '') + '</div></div><button class="w86p-close" type="button" aria-label="Закрыть">×</button></div>';
  }
  function showExamPicker(){
    var list = subjects();
    var buttons = '<button class="w86p-btn primary" type="button" data-subj="">Все предметы</button>' + list.map(function(s){
      return '<button class="w86p-btn" type="button" data-subj="' + esc(s.id) + '">' + esc((s.ic || '') + ' ' + s.nm) + '</button>';
    }).join('');
    var mask = modal(topHtml('Экзамен 20', 'Выбери предмет. Набор фиксируется на старте, время — 10 минут, оценка показывается в конце.') + '<div class="w86p-subject-grid">' + buttons + '</div>');
    mask.querySelector('.w86p-close').addEventListener('click', confirmClose);
    Array.prototype.forEach.call(mask.querySelectorAll('[data-subj]'), function(btn){
      btn.addEventListener('click', function(){ startRun('exam', btn.getAttribute('data-subj') || ''); });
    });
  }
  function fmt(sec){
    sec = Math.max(0, toNum(sec));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }
  function startRun(mode, subjectId){
    var subject = subjectId ? subjects().filter(function(s){ return s.id === subjectId; })[0] : null;
    var deck = buildDeck(mode, subjectId, COUNT);
    if (deck.length < 4) {
      modal(topHtml('Не хватает вопросов', 'Для выбранного набора нет достаточного числа генераторов.') + '<div class="w86p-empty">Попробуй «Все предметы» или другой предмет.</div><button class="w86p-btn primary" style="width:100%" type="button" data-close>Понятно</button>');
      document.querySelector('#' + MODAL_ID + ' [data-close]').addEventListener('click', closeModal);
      document.querySelector('#' + MODAL_ID + ' .w86p-close').addEventListener('click', confirmClose);
      return;
    }
    var state = {
      running: true,
      finished: false,
      mode: mode,
      subjectId: subjectId || '',
      subjectName: subject ? subject.nm : 'Все предметы',
      title: mode === 'weekly' ? 'Еженедельный вызов' : 'Экзамен 20',
      subtitle: mode === 'weekly' ? 'Неделя ' + weekId() + ' · 20 вопросов' : (subject ? subject.nm + ' · ' : 'Все предметы · ') + '10 минут',
      deck: deck,
      index: 0,
      answers: [],
      startedAt: Date.now(),
      timeLeft: mode === 'exam' ? EXAM_SECONDS : 0,
      timer: null
    };
    window.__wave86pState = state;
    if (mode === 'exam') {
      state.timer = setInterval(function(){
        if (!window.__wave86pState || window.__wave86pState !== state) return clearInterval(state.timer);
        state.timeLeft--;
        var node = document.getElementById('w86p-timer');
        if (node) node.textContent = fmt(state.timeLeft);
        if (state.timeLeft <= 0) finishRun();
      }, 1000);
    }
    renderRun();
  }
  function renderRun(){
    var state = window.__wave86pState;
    if (!state) return;
    var q = state.deck[state.index];
    var answered = state.answers[state.index] != null;
    var selected = state.answers[state.index];
    var progress = Math.round((state.index) / state.deck.length * 100);
    var meta = '<div class="w86p-meta"><span class="w86p-pill">Вопрос ' + (state.index + 1) + ' из ' + state.deck.length + '</span><span class="w86p-pill">' + esc(state.subjectName) + '</span>' + (state.mode === 'exam' ? '<span class="w86p-pill">⏱ <span id="w86p-timer">' + fmt(state.timeLeft) + '</span></span>' : '<span class="w86p-pill">' + weekId() + '</span>') + '</div>';
    var options = q.options.map(function(opt, i){
      var cls = 'w86p-opt';
      if (answered) {
        if (opt === q.answer) cls += ' ok';
        else if (opt === selected) cls += ' no';
        else cls += ' dim';
      }
      return '<button class="' + cls + '" type="button" data-answer="' + esc(opt) + '"' + (answered ? ' disabled' : '') + '><span class="k">' + 'ABCD'[i] + '</span><span>' + esc(opt) + '</span></button>';
    }).join('');
    var feedback = '';
    if (answered && state.mode === 'weekly') {
      var ok = selected === q.answer;
      feedback = '<div class="w86p-q" style="border:1px solid ' + (ok ? 'var(--green)' : 'var(--red)') + '"><b>' + (ok ? '✓ Верно' : '✗ Ответ: ' + esc(q.answer)) + '</b>' + (q.hint ? '<div class="w86p-sub" style="margin-top:6px">💡 ' + esc(q.hint) + '</div>' : '') + (q.ex ? '<div class="w86p-sub" style="margin-top:4px">📘 ' + esc(q.ex) + '</div>' : '') + '</div>';
    }
    var nextLabel = state.index + 1 >= state.deck.length ? 'Завершить' : 'Следующий →';
    var body = topHtml(state.title, state.subtitle) + meta + '<div class="w86p-progress"><div class="w86p-fill" style="width:' + progress + '%"></div></div>' +
      '<div class="w86p-q"><span class="w86p-tag" style="background:' + esc(q.bg) + ';color:' + esc(q.color) + '">' + esc(q.subjectName + ' · ' + q.topicName) + '</span><div class="w86p-qtext">' + esc(q.question) + '</div>' + (q.code ? '<div class="w86p-code">' + esc(q.code) + '</div>' : '') + '</div><div class="w86p-options">' + options + '</div>' + feedback +
      (answered ? '<button class="w86p-btn primary w86p-next" type="button" data-next>' + nextLabel + '</button>' : '');
    var mask = modal(body);
    mask.querySelector('.w86p-close').addEventListener('click', confirmClose);
    Array.prototype.forEach.call(mask.querySelectorAll('[data-answer]'), function(btn){
      btn.addEventListener('click', function(){
        if (state.answers[state.index] != null) return;
        state.answers[state.index] = btn.getAttribute('data-answer');
        if (state.mode === 'exam') {
          if (state.index + 1 >= state.deck.length) finishRun();
          else { state.index++; renderRun(); }
        } else {
          renderRun();
        }
      });
    });
    var next = mask.querySelector('[data-next]');
    if (next) next.addEventListener('click', function(){
      if (state.index + 1 >= state.deck.length) finishRun();
      else { state.index++; renderRun(); }
    });
  }
  function resultBreakdown(deck, answers){
    var map = {};
    deck.forEach(function(q, i){
      var key = q.subjectId + '|' + q.topicId;
      map[key] = map[key] || { subjectId:q.subjectId, subjectName:q.subjectName, topicId:q.topicId, topicName:q.topicName, ok:0, total:0 };
      map[key].total++;
      if (answers[i] === q.answer) map[key].ok++;
    });
    return Object.keys(map).map(function(k){ return map[k]; }).sort(function(a, b){ return pct(a.ok, a.total) - pct(b.ok, b.total); });
  }
  function finishRun(){
    var state = window.__wave86pState;
    if (!state || state.finished) return;
    state.finished = true;
    state.running = false;
    if (state.timer) clearInterval(state.timer);
    var total = state.deck.length;
    var ok = 0;
    state.deck.forEach(function(q, i){ if (state.answers[i] === q.answer) ok++; });
    var value = pct(ok, total);
    var mark = markFromPct(value);
    var spent = Math.round((Date.now() - state.startedAt) / 1000);
    var breakdown = resultBreakdown(state.deck, state.answers);
    updateProgress(state.deck, state.answers);
    updateDaily(ok, total - ok);
    updateStreakTotals(ok, total);
    var entry = {
      id: VERSION + '-' + Date.now(),
      mode: state.mode,
      grade: gradeKey(),
      weekId: weekId(),
      subjectId: state.subjectId || 'all',
      subjectName: state.subjectName,
      name: playerName(),
      ok: ok,
      total: total,
      pct: value,
      mark: mark,
      seconds: spent,
      ts: Date.now(),
      topics: breakdown.slice(0, 12)
    };
    saveResult(entry);
    try { if (typeof window.refreshMain === 'function') window.refreshMain(); } catch(_) {}
    renderResult(entry, breakdown, state.deck, state.answers);
  }
  function renderResult(entry, breakdown, deck, answers){
    var rows = breakdown.slice(0, 8).map(function(r){
      var p = pct(r.ok, r.total);
      return '<div class="w86p-row"><b>' + esc(r.subjectName + ' · ' + r.topicName) + '</b><span>' + r.ok + '/' + r.total + '</span><span style="font-weight:900;color:' + (p >= 80 ? 'var(--green)' : p >= 50 ? 'var(--orange)' : 'var(--red)') + '">' + p + '%</span></div>';
    }).join('');
    var wrong = deck.map(function(q, i){ return { q:q, a:answers[i] }; }).filter(function(x){ return x.a !== x.q.answer; }).slice(0, 5).map(function(x){
      return '<div class="w86p-row"><b>' + esc(x.q.question) + '</b><span style="color:var(--red)">' + esc(x.a || '—') + '</span><span style="color:var(--green)">✓ ' + esc(x.q.answer) + '</span></div>';
    }).join('');
    var body = topHtml(entry.mode === 'weekly' ? 'Weekly challenge завершён' : 'Экзамен завершён', entry.subjectName + ' · ' + entry.name) +
      '<div class="w86p-score" style="color:' + (entry.pct >= 80 ? 'var(--green)' : entry.pct >= 50 ? 'var(--orange)' : 'var(--red)') + '">' + entry.pct + '%</div>' +
      '<div style="text-align:center;font-size:15px;font-weight:900;margin-bottom:8px">Оценка: ' + entry.mark + ' · ' + entry.ok + ' из ' + entry.total + '</div>' +
      '<div class="w86p-meta" style="justify-content:center"><span class="w86p-pill">⏱ ' + fmt(entry.seconds) + '</span><span class="w86p-pill">' + esc(entry.weekId) + '</span><span class="w86p-pill">Сохранено в рейтинг</span></div>' +
      (rows ? '<div class="w86p-breakdown"><div class="w86p-title">По темам</div>' + rows + '</div>' : '') +
      (wrong ? '<div class="w86p-breakdown"><div class="w86p-title">Ошибки</div>' + wrong + '</div>' : '') +
      '<div class="w86p-actions"><button class="w86p-btn primary" type="button" data-repeat>Повторить</button><button class="w86p-btn" type="button" data-lb>Рейтинг</button><button class="w86p-btn" type="button" data-close>Закрыть</button></div>';
    var mask = modal(body);
    mask.querySelector('.w86p-close').addEventListener('click', function(){ window.__wave86pState = null; closeModal(); });
    mask.querySelector('[data-close]').addEventListener('click', function(){ window.__wave86pState = null; closeModal(); });
    mask.querySelector('[data-lb]').addEventListener('click', function(){ window.__wave86pState = null; showLeaderboards(entry.subjectId); });
    mask.querySelector('[data-repeat]').addEventListener('click', function(){ var mode = entry.mode; var subjectId = entry.subjectId === 'all' ? '' : entry.subjectId; window.__wave86pState = null; startRun(mode, subjectId); });
  }
  function topRows(rows, subjectId){
    var filtered = rows.filter(function(r){ return !subjectId || subjectId === 'all' || r.subjectId === subjectId; });
    filtered.sort(function(a, b){ return toNum(b.pct) - toNum(a.pct) || toNum(a.seconds) - toNum(b.seconds) || toNum(b.ts) - toNum(a.ts); });
    return filtered.slice(0, 20);
  }
  function showLeaderboards(subjectId){
    subjectId = subjectId || 'all';
    var rows = readResults();
    var list = subjects();
    var tabs = '<button type="button" data-tab="all">Класс</button>' + list.map(function(s){ return '<button type="button" data-tab="' + esc(s.id) + '">' + esc(s.ic || '') + ' ' + esc(s.nm) + '</button>'; }).join('');
    var top = topRows(rows, subjectId);
    var table = top.length ? top.map(function(r, i){
      return '<div class="w86p-row"><span style="width:28px;font-weight:900">' + (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1) + '</span><b>' + esc(r.name || 'Ученик') + '<div class="w86p-sub">' + esc(r.mode === 'weekly' ? 'weekly' : 'экзамен') + ' · ' + esc(r.subjectName || 'Все предметы') + ' · ' + new Date(r.ts).toLocaleDateString('ru-RU') + '</div></b><span style="font-weight:900">' + r.pct + '%</span><span>оценка ' + r.mark + '</span></div>';
    }).join('') : '<div class="w86p-empty">Рейтинг пока пуст. Пройди weekly challenge или экзамен — результат появится здесь.</div>';
    var body = topHtml('Локальные рейтинги', 'По этому устройству: общий рейтинг класса и срезы по предметам.') + '<div class="w86p-lb-tabs">' + tabs + '</div>' + table + '<button class="w86p-btn primary" style="width:100%;margin-top:12px" type="button" data-close>Закрыть</button>';
    var mask = modal(body);
    mask.querySelector('.w86p-close').addEventListener('click', confirmClose);
    mask.querySelector('[data-close]').addEventListener('click', closeModal);
    Array.prototype.forEach.call(mask.querySelectorAll('[data-tab]'), function(btn){
      if ((btn.getAttribute('data-tab') || 'all') === subjectId) btn.style.background = 'var(--accent)', btn.style.color = '#fff';
      btn.addEventListener('click', function(){ showLeaderboards(btn.getAttribute('data-tab') || 'all'); });
    });
  }
  function init(){
    if (!Array.isArray(window.SUBJ) || !document.getElementById('s-main')) return false;
    renderCard();
    return true;
  }
  var tries = 0;
  function boot(){
    if (init()) return;
    if (++tries < 40) setTimeout(boot, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.wave86pChallenge = {
    version: VERSION,
    buildDeck: buildDeck,
    startWeeklyChallenge: function(){ startRun('weekly', ''); },
    startExamPicker: showExamPicker,
    showLeaderboards: showLeaderboards,
    readResults: readResults,
    auditSnapshot: function(){
      var rows = readResults();
      return {
        version: VERSION,
        grade: gradeKey(),
        subjects: subjects().length,
        topicPool: topicPool('').length,
        weeklyDeck: buildDeck('weekly', '', COUNT, VERSION + ':audit:' + gradeKey() + ':weekly').length,
        examDeck: buildDeck('exam', '', COUNT, VERSION + ':audit:' + gradeKey() + ':exam').length,
        results: rows.length
      };
    }
  };
})();

;/* ---- chunk_roadmap_wave86v_pvp_link_battle.js ---- */
/* --- wave86v: PvP battle by shareable link --- */
(function(){
  if (typeof window === 'undefined') return;
  if (window.wave86vPvpBattle) return;

  var VERSION = 'wave86v';
  var CARD_ID = 'wave86v-pvp-card';
  var MODAL_ID = 'wave86v-modal';
  var STYLE_ID = 'wave86v-pvp-style';
  var COUNT = 10;
  var BATTLE_SECONDS = 7 * 60;
  var MAX_HISTORY = 80;

  function gradeKey(){ return String(window.GRADE_NUM || ''); }
  function storeKey(){ return 'trainer_wave86v_duels_' + gradeKey(); }
  function progressKey(){ return 'trainer_progress_' + gradeKey(); }
  function streakKey(){ return 'trainer_streak_' + gradeKey(); }
  function dailyKey(){ return 'trainer_daily_' + gradeKey(); }
  function activityKey(){ return 'trainer_activity_' + gradeKey(); }
  function today(){ return new Date().toISOString().slice(0, 10); }
  function toNum(v){ return Number(v || 0) || 0; }
  function pct(ok, total){ return total ? Math.round(ok / total * 100) : 0; }
  function markFromPct(value){ return value >= 85 ? 5 : value >= 65 ? 4 : value >= 45 ? 3 : 2; }
  function fmt(sec){ sec = Math.max(0, toNum(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function safeRead(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(_) { return fallback; }
  }
  function safeWrite(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(_) {}
  }
  function playerName(){
    try {
      if (typeof window.getPlayerName === 'function') return window.getPlayerName() || 'Ученик';
      return localStorage.getItem('trainer_player_name') || 'Ученик';
    } catch(_) { return 'Ученик'; }
  }
  function hashSeed(seed){
    var str = String(seed == null ? '' : seed);
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function randomToken(){
    return (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)).toLowerCase();
  }
  function encodePayload(payload){
    var json = JSON.stringify(payload || {});
    try {
      if (window.TextEncoder) {
        var bytes = new TextEncoder().encode(json);
        var bin = '';
        for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
      }
    } catch(_) {}
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  function decodePayload(raw){
    try {
      raw = String(raw || '').replace(/-/g, '+').replace(/_/g, '/');
      while (raw.length % 4) raw += '=';
      var bin = atob(raw);
      try {
        if (window.TextDecoder) {
          var bytes = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          return JSON.parse(new TextDecoder().decode(bytes));
        }
      } catch(_) {}
      return JSON.parse(decodeURIComponent(escape(bin)));
    } catch(_) { return null; }
  }
  function getChallengeParam(){
    try {
      var url = new URL(window.location.href);
      var q = url.searchParams.get('pvp');
      if (q) return q;
      var hash = String(window.location.hash || '').replace(/^#/, '');
      if (!hash) return '';
      if (hash.indexOf('pvp=') === 0) return hash.slice(4).split('&')[0];
      var m = hash.match(/(?:^|&)pvp=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : '';
    } catch(_) { return ''; }
  }
  function cleanChallenge(payload){
    if (!payload || typeof payload !== 'object') return null;
    var grade = String(payload.grade || '');
    var seed = String(payload.seed || '');
    if (!grade || !seed || seed.length > 180) return null;
    var count = Math.max(4, Math.min(20, toNum(payload.count) || COUNT));
    var out = {
      v: String(payload.v || VERSION),
      id: String(payload.id || ('duel-' + hashSeed(seed).toString(36))).slice(0, 80),
      grade: grade,
      subjectId: String(payload.subjectId || '').slice(0, 80),
      subjectName: String(payload.subjectName || 'Все предметы').slice(0, 120),
      seed: seed,
      count: count,
      createdAt: toNum(payload.createdAt) || Date.now(),
      inviter: String(payload.inviter || 'Ученик').slice(0, 80)
    };
    if (payload.hostResult && typeof payload.hostResult === 'object') {
      out.hostResult = {
        name: String(payload.hostResult.name || out.inviter || 'Ученик').slice(0, 80),
        ok: toNum(payload.hostResult.ok),
        total: toNum(payload.hostResult.total) || count,
        pct: toNum(payload.hostResult.pct),
        mark: toNum(payload.hostResult.mark),
        seconds: toNum(payload.hostResult.seconds),
        ts: toNum(payload.hostResult.ts) || out.createdAt
      };
    }
    return out;
  }
  function subjects(){
    var list = Array.isArray(window.SUBJ) ? window.SUBJ : [];
    return list.filter(function(s){ return s && !s.hidden && Array.isArray(s.tops); });
  }
  function subjectById(id){
    var list = subjects();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function ensureReady(subjectId){
    if (String(window.GRADE_NUM || '') === '10' && window.wave86sGrade10Lazy) {
      if (subjectId && typeof window.wave86sGrade10Lazy.hydrateSubject === 'function') return window.wave86sGrade10Lazy.hydrateSubject(subjectId);
      if (typeof window.wave86sGrade10Lazy.hydrateAll === 'function') return window.wave86sGrade10Lazy.hydrateAll();
    }
    return Promise.resolve();
  }
  function buildDeck(challenge){
    if (!window.wave86pChallenge || typeof window.wave86pChallenge.buildDeck !== 'function') return [];
    return window.wave86pChallenge.buildDeck('pvp', challenge.subjectId || '', challenge.count || COUNT, challenge.seed) || [];
  }
  function readHistory(){
    var rows = safeRead(storeKey(), []);
    return Array.isArray(rows) ? rows : [];
  }
  function saveHistory(entry){
    var rows = readHistory();
    rows.unshift(entry);
    safeWrite(storeKey(), rows.slice(0, MAX_HISTORY));
  }
  function updateProgress(deck, answers){
    var prog = safeRead(progressKey(), {});
    deck.forEach(function(q, i){
      if (!q || !q.subjectId || !q.topicId) return;
      prog[q.subjectId] = prog[q.subjectId] || {};
      prog[q.subjectId][q.topicId] = prog[q.subjectId][q.topicId] || { ok:0, err:0 };
      var row = prog[q.subjectId][q.topicId];
      if (answers[i] === q.answer) row.ok = toNum(row.ok) + 1;
      else row.err = toNum(row.err) + 1;
      row.last = new Date().toLocaleDateString('ru-RU');
    });
    safeWrite(progressKey(), prog);
  }
  function updateDaily(ok, err){
    var d = safeRead(dailyKey(), { date: today(), ok:0, err:0, pure:0, subjs:{} });
    if (!d || typeof d !== 'object' || d.date !== today()) d = { date: today(), ok:0, err:0, pure:0, subjs:{} };
    d.ok = toNum(d.ok) + ok;
    d.err = toNum(d.err) + err;
    if (err === 0) d.pure = toNum(d.pure) + ok;
    safeWrite(dailyKey(), d);
    var a = safeRead(activityKey(), []);
    if (!Array.isArray(a)) a = [];
    var row = a.filter(function(x){ return x && x.date === today(); })[0];
    if (!row) { row = { date: today(), ok:0, err:0, pure:0, total:0 }; a.push(row); }
    row.ok = toNum(row.ok) + ok;
    row.err = toNum(row.err) + err;
    row.total = toNum(row.ok) + toNum(row.err);
    if (err === 0) row.pure = toNum(row.pure) + ok;
    a.sort(function(x, y){ return String(x.date).localeCompare(String(y.date)); });
    safeWrite(activityKey(), a.slice(-365));
  }
  function updateStreakTotals(ok, total){
    var s = safeRead(streakKey(), {});
    if (!s || typeof s !== 'object') s = {};
    s.totalQs = toNum(s.totalQs) + total;
    s.totalOk = toNum(s.totalOk) + ok;
    s.badges = Array.isArray(s.badges) ? s.badges : [];
    safeWrite(streakKey(), s);
  }
  function css(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '' +
      '.w86v-card{margin:12px 0;padding:14px;border-radius:16px;background:linear-gradient(135deg,rgba(245,158,11,.13),rgba(239,68,68,.10));border:1px solid rgba(245,158,11,.22)}' +
      '.w86v-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}.w86v-icon{font-size:24px}.w86v-title{font-weight:900;font-size:14px;font-family:Unbounded,system-ui,sans-serif}.w86v-sub{font-size:11px;color:var(--muted);margin-top:2px;line-height:1.35}.w86v-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.w86v-btn{border:none;border-radius:12px;padding:10px 9px;background:var(--card);color:var(--text);border:1px solid var(--border);font-size:12px;font-weight:800;cursor:pointer;font-family:Golos Text,system-ui,sans-serif}.w86v-btn.primary{background:var(--accent);color:#fff;border-color:var(--accent)}' +
      '.w86v-mask{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto}.w86v-box{background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:20px;max-width:580px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:0 22px 56px rgba(0,0,0,.38);padding:18px}.w86v-top{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}.w86v-close{margin-left:auto;border:none;background:transparent;color:var(--muted);font-size:24px;line-height:1;cursor:pointer}.w86v-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.w86v-meta{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.w86v-pill{border-radius:999px;background:var(--abg);color:var(--muted);font-size:11px;font-weight:800;padding:5px 8px}.w86v-progress{height:8px;background:var(--abg);border-radius:999px;overflow:hidden;margin:10px 0}.w86v-fill{height:100%;background:var(--accent);border-radius:999px}.w86v-q{padding:14px;border-radius:14px;background:var(--abg);margin:12px 0}.w86v-tag{display:inline-flex;margin-bottom:8px;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:900}.w86v-qtext{font-size:16px;font-weight:800;line-height:1.45}.w86v-code{white-space:pre-wrap;font-family:JetBrains Mono,monospace;font-size:12px;background:rgba(0,0,0,.08);padding:10px;border-radius:10px;margin-top:8px}.w86v-options{display:grid;gap:8px}.w86v-opt{display:flex;align-items:center;gap:10px;text-align:left;border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:13px;padding:12px;cursor:pointer;font-weight:700;font-family:Golos Text,system-ui,sans-serif}.w86v-opt .k{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:var(--abg);font-weight:900}.w86v-score{font-family:Unbounded,system-ui,sans-serif;font-size:40px;font-weight:900;text-align:center;margin:8px 0}.w86v-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px}.w86v-row b{flex:1}.w86v-empty{text-align:center;color:var(--muted);font-size:13px;padding:22px 8px}.w86v-linkbox{word-break:break-all;border:1px dashed var(--border);background:var(--abg);border-radius:12px;padding:10px;font-size:11px;color:var(--muted);margin:10px 0}.w86v-verdict{padding:12px;border-radius:14px;background:var(--abg);font-weight:900;text-align:center;margin:12px 0}.w86v-muted{opacity:.72}' +
      '@media(max-width:520px){.w86v-actions,.w86v-grid{grid-template-columns:1fr}.w86v-qtext{font-size:15px}}';
    document.head.appendChild(style);
  }
  function topHtml(title, subtitle){
    return '<div class="w86v-top"><div><div class="w86v-title">' + esc(title) + '</div><div class="w86v-sub">' + esc(subtitle || '') + '</div></div><button class="w86v-close" type="button" aria-label="Закрыть">×</button></div>';
  }
  function modal(inner){
    closeModal();
    css();
    var mask = document.createElement('div');
    mask.id = MODAL_ID;
    mask.className = 'w86v-mask';
    mask.setAttribute('role', 'dialog');
    mask.setAttribute('aria-modal', 'true');
    mask.innerHTML = '<div class="w86v-box">' + inner + '</div>';
    mask.addEventListener('click', function(ev){ if (ev.target === mask) confirmClose(); });
    document.body.appendChild(mask);
    var close = mask.querySelector('.w86v-close');
    if (close) close.addEventListener('click', confirmClose);
    var focus = mask.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (focus && focus.focus) setTimeout(function(){ focus.focus(); }, 30);
    return mask;
  }
  function closeModal(){
    var old = document.getElementById(MODAL_ID);
    if (old) old.remove();
  }
  function confirmClose(){
    if (window.__wave86vState && window.__wave86vState.running && !window.__wave86vState.finished) {
      if (!confirm('Завершить текущую PvP-битву? Результат этой попытки не сохранится.')) return;
      clearInterval(window.__wave86vState.timer);
    }
    window.__wave86vState = null;
    closeModal();
  }
  function challengeUrl(challenge){
    var payload = encodePayload(challenge);
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('pvp', payload);
      url.hash = '';
      return url.toString();
    } catch(_) {
      return String(window.location.href).split('#')[0].split('?')[0] + '?pvp=' + payload;
    }
  }
  function copyText(text, label){
    function fallback(){
      try {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', 'readonly');
        area.style.position = 'fixed';
        area.style.left = '-9999px';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
        toast(label || 'Скопировано');
      } catch(_) { prompt('Скопируй вручную:', text); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function(){ toast(label || 'Скопировано'); }).catch(fallback);
    } else fallback();
  }
  function shareText(title, text, url){
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url }).catch(function(){});
    } else {
      copyText([text, url].filter(Boolean).join('\n'), 'Текст для отправки скопирован');
    }
  }
  function toast(text){
    try {
      var old = document.getElementById('wave86v-toast');
      if (old) old.remove();
      var node = document.createElement('div');
      node.id = 'wave86v-toast';
      node.textContent = text;
      node.style.cssText = 'position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:100002;background:var(--text);color:var(--card);border-radius:999px;padding:10px 14px;font-size:12px;font-weight:900;box-shadow:0 10px 26px rgba(0,0,0,.22)';
      document.body.appendChild(node);
      setTimeout(function(){ if (node && node.parentNode) node.remove(); }, 2200);
    } catch(_) {}
  }
  function createChallenge(subjectId){
    var s = subjectId ? subjectById(subjectId) : null;
    var seed = [VERSION, gradeKey(), subjectId || 'all', randomToken()].join(':');
    return {
      v: VERSION,
      id: 'duel-' + hashSeed(seed).toString(36),
      grade: gradeKey(),
      subjectId: subjectId || '',
      subjectName: s ? s.nm : 'Все предметы',
      seed: seed,
      count: COUNT,
      createdAt: Date.now(),
      inviter: playerName()
    };
  }
  function showCreatePicker(){
    var list = subjects();
    var buttons = '<button class="w86v-btn primary" type="button" data-subj="">Все предметы</button>' + list.map(function(s){
      return '<button class="w86v-btn" type="button" data-subj="' + esc(s.id) + '">' + esc((s.ic || '') + ' ' + s.nm) + '</button>';
    }).join('');
    var mask = modal(topHtml('PvP-битва по ссылке', 'Выбери предмет. Сначала пройди 10 вопросов сам, затем отправь ссылку сопернику — он получит тот же набор и сравнение результата.') + '<div class="w86v-grid">' + buttons + '</div><div class="w86v-sub" style="margin-top:10px">Работает без сервера: в ссылке хранится только seed набора и твой итоговый результат.</div>');
    Array.prototype.forEach.call(mask.querySelectorAll('[data-subj]'), function(btn){
      btn.addEventListener('click', function(){
        var subjectId = btn.getAttribute('data-subj') || '';
        ensureReady(subjectId).then(function(){ startBattle(createChallenge(subjectId), 'host'); }).catch(function(){ startBattle(createChallenge(subjectId), 'host'); });
      });
    });
  }
  function showIncoming(challenge){
    var wrongGrade = challenge.grade && challenge.grade !== gradeKey();
    var target = 'grade' + challenge.grade + '_v2.html?pvp=' + encodePayload(challenge);
    var body = topHtml('Тебя вызвали на PvP-битву', (challenge.inviter || 'Ученик') + ' · ' + challenge.subjectName + ' · ' + challenge.count + ' вопросов') +
      (wrongGrade ? '<div class="w86v-verdict">Эта ссылка для ' + esc(challenge.grade) + ' класса, а сейчас открыт ' + esc(gradeKey()) + ' класс.</div><a class="w86v-btn primary" style="display:block;text-align:center;text-decoration:none" href="' + esc(target) + '">Открыть нужный класс</a>' : '<div class="w86v-meta"><span class="w86v-pill">' + esc(challenge.subjectName) + '</span><span class="w86v-pill">⏱ ' + fmt(BATTLE_SECONDS) + '</span><span class="w86v-pill">' + challenge.count + ' вопросов</span></div>' + (challenge.hostResult ? '<div class="w86v-verdict">Результат соперника: ' + esc(challenge.hostResult.name) + ' — ' + challenge.hostResult.ok + '/' + challenge.hostResult.total + ' · ' + challenge.hostResult.pct + '% · ' + fmt(challenge.hostResult.seconds) + '</div>' : '<div class="w86v-verdict">Соперник прислал seed без результата. После прохождения можно поделиться своим итогом.</div>') + '<div class="w86v-actions"><button class="w86v-btn primary" type="button" data-start>Принять вызов</button><button class="w86v-btn" type="button" data-copy>Скопировать ссылку</button></div>');
    var mask = modal(body);
    var start = mask.querySelector('[data-start]');
    if (start) start.addEventListener('click', function(){ ensureReady(challenge.subjectId).then(function(){ startBattle(challenge, 'guest'); }).catch(function(){ startBattle(challenge, 'guest'); }); });
    var copy = mask.querySelector('[data-copy]');
    if (copy) copy.addEventListener('click', function(){ copyText(challengeUrl(challenge), 'Ссылка скопирована'); });
  }
  function startBattle(challenge, role){
    challenge = cleanChallenge(challenge);
    if (!challenge) return;
    var deck = buildDeck(challenge);
    if (deck.length < Math.min(4, challenge.count || COUNT)) {
      var m = modal(topHtml('Не хватает вопросов', 'Для выбранной дуэли не удалось собрать стабильный набор.') + '<div class="w86v-empty">Попробуй другой предмет или режим «Все предметы».</div><button class="w86v-btn primary" type="button" data-close style="width:100%">Понятно</button>');
      var b = m.querySelector('[data-close]');
      if (b) b.addEventListener('click', closeModal);
      return;
    }
    var state = {
      running: true,
      finished: false,
      role: role || 'guest',
      challenge: challenge,
      deck: deck.slice(0, challenge.count || COUNT),
      index: 0,
      answers: [],
      startedAt: Date.now(),
      timeLeft: BATTLE_SECONDS,
      timer: null
    };
    window.__wave86vState = state;
    state.timer = setInterval(function(){
      if (!window.__wave86vState || window.__wave86vState !== state) return clearInterval(state.timer);
      state.timeLeft--;
      var node = document.getElementById('w86v-timer');
      if (node) node.textContent = fmt(state.timeLeft);
      if (state.timeLeft <= 0) finishBattle();
    }, 1000);
    renderBattle();
  }
  function renderBattle(){
    var state = window.__wave86vState;
    if (!state) return;
    var q = state.deck[state.index];
    var progress = Math.round(state.index / state.deck.length * 100);
    var opts = (q.options || []).map(function(opt, i){
      return '<button class="w86v-opt" type="button" data-answer="' + esc(opt) + '"><span class="k">' + 'ABCD'[i] + '</span><span>' + esc(opt) + '</span></button>';
    }).join('');
    var title = state.role === 'host' ? 'Создание PvP-ссылки' : 'PvP-вызов от ' + (state.challenge.inviter || 'ученика');
    var body = topHtml(title, state.challenge.subjectName + ' · отвечай без подсказок, результат сравним в конце') +
      '<div class="w86v-meta"><span class="w86v-pill">Вопрос ' + (state.index + 1) + ' из ' + state.deck.length + '</span><span class="w86v-pill">⏱ <span id="w86v-timer">' + fmt(state.timeLeft) + '</span></span><span class="w86v-pill">PvP 1v1</span></div>' +
      '<div class="w86v-progress"><div class="w86v-fill" style="width:' + progress + '%"></div></div>' +
      '<div class="w86v-q"><span class="w86v-tag" style="background:' + esc(q.bg || 'var(--abg)') + ';color:' + esc(q.color || 'var(--accent)') + '">' + esc((q.subjectName || '') + ' · ' + (q.topicName || q.tag || 'Тема')) + '</span><div class="w86v-qtext">' + esc(q.question) + '</div>' + (q.code ? '<div class="w86v-code">' + esc(q.code) + '</div>' : '') + '</div><div class="w86v-options">' + opts + '</div>';
    var mask = modal(body);
    Array.prototype.forEach.call(mask.querySelectorAll('[data-answer]'), function(btn){
      btn.addEventListener('click', function(){
        if (!window.__wave86vState || window.__wave86vState !== state) return;
        state.answers[state.index] = btn.getAttribute('data-answer');
        if (state.index + 1 >= state.deck.length) finishBattle();
        else { state.index++; renderBattle(); }
      });
    });
  }
  function resultBreakdown(deck, answers){
    var map = {};
    deck.forEach(function(q, i){
      var key = (q.subjectId || '') + '|' + (q.topicId || '');
      map[key] = map[key] || { subjectName:q.subjectName || 'Предмет', topicName:q.topicName || q.tag || 'Тема', ok:0, total:0 };
      map[key].total++;
      if (answers[i] === q.answer) map[key].ok++;
    });
    return Object.keys(map).map(function(k){ return map[k]; }).sort(function(a, b){ return pct(a.ok, a.total) - pct(b.ok, b.total); });
  }
  function compare(me, host){
    if (!host) return { label:'Результат готов', cls:'', detail:'Отправь ссылку сопернику, чтобы он прошёл тот же набор.' };
    if (me.pct > host.pct) return { label:'Победа! 🏆', cls:'color:var(--green)', detail:'Ты набрал больше процентов, чем соперник.' };
    if (me.pct < host.pct) return { label:'Поражение — реванш? ⚡', cls:'color:var(--red)', detail:'Соперник набрал больше процентов.' };
    if (me.seconds < host.seconds) return { label:'Победа по времени! 🏁', cls:'color:var(--green)', detail:'Проценты равны, но ты справился быстрее.' };
    if (me.seconds > host.seconds) return { label:'Проценты равны, соперник быстрее', cls:'color:var(--orange)', detail:'Попробуй реванш и сократи время.' };
    return { label:'Ничья 🤝', cls:'', detail:'Одинаковые проценты и время.' };
  }
  function finishBattle(){
    var state = window.__wave86vState;
    if (!state || state.finished) return;
    state.finished = true;
    state.running = false;
    if (state.timer) clearInterval(state.timer);
    var total = state.deck.length;
    var ok = 0;
    state.deck.forEach(function(q, i){ if (state.answers[i] === q.answer) ok++; });
    var value = pct(ok, total);
    var spent = Math.round((Date.now() - state.startedAt) / 1000);
    var me = { name: playerName(), ok: ok, total: total, pct: value, mark: markFromPct(value), seconds: spent, ts: Date.now() };
    var challenge = cleanChallenge(state.challenge);
    if (state.role === 'host') challenge.hostResult = me;
    updateProgress(state.deck, state.answers);
    updateDaily(ok, total - ok);
    updateStreakTotals(ok, total);
    var entry = {
      id: VERSION + '-' + Date.now(),
      challengeId: challenge.id,
      role: state.role,
      grade: gradeKey(),
      subjectId: challenge.subjectId || 'all',
      subjectName: challenge.subjectName,
      seed: challenge.seed,
      result: me,
      hostResult: challenge.hostResult || null,
      ts: Date.now()
    };
    saveHistory(entry);
    try { if (typeof window.refreshMain === 'function') window.refreshMain(); } catch(_) {}
    renderResult(challenge, me, resultBreakdown(state.deck, state.answers), state.deck, state.answers, state.role);
  }
  function resultText(challenge, me){
    return 'PvP-битва, ' + gradeKey() + ' класс · ' + challenge.subjectName + ': ' + me.name + ' — ' + me.ok + '/' + me.total + ' (' + me.pct + '%), оценка ' + me.mark + ', время ' + fmt(me.seconds) + '.';
  }
  function renderResult(challenge, me, breakdown, deck, answers, role){
    var link = role === 'host' ? challengeUrl(challenge) : '';
    var host = role === 'guest' ? challenge.hostResult : null;
    var verdict = compare(me, host);
    var rows = breakdown.slice(0, 6).map(function(r){
      var p = pct(r.ok, r.total);
      return '<div class="w86v-row"><b>' + esc(r.subjectName + ' · ' + r.topicName) + '</b><span>' + r.ok + '/' + r.total + '</span><span style="font-weight:900;color:' + (p >= 80 ? 'var(--green)' : p >= 50 ? 'var(--orange)' : 'var(--red)') + '">' + p + '%</span></div>';
    }).join('');
    var wrong = deck.map(function(q, i){ return { q:q, a:answers[i] }; }).filter(function(x){ return x.a !== x.q.answer; }).slice(0, 4).map(function(x){
      return '<div class="w86v-row"><b>' + esc(x.q.question) + '</b><span style="color:var(--red)">' + esc(x.a || '—') + '</span><span style="color:var(--green)">✓ ' + esc(x.q.answer) + '</span></div>';
    }).join('');
    var shareBlock = role === 'host'
      ? '<div class="w86v-linkbox">' + esc(link) + '</div><div class="w86v-actions"><button class="w86v-btn primary" type="button" data-share-link>Отправить вызов</button><button class="w86v-btn" type="button" data-copy-link>Копировать ссылку</button></div>'
      : '<div class="w86v-actions"><button class="w86v-btn primary" type="button" data-share-result>Отправить мой результат</button><button class="w86v-btn" type="button" data-rematch>Реванш</button></div>';
    var body = topHtml(role === 'host' ? 'PvP-ссылка готова' : 'PvP-битва завершена', challenge.subjectName + ' · ' + me.name) +
      '<div class="w86v-score" style="color:' + (me.pct >= 80 ? 'var(--green)' : me.pct >= 50 ? 'var(--orange)' : 'var(--red)') + '">' + me.pct + '%</div>' +
      '<div style="text-align:center;font-size:15px;font-weight:900;margin-bottom:8px">' + me.ok + ' из ' + me.total + ' · оценка ' + me.mark + ' · ' + fmt(me.seconds) + '</div>' +
      '<div class="w86v-verdict" style="' + verdict.cls + '">' + esc(verdict.label) + '<div class="w86v-sub" style="margin-top:4px">' + esc(verdict.detail) + '</div></div>' +
      (host ? '<div class="w86v-row"><b>Соперник: ' + esc(host.name) + '</b><span>' + host.ok + '/' + host.total + '</span><span>' + host.pct + '%</span><span>' + fmt(host.seconds) + '</span></div>' : '') +
      shareBlock +
      (rows ? '<div style="margin-top:12px"><div class="w86v-title">По темам</div>' + rows + '</div>' : '') +
      (wrong ? '<div style="margin-top:12px"><div class="w86v-title">Ошибки</div>' + wrong + '</div>' : '') +
      '<button class="w86v-btn" style="width:100%;margin-top:12px" type="button" data-close>Закрыть</button>';
    var mask = modal(body);
    var close = mask.querySelector('[data-close]');
    if (close) close.addEventListener('click', function(){ window.__wave86vState = null; closeModal(); });
    var copy = mask.querySelector('[data-copy-link]');
    if (copy) copy.addEventListener('click', function(){ copyText(link, 'PvP-ссылка скопирована'); });
    var share = mask.querySelector('[data-share-link]');
    if (share) share.addEventListener('click', function(){ shareText('PvP-битва', resultText(challenge, me) + ' Прими вызов и сравним результат.', link); });
    var shareResult = mask.querySelector('[data-share-result]');
    if (shareResult) shareResult.addEventListener('click', function(){ shareText('Мой PvP-результат', resultText(challenge, me), ''); });
    var rematch = mask.querySelector('[data-rematch]');
    if (rematch) rematch.addEventListener('click', function(){ showCreatePicker(); });
  }
  function showHistory(){
    var rows = readHistory();
    var bodyRows = rows.length ? rows.slice(0, 20).map(function(r, i){
      var me = r.result || {};
      var host = r.hostResult || null;
      var verdict = r.role === 'guest' && host ? compare(me, host).label : (r.role === 'host' ? 'Ссылка создана' : 'Дуэль');
      return '<div class="w86v-row"><span style="width:28px;font-weight:900">' + (i + 1) + '</span><b>' + esc(r.subjectName || 'Все предметы') + '<div class="w86v-sub">' + esc(verdict) + ' · ' + new Date(r.ts).toLocaleDateString('ru-RU') + '</div></b><span style="font-weight:900">' + toNum(me.pct) + '%</span><span>' + fmt(me.seconds) + '</span></div>';
    }).join('') : '<div class="w86v-empty">История PvP пока пустая. Создай дуэль и отправь ссылку.</div>';
    var mask = modal(topHtml('История PvP', 'Последние локальные дуэли на этом устройстве.') + bodyRows + '<button class="w86v-btn primary" style="width:100%;margin-top:12px" type="button" data-close>Закрыть</button>');
    var btn = mask.querySelector('[data-close]');
    if (btn) btn.addEventListener('click', closeModal);
  }
  function renderCard(){
    css();
    if (!subjects().length || !window.wave86pChallenge) return;
    var old = document.getElementById(CARD_ID);
    if (old) old.remove();
    var anchor = document.getElementById('wave86p-challenge-card') || document.getElementById('daily-meter') || document.getElementById('sg');
    if (!anchor || !anchor.parentNode) return;
    var rows = readHistory();
    var last = rows[0] && rows[0].result ? rows[0].result : null;
    var card = document.createElement('div');
    card.id = CARD_ID;
    card.className = 'w86v-card';
    card.innerHTML = '<div class="w86v-head"><div class="w86v-icon">⚔️</div><div style="flex:1"><div class="w86v-title">PvP-битва по ссылке</div><div class="w86v-sub">Асинхронная дуэль 1v1: один и тот же seed, 10 вопросов, сравнение процентов и времени.' + (last ? ' Последний результат: ' + last.pct + '%.' : '') + '</div></div></div><div class="w86v-actions"><button class="w86v-btn primary" type="button" data-w86v="create">Создать дуэль</button><button class="w86v-btn" type="button" data-w86v="history">История PvP</button></div>';
    card.querySelector('[data-w86v="create"]').addEventListener('click', showCreatePicker);
    card.querySelector('[data-w86v="history"]').addEventListener('click', showHistory);
    anchor.parentNode.insertBefore(card, anchor.nextSibling);
  }
  function bootIncomingOnce(){
    if (window.__wave86vIncomingHandled) return;
    var raw = getChallengeParam();
    if (!raw) return;
    var payload = cleanChallenge(decodePayload(raw));
    if (!payload) return;
    window.__wave86vIncomingHandled = true;
    setTimeout(function(){ showIncoming(payload); }, 300);
  }
  function init(){
    if (!Array.isArray(window.SUBJ) || !document.getElementById('s-main') || !window.wave86pChallenge) return false;
    renderCard();
    bootIncomingOnce();
    return true;
  }
  var tries = 0;
  function boot(){
    if (init()) return;
    if (++tries < 60) setTimeout(boot, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.wave86vPvpBattle = {
    version: VERSION,
    createChallenge: createChallenge,
    encodePayload: encodePayload,
    decodePayload: decodePayload,
    buildDeck: function(challenge){ return buildDeck(cleanChallenge(challenge)); },
    startBattle: function(challenge, role){ return startBattle(challenge, role || 'guest'); },
    showCreatePicker: showCreatePicker,
    showHistory: showHistory,
    readHistory: readHistory,
    auditSnapshot: function(){
      var challenge = createChallenge('');
      var deck = buildDeck(challenge);
      var encoded = encodePayload(challenge);
      var decoded = cleanChallenge(decodePayload(encoded));
      return {
        version: VERSION,
        grade: gradeKey(),
        subjects: subjects().length,
        cardMounted: !!document.getElementById(CARD_ID),
        deckSize: deck.length,
        encodedRoundtrip: !!decoded && decoded.seed === challenge.seed && decoded.grade === challenge.grade,
        history: readHistory().length,
        seconds: BATTLE_SECONDS
      };
    }
  };
})();

;/* ---- bundle_gamification_xp.js ---- */
(function(root, factory){
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(root || globalThis, true);
  } else {
    root.wave66Xp = factory(root || window, false);
  }
})(typeof window !== 'undefined' ? window : globalThis, function(root, isNode){
  'use strict';

  var CONFIG = {
    key: 'trainer_xp_state_v1',
    profileActiveKey: 'trainer35_active_profile_v1',
    profileScopePrefix: 'trainer35_scoped:',
    maxLevel: 50,
    maxXp: 50000,
    xpCorrect: 10,
    xpHint: 5,
    xpStreak5: 20
  };

  var RANKS = [
    { min: 1,  max: 6,  label: 'Новичок', icon: '🌱' },
    { min: 7,  max: 13, label: 'Ученик', icon: '📘' },
    { min: 14, max: 20, label: 'Знаток', icon: '🧠' },
    { min: 21, max: 28, label: 'Мастер', icon: '🏅' },
    { min: 29, max: 36, label: 'Эксперт', icon: '🎯' },
    { min: 37, max: 43, label: 'Гуру', icon: '🔮' },
    { min: 44, max: 50, label: 'Легенда', icon: '👑' }
  ];

  var storage = {
    get: function(key){
      try { return Storage.prototype.getItem.call(root.localStorage, key); } catch (_) { return null; }
    },
    set: function(key, value){
      try { Storage.prototype.setItem.call(root.localStorage, key, String(value)); } catch (_) {}
    },
    remove: function(key){
      try { Storage.prototype.removeItem.call(root.localStorage, key); } catch (_) {}
    }
  };

  function esc(text){
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function activeProfileId(){
    return storage.get(CONFIG.profileActiveKey) || 'p1';
  }

  function scopedKey(baseKey){
    return CONFIG.profileScopePrefix + activeProfileId() + ':' + baseKey;
  }

  function readScopedJSON(baseKey, fallback){
    var scoped = storage.get(scopedKey(baseKey));
    var raw = scoped != null ? scoped : storage.get(baseKey);
    if (!raw) return cloneState(fallback);
    try { return Object.assign(cloneState(fallback), JSON.parse(raw)); } catch (_) { return cloneState(fallback); }
  }

  function writeScopedJSON(baseKey, value){
    storage.set(scopedKey(baseKey), JSON.stringify(value));
  }

  function cloneState(state){
    return JSON.parse(JSON.stringify(state || defaultState()));
  }

  function defaultState(){
    return {
      xp: 0,
      totalAwards: 0,
      correct: 0,
      hintCorrect: 0,
      streakBonuses: 0,
      bonusXp: 0,
      levelUps: 0,
      lastGain: 0,
      lastReason: '',
      lastLabel: '',
      updatedAt: '',
      history: []
    };
  }

  function thresholdForLevel(level){
    level = Math.max(1, Math.min(CONFIG.maxLevel, Math.round(level || 1)));
    if (level <= 1) return 0;
    if (level >= CONFIG.maxLevel) return CONFIG.maxXp;
    var ratio = (level - 1) / (CONFIG.maxLevel - 1);
    return Math.round(CONFIG.maxXp * ratio * ratio);
  }

  function levelForXp(xp){
    xp = Math.max(0, Number(xp) || 0);
    var level = 1;
    for (var i = 2; i <= CONFIG.maxLevel; i++) {
      if (xp >= thresholdForLevel(i)) level = i;
      else break;
    }
    return level;
  }

  function rankForLevel(level){
    level = Math.max(1, Math.min(CONFIG.maxLevel, Number(level) || 1));
    for (var i = 0; i < RANKS.length; i++) {
      if (level >= RANKS[i].min && level <= RANKS[i].max) return RANKS[i];
    }
    return RANKS[RANKS.length - 1];
  }

  function progressForXp(xp){
    var level = levelForXp(xp);
    var current = thresholdForLevel(level);
    var next = level >= CONFIG.maxLevel ? CONFIG.maxXp : thresholdForLevel(level + 1);
    var segment = Math.max(1, next - current);
    var progress = level >= CONFIG.maxLevel ? 1 : Math.max(0, Math.min(1, ((xp - current) / segment)));
    return {
      level: level,
      currentXp: current,
      nextXp: next,
      currentInLevel: Math.max(0, xp - current),
      neededInLevel: segment,
      progress: progress,
      pct: Math.round(progress * 100),
      rank: rankForLevel(level)
    };
  }

  function describeGain(reason, amount, label){
    if (!amount) return '';
    if (label) return '+' + amount + ' XP · ' + label;
    if (reason === 'hint') return '+5 XP за верный ответ с подсказкой';
    if (reason === 'streak5') return '+20 XP за серию из 5';
    if (reason === 'diagnostic') return '+' + amount + ' XP за диагностику';
    if (reason === 'mission') return '+' + amount + ' XP за миссию';
    return '+' + amount + ' XP за верный ответ';
  }

  function trimHistory(rows){
    rows = Array.isArray(rows) ? rows : [];
    return rows.slice(-30);
  }

  function loadState(){
    var state = readScopedJSON(CONFIG.key, defaultState());
    state.history = trimHistory(state.history);
    return state;
  }

  function saveState(state){
    state = Object.assign(defaultState(), state || {});
    state.history = trimHistory(state.history);
    writeScopedJSON(CONFIG.key, state);
    return state;
  }

  function summarize(state){
    state = state || loadState();
    var progress = progressForXp(state.xp || 0);
    return {
      xp: Number(state.xp || 0),
      level: progress.level,
      rank: progress.rank,
      progress: progress,
      correct: Number(state.correct || 0),
      hintCorrect: Number(state.hintCorrect || 0),
      streakBonuses: Number(state.streakBonuses || 0),
      bonusXp: Number(state.bonusXp || 0),
      totalAwards: Number(state.totalAwards || 0),
      levelUps: Number(state.levelUps || 0),
      lastGain: Number(state.lastGain || 0),
      lastReason: state.lastReason || '',
      lastLabel: state.lastLabel || '',
      updatedAt: state.updatedAt || '',
      history: trimHistory(state.history || [])
    };
  }

  function applyAward(state, type, meta){
    state = Object.assign(defaultState(), state || {});
    meta = meta || {};
    var before = summarize(state);
    var delta = 0;
    if (type === 'correct') {
      delta = meta.withHint ? CONFIG.xpHint : CONFIG.xpCorrect;
      if (meta.withHint) state.hintCorrect = Number(state.hintCorrect || 0) + 1;
      else state.correct = Number(state.correct || 0) + 1;
    } else if (type === 'streak5') {
      delta = CONFIG.xpStreak5;
      state.streakBonuses = Number(state.streakBonuses || 0) + 1;
    } else if (type === 'bonus') {
      delta = Math.max(0, Math.round(Number(meta.amount || 0)));
      state.bonusXp = Number(state.bonusXp || 0) + delta;
    }
    state.xp = Math.min(CONFIG.maxXp, Math.max(0, Number(state.xp || 0) + delta));
    state.totalAwards = Number(state.totalAwards || 0) + (delta > 0 ? 1 : 0);
    state.lastGain = delta;
    state.lastReason = meta.reason || type;
    state.lastLabel = meta.label || '';
    state.updatedAt = new Date().toISOString();
    state.history = trimHistory((state.history || []).concat([{
      ts: state.updatedAt,
      type: type,
      reason: meta.reason || type,
      label: meta.label || '',
      gain: delta,
      withHint: !!meta.withHint,
      tag: meta.tag || '',
      source: meta.source || ''
    }]));
    var after = summarize(state);
    if (after.level > before.level) state.levelUps = Number(state.levelUps || 0) + (after.level - before.level);
    return { state: state, delta: delta, before: before, after: after, leveledUp: after.level > before.level };
  }

  function dispatchUpdate(detail){
    if (!root.document || typeof root.CustomEvent !== 'function') return;
    try { root.dispatchEvent(new CustomEvent('wave66-xp-updated', { detail: detail })); } catch (_) {}
  }

  function award(type, meta){
    var result = applyAward(loadState(), type, meta);
    saveState(result.state);
    dispatchUpdate(result);
    if (!isNode && result.delta > 0) maybeShowToast(result);
    if (!isNode && result.leveledUp) showLevelUp(result.after);
    return result;
  }

  function levelCardHtml(summary, compact){
    compact = !!compact;
    var label = compact ? ('Ур. ' + summary.level) : ('Уровень ' + summary.level + ' · ' + summary.rank.icon + ' ' + summary.rank.label);
    var xpText = compact ? (summary.xp.toLocaleString('ru-RU') + ' XP') : (summary.xp.toLocaleString('ru-RU') + ' XP из ' + summary.progress.nextXp.toLocaleString('ru-RU'));
    return '<div class="wave66-xp-card' + (compact ? ' compact' : '') + '">' +
      '<div class="wave66-xp-top">' +
        '<div class="wave66-xp-title">' + esc(label) + '</div>' +
        '<div class="wave66-xp-meta">' + esc(xpText) + '</div>' +
      '</div>' +
      '<div class="wave66-xp-bar"><div class="wave66-xp-fill" style="width:' + summary.progress.pct + '%"></div></div>' +
      '<div class="wave66-xp-sub">До следующего уровня: <b>' + Math.max(0, summary.progress.nextXp - summary.xp).toLocaleString('ru-RU') + ' XP</b></div>' +
    '</div>';
  }

  function ensureStyle(){
    if (!root.document || root.document.getElementById('wave66-xp-style')) return;
    var style = root.document.createElement('style');
    style.id = 'wave66-xp-style';
    style.textContent = [
      '.wave66-xp-card{margin-top:10px;padding:12px 14px;border:1px solid var(--border,#e5e7eb);border-radius:14px;background:var(--card,#fff);color:var(--text,#111827);box-shadow:0 10px 24px rgba(15,23,42,.06)}',
      '.wave66-xp-card.compact{padding:10px 12px}',
      '.wave66-xp-top{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:8px}',
      '.wave66-xp-title{font-family:Unbounded,system-ui,sans-serif;font-size:13px;font-weight:900;line-height:1.25}',
      '.wave66-xp-meta{font-size:11px;color:var(--muted,#6b7280);white-space:nowrap}',
      '.wave66-xp-bar{height:10px;border-radius:999px;background:rgba(37,99,235,.12);overflow:hidden}',
      '.wave66-xp-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#2563eb,#7c3aed)}',
      '.wave66-xp-sub{margin-top:6px;font-size:11px;color:var(--muted,#6b7280)}',
      '.wave66-main-strip{margin-top:8px}',
      '.wave66-index-wrap{margin:16px 0 0}',
      '.wave66-dashboard-wrap{margin:10px 0 18px}',
      '.wave66-toast{position:fixed;left:50%;bottom:calc(76px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(16px);z-index:10001;background:rgba(17,24,39,.96);color:#fff;border-radius:999px;padding:10px 14px;font-size:12px;font-weight:700;box-shadow:0 14px 30px rgba(0,0,0,.25);opacity:0;pointer-events:none;transition:opacity .22s ease, transform .22s ease;max-width:min(92vw,420px);text-align:center}',
      '.wave66-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}',
      '.wave66-levelup-overlay{position:fixed;inset:0;background:rgba(15,23,42,.58);display:flex;align-items:center;justify-content:center;padding:20px;z-index:10002}',
      '.wave66-levelup-card{width:min(92vw,360px);border-radius:22px;padding:24px 22px;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#fff;text-align:center;box-shadow:0 30px 60px rgba(15,23,42,.35);animation:wave66-pop .35s ease both}',
      '.wave66-levelup-card .big{font-family:Unbounded,system-ui,sans-serif;font-size:32px;font-weight:900;margin:8px 0 6px}',
      '.wave66-levelup-card .ttl{font-family:Unbounded,system-ui,sans-serif;font-size:14px;font-weight:900;letter-spacing:.3px}',
      '.wave66-levelup-card .sub{font-size:12px;opacity:.9;line-height:1.45;margin-top:8px}',
      '@keyframes wave66-pop{from{opacity:0;transform:scale(.9) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}'
    ].join('');
    root.document.head.appendChild(style);
  }

  function renderGradePanel(){
    if (!root.document) return;
    var badge = root.document.getElementById('player-badge');
    if (!badge || !root.document.getElementById('s-main')) return;
    var holder = root.document.getElementById('wave66-main-strip');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave66-main-strip';
      holder.className = 'wave66-main-strip';
      badge.insertAdjacentElement('afterend', holder);
    }
    holder.innerHTML = levelCardHtml(summarize(), false);
  }

  function renderIndexCard(){
    if (!root.document || root.document.getElementById('s-main')) return;
    var stats = root.document.querySelector('.header .stats');
    if (!stats) return;
    var holder = root.document.getElementById('wave66-index-wrap');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave66-index-wrap';
      holder.className = 'wave66-index-wrap';
      stats.insertAdjacentElement('afterend', holder);
    }
    var summary = summarize();
    holder.innerHTML = levelCardHtml(summary, false);
  }

  function renderDashboardCard(){
    if (!root.document || !root.document.querySelector('.hero')) return;
    var hero = root.document.querySelector('.hero');
    var holder = root.document.getElementById('wave66-dashboard-wrap');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave66-dashboard-wrap';
      holder.className = 'wave66-dashboard-wrap';
      hero.insertAdjacentElement('afterend', holder);
    }
    var summary = summarize();
    holder.innerHTML = levelCardHtml(summary, false);
    var rank = root.document.getElementById('rank');
    if (rank) {
      rank.textContent = summary.rank.icon + ' ' + summary.rank.label + ' · уровень ' + summary.level + ' · ' + summary.xp.toLocaleString('ru-RU') + ' XP';
    }
  }

  function decorateHallOfFame(){
    if (!root.document) return;
    var overlays = Array.prototype.slice.call(root.document.querySelectorAll('body > div[style*="position:fixed"]'));
    if (!overlays.length) return;
    var overlay = overlays[overlays.length - 1];
    var card = overlay && overlay.firstElementChild;
    if (!card || card.querySelector('.wave66-profile-xp')) return;
    var summary = summarize();
    var section = root.document.createElement('div');
    section.className = 'wave66-profile-xp';
    section.style.margin = '0 0 14px';
    section.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px">' +
      '<div style="font-family:Unbounded,system-ui,sans-serif;font-size:13px;font-weight:900;color:#fff">' + esc(summary.rank.icon + ' ' + summary.rank.label + ' · уровень ' + summary.level) + '</div>' +
      '<div style="font-size:11px;color:#c7d2fe">' + summary.xp.toLocaleString('ru-RU') + ' XP</div>' +
      '</div>' +
      '<div style="height:10px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden"><div style="height:100%;width:' + summary.progress.pct + '%;border-radius:999px;background:linear-gradient(90deg,#fbbf24,#f472b6)"></div></div>' +
      '<div style="margin-top:6px;font-size:11px;color:#c7d2fe">До следующего уровня: ' + Math.max(0, summary.progress.nextXp - summary.xp).toLocaleString('ru-RU') + ' XP</div>';
    var statsGrid = card.children[1] || null;
    if (statsGrid && statsGrid.insertAdjacentElement) statsGrid.insertAdjacentElement('afterend', section);
    else card.appendChild(section);
  }

  function maybeShowToast(result){
    if (!root.document || !result || !result.delta) return;
    var toast = root.document.getElementById('wave66-xp-toast');
    if (!toast) {
      toast = root.document.createElement('div');
      toast.id = 'wave66-xp-toast';
      toast.className = 'wave66-toast';
      root.document.body.appendChild(toast);
    }
    toast.textContent = describeGain(result.state.lastReason, result.delta, result.state.lastLabel);
    toast.classList.add('on');
    clearTimeout(toast._tid);
    toast._tid = setTimeout(function(){ toast.classList.remove('on'); }, 1600);
  }

  function showLevelUp(summary){
    if (!root.document || root.document.getElementById('wave66-levelup')) return;
    var overlay = root.document.createElement('div');
    overlay.id = 'wave66-levelup';
    overlay.className = 'wave66-levelup-overlay';
    overlay.innerHTML = '<div class="wave66-levelup-card">' +
      '<div class="ttl">Новый уровень</div>' +
      '<div class="big">' + summary.level + '</div>' +
      '<div style="font-size:18px;font-weight:800">' + esc(summary.rank.icon + ' ' + summary.rank.label) + '</div>' +
      '<div class="sub">Продолжай серию: верные ответы, тренировки без подсказок и ровные стрики дают больше XP.</div>' +
      '</div>';
    overlay.addEventListener('click', function(){ overlay.remove(); });
    root.document.body.appendChild(overlay);
    if (typeof root.confetti === 'function') {
      try { root.confetti(60); } catch (_) {}
    }
    setTimeout(function(){ if (overlay && overlay.parentNode) overlay.remove(); }, 2400);
  }

  function patchAns(){
    if (!root.ans || root.__wave66AnsPatched) return;
    var original = root.ans;
    root.ans = function(index){
      var alreadySelected = false;
      try { alreadySelected = typeof sel !== 'undefined' && sel !== null; } catch (_) { alreadySelected = false; }
      if (alreadySelected) return original.apply(this, arguments);
      var beforeStreak = 0;
      try { beforeStreak = st && Number(st.streak || 0); } catch (_) { beforeStreak = 0; }
      var selected = null;
      var isCorrect = false;
      var withHint = false;
      var tag = '';
      try {
        selected = prob && prob.options ? prob.options[index] : null;
        isCorrect = !!(prob && selected === prob.answer);
        withHint = !!usedHelp;
        tag = prob && prob.tag ? prob.tag : '';
      } catch (_) {}
      var out = original.apply(this, arguments);
      if (isCorrect) {
        award('correct', { withHint: withHint, tag: tag, source: 'grade' });
        var afterStreak = 0;
        try { afterStreak = st && Number(st.streak || 0); } catch (_) { afterStreak = 0; }
        if (!withHint && afterStreak >= 5 && afterStreak % 5 === 0 && afterStreak !== beforeStreak) {
          award('streak5', { tag: tag, source: 'grade' });
        }
      }
      return out;
    };
    root.__wave66AnsPatched = true;
  }

  function patchHallOfFame(){
    if (!root.showHallOfFame || root.__wave66HallPatched) return;
    var original = root.showHallOfFame;
    root.showHallOfFame = function(){
      var out = original.apply(this, arguments);
      setTimeout(decorateHallOfFame, 0);
      return out;
    };
    root.__wave66HallPatched = true;
  }

  function patchPlayerBadge(){
    if (!root.renderPlayerBadge || root.__wave66BadgePatched) return;
    var original = root.renderPlayerBadge;
    root.renderPlayerBadge = function(){
      var out = original.apply(this, arguments);
      renderGradePanel();
      return out;
    };
    root.__wave66BadgePatched = true;
  }

  function patchBackup(){
    if (root.getBackupSnapshot && !root.__wave66BackupGetPatched) {
      var originalGet = root.getBackupSnapshot;
      root.getBackupSnapshot = function(){
        var snap = originalGet.apply(this, arguments);
        try { snap.xpState = loadState(); } catch (_) {}
        return snap;
      };
      root.__wave66BackupGetPatched = true;
    }
    if (root.applyBackupSnapshot && !root.__wave66BackupApplyPatched) {
      var originalApply = root.applyBackupSnapshot;
      root.applyBackupSnapshot = function(payload){
        var out = originalApply.apply(this, arguments);
        try {
          if (payload && payload.xpState) saveState(Object.assign(defaultState(), payload.xpState));
        } catch (_) {}
        dispatchUpdate({ state: loadState(), after: summarize() });
        return out;
      };
      root.__wave66BackupApplyPatched = true;
    }
  }

  function patchDiagnostic(){
    if (!root.addEventListener || root.__wave66DiagPatched) return;
    root.addEventListener('wave25-diagnostic-saved', function(ev){
      var entry = ev && ev.detail ? ev.detail : null;
      if (!entry || !entry.subjectId) return;
      var totalOk = Math.max(0, Number(entry.totalOk || 0));
      if (!totalOk) return;
      var before = summarize(loadState());
      var state = loadState();
      for (var i = 0; i < totalOk; i++) state = applyAward(state, 'correct', { withHint: false, tag: entry.subjectId, source: 'diagnostic' }).state;
      saveState(state);
      var after = summarize(state);
      dispatchUpdate({ state: state, before: before, after: after, delta: totalOk * CONFIG.xpCorrect, leveledUp: after.level > before.level });
      if (!isNode) {
        maybeShowToast({ delta: totalOk * CONFIG.xpCorrect, state: { lastReason: 'diagnostic' } });
        if (after.level > before.level) showLevelUp(after);
      }
    });
    root.__wave66DiagPatched = true;
  }

  function refreshUi(){
    ensureStyle();
    renderGradePanel();
    renderIndexCard();
    renderDashboardCard();
    decorateHallOfFame();
  }

  function init(){
    if (isNode || !root.document) return;
    ensureStyle();
    patchAns();
    patchHallOfFame();
    patchPlayerBadge();
    patchBackup();
    patchDiagnostic();
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', refreshUi, { once: true });
    } else {
      refreshUi();
    }
    root.addEventListener('wave66-xp-updated', function(){ setTimeout(refreshUi, 0); });
    root.addEventListener('dashboard-state-ready', function(){ setTimeout(renderDashboardCard, 0); });
  }

  function grantBonus(amount, label, meta){
    meta = Object.assign({}, meta || {}, { amount: amount, label: label || '', reason: (meta && meta.reason) || 'bonus' });
    return award('bonus', meta);
  }

  var api = {
    config: CONFIG,
    ranks: RANKS,
    thresholdForLevel: thresholdForLevel,
    levelForXp: levelForXp,
    rankForLevel: rankForLevel,
    progressForXp: progressForXp,
    defaultState: defaultState,
    loadState: loadState,
    saveState: saveState,
    summarize: summarize,
    applyAward: applyAward,
    award: award,
    grantBonus: grantBonus,
    refreshUi: refreshUi,
    init: init
  };

  init();
  return api;
});

;/* ---- bundle_gamification_meta.js ---- */
(function(root, factory){
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(root || globalThis, true);
  } else {
    root.wave67Meta = factory(root || window, false);
  }
})(typeof window !== 'undefined' ? window : globalThis, function(root, isNode){
  'use strict';

  var CONFIG = {
    key: 'trainer_meta_state_v1',
    profileActiveKey: 'trainer35_active_profile_v1',
    profileScopePrefix: 'trainer35_scoped:',
    totalAchievements: 35,
    dailyMissionCount: 3,
    weeklyMissionCount: 2
  };

  var storage = {
    get: function(key){
      try { return Storage.prototype.getItem.call(root.localStorage, key); } catch (_) { return null; }
    },
    set: function(key, value){
      try { Storage.prototype.setItem.call(root.localStorage, key, String(value)); } catch (_) {}
    }
  };

  function esc(text){
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function nowDate(now){ return now instanceof Date ? now : new Date(now || Date.now()); }
  function pad2(v){ return String(v).padStart(2, '0'); }
  function activeProfileId(){ return storage.get(CONFIG.profileActiveKey) || 'p1'; }
  function scopedKey(baseKey){ return CONFIG.profileScopePrefix + activeProfileId() + ':' + baseKey; }
  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }

  function dayKey(now){
    var d = nowDate(now);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function isoWeekKey(now){
    var d = nowDate(now);
    var dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var dayNum = dt.getUTCDay() || 7;
    dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
    var week = Math.ceil((((dt - yearStart) / 86400000) + 1) / 7);
    return dt.getUTCFullYear() + '-W' + pad2(week);
  }

  var DAILY_DEFS = [
    { id: 'daily_answers_20', title: 'Ответь на 20 вопросов', target: 20, kind: 'answers' },
    { id: 'daily_topics_3', title: 'Пройди 3 темы', target: 3, kind: 'topics' },
    { id: 'daily_xp_100', title: 'Набери 100 XP', target: 100, kind: 'xp' }
  ];

  var WEEKLY_DEFS = [
    { id: 'weekly_topics_5', title: 'Пройди 5 новых тем', target: 5, kind: 'topics' },
    { id: 'weekly_combo_10', title: 'Серия из 10 правильных', target: 10, kind: 'combo' }
  ];

  function achievement(id, title, desc, cond, secret, icon){
    return { id: id, title: title, desc: desc, condition: cond, secret: !!secret, icon: icon || '🏆' };
  }

  var ACHIEVEMENTS = [
    achievement('first_answer', 'Первые шаги', 'Ответь на первый вопрос.', function(s){ return s.totalAnswers >= 1; }, false, '👣'),
    achievement('first_correct', 'Точно в цель', 'Дай первый правильный ответ.', function(s){ return s.correct >= 1; }, false, '🎯'),
    achievement('warmup_10', 'Разогрев', 'Ответь на 10 вопросов.', function(s){ return s.totalAnswers >= 10; }, false, '🔥'),
    achievement('answers_50', 'Темп взят', 'Ответь на 50 вопросов.', function(s){ return s.totalAnswers >= 50; }, false, '⚡'),
    achievement('answers_100', 'Сотня', 'Ответь на 100 вопросов.', function(s){ return s.totalAnswers >= 100; }, false, '💯'),
    achievement('answers_250', 'Марафонец', 'Ответь на 250 вопросов.', function(s){ return s.totalAnswers >= 250; }, false, '🏃'),
    achievement('answers_500', 'Машина решений', 'Ответь на 500 вопросов.', function(s){ return s.totalAnswers >= 500; }, false, '🤖'),
    achievement('answers_1000', 'Гигабайт знаний', 'Ответь на 1000 вопросов.', function(s){ return s.totalAnswers >= 1000; }, false, '📚'),
    achievement('nohint_25', 'Самостоятельно', '25 верных ответов без подсказки.', function(s){ return s.noHintCorrect >= 25; }, false, '🧩'),
    achievement('nohint_100', 'Уверенный ход', '100 верных ответов без подсказки.', function(s){ return s.noHintCorrect >= 100; }, false, '🛡️'),
    achievement('nohint_250', 'Без шпаргалки', '250 верных ответов без подсказки.', function(s){ return s.noHintCorrect >= 250; }, false, '🧠'),
    achievement('combo_3', 'Комбо x1.5', 'Собери серию из 3 правильных без подсказки.', function(s){ return s.bestCombo >= 3; }, false, '✨'),
    achievement('combo_5', 'Комбо x2', 'Собери серию из 5 правильных без подсказки.', function(s){ return s.bestCombo >= 5; }, false, '⚔️'),
    achievement('combo_10', 'Стоик', 'Собери серию из 10 правильных без подсказки.', function(s){ return s.bestCombo >= 10; }, false, '🏔️'),
    achievement('combo_20', 'Несокрушимый', 'Собери серию из 20 правильных без подсказки.', function(s){ return s.bestCombo >= 20; }, false, '🗿'),
    achievement('topics_5', 'Исследователь', 'Открой 5 разных тем.', function(s){ return uniqueCount(s.topicsSeen) >= 5; }, false, '🧭'),
    achievement('topics_15', 'Картограф', 'Открой 15 разных тем.', function(s){ return uniqueCount(s.topicsSeen) >= 15; }, false, '🗺️'),
    achievement('topics_30', 'Полигистор', 'Открой 30 разных тем.', function(s){ return uniqueCount(s.topicsSeen) >= 30; }, false, '🌐'),
    achievement('diagnostic_1', 'Диагност', 'Пройди первую диагностику.', function(s){ return s.diagnosticsTaken >= 1; }, false, '🩺'),
    achievement('diagnostic_5', 'Трекер прогресса', 'Пройди 5 диагностик.', function(s){ return s.diagnosticsTaken >= 5; }, false, '📈'),
    achievement('daily_1', 'План на день', 'Закрой все миссии дня один раз.', function(s){ return s.missionDays >= 1; }, false, '📅'),
    achievement('daily_7', 'Ритм недели', 'Закрой все миссии дня 7 раз.', function(s){ return s.missionDays >= 7; }, false, '🗓️'),
    achievement('weekly_1', 'Челлендж принят', 'Закрой все недельные челленджи.', function(s){ return s.weekWins >= 1; }, false, '🏁'),
    achievement('weekly_4', 'Стабильный прогресс', 'Закрой все недельные челленджи 4 раза.', function(s){ return s.weekWins >= 4; }, false, '🚀'),
    achievement('level_5', 'Пятый уровень', 'Достигни 5 уровня.', function(s, xp){ return xp.level >= 5; }, false, '🥉'),
    achievement('level_10', 'Десятый уровень', 'Достигни 10 уровня.', function(s, xp){ return xp.level >= 10; }, false, '🥈'),
    achievement('level_20', 'Двадцатый уровень', 'Достигни 20 уровня.', function(s, xp){ return xp.level >= 20; }, false, '🥇'),
    achievement('level_30', 'Тридцатый уровень', 'Достигни 30 уровня.', function(s, xp){ return xp.level >= 30; }, false, '🏆'),
    achievement('level_40', 'Сороковой уровень', 'Достигни 40 уровня.', function(s, xp){ return xp.level >= 40; }, false, '👑'),
    achievement('level_50', 'Легенда', 'Достигни 50 уровня.', function(s, xp){ return xp.level >= 50; }, false, '🌟'),

    achievement('secret_combo_13', 'Чёртова дюжина', 'Серия из 13 правильных без подсказки.', function(s){ return s.bestCombo >= 13; }, true, '🕵️'),
    achievement('secret_topics_day_10', 'Спринтер тем', 'Открой 10 тем за один день.', function(s){ return uniqueCount((s.day || {}).topics) >= 10; }, true, '🪄'),
    achievement('secret_topics_week_20', 'Архитектор недели', 'Открой 20 тем за неделю.', function(s){ return uniqueCount((s.week || {}).topics) >= 20; }, true, '🔐'),
    achievement('secret_full_board', 'Чистый лист', 'Закрой все миссии дня и недели в одной неделе.', function(s){ return !!(s.day && s.day.allCompleted && s.week && s.week.allCompleted); }, true, '🎁'),
    achievement('secret_xp_cap', 'Потолок XP', 'Набери максимум — 50 000 XP.', function(s, xp){ return xp.xp >= 50000; }, true, '🪙')
  ];

  function defaultState(){
    return {
      combo: 0,
      bestCombo: 0,
      totalAnswers: 0,
      correct: 0,
      wrong: 0,
      noHintCorrect: 0,
      hintCorrect: 0,
      diagnosticsTaken: 0,
      missionDays: 0,
      weekWins: 0,
      topicsSeen: {},
      subjectsSeen: {},
      unlocked: {},
      unlockOrder: [],
      day: { key: '', answers: 0, xp: 0, topics: {}, completed: {}, allCompleted: false },
      week: { key: '', topics: {}, bestCombo: 0, completed: {}, allCompleted: false }
    };
  }

  function uniqueCount(map){ return Object.keys(map || {}).length; }
  function loadState(){
    var raw = storage.get(scopedKey(CONFIG.key)) || storage.get(CONFIG.key);
    if (!raw) return ensurePeriods(defaultState());
    try { return ensurePeriods(Object.assign(defaultState(), JSON.parse(raw))); } catch (_) { return ensurePeriods(defaultState()); }
  }
  function saveState(state){
    state = ensurePeriods(Object.assign(defaultState(), state || {}));
    storage.set(scopedKey(CONFIG.key), JSON.stringify(state));
    return state;
  }

  function ensurePeriods(state, now){
    state = Object.assign(defaultState(), state || {});
    var dk = dayKey(now);
    var wk = isoWeekKey(now);
    if (!state.day || state.day.key !== dk) {
      state.day = { key: dk, answers: 0, xp: 0, topics: {}, completed: {}, allCompleted: false };
    }
    if (!state.week || state.week.key !== wk) {
      state.week = { key: wk, topics: {}, bestCombo: 0, completed: {}, allCompleted: false };
    }
    if (!state.topicsSeen) state.topicsSeen = {};
    if (!state.subjectsSeen) state.subjectsSeen = {};
    if (!state.unlocked) state.unlocked = {};
    if (!Array.isArray(state.unlockOrder)) state.unlockOrder = [];
    return state;
  }

  function comboMultiplierForStreak(streak){
    if (streak >= 10) return 3;
    if (streak >= 5) return 2;
    if (streak >= 3) return 1.5;
    return 1;
  }

  function comboBonusForStreak(streak){
    if (streak >= 10) return 20;
    if (streak >= 5) return 10;
    if (streak >= 3) return 5;
    return 0;
  }

  function currentXpSummary(){
    if (root.wave66Xp && typeof root.wave66Xp.summarize === 'function') return root.wave66Xp.summarize();
    return { xp: 0, level: 1, rank: { label: 'Новичок', icon: '🌱' } };
  }

  function recordAnswer(state, payload){
    payload = payload || {};
    state = ensurePeriods(state, payload.now);
    state.totalAnswers += 1;
    state.day.answers += 1;
    if (payload.correct) {
      state.correct += 1;
      if (payload.withHint) {
        state.hintCorrect += 1;
        state.combo = 0;
      } else {
        state.noHintCorrect += 1;
        state.combo += 1;
        if (state.combo > state.bestCombo) state.bestCombo = state.combo;
        if (state.combo > Number(state.week.bestCombo || 0)) state.week.bestCombo = state.combo;
      }
      if (payload.tag) {
        state.topicsSeen[payload.tag] = payload.tag;
        state.day.topics[payload.tag] = payload.tag;
        state.week.topics[payload.tag] = payload.tag;
      }
    } else {
      state.wrong += 1;
      state.combo = 0;
    }
    var multiplier = comboMultiplierForStreak(state.combo);
    var bonus = (!payload.withHint && payload.correct) ? comboBonusForStreak(state.combo) : 0;
    return { state: state, combo: { streak: state.combo, multiplier: multiplier, bonus: bonus } };
  }

  function recordXp(state, payload){
    payload = payload || {};
    state = ensurePeriods(state, payload.now);
    state.day.xp += Math.max(0, Number(payload.delta || 0));
    return { state: state };
  }

  function recordDiagnostic(state, payload){
    payload = payload || {};
    state = ensurePeriods(state, payload.now);
    state.diagnosticsTaken += 1;
    if (payload.subjectId) state.subjectsSeen[payload.subjectId] = payload.subjectId;
    var totalQ = Math.max(0, Number(payload.totalQ || 0));
    var totalOk = Math.max(0, Number(payload.totalOk || 0));
    if (totalQ) {
      state.totalAnswers += totalQ;
      state.day.answers += totalQ;
      state.correct += totalOk;
      state.noHintCorrect += totalOk;
      state.wrong += Math.max(0, totalQ - totalOk);
    }
    return { state: state };
  }

  function missionProgress(def, state){
    state = ensurePeriods(state);
    if (def.kind === 'answers') return Number(state.day.answers || 0);
    if (def.kind === 'xp') return Number(state.day.xp || 0);
    if (def.kind === 'topics' && def.id.indexOf('weekly') === 0) return uniqueCount(state.week.topics);
    if (def.kind === 'topics') return uniqueCount(state.day.topics);
    if (def.kind === 'combo') return Math.max(Number(state.bestCombo || 0), Number((state.week || {}).bestCombo || 0));
    return 0;
  }

  function evaluateMissions(state, now){
    state = ensurePeriods(state, now);
    var completed = [];
    DAILY_DEFS.forEach(function(def){
      var progress = missionProgress(def, state);
      if (progress >= def.target && !state.day.completed[def.id]) {
        state.day.completed[def.id] = new Date(now || Date.now()).toISOString();
        completed.push({ scope: 'day', def: def, progress: progress });
      }
    });
    WEEKLY_DEFS.forEach(function(def){
      var progress = missionProgress(def, state);
      if (progress >= def.target && !state.week.completed[def.id]) {
        state.week.completed[def.id] = new Date(now || Date.now()).toISOString();
        completed.push({ scope: 'week', def: def, progress: progress });
      }
    });
    var dailyDone = DAILY_DEFS.every(function(def){ return !!state.day.completed[def.id]; });
    if (dailyDone && !state.day.allCompleted) {
      state.day.allCompleted = true;
      state.missionDays += 1;
    }
    var weeklyDone = WEEKLY_DEFS.every(function(def){ return !!state.week.completed[def.id]; });
    if (weeklyDone && !state.week.allCompleted) {
      state.week.allCompleted = true;
      state.weekWins += 1;
    }
    return { state: state, completed: completed };
  }

  function evaluateAchievements(state, xpSummary, now){
    state = ensurePeriods(state, now);
    xpSummary = xpSummary || currentXpSummary();
    var unlocked = [];
    ACHIEVEMENTS.forEach(function(def){
      if (state.unlocked[def.id]) return;
      var ok = false;
      try { ok = !!def.condition(state, xpSummary || { xp: 0, level: 1 }); } catch (_) { ok = false; }
      if (ok) {
        var ts = new Date(now || Date.now()).toISOString();
        state.unlocked[def.id] = ts;
        state.unlockOrder.push({ id: def.id, ts: ts });
        unlocked.push(def);
      }
    });
    state.unlockOrder = state.unlockOrder.slice(-60);
    return { state: state, unlocked: unlocked };
  }

  function getMissionSnapshot(state, xpSummary){
    state = ensurePeriods(state);
    xpSummary = xpSummary || currentXpSummary();
    var daily = DAILY_DEFS.map(function(def){
      var progress = missionProgress(def, state);
      return { id: def.id, title: def.title, target: def.target, progress: Math.min(def.target, progress), done: !!state.day.completed[def.id], scope: 'day' };
    });
    var weekly = WEEKLY_DEFS.map(function(def){
      var progress = missionProgress(def, state);
      return { id: def.id, title: def.title, target: def.target, progress: Math.min(def.target, progress), done: !!state.week.completed[def.id], scope: 'week' };
    });
    var unlockedCount = Object.keys(state.unlocked || {}).length;
    var secretTotal = ACHIEVEMENTS.filter(function(def){ return def.secret; }).length;
    var secretUnlocked = ACHIEVEMENTS.filter(function(def){ return def.secret && state.unlocked[def.id]; }).length;
    return {
      state: state,
      xp: xpSummary,
      combo: { streak: Number(state.combo || 0), multiplier: comboMultiplierForStreak(Number(state.combo || 0)), bonus: comboBonusForStreak(Number(state.combo || 0)) },
      daily: daily,
      weekly: weekly,
      unlockedCount: unlockedCount,
      totalCount: ACHIEVEMENTS.length,
      secretUnlocked: secretUnlocked,
      secretTotal: secretTotal,
      visibleUnlocked: unlockedCount - secretUnlocked,
      recent: state.unlockOrder.slice(-6).reverse().map(function(row){ return findAchievement(row.id); })
    };
  }

  function findAchievement(id){
    for (var i = 0; i < ACHIEVEMENTS.length; i++) if (ACHIEVEMENTS[i].id === id) return ACHIEVEMENTS[i];
    return null;
  }

  function snapshot(state, xpSummary){
    state = ensurePeriods(state);
    var snap = getMissionSnapshot(state, xpSummary);
    snap.achievements = ACHIEVEMENTS.map(function(def){
      return { id: def.id, title: def.title, desc: def.desc, icon: def.icon, secret: def.secret, unlocked: !!state.unlocked[def.id] };
    });
    return snap;
  }

  function reduceAnswer(state, payload, xpSummary){
    var out = recordAnswer(state, payload);
    var state2 = out.state;
    var missionOut = evaluateMissions(state2, payload && payload.now);
    var achOut = evaluateAchievements(missionOut.state, xpSummary, payload && payload.now);
    return { state: achOut.state, combo: out.combo, completed: missionOut.completed, unlocked: achOut.unlocked };
  }

  function reduceXp(state, payload, xpSummary){
    var out = recordXp(state, payload);
    var missionOut = evaluateMissions(out.state, payload && payload.now);
    var achOut = evaluateAchievements(missionOut.state, xpSummary, payload && payload.now);
    return { state: achOut.state, completed: missionOut.completed, unlocked: achOut.unlocked };
  }

  function reduceDiagnostic(state, payload, xpSummary){
    var out = recordDiagnostic(state, payload);
    var missionOut = evaluateMissions(out.state, payload && payload.now);
    var achOut = evaluateAchievements(missionOut.state, xpSummary, payload && payload.now);
    return { state: achOut.state, completed: missionOut.completed, unlocked: achOut.unlocked };
  }

  function dispatchUpdate(detail){
    if (!root.document || typeof root.CustomEvent !== 'function') return;
    try { root.dispatchEvent(new CustomEvent('wave67-meta-updated', { detail: detail })); } catch (_) {}
  }

  function saveAndDispatch(result){
    saveState(result.state);
    dispatchUpdate({ state: result.state, snapshot: snapshot(result.state, currentXpSummary()), completed: result.completed || [], unlocked: result.unlocked || [] });
    return result;
  }

  function queueToast(message, kind){
    if (isNode || !root.document || !message) return;
    ensureStyle();
    var toast = root.document.getElementById('wave67-meta-toast');
    if (!toast) {
      toast = root.document.createElement('div');
      toast.id = 'wave67-meta-toast';
      toast.className = 'wave67-toast';
      root.document.body.appendChild(toast);
    }
    toast.className = 'wave67-toast on ' + (kind || 'info');
    toast.textContent = message;
    clearTimeout(toast._tid);
    toast._tid = setTimeout(function(){ toast.className = 'wave67-toast'; }, 1800);
  }

  function handleOutcome(result){
    result = result || {};
    if (result.unlocked && result.unlocked.length) {
      queueToast('Достижение: ' + result.unlocked[0].title, 'ach');
      if (result.completed && result.completed.length > 0) {
        setTimeout(function(){ queueToast('Миссия: ' + result.completed[0].def.title, 'mission'); }, 450);
      }
      return;
    }
    if (result.completed && result.completed.length) queueToast('Миссия: ' + result.completed[0].def.title, 'mission');
  }

  function ensureStyle(){
    if (!root.document || root.document.getElementById('wave67-meta-style')) return;
    var style = root.document.createElement('style');
    style.id = 'wave67-meta-style';
    style.textContent = [
      '.wave67-card{margin-top:10px;padding:12px 14px;border:1px solid var(--border,#e5e7eb);border-radius:14px;background:var(--card,#fff);box-shadow:0 10px 24px rgba(15,23,42,.06)}',
      '.wave67-title{font-family:Unbounded,system-ui,sans-serif;font-size:13px;font-weight:900;line-height:1.25;margin:0 0 8px}',
      '.wave67-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px}',
      '.wave67-meta{font-size:11px;color:var(--muted,#6b7280)}',
      '.wave67-stack{display:grid;gap:8px}',
      '.wave67-mission{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}',
      '.wave67-mission-title{font-size:12px;font-weight:700;line-height:1.35}',
      '.wave67-bar{height:8px;border-radius:999px;background:rgba(37,99,235,.12);overflow:hidden;margin-top:5px}',
      '.wave67-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#06b6d4,#2563eb)}',
      '.wave67-chip{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:800;background:rgba(37,99,235,.08);color:#1d4ed8}',
      '.wave67-ach-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}',
      '.wave67-ach{border:1px solid var(--border,#e5e7eb);border-radius:12px;padding:8px 10px;background:rgba(255,255,255,.75)}',
      '.wave67-ach.secret.locked{opacity:.65;filter:saturate(.6)}',
      '.wave67-ach .nm{font-size:12px;font-weight:800;line-height:1.3}',
      '.wave67-ach .ds{font-size:11px;color:var(--muted,#6b7280);margin-top:3px;line-height:1.35}',
      '.wave67-ach .ic{font-size:16px;margin-right:6px}',
      '.wave67-inline{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}',
      '.wave67-toast{position:fixed;left:50%;bottom:calc(118px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(10px);z-index:10003;background:rgba(15,23,42,.95);color:#fff;border-radius:999px;padding:10px 14px;font-size:12px;font-weight:800;opacity:0;pointer-events:none;transition:opacity .2s ease, transform .2s ease;max-width:min(92vw,420px);text-align:center;box-shadow:0 12px 30px rgba(0,0,0,.28)}',
      '.wave67-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}',
      '.wave67-toast.mission{background:rgba(37,99,235,.96)}',
      '.wave67-toast.ach{background:rgba(124,58,237,.96)}',
      '.wave67-grade-strip{margin-top:10px}',
      '.wave67-dashboard-wrap{margin:10px 0 18px}',
      '.wave67-index-wrap{margin:10px 0 0}',
      '@media (max-width:640px){.wave67-ach-grid{grid-template-columns:1fr}}'
    ].join('');
    root.document.head.appendChild(style);
  }

  function listHtml(items){
    return items.map(function(item){
      var pct = Math.max(0, Math.min(100, Math.round((item.progress / item.target) * 100)));
      return '<div class="wave67-mission">' +
        '<div><div class="wave67-mission-title">' + esc(item.title) + '</div><div class="wave67-bar"><div class="wave67-fill" style="width:' + pct + '%"></div></div></div>' +
        '<div class="wave67-meta">' + item.progress + '/' + item.target + (item.done ? ' ✓' : '') + '</div>' +
      '</div>';
    }).join('');
  }

  function recentAchievementsHtml(snap, limit, dark){
    var rows = snap.achievements.filter(function(item){ return item.unlocked; }).slice(-limit).reverse();
    if (!rows.length) rows = snap.achievements.filter(function(item){ return !item.secret; }).slice(0, limit);
    return rows.map(function(item){
      var title = item.secret && !item.unlocked ? 'Секретное достижение' : item.title;
      var desc = item.secret && !item.unlocked ? 'Откроется после особого действия.' : item.desc;
      return '<div class="wave67-ach' + (item.secret ? ' secret' : '') + (item.secret && !item.unlocked ? ' locked' : '') + '"' + (dark ? ' style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);color:#fff"' : '') + '>' +
        '<div class="nm"><span class="ic">' + esc(item.icon) + '</span>' + esc(title) + '</div>' +
        '<div class="ds"' + (dark ? ' style="color:#c7d2fe"' : '') + '>' + esc(desc) + '</div>' +
      '</div>';
    }).join('');
  }

  function renderGradeStrip(){
    if (!root.document || !root.document.getElementById('s-main')) return;
    var anchor = root.document.getElementById('wave66-main-strip');
    if (!anchor) return;
    var holder = root.document.getElementById('wave67-grade-strip');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave67-grade-strip';
      holder.className = 'wave67-grade-strip';
      anchor.insertAdjacentElement('afterend', holder);
    }
    var snap = snapshot(loadState(), currentXpSummary());
    holder.innerHTML = '<div class="wave67-card">' +
      '<div class="wave67-row"><div class="wave67-title">Комбо и миссии</div><div class="wave67-chip">x' + snap.combo.multiplier + ' · серия ' + snap.combo.streak + '</div></div>' +
      '<div class="wave67-inline"><span class="wave67-chip">Миссий дня: ' + snap.daily.filter(function(v){ return v.done; }).length + '/' + snap.daily.length + '</span><span class="wave67-chip">Достижений: ' + snap.unlockedCount + '/' + snap.totalCount + '</span></div>' +
      '</div>';
  }

  function renderIndexCard(){
    if (!root.document || root.document.getElementById('s-main')) return;
    var anchor = root.document.getElementById('wave66-index-wrap');
    if (!anchor) return;
    var holder = root.document.getElementById('wave67-index-wrap');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave67-index-wrap';
      holder.className = 'wave67-index-wrap';
      anchor.insertAdjacentElement('afterend', holder);
    }
    var snap = snapshot(loadState(), currentXpSummary());
    holder.innerHTML = '<div class="wave67-card">' +
      '<div class="wave67-row"><div class="wave67-title">Сегодняшний прогресс</div><div class="wave67-chip">' + snap.daily.filter(function(v){ return v.done; }).length + '/' + snap.daily.length + ' миссии</div></div>' +
      listHtml(snap.daily) +
      '<div class="wave67-inline"><span class="wave67-chip">Комбо: x' + snap.combo.multiplier + '</span><span class="wave67-chip">Ачивки: ' + snap.unlockedCount + '/' + snap.totalCount + '</span></div>' +
      '</div>';
  }

  function renderDashboardCard(){
    if (!root.document || !root.document.querySelector('.hero')) return;
    var anchor = root.document.getElementById('wave66-dashboard-wrap') || root.document.querySelector('.hero');
    var holder = root.document.getElementById('wave67-dashboard-wrap');
    if (!holder) {
      holder = root.document.createElement('div');
      holder.id = 'wave67-dashboard-wrap';
      holder.className = 'wave67-dashboard-wrap';
      anchor.insertAdjacentElement('afterend', holder);
    }
    var snap = snapshot(loadState(), currentXpSummary());
    holder.innerHTML = '<div class="wave67-card">' +
      '<div class="wave67-row"><div class="wave67-title">Миссии и достижения</div><div class="wave67-chip">' + snap.secretUnlocked + '/' + snap.secretTotal + ' секретных</div></div>' +
      '<div class="wave67-stack">' + listHtml(snap.daily) + '</div>' +
      '<div class="wave67-title" style="margin-top:12px">Недельные челленджи</div>' + listHtml(snap.weekly) +
      '<div class="wave67-inline"><span class="wave67-chip">Лучшее комбо: ' + (loadState().bestCombo || 0) + '</span><span class="wave67-chip">Достижений: ' + snap.unlockedCount + '/' + snap.totalCount + '</span></div>' +
      '</div>';
  }

  function decorateHallOfFame(){
    if (!root.document) return;
    var overlays = Array.prototype.slice.call(root.document.querySelectorAll('body > div[style*="position:fixed"]'));
    if (!overlays.length) return;
    var overlay = overlays[overlays.length - 1];
    var card = overlay && overlay.firstElementChild;
    if (!card || card.querySelector('.wave67-profile-meta')) return;
    var snap = snapshot(loadState(), currentXpSummary());
    var section = root.document.createElement('div');
    section.className = 'wave67-profile-meta';
    section.style.margin = '0 0 14px';
    section.innerHTML = '<div class="wave67-title" style="color:#fff">Миссии и достижения</div>' +
      '<div class="wave67-card" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.12);color:#fff;box-shadow:none">' +
      '<div class="wave67-row"><div class="wave67-meta" style="color:#c7d2fe">Миссий дня: ' + snap.daily.filter(function(v){ return v.done; }).length + '/' + snap.daily.length + ' · недели: ' + snap.weekly.filter(function(v){ return v.done; }).length + '/' + snap.weekly.length + '</div><div class="wave67-chip" style="background:rgba(255,255,255,.12);color:#fff">' + snap.unlockedCount + '/' + snap.totalCount + '</div></div>' +
      listHtml(snap.daily) +
      '<div class="wave67-title" style="margin-top:12px;color:#fff">Недавние достижения</div>' +
      '<div class="wave67-ach-grid">' + recentAchievementsHtml(snap, 4, true) + '</div>' +
      '</div>';
    var xpSection = card.querySelector('.wave66-profile-xp');
    if (xpSection && xpSection.insertAdjacentElement) xpSection.insertAdjacentElement('afterend', section);
    else card.appendChild(section);
  }

  function refreshUi(){
    ensureStyle();
    renderGradeStrip();
    renderIndexCard();
    renderDashboardCard();
    decorateHallOfFame();
  }

  function processAnswerEvent(payload){
    var state = loadState();
    var result = reduceAnswer(state, payload, currentXpSummary());
    saveAndDispatch(result);
    if (!isNode && result.combo.bonus > 0 && payload.correct && !payload.withHint && root.wave66Xp && typeof root.wave66Xp.grantBonus === 'function') {
      var label = 'Комбо x' + result.combo.multiplier;
      root.wave66Xp.grantBonus(result.combo.bonus, label, { reason: 'combo', tag: payload.tag || '', source: 'grade', combo: result.combo.streak, multiplier: result.combo.multiplier });
    }
    handleOutcome(result);
    if (!isNode) setTimeout(refreshUi, 0);
    return result;
  }

  function processXpDelta(delta){
    var state = loadState();
    var result = reduceXp(state, { delta: delta }, currentXpSummary());
    saveAndDispatch(result);
    handleOutcome(result);
    if (!isNode) setTimeout(refreshUi, 0);
    return result;
  }

  function processDiagnostic(payload){
    var state = loadState();
    var result = reduceDiagnostic(state, payload || {}, currentXpSummary());
    saveAndDispatch(result);
    handleOutcome(result);
    if (!isNode) setTimeout(refreshUi, 0);
    return result;
  }

  function patchAns(){
    if (!root.ans || root.__wave67MetaAnsPatched) return;
    var original = root.ans;
    root.ans = function(index){
      var alreadySelected = false;
      try { alreadySelected = typeof sel !== 'undefined' && sel !== null; } catch (_) { alreadySelected = false; }
      if (alreadySelected) return original.apply(this, arguments);
      var selected = null;
      var isCorrect = false;
      var withHint = false;
      var tag = '';
      try {
        selected = prob && prob.options ? prob.options[index] : null;
        isCorrect = !!(prob && selected === prob.answer);
        withHint = !!usedHelp;
        tag = prob && prob.tag ? prob.tag : '';
      } catch (_) {}
      var out = original.apply(this, arguments);
      processAnswerEvent({ correct: isCorrect, withHint: withHint, tag: tag, now: Date.now() });
      return out;
    };
    root.__wave67MetaAnsPatched = true;
  }

  function patchHallOfFame(){
    if (!root.showHallOfFame || root.__wave67MetaHofPatched) return;
    var original = root.showHallOfFame;
    root.showHallOfFame = function(){
      var out = original.apply(this, arguments);
      setTimeout(decorateHallOfFame, 0);
      return out;
    };
    root.__wave67MetaHofPatched = true;
  }

  function patchPlayerBadge(){
    if (!root.renderPlayerBadge || root.__wave67MetaBadgePatched) return;
    var original = root.renderPlayerBadge;
    root.renderPlayerBadge = function(){
      var out = original.apply(this, arguments);
      setTimeout(renderGradeStrip, 0);
      return out;
    };
    root.__wave67MetaBadgePatched = true;
  }

  function patchBackup(){
    if (root.getBackupSnapshot && !root.__wave67MetaBackupGetPatched) {
      var originalGet = root.getBackupSnapshot;
      root.getBackupSnapshot = function(){
        var snap = originalGet.apply(this, arguments);
        try { snap.metaState = loadState(); } catch (_) {}
        return snap;
      };
      root.__wave67MetaBackupGetPatched = true;
    }
    if (root.applyBackupSnapshot && !root.__wave67MetaBackupApplyPatched) {
      var originalApply = root.applyBackupSnapshot;
      root.applyBackupSnapshot = function(payload){
        var out = originalApply.apply(this, arguments);
        try { if (payload && payload.metaState) saveState(Object.assign(defaultState(), payload.metaState)); } catch (_) {}
        dispatchUpdate({ state: loadState(), snapshot: snapshot(loadState(), currentXpSummary()) });
        setTimeout(refreshUi, 0);
        return out;
      };
      root.__wave67MetaBackupApplyPatched = true;
    }
  }

  function init(){
    if (isNode || !root.document) return;
    ensureStyle();
    patchAns();
    patchHallOfFame();
    patchPlayerBadge();
    patchBackup();
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', refreshUi, { once: true });
    else refreshUi();
    root.addEventListener('wave66-xp-updated', function(ev){
      var delta = ev && ev.detail ? Number(ev.detail.delta || 0) : 0;
      if (delta > 0) processXpDelta(delta);
      else setTimeout(refreshUi, 0);
    });
    root.addEventListener('wave25-diagnostic-saved', function(ev){
      var detail = ev && ev.detail ? ev.detail : null;
      if (!detail) return;
      processDiagnostic({ subjectId: detail.subjectId, totalQ: detail.totalQ, totalOk: detail.totalOk, now: Date.now() });
    });
    root.addEventListener('wave67-meta-updated', function(){ setTimeout(refreshUi, 0); });
    root.addEventListener('dashboard-state-ready', function(){ setTimeout(renderDashboardCard, 0); });
  }

  var api = {
    config: CONFIG,
    dailyDefs: DAILY_DEFS,
    weeklyDefs: WEEKLY_DEFS,
    achievementDefs: ACHIEVEMENTS,
    defaultState: defaultState,
    ensurePeriods: ensurePeriods,
    loadState: loadState,
    saveState: saveState,
    dayKey: dayKey,
    isoWeekKey: isoWeekKey,
    comboMultiplierForStreak: comboMultiplierForStreak,
    comboBonusForStreak: comboBonusForStreak,
    recordAnswer: recordAnswer,
    recordXp: recordXp,
    recordDiagnostic: recordDiagnostic,
    evaluateMissions: evaluateMissions,
    evaluateAchievements: evaluateAchievements,
    reduceAnswer: reduceAnswer,
    reduceXp: reduceXp,
    reduceDiagnostic: reduceDiagnostic,
    snapshot: snapshot,
    processAnswerEvent: processAnswerEvent,
    processXpDelta: processXpDelta,
    processDiagnostic: processDiagnostic,
    refreshUi: refreshUi,
    init: init,
    findAchievement: findAchievement
  };

  init();
  return api;
});

;window.__wave87nGradeRuntimeFeaturesBundle = Object.freeze({wave:'wave87n', role:'features', bundled:["chunk_roadmap_wave86r_theory_achievements.js","chunk_roadmap_wave86p_exam_challenge.js","chunk_roadmap_wave86v_pvp_link_battle.js","bundle_gamification_xp.js","bundle_gamification_meta.js"], generatedAt:'2026-04-23T00:00:00Z'});
